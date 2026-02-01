from typing import Dict, Any, Optional, List
from datetime import datetime, timedelta
from django.utils import timezone
from django.db.models import Q, Count, Avg, Sum, F
from django.conf import settings
from langchain_openai import ChatOpenAI
import json
import logging

from bot.ai.tools import ToolRegistry
from bot.ai.utils.permissions import require_permission
from bot.ai.utils.session_context import get_user_session
from projects.models import (
    Project,
    Milestone,
    Task,
    Subtask,
    Expense,
    Risk,
    ProjectTeam,
    ProjectActivity,
    Document,
    TrainingMaterial,
)
from execution.models import Stakeholder, ChangeRequest, Governance
from workflow.models import WorkflowDiagram, WorkflowNode, WorkflowEdge
from communication.models import StatusReport, Meeting, ReportingItem
from deployment.models import DeploymentPlan, StrategyItem, RolloutPhase
from surveys.models import Survey, SurveyResponse, SurveyAnswer

logger = logging.getLogger("bot.ai.project_analysis")


def get_time_filter_dates(time_filter: str) -> tuple:
    """
    Calculate the date range based on time filter.

    Returns:
        tuple: (start_date, end_date) or (None, None) for 'overall'
    """
    now = timezone.now()

    if time_filter == "day":
        start_date = now - timedelta(days=1)
    elif time_filter == "week":
        start_date = now - timedelta(weeks=1)
    elif time_filter == "month":
        start_date = now - timedelta(days=30)
    else:  # 'overall'
        return None, None

    return start_date, now


def calculate_overdue_analysis(
    project: Project, start_date=None, end_date=None
) -> Dict[str, Any]:
    """
    Calculate overdue tasks analysis.

    Returns:
        Dict with overdue metrics and patterns
    """
    today = timezone.now().date()

    # Get all overdue tasks for this project
    overdue_tasks = Task.objects.filter(
        milestone__project=project,
        due_date__lt=today,
        status__in=["todo", "in_progress", "blocked"],
    )

    # Apply time filter if provided
    if start_date and end_date:
        overdue_tasks = overdue_tasks.filter(
            Q(updated_at__gte=start_date) | Q(due_date__gte=start_date.date())
        )

    total_overdue = overdue_tasks.count()

    if total_overdue == 0:
        return {
            "total_overdue": 0,
            "by_milestone": [],
            "by_priority": {},
            "by_assignee": [],
            "average_overdue_days": 0,
            "most_affected_milestone": None,
        }

    # Calculate average overdue days
    overdue_days = [(today - task.due_date).days for task in overdue_tasks]
    avg_overdue_days = sum(overdue_days) / len(overdue_days) if overdue_days else 0

    # Group by milestone
    by_milestone = {}
    for task in overdue_tasks:
        milestone_name = task.milestone.name
        if milestone_name not in by_milestone:
            by_milestone[milestone_name] = {
                "milestone_id": task.milestone.id,
                "count": 0,
                "tasks": [],
            }
        by_milestone[milestone_name]["count"] += 1
        by_milestone[milestone_name]["tasks"].append(
            {
                "id": task.id,
                "title": task.title,
                "days_overdue": (today - task.due_date).days,
                "priority": task.priority,
                "assignee": (
                    task.assigned_to.get_full_name()
                    if task.assigned_to
                    else "Unassigned"
                ),
            }
        )

    # Group by priority
    by_priority = {
        "urgent": overdue_tasks.filter(priority="urgent").count(),
        "high": overdue_tasks.filter(priority="high").count(),
        "medium": overdue_tasks.filter(priority="medium").count(),
        "low": overdue_tasks.filter(priority="low").count(),
    }

    # Group by assignee
    by_assignee = {}
    for task in overdue_tasks:
        assignee_name = (
            task.assigned_to.get_full_name() if task.assigned_to else "Unassigned"
        )
        if assignee_name not in by_assignee:
            by_assignee[assignee_name] = {
                "assignee_id": task.assigned_to.id if task.assigned_to else None,
                "count": 0,
            }
        by_assignee[assignee_name]["count"] += 1

    # Sort by assignee count
    by_assignee_list = [
        {"name": name, **data}
        for name, data in sorted(
            by_assignee.items(), key=lambda x: x[1]["count"], reverse=True
        )
    ]

    # Find most affected milestone
    most_affected = (
        max(by_milestone.items(), key=lambda x: x[1]["count"])
        if by_milestone
        else (None, None)
    )
    most_affected_milestone = most_affected[0] if most_affected[0] else None

    return {
        "total_overdue": total_overdue,
        "by_milestone": [{"name": name, **data} for name, data in by_milestone.items()],
        "by_priority": by_priority,
        "by_assignee": by_assignee_list[:5],  # Top 5 assignees
        "average_overdue_days": round(avg_overdue_days, 1),
        "most_affected_milestone": most_affected_milestone,
    }


