"""
Injection audit report — answers batch-traceability questions for clinical audit.
"Which patients received batch X?" / "Show all injections for drug Y between dates Z."
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Min, Max
from treatments.models import IntravitrealInjectionRecord


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def injection_audit_report(request):
    """
    Audit report for intravitreal injections.

    Query params:
        drug_name    — filter by drug (case-insensitive partial match)
        batch_number — filter by batch (case-insensitive partial match)
        date_from    — ISO date string (YYYY-MM-DD)
        date_to      — ISO date string (YYYY-MM-DD)
        clinician    — filter by treating clinician ID
        patient_id   — filter by patient ID

    Returns:
        {
            "filters": { ... },
            "total_records": int,
            "records": [ ... ],
            "summary": {
                "by_drug": { ... },
                "by_batch": { ... },
                "adverse_event_count": int,
                "date_range": { "earliest": ..., "latest": ... }
            }
        }
    """
    qs = IntravitrealInjectionRecord.objects.select_related(
        'patient', 'treating_clinician'
    ).order_by('-injection_date')

    # Apply filters
    drug_name = request.query_params.get('drug_name', '').strip()
    batch_number = request.query_params.get('batch_number', '').strip()
    date_from = request.query_params.get('date_from')
    date_to = request.query_params.get('date_to')
    clinician = request.query_params.get('clinician')
    patient_id = request.query_params.get('patient_id')

    if drug_name:
        qs = qs.filter(drug_name__icontains=drug_name)
    if batch_number:
        qs = qs.filter(batch_number__icontains=batch_number)
    if date_from:
        qs = qs.filter(injection_date__date__gte=date_from)
    if date_to:
        qs = qs.filter(injection_date__date__lte=date_to)
    if clinician:
        qs = qs.filter(treating_clinician_id=clinician)
    if patient_id:
        qs = qs.filter(patient_id=patient_id)

    # Aggregate summary
    summary = {
        'by_drug': {},
        'by_batch': {},
        'adverse_event_count': qs.filter(adverse_event=True).count(),
    }
    for item in qs.values('drug_name').annotate(count=Count('id')):
        summary['by_drug'][item['drug_name']] = item['count']
    for item in qs.values('batch_number').annotate(count=Count('id')):
        summary['by_batch'][item['batch_number']] = item['count']

    agg = qs.aggregate(earliest=Min('injection_date'), latest=Max('injection_date'))
    summary['date_range'] = {
        'earliest': agg['earliest'].isoformat() if agg['earliest'] else None,
        'latest': agg['latest'].isoformat() if agg['latest'] else None,
    }

    # Serialize records
    records = []
    for inj in qs:
        records.append({
            'id': str(inj.id),
            'patient_id': str(inj.patient_id),
            'patient_name': inj.patient.get_full_name(),
            'patient_nhs': inj.patient.nhs_number or '',
            'drug_name': inj.drug_name,
            'batch_number': inj.batch_number,
            'injection_number': inj.injection_number,
            'phase': inj.phase,
            'phase_display': inj.get_phase_display(),
            'eye': inj.eye,
            'eye_display': inj.get_eye_display(),
            'injection_date': inj.injection_date.isoformat(),
            'treating_clinician_name': inj.treating_clinician.get_full_name(),
            'adverse_event': inj.adverse_event,
            'adverse_event_description': inj.adverse_event_description or '',
            'days_since_last_injection': inj.days_since_last_injection,
        })

    return Response({
        'filters': {
            'drug_name': drug_name or None,
            'batch_number': batch_number or None,
            'date_from': date_from,
            'date_to': date_to,
            'clinician': clinician,
            'patient_id': patient_id,
        },
        'total_records': len(records),
        'records': records,
        'summary': summary,
    })