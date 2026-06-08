"""Role-aware project + programme views.

Resolves the user's EFFECTIVE role within a specific project/programme (from
membership, with app-role fallbacks) and the tab-categories that role may see.
Admins/superadmins can preview any role's curated view via ?preview_role=.
"""
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .views import accessible_project_ids
from .models import Project
from .permissions import can_view_costs


FULL_ROLES = {"project_owner", "project_manager"}

ROLE_ALLOWED = {
    "project_leader": ["overview", "planning", "execution", "raid", "reports", "discussion", "team"],
    "facilitator":    ["overview", "planning", "execution", "raid", "reports", "discussion", "team"],
    "outside_eyes":   ["overview", "raid", "governance", "reports", "discussion"],
    "stakeholder":    ["overview", "reports", "discussion"],
    "other":          ["overview", "discussion"],
}

APP_FALLBACK = {
    "pm": ("project_manager", True),
    "program_manager": ("project_manager", True),
    "contributor": ("project_leader", False),
    "reviewer": ("outside_eyes", False),
    "guest": ("stakeholder", False),
}

ROLE_LABELS = {
    "project_owner": "Project Owner", "project_manager": "Project Manager",
    "project_leader": "Project Leader", "facilitator": "Facilitator",
    "outside_eyes": "Outside Eyes", "stakeholder": "Stakeholder", "other": "Member",
}

PREVIEWABLE = ["project_manager", "project_leader", "facilitator", "outside_eyes", "stakeholder", "other"]


def _is_admin(user):
    return getattr(user, "role", None) in ("admin", "superadmin") or getattr(user, "is_superuser", False)


def effective_project_role(user, project):
    if _is_admin(user):
        return "project_owner", True
    try:
        from .models import ProjectMembership
        m = ProjectMembership.objects.filter(project=project, user=user).first()
    except Exception:
        m = None
    if m and m.role:
        return m.role, (m.role in FULL_ROLES)
    return APP_FALLBACK.get(getattr(user, "role", None), ("stakeholder", False))


def _classify_program_role(text):
    t = (text or "").lower()
    if any(k in t for k in ("owner", "director", "sro", "senior responsible", "manager", "lead", "sponsor", "chair")):
        return "project_manager", True
    if any(k in t for k in ("stakeholder", "observer", "viewer", "outside", "assurance")):
        return "outside_eyes" if "assurance" in t or "outside" in t else "stakeholder", False
    return "stakeholder", False


def effective_program_role(user, program):
    if _is_admin(user):
        return "project_owner", True
    if getattr(user, "role", None) in ("pm", "program_manager"):
        return "project_manager", True
    try:
        from programs.models import ProgramTeam
        m = ProgramTeam.objects.filter(program=program, user=user).first()
    except Exception:
        m = None
    if m and m.role:
        return _classify_program_role(m.role)
    return APP_FALLBACK.get(getattr(user, "role", None), ("stakeholder", False))


def _build_response(obj_id, role, full, user, preview=False):
    costs_ok = bool(full and (preview or can_view_costs(user)))
    allowed = ["*"] if full else ROLE_ALLOWED.get(role, ["overview", "discussion"])
    return Response({
        "id": obj_id,
        "role": role,
        "role_label": ROLE_LABELS.get(role, role),
        "full_access": full,
        "can_view_costs": costs_ok,
        "allowed_categories": allowed,
        "read_only": role in ("stakeholder", "outside_eyes", "other"),
        "preview": preview,
        "previewable_roles": PREVIEWABLE if _is_admin(user) else [],
    })


def _apply_preview(request, role, full):
    """If an admin asked to preview a role, swap in that role's view."""
    pr = request.query_params.get("preview_role")
    if pr and _is_admin(request.user) and pr in PREVIEWABLE:
        return pr, (pr in FULL_ROLES), True
    return role, full, False


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_project_role(request, pk):
    project = Project.objects.filter(id=pk, id__in=accessible_project_ids(request.user)).first()
    if not project:
        return Response({"detail": "Project not found or not accessible."}, status=404)
    role, full = effective_project_role(request.user, project)
    role, full, preview = _apply_preview(request, role, full)
    return _build_response(project.id, role, full, request.user, preview)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_program_role(request, pk):
    from programs.models import Program
    program = Program.objects.filter(id=pk).first()
    if not program:
        return Response({"detail": "Programme not found."}, status=404)
    # Access: admins anywhere; else same company or a team membership.
    if not _is_admin(request.user):
        same_company = getattr(program, "company_id", None) == getattr(request.user, "company_id", None)
        is_member = False
        try:
            from programs.models import ProgramTeam
            is_member = ProgramTeam.objects.filter(program=program, user=request.user).exists()
        except Exception:
            pass
        if not (same_company or is_member):
            return Response({"detail": "Programme not accessible."}, status=404)
    role, full = effective_program_role(request.user, program)
    role, full, preview = _apply_preview(request, role, full)
    return _build_response(program.id, role, full, request.user, preview)
