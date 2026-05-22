# Client Requirements Validation Report

**Client:** yanmar  
**Product:** projextpal  
**Source:** `docs/yanmar/requirements-checklist.yaml`  
**Run date:** 2026-05-20T13:42:00  
**Total:** 34   ✅ 31   ⚠️ 1   ❌ 0   🟡 2

**Verdict:** ✅ ACCEPTABLE (91% PASS)


## Summary by category

| Category | Total | ✅ PASS | ⚠️ PARTIAL | ❌ FAIL | 🟡 MANUAL | Coverage |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| action_tracker | 5 | 4 | 0 | 0 | 1 | 80% |
| highlight_report | 6 | 6 | 0 | 0 | 0 | 100% |
| meeting_minutes | 5 | 5 | 0 | 0 | 0 | 100% |
| project_plan | 9 | 8 | 1 | 0 | 0 | 89% |
| sales_contract | 9 | 8 | 0 | 0 | 1 | 89% |

## Per-requirement details


### action_tracker

#### ATR-01: Task category column with sub-totals — ✅ PASS

- Source: Action Tracker xlsx — CATEGORY column + COUNTIFS sub-totals
- Priority: `must` · sprint_added: `1`
- Checks:
  - ✅ `model_field` — projects.Task
    - evidence: backend/projects/models.py:227
  - ✅ `endpoint_exists` — /api/v1/projects/tasks/category-subtotals/
    - evidence: GET /api/v1/projects/tasks/category-subtotals/ -> 401

#### ATR-02: RACI per task (R/A/C/I as separate fields) — ✅ PASS

- Source: Action Tracker xlsx — R/A/C/I columns
- Priority: `must` · sprint_added: `pre-existing`
- Checks:
  - ✅ `model_field` — projects.Task
    - evidence: backend/projects/models.py:254
  - ✅ `model_field` — projects.Task
    - evidence: backend/projects/models.py:261
  - ✅ `model_field` — projects.Task
    - evidence: backend/projects/models.py:268
  - ✅ `model_field` — projects.Task
    - evidence: backend/projects/models.py:273

#### ATR-03: Revised Due Date + Completed On + Delay tracking — ✅ PASS

- Source: Action Tracker xlsx — REVISED DUE DATE / COMPLETED ON / PROJECT DELAY columns
- Priority: `must` · sprint_added: `0`
- Checks:
  - ✅ `model_field` — projects.Task
    - evidence: backend/projects/models.py:240
  - ✅ `model_field` — projects.Task
    - evidence: backend/projects/models.py:241
  - ✅ `migration_applied` — 0013_yanmar_schema_batch
    - evidence: backend/projects/migrations/0013_yanmar_schema_batch.py; applied in DB

#### ATR-04: 5-state progress indicator (Pending / 25 / 50 / 75 / Done) — 🟡 MANUAL

- Source: Action Tracker xlsx — PROGRESS column with unicode circles
- Priority: `should` · sprint_added: `0`
- Checks:
  - ✅ `file_exists` — backend/projects/serializers.py
    - evidence: backend/projects/serializers.py (36973 bytes)
  - 🟡 `manual` — Verify that TaskSerializer exposes a `progress_bucket` field
    - evidence: Verify that TaskSerializer exposes a `progress_bucket` field that
maps `progress` int (0..100) to one of:
pending | quarter | half | three_quarter | done


#### ATR-05: Today / Tomorrow / This Week / Next Week KPI tiles — ✅ PASS

- Source: Action Tracker xlsx — COUNTIFS counters at top
- Priority: `must` · sprint_added: `1`
- Checks:
  - ✅ `endpoint_exists` — /api/v1/projects/2/task-kpi/
    - evidence: GET /api/v1/projects/2/task-kpi/ -> 401
  - ✅ `frontend_component` — frontend/src/components/TaskKpiTiles.tsx
    - evidence: frontend/src/components/TaskKpiTiles.tsx (3941 bytes)


### highlight_report

#### HR-01: PPTX export matching Yanmar template — ✅ PASS

- Source: YEU Highlight Report pptx — cover + 4-axis RAG + timeline + financials + risk map
- Priority: `must` · sprint_added: `0`
- Checks:
  - ✅ `file_exists` — backend/prince2/exports.py
    - evidence: backend/prince2/exports.py (22014 bytes)
  - ✅ `endpoint_exists` — /api/v1/prince2/projects/2/prince2/highlight-reports/4/export/pptx/
    - evidence: GET /api/v1/prince2/projects/2/prince2/highlight-reports/4/export/pptx/ -> 404

#### HR-02: 4-axis RAG (Budget / Planning / Resources / Overall) — ✅ PASS

