"""
API views for PreciseOptics Eye Hospital Management System - Patients
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from precise_optics.permissions import ReadOnlyOrAuthenticatedPermission
from django.utils import timezone
from django.db import models
from .models import Patient, PatientVisit
from .serializers import PatientSerializer, PatientVisitSerializer, PatientCreateSerializer


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
