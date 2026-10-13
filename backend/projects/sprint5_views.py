"""Sprint 5 — proactive-AI endpoints (S5-01..S5-09, minus deploy S5-10).

Every endpoint shares the Sprint 4 contract: ``{suggested, source,
warnings}`` for anything that produces a draft; S5-01 / S5-02 return
a lightweight ``{flags|tags, source}`` since they persist directly.

Shared behaviour (ai_draft_shared):
  * Anthropic → OpenAI → deterministic fallback ladder
  * ai_usage.record() on every real LLM hit
  * resolve_ui_language(request) → NL/EN/FR
  * Tenant-safe via ``_get_project(request, pk)`` that reuses the
    existing ``accessible_project_ids()`` queryset.

LLM responses are never auto-persisted — the frontend owns the preview
dialog and only the user's final "Apply" writes to the DB.
"""
from __future__ import annotations

import json
import logging
from datetime import date, timedelta
from typing import Any, Dict, List, Optional

from rest_framework.decorators import api_view, permission_classes, throttle_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.throttling import ScopedRateThrottle
from django.utils import timezone

from core.throttles import AiContextThrottle

from .models import Project, ProjectAIContext, ProjectTeam, Risk, Milestone, Task
from .ai_draft_shared import (
    DraftResult,
    MAX_TOKENS_SMALL,
    MAX_TOKENS_LARGE,
    run_llm,
    wrap_prompt,
    finalize,
    sprint5_lang_meta,
)
from .compliance_scan import scan_text as compliance_scan_text

logger = logging.getLogger(__name__)


# =========================================================================
# Shared throttle + tenant resolver
# =========================================================================

class _AiThrottle(ScopedRateThrottle):
    """Reuse the shared `ai` throttle scope — same as the Sprint 4 drafts."""

    def allow_request(self, request, view):
        setattr(view, "throttle_scope", "ai")
        return super().allow_request(request, view)


def _get_project(request, pk):
    """Return a Project reachable by the caller — tenant isolation.

    Reuses ``accessible_project_ids(user)`` so a user in company A cannot
    reach a project in company B even if the pk is correct.
    """
    from .role_views import accessible_project_ids
    try:
        pk = int(pk)
    except (TypeError, ValueError):
        return None
    return Project.objects.filter(id=pk, id__in=accessible_project_ids(request.user)).first()


def _project_meta(project) -> dict:
    """Compact fact sheet about a project — same shape as Sprint 4's
    _project_meta so the LLM gets consistent context across both sprints."""
    return {
        "id": project.id,
        "name": project.name,
        "description": (project.description or "")[:1500],
        "methodology": project.methodology or "",
        "project_type": project.project_type or "",
        "status": project.status or "",
        "start_date": project.start_date.isoformat() if project.start_date else None,
        "end_date": project.end_date.isoformat() if project.end_date else None,
        "today": date.today().isoformat(),
    }


def _doc_prefix(user, project_id, language):
    """Fetch the uploaded-documents system-prompt prefix (if any)."""
    try:
        from core.ai_context_helpers import get_project_context_prefix
        return get_project_context_prefix(user, project_id, language, surface="sprint5")
    except Exception:
        return ""


def _attach_language(system: str, language: str) -> str:
    try:
        from core.i18n_ai import prepend_language
        return prepend_language(system, language)
    except Exception:
        return system


# =========================================================================
# S5-01  Compliance scan + flag persistence
# =========================================================================

@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([_AiThrottle, AiContextThrottle])
def compliance_rescan(request, pk):
    """POST /api/v1/projects/<pk>/compliance/rescan/

    Deterministic re-scan of ProjectAIContext.extracted_text. Returns
    ``{flags: [...], source: 'deterministic'}``. Persists to
    ``Project.compliance_flags`` so the UI banner stays accurate.
    """
    project = _get_project(request, pk)
    if not project:
        return Response({"detail": "Project not found or not accessible."}, status=404)

    text = ""
    try:
        ctx = ProjectAIContext.objects.filter(project=project, enabled=True).first()
        if ctx:
            text = ctx.extracted_text or ""
    except Exception:
        text = ""

    flags = compliance_scan_text(text)
    if list(project.compliance_flags or []) != flags:
        project.compliance_flags = flags
        try:
            project.save(update_fields=["compliance_flags", "updated_at"])
        except Exception:
            project.save()

    return Response({
        "flags": flags,
        "source": "deterministic",
        "has_context": bool(text),
    })


