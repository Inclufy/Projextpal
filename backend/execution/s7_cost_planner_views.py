"""Sprint 7 — S7-07/08/09 views (cost dashboard, resource planner, capacity).

These endpoints live in the ``execution`` app so they stay out of
``backend/projects/views.py`` (which the parallel cross-tenant chat is
editing). All endpoints respect the existing tenant-scoping helpers and the
``can_view_costs_for`` governance gate — this module never defines its own
permission policy.

TODO(combo-rebase): once Sprint-7 S7-01..05 lands, ``ProjectTeam`` has a
``budgeted_hours`` field and ``projects/views.py`` exposes a per-user
``actual_hours`` aggregator. Until then:

* ``_pt_budgeted_hours(pt)`` reads ``budgeted_hours`` defensively via
  ``getattr(..., 0)``. After the rebase it can be inlined as
  ``pt.budgeted_hours or 0``.
* ``_actual_hours_by_user(project)`` reproduces the trivial TimeEntry sum
  locally. After the rebase it should delegate to the S7-03 helper.
"""

from __future__ import annotations

from datetime import date, datetime, timedelta
from decimal import Decimal

from django.db.models import Sum
from django.shortcuts import get_object_or_404
from rest_framework import status as http_status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.models import CustomUser
from programs.models import Program, ProgramTeam
from projects.models import Project, ProjectTeam, TimeEntry
from projects.permissions import can_view_costs_for
from projects.views import accessible_project_ids


# ──────────────────────────────────────────────────────────────────────────
# TODO(combo-rebase): replace with the S7-01..05 helpers once they land.
# ──────────────────────────────────────────────────────────────────────────


def _pt_budgeted_hours(pt: ProjectTeam) -> Decimal:
    """ProjectTeam.budgeted_hours fallback until S7-01..05 merges."""
    v = getattr(pt, "budgeted_hours", None)
    try:
        return Decimal(str(v)) if v is not None else Decimal("0")
    except Exception:
        return Decimal("0")


def _actual_hours_by_user(project: Project) -> dict[int, Decimal]:
    """Sum of TimeEntry.hours per user_id for a project.

    TODO(combo-rebase): if S7-03 ships a helper (e.g.
    ``projects.views.actual_hours_by_user``), replace this with a call to it.
    """
    rows = (
        TimeEntry.objects
        .filter(project=project)
        .values("user_id")
        .annotate(total=Sum("hours"))
    )
    out: dict[int, Decimal] = {}
    for r in rows:
        uid = r.get("user_id")
        tot = r.get("total") or Decimal("0")
        if uid is not None:
            out[uid] = Decimal(str(tot))
    return out


# ──────────────────────────────────────────────────────────────────────────
# Effective hourly rate helpers (S7-06).
# ──────────────────────────────────────────────────────────────────────────


def _company_default_rate(company) -> Decimal:
    if company is None:
        return Decimal("0")
    v = getattr(company, "default_hourly_rate", None)
    try:
        return Decimal(str(v)) if v is not None else Decimal("0")
    except Exception:
        return Decimal("0")


def _effective_project_rate(pt: ProjectTeam) -> Decimal:
    """Per-project effective rate: PT override if > 0, else Company default."""
    rate = pt.hourly_rate or Decimal("0")
    try:
        rate = Decimal(str(rate))
    except Exception:
        rate = Decimal("0")
    if rate > 0:
        return rate
    company = getattr(pt.project, "company", None)
    return _company_default_rate(company)


def _effective_program_rate(pt_row: ProgramTeam) -> Decimal:
    """Per-program effective rate: PT override if > 0, else Company default."""
    rate = getattr(pt_row, "hourly_rate", None) or Decimal("0")
    try:
        rate = Decimal(str(rate))
    except Exception:
        rate = Decimal("0")
    if rate > 0:
        return rate
    company = getattr(pt_row.program, "company", None)
    return _company_default_rate(company)


# ──────────────────────────────────────────────────────────────────────────
# Shared status classifier (mirrors S7-04 wording so the UI tiles match).
# ──────────────────────────────────────────────────────────────────────────


def _status_for_pct(pct: Decimal | float) -> str:
    try:
        p = float(pct)
    except Exception:
        p = 0.0
    if p >= 100.0:
        return "exceeded"
    if p >= 80.0:
        return "approaching"
    return "on_track"


