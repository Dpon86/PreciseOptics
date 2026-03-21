"""
Referral Management models for PreciseOptics Eye Hospital Management System
Tracks patient referrals to/from specialists and other healthcare providers
"""
from django.db import models
from django.core.validators import EmailValidator, RegexValidator
from patients.models import Patient
from accounts.models import CustomUser
import uuid


class ReferralSource(models.Model):
    """
    Healthcare providers, hospitals, or clinics that can send/receive referrals
    """
    SOURCE_TYPES = (
        ('ophthalmologist', 'Ophthalmologist'),
        ('optometrist', 'Optometrist'),
        ('hospital', 'Hospital'),
        ('clinic', 'Clinic'),
        ('gp', 'General Practitioner'),
        ('specialist', 'Medical Specialist'),
        ('other', 'Other'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, help_text="Name of provider/facility")
    source_type = models.CharField(max_length=20, choices=SOURCE_TYPES)
    
    # Contact Information
    contact_person = models.CharField(max_length=200, blank=True)
    email = models.EmailField(validators=[EmailValidator()], blank=True)
    phone = models.CharField(
        max_length=20,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$')],
        blank=True,
        help_text="Phone number"
    )
    fax = models.CharField(max_length=20, blank=True)
    
    # Address
    address_line1 = models.CharField(max_length=255, blank=True)
    address_line2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100, blank=True)
    state = models.CharField(max_length=100, blank=True)
    postal_code = models.CharField(max_length=20, blank=True)
    country = models.CharField(max_length=100, default='United Kingdom')
    
    # Additional Info
    specialties = models.TextField(help_text="Areas of specialty", blank=True)
    notes = models.TextField(blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    is_preferred = models.BooleanField(default=False, help_text="Preferred referral partner")
    
    # Statistics
    total_referrals_sent = models.IntegerField(default=0)
    total_referrals_received = models.IntegerField(default=0)
    average_response_time_days = models.DecimalField(
        max_digits=5,
        decimal_places=1,
        null=True,
        blank=True,
        help_text="Average days to respond"
    )
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='referral_sources_created'
    )
    
    class Meta:
        ordering = ['name']
        indexes = [
            models.Index(fields=['source_type', 'is_active']),
            models.Index(fields=['is_preferred', 'is_active']),
        ]
    
    def __str__(self):
        return f"{self.name} ({self.get_source_type_display()})"


