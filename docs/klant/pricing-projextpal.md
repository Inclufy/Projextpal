# ProjeXtPal, prijslijst inclusief AI-verbruik

**Versie:** oktober 2026
**Voor:** klanten, salesteam en partners van Inclufy
**Alle bedragen** in euro, exclusief 21% BTW. Facturatie per maand vooruit, opzeggen aan het einde van elke maand mogelijk.

Deze prijslijst combineert twee facturen die klanten normaal in één contract willen zien: de licentieprijs per gebruiker én het AI-verbruik dat met ProjeXtPal mogelijk is. Omdat ProjeXtPal AI diep heeft geïntegreerd (Co-pilot, auto-drafts, "ontbreekt nog" voorstellen, risk-register, mijlpalen, statusrapporten) wil je vooraf weten wat dat verbruik typisch gaat kosten, naast de licentie. Hieronder beide, geïntegreerd.

---

## 1. Gebruikerslicenties (per gebruiker per maand)

| Plan | Prijs/gebr./mnd | AI-tokens inbegrepen | Doelgroep |
|---|---|---|---|
| **Starter** | € 25 | geen pool (pay per use) | Teams tot 10, projecten in Agile/Kanban/Waterfall, geen AI-automatisering |
| **Professional** | € 49 | 50.000 / gebr. / mnd | Standaard PM-teams, incl. AI-notulen, Gantt, document-generatie |
| **Business** | € 79 | 200.000 / gebr. / mnd | Portfolio-management, multi-workspace, advanced analytics, standaard integraties |
| **Enterprise** | € 120 | BYOK standaard (15% service-fee) | Zorg/overheid/financieel met SSO, GDPR-exports, DPO-support, SLA 99.9% |

**Jaarlijks vooruit betaald:** 10% korting over de licentie-component. Bijvoorbeeld Professional wordt dan € 44 per gebruiker per maand (jaarbetaling), of een jaar vooruit € 528 per gebruiker.

---

## 2. Wat betekenen de AI-tokens per plan?