def _user_display_name(user) -> str:
    full = (getattr(user, "get_full_name", lambda: "")() or "").strip()
    if full:
        return full
    return getattr(user, "username", "") or getattr(user, "email", "") or f"User {user.pk}"


# ──────────────────────────────────────────────────────────────────────────
# S7-07 — Cost dashboard (budgeted hours × effective rate = €).
# ──────────────────────────────────────────────────────────────────────────


def _project_cost_rows(project: Project) -> list[dict]:
    actuals = _actual_hours_by_user(project)
    rows: list[dict] = []
    members = (
        project.team_members
        .filter(is_active=True)
        .select_related("user")
    )
    for pt in members:
        bh = _pt_budgeted_hours(pt)
        ah = actuals.get(pt.user_id, Decimal("0"))
        rate = _effective_project_rate(pt)
        budgeted_cost = (bh * rate).quantize(Decimal("0.01"))
        actual_cost = (ah * rate).quantize(Decimal("0.01"))
        pct = (ah / bh * Decimal("100")).quantize(Decimal("0.01")) if bh > 0 else Decimal("0")
        rows.append({
            "user_id": pt.user_id,
            "user_name": _user_display_name(pt.user),
            "project_team_id": pt.id,
            "budgeted_hours": float(bh),
            "actual_hours": float(ah),
            "hourly_rate": float(rate),
            "budgeted_cost": float(budgeted_cost),
            "actual_cost": float(actual_cost),
            "pct": float(pct),
            "status": _status_for_pct(pct),
        })
    return rows


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def project_time_vs_budget_cost(request, pk: int):
    """Per team-member cost rows for a project (budgeted vs actual, in €).

    Gated by can_view_costs_for — a user without the cost-visibility right
    (external collaborator, non-management role, or per-member restricted)
    gets 403, not an empty list; the cost dashboard never silently returns
    "no data" to someone who was deliberately blocked from seeing it.
    """
    project = get_object_or_404(Project, pk=pk)
    if project.id not in set(accessible_project_ids(request.user)):
        return Response({"detail": "Not found."}, status=http_status.HTTP_404_NOT_FOUND)
    if not can_view_costs_for(request.user, project):
        return Response(
            {"detail": "You do not have permission to view project costs."},
            status=http_status.HTTP_403_FORBIDDEN,
        )

    rows = _project_cost_rows(project)
    totals = {
        "budgeted_hours": round(sum(r["budgeted_hours"] for r in rows), 2),
        "actual_hours": round(sum(r["actual_hours"] for r in rows), 2),
        "budgeted_cost": round(sum(r["budgeted_cost"] for r in rows), 2),
        "actual_cost": round(sum(r["actual_cost"] for r in rows), 2),
    }
    overall_pct = (
        round(totals["actual_cost"] / totals["budgeted_cost"] * 100, 2)
        if totals["budgeted_cost"] else 0.0
    )
    return Response({
        "project_id": project.id,
        "project_name": project.name,
        "currency": getattr(project, "currency", None) or getattr(project.company, "currency", "EUR"),
        "rows": rows,
        "totals": totals,
        "overall_pct": overall_pct,
        "overall_status": _status_for_pct(overall_pct),
    })


