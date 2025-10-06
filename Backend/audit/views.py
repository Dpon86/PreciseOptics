"""
API views for PreciseOptics Eye Hospital Management System - Audit
"""
from rest_framework import viewsets, permissions, status
from rest_framework.decorators import action
from rest_framework.response import Response
from django.db import models
from django.utils import timezone
from datetime import timedelta
from .models import (
    AuditLog, PatientAccessLog, MedicationAudit, ClinicalDecisionAudit,
    DataExportLog, ComplianceReport, SystemSecurityEvent
)
from .serializers import (
    AuditLogSerializer, PatientAccessLogSerializer, MedicationAuditSerializer,
    ClinicalDecisionAuditSerializer, DataExportLogSerializer, ComplianceReportSerializer,
    SystemSecurityEventSerializer
)


class AuditLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for audit logs
    """
    queryset = AuditLog.objects.all()
    serializer_class = AuditLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter audit logs based on parameters"""
        queryset = AuditLog.objects.select_related('user')
        
        # Filter by user
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by action
        action = self.request.query_params.get('action', None)
        if action:
            queryset = queryset.filter(action=action)
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from', None)
        date_to = self.request.query_params.get('date_to', None)
        if date_from:
            queryset = queryset.filter(timestamp__gte=date_from)
        if date_to:
            queryset = queryset.filter(timestamp__lte=date_to)
        
        # Filter by severity
        severity = self.request.query_params.get('severity', None)
        if severity:
            queryset = queryset.filter(severity=severity)
        
        return queryset.order_by('-timestamp')
    
    @action(detail=False, methods=['get'])
    def summary(self, request):
        """Get audit log summary statistics"""
        queryset = self.get_queryset()
        
        summary = {
            'total_events': queryset.count(),
            'events_last_24h': queryset.filter(timestamp__gte=timezone.now() - timedelta(days=1)).count(),
            'failed_logins': queryset.filter(action='login', success=False).count(),
            'data_exports': queryset.filter(action='export').count(),
            'high_severity_events': queryset.filter(severity='high').count(),
            'critical_events': queryset.filter(severity='critical').count(),
        }
        
        return Response(summary)


class PatientAccessLogViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for patient access logs
    """
    queryset = PatientAccessLog.objects.all()
    serializer_class = PatientAccessLogSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter patient access logs"""
        queryset = PatientAccessLog.objects.select_related('user', 'patient')
        
        # Filter by patient
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filter by user
        user_id = self.request.query_params.get('user', None)
        if user_id:
            queryset = queryset.filter(user_id=user_id)
        
        # Filter by access type
        access_type = self.request.query_params.get('access_type', None)
        if access_type:
            queryset = queryset.filter(access_type=access_type)
        
        return queryset.order_by('-access_time')


class MedicationAuditViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for medication audit logs
    """
    queryset = MedicationAudit.objects.all()
    serializer_class = MedicationAuditSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter medication audit logs"""
        queryset = MedicationAudit.objects.select_related('user', 'patient')
        
        # Filter by patient
        patient_id = self.request.query_params.get('patient', None)
        if patient_id:
            queryset = queryset.filter(patient_id=patient_id)
        
        # Filter by action type
        action_type = self.request.query_params.get('action_type', None)
        if action_type:
            queryset = queryset.filter(action_type=action_type)
        
        return queryset.order_by('-action_timestamp')


class SystemSecurityEventViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Read-only ViewSet for system security events
    """
    queryset = SystemSecurityEvent.objects.all()
    serializer_class = SystemSecurityEventSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter security events"""
        queryset = SystemSecurityEvent.objects.select_related('user')
        
        # Filter by event type
        event_type = self.request.query_params.get('event_type', None)
        if event_type:
            queryset = queryset.filter(event_type=event_type)
        
        # Filter by severity
        severity = self.request.query_params.get('severity', None)
        if severity:
            queryset = queryset.filter(severity=severity)
        
        # Filter by investigation status
        investigation_status = self.request.query_params.get('investigation_status', None)
        if investigation_status:
            queryset = queryset.filter(investigation_status=investigation_status)
        
        return queryset.order_by('-timestamp')


class ComplianceReportViewSet(viewsets.ModelViewSet):
    """
    ViewSet for managing compliance reports
    """
    queryset = ComplianceReport.objects.all()
    serializer_class = ComplianceReportSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        """Filter compliance reports"""
        queryset = ComplianceReport.objects.select_related('generated_by')
        
        # Filter by report type
        report_type = self.request.query_params.get('report_type', None)
        if report_type:
            queryset = queryset.filter(report_type=report_type)
        
        # Filter by status
        status_filter = self.request.query_params.get('status', None)
        if status_filter:
            queryset = queryset.filter(status=status_filter)
        
        return queryset.order_by('-generation_date')
