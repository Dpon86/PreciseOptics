"""
Serializers for PreciseOptics Eye Hospital Management System - Patients
"""
from rest_framework import serializers
from .models import Patient, PatientVisit, PatientDocument


class PatientSerializer(serializers.ModelSerializer):
    """
    Serializer for Patient model
    """
    full_name = serializers.SerializerMethodField()
    age = serializers.SerializerMethodField()
    
    class Meta:
        model = Patient
        fields = [
            'id', 'patient_id', 'first_name', 'last_name', 'middle_name', 'full_name',
            'date_of_birth', 'age', 'gender', 'blood_group', 
            'phone_number', 'alternate_phone', 'email',
            'address_line_1', 'address_line_2', 'city', 'state', 'postal_code', 'country',
            'emergency_contact_name', 'emergency_contact_relationship', 'emergency_contact_phone',
            'insurance_provider', 'insurance_number', 'nhs_number',
            'allergies', 'medical_history', 'current_medications',
            'is_active', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'full_name', 'age', 'created_at', 'updated_at']
    
    def get_full_name(self, obj):
        """Return full name of the patient"""
        if obj.middle_name:
            return f"{obj.first_name} {obj.middle_name} {obj.last_name}"
        return f"{obj.first_name} {obj.last_name}"
    
    def get_age(self, obj):
        """Calculate and return age of the patient"""
        from datetime import date
        today = date.today()
        return today.year - obj.date_of_birth.year - ((today.month, today.day) < (obj.date_of_birth.month, obj.date_of_birth.day))


class PatientVisitSerializer(serializers.ModelSerializer):
    """
    Serializer for PatientVisit model
    """
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    primary_doctor_name = serializers.CharField(source='primary_doctor.get_full_name', read_only=True)
    
    class Meta:
        model = PatientVisit
        fields = [
            'id', 'patient', 'patient_name', 'visit_type', 'status',
            'scheduled_date', 'actual_arrival_time', 'check_in_time',
            'consultation_start_time', 'consultation_end_time',
            'primary_doctor', 'primary_doctor_name', 'attending_staff',
            'chief_complaint', 'notes', 'total_cost', 'payment_status',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'patient_name', 'primary_doctor_name', 'created_at', 'updated_at']


class PatientCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating new patients with required fields only
    """
    class Meta:
        model = Patient
        fields = [
            'first_name', 'last_name', 'middle_name', 'date_of_birth', 'gender',
            'phone_number', 'alternate_phone', 'email',
            'address_line_1', 'address_line_2', 'city', 'state', 'postal_code', 'country',
            'emergency_contact_name', 'emergency_contact_relationship', 'emergency_contact_phone',
            'insurance_provider', 'insurance_number', 'nhs_number',
            'allergies', 'medical_history', 'current_medications', 'blood_group'
        ]
    
    def create(self, validated_data):
        """
        Create a new patient with auto-generated patient_id
        """
        # Generate unique patient ID
        import random
        import string
        from django.db import IntegrityError
        
        while True:
            patient_id = 'PAT' + ''.join(random.choices(string.digits, k=6))
            try:
                validated_data['patient_id'] = patient_id
                return Patient.objects.create(**validated_data)
            except IntegrityError:
                # Patient ID already exists, try again
                continue


class PatientDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for PatientDocument model
    """
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    
    class Meta:
        model = PatientDocument
        fields = [
            'id', 'patient', 'patient_name', 'document_type', 'title',
            'description', 'file', 'uploaded_by', 'uploaded_by_name',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'patient_name', 'uploaded_by_name', 'created_at', 'updated_at']