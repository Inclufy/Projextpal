# Yanmar Europe — Deployment Plan (features + requirements)

**Datum:** 2026-06-05 · **Doel-milestone:** deep-dive demo **8 juni 2026**, daarna productie-hardening
**Basis:** `docs/yanmar/yanmar-realisation-audit.md` (11/34 PASS · 19 PARTIAL · 4 FAIL)
**Leidend principe:** de backend dekt Yanmar breed; de winst zit in **UI-wiring + serializer-exposure**. Eerst alles wat *geen* migratie nodig heeft (veilig vóór de demo), daarna pas model-wijzigingen achter de data-guardian backup-gate.

---

## 0. Deploy-mechanica (lees dit eerst — sessie-geleerde valkuilen)

> Deze gelden voor **elke** fase hieronder. Productie draait op Mac Studio (`sami@MacStudovanSami`), `~/Desktop/ProjextPal`.

1. **`docker compose build <svc>` is een NO-OP** voor `backend`/`frontend` — die services hebben alleen een `image:` key, geen `build:`. Bouw **direct**:
   ```
   docker build -t registry.gitlab.com/inclufy/projextpal/frontend:latest ./frontend
   docker build -t registry.gitlab.com/inclufy/projextpal/backend:latest  ./backend
   docker compose -f docker-compose.production.yml up -d --force-recreate <svc>
   ```
2. **Backend-startup draait automatisch `migrate`** bij recreate. Daarom: **elke** modelwijziging vereist eerst een **data-guardian backup** (geverifieerd >1MB) — er bestaat een live klant (`zanjabil@inclufy.com`, Yanmar-seed).
3. **Frontend-only wijzigingen raken de DB niet** → geen backup-gate nodig. Dit maakt Fase 1 (demo-wiring) laag-risico.
4. **Na elke deploy:** health-check via `projextpal.com/api/v1/public/plans/` (niet `api.projextpal.com` — dat subdomein is ongebruikt) + regressie-sweep tegen `projextpal.com`.
5. **CI:** push naar `master` + `github/main` → GitHub Actions bouwt de ghcr-frontend; let op de bundle-size-guard (eager `index-*.js` < 2MB).

---

## FASE 1 — Demo-readiness (frontend-only, GEEN migraties) · doel: vóór 8 juni

> Dit is de hoogste hefboom: 7 components/serializers die de backend al ondersteunt maar de UI niet toont. **Geen DB-risico.** Totaal ≈ 9–13 uur werk.

| # | Taak | Lost op | Type | Schatting | Deploy |
|---|---|---|---|---|---|
| F1-1 | Mount `TaskKpiTiles` in project-overview | ATR-01, ATR-05 | FE | 1–2 u | frontend |
| F1-2 | Mount `BudgetOneView` in budget/finance-pagina | HR-04 | FE | 1 u | frontend |
| F1-3 | Mount `DueDateChangeRequestQueue` in project/approvals-tab | PP-05 | FE | 1–2 u | frontend |
| F1-4 | Mount `ProjectSignOffDialog` in closing/overview | PP-07 | FE | 1 u | frontend |
| F1-5 | 3 RAG-selectors (`rag_budget/planning/resources`) in Highlight-form | HR-03 | FE | 2–3 u | frontend |
| F1-6 | `lowlights`-textarea in Highlight-form | HR-06 | FE | 0,5 u | frontend |
| F1-7 | Expose `customer_supplier`, `yanmar_meeting_room`, `discussion_notes`, `conclusions` in `MeetingSerializer` + render in `ExecutionMeeting.tsx` | MM-04, MM-05 | BE-serializer + FE | 2–3 u | backend (geen migratie) + frontend |

**Let op F1-7:** serializer-velden toevoegen = **geen** migratie (velden bestaan al op het model) → backend rebuild zonder DB-risico, maar wel backend-recreate (auto-migrate is dan een no-op — veilig).

**Resultaat Fase 1:** ~7 PARTIAL → PASS. Demo-score stijgt van 11/34 naar **~18/34 volledig demo-baar**, en alle vier templates hebben een live scherm.

**Deploy-volgorde Fase 1:**
1. Branch `sprint-yanmar-demo-wiring` vanaf `master`.
2. Implementeer F1-1…F1-7 + `tsc` per stap.
3. PR → CI groen (bundle-guard!) → merge `master` + push beide remotes.
4. Mac Studio: `docker build ./frontend` (+ `./backend` voor F1-7) → `up -d --force-recreate`.
5. Health-check + `link-activation-tester` op de 7 nieuwe schermen.

