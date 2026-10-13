# Sprint planning — context-aware roadmap

**Owner:** Sami Loukile · **Updated:** 2026-10-13 · **Nominale velocity:** 40 pt / sprint (2 wk)

Zie ook `docs/backlog/ai-context-aware-roadmap.md` voor de thematische roadmap over alle 7 tiers.

---

## Historische sprints (status)

| Sprint | Thema | Status | Live SHA |
|---|---|---|---|
| **Sprint 0** | Baseline live | ✅ live | `06decba5` |
| **Sprint 1** | Context-aware foundation + frontend hooks | ✅ live | — |
| **Sprint 2** | Methodology-aware classification | ✅ live | — |
| **Sprint 3** | Program & Portfolio AI-context | ✅ live | — |
| **Sprint 4** | Methodology-specifieke auto-drafts (Elisa-wow) | ✅ live | — |
| **S4-11** | Team-cascade voor time registration | ✅ live | `58dc6453` → combo |
| **Sprint 5** | Proactieve AI + Team + Dashboard narratives | ✅ live | `23f9dda6` |
| **Sprint 6** | Enterprise readiness: audit, GDPR, encryption, rate-limit | ✅ live | `e7894050` → combo |
| **Combo-prod** | Sprint 6 + S4-11 combo-deploy met migratie-renumber + conftest-shim | ✅ live | **`03c0dd6d`** (= huidige prod) |

---

## Sprint 7 — Resource Management

**Dates:** 2027-01-06 → 2027-01-19 (2 weken) · **Thema:** van team-lid naar bemenste begroting, met kosten-inzicht

### Doel

Nadat Sprint 6 de enterprise-features af heeft gemaakt (encryption, GDPR, audit) en S4-11 de team-cascade heeft toegevoegd, maakt Sprint 7 het "ik voeg iemand toe aan een project" compleet:

1. **Per persoon per project/programma een begroting in uren** (begroot vs actueel)
2. **Timesheet verplichting opt-out** (niet iedereen moet uren schrijven)
3. **Kosten-inzicht** op basis van hourly rate
4. **Resource planning** — wie werkt wanneer op wat (Gantt)
5. **Capacity planning** — overbezetting over projecten heen

### Backlog (40 pt — precies capaciteit)

#### Groep A — Timesheet-required + Uren-budget (S7-01..05, 18 pt)
`feat/s7-timesheet-budget` branch — in-progress parallel agent op basis `03c0dd6d`.

| ID | Titel | Pt | Beschrijving |
|---|---|---|---|
| **S7-01** | `ProjectTeam` / `ProgramTeam` velden | 3 | `timesheet_required: Boolean default=True`, `budgeted_hours: Decimal(8,2) null=True`. Additive-with-default migraties. |
| **S7-02** | UI: switch + urenveld in add-user modal (project + program) | 5 | Bij toevoegen aan team: "Timesheet verplicht?" switch (default aan) en "Begrote uren" input. Cascade zet `budgeted_hours=null` per child-project. |
| **S7-03** | Reports widget "Uren vs budget" + endpoints | 5 | `GET /api/v1/projects/<pk>/time-vs-budget/` + program variant. Per team-lid tabel met begroot/actueel/pct en status (groen<90, geel 90-100, rood >100). |
| **S7-04** | TimeEntry warning bij overschrijding | 2 | Response verrijkt met `budget_warning` object; frontend toast bij save. **Non-blocking** — entry wordt wel opgeslagen. |
| **S7-05** | Tests (15+) | 3 | Defaults, isolation, aggregatie, warning, backward-compat. |

#### Groep B — Cost + Planner + Capacity (S7-06..10, 22 pt)
`feat/s7-cost-planner` branch — in-progress parallel agent op basis `03c0dd6d`.

| ID | Titel | Pt | Beschrijving |
|---|---|---|---|
| **S7-06** | Hourly rate OVERRIDE per team-lid | 3 | `ProjectTeam.hourly_rate` bestaat al; wordt override van Company default. `ProgramTeam.hourly_rate` nieuw veld. UI inpoint in modal met helpertekst "Standaard: €X". |
| **S7-07** | Cost dashboard — begroot × rate = € | 5 | `GET /time-vs-budget-cost/` + widget `CostVsBudgetWidget.tsx`. Gegate op `can_view_costs_for()` (hergebruik permissie, raak niet aan). |
| **S7-08** | Resource planner Gantt per persoon | 8 | Nieuw model `ProjectResourceAllocation(project_team, start, end, hours)` in `execution/`. Read-only Gantt in Sprint 7; drag/resize = Sprint 8. CRUD endpoints voor dialog-based beheer. |
| **S7-09** | Capacity planning — user over alle projecten | 5 | `GET /users/<pk>/capacity/?from=&to=` → totaal allocated vs FTE, met overcommit flag (>100%). Dashboard `UserCapacityDashboard.tsx` met date-range picker + bar chart. |
| **S7-10** | Tests S7-06..09 | 1 | Cost gate, allocation CRUD, capacity date-range, overcommit berekening. |

