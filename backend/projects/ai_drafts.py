"""
AI auto-draft generators — the "writes the first draft" half of the AI layer.

Each function reads existing project data and returns a DRAFT (never saved). The
user reviews in the UI and saves the items they want via the normal create
endpoints. This keeps a human in the loop (no auto-publish) while removing the
blank-page problem.

Deterministic core (always works, fully explainable); an optional LLM polish pass
improves wording when a company API key is configured, and silently falls back.
"""

from datetime import timedelta

from django.utils import timezone


# ---------------------------------------------------------------------------
# Lessons Learned — drafted from closed issues + resolved/mitigated risks
# ---------------------------------------------------------------------------
_RISK_CAT_TO_LESSON = {
    "Technical": "Technical", "Schedule": "Schedule", "Financial": "Cost",
    "Operational": "Process", "Strategic": "Process", "Compliance": "Quality",
}


def draft_lessons(project):
    from .models import Issue, Risk

    drafts = []
    for i in Issue.objects.filter(project=project, status__in=["Resolved", "Closed"]):
        drafts.append({
            "title": f"Lesson from issue: {i.name}",
            "description": i.description or f"Issue '{i.name}' ({i.severity}) was raised and resolved.",
            "category": "Process",
            "sentiment": "negative",
            "recommended_action": i.resolution or "Capture how this was resolved so it can be prevented next time.",
            "source": {"kind": "issue", "id": i.id},
        })
    for r in Risk.objects.filter(project=project, status__in=["Mitigated", "Closed"]):
        mitig = ""
        if getattr(r, "manual_mitigation_id", None):
            mitig = getattr(r.manual_mitigation, "description", "") or ""
        elif getattr(r, "ai_mitigation_id", None):
            mitig = getattr(r.ai_mitigation, "description", "") or ""
        drafts.append({
            "title": f"Lesson from risk: {r.name}",
            "description": r.description or f"Risk '{r.name}' ({r.level}) was managed to closure.",
            "category": _RISK_CAT_TO_LESSON.get(getattr(r, "category", ""), "Other"),
            "sentiment": "positive" if r.status == "Mitigated" else "neutral",
            "recommended_action": mitig or "Re-use the mitigation that worked here on similar future risks.",
            "source": {"kind": "risk", "id": r.id},
        })
    return drafts


# ---------------------------------------------------------------------------
# Meeting agenda — drafted from open prior actions + issues + compound signals
# ---------------------------------------------------------------------------
def draft_meeting_agenda(project):
    from .models import Milestone, Issue
    from .compound_signals import compute_compound_signals
    from communication.models import Meeting

    today = timezone.now().date()
    agenda = []
    action_items = []

    # 1) Carry-forward open actions from the most recent meeting
    last_meeting = (
        Meeting.objects.filter(project=project).order_by("-date", "-time").first()
    )
    if last_meeting:
        for a in last_meeting.action_items.filter(status="open")[:10]:
            agenda.append(f"Follow up on open action: {a.subject}")
            action_items.append({"subject": a.subject})

    # 2) Open blocker/critical issues
    for i in Issue.objects.filter(project=project, status__in=["Open", "In Progress"], severity__in=["Blocker", "Critical"])[:5]:
        agenda.append(f"Resolve {i.severity.lower()} issue: {i.name}")

    # 3) Top compound signals
    try:
        sig = compute_compound_signals(project)
        for s in sig.get("signals", [])[:3]:
            agenda.append(f"Address ({s['severity']}): {s['title']}")
    except Exception:
        pass

    # 4) Milestones due soon
    for m in Milestone.objects.filter(project=project).exclude(status="completed"):
        if m.end_date and today <= m.end_date <= today + timedelta(days=14):
            agenda.append(f"Review upcoming milestone: {m.name} (due {m.end_date})")

    if not agenda:
        agenda = ["Project status round-up", "Risks & issues review", "Next steps & actions"]

    discussion = (
        "Auto-drafted agenda from open actions, critical issues, compound risk "
        "signals and upcoming milestones. Review, edit and confirm before the meeting."
    )
    return {"agenda": agenda, "suggested_action_items": action_items, "discussion": discussion}


# ---------------------------------------------------------------------------
# Communication plan — drafted from milestones + stakeholders
# ---------------------------------------------------------------------------
def draft_comms_plan(project):
    from .models import Milestone

    # Stakeholder audiences (high influence first)
    audiences = []
    try:
        from execution.models import Stakeholder

        sh = list(Stakeholder.objects.filter(project=project))
        sponsors = [s.role or s.name for s in sh if s.governance_type == "Sponsor"]
        high = [s.role or s.name for s in sh if s.influence == "High"]
        audiences = list(dict.fromkeys(sponsors + high))
    except Exception:
        pass
    sponsor_aud = audiences[:3] or ["Sponsor", "Steering group"]
    team_aud = ["Project team"]

    events = [
        {"name": "Project kick-off", "event_type": "kickoff", "cadence": "once",
         "audience": sponsor_aud + team_aud, "notes": "Introduce scope, plan and roles."},
        {"name": "Weekly highlight report", "event_type": "regular", "cadence": "weekly",
         "audience": sponsor_aud, "notes": "1-page highlight by email."},
        {"name": "Team stand-up", "event_type": "regular", "cadence": "weekly",
         "audience": team_aud, "notes": "Progress and blockers."},
        {"name": "Project closing & handover", "event_type": "closing", "cadence": "once",
         "audience": sponsor_aud, "notes": "End report, lessons learned, handover."},
    ]

    # One gate-review event per non-completed milestone
    for m in Milestone.objects.filter(project=project).exclude(status="completed")[:6]:
        events.insert(-1, {
            "name": f"Stage/gate review: {m.name}",
            "event_type": "gate", "cadence": "once",
            "audience": sponsor_aud,
            "notes": f"Go/no-go review at milestone '{m.name}'.",
        })
    return events
