"""
Comprehensive API endpoints for all models data
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from django.db.models import Count, Q, F
from django.utils import timezone
from datetime import timedelta
from patients.models import Patient, PatientVisit
from accounts.models import CustomUser, StaffProfile
from medications.models import Medication, Prescription, PrescriptionItem
from consultations.models import Consultation, VitalSigns
from eye_tests.models import (
    VisualAcuityTest, GlaucomaAssessment, VisualFieldTest, 
    CataractAssessment, OCTScan, RetinalAssessment
)
from audit.models import AuditLog, MedicationAudit, PatientAccessLog

@api_view(['GET'])
@permission_classes([AllowAny])  # Allow access without authentication for testing
def all_models_data(request):
    """
    Get comprehensive data from all models for dashboard display
    """
    try:
        # Users and Staff
        users = CustomUser.objects.all().values(
            'id', 'username', 'first_name', 'last_name', 
            'email', 'user_type', 'employee_id', 'phone_number',
            'date_of_birth', 'is_active', 'created_at'
        )
        
        staff_profiles = []
        for profile in StaffProfile.objects.select_related('user').all():
            staff_profiles.append({
                'id': str(profile.user.id),
                'name': profile.user.get_full_name(),
                'department': profile.department,
                'specialization': profile.specialization,
                'license_number': profile.license_number,
                'qualification': profile.qualification,
                'years_of_experience': profile.years_of_experience,
                'consultation_fee': str(profile.consultation_fee) if profile.consultation_fee else None,
                'emergency_contact': profile.emergency_contact,
                'hire_date': profile.hire_date,
                'is_consultant': profile.is_consultant,
                'can_prescribe': profile.can_prescribe,
                'can_perform_surgery': profile.can_perform_surgery,
            })

        # Patients
        patients = []
        for patient in Patient.objects.all():
            patients.append({
                'id': str(patient.id),
                'patient_id': patient.patient_id,
                'name': patient.get_full_name(),
                'first_name': patient.first_name,
                'last_name': patient.last_name,
                'date_of_birth': patient.date_of_birth,
                'gender': patient.gender,
                'phone_number': patient.phone_number,
                'email': patient.email,
                'address_line_1': patient.address_line_1,
                'city': patient.city,
                'postal_code': patient.postal_code,
                'country': patient.country,
                'emergency_contact_name': patient.emergency_contact_name,
                'emergency_contact_phone': patient.emergency_contact_phone,
                'medical_history': patient.medical_history,
                'allergies': patient.allergies,
                'registration_date': patient.registration_date,
                'is_active': patient.is_active,
                'age': patient.get_age(),
            })

        # Patient Visits
        visits = []
        for visit in PatientVisit.objects.select_related('patient', 'primary_doctor').all():
            visits.append({
                'id': str(visit.id),
                'patient_name': visit.patient.get_full_name(),
                'patient_id': visit.patient.patient_id,
                'visit_type': visit.visit_type,
                'status': visit.status,
                'scheduled_date': visit.scheduled_date,
                'primary_doctor': visit.primary_doctor.get_full_name() if visit.primary_doctor else None,
                'chief_complaint': visit.chief_complaint,
                'notes': visit.notes,
            })

        # Consultations
        consultations = []
        for consultation in Consultation.objects.select_related('patient', 'consulting_doctor').all():
            consultations.append({
                'id': str(consultation.id),
                'patient_name': consultation.patient.get_full_name(),
                'consulting_doctor': consultation.consulting_doctor.get_full_name(),
                'consultation_type': consultation.consultation_type,
                'status': consultation.status,
                'scheduled_time': consultation.scheduled_time,
                'chief_complaint': consultation.chief_complaint,
                'diagnosis_primary': consultation.diagnosis_primary,
                'diagnosis_secondary': consultation.diagnosis_secondary,
                'treatment_plan': consultation.treatment_plan,
                'consultation_notes': consultation.consultation_notes,
            })

        # Medications
        medications = []
        for med in Medication.objects.all():
            medications.append({
                'id': str(med.id),
                'name': med.name,
                'generic_name': med.generic_name,
                'medication_type': med.medication_type,
                'therapeutic_class': med.therapeutic_class,
                'strength': med.strength,
                'active_ingredients': med.active_ingredients,
                'description': med.description,
                'indications': med.indications,
                'side_effects': med.side_effects,
                'manufacturer': med.manufacturer,
                'current_stock': med.current_stock,
                'minimum_stock_level': med.minimum_stock_level,
                'unit_price': str(med.unit_price),
                'is_low_stock': med.is_low_stock(),
            })

        # Prescriptions
        prescriptions = []
        for prescription in Prescription.objects.select_related('patient', 'prescribing_doctor').prefetch_related('items__medication'):
            prescription_items = []
            for item in prescription.items.all():
                prescription_items.append({
                    'medication_name': item.medication.name,
                    'dosage': item.dosage,
                    'frequency': item.frequency,
                    'duration_days': item.duration_days,
                    'quantity_prescribed': item.quantity_prescribed,
                    'special_instructions': item.special_instructions,
                })
            
            prescriptions.append({
                'id': str(prescription.id),
                'prescription_number': prescription.prescription_number,
                'patient_name': prescription.patient.get_full_name(),
                'prescribing_doctor': prescription.prescribing_doctor.get_full_name(),
                'diagnosis': prescription.diagnosis,
                'instructions': prescription.instructions,
                'status': prescription.status,
                'date_prescribed': prescription.date_prescribed,
                'valid_until': prescription.valid_until,
                'items': prescription_items,
            })

        # Eye Tests
        visual_acuity_tests = []
        for test in VisualAcuityTest.objects.select_related('patient', 'performed_by').all():
            visual_acuity_tests.append({
                'id': str(test.id),
                'patient_name': test.patient.get_full_name(),
                'performed_by': test.performed_by.get_full_name(),
                'test_date': test.test_date,
                'right_eye_distance': test.right_eye_distance,
                'left_eye_distance': test.left_eye_distance,
                'right_eye_near': test.right_eye_near,
                'left_eye_near': test.left_eye_near,
                'notes': test.notes,
            })

        glaucoma_tests = []
        for test in GlaucomaAssessment.objects.select_related('patient', 'performed_by').all():
            glaucoma_tests.append({
                'id': str(test.id),
                'patient_name': test.patient.get_full_name(),
                'performed_by': test.performed_by.get_full_name(),
                'assessment_date': test.assessment_date,
                'iop_right_eye': test.iop_right_eye,
                'iop_left_eye': test.iop_left_eye,
                'cup_disc_ratio_right': test.cup_disc_ratio_right,
                'cup_disc_ratio_left': test.cup_disc_ratio_left,
                'risk_level': test.risk_level,
                'findings': test.findings,
            })

        # Audit Logs
        audit_logs = []
        for log in AuditLog.objects.select_related('user').all().order_by('-timestamp')[:50]:  # Latest 50
            audit_logs.append({
                'id': str(log.id),
                'user': log.user.get_full_name() if log.user else 'System',
                'action': log.action,
                'model_name': log.model_name,
                'object_id': log.object_id,
                'changes': log.changes,
                'ip_address': log.ip_address,
                'timestamp': log.timestamp,
            })

        # Summary Statistics
        stats = {
            'total_patients': Patient.objects.count(),
            'total_staff': CustomUser.objects.filter(user_type__in=['doctor', 'nurse']).count(),
            'total_medications': Medication.objects.count(),
            'total_visits': PatientVisit.objects.count(),
            'total_consultations': Consultation.objects.count(),
            'total_prescriptions': Prescription.objects.count(),
            'active_prescriptions': Prescription.objects.filter(status='active').count(),
            'low_stock_medications': Medication.objects.filter(
                current_stock__lte=F('minimum_stock_level')
            ).count(),
            'recent_visits': PatientVisit.objects.filter(
                scheduled_date__gte=timezone.now() - timedelta(days=30)
            ).count(),
        }

        return Response({
            'stats': stats,
            'users': list(users),
            'staff_profiles': staff_profiles,
            'patients': patients,
            'visits': visits,
            'consultations': consultations,
            'medications': medications,
            'prescriptions': prescriptions,
            'visual_acuity_tests': visual_acuity_tests,
            'glaucoma_tests': glaucoma_tests,
            'audit_logs': audit_logs,
        })

    except Exception as e:
        return Response({'error': str(e)}, status=500)


@api_view(['GET'])
@permission_classes([AllowAny])  # Allow access without authentication for testing
def model_counts(request):
    """
    Get count of records in all models
    """
    try:
        
        counts = {
            # Core Models
            'users': CustomUser.objects.count(),
            'staff_profiles': StaffProfile.objects.count(),
            'patients': Patient.objects.count(),
            'patient_visits': PatientVisit.objects.count(),
            'consultations': Consultation.objects.count(),
            
            # Medications
            'medications': Medication.objects.count(),
            'prescriptions': Prescription.objects.count(),
            'prescription_items': PrescriptionItem.objects.count(),
            
            # Eye Tests
            'visual_acuity_tests': VisualAcuityTest.objects.count(),
            'glaucoma_assessments': GlaucomaAssessment.objects.count(),
            'visual_field_tests': VisualFieldTest.objects.count(),
            'cataract_assessments': CataractAssessment.objects.count(),
            'oct_scans': OCTScan.objects.count(),
            'retinal_assessments': RetinalAssessment.objects.count(),
            
            # Audit
            'audit_logs': AuditLog.objects.count(),
            'medication_audits': MedicationAudit.objects.count(),
            'patient_access_logs': PatientAccessLog.objects.count(),
            
            # Breakdown by type
            'doctors': CustomUser.objects.filter(user_type='doctor').count(),
            'nurses': CustomUser.objects.filter(user_type='nurse').count(),
            'active_patients': Patient.objects.filter(is_active=True).count(),
            'active_prescriptions': Prescription.objects.filter(status='active').count(),
            'completed_consultations': Consultation.objects.filter(status='completed').count(),
        }
        
        return Response(counts)
        
    except Exception as e:
        return Response({'error': str(e)}, status=500)