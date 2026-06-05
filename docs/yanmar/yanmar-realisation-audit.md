# Yanmar Europe — Requirements Realisation Audit

**Client:** Yanmar Europe · **Product:** ProjeXtPal
**Run by:** client-requirements-validator (independent, evidence-based)
**Run date:** 2026-06-05
**Source:** `docs/yanmar/yanmar-summary.md`
**Claimed score:** 32/34 (94%) PASS — based on model/field presence
**Audited score:** 11/34 full PASS · 19/34 PARTIAL · 4/34 FAIL

> **Why the gap with the 94% claim?** The self-report counted a requirement as PASS
> when the backend model/field exists. This audit also requires **UI reachability**:
> a feature only counts as PASS if a user can actually reach it in the live product.
> The decisive finding: **the Yanmar-specific React components exist but are mounted
> on no navigable page** — `TaskKpiTiles`, `BudgetOneView`, `DueDateChangeRequestQueue`,
> `ProjectSignOffDialog`, `RiskHeatmap` all have **zero import references**. The backend
> is genuinely strong; the wiring to the UI is the gap.

---

## 1. Per-requirement verdicts

### Action Tracker (5)
| ID | Requirement | Verdict | Evidence / Note |
|---|---|---|---|
| ATR-01 | Task `category` + sub-totals | PARTIAL | `projects/models.py:247`; endpoint `GET /projects/tasks/category-subtotals/` (`views.py:1281`). UI `TaskKpiTiles.tsx` exists but **not mounted anywhere**. |
| ATR-02 | RACI as distinct R/A/C/I fields | PARTIAL | Backend complete: `models.py:273–296` (`raci_responsible/accountable/consulted/informed`), serializer `47–92`. Frontend `PlanningRaci.tsx` uses **hardcoded static data**, no API binding. |
| ATR-03 | Revised Due / Completed On / Delay | PASS | `models.py:259–260` + `delay_days` property `:312`. In serializer. |
| ATR-04 | 5-state progress (○◔◑◕●) | PARTIAL | `progress` int field exists (`:270`) but unconstrained; UI renders a continuous `<Progress>` bar (`PlanningTasks.tsx:136`), no 5-symbol rendering anywhere. |
| ATR-05 | KPI counters Today/Tomorrow/Week/Next | PARTIAL | Backend `task_kpi` action (`views.py:381–425`) correct. `TaskKpiTiles.tsx` complete but **mounted nowhere**. |

### Project Plan (9)
| ID | Requirement | Verdict | Evidence / Note |
|---|---|---|---|
| PP-01 | 6 distinct roles | PARTIAL | `ProjectMembership` model `models.py:1382–1424` (all 6 roles) + used by DOCX export. **No ViewSet/URL route** → no live CRUD. |
| PP-02 | Scope IN / Scope OUT | PASS | `models.py:102–103`. |
| PP-03 | Impact / Solution / ROI | PASS | `models.py:107–121` (explicit Yanmar comment). |
| PP-04 | Start / Target Impl / Target End | PASS | `models.py:97–99`. |
| PP-05 | Push-back rule **enforced** | PASS | `serializers.py:115–167` — `TaskSerializer.update()` gates due-date push (`revision_count>=1 or delta>14` → creates `TaskDueDateChangeRequest`, strips due_date). Gate is real (server-side). Approval queue UI orphaned. |
| PP-06 | RAID complete | PASS | Risk `:601`, Assumption `:1547`, Issue `:1606`, Dependency `charater/models.py:242`. |
| PP-07 | Senior Manager sign-off gate | PARTIAL | Gate enforced: `POST /projects/<id>/closing/sign-off/` 400s unless `status=completed` (`views.py:250–253`); `ProjectSignOff` model `:1329`. `ProjectSignOffDialog.tsx` complete but **mounted nowhere**. |
| PP-08 | Communication plan (kickoff/onboarding/regular/closing) | PASS | `CommunicationPlan`+`PlanEvent` `models.py:1441–1529`. |
| PP-09 | Closing workflow | PARTIAL | `PostProject` model + sign-off endpoint exist; only PRINCE2 has a closure page; no generic closing page. |

