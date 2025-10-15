"""
Management command to populate essential treatment data for UK eye hospitals
"""
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from treatments.models import TreatmentCategory, TreatmentType

User = get_user_model()


class Command(BaseCommand):
    help = 'Populate essential treatment categories and types for UK eye hospitals'

    def handle(self, *args, **options):
        # Get or create a system user for creating reference data
        system_user, created = User.objects.get_or_create(
            username='system',
            defaults={
                'email': 'system@preciseoptics.uk',
                'first_name': 'System',
                'last_name': 'Administrator',
                'user_type': 'admin',
                'is_active': True,
                'is_staff': True
            }
        )

        self.stdout.write('Creating treatment categories...')
        
        # Create treatment categories
        categories_data = [
            {
                'name': 'Cataract Surgery',
                'category_type': 'surgical',
                'description': 'Surgical removal of cataracts including phacoemulsification and IOL implantation'
            },
            {
                'name': 'Glaucoma Surgery',
                'category_type': 'surgical',
                'description': 'Surgical procedures for glaucoma management including trabeculectomy and drainage devices'
            },
            {
                'name': 'Retinal Surgery',
                'category_type': 'surgical',
                'description': 'Vitreoretinal procedures including vitrectomy and retinal detachment repair'
            },
            {
                'name': 'Corneal Surgery',
                'category_type': 'surgical',
                'description': 'Corneal transplants, refractive surgery, and corneal repair procedures'
            },
            {
                'name': 'Oculoplastic Surgery',
                'category_type': 'surgical',
                'description': 'Eyelid surgery, orbital surgery, and tear duct procedures'
            },
            {
                'name': 'Laser Treatments',
                'category_type': 'laser',
                'description': 'Laser procedures including YAG capsulotomy, photocoagulation, and refractive laser surgery'
            },
            {
                'name': 'Intravitreal Injections',
                'category_type': 'injection',
                'description': 'Injection treatments for macular degeneration, diabetic retinopathy, and other retinal conditions'
            },
            {
                'name': 'Medical Treatments',
                'category_type': 'medical',
                'description': 'Non-surgical medical management including medications and topical treatments'
            },
            {
                'name': 'Emergency Procedures',
                'category_type': 'emergency',
                'description': 'Urgent eye care including trauma repair and acute angle closure management'
            },
            {
                'name': 'Optical Treatments',
                'category_type': 'optical',
                'description': 'Vision correction including contact lens fitting and low vision aids'
            }
        ]

        categories = {}
        for cat_data in categories_data:
            category, created = TreatmentCategory.objects.get_or_create(
                name=cat_data['name'],
                defaults={
                    'category_type': cat_data['category_type'],
                    'description': cat_data['description'],
                    'created_by': system_user
                }
            )
            categories[cat_data['name']] = category
            if created:
                self.stdout.write(f'  ✓ Created category: {category.name}')
            else:
                self.stdout.write(f'  - Category exists: {category.name}')

        self.stdout.write('\nCreating treatment types...')

        # Create detailed treatment types
        treatments_data = [
            # Cataract Surgery
            {
                'category': 'Cataract Surgery',
                'name': 'Phacoemulsification with IOL Implantation',
                'code': 'C751',
                'description': 'Standard cataract surgery using phacoemulsification technique with intraocular lens implantation',
                'duration': 30,
                'requires_consent': True,
                'anesthesia': 'topical',
                'urgency': 'routine',
                'success_rate': 98.5,
                'cost': 2500.00,
                'waiting_weeks': 12,
                'contraindications': 'Active eye infection, uncontrolled glaucoma, severe dry eye',
                'complications': 'Posterior capsule rupture (2%), endophthalmitis (<0.1%), retinal detachment (0.5%)'
            },
            {
                'category': 'Cataract Surgery',
                'name': 'Complex Cataract Surgery',
                'code': 'C752',
                'description': 'Complicated cataract surgery with additional techniques for dense or challenging cataracts',
                'duration': 60,
                'requires_consent': True,
                'anesthesia': 'local',
                'urgency': 'routine',
                'success_rate': 95.0,
                'cost': 3500.00,
                'waiting_weeks': 16,
                'contraindications': 'Active eye infection, severe corneal opacity',
                'complications': 'Higher risk of complications due to complexity'
            },
            {
                'category': 'Cataract Surgery',
                'name': 'Premium IOL Implantation',
                'code': 'C753',
                'description': 'Cataract surgery with premium intraocular lens (multifocal, toric, or extended depth of focus)',
                'duration': 45,
                'requires_consent': True,
                'anesthesia': 'topical',
                'urgency': 'routine',
                'success_rate': 97.0,
                'cost': 4500.00,
                'waiting_weeks': 20,
                'contraindications': 'Irregular astigmatism, macular pathology, unrealistic expectations',
                'complications': 'Glare, halos, reduced contrast sensitivity in some patients'
            },

            # Glaucoma Surgery
            {
                'category': 'Glaucoma Surgery',
                'name': 'Trabeculectomy',
                'code': 'C604',
                'description': 'Surgical creation of a drainage pathway to lower intraocular pressure',
                'duration': 90,
                'requires_consent': True,
                'anesthesia': 'local',
                'urgency': 'urgent',
                'success_rate': 85.0,
                'cost': 3000.00,
                'waiting_weeks': 8,
                'contraindications': 'Previous conjunctival surgery, severe scarring, patient non-compliance',
                'complications': 'Hypotony, infection, bleb failure, cataract formation'
            },
            {
                'category': 'Glaucoma Surgery',
                'name': 'Ahmed Glaucoma Valve Implantation',
                'code': 'C605',
                'description': 'Implantation of drainage device for refractory glaucoma',
                'duration': 120,
                'requires_consent': True,
                'anesthesia': 'local',
                'urgency': 'urgent',
                'success_rate': 80.0,
                'cost': 4000.00,
                'waiting_weeks': 6,
                'contraindications': 'Active infection, severe conjunctival scarring',
                'complications': 'Tube exposure, corneal decompensation, diplopia'
            },
            {
                'category': 'Glaucoma Surgery',
                'name': 'Selective Laser Trabeculoplasty (SLT)',
                'code': 'C629',
                'description': 'Laser treatment to improve aqueous humor drainage',
                'duration': 20,
                'requires_consent': False,
                'anesthesia': 'topical',
                'urgency': 'routine',
                'success_rate': 75.0,
                'cost': 800.00,
                'waiting_weeks': 4,
                'contraindications': 'Angle closure glaucoma, severe corneal opacity',
                'complications': 'Temporary IOP spike, mild inflammation'
            },

            # Retinal Surgery
            {
                'category': 'Retinal Surgery',
                'name': 'Pars Plana Vitrectomy',
                'code': 'C792',
                'description': 'Removal of vitreous gel for retinal pathology treatment',
                'duration': 120,
                'requires_consent': True,
                'anesthesia': 'local',
                'urgency': 'urgent',
                'success_rate': 90.0,
                'cost': 5000.00,
                'waiting_weeks': 2,
                'contraindications': 'Severe media opacity, uncontrolled systemic disease',
                'complications': 'Retinal detachment, cataract formation, infection, bleeding'
            },
            {
                'category': 'Retinal Surgery',
                'name': 'Rhegmatogenous Retinal Detachment Repair',
                'code': 'C793',
                'description': 'Surgical repair of retinal detachment using vitrectomy or scleral buckle',
                'duration': 150,
                'requires_consent': True,
                'anesthesia': 'local',
                'urgency': 'emergency',
                'success_rate': 88.0,
                'cost': 6000.00,
                'waiting_weeks': 1,
                'contraindications': 'Chronic detachment >3 months, severe proliferative vitreoretinopathy',
                'complications': 'Re-detachment, proliferative vitreoretinopathy, cataract'
            },
            {
                'category': 'Retinal Surgery',
                'name': 'Macular Hole Surgery',
                'code': 'C794',
                'description': 'Vitrectomy with membrane peeling for macular hole repair',
                'duration': 90,
                'requires_consent': True,
                'anesthesia': 'local',
                'urgency': 'urgent',
                'success_rate': 92.0,
                'cost': 4500.00,
                'waiting_weeks': 4,
                'contraindications': 'Chronic hole >2 years, poor general health',
                'complications': 'Cataract formation, retinal detachment, visual field defect'
            },

            # Laser Treatments
            {
                'category': 'Laser Treatments',
                'name': 'YAG Laser Capsulotomy',
                'code': 'C659',
                'description': 'Laser treatment for posterior capsule opacification after cataract surgery',
                'duration': 15,
                'requires_consent': False,
                'anesthesia': 'topical',
                'urgency': 'routine',
                'success_rate': 98.0,
                'cost': 400.00,
                'waiting_weeks': 2,
                'contraindications': 'Active inflammation, poor pupil dilation, unstable IOL',
                'complications': 'IOP spike, retinal detachment (rare), IOL damage (rare)'
            },
            {
                'category': 'Laser Treatments',
                'name': 'Panretinal Photocoagulation (PRP)',
                'code': 'C661',
                'description': 'Laser treatment for proliferative diabetic retinopathy',
                'duration': 45,
                'requires_consent': True,
                'anesthesia': 'topical',
                'urgency': 'urgent',
                'success_rate': 85.0,
                'cost': 1200.00,
                'waiting_weeks': 2,
                'contraindications': 'Significant media opacity, pregnancy',
                'complications': 'Night vision problems, peripheral vision loss, macular edema'
            },
            {
                'category': 'Laser Treatments',
                'name': 'Focal Laser Photocoagulation',
                'code': 'C662',
                'description': 'Targeted laser treatment for diabetic macular edema',
                'duration': 30,
                'requires_consent': False,
                'anesthesia': 'topical',
                'urgency': 'urgent',
                'success_rate': 70.0,
                'cost': 800.00,
                'waiting_weeks': 3,
                'contraindications': 'Central macular location, significant macular ischemia',
                'complications': 'Central scotoma, choroidal neovascularization'
            },

            # Intravitreal Injections
            {
                'category': 'Intravitreal Injections',
                'name': 'Anti-VEGF Injection (Ranibizumab)',
                'code': 'C799',
                'description': 'Intravitreal injection of ranibizumab for wet AMD or diabetic macular edema',
                'duration': 15,
                'requires_consent': False,
                'anesthesia': 'topical',
                'urgency': 'urgent',
                'success_rate': 85.0,
                'cost': 800.00,
                'waiting_weeks': 1,
                'contraindications': 'Active eye infection, known hypersensitivity',
                'complications': 'Endophthalmitis (<0.1%), retinal detachment, IOP elevation'
            },
            {
                'category': 'Intravitreal Injections',
                'name': 'Anti-VEGF Injection (Aflibercept)',
                'code': 'C798',
                'description': 'Intravitreal injection of aflibercept for retinal vascular conditions',
                'duration': 15,
                'requires_consent': False,
                'anesthesia': 'topical',
                'urgency': 'urgent',
                'success_rate': 87.0,
                'cost': 900.00,
                'waiting_weeks': 1,
                'contraindications': 'Active infection, hypersensitivity, recent surgery',
                'complications': 'Infection risk, temporary vision changes, eye pressure increase'
            },
            {
                'category': 'Intravitreal Injections',
                'name': 'Steroid Injection (Triamcinolone)',
                'code': 'C797',
                'description': 'Intravitreal steroid injection for macular edema or inflammation',
                'duration': 15,
                'requires_consent': False,
                'anesthesia': 'topical',
                'urgency': 'routine',
                'success_rate': 75.0,
                'cost': 400.00,
                'waiting_weeks': 2,
                'contraindications': 'Viral or fungal infection, glaucoma history',
                'complications': 'Cataract formation, IOP elevation, infection risk'
            },

            # Corneal Surgery
            {
                'category': 'Corneal Surgery',
                'name': 'Penetrating Keratoplasty (PKP)',
                'code': 'C531',
                'description': 'Full-thickness corneal transplant for corneal opacity or decompensation',
                'duration': 180,
                'requires_consent': True,
                'anesthesia': 'general',
                'urgency': 'urgent',
                'success_rate': 85.0,
                'cost': 8000.00,
                'waiting_weeks': 26,
                'contraindications': 'Active infection, poor healing potential, severe dry eye',
                'complications': 'Graft rejection, astigmatism, glaucoma, cataract'
            },
            {
                'category': 'Corneal Surgery',
                'name': 'Descemet Stripping Endothelial Keratoplasty (DSEK)',
                'code': 'C532',
                'description': 'Partial-thickness corneal transplant for endothelial dysfunction',
                'duration': 120,
                'requires_consent': True,
                'anesthesia': 'local',
                'urgency': 'urgent',
                'success_rate': 90.0,
                'cost': 6000.00,
                'waiting_weeks': 20,
                'contraindications': 'Active infection, severe anterior chamber inflammation',
                'complications': 'Graft dislocation, primary graft failure, interface haze'
            }
        ]

        for treatment_data in treatments_data:
            category = categories[treatment_data['category']]
            treatment_type, created = TreatmentType.objects.get_or_create(
                code=treatment_data['code'],
                defaults={
                    'category': category,
                    'name': treatment_data['name'],
                    'description': treatment_data['description'],
                    'typical_duration_minutes': treatment_data['duration'],
                    'requires_consent': treatment_data['requires_consent'],
                    'requires_anesthesia': treatment_data['anesthesia'],
                    'urgency_level': treatment_data['urgency'],
                    'success_rate_percentage': treatment_data.get('success_rate'),
                    'estimated_cost_gbp': treatment_data.get('cost'),
                    'waiting_list_weeks': treatment_data.get('waiting_weeks'),
                    'contraindications': treatment_data.get('contraindications', ''),
                    'complications': treatment_data.get('complications', ''),
                    'created_by': system_user
                }
            )
            if created:
                self.stdout.write(f'  ✓ Created treatment: {treatment_type.name}')
            else:
                self.stdout.write(f'  - Treatment exists: {treatment_type.name}')

        self.stdout.write(
            self.style.SUCCESS(
                f'\nSuccessfully populated treatment data:\n'
                f'- {len(categories)} treatment categories\n'
                f'- {len(treatments_data)} treatment types\n'
                f'All data follows UK NHS standards and OPCS-4 coding'
            )
        )