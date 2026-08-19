# Deploy Roadmap — Plan met AI voor alle methodologieën

**Datum**: 2026-08-19
**Repo**: `projextpal`
**Branch**: `master` (commit `cac54c90` + testfix)
**Type**: backend feature (geen migraties) + frontend (7 pagina's + dialoog + knop-component)
**Voortbouwend op**: Plan met AI-MVP (`c3b9b312`) + uitrol planningsschermen (`cd971fce`)

---

## Wat wordt uitgerold

De AI-planner stelt naast mijlpalen/taken/risico's nu ook de artefacten van de
projectmethodiek voor (`methodology_plan` in het voorstel) en past ze toe:

| Methodiek | Fallback-voorstel | Apply-doel |
|---|---|---|
| Scrum | 2–5 sprints + ≥4 backlog-items | `scrum.Sprint` + `scrum.BacklogItem` (sprint-1-koppeling; nummering vervolgt bestaand max) |
| Kanban | 5 kolommen + 3 kaarten | `kanban.KanbanColumn` (idempotent op naam) + `kanban.KanbanCard` |
| PRINCE2 | 3 werkpakketten + 3 producten | `prince2.WorkPackage` + `prince2.Product` (WP-koppeling) |
| LSS groen | 5 DMAIC-fasen + 5 taken | `lss_green.DMAICPhase` (get_or_create) + `LSSGreenTask` |
| LSS zwart | idem | zelfde fasen, taken via `lss_black.LSSBlackTask` |
| Waterfall | 5 fasen (requirements→deployment) | `waterfall.WaterfallPhase` |
| Hybride | 3 fase-methodologieën | `hybrid.PhaseMethodology` (entry/exit-criteria) |

Frontend: `AiPlanDialog` toont de methodiek-artefacten als aanvinkbare, bewerkbare
items; nieuwe `AiPlanButton`-wrapper op ScrumBacklog, KanbanBoard,
Prince2WorkPackages, WaterfallGantt, LSSGreenPhases, LSSBlackPhases, HybridPhases.

**Geen migraties** — alleen bestaande modellen. `MAX_ITEMS=60` begrenst de apply.

---

## Pre-deploy teststraat (verplicht, in volgorde)

### 1. Frontend type-check (MacBook)
```bash
cd frontend && npx tsc --noEmit          # 0 errors
```

### 2. Backend-testsuite in het productie-image (Studio)

De teststraat draait in het vers gebouwde image tegen de compose-stack, dus met
prod-settings (SSL-redirect aan, poolkeys gezet). De tests zijn hiervoor
hermetisch gemaakt: `override_settings(OPENAI_API_KEY="", ANTHROPIC_API_KEY="")`
forceert het deterministische fallback-plan (geen echte AI-calls vanuit tests)
en API-tests posten met `secure=True` (anders 301 door `SECURE_SSL_REDIRECT`).

```bash
ssh sami@mac-studio-van-sami
cd /Users/sami/deploys/projextpal-src/backend
docker build -t registry.gitlab.com/inclufy/projextpal/backend:<sha> \
             -t registry.gitlab.com/inclufy/projextpal/backend:latest .
cd /Users/sami/Desktop/ProjextPal
docker compose -f docker-compose.production.yml run --rm --no-deps backend \
  python manage.py test projects.tests_ai_planner -v 1
```
**Pass-criterium**: 18/18 OK — engine (fallback + charter-context + apply-validatie),
methodiek (7 methodologieën + inclufy-zonder-extensie), API (auth/tenant/throttle).

### 3. Regressie aangrenzende apps (zelfde image)
```bash
docker compose -f docker-compose.production.yml run --rm --no-deps backend \
  python manage.py test scrum kanban prince2 waterfall lss_green lss_black hybrid --parallel 2>&1 | tail -3
```
**Pass-criterium**: geen nieuwe failures t.o.v. baseline (de planner schrijft
alleen via bestaande model-API's; deze suite bewaakt dat niets stukgemaakt is).

### 4. Migratie-check
```bash
docker compose -f docker-compose.production.yml run --rm --no-deps backend \
  python manage.py makemigrations --dry-run --check   # exit 0: niets te genereren
```

---

## Deploy stappen

GitLab-CI-route is stuk (runner zonder gitlab.com-connectiviteit) — lokale-buildroute
op de Studio is het canonieke recept (zie memory `project_hub_deploy_topology`).

1. **Web**: push naar GitHub master → GitHub Actions bouwt
   `ghcr.io/inclufy/projextpal-web:<sha>` → op Studio: pull, tag `latest`,
   `docker compose -f docker-compose.production.yml up -d frontend`.
2. **Backend**: push naar `ssh://mac-studio-van-sami/Users/sami/deploys/projextpal-src`
   → image bouwen (stap 2 hierboven, zelfde image als de teststraat) →
   `docker compose -f docker-compose.production.yml up -d backend`.
3. **ALTIJD**: `docker restart projextpal-nginx-prod` (stale upstream-IP → 502).

---

## Post-deploy smoke-test (productie)

1. `curl -s https://projextpal.inclufy.com/api/v1/health/` → 200.
2. Rooktest engine in de draaiende container (scrum-testproject, daarna opruimen):
   `plan_chat` → proposal bevat `methodology_plan.type == "scrum"`;
   `apply_plan` → sprints + backlog-items aangemaakt.
3. UI: methodiekpagina (bijv. Scrum-backlog van een testproject) → knop
   "Plan met AI" zichtbaar → dialoog toont methodiek-sectie → toepassen → lijst ververst.
4. Geen nieuwe Sentry-events / geen 500's in backend-log.

---

## Rollback

| Scenario | Actie |
|---|---|
| Backend-regressie | vorige image-tag (`cd971fce`) terugtaggen als `latest` + `up -d backend` + nginx-restart |
| Frontend-regressie | vorige ghcr-sha terugtaggen als `latest` + `up -d frontend` |
| Alleen planner kapot | feature is additief (aparte endpoints `/ai-plan/`); geen dataverlies-risico, apply maakt hooguit rijen aan die handmatig verwijderd kunnen worden |

Geen migraties → rollback is alleen image-wissel, geen DB-actie.
