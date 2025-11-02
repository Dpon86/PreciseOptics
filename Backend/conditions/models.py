"""
Medical Conditions models for PreciseOptics Eye Hospital Management System
Tracks specific eye conditions (AMD, RVO, Glaucoma, Diabetic Retinopathy, Cataracts)
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from patients.models import Patient
from accounts.models import CustomUser
import uuid


class MedicalCondition(models.Model):
    """
    Master list of eye conditions that can be tracked
    """
    CONDITION_CATEGORIES = (
        ('retinal', 'Retinal Disorders'),
        ('glaucoma', 'Glaucoma'),
        ('cataract', 'Cataracts'),
        ('corneal', 'Corneal Disorders'),
        ('diabetic', 'Diabetic Eye Disease'),
        ('vascular', 'Vascular Disorders'),
        ('other', 'Other'),
    )
    
    # Pre-defined condition codes for the 5 main conditions
    CONDITION_CODES = (
        ('AMD', 'Age-Related Macular Degeneration'),
        ('RVO', 'Retinal Vein Occlusion'),
        ('GLAUCOMA', 'Glaucoma'),
        ('DIABETIC_RET', 'Diabetic Retinopathy'),
        ('CATARACT_POST', 'Post-Cataract Treatment'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    code = models.CharField(max_length=50, unique=True, help_text="Unique condition code")
    name = models.CharField(max_length=200)
    category = models.CharField(max_length=20, choices=CONDITION_CATEGORIES)
    
    # Clinical Information
    description = models.TextField()
    symptoms = models.TextField(help_text="Common symptoms")
    risk_factors = models.TextField(help_text="Known risk factors")
    typical_progression = models.TextField(help_text="How the condition typically progresses")
    
    # Treatment Information
    standard_treatments = models.TextField(help_text="Standard treatment approaches")
    prognosis = models.TextField(help_text="Typical outcomes and prognosis")
    
    # Protocol Association
    has_standard_protocol = models.BooleanField(default=False)
    protocol_description = models.TextField(blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_conditions'
    )
    
    class Meta:
        verbose_name = "Medical Condition"
        verbose_name_plural = "Medical Conditions"
        ordering = ['category', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.code})"


class PatientCondition(models.Model):
    """
    Links patients to their diagnosed conditions
    """
    SEVERITY_LEVELS = (
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
        ('very_severe', 'Very Severe'),
    )
    
    EYE_AFFECTED = (
        ('both', 'Both Eyes'),
        ('left', 'Left Eye Only'),
        ('right', 'Right Eye Only'),
    )
    
    CONDITION_STATUS = (
        ('newly_diagnosed', 'Newly Diagnosed'),
        ('active', 'Active'),
        ('stable', 'Stable'),
        ('progressing', 'Progressing'),
        ('improving', 'Improving'),
        ('resolved', 'Resolved'),
        ('managed', 'Under Management'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.CASCADE,
        related_name='medical_conditions'
    )
    condition = models.ForeignKey(
        MedicalCondition,
        on_delete=models.PROTECT,
        related_name='patient_cases'
    )
    
    # Diagnosis Information
    diagnosis_date = models.DateField()
    diagnosed_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='diagnosed_conditions'
    )
    
    # Clinical Details
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS)
    eye_affected = models.CharField(max_length=10, choices=EYE_AFFECTED)
    current_status = models.CharField(max_length=20, choices=CONDITION_STATUS, default='newly_diagnosed')
    
    # Specific Measurements (JSON for flexibility)
    initial_measurements = models.JSONField(
        default=dict,
        blank=True,
        help_text="Initial measurements at diagnosis (e.g., visual acuity, IOP)"
    )
    
    # Treatment Information
    treatment_plan = models.TextField(blank=True)
    medications_prescribed = models.TextField(blank=True)
    
    # Follow-up
    last_assessment_date = models.DateField(null=True, blank=True)
    next_assessment_date = models.DateField(null=True, blank=True)
    
    # Notes and History
    diagnosis_notes = models.TextField(blank=True)
    patient_notes = models.TextField(blank=True, help_text="Patient-specific notes")
    
    # Status
    is_active = models.BooleanField(default=True)
    resolved_date = models.DateField(null=True, blank=True)
    resolution_notes = models.TextField(blank=True)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Patient Condition"
        verbose_name_plural = "Patient Conditions"
        ordering = ['-diagnosis_date']
        unique_together = ['patient', 'condition', 'diagnosis_date']
    
    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.condition.name}"


class ConditionProgress(models.Model):
    """
    Tracks progress/changes in a patient's condition over time
    """
    ASSESSMENT_TYPES = (
        ('routine', 'Routine Follow-up'),
        ('urgent', 'Urgent Assessment'),
        ('post_treatment', 'Post-Treatment Review'),
        ('protocol_step', 'Protocol Milestone'),
        ('emergency', 'Emergency Assessment'),
    )
    
    STATUS_CHANGES = (
        ('improved', 'Improved'),
        ('stable', 'Stable/No Change'),
        ('worsened', 'Worsened'),
        ('new_symptoms', 'New Symptoms'),
        ('resolved', 'Resolved'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_condition = models.ForeignKey(
        PatientCondition,
        on_delete=models.CASCADE,
        related_name='progress_records'
    )
    
    # Assessment Details
    assessment_date = models.DateField()
    assessment_type = models.CharField(max_length=20, choices=ASSESSMENT_TYPES)
    assessed_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='condition_assessments'
    )
    
    # Status and Changes
    status_change = models.CharField(max_length=20, choices=STATUS_CHANGES)
    severity_at_assessment = models.CharField(
        max_length=20,
        choices=PatientCondition.SEVERITY_LEVELS
    )
    
    # Measurements (flexible JSON field)
    measurements = models.JSONField(
        default=dict,
        help_text="Current measurements (visual acuity, IOP, OCT results, etc.)"
    )
    
    # Clinical Findings
    clinical_findings = models.TextField()
    subjective_symptoms = models.TextField(
        blank=True,
        help_text="Patient-reported symptoms"
    )
    
    # Treatment Adjustments
    treatment_changes = models.TextField(blank=True)
    medications_adjusted = models.BooleanField(default=False)
    
    # Next Steps
    next_assessment_date = models.DateField(null=True, blank=True)
    next_assessment_reason = models.CharField(max_length=200, blank=True)
    
    # Documentation
    assessment_notes = models.TextField()
    images_attached = models.BooleanField(default=False)
    
    # Metadata
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Condition Progress"
        verbose_name_plural = "Condition Progress Records"
        ordering = ['-assessment_date']
    
    def __str__(self):
        return f"{self.patient_condition.patient.get_full_name()} - {self.assessment_date} ({self.status_change})"
    
    def save(self, *args, **kwargs):
        """Update parent PatientCondition with latest assessment info"""
        super().save(*args, **kwargs)
        
        # Update patient_condition with latest assessment
        self.patient_condition.last_assessment_date = self.assessment_date
        self.patient_condition.next_assessment_date = self.next_assessment_date
        self.patient_condition.save()


class ConditionDocument(models.Model):
    """
    Documents and images related to a patient's condition
    """
    DOCUMENT_TYPES = (
        ('scan', 'Diagnostic Scan'),
        ('report', 'Medical Report'),
        ('image', 'Clinical Image'),
        ('consent', 'Consent Form'),
        ('referral', 'Referral Document'),
        ('protocol', 'Protocol Document'),
        ('other', 'Other'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_condition = models.ForeignKey(
        PatientCondition,
        on_delete=models.CASCADE,
        related_name='documents'
    )
    progress_record = models.ForeignKey(
        ConditionProgress,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='documents',
        help_text="Link to specific progress assessment if applicable"
    )
    
    # Document Details
    document_type = models.CharField(max_length=20, choices=DOCUMENT_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    file = models.FileField(upload_to='condition_documents/')
    
    # Metadata
    uploaded_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True
    )
    uploaded_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Condition Document"
        verbose_name_plural = "Condition Documents"
        ordering = ['-uploaded_at']
    
    def __str__(self):
        return f"{self.title} - {self.patient_condition.patient.get_full_name()}"
