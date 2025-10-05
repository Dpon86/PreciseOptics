"""
Eye Test models for PreciseOptics Eye Hospital Management System
Comprehensive models for all eye tests including:
- Cataract assessments
- Glaucoma testing
- Medical retina examinations
- Diabetic retinopathy screening
- Vitreoretinal assessments
- Strabismus evaluation
- Paediatrics and orthoptics
- Eye casualty examinations
- Corneal and external eye disease
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from patients.models import Patient, PatientVisit
from consultations.models import Consultation
from accounts.models import CustomUser
import uuid


class BaseEyeTest(models.Model):
    """
    Base abstract model for all eye tests
    """
    TEST_STATUS = (
        ('scheduled', 'Scheduled'),
        ('in_progress', 'In Progress'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('incomplete', 'Incomplete'),
    )
    
    EYE_SIDE = (
        ('both', 'Both Eyes'),
        ('left', 'Left Eye'),
        ('right', 'Right Eye'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE)
    consultation = models.ForeignKey(Consultation, on_delete=models.CASCADE, null=True, blank=True)
    performed_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    
    # Test Details
    test_date = models.DateTimeField()
    eye_side = models.CharField(max_length=10, choices=EYE_SIDE, default='both')
    status = models.CharField(max_length=20, choices=TEST_STATUS, default='scheduled')
    
    # Results
    findings = models.TextField(blank=True)
    recommendations = models.TextField(blank=True)
    notes = models.TextField(blank=True)
    
    # Follow-up
    follow_up_required = models.BooleanField(default=False)
    follow_up_date = models.DateField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        abstract = True


# VISUAL ACUITY AND REFRACTION TESTS
class VisualAcuityTest(BaseEyeTest):
    """
    Visual acuity testing
    """
    TEST_METHODS = (
        ('snellen_chart', 'Snellen Chart'),
        ('logmar_chart', 'LogMAR Chart'),
        ('etdrs_chart', 'ETDRS Chart'),
        ('kay_pictures', 'Kay Pictures (Pediatric)'),
        ('lea_symbols', 'Lea Symbols'),
        ('cardiff_cards', 'Cardiff Acuity Cards'),
    )
    
    test_method = models.CharField(max_length=20, choices=TEST_METHODS, default='snellen_chart')
    
    # Right Eye Results
    right_eye_unaided = models.CharField(max_length=20, blank=True, help_text="e.g., 6/60, 20/200")
    right_eye_aided = models.CharField(max_length=20, blank=True)
    right_eye_pinhole = models.CharField(max_length=20, blank=True)
    
    # Left Eye Results
    left_eye_unaided = models.CharField(max_length=20, blank=True)
    left_eye_aided = models.CharField(max_length=20, blank=True)
    left_eye_pinhole = models.CharField(max_length=20, blank=True)
    
    # Both Eyes
    binocular_vision = models.CharField(max_length=20, blank=True)
    
    class Meta:
        verbose_name = "Visual Acuity Test"
        verbose_name_plural = "Visual Acuity Tests"


class RefractionTest(BaseEyeTest):
    """
    Refraction testing for glasses prescription
    """
    REFRACTION_METHODS = (
        ('subjective', 'Subjective Refraction'),
        ('objective', 'Objective Refraction (Autorefractor)'),
        ('retinoscopy', 'Retinoscopy'),
        ('cycloplegic', 'Cycloplegic Refraction'),
    )
    
    method = models.CharField(max_length=20, choices=REFRACTION_METHODS)
    
    # Right Eye
    right_sphere = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    right_cylinder = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    right_axis = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(180)])
    right_add = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    right_prism = models.CharField(max_length=20, blank=True)
    
    # Left Eye
    left_sphere = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    left_cylinder = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    left_axis = models.PositiveIntegerField(null=True, blank=True, validators=[MinValueValidator(1), MaxValueValidator(180)])
    left_add = models.DecimalField(max_digits=4, decimal_places=2, null=True, blank=True)
    left_prism = models.CharField(max_length=20, blank=True)
    
    # Additional Details
    pupillary_distance = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    
    class Meta:
        verbose_name = "Refraction Test"
        verbose_name_plural = "Refraction Tests"


# CATARACT ASSESSMENTS
class CataractAssessment(BaseEyeTest):
    """
    Comprehensive cataract evaluation
    """
    CATARACT_TYPES = (
        ('nuclear', 'Nuclear Sclerosis'),
        ('cortical', 'Cortical Cataract'),
        ('psc', 'Posterior Subcapsular'),
        ('anterior_polar', 'Anterior Polar'),
        ('posterior_polar', 'Posterior Polar'),
        ('traumatic', 'Traumatic'),
        ('congenital', 'Congenital'),
        ('mixed', 'Mixed Type'),
    )
    
    SEVERITY_GRADES = (
        ('trace', 'Trace'),
        ('mild', 'Mild (Grade 1)'),
        ('moderate', 'Moderate (Grade 2)'),
        ('severe', 'Severe (Grade 3)'),
        ('mature', 'Mature (Grade 4)'),
    )
    
    # Right Eye Assessment
    right_eye_cataract_type = models.CharField(max_length=20, choices=CATARACT_TYPES, blank=True)
    right_eye_severity = models.CharField(max_length=20, choices=SEVERITY_GRADES, blank=True)
    right_eye_lens_clarity = models.TextField(blank=True)
    
    # Left Eye Assessment
    left_eye_cataract_type = models.CharField(max_length=20, choices=CATARACT_TYPES, blank=True)
    left_eye_severity = models.CharField(max_length=20, choices=SEVERITY_GRADES, blank=True)
    left_eye_lens_clarity = models.TextField(blank=True)
    
    # Functional Assessment
    glare_disability = models.BooleanField(default=False)
    contrast_sensitivity_reduced = models.BooleanField(default=False)
    visual_function_impact = models.TextField(blank=True)
    
    # Surgery Planning
    surgery_recommended = models.BooleanField(default=False)
    urgency_level = models.CharField(
        max_length=20,
        choices=(
            ('routine', 'Routine'),
            ('soon', 'Soon (within 3 months)'),
            ('urgent', 'Urgent (within 6 weeks)'),
            ('expedite', 'Expedite (within 2 weeks)'),
        ),
        blank=True
    )
    
    # IOL Planning
    iol_power_calculation = models.TextField(blank=True)
    target_refraction = models.CharField(max_length=50, blank=True)
    
    class Meta:
        verbose_name = "Cataract Assessment"
        verbose_name_plural = "Cataract Assessments"


# GLAUCOMA TESTING
class GlaucomaAssessment(BaseEyeTest):
    """
    Comprehensive glaucoma evaluation
    """
    # Intraocular Pressure
    right_eye_iop = models.DecimalField(
        max_digits=4, 
        decimal_places=1, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(80)]
    )
    left_eye_iop = models.DecimalField(
        max_digits=4, 
        decimal_places=1, 
        null=True, 
        blank=True,
        validators=[MinValueValidator(0), MaxValueValidator(80)]
    )
    iop_method = models.CharField(
        max_length=20,
        choices=(
            ('goldmann', 'Goldmann Applanation'),
            ('tonopen', 'Tonopen'),
            ('pneumatic', 'Pneumatic Tonometry'),
            ('rebound', 'Rebound Tonometry'),
        ),
        default='goldmann'
    )
    
    # Optic Disc Assessment
    right_disc_cup_ratio = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    left_disc_cup_ratio = models.DecimalField(max_digits=3, decimal_places=2, null=True, blank=True)
    right_disc_hemorrhage = models.BooleanField(default=False)
    left_disc_hemorrhage = models.BooleanField(default=False)
    right_disc_notching = models.BooleanField(default=False)
    left_disc_notching = models.BooleanField(default=False)
    
    # Nerve Fiber Layer
    right_nfl_defect = models.BooleanField(default=False)
    left_nfl_defect = models.BooleanField(default=False)
    nfl_description = models.TextField(blank=True)
    
    # Visual Field Results (will be linked to separate VF test)
    visual_field_defects = models.BooleanField(default=False)
    
    # Risk Assessment
    family_history_glaucoma = models.BooleanField(default=False)
    diabetes = models.BooleanField(default=False)
    myopia = models.BooleanField(default=False)
    central_corneal_thickness_right = models.PositiveIntegerField(null=True, blank=True)
    central_corneal_thickness_left = models.PositiveIntegerField(null=True, blank=True)
    
    # Diagnosis
    glaucoma_type = models.CharField(
        max_length=30,
        choices=(
            ('poag', 'Primary Open Angle Glaucoma'),
            ('pacg', 'Primary Angle Closure Glaucoma'),
            ('nsg', 'Normal Tension Glaucoma'),
            ('secondary', 'Secondary Glaucoma'),
            ('suspect', 'Glaucoma Suspect'),
            ('normal', 'Normal'),
        ),
        blank=True
    )
    
    # Treatment Plan
    treatment_required = models.BooleanField(default=False)
    target_iop = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    
    class Meta:
        verbose_name = "Glaucoma Assessment"
        verbose_name_plural = "Glaucoma Assessments"


class VisualFieldTest(BaseEyeTest):
    """
    Visual field testing (Perimetry)
    """
    TEST_TYPES = (
        ('humphrey_24_2', 'Humphrey 24-2'),
        ('humphrey_30_2', 'Humphrey 30-2'),
        ('humphrey_10_2', 'Humphrey 10-2'),
        ('octopus_g1', 'Octopus G1'),
        ('octopus_m1', 'Octopus M1'),
        ('goldmann', 'Goldmann Perimetry'),
        ('confrontation', 'Confrontation Fields'),
    )
    
    test_type = models.CharField(max_length=20, choices=TEST_TYPES)
    
    # Test Parameters
    strategy = models.CharField(
        max_length=20,
        choices=(
            ('sita_standard', 'SITA Standard'),
            ('sita_fast', 'SITA Fast'),
            ('sita_faster', 'SITA Faster'),
            ('full_threshold', 'Full Threshold'),
        ),
        default='sita_standard'
    )
    
    # Right Eye Results
    right_eye_md = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Mean Deviation")
    right_eye_psd = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Pattern Standard Deviation")
    right_eye_vfi = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True, help_text="Visual Field Index")
    right_eye_reliability = models.CharField(max_length=20, blank=True)
    
    # Left Eye Results
    left_eye_md = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    left_eye_psd = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    left_eye_vfi = models.DecimalField(max_digits=5, decimal_places=2, null=True, blank=True)
    left_eye_reliability = models.CharField(max_length=20, blank=True)
    
    # Defects
    right_eye_defects = models.TextField(blank=True)
    left_eye_defects = models.TextField(blank=True)
    
    # Test Quality
    fixation_losses_right = models.CharField(max_length=10, blank=True)
    false_positives_right = models.CharField(max_length=10, blank=True)
    false_negatives_right = models.CharField(max_length=10, blank=True)
    
    fixation_losses_left = models.CharField(max_length=10, blank=True)
    false_positives_left = models.CharField(max_length=10, blank=True)
    false_negatives_left = models.CharField(max_length=10, blank=True)
    
    class Meta:
        verbose_name = "Visual Field Test"
        verbose_name_plural = "Visual Field Tests"


# RETINAL ASSESSMENTS
class RetinalAssessment(BaseEyeTest):
    """
    Medical retina examination
    """
    # Fundoscopy Findings
    right_retina_findings = models.TextField(blank=True)
    left_retina_findings = models.TextField(blank=True)
    
    # Macula Assessment
    right_macula_normal = models.BooleanField(default=True)
    left_macula_normal = models.BooleanField(default=True)
    right_macula_findings = models.TextField(blank=True)
    left_macula_findings = models.TextField(blank=True)
    
    # Vascular Assessment
    arteriovenous_nicking = models.BooleanField(default=False)
    cotton_wool_spots = models.BooleanField(default=False)
    hard_exudates = models.BooleanField(default=False)
    hemorrhages = models.BooleanField(default=False)
    microaneurysms = models.BooleanField(default=False)
    
    # Retinal Conditions
    diabetic_retinopathy_present = models.BooleanField(default=False)
    amd_present = models.BooleanField(default=False)
    retinal_detachment = models.BooleanField(default=False)
    
    # Diagnosis
    primary_diagnosis = models.CharField(max_length=200, blank=True)
    secondary_diagnosis = models.CharField(max_length=200, blank=True)
    
    class Meta:
        verbose_name = "Retinal Assessment"
        verbose_name_plural = "Retinal Assessments"


class DiabeticRetinopathyScreening(BaseEyeTest):
    """
    Diabetic retinopathy screening and grading
    """
    DR_GRADES = (
        ('r0', 'R0 - No Retinopathy'),
        ('r1', 'R1 - Mild Non-proliferative'),
        ('r2', 'R2 - Moderate Non-proliferative'),
        ('r3a', 'R3a - Severe Non-proliferative'),
        ('r3s', 'R3s - Proliferative'),
    )
    
    MACULOPATHY_GRADES = (
        ('m0', 'M0 - No Maculopathy'),
        ('m1', 'M1 - Maculopathy Present'),
    )
    
    PHOTO_GRADES = (
        ('p0', 'P0 - Adequate Photos'),
        ('p1', 'P1 - Inadequate Photos'),
    )
    
    # Patient Demographics
    diabetes_type = models.CharField(
        max_length=15,
        choices=(
            ('type1', 'Type 1'),
            ('type2', 'Type 2'),
            ('gestational', 'Gestational'),
            ('other', 'Other'),
        )
    )
    diabetes_duration_years = models.PositiveIntegerField(null=True, blank=True)
    last_hba1c = models.DecimalField(max_digits=4, decimal_places=1, null=True, blank=True)
    
    # Screening Results
    right_eye_dr_grade = models.CharField(max_length=5, choices=DR_GRADES, blank=True)
    left_eye_dr_grade = models.CharField(max_length=5, choices=DR_GRADES, blank=True)
    right_eye_maculopathy = models.CharField(max_length=5, choices=MACULOPATHY_GRADES, blank=True)
    left_eye_maculopathy = models.CharField(max_length=5, choices=MACULOPATHY_GRADES, blank=True)
    photo_quality_right = models.CharField(max_length=5, choices=PHOTO_GRADES, blank=True)
    photo_quality_left = models.CharField(max_length=5, choices=PHOTO_GRADES, blank=True)
    
    # Detailed Findings
    microaneurysms_right = models.BooleanField(default=False)
    microaneurysms_left = models.BooleanField(default=False)
    hemorrhages_right = models.BooleanField(default=False)
    hemorrhages_left = models.BooleanField(default=False)
    exudates_right = models.BooleanField(default=False)
    exudates_left = models.BooleanField(default=False)
    cotton_wool_spots_right = models.BooleanField(default=False)
    cotton_wool_spots_left = models.BooleanField(default=False)
    venous_beading_right = models.BooleanField(default=False)
    venous_beading_left = models.BooleanField(default=False)
    irma_right = models.BooleanField(default=False)  # Intraretinal microvascular abnormalities
    irma_left = models.BooleanField(default=False)
    neovascularization_right = models.BooleanField(default=False)
    neovascularization_left = models.BooleanField(default=False)
    
    # Referral Decision
    referral_required = models.BooleanField(default=False)
    referral_urgency = models.CharField(
        max_length=20,
        choices=(
            ('routine', 'Routine'),
            ('urgent', 'Urgent'),
            ('immediate', 'Immediate'),
        ),
        blank=True
    )
    next_screening_months = models.PositiveIntegerField(default=12)
    
    class Meta:
        verbose_name = "Diabetic Retinopathy Screening"
        verbose_name_plural = "Diabetic Retinopathy Screenings"


# VITREORETINAL ASSESSMENTS
class VitreoretinalAssessment(BaseEyeTest):
    """
    Vitreoretinal examination and assessment
    """
    # Vitreous Assessment
    right_vitreous_clear = models.BooleanField(default=True)
    left_vitreous_clear = models.BooleanField(default=True)
    right_vitreous_hemorrhage = models.BooleanField(default=False)
    left_vitreous_hemorrhage = models.BooleanField(default=False)
    right_pvd = models.BooleanField(default=False)  # Posterior Vitreous Detachment
    left_pvd = models.BooleanField(default=False)
    
    # Retinal Detachment Assessment
    right_retinal_detachment = models.BooleanField(default=False)
    left_retinal_detachment = models.BooleanField(default=False)
    rd_type = models.CharField(
        max_length=20,
        choices=(
            ('rhegmatogenous', 'Rhegmatogenous'),
            ('tractional', 'Tractional'),
            ('exudative', 'Exudative'),
        ),
        blank=True
    )
    
    # Macular Conditions
    right_macular_hole = models.BooleanField(default=False)
    left_macular_hole = models.BooleanField(default=False)
    right_epiretinal_membrane = models.BooleanField(default=False)
    left_epiretinal_membrane = models.BooleanField(default=False)
    
    # Treatment Planning
    surgery_required = models.BooleanField(default=False)
    surgical_procedure = models.CharField(max_length=200, blank=True)
    urgency = models.CharField(
        max_length=20,
        choices=(
            ('elective', 'Elective'),
            ('urgent', 'Urgent'),
            ('emergency', 'Emergency'),
        ),
        blank=True
    )
    
    class Meta:
        verbose_name = "Vitreoretinal Assessment"
        verbose_name_plural = "Vitreoretinal Assessments"


# STRABISMUS AND ORTHOPTICS
class StrabismusAssessment(BaseEyeTest):
    """
    Strabismus and orthoptic evaluation
    """
    # Cover Test
    cover_test_distance = models.CharField(
        max_length=30,
        choices=(
            ('orthophoric', 'Orthophoric'),
            ('esotropia', 'Esotropia'),
            ('exotropia', 'Exotropia'),
            ('hypertropia_right', 'Right Hypertropia'),
            ('hypertropia_left', 'Left Hypertropia'),
            ('alternating', 'Alternating'),
        ),
        blank=True
    )
    cover_test_near = models.CharField(
        max_length=30,
        choices=(
            ('orthophoric', 'Orthophoric'),
            ('esotropia', 'Esotropia'),
            ('exotropia', 'Exotropia'),
            ('hypertropia_right', 'Right Hypertropia'),
            ('hypertropia_left', 'Left Hypertropia'),
            ('alternating', 'Alternating'),
        ),
        blank=True
    )
    
    # Prism Measurements
    distance_deviation_horizontal = models.CharField(max_length=20, blank=True)
    distance_deviation_vertical = models.CharField(max_length=20, blank=True)
    near_deviation_horizontal = models.CharField(max_length=20, blank=True)
    near_deviation_vertical = models.CharField(max_length=20, blank=True)
    
    # Ocular Motility
    right_eye_motility = models.TextField(blank=True)
    left_eye_motility = models.TextField(blank=True)
    binocular_movements = models.TextField(blank=True)
    
    # Binocular Vision
    stereopsis = models.CharField(max_length=50, blank=True)
    fusion = models.CharField(
        max_length=20,
        choices=(
            ('present', 'Present'),
            ('absent', 'Absent'),
            ('intermittent', 'Intermittent'),
        ),
        blank=True
    )
    
    # Amblyopia
    amblyopia_present = models.BooleanField(default=False)
    amblyopic_eye = models.CharField(
        max_length=10,
        choices=(
            ('right', 'Right'),
            ('left', 'Left'),
            ('bilateral', 'Bilateral'),
        ),
        blank=True
    )
    
    class Meta:
        verbose_name = "Strabismus Assessment"
        verbose_name_plural = "Strabismus Assessments"


# PEDIATRIC ASSESSMENTS
class PediatricEyeExam(BaseEyeTest):
    """
    Pediatric and orthoptic examination
    """
    # Age-appropriate tests
    age_at_exam = models.PositiveIntegerField(help_text="Age in months")
    cooperation_level = models.CharField(
        max_length=20,
        choices=(
            ('excellent', 'Excellent'),
            ('good', 'Good'),
            ('fair', 'Fair'),
            ('poor', 'Poor'),
        ),
        default='good'
    )
    
    # Visual Development
    fixation_right = models.CharField(
        max_length=20,
        choices=(
            ('central_steady', 'Central Steady'),
            ('central_unsteady', 'Central Unsteady'),
            ('eccentric', 'Eccentric'),
            ('unable_assess', 'Unable to Assess'),
        ),
        blank=True
    )
    fixation_left = models.CharField(
        max_length=20,
        choices=(
            ('central_steady', 'Central Steady'),
            ('central_unsteady', 'Central Unsteady'),
            ('eccentric', 'Eccentric'),
            ('unable_assess', 'Unable to Assess'),
        ),
        blank=True
    )
    
    # Following and Tracking
    horizontal_tracking = models.BooleanField(default=True)
    vertical_tracking = models.BooleanField(default=True)
    smooth_pursuits = models.BooleanField(default=True)
    
    # Screening Tests
    red_reflex_right = models.BooleanField(default=True)
    red_reflex_left = models.BooleanField(default=True)
    corneal_light_reflex = models.CharField(
        max_length=20,
        choices=(
            ('central', 'Central Bilateral'),
            ('decentered', 'Decentered'),
            ('unable_assess', 'Unable to Assess'),
        ),
        blank=True
    )
    
    # Development Concerns
    developmental_concerns = models.TextField(blank=True)
    family_history_eye_problems = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Pediatric Eye Exam"
        verbose_name_plural = "Pediatric Eye Exams"


# EYE CASUALTY/EMERGENCY ASSESSMENTS
class EyeCasualtyAssessment(BaseEyeTest):
    """
    Emergency eye casualty examination
    """
    INJURY_TYPES = (
        ('blunt_trauma', 'Blunt Trauma'),
        ('penetrating', 'Penetrating Injury'),
        ('chemical_burn', 'Chemical Burn'),
        ('thermal_burn', 'Thermal Burn'),
        ('foreign_body', 'Foreign Body'),
        ('flash_burn', 'Flash Burn'),
        ('laceration', 'Laceration'),
        ('other', 'Other'),
    )
    
    TRIAGE_CATEGORIES = (
        ('immediate', 'Immediate - Red'),
        ('urgent', 'Urgent - Orange'), 
        ('less_urgent', 'Less Urgent - Yellow'),
        ('non_urgent', 'Non-urgent - Green'),
    )
    
    # Injury Details
    injury_type = models.CharField(max_length=20, choices=INJURY_TYPES)
    triage_category = models.CharField(max_length=20, choices=TRIAGE_CATEGORIES)
    mechanism_of_injury = models.TextField()
    time_of_injury = models.DateTimeField()
    
    # Symptoms
    pain_level = models.PositiveIntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(10)],
        help_text="Pain scale 0-10"
    )
    vision_loss = models.BooleanField(default=False)
    diplopia = models.BooleanField(default=False)
    photophobia = models.BooleanField(default=False)
    discharge = models.BooleanField(default=False)
    
    # Examination Findings
    eyelid_injury = models.BooleanField(default=False)
    conjunctival_hemorrhage = models.BooleanField(default=False)
    corneal_abrasion = models.BooleanField(default=False)
    hyphema = models.BooleanField(default=False)
    pupil_abnormality = models.BooleanField(default=False)
    
    # Emergency Interventions
    irrigation_performed = models.BooleanField(default=False)
    foreign_body_removed = models.BooleanField(default=False)
    pressure_patch_applied = models.BooleanField(default=False)
    
    # Disposition
    admission_required = models.BooleanField(default=False)
    surgery_required = models.BooleanField(default=False)
    discharge_home = models.BooleanField(default=True)
    follow_up_arranged = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Eye Casualty Assessment"
        verbose_name_plural = "Eye Casualty Assessments"


# CORNEAL AND EXTERNAL EYE ASSESSMENTS
class CornealAssessment(BaseEyeTest):
    """
    Corneal and external eye disease examination
    """
    # Eyelid Assessment
    right_upper_lid_normal = models.BooleanField(default=True)
    right_lower_lid_normal = models.BooleanField(default=True)
    left_upper_lid_normal = models.BooleanField(default=True)
    left_lower_lid_normal = models.BooleanField(default=True)
    lid_abnormalities = models.TextField(blank=True)
    
    # Conjunctival Assessment
    right_conjunctiva_normal = models.BooleanField(default=True)
    left_conjunctiva_normal = models.BooleanField(default=True)
    conjunctival_injection = models.BooleanField(default=False)
    conjunctival_discharge = models.BooleanField(default=False)
    
    # Corneal Assessment
    right_cornea_clear = models.BooleanField(default=True)
    left_cornea_clear = models.BooleanField(default=True)
    corneal_opacity = models.BooleanField(default=False)
    corneal_edema = models.BooleanField(default=False)
    corneal_neovascularization = models.BooleanField(default=False)
    
    # Fluorescein Staining
    fluorescein_staining_performed = models.BooleanField(default=False)
    right_staining_pattern = models.TextField(blank=True)
    left_staining_pattern = models.TextField(blank=True)
    
    # Specific Conditions
    dry_eye_present = models.BooleanField(default=False)
    keratoconus = models.BooleanField(default=False)
    corneal_dystrophy = models.BooleanField(default=False)
    
    # Treatment Recommendations
    lubricants_prescribed = models.BooleanField(default=False)
    antibiotics_prescribed = models.BooleanField(default=False)
    steroids_prescribed = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Corneal Assessment"
        verbose_name_plural = "Corneal Assessments"


# OCT IMAGING
class OCTScan(BaseEyeTest):
    """
    Optical Coherence Tomography scans
    """
    SCAN_TYPES = (
        ('macula', 'Macular Scan'),
        ('optic_disc', 'Optic Disc Scan'),
        ('rnfl', 'RNFL Thickness'),
        ('anterior_segment', 'Anterior Segment'),
        ('wide_field', 'Wide Field'),
    )
    
    scan_type = models.CharField(max_length=20, choices=SCAN_TYPES)
    machine_model = models.CharField(max_length=100, blank=True)
    
    # Right Eye Results
    right_central_thickness = models.PositiveIntegerField(null=True, blank=True, help_text="Microns")
    right_average_thickness = models.PositiveIntegerField(null=True, blank=True)
    right_findings = models.TextField(blank=True)
    
    # Left Eye Results
    left_central_thickness = models.PositiveIntegerField(null=True, blank=True)
    left_average_thickness = models.PositiveIntegerField(null=True, blank=True)
    left_findings = models.TextField(blank=True)
    
    # Images
    right_eye_image = models.ImageField(upload_to='oct_scans/', null=True, blank=True)
    left_eye_image = models.ImageField(upload_to='oct_scans/', null=True, blank=True)
    
    # Quality Assessment
    scan_quality = models.CharField(
        max_length=20,
        choices=(
            ('excellent', 'Excellent'),
            ('good', 'Good'),
            ('acceptable', 'Acceptable'),
            ('poor', 'Poor'),
        ),
        default='good'
    )
    
    class Meta:
        verbose_name = "OCT Scan"
        verbose_name_plural = "OCT Scans"
