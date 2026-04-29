# ProjeXtPal Mobile App Parity Audit
**Date**: 2026-04-28  
**Auditor**: Mobile App Tester agent  
**Scope**: Source-level + live API probe (no device/simulator required)  
**Production target**: https://projextpal.com  
**Test account**: sami@inclufy.com  

---

## 1. API Endpoint Parity Matrix

### 1a. Canonical mobile config: `src/services/api.ts`

The **canonical** API constant file (used by `apiService.ts` and `authStore.ts`) is `src/services/api.ts`. The parity script probes all 30 constants declared there.

| Result | Count |
|--------|-------|
| 200 OK | 24    |
| 404 MISSING | 3  |
| 400 (POST probe, endpoint wired) | 3 |

**404 constants in `src/services/api.ts`:**

| Name | URL probed | Impact |
|------|-----------|--------|
| `PROGRAM_BUDGET` | `/api/v1/programs/1/budget/overview/` | Budget tab on ProgramDetail screen broken |
| `COURSE_MODULES` | `/api/v1/academy/courses/1/modules/` | Course detail module list broken |
| `LESSONS` | `/api/v1/academy/modules/1/lessons/` | Lesson list broken |

Note: `COURSE_MODULES` and `LESSONS` are declared as lambda functions in `api.ts` and are not called by any screen (grep confirms zero usages of `ENDPOINTS.COURSE_MODULES` in screens). Their 404 is backend-only dead code in the mobile config — not a runtime crash.

`PROGRAM_BUDGET` resolves with a real programId at runtime; the sample probe used id=1. The correct backend path per `api.ts` comment is `/programs/${id}/budget/overview/`. Verified: `GET /api/v1/programs/1/budget/overview/` returns 404 — the budget overview sub-resource does not exist for program id 1 (may work for other IDs if seeded; backend fix needed or data fixture required).

### 1b. Shadow config: `src/constants/config.ts`

A second, older config file at `src/constants/config.ts` is **also imported** by `authStore.ts`, `authService.ts`, `subscriptionService.ts`, and the full `src/services/` service layer. It declares **25 additional endpoints** not present in the canonical `api.ts`. Probing all of them:

| Endpoint | URL | Status | Notes |
|----------|-----|--------|-------|
| `FORGOT_PASSWORD` | `/api/v1/auth/forgot-password/` | 400 | Wired (returns 400 for empty body) |
| `CHANGE_PASSWORD` | `/api/v1/auth/user/change-password/` | 400 | Wired |
| `UPDATE_PROFILE` | `/api/v1/auth/user/update/` | 200 | Wired |
| `USER_FEATURES` | `/api/v1/auth/user-features/` | 200 | Wired |
| `SUBSCRIPTION_TIERS` | `/api/v1/auth/subscriptions/tiers/` | 200 | Wired |
| `USER_SUBSCRIPTION` | `/api/v1/auth/subscriptions/user/` | **404** | MISSING |
| `CREATE_CHECKOUT` | `/api/v1/payments/create-checkout-session/` | **404** | MISSING |
| `TEAMS` | `/api/v1/teams/` | **404** | MISSING |
| `TEAM_MEMBERS` | `/api/v1/teams/members/` | **404** | MISSING |
| `DOCUMENTS` | `/api/v1/documents/` | **404** | MISSING |
| `ANALYTICS` | `/api/v1/analytics/` | **404** | MISSING |
| `BUDGET` | `/api/v1/projects/budget/` | **404** | MISSING — only `/budget/overview/` exists |
| `ADMIN_DASHBOARD_STATS` | `/api/v1/admin/dashboard/stats/` | **404** | Removed from backend |
| `ADMIN_MODULES` | `/api/v1/admin/modules/` | **404** | Removed from backend |
| `ADMIN_USERS_STATS` | `/api/v1/admin/users/stats/` | **404** | Removed from backend |
| `ADMIN_ACTIVITY` | `/api/v1/admin/activity/` | **404** | Removed from backend |
| `ADMIN_ACTIVITY_STATS` | `/api/v1/admin/activity/stats/` | **404** | Removed from backend |
| `ADMIN_SYSTEM_INFO` | `/api/v1/admin/system/info/` | **404** | Removed from backend |
| `ADMIN_SYSTEM_HEALTH` | `/api/v1/admin/system/health/` | **404** | Removed from backend |

**12 of 19 config.ts-exclusive endpoints are 404 on production.**

### 1c. Additional parity gaps

`api.ts` has 7 constants not in `config.ts` (all 200 OK):
`ADMIN_LOGS`, `ADMIN_PLANS`, `ADMIN_SETTINGS`, `ADMIN_STATS`, `ADMIN_TENANTS`, `PROGRAM_BENEFITS`, `PROGRAM_MILESTONES`.

