#!/usr/bin/env python3
"""Drive every project and every program to meaningful completion via
the API. Fills every tab with realistic data, exercises state transitions,
and reports a final pass/fail + progress matrix.

Run:
    python tests/e2e/seed_everything.py
"""
from __future__ import annotations

import sys
from datetime import date, timedelta
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from tests.e2e.common import Client, Report  # noqa: E402

TODAY = date.today()
IN14 = TODAY + timedelta(days=14)
IN30 = TODAY + timedelta(days=30)
IN90 = TODAY + timedelta(days=90)


# --------------------------------------------------------- project-wide
def seed_project_wide(c: Client, r: Report, pid: int, meth: str) -> None:
    area = f"pw-{meth}"

    # 3 risks
    for i, (name, cat, impact) in enumerate([
        ("Data migration complexity", "Technical", "High"),
        ("User adoption", "Operational", "Medium"),
        ("Vendor delay", "Schedule", "Medium"),
    ]):
        s, _ = c.post("/api/v1/projects/risks/", body={
            "project": pid, "name": f"{name} #{i}",
            "description": "Auto-seeded risk",
            "category": cat, "impact": impact,
            "probability": 50, "level": impact, "status": "Open",
        })
        r.record(area, f"risk {i}", s, "POST")

    # 3 milestones
    ms_ids = []
    for i, (n, days, st) in enumerate([
        ("Kick-off", 0, "completed"),
        ("Mid-phase review", 45, "in_progress"),
        ("Go-live", 90, "pending"),
    ]):
        s, body = c.post("/api/v1/projects/milestones/", body={
            "project": pid, "name": f"{n}",
            "due_date": str(TODAY + timedelta(days=days)),
            "status": st,
        })
        r.record(area, f"milestone {i}", s, "POST")
        if 200 <= s < 300:
            d = c.json_or_none(body) or {}
            if "id" in d:
                ms_ids.append(d["id"])

    # 5 tasks (require milestone FK)
    if ms_ids:
        for i, title in enumerate([
            "Charter signoff", "Stakeholder interviews",
            "Requirements doc", "Architecture review",
            "Go-live readiness",
        ]):
            s, _ = c.post("/api/v1/projects/tasks/", body={
                "milestone": ms_ids[i % len(ms_ids)],
                "title": title, "description": "Auto-seeded task",
                "status": "done" if i < 2 else "in_progress",
                "priority": "medium",
            })
            r.record(area, f"task {i}", s, "POST")

    # Time entries
    for i in range(3):
        s, _ = c.post("/api/v1/projects/time-entries/", body={
            "project": pid, "hours": 2.5 + i,
            "date": str(TODAY - timedelta(days=i)),
            "description": f"Planning session day {i}",
        })
        r.record(area, f"time-entry {i}", s, "POST")

    # Budget items
    for desc, amt in [
        ("Software licenses", "25000.00"),
        ("Consulting fees", "75000.00"),
        ("Training", "12000.00"),
    ]:
        s, _ = c.post("/api/v1/projects/budget-items/", body={
            "project": pid, "description": desc, "amount": amt,
            "date": str(TODAY), "type": "expense", "status": "approved",
        })
        r.record(area, f"budget {desc}", s, "POST")


