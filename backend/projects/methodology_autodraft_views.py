"""
Sprint 4 — Methodology auto-draft API surface.

Each endpoint:
  * `POST /api/v1/projects/<pk>/prince2/business-case/auto-draft/`
  * `POST /api/v1/projects/<pk>/prince2/project-brief/auto-draft/`
  * `POST /api/v1/projects/<pk>/scrum/auto-draft/`
  * `POST /api/v1/projects/<pk>/kanban/suggest-swimlanes/`
  * `POST /api/v1/projects/<pk>/lss/define/auto-draft/`
  * `POST /api/v1/projects/<pk>/waterfall/suggest-phases/`

All share the same contract:
  Response 200 → {"suggested": {...}, "source": "ai"|"fallback",
                  "warnings": [str, ...]}
  Response 401 → unauthenticated
  Response 404 → project not found / not accessible to this user

No side effects — the response is purely a *suggestion*. The frontend
preview dialog is responsible for calling the existing create/update
endpoints with the (user-edited) fields.
"""
from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from core.throttles import AiContextThrottle

from .models import Project
from .methodology_autodrafts import (
    draft_business_case,
    draft_project_brief,
    draft_scrum,
    draft_kanban_swimlanes,
    draft_lss_define,
    draft_waterfall_phases,
)


class _AiThrottle(ScopedRateThrottle):
    """Reuse the shared "ai" throttle scope (60/hour) — same as ai-plan."""

    def allow_request(self, request, view):
        setattr(view, "throttle_scope", "ai")
        return super().allow_request(request, view)


def _get_project(request, pk):
    from .role_views import accessible_project_ids
    return Project.objects.filter(id=pk, id__in=accessible_project_ids(request.user)).first()


def _run_draft(request, pk, draft_fn, audit_action):
    project = _get_project(request, pk)
    if not project:
        return Response({"detail": "Project niet gevonden of niet toegankelijk."}, status=404)

    from core.i18n_ai import resolve_ui_language
    from core.ai_context_helpers import get_project_context_prefix
    language = resolve_ui_language(request)
    doc_prefix = get_project_context_prefix(request.user, pk, language, surface="autodraft")

    result = draft_fn(project, request.user, language, doc_prefix)

    try:
        from accounts.models import audit
        audit(
            request.user, audit_action,
            summary=f"AI auto-draft op project {project.id} ({result.source})",
            target_type="project", target_id=project.id, request=request,
        )
    except Exception:
        pass
    return Response(result.as_dict())


# =========================================================================
# S4-01  PRINCE2 Business Case
# =========================================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([_AiThrottle, AiContextThrottle])
def prince2_business_case_auto_draft(request, pk):
    return _run_draft(request, pk, draft_business_case, "project.ai_auto_draft_bc")


# =========================================================================
# S4-02  PRINCE2 Project Brief
# =========================================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([_AiThrottle, AiContextThrottle])
def prince2_project_brief_auto_draft(request, pk):
    return _run_draft(request, pk, draft_project_brief, "project.ai_auto_draft_brief")


# =========================================================================
# S4-03  Scrum Vision + Backlog
# =========================================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([_AiThrottle, AiContextThrottle])
def scrum_auto_draft(request, pk):
    return _run_draft(request, pk, draft_scrum, "project.ai_auto_draft_scrum")


# =========================================================================
# S4-04  Kanban swimlane suggestions
# =========================================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([_AiThrottle, AiContextThrottle])
def kanban_suggest_swimlanes(request, pk):
    return _run_draft(request, pk, draft_kanban_swimlanes, "project.ai_suggest_swimlanes")


# =========================================================================
# S4-05  LSS DMAIC Define phase
# =========================================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([_AiThrottle, AiContextThrottle])
def lss_define_auto_draft(request, pk):
    return _run_draft(request, pk, draft_lss_define, "project.ai_auto_draft_lss_define")


# =========================================================================
# S4-06  Waterfall phase suggestions
# =========================================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([_AiThrottle, AiContextThrottle])
def waterfall_suggest_phases(request, pk):
    return _run_draft(request, pk, draft_waterfall_phases, "project.ai_suggest_phases")
