"""
Sprint 4 — Methodology auto-drafts from uploaded documents.

One module, six draft helpers. Each helper takes a Project, a user, a
language code (nl/en/fr) and the project's ProjectAIContext text prefix
(as built by core.ai_context_helpers.get_project_context_prefix). It
returns a dict with the canonical shape:

    {
        "suggested": {...},        # ticket-specific fields
        "source": "ai" | "fallback",
        "warnings": [str, ...],
    }

The caller (methodology_autodraft_views) is responsible for persisting /
not persisting — these helpers never touch the DB.

Design decisions:

* **Anthropic → OpenAI → deterministic fallback.** Same ladder as
  ai_planner.plan_chat so demo-safety is identical: a tenant without an
  LLM key still gets a usable draft the user can edit.
* **One response_format per provider.** Anthropic gets a strict JSON
  system contract; OpenAI uses `response_format={"type":"json_object"}`.
  We strip code fences before parsing to tolerate the odd model that
  wraps JSON in ``` fences anyway.
* **ai_usage.record() on every real LLM hit** so the token meter stays
  honest.
* **Warnings surface the missing-context case** so the UI can show
  "no documents uploaded — this is a metadata-only draft".
"""
from __future__ import annotations

import json
import logging
from datetime import date, timedelta
from typing import Any, Dict, List, Optional

# Sprint 5 — the LLM ladder, JSON parser and DraftResult envelope were
# refactored into ai_draft_shared so proactive-AI endpoints can reuse
# them without duplicating code. We keep the private aliases for the
# existing Sprint 4 helpers below.
from .ai_draft_shared import (
    MAX_TOKENS_LARGE as _MAX_TOKENS_LARGE,
    MAX_TOKENS_SMALL as _MAX_TOKENS_SMALL,
    DraftResult,
    call_anthropic as _call_anthropic,
    call_openai as _call_openai,
    run_llm as _run_llm,
    parse_json as _parse_json,
    strip_fences as _strip_fences,
    wrap_prompt as _wrap,
)

logger = logging.getLogger(__name__)


def _draft_instructions(language: str, kind: str) -> str:
    """Per-language user-prompt instruction tail.

    The system prompt sets the language directive, but the USER prompt
    carries the "produce X JSON now" tail. Keeping that tail in English
    was enough to tilt the model into replying in English — this helper
    delivers the tail in the user's language so the whole prompt stack
    agrees on the target language.
    """
    lang = (language or "nl").lower()
    _blocks = {
        "nl": {
            "business_case": (
                "Lever nu de Business Case JSON. Houd beweringen consistent "
                "met de geüploade documenten (indien aanwezig) en de "
                "projectmetadata. Verzin geen concrete financiële getallen; "
                "beschrijf baten kwalitatief. ALLE tekst in de JSON-waarden "
                "MOET in het Nederlands zijn."
            ),
            "project_brief": (
                "Lever nu de Project Brief JSON. Baseer project_definition en "
                "project_approach op de geüploade documenten als die er zijn; "
                "houd de business_case_outline kort (3-4 zinnen). ALLE tekst "
                "in de JSON-waarden MOET in het Nederlands zijn."
            ),
            "scrum": (
                "Lever nu de Scrum visie + backlog JSON. Gebruik voor backlog-"
                "items user-story titels (\"Als <rol> kan ik ...\"-stijl) "
                "wanneer de documenten een gebruiker noemen; anders concrete "
                "deliverable-titels. ALLE tekst in het Nederlands."
            ),
            "kanban": "Lever nu de swimlane JSON. ALLE tekst in het Nederlands.",
            "lss": "Lever nu de DMAIC Define JSON. ALLE tekst in het Nederlands.",
            "waterfall": (
                "Lever nu de Waterfall fases JSON. Gebruik bij voorkeur "
                "fasenamen en datums die in de projectdocumenten voorkomen; "
                "interpoleer anders binnen de projectperiode. ALLE tekst in "
                "het Nederlands."
            ),
        },
        "fr": {
            "business_case": (
                "Produisez maintenant le JSON du Business Case. Gardez les "
                "affirmations cohérentes avec les documents téléversés (le "
                "cas échéant) et les métadonnées du projet. N'inventez pas "
                "de montants financiers concrets; décrivez les bénéfices "
                "qualitativement. TOUT le texte dans les valeurs JSON DOIT "
                "être en français."
            ),
            "project_brief": (
                "Produisez maintenant le JSON du Project Brief. Fondez "
                "project_definition et project_approach sur les documents "
                "téléversés quand ils sont disponibles; gardez "
                "business_case_outline court (3-4 phrases). TOUT en français."
            ),
            "scrum": (
                "Produisez maintenant le JSON vision + backlog Scrum. Pour "
                "chaque item, préférez des titres de user-story (\"En tant "
                "que <rôle>, je peux ...\") quand les documents mentionnent "
                "un utilisateur; sinon des titres de livrables concrets. "
                "TOUT le texte en français."
            ),
            "kanban": "Produisez maintenant le JSON des swimlanes. TOUT le texte en français.",
            "lss": "Produisez maintenant le JSON DMAIC Define. TOUT le texte en français.",
            "waterfall": (
                "Produisez maintenant le JSON des phases Waterfall. Préférez "
                "les noms de phases et dates présents dans les documents "
                "projet quand ils existent; interpolez sinon dans la période "
                "projet. TOUT le texte en français."
            ),
        },
        "en": {
            "business_case": (
                "Produce the Business Case JSON now. Keep claims consistent "
                "with the uploaded documents (if any) and the project "
                "metadata. Do not invent concrete financial numbers; narrate "
                "benefits qualitatively. All text in the JSON values MUST "
                "be in English."
            ),
            "project_brief": (
                "Produce the Project Brief JSON now. Ground project_definition "
                "and project_approach in the uploaded documents when "
                "available; keep the business_case_outline short (3-4 "
                "sentences). All text MUST be in English."
            ),
            "scrum": (
                "Produce the Scrum vision + backlog JSON now. For each "
                "backlog item, prefer user-story titles (\"As a <role>, I "
                "can ...\" style) when the documents mention a user; "
                "otherwise concrete deliverable titles. All text in English."
            ),
            "kanban": "Produce the swimlane JSON now. All text in English.",
            "lss": "Produce the DMAIC Define JSON now. All text in English.",
            "waterfall": (
                "Produce the Waterfall phases JSON now. Prefer phase names "
                "and dates that appear in the project documents when they "
                "are present; otherwise interpolate within the project "
                "period. All text in English."
            ),
        },
    }
    pack = _blocks.get(lang, _blocks["en"])
    return pack.get(kind, pack["business_case"])


