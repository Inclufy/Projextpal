"""
Sprint 5 — Shared LLM fallback-ladder helper for proactive-AI endpoints.

Refactor target: Sprint 4 originally embedded the Anthropic → OpenAI →
deterministic fallback inside ``methodology_autodrafts.py``. Sprint 5
adds 9 more proactive-AI endpoints (compliance scan, auto-tag, status
report draft, risk/dependency sniff, team match, onboarding tour,
dashboard narrative, meeting agenda) that reuse the same ladder.

Design:
  * One module hosts the ladder — ``methodology_autodrafts.py`` now
    re-exports the symbols for backwards compatibility so the Sprint 4
    endpoints keep working unchanged.
  * Every real LLM hit is recorded via ``ai_usage.record()`` so the
    token meter stays honest.
  * The helper never raises — it swallows exceptions and returns ``None``
    on any failure so the caller can fall back to its deterministic
    template. Demo-safety is kritiek voor Elisa-sessies.
"""
from __future__ import annotations

import json
import logging
from dataclasses import dataclass, field
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

OPENAI_MODEL = "gpt-4o-mini"

# Model-tier C — Sonnet-first for every tenant, Opus-opt-in via
# Company.ai_premium_models.
#
# Rationale: 90%+ of our draft-call volume ran on Opus which gave us a
# magere 23% bruto marge on BC-size calls. Sonnet is ~95% of Opus quality
# on structured JSON drafts at 20% of the cost — flipping the default
# brings bruto marge on heavy drafts to ~80%, while Enterprise tenants
# that want Opus-quality guarantee can opt in via the ai_premium_models
# flag on their Company row.
#
# Heavy vs light: Business Case, Project Brief, Scrum vision and the
# Waterfall-phases/LSS-define drafts need rich grounded prose and get
# the "heavy" tier. Risk-registers, milestones, kanban-swimlanes return
# compact structured lists and are fine on the "light" tier.
#
# Keep BC backwards-compat (keep ANTHROPIC_MODEL symbol pointing to the
# heavy default so legacy imports still work).

ANTHROPIC_HEAVY_PREMIUM = "claude-opus-4-7"
ANTHROPIC_HEAVY_DEFAULT = "claude-sonnet-5"
ANTHROPIC_LIGHT_PREMIUM = "claude-sonnet-5"
ANTHROPIC_LIGHT_DEFAULT = "claude-haiku-4-5-20251001"

# Backwards-compat alias used by anything that imported ANTHROPIC_MODEL
# directly; defaults to the heavy-default (Sonnet).
ANTHROPIC_MODEL = ANTHROPIC_HEAVY_DEFAULT

MAX_TOKENS_SMALL = 2000
MAX_TOKENS_LARGE = 4000


def _resolve_anthropic_model(company, heavy: bool) -> str:
    """Pick the Anthropic model based on tenant tier + workload weight.

    heavy=True + premium  → Opus     (BC / Brief / Scrum vision)
    heavy=True + default  → Sonnet
    heavy=False + premium → Sonnet   (risks / milestones / swimlanes)
    heavy=False + default → Haiku
    """
    premium = bool(getattr(company, "ai_premium_models", False))
    if heavy:
        return ANTHROPIC_HEAVY_PREMIUM if premium else ANTHROPIC_HEAVY_DEFAULT
    return ANTHROPIC_LIGHT_PREMIUM if premium else ANTHROPIC_LIGHT_DEFAULT


# =========================================================================
# JSON parsing
# =========================================================================

