"""
Plan met AI — API-oppervlak.

  POST /api/v1/projects/<pk>/ai-plan/         chatbeurt → vraag of voorstel
  POST /api/v1/projects/<pk>/ai-plan/apply/   (bewerkt) voorstel → echte rijen

Zelfde toegangsmodel als de coach: IsAuthenticated + accessible_project_ids.
De chat-endpoint valt onder de "ai"-throttle-scope (budgetbescherming).
"""
from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle

from .models import Project


class _AiThrottle(ScopedRateThrottle):
    """ScopedRateThrottle leest de scope van het view-attribuut; bij een
    function-based view zetten we die hier expliciet op "ai" (60/uur)."""

    def allow_request(self, request, view):
        setattr(view, "throttle_scope", "ai")
        return super().allow_request(request, view)


def _get_project(request, pk):
    from .role_views import accessible_project_ids
    return Project.objects.filter(id=pk, id__in=accessible_project_ids(request.user)).first()


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([_AiThrottle])
def project_ai_plan(request, pk):
    """Eén chatbeurt. Body: {messages: [{role: user|assistant, content: str}]}."""
    project = _get_project(request, pk)
    if not project:
        return Response({"detail": "Project niet gevonden of niet toegankelijk."}, status=404)

    from .ai_planner import plan_chat
    from core.i18n_ai import resolve_ui_language
    messages = (request.data or {}).get("messages") or []
    if not isinstance(messages, list):
        return Response({"detail": "messages moet een lijst zijn."}, status=400)

    language = resolve_ui_language(request)

    # Sprint 4 (S4-07) — "Genereer uit documenten" shortcut. When the caller
    # passes `use_documents: true` AND the project has a ProjectAIContext,
    # auto-inject a short user prompt that asks the planner to extract
    # milestones (and tasks + risks) from those documents. This lets the UI
    # offer a one-click "generate from documents" button without the user
    # having to type anything.
    use_documents = bool((request.data or {}).get("use_documents"))
    if use_documents and not messages:
        has_docs = False
        try:
            aic = getattr(project, "ai_context", None)
            if aic and aic.enabled and (aic.extracted_text or "").strip():
                has_docs = True
        except Exception:
            has_docs = False
        if has_docs:
            if language == "en":
                auto = (
                    "Use the uploaded project documents to generate milestones, "
                    "tasks and risks for this project. Base dates on timing in "
                    "those documents when stated; otherwise interpolate within "
                    "the project period. Return a propose action."
                )
            elif language == "fr":
                auto = (
                    "Utilisez les documents téléversés pour générer les jalons, "
                    "tâches et risques. Basez les dates sur le calendrier des "
                    "documents quand il est présent; sinon interpolez dans la "
                    "période du projet. Renvoyez une action propose."
                )
            else:
                auto = (
                    "Gebruik de geüploade projectdocumenten om mijlpalen, taken "
                    "en risico's voor dit project te genereren. Baseer datums op "
                    "de timing in de documenten als die er is; anders "
                    "interpoleer binnen de projectperiode. Geef een propose "
                    "action terug."
                )
            messages = [{"role": "user", "content": auto}]

    result = plan_chat(project, request.user, messages, language=language)

    try:
        from accounts.models import audit
        audit(request.user, "project.ai_plan_chat",
              summary=f"AI-planchat op project {project.id} ({result.get('action')})",
              target_type="project", target_id=project.id, request=request)
    except Exception:
        pass
    return Response(result)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def project_ai_plan_apply(request, pk):
    """Past een (door de gebruiker bewerkt) voorstel toe. Body: {proposal: {...}}."""
    project = _get_project(request, pk)
    if not project:
        return Response({"detail": "Project niet gevonden of niet toegankelijk."}, status=404)

    proposal = (request.data or {}).get("proposal")
    if not isinstance(proposal, dict):
        return Response({"detail": "proposal is verplicht."}, status=400)

    from .ai_planner import apply_plan
    created = apply_plan(project, request.user, proposal)

    try:
        from accounts.models import audit
        audit(request.user, "project.ai_plan_apply",
              summary=(f"AI-plan toegepast op project {project.id}: "
                       f"{created['milestones']} mijlpalen, {created['tasks']} taken, "
                       f"{created['risks']} risico's"),
              target_type="project", target_id=project.id, request=request)
    except Exception:
        pass
    return Response({"created": created})
