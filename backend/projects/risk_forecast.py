"""Predictive risk-forecast engine (IL-1, AI Risk Copilot).

The genuine, non-theatre deliverable is the *signal computation* and the
*deterministic forecast*: from the live RAID register + schedule signals we
compute weighted exposure, risk velocity (open vs close rate), project exposure
forward, and grade an outlook with a confidence level. The LLM only writes the
narrative; when no ANTHROPIC_API_KEY is present we fall back to a deterministic
narrative so the forecast is fully usable and testable offline.

Public API:
    gather_risk_signals(project) -> dict
    compute_forecast(signals)    -> dict
    forecast(project, ...)       -> dict   (everything to populate a RiskForecast)
"""
from __future__ import annotations

import json
import os
from datetime import date, timedelta
from typing import Optional

try:
    from anthropic import Anthropic
    _ANTHROPIC_OK = True
except Exception:  # pragma: no cover
    Anthropic = None  # type: ignore[assignment]
    _ANTHROPIC_OK = False

_IMPACT_RANK = {"High": 3, "Medium": 2, "Low": 1}


def _exposure(risks_values) -> int:
    """Weighted exposure = sum(probability% × impact_rank) over the given rows.
    `risks_values` is an iterable of (probability, impact) tuples."""
    total = 0
    for prob, impact in risks_values:
        total += int(prob or 0) * _IMPACT_RANK.get(impact, 1)
    return total


def gather_risk_signals(project, *, window_days: int = 30) -> dict:
    """Read the live RAID + schedule picture into a flat signals dict."""
    from .models import Risk, Task, Milestone

    today = date.today()
    window_start = today - timedelta(days=window_days)

    risks = Risk.objects.filter(project=project)
    open_risks = risks.exclude(status="Closed")
    open_count = open_risks.count()
    high_open = open_risks.filter(level="High").count()
    med_open = open_risks.filter(level="Medium").count()

    current_exposure = _exposure(open_risks.values_list("probability", "impact"))

    # Velocity: risks opened vs closed inside the window.
    opened_recent = risks.filter(created_at__date__gte=window_start).count()
    # A risk counts as "closed recently" if it is Closed and was last touched
    # inside the window (updated_at is bumped on the status change).
    closed_recent = risks.filter(
        status="Closed", updated_at__date__gte=window_start,
    ).count()
    weeks = max(window_days / 7.0, 1.0)
    risk_velocity = round((opened_recent - closed_recent) / weeks, 2)

    # Schedule slip signal: overdue open tasks + completion-vs-elapsed gap.
    tasks = Task.objects.filter(milestone__project=project)
    overdue = tasks.exclude(status="done").filter(
        due_date__isnull=False, due_date__lt=today,
    ).count()
    total_tasks = tasks.count()
    done_tasks = tasks.filter(status="done").count()
    completion_pct = int(round((done_tasks / total_tasks) * 100)) if total_tasks else 0
    schedule_gap = _schedule_gap(project, today, completion_pct)

    return {
        "as_of": today.isoformat(),
        "window_days": window_days,
        "open_risks": open_count,
        "high_open": high_open,
        "medium_open": med_open,
        "closed_total": risks.filter(status="Closed").count(),
        "current_exposure": current_exposure,
        "opened_recent": opened_recent,
        "closed_recent": closed_recent,
        "risk_velocity": risk_velocity,
        "overdue_tasks": overdue,
        "completion_pct": completion_pct,
        "schedule_gap": schedule_gap,
    }


def _schedule_gap(project, today: date, completion_pct: int) -> Optional[int]:
    """How far behind the planned schedule the work is (elapsed% − done%)."""
    start, end = project.start_date, project.end_date
    if not start or not end or end <= start:
        return None
    if today <= start:
        elapsed = 0
    elif today >= end:
        elapsed = 100
    else:
        elapsed = int(round(((today - start).days / (end - start).days) * 100))
    return elapsed - completion_pct


