"""
Admin configuration for consultations app
"""
from django.contrib import admin
from .models import Consultation, VitalSigns, ConsultationDocument, ConsultationImage


@admin.register(Consultation)
class ConsultationAdmin(admin.ModelAdmin):
    list_display = ('patient', 'consulting_doctor', 'consultation_type', 'status', 'scheduled_time', 'follow_up_required')
    list_filter = ('consultation_type', 'status', 'follow_up_required', 'scheduled_time')
    search_fields = ('patient__first_name', 'patient__last_name', 'consulting_doctor__first_name', 'consulting_doctor__last_name')
    raw_id_fields = ('patient', 'visit', 'consulting_doctor')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(VitalSigns)
class VitalSignsAdmin(admin.ModelAdmin):
    list_display = ('consultation', 'blood_pressure_systolic', 'blood_pressure_diastolic', 'heart_rate', 'temperature', 'measured_by')
    search_fields = ('consultation__patient__first_name', 'consultation__patient__last_name')
    raw_id_fields = ('consultation', 'measured_by')
    readonly_fields = ('created_at', 'updated_at')


@admin.register(ConsultationDocument)
class ConsultationDocumentAdmin(admin.ModelAdmin):
    list_display = ('consultation', 'document_type', 'title', 'created_by', 'created_at')
    list_filter = ('document_type', 'created_at')
    search_fields = ('consultation__patient__first_name', 'consultation__patient__last_name', 'title')
    raw_id_fields = ('consultation', 'created_by')


@admin.register(ConsultationImage)
class ConsultationImageAdmin(admin.ModelAdmin):
    list_display = ('consultation', 'image_type', 'eye_side', 'title', 'taken_by', 'created_at')
    list_filter = ('image_type', 'eye_side', 'created_at')
    search_fields = ('consultation__patient__first_name', 'consultation__patient__last_name', 'title')
    raw_id_fields = ('consultation', 'taken_by')
