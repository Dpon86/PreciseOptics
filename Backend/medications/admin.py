"""
Admin configuration for medications app
"""
from django.contrib import admin
from .models import (
    Medication, Prescription, PrescriptionItem, MedicationAdministration,
    DrugAllergy, Manufacturer, MedicationCategory
)


@admin.register(Manufacturer)
class ManufacturerAdmin(admin.ModelAdmin):
    list_display = ('name', 'country', 'is_certified', 'is_active', 'created_at')
    list_filter = ('is_certified', 'is_active', 'country')
    search_fields = ('name', 'contact_person', 'email')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('created_by',)


@admin.register(MedicationCategory)
class MedicationCategoryAdmin(admin.ModelAdmin):
    list_display = ('name', 'parent_category', 'is_active', 'created_at')
    list_filter = ('is_active', 'parent_category')
    search_fields = ('name', 'description')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('created_by', 'parent_category')


@admin.register(Medication)
class MedicationAdmin(admin.ModelAdmin):
    list_display = ('name', 'generic_name', 'medication_type', 'therapeutic_class', 'category', 'manufacturer_fk', 'strength', 'current_stock', 'is_low_stock', 'unit_price')
    list_filter = ('medication_type', 'therapeutic_class', 'approval_status', 'category', 'manufacturer_fk')
    search_fields = ('name', 'generic_name', 'brand_names', 'manufacturer')
    readonly_fields = ('created_at', 'updated_at')
    raw_id_fields = ('created_by', 'manufacturer_fk', 'category')
    
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
