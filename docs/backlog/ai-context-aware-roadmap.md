# ProjeXtPal — Context-aware roadmap

**Date:** 2026-10-13
**Author:** sami@inclufy.com
**Horizon:** 4-6 sprints

---

## Vision — ProjeXtPal is integraal context-aware

Elke klant die documenten (tenders, briefs, specs) uploadt aan een project moet die context terugzien in **elke** AI-interactie binnen dat project — niet alleen in de één feature waar hij hem opsloeg. Daarnaast moet ProjeXtPal breder leren van wat er in het project zit: metadata, status, team, risico's, documenten, geschiedenis — en dat consistent gebruiken in planning, coaching, analyses en rapportages.

**Operationeel principe:** één `ProjectAIContext` opslag (per project 1 tabel-rij) + één gedeelde helper `get_project_context_prefix()` die elke AI-call aanroept zodra er een project in scope is. Lekvrij (tenant-check), stil (nooit falen), gecached (TTL in Redis later).

---

## Huidige staat

| Surface | Nu context-aware? | Branch waar wired | Live op prod? |
|---|---|---|---|
| Plan with AI | ✅ | Sprint 2 (gemerged, live) | ✅ `06decba5` |
| Project Doctor | n.v.t. (rule-based) | — | — |
| Ask Co-pilot | 🟡 **nu in `feat/ai-context-aware-all-surfaces`** | pending MR | — |
| Project Coach | 🟡 idem | pending MR | — |
| Risk Mitigation | 🟡 idem | pending MR | — |
| Risk Forecast | 🟡 idem | pending MR | — |
| Governance AI generate | 🟡 idem (project_id uit body) | pending MR | — |
| Alles overig | ❌ | — | — |

---

## Sprint 1 — Tier A afronden (**nu**)

**Doel:** elke bestaande project-scoped LLM-call leest ProjectAIContext. Branch `feat/ai-context-aware-all-surfaces` is al deels gevuld (backend wire-ins `12873583`). Resterend werk:

| Item | File | Werk | Status |
|---|---|---|---|
| Ask Co-pilot context-aware | `bot/views.py` | ✅ wired | commit `12873583` |
| Project Coach context-aware | `projects/coach_views.py` | ✅ wired | commit `12873583` |
| Risk Mitigation context-aware | `projects/ai_risk_mitigation.py` + 2× `views.py` | ✅ wired | commit `12873583` |
| Risk Forecast context-aware | `projects/risk_forecast.py` + caller | ✅ wired | commit `12873583` |
| Governance AI generate | `governance/views.py` | ✅ wired | commit `12873583` |
| **Frontend**: send `project_id` from AI Advisor / AI Methodology helper when editing an existing project | `CreateProject.tsx`, `AICopilotSidebar.tsx`, `AISmartHelper.tsx` | Pending | — |
| **Backend tests**: context prefix helper tests + per-wire-in tenant-leak tests | `tests/test_ai_context_helpers.py` | Pending | — |
| **Deploy** | combo-branch van `06decba5` → + Sprint 1 | 15 min | — |

**Acceptatiecriteria Sprint 1:**
- Op een project waar documenten zijn geüpload met `enabled=True`, geven Ask Co-pilot, Coach, Risk Mitigation, Risk Forecast, Governance AI generate antwoorden die refereren aan die documenten.
- Cross-tenant check: een user die niet bij het project kan, ziet géén content lekken.
- Als `enabled=False` op de toggle → geen context gebruikt (al gebouwd op `ProjectAIContext.enabled`).
- Alle 5 surfaces blijven werken zonder context (fallback = helper geeft lege string).

---

## Sprint 2 — Tier A frontend-wiring + Governance Reports

**Doel:** elke frontend-caller die een project in scope heeft stuurt `project_id` mee, en de 14 governance report-prompts worden ook context-bewust waar dat past.

