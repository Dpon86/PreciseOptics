"""
Enhanced serializers for protocol steps with medications, treatments, and tests
"""
from rest_framework import serializers
from .models import (
    ProtocolStepMedication, ProtocolStepTreatment, ProtocolStepTest
)
from medications.serializers import MedicationSerializer


class ProtocolStepMedicationSerializer(serializers.ModelSerializer):
    """Serializer for medications within a protocol step"""
    medication_details = MedicationSerializer(source='medication', read_only=True)
    route_display = serializers.SerializerMethodField()
    eye_side_display = serializers.SerializerMethodField()
    
    class Meta:
        model = ProtocolStepMedication
        fields = [
            'id', 'protocol_step', 'medication', 'medication_details',
            'dosage_amount', 'dosage_unit', 'route', 'route_display',
            'frequency', 'duration_days', 'administer_at_same_time',
            'offset_days', 'special_instructions', 'eye_side',
            'eye_side_display', 'order', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_route_display(self, obj):
        return obj.get_route_display()
    
    def get_eye_side_display(self, obj):
        return obj.get_eye_side_display() if obj.eye_side else None


class ProtocolStepMedicationCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating protocol step medications"""
    
    class Meta:
        model = ProtocolStepMedication
        fields = [
            'protocol_step', 'medication', 'dosage_amount', 'dosage_unit',
            'route', 'frequency', 'duration_days', 'administer_at_same_time',
            'offset_days', 'special_instructions', 'eye_side', 'order'
        ]


class ProtocolStepTreatmentSerializer(serializers.ModelSerializer):
    """Serializer for treatments within a protocol step"""
    treatment_type_display = serializers.SerializerMethodField()
    eye_side_display = serializers.SerializerMethodField()
    
    class Meta:
        model = ProtocolStepTreatment
        fields = [
            'id', 'protocol_step', 'treatment_type', 'treatment_type_display',
            'treatment_name', 'description', 'administer_at_same_time',
            'offset_days', 'eye_side', 'eye_side_display',
            'expected_duration_minutes', 'requires_anesthesia',
            'anesthesia_type', 'special_instructions', 'order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_treatment_type_display(self, obj):
        return obj.get_treatment_type_display()
    
    def get_eye_side_display(self, obj):
        return obj.get_eye_side_display() if obj.eye_side else None


class ProtocolStepTreatmentCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating protocol step treatments"""
    
    class Meta:
        model = ProtocolStepTreatment
        fields = [
            'protocol_step', 'treatment_type', 'treatment_name', 'description',
            'administer_at_same_time', 'offset_days', 'eye_side',
            'expected_duration_minutes', 'requires_anesthesia',
            'anesthesia_type', 'special_instructions', 'order'
        ]


class ProtocolStepTestSerializer(serializers.ModelSerializer):
    """Serializer for tests within a protocol step"""
    test_type_display = serializers.SerializerMethodField()
    eye_side_display = serializers.SerializerMethodField()
    
    class Meta:
        model = ProtocolStepTest
        fields = [
            'id', 'protocol_step', 'test_type', 'test_type_display',
            'test_name', 'description', 'administer_at_same_time',
            'offset_days', 'eye_side', 'eye_side_display', 'is_baseline',
            'expected_values', 'special_instructions', 'order',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
    
    def get_test_type_display(self, obj):
        return obj.get_test_type_display()
    
    def get_eye_side_display(self, obj):
        return obj.get_eye_side_display() if obj.eye_side else None


class ProtocolStepTestCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating protocol step tests"""
    
    class Meta:
        model = ProtocolStepTest
        fields = [
            'protocol_step', 'test_type', 'test_name', 'description',
            'administer_at_same_time', 'offset_days', 'eye_side',
            'is_baseline', 'expected_values', 'special_instructions', 'order'
        ]