- Source: YEU Highlight Report pptx — STATUS block top right
- Priority: `must` · sprint_added: `0`
- Checks:
  - ✅ `model_field` — prince2.HighlightReport
    - evidence: backend/prince2/models.py:366
  - ✅ `model_field` — prince2.HighlightReport
    - evidence: backend/prince2/models.py:367
  - ✅ `model_field` — prince2.HighlightReport
    - evidence: backend/prince2/models.py:368
  - ✅ `model_field` — prince2.HighlightReport
    - evidence: backend/prince2/models.py:364

#### HR-03: Financials — ETC + Contingency + Variance — ✅ PASS

- Source: YEU Highlight Report pptx — Financials table
- Priority: `must` · sprint_added: `0`
- Checks:
  - ✅ `model_field` — projects.ProjectBudget
    - evidence: backend/projects/models.py:1191
  - ✅ `model_field` — projects.ProjectBudget
    - evidence: backend/projects/models.py:1195

#### HR-04: 5x5 Risk Map (Probability x Impact) — ✅ PASS

- Source: YEU Highlight Report pptx — Risk map grid
- Priority: `must` · sprint_added: `0`
- Checks:
  - ✅ `frontend_component` — frontend/src/components/RiskHeatmap.tsx
    - evidence: frontend/src/components/RiskHeatmap.tsx (5246 bytes)

#### HR-05: Highlights + Lowlights narrative — ✅ PASS

- Source: YEU Highlight Report pptx — Highlights / Lowlights blocks
- Priority: `must` · sprint_added: `0`
- Checks:
  - ✅ `model_field` — prince2.HighlightReport
    - evidence: backend/prince2/models.py:372
  - ✅ `model_field` — prince2.HighlightReport
    - evidence: backend/prince2/models.py:373

#### HR-06: PRINCE2 roles — Sponsor + Senior Supplier + PM — ✅ PASS

- Source: YEU Highlight Report pptx — Report to / Sponsor / Project Manager / Senior Supplier header
- Priority: `must` · sprint_added: `pre-existing`
- Checks:
  - ✅ `model_field` — prince2.ProjectBoardMember
    - evidence: backend/prince2/models.py:286


### meeting_minutes

#### MIN-01: Attendees split — Invited / Attended / Absent — ✅ PASS

- Source: YEU Meeting Minutes docx — Attendees table
- Priority: `must` · sprint_added: `1`
- Checks:
  - ✅ `model_field` — communication.MeetingAttendee
    - evidence: backend/communication/models.py:211
  - ✅ `migration_applied` — 0004_meeting_expansion
    - evidence: backend/communication/migrations/0004_meeting_expansion.py; applied in DB

#### MIN-02: Meeting Action Items with PIC + Action Due + status — ✅ PASS

- Source: YEU Meeting Minutes docx — Agreed New Actions table
- Priority: `must` · sprint_added: `1`
- Checks:
  - ✅ `model_field` — communication.MeetingActionItem
    - evidence: backend/communication/models.py:256
  - ✅ `model_field` — communication.MeetingActionItem
    - evidence: backend/communication/models.py:260
  - ✅ `model_field` — communication.MeetingActionItem
    - evidence: backend/communication/models.py:15

#### MIN-03: Previous Actions carry-forward — ✅ PASS

- Source: YEU Meeting Minutes docx — Previous Actions table linked to prior meeting
- Priority: `must` · sprint_added: `1`
- Checks:
  - ✅ `model_field` — communication.Meeting
    - evidence: backend/communication/models.py:165
  - ✅ `model_field` — communication.MeetingActionItem
    - evidence: backend/communication/models.py:244

#### MIN-04: AI Meeting Minutes from transcript (DOCX in Yanmar template) — ✅ PASS

- Source: Differentiator — not in template but matches "less admin" pain point
- Priority: `should` · sprint_added: `0`
- Checks:
  - ✅ `file_exists` — backend/communication/ai_minutes.py
    - evidence: backend/communication/ai_minutes.py (12376 bytes)
  - ✅ `file_exists` — backend/communication/ai_minutes_views.py
    - evidence: backend/communication/ai_minutes_views.py (8618 bytes)
  - ✅ `endpoint_exists` — /api/v1/communication/projects/2/meetings/ai-minutes/
    - evidence: GET /api/v1/communication/projects/2/meetings/ai-minutes/ -> 401

#### MIN-05: Customer/Supplier vs Yanmar split + meeting room — ✅ PASS

- Source: YEU Meeting Minutes docx — header table split
- Priority: `should` · sprint_added: `1`
- Checks:
  - ✅ `model_field` — communication.Meeting
    - evidence: backend/communication/models.py:170
  - ✅ `model_field` — communication.Meeting
    - evidence: backend/communication/models.py:171


### project_plan

#### PLAN-01: 6 distinct project roles (Owner/PM/Leader/Facilitator/Outside Eyes/Stakeholders) — ✅ PASS

