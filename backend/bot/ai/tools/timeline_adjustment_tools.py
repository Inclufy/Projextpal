from typing import Dict, Any, Optional
from datetime import datetime, timedelta
from bot.ai.tools import ToolRegistry
from bot.ai.utils.permissions import require_permission
from bot.ai.utils.session_context import get_user_session
from projects.models import Project, Milestone, Task
import re


def parse_duration(duration_str: str) -> Optional[timedelta]:
    """
    Parse natural language duration strings into timedelta objects.

    Supports:
    - "2 weeks", "2 week", "2w"
    - "3 days", "3 day", "3d"
    - "1 month", "1 months", "1mo"
    - "6 hours", "6 hour", "6h"
    - Negative values for reducing time: "-2 weeks", "reduce by 3 days"

    Returns None if parsing fails.
    """
    # Clean and normalize the input
    duration_str = duration_str.lower().strip()

    # Check if this is a reduction (negative adjustment)
    is_reduction = bool(
        re.search(r"\b(reduce|shorten|decrease|subtract)\b", duration_str)
    )

    # Remove words like "by", "extend", "reduce", "for", etc.
    duration_str = re.sub(
        r"\b(by|extend|reduce|for|add|shorten|decrease|subtract)\b", "", duration_str
    ).strip()

    # Pattern to match number and unit
    # Supports: 2 weeks, 2weeks, 2w, -2weeks, etc.
    pattern = r"(-?\d+(?:\.\d+)?)\s*(week|weeks|w|day|days|d|month|months|mo|hour|hours|h|year|years|y)?"

    matches = re.findall(pattern, duration_str)

    if not matches:
        return None

    total_delta = timedelta(0)

    for value_str, unit in matches:
        try:
            value = float(value_str)
        except ValueError:
            continue

        # If it's a reduction and the value is positive, make it negative
        if is_reduction and value > 0:
            value = -value

        # Convert to days based on unit
        if unit in ["week", "weeks", "w"]:
            total_delta += timedelta(weeks=value)
        elif unit in ["day", "days", "d", ""]:  # Default to days if no unit
            total_delta += timedelta(days=value)
        elif unit in ["month", "months", "mo"]:
            # Approximate month as 30 days
            total_delta += timedelta(days=value * 30)
        elif unit in ["year", "years", "y"]:
            # Approximate year as 365 days
            total_delta += timedelta(days=value * 365)
        elif unit in ["hour", "hours", "h"]:
            total_delta += timedelta(hours=value)

    return total_delta if total_delta != timedelta(0) else None


@ToolRegistry.register_tool(return_direct=False)
def adjust_project_timeline(
    project_id: str,
    duration: str,
    adjust_end_date_only: str = "true",
) -> Dict[str, Any]:
    """
    Adjusts the timeline of a project by extending or reducing its duration.

    Args:
        project_id: The ID of the project to adjust
        duration: Duration to adjust by (e.g., "2 weeks", "3 days", "-1 week")
                 Use negative values or words like "reduce" to shorten timeline
        adjust_end_date_only: If "true", only adjust end date. If "false", shift both start and end dates. Default is true.

    Examples:
    - "extend by 2 weeks"
    - "reduce by 3 days"
    - "add 1 month"
    - "-2 weeks"
    """
    # Check user permissions
    permission_error = require_permission(return_dict=True)
    if permission_error:
        return permission_error

    # Validate project ID
    if not project_id.isdigit():
        return {"error": "Invalid project ID format"}

    project_id = int(project_id)

    # Get user session
    user_session = get_user_session()
    user = user_session["user"]

    # Get the project
    project = Project.objects.filter(id=project_id, company=user.company).first()

    if not project:
        return {
            "error": f"Project with ID {project_id} not found or you don't have access to it."
        }

    # Parse duration
    time_delta = parse_duration(duration)

    if time_delta is None:
        return {
            "error": f"Could not parse duration '{duration}'. Please use formats like '2 weeks', '3 days', '1 month', etc."
        }

    # Convert string to boolean
    adjust_end_only = adjust_end_date_only.lower() in ["true", "yes", "1"]

    # Store old dates for comparison
    old_start = project.start_date
    old_end = project.end_date

    # Adjust dates
    if adjust_end_only:
        # Only adjust end date
        if project.end_date:
            project.end_date = project.end_date + time_delta
    else:
        # Shift both dates
        if project.start_date:
            project.start_date = project.start_date + time_delta
        if project.end_date:
            project.end_date = project.end_date + time_delta

    # Save the project
    project.save()

    # Prepare response message
    action = "extended" if time_delta.total_seconds() > 0 else "reduced"
    days = abs(time_delta.days)

    return {
        "success": True,
        "message": f"Project '{project.name}' timeline has been {action} by {days} day(s).",
        "details": {
            "project_id": project.id,
            "project_name": project.name,
            "old_start_date": str(old_start) if old_start else None,
            "new_start_date": str(project.start_date) if project.start_date else None,
            "old_end_date": str(old_end) if old_end else None,
            "new_end_date": str(project.end_date) if project.end_date else None,
            "adjusted_by_days": time_delta.days,
            "end_date_only": adjust_end_only,
        },
    }


