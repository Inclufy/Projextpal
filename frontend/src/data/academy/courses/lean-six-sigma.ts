// ============================================
// COURSE: LEAN SIX SIGMA GREEN BELT
// ============================================
// Data-driven process improvement with DMAIC
// ============================================

import { TrendingUp } from 'lucide-react';
import { Course, Module } from '../types';
import { BRAND } from '../brand';
import { instructors } from '../instructors';

// ============================================
// MODULE 1: INTRODUCTIE & DEFINE
// ============================================
const module1: Module = {
  id: 'lss-m1',
  title: 'Module 1: Introduction & Define',
  titleNL: 'Module 1: Introductie & Define',
  description: 'The fundamentals of Lean Six Sigma and the Define phase.',
  descriptionNL: 'De fundamenten van Lean Six Sigma en de Define fase.',
  lessons: [
    {
      id: 'lss-l1',
      title: 'What is Lean Six Sigma?',
      titleNL: 'Wat is Lean Six Sigma?',
      duration: '20:00',
      type: 'video',
      videoUrl: '',
      transcript: `Welkom bij de Lean Six Sigma Green Belt cursus! In deze eerste les 
leren we wat Lean Six Sigma is en waarom het zo effectief is voor procesverbetering.

**De Oorsprong**

Lean Six Sigma combineert twee krachtige verbetermethodologieën:

**Lean** (Toyota Production System, jaren '50):
- Focus op het elimineren van verspilling
- Maximaliseren van klantwaarde
- Continue flow en pull-systemen
- Respect voor mensen

**Six Sigma** (Motorola, jaren '80):
- Focus op het reduceren van variatie
- Data-gedreven besluitvorming
- Statistische procesbeheersing
- DMAIC-methodologie

Samen vormen ze een complete toolkit voor procesverbetering.

**Wat is een Sigma Level?**

"Six Sigma" verwijst naar een kwaliteitsniveau:
- 1 Sigma: 691.462 defects per miljoen (DPMO) - 31% goed
- 2 Sigma: 308.538 DPMO - 69% goed
- 3 Sigma: 66.807 DPMO - 93% goed
- 4 Sigma: 6.210 DPMO - 99.4% goed
- 5 Sigma: 233 DPMO - 99.98% goed
- 6 Sigma: 3.4 DPMO - 99.99966% goed

Six Sigma performance betekent slechts 3.4 defecten per miljoen kansen!

Waarom is dit belangrijk?
- 99% goed klinkt prima, maar betekent:
  - 20.000 verkeerde medicijnrecepten per jaar
  - 5.000 mislukte operaties per week
  - 200.000 verkeerde bankafschriften per dag

**De Vijf Lean Principes**

1. **Value**: Definieer waarde vanuit klantperspectief
2. **Value Stream**: Breng de waardestroom in kaart
3. **Flow**: Creëer continue flow zonder onderbrekingen
4. **Pull**: Produceer alleen wat de klant vraagt
5. **Perfection**: Streef continu naar perfectie

**De 8 Verspillingen (TIMWOODS)**

Lean identificeert 8 soorten verspilling:

- **T**ransport: Onnodig verplaatsen van materialen
- **I**nventory: Te veel voorraad
- **M**otion: Onnodige bewegingen van mensen
- **W**aiting: Wachten op informatie, materialen, etc.
- **O**verproduction: Meer maken dan nodig
- **O**verprocessing: Meer doen dan de klant wil
- **D**efects: Fouten en herwerk
- **S**kills (unused): Talent niet benutten

Als je deze verspillingen kunt elimineren, verhoog je efficiency en kwaliteit.

**De DMAIC-Cyclus**

DMAIC is de kern van Six Sigma:

**D - Define**: Definieer het probleem
- Wat is het probleem?
- Wie is de klant?
- Wat is de scope?
- Wat is het doel?

**M - Measure**: Meet de huidige situatie
- Hoe presteert het proces nu?
- Welke data hebben we nodig?
- Hoe betrouwbaar is die data?

**A - Analyze**: Analyseer de root causes
- Wat veroorzaakt het probleem?
- Welke factoren zijn significant?
- Kunnen we dit bewijzen met data?

**I - Improve**: Implementeer verbeteringen
- Welke oplossingen zijn mogelijk?
- Welke oplossing is het beste?
- Hoe implementeren we?

**C - Control**: Borg de verbetering
- Hoe houden we de winst vast?
- Welke controls zijn nodig?
- Wie is verantwoordelijk?

**De Belt Structuur**

Lean Six Sigma kent verschillende rollen:

**White Belt**: Basiskennis, ondersteunt projecten
**Yellow Belt**: Teamlid in verbeterprojecten
**Green Belt**: Leidt verbeterprojecten (parttime)
**Black Belt**: Fulltime verbeterexpert
**Master Black Belt**: Coach en trainer

Als Green Belt leid je typisch 1-2 projecten per jaar naast je reguliere werk.

**Wanneer Lean Six Sigma Gebruiken?**

Lean Six Sigma is ideaal voor:
- Terugkerende problemen (niet eenmalig)
- Meetbare issues (data beschikbaar)
- Processen met variatie of verspilling
- Situaties waar root cause onbekend is

Minder geschikt voor:
- Eenmalige projecten
- Nieuwe processen ontwerpen (gebruik Design for Six Sigma)
- Problemen met bekende oorzaak (just fix it!)

**Business Case voor LSS**

De ROI van Lean Six Sigma is significant:
- Typische projectbesparing: €50.000 - €200.000
- Black Belt levert €500.000+ per jaar
- ROI op training: 10-30x

Bedrijven als GE, Motorola, Amazon en Toyota hebben miljarden bespaard met LSS.

**Samenvatting**

Lean Six Sigma:
- Combineert Lean (verspilling elimineren) en Six Sigma (variatie reduceren)
- Gebruikt de DMAIC-cyclus voor structurele verbetering
- Is data-gedreven en klantgericht
- Levert meetbare, duurzame resultaten
- Heeft een belt-structuur voor verschillende expertiseniveaus`,
      keyTakeaways: [
        'Lean focuses on waste, Six Sigma on variation',
        'DMAIC = Define, Measure, Analyze, Improve, Control',
        '8 wastes: TIMWOODS',
        'Six Sigma = 3.4 defects per million opportunities',
      ],
      keyTakeawaysNL: [
        'Lean focust op verspilling, Six Sigma op variatie',
        'DMAIC = Define, Measure, Analyze, Improve, Control',
        '8 verspillingen: TIMWOODS',
        'Six Sigma = 3.4 defecten per miljoen kansen',
      ],
      resources: [
        {
          name: 'DMAIC Overview Poster',
          type: 'PDF',
          size: '2.1 MB',
          description: 'Visueel overzicht van de DMAIC-cyclus',
        },
        {
          name: '8 Wastes Infographic',
          type: 'PDF',
          size: '1.4 MB',
          description: 'TIMWOODS met voorbeelden',
        },
      ],
    },
    {
      id: 'lss-l2',
      title: 'The Define Phase',
      titleNL: 'De Define Fase',
      duration: '25:00',
      type: 'video',
      videoUrl: '',
      transcript: `De Define fase is het fundament van elk Lean Six Sigma project. 
Een goed gedefinieerd project is half gewonnen; een slecht gedefinieerd project is gedoemd.

**Doel van Define**

In de Define fase beantwoord je:
- Wat is het probleem?
- Waarom is het belangrijk?
- Wie is de klant en wat wil die?
- Wat is de scope?
- Wat is het doel?
- Wie is betrokken?

**De Project Charter**

Het eerste deliverable is de Project Charter. Deze bevat:

**1. Business Case**
Waarom is dit project belangrijk voor de organisatie?
- Financiële impact
- Strategische alignment
- Urgentie

**2. Problem Statement**
Een specifieke, meetbare beschrijving van het probleem.

Slecht: "De klanttevredenheid is te laag"
Goed: "De klanttevredenheid (CSAT) is gedaald van 85% naar 72% in de afgelopen 6 maanden, 
wat resulteert in 15% hogere churn en €200.000 omzetverlies per kwartaal"

Een goede problem statement:
- Is specifiek en meetbaar
- Bevat geen oorzaken of oplossingen
- Geeft de business impact aan
- Is gebaseerd op data

**3. Goal Statement (SMART)**
Wat wil je bereiken?

"Verhoog CSAT van 72% naar 85% binnen 6 maanden, wat resulteert in 10% lagere churn 
en €150.000 kostenbesparing per kwartaal"

**4. Scope**
Wat hoort wel en niet bij het project?

In scope:
- Klantenservice proces (telefoon en email)
- Klachtenafhandeling

Out of scope:
- Website
- Productontwikkeling
- Externe leveranciers

**5. Timeline & Milestones**
Wanneer is elke fase klaar?

**6. Team**
Wie is betrokken en in welke rol?
- Sponsor
- Project Leader (jij als Green Belt)
- Team members
- Process Owner

**Voice of the Customer (VOC)**

Een cruciaal element in Define is het begrijpen van de Voice of the Customer.

Bronnen voor VOC:
- Klantinterviews
- Surveys
- Klachten en feedback
- Focus groups
- Social media
- Sales feedback

Van VOC naar CTQ:
1. VOC: "Ik wil sneller geholpen worden"
2. Need: Snelle service
3. CTQ (Critical to Quality): Wachttijd < 2 minuten

De CTQ is meetbaar en vormt de basis voor je metingen.

**SIPOC Diagram**

SIPOC geeft een high-level overzicht van het proces:

- **S**uppliers: Wie levert input?
- **I**nputs: Wat komt het proces binnen?
- **P**rocess: Wat zijn de hoofdstappen? (5-7 stappen)
- **O**utputs: Wat komt eruit?
- **C**ustomers: Wie ontvangt de output?

Voorbeeld voor orderverwerking:

| S | I | P | O | C |
|---|---|---|---|---|
| Klant | Order | 1. Ontvangen | Bevestiging | Klant |
| Website | Klantdata | 2. Valideren | Factuur | Finance |
| | | 3. Verwerken | Product | Warehouse |
| | | 4. Verzenden | | |
| | | 5. Bevestigen | | |

**Stakeholder Analysis**

Wie heeft belang bij dit project?

Identificeer:
- Supporters (help ze helpen)
- Neutralen (win ze voor je)
- Tegenstanders (manage ze)

Maak een plan voor elke key stakeholder.

**Define Gate Review**

Aan het einde van Define presenteer je aan de sponsor:
- Project Charter
- VOC en CTQ's
- SIPOC
- Stakeholder analyse
- Risico's

Vraag: Mogen we door naar Measure?

**Veelgemaakte Fouten in Define**

- Te brede scope (niet haalbaar)
- Oplossing al in gedachten (confirmation bias)
- Geen echte data (aannames)
- Verkeerde CTQ's (niet wat klant wil)
- Geen sponsor buy-in

**Samenvatting**

De Define fase:
- Definieert het probleem helder en meetbaar
- Vertaalt Voice of Customer naar CTQ's
- Schetst het proces met SIPOC
- Identificeert stakeholders
- Resulteert in een goedgekeurde Project Charter`,
      keyTakeaways: [
        'A good problem statement contains no causes or solutions',
        'VOC → Needs → CTQs form the basis for measurements',
        'SIPOC provides high-level process insight',
        'Define ends with an approved Project Charter',
      ],
      keyTakeawaysNL: [
        'Een goede problem statement bevat geen oorzaken of oplossingen',
        'VOC → Needs → CTQ\'s vormen de basis voor metingen',
        'SIPOC geeft high-level procesinzicht',
        'Define eindigt met een goedgekeurde Project Charter',
      ],
      resources: [
        {
          name: 'Project Charter Template',
          type: 'DOCX',
          size: '145 KB',
          description: 'LSS Project Charter template',
        },
        {
          name: 'SIPOC Template',
          type: 'XLSX',
          size: '85 KB',
          description: 'SIPOC diagram template',
        },
      ],
    },
    {
      id: 'lss-l3',
      title: 'Quiz: Define Phase',
      titleNL: 'Quiz: Define Fase',
      duration: '10:00',
      type: 'quiz',
      quiz: [
        {
          id: 'lss-q1',
          question: 'Wat betekent DMAIC?',
          options: [
            'Design, Make, Analyze, Implement, Check',
            'Define, Measure, Analyze, Improve, Control',
            'Define, Monitor, Act, Improve, Close',
            'Develop, Measure, Assess, Integrate, Complete'
          ],
          correctAnswer: 1,
          explanation: 'DMAIC staat voor Define, Measure, Analyze, Improve, Control.',
        },
        {
          id: 'lss-q2',
          question: 'Wat hoort NIET in een goede problem statement?',
          options: [
            'De huidige performance',
            'De business impact',
            'De oorzaak van het probleem',
            'Een meetbare beschrijving'
          ],
          correctAnswer: 2,
          explanation: 'Een problem statement bevat geen oorzaken of oplossingen - die vind je later in Analyze.',
        },
        {
          id: 'lss-q3',
          question: 'Wat is een CTQ?',
          options: [
            'Cost To Quality - de kosten van kwaliteit',
            'Critical To Quality - een meetbare klantbehoefte',
            'Control The Quality - een controle methode',
            'Customer Total Quality - totale klantkwaliteit'
          ],
          correctAnswer: 1,
          explanation: 'CTQ = Critical To Quality, een meetbare vertaling van klantbehoeften.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 2: MEASURE
// ============================================
const module2: Module = {
  id: 'lss-m2',
  title: 'Module 2: Measure',
  titleNL: 'Module 2: Measure',
  description: 'Quantify current performance with reliable data.',
  descriptionNL: 'Kwantificeer de huidige prestatie met betrouwbare data.',
  lessons: [
    {
      id: 'lss-l4',
      title: 'The Measure Phase',
      titleNL: 'De Measure Fase',
      duration: '28:00',
      type: 'video',
      videoUrl: '',
      transcript: `In de Measure fase verzamel je data om de huidige prestatie te begrijpen. 
"In God we trust, all others bring data" is het motto van deze fase.

**Doel van Measure**

- De huidige prestatie kwantificeren (baseline)
- Het meetsysteem valideren
- Data verzamelen voor analyse
- Het probleem verder verfijnen

**Operational Definitions**

Voordat je gaat meten, definieer precies WAT je meet:

Voorbeeld: "Doorlooptijd"
- Start: Wanneer begint de klok? (Order ontvangen of order geaccepteerd?)
- Stop: Wanneer stopt de klok? (Product verzonden of product ontvangen?)
- Eenheid: Dagen, uren, minuten?
- Exclusies: Tellen weekenden mee?

Zonder operational definition krijg je onbetrouwbare data.

**Data Types**

**Continuous (Variable) Data:**
- Meetbaar op een schaal
- Voorbeelden: tijd, gewicht, temperatuur, prijs
- Meer informatief, kleinere sample sizes nodig

**Discrete (Attribute) Data:**
- Telbaar, categorieën
- Voorbeelden: defect/no defect, goed/slecht, ja/nee
- Grotere sample sizes nodig

Streef waar mogelijk naar continuous data.

**Data Collection Plan**

Een goed plan bevat:
- Wat meet je? (CTQ's uit Define)
- Hoe meet je? (Operational definition)
- Wie meet? (Verantwoordelijke)
- Wanneer? (Frequentie, periode)
- Waar? (Locatie, systeem)
- Hoeveel? (Sample size)

**Measurement System Analysis (MSA)**

Voordat je data vertrouwt, valideer je het meetsysteem:

Is de meting:
- **Accuraat**: Meet je de juiste waarde?
- **Precise**: Krijg je dezelfde waarde bij herhaalde metingen?
- **Reproducible**: Krijgen verschillende personen dezelfde waarde?

Voor attribute data: Kappa analyse
Voor continuous data: Gage R&R

Als je meetsysteem niet betrouwbaar is, is je data waardeloos.

**Process Mapping**

Nu je data hebt, breng je het proces gedetailleerd in kaart:

Types process maps:
- **Basic flowchart**: Stappen en beslissingen
- **Swimlane diagram**: Wie doet wat
- **Value Stream Map**: Toevoegt waarde vs. niet

Bij elke stap identificeer je:
- Cycle time
- Wait time
- Defect rate
- Resources

**Value-Add Analysis**

Elke stap is:
- **Value-Add (VA)**: Klant wil ervoor betalen
- **Non-Value-Add (NVA)**: Geen waarde, elimineren
- **Business Non-Value-Add (BNVA)**: Nodig maar geen klantwaarde

Typisch is 5-10% VA en 90-95% NVA/BNVA!

**Baseline Performance**

Bereken de huidige prestatie:

**Process Capability (Cp, Cpk)**:
Meet hoe goed het proces binnen specs valt

**Sigma Level**:
DPMO → Sigma conversie

**Yield**:
% goede output

Voorbeeld:
- 100 orders per dag
- 8 orders hebben een fout
- First Pass Yield = 92%
- DPMO = 80.000
- Sigma Level ≈ 2.9

**Control Charts**

Maak control charts om:
- Variatie te visualiseren
- Speciale oorzaken te identificeren
- Stabiliteit van het proces te beoordelen

Een stabiel proces varieert alleen door "common causes" (normale variatie).
Een onstabiel proces heeft "special causes" (abnormale variatie).

Je moet eerst special causes adresseren voordat je het proces verbetert.

**Measure Gate Review**

Presenteer:
- Data collection plan en resultaten
- MSA resultaten
- Process map met value analysis
- Baseline performance metrics
- Control charts

Vraag: Is de data betrouwbaar? Mogen we door naar Analyze?

**Samenvatting**

De Measure fase:
- Definieert exact wat en hoe je meet (operational definitions)
- Valideert het meetsysteem (MSA)
- Brengt het proces in detail in kaart
- Kwantificeert de huidige prestatie (baseline)
- Bereidt voor op root cause analyse`,
      keyTakeaways: [
        'Operational definitions are crucial for reliable data',
        'Validate the measurement system with MSA before drawing conclusions',
        'Value-add analysis reveals where waste exists',
        'Baseline metrics provide the starting point for improvement',
      ],
      keyTakeawaysNL: [
        'Operational definitions zijn cruciaal voor betrouwbare data',
        'Valideer het meetsysteem met MSA voordat je conclusies trekt',
        'Value-add analysis onthult waar verspilling zit',
        'Baseline metrics geven het vertrekpunt voor verbetering',
      ],
      resources: [
        {
          name: 'Data Collection Plan Template',
          type: 'XLSX',
          size: '95 KB',
          description: 'Template voor datacollectie planning',
        },
        {
          name: 'Process Mapping Guide',
          type: 'PDF',
          size: '1.8 MB',
          description: 'Gids voor verschillende process mapping technieken',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 3: ANALYZE
// ============================================
const module3: Module = {
  id: 'lss-m3',
  title: 'Module 3: Analyze',
  titleNL: 'Module 3: Analyze',
  description: 'Find the root causes with data-driven analysis.',
  descriptionNL: 'Vind de root causes van het probleem met data-gedreven analyse.',
  lessons: [
    {
      id: 'lss-l5',
      title: 'Root Cause Analysis',
      titleNL: 'Root Cause Analysis',
      duration: '22:00',
      type: 'video',
      videoUrl: '',
      transcript: `De Analyze fase draait om één vraag: WAAROM bestaat dit probleem? 
In deze les leer je de kerntools voor root cause analysis.

**Het Doel van Analyze**

- Verifiëren van oorzaken met data
- Onderscheiden van symptomen en root causes
- Prioriteren van oorzaken voor verbetering

**Van Symptomen naar Root Causes**

Veel teams springen naar oplossingen zonder de echte oorzaak te begrijpen:

Symptoom: "Te lange wachttijd"
Oppervlakkige oorzaak: "Te weinig personeel"
Root cause: "Inefficiënte routing van klanten"

Als je de verkeerde oorzaak aanpakt, lost je het probleem niet op!

**De 5 Whys Techniek**

Simpel maar krachtig: vraag 5 keer "waarom?"

Probleem: Machine stopt
1. Waarom? De zekering sprong
2. Waarom? Overbelasting van de motor
3. Waarom? Lagers waren niet gesmeerd
4. Waarom? De smeerprocedure werd niet gevolgd
5. Waarom? Er was geen checklist voor onderhoud

Root cause: Ontbrekende onderhoudsprocedure!

Tips:
- Niet letterlijk 5, soms 3, soms 7
- Meerdere takken kunnen ontstaan
- Baseer antwoorden op feiten, niet aannames

**Ishikawa Diagram (Fishbone)**

Visualiseert potentiële oorzaken in categorieën.

**6M's voor Manufacturing:**
- Man (mensen)
- Machine
- Method (proces)
- Material
- Measurement
- Mother Nature (omgeving)

**6P's voor Services:**
- People
- Process
- Policy
- Place
- Procedure
- Product

Hoe te maken:
1. Teken de "vis": effect rechts, graat links
2. Teken hoofdtakken (categorieën)
3. Brainstorm oorzaken per categorie
4. Vraag "waarom" voor sub-oorzaken
5. Identificeer meest waarschijnlijke oorzaken

**Pareto Analyse**

Het 80/20 principe: 80% van effecten komt van 20% van oorzaken.

Stappen:
1. Verzamel data over oorzaken
2. Sorteer van groot naar klein
3. Bereken cumulatief percentage
4. Teken Pareto chart
5. Focus op de "vital few"

Als 3 van 20 oorzaken 80% van het probleem verklaren, focus daar op!

**Scatter Diagrams**

Toont relatie tussen twee variabelen:
- X-as: Potentiële oorzaak
- Y-as: Effect (Y/CTQ)

Patronen:
- Positieve correlatie: Punten gaan omhoog
- Negatieve correlatie: Punten gaan omlaag
- Geen correlatie: Random verspreid

Let op: Correlatie ≠ Causatie!

**Hypothesis Testing**

Statistisch verifiëren of een oorzaak significant is.

Basisproces:
1. Formuleer hypothesen:
   - H0 (null): Er is geen effect
   - H1 (alternatief): Er is wel effect
2. Bepaal significantieniveau (α, typisch 0.05)
3. Verzamel data
4. Bereken p-waarde
5. Conclusie: p < α → verwerp H0

Voorbeeld:
"Is er verschil in doorlooptijd tussen team A en team B?"
H0: Geen verschil
H1: Wel verschil
Als p = 0.02 < 0.05 → significant verschil!

**Regression Analysis**

Kwantificeert de relatie tussen variabelen.

Y = a + bX

- Y: Effect (wat je wilt verbeteren)
- X: Oorzaak (wat je kunt beïnvloeden)
- a: Intercept
- b: Helling (impact van X op Y)

R²: Verklaarde variatie (0-100%)
R² = 0.75 betekent: X verklaart 75% van variatie in Y

**Multi-Variate Analysis**

In de praktijk: meerdere X'en beïnvloeden Y.

Y = a + b₁X₁ + b₂X₂ + b₃X₃ + ...

Dit vereist:
- Voldoende data
- Statistische software
- Ervaring met interpretatie

**Samenvatting**

Root cause analysis:
- 5 Whys voor snelle eerste analyse
- Fishbone voor gestructureerde brainstorm
- Pareto voor prioritering
- Hypothesetesten voor verificatie
- Regression voor kwantificering`,
      keyTakeaways: [
        '5 Whys repeatedly asks "why" until the root cause is found',
        'Fishbone organizes causes into categories (6Ms or 6Ps)',
        'Pareto identifies the "vital few" causes (80/20)',
        'Hypothesis testing verifies whether causes are statistically significant',
      ],
      keyTakeawaysNL: [
        '5 Whys vraagt herhaaldelijk "waarom" tot de root cause',
        'Fishbone organiseert oorzaken in categorieën (6M\'s of 6P\'s)',
        'Pareto identificeert de "vital few" oorzaken (80/20)',
        'Hypothesetesten verifieert of oorzaken statistisch significant zijn',
      ],
      resources: [
        {
          name: 'Fishbone Template',
          type: 'XLSX',
          size: '125 KB',
          description: 'Template voor Ishikawa diagram',
        },
        {
          name: 'Statistical Test Selector',
          type: 'PDF',
          size: '280 KB',
          description: 'Beslisboom voor de juiste statistische test',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 4: IMPROVE
// ============================================
const module4: Module = {
  id: 'lss-m4',
  title: 'Module 4: Improve',
  titleNL: 'Module 4: Improve',
  description: 'Develop, test, and implement solutions.',
  descriptionNL: 'Ontwikkel, test en implementeer oplossingen.',
  lessons: [
    {
      id: 'lss-l6',
      title: 'Solution Generation & Implementation',
      titleNL: 'Solution Generation & Implementation',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      transcript: `Nu je de root causes kent, is het tijd voor oplossingen. 
De Improve fase transformeert inzichten in actie.

**Van Root Cause naar Oplossing**

Root causes uit Analyze vormen de basis:
- Voor elke root cause: welke oplossingen zijn mogelijk?
- Adresseer de oorzaak, niet het symptoom

**Brainstorming Technieken**

**Klassieke Brainstorm:**
- Geen kritiek tijdens generatie
- Kwantiteit boven kwaliteit eerst
- Bouw voort op ideeën van anderen
- Moedig wilde ideeën aan

**Brainwriting (6-3-5):**
- 6 mensen
- 3 ideeën elk
- 5 rondes (bouw voort op elkaars ideeën)
- Minder dominant door luidste persoon

**SCAMPER:**
- Substitute: Wat kunnen we vervangen?
- Combine: Wat kunnen we combineren?
- Adapt: Wat kunnen we aanpassen?
- Modify: Wat kunnen we vergroten/verkleinen?
- Put to other use: Andere toepassing?
- Eliminate: Wat kunnen we weglaten?
- Reverse: Wat als we het omdraaien?

**Benchmarking:**
- Hoe doen anderen het?
- Best practices uit andere industrieën?
- Interne best practices?

**Oplossingen Selecteren**

Na brainstorming: te veel ideeën. Hoe kies je?

**Impact/Effort Matrix:**

         Hoog     |  Quick Wins  |  Major Projects
Impact           |  Doe eerst!  |  Plannen & doen
         Laag    |  Fill-ins    |  Vermijden
                   Laag    Effort    Hoog

**Criteria Matrix (Pugh Matrix):**
1. Definieer criteria (kost, tijd, risico, impact)
2. Weeg criteria
3. Score elke oplossing per criterium
4. Bereken gewogen totaal
5. Hoogste score = beste optie

**FMEA voor Risico's**

Failure Mode and Effects Analysis:

Per oplossing:
- Wat kan falen? (Failure Mode)
- Wat is het effect? (Effect)
- Hoe ernstig? (Severity 1-10)
- Hoe vaak? (Occurrence 1-10)
- Hoe detecteerbaar? (Detection 1-10)

RPN = Severity × Occurrence × Detection

Hoog RPN = hoog risico → mitigeer of kies andere oplossing.

**Piloting**

Test oplossingen op kleine schaal voordat je breed uitrolt:
- Beperkt risico
- Leermogelijkheid
- Bewijs verzamelen
- Buy-in creëren

Pilot design:
- Representatieve omgeving
- Duidelijke success criteria
- Meetbare resultaten
- Tijdslimiet

**Implementation Planning**

Na succesvolle pilot: uitrol plannen.

Elementen:
- Wie doet wat wanneer?
- Welke training is nodig?
- Welke communicatie?
- Hoe meten we succes?
- Wat zijn go/no-go criteria?

**Change Management**

Technische oplossingen falen zonder adoptie.

Kotter's 8 stappen:
1. Urgentie creëren
2. Coalitie vormen
3. Visie ontwikkelen
4. Visie communiceren
5. Empoweren
6. Quick wins vieren
7. Consolideren
8. Verankeren in cultuur

**Samenvatting**

De Improve fase:
- Genereert oplossingen voor elke root cause
- Selecteert de beste oplossing met matrices
- Test met pilots voor breed uitrollen
- Plant implementatie zorgvuldig
- Beheert de menselijke kant van verandering`,
      keyTakeaways: [
        'Brainstorming generates options; matrices select the best',
        'FMEA identifies risks of solutions',
        'Pilots test solutions on a small scale',
        'Change management is essential for adoption',
      ],
      keyTakeawaysNL: [
        'Brainstorm genereert opties; matrices selecteren de beste',
        'FMEA identificeert risico\'s van oplossingen',
        'Pilots testen oplossingen op kleine schaal',
        'Change management is essentieel voor adoptie',
      ],
      resources: [
        {
          name: 'FMEA Template',
          type: 'XLSX',
          size: '145 KB',
          description: 'Template voor Failure Mode and Effects Analysis',
        },
        {
          name: 'Implementation Plan Template',
          type: 'DOCX',
          size: '185 KB',
          description: 'Template voor implementatieplanning',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 5: CONTROL
// ============================================
const module5: Module = {
  id: 'lss-m5',
  title: 'Module 5: Control',
  titleNL: 'Module 5: Control',
  description: 'Sustain improvements and prevent backsliding.',
  descriptionNL: 'Borg de verbetering en voorkom terugval.',
  lessons: [
    {
      id: 'lss-l7',
      title: 'Statistical Process Control',
      titleNL: 'Statistical Process Control',
      duration: '25:00',
      type: 'video',
      videoUrl: '',
      transcript: `De Control fase zorgt dat verbeteringen blijvend zijn. 
Zonder control glijden processen terug naar de oude situatie.

**Het Doel van Control**

- Verbeteringen borgen
- Variatie monitoren
- Afwijkingen vroeg detecteren
- Terugval voorkomen

**De Control Chart**

Het kernwapen van SPC (Statistical Process Control).

Elementen:
- Centrale lijn (CL): Gemiddelde
- Upper Control Limit (UCL): +3 sigma
- Lower Control Limit (LCL): -3 sigma
- Datapunten over tijd

**Common Cause vs. Special Cause Variation**

**Common Cause:**
- Normale, inherente variatie
- Random, voorspelbaar
- Binnen control limits
- Vereist procesverandering om te reduceren

**Special Cause:**
- Abnormale variatie
- Specifieke, identificeerbare oorzaak
- Buiten control limits of patronen
- Vereist onderzoek en correctie

**Out-of-Control Signalen**

Het proces is "out of control" als:
1. Punt buiten control limits
2. 7+ punten aan één kant van CL (run)
3. 7+ punten stijgend of dalend (trend)
4. 2 van 3 punten in zone A (buiten 2 sigma)
5. 4 van 5 punten in zone B (buiten 1 sigma)

Bij out-of-control: onderzoek en corrigeer!

**Types Control Charts**

Voor continue data:
- **X-bar en R chart**: Gemiddelde en range van subgroepen
- **X-bar en S chart**: Gemiddelde en standaarddeviatie
- **I-MR chart**: Individuele waarden en moving range

Voor discrete data:
- **P chart**: Proportie defects
- **NP chart**: Aantal defects (vaste sample size)
- **C chart**: Defects per unit (vaste opportunity)
- **U chart**: Defects per unit (variabele opportunity)

**Het Control Plan**

Document dat beschrijft hoe het proces wordt beheerst:

Per processtap:
- Wat wordt gemeten?
- Hoe vaak?
- Met welk instrument?
- Wie is verantwoordelijk?
- Wat zijn de control limits?
- Wat te doen bij afwijking?

**Reaction Plan**

Wat doe je als het proces out of control gaat?

1. Stop productie (indien nodig)
2. Quarantaine verdachte output
3. Onderzoek root cause
4. Corrigeer
5. Valideer fix
6. Documenteer

**Standard Operating Procedures (SOPs)**

Documenteer de verbeterde werkwijze:
- Stap-voor-stap instructies
- Inclusief control checks
- Visuele hulpmiddelen
- Training materiaal

**Training**

Zorg dat iedereen:
- De nieuwe werkwijze begrijpt
- Weet waarom het belangrijk is
- Kan reageren op afwijkingen
- Weet waar hulp te vinden

**Visual Management**

Maak status zichtbaar:
- Control charts op de werkvloer
- Kleurcodering (rood/groen)
- Dashboards
- Andon systemen

**Overdracht aan Process Owner**

Na project closure:
- Control plan overhandigen
- Training afgerond
- Verantwoordelijkheden helder
- Escalatieprocedures bekend

De Process Owner is nu verantwoordelijk voor ongoing control.

**Samenvatting**

De Control fase:
- Gebruikt control charts voor monitoring
- Onderscheidt common en special cause variation
- Documenteert in Control Plan en SOPs
- Traint medewerkers
- Draagt over aan Process Owner`,
      keyTakeaways: [
        'Control charts detect out-of-control conditions early',
        'Special cause variation requires investigation and correction',
        'The Control Plan describes who measures what and what to do when deviations occur',
        'Handover to Process Owner ensures long-term success',
      ],
      keyTakeawaysNL: [
        'Control charts detecteren out-of-control condities vroeg',
        'Special cause variation vereist onderzoek en correctie',
        'Het Control Plan beschrijft wie wat meet en wat te doen bij afwijking',
        'Overdracht aan Process Owner borgt langetermijn succes',
      ],
      resources: [
        {
          name: 'Control Plan Template',
          type: 'XLSX',
          size: '165 KB',
          description: 'Template voor Control Plan',
        },
        {
          name: 'Control Chart Calculator',
          type: 'XLSX',
          size: '280 KB',
          description: 'Excel tool voor control chart berekeningen',
        },
      ],
    },
    {
      id: 'lss-l8',
      title: 'Project Closure & Benefits Tracking',
      titleNL: 'Project Closure & Benefits Tracking',
      duration: '15:00',
      type: 'video',
      videoUrl: '',
      transcript: `Het Lean Six Sigma project is bijna klaar. Nu de laatste stappen: 
afsluiting en benefits tracking.

**DMAIC Project Closure**

**Tollgate Review**

Formele review aan het einde van elke fase:
- Zijn alle deliverables compleet?
- Is de kwaliteit voldoende?
- Mag het project door naar volgende fase?

Control Tollgate checkt:
- Control plan geïmplementeerd
- Training afgerond
- Proces stabiel
- Benefits gerealiseerd of gepland

**Project Documentation**

Archiveer alles:
- Project charter
- Data analyses
- Root cause analyse
- Oplossing design
- Pilot resultaten
- Control plan
- Training materiaal
- Benefits berekening

**Financial Validation**

Finance team valideert de besparingen:
- Hard savings (direct op P&L)
- Soft savings (productiviteit, maar geen FTE reductie)
- Cost avoidance (voorkomen van kosten)

Dit geeft credibiliteit aan LSS resultaten.

**Benefits Tracking**

Na project: monitor benefits over tijd.

**Dashboard elementen:**
- Baseline vs. current performance
- Target vs. actual benefits
- Trend over tijd
- Sustainability check

**Typisch:**
- Maandelijkse review eerste 6 maanden
- Kwartaallijks daarna
- Jaarlijkse review

**Knowledge Sharing**

Deel successen en learnings:
- Project storyboard
- Presentatie aan management
- Lessons learned database
- Best practice sharing

Dit bouwt organisatorisch capability.

**Team Recognition**

Vergeet niet te vieren:
- Erken teamleden
- Vier met stakeholders
- Deel succes breed

Dit motiveert voor volgende projecten.

**Continue Verbetering**

Het project eindigt, maar verbetering niet:
- Zijn er follow-on projecten?
- Welke processen nog aanpakken?
- Hoe capability opbouwen?

LSS is een cultuur, niet alleen een project.

**Samenvatting**

Project closure:
- Tollgate review bevestigt completering
- Finance valideert besparingen
- Benefits worden langdurig getracked
- Kennis wordt gedeeld
- Succes wordt gevierd`,
      keyTakeaways: [
        'Tollgate review confirms that all deliverables are complete',
        'Finance validation gives credibility to savings',
        'Benefits tracking ensures long-term monitoring',
        'Knowledge sharing builds organizational capability',
      ],
      keyTakeawaysNL: [
        'Tollgate review bevestigt dat alle deliverables compleet zijn',
        'Finance validatie geeft credibiliteit aan besparingen',
        'Benefits tracking zorgt voor langdurige monitoring',
        'Knowledge sharing bouwt organisatorisch capability',
      ],
      resources: [
        {
          name: 'Project Storyboard Template',
          type: 'PPTX',
          size: '1.2 MB',
          description: 'Template voor project presentatie',
        },
        {
          name: 'Benefits Tracking Template',
          type: 'XLSX',
          size: '145 KB',
          description: 'Template voor benefits monitoring',
        },
      ],
    },
    {
      id: 'lss-l9',
      title: 'Final Exam',
      titleNL: 'Eindexamen',
      duration: '60:00',
      type: 'exam',
      videoUrl: '',
      transcript: `Dit is het eindexamen van de Lean Six Sigma Green Belt cursus.

**Examen Informatie:**
- 50 multiple choice vragen
- 90 minuten tijd
- 70% score nodig om te slagen

**Onderwerpen:**
- Lean fundamenten (8 verspillingen, 5 principes)
- Six Sigma concept (sigma levels, DPMO)
- Define fase (Project Charter, VOC, CTQ, SIPOC)
- Measure fase (MSA, baseline, process mapping)
- Analyze fase (5 Whys, Fishbone, Pareto, hypothesetesten)
- Improve fase (brainstorming, FMEA, piloting, change management)
- Control fase (control charts, SPC, control plan)

**Tip:** Denk bij elke vraag: "Welke fase van DMAIC?"

Succes!`,
    },
    {
      id: 'lss-l10',
      title: 'Certificate',
      titleNL: 'Certificaat',
      duration: '5:00',
      type: 'certificate',
      videoUrl: '',
      transcript: `Gefeliciteerd met het afronden van de Lean Six Sigma Green Belt cursus!

**Je Certificaat**

Je ontvangt een certificaat dat bevestigt:
- Cursus: Lean Six Sigma Green Belt
- Duur: 24 uur
- Onderwerpen: DMAIC, Lean, Six Sigma tools
- Datum van afronding

**Green Belt Competenties**

Je bent nu in staat om:
- DMAIC projecten te leiden
- Data-gedreven beslissingen te nemen
- Root cause analysis uit te voeren
- Verbeteringen te implementeren en borgen

**Vervolgstappen**

1. **Project**: Voer een verbeterproject uit in je organisatie
2. **Certificering**: Overweeg externe certificering (ASQ, IASSC)
3. **Verdieping**: Volg Black Belt training
4. **Community**: Word lid van LSS networks

Veel succes met je verbeterprojecten!`,
    },
  ],
};

// ============================================
// EXPORT MODULES
// ============================================
export const leanSixSigmaModules: Module[] = [
  module1,
  module2,
  module3,
  module4,
  module5,
];

// ============================================
// COURSE DEFINITION
// ============================================
export const leanSixSigmaCourse: Course = {
  id: 'lean-six-sigma',
  title: 'Lean Six Sigma Green Belt',
  titleNL: 'Lean Six Sigma Green Belt',
  description: 'Data-driven process improvement. Master the DMAIC methodology for measurable, sustainable results.',
  descriptionNL: 'Data-gedreven procesverbetering. Beheers de DMAIC-methodologie voor meetbare, duurzame resultaten.',
  icon: TrendingUp,
  color: BRAND.cyan,
  gradient: `linear-gradient(135deg, ${BRAND.cyan}, #0891B2)`,
  category: 'process',
  methodology: 'lean_six_sigma',
  levels: 4,
  modules: leanSixSigmaModules.reduce((total, m) => total + m.lessons.length, 0),
  duration: 24,
  rating: 4.7,
  students: 5892,
  tags: ['Lean', 'Six Sigma', 'DMAIC', 'Process', 'Quality', 'Data Analysis', 'Root Cause'],
  tagsNL: ['Lean', 'Six Sigma', 'DMAIC', 'Proces', 'Kwaliteit', 'Data Analyse', 'Root Cause'],
  instructor: instructors.mark,
  featured: true,
  bestseller: false,
  new: false,
  freeForCustomers: true,
  certificate: true,
  whatYouLearn: [
    'The complete DMAIC methodology',
    'Lean principles and 8 wastes (TIMWOODS)',
    'Six Sigma quality levels and metrics',
    'Define: Project Charter, VOC, CTQ, SIPOC',
    'Measure: MSA, process mapping, baseline metrics',
    'Analyze: 5 Whys, Fishbone, Pareto, hypothesis testing',
    'Improve: FMEA, piloting, change management',
    'Control: SPC, control charts, control plans',
  ],
  whatYouLearnNL: [
    'De complete DMAIC-methodologie',
    'Lean principes en 8 verspillingen (TIMWOODS)',
    'Six Sigma kwaliteitsniveaus en metrics',
    'Define: Project Charter, VOC, CTQ, SIPOC',
    'Measure: MSA, process mapping, baseline metrics',
    'Analyze: 5 Whys, Fishbone, Pareto, hypothesetesten',
    'Improve: FMEA, piloting, change management',
    'Control: SPC, control charts, control plans',
  ],
  requirements: [
    'Basic Excel knowledge',
    'Some work experience with processes',
    'Motivation to work with data',
  ],
  requirementsNL: [
    'Basiskennis van Excel',
    'Enige werkervaring in processen',
    'Motivatie om met data te werken',
  ],
  targetAudience: [
    'Process improvement professionals',
    'Quality managers',
    'Project managers wanting data-driven approaches',
    'Operations managers',
    'Anyone wanting to achieve measurable improvements',
  ],
  targetAudienceNL: [
    'Procesverbeteraars',
    'Quality managers',
    'Projectmanagers die data-gedreven willen werken',
    'Operations managers',
    'Iedereen die meetbare verbeteringen wil realiseren',
  ],
  courseModules: leanSixSigmaModules,
};

export default leanSixSigmaCourse;