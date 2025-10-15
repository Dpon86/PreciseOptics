"""
Views for Treatments app
"""
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from django.utils import timezone
from django.db.models import Q, Count, Avg
from .models import (
    TreatmentCategory, TreatmentType, Treatment, TreatmentMedication,
    TreatmentDocument, TreatmentFollowUp, TreatmentComplication
)
from .serializers import (
    TreatmentCategorySerializer, TreatmentTypeSerializer, TreatmentSerializer,
    TreatmentBasicSerializer, TreatmentCreateSerializer, TreatmentMedicationSerializer,
    TreatmentDocumentSerializer, TreatmentFollowUpSerializer, TreatmentComplicationSerializer
)


class TreatmentCategoryViewSet(viewsets.ModelViewSet):
    queryset = TreatmentCategory.objects.all()
    serializer_class = TreatmentCategorySerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category_type', 'is_active']
    search_fields = ['name', 'description']
    ordering_fields = ['name', 'category_type', 'created_at']
    ordering = ['category_type', 'name']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TreatmentTypeViewSet(viewsets.ModelViewSet):
    queryset = TreatmentType.objects.select_related('category').all()
    serializer_class = TreatmentTypeSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['category', 'urgency_level', 'requires_consent', 'requires_anesthesia', 'is_active']
    search_fields = ['name', 'code', 'description']
    ordering_fields = ['name', 'code', 'category__name', 'urgency_level', 'created_at']
    ordering = ['category__name', 'name']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def by_category(self, request):
        """Get treatment types grouped by category"""
        categories = TreatmentCategory.objects.filter(is_active=True).prefetch_related('treatment_types')
        result = {}
        for category in categories:
            result[category.name] = TreatmentTypeSerializer(
                category.treatment_types.filter(is_active=True), many=True
            ).data
        return Response(result)


