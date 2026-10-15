"""Copilot tools for project lifecycle + in-context updates.

These default to the *active project* — the one the copilot session was opened
from (set via session_context.set_active_project in bot.views.send_message) — so
the user can say "close this project" / "complete all tasks" / "add an action"
without repeating the project id. An explicit project_id always wins.

Methodology-agnostic: everything operates on the universal Project.status and the
Task cascade (Task.milestone__project), so it works for every project type and
methodology (Agile, Kanban, Waterfall, PRINCE2, MSP, Lean Six Sigma, …).
"""
from typing import Any, Dict, Optional

from bot.ai.tools import ToolRegistry
from bot.ai.utils.permissions import require_permission
from bot.ai.utils.session_context import get_active_project, get_user_session
from projects.models import Issue, Milestone, Project, Risk, Task

# Status values a project can be moved to (projects.models.Project.STATUS_CHOICES).
PROJECT_STATUSES = {
    "planning", "pending", "in_progress", "completed", "on_hold", "cancelled",
}


def _resolve_project(project_id: Optional[str]):
    """Resolve the target project from an explicit id or the active-project
    context, scoped to the user's company. Returns (project, error_dict)."""
    user_session = get_user_session()
    if not user_session or not user_session.get("user"):
        return None, {"error": "No authenticated user in this session."}
    user = user_session["user"]

    pid = (str(project_id).strip() if project_id else "") or (get_active_project() or "")
    if not pid:
        return None, {
            "error": "No project specified and no active project in context. "
                     "Open the copilot from inside a project, or give a project id."
        }
    if not str(pid).isdigit():
        return None, {"error": f"Invalid project id '{pid}'."}

    project = Project.objects.filter(id=int(pid), company=user.company).first()
    if not project:
        return None, {"error": f"Project {pid} not found or you don't have access to it."}
    return project, None


@ToolRegistry.register_tool(return_direct=False)
def set_project_status(status: str, project_id: str = "") -> Dict[str, Any]:
    """Set the status of a project. STATUS is one of: planning, pending,
    in_progress, completed, on_hold, cancelled. PROJECT_ID is optional — defaults
    to the project the copilot was opened from. Use this for status updates such
    as putting a project on hold or resuming it."""
    err = require_permission(return_dict=True)
    if err:
        return err
    status = (status or "").strip().lower().replace(" ", "_")
    if status not in PROJECT_STATUSES:
        return {"error": f"Invalid status '{status}'. Choose one of: {', '.join(sorted(PROJECT_STATUSES))}."}
    project, err = _resolve_project(project_id)
    if err:
        return err
    project.status = status
    project.save(update_fields=["status", "updated_at"])
    return {"success": True, "project_id": project.id, "name": project.name, "status": project.status}


@ToolRegistry.register_tool(return_direct=False)
def complete_all_activities(project_id: str = "") -> Dict[str, Any]:
    """Mark every activity/task of a project as done (100%). PROJECT_ID is
    optional — defaults to the project the copilot was opened from."""
    err = require_permission(return_dict=True)
    if err:
        return err
    project, err = _resolve_project(project_id)
    if err:
        return err
    completed = (
        Task.objects.filter(milestone__project=project)
        .exclude(status="done")
        .update(status="done", progress=100)
    )
    return {
        "success": True,
        "project_id": project.id,
        "name": project.name,
        "activities_completed": completed,
    }


@ToolRegistry.register_tool(return_direct=False)
def close_project(project_id: str = "", complete_activities: bool = True) -> Dict[str, Any]:
    """Close/finish a project: set its status to 'completed' and (by default)
    mark all its activities done. PROJECT_ID is optional — defaults to the
    project the copilot was opened from. Set COMPLETE_ACTIVITIES to false to
    close without touching the activities."""
    err = require_permission(return_dict=True)
    if err:
        return err
    project, err = _resolve_project(project_id)
    if err:
        return err
    completed = 0
    if complete_activities:
        completed = (
            Task.objects.filter(milestone__project=project)
            .exclude(status="done")
            .update(status="done", progress=100)
        )
    project.status = "completed"
    project.save(update_fields=["status", "updated_at"])
    return {
        "success": True,
        "project_id": project.id,
        "name": project.name,
        "status": project.status,
        "activities_completed": completed,
    }