- Source: Project Plan docx — Project Team table
- Priority: `must` · sprint_added: `2`
- Checks:
  - ✅ `model_field` — projects.ProjectMembership
    - evidence: backend/projects/models.py:1320
  - ✅ `migration_applied` — 0017_projectmembership
    - evidence: backend/projects/migrations/0017_projectmembership.py; applied in DB

#### PLAN-02: Scope in + Scope out as separate fields — ✅ PASS

- Source: Project Plan docx — Scope section explicitly defines IN and OUT
- Priority: `must` · sprint_added: `0`
- Checks:
  - ✅ `model_field` — projects.Project
    - evidence: backend/projects/models.py:101
  - ✅ `model_field` — projects.Project
    - evidence: backend/projects/models.py:102

#### PLAN-03: Impact + Solution fields for problem-statement projects — ✅ PASS

- Source: Project Plan docx — Impact (if problem statement) + Solution sections
- Priority: `should` · sprint_added: `3`
- Checks:
  - ✅ `model_field` — projects.Project
    - evidence: backend/projects/models.py:105
  - ✅ `model_field` — projects.Project
    - evidence: backend/projects/models.py:109

#### PLAN-04: 3 date types — Start / Target Implementation / Target End — ✅ PASS

- Source: Project Plan docx — Time frame table
- Priority: `must` · sprint_added: `0`
- Checks:
  - ✅ `model_field` — projects.Project
    - evidence: backend/projects/models.py:96
  - ✅ `model_field` — projects.Project
    - evidence: backend/projects/models.py:97
  - ✅ `model_field` — projects.Project
    - evidence: backend/projects/models.py:98

#### PLAN-05: Push-back rule enforced (1 push, max 14 days, then approval) — ✅ PASS

- Source: Project Plan docx — "Due dates can only be pushed back once for a maximum period of 2 weeks. More than this should be discussed with and approved by project owner."
- Priority: `must` · sprint_added: `1`
- Checks:
  - ✅ `model_field` — projects.Task
    - evidence: backend/projects/models.py:246
  - ✅ `model_field` — projects.TaskDueDateChangeRequest
    - evidence: backend/projects/models.py:121
  - ✅ `endpoint_exists` — /api/v1/projects/task-due-change-requests/
    - evidence: GET /api/v1/projects/task-due-change-requests/ -> 401
  - ✅ `migration_applied` — 0015_pushback_workflow
    - evidence: backend/projects/migrations/0015_pushback_workflow.py; applied in DB

#### PLAN-06: RAID — Risks / Assumptions / Issues / Dependencies — ✅ PASS

- Source: Project Plan docx — Risks and Issues section + governance best practice
- Priority: `must` · sprint_added: `pre-existing`
- Checks:
  - ✅ `model_field` — projects.Risk
    - evidence: backend/projects/models.py:618
  - ✅ `model_field` — projects.Assumption
    - evidence: backend/projects/models.py:1482
  - ✅ `model_field` — projects.Issue
    - evidence: backend/projects/models.py:121

#### PLAN-07: Project closing — Senior Manager sign-off with signature — ✅ PASS

- Source: Project Plan docx — "Senior manager should sign off every project to be considered as a 'finished project'"
- Priority: `must` · sprint_added: `2`
- Checks:
  - ✅ `model_field` — projects.ProjectSignOff
    - evidence: backend/projects/models.py:1252
  - ✅ `model_field` — projects.ProjectSignOff
    - evidence: backend/projects/models.py:1263
  - ✅ `endpoint_exists` — /api/v1/projects/2/closing/sign-off/
    - evidence: GET /api/v1/projects/2/closing/sign-off/ -> 401
  - ✅ `frontend_component` — frontend/src/components/ProjectSignOffDialog.tsx
    - evidence: frontend/src/components/ProjectSignOffDialog.tsx (7780 bytes)

#### PLAN-08: Communication plan data model (kickoff/onboarding/regular/closing) — ✅ PASS

- Source: Project Plan docx — Communication plan section
- Priority: `should` · sprint_added: `3`
- Checks:
  - ✅ `model_field` — projects.CommunicationPlan
    - evidence: backend/projects/models.py:184
  - ✅ `model_field` — projects.PlanEvent
    - evidence: backend/projects/models.py:1411
  - ✅ `migration_applied` — 0019_communicationplan
    - evidence: backend/projects/migrations/0019_communicationplan.py; applied in DB

#### PLAN-09: Project Plan DOCX export matches Yanmar template — ⚠️ PARTIAL

