#!/usr/bin/env python3
"""Project Manager full-coverage save-test suite.

Per-methodology CREATE walkthrough — the "every methodology's primary
save endpoints don't 400" test. This is the regression net for the class
of bug that surfaced this week (PRINCE2 Stage Plan, Agile DoD, LSS-Green
phase, etc. all 400'ing on Save because of stale required-FKs or
mis-capitalised enum values).

For each methodology (scrum, kanban, waterfall, prince2, agile,
lss_green, lss_black, hybrid):
  1. Find or create a Project of that methodology.
  2. POST the primary CREATE endpoints for that methodology's resources
     with payloads built from the REAL model `choices=` tuples (see
     `backend/<methodology>/models.py`).
  3. POST project-wide resources (tasks, risks, milestones, time entries,
     budget items, expenses) against the scrum project.

Failure semantics: this script counts BOTH 4xx and 5xx on save endpoints
as failures (a 400 on a Save is exactly the bug we're trying to catch),
unlike the parent `Report.print()` which only counts 5xx. Exit code is
non-zero on any save failure so CI fails loudly.

Run:
    BASE_URL=http://localhost:8001 \\
    ADMIN_EMAIL=sami@inclufy.com \\
    ADMIN_PASSWORD=... \\
    python tests/e2e/project_manager_full.py
"""
from __future__ import annotations

import json
import sys
from datetime import date, timedelta
from pathlib import Path

# Allow running from repo root OR tests/e2e/
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from tests.e2e.common import Client, Report  # noqa: E402


# ===========================================================================
# Date helpers
# ===========================================================================
TODAY = date.today()
NEXT_WEEK = TODAY + timedelta(days=7)
NEXT_MONTH = TODAY + timedelta(days=30)


# ===========================================================================
# Failure tracker (4xx on save endpoints counts as fail; Report.print() doesn't)
# ===========================================================================
class SaveFailures:
    """Collect any non-2xx response on a save endpoint.

    Report.print() only counts 5xx + OTHER for its exit code. For this
    suite, a 400 on a POST IS the bug — we record it explicitly so the
    final exit code reflects it.
    """

    def __init__(self) -> None:
        self.failures: list[tuple[str, str, int, str]] = []

    def record(self, area: str, name: str, status: int, body: str = "") -> None:
        if not (200 <= status < 300):
            self.failures.append((area, name, status, body[:300]))

    def __len__(self) -> int:
        return len(self.failures)

    def print(self) -> None:
        if not self.failures:
            print("\n[SAVE-TEST] All save endpoints returned 2xx.")
            return
        print(f"\n[SAVE-TEST] {len(self.failures)} save failure(s):")
        for area, name, status, body in self.failures:
            print(f"  [{area}] {name}  -> {status}")
            if body:
                print(f"      body: {body}")


# ===========================================================================
# Project lookup / create
# ===========================================================================
METHODOLOGIES = [
    "scrum",
    "kanban",
    "waterfall",
    "prince2",
    "agile",
    "lean_six_sigma_green",
    "lean_six_sigma_black",
    "hybrid",
]


def get_or_create_project(c: Client, r: Report, sf: SaveFailures, methodology: str) -> int | None:
    """Return a project_id for this methodology — reuse if one exists,
    otherwise POST /api/v1/projects/ to create.
    """
    projects = c.list_items("/api/v1/projects/")
    for p in projects:
        if (p.get("methodology") or "").lower() == methodology:
            r.record("setup", f"{methodology} project (existing)", 200, note=f"id={p['id']}")
            return p["id"]

    body = {
        "name": f"E2E {methodology} Project",
        "methodology": methodology,
        "description": f"Auto-created by project_manager_full.py for {methodology} save-tests.",
        "status": "pending",
        "currency": "EUR",
        "start_date": TODAY.isoformat(),
        "end_date": NEXT_MONTH.isoformat(),
        "budget": 10000,
    }
    s, resp = c.post("/api/v1/projects/", body=body)
    r.record("setup", f"{methodology} project (create)", s, "POST", note=resp[:120])
    sf.record("setup", f"create {methodology} project", s, resp)
    if 200 <= s < 300:
        try:
            return json.loads(resp).get("id")
        except ValueError:
            return None
    return None


