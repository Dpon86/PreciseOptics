"""
Create realistic treatments linked to existing consultations
"""
import os
import django
import random
from datetime import datetime, timedelta

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

from treatments.models import Treatment, TreatmentType, TreatmentCategory
from consultations.models import Consultation
from accounts.models import CustomUser
from patients.models import Patient

print("Creating treatments linked to consultations...")
print("="*70)

# Get or create treatment categories and types
surgeon = CustomUser.objects.filter(user_type='doctor').first()
if not surgeon:
    print("Error: No doctors found in database")
    exit(1)

print(f"Using surgeon: {surgeon.get_full_name()}")

# Create treatment categories
print("\n1. Creating treatment categories...")
categories = {}

cat_data = [
    ('injection', 'medical', 'Intravitreal Injections'),
    ('laser', 'laser', 'Laser Treatments'),
    ('surgery', 'surgical', 'Surgical Procedures'),
]

for key, cat_type, name in cat_data:
    cat, created = TreatmentCategory.objects.get_or_create(
        name=name,
        defaults={
            'category_type': cat_type,
            'description': f'{name} for eye conditions',
            'created_by': surgeon
        }
    )
    categories[key] = cat
    status = "Created" if created else "Found"
    print(f"  {status}: {name}")

# Create treatment types
print("\n2. Creating treatment types...")
treatment_types = {}

types_data = [
    ('eylea_injection', 'injection', 'Eylea (Aflibercept) Injection', 'EYLEA001', 30),
    ('lucentis_injection', 'injection', 'Lucentis (Ranibizumab) Injection', 'LUC001', 30),
    ('avastin_injection', 'injection', 'Avastin (Bevacizumab) Injection', 'AVA001', 30),
    ('laser_pan', 'laser', 'Pan-retinal Photocoagulation', 'PRP001', 45),
    ('yag_capsulotomy', 'laser', 'YAG Laser Capsulotomy', 'YAG001', 15),
    ('trabeculectomy', 'surgery', 'Trabeculectomy', 'TRAB001', 90),
]

for key, cat_key, name, code, duration in types_data:
    t_type, created = TreatmentType.objects.get_or_create(
        code=code,
        defaults={
            'category': categories[cat_key],
            'name': name,
            'description': f'{name} procedure',
            'typical_duration_minutes': duration,
            'requires_consent': True,
            'requires_anesthesia': 'topical',
            'created_by': surgeon
        }
    )
    treatment_types[key] = t_type
    status = "Created" if created else "Found"
    print(f"  {status}: {name}")

# Create treatments for consultations
print("\n3. Creating treatments for consultations...")

consultations = Consultation.objects.all()
print(f"  Found {consultations.count()} consultations")

# Map conditions to appropriate treatments
condition_treatments = {
    'AMD': ['eylea_injection', 'lucentis_injection', 'avastin_injection'],
    'GLAUCOMA': ['trabeculectomy', 'laser_pan'],
    'DIABETIC_RETINOPATHY': ['laser_pan', 'avastin_injection'],
    'CATARACT': ['yag_capsulotomy'],
}

treatments_created = 0

for consultation in consultations:
    # Determine patient condition from chief complaint
    condition = None
    chief = consultation.chief_complaint.upper()
    
    if 'AMD' in chief or 'MACULAR' in chief:
        condition = 'AMD'
    elif 'GLAUCOMA' in chief:
        condition = 'GLAUCOMA'
    elif 'DIABETIC' in chief or 'RETINOPATHY' in chief:
        condition = 'DIABETIC_RETINOPATHY'
    elif 'CATARACT' in chief:
        condition = 'CATARACT'
    
    if not condition:
        continue
    
    # Get appropriate treatment for condition
    treatment_options = condition_treatments.get(condition, [])
    if not treatment_options:
        continue
    
    # Randomly select a treatment (weighted towards injections for AMD/DR)
    treatment_key = random.choice(treatment_options)
    treatment_type = treatment_types[treatment_key]
    
    # Use consultation date
    cons_date = consultation.scheduled_time if consultation.scheduled_time else consultation.actual_start_time
    
    # Determine eye to treat
    eye_choices = ['left', 'right', 'both']
    eye_treated = random.choice(eye_choices) if 'injection' in treatment_key else 'left'
    
    # Create treatment
    treatment = Treatment.objects.create(
        patient=consultation.patient,
        consultation=consultation,
        treatment_type=treatment_type,  # Pass the TreatmentType instance
        scheduled_date=cons_date,
        actual_start_time=cons_date,
        actual_end_time=cons_date + timedelta(minutes=treatment_type.typical_duration_minutes),
        primary_surgeon=surgeon,
        status='completed',
        outcome='good',
        eye_treated=eye_treated,
        indication=f'Treatment for {condition} as per consultation assessment',
        technique_notes=f'{treatment_type.name} performed successfully during consultation. Patient tolerated procedure well.',
        consent_obtained=True,
        consent_date=cons_date,
        consent_obtained_by=surgeon,
        requires_follow_up=True,
        follow_up_weeks=4,
        created_by=surgeon,
    )
    treatments_created += 1
    
    if treatments_created <= 10:
        print(f"  ✓ Created: {treatment_type.name} for {consultation.patient.first_name} {consultation.patient.last_name} ({condition}) - Date: {cons_date.date()}")

print(f"\n{'='*70}")
print(f"✅ SUCCESSFULLY CREATED {treatments_created} TREATMENTS")
print(f"  - All linked to existing consultations")
print(f"  - All dates match consultation dates") 
print(f"  - All treatments appropriate for patient conditions")
print(f"{'='*70}")
