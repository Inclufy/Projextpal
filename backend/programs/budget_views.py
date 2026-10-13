"""Sprint 7 — program-level timesheet-budget views.

* ``PATCH /api/v1/programs/<pk>/team/<team_member_id>/budget/`` — admin /
  PM / program-manager flips ``timesheet_required`` + sets
  ``budgeted_hours`` on an existing ``ProgramTeam`` row.

* ``GET /api/v1/programs/<pk>/time-vs-budget/`` — per-member rollup where
  ``actual_hours`` aggregates every ``TimeEntry`` under the program's
  constituent projects. Rows with no budget set are omitted.

Lives in its own module so it is independent of the parallel cross-tenant
rewrite happening in projects/views.py.
"""
from __future__ import annotations

from decimal import Decimal, InvalidOperation

from django.db.models import Sum
from django.shortcuts import get_object_or_404
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Program, ProgramTeam


# ---------------------------------------------------------------------------
# Helpers
# ---------------------------------------------------------------------------

def _user_can_see_program(user, program: Program) -> bool:
    if getattr(user, 'is_superuser', False):
        return True
    user_company_id = getattr(user, 'company_id', None)
    return user_company_id is not None and user_company_id == program.company_id


def _is_admin_or_pm(user) -> bool:
    if getattr(user, 'is_superuser', False):
        return True
    role = getattr(user, 'role', None)
    return role in {'admin', 'pm', 'program_manager', 'superadmin'}


def _bucket(pct: float) -> str:
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
# PATCH /api/v1/programs/<pk>/team/<team_member_id>/budget/
# ---------------------------------------------------------------------------

@api_view(['PATCH'])
@permission_classes([IsAuthenticated])
def set_program_team_member_budget(request, pk: int, team_member_id: int):
    program = get_object_or_404(Program, pk=pk)
    if not _user_can_see_program(request.user, program):
        return Response(
            {'detail': 'You do not have access to this program.'},
            status=status.HTTP_403_FORBIDDEN,
        )
    if not _is_admin_or_pm(request.user):
        return Response(
            {'detail': 'Only admins / PMs may set program team budgets.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    try:
        tm = ProgramTeam.objects.get(id=team_member_id, program=program)
    except ProgramTeam.DoesNotExist:
        return Response(
            {'error': 'Team member not found on this program.'},
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

    from .serializers import ProgramTeamSerializer
    return Response(ProgramTeamSerializer(tm).data, status=status.HTTP_200_OK)


# ---------------------------------------------------------------------------
# GET /api/v1/programs/<pk>/time-vs-budget/
# ---------------------------------------------------------------------------

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def program_time_vs_budget(request, pk: int):
    """Per-member time-vs-budget for a program.

    ``actual_hours`` sums every TimeEntry under this program's linked
    projects (``program.projects.all()``). Rows with no budget are
    omitted — the UI's cue to prompt the admin.
    """
    program = get_object_or_404(Program, pk=pk)
    if not _user_can_see_program(request.user, program):
        return Response(
            {'detail': 'You do not have access to this program.'},
            status=status.HTTP_403_FORBIDDEN,
        )

    team_rows = (
        ProgramTeam.objects
        .filter(program=program, is_active=True, budgeted_hours__isnull=False)
        .select_related('user')
    )

    # Local import to break the programs → projects circular at module load.
    from projects.models import TimeEntry

    project_ids = list(program.projects.values_list('id', flat=True))
    actuals: dict[int, Decimal] = {}
    if project_ids:
        actuals = {
            row['user_id']: row['total'] or Decimal('0')
            for row in (
                TimeEntry.objects
                .filter(project_id__in=project_ids)
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
            pct = 0.0 if actual == 0 else 100.0 + float(actual)
        out.append({
            'user_id': tm.user_id,
            'user_name': _user_display_name(tm.user),
            'role': tm.role or (getattr(tm.user, 'role', '') or ''),
            'budgeted_hours': float(budget),
            'actual_hours': float(actual),
            'pct': round(pct, 2),
            'status': _bucket(pct),
        })

    out.sort(key=lambda r: (-r['pct'], r['user_name'].lower()))
    return Response(out, status=status.HTTP_200_OK)
