"""
Admin configuration for patients app
"""
from django.contrib import admin
from .models import Patient, PatientVisit, PatientDocument, AppointmentAlert, AlertConfiguration


@admin.register(Patient)
class PatientAdmin(admin.ModelAdmin):
    list_display = ('patient_id', 'first_name', 'last_name', 'date_of_birth', 'gender', 'phone_number', 'is_active', 'registration_date')
    list_filter = ('gender', 'blood_group', 'is_active', 'registration_date')
    search_fields = ('patient_id', 'first_name', 'last_name', 'phone_number', 'email', 'nhs_number')
    readonly_fields = ('registration_date', 'created_at', 'updated_at')
    raw_id_fields = ('registered_by',)
    
    fieldsets = (
        ('Personal Information', {
            'fields': ('patient_id', 'first_name', 'middle_name', 'last_name', 'date_of_birth', 'gender', 'blood_group')
        }),
        ('Contact Information', {
            'fields': ('phone_number', 'alternate_phone', 'email')
        }),
        ('Address', {
            'fields': ('address_line_1', 'address_line_2', 'city', 'state', 'postal_code', 'country')
        }),
        ('Emergency Contact', {
            'fields': ('emergency_contact_name', 'emergency_contact_phone', 'emergency_contact_relationship')
        }),
        ('Insurance & ID', {
            'fields': ('insurance_provider', 'insurance_number', 'nhs_number')
        }),
        ('Medical Information', {
            'fields': ('allergies', 'current_medications', 'medical_history')
        }),
        ('System Information', {
            'fields': ('registered_by', 'is_active', 'registration_date', 'created_at', 'updated_at')
        }),
    )


@admin.register(PatientVisit)
class PatientVisitAdmin(admin.ModelAdmin):
    list_display = ('patient', 'visit_type', 'status', 'scheduled_date', 'primary_doctor', 'total_cost', 'payment_status')
    list_filter = ('visit_type', 'status', 'payment_status', 'scheduled_date')
    search_fields = ('patient__first_name', 'patient__last_name', 'patient__patient_id')
    raw_id_fields = ('patient', 'primary_doctor')
    filter_horizontal = ('attending_staff',)


@admin.register(PatientDocument)
class PatientDocumentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'document_type', 'title', 'uploaded_by', 'created_at')
    list_filter = ('document_type', 'created_at')
    search_fields = ('patient__first_name', 'patient__last_name', 'title')
    raw_id_fields = ('patient', 'uploaded_by')


@admin.register(AppointmentAlert)
class AppointmentAlertAdmin(admin.ModelAdmin):
    list_display = ('patient', 'alert_type', 'severity', 'status', 'trigger_time', 'acknowledged_at', 'resolved_at')
    list_filter = ('alert_type', 'severity', 'status', 'trigger_time')
    search_fields = ('patient__first_name', 'patient__last_name', 'patient__patient_id', 'title', 'message')
    raw_id_fields = ('patient', 'visit', 'acknowledged_by', 'resolved_by')
    readonly_fields = ('trigger_time', 'created_at', 'updated_at')
    date_hierarchy = 'trigger_time'
    
    fieldsets = (
        ('Alert Information', {
            'fields': ('patient', 'visit', 'alert_type', 'severity', 'status')
        }),
        ('Message', {
            'fields': ('title', 'message')
        }),
        ('Timing', {
            'fields': ('trigger_time', 'acknowledged_at', 'acknowledged_by', 'resolved_at', 'resolved_by')
        }),
        ('Actions & Notes', {
            'fields': ('action_taken', 'notes')
        }),
        ('System', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['mark_as_acknowledged', 'mark_as_resolved', 'mark_as_dismissed']
    
    def mark_as_acknowledged(self, request, queryset):
        """Bulk acknowledge alerts"""
        from django.utils import timezone
        updated = queryset.filter(status='active').update(
            status='acknowledged',
            acknowledged_at=timezone.now(),
            acknowledged_by=request.user
        )
        self.message_user(request, f'{updated} alerts marked as acknowledged.')
    mark_as_acknowledged.short_description = 'Mark selected alerts as acknowledged'
    
    def mark_as_resolved(self, request, queryset):
        """Bulk resolve alerts"""
        from django.utils import timezone
        updated = queryset.filter(status__in=['active', 'acknowledged']).update(
            status='resolved',
            resolved_at=timezone.now(),
            resolved_by=request.user
        )
        self.message_user(request, f'{updated} alerts marked as resolved.')
    mark_as_resolved.short_description = 'Mark selected alerts as resolved'
    
    def mark_as_dismissed(self, request, queryset):
        """Bulk dismiss alerts"""
        from django.utils import timezone
        updated = queryset.filter(status__in=['active', 'acknowledged']).update(
            status='dismissed',
            resolved_at=timezone.now(),
            resolved_by=request.user
        )
        self.message_user(request, f'{updated} alerts marked as dismissed.')
    mark_as_dismissed.short_description = 'Dismiss selected alerts'


@admin.register(AlertConfiguration)
class AlertConfigurationAdmin(admin.ModelAdmin):
    list_display = ('id', 'is_active', 'late_threshold_minutes', 'missed_threshold_minutes', 'created_at')
    list_filter = ('is_active', 'send_email_alerts', 'send_sms_alerts')
    readonly_fields = ('created_at', 'updated_at')
    
    fieldsets = (
        ('Threshold Settings', {
            'fields': ('late_threshold_minutes', 'missed_threshold_minutes', 'upcoming_reminder_minutes', 'overdue_followup_days')
        }),
        ('Auto-Resolution', {
            'fields': ('auto_resolve_on_checkin', 'auto_dismiss_after_days')
        }),
        ('Notifications', {
            'fields': ('send_email_alerts', 'send_sms_alerts')
        }),
        ('Status', {
            'fields': ('is_active',)
        }),
        ('System', {
            'fields': ('created_by', 'created_at', 'updated_at'),
            'classes': ('collapse',)
        }),
    )
    
    actions = ['activate_configuration']
    
    def activate_configuration(self, request, queryset):
        """Activate selected configuration"""
        if queryset.count() > 1:
            self.message_user(request, 'Please select only one configuration to activate.', level='error')
            return
        
        # Deactivate all
        AlertConfiguration.objects.all().update(is_active=False)
        
        # Activate selected
        config = queryset.first()
        config.is_active = True
        config.save()
        
        self.message_user(request, f'Configuration activated successfully.')
    activate_configuration.short_description = 'Activate selected configuration'

