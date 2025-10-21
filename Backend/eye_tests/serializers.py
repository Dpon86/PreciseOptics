"""
Serializers for PreciseOptics Eye Hospital Management System - Eye Tests
"""
from rest_framework import serializers
from .models import (
    VisualAcuityTest, RefractionTest, CataractAssessment, GlaucomaAssessment,
    VisualFieldTest, RetinalAssessment, DiabeticRetinopathyScreening,
    VitreoretinalAssessment, StrabismusAssessment, PediatricEyeExam,
    EyeCasualtyAssessment, CornealAssessment, OCTScan
)


class BaseEyeTestSerializer(serializers.ModelSerializer):
    """
    Base serializer for eye tests
    """
    patient_name = serializers.CharField(source='patient.first_name', read_only=True)
    performed_by_name = serializers.CharField(source='performed_by.get_full_name', read_only=True)
    test_duration = serializers.SerializerMethodField()
    
    class Meta:
        fields = [
            'id', 'patient', 'patient_name', 'consultation', 'performed_by', 'performed_by_name',
            'test_date', 'eye_side', 'status', 'findings', 'recommendations', 'notes',
            'follow_up_required', 'follow_up_date', 'test_duration', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'patient_name', 'performed_by_name', 'test_duration', 'created_at', 'updated_at']
        abstract = True
    
    def get_test_duration(self, obj):
        """Calculate test duration if available"""
        # This would be implemented based on actual test start/end times if available
        return None


class VisualAcuityTestSerializer(BaseEyeTestSerializer):
    """
    Serializer for Visual Acuity Test
    """
    class Meta(BaseEyeTestSerializer.Meta):
        model = VisualAcuityTest
        fields = BaseEyeTestSerializer.Meta.fields + [
            'test_method', 'right_eye_unaided', 'right_eye_aided', 'right_eye_pinhole',
            'left_eye_unaided', 'left_eye_aided', 'left_eye_pinhole', 'binocular_vision'
        ]


class RefractionTestSerializer(BaseEyeTestSerializer):
    """
    Serializer for Refraction Test
    """
    class Meta(BaseEyeTestSerializer.Meta):
        model = RefractionTest
        fields = BaseEyeTestSerializer.Meta.fields + [
            'method', 'right_sphere', 'right_cylinder', 'right_axis', 'right_add', 'right_prism',
            'left_sphere', 'left_cylinder', 'left_axis', 'left_add', 'left_prism',
            'pupillary_distance'
        ]


class CataractAssessmentSerializer(BaseEyeTestSerializer):
    """
    Serializer for Cataract Assessment
    """
    class Meta(BaseEyeTestSerializer.Meta):
        model = CataractAssessment
        fields = BaseEyeTestSerializer.Meta.fields + [
            'right_eye_cataract_type', 'right_eye_severity', 'right_eye_lens_clarity',
            'left_eye_cataract_type', 'left_eye_severity', 'left_eye_lens_clarity',
            'glare_disability', 'contrast_sensitivity_reduced', 'visual_function_impact',
            'surgery_recommended', 'urgency_level', 'iol_power_calculation', 'target_refraction'
        ]


class GlaucomaAssessmentSerializer(BaseEyeTestSerializer):
    """
    Serializer for Glaucoma Assessment
    """
    class Meta(BaseEyeTestSerializer.Meta):
        model = GlaucomaAssessment
        fields = BaseEyeTestSerializer.Meta.fields + [
            'right_eye_iop', 'left_eye_iop', 'iop_method',
            'right_disc_cup_ratio', 'left_disc_cup_ratio',
            'right_disc_hemorrhage', 'left_disc_hemorrhage',
            'right_disc_notching', 'left_disc_notching',
            'right_nfl_defect', 'left_nfl_defect', 'nfl_description',
            'visual_field_defects', 'family_history_glaucoma', 'diabetes', 'myopia',
            'central_corneal_thickness_right', 'central_corneal_thickness_left',
            'glaucoma_type', 'treatment_required', 'target_iop'
        ]


