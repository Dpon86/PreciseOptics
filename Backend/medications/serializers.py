"""
Serializers for PreciseOptics Eye Hospital Management System - Medications
"""
from rest_framework import serializers
from .models import Medication, Prescription, PrescriptionItem, MedicationAdministration, DrugAllergy


class MedicationSerializer(serializers.ModelSerializer):
    """
    Serializer for Medication model
    """
    brand_names_list = serializers.SerializerMethodField()
    
    class Meta:
        model = Medication
        fields = [
            'id', 'name', 'generic_name', 'brand_names', 'brand_names_list',
            'medication_type', 'therapeutic_class', 'strength', 'active_ingredients',
            'description', 'indications', 'contraindications', 'side_effects',
            'standard_dosage', 'maximum_daily_dose', 'storage_temperature',
            'shelf_life_months', 'special_handling', 'manufacturer', 'batch_number',
            'expiry_date', 'approval_status', 'current_stock', 'minimum_stock_level',
            'unit_price', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'brand_names_list', 'created_at', 'updated_at']
    
    def get_brand_names_list(self, obj):
        """Convert comma-separated brand names to list"""
        if obj.brand_names:
            return [name.strip() for name in obj.brand_names.split(',')]
        return []


class PrescriptionItemSerializer(serializers.ModelSerializer):
    """
    Serializer for PrescriptionItem model
    """
    medication_name = serializers.CharField(source='medication.name', read_only=True)
    medication_strength = serializers.CharField(source='medication.strength', read_only=True)
    
    class Meta:
        model = PrescriptionItem
        fields = [
            'id', 'prescription', 'medication', 'medication_name', 'medication_strength',
            'dosage', 'frequency', 'custom_frequency', 'duration_days',
            'eye_side', 'special_instructions', 'quantity_prescribed',
            'quantity_dispensed', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'medication_name', 'medication_strength']


class PrescriptionSerializer(serializers.ModelSerializer):
    """
    Serializer for Prescription model
    """
    patient_name = serializers.CharField(source='patient.first_name', read_only=True)
    prescribed_by_name = serializers.CharField(source='prescribing_doctor.get_full_name', read_only=True)
    items = PrescriptionItemSerializer(many=True, read_only=True)
    total_items = serializers.SerializerMethodField()
    
    class Meta:
        model = Prescription
        fields = [
            'id', 'prescription_number', 'patient', 'patient_name', 'visit',
            'prescribing_doctor', 'prescribed_by_name', 'date_prescribed',
            'status', 'diagnosis', 'instructions', 'valid_until',
            'doctor_notes', 'pharmacy_notes',
            'items', 'total_items',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'prescription_number', 'patient_name', 'prescribed_by_name',
                           'items', 'total_items', 'created_at', 'updated_at', 'date_prescribed']
    
    def get_total_items(self, obj):
        """Count total prescription items"""
        return obj.items.count()


class MedicationAdministrationSerializer(serializers.ModelSerializer):
    """
    Serializer for MedicationAdministration model
    """
    medication_name = serializers.CharField(source='medication.name', read_only=True)
    administered_by_name = serializers.CharField(source='administered_by.get_full_name', read_only=True)
    patient_name = serializers.CharField(source='patient.first_name', read_only=True)
    
    class Meta:
        model = MedicationAdministration
        fields = [
            'id', 'patient', 'patient_name', 'medication', 'medication_name',
            'prescribed_dose', 'administered_dose', 'route', 'administration_time',
            'scheduled_time', 'administered_by', 'administered_by_name',
            'administration_method', 'site_of_administration', 'patient_response',
            'adverse_reactions', 'effectiveness_rating', 'pain_relief_rating',
            'next_dose_due', 'status', 'notes', 'created_at'
        ]
        read_only_fields = ['id', 'medication_name', 'administered_by_name', 'patient_name', 'created_at']


class DrugAllergySerializer(serializers.ModelSerializer):
    """
    Serializer for DrugAllergy model
    """
    patient_name = serializers.CharField(source='patient.first_name', read_only=True)
    reported_by_name = serializers.CharField(source='reported_by.get_full_name', read_only=True)
    
    class Meta:
        model = DrugAllergy
        fields = [
            'id', 'patient', 'patient_name', 'allergen_type', 'allergen_name',
            'generic_name', 'therapeutic_class', 'reaction_type', 'severity',
            'symptoms', 'onset_time', 'duration', 'treatment_required',
            'date_of_reaction', 'reported_by', 'reported_by_name', 'reported_date',
            'verified', 'verified_by', 'verified_date', 'cross_sensitivities',
            'alternative_medications', 'notes', 'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'patient_name', 'reported_by_name', 'created_at', 'updated_at']


class PrescriptionCreateSerializer(serializers.ModelSerializer):
    """
    Simplified serializer for creating prescriptions
    """
    class Meta:
        model = Prescription
        fields = [
            'patient', 'visit', 'prescribing_doctor', 
            'diagnosis', 'instructions', 'status', 'valid_until',
            'doctor_notes', 'pharmacy_notes'
        ]
    
    def create(self, validated_data):
        """Create prescription with auto-generated prescription number"""
        import random
        import string
        from django.db import IntegrityError
        
        while True:
            prescription_number = 'RX' + ''.join(random.choices(string.digits, k=8))
            try:
                validated_data['prescription_number'] = prescription_number
                return Prescription.objects.create(**validated_data)
            except IntegrityError:
                continue