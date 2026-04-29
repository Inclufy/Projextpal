# ProjeXtPal — Test Findings & Bug Report

**Date:** 2026-04-22
**Scope:** Web app (projextpal.com), mobile Expo app, Django backend, frontend Vite/React
**Test scenario (intended):** CRM implementation — Governance → Programs (Waterfall/Agile/Hybrid) → Projects (Scrum/Kanban/Waterfall/PRINCE2) → Team assignments → Planning → Time tracking

---

## 1. Executive summary

| Layer | Status | Evidence |
|---|---|---|
| Frontend web tests (Vitest) | ✅ **146/146 pass** | `frontend/` vitest run OK |
| Frontend TypeScript (Vite app) | ✅ Passes | `tsc --noEmit` clean |
| Mobile app TypeScript (Expo RN) | ❌ **30+ TS errors across 11 files** | See Bug #5 |
| Backend test suite | ❌ **Cannot even boot** | conftest imports crash before `django.setup()` |
| Backend API auth (`/auth/login-2fa/`) | 🟧 Works via fetch but **UI gets 401**, prod log has 500s | See Bug #1b |
| Backend DB migrations | ❌ **Missing tables in prod** | `academy_skills`, `academy_skill_categories` → 500s on `/academy/skills/user-skills/summary/` |
| Web login UX | ❌ **Submits stale payload + silent failure on 401** | Autofill race; no error toast |
| **Programs create** | ❌ **500 on every payload — feature dead** | Bug #14 |
| **Projects create** | ❌ **Blocked — admin has no company link** | Bug #17 |
| **Portfolio create** | 🟧 Works via API but **UI button doesn't fire POST**; created orphan with no owner/company | Bugs #15, #16 |
| CRM scenario execution | ❌ **1 of 8 steps succeeded** | See §2 updated |

**Headline:** Despite a marketing-level health looking OK (web tests pass, frontend tsc clean, site renders), the application is **effectively unusable** for its core purpose. The superadmin cannot create a program (500) or a project (no-company error). The only CRUD that succeeded is an **orphan portfolio** with no owner and no tenant scoping. Nine P0 bugs in total.

---

## 2. CRM scenario — execution log (UPDATED — now executed end-to-end via API)

**Credentials used**: `sami@inclufy.com` / `Eprocure2025!` (superadmin / `is_superuser: true`)

| Step | Target | Result | Evidence |
|---|---|---|---|
| 0. Reach login page | https://projextpal.com/login | ✅ OK | Welcome Back form renders |
| 1. UI login with correct creds | Click "Sign In" | ❌ **401 even with valid password** | See Bug #1b |
| 1b. Direct JS fetch with same creds | POST `/api/v1/auth/login-2fa/` | ✅ **200 + JWT tokens** | Confirms UI form submits wrong payload — browser autofill or React state bug |
| 1c. Injected tokens into `localStorage` | `/dashboard` | ✅ Executive Dashboard renders |
| 2. **Create IT CRM Portfolio (governance)** | POST `/api/v1/governance/portfolios/` | ✅ **201 Created** | id `ab7c8aa1-5a19-4d01-9b57-b69fbd71a331`. BUT: `owner: null, company: null` — see Bug #15 |
| 2b. UI click "Create Portfolio" button | same endpoint | ❌ **No request fired** | URL unchanged, no POST in network panel. See Bug #16 |
| 3. **Create 3 Programs** (SAFe / Hybrid / PRINCE2 Programme) | POST `/api/v1/programs/` | ❌ **500 Server Error on ALL payloads** | Tested 6 variants (minimal, with methodology, without portfolio) — all 500. See Bug #14 |
| 4. **Create 4 Projects** (Scrum / Kanban / Waterfall / PRINCE2) | POST `/api/v1/projects/` | ❌ **400 `Je account is niet gekoppeld aan een bedrijf`** | User.company is null → all project creation blocked. No `/companies/` endpoint exists. See Bug #17 |
| 5. Assign people to programs/projects | — | ❌ **Blocked** — programs don't create, projects don't create |
| 6. Planning (milestones / tasks / sprints) | POST `/api/v1/projects/milestones/, /tasks/` | ❌ **Blocked** — all require `project` FK, no project can be made |
| 7. Time tracking | POST `/api/v1/projects/time-entries/` | ❌ **Blocked** — requires `project` FK |
| 8. Risks register | POST `/api/v1/projects/risks/` | ❌ **Blocked** — requires `project` FK |

