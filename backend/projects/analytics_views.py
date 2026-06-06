"""Unified analytics overview for the Reports & Analytics dashboards.

One endpoint feeds the customizable dashboard widgets (KPI tiles, status
breakdown pie, completion trend, top projects) at three scopes — the whole
company (org), a single programme, or a single project — always company-scoped
so no tenant ever sees another's numbers. Everything is computed from live
project state; the trend reuses the stored status snapshots.
"""
from datetime import timedelta

from django.db.models import Count, Sum
from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


def _company_of(user):
    prof = getattr(user, "profile", None)
    return getattr(prof, "company", None)


def _rag(completion_pct, overdue, open_risks):
    if overdue > 5 or open_risks > 8:
        return "red"
    if overdue or open_risks > 3 or completion_pct < 30:
        return "amber"
    return "green"


def _completion(qs_tasks_total, qs_tasks_done):
    return int(round(qs_tasks_done / qs_tasks_total * 100)) if qs_tasks_total else 0


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def analytics_overview(request):
    """GET ?scope=org|program|project&id=<id>&days=30 -> dashboard payload."""
    from .models import Project, Task, Milestone, Risk

    company = _company_of(request.user)
    projects = Project.objects.filter(company=company) if company else Project.objects.none()

    scope = (request.query_params.get("scope") or "org").lower()
    sid = request.query_params.get("id")
    try:
        days = max(1, min(365, int(request.query_params.get("days") or 30)))
    except (TypeError, ValueError):
        days = 30

    if scope == "project" and sid:
        projects = projects.filter(id=sid)
    elif scope == "program" and sid:
        projects = projects.filter(programs__id=sid).distinct()

    proj_ids = list(projects.values_list("id", flat=True))
    today = timezone.now().date()

    tasks = Task.objects.filter(milestone__project_id__in=proj_ids)
    tasks_total = tasks.count()
    tasks_done = tasks.filter(status="done").count()
    overdue = tasks.exclude(status="done").filter(
        due_date__isnull=False, due_date__lt=today
    ).count()

    status_breakdown = [
        {"name": r["status"], "value": r["n"]}
        for r in tasks.values("status").annotate(n=Count("id")).order_by("-n")
    ]

    risks = Risk.objects.filter(project_id__in=proj_ids).exclude(status="Closed")
    open_risks = risks.count()
    risk_breakdown = [
        {"name": r["level"] or "Unknown", "value": r["n"]}
        for r in risks.values("level").annotate(n=Count("id")).order_by("-n")
    ]

    open_issues = 0
    try:
        from .models import Issue
        open_issues = Issue.objects.filter(
            project_id__in=proj_ids, status__in=["Open", "In Progress"]
        ).count()
    except Exception:
        pass

    milestones = Milestone.objects.filter(project_id__in=proj_ids)
    ms_total = milestones.count()
    ms_done = milestones.filter(status="completed").count()

    budget = projects.aggregate(s=Sum("budget"))["s"] or 0
    completion_pct = _completion(tasks_total, tasks_done)

    kpis = {
        "projects": len(proj_ids),
        "tasks_total": tasks_total,
        "tasks_done": tasks_done,
        "completion_pct": completion_pct,
        "tasks_overdue": overdue,
        "open_risks": open_risks,
        "open_issues": open_issues,
        "milestones_total": ms_total,
        "milestones_done": ms_done,
        "budget": float(budget),
        "rag": _rag(completion_pct, overdue, open_risks),
    }

    # Completion trend — bucket stored status snapshots by day.
    trend = []
    try:
        from communication.models import GeneratedStatusReport
        since = today - timedelta(days=days)
        reports = GeneratedStatusReport.objects.filter(
            project_id__in=proj_ids, created_at__date__gte=since
        ).order_by("created_at")
        buckets = {}
        for r in reports:
            day = r.created_at.date().isoformat()
            m = r.metrics or {}
            b = buckets.setdefault(day, {"date": day, "_c": [], "open_risks": 0,
                                         "open_issues": 0, "signals": 0})
            b["_c"].append(int(m.get("completion_pct") or 0))
            b["open_risks"] += int(m.get("open_risks_total") or 0)
            b["open_issues"] += int(m.get("open_issues_total") or 0)
            b["signals"] += int(m.get("compound_signals") or 0)
        for day in sorted(buckets):
            b = buckets[day]
            c = b.pop("_c")
            b["completion_pct"] = int(round(sum(c) / len(c))) if c else 0
            trend.append(b)
    except Exception:
        pass

    # Top projects — only meaningful when more than one is in scope.
    top_projects = []
    if scope != "project":
        for p in projects[:25]:
            pt = Task.objects.filter(milestone__project=p)
            tot = pt.count()
            top_projects.append({
                "id": p.id,
                "name": p.name,
                "completion_pct": _completion(tot, pt.filter(status="done").count()),
                "open_risks": Risk.objects.filter(project=p).exclude(status="Closed").count(),
            })
        top_projects.sort(key=lambda x: -x["completion_pct"])
        top_projects = top_projects[:10]

    return Response({
        "scope": scope, "id": sid, "days": days,
        "kpis": kpis,
        "status_breakdown": status_breakdown,
        "risk_breakdown": risk_breakdown,
        "completion_trend": trend,
        "top_projects": top_projects,
        "generated_at": timezone.now().isoformat(),
    })
