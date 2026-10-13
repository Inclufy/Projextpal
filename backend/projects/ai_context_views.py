"""Persist (and read, delete) the AI context that `plan_from_documents`
extracted, so every subsequent AI call on a project (Plan with AI, Ask
Co-pilot, risk-forecast, …) can transparently use it.

  GET    /api/v1/projects/<pk>/ai-context/
  POST   /api/v1/projects/<pk>/ai-context/   {extracted_text, source_files, enabled}
  PATCH  /api/v1/projects/<pk>/ai-context/   {source_files}  — per-doc enabled toggle
  DELETE /api/v1/projects/<pk>/ai-context/   {confirm: true} — GDPR erasure
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
    files_out = []
    for f in aic.source_files or []:
        if not isinstance(f, dict):
            continue
        files_out.append({
            "name": f.get("name"),
            "size": int(f.get("size") or 0),
            "pages": int(f.get("pages") or 0),
            "enabled": bool(f.get("enabled", True)),
        })
    return {
        "exists": True,
        "enabled": bool(aic.enabled),
        "chars": len(aic.extracted_text or ""),
        "source_files": files_out,
        "updated_at": aic.updated_at.isoformat() if aic.updated_at else None,
    }


def _normalize_source_files(raw) -> list[dict]:
    files = []
    if not isinstance(raw, list):
        return files
    for item in raw[:MAX_FILES]:
        if not isinstance(item, dict):
            continue
        name = str(item.get("name") or "")[:200]
        if not name:
            continue
        files.append({
            "name": name,
            "size": int(item.get("size") or 0),
            "pages": int(item.get("pages") or 0),
            "enabled": bool(item.get("enabled", True)),
        })
    return files


@api_view(["GET", "POST", "PATCH", "DELETE"])
@permission_classes([IsAuthenticated])
def project_ai_context(request, pk):
    project = _get_project(request, pk)
    if not project:
        return Response({"detail": "Project niet gevonden of niet toegankelijk."}, status=404)

    aic = ProjectAIContext.objects.filter(project=project).first()

    if request.method == "GET":
        return Response(_serialize(aic))

    if request.method == "DELETE":
        confirm = (request.data or {}).get("confirm") is True
        if not confirm:
            return Response(
                {"detail": "Confirmation required.", "hint": "POST {\"confirm\": true}"},
                status=400,
            )
        if aic is not None:
            aic.delete()
        return Response({"deleted": True, "project_id": project.id})

    data = request.data or {}

    if request.method == "PATCH":
        # Partial update: only the fields that are sent are touched. The
        # chief use case is toggling a single document on/off through the
        # new per-document switch. ``extracted_text`` is NOT writable here
        # (that stays a full-POST operation).
        if aic is None:
            return Response({"detail": "No AI context to patch."}, status=404)
        if "source_files" in data:
            aic.source_files = _normalize_source_files(data.get("source_files"))
        if "enabled" in data:
            aic.enabled = bool(data.get("enabled"))
        aic.save()
        return Response(_serialize(aic))

    text = str(data.get("extracted_text") or "")[: ProjectAIContext.MAX_TEXT]
    enabled = bool(data.get("enabled", True))
    source_files = _normalize_source_files(data.get("source_files") or [])

    if aic is None:
        aic = ProjectAIContext.objects.create(
            project=project,
            extracted_text=text,
            source_files=source_files,
            enabled=enabled,
        )
    else:
        if text:
            aic.extracted_text = text
        if source_files:
            aic.source_files = source_files
        aic.enabled = enabled
        aic.save()

    return Response(_serialize(aic))
