"""Per-methodology doctrine report synthesizers.

Each methodology mandates its own report cadence/artifact — a Scrum Sprint
Report, a Kanban Service Delivery Review, a Waterfall Phase Gate Report, an
Agile Iteration Report, an LSS DMAIC Tollgate Report, a Hybrid Phase Report.
This module reads the *live* state of the relevant methodology models and
turns it into a defensible, fully-populated report dict ready to persist into a
`MethodologyReport` row.

Like `status_synthesis`, the genuine deliverable is the fact-gathering + a
deterministic narrative — no LLM is required. Every synthesizer degrades
gracefully: if the methodology has not been initialised for the project it
returns an empty-but-valid report rather than raising.

Public API:
    synthesize(project, methodology) -> dict
        keys: report_type, title, scope_ref, period_start, period_end,
              overall_rag, rag_scope, rag_schedule, rag_cost, rag_risk,
              executive_summary, highlights, blockers, next_steps,
              metrics, payload, model_used, original_ai_response
"""
from __future__ import annotations

from datetime import date


# ---------------------------------------------------------------------------
# Shared helpers
# ---------------------------------------------------------------------------

_RAG_ORDER = {"green": 0, "amber": 1, "red": 2}


def _worse(a: str, b: str) -> str:
    return a if _RAG_ORDER[a] >= _RAG_ORDER[b] else b


def _overall(*dims: str) -> str:
    out = "green"
    for d in dims:
        out = _worse(out, d)
    return out


def _ratio_rag(done: float, target: float, *, green=0.9, amber=0.6) -> str:
    """Green when delivery keeps pace, amber when slipping, red when behind."""
    if target <= 0:
        return "green"
    r = done / target
    if r >= green:
        return "green"
    if r >= amber:
        return "amber"
    return "red"


def _empty(report_type: str, title: str, note: str) -> dict:
    return {
        "report_type": report_type,
        "title": title,
        "scope_ref": "",
        "period_start": None,
        "period_end": None,
        "overall_rag": "amber",
        "rag_scope": "amber",
        "rag_schedule": "amber",
        "rag_cost": "green",
        "rag_risk": "green",
        "executive_summary": note,
        "highlights": [],
        "blockers": [note],
        "next_steps": ["Initialise this methodology and add work before reporting."],
        "metrics": {},
        "payload": {},
        "model_used": "deterministic",
        "original_ai_response": "",
    }


def _base(report_type: str, title: str) -> dict:
    """A fully-populated green skeleton each synthesizer fills in."""
    return {
        "report_type": report_type,
        "title": title,
        "scope_ref": "",
        "period_start": None,
        "period_end": None,
        "overall_rag": "green",
        "rag_scope": "green",
        "rag_schedule": "green",
        "rag_cost": "green",
        "rag_risk": "green",
        "executive_summary": "",
        "highlights": [],
        "blockers": [],
        "next_steps": [],
        "metrics": {},
        "payload": {},
        "model_used": "deterministic",
        "original_ai_response": "",
    }


# ---------------------------------------------------------------------------
# Scrum — Sprint Report
# ---------------------------------------------------------------------------

