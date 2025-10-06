"""
URL configuration for eye_tests app
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from . import views

router = DefaultRouter()
router.register(r'visual-acuity-tests', views.VisualAcuityTestViewSet)
router.register(r'refraction-tests', views.RefractionTestViewSet)
router.register(r'cataract-assessments', views.CataractAssessmentViewSet)
router.register(r'glaucoma-assessments', views.GlaucomaAssessmentViewSet)
router.register(r'visual-field-tests', views.VisualFieldTestViewSet)
router.register(r'retinal-assessments', views.RetinalAssessmentViewSet)
router.register(r'diabetic-retinopathy-screenings', views.DiabeticRetinopathyScreeningViewSet)
router.register(r'oct-scans', views.OCTScanViewSet)

urlpatterns = [
    path('api/', include(router.urls)),
]