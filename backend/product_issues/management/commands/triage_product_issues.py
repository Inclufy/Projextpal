"""
Automated ProductIssue triage — `python manage.py triage_product_issues`.

Designed to run on a 30-min cron (see scripts/cron-triage.sh). Each run:

  * Phase A — Catalog cross-match (cheap, no LLM).
    Reads tests/regression/known_issues.json and tries to match each
    open ProductIssue against a catalogued bug by endpoint substring
    or keyword overlap. If a catalog entry's status is `fixed_verified`
    or `fix_pending_deploy` we resolve the issue + credit the fix in
    a Dutch comment.

  * Phase B — LLM classification (Anthropic).
    For issues NOT matched by Phase A we ask Sonnet to return a strict
    JSON blob with classification / priority / affected_area / reasoning
    / recommended_action, then map the result to a ProductIssue
    status + priority + comment.

Idempotency: each comment starts with `[auto-triage-YYYY-MM-DD] #<issue-id>`
so a re-run on the same calendar day skips already-commented issues.

Email-storm prevention: the signal handler in product_issues/signals.py
honours `instance._suppress_email_on_save = True` and skips the per-issue
mail. After the cron run finishes we send ONE digest email to admins
summarising what changed in the run.

Flags
-----
  --dry-run   : no DB writes, no LLM calls (read-only audit).
  --limit N   : cap on issues processed per run (default 50).
  --issue-id N: process exactly one issue (overrides --limit).
"""
from __future__ import annotations

import json
import logging
import re
from datetime import date
from pathlib import Path
from typing import Any, Optional

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from product_issues.models import ProductIssue, ProductIssueComment


logger = logging.getLogger(__name__)


# ---------------------------------------------------------------------------
# Catalog loader
# ---------------------------------------------------------------------------

def _catalog_path() -> Path:
    """Resolve tests/regression/known_issues.json regardless of CWD.

    Search order:
      1. settings.BASE_DIR / .. / tests/regression/known_issues.json
         (repo-root tests dir — production layout on Mac Studio)
      2. settings.BASE_DIR / tests/regression/known_issues.json
         (in case BASE_DIR is the repo root, not the backend dir)
      3. /app/tests/regression/known_issues.json (Docker volume mount)
    """
    base = Path(getattr(settings, "BASE_DIR", Path.cwd()))
    candidates = [
        base.parent / "tests" / "regression" / "known_issues.json",
        base / "tests" / "regression" / "known_issues.json",
        Path("/app/tests/regression/known_issues.json"),
    ]
    for p in candidates:
        if p.exists():
            return p
    # Return the first candidate so the error message is informative
    return candidates[0]


def _load_catalog() -> list[dict]:
    p = _catalog_path()
    if not p.exists():
        logger.warning("Triage: catalog not found at %s — Phase A disabled", p)
        return []
    try:
        with p.open("r", encoding="utf-8") as fh:
            data = json.load(fh)
        return list(data.get("issues") or [])
    except Exception as exc:
        logger.warning("Triage: catalog parse failed (%s): %s", p, exc)
        return []


# ---------------------------------------------------------------------------
# Catalog → ProductIssue priority mapping
# ---------------------------------------------------------------------------

_CATALOG_FIXED_STATUSES = {"fixed_verified", "fix_pending_deploy"}


def _severity_to_priority(severity: str) -> str:
    """Map catalog 'severity' (P0..P3 / feature / etc.) to ProductIssue priority."""
    sev = (severity or "").strip().upper()
    if sev in {"P0", "P1", "P2", "P3"}:
        return sev
    # 'feature' / unknown → backlog
    return "P3"


def _phase_a_match(issue: ProductIssue, entry: dict) -> bool:
    """Return True if `issue` looks like the catalogued bug `entry`.

    Match rules (either suffices):
      (a) issue's error_trace contains the catalog `endpoint` substring
          (e.g. error_trace mentions "/api/v1/surveys/survey/").
      (b) ≥2 of the catalog entry's `previous_error_contains` keywords
          appear in issue.title + issue.description + issue.error_trace
          (lowercased).

    Plus: catalog status must be `fixed_verified` or `fix_pending_deploy`
    (we never resolve against an still-open catalog bug).
    """
    cat_status = (entry.get("status") or "").lower()
    if cat_status not in _CATALOG_FIXED_STATUSES:
        return False

    text_blob = " ".join([
        issue.title or "",
        issue.description or "",
        issue.error_trace or "",
        issue.actual_behavior or "",
    ]).lower()

    # (a) endpoint substring
    endpoint = (entry.get("endpoint") or "").strip()
    if endpoint and endpoint.lower() in (issue.error_trace or "").lower():
        return True

    # (b) keyword overlap on previous_error_contains
    kws = entry.get("previous_error_contains") or []
    if not isinstance(kws, list):
        return False
    hits = sum(1 for k in kws if isinstance(k, str) and k.strip() and k.lower() in text_blob)
    return hits >= 2


# ---------------------------------------------------------------------------
# Comment idempotency
# ---------------------------------------------------------------------------

def _today_signature(issue: ProductIssue) -> str:
    """Header for triage comments — used for idempotency."""
    return f"[auto-triage-{date.today().isoformat()}] #{issue.id}"


