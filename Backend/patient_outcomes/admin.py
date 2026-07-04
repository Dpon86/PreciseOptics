from django.contrib import admin
from .models import PatientOutcomeReport


@admin.register(PatientOutcomeReport)
class PatientOutcomeReportAdmin(admin.ModelAdmin):
    list_display = [
        'patient', 'report_date', 'vision_quality_score',
        'treatment_satisfaction', 'side_effect_severity', 'completed_by',
    ]
    list_filter = ['treatment_satisfaction', 'side_effect_severity', 'report_date']
    search_fields = ['patient__first_name', 'patient__last_name', 'side_effects_reported']
    ordering = ['-report_date']
    readonly_fields = ['id', 'created_at', 'updated_at']