# =========================================================================
# S5-02  Auto-tag project
# =========================================================================

def _tag_fallback(project) -> List[str]:
    """Deterministic fallback tags when no LLM key is available."""
    tags: List[str] = []
    if project.methodology:
        tags.append(project.methodology)
    if project.project_type:
        tags.append(project.project_type)
    # Compliance flags double as useful tags.
    for flag in (project.compliance_flags or [])[:3]:
        tags.append(flag)
    # De-dup while preserving order; cap at 5.
    seen: set[str] = set()
    out: List[str] = []
    for t in tags:
        if t and t not in seen:
            seen.add(t)
            out.append(t)
    return out[:5]


def _coerce_tags(parsed: Optional[dict]) -> Optional[List[str]]:
    if not isinstance(parsed, dict):
        return None
    raw = parsed.get("tags")
    if not isinstance(raw, list):
        return None
    out: List[str] = []
    for item in raw:
        s = str(item or "").strip()
        if not s:
            continue
        # Keep tags short; strip hashes / colons.
        s = s.lstrip("#").strip()[:40]
        if s:
            out.append(s)
    out = out[:5]
    return out if out else None


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([_AiThrottle, AiContextThrottle])
def project_auto_tag(request, pk):
    """POST /api/v1/projects/<pk>/auto-tag/

    LLM generates 3-5 short tags from ProjectAIContext + project metadata.
    Response: ``{tags: [...], source: 'ai'|'fallback', warnings: [...]}``.
    Persists to ``Project.ai_suggested_tags``.
    """
    project = _get_project(request, pk)
    if not project:
        return Response({"detail": "Project not found or not accessible."}, status=404)

    from core.i18n_ai import resolve_ui_language
    language = resolve_ui_language(request)
    lm = sprint5_lang_meta(language)
    doc_prefix = _doc_prefix(request.user, pk, language)
    warnings: List[str] = []
    if not doc_prefix:
        warnings.append(lm["no_context_warning"])

    system = (
        "You generate 3-5 short, lower-case tags for a project from the "
        "available context. Return STRICT JSON: {\"tags\": [str, ...]}. "
        "Tags must be nouns or short noun-phrases, max 3 words each, no "
        "duplicates, no leading '#'."
    )
    system = _attach_language(system, language)
    instructions = (
        "Produce the tag JSON now. Prefer the domain words that appear in "
        "the uploaded documents when available; otherwise base tags on the "
        "project's methodology and type."
    )
    user_prompt = wrap_prompt(doc_prefix, _project_meta(project), instructions)
    parsed = run_llm(request.user, system, user_prompt, MAX_TOKENS_SMALL)
    tags = _coerce_tags(parsed)

    if tags is None:
        tags = _tag_fallback(project)
        source = "fallback"
        warnings.append(lm["no_llm_notice"])
    else:
        source = "ai"

    project.ai_suggested_tags = tags
    try:
        project.save(update_fields=["ai_suggested_tags", "updated_at"])
    except Exception:
        project.save()

    return Response({"tags": tags, "source": source, "warnings": warnings})


# =========================================================================
# S5-03  Status report AI-draft
# =========================================================================

_STATUS_REPORT_FIELDS = (
    "headline", "summary", "period_start", "period_end",
    "highlights", "risks", "actions_required",
)