@ToolRegistry.register_tool(return_direct=False)
def adjust_milestone_timeline(
    milestone_id: str,
    duration: str,
    adjust_end_date_only: str = "true",
    cascade_to_tasks: str = "true",
) -> Dict[str, Any]:
    """
    Adjusts the timeline of a milestone by extending or reducing its duration.
    Can optionally cascade the adjustment to all tasks within the milestone.

    Args:
        milestone_id: The ID of the milestone to adjust
        duration: Duration to adjust by (e.g., "2 weeks", "3 days", "-1 week")
        adjust_end_date_only: If "true", only adjust end date. If "false", shift both dates. Default is true.
        cascade_to_tasks: If "true", also adjust all tasks within this milestone proportionally.

    Examples:
    - "extend milestone by 1 week"
    - "reduce by 2 days"
    """
    # Check user permissions
    permission_error = require_permission(return_dict=True)
    if permission_error:
        return permission_error

    # Validate milestone ID
    if not milestone_id.isdigit():
        return {"error": "Invalid milestone ID format"}

    milestone_id = int(milestone_id)

    # Get user session
    user_session = get_user_session()
    user = user_session["user"]

    # Get the milestone
    milestone = Milestone.objects.filter(
        id=milestone_id, project__company=user.company
    ).first()

    if not milestone:
        return {
            "error": f"Milestone with ID {milestone_id} not found or you don't have access to it."
        }

    # Parse duration
    time_delta = parse_duration(duration)

    if time_delta is None:
        return {
            "error": f"Could not parse duration '{duration}'. Please use formats like '2 weeks', '3 days', etc."
        }

    # Convert strings to booleans
    adjust_end_only = adjust_end_date_only.lower() in ["true", "yes", "1"]
    cascade = cascade_to_tasks.lower() in ["true", "yes", "1"]

    # Store old dates
    old_start = milestone.start_date
    old_end = milestone.end_date

    # Adjust milestone dates
    if adjust_end_only:
        if milestone.end_date:
            milestone.end_date = milestone.end_date + time_delta
    else:
        if milestone.start_date:
            milestone.start_date = milestone.start_date + time_delta
        if milestone.end_date:
            milestone.end_date = milestone.end_date + time_delta

    milestone.save()

    # Cascade to tasks if requested
    tasks_adjusted = 0
    if cascade:
        tasks = Task.objects.filter(milestone=milestone)
        for task in tasks:
            if adjust_end_only:
                # Only adjust due date
                if task.due_date:
                    task.due_date = task.due_date + time_delta
            else:
                # Shift both dates
                if task.start_date:
                    task.start_date = task.start_date + time_delta
                if task.due_date:
                    task.due_date = task.due_date + time_delta
            task.save()
            tasks_adjusted += 1

    # Prepare response
    action = "extended" if time_delta.total_seconds() > 0 else "reduced"
    days = abs(time_delta.days)

    return {
        "success": True,
        "message": f"Milestone '{milestone.name}' timeline has been {action} by {days} day(s)."
        + (f" {tasks_adjusted} task(s) were also adjusted." if cascade else ""),
        "details": {
            "milestone_id": milestone.id,
            "milestone_name": milestone.name,
            "project_name": milestone.project.name,
            "old_start_date": str(old_start) if old_start else None,
            "new_start_date": (
                str(milestone.start_date) if milestone.start_date else None
            ),
            "old_end_date": str(old_end) if old_end else None,
            "new_end_date": str(milestone.end_date) if milestone.end_date else None,
            "adjusted_by_days": time_delta.days,
            "end_date_only": adjust_end_only,
            "tasks_adjusted": tasks_adjusted,
        },
    }


