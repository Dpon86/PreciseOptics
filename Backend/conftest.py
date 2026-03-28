"""
Pytest fixtures and configuration for PreciseOptics tests
Provides reusable test data and utilities
"""
import pytest
from django.contrib.auth import get_user_model
from rest_framework.test import APIClient
from faker import Faker

User = get_user_model()
fake = Faker()


@pytest.fixture
def api_client():
    """
    Provides an unauthenticated API client
    """
    return APIClient()


@pytest.fixture
def authenticated_client(db, test_user):
    """
    Provides an authenticated API client with test user
    """
    client = APIClient()
    client.force_authenticate(user=test_user)
    return client


@pytest.fixture
def test_user(db):
    """
    Creates a test user
    """
    user = User.objects.create_user(
        username='testuser',
        email='test@example.com',
        password='TestPass123!',
        first_name='Test',
        last_name='User',
        role='doctor'
    )
    return user


@pytest.fixture
def test_admin_user(db):
    """
    Creates a test admin user
    """
    user = User.objects.create_superuser(
        username='admin',
        email='admin@example.com',
        password='AdminPass123!',
        first_name='Admin',
        last_name='User'
    )
    return user


@pytest.fixture
def test_patient(db, test_user):
    """
    Creates a test patient
    """
    from patients.models import Patient
    from datetime import date
    
    patient = Patient.objects.create(
        first_name='John',
        last_name='Doe',
        date_of_birth=date(1980, 1, 15),
        gender='M',
        nhs_number='1234567890',
        email='john.doe@example.com',
        phone='07700900000',
        created_by=test_user
    )
    return patient


@pytest.fixture
def test_condition(db):
    """
    Creates a test medical condition
    """
    from conditions.models import MedicalCondition
    
    condition = MedicalCondition.objects.create(
        name='Age-Related Macular Degeneration',
        code='AMD',
        category='retinal',
        description='Progressive deterioration of the macula',
        is_active=True
    )
    return condition


@pytest.fixture
def test_medication(db, test_user):
    """
    Creates a test medication
    """
    from medications.models import Medication
    
    medication = Medication.objects.create(
        name='Bevacizumab',
        generic_name='Bevacizumab',
        category='anti_vegf',
        dosage_form='injection',
        strength='25mg/ml',
        unit='ml',
        is_active=True,
        created_by=test_user
    )
    return medication


@pytest.fixture
def multiple_patients(db, test_user):
    """
    Creates multiple test patients for list testing
    """
    from patients.models import Patient
    from datetime import date
    
    patients = []
    for i in range(5):
        patient = Patient.objects.create(
            first_name=fake.first_name(),
            last_name=fake.last_name(),
            date_of_birth=fake.date_of_birth(minimum_age=18, maximum_age=90),
            gender=fake.random_element(['M', 'F']),
            nhs_number=fake.numerify(text='##########'),
            email=fake.email(),
            phone=fake.phone_number()[:20],
            created_by=test_user
        )
        patients.append(patient)
    
    return patients
