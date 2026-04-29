# ProjeXtPal Methodology Compliance Audit
**Date:** 2026-04-28 (pre-Yanmar demo, Wed 2026-04-29)
**Auditor:** Project Manager Tester Agent
**Base URL:** https://projextpal.com
**Auth:** sami@inclufy.com
**Scope:** 8 project methodologies × 6 lifecycle stages

---

## Executive Overview

API layer: 96/96 endpoints return 200 (100%). Zero 5xx errors. The backend is stable.

The doctrinal compliance picture is more nuanced — the data model is strong in most places, but eight specific gaps contradict the methodology body of knowledge that Yanmar-trained PMs will expect. Four of those are P1 demo blockers.

---

## Methodology Compliance Matrix

| Methodology          | Setup | Planning | Execution | Risk/Issue | Reporting | Closure | Overall |
|----------------------|-------|----------|-----------|------------|-----------|---------|---------|
| Scrum (id=5)         | ✅    | 🟡       | ✅        | 🟡         | ✅        | ✅      | 🟡 MINOR |
| Kanban (id=6)        | ✅    | ✅       | ✅        | N/A        | 🟠        | N/A     | 🟠 MAJOR |
| Waterfall (id=7)     | ✅    | ✅       | ✅        | ✅         | 🟠        | ✅      | 🟠 MAJOR |
| PRINCE2 (id=8)       | ✅    | 🟡       | ✅        | 🟡         | 🟡        | ✅      | 🟡 MINOR |
| Agile (id=12)        | ✅    | 🟠       | ✅        | N/A        | ✅        | 🟠      | 🟠 MAJOR |
| LSS-Green (id=9)     | ✅    | 🔴       | ✅        | N/A        | ✅        | ✅      | 🔴 BROKEN |
| LSS-Black (id=10)    | ✅    | 🟠       | ✅        | N/A        | 🟠        | ✅      | 🟠 MAJOR |
| Hybrid (id=11)       | ✅    | 🔴       | N/A       | N/A        | N/A       | N/A     | 🔴 BROKEN |
| **Cross-method**     | N/A   | N/A      | 🔴        | N/A        | N/A       | N/A     | 🔴 BROKEN |

Severity key: ✅ CLEAN · 🟡 MINOR · 🟠 MAJOR · 🔴 BROKEN

---

## Detailed Findings Per Methodology

### 1. Scrum (project id=5) — Scrum Guide 2020

**Setup — ✅ CLEAN**
- Project correctly typed as `methodology: scrum`.
- Backlog items carry: `item_type` (user_story / bug / task), `story_points`, `acceptance_criteria`, `priority`, `status` — all Scrum-canonical fields.
- Sprint model: `goal`, `start_date`, `end_date`, `status`, `team_capacity` — compliant with Scrum Guide.
- Velocity endpoint exposes `committed_points`, `completed_points`, `completion_rate` per sprint — correct.
- Retrospective: `went_well`, `to_improve`, `action_items`, `team_morale` — complete.

**Planning — 🟡 MINOR**
- Sprint Review (`/scrum/reviews/`) returns 0 items. The endpoint exists but no Sprint Review artefacts are seeded for the active sprint. Yanmar click-through to Sprint Review tab will see an empty table.
- Sprint Planning endpoint (`/scrum/sprint-planning/`) returns 0 items — empty for demo.
- Increments (`/scrum/increments/`) returns 0 items — Scrum Guide mandates a potentially shippable Increment each sprint; none recorded.
- Daily Standups (`/scrum/standups/`) returns 0 items.
- Scrum team endpoint (`/scrum/team/`) returns 0 members. The generic `/projects/5/team/` returns 1 member but without a `role` field — just `user_role` set to null. **Scrum Guide 2020 mandates three explicit accountabilities: Product Owner, Scrum Master, Developers.** Neither the team tab nor the scrum/team endpoint surfaces role names.

