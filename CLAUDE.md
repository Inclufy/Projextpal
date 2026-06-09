# ProjeXtPal — CLAUDE.md

**This file is the canonical context for any AI agent working in this repo.** Read it before running deploy / docker / migration commands.

---

## 1. What this repo is

**ProjeXtPal** — project management SaaS. Part of the Inclufy ecosystem. This is a **single repo** containing 3 sub-apps:

| Path | Stack | Purpose |
|---|---|---|
| `backend/` | Django + DRF + Postgres + Redis | API server (`api.projextpal.com`) |
| `frontend/` | React + Vite | Web SPA (`projextpal.com`) |
| `src/` (⚠️ NOT `mobile/`) | Expo (React Native) | iOS + Android, on App Store |

**⚠️ Gotcha**: The mobile Expo source lives at the **repo root** under `src/`, NOT in a `mobile/` subfolder. The `mobile/` directory is empty/legacy. Don't waste time scanning `mobile/`. Mobile-specific configs: `app.json`, `eas.json`, `ci_post_clone.sh` at repo root. Mobile dependencies share `package.json` with the frontend.

**Production URL**: `https://projextpal.com` (front), `https://api.projextpal.com` (back-direct), `https://www.projextpal.com` (front alias).

Not Supabase-based. Has its own Postgres on Mac Studio.

---

## 2. Inclufy ecosystem map (sibling repos)

| Brand | Product | Repo path (MacBook) | Repo URL | Supabase |
|---|---|---|---|---|
| **AMOS** / Marketing mobile | Inclufy Marketing (mobile) | `~/Dropbox/Inclufy Marketing/Inclufy Marketing-main/` | `Inclufy/inclufy-marketing-mobile` | `mpxkugfqzmxydxnlxqoj` (shared) |
| **Marketing web** | Inclufy Marketing (web) | `~/Projects/inclufy-marketing-web/` | `Inclufy/inclufy-marketing-web` | `mpxkugfqzmxydxnlxqoj` (shared) |
| **Inclufy Finance** | AI ERP (web + mobile monorepo) | `~/Projects/inclufy-auto-finance-main/` | `Inclufy/inclufy-finance` | `nruqfegrngpzoigflexn` |
| **ProjeXtPal** *(this repo)* | Project mgmt (web + mobile + backend) | `~/Projects/projextpal/` | `Inclufy/projextpal` | n/a (own Postgres) |

**Naming pitfalls:**
- "AMOS" = Marketing **mobile** brand. Don't confuse with Marketing web (separate repo).
- "Finance" is a separate product from Marketing — never call AMOS "Finance" or vice versa.
- Marketing has 2 repos (mobile + web). Finance is a monorepo with `src/` (web) + `mobile/`.

---

## 3. ⚠️ Production deploy — CRITICAL gotcha

Production runs on **Mac Studio** (`sami@MacStudovanSami`), accessed via Cloudflare Tunnel (no public IP).

**Mac Studio canonical paths:**
- ✅ Working tree: `/Users/sami/Desktop/ProjextPal/` ← deploy commands run here
- ❌ Legacy stale tree: `/Users/sami/Projextpal/` ← do NOT touch

**There are TWO docker-compose files in this repo:**

| File | Container names | Use when |
|---|---|---|
| `docker-compose.production.yml` | `projextpal-*-prod` (✅ correct, with X) | **PRODUCTION** — backend builds, frontend pulls, all live data |
| `docker-compose.yml` | `projectpal-*` (typo, no X) | Dev / experimentation only — DO NOT use on Mac Studio |

**Always pass the production file explicitly:**

```bash
cd ~/Desktop/ProjextPal
docker compose -f docker-compose.production.yml build backend
docker compose -f docker-compose.production.yml up -d backend
docker compose -f docker-compose.production.yml pull frontend
docker compose -f docker-compose.production.yml up -d frontend
```

