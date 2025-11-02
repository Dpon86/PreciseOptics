"""
Treatment Protocol models for PreciseOptics Eye Hospital Management System
Manages treatment protocols, automated scheduling, and consent tracking
"""
from django.db import models
from django.core.validators import MinValueValidator
from django.utils import timezone
from datetime import timedelta
from patients.models import Patient
from accounts.models import CustomUser
from conditions.models import MedicalCondition
from medications.models import Medication
import uuid


class TreatmentProtocol(models.Model):
    """
    Master list of treatment protocols for various conditions
    """
    PROTOCOL_TYPES = (
        ('loading_dose', 'Loading Dose'),
        ('maintenance', 'Maintenance'),
        ('fixed_interval', 'Fixed Interval'),
        ('treat_extend', 'Treat and Extend'),
        ('prn', 'PRN (As Needed)'),
        ('post_op', 'Post-Operative'),
        ('custom', 'Custom Protocol'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200)
    code = models.CharField(max_length=50, unique=True, help_text="Unique protocol code")
    protocol_type = models.CharField(max_length=20, choices=PROTOCOL_TYPES)
    
    # Associated condition
    condition = models.ForeignKey(
        MedicalCondition,
        on_delete=models.PROTECT,
        related_name='protocols',
        help_text="Condition this protocol treats"
    )
    
    # Protocol details
    description = models.TextField()
    indications = models.TextField(help_text="When to use this protocol")
    contraindications = models.TextField(blank=True, help_text="When NOT to use this protocol")
    
    # Timing
    total_duration_weeks = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Total protocol duration in weeks (if applicable)"
    )
    repeat_interval_weeks = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Interval for repeating protocol (if applicable)"
    )
    
    # Consent and compliance
    requires_consent = models.BooleanField(default=True)
    consent_type = models.CharField(
        max_length=100,
        blank=True,
        help_text="Type of consent required"
    )
    
    # Clinical information
    expected_outcomes = models.TextField(blank=True)
    potential_side_effects = models.TextField(blank=True)
    monitoring_requirements = models.TextField(blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='created_protocols'
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Treatment Protocol"
        verbose_name_plural = "Treatment Protocols"
        ordering = ['condition', 'name']
    
    def __str__(self):
        return f"{self.name} ({self.condition.code})"


class ProtocolStep(models.Model):
    """
    Individual steps within a treatment protocol
    """
    STEP_TYPES = (
        ('medication', 'Medication Administration'),
        ('injection', 'Injection'),
        ('procedure', 'Procedure'),
        ('test', 'Diagnostic Test'),
        ('assessment', 'Clinical Assessment'),
        ('consultation', 'Consultation'),
        ('follow_up', 'Follow-up Visit'),
        ('imaging', 'Imaging Study'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    protocol = models.ForeignKey(
        TreatmentProtocol,
        on_delete=models.CASCADE,
        related_name='steps'
    )
    
    step_number = models.PositiveIntegerField(help_text="Order in the protocol")
    step_type = models.CharField(max_length=20, choices=STEP_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Timing (days from protocol start)
    timing_days = models.PositiveIntegerField(
        help_text="Days from protocol start date"
    )
    timing_window_before = models.PositiveIntegerField(
        default=0,
        help_text="Days before scheduled date (flexibility window)"
    )
    timing_window_after = models.PositiveIntegerField(
        default=0,
        help_text="Days after scheduled date (flexibility window)"
    )
    
    # Associated resources
    medication = models.ForeignKey(
        Medication,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='protocol_steps',
        help_text="Medication to administer (if applicable)"
    )
    medication_dosage = models.CharField(max_length=100, blank=True)
    medication_route = models.CharField(max_length=50, blank=True)
    
    # Required tests/assessments
    required_test_type = models.CharField(
        max_length=100,
        blank=True,
        help_text="Type of test required (e.g., OCT, Visual Acuity)"
    )
    
    # Instructions
    pre_instructions = models.TextField(
        blank=True,
        help_text="Instructions before the step"
    )
    post_instructions = models.TextField(
        blank=True,
        help_text="Instructions after the step"
    )
    
    # Compliance
    is_mandatory = models.BooleanField(default=True)
    can_be_rescheduled = models.BooleanField(default=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Protocol Step"
        verbose_name_plural = "Protocol Steps"
        ordering = ['protocol', 'step_number']
        unique_together = ['protocol', 'step_number']
    
    def __str__(self):
        return f"{self.protocol.name} - Step {self.step_number}: {self.title}"


class PatientProtocol(models.Model):
    """
    Protocol assigned to a specific patient
    """
    STATUS_CHOICES = (
        ('pending', 'Pending Start'),
        ('active', 'Active'),
        ('on_hold', 'On Hold'),
        ('completed', 'Completed'),
        ('discontinued', 'Discontinued'),
        ('cancelled', 'Cancelled'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name='assigned_protocols'
    )
    protocol = models.ForeignKey(
        TreatmentProtocol,
        on_delete=models.PROTECT,
        related_name='patient_assignments'
    )
    
    # Status and timing
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    start_date = models.DateField()
    actual_start_date = models.DateField(null=True, blank=True)
    expected_end_date = models.DateField(null=True, blank=True)
    actual_end_date = models.DateField(null=True, blank=True)
    
    # Assignment details
    assigned_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='assigned_patient_protocols'
    )
    assigned_date = models.DateTimeField(auto_now_add=True)
    assignment_reason = models.TextField(help_text="Clinical reason for protocol assignment")
    
    # Discontinuation/completion
    discontinuation_reason = models.TextField(blank=True)
    discontinued_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='discontinued_patient_protocols'
    )
    discontinuation_date = models.DateField(null=True, blank=True)
    
    completion_notes = models.TextField(blank=True)
    outcome_assessment = models.TextField(blank=True)
    
    # Modifications
    protocol_modifications = models.TextField(
        blank=True,
        help_text="Any modifications made to the standard protocol"
    )
    
    # Tracking
    current_step_number = models.PositiveIntegerField(default=0)
    total_steps_completed = models.PositiveIntegerField(default=0)
    adherence_percentage = models.DecimalField(
        max_digits=5,
        decimal_places=2,
        default=0.00,
        help_text="Percentage of steps completed on time"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Patient Protocol"
        verbose_name_plural = "Patient Protocols"
        ordering = ['-start_date']
    
    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.protocol.name}"
    
    def calculate_expected_end_date(self):
        """Calculate expected end date based on protocol duration"""
        if self.protocol.total_duration_weeks:
            return self.start_date + timedelta(weeks=self.protocol.total_duration_weeks)
        return None
    
    def save(self, *args, **kwargs):
        if not self.expected_end_date and self.protocol.total_duration_weeks:
            self.expected_end_date = self.calculate_expected_end_date()
        super().save(*args, **kwargs)


class ProtocolStepCompletion(models.Model):
    """
    Tracking completion of individual protocol steps for a patient
    """
    COMPLETION_STATUS = (
        ('scheduled', 'Scheduled'),
        ('completed', 'Completed'),
        ('missed', 'Missed'),
        ('rescheduled', 'Rescheduled'),
        ('cancelled', 'Cancelled'),
        ('not_applicable', 'Not Applicable'),
    )
    
    OUTCOME_CHOICES = (
        ('successful', 'Successful'),
        ('partial', 'Partially Successful'),
        ('unsuccessful', 'Unsuccessful'),
        ('adverse_event', 'Adverse Event'),
        ('deferred', 'Deferred'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient_protocol = models.ForeignKey(
        PatientProtocol,
        on_delete=models.CASCADE,
        related_name='step_completions'
    )
    protocol_step = models.ForeignKey(
        ProtocolStep,
        on_delete=models.PROTECT,
        related_name='completions'
    )
    
    # Scheduling
    scheduled_date = models.DateField()
    scheduled_time = models.TimeField(null=True, blank=True)
    
    # Completion tracking
    status = models.CharField(max_length=20, choices=COMPLETION_STATUS, default='scheduled')
    completed_date = models.DateField(null=True, blank=True)
    completed_time = models.TimeField(null=True, blank=True)
    completed_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='completed_protocol_steps'
    )
    
    # Clinical information
    outcome = models.CharField(
        max_length=20,
        choices=OUTCOME_CHOICES,
        blank=True
    )
    clinical_notes = models.TextField(blank=True)
    measurements = models.JSONField(
        default=dict,
        blank=True,
        help_text="Measurements taken during this step"
    )
    
    # Adverse events
    adverse_event = models.BooleanField(default=False)
    adverse_event_description = models.TextField(blank=True)
    
    # Rescheduling
    original_scheduled_date = models.DateField(null=True, blank=True)
    reschedule_reason = models.TextField(blank=True)
    rescheduled_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='rescheduled_protocol_steps'
    )
    
    # Next step calculation
    next_step_date = models.DateField(
        null=True,
        blank=True,
        help_text="Auto-calculated date for next step"
    )
    
    # Compliance
    completed_within_window = models.BooleanField(
        default=False,
        help_text="Was step completed within acceptable time window?"
    )
    days_variance = models.IntegerField(
        default=0,
        help_text="Days difference from scheduled date (negative=early, positive=late)"
    )
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Protocol Step Completion"
        verbose_name_plural = "Protocol Step Completions"
        ordering = ['patient_protocol', 'scheduled_date']
    
    def __str__(self):
        return f"{self.patient_protocol.patient.get_full_name()} - {self.protocol_step.title} ({self.status})"
    
    def calculate_compliance(self):
        """Calculate if completed within acceptable window"""
        if self.completed_date and self.scheduled_date:
            delta = (self.completed_date - self.scheduled_date).days
            self.days_variance = delta
            
            # Check if within window
            within_window = (
                -self.protocol_step.timing_window_before <= delta <= 
                self.protocol_step.timing_window_after
            )
            self.completed_within_window = within_window
            return within_window
        return False


class ConsentForm(models.Model):
    """
    Consent forms for protocols and treatments
    """
    CONSENT_TYPES = (
        ('treatment', 'Treatment Consent'),
        ('procedure', 'Procedure Consent'),
        ('medication', 'Medication Consent'),
        ('protocol', 'Protocol Consent'),
        ('surgery', 'Surgery Consent'),
        ('research', 'Research Participation'),
        ('data_sharing', 'Data Sharing'),
    )
    
    CONSENT_STATUS = (
        ('pending', 'Pending'),
        ('obtained', 'Consent Obtained'),
        ('declined', 'Consent Declined'),
        ('withdrawn', 'Consent Withdrawn'),
        ('expired', 'Expired'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(
        Patient,
        on_delete=models.PROTECT,
        related_name='consent_forms'
    )
    protocol = models.ForeignKey(
        TreatmentProtocol,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='consent_forms'
    )
    patient_protocol = models.ForeignKey(
        PatientProtocol,
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='consent_forms'
    )
    
    # Consent details
    consent_type = models.CharField(max_length=20, choices=CONSENT_TYPES)
    title = models.CharField(max_length=200)
    description = models.TextField()
    
    # Status and dates
    status = models.CharField(max_length=20, choices=CONSENT_STATUS, default='pending')
    consent_given_date = models.DateField(null=True, blank=True)
    consent_given_time = models.TimeField(null=True, blank=True)
    expiry_date = models.DateField(
        null=True,
        blank=True,
        help_text="Date when consent expires (if applicable)"
    )
    
    # Documentation
    consent_document = models.FileField(
        upload_to='consent_forms/',
        null=True,
        blank=True,
        help_text="Signed consent form"
    )
    
    # Parties involved
    obtained_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='obtained_consents',
        help_text="Staff member who obtained consent"
    )
    witnessed_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='witnessed_consents',
        help_text="Witness to consent"
    )
    
    # Additional information
    patient_signature = models.CharField(
        max_length=200,
        blank=True,
        help_text="Digital signature or confirmation"
    )
    patient_understood = models.BooleanField(
        default=False,
        help_text="Patient confirmed understanding"
    )
    interpreter_used = models.BooleanField(default=False)
    interpreter_name = models.CharField(max_length=200, blank=True)
    
    # Withdrawal
    withdrawal_date = models.DateField(null=True, blank=True)
    withdrawal_reason = models.TextField(blank=True)
    
    notes = models.TextField(blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Consent Form"
        verbose_name_plural = "Consent Forms"
        ordering = ['-consent_given_date']
    
    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.title} ({self.status})"
    
    def is_valid(self):
        """Check if consent is currently valid"""
        if self.status != 'obtained':
            return False
        if self.expiry_date and self.expiry_date < timezone.now().date():
            return False
        return True