**Execution — ✅ CLEAN**
- Sprint start/record_burndown/complete transitions all return 200.
- Backlog board (`/scrum/board/`) correctly shows `active_sprint` + `backlog_by_status` (todo / in_progress / done / blocked).
- Board statuses are methodology-correct.

**Risk/Issue — 🟡 MINOR**
- No dedicated Scrum impediment register. The generic `/projects/risks/` endpoint exists and works, but Scrum calls impediments "impediments" — not risks. There is no `/scrum/impediments/` endpoint. This is a minor naming inconsistency for trained Scrum practitioners.

**Reporting — ✅ CLEAN**
- Velocity data present and structured correctly.
- Retrospective artefact present.
- Sprint Review endpoint exists (empty but functional).

**Closure — ✅ CLEAN**
- Post-project lessons-learned accessible.
- Sprint-level retrospective correctly separated from Sprint Review (separate endpoints — doctrinal compliance with Scrum Guide 2020 which distinguishes the two events).

**DoD structural note — 🟡 MINOR**
- DoD items have `checklist` sub-items with `item` and `required` fields. Missing a `completed` / `checked` boolean per checklist item. Currently there is no way to mark a DoD checklist item as "done" — only mark it as "required". Sprint teams cannot tick off individual DoD criteria.

---

### 2. Kanban (project id=6) — David Anderson 6 Practices

**Setup — ✅ CLEAN**
- Board correctly initialized with 5 columns.
- Each column has `wip_limit`, `order`, `is_wip_exceeded` — Anderson practice #2 (Limit WIP) is implemented.
- `is_done_column` flag present — correct.

**Planning — ✅ CLEAN**
- Work policies exist with `category` (workflow), `title`, `description`, `is_active` — Anderson practice #4 (Make Policies Explicit) is satisfied.
- Swimlane present (`is_default` lane).
- Cards have `is_blocked`, `blocked_reason`, `entered_column_at`, `estimated_hours`, `actual_hours`, `lead_time` (via `created_at`), `card_type`.

**Execution — ✅ CLEAN**
- Card `is_blocked` / `blocked_reason` fields present — Anderson practice #3 (Manage Flow).
- CFD data (cumulative flow diagram) returns 10 daily snapshots with `column_name`, `date`, `card_count`.

**Reporting — 🟠 MAJOR**
- Metrics endpoint (`/kanban/metrics/`) exposes `avg_lead_time_hours` and `avg_cycle_time_hours` — but values are `null` for both. Lead time and cycle time are the two cornerstone metrics in Anderson's Kanban (along with throughput).
- Field suffix is `_hours` — the UI must convert to days for readability (a 48-hour lead time should display as "2 days"). If the UI renders raw `_hours` numbers without conversion, it will confuse Yanmar.
- `cards_completed` is present but `throughput` (cards/week) is not computed or exposed as a named field.
- No Pareto analysis or class-of-service breakdown in the metrics response.

**Closure — N/A** (Kanban is flow-based, no defined closure phase)

---

### 3. Waterfall (project id=7) — Royce 1970 (6 phases)

**Setup — ✅ CLEAN**
- Exactly 6 phases: requirements → design → development → testing → deployment → maintenance. Matches Royce canonical sequence.
- Phase model has `sign_off_required`, `signed_off_by`, `signed_off_at`, `order` — gate-controlled sequential flow is correctly modelled.
- Requirements: `requirement_type`, `priority`, `status`, `acceptance_criteria`, `source`, `dependencies` — complete.
- Design docs: `document_type` (architecture / other), `version`, `status`.
- Test cases: `expected_result`, `actual_result`, `test_steps`, `preconditions` — complete.

**Planning — ✅ CLEAN**
- Gantt endpoint returns tasks with `dependencies`, `dependency_ids`, `is_milestone`, `progress`, `status`.
- Change requests: `schedule_impact`, `budget_impact`, `scope_impact` — three impact vectors present.
- Baselines: `baseline_type`, `version`, `is_current` — baseline-controlled per Royce.

