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
docker compose -f docker-compose.production.yml run --rm --no-deps \
  -e SECURE_SSL_REDIRECT=0 backend \
  python manage.py test scrum kanban prince2 waterfall lss_green lss_black hybrid 2>&1 | tail -3
```
**Pass-criterium**: geen nieuwe failures t.o.v. baseline (de planner schrijft
alleen via bestaande model-API's; deze suite bewaakt dat niets stukgemaakt is).

> `-e SECURE_SSL_REDIRECT=0` is nodig: deze oudere suites posten zonder
> `secure=True` en zien anders alleen 301-redirects (prod-settings). De
> planner-suite (stap 2) draait bewust WEL met redirect aan.

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

1. `curl -s https://projextpal.com/api/v1/health/` → 200 (LET OP: prod-domein is
   `projextpal.com`, niet `*.inclufy.com` — ALLOWED_HOSTS wijst dat af met 400).
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

---

## Uitvoering 2026-08-19 ✅

| Stap | Resultaat |
|---|---|
| 1. tsc | 0 errors |
| 2. Planner-suite (prod-image `6bea6bfa`) | 18/18 OK (1,4 s — geen echte AI-calls meer) |
| 3. Regressie 7 methodiek-apps | 71/71 OK (met `SECURE_SSL_REDIRECT=0`) |
| 4. makemigrations --check | No changes detected |
| Deploy backend | `up -d backend` + nginx-restart; health 200 op projextpal.com |
| Deploy web | ghcr `6bea6bfa…` → latest → `up -d frontend`; AiPlanDialog/AiPlanButton-chunks in image bevestigd |
| Smoke engine (prod) | scrum-fallback → 3 sprints + 4 backlog-items aangemaakt én opgeruimd |
| Smoke UI (prod) | Demo — Scrum (App Review Demo): knop → dialoog → AI-voorstel met SPRINTS- + BACKLOG-ITEMS-sectie; niet toegepast (demo-data ongemoeid) |

~~Bekende cosmetische verbeterkans: de "Toepassen (N taken)"-teller telt alleen
generieke taken, niet de methodiek-items.~~ **Opgelost in follow-up** (frontend-only):
teller toont nu "N taken + M methodiek-items", de succes-toast telt de aangemaakte
methodiek-rijen mee, en Toepassen blijft bruikbaar als een voorstel alleen
methodiek-items bevat. Teststraat: tsc + web-deploy + UI-smoke (geen backend-wijziging).