| Item | Werk |
|---|---|
| `AICopilotSidebar.tsx` → send `project_id` wanneer de user op een project-pagina zit | S |
| `AiPlanDialog.tsx` → gebruikt al via backend, geen frontend change | — |
| `AISmartHelper.tsx` → send `project_id` als component in project-context ingebed is | S |
| `ReportsPage.tsx` → voor project-scoped reports (highlight/status) `project_id` meesturen | S |
| `governance/ai_reports.py` → `generate_report(..., project_id=)` + context prefix in system prompt van project-scoped templates (PRINCE2 highlight, status report) | M |
| `AICommander.tsx` → als Commander op project zit, project-aware zijn | S |
| **Backend**: tool `parse_and_create_project_structure` leest ProjectAIContext als `project_id` meekomt (nu krijgt de LLM alleen de free-text description van user) | M |
| **Tests** | S |

---

## Sprint 3 — Tier B: methodology awareness

**Doel:** context beïnvloedt niet alleen antwoorden maar ook keuzes.

| Item | Werk |
|---|---|
| `tailoring.classify_with_llm` leest documenten als die er zijn (naast free-text) → preciezere methodology-aanbeveling | M |
| AI Methodology Advisor pre-vult uit docs als die bij project upload horen | S |
| `plan-from-documents` endpoint reorganiseren: naast concept-plan óók `suggested_methodology` + `confidence` → wizard kan direct methodology-suggestie tonen | S |
| Documents-stap in wizard krijgt een "AI schat methodologie in" chip die uit de extractie-respons komt | S |
| Project Doctor leest documenten als lightweight check: "er staat in de tender X maar het project heeft Y niet" → signaleer discrepantie | M |

---

## Sprint 4 — Tier C deel 1: scope & requirements

**Doel:** context wordt navigeerbaar; de user ziet wat de AI heeft begrepen uit de documenten.

| Item | Werk |
|---|---|
| **Document-driven milestone/task generation knop** op bestaande projecten (`/projects/:id/planning/milestones`) → "Genereer uit documenten" leest ProjectAIContext.extracted_text + roept plan_chat aan met die context | M |
| **Scope & requirements view** (`/projects/:id/foundation/documents`): tab die opgeslagen docs + extraheerde deliverables + scope_in/out als checklist toont | M |
| **Document re-upload** in bestaand project (nu alleen tijdens wizard) → endpoint accepteert nieuwe PDFs en update ProjectAIContext | S |
| **Toggle on/off** van context per project vanuit die view | S |
| **View raw extracted text** met "Edit"-knop zodat PM het kan aanpassen voordat AI het gebruikt | S |

---

## Sprint 5 — Tier C deel 2: proactieve AI

**Doel:** context wordt proactief gebruikt, niet alleen reactief op user-vragen.

| Item | Werk |
|---|---|
| **Compliance-keyword detectie**: scan ProjectAIContext.extracted_text op "AVG", "ISO 27001", "aanbestedingswet", "Wkkgz" enz. → zet automatisch `project.compliance_flags` + toon banner "Deze opdracht raakt AVG, overweeg compliance-track" | M |
| **Auto-tag**: LLM genereert 3-5 tags uit documenten op create | S |
| **Status report AI draft**: next status-report voorvult: "Op basis van de milestones + uploaded brief: 'Lopend conform planning, aandachtspunten X,Y uit RFP sectie 4.2'" | M |
| **Charter sections auto-draft**: BC / Project Brief velden pre-vullen vanuit docs + methodology template | M |
| **Dependency/risk sniff**: LLM scant extracted text op afhankelijkheden/risico's die user zelf nog niet benoemde → suggesties in Risk-tab | M |
| **"Wat zegt de tender over X?" vraag-knop** als preset in Ask Co-pilot sidebar | S |

---

## Sprint 6 — Compliance, audit, enterprise

**Doel:** context-aware ProjeXtPal is enterprise-ready.

