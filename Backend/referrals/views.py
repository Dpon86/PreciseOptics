"""
Views for referrals app
"""
from rest_framework import generics, status, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count, Q, Avg
from django.shortcuts import get_object_or_404
from datetime import date, timedelta

from .models import ReferralSource, Referral, ReferralDocument, ReferralResponse
from .serializers import (
    ReferralSourceSerializer, ReferralSourceListSerializer,
    ReferralSerializer, ReferralListSerializer,
    ReferralDocumentSerializer, ReferralResponseSerializer
)


# ==================== Referral Source Views ====================

class ReferralSourceListCreateView(generics.ListCreateAPIView):
    """
    List all referral sources or create a new one
    """
    queryset = ReferralSource.objects.all()
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['source_type', 'is_active', 'is_preferred']
    search_fields = ['name', 'contact_person', 'specialties']
    ordering_fields = ['name', 'source_type', 'total_referrals_sent', 'total_referrals_received']
    ordering = ['name']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ReferralSourceListSerializer
        return ReferralSourceSerializer
    
    def perform_create(self, serializer):
        serializer.save(created_by=self.request.user)


class ReferralSourceDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a referral source
    """
    queryset = ReferralSource.objects.all()
    serializer_class = ReferralSourceSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_destroy(self, instance):
        # Soft delete - mark as inactive instead of deleting
        instance.is_active = False
        instance.save()


# ==================== Referral Views ====================

class ReferralListCreateView(generics.ListCreateAPIView):
    """
    List all referrals or create a new one
    """
    queryset = Referral.objects.all().select_related(
        'patient', 'referral_source', 'referred_by', 'reviewed_by', 'created_by'
    ).prefetch_related('documents', 'responses')
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['patient', 'referral_source', 'direction', 'reason', 
                        'urgency', 'current_status', 'is_active']
    search_fields = ['referral_number', 'patient__first_name', 'patient__last_name',
                    'patient__patient_id', 'referral_source__name']
    ordering_fields = ['referral_date', 'sent_date', 'urgency', 'current_status']
    ordering = ['-referral_date']
    
    def get_serializer_class(self):
        if self.request.method == 'GET':
            return ReferralListSerializer
        return ReferralSerializer
    
    def get_queryset(self):
        queryset = super().get_queryset()
        
        # Filter by date range
        date_from = self.request.query_params.get('date_from')
        date_to = self.request.query_params.get('date_to')
        
        if date_from:
            queryset = queryset.filter(referral_date__gte=date_from)
        if date_to:
            queryset = queryset.filter(referral_date__lte=date_to)
        
        # Filter by overdue referrals
        overdue = self.request.query_params.get('overdue')
        if overdue == 'true':
            queryset = queryset.filter(
                current_status__in=['pending', 'sent', 'acknowledged']
            )
            # Further filtering for urgency-based overdue calculation done in serializer
        
        # Filter by pending referrals
        pending = self.request.query_params.get('pending')
        if pending == 'true':
            queryset = queryset.filter(
                current_status__in=['draft', 'pending', 'sent']
            )
        
        return queryset
    
    def perform_create(self, serializer):
        serializer.save(
            created_by=self.request.user,
            referred_by=self.request.user
        )


class ReferralDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a referral
    """
    queryset = Referral.objects.all().select_related(
        'patient', 'referral_source', 'referred_by', 'reviewed_by'
    ).prefetch_related('documents', 'responses')
    serializer_class = ReferralSerializer
    permission_classes = [IsAuthenticated]
    
    def perform_destroy(self, instance):
        # Soft delete - mark as inactive instead of deleting
        instance.is_active = False
        instance.save()


