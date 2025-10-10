"""
Serializers for PreciseOptics Eye Hospital Management System - Consultations
"""
from rest_framework import serializers
from .models import Consultation, VitalSigns, ConsultationDocument, ConsultationImage


class VitalSignsSerializer(serializers.ModelSerializer):
    """
    Serializer for VitalSigns model
    """
    class Meta:
        model = VitalSigns
        fields = [
            'id', 'consultation', 'systolic_bp', 'diastolic_bp', 'heart_rate',
            'respiratory_rate', 'temperature', 'oxygen_saturation', 'weight',
            'height', 'bmi', 'blood_glucose', 'pain_scale', 'recorded_by',
            'recorded_at', 'notes'
        ]
        read_only_fields = ['id', 'bmi', 'recorded_at']


class ConsultationDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for ConsultationDocument model
    """
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = ConsultationDocument
        fields = [
            'id', 'consultation', 'document_type', 'title', 'description',
            'document_file', 'file_size', 'uploaded_by', 'uploaded_by_name',
            'uploaded_at', 'is_active'
        ]
        read_only_fields = ['id', 'uploaded_by_name', 'file_size', 'uploaded_at']


class ConsultationImageSerializer(serializers.ModelSerializer):
    """
    Serializer for ConsultationImage model
    """
    captured_by_name = serializers.CharField(source='captured_by.get_full_name', read_only=True)
    
    class Meta:
        model = ConsultationImage
        fields = [
            'id', 'consultation', 'image_type', 'eye_side', 'title', 'description',
            'image_file', 'file_size', 'captured_by', 'captured_by_name',
            'captured_at', 'image_metadata', 'is_active'
        ]
        read_only_fields = ['id', 'captured_by_name', 'file_size', 'captured_at']


class ConsultationSerializer(serializers.ModelSerializer):
    """
    Serializer for Consultation model
    """
    patient_name = serializers.CharField(source='patient.first_name', read_only=True)
    doctor_name = serializers.CharField(source='consulting_doctor.get_full_name', read_only=True)
    vital_signs = VitalSignsSerializer(read_only=True)
    documents = ConsultationDocumentSerializer(many=True, read_only=True)
    images = ConsultationImageSerializer(many=True, read_only=True)
    duration_minutes = serializers.SerializerMethodField()
    
    class Meta:
        model = Consultation
        fields = [
            'id', 'patient', 'patient_name', 'visit', 'consulting_doctor', 'doctor_name',
            'consultation_type', 'status', 'scheduled_time', 'actual_start_time', 'actual_end_time',
            'duration_minutes', 'chief_complaint', 'history_of_present_illness', 'past_ocular_history',
            'past_medical_history', 'family_history', 'allergies', 'current_medications', 'social_history',
            'general_examination', 'clinical_impression', 'diagnosis_primary', 'diagnosis_secondary',
            'treatment_plan', 'follow_up_required', 'follow_up_duration', 'follow_up_instructions',
            'referral_required', 'referral_to', 'referral_reason', 'consultation_notes',
            'vital_signs', 'documents', 'images', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'patient_name', 'doctor_name', 'duration_minutes', 
                           'vital_signs', 'documents', 'images', 'created_at', 'updated_at']
    
    def get_duration_minutes(self, obj):
        """Calculate consultation duration in minutes"""
        if obj.actual_start_time and obj.actual_end_time:
            delta = obj.actual_end_time - obj.actual_start_time
            return int(delta.total_seconds() / 60)
        return None


class ConsultationCreateSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for creating consultations
    """
    class Meta:
        model = Consultation
        fields = [
            'patient', 'visit', 'consulting_doctor', 'consultation_type',
            'scheduled_time', 'chief_complaint', 'history_of_present_illness',
            'past_ocular_history', 'past_medical_history', 'allergies', 'current_medications'
        ]