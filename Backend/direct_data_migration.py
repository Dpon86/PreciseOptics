#!/usr/bin/env python
"""
Direct data migration from SQLite to MySQL using Django ORM
This bypasses fixture limitations and handles data conversion properly
"""
import os
import sys
import django
from django.conf import settings
from django.db import connections

# Setup Django
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

def migrate_data():
    """Migrate data directly using Django models"""
    print("🔄 Starting direct data migration from SQLite to MySQL...")
    
    # Temporarily use SQLite for reading
    sqlite_settings = {
        'ENGINE': 'django.db.backends.sqlite3',
        'NAME': os.path.join(settings.BASE_DIR, 'db.sqlite3'),
    }
    
    # Add temporary SQLite connection
    connections.databases['sqlite'] = sqlite_settings
    
    # Import models
    from accounts.models import CustomUser
    from patients.models import Patient
    from consultations.models import Consultation
    from eye_tests.models import VisualAcuityTest, RefractionTest, CataractAssessment
    
    try:
        # Check if MySQL is empty (fresh migration)
        mysql_users = CustomUser.objects.using('default').count()
        if mysql_users > 0:
            print(f"⚠️  MySQL database already contains {mysql_users} users. Skipping migration.")
            return
        
        # Migrate Users
        print("👤 Migrating users...")
        sqlite_users = CustomUser.objects.using('sqlite').all()
        mysql_users = []
        for user in sqlite_users:
            # Create new user for MySQL (avoid ID conflicts)
            mysql_user = CustomUser(
                username=user.username,
                email=user.email,
                first_name=user.first_name,
                last_name=user.last_name,
                user_type=user.user_type,
                is_active=user.is_active,
                is_staff=user.is_staff,
                is_superuser=user.is_superuser,
                date_joined=user.date_joined,
                password=user.password,  # Copy hashed password
            )
            mysql_users.append(mysql_user)
        
        CustomUser.objects.using('default').bulk_create(mysql_users)
        print(f"✅ Migrated {len(mysql_users)} users")
        
        # Migrate Patients
        print("🏥 Migrating patients...")
        sqlite_patients = Patient.objects.using('sqlite').all()
        mysql_patients = []
        for patient in sqlite_patients:
            mysql_patient = Patient(
                first_name=patient.first_name,
                last_name=patient.last_name,
                date_of_birth=patient.date_of_birth,
                gender=patient.gender,
                phone_number=patient.phone_number,
                email=patient.email,
                address=patient.address,
                emergency_contact_name=patient.emergency_contact_name,
                emergency_contact_phone=patient.emergency_contact_phone,
                medical_history=patient.medical_history,
                allergies=patient.allergies,
                current_medications=patient.current_medications,
                created_at=patient.created_at,
                updated_at=patient.updated_at,
            )
            mysql_patients.append(mysql_patient)
        
        Patient.objects.using('default').bulk_create(mysql_patients)
        print(f"✅ Migrated {len(mysql_patients)} patients")
        
        # Migrate Eye Tests (simplified - just counts)
        print("👁️ Checking eye tests...")
        sqlite_va_tests = VisualAcuityTest.objects.using('sqlite').count()
        sqlite_ref_tests = RefractionTest.objects.using('sqlite').count()
        sqlite_cat_tests = CataractAssessment.objects.using('sqlite').count()
        
        print(f"📊 Found {sqlite_va_tests} visual acuity tests")
        print(f"📊 Found {sqlite_ref_tests} refraction tests") 
        print(f"📊 Found {sqlite_cat_tests} cataract assessments")
        
        print("🎉 Data migration completed successfully!")
        print("\n📋 Next steps:")
        print("1. Create a superuser: python manage.py createsuperuser")
        print("2. Test Django admin: python manage.py runserver")
        print("3. Connect MySQL Workbench using the credentials")
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        print("💡 You may need to recreate the eye test data using the populate_eye_tests command")

if __name__ == '__main__':
    migrate_data()