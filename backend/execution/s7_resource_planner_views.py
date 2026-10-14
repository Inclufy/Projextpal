"""Sprint 7 — S7-08 views for the project Resource Planner.

Three HTTP surfaces:

* ``GET /api/v1/projects/<pk>/resource-plan/`` — the Gantt payload. Rows
  are grouped per ProjectTeam member; each carries the allocations that
  fall against that member.
* ``POST /api/v1/projects/<pk>/resource-plan/`` — create one allocation.
* ``PATCH /api/v1/resource-plan/<id>/`` + ``DELETE`` — mutate one row.

All endpoints enforce the same tenant scope as the rest of the project
viewsets (via ``projects.views.accessible_project_ids``).
"""

from __future__ import annotations

from datetime import date, datetime
from decimal import Decimal, InvalidOperation

from django.shortcuts import get_object_or_404
from rest_framework import status as http_status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import HasRole
from projects.models import Project, ProjectTeam
from projects.views import accessible_project_ids

from .models import ProjectResourceAllocation


# Writers = admins/PMs/program-managers; a contributor cannot plan hours
# for someone else — only register their own time. Mirrors other planner
# surfaces in this codebase.
_WRITER_ROLES = {"superadmin", "admin", "pm", "program_manager"}


def _can_write(user) -> bool:
    if getattr(user, "is_superuser", False):
        return True
    return getattr(user, "role", None) in _WRITER_ROLES


def _parse_date(s) -> date | None:
    if s is None:
        return None
    if isinstance(s, date):
        return s
    try:
        return datetime.strptime(str(s), "%Y-%m-%d").date()
    except Exception:
        return None


def _serialize_allocation(a: ProjectResourceAllocation) -> dict:
    return {
        "id": a.id,
        "project_team_id": a.project_team_id,
        "start_date": a.start_date.isoformat(),
        "end_date": a.end_date.isoformat(),
        "allocated_hours": float(a.allocated_hours),
        "note": a.note,
        "created_by_id": a.created_by_id,
        "created_at": a.created_at.isoformat() if a.created_at else None,
        "updated_at": a.updated_at.isoformat() if a.updated_at else None,
    }


def _user_display_name(user) -> str:
    if user is None:
        return ""
    full = (getattr(user, "get_full_name", lambda: "")() or "").strip()
    return full or getattr(user, "username", "") or getattr(user, "email", "")


