"""
Django management command to populate eye test data linked to existing patients and consultations
"""
import random
from decimal import Decimal
from datetime import datetime, timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.db import transaction
from patients.models import Patient
from consultations.models import Consultation
from accounts.models import CustomUser
from eye_tests.models import (
    VisualAcuityTest, RefractionTest, CataractAssessment, 
    GlaucomaAssessment, VisualFieldTest, RetinalAssessment,
    DiabeticRetinopathyScreening, OCTScan
)


class Command(BaseCommand):
    help = 'Populate eye test data linked to existing patients and consultations'
    
    def add_arguments(self, parser):
        parser.add_argument(
            '--num-tests',
            type=int,
            default=100,
            help='Number of eye tests to create per type (default: 100)'
        )
        
    def handle(self, *args, **options):
        num_tests = options['num_tests']
        
        # Get existing data
        patients = list(Patient.objects.all())
        consultations = list(Consultation.objects.all())
        doctors = list(CustomUser.objects.filter(user_type='doctor'))
        
        if not patients:
            self.stdout.write(self.style.ERROR('No patients found. Please create patients first.'))
            return
            
        if not consultations:
            self.stdout.write(self.style.ERROR('No consultations found. Please create consultations first.'))
            return
            
        if not doctors:
            self.stdout.write(self.style.ERROR('No doctors found. Please create doctors first.'))
            return
            
        self.stdout.write(f'Found {len(patients)} patients, {len(consultations)} consultations, {len(doctors)} doctors')
        
        with transaction.atomic():
            self.create_visual_acuity_tests(patients, consultations, doctors, num_tests)
            self.create_refraction_tests(patients, consultations, doctors, num_tests)
            self.create_cataract_assessments(patients, consultations, doctors, num_tests)
            self.create_glaucoma_assessments(patients, consultations, doctors, num_tests)
            self.create_visual_field_tests(patients, consultations, doctors, num_tests)
            self.create_retinal_assessments(patients, consultations, doctors, num_tests)
            self.create_diabetic_retinopathy_screenings(patients, consultations, doctors, num_tests)
            self.create_oct_scans(patients, consultations, doctors, num_tests)
            
        self.stdout.write(self.style.SUCCESS(f'Successfully created {num_tests * 8} eye test records'))

    def get_random_date(self):
        """Generate a random date within the last 2 years"""
        start_date = timezone.now() - timedelta(days=730)
        end_date = timezone.now()
        
        time_between = end_date - start_date
        days_between = time_between.days
        random_days = random.randrange(days_between)
        
        return start_date + timedelta(days=random_days)

    def create_visual_acuity_tests(self, patients, consultations, doctors, num_tests):
        """Create Visual Acuity Test data"""
        self.stdout.write('Creating Visual Acuity Tests...')
        
        tests = []
        for i in range(num_tests):
            patient = random.choice(patients)
            consultation = random.choice(consultations)
            doctor = random.choice(doctors)
            
            # Realistic visual acuity values
            acuity_values = ['6/6', '6/9', '6/12', '6/18', '6/24', '6/36', '6/60', 'CF', 'HM']
            
            test = VisualAcuityTest(
                patient=patient,
                consultation=consultation,
                test_date=self.get_random_date(),
                performed_by=doctor,
                test_method=random.choice(['snellen_chart', 'logmar_chart', 'etdrs_chart']),
                
                # Right eye
                right_eye_unaided=random.choice(acuity_values),
                right_eye_aided=random.choice(['6/6', '6/9', '6/12']),  # Usually better with correction
                right_eye_pinhole=random.choice(['6/6', '6/9', '6/12', '6/18']),
                
                # Left eye
                left_eye_unaided=random.choice(acuity_values),
                left_eye_aided=random.choice(['6/6', '6/9', '6/12']),
                left_eye_pinhole=random.choice(['6/6', '6/9', '6/12', '6/18']),
                
                # Both eyes
                binocular_vision=random.choice(['6/6', '6/9', '6/12']),
                
                findings=f"Visual acuity test #{i+1}. Patient showed {'normal' if random.random() > 0.3 else 'reduced'} visual performance.",
                notes=f"Test completed successfully. {'Glasses recommended' if random.random() > 0.6 else 'No correction needed'}."
            )
            tests.append(test)
            
        VisualAcuityTest.objects.bulk_create(tests)
        self.stdout.write(f'  Created {len(tests)} Visual Acuity Tests')

    def create_refraction_tests(self, patients, consultations, doctors, num_tests):
        """Create Refraction Test data"""
        self.stdout.write('Creating Refraction Tests...')
        
        tests = []
        for i in range(num_tests):
            patient = random.choice(patients)
            consultation = random.choice(consultations)
            doctor = random.choice(doctors)
            
            # Realistic refraction values
            sphere_range = [-8.0, 6.0]  # Diopters
            cylinder_range = [-4.0, 0.0]  # Cylinder is usually negative
            axis_range = [1, 180]  # Degrees
            
            test = RefractionTest(
                patient=patient,
                consultation=consultation,
                test_date=self.get_random_date(),
                performed_by=doctor,
                method=random.choice(['subjective', 'objective', 'retinoscopy', 'cycloplegic']),
                
                # Right eye
                right_sphere=Decimal(str(round(random.uniform(*sphere_range), 2))),
                right_cylinder=Decimal(str(round(random.uniform(*cylinder_range), 2))),
                right_axis=random.randint(*axis_range),
                right_add=Decimal(str(round(random.uniform(0, 3.0), 2))) if random.random() > 0.5 else None,
                
                # Left eye
                left_sphere=Decimal(str(round(random.uniform(*sphere_range), 2))),
                left_cylinder=Decimal(str(round(random.uniform(*cylinder_range), 2))),
                left_axis=random.randint(*axis_range),
                left_add=Decimal(str(round(random.uniform(0, 3.0), 2))) if random.random() > 0.5 else None,
                
                # Pupillary distance
                pupillary_distance=Decimal(str(round(random.uniform(58.0, 72.0), 1))),
                
                findings=f"Refraction test #{i+1}. {'Myopia' if random.random() > 0.6 else 'Hyperopia' if random.random() > 0.3 else 'Astigmatism'} detected.",
                notes=f"Prescription: {'Glasses' if random.random() > 0.4 else 'Contact lenses'} recommended."
            )
            tests.append(test)
            
        RefractionTest.objects.bulk_create(tests)
        self.stdout.write(f'  Created {len(tests)} Refraction Tests')

    def create_cataract_assessments(self, patients, consultations, doctors, num_tests):
        """Create Cataract Assessment data"""
        self.stdout.write('Creating Cataract Assessments...')
        
        tests = []
        for i in range(num_tests):
            patient = random.choice(patients)
            consultation = random.choice(consultations)
            doctor = random.choice(doctors)
            
            test = CataractAssessment(
                patient=patient,
                consultation=consultation,
                test_date=self.get_random_date(),
                performed_by=doctor,
                
                # Right eye assessment
                right_eye_cataract_type=random.choice(['nuclear', 'cortical', 'psc', 'mixed']) if random.random() > 0.3 else '',
                right_eye_severity=random.choice(['trace', 'mild', 'moderate', 'severe']) if random.random() > 0.3 else '',
                right_eye_lens_clarity='Clear lens' if random.random() > 0.4 else f"Grade {random.randint(1, 4)} cataract changes",
                
                # Left eye assessment
                left_eye_cataract_type=random.choice(['nuclear', 'cortical', 'psc', 'mixed']) if random.random() > 0.3 else '',
                left_eye_severity=random.choice(['trace', 'mild', 'moderate', 'severe']) if random.random() > 0.3 else '',
                left_eye_lens_clarity='Clear lens' if random.random() > 0.4 else f"Grade {random.randint(1, 4)} cataract changes",
                
                # Functional assessment
                glare_disability=random.choice([True, False]),
                contrast_sensitivity_reduced=random.choice([True, False]),
                visual_function_impact=f"Patient reports {'minimal' if random.random() > 0.5 else 'significant'} visual symptoms",
                
                # Surgery recommendation
                surgery_recommended=random.choice([True, False]),
                urgency_level=random.choice(['routine', 'soon', 'urgent']) if random.random() > 0.7 else '',
                
                findings=f"Cataract assessment #{i+1}. {'Surgery recommended' if random.random() > 0.8 else 'Conservative management'} based on findings.",
                notes=f"{'Bilateral' if random.random() > 0.6 else 'Unilateral'} cataract changes noted."
            )
            tests.append(test)
            
        CataractAssessment.objects.bulk_create(tests)
        self.stdout.write(f'  Created {len(tests)} Cataract Assessments')

    def create_glaucoma_assessments(self, patients, consultations, doctors, num_tests):
        """Create Glaucoma Assessment data"""
        self.stdout.write('Creating Glaucoma Assessments...')
        
        tests = []
        for i in range(num_tests):
            patient = random.choice(patients)
            consultation = random.choice(consultations)
            doctor = random.choice(doctors)
            
            test = GlaucomaAssessment(
                patient=patient,
                consultation=consultation,
                test_date=self.get_random_date(),
                performed_by=doctor,
                
                # Intraocular pressure (normal range: 10-21 mmHg)
                right_eye_iop=Decimal(str(round(random.uniform(8.0, 35.0), 1))),
                left_eye_iop=Decimal(str(round(random.uniform(8.0, 35.0), 1))),
                iop_method=random.choice(['goldmann', 'tonopen', 'pneumatic', 'rebound']),
                
                # Cup-to-disc ratio (normal: 0.1-0.4)
                right_disc_cup_ratio=Decimal(str(round(random.uniform(0.1, 0.9), 2))),
                left_disc_cup_ratio=Decimal(str(round(random.uniform(0.1, 0.9), 2))),
                
                # Optic nerve assessment
                right_disc_hemorrhage=random.choice([True, False]),
                left_disc_hemorrhage=random.choice([True, False]),
                right_disc_notching=random.choice([True, False]),
                left_disc_notching=random.choice([True, False]),
                
                # Visual field defects
                visual_field_defects=random.choice([True, False]),
                
                glaucoma_type=random.choice(['poag', 'pacg', 'nsg', 'suspect', 'normal']),
                treatment_required=random.choice([True, False]),
                target_iop=Decimal(str(round(random.uniform(12.0, 18.0), 1))) if random.random() > 0.5 else None,
                
                findings=f"Glaucoma assessment #{i+1}. IOP: {random.randint(10, 25)}mmHg both eyes.",
                notes=f"{'Treatment required' if random.random() > 0.7 else 'Continue monitoring'}."
            )
            tests.append(test)
            
        GlaucomaAssessment.objects.bulk_create(tests)
        self.stdout.write(f'  Created {len(tests)} Glaucoma Assessments')

    def create_visual_field_tests(self, patients, consultations, doctors, num_tests):
        """Create Visual Field Test data"""
        self.stdout.write('Creating Visual Field Tests...')
        
        tests = []
        for i in range(num_tests):
            patient = random.choice(patients)
            consultation = random.choice(consultations)
            doctor = random.choice(doctors)
            
            test = VisualFieldTest(
                patient=patient,
                consultation=consultation,
                test_date=self.get_random_date(),
                performed_by=doctor,
                
                test_type=random.choice(['humphrey_24_2', 'humphrey_30_2', 'octopus_g1', 'goldmann']),
                strategy=random.choice(['sita_standard', 'sita_fast', 'full_threshold']),
                
                findings=f"Visual field test #{i+1}. {'Normal visual field' if random.random() > 0.4 else 'Visual field defects detected'}.",
                notes=f"Test completed with {'good' if random.random() > 0.3 else 'fair'} patient cooperation."
            )
            tests.append(test)
            
        VisualFieldTest.objects.bulk_create(tests)
        self.stdout.write(f'  Created {len(tests)} Visual Field Tests')

    def create_retinal_assessments(self, patients, consultations, doctors, num_tests):
        """Create Retinal Assessment data"""
        self.stdout.write('Creating Retinal Assessments...')
        
        tests = []
        for i in range(num_tests):
            patient = random.choice(patients)
            consultation = random.choice(consultations)
            doctor = random.choice(doctors)
            
            test = RetinalAssessment(
                patient=patient,
                consultation=consultation,
                test_date=self.get_random_date(),
                performed_by=doctor,
                
                findings=f"Retinal assessment #{i+1}. {'Normal retinal examination' if random.random() > 0.4 else 'Retinal pathology detected'}.",
                recommendations=random.choice(['Routine follow-up', 'Repeat in 6 months', 'Urgent referral']),
                notes=f"Fundoscopy shows {'normal' if random.random() > 0.4 else 'pathological'} findings."
            )
            tests.append(test)
            
        RetinalAssessment.objects.bulk_create(tests)
        self.stdout.write(f'  Created {len(tests)} Retinal Assessments')

    def create_diabetic_retinopathy_screenings(self, patients, consultations, doctors, num_tests):
        """Create Diabetic Retinopathy Screening data"""
        self.stdout.write('Creating Diabetic Retinopathy Screenings...')
        
        tests = []
        for i in range(num_tests):
            patient = random.choice(patients)
            consultation = random.choice(consultations)
            doctor = random.choice(doctors)
            
            test = DiabeticRetinopathyScreening(
                patient=patient,
                consultation=consultation,
                test_date=self.get_random_date(),
                performed_by=doctor,
                
                findings=f"Diabetic retinopathy screening #{i+1}. Grade {random.randint(0, 3)} DR changes.",
                recommendations=random.choice(['Annual screening', '6 monthly review', 'Urgent referral']),
                notes=f"Patient with diabetes - {'no' if random.random() > 0.4 else 'mild'} retinopathy changes."
            )
            tests.append(test)
            
        DiabeticRetinopathyScreening.objects.bulk_create(tests)
        self.stdout.write(f'  Created {len(tests)} Diabetic Retinopathy Screenings')

    def create_oct_scans(self, patients, consultations, doctors, num_tests):
        """Create OCT Scan data"""
        self.stdout.write('Creating OCT Scans...')
        
        tests = []
        for i in range(num_tests):
            patient = random.choice(patients)
            consultation = random.choice(consultations)
            doctor = random.choice(doctors)
            
            test = OCTScan(
                patient=patient,
                consultation=consultation,
                test_date=self.get_random_date(),
                performed_by=doctor,
                
                findings=f"OCT scan #{i+1}. {'Normal macular architecture' if random.random() > 0.3 else 'Macular pathology identified'}.",
                recommendations=random.choice(['Routine follow-up', 'Repeat in 6 months', 'Treatment indicated']),
                notes=f"High resolution OCT imaging - {'normal' if random.random() > 0.4 else 'abnormal'} retinal layers."
            )
            tests.append(test)
            
        OCTScan.objects.bulk_create(tests)
        self.stdout.write(f'  Created {len(tests)} OCT Scans')