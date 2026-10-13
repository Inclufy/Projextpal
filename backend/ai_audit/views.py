"""Compliance-review endpoint for the AI-context access log.

GET /api/v1/ai-audit/log/
    ?project_id=<int>  (optional)
    ?program_id=<int>  (optional)
    ?portfolio_id=<uuid>  (optional)
    ?user_id=<int>     (optional)
    ?surface=<str>     (optional, exact match)
    ?since=<ISO 8601>  (optional)
    ?limit=<int>       (optional, default 100, max 500)

Tenant isolation: a non-superuser can only read rows for their own company.
"""
from __future__ import annotations

from datetime import datetime
from django.utils.dateparse import parse_datetime
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response

from .models import AIContextAccessLog


MAX_LIMIT = 500
DEFAULT_LIMIT = 100


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ai_audit_log(request):
    user = request.user
    qs = AIContextAccessLog.objects.all()

    # Tenant isolation: non-superusers see only their own company.
    if not getattr(user, "is_superuser", False) and getattr(user, "role", None) != "superadmin":
        company_id = getattr(user, "company_id", None) or getattr(
            getattr(user, "profile", None), "company_id", None
        )
        if not company_id:
            return Response({"results": [], "count": 0})
        qs = qs.filter(company_id=company_id)

    project_id = request.GET.get("project_id")
    program_id = request.GET.get("program_id")
    portfolio_id = request.GET.get("portfolio_id")
    if project_id:
        qs = qs.filter(context_type="project", context_id=str(project_id))
    if program_id:
        qs = qs.filter(context_type="program", context_id=str(program_id))
    if portfolio_id:
        qs = qs.filter(context_type="portfolio", context_id=str(portfolio_id))

    user_id = request.GET.get("user_id")
    if user_id:
        try:
            qs = qs.filter(user_id=int(user_id))
        except (TypeError, ValueError):
            pass

    surface = request.GET.get("surface")
    if surface:
        qs = qs.filter(surface=surface)

    since = request.GET.get("since")
    if since:
        parsed = parse_datetime(since)
        if isinstance(parsed, datetime):
            qs = qs.filter(created_at__gte=parsed)

    try:
        limit = min(int(request.GET.get("limit") or DEFAULT_LIMIT), MAX_LIMIT)
    except (TypeError, ValueError):
        limit = DEFAULT_LIMIT
    limit = max(1, limit)

    rows = list(qs.select_related("user", "company").order_by("-created_at")[:limit])
    total = qs.count()

    results = [
        {
            "id": r.id,
            "company_id": r.company_id,
            "company_name": r.company.name if r.company_id else None,
            "context_type": r.context_type,
            "context_id": r.context_id,
            "user_id": r.user_id,
            "user_email": r.user.email if r.user_id else None,
            "surface": r.surface,
            "chars_used": r.chars_used,
            "created_at": r.created_at.isoformat() if r.created_at else None,
        }
        for r in rows
    ]
    return Response({"count": total, "limit": limit, "results": results})