def _status_report_signals(project) -> dict:
    """Light fact-sheet: milestones, time entries, open risks. Fed to the
    LLM alongside the document prefix."""
    today = timezone.now().date()
    period_start = today - timedelta(days=7)

    milestones_recent = list(
        Milestone.objects.filter(project=project)
        .order_by("-updated_at")
        .values("name", "status", "end_date")[:10]
    )
    tasks_done = list(
        Task.objects.filter(
            milestone__project=project, status="done",
            updated_at__date__gte=period_start,
        ).order_by("-updated_at").values_list("title", flat=True)[:10]
    )
    open_risks = list(
        Risk.objects.filter(project=project, status="Open")
        .order_by("-created_at")
        .values("name", "level", "category")[:10]
    )

    # Time entries — count + hours. We avoid dragging the model if it is
    # not available in a cut-down test env.
    hours_logged = 0
    try:
        from .models import TimeEntry
        agg = TimeEntry.objects.filter(
            project=project, date__gte=period_start,
        ).values_list("hours", flat=True)
        hours_logged = float(sum(float(h or 0) for h in agg))
    except Exception:
        hours_logged = 0

    return {
        "period_start": period_start.isoformat(),
        "period_end": today.isoformat(),
        "milestones_recent": [
            {"name": m["name"], "status": m["status"],
             "end_date": m["end_date"].isoformat() if m["end_date"] else None}
            for m in milestones_recent
        ],
        "tasks_done_last_7_days": list(tasks_done),
        "open_risks": [
            {"name": r["name"], "level": r["level"], "category": r["category"]}
            for r in open_risks
        ],
        "hours_logged_last_7_days": hours_logged,
    }


def _coerce_status_report(parsed: Optional[dict]) -> Optional[dict]:
    if not isinstance(parsed, dict):
        return None
    out = {k: parsed.get(k) for k in _STATUS_REPORT_FIELDS}
    # Coerce prose
    out["headline"] = str(out.get("headline") or "")[:200]
    out["summary"] = str(out.get("summary") or "")[:5000]
    for k in ("period_start", "period_end"):
        v = out.get(k) or ""
        out[k] = str(v)[:10] if v else ""
    # Coerce list fields
    for k in ("highlights", "risks", "actions_required"):
        v = out.get(k) or []
        if not isinstance(v, list):
            v = []
        out[k] = [str(x)[:500] for x in v[:20] if str(x).strip()]
    if not any([out["headline"], out["summary"], out["highlights"],
                out["risks"], out["actions_required"]]):
        return None
    return out


def _status_report_fallback(project, signals: dict, lm: dict) -> dict:
    hs = signals.get("tasks_done_last_7_days") or []
    risks = [f"{r['name']} ({r['level']})" for r in signals.get("open_risks", [])]
    headline = f"{project.name} — {signals['period_end']}"
    return {
        "headline": headline[:200],
        "summary": lm["status_report_fallback_summary"],
        "period_start": signals["period_start"],
        "period_end": signals["period_end"],
        "highlights": hs,
        "risks": risks,
        "actions_required": [],
    }


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([_AiThrottle, AiContextThrottle])
def status_report_ai_draft(request, pk):
    """POST /api/v1/projects/<pk>/status-reports/auto-draft/

    Returns ``{suggested, source, warnings}``.
    """
    project = _get_project(request, pk)
    if not project:
        return Response({"detail": "Project not found or not accessible."}, status=404)

    from core.i18n_ai import resolve_ui_language
    language = resolve_ui_language(request)
    lm = sprint5_lang_meta(language)
    doc_prefix = _doc_prefix(request.user, pk, language)
    warnings: List[str] = []
    if not doc_prefix:
        warnings.append(lm["no_context_warning"])

    signals = _status_report_signals(project)
    system = (
        "You draft a one-page status report. Return STRICT JSON with these "
        "keys: headline (one line), summary (3-6 sentences), period_start "
        "(YYYY-MM-DD), period_end (YYYY-MM-DD), highlights (array of short "
        "strings), risks (array of short strings), actions_required (array "
        "of short strings). The highlights/risks/actions arrays each hold "
        "3-6 items."
    )
    system = _attach_language(system, language)
    instructions = (
        "Produce the status-report JSON now. Period defaults to the last 7 "
        "days unless the signals say otherwise. Ground highlights in the "
        "task/milestone signals and risks in the open-risks list."
    )
    meta = _project_meta(project)
    meta["signals"] = signals
    user_prompt = wrap_prompt(doc_prefix, meta, instructions)

    parsed = run_llm(request.user, system, user_prompt, MAX_TOKENS_SMALL)
    coerced = _coerce_status_report(parsed)
    fallback = _status_report_fallback(project, signals, lm)
    result = finalize(coerced, fallback, warnings, lm)
    return Response(result.as_dict())


