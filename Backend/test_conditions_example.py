"""
Example tests for Conditions module
Demonstrates API testing patterns for PreciseOptics
"""
import pytest
from django.urls import reverse
from conditions.models import MedicalCondition, PatientCondition


@pytest.mark.django_db
class TestMedicalConditionModel:
    """
    Unit tests for MedicalCondition model
    """
    
    def test_create_medical_condition(self):
        """
        Test creating a medical condition
        """
        condition = MedicalCondition.objects.create(
            name='Diabetic Retinopathy',
            code='DR',
            category='diabetic',
            description='Diabetes-related retinal damage'
        )
        
        assert condition.name == 'Diabetic Retinopathy'
        assert condition.code == 'DR'
        assert condition.is_active is True
        assert str(condition) == 'Diabetic Retinopathy (DR)'
    
    def test_condition_category_choices(self):
        """
        Test valid category choices
        """
        valid_categories = ['retinal', 'glaucoma', 'cataract', 'corneal', 'diabetic', 'vascular', 'other']
        
        for category in valid_categories:
            condition = MedicalCondition.objects.create(
                name=f'Test {category}',
                code=f'T{category[:2].upper()}',
                category=category
            )
            assert condition.category == category


@pytest.mark.django_db
class TestPatientConditionModel:
    """
    Unit tests for PatientCondition model
    """
    
    def test_create_patient_condition(self, test_patient, test_condition, test_user):
        """
        Test assigning a condition to a patient
        """
        patient_condition = PatientCondition.objects.create(
            patient=test_patient,
            condition=test_condition,
            diagnosed_by=test_user,
            severity='moderate',
            eye_affected='both',
            status='active'
        )
        
        assert patient_condition.patient == test_patient
        assert patient_condition.condition == test_condition
        assert patient_condition.severity == 'moderate'
        assert patient_condition.is_active is True


@pytest.mark.api
@pytest.mark.django_db
class TestConditionsAPI:
    """
    API endpoint tests for Conditions module
    """
    
    def test_list_conditions_requires_auth(self, api_client):
        """
        Test that listing conditions requires authentication
        """
        url = reverse('medical-conditions-list')
        response = api_client.get(url)
        assert response.status_code == 401  # Unauthorized
    
    def test_list_conditions_authenticated(self, authenticated_client, test_condition):
        """
        Test listing conditions when authenticated
        """
        url = reverse('medical-conditions-list')
        response = authenticated_client.get(url)
        
        assert response.status_code == 200
        assert len(response.json()) >= 1
    
    def test_create_patient_condition(self, authenticated_client, test_patient, test_condition):
        """
        Test assigning a condition to a patient via API
        """
        url = reverse('patient-conditions-list')
        data = {
            'patient': str(test_patient.id),
            'condition': str(test_condition.id),
            'severity': 'moderate',
            'eye_affected': 'both',
            'status': 'active',
            'diagnosis_notes': 'Initial diagnosis'
        }
        
        response = authenticated_client.post(url, data, format='json')
        
        assert response.status_code == 201
        assert response.json()['severity'] == 'moderate'
    
    def test_get_conditions_statistics(self, authenticated_client, test_condition):
        """
        Test conditions statistics endpoint
        """
        url = reverse('conditions-statistics')
        response = authenticated_client.get(url)
        
        assert response.status_code == 200
        data = response.json()
        assert 'total_conditions' in data
        assert 'total_patient_conditions' in data


@pytest.mark.integration
@pytest.mark.django_db
class TestConditionsWorkflow:
    """
    Integration tests for complete condition workflows
    """
    
    def test_complete_condition_assignment_workflow(self, authenticated_client, test_patient):
        """
        Test complete workflow: create condition → assign to patient → record progress
        """
        # Step 1: Create condition
        condition = MedicalCondition.objects.create(
            name='Test Glaucoma',
            code='TG',
            category='glaucoma'
        )
        
        # Step 2: Assign to patient
        url = reverse('patient-conditions-list')
        data = {
            'patient': str(test_patient.id),
            'condition': str(condition.id),
            'severity': 'mild',
            'eye_affected': 'left',
            'status': 'active'
        }
        
        response = authenticated_client.post(url, data, format='json')
        assert response.status_code == 201
        patient_condition_id = response.json()['id']
        
        # Step 3: Record progress (if endpoint exists)
        # This would test the complete workflow
        patient_condition = PatientCondition.objects.get(id=patient_condition_id)
        assert patient_condition.patient == test_patient
        assert patient_condition.condition == condition