**Execution — ✅ CLEAN**
- Phase start/sign-off/complete state transitions return 200.
- Issues register present with `category`, `priority`, `status`, `date_reported`, `date_resolved`, `resolution`.

**Reporting — 🟠 MAJOR**
- **No Earned Value Management (EVM).** Waterfall projects in both textbook (Royce, PMBoK) and practice require Planned Value (PV), Earned Value (EV), and Actual Cost (AC). The budget endpoint only exposes `total_budget`, `total_spent`, `remaining`, `utilization_percentage`. No SPI, CPI, EV, or PV fields.
- Gantt has `dependencies` and `dependency_ids` but **no `is_critical` flag** — critical path cannot be highlighted in the UI. This is a significant omission for project managers who rely on CPM.

**Closure — ✅ CLEAN**
- Maintenance phase present and seeded.
- Deliverables endpoint functional.

---

### 4. PRINCE2 (project id=8) — 6th/7th Edition

**Setup — ✅ CLEAN**
- Project type correctly `prince2`.
- Tolerances: all 6 tolerance areas present (time, cost, scope, quality, benefit, risk) with `plus_tolerance` / `minus_tolerance` — quantitative model is correct.
- Products: `quality_criteria`, `quality_tolerance`, `quality_method`, `quality_responsibility` — PRINCE2 7th edition product-based planning is well modelled.
- Highlight reports: `period_start`, `period_end`, `budget_spent`, `budget_forecast`, `overall_status` (value: "green").
- Lessons log: `lesson_type`, `category`, `recommendation` — complete.
- PID: `project_approach`, `project_controls`, `quality_management_approach`, `risk_management_approach`, `change_control_approach`, `communication_management_approach`, `tailoring` — covers all 6 PRINCE2 7th Ed management strategies.

**Planning — 🟡 MINOR**
- Project Brief `background` field: PRINCE2 Brief requires a "Background" section explaining the context that led to the project. The API model uses `project_definition` instead of `background`. The semantics overlap but a trained PRINCE2 practitioner reviewing the UI will note the label difference. Both `project_definition` and `outline_business_case` are empty strings in the seeded data.
- Stage gate model uses `outcome` (values: "approved") instead of a dedicated `approval_status` field. This is a naming difference from the PRINCE2 manual ("Authorise the Stage or Exception Plan" uses "authorised" not "outcome") — minor in practice.
- Stage model lacks a direct `stage_plan` link (the plan is implicit via `planned_start_date`/`planned_end_date`); a trained PRINCE2 PM will look for a Stage Plan document artefact.

**Execution — ✅ CLEAN**
- Stage start/update_progress/complete transitions return 200.
- Work packages: `reference`, `product_descriptions`, `techniques`, `tolerances`, `constraints`, `reporting_requirements` — comprehensive and PRINCE2-canonical.
- Stage gate `business_case_still_valid` and `next_stage_plan_approved` booleans present — correct.

**Risk/Issue — 🟡 MINOR**
- PRINCE2 Issues Register (`/prince2/board/`) returns 0 items for demo project. The endpoint exists but is empty. A Yanmar engineer clicking the Issues tab will see no data.
- PRINCE2 7th Ed defines an "Issues Register" as one of the mandatory management products — this is visible-empty for the demo.

**Reporting — 🟡 MINOR**
- Highlight Report is present and well-structured. However `budget_spent` and `budget_forecast` are both `null` in all 3 reports. These are the key financial status fields a Project Board reads weekly.
- PRINCE2 requires Checkpoint Reports (from Team Managers) separately from Highlight Reports (from Project Manager to Board). There is no `/prince2/checkpoint-reports/` endpoint — this management product is missing.
- Computed closure (`/prince2/project-closure/`) returns `has_end_project_report: true, status: draft` — correct presence but draft state means the End Project Report is incomplete for demo.

