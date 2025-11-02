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
        fields = '__all__'
        read_only_fields = ['id']


class ConsultationDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for ConsultationDocument model
    """
    uploaded_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = ConsultationDocument
        fields = '__all__'
        read_only_fields = ['id', 'uploaded_by_name', 'created_at', 'updated_at']


class ConsultationImageSerializer(serializers.ModelSerializer):
    """
    Serializer for ConsultationImage model
    """
    captured_by_name = serializers.CharField(source='taken_by.get_full_name', read_only=True)
    
    class Meta:
        model = ConsultationImage
        fields = '__all__'
        read_only_fields = ['id', 'captured_by_name', 'created_at', 'updated_at']


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