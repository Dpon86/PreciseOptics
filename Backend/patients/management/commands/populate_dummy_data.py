"""
Management command to populate database with dummy data for testing
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import datetime, timedelta
import random
from decimal import Decimal
import uuid

from accounts.models import CustomUser, StaffProfile
from patients.models import Patient, PatientVisit
from medications.models import Medication, Prescription
from consultations.models import Consultation
from eye_tests.models import (
    GlaucomaAssessment, VisualAcuityTest, VisualFieldTest, 
    OCTScan, CataractAssessment, RetinalAssessment
)


class Command(BaseCommand):
    help = 'Populate database with dummy data for testing reports'

    def add_arguments(self, parser):
        parser.add_argument(
            '--patients',
            type=int,
            default=50,
            help='Number of patients to create',
        )
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear existing data before populating',
        )

    def handle(self, *args, **options):
        if options['clear']:
            self.stdout.write('Clearing existing data...')
            self.clear_data()

        num_patients = options['patients']
        self.stdout.write(f'Creating {num_patients} patients with associated data...')

        # Create staff/doctors if they don't exist
        self.create_staff()
        
        # Create medications
        self.create_medications()
        
        # Create patients and all associated data
        self.create_patients_with_data(num_patients)

        self.stdout.write(
            self.style.SUCCESS(f'Successfully populated database with dummy data for {num_patients} patients')
        )

    def clear_data(self):
        """Clear existing test data"""
        GlaucomaAssessment.objects.all().delete()
        VisualAcuityTest.objects.all().delete()
        VisualFieldTest.objects.all().delete()
        OCTScan.objects.all().delete()
        CataractAssessment.objects.all().delete()
        RetinalAssessment.objects.all().delete()
        Prescription.objects.all().delete()
        Consultation.objects.all().delete()
        PatientVisit.objects.all().delete()
        Patient.objects.all().delete()
        Medication.objects.all().delete()

    def create_staff(self):
        """Create staff members if they don't exist"""
        if not CustomUser.objects.filter(is_superuser=True).exists():
            admin = CustomUser.objects.create_superuser(
                username='admin',
                email='admin@preciseOptics.com',
                password='admin123',
                first_name='Admin',
                last_name='User'
            )
            self.stdout.write(f'Created admin user: {admin.username}')

        # Create doctors
        doctors_data = [
            {'username': 'dr_smith', 'first_name': 'John', 'last_name': 'Smith'},
            {'username': 'dr_johnson', 'first_name': 'Sarah', 'last_name': 'Johnson'},
            {'username': 'dr_brown', 'first_name': 'Michael', 'last_name': 'Brown'},
            {'username': 'dr_davis', 'first_name': 'Emily', 'last_name': 'Davis'},
        ]

        for doctor_data in doctors_data:
            if not CustomUser.objects.filter(username=doctor_data['username']).exists():
                doctor = CustomUser.objects.create_user(
                    username=doctor_data['username'],
                    email=f"{doctor_data['username']}@preciseoptics.com",
                    password='password123',
                    first_name=doctor_data['first_name'],
                    last_name=doctor_data['last_name'],
                    user_type='doctor'
                )
                self.stdout.write(f'Created doctor: {doctor.get_full_name()}')

    def create_medications(self):
        """Create common eye medications"""
        medications_data = [
            {
                'name': 'Latanoprost 0.005%',
                'generic_name': 'Latanoprost',
                'brand_names': 'Xalatan, Monoprost',
                'medication_type': 'eye_drop',
                'therapeutic_class': 'antiglaucoma',
                'strength': '0.005%',
                'active_ingredients': 'Latanoprost',
                'description': 'Prostaglandin analog for glaucoma treatment'
            },
            {
                'name': 'Timolol 0.5%',
                'generic_name': 'Timolol',
                'brand_names': 'Timoptic, Betimol',
                'medication_type': 'eye_drop',
                'therapeutic_class': 'antiglaucoma',
                'strength': '0.5%',
                'active_ingredients': 'Timolol maleate',
                'description': 'Beta-blocker for glaucoma treatment'
            },
            {
                'name': 'Brimonidine 0.2%',
                'generic_name': 'Brimonidine',
                'brand_names': 'Alphagan P',
                'medication_type': 'eye_drop',
                'therapeutic_class': 'antiglaucoma',
                'strength': '0.2%',
                'active_ingredients': 'Brimonidine tartrate',
                'description': 'Alpha-2 agonist for glaucoma treatment'
            },
            {
                'name': 'Dorzolamide 2%',
                'generic_name': 'Dorzolamide',
                'brand_names': 'Trusopt',
                'medication_type': 'eye_drop',
                'therapeutic_class': 'antiglaucoma',
                'strength': '2%',
                'active_ingredients': 'Dorzolamide hydrochloride',
                'description': 'Carbonic anhydrase inhibitor'
            },
            {
                'name': 'Prednisolone 1%',
                'generic_name': 'Prednisolone',
                'brand_names': 'Pred Forte',
                'medication_type': 'eye_drop',
                'therapeutic_class': 'steroid',
                'strength': '1%',
                'active_ingredients': 'Prednisolone acetate',
                'description': 'Corticosteroid for inflammation'
            }
        ]

        for med_data in medications_data:
            medication, created = Medication.objects.get_or_create(
                name=med_data['name'],
                defaults=med_data
            )
            if created:
                self.stdout.write(f'Created medication: {medication.name}')

    def create_patients_with_data(self, num_patients):
        """Create patients with comprehensive data"""
        doctors = list(CustomUser.objects.filter(user_type='doctor'))
        medications = list(Medication.objects.all())

        for i in range(num_patients):
            # Create patient
            patient = self.create_patient(i)
            
            # Create visits and consultations
            self.create_visits_and_consultations(patient, doctors)
            
            # Create prescriptions
            self.create_prescriptions(patient, doctors, medications)
            
            # Create eye tests
            self.create_eye_tests(patient, doctors)

            if i % 10 == 0:
                self.stdout.write(f'Created {i + 1} patients...')

    def create_patient(self, index):
        """Create a single patient"""
        first_names = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily', 'James', 'Lisa', 'Robert', 'Maria']
        last_names = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez']
        
        first_name = random.choice(first_names)
        last_name = random.choice(last_names)
        
        # Generate birth date (age 20-80)
        age = random.randint(20, 80)
        birth_date = timezone.now().date() - timedelta(days=age * 365)
        
        patient = Patient.objects.create(
            patient_id=f'PAT{index+1:04d}',
            first_name=first_name,
            last_name=last_name,
            date_of_birth=birth_date,
            gender=random.choice(['M', 'F']),
            phone=f'+44{random.randint(7000000000, 7999999999)}',
            email=f'{first_name.lower()}.{last_name.lower()}{index}@example.com',
            address=f'{random.randint(1, 999)} Example Street',
            postcode=f'SW{random.randint(1, 99)} {random.randint(1, 9)}XX',
            emergency_contact_name=f'{random.choice(first_names)} {random.choice(last_names)}',
            emergency_contact_phone=f'+44{random.randint(7000000000, 7999999999)}',
        )
        return patient

    def create_visits_and_consultations(self, patient, doctors):
        """Create visits and consultations for a patient"""
        num_visits = random.randint(2, 8)
        
        for i in range(num_visits):
            # Create visit (spread over last 12 months)
            visit_date = timezone.now() - timedelta(days=random.randint(1, 365))
            
            visit = PatientVisit.objects.create(
                patient=patient,
                visit_date=visit_date,
                visit_type=random.choice(['initial', 'follow_up', 'emergency']),
                attending_physician=random.choice(doctors),
                chief_complaint=random.choice([
                    'Blurred vision', 'Eye pain', 'Routine check-up', 
                    'Follow-up glaucoma', 'Dry eyes', 'Headaches'
                ]),
                notes='Standard visit notes'
            )

            # Create consultation for this visit
            Consultation.objects.create(
                patient=patient,
                visit=visit,
                consulting_doctor=random.choice(doctors),
                consultation_type=random.choice(['initial', 'follow_up', 'routine_check']),
                status='completed',
                scheduled_time=visit_date,
                actual_start_time=visit_date,
                actual_end_time=visit_date + timedelta(minutes=random.randint(15, 60)),
                chief_complaint=visit.chief_complaint,
                history_of_present_illness='Patient reports gradual onset of symptoms',
                past_ocular_history='No significant history',
                assessment='Comprehensive eye examination completed',
                plan='Continue monitoring, follow-up in 3 months'
            )

    def create_prescriptions(self, patient, doctors, medications):
        """Create prescriptions for a patient"""
        num_prescriptions = random.randint(1, 3)
        
        for i in range(num_prescriptions):
            prescription_date = timezone.now() - timedelta(days=random.randint(30, 300))
            
            Prescription.objects.create(
                patient=patient,
                medication=random.choice(medications),
                prescribed_by=random.choice(doctors),
                prescribed_date=prescription_date,
                dosage=random.choice(['1 drop twice daily', '1 drop daily', '2 drops twice daily']),
                frequency='daily',
                duration_days=random.randint(30, 90),
                start_date=prescription_date,
                end_date=prescription_date + timedelta(days=random.randint(30, 90)),
                instructions='Apply to affected eye(s) as directed',
                indication=random.choice(['Glaucoma', 'Ocular hypertension', 'Post-operative inflammation'])
            )

    def create_eye_tests(self, patient, doctors):
        """Create various eye tests for a patient"""
        num_test_sessions = random.randint(3, 10)
        
        for i in range(num_test_sessions):
            test_date = timezone.now() - timedelta(days=random.randint(1, 365))
            doctor = random.choice(doctors)
            
            # Create Glaucoma Assessment (IOP test)
            self.create_glaucoma_assessment(patient, doctor, test_date)
            
            # Sometimes create other tests
            if random.random() > 0.5:
                self.create_visual_acuity_test(patient, doctor, test_date)
            
            if random.random() > 0.7:
                self.create_visual_field_test(patient, doctor, test_date)
                
            if random.random() > 0.8:
                self.create_oct_scan(patient, doctor, test_date)

    def create_glaucoma_assessment(self, patient, doctor, test_date):
        """Create glaucoma assessment with IOP data"""
        # Generate realistic IOP values (normal: 10-21 mmHg, high: 22+ mmHg)
        baseline_iop = random.uniform(15, 30)
        right_eye_iop = baseline_iop + random.uniform(-3, 3)
        left_eye_iop = baseline_iop + random.uniform(-3, 3)
        
        GlaucomaAssessment.objects.create(
            patient=patient,
            performed_by=doctor,
            test_date=test_date,
            eye_side='both',
            status='completed',
            right_eye_iop=Decimal(str(round(right_eye_iop, 1))),
            left_eye_iop=Decimal(str(round(left_eye_iop, 1))),
            iop_method='goldmann',
            right_disc_cup_ratio=Decimal(str(round(random.uniform(0.2, 0.8), 2))),
            left_disc_cup_ratio=Decimal(str(round(random.uniform(0.2, 0.8), 2))),
            right_disc_hemorrhage=random.choice([True, False]),
            left_disc_hemorrhage=random.choice([True, False]),
            visual_field_defects=random.choice([True, False]),
            family_history_glaucoma=random.choice([True, False]),
            diabetes=random.choice([True, False]),
            notes='Comprehensive glaucoma assessment completed'
        )

    def create_visual_acuity_test(self, patient, doctor, test_date):
        """Create visual acuity test"""
        VisualAcuityTest.objects.create(
            patient=patient,
            performed_by=doctor,
            test_date=test_date,
            eye_side='both',
            status='completed',
            right_eye_acuity=Decimal(str(round(random.uniform(0.3, 1.0), 1))),
            left_eye_acuity=Decimal(str(round(random.uniform(0.3, 1.0), 1))),
            test_distance=6,  # 6 meters
            chart_type='snellen',
            notes='Visual acuity assessment completed'
        )

    def create_visual_field_test(self, patient, doctor, test_date):
        """Create visual field test"""
        VisualFieldTest.objects.create(
            patient=patient,
            performed_by=doctor,
            test_date=test_date,
            eye_side='both',
            status='completed',
            test_strategy='sita_standard',
            right_eye_md=Decimal(str(round(random.uniform(-15, 2), 2))),
            left_eye_md=Decimal(str(round(random.uniform(-15, 2), 2))),
            right_eye_psd=Decimal(str(round(random.uniform(1, 10), 2))),
            left_eye_psd=Decimal(str(round(random.uniform(1, 10), 2))),
            defects_detected=random.choice([True, False]),
            notes='Visual field test completed'
        )

    def create_oct_scan(self, patient, doctor, test_date):
        """Create OCT scan"""
        OCTScan.objects.create(
            patient=patient,
            performed_by=doctor,
            test_date=test_date,
            eye_side='both',
            status='completed',
            scan_type='rnfl',
            right_rnfl_average=random.randint(70, 120),
            left_rnfl_average=random.randint(70, 120),
            right_rnfl_superior=random.randint(80, 140),
            left_rnfl_superior=random.randint(80, 140),
            right_rnfl_inferior=random.randint(80, 140),
            left_rnfl_inferior=random.randint(80, 140),
            notes='OCT scan completed successfully'
        )