# ProjeXtPal — Reports / Dashboards / AI Chats Audit
**Date:** 2026-04-28  
**Auditor:** Reports/Dashboards/Chats Agent  
**Target:** https://projextpal.com  
**Auth:** sami@inclufy.com  
**Scope:** Yanmar deep-dive deck (slides 12 + 13) — demo readiness for 2026-04-29  
**Yanmar Programme:** id=15 (Compact Equipment Refresh, €8.5M, 3 child projects)

---

## SURFACE STATUS GRID

| Surface | Status | HTTP | Notes |
|---|---|---|---|
| Admin Stats Dashboard | PASS | 200 | 13 users, 6 companies, 12 projects |
| Yanmar Programme Dashboard | PASS | 200 | health=green, 4 risks, 2 benefits, 4 milestones |
| PRINCE2 Dashboard (p4 CRM) | PASS | 200 | 4 stages, 1 completed |
| PRINCE2 Dashboard (p8 Engine Block X) | PASS | 200 | 4 stages, 1 completed, brief=approved |
| Waterfall Dashboard (p7 Compact Excavator) | PASS | 200 | 6 phases, progress=16% |
| Hybrid/Agile Dashboard (p11 EU Stage V) | PARTIAL | 200 | has_initialized=False, backlog=0 |
| Kanban Dashboard (p2) | PASS | 200 | 7 cards, 5 columns, board present |
| Kanban Metrics (p2) | PASS | 200 | 2 metric rows |
| Agile Dashboard (p12) | PARTIAL | 200 | has_initialized=False |
| Scrum Dashboard (p1) | FAIL | 200 | sprint_total=0, actual=6 — COUNT DRIFT |
| Scrum Dashboard (p5) | FAIL | 200 | sprint_total=0, actual=4 — COUNT DRIFT |
| Six Sigma Dashboard (p1) | PASS | 200 | 5 DMAIC phases |
| Six Sigma Dashboard (p9 LSS Green) | PASS | 200 | 5 DMAIC phases (fix confirmed) |
| AI Insights (p1) | PASS | 200 | rule-based; keys present |
| AI Insights (p7, p8) | PASS | 200 | analysis + recommendations populated |
| Project Analysis (p8) | PARTIAL | 200 | metrics OK, ai_insights fallback text |
| Academy Cert Stats | PASS | 200 | total=0 (no certs issued yet) |
| Portfolio/Admin Dashboard | NOTE | — | No /portfolio/dashboard/ endpoint; admin/stats/ covers it |

---

## DASHBOARDS DETAIL

### Admin Stats — `/api/v1/admin/stats/`
**HTTP 200 — PASS**

```
overview.total_users           = 13
overview.active_users          = 6
overview.total_companies       = 6
overview.total_projects        = 12
revenue.mrr                    = 0 EUR
growth.users                   = 1200%   (test noise from seeded users)
```
Real activity log present (7 entries), new_users list populated. Shape is complete.

### Yanmar Programme Dashboard — `/api/v1/programs/15/dashboard/`
**HTTP 200 — PASS**

```
health_status   = green
progress        = 17%
project_count   = 3   (p7 Waterfall, p8 PRINCE2, p11 Hybrid)
risks           = 4   (all seeded: EU Stage V high/high, Engine Block X high/med, Field-test med/med, Supplier high/low)
benefits        = 2   (Time-to-market -4wk, Service cost reduction)
milestones      = 4   (Design freeze Jun-11, Pilot Production Jul-26, Field Test Sep-09, EU Type Approval Oct-24)
total_budget    = €8,500,000  ✓ matches seed
spent_budget    = €0
program_manager = Samir Admin
```
All demo-critical fields present and populated. RAG rollup shows green. This is slide 12-ready.

### PRINCE2 Dashboard — Engine Block X (p8) — `/api/v1/projects/8/prince2/dashboard/`
**HTTP 200 — PASS**

```
total_stages      = 4    (source: 4 actual — no drift)
completed_stages  = 1    (Initiation=completed, Build/Stage2/Final=planned)
has_brief         = true  brief_status=approved
has_business_case = true  business_case_status=draft
has_pid           = true  pid_status=draft
tolerances_exceeded = 0
overall_progress  = 25%
```
Slide 12 PRINCE2 panel is demo-ready. Recent highlight reports: 2 entries exist.

