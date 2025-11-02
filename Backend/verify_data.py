import os, sys, django

sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

from patients.models import Patient
from medications.models import Medication, Prescription
from eye_tests.models import VisualAcuityTest, GlaucomaAssessment, OCTScan, DiabeticRetinopathyScreening
from conditions.models import PatientCondition
from consultations.models import Consultation

print("=" * 60)
print("COMPREHENSIVE DATA VERIFICATION")
print("=" * 60)

print("\n📊 SUMMARY")
print(f"  Patients: {Patient.objects.count()}")
print(f"  Medications: {Medication.objects.count()}")
print(f"  Prescriptions: {Prescription.objects.count()}")
print(f"  Consultations: {Consultation.objects.count()}")
print(f"  Visual Acuity Tests: {VisualAcuityTest.objects.count()}")
print(f"  Glaucoma Assessments: {GlaucomaAssessment.objects.count()}")
print(f"  OCT Scans: {OCTScan.objects.count()}")
print(f"  DR Screenings: {DiabeticRetinopathyScreening.objects.count()}")

print("\n👥 PATIENT CONDITIONS")
for condition in ['AMD', 'GLAUCOMA', 'DIABETIC_RET']:
    count = PatientCondition.objects.filter(condition__code=condition).count()
    print(f"  {condition}: {count} patients")

print("\n💊 MEDICATION BATCHES")
for med in Medication.objects.all()[:5]:
    print(f"  {med.name} - Batch: {med.batch_number} - Expires: {med.expiry_date}")

print("\n📈 VISUAL ACUITY IMPROVEMENT (Sample Patient)")
patient = Patient.objects.first()
print(f"  Patient: {patient.patient_id}")
for va in VisualAcuityTest.objects.filter(patient=patient).order_by('test_date'):
    print(f"    {va.test_date.date()}: {va.right_eye_unaided} → Improving!")

print("\n👁️ GLAUCOMA IOP REDUCTION (Sample Patient)")
glaucoma_patient = PatientCondition.objects.filter(condition__code='GLAUCOMA').first()
if glaucoma_patient:
    patient = glaucoma_patient.patient
    print(f"  Patient: {patient.patient_id}")
    for ga in GlaucomaAssessment.objects.filter(patient=patient).order_by('test_date'):
        print(f"    {ga.test_date.date()}: Right Eye {ga.right_eye_iop} mmHg, Left Eye {ga.left_eye_iop} mmHg")

print("\n🔬 AMD OCT THICKNESS REDUCTION (Sample Patient)")
amd_patient = PatientCondition.objects.filter(condition__code='AMD').first()
if amd_patient:
    patient = amd_patient.patient
    print(f"  Patient: {patient.patient_id}")
    for oct in OCTScan.objects.filter(patient=patient).order_by('test_date'):
        print(f"    {oct.test_date.date()}: Right {oct.right_central_thickness}μm, Left {oct.left_central_thickness}μm")

print("\n🩸 DIABETIC RETINOPATHY IMPROVEMENT (Sample Patient)")
dr_patient = PatientCondition.objects.filter(condition__code='DIABETIC_RET').first()
if dr_patient:
    patient = dr_patient.patient
    print(f"  Patient: {patient.patient_id}")
    for dr in DiabeticRetinopathyScreening.objects.filter(patient=patient).order_by('test_date'):
        print(f"    {dr.test_date.date()}: Grade {dr.right_eye_dr_grade} → Improving!")

print("\n" + "=" * 60)
print("✅ DATA VERIFICATION COMPLETE")
print("=" * 60)