def _scrum(project) -> dict:
    from scrum.models import Sprint, BacklogItem

    sprint = (
        Sprint.objects.filter(project=project).exclude(status="completed").order_by("-number").first()
        or Sprint.objects.filter(project=project).order_by("-number").first()
    )
    if not sprint:
        return _empty("sprint_report", "Sprint Report", "No sprint has been created yet.")

    items = list(BacklogItem.objects.filter(sprint=sprint))
    total = len(items)
    done_items = [i for i in items if i.status == "done"]
    committed_points = sum(i.story_points or 0 for i in items)
    done_points = sum(i.story_points or 0 for i in done_items)
    carry_over = total - len(done_items)
    velocity = done_points

    r = _base("sprint_report", f"Sprint Report — {sprint.name}")
    r["scope_ref"] = f"Sprint {sprint.number}: {sprint.name}"
    r["period_start"] = sprint.start_date
    r["period_end"] = sprint.end_date
    r["metrics"] = {
        "committed_points": committed_points,
        "done_points": done_points,
        "velocity": velocity,
        "total_items": total,
        "done_items": len(done_items),
        "carry_over_items": carry_over,
        "team_capacity": sprint.team_capacity,
    }
    r["payload"] = {
        "sprint_goal": sprint.goal or "",
        "sprint_status": sprint.status,
        "went_well": sprint.went_well or "",
        "to_improve": sprint.to_improve or "",
        "action_items": sprint.action_items or "",
    }
    r["rag_schedule"] = _ratio_rag(done_points, committed_points)
    r["rag_scope"] = "amber" if carry_over else "green"
    r["overall_rag"] = _overall(r["rag_schedule"], r["rag_scope"])

    pct = int(round((done_points / committed_points) * 100)) if committed_points else 0
    r["executive_summary"] = (
        f"{sprint.name} delivered {done_points} of {committed_points} committed story "
        f"points ({pct}%), completing {len(done_items)} of {total} backlog items. "
        + (f"{carry_over} item(s) carry over to the next sprint." if carry_over else "All committed work was completed.")
    )
    r["highlights"] = [f"Velocity: {velocity} pts", f"{len(done_items)}/{total} items done"]
    if sprint.goal:
        r["highlights"].append(f"Sprint goal: {sprint.goal[:80]}")
    if carry_over:
        r["blockers"].append(f"{carry_over} item(s) not completed this sprint")
    r["next_steps"] = (
        ["Re-plan carry-over items into the next sprint"] if carry_over
        else ["Hold sprint review and plan the next sprint"]
    )
    if sprint.to_improve:
        r["next_steps"].append(f"Retro action: {sprint.to_improve[:80]}")
    return r


# ---------------------------------------------------------------------------
# Kanban — Service Delivery Review
# ---------------------------------------------------------------------------

def _kanban(project) -> dict:
    board = getattr(project, "kanban_board", None)
    if not board:
        return _empty("service_delivery_review", "Service Delivery Review", "No Kanban board has been created yet.")

    columns = list(board.columns.all())
    cards = list(board.cards.select_related("column").all())
    total = len(cards)
    done_cards = [c for c in cards if getattr(c.column, "is_done_column", False)]
    blocked = [c for c in cards if c.is_blocked]

    column_counts: dict[str, int] = {}
    breached = []
    for col in columns:
        n = sum(1 for c in cards if c.column_id == col.id)
        column_counts[col.name or col.column_type] = n
        if col.wip_limit and n > col.wip_limit:
            breached.append({"column": col.name or col.column_type, "count": n, "limit": col.wip_limit})

    latest = board.metrics.order_by("-date").first()
    avg_lead = float(latest.avg_lead_time_hours) if latest and latest.avg_lead_time_hours is not None else None
    throughput = latest.cards_completed if latest else len(done_cards)

    r = _base("service_delivery_review", "Service Delivery Review")
    r["scope_ref"] = board.name or "Kanban Board"
    r["metrics"] = {
        "total_cards": total,
        "done_cards": len(done_cards),
        "blocked_cards": len(blocked),
        "wip_breaches": len(breached),
        "throughput": throughput,
        "avg_lead_time_hours": avg_lead,
    }
    r["payload"] = {"column_counts": column_counts, "breached_columns": breached}
    r["rag_scope"] = "red" if len(breached) >= 2 else "amber" if (breached or blocked) else "green"
    r["rag_risk"] = "amber" if blocked else "green"
    r["overall_rag"] = _overall(r["rag_scope"], r["rag_risk"])

    r["executive_summary"] = (
        f"The service has {total} work items in flow, {len(done_cards)} delivered. "
        f"Throughput stands at {throughput} item(s)"
        + (f", average lead time {avg_lead:.1f}h. " if avg_lead is not None else ". ")
        + (f"{len(breached)} column(s) breach their WIP limit. " if breached else "WIP limits are respected. ")
        + (f"{len(blocked)} item(s) are blocked." if blocked else "No items are blocked.")
    )
    r["highlights"] = [f"Throughput: {throughput}", f"{len(done_cards)}/{total} delivered"]
    if avg_lead is not None:
        r["highlights"].append(f"Avg lead time: {avg_lead:.1f}h")
    for b in breached:
        r["blockers"].append(f"WIP breach in {b['column']}: {b['count']}/{b['limit']}")
    if blocked:
        r["blockers"].append(f"{len(blocked)} blocked card(s)")
    r["next_steps"] = (
        ["Resolve WIP breaches before pulling new work"] if breached
        else ["Maintain flow; monitor lead-time trend"]
    )
    if blocked:
        r["next_steps"].append("Unblock stalled cards")
    return r