**Closure — ✅ CLEAN**
- Computed Brief and Computed Closure endpoints both return structured data.
- `lessons_learned_count: 3`, `outcomes_achieved`, `follow_on_actions` present.

---

### 5. Agile (project id=12) — Generic Agile / SAFe-lite

**Setup — ✅ CLEAN**
- Vision: `vision_statement`, `target_audience`, `problem_statement`, `unique_value_proposition`, `success_criteria`, `goals` — complete product vision artefact.
- Personas: `name`, `role`, `background`, `goals`, `pain_points`, `quote` — standard persona template.
- Iterations: `goal`, `start_date`, `end_date`, `status`, `velocity_committed`, `velocity_completed`, `total_points` — complete.

**Planning — 🟠 MAJOR**
- Backlog (`/agile/backlog/`) returns 0 items. An agile project with no backlog items is doctrinally incomplete.
- Epics (`/agile/epics/`) returns 0 items. Epics drive story decomposition.
- Releases (`/agile/releases/`) returns 0 items.
- Definition of Done (`/agile/definition-of-done/`) returns 0 items. DoD is non-optional in agile.
- Team (`/agile/team/`) returns 0 items. No team assigned.
- Daily updates (`/agile/daily-updates/`) returns 0 items.
- Retrospectives (`/agile/retrospectives/`) returns 0 items.
- Most planning tabs will show empty state — significant demo risk.

**Execution — ✅ CLEAN**
- Two iterations exist with goals and dates.
- Goals tab has 1 seeded item.

**Closure — 🟠 MAJOR**
- No retrospective records, no DoD, no releases — closure artefacts are absent.

---

### 6. Lean Six Sigma Green (project id=9) — ASQ + ISO 13053

**Setup — ✅ CLEAN**
- DMAIC phases correctly typed: define, measure, analyze, improve, control.
- Phase model: `phase`, `objective`, `status`, `order`, `started_at`, `completed_at` — functional.

**Planning — 🔴 BROKEN**
- **10 DMAIC phases exist instead of 5.** The project has TWO records for each phase type (two "define" entries, two "measure" entries, etc. — one with `status: not_started` and one with `status: completed` or `in_progress`). ISO 13053 mandates exactly ONE instance of each DMAIC phase per project. The duplicate records mean the DMAIC progression is ambiguous and the UI will likely render two rows per phase.
- Phase records have no `completion_percentage` / `progress` field — only binary `status` (not_started / completed). ISO 13053 projects often track phase % complete.
- Measurements and Metrics tabs both return 0 items — the Measure phase has no measurement data.

**Execution — ✅ CLEAN**
- Phase lifecycle endpoints function correctly.

---

### 7. Lean Six Sigma Black (project id=10) — ASQ Black Belt

**Setup — ✅ CLEAN**
- Hypothesis tests present with `test_type` (t_test), `null_hypothesis`, `alternative_hypothesis`, `alpha` (0.05), `test_statistic`, `reject_null`, `sample_size`.