# ===========================================================================
# Per-methodology save walks
# ===========================================================================
def walk_scrum(c: Client, r: Report, sf: SaveFailures, pid: int) -> None:
    area = "scrum"
    # Initialize backlog (creates ProductBacklog if missing)
    base = f"/api/v1/projects/{pid}/scrum"
    s, _ = c.post(f"{base}/backlog/initialize/", body={})
    r.record(area, "backlog initialize", s, "POST")
    sf.record(area, "backlog initialize", s)

    # Backlog item — item_type/status/priority MUST match TYPE_CHOICES
    # ('user_story'/'task'/'bug'/'spike'/'epic'), STATUS_CHOICES ('new'/'ready'/...).
    s, resp = c.post(
        f"{base}/items/",
        body={
            "title": "E2E user story",
            "description": "Auto-created backlog item",
            "item_type": "user_story",
            "status": "new",
            "priority": "medium",
            "story_points": 3,
        },
    )
    r.record(area, "backlog item create", s, "POST")
    sf.record(area, "backlog item create", s, resp)

    # Sprint — STATUS_CHOICES = planning/active/review/completed/cancelled. NOT "planned".
    s, resp = c.post(
        f"{base}/sprints/",
        body={
            "name": "E2E Sprint 1",
            "number": 1,
            "goal": "Smoke-test the save endpoint",
            "start_date": TODAY.isoformat(),
            "end_date": NEXT_WEEK.isoformat(),
            "status": "planning",
        },
    )
    r.record(area, "sprint create", s, "POST")
    sf.record(area, "sprint create", s, resp)
    sprint_id = None
    if 200 <= s < 300:
        try:
            sprint_id = json.loads(resp).get("id")
        except ValueError:
            pass

    # Daily standup — needs `sprint` FK in payload (view reads it from request.data)
    if sprint_id:
        s, resp = c.post(
            f"{base}/standups/",
            body={
                "sprint": sprint_id,
                "date": TODAY.isoformat(),
                "notes": "E2E standup notes",
                "blockers": "",
            },
        )
        r.record(area, "standup create", s, "POST")
        sf.record(area, "standup create", s, resp)

        # Sprint review — sprint is NOT in read_only_fields so it's required input
        s, resp = c.post(
            f"{base}/reviews/",
            body={"sprint": sprint_id, "date": TODAY.isoformat(), "demo_notes": "E2E review"},
        )
        r.record(area, "review create", s, "POST")
        sf.record(area, "review create", s, resp)

        # Sprint retrospective
        s, resp = c.post(
            f"{base}/retrospectives/",
            body={
                "sprint": sprint_id,
                "date": TODAY.isoformat(),
                "went_well": "auth worked",
                "to_improve": "more tests",
                "action_items": "add CI",
            },
        )
        r.record(area, "retrospective create", s, "POST")
        sf.record(area, "retrospective create", s, resp)

    # Definition of Done — `project` is read_only (auto-injected by view)
    s, resp = c.post(
        f"{base}/dod/",
        body={"name": "DoD", "item": "Code reviewed", "scope": "project"},
    )
    r.record(area, "dod create", s, "POST")
    sf.record(area, "dod create", s, resp)