### Highlight Report (6)
| ID | Requirement | Verdict | Evidence / Note |
|---|---|---|---|
| HR-01 | Sponsor / PM / Senior Supplier / Objectives header | **FAIL** | `HighlightReport` (`prince2/models.py:369`) has **none** of these fields; form lacks them too. |
| HR-02 | Monthly timeline (Prepare/Renovations/Run) | **FAIL** | No timeline/phases field or component anywhere. |
| HR-03 | 4-axis RAG (Budget/Planning/Resources/Overall) | PARTIAL | Backend has all 4 (`models.py:384–386` + `overall_status`); form (`Prince2HighlightReport.tsx:148`) exposes **only Overall**. |
| HR-04 | Financials incl. ETC + Variance | PARTIAL | `budget_rollup` (`views.py:286`) returns all 8 columns incl. ETC/Variance. `BudgetOneView.tsx` complete but **mounted nowhere**. |
| HR-05 | 5×5 Risk Map | PARTIAL | `RiskHeatmap.tsx` ("matching Yanmar") complete but **orphaned**; Risk uses 3-level impact, not 5-level numeric. |
| HR-06 | Highlights/Lowlights + Issues + Risks | PASS | Backend `:390–392`; form has Highlights/Issues/Risks. `lowlights` field exists but not in form (minor). |

### Meeting Minutes (5)
| ID | Requirement | Verdict | Evidence / Note |
|---|---|---|---|
| MM-01 | Invited / Attended / Absent | PARTIAL | `MeetingAttendee` (`communication/models.py:185`, migration 0004). Zero frontend surface. |
| MM-02 | Action items PIC + Due | PARTIAL | `MeetingActionItem` (`:227`), created only via AI-minutes path; no CRUD route/UI. |
| MM-03 | Previous actions carry-forward | PARTIAL | `previous_meeting` FK + `carry_forward_to()` exist; only via AI path; no manual trigger/UI. |
| MM-04 | Customer/Supplier ↔ YEU + room | PARTIAL | Fields exist (`:170–173`) but **MeetingSerializer does not expose them** (`serializers.py:122–127`). |
| MM-05 | Agenda / Discussion / Conclusions | PARTIAL | Model has all three (`:152–164`); serializer exposes only `agenda`; frontend static. |

### Sales / Contract (9)
| ID | Requirement | Verdict | Evidence / Note |
|---|---|---|---|
| SC-01 | AWS hosting (single-tenant capable) | PARTIAL | AWS S3 configured (`settings.py:318–323`, eu-west-1); compute runs on Mac Studio, not AWS; no single-tenant IaC template. |
| SC-02 | BYO LLM key | PASS | `core/llm_keys.py` full resolution (ClientApiKey → CompanyAIKey → pool); key encrypted at rest (`admin_portal/models.py:180`). |
| SC-03 | GDPR: EU hosting + audit trail | PARTIAL | `AuditLog` exists; GDPR-delete path has `TODO: write to AuditLog` (`accounts/gdpr.py:238`); compute not in EU; no DPIA in repo (note: a `dpia-projextpal.md` doc exists separately). |
| SC-04 | Project-level isolation | PASS | `CompanyScopedQuerysetMixin` on all major ViewSets; `company_id` filter (`views.py:454`). |
| SC-05 | Role-based cost/rate visibility | **FAIL** | No finance-role gating found; `hourly_rate_snapshot`/`labor_cost` returned unconditionally (`serializers.py:957–989`); budget-rollup has no role check. |
| SC-06 | No 3rd-party analytics / no training on data | PASS | No GA/Mixpanel/Segment/Amplitude/PostHog; only Sentry (errors). |
| SC-07 | SAP S/4HANA system of record | FAIL (deferred) | Known Phase-2 defer; only mentioned as priced add-on; no stub/connector. |
| SC-08 | Multi-methodology in one programme | PASS | `METHODOLOGY_CHOICES` (`models.py:16–27`); routes exist. |
| SC-09 | Live dashboards | PARTIAL | Channels configured but no WS/SSE consumer; data current on fetch but pull-based (refresh/poll), not streaming. |

---

## 2. Corrected roll-up

