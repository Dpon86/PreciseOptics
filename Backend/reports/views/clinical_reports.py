"""
Clinical reports - disease-specific outcomes and follow-up alerts
"""
import random
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db import models
from django.db.models import Count, Avg, Q, F, Sum
from django.utils import timezone
from datetime import datetime, timedelta
from consultations.models import Consultation
from medications.models import PrescriptionItem
from patients.models import Patient
from .report_utils import _get_int_param


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def disease_specific_report(request):
    """
    Disease-specific outcomes report: patient counts, severity/status breakdown,
    monthly outcome trends, top medications, and patient list by condition category.
    """
    try:
        from conditions.models import PatientCondition, MedicalCondition, ConditionProgress

        category = request.GET.get('category', 'glaucoma')
        months = _get_int_param(request, 'months', 12, min_val=1, max_val=120)
        if isinstance(months, Response):
            return months
        cutoff_date = timezone.now().date() - timedelta(days=months * 30)

        # Map frontend aliases → DB category values
        category_map = {
            'amd': 'retinal',
            'rvo': 'vascular',
            'diabetic_retinopathy': 'diabetic',
            'glaucoma': 'glaucoma',
            'cataract': 'cataract',
        }
        db_category = category_map.get(category.lower(), category)

        patient_conditions = PatientCondition.objects.filter(
            condition__category=db_category,
            is_active=True
        ).select_related('patient', 'condition', 'diagnosed_by')

        total_patients = patient_conditions.count()

        severity_dist = list(
            patient_conditions.values('severity').annotate(count=Count('id'))
        )
        status_dist = list(
            patient_conditions.values('current_status').annotate(count=Count('id'))
        )
        eye_dist = list(
            patient_conditions.values('eye_affected').annotate(count=Count('id'))
        )

        # Monthly outcome trends from ConditionProgress
        progress_qs = ConditionProgress.objects.filter(
            patient_condition__in=patient_conditions,
            assessment_date__gte=cutoff_date
        ).values('assessment_date', 'status_change').order_by('assessment_date')

        monthly_outcomes = {}
        for record in progress_qs:
            month_key = record['assessment_date'].strftime('%Y-%m')
            if month_key not in monthly_outcomes:
                monthly_outcomes[month_key] = {
                    'month': month_key, 'improved': 0, 'stable': 0, 'worsened': 0
                }
            change = record['status_change']
            if change in ('improved', 'resolved'):
                monthly_outcomes[month_key]['improved'] += 1
            elif change == 'stable':
                monthly_outcomes[month_key]['stable'] += 1
            elif change in ('worsened', 'new_symptoms'):
                monthly_outcomes[month_key]['worsened'] += 1

        outcome_trends = sorted(monthly_outcomes.values(), key=lambda x: x['month'])

        total_progress = ConditionProgress.objects.filter(
            patient_condition__in=patient_conditions
        ).count()
        improved_count = ConditionProgress.objects.filter(
            patient_condition__in=patient_conditions,
            status_change__in=['improved', 'resolved']
        ).count()
        improvement_rate = round(
            (improved_count / total_progress * 100) if total_progress > 0 else 0, 1
        )

        # Top medications prescribed to patients with this condition
        patient_ids = patient_conditions.values_list('patient_id', flat=True)
        top_meds = list(
            PrescriptionItem.objects.filter(
                prescription__patient_id__in=patient_ids,
                prescription__date_prescribed__gte=cutoff_date
            ).values('medication__name', 'medication__generic_name')
            .annotate(count=Count('id'))
            .order_by('-count')[:10]
        )

        # Patient list (most recent 50 diagnoses)
        patient_list = []
        for pc in patient_conditions.order_by('-diagnosis_date')[:50]:
            latest = ConditionProgress.objects.filter(
                patient_condition=pc
            ).order_by('-assessment_date').first()
            patient_list.append({
                'id': str(pc.patient.id),
                'patient_name': pc.patient.get_full_name(),
                'patient_id': pc.patient.patient_id,
                'diagnosis_date': pc.diagnosis_date.isoformat() if pc.diagnosis_date else None,
                'severity': pc.severity,
                'current_status': pc.current_status,
                'eye_affected': pc.eye_affected,
                'last_assessment': pc.last_assessment_date.isoformat() if pc.last_assessment_date else None,
                'next_assessment': pc.next_assessment_date.isoformat() if pc.next_assessment_date else None,
                'latest_change': latest.status_change if latest else None,
                'progress_count': ConditionProgress.objects.filter(patient_condition=pc).count(),
                'days_since_diagnosis': (
                    (timezone.now().date() - pc.diagnosis_date).days
                    if pc.diagnosis_date else None
                ),
            })

        condition_obj = MedicalCondition.objects.filter(
            category=db_category, is_active=True
        ).first()
        new_diagnoses = patient_conditions.filter(diagnosis_date__gte=cutoff_date).count()

        return Response({
            'summary': {
                'total_patients': total_patients,
                'active_cases': patient_conditions.filter(
                    current_status__in=['active', 'newly_diagnosed', 'progressing']
                ).count(),
                'stable_cases': patient_conditions.filter(
                    current_status__in=['stable', 'managed']
                ).count(),
                'improving_cases': patient_conditions.filter(
                    current_status='improving'
                ).count(),
                'improvement_rate': improvement_rate,
                'new_diagnoses': new_diagnoses,
                'category': db_category,
                'display_name': (
                    condition_obj.name if condition_obj
                    else category.replace('_', ' ').title()
                ),
            },
            'severity_distribution': severity_dist,
            'status_distribution': status_dist,
            'eye_affected_distribution': eye_dist,
            'outcome_trends': outcome_trends,
            'top_medications': top_meds,
            'patient_list': patient_list,
        })

    except Exception as e:
        import traceback
        traceback.print_exc()
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def followup_alerts(request):
    """
    Aggregated follow-up alert feed across:
      - Eye tests (follow_up_required=True, follow_up_date set)
      - Treatments (requires_follow_up=True, status=completed)
      - Missed/overdue treatment follow-up appointments
      - Consultations (follow_up_required=True, completed, >30 days ago)
    Returns items sorted: overdue (oldest) → due_soon → upcoming.
    """
    try:
        from eye_tests.models import (
            VisualAcuityTest, RefractionTest, CataractAssessment,
            GlaucomaAssessment, VisualFieldTest, RetinalAssessment,
            DiabeticRetinopathyScreening, VitreoretinalAssessment,
            StrabismusAssessment, PediatricEyeExam, EyeCasualtyAssessment,
            CornealAssessment, OCTScan,
        )
        from treatments.models import Treatment, TreatmentFollowUp

        today = timezone.now().date()
        now_dt = timezone.now()
        soon_threshold = today + timedelta(days=14)

        alert_type = request.GET.get('type', '')
        urgency_filter = request.GET.get('urgency', '')
        patient_id = request.GET.get('patient', '')

        alerts = []

        # ── 1. Eye Test Follow-ups ─────────────────────────────────────────
        EYE_TEST_MODELS = [
            (VisualAcuityTest, 'Visual Acuity Test'),
            (RefractionTest, 'Refraction Test'),
            (CataractAssessment, 'Cataract Assessment'),
            (GlaucomaAssessment, 'Glaucoma Assessment'),
            (VisualFieldTest, 'Visual Field Test'),
            (RetinalAssessment, 'Retinal Assessment'),
            (DiabeticRetinopathyScreening, 'Diabetic Retinopathy Screening'),
            (VitreoretinalAssessment, 'Vitreoretinal Assessment'),
            (StrabismusAssessment, 'Strabismus Assessment'),
            (PediatricEyeExam, 'Pediatric Eye Exam'),
            (EyeCasualtyAssessment, 'Eye Casualty Assessment'),
            (CornealAssessment, 'Corneal Assessment'),
            (OCTScan, 'OCT Scan'),
        ]

        if not alert_type or alert_type == 'eye_test':
            for Model, model_label in EYE_TEST_MODELS:
                qs = Model.objects.filter(
                    follow_up_required=True,
                    follow_up_date__isnull=False
                ).select_related('patient', 'performed_by')
                if patient_id:
                    qs = qs.filter(patient_id=patient_id)

                for test in qs:
                    due = test.follow_up_date
                    if due <= today:
                        days_overdue = (today - due).days
                        item_urgency = 'overdue'
                        severity = 'critical' if days_overdue > 60 else 'high' if days_overdue > 14 else 'medium'
                    elif due <= soon_threshold:
                        item_urgency = 'due_soon'
                        severity = 'medium'
                    else:
                        item_urgency = 'upcoming'
                        severity = 'low'

                    if urgency_filter and urgency_filter != item_urgency:
                        continue

                    alerts.append({
                        'id': str(test.id),
                        'source_type': 'eye_test',
                        'source_label': model_label,
                        'patient_id': str(test.patient_id),
                        'patient_name': f"{test.patient.first_name} {test.patient.last_name}",
                        'title': f"{model_label} Follow-up",
                        'detail': test.recommendations or test.findings or '',
                        'due_date': due.isoformat(),
                        'urgency': item_urgency,
                        'severity': severity,
                        'days_overdue': (today - due).days if due < today else None,
                        'days_until_due': (due - today).days if due >= today else None,
                        'performed_by': test.performed_by.get_full_name() if test.performed_by else '',
                        'test_date': test.test_date.isoformat() if test.test_date else None,
                        'navigate_url': f'/eye-tests/{test.id}',
                    })

        # ── 2. Treatment Follow-ups due ────────────────────────────────────
        if not alert_type or alert_type == 'treatment':
            treatment_qs = Treatment.objects.filter(
                requires_follow_up=True,
                status='completed',
                actual_end_time__isnull=False,
                follow_up_weeks__isnull=False,
            ).select_related('patient', 'treatment_type', 'primary_surgeon')
            if patient_id:
                treatment_qs = treatment_qs.filter(patient_id=patient_id)

            for tr in treatment_qs:
                due_dt = tr.actual_end_time + timedelta(weeks=tr.follow_up_weeks)
                due = due_dt.date()

                # Skip if a completed follow-up visit already recorded
                if tr.follow_ups.filter(status='completed').exists():
                    continue

                if due <= today:
                    days_overdue = (today - due).days
                    item_urgency = 'overdue'
                    severity = 'critical' if days_overdue > 60 else 'high' if days_overdue > 14 else 'medium'
                elif due <= soon_threshold:
                    item_urgency = 'due_soon'
                    severity = 'medium'
                else:
                    item_urgency = 'upcoming'
                    severity = 'low'

                if urgency_filter and urgency_filter != item_urgency:
                    continue

                type_name = tr.treatment_type.name if tr.treatment_type else 'Treatment'
                alerts.append({
                    'id': str(tr.id),
                    'source_type': 'treatment',
                    'source_label': type_name,
                    'patient_id': str(tr.patient_id),
                    'patient_name': f"{tr.patient.first_name} {tr.patient.last_name}",
                    'title': f"{type_name} Follow-up",
                    'detail': tr.follow_up_instructions or '',
                    'due_date': due.isoformat(),
                    'urgency': item_urgency,
                    'severity': severity,
                    'days_overdue': (today - due).days if due < today else None,
                    'days_until_due': (due - today).days if due >= today else None,
                    'performed_by': tr.primary_surgeon.get_full_name() if tr.primary_surgeon else '',
                    'test_date': tr.actual_end_time.isoformat() if tr.actual_end_time else None,
                    'navigate_url': f'/treatments/{tr.id}',
                })

        # ── 3. Missed scheduled follow-up appointments ────────────────────
        if not alert_type or alert_type == 'missed_followup':
            missed_qs = TreatmentFollowUp.objects.filter(
                status='scheduled',
                scheduled_date__lt=now_dt,
            ).select_related('treatment__patient', 'treatment__treatment_type', 'assessed_by')
            if patient_id:
                missed_qs = missed_qs.filter(treatment__patient_id=patient_id)

            for fu in missed_qs:
                due = fu.scheduled_date.date() if hasattr(fu.scheduled_date, 'date') else fu.scheduled_date
                days_overdue = (today - due).days
                severity = 'critical' if days_overdue > 60 else 'high' if days_overdue > 14 else 'medium'

                if urgency_filter and urgency_filter != 'overdue':
                    continue

                tr = fu.treatment
                type_name = tr.treatment_type.name if tr.treatment_type else 'Treatment'
                alerts.append({
                    'id': str(fu.id),
                    'source_type': 'missed_followup',
                    'source_label': 'Missed Follow-up Appointment',
                    'patient_id': str(tr.patient_id),
                    'patient_name': f"{tr.patient.first_name} {tr.patient.last_name}",
                    'title': f"Missed: {type_name} Follow-up",
                    'detail': fu.additional_notes or '',
                    'due_date': due.isoformat(),
                    'urgency': 'overdue',
                    'severity': severity,
                    'days_overdue': days_overdue,
                    'days_until_due': None,
                    'performed_by': fu.assessed_by.get_full_name() if fu.assessed_by else '',
                    'test_date': None,
                    'navigate_url': f'/treatments/{tr.id}',
                })

        # ── 4. Consultation Follow-ups (no exact date — flag if >30 days old)
        if not alert_type or alert_type == 'consultation':
            overdue_cutoff = now_dt - timedelta(days=30)
            consult_qs = Consultation.objects.filter(
                follow_up_required=True,
                status='completed',
                actual_end_time__isnull=False,
                actual_end_time__lt=overdue_cutoff,
            ).select_related('patient', 'consulting_doctor')
            if patient_id:
                consult_qs = consult_qs.filter(patient_id=patient_id)

            for c in consult_qs:
                days_since = (now_dt - c.actual_end_time).days
                severity = 'critical' if days_since > 90 else 'high' if days_since > 60 else 'medium'

                if urgency_filter and urgency_filter not in ('overdue', ''):
                    continue

                type_label = c.consultation_type.replace('_', ' ').title()
                alerts.append({
                    'id': str(c.id),
                    'source_type': 'consultation',
                    'source_label': type_label,
                    'patient_id': str(c.patient_id),
                    'patient_name': f"{c.patient.first_name} {c.patient.last_name}",
                    'title': f"Consultation Follow-up — {type_label}",
                    'detail': c.follow_up_instructions or c.diagnosis_primary or '',
                    'due_date': None,
                    'urgency': 'overdue',
                    'severity': severity,
                    'days_overdue': days_since,
                    'days_until_due': None,
                    'performed_by': c.consulting_doctor.get_full_name() if c.consulting_doctor else '',
                    'test_date': c.actual_end_time.isoformat() if c.actual_end_time else None,
                    'navigate_url': f'/consultations/{c.id}',
                    'follow_up_duration': c.follow_up_duration or '',
                })

        # ── Sort: overdue (oldest first) → due_soon (nearest) → upcoming ─
        urgency_order = {'overdue': 0, 'due_soon': 1, 'upcoming': 2}

        def _sort_key(item):
            u = urgency_order.get(item['urgency'], 9)
            d = item['due_date'] or (item['test_date'][:10] if item.get('test_date') else '1900-01-01')
            return (u, d)

        alerts.sort(key=_sort_key)

        summary = {
            'total': len(alerts),
            'overdue': sum(1 for a in alerts if a['urgency'] == 'overdue'),
            'due_soon': sum(1 for a in alerts if a['urgency'] == 'due_soon'),
            'upcoming': sum(1 for a in alerts if a['urgency'] == 'upcoming'),
            'critical': sum(1 for a in alerts if a['severity'] == 'critical'),
        }

        return Response({'success': True, 'data': {'alerts': alerts, 'summary': summary}})

    except Exception as e:
        import traceback
        return Response({'success': False, 'error': str(e), 'trace': traceback.format_exc()}, status=500)