# --------------------------------------------------------- scrum
def seed_scrum(c: Client, r: Report, pid: int) -> None:
    pfx = f"/api/v1/projects/{pid}/scrum"
    c.post(f"{pfx}/backlog/", body={})

    # Create sprint
    s, body = c.post(f"{pfx}/sprints/", body={
        "goal": "Deliver CRM lead-capture MVP",
        "start_date": str(TODAY), "end_date": str(IN14),
        "team_capacity": 40,
    })
    r.record("scrum", f"p{pid} sprint", s, "POST")
    sprint_id = (c.json_or_none(body) or {}).get("id") if 200 <= s < 300 else None

    # Backlog items
    items = []
    for t, title, prio, pts, st in [
        ("user_story", "Capture lead from form", "critical", 8, "done"),
        ("user_story", "Score lead", "high", 5, "done"),
        ("user_story", "Assign lead", "high", 5, "in_progress"),
        ("bug",        "Timezone fix", "medium", 2, "ready"),
        ("task",       "API docs", "low", 3, "new"),
    ]:
        s, body = c.post(f"{pfx}/items/", body={
            "item_type": t, "title": title, "priority": prio,
            "story_points": pts, "status": st,
            "description": "Auto-seeded",
        })
        if 200 <= s < 300:
            d = c.json_or_none(body) or {}
            if "id" in d:
                items.append(d["id"])

    r.record("scrum", f"p{pid} items-created", 200 if items else 400,
             note=f"{len(items)} items")

    # DoD + team
    s, _ = c.post(f"{pfx}/dod/initialize_defaults/", body={})
    r.record("scrum", f"p{pid} dod-init", s, "POST")

    # Transitions
    if sprint_id:
        for action in ("start", "record_burndown", "complete"):
            s, _ = c.post(f"{pfx}/sprints/{sprint_id}/{action}/", body={})
            r.record("scrum", f"p{pid} sprint {action}", s, "POST")

    # Item status transitions
    for iid in items[:3]:
        s, _ = c.post(f"{pfx}/items/{iid}/update_status/",
                      body={"status": "done"})
        r.record("scrum", f"p{pid} item {iid} done", s, "POST")


# --------------------------------------------------------- kanban
def seed_kanban(c: Client, r: Report, pid: int) -> None:
    pfx = f"/api/v1/projects/{pid}/kanban"
    s, body = c.post(f"{pfx}/board/initialize/", body={})
    r.record("kanban", f"p{pid} board-init", s, "POST")

    cols = c.list_items(f"{pfx}/columns/")
    col = cols[0]["id"] if cols else None
    boards = c.list_items(f"{pfx}/board/")
    bid = boards[0]["id"] if boards else None

    card_ids = []
    for title, prio in [
        ("Password reset ticket", "high"),
        ("Escalation follow-up", "critical"),
        ("Data export request", "medium"),
        ("Refund case", "high"),
    ]:
        body_d = {"title": title, "priority": prio,
                  "column": col, "board": bid, "description": "auto"}
        s, body = c.post(f"{pfx}/cards/", body=body_d)
        r.record("kanban", f"p{pid} card {title[:20]}", s, "POST")
        if 200 <= s < 300:
            d = c.json_or_none(body) or {}
            if "id" in d:
                card_ids.append(d["id"])

    # Actions
    if card_ids:
        s, _ = c.post(f"{pfx}/cards/{card_ids[0]}/toggle_blocked/", body={})
        r.record("kanban", f"p{pid} toggle-blocked", s, "POST")
        s, _ = c.post(f"{pfx}/cards/{card_ids[0]}/add_comment/",
                      body={"content": "Need more info"})
        r.record("kanban", f"p{pid} add-comment", s, "POST")

    s, _ = c.post(f"{pfx}/metrics/record_daily/", body={})
    r.record("kanban", f"p{pid} daily-metric", s, "POST")


# --------------------------------------------------------- waterfall
def seed_waterfall(c: Client, r: Report, pid: int) -> None:
    pfx = f"/api/v1/projects/{pid}/waterfall"
    s, _ = c.post(f"{pfx}/initialize/", body={})
    r.record("waterfall", f"p{pid} init", s, "POST")

    phases = c.list_items(f"{pfx}/phases/")
    if phases:
        # Start + progress + complete phase 1
        pid_phase = phases[0]["id"]
        for action in ("start", "sign-off", "complete"):
            s, _ = c.post(f"{pfx}/phases/{pid_phase}/{action}/", body={})
            r.record("waterfall", f"p{pid} phase {action}", s, "POST")

    # Deployment checklist
    s, _ = c.post(f"{pfx}/deployment/initialize/", body={})
    r.record("waterfall", f"p{pid} deploy-init", s, "POST")
    items = c.list_items(f"{pfx}/deployment/")
    if items:
        s, _ = c.post(f"{pfx}/deployment/{items[0]['id']}/toggle/", body={})
        r.record("waterfall", f"p{pid} deploy-toggle", s, "POST")


