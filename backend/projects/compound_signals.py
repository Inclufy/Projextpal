"""
Compound-signal detection — the AI "connective tissue" layer.

Single modules each see one dimension (schedule, risk, cost, dependency).
A *compound signal* is a combination across modules that, together, indicates
elevated risk no single module surfaces on its own. This engine is deliberately
DETERMINISTIC + EXPLAINABLE: every signal lists the exact evidence that produced
it, so a PM can trust and act on it. (An LLM narrative can be layered on top.)

Read-only: it only queries existing data, never writes.
"""

from datetime import timedelta

from django.utils import timezone


HORIZON_DAYS = 14  # "due soon" window


def _today():
    return timezone.now().date()


def _milestone_overdue(m, today):
    return m.end_date is not None and m.end_date < today and m.status != "completed"


def _milestone_due_soon(m, today):
    return (
        m.end_date is not None
        and today <= m.end_date <= today + timedelta(days=HORIZON_DAYS)
        and m.status != "completed"
    )


def _budget_pressure(project):
    """Return (budget, spent, pct) or (0, 0, None) when budget is unknown."""
    budget = 0.0
    try:
        budget = float(getattr(project, "budget", 0) or 0)
        if not budget and getattr(project, "project_budget", None):
            budget = float(getattr(project.project_budget, "total_budget", 0) or 0)
    except Exception:
        budget = 0.0

    spent = 0.0
    try:
        from finance.models import Invoice as VendorInvoice

        for inv in VendorInvoice.objects.filter(project=project):
            spent += float(getattr(inv, "total_amount", 0) or 0)
    except Exception:
        pass
    try:
        from .models import Expense

        for ex in Expense.objects.filter(project=project):
            spent += float(getattr(ex, "amount", 0) or 0)
    except Exception:
        pass

    pct = round(spent / budget * 100, 1) if budget > 0 else None
    return budget, spent, pct


