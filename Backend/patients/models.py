"""
Patient models for PreciseOptics Eye Hospital Management System
"""
from django.db import models
from django.core.validators import RegexValidator
from accounts.models import CustomUser
from precise_optics.file_validators import validate_document_extension, validate_file_size
import uuid
import re


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
        max_length=20,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$')],
    )
    alternate_phone = models.CharField(
        max_length=20,
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
        max_length=20,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$')],
    )
    emergency_contact_relationship = models.CharField(max_length=50)
    
    # Insurance Information
    insurance_provider = models.CharField(max_length=200, null=True, blank=True)
    insurance_number = models.CharField(max_length=100, null=True, blank=True)
    nhs_number = models.CharField(
        max_length=20, unique=True, null=True, blank=True,
        help_text='NHS Number (10 digits, passes Modulus 11 check)'
    )
    
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

    @staticmethod
    def validate_nhs_number(nhs_number):
        """
        Validate an NHS number using the Modulus 11 check digit algorithm.

        NHS numbers are 10-digit numeric values where the 10th digit is a check digit.
        The algorithm: multiply each of the first 9 digits by 10, 9, 8, ..., 2,
        sum the results, divide by 11, and the remainder must equal the 10th digit.
        A remainder of 10 means the number is invalid.

        Args:
            nhs_number: A string representing the NHS number.

        Returns:
            (bool, str): Tuple of (is_valid, error_message).
        """
        if not nhs_number:
            return False, "NHS number is required."

        # Remove spaces, hyphens
        nhs_str = re.sub(r'[\s\-]', '', str(nhs_number))

        if not re.match(r'^\d{10}$', nhs_str):
            return False, "NHS number must be exactly 10 digits (numbers only)."

        digits = [int(ch) for ch in nhs_str]
        check_digit = digits[9]
        # Multiply first 9 digits by weighting factors 10 down to 2
        total = sum(digits[i] * (10 - i) for i in range(9))
        remainder = total % 11

        if remainder == 10:
            return False, "NHS number fails Modulus 11 check (remainder is 10)."

        # NHS standard: final remainder = 11 - total mod 11, compared to check digit
        expected_check = (11 - remainder) % 11  # % 11 in case remainder == 0 → 0

        if expected_check != check_digit:
            return False, (
                f"NHS number fails Modulus 11 check (expected check digit {expected_check}, "
                f"got {check_digit})."
            )

        return True, ""


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

    # Clinic session link (optional — allows grouping visits by session and enforcing capacity)
    clinic_session = models.ForeignKey(
        'ClinicSession',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='visits',
        help_text='Clinic session this visit belongs to (used for capacity tracking and calendar view)',
    )

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
    file = models.FileField(upload_to='patient_documents/', validators=[validate_document_extension, validate_file_size])
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