def _project_meta(project) -> dict:
    """Compact fact sheet about the project — fed to the LLM alongside
    the document prefix, so the model knows the project name/dates even
    when there are no uploaded documents."""
    return {
        "name": project.name,
        "description": (project.description or "")[:1500],
        "methodology": project.methodology or "",
        "start_date": project.start_date.isoformat() if project.start_date else None,
        "end_date": project.end_date.isoformat() if project.end_date else None,
        "today": date.today().isoformat(),
    }


def _lang_meta(language: str) -> dict:
    """Translator for small per-language strings (headings in fallback
    responses, warnings, …). The LLM itself is steered via the shared
    core.i18n_ai.prepend_language helper so this stays short."""
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
            "fallback_summary_bc": "Standard business case outline — fill in the specifics.",
            "fallback_summary_brief": "Standard project brief outline — fill in the specifics.",
            "fallback_vision": "Deliver value iteratively against the project objectives.",
            "swimlane_backend": "Backend",
            "swimlane_frontend": "Frontend",
            "swimlane_qa": "Quality & Compliance",
            "lss_problem": "Baseline process underperforms against the Voice of the Customer; needs a measurable improvement.",
            "lss_scope": "In scope: the end-to-end process from intake to delivery. Out of scope: upstream policy and downstream reporting.",
            "lss_charter": "Charter the Define phase of the DMAIC: scope, team, SIPOC, timeline.",
            "waterfall_initiation": "Initiation & setup",
            "waterfall_requirements": "Requirements elicitation",
            "waterfall_design": "Design & architecture",
            "waterfall_build": "Build & integration",
            "waterfall_test_accept": "Test & acceptance",
            "waterfall_go_live": "Go-live & handover",
        }
    if lang == "fr":
        return {
            "no_context_warning": (
                "Aucun document de projet téléversé — ce brouillon est basé "
                "uniquement sur les métadonnées du projet; téléversez un appel "
                "d'offres ou un brief pour le rendre spécifique au projet."
            ),
            "no_llm_notice": (
                "Aucune clé IA n'est configurée; renvoi d'un modèle déterministe. "
                "Modifiez les champs avant d'appliquer."
            ),
            "fallback_summary_bc": "Modèle standard de business case — complétez les détails.",
            "fallback_summary_brief": "Modèle standard de project brief — complétez les détails.",
            "fallback_vision": "Livrer de la valeur de manière itérative selon les objectifs du projet.",
            "swimlane_backend": "Back-end",
            "swimlane_frontend": "Front-end",
            "swimlane_qa": "Qualité & Conformité",
            "lss_problem": "Le processus de référence sous-performe par rapport à la voix du client; il nécessite une amélioration mesurable.",
            "lss_scope": "Dans le périmètre : le processus de bout en bout. Hors périmètre : politique en amont et reporting en aval.",
            "lss_charter": "Charter de la phase Define du DMAIC : périmètre, équipe, SIPOC, calendrier.",
            "waterfall_initiation": "Initiation & préparation",
            "waterfall_requirements": "Recueil des exigences",
            "waterfall_design": "Conception & architecture",
            "waterfall_build": "Réalisation & intégration",
            "waterfall_test_accept": "Tests & recette",
            "waterfall_go_live": "Mise en production & transfert",
        }
    return {
        "no_context_warning": (
            "Geen project-documenten geüpload — dit concept is alleen op "
            "basis van de project-metadata. Upload een tender of brief voor "
            "een projectspecifiek concept."
        ),
        "no_llm_notice": (
            "Er is geen AI-sleutel geconfigureerd; dit is een sjabloonvoorstel. "
            "Pas de velden gerust aan voordat je ze toepast."
        ),
        "fallback_summary_bc": "Standaard business-case-opzet — vul de specifieke punten aan.",
        "fallback_summary_brief": "Standaard project-brief-opzet — vul de specifieke punten aan.",
        "fallback_vision": "Lever iteratief waarde volgens de projectdoelstellingen.",
        "swimlane_backend": "Backend",
        "swimlane_frontend": "Frontend",
        "swimlane_qa": "Kwaliteit & Compliance",
        "lss_problem": "De huidige procesprestatie blijft achter op de Voice-of-the-Customer; er is een meetbare verbetering nodig.",
        "lss_scope": "In scope: het end-to-end proces van intake tot oplevering. Uit scope: upstream-beleid en downstream-rapportage.",
        "lss_charter": "Charter voor de Define-fase van DMAIC: scope, team, SIPOC, planning.",
        "waterfall_initiation": "Initiatie & inrichting",
        "waterfall_requirements": "Requirements verzamelen",
        "waterfall_design": "Ontwerp & architectuur",
        "waterfall_build": "Bouw & integratie",
        "waterfall_test_accept": "Test & acceptatie",
        "waterfall_go_live": "Livegang & overdracht",
    }


