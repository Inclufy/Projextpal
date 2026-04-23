#!/usr/bin/env python3
"""Project Manager full-coverage E2E test.

Exercises every project methodology's tabs, state transitions, and
project-wide surfaces (team, time entries, risks, milestones, tasks,
budget, post-project). Meant to be the 100% scope test for the
project-manager-tester subagent.

Run:
    python tests/e2e/project_manager_full.py

Exit code = number of 5xx + network errors (0 = all green).
"""
from __future__ import annotations

import sys
from datetime import date, timedelta
from pathlib import Path

# Allow running from repo root OR tests/e2e/
sys.path.insert(0, str(Path(__file__).resolve().parents[2]))
from tests.e2e.common import Client, Report  # noqa: E402


# --- project IDs on prod (as of today) -------------------
PROJECTS = {
    "scrum": 1,
    "kanban": 2,
    "waterfall": 3,
    "prince2": 4,
    "agile": 12,
    "lean_six_sigma_green": 9,
    "lean_six_sigma_black": 10,
    "hybrid": 11,
}

# --- tab → backend endpoint mapping -----------------------
# If the frontend adds a new tab, add its data endpoint here.
TAB_ENDPOINTS: dict[str, str] = {
    # SCRUM
    "scrum/overview":          "/api/v1/projects/{pid}/scrum/dashboard/",
    "scrum/team":              "/api/v1/projects/{pid}/scrum/team/",
    "scrum/budget":            "/api/v1/projects/budget/overview/?project={pid}",
    "scrum/backlog":           "/api/v1/projects/{pid}/scrum/items/",
    "scrum/sprint-board":      "/api/v1/projects/{pid}/scrum/board/",
    "scrum/sprint-planning":   "/api/v1/projects/{pid}/scrum/sprint-planning/",
    "scrum/sprint-review":     "/api/v1/projects/{pid}/scrum/reviews/",
    "scrum/daily-standup":     "/api/v1/projects/{pid}/scrum/standups/",
    "scrum/retrospective":     "/api/v1/projects/{pid}/scrum/retrospectives/",
    "scrum/velocity":          "/api/v1/projects/{pid}/scrum/velocity/",
    "scrum/definition-of-done":"/api/v1/projects/{pid}/scrum/dod/",
    "scrum/increments":        "/api/v1/projects/{pid}/scrum/increments/",
    # KANBAN
    "kanban/overview":         "/api/v1/projects/{pid}/kanban/dashboard/",
    "kanban/board":            "/api/v1/projects/{pid}/kanban/board/",
    "kanban/board-config":     "/api/v1/projects/{pid}/kanban/columns/",
    "kanban/wip-limits":       "/api/v1/projects/{pid}/kanban/columns/",
    "kanban/work-items":       "/api/v1/projects/{pid}/kanban/cards/",
    "kanban/work-policies":    "/api/v1/projects/{pid}/kanban/work-policies/",
    "kanban/metrics":          "/api/v1/projects/{pid}/kanban/metrics/",
    "kanban/cfd":              "/api/v1/projects/{pid}/kanban/metrics/cfd/",
    "kanban/swimlanes":        "/api/v1/projects/{pid}/kanban/swimlanes/",
    # WATERFALL
    "waterfall/overview":      "/api/v1/projects/{pid}/waterfall/dashboard/",
    "waterfall/team":          "/api/v1/projects/{pid}/waterfall/team/",
    "waterfall/budget":        "/api/v1/projects/{pid}/waterfall/budget/",
    "waterfall/requirements":  "/api/v1/projects/{pid}/waterfall/requirements/",
    "waterfall/design":        "/api/v1/projects/{pid}/waterfall/designs/",
    "waterfall/development":   "/api/v1/projects/{pid}/waterfall/tasks/",
    "waterfall/testing":       "/api/v1/projects/{pid}/waterfall/test-cases/",
    "waterfall/deployment":    "/api/v1/projects/{pid}/waterfall/deployment/",
    "waterfall/maintenance":   "/api/v1/projects/{pid}/waterfall/maintenance/",
    "waterfall/gantt":         "/api/v1/projects/{pid}/waterfall/gantt/",
    "waterfall/milestones":    "/api/v1/projects/{pid}/waterfall/milestones/",
    "waterfall/change-reqs":   "/api/v1/projects/{pid}/waterfall/change-requests/",
    "waterfall/phase-gate":    "/api/v1/projects/{pid}/waterfall/phases/",
    "waterfall/risks":         "/api/v1/projects/{pid}/waterfall/risks/",
    "waterfall/issues":        "/api/v1/projects/{pid}/waterfall/issues/",
    "waterfall/deliverables":  "/api/v1/projects/{pid}/waterfall/deliverables/",
    "waterfall/baselines":     "/api/v1/projects/{pid}/waterfall/baselines/",
    # PRINCE2
    "prince2/dashboard":       "/api/v1/projects/{pid}/prince2/dashboard/",
    "prince2/brief":           "/api/v1/projects/{pid}/prince2/brief/",
    "prince2/business-case":   "/api/v1/projects/{pid}/prince2/business-case/",
    "prince2/pid":             "/api/v1/projects/{pid}/prince2/pid/",
    "prince2/stages":          "/api/v1/projects/{pid}/prince2/stages/",
    "prince2/stage-gates":     "/api/v1/projects/{pid}/prince2/stage-gates/",
    "prince2/products":        "/api/v1/projects/{pid}/prince2/products/",
    "prince2/work-packages":   "/api/v1/projects/{pid}/prince2/work-packages/",
    "prince2/highlight-reports":"/api/v1/projects/{pid}/prince2/highlight-reports/",
    "prince2/tolerances":      "/api/v1/projects/{pid}/prince2/tolerances/",
    "prince2/lessons":         "/api/v1/projects/{pid}/prince2/lessons/",
    "prince2/board":           "/api/v1/projects/{pid}/prince2/board/",
    "prince2/computed-brief":  "/api/v1/projects/{pid}/prince2/project-brief/",
    "prince2/computed-closure":"/api/v1/projects/{pid}/prince2/project-closure/",
    # AGILE
    "agile/dashboard":         "/api/v1/projects/{pid}/agile/dashboard/",
    "agile/vision":            "/api/v1/projects/{pid}/agile/vision/",
    "agile/personas":          "/api/v1/projects/{pid}/agile/personas/",
    "agile/backlog":           "/api/v1/projects/{pid}/agile/backlog/",
    "agile/epics":             "/api/v1/projects/{pid}/agile/epics/",
    "agile/iterations":        "/api/v1/projects/{pid}/agile/iterations/",
    "agile/daily-updates":     "/api/v1/projects/{pid}/agile/daily-updates/",
    "agile/releases":          "/api/v1/projects/{pid}/agile/releases/",
    "agile/retrospectives":    "/api/v1/projects/{pid}/agile/retrospectives/",
    "agile/goals":             "/api/v1/projects/{pid}/agile/goals/",
    "agile/definition-of-done":"/api/v1/projects/{pid}/agile/definition-of-done/",
    "agile/team":              "/api/v1/projects/{pid}/agile/team/",
    # LSS-GREEN
    "lss-green/dmaic":         "/api/v1/lss-green/projects/{pid}/dmaic-phases/",
    "lss-green/measurements":  "/api/v1/lss-green/projects/{pid}/measurements/",
    "lss-green/metrics":       "/api/v1/lss-green/projects/{pid}/metrics/",
    # LSS-BLACK
    "lss-black/hypothesis":    "/api/v1/lss-black/projects/{pid}/hypothesis-tests/",
    "lss-black/doe":           "/api/v1/lss-black/projects/{pid}/doe/",
    "lss-black/control-plans": "/api/v1/lss-black/projects/{pid}/control-plans/",
    "lss-black/spc-charts":    "/api/v1/lss-black/projects/{pid}/spc-charts/",
    # HYBRID
    "hybrid/artifacts":        "/api/v1/hybrid/projects/{pid}/artifacts/",
    "hybrid/configs":          "/api/v1/hybrid/projects/{pid}/configs/",
    "hybrid/phase-meths":      "/api/v1/hybrid/projects/{pid}/phase-methodologies/",
}