# =========================================================================
# S5-04  Risk / dependency sniff
# =========================================================================

def _coerce_risk_sniff(parsed: Optional[dict]) -> Optional[dict]:
    if not isinstance(parsed, dict):
        return None
    sr_raw = parsed.get("suggested_risks") or []
    sd_raw = parsed.get("suggested_dependencies") or []
    if not isinstance(sr_raw, list):
        sr_raw = []
    if not isinstance(sd_raw, list):
        sd_raw = []
    allowed_cat = {"Technical", "Schedule", "Financial", "Operational",
                   "Strategic", "Compliance"}
    allowed_impact = {"High", "Medium", "Low"}
    risks: List[Dict[str, Any]] = []
    for r in sr_raw[:20]:
        if not isinstance(r, dict):
            continue
        name = str(r.get("name") or "").strip()[:255]
        if not name:
            continue
        cat = r.get("category") or "Operational"
        if cat not in allowed_cat:
            cat = "Operational"
        impact = r.get("impact") or "Medium"
        if impact not in allowed_impact:
            impact = "Medium"
        try:
            probability = int(r.get("probability") or 50)
        except (TypeError, ValueError):
            probability = 50
        probability = max(0, min(100, probability))
        risks.append({
            "name": name,
            "description": str(r.get("description") or "")[:2000],
            "category": cat,
            "impact": impact,
            "probability": probability,
            "mitigation_hint": str(r.get("mitigation_hint") or "")[:2000],
        })

    deps: List[Dict[str, Any]] = []
    for d in sd_raw[:20]:
        if not isinstance(d, dict):
            continue
        name = str(d.get("name") or "").strip()[:255]
        if not name:
            continue
        row: Dict[str, Any] = {
            "name": name,
            "description": str(d.get("description") or "")[:2000],
        }
        bm = d.get("blocking_milestone")
        if bm:
            row["blocking_milestone"] = str(bm)[:255]
        deps.append(row)
    if not risks and not deps:
        return None
    return {"suggested_risks": risks, "suggested_dependencies": deps}


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([_AiThrottle, AiContextThrottle])
def risk_sniff(request, pk):
    """POST /api/v1/projects/<pk>/risk-sniff/

    LLM scans the project's uploaded documents for risks and dependencies
    that haven't been explicitly logged yet.
    """
    project = _get_project(request, pk)
    if not project:
        return Response({"detail": "Project not found or not accessible."}, status=404)

    from core.i18n_ai import resolve_ui_language
    language = resolve_ui_language(request)
    lm = sprint5_lang_meta(language)
    doc_prefix = _doc_prefix(request.user, pk, language)
    warnings: List[str] = []
    if not doc_prefix:
        warnings.append(lm["no_context_warning"])

    system = (
        "You identify project risks and dependencies that are implied or "
        "mentioned in the uploaded documents but not yet captured. Return "
        "STRICT JSON: {\"suggested_risks\": [{\"name\": str, \"description\": "
        "str, \"category\": \"Technical|Schedule|Financial|Operational|"
        "Strategic|Compliance\", \"impact\": \"High|Medium|Low\", "
        "\"probability\": 0-100, \"mitigation_hint\": str}], "
        "\"suggested_dependencies\": [{\"name\": str, \"description\": str, "
        "\"blocking_milestone\": str (optional)}]}. Produce 3-8 of each."
    )
    system = _attach_language(system, language)
    instructions = "Produce the risk/dependency sniff JSON now."
    user_prompt = wrap_prompt(doc_prefix, _project_meta(project), instructions)

    parsed = run_llm(request.user, system, user_prompt, MAX_TOKENS_LARGE)
    coerced = _coerce_risk_sniff(parsed)
    fallback = {"suggested_risks": [], "suggested_dependencies": []}
    if coerced is None:
        warnings.append(lm["risk_sniff_no_findings"])
    result = finalize(coerced, fallback, warnings, lm)
    return Response(result.as_dict())