@ToolRegistry.register_tool(return_direct=False)
def add_project_activity(
    title: str,
    description: str = "",
    priority: str = "medium",
    category: str = "",
    project_id: str = "",
) -> Dict[str, Any]:
    """Add an activity/action to a project (Action Tracker / Activity List).
    PROJECT_ID is optional — defaults to the project the copilot was opened from.
    PRIORITY is one of: low, medium, high, urgent. CATEGORY is a free-text group
    label (optional)."""
    err = require_permission(return_dict=True)
    if err:
        return err
    if not (title or "").strip():
        return {"error": "A title is required for the activity."}
    priority = (priority or "medium").strip().lower()
    if priority not in {"low", "medium", "high", "urgent"}:
        priority = "medium"
    project, err = _resolve_project(project_id)
    if err:
        return err
    # Tasks hang off a milestone; use the project's first milestone or create a
    # neutral "General" one so the activity has a home regardless of methodology.
    milestone = Milestone.objects.filter(project=project).order_by("id").first()
    if not milestone:
        milestone = Milestone.objects.create(project=project, name="General")
    task = Task.objects.create(
        milestone=milestone,
        title=title.strip(),
        description=(description or "").strip(),
        priority=priority,
        category=(category or "").strip(),
        status="todo",
    )
    return {
        "success": True,
        "project_id": project.id,
        "activity_id": task.id,
        "title": task.title,
        "priority": task.priority,
    }


def _user_company():
    s = get_user_session()
    user = s.get("user") if s else None
    return user, getattr(user, "company", None)


@ToolRegistry.register_tool(return_direct=False)
def complete_activity(activity_id: str) -> Dict[str, Any]:
    """Mark a single activity/action (task) as done (100%). ACTIVITY_ID is
    required. Use this to pick up and finish a specific action."""
    err = require_permission(return_dict=True)
    if err:
        return err
    if not str(activity_id).isdigit():
        return {"error": "Invalid activity id."}
    user, company = _user_company()
    task = Task.objects.filter(id=int(activity_id), milestone__project__company=company).first()
    if not task:
        return {"error": f"Activity {activity_id} not found or no access."}
    task.status = "done"
    task.progress = 100
    task.save(update_fields=["status", "progress"])
    return {"success": True, "activity_id": task.id, "title": task.title, "status": task.status}


@ToolRegistry.register_tool(return_direct=False)
def resolve_issue(issue_id: str, resolution: str = "") -> Dict[str, Any]:
    """Resolve a project issue (status -> Resolved). ISSUE_ID is required.
    RESOLUTION is an optional note describing how it was resolved."""
    err = require_permission(return_dict=True)
    if err:
        return err
    if not str(issue_id).isdigit():
        return {"error": "Invalid issue id."}
    user, company = _user_company()
    issue = Issue.objects.filter(id=int(issue_id), project__company=company).first()
    if not issue:
        return {"error": f"Issue {issue_id} not found or no access."}
    issue.status = "Resolved"
    if resolution:
        issue.resolution = resolution
    issue.save(update_fields=["status", "resolution"])
    return {"success": True, "issue_id": issue.id, "name": issue.name, "status": issue.status}


@ToolRegistry.register_tool(return_direct=False)
def mitigate_risk(risk_id: str) -> Dict[str, Any]:
    """Mark a project risk as mitigated (status -> Mitigated). RISK_ID is required."""
    err = require_permission(return_dict=True)
    if err:
        return err
    if not str(risk_id).isdigit():
        return {"error": "Invalid risk id."}
    user, company = _user_company()
    risk = Risk.objects.filter(id=int(risk_id), project__company=company).first()
    if not risk:
        return {"error": f"Risk {risk_id} not found or no access."}
    risk.status = "Mitigated"
    risk.save(update_fields=["status"])
    return {"success": True, "risk_id": risk.id, "name": risk.name, "status": risk.status}