def compute_compound_signals(project):
    """Return a list of compound-signal dicts for one project."""
    from .models import Milestone, Task, Risk, Issue

    today = _today()
    signals = []

    milestones = list(Milestone.objects.filter(project=project))
    tasks = list(
        Task.objects.filter(milestone__project=project).prefetch_related("depends_on")
    )
    risks = list(
        Risk.objects.filter(project=project).select_related("affected_milestone")
    )
    issues = list(Issue.objects.filter(project=project))

    open_risks = [r for r in risks if r.status == "Open"]
    open_issues = [i for i in issues if i.status in ("Open", "In Progress")]

    def add(sev, stype, title, detail, evidence, areas):
        signals.append(
            {
                "severity": sev,
                "type": stype,
                "title": title,
                "detail": detail,
                "evidence": evidence,
                "areas": areas,
            }
        )

    # ---- S1: Milestone at compound risk (schedule × risk) --------------------
    for m in milestones:
        overdue = _milestone_overdue(m, today)
        due_soon = _milestone_due_soon(m, today)
        if not (overdue or due_soon):
            continue
        linked = [
            r
            for r in open_risks
            if (r.affected_milestone_id == m.id)
            or ("milestone" in (r.impact_areas or []))
            or ("schedule" in (r.impact_areas or []))
        ]
        if not linked:
            continue
        sev = "critical" if overdue else "high"
        when = "is overdue" if overdue else f"is due within {HORIZON_DAYS} days"
        add(
            sev,
            "milestone_risk",
            f"Milestone “{m.name}” {when} with {len(linked)} open risk(s) against it",
            f"Schedule pressure on “{m.name}” coincides with open risk exposure — "
            f"a compound risk no single view shows. Risks: "
            + "; ".join(r.name for r in linked[:3]),
            [{"kind": "milestone", "id": m.id, "label": m.name}]
            + [{"kind": "risk", "id": r.id, "label": r.name} for r in linked[:3]],
            ["schedule", "risk"],
        )

    # ---- S2: Schedule slipping while budget burning (schedule × cost) --------
    overdue_tasks = [
        t for t in tasks if t.due_date and t.due_date < today and t.status != "done"
    ]
    budget, spent, pct = _budget_pressure(project)
    if overdue_tasks and pct is not None and pct >= 75:
        add(
            "high",
            "schedule_cost",
            f"{len(overdue_tasks)} task(s) overdue while {pct}% of budget is spent",
            f"Work is slipping ({len(overdue_tasks)} overdue task(s)) at the same time "
            f"budget is nearly consumed ({pct}% of {budget:.0f}). Schedule recovery may "
            f"require spend the project can no longer afford.",
            [{"kind": "task", "id": t.id, "label": t.title} for t in overdue_tasks[:5]],
            ["schedule", "cost"],
        )

    # ---- S3: Bottleneck dependency (dependency × schedule) -------------------
    # Map task -> its dependents (tasks that depend_on it).
    dependents = {}
    for t in tasks:
        for dep in t.depends_on.all():
            dependents.setdefault(dep.id, []).append(t)
    for t in tasks:
        stuck = (t.status == "blocked") or (
            t.due_date and t.due_date < today and t.status != "done"
        )
        if not stuck:
            continue
        downstream = dependents.get(t.id, [])
        if not downstream:
            continue
        sev = "critical" if len(downstream) >= 3 else "high"
        state = "blocked" if t.status == "blocked" else "overdue"
        add(
            sev,
            "bottleneck",
            f"“{t.title}” is {state} and blocks {len(downstream)} downstream task(s)",
            f"A single {state} task is gating {len(downstream)} dependent task(s); the "
            f"delay cascades through the plan. Downstream: "
            + "; ".join(d.title for d in downstream[:3]),
            [{"kind": "task", "id": t.id, "label": t.title}]
            + [{"kind": "task", "id": d.id, "label": d.title} for d in downstream[:3]],
            ["dependency", "schedule"],
        )

    # ---- S4: Critical issue near a milestone (issue × schedule) -------------
    crit_issues = [i for i in open_issues if i.severity in ("Blocker", "Critical")]
    near_ms = [m for m in milestones if _milestone_due_soon(m, today) or _milestone_overdue(m, today)]
    if crit_issues and near_ms:
        add(
            "high",
            "issue_milestone",
            f"{len(crit_issues)} critical issue(s) open near {len(near_ms)} active milestone(s)",
            "Unresolved blocker/critical issues sit right against milestones that are due "
            "or overdue — high chance of missing the gate. Issues: "
            + "; ".join(i.name for i in crit_issues[:3]),
            [{"kind": "issue", "id": i.id, "label": i.name} for i in crit_issues[:3]]
            + [{"kind": "milestone", "id": m.id, "label": m.name} for m in near_ms[:2]],
            ["risk", "schedule"],
        )

    # ---- S5: High risk without mitigation (risk governance gap) -------------
    unmitigated = [
        r
        for r in open_risks
        if r.level == "High"
        and not getattr(r, "ai_mitigation_id", None)
        and not getattr(r, "manual_mitigation_id", None)
    ]
    if unmitigated:
        add(
            "medium",
            "unmitigated_risk",
            f"{len(unmitigated)} high-level risk(s) open with no mitigation recorded",
            "High-severity risks are live but have no mitigation plan attached — exposure "
            "is unmanaged. Risks: " + "; ".join(r.name for r in unmitigated[:3]),
            [{"kind": "risk", "id": r.id, "label": r.name} for r in unmitigated[:3]],
            ["risk"],
        )

    # ---- S6: Cost-impact risk under budget pressure (risk × cost) -----------
    if pct is not None and pct >= 75:
        cost_risks = [r for r in open_risks if "cost" in (r.impact_areas or [])]
        if cost_risks:
            add(
                "high",
                "cost_risk",
                f"{len(cost_risks)} open cost-impact risk(s) while budget is {pct}% spent",
                "Risks that would hit the budget are open exactly when there is little "
                "budget headroom left. Risks: "
                + "; ".join(r.name for r in cost_risks[:3]),
                [{"kind": "risk", "id": r.id, "label": r.name} for r in cost_risks[:3]],
                ["risk", "cost"],
            )

    order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    signals.sort(key=lambda s: order.get(s["severity"], 9))
    return {
        "generated_at": timezone.now().isoformat(),
        "count": len(signals),
        "signals": signals,
        "context": {
            "milestones": len(milestones),
            "tasks": len(tasks),
            "open_risks": len(open_risks),
            "open_issues": len(open_issues),
            "budget_pct": pct,
        },
    }