# =========================================================================
# S5-06  Team-match suggestion
# =========================================================================

def _list_candidate_members(project) -> List[dict]:
    """All active, non-archived company users that could be matched."""
    from django.contrib.auth import get_user_model
    User = get_user_model()
    company = project.company
    users = User.objects.filter(company=company, is_active=True)
    out: List[dict] = []
    for u in users[:200]:
        past_methodologies: List[str] = []
        past_types: List[str] = []
        try:
            # ProjectTeam gives us the user's past projects in this company.
            for pt in ProjectTeam.objects.filter(user=u).select_related("project")[:50]:
                p = pt.project
                if p.company_id != company.id:
                    continue
                if p.methodology:
                    past_methodologies.append(p.methodology)
                if p.project_type:
                    past_types.append(p.project_type)
        except Exception:
            pass
        out.append({
            "user_id": u.id,
            "name": u.get_full_name() or u.email,
            "role": getattr(u, "role", "") or "",
            "past_methodologies": sorted(set(past_methodologies))[:10],
            "past_project_types": sorted(set(past_types))[:10],
        })
    return out


def _team_fallback(candidates: List[dict], project, lm: dict) -> dict:
    """Rank by naive role/methodology overlap for the no-LLM path."""
    def score(c):
        s = 0
        if project.methodology and project.methodology in c["past_methodologies"]:
            s += 40
        if project.project_type and project.project_type in c["past_project_types"]:
            s += 20
        if c["role"] in ("pm", "program_manager"):
            s += 20
        return s

    ranked = sorted(candidates, key=score, reverse=True)[:5]
    return {
        "suggestions": [
            {
                "user_id": c["user_id"],
                "name": c["name"],
                "match_score": min(99, max(10, score(c))),
                "reasoning": lm["team_match_fallback_reasoning"],
                "past_project_similarity": {
                    "shared_methodologies": c["past_methodologies"],
                    "shared_project_types": c["past_project_types"],
                },
            }
            for c in ranked
        ],
    }


def _coerce_team_match(parsed: Optional[dict], candidates: List[dict]) -> Optional[dict]:
    if not isinstance(parsed, dict):
        return None
    raw = parsed.get("suggestions") or []
    if not isinstance(raw, list):
        return None
    valid_ids = {c["user_id"] for c in candidates}
    out: List[Dict[str, Any]] = []
    for s in raw[:10]:
        if not isinstance(s, dict):
            continue
        try:
            uid = int(s.get("user_id") or 0)
        except (TypeError, ValueError):
            continue
        if uid not in valid_ids:
            # LLM hallucinated a user from a different tenant — drop it.
            continue
        try:
            score = int(s.get("match_score") or 0)
        except (TypeError, ValueError):
            score = 0
        score = max(0, min(100, score))
        out.append({
            "user_id": uid,
            "name": str(s.get("name") or "")[:200],
            "match_score": score,
            "reasoning": str(s.get("reasoning") or "")[:2000],
            "past_project_similarity": s.get("past_project_similarity") or {},
        })
    if not out:
        return None
    return {"suggestions": out[:5]}


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([_AiThrottle, AiContextThrottle])
def team_match(request, pk):
    """POST /api/v1/projects/<pk>/team-match/

    Returns the top-5 team-match suggestions based on past-project
    methodology / project-type overlap, LLM-reasoned when a key is
    available.
    """
    project = _get_project(request, pk)
    if not project:
        return Response({"detail": "Project not found or not accessible."}, status=404)

    from core.i18n_ai import resolve_ui_language
    language = resolve_ui_language(request)
    lm = sprint5_lang_meta(language)
    doc_prefix = _doc_prefix(request.user, pk, language)
    warnings: List[str] = []
    if not doc_prefix:
        warnings.append(lm["no_context_warning"])

    candidates = _list_candidate_members(project)
    if not candidates:
        warnings.append(lm["team_match_no_members"])
        return Response({
            "suggested": {"suggestions": []},
            "source": "fallback",
            "warnings": warnings,
        })

    system = (
        "You rank the best 5 team members for a project. Return STRICT "
        "JSON: {\"suggestions\": [{\"user_id\": int, \"name\": str, "
        "\"match_score\": 0-100, \"reasoning\": str, "
        "\"past_project_similarity\": {}}]}. Only use user_ids from the "
        "provided candidates list; never invent new ones. Match on "
        "methodology experience, past project type and role."
    )
    system = _attach_language(system, language)
    instructions = "Produce the team-match JSON now."
    meta = _project_meta(project)
    meta["candidates"] = candidates
    user_prompt = wrap_prompt(doc_prefix, meta, instructions)

    parsed = run_llm(request.user, system, user_prompt, MAX_TOKENS_SMALL)
    coerced = _coerce_team_match(parsed, candidates)
    fallback = _team_fallback(candidates, project, lm)
    result = finalize(coerced, fallback, warnings, lm)
    return Response(result.as_dict())