---

## FASE 2 — Echte PARTIAL→PASS mét migraties · doel: vóór go-live (na demo)

> Hier zitten model-wijzigingen. **Data-guardian backup-gate verplicht.** Doe dit ná de demo zodat de demo-build stabiel blijft.

| # | Taak | Lost op | Migratie? | Schatting |
|---|---|---|---|---|
| F2-1 | `HighlightReport`: voeg `sponsor`, `pm`, `senior_supplier`, `objectives` toe (+ form) | HR-01 (nu FAIL) | ✅ ja | 3–4 u |
| F2-2 | `HighlightReport`: `phase_timeline` (Prepare/Renovations/Run, JSON of child-model) + render | HR-02 (nu FAIL) | ✅ ja | 4–6 u |
| F2-3 | `Task.progress` → `PROGRESS_CHOICES` (0/25/50/75/100) + 5-symbool-rendering (○◔◑◕●) | ATR-04 | ✅ ja (choices) | 2–3 u |
| F2-4 | `ProjectMembership` CRUD: ViewSet + URL-route + RACI-pagina op echte API | PP-01, ATR-02 | nee (model bestaat) | 4–6 u |
| F2-5 | `RiskHeatmap`: Risk-impact 3-level → 5-level numeriek + mount component | HR-05 | ✅ ja (impact-veld) | 3–4 u |
| F2-6 | `MeetingActionItem` CRUD + handmatige carry-forward-trigger + UI | MM-01, MM-02, MM-03 | nee (model bestaat) | 4–5 u |
| F2-7 | Generieke closing-workflow-pagina (niet alleen PRINCE2) | PP-09 | nee | 2–3 u |

**Deploy-volgorde per F2-taak met migratie (F2-1/2/3/5):**
1. `data-guardian` backup op Mac Studio → verifieer dump >1MB.
2. Lokaal `makemigrations` + test op SQLite.
3. PR → CI groen → merge → push.
4. Mac Studio: `docker build ./backend` → `up -d --force-recreate backend` (auto-migrate past toe).
5. `showmigrations` bevestigt de nieuwe migratie `[X]` → health-check → regressie-sweep.

**Resultaat Fase 2:** HR-01/HR-02 FAIL→PASS, alle 4 templates volledig. Score ~**30/34 PASS**.

---

## FASE 3 — Contract/security-eisen · doel: go-live-gate (echte productie-eisen)

> Geen demo-cosmetica — dit zijn de eisen waarop Yanmar's IT/security tekent. Niet haasten.

| # | Taak | Lost op | Prioriteit | Status |
|---|---|---|---|---|
| F3-1 | **Role-based cost/rate-visibility**: `can_view_costs()` over alle cost-surfaces | SC-05 | **P0 security** | ✅ **DONE** (data-leak-hunter geverifieerd, alle 7 G-gaps dicht) |
| F3-2 | GDPR: delete-flow → `AuditLog` | SC-03 (audit-deel) | P0 | ✅ **DONE** (Art.17 erasure schrijft AuditLog) |
| F3-2b | GDPR: EU-region compute hosting | SC-03 (infra-deel) | P0 | ⏳ infra/hosting-beslissing (geen code) |
| F3-3 | Live dashboards: WebSocket-consumer + **prod WSGI→ASGI-switch** (daphne/uvicorn) + nginx WS-upgrade | SC-09 | P1 | ⏭️ **DEFERRED** — vereist serving-model-switch; ná demo, getest |
| F3-4 | AWS single-tenant: IaC-template (Terraform) | SC-01 | P1 | ⏳ afh. van hosting-model A/A+CMK/B |
| F3-5 | BYO LLM-key demo-config voor YEU-key (vs Inclufy-pool) | SC-02 (PASS, demo-keuze) | P1 | open (operationele keuze 8 juni) |
| **F3-6** | **PP-08 Communication-plan editor** | PP-08 | P2 | ✅ **DONE** (editor + CRUD, bereikbaar) |
| F3-7 | PP-09 methodologie-neutrale closing-pagina | PP-09 | P2 | open (frontend ~2-3u) |

**SC-09-noot:** echte WebSockets vereisen dat de productie-backend van `gunicorn core.wsgi` (WSGI)
naar een ASGI-server gaat (`daphne core.asgi` of gunicorn+uvicorn-worker) + nginx `Upgrade`/`Connection`
headers. De consumer-infra (`notifications/consumers.py`, Redis channel-layer, `core.asgi`) bestaat al;
alleen het serving-model + een project-events-consumer + frontend-hook resten. Bewust ná de demo.

