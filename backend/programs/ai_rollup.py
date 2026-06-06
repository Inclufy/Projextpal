"""
Programme-level AI rollups — parity with the project AI layer, aggregated over a
programme's constituent projects.

- program_progress(program)          -> health/progress numbers across projects
- program_compound_signals(program)  -> compound signals from every project, tagged
- program_status_narrative(program)  -> RAG + executive narrative (deterministic;
                                        the LLM layer can build on the same facts)

Read-only; reuses the project engines so the programme view is always consistent
with the underlying projects.
"""

from django.utils import timezone


def program_progress(program):
    from projects.models import Task, Milestone, Risk

    projs = list(program.projects.all())
    today = timezone.now().date()
    tasks_total = tasks_done = overdue = ms_total = ms_done = open_risks = open_issues = 0

    for p in projs:
        tq = Task.objects.filter(milestone__project=p)
        tasks_total += tq.count()
        tasks_done += tq.filter(status="done").count()
        overdue += tq.exclude(status="done").filter(
            due_date__isnull=False, due_date__lt=today
        ).count()
        mq = Milestone.objects.filter(project=p)
        ms_total += mq.count()
        ms_done += mq.filter(status="completed").count()
        open_risks += Risk.objects.filter(project=p).exclude(status="Closed").count()
        try:
            from projects.models import Issue
            open_issues += Issue.objects.filter(
                project=p, status__in=["Open", "In Progress"]
            ).count()
        except Exception:
            pass

    completion = round(tasks_done / tasks_total * 100) if tasks_total else 0
    rag = "green"
    if overdue or open_risks or open_issues:
        rag = "amber"
    if tasks_total and completion < 40 and (overdue or open_risks):
        rag = "red"

    return {
        "projects": len(projs),
        "tasks_total": tasks_total,
        "tasks_done": tasks_done,
        "tasks_overdue": overdue,
        "completion_pct": completion,
        "milestones_total": ms_total,
        "milestones_done": ms_done,
        "open_risks": open_risks,
        "open_issues": open_issues,
        "rag": rag,
    }


def program_compound_signals(program):
    from projects.compound_signals import compute_compound_signals

    out = []
    for p in program.projects.all():
        try:
            res = compute_compound_signals(p)
        except Exception:
            continue
        for s in res.get("signals", []):
            out.append({**s, "project_id": p.id, "project_name": p.name})

    order = {"critical": 0, "high": 1, "medium": 2, "low": 3}
    out.sort(key=lambda s: order.get(s.get("severity"), 9))
    return {
        "count": len(out),
        "signals": out,
        "projects": program.projects.count(),
        "generated_at": timezone.now().isoformat(),
    }


def program_status_narrative(program):
    prog = program_progress(program)
    sig = program_compound_signals(program)
    name = program.name

    summary = (
        f"{name} spans {prog['projects']} project(s) at {prog['completion_pct']}% overall "
        f"task completion ({prog['tasks_done']}/{prog['tasks_total']}). "
        f"{prog['open_risks']} open risk(s), {prog['open_issues']} open issue(s), "
        f"{prog['tasks_overdue']} overdue task(s). "
        f"AI detected {sig['count']} cross-project compound signal(s)."
    )

    highlights = [f"{prog['tasks_done']}/{prog['tasks_total']} tasks done ({prog['completion_pct']}%)"]
    if prog["milestones_total"]:
        highlights.append(f"{prog['milestones_done']}/{prog['milestones_total']} milestones reached")
    highlights.append(f"{prog['projects']} constituent project(s)")

    blockers = []
    if prog["tasks_overdue"]:
        blockers.append(f"{prog['tasks_overdue']} overdue task(s) across projects")
    if prog["open_risks"]:
        blockers.append(f"{prog['open_risks']} open risk(s)")
    for s in sig["signals"][:3]:
        blockers.append(f"[{s.get('severity', '').upper()}] {s.get('title')} — {s.get('project_name')}")

    next_steps = []
    if prog["rag"] != "green":
        next_steps.append("Address the highest-severity compound signals + overdue work")
    if sig["count"]:
        next_steps.append("Convene the programme board to decide on flagged cross-project risks")
    if not next_steps:
        next_steps.append("Maintain pace; the programme is healthy")

    return {
        "overall_rag": prog["rag"],
        "executive_summary": summary,
        "highlights": highlights,
        "blockers": blockers,
        "next_steps": next_steps,
        "metrics": prog,
        "compound_signals": sig["signals"],
        "generated_at": timezone.now().isoformat(),
    }


def program_progress_trend(program, limit=12):
    """Aggregate trend series across the programme's projects, sourced from the
    stored GeneratedStatusReport snapshots so the chart reflects real measured
    movement (never a synthetic curve). Reports are grouped by calendar day;
    completion is averaged across reports that day, counts are summed.
    """
    from communication.models import GeneratedStatusReport

    projs = list(program.projects.all())
    if not projs:
        return {"count": 0, "points": []}
    reports = (
        GeneratedStatusReport.objects
        .filter(project__in=projs)
        .order_by("created_at")
    )
    buckets = {}  # date-iso -> aggregate
    for r in reports:
        day = r.created_at.date().isoformat()
        m = r.metrics or {}
        b = buckets.setdefault(day, {
            "date": day, "_compl": [], "open_risks": 0,
            "open_issues": 0, "overdue": 0, "signals": 0,
        })
        b["_compl"].append(int(m.get("completion_pct") or 0))
        b["open_risks"] += int(m.get("open_risks_total") or 0)
        b["open_issues"] += int(m.get("open_issues_total") or 0)
        b["overdue"] += int(m.get("tasks_overdue") or 0)
        b["signals"] += int(m.get("compound_signals") or 0)
    points = []
    for day in sorted(buckets.keys()):
        b = buckets[day]
        compl = b.pop("_compl")
        b["completion_pct"] = int(round(sum(compl) / len(compl))) if compl else 0
        points.append(b)
    points = points[-limit:]
    return {"count": len(points), "points": points}
