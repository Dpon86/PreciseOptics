"""
API views for PreciseOptics Eye Hospital Management System - Eye Tests
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from .models import (
    VisualAcuityTest, RefractionTest, CataractAssessment, GlaucomaAssessment,
    VisualFieldTest, RetinalAssessment, DiabeticRetinopathyScreening,
    VitreoretinalAssessment, StrabismusAssessment, PediatricEyeExam,
    EyeCasualtyAssessment, CornealAssessment, OCTScan
)
from .serializers import (
    VisualAcuityTestSerializer, RefractionTestSerializer, CataractAssessmentSerializer,
    GlaucomaAssessmentSerializer, VisualFieldTestSerializer, RetinalAssessmentSerializer,
    DiabeticRetinopathyScreeningSerializer, StrabismusAssessmentSerializer,
    PediatricEyeExamSerializer, OCTScanSerializer
)


class VisualAcuityTestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing visual acuity tests
    """
    queryset = VisualAcuityTest.objects.all()
    serializer_class = VisualAcuityTestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter tests by patient or consultation"""
        queryset = VisualAcuityTest.objects.select_related('patient', 'performed_by')
        
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        consultation_id = self.request.query_params.get('consultation', None)
        if consultation_id:
            queryset = queryset.filter(consultation_id=consultation_id)
        
        return queryset.order_by('-test_date')


class RefractionTestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing refraction tests
    """
    queryset = RefractionTest.objects.all()
    serializer_class = RefractionTestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter tests by patient or consultation"""
        queryset = RefractionTest.objects.select_related('patient', 'performed_by')
        
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        consultation_id = self.request.query_params.get('consultation', None)
        if consultation_id:
            queryset = queryset.filter(consultation_id=consultation_id)
        
        return queryset.order_by('-test_date')


class CataractAssessmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing cataract assessments
    """
    queryset = CataractAssessment.objects.all()
    serializer_class = CataractAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter assessments by patient or consultation"""
        queryset = CataractAssessment.objects.select_related('patient', 'performed_by')
        
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        return queryset.order_by('-test_date')


class GlaucomaAssessmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing glaucoma assessments
    """
    queryset = GlaucomaAssessment.objects.all()
    serializer_class = GlaucomaAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter assessments by patient"""
        queryset = GlaucomaAssessment.objects.select_related('patient', 'performed_by')
        
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        return queryset.order_by('-test_date')


class VisualFieldTestViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing visual field tests
    """
    queryset = VisualFieldTest.objects.all()
    serializer_class = VisualFieldTestSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter tests by patient"""
        queryset = VisualFieldTest.objects.select_related('patient', 'performed_by')
        
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        return queryset.order_by('-test_date')


class RetinalAssessmentViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing retinal assessments
    """
    queryset = RetinalAssessment.objects.all()
    serializer_class = RetinalAssessmentSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter assessments by patient"""
        queryset = RetinalAssessment.objects.select_related('patient', 'performed_by')
        
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        return queryset.order_by('-test_date')


class DiabeticRetinopathyScreeningViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing diabetic retinopathy screenings
    """
    queryset = DiabeticRetinopathyScreening.objects.all()
    serializer_class = DiabeticRetinopathyScreeningSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter screenings by patient"""
        queryset = DiabeticRetinopathyScreening.objects.select_related('patient', 'performed_by')
        
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        return queryset.order_by('-test_date')


class OCTScanViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing OCT scans
    """
    queryset = OCTScan.objects.all()
    serializer_class = OCTScanSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter scans by patient"""
        queryset = OCTScan.objects.select_related('patient', 'performed_by')
        
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        return queryset.order_by('-test_date')