- Source: Project Plan docx itself — must be regeneratable from data
- Priority: `must` · sprint_added: `1`
- Checks:
  - ✅ `file_exists` — backend/projects/exports_project_plan.py
    - evidence: backend/projects/exports_project_plan.py (9010 bytes)
  - ⚠️ `endpoint_exists` — /api/v1/projects/2/export/project-plan.docx
    - evidence: GET /api/v1/projects/2/export/project-plan.docx -> 404 (expected one of [200, 401, 403])


### sales_contract

#### SC-01: BYO LLM keys — Yanmar's own Anthropic/OpenAI key — ✅ PASS

- Source: Email — "AI usage via Yanmar-managed OpenAI / LLM keys (no external data exposure)"
- Priority: `must` · sprint_added: `2`
- Checks:
  - ✅ `model_field` — accounts.CompanyAIKey
    - evidence: backend/accounts/models.py:231
  - ✅ `model_field` — admin_portal.ClientApiKey
    - evidence: backend/admin_portal/models.py:201
  - ✅ `file_exists` — backend/core/llm_keys.py
    - evidence: backend/core/llm_keys.py (5987 bytes)
  - ✅ `migration_applied` — 0014_companyaikey
    - evidence: backend/accounts/migrations/0014_companyaikey.py; applied in DB

#### SC-02: API keys encrypted at rest (Fernet) — ✅ PASS

- Source: Email — "GDPR & data security" + InfoSec best practice
- Priority: `must` · sprint_added: `3`
- Checks:
  - ✅ `file_exists` — backend/core/secret_field.py
    - evidence: backend/core/secret_field.py (5343 bytes)
  - ✅ `migration_applied` — 0015_companyaikey_encrypted
    - evidence: backend/accounts/migrations/0015_companyaikey_encrypted.py; applied in DB
  - ✅ `migration_applied` — 0004_clientapikey_encrypted
    - evidence: backend/admin_portal/migrations/0004_clientapikey_encrypted.py; applied in DB

#### SC-03: GDPR DPIA document for the contract — ✅ PASS

- Source: Email — "Full audit trail and DPIA support"
- Priority: `must` · sprint_added: `2`
- Checks:
  - ✅ `requirement_doc` — docs/yanmar/dpia-projextpal.md
    - evidence: docs/yanmar/dpia-projextpal.md (7307 bytes)

#### SC-04: AWS hosting topology document — ✅ PASS

- Source: Email — "AWS deployment: Inclufy-managed (single-tenant) or fully Yanmar-controlled"
- Priority: `must` · sprint_added: `2`
- Checks:
  - ✅ `requirement_doc` — docs/yanmar/aws-topology-yanmar.md
    - evidence: docs/yanmar/aws-topology-yanmar.md (7859 bytes)

#### SC-05: Demo project seed for the 8 June deep-dive — ✅ PASS

- Source: Internal — demo readiness
- Priority: `must` · sprint_added: `0`
- Checks:
  - ✅ `data_seeded` — from projects.models import Project; print(Project.objects.f
    - evidence: count=1 (>= 1)
  - ✅ `data_seeded` — from prince2.models import HighlightReport; print(HighlightR
    - evidence: count=1 (>= 1)

#### SC-06: SAP S/4HANA integration — 🟡 MANUAL

- Source: Email — "SAP S/4HANA remains the system of record, ProjeXtPal adds the operational layer"
- Priority: `phase_2` · sprint_added: `deferred`
- Checks:
  - 🟡 `manual` — Phase 2 — separate Statement of Work. Not in scope for the 8
    - evidence: Phase 2 — separate Statement of Work. Not in scope for the 8 June
deep-dive. Expect ~15-25 dev-days + Yanmar IT involvement.


#### SC-07: Methodology-agnostic — multi-methodology in one programme — ✅ PASS

- Source: Email — "Native support for multiple methodologies within one programme"
- Priority: `must` · sprint_added: `pre-existing`
- Checks:
  - ✅ `model_field` — projects.Project
    - evidence: backend/projects/models.py:91
  - ✅ `file_exists` — backend/projects/methodology_service.py
    - evidence: backend/projects/methodology_service.py (8206 bytes)

#### SC-08: Methodology-aware export templates — ✅ PASS

- Source: Internal — multi-customer fit beyond Yanmar
- Priority: `should` · sprint_added: `3`
- Checks:
  - ✅ `file_exists` — backend/projects/export_templates/__init__.py
    - evidence: backend/projects/export_templates/__init__.py (2241 bytes)
  - ✅ `model_field` — accounts.CompanyExportPreference
    - evidence: backend/accounts/models.py:187

#### SC-09: Demo script for 8 June deep-dive — ✅ PASS

- Source: Internal — demo readiness
- Priority: `should` · sprint_added: `3`
- Checks:
  - ✅ `requirement_doc` — docs/yanmar/demo-script-8-june.md
    - evidence: docs/yanmar/demo-script-8-june.md (11968 bytes)
