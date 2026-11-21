"""
Tests for protocols app
"""
from django.test import TestCase
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from rest_framework import status
from conditions.models import MedicalCondition
from .models import (
    TreatmentProtocol, ProtocolStep, PatientProtocol,
    ProtocolStepCompletion, ProtocolStepMedication, ProtocolStepResult
)
from patients.models import Patient
from medications.models import Medication
from datetime import date

User = get_user_model()


def create_test_condition(user):
    """Helper to create a test medical condition."""
    return MedicalCondition.objects.create(
        code='AMD_TEST',
        name='AMD (Test)',
        category='retinal',
        description='Test condition.',
        symptoms='Vision loss.',
        risk_factors='Age.',
        typical_progression='Gradual.',
        standard_treatments='Injections.',
        prognosis='Manageable.',
        created_by=user
    )


class TreatmentProtocolModelTest(TestCase):
    """Test TreatmentProtocol model"""

    def setUp(self):
        self.user = User.objects.create_user(
            username='testdoctor',
            email='doctor@test.com',
            password='testpass123'
        )
        self.condition = create_test_condition(self.user)
        self.protocol = TreatmentProtocol.objects.create(
            name='AMD Loading Dose',
            code='AMD-LD-001',
            protocol_type='loading_dose',
            condition=self.condition,
            description='Standard AMD loading dose protocol.',
            indications='New AMD diagnosis.',
            requires_consent=True,
            created_by=self.user
        )

    def test_protocol_creation(self):
        self.assertEqual(self.protocol.name, 'AMD Loading Dose')
        self.assertEqual(self.protocol.protocol_type, 'loading_dose')
        self.assertTrue(self.protocol.is_active)
        self.assertTrue(self.protocol.requires_consent)

    def test_protocol_str(self):
        result = str(self.protocol)
        self.assertIn('AMD Loading Dose', result)

    def test_protocol_linked_to_condition(self):
        self.assertEqual(self.protocol.condition, self.condition)


