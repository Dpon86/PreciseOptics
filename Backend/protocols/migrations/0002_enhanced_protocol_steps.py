# Generated migration for enhanced protocol steps

from django.db import migrations, models
import django.db.models.deletion
import uuid


class Migration(migrations.Migration):

    dependencies = [
        ('protocols', '0001_initial'),
        ('medications', '0001_initial'),
    ]

    operations = [
        # Add new fields to ProtocolStep
        migrations.AddField(
            model_name='protocolstep',
            name='timing_type',
            field=models.CharField(
                choices=[
                    ('fixed', 'Fixed Days from Start'),
                    ('from_previous', 'Days from Previous Step'),
                    ('weekly', 'Weekly Recurring'),
                    ('monthly', 'Monthly Recurring')
                ],
                default='fixed',
                help_text='How timing is calculated',
                max_length=20
            ),
        ),
        migrations.AddField(
            model_name='protocolstep',
            name='is_recurring',
            field=models.BooleanField(default=False, help_text='Whether this step repeats'),
        ),
        migrations.AddField(
            model_name='protocolstep',
            name='recurrence_count',
            field=models.PositiveIntegerField(blank=True, help_text='Number of times to repeat (null = indefinite)', null=True),
        ),
        migrations.AddField(
            model_name='protocolstep',
            name='has_branches',
            field=models.BooleanField(default=False, help_text='Whether this step has conditional branches'),
        ),
        migrations.AddField(
            model_name='protocolstep',
            name='branch_condition_type',
            field=models.CharField(
                blank=True,
                choices=[
                    ('test_result', 'Based on Test Result'),
                    ('outcome', 'Based on Step Outcome'),
                    ('measurement', 'Based on Measurement'),
                    ('adverse_event', 'Based on Adverse Event'),
                    ('manual', 'Manual Decision')
                ],
                help_text='What determines which branch to follow',
                max_length=50
            ),
        ),
        migrations.AddField(
            model_name='protocolstep',
            name='branch_logic',
            field=models.JSONField(blank=True, default=dict, help_text='Branching conditions and next step mappings'),
        ),
        migrations.AddField(
            model_name='protocolstep',
            name='parent_step',
            field=models.ForeignKey(
                blank=True,
                help_text='Parent step if this is a branch',
                null=True,
                on_delete=django.db.models.deletion.CASCADE,
                related_name='child_branches',
                to='protocols.protocolstep'
            ),
        ),
        migrations.AddField(
            model_name='protocolstep',
            name='branch_label',
            field=models.CharField(blank=True, help_text="Label for this branch (e.g., 'If improved', 'If no change')", max_length=100),
        ),
        migrations.AlterField(
            model_name='protocolstep',
            name='step_type',
            field=models.CharField(
                choices=[
                    ('medication', 'Medication Administration'),
                    ('injection', 'Injection'),
                    ('procedure', 'Procedure'),
                    ('test', 'Diagnostic Test'),
                    ('assessment', 'Clinical Assessment'),
                    ('consultation', 'Consultation'),
                    ('follow_up', 'Follow-up Visit'),
                    ('imaging', 'Imaging Study'),
                    ('multiple', 'Multiple Actions')
                ],
                max_length=20
            ),
        ),
        # Create new ProtocolStepMedication model
        migrations.CreateModel(
            name='ProtocolStepMedication',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('dosage_amount', models.CharField(max_length=50)),
                ('dosage_unit', models.CharField(max_length=50)),
                ('route', models.CharField(
                    choices=[
                        ('oral', 'Oral'),
                        ('topical', 'Topical (Eye Drops)'),
                        ('intravitreal', 'Intravitreal Injection'),
                        ('subconjunctival', 'Subconjunctival'),
                        ('iv', 'Intravenous'),
                        ('im', 'Intramuscular')
                    ],
                    max_length=50
                )),
                ('frequency', models.CharField(help_text="e.g., 'Once daily', '3 times daily', 'Every 4 weeks'", max_length=100)),
                ('duration_days', models.PositiveIntegerField(blank=True, help_text='How many days to continue this medication', null=True)),
                ('administer_at_same_time', models.BooleanField(default=True, help_text='Whether this is given at the same visit/time as other step items')),
                ('offset_days', models.IntegerField(default=0, help_text='Days offset from main step timing (can be negative)')),
                ('special_instructions', models.TextField(blank=True)),
                ('eye_side', models.CharField(
                    blank=True,
                    choices=[
                        ('OD', 'Right Eye (OD)'),
                        ('OS', 'Left Eye (OS)'),
                        ('OU', 'Both Eyes (OU)')
                    ],
                    max_length=20
                )),
                ('order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('medication', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='step_medications', to='medications.medication')),
                ('protocol_step', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='medications', to='protocols.protocolstep')),
            ],
            options={
                'verbose_name': 'Protocol Step Medication',
                'verbose_name_plural': 'Protocol Step Medications',
                'ordering': ['protocol_step', 'order'],
            },
        ),
        # Create new ProtocolStepTreatment model
        migrations.CreateModel(
            name='ProtocolStepTreatment',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('treatment_type', models.CharField(
                    choices=[
                        ('injection', 'Intravitreal Injection'),
                        ('laser', 'Laser Treatment'),
                        ('surgery', 'Surgical Procedure'),
                        ('therapy', 'Physical Therapy'),
                        ('other', 'Other Treatment')
                    ],
                    max_length=50
                )),
                ('treatment_name', models.CharField(max_length=200)),
                ('description', models.TextField()),
                ('administer_at_same_time', models.BooleanField(default=True)),
                ('offset_days', models.IntegerField(default=0)),
                ('eye_side', models.CharField(
                    blank=True,
                    choices=[
                        ('OD', 'Right Eye (OD)'),
                        ('OS', 'Left Eye (OS)'),
                        ('OU', 'Both Eyes (OU)')
                    ],
                    max_length=20
                )),
                ('expected_duration_minutes', models.PositiveIntegerField(blank=True, help_text='Expected duration in minutes', null=True)),
                ('requires_anesthesia', models.BooleanField(default=False)),
                ('anesthesia_type', models.CharField(blank=True, max_length=100)),
                ('special_instructions', models.TextField(blank=True)),
                ('order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('protocol_step', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='treatments', to='protocols.protocolstep')),
            ],
            options={
                'verbose_name': 'Protocol Step Treatment',
                'verbose_name_plural': 'Protocol Step Treatments',
                'ordering': ['protocol_step', 'order'],
            },
        ),
        # Create new ProtocolStepTest model
        migrations.CreateModel(
            name='ProtocolStepTest',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('test_type', models.CharField(
                    choices=[
                        ('visual_acuity', 'Visual Acuity Test'),
                        ('refraction', 'Refraction Test'),
                        ('tonometry', 'Tonometry (IOP)'),
                        ('oct', 'OCT Scan'),
                        ('visual_field', 'Visual Field Test'),
                        ('fluorescein', 'Fluorescein Angiography'),
                        ('fundus_photo', 'Fundus Photography'),
                        ('slit_lamp', 'Slit Lamp Examination'),
                        ('ophthalmoscopy', 'Ophthalmoscopy'),
                        ('other', 'Other Test')
                    ],
                    max_length=50
                )),
                ('test_name', models.CharField(max_length=200)),
                ('description', models.TextField(blank=True)),
                ('administer_at_same_time', models.BooleanField(default=True)),
                ('offset_days', models.IntegerField(default=0)),
                ('eye_side', models.CharField(
                    choices=[
                        ('OD', 'Right Eye (OD)'),
                        ('OS', 'Left Eye (OS)'),
                        ('OU', 'Both Eyes (OU)')
                    ],
                    max_length=20
                )),
                ('is_baseline', models.BooleanField(default=False, help_text='Is this a baseline measurement?')),
                ('expected_values', models.JSONField(blank=True, default=dict, help_text='Expected test results or thresholds')),
                ('special_instructions', models.TextField(blank=True)),
                ('order', models.PositiveIntegerField(default=0)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('protocol_step', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='tests', to='protocols.protocolstep')),
            ],
            options={
                'verbose_name': 'Protocol Step Test',
                'verbose_name_plural': 'Protocol Step Tests',
                'ordering': ['protocol_step', 'order'],
            },
        ),
    ]
