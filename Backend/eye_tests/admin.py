"""
Admin configuration for eye_tests app
"""
from django.contrib import admin
from .models import (
    VisualAcuityTest, RefractionTest, CataractAssessment, GlaucomaAssessment,
    VisualFieldTest, RetinalAssessment, DiabeticRetinopathyScreening,
    VitreoretinalAssessment, StrabismusAssessment, PediatricEyeExam,
    EyeCasualtyAssessment, CornealAssessment, OCTScan
)


@admin.register(VisualAcuityTest)
class VisualAcuityTestAdmin(admin.ModelAdmin):
    list_display = ('patient', 'test_method', 'eye_side', 'test_date', 'status', 'performed_by')
    list_filter = ('test_method', 'eye_side', 'status', 'test_date')
    search_fields = ('patient__first_name', 'patient__last_name')
    raw_id_fields = ('patient', 'consultation', 'performed_by')


@admin.register(RefractionTest)
class RefractionTestAdmin(admin.ModelAdmin):
    list_display = ('patient', 'method', 'eye_side', 'test_date', 'status', 'performed_by')
    list_filter = ('method', 'eye_side', 'status', 'test_date')
    search_fields = ('patient__first_name', 'patient__last_name')
    raw_id_fields = ('patient', 'consultation', 'performed_by')


@admin.register(CataractAssessment)
class CataractAssessmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'surgery_recommended', 'urgency_level', 'test_date', 'performed_by')
    list_filter = ('surgery_recommended', 'urgency_level', 'test_date')
    search_fields = ('patient__first_name', 'patient__last_name')
    raw_id_fields = ('patient', 'consultation', 'performed_by')


@admin.register(GlaucomaAssessment)
class GlaucomaAssessmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'glaucoma_type', 'right_eye_iop', 'left_eye_iop', 'treatment_required', 'test_date')
    list_filter = ('glaucoma_type', 'treatment_required', 'test_date')
    search_fields = ('patient__first_name', 'patient__last_name')
    raw_id_fields = ('patient', 'consultation', 'performed_by')


@admin.register(VisualFieldTest)
class VisualFieldTestAdmin(admin.ModelAdmin):
    list_display = ('patient', 'test_type', 'strategy', 'eye_side', 'test_date', 'performed_by')
    list_filter = ('test_type', 'strategy', 'test_date')
    search_fields = ('patient__first_name', 'patient__last_name')
    raw_id_fields = ('patient', 'consultation', 'performed_by')


@admin.register(RetinalAssessment)
class RetinalAssessmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'diabetic_retinopathy_present', 'amd_present', 'retinal_detachment', 'test_date')
    list_filter = ('diabetic_retinopathy_present', 'amd_present', 'retinal_detachment', 'test_date')
    search_fields = ('patient__first_name', 'patient__last_name')
    raw_id_fields = ('patient', 'consultation', 'performed_by')


@admin.register(DiabeticRetinopathyScreening)
class DiabeticRetinopathyScreeningAdmin(admin.ModelAdmin):
    list_display = ('patient', 'diabetes_type', 'right_eye_dr_grade', 'left_eye_dr_grade', 'referral_required', 'test_date')
    list_filter = ('diabetes_type', 'right_eye_dr_grade', 'left_eye_dr_grade', 'referral_required', 'test_date')
    search_fields = ('patient__first_name', 'patient__last_name')
    raw_id_fields = ('patient', 'consultation', 'performed_by')


@admin.register(VitreoretinalAssessment)
class VitreoretinalAssessmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'surgery_required', 'urgency', 'test_date', 'performed_by')
    list_filter = ('surgery_required', 'urgency', 'test_date')
    search_fields = ('patient__first_name', 'patient__last_name')
    raw_id_fields = ('patient', 'consultation', 'performed_by')


@admin.register(StrabismusAssessment)
class StrabismusAssessmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'cover_test_distance', 'amblyopia_present', 'test_date', 'performed_by')
    list_filter = ('cover_test_distance', 'amblyopia_present', 'test_date')
    search_fields = ('patient__first_name', 'patient__last_name')
    raw_id_fields = ('patient', 'consultation', 'performed_by')


@admin.register(PediatricEyeExam)
class PediatricEyeExamAdmin(admin.ModelAdmin):
    list_display = ('patient', 'age_at_exam', 'cooperation_level', 'red_reflex_right', 'red_reflex_left', 'test_date')
    list_filter = ('cooperation_level', 'red_reflex_right', 'red_reflex_left', 'test_date')
    search_fields = ('patient__first_name', 'patient__last_name')
    raw_id_fields = ('patient', 'consultation', 'performed_by')


@admin.register(EyeCasualtyAssessment)
class EyeCasualtyAssessmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'injury_type', 'triage_category', 'pain_level', 'admission_required', 'test_date')
    list_filter = ('injury_type', 'triage_category', 'admission_required', 'test_date')
    search_fields = ('patient__first_name', 'patient__last_name')
    raw_id_fields = ('patient', 'consultation', 'performed_by')


@admin.register(CornealAssessment)
class CornealAssessmentAdmin(admin.ModelAdmin):
    list_display = ('patient', 'dry_eye_present', 'keratoconus', 'corneal_dystrophy', 'test_date', 'performed_by')
    list_filter = ('dry_eye_present', 'keratoconus', 'corneal_dystrophy', 'test_date')
    search_fields = ('patient__first_name', 'patient__last_name')
    raw_id_fields = ('patient', 'consultation', 'performed_by')


@admin.register(OCTScan)
class OCTScanAdmin(admin.ModelAdmin):
    list_display = ('patient', 'scan_type', 'scan_quality', 'test_date', 'performed_by')
    list_filter = ('scan_type', 'scan_quality', 'test_date')
    search_fields = ('patient__first_name', 'patient__last_name', 'machine_model')
    raw_id_fields = ('patient', 'consultation', 'performed_by')
