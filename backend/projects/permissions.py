"""
Project-level permission classes.

`MethodologyMatchesProjectPermission` enforces API-level methodology
isolation: a request to e.g. `/api/v1/projects/8/scrum/board/` is rejected
with HTTP 403 when project 8's `methodology` field is not Scrum.

Background: prior behaviour silently returned an empty Scrum board for a
PRINCE2 project — wrong-URL navigation showed a confusing empty screen
instead of a clear 403. See the 2026-04-28 project audit (P1-D).
"""

from rest_framework.permissions import BasePermission
from rest_framework.exceptions import PermissionDenied


# ── Yanmar SC-05: role-based cost/rate visibility ────────────────────────
# Only management/finance roles may see hourly rates and labour costs.
# Contributors / reviewers / guests get these fields stripped.
COST_VIEWER_ROLES = {"superadmin", "admin", "pm", "program_manager"}


def can_view_costs(user) -> bool:
    """True if the user may see rates/costs (Yanmar SC-05)."""
    if not user or not getattr(user, "is_authenticated", False):
        return False
    if getattr(user, "is_superuser", False):
        return True
    return getattr(user, "role", None) in COST_VIEWER_ROLES


def can_view_costs_for(user, project) -> bool:
    """Costs (budgets/expenses/rates) are visible only when ALL hold:
      1. the user's role may see costs (`can_view_costs`), AND
      2. the user is NOT an external (cross-tenant) collaborator on this project
         (role gate alone would leak host financials to a partner PM/admin), AND
      3. the user is NOT a project member explicitly restricted on THIS project
         (per-member `ProjectTeam.can_view_costs=False`) — so costs can be masked
         for specific people even inside the owning company.
    Superadmin always sees costs."""
    if getattr(user, "is_superuser", False):
        return True
    if not can_view_costs(user) or is_external_member(user, project):
        return False
    # Per-member confidentiality: only query when costs would otherwise show.
    if project is not None and getattr(user, "id", None):
        from .models import ProjectTeam
        restricted = ProjectTeam.objects.filter(
            project=project, user=user, can_view_costs=False
        ).exists()
        if restricted:
            return False
    return True


class CanViewCosts(BasePermission):
    """DRF permission — only finance/management roles may access cost-bearing
    endpoints (budget categories/items/overview). Yanmar SC-05."""
    message = "You do not have permission to view project costs."

    def has_permission(self, request, view):
        return can_view_costs(request.user)


# ── Cross-tenant CONFIDENTIALITY layer ───────────────────────────────────
# A collaborator from another company (added to a shared project via explicit
# membership) may collaborate on the board/events/execution, but must NEVER see
# the host company's internal financials, hourly rates, or internal tasks.


def is_external_member(user, project) -> bool:
    """True when `user` is an EXTERNAL (cross-tenant) collaborator on `project`.

    External member = authenticated, NOT superadmin, has a company, and belongs
    to a different company than the project's host company
    (``user.company_id != project.company_id``). Such a user can only be here
    through explicit project membership, so they collaborate on the shared
    project but internal/confidential data must be withheld from them.

    Same-company users and superadmins are never "external".
    """
    if not user or not getattr(user, "is_authenticated", False):
        return False
    if getattr(user, "role", None) == "superadmin" or getattr(user, "is_superuser", False):
        return False
    company_id = getattr(user, "company_id", None)
    if not company_id:
        return False
    project_company_id = getattr(project, "company_id", None)
    if project_company_id is None:
        return False
    return company_id != project_company_id


def exclude_internal_for_external(task_qs, user):
    """Remove internal-only tasks a user isn't allowed to see from a Task qs.

    A task flagged ``is_internal=True`` stays visible to the task's host company
    (``milestone.project.company_id == user.company_id``) and to superadmins;
    for everyone else (external cross-tenant members, or a user with no company)
    it is excluded. Non-internal tasks are never touched.

    The FK path follows the real relation Task → milestone → project → company.
    """
    from django.db.models import Q
    if user is None or not getattr(user, "is_authenticated", False):
        return task_qs
    # Superadmin / is_superuser keep seeing everything.
    if getattr(user, "role", None) == "superadmin" or getattr(user, "is_superuser", False):
        return task_qs
    own_company_id = getattr(user, "company_id", None)
    return task_qs.exclude(
        Q(is_internal=True) & ~Q(milestone__project__company_id=own_company_id)
    )


