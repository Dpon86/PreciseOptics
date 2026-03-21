"""
Treatment and Medication Effectiveness Report API
Tracks patient outcomes from onset of treatment/medication
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Q, Min
from datetime import datetime, timedelta
from collections import defaultdict

from treatments.models import Treatment, TreatmentType
from medications.models import Medication, Prescription, PrescriptionItem
from eye_tests.models import (
    VisualAcuityTest, GlaucomaAssessment, OCTScan, 
    DiabeticRetinopathyScreening, VisualFieldTest, RefractionTest
)
from patients.models import Patient
from consultations.models import Consultation


@api_view(['GET'])
@permission_classes([AllowAny])
def treatment_effectiveness_timeline(request):
    """
    Analyze treatment effectiveness by tracking eye test results from treatment onset
    
    Query params:
    - treatment_type: Filter by specific treatment type
    - patient_id: Filter by specific patient
    - test_type: Filter by specific eye test type
    - months: Number of months to track (default 12)
    """
    try:
        treatment_type_filter = request.GET.get('treatment_type', '')
        patient_id = request.GET.get('patient_id', '')
        condition_filter = request.GET.get('condition', '')
        test_type_filter = request.GET.get('test_type', 'all')
        months = int(request.GET.get('months', 12))
        
        # Get all treatments with their first occurrence per patient
        treatments_query = Treatment.objects.select_related(
            'patient', 'treatment_type', 'primary_surgeon'
        ).filter(
            status='completed'
        ).order_by('patient', 'scheduled_date')
        
        if treatment_type_filter:
            treatments_query = treatments_query.filter(
                treatment_type__name__icontains=treatment_type_filter
            )
        
        if patient_id:
            treatments_query = treatments_query.filter(patient_id=patient_id)
        
        if condition_filter:
            from conditions.models import PatientCondition
            condition_category_map = {
                'amd': 'retinal', 'rvo': 'vascular',
                'diabetic_retinopathy': 'diabetic',
                'glaucoma': 'glaucoma', 'cataract': 'cataract',
            }
            db_category = condition_category_map.get(condition_filter.lower(), condition_filter)
            condition_patient_ids = list(PatientCondition.objects.filter(
                condition__category=db_category, is_active=True
            ).values_list('patient_id', flat=True))
            treatments_query = treatments_query.filter(patient_id__in=condition_patient_ids)
        
        # Group treatments by patient and treatment type
        patient_treatments = defaultdict(lambda: defaultdict(list))
        for treatment in treatments_query:
            key = f"{treatment.treatment_type.name}"
            patient_treatments[str(treatment.patient.id)][key].append({
                'id': str(treatment.id),
                'treatment_type': treatment.treatment_type.name,
                'date': treatment.scheduled_date.isoformat() if hasattr(treatment.scheduled_date, 'isoformat') else str(treatment.scheduled_date),
                'eye_treated': treatment.eye_treated,
                'indication': treatment.indication,
                'outcome': treatment.outcome,
                'surgeon': treatment.primary_surgeon.get_full_name() if treatment.primary_surgeon else 'Unknown'
            })
        
        # Get eye test models based on filter
        test_models = {
            'visual_acuity': VisualAcuityTest,
            'glaucoma': GlaucomaAssessment,
            'oct': OCTScan,
            'diabetic_retinopathy': DiabeticRetinopathyScreening,
            'visual_field': VisualFieldTest,
            'refraction': RefractionTest
        }
        
        if test_type_filter != 'all' and test_type_filter in test_models:
            test_models = {test_type_filter: test_models[test_type_filter]}
        
        # Build timeline data for each patient-treatment combination
        timeline_data = []
        
        for patient_id_str, treatment_types in patient_treatments.items():
            patient = Patient.objects.get(id=patient_id_str)
            
            for treatment_type_name, treatment_list in treatment_types.items():
                # Get first treatment date as baseline
                first_treatment = min(treatment_list, key=lambda x: x['date'])
                baseline_date = datetime.fromisoformat(first_treatment['date'].replace('Z', '+00:00'))
                
                # Collect all test results for this patient
                test_timeline = []
                
                for test_name, TestModel in test_models.items():
                    tests = TestModel.objects.filter(
                        patient_id=patient_id_str
                    ).order_by('test_date')
                    
                    for test in tests:
                        test_date = test.test_date
                        if not hasattr(test_date, 'date'):
                            continue
                            
                        # Calculate days from treatment onset
                        # Convert both to date objects to avoid datetime/date subtraction issues
                        test_date_only = test_date.date() if hasattr(test_date, 'date') else test_date
                        days_from_onset = (test_date_only - baseline_date.date()).days
                        
                        # Only include tests within the specified months window
                        if -30 <= days_from_onset <= (months * 30):
                            test_data = {
                                'test_id': str(test.id),
                                'test_type': test_name,
                                'test_date': test_date.isoformat(),
                                'days_from_onset': days_from_onset,
                                'weeks_from_onset': round(days_from_onset / 7, 1),
                                'months_from_onset': round(days_from_onset / 30, 1),
                            }
                            
                            # Extract relevant metrics based on test type
                            if test_name == 'visual_acuity':
                                test_data.update({
                                    'va_right': test.visual_acuity_od,
                                    'va_left': test.visual_acuity_os,
                                    'notes': test.notes if hasattr(test, 'notes') else ''
                                })
                            elif test_name == 'glaucoma':
                                test_data.update({
                                    'iop_right': test.intraocular_pressure_od,
                                    'iop_left': test.intraocular_pressure_os,
                                    'cup_disc_ratio_right': test.cup_disc_ratio_od,
                                    'cup_disc_ratio_left': test.cup_disc_ratio_os
                                })
                            elif test_name == 'oct':
                                test_data.update({
                                    'retinal_thickness_right': test.retinal_thickness_od,
                                    'retinal_thickness_left': test.retinal_thickness_os,
                                    'findings': test.findings if hasattr(test, 'findings') else ''
                                })
                            elif test_name == 'diabetic_retinopathy':
                                test_data.update({
                                    'severity_right': test.severity_od if hasattr(test, 'severity_od') else '',
                                    'severity_left': test.severity_os if hasattr(test, 'severity_os') else '',
                                    'findings': test.findings if hasattr(test, 'findings') else ''
                                })
                            
                            test_timeline.append(test_data)
                
                # Sort timeline by days from onset
                test_timeline.sort(key=lambda x: x['days_from_onset'])
                
                timeline_data.append({
                    'patient_id': patient_id_str,
                    'patient_name': f"{patient.first_name} {patient.last_name}",
                    'patient_mrn': patient.patient_id,
                    'treatment_type': treatment_type_name,
                    'first_treatment_date': first_treatment['date'],
                    'total_treatments': len(treatment_list),
                    'treatments': treatment_list,
                    'test_timeline': test_timeline,
                    'baseline_test': test_timeline[0] if test_timeline else None,
                    'latest_test': test_timeline[-1] if test_timeline else None
                })
        
        return Response({
            'success': True,
            'data': {
                'timelines': timeline_data,
                'summary': {
                    'total_patients': len(patient_treatments),
                    'total_timelines': len(timeline_data),
                    'months_tracked': months
                }
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def medication_effectiveness_timeline(request):
    """
    Analyze medication effectiveness by tracking eye test results from medication onset
    
    Query params:
    - medication: Filter by specific medication name
    - patient_id: Filter by specific patient
    - test_type: Filter by specific eye test type
    - months: Number of months to track (default 12)
    - include_batch: Include batch information (default true)
    """
    try:
        medication_filter = request.GET.get('medication', '')
        patient_id = request.GET.get('patient_id', '')
        condition_filter = request.GET.get('condition', '')
        test_type_filter = request.GET.get('test_type', 'all')
        months = int(request.GET.get('months', 12))
        include_batch = request.GET.get('include_batch', 'true').lower() == 'true'
        
        # Get all prescriptions with medication details
        prescriptions_query = Prescription.objects.select_related(
            'patient', 'prescribing_doctor'
        ).prefetch_related('items__medication').filter(
            status='active'
        ).order_by('patient', 'date_prescribed')
        
        if medication_filter:
            prescriptions_query = prescriptions_query.filter(
                items__medication__name__icontains=medication_filter
            )
        
        if patient_id:
            prescriptions_query = prescriptions_query.filter(patient_id=patient_id)
        
        if condition_filter:
            from conditions.models import PatientCondition
            condition_category_map = {
                'amd': 'retinal', 'rvo': 'vascular',
                'diabetic_retinopathy': 'diabetic',
                'glaucoma': 'glaucoma', 'cataract': 'cataract',
            }
            db_category = condition_category_map.get(condition_filter.lower(), condition_filter)
            condition_patient_ids = list(PatientCondition.objects.filter(
                condition__category=db_category, is_active=True
            ).values_list('patient_id', flat=True))
            prescriptions_query = prescriptions_query.filter(patient_id__in=condition_patient_ids)
        
        # Group prescriptions by patient and medication
        patient_medications = defaultdict(lambda: defaultdict(list))
        for prescription in prescriptions_query:
            for item in prescription.items.all():
                medication_key = item.medication.name
                if include_batch and hasattr(item.medication, 'batch_number'):
                    medication_key = f"{item.medication.name} (Batch: {item.medication.batch_number})"
                
                patient_medications[str(prescription.patient.id)][medication_key].append({
                    'prescription_id': str(prescription.id),
                    'medication_name': item.medication.name,
                    'batch_number': getattr(item.medication, 'batch_number', 'N/A'),
                    'date_prescribed': prescription.date_prescribed.isoformat(),
                    'dosage': item.dosage,
                    'frequency': item.frequency,
                    'duration_days': item.duration_days if hasattr(item, 'duration_days') else None,
                    'doctor': prescription.prescribing_doctor.get_full_name() if prescription.prescribing_doctor else 'Unknown'
                })
        
        # Get eye test models
        test_models = {
            'visual_acuity': VisualAcuityTest,
            'glaucoma': GlaucomaAssessment,
            'oct': OCTScan,
            'diabetic_retinopathy': DiabeticRetinopathyScreening,
            'visual_field': VisualFieldTest,
            'refraction': RefractionTest
        }
        
        if test_type_filter != 'all' and test_type_filter in test_models:
            test_models = {test_type_filter: test_models[test_type_filter]}
        
        # Build timeline data for each patient-medication combination
        timeline_data = []
        
        for patient_id_str, medications in patient_medications.items():
            patient = Patient.objects.get(id=patient_id_str)
            
            for medication_key, prescription_list in medications.items():
                # Get first prescription date as baseline
                first_prescription = min(prescription_list, key=lambda x: x['date_prescribed'])
                baseline_date = datetime.fromisoformat(first_prescription['date_prescribed'].replace('Z', '+00:00'))
                
                # Collect all test results for this patient
                test_timeline = []
                
                for test_name, TestModel in test_models.items():
                    tests = TestModel.objects.filter(
                        patient_id=patient_id_str
                    ).order_by('test_date')
                    
                    for test in tests:
                        test_date = test.test_date
                        if not hasattr(test_date, 'date'):
                            test_date = test_date  # Already a date
                        else:
                            test_date = test_date.date()
                            
                        # Calculate days from medication onset
                        days_from_onset = (test_date - baseline_date.date()).days
                        
                        # Only include tests within the specified months window
                        if -30 <= days_from_onset <= (months * 30):
                            test_data = {
                                'test_id': str(test.id),
                                'test_type': test_name,
                                'test_date': test_date.isoformat(),
                                'days_from_onset': days_from_onset,
                                'weeks_from_onset': round(days_from_onset / 7, 1),
                                'months_from_onset': round(days_from_onset / 30, 1),
                            }
                            
                            # Extract relevant metrics
                            if test_name == 'visual_acuity':
                                test_data.update({
                                    'va_right': test.visual_acuity_od,
                                    'va_left': test.visual_acuity_os,
                                })
                            elif test_name == 'glaucoma':
                                test_data.update({
                                    'iop_right': test.intraocular_pressure_od,
                                    'iop_left': test.intraocular_pressure_os,
                                })
                            elif test_name == 'oct':
                                test_data.update({
                                    'retinal_thickness_right': test.retinal_thickness_od,
                                    'retinal_thickness_left': test.retinal_thickness_os,
                                })
                            
                            test_timeline.append(test_data)
                
                # Sort timeline by days from onset
                test_timeline.sort(key=lambda x: x['days_from_onset'])
                
                timeline_data.append({
                    'patient_id': patient_id_str,
                    'patient_name': f"{patient.first_name} {patient.last_name}",
                    'patient_mrn': patient.patient_id,
                    'medication': medication_key,
                    'first_prescription_date': first_prescription['date_prescribed'],
                    'total_prescriptions': len(prescription_list),
                    'prescriptions': prescription_list,
                    'test_timeline': test_timeline,
                    'baseline_test': test_timeline[0] if test_timeline else None,
                    'latest_test': test_timeline[-1] if test_timeline else None
                })
        
        return Response({
            'success': True,
            'data': {
                'timelines': timeline_data,
                'summary': {
                    'total_patients': len(patient_medications),
                    'total_timelines': len(timeline_data),
                    'months_tracked': months,
                    'includes_batch_info': include_batch
                }
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def compare_treatments(request):
    """
    Compare effectiveness between different treatment types
    
    Query params:
    - treatment_types: Comma-separated list of treatment types to compare
    - test_type: Specific eye test type to analyze
    - months: Number of months to track
    """
    try:
        treatment_types_param = request.GET.get('treatment_types', '')
        test_type = request.GET.get('test_type', 'visual_acuity')
        months = int(request.GET.get('months', 12))
        condition_filter = request.GET.get('condition', '')
        
        if not treatment_types_param:
            return Response({
                'success': False,
                'error': 'Please provide treatment_types parameter'
            }, status=400)
        
        treatment_types = [t.strip() for t in treatment_types_param.split(',')]
        
        # Get treatment effectiveness for each type
        comparison_data = []
        
        for treatment_type_name in treatment_types:
            # Get timeline data for this treatment type
            timeline_request = type('Request', (), {
                'GET': {
                    'treatment_type': treatment_type_name,
                    'test_type': test_type,
                    'months': months,
                    'condition': condition_filter
                }
            })()
            
            response = treatment_effectiveness_timeline(timeline_request)
            if response.status_code == 200:
                timelines = response.data['data']['timelines']
                
                # Calculate improvement metrics
                total_patients = len(timelines)
                improvements = 0
                deteriorations = 0
                stable = 0
                
                for timeline in timelines:
                    if timeline['baseline_test'] and timeline['latest_test']:
                        baseline = timeline['baseline_test']
                        latest = timeline['latest_test']
                        
                        # Compare based on test type
                        if test_type == 'visual_acuity':
                            # Higher VA is better (simplified comparison)
                            if latest.get('va_right', '') > baseline.get('va_right', ''):
                                improvements += 1
                            elif latest.get('va_right', '') < baseline.get('va_right', ''):
                                deteriorations += 1
                            else:
                                stable += 1
                        elif test_type == 'glaucoma':
                            # Lower IOP is better
                            baseline_iop = baseline.get('iop_right', 999)
                            latest_iop = latest.get('iop_right', 999)
                            if latest_iop < baseline_iop:
                                improvements += 1
                            elif latest_iop > baseline_iop:
                                deteriorations += 1
                            else:
                                stable += 1
                
                comparison_data.append({
                    'treatment_type': treatment_type_name,
                    'total_patients': total_patients,
                    'improvements': improvements,
                    'deteriorations': deteriorations,
                    'stable': stable,
                    'improvement_rate': round((improvements / total_patients * 100), 2) if total_patients > 0 else 0,
                    'deterioration_rate': round((deteriorations / total_patients * 100), 2) if total_patients > 0 else 0
                })
        
        return Response({
            'success': True,
            'data': {
                'comparison': comparison_data,
                'test_type_analyzed': test_type,
                'months_tracked': months
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])
def compare_medications(request):
    """
    Compare effectiveness between different medications
    
    Query params:
    - medications: Comma-separated list of medications to compare
    - test_type: Specific eye test type to analyze
    - months: Number of months to track
    """
    try:
        medications_param = request.GET.get('medications', '')
        test_type = request.GET.get('test_type', 'visual_acuity')
        months = int(request.GET.get('months', 12))
        condition_filter = request.GET.get('condition', '')
        
        if not medications_param:
            return Response({
                'success': False,
                'error': 'Please provide medications parameter'
            }, status=400)
        
        medications = [m.strip() for m in medications_param.split(',')]
        
        # Get medication effectiveness for each one
        comparison_data = []
        
        for medication_name in medications:
            # Get timeline data for this medication
            timeline_request = type('Request', (), {
                'GET': {
                    'medication': medication_name,
                    'test_type': test_type,
                    'months': months,
                    'condition': condition_filter
                }
            })()
            
            response = medication_effectiveness_timeline(timeline_request)
            if response.status_code == 200:
                timelines = response.data['data']['timelines']
                
                # Calculate improvement metrics
                total_patients = len(timelines)
                improvements = 0
                deteriorations = 0
                stable = 0
                
                for timeline in timelines:
                    if timeline['baseline_test'] and timeline['latest_test']:
                        baseline = timeline['baseline_test']
                        latest = timeline['latest_test']
                        
                        # Compare based on test type
                        if test_type == 'visual_acuity':
                            if latest.get('va_right', '') > baseline.get('va_right', ''):
                                improvements += 1
                            elif latest.get('va_right', '') < baseline.get('va_right', ''):
                                deteriorations += 1
                            else:
                                stable += 1
                        elif test_type == 'glaucoma':
                            baseline_iop = baseline.get('iop_right', 999)
                            latest_iop = latest.get('iop_right', 999)
                            if latest_iop < baseline_iop:
                                improvements += 1
                            elif latest_iop > baseline_iop:
                                deteriorations += 1
                            else:
                                stable += 1
                
                comparison_data.append({
                    'medication': medication_name,
                    'total_patients': total_patients,
                    'improvements': improvements,
                    'deteriorations': deteriorations,
                    'stable': stable,
                    'improvement_rate': round((improvements / total_patients * 100), 2) if total_patients > 0 else 0,
                    'deterioration_rate': round((deteriorations / total_patients * 100), 2) if total_patients > 0 else 0
                })
        
        return Response({
            'success': True,
            'data': {
                'comparison': comparison_data,
                'test_type_analyzed': test_type,
                'months_tracked': months
            }
        })
        
    except Exception as e:
        return Response({
            'success': False,
            'error': str(e)
        }, status=500)