def _program_can_view_costs(user, program: Program) -> bool:
    """Program-level cost-visibility gate.

    We re-use ``can_view_costs_for`` by probing against any one linked
    project — if the user can see costs on at least one of the program's
    projects they may see the roll-up. Superadmin always sees it.
    """
    if getattr(user, "is_superuser", False):
        return True
    projects = list(program.projects.all()[:50])
    if not projects:
        # No linked projects — allow management roles in the owning company.
        from projects.permissions import can_view_costs as _cvc_role
        if not _cvc_role(user):
            return False
        return getattr(user, "company_id", None) == getattr(program, "company_id", None)
    return any(can_view_costs_for(user, p) for p in projects)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def program_time_vs_budget_cost(request, pk: int):
    """Program-level cost roll-up: aggregates per-user across child projects.

    One row per distinct user that appears on at least one child project;
    budgets and actuals summed across those projects; rate is averaged
    weighted by budgeted_hours (fallback: last seen effective rate).
    """
    program = get_object_or_404(Program, pk=pk)
    # Tenant scope: user must be able to see the program at all.
    if not getattr(request.user, "is_superuser", False):
        if getattr(request.user, "company_id", None) != program.company_id:
            # Non-owners can only see it if they belong to one of its project teams.
            own_ids = set(accessible_project_ids(request.user))
            linked_ids = set(program.projects.values_list("id", flat=True))
            if not (own_ids & linked_ids):
                return Response({"detail": "Not found."}, status=http_status.HTTP_404_NOT_FOUND)

    if not _program_can_view_costs(request.user, program):
        return Response(
            {"detail": "You do not have permission to view program costs."},
            status=http_status.HTTP_403_FORBIDDEN,
        )

    # Aggregate per user across linked projects.
    agg: dict[int, dict] = {}
    for project in program.projects.all().select_related("company"):
        for row in _project_cost_rows(project):
            uid = row["user_id"]
            cell = agg.setdefault(uid, {
                "user_id": uid,
                "user_name": row["user_name"],
                "budgeted_hours": 0.0,
                "actual_hours": 0.0,
                "budgeted_cost": 0.0,
                "actual_cost": 0.0,
                "_rate_hours": 0.0,
                "_rate_weighted": 0.0,
                "_last_rate": row["hourly_rate"],
            })
            cell["budgeted_hours"] += row["budgeted_hours"]
            cell["actual_hours"] += row["actual_hours"]
            cell["budgeted_cost"] += row["budgeted_cost"]
            cell["actual_cost"] += row["actual_cost"]
            if row["budgeted_hours"] > 0:
                cell["_rate_hours"] += row["budgeted_hours"]
                cell["_rate_weighted"] += row["hourly_rate"] * row["budgeted_hours"]
            cell["_last_rate"] = row["hourly_rate"]

    rows: list[dict] = []
    for cell in agg.values():
        if cell["_rate_hours"] > 0:
            rate = cell["_rate_weighted"] / cell["_rate_hours"]
        else:
            rate = cell["_last_rate"]
        pct = (
            cell["actual_hours"] / cell["budgeted_hours"] * 100
            if cell["budgeted_hours"] else 0.0
        )
        rows.append({
            "user_id": cell["user_id"],
            "user_name": cell["user_name"],
            "budgeted_hours": round(cell["budgeted_hours"], 2),
            "actual_hours": round(cell["actual_hours"], 2),
            "hourly_rate": round(rate, 2),
            "budgeted_cost": round(cell["budgeted_cost"], 2),
            "actual_cost": round(cell["actual_cost"], 2),
            "pct": round(pct, 2),
            "status": _status_for_pct(pct),
        })

    totals = {
        "budgeted_hours": round(sum(r["budgeted_hours"] for r in rows), 2),
        "actual_hours": round(sum(r["actual_hours"] for r in rows), 2),
        "budgeted_cost": round(sum(r["budgeted_cost"] for r in rows), 2),
        "actual_cost": round(sum(r["actual_cost"] for r in rows), 2),
    }
    overall_pct = (
        round(totals["actual_cost"] / totals["budgeted_cost"] * 100, 2)
        if totals["budgeted_cost"] else 0.0
    )

    return Response({
        "program_id": program.id,
        "program_name": program.name,
        "currency": getattr(program.company, "currency", "EUR"),
        "rows": rows,
        "totals": totals,
        "overall_pct": overall_pct,
        "overall_status": _status_for_pct(overall_pct),
        "project_count": program.projects.count(),
    })


# ──────────────────────────────────────────────────────────────────────────
# S7-09 — Capacity (per-user, across all projects, over a date range).
# ──────────────────────────────────────────────────────────────────────────


def _parse_iso(s: str | None) -> date | None:
    if not s:
        return None
    try:
        return datetime.strptime(s, "%Y-%m-%d").date()
    except Exception:
        return None


def _working_days(start: date, end: date) -> int:
    """Mon-Fri day count, inclusive — holiday-free for Sprint 7."""
    if end < start:
        return 0
    n = 0
    cur = start
    one = timedelta(days=1)
    while cur <= end:
        if cur.weekday() < 5:
            n += 1
        cur = cur + one
    return n


def _overlap_hours(alloc_start: date, alloc_end: date, hours: Decimal,
                   range_start: date, range_end: date) -> Decimal:
    """Pro-rate an allocation's hours by the overlap with a window."""
    if alloc_end < range_start or alloc_start > range_end:
        return Decimal("0")
    overlap_start = max(alloc_start, range_start)
    overlap_end = min(alloc_end, range_end)
    span = (alloc_end - alloc_start).days + 1
    overlap_days = (overlap_end - overlap_start).days + 1
    if span <= 0:
        return Decimal("0")
    return (hours * Decimal(overlap_days) / Decimal(span)).quantize(Decimal("0.01"))


