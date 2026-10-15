"""
Lightweight AI-usage tracker.

Doel: per company bijhouden hoeveel LLM-tokens er op een dag zijn verbruikt, zodat
we 1) een verbruiks-pill in de UI kunnen tonen en 2) de Co-pilot/Plan-with-AI een
waarschuwing kan geven zodra de resterende buffer onder één dag zakt.

Opslag: Django cache (Redis in productie). Dagelijkse counters per company met
TTL van 60 dagen — ruim voldoende voor de rolling 7-/30-dagen samenvattingen die
`get_summary()` berekent, en geen migratie nodig. Als de cache wordt gereset
begint de meter opnieuw bij 0 — dat is acceptabel voor een demo-/ops-feature;
een persistent model kan later vrijblijvend bovenop.

Quota: ``settings.AI_MONTHLY_TOKEN_QUOTA`` (default 1_000_000). Per-company
override kan later via `CompanyAIKey` of een nieuw veld; voor nu één getal.
"""
from __future__ import annotations

import logging
from datetime import date, timedelta
from typing import Optional

from django.core.cache import cache
from django.conf import settings

logger = logging.getLogger(__name__)

_TTL_DAYS = 60
_TTL_SECONDS = _TTL_DAYS * 24 * 3600


def _day_key(company_id: int, day: date) -> str:
    return f"ai_usage:tokens:{company_id}:{day.isoformat()}"


def _provider_key(company_id: int, day: date) -> str:
    return f"ai_usage:providers:{company_id}:{day.isoformat()}"


def _user_day_key(user_id: int, day: date) -> str:
    """Per-user daily token counter so a single operator can be capped
    independently of the company-wide quota. 'De mens moet blijven
    nadenken' — see record_user() + user_cap_exceeded()."""
    return f"ai_usage:user:{user_id}:{day.isoformat()}"


def _quota() -> int:
    return int(getattr(settings, "AI_MONTHLY_TOKEN_QUOTA", 1_000_000))


def _user_daily_cap() -> int:
    """Default: 100k tokens per user per day. At ~15k tokens for a solid
    BC auto-draft that's ~6 heavy drafts or ~30 Ask Co-pilot turns, which
    forces the operator to stop and think before another dozen rounds."""
    return int(getattr(settings, "AI_USER_DAILY_TOKEN_CAP", 100_000))


def record_user(user_id: Optional[int], tokens: int) -> None:
    """Register ``tokens`` tegen de per-user daily counter. No-op als geen
    user of 0 tokens. Draait altijd NAAST record() — company-wide quota
    gaat door, per-user cap is een separate guardrail."""
    if not user_id or not tokens or tokens <= 0:
        return
    try:
        day = date.today()
        key = _user_day_key(user_id, day)
        try:
            cache.incr(key, tokens)
        except ValueError:
            cache.add(key, 0, _TTL_SECONDS)
            try:
                cache.incr(key, tokens)
            except ValueError:
                cache.set(key, tokens, _TTL_SECONDS)
    except Exception as e:  # pragma: no cover — tracker mag nooit laten falen
        logger.warning("ai_usage.record_user failed: %s", e)


def get_user_day(user_id: int, day: date) -> int:
    try:
        return int(cache.get(_user_day_key(user_id, day)) or 0)
    except Exception:
        return 0


def user_cap_exceeded(user_id: Optional[int]) -> bool:
    """True when the user has already crossed the daily token cap. Used
    as a pre-flight check in LLM helpers so we never kick off a long
    expensive call that would push the user over the ceiling anyway."""
    if not user_id:
        return False
    cap = _user_daily_cap()
    if cap <= 0:
        return False
    try:
        used = get_user_day(user_id, date.today())
    except Exception:
        return False
    return used >= cap


def record_call(
    *,
    company_id: Optional[int],
    user_id: Optional[int],
    provider: str,
    model: str = "",
    surface: str = "",
    tokens_total: int = 0,
    tokens_prompt: int = 0,
    tokens_completion: int = 0,
    byok: bool = False,
) -> None:
    """One-call-per-LLM-reply recorder — writes both the Redis counters
    (fast path for live meters) AND a persistent AIUsageLog row for the
    monthly billing + BYOK-usage dashboard.

    Failure here must NEVER kill an AI call: everything wraps in try/except
    and the request-path continues on best-effort basis.
    """
    total = int(tokens_total or (tokens_prompt + tokens_completion) or 0)
    # 1. Keep the existing Redis counters warm for the UI pill.
    try:
        record(company_id, total, provider=provider)
        record_user(user_id, total)
    except Exception as e:  # pragma: no cover
        logger.warning("ai_usage.record_call cache leg failed: %s", e)

    # 2. Persistent audit row — the billable surface.
    try:
        from accounts.models import AIUsageLog
        from .ai_cost import estimate_cost_cents
        # BYOK calls: tenant's own provider bills the raw token cost;
        # Inclufy charges only a service-fee share of the pool list-price
        # (default 15%). Non-BYOK: full Inclufy-pool list-price.
        cost_cents = estimate_cost_cents(
            model=model,
            tokens_prompt=tokens_prompt,
            tokens_completion=tokens_completion,
            tokens_total=total,
            byok=byok,
        )
        AIUsageLog.objects.create(
            company_id=company_id,
            user_id=user_id,
            provider=(provider or "other")[:20],
            model=(model or "")[:100],
            surface=(surface or "")[:64],
            tokens=max(0, total),
            tokens_prompt=max(0, int(tokens_prompt or 0)),
            tokens_completion=max(0, int(tokens_completion or 0)),
            cost_cents=cost_cents,
            byok=bool(byok),
        )
    except Exception as e:  # pragma: no cover — audit mag nooit laten falen
        logger.warning("ai_usage.record_call DB leg failed: %s", e)