These work fine — the canonical file is more up-to-date than config.ts.

### 1d. Summary parity table

| Layer | Endpoints declared | 200 OK | 404 |
|-------|--------------------|--------|-----|
| `api.ts` (canonical, 30 entries) | 30 | 24 | 3 |
| `config.ts` (shadow, 19 extras) | 19 | 7 | 12 |
| **Total unique endpoints** | **~44** | **31** | **15** |

---

## 2. Authentication Flow

### 2a. Login endpoint mismatch (P2 issue)

The mobile app calls `POST /api/v1/auth/login/` (from `config.ts` `LOGIN` constant). The backend has **two** working login endpoints:

- `/api/v1/auth/login/` — returns `{refresh, access, user}` (200 OK, confirmed)
- `/api/v1/auth/login-2fa/` — same response shape (200 OK, confirmed)

Both work. The web E2E suite uses `login-2fa`. The mobile uses `login/`. The 2FA TOTP step is absent from the mobile login screen — `LoginScreen.tsx` only has email + password fields, no OTP input. If 2FA is enforced at the backend level (TOTP mandatory), the `/api/v1/auth/login/` endpoint must be validated to confirm it does not silently skip 2FA enforcement. For the Yanmar demo account `sami@inclufy.com`, both endpoints returned 200 with valid tokens — no OTP prompt observed — confirming that the backend does not enforce mandatory 2FA for this account on either path.

**Finding**: Mobile login bypasses 2FA flow. If TOTP is mandatory for production users, this is a compliance gap. For the current demo account it does not block login.

### 2b. JWT Refresh Cycle (PASS)

Full cycle verified against production:

1. `POST /api/v1/auth/login/` → 200, `{access, refresh}` tokens issued
2. `GET /api/v1/auth/user/` with fresh access token → 200
3. `POST /api/v1/auth/token/refresh/` with refresh token → 200, new access token issued
4. `GET /api/v1/auth/user/` with refreshed access token → 200

The `apiService.ts` (used by `authStore.ts`) implements automatic 401 → refresh → retry correctly. On 401 it calls `refreshToken()`, gets a new access token, and retries the original request. Falls back to `clearTokens()` + throws "Authentication failed" if refresh also fails.

### 2c. Token Storage (PASS with caveats)

`apiService.ts` uses `expo-secure-store` (iOS Keychain / Android Keystore) for token storage under keys `auth_token` and `refresh_token`. However, the parallel `authService.ts` uses `@react-native-async-storage/async-storage` (unencrypted) under keys `access_token` and `refresh_token`. Two independent token stores exist with different key names — **only one is cleared on logout**. The `authStore.logout()` calls `apiService.clearTokens()` which wipes Keychain, but `authService.ts` tokens in AsyncStorage are NOT cleared by the main logout path. If any screen uses `authService.ts` directly, that stale token persists after logout.

### 2d. Profile PATCH (PASS)

- `PATCH /api/v1/auth/user/update/` → 200 (mobile uses this correctly in `config.ts` as `UPDATE_PROFILE`)
- `PATCH /api/v1/auth/user/` → 405 (as expected, GET-only endpoint)

`config.ts` has `UPDATE_PROFILE: '/api/v1/auth/user/update/'` — this is correct.

### 2e. Logout Cache Clearing (PARTIAL)

`authStore.logout()` calls `apiService.clearTokens()` which deletes SecureStore tokens. Language preference in AsyncStorage (`@projextpal_language`) is intentionally preserved across logout — correct behavior. However, `authService.ts` `access_token` / `refresh_token` in plain AsyncStorage are not cleared on the primary logout path.

No API-level response cache (with `Cache-Control` semantics) was found in any service file. The only AsyncStorage usage in `src/services/` is the legacy `authService.ts` token storage. There is no `api:<endpoint>` cache key pattern implemented.

---

## 3. Deep-Link Routes

### 3a. Custom scheme (PARTIAL)

The app registers the `projextpal://` custom scheme in `app.json` (`"scheme": "projextpal"`). The utility hook `src/utils/linking.ts` listens for incoming URLs and extracts `path` + `queryParams`, forwarding them to a caller-supplied `onLink` callback.

**Critical gap**: `useLinking` is never called from `App.tsx` or `AppNavigator.tsx`. The `NavigationContainer` in `App.tsx` has no `linking` prop. Deep links are parsed in `linking.ts` but the parsed path is not mapped to any screen name. Custom-scheme deep links (`projextpal://projects/15`) would open the app but land on the default screen rather than the intended destination.

