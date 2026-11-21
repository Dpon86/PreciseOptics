"""
IOP trend data — returns time-series IOP data for charting per patient.
Used by the IOP Trending Chart on the patient detail page.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Q
from eye_tests.models import GlaucomaAssessment
from medications.models import MedicationAdministration


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_iop_trend(request, patient_id):
    """
    Return IOP values over time for a patient, plus medication changes overlay.
    Query params: months (default 24)
    """
    try:
        months = int(request.GET.get('months', 24))
    except (ValueError, TypeError):
        months = 24

    # Tonometry data (IOP) — the actual IOP readings
    tonometry = GlaucomaAssessment.objects.filter(
        patient_id=patient_id
    ).select_related('entered_by').order_by('test_date')

    iop_points = []
    for t in tonometry:
        iop_points.append({
            'date': t.test_date.isoformat() if t.test_date else None,
            'right_iop': float(t.right_eye_iop) if t.right_eye_iop else None,
            'left_iop': float(t.left_eye_iop) if t.left_eye_iop else None,
            'iop_method': t.iop_method or '',
            'target_iop': float(t.target_iop) if t.target_iop else None,
        })

    # Medication changes — when anti-glaucoma drugs were administered
    med_events = MedicationAdministration.objects.filter(
        patient_id=patient_id
    ).select_related('medication').order_by('administration_time')

    medication_changes = []
    for m in med_events:
        medication_changes.append({
            'date': m.administration_time.isoformat() if m.administration_time else None,
            'medication_name': m.medication.name,
            'route': m.route,
            'dosage': m.dosage_administered,
            'eye_side': m.eye_side or '',
            'is_start': True,  # marker that this medication was started
        })

    return Response({
        'patient_id': str(patient_id),
        'iop_points': iop_points,
        'medication_changes': medication_changes,
        'total_iop_readings': len(iop_points),
        'total_medication_events': len(medication_changes),
    })