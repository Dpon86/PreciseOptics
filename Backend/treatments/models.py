"""
Treatment models for PreciseOptics Eye Hospital Management System
Comprehensive treatment system for UK eye hospitals
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator, DecimalValidator
from django.contrib.contenttypes.models import ContentType
from django.contrib.contenttypes.fields import GenericForeignKey
from consultations.models import Consultation
from patients.models import Patient
from accounts.models import CustomUser
from medications.models import Medication
import uuid


class TreatmentCategory(models.Model):
    """
    Categories of treatments available in UK eye hospitals
    """
    CATEGORY_CHOICES = (
        ('medical', 'Medical Treatment'),
        ('surgical', 'Surgical Treatment'),
        ('laser', 'Laser Treatment'),
        ('injection', 'Injection Treatment'),
        ('optical', 'Optical Treatment'),
        ('therapy', 'Vision Therapy'),
        ('emergency', 'Emergency Treatment'),
        ('preventive', 'Preventive Care'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    category_type = models.CharField(max_length=20, choices=CATEGORY_CHOICES)
    description = models.TextField(blank=True)
    is_active = models.BooleanField(default=True)
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.PROTECT, related_name='created_treatment_categories')
    
    class Meta:
        verbose_name_plural = "Treatment Categories"
        ordering = ['category_type', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.get_category_type_display()})"


class TreatmentType(models.Model):
    """
    Specific treatment types within categories
    """
    URGENCY_LEVELS = (
        ('routine', 'Routine'),
        ('urgent', 'Urgent'),
        ('emergency', 'Emergency'),
    )
    
    ANESTHESIA_TYPES = (
        ('none', 'No Anesthesia'),
        ('topical', 'Topical Anesthesia'),
        ('local', 'Local Anesthesia'),
        ('regional', 'Regional Anesthesia'),
        ('general', 'General Anesthesia'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    category = models.ForeignKey(TreatmentCategory, on_delete=models.CASCADE, related_name='treatment_types')
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=20, unique=True, help_text="NHS/OPCS-4 procedure code")
    description = models.TextField()
    
    # Treatment characteristics
    typical_duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    requires_consent = models.BooleanField(default=False)
    requires_anesthesia = models.CharField(max_length=20, choices=ANESTHESIA_TYPES, default='none')
    urgency_level = models.CharField(max_length=20, choices=URGENCY_LEVELS, default='routine')
    
    # NHS/Clinical information
    nice_guidance = models.URLField(blank=True, help_text="Link to NICE guidance")
    contraindications = models.TextField(blank=True)
    complications = models.TextField(blank=True)
    success_rate_percentage = models.DecimalField(
        max_digits=5, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    
    # Cost and scheduling
    estimated_cost_gbp = models.DecimalField(
        max_digits=10, 
        decimal_places=2, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0)]
    )
    waiting_list_weeks = models.PositiveIntegerField(null=True, blank=True)
    
    is_active = models.BooleanField(default=True)
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.PROTECT, related_name='created_treatment_types')
    
    class Meta:
        ordering = ['category__name', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class Treatment(models.Model):
    """
    Individual treatment instances for patients
    """
    STATUS_CHOICES = (
        ('planned', 'Treatment Planned'),
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('postponed', 'Postponed'),
        ('failed', 'Failed'),
    )
    
    OUTCOME_CHOICES = (
        ('excellent', 'Excellent'),
        ('good', 'Good'),
        ('satisfactory', 'Satisfactory'),
        ('poor', 'Poor'),
        ('failed', 'Failed'),
        ('pending', 'Pending Assessment'),
    )
    
    EYE_CHOICES = (
        ('right', 'Right Eye (OD)'),
        ('left', 'Left Eye (OS)'),
        ('both', 'Both Eyes (OU)'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='treatments')
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, related_name='treatments')
    treatment_type = models.ForeignKey(TreatmentType, on_delete=models.PROTECT)
    
    # Treatment details
    eye_treated = models.CharField(max_length=10, choices=EYE_CHOICES)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='planned')
    priority = models.CharField(max_length=20, choices=TreatmentType.URGENCY_LEVELS, default='routine')
    
    # Personnel
    primary_surgeon = models.ForeignKey(
        CustomUser, 
        on_delete=models.PROTECT, 
        related_name='primary_treatments',
        limit_choices_to={'user_type__in': ['doctor', 'admin']}
    )
    assisting_staff = models.ManyToManyField(
        CustomUser, 
        blank=True, 
        related_name='assisted_treatments',
        limit_choices_to={'user_type__in': ['doctor', 'nurse', 'technician']}
    )
    
    # Scheduling
    scheduled_date = models.DateTimeField(null=True, blank=True)
    actual_start_time = models.DateTimeField(null=True, blank=True)
    actual_end_time = models.DateTimeField(null=True, blank=True)
    
    # Clinical information
    indication = models.TextField(help_text="Clinical indication for treatment")
    technique_notes = models.TextField(blank=True, help_text="Surgical technique and approach")
    anesthesia_used = models.CharField(max_length=20, choices=TreatmentType.ANESTHESIA_TYPES, blank=True)
    
    # Outcomes
    outcome = models.CharField(max_length=20, choices=OUTCOME_CHOICES, default='pending')
    complications_notes = models.TextField(blank=True, help_text="General complications notes")
    post_operative_instructions = models.TextField(blank=True)
    
    # Follow-up
    requires_follow_up = models.BooleanField(default=True)
    follow_up_weeks = models.PositiveIntegerField(null=True, blank=True)
    follow_up_instructions = models.TextField(blank=True)
    
    # Consent and documentation
    consent_obtained = models.BooleanField(default=False)
    consent_date = models.DateTimeField(null=True, blank=True)
    consent_obtained_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.PROTECT, 
        null=True, 
        blank=True,
        related_name='consented_treatments'
    )
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.PROTECT, related_name='created_treatments')
    
    class Meta:
        ordering = ['-scheduled_date', '-created_at']
    
    def __str__(self):
        return f"{self.treatment_type.name} - {self.patient.get_full_name()} ({self.get_eye_treated_display()})"
    
    @property
    def duration_minutes(self):
        """Calculate actual treatment duration"""
        if self.actual_start_time and self.actual_end_time:
            return int((self.actual_end_time - self.actual_start_time).total_seconds() / 60)
        return None


class TreatmentMedication(models.Model):
    """
    Medications prescribed as part of treatment
    """
    TIMING_CHOICES = (
        ('pre_operative', 'Pre-operative'),
        ('intra_operative', 'Intra-operative'),
        ('post_operative', 'Post-operative'),
        ('ongoing', 'Ongoing'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    treatment = models.ForeignKey(Treatment, on_delete=models.CASCADE, related_name='medications')
    medication = models.ForeignKey(Medication, on_delete=models.PROTECT)
    
    timing = models.CharField(max_length=20, choices=TIMING_CHOICES)
    dosage = models.CharField(max_length=100)
    frequency = models.CharField(max_length=100)
    duration_days = models.PositiveIntegerField(null=True, blank=True)
    instructions = models.TextField(blank=True)
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.PROTECT)
    
    class Meta:
        ordering = ['timing', 'medication__name']
    
    def __str__(self):
        return f"{self.medication.name} - {self.get_timing_display()}"


class TreatmentDocument(models.Model):
    """
    Documents related to treatments (consent forms, surgical notes, etc.)
    """
    DOCUMENT_TYPES = (
        ('consent_form', 'Consent Form'),
        ('surgical_notes', 'Surgical Notes'),
        ('pre_op_assessment', 'Pre-operative Assessment'),
        ('post_op_notes', 'Post-operative Notes'),
        ('discharge_summary', 'Discharge Summary'),
        ('follow_up_plan', 'Follow-up Plan'),
        ('complication_report', 'Complication Report'),
        ('images', 'Clinical Images'),
        ('lab_results', 'Laboratory Results'),
        ('other', 'Other'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    treatment = models.ForeignKey(Treatment, on_delete=models.CASCADE, related_name='documents')
    
    document_type = models.CharField(max_length=30, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='treatments/documents/%Y/%m/%d/')
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.PROTECT)
    
    class Meta:
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.get_document_type_display()}"


class TreatmentFollowUp(models.Model):
    """
    Follow-up appointments and assessments after treatment
    """
    STATUS_CHOICES = (
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('missed', 'Missed'),
        ('cancelled', 'Cancelled'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    treatment = models.ForeignKey(Treatment, on_delete=models.CASCADE, related_name='follow_ups')
    
    scheduled_date = models.DateTimeField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='scheduled')
    
    # Assessment
    visual_outcome = models.TextField(blank=True)
    complications_noted = models.TextField(blank=True)
    patient_satisfaction = models.PositiveIntegerField(
        null=True, 
        blank=True,
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text="Patient satisfaction score (1-10)"
    )
    
    # Next steps
    further_treatment_required = models.BooleanField(default=False)
    next_appointment_weeks = models.PositiveIntegerField(null=True, blank=True)
    additional_notes = models.TextField(blank=True)
    
    # Staff
    assessed_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.PROTECT,
        limit_choices_to={'user_type__in': ['doctor', 'nurse', 'technician']}
    )
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['-scheduled_date']
    
    def __str__(self):
        return f"Follow-up for {self.treatment} - {self.scheduled_date.date()}"


class TreatmentComplication(models.Model):
    """
    Complications arising from treatments
    """
    SEVERITY_LEVELS = (
        ('minor', 'Minor'),
        ('moderate', 'Moderate'),
        ('major', 'Major'),
        ('life_threatening', 'Life Threatening'),
    )
    
    COMPLICATION_TYPES = (
        ('infection', 'Infection'),
        ('bleeding', 'Bleeding/Hemorrhage'),
        ('vision_loss', 'Vision Loss'),
        ('retinal_detachment', 'Retinal Detachment'),
        ('increased_pressure', 'Increased Intraocular Pressure'),
        ('allergic_reaction', 'Allergic Reaction'),
        ('equipment_failure', 'Equipment Failure'),
        ('anesthesia_reaction', 'Anesthesia Reaction'),
        ('other', 'Other'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    treatment = models.ForeignKey(Treatment, on_delete=models.CASCADE, related_name='complications')
    
    complication_type = models.CharField(max_length=30, choices=COMPLICATION_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS)
    description = models.TextField()
    
    # Timeline
    onset_time = models.DateTimeField()
    resolution_time = models.DateTimeField(null=True, blank=True)
    
    # Management
    treatment_given = models.TextField()
    outcome = models.TextField(blank=True)
    preventable = models.BooleanField(null=True, help_text="Was this complication preventable?")
    
    # Reporting
    reported_to_clinical_governance = models.BooleanField(default=False)
    incident_number = models.CharField(max_length=50, blank=True)
    
    # Staff
    reported_by = models.ForeignKey(CustomUser, on_delete=models.PROTECT)
    
    # Audit fields
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['-onset_time']
    
    def __str__(self):
        return f"{self.get_complication_type_display()} - {self.get_severity_display()}"
