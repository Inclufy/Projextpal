from datetime import date, datetime
from typing import Dict, Any
from bot.ai.tools import ToolRegistry
from bot.ai.tools import form_tool
from bot.ai.tools.form_schemas import MILESTONE_FORM_SCHEMA, MILESTONE_UPDATE_SCHEMA
from bot.ai.utils.permissions import require_permission
from bot.ai.utils.session_context import get_user_session
from projects.models import Milestone


@form_tool
@ToolRegistry.register_tool()
def get_milestone_form() -> Dict[str, Any]:
    """
    Returns the milestone creation form to create a new milestone.
    Use this when user wants to create a new milestone.
    """
    permission_error = require_permission()
    if permission_error:
        return permission_error

    return MILESTONE_FORM_SCHEMA


@form_tool
@ToolRegistry.register_tool()
def update_milestone_form(milestone_id: str) -> Dict[str, Any]:
    """
    Returns the milestone update form for an existing milestone. MILESTONE_ID is required.
    Use this when user wants to update/edit a milestone.
    """
    permission_error = require_permission()
    if permission_error:
        return permission_error

    if not milestone_id.isdigit():
        return {"error": "Invalid milestone ID format"}

    user_session = get_user_session()
    user = user_session["user"]

    milestone = Milestone.objects.filter(
        id=int(milestone_id), 
        project__company=user.company
    ).first()
    
    if not milestone:
        return {"error": f"Milestone with ID {milestone_id} not found"}

    schema = MILESTONE_UPDATE_SCHEMA.copy()
    schema["entity_id"] = milestone.id
    schema["current_values"] = {
        "name": milestone.name,
        "description": milestone.description or "",
        "project_id": milestone.project.id,
        "start_date": str(milestone.start_date) if milestone.start_date else "",
        "end_date": str(milestone.end_date) if milestone.end_date else "",
        "status": milestone.status,
    }
    return schema


@ToolRegistry.register_tool(return_direct=False)
def create_milestone(
    project_id: str,
    name: str,
    description: str = "",
    start_date: str = "",
    end_date: str = "",
    status: str = "pending",
) -> Dict[str, Any]:
    """
    Create a new milestone on the given project — DIRECTLY, without opening a
    form. Prefer this over get_milestone_form whenever the user has supplied
    enough context (project + name). Dates are optional strings in YYYY-MM-DD
    format; status must be one of: pending, in_progress, completed, on_hold.
    Returns the created milestone's id + name on success.
    """
    permission_error = require_permission(
        return_dict=True,
        allowed_roles=["superadmin", "admin", "pm", "team_member"],
    )
    if permission_error:
        return permission_error

    if not project_id or not str(project_id).isdigit():
        return {"error": "project_id is required and must be numeric."}
    if not name or not name.strip():
        return {"error": "A milestone name is required."}

    name = name.strip()[:255]
    description = (description or "").strip()
    allowed_status = {"pending", "in_progress", "completed", "on_hold"}
    status = status if status in allowed_status else "pending"

    def _parse_date(s: str):
        if not s:
            return None
        try:
            return datetime.strptime(s.strip(), "%Y-%m-%d").date()
        except Exception:
            return None

    sd = _parse_date(start_date)
    ed = _parse_date(end_date)
    if sd and ed and ed < sd:
        return {"error": "end_date cannot be before start_date."}

    user_session = get_user_session()
    user = user_session["user"]

    # Tenant check — the milestone must land on a project the caller can access.
    from projects.models import Project
    project = Project.objects.filter(id=int(project_id), company=user.company).first()
    if not project:
        return {"error": f"Project {project_id} not found or you don't have access."}

    try:
        m = Milestone.objects.create(
            project=project, name=name, description=description,
            start_date=sd, end_date=ed, status=status,
        )
    except Exception as e:
        return {"error": f"Could not create milestone: {e}"}

    return {
        "success": True,
        "message": f"Milestone '{m.name}' created on project '{project.name}'.",
        "data": {"id": m.id, "name": m.name, "project_id": project.id, "status": m.status},
    }


@ToolRegistry.register_tool(return_direct=False)
def delete_milestone(milestone_id: str) -> Dict[str, Any]:
    """
    Deletes the milestone. MILESTONE_ID is required.
    """
    permission_error = require_permission(return_dict=True)
    if permission_error:
        return permission_error

    if not milestone_id.isdigit():
        return {"error": "Invalid milestone ID format"}

    milestone_id = int(milestone_id)
    user_session = get_user_session()
    user = user_session["user"]

    milestone = Milestone.objects.filter(
        id=milestone_id, 
        project__company=user.company
    ).first()

    if not milestone:
        return {"error": f"Milestone with ID {milestone_id} not found or you don't have access to it."}

    milestone_name = milestone.name
    milestone.delete()

    return {
        "success": True,
        "message": f"Milestone '{milestone_name}' has been successfully deleted."
    }


@ToolRegistry.register_tool(return_direct=False)
def list_milestones(
    project_id: str = None, 
    status: str = None,
    page: int = 1, 
    size: int = 10
) -> Dict[str, Any]:
    """
    Lists milestones. Optionally filter by project_id or status.
    Status options: pending, in_progress, completed
    """
    permission_error = require_permission(
        return_dict=True, 
        allowed_roles=["superadmin", "admin", "pm", "team_member"]
    )
    if permission_error:
        return permission_error

    user_session = get_user_session()
    user = user_session["user"]

    milestones = Milestone.objects.filter(project__company=user.company)

    if project_id and project_id.isdigit():
        milestones = milestones.filter(project__id=int(project_id))

    if status:
        milestones = milestones.filter(status=status)

    total = milestones.count()
    start = (page - 1) * size
    end = start + size
    milestones = milestones.order_by('-created_at')[start:end]

    milestone_list = []
    for m in milestones:
        task_count = m.tasks.count()
        completed_tasks = m.tasks.filter(status='done').count()
        
        milestone_list.append({
            "id": m.id,
            "name": m.name,
            "status": m.status,
            "project": m.project.name,
            "project_id": m.project.id,
            "start_date": str(m.start_date) if m.start_date else None,
            "end_date": str(m.end_date) if m.end_date else None,
            "task_count": task_count,
            "completed_tasks": completed_tasks,
            "progress": round((completed_tasks / task_count * 100) if task_count > 0 else 0, 1),
        })

    return {
        "success": True,
        "message": f"Found {total} milestone(s).",
        "data": {
            "milestones": milestone_list,
            "total": total,
            "page": page,
            "size": size
        }
    }