class VisualFieldTestSerializer(BaseEyeTestSerializer):
    """
    Serializer for Visual Field Test
    """
    class Meta(BaseEyeTestSerializer.Meta):
        model = VisualFieldTest
        fields = BaseEyeTestSerializer.Meta.fields + [
            'test_type', 'strategy',
            'right_eye_md', 'right_eye_psd', 'right_eye_vfi', 'right_eye_reliability',
            'left_eye_md', 'left_eye_psd', 'left_eye_vfi', 'left_eye_reliability',
            'right_eye_defects', 'left_eye_defects',
            'fixation_losses_right', 'false_positives_right', 'false_negatives_right',
            'fixation_losses_left', 'false_positives_left', 'false_negatives_left'
        ]


class RetinalAssessmentSerializer(BaseEyeTestSerializer):
    """
    Serializer for Retinal Assessment
    """
    class Meta(BaseEyeTestSerializer.Meta):
        model = RetinalAssessment
        fields = BaseEyeTestSerializer.Meta.fields + [
            'right_retina_findings', 'left_retina_findings',
            'right_macula_normal', 'left_macula_normal',
            'right_macula_findings', 'left_macula_findings',
            'arteriovenous_nicking', 'cotton_wool_spots', 'hard_exudates',
            'hemorrhages', 'microaneurysms',
            'diabetic_retinopathy_present', 'amd_present', 'retinal_detachment',
            'primary_diagnosis', 'secondary_diagnosis'
        ]


class DiabeticRetinopathyScreeningSerializer(BaseEyeTestSerializer):
    """
    Serializer for Diabetic Retinopathy Screening
    """
    class Meta(BaseEyeTestSerializer.Meta):
        model = DiabeticRetinopathyScreening
        fields = BaseEyeTestSerializer.Meta.fields + [
            'diabetes_type', 'diabetes_duration_years', 'last_hba1c',
            'right_eye_dr_grade', 'left_eye_dr_grade', 'right_eye_maculopathy', 'left_eye_maculopathy',
            'photo_quality_right', 'photo_quality_left',
            'microaneurysms_right', 'microaneurysms_left',
            'hemorrhages_right', 'hemorrhages_left',
            'exudates_right', 'exudates_left',
            'cotton_wool_spots_right', 'cotton_wool_spots_left',
            'venous_beading_right', 'venous_beading_left',
            'irma_right', 'irma_left',
            'neovascularization_right', 'neovascularization_left',
            'referral_required', 'referral_urgency', 'next_screening_months'
        ]


class StrabismusAssessmentSerializer(BaseEyeTestSerializer):
    """
    Serializer for Strabismus Assessment
    """
    class Meta(BaseEyeTestSerializer.Meta):
        model = StrabismusAssessment
        fields = BaseEyeTestSerializer.Meta.fields + [
            'cover_test_distance', 'cover_test_near',
            'distance_deviation_horizontal', 'distance_deviation_vertical',
            'near_deviation_horizontal', 'near_deviation_vertical',
            'right_eye_motility', 'left_eye_motility', 'binocular_movements',
            'stereopsis', 'fusion', 'amblyopia_present', 'amblyopic_eye'
        ]


class PediatricEyeExamSerializer(BaseEyeTestSerializer):
    """
    Serializer for Pediatric Eye Exam
    """
    class Meta(BaseEyeTestSerializer.Meta):
        model = PediatricEyeExam
        fields = BaseEyeTestSerializer.Meta.fields + [
            'age_at_exam', 'cooperation_level',
            'fixation_right', 'fixation_left',
            'horizontal_tracking', 'vertical_tracking', 'smooth_pursuits',
            'red_reflex_right', 'red_reflex_left', 'corneal_light_reflex',
            'developmental_concerns', 'family_history_eye_problems'
        ]


class OCTScanSerializer(BaseEyeTestSerializer):
    """
    Serializer for OCT Scan
    """
    class Meta(BaseEyeTestSerializer.Meta):
        model = OCTScan
        fields = BaseEyeTestSerializer.Meta.fields + [
            'scan_type', 'machine_model',
            'right_central_thickness', 'right_average_thickness', 'right_findings',
            'left_central_thickness', 'left_average_thickness', 'left_findings',
            'right_eye_image', 'left_eye_image',
            'scan_quality'
        ]