"""
Admin configuration for conditions app
"""
from django.contrib import admin
from .models import MedicalCondition, PatientCondition, ConditionProgress, ConditionDocument


@admin.register(MedicalCondition)
class MedicalConditionAdmin(admin.ModelAdmin):
    list_display = ['code', 'name', 'category', 'has_standard_protocol', 'is_active', 'created_at']
    list_filter = ['category', 'has_standard_protocol', 'is_active']
    search_fields = ['code', 'name', 'description']
    readonly_fields = ['created_at', 'updated_at']
    fieldsets = (
        ('Basic Information', {
            'fields': ('code', 'name', 'category', 'description')
        }),
        ('Clinical Information', {
            'fields': ('symptoms', 'risk_factors', 'typical_progression', 'standard_treatments', 'prognosis')
        }),
        ('Protocol Information', {
            'fields': ('has_standard_protocol', 'protocol_description')
        }),
        ('Status & Metadata', {
            'fields': ('is_active', 'created_by', 'created_at', 'updated_at')
        }),
    )


@admin.register(PatientCondition)
class PatientConditionAdmin(admin.ModelAdmin):
    list_display = ['patient', 'condition', 'diagnosis_date', 'severity', 'current_status', 'eye_affected', 'is_active']
    list_filter = ['severity', 'current_status', 'eye_affected', 'is_active', 'diagnosis_date']
    search_fields = ['patient__first_name', 'patient__last_name', 'patient__patient_id', 'condition__name']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'diagnosis_date'
    
    fieldsets = (
        ('Patient & Condition', {
            'fields': ('patient', 'condition', 'diagnosis_date', 'diagnosed_by')
        }),
        ('Clinical Details', {
            'fields': ('severity', 'eye_affected', 'current_status', 'initial_measurements')
        }),
        ('Treatment', {
            'fields': ('treatment_plan', 'medications_prescribed')
        }),
        ('Follow-up', {
            'fields': ('last_assessment_date', 'next_assessment_date')
        }),
        ('Notes', {
            'fields': ('diagnosis_notes', 'patient_notes')
        }),
        ('Status', {
            'fields': ('is_active', 'resolved_date', 'resolution_notes')
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(ConditionProgress)
class ConditionProgressAdmin(admin.ModelAdmin):
    list_display = ['patient_condition', 'assessment_date', 'assessment_type', 'status_change', 'severity_at_assessment', 'assessed_by']
    list_filter = ['assessment_type', 'status_change', 'severity_at_assessment', 'assessment_date']
    search_fields = ['patient_condition__patient__first_name', 'patient_condition__patient__last_name', 
                    'patient_condition__condition__name', 'clinical_findings']
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'assessment_date'
    
    fieldsets = (
        ('Assessment Details', {
            'fields': ('patient_condition', 'assessment_date', 'assessment_type', 'assessed_by')
        }),
        ('Status & Severity', {
            'fields': ('status_change', 'severity_at_assessment', 'measurements')
        }),
        ('Clinical Findings', {
            'fields': ('clinical_findings', 'subjective_symptoms', 'images_attached')
        }),
        ('Treatment', {
            'fields': ('treatment_changes', 'medications_adjusted')
        }),
        ('Next Steps', {
            'fields': ('next_assessment_date', 'next_assessment_reason')
        }),
        ('Notes', {
            'fields': ('assessment_notes',)
        }),
        ('Metadata', {
            'fields': ('created_at', 'updated_at')
        }),
    )


@admin.register(ConditionDocument)
class ConditionDocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'patient_condition', 'document_type', 'uploaded_by', 'uploaded_at']
    list_filter = ['document_type', 'uploaded_at']
    search_fields = ['title', 'description', 'patient_condition__patient__first_name', 
                    'patient_condition__patient__last_name']
    readonly_fields = ['uploaded_at']
    date_hierarchy = 'uploaded_at'
    
    fieldsets = (
        ('Document Details', {
            'fields': ('patient_condition', 'progress_record', 'document_type', 'title', 'description')
        }),
        ('File', {
            'fields': ('file',)
        }),
        ('Metadata', {
            'fields': ('uploaded_by', 'uploaded_at')
        }),
    )

