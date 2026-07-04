"""
Serializers for Patient Reported Outcome Measures.
"""
from rest_framework import serializers
from .models import PatientOutcomeReport


class PatientOutcomeReportSerializer(serializers.ModelSerializer):
    patient_name = serializers.SerializerMethodField(read_only=True)
    completed_by_name = serializers.SerializerMethodField(read_only=True)
    satisfaction_display = serializers.CharField(
        source='get_treatment_satisfaction_display', read_only=True
    )
    side_effect_severity_display = serializers.CharField(
        source='get_side_effect_severity_display', read_only=True
    )

    class Meta:
        model = PatientOutcomeReport
        fields = [
            'id',
            'patient', 'patient_name',
            'consultation', 'prescription', 'treatment',
            'report_date',
            'vision_quality_score',
            'pain_discomfort_score',
            'light_sensitivity_score',
            'daily_activities_score',
            'reading_ability_score',
            'driving_ability_score',
            'treatment_satisfaction', 'satisfaction_display',
            'side_effects_reported',
            'side_effect_severity', 'side_effect_severity_display',
            'patient_comments',
            'completed_by', 'completed_by_name',
            'created_at', 'updated_at',
            'is_active',
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def get_patient_name(self, obj):
        return f'{obj.patient.first_name} {obj.patient.last_name}'

    def get_completed_by_name(self, obj):
        if obj.completed_by:
            return obj.completed_by.get_full_name() or obj.completed_by.username
        return None
