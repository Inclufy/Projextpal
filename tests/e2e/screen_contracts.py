"""Screen contracts: intent / expected / actual per screen.

Structured so every testing subagent can output in a uniform way:
  SCREEN:   /projects/:id/waterfall/risks
  INTENT:   Risk register for a waterfall project
  EXPECTED: List of risks with impact + probability + mitigation; Add button
  ACTUAL:   200 OK, N rows rendered, "Add" button present, 0 console errors
  STATUS:   pass | partial | fail | wrong-purpose

Populate CONTRACTS with one entry per screen as we validate them.
The Report helper (common.py) can consume ScreenContract rows directly.
"""
from __future__ import annotations

from dataclasses import dataclass
from typing import Callable


@dataclass
class ScreenContract:
    path: str          # URL path relative to https://projextpal.com
    intent: str        # 1-line: what's this screen FOR?
    expected: list[str]  # bullet list of what should be visible/available
    # Optional probe that checks a live render — takes a Client, returns (ok, notes)
    probe: Callable | None = None


# ---------------------------------------------------------------
# Project methodology screens — sample contracts
# ---------------------------------------------------------------

PROJECT_CONTRACTS: list[ScreenContract] = [
    # --- SCRUM ---
    ScreenContract(
        path="/projects/{pid}/scrum/overview",
        intent="Scrum project health dashboard",
        expected=[
            "active sprint summary",
            "sprint burndown chart",
            "team velocity trend (last 5 sprints)",
            "backlog item count + story points total",
            "upcoming ceremonies",
        ],
    ),
    ScreenContract(
        path="/projects/{pid}/scrum/backlog",
        intent="Product backlog management",
        expected=[
            "ordered list of backlog items (by priority)",
            "each item: title, story points, status, item_type",
            "filter by status + item_type",
            "add new item button",
            "drag-to-reorder",
        ],
    ),
    ScreenContract(
        path="/projects/{pid}/scrum/sprint-board",
        intent="Active sprint kanban board",
        expected=[
            "columns: New / Ready / In Progress / Done / Removed",
            "items cards in columns",
            "drag-to-move between columns (update_status)",
            "filter to show current sprint only",
        ],
    ),
    ScreenContract(
        path="/projects/{pid}/scrum/daily-standup",
        intent="Daily standup record keeping",
        expected=[
            "standup schedule",
            "per-standup: yesterday/today/blockers per team member",
            "quick add update",
        ],
    ),
    ScreenContract(
        path="/projects/{pid}/scrum/sprint-review",
        intent="Sprint review artifacts",
        expected=["completed items", "stakeholder feedback", "demo notes"],
    ),
    ScreenContract(
        path="/projects/{pid}/scrum/retrospective",
        intent="Sprint retrospective capture",
        expected=["went well / to improve / action items", "per sprint", "add items"],
    ),
    ScreenContract(
        path="/projects/{pid}/scrum/velocity",
        intent="Team velocity over time",
        expected=["committed vs completed points bar chart (last 5-10 sprints)",
                  "average velocity number"],
    ),
    ScreenContract(
        path="/projects/{pid}/scrum/definition-of-done",
        intent="Team DoD checklist",
        expected=["DoD items with checklists", "per scope: task/sprint/project",
                  "init-defaults button for new teams"],
    ),

    # --- WATERFALL ---
    ScreenContract(
        path="/projects/{pid}/waterfall/phase-gate",
        intent="Phase-gate review and transition control",
        expected=[
            "list of 6 phases (requirements/design/dev/test/deploy/maintenance)",
            "current phase highlighted",
            "start/sign-off/complete buttons per phase",
            "entry/exit criteria per phase",
        ],
    ),
    ScreenContract(
        path="/projects/{pid}/waterfall/risks",
        intent="Project risk register (waterfall-specific)",
        expected=[
            "list of risks", "severity + probability + mitigation",
            "add risk button", "status (Open/Mitigated/Closed)",
        ],
    ),
    ScreenContract(
        path="/projects/{pid}/waterfall/gantt",
        intent="Gantt chart of tasks + milestones",
        expected=[
            "timeline view", "task bars with dependencies",
            "milestones as diamonds", "critical path highlighted",
        ],
    ),

    # --- PRINCE2 ---
    ScreenContract(
        path="/projects/{pid}/prince2/project-brief",
        intent="PRINCE2 Project Brief — pre-initiation document",
        expected=[
            "background / objectives / desired outcomes / scope",
            "submit for review button",
            "approve button (if authorized)",
            "brief status: draft/review/approved",
        ],
    ),
    ScreenContract(
        path="/projects/{pid}/prince2/business-case",
        intent="PRINCE2 Business Case — justification for project",
        expected=[
            "reasons, business options, expected benefits, expected dis-benefits",
            "timescale, costs, investment appraisal, major risks",
            "add benefit + add risk sub-actions",
        ],
    ),
    ScreenContract(
        path="/projects/{pid}/prince2/stage-gates",
        intent="Stage-end review checkpoints",
        expected=["per-stage gate", "decision: approve/reject",
                  "tolerance breach handling"],
    ),
    ScreenContract(
        path="/projects/{pid}/prince2/work-packages",
        intent="Work packages authorized by PM",
        expected=[
            "list of WPs", "authorized/in-progress/complete states",
            "authorize/start/update-progress buttons",
        ],
    ),

    # --- KANBAN ---
    ScreenContract(
        path="/projects/{pid}/kanban/board",
        intent="Flow-based kanban board",
        expected=[
            "columns with WIP limits visible",
            "cards in columns",
            "drag cards to move",
            "blocked indicator on blocked cards",
        ],
    ),
    ScreenContract(
        path="/projects/{pid}/kanban/cfd",
        intent="Cumulative Flow Diagram",
        expected=["stacked area chart over time", "one band per column",
                  "flow efficiency summary"],
    ),
    ScreenContract(
        path="/projects/{pid}/kanban/work-policies",
        intent="Team's explicit working agreements",
        expected=["list of policies", "per-policy: title + description",
                  "add policy button"],
    ),
]