Context: één PRINCE2 Business Case opstellen uit uploaded documenten kost gemiddeld 4.000 tot 6.500 tokens. Eén Ask-Co-pilot gesprek-turn kost 1.000 tot 2.000 tokens. Eén risico-register (4 tot 8 risico's) kost 2.000 tot 2.500 tokens.

| Plan | Pool | Wat kun je ermee doen per gebruiker per maand (realistisch) |
|---|---|---|
| Starter | geen pool | Elke AI-actie wordt pay-as-you-go gefactureerd op basis van werkelijk gebruik (lijstprijs van de AI-provider). Geschikt als jouw team ProjeXtPal vooral als klassiek PM-tool gebruikt. |
| Professional | 50.000 tokens | Ongeveer 10 Business Cases, OF 20 risico-registers, OF 30 Ask-Co-pilot gesprekken per gebruiker. Prima voor gematigd gebruik door een PM. |
| Business | 200.000 tokens | Ongeveer 40 Business Cases of 100 Ask-Co-pilot gesprekken per gebruiker. Voldoende voor intensief AI-gebruik, inclusief dagelijkse Co-pilot interacties, auto-draft statusrapporten en wekelijkse heruitvoeringen van risico-registers. |
| Enterprise | BYOK standaard | Je gebruikt je eigen OpenAI/Anthropic-contract. Inclufy rekent slechts een servicevergoeding van 15% van de lijstprijs. Geen inbegrepen pool, maar in praktijk kom je ongeveer 85% lager uit dan Business-pool. |

De dagelijkse per-gebruiker-tokenlimiet is standaard 100.000 tokens (ongeveer 6 zware auto-drafts of 30 Co-pilot gesprekken), ongeacht het plan. Dat is een hard-cap om onbedoelde pieken te voorkomen; een beheerder kan deze per gebruiker aanpassen.

---

## 3. Pay-as-you-go bij overschrijding (Starter, Professional, Business)

Als je team meer tokens verbruikt dan je plan inbegrepen heeft, geldt per extra 1.000 tokens de volgende lijstprijs:

| AI-model gebruikt | Prompt-tokens per 1.000 | Completion-tokens per 1.000 |
|---|---|---|
| GPT-4o-mini | € 0,00018 | € 0,00072 |
| GPT-4o | € 0,003 | € 0,012 |
| Claude Opus 4.7 | € 0,018 | € 0,090 |

De AI Co-pilot kiest zelf het goedkoopste model dat voldoet voor jouw vraag. Zware auto-drafts (Business Case, Highlight Report) gaan standaard op Claude Opus; snelle Co-pilot vragen op GPT-4o of GPT-4o-mini.

**Voorbeeld van een maand overschrijding op Professional:** een PM die 30 extra Co-pilot gesprekken boven de inclusieve 50.000 tokens voert (ongeveer 45.000 extra tokens op GPT-4o), betaalt € 0,45 extra op zijn Inclufy-factuur die maand.

**Overschrijd je structureel?** Overweeg dan Business (meer pool) of een BYOK-key onder Instellingen (15% service-fee ipv volle lijstprijs).

---

## 4. BYOK (Bring Your Own Key) als alternatief

Vanaf Business plan, standaard op Enterprise. Je stelt je eigen AI-key van OpenAI of Anthropic in onder Instellingen → API Keys. Vanaf dat moment:

- Jouw provider factureert jou rechtstreeks voor het ruwe token-gebruik.
- Inclufy rekent 15% servicevergoeding over de pool-lijstprijs, voor hosting, audit-log, dashboard, cross-app invoicing en support.
- Netto typisch ~85% voordeel ten opzichte van de Inclufy-pool.
- Data-residency voordeel: tokens gaan direct van jouw infrastructuur naar jouw gekozen provider.

**Voorbeeld:** een PRINCE2 Business Case kost op Inclufy-pool € 0,27. Op BYOK: € 0,04 service-fee bij Inclufy, plus de rauwe provider-rekening direct bij jou.

---

## 5. Optionele diepere methodologie-modules (per organisatie per maand)

**Belangrijk vooraf:** alle methodologieën (PRINCE2, Scrum, Agile, Kanban, Waterfall, Hybrid, Lean Six Sigma, MSP) zitten al **standaard** in élk plan. Je kiest per project welke je wilt gebruiken, zonder meerprijs. De onderstaande modules zijn **optioneel** en voegen een diepere, enterprise-grade laag toe aan die methodiek voor organisaties die er intensief op sturen (externe audit, certificering, PMO-stijl governance). De meeste klanten hebben ze niet nodig.

| Module | Prijs/org./mnd | Wat voegt het toe boven de standaard |
|---|---|---|
| **PRINCE2 Enterprise** | € 79 | Volledige PRINCE2 2017/7 compliance kit: Project Brief, PID, Stage Plans, Quality Register, Product Status reports en Lessons Log in de officiële templates klaar voor certificering-audit. Standaard projecten gebruiken al Business Case + Highlight Reports + Exception Reports zonder deze module. |
| **LSS Black / Green uitbreiding** | € 99 | DMAIC-dashboards, SPC-charts (Cp/Cpk/Pareto), FMEA-templates, Green Belt / Black Belt certificeringspakket. Standaard LSS-projecten gebruiken al SIPOC + VOC + control plans zonder deze module. |
| **MSP programme-governance** | € 149 | Benefits-map, tranches, programme board met formele vergaderritme, roadmap-view met strategische KPI's. Standaard programma's gebruiken al multi-project management zonder deze module. |

---

## 6. Feature add-ons (per organisatie per maand)

Vrijblijvend bij elk plan toe te voegen:

| Add-on | Prijs/org./mnd | Wat je ermee kunt |
|---|---|---|
| **Governance pakket** | € 99 | Portfolios + Boards + Decisions + Meetings + AI-context op board papers (zie release 15 oktober) |
| **AI-notulen** | € 29 | Plak vergadertranscript, krijg Word/PDF notulen in jouw template met vorige-acties auto-carry-forward |
| **Compliance pakket** | € 199 | GDPR-tooling, DPIA-template, audit-log retention, per-document privacy toggle, verwerkersovereenkomst-template |
| **Export pakket** | € 39 | Custom PowerPoint / Word template-exports (lever jouw template, wij genereren maandelijks uit live data) |

---

## 7. Eenmalige diensten

| Service | Prijs | Wanneer |
|---|---|---|
| **DPIA-begeleiding** | op offerte | Compleet GDPR Data Protection Impact Assessment, 2 tot 4 weken doorlooptijd |
| **AWS/Hetzner topology** | op offerte | Dedicated hosting-architectuur in jouw cloud-account |
| **Custom integratie** | op offerte | Koppeling met jouw ERP, CRM, Slack, Teams, Jira, Confluence, Mendix, enz. |
| **Onboarding + training** | € 1.500 | 2 workshops van 2 uur, documentatie-pakket, 30 dagen hands-on support |

---

## 8. Rekenvoorbeelden (combinatie licenties + AI-verbruik)

In deze voorbeelden kiest het team zelf welke methodologie(ën) ze gebruiken per project (bv. PRINCE2 voor zorgverbeteringen, Scrum voor pilots) — zónder dat daar een module-upgrade voor nodig is, die zit in de basis. Optionele modules zijn alleen opgenomen wanneer het team specifiek om die extra laag vraagt.

### Voorbeeld A, zorginstelling 10 gebruikers op Professional

Standaard-setup zonder extra modules. Het team gebruikt PRINCE2 voor zijn hoofdprojecten en Agile voor pilots. Beide methodologieën standaard inbegrepen.

| Component | Berekening | Per maand |
|---|---|---|
| 10 × Professional | 10 × € 49 | € 490 |
| AI-verbruik binnen 10 × 50K pool | 300.000 van 500.000 inbegrepen | € 0 |
| **Totaal** | | **€ 490** |

Jaarbudget: € 5.880. Met jaarbetaling korting: ongeveer € 5.290.

### Voorbeeld B, consultancy 25 gebruikers op Business

Multi-methodology werkplek, standaard-setup. Consultants kiezen per klant-opdracht de passende methodiek.

| Component | Berekening | Per maand |
|---|---|---|
| 25 × Business | 25 × € 79 | € 1.975 |
| AI-verbruik binnen 25 × 200K pool | 2M van 5M inbegrepen | € 0 |
| **Totaal** | | **€ 1.975** |

Jaarbudget: € 23.700. Met jaarbetaling korting: ongeveer € 21.330.

### Voorbeeld C, zorginstelling 50 gebruikers op Enterprise (BYOK)

Enterprise met compliance-eisen, inclusief officiële PRINCE2-templates voor certificeringsaudits.

| Component | Berekening | Per maand |
|---|---|---|
| 50 × Enterprise | 50 × € 120 | € 6.000 |
| Compliance pakket | € 199 | € 199 |
| PRINCE2 Enterprise module (voor audit-templates) | € 79 | € 79 |
| AI service-fee (BYOK, 50 gebr. × 100K tokens/mnd gem.) | 15% × ongeveer € 200 | € 30 |
| Eigen OpenAI/Anthropic factuur | pay-as-you-go | ongeveer € 170 |
| **Totaal maandfactuur van Inclufy** | | **€ 6.308** |
| Plus eigen provider | | ongeveer € 170 |

Jaarbudget bij Inclufy: ongeveer € 75.700, plus eigen AI-provider ongeveer € 2.040. Totaal ongeveer € 77.700, met voordeel dat alle token-stroom direct via het klant-eigen contract loopt.

### Voorbeeld D, tender/bid-bureau 5 gebruikers Professional + intensief AI

Gespecialiseerd team dat zware tender-trajecten doet. Alle methodiekondersteuning (PRINCE2 voor response-governance, Agile voor interne iteratie) zit standaard in Professional.

| Component | Berekening | Per maand |
|---|---|---|
| 5 × Professional | 5 × € 49 | € 245 |
| AI-verbruik, inclusief | 5 × 50K = 250K | € 0 |
| AI-verbruik, overage | 5 × 100K extra op Claude Opus | ongeveer € 45 |
| **Totaal** | | **€ 290** |

Advies voor dit type team: BYOK aanzetten en ongeveer € 7 betalen (15% van ~€ 45) plus eigen Anthropic contract (ongeveer € 38). Netto hetzelfde Inclufy-tarief maar met strakkere data-residency.

### Voorbeeld E, programma-portfolio 30 gebruikers Business + MSP-module

Programma-manager wil MSP-benefits-realisatie bovenop multi-projectmanagement. Deze klant kiest bewust voor de MSP-uitbreiding; andere klanten met multi-project werk hebben die niet nodig.

| Component | Berekening | Per maand |
|---|---|---|
| 30 × Business | 30 × € 79 | € 2.370 |
| MSP programme-governance module | € 149 | € 149 |
| Governance pakket (boards, decisions) | € 99 | € 99 |
| AI-verbruik binnen 30 × 200K pool | 3M van 6M inbegrepen | € 0 |
| **Totaal** | | **€ 2.618** |

Jaarbudget: € 31.416. Met jaarbetaling korting: ongeveer € 28.260.

---

## 9. Keuzegids: welk plan?

Snelle beslissingsboom:

| Vraag | Advies |
|---|---|
| Minder dan 10 gebruikers, geen AI-automatisering nodig | **Starter** (€ 25/gebr.) |
| Standaard PM-team, gematigd AI-gebruik, methodiek PRINCE2/Agile/Scrum | **Professional** (€ 49/gebr.) + PRINCE2 module |
| 20+ gebruikers, portfolio-overzicht nodig, intensief AI-gebruik | **Business** (€ 79/gebr.) + evt. BYOK |
| Zorg / overheid / financieel, SSO, audit-log retention, DPO-support | **Enterprise** (€ 120/gebr.) + Compliance pakket |
| Multi-programma portfolio-sturing | elk plan + **MSP module** (€ 149/org.) |
| Procesverbetering met DMAIC | elk plan + **LSS module** (€ 99/org.) |

---

## 10. Wat zit standaard in elk plan?

Deze functies zitten bij ÉLK plan inbegrepen, geen aparte prijs:

- Project / Programme / Portfolio management (3 niveaus in één tool)
- Multi-methodology (Agile, Kanban, Waterfall, Scrum, Hybrid)
- Tasks, Milestones, Gantt, Kanban-board, Roadmap
- RACI per taak (auditbaar)
- Tijdregistratie + Budget-vs-actuals
- Dashboards + Executive view
- Document-storage met versies
- Multi-currency (EUR, USD, GBP, AED, SAR, MAD)
- i18n NL / EN / FR / AR
- Audit-log van elke wijziging
- JWT auth + optionele TOTP MFA
- AI Co-pilot (sparkle-knop, scope-aware, service-stijl, "ontbreekt nog" sectie)
- Drie "doe-het-voor-mij" tools (Business Case / risico-register / mijlpalen voorstellen)
- AI-verbruik dashboard met per-feature + per-user uitsplitsing

---

## 11. Volume-kortingen

Automatische kortingen op licentie-component (niet op AI-verbruik of modules):

| Aantal gebruikers | Korting op licentie |
|---|---|
| 25 tot 49 | 5% |
| 50 tot 99 | 10% |
| 100 tot 249 | 15% |
| 250+ | op offerte |

Volume-korting is cumulatief met jaarbetaling-korting (10%).

---

## 12. Veelgestelde vragen

**Wat gebeurt er als mijn team over de token-pool heen gaat?**
De AI blijft werken, elke extra call wordt pay-as-you-go op de lijstprijs van de AI-provider gefactureerd. Je ziet dat direct op het AI-verbruik dashboard.

**Kan ik mid-maand switchen tussen pool en BYOK?**
Ja. Je factuur bevat dan twee regels (pool voor het eerste deel van de maand, service-fee voor het tweede deel).

**Hoe wordt BTW berekend?**
Alle genoemde bedragen zijn exclusief BTW. Nederlandse klanten krijgen 21% BTW over het totaal; EU B2B krijgt verlegging (0% BTW, BTW-nummer verplicht).

**Kan ik verschillende plans combineren binnen één organisatie?**
Ja. Veel klanten geven hun PM-team Professional en hun uitvoerende teamleden Starter.

**Is er een gratis trial?**
30 dagen Starter-trial zonder creditcard. Alle data blijft bewaard bij overstap naar een betaald plan.

**Wat is uw opzegtermijn?**
Opzeggen aan het einde van elke maand voor maandplannen. Jaarplannen lopen door tot het einde van het contract (met pro-rata restitutie bij opzegging door Inclufy).

---

## 13. Contact

Vragen over pricing, offerte voor jouw organisatie, of custom contract:

- **E-mail:** sales@inclufy.com
- **Telefoon:** op aanvraag
- **Website:** projextpal.com/pricing
- **Direct inschrijven:** projextpal.com → Try for free

---

*Deze prijslijst is onderdeel van de ProjeXtPal documentatie-set van 15 oktober 2026. Prijzen zijn geldig tot 1 januari 2027 of herroeping. Alle genoemde AI-verbruik-cijfers zijn gebaseerd op werkelijke metingen van productiedata; zie `ProjeXtPal_AI_Token_Benchmark.pdf` voor de onderbouwing.*
