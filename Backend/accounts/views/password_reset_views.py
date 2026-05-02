"""
Password reset views - request and confirm password reset
"""
import logging
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.response import Response
from ..models import CustomUser

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([])  # Allow unauthenticated access
def request_password_reset(request):
    """
    Request a password reset email
    """
    # Enforce strict rate limit: 5 requests per hour per IP
    throttle = ScopedRateThrottle()
    throttle.scope = 'password_reset'
    if not throttle.allow_request(request, None):
        return Response(
            {'error': 'Too many password reset requests. Please try again later.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )
    from django.core.mail import send_mail
    from django.conf import settings
    from django.utils import timezone
    from datetime import timedelta
    import secrets
    from ..models import PasswordResetToken
    
    email = request.data.get('email')
    if not email:
        return Response(
            {'error': 'Email address is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Find user by email
        user = CustomUser.objects.get(email=email)
        
        # Generate secure token
        token = secrets.token_urlsafe(32)
        
        # Create reset token (expires in 1 hour)
        reset_token = PasswordResetToken.objects.create(
            user=user,
            token=token,
            expires_at=timezone.now() + timedelta(hours=1)
        )
        
        # Build reset URL
        reset_url = f"{settings.FRONTEND_URL}/reset-password?token={token}"
        
        # Send email
        subject = 'PreciseOptics - Password Reset Request'
        message = f"""
Hello {user.get_full_name()},

You have requested to reset your password for PreciseOptics Eye Hospital Management System.

Please click the link below to reset your password:
{reset_url}

This link will expire in 1 hour.

If you did not request this password reset, please ignore this email.

Best regards,
PreciseOptics Team
        """
        
        send_mail(
            subject,
            message,
            settings.DEFAULT_FROM_EMAIL,
            [email],
            fail_silently=False,
        )
        
        return Response({
            'message': 'Password reset instructions have been sent to your email'
        })
        
    except CustomUser.DoesNotExist:
        # Don't reveal if email exists or not (security best practice)
        return Response({
            'message': 'If an account with that email exists, password reset instructions have been sent'
        })
    except Exception:
        logger.exception('Error sending password reset email')
        return Response(
            {'error': 'Failed to send reset email. Please try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([])  # Allow unauthenticated access
def confirm_password_reset(request):
    """
    Confirm password reset with token
    """
    from django.utils import timezone
    from ..models import PasswordResetToken
    
    token = request.data.get('token')
    password = request.data.get('password')
    
    if not token or not password:
        return Response(
            {'error': 'Token and password are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Find the reset token
        reset_token = PasswordResetToken.objects.get(token=token)
        
        # Check if token is valid
        if not reset_token.is_valid():
            return Response(
                {'error': 'This reset link has expired or has already been used'},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        # Update user password
        user = reset_token.user
        user.set_password(password)
        user.save()
        
        # Mark token as used
        reset_token.is_used = True
        reset_token.save()
        
        return Response({
            'message': 'Password has been reset successfully'
        })
        
    except PasswordResetToken.DoesNotExist:
        return Response(
            {'error': 'Invalid reset token'},
            status=status.HTTP_400_BAD_REQUEST
        )
    except Exception:
        logger.exception('Error confirming password reset')
        return Response(
            {'error': 'Failed to reset password. Please try again later.'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )
