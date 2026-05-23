# ProjeXtPal Relationality Audit — 2026-05-23

**Branch**: `sprint-yanmar-fit` (= `master`, HEAD `62daa616`)
**Scope**: backend models + frontend create/edit screens for 11 areas — PRINCE2, Scrum, Kanban, Agile, Waterfall, LSS Green, LSS Black, Hybrid, Six Sigma, Governance, Programs.
**Mode**: read-only investigation. No code changes.

---

## TL;DR

- **Total entities surveyed**: ~75 Django model classes across 11 apps.
- **Screens scored**: 56 create/edit-capable pages (subset of ~110 page files; excludes pure dashboards/board views).
- **Mean relationality score**: **1.0 / 3** — most screens have *one* parent FK picker and almost no children/siblings/peer linkage.
- **Worst-scoring area**: **Waterfall** (0.6 / 3). Rich FK graph (`Requirement → Design`, `Requirement → TestCase`, `Requirement → Task`, `Phase → Task`, `Phase → Milestone`, `Phase → ChangeRequest`, `Phase → BudgetItem`) but the UI ignores almost every cross-link. Test-case screen does not pick a Requirement at all.
- **Best-scoring area**: **Governance** (2.0 / 3), driven entirely by `PortfolioDetail.tsx` which is the canonical example of how relationality *should* look across the whole app.
- **The single most impactful pattern**: **dialogs collect only the entity's own scalar fields, never its children, never its sibling/peer FKs, never inline-create a related row.** Every methodology suffers from this in the same way.

---

## Top 10 highest-impact gaps (prioritised)

1. **[PRINCE2] Stage Plan has no Work Package linkage, no Products list** — `Prince2StagePlan.tsx:127-145` creates a Stage Plan with only the `stage` FK. The model says a Stage Plan "describes how work will be done", but the dialog never lets you attach Work Packages, never shows the WPs currently under that stage, and never lists Products. From a Stage in `Prince2Dashboard.tsx:255-285` you can click into "stage-plan", but from the Stage Plan card you cannot see its Stage details, its WPs, or its Products. Tree-view collapse: **none**. → Add: WP list inside each Stage Plan card + Products list + inline "Add WP" affordance.
2. **[PRINCE2] Work Package has no Products list, no checkpoint reports, no Stage Plan link** — `Prince2WorkPackages.tsx:138-176`. Model has reverse relation `WorkPackage.checkpoint_reports` (CheckpointReport.work_package FK exists, see `backend/prince2/models.py:312-318`) and Products (`Product.project` — but **no FK to WorkPackage**, only project — *this itself is a model-level gap*). Today the WP card just shows title + progress; click does nothing.
3. **[Six Sigma] Solution dialog does not pick `addresses_root_cause` (FishboneCause)** — `SixSigmaSolutions.tsx:45`. The whole DMAIC philosophy is "Improve solutions address Analyze root causes". Model has the FK (`backend/sixsigma/models.py:617`) but the create form skips it. From a FishboneCause, you also can't see "solutions addressing me". This is the single most semantically wrong missing link in Six Sigma.
4. **[Agile] Backlog item create form picks neither Epic nor Iteration** — `frontend/src/pages/agile/AgileBacklog.tsx:128-138`. Model has `epic = FK(AgileEpic)` (line 157 of models) and `iteration = FK(AgileIteration)`. Iteration is settable via a separate "→ Iteration" mini-select on the row (`:101-104`) — fine, but Epic is *completely absent* from the UI. No way to assign a story to an epic, ever. AgileEpic page (no `AgileEpics.tsx` file in pages/agile — only `AgileBacklog`) so there is no view that even shows epics-with-stories nested.
5. **[Waterfall] Test case create form does not pick a Requirement** — `WaterfallTesting.tsx:24,33`. Model says `requirement = FK(WaterfallRequirement)` (`backend/waterfall/models.py:236`). Traceability matrix is the single most important Waterfall deliverable. Today it is empty by construction.
6. **[Waterfall] Requirements page does not show derived Designs, Tasks, or Tests** — `WaterfallRequirements.tsx` has no inbound-relation panel. Model has reverse `WaterfallDesignDocument.requirements` M2M (`:153`), `WaterfallTask.requirements` M2M (`:191`), and `WaterfallTestCase.requirement` FK (`:236`). User cannot answer "which test cases cover REQ-014?" from the UI.
7. **[Governance] Decision has no UI at all** — Model `governance.Decision` (line 157 of `backend/governance/models.py`) exists with FK to `programs.Program`, `decided_by`, etc. No `Decisions.tsx` page in `frontend/src/pages/governance/`. The user's example "show a Decision linked to a Board, Meeting, Risk" is doubly broken — Decision has no FK to Board/Meeting in the model *and* no UI.
8. **[Governance] BoardDetail does not show its Program or Project linkage** — `BoardDetail.tsx:112-127`. Model has `program = FK(Program)` and `project = FK(Project)` (`backend/governance/models.py:55-56`). The detail page surfaces neither, and Edit dialog (`:155-177`) lets you change name/type/frequency but not the parent linkage. No Meetings or Decisions list either.
9. **[PRINCE2] Highlight Report does not pick a Stage** — `Prince2HighlightReport.tsx`. Model has `stage = FK(Stage)` (`backend/prince2/models.py:363`) used by `auto_draft_content`. Without selecting a stage, the report can't be filed against a stage, breaking PRINCE2's "Highlight Report per stage" rule.
10. **[Scrum] Sprint screen does not show its BacklogItems on the same page** — `ScrumSprintPlanning.tsx:65-92` is a list of planning meetings with a Sprint FK select, but no nested view of the items inside that sprint. `ScrumSprintBoard.tsx` is the only screen that actually does it (status columns), but only for the *active* sprint and only as a kanban view. From a Sprint card on Sprint Planning you cannot drill into its items.

