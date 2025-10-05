"""
Consultation models for PreciseOptics Eye Hospital Management System
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from patients.models import Patient, PatientVisit
from accounts.models import CustomUser
import uuid


class Consultation(models.Model):
    """
    Patient consultation records
    """
    CONSULTATION_TYPES = (
        ('initial', 'Initial Consultation'),
        ('follow_up', 'Follow-up Consultation'),
        ('emergency', 'Emergency Consultation'),
        ('pre_operative', 'Pre-operative Assessment'),
        ('post_operative', 'Post-operative Follow-up'),
        ('routine_check', 'Routine Check-up'),
        ('second_opinion', 'Second Opinion'),
    )
    
    CONSULTATION_STATUS = (
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('no_show', 'No Show'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='consultations')
    visit = models.ForeignKey(PatientVisit, on_delete=models.CASCADE, related_name='consultations')
    consulting_doctor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='consultations')
    
    # Consultation Details
    consultation_type = models.CharField(max_length=20, choices=CONSULTATION_TYPES)
    status = models.CharField(max_length=20, choices=CONSULTATION_STATUS, default='scheduled')
    
    # Timing
    scheduled_time = models.DateTimeField()
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    
    # Chief Complaint and History
    chief_complaint = models.TextField(help_text="Patient's primary concern")
    history_of_present_illness = models.TextField(blank=True)
    past_ocular_history = models.TextField(blank=True)
    past_medical_history = models.TextField(blank=True)
    family_history = models.TextField(blank=True)
    social_history = models.TextField(blank=True)
    
    # Current Medications
    current_medications = models.TextField(blank=True)
    allergies = models.TextField(blank=True)
    
    # Physical Examination
    general_examination = models.TextField(blank=True)
    
    # Assessment and Plan
    clinical_impression = models.TextField(blank=True)
    diagnosis_primary = models.TextField(blank=True)
    diagnosis_secondary = models.TextField(blank=True)
    treatment_plan = models.TextField(blank=True)
    
    # Follow-up
    follow_up_required = models.BooleanField(default=False)
    follow_up_duration = models.CharField(max_length=100, blank=True)
    follow_up_instructions = models.TextField(blank=True)
    
    # Referrals
    referral_required = models.BooleanField(default=False)
    referral_to = models.CharField(max_length=200, blank=True)
    referral_reason = models.TextField(blank=True)
    
    # Doctor's Notes
    consultation_notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Consultation"
        verbose_name_plural = "Consultations"
        ordering = ['-scheduled_time']
    
    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.get_consultation_type_display()} ({self.scheduled_time.date()})"
    
    def get_duration_minutes(self):
        if self.actual_start_time and self.actual_end_time:
            duration = self.actual_end_time - self.actual_start_time
            return duration.total_seconds() / 60
        return None


class VitalSigns(models.Model):
    """
    Patient vital signs during consultation
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consultation = models.OneToOneField(Consultation, on_delete=models.CASCADE, related_name='vital_signs')
    
    # Basic Vitals
    blood_pressure_systolic = models.PositiveIntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(50), MaxValueValidator(300)]
    )
    blood_pressure_diastolic = models.PositiveIntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(30), MaxValueValidator(200)]
    )
    heart_rate = models.PositiveIntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(30), MaxValueValidator(220)]
    )
    temperature = models.DecimalField(
        max_digits=4, 
        decimal_places=1, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(30.0), MaxValueValidator(45.0)]
    )
    respiratory_rate = models.PositiveIntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(8), MaxValueValidator(60)]
    )
    oxygen_saturation = models.PositiveIntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(70), MaxValueValidator(100)]
    )
    
    # Additional Measurements
    height_cm = models.DecimalField(
        max_digits=5, 
        decimal_places=1, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(50.0), MaxValueValidator(250.0)]
    )
    weight_kg = models.DecimalField(
        max_digits=5, 
        decimal_places=1, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(10.0), MaxValueValidator(300.0)]
    )
    bmi = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(10.0), MaxValueValidator(50.0)]
    )
    
    # Notes
    notes = models.TextField(blank=True)
    measured_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Vital Signs"
        verbose_name_plural = "Vital Signs"
    
    def __str__(self):
        return f"Vital Signs for {self.consultation.patient.get_full_name()}"
    
    def calculate_bmi(self):
        if self.height_cm and self.weight_kg:
            height_m = self.height_cm / 100
            return round(self.weight_kg / (height_m ** 2), 2)
        return None


class ConsultationDocument(models.Model):
    """
    Documents related to consultations
    """
    DOCUMENT_TYPES = (
        ('consultation_notes', 'Consultation Notes'),
        ('medical_certificate', 'Medical Certificate'),
        ('referral_letter', 'Referral Letter'),
        ('treatment_plan', 'Treatment Plan'),
        ('discharge_summary', 'Discharge Summary'),
        ('consent_form', 'Consent Form'),
        ('report', 'Medical Report'),
        ('other', 'Other'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, related_name='documents')
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=200)
    content = models.TextField(blank=True)
    file = models.FileField(upload_to='consultation_documents/', null=True, blank=True)
    
    # Metadata
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Consultation Document"
        verbose_name_plural = "Consultation Documents"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.consultation.patient.get_full_name()}"


class ConsultationImage(models.Model):
    """
    Images taken during consultation
    """
    IMAGE_TYPES = (
        ('fundus_photo', 'Fundus Photography'),
        ('anterior_segment', 'Anterior Segment'),
        ('external_eye', 'External Eye'),
        ('oct', 'OCT Image'),
        ('visual_field', 'Visual Field'),
        ('angiogram', 'Angiogram'),
        ('ultrasound', 'Ultrasound'),
        ('x_ray', 'X-Ray'),
        ('other', 'Other'),
    )
    
    EYE_SIDE = (
        ('both', 'Both Eyes'),
        ('left', 'Left Eye'),
        ('right', 'Right Eye'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, related_name='images')
    image_type = models.CharField(max_length=20, choices=IMAGE_TYPES)
    eye_side = models.CharField(max_length=10, choices=EYE_SIDE, default='both')
    
    # Image Details
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    image = models.ImageField(upload_to='consultation_images/')
    
    # Technical Details
    equipment_used = models.CharField(max_length=200, blank=True)
    settings = models.TextField(blank=True, help_text="Camera/equipment settings")
    
    # Annotations
    findings = models.TextField(blank=True)
    
    # Metadata
    taken_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Consultation Image"
        verbose_name_plural = "Consultation Images"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.consultation.patient.get_full_name()}"
