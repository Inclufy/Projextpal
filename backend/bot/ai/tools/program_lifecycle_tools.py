"""Copilot tools for programme lifecycle + in-context updates.

These default to the *active programme* — the one the copilot session was opened
from (set via session_context.set_active_program in bot.views.send_message) — so
the user can say "close this programme" / "complete all projects" without
repeating the programme id. An explicit program_id always wins.

Methodology-agnostic: everything operates on the universal Program.status, the
linked projects' status and the Task cascade (Task.milestone__project__program),
so it works for every programme type and methodology (SAFe, MSP, PMI, PRINCE2
Programme, Hybrid, …). Mirrors bot.ai.tools.project_lifecycle_tools.
"""
from typing import Any, Dict, Optional

from bot.ai.tools import ToolRegistry
from bot.ai.utils.permissions import require_permission
from bot.ai.utils.session_context import get_active_program, get_user_session
from programs.models import Program

# Status values a programme can be moved to (programs.models.Program.STATUS_CHOICES).
PROGRAM_STATUSES = {
    "planning", "active", "on_hold", "completed", "cancelled",
}


def _resolve_program(program_id: Optional[str]):
    """Resolve the target programme from an explicit id or the active-programme
    context, scoped to the user's company. Returns (program, error_dict)."""
    user_session = get_user_session()
    if not user_session or not user_session.get("user"):
        return None, {"error": "No authenticated user in this session."}
    user = user_session["user"]

    pid = (str(program_id).strip() if program_id else "") or (get_active_program() or "")
    if not pid:
        return None, {
            "error": "No programme specified and no active programme in context. "
                     "Open the copilot from inside a programme, or give a programme id."
        }
    if not str(pid).isdigit():
        return None, {"error": f"Invalid programme id '{pid}'."}

    program = Program.objects.filter(id=int(pid), company=user.company).first()
    if not program:
        return None, {"error": f"Programme {pid} not found or you don't have access to it."}
    return program, None


@ToolRegistry.register_tool(return_direct=False)
def set_program_status(status: str, program_id: str = "") -> Dict[str, Any]:
    """Set the status of a programme. STATUS is one of: planning, active,
    on_hold, completed, cancelled. PROGRAM_ID is optional — defaults to the
    programme the copilot was opened from. Use this for status updates such as
    putting a programme on hold or resuming it."""
    err = require_permission(return_dict=True)
    if err:
        return err
    status = (status or "").strip().lower().replace(" ", "_")
    if status not in PROGRAM_STATUSES:
        return {"error": f"Invalid status '{status}'. Choose one of: {', '.join(sorted(PROGRAM_STATUSES))}."}
    program, err = _resolve_program(program_id)
    if err:
        return err
    program.status = status
    program.save(update_fields=["status", "updated_at"])
    return {"success": True, "program_id": program.id, "name": program.name, "status": program.status}


@ToolRegistry.register_tool(return_direct=False)
def complete_program_projects(program_id: str = "") -> Dict[str, Any]:
    """Complete every linked project of a programme and all their activities/tasks
    (status 'completed' / tasks done at 100%). PROGRAM_ID is optional — defaults
    to the programme the copilot was opened from."""
    err = require_permission(return_dict=True)
    if err:
        return err
    program, err = _resolve_program(program_id)
    if err:
        return err
    from projects.models import Task

    projects_completed = (
        program.linked_projects.exclude(status="completed").update(status="completed")
    )
    activities_completed = (
        Task.objects.filter(milestone__project__program=program)
        .exclude(status="done")
        .update(status="done", progress=100)
    )
    return {
        "success": True,
        "program_id": program.id,
        "name": program.name,
        "projects_completed": projects_completed,
        "activities_completed": activities_completed,
    }


@ToolRegistry.register_tool(return_direct=False)
def close_program(program_id: str = "", complete_projects: bool = True) -> Dict[str, Any]:
    """Close/finish a programme: set its status to 'completed' and (by default)
    complete all its linked projects and their activities. PROGRAM_ID is optional
    — defaults to the programme the copilot was opened from. Set COMPLETE_PROJECTS
    to false to close without touching the projects."""
    err = require_permission(return_dict=True)
    if err:
        return err
    program, err = _resolve_program(program_id)
    if err:
        return err
    projects_completed = 0
    activities_completed = 0
    if complete_projects:
        from projects.models import Task

        projects_completed = (
            program.linked_projects.exclude(status="completed").update(status="completed")
        )
        activities_completed = (
            Task.objects.filter(milestone__project__program=program)
            .exclude(status="done")
            .update(status="done", progress=100)
        )
    program.status = "completed"
    program.save(update_fields=["status", "updated_at"])
    return {
        "success": True,
        "program_id": program.id,
        "name": program.name,
        "status": program.status,
        "projects_completed": projects_completed,
        "activities_completed": activities_completed,
    }
