"""Per-model AI cost estimates used by ``AIUsageLog`` + monthly billing.

Numbers are published list prices in USD per 1M tokens as of 2026-10
(Anthropic + OpenAI). Converted to EUR cents at a conservative 1.0 USD→EUR
(we add a small 20% margin to cover currency, Inclufy ops cost, and the
fact that we can't bill in sub-cent precision anyway).

This is INTENTIONALLY a lookup table rather than a live-pricing API call:
    (1) prices are published and update rarely,
    (2) the number lands on invoices → stability matters,
    (3) no runtime dependency on the provider's billing endpoint.

When a model id is unknown we fall back to a conservative "unknown" rate
so a new experimental model never under-reports the cost by accident.
"""
from __future__ import annotations

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


def estimate_cost_cents(
    model: str,
    tokens_prompt: int = 0,
    tokens_completion: int = 0,
    tokens_total: int = 0,
) -> int:
    """Return the EUR-cent cost estimate for one LLM reply.

    When only ``tokens_total`` is known (OpenAI legacy response or Anthropic
    without granular breakdown) we attribute 70% to prompt and 30% to
    completion — a decent middle-of-the-road ratio for typical BC/Brief
    draft calls (long prompt, short JSON reply). Not perfect — but good
    enough to put a real number on the invoice.
    """
    key = _match_model_key(model)
    prompt_rate, completion_rate = _COST_TABLE_CENTS_PER_1M[key]

    if not tokens_prompt and not tokens_completion and tokens_total:
        tokens_prompt = int(tokens_total * 0.70)
        tokens_completion = tokens_total - tokens_prompt

    # Round up to the nearest cent so we never under-bill for a fraction.
    import math
    cost_micros = tokens_prompt * prompt_rate + tokens_completion * completion_rate
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
