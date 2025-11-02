"""
Admin configuration for protocols app
"""
from django.contrib import admin
from .models import (
    TreatmentProtocol, ProtocolStep, PatientProtocol,
    ProtocolStepCompletion, ConsentForm,
    ProtocolStepMedication, ProtocolStepTreatment, ProtocolStepTest
)


@admin.register(TreatmentProtocol)
class TreatmentProtocolAdmin(admin.ModelAdmin):
    list_display = ['name', 'code', 'protocol_type', 'condition', 'requires_consent', 'is_active', 'created_at']
    list_filter = ['protocol_type', 'condition', 'requires_consent', 'is_active', 'created_at']
    search_fields = ['name', 'code', 'description', 'condition__name']
    readonly_fields = ['created_at', 'updated_at']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'code', 'protocol_type', 'condition')
        }),
        ('Protocol Details', {
            'fields': ('description', 'indications', 'contraindications')
        }),
        ('Timing', {
            'fields': ('total_duration_weeks', 'repeat_interval_weeks')
        }),
        ('Consent & Compliance', {
            'fields': ('requires_consent', 'consent_type')
        }),
        ('Clinical Information', {
            'fields': ('expected_outcomes', 'potential_side_effects', 'monitoring_requirements')
        }),
        ('Status', {
            'fields': ('is_active', 'created_by', 'created_at', 'updated_at')
        }),
    )


# Inline admin classes for step details
class ProtocolStepMedicationInline(admin.TabularInline):
    model = ProtocolStepMedication
    extra = 1
    fields = ['medication', 'dosage_amount', 'dosage_unit', 'route', 'frequency', 'eye_side', 'order']


class ProtocolStepTreatmentInline(admin.TabularInline):
    model = ProtocolStepTreatment
    extra = 1
    fields = ['treatment_type', 'treatment_name', 'eye_side', 'order']


class ProtocolStepTestInline(admin.TabularInline):
    model = ProtocolStepTest
    extra = 1
    fields = ['test_type', 'test_name', 'eye_side', 'is_baseline', 'order']


@admin.register(ProtocolStep)
class ProtocolStepAdmin(admin.ModelAdmin):
    list_display = ['protocol', 'step_number', 'title', 'step_type', 'timing_days', 'is_mandatory', 'has_branches']
    list_filter = ['step_type', 'is_mandatory', 'can_be_rescheduled', 'has_branches', 'is_recurring', 'protocol__condition']
    search_fields = ['title', 'description', 'protocol__name']
    readonly_fields = ['created_at', 'updated_at']
    inlines = [ProtocolStepMedicationInline, ProtocolStepTreatmentInline, ProtocolStepTestInline]
    
    fieldsets = (
        ('Step Information', {
            'fields': ('protocol', 'step_number', 'step_type', 'title', 'description')
        }),
        ('Timing', {
            'fields': ('timing_type', 'timing_days', 'timing_window_before', 'timing_window_after', 
                      'is_recurring', 'recurrence_count')
        }),
        ('Medication Details (Legacy)', {
            'fields': ('medication', 'medication_dosage', 'medication_route'),
            'classes': ('collapse',),
            'description': 'Use inline medications below for multiple medications'
        }),
        ('Test Requirements (Legacy)', {
            'fields': ('required_test_type',),
            'classes': ('collapse',),
            'description': 'Use inline tests below for multiple tests'
        }),
        ('Branching Logic', {
            'fields': ('has_branches', 'branch_condition_type', 'branch_logic', 'parent_step', 'branch_label'),
            'classes': ('collapse',)
        }),
        ('Instructions', {
            'fields': ('pre_instructions', 'post_instructions'),
            'classes': ('collapse',)
        }),
        ('Compliance', {
            'fields': ('is_mandatory', 'can_be_rescheduled')
        }),
    )


@admin.register(ProtocolStepMedication)
class ProtocolStepMedicationAdmin(admin.ModelAdmin):
    list_display = ['protocol_step', 'medication', 'dosage_amount', 'dosage_unit', 'route', 'frequency', 'eye_side', 'order']
    list_filter = ['route', 'eye_side', 'administer_at_same_time']
    search_fields = ['medication__name', 'protocol_step__title', 'special_instructions']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ProtocolStepTreatment)