def _already_triaged_today(issue: ProductIssue) -> bool:
    """
    Should we skip this issue in the current cron run?

    Rules (in order):
      1. If there's NO successful triage comment with today's date sig,
         we have not run today → don't skip.
      2. If there IS a successful triage today AND the reporter has
         posted a non-agent comment AFTER that triage → the reporter
         responded with new info and we should re-triage. Don't skip.
      3. Otherwise → skip (we've already done today's work for this issue).

    The llm-error variant of today's signature is intentionally excluded
    so a transient failure earlier today (e.g. missing Anthropic key)
    doesn't block a retry once the upstream cause is fixed.
    """
    sig = _today_signature(issue)
    last_triage = (
        ProductIssueComment.objects.filter(
            issue=issue, body__startswith=sig,
        ).exclude(
            body__startswith=f"{sig} llm-error",
        ).order_by("-created_at").first()
    )
    if last_triage is None:
        return False  # never triaged today

    # Reporter (human, non-agent) response since the last triage? If so,
    # we want to re-triage even on the same day — otherwise needs-info
    # issues whose reporter answers same-day stay stuck until tomorrow.
    has_response = ProductIssueComment.objects.filter(
        issue=issue,
        created_at__gt=last_triage.created_at,
    ).exclude(author__startswith="agent:").exists()
    return not has_response


def _needs_info_candidates_with_response(qs_base):
    """
    Issues currently in status='needs-info' where the reporter has
    posted a non-agent comment AFTER the last triage_at timestamp.

    These are the "reporter responded, re-triage please" candidates.
    Filtered on top of `qs_base` (typically the org-scoped ProductIssue
    queryset) so the caller can apply tenant or company filters.
    """
    from django.db.models import Exists, OuterRef

    new_response = ProductIssueComment.objects.filter(
        issue=OuterRef("pk"),
        created_at__gt=OuterRef("triaged_at"),
    ).exclude(author__startswith="agent:")

    return (
        qs_base.filter(status="needs-info", triaged_at__isnull=False)
        .annotate(_has_response=Exists(new_response))
        .filter(_has_response=True)
    )


# ---------------------------------------------------------------------------
# Language resolution + LLM call (Phase B)
# ---------------------------------------------------------------------------

# Languages we have translated triage strings + LLM prompts for. Anything
# else falls back to English. Add a new key here + entries in both
# `_LLM_SYSTEM_PROMPTS` and `_TRIAGE_TRANSLATIONS` to support a new locale.
_SUPPORTED_TRIAGE_LANGS = {"en", "nl"}


def _resolve_triage_language(issue: ProductIssue) -> str:
    """Pick the language to use for both the LLM output and the comment body.

    Precedence (most specific wins):
      1. `issue.environment.language` / `.locale` — frontend can pass the
         exact UI language the reporter was using when filing the bug.
         This is the most accurate signal because the same user can switch
         locales in-app per session.
      2. `issue.company.locale` — tenant default (Company model has a
         `locale` CharField with default "en").
      3. "en" — final safe fallback.
    """
    env = issue.environment if isinstance(issue.environment, dict) else {}
    lang_hint = (env.get("language") or env.get("locale") or "").lower()[:2]
    if lang_hint in _SUPPORTED_TRIAGE_LANGS:
        return lang_hint

    company = getattr(issue, "company", None)
    company_locale = (getattr(company, "locale", "") or "").lower()[:2]
    if company_locale in _SUPPORTED_TRIAGE_LANGS:
        return company_locale

    return "en"


