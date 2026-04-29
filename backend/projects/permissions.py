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
