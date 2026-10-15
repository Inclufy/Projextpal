"""Co-pilot tool: draft and persist a PRINCE2 Business Case.

The chat used to reply with a conversational "which documents should I
use?" question — because without a tool it could only talk. This tool
lets the agent actually DO the work: it resolves the active project (or
the explicit project_id), pulls the project's uploaded-document AI
context, runs the shared draft_business_case LLM ladder, persists the
result on the prince2.BusinessCase model (idempotent — update_or_create)
and returns a short confirmation the user sees in the chat.

Idempotent by design: a project already has at most one BusinessCase,
so a second call updates rather than duplicates. Fields that come back
empty from the LLM are not overwritten.
"""
from typing import Dict, Any

from bot.ai.tools import ToolRegistry
from bot.ai.utils.permissions import require_permission
from bot.ai.utils.session_context import get_user_session, get_active_project


@ToolRegistry.register_tool(return_direct=False)
def draft_business_case(project_id: str = "") -> Dict[str, Any]:
    """
    Draft and SAVE a PRINCE2 Business Case for a project using its
    uploaded-document AI context. Use this when the user asks you to
    draft, create, write or opstellen a Business Case (also called
    "BC", "zakelijke rechtvaardiging" or "cas d'affaires").

    PROJECT_ID is optional — defaults to the active copilot project when
    the chat was opened from a project. Prefer calling the tool without
    arguments when a project is already in scope.

    Returns a short confirmation plus the id of the created/updated
    Business Case. On failure returns an "error" key explaining what
    went wrong (project not found, user not scoped to it, LLM upstream
    down, etc.) — in all cases a dict, never raises.
    """
    permission_error = require_permission(return_dict=True)
    if permission_error:
        return permission_error

    # Resolve project — explicit arg beats session default.
    pid_raw = (project_id or "").strip() or get_active_project() or ""
    if not pid_raw:
        return {"error": (
            "No project in scope. Either open the copilot from a project "
            "page, or pass project_id explicitly."
        )}
    try:
        pid = int(pid_raw)
    except (TypeError, ValueError):
        return {"error": f"Invalid project_id: {pid_raw!r}"}

    session = get_user_session() or {}
    user = session.get("user")
    if not user:
        return {"error": "No authenticated user in copilot session."}

    from projects.models import Project
    from projects.role_views import accessible_project_ids
    try:
        qs = Project.objects.filter(id=pid)
        allowed = qs.filter(id__in=accessible_project_ids(user))
        project = allowed.first()
    except Exception as e:
        return {"error": f"Project lookup failed: {e}"}
    if not project:
        return {"error": (
            f"Project {pid} not found or not accessible for user "
            f"{getattr(user, 'email', '?')}."
        )}

    # Methodology guard — a BC only makes sense in PRINCE2 (the model
    # lives in the prince2 app). Fall through on empty methodology.
    methodology = (project.methodology or "").lower()
    if methodology and not methodology.startswith("prince2"):
        return {"error": (
            f"Project '{project.name}' uses methodology '{project.methodology}', "
            f"not PRINCE2. A Business Case lives on PRINCE2 projects. "
            f"Switch the methodology first, or use the Agile/Scrum vision "
            f"tool instead."
        )}

    # Language — prefer the user's UI language, fall back to NL.
    language = (
        getattr(user, "preferred_language", None)
        or getattr(user, "language", None)
        or "nl"
    )
    if language not in ("nl", "en", "fr"):
        language = "nl"

    # Pull uploaded-document context (empty string when none).
    try:
        from core.ai_context_helpers import get_project_context_prefix
        doc_prefix = get_project_context_prefix(
            user, project.id, language=language,
            surface="copilot-tool-draft-business-case",
        )
    except Exception:
        doc_prefix = ""

    # Run the shared LLM ladder (Anthropic → OpenAI → fallback).
    try:
        from projects.methodology_autodrafts import draft_business_case as _draft
        result = _draft(project, user, language, doc_prefix)
    except Exception as e:
        return {"error": f"Draft generation failed: {e}"}

    suggested = result.as_dict().get("suggested") or {}
    if not isinstance(suggested, dict) or not any(suggested.values()):
        return {"error": (
            "The LLM returned no usable Business Case content. Try again "
            "in a minute, or upload a leidraad as project document first."
        )}

    # Persist on prince2.BusinessCase. Only fill fields the LLM actually
    # produced — never overwrite existing content with an empty string.
    try:
        from prince2.models import BusinessCase
        defaults = {
            k: suggested[k] for k in (
                "executive_summary", "reasons", "business_options",
                "expected_benefits", "expected_dis_benefits", "major_risks",
            ) if suggested.get(k)
        }
        bc, created = BusinessCase.objects.get_or_create(
            project=project, defaults={**defaults, "status": "draft", "version": "0.1"},
        )
        if not created:
            dirty = False
            for k, v in defaults.items():
                if v and getattr(bc, k, "") != v:
                    setattr(bc, k, v)
                    dirty = True
            if dirty:
                bc.save(update_fields=list(defaults.keys()))
    except Exception as e:
        return {"error": f"Persist failed: {e}"}

    verb_nl = "aangemaakt" if created else "bijgewerkt"
    verb_en = "created" if created else "updated"
    verb_fr = "créé" if created else "mis à jour"
    verb = {"nl": verb_nl, "en": verb_en, "fr": verb_fr}.get(language, verb_nl)

    opener = {
        "nl": "Business Case",
        "en": "Business Case",
        "fr": "Business Case",
    }[language]
    tail = {
        "nl": (
            f"{opener} {verb} voor **{project.name}** op basis van de "
            f"projectdocumenten. Bron: {result.source}. "
            f"Open hem op /projects/{project.id}/prince2/business-case om "
            f"te reviewen en benefits/risks aan te vullen."
        ),
        "en": (
            f"{opener} {verb} for **{project.name}** from the project "
            f"documents. Source: {result.source}. "
            f"Open it at /projects/{project.id}/prince2/business-case to "
            f"review and add benefits/risks."
        ),
        "fr": (
            f"{opener} {verb} pour **{project.name}** à partir des "
            f"documents projet. Source : {result.source}. "
            f"Ouvrez-le sur /projects/{project.id}/prince2/business-case "
            f"pour relire et compléter bénéfices/risques."
        ),
    }[language]

    return {
        "ok": True,
        "business_case_id": bc.id,
        "project_id": project.id,
        "project_name": project.name,
        "created": created,
        "source": result.source,
        "message": tail,
    }