| Item | Werk |
|---|---|
| **Audit trail** per context-gebruik: `AIContextAccessLog(project, user, surface, ts, chars_used)` → compliance kan zien welke user welke doc-content via welke AI heeft gezien | M |
| **GDPR**: expliciete "verwijder context" knop + bij project-delete cascading delete van ProjectAIContext | S |
| **Context-visualisatie per response**: UI badge "AI gebruikte 3 uploaded documenten (12k chars)" onder elk antwoord | S |
| **Per-document toggle** i.p.v. project-wide (sommige docs mogen in AI, andere niet — bv. interne notities) | M |
| **Encryption at rest**: `extracted_text` encrypten via `core/secret_field.py` patroon | M |
| **Rate limiting**: cap aantal AI-calls per project per uur die ProjectAIContext meekrijgen (prevent cost blowout bij grote tenders) | S |
| **Tenant-controle paneel**: admin kan context-feature voor hele company uit, voor compliance-conservatieve klanten | S |

---

## Horizon (Sprint 7+) — platform

| Thema | Items |
|---|---|
| **Multi-tenant templates** | Een tenant kan eigen `TenantProjectScenario` definiëren mét default-documenten → nieuwe projecten starten met voorbeeldcontext (vorig voorstel Pad Y) |
| **Cross-project context** | Een project "Jeugdzorg Wmo 2027" leert van vorige "Jeugdzorg Wmo 2024" van dezelfde tenant (optional) |
| **External sources** | ProjectAIContext kan ook een live SharePoint/Dropbox URL zijn i.p.v. upload |
| **Semantic search** | Chunks + embeddings per uploaded doc, retrieval i.p.v. hele tekst in prompt |
| **Multi-language docs** | Context in NL + FR + EN, taal-detect per chunk |

---

## Operationele principes (gelden voor élke sprint)

1. **Lekvrij**: elke nieuwe wire-in gaat door `get_project_context_prefix()` die zelf de `accessible_project_ids()` check doet.
2. **Stil falen**: alle wire-ins zijn in try/except — ProjectAIContext mag een LLM-call nooit laten crashen.
3. **Token-budget bewust**: elke call max 8 000 chars. Als meer gewenst → aparte retrieval (Sprint 7).
4. **Taal-aware**: helper neemt `language` arg → NL/EN/FR label (al in `core/i18n_ai.py`).
5. **Gratis in demo-fallback**: context moet ook werken als er GEEN LLM-key is (fallback plans krijgen dezelfde context in template-rendering waar mogelijk).
6. **Monitoring**: Sprint 6 adds `AIContextAccessLog` zodat we weten wat er gebeurt.
7. **Niets permanent zonder user-approval**: context verwerven = upload + toggle. User houdt controle.

---

## Deploy-ritme

- Sprint 1 → mini-deploy zodra het klaar is (combo-branch patroon zoals vandaag)
- Sprint 2–3 → wekelijks
- Sprint 4+ → tweewekelijks
- Elke deploy: data-guardian backup + git_sha verify + rollback-plan paraat

---

## Metrics om succes te meten

- **% projecten met uploaded context > 0 chars** (adoption)
- **Avg context-chars gebruikt per AI-call per surface** (coverage)
- **Delta in user satisfaction op AI-antwoorden** (A/B test context on/off)
- **Cross-tenant context-lek incidents = 0** (security, blocking metric)

---

# Bredere scope: context voorbij een enkel project

Context is nu één-op-één met `Project`. Maar ProjeXtPal heeft meerdere scope-niveaus die elk hun eigen documenten en AI-context kunnen hebben. Hieronder per niveau wat **nu** en wat **zou kunnen**.

## 1. Program-niveau

**Nu:** een `Program` bevat meerdere projecten. Program-level AI (program report generator, program risk roll-up) heeft geen eigen context en kan ook niet bij de context van onderliggende projecten.

**Impact / mogelijkheden:**