def pick_pid(tab: str) -> int | None:
    """Resolve which project-id to use for this tab based on its methodology."""
    methodology = tab.split("/")[0]
    # Frontend <-> backend naming differences
    mapping = {
        "lss-green": "lean_six_sigma_green",
        "lss-black": "lean_six_sigma_black",
    }
    be_key = mapping.get(methodology, methodology)
    return PROJECTS.get(be_key)


def test_all_tabs(c: Client, r: Report) -> None:
    for tab, endpoint_tmpl in TAB_ENDPOINTS.items():
        pid = pick_pid(tab)
        if pid is None:
            r.record("project-tabs", tab, 0, note="no project for methodology")
            continue
        path = endpoint_tmpl.format(pid=pid)
        s, body = c.get(path)
        # Include item count when successful
        note = ""
        if 200 <= s < 300:
            data = c.json_or_none(body)
            if isinstance(data, list):
                note = f"{len(data)} items"
            elif isinstance(data, dict) and "results" in data:
                note = f"{len(data['results'])} items"
        r.record("project-tabs", tab, s, note=note)


def test_project_wide(c: Client, r: Report) -> None:
    """Tabs that appear on every project regardless of methodology."""
    pid = PROJECTS["scrum"]
    for name, path in [
        ("risks",          f"/api/v1/projects/risks/?project={pid}"),
        ("tasks",          f"/api/v1/projects/tasks/?project={pid}"),
        ("milestones",     f"/api/v1/projects/milestones/?project={pid}"),
        ("time-entries",   f"/api/v1/projects/time-entries/?project={pid}"),
        ("budget-items",   f"/api/v1/projects/budget-items/?project={pid}"),
        ("budget-cats",    f"/api/v1/projects/budget-categories/?project={pid}"),
        ("budget-overview",f"/api/v1/projects/budget/overview/?project={pid}"),
        ("expenses",       f"/api/v1/projects/expenses/?project={pid}"),
        ("team",           f"/api/v1/projects/{pid}/team/"),
        ("timeline",       f"/api/v1/projects/{pid}/timeline/"),
        ("ai-insights",    f"/api/v1/projects/{pid}/ai-insights/"),
    ]:
        s, _ = c.get(path)
        r.record("project-wide", name, s)


