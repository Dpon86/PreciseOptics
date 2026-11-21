"""
Visual Field Trend data — returns time-series Mean Deviation (MD) for charting per patient.
Used by the Visual Field Trend chart on the patient detail page.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from eye_tests.models import VisualFieldTest


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_vf_trend(request, patient_id):
    """
    Return Visual Field Mean Deviation (MD) values over time for a patient.
    Query params: months (default 24)
    """
    try:
        months = int(request.GET.get('months', 24))
    except (ValueError, TypeError):
        months = 24

    vf_tests = VisualFieldTest.objects.filter(
        patient_id=patient_id
    ).order_by('test_date')

    md_points = []
    for t in vf_tests:
        md_points.append({
            'date': t.test_date.isoformat() if t.test_date else None,
            'right_md': float(t.right_eye_md) if t.right_eye_md else None,
            'right_psd': float(t.right_eye_psd) if t.right_eye_psd else None,
            'right_vfi': float(t.right_eye_vfi) if t.right_eye_vfi else None,
            'left_md': float(t.left_eye_md) if t.left_eye_md else None,
            'left_psd': float(t.left_eye_psd) if t.left_eye_psd else None,
            'left_vfi': float(t.left_eye_vfi) if t.left_eye_vfi else None,
            'test_type': t.get_test_type_display() if t.test_type else '',
            'strategy': t.get_strategy_display() if t.strategy else '',
        })

    return Response({
        'patient_id': str(patient_id),
        'vf_points': md_points,
        'total_readings': len(md_points),
    })