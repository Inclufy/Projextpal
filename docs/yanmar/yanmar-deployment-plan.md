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

| # | Taak | Lost op | Prioriteit | Schatting |
|---|---|---|---|---|
| F3-1 | **Role-based cost/rate-visibility**: finance-rol-gating in serializers (`hourly_rate_snapshot`, `labor_cost`, budget-rollup) | SC-05 (nu FAIL) | **P0 security** | 1–2 dagen |
| F3-2 | GDPR: wire delete-flow → `AuditLog` (de `TODO` in `accounts/gdpr.py:238`) + DPIA-bevestiging | SC-03 | P0 | 0,5–1 dag |
| F3-3 | Live dashboards: WebSocket/SSE-consumer op Channels (nu pull-only) | SC-09 | P1 | 2–3 dagen |
| F3-4 | AWS single-tenant: IaC-template (Terraform) voor Yanmar-isolated deploy | SC-01 | P1 (hosting-keuze afhankelijk) | afh. van hosting-model A/A+CMK/B |
| F3-5 | BYO LLM-key demo-config voor YEU-key (vs Inclufy-pool) | SC-02 (PASS, maar demo-keuze) | P1 | 0,5 dag |

**F3-1 is een echte security-bug** (elke tenant-gebruiker ziet nu rates/kosten). Behandel als P0 maar **niet** vóór de demo haasten — doe het netjes met tests + `data-leak-hunter`-verificatie.

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

| Fase | Scope | DB-risico | Timing | Score na fase |
|---|---|---|---|---|
| **1** | 7× demo-wiring (FE + 1 serializer) | geen | **vóór 8 juni** | ~18/34 demo-baar |
| **2** | 7× PARTIAL→PASS (4 met migratie) | backup-gate | na demo, vóór go-live | ~30/34 PASS |
| **3** | 5× contract/security (SC-05 = P0) | backup-gate | go-live-gate | 33/34 (excl. SAP) |
| **4** | SAP S/4HANA | n.v.t. | aparte SOW | Phase 2 |

**Kernboodschap:** Fase 1 is bijna risicoloos (frontend), levert de grootste demo-winst, en kan vóór 8 juni af. Alles met een migratie of security-impact gaat ná de demo, achter de backup-gate.
