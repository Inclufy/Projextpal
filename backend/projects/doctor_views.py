"""API for the AI Project Doctor: diagnose a project + execute a proposed fix."""
from datetime import timedelta

from django.utils import timezone
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from accounts.permissions import HasRole
from .views import accessible_project_ids
from .models import Project, Milestone, Task
from .project_doctor import diagnose

# Applying a proposed fix creates an Action task — a management action, so
# gate it to PM+ (superadmin always passes). Diagnosing (read) stays open to
# anyone who can already see the project.
IsManager = HasRole("admin", "pm", "program_manager")


def _get_project(request, pk):
    ids = accessible_project_ids(request.user)
    return Project.objects.filter(id=pk, id__in=ids).first()


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def project_diagnose(request, pk):
    project = _get_project(request, pk)
    if not project:
        return Response({"detail": "Project not found or not accessible."}, status=404)
    return Response(diagnose(project))


@api_view(["POST"])
@permission_classes([IsManager])
def project_doctor_apply(request, pk):
    """Execute a proposed action: create an Action task in the Action Tracker."""
    project = _get_project(request, pk)
    if not project:
        return Response({"detail": "Project not found or not accessible."}, status=404)

    title = (request.data.get("title") or "").strip()
    if not title:
        return Response({"detail": "title is required"}, status=400)
    priority = request.data.get("priority") or "medium"
    if priority not in ("low", "medium", "high", "urgent"):
        priority = "medium"
    try:
        due_in = max(0, min(60, int(request.data.get("due_in_days") or 3)))
    except (TypeError, ValueError):
        due_in = 3

    ms, _ = Milestone.objects.get_or_create(
        project=project, name="Actions", defaults={"description": "Action tracker items"}
    )
    assigned_to_id = request.data.get("assigned_to")
    task = Task.objects.create(
        milestone=ms, title=title[:255], category="Action",
        priority=priority, status="todo",
        due_date=timezone.now().date() + timedelta(days=due_in),
        description="Created by the AI Project Doctor.",
        assigned_to_id=assigned_to_id if assigned_to_id else None,
    )
    return Response({
        "ok": True, "task_id": task.id, "title": task.title,
        "url": f"/projects/{project.id}/planning/action-tracker",
    }, status=201)
