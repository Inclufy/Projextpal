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
