import os, sys, django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

from patients.models import Patient
from medications.models import Medication, Prescription
from eye_tests.models import VisualAcuityTest, GlaucomaAssessment, OCTScan
from conditions.models import PatientCondition

print("=" * 80)
print("REALISTIC DATA VERIFICATION - PreciseOptics Eye Hospital")
print("=" * 80)

print("\n📋 REALISTIC PATIENT LIST")
print("-" * 80)
for patient in Patient.objects.all().order_by('patient_id'):
    condition = PatientCondition.objects.filter(patient=patient).first()
    condition_name = condition.condition.name if condition else "None"
    print(f"  {patient.patient_id}: {patient.first_name} {patient.last_name} ({patient.gender}, Age {patient.get_age()})")
    print(f"    Condition: {condition_name}")
    print(f"    Email: {patient.email}")
    print(f"    Address: {patient.address_line_1}, {patient.city}, {patient.postal_code}")
    print()

print("\n💊 REAL OPHTHALMIC MEDICATIONS")
print("-" * 80)
# Get unique medication names
unique_meds = {}
for med in Medication.objects.all().order_by('name'):
    base_name = med.name.split(' (Batch')[0]
    if base_name not in unique_meds:
        unique_meds[base_name] = []
    unique_meds[base_name].append(med)

for med_name, batches in unique_meds.items():
    first_batch = batches[0]
    print(f"\n  {med_name} ({first_batch.generic_name})")
    print(f"    Type: {first_batch.medication_type.replace('_', ' ').title()}")
    print(f"    Strength: {first_batch.strength}")
    print(f"    Class: {first_batch.therapeutic_class.replace('_', ' ').title()}")
    print(f"    Manufacturer: {first_batch.manufacturer}")
    print(f"    Dosage: {first_batch.standard_dosage}")
    print(f"    Price: £{first_batch.unit_price}")
    print(f"    Batches: {len(batches)} batches")
    for batch in batches[:3]:  # Show first 3 batches
        print(f"      - {batch.batch_number} (Expires: {batch.expiry_date}, Stock: {batch.current_stock})")

print("\n\n📊 SAMPLE PATIENT TREATMENT JOURNEY")
print("=" * 80)

# Show detailed journey for one AMD patient
amd_patient = PatientCondition.objects.filter(condition__code='AMD').first()
if amd_patient:
    patient = amd_patient.patient
    print(f"\nPatient: {patient.first_name} {patient.last_name} ({patient.patient_id})")
    print(f"Condition: Age-related Macular Degeneration (AMD)")
    print(f"Diagnosis Date: {amd_patient.diagnosis_date}")
    print(f"Severity: {amd_patient.severity.title()}")
    print("\nTreatment Timeline:")
    print("-" * 80)
    
    visits = patient.visits.all().order_by('scheduled_date')
    for i, visit in enumerate(visits, 1):
        consultation = visit.consultations.first()
        prescription = visit.prescriptions.first()
        va_test = consultation.visualacuitytest_set.first() if consultation else None
        oct_scan = consultation.octscan_set.first() if consultation else None
        
        print(f"\nVisit {i}: {visit.scheduled_date.date()}")
        if prescription:
            med_name = prescription.instructions.split('.')[0]
            batch = prescription.instructions.split('Batch: ')[-1] if 'Batch: ' in prescription.instructions else 'N/A'
            print(f"  💊 Medication: {med_name}")
            print(f"     Batch: {batch}")
        
        if va_test:
            print(f"  👁️  Visual Acuity: {va_test.right_eye_unaided} (Right), {va_test.left_eye_unaided} (Left)")
        
        if oct_scan:
            print(f"  🔬 OCT Scan:")
            print(f"     Central Thickness: {oct_scan.right_central_thickness}μm (Right), {oct_scan.left_central_thickness}μm (Left)")
            print(f"     Findings: {oct_scan.findings}")

print("\n\n📈 GLAUCOMA PATIENT IOP CONTROL")
print("=" * 80)

glaucoma_patient = PatientCondition.objects.filter(condition__code='GLAUCOMA').first()
if glaucoma_patient:
    patient = glaucoma_patient.patient
    print(f"\nPatient: {patient.first_name} {patient.last_name} ({patient.patient_id})")
    print(f"Condition: Glaucoma")
    print(f"Treatment: Pressure-lowering medications")
    print("\nIOP Measurements Over Time:")
    print("-" * 80)
    
    visits = patient.visits.all().order_by('scheduled_date')
    for i, visit in enumerate(visits, 1):
        consultation = visit.consultations.first()
        prescription = visit.prescriptions.first()
        glaucoma_test = consultation.glaucomaassessment_set.first() if consultation else None
        
        if glaucoma_test:
            print(f"\nVisit {i}: {visit.scheduled_date.date()}")
            if prescription:
                med_name = prescription.instructions.split('.')[0]
                print(f"  💊 {med_name}")
            print(f"  📊 IOP: {glaucoma_test.right_eye_iop}mmHg (Right), {glaucoma_test.left_eye_iop}mmHg (Left)")
            print(f"     {glaucoma_test.findings}")

print("\n\n💉 ANTI-VEGF THERAPY EFFECTIVENESS")
print("=" * 80)

# Show which Anti-VEGF medication is most effective
anti_vegf_meds = ['Eylea', 'Lucentis', 'Avastin']
for med_name in anti_vegf_meds:
    prescriptions = Prescription.objects.filter(instructions__icontains=med_name)
    if prescriptions.exists():
        print(f"\n{med_name}:")
        total_improvement = 0
        count = 0
        for rx in prescriptions:
            # Get OCT scans before and after this medication
            visits = rx.patient.visits.filter(scheduled_date__gte=rx.visit.scheduled_date).order_by('scheduled_date')[:2]
            if len(visits) == 2:
                oct1 = visits[0].consultations.first().octscan_set.first() if visits[0].consultations.exists() else None
                oct2 = visits[1].consultations.first().octscan_set.first() if visits[1].consultations.exists() else None
                if oct1 and oct2:
                    improvement = oct1.right_central_thickness - oct2.right_central_thickness
                    total_improvement += improvement
                    count += 1
        
        if count > 0:
            avg_improvement = total_improvement / count
            print(f"  Average macular thickness reduction: {avg_improvement:.0f}μm")
            print(f"  Number of treatments: {count}")

print("\n" + "=" * 80)
print("✅ REALISTIC DATA VERIFICATION COMPLETE")
print("=" * 80)
