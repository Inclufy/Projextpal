from typing import Optional
from typing import Dict, Any
from bot.ai.tools import ToolRegistry
from bot.ai.tools import form_tool
from bot.ai.tools.form_schemas import PROGRAM_FORM_SCHEMA
from bot.ai.utils.permissions import require_permission
from bot.ai.utils.session_context import get_user_session
from programs.models import Program


@form_tool
@ToolRegistry.register_tool()
def get_program_form() -> Dict[str, Any]:
    """
    Returns the program creation form to create a new program.
    Use this when user wants to create a new program.
    """
    permission_error = require_permission()
    if permission_error:
        return permission_error

    return PROGRAM_FORM_SCHEMA


@ToolRegistry.register_tool(return_direct=False)
def delete_program(program_id: str) -> Dict[str, Any]:
    """
    Deletes the program. PROGRAM_ID is required.
    """
    permission_error = require_permission(return_dict=True)
    if permission_error:
        return permission_error

    if not program_id.isdigit():
        return {"error": "Invalid program ID format"}

    program_id = int(program_id)
    user_session = get_user_session()
    user = user_session["user"]

    program = Program.objects.filter(id=program_id, company=user.company).first()

    if not program:
        return {"error": f"Program with ID {program_id} not found or you don't have access to it."}

    program_name = program.name
    program.delete()

    return {
        "success": True,
        "message": f"Program '{program_name}' has been successfully deleted."
    }


@ToolRegistry.register_tool(return_direct=False)
def list_programs(status: Optional[str] = None, page: int = 1, size: int = 10) -> Dict[str, Any]:
    """
    Lists all programs. Optionally filter by status.

    PRESENTATION: When summarizing the result for the user, ALWAYS render the
    list as a markdown table with these exact columns:

        | Naam | Status | Projecten | Startdatum | Einddatum | Health |

    Map the data fields to columns:
      - Naam       ← name
      - Status     ← status (Planning / Active / On Hold / Completed)
      - Projecten  ← project_count (integer)
      - Startdatum ← start_date (DD-MM-YYYY) or "—"
      - Einddatum  ← end_date (DD-MM-YYYY) or "—"
      - Health     ← health (green / amber / red)

    Do NOT use nested bullet lists. Keep prose around the table short.
    """
    permission_error = require_permission(
        return_dict=True, 
        allowed_roles=["superadmin", "admin", "pm", "team_member"]
    )
    if permission_error:
        return permission_error

    user_session = get_user_session()
    user = user_session["user"]

    programs = Program.objects.filter(company=user.company)

    if status:
        programs = programs.filter(status=status)

    total = programs.count()
    start = (page - 1) * size
    end = start + size
    programs = programs[start:end]

    from datetime import date as _date
    today = _date.today()

    program_list = []
    for p in programs:
        end = getattr(p, "target_end_date", None)
        status_val = getattr(p, 'status', 'active')
        if end and today > end and status_val != 'completed':
            health = "red"
        elif end and (end - today).days < 30 and status_val != 'completed':
            health = "amber"
        else:
            health = "green"
        program_list.append({
            "id": p.id,
            "name": p.name,
            "status": status_val,
            "start_date": str(p.start_date) if p.start_date else None,
            "end_date": str(p.target_end_date) if p.target_end_date else None,
            "project_count": p.projects.count() if hasattr(p, 'projects') else 0,
            "health": health,
        })

    if program_list:
        md_lines = [
            "| Naam | Status | Projecten | Startdatum | Einddatum | Health |",
            "| --- | --- | --- | --- | --- | --- |",
        ]
        for r in program_list:
            def fmt(d):
                if not d:
                    return "—"
                try:
                    y, m, dd = d.split("-")
                    return f"{dd}-{m}-{y}"
                except Exception:
                    return d
            md_lines.append(
                f"| {r['name']} | {(r['status'] or '').replace('_', ' ').title()} "
                f"| {r['project_count']} | {fmt(r['start_date'])} | {fmt(r['end_date'])} | {r['health']} |"
            )
        markdown_table = "\n".join(md_lines)
    else:
        markdown_table = "_Geen programma's gevonden._"

    return {
        "success": True,
        "message": f"Found {total} program(s).",
        "data": {
            "programs": program_list,
            "total": total,
            "page": page,
            "size": size,
            "_markdown_table": markdown_table,
        }
    }
