from datetime import date, datetime
from typing import Dict, Any
from bot.ai.tools import ToolRegistry
from bot.ai.tools import form_tool
from bot.ai.tools.form_schemas import TASK_FORM_SCHEMA, TASK_UPDATE_SCHEMA
from bot.ai.utils.permissions import require_permission
from bot.ai.utils.session_context import get_user_session
from projects.models import Task


@form_tool
@ToolRegistry.register_tool()
def get_task_form() -> Dict[str, Any]:
    """
    Returns the task creation form to create a new task.
    Use this when user wants to create a new task.
    """
    permission_error = require_permission()
    if permission_error:
        return permission_error

    return TASK_FORM_SCHEMA


@form_tool
@ToolRegistry.register_tool()
def update_task_form(task_id: str) -> Dict[str, Any]:
    """
    Returns the task update form for an existing task. TASK_ID is required.
    Use this when user wants to update/edit a task.
    """
    permission_error = require_permission()
    if permission_error:
        return permission_error

    if not task_id.isdigit():
        return {"error": "Invalid task ID format"}

    user_session = get_user_session()
    user = user_session["user"]

    task = Task.objects.filter(
        id=int(task_id), 
        milestone__project__company=user.company
    ).first()
    
    if not task:
        return {"error": f"Task with ID {task_id} not found"}

    schema = TASK_UPDATE_SCHEMA.copy()
    schema["entity_id"] = task.id
    schema["current_values"] = {
        "title": task.title,
        "description": task.description or "",
        "milestone_id": task.milestone.id,
        "assigned_to": task.assigned_to.id if task.assigned_to else None,
        "priority": task.priority,
        "start_date": str(task.start_date) if task.start_date else "",
        "due_date": str(task.due_date) if task.due_date else "",
        "status": task.status,
    }
    return schema


@ToolRegistry.register_tool(return_direct=False)
def delete_task(task_id: str) -> Dict[str, Any]:
    """
    Deletes the task. TASK_ID is required.
    """
    permission_error = require_permission(return_dict=True)
    if permission_error:
        return permission_error

    if not task_id.isdigit():
        return {"error": "Invalid task ID format"}

    task_id = int(task_id)
    user_session = get_user_session()
    user = user_session["user"]

    task = Task.objects.filter(
        id=task_id, 
        milestone__project__company=user.company
    ).first()

    if not task:
        return {"error": f"Task with ID {task_id} not found or you don't have access to it."}

    task_title = task.title
    task.delete()

    return {
        "success": True,
        "message": f"Task '{task_title}' has been successfully deleted."
    }


@ToolRegistry.register_tool(return_direct=False)
def list_tasks(
    project_id: str = None, 
    milestone_id: str = None, 
    status: str = None,
    assigned_to_me: str = "false",
    page: int = 1, 
    size: int = 10
) -> Dict[str, Any]:
    """
    Lists tasks. Optionally filter by project_id, milestone_id, status, or assigned_to_me.
    Status options: todo, in_progress, blocked, done
    """
    permission_error = require_permission(
        return_dict=True, 
        allowed_roles=["superadmin", "admin", "pm", "team_member"]
    )
    if permission_error:
        return permission_error

    user_session = get_user_session()
    user = user_session["user"]

    tasks = Task.objects.filter(milestone__project__company=user.company)

    if project_id and project_id.isdigit():
        tasks = tasks.filter(milestone__project__id=int(project_id))

    if milestone_id and milestone_id.isdigit():
        tasks = tasks.filter(milestone__id=int(milestone_id))

    if status:
        tasks = tasks.filter(status=status)

    if assigned_to_me.lower() in ["true", "yes", "1"]:
        tasks = tasks.filter(assigned_to=user)

    total = tasks.count()
    start = (page - 1) * size
    end = start + size
    tasks = tasks.order_by('-created_at')[start:end]

    task_list = []
    for t in tasks:
        task_list.append({
            "id": t.id,
            "title": t.title,
            "status": t.status,
            "priority": t.priority,
            "milestone": t.milestone.name,
            "project": t.milestone.project.name,
            "assigned_to": t.assigned_to.get_full_name() if t.assigned_to else "Unassigned",
            "due_date": str(t.due_date) if t.due_date else None,
        })

    return {
        "success": True,
        "message": f"Found {total} task(s).",
        "data": {
            "tasks": task_list,
            "total": total,
            "page": page,
            "size": size
        }
    }
