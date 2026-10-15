# Testmatrix — Cross-tenant vertrouwelijkheid

**Omgeving:** productie (Hetzner, projextpal.com) · **Uitgevoerd:** 2026-10-07
**Prod-staat:** backend-vertrouwelijkheid + governance op `b157a67d`, frontend-fixes op `8a04b83f` · **Rollback-anker:** `b157a67d`
**Migraties live:** `projects 0034_task_is_internal`, `projects 0035_projectteam_can_view_costs`, `governance 0013_financial_disclosure_ack`

Twee dimensies:
1. **Interne taken** — `Task.is_internal` verbergt taken voor EXTERNE cross-tenant leden (ander bedrijf dan de project-company).
2. **Kosten/EVM** — budget / uurtarief / CPI·SPI·CV / spend-% verborgen per rol én per projectlid (`ProjectTeam.can_view_costs`).

**Resultaat: alle rijen ✅ PASS — geen ❌.**

**Verificatiemethode (tag per rij):**
- **H** — prod-harness: uitgevoerd in de prod-backend binnen een teruggedraaide `transaction.atomic()` (nul restanten, geen wachtwoord/login), met echte externe + per-lid-restricted + host-PM + superadmin persona's via `APIRequestFactory`. Twee runs: confidentiality-harness @`24d4c94d` (28/29) en governance-harness @`b157a67d` (6/6).
- **A** — code-audit: exhaustieve `data-leak-hunter`-audits over alle routes, eindverdict **SAFE TO DEPLOY** (beide dreigingsmodellen, geen cross-tenant/per-lid-lek).
- **L** — live: Demo Recare (user 38, company 2 "Recare") als extern lid op prod-project 126 "Recare — Implementatie & Uitrol ProjeXtPal" (company 1), 3 taken intern (1023/1027/1037).

> De ene FAIL in de eerste harness (compound-signals gaf op functieniveau een cost-signaal aan een externe — niet via een endpoint bereikbaar) is gedicht (commit `a752ec18`, safe-by-default) en in de governance-harness opnieuw geverifieerd als PASS.

---

## 0. Opzet — uitgevoerd op prod

| # | Stap (zoals uitgevoerd) | Resultaat | Bewijs |
|---|------|-----------|--------|
| 0.1 | Bestaande **Demo Recare** gebruikt i.p.v. `create_recare_test_user` (op verzoek) | ✅ | user 38, `demo-recare@inclufy.com`, company 2 "Recare" (≠ host company 1) |
| 0.2 | Demo Recare als lid toegevoegd aan project 126 | ✅ (L) | `ProjectTeam` id 35, is_active=True; cross-tenant: 1 ≠ 2 |
| 0.3 | 3 taken op `is_internal=True` | ✅ (L) | taken 1023, 1027, 1037 |
| 0.4 | Per-lid `can_view_costs=False` getest | ✅ (H) | restricted-pm-persona in de harness (ephemeer, niet op 126 gepersisteerd) |
| 0.5 | Testdata (budget, expense, cost-risk, highlight report) | ✅ (H/L) | project 126 budget €10.000; harness bouwde expense/risk/highlight-fixtures |

---

## 1. Externe cross-tenant lid ziet GEEN interne taken

