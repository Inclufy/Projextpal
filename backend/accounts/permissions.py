from rest_framework.permissions import BasePermission, IsAuthenticated


def HasRole(*roles):
    """
    Factory that returns a DRF permission class which checks that the
    authenticated user has one of the required roles.

    Usage: permission_classes = [HasRole("admin")]

    Note: superadmin is always allowed (system-wide override) regardless of
    whether it appears in `roles`. This matches IsCompanyAdmin /
    IsAdminOrSuperAdmin in admin_portal/permissions.py and prevents the
    common bug where every endpoint must remember to add "superadmin"
    explicitly to its role list.
    """

    class _HasRolePermission(BasePermission):
        def has_permission(self, request, view):
            if not IsAuthenticated().has_permission(request, view):
                return False
            user_role = getattr(request.user, "role", None)
            if user_role == "superadmin":
                return True
            return user_role in roles

    return _HasRolePermission
