from datetime import date, datetime
from decimal import Decimal
from typing import Dict, Any
from bot.ai.tools import ToolRegistry
from bot.ai.tools import form_tool
from bot.ai.tools.form_schemas import PROJECT_FORM_SCHEMA, PROJECT_UPDATE_SCHEMA
from bot.ai.utils.permissions import require_permission
from bot.ai.utils.session_context import get_user_session
from projects.models import Project


@form_tool
@ToolRegistry.register_tool()
def get_project_form() -> Dict[str, Any]:
    """
    Returns the project creation form to create a new project. No arguments needed.
    Use this when user wants to create a new project.
    """
    permission_error = require_permission()
    if permission_error:
        return permission_error

    return PROJECT_FORM_SCHEMA


@form_tool
@ToolRegistry.register_tool()
def update_project_form(project_id: str) -> Dict[str, Any]:
    """
    Returns the project update form for an existing project. PROJECT_ID is required.
    Use this when user wants to update/edit a project.
    """
    permission_error = require_permission()
    if permission_error:
        return permission_error

    if not project_id.isdigit():
        return {"error": "Invalid project ID format"}

    user_session = get_user_session()
    user = user_session["user"]

    project = Project.objects.filter(id=int(project_id), company=user.company).first()
    if not project:
        return {"error": f"Project with ID {project_id} not found"}

    # Return schema with current values
    schema = PROJECT_UPDATE_SCHEMA.copy()
    schema["entity_id"] = project.id
    schema["current_values"] = {
        "name": project.name,
        "description": project.description or "",
        "methodology": project.methodology,
        "start_date": str(project.start_date) if project.start_date else "",
        "end_date": str(project.end_date) if project.end_date else "",
        "budget": float(project.budget) if project.budget else 0,
        "status": project.status,
    }
    return schema


@ToolRegistry.register_tool(return_direct=False)
def delete_project(project_id: str) -> Dict[str, Any]:
    """
    Deletes the project. PROJECT_ID is required.
    """
    permission_error = require_permission(return_dict=True)
    if permission_error:
        return permission_error

    if not project_id.isdigit():
        return {"error": "Invalid project ID format"}

    project_id = int(project_id)
    user_session = get_user_session()
    user = user_session["user"]

    project = Project.objects.filter(id=project_id, company=user.company).first()

    if not project:
        return {"error": f"Project with ID {project_id} not found or you don't have access to it."}

    project_name = project.name
    project.delete()

    return {
        "success": True,
        "message": f"Project '{project_name}' has been successfully deleted."
    }


@ToolRegistry.register_tool(return_direct=False)
def list_projects(status: str = None, page: int = 1, size: int = 10) -> Dict[str, Any]:
    """
    Lists all projects. Optionally filter by status (planning, in_progress, on_hold, completed, cancelled).
    """
    permission_error = require_permission(return_dict=True, allowed_roles=["superadmin", "admin", "pm", "team_member"])
    if permission_error:
        return permission_error

    user_session = get_user_session()
    user = user_session["user"]

    projects = Project.objects.filter(company=user.company)

    if status:
        projects = projects.filter(status=status)

    total = projects.count()
    start = (page - 1) * size
    end = start + size
    projects = projects[start:end]

    project_list = []
    for p in projects:
        project_list.append({
            "id": p.id,
            "name": p.name,
            "status": p.status,
            "methodology": p.methodology,
            "progress": p.compute_progress_from_work(),
            "start_date": str(p.start_date) if p.start_date else None,
            "end_date": str(p.end_date) if p.end_date else None,
        })

    return {
        "success": True,
        "message": f"Found {total} project(s).",
        "data": {
            "projects": project_list,
            "total": total,
            "page": page,
            "size": size
        }
    }