@ToolRegistry.register_tool(return_direct=False)
def adjust_task_timeline(
    task_id: str,
    duration: str,
    adjust_due_date_only: str = "true",
) -> Dict[str, Any]:
    """
    Adjusts the timeline of a task by extending or reducing its duration.

    Args:
        task_id: The ID of the task to adjust
        duration: Duration to adjust by (e.g., "2 weeks", "3 days", "-1 week")
        adjust_due_date_only: If "true", only adjust due date. If "false", shift both start and due dates. Default is true.

    Examples:
    - "extend task by 2 days"
    - "reduce by 1 week"
    - "add 3 days"
    """
    # Check user permissions
    permission_error = require_permission(return_dict=True)
    if permission_error:
        return permission_error

    # Validate task ID
    if not task_id.isdigit():
        return {"error": "Invalid task ID format"}

    task_id = int(task_id)

    # Get user session
    user_session = get_user_session()
    user = user_session["user"]

    # Get the task
    task = Task.objects.filter(
        id=task_id, milestone__project__company=user.company
    ).first()

    if not task:
        return {
            "error": f"Task with ID {task_id} not found or you don't have access to it."
        }

    # Parse duration
    time_delta = parse_duration(duration)

    if time_delta is None:
        return {
            "error": f"Could not parse duration '{duration}'. Please use formats like '2 weeks', '3 days', etc."
        }

    # Convert string to boolean
    adjust_due_only = adjust_due_date_only.lower() in ["true", "yes", "1"]

    # Store old dates
    old_start = task.start_date
    old_due = task.due_date

    # Adjust task dates
    if adjust_due_only:
        if task.due_date:
            task.due_date = task.due_date + time_delta
    else:
        if task.start_date:
            task.start_date = task.start_date + time_delta
        if task.due_date:
            task.due_date = task.due_date + time_delta

    task.save()

    # Prepare response
    action = "extended" if time_delta.total_seconds() > 0 else "reduced"
    days = abs(time_delta.days)

    return {
        "success": True,
        "message": f"Task '{task.title}' timeline has been {action} by {days} day(s).",
        "details": {
            "task_id": task.id,
            "task_title": task.title,
            "milestone_name": task.milestone.name,
            "project_name": task.milestone.project.name,
            "old_start_date": str(old_start) if old_start else None,
            "new_start_date": str(task.start_date) if task.start_date else None,
            "old_due_date": str(old_due) if old_due else None,
            "new_due_date": str(task.due_date) if task.due_date else None,
            "adjusted_by_days": time_delta.days,
            "due_date_only": adjust_due_only,
        },
    }


# @ToolRegistry.register_tool(return_direct=False)
# def adjust_all_project_tasks_timeline(
#     project_id: str,
#     duration: str,
#     adjust_due_date_only: str = "true",
# ) -> Dict[str, Any]:
#     """
#     Adjusts the timeline of ALL tasks within a project by extending or reducing their duration.
#     This is useful when you want to uniformly adjust all tasks without changing milestone boundaries.

#     Args:
#         project_id: The ID of the project whose tasks to adjust
#         duration: Duration to adjust by (e.g., "2 weeks", "3 days", "-1 week")
#         adjust_due_date_only: If "true", only adjust due dates. If "false", shift both start and due dates. Default is true.

#     Examples:
#     - "extend all project tasks by 1 week"
#     - "push all tasks by 2 days"
#     """
#     # Check user permissions
#     permission_error = require_permission(return_dict=True)
#     if permission_error:
#         return permission_error

#     # Validate project ID
#     if not project_id.isdigit():
#         return {"error": "Invalid project ID format"}

#     project_id = int(project_id)

#     # Get user session
#     user_session = get_user_session()
#     user = user_session["user"]

#     # Get the project
#     project = Project.objects.filter(id=project_id, company=user.company).first()

#     if not project:
#         return {
#             "error": f"Project with ID {project_id} not found or you don't have access to it."
#         }

#     # Parse duration
#     time_delta = parse_duration(duration)

#     if time_delta is None:
#         return {
#             "error": f"Could not parse duration '{duration}'. Please use formats like '2 weeks', '3 days', etc."
#         }

#     # Convert string to boolean
#     adjust_due_only = adjust_due_date_only.lower() in ["true", "yes", "1"]

#     # Get all tasks for this project
#     tasks = Task.objects.filter(milestone__project=project)

#     if not tasks.exists():
#         return {"error": f"No tasks found for project '{project.name}'."}

#     # Adjust all tasks
#     tasks_adjusted = 0
#     for task in tasks:
#         if adjust_due_only:
#             # Only adjust due date
#             if task.due_date:
#                 task.due_date = task.due_date + time_delta
#         else:
#             # Shift both dates
#             if task.start_date:
#                 task.start_date = task.start_date + time_delta
#             if task.due_date:
#                 task.due_date = task.due_date + time_delta
#         task.save()
#         tasks_adjusted += 1