### Dependencies

```
S7-01 (model) ─┬─ S7-02 (UI)
               ├─ S7-03 (uren-widget) ─── S7-07 (€-widget)
               ├─ S7-04 (warning)
               └─ S7-06 (rate) ────────── S7-07 (€-widget) ─── S7-09 (capacity)
                                                                     │
S7-08 (Gantt) ──── nieuw model: ProjectResourceAllocation ───────────┘
```

### Risks

| Risico | Impact | Mitigatie |
|---|---|---|
| Parallel chat uncommitted work op `backend/projects/models.py` | Merge conflict op `ProjectTeam` velden | Additive-only; combo-rebase pattern (zoals Sprint 6 + S4-11 deploy) |
| S7-08 Gantt scope-creep | Sprint overloop | Read-only in S7; drag/resize naar S8. Als nog groter: trek S7-08 helemaal naar S8. |
| `can_view_costs` gate op S7-07 | Costs leak | Hergebruik bestaande helper van `b157a67d`; nooit permissions.py aanraken. |
| Twee parallel-agents raken dezelfde file (`backend/projects/models.py`) | Rebase conflict | Agent B heeft TODO(combo-rebase) markers; combo-deploy worktree merged beide. |

### Kill-switches

- Als **S7-08 Gantt** te groot blijkt → verplaats naar Sprint 8, vul met **Lessons-learned budget-vergelijking** (3pt: "wat begrotte je laatst, wat werd het echt?").
- Als **parallel chat** problematisch blijft op `projects/models.py` → trek **S7-06** (ProjectTeam rate-UI) naar Sprint 8; houd alleen `ProgramTeam.hourly_rate`.

### Demo-moment (Elisa, einde sprint)

> "Elisa, je kent dit al: iemand toevoegen aan een project. Nu kan je direct zeggen hoeveel uur hij ervoor krijgt, en of hij überhaupt uren moet schrijven. Bij elke tijdregistratie zie je direct of je nog binnen begroting zit. En aan het einde van de week zie je in één scherm welke mensen op welke projecten over budget gaan — in uren én in euro's. En in de Gantt zie je per persoon wanneer hij op welk project zit — zodat je in één oogopslag ziet of iemand overvraagd is."

### Niet in Sprint 7 (expliciet uitgesteld)

- Hard-blocking budget-cap (user bevestigde: warning only)
- Governance (`BoardMember` / `Stakeholder`) budgets (user bevestigde: alleen project/program)
- Email-notificatie bij overschrijding → S8 kandidaat
- Multi-currency
- Drag/resize in Gantt → S8
- Horizon items (semantic chunking, member skills DB, external sources) → S8+

### Deploy-plan

Combo-rebase pattern (zoals Sprint 6 + S4-11):
1. Nieuwe worktree van `03c0dd6d` (= huidige prod)
2. Cherry-pick commits van `feat/s7-timesheet-budget` (S7-01..05)
3. Cherry-pick commits van `feat/s7-cost-planner` (S7-06..10)
4. Resolve TODO(combo-rebase) markers in S7-06..10 (reuse S7-03's helpers)
5. Resolve migratie-nummerconflicten
6. Run tests (incl. backward-compat)
7. Push combo-branch naar beide remotes
8. Hetzner backup-gate → source-stream → build → compose up --pull never
9. Verify `/health/` git_sha + nieuwe endpoints 401

---

## Horizon (Sprint 8+)

| Thema | Items | Punten |
|---|---|---|
| Semantic chunking + embeddings | Replace "full text in prompt" met vector-retrieval; nieuwe infra | 20+ |
| Cross-project context | Tenant-opt-in: project leert van vorige projecten | 10 |
| External sources | SharePoint/Dropbox-connect i.p.v. upload | 10 |
| Member skills DB | `UserSkill` model + skill-detection uit CV's + matching UI | 15 |
| Multi-language docs | NL+FR+EN docs, taal-detect per chunk | 10 |
| TenantProjectScenario (Pad Y) | Tenants definiëren eigen project-types met methodology | 15 |
| Drag/resize Gantt + Lessons-learned budget-vergelijking | S7-overflow | 10 |
| Email bij budget-overschrijding | — | 3 |

---

## Capaciteit en aannames

| Aanname | Waarde |
|---|---|
| Dev-FTE | 1 (sami) + AI pair |
| Sprint-duur | 2 weken |
| Nominale velocity | 40 pt / sprint |
| Deploy-ritme | Mid-sprint + eind-sprint (combo-rebase pattern) |
| Elisa feedback-sessie | Elke sprint (mid + eind) |
| Buffer | 10% elke sprint voor onvoorziene bugs |
| Live customers | `zanjabil@inclufy.com` (`13:00`), Recare (demo-recare@) |
