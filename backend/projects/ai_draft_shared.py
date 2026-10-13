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

ANTHROPIC_MODEL = "claude-opus-4-7"
OPENAI_MODEL = "gpt-4o-mini"

MAX_TOKENS_SMALL = 2000
MAX_TOKENS_LARGE = 4000


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

def call_anthropic(company, system: str, user_prompt: str,
                   max_tokens: int = MAX_TOKENS_SMALL) -> Optional[dict]:
    try:
        from core.llm_keys import get_anthropic_client
        from core import ai_usage
        client = get_anthropic_client(company)
        if client is None:
            return None
        resp = client.messages.create(
            model=ANTHROPIC_MODEL, max_tokens=max_tokens, system=system,
            messages=[{"role": "user", "content": user_prompt}],
        )
        ai_usage.record(getattr(company, "id", None),
                        ai_usage.tokens_from_anthropic(resp), provider="anthropic")
        raw = "".join(
            b.text for b in resp.content if getattr(b, "type", "") == "text"
        )
        return parse_json(raw)
    except Exception as e:
        logger.info("ai_draft_shared anthropic failed: %s", e)
        return None


def call_openai(company, system: str, user_prompt: str,
                max_tokens: int = MAX_TOKENS_SMALL) -> Optional[dict]:
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
            total = int(getattr(usage, "total_tokens", 0) or 0) if usage else 0
            ai_usage.record(getattr(company, "id", None), total, provider="openai")
        except Exception:
            pass
        return parse_json(resp.choices[0].message.content or "")
    except Exception as e:
        logger.info("ai_draft_shared openai failed: %s", e)
        return None


def run_llm(user, system: str, user_prompt: str,
            max_tokens: int = MAX_TOKENS_SMALL) -> Optional[dict]:
    """Anthropic → OpenAI ladder. Returns parsed dict or None."""
    company = getattr(user, "company", None)
    parsed = call_anthropic(company, system, user_prompt, max_tokens)
    if parsed is not None:
        return parsed
    return call_openai(company, system, user_prompt, max_tokens)


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
