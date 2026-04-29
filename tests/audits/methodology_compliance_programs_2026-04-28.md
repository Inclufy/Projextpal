# Methodology + Screen Compliance Audit — Programme Layer
**Date:** 2026-04-28  
**Auditor:** Program Manager Tester Agent  
**Target:** https://projextpal.com  
**Account:** sami@inclufy.com  
**Scope:** 6 programme methodologies × 7 lifecycle stages + governance + Yanmar (id=15) deep-walk

---

## Executive Summary

7 programmes audited across 5 methodology families (SAFe × 3, Hybrid × 2, PRINCE2 Programme × 2, + no MSP/PMI/Generic live instances). The common-core programme tabs (benefits, milestones, risks, governance, budget) are solid — 35/35 HTTP 200. However, methodology-specific depth is critically thin: **0 ARTs, 0 PIs, 0 tranches, 0 components, 0 blueprints** exist on the SAFe, MSP, PMI, and PRINCE2 Programme instances the demo will use. The Yanmar programme (id=15) has all 4 milestones and both named benefits seeded — **demo-safe for slides 5–6** — but carries 3 structural gaps (no linked projects, no budget, no risks) that a drilled-in attendee will find blank. The governance AI-generate endpoint returns **502 Bad Gateway** consistently.

---

## 1. Methodology × Lifecycle Stage Compliance Matrix

Legend: OK = endpoint 200 + data present | EMPTY = endpoint 200 but no records | 404 = endpoint missing | 500/502 = server error | N/A = not applicable to this methodology

| Methodology | Setup | Planning | Execution | Governance | Reporting | Portfolio | Closure |
|---|---|---|---|---|---|---|---|
| **SAFe** (ids 10,13,14) | EMPTY | **404** | **404** | OK | EMPTY | EMPTY | N/A |
| **MSP** (no msp programme) | N/A | **404** | **404** | N/A | N/A | N/A | N/A |
| **PMI** (no pmi programme) | N/A | **404** | **404** | N/A | N/A | N/A | N/A |
| **PRINCE2 Programme** (ids 12,16) | EMPTY | **404** | **404** | OK | EMPTY | EMPTY | N/A |
| **Hybrid Programme** (ids 11,15) | OK | EMPTY | **404** | OK | EMPTY | EMPTY | N/A |
| **Generic/Untyped** | N/A | N/A | N/A | N/A | N/A | N/A | N/A |

### Severity key per cell:
- Setup: OK means programme record + benefits + milestones exist; EMPTY means record exists but zero methodology-specific artefacts
- Planning: SAFe PI Planning, MSP Tranche creation, PRINCE2 Stage Plans — all 404 via programme-scoped URLs
- Execution: PI state transitions, tranche start/end — no data to transition
- Reporting: Programme dashboard 200, but highlights/status-reports/KPIs/exceptions/benefits-realization all 404
- Portfolio: No cross-programme dashboard endpoint exists

---

## 2. Yanmar Programme (id=15) Deep-Walk

**Programme:** Yanmar — Compact Equipment Refresh Programme  
**Methodology:** hybrid  
**Status:** active | health_status: green

### Tab-by-tab walkthrough