| # | Oppervlak | Verwacht voor externe | Resultaat | Bewijs |
|---|-----------|------------------------|-----------|--------|
| 1.1 | Takenlijst (TaskViewSet) | Interne taken ontbreken | ✅ PASS (H/L) | `exclude_internal_for_external` → alleen publieke taak |
| 1.2 | Kanban-bord | Interne taken ontbreken | ✅ PASS (A) | kanban/views membership + internal-filter |
| 1.3 | Gantt | Interne taken ontbreken | ✅ PASS (A) | gantt_views `exclude_internal_for_external` |
| 1.4 | Project-detail → milestones (geneste taken) | Interne taken ontbreken | ✅ PASS (H) | `MilestoneSerializer.get_tasks` → geen interne titel |
| 1.5 | Subtaken van een interne taak | Niet zichtbaar | ✅ PASS (A) | `SubtaskViewSet.get_queryset` task__in-filter |
| 1.6 | Activiteitenfeed | Geen regels over interne taken | ✅ PASS (A) | `ProjectActivityViewSet` GenericFK-exclude |
| 1.7 | Tijdregistratie — `task_title` van interne taak | Titel = leeg/null | ✅ PASS (H) | `task_title=None` voor externe |
| 1.8 | Deadline-wijzigingsverzoeken | Verzoeken op interne taken ontbreken | ✅ PASS (A) | `TaskDueDateChangeRequestViewSet` task__in-filter |
| 1.9 | Afhankelijkheden (`depends_on`-titels) | Interne dependency-titels ontbreken | ✅ PASS (H) | `get_depends_on_titles` → `[]` |
| 1.10 | AI — compound-signalen (bottleneck S3) | Geen interne task-titels | ✅ PASS (H) | alleen cost-risk, geen taaktitel |
| 1.11 | AI — Project Doctor (`/doctor/`) | Geen interne task-titels | ✅ PASS (H) | problems zonder interne titel |
| 1.12 | AI — concept-vergaderagenda | Geen interne task-titels | ✅ PASS (H) | alleen milestone-regel |
| 1.13 | AI — copilot "cross-module / full picture" | Geen interne task-titels | ✅ PASS (A) | `analyze_cross_module_intelligence` company-scoped + filter |

---

## 2. Kosten/EVM-maskering

> (A) = externe Re-care-PM · (B) = same-company lid met `can_view_costs=False`.

| # | Oppervlak | Res. A (extern) | Res. B (restricted) | Bewijs |
|---|-----------|--------|--------|--------|
| 2.1 | Projectbudget-velden | ✅ PASS (H) | ✅ PASS (H) | `can_view_costs_for` = False → budget verborgen/0 |
| 2.2 | Uitgaven (expenses) — bedrag | ✅ PASS (A) | ✅ PASS (A) | ExpenseSerializer amount-mask + viewset-scope |
| 2.3 | Budget-items + forecasts | ✅ PASS (A) | ✅ PASS (A) | BudgetItemViewSet + forecasts-gate |
| 2.4 | Analytics + company-dashboard | ✅ PASS (A) | ✅ PASS (A) | analytics_views + company_dashboard-exclusie |
| 2.5 | AI-insights | ✅ PASS (A) | ✅ PASS (A) | ai_insights budget-gate |
| 2.6 | Tijdregistratie — uurtarief + labor_cost + summary | ✅ PASS (H) | ✅ PASS (H) | rate/labor_cost afwezig + summary-gate |
| 2.7 | Finance — kostenoverzicht + facturen | ✅ PASS (A) | ✅ PASS (A) | project_cost_summary-gate + invoice-exclusie |
| 2.8 | PRINCE2 Highlight Report — budget-velden | ✅ PASS (H) | ✅ PASS (H) | budget_spent/forecast gepopt |
| 2.9 | PRINCE2 Highlight Report — work/issues | ✅ PASS (H) "— withheld —" | — n.v.t. (same-company ziet tekst) | serializer-redactie voor externe |
| 2.10 | PRINCE2 Highlight Report — PPTX-export | ✅ PASS (A) **403** | ✅ PASS (A) **403** | export_pptx `can_view_costs_for`-gate |
| 2.11 | Methodiek-rapporten — CPI/SPI/budget + "EVM shows…" | ✅ PASS (A) | ✅ PASS (A) | MethodologyReportSerializer scrub |
| 2.12 | Status-rapporten (generated) | ✅ PASS (A) | ✅ PASS (A) | GeneratedStatusReportSerializer + LLM budget-strip |
| 2.13 | Copilot — project-analyse + cross-module | ✅ PASS (A) | ✅ PASS (A) | show_costs-gate + cost-signal-filter |
| 2.14 | Programma-budget-rollups + invoices | ✅ PASS (A) | ✅ PASS (A) | programs metrics/budget-gates |
| 2.15 | Waterfall / agile / hybrid — budget & EVM | ✅ PASS (A) | ✅ PASS (A) | 403/mask op budget- + EVM-viewsets |
| 2.16 | Compound-signalen met cost-area (S2/S6) | ✅ PASS (H) | ✅ PASS (H) | safe-by-default `a752ec18`: geen cost-area + `budget_pct=None` |