class TreatmentViewSet(viewsets.ModelViewSet):
    queryset = Treatment.objects.select_related(
        'patient', 'consultation', 'treatment_type', 'treatment_type__category',
        'primary_surgeon', 'consent_obtained_by'
    ).prefetch_related(
        'assisting_staff', 'medications__medication', 'documents',
        'follow_ups', 'complications'
    ).all()
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'status', 'eye_treated', 'priority', 'outcome', 'treatment_type',
        'treatment_type__category', 'primary_surgeon', 'patient'
    ]
    search_fields = [
        'patient__first_name', 'patient__last_name', 'patient__patient_id',
        'treatment_type__name', 'indication', 'technique_notes'
    ]
    ordering_fields = ['scheduled_date', 'created_at', 'patient__last_name']
    ordering = ['-scheduled_date', '-created_at']
    
    def get_serializer_class(self):
        if self.action == 'list':
            return TreatmentBasicSerializer
        elif self.action == 'create':
            return TreatmentCreateSerializer
        return TreatmentSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)
    
    @action(detail=True, methods=['post'])
    def start_treatment(self, request, pk=None):
        """Mark treatment as started"""
        treatment = self.get_object()
        if treatment.status != 'scheduled':
            return Response(
                {'error': 'Treatment must be in scheduled status to start'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        treatment.status = 'in_progress'
        treatment.actual_start_time = timezone.now()
        treatment.save()
        
        return Response({'message': 'Treatment started successfully'})
    
    @action(detail=True, methods=['post'])
    def complete_treatment(self, request, pk=None):
        """Mark treatment as completed"""
        treatment = self.get_object()
        if treatment.status != 'in_progress':
            return Response(
                {'error': 'Treatment must be in progress to complete'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Get data from request
        outcome = request.data.get('outcome', 'pending')
        complications_notes = request.data.get('complications_notes', '')
        post_op_instructions = request.data.get('post_operative_instructions', '')
        
        treatment.status = 'completed'
        treatment.actual_end_time = timezone.now()
        treatment.outcome = outcome
        treatment.complications_notes = complications_notes
        treatment.post_operative_instructions = post_op_instructions
        treatment.save()
        
        return Response({'message': 'Treatment completed successfully'})
    
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        """Get upcoming scheduled treatments"""
        upcoming_treatments = self.queryset.filter(
            status__in=['scheduled', 'in_progress'],
            scheduled_date__gte=timezone.now().date()
        ).order_by('scheduled_date')
        
        serializer = TreatmentBasicSerializer(upcoming_treatments, many=True)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'])
    def statistics(self, request):
        """Get treatment statistics"""
        stats = {
            'total_treatments': self.queryset.count(),
            'by_status': {},
            'by_category': {},
            'by_outcome': {},
            'completion_rate': 0
        }
        
        # Status breakdown
        status_counts = self.queryset.values('status').annotate(count=Count('id'))
        for item in status_counts:
            stats['by_status'][item['status']] = item['count']
        
        # Category breakdown
        category_counts = self.queryset.values(
            'treatment_type__category__name'
        ).annotate(count=Count('id'))
        for item in category_counts:
            stats['by_category'][item['treatment_type__category__name']] = item['count']
        
        # Outcome breakdown
        outcome_counts = self.queryset.values('outcome').annotate(count=Count('id'))
        for item in outcome_counts:
            stats['by_outcome'][item['outcome']] = item['count']
        
        # Completion rate
        completed = self.queryset.filter(status='completed').count()
        total = self.queryset.count()
        if total > 0:
            stats['completion_rate'] = round((completed / total) * 100, 2)
        
        return Response(stats)


class TreatmentMedicationViewSet(viewsets.ModelViewSet):
    queryset = TreatmentMedication.objects.select_related('treatment', 'medication').all()
    serializer_class = TreatmentMedicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['treatment', 'medication', 'timing']
    ordering_fields = ['timing', 'medication__name', 'created_at']
    ordering = ['timing', 'medication__name']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TreatmentDocumentViewSet(viewsets.ModelViewSet):
    queryset = TreatmentDocument.objects.select_related('treatment', 'created_by').all()
    serializer_class = TreatmentDocumentSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['treatment', 'document_type']
    search_fields = ['title', 'description']
    ordering_fields = ['created_at', 'title', 'document_type']
    ordering = ['-created_at']
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TreatmentFollowUpViewSet(viewsets.ModelViewSet):
    queryset = TreatmentFollowUp.objects.select_related('treatment', 'assessed_by').all()
    serializer_class = TreatmentFollowUpSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['treatment', 'status', 'assessed_by', 'further_treatment_required']
    ordering_fields = ['scheduled_date', 'created_at']
    ordering = ['-scheduled_date']
    
    @action(detail=False, methods=['get'])
    def due_soon(self, request):
        """Get follow-ups due in the next 7 days"""
        from datetime import timedelta
        due_date = timezone.now().date() + timedelta(days=7)
        
        due_followups = self.queryset.filter(
            status='scheduled',
            scheduled_date__date__lte=due_date,
            scheduled_date__date__gte=timezone.now().date()
        ).order_by('scheduled_date')
        
        serializer = self.get_serializer(due_followups, many=True)
        return Response(serializer.data)


class TreatmentComplicationViewSet(viewsets.ModelViewSet):
    queryset = TreatmentComplication.objects.select_related('treatment', 'reported_by').all()
    serializer_class = TreatmentComplicationSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'treatment', 'complication_type', 'severity', 'preventable',
        'reported_to_clinical_governance'
    ]
    search_fields = ['description', 'treatment_given', 'incident_number']
    ordering_fields = ['onset_time', 'severity', 'created_at']
    ordering = ['-onset_time']
    
    def perform_create(self, serializer):
        serializer.save(reported_by=self.request.user)
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get complications summary"""
        summary = {
            'total_complications': self.queryset.count(),
            'by_type': {},
            'by_severity': {},
            'preventable_rate': 0
        }
        
        # Type breakdown
        type_counts = self.queryset.values('complication_type').annotate(count=Count('id'))
        for item in type_counts:
            summary['by_type'][item['complication_type']] = item['count']
        
        # Severity breakdown
        severity_counts = self.queryset.values('severity').annotate(count=Count('id'))
        for item in severity_counts:
            summary['by_severity'][item['severity']] = item['count']
        
        # Preventable rate
        preventable = self.queryset.filter(preventable=True).count()
        total = self.queryset.exclude(preventable__isnull=True).count()
        if total > 0:
            summary['preventable_rate'] = round((preventable / total) * 100, 2)
        
        return Response(summary)
