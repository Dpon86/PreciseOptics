"""
Serializers for PreciseOptics Eye Hospital Management System - Patients
"""
from rest_framework import serializers
from .models import Patient, PatientVisit, PatientDocument, AppointmentAlert, AlertConfiguration


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


class AppointmentAlertSerializer(serializers.ModelSerializer):
    """
    Serializer for AppointmentAlert model
    """
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    patient_id_display = serializers.CharField(source='patient.patient_id', read_only=True)
    visit_details = serializers.SerializerMethodField()
    acknowledged_by_name = serializers.CharField(source='acknowledged_by.get_full_name', read_only=True)
    resolved_by_name = serializers.CharField(source='resolved_by.get_full_name', read_only=True)
    time_since_trigger = serializers.SerializerMethodField()
    
    class Meta:
        model = AppointmentAlert
        fields = [
            'id', 'patient', 'patient_name', 'patient_id_display', 'visit', 'visit_details',
            'alert_type', 'severity', 'status', 'title', 'message',
            'trigger_time', 'time_since_trigger',
            'acknowledged_at', 'acknowledged_by', 'acknowledged_by_name',
            'resolved_at', 'resolved_by', 'resolved_by_name',
            'action_taken', 'notes',
            'created_at', 'updated_at'
        ]
        read_only_fields = [
            'id', 'patient_name', 'patient_id_display', 'visit_details',
            'acknowledged_by_name', 'resolved_by_name', 'time_since_trigger',
            'created_at', 'updated_at'
        ]
    
    def get_visit_details(self, obj):
        """Return visit information if visit exists"""
        if obj.visit:
            return {
                'id': str(obj.visit.id),
                'visit_type': obj.visit.visit_type,
                'scheduled_date': obj.visit.scheduled_date,
                'status': obj.visit.status
            }
        return None
    
    def get_time_since_trigger(self, obj):
        """Calculate time since alert was triggered"""
        from django.utils import timezone
        delta = timezone.now() - obj.trigger_time
        hours = delta.total_seconds() / 3600
        
        if hours < 1:
            return f"{int(delta.total_seconds() / 60)} minutes ago"
        elif hours < 24:
            return f"{int(hours)} hours ago"
        else:
            return f"{int(hours / 24)} days ago"


class AppointmentAlertListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for alert lists
    """
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    patient_id_display = serializers.CharField(source='patient.patient_id', read_only=True)
    time_since_trigger = serializers.SerializerMethodField()
    
    class Meta:
        model = AppointmentAlert
        fields = [
            'id', 'patient', 'patient_name', 'patient_id_display',
            'alert_type', 'severity', 'status', 'title',
            'trigger_time', 'time_since_trigger',
            'created_at'
        ]
        read_only_fields = fields
    
    def get_time_since_trigger(self, obj):
        """Calculate time since alert was triggered"""
        from django.utils import timezone
        delta = timezone.now() - obj.trigger_time
        hours = delta.total_seconds() / 3600
        
        if hours < 1:
            return f"{int(delta.total_seconds() / 60)}m"
        elif hours < 24:
            return f"{int(hours)}h"
        else:
            return f"{int(hours / 24)}d"


class AppointmentAlertCreateSerializer(serializers.ModelSerializer):
    """
    Serializer for creating alerts manually
    """
    class Meta:
        model = AppointmentAlert
        fields = [
            'patient', 'visit', 'alert_type', 'severity',
            'title', 'message', 'trigger_time', 'notes'
        ]
    
    def create(self, validated_data):
        """Create alert with default status"""
        validated_data['status'] = 'active'
        return AppointmentAlert.objects.create(**validated_data)


class AlertConfigurationSerializer(serializers.ModelSerializer):
    """
    Serializer for AlertConfiguration model
    """
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    
    class Meta:
        model = AlertConfiguration
        fields = [
            'id', 'late_threshold_minutes', 'missed_threshold_minutes',
            'upcoming_reminder_minutes', 'overdue_followup_days',
            'auto_resolve_on_checkin', 'auto_dismiss_after_days',
            'send_email_alerts', 'send_sms_alerts',
            'is_active', 'created_at', 'updated_at',
            'created_by', 'created_by_name'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'created_by_name']
