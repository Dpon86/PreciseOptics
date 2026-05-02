"""
Staff management views - staff CRUD, statistics, and specialization management
"""
import logging
from rest_framework import generics, status, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from ..models import StaffProfile
from ..serializers import StaffProfileSerializer, StaffCreateSerializer

logger = logging.getLogger(__name__)


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
    except (KeyError, ValueError) as e:
        return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        logger.exception('Error creating specialization')
        return Response({'error': 'Failed to create specialization'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(['DELETE'])
@permission_classes([permissions.IsAuthenticated])
def delete_specialization(request, spec_id):
    """
    Delete a specialization
    """
    try:
        SpecializationData.delete(int(spec_id))
        return Response(status=status.HTTP_204_NO_CONTENT)
    except ValueError:
        return Response({'error': 'Invalid specialization ID'}, status=status.HTTP_400_BAD_REQUEST)
    except Exception:
        logger.exception('Error deleting specialization %s', spec_id)
        return Response({'error': 'Failed to delete specialization'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