def _finalize(parsed: Optional[dict], fallback: dict,
              warnings: List[str], has_context: bool,
              lang_meta: dict) -> DraftResult:
    if parsed is not None:
        return DraftResult(suggested=parsed, source="ai", warnings=list(warnings))
    # LLM returned nothing (no key, exception, parse failure) — fall back.
    warn = list(warnings)
    warn.append(lang_meta["no_llm_notice"])
    return DraftResult(suggested=fallback, source="fallback", warnings=warn)


def _collect_warnings(has_context: bool, lang_meta: dict) -> List[str]:
    if not has_context:
        return [lang_meta["no_context_warning"]]
    return []


# =========================================================================
# S4-01  PRINCE2 Business Case
# =========================================================================

_BC_FIELDS = [
    "executive_summary", "reasons", "business_options",
    "expected_benefits", "expected_dis_benefits", "major_risks",
]


def _bc_system_prompt() -> str:
    return (
        "You draft a PRINCE2 Business Case from the project context. "
        "Return STRICT JSON, no markdown, with exactly these string keys: "
        "executive_summary, reasons, business_options, expected_benefits, "
        "expected_dis_benefits, major_risks. Each value is prose with 2-6 "
        "sentences, grounded in the project documents when available."
    )


def _bc_fallback(project, lang_meta: dict) -> dict:
    name = project.name or "project"
    return {
        "executive_summary": (
            f"{lang_meta['fallback_summary_bc']} ({name})."
        ),
        "reasons": "",
        "business_options": "",
        "expected_benefits": "",
        "expected_dis_benefits": "",
        "major_risks": "",
    }


def draft_business_case(project, user, language: str, doc_prefix: str) -> DraftResult:
    lm = _lang_meta(language)
    warnings = _collect_warnings(bool(doc_prefix), lm)
    system = _bc_system_prompt()
    from core.i18n_ai import prepend_language
    system = prepend_language(system, language)
    instructions = _draft_instructions(language, "business_case")
    user_prompt = _wrap(doc_prefix, _project_meta(project), instructions)
    parsed = _run_llm(user, system, user_prompt, _MAX_TOKENS_SMALL, surface="prince2-business-case-auto-draft")
    # Keep only the known fields, coerce to str so a mis-typed model reply can
    # still be rendered by the preview dialog.
    if isinstance(parsed, dict):
        parsed = {k: str(parsed.get(k) or "") for k in _BC_FIELDS}
        if not any(parsed.values()):
            parsed = None
    return _finalize(parsed, _bc_fallback(project, lm), warnings, bool(doc_prefix), lm)


# =========================================================================
# Milestones — methodology-agnostic. Produces 4-8 milestones with
# dates interpolated inside the project period, grounded in deliverables
# the project documents mention. Persisted on projects.Milestone by the
# propose_milestones bot tool.
# =========================================================================

