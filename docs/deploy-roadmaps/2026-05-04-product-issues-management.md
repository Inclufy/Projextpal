# Deploy Roadmap — Product Issues Management (intake + triage)

**Datum**: 2026-05-04
**Repo**: `projextpal` (reference implementation; ports volgen voor Finance, Marketing, IQ Helix, Ignite)
**Branch**: `master`
**Type**: backend feature deploy + nieuwe agent + AI Copilot frontend (deferred)
**Owner agent**: `issue-triage-validator` (~/.claude/agents/issue-triage-validator.md)

---

## Wat wordt uitgerold

### Backend (`product_issues/` Django app)
- **`ProductIssue` model** — user-feedback + auto-CI capture (let op: distinct from `projects.Issue` = RAID-log)
- **`ProductIssueComment` model** — chat-thread per issue voor agent + human discussie
- **DRF viewset + 2 endpoints**:
  - `POST /api/v1/product-issues/` — user-create vanuit Copilot
  - `POST /api/v1/product-issues/{id}/triage/` — agent posts triage result
  - `POST /api/v1/product-issues/{id}/comment/` — append comment
  - `POST /api/v1/product-issues/auto/ci/` — CI auto-POST (test-failure → issue)
- **Admin UI** voor handmatige triage + audit
- **Migration** `product_issues/migrations/0001_initial.py`

### Agent
- `~/.claude/agents/issue-triage-validator.md` — 5-fase flow (intake → context → REPRODUCE → classify → feedback)
- Apps onder beheer: ProjeXtPal, Finance, Marketing, IQ Helix, Ignite
- Veiligheidsregels: productie nooit aanraken, alleen test-tokens, time-box 5 min, geen secrets in log

### Frontend (DEFERRED naar volgende sessie)
- AI Copilot extension: 3e tab "Issues", snelle actie "Probleem melden"
- Tier-1 (paste/upload) + Tier-2 (auto-screenshot floating-button)
- Reden defer: focus deze sessie op backend + agent foundation; frontend port volgt zodra design-tokens stabiel

---

## Pre-deploy agent-gates ⭐ (alle 3 verplicht)

| # | Agent | Pass-criterium | Output |
|---|---|---|---|
| 1 | `pm-feature-validator` | geen coverage regressie | `validator-runs/2026-05-04-pm.md` |
| 2 | `data-leak-hunter` | 0 P0 leaks | `validator-runs/2026-05-04-leaks.md` |
| 3 | `issue-triage-validator` op zichzelf — meta-test | 0 open P0 in eigen backlog | `validator-runs/2026-05-04-issues.md` |

## Pre-deploy code-checks

```bash
cd backend
python3 manage.py check                                    # 0 issues
python3 -m py_compile product_issues/*.py
python3 manage.py makemigrations product_issues --check    # exit 0 (al gegenereerd)
```

## Smoke-test op fresh SQLite

```bash
rm -f /tmp/pi_smoke.db
DATABASE_URL="sqlite:////tmp/pi_smoke.db" python3 manage.py migrate
DATABASE_URL="sqlite:////tmp/pi_smoke.db" python3 manage.py shell -c "
from accounts.models import Company
from product_issues.models import ProductIssue, ProductIssueComment
co = Company.objects.create(name='Smoke')
i = ProductIssue.objects.create(company=co, source='user', title='test', category='ui')
ProductIssueComment.objects.create(issue=i, author='u1', body='test comment')
print('OK')"
```

✅ Reeds uitgevoerd, alle assertions slaagden.

## Deploy stappen

### A. Backend (productie)

1. **Push GitHub master** — geen GitLab quota verbranden
2. Trigger handmatig GitLab `build:backend` zodra GitHub-CI groen
3. Trigger GitLab `deploy:production`
4. Migratie volgorde:
   ```bash
   ssh prod
   cd /opt/projextpal
   git pull origin master
   docker compose pull backend
   docker compose run --rm backend python manage.py migrate product_issues 0001
   docker compose up -d --no-deps backend
   ```

### B. Agent registratie (geen deploy nodig — runtime config)

Agent leeft in `~/.claude/agents/issue-triage-validator.md`. Per machine die dev/triage doet, kopieer of symlink. Voor team-shared: voeg `issue-triage-validator.md` ook toe aan `projextpal/.claude/agents/` zodat collega's hem hebben (TODO volgsessie).

### C. Per-tool config (cross-app rollout — Phase 2b–2e)

