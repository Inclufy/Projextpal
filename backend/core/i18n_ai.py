"""
Shared language resolution for AI endpoints.

Issue #12 (mei 2026) fixte de Ask Co-pilot door `X-UI-Language` + `body.language`
te lezen in `backend/bot/views.py:145`. Alle AI-endpoints die daarna zijn
toegevoegd (governance ai/generate, reports generate, project ai-plan, coach,
risk-mitigation, risk-forecast, bot parse-and-create tool) sloten nooit aan op
dat pad en geven altijd Engels terug, ook als de UI op NL staat.

Deze module centraliseert de resolutie zodat elke view er in één regel bij kan.

Default is `nl` — overeenkomend met `backend/bot/views.py:145` en de default in
`frontend/src/contexts/LanguageContext.tsx:1968`.
"""
from __future__ import annotations

_SUPPORTED = ("en", "nl", "fr")
_DEFAULT = "nl"


def resolve_ui_language(request) -> str:
    """Return the UI language the caller has set, as a 2-letter code.

    Priority (first non-empty wins):
      1. ``body.language`` on the request (POST/PUT/PATCH)
      2. ``X-UI-Language`` HTTP header
      3. Default (``nl``)

    Only ``_SUPPORTED`` languages are accepted; anything else falls back to the
    default so an unexpected header value can't break a response.
    """
    body_lang = None
    try:
        data = getattr(request, "data", None)
        if data is not None:
            body_lang = data.get("language")
    except Exception:
        body_lang = None

    header_lang = None
    try:
        header_lang = request.headers.get("X-UI-Language")
    except Exception:
        header_lang = None

    lang = (body_lang or header_lang or _DEFAULT or "").lower().strip()
    if lang not in _SUPPORTED:
        return _DEFAULT
    return lang


def language_directive(lang: str) -> str:
    """Return a short system-prompt line forcing the reply language.

    Prefixed to any existing system prompt so the LLM honours the UI language
    even if the user types in a different language.
    """
    lang = (lang or _DEFAULT).lower()
    if lang == "nl":
        return (
            "[TAALINSTRUCTIE — VERPLICHT] Antwoord uitsluitend in het Nederlands, "
            "ongeacht de taal waarin de gebruiker schrijft. Gebruik Nederlandse "
            "koppen, opsommingstekens en zinnen."
        )
    if lang == "fr":
        return (
            "[INSTRUCTION DE LANGUE — OBLIGATOIRE] Répondez uniquement en français, "
            "quelle que soit la langue de l'utilisateur. Utilisez des titres, puces "
            "et phrases en français."
        )
    return (
        "[LANGUAGE INSTRUCTION — REQUIRED] Respond exclusively in English, "
        "regardless of the user's input language. Use English headings, bullets, "
        "and sentences."
    )


def prepend_language(system_prompt: str, lang: str) -> str:
    """Convenience: prepend the directive to a system prompt (newline-separated).

    If ``system_prompt`` is empty, just return the directive.
    """
    directive = language_directive(lang)
    if not system_prompt:
        return directive
    return f"{directive}\n\n{system_prompt}"
