"""
Lookup views - departments, specializations, user types
"""
from rest_framework import permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from ..models import CustomUser, StaffProfile


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
