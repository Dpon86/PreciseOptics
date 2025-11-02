from django.core.management.base import BaseCommand
from django.db import transaction
from protocols.models import TreatmentProtocol, ProtocolStep
from conditions.models import MedicalCondition
from accounts.models import CustomUser


class Command(BaseCommand):
    help = 'Populate default treatment protocols'

    def handle(self, *args, **kwargs):
        self.stdout.write('Starting protocol population...')
        with transaction.atomic():
            user, _ = CustomUser.objects.get_or_create(
                username='system',
                defaults={'email': 'system@local', 'first_name': 'System', 'last_name': 'User', 'user_type': 'admin'}
            )
            
            for code in ['AMD', 'RVO', 'GLAUCOMA', 'DIABETIC_RET', 'CATARACT_POST']:
                try:
                    cond = MedicalCondition.objects.get(code=code)
                    p = TreatmentProtocol.objects.create(
                        code=f'{code}_PROTOCOL',
                        name=f'{code} Treatment Protocol',
                        condition=cond,
                        protocol_type='loading_dose',
                        description=f'Protocol for {code}',
                        indications=f'Standard treatment for {code}',
                        total_duration_weeks=12,
                        requires_consent=True,
                        is_active=True,
                        created_by=user
                    )
                    self.stdout.write(f'  Created: {p.code}')
                except Exception as e:
                    self.stdout.write(f'  Skipped {code}: {e}')
        
        self.stdout.write(self.style.SUCCESS('Done!'))