def _milestones_system_prompt() -> str:
    return (
        "You produce a project milestone plan from the project context. "
        "Return STRICT JSON, no markdown, with EXACTLY this shape: "
        "{\"milestones\": [{\"name\": str, \"description\": str, "
        "\"start_date\": \"YYYY-MM-DD\", \"end_date\": \"YYYY-MM-DD\"}, …]}. "
        "Produce 4 to 8 milestones total. Dates MUST fall inside the "
        "project's start_date and end_date (both passed in the metadata). "
        "Space the milestones evenly across the period unless the "
        "uploaded documents suggest a specific cadence. Each name should "
        "be a concrete deliverable or decision gate (not 'Phase 2' — "
        "but 'Leidraad + PvE geaccepteerd' for a tender project). "
        "Order the milestones chronologically by start_date."
    )


def _milestones_fallback(project, lang_meta: dict) -> dict:
    """Deterministic 4-milestone timeline when no LLM is available."""
    from datetime import date as _date, timedelta as _td
    start = project.start_date or _date.today()
    end = project.end_date or (start + _td(days=90))
    span = (end - start).days or 90
    pts = [start + _td(days=int(span * r)) for r in (0.0, 0.33, 0.66, 1.0)]
    return {
        "milestones": [
            {"name": "Kick-off & initiatie",       "description": "", "start_date": pts[0].isoformat(), "end_date": (pts[0] + _td(days=3)).isoformat()},
            {"name": "Analyse & ontwerp",          "description": "", "start_date": pts[0].isoformat(), "end_date": pts[1].isoformat()},
            {"name": "Realisatie & test",          "description": "", "start_date": pts[1].isoformat(), "end_date": pts[2].isoformat()},
            {"name": "Oplevering & afsluiting",    "description": "", "start_date": pts[2].isoformat(), "end_date": pts[3].isoformat()},
        ]
    }


def draft_milestones(project, user, language: str, doc_prefix: str) -> DraftResult:
    lm = _lang_meta(language)
    warnings = _collect_warnings(bool(doc_prefix), lm)
    system = _milestones_system_prompt()
    from core.i18n_ai import prepend_language
    system = prepend_language(system, language)
    _tail = {
        "nl": (
            "Lever nu het mijlpalen JSON (object met \"milestones\" lijst). "
            "Datums MOETEN tussen de project start_date en end_date vallen; "
            "houd ze chronologisch. ALLE tekst in de JSON-waarden MOET in "
            "het Nederlands zijn."
        ),
        "fr": (
            "Produisez maintenant le JSON des jalons (objet avec une liste "
            "\"milestones\"). Les dates DOIVENT se situer entre start_date "
            "et end_date du projet; gardez l'ordre chronologique. TOUT en "
            "français."
        ),
        "en": (
            "Produce the milestones JSON now (object with a \"milestones\" "
            "list). Dates MUST fall between the project's start_date and "
            "end_date; keep them chronological. All text in English."
        ),
    }.get((language or "nl").lower(), None) or (
        "Produce the milestones JSON now."
    )
    user_prompt = _wrap(doc_prefix, _project_meta(project), _tail)
    parsed = _run_llm(
        user, system, user_prompt, _MAX_TOKENS_SMALL,
        surface="milestones-auto-draft", heavy=False,
    )
    # Validator — keep only rows with a valid name + both dates parseable
    # and inside the project period.
    from datetime import date as _d
    def _parse_d(v):
        try:
            return _d.fromisoformat(str(v)[:10])
        except Exception:
            return None
    p_start = project.start_date
    p_end = project.end_date
    kept = []
    if isinstance(parsed, dict) and isinstance(parsed.get("milestones"), list):
        for item in parsed["milestones"][:12]:
            if not isinstance(item, dict):
                continue
            name = str(item.get("name") or "").strip()
            if not name:
                continue
            sd = _parse_d(item.get("start_date"))
            ed = _parse_d(item.get("end_date"))
            # Snap to project bounds when outside — never silently drop
            # for being a day off; only drop when both dates unparsable.
            if sd and p_start and sd < p_start:
                sd = p_start
            if ed and p_end and ed > p_end:
                ed = p_end
            if not sd and not ed:
                sd = p_start
                ed = p_end
            if sd and ed and sd > ed:
                sd, ed = ed, sd
            kept.append({
                "name": name[:255],
                "description": str(item.get("description") or "")[:4000],
                "start_date": sd.isoformat() if sd else None,
                "end_date": ed.isoformat() if ed else None,
            })
    if kept:
        # Sort chronologically — LLMs sometimes return the wrong order.
        kept.sort(key=lambda m: (m["start_date"] or "", m["end_date"] or ""))
        return _finalize({"milestones": kept}, _milestones_fallback(project, lm), warnings, bool(doc_prefix), lm)
    return _finalize(None, _milestones_fallback(project, lm), warnings, bool(doc_prefix), lm)


