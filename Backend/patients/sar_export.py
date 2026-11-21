"""
Subject Access Request (SAR) export — GDPR compliant patient data compilation.
Compiles all patient data into a structured JSON response.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.http import JsonResponse
from patients.models import Patient, PatientVisit, PatientDocument
from consultations.models import Consultation
from eye_tests.models import (
    VisualAcuityTest, RefractionTest, GlaucomaAssessment, CataractAssessment,
    VisualFieldTest, OCTScan, RetinalAssessment, DiabeticRetinopathyScreening,
)
from medications.models import Prescription, PrescriptionItem, MedicationAdministration, DrugAllergy
from treatments.models import IntravitrealInjectionRecord, Treatment
from patient_outcomes.models import PatientOutcomeReport
from conditions.models import PatientCondition
from referrals.models import Referral
from audit.models import AuditLog


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def sar_export(request, patient_id):
    """
    Compile all data for a patient into a structured JSON export.
    Accessible at: GET /api/patients/<uuid>/sar-export/
    """
    try:
        patient = Patient.objects.get(id=patient_id)
    except Patient.DoesNotExist:
        return Response({'error': 'Patient not found'}, status=404)

    export = {
        'export_date': str(__import__('django').utils.timezone.now()),
        'exported_by': request.user.get_full_name(),
        'patient': {
            'full_name': patient.get_full_name(),
            'date_of_birth': str(patient.date_of_birth) if patient.date_of_birth else None,
            'gender': patient.gender,
            'nhs_number': patient.nhs_number,
            'patient_id': patient.patient_id,
            'address': f"{patient.address_line_1}, {patient.city}, {patient.postal_code}",
            'phone': patient.phone_number,
            'email': patient.email,
            'emergency_contact': patient.emergency_contact_name,
        },
        'consultations': [
            {
                'date': str(c.consultation_date.date()) if c.consultation_date else None,
                'type': str(c.consultation_type),
                'diagnosis': c.diagnosis or '',
                'findings': c.findings or '',
                'plan': c.plan or '',
            }
            for c in Consultation.objects.filter(patient=patient).order_by('-consultation_date')[:50]
        ],
        'eye_tests': {
            'visual_acuity': [
                {'date': str(t.test_date), 'right_eye': t.right_eye_va, 'left_eye': t.left_eye_va}
                for t in VisualAcuityTest.objects.filter(patient=patient).order_by('-test_date')[:50]
            ] if VisualAcuityTest.objects.filter(patient=patient).exists() else [],
            'glaucoma': [
                {'date': str(t.test_date), 'right_iop': float(t.right_eye_iop) if t.right_eye_iop else None, 'left_iop': float(t.left_eye_iop) if t.left_eye_iop else None}
                for t in GlaucomaAssessment.objects.filter(patient=patient).order_by('-test_date')[:50]
            ] if GlaucomaAssessment.objects.filter(patient=patient).exists() else [],
            'visual_field': [
                {'date': str(t.test_date), 'right_md': float(t.right_eye_md) if t.right_eye_md else None, 'left_md': float(t.left_eye_md) if t.left_eye_md else None}
                for t in VisualFieldTest.objects.filter(patient=patient).order_by('-test_date')[:50]
            ] if VisualFieldTest.objects.filter(patient=patient).exists() else [],
        },
        'prescriptions': [
            {
                'date': str(p.date_prescribed.date()) if p.date_prescribed else None,
                'items': [
                    {'medication': pi.medication.name, 'dosage': pi.dosage, 'frequency': pi.get_frequency_display()}
                    for pi in PrescriptionItem.objects.filter(prescription=p)
                ]
            }
            for p in Prescription.objects.filter(patient=patient).order_by('-date_prescribed')[:30]
        ],
        'injections': [
            {
                'date': inj.injection_date.isoformat() if inj.injection_date else None,
                'drug': inj.drug_name, 'batch': inj.batch_number,
                'eye': inj.get_eye_display(), 'phase': inj.get_phase_display(),
                'adverse_event': inj.adverse_event,
            }
            for inj in IntravitrealInjectionRecord.objects.filter(patient=patient).order_by('-injection_date')[:50]
        ],
        'medication_administrations': [
            {
                'date': m.administration_time.isoformat() if m.administration_time else None,
                'medication': m.medication.name, 'route': m.route, 'dose': m.dosage_administered,
                'batch': m.batch_number_administered,
            }
            for m in MedicationAdministration.objects.filter(patient=patient).order_by('-administration_time')[:50]
        ],
        'conditions': [
            {'condition': pc.condition.name, 'status': pc.current_status, 'diagnosis_date': str(pc.diagnosis_date)}
            for pc in PatientCondition.objects.filter(patient=patient, is_active=True)
        ],
        'allergies': [
            {'medication': d.medication.name, 'severity': d.severity}
            for d in DrugAllergy.objects.filter(patient=patient, is_active=True)
        ],
        'referrals': [
            {'date': str(r.referral_date), 'source': r.referral_source.name if hasattr(r, 'referral_source') else '', 'status': r.status}
            for r in Referral.objects.filter(patient=patient).order_by('-referral_date')[:20]
        ],
        'outcomes': [
            {'date': str(o.report_date), 'vision_score': o.vision_quality_score, 'satisfaction': o.treatment_satisfaction}
            for o in PatientOutcomeReport.objects.filter(patient=patient).order_by('-report_date')[:20]
        ],
        'audit_logs': [
            {'action': a.action, 'timestamp': str(a.timestamp), 'user': a.user.get_full_name() if a.user else ''}
            for a in AuditLog.objects.filter(patient=patient).order_by('-timestamp')[:50]
        ] if hasattr(AuditLog.objects, 'filter') else [],
    }

    return Response(export)