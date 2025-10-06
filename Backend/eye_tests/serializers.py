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
            'test_method', 'right_sphere', 'right_cylinder', 'right_axis', 'right_add',
            'left_sphere', 'left_cylinder', 'left_axis', 'left_add',
            'pupillary_distance', 'vertex_distance', 'working_distance'
        ]


class CataractAssessmentSerializer(BaseEyeTestSerializer):
    """
    Serializer for Cataract Assessment
    """
    class Meta(BaseEyeTestSerializer.Meta):
        model = CataractAssessment
        fields = BaseEyeTestSerializer.Meta.fields + [
            'right_eye_cataract_present', 'right_eye_cataract_type', 'right_eye_cataract_grade',
            'right_eye_lens_opacity', 'right_eye_visual_impact', 'left_eye_cataract_present',
            'left_eye_cataract_type', 'left_eye_cataract_grade', 'left_eye_lens_opacity',
            'left_eye_visual_impact', 'surgical_recommendation', 'priority_level',
            'biometry_required', 'iol_calculation_required', 'surgical_notes'
        ]


class GlaucomaAssessmentSerializer(BaseEyeTestSerializer):
    """
    Serializer for Glaucoma Assessment
    """
    class Meta(BaseEyeTestSerializer.Meta):
        model = GlaucomaAssessment
        fields = BaseEyeTestSerializer.Meta.fields + [
            'right_eye_iop', 'left_eye_iop', 'measurement_method', 'right_eye_optic_disc_cdh_ratio',
            'left_eye_optic_disc_cdh_ratio', 'right_eye_disc_appearance', 'left_eye_disc_appearance',
            'right_eye_nerve_fiber_layer', 'left_eye_nerve_fiber_layer', 'visual_field_defects',
            'gonioscopy_findings', 'central_corneal_thickness_right', 'central_corneal_thickness_left',
            'glaucoma_risk_factors', 'glaucoma_type', 'severity', 'treatment_plan'
        ]


class VisualFieldTestSerializer(BaseEyeTestSerializer):
    """
    Serializer for Visual Field Test
    """
    class Meta(BaseEyeTestSerializer.Meta):
        model = VisualFieldTest
        fields = BaseEyeTestSerializer.Meta.fields + [
            'test_type', 'strategy', 'stimulus_size', 'right_eye_mean_deviation',
            'right_eye_pattern_standard_deviation', 'right_eye_visual_field_index',
            'left_eye_mean_deviation', 'left_eye_pattern_standard_deviation',
            'left_eye_visual_field_index', 'defect_pattern', 'progression_analysis',
            'reliability_indices', 'test_quality'
        ]


class RetinalAssessmentSerializer(BaseEyeTestSerializer):
    """
    Serializer for Retinal Assessment
    """
    class Meta(BaseEyeTestSerializer.Meta):
        model = RetinalAssessment
        fields = BaseEyeTestSerializer.Meta.fields + [
            'right_eye_findings', 'left_eye_findings', 'macular_assessment',
            'peripheral_retina_assessment', 'vascular_assessment', 'oct_findings',
            'fundus_photography', 'fluorescein_angiography'
        ]


class DiabeticRetinopathyScreeningSerializer(BaseEyeTestSerializer):
    """
    Serializer for Diabetic Retinopathy Screening
    """
    class Meta(BaseEyeTestSerializer.Meta):
        model = DiabeticRetinopathyScreening
        fields = BaseEyeTestSerializer.Meta.fields + [
            'diabetes_type', 'diabetes_duration_years', 'hba1c_level', 'blood_pressure',
            'right_eye_dr_grade', 'left_eye_dr_grade', 'right_eye_maculopathy', 'left_eye_maculopathy',
            'right_eye_hemorrhages', 'left_eye_hemorrhages', 'right_eye_exudates',
            'left_eye_exudates', 'right_eye_cotton_wool_spots', 'left_eye_cotton_wool_spots',
            'right_eye_neovascularization', 'left_eye_neovascularization', 'macular_edema_present',
            'screening_outcome', 'referral_required', 'next_screening_date'
        ]


class StrabismusAssessmentSerializer(BaseEyeTestSerializer):
    """
    Serializer for Strabismus Assessment
    """
    class Meta(BaseEyeTestSerializer.Meta):
        model = StrabismusAssessment
        fields = BaseEyeTestSerializer.Meta.fields + [
            'strabismus_present', 'strabismus_type', 'deviation_primary_gaze',
            'deviation_distance', 'deviation_near', 'head_posture', 'binocular_vision_assessment',
            'stereopsis_test_result', 'diplopia_present', 'eye_movement_assessment',
            'sensory_adaptations', 'treatment_plan'
        ]


class PediatricEyeExamSerializer(BaseEyeTestSerializer):
    """
    Serializer for Pediatric Eye Exam
    """
    class Meta(BaseEyeTestSerializer.Meta):
        model = PediatricEyeExam
        fields = BaseEyeTestSerializer.Meta.fields + [
            'child_age_months', 'cooperation_level', 'visual_behavior', 'fixation_pattern',
            'following_movements', 'strabismus_assessment', 'refractive_error_assessment',
            'amblyopia_screening', 'color_vision_testing', 'developmental_assessment',
            'parental_concerns', 'family_history', 'birth_history', 'visual_development'
        ]


class OCTScanSerializer(BaseEyeTestSerializer):
    """
    Serializer for OCT Scan
    """
    class Meta(BaseEyeTestSerializer.Meta):
        model = OCTScan
        fields = BaseEyeTestSerializer.Meta.fields + [
            'scan_type', 'scan_protocol', 'right_eye_central_thickness', 'left_eye_central_thickness',
            'right_eye_volume', 'left_eye_volume', 'structural_abnormalities',
            'fluid_present', 'pigment_epithelium_detachment', 'choroidal_neovascularization',
            'image_quality_right', 'image_quality_left', 'artifacts_present', 'comparison_notes'
        ]