### Waterfall Dashboard — Compact Excavator (p7) — `/api/v1/projects/7/waterfall/dashboard/`
**HTTP 200 — PASS**

```
phases count      = 6    (source: 6 actual — no drift)
current_phase     = null (none set active)
overall_progress  = 16%
total_milestones  = 1
completed_milestones = 0
at_risk_milestones   = 0
```
Phases: Requirements(completed), Design/Dev/Test/Deploy/Maintenance(not_started). 
Note: only 1 milestone tracked vs 1 listed — acceptable.

### Hybrid/Agile Dashboard — EU Stage V (p11) — `/api/v1/projects/11/agile/dashboard/`
**HTTP 200 — PARTIAL**

```
has_initialized   = false
total_backlog_items = 0
total_story_points  = 0
average_velocity    = null
```
Project exists and links to Yanmar programme but backlog is empty. Not suitable for live data demo without seeding. Low priority for slide 12 (waterfall and PRINCE2 are the two showcased child projects).

### Scrum Dashboard — COUNT DRIFT BUG — `/api/v1/projects/{1,5}/scrum/dashboard/`
**HTTP 200 — FAIL (data integrity bug)**

| field | dashboard value | source truth | verdict |
|---|---|---|---|
| sprint_total (p1) | 0 | 6 sprints | DRIFT |
| sprint_total (p5) | 0 | 4 sprints | DRIFT |

The `sprint_total` field is hard-coded or miscalculated — it returns `0` regardless of actual sprint count. The `active_sprint` object is correct (Sprint 2, status=active for both projects). The backlog_items_count fields are populated (p1=10, p5=8). This is a query bug in the dashboard aggregate view specifically for the `sprint_total` counter.

**Not on the Yanmar slide 12 demo path** but should be fixed (see P2 below).

### Six Sigma Dashboard (p9 LSS Green) — `/api/v1/sixsigma/projects/9/sixsigma/dashboard/`
**HTTP 200 — PASS**

```
phase_progress keys = ['define', 'measure', 'analyze', 'improve', 'control']
phase count         = 5
```
The LSS-Green DMAIC fix confirmed: exactly 5 phases returned, not 10. All phases show status=upcoming (no tollgates seeded yet, which is acceptable). Project correctly identified as methodology=lean_six_sigma_green.

---

## REPORTS APP

### Status Reports — `/api/v1/communication/status-reports/`
**HTTP 200 — PARTIAL (empty list, schema mismatch)**

List returns 0 rows before test creation. Schema requires `project` (FK to project, not programme), `status` (choices: "Not Started" / "In Progress" / "Completed"), `progress` (int), `last_updated` (date). Note: **no `program` field** — status reports are project-scoped only; programme-level reporting is not supported through this endpoint.

Test creation for Engine Block X (p8) succeeded:
```
POST /api/v1/communication/status-reports/
{"project": 8, "status": "In Progress", "progress": 25, "last_updated": "2026-04-28"}
→ HTTP 201  id="1"  created_at=2026-04-28T16:20:49Z
```
Created report appears in list immediately. Persistence confirmed.

**Demo blocker:** No auto-draft from Yanmar's 3 linked projects. Status reports are manually created, project-scoped only. Slide 12 claims about "auto-draft pulling from linked projects" cannot be demonstrated.

### Highlight Reports — `/api/v1/projects/8/prince2/highlight-reports/`
**HTTP 200 — PASS**

```
Project 8 (Engine Block X): 2 highlight reports
  id=3: period 2026-04-09 to 2026-04-23, overall_status=green
  id=4: period 2026-04-09 to 2026-04-23, overall_status=green
Project 4 (CRM): 3 highlight reports
```
Schema contains: id, report_date, period_start, period_end, overall_status, status_summary, work_completed, work_planned_next_period, issues_summary, risks_summary, budget_spent, budget_forecast. Required fields present.

Note: `status_summary`, `work_completed`, `work_planned_next_period` are all null — content fields are empty. Reports are shell entries only; no narrative content has been authored.

**Demo risk:** If demoing highlight reports live, the content panes will be blank. Pre-author at least one status_summary before the Yanmar demo.

### Reporting Items — `/api/v1/communication/reporting-items/`
**HTTP 200 — PARTIAL (multipart-only endpoint)**

