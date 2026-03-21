"""
API views for PreciseOptics Eye Hospital Management System - Patients
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from precise_optics.permissions import ReadOnlyOrAuthenticatedPermission
from django.utils import timezone
from django.db import models
from .models import Patient, PatientVisit, AppointmentAlert, AlertConfiguration
from .serializers import (
    PatientSerializer, PatientVisitSerializer, PatientCreateSerializer,
    AppointmentAlertSerializer, AppointmentAlertListSerializer,
    AppointmentAlertCreateSerializer, AlertConfigurationSerializer
)
from .alert_service import AlertService


class PatientViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing patients
    """
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [ReadOnlyOrAuthenticatedPermission]
    
    def get_serializer_class(self):
        """Return different serializer for creation"""
        if self.action == 'create':
            return PatientCreateSerializer
        return PatientSerializer
    

    
    def get_queryset(self):
        """Filter patients based on user permissions"""
        queryset = Patient.objects.all()
        
        # Add filters for search
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                models.Q(first_name__icontains=search) |
                models.Q(last_name__icontains=search) |
                models.Q(patient_id__icontains=search) |
                models.Q(phone_number__icontains=search)
            )
        
        return queryset.order_by('-created_at')
    
    @action(detail=True, methods=['get'])
    def medical_history(self, request, pk=None):
        """Get patient's medical history"""
        patient = self.get_object()
        return Response({
            'patient_id': patient.patient_id,
            'full_name': patient.get_full_name(),
            'consultations': patient.consultations.count() if hasattr(patient, 'consultations') else 0,
            'visits': patient.visits.count(),
            'age': patient.get_age(),
        })
    
    @action(detail=True, methods=['get'])
    def upcoming_appointments(self, request, pk=None):
        """Get patient's upcoming appointments"""
        patient = self.get_object()
        upcoming_visits = patient.visits.filter(
            scheduled_date__gt=timezone.now(),
            status__in=['scheduled', 'checked_in']
        ).order_by('scheduled_date')[:5]
        
        return Response([{
            'id': str(visit.id),
            'scheduled_date': visit.scheduled_date,
            'visit_type': visit.get_visit_type_display(),
            'status': visit.get_status_display(),
            'doctor': visit.primary_doctor.get_full_name() if visit.primary_doctor else None
        } for visit in upcoming_visits])


class PatientVisitViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing patient visits
    """
    queryset = PatientVisit.objects.all()
    serializer_class = PatientVisitSerializer
    permission_classes = [ReadOnlyOrAuthenticatedPermission]
    
    def get_queryset(self):
        """Filter visits based on parameters"""
        queryset = PatientVisit.objects.select_related('patient', 'primary_doctor')
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        
        if date_from:
            queryset = queryset.filter(scheduled_date__date__gte=date_from)
        if date_to:
            queryset = queryset.filter(scheduled_date__date__lte=date_to)
        
        # Filter by doctor
        doctor_id = self.request.query_params.get('doctor', None)
        if doctor_id:
            queryset = queryset.filter(primary_doctor_id=doctor_id)
        
        return queryset.order_by('-scheduled_date')
    
    @action(detail=True, methods=['post'])
    def check_in(self, request, pk=None):
        """Check in a patient for their visit"""
        visit = self.get_object()
        
        if visit.status != 'scheduled':
            return Response(
                {'error': 'Visit must be in scheduled status to check in'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        visit.status = 'checked_in'
        visit.check_in_time = timezone.now()
        visit.save()

        # Resolve any active late/missed alerts for this visit
        AlertService.auto_resolve_visit_alerts(visit)
        
        return Response({
            'message': f'Patient {visit.patient.get_full_name()} checked in successfully',
            'status': visit.status,
            'check_in_time': visit.check_in_time
        })
    
    @action(detail=False, methods=['get'])
    def today_schedule(self, request):
        """Get today's appointment schedule"""
        today = timezone.now().date()
        
        visits = PatientVisit.objects.filter(
            scheduled_date__date=today
        ).select_related('patient', 'primary_doctor').order_by('scheduled_date')
        
        return Response([{
            'id': str(visit.id),
            'patient_name': visit.patient.get_full_name(),
            'patient_id': visit.patient.patient_id,
            'scheduled_time': visit.scheduled_date.strftime('%H:%M'),
            'visit_type': visit.get_visit_type_display(),
            'status': visit.get_status_display(),
            'doctor': visit.primary_doctor.get_full_name() if visit.primary_doctor else 'Not assigned'
        } for visit in visits])


class AppointmentAlertViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing appointment alerts
    """
    queryset = AppointmentAlert.objects.all()
    serializer_class = AppointmentAlertSerializer
    permission_classes = [ReadOnlyOrAuthenticatedPermission]
    
    def get_serializer_class(self):
        """Return different serializers based on action"""
        if self.action == 'list':
            return AppointmentAlertListSerializer
        elif self.action == 'create':
            return AppointmentAlertCreateSerializer
        return AppointmentAlertSerializer
    
    def get_queryset(self):
        """Filter alerts based on query parameters"""
        queryset = AppointmentAlert.objects.select_related(
            'patient', 'visit', 'acknowledged_by', 'resolved_by'
        )
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            if status_filter == 'unresolved':
                queryset = queryset.filter(status__in=['active', 'acknowledged'])
            else:
                queryset = queryset.filter(status=status_filter)
        
        # Filter by alert type        
        alert_type = self.request.query_params.get('alert_type', None)
        if alert_type:
            queryset = queryset.filter(alert_type=alert_type)
        
        # Filter by severity
        severity = self.request.query_params.get('severity', None)
        if severity:
            queryset = queryset.filter(severity=severity)
        
        # Filter by patient
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        if date_from:
            queryset = queryset.filter(trigger_time__gte=date_from)
        
        date_to = self.request.query_params.get('date_to', None)
        if date_to:
            queryset = queryset.filter(trigger_time__lte=date_to)
        
        return queryset.order_by('-trigger_time')
    
    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Acknowledge an alert"""
        alert = self.get_object()
        success, message = AlertService.acknowledge_alert(alert.id, request.user)
        
        if success:
            return Response({
                'message': message,
                'alert': AppointmentAlertSerializer(AppointmentAlert.objects.get(id=alert.id)).data
            })
        else:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Resolve an alert with action taken"""
        alert = self.get_object()
        action_taken = request.data.get('action_taken', '')
        notes = request.data.get('notes', '')
        
        success, message = AlertService.resolve_alert(alert.id, request.user, action_taken, notes)
        
        if success:
            return Response({
                'message': message,
                'alert': AppointmentAlertSerializer(AppointmentAlert.objects.get(id=alert.id)).data
            })
        else:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=True, methods=['post'])
    def dismiss(self, request, pk=None):
        """Dismiss an alert"""
        alert = self.get_object()
        reason = request.data.get('reason', '')
        
        success, message = AlertService.dismiss_alert(alert.id, request.user, reason)
        
        if success:
            return Response({
                'message': message,
                'alert': AppointmentAlertSerializer(AppointmentAlert.objects.get(id=alert.id)).data
            })
        else:
            return Response({'error': message}, status=status.HTTP_400_BAD_REQUEST)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get alert statistics"""
        stats = AlertService.get_alert_statistics()
        return Response(stats)
    
    @action(detail=False, methods=['post'])
    def scan_appointments(self, request):
        """Manually trigger full alert scan: appointments + clinical follow-ups"""
        stats = AlertService.scan_all_appointments()
        followup_alerts = AlertService.check_overdue_followups()
        stats['followups_created'] = len(followup_alerts)
        return Response({
            'message': 'Full scan completed',
            'stats': stats
        })
    
    @action(detail=False, methods=['post'])
    def generate_reminders(self, request):
        """Generate upcoming appointment reminders"""
        alerts = AlertService.generate_upcoming_reminders()
        return Response({
            'message': f'Generated {len(alerts)} reminders',
            'count': len(alerts),
            'alerts': AppointmentAlertListSerializer(alerts, many=True).data
        })
    
    @action(detail=False, methods=['post'])
    def check_followups(self, request):
        """Check for overdue follow-ups"""
        alerts = AlertService.check_overdue_followups()
        return Response({
            'message': f'Found {len(alerts)} overdue follow-ups',
            'count': len(alerts),
            'alerts': AppointmentAlertListSerializer(alerts, many=True).data
        })


class AlertConfigurationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing alert configuration
    """
    queryset = AlertConfiguration.objects.all()
    serializer_class = AlertConfigurationSerializer
    permission_classes = [ReadOnlyOrAuthenticatedPermission]
    
    def perform_create(self, serializer):
        """Set created_by on creation"""
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def active(self, request):
        """Get the active configuration"""
        config = AlertConfiguration.get_active_config()
        return Response(AlertConfigurationSerializer(config).data)
    
    @action(detail=True, methods=['post'])
    def activate(self, request, pk=None):
        """Activate this configuration"""
        config = self.get_object()
        
        # Deactivate all other configurations
        AlertConfiguration.objects.all().update(is_active=False)
        
        # Activate this one
        config.is_active = True
        config.save()
        
        return Response({
            'message': 'Configuration activated successfully',
            'config': AlertConfigurationSerializer(config).data
        })

