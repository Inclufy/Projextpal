# Deploy Roadmap — Security Fixes (Sachin regression + 6 P0 + 3 P1)

**Datum**: 2026-05-02
**Branch**: `master`
**Commits**:
- `f64d29fc` — fix(visibility): COMPANY_WIDE_ROLES bypass for admin/pm/program_manager (4 files)
- `080db08a` — fix(security): close 6 P0 cross-tenant leaks + 3 P1 academy priv-esc (6 files)
- Vorige prod-tag (rollback target): `b9440b22`

**Scope**: 10 files, **alleen `views.py`** — geen models, geen migraties veroorzaakt door deze commits.

---

## A. Pipeline status

### GitHub Actions
- Run `25258284371` voor commit `080db08a`: **failure**.
- Oorzaak: `npm ci` faalt op `package-lock.json` drift (pre-existing sinds april).
  - Missing: `expo-notifications@0.32.17`, `@ide/backoff@1.0.0`, `assert@2.1.0`, `badgin@1.2.3`, `expo-application@7.0.8`, `expo-constants@18.0.13`, `call-bind@1.0.9`, `is-nan@1.3.2`, `object-is@1.1.6`, `object.assign@4.1.7`, `util@0.12.5`, `set-function-length@1.2.2`, et al.
- **Niet veroorzaakt door deze commits** (mobile expo-export only). Out-of-scope voor deze deploy.

### GitLab pipeline
- `glab` is niet beschikbaar in deze sandbox.
- Bekijk handmatig: <https://gitlab.com/inclufy/projextpal/-/pipelines>
- Filter op commit `080db08a` voor de actuele run.

---

## B. Pre-deploy checks

### DB-migraties
- 10 gewijzigde files zijn allemaal `views.py` (academy, agile, communication, deployment, governance, integrations, hybrid, lss_black, lss_green, projects).
- **Geen models gewijzigd door deze commits → geen migraties getriggerd door deze deploy.**
- `python3 manage.py makemigrations --dry-run --check` toont wel pre-existing drift in `accounts/`, `finance/`, `programs/` (index renames + field alters). **Dat is een aparte open issue, niet door deze commits geïntroduceerd.** Verifieer op host of deze drift al in productie is meegenomen of een aparte deploy-stap nodig heeft.

### Test-suite (smoke, geraakte oppervlakken)
- `backend/tests/` bevat geen modules die matchen op `test_pm_or` / `test_visibility` / `test_company` (alleen methodology-suites: agile, lss, prince2, scrum, sixsigma, uat, waterfall + academy/governance/integration/kanban/performance/hybrid).
- Aanbeveling: smoke gericht op de geraakte apps:
  ```
  cd backend
  pytest tests/academy tests/governance tests/integration tests/agile tests/hybrid tests/lss -x -q
  ```
- Pytest 7.4.4 + Django 5.2.6 zijn beschikbaar in de sandbox; volledige run niet uitgevoerd in deze runbook-stap (niet gevraagd, en vereist test-DB op host).

---

## C. GitLab pipeline (auto vs manual)

| Stage | Trigger | Wat |
|---|---|---|
| `test:backend` | **auto** | pytest met coverage |
| `build:backend` | **manual** | image push naar GitLab Container Registry |
| `build:frontend` | **manual** | image push naar GitLab Container Registry |
| `deploy:production` | **manual** | SSH naar prod host (Mac Studio), `docker compose pull && up -d` |

Pipeline-overzicht voor `080db08a`: <https://gitlab.com/inclufy/projextpal/-/pipelines>

---

## D. Manual build → deploy

### Volgorde via GitLab UI
1. Open de pipeline voor commit `080db08a`.
2. Trigger `build:backend` (wacht op groen).
3. Trigger `build:frontend` (wacht op groen).
4. Trigger `deploy:production` (SSH job → prod host pulls images + restarts compose stack).

### Alternatief: vanaf prod host (Mac Studio)
```
cd /path/to/projextpal
git fetch origin master && git checkout 080db08a
./deploy-from-registry.sh
```

`deploy-from-registry.sh` doet `docker login registry.gitlab.com`, `docker compose pull`, `docker compose up -d --remove-orphans`.

---

## E. Post-deploy smoke-tests

Vervang `<HOST>` door productie-URL en `<TOKEN>` door een vers JWT-access-token.

