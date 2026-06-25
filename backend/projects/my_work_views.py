"""My Work — a unified, cross-project inbox of everything assigned to the
current user (open tasks grouped by due bucket) + the comments that @mention
them. Table-stakes 'My Tasks'/'Inbox' feature (Asana / Linear / ClickUp).
"""
from datetime import timedelta

from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .views import accessible_project_ids
from .models import Task


def _task_url(t):
    try:
        pid = t.milestone.project_id
    except Exception:
        return ""
    cat = (getattr(t, "category", "") or "").lower()
    if "action" in cat:
        return f"/projects/{pid}/action-tracker"
    return f"/projects/{pid}/planning/tasks"


def _ser_task(t):
    project = None
    try:
        project = t.milestone.project
    except Exception:
        pass
    return {
        "id": t.id,
        "type": "task",
        "title": t.title,
        "due_date": t.due_date.isoformat() if t.due_date else None,
        "priority": t.priority,
        "status": t.status,
        "category": getattr(t, "category", "") or "",
        "project_id": getattr(project, "id", None),
        "project_name": getattr(project, "name", None),
        "methodology": getattr(project, "methodology", None),
        "url": _task_url(t),
    }


def _ser_action_item(a):
    """A meeting action item (communication.MeetingActionItem) where the user
    is PIC, shaped like a task so My Work can list it alongside tasks."""
    project = None
    try:
        project = a.meeting.project
    except Exception:
        pass
    pid = getattr(project, "id", None)
    due = getattr(a, "action_due", None)
    return {
        "id": f"action-{a.id}",
        "type": "action",
        "title": getattr(a, "subject", "") or "Meeting action",
        "due_date": due.isoformat() if due else None,
        "priority": "medium",
        "status": getattr(a, "status", "") or "",
        "category": "Meeting",
        "project_id": pid,
        "project_name": getattr(project, "name", None),
        "methodology": getattr(project, "methodology", None),
        "url": f"/projects/{pid}/execution/communication/meeting" if pid else "",
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def my_work(request):
    user = request.user
    ids = list(accessible_project_ids(user))
    today = timezone.now().date()
    week_end = today + timedelta(days=7)

    tasks = list(
        Task.objects.filter(milestone__project_id__in=ids, assigned_to=user)
        .exclude(status="done")
        .select_related("milestone", "milestone__project")
        .order_by("due_date")
    )

    buckets = {"overdue": [], "today": [], "this_week": [], "later": [], "no_date": []}
    for t in tasks:
        d = t.due_date
        if d is None:
            buckets["no_date"].append(_ser_task(t))
        elif d < today:
            buckets["overdue"].append(_ser_task(t))
        elif d == today:
            buckets["today"].append(_ser_task(t))
        elif d <= week_end:
            buckets["this_week"].append(_ser_task(t))
        else:
            buckets["later"].append(_ser_task(t))

    # Meeting action items where the current user is the PIC (responsible).
    try:
        from communication.models import MeetingActionItem
        ais = (
            MeetingActionItem.objects.filter(meeting__project_id__in=ids, pic_user=user)
            .exclude(status__in=["done", "completed", "closed", "resolved", "cancelled"])
            .select_related("meeting", "meeting__project")
        )
        for a in ais:
            d = getattr(a, "action_due", None)
            item = _ser_action_item(a)
            if d is None:
                buckets["no_date"].append(item)
            elif d < today:
                buckets["overdue"].append(item)
            elif d == today:
                buckets["today"].append(item)
            elif d <= week_end:
                buckets["this_week"].append(item)
            else:
                buckets["later"].append(item)
    except Exception:
        pass

    # Recent @mentions of the current user (project-access-scoped).
    mentions = []
    try:
        from collaboration.models import Comment
        ms = (
            Comment.objects.filter(mentioned_users=user, project_id__in=ids)
            .select_related("author", "project", "task")
            .order_by("-created_at")[:10]
        )
        for c in ms:
            if c.task_id:
                url = f"/projects/{c.project_id}/planning/tasks"
                where = getattr(c.task, "title", "a task")
            elif c.target_type == "risk":
                url = f"/projects/{c.project_id}/planning/risks"; where = "a risk"
            elif c.target_type == "issue":
                url = f"/projects/{c.project_id}/planning/issues"; where = "an issue"
            else:
                url = f"/projects/{c.project_id}/discussion"; where = "the discussion"
            mentions.append({
                "id": c.id,
                "body": (c.body or "")[:160],
                "author": (getattr(c.author, "get_full_name", lambda: "")() or getattr(c.author, "email", "")) if c.author else None,
                "project_name": getattr(c.project, "name", None),
                "where": where,
                "url": url,
                "created_at": c.created_at.isoformat(),
            })
    except Exception:
        pass

    overdue_n = len(buckets["overdue"])
    open_n = sum(len(v) for v in buckets.values())
    return Response({
        "buckets": buckets,
        "counts": {"open": open_n, "overdue": overdue_n, "today": len(buckets["today"]), "mentions": len(mentions)},
        "mentions": mentions,
        "generated_at": timezone.now().isoformat(),
    })
