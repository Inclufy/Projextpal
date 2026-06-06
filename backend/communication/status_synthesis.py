"""NLP auto-status synthesis engine (IL-2).

The genuine, non-theatre deliverable here is the *fact gathering* and the
*deterministic RAG computation*: given a Project, we read real task/milestone/
risk/budget state and turn it into a defensible health picture. The LLM is an
optional enhancement that turns those facts into an executive narrative — when
no ANTHROPIC_API_KEY is present (tests, offline dev) we fall back to a
deterministic template so the feature is fully usable and testable without a
network call.

Public API:
    gather_metrics(project)         -> dict   (the raw facts)
    compute_rag(metrics)            -> dict   (per-dimension + overall RAG)
    synthesize(project, ...)        -> dict   (everything needed to populate a
                                               GeneratedStatusReport row)
"""
from __future__ import annotations

import json
import os
from datetime import date
from decimal import Decimal
from typing import Optional

try:
    from anthropic import Anthropic
    _ANTHROPIC_OK = True
except Exception:  # pragma: no cover
    Anthropic = None  # type: ignore[assignment]
    _ANTHROPIC_OK = False


# ---------------------------------------------------------------------------
# Fact gathering
# ---------------------------------------------------------------------------

def gather_metrics(project) -> dict:
    """Read real project state into a flat, JSON-serialisable facts dict."""
    from projects.models import Task, Milestone, Risk  # local import (cycle)

    today = date.today()
    tasks = Task.objects.filter(milestone__project=project)
    total = tasks.count()
    by_status = {s: 0 for s, _ in Task.STATUS_CHOICES}
    for st in tasks.values_list("status", flat=True):
        by_status[st] = by_status.get(st, 0) + 1
    done = by_status.get("done", 0)
    blocked = by_status.get("blocked", 0)
    completion_pct = int(round((done / total) * 100)) if total else 0

    # Overdue = not done and a due date in the past.
    overdue = tasks.exclude(status="done").filter(
        due_date__isnull=False, due_date__lt=today,
    ).count()

    milestones = Milestone.objects.filter(project=project)
    m_total = milestones.count()
    m_done = milestones.filter(status="completed").count()

    risks = Risk.objects.filter(project=project)
    open_risks = risks.exclude(status="Closed")
    risks_by_level = {lvl: open_risks.filter(level=lvl).count() for lvl in ("High", "Medium", "Low")}
    # Exposure proxy = sum of probability% weighted by impact rank, open only.
    impact_rank = {"High": 3, "Medium": 2, "Low": 1}
    exposure = 0
    for prob, impact in open_risks.values_list("probability", "impact"):
        exposure += int(prob or 0) * impact_rank.get(impact, 1)

    budget = project.budget or Decimal("0")
    # Cost performance proxy: planned burn tracks completion; if budget is set
    # we approximate spend as proportional to elapsed schedule and compare to
    # actual work completion (a lightweight EVM-style SPI surrogate).
    schedule_elapsed_pct = _schedule_elapsed_pct(project, today)

    # ---- Cross-module facts (comms / stakeholders / lessons / governance) ----
    # Each block is defensive so a missing app never breaks the report.
    open_issues = critical_issues = 0
    try:
        from projects.models import Issue
        iqs = Issue.objects.filter(project=project)
        open_issues = iqs.filter(status__in=["Open", "In Progress"]).count()
        critical_issues = iqs.filter(status__in=["Open", "In Progress"], severity__in=["Blocker", "Critical"]).count()
    except Exception:
        pass

    stakeholders_total = stakeholders_high = 0
    try:
        from execution.models import Stakeholder
        sqs = Stakeholder.objects.filter(project=project)
        stakeholders_total = sqs.count()
        stakeholders_high = sqs.filter(influence="High").count()
    except Exception:
        pass

    comms_planned = comms_done = 0
    try:
        from projects.models import PlanEvent
        pqs = PlanEvent.objects.filter(plan__project=project)
        comms_planned = pqs.filter(status="planned").count()
        comms_done = pqs.filter(status="done").count()
    except Exception:
        pass

    lessons_total = 0
    try:
        from projects.models import LessonLearned
        lessons_total = LessonLearned.objects.filter(project=project).count()
    except Exception:
        pass

    governance_defined = False
    try:
        from execution.models import Governance
        g = Governance.objects.filter(project=project).first()
        governance_defined = bool(g and (g.meeting_cadence or g.structure_data))
    except Exception:
        pass

    compound_signals_count = 0
    try:
        from projects.compound_signals import compute_compound_signals
        compound_signals_count = compute_compound_signals(project).get("count", 0)
    except Exception:
        pass

    return {
        "as_of": today.isoformat(),
        "project_name": project.name,
        "methodology": project.methodology or "",
        "status": project.status,
        "tasks_total": total,
        "tasks_by_status": by_status,
        "tasks_done": done,
        "tasks_blocked": blocked,
        "tasks_overdue": overdue,
        "completion_pct": completion_pct,
        "milestones_total": m_total,
        "milestones_done": m_done,
        "open_risks_total": open_risks.count(),
        "open_risks_by_level": risks_by_level,
        "risk_exposure": exposure,
        "budget": float(budget),
        "currency": project.currency,
        "schedule_elapsed_pct": schedule_elapsed_pct,
        # Cross-module facts
        "open_issues_total": open_issues,
        "critical_issues": critical_issues,
        "stakeholders_total": stakeholders_total,
        "stakeholders_high_influence": stakeholders_high,
        "comms_events_planned": comms_planned,
        "comms_events_done": comms_done,
        "lessons_captured": lessons_total,
        "governance_defined": governance_defined,
        "compound_signals": compound_signals_count,
    }