# =========================================================================
# S5-07  Onboarding tour for a team member
# =========================================================================

@api_view(["GET"])
@permission_classes([IsAuthenticated])
@throttle_classes([_AiThrottle, AiContextThrottle])
def onboarding_tour(request, pk, user_id):
    """GET /api/v1/projects/<pk>/team/<user_id>/onboarding-tour/

    Returns a role-focused orientation blob for ``user_id`` on project ``pk``.
    The caller (banner) decides whether to show the tour based on the
    team-member's joined-at date.

    Tenant-safe: ``user_id`` must be an active member of ``project.team_members``;
    otherwise 404.
    """
    project = _get_project(request, pk)
    if not project:
        return Response({"detail": "Project not found or not accessible."}, status=404)

    try:
        uid = int(user_id)
    except (TypeError, ValueError):
        return Response({"detail": "Invalid user_id."}, status=404)

    pt = ProjectTeam.objects.filter(project=project, user_id=uid, is_active=True).first()
    if not pt:
        return Response({"detail": "User is not an active team member of this project."}, status=404)

    from core.i18n_ai import resolve_ui_language
    language = resolve_ui_language(request)
    lm = sprint5_lang_meta(language)
    doc_prefix = _doc_prefix(request.user, pk, language)
    warnings: List[str] = []
    if not doc_prefix:
        warnings.append(lm["no_context_warning"])

    user_role = getattr(pt.user, "role", "") or ""
    user_name = pt.user.get_full_name() or pt.user.email

    system = (
        "You write a short onboarding tour for a team member joining a "
        "project. Return STRICT JSON: {\"greeting\": str, \"project_summary\": "
        "str, \"your_role_focus\": str, \"recommended_first_actions\": [str], "
        "\"context_docs\": [str]}. Keep tone warm and professional; use the "
        "member's name in the greeting."
    )
    system = _attach_language(system, language)
    instructions = "Produce the onboarding-tour JSON now."
    meta = _project_meta(project)
    meta["new_member"] = {
        "user_id": uid, "name": user_name, "role": user_role,
        "added_at": pt.added_at.date().isoformat() if pt.added_at else None,
    }
    user_prompt = wrap_prompt(doc_prefix, meta, instructions)

    parsed = run_llm(request.user, system, user_prompt, MAX_TOKENS_SMALL)
    if isinstance(parsed, dict):
        actions = parsed.get("recommended_first_actions") or []
        docs = parsed.get("context_docs") or []
        suggested = {
            "greeting": str(parsed.get("greeting") or "")[:500],
            "project_summary": str(parsed.get("project_summary") or "")[:3000],
            "your_role_focus": str(parsed.get("your_role_focus") or "")[:2000],
            "recommended_first_actions": [str(x)[:500] for x in (actions if isinstance(actions, list) else [])[:10] if str(x).strip()],
            "context_docs": [str(x)[:500] for x in (docs if isinstance(docs, list) else [])[:10] if str(x).strip()],
        }
        if any([suggested["greeting"], suggested["project_summary"],
                suggested["your_role_focus"], suggested["recommended_first_actions"]]):
            return Response({"suggested": suggested, "source": "ai", "warnings": warnings})

    # Fallback — deterministic, friendly.
    fallback = {
        "greeting": f"{lm['onboarding_greeting']}, {user_name}.",
        "project_summary": project.description[:1000] if project.description else lm["onboarding_summary_fallback"],
        "your_role_focus": lm["onboarding_role_focus"],
        "recommended_first_actions": [
            "Open Project Overview",
            "Review the active milestone",
            "Check the Risk register",
        ],
        "context_docs": [],
    }
    warnings.append(lm["no_llm_notice"])
    return Response({"suggested": fallback, "source": "fallback", "warnings": warnings})