_LLM_SYSTEM_PROMPTS = {
    "nl": (
        "Je bent een productmanager voor ProjeXtPal (project-management SaaS). "
        "Je triage-rol: classificeer een gemelde ProductIssue en schrijf "
        "twee aparte berichten: één voor de reporter (eindgebruiker) en één "
        "voor het dev/admin team. Deze worden NIET door dezelfde mensen "
        "gelezen, dus zorg dat ze elk in de juiste toon staan.\n\n"
        "BELANGRIJK over reporters: dit zijn EINDGEBRUIKERS — geen developers, "
        "geen admins. Ze hebben GEEN toegang tot DevTools, HTTP status codes, "
        "stack traces, Sentry, server logs of database. Vraag NOOIT om dit "
        "soort technische details. Reporter-berichten zijn altijd vriendelijk "
        "en in alledaagse taal.\n\n"
        "BELANGRIJK over dev_notes: deze worden alleen door dev/admin gelezen, "
        "dus mag technisch jargon, file paths, API endpoints, SQL hints, "
        "Sentry zoektermen, etc.\n\n"
        "Geef ALLEEN een JSON-object terug, zonder commentaar, zonder markdown-fence. "
        "Schema:\n"
        "{\n"
        '  "classification": "bug" | "duplicate" | "feature" | "needs-info" | "wontfix" | "escalate",\n'
        '  "priority": "P0" | "P1" | "P2" | "P3",\n'
        '  "affected_area": "<korte string, bv. surveys / governance / mobile / auth>",\n'
        '  "reasoning": "<2-3 zinnen in het Nederlands — neutrale uitleg van de classificatie, leesbaar voor zowel reporter als dev>",\n'
        '  "reporter_message": "<vriendelijke alledaagse-taal zin/zinnen die de reporter ziet. Geen jargon. Per classificatie: bug/feature = bedankt, dev werkt eraan; needs-info = vraag om screenshot/URL/zin in eigen woorden; escalate = dit wordt door admin direct onderzocht; duplicate = we volgen dit al elders; wontfix = uitleg waarom we het niet oppakken>",\n'
        '  "dev_notes": "<technische notities voor dev/admin: waar in de code, welke endpoint/queryset, welke Sentry-query, welke logs, welke fix-suggestie. Mag jargon. Alleen leeg laten als classificatie wontfix/duplicate is zonder verdere actie nodig>"\n'
        "}\n\n"
        "Classification heuristieken:\n"
        "- 'bug' = duidelijk een code-defect / regression, voldoende info om te starten.\n"
        "- 'duplicate' = lijkt op een al bekende bug; alleen gebruiken bij sterke overlap.\n"
        "- 'feature' = verzoek tot nieuwe functionaliteit.\n"
        "- 'needs-info' = niet reproduceerbaar, maar de reporter kan het oplossen "
        "  door simpele zaken te geven: screenshot, URL van de pagina, of een "
        "  korte beschrijving in eigen woorden.\n"
        "- 'escalate' = alleen diagnoseerbaar met developer- of admin-toegang "
        "  (HTTP status codes, stack traces, Sentry links, server logs, "
        "  performance metrics, security incidenten, database queries, "
        "  infrastructuur).\n"
        "- 'wontfix' = test-data, by-design, of out-of-scope.\n\n"
        "Re-triage modus: Als het user-bericht een 'RE-TRIAGE CONTEXT' "
        "blok bevat, dan is de reporter al eerder om extra info "
        "gevraagd en heeft 'ie nu geantwoord. Lees de oude vervolgvraag "
        "+ de antwoorden, en doe dan:\n"
        "- Als de nieuwe info voldoende is → herclassificeer naar bug / "
        "  feature / duplicate / escalate / wontfix. Bedank de reporter "
        "  in reporter_message voor de extra details.\n"
        "- Als de antwoorden nog steeds de vraag niet beantwoorden (vaag "
        "  antwoord, off-topic, alleen 'zie screenshot' zonder screenshot) "
        "  → classificeer opnieuw als 'needs-info' maar stel een ANDERE, "
        "  specifiekere vraag in reporter_message (niet dezelfde "
        "  herhalen). Blijf vriendelijk en geduldig.\n"
        "- Als na herhaaldelijk vragen blijkt dat de reporter de info "
        "  niet kan leveren (meerdere rondes vage antwoorden, of ze "
        "  zeggen het zelf) → classificeer als 'escalate' om het issue "
        "  naar admin door te sturen voor direct onderzoek.\n\n"
        "Priority: P0 = blocker (data verlies, productie down, security), "
        "P1 = belangrijke bug die meerdere gebruikers raakt, "
        "P2 = standaard, P3 = nice-to-have / kosmetisch.\n"
    ),
    "en": (
        "You are a product manager for ProjeXtPal (project-management SaaS). "
        "Your triage role: classify a reported ProductIssue AND write two "
        "separate messages: one for the reporter (an end user) and one for "
        "the dev/admin team. These two audiences do not see the same thing, "
        "so write each in the appropriate tone.\n\n"
        "IMPORTANT about reporters: they are END USERS — not developers, not "
        "admins. They have NO access to DevTools, HTTP status codes, stack "
        "traces, Sentry, server logs, or the database. NEVER ask them for "
        "such technical details. Reporter-facing messages are always friendly "
        "and in plain everyday language.\n\n"
        "IMPORTANT about dev_notes: these are read only by dev/admin staff, "
        "so technical jargon is allowed: file paths, API endpoints, SQL "
        "hints, Sentry queries, fix suggestions, etc.\n\n"
        "Return ONLY a JSON object, no commentary, no markdown fence. "
        "Schema:\n"
        "{\n"
        '  "classification": "bug" | "duplicate" | "feature" | "needs-info" | "wontfix" | "escalate",\n'
        '  "priority": "P0" | "P1" | "P2" | "P3",\n'
        '  "affected_area": "<short string, e.g. surveys / governance / mobile / auth>",\n'
        '  "reasoning": "<2-3 sentences — neutral explanation of the classification, readable by both reporter and dev>",\n'
        '  "reporter_message": "<friendly plain-language sentence(s) shown to the reporter. No jargon. Per classification: bug/feature = thanks, dev team is on it; needs-info = ask for screenshot/URL/sentence in their own words; escalate = our admin team will investigate directly; duplicate = we are already tracking this elsewhere; wontfix = explain why we will not address it>",\n'
        '  "dev_notes": "<technical notes for dev/admin: where in the code, which endpoint/queryset, which Sentry query, which logs, what fix to consider. Jargon allowed. Leave empty only when classification is wontfix/duplicate with no further action>"\n'
        "}\n\n"
        "Classification heuristics:\n"
        "- 'bug' = clear code defect / regression, enough info to start work.\n"
        "- 'duplicate' = looks like a known bug; only when strong overlap.\n"
        "- 'feature' = request for new functionality.\n"
        "- 'needs-info' = not reproducible, but the reporter CAN resolve it by "
        "  sharing simple things: a screenshot, the URL of the page, or a "
        "  sentence in their own words.\n"
        "- 'escalate' = diagnosable only with developer or admin access "
        "  (HTTP status codes, stack traces, Sentry links, server logs, "
        "  performance metrics, security incidents, database queries, "
        "  infrastructure).\n"
        "- 'wontfix' = test data, by-design, or out-of-scope.\n\n"
        "Re-triage mode: If the user message contains a "
        "'RE-TRIAGE CONTEXT' block, the reporter has already been asked "
        "for more info once and has now responded. Read the prior "
        "follow-up question + the responses, then:\n"
        "- If the new info is sufficient → re-classify to bug / feature / "
        "  duplicate / escalate / wontfix. Thank the reporter in "
        "  reporter_message for the additional details.\n"
        "- If the responses still don't answer the question (vague reply, "
        "  off-topic, just 'see screenshot' without the screenshot) → "
        "  classify as 'needs-info' again but write a DIFFERENT, more "
        "  specific question in reporter_message (don't repeat the same "
        "  one). Keep the tone patient and friendly.\n"
        "- If after re-asking the reporter clearly can't provide what's "
        "  needed (multiple rounds of vague replies, or they say so) → "
        "  classify as 'escalate' to route the issue to admin for "
        "  direct investigation.\n\n"
        "Priority: P0 = blocker (data loss, production down, security), "
        "P1 = important bug affecting multiple users, "
        "P2 = standard, P3 = nice-to-have / cosmetic.\n"
    ),
}