def _schedule_elapsed_pct(project, today: date) -> Optional[int]:
    start, end = project.start_date, project.end_date
    if not start or not end or end <= start:
        return None
    if today <= start:
        return 0
    if today >= end:
        return 100
    span = (end - start).days
    used = (today - start).days
    return int(round((used / span) * 100))


# ---------------------------------------------------------------------------
# Deterministic RAG
# ---------------------------------------------------------------------------

def _worse(a: str, b: str) -> str:
    order = {"green": 0, "amber": 1, "red": 2}
    return a if order[a] >= order[b] else b


def compute_rag(metrics: dict) -> dict:
    """Turn the facts into a defensible per-dimension RAG + overall."""
    total = metrics.get("tasks_total", 0)
    overdue = metrics.get("tasks_overdue", 0)
    blocked = metrics.get("tasks_blocked", 0)
    completion = metrics.get("completion_pct", 0)
    elapsed = metrics.get("schedule_elapsed_pct")
    risks_by_level = metrics.get("open_risks_by_level", {})
    high_risks = risks_by_level.get("High", 0)
    med_risks = risks_by_level.get("Medium", 0)

    # Scope/quality: blocked work and overdue items erode delivery confidence.
    scope = "green"
    if total:
        blocked_ratio = blocked / total
        overdue_ratio = overdue / total
        if blocked_ratio >= 0.2 or overdue_ratio >= 0.3:
            scope = "red"
        elif blocked_ratio > 0 or overdue_ratio >= 0.1:
            scope = "amber"

    # Schedule: completion should keep pace with elapsed time (SPI surrogate).
    schedule = "green"
    if elapsed is not None:
        gap = elapsed - completion
        if gap >= 25:
            schedule = "red"
        elif gap >= 10:
            schedule = "amber"
    elif overdue:
        schedule = "amber"

    # Cost: no spend ledger here — proxy off schedule slip (behind = burn risk).
    cost = "green"
    if elapsed is not None and (elapsed - completion) >= 25:
        cost = "amber"

    # Risk: driven by open high/medium risk counts.
    risk = "green"
    if high_risks >= 2:
        risk = "red"
    elif high_risks == 1 or med_risks >= 3:
        risk = "amber"

    overall = "green"
    for dim in (scope, schedule, cost, risk):
        overall = _worse(overall, dim)

    return {
        "rag_scope": scope,
        "rag_schedule": schedule,
        "rag_cost": cost,
        "rag_risk": risk,
        "overall_rag": overall,
    }


# ---------------------------------------------------------------------------
# Narrative
# ---------------------------------------------------------------------------

_SYSTEM_PROMPT = (
    "You are a senior PMO analyst writing a concise executive status report. "
    "You are given a JSON object of project metrics and a computed RAG health. "
    "Return STRICT JSON with keys: executive_summary (2-4 sentence narrative, "
    "plain business English, no markdown), highlights (array of short strings), "
    "blockers (array of short strings), next_steps (array of short strings). "
    "Base every statement on the supplied facts; never invent numbers."
)


