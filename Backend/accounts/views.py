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
    User login endpoint
    """
    serializer = LoginSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.validated_data['user']
        
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
