"""AI Project Doctor — detect → propose → execute.

DETECT: reuse the deterministic compound-signal engine + a few direct
single-dimension checks so there is always actionable output.
PROPOSE: rule-based corrective actions per problem type — explainable and
not dependent on an external LLM key (so it always works in a demo).
EXECUTE: doctor_views turns a chosen proposal into a real Action task.

Sprint 2 (S2-05): optional LLM check (``use_llm=True``) compares the uploaded
project documents (ProjectAIContext) with the current project state —
milestones, tasks, risks, deliverables — and flags discrepancies ("tender zegt
X, project heeft Y niet"). The deterministic path keeps running first; the LLM
check is additive and never raises.
"""
import json
import logging

from django.utils import timezone

logger = logging.getLogger(__name__)


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


def _llm_doc_vs_reality(project, user, language="nl"):
    """Compare the project's uploaded documents (ProjectAIContext) with the
    actual project state (milestones, tasks, risks, deliverables) and return a
    list of ``{title, detail, evidence}`` discrepancies for the diagnose report.

    Opt-in: callers pass ``use_llm=True`` to ``diagnose``. Fails closed on any
    error — never raises, never blocks the deterministic diagnosis.
    """
    try:
        from core.ai_context_helpers import get_project_context_prefix
    except Exception:
        return []

    doc_prefix = ""
    try:
        doc_prefix = get_project_context_prefix(user, project.id, language=language, surface="project_doctor") or ""
    except Exception:
        doc_prefix = ""
    if not doc_prefix:
        return []

    # Collect a compact snapshot of the project reality. Only pass names +
    # statuses — never descriptions or confidential free-text.
    try:
        from .models import Milestone, Task
        milestones = list(
            Milestone.objects.filter(project=project).values_list("name", flat=True)[:40]
        )
        tasks = list(
            Task.objects.filter(milestone__project=project)
            .values_list("title", flat=True)[:60]
        )
    except Exception:
        milestones, tasks = [], []

    try:
        risks = list(
            getattr(project, "risks").all().values_list("title", flat=True)[:40]
        )
    except Exception:
        risks = []

    company = getattr(user, "company", None) if user else None
    try:
        from core.llm_keys import get_openai_client
        client = get_openai_client(company)
    except Exception:
        client = None
    if client is None:
        return []

    reality = {
        "milestones": milestones,
        "tasks": tasks,
        "risks": risks,
    }

    system = (
        "Je bent een project-doctor. Vergelijk projectdocumenten met de "
        "huidige projectstatus en wijs maximaal 5 concrete discrepanties aan: "
        "zaken die de documenten expliciet noemen (eisen, deliverables, "
        "deadlines, risico's) maar die NIET in de projectstatus terugkomen. "
        "Antwoord ALLEEN met JSON: {\"findings\": [{\"title\": \"...\", "
        "\"detail\": \"1-2 zinnen\", \"severity\": \"high|medium|low\"}, ...]} "
        "Als er geen discrepanties zijn: {\"findings\": []}."
        if (language or "nl").lower() == "nl"
        else
        "You are a project doctor. Compare project documents with the current "
        "project state and point to up to 5 concrete discrepancies: things the "
        "documents explicitly mention (requirements, deliverables, deadlines, "
        "risks) that do NOT appear in the project state. Reply ONLY with JSON: "
        "{\"findings\": [{\"title\": \"...\", \"detail\": \"1-2 sentences\", "
        "\"severity\": \"high|medium|low\"}, ...]}. If no discrepancies: "
        "{\"findings\": []}."
    )
    user_block = (
        doc_prefix
        + "\n\n[PROJECT_STATE]\n"
        + json.dumps(reality, ensure_ascii=False)
    )

    try:
        resp = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user_block},
            ],
            temperature=0.1,
            max_tokens=800,
            response_format={"type": "json_object"},
        )
        content = resp.choices[0].message.content or "{}"
        data = json.loads(content)
    except Exception as e:  # pragma: no cover - LLM failure path
        logger.info("project_doctor llm doc-vs-reality failed: %s", e)
        return []

    out = []
    for i, f in enumerate((data.get("findings") or [])[:5]):
        if not isinstance(f, dict):
            continue
        title = str(f.get("title") or "").strip()[:200]
        if not title:
            continue
        detail = str(f.get("detail") or "").strip()[:600]
        sev = str(f.get("severity") or "medium").lower()
        if sev not in ("high", "medium", "low"):
            sev = "medium"
        out.append({
            "id": f"doc-{i}",
            "severity": sev,
            "type": "doc_vs_reality",
            "title": title,
            "detail": detail,
            "evidence": [],
            "areas": ["documents"],
            "proposed_actions": [
                {"title": f"Adres: {title}"[:160],
                 "priority": "high" if sev == "high" else "medium",
                 "due_in_days": 3 if sev == "high" else 5},
            ],
        })
    return out


def diagnose(project, user=None, use_llm=False, language="nl"):
    """Detect project problems and attach proposed corrective actions.

    When ``use_llm=True`` and the project has an uploaded-document context,
    the deterministic diagnosis is augmented with LLM-detected
    documents-vs-reality discrepancies (S2-05)."""
    from .compound_signals import compute_compound_signals
    from .permissions import can_view_costs_for
    from .models import Task

    today = timezone.now().date()
    problems = []
    # Cost signals + the budget-overrun check embed the absolute budget / spend;
    # hide them from viewers not allowed to see this project's costs (external
    # cross-tenant members and per-member-restricted members).
    show_costs = can_view_costs_for(user, project)

    # 1) Compound signals (deterministic cross-module detection)
    cs = compute_compound_signals(project, user=user)
    for i, s in enumerate(cs.get("signals", [])):
        if not show_costs and "cost" in s.get("areas", []):
            continue
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

    # 2) Direct single-dimension checks (always actionable). Withhold internal
    #    tasks from external cross-tenant members (their titles feed evidence).
    from .permissions import exclude_internal_for_external
    tasks = list(
        exclude_internal_for_external(
            Task.objects.filter(milestone__project=project), user
        )
    )
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
        if show_costs and budget and spent > budget:
            problems.append({
                "id": "budget", "severity": "high", "type": "budget_overrun",
                "title": "Budget overrun",
                "detail": f"Spent €{spent:,.0f} of €{budget:,.0f} budget.",
                "evidence": [], "areas": ["cost"],
                "proposed_actions": _proposals_for("budget_overrun", []),
            })
    except Exception:
        pass

    # S2-05: opt-in LLM check — flag items the uploaded docs mention but the
    # project doesn't have. Additive to deterministic findings, never blocking.
    if use_llm:
        try:
            problems.extend(_llm_doc_vs_reality(project, user, language=language))
        except Exception:  # pragma: no cover - defensive
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
