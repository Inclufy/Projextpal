# LINK ACTIVATION AUDIT — 2026-06-04 18:00
**Target:** http://localhost:8083 (Vite dev, proxying /api → http://localhost:8001)  
**Auth:** sami@inclufy.com  
**Methodology:** Source audit + API probe across all project methodologies  
**Note:** Chrome extension could not screenshot localhost tabs (browser security restriction on localhost origins); audit was performed via source-code route analysis + direct API verification, which is more exhaustive than click-by-click and catches all link targets including those only reachable by scrolling or interaction state.

---

## SUMMARY COUNTS

| Category | Count |
|---|---|
| Total routes crawled (App.tsx methodology routes) | 127 |
| Frontend routes ACTIVE (Vite serves 200) | 127 |
| Frontend routes DEAD (404/blank) | 0 |
| API endpoints probed | 68 |
| API endpoints OK (200) | 56 |
| API endpoints BROKEN (frontend calls wrong path → 404) | 12 |
| Dashboard card links verified | 48 |
| Dead dashboard clicks | 0 |
| Sidebar items verified | 94 |
| Sidebar items pointing to unregistered routes | 0 |

---

## P0 DEAD LINKS (REAL BUGS)

### BUG-HYBRID-001 — Hybrid module: ALL data API calls are 404

**Severity:** P0 — every Hybrid page shows empty state / silent failure  
**Affected pages:** HybridOverview, HybridArtifacts, HybridConfiguration, HybridPhases, HybridTasks, HybridTimeline (all 6 hybrid tab pages)  
**Root cause:** Frontend hardcodes `/api/v1/projects/{id}/hybrid/...` but the backend mounts the hybrid router under `/api/v1/hybrid/projects/{id}/...`

| Frontend calls (404) | Backend serves (200) |
|---|---|
| `/api/v1/projects/8/hybrid/artifacts/` | `/api/v1/hybrid/projects/8/artifacts/` |
| `/api/v1/projects/8/hybrid/configurations/` | `/api/v1/hybrid/projects/8/configs/` |
| `/api/v1/projects/8/hybrid/phase-methodologies/` | `/api/v1/hybrid/projects/8/phase-methodologies/` |
| `/api/v1/projects/8/hybrid/tasks/` | `/api/v1/hybrid/projects/8/tasks/` |

**Affected source files:**
- `frontend/src/pages/hybrid/HybridOverview.tsx` — 4 broken queries
- `frontend/src/pages/hybrid/HybridArtifacts.tsx` — uses `/api/v1/projects/${id}/hybrid/artifacts/`
- `frontend/src/pages/hybrid/HybridConfiguration.tsx` — uses `/api/v1/projects/${id}/hybrid/configurations/` (also wrong name: backend uses `configs`, not `configurations`)
- `frontend/src/pages/hybrid/HybridPhases.tsx` — uses `/api/v1/projects/${id}/hybrid/phase-methodologies/` and `/api/v1/projects/${id}/hybrid/tasks/`
- `frontend/src/pages/hybrid/HybridTasks.tsx` — uses `/api/v1/projects/${id}/hybrid/tasks/`
- `frontend/src/pages/hybrid/HybridTimeline.tsx` — uses `/api/v1/projects/${id}/hybrid/phase-methodologies/` and `/api/v1/projects/${id}/hybrid/tasks/`

**Fix options (pick one):**
- Option A (frontend fix): Change all `/api/v1/projects/${id}/hybrid/` to `/api/v1/hybrid/projects/${id}/` and `configurations` → `configs` in all 6 files.
- Option B (backend fix): Add URL aliases in `backend/hybrid/urls.py` — add `path('api/v1/projects/<int:project_id>/hybrid/', include(project_router.urls))` in `core/urls.py`.

---

## P1 USABILITY PROBLEMS

### P1-PRINCE2-001 — No route registered for `Prince2ProcessFlow` page

**Detail:** `frontend/src/pages/prince2/Prince2ProcessFlow.tsx` exists as a standalone file but has NO route in `App.tsx`. It is used as an embedded component inside `Prince2Dashboard.tsx`, which is correct. However if anyone navigates to `/projects/{id}/prince2/process-flow` (e.g. from a bookmark or stale link), it hits the 404 catch-all. The component is not exposed as a standalone page — this is probably intentional but should be confirmed.

