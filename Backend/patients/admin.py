"""
Admin configuration for patients app
"""
from django.contrib import admin
from .models import Patient, PatientVisit, PatientDocument


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