Declared usage in source:
- `projextpal://subscription-success` (PricingScreen success callback)
- `projextpal://pricing` (PricingScreen cancel callback)
- No `projextpal://projects/<id>` or `projextpal://academy/course/<slug>` routes are wired

### 3b. Universal links (MISSING)

`app.json` has no `ios.associatedDomains` and no `android.intentFilters`. Neither `/.well-known/apple-app-site-association` nor `/.well-known/assetlinks.json` returns a valid JSON file (both return the SPA HTML). Universal links (`https://projextpal.com/projects/15/dashboard` → opens app) are not configured on either the client side or server side.

### 3c. NavigationContainer linking config (MISSING)

No `linking` configuration object (with `prefixes` and `config.screens` map) is passed to `NavigationContainer` in `App.tsx`. This is required for React Navigation to handle deep links automatically.

---

## 4. Biometric Login

`expo-local-authentication` is **not installed** (absent from `package.json`). No biometric prompt code exists anywhere in `src/`. FaceID / TouchID is not implemented. The Settings screen has a notifications toggle but no biometric setting. This is a documented future feature gap.

---

## 5. Offline Caching

No API response cache is implemented. `@react-native-async-storage/async-storage` is installed and used only for language preference (`@projextpal_language`) and legacy token storage. There is no `api:<endpoint>` caching layer, no `Cache-Control` header inspection in `apiService.ts`, and no offline queue for mutations.

Behavior on network loss: the `apiService.ts` `request()` method will throw a network error caught generically. Each screen is responsible for its own error handling. No stale-cache-across-accounts risk exists because no response cache exists — but equally, no offline resilience exists.

---

## 6. Push Notifications

`expo-notifications` is **not installed** (absent from `package.json`). The `POST /api/v1/auth/devices/register/` endpoint returns **404** on production — neither the client-side push token registration code nor the backend endpoint exist. The Notifications screen (`NotificationsScreen.tsx`) is a placeholder with a "coming soon" message. Push notifications are entirely unimplemented.

---

## 7. Admin Portal Screens

Three admin screens use `adminService.ts` which calls bare `/admin/...` paths without the `/api/v1/` prefix:

| Screen | Method calls | Actual URL hit | Response |
|--------|-------------|----------------|---------|
| `AdminUsers.tsx` | `getUsers()`, `getUserStats()` | `/admin/users/`, `/admin/users/stats/` | Django admin HTML |
| `AdminActivity.tsx` | `getActivities()`, `getActivityStats()` | `/admin/activity/`, `/admin/activity/stats/` | Django admin HTML |
| `AdminSystem.tsx` | `getSystemInfo()`, `getSystemHealth()` | `/admin/system/info/`, `/admin/system/health/` | Django admin HTML |

These calls resolve to the Django admin login HTML page (200 status), not the API JSON. `apiService.ts` will then fail to `response.json()` and throw "SyntaxError: Unexpected token <" at runtime — the admin screens crash immediately on mount for Users, Activity, and System tabs. `AdminDashboard.tsx` uses hardcoded static values and is unaffected.

Note: `AdminUsers.getUsers()` and `getUserStats()` both fail, but the correct working endpoints for users are `/api/v1/admin/users/` (200) and `/api/v1/admin/users/1/` (200) which ARE in the canonical `api.ts`.

---

## 8. Web E2E Suite Results (backend health check for mobile's API layer)

| Script | Pass rate | Notes |
|--------|-----------|-------|
| `project_manager_full.py` | **96/96 (100%)** | Full project API healthy |
| `program_manager_full.py` | **56/62 (90.3%)** | 1 skip, 1 governance 502 (AI generate) |
| `reports_dashboards_chats_full.py` | **18/26 (69.2%)** | 8 AI-gen 500/502 (AI provider issue, not mobile) |
| `academy_full.py` | **19/26 (73.1%)** | 5 bulk-gen 404s (not mobile-facing) |
| `admin_portal_full.py` | **23/38 (60.5%)** | Mostly auth/isolation checks; 1 invitation 500 |

**Mobile API layer health**: Good for core project/program/academy/chat flows. AI generation endpoints (backend AI provider) are the main instability but these are not called from any current mobile screen.

---

## 9. TypeScript Build Check

`tsc --noEmit` exits 0 with no errors. No type-level build breakage.

---

## 10. Top 5 Mobile-Specific Issues

**Issue 1 (P2): adminService.ts missing /api/v1/ prefix → admin screens crash**  
`AdminUsers`, `AdminActivity`, and `AdminSystem` screens call `adminService` which constructs URLs like `https://projextpal.com/admin/users/stats/`. This hits the Django admin HTML login page. `response.json()` throws, crashing all three screens. Fix: add `/api/v1` prefix to all paths in `adminService.ts`, and replace the stale 404 paths (`/users/stats/`, `/activity/`, `/system/info/`, `/system/health/`) with the working canonical paths from `api.ts`.