class ProtocolAPITest(TestCase):
    """Test Protocol API endpoints"""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='testdoctor',
            email='doctor@test.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.condition = create_test_condition(self.user)
        self.protocol = TreatmentProtocol.objects.create(
            name='Test Protocol',
            code='TEST-001',
            protocol_type='maintenance',
            condition=self.condition,
            description='Test maintenance protocol.',
            indications='Stable AMD.',
            requires_consent=False,
            created_by=self.user
        )

    def test_list_protocols(self):
        response = self.client.get('/api/protocols/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_protocol_detail(self):
        response = self.client.get(f'/api/protocols/{self.protocol.pk}/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['name'], 'Test Protocol')

    def test_create_protocol(self):
        payload = {
            'name': 'New Protocol',
            'code': 'NEW-001',
            'protocol_type': 'prn',
            'condition': str(self.condition.pk),
            'description': 'A PRN protocol.',
            'indications': 'PRN use.',
            'requires_consent': True,
            'created_by': self.user.id,
        }
        response = self.client.post('/api/protocols/', payload, format='json')
        self.assertIn(response.status_code, [status.HTTP_200_OK, status.HTTP_201_CREATED])


def create_test_patient(user):
    """Helper to create a full test patient with all required fields."""
    return Patient.objects.create(
        patient_id='P-SCHED-001',
        first_name='Schedule',
        last_name='Test',
        date_of_birth=date(1970, 5, 5),
        gender='M',
        phone_number='07700900123',
        email='schedule@example.com',
        address_line_1='1 Test Street',
        city='Testville',
        state='Testshire',
        postal_code='TE1 1ST',
        country='UK',
        emergency_contact_name='Jane Test',
        emergency_contact_phone='07700900456',
        emergency_contact_relationship='Spouse',
        nhs_number='1234567890',
        registered_by=user,
    )


def create_test_medication(user):
    """Helper to create a test medication with all required fields."""
    return Medication.objects.create(
        name='Bevacizumab',
        generic_name='Bevacizumab',
        brand_names='Avastin',
        medication_type='injection',
        therapeutic_class='anti_vegf',
        strength='25mg/ml',
        active_ingredients='Bevacizumab',
        description='Anti-VEGF monoclonal antibody.',
        indications='Neovascular AMD.',
        contraindications='Ocular or periocular infection.',
        side_effects='Injection site reaction.',
        standard_dosage='1.25mg intravitreal',
        maximum_daily_dose='Single dose',
        storage_temperature='2-8C',
        shelf_life_months=24,
        manufacturer='Roche',
        unit_price='500.00',
        created_by=user,
    )


class ProtocolScheduleMedicationTest(TestCase):
    """Test that the schedule endpoint returns medication/treatment/test details."""

    def setUp(self):
        self.client = APIClient()
        self.user = User.objects.create_user(
            username='scheddoctor',
            email='scheddoctor@test.com',
            password='testpass123'
        )
        self.client.force_authenticate(user=self.user)
        self.condition = create_test_condition(self.user)
        self.patient = create_test_patient(self.user)
        self.medication = create_test_medication(self.user)

        self.protocol = TreatmentProtocol.objects.create(
            name='AMD Loading Dose Schedule',
            code='AMD-SCHED-001',
            protocol_type='loading_dose',
            condition=self.condition,
            description='Loading dose protocol with injections.',
            indications='New AMD diagnosis.',
            requires_consent=True,
            created_by=self.user
        )

        self.step = ProtocolStep.objects.create(
            protocol=self.protocol,
            step_number=1,
            step_type='injection',
            title='Intravitreal injection',
            description='Loading dose anti-VEGF injection.',
            timing_type='fixed',
            timing_days=0,
            pre_instructions='Confirm consent before administration.',
        )

        ProtocolStepMedication.objects.create(
            protocol_step=self.step,
            medication=self.medication,
            dosage_amount='1.25',
            dosage_unit='mg',
            route='intravitreal',
            frequency='Every 4 weeks',
            eye_side='OU',
            order=0,
        )

        self.patient_protocol = PatientProtocol.objects.create(
            patient=self.patient,
            protocol=self.protocol,
            status='active',
            start_date=date.today(),
            assigned_by=self.user,
            assignment_reason='Scheduled medication display test.',
        )

        ProtocolStepCompletion.objects.create(
            patient_protocol=self.patient_protocol,
            protocol_step=self.step,
            scheduled_date=date.today(),
            status='scheduled',
        )

    def test_schedule_includes_medication_details(self):
        response = self.client.get(
            f'/api/protocols/patient-protocols/{self.patient_protocol.pk}/schedule/'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)

        results = response.data.get('results', response.data)
        self.assertEqual(len(results), 1)

        step_data = results[0]
        self.assertEqual(step_data['step_number'], 1)
        self.assertEqual(step_data['step_title'], 'Intravitreal injection')
        self.assertEqual(step_data['step_type_display'], 'Injection')
        self.assertIn('Confirm consent', step_data['pre_instructions'])

        medications = step_data['medications']
        self.assertEqual(len(medications), 1)
        self.assertEqual(medications[0]['medication_details']['name'], 'Bevacizumab')
        self.assertEqual(medications[0]['dosage_amount'], '1.25')
        self.assertEqual(medications[0]['route_display'], 'Intravitreal Injection')
        self.assertEqual(medications[0]['frequency'], 'Every 4 weeks')

        self.assertEqual(step_data['treatments'], [])
        self.assertEqual(step_data['tests'], [])


class SuggestedNextStepTest(TestCase):
    """Test the get_suggested_next_step recommendation logic."""

    def setUp(self):
        self.user = User.objects.create_user(
            username='suggestdoctor',
            email='suggestdoctor@test.com',
            password='testpass123'
        )
        self.condition = create_test_condition(self.user)
        self.patient = create_test_patient(self.user)

        self.protocol = TreatmentProtocol.objects.create(
            name='AMD Treat-and-Extend',
            code='AMD-SUGGEST-001',
            protocol_type='treat_extend',
            condition=self.condition,
            description='Treat and extend protocol.',
            indications='Active neovascular AMD.',
            requires_consent=True,
            created_by=self.user
        )

        self.step1 = ProtocolStep.objects.create(
            protocol=self.protocol, step_number=1, step_type='assessment',
            title='Baseline assessment', description='Initial VA and OCT.',
            timing_type='fixed', timing_days=0
        )
        self.step2 = ProtocolStep.objects.create(
            protocol=self.protocol, step_number=2, step_type='injection',
            title='First injection', description='Loading dose injection.',
            timing_type='fixed', timing_days=0
        )
        self.step3 = ProtocolStep.objects.create(
            protocol=self.protocol, step_number=3, step_type='injection',
            title='Rescue injection', description='Extra injection if needed.',
            timing_type='fixed', timing_days=0
        )

        self.patient_protocol = PatientProtocol.objects.create(
            patient=self.patient,
            protocol=self.protocol,
            status='active',
            start_date=date.today(),
            assigned_by=self.user,
            assignment_reason='Suggested next step test.',
        )

    def _completion(self, step, status, scheduled_date):
        return ProtocolStepCompletion.objects.create(
            patient_protocol=self.patient_protocol,
            protocol_step=step,
            scheduled_date=scheduled_date,
            status=status,
        )

    def test_suggests_next_pending_step(self):
        self._completion(self.step1, 'completed', date(2026, 1, 1))
        self._completion(self.step2, 'scheduled', date(2026, 1, 15))
        self._completion(self.step3, 'scheduled', date(2026, 1, 29))

        suggestion = self.patient_protocol.get_suggested_next_step()
        self.assertIsNotNone(suggestion)
        self.assertEqual(suggestion['step_number'], 2)
        self.assertEqual(suggestion['reason'], 'next_incomplete')
        self.assertEqual(suggestion['status'], 'scheduled')

    def test_suggests_first_step_when_no_completions(self):
        suggestion = self.patient_protocol.get_suggested_next_step()
        self.assertIsNotNone(suggestion)
        self.assertEqual(suggestion['step_number'], 1)
        self.assertEqual(suggestion['reason'], 'next_sequential')
        self.assertEqual(suggestion['status'], 'not_scheduled')

    def test_branch_override_takes_precedence(self):
        comp1 = self._completion(self.step1, 'completed', date(2026, 1, 1))
        self._completion(self.step2, 'scheduled', date(2026, 1, 15))
        self._completion(self.step3, 'scheduled', date(2026, 1, 29))

        ProtocolStepResult.objects.create(
            step_completion=comp1,
            result_type='yes_no',
            result_label='IOP controlled?',
            result_value_choice='no',
            triggers_branch=True,
            branch_taken='no',
            next_step_override=self.step3,
            evaluated_by=self.user,
        )

        suggestion = self.patient_protocol.get_suggested_next_step()
        self.assertIsNotNone(suggestion)
        self.assertEqual(suggestion['step_number'], 3)
        self.assertEqual(suggestion['reason'], 'branch_override')

    def test_returns_none_when_all_complete(self):
        self._completion(self.step1, 'completed', date(2026, 1, 1))
        self._completion(self.step2, 'completed', date(2026, 1, 15))
        self._completion(self.step3, 'completed', date(2026, 1, 29))

        suggestion = self.patient_protocol.get_suggested_next_step()
        self.assertIsNone(suggestion)