def compute_forecast(signals: dict) -> dict:
    """Deterministic forecast from the computed signals.

    - exposure_trend from risk velocity (+ schedule pressure as an amplifier),
    - forecast_exposure projects current exposure one window forward,
    - predicted_high_risks extrapolates the high-risk open count,
    - outlook grades the overall picture, confidence reflects sample size.
    """
    current = signals.get("current_exposure", 0)
    velocity = signals.get("risk_velocity", 0.0)
    high_open = signals.get("high_open", 0)
    schedule_gap = signals.get("schedule_gap")
    open_risks = signals.get("open_risks", 0)

    # Trend: net opening rate decides direction; a schedule slip pushes it up.
    slipping = schedule_gap is not None and schedule_gap >= 15
    if velocity > 0.5 or (velocity >= 0 and slipping):
        trend = "rising"
    elif velocity < -0.5:
        trend = "falling"
    else:
        trend = "stable"

    # Project exposure one window forward. Each net-new risk in the window is
    # assumed to carry roughly the current average per-risk exposure; a slip
    # adds a 10% pressure premium.
    avg_per_risk = (current / open_risks) if open_risks else 30
    projected = current + round(velocity * avg_per_risk)
    if slipping:
        projected = int(round(projected * 1.1))
    projected = max(projected, 0)

    # High-risk extrapolation: if the register is growing, a share of new risks
    # land high-severity (use the current high share, min one if trend rising).
    high_share = (high_open / open_risks) if open_risks else 0
    predicted_high = high_open + int(round(max(velocity, 0) * high_share))
    if trend == "rising" and predicted_high == high_open:
        predicted_high = high_open + 1

    # Outlook.
    outlook = "green"
    if high_open >= 2 or projected >= current * 1.5 and current > 0:
        outlook = "red"
    elif high_open == 1 or trend == "rising" or (schedule_gap or 0) >= 15:
        outlook = "amber"

    # Confidence scales with how much signal we have.
    sample = open_risks + signals.get("closed_total", 0)
    if sample >= 8:
        confidence = "high"
    elif sample >= 3:
        confidence = "medium"
    else:
        confidence = "low"

    drivers = []
    if velocity > 0:
        drivers.append(f"Risk register growing at {velocity}/week (net)")
    elif velocity < 0:
        drivers.append(f"Risks closing faster than opening ({velocity}/week net)")
    if high_open:
        drivers.append(f"{high_open} high-severity risk(s) currently open")
    if slipping:
        drivers.append(f"Schedule is {schedule_gap}% behind plan, amplifying risk")
    if not drivers:
        drivers.append("Stable register with no high-severity risks")

    return {
        "current_exposure": current,
        "forecast_exposure": projected,
        "exposure_trend": trend,
        "risk_velocity": velocity,
        "predicted_high_risks": predicted_high,
        "outlook": outlook,
        "confidence": confidence,
        "drivers": drivers,
    }


_SYSTEM_PROMPT = (
    "You are a senior project risk analyst. You are given JSON signals and a "
    "computed risk forecast for a project. Return STRICT JSON with keys: "
    "narrative (2-4 sentence forward-looking risk outlook, plain business "
    "English, no markdown) and recommendations (array of short actionable "
    "strings). Base every statement on the supplied numbers; never invent data."
)


def _deterministic_narrative(signals: dict, fc: dict) -> dict:
    trend = fc["exposure_trend"]
    outlook = fc["outlook"].upper()
    cur, proj = fc["current_exposure"], fc["forecast_exposure"]
    high = signals.get("high_open", 0)
    vel = fc["risk_velocity"]

    direction = {
        "rising": "is trending UP",
        "falling": "is trending DOWN",
        "stable": "is broadly STABLE",
    }[trend]
    narrative = (
        f"Risk exposure {direction}: projected to move from {cur} to {proj} over "
        f"the next {signals.get('window_days', 30)} days (outlook {outlook}). "
        f"Net risk velocity is {vel}/week with {high} high-severity risk(s) open."
    )
    if signals.get("schedule_gap") and signals["schedule_gap"] >= 15:
        narrative += (
            f" The {signals['schedule_gap']}% schedule slip is a compounding "
            "factor and should be addressed alongside risk mitigation."
        )

    recs = []
    if trend == "rising":
        recs.append("Convene a risk review; the register is growing")
    if high >= 1:
        recs.append("Prioritise mitigation plans for open high-severity risks")
    if signals.get("schedule_gap") and signals["schedule_gap"] >= 15:
        recs.append("Re-baseline schedule or add capacity to reduce slip-driven risk")
    if signals.get("overdue_tasks"):
        recs.append(f"Clear {signals['overdue_tasks']} overdue task(s) feeding risk")
    if not recs:
        recs.append("Maintain current cadence; no corrective action required")

    return {"narrative": narrative, "recommendations": recs}


def _llm_narrative(signals, fc, *, api_key, model):
    client = Anthropic(api_key=api_key)
    user_msg = json.dumps({"signals": signals, "forecast": fc}, default=str)
    resp = client.messages.create(
        model=model, max_tokens=1200, system=_SYSTEM_PROMPT,
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
    return {
        "narrative": data.get("narrative", ""),
        "recommendations": data.get("recommendations", []) or [],
    }, raw


def forecast(
    project,
    *,
    api_key: Optional[str] = None,
    model: str = "claude-opus-4-7",
    use_llm: bool = True,
) -> dict:
    """Full forecast. Always returns a populated dict; never raises on a
    missing/failed LLM — it degrades to the deterministic narrative."""
    signals = gather_risk_signals(project)
    fc = compute_forecast(signals)

    key = api_key or os.environ.get("ANTHROPIC_API_KEY") or ""
    model_used = "deterministic"
    raw = ""
    if use_llm and _ANTHROPIC_OK and key:
        try:
            narrative = _llm_narrative(signals, fc, api_key=key, model=model)
            narrative, raw = narrative
            model_used = model
        except Exception:
            narrative = _deterministic_narrative(signals, fc)
    else:
        narrative = _deterministic_narrative(signals, fc)

    return {
        "as_of": signals["as_of"],
        "signals": signals,
        **fc,
        **narrative,
        "model_used": model_used,
        "original_ai_response": raw,
    }
