"""AI Project Doctor — detect → propose → execute.

DETECT: reuse the deterministic compound-signal engine + a few direct
single-dimension checks so there is always actionable output.
PROPOSE: rule-based corrective actions per problem type — explainable and
not dependent on an external LLM key (so it always works in a demo).
EXECUTE: doctor_views turns a chosen proposal into a real Action task.
"""
from django.utils import timezone


def _proposals_for(stype, evidence):
    """Rule-based proposed actions per problem type (title, priority, due_in_days)."""
    label = evidence[0].get("label", "") if evidence else ""
    table = {
        "milestone_risk": [
            (f"Escalate milestone “{label}” to the Project Board", "high", 3),
            (f"Re-baseline the date for “{label}” and notify stakeholders", "medium", 5),
            (f"Assign a mitigation owner for the risk against “{label}”", "high", 2),
        ],
        "dependency_stall": [
            (f"Unblock the blocking task on “{label}”", "urgent", 2),
            ("Re-sequence the dependent tasks on the critical path", "medium", 4),
        ],
        "unmitigated_risk": [
            (f"Add a mitigation action for risk “{label}”", "high", 3),
            (f"Assign a risk owner to “{label}”", "medium", 2),
            ("Schedule a risk review with the Project Board", "medium", 5),
        ],
        "cost_risk": [
            ("Review the budget variance with finance", "high", 3),
            ("Raise a change request for the cost exposure", "high", 5),
        ],
        "overdue_tasks": [
            ("Expedite or reassign the overdue tasks", "urgent", 2),
            ("Push due dates with Owner approval where justified", "medium", 3),
        ],
        "unassigned_tasks": [
            ("Assign owners to the unassigned open tasks", "high", 2),
        ],
        "budget_overrun": [
            ("Re-forecast the remaining budget", "high", 3),
            ("Raise a change request / exception to the board", "high", 5),
        ],
    }
    items = table.get(stype, [("Review and assign a follow-up action", "medium", 3)])
    return [{"title": t, "priority": p, "due_in_days": d} for (t, p, d) in items]


def diagnose(project):
    """Detect project problems and attach proposed corrective actions."""
    from .compound_signals import compute_compound_signals
    from .models import Task

    today = timezone.now().date()
    problems = []

    # 1) Compound signals (deterministic cross-module detection)
    cs = compute_compound_signals(project)
    for i, s in enumerate(cs.get("signals", [])):
        problems.append({
            "id": f"cs-{i}",
            "severity": s["severity"],
            "type": s["type"],
            "title": s["title"],
            "detail": s["detail"],
            "evidence": s.get("evidence", []),
            "areas": s.get("areas", []),
            "proposed_actions": _proposals_for(s["type"], s.get("evidence", [])),
        })

    # 2) Direct single-dimension checks (always actionable)
    tasks = list(Task.objects.filter(milestone__project=project))
    overdue = [t for t in tasks if t.due_date and t.due_date < today and t.status != "done"]
    if overdue:
        problems.append({
            "id": "overdue", "severity": "high" if len(overdue) >= 3 else "medium",
            "type": "overdue_tasks",
            "title": f"{len(overdue)} overdue task(s)",
            "detail": "Tasks past their due date are not yet done.",
            "evidence": [{"kind": "task", "id": t.id, "label": t.title} for t in overdue[:5]],
            "areas": ["schedule"],
            "proposed_actions": _proposals_for("overdue_tasks", []),
        })

    unassigned = [t for t in tasks if t.assigned_to_id is None and t.status != "done"]
    if unassigned:
        problems.append({
            "id": "unassigned", "severity": "medium",
            "type": "unassigned_tasks",
            "title": f"{len(unassigned)} unassigned open task(s)",
            "detail": "Open work with no owner risks slipping.",
            "evidence": [{"kind": "task", "id": t.id, "label": t.title} for t in unassigned[:5]],
            "areas": ["resources"],
            "proposed_actions": _proposals_for("unassigned_tasks", []),
        })

    try:
        budget = float(project.budget or 0)
        spent = float(getattr(project, "spent", 0) or 0)
        if budget and spent > budget:
            problems.append({
                "id": "budget", "severity": "high", "type": "budget_overrun",
                "title": "Budget overrun",
                "detail": f"Spent €{spent:,.0f} of €{budget:,.0f} budget.",
                "evidence": [], "areas": ["cost"],
                "proposed_actions": _proposals_for("budget_overrun", []),
            })
    except Exception:
        pass

    order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    problems.sort(key=lambda p: order.get(p["severity"], 9))

    sev_counts = {}
    for p in problems:
        sev_counts[p["severity"]] = sev_counts.get(p["severity"], 0) + 1

    if sev_counts.get("critical") or sev_counts.get("high", 0) >= 3:
        health = "red"
    elif sev_counts.get("high") or sev_counts.get("medium", 0) >= 3:
        health = "amber"
    else:
        health = "green"

    return {
        "project_id": project.id,
        "project_name": project.name,
        "generated_at": timezone.now().isoformat(),
        "health": health,
        "count": len(problems),
        "severity_counts": sev_counts,
        "problems": problems,
    }
