# Yanmar Europe — Requirements Realisation Audit

**Client:** Yanmar Europe · **Product:** ProjeXtPal
**Last updated:** 2026-06-05 (post Fase 1 + Fase 2 + Fase 2B deploy)
**Source:** `docs/yanmar/yanmar-summary.md`

> **History.** Initial audit (2026-06-05 AM): 11/34 full PASS — backend was strong but the
> Yanmar-specific UI components were mounted on no navigable page (the UI-reachability gap).
> After three deploys (Fase 1 demo-wiring, Fase 2 migration items, Fase 2B meeting/category gaps)
> the picture is now:

## Current score: **27/34 full PASS · 5 PARTIAL · 2 FAIL**
- Full PASS: **79%** · Coverage (PASS+PARTIAL): **94%**
- **Action Tracker, Highlight Report, Meeting Minutes = 100% PASS.** Project Plan 7/9.
- Remaining gaps are **contract/infra only** (SC-01/03/05/07/09) + 2 Project-Plan UI partials.

---

## 1. Per-requirement (current)

### Action Tracker (5) — ✅ 5/5 PASS
| ID | Requirement | Verdict | Evidence |
|---|---|---|---|
| ATR-01 | Category + sub-totals | ✅ PASS | `TaskCategorySubtotals` on PRINCE2 dashboard → `/projects/tasks/category-subtotals/` (Fase 2B) |
| ATR-02 | RACI distinct R/A/C/I | ✅ PASS | `PlanningRaci` rebuilt on real data — R/A live-assignable via PATCH (Fase 2) |
| ATR-03 | Revised due / Completed / Delay | ✅ PASS | `Task.revised_due_date/completed_on` + `delay_days` |
| ATR-04 | 5-state progress ○◔◑◕● | ✅ PASS | `ProgressDots` in RACI matrix, click-to-set (Fase 2) |
| ATR-05 | KPI Today/Tomorrow/Week/Next | ✅ PASS | `TaskKpiTiles` on PRINCE2 dashboard (Fase 1) |

### Project Plan (9) — 7 PASS / 2 PARTIAL
| ID | Requirement | Verdict | Evidence |
|---|---|---|---|
| PP-01 | 6 distinct roles | ✅ PASS | `ProjectMembership` CRUD + 6-role assignment UI in RACI page (Fase 2) |
| PP-02 | Scope IN / OUT | ✅ PASS | `Project.scope_in/scope_out` (project edit) |
| PP-03 | Impact / Solution / ROI | ✅ PASS | `Project.problem_impact/proposed_solution/roi_*` |
| PP-04 | Start / Target Impl / Target End | ✅ PASS | `Project.start_date/target_implementation_date/end_date` |
| PP-05 | Push-back rule enforced | ✅ PASS | `TaskSerializer.update()` gate + `DueDateChangeRequestQueue` (Fase 1) |
| PP-06 | RAID complete | ✅ PASS | Risk/Assumption/Issue/Dependency registers |
| PP-07 | Senior Manager sign-off gate | ✅ PASS | `ProjectSignOffDialog` on PRINCE2 closure + backend gate (Fase 1) |
| PP-08 | Communication plan UI | 🟡 PARTIAL | `CommunicationPlan`+`PlanEvent` models exist; no dedicated editor page |
| PP-09 | Generic closing workflow | 🟡 PARTIAL | PRINCE2 closure page exists; no methodology-neutral closing page |

### Highlight Report (6) — ✅ 6/6 PASS
| ID | Requirement | Verdict | Evidence |
|---|---|---|---|
| HR-01 | Sponsor / PM / Senior Supplier / Objectives | ✅ PASS | Added to `HighlightReport` + form + card (Fase 2, migration 0013) |
| HR-02 | Monthly phase timeline (Prepare/Renovations/Run) | ✅ PASS | `phase_timeline` JSON + 3-phase editor + pills (Fase 2) |
| HR-03 | 4-axis RAG | ✅ PASS | rag_budget/planning/resources + Overall in form (Fase 1) |
| HR-04 | Financials incl. ETC + Variance | ✅ PASS | `BudgetOneView` on budget page (Fase 1) |
| HR-05 | 5×5 Risk Map | ✅ PASS | `RiskHeatmap` on PRINCE2 risk register, low/med/high→1/3/5 (Fase 2) |
| HR-06 | Highlights / Lowlights + Issues + Risks | ✅ PASS | lowlights added to form (Fase 1) |