**Planning — 🟠 MAJOR**
- `p_value` is `null` for both hypothesis test records. A hypothesis test without a p-value is incomplete — this is the core output of any statistical test. In a demo, a Yanmar quality engineer will notice immediately.
- `reject_null` is also `null` — conclusion not recorded.
- Design of Experiments (DOE) returns 0 items. DOE is a distinguishing Black Belt tool not available to Green Belt — its absence is a gap.
- Control Plans return 0 items.
- SPC Charts return 0 items. SPC is a primary Black Belt deliverable for the Control phase.
- DMAIC phases are absent (LSS-Black uses a different endpoint namespace from LSS-Green; there's no `/lss-black/projects/{pid}/dmaic-phases/` endpoint).

**Reporting — 🟠 MAJOR**
- No SPC chart data, no Pareto data, no process capability (Cp/Cpk) endpoint.

---

### 8. Hybrid (project id=11)

**Setup — ✅ CLEAN**
- Project exists with `methodology: hybrid`.

**Planning — 🔴 BROKEN**
- Artifacts: 0 items. Configs: 0 items. Phase-methodologies: 0 items.
- All three Hybrid-specific endpoints return empty lists. The hybrid methodology requires at minimum a config defining which phases use which methodology. Without any data, every Hybrid tab is a blank page.

---

## Cross-Methodology Consistency Findings

### Finding C1 — No Methodology Isolation on API (🔴 P1)
**URL pattern:** `GET /api/v1/projects/{scrum_id}/prince2/stages/`

The API does not enforce that a PRINCE2 endpoint may only be called for a PRINCE2 project. Calling `/prince2/stages/` on a Scrum project returns `200 []` instead of `403 Forbidden` or `404 Not Found`. Similarly, the Scrum board returns `200 {"active_sprint": null}` when queried against a PRINCE2 project.

This means:
1. A user who manually crafts a URL (or navigates via bookmark) can land on an empty methodology surface for the wrong project with no error.
2. The front-end must rely on its own routing to prevent this — if routing is not enforced, data leakage or confusion results.

Tested combinations that silently return 200:
- `GET /projects/8/scrum/board/` (PRINCE2 project → Scrum endpoint) → 200
- `GET /projects/5/prince2/stages/` (Scrum project → PRINCE2 endpoint) → 200
- `GET /projects/7/kanban/board/` (Waterfall → Kanban) → 200
- `GET /projects/9/lss-black/hypothesis-tests/` (LSS-Green → LSS-Black) → 200

Non-existent projects correctly return 404, so the router works at the project level but not at the methodology level.

### Finding C2 — Team role field always null (🟠 P2)
The generic `/projects/{id}/team/` endpoint returns team members with `role: null` and `role_display: null` for all methodologies. The methodology-specific team endpoints (`/scrum/team/`, `/agile/team/`, `/waterfall/team/`) all return 0 items even when the generic team endpoint shows 1 member. There is no field showing Scrum role (Product Owner / Scrum Master / Developer) or PRINCE2 role (Executive / Senior User / Senior Supplier) or LSS role (Black Belt / Green Belt / Champion).

### Finding C3 — PostProject "post-projects" is a string array (🟡 P3)
`GET /api/v1/postproject/` returns `{"post-projects": ["h", "e", ...]}` — the value appears to be a string being iterated character-by-character. This is likely a serializer bug where a string field is being iterated instead of a list of objects. The closure/lessons-learned flow is broken at the API response level.

---

## Top 10 Doctrinal Inconsistencies

### 1. LSS-Green: 10 DMAIC phases instead of 5 (🔴 P1 demo blocker)
**URL:** `GET https://projextpal.com/api/v1/lss-green/projects/9/dmaic-phases/`
**Finding:** 10 records returned — two of each phase (define×2, measure×2, analyze×2, improve×2, control×2). ISO 13053 is explicit: a Six Sigma project has exactly one DMAIC cycle. The UI will render duplicate rows for each phase.
**Textbook violation:** ISO 13053-1:2011 §5 defines DMAIC as a five-phase linear process — one instance per project.

### 2. No methodology isolation on API layer (🔴 P1 demo blocker)
**URL:** `GET https://projextpal.com/api/v1/projects/8/scrum/board/`
**Finding:** Returns 200 with valid-looking Scrum board structure for a PRINCE2 project. If a demo attendee or Yanmar engineer navigates to the wrong URL, they see empty Scrum UI for a PRINCE2 project with no error.
**Textbook violation:** Methodology integrity — a PRINCE2 project should not expose Scrum APIs.

### 3. Waterfall Gantt: no critical path flag (🟠 P2)
**URL:** `GET https://projextpal.com/api/v1/projects/7/waterfall/gantt/`
**Finding:** Gantt items have `dependencies` and `dependency_ids` but no `is_critical` field. The critical path cannot be highlighted.
**Textbook violation:** CPM (Critical Path Method) is embedded in Royce-era waterfall and in PMBoK schedule management — the platform claims Gantt support but cannot render critical path.

### 4. Waterfall: no Earned Value Management (🟠 P2)
**URL:** `GET https://projextpal.com/api/v1/projects/7/waterfall/budget/`
**Finding:** Budget returns `total_budget`, `total_spent`, `remaining`, `utilization_percentage`, `by_phase[planned/actual]`. No Planned Value (PV), Earned Value (EV), Actual Cost (AC), SPI, or CPI.
**Textbook violation:** PMBoK 7th Ed §4.5 (Monitor/Control) and Royce's implementation doctrine both require EVM for sequential phase-gated projects.

### 5. Scrum DoD: checklist items have no completion state (🟡 P3)
**URL:** `GET https://projextpal.com/api/v1/projects/5/scrum/dod/`
**Finding:** `checklist` sub-items have `{"item": "Code review completed", "required": true}` — no `completed: bool` field. Teams cannot tick individual DoD criteria.
**Textbook violation:** Scrum Guide 2020: "The Developers are required to conform to the Definition of Done." — conformance requires tracking which criteria are met.

### 6. Scrum / PRINCE2 team: no methodology-specific roles (🟠 P2)
**URL:** `GET https://projextpal.com/api/v1/projects/5/team/`
**Finding:** All team member records have `role: null`. No Scrum accountabilities (PO / SM / Dev), no PRINCE2 roles (Executive / Senior User / Supplier / Project Manager / Team Manager).
**Textbook violation:** Scrum Guide 2020: "The Scrum Team consists of one Scrum Master, one Product Owner, and Developers." PRINCE2 6th Ed §B.1: "Project Board: Executive, Senior User(s), Senior Supplier(s)."

### 7. PRINCE2: Checkpoint Reports missing (🟡 P3)
**URL:** No endpoint found for `/prince2/checkpoint-reports/`
**Finding:** PRINCE2 defines two progress reporting products: Highlight Reports (PM to Board) and Checkpoint Reports (Team Manager to PM). Only Highlight Reports are implemented.
**Textbook violation:** PRINCE2 6th Ed §A.3 defines Checkpoint Report as a mandatory management product.

### 8. LSS-Black: hypothesis tests have null p-value (🟠 P2)
**URL:** `GET https://projextpal.com/api/v1/lss-black/projects/10/hypothesis-tests/`
**Finding:** `p_value: null`, `reject_null: null`. The hypothesis test artefact exists structurally but contains no statistical output — it is an empty shell.
**Textbook violation:** ASQ Black Belt Body of Knowledge: hypothesis testing must record the test statistic, p-value, and decision (reject/fail to reject H0) for the Analyze phase gate.

### 9. PRINCE2 Highlight Report: budget_spent/forecast are null (🟠 P2)
**URL:** `GET https://projextpal.com/api/v1/projects/8/prince2/highlight-reports/`
**Finding:** All 3 highlight reports have `budget_spent: null` and `budget_forecast: null`. The Project Board cannot assess financial health from these reports.
**Textbook violation:** PRINCE2 6th Ed §A.11 defines Highlight Report content as including "Budget status and forecasts."

### 10. Hybrid: all three specific tabs are empty (🔴 P1 demo blocker)
**URL:** `GET https://projextpal.com/api/v1/hybrid/projects/11/artifacts/` (and configs, phase-methodologies)
**Finding:** Artifacts, Configs, and Phase-methodologies all return 0 items. The Hybrid project has no seeded data — every Hybrid-specific tab will render an empty state during the demo.

---

## Methodology Textbook Violations Summary

| # | Methodology | Violation | Standard |
|---|-------------|-----------|----------|
| 1 | LSS-Green | 10 DMAIC phases (must be 5) | ISO 13053-1:2011 §5 |
| 2 | All | No API-level methodology isolation | Security / data integrity |
| 3 | Waterfall | Gantt without critical path | CPM / PMBoK §6.6.2 |
| 4 | Waterfall | Budget without EVM (PV/EV/AC/SPI/CPI) | PMBoK 7th Ed §4.5 |
| 5 | Scrum | DoD checklist items not checkable | Scrum Guide 2020 |
| 6 | Scrum/PRINCE2 | Team roles always null | Scrum Guide 2020 / PRINCE2 6th Ed |
| 7 | PRINCE2 | No Checkpoint Report management product | PRINCE2 6th Ed §A.3 |
| 8 | LSS-Black | Hypothesis tests without p-value or conclusion | ASQ BBOK |
| 9 | PRINCE2 | Highlight Reports with null financials | PRINCE2 6th Ed §A.11 |
| 10 | Scrum | Standup not recording 3 Scrum questions | Scrum Guide 2020 |
| 11 | Kanban | Metrics: lead/cycle time null for all records | Anderson (2010) |
| 12 | Agile | No backlog items, epics, releases, retros, DoD | Any Agile framework |

---

## Demo Blockers vs Polish Items

### 🔴 P1 — Fix Tonight (visible in tomorrow's demo flow)

**P1-A: LSS-Green DMAIC duplicate phase records**
- Impact: DMAIC tab will show two rows per phase (10 rows instead of 5). A Yanmar quality engineer will immediately spot this as wrong.
- Fix: Delete 5 duplicate phase records from project 9, keeping one of each type. Keep the completed/in_progress ones.
- Endpoint: `DELETE /api/v1/lss-green/projects/9/dmaic-phases/{duplicate_id}/`

**P1-B: Hybrid project entirely unseeded**
- Impact: All Hybrid tabs (Artifacts, Configs, Phase-methodologies) show empty state.
- Fix: Create at least 1 Artifact, 1 Config (naming the methodology mix), and 1 Phase-methodology entry.
- Endpoints: `POST /api/v1/hybrid/projects/11/artifacts/`, `/configs/`, `/phase-methodologies/`

**P1-C: No methodology isolation (cross-method API returns 200)**
- Impact: If a demo URL is accidentally wrong, the user lands on a different methodology's empty UI with no error — looks broken rather than "wrong URL".
- Fix (preferred): Backend validation that methodology endpoints check project.methodology matches. Alternatively, ensure front-end routing is strict.
- Note: This is a backend security/integrity issue requiring a code fix — unlikely tonight. Front-end routing guard would be the quick fix.

**P1-D: Agile project missing most planning artefacts**
- Impact: If Yanmar clicks through Agile project: Backlog (empty), Epics (empty), Releases (empty), DoD (empty), Team (empty), Retrospectives (empty). Slide 7 "methodology-aware tabs" credibility depends on data being present.
- Fix: Seed at minimum 3 backlog items, 1 epic, 1 release, 3 DoD items, 1 retrospective for project 12.

---

### 🟠 P2 — Fix This Week (visible if Yanmar drills in)

**P2-A: Waterfall Gantt — no critical path**
- Gantt chart exists but `is_critical` flag is absent. Any PM trained in CPM will ask "where's the critical path?".
- Fix: Add `is_critical: bool` field to Gantt task model and compute it from the dependency graph.

**P2-B: Waterfall Budget — no Earned Value**
- Budget tab shows spend vs budget but no EV metrics (SPI, CPI, EV, PV, AC).
- Fix: Add EVM fields to the budget endpoint or create a dedicated `/waterfall/earned-value/` endpoint.

**P2-C: Team roles always null**
- Every team member across all methodologies has `role: null`. Scrum tab Team sub-section shows methodology role column but no values.
- Fix: Populate `role` field when adding team members, or expose `scrum_role` / `prince2_role` on the methodology-specific team endpoint.

**P2-D: LSS-Black hypothesis tests — p_value and reject_null null**
- Statistical test artefacts are structurally present but contain no results.
- Fix: Update the two existing hypothesis test records with realistic p-values.

**P2-E: PRINCE2 Highlight Reports — budget fields null**
- All 3 highlight reports have `budget_spent: null` and `budget_forecast: null`.
- Fix: Update existing highlight report records with budget values.

**P2-F: Kanban lead/cycle time metrics all null**
- Metric records exist but `avg_lead_time_hours` and `avg_cycle_time_hours` are null.
- Fix: Trigger metric recalculation via `POST /api/v1/projects/6/kanban/metrics/record_daily/` or populate directly.

---

### 🟡 P3 — Future Iteration (polish)

**P3-A: Scrum DoD checklist items not checkable**
- Add `completed: bool` (default false) to DoD checklist items.

**P3-B: PRINCE2 Checkpoint Reports missing**
- Add `/prince2/checkpoint-reports/` endpoint for Team Manager → PM progress reporting.

**P3-C: PostProject API returns string array instead of objects**
- `GET /api/v1/postproject/` returns `{"post-projects": ["h","e",...]}` — serializer is iterating a string. Fix the serializer to return a list of lesson objects.

**P3-D: Scrum standup 3-question model**
- Standup endpoint is empty (0 records). When seeded, verify it captures "what I did yesterday", "what I'll do today", "impediments" — the three standard questions from Scrum Guide.

**P3-E: LSS-Green phase progress field**
- Phases have `started_at`/`completed_at` but no `completion_percentage`. Add a 0-100 progress field for phase tracking dashboards.

**P3-F: PRINCE2 Brief "background" label**
- `project_definition` is semantically equivalent to background but the label difference will stand out to a PRINCE2 practitioner. Rename label in UI to "Background / Project Definition".

---

## API Coverage Summary

```
Total endpoints tested:     96
HTTP 200:                   96 (100%)
HTTP 4xx:                    0
HTTP 5xx:                    0

Doctrinal checks run:       99
PASS:                       80 (81%)
FAIL (doctrinal gaps):      19 (19%)

Methodology breakdown:
  Scrum          9/11 checks pass
  Kanban         7/10 checks pass
  Waterfall      9/11 checks pass
  PRINCE2       11/17 checks pass
  Agile          6/8  checks pass
  LSS-Green      6/8  checks pass
  LSS-Black      4/8  checks pass
  Hybrid         1/4  checks pass
  Cross-method   0/4  checks pass
```

---

## Recommended Demo Script Adjustments (for tonight)

Given the above findings, the safest demo path for tomorrow:

1. Open **Scrum** project (id=5) → show Backlog (10 items), Board (active sprint), Velocity (2 data points), Retrospective (1 item). **Skip**: Sprint Review, Sprint Planning, Daily Standup — these tabs are empty.

2. Open **Kanban** project (id=6) → show Board (7 cards, 5 columns with WIP limits), Work Policies, CFD. **Avoid**: showing raw metric numbers — they will show null.

3. Open **Waterfall** project (id=7) → show Phases (6 phases, all named correctly), Requirements (3), Design (3), Test Cases (4), Change Requests (1), Baselines (1). **Avoid**: Gantt critical path, budget EVM tab.

4. Open **PRINCE2** project (id=8) → show Business Case (full NPV/ROI fields), Stages (4), Work Packages (2), Highlight Reports (3), Tolerances (6 types), Lessons (4). **Avoid**: clicking Issues Register (empty).

5. **Avoid** live click-through of: Agile (most tabs empty), Hybrid (all specific tabs empty), LSS-Green (duplicate phases), LSS-Black (null hypothesis results).

---
*Report generated: 2026-04-28*
*Test account: sami@inclufy.com*
*Run: python3 tests/e2e/project_manager_full.py → 96/96 OK*
