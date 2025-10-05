"""
Patient models for PreciseOptics Eye Hospital Management System
"""
from django.db import models
from django.core.validators import RegexValidator
from accounts.models import CustomUser
import uuid


class Patient(models.Model):
    """
    Patient information model
    """
    GENDER_CHOICES = (
        ('M', 'Male'),
        ('F', 'Female'),
        ('O', 'Other'),
        ('N', 'Prefer not to say'),
    )
    
    BLOOD_GROUP_CHOICES = (
        ('A+', 'A+'),
        ('A-', 'A-'),
        ('B+', 'B+'),
        ('B-', 'B-'),
        ('AB+', 'AB+'),
        ('AB-', 'AB-'),
        ('O+', 'O+'),
        ('O-', 'O-'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_id = models.CharField(max_length=20, unique=True, help_text="Hospital Patient ID")
    
    # Personal Information
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    middle_name = models.CharField(max_length=100, blank=True)
    date_of_birth = models.DateField()
    gender = models.CharField(max_length=1, choices=GENDER_CHOICES)
    blood_group = models.CharField(max_length=3, choices=BLOOD_GROUP_CHOICES, null=True, blank=True)
    
    # Contact Information
    phone_number = models.CharField(
        max_length=15,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$')],
    )
    alternate_phone = models.CharField(
        max_length=15,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$')],
        null=True,
        blank=True
    )
    email = models.EmailField(null=True, blank=True)
    
    # Address Information
    address_line_1 = models.CharField(max_length=255)
    address_line_2 = models.CharField(max_length=255, blank=True)
    city = models.CharField(max_length=100)
    state = models.CharField(max_length=100)
    postal_code = models.CharField(max_length=20)
    country = models.CharField(max_length=100, default='UK')
    
    # Emergency Contact
    emergency_contact_name = models.CharField(max_length=200)
    emergency_contact_phone = models.CharField(
        max_length=15,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$')],
    )
    emergency_contact_relationship = models.CharField(max_length=50)
    
    # Insurance Information
    insurance_provider = models.CharField(max_length=200, null=True, blank=True)
    insurance_number = models.CharField(max_length=100, null=True, blank=True)
    nhs_number = models.CharField(max_length=20, unique=True, null=True, blank=True)
    
    # Medical Information
    allergies = models.TextField(blank=True, help_text="Known allergies")
    current_medications = models.TextField(blank=True)
    medical_history = models.TextField(blank=True)
    
    # Registration Information
    registration_date = models.DateTimeField(auto_now_add=True)
    registered_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Patient"
        verbose_name_plural = "Patients"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} ({self.patient_id})"
    
    def get_full_name(self):
        if self.middle_name:
            return f"{self.first_name} {self.middle_name} {self.last_name}"
        return f"{self.first_name} {self.last_name}"
    
    def get_age(self):
        from datetime import date
        today = date.today()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))


class PatientVisit(models.Model):
    """
    Track patient visits to the hospital
    """
    VISIT_TYPES = (
        ('consultation', 'Consultation'),
        ('follow_up', 'Follow-up'),
        ('emergency', 'Emergency'),
        ('surgery', 'Surgery'),
        ('diagnostic', 'Diagnostic'),
        ('routine_check', 'Routine Check'),
    )
    
    VISIT_STATUS = (
        ('scheduled', 'Scheduled'),
        ('checked_in', 'Checked In'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='visits')
    visit_type = models.CharField(max_length=20, choices=VISIT_TYPES)
    status = models.CharField(max_length=20, choices=VISIT_STATUS, default='scheduled')
    
    # Visit Details
    scheduled_date = models.DateTimeField()
    actual_arrival_time = models.DateTimeField(null=True, blank=True)
    check_in_time = models.DateTimeField(null=True, blank=True)
    consultation_start_time = models.DateTimeField(null=True, blank=True)
    consultation_end_time = models.DateTimeField(null=True, blank=True)
    
    # Staff
    primary_doctor = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True, related_name='primary_visits')
    attending_staff = models.ManyToManyField(CustomUser, related_name='attended_visits', blank=True)
    
    # Visit Information
    chief_complaint = models.TextField(help_text="Primary reason for visit")
    notes = models.TextField(blank=True)
    
    # Billing
    total_cost = models.DecimalField(max_digits=10, decimal_places=2, default=0.00)
    payment_status = models.CharField(
        max_length=20,
        choices=(
            ('pending', 'Pending'),
            ('partial', 'Partial'),
            ('paid', 'Paid'),
            ('insurance_claim', 'Insurance Claim'),
        ),
        default='pending'
    )
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Patient Visit"
        verbose_name_plural = "Patient Visits"
        ordering = ['-scheduled_date']
    
    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.get_visit_type_display()} ({self.scheduled_date.date()})"


class PatientDocument(models.Model):
    """
    Store patient documents and images
    """
    DOCUMENT_TYPES = (
        ('id_proof', 'ID Proof'),
        ('insurance', 'Insurance Card'),
        ('medical_report', 'Medical Report'),
        ('prescription', 'Prescription'),
        ('test_result', 'Test Result'),
        ('consent_form', 'Consent Form'),
        ('discharge_summary', 'Discharge Summary'),
        ('referral_letter', 'Referral Letter'),
        ('photograph', 'Patient Photograph'),
        ('other', 'Other'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='patient_documents/')
    uploaded_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Patient Document"
        verbose_name_plural = "Patient Documents"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.title}"
