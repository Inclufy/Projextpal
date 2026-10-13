"""Persist (and read) the AI context that `plan_from_documents` extracted
for a Portfolio, so every subsequent AI call on it can transparently use it.

  POST /api/v1/governance/portfolios/<pk>/ai-context/  {extracted_text, source_files, enabled}
  GET  /api/v1/governance/portfolios/<pk>/ai-context/

Mirror of ``projects.ai_context_views`` at portfolio scale.
"""
from __future__ import annotations

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import Portfolio, PortfolioAIContext


MAX_FILES = 20


def _get_portfolio(request, pk):
    """Resolve a Portfolio the caller may touch.

    Tenant check mirrors ``PortfolioViewSet.get_queryset``: superadmin sees
    any, every other authenticated user is scoped to their own company.
    """
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
    return {
        "exists": True,
        "enabled": bool(aic.enabled),
        "chars": len(aic.extracted_text or ""),
        "source_files": aic.source_files or [],
        "updated_at": aic.updated_at.isoformat() if aic.updated_at else None,
    }


@api_view(["GET", "POST"])
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

    data = request.data or {}
    text = str(data.get("extracted_text") or "")[: PortfolioAIContext.MAX_TEXT]
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