# =========================================================================
# S5-08  Dashboard narrative widget
# =========================================================================

def _narrative_signals(project) -> dict:
    """Lightweight signal pack for the dashboard narrative."""
    today = timezone.now().date()
    milestones = Milestone.objects.filter(project=project)
    total_milestones = milestones.count()
    done_milestones = milestones.filter(status="completed").count()
    tasks = Task.objects.filter(milestone__project=project)
    total_tasks = tasks.count()
    done_tasks = tasks.filter(status="done").count()
    open_risks = Risk.objects.filter(project=project, status="Open").count()
    high_risks = Risk.objects.filter(project=project, status="Open", level="High").count()
    return {
        "total_milestones": total_milestones,
        "done_milestones": done_milestones,
        "total_tasks": total_tasks,
        "done_tasks": done_tasks,
        "open_risks": open_risks,
        "high_risks": high_risks,
        "progress_pct": int((done_tasks / total_tasks) * 100) if total_tasks else 0,
        "today": today.isoformat(),
    }


@api_view(["GET"])
@permission_classes([IsAuthenticated])
@throttle_classes([_AiThrottle, AiContextThrottle])
def dashboard_narrative(request, pk):
    """GET /api/v1/projects/<pk>/dashboard/narrative/

    Returns ``{suggested: {headline, body, key_insights}, source, warnings}``.
    """
    project = _get_project(request, pk)
    if not project:
        return Response({"detail": "Project not found or not accessible."}, status=404)

    from core.i18n_ai import resolve_ui_language
    language = resolve_ui_language(request)
    lm = sprint5_lang_meta(language)
    doc_prefix = _doc_prefix(request.user, pk, language)
    warnings: List[str] = []
    if not doc_prefix:
        warnings.append(lm["no_context_warning"])

    signals = _narrative_signals(project)
    system = (
        "You write a short dashboard narrative for a project — the kind of "
        "paragraph a PM would read at the top of their day. Return STRICT "
        "JSON: {\"headline\": str, \"body\": str, \"key_insights\": [str]}. "
        "Headline is one line; body is 3-5 sentences; 3-5 insights."
    )
    system = _attach_language(system, language)
    instructions = (
        "Produce the narrative JSON now. Ground specifics in the signals; "
        "if a signal is zero, acknowledge it rather than inventing numbers."
    )
    meta = _project_meta(project)
    meta["signals"] = signals
    user_prompt = wrap_prompt(doc_prefix, meta, instructions)

    parsed = run_llm(request.user, system, user_prompt, MAX_TOKENS_SMALL)
    coerced: Optional[dict] = None
    if isinstance(parsed, dict):
        head = str(parsed.get("headline") or "").strip()[:200]
        body = str(parsed.get("body") or "").strip()[:5000]
        insights_raw = parsed.get("key_insights") or []
        insights = [str(x)[:500] for x in (insights_raw if isinstance(insights_raw, list) else [])[:10] if str(x).strip()]
        if head or body or insights:
            coerced = {"headline": head, "body": body, "key_insights": insights}

    fallback = {
        "headline": lm["narrative_fallback_headline"] + f" — {project.name}",
        "body": lm["narrative_fallback_body"],
        "key_insights": [
            f"{signals['progress_pct']}% task completion",
            f"{signals['open_risks']} open risks ({signals['high_risks']} high)",
            f"{signals['done_milestones']}/{signals['total_milestones']} milestones delivered",
        ],
    }
    result = finalize(coerced, fallback, warnings, lm)
    return Response(result.as_dict())


# =========================================================================
# S5-09  Meeting agenda AI-draft
# =========================================================================