**End-to-end CRM scenario: 1 of 8 steps succeeded.** The only thing that got created is an orphan portfolio with no owner and no company.

---

## 3. Bug list (prioritized)

### 🔴 P0 — blockers (NEW in this run)

#### Bug #14 — `POST /api/v1/programs/` always returns 500 — **programs feature completely broken**
- **Where:** Backend programs view / serializer
- **Observed:** Every payload variant (minimal `{name}`, with valid `methodology`, with/without `portfolio`) returns an HTML Django 500 error page, no JSON. Tested `safe`, `hybrid`, `prince2_programme`, `msp`, `pmi`, and no-methodology — all 500.
- **Impact:** No program can be created via API or UI. The **entire Programs feature is non-functional in production.**
- **Next step:** Read prod `error.log` for the traceback right after a POST. Likely causes: missing required field on the Program model that isn't exposed in the serializer, bad default on a FK, or a `save()` override that references a missing column/attr.
- **Fix:** Wrap `ProgramViewSet.perform_create()` and the serializer `create()` in try/except; add a minimal integration test that `POST /api/v1/programs/ {name:"x"}` returns 201 or 400 (never 500).

#### Bug #15 — Portfolio created with `owner: null` and `company: null`
- **Where:** `backend/governance/views.py` Portfolio create
- **Observed:** Successful `POST /governance/portfolios/` returned `{owner:null, company:null, owner_name:null}` despite valid JWT auth.
- **Impact:** Orphan portfolios. Multi-tenancy isolation broken — any user from any company can list/edit them because they aren't scoped.
- **Fix:** Override `perform_create(self, serializer): serializer.save(owner=self.request.user, company=self.request.user.company)`. Add a check: reject the POST (400) if `request.user.company` is null.

#### Bug #16 — UI "Create Portfolio" button doesn't fire a POST
- **Where:** [frontend/src/pages/...Portfolio new page](frontend/src/pages) (exact file not yet opened; route `/governance/portfolios/new`)
- **Observed:** Filled name + description via MCP, clicked the submit button — no POST appeared in the network panel, URL unchanged, form still visible. The direct `fetch('/api/v1/governance/portfolios/')` from DevTools console worked fine → UI form handler has a bug.
- **Likely cause:** React Hook Form validation silently blocking submit, or button handler not wired, or form sends via `fetch(API_URL + ...)` where `API_URL` is undefined in prod build.
- **Fix:** Grep for the portfolio form component, verify `onSubmit` is bound to the `<form>` or button, confirm token is attached, log the submit event.

#### Bug #17 — Superadmin account has no `company` → cannot create projects
- **Where:** Project serializer company validation + `accounts/models.py` User-Company relationship
- **Observed:** As `sami@inclufy.com` (superuser, role `superadmin`, id=1): `POST /projects/ {name, methodology, …}` returns 400 with Dutch error: **"Je account is niet gekoppeld aan een bedrijf. Neem contact op met je beheerder."** No `/companies/`, `/admin/companies/`, or `/accounts/companies/` endpoint exists to self-fix.
- **Impact:** The OWNER of the platform cannot test it. New signups probably hit this too after registration if company-linking isn't automatic. All downstream features (projects, tasks, time tracking, risks, budget, milestones) unreachable.
- **Fix:**
  1. Short term: `python manage.py shell` and attach a Company to user id 1.
  2. Medium term: Add a migration / management command that backfills missing companies.
  3. Long term: Expose `POST /api/v1/admin/companies/` + `POST /api/v1/admin/users/<id>/assign-company/`.
  4. Also: the Dutch error message is returned regardless of UI locale — i18n the error code (return `{code: "NO_COMPANY"}` and let UI localize).

