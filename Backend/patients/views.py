"""
API views for PreciseOptics Eye Hospital Management System - Patients
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action, api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.utils import timezone
from django.db import models
from .models import Patient, PatientVisit, AppointmentAlert, AlertConfiguration, ClinicSession
from .serializers import (
    PatientSerializer, PatientVisitSerializer, PatientCreateSerializer,
    AppointmentAlertSerializer, AppointmentAlertListSerializer,
    AppointmentAlertCreateSerializer, AlertConfigurationSerializer,
    ClinicSessionSerializer, ClinicSessionListSerializer, ClinicSessionCapacitySerializer,
)
from .alert_service import AlertService
from audit.utils import PatientAccessLoggingMixin


class PatientViewSet(PatientAccessLoggingMixin, viewsets.ModelViewSet):
    """
    ViewSet for managing patients
    """
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [IsAuthenticated]
    
    def get_serializer_class(self):
        """Return different serializer for creation"""
        if self.action == 'create':
            return PatientCreateSerializer
        return PatientSerializer
    

    
    def get_queryset(self):
        """Filter patients based on user permissions"""
        queryset = Patient.objects.select_related('registered_by').prefetch_related('visits')
        
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

    @action(detail=False, methods=['get'])
    def check_duplicate(self, request):
        """Check for potential duplicate patients by name + DOB similarity."""
        first_name = request.query_params.get('first_name', '').strip()
        last_name = request.query_params.get('last_name', '').strip()
        date_of_birth = request.query_params.get('date_of_birth', '').strip()

        if not first_name or not last_name or not date_of_birth:
            return Response(
                {'error': 'first_name, last_name, and date_of_birth are required.'},
                status=status.HTTP_400_BAD_REQUEST
            )

        # Find patients with matching DOB and similar names
        potential = Patient.objects.filter(
            is_active=True,
            date_of_birth=date_of_birth
        ).filter(
            models.Q(first_name__iexact=first_name) &
            models.Q(last_name__iexact=last_name)
        )

        results = [{
            'id': str(p.id),
            'first_name': p.first_name,
            'last_name': p.last_name,
            'date_of_birth': str(p.date_of_birth),
            'nhs_number': p.nhs_number or '',
            'patient_id': p.patient_id,
        } for p in potential]

        return Response({
            'potential_duplicates': results,
            'count': len(results),
        })


class PatientVisitViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing patient visits
    """
    queryset = PatientVisit.objects.all()
    serializer_class = PatientVisitSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter visits based on parameters"""
        queryset = PatientVisit.objects.select_related('patient', 'primary_doctor')

        # Filter by patient
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)

        # Filter by status
        status_param = self.request.query_params.get('status', None)
        if status_param:
            queryset = queryset.filter(status=status_param)

        # Filter by visit type
        visit_type = self.request.query_params.get('visit_type', None)
        if visit_type:
            queryset = queryset.filter(visit_type=visit_type)

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
    permission_classes = [IsAuthenticated]
    
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
    permission_classes = [IsAuthenticated]
    
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


class ClinicSessionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing clinic sessions.

    Supports filtering by clinic_type, day_of_week, and is_active.
    Provides a /capacity/ action that returns real-time slot availability for a given date.
    """

    queryset = ClinicSession.objects.select_related('consultant', 'created_by').order_by('day_of_week', 'start_time')
    permission_classes = [IsAuthenticated]

    def get_serializer_class(self):
        if self.action == 'list':
            return ClinicSessionListSerializer
        return ClinicSessionSerializer

    def get_queryset(self):
        qs = super().get_queryset()

        clinic_type = self.request.query_params.get('clinic_type')
        day_of_week = self.request.query_params.get('day_of_week')
        is_active = self.request.query_params.get('is_active')

        if clinic_type:
            qs = qs.filter(clinic_type=clinic_type)
        if day_of_week is not None:
            qs = qs.filter(day_of_week=day_of_week)
        if is_active is not None:
            qs = qs.filter(is_active=is_active.lower() in ('true', '1', 'yes'))

        return qs

    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)

    @action(detail=True, methods=['get'], url_path='capacity')
    def capacity(self, request, pk=None):
        """
        Return slot availability for this session on a specific date.

        Query parameter:
            date (YYYY-MM-DD) — required

        Response:
            {
                "date": "2026-08-04",
                "max_appointments": 20,
                "booked": 7,
                "available": 13,
                "is_full": false
            }
        """
        session = self.get_object()
        date_str = request.query_params.get('date')
        if not date_str:
            return Response({'error': 'Query parameter "date" (YYYY-MM-DD) is required.'}, status=status.HTTP_400_BAD_REQUEST)

        from datetime import date as date_type
        try:
            check_date = date_type.fromisoformat(date_str)
        except ValueError:
            return Response({'error': 'Invalid date format. Use YYYY-MM-DD.'}, status=status.HTTP_400_BAD_REQUEST)

        booked = session.booked_count_on_date(check_date)
        data = {
            'date': check_date,
            'max_appointments': session.max_appointments,
            'booked': booked,
            'available': session.available_slots_on_date(check_date),
            'is_full': session.is_full_on_date(check_date),
        }
        serializer = ClinicSessionCapacitySerializer(data)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='by-day')
    def by_day(self, request):
        """
        Return active clinic sessions grouped by day of week.

        Useful for rendering a weekly schedule overview.
        """
        days = {}
        for session in self.get_queryset().filter(is_active=True):
            day_label = session.get_day_of_week_display()
            days.setdefault(day_label, []).append(ClinicSessionListSerializer(session).data)

        ordered = {
            label: days[label]
            for label in ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
            if label in days
        }
        return Response(ordered)



