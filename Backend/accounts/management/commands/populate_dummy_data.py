"""
Management command to populate the database with dummy data
"""
import random
from datetime import datetime, timedelta, date
from decimal import Decimal
from django.core.management.base import BaseCommand
from django.utils import timezone
from django.contrib.auth import get_user_model
from patients.models import Patient, PatientVisit
from medications.models import Medication, Prescription, PrescriptionItem, DrugAllergy
from consultations.models import Consultation
from eye_tests.models import (
    VisualAcuityTest, GlaucomaAssessment, VisualFieldTest, 
    CataractAssessment, OCTScan, RetinalAssessment
)
from accounts.models import StaffProfile

User = get_user_model()

class Command(BaseCommand):
    help = 'Populate database with dummy data for testing and reports'

    def handle(self, *args, **options):
        self.stdout.write('Creating dummy data...')
        
        # Create superuser if doesn't exist
        if not User.objects.filter(is_superuser=True).exists():
            admin_user = User.objects.create_user(
                username='admin',
                email='admin@precisionoptics.com',
                password='admin123',
                first_name='Admin',
                last_name='User',
                is_superuser=True,
                is_staff=True
            )
            self.stdout.write(f'Created admin user: {admin_user.username}')

        # Create doctors and nurses
        doctors = []
        nurses = []
        
        # Create 5 doctors
        doctor_names = [
            ('Dr. Sarah', 'Johnson', 'sjohnson@precisionoptics.com'),
            ('Dr. Michael', 'Chen', 'mchen@precisionoptics.com'),
            ('Dr. Emma', 'Williams', 'ewilliams@precisionoptics.com'),
            ('Dr. James', 'Brown', 'jbrown@precisionoptics.com'),
            ('Dr. Lisa', 'Davis', 'ldavis@precisionoptics.com'),
        ]
        
        for first_name, last_name, email in doctor_names:
            if not User.objects.filter(email=email).exists():
                doctor = User.objects.create_user(
                    username=email.split('@')[0],
                    email=email,
                    password='doctor123',
                    first_name=first_name,
                    last_name=last_name,
                    user_type='doctor'
                )
                
                # Create staff profile
                StaffProfile.objects.get_or_create(
                    user=doctor,
                    defaults={
                        'department': 'ophthalmology',
                        'specialization': random.choice([
                            'cataract', 'glaucoma', 'retina', 'diabetic_retinopathy',
                            'vitreoretinal', 'strabismus', 'general'
                        ]),
                        'license_number': f'DOC{len(doctors)+1:03d}',
                        'qualification': 'MD, FRCS(Ophth)',
                        'years_of_experience': random.randint(5, 25),
                        'consultation_fee': Decimal(str(random.randint(80, 250))),
                        'emergency_contact': f'+44 79 {random.randint(1000, 9999)} {random.randint(1000, 9999)}',
                        'address': f'{random.randint(1, 999)} Medical Centre, London',
                        'hire_date': date.today() - timedelta(days=random.randint(30, 3650)),
                        'is_consultant': True,
                        'can_prescribe': True,
                        'can_perform_surgery': random.choice([True, False]),
                    }
                )
                doctors.append(doctor)
                self.stdout.write(f'Created doctor: {doctor.get_full_name()}')

        # Create 3 nurses
        nurse_names = [
            ('Nurse Mary', 'Smith', 'msmith@precisionoptics.com'),
            ('Nurse John', 'Wilson', 'jwilson@precisionoptics.com'),
            ('Nurse Anna', 'Taylor', 'ataylor@precisionoptics.com'),
        ]
        
        for first_name, last_name, email in nurse_names:
            if not User.objects.filter(email=email).exists():
                nurse = User.objects.create_user(
                    username=email.split('@')[0],
                    email=email,
                    password='nurse123',
                    first_name=first_name,
                    last_name=last_name,
                    user_type='nurse'
                )
                
                StaffProfile.objects.get_or_create(
                    user=nurse,
                    defaults={
                        'department': 'nursing',
                        'license_number': f'NUR{len(nurses)+1:03d}',
                        'qualification': 'RN, BSc Nursing',
                        'years_of_experience': random.randint(2, 15),
                        'emergency_contact': f'+44 79 {random.randint(1000, 9999)} {random.randint(1000, 9999)}',
                        'address': f'{random.randint(1, 999)} Medical Centre, London',
                        'hire_date': date.today() - timedelta(days=random.randint(30, 2000)),
                        'is_consultant': False,
                        'can_prescribe': False,
                        'can_perform_surgery': False,
                    }
                )
                nurses.append(nurse)
                self.stdout.write(f'Created nurse: {nurse.get_full_name()}')

        # Get all staff for random assignment
        all_staff = doctors + nurses
        if not all_staff:
            all_staff = list(User.objects.filter(user_type__in=['doctor', 'nurse']))

        # Create medications
        medications_data = [
            ('Latanoprost', 'Latanoprost', 'Xalatan, Monopost', 'eye_drop', 'antiglaucoma', '0.005%', 'Prostaglandin analog'),
            ('Timolol', 'Timolol maleate', 'Timoptol, Betim', 'eye_drop', 'antiglaucoma', '0.5%', 'Beta-blocker'),
            ('Brimonidine', 'Brimonidine tartrate', 'Alphagan, Brimac', 'eye_drop', 'antiglaucoma', '0.2%', 'Alpha-2 agonist'),
            ('Dorzolamide', 'Dorzolamide HCl', 'Trusopt', 'eye_drop', 'antiglaucoma', '2%', 'Carbonic anhydrase inhibitor'),
            ('Pilocarpine', 'Pilocarpine HCl', 'Pilogel', 'eye_drop', 'antiglaucoma', '2%', 'Cholinergic agonist'),
            ('Prednisolone', 'Prednisolone acetate', 'Pred Forte', 'eye_drop', 'steroid', '1%', 'Corticosteroid'),
            ('Chloramphenicol', 'Chloramphenicol', 'Chloromycetin', 'eye_drop', 'antibiotic', '0.5%', 'Antibiotic'),
            ('Cyclopentolate', 'Cyclopentolate HCl', 'Cyclogyl', 'eye_drop', 'mydriatic', '1%', 'Mydriatic cycloplegic'),
        ]
        
        medications = []
        for name, generic, brands, med_type, class_type, strength, active in medications_data:
            medication, created = Medication.objects.get_or_create(
                name=name,
                defaults={
                    'generic_name': generic,
                    'brand_names': brands,
                    'medication_type': med_type,
                    'therapeutic_class': class_type,
                    'strength': strength,
                    'active_ingredients': active,
                    'description': f'{name} - {active}',
                    'contraindications': 'Standard contraindications apply',
                    'side_effects': 'May cause mild irritation',
                    'standard_dosage': 'As directed by physician',
                    'indications': 'Various eye conditions',
                    'maximum_daily_dose': '4 times daily',
                    'storage_temperature': 'Room temperature',
                    'shelf_life_months': 24,
                    'manufacturer': 'Generic Pharmaceuticals',
                    'unit_price': Decimal(str(random.randint(5, 50))),
                    'current_stock': random.randint(50, 500)
                }
            )
            if created:
                self.stdout.write(f'Created medication: {medication.name}')
            medications.append(medication)

        # Create patients
        patient_names = [
            ('John', 'Smith', '1975-03-15', 'john.smith@email.com', '+44 20 1234 5678'),
            ('Mary', 'Johnson', '1960-07-22', 'mary.johnson@email.com', '+44 20 2345 6789'),
            ('Robert', 'Williams', '1982-11-08', 'robert.williams@email.com', '+44 20 3456 7890'),
            ('Patricia', 'Brown', '1955-05-30', 'patricia.brown@email.com', '+44 20 4567 8901'),
            ('Michael', 'Davis', '1978-09-14', 'michael.davis@email.com', '+44 20 5678 9012'),
            ('Linda', 'Miller', '1970-12-03', 'linda.miller@email.com', '+44 20 6789 0123'),
            ('William', 'Wilson', '1985-04-18', 'william.wilson@email.com', '+44 20 7890 1234'),
            ('Elizabeth', 'Moore', '1963-08-25', 'elizabeth.moore@email.com', '+44 20 8901 2345'),
            ('David', 'Taylor', '1972-01-12', 'david.taylor@email.com', '+44 20 9012 3456'),
            ('Barbara', 'Anderson', '1968-06-07', 'barbara.anderson@email.com', '+44 20 0123 4567'),
        ]
        
        patients = []
        for first_name, last_name, dob, email, phone in patient_names:
            if not Patient.objects.filter(email=email).exists():
                patient = Patient.objects.create(
                    patient_id=f'PAT{len(patients)+1:06d}',
                    first_name=first_name,
                    last_name=last_name,
                    date_of_birth=dob,
                    gender=random.choice(['M', 'F']),
                    email=email,
                    phone_number=phone,
                    address_line_1=f'{random.randint(1, 999)} High Street',
                    city='London',
                    state='England',
                    postal_code=f'SW{random.randint(1, 20)} {random.randint(1, 9)}{random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ")}{random.choice("ABCDEFGHIJKLMNOPQRSTUVWXYZ")}',
                    country='United Kingdom',
                    emergency_contact_relationship='Next of Kin',
                    emergency_contact_name=f'{first_name} Contact',
                    emergency_contact_phone=f'+44 79 {random.randint(1000, 9999)} {random.randint(1000, 9999)}',
                    medical_history=f'Patient has history of {random.choice(["hypertension", "diabetes", "myopia", "no significant issues"])}',
                    allergies=random.choice(['None known', 'Penicillin', 'Sulphur drugs', 'None']),
                )
                patients.append(patient)
                self.stdout.write(f'Created patient: {patient.get_full_name()}')

        # Create patient visits for the last 6 months
        start_date = timezone.now() - timedelta(days=180)
        for patient in patients:
            # Create 3-8 visits per patient
            num_visits = random.randint(3, 8)
            for i in range(num_visits):
                visit_date = start_date + timedelta(
                    days=random.randint(0, 180),
                    hours=random.randint(8, 17),
                    minutes=random.choice([0, 15, 30, 45])
                )
                
                visit = PatientVisit.objects.create(
                    patient=patient,
                    scheduled_date=visit_date,
                    visit_type=random.choice(['consultation', 'follow_up', 'emergency', 'routine_check']),
                    primary_doctor=random.choice(all_staff) if all_staff else None,
                    chief_complaint=random.choice([
                        'Blurred vision', 'Eye pain', 'Routine check-up', 
                        'Follow-up appointment', 'Dry eyes', 'Headaches'
                    ]),
                    status=random.choice(['scheduled', 'completed', 'in_progress']),
                    notes=f'Patient presented with {random.choice(["no", "mild", "moderate"])} symptoms. Diagnosis: {random.choice([
                        "Primary Open Angle Glaucoma", "Cataract", "Dry Eye Syndrome",
                        "Diabetic Retinopathy", "Age-related Macular Degeneration", "Normal exam"
                    ])}. Treatment plan: Continue current treatment and follow-up in 3 months.'
                )
                
                # Create consultations for each visit
                consultation = Consultation.objects.create(
                    patient=patient,
                    visit=visit,
                    consulting_doctor=random.choice(all_staff) if all_staff else visit.attending_physician,
                    consultation_type=random.choice(['initial', 'follow_up', 'routine_check', 'emergency']),
                    scheduled_time=visit_date,
                    actual_start_time=visit_date,
                    actual_end_time=visit_date + timedelta(minutes=random.randint(15, 45)),
                    status='completed',
                    chief_complaint=visit.chief_complaint,
                    history_of_present_illness=f'Patient reports symptoms starting {random.randint(1, 30)} days ago',
                    assessment_and_plan=visit.treatment_plan,
                    follow_up_instructions='Return in 3 months or if symptoms worsen'
                )

        # Create eye test data
        self.stdout.write('Creating eye test data...')
        
        # Create visual acuity tests
        for patient in patients:
            num_tests = random.randint(2, 6)
            for i in range(num_tests):
                test_date = start_date + timedelta(days=random.randint(0, 180))
                
                VisualAcuityTest.objects.create(
                    patient=patient,
                    test_date=test_date,
                    performed_by=random.choice(all_staff) if all_staff else None,
                    status='completed',
                    right_eye_acuity=Decimal(str(round(random.uniform(0.3, 1.0), 2))),
                    left_eye_acuity=Decimal(str(round(random.uniform(0.3, 1.0), 2))),
                    right_eye_sphere=Decimal(str(round(random.uniform(-8.0, 2.0), 2))),
                    left_eye_sphere=Decimal(str(round(random.uniform(-8.0, 2.0), 2))),
                    right_eye_cylinder=Decimal(str(round(random.uniform(-3.0, 0.0), 2))),
                    left_eye_cylinder=Decimal(str(round(random.uniform(-3.0, 0.0), 2))),
                    right_eye_axis=random.randint(1, 180),
                    left_eye_axis=random.randint(1, 180),
                    distance_correction_needed=random.choice([True, False]),
                    reading_correction_needed=random.choice([True, False]),
                    notes=f'Visual acuity test - {random.choice(["improved", "stable", "slight decline"])} from previous'
                )

        # Create glaucoma assessments (with IOP data)
        for patient in patients:
            num_tests = random.randint(3, 8)
            base_iop_right = random.uniform(12, 28)  # Starting IOP
            base_iop_left = random.uniform(12, 28)
            
            for i in range(num_tests):
                test_date = start_date + timedelta(days=random.randint(0, 180))
                
                # Simulate IOP improvement over time with medication
                improvement_factor = i * 0.1  # Gradual improvement
                current_iop_right = max(10, base_iop_right - improvement_factor - random.uniform(0, 2))
                current_iop_left = max(10, base_iop_left - improvement_factor - random.uniform(0, 2))
                
                GlaucomaAssessment.objects.create(
                    patient=patient,
                    test_date=test_date,
                    performed_by=random.choice(all_staff) if all_staff else None,
                    status='completed',
                    right_eye_iop=Decimal(str(round(current_iop_right, 1))),
                    left_eye_iop=Decimal(str(round(current_iop_left, 1))),
                    iop_method='goldmann',
                    right_disc_cup_ratio=Decimal(str(round(random.uniform(0.2, 0.8), 2))),
                    left_disc_cup_ratio=Decimal(str(round(random.uniform(0.2, 0.8), 2))),
                    right_disc_hemorrhage=random.choice([True, False]),
                    left_disc_hemorrhage=random.choice([True, False]),
                    visual_field_defects=random.choice([True, False]),
                    family_history_glaucoma=random.choice([True, False]),
                    diabetes=random.choice([True, False]),
                    myopia=random.choice([True, False]),
                    notes=f'IOP: {current_iop_right:.1f}/{current_iop_left:.1f} mmHg. {random.choice(["Stable", "Improved", "Requires monitoring"])}'
                )

        # Create prescriptions
        self.stdout.write('Creating prescription data...')
        
        for patient in patients:
            # Create 1-3 prescriptions per patient
            num_prescriptions = random.randint(1, 3)
            for i in range(num_prescriptions):
                prescription_date = start_date + timedelta(days=random.randint(0, 150))
                
                prescription = Prescription.objects.create(
                    patient=patient,
                    prescribed_by=random.choice(all_staff) if all_staff else None,
                    prescribed_date=prescription_date,
                    start_date=prescription_date,
                    end_date=prescription_date + timedelta(days=random.randint(30, 180)),
                    diagnosis=random.choice([
                        'Primary Open Angle Glaucoma', 'Ocular Hypertension', 
                        'Secondary Glaucoma', 'Normal Tension Glaucoma'
                    ]),
                    instructions='Apply one drop to affected eye(s) as directed',
                    notes=f'Prescribed for IOP control. Patient tolerating well.',
                    status='active' if i == num_prescriptions - 1 else random.choice(['active', 'completed'])
                )
                
                # Add prescription items
                num_medications = random.randint(1, 2)
                selected_medications = random.sample(medications, num_medications)
                
                for medication in selected_medications:
                    PrescriptionItem.objects.create(
                        prescription=prescription,
                        medication=medication,
                        dosage='1 drop',
                        frequency='Once daily',
                        duration_days=random.randint(30, 90),
                        quantity=1,
                        instructions='Apply to affected eye(s) at bedtime'
                    )

        # Create some drug allergies
        for i in range(5):
            patient = random.choice(patients)
            medication = random.choice(medications)
            
            if not DrugAllergy.objects.filter(patient=patient, medication=medication).exists():
                DrugAllergy.objects.create(
                    patient=patient,
                    medication=medication,
                    allergy_type=random.choice(['mild', 'moderate', 'severe']),
                    symptoms=random.choice(['rash', 'itching', 'swelling', 'redness']),
                    severity=random.choice(['mild', 'moderate', 'severe']),
                    reported_by=random.choice(all_staff) if all_staff else None,
                    reported_date=timezone.now() - timedelta(days=random.randint(1, 365))
                )

        # Create additional eye tests
        for patient in patients[:5]:  # Just for first 5 patients to avoid too much data
            
            # Visual Field Tests
            VisualFieldTest.objects.create(
                patient=patient,
                test_date=timezone.now() - timedelta(days=random.randint(1, 90)),
                performed_by=random.choice(all_staff) if all_staff else None,
                status='completed',
                test_strategy='24-2',
                fixation_losses_right=random.randint(0, 5),
                fixation_losses_left=random.randint(0, 5),
                false_positives_right=random.randint(0, 10),
                false_positives_left=random.randint(0, 10),
                false_negatives_right=random.randint(0, 10),
                false_negatives_left=random.randint(0, 10),
                mean_deviation_right=Decimal(str(round(random.uniform(-15, 2), 2))),
                mean_deviation_left=Decimal(str(round(random.uniform(-15, 2), 2))),
                notes='Visual field test completed successfully'
            )
            
            # OCT Scans
            OCTScan.objects.create(
                patient=patient,
                test_date=timezone.now() - timedelta(days=random.randint(1, 60)),
                performed_by=random.choice(all_staff) if all_staff else None,
                status='completed',
                scan_type='rnfl',
                right_eye_rnfl_average=random.randint(70, 120),
                left_eye_rnfl_average=random.randint(70, 120),
                right_eye_rnfl_superior=random.randint(80, 140),
                left_eye_rnfl_superior=random.randint(80, 140),
                right_eye_rnfl_inferior=random.randint(80, 140),
                left_eye_rnfl_inferior=random.randint(80, 140),
                image_quality_right=random.randint(7, 10),
                image_quality_left=random.randint(7, 10),
                notes='OCT scan shows normal retinal nerve fiber layer thickness'
            )

        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created dummy data:\n'
                f'- {len(all_staff)} staff members\n'
                f'- {len(patients)} patients\n'
                f'- {len(medications)} medications\n'
                f'- {PatientVisit.objects.count()} patient visits\n'
                f'- {Consultation.objects.count()} consultations\n'
                f'- {VisualAcuityTest.objects.count()} visual acuity tests\n'
                f'- {GlaucomaAssessment.objects.count()} glaucoma assessments\n'
                f'- {Prescription.objects.count()} prescriptions\n'
                f'- {PrescriptionItem.objects.count()} prescription items\n'
                f'- {DrugAllergy.objects.count()} drug allergies\n'
                f'- {VisualFieldTest.objects.count()} visual field tests\n'
                f'- {OCTScan.objects.count()} OCT scans'
            )
        )