class ProtocolStepTreatmentAdmin(admin.ModelAdmin):
    list_display = ['protocol_step', 'treatment_name', 'treatment_type', 'eye_side', 'requires_anesthesia', 'order']
    list_filter = ['treatment_type', 'eye_side', 'requires_anesthesia', 'administer_at_same_time']
    search_fields = ['treatment_name', 'protocol_step__title', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(ProtocolStepTest)
class ProtocolStepTestAdmin(admin.ModelAdmin):
    list_display = ['protocol_step', 'test_name', 'test_type', 'eye_side', 'is_baseline', 'order']
    list_filter = ['test_type', 'eye_side', 'is_baseline', 'administer_at_same_time']
    search_fields = ['test_name', 'protocol_step__title', 'description']
    readonly_fields = ['created_at', 'updated_at']


@admin.register(PatientProtocol)
class PatientProtocolAdmin(admin.ModelAdmin):
    list_display = ['patient', 'protocol', 'status', 'start_date', 'expected_end_date', 'adherence_percentage']
    list_filter = ['status', 'protocol__condition', 'start_date', 'assigned_date']
    search_fields = ['patient__first_name', 'patient__last_name', 'patient__patient_id', 'protocol__name']
    readonly_fields = ['assigned_date', 'created_at', 'updated_at', 'adherence_percentage']
    date_hierarchy = 'start_date'
    
    fieldsets = (
        ('Assignment', {
            'fields': ('patient', 'protocol', 'status')
        }),
        ('Dates', {
            'fields': (
                'start_date', 'actual_start_date',
                'expected_end_date', 'actual_end_date'
            )
        }),
        ('Assignment Details', {
            'fields': ('assigned_by', 'assigned_date', 'assignment_reason')
        }),
        ('Discontinuation', {
            'fields': (
                'discontinuation_reason', 'discontinued_by',
                'discontinuation_date'
            ),
            'classes': ('collapse',)
        }),
        ('Completion', {
            'fields': ('completion_notes', 'outcome_assessment'),
            'classes': ('collapse',)
        }),
        ('Modifications & Tracking', {
            'fields': (
                'protocol_modifications', 'current_step_number',
                'total_steps_completed', 'adherence_percentage'
            )
        }),
    )


@admin.register(ProtocolStepCompletion)
class ProtocolStepCompletionAdmin(admin.ModelAdmin):
    list_display = [
        'patient_protocol', 'protocol_step', 'scheduled_date',
        'status', 'completed_date', 'outcome', 'completed_within_window'
    ]
    list_filter = [
        'status', 'outcome', 'completed_within_window',
        'adverse_event', 'scheduled_date'
    ]
    search_fields = [
        'patient_protocol__patient__first_name',
        'patient_protocol__patient__last_name',
        'protocol_step__title',
        'clinical_notes'
    ]
    readonly_fields = ['created_at', 'updated_at', 'days_variance', 'completed_within_window']
    date_hierarchy = 'scheduled_date'
    
    fieldsets = (
        ('Step Information', {
            'fields': ('patient_protocol', 'protocol_step')
        }),
        ('Scheduling', {
            'fields': ('scheduled_date', 'scheduled_time')
        }),
        ('Completion', {
            'fields': (
                'status', 'completed_date', 'completed_time',
                'completed_by', 'outcome'
            )
        }),
        ('Clinical Information', {
            'fields': ('clinical_notes', 'measurements')
        }),
        ('Adverse Events', {
            'fields': ('adverse_event', 'adverse_event_description'),
            'classes': ('collapse',)
        }),
        ('Rescheduling', {
            'fields': (
                'original_scheduled_date', 'reschedule_reason',
                'rescheduled_by'
            ),
            'classes': ('collapse',)
        }),
        ('Next Step & Compliance', {
            'fields': (
                'next_step_date', 'completed_within_window',
                'days_variance'
            )
        }),
    )


@admin.register(ConsentForm)
class ConsentFormAdmin(admin.ModelAdmin):
    list_display = [
        'patient', 'title', 'consent_type', 'status',
        'consent_given_date', 'expiry_date', 'obtained_by'
    ]
    list_filter = [
        'consent_type', 'status', 'consent_given_date',
        'interpreter_used', 'patient_understood'
    ]
    search_fields = [
        'patient__first_name', 'patient__last_name',
        'patient__patient_id', 'title', 'description'
    ]
    readonly_fields = ['created_at', 'updated_at']
    date_hierarchy = 'consent_given_date'
    
    fieldsets = (
        ('Patient & Protocol', {
            'fields': ('patient', 'protocol', 'patient_protocol')
        }),
        ('Consent Details', {
            'fields': ('consent_type', 'title', 'description')
        }),
        ('Status & Dates', {
            'fields': (
                'status', 'consent_given_date', 'consent_given_time',
                'expiry_date'
            )
        }),
        ('Documentation', {
            'fields': ('consent_document',)
        }),
        ('Parties Involved', {
            'fields': ('obtained_by', 'witnessed_by')
        }),
        ('Patient Confirmation', {
            'fields': (
                'patient_signature', 'patient_understood',
                'interpreter_used', 'interpreter_name'
            )
        }),
        ('Withdrawal', {
            'fields': ('withdrawal_date', 'withdrawal_reason'),
            'classes': ('collapse',)
        }),
        ('Additional Information', {
            'fields': ('notes',),
            'classes': ('collapse',)
        }),
    )
