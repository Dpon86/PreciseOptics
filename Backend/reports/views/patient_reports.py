"""
Patient-focused reports - progress dashboard, visits, and medication tracking
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
from medications.models import Prescription, DrugAllergy, Medication, PrescriptionItem
from eye_tests.models import (
    VisualAcuityTest, VisualFieldTest, OCTScan, 
    RetinalAssessment, CataractAssessment, GlaucomaAssessment
)
from patients.models import Patient, PatientVisit
from audit.models import MedicationAudit, PatientAccessLog
from .report_utils import _get_int_param


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_visits_report(request):
    """
    Patient visits analysis report
    """
    try:
        date_range = _get_int_param(request, 'dateRange', 30, min_val=1, max_val=3650)
        if isinstance(date_range, Response):
            return date_range
        department_filter = request.GET.get('department', '')
        visit_type_filter = request.GET.get('visitType', '')
        
        end_date = timezone.now()
        start_date = end_date - timedelta(days=date_range)
        
        # Get visits within date range
        visits = PatientVisit.objects.filter(
            scheduled_date__range=[start_date, end_date]
        ).select_related('patient', 'primary_doctor')
        
        consultations = Consultation.objects.filter(
            scheduled_time__range=[start_date, end_date]
        ).select_related('patient', 'consulting_doctor')
        
        if visit_type_filter:
            consultations = consultations.filter(consultation_type=visit_type_filter)
        
        # Daily visits pattern (last 7 days)
        daily_visits = []
        days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
        for i in range(7):
            day_date = end_date - timedelta(days=6-i)
            day_visits = consultations.filter(
                scheduled_time__date=day_date.date()
            ).count()
            daily_visits.append(day_visits)
        
        # Visits by type
        consultation_types = consultations.values('consultation_type').annotate(
            count=Count('id')
        )
        
        visits_by_type = {}
        type_mapping = {
            'initial': 'Consultation',
            'follow_up': 'Follow-up', 
            'emergency': 'Emergency',
            'pre_operative': 'Surgery',
            'routine_check': 'Eye Test'
        }
        
        for ctype in consultation_types:
            readable_type = type_mapping.get(ctype['consultation_type'], ctype['consultation_type'])
            visits_by_type[readable_type] = ctype['count']
        
        # Monthly trends (last 12 months)
        monthly_data_2024 = []
        monthly_data_2025 = []
        month_labels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
        
        for month in range(1, 13):
            # 2024 data
            count_2024 = consultations.filter(
                scheduled_time__year=2024,
                scheduled_time__month=month
            ).count()
            monthly_data_2024.append(count_2024)
            
            # 2025 data (only up to current month)
            if month <= end_date.month:
                count_2025 = consultations.filter(
                    scheduled_time__year=2025,
                    scheduled_time__month=month
                ).count()
                monthly_data_2025.append(count_2025)
            else:
                monthly_data_2025.append(None)
        
        # Department visits (simulated departments)
        department_visits = {
            'Ophthalmology': consultations.filter(consultation_type='initial').count(),
            'Optometry': consultations.filter(consultation_type='routine_check').count(),
            'Surgery': consultations.filter(consultation_type='pre_operative').count(),
            'Emergency': consultations.filter(consultation_type='emergency').count(),
            'Pediatric': consultations.filter(patient__date_of_birth__gte=timezone.now() - timedelta(days=18*365)).count()
        }
        
        # Wait times distribution (simulated)
        total_visits = consultations.count()
        wait_times = {
            '< 15 min': int(total_visits * 0.25),
            '15-30 min': int(total_visits * 0.35),
            '30-45 min': int(total_visits * 0.20),
            '45-60 min': int(total_visits * 0.12),
            '> 60 min': int(total_visits * 0.08)
        }
        
        # Summary statistics
        total_visits_count = consultations.count()
        daily_average = total_visits_count / date_range
        
        return Response({
            'success': True,
            'data': {
                'dailyVisits': {
                    'labels': days,
                    'datasets': [{
                        'label': 'Total Visits',
                        'data': daily_visits,
                        'borderColor': 'rgb(75, 192, 192)',
                        'backgroundColor': 'rgba(75, 192, 192, 0.2)',
                        'fill': True
                    }]
                },
                'visitsByType': {
                    'labels': list(visits_by_type.keys()),
                    'datasets': [{
                        'data': list(visits_by_type.values()),
                        'backgroundColor': [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 205, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)'
                        ]
                    }]
                },
                'monthlyTrends': {
                    'labels': month_labels,
                    'datasets': [
                        {
                            'label': '2024',
                            'data': monthly_data_2024,
                            'borderColor': 'rgb(255, 99, 132)',
                            'backgroundColor': 'rgba(255, 99, 132, 0.2)'
                        },
                        {
                            'label': '2025',
                            'data': monthly_data_2025,
                            'borderColor': 'rgb(54, 162, 235)',
                            'backgroundColor': 'rgba(54, 162, 235, 0.2)'
                        }
                    ]
                },
                'departmentVisits': {
                    'labels': list(department_visits.keys()),
                    'datasets': [{
                        'label': 'Visits This Month',
                        'data': list(department_visits.values()),
                        'backgroundColor': [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 205, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)'
                        ]
                    }]
                },
                'waitTimes': {
                    'labels': list(wait_times.keys()),
                    'datasets': [{
                        'data': list(wait_times.values()),
                        'backgroundColor': [
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 205, 86, 0.8)',
                            'rgba(255, 159, 64, 0.8)',
                            'rgba(255, 99, 132, 0.8)'
                        ]
                    }]
                },
                'summaryStats': {
                    'totalVisits': total_visits_count,
                    'dailyAverage': round(daily_average, 1),
                    'avgWaitTime': 28,  # Simulated
                    'noShowRate': 7.2   # Simulated
                }
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_progress_dashboard(request, patient_id):
    """
    Individual patient progress dashboard
    """
    try:
        time_range = _get_int_param(request, 'timeRange', 180, min_val=1, max_val=3650)
        if isinstance(time_range, Response):
            return time_range
        end_date = timezone.now()
        start_date = end_date - timedelta(days=time_range)
        
        # Get patient
        try:
            patient = Patient.objects.get(id=patient_id)
        except Patient.DoesNotExist:
            return Response({
                'success': False,
                'error': 'Patient not found'
            }, status=404)
        
        # Get patient's eye tests
        glaucoma_tests = GlaucomaAssessment.objects.filter(
            patient=patient,
            test_date__range=[start_date, end_date]
        ).order_by('test_date')
        
        visual_acuity_tests = VisualAcuityTest.objects.filter(
            patient=patient,
            test_date__range=[start_date, end_date]
        ).order_by('test_date')
        
        # Get prescriptions
        prescriptions = Prescription.objects.filter(
            patient=patient,
            date_prescribed__range=[start_date, end_date]
        ).select_related('medication', 'prescribed_by')
        
        # IOP progress data
        iop_dates = [test.test_date.strftime('%b') for test in glaucoma_tests]
        right_eye_iop = [float(test.right_eye_iop) for test in glaucoma_tests if test.right_eye_iop]
        left_eye_iop = [float(test.left_eye_iop) for test in glaucoma_tests if test.left_eye_iop]
        
        if not iop_dates:
            # No real data available - provide empty structure
            iop_dates = ['No Data Available']
            right_eye_iop = [0]
            left_eye_iop = [0]
        
        # Visual acuity progress
        acuity_dates = [test.test_date.strftime('%b') for test in visual_acuity_tests]
        right_eye_acuity = [float(test.right_eye_acuity or 0.5) for test in visual_acuity_tests]
        left_eye_acuity = [float(test.left_eye_acuity or 0.5) for test in visual_acuity_tests]
        
        if not acuity_dates:
            # No real data available - provide empty structure
            acuity_dates = ['No Data Available']
            right_eye_acuity = [0]
            left_eye_acuity = [0]
        
        # Medication adherence (would need MedicationAdherence model)
        # For now, calculate from actual prescription data if available
        avg_adherence = 0  # No adherence data available without MedicationAdherence model
        
        # Create adherence distribution - only if we have adherence data
        if avg_adherence > 0:
            adherence_distribution = {
                'Excellent': 70 if avg_adherence >= 90 else 20,
                'Good': 20 if avg_adherence >= 70 else 50,
                'Fair': 8 if avg_adherence >= 50 else 25,
                'Poor': 2 if avg_adherence >= 50 else 5
            }
        else:
            adherence_distribution = {
                'Excellent': 0, 'Good': 0, 'Fair': 0, 'Poor': 0
            }
        
        # Test history
        test_history = []
        for test in glaucoma_tests[-5:]:  # Last 5 tests
            test_history.append({
                'date': test.test_date.strftime('%Y-%m-%d'),
                'test': 'Glaucoma Assessment (IOP)',
                'rightEye': f'{test.right_eye_iop} mmHg' if test.right_eye_iop else 'N/A',
                'leftEye': f'{test.left_eye_iop} mmHg' if test.left_eye_iop else 'N/A',
                'notes': test.notes or 'No notes available'
            })
        
        # Medications
        current_medications = []
        for prescription in prescriptions:
            # Adherence percentage (would need MedicationAdherence model)
            adherence_pct = 0  # No adherence data available
            
            current_medications.append({
                'name': prescription.medication.name,
                'dosage': prescription.dosage,
                'startDate': prescription.date_prescribed.strftime('%Y-%m-%d'),
                'adherence': adherence_pct,
                'sideEffects': 'Not documented'
            })
        
        if not current_medications:
            # No current medications available
            current_medications = []
        
        # Upcoming tests - would need to query scheduled appointments/tests
        upcoming_tests = []  # No upcoming test data available without appointment scheduling system
        
        return Response({
            'success': True,
            'data': {
                'patientInfo': {
                    'name': patient.get_full_name(),
                    'id': str(patient.id)[:8],  # Short ID
                    'age': patient.age,
                    'diagnosis': 'Not available',  # Would need to derive from consultations
                    'treatmentStartDate': prescriptions.first().date_prescribed.strftime('%Y-%m-%d') if prescriptions.first() else 'Not available',
                    'nextAppointment': 'Not scheduled'
                },
                'iopProgress': {
                    'labels': iop_dates,
                    'datasets': [
                        {
                            'label': 'Right Eye IOP (mmHg)',
                            'data': right_eye_iop,
                            'borderColor': 'rgb(255, 99, 132)',
                            'backgroundColor': 'rgba(255, 99, 132, 0.1)',
                            'tension': 0.4
                        },
                        {
                            'label': 'Left Eye IOP (mmHg)',
                            'data': left_eye_iop,
                            'borderColor': 'rgb(54, 162, 235)',
                            'backgroundColor': 'rgba(54, 162, 235, 0.1)',
                            'tension': 0.4
                        }
                    ]
                },
                'visualAcuityProgress': {
                    'labels': acuity_dates,
                    'datasets': [
                        {
                            'label': 'Right Eye Acuity',
                            'data': right_eye_acuity,
                            'borderColor': 'rgb(75, 192, 192)',
                            'backgroundColor': 'rgba(75, 192, 192, 0.1)'
                        },
                        {
                            'label': 'Left Eye Acuity',
                            'data': left_eye_acuity,
                            'borderColor': 'rgb(153, 102, 255)',
                            'backgroundColor': 'rgba(153, 102, 255, 0.1)'
                        }
                    ]
                },
                'medicationAdherence': {
                    'labels': list(adherence_distribution.keys()),
                    'datasets': [{
                        'data': list(adherence_distribution.values()),
                        'backgroundColor': [
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 205, 86, 0.8)',
                            'rgba(255, 99, 132, 0.8)'
                        ]
                    }]
                },
                'testHistory': test_history,
                'medications': current_medications,
                'upcomingTests': upcoming_tests
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def medication_patients_report(request):
    """
    Who received a specific medication or batch?
    Params:
      medication_id  — filter by exact medication UUID (optional)
      batch_number   — search all medications whose batch_number contains this string (optional)
    Returns: matching medications (batch checker) + full prescription rows with patient contact details.
    At least one of the two params must be supplied.
    """
    try:
        from medications.models import Medication, PrescriptionItem

        medication_id = request.GET.get('medication_id', '').strip()
        batch_number  = request.GET.get('batch_number', '').strip()

        if not medication_id and not batch_number:
            return Response({
                'success': True,
                'data': {'medications': [], 'prescriptions': [], 'summary': {
                    'total_medications': 0, 'total_prescriptions': 0, 'total_patients': 0,
                }}
            })

        # Find matching medications
        med_qs = Medication.objects.filter(approval_status=True)
        if medication_id:
            med_qs = med_qs.filter(id=medication_id)
        if batch_number:
            med_qs = med_qs.filter(batch_number__icontains=batch_number)

        medication_list = []
        for m in med_qs:
            medication_list.append({
                'id': str(m.id),
                'name': m.name,
                'generic_name': m.generic_name or '',
                'strength': m.strength or '',
                'batch_number': m.batch_number or '',
                'expiry_date': m.expiry_date.isoformat() if m.expiry_date else None,
                'current_stock': m.current_stock,
                'manufacturer': str(m.manufacturer_fk) if m.manufacturer_fk else m.manufacturer or '',
            })

        if not medication_list:
            return Response({
                'success': True,
                'data': {'medications': [], 'prescriptions': [], 'summary': {
                    'total_medications': 0, 'total_prescriptions': 0, 'total_patients': 0,
                }}
            })

        # Get prescription items for all matched medications
        items_qs = PrescriptionItem.objects.filter(
            medication__in=med_qs
        ).select_related(
            'medication',
            'prescription__patient',
            'prescription__prescribing_doctor',
        ).order_by('-prescription__date_prescribed')

        prescriptions = []
        seen_patients = {}

        for item in items_qs:
            p      = item.prescription.patient
            rx     = item.prescription
            doc    = rx.prescribing_doctor
            freq   = item.get_frequency_display() if hasattr(item, 'get_frequency_display') else item.frequency

            prescriptions.append({
                'patient_id':      str(p.id),
                'patient_ref':     p.patient_id,
                'patient_name':    f"{p.first_name} {p.last_name}",
                'date_of_birth':   p.date_of_birth.isoformat() if p.date_of_birth else None,
                'phone':           p.phone_number or '',
                'alternate_phone': p.alternate_phone or '',
                'email':           p.email or '',
                'address':         ' '.join(filter(None, [p.address_line_1, p.address_line_2])),
                'medication_name': item.medication.name,
                'medication_id':   str(item.medication.id),
                'batch_number':    item.medication.batch_number or '',
                'strength':        item.medication.strength or '',
                'dosage':          item.dosage or '',
                'frequency':       freq,
                'eye_side':        item.eye_side or '',
                'duration_days':   item.duration_days,
                'quantity_prescribed': item.quantity_prescribed,
                'special_instructions': item.special_instructions or '',
                'prescription_date': rx.date_prescribed.isoformat() if rx.date_prescribed else None,
                'prescribed_by':   doc.get_full_name() if doc else '',
                'prescription_id': str(rx.id),
            })

            seen_patients[str(p.id)] = True

        return Response({
            'success': True,
            'data': {
                'medications': medication_list,
                'prescriptions': prescriptions,
                'summary': {
                    'total_medications':  len(medication_list),
                    'total_prescriptions': len(prescriptions),
                    'total_patients':      len(seen_patients),
                },
            }
        })

    except Exception as e:
        import traceback
        return Response({'success': False, 'error': str(e), 'trace': traceback.format_exc()}, status=500)