def strip_fences(raw: str) -> str:
    """Tolerate the odd model that wraps JSON in ``` fences."""
    cleaned = (raw or "").strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```", 2)[1]
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:]
        cleaned = cleaned.strip()
    return cleaned


def parse_json(raw: str) -> Optional[dict]:
    try:
        data = json.loads(strip_fences(raw))
    except Exception:
        return None
    if not isinstance(data, dict):
        return None
    return data


# =========================================================================
# LLM ladder
# =========================================================================

def _byok_for(company, provider: str) -> bool:
    """True when the company has an active CompanyAIKey for provider.

    Lets the billing-DB-log cleanly separate rows that cost Inclufy money
    (byok=False) from rows the customer paid their own LLM provider for
    (byok=True, cost_cents=0 on the AIUsageLog row).
    """
    if not company:
        return False
    try:
        key = getattr(company, "ai_key", None)
    except Exception:
        return False
    if not key or not getattr(key, "is_active", False):
        return False
    if provider == "openai":
        return bool(getattr(key, "openai_api_key", ""))
    if provider == "anthropic":
        return bool(getattr(key, "anthropic_api_key", ""))
    return False


def call_anthropic(company, system: str, user_prompt: str,
                   max_tokens: int = MAX_TOKENS_SMALL,
                   user_id: Optional[int] = None,
                   surface: str = "",
                   heavy: bool = True) -> Optional[dict]:
    try:
        from core.llm_keys import get_anthropic_client
        from core import ai_usage
        client = get_anthropic_client(company)
        if client is None:
            return None
        model = _resolve_anthropic_model(company, heavy)
        resp = client.messages.create(
            model=model, max_tokens=max_tokens, system=system,
            messages=[{"role": "user", "content": user_prompt}],
        )
        _total = ai_usage.tokens_from_anthropic(resp)
        _usage = getattr(resp, "usage", None)
        _prompt = int(getattr(_usage, "input_tokens", 0) or 0) if _usage else 0
        _completion = int(getattr(_usage, "output_tokens", 0) or 0) if _usage else 0
        ai_usage.record_call(
            company_id=getattr(company, "id", None),
            user_id=user_id,
            provider="anthropic",
            model=model,
            surface=surface,
            tokens_total=_total,
            tokens_prompt=_prompt,
            tokens_completion=_completion,
            byok=_byok_for(company, "anthropic"),
        )
        raw = "".join(
            b.text for b in resp.content if getattr(b, "type", "") == "text"
        )
        return parse_json(raw)
    except Exception as e:
        logger.info("ai_draft_shared anthropic failed: %s", e)
        return None


def call_openai(company, system: str, user_prompt: str,
                max_tokens: int = MAX_TOKENS_SMALL,
                user_id: Optional[int] = None,
                surface: str = "") -> Optional[dict]:
    try:
        from core.llm_keys import get_openai_client
        from core import ai_usage
        client = get_openai_client(company)
        if client is None:
            return None
        resp = client.chat.completions.create(
            model=OPENAI_MODEL,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_prompt},
            ],
            temperature=0.3,
            max_tokens=max_tokens,
            response_format={"type": "json_object"},
        )
        try:
            usage = getattr(resp, "usage", None)
            _total = int(getattr(usage, "total_tokens", 0) or 0) if usage else 0
            _prompt = int(getattr(usage, "prompt_tokens", 0) or 0) if usage else 0
            _completion = int(getattr(usage, "completion_tokens", 0) or 0) if usage else 0
            ai_usage.record_call(
                company_id=getattr(company, "id", None),
                user_id=user_id,
                provider="openai",
                model=OPENAI_MODEL,
                surface=surface,
                tokens_total=_total,
                tokens_prompt=_prompt,
                tokens_completion=_completion,
                byok=_byok_for(company, "openai"),
            )
        except Exception:
            pass
        return parse_json(resp.choices[0].message.content or "")
    except Exception as e:
        logger.info("ai_draft_shared openai failed: %s", e)
        return None


def run_llm(user, system: str, user_prompt: str,
            max_tokens: int = MAX_TOKENS_SMALL,
            surface: str = "",
            heavy: bool = True) -> Optional[dict]:
    """Anthropic → OpenAI ladder. Returns parsed dict or None.

    ``heavy`` tells the resolver whether this draft needs the richer
    tier (BC / Project Brief / Scrum vision = True) or the cheaper tier
    (risk-register / milestones / kanban swimlanes = False). The actual
    model picked also depends on Company.ai_premium_models (opt-in for
    Opus / Sonnet escalation).

    ``surface`` is the AI endpoint label ('business-case-auto-draft',
    'scrum-vision-auto-draft', …) → lands in AIUsageLog.surface so the
    billing dashboard can show per-feature breakdown.
    """
    company = getattr(user, "company", None)
    uid = getattr(user, "id", None)
    parsed = call_anthropic(company, system, user_prompt, max_tokens,
                            user_id=uid, surface=surface, heavy=heavy)
    if parsed is not None:
        return parsed
    return call_openai(company, system, user_prompt, max_tokens,
                       user_id=uid, surface=surface)


# =========================================================================
# DraftResult envelope
# =========================================================================

@dataclass
class DraftResult:
    suggested: Dict[str, Any]
    source: str  # "ai" | "fallback"
    warnings: List[str] = field(default_factory=list)

    def as_dict(self) -> Dict[str, Any]:
        return {
            "suggested": self.suggested,
            "source": self.source,
            "warnings": self.warnings,
        }


# =========================================================================
# Prompt helpers
# =========================================================================

def wrap_prompt(doc_prefix: str, meta: dict, instructions: str) -> str:
    """Assemble the user-prompt body: project meta + optional document
    prefix + instructions."""
    body = (
        f"Project metadata:\n{json.dumps(meta, ensure_ascii=False)}\n\n"
    )
    if doc_prefix:
        body = f"{doc_prefix}{body}"
    return f"{body}{instructions}"


def finalize(parsed: Optional[dict], fallback: dict,
             warnings: List[str], lang_meta: dict,
             no_llm_key: str = "no_llm_notice") -> DraftResult:
    """Pick AI result (if valid) or deterministic fallback.

    `lang_meta` is any dict with a human-readable "no LLM key" notice at
    the key named by `no_llm_key`. The notice is only appended when we
    actually fall back.
    """
    if parsed is not None:
        return DraftResult(suggested=parsed, source="ai", warnings=list(warnings))
    warn = list(warnings)
    notice = lang_meta.get(no_llm_key) if isinstance(lang_meta, dict) else None
    if notice:
        warn.append(notice)
    return DraftResult(suggested=fallback, source="fallback", warnings=warn)


# =========================================================================
# Shared translator dict for Sprint 5 endpoints
# =========================================================================

def sprint5_lang_meta(language: str) -> dict:
    """Translator for Sprint 5 fallback / warning strings in NL/EN/FR.

    Each key is read on demand by the individual endpoint — a new ticket
    adds its own strings here. The structure is intentionally flat so a
    missing key degrades to the English default rather than a KeyError.
    """
    lang = (language or "nl").lower()
    if lang == "en":
        return {
            "no_context_warning": (
                "No project documents uploaded — this draft is based on "
                "project metadata only; upload a tender / brief to make it "
                "project-specific."
            ),
            "no_llm_notice": (
                "No AI key is configured; returning a deterministic template. "
                "Edit the fields before applying."
            ),
            "status_report_no_signal": (
                "No milestones, tasks or risks were found to summarise."
            ),
            "status_report_fallback_summary": (
                "Project continues according to plan — review items below "
                "and adjust before sharing."
            ),
            "narrative_fallback_headline": "Project snapshot",
            "narrative_fallback_body": (
                "Open the Project Overview to inspect progress, risks and "
                "deliverables manually; the AI narrative is unavailable."
            ),
            "team_match_no_members": (
                "No active team members to match against — invite users to "
                "this project's company first."
            ),
            "team_match_fallback_reasoning": (
                "Role-based match: this member's role is a good first look. "
                "Review individually before adding."
            ),
            "onboarding_greeting": "Welcome to the project",
            "onboarding_role_focus": "Focus on your assigned tasks and the next milestone.",
            "onboarding_summary_fallback": (
                "This project is live. Review the overview, open the active "
                "milestone and ask the Co-pilot anything you need."
            ),
            "meeting_agenda_fallback_item": "Status review and open actions",
            "risk_sniff_no_findings": "No additional risks or dependencies surfaced.",
            "compliance_scan_warning_prefix": "Compliance keyword found:",
        }
    if lang == "fr":
        return {
            "no_context_warning": (
                "Aucun document de projet téléversé — ce brouillon est basé "
                "uniquement sur les métadonnées du projet."
            ),
            "no_llm_notice": (
                "Aucune clé IA n'est configurée; renvoi d'un modèle "
                "déterministe. Modifiez les champs avant d'appliquer."
            ),
            "status_report_no_signal": (
                "Aucun jalon, tâche ou risque n'a été trouvé à synthétiser."
            ),
            "status_report_fallback_summary": (
                "Le projet se poursuit selon le plan — vérifiez les éléments "
                "ci-dessous et ajustez avant de partager."
            ),
            "narrative_fallback_headline": "Aperçu du projet",
            "narrative_fallback_body": (
                "Consultez la page de synthèse pour examiner les progrès; la "
                "narration IA est indisponible."
            ),
            "team_match_no_members": (
                "Aucun membre d'équipe actif pour l'appariement — invitez "
                "d'abord des utilisateurs dans l'entreprise."
            ),
            "team_match_fallback_reasoning": (
                "Correspondance basée sur le rôle: ce membre est une première "
                "piste. Vérifiez individuellement avant d'ajouter."
            ),
            "onboarding_greeting": "Bienvenue sur le projet",
            "onboarding_role_focus": "Concentrez-vous sur vos tâches et le prochain jalon.",
            "onboarding_summary_fallback": (
                "Ce projet est actif. Consultez l'aperçu, ouvrez le jalon en "
                "cours et interrogez le copilote si besoin."
            ),
            "meeting_agenda_fallback_item": "Revue d'avancement et actions ouvertes",
            "risk_sniff_no_findings": "Aucun risque ou dépendance supplémentaire détecté.",
            "compliance_scan_warning_prefix": "Mot-clé de conformité trouvé :",
        }
    # NL default
    return {
        "no_context_warning": (
            "Geen project-documenten geüpload — resultaat is op basis van "
            "project-metadata only. Upload een tender/brief voor een "
            "projectspecifiek concept."
        ),
        "no_llm_notice": (
            "Er is geen AI-sleutel geconfigureerd; dit is een "
            "sjabloonvoorstel. Pas de velden gerust aan voordat je ze "
            "toepast."
        ),
        "status_report_no_signal": (
            "Geen mijlpalen, taken of risico's gevonden om samen te vatten."
        ),
        "status_report_fallback_summary": (
            "Project loopt volgens planning — controleer de punten hieronder "
            "en pas aan voordat je deelt."
        ),
        "narrative_fallback_headline": "Project-snapshot",
        "narrative_fallback_body": (
            "Open het Project-overzicht om voortgang, risico's en "
            "deliverables handmatig te bekijken; de AI-narrative is niet "
            "beschikbaar."
        ),
        "team_match_no_members": (
            "Geen actieve teamleden om tegen te matchen — nodig eerst "
            "gebruikers uit in het bedrijf."
        ),
        "team_match_fallback_reasoning": (
            "Rol-gebaseerde match: deze persoon's rol is een goede eerste "
            "indicatie. Beoordeel individueel voordat je toevoegt."
        ),
        "onboarding_greeting": "Welkom bij het project",
        "onboarding_role_focus": "Focus op jouw toegewezen taken en de volgende mijlpaal.",
        "onboarding_summary_fallback": (
            "Dit project is actief. Bekijk het overzicht, open de actuele "
            "mijlpaal en vraag de Co-pilot om hulp waar nodig."
        ),
        "meeting_agenda_fallback_item": "Statusreview en openstaande acties",
        "risk_sniff_no_findings": "Geen aanvullende risico's of dependencies gevonden.",
        "compliance_scan_warning_prefix": "Compliance-term gevonden:",
    }