---

## 3. Positieve controle — mag NIET te streng maskeren

| # | Controle | Resultaat | Bewijs |
|---|----------|-----------|--------|
| 3.1 | PM/admin + superadmin zien interne taken overal | ✅ PASS (H) | host-PM/superadmin zien alle 3 taken |
| 3.2 | PM/finance ziet budget / uurtarief / EVM / rapporten | ✅ PASS (H) | `can_view_costs_for`=True → rates 85.00/680, budget zichtbaar |
| 3.3 | PRINCE2 PPTX-export voor PM/finance | ✅ PASS (A) | geen 403 voor cost-viewer |
| 3.4 | Superadmin ziet alles (geen maskering) | ✅ PASS (H) | superuser-short-circuit |
| 3.5 | In-project invite-dialog (ProjectHeader) | ✅ PASS (A) | bestaand account houdt eigen tenant; nieuw in inviter-company |

---

## 4. Governance — financiële disclosure + per-lid toggle (vervolgbatch)

| # | Functie | Resultaat | Bewijs |
|---|---------|-----------|--------|
| G.1 | Disclosure-flag gate (P3) — extern/restricted zien geen blok | ✅ PASS (H) | extern + restricted → `financial_disclosure=None`; host-PM/superadmin → blok met namen |
| G.2 | `financial_disclosure_state` disclosed-set + signature | ✅ PASS (H) | alleen leden met `can_view_costs_for` True; signature 40 tekens |
| G.3 | Accept → `acknowledged=True`; lid-flip → `stale` | ✅ PASS (H) | re-raise na wijziging ledenset |
| G.4 | `_is_owning_cost_manager` authz (accept + toggle) | ✅ PASS (H) | extern/restricted False; host-PM/superadmin True |
| G.5 | `governance_financialdisclosureack`-tabel | ✅ PASS (H) | migratie 0013 toegepast, rij schrijfbaar |

---

## 5. Regressie (ongewijzigd)

| # | Controle | Resultaat | Bewijs |
|---|----------|-----------|--------|
| 5.1 | projextpal.com + api.projextpal.com | ✅ PASS | 200; projextpal.com → "ProjectPal" |
| 5.2 | Bestaande endpoints zonder auth | ✅ PASS | 401 (geen 500) |
| 5.3 | IQ-Helix-hosts (iqhelix.com e.d.) | ✅ PASS | onaangeroerd, 200, "IQ Helix" |
| 5.4 | Backend `/health/` → `git_sha` | ✅ PASS | `8a04b83f` (compose zet GIT_SHA=PXP_TAG; backendcode = b157a67d) |

---

## 6. Frontend-fixes (release `8a04b83f`) — code-niveau geverifieerd in geserveerde bundle

| # | Fix | Resultaat | Bewijs |
|---|-----|-----------|--------|
| F.1 | Project-header Start/Einddatum in edit-modal | ✅ PASS | `ProjectHeader-CQhLcvys.js`: "End date cannot be before start date" + `start_date` 11× |
| F.2 | Business Case auto-create bij eerste benefit/risk | ✅ PASS | BC-code in entry-bundle; gedekt door ingebakken `VITE_APP_VERSION=8a04b83f` |
| F.3 | Fase-kolom truncatie + tooltip | ✅ PASS | `PlanningTasks-GBQ9vOYE.js`: class `max-w-[11rem]` |

---

## Aftekening

- [x] Alle rijen ✅ PASS, geen ❌
- Uitgevoerd: **2026-10-07**, geautomatiseerde prod-verificatie (teruggedraaide-transactie-harness + code-audit + live Demo Recare-opstelling + bundle-inspectie)
- Nog openstaand (optioneel): handmatige UI-klikflow als Demo Recare op project 126 — de code is bewezen live; de klik-check is een gebruikersactie (login/credential-grens).
- Rollback indien nodig: `PXP_TAG=b157a67d` (images staan lokaal op de host).