| Feature | Hoe context helpt |
|---|---|
| **ProgramAIContext** (nieuw model, 1-op-1 met `Program`) | Programma-brede documenten (program charter, kaderstelling, meerjarenplan, financiering-overeenkomst) |
| **Program AI generate** (zoals project AI generate maar scoped op program) | Context-aware antwoorden op programma-vragen |
| **Risk roll-up** | AI die risico's samenvoegt kan refereren aan program-brede documenten + project-specifieke contexten tegelijk |
| **MSP / PMI / P2-Programme / SAFe artefacten** | Benefits Map, Blueprint, Vision — AI pre-vult uit uploaded program-brede strategisch plan |
| **Cross-project insight** | "In context van programma X: hoe hangt project A samen met B?" — AI leest beide project-contexten + program-context |
| **Program Board meeting agenda** | Pre-vult op basis van: program charter + alle onderliggende project status |

**Sprint-mapping:**
- **Sprint 4 (nieuw subitem):** `ProgramAIContext` model + migratie + upload-UI in Program-view
- **Sprint 4:** Program AI generate wire-in (zelfde helper, nu voor programs)
- **Sprint 5:** MSP/PMI/P2-Programme context-aware artifact drafting

## 2. Governance / Portfolio-niveau

**Nu:** governance heeft Portfolios, Boards, Stakeholders, Decisions, Meetings. Governance AI generate werkt endpoint-based maar is nog niet context-bewust. Portfolio-brede documenten (strategisch plan, portfolio-charter) worden nergens vastgelegd.

**Impact / mogelijkheden:**

| Feature | Hoe context helpt |
|---|---|
| **PortfolioAIContext** (nieuw, 1-op-1 met `Portfolio`) | Strategisch plan, portfolio-charter, meerjarenbegroting |
| **Decision drafting** | "Draft een decision-tekst voor dit agendapunt" → AI gebruikt meeting-notulen + onderliggende project-context |
| **Meeting agenda** | Agenda gegenereerd met context van portfolio-level strategie + per-project decisions-needed |
| **Stakeholder analysis** | Power/interest matrix suggereren op basis van portfolio-strategie + project-contexten |
| **Portfolio dashboard narrative** | Executive summary die écht leest alsof iemand ALLES gelezen heeft |
| **Governance report (14 types)** | Reports zoals "Portfolio health report", "Executive summary" krijgen context uit portfolio + alle onderliggende projecten |

**Nieuw model-ontwerp:** óf per-level separate contexts (`PortfolioAIContext`, `ProgramAIContext`, `ProjectAIContext`), óf generiek `EntityAIContext` met `GenericForeignKey`. Het laatste is DRY-er maar minder expressief. Aanbevolen: **separate models** omdat elk een iets andere semantiek heeft (portfolio = strategie-docs, program = tranche-plan, project = tender/brief).

**Sprint-mapping:**
- **Sprint 4:** PortfolioAIContext model + upload-UI
- **Sprint 4:** `generate_report()` in `ai_reports.py` leest Portfolio/Program/Project context op basis van wat de report-id vereist
- **Sprint 5:** Decision drafting + meeting agenda context-aware

## 3. Reporting

**Nu:** 14 report-templates in `REPORT_PROMPTS` (portfolio-analysis, executive-summary, prince2-highlight, status-report, enz.). Elk krijgt alleen gestructureerde `context_data` (counts, lijstjes). Geen tekstuele context.

**Impact / mogelijkheden:**

| Report-type | Context die zou helpen |
|---|---|
| Portfolio analysis | PortfolioAIContext (strategisch plan) |
| Executive summary | Portfolio + top-3 kritische projecten hun ProjectAIContext (summary van brief) |
| PRINCE2 Highlight Report | Specifieke project-context — brief + Business Case extract |
| Status report | ProjectAIContext + recente milestones status |
| Risk register report | Project-context waarom bepaalde risico's relevant zijn |
| Program health report | ProgramAIContext + alle onderliggende project healthfactoren |
| Benefits realization report | ProgramAIContext.benefits_map + actual metrics |

**Reporting-exports:**
- PRINCE2 Highlight Report **PPTX export** gebruikt nu alleen numerieke data — met context kan de "Narrative" sectie veel rijker.
- Executive summary PDF idem.

