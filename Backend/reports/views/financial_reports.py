"""
Financial reports - revenue analysis and billing
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.db.models import Count, Q, Sum
from django.utils import timezone
from datetime import timedelta
from patients.models import PatientVisit
from .report_utils import _get_int_param


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def revenue_analysis_report(request):
    """
    Revenue analysis report using PatientVisit billing data.

    Query params:
    - months: number of months to include (default 12)
    """
    try:
        from decimal import Decimal
        months = _get_int_param(request, 'months', 12, min_val=1, max_val=120)
        if isinstance(months, Response):
            return months

        cutoff_date = timezone.now().date() - timedelta(days=months * 30)
        visits = PatientVisit.objects.filter(scheduled_date__gte=cutoff_date)

        # --- Summary ---
        def to_float(val):
            return float(val) if val else 0.0

        total_billed = visits.aggregate(total=Sum('total_cost'))['total']
        total_collected = visits.filter(payment_status='paid').aggregate(total=Sum('total_cost'))['total']
        total_pending = visits.filter(payment_status='pending').aggregate(total=Sum('total_cost'))['total']
        total_insurance = visits.filter(payment_status='insurance_claim').aggregate(total=Sum('total_cost'))['total']

        summary = {
            'total_billed': to_float(total_billed),
            'total_collected': to_float(total_collected),
            'total_pending': to_float(total_pending),
            'total_insurance': to_float(total_insurance),
            'collection_rate': round(
                (to_float(total_collected) / to_float(total_billed) * 100)
                if total_billed else 0, 1
            ),
            'visit_count': visits.count(),
        }

        # --- Monthly trend ---
        from django.db.models.functions import TruncMonth
        monthly_qs = (
            visits.annotate(month=TruncMonth('scheduled_date'))
            .values('month')
            .annotate(
                billed=Sum('total_cost'),
                collected=Sum('total_cost', filter=Q(payment_status='paid')),
                pending=Sum('total_cost', filter=Q(payment_status='pending')),
                insurance=Sum('total_cost', filter=Q(payment_status='insurance_claim')),
                visit_count=Count('id'),
            )
            .order_by('month')
        )

        monthly_trend = [
            {
                'month': item['month'].strftime('%Y-%m'),
                'billed': to_float(item['billed']),
                'collected': to_float(item['collected']),
                'pending': to_float(item['pending']),
                'insurance': to_float(item['insurance']),
                'visit_count': item['visit_count'],
            }
            for item in monthly_qs
        ]

        # --- Payment status breakdown ---
        status_breakdown = list(
            visits.values('payment_status')
            .annotate(count=Count('id'), amount=Sum('total_cost'))
            .order_by('payment_status')
        )
        for row in status_breakdown:
            row['amount'] = to_float(row['amount'])

        # --- Revenue by visit type ---
        by_visit_type = list(
            visits.values('visit_type')
            .annotate(count=Count('id'), amount=Sum('total_cost'))
            .order_by('-amount')
        )
        for row in by_visit_type:
            row['amount'] = to_float(row['amount'])

        # --- Top treatment types by estimated cost (reference data) ---
        from treatments.models import TreatmentType, Treatment
        top_treatments = list(
            TreatmentType.objects.filter(
                estimated_cost_gbp__isnull=False,
                is_active=True
            ).annotate(
                completed_count=Count(
                    'treatments',
                    filter=Q(treatments__status='completed',
                             treatments__scheduled_date__gte=cutoff_date)
                )
            ).values('name', 'estimated_cost_gbp', 'completed_count')
            .order_by('-estimated_cost_gbp')[:10]
        )
        for row in top_treatments:
            row['estimated_cost_gbp'] = to_float(row['estimated_cost_gbp'])

        return Response({
            'success': True,
            'data': {
                'summary': summary,
                'monthly_trend': monthly_trend,
                'payment_status_breakdown': status_breakdown,
                'revenue_by_visit_type': by_visit_type,
                'top_treatments': top_treatments,
                'months_analysed': months,
            }
        })

    except Exception as e:
        return Response({'success': False, 'error': str(e)}, status=500)