| Tab / Endpoint | HTTP | Data | Verdict |
|---|---|---|---|
| dashboard `/programs/15/dashboard/` | 200 | Full object with benefits, milestones, metrics | OK |
| benefits `/programs/15/benefits/` | 200 | 4 benefits — 2 named (Time-to-market, Service cost), 2 auto-seeded | OK for demo |
| milestones `/programs/15/milestones/` | 200 | 4 milestones: Engine Block X, Pilot Production, Field Test NL+JP, EU Type Approval Stage V | OK for demo |
| roadmap `/programs/15/roadmap/` | 200 | 4 milestones, 0 projects | PARTIAL |
| risks `/programs/15/risks/` | 200 | **0 risks** | EMPTY — visible gap |
| governance `/programs/15/governance/` | 200 | program_manager=null, executive_sponsor=null | EMPTY — demo risk |
| budget/overview `/programs/15/budget/overview/` | 200 | total_budget=0.0, categories=[] | EMPTY |
| resources `/programs/15/resources/` | 200 | [] | EMPTY |
| projects `/programs/15/projects/` | 200 | **0 linked projects** | EMPTY |
| metrics `/programs/15/metrics/` | 200 | open_risks=0, realized_benefits=0, total_benefits=4 | PARTIAL |
| reports `/programs/15/reports/` | **404** | Not Found | MISSING |
| highlights `/programs/15/highlights/` | **404** | Not Found | MISSING |
| status-report `/programs/15/status-report/` | **404** | Not Found | MISSING |
| kpis `/programs/15/kpis/` | **404** | Not Found | MISSING |
| stage-gates `/programs/15/stage-gates/` | **404** | Not Found | MISSING |
| exceptions `/programs/15/exceptions/` | **404** | Not Found | MISSING |
| benefits/profiles `/programs/15/benefits/profiles/` | **404** | Not Found | MISSING |
| benefits/realization `/programs/15/benefits/realization/` | **404** | Not Found | MISSING |
| dependencies `/programs/15/dependencies/` | **404** | Not Found | MISSING |
| hybrid governance-configs `/hybrid-programme/programmes/15/governance-configs/` | **404** | UUID vs int pattern mismatch | BUG |
| hybrid adaptations `/hybrid-programme/programmes/15/adaptations/` | **404** | UUID vs int pattern mismatch | BUG |

**Milestone names confirmed (slide deck claims):**
- Engine Block X — Design freeze (date: 2026-06-11, status: in_progress) — PRESENT
- Compact Excavator — Pilot production (date: 2026-07-26) — PRESENT (note: deck says "Field test NL+JP" as 3rd, actual 3rd is "Compact Excavator — Field test (NL+JP)")
- Compact Excavator — Field test (NL+JP) — PRESENT
- EU Type Approval (Stage V emissions) — PRESENT

**Benefits confirmed:**
- Time-to-market reduction (−4 weeks per refresh) — PRESENT, but target_value=None, owner=None
- Service cost reduction via standardisation — PRESENT, but target_value=None, owner=None
- 2 auto-seeded benefits also present (Benefit A — Efficiency, Benefit B — Revenue) — these will look unprofessional

---

## 3. Top 10 Inconsistencies

### BUG-1 (P1): SAFe ART/PI FK points to `projects.Project`, not `programs.Program`
**URL:** `POST /api/v1/safe/arts/` with `program=14`  
**Response:** `{"program":["Invalid pk \"14\" - object does not exist."]}`  
**Root cause:** `backend/safe/models.py` line 10: `program = models.ForeignKey('projects.Project', ...)`. Programs 13 and 14 (E2E SAFe Program, Source2Pay) are `programs.Program` rows with no matching `projects.Project`. Only programme IDs that happen to share a project ID (10, 11, 12) can create ARTs. This means the dedicated SAFe programme page for id=14 can never show any ART or PI data.  
**Impact:** The SAFe ART screen on programme 14 (E2E SAFe Program 1776883265609) is permanently empty.

### BUG-2 (P1): Hybrid, MSP, PMI, P2-Programme nested URLs use `<uuid:programme_id>` but model PKs are ints
**URLs affected:**
- `GET /api/v1/hybrid-programme/programmes/15/governance-configs/` → 404  
- `GET /api/v1/msp/programs/15/tranches/` → 404  
- `GET /api/v1/pmi/programs/17/components/` → 404  
- `GET /api/v1/p2-programme/programmes/16/projects/` → 404  

**Root cause:** `hybrid_programme/urls.py:17`, `msp/urls.py:17`, `pmi/urls.py:16`, `p2_programme/urls.py:16` all use `<uuid:programme_id>` but the `programs.Program` PK is an int. Django URL dispatcher rejects int inputs for uuid converters → 404. **Note:** These models also have FKs to `projects.Project` not `programs.Program` (same root cause as BUG-1 but compounded by UUID pattern).  
**Impact:** All programme-scoped endpoints for Hybrid, MSP, PMI, P2-Programme return 404.

