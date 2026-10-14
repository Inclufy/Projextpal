"""Sprint 9 S9-02 — lessons-learned budget vs actual comparison.

Public surface
--------------

``GET /api/v1/projects/<pk>/lessons/budget-comparison/`` — returns a per
project rollup of ``budgeted_hours`` vs ``SUM(TimeEntry.hours)``:

    {
      "project_id": 10,
      "budgeted_hours_total": 400,
      "actual_hours_total": 456,
      "variance_pct": 14,
      "per_member": [
        {"user_id": 3, "user_name": "Jan Jansen",
         "budgeted_hours": 200, "actual_hours": 240, "variance_pct": 20},
        ...
      ],
      "insights": [
        "Jan werd 20% overvraagd — plan 1 FTE extra bij vergelijkbaar project",
        ...
      ]
    }

Insights are rule-based (no LLM call for now). They surface the two or
three team-members that drove the variance so the lessons-learned
retrospective has something actionable to write up.

Tenant scope mirrors ``budget_views.project_time_vs_budget`` — superuser
sees any project; everyone else needs ``user.company_id == project.company_id``.
"""
from __future__ import annotations

from decimal import Decimal

from django.db.models import Sum
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Project, ProjectTeam, TimeEntry


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _can_see(user, project: Project) -> bool:
    """Tenant visibility — mirrors ``budget_views._user_can_see_project``.
    Deliberately duplicated so the main ``views.py`` / ``permissions.py``
    rewrite in a parallel branch doesn't fight us on imports.
    """
    if getattr(user, "is_superuser", False):
        return True
    uc = getattr(user, "company_id", None)
    return uc is not None and uc == project.company_id


def _display_name(user) -> str:
    try:
        full = (user.get_full_name() or "").strip() if user else ""
    except Exception:
        full = ""
    return full or (getattr(user, "email", "") or "")


def _variance_pct(budget, actual) -> float:
    """(actual - budget) / budget as a signed percentage, two decimals.

    Returns 0.0 when budget is 0/None/missing — a zero budget can't be
    "overrun" by a definite percentage, so we omit the pretend number
    rather than divide-by-zero.
    """
    try:
        b = float(budget or 0)
        a = float(actual or 0)
    except (TypeError, ValueError):
        return 0.0
    if b <= 0:
        return 0.0
    return round((a - b) / b * 100.0, 2)


def _build_insights(per_member: list[dict]) -> list[str]:
    """Rule-based retrospective-style insights.

    Heuristics (no LLM):
      1. Any member > +15% over budget → "<name> werd <pct>% overvraagd —
         plan X FTE extra bij een vergelijkbaar project" (X ≈ ceil(variance/50))
      2. Any member > +50% over budget → stronger phrasing
      3. Any member < -30% under budget → "<name> was ruim onder budget
         — overweeg scope-uitbreiding of herverdeling"
      4. Top 3 members (by absolute variance pct) only — avoid noise.

    All strings are NL (matches the project's main language); the task
    spec gives one NL example. Capped at 5 insights.
    """
    import math

    # Only consider members that actually had a budget.
    with_budget = [m for m in per_member if (m.get("budgeted_hours") or 0) > 0]
    with_budget.sort(key=lambda m: abs(m.get("variance_pct") or 0), reverse=True)

    insights: list[str] = []
    for m in with_budget[:3]:
        name = m.get("user_name") or f"User {m.get('user_id')}"
        v = m.get("variance_pct") or 0
        if v > 50:
            fte = max(1, math.ceil(v / 50))
            insights.append(
                f"{name} werd {v:g}% overvraagd — plan {fte} FTE extra "
                f"bij een vergelijkbaar project"
            )
        elif v > 15:
            insights.append(
                f"{name} werd {v:g}% overvraagd — plan 1 FTE extra "
                f"bij een vergelijkbaar project"
            )
        elif v < -30:
            insights.append(
                f"{name} was {abs(v):g}% onder budget — overweeg "
                f"scope-uitbreiding of herverdeling"
            )

    return insights[:5]


# ---------------------------------------------------------------------------
# View
# ---------------------------------------------------------------------------

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def project_lessons_budget_comparison(request, pk: int):
    """GET /api/v1/projects/<pk>/lessons/budget-comparison/

    Rolls up budget vs actual per team-member for the lessons-learned
    accordion. Team-members without a ``budgeted_hours`` row still appear
    (with a null budget) so the Lessons-Learned writer sees who logged
    time off-budget too.
    """
    project = get_object_or_404(Project, pk=pk)
    if not _can_see(request.user, project):
        return Response(
            {"detail": "You do not have access to this project."},
            status=status.HTTP_403_FORBIDDEN,
        )

    # 1) Budgeted hours per project-team row.
    team_rows = list(
        ProjectTeam.objects
        .filter(project=project, is_active=True)
        .select_related("user")
    )
    budgets_by_user: dict[int, Decimal] = {
        row.user_id: (row.budgeted_hours or Decimal("0"))
        for row in team_rows
        if row.user_id is not None
    }
    users_by_id = {
        row.user_id: row.user for row in team_rows if row.user_id is not None
    }

    # 2) Actual hours per user from TimeEntry.
    actuals = (
        TimeEntry.objects
        .filter(project=project)
        .values("user_id")
        .annotate(total=Sum("hours"))
    )
    actuals_by_user = {
        row["user_id"]: (row["total"] or Decimal("0"))
        for row in actuals
        if row["user_id"] is not None
    }

    user_ids = set(budgets_by_user.keys()) | set(actuals_by_user.keys())

    per_member = []
    budget_total = Decimal("0")
    actual_total = Decimal("0")
    for uid in sorted(user_ids):
        budget = budgets_by_user.get(uid, Decimal("0"))
        actual = actuals_by_user.get(uid, Decimal("0"))
        user = users_by_id.get(uid)
        # user may be absent (someone logged hours but was removed from
        # ProjectTeam) — fetch lazily so the row still carries a name.
        if user is None:
            try:
                from django.contrib.auth import get_user_model
                user = get_user_model().objects.filter(pk=uid).first()
            except Exception:
                user = None
        per_member.append({
            "user_id": uid,
            "user_name": _display_name(user) if user else f"User {uid}",
            "budgeted_hours": float(budget),
            "actual_hours": float(actual),
            "variance_pct": _variance_pct(budget, actual),
        })
        budget_total += budget
        actual_total += actual

    payload = {
        "project_id": project.id,
        "budgeted_hours_total": float(budget_total),
        "actual_hours_total": float(actual_total),
        "variance_pct": _variance_pct(budget_total, actual_total),
        "per_member": per_member,
        "insights": _build_insights(per_member),
    }
    return Response(payload)