**Sprint-mapping:**
- **Sprint 2:** project-scoped reports (highlight, status) context-aware
- **Sprint 4:** portfolio/program reports context-aware (vereist Portfolio/ProgramAIContext uit Sprint 4)

## 4. Team / People

**Nu:** team members, roles, invitations. Niet AI-aware. Geen eigen context.

**Impact / mogelijkheden:**

| Feature | Hoe context helpt |
|---|---|
| **Project team-match suggestie** | "Welke team members passen bij dit project?" — AI leest project-context + members' past projects → suggesties |
| **Onboarding tour voor nieuwe member** | "Welkom in project X. Deze opdracht gaat over [uit ProjectAIContext]. Jouw rol is [X] met focus op [Y]" |
| **Role gap-analyse** | "Op basis van de tender heb je iemand nodig die kan X (bv. SSO/Azure, FHIR, …) — wie in jouw team heeft dat?" (vereist member-skills db later) |
| **Capacity planning** | "Deze opdracht is Q1 2027 kritiek — wie heeft dan capaciteit?" |
| **Stakeholder RACI** | AI stelt RACI voor op basis van rollen + project-context eisen |

**Member-level context:**
- `UserAIContext`? Over-engineered — member-skills horen in een `UserSkill` tabel, niet in free-text context. Later.

**Sprint-mapping:**
- **Sprint 5:** team-match suggestie + onboarding tour
- **Sprint 6:** RACI drafting
- **Sprint 7+:** member-skills + capacity (vereist nieuwe modellen, veel breder)

## 5. Methodology-specifieke areas

**Nu:** elke methodologie heeft eigen pagina's (PRINCE2 Business Case, Scrum backlog, Kanban board, SAFe PI, MSP tranches). AI-support per methodologie is zeer beperkt.

**Impact / mogelijkheden:**

| Methodology-feature | Hoe context helpt |
|---|---|
| **PRINCE2 Business Case auto-draft** | Executive summary + reasons + benefits + risks pre-vullen uit ProjectAIContext (tender context) |
| **PRINCE2 Project Brief auto-draft** | Same |
| **Scrum Product Vision + Backlog seed** | Vision statement uit docs, eerste 10-20 backlog items uit deliverables |
| **Kanban swimlanes** | AI stelt swimlane-indeling voor op basis van doc-content ("Backend", "Frontend", "Compliance") |
| **SAFe PI objectives** | PI objectives drafting uit ProgramAIContext + ProjectAIContext per team |
| **MSP tranches** | Tranche-indeling + benefits-mapping uit ProgramAIContext |
| **LSS DMAIC Define** | Problem statement uit docs, SIPOC voorstel |
| **Waterfall phase breakdown** | Phases + gates uit RFP-timing |

**Sprint-mapping:**
- **Sprint 5:** PRINCE2 BC + Project Brief auto-draft (hoog waarde voor Elisa)
- **Sprint 5:** Scrum backlog seed
- **Sprint 6:** Overige methodology-artefacten

## 6. Communication / Collaboration

**Nu:** meetings, status reports, direct messages. AI minutes extraction bestaat.

**Impact / mogelijkheden:**

| Feature | Hoe context helpt |
|---|---|
| **Meeting minutes AI extract** | Al bestaand, nog niet context-aware — meeting-notulen correleren aan project-context |
| **Status report draft** | Zoals eerder genoemd — context + afgevinkte milestones + risico's → compleet draft |
| **Comment-reply suggestions** | AI stelt comment-replies voor op basis van project-context |
| **Notification summaries** | "Jouw dagelijkse digest voor project X" samenvat op basis van context + activiteit |

## 7. Analytics / Dashboards

**Nu:** analytics overview, project dashboards. Numerieke KPIs. Geen AI narrative.

**Impact / mogelijkheden:**

| Feature | Hoe context helpt |
|---|---|
| **"Why" narratives** op dashboards | "CPI daalde deze week omdat [AI leest ProjectAIContext + task-updates]" |
| **Trend prediction** | Risk forecast is al wired. Spend forecast idem (Sprint 2 roadmap). |
| **Anomaly detection** | "Scope veranderde terwijl de tender dat niet vereist" → context vs activiteit |

