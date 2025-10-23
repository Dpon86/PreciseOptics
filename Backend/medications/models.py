"""
Medication and prescription models for PreciseOptics Eye Hospital Management System
"""
from django.db import models
from django.core.validators import MinValueValidator, MaxValueValidator
from patients.models import Patient, PatientVisit
from accounts.models import CustomUser
import uuid


class Manufacturer(models.Model):
    """
    Medication manufacturers
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    contact_person = models.CharField(max_length=200, blank=True)
    email = models.EmailField(blank=True)
    phone = models.CharField(max_length=20, blank=True)
    address = models.TextField(blank=True)
    website = models.URLField(blank=True)
    country = models.CharField(max_length=100)
    
    # Certifications and Compliance
    is_certified = models.BooleanField(default=True, help_text="FDA/WHO certified")
    certification_number = models.CharField(max_length=100, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        verbose_name = "Manufacturer"
        verbose_name_plural = "Manufacturers"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class MedicationCategory(models.Model):
    """
    Categories for organizing medications
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=100, unique=True)
    description = models.TextField(blank=True)
    parent_category = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subcategories'
    )
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        verbose_name = "Medication Category"
        verbose_name_plural = "Medication Categories"
        ordering = ['name']
    
    def __str__(self):
        if self.parent_category:
            return f"{self.parent_category.name} > {self.name}"
        return self.name


class Medication(models.Model):
    """
    Master medication database
    """
    MEDICATION_TYPES = (
        ('eye_drop', 'Eye Drop'),
        ('ointment', 'Eye Ointment'),
        ('tablet', 'Tablet'),
        ('injection', 'Injection'),
        ('gel', 'Eye Gel'),
        ('insert', 'Eye Insert'),
        ('solution', 'Solution'),
    )
    
    THERAPEUTIC_CLASS = (
        ('antibiotic', 'Antibiotic'),
        ('anti_inflammatory', 'Anti-inflammatory'),
        ('steroid', 'Steroid'),
        ('antiglaucoma', 'Anti-glaucoma'),
        ('mydriatic', 'Mydriatic'),
        ('anesthetic', 'Anesthetic'),
        ('antiviral', 'Antiviral'),
        ('antifungal', 'Antifungal'),
        ('lubricant', 'Lubricant'),
        ('vasodilator', 'Vasodilator'),
        ('anti_vegf', 'Anti-VEGF'),
        ('immunosuppressive', 'Immunosuppressive'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    name = models.CharField(max_length=200, unique=True)
    generic_name = models.CharField(max_length=200)
    brand_names = models.TextField(help_text="Comma-separated brand names")
    medication_type = models.CharField(max_length=20, choices=MEDICATION_TYPES)
    therapeutic_class = models.CharField(max_length=30, choices=THERAPEUTIC_CLASS)
    category = models.ForeignKey(
        MedicationCategory,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='medications'
    )
    
    # Drug Information
    strength = models.CharField(max_length=100, help_text="e.g., 0.5%, 10mg/ml")
    active_ingredients = models.TextField()
    description = models.TextField()
    indications = models.TextField(help_text="Medical conditions this drug treats")
    contraindications = models.TextField(help_text="When not to use this drug")
    side_effects = models.TextField()
    
    # Dosage Information
    standard_dosage = models.CharField(max_length=200, help_text="Standard dosage instructions")
    maximum_daily_dose = models.CharField(max_length=100)
    
    # Storage and Handling
    storage_temperature = models.CharField(max_length=100)
    shelf_life_months = models.PositiveIntegerField()
    special_handling = models.TextField(blank=True)
    
    # Regulatory
    manufacturer = models.CharField(
        max_length=200, 
        help_text="Manufacturer name (legacy field)",
        db_column='manufacturer_legacy'  # Point to actual database column
    )
    manufacturer_fk = models.ForeignKey(
        Manufacturer,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='medications',
        verbose_name="Manufacturer (New)"
    )
    batch_number = models.CharField(max_length=100, blank=True)
    expiry_date = models.DateField(null=True, blank=True)
    approval_status = models.BooleanField(default=True)
    
    # Inventory
    current_stock = models.PositiveIntegerField(default=0)
    minimum_stock_level = models.PositiveIntegerField(default=10)
    unit_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    
    class Meta:
        verbose_name = "Medication"
        verbose_name_plural = "Medications"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.strength})"
    
    def is_low_stock(self):
        return self.current_stock <= self.minimum_stock_level


class Prescription(models.Model):
    """
    Patient prescriptions
    """
    PRESCRIPTION_STATUS = (
        ('active', 'Active'),
        ('completed', 'Completed'),
        ('cancelled', 'Cancelled'),
        ('expired', 'Expired'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prescription_number = models.CharField(max_length=50, unique=True)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='prescriptions')
    visit = models.ForeignKey(PatientVisit, on_delete=models.CASCADE, related_name='prescriptions')
    prescribing_doctor = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='prescriptions')
    
    # Prescription Details
    diagnosis = models.TextField()
    instructions = models.TextField(help_text="General instructions for the patient")
    status = models.CharField(max_length=20, choices=PRESCRIPTION_STATUS, default='active')
    
    # Validity
    date_prescribed = models.DateTimeField(auto_now_add=True)
    valid_until = models.DateField()
    
    # Notes
    doctor_notes = models.TextField(blank=True)
    pharmacy_notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Prescription"
        verbose_name_plural = "Prescriptions"
        ordering = ['-date_prescribed']
    
    def __str__(self):
        return f"Prescription {self.prescription_number} - {self.patient.get_full_name()}"