def walk_kanban(c: Client, r: Report, sf: SaveFailures, pid: int) -> None:
    area = "kanban"
    base = f"/api/v1/projects/{pid}/kanban"
    # Initialize board (creates board + default columns)
    s, resp = c.post(f"{base}/board/initialize/", body={})
    r.record(area, "board initialize", s, "POST")
    sf.record(area, "board initialize", s, resp)

    # Look up the board's columns so the card has a valid column FK
    cols = c.list_items(f"{base}/columns/")
    column_id = cols[0]["id"] if cols else None
    board_id = None
    boards = c.list_items(f"{base}/board/")
    if boards:
        # board endpoint sometimes returns dict; list_items unwraps results
        board_id = boards[0].get("id") if isinstance(boards[0], dict) else None

    # Column — COLUMN_TYPE_CHOICES = backlog/todo/in_progress/review/done/custom
    s, resp = c.post(
        f"{base}/columns/",
        body={"name": "E2E Custom Column", "column_type": "custom", "order": 99},
    )
    r.record(area, "column create", s, "POST")
    sf.record(area, "column create", s, resp)

    # Swimlane
    s, resp = c.post(
        f"{base}/swimlanes/",
        body={"name": "E2E Swimlane", "order": 0},
    )
    r.record(area, "swimlane create", s, "POST")
    sf.record(area, "swimlane create", s, resp)

    # Card — TYPE_CHOICES = feature/bug/task/improvement/other, PRIORITY = critical/high/medium/low
    if column_id:
        card_body = {
            "column": column_id,
            "title": "E2E Card",
            "description": "Auto-created kanban card",
            "card_type": "task",
            "priority": "medium",
        }
        if board_id:
            card_body["board"] = board_id
        s, resp = c.post(f"{base}/cards/", body=card_body)
        r.record(area, "card create", s, "POST")
        sf.record(area, "card create", s, resp)

    # Work policy — CATEGORY_CHOICES = workflow/quality/team/process
    s, resp = c.post(
        f"{base}/work-policies/",
        body={
            "title": "E2E Work Policy",
            "description": "Auto-created work policy",
            "category": "workflow",
            "is_active": True,
        },
    )
    r.record(area, "work-policy create", s, "POST")
    sf.record(area, "work-policy create", s, resp)

    # Metrics record_daily
    s, resp = c.post(f"{base}/metrics/record_daily/", body={})
    r.record(area, "metrics record_daily", s, "POST")
    sf.record(area, "metrics record_daily", s, resp)


def walk_waterfall(c: Client, r: Report, sf: SaveFailures, pid: int) -> None:
    area = "waterfall"
    base = f"/api/v1/projects/{pid}/waterfall"
    # Initialize phases (creates default WaterfallPhase rows)
    s, resp = c.post(f"{base}/initialize/", body={})
    r.record(area, "waterfall initialize", s, "POST")
    sf.record(area, "waterfall initialize", s, resp)

    phases = c.list_items(f"{base}/phases/")
    phase_id = phases[0]["id"] if phases else None

    # Requirement — PRIORITY_CHOICES is MoSCoW (must_have/should_have/could_have/wont_have)
    s, resp = c.post(
        f"{base}/requirements/",
        body={
            "requirement_id": "REQ-E2E-001",
            "title": "E2E functional requirement",
            "description": "Auto-created",
            "requirement_type": "functional",
            "priority": "should_have",
            "status": "draft",
        },
    )
    r.record(area, "requirement create", s, "POST")
    sf.record(area, "requirement create", s, resp)

    # Design document
    s, resp = c.post(
        f"{base}/designs/",
        body={
            "title": "E2E Architecture Doc",
            "document_type": "architecture",
            "version": "1.0",
            "description": "Auto-created design doc",
            "status": "draft",
        },
    )
    r.record(area, "design create", s, "POST")
    sf.record(area, "design create", s, resp)

    # Task — needs phase FK; STATUS_CHOICES = todo/in_progress/blocked/completed
    if phase_id:
        s, resp = c.post(
            f"{base}/tasks/",
            body={
                "phase": phase_id,
                "title": "E2E dev task",
                "description": "Auto-created task",
                "priority": "medium",
                "status": "todo",
            },
        )
        r.record(area, "task create", s, "POST")
        sf.record(area, "task create", s, resp)

    # Test case — STATUS = pending/passed/failed/blocked/skipped
    s, resp = c.post(
        f"{base}/test-cases/",
        body={
            "test_id": "TC-E2E-001",
            "name": "E2E unit test",
            "description": "Auto-created test case",
            "test_type": "unit",
            "priority": "medium",
            "status": "pending",
        },
    )
    r.record(area, "test-case create", s, "POST")
    sf.record(area, "test-case create", s, resp)

    # Milestone — STATUS = pending/in_progress/completed/at_risk/overdue
    s, resp = c.post(
        f"{base}/milestones/",
        body={
            "name": "E2E waterfall milestone",
            "description": "Auto-created milestone",
            "due_date": NEXT_MONTH.isoformat(),
            "status": "pending",
        },
    )
    r.record(area, "milestone create", s, "POST")
    sf.record(area, "milestone create", s, resp)

    # Change request — STATUS = submitted/under_review/approved/rejected/...
    s, resp = c.post(
        f"{base}/change-requests/",
        body={
            "change_id": "CR-E2E-001",
            "title": "E2E change request",
            "description": "Auto-created CR",
            "reason": "Smoke-test",
            "priority": "medium",
            "status": "submitted",
        },
    )
    r.record(area, "change-request create", s, "POST")
    sf.record(area, "change-request create", s, resp)

    # Risk — CATEGORY = technical/business/resource/external
    s, resp = c.post(
        f"{base}/risks/",
        body={
            "title": "E2E waterfall risk",
            "description": "Auto-created risk",
            "category": "technical",
            "probability": "medium",
            "impact": "medium",
            "status": "identified",
            "owner": "QA",
            "mitigation": "Run E2E suite in CI",
            "date_identified": TODAY.isoformat(),
        },
    )
    r.record(area, "risk create", s, "POST")
    sf.record(area, "risk create", s, resp)

    # Issue
    s, resp = c.post(
        f"{base}/issues/",
        body={
            "title": "E2E waterfall issue",
            "description": "Auto-created issue",
            "category": "process",
            "priority": "medium",
            "status": "open",
            "assignee": "QA",
            "reporter": "CI",
            "date_reported": TODAY.isoformat(),
        },
    )
    r.record(area, "issue create", s, "POST")
    sf.record(area, "issue create", s, resp)

    # Deliverable
    s, resp = c.post(
        f"{base}/deliverables/",
        body={
            "name": "E2E deliverable",
            "description": "Auto-created deliverable",
            "phase": "development",
            "type": "document",
            "status": "pending",
            "owner": "PM",
            "due_date": NEXT_MONTH.isoformat(),
            "acceptance_criteria": [],
        },
    )
    r.record(area, "deliverable create", s, "POST")
    sf.record(area, "deliverable create", s, resp)


