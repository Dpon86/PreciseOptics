"""
API views for PreciseOptics Eye Hospital Management System - Medications
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from precise_optics.permissions import ReadOnlyOrAuthenticatedPermission
from .models import Medication, Prescription, PrescriptionItem, MedicationAdministration, DrugAllergy
from .serializers import (
    MedicationSerializer, PrescriptionSerializer, PrescriptionCreateSerializer,
    PrescriptionItemSerializer, MedicationAdministrationSerializer, DrugAllergySerializer
)


class MedicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing medications
    """
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer
    permission_classes = [ReadOnlyOrAuthenticatedPermission]
    
    def get_queryset(self):
        """Filter medications based on parameters"""
        queryset = Medication.objects.filter(approval_status=True)
        
        # Search by name or generic name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                models.Q(name__icontains=search) |
                models.Q(generic_name__icontains=search) |
                models.Q(brand_names__icontains=search)
            )
        
        # Filter by medication type
        med_type = self.request.query_params.get('type', None)
        if med_type:
            queryset = queryset.filter(medication_type=med_type)
        
        # Filter by therapeutic class
        therapeutic_class = self.request.query_params.get('class', None)
        if therapeutic_class:
            queryset = queryset.filter(therapeutic_class=therapeutic_class)
        
        return queryset.order_by('name')
    
    @action(detail=False, methods=['get'])
    def types(self, request):
        """Get available medication types"""
        types = Medication.MEDICATION_TYPES
        return Response([{'value': value, 'label': label} for value, label in types])
    
    @action(detail=False, methods=['get'])
    def therapeutic_classes(self, request):
        """Get available therapeutic classes"""
        classes = Medication.THERAPEUTIC_CLASS
        return Response([{'value': value, 'label': label} for value, label in classes])


class PrescriptionViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing prescriptions
    """
    queryset = Prescription.objects.all()
    serializer_class = PrescriptionSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        """Return different serializer for creation"""
        if self.action == 'create':
            return PrescriptionCreateSerializer
        return PrescriptionSerializer
    
    def get_queryset(self):
        """Filter prescriptions based on parameters"""
        queryset = Prescription.objects.select_related('patient', 'prescribed_by')
        
        # Filter by patient
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filter by prescribing doctor
        doctor_id = self.request.query_params.get('doctor', None)
        if doctor_id:
            queryset = queryset.filter(prescribed_by_id=doctor_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-prescription_date')


class PrescriptionItemViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing prescription items
    """
    queryset = PrescriptionItem.objects.all()
    serializer_class = PrescriptionItemSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter prescription items by prescription"""
        queryset = PrescriptionItem.objects.select_related('prescription', 'medication')
        
        prescription_id = self.request.query_params.get('prescription', None)
        if prescription_id:
            queryset = queryset.filter(prescription_id=prescription_id)
        
        return queryset.order_by('id')


class MedicationAdministrationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing medication administration records
    """
    queryset = MedicationAdministration.objects.all()
    serializer_class = MedicationAdministrationSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter administration records"""
        queryset = MedicationAdministration.objects.select_related(
            'patient', 'medication', 'administered_by'
        )
        
        # Filter by patient
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filter by medication
        medication_id = self.request.query_params.get('medication', None)
        if medication_id:
            queryset = queryset.filter(medication_id=medication_id)
        
        return queryset.order_by('-administration_time')


class DrugAllergyViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing drug allergies
    """
    queryset = DrugAllergy.objects.all()
    serializer_class = DrugAllergySerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter drug allergies by patient"""
        queryset = DrugAllergy.objects.select_related('patient', 'reported_by')
        
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        return queryset.filter(is_active=True).order_by('-first_occurrence_date')