def _deterministic_narrative(metrics: dict, rag: dict) -> dict:
    """Template narrative used when no LLM is available — fully usable."""
    name = metrics.get("project_name", "The project")
    comp = metrics.get("completion_pct", 0)
    total = metrics.get("tasks_total", 0)
    done = metrics.get("tasks_done", 0)
    overdue = metrics.get("tasks_overdue", 0)
    blocked = metrics.get("tasks_blocked", 0)
    open_risks = metrics.get("open_risks_total", 0)
    high = metrics.get("open_risks_by_level", {}).get("High", 0)
    overall = rag["overall_rag"].upper()

    summary = (
        f"{name} is at {comp}% task completion ({done} of {total} tasks done) "
        f"with an overall health of {overall}. "
    )
    if blocked or overdue:
        summary += (
            f"There are {blocked} blocked and {overdue} overdue tasks requiring "
            f"attention. "
        )
    else:
        summary += "No tasks are currently blocked or overdue. "
    if open_risks:
        summary += f"{open_risks} risk(s) are open ({high} high-severity)."
    else:
        summary += "No open risks are recorded."

    # Cross-module facts
    crit_issues = metrics.get("critical_issues", 0)
    open_issues = metrics.get("open_issues_total", 0)
    sh_total = metrics.get("stakeholders_total", 0)
    comms_planned = metrics.get("comms_events_planned", 0)
    lessons = metrics.get("lessons_captured", 0)
    gov = metrics.get("governance_defined", False)
    compound = metrics.get("compound_signals", 0)

    if open_issues:
        summary += f" {open_issues} issue(s) are open ({crit_issues} critical)."
    if compound:
        summary += f" AI detected {compound} compound cross-module signal(s)."

    highlights = [f"{done}/{total} tasks complete ({comp}%)"]
    m_total = metrics.get("milestones_total", 0)
    if m_total:
        highlights.append(
            f"{metrics.get('milestones_done', 0)}/{m_total} milestones reached"
        )
    if sh_total:
        highlights.append(f"{sh_total} stakeholder(s) engaged")
    if comms_planned:
        highlights.append(f"{comms_planned} communication event(s) planned")
    if lessons:
        highlights.append(f"{lessons} lesson(s) captured")
    if gov:
        highlights.append("Governance approach defined")

    blockers = []
    if blocked:
        blockers.append(f"{blocked} blocked task(s) halting flow")
    if overdue:
        blockers.append(f"{overdue} task(s) past their due date")
    if high:
        blockers.append(f"{high} high-severity risk(s) open")
    if crit_issues:
        blockers.append(f"{crit_issues} critical issue(s) unresolved")
    if compound:
        blockers.append(f"{compound} AI compound signal(s) flagged")

    next_steps = []
    if rag["rag_schedule"] != "green":
        next_steps.append("Re-baseline schedule or add capacity to recover slip")
    if rag["rag_risk"] != "green":
        next_steps.append("Review mitigation plans for open high/medium risks")
    if blocked:
        next_steps.append("Escalate and clear blocked tasks")
    if crit_issues:
        next_steps.append("Drive critical issues to resolution before the next gate")
    if not gov:
        next_steps.append("Define the governance approach (board, cadence, decisions)")
    if not comms_planned and sh_total:
        next_steps.append("Set up a communication plan for engaged stakeholders")
    if not next_steps:
        next_steps.append("Maintain current pace; no corrective action needed")

    return {
        "executive_summary": summary,
        "highlights": highlights,
        "blockers": blockers,
        "next_steps": next_steps,
    }


def _llm_narrative(metrics: dict, rag: dict, *, api_key: str, model: str) -> tuple[dict, str]:
    """Call Claude for the narrative. Returns (narrative_dict, raw_response)."""
    client = Anthropic(api_key=api_key)
    user_msg = json.dumps({"metrics": metrics, "rag": rag}, default=str)
    resp = client.messages.create(
        model=model,
        max_tokens=1500,
        system=_SYSTEM_PROMPT,
        messages=[{"role": "user", "content": user_msg}],
    )
    raw = "".join(
        b.text for b in resp.content if getattr(b, "type", "") == "text"
    ).strip()
    cleaned = raw
    if cleaned.startswith("```"):
        cleaned = cleaned.split("```", 2)[1]
        if cleaned.startswith("json"):
            cleaned = cleaned[4:]
        cleaned = cleaned.strip()
    data = json.loads(cleaned)
    narrative = {
        "executive_summary": data.get("executive_summary", ""),
        "highlights": data.get("highlights", []) or [],
        "blockers": data.get("blockers", []) or [],
        "next_steps": data.get("next_steps", []) or [],
    }
    return narrative, raw


def synthesize(
    project,
    *,
    api_key: Optional[str] = None,
    model: str = "claude-opus-4-7",
    use_llm: bool = True,
) -> dict:
    """Full synthesis. Always returns a populated dict; never raises on a
    missing/failed LLM — it degrades to the deterministic narrative so the
    feature works offline and in tests."""
    metrics = gather_metrics(project)
    rag = compute_rag(metrics)

    key = api_key or os.environ.get("ANTHROPIC_API_KEY") or ""
    model_used = "deterministic"
    raw = ""
    if use_llm and _ANTHROPIC_OK and key:
        try:
            narrative, raw = _llm_narrative(metrics, rag, api_key=key, model=model)
            model_used = model
        except Exception:
            narrative = _deterministic_narrative(metrics, rag)
    else:
        narrative = _deterministic_narrative(metrics, rag)

    return {
        "metrics": metrics,
        **rag,
        **narrative,
        "model_used": model_used,
        "original_ai_response": raw,
    }


def generate_and_store(project, *, user=None, use_llm: bool = True):
    """Synthesise + persist a GeneratedStatusReport. Reused by the API action,
    the scheduled management command, and the event-driven signal.

    Returns the created report, or None on failure (never raises)."""
    from .models import GeneratedStatusReport

    try:
        result = synthesize(project, use_llm=use_llm)
        return GeneratedStatusReport.objects.create(
            project=project,
            metrics=result["metrics"],
            overall_rag=result["overall_rag"],
            rag_scope=result["rag_scope"],
            rag_schedule=result["rag_schedule"],
            rag_cost=result["rag_cost"],
            rag_risk=result["rag_risk"],
            executive_summary=result["executive_summary"],
            highlights=result["highlights"],
            blockers=result["blockers"],
            next_steps=result["next_steps"],
            model_used=result["model_used"],
            original_ai_response=result["original_ai_response"],
            created_by=user,
        )
    except Exception:
        return None
