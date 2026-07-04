"""
Patient Reported Outcome Measures (PROMs) for PreciseOptics.

Captures the patient's own perspective on their vision quality, treatment
satisfaction and any side effects — linked to a patient, and optionally to a
specific prescription or treatment.  These scores feed into the Medication
Condition Outcomes report so clinicians can compare clinical test results
against what the patient actually experiences.
"""
import uuid
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from patients.models import Patient
from accounts.models import CustomUser


class PatientOutcomeReport(models.Model):
    """
    A single questionnaire submission recording how a patient feels about
    their vision and treatment at a point in time.
    """

    SATISFACTION_CHOICES = (
        ('very_satisfied', 'Very Satisfied'),
        ('satisfied', 'Satisfied'),
        ('neutral', 'Neutral'),
        ('dissatisfied', 'Dissatisfied'),
        ('very_dissatisfied', 'Very Dissatisfied'),
    )

    SIDE_EFFECT_SEVERITY_CHOICES = (
        ('none', 'None'),
        ('mild', 'Mild – noticeable but not interfering'),
        ('moderate', 'Moderate – affecting daily life'),
        ('severe', 'Severe – significantly disabling'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    # Core links
    patient = models.ForeignKey(
        Patient, on_delete=models.CASCADE, related_name='outcome_reports'
    )
    consultation = models.ForeignKey(
        'consultations.Consultation',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='outcome_reports',
        help_text='Consultation this report relates to (optional)',
    )
    prescription = models.ForeignKey(
        'medications.Prescription',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='outcome_reports',
        help_text='Prescription being evaluated (optional)',
    )
    treatment = models.ForeignKey(
        'treatments.Treatment',
        on_delete=models.SET_NULL,
        null=True, blank=True,
        related_name='outcome_reports',
        help_text='Treatment being evaluated (optional)',
    )

    report_date = models.DateField(help_text='Date the questionnaire was completed')

    # ── Vision quality scores (1 = very poor, 10 = excellent) ──────────
    vision_quality_score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='Overall vision quality: 1 (very poor) – 10 (excellent)',
    )
    pain_discomfort_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        help_text='Pain or eye discomfort: 0 (none) – 10 (severe)',
    )
    light_sensitivity_score = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        help_text='Light sensitivity / glare: 0 (none) – 10 (severe)',
    )
    daily_activities_score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='Ability to perform daily activities: 1 (very limited) – 10 (no limitation)',
    )
    reading_ability_score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        help_text='Reading ability: 1 (unable) – 10 (no difficulty)',
    )
    driving_ability_score = models.IntegerField(
        validators=[MinValueValidator(1), MaxValueValidator(10)],
        null=True, blank=True,
        help_text='Driving ability: 1 (unable) – 10 (no difficulty). Leave blank if not applicable.',
    )

    # ── Treatment satisfaction ──────────────────────────────────────────
    treatment_satisfaction = models.CharField(
        max_length=20,
        choices=SATISFACTION_CHOICES,
        help_text='Overall satisfaction with current treatment',
    )

    # ── Side effects ───────────────────────────────────────────────────
    side_effects_reported = models.TextField(
        blank=True,
        help_text='Describe any side effects the patient has experienced',
    )
    side_effect_severity = models.CharField(
        max_length=10,
        choices=SIDE_EFFECT_SEVERITY_CHOICES,
        default='none',
    )

    # ── Free text ──────────────────────────────────────────────────────
    patient_comments = models.TextField(
        blank=True,
        help_text="Any additional comments from the patient's perspective",
    )

    # ── Audit ──────────────────────────────────────────────────────────
    completed_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='outcome_reports_entered',
        help_text='Staff member who recorded this questionnaire',
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    is_active = models.BooleanField(default=True)

    class Meta:
        ordering = ['-report_date', '-created_at']
        verbose_name = 'Patient Outcome Report'
        verbose_name_plural = 'Patient Outcome Reports'

    def __str__(self):
        return f'{self.patient} – {self.report_date} (vision: {self.vision_quality_score}/10)'