# Translation table for static comment labels (the LLM provides the dynamic
# content like reasoning/recommended_action in the correct language already
# via the system prompt above).
_TRIAGE_TRANSLATIONS = {
    "nl": {
        # Public comment (reporter-visible) labels
        "public_header": "Update over je melding",
        "public_status": "Status",
        "public_next_h": "Wat gaat er nu gebeuren",
        # Internal comment (admin/superadmin-only) labels
        "internal_marker": "INTERN — alleen zichtbaar voor admin/superadmin",
        "internal_header": "Triage-analyse",
        "classification": "Classification",
        "priority": "Priority",
        "affected_area": "Affected area",
        "reasoning_h": "Redenering",
        "dev_notes_h": "Dev/admin notes",
        # Fallbacks
        "unknown": "(onbekend)",
        "none": "(geen)",
        "llm_error_body": (
            "Auto-triage tijdelijk niet beschikbaar (LLM-call faalde of gaf "
            "geen geldige JSON). De volgende cron-cycle probeert het opnieuw."
        ),
    },
    "en": {
        "public_header": "Update on your report",
        "public_status": "Status",
        "public_next_h": "What happens next",
        "internal_marker": "INTERNAL — admin/superadmin only",
        "internal_header": "Triage analysis",
        "classification": "Classification",
        "priority": "Priority",
        "affected_area": "Affected area",
        "reasoning_h": "Reasoning",
        "dev_notes_h": "Dev/admin notes",
        "unknown": "(unknown)",
        "none": "(none)",
        "llm_error_body": (
            "Auto-triage temporarily unavailable (LLM call failed or returned "
            "invalid JSON). The next cron cycle will retry."
        ),
    },
}


# Map classification → human-readable status label used in the public
# reporter-facing comment header. Kept localized.
_PUBLIC_STATUS_LABELS = {
    "en": {
        "bug": "Bug confirmed — dev team notified",
        "feature": "Feature request — added to backlog",
        "needs-info": "We need a bit more info from you",
        "escalate": "Routed to our admin team for direct investigation",
        "duplicate": "Already being tracked",
        "wontfix": "Reviewed — won't be addressed",
    },
    "nl": {
        "bug": "Bug bevestigd — dev-team is op de hoogte",
        "feature": "Functieverzoek — toegevoegd aan de backlog",
        "needs-info": "We hebben nog wat extra info van je nodig",
        "escalate": "Doorgestuurd naar ons admin-team voor direct onderzoek",
        "duplicate": "Wordt al elders gevolgd",
        "wontfix": "Bekeken — gaan we niet oppakken",
    },
}


def _llm_system_prompt(lang: str) -> str:
    return _LLM_SYSTEM_PROMPTS.get(lang, _LLM_SYSTEM_PROMPTS["en"])


def _t(lang: str, key: str) -> str:
    """Lookup a triage label in the requested language, fall back to en."""
    return _TRIAGE_TRANSLATIONS.get(
        lang, _TRIAGE_TRANSLATIONS["en"]
    ).get(key, _TRIAGE_TRANSLATIONS["en"].get(key, key))