class PrescriptionItem(models.Model):
    """
    Individual medication items in a prescription
    """
    DOSAGE_FREQUENCY = (
        ('once_daily', 'Once daily'),
        ('twice_daily', 'Twice daily'),
        ('three_times_daily', 'Three times daily'),
        ('four_times_daily', 'Four times daily'),
        ('every_2_hours', 'Every 2 hours'),
        ('every_4_hours', 'Every 4 hours'),
        ('every_6_hours', 'Every 6 hours'),
        ('every_8_hours', 'Every 8 hours'),
        ('as_needed', 'As needed'),
        ('bedtime', 'At bedtime'),
        ('morning', 'Morning only'),
        ('custom', 'Custom frequency'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    prescription = models.ForeignKey(Prescription, on_delete=models.CASCADE, related_name='items')
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE)
    
    # Dosage Instructions
    dosage = models.CharField(max_length=100, help_text="e.g., 1 drop, 2 tablets")
    frequency = models.CharField(max_length=20, choices=DOSAGE_FREQUENCY)
    custom_frequency = models.CharField(max_length=200, blank=True)
    duration_days = models.PositiveIntegerField(validators=[MinValueValidator(1), MaxValueValidator(365)])
    
    # Specific Instructions
    eye_side = models.CharField(
        max_length=10,
        choices=(
            ('both', 'Both Eyes'),
            ('left', 'Left Eye'),
            ('right', 'Right Eye'),
        ),
        default='both'
    )
    special_instructions = models.TextField(blank=True)
    
    # Quantity
    quantity_prescribed = models.PositiveIntegerField(help_text="Total quantity to dispense")
    quantity_dispensed = models.PositiveIntegerField(default=0)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Prescription Item"
        verbose_name_plural = "Prescription Items"
    
    def __str__(self):
        return f"{self.medication.name} - {self.dosage} {self.get_frequency_display()}"


class MedicationAdministration(models.Model):
    """
    Track medication administration in hospital
    """
    ADMINISTRATION_ROUTE = (
        ('topical', 'Topical (Eye Drop/Ointment)'),
        ('oral', 'Oral'),
        ('injection_iv', 'Intravenous Injection'),
        ('injection_im', 'Intramuscular Injection'),
        ('injection_subconjunctival', 'Subconjunctival Injection'),
        ('injection_intravitreal', 'Intravitreal Injection'),
        ('injection_periocular', 'Periocular Injection'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='administrations')
    visit = models.ForeignKey(PatientVisit, on_delete=models.CASCADE, related_name='administrations')
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE)
    
    # Administration Details
    administered_by = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='administered_medications')
    administration_time = models.DateTimeField()
    route = models.CharField(max_length=30, choices=ADMINISTRATION_ROUTE)
    dosage_administered = models.CharField(max_length=100)
    
    # Location (for eye medications)
    eye_side = models.CharField(
        max_length=10,
        choices=(
            ('both', 'Both Eyes'),
            ('left', 'Left Eye'),
            ('right', 'Right Eye'),
        ),
        null=True,
        blank=True
    )
    
    # Notes
    notes = models.TextField(blank=True)
    adverse_reactions = models.TextField(blank=True)
    
    # Verification
    verified_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='verified_administrations'
    )
    verification_time = models.DateTimeField(null=True, blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Medication Administration"
        verbose_name_plural = "Medication Administrations"
        ordering = ['-administration_time']
    
    def __str__(self):
        return f"{self.medication.name} administered to {self.patient.get_full_name()} at {self.administration_time}"


class DrugAllergy(models.Model):
    """
    Patient drug allergies and adverse reactions
    """
    SEVERITY_LEVELS = (
        ('mild', 'Mild'),
        ('moderate', 'Moderate'),
        ('severe', 'Severe'),
        ('life_threatening', 'Life Threatening'),
    )
    
    REACTION_TYPES = (
        ('allergic', 'Allergic Reaction'),
        ('adverse', 'Adverse Drug Reaction'),
        ('intolerance', 'Drug Intolerance'),
        ('interaction', 'Drug Interaction'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='drug_allergies')
    medication = models.ForeignKey(Medication, on_delete=models.CASCADE, related_name='allergic_patients')
    
    # Reaction Details
    reaction_type = models.CharField(max_length=20, choices=REACTION_TYPES)
    severity = models.CharField(max_length=20, choices=SEVERITY_LEVELS)
    symptoms = models.TextField(help_text="Description of allergic symptoms")
    
    # Occurrence Details
    first_occurrence_date = models.DateField()
    last_occurrence_date = models.DateField(null=True, blank=True)
    
    # Documentation
    documented_by = models.ForeignKey(CustomUser, on_delete=models.SET_NULL, null=True)
    notes = models.TextField(blank=True)
    
    # Status
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Drug Allergy"
        verbose_name_plural = "Drug Allergies"
        unique_together = ['patient', 'medication']
    
    def __str__(self):
        return f"{self.patient.get_full_name()} - {self.medication.name} ({self.get_severity_display()})"