def record(company_id: Optional[int], tokens: int, provider: str = "openai") -> None:
    """Register ``tokens`` tegen de huidige dag. No-op als geen company of 0 tokens."""
    if not company_id or not tokens or tokens <= 0:
        return
    try:
        day = date.today()
        key = _day_key(company_id, day)
        # cache.incr() faalt als de key nog niet bestaat → eerst set+add-pattern.
        try:
            cache.incr(key, tokens)
        except ValueError:
            # Nog geen counter voor vandaag — initialiseer idempotent.
            cache.add(key, 0, _TTL_SECONDS)
            try:
                cache.incr(key, tokens)
            except ValueError:
                cache.set(key, tokens, _TTL_SECONDS)
        # Per-provider ruwe telling (voor diagnostiek, niet voor quota-berekening).
        pkey = _provider_key(company_id, day)
        providers = cache.get(pkey) or {}
        providers[provider] = int(providers.get(provider, 0)) + int(tokens)
        cache.set(pkey, providers, _TTL_SECONDS)
    except Exception as e:
        # Tracking mag nooit een AI-call laten falen.
        logger.warning("ai_usage.record failed: %s", e)


def get_day(company_id: int, day: date) -> int:
    try:
        return int(cache.get(_day_key(company_id, day)) or 0)
    except Exception:
        return 0


def get_summary(company_id: Optional[int]) -> dict:
    """Rolling verbruiksoverzicht voor UI/meter.

    Returnt:
      - ``used_today`` / ``used_7d`` / ``used_30d``
      - ``quota_monthly`` + ``remaining_monthly`` (op basis van 30d-venster)
      - ``daily_avg_7d`` + ``estimated_days_left`` (op basis van rolling average)
      - ``warn_level``: "ok" | "warning" (<7 dagen) | "critical" (<1 dag)
    """
    quota = _quota()
    if not company_id:
        return {
            "available": False,
            "used_today": 0, "used_7d": 0, "used_30d": 0,
            "quota_monthly": quota, "remaining_monthly": quota,
            "daily_avg_7d": 0, "estimated_days_left": None,
            "warn_level": "ok",
            "providers_today": {},
        }

    today = date.today()
    used_today = get_day(company_id, today)
    used_7d = sum(get_day(company_id, today - timedelta(days=i)) for i in range(7))
    used_30d = sum(get_day(company_id, today - timedelta(days=i)) for i in range(30))

    remaining = max(0, quota - used_30d)
    daily_avg_7d = used_7d / 7.0 if used_7d else 0.0
    if daily_avg_7d > 0:
        est_days_left = round(remaining / daily_avg_7d, 1)
    else:
        est_days_left = None  # geen verbruik → onbepaald

    warn = "ok"
    if est_days_left is not None:
        if est_days_left < 1:
            warn = "critical"
        elif est_days_left < 7:
            warn = "warning"
    elif remaining <= 0:
        warn = "critical"

    providers_today = cache.get(_provider_key(company_id, today)) or {}

    return {
        "available": True,
        "used_today": used_today,
        "used_7d": used_7d,
        "used_30d": used_30d,
        "quota_monthly": quota,
        "remaining_monthly": remaining,
        "daily_avg_7d": round(daily_avg_7d, 1),
        "estimated_days_left": est_days_left,
        "warn_level": warn,
        "providers_today": providers_today,
    }


# ---------------------------------------------------------------------------
# Response-parsers — de LLM-wrappers (OpenAI REST, LangChain, Anthropic SDK)
# gebruiken allemaal een iets andere shape; deze helpers isoleren dat.
# ---------------------------------------------------------------------------

def tokens_from_openai_http(payload: dict) -> int:
    """OpenAI REST response: ``usage.total_tokens``."""
    try:
        return int(((payload or {}).get("usage") or {}).get("total_tokens") or 0)
    except Exception:
        return 0


def tokens_from_langchain_message(msg) -> int:
    """LangChain BaseMessage: ``response_metadata.token_usage.total_tokens``
    (OpenAI) of ``usage_metadata.total_tokens`` (nieuwe LC-contract)."""
    try:
        meta = getattr(msg, "response_metadata", None) or {}
        tu = (meta.get("token_usage") or meta.get("usage") or {}) if isinstance(meta, dict) else {}
        total = int(tu.get("total_tokens") or 0)
        if total:
            return total
        um = getattr(msg, "usage_metadata", None) or {}
        if isinstance(um, dict):
            return int(um.get("total_tokens") or 0)
    except Exception:
        pass
    return 0


def tokens_from_anthropic(response) -> int:
    """Anthropic SDK response: ``usage.input_tokens + usage.output_tokens``."""
    try:
        usage = getattr(response, "usage", None)
        if usage is None and isinstance(response, dict):
            usage = response.get("usage")
        if usage is None:
            return 0
        inp = getattr(usage, "input_tokens", None)
        out = getattr(usage, "output_tokens", None)
        if inp is None and isinstance(usage, dict):
            inp = usage.get("input_tokens")
            out = usage.get("output_tokens")
        return int((inp or 0) + (out or 0))
    except Exception:
        return 0
