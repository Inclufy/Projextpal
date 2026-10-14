"""
DRF throttle classes for ProjeXtPal AI surfaces.

Sprint 6 added ``AiContextThrottle`` — a per-user bucket on top of
AI-context-including endpoints (Ask Co-pilot, Plan with AI, risk
mitigation, risk forecast, auto-drafts). The limit is deliberately lower
than the generic ``ai`` throttle because context-including calls carry a
large prompt and are the most expensive.
"""
from __future__ import annotations

from rest_framework.exceptions import Throttled
from rest_framework.throttling import UserRateThrottle


class AiContextThrottle(UserRateThrottle):
    """20/hour per authenticated user on AI endpoints that read a
    ProjectAIContext / ProgramAIContext / PortfolioAIContext row.

    Returns 429 with a human-friendly ``detail`` message in the caller's
    UI language (NL/EN/FR) so the frontend can render the toast directly
    from ``response.data.detail`` without having to translate the raw
    DRF default "Request was throttled..." English string.

    Language resolution follows the same priority as the AI endpoints
    themselves (``core.i18n_ai.resolve_ui_language``): body ``language``
    key > ``X-UI-Language`` header > ``nl`` default.
    """

    scope = "ai_context"

    # Fallback used when ``allow_request`` isn't the method that failed
    # (defensive: in practice we always set it before ``throttle_failure``
    # is called, because ``super().allow_request`` runs the limit check).
    _lang = "nl"

    def allow_request(self, request, view):
        # Snapshot the caller's UI language on the throttle instance so
        # ``throttle_failure`` (which has no access to the request) can
        # pick the right translation.  Wrap in try/except — a broken
        # request should never turn a 429 into a 500.
        try:
            from core.i18n_ai import resolve_ui_language
            self._lang = resolve_ui_language(request)
        except Exception:  # pragma: no cover — defensive
            self._lang = "nl"
        return super().allow_request(request, view)

    def throttle_failure(self):
        """Raise ``Throttled`` with a localised, user-facing detail string.

        The default DRF behaviour is to return ``False`` here and let
        ``APIView.throttled()`` raise the exception with its own English
        default.  Raising here instead short-circuits that path so the
        bilingual message reaches the frontend verbatim.
        """
        wait_s = self.wait()
        wait_int = int(wait_s) if wait_s else 60

        if self._lang == "nl":
            detail = (
                f"Je hebt het AI-limiet bereikt. Probeer het over "
                f"{wait_int} seconden opnieuw."
            )
        elif self._lang == "fr":
            detail = (
                f"Limite d'utilisation d'IA atteinte. Réessayez dans "
                f"{wait_int} secondes."
            )
        else:
            detail = (
                f"AI rate limit reached. Try again in {wait_int} seconds."
            )

        raise Throttled(
            wait=int(wait_s) if wait_s else None,
            detail=detail,
        )
