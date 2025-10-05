"""
Audit and compliance models for PreciseOptics Eye Hospital Management System
"""
from django.db import models
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from patients.models import Patient
from accounts.models import CustomUser
from medications.models import Medication, Prescription
import uuid
import json


class AuditLog(models.Model):
    """
    Comprehensive audit logging for all system activities
    """
    ACTION_TYPES = (
        ('create', 'Create'),
        ('read', 'Read/View'),
        ('update', 'Update'),
        ('delete', 'Delete'),
        ('login', 'Login'),
        ('logout', 'Logout'),
        ('export', 'Export Data'),
        ('print', 'Print Document'),
        ('access_denied', 'Access Denied'),
    )
    
    SEVERITY_LEVELS = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # User Information
    user = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    session_id = models.CharField(max_length=50, blank=True)
    
    # Action Details
    action = models.CharField(max_length=20, choices=ACTION_TYPES)
    resource_name = models.CharField(max_length=100, help_text="Model or resource name")
    resource_id = models.CharField(max_length=100, help_text="ID of the affected resource")
    
    # Generic Foreign Key to any model
    content_type = models.ForeignKey(ContentType, on_delete=models.CASCADE, null=True, blank=True)
    object_id = models.CharField(max_length=100, null=True, blank=True)
    content_object = GenericForeignKey('content_type', 'object_id')
    
    # Change Details
    changes = models.JSONField(default=dict, help_text="Details of what changed")
    old_values = models.JSONField(default=dict, help_text="Previous values")
    new_values = models.JSONField(default=dict, help_text="New values")
    
    # Request Information
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    request_method = models.CharField(max_length=10, blank=True)
    request_url = models.URLField(blank=True)
    
    # Context Information
    description = models.TextField(help_text="Human readable description of the action")
    severity = models.CharField(max_length=10, choices=SEVERITY_LEVELS, default='low')
    tags = models.CharField(max_length=200, blank=True, help_text="Comma-separated tags")
    
    # Compliance
    gdpr_relevant = models.BooleanField(default=False)
    hipaa_relevant = models.BooleanField(default=False)
    
    # Timestamps
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Audit Log"
        verbose_name_plural = "Audit Logs"
        ordering = ['-timestamp']
        indexes = [
            models.Index(fields=['user', 'timestamp']),
            models.Index(fields=['action', 'timestamp']),
            models.Index(fields=['resource_name', 'timestamp']),
            models.Index(fields=['ip_address', 'timestamp']),
        ]
    
    def __str__(self):
        return f"{self.user} - {self.action} {self.resource_name} at {self.timestamp}"


class PatientAccessLog(models.Model):
    """
    Specific audit trail for patient data access
    """
    ACCESS_TYPES = (
        ('view_profile', 'View Profile'),
        ('view_medical_history', 'View Medical History'),
        ('view_prescriptions', 'View Prescriptions'),
        ('view_test_results', 'View Test Results'),
        ('view_images', 'View Medical Images'),
        ('edit_profile', 'Edit Profile'),
        ('add_consultation', 'Add Consultation'),
        ('add_prescription', 'Add Prescription'),
        ('add_test_result', 'Add Test Result'),
        ('export_data', 'Export Patient Data'),
        ('print_report', 'Print Report'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='access_logs')
    accessed_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    access_type = models.CharField(max_length=30, choices=ACCESS_TYPES)
    
    # Access Details
    data_accessed = models.TextField(help_text="Description of what data was accessed")
    reason_for_access = models.TextField(help_text="Clinical or administrative reason")
    
    # Technical Details
    ip_address = models.GenericIPAddressField()
    session_id = models.CharField(max_length=50)
    user_agent = models.TextField()
    
    # Compliance
    legitimate_interest = models.BooleanField(default=True)
    patient_consent = models.BooleanField(default=True)
    
    # Timestamps
    access_time = models.DateTimeField(auto_now_add=True)
    session_duration_seconds = models.PositiveIntegerField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Patient Access Log"
        verbose_name_plural = "Patient Access Logs"
        ordering = ['-access_time']
    
    def __str__(self):
        return f"{self.accessed_by} accessed {self.patient} - {self.get_access_type_display()}"


class MedicationAudit(models.Model):
    """
    Audit trail for medication-related activities
    """
    MEDICATION_ACTIONS = (
        ('prescribed', 'Prescribed'),
        ('administered', 'Administered'),
        ('dispensed', 'Dispensed'),
        ('discontinued', 'Discontinued'),
        ('modified', 'Modified'),
        ('adverse_reaction', 'Adverse Reaction Reported'),
        ('allergy_recorded', 'Allergy Recorded'),
        ('stock_updated', 'Stock Updated'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='medication_audits')
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE)
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, null=True, blank=True)
    
    # Action Details
    action = models.CharField(max_length=20, choices=MEDICATION_ACTIONS)
    performed_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    
    # Medication Details
    dosage = models.CharField(max_length=100, blank=True)
    frequency = models.CharField(max_length=100, blank=True)
    duration = models.CharField(max_length=100, blank=True)
    
    # Safety Information
    interactions_checked = models.BooleanField(default=False)
    allergies_checked = models.BooleanField(default=False)
    contraindications_reviewed = models.BooleanField(default=False)
    
    # Clinical Justification
    indication = models.TextField(help_text="Clinical indication for the medication")
    clinical_notes = models.TextField(blank=True)
    
    # Verification
    verified_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_medications'
    )
    verification_time = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    timestamp = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Medication Audit"
        verbose_name_plural = "Medication Audits"
        ordering = ['-timestamp']
    
    def __str__(self):
        return f"{self.medication.name} - {self.get_action_display()} for {self.patient}"


