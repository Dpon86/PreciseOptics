"""
Views for accounts app - User and Staff management
"""
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.authtoken.models import Token
from django.contrib.auth import authenticate, login, logout
from django.db import transaction
from django.utils import timezone
from .models import CustomUser, StaffProfile, UserSession
from .serializers import (
    CustomUserSerializer, StaffProfileSerializer, StaffCreateSerializer,
    LoginSerializer, UserSessionSerializer
)


class StaffListCreateView(generics.ListCreateAPIView):
    """
    List all staff members or create a new staff member
    """
    queryset = StaffProfile.objects.all().select_related('user')
    permission_classes = [permissions.IsAuthenticated]
    
    def get_serializer_class(self):
        if self.request.method == 'POST':
            return StaffCreateSerializer
        return StaffProfileSerializer
    
    def get_queryset(self):
        queryset = StaffProfile.objects.all().select_related('user')
        
        # Filter by department if provided
        department = self.request.query_params.get('department', None)
        if department:
            queryset = queryset.filter(department=department)
        
        # Filter by specialization if provided
        specialization = self.request.query_params.get('specialization', None)
        if specialization:
            queryset = queryset.filter(specialization=specialization)
        
        # Filter by user type if provided
        user_type = self.request.query_params.get('user_type', None)
        if user_type:
            queryset = queryset.filter(user__user_type=user_type)
        
        return queryset


class StaffDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a staff member
    """
    queryset = StaffProfile.objects.all().select_related('user')
    serializer_class = StaffProfileSerializer
    permission_classes = [permissions.IsAuthenticated]


class UserListView(generics.ListAPIView):
    """
    List all users
    """
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]
    
    def get_queryset(self):
        queryset = CustomUser.objects.all()
        
        # Filter by user type if provided
        user_type = self.request.query_params.get('user_type', None)
        if user_type:
            queryset = queryset.filter(user_type=user_type)
        
        # Filter by active status if provided
        is_active = self.request.query_params.get('is_active', None)
        if is_active is not None:
            queryset = queryset.filter(is_active=is_active.lower() == 'true')
        
        return queryset


class UserDetailView(generics.RetrieveUpdateDestroyAPIView):
    """
    Retrieve, update or delete a user
    """
    queryset = CustomUser.objects.all()
    serializer_class = CustomUserSerializer
    permission_classes = [permissions.IsAuthenticated]


@api_view(['POST'])
@permission_classes([])
def login_view(request):
    """
    User login endpoint with 2FA support
    """
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
    except Exception as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_departments(request):
    """
    Get all available departments
    """
    departments = [{'value': key, 'label': value} for key, value in StaffProfile.DEPARTMENTS]
    return Response(departments)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_specializations(request):
    """
    Get all available specializations
    """
    specializations = [{'value': key, 'label': value} for key, value in StaffProfile.SPECIALIZATIONS]
    return Response(specializations)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def get_user_types(request):
    """
    Get all available user types
    """
    user_types = [{'value': key, 'label': value} for key, value in CustomUser.USER_TYPES]
    return Response(user_types)


@api_view(['GET'])
@permission_classes([permissions.IsAuthenticated])
def staff_statistics(request):
    """
    Get staff statistics for dashboard
    """
    total_staff = StaffProfile.objects.count()
    doctors = StaffProfile.objects.filter(user__user_type='doctor').count()
    nurses = StaffProfile.objects.filter(user__user_type='nurse').count()
    technicians = StaffProfile.objects.filter(user__user_type='technician').count()
    consultants = StaffProfile.objects.filter(is_consultant=True).count()
    
    department_counts = {}
    for dept_key, dept_name in StaffProfile.DEPARTMENTS:
        count = StaffProfile.objects.filter(department=dept_key).count()
        department_counts[dept_name] = count
    
    return Response({
        'total_staff': total_staff,
        'doctors': doctors,
        'nurses': nurses,
        'technicians': technicians,
        'consultants': consultants,
        'department_counts': department_counts
    })


# Simple specialization model for this demo (you might want to create a proper model later)
class SpecializationData:
    """Simple class to handle specialization data"""
    specializations = []
    
    @classmethod
    def add(cls, data):
        data['id'] = len(cls.specializations) + 1
        cls.specializations.append(data)
        return data
    
    @classmethod
    def get_all(cls):
        return cls.specializations
    
    @classmethod
    def delete(cls, spec_id):
        cls.specializations = [s for s in cls.specializations if s['id'] != spec_id]


@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def create_specialization(request):
    """
    Create a new specialization
    """
    try:
        data = request.data.copy()
        specialization = SpecializationData.add(data)
        return Response(specialization, status=status.HTTP_201_CREATED)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_specialization(request, spec_id):
    """
    Delete a specialization
    """
    try:
        SpecializationData.delete(int(spec_id))
        return Response(status=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        return Response(
            {'error': str(e)}, 
            status=status.HTTP_400_BAD_REQUEST
        )


@api_view(['POST'])
@permission_classes([])  # Allow unauthenticated access
def request_password_reset(request):
    """
    Request a password reset email
    """
    from django.core.mail import send_mail
    from django.conf import settings
    from django.utils import timezone
    from datetime import timedelta
    import secrets
    from .models import PasswordResetToken
    
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
    except Exception as e:
        return Response(
            {'error': f'Failed to send reset email: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@permission_classes([])  # Allow unauthenticated access
def confirm_password_reset(request):
    """
    Confirm password reset with token
    """
    from django.utils import timezone
    from .models import PasswordResetToken
    
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
    except Exception as e:
        return Response(
            {'error': f'Failed to reset password: {str(e)}'},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# Two-Factor Authentication Views

@api_view(['POST'])
@permission_classes([permissions.IsAuthenticated])
def setup_2fa(request):
    """
    Setup 2FA for the authenticated user
    Returns QR code data and secret key
    """
    import pyqrcode
    from io import BytesIO
    import base64
    from django_otp.plugins.otp_totp.models import TOTPDevice
    
    user = request.user
    
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
                'backup_codes': []  # TODO: Generate backup codes
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
@permission_classes([])
def verify_2fa_login(request):
    """
    Verify 2FA code during login
    """
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