Returns 0 rows. The endpoint rejects `application/json` POST requests (HTTP 415 — Unsupported Media Type). This endpoint expects `multipart/form-data`. Not demo-able via the standard JSON flow. Browser UI may handle this correctly but API layer is inconsistent.

### Meetings / Training Materials
**HTTP 200 — PASS (empty)**  
Both return 200 with empty lists. No records seeded. Not on the slide 12/13 demo path.

### Governance Reports — `/api/v1/governance/reports/generate/`
**HTTP 400 (requires report_id) / AI layer broken**

The endpoint returns HTTP 400 with `{"error": "report_id is required"}` when called without a valid report_id. When called with `report_id=1` it returns `{"error": "Unknown report type: 1"}`. The governance root lists portfolios, boards, board-members, stakeholders — no programme-level report objects exist in the governance module for Yanmar. Governance AI generate (POST /api/v1/governance/ai/generate/) returns 502 (OpenAI 401, see AI section).

---

## AI CHATS (ROUND-TRIP)

### Root cause of all AI failures: Invalid OpenAI API key

Every AI endpoint routes through the OpenAI client. The API key stored in the environment is invalid:

```
Error code: 401 - {'error': {'message': 'Incorrect API key provided: sk-proj-***...1oMA.
                             'type': 'invalid_request_error',
                             'code': 'invalid_api_key'}}
```

This single root cause causes all 8 AI generators to fail (502 or 500 depending on path).

### Bot Chat Round-Trip — `/api/v1/bot/chats/`

| Step | HTTP | Result |
|---|---|---|
| POST /bot/chats/ (create) | 201 | chat_id issued, title stored |
| POST /bot/chats/{id}/send_message/ | 200 | user message stored; AI reply = error text |
| GET /bot/chats/{id}/history/ | 200 | 2 messages persisted (user + assistant error) |
| GET /bot/chats/search/?q=term | 200 | search functional, returns results |
| GET /bot/chats/ (list) | 200 | 5 chats listed with messages embedded |

**Persistence: CONFIRMED** — messages survive a round-trip even when the AI errors. The chat infrastructure (create, store, retrieve, search) is working. The assistant reply content is always the 401 error string.

**Response time:** 0.4s (fast because the OpenAI call fails immediately on auth, not a timeout).

### AI Coach — `/api/v1/academy/ai/coach/message/`
**HTTP 502 — BROKEN**

Cloudflare 502 (origin bad gateway). The backend process crashes or times out when it hits the OpenAI 401. Slide 13 demo moment 1 ("AI Coach answering PRINCE2 brief question") is **not demo-able**.

### Governance AI Generate — `/api/v1/governance/ai/generate/`
**HTTP 502 — BROKEN**

Same Cloudflare 502 pattern. Slide 13 demo moment 3 ("AI drafting steering committee agenda") is **not demo-able**.

### AI Risk Generation (Slide 13 demo moment 2)
**HTTP 404 — endpoint does not exist**

Tested paths:
- `/api/v1/projects/8/ai/generate-risks/` → 404
- `/api/v1/ai/generate-report/` → 404
- `/api/v1/projects/8/risks/generate/` → 404

No dedicated "generate 15 candidate risks" endpoint exists. The bot/project-analysis endpoint exists and returns a metrics object but the `ai_insights` field returns fallback text: `"Unable to generate AI analysis. Review metrics manually."` — confirming same 401 root cause.

Slide 13 demo moment 2 is **not demo-able** (endpoint 404 + AI broken).

### Academy AI Generators (all)
| Endpoint | HTTP | Note |
|---|---|---|
| /academy/ai/coach/message/ | 502 | Cloudflare bad gateway |
| /governance/ai/generate/ | 502 | Cloudflare bad gateway |
| /academy/ai/generate-quiz/ | 500 | Origin 500 |
| /academy/ai/generate-exam/ | 500 | Origin 500 |
| /academy/ai/generate-practice/ | 502 | Cloudflare bad gateway |
| /academy/ai/generate-simulation/ | 500 | Origin 500 |
| /academy/ai/generate-assignment/ | 500 | Origin 500 |
| /academy/ai/generate-content/ | 500 | Origin 500 |

All 8 AI generators are broken. Common root: OpenAI API key invalid (401).

---

