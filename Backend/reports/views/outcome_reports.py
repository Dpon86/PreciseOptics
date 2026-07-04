"""
Condition–Medication Outcome Report API.

Returns a breakdown of:
  - Which medications are prescribed to patients for each eye condition
  - Clinical outcome (average VA improvement from VisualAcuityTests)
  - Patient Reported Outcome Measures (PROMs) average scores
  - Side effect frequency and severity
  - Treatment satisfaction distribution

Endpoint: GET /api/reports/condition-medication-outcomes/
Query params:
  condition_code  – filter to a single condition code (AMD, RVO, GLAUCOMA, …)
  months          – lookback window in months (default 12, max 60)
"""
import logging
from collections import defaultdict
from datetime import timedelta

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone

from conditions.models import PatientCondition
from medications.models import Prescription, PrescriptionItem
from eye_tests.models import VisualAcuityTest
from patient_outcomes.models import PatientOutcomeReport
from .report_utils import _get_int_param

logger = logging.getLogger(__name__)

# ── Condition metadata ───────────────────────────────────────────────────────

CONDITION_META = {
    'AMD':           {'label': 'Age-Related Macular Degeneration', 'category': 'retinal',  'color': '#3B82F6'},
    'RVO':           {'label': 'Retinal Vein Occlusion',           'category': 'vascular', 'color': '#EF4444'},
    'GLAUCOMA':      {'label': 'Glaucoma',                         'category': 'glaucoma', 'color': '#10B981'},
    'DIABETIC_RET':  {'label': 'Diabetic Retinopathy',             'category': 'diabetic', 'color': '#F59E0B'},
    'CATARACT_POST': {'label': 'Post-Cataract Treatment',          'category': 'cataract', 'color': '#8B5CF6'},
}

# ── Helpers ──────────────────────────────────────────────────────────────────

def _logmar_to_snellen(logmar):
    """Very rough LOGMAR → descriptive text for display."""
    if logmar is None:
        return None
    if logmar <= 0.0:
        return '6/6 or better'
    if logmar <= 0.3:
        return '6/12'
    if logmar <= 0.5:
        return '6/18'
    if logmar <= 1.0:
        return '6/60'
    return 'CF or worse'


def _avg(values):
    filtered = [v for v in values if v is not None]
    return round(sum(filtered) / len(filtered), 2) if filtered else None


