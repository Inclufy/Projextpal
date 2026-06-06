from rest_framework.permissions import BasePermission, IsAuthenticated


def HasRole(*roles):
    """
    Factory that returns a DRF permission class which checks that the
    authenticated user has one of the required roles.

    Usage: permission_classes = [HasRole("admin")]
    """

    class _HasRolePermission(BasePermission):
        def has_permission(self, request, view):
            if not IsAuthenticated().has_permission(request, view):
                return False
            user = request.user
            # superadmin is a tenant-spanning operational role — it always
            # passes any role gate (fixes call sites that forgot to list it).
            if getattr(user, "role", None) == "superadmin" or getattr(user, "is_superuser", False):
                return True
            return getattr(user, "role", None) in roles

    return _HasRolePermission


class IsSuperAdmin(BasePermission):
    """
    Permission class that only allows superadmin users.
    """
    def has_permission(self, request, view):
        return (
            request.user and 
            request.user.is_authenticated and 
            request.user.is_superuser
        )
