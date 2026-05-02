"""
Authentication views - login and logout
"""
import logging
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.utils import timezone
from ..models import CustomUser, StaffProfile, UserSession
from ..serializers import (
    CustomUserSerializer, StaffProfileSerializer,
    LoginSerializer
)

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([])
def login_view(request):
    """
    User login endpoint with 2FA support
    """
    # Enforce strict rate limit: 10 attempts per minute
    throttle = ScopedRateThrottle()
    throttle.scope = 'login'
    if not throttle.allow_request(request, None):
        return Response(
            {'error': 'Too many login attempts. Please wait before trying again.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
        # Check if 2FA is enabled for this user
        if user.two_factor_enabled:
            # Don't create token yet, send response indicating 2FA required
            return Response({
                'requires_2fa': True,
                'user_id': str(user.id),
                'message': 'Please enter your 2FA code'
            }, status=status.HTTP_200_OK)
        
        # No 2FA required, proceed with normal login
        # Create or get token
        token, created = Token.objects.get_or_create(user=user)
        
        # Create user session record
        UserSession.objects.create(
            user=user,
            session_key=request.session.session_key or '',
            ip_address=request.META.get('REMOTE_ADDR', ''),
            user_agent=request.META.get('HTTP_USER_AGENT', ''),
        )
        
        # Get user details
        user_serializer = CustomUserSerializer(user)
        staff_profile = None
        
        try:
            staff_profile_obj = StaffProfile.objects.get(user=user)
            staff_profile = StaffProfileSerializer(staff_profile_obj).data
        except StaffProfile.DoesNotExist:
            pass
        
        return Response({
            'token': token.key,
            'user': user_serializer.data,
            'staff_profile': staff_profile,
            'message': 'Login successful'
        }, status=status.HTTP_200_OK)
    
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def logout_view(request):
    """
    User logout endpoint
    """
    try:
        # Delete the token
        request.user.auth_token.delete()
        
        # Update user session
        UserSession.objects.filter(
            user=request.user,
            logout_time__isnull=True
        ).update(logout_time=timezone.now(), is_active=False)
        
        return Response({'message': 'Logout successful'}, status=status.HTTP_200_OK)
    except Exception:
        logger.exception('Error during logout for user %s', request.user.id)
        return Response({'error': 'Logout failed'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
