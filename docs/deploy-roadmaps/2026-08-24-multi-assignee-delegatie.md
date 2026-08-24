# Deploy Roadmap — Multi-assignee + taakdelegatie

**Datum**: 2026-08-24
**Repo**: `projextpal`
**Branch**: `master`
**Type**: backend feature (2 migraties: projects.0033 + notifications.0004) + frontend (Taken-pagina, Mijn werk)
**Impactanalyse**: besproken en akkoord (multi-assignee + delegatie optie A — overdragen met spoor)

---

## Wat wordt uitgerold

**Multi-assignee**: M2M `Task.assignees` naast primaire `assigned_to` (compat).
Sync-regels in TaskSerializer: `assignees` meegestuurd = leidend (assigned_to =
eerste van de lijst als de huidige primaire er niet in zit); legacy-client die
alleen `assigned_to` stuurt = toevoegen zonder wissen. Backfill-migratie zet de
bestaande eigenaar ook als assignee. Co-assignees krijgen de bestaande
"toegewezen"-notificatie (m2m-signaal, primaire via FK-signaal — geen dubbelen).
Mijn werk toont ook taken waar je co-assignee bent; de dagelijkse
deadline-reminder mailt alle assignees.

**Delegatie (optie A)**: `POST /api/v1/projects/tasks/{id}/delegate/`
{user_id, note} — ontvanger wordt primaire eigenaar + assignee, delegeerder →
`delegated_by`/`delegated_at`/`delegation_note`, uit assignees, in
`raci_informed`, audit-regel. Notificaties: "task_delegated" naar de ontvanger
(i.p.v. de generieke), "task_delegated_done" naar de delegeerder zodra de taak
op done gaat. Mijn werk krijgt een blok "Door mij gedelegeerd"; de Taken-pagina
een delegeer-actie + badge "gedelegeerd door X".

**Migraties**: `projects/0033_task_assignees` (M2M + 3 delegatievelden +
backfill; through-kolom = `customuser_id`!) en
`notifications/0004_notification_kind_delegation` (choices, state-only).

---

## Pre-deploy teststraat (verplicht, in volgorde)

1. **tsc** (MacBook): `cd frontend && npx tsc --noEmit` → 0 errors.
2. **Backend-suites in het vers gebouwde prod-image** (Studio):
   ```bash
   docker compose -f docker-compose.production.yml run --rm --no-deps backend \
     python manage.py test projects.tests_task_assignment projects.tests_ai_planner
   ```
   Pass: alle tests groen (nieuwe suite: 12 tests — sync-regels, delegate-actie,
   notificaties, Mijn werk). LET OP: nieuwe tests posten met `secure=True`
   (SECURE_SSL_REDIRECT) — zie roadmap 2026-08-19.
3. **Regressie aangrenzende suites** (met `-e SECURE_SSL_REDIRECT=0` voor de
   oudere suites): `python manage.py test projects notifications` → geen nieuwe
   failures t.o.v. baseline.
4. **Migratie-check**: `makemigrations --dry-run --check` → "No changes
   detected" (de 2 nieuwe migraties zijn met de hand geschreven en compleet).

---

## Deploy stappen

1. **pg_dump-backup vóór de migratie** (verplicht — datawijziging):
   ```bash
   docker exec projextpal-postgres-prod pg_dump -U <user> <db> | gzip \
     > ~/backups-projextpal-$(date +%Y%m%d-%H%M%S).sql.gz
   ```
2. Backend: push naar Studio-deployrepo → lokaal image bouwen → compose run
   `migrate` → `up -d backend` → **nginx-restart** (`docker restart
   projextpal-nginx-prod`).
3. Web: GitHub-CI-image pull → tag latest → `up -d frontend`.

## Post-deploy smoke (productie)

1. Health 200 op projextpal.com.
2. API: taak aanmaken met 2 assignees → beide in `assignee_names`; delegate →
   200 + spoor; testrijen opruimen.
3. UI: Taken-pagina — multi-select in Edit Task, delegeer-knop, badge.
4. Geen 500's in backend-log.

## Rollback

Migraties zijn additief (nieuwe tabel + 3 nullable kolommen + choices-state).
Rollback: vorige image-tag terugzetten; migraties kunnen blijven staan (oude
code negeert de nieuwe kolommen). Volledige terugdraai: `migrate projects 0032`
+ `migrate notifications 0003` (verwijdert alleen de nieuwe structuren).

---

## Uitvoering 2026-08-24 ✅ (met infra-incident)

| Stap | Resultaat |
|---|---|
| tsc | 0 errors |
| Feature-suites (image `8db103f6`) | 31/31 OK — eerste run ving 2 echte bugs (dubbele toewijzings-mail; Mijn werk miste co-assignees buiten het projectteam), gefixt in `8db103f6` |
| Regressie projects+notifications | 54/54 OK |
| makemigrations --check | schoon |
| pg_dump-backup | `~/backups-projextpal-20260824-150227.sql.gz` (geverifieerd) |
| Migraties | projects.0033 + notifications.0004 toegepast |
| Deploy | backend `8db103f6` + web `ba9a02d5` live; smoke (serializer + UI) geslaagd |

**INCIDENT tijdens deploy — iCloud-map wedged → compose kapot → prod ~35 min down:**
`~/Desktop/ProjextPal` gaf permanent "Interrupted system call" (iCloud file
provider). Gevolgen: elke `docker compose`-aanroep hing (cron-jobs stapelden
al 3 dagen!), nginx (config-bind uit die map) kon na een restart niet meer
starten, en uiteindelijk wedgede de Docker-daemon. Herstel (user-akkoord):
Docker Desktop-herstart + **compose-loze werkelijkheid**:
- nginx = **`projextpal-nginx-prod2`**, config uit
  `/Users/sami/deploys/projextpal-runtime/nginx/conf.d/` (kopie uit de repo).
- backend/frontend handmatig hercreëerd met `docker run` (netwerk-aliassen
  `backend`/`frontend`, restart unless-stopped); env-file:
  `/Users/sami/deploys/projextpal-runtime/backend.env`.
- Oude containers (`projextpal-nginx-prod`, `-backend-prod-old`,
  `-frontend-prod-old`) staan op `--restart=no` als rollback.
- Crons omgezet van `compose exec` naar `docker exec` (backup:
  `/Users/sami/crontab-backup-20260824.txt`).

**Open follow-ups**: ProjextPal-runtime definitief uit iCloud halen (map naar
`/Users/sami/deploys/` verplaatsen) en de containers weer onder compose-beheer
brengen vanaf dat pad; LaunchAgent/bron van `publish_integration_outbound`
nalopen (hing 3 dagen, geen crontab-regel).
