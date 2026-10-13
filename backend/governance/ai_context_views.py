"""Persist (and read, delete) the AI context that `plan_from_documents`
extracted for a Portfolio, so every subsequent AI call on it can
transparently use it.

  GET    /api/v1/governance/portfolios/<pk>/ai-context/
  POST   /api/v1/governance/portfolios/<pk>/ai-context/  {extracted_text, source_files, enabled}
  PATCH  /api/v1/governance/portfolios/<pk>/ai-context/  {source_files}
  DELETE /api/v1/governance/portfolios/<pk>/ai-context/  {confirm: true}

Mirror of ``projects.ai_context_views`` at portfolio scale.
"""
from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Portfolio, PortfolioAIContext


MAX_FILES = 20


def _get_portfolio(request, pk):
    user = request.user
    if not user or not getattr(user, "is_authenticated", False):
        return None

    role = getattr(user, "role", None)
    if role == "superadmin" or getattr(user, "is_superuser", False):
        return Portfolio.objects.filter(id=pk).first()

    company = getattr(user, "company", None)
    if not company:
        return None
    return Portfolio.objects.filter(id=pk, company=company).first()


def _serialize(aic: PortfolioAIContext | None) -> dict:
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
def portfolio_ai_context(request, pk):
    """Read or (over)write the portfolio's uploaded-documents context."""
    portfolio = _get_portfolio(request, pk)
    if not portfolio:
        return Response(
            {"detail": "Portfolio niet gevonden of niet toegankelijk."},
            status=404,
        )

    aic = PortfolioAIContext.objects.filter(portfolio=portfolio).first()

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
        return Response({"deleted": True, "portfolio_id": str(portfolio.id)})

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

    text = str(data.get("extracted_text") or "")[: PortfolioAIContext.MAX_TEXT]
    enabled = bool(data.get("enabled", True))
    source_files = _normalize_source_files(data.get("source_files") or [])

    if aic is None:
        aic = PortfolioAIContext.objects.create(
            portfolio=portfolio,
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
