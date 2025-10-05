"""
Admin configuration for audit app
"""
from django.contrib import admin
from .models import (
    AuditLog, PatientAccessLog, MedicationAudit, ClinicalDecisionAudit,
    DataExportLog, ComplianceReport, SystemSecurityEvent
)


@admin.register(AuditLog)
class AuditLogAdmin(admin.ModelAdmin):
    list_display = ('user', 'action', 'resource_name', 'resource_id', 'ip_address', 'severity', 'timestamp')
    list_filter = ('action', 'severity', 'gdpr_relevant', 'hipaa_relevant', 'timestamp')
    search_fields = ('user__username', 'resource_name', 'ip_address', 'description')
    readonly_fields = ('timestamp',)
    raw_id_fields = ('user',)


@admin.register(PatientAccessLog)
class PatientAccessLogAdmin(admin.ModelAdmin):
    list_display = ('patient', 'accessed_by', 'access_type', 'legitimate_interest', 'patient_consent', 'access_time')
    list_filter = ('access_type', 'legitimate_interest', 'patient_consent', 'access_time')
    search_fields = ('patient__first_name', 'patient__last_name', 'accessed_by__username')
    raw_id_fields = ('patient', 'accessed_by')
    readonly_fields = ('access_time',)


@admin.register(MedicationAudit)
class MedicationAuditAdmin(admin.ModelAdmin):
    list_display = ('patient', 'medication', 'action', 'performed_by', 'timestamp', 'verified_by')
    list_filter = ('action', 'interactions_checked', 'allergies_checked', 'timestamp')
    search_fields = ('patient__first_name', 'patient__last_name', 'medication__name')
    raw_id_fields = ('patient', 'medication', 'prescription', 'performed_by', 'verified_by')


@admin.register(ClinicalDecisionAudit)
class ClinicalDecisionAuditAdmin(admin.ModelAdmin):
    list_display = ('patient', 'decision_type', 'decision_maker', 'risk_level', 'decision_date')
    list_filter = ('decision_type', 'risk_level', 'decision_date')
    search_fields = ('patient__first_name', 'patient__last_name', 'decision_maker__username')
    raw_id_fields = ('patient', 'decision_maker')


@admin.register(DataExportLog)
class DataExportLogAdmin(admin.ModelAdmin):
    list_display = ('exported_by', 'export_type', 'export_format', 'file_name', 'export_time', 'encryption_used')
    list_filter = ('export_type', 'export_format', 'encryption_used', 'export_time')
    search_fields = ('exported_by__username', 'file_name', 'export_reason')
    raw_id_fields = ('exported_by',)


@admin.register(ComplianceReport)
class ComplianceReportAdmin(admin.ModelAdmin):
    list_display = ('report_type', 'title', 'compliance_status', 'generated_by', 'generated_date')
    list_filter = ('report_type', 'compliance_status', 'generated_date')
    search_fields = ('title', 'generated_by__username')
    raw_id_fields = ('generated_by', 'reviewed_by')


@admin.register(SystemSecurityEvent)
class SystemSecurityEventAdmin(admin.ModelAdmin):
    list_display = ('event_type', 'threat_level', 'source_ip', 'user_account', 'resolved', 'event_time')
    list_filter = ('event_type', 'threat_level', 'resolved', 'event_time')
    search_fields = ('source_ip', 'user_account__username', 'description')
    raw_id_fields = ('user_account', 'resolved_by')
    readonly_fields = ('event_time',)