# =========================================================================
# Risico-register — methodology-agnostic. Produces 4-8 realistic risks
# grounded in the uploaded project documents (tender leidraad, PvE,
# scope) + project metadata. Each risk maps 1-1 to the projects.Risk
# model so the bot tool can persist them directly.
# =========================================================================

def _risks_system_prompt() -> str:
    return (
        "You draft an initial project risk register from the project "
        "context. Return STRICT JSON, no markdown, with EXACTLY this "
        "shape: {\"risks\": [{\"name\": str, \"description\": str, "
        "\"category\": one of [Technical, Schedule, Financial, "
        "Operational, Strategic, Compliance], \"probability\": int 0-100, "
        "\"impact\": one of [High, Medium, Low], \"level\": one of "
        "[High, Medium, Low]}, …]}. Produce 4 to 8 risks total, each "
        "with a concrete, project-specific name (not 'Scope creep' in "
        "general — but 'Nvi-antwoorden Barneveld later dan planning' for "
        "a Barneveld tender project). Spread categories so the register "
        "covers more than one risk type. 'level' should reflect the "
        "combined probability+impact (High when both are high, Low when "
        "both are low, else Medium)."
    )


def _risks_fallback(project, lang_meta: dict) -> dict:
    name = (project.name or "project")[:60]
    return {
        "risks": [
            {
                "name": f"Scope creep op {name}",
                "description": (
                    "Zonder expliciet change-controle-regime kunnen "
                    "aanvullende wensen de planning en het budget "
                    "verdringen."
                ),
                "category": "Scope" if False else "Operational",
                "probability": 50, "impact": "High", "level": "High",
            },
            {
                "name": "Vertraging door NvI's / verduidelijkingsvragen",
                "description": (
                    "Latere Nota's van Inlichtingen of extra "
                    "klantvragen kunnen deliverables doorschuiven "
                    "voorbij de deadline."
                ),
                "category": "Schedule",
                "probability": 40, "impact": "Medium", "level": "Medium",
            },
            {
                "name": "Resource-conflict met andere lopende opdrachten",
                "description": (
                    "Dezelfde senior-rollen zijn ook op andere projecten "
                    "ingezet — overlap kan tot kwaliteitsverlies leiden."
                ),
                "category": "Operational",
                "probability": 35, "impact": "Medium", "level": "Medium",
            },
            {
                "name": "Compliance-eisen onderschat",
                "description": (
                    "Als specifieke keurmerk-/privacy-eisen pas laat "
                    "boven water komen, moet de oplossing herontworpen "
                    "worden."
                ),
                "category": "Compliance",
                "probability": 25, "impact": "High", "level": "Medium",
            },
        ]
    }


def draft_risks(project, user, language: str, doc_prefix: str) -> DraftResult:
    lm = _lang_meta(language)
    warnings = _collect_warnings(bool(doc_prefix), lm)
    system = _risks_system_prompt()
    from core.i18n_ai import prepend_language
    system = prepend_language(system, language)
    # Reuse the business_case tail but swap the "register" wording in-line
    # so NL/EN/FR instructions stay consistent in tone.
    _tail = {
        "nl": (
            "Lever nu het risico-register JSON (object met \"risks\" lijst). "
            "Baseer namen en beschrijvingen op de geüploade documenten "
            "wanneer die er zijn — anders op de projectmetadata. ALLE tekst "
            "in de JSON-waarden MOET in het Nederlands zijn."
        ),
        "fr": (
            "Produisez maintenant le JSON du registre des risques (objet "
            "avec une liste \"risks\"). Fondez noms et descriptions sur "
            "les documents téléversés quand ils existent — sinon sur les "
            "métadonnées du projet. TOUT le texte en français."
        ),
        "en": (
            "Produce the risk register JSON now (object with a \"risks\" "
            "list). Ground names and descriptions in the uploaded documents "
            "when available — otherwise in project metadata. All text in "
            "English."
        ),
    }.get((language or "nl").lower(), None) or (
        "Produce the risk register JSON now."
    )
    user_prompt = _wrap(doc_prefix, _project_meta(project), _tail)
    parsed = _run_llm(
        user, system, user_prompt, _MAX_TOKENS_SMALL,
        surface="risk-register-auto-draft", heavy=False,
    )
    # Validate the shape — we expect {"risks": [{…}, …]} with at least 1 item.
    if isinstance(parsed, dict) and isinstance(parsed.get("risks"), list) and parsed["risks"]:
        kept = []
        for item in parsed["risks"][:12]:  # hard cap on quantity
            if not isinstance(item, dict):
                continue
            name = str(item.get("name") or "").strip()
            desc = str(item.get("description") or "").strip()
            if not name or not desc:
                continue
            cat = str(item.get("category") or "Operational").strip()
            if cat not in {"Technical", "Schedule", "Financial", "Operational", "Strategic", "Compliance"}:
                cat = "Operational"
            try:
                prob = int(item.get("probability") or 0)
                prob = max(0, min(100, prob))
            except (TypeError, ValueError):
                prob = 50
            impact = str(item.get("impact") or "Medium").title()
            if impact not in {"High", "Medium", "Low"}:
                impact = "Medium"
            level = str(item.get("level") or impact).title()
            if level not in {"High", "Medium", "Low"}:
                level = impact
            kept.append({
                "name": name[:255], "description": desc,
                "category": cat, "probability": prob,
                "impact": impact, "level": level,
            })
        if kept:
            return _finalize({"risks": kept}, _risks_fallback(project, lm), warnings, bool(doc_prefix), lm)
    return _finalize(None, _risks_fallback(project, lm), warnings, bool(doc_prefix), lm)


