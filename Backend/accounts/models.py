"""
Custom User and Staff models for PreciseOptics Eye Hospital Management System
"""
from django.contrib.auth.models import AbstractUser
from django.db import models
from django.core.validators import RegexValidator
import uuid


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
