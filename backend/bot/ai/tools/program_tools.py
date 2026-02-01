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
def list_programs(status: str = None, page: int = 1, size: int = 10) -> Dict[str, Any]:
    """
    Lists all programs. Optionally filter by status.
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

    program_list = []
    for p in programs:
        program_list.append({
            "id": p.id,
            "name": p.name,
            "status": getattr(p, 'status', 'active'),
            "start_date": str(p.start_date) if p.start_date else None,
            "end_date": str(p.end_date) if p.end_date else None,
            "project_count": p.projects.count() if hasattr(p, 'projects') else 0,
        })

    return {
        "success": True,
        "message": f"Found {total} program(s).",
        "data": {
            "programs": program_list,
            "total": total,
            "page": page,
            "size": size
        }
    }
