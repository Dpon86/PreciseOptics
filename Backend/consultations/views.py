"""
API views for PreciseOptics Eye Hospital Management System - Consultations
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from precise_optics.permissions import ReadOnlyOrAuthenticatedPermission
from django.utils import timezone
from django.db import models
from .models import Consultation, VitalSigns, ConsultationDocument, ConsultationImage
from .serializers import (
    ConsultationSerializer, ConsultationCreateSerializer, VitalSignsSerializer,
    ConsultationDocumentSerializer, ConsultationImageSerializer
)


class ConsultationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing consultations
    """
    queryset = Consultation.objects.all()
    serializer_class = ConsultationSerializer
    permission_classes = [ReadOnlyOrAuthenticatedPermission]
    
    def get_serializer_class(self):
        """Return different serializer for creation"""
        if self.action == 'create':
            return ConsultationCreateSerializer
        return ConsultationSerializer
    
    def get_queryset(self):
        """Filter consultations based on user permissions and parameters"""
        queryset = Consultation.objects.select_related('patient', 'consulting_doctor', 'visit')
        
        # Filter by patient
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filter by doctor
        doctor_id = self.request.query_params.get('doctor', None)
        if doctor_id:
            queryset = queryset.filter(consulting_doctor_id=doctor_id)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(scheduled_time__gte=date_from)
        if date_to:
            queryset = queryset.filter(scheduled_time__lte=date_to)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-scheduled_time')
    
    @action(detail=True, methods=['post'])
    def start_consultation(self, request, pk=None):
        """Mark consultation as started"""
        consultation = self.get_object()
        consultation.status = 'in_progress'
        consultation.actual_start_time = timezone.now()
        consultation.save()
        return Response({'status': 'consultation started'})
    
    @action(detail=True, methods=['post'])
    def complete_consultation(self, request, pk=None):
        """Mark consultation as completed"""
        consultation = self.get_object()
        consultation.status = 'completed'
        consultation.actual_end_time = timezone.now()
        consultation.save()
        return Response({'status': 'consultation completed'})


class VitalSignsViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing vital signs
    """
    queryset = VitalSigns.objects.all()
    serializer_class = VitalSignsSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter vital signs by consultation"""
        queryset = VitalSigns.objects.select_related('consultation', 'recorded_by')
        
        consultation_id = self.request.query_params.get('consultation', None)
        if consultation_id:
            queryset = queryset.filter(consultation_id=consultation_id)
        
        return queryset.order_by('-recorded_at')


class ConsultationDocumentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing consultation documents
    """
    queryset = ConsultationDocument.objects.all()
    serializer_class = ConsultationDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter documents by consultation"""
        queryset = ConsultationDocument.objects.select_related('consultation', 'uploaded_by')
        
        consultation_id = self.request.query_params.get('consultation', None)
        if consultation_id:
            queryset = queryset.filter(consultation_id=consultation_id)
        
        return queryset.filter(is_active=True).order_by('-uploaded_at')


class ConsultationImageViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing consultation images
    """
    queryset = ConsultationImage.objects.all()
    serializer_class = ConsultationImageSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter images by consultation"""
        queryset = ConsultationImage.objects.select_related('consultation', 'captured_by')
        
        consultation_id = self.request.query_params.get('consultation', None)
        if consultation_id:
            queryset = queryset.filter(consultation_id=consultation_id)
        
        return queryset.filter(is_active=True).order_by('-captured_at')