class ClinicalDecisionAudit(models.Model):
    """
    Audit trail for clinical decisions and diagnostic processes
    """
    DECISION_TYPES = (
        ('diagnosis', 'Diagnosis Made'),
        ('treatment_plan', 'Treatment Plan'),
        ('surgery_decision', 'Surgery Decision'),
        ('referral', 'Referral Decision'),
        ('discharge', 'Discharge Decision'),
        ('test_ordered', 'Test Ordered'),
        ('follow_up_scheduled', 'Follow-up Scheduled'),
        ('emergency_protocol', 'Emergency Protocol'),
    )
    
    RISK_LEVELS = (
        ('low', 'Low Risk'),
        ('moderate', 'Moderate Risk'),
        ('high', 'High Risk'),
        ('critical', 'Critical Risk'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='clinical_decisions')
    decision_maker = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    
    # Decision Details
    decision_type = models.CharField(max_length=20, choices=DECISION_TYPES)
    decision_description = models.TextField()
    clinical_reasoning = models.TextField(help_text="Clinical reasoning behind the decision")
    
    # Risk Assessment
    risk_level = models.CharField(max_length=10, choices=RISK_LEVELS)
    risk_factors = models.TextField(blank=True)
    mitigation_strategies = models.TextField(blank=True)
    
    # Evidence Base
    guidelines_followed = models.CharField(max_length=200, blank=True)
    evidence_level = models.CharField(
        max_length=20,
        choices=(
            ('level_1', 'Level 1 - Systematic Review'),
            ('level_2', 'Level 2 - RCT'),
            ('level_3', 'Level 3 - Cohort Study'),
            ('level_4', 'Level 4 - Case Series'),
            ('level_5', 'Level 5 - Expert Opinion'),
        ),
        blank=True
    )
    
    # Outcomes
    expected_outcome = models.TextField(blank=True)
    actual_outcome = models.TextField(blank=True)
    outcome_date = models.DateField(null=True, blank=True)
    
    # Quality Indicators
    patient_consent_obtained = models.BooleanField(default=False)
    second_opinion_sought = models.BooleanField(default=False)
    multidisciplinary_review = models.BooleanField(default=False)
    
    # Timestamps
    decision_date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Clinical Decision Audit"
        verbose_name_plural = "Clinical Decision Audits"
        ordering = ['-decision_date']
    
    def __str__(self):
        return f"{self.get_decision_type_display()} for {self.patient} by {self.decision_maker}"


class DataExportLog(models.Model):
    """
    Track data exports for compliance and security
    """
    EXPORT_TYPES = (
        ('patient_data', 'Patient Data'),
        ('medical_records', 'Medical Records'),
        ('test_results', 'Test Results'),
        ('reports', 'Reports'),
        ('audit_logs', 'Audit Logs'),
        ('analytics', 'Analytics Data'),
        ('backup', 'System Backup'),
    )
    
    EXPORT_FORMATS = (
        ('pdf', 'PDF'),
        ('csv', 'CSV'),
        ('excel', 'Excel'),
        ('json', 'JSON'),
        ('xml', 'XML'),
        ('dicom', 'DICOM'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    exported_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    
    # Export Details
    export_type = models.CharField(max_length=20, choices=EXPORT_TYPES)
    export_format = models.CharField(max_length=10, choices=EXPORT_FORMATS)
    file_name = models.CharField(max_length=255)
    file_size_bytes = models.BigIntegerField()
    
    # Data Selection
    patient_ids = models.TextField(blank=True, help_text="JSON list of patient IDs")
    date_range_start = models.DateField(null=True, blank=True)
    date_range_end = models.DateField(null=True, blank=True)
    filters_applied = models.JSONField(default=dict)
    
    # Security
    encryption_used = models.BooleanField(default=False)
    password_protected = models.BooleanField(default=False)
    access_expires = models.DateTimeField(null=True, blank=True)
    
    # Compliance
    export_reason = models.TextField(help_text="Legal/business reason for export")
    data_controller_approval = models.BooleanField(default=False)
    patient_consent_verified = models.BooleanField(default=False)
    
    # Technical Details
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    
    # Timestamps
    export_time = models.DateTimeField(auto_now_add=True)
    file_deleted_time = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Data Export Log"
        verbose_name_plural = "Data Export Logs"
        ordering = ['-export_time']
    
    def __str__(self):
        return f"{self.export_type} exported by {self.exported_by} at {self.export_time}"


class ComplianceReport(models.Model):
    """
    Regular compliance and audit reports
    """
    REPORT_TYPES = (
        ('gdpr_compliance', 'GDPR Compliance'),
        ('hipaa_compliance', 'HIPAA Compliance'),
        ('clinical_audit', 'Clinical Audit'),
        ('medication_safety', 'Medication Safety'),
        ('data_quality', 'Data Quality'),
        ('security_review', 'Security Review'),
        ('access_review', 'Access Review'),
    )
    
    COMPLIANCE_STATUS = (
        ('compliant', 'Compliant'),
        ('minor_issues', 'Minor Issues'),
        ('major_issues', 'Major Issues'),
        ('non_compliant', 'Non-Compliant'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Report Details
    report_type = models.CharField(max_length=20, choices=REPORT_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Period Covered
    period_start = models.DateField()
    period_end = models.DateField()
    
    # Findings
    compliance_status = models.CharField(max_length=20, choices=COMPLIANCE_STATUS)
    key_findings = models.TextField()
    recommendations = models.TextField()
    action_items = models.TextField()
    
    # Metrics
    total_records_reviewed = models.PositiveIntegerField(default=0)
    issues_identified = models.PositiveIntegerField(default=0)
    issues_resolved = models.PositiveIntegerField(default=0)
    
    # Report Generation
    generated_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    reviewed_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='reviewed_reports'
    )
    
    # File Attachments
    report_file = models.FileField(upload_to='compliance_reports/', null=True, blank=True)
    
    # Timestamps
    generated_date = models.DateTimeField(auto_now_add=True)
    review_date = models.DateTimeField(null=True, blank=True)
    
    class Meta:
        verbose_name = "Compliance Report"
        verbose_name_plural = "Compliance Reports"
        ordering = ['-generated_date']
    
    def __str__(self):
        return f"{self.get_report_type_display()} - {self.period_start} to {self.period_end}"


class SystemSecurityEvent(models.Model):
    """
    Security events and potential threats
    """
    EVENT_TYPES = (
        ('failed_login', 'Failed Login Attempt'),
        ('suspicious_activity', 'Suspicious Activity'),
        ('data_breach', 'Data Breach'),
        ('unauthorized_access', 'Unauthorized Access'),
        ('privilege_escalation', 'Privilege Escalation'),
        ('malware_detected', 'Malware Detected'),
        ('system_intrusion', 'System Intrusion'),
        ('ddos_attack', 'DDoS Attack'),
    )
    
    THREAT_LEVELS = (
        ('info', 'Informational'),
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Event Details
    event_type = models.CharField(max_length=30, choices=EVENT_TYPES)
    threat_level = models.CharField(max_length=10, choices=THREAT_LEVELS)
    description = models.TextField()
    
    # Source Information
    source_ip = models.GenericIPAddressField()
    user_agent = models.TextField(blank=True)
    user_account = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, blank=True)
    
    # Technical Details
    request_method = models.CharField(max_length=10, blank=True)
    request_url = models.URLField(blank=True)
    response_code = models.PositiveIntegerField(null=True, blank=True)
    payload_data = models.JSONField(default=dict)
    
    # Response
    automated_response = models.TextField(blank=True)
    manual_response_required = models.BooleanField(default=False)
    incident_ticket_number = models.CharField(max_length=50, blank=True)
    
    # Resolution
    resolved = models.BooleanField(default=False)
    resolution_notes = models.TextField(blank=True)
    resolved_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='resolved_security_events'
    )
    resolution_date = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    event_time = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "System Security Event"
        verbose_name_plural = "System Security Events"
        ordering = ['-event_time']
    
    def __str__(self):
        return f"{self.get_event_type_display()} - {self.get_threat_level_display()} at {self.event_time}"