class AppointmentAlert(models.Model):
    """
    Track alerts for missed or late appointments
    """
    ALERT_TYPES = (
        ('missed', 'Missed Appointment'),
        ('late', 'Late Arrival'),
        ('upcoming', 'Upcoming Appointment'),
        ('overdue_followup', 'Overdue Follow-up'),
    )
    
    ALERT_SEVERITY = (
        ('low', 'Low'),
        ('medium', 'Medium'),
        ('high', 'High'),
        ('critical', 'Critical'),
    )
    
    ALERT_STATUS = (
        ('active', 'Active'),
        ('acknowledged', 'Acknowledged'),
        ('resolved', 'Resolved'),
        ('dismissed', 'Dismissed'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    patient = models.ForeignKey(Patient, on_delete=models.CASCADE, related_name='alerts')
    visit = models.ForeignKey(PatientVisit, on_delete=models.CASCADE, related_name='alerts', null=True, blank=True)
    
    # Alert Details
    alert_type = models.CharField(max_length=20, choices=ALERT_TYPES)
    severity = models.CharField(max_length=10, choices=ALERT_SEVERITY, default='medium')
    status = models.CharField(max_length=15, choices=ALERT_STATUS, default='active')
    
    # Message
    title = models.CharField(max_length=200)
    message = models.TextField()
    
    # Timing
    trigger_time = models.DateTimeField(help_text="When the alert was triggered")
    acknowledged_at = models.DateTimeField(null=True, blank=True)
    acknowledged_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='acknowledged_alerts'
    )
    resolved_at = models.DateTimeField(null=True, blank=True)
    resolved_by = models.ForeignKey(
        CustomUser, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='resolved_alerts'
    )
    
    # Action tracking
    action_taken = models.TextField(blank=True, help_text="Actions taken to resolve the alert")
    notes = models.TextField(blank=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Appointment Alert"
        verbose_name_plural = "Appointment Alerts"
        ordering = ['-trigger_time', '-created_at']
        indexes = [
            models.Index(fields=['status', 'alert_type']),
            models.Index(fields=['trigger_time']),
            models.Index(fields=['-created_at']),
        ]
    
    def __str__(self):
        return f"{self.get_alert_type_display()} - {self.patient.get_full_name()} ({self.status})"


class AlertConfiguration(models.Model):
    """
    System-wide alert configuration settings
    """
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    
    # Timing thresholds (in minutes)
    late_threshold_minutes = models.IntegerField(
        default=15,
        help_text="Minutes past scheduled time to trigger 'late' alert"
    )
    missed_threshold_minutes = models.IntegerField(
        default=60,
        help_text="Minutes past scheduled time to mark as 'missed'"
    )
    upcoming_reminder_minutes = models.IntegerField(
        default=60,
        help_text="Minutes before appointment to send reminder"
    )
    overdue_followup_days = models.IntegerField(
        default=30,
        help_text="Days after last visit to trigger follow-up alert"
    )
    
    # Auto-resolution settings
    auto_resolve_on_checkin = models.BooleanField(
        default=True,
        help_text="Automatically resolve late/missed alerts when patient checks in"
    )
    auto_dismiss_after_days = models.IntegerField(
        default=7,
        help_text="Days after which to auto-dismiss unresolved alerts (0 = never)"
    )
    
    # Notification settings
    send_email_alerts = models.BooleanField(default=False)
    send_sms_alerts = models.BooleanField(default=False)
    
    # Active configuration
    is_active = models.BooleanField(default=True)
    
    # Timestamps
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        related_name='created_alert_configs'
    )
    
    class Meta:
        verbose_name = "Alert Configuration"
        verbose_name_plural = "Alert Configurations"
        ordering = ['-is_active', '-created_at']
    
    def __str__(self):
        status = "Active" if self.is_active else "Inactive"
        return f"Alert Configuration ({status}) - Late: {self.late_threshold_minutes}min, Missed: {self.missed_threshold_minutes}min"
    
    @classmethod
    def get_active_config(cls):
        """Get the active alert configuration"""
        config = cls.objects.filter(is_active=True).first()
        if not config:
            # Create default configuration if none exists
            config = cls.objects.create(is_active=True)
        return config


class ClinicSession(models.Model):
    """
    Represents a scheduled clinic session (e.g. AMD Monday AM, Glaucoma Wednesday PM).

    PatientVisits are linked to a ClinicSession so the system can enforce
    capacity limits, group appointments by session type, and display the
    week/month calendar view correctly.
    """

    CLINIC_TYPES = (
        ('amd', 'AMD / Anti-VEGF'),
        ('glaucoma', 'Glaucoma'),
        ('cataract', 'Cataract'),
        ('diabetic', 'Diabetic Retinopathy'),
        ('retina', 'Medical Retina'),
        ('paediatrics', 'Paediatrics'),
        ('corneal', 'Corneal'),
        ('general', 'General Ophthalmology'),
        ('emergency', 'Eye Casualty / Emergency'),
        ('other', 'Other'),
    )

    DAY_CHOICES = (
        (0, 'Monday'),
        (1, 'Tuesday'),
        (2, 'Wednesday'),
        (3, 'Thursday'),
        (4, 'Friday'),
        (5, 'Saturday'),
        (6, 'Sunday'),
    )

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    name = models.CharField(max_length=200, help_text='Descriptive name, e.g. "AMD Monday Morning"')
    clinic_type = models.CharField(max_length=20, choices=CLINIC_TYPES)
    consultant = models.ForeignKey(
        CustomUser,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='clinic_sessions',
        help_text='Lead consultant for this session',
    )

    # Recurring schedule
    day_of_week = models.IntegerField(choices=DAY_CHOICES, help_text='0 = Monday, 6 = Sunday')
    start_time = models.TimeField()
    end_time = models.TimeField()
    room_location = models.CharField(max_length=100, blank=True, help_text='Room or location identifier')

    # Capacity
    max_appointments = models.PositiveIntegerField(
        default=20,
        help_text='Maximum number of patient appointments per session',
    )

    is_active = models.BooleanField(default=True)

    # Audit
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    created_by = models.ForeignKey(
        CustomUser,
        on_delete=models.PROTECT,
        related_name='created_clinic_sessions',
    )

    class Meta:
        verbose_name = 'Clinic Session'
        verbose_name_plural = 'Clinic Sessions'
        ordering = ['day_of_week', 'start_time']

    def __str__(self):
        day_name = dict(self.DAY_CHOICES).get(self.day_of_week, str(self.day_of_week))
        return f'{self.name} ({day_name} {self.start_time.strftime("%H:%M")}–{self.end_time.strftime("%H:%M")})'

    def booked_count_on_date(self, date):
        """Return the number of non-cancelled visits linked to this session on a given date."""
        return self.visits.filter(
            scheduled_date__date=date,
        ).exclude(status='cancelled').count()

    def is_full_on_date(self, date):
        """Return True if the session has reached max_appointments for the given date."""
        return self.booked_count_on_date(date) >= self.max_appointments

    def available_slots_on_date(self, date):
        """Return the number of remaining slots for a given date."""
        return max(0, self.max_appointments - self.booked_count_on_date(date))


