# AI-token kosten per project

**Doel:** een realistische schatting van wat een project in ProjeXtPal kost aan AI-tokens, van aanmaken tot afsluiten. Alle cijfers in dit document zijn gebaseerd op werkelijke metingen van vandaag (15 oktober 2026) op twee tender-projecten (Gemeente Almere, Gemeente Barneveld), aangevuld met projecties voor features die in de dagelijkse praktijk vaker worden gebruikt dan tijdens een UAT.

Alle bedragen zijn in euro, exclusief BTW. Twee tarieven naast elkaar: via Inclufy-pool (volle lijstprijs van de AI-provider plus marge) of met je eigen AI-key (BYOK, Inclufy rekent 15% servicevergoeding over de lijstprijs).

---

## 1. Gemeten token-kosten per AI-actie

Gemeten tussen 15 oktober 09:22 en 10:30 UTC op Inclufy's productie-tenant, surfaces direct uit de AIUsageLog:

| AI-actie | Gemiddeld aantal tokens | Via Inclufy-pool | Met eigen AI-key (BYOK) |
|---|---|---|---|
| Business Case opstellen (PRINCE2) | 4.247, 6.500 | €0,27 per draft | €0,04 per draft |
| Risico-register opstellen (4 tot 8 risico's) | 2.012 | €0,10 | €0,02 |
| Mijlpalen voorstellen (4 tot 8 mijlpalen) | 699, 1.782 | €0,05 | €0,02 |

De spreiding in tokens komt vooral door de omvang van de uploaded documenten die als context worden meegestuurd. Een rijk aanbestedingsdossier (leidraad plus PvE plus NvI's) genereert meer context dan een korte interne scope-notitie, wat de draft-call duurder maakt maar ook project-specifieker.

**Modelkeuze beïnvloedt de prijs significant:**

| Model | Prijs per 1 miljoen tokens prompt | Prijs per 1 miljoen tokens completion |
|---|---|---|
| GPT-4o-mini | €0,18 | €0,72 |
| GPT-4o | €3,00 | €12,00 |
| Claude Opus 4.7 | €18,00 | €90,00 |

Dure drafts (Business Case, status-rapporten) draaien standaard op Claude Opus; snelle hulp-vragen aan de Co-pilot op GPT-4o of GPT-4o-mini.

---

## 2. Een nieuw project aanmaken

| Stap in de wizard | Tokens | Via pool | Met eigen key |
|---|---|---|---|
| Wizard aanmaken (geen documenten) | 0 | €0,00 | €0,00 |
| Wizard aanmaken met document-upload en autofill alle velden | 4.000 tot 10.000 | €0,15 tot €0,45 | €0,02 tot €0,07 |
| Business Case direct opstellen (bij PRINCE2) | 4.000 tot 6.500 | €0,20 tot €0,27 | €0,03 tot €0,04 |
| Risico-register direct opstellen | 2.000 tot 2.500 | €0,10 tot €0,12 | €0,02 |
| Mijlpalen direct voorstellen | 700 tot 1.800 | €0,03 tot €0,07 | €0,01 tot €0,02 |

**Totaal, een goed voorbereid PRINCE2-project in 10 minuten aangemaakt met wizard-autofill + alle drie initiele gap-tools:**

- Via Inclufy-pool: **€0,50 tot €0,90**
- Met eigen key (BYOK): **€0,08 tot €0,15**

Een project aanmaken zonder document-upload en zonder gap-tool suggesties is gratis op AI-tokens, dan vul je alles zelf in de wizard in.

---

## 3. Een project onderhouden en bewerken

De exacte kosten tijdens de looptijd hangen vooral af van hoe actief jouw team de AI Co-pilot gebruikt. Twee typische scenario's:

### Scenario A, projectleider gebruikt AI gematigd

Een project van 12 weken waar de projectleider de Co-pilot vooral gebruikt voor status-rapporten en zo nu en dan een vraag:

| Activiteit | Hoeveelheid | Tokens | Via pool | BYOK |
|---|---|---|---|---|
| Highlight Report (per 2 weken) | 6 drafts | 12.000 | €0,60 | €0,09 |
| Ask Co-pilot vraag of actie | 20 turns | 30.000 | €1,20 | €0,18 |
| Risico-register bijwerken (half jaar) | 1 heruitvoering | 2.000 | €0,10 | €0,02 |
| **Subtotaal onderhoud** | | **44.000** | **€1,90** | **€0,29** |

Plus de kosten uit sectie 2 (project aanmaken): totaal voor dit project **€2,40 tot €2,80 via de pool**, of **€0,37 tot €0,44 met eigen key**.

### Scenario B, bidteam voor een aanbesteding (intensief gebruik)

Een tender-project van 6 weken waar het bidteam intensief met de Co-pilot werkt om de inschrijving te bouwen:

| Activiteit | Hoeveelheid | Tokens | Via pool | BYOK |
|---|---|---|---|---|
| Project Brief opstellen (PRINCE2) | 1 draft | 3.000 | €0,15 | €0,02 |
| Ask Co-pilot (tijdens inschrijving) | 40 turns | 72.000 | €2,90 | €0,43 |
| Business Case opnieuw (na NvI) | 1 heruitvoering | 5.000 | €0,25 | €0,04 |
| Highlight Report | 3 drafts | 6.000 | €0,30 | €0,05 |
| Exception Report (bij afwijking) | 1 draft | 2.000 | €0,10 | €0,02 |
| **Subtotaal onderhoud** | | **88.000** | **€3,70** | **€0,56** |

Plus de kosten uit sectie 2: totaal **€4,20 tot €4,60 via de pool**, of **€0,65 tot €0,70 met eigen key**.

### Scenario C, strategisch programma met governance

Een programma van 2 jaar met 5 constituent-projecten en een stuurgroep die maandelijks vergadert:

| Activiteit | Hoeveelheid | Tokens | Via pool | BYOK |
|---|---|---|---|---|
| Programma aanmaken + beschrijving | 1 keer | 5.000 | €0,25 | €0,04 |
| 5 projecten (sectie 2, scenario met autofill + 3 tools) | 5 × €0,70 | 50.000 | €3,50 | €0,55 |
| Governance-board aanmaken + papers uploaden (als AI-context) | 1 keer | 0 (geen AI-call) | €0,00 | €0,00 |
| Boardagenda opstellen (voor elke meeting) | 24 drafts | 48.000 | €2,40 | €0,36 |
| Briefing voor voorzitter | 24 drafts | 72.000 | €3,60 | €0,54 |
| Besluit-write-ups na elke meeting | 24 drafts | 36.000 | €1,80 | €0,27 |
| Programma highlight-rapport (per kwartaal) | 8 drafts | 24.000 | €1,20 | €0,18 |
| Ask Co-pilot vragen gedurende twee jaar | 200 turns | 300.000 | €12,00 | €1,80 |
| **Totaal programma 2 jaar** | | **~535.000** | **€24,75** | **€3,74** |

Een complex programma met intensief gebruik, over 2 jaar, kost dus ongeveer **€25 bij Inclufy** of **€4 met eigen AI-key** (plus de rekening van je eigen provider, geschat op €15 tot €20 over diezelfde periode).

---

## 4. Vuistregel voor budgetteren

Vuistregels op basis van gemeten activiteit, voor planning op jaarbasis:

| Project-type | Looptijd | Tokens/jaar | Pool-kosten/jaar | BYOK-kosten/jaar |
|---|---|---|---|---|
| Klein project, gematigd gebruik | 3 mnd | 60.000 | €2,50 | €0,40 |
| Standaard project, actief gebruik | 6 mnd | 150.000 | €6,00 | €0,90 |
| Tender- of bid-traject | 2 mnd | 100.000 | €4,50 | €0,70 |
| Strategisch programma (met governance) | 24 mnd | 500.000 | €20 tot €25 | €3 tot €4 |

De per-user dagelijkse tokenlimiet van 100.000 tokens voorkomt onbedoelde pieken. Een enkele gebruiker haalt die limiet in de praktijk alleen bij zeer intensief tenderwerk; bij normaal projectmanagement blijft het verbruik ruim onder de 20.000 tokens per gebruiker per dag.

---

## 5. Praktische aanbevelingen

- **Niet elk project heeft AI-features nodig.** Een eenvoudig project met vaste scope en bekend team kun je prima zonder Co-pilot runnen, dan is er geen token-kost. De AI is er voor als het waarde toevoegt.
- **Upload documenten één keer op het hoogste niveau** (programma of board) in plaats van op elk onderliggend project. Dan hoeft de AI de context niet telkens opnieuw te lezen, wat tokens scheelt bij elke draft eronder.
- **Review het AI-verbruik-dashboard maandelijks** onder Instellingen → AI-verbruik. Zie je één feature of één gebruiker extreem veel verbruiken, overleg dan of de limieten passend zijn.
- **Overweeg BYOK bij meer dan €20 per maand aan Inclufy-pool verbruik.** Zodra je team structureel boven de €20 uitkomt is een eigen AI-key via OpenAI of Anthropic goedkoper en vaak ook strategisch beter (data-residency, directe facturatie-relatie).
- **Deel een eigen key voor je hele organisatie**, één key per tenant volstaat voor alle gebruikers.

---

## 6. Hoe werkt de 15% service-fee precies?

Als je organisatie een eigen AI-key heeft ingesteld onder Instellingen → API Keys, dan verloopt elke AI-call via jouw eigen OpenAI- of Anthropic-contract. De token-facturen van die provider komen rechtstreeks bij jou binnen.

Inclufy rekent in dat geval een servicevergoeding van 15% van de pool-lijstprijs, voor:

- Hosting van de AI Co-pilot en alle gap-tools.
- Het audit-log van elke call (voor GDPR en compliance-reviews).
- Het AI-verbruik dashboard en de maandelijkse rapportage.
- Tenant-isolatie en toegangscontrole.
- Technische ondersteuning op AI-features.

In de factuur zie je dan één regel "AI service-fee [maand], [N] tokens via eigen AI-key ([M] calls, 15% van lijstprijs)".

Een organisatie die mid-maand overstapt van pool naar BYOK krijgt beide regels op dezelfde maandfactuur, elk voor hun eigen deel van de maand.

---

*Dit document is onderdeel van de ProjeXtPal documentatie-set van 15 oktober 2026. Vragen over AI-verbruik, prijsstelling of de BYOK-setup: info@projextpal.com.*