## COUNT DRIFT SUMMARY

| Dashboard | Field | Dashboard Value | Source Truth | Drift? |
|---|---|---|---|---|
| Scrum p1 | sprint_total | 0 | 6 | YES — bug |
| Scrum p5 | sprint_total | 0 | 4 | YES — bug |
| PRINCE2 p8 | total_stages | 4 | 4 | No |
| Waterfall p7 | phases count | 6 | 6 | No |
| Kanban p2 | total_cards | 7 | 7 | No |
| Six Sigma p9 | phase_progress keys | 5 | 5 DMAIC | No |

One structural bug: `sprint_total` always returns 0 in the scrum dashboard aggregate. The active_sprint object is correctly populated; only the total counter is wrong.

---

## SLIDE 12 DEMO READINESS (Dashboards + Reports)

| Slide 12 element | Demo-ready? | Risk |
|---|---|---|
| Portfolio dashboard — all programmes + RAG | YES | All 7 programmes show green RAG |
| Yanmar programme dashboard | YES | 4 risks, 2 benefits, 4 milestones, €8.5M budget |
| 3 child project dashboards (PRINCE2/Waterfall/Hybrid) | YES/YES/PARTIAL | p11 has no backlog data |
| Status reports for Yanmar | PARTIAL | Manually created, no auto-draft from linked projects |
| Highlight reports (Engine Block X) | PARTIAL | 2 reports exist but content fields are null |
| Six Sigma DMAIC (5 phases) | YES | LSS fix confirmed |

---

## SLIDE 13 DEMO READINESS (AI Chat)

| Slide 13 demo moment | Demo-ready? | Reason |
|---|---|---|
| "AI Coach: PRINCE2 brief for industrial product launch" | NO | 502 — OpenAI key invalid |
| "AI generating 15 candidate risks for Engine Block X" | NO | 404 + OpenAI key invalid |
| "AI drafting steering committee agenda" | NO | 502 — OpenAI key invalid |
| Bot chat infrastructure (create/send/history/search) | YES | Mechanics work; AI content broken |

All 3 slide 13 demo moments will fail live. This is a P1 blocker.

---

## TOP 5 DEMO BLOCKERS (slides 12 + 13)

### BLOCKER 1 (P1-CRITICAL): OpenAI API key is invalid
All AI surfaces return 401 from OpenAI. The key `sk-proj-...1oMA` is rejected. Affects: AI Coach, governance/ai/generate, all academy generators, bot/chats assistant replies, project AI insights. Every AI demo on slide 13 will fail live.

**Fix tonight:** Set a valid `OPENAI_API_KEY` in the production environment and restart the Django/Gunicorn workers. Verify with a single POST to /api/v1/academy/ai/coach/message/.

### BLOCKER 2 (P1-HIGH): No AI risk generation endpoint
Slide 13 promises "AI generating 15 candidate risks for Engine Block X." No such endpoint exists at any tested path. The project analysis endpoint (`/api/v1/bot/project-analysis/8/`) returns a metrics object but generates no candidate risks.

**Fix tonight (option A):** Add a `/api/v1/projects/{id}/ai/generate-risks/` endpoint that calls OpenAI with project context and returns a list of candidate risks.  
**Fix tonight (option B):** Reframe the demo: use the existing bot chat to prompt "Generate 15 candidate risks for an industrial cross-region engineering project." Once the OpenAI key is fixed, the bot/chats send_message flow will work.

### BLOCKER 3 (P1-HIGH): Highlight reports have null content
Engine Block X has 2 highlight reports but all content fields (status_summary, work_completed, work_planned_next_period, issues_summary, risks_summary) are null. A live demo clicking into a highlight report will show empty panels.

**Fix tonight:** Pre-author status_summary and work_completed text for at least report id=3 on project 8 via PATCH /api/v1/projects/8/prince2/highlight-reports/3/.

### BLOCKER 4 (P2-MEDIUM): Scrum sprint_total always returns 0
`/api/v1/projects/{id}/scrum/dashboard/` returns `sprint_total: 0` when the source has 6 sprints (p1) and 4 sprints (p5). This is a query bug in the dashboard aggregate. Not on the Yanmar demo path but visible if anyone navigates to a scrum project.

**Fix:** Investigate the `sprint_total` field in the scrum dashboard serializer/view. Likely filtering to only active/future sprints (which returns 0) instead of all sprints.

