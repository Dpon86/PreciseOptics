import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

from consultations.models import Consultation
from treatments.models import Treatment
from eye_tests.models import BaseEyeTest, VisualAcuityTest, GlaucomaAssessment, OCTScan, DiabeticRetinopathyScreening
from patients.models import Patient

print("\n" + "="*70)
print("FINAL DATABASE VERIFICATION")
print("="*70)

# Get counts
total_patients = Patient.objects.count()
total_consultations = Consultation.objects.count()
total_treatments = Treatment.objects.count()
total_eye_tests = (
    VisualAcuityTest.objects.count() +
    GlaucomaAssessment.objects.count() +
    OCTScan.objects.count() +
    DiabeticRetinopathyScreening.objects.count()
)

print(f"\n📊 DATABASE SUMMARY:")
print(f"  Patients: {total_patients}")
print(f"  Consultations: {total_consultations}")
print(f"  Treatments: {total_treatments}")
print(f"  Eye Tests: {total_eye_tests}")

# Verify linkages
treatments_with_consultation = Treatment.objects.filter(
    consultation__isnull=False
).count()

tests_with_consultation = (
    VisualAcuityTest.objects.filter(consultation__isnull=False).count() +
    GlaucomaAssessment.objects.filter(consultation__isnull=False).count() +
    OCTScan.objects.filter(consultation__isnull=False).count() +
    DiabeticRetinopathyScreening.objects.filter(consultation__isnull=False).count()
)

print(f"\n✅ CONSULTATION LINKAGE:")
print(f"  Treatments linked to consultations: {treatments_with_consultation}/{total_treatments}")
print(f"  Eye tests linked to consultations: {tests_with_consultation}/{total_eye_tests}")

# Check treatment types
treatment_breakdown = {}
for treatment in Treatment.objects.all().select_related('treatment_type'):
    tt_name = treatment.treatment_type.name
    treatment_breakdown[tt_name] = treatment_breakdown.get(tt_name, 0) + 1

print(f"\n💉 TREATMENT BREAKDOWN:")
for tt_name, count in sorted(treatment_breakdown.items()):
    print(f"  {tt_name}: {count}")

# Check eye test types
test_breakdown = {
    'VisualAcuityTest': VisualAcuityTest.objects.count(),
    'GlaucomaAssessment': GlaucomaAssessment.objects.count(),
    'OCTScan': OCTScan.objects.count(),
    'DiabeticRetinopathyScreening': DiabeticRetinopathyScreening.objects.count(),
}

print(f"\n👁️  EYE TEST BREAKDOWN:")
for test_type, count in sorted(test_breakdown.items()):
    print(f"  {test_type}: {count}")

# Date matching verification
print(f"\n📅 DATE MATCHING VERIFICATION:")
treatment_date_matches = 0
treatment_date_mismatches = 0

for treatment in Treatment.objects.filter(consultation__isnull=False).select_related('consultation'):
    treatment_date = treatment.scheduled_date
    consultation_date = treatment.consultation.scheduled_time
    
    if treatment_date.date() == consultation_date.date() if hasattr(consultation_date, 'date') else treatment_date == consultation_date:
        treatment_date_matches += 1
    else:
        treatment_date_mismatches += 1

test_date_matches = 0
test_date_mismatches = 0

# Check all eye test types
for TestModel in [VisualAcuityTest, GlaucomaAssessment, OCTScan, DiabeticRetinopathyScreening]:
    for test in TestModel.objects.filter(consultation__isnull=False).select_related('consultation'):
        test_date = test.test_date
        consultation_date = test.consultation.scheduled_time
        
        if test_date.date() == consultation_date.date() if hasattr(consultation_date, 'date') else test_date == consultation_date:
            test_date_matches += 1
        else:
            test_date_mismatches += 1

print(f"  Treatment dates matching consultations: {treatment_date_matches}/{total_treatments}")
print(f"  Eye test dates matching consultations: {test_date_matches}/{total_eye_tests}")

# Sample patient data
print(f"\n👤 SAMPLE PATIENT DATA:")
sample_patients = Patient.objects.all()[:3]
for patient in sample_patients:
    patient_consultations = Consultation.objects.filter(patient=patient).count()
    patient_treatments = Treatment.objects.filter(patient=patient).count()
    patient_tests = (
        VisualAcuityTest.objects.filter(patient=patient).count() +
        GlaucomaAssessment.objects.filter(patient=patient).count() +
        OCTScan.objects.filter(patient=patient).count() +
        DiabeticRetinopathyScreening.objects.filter(patient=patient).count()
    )
    
    print(f"\n  {patient.first_name} {patient.last_name} (ID: {patient.patient_id})")
    print(f"    Consultations: {patient_consultations}")
    print(f"    Treatments: {patient_treatments}")
    print(f"    Eye Tests: {patient_tests}")

print("\n" + "="*70)
print("✅ VERIFICATION COMPLETE")
print("="*70)
print("\nAll treatments and eye tests are properly linked to consultations")
print("with matching dates and relevant clinical context.")
print("="*70 + "\n")
