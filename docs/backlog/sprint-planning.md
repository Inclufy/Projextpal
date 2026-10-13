# ProjeXtPal — Sprint planning context-aware roadmap

**Start:** 2026-10-13 · **Horizon:** 2026-10-13 → 2027-03-13 (6 sprints van 2 weken + buffer)
**Team:** sami@inclufy.com + AI pair (Claude)
**Velocity-aanname:** ~40 points per sprint (S=1 · M=3 · L=8), 2 weken, 1 dev-FTE equivalent
**Definition of done:** merged op master-combo-lineage, backend/frontend tests groen, live op prod via Hetzner-deploy, Elisa kan het valideren

---

## Sprint 0 (vandaag) — **AF**

**Dates:** 2026-10-13 (één dag) · **Status:** 🟢 LIVE op `06decba5`

| Item | Punten | Status |
|---|---|---|
| Elisa feedback-matrix 8 items | — | ✓ |
| Sprint 1+2 Elisa backlog (model-id, UX, taal, token-meter, doc-upload, Co-pilot tools, AI-context) | — | ✓ |
| Unified wizard (modal → `?ai=1`) | — | ✓ |
| Aanbesteding scenario | — | ✓ |
| Cleanup dead state | — | ✓ |
| Regressie-fix combo-deploy (Ask Co-pilot button terug) | — | ✓ |
| **Sprint 1 start:** backend wire-ins voor Ask Co-pilot, Coach, Risk-Mitigation, Risk-Forecast, Governance-AI | — | ✓ (in MR #35) |
| Tests `test_ai_context_helpers.py` | — | ✓ 14/14 |
| MR #35 open | — | ✓ |

**Nog niet gedeployed vandaag:** MR #35 (wacht op merge). Als die vandaag merged → sprint 0 → sprint 1 is zonder gap.

---

## Sprint 1 — Context-aware foundation + frontend hooks

**Dates:** 2026-10-14 → 2026-10-27 · **Deliverable:** context-aware op élke bestaande AI-call, inclusief frontend die project_id meestuurt waar logisch, in prod

### Backlog (~34 punten)

| ID | Titel | Punten | Beschrijving | Afhankelijkheid |
|---|---|---|---|---|
| S1-01 | ✅ Merge MR #35 + deploy naar prod | 1 | Backend wire-ins live | MR #35 |
| S1-02 | AICommander project-context toggle | 3 | Als Commander open is op project-pagina → send \`project_id\` | — |
| S1-03 | Context-indicator in Ask Co-pilot header | 3 | "AI heeft context van [N] documenten op dit project" badge als er ProjectAIContext is | S1-01 |
| S1-04 | Reporting: PRINCE2 Highlight Report accepteert \`project_id\` | 3 | \`governance/ai_reports.generate_report(..., project_id=)\` passes ProjectAIContext naar het prompt | S1-01 |
| S1-05 | Reporting: Status Report project-aware | 3 | Idem voor \`status-report\` template | S1-04 |
| S1-06 | Frontend: \`ReportsPage.tsx\` stuurt project_id mee | 3 | Wanneer report-type project-scoped is | S1-04 |
| S1-07 | Full extracted_text in ProjectAIContext i.p.v. preview | 2 | Backend returned nu alleen 1500-char preview; sla volledige tekst op bij create | — |
| S1-08 | Deliverables + suggested_milestones persistance | 5 | Na project-create, als user docs uploadte, zet suggested_milestones om in echte Milestone rows (optional, confirm UI) | — |
| S1-09 | Scope- + budget-extraction naar wizard velden | 5 | Backend \`plan-from-documents\` extraheert ook \`suggested_budget_eur\`, \`suggested_start_date\`, \`suggested_duration_weeks\` → frontend pre-fills meer velden | — |
| S1-10 | Tests: wire-ins integration tests (Ask Co-pilot bot, Project Coach) | 5 | Mock LLM, assert dat prompt de context bevat | — |
| S1-11 | Elisa validation sessie | 1 | Call met Elisa om de 5 context-aware surfaces te laten zien | S1-01, S1-06 |

### Risks
- **Reporting:** 14 report-prompts gebruiken dezelfde \`generate_report()\`. Als sommige NIET project-scoped zijn → vereist een "which reports read ProjectAIContext" matrix.
- **PRINCE2 Highlight Report PPTX-export:** gebruikt een narrative-field. Als die veld-structuur wijzigt → export kan breken.

---

## Sprint 2 — Methodology-aware classification

**Dates:** 2026-10-28 → 2026-11-10 · **Deliverable:** AI gebruikt uploaded docs om methodologie te classificeren

### Backlog (~38 punten)

| ID | Titel | Punten | Beschrijving |
|---|---|---|---|
| S2-01 | \`tailoring.classify_with_llm\` leest ProjectAIContext | 3 | Als er context is → gebruikt het die naast free-text description |
| S2-02 | AI Methodology Advisor pre-vult vanuit docs | 3 | Als wizard-stap 2 (Documents) is gebruikt → stap 1 (Advisor) toont pre-gevulde suggestie |
| S2-03 | \`plan-from-documents\` returned \`suggested_methodology\` + \`confidence\` | 5 | Backend LLM prompt uitgebreid |
| S2-04 | Documents-stap toont "AI schat methodologie in: [X]" chip | 3 | Frontend UX |
| S2-05 | Project Doctor leest ProjectAIContext voor doc-vs-reality checks | 5 | "Tender zegt X, project heeft Y niet" |
| S2-06 | Methodology-course route uit docs | 3 | Suggest Academy course based on doc-topics |
| S2-07 | ProjectCoach "wat zegt de tender over X" preset | 3 | Button in de Coach-sidebar met tender-specific prompts |
| S2-08 | AI tool \`parse_and_create_project_structure\` leest ProjectAIContext | 5 | Als Ask Co-pilot zegt "maak taken uit tender" → tool pakt text uit context i.p.v. van user |
| S2-09 | Tests + regressie | 5 | Context-sanity in alle methodology surfaces |
| S2-10 | Deploy + Elisa validation | 3 | Mid-sprint deploy halverwege |

### Risks
- **Classify-regression:** als keyword-based classify al goed werkt voor doorsnee projecten, kan doc-based output die uitschakelen. Mitigation: A/B-flag.

---

## Sprint 3 — Program & Portfolio context models

**Dates:** 2026-11-11 → 2026-11-24 · **Deliverable:** \`ProgramAIContext\` + \`PortfolioAIContext\` modellen + UI + helper-extensie

### Backlog (~42 punten)

| ID | Titel | Punten | Beschrijving |
|---|---|---|---|
| S3-01 | \`ProgramAIContext\` model + migratie | 2 | Zelfde patroon als ProjectAIContext |
| S3-02 | \`PortfolioAIContext\` model + migratie | 2 | Idem |
| S3-03 | Endpoints: GET/POST \`/api/v1/programs/<id>/ai-context/\` | 3 | Mirror van project-endpoint |
| S3-04 | Endpoints: GET/POST \`/api/v1/governance/portfolios/<id>/ai-context/\` | 3 | Idem |
| S3-05 | \`core/ai_context_helpers.get_program_context_prefix\` | 2 | + \`get_portfolio_context_prefix\` |
| S3-06 | Program-detail page: upload-UI voor program-brede docs | 5 | Component + modal |
| S3-07 | Portfolio-detail page: upload-UI | 5 | Idem |
| S3-08 | Program AI Advisor leest ProgramAIContext | 3 | — |
| S3-09 | \`governance/views.ai_generate_text\` accepteert ook \`program_id\` + \`portfolio_id\` | 3 | Multi-level context in één call |
| S3-10 | Program → multi-project context aggregation (optional) | 5 | AI leest ProgramAIContext én optioneel samenvatting van onderliggende project-contexten |
| S3-11 | MSP tranche AI-draft POC | 5 | Benefits Map pre-vullen uit ProgramAIContext |
| S3-12 | Tests + migration-dry-run + deploy | 4 | Backup gate verplicht |

### Risks
- **Twee nieuwe modellen** → data-guardian backup verplicht
- **Multi-level prompt budget:** 3× 8 000 chars = 24 000 chars kan Anthropic prijzig maken. Mitigation: aparte caps per niveau

---

## Sprint 4 — Methodology-specifieke auto-drafts (Elisa-wow moment)

**Dates:** 2026-11-25 → 2026-12-08 · **Deliverable:** 2-click Business Case + Project Brief + Scrum Vision uit tender-docs

### Backlog (~44 punten)

| ID | Titel | Punten | Beschrijving |
|---|---|---|---|
| S4-01 | PRINCE2 Business Case auto-draft knop | 8 | Backend endpoint + frontend knop op BC-pagina — vult 6 velden uit ProjectAIContext |
| S4-02 | PRINCE2 Project Brief auto-draft | 5 | Zelfde patroon, 4 velden |
| S4-03 | Scrum Vision + eerste 10-20 backlog items uit docs | 8 | Vereist methodology-specifieke prompt + Scrum endpoint uitbreiding |
| S4-04 | Kanban swimlane-suggesties | 5 | AI klassificeert deliverables → swimlane-namen |
| S4-05 | LSS DMAIC "Define" fase auto-draft | 5 | Problem statement + SIPOC uit docs |
| S4-06 | Waterfall phase-breakdown uit RFP-timing | 5 | AI extraheert data uit docs → voorgestelde phases + dates |
| S4-07 | Document-driven milestone-generation knop op bestaande projecten | 3 | \`/planning/milestones\` → "Genereer uit documenten" |
| S4-08 | Tests + deploy + Elisa demo | 5 | Dedicated demo-sessie met Elisa om de Business Case auto-draft te laten zien |

### Risks
- **Methodology-prompt engineering:** elke methodology heeft eigen velden → 6 nieuwe prompt-templates. Houd ze consistent via shared template-wrapper.
- **Verwachtings-management:** auto-drafts zijn drafts. UX moet duidelijk "AI-concept, review verplicht" tonen.

---

## Sprint 5 — Proactieve AI + Team + Dashboard narratives

**Dates:** 2026-12-09 → 2026-12-22 · **Deliverable:** AI gebruikt context proactief, team-match, dashboard-narratives

### Backlog (~40 punten)

| ID | Titel | Punten | Beschrijving |
|---|---|---|---|
| S5-01 | Compliance-keyword scan + auto-flags | 5 | AVG, ISO 27001, aanbestedingswet detection |
| S5-02 | Auto-tag project op create | 3 | 3-5 tags uit ProjectAIContext |
| S5-03 | Status report AI-draft | 5 | Pre-vullen next status-report |
| S5-04 | Dependency/risk sniff uit docs | 5 | LLM scant op niet-benoemde risico's |
| S5-05 | "Wat zegt de tender over X?" preset-vraag | 3 | Ask Co-pilot sidebar snelknoppen |
| S5-06 | Team-match suggestie "wie past bij dit project" | 5 | AI leest ProjectAIContext + past projecten per member → ranking |
| S5-07 | Onboarding tour voor nieuwe team member | 3 | "Welkom in [project] — dit project gaat over [uit context]" |
| S5-08 | Dashboard narrative widget | 5 | Executive summary onder KPI's met context + status |
| S5-09 | Meeting agenda AI-draft | 3 | Agenda uit project + portfolio context + openstaande decisions |
| S5-10 | Deploy + eind-sprint demo | 3 | — |

### Risks
- **Compliance-flags:** false positives/negatives kunnen juridische consequenties hebben. Mitigation: UI zegt "suggestie — bevestigen vereist".
- **Team-match:** vereist member-skill data die er nog niet is. Fallback: alleen "past projecten" matching.

---

## Sprint 6 — Enterprise readiness: audit, GDPR, encryption

**Dates:** 2026-12-23 → 2027-01-05 (korte feestdag-sprint) · **Deliverable:** context-feature is enterprise-ready

### Backlog (~32 punten, reduced capacity)

| ID | Titel | Punten | Beschrijving |
|---|---|---|---|
| S6-01 | \`AIContextAccessLog\` model + wire-in in helper | 5 | Elke call registreert (user, context_id, surface, chars, ts) |
| S6-02 | GDPR delete: cascade bij Project-delete + explicit "verwijder context" knop | 3 | — |
| S6-03 | Encryption at rest voor \`extracted_text\` via \`secret_field\` | 5 | Migratie: re-encrypt bestaande rijen |
| S6-04 | Per-document toggle i.p.v. project-wide | 5 | Nieuw veld \`doc.enabled\` in \`source_files\` JSON |
| S6-05 | Rate limiting context-including AI-calls | 3 | Per project per uur cap |
| S6-06 | \`TenantAIFeatureFlags\` model + admin UI | 5 | Tenants kunnen context-feature uitzetten voor compliance-conservatieve klanten |
| S6-07 | Context-visualisatie per response | 3 | UI badge onder elk AI-antwoord: "gebruikte N documenten" |
| S6-08 | Compliance audit documentation (DPIA assist) | 3 | Doc voor zorg/overheid klanten |

### Risks
- **Encryption migratie** op bestaande data = destructief indien verkeerd. Dubbele backup-gate.
- **Feestdagen:** sprint capaciteit lager, scope iets reduceren.

---

## Sprint 7+ — Platform / horizon

**Dates:** 2027-01-06 → open · **Thema:** semantic chunking, cross-project, external sources

### Backlog (indicatief)

| Thema | Items | Punten |
|---|---|---|
| Semantic chunking + embeddings | Replace "full text in prompt" met vector-retrieval; nieuwe infra | 20+ |
| Cross-project context | Tenant-opt-in: project leert van vorige projecten | 10 |
| External sources | SharePoint/Dropbox-connect i.p.v. upload | 10 |
| Member skills DB | \`UserSkill\` model + skill-detection uit CV's + matching UI | 15 |
| TenantProjectScenario (Pad Y) | Tenants definiëren eigen project-types met voorgedefinieerde methodology | 15 |
| Multi-language docs | NL+FR+EN docs, taal-detect per chunk | 10 |

---

## Capaciteit en aannames

| Aanname | Waarde |
|---|---|
| Dev-FTE | 1 (sami) + AI pair |
| Sprint-duur | 2 weken |
| Nominale velocity | 40 punten/sprint |
| Vandaag's velocity (Sprint 0 single day) | ~60 punten in één dag = outlier door AI pair + stacking van reeds-ontworpen fixes |
| Deploy-ritme | Mid-sprint + eind-sprint |
| Elisa feedback-sessie | Elke sprint (mid + eind) |
| Buffer | 10% elke sprint voor onvoorziene bugs |

---

## Dependencies tussen sprints

```
Sprint 0 (done)
    └── Sprint 1 (context-wire-ins live) ─┐
                                           ├── Sprint 2 (methodology aware)
                                           │       └── Sprint 4 (methodology drafts)
                                           │
                                           └── Sprint 3 (Program/Portfolio models) ─┐
                                                                                     ├── Sprint 4 (drafts)
                                                                                     └── Sprint 5 (team / narratives)
                                                                                            └── Sprint 6 (enterprise ready)
                                                                                                    └── Sprint 7+ (horizon)
```

- **Sprint 2 kan parallel met Sprint 3** als capaciteit toeneemt (hire extra dev)
- **Sprint 4 wacht op zowel Sprint 2 (methodology awareness) als Sprint 3 (programs/portfolios voor PI planning)** — strikt niet, maar aanbevolen
- **Sprint 6 wacht op Sprint 1-5** omdat enterprise-features alleen zinvol zijn als er genoeg te auditen is

---

## Prioritering en "kill-switch" scenario's

### Als tijd op raakt na Sprint 2
- Breng alleen **S4-01 PRINCE2 BC auto-draft** naar voren uit Sprint 4 → nieuwe demo-wow voor Elisa in week 3-4
- Skip Sprint 3 (Program/Portfolio) voor eerste klant-release

### Als Elisa iets anders vraagt
- Elke sprint heeft **10% buffer** voor Elisa feedback-reacties
- Als een feedback-item een sprint-blocker is → ruilt met laagste-priority ticket in de huidige sprint

### Als een deploy fout gaat
- Rollback procedure in CLAUDE.md §3 is paraat (PXP_TAG=<previous-shortsha>)
- Backups elke 3 uur + voor elke migratie manueel

---

## Review- en demo-ritme

| Sprint | Mid-sprint demo | Eind-sprint demo |
|---|---|---|
| 1 | 2026-10-20 — context-badges + highlight-report | 2026-10-27 — Elisa valideert alle 5 surfaces |
| 2 | 2026-11-03 — methodology-chip in wizard | 2026-11-10 — tender → correcte methodology-suggestie |
| 3 | 2026-11-17 — ProgramAIContext upload-UI | 2026-11-24 — Program-level AI generate werkt |
| 4 | 2026-12-01 — PRINCE2 BC auto-draft POC | 2026-12-08 — **Elisa Business Case uit tender demo** |
| 5 | 2026-12-15 — team-match + dashboard narrative | 2026-12-22 — status-report AI-draft |
| 6 | 2026-12-30 — audit log + GDPR delete | 2027-01-05 — compliance ready |

---

## Metrics per sprint

| Sprint | Primary metric |
|---|---|
| 1 | % AI-responses that include ProjectAIContext (target ≥ 70% waar beschikbaar) |
| 2 | % projecten waar methodology-suggestie uit docs komt (target ≥ 40%) |
| 3 | # tenants met Program/Portfolio context uploads (target ≥ 2) |
| 4 | Tijd tot Business Case draft (target ≤ 30 sec, 5 min human-review) |
| 5 | % projecten met compliance-flags (realistisch target) |
| 6 | 0 security incidents context-related; audit log complete |