# ---------------------------------------------------------------------------
# Agile — Iteration Report
# ---------------------------------------------------------------------------

def _agile(project) -> dict:
    from agile.models import AgileIteration, AgileBacklogItem

    it = (
        AgileIteration.objects.filter(project=project).exclude(status="completed").order_by("-start_date").first()
        or AgileIteration.objects.filter(project=project).order_by("-start_date").first()
    )
    if not it:
        return _empty("iteration_report", "Iteration Report", "No iteration has been created yet.")

    items = list(AgileBacklogItem.objects.filter(iteration=it))
    total = len(items)
    done_items = [i for i in items if i.status in ("done", "completed")]
    wip = [i for i in items if i.status in ("in_progress", "in_review")]

    r = _base("iteration_report", f"Iteration Report — {it.name}")
    r["scope_ref"] = it.name
    r["period_start"] = it.start_date
    r["period_end"] = it.end_date
    r["metrics"] = {
        "velocity_committed": it.velocity_committed,
        "velocity_completed": it.velocity_completed,
        "total_items": total,
        "done_items": len(done_items),
        "wip_items": len(wip),
    }
    r["payload"] = {"goal": it.goal or "", "status": it.status}
    r["rag_schedule"] = _ratio_rag(it.velocity_completed, it.velocity_committed)
    r["rag_scope"] = "amber" if (total - len(done_items)) else "green"
    r["overall_rag"] = _overall(r["rag_schedule"], r["rag_scope"])

    pct = int(round((it.velocity_completed / it.velocity_committed) * 100)) if it.velocity_committed else 0
    r["executive_summary"] = (
        f"{it.name} completed {it.velocity_completed} of {it.velocity_committed} committed "
        f"points ({pct}%), with {len(done_items)} of {total} items done and {len(wip)} in progress."
    )
    r["highlights"] = [f"Completed {it.velocity_completed}/{it.velocity_committed} pts", f"{len(done_items)}/{total} items done"]
    if it.goal:
        r["highlights"].append(f"Goal: {it.goal[:80]}")
    if wip:
        r["blockers"].append(f"{len(wip)} item(s) still in progress")
    r["next_steps"] = ["Demo the increment and gather stakeholder feedback"]
    if total - len(done_items):
        r["next_steps"].append("Re-prioritise unfinished items into the next iteration")
    return r


# ---------------------------------------------------------------------------
# Waterfall — Phase Gate Report
# ---------------------------------------------------------------------------

