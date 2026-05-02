"""
Serializers for protocols app
"""
from rest_framework import serializers
from django.utils import timezone
from datetime import timedelta
from .models import (
    TreatmentProtocol, ProtocolStep, PatientProtocol,
    ProtocolStepCompletion, ConsentForm,
    ProtocolStepMedication, ProtocolStepTreatment, ProtocolStepTest
)
from conditions.serializers import MedicalConditionSerializer
from medications.serializers import MedicationSerializer
from patients.serializers import PatientSerializer
from accounts.serializers import CustomUserSerializer
from precise_optics.file_validators import validate_document_extension, validate_file_size
from .serializers_enhanced import (
    ProtocolStepMedicationSerializer, ProtocolStepTreatmentSerializer,
    ProtocolStepTestSerializer
)


# ==================== Treatment Protocol Serializers ====================

class ProtocolStepListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for protocol steps in lists"""
    step_type_display = serializers.CharField(source='get_step_type_display', read_only=True)
    medication_name = serializers.CharField(source='medication.name', read_only=True)
    
    class Meta:
        model = ProtocolStep
        fields = [
            'id', 'step_number', 'title', 'step_type', 'step_type_display',
            'timing_days', 'medication_name', 'is_mandatory'
        ]


class ProtocolStepSerializer(serializers.ModelSerializer):
    """Full serializer for protocol step details with nested medications, treatments, and tests"""
    step_type_display = serializers.CharField(source='get_step_type_display', read_only=True)
    timing_type_display = serializers.CharField(source='get_timing_type_display', read_only=True)
    medication_details = MedicationSerializer(source='medication', read_only=True)
    timing_window_days = serializers.SerializerMethodField()
    
    # Nested serializers for multiple items
    medications = ProtocolStepMedicationSerializer(many=True, read_only=True)
    treatments = ProtocolStepTreatmentSerializer(many=True, read_only=True)
    tests = ProtocolStepTestSerializer(many=True, read_only=True)
    
    # Branching information
    branch_condition_display = serializers.CharField(source='get_branch_condition_type_display', read_only=True)
    child_branches = serializers.SerializerMethodField()
    parent_step_info = serializers.SerializerMethodField()
    
    class Meta:
        model = ProtocolStep
        fields = [
            'id', 'protocol', 'step_number', 'step_type', 'step_type_display',
            'title', 'description', 'timing_type', 'timing_type_display',
            'timing_days', 'timing_window_before', 'timing_window_after',
            'timing_window_days', 'is_recurring', 'recurrence_count',
            'medication', 'medication_details', 'medication_dosage',
            'medication_route', 'required_test_type', 'pre_instructions',
            'post_instructions', 'has_branches', 'branch_condition_type',
            'branch_condition_display', 'branch_logic', 'parent_step',
            'parent_step_info', 'branch_label', 'child_branches',
            'is_mandatory', 'can_be_rescheduled', 'medications',
            'treatments', 'tests', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_timing_window_days(self, obj):
        """Return the total flexibility window"""
        return {
            'earliest': obj.timing_days - obj.timing_window_before,
            'latest': obj.timing_days + obj.timing_window_after,
            'target': obj.timing_days
        }
    
    def get_child_branches(self, obj):
        """Return information about child branch steps"""
        if not obj.has_branches:
            return []
        
        branches = obj.child_branches.all()
        return [{
            'id': str(branch.id),
            'step_number': branch.step_number,
            'title': branch.title,
            'branch_label': branch.branch_label
        } for branch in branches]
    
    def get_parent_step_info(self, obj):
        """Return parent step info if this is a branch"""
        if obj.parent_step:
            return {
                'id': str(obj.parent_step.id),
                'step_number': obj.parent_step.step_number,
                'title': obj.parent_step.title
            }
        return None


class TreatmentProtocolListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for protocol lists"""
    protocol_type_display = serializers.CharField(source='get_protocol_type_display', read_only=True)
    condition_name = serializers.CharField(source='condition.name', read_only=True)
    condition_code = serializers.CharField(source='condition.code', read_only=True)
    step_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TreatmentProtocol
        fields = [
            'id', 'name', 'code', 'protocol_type', 'protocol_type_display',
            'condition', 'condition_name', 'condition_code',
            'total_duration_weeks', 'requires_consent', 'step_count', 'is_active'
        ]
    
    def get_step_count(self, obj):
        """Return number of steps in protocol"""
        return obj.steps.count()