def walk_prince2(c: Client, r: Report, sf: SaveFailures, pid: int) -> None:
    area = "prince2"
    base = f"/api/v1/projects/{pid}/prince2"

    # Brief — `project` is read-only (auto-injected). STATUS = draft/submitted/approved.
    s, resp = c.post(
        f"{base}/brief/",
        body={
            "background": "E2E project background",
            "project_approach": "Iterative",
            "outline_business_case": "Smoke-test the API",
            "status": "draft",
        },
    )
    r.record(area, "brief create", s, "POST")
    sf.record(area, "brief create", s, resp)

    # Business case
    s, resp = c.post(
        f"{base}/business-case/",
        body={
            "executive_summary": "E2E business case",
            "reasons": "CI coverage",
            "expected_benefits": "Catch broken saves",
            "timescale": "Q2",
            "costs": "Engineer-hours",
            "development_costs": 10000,
            "ongoing_costs": 500,
            "status": "draft",
        },
    )
    r.record(area, "business-case create", s, "POST")
    sf.record(area, "business-case create", s, resp)

    # PID — STATUS = draft/baselined/updated
    s, resp = c.post(
        f"{base}/pid/",
        body={
            "project_definition": "E2E PID definition",
            "project_approach": "Phased",
            "quality_management_approach": "Test-driven",
            "risk_management_approach": "Mitigate",
            "change_control_approach": "Boarded",
            "communication_management_approach": "Weekly highlight reports",
            "status": "draft",
        },
    )
    r.record(area, "pid create", s, "POST")
    sf.record(area, "pid create", s, resp)

    # Stage — STATUS = planned/active/completed/exception
    s, resp = c.post(
        f"{base}/stages/",
        body={
            "name": "E2E Stage 1 - Initiation",
            "order": 1,
            "description": "Auto-created stage",
            "planned_start_date": TODAY.isoformat(),
            "planned_end_date": NEXT_WEEK.isoformat(),
            "status": "planned",
        },
    )
    r.record(area, "stage create", s, "POST")
    sf.record(area, "stage create", s, resp)
    stage_id = None
    if 200 <= s < 300:
        try:
            stage_id = json.loads(resp).get("id")
        except ValueError:
            pass

    # Stage plan — needs `stage` FK in payload (not auto-injected). STATUS = draft/approved/baselined.
    if stage_id:
        s, resp = c.post(
            f"{base}/stage-plans/",
            body={
                "stage": stage_id,
                "plan_description": "E2E stage plan",
                "budget": 5000,
                "resource_requirements": "1 PM",
                "status": "draft",
            },
        )
        r.record(area, "stage-plan create", s, "POST")
        sf.record(area, "stage-plan create", s, resp)

    # Stage gate — needs `stage` FK. OUTCOME = pending/approved/conditional/rejected/deferred.
    if stage_id:
        s, resp = c.post(
            f"{base}/stage-gates/",
            body={
                "stage": stage_id,
                "review_date": TODAY.isoformat(),
                "outcome": "pending",
                "decision_notes": "Awaiting review",
            },
        )
        r.record(area, "stage-gate create", s, "POST")
        sf.record(area, "stage-gate create", s, resp)

    # Work package — STATUS = draft/authorized/in_progress/completed/closed
    s, resp = c.post(
        f"{base}/work-packages/",
        body={
            "title": "E2E Work Package",
            "description": "Auto-created WP",
            "status": "draft",
            "priority": "medium",
        },
    )
    r.record(area, "work-package create", s, "POST")
    sf.record(area, "work-package create", s, resp)

    # Highlight report
    s, resp = c.post(
        f"{base}/highlight-reports/",
        body={
            "report_date": TODAY.isoformat(),
            "period_start": TODAY.isoformat(),
            "period_end": NEXT_WEEK.isoformat(),
            "overall_status": "green",
            "rag_budget": "green",
            "rag_planning": "green",
            "rag_resources": "green",
            "status_summary": "On track",
            "work_completed": "Setup",
            "work_planned_next_period": "Execution",
        },
    )
    r.record(area, "highlight-report create", s, "POST")
    sf.record(area, "highlight-report create", s, resp)

    # Product — STATUS = planned/in_progress/quality_check/approved/rejected
    s, resp = c.post(
        f"{base}/products/",
        body={
            "title": "E2E Product",
            "description": "Auto-created product",
            "product_type": "specialist",
            "format": "PDF",
            "quality_criteria": "Reviewed by peer",
            "status": "planned",
        },
    )
    r.record(area, "product create", s, "POST")
    sf.record(area, "product create", s, resp)

    # Lesson — TYPE = positive/negative; CATEGORY = process/technology/people/...
    s, resp = c.post(
        f"{base}/lessons/",
        body={
            "title": "E2E Lesson",
            "lesson_type": "positive",
            "category": "process",
            "description": "Save tests prevent regressions",
            "recommendation": "Keep the CI suite green",
        },
    )
    r.record(area, "lesson create", s, "POST")
    sf.record(area, "lesson create", s, resp)

    # Tolerance — TYPE = time/cost/scope/quality/benefit/risk (unique per project)
    s, resp = c.post(
        f"{base}/tolerances/",
        body={
            "tolerance_type": "cost",
            "description": "Budget tolerance",
            "plus_tolerance": "+10%",
            "minus_tolerance": "-5%",
        },
    )
    r.record(area, "tolerance create", s, "POST")
    sf.record(area, "tolerance create", s, resp)