def _waterfall(project) -> dict:
    from waterfall.models import WaterfallPhase, EarnedValueRecord

    phase = (
        WaterfallPhase.objects.filter(project=project, status="in_progress").order_by("order").first()
        or WaterfallPhase.objects.filter(project=project).exclude(status="completed").order_by("order").first()
        or WaterfallPhase.objects.filter(project=project).order_by("-order").first()
    )
    if not phase:
        return _empty("phase_gate_report", "Phase Gate Report", "No waterfall phase has been created yet.")

    tasks = list(phase.tasks.all())
    total = len(tasks)
    done = [t for t in tasks if t.status in ("done", "completed")]
    evm = EarnedValueRecord.objects.filter(project=project).order_by("-period_end").first()
    cpi = float(evm.cpi) if evm else None
    spi = float(evm.spi) if evm else None
    signed_off = phase.signed_off_by_id is not None
    gate_ready = phase.progress >= 100 and (not phase.sign_off_required or signed_off)

    r = _base("phase_gate_report", f"Phase Gate Report — {phase.name}")
    r["scope_ref"] = f"Phase: {phase.name}"
    r["period_start"] = phase.actual_start_date or phase.start_date
    r["period_end"] = phase.actual_end_date or phase.end_date
    r["metrics"] = {
        "phase_progress": phase.progress,
        "tasks_total": total,
        "tasks_done": len(done),
        "cpi": cpi,
        "spi": spi,
    }
    r["payload"] = {
        "phase_type": phase.phase_type,
        "sign_off_required": phase.sign_off_required,
        "signed_off": signed_off,
        "gate_ready": gate_ready,
    }
    r["rag_schedule"] = "green" if spi is None or spi >= 0.95 else "amber" if spi >= 0.85 else "red"
    r["rag_cost"] = "green" if cpi is None or cpi >= 0.95 else "amber" if cpi >= 0.85 else "red"
    r["rag_scope"] = "green" if gate_ready else "amber"
    r["overall_rag"] = _overall(r["rag_schedule"], r["rag_cost"], r["rag_scope"])

    r["executive_summary"] = (
        f"The {phase.name} phase is {phase.progress}% complete with {len(done)} of {total} tasks done. "
        + (f"EVM shows CPI {cpi:.2f} / SPI {spi:.2f}. " if cpi is not None else "")
        + ("The phase gate criteria are met — ready for sign-off." if gate_ready
           else "Phase gate criteria are not yet met.")
    )
    r["highlights"] = [f"Phase {phase.progress}% complete", f"{len(done)}/{total} tasks done"]
    if cpi is not None:
        r["highlights"].append(f"CPI {cpi:.2f} · SPI {spi:.2f}")
    if not gate_ready:
        r["blockers"].append("Phase gate exit criteria not satisfied")
    if phase.sign_off_required and not signed_off:
        r["blockers"].append("Awaiting phase sign-off")
    r["next_steps"] = (
        ["Convene the gate review and obtain sign-off"] if gate_ready
        else ["Complete remaining tasks to satisfy exit criteria"]
    )
    return r


# ---------------------------------------------------------------------------
# LSS Green / Black — DMAIC Tollgate Report
# ---------------------------------------------------------------------------

def _lss(project, belt: str) -> dict:
    from lss_green.models import DMAICPhase

    phases = list(DMAICPhase.objects.filter(project=project).order_by("order"))
    if not phases:
        return _empty("tollgate_report", "DMAIC Tollgate Report", "No DMAIC phase has been created yet.")

    completed_phases = [p for p in phases if p.status == "completed"]
    current = (
        next((p for p in phases if p.status == "in_progress"), None)
        or (completed_phases[-1] if completed_phases else phases[0])
    )

    title = f"DMAIC Tollgate Report — {belt} Belt"
    r = _base("tollgate_report", title)
    phase_label = current.phase.title()
    r["scope_ref"] = f"Tollgate: {phase_label}"
    r["period_start"] = current.target_start_date
    r["period_end"] = current.target_end_date

    if belt == "Black":
        from lss_black.models import LSSBlackTask, HypothesisTest, ControlPlan, SPCChart
        tasks = list(LSSBlackTask.objects.filter(phase=current))
        hyp = HypothesisTest.objects.filter(project=project).count()
        ctrl = ControlPlan.objects.filter(project=project, is_active=True).count()
        spc = SPCChart.objects.filter(project=project).count()
        extra = {"hypothesis_tests": hyp, "control_plans": ctrl, "spc_charts": spc}
    else:
        from lss_green.models import LSSGreenTask, LSSGreenMetric
        tasks = list(LSSGreenTask.objects.filter(phase=current))
        m = LSSGreenMetric.objects.filter(project=project).order_by("-created_at").first()
        extra = {
            "cp": m.cp if m else None,
            "cpk": m.cpk if m else None,
            "sigma_level": m.sigma_level if m else None,
            "defects_per_million": m.defects_per_million if m else None,
        }

    total = len(tasks)
    done = [t for t in tasks if t.status in ("completed", "done")]
    r["metrics"] = {
        "phases_total": len(phases),
        "phases_completed": len(completed_phases),
        "current_phase": current.phase,
        "tasks_total": total,
        "tasks_done": len(done),
        **extra,
    }
    r["payload"] = {"objective": current.objective or "", "phase_status": current.status, "belt": belt}
    r["rag_schedule"] = _ratio_rag(len(done), total) if total else "green"
    r["overall_rag"] = r["rag_schedule"]

    r["executive_summary"] = (
        f"The {phase_label} phase tollgate review: {len(completed_phases)} of {len(phases)} DMAIC "
        f"phases complete, {len(done)} of {total} phase tasks done. "
        + (f"Latest capability Cpk {extra['cpk']}." if belt == "Green" and extra.get("cpk") is not None
           else f"{extra.get('hypothesis_tests', 0)} hypothesis test(s) on record." if belt == "Black" else "")
    )
    r["highlights"] = [f"{len(completed_phases)}/{len(phases)} DMAIC phases done", f"{len(done)}/{total} tasks done"]
    if current.objective:
        r["highlights"].append(f"Objective: {current.objective[:80]}")
    if total - len(done):
        r["blockers"].append(f"{total - len(done)} task(s) open in the {phase_label} phase")
    r["next_steps"] = [f"Hold the {phase_label} tollgate review before advancing"]
    return r