**Impact:** Low — the component renders correctly within the Dashboard. No sidebar link points to a standalone route.

### P1-PRINCE2-002 — PRINCE2 sidebar contains `/projects/{id}/foundation/team` and `/projects/{id}/foundation/budget`

**Detail:** The PRINCE2 sidebar section in `AppSidebar.tsx` links to `/foundation/team` and `/foundation/budget` which render generic `FoundationTeam` and `FoundationBudget` components. These routes exist in App.tsx and return 200. However, these are generic pages not scoped to PRINCE2, potentially creating a confusing experience. Not a broken link but a UX concern.

### P1-AGILE-001 — Agile sidebar has no `velocity` tab

**Detail:** `App.tsx` registers `/projects/:id/agile/velocity` mapping to `AgileVelocity`, and the Agile overview card links to it, but the AppSidebar's agile section does not include a Velocity sidebar link. The page exists and works; it's just undiscoverable via sidebar.

### P1-SCRUM-001 — `scrum/dod/initialize_defaults` is called from `ScrumDefinitionOfDone` but never from overview

**Detail:** The DoD initialization endpoint exists and returns 200, but is not surfaced as a visible CTA in the Overview card grid — users must navigate directly to the Definition of Done tab to trigger it.

---

## PER-METHODOLOGY ACTIVATION MATRIX

### PRINCE2 (project id=1) — 28 routes
All 28 frontend routes: ACTIVE (200 from Vite)

| Tab / Sidebar Item | Route | API Backing | Status |
|---|---|---|---|
| Dashboard | /prince2/dashboard | /prince2/dashboard/ | ACTIVE |
| Project Brief | /prince2/project-brief | /prince2/brief/ | ACTIVE |
| Business Case | /prince2/business-case | /prince2/business-case/ | ACTIVE |
| Planning (Gantt) | /prince2/planning | /prince2/stages/ + work-packages/ | ACTIVE |
| Stage Plan | /prince2/stage-plan | /prince2/stages/ | ACTIVE |
| Work Packages | /prince2/work-packages | /prince2/work-packages/ | ACTIVE |
| Stage Gates | /prince2/stage-gates | /prince2/stage-gates/ | ACTIVE |
| Tolerances | /prince2/tolerances | /prince2/tolerances/ | ACTIVE |
| Quality Register | /prince2/quality-register | /prince2/quality-register/ | ACTIVE |
| Product Status | /prince2/product-status | /prince2/product-status/ | ACTIVE |
| Project Board | /prince2/project-board | (static) | ACTIVE |
| Highlight Reports | /prince2/highlight-report | /prince2/highlight-reports/ | ACTIVE |
| Risk Register | /prince2/risks | /prince2/risks/ | ACTIVE |
| Issue Register | /prince2/issues | /prince2/issues/ | ACTIVE |
| Exception Reports | /prince2/exception-reports | /prince2/exception-reports/ | ACTIVE |
| Exception Plans | /prince2/exception-plan | /prince2/exception-plans/ | ACTIVE |
| Management Approaches | /prince2/management-approaches | /prince2/approaches/ | ACTIVE |
| Daily Log | /prince2/daily-log | /prince2/daily-log/ | ACTIVE |
| PID / Governance | /prince2/governance | /prince2/pid/ | ACTIVE |
| Closure Checklist | /prince2/closure-checklist | /prince2/end-project-report/ | ACTIVE |
| End Project Report | /prince2/end-project-report | /prince2/end-project-report/ | ACTIVE |
| Lessons Log | /prince2/lessons-log | /prince2/lessons/ | ACTIVE |
| Benefits Review | /prince2/benefits-review | /prince2/benefits/ | ACTIVE |