# ──────────────────────────────────────────────────────────────────────────
# Project-scoped list + create.
# ──────────────────────────────────────────────────────────────────────────


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def project_resource_plan(request, pk: int):
    project = get_object_or_404(Project, pk=pk)
    if project.id not in set(accessible_project_ids(request.user)):
        return Response({"detail": "Not found."}, status=http_status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        members = (
            project.team_members
            .filter(is_active=True)
            .select_related("user")
            .order_by("user__first_name", "user__last_name", "id")
        )
        alloc_rows = (
            ProjectResourceAllocation.objects
            .filter(project_team__project=project)
            .order_by("start_date", "id")
        )
        allocs_by_pt: dict[int, list[dict]] = {}
        for a in alloc_rows:
            allocs_by_pt.setdefault(a.project_team_id, []).append(_serialize_allocation(a))

        payload = []
        total_hours = Decimal("0")
        for pt in members:
            allocs = allocs_by_pt.get(pt.id, [])
            total_hours += sum((Decimal(str(x["allocated_hours"])) for x in allocs), Decimal("0"))
            payload.append({
                "project_team_id": pt.id,
                "user_id": pt.user_id,
                "user_name": _user_display_name(pt.user),
                "allocations": allocs,
            })
        return Response({
            "project_id": project.id,
            "project_name": project.name,
            "rows": payload,
            "total_allocated_hours": float(total_hours.quantize(Decimal("0.01"))),
            "member_count": len(payload),
        })

    # POST — create.
    if not _can_write(request.user):
        return Response(
            {"detail": "You do not have permission to plan resources."},
            status=http_status.HTTP_403_FORBIDDEN,
        )
    data = request.data or {}
    try:
        pt_id = int(data.get("project_team_id") or 0)
    except (TypeError, ValueError):
        pt_id = 0
    if not pt_id:
        return Response({"project_team_id": ["Required."]}, status=http_status.HTTP_400_BAD_REQUEST)
    try:
        pt = ProjectTeam.objects.get(pk=pt_id, project=project)
    except ProjectTeam.DoesNotExist:
        return Response(
            {"project_team_id": ["Not a member of this project."]},
            status=http_status.HTTP_400_BAD_REQUEST,
        )

    start = _parse_date(data.get("start_date"))
    end = _parse_date(data.get("end_date"))
    if not start or not end:
        return Response(
            {"detail": "start_date and end_date are required (YYYY-MM-DD)."},
            status=http_status.HTTP_400_BAD_REQUEST,
        )
    if end < start:
        return Response(
            {"detail": "end_date must be on or after start_date."},
            status=http_status.HTTP_400_BAD_REQUEST,
        )
    try:
        hours = Decimal(str(data.get("allocated_hours") or "0"))
    except (InvalidOperation, TypeError):
        return Response(
            {"allocated_hours": ["Not a valid decimal."]},
            status=http_status.HTTP_400_BAD_REQUEST,
        )
    if hours < 0:
        return Response(
            {"allocated_hours": ["Must be non-negative."]},
            status=http_status.HTTP_400_BAD_REQUEST,
        )

    note = (data.get("note") or "").strip()[:255]
    a = ProjectResourceAllocation.objects.create(
        project_team=pt,
        start_date=start,
        end_date=end,
        allocated_hours=hours,
        note=note,
        created_by=request.user,
    )
    return Response(_serialize_allocation(a), status=http_status.HTTP_201_CREATED)


# ──────────────────────────────────────────────────────────────────────────
# Allocation detail — update + delete.
# ──────────────────────────────────────────────────────────────────────────


@api_view(["GET", "PATCH", "PUT", "DELETE"])
@permission_classes([IsAuthenticated])
def resource_allocation_detail(request, pk: int):
    try:
        a = (
            ProjectResourceAllocation.objects
            .select_related("project_team", "project_team__project")
            .get(pk=pk)
        )
    except ProjectResourceAllocation.DoesNotExist:
        return Response({"detail": "Not found."}, status=http_status.HTTP_404_NOT_FOUND)

    project = a.project_team.project
    if project.id not in set(accessible_project_ids(request.user)):
        return Response({"detail": "Not found."}, status=http_status.HTTP_404_NOT_FOUND)

    if request.method == "GET":
        return Response(_serialize_allocation(a))

    if not _can_write(request.user):
        return Response(
            {"detail": "You do not have permission to modify resource allocations."},
            status=http_status.HTTP_403_FORBIDDEN,
        )

    if request.method == "DELETE":
        a.delete()
        return Response(status=http_status.HTTP_204_NO_CONTENT)

    # PATCH / PUT.
    data = request.data or {}
    if "start_date" in data:
        d = _parse_date(data.get("start_date"))
        if not d:
            return Response({"start_date": ["Invalid date."]}, status=http_status.HTTP_400_BAD_REQUEST)
        a.start_date = d
    if "end_date" in data:
        d = _parse_date(data.get("end_date"))
        if not d:
            return Response({"end_date": ["Invalid date."]}, status=http_status.HTTP_400_BAD_REQUEST)
        a.end_date = d
    if a.end_date < a.start_date:
        return Response(
            {"detail": "end_date must be on or after start_date."},
            status=http_status.HTTP_400_BAD_REQUEST,
        )
    if "allocated_hours" in data:
        try:
            h = Decimal(str(data.get("allocated_hours")))
        except (InvalidOperation, TypeError):
            return Response(
                {"allocated_hours": ["Not a valid decimal."]},
                status=http_status.HTTP_400_BAD_REQUEST,
            )
        if h < 0:
            return Response(
                {"allocated_hours": ["Must be non-negative."]},
                status=http_status.HTTP_400_BAD_REQUEST,
            )
        a.allocated_hours = h
    if "note" in data:
        a.note = (data.get("note") or "").strip()[:255]
    if "project_team_id" in data:
        try:
            new_pt = ProjectTeam.objects.get(pk=int(data["project_team_id"]), project=project)
        except (ProjectTeam.DoesNotExist, TypeError, ValueError):
            return Response(
                {"project_team_id": ["Not a member of this project."]},
                status=http_status.HTTP_400_BAD_REQUEST,
            )
        a.project_team = new_pt
    a.save()
    return Response(_serialize_allocation(a))
