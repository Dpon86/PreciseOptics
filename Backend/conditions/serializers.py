"""
Serializers for conditions app
"""
from rest_framework import serializers
from .models import MedicalCondition, PatientCondition, ConditionProgress, ConditionDocument
from accounts.serializers import CustomUserSerializer
from patients.serializers import PatientSerializer
from precise_optics.file_validators import validate_document_extension, validate_file_size


class MedicalConditionSerializer(serializers.ModelSerializer):
    """
    Serializer for MedicalCondition model
    """
    created_by_details = CustomUserSerializer(source='created_by', read_only=True)
    patient_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MedicalCondition
        fields = [
            'id', 'code', 'name', 'category', 'description', 'symptoms',
            'risk_factors', 'typical_progression', 'standard_treatments',
            'prognosis', 'has_standard_protocol', 'protocol_description',
            'is_active', 'created_at', 'updated_at', 'created_by',
            'created_by_details', 'patient_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_patient_count(self, obj):
        """Get count of active patients with this condition"""
        return obj.patient_cases.filter(is_active=True).count()


class MedicalConditionListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing conditions
    """
    patient_count = serializers.SerializerMethodField()
    
    class Meta:
        model = MedicalCondition
        fields = ['id', 'code', 'name', 'category', 'has_standard_protocol', 
                  'is_active', 'patient_count']
    
    def get_patient_count(self, obj):
        return obj.patient_cases.filter(is_active=True).count()


class ConditionProgressSerializer(serializers.ModelSerializer):
    """
    Serializer for ConditionProgress model
    """
    assessed_by_details = CustomUserSerializer(source='assessed_by', read_only=True)
    patient_name = serializers.SerializerMethodField()
    condition_name = serializers.SerializerMethodField()
    
    class Meta:
        model = ConditionProgress
        fields = [
            'id', 'patient_condition', 'assessment_date', 'assessment_type',
            'assessed_by', 'assessed_by_details', 'status_change',
            'severity_at_assessment', 'measurements', 'clinical_findings',
            'subjective_symptoms', 'treatment_changes', 'medications_adjusted',
            'next_assessment_date', 'next_assessment_reason', 'assessment_notes',
            'images_attached', 'created_at', 'updated_at', 'patient_name',
            'condition_name'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']
    
    def get_patient_name(self, obj):
        return obj.patient_condition.patient.get_full_name()
    
    def get_condition_name(self, obj):
        return obj.patient_condition.condition.name


class ConditionProgressListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing progress records
    """
    assessed_by_name = serializers.CharField(source='assessed_by.get_full_name', read_only=True)
    
    class Meta:
        model = ConditionProgress
        fields = ['id', 'assessment_date', 'assessment_type', 'status_change',
                  'severity_at_assessment', 'assessed_by_name']


class ConditionDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for ConditionDocument model
    """
    uploaded_by_details = CustomUserSerializer(source='uploaded_by', read_only=True)
    file_name = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = ConditionDocument
        fields = [
            'id', 'patient_condition', 'progress_record', 'document_type',
            'title', 'description', 'file', 'uploaded_by', 'uploaded_by_details',
            'uploaded_at', 'file_name', 'file_size'
        ]
        read_only_fields = ['id', 'uploaded_at']
    
    def validate_file(self, value):
        validate_document_extension(value)
        validate_file_size(value)
        return value
    
    def get_file_name(self, obj):
        if obj.file:
            return obj.file.name.split('/')[-1]
        return None
    
    def get_file_size(self, obj):
        if obj.file:
            return obj.file.size
        return None


class PatientConditionSerializer(serializers.ModelSerializer):
    """
    Serializer for PatientCondition model
    """
    patient_details = PatientSerializer(source='patient', read_only=True)
    condition_details = MedicalConditionSerializer(source='condition', read_only=True)
    diagnosed_by_details = CustomUserSerializer(source='diagnosed_by', read_only=True)
    progress_records = ConditionProgressListSerializer(many=True, read_only=True)
    documents = ConditionDocumentSerializer(many=True, read_only=True)
    latest_progress = serializers.SerializerMethodField()
    days_since_diagnosis = serializers.SerializerMethodField()
    days_until_next_assessment = serializers.SerializerMethodField()
    
    class Meta:
        model = PatientCondition
        fields = [
            'id', 'patient', 'patient_details', 'condition', 'condition_details',
            'diagnosis_date', 'diagnosed_by', 'diagnosed_by_details', 'severity',
            'eye_affected', 'current_status', 'initial_measurements',
            'treatment_plan', 'medications_prescribed', 'last_assessment_date',
            'next_assessment_date', 'diagnosis_notes', 'patient_notes',
            'is_active', 'resolved_date', 'resolution_notes', 'created_at',
            'updated_at', 'progress_records', 'documents', 'latest_progress',
            'days_since_diagnosis', 'days_until_next_assessment'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'last_assessment_date']
    
    def get_latest_progress(self, obj):
        latest = obj.progress_records.first()
        if latest:
            return ConditionProgressListSerializer(latest).data
        return None
    
    def get_days_since_diagnosis(self, obj):
        from datetime import date
        delta = date.today() - obj.diagnosis_date
        return delta.days
    
    def get_days_until_next_assessment(self, obj):
        if obj.next_assessment_date:
            from datetime import date
            delta = obj.next_assessment_date - date.today()
            return delta.days
        return None


class PatientConditionListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing patient conditions
    """
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    patient_id = serializers.CharField(source='patient.patient_id', read_only=True)
    condition_name = serializers.CharField(source='condition.name', read_only=True)
    condition_code = serializers.CharField(source='condition.code', read_only=True)
    diagnosed_by_name = serializers.CharField(source='diagnosed_by.get_full_name', read_only=True)
    progress_count = serializers.SerializerMethodField()
    
    class Meta:
        model = PatientCondition
        fields = [
            'id', 'patient', 'patient_name', 'patient_id', 'condition',
            'condition_name', 'condition_code', 'diagnosis_date', 'severity',
            'eye_affected', 'current_status', 'diagnosed_by_name',
            'last_assessment_date', 'next_assessment_date', 'is_active',
            'progress_count'
        ]
    
    def get_progress_count(self, obj):
        return obj.progress_records.count()


class PatientConditionCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating patient conditions
    """
    class Meta:
        model = PatientCondition
        fields = [
            'patient', 'condition', 'diagnosis_date', 'diagnosed_by',
            'severity', 'eye_affected', 'current_status', 'initial_measurements',
            'treatment_plan', 'medications_prescribed', 'next_assessment_date',
            'diagnosis_notes', 'patient_notes'
        ]
    
    def validate(self, attrs):
        """Validate that the patient doesn't already have this active condition"""
        patient = attrs.get('patient')
        condition = attrs.get('condition')
        
        # Check for existing active condition
        existing = PatientCondition.objects.filter(
            patient=patient,
            condition=condition,
            is_active=True
        ).exists()
        
        if existing:
            raise serializers.ValidationError(
                f"Patient already has an active {condition.name} condition."
            )
        
        return attrs


class ConditionStatisticsSerializer(serializers.Serializer):
    """
    Serializer for condition statistics
    """
    total_conditions = serializers.IntegerField()
    active_conditions = serializers.IntegerField()
    total_patient_conditions = serializers.IntegerField()
    active_patient_conditions = serializers.IntegerField()
    conditions_by_category = serializers.DictField()
    conditions_by_severity = serializers.DictField()
    recent_diagnoses = serializers.IntegerField()
    upcoming_assessments = serializers.IntegerField()
    overdue_assessments = serializers.IntegerField()


class ConditionProgressCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating progress records
    """
    class Meta:
        model = ConditionProgress
        fields = [
            'patient_condition', 'assessment_date', 'assessment_type',
            'assessed_by', 'status_change', 'severity_at_assessment',
            'measurements', 'clinical_findings', 'subjective_symptoms',
            'treatment_changes', 'medications_adjusted', 'next_assessment_date',
            'next_assessment_reason', 'assessment_notes', 'images_attached'
        ]
    
    def validate(self, attrs):
        """Validate assessment date is not in the future"""
        from datetime import date
        assessment_date = attrs.get('assessment_date')
        
        if assessment_date > date.today():
            raise serializers.ValidationError(
                "Assessment date cannot be in the future."
            )
        
        return attrs