def test_state_transitions(c: Client, r: Report) -> None:
    """Lifecycle transitions that have had 5xx bugs in the past."""
    # Prince2
    pid = PROJECTS["prince2"]
    stages = c.list_items(f"/api/v1/projects/{pid}/prince2/stages/")
    if stages:
        st_id = stages[0]["id"]
        for action in ("start", "update_progress", "complete"):
            body = {"progress": 50} if action == "update_progress" else {}
            s, _ = c.post(
                f"/api/v1/projects/{pid}/prince2/stages/{st_id}/{action}/",
                body=body,
            )
            r.record("state-transitions", f"prince2 stage {action}", s, "POST")

    # Waterfall phase lifecycle
    pid = PROJECTS["waterfall"]
    phases = c.list_items(f"/api/v1/projects/{pid}/waterfall/phases/")
    if phases:
        p_id = phases[0]["id"]
        for action in ("start", "sign-off", "complete"):
            s, _ = c.post(f"/api/v1/projects/{pid}/waterfall/phases/{p_id}/{action}/", body={})
            r.record("state-transitions", f"waterfall phase {action}", s, "POST")

    # Scrum sprint lifecycle
    pid = PROJECTS["scrum"]
    sprints = c.list_items(f"/api/v1/projects/{pid}/scrum/sprints/")
    if sprints:
        sp_id = sprints[0]["id"]
        for action in ("start", "record_burndown", "complete"):
            s, _ = c.post(f"/api/v1/projects/{pid}/scrum/sprints/{sp_id}/{action}/", body={})
            r.record("state-transitions", f"scrum sprint {action}", s, "POST")


def test_post_project(c: Client, r: Report) -> None:
    """Post-project closure flow."""
    s, _ = c.get("/api/v1/postproject/")
    r.record("post-project", "list-lessons-learned", s)

    pid = PROJECTS["prince2"]
    s, _ = c.get(f"/api/v1/projects/{pid}/prince2/project-closure/")
    r.record("post-project", "prince2-computed-closure", s)


def main() -> int:
    c = Client()
    c.login()
    r = Report("PROJECT MANAGER FULL-COVERAGE REPORT")

    test_all_tabs(c, r)
    test_project_wide(c, r)
    test_state_transitions(c, r)
    test_post_project(c, r)

    return r.print()


if __name__ == "__main__":
    sys.exit(main())