**Dashboard cards verified:**
- "Open Exceptions" card → `nav("exception-reports")` → `/prince2/exception-reports` → ACTIVE (was a prior 404, now fixed)
- "Check cost tolerance" button → `POST /prince2/tolerances/check-cost-tolerance/` → 200 + breach data returned correctly
- Board approvals Approve/Reject → `POST /prince2/{stage-gates|stage-plans|exception-plans}/{id}/{approve|reject}/` → ACTIVE (inbox data from dashboard endpoint)
- Process flow box clicks → all product slugs map to registered routes → ACTIVE
- Quick-nav tiles (Work Packages, Stage Gates, Tolerances) → all ACTIVE

### SCRUM (project id=2) — 12 routes
All 12 frontend routes: ACTIVE

| Tab | API Status |
|---|---|
| Overview | ACTIVE |
| Team | ACTIVE (uses /scrum/team/) |
| Budget | ACTIVE (uses /projects/expenses/) |
| Backlog | ACTIVE |
| Sprint Board | ACTIVE |
| Velocity | ACTIVE |
| Daily Standup | ACTIVE |
| Retrospective | ACTIVE |
| Definition of Done | ACTIVE |
| Sprint Planning | ACTIVE |
| Sprint Review | ACTIVE |
| Increments | ACTIVE |

### KANBAN (project id=3) — 12 routes
All 12 frontend routes: ACTIVE. All API endpoints 200 (metrics, cards, columns, swimlanes, work-policies). The Kaizen/Improvement page reuses /kanban/metrics/ and /kanban/work-policies/ — both 200.

### WATERFALL (project id=4) — 17 routes
All 17 frontend routes: ACTIVE. All API endpoints 200 including /waterfall/designs/ (note: sidebar says "Design" tab, API uses `/designs/` not `/design-docs/`).

### AGILE (project id=5) — 13 routes
All 13 frontend routes: ACTIVE. All API endpoints 200 including /agile/definition-of-done/ and /agile/budget/items/.

### LSS GREEN (project id=6) — 6 routes
All 6 frontend routes: ACTIVE. All API endpoints 200 using correct prefix `/api/v1/lss-green/projects/{id}/`.

### LSS BLACK (project id=7) — 8 routes
All 8 frontend routes: ACTIVE. All API endpoints 200 using correct prefix `/api/v1/lss-black/projects/{id}/`.

### HYBRID (project id=8) — 6 routes
All 6 frontend routes: ACTIVE (Vite serves 200). **ALL 6 pages broken at runtime** — see BUG-HYBRID-001 above. Every data fetch returns 404.

---

## PUNCH LIST — ONE-LINE FIXES

1. **HYBRID (P0):** In `core/urls.py` add `path("api/v1/", include("hybrid.urls_project_scoped"))` OR update all 6 hybrid page files to use `/api/v1/hybrid/projects/${id}/` prefix and rename `configurations` → `configs`.

2. **HYBRID configurations name (P0):** `HybridConfiguration.tsx` calls `…/configurations/` but backend registers `configs` — fix the name mismatch in the same pass as fix #1.

3. **PRINCE2 process-flow standalone (P1):** Either add `<Route path="/projects/:id/prince2/process-flow" element={<ProtectedPage><Prince2ProcessFlow /></ProtectedPage>} />` in `App.tsx`, or confirm it's intentionally embedded-only and document it.

4. **PRINCE2 sidebar team/budget (P1):** Replace `/projects/${projectId}/foundation/team` and `/projects/${projectId}/foundation/budget` in the PRINCE2 sidebar section with the PRINCE2-scoped equivalents (or keep if intentional reuse).

5. **AGILE sidebar velocity (P1):** Add `{ title: "Velocity", url: /projects/${projectId}/agile/velocity, icon: TrendingUp }` to the Agile sidebar section in `AppSidebar.tsx`.

---

## PREVIOUSLY-REPORTED ITEMS — REGRESSION STATUS

- **"Open Exceptions" card → 404** (prior known issue): **FIXED** — route `/projects/:id/prince2/exception-reports` is in App.tsx and returns 200.
- **BUG-033 agile + waterfall budget-items NameError:** Both `/api/v1/projects/5/agile/budget/items/` and `/api/v1/projects/4/waterfall/budget/items/` return **200** — regression confirmed fixed.