class Referral(models.Model):
    """
    Patient referrals to/from other healthcare providers
    """
    REFERRAL_DIRECTIONS = (
        ('outgoing', 'Outgoing (To Specialist)'),
        ('incoming', 'Incoming (From Provider)'),
    )
    
    URGENCY_LEVELS = (
        ('routine', 'Routine'),
        ('soon', 'Soon (2-4 weeks)'),
        ('urgent', 'Urgent (within 1 week)'),
        ('emergency', 'Emergency (same day)'),
    )
    
    REFERRAL_STATUS = (
        ('draft', 'Draft'),
        ('pending', 'Pending'),
        ('sent', 'Sent'),
        ('acknowledged', 'Acknowledged'),
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('rejected', 'Rejected'),
    )
    
    REFERRAL_REASONS = (
        ('specialist_opinion', 'Specialist Opinion Required'),
        ('surgical_evaluation', 'Surgical Evaluation'),
        ('advanced_imaging', 'Advanced Imaging/Diagnostics'),
        ('subspecialty_care', 'Subspecialty Care'),
        ('treatment_not_available', 'Treatment Not Available Here'),
        ('patient_request', 'Patient Request'),
        ('second_opinion', 'Second Opinion'),
        ('emergency', 'Emergency Care'),
        ('follow_up', 'Follow-up Care'),
        ('other', 'Other'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referral_number = models.CharField(
        max_length=50,
        unique=True,
        help_text="Unique referral tracking number"
    )
    
    # Core Information
    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name='referrals'
    )
    direction = models.CharField(max_length=20, choices=REFERRAL_DIRECTIONS)
    referral_source = models.ForeignKey(
        ReferralSource,
        on_delete=models.PROTECT,
        related_name='referrals'
    )
    
    # Referral Details
    reason = models.CharField(max_length=50, choices=REFERRAL_REASONS)
    urgency = models.CharField(max_length=20, choices=URGENCY_LEVELS, default='routine')
    clinical_summary = models.TextField(help_text="Clinical summary and reason for referral")
    relevant_history = models.TextField(blank=True, help_text="Relevant medical history")
    current_medications = models.TextField(blank=True)
    allergies = models.TextField(blank=True)
    
    # Specific Requirements
    specific_questions = models.TextField(
        blank=True,
        help_text="Specific questions or concerns to address"
    )
    requested_services = models.TextField(
        blank=True,
        help_text="Specific tests or procedures requested"
    )
    
    # Status Tracking
    current_status = models.CharField(max_length=20, choices=REFERRAL_STATUS, default='draft')
    status_notes = models.TextField(blank=True)
    
    # Dates
    referral_date = models.DateField(help_text="Date referral was created")
    sent_date = models.DateField(null=True, blank=True)
    acknowledged_date = models.DateField(null=True, blank=True)
    appointment_date = models.DateField(null=True, blank=True)
    completion_date = models.DateField(null=True, blank=True)
    
    # User Tracking
    referred_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='referrals_made',
        help_text="Staff member who made the referral"
    )
    reviewed_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='referrals_reviewed',
        help_text="Staff member who reviewed/approved"
    )
    
    # Outcome
    outcome_summary = models.TextField(blank=True, help_text="Summary of referral outcome")
    follow_up_required = models.BooleanField(default=False)
    follow_up_notes = models.TextField(blank=True)
    
    # Metadata
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='referrals_created'
    )
    
    class Meta:
        ordering = ['-referral_date', '-created_at']
        indexes = [
            models.Index(fields=['patient', 'current_status']),
            models.Index(fields=['referral_source', 'direction']),
            models.Index(fields=['current_status', 'urgency']),
            models.Index(fields=['referral_date']),
        ]
    
    def __str__(self):
        return f"Referral {self.referral_number} - {self.patient} to {self.referral_source}"
    
    def save(self, *args, **kwargs):
        # Auto-generate referral number if not set
        if not self.referral_number:
            from django.utils import timezone
            timestamp = timezone.now().strftime('%Y%m%d%H%M%S')
            self.referral_number = f"REF-{timestamp}"
        super().save(*args, **kwargs)


class ReferralDocument(models.Model):
    """
    Documents attached to referrals (letters, test results, images, etc.)
    """
    DOCUMENT_TYPES = (
        ('referral_letter', 'Referral Letter'),
        ('test_results', 'Test Results'),
        ('imaging', 'Imaging/Scans'),
        ('medical_records', 'Medical Records'),
        ('consent_form', 'Consent Form'),
        ('response_letter', 'Response Letter'),
        ('discharge_summary', 'Discharge Summary'),
        ('other', 'Other'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referral = models.ForeignKey(
        Referral,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPES)
    file = models.FileField(upload_to='referral_documents/%Y/%m/')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True)
    
    # Metadata
    uploaded_at = models.DateTimeField(auto_now_add=True)
    uploaded_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='referral_documents_uploaded'
    )
    
    class Meta:
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.get_document_type_display()} - {self.title}"


class ReferralResponse(models.Model):
    """
    Responses/communications related to referrals
    """
    RESPONSE_TYPES = (
        ('acknowledgment', 'Acknowledgment'),
        ('appointment_scheduled', 'Appointment Scheduled'),
        ('additional_info_requested', 'Additional Info Requested'),
        ('clinical_report', 'Clinical Report'),
        ('discharge_summary', 'Discharge Summary'),
        ('follow_up_recommendation', 'Follow-up Recommendation'),
        ('outcome_report', 'Outcome Report'),
        ('rejection', 'Referral Rejected'),
        ('other', 'Other'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    referral = models.ForeignKey(
        Referral,
        on_delete=models.CASCADE,
        related_name='responses'
    )
    
    response_type = models.CharField(max_length=40, choices=RESPONSE_TYPES)
    response_date = models.DateField()
    response_content = models.TextField(help_text="Content of the response")
    
    # If appointment scheduled
    appointment_date = models.DateTimeField(null=True, blank=True)
    appointment_location = models.CharField(max_length=255, blank=True)
    
    # Additional Information
    additional_tests_required = models.TextField(blank=True)
    recommendations = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='referral_responses_created'
    )
    
    class Meta:
        ordering = ['-response_date', '-created_at']
    
    def __str__(self):
        return f"{self.get_response_type_display()} for {self.referral.referral_number}"
