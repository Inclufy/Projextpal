# surveys/permissions.py
from rest_framework import permissions


# Your existing role hierarchy from accounts
ROLE_HIERARCHY = {
    "guest": 0,
    "contibuter": 1,  # Note: keeping your spelling
    "reviewer": 2,
    "pm": 3,
    "admin": 4,
    "superadmin": 5,
}

# Survey-specific role permissions
SURVEY_ACTION_ROLES = {
    "list": "guest",        # Anyone can see surveys list (filtered by access)
    "retrieve": "guest",    # Anyone can view surveys they have access to
    "create": "pm",         # PM and above can create surveys
    "update": "pm",         # PM and above can edit surveys
    "partial_update": "pm", # PM and above can edit surveys
    "destroy": "admin",     # Only admin and superadmin can delete
    "respond": "guest",     # Anyone can respond if allowed
    "results": "pm",        # PM and above can view results
}


class IsRoleAllowed(permissions.BasePermission):
    """
    Enhanced permission class that checks request.user.role with survey-specific rules
    """

    def _role_level(self, role):
        return ROLE_HIERARCHY.get(role, -1)

    def get_required_role(self, view, action):
        """Get required role for the action"""
        if hasattr(view, "required_roles") and action in view.required_roles:
            return view.required_roles[action]
        return SURVEY_ACTION_ROLES.get(action, "guest")

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if getattr(request.user, "is_superuser", False):
            return True

        required_role = self.get_required_role(view, view.action)
        user_role_level = self._role_level(request.user.role)
        required_role_level = self._role_level(required_role)
        
        return user_role_level >= required_role_level

    def has_object_permission(self, request, view, obj):
        """Object-level permissions for surveys"""
        if not self.has_permission(request, view):
            return False

        # Superadmin has access to everything
        if request.user.role == "superadmin":
            return True

        # For survey objects
        if hasattr(obj, 'project'):
            # Check if user has access to the project
            if hasattr(obj.project, 'company') and hasattr(request.user, 'company'):
                if obj.project.company != request.user.company:
                    return False

            # Survey creator can always access their surveys
            if hasattr(obj, 'created_by') and obj.created_by == request.user:
                return True

            # For viewing/responding to surveys
            if view.action in ['retrieve', 'respond']:
                # Check if user can respond to this survey
                if hasattr(obj, 'can_user_respond'):
                    return obj.can_user_respond(request.user)
                
                # Check if user's role is in allowed roles
                if hasattr(obj, 'allowed_roles'):
                    if not obj.allowed_roles or request.user.role in obj.allowed_roles:
                        return True

            # For results viewing - PM and above in same company
            if view.action == 'results':
                user_role_level = self._role_level(request.user.role)
                pm_level = self._role_level('pm')
                return user_role_level >= pm_level

        return True


class CanCreateSurvey(permissions.BasePermission):
    """Permission class for creating surveys"""
    
    def has_permission(self, request, view):
        if not request.user.is_authenticated:
            return False
        
        # PM and above can create surveys
        user_role_level = ROLE_HIERARCHY.get(request.user.role, -1)
        required_level = ROLE_HIERARCHY.get('pm', 999)
        
        return user_role_level >= required_level


class CanManageSurvey(permissions.BasePermission):
    """Permission for managing surveys (edit/delete)"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Superadmin can manage all
        if request.user.role == 'superadmin':
            return True

        # Check company access
        if hasattr(obj.project, 'company') and hasattr(request.user, 'company'):
            if obj.project.company != request.user.company:
                return False

        # Survey creator can manage their surveys
        if hasattr(obj, 'created_by') and obj.created_by == request.user:
            return True

        # Admin in same company can manage
        if request.user.role == 'admin':
            return True

        # For edit actions, PM and above
        if view.action in ['update', 'partial_update']:
            user_role_level = ROLE_HIERARCHY.get(request.user.role, -1)
            required_level = ROLE_HIERARCHY.get('pm', 999)
            return user_role_level >= required_level

        # For delete actions, admin and above only
        if view.action == 'destroy':
            user_role_level = ROLE_HIERARCHY.get(request.user.role, -1)
            required_level = ROLE_HIERARCHY.get('admin', 999)
            return user_role_level >= required_level

        return False


class CanRespondToSurvey(permissions.BasePermission):
    """Permission for responding to surveys"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Use the survey model's built-in method
        return obj.can_user_respond(request.user)


class CanViewSurveyResults(permissions.BasePermission):
    """Permission for viewing survey results"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Superadmin can view all
        if request.user.role == 'superadmin':
            return True

        # Check company access
        if hasattr(obj.project, 'company') and hasattr(request.user, 'company'):
            if obj.project.company != request.user.company:
                return False

        # Survey creator can view results
        if hasattr(obj, 'created_by') and obj.created_by == request.user:
            return True

        # PM and above can view results in their company
        user_role_level = ROLE_HIERARCHY.get(request.user.role, -1)
        pm_level = ROLE_HIERARCHY.get('pm', 999)
        
        return user_role_level >= pm_level


class IsSameCompany(permissions.BasePermission):
    """Permission to ensure users are in the same company via project"""
    
    def has_permission(self, request, view):
        return request.user.is_authenticated

    def has_object_permission(self, request, view, obj):
        # Superadmin can access all
        if request.user.role == 'superadmin':
            return True

        # Check project company vs user company
        if hasattr(obj, 'project') and hasattr(obj.project, 'company'):
            if hasattr(request.user, 'company'):
                return obj.project.company == request.user.company

        return False


# Custom permission decorators
def require_role(required_role):
    """Decorator to require specific role level"""
    def decorator(view_func):
        def wrapper(self, request, *args, **kwargs):
            if not request.user.is_authenticated:
                from rest_framework.exceptions import NotAuthenticated
                raise NotAuthenticated()

            user_role_level = ROLE_HIERARCHY.get(request.user.role, -1)
            required_level = ROLE_HIERARCHY.get(required_role, 999)

            if user_role_level < required_level and request.user.role != 'superadmin':
                from rest_framework.exceptions import PermissionDenied
                raise PermissionDenied(f"Requires {required_role} role or higher")

            return view_func(self, request, *args, **kwargs)
        return wrapper
    return decorator