Elke tool krijgt een `.claude/issue-triage-config.json`:
```json
{
  "app_name": "ProjeXtPal",
  "repro_baseurl_local": "http://localhost:8000",
  "repro_baseurl_staging": "https://projextpal-staging.example.com",
  "test_credentials_env": {
    "admin": "PROJEXTPAL_TEST_ADMIN_TOKEN",
    "pm": "PROJEXTPAL_TEST_PM_TOKEN"
  },
  "priority_rubric": {
    "P0": "login werkt niet / data-loss / cross-tenant leak",
    "P1": "major flow broken (geen workaround)",
    "P2": "workaround beschikbaar",
    "P3": "polish"
  },
  "categories": ["ui","api","mobile","auth","data","performance","integration"],
  "known_flaky": [],
  "team_routing": { "default": "projextpal-team" }
}
```

Wordt **per tool aangeleverd door product-owner** en gecommit naast de backend-installatie.

---

## Post-deploy smoke-test (productie)

1. Via Django admin op `/admin/product_issues/productissue/` — bevestig empty list
2. Via API:
   ```bash
   curl -X POST https://projextpal.com/api/v1/product-issues/ \
     -H "Authorization: Bearer $TOKEN" \
     -H "Content-Type: application/json" \
     -d '{"title":"Smoke test","category":"other","company":<id>}'
   ```
   verwacht 201 Created met issue-id
3. Triage-endpoint:
   ```bash
   curl -X POST https://projextpal.com/api/v1/product-issues/<id>/triage/ \
     -H "Authorization: Bearer $TOKEN" \
     -d '{"classification":"user-error","priority":"P3","status":"closed"}'
   ```
4. Comment:
   ```bash
   curl -X POST https://projextpal.com/api/v1/product-issues/<id>/comment/ \
     -d '{"body":"Smoke comment","author":"smoke"}'
   ```

---

## Rollback

| Scenario | Actie |
|---|---|
| Migratie 0001 faalt | `python manage.py migrate product_issues zero` (drop tables) — additief, geen data-loss elders |
| Endpoint geeft 500 op productie | Revert commit, redeploy. ProductIssue is geheel additieve laag — geen impact op andere flows |
| Agent geeft slechte triage-uitkomsten | Geen rollback nodig: gewoon `agent_triage_result` veld leeg + `triaged_by=null` zetten en opnieuw runnen |

---

## Phase 2b–2e — port naar andere tools

| Sessie | Tool | Stack | Schatting |
|---|---|---|---|
| **2b** | Finance | Supabase + Deno | 3 uur — nieuwe migration + 2 edge functions |
| **2c** | Marketing | Next.js + Supabase | 2-3 uur |
| **2d** | IQ Helix | FastAPI + SQLAlchemy | 3 uur |
| **2e** | Ignite | Spring Boot + JPA | 4-5 uur |

Elke port volgt hetzelfde model-schema; afwijkingen alleen in stack-specifieke API-implementatie.

---

## Voorgestelde commit-message

```
feat(product-issues): user-feedback + auto-CI intake + triage-agent foundation

NEW Django app `product_issues/` in projextpal/backend:
  + ProductIssue model — title, description, category, severity, priority,
    classification, status, environment (JSON), error_trace, attachments,
    reproduction_log, triage metadata
  + ProductIssueComment — chat thread for agent + human triage
  + DRF viewset with org-scoped queryset (superadmin sees all)
  + Endpoints:
      POST /api/v1/product-issues/                  user create
      POST /api/v1/product-issues/{id}/triage/      agent posts result
      POST /api/v1/product-issues/{id}/comment/     thread
      POST /api/v1/product-issues/auto/ci/          CI auto-POST
  + Admin UI with full fieldsets

NEW AGENT (~/.claude/agents/issue-triage-validator.md):
  5-phase triage flow — intake → context → REPRODUCE → classify → feedback.
  Reproduction phase actually runs the failing flow against test/staging
  (not production). Classifies as bug/error/functionality/best-practice/
  missing-feature/duplicate. Time-box 5 min per issue.

DEPLOY ROADMAPS:
  + 2026-05-04-product-issues-management.md (this file)
  ~ 2026-05-02-security-fixes.md, 2026-05-03-mobile-deployment.md,
    2026-05-04-pm-best-practice-features.md
    — added 3-agent gate (pm-feature-validator + data-leak-hunter +
      issue-triage-validator) as recurring pre-deploy step

DEFERRED to next session:
  - Frontend AI Copilot tab + paste/upload UI
  - Per-tool installer-script (Finance/Marketing/Helix/Ignite ports)
  - Mobile shake-to-report

TESTED: manage.py check (0 issues), 0001_initial migrates clean on fresh
SQLite, ProductIssue + Comment + triage roundtrip + M2M attachments
verified.

Pushed to GitHub only.
```
