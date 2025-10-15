"""
Simplified management command to populate essential data
"""
from django.core.management.base import BaseCommand
from django.utils import timezone
from datetime import timedelta
from patients.models import Patient, PatientVisit
from accounts.models import CustomUser
from medications.models import Prescription, PrescriptionItem, Medication
from consultations.models import Consultation
import random

class Command(BaseCommand):
    help = 'Populate database with essential dummy data'

    def handle(self, *args, **options):
        self.stdout.write('Creating essential data...')
        
        # Get existing data
        patients = list(Patient.objects.all())
        doctors = list(CustomUser.objects.filter(user_type='doctor'))
        medications = list(Medication.objects.all())
        
        self.stdout.write(f'Found: {len(patients)} patients, {len(doctors)} doctors, {len(medications)} medications')
        
        if not patients:
            self.stdout.write('No patients found! Run populate_dummy_data first.')
            return
            
        if not doctors:
            self.stdout.write('No doctors found! Run populate_dummy_data first.')
            return
            
        if not medications:
            self.stdout.write('No medications found! Run populate_dummy_data first.')
            return

        # Create patient visits
        self.stdout.write('Creating patient visits...')
        visits_created = 0
        start_date = timezone.now() - timedelta(days=180)
        
        for patient in patients[:10]:  # First 10 patients
            for i in range(3):  # 3 visits each
                visit_date = start_date + timedelta(
                    days=random.randint(0, 180),
                    hours=random.randint(8, 17)
                )
                
                visit = PatientVisit.objects.create(
                    patient=patient,
                    scheduled_date=visit_date,
                    visit_type=random.choice(['consultation', 'follow_up', 'routine_check']),
                    primary_doctor=random.choice(doctors),
                    chief_complaint=random.choice([
                        'Blurred vision', 'Eye pain', 'Routine check-up', 
                        'Follow-up appointment', 'Dry eyes'
                    ]),
                    status='completed'
                )
                visits_created += 1
        
        self.stdout.write(f'Created {visits_created} patient visits')

        # Create consultations
        self.stdout.write('Creating consultations...')
        consultations_created = 0
        visits = list(PatientVisit.objects.all())
        
        for visit in visits[:15]:  # First 15 visits
            consultation = Consultation.objects.create(
                patient=visit.patient,
                visit=visit,
                consulting_doctor=visit.primary_doctor,
                consultation_type='routine_check',
                scheduled_time=visit.scheduled_date,
                chief_complaint=visit.chief_complaint,
                diagnosis_primary=random.choice([
                    'Primary Open Angle Glaucoma', 'Cataract', 'Dry Eye Syndrome',
                    'Diabetic Retinopathy', 'Normal examination'
                ]),
                treatment_plan='Continue current treatment',
                consultation_notes='Standard consultation notes',
                status='completed'
            )
            consultations_created += 1
        
        self.stdout.write(f'Created {consultations_created} consultations')

        # Create prescriptions
        self.stdout.write('Creating prescriptions...')
        prescriptions_created = 0
        
        # Get some visits for prescriptions
        visits_with_patients = PatientVisit.objects.all()[:8]
        
        for visit in visits_with_patients:  # First 8 visits get prescriptions
            prescription_number = f'RX{random.randint(100000, 999999)}'
            prescription = Prescription.objects.create(
                prescription_number=prescription_number,
                patient=visit.patient,
                visit=visit,
                prescribing_doctor=visit.primary_doctor,
                diagnosis=random.choice([
                    'Primary Open Angle Glaucoma', 'Cataract', 'Dry Eye Syndrome',
                    'Diabetic Retinopathy', 'Macular Degeneration'
                ]),
                instructions='Take as prescribed by your doctor',
                status='active',
                valid_until=(timezone.now() + timedelta(days=90)).date(),
                doctor_notes='Standard prescription'
            )
            
            # Add 1-2 medications to each prescription
            for _ in range(random.randint(1, 2)):
                PrescriptionItem.objects.create(
                    prescription=prescription,
                    medication=random.choice(medications),
                    dosage='1 drop',
                    frequency='twice_daily',
                    duration_days=30,
                    quantity_prescribed=1,
                    special_instructions='Take as directed'
                )
            
            prescriptions_created += 1
        
        self.stdout.write(f'Created {prescriptions_created} prescriptions')
        
        # Final counts
        total_visits = PatientVisit.objects.count()
        total_consultations = Consultation.objects.count()
        total_prescriptions = Prescription.objects.count()
        
        self.stdout.write(
            self.style.SUCCESS(
                f'Successfully created essential data!\n'
                f'Visits: {total_visits}\n'
                f'Consultations: {total_consultations}\n'
                f'Prescriptions: {total_prescriptions}'
            )
        )