**Container names in production** (use these in `docker exec`, `docker logs`):
- `projextpal-backend-prod` (Django)
- `projextpal-frontend-prod` (React + nginx serving SPA)
- `projextpal-nginx-prod` (outer reverse proxy)
- `projextpal-postgres-prod` (Postgres 15)
- `projextpal-redis-prod` (Redis 7)

**Postgres credentials**: see `~/Desktop/ProjextPal/.env` on Mac Studio. Current standardized password: `projextpal_password_2024` (commit `63260ece`). User: `projextpal`. DB: `projextpal`.

**Image source**:
- Backend: built locally on Mac Studio (`docker build ./backend`). Tagged `registry.gitlab.com/inclufy/projextpal/backend:latest` but never pushed.
- Frontend: pulled from `ghcr.io/inclufy/projextpal-web:latest` (built by GitHub Actions on push to main/master).

---

## 4. Network topology

```
Browser → Cloudflare edge (TLS) → Cloudflare Tunnel (outbound from Mac Studio)
       → cloudflared daemon → routes by hostname:
           www.projextpal.com → localhost:8090 → projextpal-nginx-prod → frontend + backend
           projextpal.com     → localhost:8090 → same
           api.projextpal.com → localhost:8001 → projextpal-backend-prod (direct, bypass nginx)
```

Mac Studio has **no public IP**. Cloudflare Tunnel name: `projextpal`.

---

## 5. Email + notifications

- Email backend: **Resend** (REST API + DKIM/SPF/DMARC on `inclufy.com`).
- Resend API key for ProjeXtPal: `ProjextPal-Prod` (token prefix `re_asaJmY97...`). Stored in backend `.env`.
- Notification flow: Django `signals.py` in `backend/product_issues/` → Resend HTTP API → reporter + admin emails + AI-escalation to superadmin.
- Per-client suffix (Web/Mobile detection in email subjects): commit `52189d16`.
- Issue triage: scheduled task every 30 min (cron). See `backend/product_issues/management/commands/`.

---

## 6. Branch strategy

