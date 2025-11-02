import os, sys, django
from datetime import datetime, timedelta
from decimal import Decimal
from django.utils import timezone
import random

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

from django.db import transaction
from patients.models import Patient, PatientVisit
from accounts.models import CustomUser
from conditions.models import MedicalCondition, PatientCondition
from medications.models import Medication, Manufacturer, MedicationCategory, Prescription
from consultations.models import Consultation, VitalSigns
from eye_tests.models import VisualAcuityTest, GlaucomaAssessment, OCTScan, DiabeticRetinopathyScreening

print("Starting comprehensive data population...")

with transaction.atomic():
    # Get or create doctors
    doctor, _ = CustomUser.objects.get_or_create(
        username='dr.smith',
        defaults={'email': 'dr.smith@local.com', 'first_name': 'John', 'last_name': 'Smith', 'user_type': 'ophthalmologist'}
    )
    
    # Load conditions
    conditions = {}
    for code in ['AMD', 'GLAUCOMA', 'DIABETIC_RET']:
        try:
            conditions[code] = MedicalCondition.objects.get(code=code)
        except:
            pass
    
    # Create medications with batches - Real ophthalmology medications
    medications_data = [
        # Anti-VEGF Injections
        {'name': 'Eylea', 'generic': 'Aflibercept', 'strength': '40 mg/ml', 'type': 'injection', 'class': 'anti_vegf',
         'indications': 'Wet AMD, Diabetic Macular Edema, Macular Edema following RVO', 
         'dosage': '2mg (0.05ml) intravitreal injection', 'max_dose': 'One injection every 4-8 weeks',
         'manufacturer': 'Bayer', 'price': '816.00'},
        {'name': 'Lucentis', 'generic': 'Ranibizumab', 'strength': '10 mg/ml', 'type': 'injection', 'class': 'anti_vegf',
         'indications': 'Wet AMD, Diabetic Retinopathy, Visual impairment due to DME or RVO',
         'dosage': '0.5mg (0.05ml) intravitreal injection', 'max_dose': 'One injection monthly',
         'manufacturer': 'Novartis', 'price': '742.00'},
        {'name': 'Avastin', 'generic': 'Bevacizumab', 'strength': '25 mg/ml', 'type': 'injection', 'class': 'anti_vegf',
         'indications': 'Off-label for AMD, DME, and RVO',
         'dosage': '1.25mg (0.05ml) intravitreal injection', 'max_dose': 'One injection every 4-6 weeks',
         'manufacturer': 'Roche', 'price': '28.00'},
        
        # Glaucoma Medications
        {'name': 'Xalatan', 'generic': 'Latanoprost', 'strength': '0.005%', 'type': 'eye_drop', 'class': 'antiglaucoma',
         'indications': 'Elevated intraocular pressure in open-angle glaucoma and ocular hypertension',
         'dosage': 'One drop in affected eye(s) once daily in evening', 'max_dose': 'Once daily',
         'manufacturer': 'Pfizer', 'price': '45.00'},
        {'name': 'Timolol', 'generic': 'Timolol Maleate', 'strength': '0.5%', 'type': 'eye_drop', 'class': 'antiglaucoma',
         'indications': 'Elevated IOP in ocular hypertension or open-angle glaucoma',
         'dosage': 'One drop in affected eye(s) twice daily', 'max_dose': 'Twice daily',
         'manufacturer': 'Bausch & Lomb', 'price': '12.00'},
        {'name': 'Cosopt', 'generic': 'Dorzolamide/Timolol', 'strength': '20mg/5mg per ml', 'type': 'eye_drop', 'class': 'antiglaucoma',
         'indications': 'Elevated IOP in open-angle glaucoma or ocular hypertension',
         'dosage': 'One drop in affected eye(s) twice daily', 'max_dose': 'Twice daily',
         'manufacturer': 'Santen', 'price': '65.00'},
        {'name': 'Lumigan', 'generic': 'Bimatoprost', 'strength': '0.01%', 'type': 'eye_drop', 'class': 'antiglaucoma',
         'indications': 'Elevated IOP in open-angle glaucoma or ocular hypertension',
         'dosage': 'One drop in affected eye(s) once daily in evening', 'max_dose': 'Once daily',
         'manufacturer': 'Allergan', 'price': '85.00'},
        
        # Anti-inflammatory
        {'name': 'Pred Forte', 'generic': 'Prednisolone Acetate', 'strength': '1%', 'type': 'eye_drop', 'class': 'steroid',
         'indications': 'Steroid responsive inflammatory conditions of the eye',
         'dosage': '1-2 drops up to every hour during day, tapering as condition improves', 'max_dose': 'Every hour',
         'manufacturer': 'Allergan', 'price': '18.00'},
        {'name': 'Acular', 'generic': 'Ketorolac Tromethamine', 'strength': '0.5%', 'type': 'eye_drop', 'class': 'anti_inflammatory',
         'indications': 'Post-operative inflammation, seasonal allergic conjunctivitis',
         'dosage': 'One drop 4 times daily', 'max_dose': '4 times daily',
         'manufacturer': 'Allergan', 'price': '95.00'},
        {'name': 'Nevanac', 'generic': 'Nepafenac', 'strength': '0.1%', 'type': 'eye_drop', 'class': 'anti_inflammatory',
         'indications': 'Post-operative pain and inflammation following cataract surgery',
         'dosage': 'One drop 3 times daily beginning 1 day before surgery', 'max_dose': '3 times daily',
         'manufacturer': 'Novartis', 'price': '125.00'},
    ]
    
    meds = []
    for i, med_data in enumerate(medications_data):
        # Create 5 different batches for each medication
        for batch_num in range(1, 6):
            med = Medication.objects.create(
                name=f"{med_data['name']} (Batch {batch_num})",
                generic_name=med_data['generic'],
                brand_names=med_data['name'],
                medication_type=med_data['type'],
                therapeutic_class=med_data['class'],
                batch_number=f"{med_data['name'][:3].upper()}-{i+1:02d}{batch_num:02d}-2024",
                expiry_date=(datetime.now() + timedelta(days=365 + batch_num*30)).date(),
                strength=med_data['strength'],
                active_ingredients=med_data['generic'],
                description=f"{med_data['name']} ({med_data['generic']}) - {med_data['type'].replace('_', ' ').title()}",
                indications=med_data['indications'],
                contraindications='Hypersensitivity to active ingredient or excipients',
                side_effects='Eye irritation, blurred vision, increased lacrimation',
                standard_dosage=med_data['dosage'],
                maximum_daily_dose=med_data['max_dose'],
                storage_temperature='2-8°C (Refrigerate)' if med_data['type'] == 'injection' else 'Room temperature',
                shelf_life_months=24,
                manufacturer=med_data['manufacturer'],
                approval_status=True,
                current_stock=100 - (batch_num * 10),
                minimum_stock_level=20,
                unit_price=Decimal(med_data['price']),
                created_by=doctor
            )
            meds.append(med)
    print(f"Created {len(meds)} medications (10 medications × 5 batches each = 50 total)")
    
    # Create 10 patients with realistic names
    patients_data = [
        {'first': 'James', 'last': 'Thompson', 'dob_years': 68, 'gender': 'M', 'condition': 'AMD'},
        {'first': 'Margaret', 'last': 'Davies', 'dob_years': 72, 'gender': 'F', 'condition': 'GLAUCOMA'},
        {'first': 'Robert', 'last': 'Wilson', 'dob_years': 65, 'gender': 'M', 'condition': 'DIABETIC_RET'},
        {'first': 'Patricia', 'last': 'Anderson', 'dob_years': 70, 'gender': 'F', 'condition': 'AMD'},
        {'first': 'Michael', 'last': 'Brown', 'dob_years': 58, 'gender': 'M', 'condition': 'GLAUCOMA'},
        {'first': 'Jennifer', 'last': 'Taylor', 'dob_years': 62, 'gender': 'F', 'condition': 'DIABETIC_RET'},
        {'first': 'William', 'last': 'Harris', 'dob_years': 75, 'gender': 'M', 'condition': 'AMD'},
        {'first': 'Elizabeth', 'last': 'Martin', 'dob_years': 69, 'gender': 'F', 'condition': 'GLAUCOMA'},
        {'first': 'David', 'last': 'Jackson', 'dob_years': 64, 'gender': 'M', 'condition': 'DIABETIC_RET'},
        {'first': 'Sarah', 'last': 'White', 'dob_years': 71, 'gender': 'F', 'condition': 'AMD'},
    ]
    
    patients = []
    for i, patient_data in enumerate(patients_data):
        patient = Patient.objects.create(
            patient_id=f'PAT{10001+i}',
            first_name=patient_data['first'],
            last_name=patient_data['last'],
            date_of_birth=(datetime.now() - timedelta(days=patient_data['dob_years']*365)).date(),
            gender=patient_data['gender'],
            phone_number=f'+4479{random.randint(10000000, 99999999)}',
            email=f"{patient_data['first'].lower()}.{patient_data['last'].lower()}@example.com",
            address_line_1=f'{random.randint(1, 150)} {random.choice(["High", "Main", "Church", "Station", "Park"])} Street',
            city=random.choice(['London', 'Birmingham', 'Manchester', 'Leeds', 'Liverpool']),
            state='England',
            postal_code=f'{random.choice(["SW", "SE", "NW", "NE", "EC"])}{random.randint(1,9)} {random.randint(1,9)}{random.choice(["AA", "AB", "AD", "AE"])}',
            country='UK',
            emergency_contact_name=f"{random.choice(['John', 'Mary', 'Emma', 'Thomas'])} {patient_data['last']}",
            emergency_contact_phone=f'+4479{random.randint(10000000, 99999999)}',
            emergency_contact_relationship=random.choice(['Spouse', 'Son', 'Daughter', 'Sibling']),
            is_active=True
        )
        patients.append(patient)
        
        # Assign condition
        condition_code = patient_data['condition']
        if condition_code in conditions:
            PatientCondition.objects.create(
                patient=patient,
                condition=conditions[condition_code],
                diagnosis_date=(datetime.now() - timedelta(days=random.randint(400, 800))).date(),
                diagnosed_by=doctor,
                severity=random.choice(['mild', 'moderate', 'severe']),
                eye_affected=random.choice(['left', 'right', 'both']),
                current_status='active',
                is_active=True
            )
    print(f"Created {len(patients)} patients with conditions")
    
    # Create visits and tests over 1 year
    base_date = timezone.now() - timedelta(days=365)
    for patient in patients:
        # Get patient's condition for appropriate medication and test selection
        patient_condition = PatientCondition.objects.filter(patient=patient).first()
        condition_code = patient_condition.condition.code if patient_condition else 'AMD'
        
        # Select appropriate medications based on condition
        if condition_code == 'AMD':
            patient_meds = [m for m in meds if 'Eylea' in m.name or 'Lucentis' in m.name or 'Avastin' in m.name]
        elif condition_code == 'GLAUCOMA':
            patient_meds = [m for m in meds if 'Xalatan' in m.name or 'Timolol' in m.name or 'Cosopt' in m.name or 'Lumigan' in m.name]
        else:  # DIABETIC_RET
            patient_meds = [m for m in meds if 'Eylea' in m.name or 'Lucentis' in m.name]
        
        for visit_num, month in enumerate([0, 3, 6, 9, 12]):
            visit_date = base_date + timedelta(days=month*30)
            
            visit = PatientVisit.objects.create(
                patient=patient,
                visit_type='follow_up' if visit_num > 0 else 'initial',
                status='completed',
                scheduled_date=visit_date,
                primary_doctor=doctor,
                payment_status='paid'
            )
            
            consultation = Consultation.objects.create(
                patient=patient,
                visit=visit,
                consulting_doctor=doctor,
                consultation_type='follow_up' if visit_num > 0 else 'initial',
                status='completed',
                scheduled_time=visit_date,
                chief_complaint='Regular follow-up for ' + condition_code.replace('_', ' ')
            )
            
            VitalSigns.objects.create(
                consultation=consultation,
                blood_pressure_systolic=random.randint(120, 140),
                blood_pressure_diastolic=random.randint(75, 85),
                heart_rate=random.randint(65, 80),
                temperature=Decimal(str(round(random.uniform(36.5, 37.2), 1)))
            )
            
            # Create prescription with appropriate medication
            selected_med = patient_meds[visit_num % len(patient_meds)] if patient_meds else meds[0]
            Prescription.objects.create(
                prescription_number=f'RX{random.randint(100000,999999)}',
                patient=patient,
                visit=visit,
                prescribing_doctor=doctor,
                diagnosis=f"{condition_code.replace('_', ' ')} treatment",
                instructions=f'{selected_med.standard_dosage}. Batch: {selected_med.batch_number}',
                status='active',
                valid_until=(visit_date + timedelta(days=90)).date()
            )
            
            # Visual acuity test showing improvement
            va = ['6/60', '6/48', '6/36', '6/24', '6/18'][min(month//3, 4)]
            VisualAcuityTest.objects.create(
                patient=patient,
                consultation=consultation,
                performed_by=doctor,
                test_date=visit_date,
                status='completed',
                test_method='snellen_chart',
                right_eye_unaided=va,
                left_eye_unaided=va,
                findings='Vision improving with treatment'
            )
            
            # Additional tests based on condition
            if condition_code == 'GLAUCOMA':
                iop = max(30 - month, 14)
                GlaucomaAssessment.objects.create(
                    patient=patient,
                    consultation=consultation,
                    performed_by=doctor,
                    test_date=visit_date,
                    status='completed',
                    iop_method='goldmann',
                    right_eye_iop=Decimal(str(iop)),
                    left_eye_iop=Decimal(str(iop-1)),
                    findings=f'IOP controlled with {selected_med.generic_name}. {"Excellent" if iop < 18 else "Good"} response to therapy.',
                    treatment_required=iop > 21
                )
            elif condition_code == 'AMD':
                thickness = max(450 - month*20, 250)
                OCTScan.objects.create(
                    patient=patient,
                    consultation=consultation,
                    performed_by=doctor,
                    test_date=visit_date,
                    status='completed',
                    scan_type='macula',
                    right_central_thickness=thickness,
                    left_central_thickness=thickness-10,
                    findings=f'Macular thickness {"stable" if thickness <= 300 else "reducing"} with {selected_med.generic_name} therapy. {"Significant" if thickness < 300 else "Moderate"} improvement noted.'
                )
            elif condition_code == 'DIABETIC_RET':
                severity = ['r3s', 'r3a', 'r2', 'r1', 'r0'][min(month//3, 4)]
                DiabeticRetinopathyScreening.objects.create(
                    patient=patient,
                    consultation=consultation,
                    performed_by=doctor,
                    test_date=visit_date,
                    status='completed',
                    diabetes_type='type2',
                    right_eye_dr_grade=severity,
                    left_eye_dr_grade=severity,
                    findings=f'DR grade {severity}. {"Excellent" if severity in ["r0", "r1"] else "Good"} response to {selected_med.generic_name} treatment. Continue current regimen.'
                )

print(" Data population complete!")
print(f"Patients: {Patient.objects.count()}")
print(f"Medications: {Medication.objects.count()}")
print(f"Visits: {PatientVisit.objects.count()}")
print(f"Consultations: {Consultation.objects.count()}")
print(f"VA Tests: {VisualAcuityTest.objects.count()}")
print(f"Glaucoma Tests: {GlaucomaAssessment.objects.count()}")
print(f"OCT Scans: {OCTScan.objects.count()}")
print(f"DR Screenings: {DiabeticRetinopathyScreening.objects.count()}")