def walk_agile(c: Client, r: Report, sf: SaveFailures, pid: int) -> None:
    area = "agile"
    base = f"/api/v1/projects/{pid}/agile"

    # Initialize (creates AgileBudget + vision shells)
    s, resp = c.post(f"{base}/initialize/", body={})
    r.record(area, "agile initialize", s, "POST")
    sf.record(area, "agile initialize", s, resp)

    # Vision — PUT on the singleton
    s, resp = c.put(
        f"{base}/vision/",
        body={
            "vision_statement": "E2E vision",
            "target_audience": "PMs",
            "problem_statement": "Tests should fail loudly on broken saves",
            "unique_value_proposition": "CI catches regressions",
            "success_criteria": ["green CI"],
        },
    )
    r.record(area, "vision update", s, "PUT")
    sf.record(area, "vision update", s, resp)

    # Persona
    s, resp = c.post(
        f"{base}/personas/",
        body={
            "name": "E2E Persona",
            "role": "PM",
            "background": "Auto-created persona",
            "goals": ["catch regressions"],
            "pain_points": ["broken saves"],
        },
    )
    r.record(area, "persona create", s, "POST")
    sf.record(area, "persona create", s, resp)

    # Epic — PRIORITY = must_have/should_have/could_have/wont_have (MoSCoW)
    s, resp = c.post(
        f"{base}/epics/",
        body={
            "title": "E2E Epic",
            "description": "Auto-created epic",
            "priority": "should_have",
        },
    )
    r.record(area, "epic create", s, "POST")
    sf.record(area, "epic create", s, resp)

    # Backlog item — TYPE = story/task/bug/spike; STATUS = backlog/ready/in_progress/review/done
    s, resp = c.post(
        f"{base}/backlog/",
        body={
            "title": "E2E story",
            "description": "Auto-created backlog item",
            "acceptance_criteria": "Save endpoint returns 2xx",
            "item_type": "story",
            "priority": "must_have",
            "status": "backlog",
            "story_points": 3,
        },
    )
    r.record(area, "backlog create", s, "POST")
    sf.record(area, "backlog create", s, resp)

    # Iteration — start_date AND end_date are required (model has no default)
    s, resp = c.post(
        f"{base}/iterations/",
        body={
            "name": "E2E Iteration 1",
            "goal": "Smoke-test",
            "start_date": TODAY.isoformat(),
            "end_date": NEXT_WEEK.isoformat(),
            "status": "planning",
        },
    )
    r.record(area, "iteration create", s, "POST")
    sf.record(area, "iteration create", s, resp)

    # Release
    s, resp = c.post(
        f"{base}/releases/",
        body={
            "name": "E2E Release 1.0",
            "version": "1.0.0",
            "description": "Auto-created release",
            "target_date": NEXT_MONTH.isoformat(),
            "status": "planning",
            "features": ["save-test"],
        },
    )
    r.record(area, "release create", s, "POST")
    sf.record(area, "release create", s, resp)

    # Definition of Done — CATEGORY = development/testing/review/...
    s, resp = c.post(
        f"{base}/definition-of-done/",
        body={
            "description": "Code reviewed by peer",
            "category": "review",
            "is_required": True,
            "order": 1,
        },
    )
    r.record(area, "dod create", s, "POST")
    sf.record(area, "dod create", s, resp)


