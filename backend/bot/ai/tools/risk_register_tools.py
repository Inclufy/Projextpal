"""Co-pilot tool: draft an initial project risk register and persist it.

Same pattern as business_case_tools.draft_business_case but for the
projects.Risk model — which is methodology-agnostic, so this tool runs
on every project methodology (prince2, scrum, kanban, waterfall, …).

The agent calls this when the user asks to draft/create/open a risk
register, scan the project for risks, or any similar phrasing. It:
  1. Resolves the project (active context or explicit project_id).
  2. Pulls uploaded-doc AI context (tender leidraad, PvE, etc.).
  3. Runs the shared draft_risks LLM ladder for 4-8 risks.
  4. Persists each one as a projects.Risk row — idempotent on
     (project_id, name) so a second call doesn't duplicate the same risk.
  5. Returns a short confirmation with the count created vs updated and
     a deep-link so the PM can review in the usual Risks tab.
"""
from typing import Dict, Any

from bot.ai.tools import ToolRegistry
from bot.ai.utils.permissions import require_permission
from bot.ai.utils.session_context import get_user_session, get_active_project


@ToolRegistry.register_tool(return_direct=False)
def draft_risk_register(project_id: str = "") -> Dict[str, Any]:
    """
    Draft and SAVE an initial project risk register using the project's
    uploaded-document AI context. Use this when the user asks to draft,
    create, open or populate a Risk Register (also called "risico-register",
    "risicoanalyse", "registre des risques") OR when they say "scan the
    project for risks" / "wat zijn de risico's van dit project".

    PROJECT_ID is optional — defaults to the active copilot project when
    the chat was opened from a project. Methodology-agnostic: works on
    every project methodology.

    Returns a short confirmation with how many risks were created vs
    updated, plus a deep-link to the Risks tab. On failure returns an
    "error" key — never raises.
    """
    permission_error = require_permission(return_dict=True)
    if permission_error:
        return permission_error

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

    from projects.models import Project, Risk
    from projects.role_views import accessible_project_ids
    try:
        allowed = Project.objects.filter(
            id=pid, id__in=accessible_project_ids(user),
        )
        project = allowed.first()
    except Exception as e:
        return {"error": f"Project lookup failed: {e}"}
    if not project:
        return {"error": (
            f"Project {pid} not found or not accessible for user "
            f"{getattr(user, 'email', '?')}."
        )}

    language = (
        getattr(user, "preferred_language", None)
        or getattr(user, "language", None)
        or "nl"
    )
    if language not in ("nl", "en", "fr"):
        language = "nl"

    try:
        from core.ai_context_helpers import get_project_context_prefix
        doc_prefix = get_project_context_prefix(
            user, project.id, language=language,
            surface="copilot-tool-draft-risk-register",
        )
    except Exception:
        doc_prefix = ""

    try:
        from projects.methodology_autodrafts import draft_risks
        result = draft_risks(project, user, language, doc_prefix)
    except Exception as e:
        return {"error": f"Draft generation failed: {e}"}

    data = result.as_dict().get("suggested") or {}
    items = data.get("risks") or []
    if not isinstance(items, list) or not items:
        return {"error": (
            "The LLM returned no usable risks. Try again in a minute, "
            "or upload a leidraad / scope document as project document "
            "first."
        )}

    created_n, updated_n = 0, 0
    created_names: list[str] = []
    for item in items:
        name = (item.get("name") or "").strip()
        if not name:
            continue
        defaults = {
            "description": item.get("description") or "",
            "category": item.get("category") or "Operational",
            "probability": int(item.get("probability") or 50),
            "impact": item.get("impact") or "Medium",
            "level": item.get("level") or item.get("impact") or "Medium",
            "status": "Open",
            "created_by": user,
        }
        try:
            risk, created = Risk.objects.get_or_create(
                project=project, name=name, defaults=defaults,
            )
        except Exception as e:
            # One failing row must not abort the batch.
            import logging
            logging.getLogger(__name__).warning(
                "draft_risk_register: failed to create risk %r on project %s: %s",
                name, project.id, e,
            )
            continue
        if created:
            created_n += 1
            created_names.append(name)
        else:
            # Fill any empty field — never clobber an existing filled one.
            dirty = False
            for k, v in defaults.items():
                if k in ("created_by",):
                    continue
                if v and not getattr(risk, k, None):
                    setattr(risk, k, v)
                    dirty = True
            if dirty:
                risk.save()
                updated_n += 1

    if created_n == 0 and updated_n == 0:
        return {"error": "No risks were persisted — all rows failed validation."}

    sample = ", ".join(f"'{n}'" for n in created_names[:3]) if created_names else ""
    tail = {
        "nl": (
            f"Risico-register aangemaakt voor **{project.name}**: "
            f"{created_n} nieuw, {updated_n} bijgewerkt. "
            + (f"Voorbeelden: {sample}. " if sample else "")
            + f"Open ze op /projects/{project.id}/risks om eigenaar en "
            f"mitigatie aan te vullen. Bron: {result.source}."
        ),
        "en": (
            f"Risk register drafted for **{project.name}**: "
            f"{created_n} new, {updated_n} updated. "
            + (f"Examples: {sample}. " if sample else "")
            + f"Open them at /projects/{project.id}/risks to add owner "
            f"and mitigation. Source: {result.source}."
        ),
        "fr": (
            f"Registre des risques créé pour **{project.name}** : "
            f"{created_n} nouveaux, {updated_n} mis à jour. "
            + (f"Exemples : {sample}. " if sample else "")
            + f"Ouvrez-les sur /projects/{project.id}/risks pour "
            f"compléter responsable et mesures. Source : {result.source}."
        ),
    }[language]

    return {
        "ok": True,
        "project_id": project.id,
        "project_name": project.name,
        "created": created_n,
        "updated": updated_n,
        "source": result.source,
        "message": tail,
    }
