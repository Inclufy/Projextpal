"""Per-model AI cost estimates used by ``AIUsageLog`` + monthly billing.

Two-tier pricing:

  * **Inclufy-pool tier** — tenant uses our shared LLM keys. We invoice
    the full list-price per token (table below, published USD → EUR cents
    + 20% ops margin baked in). Default behaviour.
  * **BYOK tier** — tenant brings their own API key. Their provider bills
    them directly for the raw token cost; Inclufy only charges a
    ``BYOK_SERVICE_FEE_FRACTION`` of the pool list-price as a service fee
    for running the plumbing (per-tenant isolation, audit log, dashboard,
    monthly rollup). Default 15% → BYOK is ~85% cheaper than the pool.

Numbers are published list prices in USD per 1M tokens as of 2026-10
(Anthropic + OpenAI). Converted to EUR cents at a conservative 1.0 USD→EUR
with the 20% margin ingebakken; see ``POOL_MARKUP_INCLUDED`` for how to
back it out when a provider changes list price.

This is INTENTIONALLY a lookup table rather than a live-pricing API call:
    (1) prices are published and update rarely,
    (2) the number lands on invoices → stability matters,
    (3) no runtime dependency on the provider's billing endpoint.

When a model id is unknown we fall back to a conservative "unknown" rate
so a new experimental model never under-reports the cost by accident.
"""
from __future__ import annotations

from django.conf import settings

# All prices below are EUR cents per 1 million tokens — includes 20% margin.
# Source: Anthropic / OpenAI pricing pages, dated 2026-10-15.
# Format: {model_id_substring: (prompt_eur_cents_per_1M, completion_eur_cents_per_1M)}
_COST_TABLE_CENTS_PER_1M = {
    # OpenAI
    "gpt-4o-mini":      (18, 72),     # $0.15 / $0.60 → 15/60 → +20%
    "gpt-4o":           (300, 1200),  # $2.50 / $10 → +20%
    "gpt-4-turbo":      (1200, 3600), # $10 / $30
    "o1-mini":          (360, 1440),
    "o1-preview":       (1800, 7200),

    # Anthropic
    "claude-haiku":        (96, 480),       # $0.80 / $4
    "claude-sonnet":       (360, 1800),     # $3 / $15
    "claude-opus":         (1800, 9000),    # $15 / $75
    "claude-opus-4-7":     (1800, 9000),
    "claude-fable-5-1":    (360, 1800),

    # Google
    "gemini-1.5-flash":    (9, 36),
    "gemini-2.0-flash":    (12, 48),
    "gemini-3.8-flash":    (12, 48),
    "gemini-1.5-pro":      (150, 600),

    # DeepSeek
    "deepseek-chat":       (18, 108),
    "deepseek-reasoner":   (66, 264),

    # Ollama = local, no vendor cost
    "ollama":              (0, 0),

    # Fallback for unknown — conservative mid-range
    "unknown":             (300, 1200),
}


# ``POOL_MARKUP_INCLUDED`` documents the 20% operations margin baked into
# the table above — kept as a constant so the next price refresh can divide
# the published rate out cleanly before re-applying it.
POOL_MARKUP_INCLUDED = 0.20


def _byok_fee_fraction() -> float:
    """Service-fee fraction charged on BYOK calls — can be tuned per env.

    Default 0.15 → tenants on their own key pay 15% of what they would pay
    on the Inclufy pool. That covers Inclufy's cost of running the audit
    log, dashboard, cross-app invoicing, isolation + support — while still
    being a strong incentive to switch to BYOK (~85% cheaper).
    """
    try:
        v = float(getattr(settings, "AI_BYOK_SERVICE_FEE_FRACTION", 0.15))
    except (TypeError, ValueError):
        v = 0.15
    # Guardrails: never below 0, never above pool price itself.
    if v < 0:
        return 0.0
    if v > 1:
        return 1.0
    return v


BYOK_SERVICE_FEE_FRACTION = _byok_fee_fraction()


def estimate_cost_cents(
    model: str,
    tokens_prompt: int = 0,
    tokens_completion: int = 0,
    tokens_total: int = 0,
    byok: bool = False,
) -> int:
    """Return the EUR-cent cost estimate for one LLM reply.

    When only ``tokens_total`` is known (OpenAI legacy response or Anthropic
    without granular breakdown) we attribute 70% to prompt and 30% to
    completion — a decent middle-of-the-road ratio for typical BC/Brief
    draft calls (long prompt, short JSON reply). Not perfect — but good
    enough to put a real number on the invoice.

    ``byok=True`` scales the full pool list-price by
    ``BYOK_SERVICE_FEE_FRACTION`` (default 15%) so BYOK tenants are
    invoiced only Inclufy's service-fee share — the raw token cost sits
    on their own provider account.
    """
    key = _match_model_key(model)
    prompt_rate, completion_rate = _COST_TABLE_CENTS_PER_1M[key]

    if not tokens_prompt and not tokens_completion and tokens_total:
        tokens_prompt = int(tokens_total * 0.70)
        tokens_completion = tokens_total - tokens_prompt

    # Round up to the nearest cent so we never under-bill for a fraction.
    import math
    cost_micros = tokens_prompt * prompt_rate + tokens_completion * completion_rate
    if byok:
        cost_micros = cost_micros * _byok_fee_fraction()
    cents = math.ceil(cost_micros / 1_000_000)
    return max(0, cents)


def _match_model_key(model: str) -> str:
    """Pick the longest matching table key — gpt-4o-mini wins over gpt-4o."""
    if not model:
        return "unknown"
    lower = model.lower()
    best = ("unknown", 0)
    for key in _COST_TABLE_CENTS_PER_1M:
        if key == "unknown":
            continue
        if key in lower and len(key) > best[1]:
            best = (key, len(key))
    return best[0]


def model_rate(model: str) -> tuple[int, int]:
    """Public helper for the UI dashboard — returns (prompt, completion) rate."""
    key = _match_model_key(model)
    return _COST_TABLE_CENTS_PER_1M[key]