def _format_public_triage_body(
    *,
    signature: str,
    lang: str,
    classification: str,
    reporter_message: str,
) -> str:
    """Render the REPORTER-FACING comment body.

    Plain text, no markdown, bullet style. ALWAYS in friendly end-user
    language — no jargon, no file paths, no HTTP codes. The reporter
    only sees this comment; the internal dev-jargon companion is on a
    sibling row with visibility='internal' that the serializer hides
    for non-staff viewers.
    """
    status_labels = _PUBLIC_STATUS_LABELS.get(
        lang, _PUBLIC_STATUS_LABELS["en"]
    )
    status_label = status_labels.get(classification, classification)
    none = _t(lang, "none")
    return "\n".join([
        f"{signature} llm-triage (public)",
        "",
        _t(lang, "public_header"),
        f"• {_t(lang, 'public_status')}: {status_label}",
        "",
        _t(lang, "public_next_h"),
        reporter_message or none,
        "",
    ])


def _format_internal_triage_body(
    *,
    signature: str,
    lang: str,
    classification: str,
    priority: str,
    area: str,
    reasoning: str,
    dev_notes: str,
) -> str:
    """Render the INTERNAL admin/superadmin-only comment body.

    Contains the full technical context: classification, priority,
    affected_area, reasoning, and dev_notes (file paths, endpoints,
    Sentry queries, fix suggestions). This row is filtered out by
    `ProductIssueSerializer.get_comments()` for any viewer that is not
    admin / superadmin / Django superuser, so the reporter never sees
    it — they only see the public sibling comment with the friendly
    end-user message.
    """
    unknown = _t(lang, "unknown")
    none = _t(lang, "none")
    return "\n".join([
        f"{signature} llm-triage (internal)",
        "",
        f"🔒 {_t(lang, 'internal_marker')}",
        "",
        _t(lang, "internal_header"),
        f"• {_t(lang, 'classification')}: {classification}",
        f"• {_t(lang, 'priority')}: {priority}",
        f"• {_t(lang, 'affected_area')}: {area or unknown}",
        "",
        _t(lang, "reasoning_h"),
        reasoning or none,
        "",
        _t(lang, "dev_notes_h"),
        dev_notes or none,
        "",
    ])


# Kept for backwards compatibility with any direct callers / tests.
LLM_SYSTEM_PROMPT = _LLM_SYSTEM_PROMPTS["en"]


def _llm_user_message(issue: ProductIssue) -> str:
    parts = [
        f"Titel: {issue.title}",
        f"Beschrijving: {issue.description or '(geen)'}",
        f"Reproduction steps: {issue.reproduction_steps or '(geen)'}",
        f"Expected: {issue.expected_behavior or '(geen)'}",
        f"Actual: {issue.actual_behavior or '(geen)'}",
        f"Error trace: {(issue.error_trace or '')[:1200]}",
        f"Category: {issue.get_category_display() if issue.category else '(geen)'}",
        f"Source: {issue.get_source_display() if issue.source else '(geen)'}",
    ]

    # Re-triage context: if this issue is currently in 'needs-info' and
    # has been triaged before, surface the previous follow-up question
    # AND the reporter's response(s) since then. Gives the LLM the
    # context to decide whether the new info is enough to re-classify
    # (bug / feature / escalate) or whether to keep asking.
    if issue.status == "needs-info" and issue.triaged_at is not None:
        prior_followup = (
            ProductIssueComment.objects.filter(
                issue=issue,
                body__startswith="[needs-info-followup]",
            )
            .order_by("-created_at")
            .first()
        )
        # Cap each comment body length so a long thread can't blow the
        # context window. Up to 5 most-recent reporter responses.
        reporter_responses = list(
            ProductIssueComment.objects.filter(
                issue=issue,
                created_at__gt=issue.triaged_at,
            )
            .exclude(author__startswith="agent:")
            .order_by("-created_at")[:5]
        )
        reporter_responses.reverse()  # chronological for the prompt

        if prior_followup or reporter_responses:
            parts.append("")
            parts.append("=== RE-TRIAGE CONTEXT (reporter has responded) ===")
            parts.append(
                "This issue was previously triaged as 'needs-info' on "
                f"{issue.triaged_at.isoformat()}. The reporter has since "
                f"posted {len(reporter_responses)} comment(s). Decide if "
                "there's now enough info to re-classify (bug / feature / "
                "escalate / etc.) or if you still need more — in which "
                "case classify as 'needs-info' again and write a "
                "different, more specific question in reporter_message."
            )
            if prior_followup:
                parts.append("")
                parts.append("Prior follow-up question we asked:")
                parts.append(prior_followup.body[:800])
            if reporter_responses:
                parts.append("")
                parts.append("Reporter responses since:")
                for c in reporter_responses:
                    parts.append(
                        f"  [{c.created_at.date().isoformat()}] "
                        f"{c.author}: {c.body[:600]}"
                    )

    return "\n".join(parts)


