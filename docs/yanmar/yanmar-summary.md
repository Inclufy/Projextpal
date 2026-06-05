# Yanmar Europe — samenvatting van hun punten

> Op basis van de e-mailwisseling met Dhruv (29 april + 18 mei) + de vier templates die ze hebben gedeeld.
> Voorbereiding op de deep-dive van **8 juni 2026**.

---

## 1. Hun kernpijn (waarom ze met ons praten)

| # | Pijnpunt | Wat ze daarvan merken |
|---|---|---|
| 1 | **Tijdrovend handwerk** | PMs vullen Excel-trackers, Word-rapporten en PowerPoint-decks handmatig in |
| 2 | **Trage kostenvisibiliteit** | Cijfers pas beschikbaar na maandafsluiting — geen real-time inzicht |
| 3 | **Beperkt zicht op externe spend** | Invoices niet gekoppeld aan projecten — controllers moeten zelf koppelen |
| 4 | **Late progress- en risk-rapportages** | PM-team rapporteert pas als 't al fout zit i.p.v. early-warning |
| 5 | **Versnipperde governance** | RACI, deadline-discipline en sign-offs niet afgedwongen, alleen in templates |

---

## 2. Wat ze concreet eisen (de 4 templates)

### Action Tracker (PRJ LEGO xlsx)
- Tasks met **Category** + sub-totals (COUNTIFS)
- **RACI** per taak (R, A, C, I als aparte kolommen)
- **Revised Due Date** + Completed On + Delay tracking
- 5-state progress indicator (○ ◔ ◑ ◕ ●)
- KPI counters: Today / Tomorrow / This Week / Next Week

### Project Plan (docx)
- **6 distinct roles**: Project Owner / PM / Leader / Facilitator / Outside Eyes / Stakeholders
- **Scope IN + Scope OUT** als aparte velden
- **Impact + Solution + ROI** voor problem-statement projecten
- 3 date types: Start / Target Implementation / Target End
- ⭐ **Push-back rule**: *"due-date push max 1× / max 2 weken / daarna Project Owner approval"*
- RAID compleet (Risks/Assumptions/Issues/Dependencies)
- **Senior Manager sign-off** (handtekening) bij project closing
- Communication plan (kickoff / onboarding / regular / closing)

### Highlight Report (pptx)
- Cover + header: **Sponsor / PM / Senior Supplier / Objectives**
- Monthly timeline met phases (Prepare / Renovations / Run)
- **4-axis RAG**: Budget / Planning / Resources / Overall
- Financials: Costs × Internal × External × Contingency × Budget × Actuals × **ETC** × Variance
- **5×5 Risk Map** (Probability × Impact)
- **Highlights / Lowlights** narrative
- Issues + Risks lists

### Meeting Minutes (docx)
- Attendees split: **Invited / Attended / Absent**
- Action items met PIC + Action Due
- **Previous Actions carry-forward** uit vorige meeting
- Customer/Supplier ↔ Yanmar Europe split incl. meeting room
- Agenda points / Discussion / Conclusions

---

## 3. Contract-randvoorwaarden (uit Shah's punten in de eerste sessie)

| Eis | Wat het betekent |
|---|---|
| **AWS hosting** | Inclufy-managed single-tenant **of** volledig Yanmar-controlled |
| **AI via Yanmar-managed keys** (BYO LLM) | Yanmar's eigen OpenAI / Anthropic account — **geen prompt-data via Inclufy** |
| **GDPR-compliant** | EU-hosting, DPIA-pakket, full audit trail |
| **Membership-based access** | Strict project-level isolatie, geen cross-tenant leak |
| **Role-based visibility** | Rates en costs alleen voor finance-roles |
| **Geen third-party analytics / geen AI training op klantdata** | Beleid + DPIA-bevestiging |
| **SAP S/4HANA als system of record** | ProjeXtPal is operationele laag bovenop, read-mostly sync |
| **Multi-methodology in één programme** | Waterfall + Agile + Hybrid naast elkaar |
| **Live dashboards** | Geen month-end wachten meer |
| **Agentic AI roadmap** | Planning, risk detection, decision-making — toekomst-belofte |

---

## 4. Wat ze van het 8 juni deep-dive verwachten

Uit Dhruv's mail van 18 mei:

> *"We hope to see the platform run and function to not only create but help guide different PMs and Managers to successfully run and track a project end to end."*

Dus geen demo van ProjeXtPal in het algemeen — een demo waarbij we **hun templates laten zien** als output van het platform.

> *"We are very open to evolving and changing how we report out but if the main requirements of the attached report are met YEU is more than happy to work in the way the platform operates."*

Belangrijke nuance: **als hun template-eisen worden gedekt, zijn ze flexibel** in hoe ProjeXtPal het verder structureert. Geen 1:1 productie van hun YEU-layout vereist — maar de informatie-elementen moeten erin zitten.

---

## 5. Open vragen die nog beantwoord moeten worden

| Vraag | Aan wie | Waarom belangrijk |
|---|---|---|
| Wat is de **"Aiden" cost line** in de Highlight Report? | Dhruv | Bepaalt mapping naar SAP cost-object of vendor |
| **RAG axes** PM-set of data-derived? | Dhruv | Of we automation toevoegen (bv. Budget = red bij Actuals + ETC > 95%) |
| Demo met **Inclufy-pool LLM key** of YEU-key? | Shah | Operationele beslissing voor 8 juni |
| Welk **AWS hosting model** (A / A+CMK / B)? | Yanmar IT | Bepaalt go-live timeline (4-6 wk vs 10 wk) |
| **SAP integratie** push (SAP → us) of pull (we → SAP)? | Yanmar IT | Architectuur-keuze voor Phase 2 SOW |

---

## 6. Onze huidige status tegenover hun eisen (zelf-gerapporteerd)

> ⚠️ Deze sectie is de **zelf-gerapporteerde** claim. Zie `yanmar-realisation-audit.md` voor de
> onafhankelijke, evidence-based verificatie tegen de codebase.

**32 van 34 eisen gevalideerd (94%) — 0 ontbrekende functionaliteiten (geclaimd).**

| Categorie | Status (geclaimd) |
|---|:---:|
| Action Tracker (5 eisen) | ✅ 5/5 |
| Project Plan (9 eisen) | ✅ 9/9 |
| Highlight Report (6 eisen) | ✅ 6/6 |
| Meeting Minutes (5 eisen) | ✅ 5/5 |
| Sales / Contract (9 eisen) | ✅ 8/9 (SAP = bewust Phase 2) |

De 2 niet-volledig-PASS items:
- **ATR-04** (5-state progress visueel in UI) — backend zit, UI rendering check tijdens demo
- **SC-06** (SAP S/4HANA) — bewust deferred als Phase 2 SOW

---

## In één regel

> Yanmar wil real-time, audit-bare project execution bovenop hun SAP, met hun eigen LLM-key, hun eigen 4 templates, en governance (sign-off / push-back / RACI) die in software wordt afgedwongen i.p.v. discipline-afhankelijk. ProjeXtPal Sprint 0-3 dekt 94% — SAP-integratie is de bewuste Phase 2.
