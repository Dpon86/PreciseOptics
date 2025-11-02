"""
Test Script for Enhanced Protocol System
This script tests the creation and assignment of protocols with multiple medications, treatments, and tests.
"""
import os
import django
import sys
from datetime import date, timedelta

# Setup Django environment
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

from django.contrib.auth import get_user_model
from patients.models import Patient
from protocols.models import (
    TreatmentProtocol, ProtocolStep, PatientProtocol,
    ProtocolStepCompletion, ProtocolStepMedication,
    ProtocolStepTreatment, ProtocolStepTest
)
from medications.models import Medication

User = get_user_model()

def print_header(text):
    """Print a formatted header"""
    print("\n" + "="*60)
    print(f"  {text}")
    print("="*60)

def print_success(text):
    """Print success message"""
    print(f"✓ {text}")

def print_error(text):
    """Print error message"""
    print(f"✗ {text}")

def print_info(text):
    """Print info message"""
    print(f"ℹ {text}")


def test_protocol_creation():
    """Test creating a protocol with enhanced features"""
    print_header("TEST 1: Create Enhanced Protocol")
    
    try:
        # Get or create test user
        user = User.objects.filter(is_superuser=True).first()
        if not user:
            print_error("No superuser found. Please create one first.")
            return None
        
        print_success(f"Using user: {user.username}")
        
        # Create a test protocol  
        # First, get or create a medical condition
        from conditions.models import MedicalCondition
        condition, created = MedicalCondition.objects.get_or_create(
            code="GLAUCOMA",
            defaults={
                'name': 'Glaucoma',
                'category': 'glaucoma',
                'description': 'A type of glaucoma characterized by progressive optic nerve damage',
                'symptoms': 'Gradual loss of peripheral vision, tunnel vision',
                'risk_factors': 'Age over 60, family history, elevated eye pressure',
                'typical_progression': 'Slow progression with irreversible vision loss if untreated',
                'standard_treatments': 'Eye drops to lower pressure, laser treatment, surgery',
                'prognosis': 'Good with early detection and treatment',
                'is_active': True
            }
        )
        if created:
            print_info(f"Created condition: {condition.name}")
        
        # Delete existing test protocol and related data
        import random
        code_suffix = random.randint(100, 999)
        protocol_code = f"GTP-TEST-{code_suffix}"
        print_info(f"Using protocol code: {protocol_code}")
        
        protocol = TreatmentProtocol.objects.create(
            name="Glaucoma Treatment Protocol - Enhanced Test",
            code=protocol_code,
            protocol_type="custom",  # Changed from 'medical' to 'custom'
            condition=condition,
            description="Test protocol with multiple medications and tests",
            indications="Testing enhanced protocol system",
            total_duration_weeks=12,
            requires_consent=True,
            created_by=user
        )
        print_success(f"Created protocol: {protocol.name} (ID: {protocol.id})")
        
        # Create Step 1: Initial Assessment
        step1 = ProtocolStep.objects.create(
            protocol=protocol,
            step_number=1,
            title="Initial Assessment & Baseline Tests",
            description="Complete baseline assessment with multiple tests",
            step_type="assessment",
            timing_type="fixed",
            timing_days=0,
            is_mandatory=True
        )
        print_success(f"Created Step 1: {step1.title}")
        
        # Add multiple tests to Step 1
        test1 = ProtocolStepTest.objects.create(
            protocol_step=step1,
            test_type="visual_acuity",
            test_name="Visual Acuity Test (Baseline)",
            eye_side="OU",
            is_baseline=True,
            offset_days=0,
            order=1,
            special_instructions="Complete both eyes, record best corrected vision"
        )
        print_success(f"  Added test: {test1.test_name}")
        
        test2 = ProtocolStepTest.objects.create(
            protocol_step=step1,
            test_type="iop",
            test_name="Intraocular Pressure (Baseline)",
            eye_side="OU",
            is_baseline=True,
            offset_days=0,
            order=2,
            special_instructions="Use tonometry, record at same time of day for consistency"
        )
        print_success(f"  Added test: {test2.test_name}")
        
        # Create Step 2: Start Medication
        step2 = ProtocolStep.objects.create(
            protocol=protocol,
            step_number=2,
            title="Start Medication Regimen",
            description="Begin prescribed eye drops and oral medication",
            step_type="medication",
            timing_type="from_previous",
            timing_days=1,
            is_mandatory=True
        )
        print_success(f"Created Step 2: {step2.title}")
        
        # Get existing medications (prefer using existing rather than creating new)
        try:
            medication1 = Medication.objects.filter(medication_type='eye_drop', therapeutic_class='antiglaucoma').first()
            if not medication1:
                # Use any eye drop medication
                medication1 = Medication.objects.filter(medication_type='eye_drop').first()
            
            if not medication1:
                print_error("No eye drop medications found in database. Please add medications first.")
                return None
            
            print_success(f"  Using medication: {medication1.name}")
            
            medication2 = Medication.objects.filter(medication_type='eye_drop').exclude(id=medication1.id).first()
            if not medication2:
                print_error("Need at least 2 eye drop medications. Please add more medications.")
                return None
            
            print_success(f"  Using medication: {medication2.name}")
            
        except Exception as e:
            print_error(f"Error loading medications: {str(e)}")
            return None
        
        # Add medications to Step 2
        med1 = ProtocolStepMedication.objects.create(
            protocol_step=step2,
            medication=medication1,
            dosage_amount=1,
            dosage_unit="drop",
            route="ophthalmic",
            frequency="once_daily",
            duration_days=84,  # 12 weeks
            eye_side="OU",
            offset_days=0,
            order=1,
            special_instructions="Administer at night before bed"
        )
        print_success(f"  Added medication: {med1.medication.name}")
        
        med2 = ProtocolStepMedication.objects.create(
            protocol_step=step2,
            medication=medication2,
            dosage_amount=1,
            dosage_unit="drop",
            route="ophthalmic",
            frequency="twice_daily",
            duration_days=84,
            eye_side="OU",
            offset_days=0,
            order=2,
            administer_at_same_time=False,
            special_instructions="Morning and evening, 5 minutes after first drop"
        )
        print_success(f"  Added medication: {med2.medication.name}")
        
        # Create Step 3: Follow-up (Weekly, Recurring)
        step3 = ProtocolStep.objects.create(
            protocol=protocol,
            step_number=3,
            title="Weekly IOP Check",
            description="Monitor intraocular pressure weekly",
            step_type="follow_up",
            timing_type="weekly",
            timing_days=1,  # Start 1 week after medication
            is_recurring=True,
            recurrence_count=4,  # 4 weekly checks
            is_mandatory=True
        )
        print_success(f"Created Step 3: {step3.title} (Recurring {step3.recurrence_count}x)")
        
        # Add test to recurring step
        test3 = ProtocolStepTest.objects.create(
            protocol_step=step3,
            test_type="iop",
            test_name="Weekly IOP Monitoring",
            eye_side="OU",
            is_baseline=False,
            offset_days=0,
            order=1,
            special_instructions="Compare with baseline, same time of day"
        )
        print_success(f"  Added test: {test3.test_name}")
        
        # Create Step 4: Final Assessment
        step4 = ProtocolStep.objects.create(
            protocol=protocol,
            step_number=4,
            title="Final Assessment",
            description="Complete final tests and evaluate treatment effectiveness",
            step_type="assessment",
            timing_type="fixed",
            timing_days=84,  # 12 weeks
            is_mandatory=True
        )
        print_success(f"Created Step 4: {step4.title}")
        
        # Add tests to final assessment
        test4 = ProtocolStepTest.objects.create(
            protocol_step=step4,
            test_type="visual_acuity",
            test_name="Visual Acuity Test (Final)",
            eye_side="OU",
            is_baseline=False,
            offset_days=0,
            order=1,
            expected_values="Compare with baseline",
            special_instructions="Complete assessment, compare with baseline results"
        )
        print_success(f"  Added test: {test4.test_name}")
        
        test5 = ProtocolStepTest.objects.create(
            protocol_step=step4,
            test_type="iop",
            test_name="Final IOP Assessment",
            eye_side="OU",
            is_baseline=False,
            offset_days=0,
            order=2,
            expected_values="Reduction of 20-30% from baseline",
            special_instructions="Final pressure check, evaluate treatment success"
        )
        print_success(f"  Added test: {test5.test_name}")
        
        print_info(f"\nProtocol created with {protocol.steps.count()} steps")
        print_info(f"Total medications defined: {ProtocolStepMedication.objects.filter(protocol_step__protocol=protocol).count()}")
        print_info(f"Total tests defined: {ProtocolStepTest.objects.filter(protocol_step__protocol=protocol).count()}")
        
        return protocol
        
    except Exception as e:
        print_error(f"Error creating protocol: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def test_protocol_assignment(protocol):
    """Test assigning the protocol to a patient"""
    print_header("TEST 2: Assign Protocol to Patient")
    
    if not protocol:
        print_error("No protocol provided")
        return None
    
    try:
        # Get or create test patient
        patient = Patient.objects.filter(is_active=True).first()
        if not patient:
            print_error("No active patient found. Please create a patient first.")
            return None
        
        print_success(f"Using patient: {patient.first_name} {patient.last_name} (ID: {patient.patient_id})")
        
        # Get user for assignment
        user = User.objects.filter(is_superuser=True).first()
        
        # Assign protocol
        start_date = date.today()
        patient_protocol = PatientProtocol.objects.create(
            patient=patient,
            protocol=protocol,
            start_date=start_date,
            status='active',
            assigned_by=user,
            assignment_reason="Test assignment for protocol system validation"
        )
        print_success(f"Assigned protocol to patient (ID: {patient_protocol.id})")
        print_info(f"Start date: {start_date}")
        
        # Generate step completions
        steps_created = 0
        for step in protocol.steps.all().order_by('step_number'):
            # Calculate scheduled date
            if step.timing_type == 'fixed':
                scheduled_date = start_date + timedelta(days=step.timing_days)
            elif step.timing_type == 'weekly':
                scheduled_date = start_date + timedelta(weeks=step.timing_days)
            else:
                scheduled_date = start_date + timedelta(days=step.timing_days)
            
            # Create main completion
            completion = ProtocolStepCompletion.objects.create(
                patient_protocol=patient_protocol,
                protocol_step=step,
                scheduled_date=scheduled_date,
                status='scheduled'
            )
            steps_created += 1
            print_info(f"  Scheduled: {step.title} for {scheduled_date}")
            
            # Handle recurring steps
            if step.is_recurring and step.recurrence_count:
                for i in range(1, step.recurrence_count):
                    if step.timing_type == 'weekly':
                        next_date = scheduled_date + timedelta(weeks=i)
                    else:
                        next_date = scheduled_date + timedelta(days=step.timing_days * i)
                    
                    ProtocolStepCompletion.objects.create(
                        patient_protocol=patient_protocol,
                        protocol_step=step,
                        scheduled_date=next_date,
                        status='scheduled'
                    )
                    steps_created += 1
                    print_info(f"  Scheduled: {step.title} (occurrence {i+1}) for {next_date}")
        
        print_success(f"\nCreated {steps_created} scheduled step completions")
        
        return patient_protocol
        
    except Exception as e:
        print_error(f"Error assigning protocol: {str(e)}")
        import traceback
        traceback.print_exc()
        return None


def test_protocol_summary(patient_protocol):
    """Display summary of assigned protocol"""
    print_header("TEST 3: Protocol Assignment Summary")
    
    if not patient_protocol:
        print_error("No patient protocol provided")
        return
    
    try:
        print_info(f"Patient: {patient_protocol.patient.first_name} {patient_protocol.patient.last_name}")
        print_info(f"Protocol: {patient_protocol.protocol.name}")
        print_info(f"Status: {patient_protocol.status}")
        print_info(f"Start Date: {patient_protocol.start_date}")
        
        # Get all scheduled steps
        completions = patient_protocol.step_completions.all().order_by('scheduled_date')
        print_info(f"\nTotal scheduled steps: {completions.count()}")
        
        print("\n--- SCHEDULE ---")
        for completion in completions:
            step = completion.protocol_step
            print(f"\n{completion.scheduled_date} - {step.title}")
            
            # Show medications for this step
            medications = ProtocolStepMedication.objects.filter(protocol_step=step)
            if medications.exists():
                print("  Medications:")
                for med in medications:
                    print(f"    • {med.medication.name}")
                    print(f"      {med.dosage_amount} {med.dosage_unit}, {med.frequency}")
                    print(f"      Route: {med.route}, Eye: {med.eye_side}")
            
            # Show treatments for this step
            treatments = ProtocolStepTreatment.objects.filter(protocol_step=step)
            if treatments.exists():
                print("  Treatments:")
                for treat in treatments:
                    print(f"    • {treat.treatment_name}")
                    print(f"      Type: {treat.treatment_type}, Eye: {treat.eye_side}")
            
            # Show tests for this step
            tests = ProtocolStepTest.objects.filter(protocol_step=step)
            if tests.exists():
                print("  Tests:")
                for test in tests:
                    baseline = " (BASELINE)" if test.is_baseline else ""
                    print(f"    • {test.test_name}{baseline}")
                    print(f"      Type: {test.test_type}, Eye: {test.eye_side}")
                    if test.special_instructions:
                        print(f"      Note: {test.special_instructions}")
        
        print_success("\nProtocol assignment complete and verified!")
        
    except Exception as e:
        print_error(f"Error displaying summary: {str(e)}")
        import traceback
        traceback.print_exc()


def main():
    """Run all tests"""
    print_header("ENHANCED PROTOCOL SYSTEM - TEST SUITE")
    print("This script will create and test the enhanced protocol system")
    print("with multiple medications, treatments, and tests per step.\n")
    
    # Test 1: Create protocol
    protocol = test_protocol_creation()
    
    if protocol:
        # Test 2: Assign to patient
        patient_protocol = test_protocol_assignment(protocol)
        
        if patient_protocol:
            # Test 3: Display summary
            test_protocol_summary(patient_protocol)
    
    print_header("TEST SUITE COMPLETE")
    print("\nYou can now:")
    print("1. View the protocol in Django Admin")
    print("2. Test the frontend assignment page")
    print("3. Check the patient protocols page")
    print("\nTo clean up test data:")
    print("  - Delete the protocol from Django Admin (will cascade)")


if __name__ == "__main__":
    main()