---

## Per-area detail

Scoring rubric:
- **0** = flat form, ignores all FK relations (or even has them in the model but doesn't expose).
- **1** = picks 1+ parent FK on create but is otherwise flat.
- **2** = picks parent FKs and shows some related entities, but no inline create / weak navigation.
- **3** = pick + show + clickable navigation + inline-create of children. Reference: `governance/PortfolioDetail.tsx`.

### PRINCE2

**Backend**: `backend/prince2/models.py` (619 LOC)

#### Entities

| Entity | PK | FK out | Reverse relations |
|---|---|---|---|
| ProjectBrief | int | project | — |
| BusinessCase | int | project | benefits, risks |
| BusinessCaseBenefit | int | business_case | — |
| BusinessCaseRisk | int | business_case | — |
| ProjectInitiationDocument (PID) | int | project | — |
| **Stage** | int | project | plans, gates, work_packages, highlight_reports, (LessonsLog.stage) |
| **StagePlan** | int | stage | — *(no WP linkage in model)* |
| StageGate | int | stage, reviewer (User) | — |
| **WorkPackage** | int | project, stage, team_manager (User) | checkpoint_reports |
| ProjectBoard | int | project (1-to-1) | members |
| ProjectBoardMember | int | board, user (User) | — |
| CheckpointReport | int | project, work_package, team_manager | — |
| **HighlightReport** | int | project, stage | — |
| EndProjectReport | int | project | — |
| LessonsLog | int | project, stage, logged_by | — |
| ProjectTolerance | int | project | — (`unique_together` proj+type) |
| **Product** | int | project, quality_responsibility (User), owner (User) | — *(no FK to WorkPackage — model gap)* |

#### Screens

| Screen | Primary entity | Score | Gap notes |
|---|---|---|---|
| `Prince2ProjectBrief.tsx` | ProjectBrief | 1 | Standalone form. No "linked PID" pointer despite implicit project link. |
| `Prince2BusinessCase.tsx` | BusinessCase + benefits + risks | 2 | Does manage child benefits + risks inline. No link to ProjectBrief. |
| `Prince2Dashboard.tsx` | Stage (read) | 2 | Clickable Stage list, WP count per stage. No drill into individual stage detail page. |
| `Prince2StagePlan.tsx` | StagePlan | 1 | Stage FK select ✓. **No WP list, no Products, no clickable Stage badge.** See `:106` — stage rendered as Badge text only. |
| `Prince2StageGate.tsx` | StageGate | 1 | Stage FK select. No view of related Stage Plan / WP completion. |
| `Prince2WorkPackages.tsx` | WorkPackage | 1 | Stage FK select. **No Products, no checkpoint reports, no parent StagePlan link.** Status-action buttons but no navigation. |
| `Prince2HighlightReport.tsx` | HighlightReport | 0 | **No Stage FK select** despite model having it. Pure flat form. |
| `Prince2LessonsLog.tsx` | LessonsLog | 1 | Stage FK select. No back-link from Stage view. |
| `Prince2ProjectBoard.tsx` | ProjectBoard + members | 2 | Manages members inline. No link to Stage / WP authorisation history. |
| `Prince2Tolerances.tsx` | ProjectTolerance | 1 | unique-per-type but flat. |
| `Prince2ProjectClosure.tsx` | EndProjectReport | 0 | No mention of stages closed, products delivered, lessons logged. |
| `Prince2ClosureChecklist.tsx` | EndProjectReport (read) | 0 | Same. |
| `Prince2Governance.tsx` | (composite) | 1 | Lists multiple, no cross-nav. |

**Area mean: 1.0 / 3.**

**Cross-cutting PRINCE2 gaps:**
- Products model has no FK to WorkPackage — that's a **model-level** gap. PRINCE2 manual: Products are the deliverable of a WP. Recommend: add `Product.work_package = FK(WorkPackage, null=True)`.
- No Stage detail page. Stage exists only via its Dashboard card and its child screens (StagePlan, StageGate, WP). User has no place to "see Stage 2 in context".
- Checkpoint reports model exists but has no frontend page at all (`grep -i checkpoint` in pages/prince2 → empty).

---

### Scrum

**Backend**: `backend/scrum/models.py` (582 LOC)

#### Entities

| Entity | PK | FK out | Reverse relations |
|---|---|---|---|
| ProductBacklog | int | project (1-to-1) | items |
| **BacklogItem** | int | backlog, parent (self), assignee, reporter, sprint | children |
| **Sprint** | int | project | items, planning_meeting, sprint_goal, reviews, retrospectives, velocity, dod_entries, burndown_data, standups, increments |
| SprintGoal | int | sprint (1-to-1) | — |
| SprintPlanning | int | sprint (1-to-1), attendees M2M, facilitator | — |
| Increment | int | sprint, project, completed_tasks M2M (BacklogItem) | — |
| SprintBurndown | int | sprint | — |
| DailyStandup | int | sprint | updates |
| StandupUpdate | int | standup, user | — |
| SprintReview | int | sprint, attendees M2M, stakeholders M2M, facilitator, demo_items M2M (BacklogItem) | — |
| SprintRetrospective | int | sprint | — |
| Velocity | int | project, sprint (1-to-1) | — |
| DefinitionOfDone | int | project, created_by | completions, entries |
| DoDChecklistCompletion | int | definition_of_done, completed_by | — |
| DoDChecklistEntry | int | dod_item, sprint, completed_by | — |
| ScrumTeam | int | project, user | — |

#### Screens

| Screen | Primary entity | Score | Gap notes |
|---|---|---|---|
| `ScrumBacklog.tsx` | BacklogItem | 1 | Has sprint move select. **No parent-item picker** even though `BacklogItem.parent` exists (self-FK for epic→story→sub-task). |
| `ScrumSprintBoard.tsx` | Sprint + items | 2 | Active sprint columns ✓. Only active sprint. No drill-in. |
| `ScrumSprintPlanning.tsx` | SprintPlanning | 1 | Sprint FK select. No nested item list. No view of committed_story_points vs items. |
| `ScrumSprintReview.tsx` | SprintReview | 0/1 | (Not inspected in detail) likely flat. |
| `ScrumDailyStandup.tsx` | DailyStandup | 1 | Sprint FK. No nested StandupUpdate per user. |
| `ScrumIncrements.tsx` | Increment | 1 | Sprint FK. `completed_tasks` M2M is in model but UI form doesn't surface it. |
| `ScrumTeam.tsx` | ScrumTeam | 1 | Project + user picker. |
| `ScrumBudget.tsx` | (no model — likely uses project budget) | 0 | n/a. |
| `ScrumDefinitionOfDone.tsx` | DefinitionOfDone | 1 | Project FK implicit. No per-sprint completion view. |
| `ScrumRetrospective.tsx` | SprintRetrospective | 1 | Sprint FK. |
| `ScrumVelocity.tsx` | Velocity (read) | 1 | Per-sprint chart. |

**Area mean: 0.9 / 3.**

**Cross-cutting Scrum gaps:**
- `BacklogItem.parent` (self-FK for epic→story→task) **never exposed** in UI. The model supports it; the screens don't.
- `SprintReview.demo_items` M2M (which items got demoed) — invisible.
- Sprint card on any screen doesn't link → Sprint Board.

---

### Kanban

**Backend**: `backend/kanban/models.py` (227 LOC)

#### Entities

| Entity | PK | FK out | Reverse relations |
|---|---|---|---|
| KanbanBoard | int | project (1-to-1) | columns, swimlanes, cards, cfd_data, metrics |
| KanbanColumn | int | board | cards, cards_moved_from, cards_moved_to, violations |
| KanbanSwimlane | int | board | cards |
| **KanbanCard** | int | board, column, swimlane, assignee, reporter | history, comments, checklists |
| CardHistory | int | card, from_column, to_column, moved_by | — |
| CardComment | int | card, user | — |
| CardChecklist | int | card | items |
| ChecklistItem | int | checklist | — |
| CumulativeFlowData | int | board, column | — |
| KanbanMetrics | int | board | — |
| WipLimitViolation | int | column | — |
| WorkPolicy | int | project | — |

#### Screens

| Screen | Primary entity | Score | Gap notes |
|---|---|---|---|
| `KanbanBoard.tsx` | Cards by column (read) | 2 | Drag/move ✓. No swimlane filter, no card-detail dialog. |
| `KanbanWorkItems.tsx` | KanbanCard | 1 | Column FK + assignee ✓. **No swimlane select**, no checklists, no comments, no parent-card. |
| `KanbanBoardConfiguration.tsx` | KanbanColumn | 1 | Manages columns. No view of cards per column. |
| `KanbanWIPLimits.tsx` | KanbanColumn (limit) | 1 | Per-column. No violation history. |
| `KanbanWorkPolicies.tsx` | WorkPolicy | 0 | Standalone. No card-policy link in model either. |
| `KanbanBlockedItems.tsx` | KanbanCard (filtered) | 2 | Shows blocked cards with reason. |
| `KanbanTeam.tsx` | (no model — uses project users) | 0 | n/a. |
| `KanbanBudget.tsx` | (no kanban-specific budget model) | 0 | n/a. |

**Area mean: 1.0 / 3.**

**Cross-cutting Kanban gaps:**
- `CardComment`, `CardChecklist`, `ChecklistItem` exist in model but **no UI surfaces them**. Card-edit dialog (`KanbanWorkItems.tsx:55`) is just type/priority/column/assignee/due_date.
- `KanbanSwimlane` exists in model but never settable on a card.

---

### Agile

**Backend**: `backend/agile/models.py` (380 LOC)

#### Entities

| Entity | PK | FK out | Reverse relations |
|---|---|---|---|
| AgileTeamMember | int | project, user | — |
| AgileProductVision | int | project (1-to-1) | goals |
| AgileProductGoal | int | vision | — |
| AgileUserPersona | int | project | — |
| **AgileEpic** | int | project | stories |
| **AgileBacklogItem** | int | project, epic, assignee, iteration | — |
| **AgileIteration** | int | project | items, daily_updates, retrospective, (releases via M2M) |
| AgileRelease | int | project, iterations M2M | — |
| AgileDailyUpdate | int | project, iteration, user | — |
| AgileRetrospective | int | iteration (1-to-1), facilitator | items |
| AgileRetroItem | int | retrospective, assignee, created_by | — |
| AgileBudget | int | project (1-to-1) | items |
| AgileBudgetItem | int | budget, iteration | — |
| DefinitionOfDone | int | project | — |

#### Screens

| Screen | Primary entity | Score | Gap notes |
|---|---|---|---|
| `AgileProductVision.tsx` | AgileProductVision | 1 | Goals nested? unclear. |
| `AgileUserPersonas.tsx` | AgileUserPersona | 1 | Standalone. |
| `AgileBacklog.tsx` | AgileBacklogItem | 1 | **NO Epic select** despite FK in model. Move-to-iteration is a row-level action only. |
| `AgileIterationBoard.tsx` | AgileIteration + items | 2 | Active iteration columns. |
| `AgileReleasePlanning.tsx` | AgileRelease | 1 | M2M iterations exists in model — likely partial UI. |
| `AgileDailyProgress.tsx` | AgileDailyUpdate | 1 | Iteration FK + user. |
| `AgileRetrospective.tsx` | AgileRetrospective + items | 2 | Items nested. |
| `AgileDefinitionOfDone.tsx` | DefinitionOfDone | 1 | Project FK implicit. |
| `AgileVelocity.tsx` | (read AgileIteration) | 1 | n/a. |
| `AgileBudget.tsx` | AgileBudget + items | 1 | Iteration FK on items. |
| `AgileTeam.tsx` | AgileTeamMember | 1 | n/a. |
| `AgileOverview.tsx` | (composite) | 1 | n/a. |

**Area mean: 1.1 / 3.**

**Cross-cutting Agile gaps:**
- **No AgileEpics page at all** — there is no way to even view/create an Epic in the dedicated UI. (Search: `find pages/agile -name "*Epic*"` → empty.)
- Backlog ↔ Epic linkage broken (item 4 in Top 10).
- `AgileRelease.iterations` M2M may be configurable in release planning, but no reverse view: "iteration X is in releases A, B, C".

---

### Waterfall

**Backend**: `backend/waterfall/models.py` (704 LOC)

#### Entities

| Entity | PK | FK out | Reverse relations |
|---|---|---|---|
| WaterfallPhase | int | project | tasks, milestones, team_members, gantt_tasks |
| WaterfallTeamMember | int | project, user, phase | — |
| **WaterfallRequirement** | int | project, created_by, approved_by, dependencies M2M (self) | designs (M2M reverse), tasks (M2M reverse), test_cases (FK reverse) |
| **WaterfallDesignDocument** | int | project, author, reviewer, requirements M2M | — |
| **WaterfallTask** | int | project, phase, assignee, requirements M2M | — |
| **WaterfallTestCase** | int | project, requirement, assignee, executed_by | — |
| WaterfallMilestone | int | project, phase, owner | — |
| WaterfallGanttTask | int | project, phase, dependencies M2M (self), assignee | — |
| WaterfallChangeRequest | int | project, affected_phase, requested_by, reviewed_by | — |
| WaterfallDeploymentChecklist | int | project, completed_by, assignee | — |
| WaterfallMaintenanceItem | int | project, reported_by, assignee | — |
| WaterfallBudget | int | project (1-to-1) | items, evm_records (via project) |
| EarnedValueRecord | int | project, recorded_by | — |
| WaterfallBudgetItem | int | budget, phase | — |
| WaterfallRisk | int | project | — *(no FK to phase, owner is plain string)* |
| WaterfallIssue | int | project | — *(no FK to phase, assignee/reporter are strings — model-level gap)* |
| WaterfallDeliverable | int | project | — *(phase is `CharField`, not FK — model-level gap)* |
| WaterfallBaseline | int | project | — |

#### Screens

| Screen | Primary entity | Score | Gap notes |
|---|---|---|---|
| `WaterfallOverview.tsx` | (composite) | 1 | Phase summary. |
| `WaterfallRequirements.tsx` | WaterfallRequirement | 1 | **No reverse-relation panels** — no tests/designs/tasks list per requirement. |
| `WaterfallDesign.tsx` | WaterfallDesignDocument | 1 | Likely picks requirements M2M — needs verification. |
| `WaterfallDevelopment.tsx` | WaterfallTask | 1 | Phase + assignee. Requirements M2M not surfaced. |
| `WaterfallTesting.tsx` | WaterfallTestCase | **0** | **No Requirement FK select** — see item 5 in Top 10. |
| `WaterfallDeliverables.tsx` | WaterfallDeliverable | 0 | phase is string, not FK. |
| `WaterfallMilestones.tsx` | WaterfallMilestone | 1 | Phase FK. |
| `WaterfallGantt.tsx` | WaterfallGanttTask | 1 | Dependencies M2M likely not editable in UI. |
| `WaterfallChangeRequests.tsx` | WaterfallChangeRequest | 1 | Affected phase FK ✓. |
| `WaterfallDeployment.tsx` | WaterfallDeploymentChecklist | 1 | n/a. |
| `WaterfallMaintenance.tsx` | WaterfallMaintenanceItem | 1 | n/a. |
| `WaterfallBudget.tsx` | WaterfallBudget + items | 2 | Items per phase ✓. EVM. |
| `WaterfallRisks.tsx` | WaterfallRisk | 0 | No phase FK in model. Standalone. |
| `WaterfallIssues.tsx` | WaterfallIssue | 0 | Same. |
| `WaterfallBaselines.tsx` | WaterfallBaseline | 1 | Per-type unique. |
| `WaterfallPhaseGate.tsx` | (composite read) | 1 | Reads phase status. |
| `WaterfallTeam.tsx` | WaterfallTeamMember | 1 | n/a. |

**Area mean: 0.6 / 3** — **lowest of all areas.**

**Cross-cutting Waterfall gaps:**
- **Requirements traceability is broken end-to-end**: no `Requirement → TestCase` link in either direction in the UI, despite the FK existing in the model.
- `WaterfallRisk.owner`, `WaterfallIssue.assignee/reporter`, `WaterfallDeliverable.phase`, `WaterfallChangeRequest.requested_by` — several should be FKs but are stored as `CharField`. **Model-level gap** worth flagging.
- `WaterfallGanttTask.dependencies` (self-M2M) — never editable in UI.

---

### LSS Green

**Backend**: `backend/lss_green/models.py` (152 LOC). UUID PKs.

#### Entities

| Entity | PK | FK out | Reverse relations |
|---|---|---|---|
| DMAICPhase | UUID | project | tasks, lss_black_tasks |
| LSSGreenTask | UUID | project, phase, assignee, created_by | — |
| LSSGreenMetric | UUID | project | — *(no FK to phase — gap)* |
| LSSGreenMeasurement | UUID | project | — *(phase is `CharField`, not FK — gap)* |

#### Screens

| Screen | Primary entity | Score | Gap notes |
|---|---|---|---|
| `LSSGreenOverview.tsx` | DMAICPhase (read) | 1 | n/a. |
| `LSSGreenPhases.tsx` | DMAICPhase | 1 | Order configurable. |
| `LSSGreenTasks.tsx` | LSSGreenTask | 2 | Phase + assignee select + filters ✓. |
| `LSSGreenMetrics.tsx` | LSSGreenMetric | 0 | No phase link in model. |
| `LSSGreenMeasurements.tsx` | LSSGreenMeasurement | 0 | Phase is string CharField. |
| `LSSGreenTimeline.tsx` | (read tasks by phase) | 1 | n/a. |

**Area mean: 0.8 / 3.**

---

### LSS Black

**Backend**: `backend/lss_black/models.py` (200 LOC). Reuses `lss_green.DMAICPhase` for phase FK.

#### Entities

| Entity | PK | FK out | Reverse relations |
|---|---|---|---|
| HypothesisTest | UUID | project, responsible | — |
| DesignOfExperiment | UUID | project, responsible | — |
| ControlPlan | UUID | project, responsible | — |
| SPCChart | UUID | project, responsible | — |
| LSSBlackTask | UUID | project, phase (DMAICPhase), assignee, created_by | — |

#### Screens

| Screen | Primary entity | Score | Gap notes |
|---|---|---|---|
| `LSSBlackOverview.tsx` | (composite) | 1 | n/a. |
| `LSSBlackPhases.tsx` | DMAICPhase | 1 | Same as green. |
| `LSSBlackTasks.tsx` | LSSBlackTask | 2 | Phase + assignee. |
| `LSSBlackHypothesisTests.tsx` | HypothesisTest | 1 | No phase FK in model. |
| `LSSBlackDOE.tsx` | DesignOfExperiment | 1 | No phase FK in model. |
| `LSSBlackSPCCharts.tsx` | SPCChart | 1 | No phase FK in model. No data-points sub-view (model has none either — gap). |
| `LSSBlackControlPlans.tsx` | ControlPlan | 1 | No process-step children either. |
| `LSSBlackTimeline.tsx` | (read tasks by phase) | 1 | n/a. |

**Area mean: 1.1 / 3.**

**Cross-cutting LSS Black gaps:**
- HypothesisTest / DOE / SPCChart / ControlPlan should phase-FK (Analyze / Improve / Control). They don't. Hard to put a Black project into DMAIC narrative.

---

### Hybrid

**Backend**: `backend/hybrid/models.py` (122 LOC).

#### Entities

| Entity | PK | FK out | Reverse relations |
|---|---|---|---|
| HybridArtifact | UUID | project | — |
| HybridConfiguration | UUID | project | — |
| PhaseMethodology | UUID | project | tasks |
| HybridTask | UUID | project, phase (PhaseMethodology), assignee, created_by | — |

#### Screens

| Screen | Primary entity | Score | Gap notes |
|---|---|---|---|
| `HybridOverview.tsx` | (composite) | 1 | n/a. |
| `HybridConfiguration.tsx` | HybridConfiguration | 1 | Standalone. |
| `HybridPhases.tsx` | PhaseMethodology | 1 | n/a. |
| `HybridTasks.tsx` | HybridTask | 2 | Phase + assignee + filters. |
| `HybridArtifacts.tsx` | HybridArtifact | 0 | `source_methodology` is `CharField`, not link. No phase FK either. |
| `HybridTimeline.tsx` | (read) | 1 | n/a. |

**Area mean: 1.0 / 3.**

---

### Six Sigma

**Backend**: `backend/sixsigma/models.py` (1204 LOC) — largest by far.

#### Entities (relational core)

| Entity | PK | FK out | Reverse relations |
|---|---|---|---|
| SIPOCDiagram | int | project (1-to-1), created_by | items |
| SIPOCItem | int | sipoc | — |
| VoiceOfCustomer | int | project | — |
| ProjectCharter | int | project (1-to-1), champion, process_owner, approved_by | — |
| DataCollectionPlan | int | project (1-to-1) | metrics |
| DataCollectionMetric | int | plan, responsible_person | — |
| MSAResult | int | project (1-to-1) | — |
| BaselineMetric | int | project | — |
| FishboneDiagram | int | project (1-to-1), created_by | causes |
| **FishboneCause** | int | fishbone | solutions (reverse via `addresses_root_cause`) |
| ParetoAnalysis | int | project | categories |
| ParetoCategory | int | analysis | — |
| HypothesisTest | int | project | — |
| **Solution** | int | project, addresses_root_cause (FishboneCause), owner | pilot, implementation_plans |
| PilotPlan | int | solution (1-to-1) | — |
| FMEA | int | project, action_owner | — |
| ImplementationPlan | int | project, solution, owner | — |
| ControlPlan | int | project (1-to-1), process_owner | items |
| ControlPlanItem | int | plan, responsible | — |
| ControlChart | int | project | data_points |
| ControlChartData | int | chart, recorded_by | — |
| TollgateReview | int | project, reviewer, attendees M2M, approved_by | — |
| ProjectClosure | int | project (1-to-1), process_owner, approved_by | — |

#### Screens

| Screen | Primary entity | Score | Gap notes |
|---|---|---|---|
| `SixSigmaSIPOC.tsx` | SIPOCDiagram + items | 2 | Items grouped by category ✓. |
| `SixSigmaVOC.tsx` | VoiceOfCustomer | 1 | n/a. |
| `LeanSixSigmaDMAIC.tsx` | (composite) | 1 | n/a. |
| `SixSigmaDataCollection.tsx` | DataCollectionPlan + metrics | 2 | Metrics nested. |
| `SixSigmaMSA.tsx` | MSAResult | 0 | Flat. |
| `SixSigmaBaseline.tsx` | BaselineMetric | 1 | n/a. |
| `SixSigmaFishbone.tsx` | FishboneDiagram + causes | 2 | Causes grouped by 6M ✓. Toggle root ✓. **No reverse Solutions list per root cause.** |
| `SixSigmaPareto.tsx` | ParetoAnalysis + categories | 2 | Categories nested. |
| `SixSigmaHypothesis.tsx` | HypothesisTest | 1 | n/a. |
| `SixSigmaRootCause.tsx` | (read causes) | 1 | n/a. |
| `SixSigmaSolutions.tsx` | Solution | **0** | **No `addresses_root_cause` picker** — item 3 in Top 10. |
| `SixSigmaPilot.tsx` | PilotPlan | 1 | Solution FK in model. UI likely surfaces it. |
| `SixSigmaImprove.tsx` | (composite) | 1 | n/a. |
| `SixSigmaFMEA.tsx` | FMEA | 1 | n/a. |
| `SixSigmaImplementation.tsx` | ImplementationPlan | 1 | Solution FK in model. |
| `SixSigmaSolutions.tsx` | Solution | 0 | already counted. |
| `SixSigmaControlPlan.tsx` | ControlPlan + items | 2 | Items nested. |
| `SixSigmaControlChart.tsx` | ControlChart | 1 | Data points may be separate. |
| `SixSigmaSPC.tsx` | (read ControlChart) | 1 | n/a. |
| `SixSigmaTollgate.tsx` | TollgateReview | 1 | Phase enum, attendees M2M maybe. |
| `SixSigmaClosure.tsx` | ProjectClosure | 0 | No retrospective view of improvements/tollgates. |
| `SixSigmaMonitoring.tsx` | (read) | 1 | n/a. |
| `SixSigmaRegression.tsx` | (analytical) | 1 | n/a. |

**Area mean: 1.1 / 3.**

**Cross-cutting Six Sigma gaps:**
- Solution ↔ FishboneCause link is **the** big one. Without it, the entire Analyze → Improve handoff is undocumented in the UI.
- ProjectClosure (`Six Sigma`) doesn't summarise tollgates, solutions implemented, or final control charts — all of which it could pull.
- PilotPlan ↔ Solution is 1-to-1 but no view from the Solution row.

---

### Governance

**Backend**: `backend/governance/models.py` (245 LOC). UUID PKs.

#### Entities

| Entity | PK | FK out | Reverse relations |
|---|---|---|---|
| Portfolio | UUID | company, owner | boards, stakeholders, programs (reverse from Program.portfolio) |
| GovernanceBoard | UUID | portfolio, program, project, chair | members |
| BoardMember | UUID | board, user | — |
| GovernanceStakeholder | UUID | user, portfolio, program, project | — |
| Decision | UUID | program, decided_by | — |
| Meeting | UUID | program, facilitator, attendees M2M | — |

#### Screens

| Screen | Primary entity | Score | Gap notes |
|---|---|---|---|
| `Portfolios.tsx` | Portfolio (list) | 1 | n/a. |
| `CreatePortfolio.tsx` | Portfolio (create) | 1 | Company + owner. |
| **`PortfolioDetail.tsx`** | Portfolio + boards + stakeholders + programs + projects | **3** | **REFERENCE EXAMPLE**: fetches `boards?portfolio=`, `stakeholders?portfolio=`, `programs?portfolio=`, `projects?portfolio=` and renders clickable navigation cards. Edit dialog allows changing scalar fields. |
| `GovernanceBoards.tsx` | GovernanceBoard (list) | 1 | Filtering by type. |
| `CreateBoard.tsx` | GovernanceBoard | 1 | Likely picks portfolio/program/project — needs verification. |
| `BoardDetail.tsx` | GovernanceBoard + members | 2 | Members managed inline ✓. **No portfolio/program/project linkage shown** — item 8 in Top 10. No Decisions, no Meetings. |
| `Stakeholders.tsx` | GovernanceStakeholder (list) | 1 | n/a. |
| `CreateStakeholder.tsx` | GovernanceStakeholder | 1 | Likely picks user + parent entity. |
| (no `Decisions.tsx`) | Decision | — | **Missing UI** — item 7. |
| (no governance `Meetings.tsx`) | Meeting | — | Only `ExecutionMeeting.tsx` exists at top level — unclear if it surfaces governance.Meeting. |

**Area mean: 2.0 / 3** (boosted by PortfolioDetail).

---

### Programs

**Backend**: `backend/programs/models.py` (440 LOC).

#### Entities

| Entity | PK | FK out | Reverse relations |
|---|---|---|---|
| Program | int | company, portfolio, program_manager, executive_sponsor, projects M2M, created_by | team_members, benefits, risks, milestones, program_budget, budget_categories, program_budget_items, decisions (governance), governance_meetings, governance_boards, governance_stakeholders |
| ProgramTeam | int | program, user, added_by | — |
| ProgramBenefit | int | program, owner | — |
| ProgramRisk | int | program, owner | — |
| ProgramMilestone | int | program | — |
| ProgramBudget | int | program (1-to-1) | program_budget_items (via program) |
| ProgramBudgetCategory | int | program | program_budget_items |
| ProgramBudgetItem | int | program, category, created_by, approved_by | — |

#### Screens

| Screen | Primary entity | Score | Gap notes |
|---|---|---|---|
| `ProgramsOverview.tsx` | Program (list) | 1 | n/a. |
| `CreateProgram.tsx` / `Createprogramwithai.tsx` | Program | 1 | Portfolio/company picks likely. |
| **`ProgramDetail.tsx`** | Program + projects + milestones + risks | **3** | Fetches projects, milestones, risks; navigates to projects ✓. Has "add project" with picker. |
| `ProgramBenefits.tsx` | ProgramBenefit | 1 | Program FK. |
| `ProgramRoadmap.tsx` | (read milestones + projects) | 2 | n/a. |
| `ProgramGovernance.tsx` | (composite — boards, stakeholders, decisions?) | 1-2 | Needs deeper inspection; could be high score. |
| `ProgramResources.tsx` | ProgramTeam | 1 | n/a. |
| `ProgramDashboard.tsx` | Program (read) | 1 | n/a. |

**Area mean: 1.6 / 3.**

---

## Cross-cutting patterns

### Pattern 1 — "Flat-form dialog, sibling-only model"
The same dialog template (`Dialog → DialogContent → grid of Input/Textarea/Select`) is reused everywhere, and it covers only the entity's own scalar fields plus *at most one* parent FK select. Children, M2M relations, and peer FKs are never collected at creation time. Example: `WaterfallTesting.tsx:55-65`, `SixSigmaSolutions.tsx:45`, `Prince2WorkPackages.tsx:180-215`, `AgileBacklog.tsx:128-138`.

### Pattern 2 — "Parent FK is text, not link"
When a parent FK *is* shown on a card, it's rendered as plain text or a Badge — not as a clickable `Link`. Example: `Prince2StagePlan.tsx:106` shows the stage name as a Badge with no navigation. `KanbanWorkItems.tsx:49` shows the column name as a Badge.

### Pattern 3 — "No child / reverse list on detail screen"
Detail-style pages do not surface incoming references. `BoardDetail.tsx` shows members but not decisions/meetings/program/project. `WaterfallRequirements.tsx` shows requirements but not their test cases/designs/tasks. `Prince2WorkPackages.tsx` shows WPs but not products or checkpoint reports.

### Pattern 4 — "Model has FK, UI doesn't"
Five concrete cases:
- `AgileBacklogItem.epic` (FK exists, no UI picker) — `frontend/src/pages/agile/AgileBacklog.tsx:128-138`
- `WaterfallTestCase.requirement` (FK exists, no UI picker) — `frontend/src/pages/waterfall/WaterfallTesting.tsx:24`
- `Solution.addresses_root_cause` (FK to FishboneCause, no UI picker) — `frontend/src/pages/sixsigma/SixSigmaSolutions.tsx:45`
- `HighlightReport.stage` (FK exists, no UI picker) — `frontend/src/pages/prince2/Prince2HighlightReport.tsx`
- `KanbanCard.swimlane` (FK exists, no UI picker) — `frontend/src/pages/kanban/KanbanWorkItems.tsx:55-60`

### Pattern 5 — "FK in canonical method, but model uses CharField"
Several places where the canonical methodology expects a relationship but the schema downgraded it to a string. These are **model-level relationality gaps** that have to be fixed before the UI can ever be relational:
- `WaterfallRisk.owner` (string)
- `WaterfallIssue.assignee` / `WaterfallIssue.reporter` (strings)
- `WaterfallDeliverable.phase` (string, not FK to `WaterfallPhase`)
- `LSSGreenMeasurement.phase` (string, not FK to `DMAICPhase`)
- `HybridArtifact.source_methodology` (string — fine as enum, but no link to methodology configuration)

### Pattern 6 — "Model has the child entity, no UI page exists"
- `governance.Decision` — no `Decisions.tsx`.
- `prince2.CheckpointReport` — no `Prince2CheckpointReports.tsx`.
- `prince2.Product` — no `Prince2Products.tsx` (only mentioned in Stage Plan / WP context — but those screens don't surface it either).
- `agile.AgileEpic` — no `AgileEpics.tsx`.
- `scrum.BacklogItem.parent` (self-FK for epic→story) — no nested view anywhere.
- `kanban.CardComment` / `CardChecklist` / `ChecklistItem` — no dialogs.

### Pattern 7 — "Two screens already do it right"
`governance/PortfolioDetail.tsx` and `ProgramDetail.tsx` are the existing patterns that should be replicated. Both fetch related entities by query-param filter (`?portfolio=<id>`, `?program=<id>`) and render clickable cards. **This is the template** for every other detail screen.

---

## Recommended next 5 fixes (smallest blast-radius, biggest UX win first)

1. **[Six Sigma] Add `addresses_root_cause` picker to `SixSigmaSolutions.tsx`** — single Select component, fetch `/api/v1/projects/{id}/sixsigma/causes/?is_root_cause=true`, populate dropdown. **2 hours.** Unlocks DMAIC narrative. _(done 2026-05-23)_
2. **[Waterfall] Add `requirement` picker to `WaterfallTesting.tsx`** — same shape as #1, fetch `/api/v1/projects/{id}/waterfall/requirements/`. **2 hours.** Unlocks traceability matrix. _(done 2026-05-23)_
3. **[Agile] Add `epic` picker to `AgileBacklog.tsx`** *and* create a minimal `AgileEpics.tsx` page (list + create + show children-stories count). **1 day.** The most-asked-for hierarchy in agile (model already supports it).
4. **[PRINCE2] On `Prince2StagePlan.tsx` and `Prince2WorkPackages.tsx`, render parent Stage as a clickable badge + add a child list panel.** Stage Plans should show their stage's WPs; WPs should show their stage's other WPs (siblings). **1 day.** Closest to the user's exact ask. **Update (2026-05-23): now plan-scoped** — `WorkPackage.stage_plan` FK landed in prince2 migration 0008, so `Prince2StagePlan.tsx` groups WPs by `stage_plan` directly (was: stage-scoped fallback only); `Prince2WorkPackages.tsx` breadcrumb reads the FK directly when present.
5. **[Governance] Build `BoardDetail.tsx` parent/related panels** mirroring `PortfolioDetail.tsx` — show portfolio/program/project parent link + list governance.Meeting and governance.Decision children (creates `Decisions.tsx` MVP). **2 days.** Completes the governance triangle the model already supports.

After these five, the pattern is repeatable: every flat-form dialog gets the missing FK picker, every detail page gets a child-relations panel modelled on `PortfolioDetail.tsx`. A single shared `<RelatedEntitiesPanel entity={} relations={['x', 'y']} />` component would pay for itself in 3-4 reuses.

---

## Appendix — file:line references for the Top 10 gaps

| # | Gap | Source of truth |
|---|---|---|
| 1 | StagePlan no WP/Products linkage | `frontend/src/pages/prince2/Prince2StagePlan.tsx:127-145` (dialog), `:102-123` (card body) |
| 2 | WorkPackage no products/checkpoints | `frontend/src/pages/prince2/Prince2WorkPackages.tsx:138-176` |
| 3 | Solution missing root_cause picker | `frontend/src/pages/sixsigma/SixSigmaSolutions.tsx:32,45`; model `backend/sixsigma/models.py:617` |
| 4 | Backlog item no Epic picker | `frontend/src/pages/agile/AgileBacklog.tsx:128-138`; model `backend/agile/models.py:157` |
| 5 | Test case no Requirement picker | `frontend/src/pages/waterfall/WaterfallTesting.tsx:24,33`; model `backend/waterfall/models.py:236` |
| 6 | Requirements page has no reverse-relation panels | `frontend/src/pages/waterfall/WaterfallRequirements.tsx` (entire file) |
| 7 | Decision has no UI | `backend/governance/models.py:157` exists; no `frontend/src/pages/governance/Decisions.tsx` |
| 8 | BoardDetail missing program/project link | `frontend/src/pages/governance/BoardDetail.tsx:112-127,155-177`; model `backend/governance/models.py:55-56` |
| 9 | Highlight Report no Stage picker | `frontend/src/pages/prince2/Prince2HighlightReport.tsx`; model `backend/prince2/models.py:363` |
| 10 | Sprint planning doesn't show items | `frontend/src/pages/scrum/ScrumSprintPlanning.tsx:65-92` |

---

## Bonus findings

- **(2026-05-23, post-audit)** Two PRINCE2 model-level FK gaps called out above are now addressed in prince2 migration `0008_workpackage_stage_plan_product_work_package`:
  - `WorkPackage.stage_plan = FK(StagePlan, null=True, blank=True, related_name='work_packages')` — closes the gap that a Stage with multiple Stage Plans rendered the same WP list under each plan.
  - `Product.work_package = FK(WorkPackage, null=True, blank=True, related_name='products')` — PRINCE2 doctrine: Products are the deliverable of a Work Package.
  Both are additive + nullable; existing rows resolve to `null` and the frontend keeps a stage-scoped fallback for historic data.

---

*End of audit.*
