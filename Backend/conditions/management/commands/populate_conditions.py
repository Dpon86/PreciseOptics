"""
Management command to populate default medical conditions
Run with: python manage.py populate_conditions
"""
from django.core.management.base import BaseCommand
from django.db import transaction
from conditions.models import MedicalCondition
from accounts.models import CustomUser
import json


class Command(BaseCommand):
    help = 'Populate the database with default medical conditions'

    def handle(self, *args, **options):
        # Get the first admin user or create system user
        try:
            admin_user = CustomUser.objects.filter(user_type='admin').first()
            if not admin_user:
                admin_user = CustomUser.objects.first()
            
            if not admin_user:
                self.stdout.write(self.style.ERROR('No users found. Please create a user first.'))
                return
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error getting user: {e}'))
            return

        conditions_data = [
            {
                'code': 'AMD',
                'name': 'Age-Related Macular Degeneration',
                'category': 'retinal',
                'description': 'Age-related macular degeneration (AMD) is a progressive eye condition affecting the macula, leading to central vision loss.',
                'symptoms': '''Early Symptoms:
- Slightly blurred central vision
- Difficulty recognizing faces
- Need for brighter light when reading

Intermediate Symptoms:
- Distorted or wavy central vision
- Dark or blurry spots in central vision
- Difficulty seeing in low light

Advanced Symptoms:
- Significant central vision loss
- Difficulty reading or recognizing faces
- Visual hallucinations (Charles Bonnet syndrome)''',
                'risk_factors': '''- Age over 50
- Family history of AMD
- Smoking
- High blood pressure
- Obesity
- Caucasian ethnicity
- Cardiovascular disease''',
                'typical_progression': 'AMD progresses from early stage with drusen deposits to intermediate with more extensive changes, potentially advancing to geographic atrophy (dry AMD) or choroidal neovascularization (wet AMD).',
                'standard_treatments': '''Dry AMD:
- AREDS2 vitamin supplements
- Lifestyle modifications (stop smoking, healthy diet)
- Regular monitoring
- Low vision aids

Wet AMD:
- Anti-VEGF injections (Lucentis, Eylea, Avastin)
- Photodynamic therapy (PDT)
- Laser therapy (in selected cases)
- Vision rehabilitation''',
                'prognosis': 'Dry AMD: 6-12 months monitoring; Wet AMD: 4-8 weeks during active treatment. Early detection and treatment can slow progression.',
                'has_standard_protocol': True
            },
            {
                'code': 'RVO',
                'name': 'Retinal Vein Occlusion',
                'category': 'retinal',
                'description': 'Retinal vein occlusion is a blockage of the small veins that carry blood away from the retina, leading to vision loss.',
                'symptoms': '''Acute Symptoms:
- Sudden, painless vision loss or blurring
- Distorted vision
- Blind spots in visual field
- Floaters

Chronic Symptoms:
- Persistent vision loss
- Metamorphopsia (distorted vision)
- Difficulty with color perception''',
                'risk_factors': '''- High blood pressure
- Diabetes
- Glaucoma
- Age over 60
- Smoking
- Blood clotting disorders
- Atherosclerosis''',
                'typical_progression': 'Can be central retinal vein occlusion (CRVO) or branch retinal vein occlusion (BRVO). May lead to macular edema, neovascularization, and permanent vision loss if untreated.',
                'standard_treatments': '''CRVO:
- Anti-VEGF injections (Lucentis, Eylea)
- Intravitreal steroids (Ozurdex)
- Laser photocoagulation for ischemic areas
- Management of systemic risk factors

BRVO:
- Anti-VEGF injections
- Macular laser photocoagulation
- Observation if vision is good and no macular edema
- Treatment of underlying causes''',
                'prognosis': 'Initial: Weekly to monthly; Maintenance: 4-8 weeks; Long-term: 3-6 months. Visual outcomes depend on severity and timely treatment.',
                'has_standard_protocol': True
            },
            {
                'code': 'GLAUCOMA',
                'name': 'Glaucoma',
                'category': 'glaucoma',
                'description': 'Glaucoma is a group of eye conditions that damage the optic nerve, often due to elevated intraocular pressure.',
                'symptoms': '''Early Stage:
- Often asymptomatic
- Gradual loss of peripheral vision
- Occasionally: mild eye discomfort

Moderate Stage:
- Noticeable peripheral vision loss
- Difficulty with night vision
- Halos around lights

Advanced Stage:
- Tunnel vision
- Severe peripheral vision loss
- Central vision may be affected
- Difficulty with mobility

Acute Angle Closure:
- Severe eye pain
- Headache
- Blurred vision
- Nausea and vomiting
- Halos around lights
- Red eye''',
                'risk_factors': '''- Age over 60
- Family history of glaucoma
- African, Hispanic, or Asian ancestry
- High intraocular pressure
- Thin corneas
- Diabetes
- High myopia or hyperopia
- Previous eye injury or surgery
- Long-term corticosteroid use''',
                'typical_progression': 'Progressive optic nerve damage and visual field loss. Can progress from early peripheral loss to advanced tunnel vision and blindness if untreated.',
                'standard_treatments': '''Medications:
- Prostaglandin analogs (Latanoprost, Bimatoprost)
- Beta blockers (Timolol)
- Alpha agonists (Brimonidine)
- Carbonic anhydrase inhibitors (Dorzolamide)
- Combination drops

Laser Treatments:
- Selective Laser Trabeculoplasty (SLT)
- Laser Peripheral Iridotomy (LPI) for angle closure
- Cyclophotocoagulation for refractory cases

Surgery:
- Trabeculectomy
- Glaucoma drainage devices (Ahmed, Baerveldt)
- Minimally Invasive Glaucoma Surgery (MIGS)
- Tube shunt procedures''',
                'prognosis': 'Stable: 3-6 months; Progressing: 1-3 months; Post-surgery: Weekly to monthly initially. With proper treatment, most patients maintain useful vision.',
                'has_standard_protocol': True
            },
            {
                'code': 'DIABETIC_RET',
                'name': 'Diabetic Retinopathy',
                'category': 'retinal',
                'description': 'Diabetic retinopathy is a diabetes complication affecting the blood vessels in the retina, potentially leading to vision loss.',
                'symptoms': '''Early Stage:
- Often asymptomatic
- Mild vision blurring
- Fluctuating vision

Moderate Stage:
- Floaters
- Dark spots in vision
- Difficulty with color perception
- Impaired night vision

Advanced Stage:
- Significant vision loss
- Large areas of vision loss
- Complete vision loss possible''',
                'risk_factors': '''- Duration of diabetes
- Poor blood sugar control (high HbA1c)
- High blood pressure
- High cholesterol
- Pregnancy
- Smoking
- Kidney disease
- Ethnicity (higher risk in African Americans, Hispanics, Native Americans)''',
                'typical_progression': 'Progresses from mild non-proliferative DR (NPDR) to moderate/severe NPDR to proliferative DR (PDR). Can develop diabetic macular edema (DME) at any stage.',
                'standard_treatments': '''Mild NPDR:
- Optimize diabetic control (HbA1c < 7%)
- Control blood pressure
- Regular monitoring every 6-12 months
- No immediate treatment needed

Moderate/Severe NPDR:
- Close monitoring every 3-6 months
- Consider pan-retinal photocoagulation (PRP)
- Anti-VEGF injections if macular edema present
- Tight glycemic and blood pressure control

PDR:
- Pan-retinal photocoagulation (PRP) laser
- Anti-VEGF injections
- Vitrectomy surgery if needed
- Intravitreal steroids for macular edema

DME:
- Anti-VEGF injections (Lucentis, Eylea, Avastin)
- Focal/grid laser photocoagulation
- Intravitreal steroids (Ozurdex, Iluvien)
- Combination therapy''',
                'prognosis': 'No DR: Annually; Mild NPDR: 6-12 months; Moderate NPDR: 3-6 months; Severe NPDR/PDR: 1-3 months; DME: Monthly during treatment. Early detection and tight diabetic control are crucial.',
                'has_standard_protocol': True
            },
            {
                'code': 'CATARACT_POST',
                'name': 'Post-Cataract Surgery Monitoring',
                'category': 'anterior_segment',
                'description': 'Post-operative care and monitoring following cataract surgery to ensure optimal outcomes and detect complications.',
                'symptoms': '''Normal Post-Op:
- Mild discomfort or foreign body sensation
- Mild redness
- Light sensitivity
- Watery eye
- Improved but fluctuating vision

Warning Signs/Complications:
- Severe pain
- Significant vision decrease
- Increased redness
- Flashes or floaters (retinal detachment risk)
- Cloudy vision (PCO or infection)''',
                'risk_factors': '''Endophthalmitis Risk:
- Diabetes
- Immunosuppression
- Blepharitis
- Poor wound construction

CME Risk:
- Diabetes
- Uveitis
- Epiretinal membrane
- Complicated surgery

PCO Risk:
- Younger age
- IOL material and design
- Incomplete cortex removal''',
                'typical_progression': 'Normal recovery over 4-8 weeks. Potential complications include posterior capsule opacification (PCO), cystoid macular edema (CME), or rarely endophthalmitis.',
                'standard_treatments': '''Routine Post-Op:
- Topical antibiotics (1 week)
- Topical steroids (4-6 weeks, tapered)
- Topical NSAIDs (4 weeks)
- Eye protection
- Activity restrictions

Complications:
- Endophthalmitis: Immediate intravitreal antibiotics, possible vitrectomy
- CME: NSAIDs, steroids, anti-VEGF injections if persistent
- PCO: YAG laser capsulotomy
- Wound leak: Bandage contact lens, suturing if needed
- Elevated IOP: Topical IOP-lowering medications''',
                'prognosis': 'Day 1, Week 1, Week 4, Week 8-12 (typical); More frequent if complications. Most patients achieve excellent visual outcomes.',
                'has_standard_protocol': True
            }
        ]

        self.stdout.write(self.style.SUCCESS('Starting to populate medical conditions...'))

        with transaction.atomic():
            created_count = 0
            updated_count = 0

            for condition_data in conditions_data:
                code = condition_data['code']
                
                # Check if condition already exists
                condition, created = MedicalCondition.objects.get_or_create(
                    code=code,
                    defaults={
                        **condition_data,
                        'created_by': admin_user
                    }
                )

                if created:
                    created_count += 1
                    self.stdout.write(
                        self.style.SUCCESS(f'✓ Created: {condition.name} ({code})')
                    )
                else:
                    # Update existing condition
                    for key, value in condition_data.items():
                        if key != 'code':  # Don't update the code
                            setattr(condition, key, value)
                    condition.save()
                    updated_count += 1
                    self.stdout.write(
                        self.style.WARNING(f'⟳ Updated: {condition.name} ({code})')
                    )

        self.stdout.write(
            self.style.SUCCESS(
                f'\n✓ Successfully processed {created_count + updated_count} conditions'
            )
        )
        self.stdout.write(
            self.style.SUCCESS(f'  - Created: {created_count}')
        )
        self.stdout.write(
            self.style.SUCCESS(f'  - Updated: {updated_count}')
        )