**Sprint-mapping:**
- **Sprint 5:** dashboard narratives
- **Sprint 7+:** anomaly detection

## 8. Compliance / Audit (ook impact)

| Feature | Hoe context + audit helpt |
|---|---|
| **GDPR / AVG** | ProjectAIContext.extracted_text kan PII bevatten → bewust omgaan, encrypt at rest (Sprint 6), delete-on-project-delete |
| **ISO 27001** | Audit log van elke AI-call die context gebruikte (`AIContextAccessLog` in Sprint 6) voor compliance-reviews |
| **DPIA** | AI zelf kan DPIA-sjabloon invullen op basis van ProjectAIContext — als tender PII vermeldt, flagged automatisch |
| **Retention** | Policy per tenant: context auto-deleten N dagen na project-afsluiting |

---

## Herziene sprint-overzicht (geïntegreerd)

| Sprint | Project | Program | Portfolio/Governance | Reporting | Team | Methodology | Compliance |
|---|---|---|---|---|---|---|---|
| **1** (nu) | Tier A wire-ins ✓ | — | — | — | — | — | — |
| **2** | Frontend `project_id` wiring | — | — | Project-scoped reports | — | — | — |
| **3** | Methodology classify-uit-docs | — | — | — | — | AI Advisor uit docs | — |
| **4** | Doc-driven milestone-gen op bestaand project | **ProgramAIContext** model + UI | **PortfolioAIContext** model + UI | Portfolio/program report context-aware | — | — | — |
| **5** | Compliance-keyword + auto-tag + status-draft | Program dashboard narrative | Decision drafting + meeting agenda | Dashboard narratives | Team-match + onboarding tour | **PRINCE2 BC/Brief + Scrum vision auto-draft** | — |
| **6** | Context audit trail per response | Program-tranches benefits | Portfolio dashboard narrative | PPTX exports narrative-rich | RACI AI | SAFe PI + MSP tranches auto-draft | **Audit log + encryption + GDPR delete** |
| **7+** | Semantic chunking, cross-project | Multi-program insights | Multi-portfolio AI | Anomaly detection | Member-skills DB | DMAIC + Waterfall auto-draft | DPIA assist, retention policies |

---

## Nieuwe data-modellen (impactoverzicht)

| Model | Sprint | FK | Fields |
|---|---|---|---|
| `ProjectAIContext` | ✅ gebouwd | project (1-1) | enabled, extracted_text, source_files |
| `ProgramAIContext` | Sprint 4 | program (1-1) | enabled, extracted_text, source_files |
| `PortfolioAIContext` | Sprint 4 | portfolio (1-1) | enabled, extracted_text, source_files |
| `AIContextAccessLog` | Sprint 6 | context (FK), user, surface, timestamp, chars_used | audit trail |
| `UserSkill` | Sprint 7+ | user, skill_name, proficiency | member-skills matching |
| `TenantAIFeatureFlags` | Sprint 6 | company (1-1) | enabled toggles per feature voor conservatieve klanten |

---

## Impact op bestaand werk

- **Sprint 2 wordt groter**: niet alleen frontend-wiring voor project, maar ook project-scoped reports (minuut 3 van 5). Werklast: +M.
- **Sprint 4 is cruciaal**: `ProgramAIContext` + `PortfolioAIContext` zijn de "unlock" voor Sprint 5-6. Zonder deze stapjes blijft alleen project-niveau context-aware.
- **Sprint 5 wordt het "wow" moment**: PRINCE2 BC auto-draft + Scrum vision uit docs → Elisa's demo kan dan laten zien dat ProjeXtPal in 2 clicks een draft Business Case uit een tender genereert.
- **Sprint 6 maakt het enterprise-ready**: zonder audit log + GDPR-delete kunnen grote klanten (zorg, overheid) context niet aan.