def walk_lss_green(c: Client, r: Report, sf: SaveFailures, pid: int) -> None:
    area = "lss_green"
    base = f"/api/v1/lss-green/projects/{pid}"

    # DMAIC phase — PHASE = define/measure/analyze/improve/control;
    # STATUS = not_started/in_progress/completed. `project` is read-only.
    for phase in ["define", "measure", "analyze", "improve", "control"]:
        s, resp = c.post(
            f"{base}/dmaic-phases/",
            body={
                "phase": phase,
                "objective": f"E2E {phase} phase objective",
                "status": "not_started",
                "order": ["define", "measure", "analyze", "improve", "control"].index(phase),
            },
        )
        r.record(area, f"dmaic phase {phase} create", s, "POST")
        sf.record(area, f"dmaic phase {phase} create", s, resp)

    # Metric — METRIC_TYPE = process_capability/defect_rate/cycle_time/throughput/yield_rate
    s, resp = c.post(
        f"{base}/metrics/",
        body={
            "metric_type": "defect_rate",
            "cp": 1.33,
            "cpk": 1.25,
            "defects_per_million": 3400,
            "sigma_level": 4.2,
            "notes": "E2E baseline",
        },
    )
    r.record(area, "metric create", s, "POST")
    sf.record(area, "metric create", s, resp)

    # Measurement
    s, resp = c.post(
        f"{base}/measurements/",
        body={
            "phase": "measure",
            "metric": "cycle_time_seconds",
            "baseline_value": 120.0,
            "target_value": 90.0,
            "actual_value": 100.0,
            "unit": "seconds",
            "measurement_date": TODAY.isoformat(),
            "notes": "E2E measurement",
        },
    )
    r.record(area, "measurement create", s, "POST")
    sf.record(area, "measurement create", s, resp)


