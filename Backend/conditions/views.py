"""
Views for conditions app
"""
from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q
from django.shortcuts import get_object_or_404
from datetime import date, timedelta

from .models import MedicalCondition, PatientCondition, ConditionProgress, ConditionDocument
from .serializers import (
    MedicalConditionSerializer, MedicalConditionListSerializer,
    PatientConditionSerializer, PatientConditionListSerializer,
    PatientConditionCreateSerializer, ConditionProgressSerializer,
    ConditionProgressListSerializer, ConditionProgressCreateSerializer,
    ConditionDocumentSerializer, ConditionStatisticsSerializer
)


# ==================== Medical Condition Views ====================

class MedicalConditionListCreateView(generics.ListCreateAPIView):
    """
    List all medical conditions or create a new one
    """
    queryset = MedicalCondition.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'has_standard_protocol', 'is_active']
    search_fields = ['code', 'name', 'description']
    ordering_fields = ['name', 'code', 'category', 'created_at']
    ordering = ['category', 'name']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return MedicalConditionListSerializer
        return MedicalConditionSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class MedicalConditionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a medical condition
    """
    queryset = MedicalCondition.objects.all()
    serializer_class = MedicalConditionSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_destroy(self, instance):
        # Soft delete - mark as inactive instead of deleting
        instance.is_active = False
        instance.save()


# ==================== Patient Condition Views ====================

class PatientConditionListCreateView(generics.ListCreateAPIView):
    """
    List all patient conditions or create a new one
    """
    queryset = PatientCondition.objects.all().select_related(
        'patient', 'condition', 'diagnosed_by'
    )
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['patient', 'condition', 'severity', 'current_status', 
                        'eye_affected', 'is_active']
    search_fields = ['patient__first_name', 'patient__last_name', 
                    'patient__patient_id', 'condition__name']
    ordering_fields = ['diagnosis_date', 'severity', 'current_status']
    ordering = ['-diagnosis_date']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PatientConditionCreateSerializer
        return PatientConditionListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by diagnosis date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(diagnosis_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(diagnosis_date__lte=date_to)
        
        # Filter by upcoming assessments
        upcoming = self.request.query_params.get('upcoming_assessment')
        if upcoming == 'true':
            queryset = queryset.filter(
                next_assessment_date__isnull=False,
                next_assessment_date__gte=date.today()
            )
        
        # Filter by overdue assessments
        overdue = self.request.query_params.get('overdue_assessment')
        if overdue == 'true':
            queryset = queryset.filter(
                next_assessment_date__isnull=False,
                next_assessment_date__lt=date.today(),
                is_active=True
            )
        
        return queryset


class PatientConditionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a patient condition
    """
    queryset = PatientCondition.objects.all().select_related(
        'patient', 'condition', 'diagnosed_by'
    ).prefetch_related('progress_records', 'documents')
    serializer_class = PatientConditionSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_destroy(self, instance):
        # Soft delete - mark as inactive
        instance.is_active = False
        instance.save()


class PatientConditionsView(generics.ListAPIView):
    """
    List all conditions for a specific patient
    """
    serializer_class = PatientConditionListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['diagnosis_date', 'severity', 'current_status']
    ordering = ['-diagnosis_date']
    
    def get_queryset(self):
        patient_id = self.kwargs['patient_id']
        return PatientCondition.objects.filter(
            patient_id=patient_id
        ).select_related('condition', 'diagnosed_by')


# ==================== Condition Progress Views ====================

