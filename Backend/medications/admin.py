"""
Admin configuration for medications app
"""
from django.contrib import admin
from .models import Medication, Prescription, PrescriptionItem, MedicationAdministration, DrugAllergy


@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    list_display = ('name', 'generic_name', 'medication_type', 'therapeutic_class', 'strength', 'current_stock', 'is_low_stock', 'unit_price')
    list_filter = ('medication_type', 'therapeutic_class', 'approval_status')
    search_fields = ('name', 'generic_name', 'brand_names')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('created_by',)
    
    def is_low_stock(self, obj):
        return obj.is_low_stock()
    is_low_stock.boolean = True
    is_low_stock.short_description = 'Low Stock'


@admin.register(Prescription)
class PrescriptionAdmin(admin.ModelAdmin):
    list_display = ('prescription_number', 'patient', 'prescribing_doctor', 'status', 'date_prescribed', 'valid_until')
    list_filter = ('status', 'date_prescribed')
    search_fields = ('prescription_number', 'patient__first_name', 'patient__last_name')
    raw_id_fields = ('patient', 'visit', 'prescribing_doctor')


@admin.register(PrescriptionItem)
class PrescriptionItemAdmin(admin.ModelAdmin):
    list_display = ('prescription', 'medication', 'dosage', 'frequency', 'duration_days', 'quantity_prescribed')
    list_filter = ('frequency', 'eye_side')
    search_fields = ('prescription__prescription_number', 'medication__name')
    raw_id_fields = ('prescription', 'medication')


@admin.register(MedicationAdministration)
class MedicationAdministrationAdmin(admin.ModelAdmin):
    list_display = ('patient', 'medication', 'administered_by', 'administration_time', 'route', 'verified_by')
    list_filter = ('route', 'administration_time')
    search_fields = ('patient__first_name', 'patient__last_name', 'medication__name')
    raw_id_fields = ('patient', 'visit', 'medication', 'administered_by', 'verified_by')


@admin.register(DrugAllergy)
class DrugAllergyAdmin(admin.ModelAdmin):
    list_display = ('patient', 'medication', 'reaction_type', 'severity', 'first_occurrence_date', 'is_active')
    list_filter = ('reaction_type', 'severity', 'is_active')
    search_fields = ('patient__first_name', 'patient__last_name', 'medication__name')
    raw_id_fields = ('patient', 'medication', 'documented_by')
