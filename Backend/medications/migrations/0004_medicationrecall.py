# Generated migration for MedicationRecall model

import django.db.models.deletion
import uuid
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('medications', '0003_alter_medication_manufacturer'),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.CreateModel(
            name='MedicationRecall',
            fields=[
                ('id', models.UUIDField(default=uuid.uuid4, editable=False, primary_key=True, serialize=False)),
                ('batch_number', models.CharField(blank=True, help_text='Specific batch number being recalled; leave blank to recall all batches', max_length=100)),
                ('recall_type', models.CharField(choices=[('safety', 'Safety Issue'), ('contamination', 'Contamination'), ('labelling', 'Labelling Error'), ('quality', 'Quality Defect'), ('expiry', 'Expired Batch'), ('other', 'Other')], max_length=20)),
                ('severity', models.CharField(choices=[('low', 'Low'), ('medium', 'Medium'), ('high', 'High'), ('critical', 'Critical')], max_length=20)),
                ('status', models.CharField(choices=[('active', 'Active'), ('acknowledged', 'Acknowledged'), ('resolved', 'Resolved'), ('closed', 'Closed')], default='active', max_length=20)),
                ('title', models.CharField(max_length=300)),
                ('description', models.TextField()),
                ('action_required', models.TextField(help_text='Steps that must be taken for this recall')),
                ('issued_date', models.DateTimeField(auto_now_add=True)),
                ('acknowledged_at', models.DateTimeField(blank=True, null=True)),
                ('resolved_at', models.DateTimeField(blank=True, null=True)),
                ('resolution_notes', models.TextField(blank=True)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('updated_at', models.DateTimeField(auto_now=True)),
                ('acknowledged_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='acknowledged_recalls', to=settings.AUTH_USER_MODEL)),
                ('issued_by', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='issued_recalls', to=settings.AUTH_USER_MODEL)),
                ('medication', models.ForeignKey(on_delete=django.db.models.deletion.PROTECT, related_name='recalls', to='medications.medication')),
                ('resolved_by', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='resolved_recalls', to=settings.AUTH_USER_MODEL)),
            ],
            options={
                'verbose_name': 'Medication Recall',
                'verbose_name_plural': 'Medication Recalls',
                'ordering': ['-issued_date'],
            },
        ),
    ]