class ConditionProgressListCreateView(generics.ListCreateAPIView):
    """
    List all progress records or create a new one
    """
    queryset = ConditionProgress.objects.all().select_related(
        'patient_condition__patient', 'patient_condition__condition', 'assessed_by'
    )
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['patient_condition', 'assessment_type', 'status_change', 
                        'severity_at_assessment']
    search_fields = ['patient_condition__patient__first_name', 
                    'patient_condition__patient__last_name', 
                    'clinical_findings']
    ordering_fields = ['assessment_date']
    ordering = ['-assessment_date']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ConditionProgressCreateSerializer
        return ConditionProgressListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by assessment date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(assessment_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(assessment_date__lte=date_to)
        
        return queryset


class ConditionProgressDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a progress record
    """
    queryset = ConditionProgress.objects.all().select_related(
        'patient_condition__patient', 'patient_condition__condition', 'assessed_by'
    )
    serializer_class = ConditionProgressSerializer
    permission_classes = [IsAuthenticated]


class PatientConditionProgressView(generics.ListAPIView):
    """
    List all progress records for a specific patient condition
    """
    serializer_class = ConditionProgressSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['assessment_date']
    ordering = ['-assessment_date']
    
    def get_queryset(self):
        patient_condition_id = self.kwargs['patient_condition_id']
        return ConditionProgress.objects.filter(
            patient_condition_id=patient_condition_id
        ).select_related('assessed_by')


# ==================== Condition Document Views ====================

class ConditionDocumentListCreateView(generics.ListCreateAPIView):
    """
    List all documents or upload a new one
    """
    queryset = ConditionDocument.objects.all().select_related(
        'patient_condition', 'uploaded_by'
    )
    serializer_class = ConditionDocumentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['patient_condition', 'document_type']
    ordering = ['-uploaded_at']
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class ConditionDocumentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a document
    """
    queryset = ConditionDocument.objects.all()
    serializer_class = ConditionDocumentSerializer
    permission_classes = [IsAuthenticated]


class PatientConditionDocumentsView(generics.ListAPIView):
    """
    List all documents for a specific patient condition
    """
    serializer_class = ConditionDocumentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['-uploaded_at']
    
    def get_queryset(self):
        patient_condition_id = self.kwargs['patient_condition_id']
        return ConditionDocument.objects.filter(
            patient_condition_id=patient_condition_id
        ).select_related('uploaded_by')


# ==================== API Function Views ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def condition_statistics(request):
    """
    Get overall condition statistics
    """
    # Total conditions
    total_conditions = MedicalCondition.objects.count()
    active_conditions = MedicalCondition.objects.filter(is_active=True).count()
    
    # Patient conditions
    total_patient_conditions = PatientCondition.objects.count()
    active_patient_conditions = PatientCondition.objects.filter(is_active=True).count()
    
    # Conditions by category
    conditions_by_category = dict(
        MedicalCondition.objects.filter(is_active=True)
        .values('category')
        .annotate(count=Count('id'))
        .values_list('category', 'count')
    )
    
    # Patient conditions by severity
    conditions_by_severity = dict(
        PatientCondition.objects.filter(is_active=True)
        .values('severity')
        .annotate(count=Count('id'))
        .values_list('severity', 'count')
    )
    
    # Recent diagnoses (last 30 days)
    thirty_days_ago = date.today() - timedelta(days=30)
    recent_diagnoses = PatientCondition.objects.filter(
        diagnosis_date__gte=thirty_days_ago
    ).count()
    
    # Upcoming assessments (next 7 days)
    seven_days_ahead = date.today() + timedelta(days=7)
    upcoming_assessments = PatientCondition.objects.filter(
        next_assessment_date__gte=date.today(),
        next_assessment_date__lte=seven_days_ahead,
        is_active=True
    ).count()
    
    # Overdue assessments
    overdue_assessments = PatientCondition.objects.filter(
        next_assessment_date__lt=date.today(),
        is_active=True
    ).count()
    
    statistics = {
        'total_conditions': total_conditions,
        'active_conditions': active_conditions,
        'total_patient_conditions': total_patient_conditions,
        'active_patient_conditions': active_patient_conditions,
        'conditions_by_category': conditions_by_category,
        'conditions_by_severity': conditions_by_severity,
        'recent_diagnoses': recent_diagnoses,
        'upcoming_assessments': upcoming_assessments,
        'overdue_assessments': overdue_assessments
    }
    
    serializer = ConditionStatisticsSerializer(statistics)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def condition_by_code(request, code):
    """
    Get a condition by its code
    """
    condition = get_object_or_404(MedicalCondition, code=code, is_active=True)
    serializer = MedicalConditionSerializer(condition)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def resolve_patient_condition(request, patient_condition_id):
    """
    Mark a patient condition as resolved
    """
    patient_condition = get_object_or_404(
        PatientCondition, 
        id=patient_condition_id
    )
    
    patient_condition.current_status = 'resolved'
    patient_condition.resolved_date = date.today()
    patient_condition.resolution_notes = request.data.get('resolution_notes', '')
    patient_condition.is_active = False
    patient_condition.save()
    
    serializer = PatientConditionSerializer(patient_condition)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_condition_timeline(request, patient_condition_id):
    """
    Get a timeline of all progress records for a patient condition
    """
    patient_condition = get_object_or_404(
        PatientCondition,
        id=patient_condition_id
    )
    
    progress_records = patient_condition.progress_records.all().select_related('assessed_by')
    serializer = ConditionProgressSerializer(progress_records, many=True)
    
    return Response({
        'patient_condition': PatientConditionSerializer(patient_condition).data,
        'timeline': serializer.data
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def overdue_assessments(request):
    """
    Get all patient conditions with overdue assessments
    """
    overdue = PatientCondition.objects.filter(
        next_assessment_date__lt=date.today(),
        is_active=True
    ).select_related('patient', 'condition', 'diagnosed_by').order_by('next_assessment_date')
    
    serializer = PatientConditionListSerializer(overdue, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def upcoming_assessments(request):
    """
    Get all patient conditions with upcoming assessments (next 14 days)
    """
    today = date.today()
    two_weeks_ahead = today + timedelta(days=14)
    
    upcoming = PatientCondition.objects.filter(
        next_assessment_date__gte=today,
        next_assessment_date__lte=two_weeks_ahead,
        is_active=True
    ).select_related('patient', 'condition', 'diagnosed_by').order_by('next_assessment_date')
    
    serializer = PatientConditionListSerializer(upcoming, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def condition_prevalence(request):
    """
    Get prevalence statistics for each condition
    """
    prevalence = MedicalCondition.objects.filter(is_active=True).annotate(
        active_cases=Count('patient_cases', filter=Q(patient_cases__is_active=True)),
        total_cases=Count('patient_cases')
    ).values('id', 'code', 'name', 'category', 'active_cases', 'total_cases')
    
    return Response(list(prevalence))


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_update_status(request):
    """
    Bulk update status for multiple patient conditions
    """
    condition_ids = request.data.get('condition_ids', [])
    new_status = request.data.get('status')
    
    if not condition_ids or not new_status:
        return Response(
            {'error': 'condition_ids and status are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    updated = PatientCondition.objects.filter(
        id__in=condition_ids
    ).update(current_status=new_status)
    
    return Response({
        'message': f'Successfully updated {updated} patient conditions',
        'updated_count': updated
    })
