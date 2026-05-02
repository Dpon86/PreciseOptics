"""
Custom User and Staff models for PreciseOptics Eye Hospital Management System
"""
from django.contrib.auth.models import AbstractUser
from django.contrib.auth.hashers import make_password, check_password
from django.db import models
from django.core.validators import RegexValidator
import uuid
import secrets


class CustomUser(AbstractUser):
    """
    Extended user model for the eye hospital system
    """
    USER_TYPES = (
        ('admin', 'Administrator'),
        ('doctor', 'Doctor'),
        ('nurse', 'Nurse'),
        ('technician', 'Technician'),
        ('receptionist', 'Receptionist'),
        ('pharmacist', 'Pharmacist'),
        ('manager', 'Manager'),
    )
    
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user_type = models.CharField(max_length=20, choices=USER_TYPES, default='receptionist')
    employee_id = models.CharField(max_length=20, unique=True, null=True, blank=True)
    phone_number = models.CharField(
        max_length=15,
        validators=[RegexValidator(regex=r'^\+?1?\d{9,15}$')],
        null=True,
        blank=True
    )
    date_of_birth = models.DateField(null=True, blank=True)
    profile_picture = models.ImageField(upload_to='profiles/', null=True, blank=True)
    is_active = models.BooleanField(default=True)
    two_factor_enabled = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    def __str__(self):
        return f"{self.get_full_name()} ({self.employee_id})"


class StaffProfile(models.Model):
    """
    Extended profile information for staff members
    """
    DEPARTMENTS = (
        ('ophthalmology', 'Ophthalmology'),
        ('optometry', 'Optometry'),
        ('nursing', 'Nursing'),
        ('pharmacy', 'Pharmacy'),
        ('administration', 'Administration'),
        ('reception', 'Reception'),
        ('diagnostics', 'Diagnostics'),
        ('surgery', 'Surgery'),
    )
    
    SPECIALIZATIONS = (
        ('cataract', 'Cataract Surgery'),
        ('glaucoma', 'Glaucoma'),
        ('retina', 'Medical Retina'),
        ('diabetic_retinopathy', 'Diabetic Retinopathy'),
        ('vitreoretinal', 'Vitreoretinal Surgery'),
        ('strabismus', 'Strabismus'),
        ('paediatrics', 'Paediatrics & Orthoptics'),
        ('casualty', 'Eye Casualty'),
        ('corneal', 'Corneal & External Eye Disease'),
        ('general', 'General Ophthalmology'),
    )
    
    user = models.OneToOneField(CustomUser, on_delete=models.CASCADE, related_name='staff_profile')
    department = models.CharField(max_length=50, choices=DEPARTMENTS)
    specialization = models.CharField(max_length=50, choices=SPECIALIZATIONS, null=True, blank=True)
    license_number = models.CharField(max_length=100, unique=True, null=True, blank=True)
    qualification = models.TextField(null=True, blank=True)
    years_of_experience = models.PositiveIntegerField(default=0)
    consultation_fee = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    availability_schedule = models.JSONField(default=dict, help_text="Weekly schedule in JSON format")
    emergency_contact = models.CharField(max_length=20, null=True, blank=True)
    address = models.TextField(null=True, blank=True)
    hire_date = models.DateField(null=True, blank=True)
    is_consultant = models.BooleanField(default=False)
    can_prescribe = models.BooleanField(default=False)
    can_perform_surgery = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Staff Profile"
        verbose_name_plural = "Staff Profiles"
    
    def __str__(self):
        return f"Dr. {self.user.get_full_name()} - {self.get_specialization_display()}"


class UserSession(models.Model):
    """
    Track user sessions for audit purposes
    """
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    session_key = models.CharField(max_length=40)
    ip_address = models.GenericIPAddressField()
    user_agent = models.TextField()
    login_time = models.DateTimeField(auto_now_add=True)
    logout_time = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    
    class Meta:
        verbose_name = "User Session"
        verbose_name_plural = "User Sessions"
    
    def __str__(self):
        return f"{self.user.username} - {self.login_time}"


class PasswordResetToken(models.Model):
    """
    Password reset token for email-based password recovery
    """
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
    
    class Meta:
        verbose_name = "Password Reset Token"
        verbose_name_plural = "Password Reset Tokens"
    
    def __str__(self):
        return f"Reset token for {self.user.username}"
    
    def is_valid(self):
        """Check if token is still valid"""
        from django.utils import timezone
        return not self.is_used and timezone.now() < self.expires_at


class TwoFactorBackupCode(models.Model):
    """
    One-time-use emergency backup codes for 2FA recovery.

    Codes are stored as hashes (via Django's password hashing framework)
    so that a database breach does not expose usable codes.

    Codes are generated as 10 uppercase hex chars split with a hyphen
    (e.g. "ABCD1-EF234") so they are easy to read and type.
    """

    BACKUP_CODE_COUNT = 10

    user = models.ForeignKey(
        CustomUser,
        on_delete=models.CASCADE,
        related_name='backup_codes',
    )
    code_hash = models.CharField(max_length=200)
    created_at = models.DateTimeField(auto_now_add=True)
    used_at = models.DateTimeField(null=True, blank=True)
    is_used = models.BooleanField(default=False)

    class Meta:
        verbose_name = "2FA Backup Code"
        verbose_name_plural = "2FA Backup Codes"
        ordering = ['created_at']

    def __str__(self):
        used = " (used)" if self.is_used else ""
        return f"Backup code for {self.user.username}{used}"

    # ------------------------------------------------------------------
    # Class helpers
    # ------------------------------------------------------------------

    @classmethod
    def _format_code(cls, raw: str) -> str:
        """Format a 10-char hex string as XXXXX-XXXXX."""
        raw = raw.upper()
        return f"{raw[:5]}-{raw[5:]}"

    @classmethod
    def generate_for_user(cls, user) -> list[str]:
        """
        Delete existing backup codes for the user and generate a fresh set.

        Returns the list of **plaintext** codes (shown once; never stored
        in plaintext).
        """
        from django.utils import timezone

        cls.objects.filter(user=user).delete()

        plaintext_codes = []
        for _ in range(cls.BACKUP_CODE_COUNT):
            raw = secrets.token_hex(5)          # 10 hex chars = 40-bit entropy
            formatted = cls._format_code(raw)
            cls.objects.create(
                user=user,
                code_hash=make_password(formatted),
            )
            plaintext_codes.append(formatted)

        return plaintext_codes

    @classmethod
    def verify_and_consume(cls, user, code: str) -> bool:
        """
        Check whether `code` matches an unused backup code for `user`.

        If a match is found, marks it as used and returns True.
        Returns False if the code is invalid or already used.
        """
        from django.utils import timezone

        code = code.strip().upper()
        for backup in cls.objects.filter(user=user, is_used=False):
            if check_password(code, backup.code_hash):
                backup.is_used = True
                backup.used_at = timezone.now()
                backup.save(update_fields=['is_used', 'used_at'])
                return True
        return False
