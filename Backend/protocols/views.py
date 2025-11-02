"""
Views for protocols app
"""
from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Avg, Q
from django.shortcuts import get_object_or_404
from django.utils import timezone
from datetime import date, timedelta

from .models import (
    TreatmentProtocol, ProtocolStep, PatientProtocol,
    ProtocolStepCompletion, ConsentForm, ProtocolStepMedication,
    ProtocolStepTreatment, ProtocolStepTest
)
from .serializers import (
    TreatmentProtocolSerializer, TreatmentProtocolListSerializer,
    TreatmentProtocolCreateSerializer, ProtocolStepSerializer,
    ProtocolStepListSerializer, PatientProtocolSerializer,
    PatientProtocolListSerializer, PatientProtocolCreateSerializer,
    ProtocolStepCompletionSerializer, ProtocolStepCompletionListSerializer,
    ProtocolStepCompletionCreateSerializer, ConsentFormSerializer,
    ConsentFormListSerializer, ConsentFormCreateSerializer,
    ProtocolStatisticsSerializer
)
from .serializers_enhanced import (
    ProtocolStepMedicationSerializer, ProtocolStepMedicationCreateSerializer,
    ProtocolStepTreatmentSerializer, ProtocolStepTreatmentCreateSerializer,
    ProtocolStepTestSerializer, ProtocolStepTestCreateSerializer
)


# ==================== Treatment Protocol Views ====================

class TreatmentProtocolListCreateView(generics.ListCreateAPIView):
    """
    List all treatment protocols or create a new one
    """
    queryset = TreatmentProtocol.objects.all().select_related('condition', 'created_by')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['protocol_type', 'condition', 'requires_consent', 'is_active']
    search_fields = ['name', 'code', 'description', 'condition__name']
    ordering_fields = ['name', 'code', 'created_at']
    ordering = ['condition', 'name']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return TreatmentProtocolCreateSerializer
        return TreatmentProtocolListSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class TreatmentProtocolDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a treatment protocol
    """
    queryset = TreatmentProtocol.objects.all().select_related(
        'condition', 'created_by'
    ).prefetch_related('steps', 'patient_assignments')
    serializer_class = TreatmentProtocolSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_destroy(self, instance):
        # Soft delete
        instance.is_active = False
        instance.save()


class ProtocolStepsView(generics.ListAPIView):
    """
    List all steps for a specific protocol
    """
    serializer_class = ProtocolStepSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        protocol_id = self.kwargs['protocol_id']
        return ProtocolStep.objects.filter(
            protocol_id=protocol_id
        ).select_related('medication').order_by('step_number')


class ProtocolStepListCreateView(generics.ListCreateAPIView):
    """
    List all protocol steps or create a new one
    """
    queryset = ProtocolStep.objects.all().select_related('protocol', 'medication')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['protocol', 'step_type', 'is_mandatory']
    search_fields = ['title', 'description']
    ordering_fields = ['protocol', 'step_number', 'timing_days']
    ordering = ['protocol', 'step_number']
    
    def get_serializer_class(self):
        return ProtocolStepSerializer


class ProtocolStepDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a protocol step
    """
    queryset = ProtocolStep.objects.all().select_related('protocol', 'medication')
    serializer_class = ProtocolStepSerializer
    permission_classes = [IsAuthenticated]


# ==================== Patient Protocol Views ====================