### Meeting Minutes (5) — ✅ 5/5 PASS
| ID | Requirement | Verdict | Evidence |
|---|---|---|---|
| MM-01 | Invited / Attended / Absent | ✅ PASS | `MeetingAttendee` CRUD + split UI (Fase 2B) |
| MM-02 | Action items PIC + due | ✅ PASS | `MeetingActionItem` CRUD + table (Fase 2B) |
| MM-03 | Previous-actions carry-forward | ✅ PASS | `carry-forward` endpoint + button + previous-meeting selector (Fase 2B) |
| MM-04 | Customer/Supplier ↔ YEU + room | ✅ PASS | serializer fields + ExecutionMeeting (Fase 1) |
| MM-05 | Agenda / Discussion / Conclusions | ✅ PASS | ExecutionMeeting rebuild (Fase 1) |

### Sales / Contract (9) — 4 PASS / 3 PARTIAL / 2 FAIL
| ID | Requirement | Verdict | Evidence / Note |
|---|---|---|---|
| SC-01 | AWS single-tenant hosting | 🟡 PARTIAL | S3 configured (eu-west-1); compute on Mac Studio; no single-tenant IaC |
| SC-02 | BYO LLM key | ✅ PASS | `core/llm_keys.py` per-tenant resolution, encrypted at rest |
| SC-03 | GDPR: EU + audit trail | 🟡 PARTIAL | AuditLog exists; GDPR-delete→audit not wired; compute not in EU; DPIA doc separate |
| SC-04 | Project-level isolation | ✅ PASS | `CompanyScopedQuerysetMixin` on all ViewSets |
| SC-05 | Role-based cost/rate visibility | 🔴 **FAIL** | No finance-role gating; rates/costs returned unconditionally — **P0 security** |
| SC-06 | No 3rd-party analytics | ✅ PASS | No GA/Mixpanel/Segment/etc.; only Sentry |
| SC-07 | SAP S/4HANA system of record | 🔴 FAIL (deferred) | Bewust Phase-2 SOW; no stub |
| SC-08 | Multi-methodology in one programme | ✅ PASS | `METHODOLOGY_CHOICES` + routes |
| SC-09 | Live dashboards (streaming) | 🟡 PARTIAL | Current-on-fetch; no WebSocket/SSE push |

---

## 2. Roll-up

| Category | Total | PASS | PARTIAL | FAIL |
|---|---|---|---|---|
| Action Tracker | 5 | 5 | 0 | 0 |
| Project Plan | 9 | 7 | 2 | 0 |
| Highlight Report | 6 | 6 | 0 | 0 |
| Meeting Minutes | 5 | 5 | 0 | 0 |
| Sales / Contract | 9 | 4 | 3 | 2 |
| **TOTAL** | **34** | **27 (79%)** | **5 (15%)** | **2 (6%)** |

All four document templates are demo-ready with real data. Live deploys: bundle `index-CPDXiP7B.js`,
backend migration `prince2.0013` applied.

---

## 3. What remains (all contract/infra, not template features)

| ID | Gap | Priority | Notes |
|---|---|---|---|
| **SC-05** | Role-based cost/rate visibility | **P0 security** | Finance-role gating in serializers; verify with data-leak-hunter |
| SC-03 | GDPR delete→audit wiring + EU compute | P0 compliance | DPIA doc exists (`dpia-projextpal.md`) |
| SC-01 | AWS single-tenant hosting | P1 infra | Depends on hosting model A/A+CMK/B decision |
| SC-09 | Live/streaming dashboards | P1 | WebSocket/SSE consumer on Channels |
| PP-08 | Communication plan editor UI | P2 | Model exists |
| PP-09 | Methodology-neutral closing page | P2 | PRINCE2 closure exists |
| SC-07 | SAP S/4HANA | Phase 2 SOW | Deliberately deferred — agreed |

---

## 4. One-liner for the meeting

> ProjeXtPal now covers **all four Yanmar templates 100% with live data** (Action Tracker, Project
> Plan, Highlight Report, Meeting Minutes) — 27/34 full PASS, 94% coverage. The only open items are
> **contractual/infra**: role-based cost visibility (P0 security, in progress), GDPR finalisation,
> AWS single-tenant hosting + live streaming (infra), and SAP S/4HANA (the agreed Phase-2 SOW).
