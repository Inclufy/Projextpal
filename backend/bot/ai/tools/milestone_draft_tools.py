"""Co-pilot tool: propose + persist 4-8 project milestones.

Same pattern as draft_business_case / draft_risk_register. Methodology-
agnostic — runs on every project methodology because projects.Milestone
is a plain-project artefact.

Idempotent per (project_id, name): a second call updates missing dates
on an existing milestone, never duplicates. order_index is assigned
sequentially per the chronological order the draft returned.
"""
from typing import Dict, Any
from datetime import date

from bot.ai.tools import ToolRegistry
from bot.ai.utils.permissions import require_permission
from bot.ai.utils.session_context import get_user_session, get_active_project


@ToolRegistry.register_tool(return_direct=False)
def propose_milestones(project_id: str = "") -> Dict[str, Any]:
    """
    Draft and SAVE 4-8 project milestones using the project's
    uploaded-document AI context and its start_date/end_date period.
    Use this when the user asks to draft, create, propose or voorstellen
    milestones (also called "mijlpalen", "jalons").

    PROJECT_ID is optional — defaults to the active copilot project when
    the chat was opened from a project. Methodology-agnostic.

    Returns a short confirmation with how many milestones were created
    vs updated, plus a deep-link to the Milestones tab. On failure
    returns an "error" key — never raises.
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

    from projects.models import Project, Milestone
    from projects.role_views import accessible_project_ids
    try:
        project = Project.objects.filter(
            id=pid, id__in=accessible_project_ids(user),
        ).first()
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
            surface="copilot-tool-propose-milestones",
        )
    except Exception:
        doc_prefix = ""

    try:
        from projects.methodology_autodrafts import draft_milestones
        result = draft_milestones(project, user, language, doc_prefix)
    except Exception as e:
        return {"error": f"Draft generation failed: {e}"}

    data = result.as_dict().get("suggested") or {}
    items = data.get("milestones") or []
    if not isinstance(items, list) or not items:
        return {"error": (
            "The LLM returned no usable milestones. Try again in a "
            "minute, or set the project start/end dates first."
        )}

    created_n, updated_n = 0, 0
    created_names: list[str] = []
    # Start order_index after any existing milestones so we append.
    base_order = (
        Milestone.objects.filter(project=project)
        .order_by("-order_index").values_list("order_index", flat=True).first()
        or 0
    )
    for idx, item in enumerate(items):
        name = (item.get("name") or "").strip()
        if not name:
            continue
        sd = item.get("start_date") or None
        ed = item.get("end_date") or None
        defaults = {
            "description": item.get("description") or "",
            "start_date": sd,
            "end_date": ed,
            "status": "pending",
            "order_index": base_order + idx + 1,
        }
        try:
            m, created = Milestone.objects.get_or_create(
                project=project, name=name, defaults=defaults,
            )
        except Exception as e:
            import logging
            logging.getLogger(__name__).warning(
                "propose_milestones: failed to create milestone %r on project %s: %s",
                name, project.id, e,
            )
            continue
        if created:
            created_n += 1
            created_names.append(name)
        else:
            dirty = False
            # Only fill empty fields, never overwrite PM edits.
            if sd and not m.start_date:
                m.start_date = sd
                dirty = True
            if ed and not m.end_date:
                m.end_date = ed
                dirty = True
            if defaults["description"] and not (m.description or "").strip():
                m.description = defaults["description"]
                dirty = True
            if dirty:
                m.save()
                updated_n += 1

    if created_n == 0 and updated_n == 0:
        return {"error": "No milestones were persisted."}

    sample = ", ".join(f"'{n}'" for n in created_names[:3]) if created_names else ""
    tail = {
        "nl": (
            f"Mijlpalen voorgesteld voor **{project.name}**: "
            f"{created_n} nieuw, {updated_n} bijgewerkt. "
            + (f"Voorbeelden: {sample}. " if sample else "")
            + f"Open ze op /projects/{project.id}/milestones om datums en "
            f"eigenaren te finetunen. Bron: {result.source}."
        ),
        "en": (
            f"Milestones proposed for **{project.name}**: "
            f"{created_n} new, {updated_n} updated. "
            + (f"Examples: {sample}. " if sample else "")
            + f"Open them at /projects/{project.id}/milestones to fine-tune "
            f"dates and owners. Source: {result.source}."
        ),
        "fr": (
            f"Jalons proposés pour **{project.name}** : "
            f"{created_n} nouveaux, {updated_n} mis à jour. "
            + (f"Exemples : {sample}. " if sample else "")
            + f"Ouvrez-les sur /projects/{project.id}/milestones pour "
            f"ajuster dates et responsables. Source : {result.source}."
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