| Category | Total | PASS | PARTIAL | FAIL |
|---|---|---|---|---|
| Action Tracker | 5 | 1 | 4 | 0 |
| Project Plan | 9 | 5 | 4 | 0 |
| Highlight Report | 6 | 1 | 3 | 2 |
| Meeting Minutes | 5 | 0 | 5 | 0 |
| Sales / Contract | 9 | 4 | 3 | 2 |
| **TOTAL** | **34** | **11 (32%)** | **19 (56%)** | **4 (12%)** |

**Backend coverage is genuinely high** — almost every data requirement has a real model/field/endpoint. **The blocker is frontend wiring**: 5 demo-critical components are built but mounted nowhere, and several serializers strip fields the model already has.

**Demo verdict for 8 June: AT RISK** — but mostly recoverable with frontend wiring (see §4).

---

## 3. Demo-risk list (ranked by likelihood of being asked live)

1. **ATR-02 RACI** — `PlanningRaci.tsx` shows hardcoded "test1"/team; cannot assign R/A/C/I to a real task. (Their pain point #5.) **Very high.**
2. **HR-01 Highlight Report header** — Sponsor/PM/Senior Supplier/Objectives fields absent entirely. **Very high.**
3. **ATR-05 / ATR-01 KPI tiles + category sub-totals** — exist in backend, no nav leads to them. **High.**
4. **PP-07 Sign-off** — dialog unreachable; no UI path to "Senior Manager signs off". **High.**
5. **HR-03 4-axis RAG** — only Overall editable; per-axis RAG not in form. **High.**
6. **HR-04 Financials one-view (ETC/Variance)** — orphaned; standard budget page lacks ETC/Variance. (Pain point #2.) **Medium-high.**
7. **SC-05 Role-based cost visibility** — any tenant user can read rates/costs. **Medium** (surfaces in technical deep-dive).
8. **MM-03 Previous-actions carry-forward** — only via AI path, no manual UI. **Medium.**
9. **HR-02 Monthly phase timeline** — fully absent. **Medium.**
10. **ATR-04 5-state circles** — rendered as % bar, not ○◔◑◕●. **Medium** (bar may be acceptable).

---

## 4. Quick wins before 8 June (backend done → only frontend wiring)

| ID | Win | Addresses | Est. |
|---|---|---|---|
| QW-1 | Mount `TaskKpiTiles` in project overview | ATR-01, ATR-05 | 1–2 h |
| QW-2 | Mount `BudgetOneView` in budget/finance page | HR-04 | 1 h |
| QW-3 | Mount `DueDateChangeRequestQueue` in project/approvals tab | PP-05 | 1–2 h |
| QW-4 | Add `rag_budget/planning/resources` selectors to Highlight form | HR-03 | 2–3 h |
| QW-5 | Add `lowlights` textarea to Highlight form | HR-06 | 0.5 h |
| QW-6 | Expose `customer_supplier`, `yanmar_meeting_room`, `discussion_notes`, `conclusions` in MeetingSerializer + render | MM-04, MM-05 | 2–3 h |
| QW-7 | Mount `ProjectSignOffDialog` in closing/overview page | PP-07 | 1 h |

**Total quick-win effort ≈ 9–13 h** to move ~7 PARTIAL items to demo-able PASS.

**NOT quick wins:**
- **PP-01** (6 roles) & **ATR-02** (RACI live) — need a new `ProjectMembership` CRUD endpoint + rebuilt frontend (4–6 h). Fallback: show via Django Admin if pressed.
- **HR-01** header fields & **HR-02** phase timeline — need new model fields + migration + form (data-guardian backup gate applies).
- **SC-05** role-gated costs — needs serializer role logic (security-sensitive; do properly, not rushed).

---

## 5. Honest one-liner for internal use

> Backend dekt Yanmar's eisen breed en echt (11 volledige PASS, 19 met backend-fundament).
> Maar **5 demo-kritische UI-componenten zijn gebouwd én nergens ingehangen**, en enkele
> serializers verbergen velden die het model al heeft. Met ~1,5 dag frontend-wiring
> (QW-1…QW-7) is de 8-juni-demo solide; zonder die wiring loopt de demo risico op de
> RACI-, Highlight-header- en KPI-schermen. SAP (SC-07) en role-based cost-visibility (SC-05)
> blijven echte gaps — SAP bewust Phase 2, SC-05 vereist serieus serializer-werk.
