"""
Serializers for referrals app
"""
from rest_framework import serializers
from .models import ReferralSource, Referral, ReferralDocument, ReferralResponse
from accounts.serializers import CustomUserSerializer
from patients.serializers import PatientSerializer
from precise_optics.file_validators import validate_document_extension, validate_file_size


class ReferralSourceSerializer(serializers.ModelSerializer):
    """
    Serializer for ReferralSource model
    """
    created_by_details = CustomUserSerializer(source='created_by', read_only=True)
    active_referrals_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ReferralSource
        fields = [
            'id', 'name', 'source_type', 'contact_person', 'email', 'phone', 'fax',
            'address_line1', 'address_line2', 'city', 'state', 'postal_code', 'country',
            'specialties', 'notes', 'is_active', 'is_preferred',
            'total_referrals_sent', 'total_referrals_received', 'average_response_time_days',
            'created_at', 'updated_at', 'created_by', 'created_by_details',
            'active_referrals_count'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at', 'total_referrals_sent',
                            'total_referrals_received', 'average_response_time_days']
    
    def get_active_referrals_count(self, obj):
        """Get count of active referrals for this source"""
        return obj.referrals.filter(
            is_active=True,
            current_status__in=['pending', 'sent', 'acknowledged', 'scheduled']
        ).count()


class ReferralSourceListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing referral sources
    """
    active_referrals_count = serializers.SerializerMethodField()
    
    class Meta:
        model = ReferralSource
        fields = ['id', 'name', 'source_type', 'email', 'phone', 'is_active',
                  'is_preferred', 'total_referrals_sent', 'total_referrals_received',
                  'active_referrals_count']
    
    def get_active_referrals_count(self, obj):
        return obj.referrals.filter(
            is_active=True,
            current_status__in=['pending', 'sent', 'acknowledged', 'scheduled']
        ).count()


class ReferralDocumentSerializer(serializers.ModelSerializer):
    """
    Serializer for ReferralDocument model
    """
    uploaded_by_details = CustomUserSerializer(source='uploaded_by', read_only=True)
    uploaded_by_name = serializers.CharField(source='uploaded_by.get_full_name', read_only=True)
    file_name = serializers.SerializerMethodField()
    file_size = serializers.SerializerMethodField()
    
    class Meta:
        model = ReferralDocument
        fields = [
            'id', 'referral', 'document_type', 'file', 'title', 'description',
            'uploaded_at', 'uploaded_by', 'uploaded_by_details', 'uploaded_by_name',
            'file_name', 'file_size'
        ]
        read_only_fields = ['id', 'uploaded_at']
    
    def validate_file(self, value):
        validate_document_extension(value)
        validate_file_size(value)
        return value
    
    def get_file_name(self, obj):
        """Extract filename from file path"""
        if obj.file:
            return obj.file.name.split('/')[-1]
        return None
    
    def get_file_size(self, obj):
        """Get file size in bytes"""
        if obj.file:
            try:
                return obj.file.size
            except:
                return None
        return None


class ReferralResponseSerializer(serializers.ModelSerializer):
    """
    Serializer for ReferralResponse model
    """
    created_by_details = CustomUserSerializer(source='created_by', read_only=True)
    created_by_name = serializers.CharField(source='created_by.get_full_name', read_only=True)
    referral_number = serializers.CharField(source='referral.referral_number', read_only=True)
    
    class Meta:
        model = ReferralResponse
        fields = [
            'id', 'referral', 'referral_number', 'response_type', 'response_date',
            'response_content', 'appointment_date', 'appointment_location',
            'additional_tests_required', 'recommendations', 'created_at',
            'created_by', 'created_by_details', 'created_by_name'
        ]
        read_only_fields = ['id', 'created_at']


class ReferralSerializer(serializers.ModelSerializer):
    """
    Serializer for Referral model
    """
    patient_details = PatientSerializer(source='patient', read_only=True)
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    referral_source_details = ReferralSourceListSerializer(source='referral_source', read_only=True)
    referral_source_name = serializers.CharField(source='referral_source.name', read_only=True)
    referred_by_details = CustomUserSerializer(source='referred_by', read_only=True)
    referred_by_name = serializers.CharField(source='referred_by.get_full_name', read_only=True)
    reviewed_by_details = CustomUserSerializer(source='reviewed_by', read_only=True)
    reviewed_by_name = serializers.CharField(source='reviewed_by.get_full_name', read_only=True)
    created_by_details = CustomUserSerializer(source='created_by', read_only=True)
    
    # Nested relationships
    documents = ReferralDocumentSerializer(many=True, read_only=True)
    responses = ReferralResponseSerializer(many=True, read_only=True)
    
    # Computed fields
    days_since_referral = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    
    class Meta:
        model = Referral
        fields = [
            'id', 'referral_number', 'patient', 'patient_details', 'patient_name',
            'direction', 'referral_source', 'referral_source_details', 'referral_source_name',
            'reason', 'urgency', 'clinical_summary', 'relevant_history',
            'current_medications', 'allergies', 'specific_questions', 'requested_services',
            'current_status', 'status_notes', 'referral_date', 'sent_date',
            'acknowledged_date', 'appointment_date', 'completion_date',
            'referred_by', 'referred_by_details', 'referred_by_name',
            'reviewed_by', 'reviewed_by_details', 'reviewed_by_name',
            'outcome_summary', 'follow_up_required', 'follow_up_notes',
            'is_active', 'created_at', 'updated_at', 'created_by', 'created_by_details',
            'documents', 'responses', 'days_since_referral', 'is_overdue'
        ]
        read_only_fields = ['id', 'referral_number', 'created_at', 'updated_at']
    
    def get_days_since_referral(self, obj):
        """Calculate days since referral was created"""
        if obj.referral_date:
            from datetime import date
            delta = date.today() - obj.referral_date
            return delta.days
        return None
    
    def get_is_overdue(self, obj):
        """Check if referral is overdue based on urgency and status"""
        from datetime import date, timedelta
        
        if obj.current_status in ['completed', 'cancelled', 'rejected']:
            return False
        
        if not obj.referral_date:
            return False
        
        # Define urgency timeframes
        urgency_days = {
            'routine': 30,
            'soon': 21,
            'urgent': 7,
            'emergency': 1
        }
        
        days_threshold = urgency_days.get(obj.urgency, 30)
        threshold_date = obj.referral_date + timedelta(days=days_threshold)
        
        return date.today() > threshold_date


class ReferralListSerializer(serializers.ModelSerializer):
    """
    Lightweight serializer for listing referrals
    """
    patient_name = serializers.CharField(source='patient.get_full_name', read_only=True)
    referral_source_name = serializers.CharField(source='referral_source.name', read_only=True)
    referred_by_name = serializers.CharField(source='referred_by.get_full_name', read_only=True)
    days_since_referral = serializers.SerializerMethodField()
    is_overdue = serializers.SerializerMethodField()
    responses_count = serializers.SerializerMethodField()
    documents_count = serializers.SerializerMethodField()
    
    class Meta:
        model = Referral
        fields = [
            'id', 'referral_number', 'patient_name', 'referral_source_name',
            'direction', 'reason', 'urgency', 'current_status', 'referral_date',
            'sent_date', 'appointment_date', 'referred_by_name', 'is_active',
            'days_since_referral', 'is_overdue', 'responses_count', 'documents_count'
        ]
    
    def get_days_since_referral(self, obj):
        if obj.referral_date:
            from datetime import date
            delta = date.today() - obj.referral_date
            return delta.days
        return None
    
    def get_is_overdue(self, obj):
        from datetime import date, timedelta
        
        if obj.current_status in ['completed', 'cancelled', 'rejected']:
            return False
        
        if not obj.referral_date:
            return False
        
        urgency_days = {
            'routine': 30,
            'soon': 21,
            'urgent': 7,
            'emergency': 1
        }
        
        days_threshold = urgency_days.get(obj.urgency, 30)
        threshold_date = obj.referral_date + timedelta(days=days_threshold)
        
        return date.today() > threshold_date
    
    def get_responses_count(self, obj):
        return obj.responses.count()
    
    def get_documents_count(self, obj):
        return obj.documents.count()