def walk_lss_black(c: Client, r: Report, sf: SaveFailures, pid: int) -> None:
    area = "lss_black"
    base = f"/api/v1/lss-black/projects/{pid}"

    # Hypothesis test — TEST_TYPE = t_test/z_test/chi_square/anova/f_test/...
    s, resp = c.post(
        f"{base}/hypothesis-tests/",
        body={
            "test_type": "t_test",
            "null_hypothesis": "Mean cycle time = baseline",
            "alternative_hypothesis": "Mean cycle time < baseline after intervention",
            "alpha": 0.05,
            "p_value": 0.03,
            "test_statistic": -2.1,
            "sample_size": 30,
            "notes": "E2E hypothesis test",
        },
    )
    r.record(area, "hypothesis-test create", s, "POST")
    sf.record(area, "hypothesis-test create", s, resp)

    # DOE — DESIGN_TYPE = full_factorial/fractional_factorial/taguchi/...
    s, resp = c.post(
        f"{base}/doe/",
        body={
            "experiment_name": "E2E DOE",
            "design_type": "full_factorial",
            "factors": ["temp", "pressure"],
            "levels": 2,
            "response_variable": "yield",
            "objective": "Maximise yield",
        },
    )
    r.record(area, "doe create", s, "POST")
    sf.record(area, "doe create", s, resp)

    # Control plan
    s, resp = c.post(
        f"{base}/control-plans/",
        body={
            "process_step": "Assembly",
            "control_method": "SPC chart",
            "measurement_frequency": "Hourly",
            "specification_limits": "[10, 20]",
            "reaction_plan": "Stop line, recalibrate",
            "is_active": True,
        },
    )
    r.record(area, "control-plan create", s, "POST")
    sf.record(area, "control-plan create", s, resp)

    # SPC chart — CHART_TYPE = x_bar_r/x_bar_s/i_mr/p_chart/np_chart/c_chart/u_chart
    s, resp = c.post(
        f"{base}/spc-charts/",
        body={
            "chart_type": "x_bar_r",
            "ucl": 22.0,
            "center_line": 20.0,
            "lcl": 18.0,
            "usl": 25.0,
            "lsl": 15.0,
            "data_points": [],
            "subgroup_size": 5,
            "notes": "E2E SPC chart",
        },
    )
    r.record(area, "spc-chart create", s, "POST")
    sf.record(area, "spc-chart create", s, resp)


def walk_hybrid(c: Client, r: Report, sf: SaveFailures, pid: int) -> None:
    area = "hybrid"
    base = f"/api/v1/hybrid/projects/{pid}"

    # Configuration — `project` is read-only on the serializer
    s, resp = c.post(
        f"{base}/configs/",
        body={
            "primary_methodology": "agile",
            "secondary_methodologies": ["waterfall"],
            "approach_description": "Agile delivery with stage-gate governance",
            "rationale": "E2E hybrid config",
            "is_active": True,
        },
    )
    r.record(area, "config create", s, "POST")
    sf.record(area, "config create", s, resp)

    # Artifact
    s, resp = c.post(
        f"{base}/artifacts/",
        body={
            "name": "E2E Artifact",
            "source_methodology": "agile",
            "description": "Auto-created artifact",
            "content": {"k": "v"},
            "status": "active",
        },
    )
    r.record(area, "artifact create", s, "POST")
    sf.record(area, "artifact create", s, resp)

    # Phase-methodology mapping
    s, resp = c.post(
        f"{base}/phase-methodologies/",
        body={
            "phase": "Discovery",
            "methodology": "agile",
            "description": "Discovery phase uses agile",
            "order": 0,
            "start_date": TODAY.isoformat(),
            "end_date": NEXT_WEEK.isoformat(),
            "progress": 0,
        },
    )
    r.record(area, "phase-methodology create", s, "POST")
    sf.record(area, "phase-methodology create", s, resp)