---

## FASE 3C — Kostenmodel unificatie (uit cost-model-review 2026-06-06)

> Niet een Yanmar-eis (HR-04 is PASS), maar nodig voor échte **"business case → budget → actuals"**-
> traceability en correcte cijfers bij intensief gebruik.

| # | Taak | Waarom | Schatting |
|---|---|---|---|
| F3C-1 | **Eén external-spend bron**: rollup leest nu `invoices.Invoice`/`Expense`, terwijl het volwaardige `finance.Invoice` (vendors/VAT/payments) ernaast bestaat — consolideer naar één bron | dubbele invoice-modellen → inconsistente external spend | 1–2 dagen |
| F3C-2 | **Snapshot-consistentie**: budget-rollup `Internal` herrekent met *huidig* `ProjectTeam.hourly_rate`, maar per-regel `labor_cost` gebruikt de *snapshot* — allebei snapshot maken | tariefwijziging mid-project geeft afwijkende totalen | 0,5 dag |
| F3C-3 | **Eén budget-bron**: `Project.budget` én `ProjectBudget.total_budget` bestaan los → consolideer + idem voor de 2 ROI-velden (`Project.roi_*` vs `BusinessCase.roi_percentage`) | dubbele waarheid budget/ROI | 1 dag |
| F3C-4 | **Business case → budget-koppeling**: `BusinessCase.development_costs + ongoing_costs` automatisch laten doorstromen/afstemmen met het werkbudget + variance-tracking tegen de business case | nu 3 losse lagen, geen traceability justificatie→budget→actuals | 1–2 dagen |

---

## FASE 4 — SAP S/4HANA (bewuste Phase-2 SOW) · doel: aparte SOW

| # | Taak | Lost op | Status |
|---|---|---|---|
| F4-1 | SAP S/4HANA sync (read-mostly): connector + system-of-record-mapping | SC-07 (FAIL deferred) | **Bewust Phase 2** — afhankelijk van push/pull-architectuurkeuze (open vraag voor Yanmar IT) |

Niets te deployen vóór de architectuurbeslissing. Houd het in de SOW, niet in de demo-scope.

---

## Open vragen die de planning blokkeren (uit de summary §5)
- **AWS hosting-model (A / A+CMK / B)** → bepaalt F3-4 timeline (4–6 wk vs 10 wk).
- **SAP push vs pull** → bepaalt F4-1 architectuur.
- **Demo met Inclufy-pool key of YEU-key** → F3-5 operationele beslissing voor 8 juni.
- **RAG-assen PM-set of data-derived** → of F1-5 ook auto-RAG-regels krijgt (bv. Budget=rood bij Actuals+ETC>95%).
- **"Aiden" cost line** → mapping in HR-04.

---

## Samenvatting-tijdlijn

| Fase | Scope | Status | Score na fase |
|---|---|---|---|
| **1** | 7× demo-wiring (FE + 1 serializer) | ✅ **GEDEPLOYED** | 18/34 demo-baar |
| **2 + 2B** | Highlight HR-01/02 + RACI + 6 rollen + risk-map + 5-staps + Meeting MM-01/02/03 + ATR-01 (1 migratie `prince2.0013`) | ✅ **GEDEPLOYED** | 27/34 PASS |
| **3 (deel)** | SC-05 (P0 security) ✅ · SC-03 audit ✅ · PP-08 ✅ | gebouwd + gepusht, **deploy pending** | **29/34 PASS** |
| **3 (rest)** | SC-03 EU-compute · SC-01 AWS · SC-09 WebSocket (deferred) · PP-09 | infra/na-demo | → 33/34 (excl. SAP) |
| **3C** | Kostenmodel-unificatie (F3C-1..4) | backlog (na demo) | kwaliteit, geen eis |
| **4** | SAP S/4HANA | aparte SOW | Phase 2 |

**Kernboodschap (2026-06-06):** alle 4 templates staan **100% live**; SC-05 (P0 security) is gesloten
en geverifieerd. Resterend = puur **infra/contract** (EU-hosting, AWS, WebSockets-deferred, SAP-Phase-2)
+ 1 kleine UI-partial (PP-09) + het kostenmodel-unificatie-spoor (kwaliteit, geen Yanmar-eis).
