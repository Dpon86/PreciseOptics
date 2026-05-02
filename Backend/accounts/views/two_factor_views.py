"""
Two-factor authentication views - setup, verification, and backup codes
"""
import logging
from rest_framework import status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.throttling import ScopedRateThrottle
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from ..models import CustomUser, StaffProfile, UserSession, TwoFactorBackupCode
from ..serializers import CustomUserSerializer, StaffProfileSerializer

logger = logging.getLogger(__name__)


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def setup_2fa(request):
    """
    Setup 2FA for the authenticated user.
    Requires the user's current password to prevent session-hijack enrolment.
    Returns QR code data and secret key.
    """
    import pyqrcode
    from io import BytesIO
    import base64
    from django_otp.plugins.otp_totp.models import TOTPDevice

    user = request.user

    # Require password confirmation before enrolling a new authenticator
    current_password = request.data.get('current_password')
    if not current_password:
        return Response(
            {'error': 'current_password is required to enable 2FA'},
            status=status.HTTP_400_BAD_REQUEST
        )
    if not user.check_password(current_password):
        return Response(
            {'error': 'Incorrect password'},
            status=status.HTTP_403_FORBIDDEN
        )
    
    # Check if device already exists
    device = TOTPDevice.objects.filter(user=user, confirmed=True).first()
    if device:
        return Response(
            {'error': '2FA is already enabled for this account'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Create unconfirmed device
    device, created = TOTPDevice.objects.get_or_create(
        user=user,
        name='default',
        confirmed=False
    )
    
    # Generate QR code
    otpauth_url = device.config_url
    qr = pyqrcode.create(otpauth_url)
    buffer = BytesIO()
    qr.svg(buffer, scale=6)
    qr_code_svg = buffer.getvalue().decode('utf-8')
    
    # Alternative: PNG format
    buffer_png = BytesIO()
    qr.png(buffer_png, scale=6)
    qr_code_png = base64.b64encode(buffer_png.getvalue()).decode('utf-8')
    
    return Response({
        'secret': device.key,
        'qr_code_svg': qr_code_svg,
        'qr_code_png': qr_code_png,
        'otpauth_url': otpauth_url,
        'message': 'Scan this QR code with your authenticator app'
    })


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def verify_2fa_setup(request):
    """
    Verify the 2FA setup by checking the code from authenticator app
    """
    from django_otp.plugins.otp_totp.models import TOTPDevice
    
    user = request.user
    code = request.data.get('code')
    
    if not code:
        return Response(
            {'error': 'Verification code is required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Get the unconfirmed device
        device = TOTPDevice.objects.get(user=user, confirmed=False, name='default')
        
        # Verify the code
        if device.verify_token(code):
            # Confirm the device
            device.confirmed = True
            device.save()
            
            # Enable 2FA for the user
            user.two_factor_enabled = True
            user.save()
            
            return Response({
                'message': '2FA has been successfully enabled',
                'backup_codes': TwoFactorBackupCode.generate_for_user(user),
                'backup_codes_note': (
                    'Store these codes securely. Each can be used once '
                    'to sign in if you lose access to your authenticator app. '
                    'They will not be shown again.'
                ),
            })
        else:
            return Response(
                {'error': 'Invalid verification code'},
                status=status.HTTP_400_BAD_REQUEST
            )
    except TOTPDevice.DoesNotExist:
        return Response(
            {'error': 'No 2FA setup found. Please start setup first.'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def verify_backup_code(request):
    """
    Consume a one-time backup code in place of a TOTP code.

    Intended for the login flow: called when the user has selected
    "Use a backup code instead" on the 2FA prompt.
    """
    # Apply login-level rate limit to prevent brute-force
    throttle = ScopedRateThrottle()
    throttle.scope = 'login'
    if not throttle.allow_request(request, None):
        return Response(
            {'error': 'Too many attempts. Please wait before trying again.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )

    code = request.data.get('code', '').strip()
    if not code:
        return Response(
            {'error': 'Backup code is required'},
            status=status.HTTP_400_BAD_REQUEST
        )

    if TwoFactorBackupCode.verify_and_consume(request.user, code):
        remaining = TwoFactorBackupCode.objects.filter(
            user=request.user, is_used=False
        ).count()
        return Response({
            'message': 'Backup code accepted.',
            'remaining_backup_codes': remaining,
            'warning': (
                'Generate new backup codes soon.' if remaining <= 2 else None
            ),
        })

    return Response(
        {'error': 'Invalid or already-used backup code'},
        status=status.HTTP_400_BAD_REQUEST
    )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def regenerate_backup_codes(request):
    """
    Invalidate all existing backup codes and issue a fresh set.

    Requires the user's current password to prevent misuse from a
    hijacked session.
    """
    current_password = request.data.get('current_password')
    if not current_password:
        return Response(
            {'error': 'current_password is required to regenerate backup codes'},
            status=status.HTTP_400_BAD_REQUEST
        )
    if not request.user.check_password(current_password):
        return Response(
            {'error': 'Incorrect password'},
            status=status.HTTP_403_FORBIDDEN
        )

    if not request.user.two_factor_enabled:
        return Response(
            {'error': '2FA is not enabled on this account'},
            status=status.HTTP_400_BAD_REQUEST
        )

    new_codes = TwoFactorBackupCode.generate_for_user(request.user)
    return Response({
        'message': 'Backup codes regenerated. Previous codes are now invalid.',
        'backup_codes': new_codes,
        'backup_codes_note': (
            'Store these codes securely. Each can be used once '
            'to sign in if you lose access to your authenticator app. '
            'They will not be shown again.'
        ),
    })


@api_view(['POST'])
@permission_classes([])
def verify_2fa_login(request):
    """
    Verify 2FA code during login
    """
    # Enforce same strict login rate limit for 2FA verification
    throttle = ScopedRateThrottle()
    throttle.scope = 'login'
    if not throttle.allow_request(request, None):
        return Response(
            {'error': 'Too many attempts. Please wait before trying again.'},
            status=status.HTTP_429_TOO_MANY_REQUESTS,
        )
    from django_otp.plugins.otp_totp.models import TOTPDevice
    from django.contrib.auth import authenticate
    
    user_id = request.data.get('user_id')
    username = request.data.get('username')
    password = request.data.get('password')
    code = request.data.get('code')
    
    if not code or (not user_id and not username):
        return Response(
            {'error': 'User ID/username and code are required'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    try:
        # Get user
        if user_id:
            user = CustomUser.objects.get(id=user_id)
        else:
            # Re-authenticate to verify password
            user = authenticate(username=username, password=password)
            if not user:
                return Response(
                    {'error': 'Invalid credentials'},
                    status=status.HTTP_401_UNAUTHORIZED
                )
        
        # Get the confirmed device
        device = TOTPDevice.objects.get(user=user, confirmed=True, name='default')
        
        # Verify the code
        if device.verify_token(code):
            # Create token and session
            token, created = Token.objects.get_or_create(user=user)
            
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
        else:
            return Response(
                {'error': 'Invalid 2FA code'},
                status=status.HTTP_400_BAD_REQUEST
            )
    except CustomUser.DoesNotExist:
        return Response(
            {'error': 'User not found'},
            status=status.HTTP_404_NOT_FOUND
        )
    except TOTPDevice.DoesNotExist:
        return Response(
            {'error': '2FA is not enabled for this account'},
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def disable_2fa(request):
    """
    Disable 2FA for the authenticated user
    """
    from django_otp.plugins.otp_totp.models import TOTPDevice
    
    user = request.user
    password = request.data.get('password')
    
    if not password:
        return Response(
            {'error': 'Password is required to disable 2FA'},
            status=status.HTTP_400_BAD_REQUEST
        )
    
    # Verify password
    if not user.check_password(password):
        return Response(
            {'error': 'Invalid password'},
            status=status.HTTP_401_UNAUTHORIZED
        )
    
    # Delete all TOTP devices for this user
    TOTPDevice.objects.filter(user=user).delete()
    
    # Disable 2FA flag
    user.two_factor_enabled = False
    user.save()
    
    return Response({
        'message': '2FA has been successfully disabled'
    })


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_2fa_status(request):
    """
    Get 2FA status for the authenticated user
    """
    user = request.user
    return Response({
        'enabled': user.two_factor_enabled
    })