class PatientProtocolListCreateView(generics.ListCreateAPIView):
    """
    List all patient protocols or assign a new one
    """
    queryset = PatientProtocol.objects.all().select_related(
        'patient', 'protocol', 'assigned_by'
    )
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['patient', 'protocol', 'status', 'assigned_by']
    search_fields = [
        'patient__first_name', 'patient__last_name', 
        'patient__patient_id', 'protocol__name'
    ]
    ordering_fields = ['start_date', 'status', 'adherence_percentage']
    ordering = ['-start_date']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return PatientProtocolCreateSerializer
        return PatientProtocolListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by status
        status_param = self.request.query_params.get('status')
        if status_param:
            queryset = queryset.filter(status=status_param)
        
        # Filter by active protocols
        active_only = self.request.query_params.get('active_only')
        if active_only == 'true':
            queryset = queryset.filter(status__in=['pending', 'active'])
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(start_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(start_date__lte=date_to)
        
        return queryset


class PatientProtocolDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a patient protocol
    """
    queryset = PatientProtocol.objects.all().select_related(
        'patient', 'protocol', 'assigned_by', 'discontinued_by'
    ).prefetch_related('step_completions', 'consent_forms')
    serializer_class = PatientProtocolSerializer
    permission_classes = [IsAuthenticated]


class PatientProtocolsView(generics.ListAPIView):
    """
    List all protocols for a specific patient
    """
    serializer_class = PatientProtocolListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering_fields = ['start_date', 'status']
    ordering = ['-start_date']
    
    def get_queryset(self):
        patient_id = self.kwargs['patient_id']
        return PatientProtocol.objects.filter(
            patient_id=patient_id
        ).select_related('protocol', 'assigned_by')


# ==================== Protocol Step Completion Views ====================

class ProtocolStepCompletionListCreateView(generics.ListCreateAPIView):
    """
    List all step completions or create a new one
    """
    queryset = ProtocolStepCompletion.objects.all().select_related(
        'patient_protocol__patient', 'protocol_step', 'completed_by'
    )
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'patient_protocol', 'protocol_step', 'status', 
        'outcome', 'adverse_event'
    ]
    search_fields = [
        'patient_protocol__patient__first_name',
        'patient_protocol__patient__last_name',
        'protocol_step__title', 'clinical_notes'
    ]
    ordering_fields = ['scheduled_date', 'completed_date']
    ordering = ['-scheduled_date']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProtocolStepCompletionCreateSerializer
        return ProtocolStepCompletionListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by scheduled date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(scheduled_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(scheduled_date__lte=date_to)
        
        # Filter by due steps
        due_only = self.request.query_params.get('due_only')
        if due_only == 'true':
            queryset = queryset.filter(
                status='scheduled',
                scheduled_date__lte=date.today()
            )
        
        return queryset


class ProtocolStepCompletionDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a step completion
    """
    queryset = ProtocolStepCompletion.objects.all().select_related(
        'patient_protocol', 'protocol_step', 'completed_by', 'rescheduled_by'
    )
    serializer_class = ProtocolStepCompletionSerializer
    permission_classes = [IsAuthenticated]


class PatientProtocolScheduleView(generics.ListAPIView):
    """
    Get the complete schedule for a patient protocol
    """
    serializer_class = ProtocolStepCompletionListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['scheduled_date']
    
    def get_queryset(self):
        patient_protocol_id = self.kwargs['patient_protocol_id']
        return ProtocolStepCompletion.objects.filter(
            patient_protocol_id=patient_protocol_id
        ).select_related('protocol_step', 'completed_by')


# ==================== Consent Form Views ====================

class ConsentFormListCreateView(generics.ListCreateAPIView):
    """
    List all consent forms or create a new one
    """
    queryset = ConsentForm.objects.all().select_related(
        'patient', 'protocol', 'obtained_by', 'witnessed_by'
    )
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = [
        'patient', 'protocol', 'consent_type', 'status',
        'patient_understood', 'interpreter_used'
    ]
    search_fields = [
        'patient__first_name', 'patient__last_name',
        'patient__patient_id', 'title', 'description'
    ]
    ordering_fields = ['consent_given_date', 'expiry_date']
    ordering = ['-consent_given_date']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ConsentFormCreateSerializer
        return ConsentFormListSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by valid consents
        valid_only = self.request.query_params.get('valid_only')
        if valid_only == 'true':
            queryset = queryset.filter(
                status='obtained'
            ).filter(
                Q(expiry_date__isnull=True) | Q(expiry_date__gte=date.today())
            )
        
        # Filter by expiring soon
        expiring_days = self.request.query_params.get('expiring_days')
        if expiring_days:
            future_date = date.today() + timedelta(days=int(expiring_days))
            queryset = queryset.filter(
                status='obtained',
                expiry_date__lte=future_date,
                expiry_date__gte=date.today()
            )
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save()


class ConsentFormDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a consent form
    """
    queryset = ConsentForm.objects.all().select_related(
        'patient', 'protocol', 'patient_protocol', 
        'obtained_by', 'witnessed_by'
    )
    serializer_class = ConsentFormSerializer
    permission_classes = [IsAuthenticated]


class PatientConsentFormsView(generics.ListAPIView):
    """
    List all consent forms for a specific patient
    """
    serializer_class = ConsentFormListSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [filters.OrderingFilter]
    ordering = ['-consent_given_date']
    
    def get_queryset(self):
        patient_id = self.kwargs['patient_id']
        return ConsentForm.objects.filter(
            patient_id=patient_id
        ).select_related('protocol', 'obtained_by')


# ==================== API Function Views ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def complete_protocol_step(request, patient_protocol_id, step_id):
    """
    Mark a protocol step as complete
    """
    step_completion = get_object_or_404(
        ProtocolStepCompletion,
        patient_protocol_id=patient_protocol_id,
        id=step_id
    )
    
    serializer = ProtocolStepCompletionCreateSerializer(
        step_completion,
        data=request.data,
        partial=True
    )
    
    if serializer.is_valid():
        serializer.save(completed_by=request.user)
        return Response(serializer.data)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def discontinue_patient_protocol(request, patient_protocol_id):
    """
    Discontinue a patient protocol
    """
    patient_protocol = get_object_or_404(
        PatientProtocol,
        id=patient_protocol_id
    )
    
    patient_protocol.status = 'discontinued'
    patient_protocol.discontinuation_date = date.today()
    patient_protocol.discontinued_by = request.user
    patient_protocol.discontinuation_reason = request.data.get('reason', '')
    patient_protocol.save()
    
    serializer = PatientProtocolSerializer(patient_protocol)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def reschedule_protocol_step(request, step_completion_id):
    """
    Reschedule a protocol step
    """
    step_completion = get_object_or_404(
        ProtocolStepCompletion,
        id=step_completion_id
    )
    
    new_date = request.data.get('new_date')
    reason = request.data.get('reason', '')
    
    if not new_date:
        return Response(
            {'error': 'new_date is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    step_completion.original_scheduled_date = step_completion.scheduled_date
    step_completion.scheduled_date = new_date
    step_completion.reschedule_reason = reason
    step_completion.rescheduled_by = request.user
    step_completion.status = 'rescheduled'
    step_completion.save()
    
    serializer = ProtocolStepCompletionSerializer(step_completion)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def withdraw_consent(request, consent_id):
    """
    Withdraw a consent form
    """
    consent_form = get_object_or_404(ConsentForm, id=consent_id)
    
    consent_form.status = 'withdrawn'
    consent_form.withdrawal_date = date.today()
    consent_form.withdrawal_reason = request.data.get('reason', '')
    consent_form.save()
    
    serializer = ConsentFormSerializer(consent_form)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protocol_statistics(request):
    """
    Get overall protocol statistics
    """
    # Total protocols
    total_protocols = TreatmentProtocol.objects.count()
    active_protocols = TreatmentProtocol.objects.filter(is_active=True).count()
    
    # Protocols by type
    protocols_by_type = dict(
        TreatmentProtocol.objects.filter(is_active=True)
        .values('protocol_type')
        .annotate(count=Count('id'))
        .values_list('protocol_type', 'count')
    )
    
    # Protocols by condition
    protocols_by_condition = dict(
        TreatmentProtocol.objects.filter(is_active=True)
        .values('condition__name')
        .annotate(count=Count('id'))
        .values_list('condition__name', 'count')
    )
    
    # Patient protocols
    active_patient_protocols = PatientProtocol.objects.filter(
        status__in=['pending', 'active']
    ).count()
    
    completed_patient_protocols = PatientProtocol.objects.filter(
        status='completed'
    ).count()
    
    # Average adherence
    avg_adherence = PatientProtocol.objects.filter(
        status__in=['active', 'completed']
    ).aggregate(Avg('adherence_percentage'))['adherence_percentage__avg'] or 0
    
    # Consent forms
    pending_consents = ConsentForm.objects.filter(status='pending').count()
    
    expired_consents = ConsentForm.objects.filter(
        status='obtained',
        expiry_date__lt=date.today()
    ).count()
    
    statistics = {
        'total_protocols': total_protocols,
        'active_protocols': active_protocols,
        'protocols_by_type': protocols_by_type,
        'protocols_by_condition': protocols_by_condition,
        'active_patient_protocols': active_patient_protocols,
        'completed_patient_protocols': completed_patient_protocols,
        'average_adherence': round(avg_adherence, 2),
        'pending_consents': pending_consents,
        'expired_consents': expired_consents
    }
    
    serializer = ProtocolStatisticsSerializer(statistics)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protocol_by_code(request, code):
    """
    Get a protocol by its code
    """
    protocol = get_object_or_404(
        TreatmentProtocol,
        code=code.upper(),
        is_active=True
    )
    serializer = TreatmentProtocolSerializer(protocol)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def upcoming_protocol_steps(request):
    """
    Get all upcoming protocol steps (next 14 days)
    """
    today = date.today()
    two_weeks_ahead = today + timedelta(days=14)
    
    upcoming = ProtocolStepCompletion.objects.filter(
        status='scheduled',
        scheduled_date__gte=today,
        scheduled_date__lte=two_weeks_ahead
    ).select_related(
        'patient_protocol__patient', 'protocol_step', 'patient_protocol__protocol'
    ).order_by('scheduled_date')
    
    serializer = ProtocolStepCompletionListSerializer(upcoming, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def overdue_protocol_steps(request):
    """
    Get all overdue protocol steps
    """
    overdue = ProtocolStepCompletion.objects.filter(
        status='scheduled',
        scheduled_date__lt=date.today()
    ).select_related(
        'patient_protocol__patient', 'protocol_step', 'patient_protocol__protocol'
    ).order_by('scheduled_date')
    
    serializer = ProtocolStepCompletionListSerializer(overdue, many=True)
    return Response(serializer.data)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def protocol_adherence_report(request):
    """
    Get protocol adherence metrics
    """
    # Adherence by protocol
    adherence_by_protocol = TreatmentProtocol.objects.filter(
        is_active=True
    ).annotate(
        avg_adherence=Avg('patient_assignments__adherence_percentage'),
        total_assignments=Count('patient_assignments')
    ).values('id', 'name', 'code', 'avg_adherence', 'total_assignments')
    
    # Adherence by condition
    adherence_by_condition = TreatmentProtocol.objects.filter(
        is_active=True
    ).values('condition__name').annotate(
        avg_adherence=Avg('patient_assignments__adherence_percentage'),
        total_protocols=Count('id', distinct=True),
        total_assignments=Count('patient_assignments')
    )
    
    return Response({
        'by_protocol': list(adherence_by_protocol),
        'by_condition': list(adherence_by_condition)
    })


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def adverse_events_report(request):
    """
    Get all adverse events from protocol completions
    """
    adverse_events = ProtocolStepCompletion.objects.filter(
        adverse_event=True
    ).select_related(
        'patient_protocol__patient',
        'protocol_step',
        'patient_protocol__protocol',
        'completed_by'
    ).order_by('-completed_date')
    
    serializer = ProtocolStepCompletionSerializer(adverse_events, many=True)
    return Response(serializer.data)


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def bulk_reschedule_steps(request):
    """
    Bulk reschedule multiple protocol steps
    """
    step_ids = request.data.get('step_ids', [])
    days_to_add = request.data.get('days_to_add', 0)
    reason = request.data.get('reason', 'Bulk rescheduling')
    
    if not step_ids:
        return Response(
            {'error': 'step_ids required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    steps = ProtocolStepCompletion.objects.filter(
        id__in=step_ids,
        status='scheduled'
    )
    
    updated_count = 0
    for step in steps:
        step.original_scheduled_date = step.scheduled_date
        step.scheduled_date = step.scheduled_date + timedelta(days=days_to_add)
        step.reschedule_reason = reason
        step.rescheduled_by = request.user
        step.status = 'rescheduled'
        step.save()
        updated_count += 1
    
    return Response({
        'message': f'Successfully rescheduled {updated_count} steps',
        'updated_count': updated_count
    })


# ==================== Protocol Step Details Views ====================


class ProtocolStepMedicationListCreateView(generics.ListCreateAPIView):
    """List or create medications for protocol steps"""
    queryset = ProtocolStepMedication.objects.all().select_related(
        'protocol_step', 'medication'
    ).order_by('protocol_step', 'order')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['protocol_step', 'medication', 'route', 'eye_side']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProtocolStepMedicationCreateSerializer
        return ProtocolStepMedicationSerializer


class ProtocolStepMedicationDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a protocol step medication"""
    queryset = ProtocolStepMedication.objects.all().select_related(
        'protocol_step', 'medication'
    )
    serializer_class = ProtocolStepMedicationSerializer
    permission_classes = [IsAuthenticated]


class ProtocolStepTreatmentListCreateView(generics.ListCreateAPIView):
    """List or create treatments for protocol steps"""
    queryset = ProtocolStepTreatment.objects.all().select_related(
        'protocol_step'
    ).order_by('protocol_step', 'order')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['protocol_step', 'treatment_type', 'eye_side']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProtocolStepTreatmentCreateSerializer
        return ProtocolStepTreatmentSerializer


class ProtocolStepTreatmentDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a protocol step treatment"""
    queryset = ProtocolStepTreatment.objects.all().select_related('protocol_step')
    serializer_class = ProtocolStepTreatmentSerializer
    permission_classes = [IsAuthenticated]


class ProtocolStepTestListCreateView(generics.ListCreateAPIView):
    """List or create tests for protocol steps"""
    queryset = ProtocolStepTest.objects.all().select_related(
        'protocol_step'
    ).order_by('protocol_step', 'order')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend]
    filterset_fields = ['protocol_step', 'test_type', 'eye_side', 'is_baseline']
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return ProtocolStepTestCreateSerializer
        return ProtocolStepTestSerializer


class ProtocolStepTestDetailView(generics.RetrieveUpdateDestroyAPIView):
    """Retrieve, update or delete a protocol step test"""
    queryset = ProtocolStepTest.objects.all().select_related('protocol_step')
    serializer_class = ProtocolStepTestSerializer
    permission_classes = [IsAuthenticated]


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def assign_protocol_to_patient(request):
    """
    Assign a protocol to a patient with detailed step scheduling
    """
    patient_id = request.data.get('patient')
    protocol_id = request.data.get('protocol')
    start_date_str = request.data.get('start_date')
    assignment_reason = request.data.get('assignment_reason', '')
    
    if not all([patient_id, protocol_id, start_date_str]):
        return Response(
            {'error': 'patient, protocol, and start_date are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        start_date = date.fromisoformat(start_date_str)
    except ValueError:
        return Response(
            {'error': 'Invalid start_date format. Use YYYY-MM-DD'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    from patients.models import Patient
    
    try:
        patient = Patient.objects.get(id=patient_id)
        protocol = TreatmentProtocol.objects.get(id=protocol_id)
    except (Patient.DoesNotExist, TreatmentProtocol.DoesNotExist):
        return Response(
            {'error': 'Patient or Protocol not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    
    # Check for existing active protocol
    existing = PatientProtocol.objects.filter(
        patient=patient,
        protocol=protocol,
        status__in=['active', 'pending']
    ).first()
    
    if existing:
        return Response(
            {'error': f'Patient already has an active {protocol.name} protocol'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create patient protocol
    patient_protocol = PatientProtocol.objects.create(
        patient=patient,
        protocol=protocol,
        start_date=start_date,
        status='pending',
        assigned_by=request.user,
        assignment_reason=assignment_reason
    )
    
    # Generate step completions for all protocol steps
    steps = protocol.steps.all().order_by('step_number')
    
    for step in steps:
        # Calculate scheduled date based on timing type
        if step.timing_type == 'fixed':
            scheduled_date = start_date + timedelta(days=step.timing_days)
        elif step.timing_type == 'from_previous':
            # For now, treat same as fixed (will be updated based on actual completion)
            scheduled_date = start_date + timedelta(days=step.timing_days)
        elif step.timing_type == 'weekly':
            # Weekly recurring
            scheduled_date = start_date + timedelta(weeks=step.timing_days)
        elif step.timing_type == 'monthly':
            # Monthly recurring
            scheduled_date = start_date + timedelta(days=step.timing_days * 30)
        else:
            scheduled_date = start_date + timedelta(days=step.timing_days)
        
        # Create main step completion
        step_completion = ProtocolStepCompletion.objects.create(
            patient_protocol=patient_protocol,
            protocol_step=step,
            scheduled_date=scheduled_date,
            status='scheduled'
        )
        
        # If step is recurring, create additional completions
        if step.is_recurring and step.recurrence_count:
            for i in range(1, step.recurrence_count):
                if step.timing_type == 'weekly':
                    next_date = scheduled_date + timedelta(weeks=i)
                elif step.timing_type == 'monthly':
                    next_date = scheduled_date + timedelta(days=i * 30)
                else:
                    next_date = scheduled_date + timedelta(days=step.timing_days * i)
                
                ProtocolStepCompletion.objects.create(
                    patient_protocol=patient_protocol,
                    protocol_step=step,
                    scheduled_date=next_date,
                    status='scheduled'
                )
    
    serializer = PatientProtocolSerializer(patient_protocol)
    return Response(serializer.data, status=status.HTTP_201_CREATED)