# =========================================================================
# S4-02  PRINCE2 Project Brief
# =========================================================================

_PB_FIELDS = [
    "project_definition", "business_case_outline",
    "project_product_description", "project_approach",
]


def _pb_system_prompt() -> str:
    return (
        "You draft a PRINCE2 Project Brief from the project context. "
        "Return STRICT JSON, no markdown, with exactly these string keys: "
        "project_definition, business_case_outline, project_product_description, "
        "project_approach. Each value is prose with 2-6 sentences."
    )


def _pb_fallback(project, lang_meta: dict) -> dict:
    return {
        "project_definition": (
            f"{lang_meta['fallback_summary_brief']} ({project.name})."
        ),
        "business_case_outline": "",
        "project_product_description": "",
        "project_approach": "",
    }


def draft_project_brief(project, user, language: str, doc_prefix: str) -> DraftResult:
    lm = _lang_meta(language)
    warnings = _collect_warnings(bool(doc_prefix), lm)
    system = _pb_system_prompt()
    from core.i18n_ai import prepend_language
    system = prepend_language(system, language)
    instructions = _draft_instructions(language, "project_brief")
    user_prompt = _wrap(doc_prefix, _project_meta(project), instructions)
    parsed = _run_llm(user, system, user_prompt, _MAX_TOKENS_SMALL, surface="prince2-project-brief-auto-draft")
    if isinstance(parsed, dict):
        parsed = {k: str(parsed.get(k) or "") for k in _PB_FIELDS}
        if not any(parsed.values()):
            parsed = None
    return _finalize(parsed, _pb_fallback(project, lm), warnings, bool(doc_prefix), lm)


# =========================================================================
# S4-03  Scrum Vision + Backlog
# =========================================================================

_SCRUM_PRIORITIES = {"critical", "high", "medium", "low"}


def _scrum_system_prompt() -> str:
    return (
        "You draft a Scrum product vision and an initial product backlog "
        "from the project context. Return STRICT JSON, no markdown, with "
        "this shape: {\"vision\": str, \"backlog_items\": [{\"title\": str, "
        "\"description\": str, \"priority\": \"critical|high|medium|low\", "
        "\"acceptance_criteria\": str (optional)}]}. Produce 10-20 backlog "
        "items — bias to small, user-outcome user stories. The vision is one "
        "paragraph."
    )


def _scrum_fallback(project, lang_meta: dict) -> dict:
    return {
        "vision": lang_meta["fallback_vision"],
        "backlog_items": [
            {"title": "Kick-off en teaminrichting", "description": "", "priority": "high"},
            {"title": "Backlog verfijnen met stakeholders", "description": "", "priority": "high"},
            {"title": "Definition of Done afspreken", "description": "", "priority": "high"},
            {"title": "Eerste increment opleveren", "description": "", "priority": "medium"},
            {"title": "Stakeholder-review Sprint 1", "description": "", "priority": "medium"},
        ],
    }


def _coerce_scrum(parsed: dict) -> Optional[dict]:
    vision = str(parsed.get("vision") or "").strip()
    raw_items = parsed.get("backlog_items") or []
    if not isinstance(raw_items, list):
        raw_items = []
    items: List[Dict[str, Any]] = []
    for it in raw_items[:30]:
        if not isinstance(it, dict):
            continue
        title = str(it.get("title") or "").strip()[:300]
        if not title:
            continue
        prio = it.get("priority") or "medium"
        if prio not in _SCRUM_PRIORITIES:
            prio = "medium"
        row = {
            "title": title,
            "description": str(it.get("description") or "")[:2000],
            "priority": prio,
        }
        ac = it.get("acceptance_criteria")
        if ac:
            row["acceptance_criteria"] = str(ac)[:2000]
        items.append(row)
    if not vision and not items:
        return None
    return {"vision": vision, "backlog_items": items}


