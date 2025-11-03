"""
Create AMD (Age-related Macular Degeneration) Care Pathway Protocol
Based on the AMD care pathway document
"""
import os
import django
import sys
from datetime import datetime

# Setup Django environment
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'precise_optics.settings')
django.setup()

from protocols.models import (
    TreatmentProtocol, ProtocolStep, ProtocolStepMedication,
    ProtocolStepTreatment, ProtocolStepTest, MedicalCondition
)
from medications.models import Medication
from accounts.models import CustomUser

def create_amd_protocol():
    """Create comprehensive AMD Care Pathway protocol"""
    
    # Get or create admin user
    try:
        admin_user = CustomUser.objects.filter(is_superuser=True).first()
        if not admin_user:
            admin_user = CustomUser.objects.filter(user_type='admin').first()
        if not admin_user:
            admin_user = CustomUser.objects.first()
        
        if not admin_user:
            print("❌ No users found. Please create a user first.")
            return
    except Exception as e:
        print(f"❌ Error getting user: {e}")
        return
    
    print(f"✅ Using user: {admin_user.get_full_name()} ({admin_user.email})")
    
    # Create or get AMD condition
    amd_condition, created = MedicalCondition.objects.get_or_create(
        name="Age-related Macular Degeneration (AMD)",
        defaults={
            'code': 'H35.3',
            'description': 'Progressive deterioration of the macula causing central vision loss',
            'category': 'retinal',
            'created_by': admin_user
        }
    )
    
    if created:
        print(f"✅ Created condition: {amd_condition.name}")
    else:
        print(f"📌 Using existing condition: {amd_condition.name}")
    
    # Delete existing AMD protocol if it exists
    existing = TreatmentProtocol.objects.filter(code='AMD-CP-2024')
    if existing.exists():
        print("🗑️  Deleting existing AMD protocol...")
        existing.delete()
    
    # Create Protocol
    print("\n📋 Creating AMD Care Pathway Protocol...")
    protocol = TreatmentProtocol.objects.create(
        name="AMD Care Pathway - Wet & Dry AMD Management",
        code="AMD-CP-2024",
        protocol_type="custom",
        condition=amd_condition,
        description="""Comprehensive care pathway for Age-related Macular Degeneration management.
        
This protocol includes:
- Initial assessment and diagnosis
- Classification (Wet vs Dry AMD)
- Treatment pathways for both types
- Anti-VEGF therapy for Wet AMD
- Monitoring and follow-up schedules
- Outcome assessment and treatment adjustment
- Patient education and lifestyle modifications

Based on clinical guidelines for AMD management with branching logic
for personalized treatment based on patient response.""",
        
        total_duration_weeks=52,  # 1 year protocol
        repeat_interval_weeks=None,
        
        indications="""Suitable for patients with:
- Newly diagnosed AMD (wet or dry)
- Existing AMD requiring systematic management
- Visual symptoms including distortion, central vision loss
- Drusen identified on examination
- Choroidal neovascularization (CNV)""",
        
        contraindications="""Not suitable for patients with:
- Active ocular infection
- Known allergy to anti-VEGF medications
- Recent ocular surgery (< 4 weeks)
- Uncontrolled glaucoma (for intravitreal injections)""",
        
        expected_outcomes="""Expected outcomes:
- Stabilization or improvement of visual acuity
- Reduction in macular fluid (wet AMD)
- Prevention of vision loss
- Early detection of disease progression
- Improved patient quality of life""",
        
        potential_side_effects="""Potential side effects:
- Injection-related: Eye pain, subconjunctival hemorrhage, floaters
- Rare: Endophthalmitis, retinal detachment, increased IOP
- Supplement-related: GI upset (AREDS formulation)
- General: Temporary vision changes post-injection""",
        
        monitoring_requirements="""Regular monitoring includes:
- Visual acuity testing at each visit
- OCT scans to assess macular fluid
- Fundus examination
- IOP measurement
- Patient symptom reporting
- Amsler grid self-monitoring""",
        
        requires_consent=True,
        consent_type="treatment",
        is_active=True,
        created_by=admin_user
    )
    print(f"✅ Created protocol: {protocol.name} ({protocol.code})")
    
    # ==================== STEP 1: Initial Assessment ====================
    print("\n📝 Creating Step 1: Initial Assessment & Diagnosis...")
    step1 = ProtocolStep.objects.create(
        protocol=protocol,
        step_number=1,
        step_type="assessment",
        title="Initial Assessment & Diagnosis",
        description="""Comprehensive baseline assessment to diagnose AMD type and severity.

Includes:
- Complete ocular examination
- Visual acuity measurement (BCVA)
- Dilated fundus examination
- OCT scan to assess retinal structure
- Fundus photography for documentation
- Amsler grid testing for metamorphopsia
- Patient history and risk factor assessment""",
        
        timing_type="fixed",
        timing_days=0,  # Day 0 - immediate
        timing_window_before=0,
        timing_window_after=7,
        
        is_recurring=False,
        has_branches=True,
        branch_condition_type="test_result",
        branch_logic={
            "evaluation_field": "amd_type",
            "conditions": [
                {
                    "result": "wet_amd",
                    "operator": "equals",
                    "next_step": 2,
                    "label": "If Wet AMD (CNV present) → Urgent treatment pathway"
                },
                {
                    "result": "dry_amd",
                    "operator": "equals",
                    "next_step": 6,
                    "label": "If Dry AMD → Monitoring & supplements pathway"
                }
            ],
            "default_next_step": 6
        },
        
        pre_instructions="""Before the visit:
- Dilate pupils (Tropicamide 1%)
- Ensure OCT machine is calibrated
- Have Amsler grid ready for testing
- Review patient's medical history""",
        
        post_instructions="""After assessment:
- Discuss findings with patient
- Explain AMD diagnosis and implications
- Provide written information
- Schedule appropriate follow-up based on findings""",
        
        is_mandatory=True,
        can_be_rescheduled=False
    )
    
    # Add tests for Step 1
    tests_step1 = [
        {
            'test_type': 'visual_acuity',
            'test_name': 'Best Corrected Visual Acuity (BCVA)',
            'description': 'Baseline VA measurement using ETDRS chart',
            'eye_side': 'OU',
            'is_baseline': True,
            'expected_values': 'Record Snellen and LogMAR values',
            'order': 1
        },
        {
            'test_type': 'oct',
            'test_name': 'Spectral Domain OCT - Macula',
            'description': 'High-resolution cross-sectional imaging of macula',
            'eye_side': 'OU',
            'is_baseline': True,
            'expected_values': 'Assess for subretinal/intraretinal fluid, drusen, CNV',
            'order': 2
        },
        {
            'test_type': 'fundus_photo',
            'test_name': 'Color Fundus Photography',
            'description': 'Wide-field fundus imaging for documentation',
            'eye_side': 'OU',
            'is_baseline': True,
            'expected_values': 'Document baseline macular appearance',
            'order': 3
        },
        {
            'test_type': 'amsler_grid',
            'test_name': 'Amsler Grid Test',
            'description': 'Test for metamorphopsia and scotomas',
            'eye_side': 'OU',
            'is_baseline': True,
            'expected_values': 'Note any distortions or missing areas',
            'order': 4
        },
        {
            'test_type': 'dilated_exam',
            'test_name': 'Dilated Fundus Examination',
            'description': 'Comprehensive posterior segment examination',
            'eye_side': 'OU',
            'is_baseline': True,
            'expected_values': 'Assess for drusen, pigmentary changes, hemorrhage, CNV',
            'order': 5
        }
    ]
    
    for test_data in tests_step1:
        ProtocolStepTest.objects.create(
            protocol_step=step1,
            administer_at_same_time=True,
            offset_days=0,
            special_instructions='Perform during same visit',
            **test_data
        )
    print(f"   ✅ Added {len(tests_step1)} diagnostic tests to Step 1")
    
    # ==================== STEP 2: Wet AMD - Loading Phase (Anti-VEGF) ====================
    print("\n📝 Creating Step 2: Wet AMD Loading Phase...")
    step2 = ProtocolStep.objects.create(
        protocol=protocol,
        step_number=2,
        step_type="treatment",
        title="Wet AMD - Loading Phase: 3 Monthly Anti-VEGF Injections",
        description="""Initial loading phase for wet AMD (neovascular AMD/CNV).

Standard loading dose protocol:
- 3 consecutive monthly intravitreal anti-VEGF injections
- Each injection 28-35 days apart
- Reduces macular edema and stabilizes vision
- Establishes treatment response pattern

Common anti-VEGF agents:
- Aflibercept (Eylea) 2mg/0.05ml
- Ranibizumab (Lucentis) 0.5mg/0.05ml
- Bevacizumab (Avastin) 1.25mg/0.05ml off-label""",
        
        timing_type="fixed",
        timing_days=7,  # Day 7 - first injection within 1 week of diagnosis
        timing_window_before=0,
        timing_window_after=3,
        
        is_recurring=True,
        recurrence_count=3,  # 3 monthly injections
        
        has_branches=False,
        
        pre_instructions="""Pre-injection checklist:
- Obtain informed consent
- Check for contraindications (infection, allergy)
- Ensure antibiotic eye drops available
- Prepare injection tray and medication
- Confirm correct eye and medication
- Measure IOP and visual acuity""",
        
        post_instructions="""Post-injection care:
- Apply antibiotic drops (Chloramphenicol QDS for 3 days)
- Monitor for complications (pain, vision loss, floaters)
- Provide emergency contact information
- Schedule next injection (4 weeks)
- Instruct on Amsler grid self-monitoring
- Advise to report any sudden changes""",
        
        is_mandatory=True,
        can_be_rescheduled=True
    )
    
    # Add treatment for Step 2
    ProtocolStepTreatment.objects.create(
        protocol_step=step2,
        treatment_type="injection",
        treatment_name="Intravitreal Anti-VEGF Injection",
        description="Intravitreal injection of anti-VEGF medication for wet AMD",
        eye_side="",  # Will be determined based on affected eye
        expected_duration_minutes=15,
        requires_anesthesia=True,
        anesthesia_type="Topical (Proxymetacaine 0.5%)",
        special_instructions="Use aseptic technique, povidone-iodine prep, post-injection IOP check",
        administer_at_same_time=True,
        offset_days=0,
        order=1
    )
    print("   ✅ Added intravitreal injection treatment to Step 2")
    
    # Add monitoring tests for Step 2 (before each injection)
    tests_step2 = [
        {
            'test_type': 'visual_acuity',
            'test_name': 'Pre-injection Visual Acuity',
            'description': 'VA check before each injection',
            'eye_side': '',
            'is_baseline': False,
            'expected_values': 'Monitor for changes from baseline',
            'order': 1
        },
        {
            'test_type': 'iop',
            'test_name': 'Intraocular Pressure Check',
            'description': 'Pre and post-injection IOP measurement',
            'eye_side': 'OU',
            'is_baseline': False,
            'expected_values': '10-21 mmHg normal range',
            'order': 2
        }
    ]
    
    for test_data in tests_step2:
        ProtocolStepTest.objects.create(
            protocol_step=step2,
            administer_at_same_time=True,
            offset_days=0,
            special_instructions='Perform immediately before injection',
            **test_data
        )
    print(f"   ✅ Added {len(tests_step2)} monitoring tests to Step 2")
    
    # ==================== STEP 3: Post-Loading Assessment ====================
    print("\n📝 Creating Step 3: Post-Loading Assessment...")
    step3 = ProtocolStep.objects.create(
        protocol=protocol,
        step_number=3,
        step_type="assessment",
        title="Post-Loading Phase Assessment",
        description="""Comprehensive assessment 4 weeks after 3rd loading injection.

Evaluate:
- Treatment response (VA improvement/stability)
- Anatomical changes on OCT (fluid reduction)
- Need for ongoing therapy
- Optimal maintenance interval

Determines next treatment pathway:
- Good response: Consider treat-and-extend
- Partial response: Continue monthly
- No response: Consider alternative therapy""",
        
        timing_type="from_previous",
        timing_days=28,  # 4 weeks after last loading injection
        timing_window_before=3,
        timing_window_after=7,
        
        is_recurring=False,
        has_branches=True,
        branch_condition_type="measurement",
        branch_logic={
            "evaluation_field": "treatment_response",
            "conditions": [
                {
                    "result": "good_response",
                    "operator": "equals",
                    "next_step": 4,
                    "label": "Good Response → Treat & Extend pathway"
                },
                {
                    "result": "partial_response",
                    "operator": "equals",
                    "next_step": 5,
                    "label": "Partial Response → Continue monthly injections"
                },
                {
                    "result": "no_response",
                    "operator": "equals",
                    "next_step": 5,
                    "label": "No Response → Consider alternative therapy"
                }
            ],
            "default_next_step": 5
        },
        
        pre_instructions="""Assessment preparation:
- Review previous VA and OCT results
- Compare baseline to current measurements
- Have treatment options discussion ready
- Prepare visual aids for patient education""",
        
        post_instructions="""After assessment:
- Discuss results with patient
- Explain recommended treatment plan
- Address patient concerns and preferences
- Schedule appropriate follow-up
- Provide written summary of findings""",
        
        is_mandatory=True,
        can_be_rescheduled=True
    )
    
    # Add comprehensive assessment tests for Step 3
    tests_step3 = [
        {
            'test_type': 'visual_acuity',
            'test_name': 'Best Corrected Visual Acuity',
            'description': 'Compare to baseline VA',
            'eye_side': 'OU',
            'is_baseline': False,
            'expected_values': 'Improvement of ≥5 letters = good response',
            'order': 1
        },
        {
            'test_type': 'oct',
            'test_name': 'OCT Macula - Response Assessment',
            'description': 'Assess reduction in macular fluid',
            'eye_side': 'OU',
            'is_baseline': False,
            'expected_values': 'Dry macula or significant fluid reduction = good response',
            'order': 2
        },
        {
            'test_type': 'fundus_photo',
            'test_name': 'Color Fundus Photography',
            'description': 'Document current macular status',
            'eye_side': 'OU',
            'is_baseline': False,
            'expected_values': 'Compare to baseline images',
            'order': 3
        }
    ]
    
    for test_data in tests_step3:
        ProtocolStepTest.objects.create(
            protocol_step=step3,
            administer_at_same_time=True,
            offset_days=0,
            special_instructions='Comprehensive response evaluation',
            **test_data
        )
    print(f"   ✅ Added {len(tests_step3)} assessment tests to Step 3")
    
    # ==================== STEP 4: Treat & Extend (Good Responders) ====================
    print("\n📝 Creating Step 4: Treat & Extend Protocol...")
    step4 = ProtocolStep.objects.create(
        protocol=protocol,
        step_number=4,
        step_type="treatment",
        title="Treat & Extend Protocol (Good Responders)",
        description="""Maintenance protocol for good responders to anti-VEGF therapy.

Treat & Extend strategy:
- Inject at each visit while no disease activity
- Gradually extend interval between treatments
- Typically extend by 2-4 weeks each time
- Maximum interval usually 12-16 weeks
- If recurrence, return to last effective interval

Goals:
- Maintain dry macula
- Reduce treatment burden
- Minimize clinic visits
- Maintain visual gains""",
        
        timing_type="from_previous",
        timing_days=42,  # Start at 6 weeks, then extend
        timing_window_before=3,
        timing_window_after=7,
        
        is_recurring=True,
        recurrence_count=None,  # Ongoing as needed
        
        has_branches=True,
        branch_condition_type="measurement",
        branch_logic={
            "evaluation_field": "disease_activity",
            "conditions": [
                {
                    "result": "no_activity",
                    "operator": "equals",
                    "next_step": 4,
                    "label": "No Activity → Extend interval by 2 weeks"
                },
                {
                    "result": "recurrence",
                    "operator": "equals",
                    "next_step": 5,
                    "label": "Recurrence → Return to monthly injections"
                }
            ],
            "default_next_step": 4
        },
        
        pre_instructions="""Before each visit:
- Review last injection date and interval
- Check for any interim symptoms
- Prepare for injection and assessment
- Calculate next visit interval""",
        
        post_instructions="""After injection:
- Schedule next visit (current interval + extension if stable)
- Provide Amsler grid for home monitoring
- Instruct to contact if vision worsens
- Document interval decision rationale""",
        
        is_mandatory=False,
        can_be_rescheduled=True
    )
    
    # Add treatment and monitoring for Step 4
    ProtocolStepTreatment.objects.create(
        protocol_step=step4,
        treatment_type="injection",
        treatment_name="Intravitreal Anti-VEGF Injection (Extended Interval)",
        description="Ongoing anti-VEGF therapy with gradually extended intervals",
        eye_side="",
        expected_duration_minutes=15,
        requires_anesthesia=True,
        anesthesia_type="Topical",
        special_instructions="Assess disease activity before deciding on next interval",
        administer_at_same_time=True,
        offset_days=0,
        order=1
    )
    
    tests_step4 = [
        {
            'test_type': 'visual_acuity',
            'test_name': 'Visual Acuity Monitoring',
            'description': 'VA at each visit',
            'eye_side': 'OU',
            'is_baseline': False,
            'expected_values': 'Stable VA supports interval extension',
            'order': 1
        },
        {
            'test_type': 'oct',
            'test_name': 'OCT Disease Activity Assessment',
            'description': 'Check for new or recurrent fluid',
            'eye_side': 'OU',
            'is_baseline': False,
            'expected_values': 'Dry macula allows interval extension',
            'order': 2
        },
        {
            'test_type': 'iop',
            'test_name': 'IOP Check',
            'description': 'Monitor for IOP elevation',
            'eye_side': 'OU',
            'is_baseline': False,
            'expected_values': 'Normal 10-21 mmHg',
            'order': 3
        }
    ]
    
    for test_data in tests_step4:
        ProtocolStepTest.objects.create(
            protocol_step=step4,
            administer_at_same_time=True,
            offset_days=0,
            special_instructions='Perform before each injection',
            **test_data
        )
    print(f"   ✅ Added treatment and {len(tests_step4)} tests to Step 4")
    
    # ==================== STEP 5: Monthly Maintenance (Partial/Non-Responders) ====================
    print("\n📝 Creating Step 5: Monthly Maintenance Protocol...")
    step5 = ProtocolStep.objects.create(
        protocol=protocol,
        step_number=5,
        step_type="treatment",
        title="Monthly Maintenance Injections (Partial/Non-Responders)",
        description="""Continued monthly anti-VEGF therapy for patients requiring ongoing treatment.

For patients with:
- Partial response to loading phase
- Persistent disease activity
- Recurrence on extended intervals

Protocol:
- Monthly intravitreal injections
- Regular monitoring of disease activity
- Periodic reassessment of response
- Consider alternative agents if no improvement
- May trial combination therapy or PDT if appropriate""",
        
        timing_type="monthly",
        timing_days=28,  # Monthly injections
        timing_window_before=3,
        timing_window_after=7,
        
        is_recurring=True,
        recurrence_count=None,  # Ongoing
        
        has_branches=True,
        branch_condition_type="measurement",
        branch_logic={
            "evaluation_field": "long_term_response",
            "conditions": [
                {
                    "result": "improvement",
                    "operator": "equals",
                    "next_step": 4,
                    "label": "If improvement → Trial treat & extend"
                },
                {
                    "result": "stable",
                    "operator": "equals",
                    "next_step": 5,
                    "label": "If stable → Continue monthly"
                },
                {
                    "result": "deterioration",
                    "operator": "equals",
                    "next_step": 5,
                    "label": "If worsening → Consider alternative therapy"
                }
            ],
            "default_next_step": 5
        },
        
        pre_instructions="""Monthly visit preparation:
- Review treatment history and response
- Assess for any side effects or complications
- Prepare for injection protocol
- Consider need for alternative therapy""",
        
        post_instructions="""Post-injection:
- Schedule next monthly injection
- Monitor for any adverse events
- Reassess treatment plan every 3 months
- Consider referral if refractory disease""",
        
        is_mandatory=False,
        can_be_rescheduled=True
    )
    
    # Add treatment and tests for Step 5
    ProtocolStepTreatment.objects.create(
        protocol_step=step5,
        treatment_type="injection",
        treatment_name="Monthly Anti-VEGF Injection",
        description="Fixed monthly anti-VEGF therapy for persistent disease",
        eye_side="",
        expected_duration_minutes=15,
        requires_anesthesia=True,
        anesthesia_type="Topical",
        special_instructions="Continue monthly until disease stabilization achieved",
        administer_at_same_time=True,
        offset_days=0,
        order=1
    )
    
    tests_step5 = [
        {
            'test_type': 'visual_acuity',
            'test_name': 'Monthly VA Check',
            'description': 'Monitor visual stability',
            'eye_side': 'OU',
            'is_baseline': False,
            'expected_values': 'Track trends over time',
            'order': 1
        },
        {
            'test_type': 'oct',
            'test_name': 'Monthly OCT Monitoring',
            'description': 'Assess persistent fluid/disease activity',
            'eye_side': 'OU',
            'is_baseline': False,
            'expected_values': 'Monitor for anatomical changes',
            'order': 2
        }
    ]
    
    for test_data in tests_step5:
        ProtocolStepTest.objects.create(
            protocol_step=step5,
            administer_at_same_time=True,
            offset_days=0,
            special_instructions='Monthly monitoring',
            **test_data
        )
    print(f"   ✅ Added treatment and {len(tests_step5)} tests to Step 5")
    
    # ==================== STEP 6: Dry AMD Management ====================
    print("\n📝 Creating Step 6: Dry AMD Management...")
    step6 = ProtocolStep.objects.create(
        protocol=protocol,
        step_number=6,
        step_type="consultation",
        title="Dry AMD - Monitoring & Lifestyle Management",
        description="""Management pathway for dry AMD (non-neovascular).

Focuses on:
- Regular monitoring for progression to wet AMD
- Lifestyle modifications and risk factor management
- AREDS2 vitamin supplementation (if appropriate)
- Patient education on warning signs
- Home monitoring with Amsler grid

Monitoring intervals based on severity:
- Early AMD: Annual
- Intermediate AMD: Every 6 months
- Advanced dry AMD (geographic atrophy): Every 3-6 months""",
        
        timing_type="fixed",
        timing_days=0,  # Immediate education session
        timing_window_before=0,
        timing_window_after=14,
        
        is_recurring=False,
        
        has_branches=False,
        
        pre_instructions="""Dry AMD consultation preparation:
- Review patient's AMD severity staging
- Prepare AREDS2 supplement information
- Have lifestyle modification materials ready
- Prepare Amsler grid for home use
- Schedule appropriate follow-up interval""",
        
        post_instructions="""After consultation:
- Provide written AMD information
- Supply Amsler grid with instructions
- Schedule next monitoring visit
- Discuss warning signs of wet AMD
- Encourage smoking cessation if applicable
- Recommend dietary modifications""",
        
        is_mandatory=True,
        can_be_rescheduled=False
    )
    
    # Add treatment (supplements and lifestyle) for Step 6
    treatments_step6 = [
        {
            'treatment_type': 'supplement',
            'treatment_name': 'AREDS2 Formula Supplementation',
            'description': 'Vitamin C, E, Zinc, Copper, Lutein, Zeaxanthin',
            'eye_side': '',
            'expected_duration_minutes': 0,
            'requires_anesthesia': False,
            'special_instructions': 'Recommend AREDS2 formulation if intermediate or advanced dry AMD',
            'order': 1
        },
        {
            'treatment_type': 'lifestyle',
            'treatment_name': 'Lifestyle Modifications',
            'description': 'Diet, exercise, smoking cessation, UV protection',
            'eye_side': '',
            'expected_duration_minutes': 30,
            'requires_anesthesia': False,
            'special_instructions': 'Counsel on Mediterranean diet, leafy greens, omega-3, quit smoking',
            'order': 2
        },
        {
            'treatment_type': 'observation',
            'treatment_name': 'Home Amsler Grid Monitoring',
            'description': 'Daily self-monitoring for distortion or changes',
            'eye_side': 'OU',
            'expected_duration_minutes': 5,
            'requires_anesthesia': False,
            'special_instructions': 'Instruct patient to test each eye separately daily',
            'order': 3
        }
    ]
    
    for treatment_data in treatments_step6:
        ProtocolStepTreatment.objects.create(
            protocol_step=step6,
            administer_at_same_time=True,
            offset_days=0,
            **treatment_data
        )
    print(f"   ✅ Added {len(treatments_step6)} interventions to Step 6")
    
    # ==================== STEP 7: Dry AMD Follow-up Monitoring ====================
    print("\n📝 Creating Step 7: Dry AMD Follow-up...")
    step7 = ProtocolStep.objects.create(
        protocol=protocol,
        step_number=7,
        step_type="follow_up",
        title="Dry AMD Monitoring Visit",
        description="""Scheduled monitoring for dry AMD patients.

Visit includes:
- Visual acuity testing
- OCT scan to detect early wet AMD conversion
- Fundus examination for progression
- Patient symptom review
- Amsler grid testing in clinic

Watch for signs of conversion to wet AMD:
- Sudden vision loss
- New distortion or blurring
- Subretinal fluid on OCT
- New hemorrhage or exudates""",
        
        timing_type="from_previous",
        timing_days=182,  # 6 months for intermediate AMD
        timing_window_before=14,
        timing_window_after=14,
        
        is_recurring=True,
        recurrence_count=None,  # Ongoing monitoring
        
        has_branches=True,
        branch_condition_type="test_result",
        branch_logic={
            "evaluation_field": "conversion_to_wet",
            "conditions": [
                {
                    "result": "yes",
                    "operator": "equals",
                    "next_step": 2,
                    "label": "If conversion to wet AMD → Urgent anti-VEGF pathway"
                },
                {
                    "result": "no",
                    "operator": "equals",
                    "next_step": 7,
                    "label": "If remains dry → Continue monitoring"
                }
            ],
            "default_next_step": 7
        },
        
        pre_instructions="""Before monitoring visit:
- Review previous exam findings
- Check patient's home Amsler grid compliance
- Prepare for dilated examination""",
        
        post_instructions="""After monitoring visit:
- Discuss any changes with patient
- Adjust monitoring interval if needed
- Reinforce warning signs
- Schedule next follow-up
- Urgent referral if wet AMD detected""",
        
        is_mandatory=False,
        can_be_rescheduled=True
    )
    
    # Add monitoring tests for Step 7
    tests_step7 = [
        {
            'test_type': 'visual_acuity',
            'test_name': 'Visual Acuity Monitoring',
            'description': 'Detect any VA decline',
            'eye_side': 'OU',
            'is_baseline': False,
            'expected_values': 'Stable VA expected in dry AMD',
            'order': 1
        },
        {
            'test_type': 'oct',
            'test_name': 'OCT Surveillance for CNV',
            'description': 'Screen for conversion to wet AMD',
            'eye_side': 'OU',
            'is_baseline': False,
            'expected_values': 'No subretinal/intraretinal fluid',
            'order': 2
        },
        {
            'test_type': 'dilated_exam',
            'test_name': 'Fundus Examination',
            'description': 'Assess for drusen progression or geographic atrophy',
            'eye_side': 'OU',
            'is_baseline': False,
            'expected_values': 'Stable or slow progression expected',
            'order': 3
        },
        {
            'test_type': 'amsler_grid',
            'test_name': 'Amsler Grid In-Office',
            'description': 'Test for new metamorphopsia',
            'eye_side': 'OU',
            'is_baseline': False,
            'expected_values': 'No new distortions',
            'order': 4
        }
    ]
    
    for test_data in tests_step7:
        ProtocolStepTest.objects.create(
            protocol_step=step7,
            administer_at_same_time=True,
            offset_days=0,
            special_instructions='Comprehensive monitoring for disease progression',
            **test_data
        )
    print(f"   ✅ Added {len(tests_step7)} monitoring tests to Step 7")
    
    # ==================== Summary ====================
    print("\n" + "="*70)
    print("✅ AMD CARE PATHWAY PROTOCOL CREATED SUCCESSFULLY!")
    print("="*70)
    print(f"\n📋 Protocol: {protocol.name}")
    print(f"🔖 Code: {protocol.code}")
    print(f"⏱️  Duration: {protocol.total_duration_weeks} weeks")
    print(f"✅ Active: {protocol.is_active}")
    
    steps = ProtocolStep.objects.filter(protocol=protocol).order_by('step_number')
    print(f"\n📊 Created {steps.count()} protocol steps:")
    
    for step in steps:
        medications = ProtocolStepMedication.objects.filter(protocol_step=step).count()
        treatments = ProtocolStepTreatment.objects.filter(protocol_step=step).count()
        tests = ProtocolStepTest.objects.filter(protocol_step=step).count()
        
        print(f"\n   Step {step.step_number}: {step.title}")
        print(f"   - Type: {step.get_step_type_display()}")
        print(f"   - Timing: {step.get_timing_type_display()} (Day {step.timing_days})")
        if step.is_recurring:
            print(f"   - Recurring: {step.recurrence_count if step.recurrence_count else 'Ongoing'} times")
        if step.has_branches:
            print(f"   - Branching: Yes ({step.get_branch_condition_type_display()})")
        print(f"   - Items: {medications} medications, {treatments} treatments, {tests} tests")
    
    print("\n" + "="*70)
    print("🎯 PROTOCOL READY FOR USE!")
    print("="*70)
    print("\n📍 Next steps:")
    print("   1. View protocol in admin or frontend")
    print("   2. Assign to a test patient to see full schedule generation")
    print("   3. Test branching logic with different scenarios")
    print("   4. Review and adjust as needed")
    print("\n")

if __name__ == "__main__":
    try:
        create_amd_protocol()
    except Exception as e:
        print(f"\n❌ Error creating protocol: {e}")
        import traceback
        traceback.print_exc()
