"""Per-tenant AI billing + BYOK-usage summary endpoint.

Served at ``/api/v1/ai/billing/summary/`` — see ``core/urls.py``. The
dashboard reads this to render:

  * current-month token spend (prompt / completion / total)
  * EUR-cent cost estimate (0 for BYOK months, actual € for Inclufy-pool)
  * per-provider breakdown (OpenAI / Anthropic / Gemini / DeepSeek / Ollama)
  * per-surface breakdown (plan-from-documents / business-case-auto-draft /
    ask-copilot / …) — "where did the tokens go"
  * per-user breakdown (top 10) so admins can see outliers
  * BYOK status (does the tenant have an active CompanyAIKey?)
  * trailing 30-day daily spend series for a sparkline

Auth: IsAuthenticated — only your own company's data; superuser can pass
``?company=<id>`` to view any tenant (used by the Admin portal).
"""
from __future__ import annotations

from datetime import date, timedelta

from django.db.models import Sum, Count
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response


def _month_bounds(day: date | None = None) -> tuple[date, date]:
    today = day or date.today()
    start = today.replace(day=1)
    # First day of next month → one-day step beats month-length math.
    if today.month == 12:
        next_month = date(today.year + 1, 1, 1)
    else:
        next_month = date(today.year, today.month + 1, 1)
    return start, next_month


def _tenant_has_byok(company_id: int | None) -> bool:
    if not company_id:
        return False
    try:
        from accounts.models import CompanyAIKey
        row = CompanyAIKey.objects.filter(
            company_id=company_id, is_active=True,
        ).first()
    except Exception:
        return False
    if not row:
        return False
    return bool(row.openai_api_key or row.anthropic_api_key)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def ai_billing_summary(request):
    """Current-month usage + 30-day trend for the authenticated user's
    company (or ``?company=<id>`` for superuser cross-tenant view)."""
    from accounts.models import AIUsageLog

    user = request.user
    company_id = getattr(user, "company_id", None)

    # Superuser cross-tenant pivot via ?company=<id>.
    override = request.query_params.get("company")
    if override and (getattr(user, "is_superuser", False)
                     or getattr(user, "role", None) == "superadmin"):
        try:
            company_id = int(override)
        except (TypeError, ValueError):
            pass

    if not company_id:
        return Response({"detail": "No company scope."}, status=400)

    byok = _tenant_has_byok(company_id)
    start, end = _month_bounds()
    qs_month = AIUsageLog.objects.filter(
        company_id=company_id, created_at__gte=start, created_at__lt=end,
    )

    agg_month = qs_month.aggregate(
        total_tokens=Sum("tokens"),
        total_prompt=Sum("tokens_prompt"),
        total_completion=Sum("tokens_completion"),
        total_cost_cents=Sum("cost_cents"),
        call_count=Count("id"),
    )
    for k, v in list(agg_month.items()):
        if v is None:
            agg_month[k] = 0

    # Per-tier split so the UI can show "pool list-price" vs "BYOK
    # service-fee" side by side.
    agg_pool = qs_month.filter(byok=False).aggregate(
        tokens=Sum("tokens"), cost_cents=Sum("cost_cents"), calls=Count("id"),
    )
    agg_byok = qs_month.filter(byok=True).aggregate(
        tokens=Sum("tokens"), cost_cents=Sum("cost_cents"), calls=Count("id"),
    )
    for d in (agg_pool, agg_byok):
        for k, v in list(d.items()):
            if v is None:
                d[k] = 0

    by_provider = list(
        qs_month.values("provider").annotate(
            tokens=Sum("tokens"), cost_cents=Sum("cost_cents"),
            calls=Count("id"),
        ).order_by("-tokens")
    )
    by_surface = list(
        qs_month.values("surface").annotate(
            tokens=Sum("tokens"), cost_cents=Sum("cost_cents"),
            calls=Count("id"),
        ).order_by("-tokens")[:20]
    )
    by_user = list(
        qs_month.values("user_id", "user__email").annotate(
            tokens=Sum("tokens"), cost_cents=Sum("cost_cents"),
            calls=Count("id"),
        ).order_by("-tokens")[:10]
    )

    # Rolling 30-day daily series — cheap enough to compute in Python.
    thirty = date.today() - timedelta(days=29)
    daily_rows = (
        AIUsageLog.objects
        .filter(company_id=company_id, created_at__date__gte=thirty)
        .extra({"day": "date(created_at)"})
        .values("day")
        .annotate(tokens=Sum("tokens"), cost_cents=Sum("cost_cents"))
        .order_by("day")
    )
    daily = {str(r["day"]): {"tokens": r["tokens"] or 0,
                                 "cost_cents": r["cost_cents"] or 0}
                for r in daily_rows}

    from .ai_cost import BYOK_SERVICE_FEE_FRACTION

    return Response({
        "company_id": company_id,
        "byok": byok,
        "byok_service_fee_fraction": BYOK_SERVICE_FEE_FRACTION,
        "month_start": start.isoformat(),
        "month_summary": {
            "tokens": agg_month["total_tokens"],
            "tokens_prompt": agg_month["total_prompt"],
            "tokens_completion": agg_month["total_completion"],
            "cost_cents": agg_month["total_cost_cents"],
            "calls": agg_month["call_count"],
            "pool_cost_cents": agg_pool["cost_cents"],
            "pool_tokens": agg_pool["tokens"],
            "pool_calls": agg_pool["calls"],
            "byok_fee_cents": agg_byok["cost_cents"],
            "byok_tokens": agg_byok["tokens"],
            "byok_calls": agg_byok["calls"],
        },
        "by_provider": by_provider,
        "by_surface": by_surface,
        "by_user": by_user,
        "daily": daily,
        "note": (
            "Dit zijn Inclufy-pool kosten (volledige lijstprijs)." if not byok else
            f"Jouw eigen AI-key is actief — jouw provider factureert het ruwe "
            f"token-verbruik rechtstreeks aan jou. Inclufy rekent alleen "
            f"{int(BYOK_SERVICE_FEE_FRACTION * 100)}% service-fee over de "
            f"lijstprijs."
        ),
    })
