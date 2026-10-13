"""Persist (and read) the AI context that `plan_from_documents` extracted,
so every subsequent AI call on a project (Plan with AI, Ask Co-pilot,
risk-forecast, …) can transparently use it.

  POST /api/v1/projects/<pk>/ai-context/  {extracted_text, source_files, enabled}
  GET  /api/v1/projects/<pk>/ai-context/
"""
from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .ai_plan_views import _get_project
from .models import ProjectAIContext


MAX_FILES = 20


def _serialize(aic: ProjectAIContext | None) -> dict:
    if aic is None:
        return {
            "exists": False,
            "enabled": False,
            "chars": 0,
            "source_files": [],
            "updated_at": None,
        }
    return {
        "exists": True,
        "enabled": bool(aic.enabled),
        "chars": len(aic.extracted_text or ""),
        "source_files": aic.source_files or [],
        "updated_at": aic.updated_at.isoformat() if aic.updated_at else None,
    }


@api_view(["GET", "POST"])
@permission_classes([IsAuthenticated])
def project_ai_context(request, pk):
    """Read or (over)write the project's uploaded-documents context.

    The ``extracted_text`` the frontend sends is already the trimmed
    ``extracted_text_preview`` style output of ``plan-from-documents``; the
    model clips to its own MAX_TEXT on save as a last safety net.
    """
    project = _get_project(request, pk)
    if not project:
        return Response({"detail": "Project niet gevonden of niet toegankelijk."}, status=404)

    aic = ProjectAIContext.objects.filter(project=project).first()

    if request.method == "GET":
        return Response(_serialize(aic))

    data = request.data or {}
    text = str(data.get("extracted_text") or "")[: ProjectAIContext.MAX_TEXT]
    enabled = bool(data.get("enabled", True))
    files_raw = data.get("source_files") or []
    if not isinstance(files_raw, list):
        files_raw = []
    source_files = []
    for item in files_raw[:MAX_FILES]:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name") or "")[:200]
        if not name:
            continue
        source_files.append({
            "name": name,
            "size": int(item.get("size") or 0),
            "pages": int(item.get("pages") or 0),
        })

    if aic is None:
        aic = ProjectAIContext.objects.create(
            project=project,
            extracted_text=text,
            source_files=source_files,
            enabled=enabled,
        )
    else:
        # If the caller only wants to toggle the switch and sent no text,
        # keep the existing text intact.
        if text:
            aic.extracted_text = text
        if source_files:
            aic.source_files = source_files
        aic.enabled = enabled
        aic.save()

    return Response(_serialize(aic))
