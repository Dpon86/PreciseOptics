"""
API views for PreciseOptics Eye Hospital Management System - Medications
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from rest_framework.permissions import IsAuthenticated
from .models import (
    Medication, Prescription, PrescriptionItem, MedicationAdministration,
    DrugAllergy, Manufacturer, MedicationCategory, MedicationRecall
)
from .serializers import (
    MedicationSerializer, PrescriptionSerializer, PrescriptionCreateSerializer,
    PrescriptionItemSerializer, MedicationAdministrationSerializer,
    DrugAllergySerializer, ManufacturerSerializer, MedicationCategorySerializer,
    MedicationRecallSerializer
)


class ManufacturerViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing manufacturers
    """
    queryset = Manufacturer.objects.all()
    serializer_class = ManufacturerSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter manufacturers"""
        queryset = Manufacturer.objects.filter(is_active=True)
        
        # Search by name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        return queryset.order_by('name')
    
    def perform_create(self, serializer):
        """Set created_by on creation"""
        serializer.save(created_by=self.request.user)


class MedicationCategoryViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing medication categories
    """
    queryset = MedicationCategory.objects.all()
    serializer_class = MedicationCategorySerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter categories"""
        queryset = MedicationCategory.objects.filter(is_active=True)
        
        # Search by name
        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(name__icontains=search)
        
        # Get only parent categories (no parent)
        parent_only = self.request.query_params.get('parent_only', None)
        if parent_only == 'true':
            queryset = queryset.filter(parent_category__isnull=True)
        
        return queryset.order_by('name')
    
    def perform_create(self, serializer):
        """Set created_by on creation"""
        serializer.save(created_by=self.request.user)


class MedicationViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing medications
    """
    queryset = Medication.objects.all()
    serializer_class = MedicationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        """Filter medications based on parameters"""
        queryset = Medication.objects.select_related(
            'manufacturer', 'category', 'created_by'
        ).filter(approval_status=True)
        
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
        queryset = Prescription.objects.select_related('patient', 'prescribing_doctor')
        
        # Filter by patient
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filter by prescribing doctor
        doctor_id = self.request.query_params.get('doctor', None)
        if doctor_id:
            queryset = queryset.filter(prescribing_doctor_id=doctor_id)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-date_prescribed')


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


class MedicationRecallViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing medication recalls
    """
    queryset = MedicationRecall.objects.all()
    serializer_class = MedicationRecallSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        queryset = MedicationRecall.objects.select_related(
            'medication', 'issued_by', 'acknowledged_by', 'resolved_by'
        )

        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)

        severity_filter = self.request.query_params.get('severity', None)
        if severity_filter:
            queryset = queryset.filter(severity=severity_filter)

        medication_id = self.request.query_params.get('medication', None)
        if medication_id:
            queryset = queryset.filter(medication_id=medication_id)

        search = self.request.query_params.get('search', None)
        if search:
            queryset = queryset.filter(
                models.Q(title__icontains=search) |
                models.Q(batch_number__icontains=search) |
                models.Q(medication__name__icontains=search)
            )

        return queryset.order_by('-issued_date')

    def perform_create(self, serializer):
        serializer.save(issued_by=self.request.user)

    @action(detail=True, methods=['post'])
    def acknowledge(self, request, pk=None):
        """Mark a recall as acknowledged"""
        from django.utils import timezone
        recall = self.get_object()
        if recall.status != 'active':
            return Response(
                {'error': 'Only active recalls can be acknowledged'},
                status=status.HTTP_400_BAD_REQUEST
            )
        recall.status = 'acknowledged'
        recall.acknowledged_by = request.user
        recall.acknowledged_at = timezone.now()
        recall.save()
        return Response(self.get_serializer(recall).data)

    @action(detail=True, methods=['post'])
    def resolve(self, request, pk=None):
        """Mark a recall as resolved"""
        from django.utils import timezone
        recall = self.get_object()
        if recall.status not in ('active', 'acknowledged'):
            return Response(
                {'error': 'Only active or acknowledged recalls can be resolved'},
                status=status.HTTP_400_BAD_REQUEST
            )
        resolution_notes = request.data.get('resolution_notes', '')
        recall.status = 'resolved'
        recall.resolved_by = request.user
        recall.resolved_at = timezone.now()
        recall.resolution_notes = resolution_notes
        recall.save()
        return Response(self.get_serializer(recall).data)

    @action(detail=True, methods=['post'])
    def close(self, request, pk=None):
        """Close a recall (final state)"""
        from django.utils import timezone
        recall = self.get_object()
        recall.status = 'closed'
        if not recall.resolved_at:
            recall.resolved_at = timezone.now()
            recall.resolved_by = request.user
            recall.resolution_notes = request.data.get('resolution_notes', 'Closed without formal resolution')
        recall.save()
        return Response(self.get_serializer(recall).data)

    @action(detail=True, methods=['get'])
    def affected_patients(self, request, pk=None):
        """List patients who received the recalled medication/batch"""
        from patients.models import Patient
        recall = self.get_object()
        qs = PrescriptionItem.objects.filter(medication=recall.medication).select_related(
            'prescription__patient'
        )
        if recall.batch_number:
            qs = qs.filter(medication__batch_number=recall.batch_number)

        patient_ids = qs.values_list('prescription__patient', flat=True).distinct()
        patients = Patient.objects.filter(id__in=patient_ids).values(
            'id', 'first_name', 'last_name', 'date_of_birth', 'phone_number'
        )
        return Response(list(patients))

