"""
API views for Patient Reported Outcome Measures.
"""
import logging
from rest_framework import viewsets, filters
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.response import Response
from django_filters.rest_framework import DjangoFilterBackend
from .models import PatientOutcomeReport
from .serializers import PatientOutcomeReportSerializer

logger = logging.getLogger(__name__)


class PatientOutcomeReportViewSet(viewsets.ModelViewSet):
    """
    CRUD for patient outcome questionnaires.

    Supports filtering by:
      ?patient=<uuid>
      ?prescription=<uuid>
      ?treatment=<uuid>
      ?is_active=true|false
    """
    queryset = PatientOutcomeReport.objects.filter(is_active=True).select_related(
        'patient', 'consultation', 'prescription', 'treatment', 'completed_by'
    )
    serializer_class = PatientOutcomeReportSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['patient', 'prescription', 'treatment', 'consultation', 'is_active']
    ordering_fields = ['report_date', 'created_at', 'vision_quality_score']
    ordering = ['-report_date']

    def perform_create(self, serializer):
        serializer.save(completed_by=self.request.user)

    @action(detail=False, methods=['get'], url_path='for-patient/(?P<patient_id>[^/.]+)')
    def for_patient(self, request, patient_id=None):
        """Return all outcome reports for a given patient, newest first."""
        qs = self.queryset.filter(patient_id=patient_id)
        serializer = self.get_serializer(qs, many=True)
        return Response({'results': serializer.data, 'count': qs.count()})