def calculate_workload_score(tasks: List[Task]) -> int:
    """Calculate workload score based on task priority and status."""
    weights = {"urgent": 4, "high": 3, "medium": 2, "low": 1}
    score = 0
    for task in tasks:
        if task.status != "done":
            score += weights.get(task.priority, 2)
    return score


def predict_blockers(
    project: Project, start_date=None, end_date=None
) -> Dict[str, Any]:
    """
    Predict potential blockers using heuristics.

    Returns:
        Dict with predicted blockers categorized by type
    """
    blockers = {
        "overloaded_team_members": [],
        "stalled_milestones": [],
        "dependency_risks": [],
        "unmitigated_risks": [],
        "resource_conflicts": [],
    }

    # 1. Overloaded Team Members
    team_members = ProjectTeam.objects.filter(project=project, is_active=True)
    for team_member in team_members:
        user = team_member.user
        active_tasks = Task.objects.filter(
            milestone__project=project,
            assigned_to=user,
            status__in=["todo", "in_progress", "blocked"],
        )

        task_count = active_tasks.count()
        workload_score = calculate_workload_score(list(active_tasks))

        # Check for overload
        if task_count > 5 or workload_score > 15:
            urgent_count = active_tasks.filter(priority="urgent").count()
            high_count = active_tasks.filter(priority="high").count()

            blockers["overloaded_team_members"].append(
                {
                    "user_id": user.id,
                    "name": user.get_full_name(),
                    "active_tasks": task_count,
                    "workload_score": workload_score,
                    "urgent_tasks": urgent_count,
                    "high_priority_tasks": high_count,
                    "severity": "high" if workload_score > 20 else "medium",
                }
            )

    # 2. Stalled Milestones (less than 10% progress change in 7 days)
    seven_days_ago = timezone.now() - timedelta(days=7)
    milestones = Milestone.objects.filter(
        project=project, status__in=["pending", "in_progress"]
    )

    for milestone in milestones:
        tasks = Task.objects.filter(milestone=milestone)
        if not tasks.exists():
            continue

        # Check recent activity
        recent_updates = tasks.filter(updated_at__gte=seven_days_ago).count()
        total_tasks = tasks.count()

        # Calculate current progress
        completed_tasks = tasks.filter(status="done").count()
        progress = (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0

        # If very few updates and low progress, it's stalled
        update_rate = (recent_updates / total_tasks * 100) if total_tasks > 0 else 0

        if update_rate < 10 and progress < 80 and milestone.status == "in_progress":
            blockers["stalled_milestones"].append(
                {
                    "milestone_id": milestone.id,
                    "name": milestone.name,
                    "progress": round(progress, 1),
                    "update_rate_last_7_days": round(update_rate, 1),
                    "total_tasks": total_tasks,
                    "severity": "high" if progress < 30 else "medium",
                }
            )

    # 3. Dependency Risks (tight deadlines in sequence)
    # Find tasks with tight deadlines that may be blocking others
    upcoming_deadline = timezone.now().date() + timedelta(days=2)
    tight_tasks = Task.objects.filter(
        milestone__project=project,
        due_date__lte=upcoming_deadline,
        status__in=["todo", "in_progress"],
    )

    for task in tight_tasks:
        # Check if task has high priority and is assigned
        if task.priority in ["urgent", "high"] and task.assigned_to:
            days_until_due = (task.due_date - timezone.now().date()).days

            blockers["dependency_risks"].append(
                {
                    "task_id": task.id,
                    "title": task.title,
                    "milestone": task.milestone.name,
                    "days_until_due": days_until_due,
                    "priority": task.priority,
                    "assignee": task.assigned_to.get_full_name(),
                    "severity": "high" if days_until_due < 1 else "medium",
                }
            )

    # 4. Unmitigated High Risks
    high_risks = Risk.objects.filter(project=project, status="Open", level="High")

    for risk in high_risks:
        has_mitigation = hasattr(risk, "ai_mitigation") or hasattr(
            risk, "manual_mitigation"
        )

        if not has_mitigation:
            blockers["unmitigated_risks"].append(
                {
                    "risk_id": risk.id,
                    "name": risk.name,
                    "category": risk.category,
                    "impact": risk.impact,
                    "probability": risk.probability,
                    "severity": "high",
                }
            )

    # 5. Resource Conflicts (team members on multiple critical tasks with same deadline)
    # Find users with multiple urgent/high tasks due within 3 days
    near_deadline = timezone.now().date() + timedelta(days=3)
    critical_tasks = Task.objects.filter(
        milestone__project=project,
        due_date__lte=near_deadline,
        priority__in=["urgent", "high"],
        status__in=["todo", "in_progress"],
    )

    user_critical_tasks = {}
    for task in critical_tasks:
        if task.assigned_to:
            user_id = task.assigned_to.id
            if user_id not in user_critical_tasks:
                user_critical_tasks[user_id] = {
                    "name": task.assigned_to.get_full_name(),
                    "tasks": [],
                }
            user_critical_tasks[user_id]["tasks"].append(
                {
                    "id": task.id,
                    "title": task.title,
                    "due_date": str(task.due_date),
                    "priority": task.priority,
                }
            )

    for user_id, data in user_critical_tasks.items():
        if len(data["tasks"]) > 2:
            blockers["resource_conflicts"].append(
                {
                    "user_id": user_id,
                    "name": data["name"],
                    "critical_tasks_count": len(data["tasks"]),
                    "tasks": data["tasks"],
                    "severity": "high" if len(data["tasks"]) > 3 else "medium",
                }
            )

    return blockers


def calculate_performance_metrics(
    project: Project, start_date=None, end_date=None
) -> Dict[str, Any]:
    """
    Calculate comprehensive performance metrics.

    Returns:
        Dict with performance data
    """
    # Overall project progress
    overall_progress = project.compute_progress_from_work()

    # Milestone completion rates
    milestones = Milestone.objects.filter(project=project)
    total_milestones = milestones.count()
    completed_milestones = milestones.filter(status="completed").count()
    milestone_completion_rate = (
        (completed_milestones / total_milestones * 100) if total_milestones > 0 else 0
    )

    # Task statistics
    all_tasks = Task.objects.filter(milestone__project=project)
    total_tasks = all_tasks.count()
    completed_tasks = all_tasks.filter(status="done").count()
    in_progress_tasks = all_tasks.filter(status="in_progress").count()
    blocked_tasks = all_tasks.filter(status="blocked").count()

    # Velocity calculation (tasks completed in time period)
    if start_date and end_date:
        period_completed = all_tasks.filter(
            status="done", updated_at__gte=start_date, updated_at__lte=end_date
        ).count()
        days_in_period = (end_date.date() - start_date.date()).days
        velocity_per_day = (
            period_completed / days_in_period if days_in_period > 0 else 0
        )
    else:
        # Calculate overall velocity
        if project.created_at:
            days_since_start = (timezone.now() - project.created_at).days
            velocity_per_day = (
                completed_tasks / days_since_start if days_since_start > 0 else 0
            )
        else:
            velocity_per_day = 0

    # Budget utilization
    total_budget = float(project.budget) if project.budget else 0
    expenses = Expense.objects.filter(project=project)
    total_spent = float(expenses.aggregate(Sum("amount"))["amount__sum"] or 0)
    budget_utilization = (total_spent / total_budget * 100) if total_budget > 0 else 0

    # Timeline projection
    timeline_status = "unknown"
    estimated_completion_days = None

    if project.start_date and project.end_date:
        today = timezone.now().date()
        total_project_days = (project.end_date - project.start_date).days
        days_elapsed = (
            (today - project.start_date).days if today >= project.start_date else 0
        )
        days_remaining = (
            (project.end_date - today).days if today <= project.end_date else 0
        )

        expected_progress = (
            (days_elapsed / total_project_days * 100) if total_project_days > 0 else 0
        )

        # Compare actual vs expected progress
        if overall_progress >= expected_progress:
            timeline_status = "on_track"
        elif overall_progress >= expected_progress - 10:
            timeline_status = "slight_delay"
        else:
            timeline_status = "behind_schedule"

        # Estimate completion based on current velocity
        if velocity_per_day > 0 and total_tasks > 0:
            remaining_tasks = total_tasks - completed_tasks
            estimated_days_to_complete = remaining_tasks / velocity_per_day
            estimated_completion_days = int(estimated_days_to_complete)

    # Team productivity
    team_size = ProjectTeam.objects.filter(project=project, is_active=True).count()
    avg_tasks_per_member = total_tasks / team_size if team_size > 0 else 0

    # Risk metrics
    risks = Risk.objects.filter(project=project)
    total_risks = risks.count()
    open_risks = risks.filter(status="Open").count()
    high_risks = risks.filter(level="High", status="Open").count()

    return {
        "overall_progress": overall_progress,
        "milestone_completion_rate": round(milestone_completion_rate, 1),
        "task_statistics": {
            "total": total_tasks,
            "completed": completed_tasks,
            "in_progress": in_progress_tasks,
            "blocked": blocked_tasks,
            "completion_rate": round(
                (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0, 1
            ),
        },
        "velocity": {
            "tasks_per_day": round(velocity_per_day, 2),
            "estimated_completion_days": estimated_completion_days,
        },
        "budget": {
            "total_budget": total_budget,
            "spent": total_spent,
            "remaining": total_budget - total_spent,
            "utilization_percentage": round(budget_utilization, 1),
        },
        "timeline": {
            "status": timeline_status,
            "start_date": str(project.start_date) if project.start_date else None,
            "end_date": str(project.end_date) if project.end_date else None,
            "days_remaining": (
                (project.end_date - timezone.now().date()).days
                if project.end_date
                else None
            ),
        },
        "team": {
            "size": team_size,
            "avg_tasks_per_member": round(avg_tasks_per_member, 1),
        },
        "risks": {
            "total": total_risks,
            "open": open_risks,
            "high_priority": high_risks,
        },
    }


def gather_additional_context(
    project: Project, start_date=None, end_date=None
) -> Dict[str, Any]:
    """
    Gather additional contextual information from other apps.

    Returns:
        Dict with additional context
    """
    context = {}

    # Stakeholders
    stakeholders = Stakeholder.objects.filter(project=project)
    context["stakeholders"] = {
        "total": stakeholders.count(),
        "high_influence": stakeholders.filter(influence="High").count(),
    }

    # Change Requests
    change_requests = ChangeRequest.objects.filter(project=project)
    if start_date and end_date:
        change_requests = change_requests.filter(created_at__gte=start_date)

    context["change_requests"] = {
        "total": change_requests.count(),
        "pending": change_requests.filter(status="pending").count(),
        "approved": change_requests.filter(status="approved").count(),
        "recent_high_priority": change_requests.filter(
            priority__in=["high", "urgent"]
        ).count(),
    }

    # Workflow Complexity
    try:
        workflow = WorkflowDiagram.objects.get(project=project)
        context["workflow"] = {
            "has_workflow": True,
            "nodes_count": workflow.nodes.count(),
            "edges_count": workflow.edges.count(),
        }
    except WorkflowDiagram.DoesNotExist:
        context["workflow"] = {"has_workflow": False}

    # Meetings
    meetings = Meeting.objects.filter(project=project)
    if start_date and end_date:
        meetings = meetings.filter(date__gte=start_date.date())

    context["meetings"] = {
        "total_scheduled": meetings.filter(status="scheduled").count(),
        "recent_meetings": meetings.count() if start_date else 0,
    }

    # Deployment Status
    try:
        deployment = DeploymentPlan.objects.get(project=project)
        context["deployment"] = {
            "has_plan": True,
            "strategy_items": deployment.strategy_items.count(),
            "rollout_phases": deployment.rollout_phases.count(),
        }
    except DeploymentPlan.DoesNotExist:
        context["deployment"] = {"has_plan": False}

    # Surveys & Feedback
    surveys = Survey.objects.filter(project=project)
    total_surveys = surveys.count()
    active_surveys = surveys.filter(status="Active").count()

    if total_surveys > 0:
        total_responses = SurveyResponse.objects.filter(
            survey__project=project, is_complete=True
        ).count()
        avg_response_rate = (
            (total_responses / total_surveys) if total_surveys > 0 else 0
        )
    else:
        avg_response_rate = 0

    context["surveys"] = {
        "total": total_surveys,
        "active": active_surveys,
        "avg_response_rate": round(avg_response_rate, 1),
    }

    # Recent Activities
    activities = ProjectActivity.objects.filter(project=project)
    if start_date and end_date:
        activities = activities.filter(created_at__gte=start_date)

    context["recent_activities"] = activities.count()

    # Documents
    documents = Document.objects.filter(project=project)
    context["documents"] = {
        "total": documents.count(),
        "approved": documents.filter(status="approved").count(),
        "in_review": documents.filter(status="in_review").count(),
    }

    return context


def generate_ai_insights(analysis_data: Dict[str, Any]) -> Dict[str, Any]:
    """
    Use OpenAI to generate intelligent insights from the calculated metrics.

    Returns:
        Dict with AI-generated insights
    """
    try:
        llm = ChatOpenAI(
            temperature=0.3,
            model_name="gpt-4.1",
            openai_api_key=settings.OPENAI_API_KEY,
        )

        # Prepare the prompt with analysis data
        prompt = f"""You are a project management analyst AI. Analyze the following project metrics and provide actionable insights.

Project: {analysis_data['project']['name']}
Methodology: {analysis_data['project']['methodology']}
Status: {analysis_data['project']['status']}

OVERDUE ANALYSIS:
{json.dumps(analysis_data['metrics']['overdue'], indent=2)}

PREDICTED BLOCKERS:
{json.dumps(analysis_data['metrics']['blockers'], indent=2)}

PERFORMANCE METRICS:
{json.dumps(analysis_data['metrics']['performance'], indent=2)}

ADDITIONAL CONTEXT:
{json.dumps(analysis_data['context'], indent=2)}

Based on this data, provide:
1. A 2-3 sentence executive summary highlighting the most critical information
2. Top 3 risks with specific impact assessment
3. 3-5 actionable recommendations prioritized by urgency (be specific with names, numbers, and actions)
4. Overall project health score (1-10) with brief justification
5. Key positive highlights (what's going well)

Format your response as JSON with this structure:
{{
    "executive_summary": "string",
    "top_risks": [
        {{"risk": "string", "impact": "string", "severity": "high|medium|low"}}
    ],
    "recommendations": [
        {{"action": "string", "priority": "urgent|high|medium", "rationale": "string"}}
    ],
    "health_score": {{
        "score": number,
        "justification": "string"
    }},
    "positive_highlights": ["string"]
}}"""

        response = llm.invoke(prompt)

        # Parse the response
        content = response.content.strip()

        # Try to extract JSON from markdown code blocks if present
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()

        insights = json.loads(content)

        return insights

    except Exception as e:
        logger.error(f"Error generating AI insights: {str(e)}", exc_info=True)
        # Return a fallback structure
        return {
            "executive_summary": "Analysis completed. Review detailed metrics for project status.",
            "top_risks": [],
            "recommendations": [],
            "health_score": {
                "score": 5,
                "justification": "Unable to generate AI analysis. Review metrics manually.",
            },
            "positive_highlights": [],
        }


def calculate_health_colors(analysis_data: Dict[str, Any]) -> Dict[str, str]:
    """
    Calculate health indicator colors based on analysis data.

    Returns:
        Dict with health colors for each metric
    """
    health_colors = {}
    metrics = analysis_data.get("metrics", {})
    ai_insights = analysis_data.get("ai_insights", {})

    # Get health score (1-10)
    health_score = ai_insights.get("health_score", {}).get("score", 5)

    # Define color mapping based on score
    def score_to_color(score):
        if score >= 8:
            return "#22C55E"  # Green - Excellent
        elif score >= 6:
            return "#84CC16"  # Light Green - Good
        elif score >= 4:
            return "#EAB308"  # Yellow - Warning
        elif score >= 2:
            return "#F97316"  # Orange - Concern
        else:
            return "#EF4444"  # Red - Critical

    # Scope Health - Based on overall progress and milestone completion
    performance = metrics.get("performance", {})
    overall_progress = performance.get("overall_progress", 0)
    milestone_completion = performance.get("milestone_completion_rate", 0)
    scope_score = (overall_progress + milestone_completion) / 20  # Scale to 0-10
    health_colors["scope"] = score_to_color(scope_score)

    # Time Health - Based on timeline status and blockers
    timeline_status = performance.get("timeline", {}).get("status", "unknown")
    overdue_count = metrics.get("overdue", {}).get("total_overdue", 0)

    if timeline_status == "on_track" and overdue_count == 0:
        time_score = 9
    elif timeline_status == "on_track" and overdue_count <= 2:
        time_score = 7
    elif timeline_status == "slight_delay" and overdue_count <= 5:
        time_score = 5
    elif overdue_count > 10:
        time_score = 2
    else:
        time_score = 4
    health_colors["time"] = score_to_color(time_score)

    # Cost Health - Based on budget utilization
    budget_util = performance.get("budget", {}).get("utilization_percentage", 0)
    if budget_util <= 75:
        cost_score = 9
    elif budget_util <= 90:
        cost_score = 7
    elif budget_util <= 100:
        cost_score = 5
    elif budget_util <= 110:
        cost_score = 3
    else:
        cost_score = 1
    health_colors["cost"] = score_to_color(cost_score)

    # Cash Flow Health - Based on budget remaining and spending rate
    budget_remaining = performance.get("budget", {}).get("remaining", 0)
    total_budget = performance.get("budget", {}).get("total_budget", 1)
    remaining_pct = (budget_remaining / total_budget * 100) if total_budget > 0 else 50

    if remaining_pct >= 30:
        cashflow_score = 9
    elif remaining_pct >= 15:
        cashflow_score = 7
    elif remaining_pct >= 5:
        cashflow_score = 5
    elif remaining_pct >= 0:
        cashflow_score = 3
    else:
        cashflow_score = 1
    health_colors["cash_flow"] = score_to_color(cashflow_score)

    # Safety Health - Based on blockers and risks
    blockers = metrics.get("blockers", {})
    total_blockers = sum(
        [
            len(blockers.get("overloaded_team_members", [])),
            len(blockers.get("stalled_milestones", [])),
            len(blockers.get("dependency_risks", [])),
            len(blockers.get("unmitigated_risks", [])),
            len(blockers.get("resource_conflicts", [])),
        ]
    )

    if total_blockers == 0:
        safety_score = 10
    elif total_blockers <= 2:
        safety_score = 7
    elif total_blockers <= 5:
        safety_score = 5
    elif total_blockers <= 8:
        safety_score = 3
    else:
        safety_score = 1
    health_colors["safety"] = score_to_color(safety_score)

    # Risk Health - Based on open risks and unmitigated risks
    risks_data = performance.get("risks", {})
    high_priority_risks = risks_data.get("high_priority", 0)
    open_risks = risks_data.get("open", 0)
    unmitigated = len(blockers.get("unmitigated_risks", []))

    if high_priority_risks == 0 and unmitigated == 0:
        risk_score = 10
    elif high_priority_risks <= 1 and unmitigated == 0:
        risk_score = 8
    elif high_priority_risks <= 2 or unmitigated <= 1:
        risk_score = 6
    elif high_priority_risks <= 4 or unmitigated <= 3:
        risk_score = 4
    else:
        risk_score = 2
    health_colors["risk"] = score_to_color(risk_score)

    # Quality Health - Based on overall health score and task completion rate
    task_stats = performance.get("task_statistics", {})
    completion_rate = task_stats.get("completion_rate", 0)
    blocked_tasks = task_stats.get("blocked", 0)
    total_tasks = task_stats.get("total", 1)
    blocked_pct = (blocked_tasks / total_tasks * 100) if total_tasks > 0 else 0

    # Combine health score and metrics
    if health_score >= 8 and completion_rate >= 80 and blocked_pct < 5:
        quality_score = 9
    elif health_score >= 6 and completion_rate >= 60:
        quality_score = 7
    elif health_score >= 4 and completion_rate >= 40:
        quality_score = 5
    elif health_score >= 2:
        quality_score = 3
    else:
        quality_score = 1
    health_colors["quality"] = score_to_color(quality_score)

    return health_colors


def get_project_analysis(
    project_id: str, time_filter: str = "overall"
) -> Dict[str, Any]:
    """
    Core function to gather and analyze all project data.

    Args:
        project_id: The project ID to analyze
        time_filter: Time period filter ('day', 'week', 'month', 'overall')

    Returns:
        Comprehensive analysis dictionary
    """
    # Validate project ID
    if not project_id.isdigit():
        return {"error": "Invalid project ID format"}

    project_id = int(project_id)

    # Get user session for permissions
    user_session = get_user_session()
    if not user_session or not user_session.get("user"):
        return {"error": "User session not found. Please authenticate."}

    user = user_session["user"]

    # Get the project with permission check
    try:
        project = Project.objects.get(id=project_id, company=user.company)
    except Project.DoesNotExist:
        return {
            "error": f"Project with ID {project_id} not found or you don't have access to it."
        }

    # Get time filter dates
    start_date, end_date = get_time_filter_dates(time_filter)

    # Gather all data
    logger.info(
        f"Starting analysis for project {project.name} (ID: {project_id}) with filter: {time_filter}"
    )

    overdue_analysis = calculate_overdue_analysis(project, start_date, end_date)
    blocker_prediction = predict_blockers(project, start_date, end_date)
    performance_metrics = calculate_performance_metrics(project, start_date, end_date)
    additional_context = gather_additional_context(project, start_date, end_date)

    # Compile the analysis data
    analysis_data = {
        "project": {
            "id": project.id,
            "name": project.name,
            "status": project.status,
            "methodology": project.methodology,
            "budget": float(project.budget) if project.budget else 0,
            "start_date": str(project.start_date) if project.start_date else None,
            "end_date": str(project.end_date) if project.end_date else None,
        },
        "time_period": time_filter,
        "analyzed_at": timezone.now().isoformat(),
        "metrics": {
            "overdue": overdue_analysis,
            "blockers": blocker_prediction,
            "performance": performance_metrics,
        },
        "context": additional_context,
    }

    # Generate AI insights
    logger.info("Generating AI insights...")
    ai_insights = generate_ai_insights(analysis_data)
    analysis_data["ai_insights"] = ai_insights

    # Calculate and save health colors
    logger.info("Calculating health metrics...")
    health_colors = calculate_health_colors(analysis_data)

    # Save health colors to project
    project.health_scope = health_colors.get("scope", "#808080")
    project.health_time = health_colors.get("time", "#808080")
    project.health_cost = health_colors.get("cost", "#808080")
    project.health_cash_flow = health_colors.get("cash_flow", "#808080")
    project.health_safety = health_colors.get("safety", "#808080")
    project.health_risk = health_colors.get("risk", "#808080")
    project.health_quality = health_colors.get("quality", "#808080")
    project.last_analysis_date = timezone.now()
    project.save()

    logger.info(f"Health metrics saved for project {project.name}")

    logger.info("Analysis completed successfully")

    return analysis_data


@ToolRegistry.register_tool(return_direct=False)
def analyze_project_summary(
    project_id: str, time_filter: str = "overall"
) -> Dict[str, Any]:
    """
    Analyze and provide a comprehensive summary of a project including overdue tasks,
    predicted blockers, and performance metrics. Use this tool when users ask for
    project analysis, project summary, project health, or project status.

    Args:
        project_id: The ID of the project to analyze
        time_filter: Time period for analysis - 'day', 'week', 'month', or 'overall' (default: 'overall')

    Examples:
    - "Analyze project 5"
    - "Give me a summary of project 3 for the last week"
    - "What's the health status of project 10?"
    - "Show me project 7 analysis for the last month"
    """
    # Check permissions
    permission_error = require_permission(
        return_dict=True, allowed_roles=["admin", "pm", "team_member"]
    )
    if permission_error:
        return permission_error

    # Get the analysis
    analysis = get_project_analysis(project_id, time_filter)

    if "error" in analysis:
        return analysis

    # Format for chatbot display (markdown)
    project_name = analysis["project"]["name"]
    ai = analysis["ai_insights"]
    metrics = analysis["metrics"]

    # Build markdown response
    response = f"# 📊 Project Analysis: {project_name}\n\n"

    # Executive Summary
    response += f"## Executive Summary\n{ai['executive_summary']}\n\n"

    # Health Score
    health_score = ai["health_score"]["score"]
    health_emoji = "🟢" if health_score >= 7 else "🟡" if health_score >= 4 else "🔴"
    response += f"**Project Health Score:** {health_emoji} {health_score}/10\n"
    response += f"*{ai['health_score']['justification']}*\n\n"

    # Overdue Tasks Alert
    if metrics["overdue"]["total_overdue"] > 0:
        response += f"## ⚠️ Overdue Tasks Alert\n"
        response += f"**{metrics['overdue']['total_overdue']} tasks are overdue** "
        response += f"(avg {metrics['overdue']['average_overdue_days']} days late)\n\n"

        if metrics["overdue"]["most_affected_milestone"]:
            response += f"Most affected: **{metrics['overdue']['most_affected_milestone']}** milestone\n\n"

    # Predicted Blockers
    blockers = metrics["blockers"]
    total_blockers = (
        len(blockers["overloaded_team_members"])
        + len(blockers["stalled_milestones"])
        + len(blockers["dependency_risks"])
        + len(blockers["unmitigated_risks"])
        + len(blockers["resource_conflicts"])
    )

    if total_blockers > 0:
        response += f"## 🚧 Predicted Blockers ({total_blockers} detected)\n\n"

        if blockers["overloaded_team_members"]:
            response += "**Overloaded Team Members:**\n"
            for member in blockers["overloaded_team_members"][:3]:
                response += (
                    f"- {member['name']}: {member['active_tasks']} active tasks "
                )
                response += f"(workload score: {member['workload_score']})\n"
            response += "\n"

        if blockers["stalled_milestones"]:
            response += "**Stalled Milestones:**\n"
            for milestone in blockers["stalled_milestones"][:3]:
                response += f"- {milestone['name']}: {milestone['progress']}% progress "
                response += f"({milestone['update_rate_last_7_days']}% activity in last 7 days)\n"
            response += "\n"

    # Performance Dashboard
    perf = metrics["performance"]
    response += f"## 📈 Performance Dashboard\n\n"
    response += f"**Overall Progress:** {perf['overall_progress']}%\n"
    response += f"**Tasks:** {perf['task_statistics']['completed']}/{perf['task_statistics']['total']} completed "
    response += f"({perf['task_statistics']['in_progress']} in progress"
    if perf["task_statistics"]["blocked"] > 0:
        response += f", {perf['task_statistics']['blocked']} blocked"
    response += ")\n"
    response += f"**Velocity:** {perf['velocity']['tasks_per_day']} tasks/day\n"

    if perf["budget"]["total_budget"] > 0:
        response += f"**Budget:** ${perf['budget']['spent']:,.2f} / ${perf['budget']['total_budget']:,.2f} "
        response += f"({perf['budget']['utilization_percentage']}% utilized)\n"

    if perf["velocity"]["estimated_completion_days"]:
        response += f"**Estimated Completion:** {perf['velocity']['estimated_completion_days']} days\n"

    response += "\n"

    # Top Risks
    if ai["top_risks"]:
        response += f"## ⚡ Top Risks\n"
        for i, risk in enumerate(ai["top_risks"][:3], 1):
            severity_emoji = (
                "🔴"
                if risk["severity"] == "high"
                else "🟡" if risk["severity"] == "medium" else "🟢"
            )
            response += f"{i}. {severity_emoji} **{risk['risk']}**\n"
            response += f"   Impact: {risk['impact']}\n\n"

    # Recommendations
    if ai["recommendations"]:
        response += f"## 💡 Key Recommendations\n"
        for i, rec in enumerate(ai["recommendations"][:5], 1):
            priority_emoji = (
                "🔥"
                if rec["priority"] == "urgent"
                else "⚡" if rec["priority"] == "high" else "📌"
            )
            response += f"{i}. {priority_emoji} **{rec['action']}**\n"
            response += f"   {rec['rationale']}\n\n"

    # Positive Highlights
    if ai["positive_highlights"]:
        response += f"## ✨ Positive Highlights\n"
        for highlight in ai["positive_highlights"]:
            response += f"- {highlight}\n"

    return {
        "success": True,
        "message": response,
        "project_id": project_id,
        "analysis_data": analysis,
    }
