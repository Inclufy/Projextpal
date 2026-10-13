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
from dataclasses import dataclass, field
from datetime import date, timedelta
from typing import Any, Dict, List, Optional

logger = logging.getLogger(__name__)

ANTHROPIC_MODEL = "claude-opus-4-7"
OPENAI_MODEL = "gpt-4o-mini"

_MAX_TOKENS_LARGE = 4000  # Scrum vision + 20 backlog items
_MAX_TOKENS_SMALL = 2000


# =========================================================================
# Shared internals
# =========================================================================

def _strip_fences(raw: str) -> str:
    cleaned = (raw or "").strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```", 2)[1]
        if cleaned.lower().startswith("json"):
            cleaned = cleaned[4:]
        cleaned = cleaned.strip()
    return cleaned


def _parse_json(raw: str) -> Optional[dict]:
    try:
        data = json.loads(_strip_fences(raw))
    except Exception:
        return None
    if not isinstance(data, dict):
        return None
    return data


def _call_anthropic(company, system: str, user_prompt: str,
                    max_tokens: int = _MAX_TOKENS_SMALL) -> Optional[dict]:
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
        return _parse_json(raw)
    except Exception as e:
        logger.info("methodology_autodrafts anthropic failed: %s", e)
        return None


def _call_openai(company, system: str, user_prompt: str,
                 max_tokens: int = _MAX_TOKENS_SMALL) -> Optional[dict]:
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
            from core import ai_usage
            ai_usage.record(getattr(company, "id", None), total, provider="openai")
        except Exception:
            pass
        return _parse_json(resp.choices[0].message.content or "")
    except Exception as e:
        logger.info("methodology_autodrafts openai failed: %s", e)
        return None


def _run_llm(user, system: str, user_prompt: str,
             max_tokens: int = _MAX_TOKENS_SMALL) -> Optional[dict]:
    """Anthropic → OpenAI ladder. Returns parsed dict or None."""
    company = getattr(user, "company", None)
    parsed = _call_anthropic(company, system, user_prompt, max_tokens)
    if parsed is not None:
        return parsed
    return _call_openai(company, system, user_prompt, max_tokens)


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
            "Geen project-documenten geüpload — resultaat is op basis van "
            "project-metadata only. Upload een tender/brief voor een "
            "projectspecifiek concept."
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


def _wrap(doc_prefix: str, meta: dict, instructions: str) -> str:
    """Assemble the user-prompt body: project meta + optional document
    prefix + instructions. The document prefix (already carrying its own
    [PROJECT_DOCUMENTEN]/[PROJECT_DOCUMENTS] header) stays verbatim."""
    body = (
        f"Project metadata:\n{json.dumps(meta, ensure_ascii=False)}\n\n"
    )
    if doc_prefix:
        body = f"{doc_prefix}{body}"
    return f"{body}{instructions}"


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
    instructions = (
        "Produce the Business Case JSON now. Keep claims consistent with the "
        "uploaded documents (if any) and the project metadata. Do not invent "
        "concrete financial numbers; narrate benefits qualitatively."
    )
    user_prompt = _wrap(doc_prefix, _project_meta(project), instructions)
    parsed = _run_llm(user, system, user_prompt, _MAX_TOKENS_SMALL)
    # Keep only the known fields, coerce to str so a mis-typed model reply can
    # still be rendered by the preview dialog.
    if isinstance(parsed, dict):
        parsed = {k: str(parsed.get(k) or "") for k in _BC_FIELDS}
        if not any(parsed.values()):
            parsed = None
    return _finalize(parsed, _bc_fallback(project, lm), warnings, bool(doc_prefix), lm)


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
    instructions = (
        "Produce the Project Brief JSON now. Ground project_definition and "
        "project_approach in the uploaded documents when available; keep the "
        "business_case_outline short (3-4 sentences)."
    )
    user_prompt = _wrap(doc_prefix, _project_meta(project), instructions)
    parsed = _run_llm(user, system, user_prompt, _MAX_TOKENS_SMALL)
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
    instructions = (
        "Produce the Scrum vision + backlog JSON now. For each backlog item, "
        "prefer user-story titles (\"As a <role>, I can …\" style) when the "
        "documents mention a user; otherwise concrete deliverable titles."
    )
    user_prompt = _wrap(doc_prefix, _project_meta(project), instructions)
    parsed = _run_llm(user, system, user_prompt, _MAX_TOKENS_LARGE)
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
    instructions = "Produce the swimlane JSON now."
    user_prompt = _wrap(doc_prefix, _project_meta(project), instructions)
    parsed = _run_llm(user, system, user_prompt, _MAX_TOKENS_SMALL)
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
    instructions = "Produce the DMAIC Define JSON now."
    user_prompt = _wrap(doc_prefix, _project_meta(project), instructions)
    parsed = _run_llm(user, system, user_prompt, _MAX_TOKENS_SMALL)
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
    instructions = (
        "Produce the Waterfall phases JSON now. Prefer phase names + dates "
        "that appear in the project documents when they are present; "
        "otherwise interpolate within the project period."
    )
    user_prompt = _wrap(doc_prefix, _project_meta(project), instructions)
    parsed = _run_llm(user, system, user_prompt, _MAX_TOKENS_SMALL)
    coerced = _coerce_waterfall(parsed) if isinstance(parsed, dict) else None
    return _finalize(coerced, _wf_fallback(project, lm), warnings, bool(doc_prefix), lm)
