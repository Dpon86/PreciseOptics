"""
Admin configuration for Treatments app
"""
from django.contrib import admin
from django.utils.html import format_html
from .models import (
    TreatmentCategory, TreatmentType, Treatment, TreatmentMedication,
    TreatmentDocument, TreatmentFollowUp, TreatmentComplication
)


@admin.register(TreatmentCategory)
class TreatmentCategoryAdmin(admin.ModelAdmin):
    list_display = ['name', 'category_type', 'is_active', 'created_at']
    list_filter = ['category_type', 'is_active', 'created_at']
    search_fields = ['name', 'description']
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(TreatmentType)
class TreatmentTypeAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'category', 'urgency_level', 'requires_consent', 'is_active']
    list_filter = ['category', 'urgency_level', 'requires_consent', 'requires_anesthesia', 'is_active']
    search_fields = ['name', 'code', 'description']
    readonly_fields = ['created_at', 'updated_at', 'created_by']
    fieldsets = (
        ('Basic Information', {
            'fields': ('category', 'name', 'code', 'description')
        }),
        ('Treatment Characteristics', {
            'fields': ('typical_duration_minutes', 'requires_consent', 'requires_anesthesia', 'urgency_level')
        }),
        ('Clinical Information', {
            'fields': ('nice_guidance', 'contraindications', 'complications', 'success_rate_percentage')
        }),
        ('Administrative', {
            'fields': ('estimated_cost_gbp', 'waiting_list_weeks', 'is_active')
        }),
        ('Audit', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        })
    )
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


class TreatmentMedicationInline(admin.TabularInline):
    model = TreatmentMedication
    extra = 0
    fields = ['medication', 'timing', 'dosage', 'frequency', 'duration_days', 'instructions']


class TreatmentDocumentInline(admin.TabularInline):
    model = TreatmentDocument
    extra = 0
    fields = ['document_type', 'title', 'file']


class TreatmentFollowUpInline(admin.TabularInline):
    model = TreatmentFollowUp
    extra = 0
    fields = ['scheduled_date', 'status', 'assessed_by']


@admin.register(Treatment)
class TreatmentAdmin(admin.ModelAdmin):
    list_display = [
        'patient_name', 'treatment_type', 'eye_treated', 'status', 
        'primary_surgeon', 'scheduled_date', 'outcome'
    ]
    list_filter = [
        'status', 'eye_treated', 'priority', 'outcome', 
        'treatment_type__category', 'scheduled_date'
    ]
    search_fields = [
        'patient__first_name', 'patient__last_name', 'patient__patient_id',
        'treatment_type__name', 'indication'
    ]
    readonly_fields = ['created_at', 'updated_at', 'created_by', 'duration_minutes']
    
    fieldsets = (
        ('Patient & Treatment', {
            'fields': ('patient', 'consultation', 'treatment_type', 'eye_treated')
        }),
        ('Status & Priority', {
            'fields': ('status', 'priority', 'consent_obtained', 'consent_date', 'consent_obtained_by')
        }),
        ('Personnel', {
            'fields': ('primary_surgeon', 'assisting_staff')
        }),
        ('Scheduling', {
            'fields': ('scheduled_date', 'actual_start_time', 'actual_end_time', 'duration_minutes')
        }),
        ('Clinical Details', {
            'fields': ('indication', 'technique_notes', 'anesthesia_used')
        }),
        ('Outcomes & Follow-up', {
            'fields': (
                'outcome', 'complications', 'post_operative_instructions',
                'requires_follow_up', 'follow_up_weeks', 'follow_up_instructions'
            )
        }),
        ('Audit', {
            'fields': ('created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        })
    )
    
    inlines = [TreatmentMedicationInline, TreatmentDocumentInline, TreatmentFollowUpInline]
    
    def patient_name(self, obj):
        return obj.patient.get_full_name()
    patient_name.short_description = 'Patient'
    
    def duration_minutes(self, obj):
        duration = obj.duration_minutes
        return f"{duration} minutes" if duration else "Not recorded"
    duration_minutes.short_description = 'Duration'
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating new object
            obj.created_by = request.user
        super().save_model(request, obj, form, change)


@admin.register(TreatmentFollowUp)
class TreatmentFollowUpAdmin(admin.ModelAdmin):
    list_display = ['treatment', 'scheduled_date', 'status', 'assessed_by', 'patient_satisfaction']
    list_filter = ['status', 'scheduled_date', 'further_treatment_required']
    search_fields = ['treatment__patient__first_name', 'treatment__patient__last_name']
    
    fieldsets = (
        ('Follow-up Details', {
            'fields': ('treatment', 'scheduled_date', 'status', 'assessed_by')
        }),
        ('Assessment', {
            'fields': ('visual_outcome', 'complications_noted', 'patient_satisfaction')
        }),
        ('Next Steps', {
            'fields': ('further_treatment_required', 'next_appointment_weeks', 'additional_notes')
        })
    )


@admin.register(TreatmentComplication)
class TreatmentComplicationAdmin(admin.ModelAdmin):
    list_display = [
        'treatment', 'complication_type', 'severity', 'onset_time', 
        'preventable', 'reported_to_clinical_governance'
    ]
    list_filter = [
        'complication_type', 'severity', 'preventable', 
        'reported_to_clinical_governance', 'onset_time'
    ]
    search_fields = ['treatment__patient__first_name', 'treatment__patient__last_name', 'description']
    
    fieldsets = (
        ('Complication Details', {
            'fields': ('treatment', 'complication_type', 'severity', 'description')
        }),
        ('Timeline', {
            'fields': ('onset_time', 'resolution_time')
        }),
        ('Management', {
            'fields': ('treatment_given', 'outcome', 'preventable')
        }),
        ('Reporting', {
            'fields': ('reported_to_clinical_governance', 'incident_number', 'reported_by')
        })
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj:  # Editing existing object
            return ['reported_by', 'created_at']
        return ['created_at']
    
    def save_model(self, request, obj, form, change):
        if not change:  # Creating new object
            obj.reported_by = request.user
        super().save_model(request, obj, form, change)