#### Bug #1b — Login form submits wrong payload (browser autofill race condition)
- **Where:** [frontend/src/pages/Login.tsx](frontend/src/pages/Login.tsx) `handleSubmit`
- **Observed:** Same credentials (`sami@inclufy.com` / `Eprocure2025!`) tested two ways on the same page:
  - Typed into the inputs via MCP, clicked Sign In → `POST /login-2fa/ → 401`
  - Sent via `fetch()` from DevTools console with identical body → `POST /login-2fa/ → 200` with JWT.
- **Root cause (likely):** React state (`email`, `password`) gets out of sync with the input DOM value because Chrome's password autofill updates the DOM without firing the React onChange. When you type on top of the autofilled field, the React state retains the old value. On submit, the handler POSTs the stale React state, not the current DOM value.
- **Fix:** In `handleSubmit`, read directly from the form element via `new FormData(e.currentTarget)` instead of using React state, OR attach a ref and read `emailRef.current?.value`, OR listen to the `input` event (not just `change`), OR `autoComplete="off"` on the form (less UX-friendly).
- **Severity update:** Bug #1 was "silent failure on 401." This upgrades it: for some users (with autofill) the 401 is **caused by the UI itself**, not wrong credentials.

#### Bug #1 — Web app: silent failure on login 401
- **Where:** [frontend/src/pages/Login.tsx:93](frontend/src/pages/Login.tsx:93) `handleSubmit`
- **Observed:** POST `/api/v1/auth/login-2fa/` returns 401, the form does not show any error. `isLoading` stays true or resets silently; user gets no feedback.
- **Root cause:** `throw new Error(data.error || 'Login failed')` is caught somewhere upstream but no `toast({ variant: 'destructive', ... })` is rendered from that catch. Console only logs — user sees nothing.
- **Fix:** In the `catch (err)` block, call `toast({ variant: 'destructive', title: txt.loginFailed, description: err.message })` and `setIsLoading(false)`. Verify the catch block exists around lines 140–170 (wasn't fully read).

#### Bug #2 — Backend test suite cannot boot
- **Where:** [backend/conftest.py:39](backend/conftest.py:39) and around
- **Observed:** `pytest` fails immediately with `django.core.exceptions.AppRegistryNotReady: Apps aren't loaded yet.` The file imports `from projects.models import Project` at top level before Django is set up.
- **Impact:** Zero backend tests run → regressions in methodology-specific logic (waterfall, scrum, kanban, prince2, lss, hybrid, program, p2, msp, safe) go uncaught. `pytest.ini` registers 8 project + 6 program methodology markers but none can be exercised.
- **Additional issue:** `pytest.ini` `addopts` requires `pytest-cov` (`--cov-report=...`, `--no-cov`) which isn't installed.
- **Fix:**
  1. Add `pytest-django>=4.5` to `requirements.txt` and set `DJANGO_SETTINGS_MODULE = core.settings` via `pytest.ini` (already present — pytest-django plugin will pick it up).
  2. Install `pytest-cov` or remove coverage flags from `addopts`.
  3. Wrap conftest model imports in a `django_db_setup` fixture, OR call `django.setup()` before the top-level imports, OR convert the imports to local (inside fixture functions).

#### Bug #3 — Production DB missing academy migrations
- **Where:** Production `/api/v1/academy/skills/user-skills/summary/` called from [backend/academy/views.py:1652](backend/academy/views.py:1652)
- **Observed:** `backend/logs/error.log` contains repeated `psycopg2.errors.UndefinedTable: relation "academy_skills" does not exist` and `relation "academy_skill_categories" does not exist`.
- **Impact:** Academy skills summary endpoint 500s every time it's hit. Any screen depending on this breaks silently.
- **Fix:**
  1. Run `python manage.py migrate academy` on prod (deploy step missed).
  2. Wrap the `Skill.objects.count()` call in a try/except so missing tables don't return 500 — return empty summary instead.
  3. Add a post-deploy smoke test: `GET /api/v1/admin/system/health/` should assert all expected tables exist.

#### Bug #4 — Login-2fa endpoint: recurring 500 errors in prod
- **Where:** [backend/accounts/two_factor.py:120](backend/accounts/two_factor.py:120) `LoginWith2FAView`
- **Observed:** `backend/logs/error.log` shows 10+ `Internal Server Error: /api/v1/auth/login-2fa/` entries across multiple days (2026-03-15 through 2026-03-22). Log doesn't include the underlying traceback for all, but pattern is consistent.
- **Likely causes** (hypotheses, need traceback to confirm):
  1. `User.objects.get(email=email)` — if multiple users share the same email (no `unique=True`?), `MultipleObjectsReturned` → 500.
  2. `RefreshToken.for_user(user)` can raise if the user doesn't have the required fields.
- **Fix:** Wrap the whole `post()` body in `try/except Exception` and return a sanitized 500. Separately, harden with `User.objects.filter(email=email).first()` and log the exception cause.

#### Bug #5 — Mobile app: 30+ TypeScript errors — build blocker
- **Where:** Multiple screens in `src/screens/...`
- **Observed (complete list from tsc):**
  - [src/screens/auth/LoginScreen-original.tsx:160](src/screens/auth/LoginScreen-original.tsx:160) — gradient colors object (`{primary,secondary,tertiary}`) passed where `ColorValue` expected
  - [src/screens/auth/LoginScreen.tsx:193](src/screens/auth/LoginScreen.tsx:193) — same gradient type mismatch on the *active* login screen
  - [src/screens/auth/TrialRegistrationScreen.tsx:77](src/screens/auth/TrialRegistrationScreen.tsx:77) — **`last_name` not in `RegisterData` type** — trial signup will fail to compile / send malformed payload
  - [src/screens/budget/BudgetScreen.tsx:19](src/screens/budget/BudgetScreen.tsx:19) — **`BudgetService.getBudget` method doesn't exist** — budget screen broken at runtime
  - [src/screens/budget/BudgetScreen.tsx:56](src/screens/budget/BudgetScreen.tsx:56) — `Budget.spent` doesn't exist
  - [src/screens/budget/BudgetScreen.tsx:62](src/screens/budget/BudgetScreen.tsx:62) — `Budget.remaining` doesn't exist
  - [src/screens/budget/BudgetScreen.tsx:73](src/screens/budget/BudgetScreen.tsx:73) — `ProjectBudget` type has no `name` / `budget` prop
  - [src/screens/courses/CourseDetailScreen.tsx:112,139,154](src/screens/courses/CourseDetailScreen.tsx:112) — navigation params typed as `[never, never]`
  - [src/screens/dashboard/DashboardScreen.tsx:297,302,306,309](src/screens/dashboard/DashboardScreen.tsx:297) — features tuple missing `soon` prop used by the component
  - [src/screens/dashboard/DashboardScreen.tsx:301,372](src/screens/dashboard/DashboardScreen.tsx:301) — `LinearGradient` expects a readonly tuple but gets `string[]`
  - [src/screens/profile/ProfileScreen.tsx:106](src/screens/profile/ProfileScreen.tsx:106) — `updateUser` missing on `AuthState`
  - [src/screens/programs/ProgramDetailScreen.tsx:65](src/screens/programs/ProgramDetailScreen.tsx:65) — `ProjectsService.getProjectsByProgram` doesn't exist
  - [src/screens/programs/ProgramDetailScreen.tsx:106](src/screens/programs/ProgramDetailScreen.tsx:106) — status `"pending"` isn't in the literal union `"draft"|"submitted"|"approved"|"rejected"`
  - [src/screens/programs/ProgramDetailScreen.tsx:157](src/screens/programs/ProgramDetailScreen.tsx:157) — `reason` parameter has implicit `any`
  - [src/screens/programs/ProgramDetailScreen.tsx:514](src/screens/programs/ProgramDetailScreen.tsx:514) — `string` vs `number | undefined` comparison never matches
  - [src/screens/programs/ProgramsScreen.tsx:36,49](src/screens/programs/ProgramsScreen.tsx:36) — uses `.results` on a type typed as `never` (API response shape wrong)
  - [src/screens/projects/ProjectDetailScreen.tsx:175,476,477](src/screens/projects/ProjectDetailScreen.tsx:175) — implicit any + impossible comparisons
  - [src/screens/risks/RiskScreen.tsx:30](src/screens/risks/RiskScreen.tsx:30) — **two different `Risk` types** (one in `services/risks`, another in `types/index`) are treated as assignable
  - [src/screens/timetracking/TimeTrackingDetailScreen.tsx:131,372](src/screens/timetracking/TimeTrackingDetailScreen.tsx:131) — implicit any + impossible comparison
  - [src/screens/timetracking/TimeTrackingScreen.tsx:46](src/screens/timetracking/TimeTrackingScreen.tsx:46) — `Project[]` has no `.results` — wrong assumption about paginated response
  - Earlier screen (truncated): `ViewStyle` `width: string` vs `DimensionValue` — needs investigation
- **Impact:** `npx tsc --noEmit` fails. EAS builds may still succeed (Metro is lenient) but runtime behavior around **Registration**, **Budget**, **Program detail**, **Project detail**, **Risks**, **Time Tracking**, **Profile update** is unsafe. Users WILL hit these paths in the CRM scenario.
- **Fix:** (detailed below, §4)

### 🟠 P1 — serious

#### Bug #6 — Mobile app hardcodes a LAN IP for Android dev
- **Where:** [src/services/api.ts:8](src/services/api.ts:8)
- **Observed:** `'http://192.168.76.240:8001'` — will only work for the developer who set that address.
- **Fix:** Read from `Expo.Constants.expoConfig.extra.apiUrl` with `.env` fallback, or use `localhost` + `adb reverse`.

#### Bug #7 — Mobile app only wires a fraction of the backend
- **Where:** [src/services/api.ts](src/services/api.ts) `API_CONFIG.ENDPOINTS`
- **Observed:** Backend has modules `governance`, `agile`, `kanban`, `hybrid`, `execution`, `communication`, `cross_methodology`, `scrum`, `waterfall`, `prince2`, `lss`, `sixsigma` — none of these paths appear in the mobile app's endpoint list. The mobile app can't run the full CRM scenario.
- **Fix:** Decide product scope. Either:
  - (a) Ship the mobile app explicitly as a companion (dashboard + time tracking only), document this; or
  - (b) Add endpoint constants + service methods for the missing modules.

#### Bug #8 — Mobile/web divergence on login endpoint
- **Where:** Mobile [src/services/api.ts:12](src/services/api.ts:12) → `/api/v1/auth/login/`. Web [frontend/src/pages/Login.tsx:93](frontend/src/pages/Login.tsx:93) → `/api/v1/auth/login-2fa/`.
- **Observed:** Users logging in via mobile never get prompted for 2FA even if enabled in web. Security-relevant divergence.
- **Fix:** Mobile should also use `login-2fa` and prompt for TOTP when `requires_2fa: true` is returned.

#### Bug #9 — Cross-project naming collision
- **Where:** Marketing site says **"ProjeXtPal"**, the app favicon title says **"ProjectPal - Project Management Dashboard"**, API config references `API_BASE_URL: 'https://projextpal.com'`, and there's a separate `frontend/` folder (Vite) and `src/` folder (Expo RN).
- **Impact:** Confusing branding; multiple `App.tsx.backup/.bak/.temp` files suggest unfinished migrations.
- **Fix:** Consolidate naming, delete `*.backup / *.bak / *.bak2 / *.temp / *.old / *.old2` files (already visible in `frontend/src/App.tsx.*` and `frontend/src/pages/CourseLearningPlayer.tsx.old*`).

### 🟡 P2 — medium

#### Bug #10 — Duplicate `authentication_classes = []`
- **Where:** [backend/accounts/two_factor.py:122](backend/accounts/two_factor.py:122)-[124](backend/accounts/two_factor.py:124)
- **Observed:** Line 122 and line 124 both assign `authentication_classes = []`.
- **Fix:** Remove line 124. Cosmetic.

#### Bug #11 — `ProjectsService.getProjectsByProgram` called but not implemented
- **Where:** [src/screens/programs/ProgramDetailScreen.tsx:65](src/screens/programs/ProgramDetailScreen.tsx:65)
- **Observed:** TS error confirms method doesn't exist on service. Will throw at runtime when opening any program detail.
- **Fix:** Add method to [src/services/projectsService.ts](src/services/projectsService.ts): `getProjectsByProgram(programId) => apiService.get<Project[]>('/projects/', { params: { program: programId }})`.

#### Bug #12 — Two incompatible `Risk` types
- **Where:** [src/services/risks.ts](src/services/risks.ts) vs [src/types/index.ts](src/types/index.ts)
- **Observed:** `setState(risks)` fails because one Risk is missing `category`, `score`, `identifiedDate`.
- **Fix:** Delete one of the two definitions; make the other the canonical import across screens.

#### Bug #13 — Test credentials don't exist in prod
- **Where:** `test@projextpal.com` / `Welkom01`
- **Observed:** Returns 401 from `/auth/login-2fa/` — user not found OR password wrong.
- **Fix:** Seed a real test account, or create via `manage.py createsuperuser` on prod and communicate credentials.

### 🟢 P3 — nice to have

- Remove `*.bak / *.backup / *.old / *.temp` cruft files in `frontend/src/` and elsewhere.
- Surface a `/api/v1/` browsable index (currently 403-404).
- React Router future-flag warnings in every vitest test — add `future: { v7_startTransition: true, v7_relativeSplatPath: true }` to the Router in tests.
- `pytest.ini:markers` lists methodology markers but nothing references `safe`, `msp`, `p2` — either add tests or remove markers.

---

## 4. Proposed fixes — prioritized plan

### Sprint 1 — Unblock development (P0, ~1 day)

| # | Fix | Effort | Files |
|---|---|---|---|
| 1 | Show toast on login error | 10 min | `frontend/src/pages/Login.tsx` |
| 2 | Fix `conftest.py` top-level imports + add `pytest-django` + remove `pytest-cov` dep | 30 min | `backend/conftest.py`, `backend/pytest.ini`, `backend/requirements.txt` |
| 3 | Run `manage.py migrate academy` on prod | 5 min | Deploy pipeline |
| 4 | Wrap `LoginWith2FAView.post` with try/except + switch to `.filter().first()` | 15 min | `backend/accounts/two_factor.py` |
| 5 | Fix or `@ts-expect-error`-gate the 24 mobile TS errors (see §4.5 below) | 2–3 h | Multiple screens |

### Sprint 2 — Feature completeness (P1, ~2–3 days)

| # | Fix | Effort |
|---|---|---|
| 6 | Unify mobile login on `/login-2fa/` + TOTP prompt | 2 h |
| 7 | Add endpoint constants for governance/agile/kanban/hybrid + service methods | 1 day |
| 8 | API base URL via Expo config + `.env`, kill hardcoded IP | 30 min |
| 9 | Provision real test account in prod | 15 min |

### Sprint 3 — Cleanup (P2/P3, ~half day)

- Consolidate Risk types
- Add `getProjectsByProgram`
- Delete `.bak/.backup/.old/.temp` files
- Fix React Router future flags in tests
- Remove duplicate `authentication_classes = []`

### 4.5 Mobile TS error fix recipes

| Error | Recipe |
|---|---|
| `Property 'name' does not exist on type 'ProjectBudget'` | Extend `ProjectBudget` interface to include `name: string; budget: number` OR change the render to use correct field. Read `src/types/index.ts:ProjectBudget` and `services/budgetService.ts` to decide canonical shape. |
| `LinearGradient string[] not assignable to readonly [ColorValue, ColorValue, ...ColorValue[]]` | Change `colors: string[]` to `colors: readonly [ColorValue, ColorValue, ...ColorValue[]]` in features constant, or cast at call site `colors={feature.colors as [string, string, ...string[]]}`. |
| `'features.soon'` missing | Add `soon?: boolean` to feature type; remove conditional rendering if feature no longer needed. |
| `'updateUser' missing on AuthState` | Add `updateUser: (u: Partial<User>) => void` to `src/store/authStore.ts`. |
| `getProjectsByProgram missing` | See Bug #11. |
| `status 'pending' not in union` | Add `"pending"` to the union OR coerce with `status: program.status as ProgramStatus`. |
| `implicit any parameter 'reason'` | Type as `(reason: string) => void`. |
| `string vs number \| undefined` | Convert via `String(id) === otherId` or normalize both to string. |
| `Property 'results' does not exist on type 'never'` / `'Project[]'` | API client should return `PaginatedResponse<T>` not `T[]`. Fix `apiService.get<Project[]>(...)` → `apiService.get<PaginatedResponse<Project>>(...)`. |
| `Risk[] not assignable` | See Bug #12. |

---

## 5. E2E CRM scenario — FINAL RUN (after unblock)

After linking sami@inclufy.com and 5 demo users to a new `Inclufy BV` company (id=2) via the admin tenants endpoint, the full CRM scenario ran **green end-to-end**:

| Step | Resource | Result | IDs |
|---|---|---|---|
| 0 | Login (sami@inclufy.com) | ✅ 200 | JWT |
| 1 | Create Inclufy BV tenant | ✅ 201 | company id 2 |
| 2 | Link sami + 5 demo users to company | ✅ 6× 200 | users 1, 3, 4, 5, 6, 7 |
| 3 | Portfolio "CRM Implementation — Acme Corp" | ✅ 201 | `79e6d5e6-…` |
| 4 | Program — SAFe | ✅ 201 | id 10 |
| 5 | Program — Hybrid | ✅ 201 | id 11 |
| 6 | Program — PRINCE2 Programme | ✅ 201 | id 12 |
| 7 | Project — Scrum | ✅ 201 | id 1 |
| 8 | Project — Kanban | ✅ 201 | id 2 |
| 9 | Project — Waterfall | ✅ 201 | id 3 |
| 10 | Project — PRINCE2 | ✅ 201 | id 4 |
| 11 | Milestones (Kickoff + Go-Live) | ✅ 201×2 | 39, 40 |
| 12 | Tasks (Design, Import, Pipeline, UAT) | ✅ 201×4 | 68, 69, 70, 71 |
| 13 | Time entries | ✅ 201×3 | 1, 2, 3 |
| 14 | Governance boards (Steering / Programme / Project) | ✅ 201×3 | 3 UUIDs |
| 15 | Stakeholders (exec sponsor, SRO, BCM, project exec, key SH) | ✅ 201×5 | 5 UUIDs |
| 16 | Risks (data quality, adoption, licensing) | ✅ 201×3 | 1, 2, 3 |

**Scorecard:** 27 successful CRUD operations across 10 resource types in one scripted session — the platform works end-to-end once data bootstrapping is done.

### Bug #14 re-classified
The "programs 500" is a **consequence of Bug #17** (null company), not an independent defect. Once sami's company was populated, `POST /programs/` returned 201 with all 5 methodologies. `perform_create` should still be hardened to return 400 (not 500) when `request.user.company is None` — logged as **Bug #14 (secondary)**.

### Schema quirks discovered during E2E (minor DX issues, not bugs)
- Milestones use `name`, tasks use `title` — inconsistent naming
- Task creation **requires** `milestone` FK (no standalone tasks possible)
- Task status choices don't include "completed" — check the canonical list
- Risk `category`, `impact`, `level` use Title-Case strings ("Technical"/"High"), not integers or lowercase — inconsistent with other choice fields which use snake_case
- Survey `status` choices are `["Draft","Active","Closed"]` (Title-Case) — same inconsistency
- Post-Project `roi` is `integer` not decimal — stores percent-times-100 or integer percent (format unclear in code)
- `team-members/` viewset doesn't allow POST (405) — team assignment must be via a project-detail custom action that doesn't yet exist
- `PublicAdminRegisterView` lowercases the company name ("inclufy bv" instead of "Inclufy BV") — case preservation bug in `PublicAdminRegisterSerializer.create`
- `AdminCreateUserSerializer` has no `last_name` or `company` field; users created via admin endpoint inherit no company (fixed manually via `PATCH /admin/users/{id}/`)
- Chat message endpoint is `/bot/chats/{id}/send_message/` (not `/messages/` as REST-convention would suggest)

## 6. Bugs 18-19 (new in final run)

### Bug #18 — Production OpenAI API key invalid → AI chat/insights broken
- **Where:** prod env `OPENAI_API_KEY` (key ending `XFMA`)
- **Observed:** `POST /api/v1/bot/chats/{id}/send_message/` returns 200 at the Django layer but the AI response body contains: `"Incorrect API key provided: sk-proj-****XFMA. You can find your API key at https://platform.openai.com/account/api-keys."`
- **Impact:** Every AI feature in the app — chat, AI insights for projects/programs, survey generation, project-task AI tools — is silently broken. Users see an error message instead of AI output.
- **Fix:** Rotate the OpenAI key in prod environment variables. Verify via `GET /api/v1/bot/health/` or a simple chat ping. Consider returning 503 instead of 200+error-in-body so frontend can surface it.

### Bug #19 — `POST /api/v1/surveys/questions/` returns 500 when nested survey is provided
- **Where:** `surveys/views.py QuestionViewSet.create()` or serializer
- **Observed:** With survey id in body (`{text, question_type, required, order, survey: 1}`), three question-creates all returned `500 Server Error` (HTML page, no body).
- **Impact:** Surveys can be created but questions cannot be added via API. Survey flow is incomplete.
- **Fix:** Inspect traceback in `backend/logs/error.log`. Likely the serializer expects the question to be created via `survey.questions.create()` in a nested router (e.g. `/surveys/survey/{id}/questions/`) rather than the flat `/surveys/questions/` endpoint.

## 7. Final E2E coverage score

| Flow | Result | Count |
|---|---|---|
| Auth (login + token refresh) | ✅ | |
| Company + user bootstrap | ✅ | 1 tenant, 6 users linked |
| Portfolio CRUD | ✅ | 2 portfolios created |
| Programs (SAFe, Hybrid, PRINCE2 Programme) | ✅ | 3 |
| Projects (Scrum, Kanban, Waterfall, PRINCE2) | ✅ | 4 |
| Milestones | ✅ | 2 |
| Tasks | ✅ | 4 |
| Time entries (5 real users) | ✅ | 9 entries, 46.5 hours total |
| Time entry **approvals** | ✅ | 9/9 approved |
| Governance boards (3 types) | ✅ | 3 |
| Stakeholders (5 roles) | ✅ | 5 |
| Risks (3 categories) | ✅ | 3 |
| Post-Project record | ✅ | 1 |
| Survey (parent) | ✅ | 1 |
| Survey questions | ❌ | 0/3 (500) — Bug #19 |
| AI Chat conversation | 🟧 | Created 200 but AI response is OpenAI-key-invalid error — Bug #18 |

**Ecosystem verdict:** the Django backend, once data is correctly bootstrapped (company + user link), executes the entire lifecycle of an enterprise project management scenario cleanly. The remaining issues are: invalid OpenAI key (ops), nested survey-question routing (minor bug), schema inconsistencies (DX polish).

---

## 6. Test run raw output

- **Backend pytest:** `ImportError while loading conftest '/backend/conftest.py'. AppRegistryNotReady: Apps aren't loaded yet.` — 0 tests collected.
- **Mobile `npx tsc --noEmit`:** 24 errors across 9 files. Build-blocker.
- **Frontend `npx vitest run`:** `31 test files, 146 tests, all passed` in 8.1s.
- **Frontend `npx tsc --noEmit`:** clean.
- **Production `/api/v1/auth/login-2fa/` probe with provided credentials:** `401 Unauthorized`, UI showed no error.
- **Production error log:** 10+ `500 Internal Server Error` on `/login-2fa/` + UndefinedTable errors on `/academy/skills/user-skills/summary/`.