- **`master`** is the leading branch on origin.
- **`github/main`** is a parallel branch with PR-only history (PRs #8-#14).
- Don't try to unify them — they intentionally diverge.
- Deploy commands use `master` on Mac Studio.

### ⚠️ 6a. TWO remotes — push to BOTH or the deploy silently uses old code

The **MacBook** dev repo has two remotes:
- `origin` → **GitLab** (`git@gitlab.com:inclufy/projextpal.git`)
- `github` → **GitHub** (`https://github.com/Inclufy/Projextpal.git`)

The **Mac Studio** production tree pulls `master` from **GitHub** (`origin` there = GitHub). So a `git push origin master` from the MacBook (→ GitLab) is **invisible** to the Mac Studio — `git pull` there says "Already up to date" and `docker build` rebuilds the **old code** (migrations report "No migrations to apply", new routes 404).

**Rule: after committing ON THE LAPTOP (dev), push to BOTH:**
```bash
git push origin master && git push github master    # ← laptop only
```
Verify before deploy: `git ls-remote github master` must equal your local `git rev-parse HEAD`.

**The Mac Studio is the deploy target — it ONLY pulls, never pushes.** Running the
dual-push there gets a harmless `! [rejected] (fetch first)` because the laptop is
ahead; the fix is just `git pull origin master`. Never `git push` from Mac Studio.

### 6b. Backend/frontend have NO `build:` in compose — build the image manually

`docker compose build backend` does nothing (the service only has `image:`). On Mac Studio, rebuild the image yourself then force-recreate:
```bash
docker build --no-cache -t registry.gitlab.com/inclufy/projextpal/backend:latest ./backend
docker compose -f docker-compose.production.yml up -d --force-recreate backend
docker build -f frontend/Dockerfile.prod -t ghcr.io/inclufy/projextpal-web:latest ./frontend
docker compose -f docker-compose.production.yml up -d --force-recreate frontend
```

### 6c. `api.projextpal.com` 404 is an edge/tunnel quirk — not the app

The SPA calls `/api/v1` relative (→ `projextpal.com/api` → nginx → backend). Verify a route the way the app uses it: `curl -s -o /dev/null -w "%{http_code}\n" https://projextpal.com/api/v1/<route>` → **401** means the route is live. The `api.projextpal.com` direct host can 404 at the edge while Django serves it fine; don't trust it as a deploy check.

---

## 7. Mobile (iOS + Android)

- ProjeXtPal mobile is **on the App Store** (live).
- Apple Team ID, ASC App ID, EAS Build configs: see `mobile/eas.json` + `mobile/app.json`.
- Xcode Cloud workflow: `mobile/ci_post_clone.sh`.
- Deploy: use `mobile-deploy-engineer` agent for releases.

---

## 8. Agents + skills available for this repo

See `~/.claude/projects/-Users-samiloukile-Projects-projextpal/memory/agents_and_skills_reference.md` for the full menu. Quick picks:

- `production-readiness-validator` — pre-deploy 10-pillar Go/No-Go check
- `data-guardian` — MANDATORY backup before any DB-touching change
- `data-leak-hunter` — cross-tenant filter audit
- `regression-tester` — checks `tests/regression/known_issues.json`
- `mobile-deploy-engineer` — App Store / Play Store deploys
- `inclufy-ecosystem-orchestrator` — multi-repo git state survey (do not run multiple in parallel)

---

## 9. Deploy roadmap (pre-prod gate)

See `memory/deploy_roadmap.md` for the 6-stage agent sequence:

```
ecosystem-orchestrator → data-leak-hunter → production-readiness
  → data-guardian (BACKUP — mandatory gate)
  → regression-tester → deploy → issue-triage-validator → regression-tester
```

**`data-guardian` must run before any `docker compose down`, schema migration, or anything that could lose volume data.**

---

## 10. Incident recovery

See `memory/incident_recovery_runbook.md` for runbooks per outage type:
- Mac Studio off → Tailscale-based remote unlock
- Docker crashed
- Cloudflare Tunnel down
- Postgres corrupted → restore from `~/Desktop/ProjextPal/backups/`

**UptimeRobot** monitoring is NOT yet configured for ProjeXtPal (as of 2026-05-12). Set up at `https://app.uptimerobot.com` with monitors for `projextpal.com` + `api.projextpal.com/api/health/`.

---

## 11. Known live customer

As of 2026-05-12: **`zanjabil@inclufy.com`** is onboarded and live. Their data is in `projextpal_postgres_data` volume on Mac Studio. **Backup before any DB operation that could lose this.**

---

## 11b. product_issues_productissue schema gotcha

The Django model `product_issues.ProductIssue` requires a NOT NULL `company` FK. When creating issues via `manage.py shell` (e.g. for testing), pass `company=` explicitly:

```python
from product_issues.models import ProductIssue
from companies.models import Company
issue = ProductIssue.objects.create(
    title='...',
    description='...',
    status='new',          # allowed: new/triaging/needs-info/accepted/in-progress/resolved/wont-fix/duplicate/closed
    priority='P2',         # allowed: P0/P1/P2/P3 (or null)
    source='user',         # allowed: user/auto-test-ci/auto-test-runtime/agent-scan
    capture_method='manual_form',
    environment={'client': 'web', 'user_agent': 'Mozilla/5.0 Chrome'},
    company=Company.objects.first(),   # REQUIRED
)
```

In normal API flow (POST /api/product-issues/), the view auto-fills company from `request.user.profile.company`. The constraint is multi-tenant by design.

---

## 12. Documentation index (memory folder)

Full docs at `~/.claude/projects/-Users-samiloukile-Projects-projextpal/memory/`:

- `production_deploy_topology.md` — Cloudflare Tunnel + Mac Studio + image registries
- `infrastructure_setup.md` — Docker services + networks + volumes (low-level reference)
- `incident_recovery_runbook.md` — Step-by-step recovery procedures
- `mobile_apps_configuration.md` — Expo / EAS / Apple / Xcode Cloud
- `deploy_roadmap.md` — Agent sequence pre-deploy
- `agents_and_skills_reference.md` — Full agent catalog
- `project_branch_strategy.md` — master vs github/main
