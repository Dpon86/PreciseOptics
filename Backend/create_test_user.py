#!/usr/bin/env python
"""
Quick script to create a test user for the PreciseOptics system
"""
import os
import sys
import django

# Add the project root to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Set up Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

from accounts.models import CustomUser, StaffProfile

def create_test_users():
    """Create test users for development"""
    
    # Create admin user
    admin_user, created = CustomUser.objects.get_or_create(
        username='admin',
        defaults={
            'email': 'admin@preciseoptics.com',
            'first_name': 'Admin',
            'last_name': 'User',
            'user_type': 'admin',
            'employee_id': 'ADM001',
            'is_staff': True,
            'is_superuser': True,
        }
    )
    if created:
        admin_user.set_password('admin123')
        admin_user.save()
        print(f"✅ Created admin user: {admin_user.username}")
    else:
        print(f"ℹ️  Admin user already exists: {admin_user.username}")
    
    # Create doctor user
    doctor_user, created = CustomUser.objects.get_or_create(
        username='dr.smith',
        defaults={
            'email': 'dr.smith@preciseoptics.com',
            'first_name': 'John',
            'last_name': 'Smith',
            'user_type': 'doctor',
            'employee_id': 'DOC001',
        }
    )
    if created:
        doctor_user.set_password('password123')
        doctor_user.save()
        print(f"✅ Created doctor user: {doctor_user.username}")
        
        # Create staff profile for doctor
        StaffProfile.objects.get_or_create(
            user=doctor_user,
            defaults={
                'department': 'ophthalmology',
                'specialization': 'retina',
                'license_number': 'LIC001',
                'qualification': 'MD, Ophthalmology',
                'years_of_experience': 10,
                'consultation_fee': 150.00,
                'is_consultant': True,
                'can_prescribe': True,
                'can_perform_surgery': True,
            }
        )
    else:
        print(f"ℹ️  Doctor user already exists: {doctor_user.username}")
    
    # Create nurse user
    nurse_user, created = CustomUser.objects.get_or_create(
        username='nurse.brown',
        defaults={
            'email': 'nurse.brown@preciseoptics.com',
            'first_name': 'Sarah',
            'last_name': 'Brown',
            'user_type': 'nurse',
            'employee_id': 'NUR001',
        }
    )
    if created:
        nurse_user.set_password('password123')
        nurse_user.save()
        print(f"✅ Created nurse user: {nurse_user.username}")
        
        # Create staff profile for nurse
        StaffProfile.objects.get_or_create(
            user=nurse_user,
            defaults={
                'department': 'general',
                'license_number': 'NUR001',
                'qualification': 'RN, BSN',
                'years_of_experience': 5,
                'is_consultant': False,
                'can_prescribe': False,
                'can_perform_surgery': False,
            }
        )
    else:
        print(f"ℹ️  Nurse user already exists: {nurse_user.username}")
    
    print("\n🎉 Test users setup complete!")
    print("\n📋 Login Credentials:")
    print("👤 Admin: admin / admin123")
    print("👨‍⚕️ Doctor: dr.smith / password123")
    print("👩‍⚕️ Nurse: nurse.brown / password123")

if __name__ == '__main__':
    create_test_users()
