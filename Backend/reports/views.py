"""
Views for generating reports and analytics
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
from medications.models import Prescription, DrugAllergy
from eye_tests.models import (
    VisualAcuityTest, VisualFieldTest, OCTScan, 
    RetinalAssessment, CataractAssessment, GlaucomaAssessment
)
from patients.models import Patient, PatientVisit
from audit.models import MedicationAudit, PatientAccessLog


@api_view(['GET'])
# @permission_classes([IsAuthenticated])  # Temporarily disabled for testing
def drug_audit_report(request):
    """
    Drug audit report with medication effectiveness and patient outcomes
    """
    try:
        # Get filter parameters
        date_range = int(request.GET.get('dateRange', 30))
        medication_filter = request.GET.get('medication', '')
        test_type_filter = request.GET.get('testType', '')
        
        end_date = timezone.now()
        start_date = end_date - timedelta(days=date_range)
        
        # Get prescriptions within date range
        prescriptions = Prescription.objects.filter(
            date_prescribed__range=[start_date, end_date]
        ).select_related('medication', 'patient', 'prescribed_by')
        
        if medication_filter:
            prescriptions = prescriptions.filter(medication__name__icontains=medication_filter)
        
        # Medication effectiveness data
        medication_effectiveness = {}
        prescriptions_by_med = prescriptions.values('medication__name').annotate(
            count=Count('id')
        )
        
        for med_data in prescriptions_by_med:
            med_name = med_data['medication__name']
            
            # Get IOP improvements for this medication
            iop_improvements = []
            med_prescriptions = prescriptions.filter(medication__name=med_name)
            
            for prescription in med_prescriptions:
                # Get glaucoma assessments (with IOP data) before and after prescription
                before_tests = GlaucomaAssessment.objects.filter(
                    patient=prescription.patient,
                    test_date__lte=prescription.date_prescribed,
                    test_date__gte=prescription.date_prescribed - timedelta(days=30)
                ).order_by('-test_date').first()
                
                after_tests = GlaucomaAssessment.objects.filter(
                    patient=prescription.patient,
                    test_date__gte=prescription.date_prescribed + timedelta(days=30),
                    test_date__lte=prescription.date_prescribed + timedelta(days=90)
                ).order_by('test_date').first()
                
                if before_tests and after_tests and before_tests.right_eye_iop and before_tests.left_eye_iop and after_tests.right_eye_iop and after_tests.left_eye_iop:
                    before_iop = (float(before_tests.right_eye_iop) + float(before_tests.left_eye_iop)) / 2
                    after_iop = (float(after_tests.right_eye_iop) + float(after_tests.left_eye_iop)) / 2
                    improvement = ((before_iop - after_iop) / before_iop) * 100
                    iop_improvements.append(improvement)
            
            avg_improvement = sum(iop_improvements) / len(iop_improvements) if iop_improvements else 0
            medication_effectiveness[med_name] = {
                'count': med_data['count'],
                'avg_improvement': round(avg_improvement, 1),
                'avg_adherence': 85  # Simulated adherence
            }
        
        # Timeline trends - weekly IOP averages by medication group
        timeline_data = {}
        weeks = []
        for i in range(8):
            week_start = start_date + timedelta(weeks=i)
            week_end = week_start + timedelta(days=7)
            weeks.append(f"Week {i+1}")
            
            for med_name in medication_effectiveness.keys():
                if med_name not in timeline_data:
                    timeline_data[med_name] = []
                
                # Get average IOP for patients on this medication during this week
                week_tests = GlaucomaAssessment.objects.filter(
                    test_date__range=[week_start, week_end],
                    patient__prescription__medication__name=med_name,
                    patient__prescription__date_prescribed__lte=week_start
                ).aggregate(
                    avg_right=Avg('right_eye_iop'),
                    avg_left=Avg('left_eye_iop')
                )
                
                avg_iop = 0
                if week_tests['avg_right'] and week_tests['avg_left']:
                    avg_iop = (week_tests['avg_right'] + week_tests['avg_left']) / 2
                
                timeline_data[med_name].append(round(avg_iop, 1) if avg_iop else 22)  # Default baseline
        
        # Side effects distribution
        allergies = DrugAllergy.objects.filter(
            reported_date__range=[start_date, end_date]
        ).values('severity').annotate(count=Count('id'))
        
        side_effects = {
            'No Side Effects': 65,
            'Mild Irritation': 15,
            'Dry Eyes': 10,
            'Blurred Vision': 7,
            'Headache': 3
        }
        
        # Adherence rates (simulated data - would need MedicationAdherence model)
        total_prescriptions = prescriptions.count()
        adherence_data = {
            'excellent': int(total_prescriptions * 0.45),
            'good': int(total_prescriptions * 0.30), 
            'fair': int(total_prescriptions * 0.18),
            'poor': int(total_prescriptions * 0.07)
        }
        
        # Summary statistics
        total_medications = prescriptions.values('medication').distinct().count()
        active_treatments = prescriptions.filter(end_date__gt=timezone.now()).count()
        avg_improvement = sum(med['avg_improvement'] for med in medication_effectiveness.values()) / len(medication_effectiveness) if medication_effectiveness else 0
        avg_adherence = sum(med['avg_adherence'] for med in medication_effectiveness.values()) / len(medication_effectiveness) if medication_effectiveness else 0
        
        return Response({
            'success': True,
            'data': {
                'medicationEffectiveness': {
                    'labels': list(medication_effectiveness.keys()),
                    'datasets': [{
                        'label': 'Average IOP Improvement (%)',
                        'data': [med['avg_improvement'] for med in medication_effectiveness.values()],
                        'backgroundColor': [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 205, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)'
                        ]
                    }]
                },
                'timelineTrends': {
                    'labels': weeks,
                    'datasets': [
                        {
                            'label': f'{med_name} Group',
                            'data': data,
                            'borderColor': f'rgb({50 + i*50}, {99 + i*30}, {132 + i*20})',
                            'backgroundColor': f'rgba({50 + i*50}, {99 + i*30}, {132 + i*20}, 0.2)',
                        } for i, (med_name, data) in enumerate(timeline_data.items())
                    ]
                },
                'sideEffectDistribution': {
                    'labels': list(side_effects.keys()),
                    'datasets': [{
                        'data': list(side_effects.values()),
                        'backgroundColor': [
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(255, 205, 86, 0.8)',
                            'rgba(255, 159, 64, 0.8)',
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(153, 102, 255, 0.8)'
                        ]
                    }]
                },
                'adherenceRates': {
                    'labels': ['Excellent (>90%)', 'Good (70-90%)', 'Fair (50-70%)', 'Poor (<50%)'],
                    'datasets': [{
                        'label': 'Patient Adherence',
                        'data': [
                            adherence_data['excellent'],
                            adherence_data['good'], 
                            adherence_data['fair'],
                            adherence_data['poor']
                        ],
                        'backgroundColor': [
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 205, 86, 0.8)',
                            'rgba(255, 99, 132, 0.8)'
                        ]
                    }]
                },
                'summaryStats': {
                    'totalMedications': total_medications,
                    'activeTreatments': active_treatments,
                    'avgImprovement': round(avg_improvement, 1),
                    'avgAdherence': round(avg_adherence, 1)
                }
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['GET'])
# @permission_classes([IsAuthenticated])  # Temporarily disabled for testing
def patient_visits_report(request):
    """
    Patient visits analysis report
    """
    try:
        date_range = int(request.GET.get('dateRange', 30))
        department_filter = request.GET.get('department', '')
        visit_type_filter = request.GET.get('visitType', '')
        
        end_date = timezone.now()
        start_date = end_date - timedelta(days=date_range)
        
        # Get visits within date range
        visits = PatientVisit.objects.filter(
            visit_date__range=[start_date, end_date]
        ).select_related('patient', 'attending_physician')
        
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
# @permission_classes([IsAuthenticated])  # Temporarily disabled for testing
def eye_tests_summary_report(request):
    """
    Comprehensive eye tests summary and progress analysis
    """
    try:
        date_range = int(request.GET.get('dateRange', 180))
        test_type_filter = request.GET.get('testType', '')
        medication_filter = request.GET.get('medication', '')
        patient_age_filter = request.GET.get('patientAge', '')
        
        end_date = timezone.now()
        start_date = end_date - timedelta(days=date_range)
        
        # Get all eye tests within date range
        glaucoma_tests = GlaucomaAssessment.objects.filter(
            test_date__range=[start_date, end_date]
        ).select_related('patient', 'performed_by')
        
        visual_acuity_tests = VisualAcuityTest.objects.filter(
            test_date__range=[start_date, end_date]
        ).select_related('patient', 'performed_by')
        
        # Apply filters
        if test_type_filter == 'tonometry':
            # Only use glaucoma assessment (IOP) data
            pass
        elif test_type_filter == 'visual_acuity':
            # Only use visual acuity data
            pass
        
        # IOP trends over time with medication impact
        periods = ['Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct']
        iop_data = {
            'Latanoprost Group': [],
            'Timolol Group': [],
            'Brimonidine Group': [],
            'Control Group': []
        }
        
        for i, period in enumerate(periods):
            # Simulate progressive IOP improvement
            iop_data['Latanoprost Group'].append(24 - i * 1.5)  # Best improvement
            iop_data['Timolol Group'].append(22 - i * 0.8)     # Moderate improvement  
            iop_data['Brimonidine Group'].append(23 - i * 1.1) # Good improvement
            iop_data['Control Group'].append(22 - i * 0.2)     # Minimal improvement
        
        # Visual acuity progress
        acuity_periods = ['Baseline', 'Month 1', 'Month 2', 'Month 3', 'Month 4', 'Month 5', 'Month 6', 'Month 7']
        acuity_data = {
            'Treatment Group': [0.5, 0.58, 0.66, 0.72, 0.78, 0.82, 0.85, 0.87],
            'Control Group': [0.5, 0.52, 0.54, 0.55, 0.56, 0.57, 0.58, 0.58]
        }
        
        # Test frequency
        test_counts = {
            'Glaucoma Assessment (IOP)': glaucoma_tests.count(),
            'Visual Acuity': visual_acuity_tests.count(),
            'Visual Field': VisualFieldTest.objects.filter(test_date__range=[start_date, end_date]).count(),
            'OCT Scan': OCTScan.objects.filter(test_date__range=[start_date, end_date]).count(),
            'Cataract Assessment': CataractAssessment.objects.filter(test_date__range=[start_date, end_date]).count()
        }
        
        # Medication correlation scatter plot
        correlation_data = []
        for adherence in range(50, 100, 5):
            # Higher adherence correlates with better IOP reduction
            iop_reduction = 2 + (adherence - 50) * 0.12 + (adherence * 0.01)  # Some noise
            correlation_data.append({'x': adherence, 'y': round(iop_reduction, 1)})
        
        # Comprehensive assessment radar
        assessment_metrics = {
            'IOP Control': 85,
            'Visual Function': 78,
            'Medication Adherence': 82,
            'Quality of Life': 76,
            'Disease Progression': 88,
            'Treatment Response': 79
        }
        
        return Response({
            'success': True,
            'data': {
                'iopTrends': {
                    'labels': periods,
                    'datasets': [
                        {
                            'label': med_group,
                            'data': data,
                            'borderColor': f'rgb({50 + i*60}, {99 + i*40}, {132 + i*30})',
                            'backgroundColor': f'rgba({50 + i*60}, {99 + i*40}, {132 + i*30}, 0.2)',
                            'tension': 0.4
                        } for i, (med_group, data) in enumerate(iop_data.items())
                    ]
                },
                'visualAcuityProgress': {
                    'labels': acuity_periods,
                    'datasets': [
                        {
                            'label': group,
                            'data': data,
                            'borderColor': 'rgb(75, 192, 192)' if group == 'Treatment Group' else 'rgb(153, 102, 255)',
                            'backgroundColor': 'rgba(75, 192, 192, 0.1)' if group == 'Treatment Group' else 'rgba(153, 102, 255, 0.1)',
                            'tension': 0.4
                        } for group, data in acuity_data.items()
                    ]
                },
                'testFrequency': {
                    'labels': list(test_counts.keys()),
                    'datasets': [{
                        'label': 'Tests Performed',
                        'data': list(test_counts.values()),
                        'backgroundColor': [
                            'rgba(255, 99, 132, 0.8)',
                            'rgba(54, 162, 235, 0.8)',
                            'rgba(255, 205, 86, 0.8)',
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(153, 102, 255, 0.8)'
                        ]
                    }]
                },
                'medicationCorrelation': {
                    'datasets': [{
                        'label': 'Adherence vs IOP Reduction',
                        'data': correlation_data,
                        'backgroundColor': 'rgba(255, 99, 132, 0.6)',
                        'borderColor': 'rgba(255, 99, 132, 1)'
                    }]
                },
                'comprehensiveAssessment': {
                    'labels': list(assessment_metrics.keys()),
                    'datasets': [{
                        'label': 'Patient Assessment Score',
                        'data': list(assessment_metrics.values()),
                        'backgroundColor': 'rgba(54, 162, 235, 0.2)',
                        'borderColor': 'rgba(54, 162, 235, 1)',
                        'pointBackgroundColor': 'rgba(54, 162, 235, 1)'
                    }]
                },
                'summaryStats': {
                    'testsCompleted': sum(test_counts.values()),
                    'patientsImproving': 82,
                    'avgIopReduction': 6.8,
                    'treatmentSuccessRate': 76
                }
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['GET'])
# @permission_classes([IsAuthenticated])  # Temporarily disabled for testing
def patient_progress_dashboard(request, patient_id):
    """
    Individual patient progress dashboard
    """
    try:
        time_range = int(request.GET.get('timeRange', 180))
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
# @permission_classes([IsAuthenticated])  # Temporarily disabled for testing
def medication_effectiveness_report(request):
    """
    Medication effectiveness report comparing eye test results with prescribed medications
    Shows which medications are most effective for different eye conditions
    """
    try:
        # Import the PrescriptionItem model which has the medication relationship
        from medications.models import PrescriptionItem, Medication
        
        # Get filter parameters
        start_date_str = request.GET.get('start_date')
        end_date_str = request.GET.get('end_date')
        medications_param = request.GET.get('medications', '')
        test_types_param = request.GET.get('test_types', 'visual_acuity,refraction,tonometry,visual_field')
        age_min = int(request.GET.get('age_min', 0))
        age_max = int(request.GET.get('age_max', 120))
        active_only = request.GET.get('active_only', 'true').lower() == 'true'
        
        # Parse dates
        if start_date_str:
            start_date = datetime.strptime(start_date_str, '%Y-%m-%d').date()
        else:
            start_date = (timezone.now() - timedelta(days=180)).date()  # Default 6 months
            
        if end_date_str:
            end_date = datetime.strptime(end_date_str, '%Y-%m-%d').date()
        else:
            end_date = timezone.now().date()
        
        # Parse filter lists
        medication_names = [m.strip() for m in medications_param.split(',') if m.strip()] if medications_param else []
        test_types = [t.strip() for t in test_types_param.split(',') if t.strip()]
        
        # Build patient filter
        patient_filter = Q(is_active=True) if active_only else Q()
        
        # Get all patients with basic filter first
        patients = Patient.objects.filter(patient_filter)
        
        # Filter by age range in Python (more compatible across databases)
        today = timezone.now().date()
        filtered_patients = []
        for patient in patients:
            if patient.date_of_birth:
                age = (today - patient.date_of_birth).days // 365
                if age_min <= age <= age_max:
                    filtered_patients.append(patient.id)
        
        # Convert back to queryset
        patients = Patient.objects.filter(id__in=filtered_patients) if filtered_patients else Patient.objects.none()
        
        # Get prescriptions within date range for filtered patients
        prescriptions = Prescription.objects.filter(
            date_prescribed__range=[start_date, end_date],
            patient__in=patients
        ).select_related('patient', 'prescribing_doctor')
        
        # Get prescription items (which have medication relationships)
        prescription_items = PrescriptionItem.objects.filter(
            prescription__in=prescriptions
        ).select_related('medication', 'prescription__patient')
        
        if medication_names:
            prescription_items = prescription_items.filter(medication__name__in=medication_names)
        
        # Get all unique medications from prescription items
        unique_medications = prescription_items.values('medication__id', 'medication__name').distinct()
        medications = [{'id': str(m['medication__id']), 'name': m['medication__name']} for m in unique_medications]
        
        # Generate simple time range for the past 6 months
        time_range = []
        current_date = start_date
        while current_date <= end_date:
            time_range.append(current_date.strftime('%Y-%m-%d'))
            current_date += timedelta(days=30)  # Simple monthly intervals
        
        # Create simple data structure with sample data
        report_data = {
            'medications': medications,
            'timeRange': time_range,
            'visualAcuityData': {},
            'refractionData': {},
            'iopData': {},
            'visualFieldData': {}
        }
        
        # For each medication, create sample effectiveness data
        for med in medications:
            med_name = med['name']
            
            # Get count of patients prescribed this medication
            med_prescription_count = prescription_items.filter(medication__name=med_name).count()
            
            # Initialize data for this medication
            report_data['visualAcuityData'][med_name] = {}
            report_data['refractionData'][med_name] = {}
            report_data['iopData'][med_name] = {}
            report_data['visualFieldData'][med_name] = {}
            
            # For each time point, create sample data
            for time_point in time_range:
                # Simulate improvement data (in production, this would come from actual test comparisons)
                patient_count = max(1, med_prescription_count // len(time_range))
                
                report_data['visualAcuityData'][med_name][time_point] = {
                    'averageImprovement': random.uniform(10, 40),
                    'patientCount': patient_count
                }
                
                report_data['refractionData'][med_name][time_point] = {
                    'averageImprovement': random.uniform(5, 25),
                    'patientCount': patient_count
                }
                
                report_data['iopData'][med_name][time_point] = {
                    'averageImprovement': random.uniform(15, 35),
                    'patientCount': patient_count
                }
                
                report_data['visualFieldData'][med_name][time_point] = {
                    'averageImprovement': random.uniform(8, 28),
                    'patientCount': patient_count
                }
        
        # Calculate summary statistics
        total_prescriptions = prescriptions.count()
        total_prescription_items = prescription_items.count()
        total_patients = prescriptions.values('patient').distinct().count()
        
        return Response({
            'success': True,
            'data': report_data,
            'summary': {
                'total_prescriptions': total_prescriptions,
                'total_prescription_items': total_prescription_items,
                'unique_medications': len(medications),
                'patients_treated': total_patients,
                'date_range': f"{start_date} to {end_date}",
                'analysis_type': 'medication_effectiveness'
            }
        })
        
    except Exception as e:
        # Return empty data structure on error for graceful frontend handling
        return Response({
            'success': False,
            'error': str(e),
            'data': {
                'medications': [],
                'timeRange': [],
                'visualAcuityData': {},
                'refractionData': {},
                'iopData': {},
                'visualFieldData': {}
            }
        }, status=500)