# ==================== Patient Referrals ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def patient_referrals(request, patient_id):
    """
    Get all referrals for a specific patient
    """
    try:
        referrals = Referral.objects.filter(
            patient_id=patient_id,
            is_active=True
        ).select_related(
            'referral_source', 'referred_by', 'reviewed_by'
        ).prefetch_related('responses', 'documents')
        
        # Apply status filter if provided
        status_filter = request.query_params.get('status')
        if status_filter:
            referrals = referrals.filter(current_status=status_filter)
        
        # Apply direction filter if provided
        direction = request.query_params.get('direction')
        if direction:
            referrals = referrals.filter(direction=direction)
        
        serializer = ReferralListSerializer(referrals, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== Referral Status Management ====================

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def update_referral_status(request, referral_id):
    """
    Update the status of a referral
    """
    try:
        referral = get_object_or_404(Referral, id=referral_id)
        new_status = request.data.get('status')
        status_notes = request.data.get('notes', '')
        
        if not new_status:
            return Response(
                {'error': 'Status is required'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Validate status
        valid_statuses = [choice[0] for choice in Referral.REFERRAL_STATUS]
        if new_status not in valid_statuses:
            return Response(
                {'error': f'Invalid status. Must be one of: {", ".join(valid_statuses)}'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update status
        referral.current_status = new_status
        referral.status_notes = status_notes
        
        # Update relevant date fields based on status
        if new_status == 'sent' and not referral.sent_date:
            referral.sent_date = date.today()
        elif new_status == 'acknowledged' and not referral.acknowledged_date:
            referral.acknowledged_date = date.today()
        elif new_status == 'completed' and not referral.completion_date:
            referral.completion_date = date.today()
        
        referral.save()
        
        serializer = ReferralSerializer(referral)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def send_referral(request, referral_id):
    """
    Mark referral as sent and update sent date
    """
    try:
        referral = get_object_or_404(Referral, id=referral_id)
        
        if referral.current_status == 'draft':
            referral.current_status = 'sent'
            referral.sent_date = date.today()
            referral.save()
            
            # Update source statistics
            source = referral.referral_source
            if referral.direction == 'outgoing':
                source.total_referrals_sent += 1
            else:
                source.total_referrals_received += 1
            source.save()
            
            serializer = ReferralSerializer(referral)
            return Response(serializer.data)
        else:
            return Response(
                {'error': 'Only draft referrals can be sent'},
                status=status.HTTP_400_BAD_REQUEST
            )
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def cancel_referral(request, referral_id):
    """
    Cancel a referral
    """
    try:
        referral = get_object_or_404(Referral, id=referral_id)
        cancellation_reason = request.data.get('reason', '')
        
        referral.current_status = 'cancelled'
        referral.status_notes = f"Cancelled: {cancellation_reason}"
        referral.save()
        
        serializer = ReferralSerializer(referral)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== Referral Documents ====================

class ReferralDocumentListCreateView(generics.ListCreateAPIView):
    """
    List all documents or upload a new one
    """
    queryset = ReferralDocument.objects.all()
    serializer_class = ReferralDocumentSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['referral', 'document_type']
    ordering = ['-uploaded_at']
    
    def perform_create(self, serializer):
        serializer.save(uploaded_by=self.request.user)


class ReferralDocumentDetailView(generics.RetrieveDestroyAPIView):
    """
    Retrieve or delete a document
    """
    queryset = ReferralDocument.objects.all()
    serializer_class = ReferralDocumentSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def referral_documents(request, referral_id):
    """
    Get all documents for a specific referral
    """
    try:
        documents = ReferralDocument.objects.filter(referral_id=referral_id)
        serializer = ReferralDocumentSerializer(documents, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== Referral Responses ====================

class ReferralResponseListCreateView(generics.ListCreateAPIView):
    """
    List all responses or create a new one
    """
    queryset = ReferralResponse.objects.all()
    serializer_class = ReferralResponseSerializer
    permission_classes = [IsAuthenticated]
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['referral', 'response_type']
    ordering = ['-response_date']
    
    def perform_create(self, serializer):
        response = serializer.save(created_by=self.request.user)
        
        # Update referral status based on response type
        referral = response.referral
        if response.response_type == 'acknowledgment' and referral.current_status == 'sent':
            referral.current_status = 'acknowledged'
            referral.acknowledged_date = response.response_date
            referral.save()
        elif response.response_type == 'appointment_scheduled':
            referral.current_status = 'scheduled'
            if response.appointment_date:
                referral.appointment_date = response.appointment_date.date()
            referral.save()
        elif response.response_type == 'outcome_report':
            referral.current_status = 'completed'
            referral.completion_date = date.today()
            referral.save()
        elif response.response_type == 'rejection':
            referral.current_status = 'rejected'
            referral.save()


class ReferralResponseDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a response
    """
    queryset = ReferralResponse.objects.all()
    serializer_class = ReferralResponseSerializer
    permission_classes = [IsAuthenticated]


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def referral_responses(request, referral_id):
    """
    Get all responses for a specific referral
    """
    try:
        responses = ReferralResponse.objects.filter(referral_id=referral_id)
        serializer = ReferralResponseSerializer(responses, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ==================== Statistics & Analytics ====================

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def referral_statistics(request):
    """
    Get referral statistics
    """
    try:
        # Total counts
        total_referrals = Referral.objects.filter(is_active=True).count()
        outgoing_referrals = Referral.objects.filter(direction='outgoing', is_active=True).count()
        incoming_referrals = Referral.objects.filter(direction='incoming', is_active=True).count()
        
        # Status counts
        pending_count = Referral.objects.filter(
            current_status__in=['draft', 'pending', 'sent'],
            is_active=True
        ).count()
        
        # Overdue referrals (simple check - needs refinement based on urgency)
        overdue_count = Referral.objects.filter(
            current_status__in=['pending', 'sent'],
            referral_date__lt=date.today() - timedelta(days=7),
            is_active=True
        ).count()
        
        # Completed referrals
        completed_count = Referral.objects.filter(
            current_status='completed',
            is_active=True
        ).count()
        
        # Active sources
        active_sources = ReferralSource.objects.filter(is_active=True).count()
        preferred_sources = ReferralSource.objects.filter(is_active=True, is_preferred=True).count()
        
        stats = {
            'total_referrals': total_referrals,
            'outgoing_referrals': outgoing_referrals,
            'incoming_referrals': incoming_referrals,
            'pending_count': pending_count,
            'overdue_count': overdue_count,
            'completed_count': completed_count,
            'active_sources': active_sources,
            'preferred_sources': preferred_sources
        }
        
        return Response(stats)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def overdue_referrals(request):
    """
    Get list of overdue referrals based on urgency
    """
    try:
        overdue_list = []
        referrals = Referral.objects.filter(
            current_status__in=['pending', 'sent', 'acknowledged'],
            is_active=True
        )
        
        for referral in referrals:
            urgency_days = {
                'routine': 30,
                'soon': 21,
                'urgent': 7,
                'emergency': 1
            }
            days_threshold = urgency_days.get(referral.urgency, 30)
            threshold_date = referral.referral_date + timedelta(days=days_threshold)
            
            if date.today() > threshold_date:
                overdue_list.append(referral)
        
        serializer = ReferralListSerializer(overdue_list, many=True)
        return Response(serializer.data)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def source_performance(request, source_id):
    """
    Get performance statistics for a specific referral source
    """
    try:
        source = get_object_or_404(ReferralSource, id=source_id)
        
        # Get referrals for this source
        referrals = Referral.objects.filter(referral_source=source, is_active=True)
        
        # Calculate statistics
        total_referrals = referrals.count()
        completed = referrals.filter(current_status='completed').count()
        pending = referrals.filter(current_status__in=['pending', 'sent', 'acknowledged']).count()
        
        # Calculate average response time (if responses exist)
        responses = ReferralResponse.objects.filter(
            referral__referral_source=source,
            response_type='acknowledgment'
        )
        
        if responses.exists():
            total_days = 0
            count = 0
            for response in responses:
                referral = response.referral
                if referral.referral_date:
                    days_diff = (response.response_date - referral.referral_date).days
                    total_days += days_diff
                    count += 1
            
            avg_response_time = total_days / count if count > 0 else None
        else:
            avg_response_time = None
        
        stats = {
            'source_name': source.name,
            'total_referrals': total_referrals,
            'completed_referrals': completed,
            'pending_referrals': pending,
            'average_response_time_days': avg_response_time,
            'completion_rate': (completed / total_referrals * 100) if total_referrals > 0 else 0
        }
        
        return Response(stats)
    except Exception as e:
        return Response(
            {'error': str(e)},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
