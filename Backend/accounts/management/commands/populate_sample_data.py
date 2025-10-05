"""
Management command to populate the database with sample data for testing
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from accounts.models import StaffProfile
from patients.models import Patient
from medications.models import Medication
from datetime import date, datetime
import uuid

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate the database with sample data for testing'

    def handle(self, *args, **options):
        self.stdout.write('Creating sample data...')
        
        # Create sample staff users
        self.create_staff_users()
        
        # Create sample patients
        self.create_patients()
        
        # Create sample medications
        self.create_medications()
        
        self.stdout.write(
            self.style.SUCCESS('Successfully created sample data!')
        )

    def create_staff_users(self):
        """Create sample staff users with different roles"""
        staff_data = [
            {
                'username': 'dr.smith',
                'email': 'dr.smith@preciseoptics.com',
                'first_name': 'John',
                'last_name': 'Smith',
                'user_type': 'doctor',
                'employee_id': 'DOC001',
                'department': 'ophthalmology',
                'specialization': 'cataract',
                'is_consultant': True,
                'can_prescribe': True,
                'can_perform_surgery': True,
            },
            {
                'username': 'dr.jones',
                'email': 'dr.jones@preciseoptics.com',
                'first_name': 'Sarah',
                'last_name': 'Jones',
                'user_type': 'doctor',
                'employee_id': 'DOC002',
                'department': 'ophthalmology',
                'specialization': 'glaucoma',
                'is_consultant': True,
                'can_prescribe': True,
            },
            {
                'username': 'nurse.brown',
                'email': 'nurse.brown@preciseoptics.com',
                'first_name': 'Emma',
                'last_name': 'Brown',
                'user_type': 'nurse',
                'employee_id': 'NUR001',
                'department': 'nursing',
                'can_prescribe': False,
            },
        ]
        
        for staff_info in staff_data:
            user, created = User.objects.get_or_create(
                username=staff_info['username'],
                defaults={
                    'email': staff_info['email'],
                    'first_name': staff_info['first_name'],
                    'last_name': staff_info['last_name'],
                    'user_type': staff_info['user_type'],
                    'employee_id': staff_info['employee_id'],
                    'is_active': True,
                }
            )
            
            if created:
                user.set_password('password123')
                user.save()
                
                # Create staff profile
                StaffProfile.objects.get_or_create(
                    user=user,
                    defaults={
                        'department': staff_info['department'],
                        'specialization': staff_info.get('specialization'),
                        'is_consultant': staff_info.get('is_consultant', False),
                        'can_prescribe': staff_info.get('can_prescribe', False),
                        'can_perform_surgery': staff_info.get('can_perform_surgery', False),
                        'years_of_experience': 10,
                        'hire_date': date(2020, 1, 1),
                    }
                )
                
                self.stdout.write(f'Created staff user: {user.username}')

    def create_patients(self):
        """Create sample patients"""
        patients_data = [
            {
                'patient_id': 'PAT001',
                'first_name': 'Alice',
                'last_name': 'Johnson',
                'date_of_birth': date(1975, 5, 15),
                'gender': 'F',
                'phone_number': '+441234567890',
                'email': 'alice.johnson@email.com',
                'address_line_1': '123 High Street',
                'city': 'London',
                'state': 'England',
                'postal_code': 'SW1A 1AA',
                'country': 'UK',
                'emergency_contact_name': 'Bob Johnson',
                'emergency_contact_phone': '+441234567891',
                'emergency_contact_relationship': 'Husband',
                'nhs_number': 'NHS123456789',
            },
            {
                'patient_id': 'PAT002',
                'first_name': 'Robert',
                'last_name': 'Wilson',
                'date_of_birth': date(1960, 12, 3),
                'gender': 'M',
                'phone_number': '+441234567892',
                'address_line_1': '456 Oak Avenue',
                'city': 'Manchester',
                'state': 'England',
                'postal_code': 'M1 1AA',
                'country': 'UK',
                'emergency_contact_name': 'Mary Wilson',
                'emergency_contact_phone': '+441234567893',
                'emergency_contact_relationship': 'Wife',
                'nhs_number': 'NHS123456790',
            },
        ]
        
        for patient_data in patients_data:
            patient, created = Patient.objects.get_or_create(
                patient_id=patient_data['patient_id'],
                defaults=patient_data
            )
            
            if created:
                self.stdout.write(f'Created patient: {patient.get_full_name()}')

    def create_medications(self):
        """Create sample medications"""
        medications_data = [
            {
                'name': 'Timolol 0.5% Eye Drops',
                'generic_name': 'Timolol Maleate',
                'brand_names': 'Timoptol, Betim',
                'medication_type': 'eye_drop',
                'therapeutic_class': 'antiglaucoma',
                'strength': '0.5%',
                'active_ingredients': 'Timolol Maleate 0.5%',
                'description': 'Beta-blocker eye drops for glaucoma treatment',
                'indications': 'Primary open-angle glaucoma, ocular hypertension',
                'contraindications': 'Asthma, severe COPD, heart block',
                'side_effects': 'Eye irritation, blurred vision, systemic beta-blocker effects',
                'standard_dosage': '1 drop twice daily',
                'maximum_daily_dose': '2 drops per eye',
                'manufacturer': 'Bausch & Lomb',
                'current_stock': 50,
                'minimum_stock_level': 10,
                'unit_price': 12.50,
                'shelf_life_months': 24,
                'storage_temperature': '2-8°C',
                'special_handling': 'Store in refrigerator',
            },
            {
                'name': 'Chloramphenicol 0.5% Eye Drops',
                'generic_name': 'Chloramphenicol',
                'brand_names': 'Chloromycetin, Minims',
                'medication_type': 'eye_drop',
                'therapeutic_class': 'antibiotic',
                'strength': '0.5%',
                'active_ingredients': 'Chloramphenicol 0.5%',
                'description': 'Broad-spectrum antibiotic eye drops',
                'indications': 'Bacterial conjunctivitis, corneal infections',
                'contraindications': 'Hypersensitivity to chloramphenicol',
                'side_effects': 'Eye irritation, allergic reactions',
                'standard_dosage': '1 drop every 2-4 hours',
                'maximum_daily_dose': '6 drops per eye',
                'manufacturer': 'Martindale Pharma',
                'current_stock': 30,
                'minimum_stock_level': 5,
                'unit_price': 8.75,
                'shelf_life_months': 36,
                'storage_temperature': 'Room temperature',
                'special_handling': 'Protect from light',
            },
        ]
        
        for med_data in medications_data:
            medication, created = Medication.objects.get_or_create(
                name=med_data['name'],
                defaults=med_data
            )
            
            if created:
                self.stdout.write(f'Created medication: {medication.name}')