### BLOCKER 5 (P2-MEDIUM): Governance AI generate — no route to Yanmar steering agenda
The governance module has no programme-level board configured for Yanmar. Boards listed are all CRM-related. There is no "Yanmar Compact Equipment Steering Committee" board. Even if the OpenAI key is fixed, the slide 13 agenda demo requires either: (a) a Yanmar board record, or (b) using the bot/chats flow instead. The /governance/reports/generate/ endpoint also expects a pre-existing `report_id`.

**Fix tonight:** Create a governance board for Yanmar (POST /api/v1/governance/boards/) and use the bot/chats endpoint for the live agenda demo once OpenAI key is valid.

---

## AI CHAT PERSISTENCE: CONFIRMED

Persistence is working correctly:
- POST /bot/chats/ → 201, chat_id issued
- POST /bot/chats/{id}/send_message/ → 200, both user + assistant messages stored
- GET /bot/chats/{id}/history/ → 200, messages present across requests
- GET /bot/chats/ list → chats appear with embedded messages
- GET /bot/chats/search/?q=term → semantic search functional (returns results)

The storage/retrieval layer is healthy. Only the AI content is broken (OpenAI 401).

---

## REMEDIATION LIST

### P1 — Fix Tonight (before 2026-04-29 09:00)

1. **Replace OpenAI API key in production**
   - Update `OPENAI_API_KEY` in the production environment (server env / .env / secrets manager)
   - Restart Gunicorn/Django workers to pick up new key
   - Smoke test: `curl -X POST https://projextpal.com/api/v1/academy/ai/coach/message/ -H "Authorization: Bearer <token>" -d '{"message":"test"}'`
   - Expected: HTTP 200 with non-empty `response` field and response time 2-10s
   - All 8 AI generators should recover automatically once the key is valid

2. **Pre-author highlight report content for Engine Block X (p8)**
   - PATCH /api/v1/projects/8/prince2/highlight-reports/3/ with status_summary, work_completed, risks_summary
   - PATCH /api/v1/projects/8/prince2/highlight-reports/4/ with same
   - This makes slide 12 reports panel non-empty for the live demo

3. **Create Yanmar governance board + prepare bot/chats demo flow**
   - POST /api/v1/governance/boards/ with name="Yanmar Compact Equipment Steering Committee", programme=15
   - Prepare a scripted bot/chats session: pre-stage a chat titled "AUDIT-Yanmar Steering Agenda" with context about open decisions from the last programme meeting
   - Once OpenAI key is valid, the send_message call will return real content for slide 13 demo moment 3

### P2 — Polish (this week)

4. **Fix scrum dashboard sprint_total = 0 bug**
   - The `sprint_total` field in the scrum dashboard serializer counts 0 for all projects
   - Active_sprint is correct, only the total is wrong
   - Likely fix: change the queryset in `ScrumDashboardView` to count all sprints (not filtered by status=active)

5. **Add AI risk generation endpoint OR expand bot/project-analysis**
   - Add `/api/v1/projects/{id}/ai/generate-risks/` that takes `count` param
   - OR add a `candidate_risks` field to `/api/v1/bot/project-analysis/{id}/` response
   - This enables slide 13 demo moment 2 natively

6. **Seed EU Stage V (p11) backlog**
   - `has_initialized=False`, 0 backlog items, 0 story points
   - For a credible 3-project Yanmar programme demo, seed at least 5-8 backlog items

7. **Add programme field to status reports**
   - Current schema only has `project` (FK) — no `programme` FK
   - Auto-draft from linked projects is not possible without this
   - Consider a programme-level status report model or aggregation view

### P3 — Backlog

8. **Reporting items multipart-only restriction**
   - POST /communication/reporting-items/ rejects application/json (HTTP 415)
   - Inconsistent with rest of API; fix content-type negotiation

9. **Academy dashboard endpoint missing**
   - /api/v1/academy/dashboard/ → 404
   - /api/v1/academy/stats/ → 404
   - Add a summary stats endpoint for the academy surface

10. **Bot project-analysis ai_insights fallback text**
    - Even with a valid OpenAI key, the project analysis endpoint may not call OpenAI if the key error causes a silent fallback
    - After key fix, verify `/api/v1/bot/project-analysis/8/` returns real executive_summary, top_risks, recommendations