# URL methodology slugs that participate in isolation enforcement.
# Anything not in this set is treated as a non-methodology URL and skipped.
_METHODOLOGY_SLUGS = {
    'scrum', 'kanban', 'waterfall', 'prince2', 'agile',
    'lss-green', 'lss-black', 'hybrid',
    'sixsigma', 'define', 'measure', 'analyze', 'improve', 'control',
}

# Map URL methodology slug → expected `Project.methodology` field value.
# Some slugs are ambiguous (e.g. `sixsigma` and DMAIC phase slugs) — for
# these we treat both Green-Belt and Black-Belt as valid (handled below).
_SLUG_TO_FIELD = {
    'scrum': 'scrum',
    'kanban': 'kanban',
    'waterfall': 'waterfall',
    'prince2': 'prince2',
    'agile': 'agile',
    'lss-green': 'lean_six_sigma_green',
    'lss-black': 'lean_six_sigma_black',
    'hybrid': 'hybrid',
    # Ambiguous LSS / DMAIC entry points — accept any LSS belt.
    'sixsigma': 'lean_six_sigma_green',
    'define': 'lean_six_sigma_green',
    'measure': 'lean_six_sigma_green',
    'analyze': 'lean_six_sigma_green',
    'improve': 'lean_six_sigma_green',
    'control': 'lean_six_sigma_green',
}

_LSS_AMBIGUOUS_SLUGS = {'sixsigma', 'define', 'measure', 'analyze', 'improve', 'control'}


class MethodologyMatchesProjectPermission(BasePermission):
    """
    Reject requests whose URL methodology namespace doesn't match the
    project's actual methodology.

    Pulls the URL slug between `/projects/<id>/` and the next segment, looks
    up the project, and compares against `project.methodology`.

    Returns True (skip) for URLs that don't follow the
    `/projects/<id>/<slug>/...` pattern, so the class is safe to attach to
    any viewset.
    """

    message = "This methodology endpoint doesn't match the project's methodology."

    def has_permission(self, request, view):
        # Local import to avoid circulars at module-load time.
        from .models import Project

        project_id = view.kwargs.get('project_id')
        if not project_id:
            return True  # nothing to check

        path_parts = [p for p in request.path.split('/') if p]
        methodology_slug = None
        try:
            idx = path_parts.index('projects')
            # Layout A: /projects/<id>/<methodology>/...
            candidate_after = path_parts[idx + 2] if idx + 2 < len(path_parts) else None
            # Layout B: /<methodology>/projects/<id>/...
            candidate_before = path_parts[idx - 1] if idx - 1 >= 0 else None
            if candidate_after and candidate_after in _METHODOLOGY_SLUGS:
                methodology_slug = candidate_after
            elif candidate_before and candidate_before in _METHODOLOGY_SLUGS:
                methodology_slug = candidate_before
        except (ValueError, IndexError):
            return True  # not a method-namespaced URL

        if methodology_slug is None:
            return True  # not a methodology slug, skip

        try:
            project = Project.objects.only('id', 'methodology').get(id=project_id)
        except Project.DoesNotExist:
            return False

        expected = _SLUG_TO_FIELD.get(methodology_slug)
        if not expected:
            return True

        actual = project.methodology or ''

        # LSS slugs accept either belt level.
        if methodology_slug in _LSS_AMBIGUOUS_SLUGS:
            if actual.startswith('lean_six_sigma'):
                return True
            raise PermissionDenied(self.message)

        if actual == expected:
            return True

        raise PermissionDenied(self.message)


class MethodologyIsolatedViewSetMixin:
    """
    Mixin for methodology-namespaced viewsets. Adds
    `MethodologyMatchesProjectPermission` to whatever permissions the
    viewset already declares (defaults to IsAuthenticated).
    """

    def get_permissions(self):
        perms = super().get_permissions()
        perms.append(MethodologyMatchesProjectPermission())
        return perms
