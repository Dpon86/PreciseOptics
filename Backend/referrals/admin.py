"""
Admin configuration for referrals app
"""
from django.contrib import admin
from .models import ReferralSource, Referral, ReferralDocument, ReferralResponse


@admin.register(ReferralSource)
class ReferralSourceAdmin(admin.ModelAdmin):
    list_display = ['name', 'source_type', 'email', 'phone', 'is_active', 'is_preferred',
                    'total_referrals_sent', 'total_referrals_received']
    list_filter = ['source_type', 'is_active', 'is_preferred', 'country']
    search_fields = ['name', 'contact_person', 'email', 'specialties']
    readonly_fields = ['id', 'created_at', 'updated_at', 'total_referrals_sent',
                       'total_referrals_received', 'average_response_time_days']
    
    fieldsets = (
        ('Basic Information', {
            'fields': ('name', 'source_type', 'specialties', 'notes')
        }),
        ('Contact Details', {
            'fields': ('contact_person', 'email', 'phone', 'fax')
        }),
        ('Address', {
            'fields': ('address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country')
        }),
        ('Status & Preferences', {
            'fields': ('is_active', 'is_preferred')
        }),
        ('Statistics', {
            'fields': ('total_referrals_sent', 'total_referrals_received', 'average_response_time_days')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'updated_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )


@admin.register(Referral)
class ReferralAdmin(admin.ModelAdmin):
    list_display = ['referral_number', 'patient', 'referral_source', 'direction', 
                    'urgency', 'current_status', 'referral_date', 'sent_date']
    list_filter = ['direction', 'current_status', 'urgency', 'reason', 'is_active']
    search_fields = ['referral_number', 'patient__first_name', 'patient__last_name',
                    'patient__patient_id', 'referral_source__name']
    date_hierarchy = 'referral_date'
    readonly_fields = ['id', 'referral_number', 'created_at', 'updated_at']
    
    fieldsets = (
        ('Core Information', {
            'fields': ('referral_number', 'patient', 'referral_source', 'direction')
        }),
        ('Referral Details', {
            'fields': ('reason', 'urgency', 'clinical_summary', 'relevant_history',
                      'current_medications', 'allergies', 'specific_questions', 'requested_services')
        }),
        ('Status', {
            'fields': ('current_status', 'status_notes')
        }),
        ('Dates', {
            'fields': ('referral_date', 'sent_date', 'acknowledged_date', 
                      'appointment_date', 'completion_date')
        }),
        ('Users', {
            'fields': ('referred_by', 'reviewed_by', 'created_by')
        }),
        ('Outcome', {
            'fields': ('outcome_summary', 'follow_up_required', 'follow_up_notes')
        }),
        ('Metadata', {
            'fields': ('id', 'is_active', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ReferralDocument)
class ReferralDocumentAdmin(admin.ModelAdmin):
    list_display = ['title', 'referral', 'document_type', 'uploaded_at', 'uploaded_by']
    list_filter = ['document_type', 'uploaded_at']
    search_fields = ['title', 'description', 'referral__referral_number']
    readonly_fields = ['id', 'uploaded_at']
    
    fieldsets = (
        ('Document Information', {
            'fields': ('referral', 'document_type', 'file', 'title', 'description')
        }),
        ('Metadata', {
            'fields': ('id', 'uploaded_at', 'uploaded_by'),
            'classes': ('collapse',)
        }),
    )


@admin.register(ReferralResponse)
class ReferralResponseAdmin(admin.ModelAdmin):
    list_display = ['referral', 'response_type', 'response_date', 'created_by']
    list_filter = ['response_type', 'response_date']
    search_fields = ['referral__referral_number', 'response_content', 'recommendations']
    date_hierarchy = 'response_date'
    readonly_fields = ['id', 'created_at']
    
    fieldsets = (
        ('Response Information', {
            'fields': ('referral', 'response_type', 'response_date', 'response_content')
        }),
        ('Appointment Details', {
            'fields': ('appointment_date', 'appointment_location')
        }),
        ('Additional Information', {
            'fields': ('additional_tests_required', 'recommendations')
        }),
        ('Metadata', {
            'fields': ('id', 'created_at', 'created_by'),
            'classes': ('collapse',)
        }),
    )
