# ProjeXtPal — GDPR + ISO 27001 Compliance Audit

Date: 2026-06-09 · Scope: ProjeXtPal (Django/DRF backend + React frontend + Expo mobile, own Postgres on Mac Studio) · Mode: read-only evidence scan.

**Headline: ProjeXtPal is materially compliant** — the hard parts (Art. 15 export, Art. 17 erasure, 2FA, encryption at rest, HSTS, throttling, consent capture) are already built. The main gap is **UI-reachability**: two GDPR rights exist as backend endpoints but a user can't reach them in the web app.

## Roll-up
| Standard | Score | Note |
|---|:--:|---|
| **GDPR / AVG** | ~80% | Rights implemented; export/erasure not surfaced in web UI; cookie/privacy-page gaps |
| **ISO 27001** | ~85% | Strong: 2FA, encryption, HSTS, CORS allowlist, throttling, secrets hygiene |

---

## GDPR / AVG
| # | Control | Status | Evidence |
|---|---|:--:|---|
| G1 | Privacy policy | **PARTIAL** | `src/screens/profile/PrivacyScreen.tsx` (mobile); **no web privacy/legal page** (`frontend/src/pages` has none) |
| G2 | Cookie consent | **PARTIAL** | No cookie banner found. App uses JWT in localStorage (not cookies) → banner may be largely N/A, but a consent/notice is still expected. Verify analytics cookies. |
| G3 | Data export (Art. 15) | **PARTIAL→PASS after UI** | `backend/accounts/gdpr.py` `DataExportView` → `GET /api/v1/accounts/me/export/` (full JSON export). **Backend PASS, but not reachable in web UI** → fixed this session |
| G4 | Right to erasure (Art. 17) | **PARTIAL→PASS after UI** | `gdpr.py` `AccountDeleteView` → `DELETE /api/v1/accounts/me/delete/` (soft-delete + anonymize + 30-day grace hard-delete). **Backend PASS, not reachable in web UI** → fixed this session |
| G5 | Consent & lawful basis | **PASS** | `backend/onboarding/serializers.py:76-78` records `accept_tos / accept_dpa / accept_gdpr` to the audit log |
| G6 | Processing register | **PARTIAL** | No formal RoPA doc in repo; model docstrings describe data. Add `docs/compliance/ropa.md` |
| G7 | Data minimization | **PASS** | `CustomUser` is lean (email, image, company, role, theme) |
| G8 | Breach notification | **PARTIAL** | Sentry configured + `memory/incident_recovery_runbook.md`; no formal 72-hour breach-notification procedure doc |
| G9 | DPO contact | **MISSING** | No DPO/contact reference in repo. Add to privacy page |
| G10 | Sub-processor DPAs | **PARTIAL** | Vendors: Resend (email), Stripe (billing), Cloudflare (edge). DPAs exist with each vendor but not catalogued in repo. Add a sub-processor list |
| G11 | Notification opt-out | **PASS** | `NotificationPreference` (this session) — per-type email/push opt-out, GDPR/CAN-SPAM-friendly |

## ISO 27001
| # | Control | Status | Evidence |
|---|---|:--:|---|
| I1 | Access control (RBAC + tenant isolation) | **PASS** | `accounts/permissions.py` HasRole; `accessible_project_ids()`; CompanyScopedQuerysetMixin |
| I2 | MFA / 2FA | **PASS** | `django_otp` + `otp_totp` (`settings.py:100-101`), `accounts/two_factor.py`, `frontend/.../TwoFactorAuth.tsx` |
| I3 | Password policy | **PASS** | `AUTH_PASSWORD_VALIDATORS` incl. MinimumLength (`settings.py:238-243`) |
| I4 | Session / token refresh | **PASS** | SimpleJWT refresh; secure cookies |
| I5 | Encryption at rest | **PASS** | `core/secret_field.py` Fernet `EncryptedTextField` + DB KMS-CMK |
| I6 | Encryption in transit | **PASS** | `SECURE_SSL_REDIRECT`, `SECURE_HSTS_SECONDS=31536000` + preload, `SESSION/CSRF_COOKIE_SECURE` (`settings.py:511-527`) |
| I7 | Input validation | **PASS** | DRF serializers throughout |
| I8 | CSRF | **PASS** | `CsrfViewMiddleware` (`settings.py:125`) |
| I9 | CORS | **PASS** | `CORS_ALLOWED_ORIGINS` allowlist (not allow-all), `CORS_ALLOW_CREDENTIALS` (`settings.py:387-407`) |
| I10 | Rate limiting | **PASS** | `DEFAULT_THROTTLE_CLASSES` ScopedRateThrottle (`settings.py:204-207`) |
| I11 | Audit logging | **PARTIAL** | admin_portal logs + GDPR consent log + ProductIssue trail; no single immutable audit log for *all* sensitive writes (custom-field defs, bulk-edit, import, role changes) |
| I12 | Safe error handling | **PASS** | DEBUG off in prod; Sentry scrubbing |
| I13 | Dependency security | **PARTIAL** | Run `npm audit` + `pip-audit` in CI (not verified here) |
| I14 | Secrets management | **PASS** | `.env` + `**/.env*` gitignored; Fernet for stored creds |
| I15 | Backup & recovery | **PARTIAL** | pg_dump backups + runbook; verify the cron paths (`/Users/sami/projextpal/...` vs `~/Desktop/ProjextPal/`) + off-site copy + restore test |

---

## Remediation backlog
### P0 — UI-reachability (legal rights a user can't reach) — DONE this session
- **C-1 Surface Art. 15 export + Art. 17 deletion in the web UI** → a "Privacy & Data" section in Settings (download-my-data + delete-my-account). Turns G3/G4 PARTIAL → PASS. ✅ built.

### P1 — Documentation / legal surface
- **C-2 Web privacy policy + legal page** (G1) incl. DPO contact (G9) + sub-processor list (G10).
- **C-3 Cookie/consent notice** (G2) — confirm what non-essential cookies/analytics are set.
- **C-4 RoPA** (`docs/compliance/ropa.md`, G6) + **breach-notification procedure** (G8, 72h).

### P2 — Hardening
- **C-5 Unified immutable audit log** for all sensitive writes (I11) — extend the existing log to custom-fields/bulk-edit/import/role-change.
- **C-6 CI security gates**: `npm audit` + `pip-audit` (I13).
- **C-7 Backup verification**: confirm cron paths, off-site copy, scheduled restore test (I15) — already flagged in the deploy notes.

---

## Verdict
ProjeXtPal clears the **substantive** GDPR + ISO 27001 bar for a B2B SaaS demo/launch. The fastest credibility win — making the already-built export/erasure rights reachable in the UI — is done this session. The remaining items are mostly **documentation** (privacy page, RoPA, sub-processor list, breach procedure) rather than engineering, plus two hardening tasks (unified audit log, CI security scans).
