"""
Serializers for Treatments app
"""
from rest_framework import serializers
from .models import (
    TreatmentCategory, TreatmentType, Treatment, TreatmentMedication,
    TreatmentDocument, TreatmentFollowUp, TreatmentComplication
)
# Note: Import serializers only when needed to avoid circular imports


class TreatmentCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TreatmentCategory
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'created_by')


class TreatmentTypeSerializer(serializers.ModelSerializer):
    category_display = serializers.CharField(source='category.name', read_only=True)
    urgency_display = serializers.CharField(source='get_urgency_level_display', read_only=True)
    anesthesia_display = serializers.CharField(source='get_requires_anesthesia_display', read_only=True)
    
    class Meta:
        model = TreatmentType
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'created_by')


class TreatmentMedicationSerializer(serializers.ModelSerializer):
    medication_name = serializers.CharField(source='medication.name', read_only=True)
    timing_display = serializers.CharField(source='get_timing_display', read_only=True)
    
    class Meta:
        model = TreatmentMedication
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'created_by')


class TreatmentDocumentSerializer(serializers.ModelSerializer):
    document_type_display = serializers.CharField(source='get_document_type_display', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = TreatmentDocument
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'created_by')


class TreatmentFollowUpSerializer(serializers.ModelSerializer):
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    assessed_by_name = serializers.CharField(source='assessed_by.get_full_name', read_only=True)
    
    class Meta:
        model = TreatmentFollowUp
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at')


class TreatmentComplicationSerializer(serializers.ModelSerializer):
    complication_type_display = serializers.CharField(source='get_complication_type_display', read_only=True)
    severity_display = serializers.CharField(source='get_severity_display', read_only=True)
    reported_by_name = serializers.CharField(source='reported_by.get_full_name', read_only=True)
    
    class Meta:
        model = TreatmentComplication
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'reported_by')


class TreatmentSerializer(serializers.ModelSerializer):
    # Related object details
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    consultation_date = serializers.DateTimeField(source='consultation.scheduled_time', read_only=True)
    treatment_type_name = serializers.CharField(source='treatment_type.name', read_only=True)
    treatment_category = serializers.CharField(source='treatment_type.category.name', read_only=True)
    primary_surgeon_name = serializers.CharField(source='primary_surgeon.get_full_name', read_only=True)
    
    # Display fields
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    priority_display = serializers.CharField(source='get_priority_display', read_only=True)
    eye_treated_display = serializers.CharField(source='get_eye_treated_display', read_only=True)
    outcome_display = serializers.CharField(source='get_outcome_display', read_only=True)
    anesthesia_display = serializers.CharField(source='get_anesthesia_used_display', read_only=True)
    
    # Calculated fields
    duration_minutes = serializers.ReadOnlyField()
    
    # Related objects (nested)
    medications = TreatmentMedicationSerializer(many=True, read_only=True)
    documents = TreatmentDocumentSerializer(many=True, read_only=True)
    follow_ups = TreatmentFollowUpSerializer(many=True, read_only=True)
    complications = TreatmentComplicationSerializer(many=True, read_only=True)
    
    class Meta:
        model = Treatment
        fields = '__all__'
        read_only_fields = ('id', 'created_at', 'updated_at', 'created_by', 'duration_minutes')


class TreatmentBasicSerializer(serializers.ModelSerializer):
    """Simplified serializer for list views"""
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    treatment_type_name = serializers.CharField(source='treatment_type.name', read_only=True)
    primary_surgeon_name = serializers.CharField(source='primary_surgeon.get_full_name', read_only=True)
    status_display = serializers.CharField(source='get_status_display', read_only=True)
    eye_treated_display = serializers.CharField(source='get_eye_treated_display', read_only=True)
    
    class Meta:
        model = Treatment
        fields = [
            'id', 'patient', 'patient_name', 'treatment_type', 'treatment_type_name',
            'eye_treated', 'eye_treated_display', 'status', 'status_display',
            'primary_surgeon', 'primary_surgeon_name', 'scheduled_date',
            'actual_start_time', 'actual_end_time', 'outcome', 'created_at'
        ]


class TreatmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating new treatments"""
    class Meta:
        model = Treatment
        fields = [
            'patient', 'consultation', 'treatment_type', 'eye_treated',
            'priority', 'primary_surgeon', 'assisting_staff', 'scheduled_date',
            'indication', 'technique_notes', 'anesthesia_used', 'consent_obtained',
            'consent_date', 'consent_obtained_by', 'requires_follow_up',
            'follow_up_weeks', 'follow_up_instructions'
        ]
        
    def validate(self, data):
        """Custom validation for treatment creation"""
        # Ensure consent is obtained for procedures requiring it
        if data.get('treatment_type') and data['treatment_type'].requires_consent:
            if not data.get('consent_obtained', False):
                raise serializers.ValidationError(
                    "Consent must be obtained for this treatment type."
                )
            if not data.get('consent_date'):
                raise serializers.ValidationError(
                    "Consent date must be provided when consent is required."
                )
        
        # Validate scheduled date is not in the past for non-emergency treatments
        if data.get('scheduled_date') and data.get('priority') != 'emergency':
            from django.utils import timezone
            if data['scheduled_date'] < timezone.now():
                raise serializers.ValidationError(
                    "Scheduled date cannot be in the past for non-emergency treatments."
                )
        
        return data