def _call_anthropic(issue: ProductIssue) -> Optional[dict]:
    """Run the Anthropic classifier. Returns parsed JSON or None on failure.

    Uses core.llm_keys.get_anthropic_client so BYO company keys + the
    platform fallback both work. The cron is cross-company, so we pass
    company=issue.company — that lets a customer's BYO Anthropic key be
    used to triage their own issues.
    """
    try:
        from core.llm_keys import get_anthropic_client
    except Exception as exc:  # pragma: no cover - import-time only
        logger.warning("Triage: cannot import core.llm_keys: %s", exc)
        return None

    company = getattr(issue, "company", None)
    try:
        client = get_anthropic_client(company)
    except Exception as exc:
        logger.warning("Triage: get_anthropic_client raised: %s", exc)
        return None
    if client is None:
        logger.warning("Triage: no Anthropic key available (company=%s)", company)
        return None

    lang = _resolve_triage_language(issue)
    try:
        resp = client.messages.create(
            model="claude-sonnet-4-5",
            max_tokens=600,
            temperature=0,
            system=_llm_system_prompt(lang),
            messages=[{"role": "user", "content": _llm_user_message(issue)}],
        )
    except Exception as exc:
        logger.warning("Triage: Anthropic call failed for issue #%s: %s", issue.id, exc)
        return None

    # Concatenate text blocks
    try:
        raw = "".join(
            block.text for block in resp.content
            if getattr(block, "type", "") == "text"
        )
    except Exception as exc:
        logger.warning("Triage: cannot read Anthropic response for #%s: %s", issue.id, exc)
        return None

    # Defensive JSON extraction
    match = re.search(r"\{[\s\S]*\}", raw or "")
    if not match:
        logger.warning("Triage: no JSON object found in LLM output for #%s", issue.id)
        return None
    try:
        return json.loads(match.group(0))
    except Exception as exc:
        logger.warning("Triage: JSON parse failed for #%s: %s — raw: %r",
                       issue.id, exc, raw[:200])
        return None


# ---------------------------------------------------------------------------
# Classification → ProductIssue.status mapping
# ---------------------------------------------------------------------------

_LLM_STATUS_MAP = {
    "bug": "triaging",
    "duplicate": "resolved",
    "feature": "accepted",
    "needs-info": "needs-info",
    "wontfix": "wont-fix",
    # 'escalate' = issue requires developer/admin access to diagnose
    # (stack trace, Sentry, server logs). Routes to superadmin instead
    # of asking the reporter for technical details. Status stays
    # 'triaging' so it shows up as an active dev task — but the comment
    # body is rendered with the escalate marker so it's visually
    # distinct from a normal bug.
    "escalate": "triaging",
}


def _normalize_priority(p: Any) -> str:
    p = str(p or "").strip().upper()
    return p if p in {"P0", "P1", "P2", "P3"} else "P2"


def _normalize_classification(c: Any) -> str:
    c = str(c or "").strip().lower()
    return c if c in _LLM_STATUS_MAP else "needs-info"


# ---------------------------------------------------------------------------
# Digest email
# ---------------------------------------------------------------------------

def _send_digest_email(
    *,
    catalog_resolved: list[tuple[int, str, str]],   # (id, title, bug_id)
    llm_classified: list[tuple[int, str, str, str]],  # (id, title, classification, priority)
    needs_info: list[tuple[int, str]],
    errors: list[tuple[int, str]],
) -> None:
    """Single digest email for this run. Reuses signals._send_email_safe."""
    total = len(catalog_resolved) + len(llm_classified) + len(needs_info)
    if total == 0 and not errors:
        return  # nothing to report

    try:
        from product_issues.signals import _send_email_safe, _admin_emails
    except Exception as exc:  # pragma: no cover
        logger.warning("Triage: cannot import signal helpers: %s", exc)
        return

    today = date.today().isoformat()
    subject = (
        f"[ProjeXtPal · Auto-triage] {today} — "
        f"{len(catalog_resolved)} catalog · {len(llm_classified)} LLM"
    )

    lines = [f"Auto-triage digest — run van {today}.", ""]
    if catalog_resolved:
        lines.append(f"Catalogus-match (resolved): {len(catalog_resolved)}")
        for iid, title, bug in catalog_resolved:
            lines.append(f"  · #{iid} — {title[:70]}  →  {bug}")
        lines.append("")
    if llm_classified:
        lines.append(f"LLM-classificatie: {len(llm_classified)}")
        for iid, title, cls, prio in llm_classified:
            lines.append(f"  · #{iid} — {title[:60]}  →  {cls} / {prio}")
        lines.append("")
    if needs_info:
        lines.append(f"Needs info (LLM kon niet classificeren): {len(needs_info)}")
        for iid, title in needs_info:
            lines.append(f"  · #{iid} — {title[:70]}")
        lines.append("")
    if errors:
        lines.append(f"Errors: {len(errors)}")
        for iid, msg in errors:
            lines.append(f"  · #{iid} — {msg}")
        lines.append("")

    text = "\n".join(lines)
    html = "<pre style='font-family: ui-monospace, monospace; font-size: 13px;'>" \
           + text.replace("<", "&lt;").replace(">", "&gt;") \
           + "</pre>"

    _send_email_safe(
        subject=subject,
        text_body=text,
        html_body=html,
        to=_admin_emails(),
    )


# ---------------------------------------------------------------------------
# Command
# ---------------------------------------------------------------------------