### BUG-3 (P1): `POST /api/v1/governance/decisions/` returns 501 — model does not exist
**Response:** `{"error":"Decisions are not implemented yet.","detail":"No Decision model exists."}`  
**Impact:** The governance decisions log — visible in the sidebar and claimed in slide 6 — cannot be written to. Any Yanmar attendee clicking "Add Decision" hits a dead end.

### BUG-4 (P1): `POST /api/v1/governance/meetings/` returns 501 — model does not exist  
**Response:** `{"error":"Meetings are not implemented yet."}`  
**Impact:** Governance meeting log is read-only shell. Combined with decisions being 501, the entire "governance audit trail" UX is non-functional.

### BUG-5 (P1): `POST /api/v1/governance/ai/generate/` → 502 Bad Gateway  
**Detail:** Cloudflare reports origin 502. The AI backend (LLM proxy) is not responding. This means the "Draft a Q2 steering agenda" demo moment will fail live.  
**Impact:** Direct demo blocker on the AI governance generate feature.

### BUG-6 (P2): SAFe programme-scoped read endpoints return 200 + empty list for programmes 13, 14
**URL:** `GET /api/v1/safe/programs/14/arts/` → 200, `[]`  
**Root cause:** The view filters by `program_id` from the URL — but since the model FK points to `projects.Project`, there are no ARTs for project id=14 (which doesn't exist as a project). The UI will show empty ART/PI screens on the demo SAFe programmes.  
**Impact:** The ART/PI tabs on the demo's SAFe programmes are permanently blank.

### BUG-7 (P2): Yanmar (id=15) has zero linked projects — `project_count=0`, `progress=0`
**URL:** `GET /api/v1/programs/15/projects/` → 200, `[]`  
**Impact:** The programme dashboard shows 0% progress. Yanmar is a real programme — "Cross-region EU+JP hybrid programme covering 3 product family refreshes" — but has no child projects linked. A drilled-in attendee will ask "where are the delivery projects?"

### BUG-8 (P2): Benefits have no quantification — `target_value=None`, `owner=None` for all 4 Yanmar benefits
**Impact:** The benefits tab shows "Time-to-market reduction (−4 weeks)" but with no baseline, target, owner, or measurement date filled. MSP doctrine requires all four. PMI 5th Ed requires owner assignment.

### BUG-9 (P2): Governance board `add_member` action is not registered on `/governance/boards/{id}/`
**URL:** `POST /api/v1/governance/boards/{id}/add_member/` → 404  
**Note:** The schema only registers `add_member` under `/api/v1/projects/{project_id}/prince2/board/{id}/add_member/`. The programme-level boards have no such action.  
**Impact:** Programme governance boards cannot be managed via API action.

### BUG-10 (P2): Programme `risks` endpoint is empty for ALL demo programmes (11, 12, 13, 14, 15, 16)
**URL:** `GET /api/v1/programs/{id}/risks/` → 200, `[]` for all except id=10  
**Impact:** The programme risk register — a P0 artefact in PRINCE2, MSP, and PMI — is empty on every demo programme. The "Risks" tab in the sidebar will show a blank register.

---

## 4. Methodology-Textbook Violations

### SAFe 6.0
- **ART definition gap:** No ART records exist on any programme. SAFe 6.0 requires at least one ART (50–125 people) before a PI can start. The platform allows PIs to be created independently of ARTs (they're in separate endpoints).
- **PI structure:** PI model has `iteration_count` (default 5) and `innovation_sprint` (bool) — consistent with SAFe 6.0 (5 dev iterations + 1 IP iteration). However no PI objectives or system demos are seeded.
- **Missing endpoints:** `/api/v1/safe/system-demos/`, `/api/v1/safe/inspect-adapt/`, `/api/v1/safe/features/`, `/api/v1/safe/lean-portfolio/`, `/api/v1/safe/value-streams/`, `/api/v1/safe/strategic-themes/` — all 404. SAFe 6.0 requires all of these for the ART-level ceremony cadence.
- **4 core values:** No field in any model stores "Alignment, Built-In Quality, Transparency, Program Execution" assessment.

### MSP (Managing Successful Programmes)
- **No live MSP programme exists.** The platform supports the methodology enum but no MSP programme is instantiated.
- **Blueprint missing from schema-listed endpoints:** `/api/v1/msp/blueprints/` → 404 (not in MSP app). MSP requires the Vision → Blueprint → Benefits → Stakeholder Strategy 4-document set. Only benefits and tranches are modelled.
- **4 strategies missing:** MSP requires Benefits Strategy, Stakeholder Strategy, Risk Strategy, and Quality Strategy documents. None are modelled.
- **SRO accountability:** No SRO role field in MSP tranche model.
- **Tranche start/end transitions:** No `start` or `end` action on `/api/v1/msp/tranches/{id}/`.

### PMI Standard for Program Management 5th Ed
- **No live PMI programme exists.**
- **3 lifecycle phases absent:** PMI requires Definition → Delivery → Closure phases tracked at programme level. No phase model exists.
- **Benefits Realisation Plan:** The PMI schema would need a benefits realisation plan document model. Only generic programme benefits exist.
- **Programme roadmap endpoint:** `/api/v1/pmi/roadmap/` → 404.

### PRINCE2 Programme
- **Programme Board roles:** PRINCE2 requires SRO + Senior User + Senior Supplier (minimum 3). The generic governance board has no role validation. Stakeholder model has SRO role enum but it's tenant-wide, not programme-scoped.
- **Tolerance hierarchy missing:** No programme-level tolerance model. Only project-level tolerances exist under `/api/v1/projects/{id}/prince2/tolerances/`.
- **Highlight reports at programme level:** `/programs/16/highlights/` → 404. Highlight reports only exist at project level.
- **Blueprint:** P2Blueprint model exists but `/api/v1/p2-programme/blueprints/` is empty (0 items) for both PRINCE2 programmes.
- **Tranches:** PRINCE2 Programme uses tranches (borrowed from MSP). The MSPTranche model exists but is not linked to PRINCE2 programme types.

### Hybrid Programme
- **No canonical textbook but practical gaps:** The HybridGovernanceConfig and HybridAdaptation models exist and are reasonable. However they FK to `projects.Project` not `programs.Program`, so they cannot be used with any actual hybrid programme.
- **Governance configs empty:** 0 governance-configs for both hybrid programmes (11, 15).

---

## 5. Reporting + Dashboard Audit

| Endpoint | HTTP | Note |
|---|---|---|
| `GET /programs/{id}/dashboard/` | 200 | Returns full programme object with embedded benefits, milestones, metrics |
| `GET /programs/{id}/roadmap/` | 200 | Returns milestones + projects (projects empty for demo programmes) |
| `GET /programs/{id}/metrics/` | 200 | Returns totals: total_benefits, open_risks, progress — all 0 for demo programmes except Yanmar (4 benefits) |
| `GET /programs/{id}/reports/` | **404** | No programme-level reports endpoint |
| `GET /programs/{id}/highlights/` | **404** | No programme-level highlight reports |
| `GET /programs/{id}/status-report/` | **404** | No auto-draft status report |
| `GET /programs/{id}/kpis/` | **404** | No programme KPI endpoint |
| `GET /programs/{id}/stage-gates/` | **404** | No stage gate endpoint at programme level |
| `GET /programs/{id}/exceptions/` | **404** | No exception reports at programme level |
| `GET /programs/{id}/benefits/profiles/` | **404** | No benefit profile endpoint |
| `GET /programs/{id}/benefits/realization/` | **404** | No benefit realization tracking at programme level |
| `GET /governance/portfolio-dashboard/` | **404** | No cross-programme portfolio dashboard |
| `GET /governance/reports/generate/` | 400 | Requires `report_id` — unclear what report_id refers to |

**Conclusion:** The platform has a programme dashboard and metrics endpoint, but the 13 reporting sub-tabs shown in the sidebar (reports, highlights, status-report, KPIs, stage-gates, exceptions, benefits/profiles, benefits/realization) all have no backend — they will render as empty placeholder screens in the SPA.

---

## 6. Governance Layer (Tenant-Wide) Audit

| Endpoint | HTTP | Records | Assessment |
|---|---|---|---|
| `GET /governance/portfolios/` | 200 | 9 (mostly duplicated "E2E Test Portfolio") | OK but polluted with test data |
| `GET /governance/boards/` | 200 | 4 | OK — CRM Programme Steering Committee has 3 members |
| `GET /governance/board-members/` | 200 | 3 | OK |
| `GET /governance/stakeholders/` | 200 | 7 | OK — SRO, exec_sponsor, BCM roles present |
| `GET /governance/meetings/` | 200 | **0** | EMPTY — GET works, POST returns 501 |
| `GET /governance/decisions/` | 200 | **0** | EMPTY — GET works, POST returns 501 |
| `POST /governance/decisions/` | **501** | Model does not exist | CRITICAL BUG |
| `POST /governance/meetings/` | **501** | Model does not exist | CRITICAL BUG |
| `POST /governance/ai/generate/` | **502** | Origin bad gateway | CRITICAL BUG |
| `GET /governance/escalations/` | **404** | Not registered | MISSING |
| `GET /governance/issues/` | **404** | Not registered | MISSING |
| `POST /governance/boards/{id}/add_member/` | **404** | Not registered | MISSING |
| Boards linked to programmes | N/A | All boards have `program=null` | Gap — no board is programme-scoped |
| Stakeholders linked to programmes | N/A | All have `program=null, project=null` | Gap — all are portfolio-scoped only |

**PRINCE2 Board doctrine check:** CRM Programme Steering Committee has chair (Samir Admin) + 2 members (Dhruv Saxena, Shah Ally) = 3 roles — meets the minimum. But roles are "chair" and "member" not the canonical PRINCE2 "Senior Responsible Owner", "Senior User", "Senior Supplier" triple.

---

## 7. URL Pattern Architecture Issue (Root Cause of BUG-1 + BUG-2)

All methodology-specific models FK to `projects.Project` (int PK), not `programs.Program` (int PK). The nested URL patterns for hybrid, MSP, PMI, and P2-Programme use `<uuid:programme_id>` — doubly wrong (wrong type AND wrong model). The SAFe app correctly uses `<int:program_id>` but still points to the wrong model.

**Files to fix:**
- `/backend/hybrid_programme/urls.py` line 17: `<uuid:programme_id>` → `<int:programme_id>` (and update views/models FK)
- `/backend/msp/urls.py` lines 17–18: `<uuid:program_id>` → `<int:program_id>` (and update views/models FK)
- `/backend/pmi/urls.py` line 16: `<uuid:program_id>` → `<int:program_id>` (and update views/models FK)
- `/backend/p2_programme/urls.py` line 16: `<uuid:programme_id>` → `<int:programme_id>` (and update views/models FK)
- `/backend/safe/models.py` line 10 + 51: FK to `projects.Project` → `programs.Program`

**Note:** Changing the FK target requires a Django migration. Ensure this is tested in staging before production deploy.

---

## 8. Prioritised Fix List

### P1 — Demo Blockers (Fix Tonight, 2026-04-28)

| ID | Issue | Fix |
|---|---|---|
| P1-A | Yanmar (id=15) has **2 auto-seeded generic benefits** (Benefit A — Efficiency, Benefit B — Revenue) visible alongside the 2 named Yanmar benefits. If an attendee opens the benefits tab, 4 benefits show — 2 look like test data. | Delete benefit id=5 and id=6 from programme 15 via API or admin. |
| P1-B | Governance **decisions and meetings return 501** — any "log a decision" click in the demo will visibly fail. | Either hide the "Add Decision" / "Add Meeting" UI elements for the demo, or implement a stub Decision model. |
| P1-C | **AI governance generate returns 502.** The LLM proxy is down or misconfigured. | Fix the AI backend upstream. Verify the origin server is responsive. If AI is a paid feature not available on demo tier, disable the UI button with a "Coming Soon" label. |
| P1-D | Yanmar **risks tab is empty** (`GET /programs/15/risks/` → `[]`). Slide 7 implies the platform shows a risk register. | Seed 2–3 realistic risks for programme 15 (e.g., "Engine Block X design freeze delay", "EU Stage V compliance timeline risk"). |

### P2 — Visible if Attendee Drills Deeper (Fix This Week)

| ID | Issue | Fix |
|---|---|---|
| P2-A | Yanmar **no linked projects** (project_count=0, progress=0%). The programme dashboard shows a hollow shell. | Link 2–3 existing projects to programme 15 via `POST /programs/15/add_project/`. |
| P2-B | Yanmar **benefits have no target_value, owner, or measurement_unit**. The benefits tab shows empty quantification columns. | PATCH each benefit with realistic values (e.g., target_value=4, measurement_unit="weeks", owner=user_id). |
| P2-C | **SAFe ART screen permanently empty** on programmes 13 and 14 (FK model mismatch). If a SAFe-savvy attendee drills into the ART tab, it shows blank. | Either seed ARTs for the matching project IDs that the model accepts, or add a clear "No ARTs configured — contact your Programme Manager" message. |
| P2-D | **Governance board not linked to Yanmar programme.** All 4 boards have `program=null`. | Update the "E2E Steering Committee" board (id=2e133a77) to set `program=15`. |
| P2-E | **Stakeholder names are empty strings** — all 7 stakeholder records have `name=""`. | This is because stakeholders use `user` FK, not a name field. Ensure the user records (user_name field) have real names displayed, not blanks. Currently `user_name` shows actual names correctly via the serializer. The frontend display needs to read `user_name` not `name`. |

### P3 — Polish Items (This Sprint)

| ID | Issue | Fix |
|---|---|---|
| P3-A | 9 portfolios exist but 6 are duplicates named "E2E Test Portfolio" (test run artifacts). Pollutes the portfolio dropdown. | Clean up duplicate portfolios via admin. |
| P3-B | Programme risks model has `name` field but no `severity` field stored (returns `null`). Risk register looks incomplete. | Add severity enum to programme risk model, or use the `impact`+`probability` fields and compute severity display. |
| P3-C | Reporting sub-tabs (reports, highlights, kpis, stage-gates, exceptions, benefits/profiles, benefits/realization) all 404. These are sidebar tabs — clicking them shows SPA placeholder but no data. | At minimum, add stub API endpoints returning `[]` so the tabs render "No records yet" rather than potentially erroring. |
| P3-D | MSP, PMI, P2-Programme nested URL patterns use `<uuid:programme_id>` — fix to `<int:programme_id>` and update FK targets. | Requires migration — schedule for next sprint. |
| P3-E | Governance board member roles not aligned to PRINCE2 doctrine (using "chair/member" instead of SRO/Senior User/Senior Supplier). | Add role choices to board member model or add a separate "programme board configuration" model. |

---

## 9. Pass Rate Summary

| Area | Endpoints tested | Pass (2xx) | Fail (4xx/5xx) | Pass Rate |
|---|---|---|---|---|
| Programme common tabs (all 7 programmes × 5 tabs) | 35 | 35 | 0 | 100% |
| SAFe methodology-specific | 8 | 8 | 0 | 100% (but all empty) |
| MSP methodology-specific | 3 | 2 | 1 (blueprints 404) | 67% |
| PMI methodology-specific | 2 | 2 | 0 | 100% (global only) |
| Hybrid-Programme methodology-specific | 3 | 1 | 2 | 33% |
| P2-Programme methodology-specific | 2 | 1 | 1 | 50% |
| Governance (tenant-wide) | 10 | 7 | 3 (501×2, 502×1) | 70% |
| Programme reporting/advanced tabs | 13 | 3 (dashboard, roadmap, metrics) | 10 | 23% |
| **TOTAL** | **76** | **59** | **17** | **78%** |

**UUID vs int bugs found:** 4 URL patterns (hybrid, msp, pmi, p2_programme nested routes)  
**FK model class bugs:** 5 models (AgileReleaseTrain, ProgramIncrement, MSPBenefit, MSPTranche, HybridGovernanceConfig, HybridAdaptation, PMIComponent, PMIGovernanceBoard, P2Blueprint, P2ProgrammeProject all point to `projects.Project` not `programs.Program`)  
**501 Not Implemented:** 2 (decisions, meetings)  
**502 Bad Gateway:** 1 (AI generate)

---

## Appendix A: Existing Programme Inventory

| ID | Methodology | Name | ARTs | PIs | Milestones | Benefits | Risks | Linked Projects |
|---|---|---|---|---|---|---|---|---|
| 10 | safe | CRM Product Development | 0 | 0 | 0 | 0 | 2 | 2 |
| 11 | hybrid | CRM Rollout and Adoption | — | — | 0 | 0 | 0 | 1 |
| 12 | prince2_programme | Legacy Siebel Decommission | — | — | 0 | 0 | 0 | 2 |
| 13 | safe | Source2Pay | 0 | 0 | 0 | 0 | 0 | 0 |
| 14 | safe | E2E SAFe Program | 0 | 0 | 0 | 2 | 0 | 0 |
| **15** | **hybrid** | **Yanmar — Compact Equipment Refresh** | — | — | **4** | **4** | **0** | **0** |
| 16 | prince2_programme | E2E PRINCE2 Programme | — | — | 0 | 2 | 0 | 0 |

---

## Appendix B: OpenAPI-Confirmed Endpoint Status

Endpoints in schema but returning 404 in production (deployment gap):
- `/api/v1/safe/pi-objectives/` — global list
- `/api/v1/safe/system-demos/` — no model/view registered
- `/api/v1/safe/inspect-adapt/` — no model/view registered
- `/api/v1/safe/features/` — no model/view registered
- `/api/v1/safe/lean-portfolio/` — no model/view registered
- `/api/v1/safe/value-streams/` — no model/view registered
- `/api/v1/safe/strategic-themes/` — no model/view registered
- `/api/v1/msp/blueprints/` — registered in schema but 404
- `/api/v1/msp/vision/` — not in schema, 404
- `/api/v1/p2-programme/programmes/` — registered in schema but 404 (nested routes fail)
- `/api/v1/governance/escalations/` — not in schema, not registered
- `/api/v1/governance/issues/` — not in schema, not registered

Endpoints in schema, return 200 but zero data on demo programmes:
- `/api/v1/safe/arts/` — 0 items (globally)
- `/api/v1/safe/pis/` — 0 items (globally)
- `/api/v1/msp/tranches/` — 0 items (globally)
- `/api/v1/msp/benefits/` — 0 items (globally)
- `/api/v1/p2-programme/blueprints/` — 0 items (globally)
- `/api/v1/p2-programme/projects/` — 0 items (globally)
- `/api/v1/pmi/components/` — 0 items (globally)
- `/api/v1/pmi/governance-boards/` — 0 items (globally)
- `/api/v1/hybrid-programme/governance-configs/` — 0 items (globally)
- `/api/v1/hybrid-programme/adaptations/` — 0 items (globally)

---

*Audit generated 2026-04-28. Do not delete or mutate demo programmes (ids 14, 15, 16) without approval. Test programmes created during audit were immediately cleaned up (AUDIT-* prefix, ids 17–20 all deleted).*