# ---------------------------------------------------------------------------
# Hybrid — Phase Report
# ---------------------------------------------------------------------------

def _hybrid(project) -> dict:
    from hybrid.models import PhaseMethodology, HybridTask

    phase = (
        PhaseMethodology.objects.filter(project=project, completed_at__isnull=True).order_by("order").first()
        or PhaseMethodology.objects.filter(project=project).order_by("-order").first()
    )
    if not phase:
        return _empty("phase_report", "Phase Report", "No hybrid phase has been created yet.")

    tasks = list(HybridTask.objects.filter(phase=phase))
    total = len(tasks)
    done = [t for t in tasks if t.status in ("completed", "done")]
    dod = phase.dod_checklist or []
    dod_done = sum(1 for d in dod if isinstance(d, dict) and d.get("checked"))

    r = _base("phase_report", f"Phase Report — {phase.phase}")
    r["scope_ref"] = f"Phase: {phase.phase} ({phase.methodology})"
    r["period_start"] = phase.start_date
    r["period_end"] = phase.end_date
    r["metrics"] = {
        "progress": phase.progress,
        "tasks_total": total,
        "tasks_done": len(done),
        "dod_total": len(dod),
        "dod_done": dod_done,
    }
    r["payload"] = {
        "assigned_methodology": phase.methodology,
        "gate_status": phase.gate_status,
        "entry_criteria": phase.entry_criteria or "",
        "exit_criteria": phase.exit_criteria or "",
    }
    gate_ready = phase.gate_status == "passed" or (phase.progress >= 100 and (not dod or dod_done == len(dod)))
    r["rag_schedule"] = _ratio_rag(len(done), total) if total else "green"
    r["rag_scope"] = "green" if gate_ready else "amber"
    r["overall_rag"] = _overall(r["rag_schedule"], r["rag_scope"])

    r["executive_summary"] = (
        f"The {phase.phase} phase (run as {phase.methodology}) is {phase.progress}% complete with "
        f"{len(done)} of {total} tasks done"
        + (f" and {dod_done}/{len(dod)} Definition-of-Done items met. " if dod else ". ")
        + ("Gate criteria are satisfied." if gate_ready else f"Gate is {phase.gate_status}.")
    )
    r["highlights"] = [f"Run as {phase.methodology}", f"{len(done)}/{total} tasks done"]
    if dod:
        r["highlights"].append(f"DoD {dod_done}/{len(dod)}")
    if not gate_ready:
        r["blockers"].append(f"Phase gate is {phase.gate_status}")
    r["next_steps"] = (
        ["Advance to the next phase under its configured methodology"] if gate_ready
        else ["Complete remaining work and DoD items to pass the gate"]
    )
    return r


# ---------------------------------------------------------------------------
# Dispatch
# ---------------------------------------------------------------------------

_SYNTH = {
    "scrum": _scrum,
    "kanban": _kanban,
    "agile": _agile,
    "waterfall": _waterfall,
    "lss-green": lambda p: _lss(p, "Green"),
    "lss-black": lambda p: _lss(p, "Black"),
    "hybrid": _hybrid,
}


def synthesize(project, methodology: str) -> dict:
    fn = _SYNTH.get(methodology)
    if not fn:
        raise ValueError(f"Unknown methodology '{methodology}'")
    return fn(project)