FTE_HOURS_PER_DAY = Decimal("8")


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def user_capacity(request, pk: int):
    """Per-user capacity breakdown across every project the user is on.

    Tenant isolation:
      - superadmin: can look at any user,
      - everyone else: only users in their own company and only themselves
        (or admins/PMs can look at anyone in their company).
    """
    from execution.models import ProjectResourceAllocation

    target_user = get_object_or_404(CustomUser, pk=pk)
    requester = request.user
    is_super = getattr(requester, "is_superuser", False) or getattr(requester, "role", None) == "superadmin"
    requester_role = getattr(requester, "role", None)
    requester_company = getattr(requester, "company_id", None)

    if not is_super:
        if getattr(target_user, "company_id", None) != requester_company or requester_company is None:
            return Response({"detail": "Not found."}, status=http_status.HTTP_404_NOT_FOUND)
        if target_user.id != requester.id and requester_role not in {"admin", "pm", "program_manager"}:
            return Response(
                {"detail": "You may only view your own capacity."},
                status=http_status.HTTP_403_FORBIDDEN,
            )

    today = date.today()
    r_from = _parse_iso(request.query_params.get("from")) or today
    r_to = _parse_iso(request.query_params.get("to")) or (today + timedelta(days=30))
    if r_to < r_from:
        r_from, r_to = r_to, r_from

    working_days = _working_days(r_from, r_to)
    fte_hours = working_days * int(FTE_HOURS_PER_DAY)

    # TimeEntry sums per project in the window (actuals).
    actual_rows = (
        TimeEntry.objects
        .filter(user=target_user, date__gte=r_from, date__lte=r_to)
        .values("project_id")
        .annotate(total=Sum("hours"))
    )
    actuals_by_project = {r["project_id"]: Decimal(str(r["total"] or 0)) for r in actual_rows}

    # Per-project rollup.
    pt_rows = (
        ProjectTeam.objects
        .filter(user=target_user, is_active=True)
        .select_related("project", "project__company")
    )

    allocations_by_pt: dict[int, list[tuple[date, date, Decimal]]] = {}
    pt_ids = [pt.id for pt in pt_rows]
    for a in ProjectResourceAllocation.objects.filter(project_team_id__in=pt_ids):
        allocations_by_pt.setdefault(a.project_team_id, []).append(
            (a.start_date, a.end_date, Decimal(str(a.allocated_hours or 0)))
        )

    projects_payload: list[dict] = []
    total_allocated = Decimal("0")
    total_budgeted = Decimal("0")
    total_actual = Decimal("0")

    for pt in pt_rows:
        alloc_total = Decimal("0")
        for s, e, h in allocations_by_pt.get(pt.id, []):
            alloc_total += _overlap_hours(s, e, h, r_from, r_to)
        bh = _pt_budgeted_hours(pt)
        ah = actuals_by_project.get(pt.project_id, Decimal("0"))
        total_allocated += alloc_total
        total_budgeted += bh
        total_actual += ah
        projects_payload.append({
            "project_id": pt.project_id,
            "project_name": pt.project.name,
            "allocated_hours": float(alloc_total.quantize(Decimal("0.01"))),
            "budgeted_hours": float(bh),
            "actual_hours": float(ah),
        })

    total_fte_pct = (
        float((total_allocated / Decimal(fte_hours) * Decimal("100")).quantize(Decimal("0.01")))
        if fte_hours > 0 else 0.0
    )
    is_overcommitted = total_fte_pct > 100.0

    return Response({
        "user_id": target_user.id,
        "user_name": _user_display_name(target_user),
        "from": r_from.isoformat(),
        "to": r_to.isoformat(),
        "working_days_in_range": working_days,
        "fte_hours_in_range": fte_hours,
        "projects": projects_payload,
        "total_allocated": float(total_allocated.quantize(Decimal("0.01"))),
        "total_budgeted": float(total_budgeted),
        "total_actual": float(total_actual),
        "total_fte_pct": total_fte_pct,
        "is_overcommitted": is_overcommitted,
    })