# --------------------------------------------------------- prince2
def seed_prince2(c: Client, r: Report, pid: int) -> None:
    pfx = f"/api/v1/projects/{pid}/prince2"

    # Brief
    s, body = c.post(f"{pfx}/brief/", body={
        "background": "CRM consolidation.", "objectives": "Unified 360 view.",
        "desired_outcomes": "Faster response.", "scope": "Sales+support.",
    })
    r.record("prince2", f"p{pid} brief", s, "POST")
    brief_id = (c.json_or_none(body) or {}).get("id") if 200 <= s < 300 else None
    if brief_id:
        for action in ("submit_for_review", "approve"):
            s, _ = c.post(f"{pfx}/brief/{brief_id}/{action}/", body={})
            r.record("prince2", f"p{pid} brief {action}", s, "POST")

    # Business case
    c.post(f"{pfx}/business-case/", body={
        "reasons": "Consolidate CRMs.", "business_options": "Keep/Upgrade/New",
        "expected_benefits": "20% faster.", "expected_dis_benefits": "Training.",
        "timescale": "6 months", "costs_text": "€500k",
        "investment_appraisal": "ROI 2x", "major_risks": "Data/adoption.",
    })

    # PID + stages + tolerances
    c.post(f"{pfx}/pid/", body={"project_definition": "CRM", "project_approach": "Phased"})
    c.post(f"{pfx}/stages/initialize_stages/", body={})
    c.post(f"{pfx}/tolerances/initialize/", body={})

    # Stage lifecycle
    stages = c.list_items(f"{pfx}/stages/")
    if stages:
        st_id = stages[0]["id"]
        for action in ("start", "update_progress", "complete"):
            body_d = {"progress": 100} if action == "update_progress" else {}
            s, _ = c.post(f"{pfx}/stages/{st_id}/{action}/", body=body_d)
            r.record("prince2", f"p{pid} stage {action}", s, "POST")

    # Products
    for title in ["Discovery Report", "Data Model Spec", "Cutover Plan"]:
        s, _ = c.post(f"{pfx}/products/", body={
            "title": title, "description": "seeded",
            "product_type": "specialist",
        })
        r.record("prince2", f"p{pid} product {title[:20]}", s, "POST")

    # Highlight report + lesson
    c.post(f"{pfx}/highlight-reports/", body={
        "period_start": str(TODAY - timedelta(days=14)),
        "period_end": str(TODAY), "summary": "On track.",
    })
    c.post(f"{pfx}/lessons/", body={
        "title": "Validate migration on full corpus",
        "lesson_type": "negative", "category": "technology",
        "description": "Sample missed edge cases.",
    })


# --------------------------------------------------------- agile
def seed_agile(c: Client, r: Report, pid: int) -> None:
    pfx = f"/api/v1/projects/{pid}/agile"
    s, _ = c.post(f"{pfx}/initialize/", body={})
    r.record("agile", f"p{pid} init", s, "POST")

    # Persona
    c.post(f"{pfx}/personas/", body={
        "name": "Sales Sam", "role": "Sales",
        "goals": "Close fast.", "pain_points": "Fragmented data.",
    })

    # Iteration
    s, body = c.post(f"{pfx}/iterations/", body={
        "name": "Iter-1", "start_date": str(TODAY),
        "end_date": str(IN14), "goal": "Ship C360",
    })
    r.record("agile", f"p{pid} iteration-create", s, "POST")
    iid = (c.json_or_none(body) or {}).get("id") if 200 <= s < 300 else None
    if iid:
        for action in ("start", "complete"):
            s, _ = c.post(f"{pfx}/iterations/{iid}/{action}/", body={})
            r.record("agile", f"p{pid} iteration {action}", s, "POST")