# ── Main view ────────────────────────────────────────────────────────────────

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def condition_medication_outcomes(request):
    """
    Aggregated view linking eye conditions → medications → outcomes.
    """
    try:
        months = _get_int_param(request, 'months', 12, min_val=1, max_val=60)
        if isinstance(months, Response):
            return months

        condition_code_filter = request.GET.get('condition_code', '').upper().strip()
        cutoff = timezone.now() - timedelta(days=months * 30)

        # ── 1. Determine which patient-condition pairs to analyse ──────
        pc_qs = PatientCondition.objects.filter(
            is_active=True,
            diagnosis_date__gte=cutoff.date(),
        ).select_related('condition', 'patient')

        if condition_code_filter and condition_code_filter in CONDITION_META:
            pc_qs = pc_qs.filter(condition__code=condition_code_filter)
        else:
            pc_qs = pc_qs.filter(condition__code__in=CONDITION_META.keys())

        # Build { condition_code: set of patient UUIDs }
        condition_patients = defaultdict(set)
        condition_label = {}
        for pc in pc_qs:
            code = pc.condition.code
            condition_patients[code].add(pc.patient_id)
            condition_label[code] = pc.condition.name

        # ── 2. Prescriptions & medications per condition ───────────────
        results = []

        for code, patient_ids in condition_patients.items():
            meta = CONDITION_META.get(code, {})

            # Prescriptions for these patients
            presc_items = PrescriptionItem.objects.filter(
                prescription__patient_id__in=patient_ids,
                prescription__date_prescribed__gte=cutoff,
            ).select_related('medication', 'prescription__patient')

            # Aggregate by medication
            med_map = defaultdict(lambda: {
                'patient_ids': set(),
                'prescription_count': 0,
            })
            for item in presc_items:
                med = item.medication
                if med:
                    key = str(med.id)
                    med_map[key]['name'] = med.name
                    med_map[key]['medication_type'] = getattr(med, 'medication_type', '')
                    med_map[key]['patient_ids'].add(str(item.prescription.patient_id))
                    med_map[key]['prescription_count'] += 1

            # ── 3. Clinical VA outcomes for these patients ─────────────
            va_tests = VisualAcuityTest.objects.filter(
                patient_id__in=patient_ids,
                test_date__gte=cutoff,
            ).values('patient_id', 'right_eye_logmar', 'left_eye_logmar', 'test_date').order_by('patient_id', 'test_date')

            # Per-patient: first vs latest VA score → improvement
            patient_va_first = {}
            patient_va_latest = {}
            for va in va_tests:
                pid = str(va['patient_id'])
                avg_logmar = _avg([va.get('right_eye_logmar'), va.get('left_eye_logmar')])
                if avg_logmar is None:
                    continue
                if pid not in patient_va_first:
                    patient_va_first[pid] = avg_logmar
                patient_va_latest[pid] = avg_logmar

            va_improvements = []
            for pid in patient_va_first:
                if pid in patient_va_latest:
                    delta = patient_va_first[pid] - patient_va_latest[pid]  # negative = better (LOGMAR)
                    va_improvements.append(round(delta, 3))

            avg_va_improvement = _avg(va_improvements)

            # ── 4. Patient Reported Outcomes (PROMs) ──────────────────
            pros = PatientOutcomeReport.objects.filter(
                patient_id__in=patient_ids,
                report_date__gte=cutoff.date(),
                is_active=True,
            )

            pro_count = pros.count()
            avg_vision_quality      = _avg(list(pros.values_list('vision_quality_score', flat=True)))
            avg_pain                = _avg(list(pros.values_list('pain_discomfort_score', flat=True)))
            avg_light_sensitivity   = _avg(list(pros.values_list('light_sensitivity_score', flat=True)))
            avg_daily_activities    = _avg(list(pros.values_list('daily_activities_score', flat=True)))
            avg_reading             = _avg(list(pros.values_list('reading_ability_score', flat=True)))

            # Satisfaction distribution
            satisfaction_dist = defaultdict(int)
            for sat in pros.values_list('treatment_satisfaction', flat=True):
                satisfaction_dist[sat] += 1

            # Side effect severity distribution
            side_effect_dist = defaultdict(int)
            for sev in pros.values_list('side_effect_severity', flat=True):
                side_effect_dist[sev] += 1

            # Most common side effects (free text word frequency - simple approach)
            side_effect_texts = [
                t for t in pros.exclude(side_effects_reported='').values_list('side_effects_reported', flat=True)
            ]

            # ── 5. Medication detail list ──────────────────────────────
            medications_list = []
            for med_id, med_data in med_map.items():
                # PROs linked to this medication's prescriptions
                med_pros = PatientOutcomeReport.objects.filter(
                    prescription__items__medication_id=med_id,
                    report_date__gte=cutoff.date(),
                    is_active=True,
                )
                medications_list.append({
                    'id': med_id,
                    'name': med_data['name'],
                    'medication_type': med_data['medication_type'],
                    'patient_count': len(med_data['patient_ids']),
                    'prescription_count': med_data['prescription_count'],
                    'avg_vision_quality': _avg(list(med_pros.values_list('vision_quality_score', flat=True))),
                    'avg_satisfaction_score': _satisfaction_to_score(
                        list(med_pros.values_list('treatment_satisfaction', flat=True))
                    ),
                    'side_effect_reports': med_pros.exclude(side_effects_reported='').count(),
                })

            # Sort by patient_count desc
            medications_list.sort(key=lambda x: x['patient_count'], reverse=True)

            results.append({
                'condition_code': code,
                'condition_name': condition_label.get(code, meta.get('label', code)),
                'color': meta.get('color', '#6B7280'),
                'patient_count': len(patient_ids),
                'medication_count': len(med_map),
                'medications': medications_list,
                'clinical_outcomes': {
                    'avg_logmar_improvement': avg_va_improvement,
                    'improvement_description': (
                        'Improving' if (avg_va_improvement or 0) > 0.05
                        else 'Stable' if (avg_va_improvement or 0) >= -0.05
                        else 'Declining'
                    ),
                    'patients_with_va_data': len(patient_va_first),
                },
                'patient_reported_outcomes': {
                    'total_questionnaires': pro_count,
                    'avg_vision_quality': avg_vision_quality,
                    'avg_pain_score': avg_pain,
                    'avg_light_sensitivity': avg_light_sensitivity,
                    'avg_daily_activities': avg_daily_activities,
                    'avg_reading_ability': avg_reading,
                    'satisfaction_distribution': dict(satisfaction_dist),
                    'side_effect_severity_distribution': dict(side_effect_dist),
                    'side_effect_free_text_count': len(side_effect_texts),
                },
            })

        # Sort by patient_count desc
        results.sort(key=lambda x: x['patient_count'], reverse=True)

        return Response({
            'success': True,
            'months': months,
            'condition_filter': condition_code_filter or 'all',
            'data': results,
        })

    except Exception as exc:
        logger.exception('condition_medication_outcomes error')
        return Response({'success': False, 'error': str(exc)}, status=500)


def _satisfaction_to_score(values):
    """Convert satisfaction string values to a numeric average (1–5 scale)."""
    mapping = {
        'very_satisfied': 5,
        'satisfied': 4,
        'neutral': 3,
        'dissatisfied': 2,
        'very_dissatisfied': 1,
    }
    scores = [mapping[v] for v in values if v in mapping]
    return _avg(scores)
