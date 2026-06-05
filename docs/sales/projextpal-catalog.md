# ProjeXtPal — Sales Catalogus

**Versie:** 1.0 (2026-05-21) — opgesteld na Yanmar Sprint 0+1+2+3
**Onderhouden door:** Sales + Product
**Doel:** Standaard cherry-pick catalogus voor het opstellen van offertes. Geen lege Word-pagina meer.

---

## Hoe deze catalogus te gebruiken

1. **Per offerte** — open het [Offerte template](#offerte-template) onderaan. Pluk per klant items uit Tier 1, 2, 3 en Add-ons.
2. **Per klant** — bouw een "Selected items" lijst. Pricing framework onderaan vertaalt selectie naar bedragen.
3. **Per feature** — elke item heeft een **Y-spec ID** (link naar `docs/yanmar/requirements-checklist.yaml` waar van toepassing) en **Sprint-origin**, zodat de engineer weet welke code het is.
4. **Sales copy** — elk item heeft een 1-zin "elevator pitch" klaar voor in de offerte.

Cross-references:
- Yanmar-specifieke checklist: `docs/yanmar/requirements-checklist.yaml`
- Finance ecosystem catalog: `inclufy-auto-finance-main/docs/portability/requirements-catalog-template.yaml`
- DPIA template: `docs/yanmar/dpia-projextpal.md`
- AWS topology template: `docs/yanmar/aws-topology-yanmar.md`

---

# Tier 1 — Core (standaard in elke offerte)

Inbegrepen bij élke ProjeXtPal-licentie. Geen apart prijsje, deel van de basis.

| # | Feature | Sales copy | Evidence |
|---|---|---|---|
| C-01 | **Project / Programme / Portfolio management** | "Eén platform voor alle 3 niveaus — geen losse tools meer." | `projects/` + `programs/` + `governance/` apps |
| C-02 | **Multi-methodology** (Agile, Kanban, Waterfall, PRINCE2, Lean Six Sigma, Scrum, Hybrid, MSP) | "Werk per project in jullie eigen methodiek. PRINCE2 voor governance, Agile voor delivery — geen toolwissel." | 7 backend apps + `methodology_service.py` |
| C-03 | **Tasks + Milestones + Gantt + Kanban + Roadmap** | "Alle standaard PM-views, één klik scheiden." | `Task`, `Milestone`, `ProjectTimeline.tsx` |
| C-04 | **RACI per taak** | "Geen 'wie deed wat?' meer. R, A, C, I als aparte velden — auditbaar." | `Task.raci_*` (Y-spec ATR-02) |
| C-05 | **Time tracking + Budget vs Actuals** | "Real-time inzicht in tijd × tarief — geen maand-end wachten." | `TimeEntry` + `ProjectBudget` |
| C-06 | **Team + Role-based access** | "Membership per project, rechten per rol. Controllers zien rates, PMs niet." | `ProjectTeam` + `IsAdminOrPM` |
| C-07 | **Dashboards + Executive view** | "AI-powered overview met KPI tiles voor portfolio-niveau." | `Dashboard.tsx` + KPI tiles |
| C-08 | **Document storage + Upload + Versioning** | "Bijlagen aan project / meeting / risk — versies bewaard." | `Upload`, `Document`, `TrainingMaterial` |
| C-09 | **Multi-currency** (EUR, USD, GBP, AED, SAR, MAD) | "Voor multi-country operaties — Marokko, UAE, Saudi inbegrepen." | `Project.currency` |
| C-10 | **i18n NL / EN / FR / AR** | "Volledige UI in 4 talen, AR met RTL-support." | `src/i18n/` |
| C-11 | **Audit log per write** | "Elke wijziging gelogd met user, timestamp, before/after." | `admin_portal.log_action` |
| C-12 | **JWT auth + TOTP MFA** | "Industry-standard auth met optionele MFA." | `djangorestframework_simplejwt` + `django-otp` |

---

# Tier 2 — Pro (per-user uplift)

Geadviseerd vanaf 10+ gebruikers of bij teams met PM-volwassenheid. Per-user maandprijs uplift op Core.

| # | Feature | Sales copy | Y-spec | Sprint |
|---|---|---|---|:---:|
| P-01 | **AI Chat / Ask Advice** | "Vraag het platform — *'Welke projecten zijn at-risk in Q3?'* — antwoord in 2 sec." | — | bestond |
| P-02 | **Voice "Talk to PX"** | "Spreek je vragen in tijdens onderweg. Native iOS/Android." | — | bestond |
| P-03 | **AI Risk Mitigation** | "Voer een risk in — Claude stelt 5 mitigation actions voor, tailored op project context." | — | bestond |
| P-04 | **AI Auto-draft Highlight Report** | "Eén klik → AI synthesiseert work_completed + risks + issues uit live data." | — | bestond |
| P-05 | **AI Meeting Minutes** | "Plak transcript → DOCX in jullie eigen Minutes-template, met previous-actions auto-carry-forward." | MIN-04 | 0 |
| P-06 | **Mobile app (iOS + Android)** | "Native apps via TestFlight/Play Console — biometric login, push notifications." | — | bestond |
| P-07 | **KPI tiles** (Today / Tomorrow / This Week / Next Week / Overdue) | "Action Tracker counters live op je dashboard." | ATR-05 | 1 |
| P-08 | **4-axis RAG** (Budget / Planning / Resources / Overall) | "Niet één status — vier dimensies tegelijk, zoals jullie steerco't het wil zien." | HR-02 | 0 |
| P-09 | **5×5 Risk Heatmap** (Probability × Impact) | "PMBOK / PRINCE2-conform visualisatie van je RAID." | HR-04 | 0 |
| P-10 | **Custom PPTX/DOCX exports** | "Lever jullie template — wij genereren elke maand 1:1 uit live data." | HR-01, PLAN-09 | 0, 1 |
| P-11 | **Budget one-view** (Internal × External × Paid × Outstanding × ETC × Variance) | "Real-time financial roll-up, geen month-end reconciliatie meer." | — | 3 |
| P-12 | **CommunicationPlan + PlanEvent** | "Kickoff → onboarding → regular updates → closing — als datamodel, niet als Excel." | PLAN-08 | 3 |
| P-13 | **RAID compleet** (Risks + Assumptions + Issues + Dependencies) | "Volledige RAID-log, niet alleen Risks." | PLAN-06 | bestond |
| P-14 | **AI Risk Mitigation via BYO key** | "AI suggestions — maar Yanmar's eigen Anthropic key, geen prompt-data via ons." | — | 3 |

---

# Tier 3 — Enterprise (Yanmar-grade)

Voor klanten met **InfoSec / compliance / governance** eisen. Vaak vereist voor banken, gemeentes, defence, healthcare, pharma, enterprise-IT van industriële groepen.

| # | Feature | Sales copy | Y-spec | Sprint |
|---|---|---|---|:---:|
| E-01 | **BYO LLM keys** (per-company Anthropic + OpenAI) | "Jullie eigen LLM-account routeert alle AI-calls — geen prompt-data komt ooit langs Inclufy." | SC-01 | 2 |
| E-02 | **Fernet encryption at rest** | "API-keys, integration credentials, sensitive secrets — encrypted bovenop DB-level encryption." | SC-02 | 3 |
| E-03 | **GDPR DPIA-pakket** | "Klare-voor-DPO Data Protection Impact Assessment, met sub-processor lijst en data flows." | SC-03 | 2 |
| E-04 | **AWS topology document** | "3 hosting modellen (Inclufy-managed, Inclufy + Yanmar-CMK, Yanmar-controlled) — kies wat past." | SC-04 | 2 |
| E-05 | **Single-tenant AWS deploy** | "Eigen VPC, eigen DB, eigen S3 — geen shared infra met andere klanten." | — | infra |
| E-06 | **Push-back approval workflow** | "*'Due-date push max 1× / max 2 weken / dan Owner approval'* — als beleid in software, niet in Excel-discipline." | PLAN-05 | 1 |
| E-07 | **E-signature project closing** | "Senior Manager tekent maandafsluiting / project-closure digitaal — SOX / NIVRA / ISO 9001-ready." | PLAN-07 | 2 |
| E-08 | **6-role unified ProjectMembership** | "Jullie rol-taxonomie (Owner / PM / Leader / Facilitator / Outside Eyes / Stakeholder) als datamodel." | PLAN-01 | 2 |
| E-09 | **Methodology-aware export selector** | "Per company een default template (Yanmar / PRINCE2 / generic) — clients kunnen niet per ongeluk verkeerde layout krijgen." | SC-08 | 3 |
| E-10 | **Custom client template** | "Lever jullie Highlight Report / Project Plan / Minutes — wij maken er een renderer van. Naam in PPTX, jullie cijfers in DOCX." | HR-01, PLAN-09, MIN-04 | 0, 1 |
| E-11 | **Cross-tenant data-leak audit** | "Quarterly review + automated agent (`data-leak-hunter`) — bewijs voor je DPO dat tenants strikt zijn gescheiden." | — | infra |
| E-12 | **99.9% SLA** | "Productie uptime + 24/7 PagerDuty escalatie, 4u critical incident response." | — | infra |
| E-13 | **Membership-based access + field-level RBAC** | "Cost-rates alleen voor finance-roles, PMs zien headcount maar geen salarissen." | — | bestond |
| E-14 | **Full audit trail export** | "DSAR-ready audit log met user, IP, action, before/after — exporteer als JSON of CSV per request." | — | bestond |

---

# Add-ons (per stuk geprijst)

Niet inbegrepen in tier, los te kopen.

| # | Add-on | Pricing model | Effort |
|---|---|---|---|
| A-01 | **SAP S/4HANA integratie** (OData read-sync van invoices + suppliers + cost objects) | T&M | ~15-25 dev-dagen + Yanmar IT-betrokkenheid (Y-spec SC-06 / phase_2) |
| A-02 | **Microsoft Teams / Slack bot** (notifications + slash commands) | Fixed price | ~5-7 dev-dagen |
| A-03 | **Power BI / Tableau connector** | Fixed price | ~5 dev-dagen |
| A-04 | **On-premise / private-cloud deployment** | T&M | ~10-15 dev-dagen + customer infra |
| A-05 | **Custom AI agent / workflow** (bv. specifieke booking-AI, custom mitigation prompts) | T&M | 3-10 dev-dagen per agent |
| A-06 | **Migratie van Jira / Asana / Monday / Smartsheet** | T&M | 3-10 dev-dagen per source-tool |
| A-07 | **Single Sign-On (SAML / OIDC)** met Azure AD / Okta / OneLogin | Fixed price | ~5 dev-dagen |
| A-08 | **Custom country tax / regulatory module** | T&M | Variable |
| A-09 | **Workshops + Train-the-trainer** (per dagdeel) | Per dagdeel | — |
| A-10 | **Implementation services** (PM + change-management) | T&M | Project-afhankelijk |

---

# Ecosystem cross-sell

Inclufy is een **suite**. Vermeld in offerte als toekomst-perspectief, niet als ProjeXtPal-feature.

> *"Eén BYO LLM key, één audit trail, één maandelijkse factuur — geldt voor alle Inclufy producten die u eventueel later toevoegt."*

| Product | Wat het doet | Cross-sell hook | Catalog ref |
|---|---|---|---|
| **Inclufy Finance** (AI ERP) | Bank reconciliation, invoice OCR, AI booking, tax filings, accountant bundle | Internal cost komt uit ProjeXtPal time-tracking → external cost komt uit Finance invoices. Eén view. | `inclufy-auto-finance-main/docs/portability/requirements-catalog-template.yaml` |
| **Inclufy Marketing (AMOS)** | Multi-channel content + AI campaign generation + brand kits | Project-marketing-coordinatie tussen PMO en marketing-team in één tool | `Inclufy/inclufy-marketing-web` |
| **Inclufy Academy** | Microlearning + assessments + certifications voor je team | Onboard nieuwe PMs op jullie methodology in 4 uur i.p.v. 4 weken | `inclufy-academy` |
| **IQ Helix** | HR analytics + vertical-specific assessments | Workforce-planning voor large programmes | `inclufy/iq-helix` |
| **Inclufy Ignite** | Operations + workflow automation | Connecting ProjeXtPal events to external systems | — |

**Ecosystem korting:** als klant 2+ producten afneemt, krijgen ze platform-fee korting (configureer per deal).

---

# Pricing framework

Suggestieve structuur — pas aan per deal.

## Per-user, per-maand (drie-tier model)

| Tier | Per user/maand | Min users |
|---|---|---|
| Core | €X | 3 |
| Pro (Core + AI features + mobile) | €X + €Y | 5 |
| Enterprise (Pro + InfoSec + governance) | €X + €Y + €Z | 20 |

## Fixed-fee componenten

| Item | Eenmalig |
|---|---|
| Onboarding + initiële setup | €X |
| Custom template (PPTX / DOCX) per stuk | €X (Y dev-dagen) |
| DPIA + AWS topology customization | €X |
| Training (online, 2 sessies) | €X |
| Migratie van legacy tool (Jira/Asana/Monday) | T&M (zie A-06) |

## Add-ons (zie A-01 t/m A-10)

T&M-tarief: €X/dag voor backend, €Y/dag voor frontend, €Z/dag voor data-engineering / SAP-integratie.

## Volume kortingen

| Users | Korting op Tier |
|---|---|
| 50+ | -10% |
| 200+ | -15% |
| 500+ | -20% (custom) |

## Multi-year

| Looptijd | Korting |
|---|---|
| 12 mnd | -0% |
| 24 mnd | -5% |
| 36 mnd | -10% |

---

# Offerte template

Onderstaande structuur is jouw startpunt voor elke nieuwe offerte. Vul de placeholders in.

```markdown
# Inclufy ProjeXtPal — Voorstel voor <CLIENT NAAM>

**Aan:** <Naam, Functie> · <Email>
**Van:** Sami Loukile · sami@inclufy.com
**Datum:** <YYYY-MM-DD>
**Geldig tot:** <YYYY-MM-DD> (30 dagen)

## Samenvatting

<CLIENT> heeft de volgende uitdagingen geadresseerd in de eerste sessie:
- <pijn 1>
- <pijn 2>
- <pijn 3>

ProjeXtPal lost deze op via [tier-niveau X] met de volgende capaciteiten:

## Inbegrepen features

### Core (Tier 1)
- C-01 Project / Programme / Portfolio
- C-02 Multi-methodology
- ...

### Pro (Tier 2)
- P-05 AI Meeting Minutes — *<elevator pitch>*
- P-08 4-axis RAG — *<elevator pitch>*
- P-11 Budget one-view — *<elevator pitch>*

### Enterprise (Tier 3) [optioneel]
- E-01 BYO LLM keys
- E-03 GDPR DPIA-pakket
- E-06 Push-back approval workflow
- E-07 E-signature project closing
...

### Add-ons
- A-01 SAP S/4HANA integratie (Phase 2 — separate SOW)
- A-07 SSO

### Ecosystem (toekomstig)
- Inclufy Finance — als <CLIENT> later financial automation overweegt

## Prijsstructuur

| Onderdeel | Bedrag |
|---|---|
| <users> × Pro tier × 12 mnd | € X |
| Implementation (eenmalig) | € Y |
| Custom Highlight Report template | € Z |
| DPIA package | € W |
| 24/7 SLA support | € V/mnd |
| **Totaal jaar 1** | **€ XXX.XXX** |

## Timeline

| Week | Deliverable |
|---|---|
| 1-2 | Contract sign-off + kick-off |
| 3-6 | Setup, data migration, template customization |
| 7-8 | Pilot met core users |
| 9-12 | Roll-out + training |
| 13+ | Productieve fase |

## Bijlagen

- DPIA template (Bijlage A)
- AWS topology document (Bijlage B)
- Validatie-rapport ProjeXtPal vs <CLIENT> requirements (Bijlage C)
- SLA + support hours (Bijlage D)

## Voorwaarden

- Betalingstermijn: 30 dagen netto
- Eerste 30 dagen: opzegbaar zonder boete
- Data export gegarandeerd op opzegging

Met vriendelijke groet,
Sami Loukile
Inclufy B.V.
```

---

# Wat hier NIET in staat (bewust)

- **Bank reconciliation, OCR, invoice generation, tax filings** — dat is **Inclufy Finance**. Vermeld als ecosystem cross-sell, niet als ProjeXtPal-feature.
- **Marketing campaign tools, multi-channel publishing** — dat is **AMOS**.
- **Microlearning, assessments, courses** — dat is **Academy**.
- **HR analytics** — dat is **IQ Helix**.

Als een prospect vraagt "doen jullie ook X?" en X valt buiten ProjeXtPal — verwijs naar het cross-sell-product en bied een gecombineerde demo aan.

---

# Onderhoud van deze catalogus

- **Per sprint**: voeg nieuwe features toe aan de juiste tier. Sprint 0+1+2+3 (Yanmar) is al verwerkt; toekomstige sprints idem.
- **Per nieuwe enterprise klant**: als ze een nieuwe must-have eis hebben die universeel waardevol is → promoveer naar Tier 3 of Add-on.
- **Per kwartaal**: review pricing. Markt-vergelijking met Jira (€X/user), Asana (€Y/user), Monday (€Z/user).

Dit document leeft in Git. Update via pull request — geen Word-documenten in mailboxes.