def _coerce_meeting_agenda(parsed: Optional[dict]) -> Optional[dict]:
    if not isinstance(parsed, dict):
        return None
    raw = parsed.get("agenda_items") or []
    if not isinstance(raw, list):
        return None
    out: List[Dict[str, Any]] = []
    for item in raw[:20]:
        if not isinstance(item, dict):
            continue
        title = str(item.get("title") or "").strip()[:200]
        if not title:
            continue
        try:
            duration = int(item.get("duration_min") or 15)
        except (TypeError, ValueError):
            duration = 15
        duration = max(1, min(240, duration))
        dp_raw = item.get("discussion_points") or []
        rd_raw = item.get("required_decisions") or []
        out.append({
            "title": title,
            "duration_min": duration,
            "discussion_points": [str(x)[:500] for x in (dp_raw if isinstance(dp_raw, list) else [])[:10] if str(x).strip()],
            "required_decisions": [str(x)[:500] for x in (rd_raw if isinstance(rd_raw, list) else [])[:10] if str(x).strip()],
        })
    if not out:
        return None
    return {"agenda_items": out}


@api_view(["POST"])
@permission_classes([IsAuthenticated])
@throttle_classes([_AiThrottle, AiContextThrottle])
def meeting_agenda_auto_draft(request, pk):
    """POST /api/v1/projects/<pk>/meetings/auto-draft-agenda/

    LLM composes a meeting agenda using the project context, recent
    decisions and upcoming milestones.
    """
    project = _get_project(request, pk)
    if not project:
        return Response({"detail": "Project not found or not accessible."}, status=404)

    from core.i18n_ai import resolve_ui_language
    language = resolve_ui_language(request)
    lm = sprint5_lang_meta(language)
    doc_prefix = _doc_prefix(request.user, pk, language)
    warnings: List[str] = []
    if not doc_prefix:
        warnings.append(lm["no_context_warning"])

    today = timezone.now().date()
    # Recent decisions (governance app) — optional, swallow failure.
    recent_decisions: List[dict] = []
    try:
        from governance.models import Decision
        qs = Decision.objects.filter(
            program__isnull=True, status__in=("pending", "approved"),
        ).order_by("-decided_at")[:10]
        recent_decisions = [
            {"title": d.title, "status": d.status, "impact": d.impact}
            for d in qs
        ]
    except Exception:
        recent_decisions = []
    upcoming_milestones = list(
        Milestone.objects.filter(project=project)
        .exclude(status="completed")
        .order_by("end_date")
        .values("name", "end_date")[:10]
    )

    system = (
        "You draft a meeting agenda for a project. Return STRICT JSON: "
        "{\"agenda_items\": [{\"title\": str, \"duration_min\": int, "
        "\"discussion_points\": [str], \"required_decisions\": [str]}]}. "
        "Produce 4-7 agenda items; sum of durations should stay under 90 "
        "minutes unless the signals warrant more."
    )
    system = _attach_language(system, language)
    instructions = (
        "Produce the agenda JSON now. Tie items to recent decisions and "
        "upcoming milestones when they are listed."
    )
    meta = _project_meta(project)
    meta["recent_decisions"] = recent_decisions
    meta["upcoming_milestones"] = [
        {"name": m["name"], "end_date": m["end_date"].isoformat() if m["end_date"] else None}
        for m in upcoming_milestones
    ]
    user_prompt = wrap_prompt(doc_prefix, meta, instructions)

    parsed = run_llm(request.user, system, user_prompt, MAX_TOKENS_SMALL)
    coerced = _coerce_meeting_agenda(parsed)
    fallback = {
        "agenda_items": [
            {"title": lm["meeting_agenda_fallback_item"], "duration_min": 20,
             "discussion_points": [], "required_decisions": []},
            {"title": "Risks & dependencies", "duration_min": 20,
             "discussion_points": [], "required_decisions": []},
            {"title": "Next week commitments", "duration_min": 15,
             "discussion_points": [], "required_decisions": []},
        ],
    }
    result = finalize(coerced, fallback, warnings, lm)
    return Response(result.as_dict())
