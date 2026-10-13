"""
DRF throttle classes for ProjeXtPal AI surfaces.

Sprint 6 added ``AiContextThrottle`` — a per-user bucket on top of
AI-context-including endpoints (Ask Co-pilot, Plan with AI, risk
mitigation, risk forecast, auto-drafts). The limit is deliberately lower
than the generic ``ai`` throttle because context-including calls carry a
large prompt and are the most expensive.
"""
from __future__ import annotations

from rest_framework.throttling import UserRateThrottle


class AiContextThrottle(UserRateThrottle):
    """20/hour per authenticated user on AI endpoints that read a
    ProjectAIContext / ProgramAIContext / PortfolioAIContext row.

    Returns 429 with a human-friendly ``detail`` message in NL + EN so
    the frontend can show a dialog instead of a raw stack."""

    scope = "ai_context"