# ---------------------------------------------------------------
# Program screens — known duplicates still, contracts documented for
# the eventual split into dedicated components.
# ---------------------------------------------------------------

PROGRAM_CONTRACTS: list[ScreenContract] = [
    ScreenContract(
        path="/programs/{pid}/dashboard",
        intent="Program-level executive summary",
        expected=["project count", "active count", "overall progress %",
                  "budget rollup", "milestones upcoming"],
    ),
    ScreenContract(
        path="/programs/{pid}/projects",
        intent="List of projects in this program",
        expected=["one row per project", "methodology badge",
                  "per-project: progress, budget, lead, status",
                  "add-project-to-program button"],
    ),
    ScreenContract(
        path="/programs/{pid}/stakeholders",
        intent="Program-level stakeholder engagement",
        expected=["influence/interest matrix",
                  "list of stakeholders with role + engagement level",
                  "add/edit"],
    ),
    ScreenContract(
        path="/programs/{pid}/risks",
        intent="Program-level risk register (aggregates project risks)",
        expected=["top risks rolled up from projects",
                  "program-specific risks",
                  "severity + owner + mitigation"],
    ),
    ScreenContract(
        path="/programs/{pid}/governance",
        intent="Program board and decisions",
        expected=["board members + roles",
                  "decisions log",
                  "meeting schedule"],
    ),
    ScreenContract(
        path="/programs/{pid}/benefits",
        intent="Benefits register for the program",
        expected=["list of benefits", "financial value", "realization date",
                  "status: planned / realizing / realized"],
    ),
    ScreenContract(
        path="/programs/{pid}/roadmap",
        intent="Program long-term roadmap across tranches",
        expected=["timeline view", "tranches/PIs", "major milestones",
                  "inter-tranche dependencies"],
    ),
    # SAFe-specific
    ScreenContract(
        path="/programs/{pid}/pi/planning",
        intent="SAFe PI Planning workshop view",
        expected=["next PI's planning session", "team confidence votes",
                  "objectives per team", "risk ROAMing"],
    ),
    ScreenContract(
        path="/programs/{pid}/art",
        intent="Agile Release Train overview (SAFe)",
        expected=["member teams (5-12)", "sync meeting cadence",
                  "current PI indicator"],
    ),
]


# ---------------------------------------------------------------
# Academy screens
# ---------------------------------------------------------------

ACADEMY_CONTRACTS: list[ScreenContract] = [
    ScreenContract(
        path="/academy/course/{slug}",
        intent="Course marketing/detail page",
        expected=["title + description", "what-you-learn list",
                  "target audience", "price or Free badge",
                  "instructor card", "enroll/buy button"],
    ),
    ScreenContract(
        path="/academy/course/{slug}/learn",
        intent="Learning player — lesson playback + progress",
        expected=["sidebar: module + lesson nav",
                  "main: transcript/video",
                  "progress bar",
                  "mark complete button",
                  "download certificate (only when 100% + quizzes passed)"],
    ),
]


def format_contract(c: ScreenContract, actual_status: int,
                    actual_notes: str = "", lang: str = "en") -> str:
    """Format a screen contract + its test outcome for agent reports."""
    status = "pass" if 200 <= actual_status < 300 else (
        "blocked" if actual_status == 0 else
        "wrong-route" if actual_status == 404 else
        "fail" if actual_status >= 500 else "partial"
    )
    expected = "\n    - ".join(c.expected)
    return (
        f"SCREEN:   {c.path}\n"
        f"INTENT:   {c.intent}\n"
        f"EXPECTED:\n    - {expected}\n"
        f"ACTUAL:   HTTP {actual_status}  {actual_notes}\n"
        f"STATUS:   {status}\n"
    )