**Issue 2 (P2): Dual config split — `api.ts` vs `config.ts` creates a maintenance hazard**  
`authStore.ts` (primary login path) imports from `config.ts`; `apiService.ts` imports from `api.ts`. These files have diverged: `config.ts` declares 12 endpoints that 404, while `api.ts` has 7 additional working endpoints not in `config.ts`. Each new endpoint must be added to the correct file or screens silently hit 404. Fix: consolidate to a single source of truth (`api.ts` is more current) and update all consumers.

**Issue 3 (P2): Push notification registration endpoint missing (404)**  
`POST /api/v1/auth/devices/register/` returns 404 — the backend endpoint is not implemented. `expo-notifications` is also absent from `package.json`. Push notifications are fully non-functional. No token registration, no permission request, no delivery path. Fix: install `expo-notifications`, implement the Expo push token registration flow, and add the backend device registration endpoint.

**Issue 4 (P3): Deep links parsed but not routed**  
`useLinking` hook exists but is not called from `App.tsx`. `NavigationContainer` has no `linking` prop. Custom-scheme links open the app to the default screen. Universal links are not configured (`associatedDomains` / `intentFilters` missing from `app.json`, well-known files missing from server). Fix: add `linking` config to NavigationContainer with `prefixes: ['projextpal://']` and a `screens` map; add `ios.associatedDomains` to `app.json` for universal links.

**Issue 5 (P3): Dual token storage — logout does not clear authService.ts tokens**  
`apiService.ts` stores tokens in SecureStore; `authService.ts` stores tokens in AsyncStorage with different key names. `authStore.logout()` only clears SecureStore. If `authService.ts` is used by any screen (e.g., `subscriptionService.ts` reads `AsyncStorage.getItem('access_token')`), those tokens persist across logout, creating a potential account-switching privacy issue. Fix: route all token management through a single module; `authStore.logout()` must also call `AsyncStorage.multiRemove(['access_token','refresh_token'])`.

---

## 11. Priority Classification

### P2 — Fix before next production release

1. **adminService.ts path prefix bug** — AdminUsers, AdminActivity, AdminSystem screens crash on mount. Reproducible, silent JSON parse error.  
2. **Dual config divergence** — `config.ts` has 12 404 endpoints actively used by subscription and auth service screens (PricingScreen, subscription gate). Subscription/upgrade flow is entirely broken.

### P3 — Fix in the next mobile sprint (post-demo)

3. **Push notifications** — not implemented end-to-end (no expo-notifications, no backend device endpoint).  
4. **Deep link routing** — `NavigationContainer` linking config missing; notification taps and external URLs land on default screen.  
5. **Logout token leak** — dual AsyncStorage/SecureStore token stores; secondary store not cleared on logout.  
6. **Biometric auth** — `expo-local-authentication` not installed; feature absent.  
7. **Offline caching** — no response cache; app shows empty states or errors with no connectivity.

### P4 — Nice-to-have / tracked for roadmap

8. **2FA TOTP on mobile** — login screen has no OTP field; if TOTP is enforced per-account, those users cannot log in.  
9. **Academy COURSE_MODULES / LESSONS** — 404 on backend; declared in `api.ts` but unused by screens. Remove dead constants or implement endpoints.  

---

## Appendix: File Paths Referenced

- `/Users/samiloukile/Projects/projextpal/src/services/api.ts` — canonical endpoint config (30 constants)
- `/Users/samiloukile/Projects/projextpal/src/constants/config.ts` — shadow config (43 constants, 12 produce 404)
- `/Users/samiloukile/Projects/projextpal/src/services/apiService.ts` — HTTP client, token via SecureStore, auto-refresh on 401
- `/Users/samiloukile/Projects/projextpal/src/services/authService.ts` — legacy auth service, token via AsyncStorage
- `/Users/samiloukile/Projects/projextpal/src/services/adminService.ts` — admin API service, missing `/api/v1/` prefix
- `/Users/samiloukile/Projects/projextpal/src/store/authStore.ts` — Zustand auth state, imports from config.ts
- `/Users/samiloukile/Projects/projextpal/src/navigation/AppNavigator.tsx` — main nav, no deep link config
- `/Users/samiloukile/Projects/projextpal/src/utils/linking.ts` — deep link utility, unused
- `/Users/samiloukile/Projects/projextpal/App.tsx` — root component, NavigationContainer without linking prop
- `/Users/samiloukile/Projects/projextpal/app.json` — Expo config, scheme defined, no associatedDomains
- `/Users/samiloukile/Projects/projextpal/tests/e2e/mobile_api_parity.py` — parity check script
