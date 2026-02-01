# ============================================================
# ADMIN PORTAL - PERMISSIONS
# Custom permission classes for admin portal
# ============================================================

from rest_framework.permissions import BasePermission


class IsSuperAdmin(BasePermission):
    """
    Permission class that only allows superadmin users.
    
    Checks if user has role='superadmin' from the CustomUser model.
    """
    
    message = "Only superadmin users can access this resource."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user has superadmin role
        return getattr(request.user, 'role', None) == 'superadmin'


class IsAdminOrSuperAdmin(BasePermission):
    """
    Permission class that allows admin or superadmin users.
    """
    
    message = "Only admin users can access this resource."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        return getattr(request.user, 'role', None) in ['superadmin', 'admin']


class IsCompanyAdmin(BasePermission):
    """
    Permission class that allows company admins to manage their own company.
    """
    
    message = "You don't have permission to manage this company."
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Superadmins can access everything
        if getattr(request.user, 'role', None) == 'superadmin':
            return True
        
        # Company admins can only access their own company
        return getattr(request.user, 'role', None) in ['admin', 'superadmin']
    
    def has_object_permission(self, request, view, obj):
        # Superadmins can access everything
        if getattr(request.user, 'role', None) == 'superadmin':
            return True
        
        # Check if object belongs to user's company
        if hasattr(obj, 'company'):
            return obj.company == request.user.company
        
        # If obj is a Company, check if it's the user's company
        if hasattr(obj, 'customuser_set'):  # It's a Company
            return obj == request.user.company
        
        return False
