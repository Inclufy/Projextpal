"""Persist (and read, delete) the AI context that `plan_from_documents`
extracted for a Program, so every subsequent AI call on it can transparently
use it.

  GET    /api/v1/programs/<pk>/ai-context/
  POST   /api/v1/programs/<pk>/ai-context/   {extracted_text, source_files, enabled}
  PATCH  /api/v1/programs/<pk>/ai-context/   {source_files}
  DELETE /api/v1/programs/<pk>/ai-context/   {confirm: true}

Mirror of ``projects.ai_context_views`` at programme scale.
"""
from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Program, ProgramAIContext


MAX_FILES = 20


def _get_program(request, pk):
    """Resolve a Program the caller may touch.

    Tenant / membership check mirrors ``ProgramViewSet.get_queryset``:
    superuser sees any, admin sees own-company, others only if member/owner.
    """
    from django.db.models import Q

    user = request.user
    if not user or not getattr(user, "is_authenticated", False):
        return None

    role = getattr(user, "role", None)
    if role == "superadmin" or getattr(user, "is_superuser", False):
        return Program.objects.filter(id=pk).first()

    company = getattr(user, "company", None)
    if role == "admin" and company:
        return Program.objects.filter(id=pk, company=company).first()

    base = Program.objects.filter(company=company) if company else Program.objects.all()
    return base.filter(id=pk).filter(
        Q(program_manager=user)
        | Q(executive_sponsor=user)
        | Q(created_by=user)
        | Q(team_members__user=user, team_members__is_active=True)
        | Q(projects__team_members__user=user, projects__team_members__is_active=True)
    ).distinct().first()


def _serialize(aic: ProgramAIContext | None) -> dict:
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
def program_ai_context(request, pk):
    """Read or (over)write the program's uploaded-documents context."""
    program = _get_program(request, pk)
    if not program:
        return Response(
            {"detail": "Program niet gevonden of niet toegankelijk."},
            status=404,
        )

    aic = ProgramAIContext.objects.filter(program=program).first()

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
        return Response({"deleted": True, "program_id": program.id})

    data = request.data or {}

    if request.method == "PATCH":
        if aic is None:
            return Response({"detail": "No AI context to patch."}, status=404)
        if "source_files" in data:
            aic.source_files = _normalize_source_files(data.get("source_files"))
        if "enabled" in data:
            aic.enabled = bool(data.get("enabled"))
        aic.save()
        return Response(_serialize(aic))

    text = str(data.get("extracted_text") or "")[: ProgramAIContext.MAX_TEXT]
    enabled = bool(data.get("enabled", True))
    source_files = _normalize_source_files(data.get("source_files") or [])

    if aic is None:
        aic = ProgramAIContext.objects.create(
            program=program,
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