class TreatmentProtocolSerializer(serializers.ModelSerializer):
    """Full serializer for protocol details"""
    protocol_type_display = serializers.CharField(source='get_protocol_type_display', read_only=True)
    condition_details = MedicalConditionSerializer(source='condition', read_only=True)
    created_by_details = CustomUserSerializer(source='created_by', read_only=True)
    steps = ProtocolStepListSerializer(many=True, read_only=True)
    active_patient_count = serializers.SerializerMethodField()
    total_assigned_count = serializers.SerializerMethodField()
    
    class Meta:
        model = TreatmentProtocol
        fields = [
            'id', 'name', 'code', 'protocol_type', 'protocol_type_display',
            'condition', 'condition_details', 'description', 'indications',
            'contraindications', 'total_duration_weeks', 'repeat_interval_weeks',
            'requires_consent', 'consent_type', 'expected_outcomes',
            'potential_side_effects', 'monitoring_requirements', 'is_active',
            'created_by', 'created_by_details', 'steps', 'active_patient_count',
            'total_assigned_count', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_active_patient_count(self, obj):
        """Count of active patient protocol assignments"""
        return obj.patient_assignments.filter(status='active').count()
    
    def get_total_assigned_count(self, obj):
        """Total count of all protocol assignments"""
        return obj.patient_assignments.count()


class TreatmentProtocolCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating protocols"""
    
    class Meta:
        model = TreatmentProtocol
        fields = [
            'name', 'code', 'protocol_type', 'condition', 'description',
            'indications', 'contraindications', 'total_duration_weeks',
            'repeat_interval_weeks', 'requires_consent', 'consent_type',
            'expected_outcomes', 'potential_side_effects',
            'monitoring_requirements', 'is_active', 'created_by'
        ]
    
    def validate_code(self, value):
        """Ensure protocol code is unique"""
        if TreatmentProtocol.objects.filter(code=value).exists():
            raise serializers.ValidationError("Protocol with this code already exists.")
        return value.upper()


# ==================== Patient Protocol Serializers ====================

class PatientProtocolListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for patient protocol lists"""
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    protocol_name = serializers.CharField(source='protocol.name', read_only=True)
    protocol_code = serializers.CharField(source='protocol.code', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    days_remaining = serializers.SerializerMethodField()
    
    class Meta:
        model = PatientProtocol
        fields = [
            'id', 'patient', 'patient_name', 'patient_id', 'protocol',
            'protocol_name', 'protocol_code', 'status', 'status_display',
            'start_date', 'expected_end_date', 'current_step_number',
            'total_steps_completed', 'adherence_percentage', 'days_remaining'
        ]
    
    def get_days_remaining(self, obj):
        """Calculate days until expected end date"""
        if obj.expected_end_date:
            delta = (obj.expected_end_date - timezone.now().date()).days
            return delta
        return None


class PatientProtocolSerializer(serializers.ModelSerializer):
    """Full serializer for patient protocol details"""
    patient_details = PatientSerializer(source='patient', read_only=True)
    protocol_details = TreatmentProtocolSerializer(source='protocol', read_only=True)
    assigned_by_details = CustomUserSerializer(source='assigned_by', read_only=True)
    discontinued_by_details = CustomUserSerializer(source='discontinued_by', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    completion_progress = serializers.SerializerMethodField()
    upcoming_steps = serializers.SerializerMethodField()
    
    class Meta:
        model = PatientProtocol
        fields = [
            'id', 'patient', 'patient_details', 'protocol', 'protocol_details',
            'status', 'status_display', 'start_date', 'actual_start_date',
            'expected_end_date', 'actual_end_date', 'assigned_by',
            'assigned_by_details', 'assigned_date', 'assignment_reason',
            'discontinuation_reason', 'discontinued_by', 'discontinued_by_details',
            'discontinuation_date', 'completion_notes', 'outcome_assessment',
            'protocol_modifications', 'current_step_number',
            'total_steps_completed', 'adherence_percentage',
            'completion_progress', 'upcoming_steps', 'created_at', 'updated_at'
        ]
        read_only_fields = ['assigned_date', 'created_at', 'updated_at', 'adherence_percentage']
    
    def get_completion_progress(self, obj):
        """Return completion statistics"""
        total_steps = obj.protocol.steps.count()
        completed = obj.step_completions.filter(status='completed').count()
        missed = obj.step_completions.filter(status='missed').count()
        
        return {
            'total_steps': total_steps,
            'completed': completed,
            'missed': missed,
            'remaining': total_steps - completed - missed,
            'completion_percentage': (completed / total_steps * 100) if total_steps > 0 else 0
        }
    
    def get_upcoming_steps(self, obj):
        """Return next 3 upcoming scheduled steps"""
        upcoming = obj.step_completions.filter(
            status='scheduled',
            scheduled_date__gte=timezone.now().date()
        ).order_by('scheduled_date')[:3]
        
        return ProtocolStepCompletionListSerializer(upcoming, many=True).data


class PatientProtocolCreateSerializer(serializers.ModelSerializer):
    """Serializer for assigning protocol to patient"""
    
    class Meta:
        model = PatientProtocol
        fields = [
            'patient', 'protocol', 'start_date', 'assigned_by',
            'assignment_reason', 'protocol_modifications'
        ]
    
    def validate(self, data):
        """Validate protocol assignment"""
        patient = data.get('patient')
        protocol = data.get('protocol')
        
        # Check if patient already has active protocol of same type
        active_protocol = PatientProtocol.objects.filter(
            patient=patient,
            protocol=protocol,
            status__in=['active', 'pending']
        ).exists()
        
        if active_protocol:
            raise serializers.ValidationError(
                f"Patient already has an active {protocol.name} protocol."
            )
        
        # Check if protocol requires consent
        if protocol.requires_consent:
            has_valid_consent = ConsentForm.objects.filter(
                patient=patient,
                protocol=protocol,
                status='obtained'
            ).exists()
            
            if not has_valid_consent:
                raise serializers.ValidationError(
                    f"Valid consent required for {protocol.name} protocol."
                )
        
        return data
    
    def create(self, validated_data):
        """Create patient protocol and generate step schedule"""
        patient_protocol = PatientProtocol.objects.create(**validated_data)
        
        # Auto-generate step completions based on protocol steps
        protocol_steps = patient_protocol.protocol.steps.all().order_by('step_number')
        start_date = patient_protocol.start_date
        
        for step in protocol_steps:
            scheduled_date = start_date + timedelta(days=step.timing_days)
            
            ProtocolStepCompletion.objects.create(
                patient_protocol=patient_protocol,
                protocol_step=step,
                scheduled_date=scheduled_date,
                status='scheduled'
            )
        
        return patient_protocol


# ==================== Protocol Step Completion Serializers ====================

class ProtocolStepCompletionListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for step completion lists"""
    step_title = serializers.CharField(source='protocol_step.title', read_only=True)
    step_type = serializers.CharField(source='protocol_step.step_type', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    outcome_display = serializers.CharField(source='get_outcome_display', read_only=True)
    
    class Meta:
        model = ProtocolStepCompletion
        fields = [
            'id', 'protocol_step', 'step_title', 'step_type',
            'scheduled_date', 'status', 'status_display',
            'completed_date', 'outcome', 'outcome_display',
            'completed_within_window', 'adverse_event'
        ]


class ProtocolStepCompletionSerializer(serializers.ModelSerializer):
    """Full serializer for step completion details"""
    patient_protocol_details = PatientProtocolListSerializer(source='patient_protocol', read_only=True)
    protocol_step_details = ProtocolStepSerializer(source='protocol_step', read_only=True)
    completed_by_details = CustomUserSerializer(source='completed_by', read_only=True)
    rescheduled_by_details = CustomUserSerializer(source='rescheduled_by', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    outcome_display = serializers.CharField(source='get_outcome_display', read_only=True)
    
    class Meta:
        model = ProtocolStepCompletion
        fields = [
            'id', 'patient_protocol', 'patient_protocol_details',
            'protocol_step', 'protocol_step_details', 'scheduled_date',
            'scheduled_time', 'status', 'status_display', 'completed_date',
            'completed_time', 'completed_by', 'completed_by_details',
            'outcome', 'outcome_display', 'clinical_notes', 'measurements',
            'adverse_event', 'adverse_event_description', 'original_scheduled_date',
            'reschedule_reason', 'rescheduled_by', 'rescheduled_by_details',
            'next_step_date', 'completed_within_window', 'days_variance',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at', 'days_variance', 'completed_within_window']


class ProtocolStepCompletionCreateSerializer(serializers.ModelSerializer):
    """Serializer for marking step as complete"""
    
    class Meta:
        model = ProtocolStepCompletion
        fields = [
            'patient_protocol', 'protocol_step', 'completed_date',
            'completed_time', 'completed_by', 'outcome', 'clinical_notes',
            'measurements', 'adverse_event', 'adverse_event_description'
        ]
    
    def validate_completed_date(self, value):
        """Ensure completed date is not in the future"""
        if value > timezone.now().date():
            raise serializers.ValidationError("Completion date cannot be in the future.")
        return value
    
    def update(self, instance, validated_data):
        """Update step completion and calculate compliance"""
        instance = super().update(instance, validated_data)
        instance.status = 'completed'
        instance.calculate_compliance()
        instance.save()
        
        # Update patient protocol stats
        patient_protocol = instance.patient_protocol
        patient_protocol.total_steps_completed = patient_protocol.step_completions.filter(
            status='completed'
        ).count()
        
        # Calculate adherence percentage
        total_steps = patient_protocol.step_completions.count()
        on_time_steps = patient_protocol.step_completions.filter(
            completed_within_window=True
        ).count()
        
        if total_steps > 0:
            patient_protocol.adherence_percentage = (on_time_steps / total_steps) * 100
        
        patient_protocol.save()
        
        return instance


# ==================== Consent Form Serializers ====================

class ConsentFormListSerializer(serializers.ModelSerializer):
    """Lightweight serializer for consent form lists"""
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    protocol_name = serializers.CharField(source='protocol.name', read_only=True, allow_null=True)
    consent_type_display = serializers.CharField(source='get_consent_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_valid_consent = serializers.SerializerMethodField()
    
    class Meta:
        model = ConsentForm
        fields = [
            'id', 'patient', 'patient_name', 'protocol', 'protocol_name',
            'title', 'consent_type', 'consent_type_display', 'status',
            'status_display', 'consent_given_date', 'expiry_date',
            'is_valid_consent'
        ]
    
    def get_is_valid_consent(self, obj):
        """Check if consent is currently valid"""
        return obj.is_valid()


class ConsentFormSerializer(serializers.ModelSerializer):
    """Full serializer for consent form details"""
    patient_details = PatientSerializer(source='patient', read_only=True)
    protocol_details = TreatmentProtocolListSerializer(source='protocol', read_only=True)
    patient_protocol_details = PatientProtocolListSerializer(source='patient_protocol', read_only=True)
    obtained_by_details = CustomUserSerializer(source='obtained_by', read_only=True)
    witnessed_by_details = CustomUserSerializer(source='witnessed_by', read_only=True)
    consent_type_display = serializers.CharField(source='get_consent_type_display', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    is_valid_consent = serializers.SerializerMethodField()
    
    class Meta:
        model = ConsentForm
        fields = [
            'id', 'patient', 'patient_details', 'protocol', 'protocol_details',
            'patient_protocol', 'patient_protocol_details', 'consent_type',
            'consent_type_display', 'title', 'description', 'status',
            'status_display', 'consent_given_date', 'consent_given_time',
            'expiry_date', 'consent_document', 'obtained_by',
            'obtained_by_details', 'witnessed_by', 'witnessed_by_details',
            'patient_signature', 'patient_understood', 'interpreter_used',
            'interpreter_name', 'withdrawal_date', 'withdrawal_reason',
            'notes', 'is_valid_consent', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_is_valid_consent(self, obj):
        """Check if consent is currently valid"""
        return obj.is_valid()


class ConsentFormCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating consent forms"""
    
    class Meta:
        model = ConsentForm
        fields = [
            'patient', 'protocol', 'patient_protocol', 'consent_type',
            'title', 'description', 'consent_given_date', 'consent_given_time',
            'expiry_date', 'consent_document', 'obtained_by', 'witnessed_by',
            'patient_signature', 'patient_understood', 'interpreter_used',
            'interpreter_name', 'notes'
        ]
    
    def validate_consent_document(self, value):
        if value:
            validate_document_extension(value)
            validate_file_size(value)
        return value

    def validate(self, data):
        """Validate consent form data"""
        if data.get('interpreter_used') and not data.get('interpreter_name'):
            raise serializers.ValidationError(
                "Interpreter name required when interpreter is used."
            )
        
        if data.get('consent_given_date') and data.get('consent_given_date') > timezone.now().date():
            raise serializers.ValidationError(
                "Consent date cannot be in the future."
            )
        
        return data
    
    def create(self, validated_data):
        """Create consent form and set status"""
        consent_form = ConsentForm.objects.create(
            **validated_data,
            status='obtained' if validated_data.get('consent_given_date') else 'pending'
        )
        return consent_form


# ==================== Statistics Serializers ====================

class ProtocolStatisticsSerializer(serializers.Serializer):
    """Serializer for protocol statistics"""
    total_protocols = serializers.IntegerField()
    active_protocols = serializers.IntegerField()
    protocols_by_type = serializers.DictField()
    protocols_by_condition = serializers.DictField()
    active_patient_protocols = serializers.IntegerField()
    completed_patient_protocols = serializers.IntegerField()
    average_adherence = serializers.FloatField()
    pending_consents = serializers.IntegerField()
    expired_consents = serializers.IntegerField()
