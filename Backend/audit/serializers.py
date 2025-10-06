"""
Serializers for PreciseOptics Eye Hospital Management System - Audit
"""
from rest_framework import serializers
from .models import (
    AuditLog, PatientAccessLog, MedicationAudit, ClinicalDecisionAudit,
    DataExportLog, ComplianceReport, SystemSecurityEvent
)


class AuditLogSerializer(serializers.ModelSerializer):
    """
    Serializer for AuditLog model
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = AuditLog
        fields = [
            'id', 'user', 'user_name', 'session_id', 'action', 'resource_name',
            'resource_id', 'content_type', 'object_id', 'timestamp', 'ip_address',
            'user_agent', 'success', 'failure_reason', 'additional_data',
            'severity', 'compliance_flags', 'retention_date'
        ]
        read_only_fields = ['id', 'user_name', 'timestamp']


class PatientAccessLogSerializer(serializers.ModelSerializer):
    """
    Serializer for PatientAccessLog model
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    patient_name = serializers.CharField(source='patient.first_name', read_only=True)
    
    class Meta:
        model = PatientAccessLog
        fields = [
            'id', 'user', 'user_name', 'patient', 'patient_name', 'access_type',
            'access_reason', 'data_accessed', 'session_id', 'ip_address',
            'access_time', 'duration_minutes', 'legitimate_access',
            'consent_obtained', 'notes'
        ]
        read_only_fields = ['id', 'user_name', 'patient_name', 'access_time']


class MedicationAuditSerializer(serializers.ModelSerializer):
    """
    Serializer for MedicationAudit model
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    patient_name = serializers.CharField(source='patient.first_name', read_only=True)
    
    class Meta:
        model = MedicationAudit
        fields = [
            'id', 'user', 'user_name', 'patient', 'patient_name', 'action_type',
            'medication_name', 'dosage', 'quantity', 'prescription_details',
            'action_timestamp', 'clinical_justification', 'override_reason',
            'supervisor_approval', 'drug_interaction_check', 'allergy_check',
            'dosage_verification', 'compliance_flags'
        ]
        read_only_fields = ['id', 'user_name', 'patient_name', 'action_timestamp']


class ClinicalDecisionAuditSerializer(serializers.ModelSerializer):
    """
    Serializer for ClinicalDecisionAudit model
    """
    clinician_name = serializers.CharField(source='clinician.get_full_name', read_only=True)
    patient_name = serializers.CharField(source='patient.first_name', read_only=True)
    
    class Meta:
        model = ClinicalDecisionAudit
        fields = [
            'id', 'clinician', 'clinician_name', 'patient', 'patient_name',
            'decision_type', 'clinical_context', 'evidence_considered',
            'decision_rationale', 'alternative_options', 'risk_assessment',
            'patient_involvement', 'consent_status', 'outcome_monitoring',
            'decision_timestamp', 'follow_up_required', 'guidelines_followed',
            'peer_consultation', 'quality_indicators'
        ]
        read_only_fields = ['id', 'clinician_name', 'patient_name', 'decision_timestamp']


class DataExportLogSerializer(serializers.ModelSerializer):
    """
    Serializer for DataExportLog model
    """
    exported_by_name = serializers.CharField(source='exported_by.get_full_name', read_only=True)
    
    class Meta:
        model = DataExportLog
        fields = [
            'id', 'exported_by', 'exported_by_name', 'export_type', 'data_category',
            'export_format', 'record_count', 'date_range_start', 'date_range_end',
            'export_criteria', 'export_purpose', 'recipient_details',
            'approval_status', 'approved_by', 'approval_date', 'export_timestamp',
            'file_location', 'file_hash', 'encryption_used', 'retention_period',
            'destruction_date', 'access_log', 'compliance_notes'
        ]
        read_only_fields = ['id', 'exported_by_name', 'export_timestamp', 'file_hash']


class ComplianceReportSerializer(serializers.ModelSerializer):
    """
    Serializer for ComplianceReport model
    """
    generated_by_name = serializers.CharField(source='generated_by.get_full_name', read_only=True)
    
    class Meta:
        model = ComplianceReport
        fields = [
            'id', 'report_type', 'report_period_start', 'report_period_end',
            'generated_by', 'generated_by_name', 'generation_date', 'report_data',
            'compliance_score', 'violations_found', 'recommendations',
            'action_items', 'stakeholders', 'distribution_list',
            'follow_up_required', 'follow_up_date', 'status', 'notes'
        ]
        read_only_fields = ['id', 'generated_by_name', 'generation_date']


class SystemSecurityEventSerializer(serializers.ModelSerializer):
    """
    Serializer for SystemSecurityEvent model
    """
    user_name = serializers.CharField(source='user.get_full_name', read_only=True)
    
    class Meta:
        model = SystemSecurityEvent
        fields = [
            'id', 'event_type', 'severity', 'user', 'user_name', 'ip_address',
            'user_agent', 'timestamp', 'description', 'detection_method',
            'system_response', 'investigation_status', 'resolution_status',
            'impact_assessment', 'remediation_actions', 'false_positive',
            'escalated', 'escalation_reason', 'incident_number',
            'compliance_impact', 'lessons_learned'
        ]
        read_only_fields = ['id', 'user_name', 'timestamp']