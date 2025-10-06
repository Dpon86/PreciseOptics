"""
Shared permissions for PreciseOptics Eye Hospital Management System
"""
from rest_framework import permissions


class ReadOnlyOrAuthenticatedPermission(permissions.BasePermission):
    """
    Custom permission to allow read-only access for development
    and authenticated access for write operations.
    
    This permission class allows:
    - Anonymous users to perform safe methods (GET, HEAD, OPTIONS)
    - Authenticated users to perform any action
    
    Note: This is primarily for development. In production, you may want
    to require authentication for all operations.
    
    TEMPORARY: Allowing all operations for debugging
    """
    
    def has_permission(self, request, view):
        # Read permissions for any request,
        # Write permissions only for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Read permissions for any request,
        # Write permissions only for authenticated users
        if request.method in permissions.SAFE_METHODS:
            return True
        return request.user and request.user.is_authenticated