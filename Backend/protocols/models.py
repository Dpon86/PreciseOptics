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
from precise_optics.file_validators import validate_document_extension, validate_file_size
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
    Supports multiple medications, treatments, and tests per step
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
        ('multiple', 'Multiple Actions'),
    )
    
    TIMING_TYPES = (
        ('fixed', 'Fixed Days from Start'),
        ('from_previous', 'Days from Previous Step'),
        ('weekly', 'Weekly Recurring'),
        ('monthly', 'Monthly Recurring'),
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
    
    # Timing (days from protocol start or previous step)
    timing_type = models.CharField(
        max_length=20,
        choices=TIMING_TYPES,
        default='fixed',
        help_text="How timing is calculated"
    )
    timing_days = models.PositiveIntegerField(
        help_text="Days from start/previous step, or interval for recurring"
    )
    timing_window_before = models.PositiveIntegerField(
        default=0,
        help_text="Days before scheduled date (flexibility window)"
    )
    timing_window_after = models.PositiveIntegerField(
        default=0,
        help_text="Days after scheduled date (flexibility window)"
    )
    
    # Recurring steps
    is_recurring = models.BooleanField(
        default=False,
        help_text="Whether this step repeats"
    )
    recurrence_count = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Number of times to repeat (null = indefinite)"
    )
    
    # Legacy single medication support (kept for backward compatibility)
    medication = models.ForeignKey(
        Medication,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        related_name='protocol_steps',
        help_text="Primary medication (legacy - use ProtocolStepMedication for multiple)"
    )
    medication_dosage = models.CharField(max_length=100, blank=True)
    medication_route = models.CharField(max_length=50, blank=True)
    
    # Required tests/assessments (legacy - use ProtocolStepTest for multiple)
    required_test_type = models.CharField(
        max_length=100,
        blank=True,
        help_text="Type of test required (legacy)"
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
    
    # Branching logic - ENHANCED
    has_branches = models.BooleanField(
        default=False,
        help_text="Whether this step has conditional branches"
    )
    branch_condition_type = models.CharField(
        max_length=50,
        blank=True,
        choices=(
            ('test_result', 'Based on Test Result'),
            ('outcome', 'Based on Step Outcome'),
            ('measurement', 'Based on Measurement'),
            ('adverse_event', 'Based on Adverse Event'),
            ('yes_no', 'Yes/No Decision'),
            ('met_not_met', 'Met/Not Met Criteria'),
            ('free_text', 'Free Text Evaluation'),
            ('manual', 'Manual Decision'),
        ),
        help_text="What determines which branch to follow"
    )
    branch_logic = models.JSONField(
        default=dict,
        blank=True,
        help_text="""Branching conditions and next step mappings.
        Format: {
            'conditions': [
                {'result': 'yes', 'next_step': 2, 'label': 'If improved'},
                {'result': 'no', 'next_step': 3, 'label': 'If no improvement'}
            ],
            'evaluation_field': 'result_value',
            'default_next_step': 4
        }"""
    )
    
    # Parent step for branches
    parent_step = models.ForeignKey(
        'self',
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name='child_branches',
        help_text="Parent step if this is a branch"
    )
    branch_label = models.CharField(
        max_length=100,
        blank=True,
        help_text="Label for this branch (e.g., 'If improved', 'If no change')"
    )
    
    # Next step routing
    default_next_step = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='preceding_steps',
        help_text="Default next step if no branching or branch conditions not met"
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


class ProtocolStepMedication(models.Model):
    """
    Multiple medications per protocol step with individual dosing
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    protocol_step = models.ForeignKey(
        ProtocolStep,
        on_delete=models.CASCADE,
        related_name='medications'
    )
    medication = models.ForeignKey(
        Medication,
        on_delete=models.PROTECT,
        related_name='step_medications'
    )
    
    # Dosing information
    dosage_amount = models.CharField(max_length=50)
    dosage_unit = models.CharField(max_length=50)
    route = models.CharField(
        max_length=50,
        choices=(
            ('oral', 'Oral'),
            ('topical', 'Topical (Eye Drops)'),
            ('intravitreal', 'Intravitreal Injection'),
            ('subconjunctival', 'Subconjunctival'),
            ('iv', 'Intravenous'),
            ('im', 'Intramuscular'),
        )
    )
    frequency = models.CharField(
        max_length=100,
        help_text="e.g., 'Once daily', '3 times daily', 'Every 4 weeks'"
    )
    duration_days = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="How many days to continue this medication"
    )
    
    # Timing
    administer_at_same_time = models.BooleanField(
        default=True,
        help_text="Whether this is given at the same visit/time as other step items"
    )
    offset_days = models.IntegerField(
        default=0,
        help_text="Days offset from main step timing (can be negative)"
    )
    
    # Special instructions
    special_instructions = models.TextField(blank=True)
    eye_side = models.CharField(
        max_length=20,
        blank=True,
        choices=(
            ('OD', 'Right Eye (OD)'),
            ('OS', 'Left Eye (OS)'),
            ('OU', 'Both Eyes (OU)'),
        )
    )
    
    # Order for display
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Protocol Step Medication"
        verbose_name_plural = "Protocol Step Medications"
        ordering = ['protocol_step', 'order']
    
    def __str__(self):
        return f"{self.protocol_step.title} - {self.medication.name}"


class ProtocolStepTreatment(models.Model):
    """
    Multiple treatments per protocol step
    """
    TREATMENT_TYPES = (
        ('injection', 'Intravitreal Injection'),
        ('laser', 'Laser Treatment'),
        ('surgery', 'Surgical Procedure'),
        ('therapy', 'Physical Therapy'),
        ('other', 'Other Treatment'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    protocol_step = models.ForeignKey(
        ProtocolStep,
        on_delete=models.CASCADE,
        related_name='treatments'
    )
    
    treatment_type = models.CharField(max_length=50, choices=TREATMENT_TYPES)
    treatment_name = models.CharField(max_length=200)
    description = models.TextField()
    
    # Timing
    administer_at_same_time = models.BooleanField(default=True)
    offset_days = models.IntegerField(default=0)
    
    # Clinical details
    eye_side = models.CharField(
        max_length=20,
        blank=True,
        choices=(
            ('OD', 'Right Eye (OD)'),
            ('OS', 'Left Eye (OS)'),
            ('OU', 'Both Eyes (OU)'),
        )
    )
    expected_duration_minutes = models.PositiveIntegerField(
        null=True,
        blank=True,
        help_text="Expected duration in minutes"
    )
    requires_anesthesia = models.BooleanField(default=False)
    anesthesia_type = models.CharField(max_length=100, blank=True)
    
    special_instructions = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Protocol Step Treatment"
        verbose_name_plural = "Protocol Step Treatments"
        ordering = ['protocol_step', 'order']
    
    def __str__(self):
        return f"{self.protocol_step.title} - {self.treatment_name}"


class ProtocolStepTest(models.Model):
    """
    Multiple eye tests per protocol step
    """
    TEST_TYPES = (
        ('visual_acuity', 'Visual Acuity Test'),
        ('refraction', 'Refraction Test'),
        ('tonometry', 'Tonometry (IOP)'),
        ('oct', 'OCT Scan'),
        ('visual_field', 'Visual Field Test'),
        ('fluorescein', 'Fluorescein Angiography'),
        ('fundus_photo', 'Fundus Photography'),
        ('slit_lamp', 'Slit Lamp Examination'),
        ('ophthalmoscopy', 'Ophthalmoscopy'),
        ('other', 'Other Test'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    protocol_step = models.ForeignKey(
        ProtocolStep,
        on_delete=models.CASCADE,
        related_name='tests'
    )
    
    test_type = models.CharField(max_length=50, choices=TEST_TYPES)
    test_name = models.CharField(max_length=200)
    description = models.TextField(blank=True)
    
    # Timing
    administer_at_same_time = models.BooleanField(default=True)
    offset_days = models.IntegerField(default=0)
    
    # Test details
    eye_side = models.CharField(
        max_length=20,
        choices=(
            ('OD', 'Right Eye (OD)'),
            ('OS', 'Left Eye (OS)'),
            ('OU', 'Both Eyes (OU)'),
        )
    )
    is_baseline = models.BooleanField(
        default=False,
        help_text="Is this a baseline measurement?"
    )
    
    # Expected values or thresholds for branching
    expected_values = models.JSONField(
        default=dict,
        blank=True,
        help_text="Expected test results or thresholds"
    )
    
    special_instructions = models.TextField(blank=True)
    order = models.PositiveIntegerField(default=0)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Protocol Step Test"
        verbose_name_plural = "Protocol Step Tests"
        ordering = ['protocol_step', 'order']
    
    def __str__(self):
        return f"{self.protocol_step.title} - {self.test_name}"


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


class ProtocolStepResult(models.Model):
    """
    Results and evaluations for completed protocol steps
    Supports branching logic with flexible evaluation methods
    """
    RESULT_TYPE_CHOICES = (
        ('yes_no', 'Yes/No'),
        ('met_not_met', 'Met/Not Met'),
        ('numeric', 'Numeric Value'),
        ('free_text', 'Free Text'),
        ('scale', 'Scale (1-10)'),
        ('multiple_choice', 'Multiple Choice'),
    )
    
    EVALUATION_CHOICES = (
        ('yes', 'Yes'),
        ('no', 'No'),
        ('met', 'Met'),
        ('not_met', 'Not Met'),
        ('improved', 'Improved'),
        ('stable', 'Stable'),
        ('worsened', 'Worsened'),
        ('n/a', 'Not Applicable'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    step_completion = models.ForeignKey(
        ProtocolStepCompletion,
        on_delete=models.CASCADE,
        related_name='results'
    )
    
    # Result information
    result_type = models.CharField(
        max_length=20,
        choices=RESULT_TYPE_CHOICES,
        default='free_text'
    )
    result_label = models.CharField(
        max_length=200,
        help_text="Label for this result (e.g., 'IOP improved?', 'Vision assessment')"
    )
    
    # Flexible result capture
    result_value_text = models.TextField(
        blank=True,
        help_text="Free text result"
    )
    result_value_numeric = models.DecimalField(
        max_digits=10,
        decimal_places=2,
        null=True,
        blank=True,
        help_text="Numeric result value"
    )
    result_value_choice = models.CharField(
        max_length=50,
        choices=EVALUATION_CHOICES,
        blank=True,
        help_text="Predefined choice result"
    )
    result_value_json = models.JSONField(
        default=dict,
        blank=True,
        help_text="Complex result data (multiple values, measurements)"
    )
    
    # Evaluation
    evaluation_notes = models.TextField(
        blank=True,
        help_text="Clinical interpretation of result"
    )
    meets_criteria = models.BooleanField(
        null=True,
        blank=True,
        help_text="Does result meet expected criteria?"
    )
    
    # For branching logic
    triggers_branch = models.BooleanField(
        default=False,
        help_text="Does this result trigger a branch in the protocol?"
    )
    branch_taken = models.CharField(
        max_length=100,
        blank=True,
        help_text="Which branch was taken based on this result"
    )
    next_step_override = models.ForeignKey(
        ProtocolStep,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='result_triggered_steps',
        help_text="Next step if branching logic applies"
    )
    
    # Tracking
    evaluated_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='protocol_step_evaluations'
    )
    evaluated_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Protocol Step Result"
        verbose_name_plural = "Protocol Step Results"
        ordering = ['step_completion', 'evaluated_at']
    
    def __str__(self):
        return f"{self.result_label} - {self.get_result_display()}"
    
    def get_result_display(self):
        """Get human-readable result"""
        if self.result_value_choice:
            return self.get_result_value_choice_display()
        elif self.result_value_numeric is not None:
            return str(self.result_value_numeric)
        elif self.result_value_text:
            return self.result_value_text[:50]
        return "No result"
    
    def evaluate_branching(self):
        """
        Evaluate if this result should trigger branching
        Returns next step number if branching applies
        """
        if not self.step_completion.protocol_step.has_branches:
            return None
        
        branch_logic = self.step_completion.protocol_step.branch_logic
        if not branch_logic or 'conditions' not in branch_logic:
            return None
        
        # Get the result value to compare
        if self.result_value_choice:
            compare_value = self.result_value_choice
        elif self.result_value_numeric is not None:
            compare_value = float(self.result_value_numeric)
        elif self.meets_criteria is not None:
            compare_value = 'met' if self.meets_criteria else 'not_met'
        else:
            return branch_logic.get('default_next_step')
        
        # Evaluate conditions
        for condition in branch_logic['conditions']:
            if self._matches_condition(compare_value, condition):
                self.triggers_branch = True
                self.branch_taken = condition.get('label', '')
                return condition.get('next_step')
        
        # No match, use default
        return branch_logic.get('default_next_step')
    
    def _matches_condition(self, value, condition):
        """Check if value matches condition"""
        condition_value = condition.get('result')
        operator = condition.get('operator', 'equals')
        
        if operator == 'equals':
            return str(value).lower() == str(condition_value).lower()
        elif operator == 'greater_than':
            return float(value) > float(condition_value)
        elif operator == 'less_than':
            return float(value) < float(condition_value)
        elif operator == 'between':
            min_val, max_val = condition_value
            return min_val <= float(value) <= max_val
        
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
        validators=[validate_document_extension, validate_file_size],
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