#     # Prepare response
#     action = "extended" if time_delta.total_seconds() > 0 else "reduced"
#     days = abs(time_delta.days)

#     return {
#         "success": True,
#         "message": f"All {tasks_adjusted} task(s) in project '{project.name}' have been {action} by {days} day(s).",
#         "details": {
#             "project_id": project.id,
#             "project_name": project.name,
#             "tasks_adjusted": tasks_adjusted,
#             "adjusted_by_days": time_delta.days,
#             "due_date_only": adjust_due_only,
#         },
#     }


# @ToolRegistry.register_tool(return_direct=False)
# def bulk_adjust_milestones_timeline(
#     project_id: str,
#     duration: str,
#     adjust_end_date_only: str = "true",
#     include_tasks: str = "true",
# ) -> Dict[str, Any]:
#     """
#     Adjusts the timeline of ALL milestones within a project and optionally their tasks.
#     By default, extends milestones by adjusting end dates only.

#     Args:
#         project_id: The ID of the project whose milestones to adjust
#         duration: Duration to adjust by (e.g., "2 weeks", "3 days", "-1 week")
#         adjust_end_date_only: If "true", only adjust end dates. If "false", shift both start and end dates. Default is true.
#         include_tasks: If "true", also adjust all tasks within each milestone

#     Examples:
#     - "extend all milestones by 2 weeks"
#     - "push entire project schedule by 1 month"
#     """
#     # Check user permissions
#     permission_error = require_permission(return_dict=True)
#     if permission_error:
#         return permission_error

#     # Validate project ID
#     if not project_id.isdigit():
#         return {"error": "Invalid project ID format"}

#     project_id = int(project_id)

#     # Get user session
#     user_session = get_user_session()
#     user = user_session["user"]

#     # Get the project
#     project = Project.objects.filter(id=project_id, company=user.company).first()

#     if not project:
#         return {
#             "error": f"Project with ID {project_id} not found or you don't have access to it."
#         }

#     # Parse duration
#     time_delta = parse_duration(duration)

#     if time_delta is None:
#         return {
#             "error": f"Could not parse duration '{duration}'. Please use formats like '2 weeks', '3 days', etc."
#         }

#     # Convert strings to booleans
#     adjust_end_only = adjust_end_date_only.lower() in ["true", "yes", "1"]
#     adjust_tasks = include_tasks.lower() in ["true", "yes", "1"]

#     # Get all milestones for this project
#     milestones = Milestone.objects.filter(project=project)

#     if not milestones.exists():
#         return {"error": f"No milestones found for project '{project.name}'."}

#     # Adjust all milestones
#     milestones_adjusted = 0
#     tasks_adjusted = 0

#     for milestone in milestones:
#         if adjust_end_only:
#             # Only adjust end date
#             if milestone.end_date:
#                 milestone.end_date = milestone.end_date + time_delta
#         else:
#             # Shift both dates
#             if milestone.start_date:
#                 milestone.start_date = milestone.start_date + time_delta
#             if milestone.end_date:
#                 milestone.end_date = milestone.end_date + time_delta
#         milestone.save()
#         milestones_adjusted += 1

#         # Adjust tasks if requested
#         if adjust_tasks:
#             tasks = Task.objects.filter(milestone=milestone)
#             for task in tasks:
#                 if adjust_end_only:
#                     # Only adjust due date
#                     if task.due_date:
#                         task.due_date = task.due_date + time_delta
#                 else:
#                     # Shift both dates
#                     if task.start_date:
#                         task.start_date = task.start_date + time_delta
#                     if task.due_date:
#                         task.due_date = task.due_date + time_delta
#                 task.save()
#                 tasks_adjusted += 1

#     # Prepare response
#     action = "extended" if time_delta.total_seconds() > 0 else "reduced"
#     days = abs(time_delta.days)

#     message = f"All {milestones_adjusted} milestone(s) in project '{project.name}' have been {action} by {days} day(s)."
#     if adjust_tasks:
#         message += f" {tasks_adjusted} task(s) were also adjusted."

#     return {
#         "success": True,
#         "message": message,
#         "details": {
#             "project_id": project.id,
#             "project_name": project.name,
#             "milestones_adjusted": milestones_adjusted,
#             "tasks_adjusted": tasks_adjusted,
#             "adjusted_by_days": time_delta.days,
#             "end_date_only": adjust_end_only,
#         },
#     }
