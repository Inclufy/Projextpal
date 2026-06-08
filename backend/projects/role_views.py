"""Role-aware project view.

Resolves the user's EFFECTIVE role *within a specific project* (from
ProjectMembership, with sensible fallbacks from the app-level role) and the
set of tab-categories that role may see. The frontend uses this to curate the
project sidebar so a Stakeholder gets a different, limited view than the PM —
without locking tenant admins out.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .views import accessible_project_ids
from .models import Project
from .permissions import can_view_costs


# Membership roles that get the full project (no tab filtering).
FULL_ROLES = {"project_owner", "project_manager"}

# Tab-categories each *limited* membership role may see. Categories are matched
# against the sidebar item URLs on the frontend (categoryOf()).
ROLE_ALLOWED = {
    "project_leader": ["overview", "planning", "execution", "raid", "reports", "discussion", "team"],
    "facilitator":    ["overview", "planning", "execution", "raid", "reports", "discussion", "team"],
    "outside_eyes":   ["overview", "raid", "governance", "reports", "discussion"],
    "stakeholder":    ["overview", "reports", "discussion"],
    "other":          ["overview", "discussion"],
}

# When a user has no explicit ProjectMembership row, fall back from the
# app-level role: (effective_role, full_access).
APP_FALLBACK = {
    "pm": ("project_manager", True),
    "program_manager": ("project_manager", True),
    "contributor": ("project_leader", False),
    "reviewer": ("outside_eyes", False),
    "guest": ("stakeholder", False),
}


def effective_project_role(user, project):
    """Return (role_key, full_access:bool) for this user on this project."""
    role = getattr(user, "role", None)
    if role in ("superadmin", "admin") or getattr(user, "is_superuser", False):
        return "project_owner", True
    try:
        from .models import ProjectMembership
        m = ProjectMembership.objects.filter(project=project, user=user).first()
    except Exception:
        m = None
    if m and m.role:
        return m.role, (m.role in FULL_ROLES)
    return APP_FALLBACK.get(role, ("stakeholder", False))


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_project_role(request, pk):
    project = Project.objects.filter(id=pk, id__in=accessible_project_ids(request.user)).first()
    if not project:
        return Response({"detail": "Project not found or not accessible."}, status=404)

    role, full = effective_project_role(request.user, project)
    costs_ok = full and can_view_costs(request.user)
    allowed = ["*"] if full else ROLE_ALLOWED.get(role, ["overview", "discussion"])
    label = dict([
        ("project_owner", "Project Owner"), ("project_manager", "Project Manager"),
        ("project_leader", "Project Leader"), ("facilitator", "Facilitator"),
        ("outside_eyes", "Outside Eyes"), ("stakeholder", "Stakeholder"),
        ("other", "Member"),
    ]).get(role, role)

    return Response({
        "project_id": project.id,
        "role": role,
        "role_label": label,
        "full_access": full,
        "can_view_costs": costs_ok,
        "allowed_categories": allowed,
        "read_only": role in ("stakeholder", "outside_eyes", "other"),
    })