class Command(BaseCommand):
    help = (
        "Automated ProductIssue triage: catalog cross-match (Phase A) + "
        "Anthropic LLM classifier (Phase B). Designed for a 30-min cron."
    )

    def add_arguments(self, parser):
        parser.add_argument(
            "--dry-run", action="store_true",
            help="Do not write to DB and do not call the LLM."
        )
        parser.add_argument(
            "--limit", type=int, default=50,
            help="Max issues to process per run (default 50)."
        )
        parser.add_argument(
            "--issue-id", type=int, default=None,
            help="Process exactly one issue by ID (overrides --limit)."
        )

    # ------------------------------------------------------------------
    def handle(self, *args, **opts):
        dry_run: bool = opts["dry_run"]
        limit: int = opts["limit"] or 50
        issue_id: Optional[int] = opts.get("issue_id")

        self.stdout.write(self.style.NOTICE(
            f"Triage start — dry_run={dry_run} limit={limit} "
            f"issue_id={issue_id or '(any)'}"
        ))

        catalog = _load_catalog()
        self.stdout.write(f"Catalog: loaded {len(catalog)} entries.")

        # ---- Select candidates --------------------------------------
        # Two source-streams of candidates:
        #
        #   1. NEW issues — never triaged. status='new', triaged_at IS NULL.
        #      Get a Phase A catalog-match attempt + Phase B LLM
        #      classification if no catalog hit.
        #
        #   2. NEEDS-INFO issues with a reporter response — already triaged
        #      once as needs-info, but the reporter has posted a non-agent
        #      comment since `triaged_at`. The LLM gets the original issue
        #      + the prior follow-up question + the new reporter response,
        #      so it can decide if there's now enough info to re-classify
        #      (bug / feature / escalate) or whether to ask for more.
        #
        # Union of both streams is processed in the same loop — the
        # prompt_extra_context() helper inside _llm_user_message adds the
        # re-triage hint only when the issue's status is 'needs-info'.
        if issue_id is not None:
            # Direct addressing: ignore the status filter, only the
            # idempotency check below gates execution.
            qs = ProductIssue.objects.filter(pk=issue_id)
        else:
            new_qs = ProductIssue.objects.filter(
                status="new", triaged_at__isnull=True,
            )
            recheck_qs = _needs_info_candidates_with_response(
                ProductIssue.objects.all()
            )
            # Use a list-merge instead of qs.union() because union()
            # plus order_by + slice gets fragile on Postgres. Fetch each
            # stream, dedupe by pk, then sort.
            merged = list(new_qs.order_by("created_at")) + list(
                recheck_qs.order_by("triaged_at")
            )
            seen = set()
            ordered = []
            for issue in merged:
                if issue.pk in seen:
                    continue
                seen.add(issue.pk)
                ordered.append(issue)
            qs = ordered[:limit]
        candidates = list(qs)
        n_recheck = sum(1 for i in candidates if i.status == "needs-info")
        self.stdout.write(
            f"Candidates: {len(candidates)} issues to consider "
            f"({len(candidates) - n_recheck} new, {n_recheck} needs-info rechecks)."
        )

        # Counters
        n_catalog = 0
        n_llm = 0
        n_needs = 0
        n_errors = 0
        n_skipped_idempotent = 0

        # Digest buckets
        catalog_resolved: list[tuple[int, str, str]] = []
        llm_classified: list[tuple[int, str, str, str]] = []
        needs_info_list: list[tuple[int, str]] = []
        error_list: list[tuple[int, str]] = []

        for issue in candidates:
            # Idempotency
            if _already_triaged_today(issue):
                n_skipped_idempotent += 1
                self.stdout.write(f"  · #{issue.id} — already triaged today, skip")
                continue

            # ---- Phase A: catalog cross-match ----------------------
            matched = None
            for entry in catalog:
                try:
                    if _phase_a_match(issue, entry):
                        matched = entry
                        break
                except Exception as exc:
                    logger.warning("Phase A match() raised on #%s: %s", issue.id, exc)

            if matched is not None:
                bug_id = matched.get("id") or "?"
                fix_location = matched.get("fix_location") or "(catalog)"
                priority = _severity_to_priority(matched.get("severity") or "")
                cat_status = matched.get("status") or "?"

                body = (
                    f"{_today_signature(issue)} catalog-match\n\n"
                    f"Automatische triage — gemarkeerd als opgelost via "
                    f"catalogus-cross-match (`tests/regression/known_issues.json`).\n\n"
                    f"Match: **{bug_id}** — {matched.get('title', '')}\n"
                    f"Catalogus-status: `{cat_status}`\n"
                    f"Fix locatie: `{fix_location}`\n\n"
                    f"Heb je nog steeds last van dit probleem? Beantwoord deze mail "
                    f"of meld een nieuwe issue, dan kijken we opnieuw."
                )

                if not dry_run:
                    try:
                        issue.status = "resolved"
                        issue.priority = priority
                        issue.agent_triage_result = {
                            "matched_bug": bug_id,
                            "fix_location": fix_location,
                            "catalog_status": cat_status,
                            "phase": "catalog",
                        }
                        issue.triaged_by = "agent:issue-triage-validator"
                        issue.triaged_at = timezone.now()
                        if not issue.resolution_summary:
                            issue.resolution_summary = (
                                f"Resolved via catalog cross-match {bug_id} "
                                f"(fix: {fix_location})."
                            )
                        issue._suppress_email_on_save = True
                        issue.save(update_fields=[
                            "status", "priority", "agent_triage_result",
                            "triaged_by", "triaged_at", "resolution_summary",
                            "updated_at",
                        ])
                        ProductIssueComment.objects.create(
                            issue=issue,
                            author="agent:issue-triage-validator",
                            body=body,
                            is_triage_step=True,
                        )
                    except Exception as exc:
                        n_errors += 1
                        error_list.append((issue.id, f"catalog-save: {exc}"))
                        logger.exception("Triage: catalog write failed on #%s", issue.id)
                        continue

                n_catalog += 1
                catalog_resolved.append((issue.id, issue.title, bug_id))
                self.stdout.write(self.style.SUCCESS(
                    f"  ✓ #{issue.id} — catalog-match {bug_id} → resolved/{priority}"
                ))
                continue

            # ---- Phase B: LLM classification -----------------------
            if dry_run:
                self.stdout.write(f"  · #{issue.id} — dry-run, would call LLM")
                continue

            lang = _resolve_triage_language(issue)
            parsed = _call_anthropic(issue)
            if parsed is None:
                # Leave status='new'; post a transient-failure comment, but
                # only once per day (idempotency upstream already guarded).
                comment_body = (
                    f"{_today_signature(issue)} llm-error\n\n"
                    f"{_t(lang, 'llm_error_body')}"
                )
                try:
                    ProductIssueComment.objects.create(
                        issue=issue,
                        author="agent:issue-triage-validator",
                        body=comment_body,
                        is_triage_step=True,
                    )
                except Exception:
                    pass
                n_errors += 1
                error_list.append((issue.id, "llm-call-failed"))
                self.stdout.write(self.style.WARNING(
                    f"  ! #{issue.id} — LLM unavailable, will retry next cycle"
                ))
                continue

            classification = _normalize_classification(parsed.get("classification"))
            priority = _normalize_priority(parsed.get("priority"))
            new_status = _LLM_STATUS_MAP[classification]
            reasoning = str(parsed.get("reasoning") or "")[:1000]
            # New dual-message schema (preferred). Falls back to the legacy
            # single-field `recommended_action` if the LLM didn't return the
            # new fields — keeps the cron robust against schema drift.
            reporter_message = str(
                parsed.get("reporter_message")
                or parsed.get("recommended_action")
                or ""
            )[:600]
            dev_notes = str(
                parsed.get("dev_notes")
                or parsed.get("recommended_action")
                or ""
            )[:800]
            area = str(parsed.get("affected_area") or "")[:80]

            signature = _today_signature(issue)
            public_body = _format_public_triage_body(
                signature=signature, lang=lang,
                classification=classification,
                reporter_message=reporter_message,
            )
            internal_body = _format_internal_triage_body(
                signature=signature, lang=lang,
                classification=classification, priority=priority, area=area,
                reasoning=reasoning, dev_notes=dev_notes,
            )

            try:
                issue.status = new_status
                issue.priority = priority
                issue.agent_triage_result = {**parsed, "phase": "llm"}
                issue.triaged_by = "agent:issue-triage-validator"
                issue.triaged_at = timezone.now()
                issue._suppress_email_on_save = True
                issue.save(update_fields=[
                    "status", "priority", "agent_triage_result",
                    "triaged_by", "triaged_at", "updated_at",
                ])
                # Two sibling comments: public for the reporter, internal
                # for admin/superadmin. Same signature line, suffix
                # differentiates them in admin scans.
                ProductIssueComment.objects.create(
                    issue=issue,
                    author="agent:issue-triage-validator",
                    body=public_body,
                    is_triage_step=True,
                    visibility=ProductIssueComment.VISIBILITY_PUBLIC,
                )
                ProductIssueComment.objects.create(
                    issue=issue,
                    author="agent:issue-triage-validator",
                    body=internal_body,
                    is_triage_step=True,
                    visibility=ProductIssueComment.VISIBILITY_INTERNAL,
                )
            except Exception as exc:
                n_errors += 1
                error_list.append((issue.id, f"llm-save: {exc}"))
                logger.exception("Triage: LLM write failed on #%s", issue.id)
                continue

            if classification == "needs-info":
                n_needs += 1
                needs_info_list.append((issue.id, issue.title))
            else:
                n_llm += 1
                llm_classified.append((issue.id, issue.title, classification, priority))

            self.stdout.write(self.style.SUCCESS(
                f"  ✓ #{issue.id} — LLM {classification}/{priority} → {new_status}"
            ))

        # ---- Digest email --------------------------------------------
        if not dry_run:
            try:
                _send_digest_email(
                    catalog_resolved=catalog_resolved,
                    llm_classified=llm_classified,
                    needs_info=needs_info_list,
                    errors=error_list,
                )
            except Exception:
                logger.exception("Triage: digest email failed")

        # ---- Summary line --------------------------------------------
        total = n_catalog + n_llm + n_needs
        self.stdout.write("")
        self.stdout.write(self.style.NOTICE(
            f"INFO: triaged {total} issues — "
            f"{n_catalog} by catalog, {n_llm} by LLM, "
            f"{n_needs} needing info, {n_errors} errors "
            f"({n_skipped_idempotent} idempotent-skipped)"
        ))