### 1. Sachin regression (visibility bypass)
**Doel**: project-lijst niet leeg voor admin/pm/program_manager met COMPANY_WIDE_ROLES.

UI: log in als `sachin@inclufy.com` → ga naar `/projects` → verwacht ≥1 project zichtbaar.

API:
```
curl -sS -H "Authorization: Bearer <SACHIN_TOKEN>" \
  https://<HOST>/api/v1/projects/projects/ | jq '.results | length'
```
**Verwacht**: > 0.

### 2. Cross-tenant isolatie (P0 fix in projects/views)
**Doel**: PM van Company B mag Company-A-project niet ophalen.

```
curl -sS -o /dev/null -w "%{http_code}\n" \
  -H "Authorization: Bearer <COMPANY_B_PM_TOKEN>" \
  https://<HOST>/api/v1/projects/projects/<COMPANY_A_PROJECT_ID>/
```
**Verwacht**: `404`.

### 3. Academy lock-down (P1 priv-esc fix)
**Doel**: anonieme write op lessons geweigerd.

```
curl -sS -o /dev/null -w "%{http_code}\n" -X POST \
  -H "Content-Type: application/json" \
  -d '{"title":"x","content":"x"}' \
  https://<HOST>/api/v1/academy/lessons/
```
**Verwacht**: `401` of `403`.

### 4. Integrations leak gedicht (P0 fix in integrations/views)
**Doel**: admin Company A ziet alleen Company A-rijen.

```
curl -sS -H "Authorization: Bearer <COMPANY_A_ADMIN_TOKEN>" \
  https://<HOST>/api/v1/integrations/integrations/ \
  | jq '.results[].tenant_id' | sort -u
```
**Verwacht**: één unieke `tenant_id`, gelijk aan Company A's `company_id`.

### 5. Communication ViewSets org-scoped (P0 fix in communication/views)
**Doel**: status-reports endpoint geeft alleen eigen company terug.

```
curl -sS -H "Authorization: Bearer <COMPANY_A_PM_TOKEN>" \
  https://<HOST>/api/v1/communication/status-reports/ \
  | jq '.results[].company_id // .results[].tenant_id' | sort -u
```
**Verwacht**: één unieke waarde = Company A.

Optioneel ook even: `/api/v1/communication/training-materials/`, `/reporting-items/`, `/meetings/`, en de governance / deployment / agile-DoD endpoints.

---

## F. Rollback

### Via GitLab pipeline (snelste)
1. Re-deploy de vorige image-tag `b9440b22`:
   - In GitLab → CI/CD → Pipelines → zoek pipeline van `b9440b22`.
   - Trigger `deploy:production` opnieuw vanuit die pipeline.

### Via prod host
```
cd /path/to/projextpal
git fetch origin master
docker compose pull projextpal-backend:b9440b22 projextpal-frontend:b9440b22
TAG=b9440b22 docker compose up -d
```

### Via revert-commit (laatste redmiddel — pas op, herschrijft history-tip)
```
cd /Users/samiloukile/Projects/projextpal
git revert 080db08a f64d29fc
git push origin master
./deploy-from-registry.sh
```

---

## G. Open issues (niet in deze deploy)

- **GitHub Actions lockfile-drift** — Out of scope. Vereist:
  ```
  cd mobile
  npm install
  git add package-lock.json
  git commit -m "chore(mobile): refresh lockfile after expo bumps"
  ```
  Niet doen tijdens deze deploy: raakt mobile-build, niet backend.
- **Pre-existing model-drift** in `accounts/`, `finance/`, `programs/` (index renames + field alters). Verifieer op host of die migrations al in prod zijn; zo niet, separate deploy-window.

---

## H. Sign-off checklist

- [ ] GitLab pipeline `080db08a`: `test:backend` groen
- [ ] `build:backend` getriggerd + groen
- [ ] `build:frontend` getriggerd + groen
- [ ] `deploy:production` getriggerd + groen
- [ ] Smoke 1 (Sachin)
- [ ] Smoke 2 (cross-tenant 404)
- [ ] Smoke 3 (academy 401/403)
- [ ] Smoke 4 (integrations org-scoped)
- [ ] Smoke 5 (communication org-scoped)
- [ ] Geen 5xx-spike in monitoring (Mac Studio host) eerste 15 min na deploy
