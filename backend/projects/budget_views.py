"""Sprint 7 — timesheet-budget views.

Lives in a separate file (not in ``views.py``) so a parallel chat that is
rewriting the cross-tenant surface in ``views.py`` and ``permissions.py``
does not race with us.

Public surface
--------------

* ``PATCH /api/v1/projects/<project_pk>/team/<team_member_id>/budget/``
  — admin / PM may flip ``timesheet_required`` and set ``budgeted_hours``
  (nullable decimal) on an existing ``ProjectTeam`` row. Used by the add-
  user UI right after the add succeeds, and by inline edits later.

* ``GET /api/v1/projects/<pk>/time-vs-budget/`` — per team-member rollup
  of ``budgeted_hours`` vs ``SUM(TimeEntry.hours)`` on this project, with
  a ``status`` of ``on_track`` / ``approaching`` (>= 90%) / ``exceeded``
  (> 100%). Rows with no budget set (``NULL``) are omitted.
"""
from __future__ import annotations

from decimal import Decimal, InvalidOperation

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

def _user_can_see_project(user, project: Project) -> bool:
    """Tenant visibility — a user may touch a ProjectTeam row only on a
    project in their own company, or if they are a superuser. Mirrors the
    tenant check that lives in the main ``ProjectViewSet`` queryset. Kept
    local to this module so the parallel-chat cross-tenant rework in
    ``permissions.py`` can keep evolving independently.
    """
    if getattr(user, 'is_superuser', False):
        return True
    user_company_id = getattr(user, 'company_id', None)
    return user_company_id is not None and user_company_id == project.company_id


def _is_admin_or_pm(user) -> bool:
    """Admin / PM / program-manager / superadmin may set budgets."""
    if getattr(user, 'is_superuser', False):
        return True
    role = getattr(user, 'role', None)
    return role in {'admin', 'pm', 'program_manager', 'superadmin'}


def _bucket(pct: float) -> str:
    """on_track / approaching / exceeded. Approaching = >= 90%. Exceeded
    = > 100%. Order of the compares matters."""
    if pct > 100.0:
        return 'exceeded'
    if pct >= 90.0:
        return 'approaching'
    return 'on_track'


def _user_display_name(user) -> str:
    full = (user.get_full_name() or '').strip() if user else ''
    if full:
        return full
    return (getattr(user, 'email', '') or '').strip() if user else ''


# ---------------------------------------------------------------------------
# PATCH /api/v1/projects/<pk>/team/<team_member_id>/budget/
# ---------------------------------------------------------------------------

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def set_team_member_budget(request, pk: int, team_member_id: int):
    """Flip ``timesheet_required`` + set ``budgeted_hours`` on a ProjectTeam
    row. Request body (both fields optional, both independent):

        {
          "timesheet_required": false,
          "budgeted_hours": 40.0        # or null to clear
        }

    Returns the updated row (via the main ProjectTeamSerializer so UI code
    receives one shape).
    """
    project = get_object_or_404(Project, pk=pk)
    if not _user_can_see_project(request.user, project):
        return Response(
            {'detail': 'You do not have access to this project.'},
            status=status.HTTP_403_FORBIDDEN,
        )
    if not _is_admin_or_pm(request.user):
        return Response(
            {'detail': 'Only admins / PMs may set team budgets.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        tm = ProjectTeam.objects.get(id=team_member_id, project=project)
    except ProjectTeam.DoesNotExist:
        return Response(
            {'error': 'Team member not found on this project.'},
            status=status.HTTP_404_NOT_FOUND,
        )

    data = request.data if isinstance(request.data, dict) else {}

    changed = False
    if 'timesheet_required' in data:
        raw = data.get('timesheet_required')
        if isinstance(raw, str):
            tm.timesheet_required = raw.lower() not in ('false', '0', 'no')
        else:
            tm.timesheet_required = bool(raw)
        changed = True

    if 'budgeted_hours' in data:
        raw = data.get('budgeted_hours')
        if raw in (None, '', 'null'):
            tm.budgeted_hours = None
        else:
            try:
                value = Decimal(str(raw))
            except (InvalidOperation, TypeError, ValueError):
                return Response(
                    {'error': 'budgeted_hours must be a decimal number or null.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if value < 0:
                return Response(
                    {'error': 'budgeted_hours must be >= 0 or null.'},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            tm.budgeted_hours = value
        changed = True

    if changed:
        tm.save(update_fields=['timesheet_required', 'budgeted_hours'])

    # Local import to avoid circulars at module load — serializers imports
    # a large graph that includes models.py which we just extended.
    from .serializers import ProjectTeamSerializer
    return Response(ProjectTeamSerializer(tm).data, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# GET /api/v1/projects/<pk>/time-vs-budget/
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def project_time_vs_budget(request, pk: int):
    """Return per-member time-vs-budget rows for this project.

    One row per active ProjectTeam with ``budgeted_hours IS NOT NULL``.
    Rows with no budget set are omitted — the empty state is the UI's
    cue to invite the admin to set a budget.
    """
    project = get_object_or_404(Project, pk=pk)
    if not _user_can_see_project(request.user, project):
        return Response(
            {'detail': 'You do not have access to this project.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    team_rows = (
        ProjectTeam.objects
        .filter(project=project, is_active=True, budgeted_hours__isnull=False)
        .select_related('user')
    )

    # One aggregate query — all TimeEntry rows on this project, grouped
    # by user. Then stitch locally so we don't pay per-user roundtrips.
    actuals = {
        row['user_id']: row['total'] or Decimal('0')
        for row in (
            TimeEntry.objects
            .filter(project=project)
            .values('user_id')
            .annotate(total=Sum('hours'))
        )
    }

    out = []
    for tm in team_rows:
        budget = tm.budgeted_hours or Decimal('0')
        actual = actuals.get(tm.user_id, Decimal('0'))
        if budget > 0:
            pct = float(actual) / float(budget) * 100.0
        else:
            # budget == 0 but not NULL: any hour logged is already over.
            pct = 0.0 if actual == 0 else 100.0 + float(actual)
        out.append({
            'user_id': tm.user_id,
            'user_name': _user_display_name(tm.user),
            'role': getattr(tm.user, 'role', '') or '',
            'budgeted_hours': float(budget),
            'actual_hours': float(actual),
            'pct': round(pct, 2),
            'status': _bucket(pct),
        })

    out.sort(key=lambda r: (-r['pct'], r['user_name'].lower()))
    return Response(out, status=status.HTTP_200_OK)