# --------------------------------------------------------- lss (both green + black)
def seed_lss(c: Client, r: Report, variant: str, pid: int) -> None:
    pfx = f"/api/v1/lss-{variant}/projects/{pid}"

    if variant == "green":
        # DMAIC phases
        for i, phase in enumerate(["define", "measure", "analyze", "improve", "control"]):
            s, _ = c.post(f"{pfx}/dmaic-phases/", body={
                "phase": phase, "project": pid,
                "objective": f"Seeded {phase}", "status": "completed" if i < 3 else "in_progress",
                "order": i,
            })
            r.record(f"lss-{variant}", f"p{pid} {phase}", s, "POST")
    else:  # black
        c.post(f"{pfx}/hypothesis-tests/", body={
            "project": pid, "name": "Training reduces DPMO",
            "null_hypothesis": "No effect", "alternative_hypothesis": "Reduces",
            "test_type": "t_test",
        })


# --------------------------------------------------------- hybrid
def seed_hybrid(c: Client, r: Report, pid: int) -> None:
    pfx = f"/api/v1/hybrid/projects/{pid}"
    # Hybrid needs specific fields we don't know. Probe the GETs so at
    # least we see the tabs render.
    for tab in ("artifacts", "configs", "phase-methodologies"):
        s, _ = c.get(f"{pfx}/{tab}/")
        r.record("hybrid", f"p{pid} {tab} GET", s)


# --------------------------------------------------------- program-wide
def seed_program(c: Client, r: Report, prog: dict) -> None:
    pid = prog["id"]
    meth = prog.get("methodology") or "unknown"
    area = f"prog-{meth}"

    for name in ("Benefit A — Efficiency", "Benefit B — Revenue"):
        s, _ = c.post(f"/api/v1/programs/{pid}/benefits/", body={
            "name": name, "description": "Auto-seeded",
            "financial_value": 100000,
            "measurement_method": "KPI dashboard",
        })
        r.record(area, f"p{pid} benefit {name[:12]}", s, "POST")

    for name, days in [("Tranche 1", 30), ("Mid-programme review", 90),
                       ("Close-out", 180)]:
        s, _ = c.post(f"/api/v1/programs/{pid}/milestones/", body={
            "name": name, "due_date": str(TODAY + timedelta(days=days)),
            "status": "pending",
        })
        r.record(area, f"p{pid} milestone {name[:10]}", s, "POST")

    for name in ("Resourcing risk", "Stakeholder alignment"):
        s, _ = c.post(f"/api/v1/programs/{pid}/risks/", body={
            "name": name, "description": "auto",
            "category": "Strategic", "impact": "High",
            "probability": 40, "level": "High", "status": "Open",
        })
        r.record(area, f"p{pid} risk {name[:15]}", s, "POST")


# --------------------------------------------------------- main
def main() -> int:
    c = Client()
    c.login()
    r = Report("SEED EVERYTHING — drive all projects + programs to activity")

    # Projects
    projects = c.list_items("/api/v1/projects/")
    print(f"Seeding {len(projects)} projects...")
    for p in projects:
        pid = p["id"]
        meth = p.get("methodology") or "unknown"
        seed_project_wide(c, r, pid, meth)
        if meth == "scrum":
            seed_scrum(c, r, pid)
        elif meth == "kanban":
            seed_kanban(c, r, pid)
        elif meth == "waterfall":
            seed_waterfall(c, r, pid)
        elif meth == "prince2":
            seed_prince2(c, r, pid)
        elif meth == "agile":
            seed_agile(c, r, pid)
        elif meth == "lean_six_sigma_green":
            seed_lss(c, r, "green", pid)
        elif meth == "lean_six_sigma_black":
            seed_lss(c, r, "black", pid)
        elif meth == "hybrid":
            seed_hybrid(c, r, pid)

    # Programs
    programs = c.list_items("/api/v1/programs/")
    print(f"\nSeeding {len(programs)} programs...")
    for prog in programs:
        seed_program(c, r, prog)

    return r.print()


if __name__ == "__main__":
    sys.exit(main())