def draft_scrum(project, user, language: str, doc_prefix: str) -> DraftResult:
    lm = _lang_meta(language)
    warnings = _collect_warnings(bool(doc_prefix), lm)
    system = _scrum_system_prompt()
    from core.i18n_ai import prepend_language
    system = prepend_language(system, language)
    instructions = _draft_instructions(language, "scrum")
    user_prompt = _wrap(doc_prefix, _project_meta(project), instructions)
    parsed = _run_llm(user, system, user_prompt, _MAX_TOKENS_LARGE, surface="scrum-auto-draft")
    coerced = _coerce_scrum(parsed) if isinstance(parsed, dict) else None
    return _finalize(coerced, _scrum_fallback(project, lm), warnings, bool(doc_prefix), lm)


# =========================================================================
# S4-04  Kanban swimlanes
# =========================================================================

_HEX_DEFAULT = "#6366f1"


def _kanban_system_prompt() -> str:
    return (
        "You classify a project's deliverables into logical kanban "
        "swimlanes. Return STRICT JSON, no markdown: {\"swimlanes\": "
        "[{\"name\": str, \"description\": str, \"color_hex\": \"#RRGGBB\"}]}. "
        "Produce 3-6 swimlanes. Names must be short (<=24 chars), one noun "
        "phrase each. Prefer domain-specific names derived from the uploaded "
        "documents (e.g. \"Backend\", \"Compliance\", \"Field roll-out\")."
    )


def _kanban_fallback(lang_meta: dict) -> dict:
    return {
        "swimlanes": [
            {"name": lang_meta["swimlane_backend"], "description": "", "color_hex": "#6366f1"},
            {"name": lang_meta["swimlane_frontend"], "description": "", "color_hex": "#8b5cf6"},
            {"name": lang_meta["swimlane_qa"], "description": "", "color_hex": "#10b981"},
        ],
    }


def _coerce_hex(s: Any) -> str:
    try:
        v = str(s or "").strip()
        if len(v) == 7 and v.startswith("#") and all(c in "0123456789abcdefABCDEF" for c in v[1:]):
            return v
    except Exception:
        pass
    return _HEX_DEFAULT


def _coerce_kanban(parsed: dict) -> Optional[dict]:
    raw = parsed.get("swimlanes") or []
    if not isinstance(raw, list):
        return None
    out: List[Dict[str, Any]] = []
    for s in raw[:10]:
        if not isinstance(s, dict):
            continue
        name = str(s.get("name") or "").strip()[:24]
        if not name:
            continue
        out.append({
            "name": name,
            "description": str(s.get("description") or "")[:500],
            "color_hex": _coerce_hex(s.get("color_hex")),
        })
    if not out:
        return None
    return {"swimlanes": out}


def draft_kanban_swimlanes(project, user, language: str, doc_prefix: str) -> DraftResult:
    lm = _lang_meta(language)
    warnings = _collect_warnings(bool(doc_prefix), lm)
    system = _kanban_system_prompt()
    from core.i18n_ai import prepend_language
    system = prepend_language(system, language)
    instructions = _draft_instructions(language, "kanban")
    user_prompt = _wrap(doc_prefix, _project_meta(project), instructions)
    parsed = _run_llm(user, system, user_prompt, _MAX_TOKENS_SMALL, surface="kanban-swimlanes-auto-draft", heavy=False)
    coerced = _coerce_kanban(parsed) if isinstance(parsed, dict) else None
    return _finalize(coerced, _kanban_fallback(lm), warnings, bool(doc_prefix), lm)


# =========================================================================
# S4-05  LSS DMAIC Define phase
# =========================================================================

_LSS_SIPOC_KEYS = ("suppliers", "inputs", "process", "outputs", "customers")


def _lss_system_prompt() -> str:
    return (
        "You draft the Define phase of a Lean Six Sigma (DMAIC) project from "
        "the project context. Return STRICT JSON, no markdown, with the shape: "
        "{\"problem_statement\": str, \"scope\": str, \"sipoc\": {"
        "\"suppliers\": [str], \"inputs\": [str], \"process\": [str], "
        "\"outputs\": [str], \"customers\": [str]}, "
        "\"project_charter\": str}. SIPOC lists have 2-5 items each; prose "
        "fields are 2-6 sentences."
    )


def _lss_fallback(lang_meta: dict) -> dict:
    return {
        "problem_statement": lang_meta["lss_problem"],
        "scope": lang_meta["lss_scope"],
        "sipoc": {
            "suppliers": [], "inputs": [], "process": [],
            "outputs": [], "customers": [],
        },
        "project_charter": lang_meta["lss_charter"],
    }


