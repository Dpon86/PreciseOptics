"""
Clinic letter / discharge summary generation.
Auto-populates: patient, diagnosis, drug given, dose, batch, next appointment, clinician name.
Returns a structured JSON response that can be rendered as PDF or printed.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.utils import timezone
from consultations.models import Consultation
from treatments.models import IntravitrealInjectionRecord
from medications.models import PrescriptionItem
from patients.models import PatientVisit


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def generate_clinic_letter(request, consultation_id):
    """
    Generate clinic letter data for a consultation.
    """
    try:
        consultation = Consultation.objects.select_related(
            'patient', 'primary_doctor'
        ).get(id=consultation_id)
    except Consultation.DoesNotExist:
        return Response({'error': 'Consultation not found'}, status=404)

    patient = consultation.patient
    doctor = consultation.primary_doctor

    # Get the most recent injection for this patient (if any)
    latest_injection = IntravitrealInjectionRecord.objects.filter(
        patient=patient
    ).order_by('-injection_date').first()

    # Get medications prescribed during this consultation
    prescriptions = PrescriptionItem.objects.filter(
        prescription__consultation=consultation
    ).select_related('medication')

    # Get next scheduled appointment
    next_appointment = PatientVisit.objects.filter(
        patient=patient,
        scheduled_date__gt=timezone.now(),
        status='scheduled'
    ).order_by('scheduled_date').first()

    # Get conditions for this patient
    from conditions.models import PatientCondition
    conditions = PatientCondition.objects.filter(
        patient=patient, is_active=True
    ).select_related('condition')[:5]

    letter_data = {
        'generated_date': timezone.now().isoformat(),
        'generated_by': request.user.get_full_name(),
        'letter_type': request.GET.get('type', 'clinic_letter'),

        'patient': {
            'full_name': patient.get_full_name(),
            'date_of_birth': str(patient.date_of_birth) if patient.date_of_birth else None,
            'nhs_number': patient.nhs_number or 'N/A',
            'hospital_id': patient.patient_id,
            'address': f"{patient.address_line_1}, {patient.city}, {patient.postal_code}",
        },

        'consultation': {
            'date': str(consultation.consultation_date.date()) if consultation.consultation_date else None,
            'type': consultation.consultation_type_display if hasattr(consultation, 'consultation_type_display') else str(consultation.consultation_type),
            'diagnosis': consultation.diagnosis or 'Not specified',
            'findings': consultation.findings or '',
            'plan': consultation.plan or '',
        },

        'clinician': {
            'name': doctor.get_full_name() if doctor else 'N/A',
            'title': getattr(doctor, 'specialization', ''),
            'gmc_number': getattr(doctor, 'gmc_number', ''),
        },

        'latest_injection': {
            'drug_name': latest_injection.drug_name if latest_injection else None,
            'batch_number': latest_injection.batch_number if latest_injection else None,
            'injection_date': latest_injection.injection_date.isoformat() if latest_injection else None,
            'eye': latest_injection.get_eye_display() if latest_injection else None,
            'phase': latest_injection.get_phase_display() if latest_injection else None,
            'injection_number': latest_injection.injection_number if latest_injection else None,
        } if latest_injection else None,

        'medications': [
            {
                'name': pi.medication.name,
                'dosage': pi.dosage,
                'frequency': pi.get_frequency_display(),
                'eye_side': pi.eye_side,
            }
            for pi in prescriptions
        ],

        'next_appointment': {
            'date': str(next_appointment.scheduled_date.date()) if next_appointment and next_appointment.scheduled_date else None,
            'type': next_appointment.get_visit_type_display() if next_appointment else None,
        } if next_appointment else None,

        'conditions': [
            {'name': pc.condition.name, 'status': pc.current_status}
            for pc in conditions
        ] if conditions else [],

        'status': 'generated',
    }

    return Response(letter_data)