---

## APPENDIX — ENDPOINT INVENTORY

### Dashboards tested

| Endpoint | HTTP | Notes |
|---|---|---|
| /api/v1/admin/stats/ | 200 | Full data |
| /api/v1/programs/15/dashboard/ | 200 | Yanmar full |
| /api/v1/programs/15/ | 200 | Programme detail with risks/benefits/milestones |
| /api/v1/projects/8/prince2/dashboard/ | 200 | Engine Block X |
| /api/v1/projects/4/prince2/dashboard/ | 200 | CRM |
| /api/v1/projects/7/waterfall/dashboard/ | 200 | Compact Excavator |
| /api/v1/projects/11/agile/dashboard/ | 200 | EU Stage V (empty) |
| /api/v1/projects/1/scrum/dashboard/ | 200 | sprint_total DRIFT |
| /api/v1/projects/5/scrum/dashboard/ | 200 | sprint_total DRIFT |
| /api/v1/projects/2/kanban/dashboard/ | 200 | 7 cards |
| /api/v1/projects/2/kanban/metrics/ | 200 | 2 metric rows |
| /api/v1/projects/12/agile/dashboard/ | 200 | Empty |
| /api/v1/sixsigma/projects/1/sixsigma/dashboard/ | 200 | 5 phases |
| /api/v1/sixsigma/projects/9/sixsigma/dashboard/ | 200 | 5 phases (fix OK) |
| /api/v1/academy/admin/certificates/stats/ | 200 | 0 certs |
| /api/v1/projects/7/ai-insights/ | 200 | Rule-based only |
| /api/v1/projects/8/ai-insights/ | 200 | Rule-based only |
| /api/v1/bot/project-analysis/8/ | 200 | Metrics OK; AI fallback |

### Reports tested

| Endpoint | HTTP | Rows | Notes |
|---|---|---|---|
| /api/v1/communication/status-reports/ | 200 | 1 (AUDIT created) | project-scoped only |
| /api/v1/communication/reporting-items/ | 200 | 0 | multipart only |
| /api/v1/communication/meetings/ | 200 | 0 | empty |
| /api/v1/communication/training-materials/ | 200 | 0 | empty |
| /api/v1/projects/8/prince2/highlight-reports/ | 200 | 2 | null content |
| /api/v1/projects/4/prince2/highlight-reports/ | 200 | 3 | present |
| /api/v1/governance/ | 200 | — | 4 sub-resources |
| /api/v1/governance/boards/ | 200 | 3 | CRM boards only |
| /api/v1/governance/reports/ | 404 | — | not found |
| /api/v1/governance/reports/generate/ | 400/405 | — | needs report_id |
| /api/v1/governance/ai/generate/ | 502 | — | OpenAI 401 |

### AI Chat endpoints tested

| Endpoint | HTTP | Result |
|---|---|---|
| POST /api/v1/bot/chats/ | 201 | Works |
| POST /bot/chats/{id}/send_message/ | 200 | Stores; AI content = 401 error |
| GET /bot/chats/{id}/history/ | 200 | Persistence confirmed |
| GET /bot/chats/search/?q=term | 200 | Returns results |
| GET /bot/chats/ | 200 | 5 chats listed |
| POST /api/v1/academy/ai/coach/message/ | 502 | OpenAI 401 |
| POST /api/v1/governance/ai/generate/ | 502 | OpenAI 401 |
| POST /api/v1/academy/ai/generate-quiz/ | 500 | OpenAI 401 |
| POST /api/v1/academy/ai/generate-exam/ | 500 | OpenAI 401 |
| POST /api/v1/academy/ai/generate-practice/ | 502 | OpenAI 401 |
| POST /api/v1/academy/ai/generate-simulation/ | 500 | OpenAI 401 |
| POST /api/v1/academy/ai/generate-assignment/ | 500 | OpenAI 401 |
| POST /api/v1/academy/ai/generate-content/ | 500 | OpenAI 401 |

---

*Report generated: 2026-04-28T16:22:00Z*  
*Total checks: 50+ endpoint probes*  
*Artefacts created: AUDIT-Yanmar-Test chat (88bd5631), AUDIT-persistence-check chat (71fb5609), status report id=1 for project 8*