# ===========================================================================
# Project-wide tabs (tasks/risks/milestones/time-entries/budget-items/expenses)
# These resources live under /api/v1/projects/<resource>/ and need a `project`
# FK in the payload (Task is special-cased: it needs `milestone` FK instead).
# ===========================================================================
def walk_project_wide(c: Client, r: Report, sf: SaveFailures, pid: int) -> None:
    area = "project-wide"

    # Risk — CATEGORY/IMPACT/LEVEL/STATUS values are CAPITALISED in the model.
    s, resp = c.post(
        "/api/v1/projects/risks/",
        body={
            "project": pid,
            "name": "E2E project-wide risk",
            "description": "Auto-created risk",
            "category": "Technical",
            "impact": "Medium",
            "probability": 30,
            "level": "Medium",
            "status": "Open",
        },
    )
    r.record(area, "risk create", s, "POST")
    sf.record(area, "risk create", s, resp)

    # Milestone — STATUS = pending/in_progress/completed/on_hold
    milestone_body = {
        "project": pid,
        "name": "E2E milestone",
        "description": "Auto-created milestone",
        "start_date": TODAY.isoformat(),
        "end_date": NEXT_MONTH.isoformat(),
        "status": "pending",
    }
    s, resp = c.post("/api/v1/projects/milestones/", body=milestone_body)
    r.record(area, "milestone create", s, "POST")
    sf.record(area, "milestone create", s, resp)
    milestone_id = None
    if 200 <= s < 300:
        try:
            milestone_id = json.loads(resp).get("id")
        except ValueError:
            pass

    # Task — needs `milestone` FK (not `project`). STATUS = todo/in_progress/done/blocked.
    if milestone_id:
        s, resp = c.post(
            "/api/v1/projects/tasks/",
            body={
                "milestone": milestone_id,
                "title": "E2E task",
                "description": "Auto-created task",
                "status": "todo",
                "priority": "medium",
                "start_date": TODAY.isoformat(),
                "due_date": NEXT_WEEK.isoformat(),
            },
        )
        r.record(area, "task create", s, "POST")
        sf.record(area, "task create", s, resp)

    # Time entry
    s, resp = c.post(
        "/api/v1/projects/time-entries/",
        body={
            "project": pid,
            "date": TODAY.isoformat(),
            "hours": 1.5,
            "description": "E2E time entry",
            "status": "draft",
            "billable": True,
        },
    )
    r.record(area, "time-entry create", s, "POST")
    sf.record(area, "time-entry create", s, resp)

    # Budget category — needed for budget item
    s, resp = c.post(
        "/api/v1/projects/budget-categories/",
        body={
            "name": f"E2E Category {pid}",
            "allocated": 1000,
            "color": "#7C3AED",
            "icon": "💼",
        },
    )
    r.record(area, "budget-category create", s, "POST")
    sf.record(area, "budget-category create", s, resp)
    category_id = None
    if 200 <= s < 300:
        try:
            category_id = json.loads(resp).get("id")
        except ValueError:
            pass

    # Budget item — TYPE = expense/income/transfer; STATUS = pending/approved/rejected
    budget_item_body = {
        "project": pid,
        "description": "E2E budget line",
        "amount": 250,
        "date": TODAY.isoformat(),
        "type": "expense",
        "status": "pending",
    }
    if category_id:
        budget_item_body["category"] = category_id
    s, resp = c.post("/api/v1/projects/budget-items/", body=budget_item_body)
    r.record(area, "budget-item create", s, "POST")
    sf.record(area, "budget-item create", s, resp)

    # Expense — CATEGORY values are CAPITALISED ("Labor Cost" / "Material Cost" / "Software" / "Other")
    s, resp = c.post(
        "/api/v1/projects/expenses/",
        body={
            "project": pid,
            "description": "E2E expense",
            "category": "Labor Cost",
            "date": TODAY.isoformat(),
            "amount": 100,
            "status": "pending",
        },
    )
    r.record(area, "expense create", s, "POST")
    sf.record(area, "expense create", s, resp)


# ===========================================================================
# Driver
# ===========================================================================
WALKERS = {
    "scrum": walk_scrum,
    "kanban": walk_kanban,
    "waterfall": walk_waterfall,
    "prince2": walk_prince2,
    "agile": walk_agile,
    "lean_six_sigma_green": walk_lss_green,
    "lean_six_sigma_black": walk_lss_black,
    "hybrid": walk_hybrid,
}


def main() -> int:
    c = Client()
    c.login()
    r = Report("PROJECT MANAGER FULL-COVERAGE SAVE-TEST REPORT")
    sf = SaveFailures()

    # Track first PID for project-wide walk
    first_pid: int | None = None

    for methodology in METHODOLOGIES:
        pid = get_or_create_project(c, r, sf, methodology)
        if pid is None:
            r.record("setup", f"{methodology} skipped — no project", -1)
            continue
        if first_pid is None:
            first_pid = pid
        walker = WALKERS.get(methodology)
        if walker is None:
            r.record("setup", f"{methodology} no walker", -1)
            continue
        walker(c, r, sf, pid)

    # Project-wide tabs — run once against the first project we got
    if first_pid is not None:
        walk_project_wide(c, r, sf, first_pid)

    # Tally Report (5xx + OTHER) and add our save-failure count (4xx on POST)
    report_exit = r.print()
    sf.print()

    # Final exit: non-zero if EITHER 5xx OR any save failed.
    return report_exit + len(sf)


if __name__ == "__main__":
    sys.exit(main())