def _coerce_lss(parsed: dict) -> Optional[dict]:
    problem = str(parsed.get("problem_statement") or "").strip()
    scope = str(parsed.get("scope") or "").strip()
    charter = str(parsed.get("project_charter") or "").strip()
    sipoc_raw = parsed.get("sipoc") or {}
    sipoc = {}
    for k in _LSS_SIPOC_KEYS:
        v = sipoc_raw.get(k) if isinstance(sipoc_raw, dict) else None
        if isinstance(v, list):
            sipoc[k] = [str(x)[:500] for x in v[:10] if str(x).strip()]
        else:
            sipoc[k] = []
    if not any([problem, scope, charter]) and not any(sipoc.values()):
        return None
    return {
        "problem_statement": problem,
        "scope": scope,
        "sipoc": sipoc,
        "project_charter": charter,
    }


def draft_lss_define(project, user, language: str, doc_prefix: str) -> DraftResult:
    lm = _lang_meta(language)
    warnings = _collect_warnings(bool(doc_prefix), lm)
    system = _lss_system_prompt()
    from core.i18n_ai import prepend_language
    system = prepend_language(system, language)
    instructions = _draft_instructions(language, "lss")
    user_prompt = _wrap(doc_prefix, _project_meta(project), instructions)
    parsed = _run_llm(user, system, user_prompt, _MAX_TOKENS_SMALL, surface="lss-define-auto-draft")
    coerced = _coerce_lss(parsed) if isinstance(parsed, dict) else None
    return _finalize(coerced, _lss_fallback(lm), warnings, bool(doc_prefix), lm)


# =========================================================================
# S4-06  Waterfall phases
# =========================================================================

def _wf_system_prompt() -> str:
    return (
        "You extract/propose Waterfall phases from the project timing data in "
        "the uploaded documents. Return STRICT JSON, no markdown, with the "
        "shape: {\"phases\": [{\"name\": str, \"start_date\": \"YYYY-MM-DD\", "
        "\"end_date\": \"YYYY-MM-DD\", \"deliverables\": [str], "
        "\"gate_criteria\": str}]}. Produce 4-6 phases. All dates fall within "
        "the project period if that is known."
    )


def _wf_fallback(project, lang_meta: dict) -> dict:
    start = project.start_date or date.today()
    end = project.end_date if (project.end_date and project.end_date > start) else start + timedelta(days=84)
    span = (end - start).days
    def d(f):
        return (start + timedelta(days=round(span * f))).isoformat()
    phases = [
        (lang_meta["waterfall_initiation"], 0.0, 0.1),
        (lang_meta["waterfall_requirements"], 0.1, 0.3),
        (lang_meta["waterfall_design"], 0.3, 0.5),
        (lang_meta["waterfall_build"], 0.5, 0.75),
        (lang_meta["waterfall_test_accept"], 0.75, 0.9),
        (lang_meta["waterfall_go_live"], 0.9, 1.0),
    ]
    return {
        "phases": [
            {
                "name": name,
                "start_date": d(f0),
                "end_date": d(f1),
                "deliverables": [],
                "gate_criteria": "",
            }
            for name, f0, f1 in phases
        ],
    }


def _coerce_waterfall(parsed: dict) -> Optional[dict]:
    raw = parsed.get("phases") or []
    if not isinstance(raw, list):
        return None
    out: List[Dict[str, Any]] = []
    for p in raw[:12]:
        if not isinstance(p, dict):
            continue
        name = str(p.get("name") or "").strip()[:100]
        if not name:
            continue
        deliverables = p.get("deliverables") or []
        if not isinstance(deliverables, list):
            deliverables = []
        row = {
            "name": name,
            "start_date": str(p.get("start_date") or "")[:10] or None,
            "end_date": str(p.get("end_date") or "")[:10] or None,
            "deliverables": [str(x)[:500] for x in deliverables[:20] if str(x).strip()],
            "gate_criteria": str(p.get("gate_criteria") or "")[:2000],
        }
        out.append(row)
    if not out:
        return None
    return {"phases": out}


def draft_waterfall_phases(project, user, language: str, doc_prefix: str) -> DraftResult:
    lm = _lang_meta(language)
    warnings = _collect_warnings(bool(doc_prefix), lm)
    system = _wf_system_prompt()
    from core.i18n_ai import prepend_language
    system = prepend_language(system, language)
    instructions = _draft_instructions(language, "waterfall")
    user_prompt = _wrap(doc_prefix, _project_meta(project), instructions)
    parsed = _run_llm(user, system, user_prompt, _MAX_TOKENS_SMALL, surface="waterfall-phases-auto-draft")
    coerced = _coerce_waterfall(parsed) if isinstance(parsed, dict) else None
    return _finalize(coerced, _wf_fallback(project, lm), warnings, bool(doc_prefix), lm)
