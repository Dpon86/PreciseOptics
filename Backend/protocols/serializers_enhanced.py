"""
Enhanced serializers for protocol steps with medications, treatments, and tests
"""
from rest_framework import serializers
from .models import (
    ProtocolStepMedication, ProtocolStepTreatment, ProtocolStepTest,
    ProtocolStepResult, ProtocolStep
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


class ProtocolStepResultSerializer(serializers.ModelSerializer):
    """Serializer for protocol step results and evaluations"""
    result_type_display = serializers.SerializerMethodField()
    result_display = serializers.SerializerMethodField()
    evaluated_by_name = serializers.CharField(source='evaluated_by.get_full_name', read_only=True)
    step_title = serializers.CharField(source='step_completion.protocol_step.title', read_only=True)
    
    class Meta:
        model = ProtocolStepResult
        fields = [
            'id', 'step_completion', 'result_type', 'result_type_display',
            'result_label', 'result_value_text', 'result_value_numeric',
            'result_value_choice', 'result_value_json', 'result_display',
            'evaluation_notes', 'meets_criteria', 'triggers_branch',
            'branch_taken', 'next_step_override', 'evaluated_by',
            'evaluated_by_name', 'evaluated_at', 'step_title'
        ]
        read_only_fields = ['evaluated_at', 'triggers_branch', 'branch_taken']
    
    def get_result_type_display(self, obj):
        return obj.get_result_type_display()
    
    def get_result_display(self, obj):
        return obj.get_result_display()


class ProtocolStepResultCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating protocol step results"""
    
    class Meta:
        model = ProtocolStepResult
        fields = [
            'step_completion', 'result_type', 'result_label',
            'result_value_text', 'result_value_numeric', 'result_value_choice',
            'result_value_json', 'evaluation_notes', 'meets_criteria',
            'evaluated_by'
        ]
    
    def create(self, validated_data):
        """Create result and evaluate branching logic"""
        result = super().create(validated_data)
        
        # Evaluate branching logic
        next_step = result.evaluate_branching()
        if next_step:
            result.save()
        
        return result


class ProtocolStepResultBulkSerializer(serializers.Serializer):
    """Serializer for bulk result entry (multiple fields per step)"""
    step_completion_id = serializers.UUIDField()
    results = serializers.ListField(
        child=serializers.DictField()
    )
    evaluated_by = serializers.UUIDField()
    
    def validate(self, data):
        """Validate bulk results"""
        for result in data['results']:
            if 'result_type' not in result or 'result_label' not in result:
                raise serializers.ValidationError(
                    "Each result must have result_type and result_label"
                )
        return data
    
    def create(self, validated_data):
        """Create multiple results for a step"""
        results = []
        for result_data in validated_data['results']:
            result = ProtocolStepResult.objects.create(
                step_completion_id=validated_data['step_completion_id'],
                evaluated_by_id=validated_data['evaluated_by'],
                **result_data
            )
            results.append(result)
        
        return results


class ProtocolStepResultCreateSerializer(serializers.ModelSerializer):
    """Serializer for creating protocol step results"""
    
    class Meta:
        model = ProtocolStepResult
        fields = [
            'protocol_step', 'result_type', 'test_result', 'interpretation',
            'administer_at_same_time', 'offset_days', 'eye_side',
            'special_instructions', 'order'
        ]


class ProtocolStepSerializer(serializers.ModelSerializer):
    """Serializer for protocol steps"""
    medications = ProtocolStepMedicationSerializer(many=True, read_only=True)
    treatments = ProtocolStepTreatmentSerializer(many=True, read_only=True)
    tests = ProtocolStepTestSerializer(many=True, read_only=True)
    results = ProtocolStepResultSerializer(many=True, read_only=True)
    
    class Meta:
        model = ProtocolStep
        fields = [
            'id', 'protocol', 'step_number', 'description',
            'medications', 'treatments', 'tests', 'results',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['created_at', 'updated_at']
