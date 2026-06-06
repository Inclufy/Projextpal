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
    # The user model carries the company FK directly (same source the rest of
    # the app uses); fall back to a profile relation only if that's absent.
    c = getattr(user, "company", None)
    if c is not None:
        return c
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
    from .views import accessible_project_ids

    # Scope the analytics to exactly the projects this user can see elsewhere
    # (superadmin → all; admin/pm/program_manager → own company; others →
    # their team memberships). Mirrors the Projects list so numbers always match.
    projects = Project.objects.filter(id__in=accessible_project_ids(request.user))

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


# ---------------------------------------------------------------------------
# Saved (server-side) custom dashboards
# ---------------------------------------------------------------------------
from rest_framework import serializers, viewsets
from rest_framework.exceptions import PermissionDenied


class SavedAnalyticsDashboardSerializer(serializers.ModelSerializer):
    created_by_name = serializers.SerializerMethodField()

    class Meta:
        from .models import SavedAnalyticsDashboard
        model = SavedAnalyticsDashboard
        fields = [
            "id", "name", "scope", "ref_id", "days", "layout", "shared",
            "created_by", "created_by_name", "created_at", "updated_at",
        ]
        read_only_fields = ["created_by", "created_by_name", "created_at", "updated_at"]

    def get_created_by_name(self, obj):
        u = obj.created_by
        if not u:
            return None
        return (getattr(u, "get_full_name", lambda: "")() or getattr(u, "email", "")) or None


class SavedAnalyticsDashboardViewSet(viewsets.ModelViewSet):
    """Company-scoped CRUD for saved Analytics dashboards.

    Read: anyone in the company sees shared dashboards + their own. Write/delete:
    only the author or a company admin/superadmin.
    """
    serializer_class = SavedAnalyticsDashboardSerializer

    def get_queryset(self):
        from django.db.models import Q
        from .models import SavedAnalyticsDashboard
        user = self.request.user
        company = _company_of(user)
        if not company:
            return SavedAnalyticsDashboard.objects.none()
        qs = SavedAnalyticsDashboard.objects.filter(company=company)
        if getattr(user, "role", None) in ("admin", "superadmin") or getattr(user, "is_superuser", False):
            return qs
        return qs.filter(Q(shared=True) | Q(created_by=user))

    def perform_create(self, serializer):
        company = _company_of(self.request.user)
        serializer.save(company=company, created_by=self.request.user)

    def _check_owner(self, instance):
        user = self.request.user
        is_admin = getattr(user, "role", None) in ("admin", "superadmin") or getattr(user, "is_superuser", False)
        if instance.created_by_id != getattr(user, "id", None) and not is_admin:
            raise PermissionDenied("Only the author or an admin can modify this dashboard.")

    def perform_update(self, serializer):
        self._check_owner(serializer.instance)
        serializer.save()

    def perform_destroy(self, instance):
        self._check_owner(instance)
        instance.delete()
