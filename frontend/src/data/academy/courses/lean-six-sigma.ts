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
  order: 0,
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
      keyTakeawaysEN: [
        'Lean focuses on waste, Six Sigma on variation',
        'DMAIC = Define, Measure, Analyze, Improve, Control',
        '8 wastes: TIMWOODS',
        'Six Sigma = 3.4 defects per million opportunities',
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
      keyTakeawaysEN: [
        'A good problem statement contains no causes or solutions',
        'VOC → Needs → CTQs form the basis for measurements',
        'SIPOC provides high-level process insight',
        'Define ends with an approved Project Charter',
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
          question: 'What does DMAIC stand for?',
          questionNL: 'Wat betekent DMAIC?',
          options: [
            'Design, Make, Analyze, Implement, Check',
            'Define, Measure, Analyze, Improve, Control',
            'Define, Monitor, Act, Improve, Close',
            'Develop, Measure, Assess, Integrate, Complete'
          ],
          optionsNL: [
            'Design, Make, Analyze, Implement, Check',
            'Define, Measure, Analyze, Improve, Control',
            'Define, Monitor, Act, Improve, Close',
            'Develop, Measure, Assess, Integrate, Complete'
          ],
          correctAnswer: 1,
          explanation: 'DMAIC stands for Define, Measure, Analyze, Improve, Control — the five-phase structured problem-solving methodology at the core of Six Sigma.',
          explanationNL: 'DMAIC staat voor Define, Measure, Analyze, Improve, Control — de vijffasige gestructureerde probleemoplossingsmethodologie die de kern vormt van Six Sigma.',
        },
        {
          id: 'lss-q2',
          question: 'Which of the following does NOT belong in a good problem statement?',
          questionNL: 'Wat hoort NIET in een goede problem statement?',
          options: [
            'The current performance level',
            'The business impact',
            'The cause of the problem',
            'A measurable description'
          ],
          optionsNL: [
            'De huidige performance',
            'De business impact',
            'De oorzaak van het probleem',
            'Een meetbare beschrijving'
          ],
          correctAnswer: 2,
          explanation: 'A problem statement must not include causes or solutions — those are discovered later in the Analyze and Improve phases respectively. Including them biases the investigation.',
          explanationNL: 'Een problem statement mag geen oorzaken of oplossingen bevatten — die worden later gevonden in respectievelijk de Analyze- en Improve-fase. Ze opnemen beïnvloedt het onderzoek.',
        },
        {
          id: 'lss-q3',
          question: 'What is a CTQ?',
          questionNL: 'Wat is een CTQ?',
          options: [
            'Cost To Quality — the cost of quality',
            'Critical To Quality — a measurable customer requirement',
            'Control The Quality — a control method',
            'Customer Total Quality — total customer quality'
          ],
          optionsNL: [
            'Cost To Quality - de kosten van kwaliteit',
            'Critical To Quality - een meetbare klantbehoefte',
            'Control The Quality - een controle methode',
            'Customer Total Quality - totale klantkwaliteit'
          ],
          correctAnswer: 1,
          explanation: 'CTQ = Critical To Quality, a measurable translation of customer needs derived from the Voice of the Customer (VOC).',
          explanationNL: 'CTQ = Critical To Quality, een meetbare vertaling van klantbehoeften afgeleid van de Voice of the Customer (VOC).',
        },
        {
          id: 'lss-q4',
          question: 'Which of the following is NOT one of the 8 wastes in the DOWNTIME mnemonic?',
          questionNL: 'Welk van de volgende is GEEN van de 8 verspillingen in het DOWNTIME-ezelsbruggetje?',
          options: [
            'Non-utilized talent',
            'Transportation',
            'Documentation',
            'Overproduction'
          ],
          optionsNL: [
            'Niet-benut talent',
            'Transport',
            'Documentatie',
            'Overproductie'
          ],
          correctAnswer: 2,
          explanation: 'DOWNTIME stands for Defects, Overproduction, Waiting, Non-utilized talent, Transportation, Inventory, Motion, Extra-processing. Documentation is not one of the 8 wastes.',
          explanationNL: 'DOWNTIME staat voor Defects (Defecten), Overproduction (Overproductie), Waiting (Wachten), Non-utilized talent (Niet-benut talent), Transportation (Transport), Inventory (Voorraad), Motion (Beweging), Extra-processing (Extra bewerking). Documentatie hoort hier niet bij.',
        },
        {
          id: 'lss-q5',
          question: 'In SIPOC, what does the "S" stand for?',
          questionNL: 'In SIPOC, waar staat de "S" voor?',
          options: [
            'Standards',
            'Suppliers',
            'Scope',
            'Stakeholders'
          ],
          optionsNL: [
            'Standaarden',
            'Leveranciers',
            'Scope',
            'Stakeholders'
          ],
          correctAnswer: 1,
          explanation: 'SIPOC stands for Suppliers, Inputs, Process, Outputs, Customers. It is a high-level process map used in the Define phase to establish scope.',
          explanationNL: 'SIPOC staat voor Suppliers (Leveranciers), Inputs, Process (Proces), Outputs, Customers (Klanten). Het is een high-level proceskaart die in de Define fase wordt gebruikt om scope vast te stellen.',
        },
        {
          id: 'lss-q6',
          question: 'What is the primary purpose of a Project Charter in the Define phase?',
          questionNL: 'Wat is het primaire doel van een Project Charter in de Define fase?',
          options: [
            'To document the root cause of the problem',
            'To formally authorize the project and align stakeholders on scope, goal, and timeline',
            'To list all possible solutions to the problem',
            'To establish the control plan for sustaining improvements'
          ],
          optionsNL: [
            'Om de grondoorzaak van het probleem te documenteren',
            'Om het project formeel te autoriseren en stakeholders te aligneren op scope, doel en tijdlijn',
            'Om alle mogelijke oplossingen voor het probleem op te sommen',
            'Om het controleplan op te stellen voor het borgen van verbeteringen'
          ],
          correctAnswer: 1,
          explanation: 'The Project Charter formally authorizes the LSS project, aligns all stakeholders on the problem statement, goal (SMART), scope, team, and timeline. It is the primary deliverable of the Define phase.',
          explanationNL: 'Het Project Charter autoriseert het LSS-project formeel en aligneert alle stakeholders op de probleemstelling, het doel (SMART), scope, team en tijdlijn. Het is de primaire deliverable van de Define fase.',
        },
        {
          id: 'lss-q7',
          question: 'Voice of the Customer (VOC) data is transformed into measurable CTQs through which sequence?',
          questionNL: 'Via welke volgorde worden Voice of the Customer (VOC)-data omgezet in meetbare CTQs?',
          options: [
            'VOC → Solutions → CTQs',
            'VOC → Needs → CTQs',
            'VOC → SIPOC → CTQs',
            'VOC → FMEA → CTQs'
          ],
          optionsNL: [
            'VOC → Oplossingen → CTQs',
            'VOC → Behoeften → CTQs',
            'VOC → SIPOC → CTQs',
            'VOC → FMEA → CTQs'
          ],
          correctAnswer: 1,
          explanation: 'The VOC → Needs → CTQs sequence is the standard LSS approach: capture customer voice, translate it into underlying needs, then convert needs into measurable Critical-to-Quality requirements.',
          explanationNL: 'De VOC → Behoeften → CTQs-volgorde is de standaard LSS-aanpak: klantgeluiden vastleggen, vertalen naar onderliggende behoeften en die behoeften omzetten in meetbare Critical-to-Quality-eisen.',
        },
        {
          id: 'lss-q8',
          question: 'At a Six Sigma performance level, approximately how many Defects Per Million Opportunities (DPMO) are expected?',
          questionNL: 'Bij een Six Sigma prestatieniveau, hoeveel Defects Per Million Opportunities (DPMO) worden er ongeveer verwacht?',
          options: [
            '66,807 DPMO',
            '6,210 DPMO',
            '3.4 DPMO',
            '233 DPMO'
          ],
          optionsNL: [
            '66.807 DPMO',
            '6.210 DPMO',
            '3,4 DPMO',
            '233 DPMO'
          ],
          correctAnswer: 2,
          explanation: 'Six Sigma quality means only 3.4 DPMO, assuming a 1.5-sigma long-term shift. This corresponds to 99.99966% of outputs meeting specifications.',
          explanationNL: 'Six Sigma kwaliteit betekent slechts 3,4 DPMO, uitgaande van een 1,5-sigma langetermijnverschuiving. Dit komt overeen met 99,99966% van de outputs die aan de specificaties voldoen.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 2: MEASURE
// ============================================
const module2: Module = {
  order: 1,
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
      keyTakeawaysEN: [
        'Operational definitions are crucial for reliable data',
        'Validate the measurement system with MSA before drawing conclusions',
        'Value-add analysis reveals where waste exists',
        'Baseline metrics provide the starting point for improvement',
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
  order: 2,
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
      keyTakeawaysEN: [
        '5 Whys repeatedly asks "why" until reaching the root cause',
        'Fishbone organizes causes into categories (6Ms or 6Ps)',
        'Pareto identifies the "vital few" causes (80/20)',
        'Hypothesis testing verifies whether causes are statistically significant',
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
  order: 3,
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
      keyTakeawaysEN: [
        'Brainstorming generates options; matrices select the best',
        'FMEA identifies risks associated with solutions',
        'Pilots test solutions on a small scale',
        'Change management is essential for adoption',
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
  order: 4,
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
      keyTakeawaysEN: [
        'Control charts detect out-of-control conditions early',
        'Special cause variation requires investigation and correction',
        'The Control Plan describes who measures what and what to do when deviations occur',
        'Handover to the Process Owner ensures long-term success',
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
      keyTakeawaysEN: [
        'Tollgate review confirms that all deliverables are complete',
        'Financial validation gives credibility to savings',
        'Benefits tracking ensures long-term monitoring',
        'Knowledge sharing builds organizational capability',
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
      id: 'lss-l-assignment',
      title: 'Praktijkopdracht: DMAIC — Hydraulisch Defecten Reductieproject',
      titleNL: 'Praktijkopdracht: DMAIC — Hydraulisch Defecten Reductieproject',
      duration: '120:00',
      type: 'assignment',
      requires_admin_approval: true,
      assignment: {
        title: 'Pas DMAIC toe op een hydraulisch defecten reductieproject',
        description: `Een maakindustriebedrijf produceert hydraulische cilinders voor industriële machines. De afdeling kwaliteit meldt een defectpercentage van 4,2% — ver boven de target van 1,5%. De productiedirecteur heeft jou aangesteld als Green Belt om het probleem te analyseren en een duurzame verbetering te realiseren.

Lever per DMAIC-fase de gevraagde documenten in.`,
        deliverables: [
          'Define — Project Charter met: probleemstelling, projectdoel (SMART), scope (in/out), tijdlijn, en Business Case',
          'Measure — SIPOC-diagram + baseline-metrics (defectpercentage, Cp/Cpk als van toepassing, meetmethode)',
          'Analyze — Fishbone-diagram (Ishikawa) met minimaal 6 categorieën en 3 oorzaken per categorie; top-3 root causes onderbouwd',
          'Improve — FMEA met top-5 risico\'s (RPN-score = Severity × Occurrence × Detection) en bijbehorende verbetermaatregelen',
          'Control — Controleplan met: 3 KPI\'s, meetfrequentie, verantwoordelijke, en reactieplan bij afwijking',
        ],
        rubric: [
          { criterion: 'Project Charter volledig en SMART-geformuleerd', points: 15 },
          { criterion: 'SIPOC correct ingevuld (alle 5 kolommen)', points: 15 },
          { criterion: 'Fishbone alle 6 categorieën aanwezig en oorzaken relevant', points: 20 },
          { criterion: 'FMEA met correcte RPN-berekening en prioritering', points: 25 },
          { criterion: 'Controleplan uitvoerbaar en sluitend op de root causes', points: 25 },
        ],
        submission_format: 'markdown',
      },
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
      quiz: [
        {
          id: 'lss-exam-q1',
          question: 'Which DMAIC phase establishes the project scope, problem statement, and business case?',
          questionNL: 'Welke DMAIC-fase stelt de projectscope, probleemstelling en businesscase vast?',
          options: [
            'Measure',
            'Define',
            'Analyze',
            'Control'
          ],
          optionsNL: [
            'Measure',
            'Define',
            'Analyze',
            'Control'
          ],
          correctAnswer: 1,
          explanation: 'The Define phase kicks off a DMAIC project by documenting the problem statement, business case, scope, and team in the Project Charter. No root causes or solutions are included here.',
          explanationNL: 'De Define fase start een DMAIC-project door de probleemstelling, businesscase, scope en het team vast te leggen in het Project Charter. Grondoorzaken of oplossingen horen hier nog niet in.',
        },
        {
          id: 'lss-exam-q2',
          question: 'A Green Belt maps customer requirements to measurable process outcomes. Which tool is used first to capture the raw customer voice?',
          questionNL: 'Een Green Belt brengt klanteisen in kaart als meetbare procesresultaten. Welk hulpmiddel wordt het eerst gebruikt om de ruwe klantenstem vast te leggen?',
          options: [
            'Control chart',
            'FMEA',
            'Voice of the Customer (VOC)',
            'Process capability study'
          ],
          optionsNL: [
            'Regelkaart',
            'FMEA',
            'Voice of the Customer (VOC)',
            'Procescapabiliteitsstudie'
          ],
          correctAnswer: 2,
          explanation: 'VOC is the structured method for capturing what customers say they need. It is the raw input that is later translated through Needs into CTQs.',
          explanationNL: 'VOC is de gestructureerde methode om vast te leggen wat klanten zeggen nodig te hebben. Het is de ruwe input die later via Behoeften wordt omgezet in CTQs.',
        },
        {
          id: 'lss-exam-q3',
          question: 'In the DOWNTIME model, the letter "N" represents which waste?',
          questionNL: 'In het DOWNTIME-model vertegenwoordigt de letter "N" welke verspilling?',
          options: [
            'Noise in the process',
            'Non-conformance costs',
            'Non-utilized talent',
            'Narrow bottlenecks'
          ],
          optionsNL: [
            'Ruis in het proces',
            'Niet-conformiteitskosten',
            'Niet-benut talent',
            'Nauwe knelpunten'
          ],
          correctAnswer: 2,
          explanation: 'N in DOWNTIME = Non-utilized talent (also called Skills waste). It refers to failing to leverage the knowledge, skills, and experience of employees.',
          explanationNL: 'N in DOWNTIME = Niet-benut talent (ook wel Vaardigheidsverspilling). Het verwijst naar het niet benutten van kennis, vaardigheden en ervaring van medewerkers.',
        },
        {
          id: 'lss-exam-q4',
          question: 'What does process capability index Cpk measure?',
          questionNL: 'Wat meet de procescapabiliteitsindex Cpk?',
          options: [
            'The speed of the process relative to takt time',
            'How well the process is centred within its specification limits',
            'The number of defects per million opportunities',
            'The ratio of value-added to non-value-added time'
          ],
          optionsNL: [
            'De snelheid van het proces ten opzichte van de takttijd',
            'Hoe goed het proces gecentreerd is binnen zijn specificatiegrenzen',
            'Het aantal defecten per miljoen kansen',
            'De verhouding tussen waarde-toevoegende en niet-waarde-toevoegende tijd'
          ],
          correctAnswer: 1,
          explanation: 'Cpk accounts for both spread and centering: it measures whether the process mean is centred relative to its specification limits. A Cpk ≥ 1.33 is generally considered capable.',
          explanationNL: 'Cpk houdt rekening met zowel spreiding als centrering: het meet of het procesgemiddelde gecentreerd is ten opzichte van de specificatiegrenzen. Een Cpk ≥ 1,33 wordt over het algemeen als capabel beschouwd.',
        },
        {
          id: 'lss-exam-q5',
          question: 'A fishbone (Ishikawa) diagram is used in which DMAIC phase?',
          questionNL: 'In welke DMAIC-fase wordt een visgraatdiagram (Ishikawa) gebruikt?',
          options: [
            'Define',
            'Measure',
            'Analyze',
            'Control'
          ],
          optionsNL: [
            'Define',
            'Measure',
            'Analyze',
            'Control'
          ],
          correctAnswer: 2,
          explanation: 'The fishbone / Ishikawa diagram is a root cause analysis tool used in the Analyze phase to brainstorm and categorise potential causes of the problem.',
          explanationNL: 'Het visgraatdiagram / Ishikawa is een root-cause-analysetools die in de Analyze fase wordt gebruikt om mogelijke oorzaken van het probleem te brainstormen en te categoriseren.',
        },
        {
          id: 'lss-exam-q6',
          question: 'Which statement best describes common cause variation?',
          questionNL: 'Welke uitspraak beschrijft gemeenschappelijke oorzaakvariatie het best?',
          options: [
            'Variation caused by a specific, identifiable event',
            'Variation that is inherent and predictable in a stable process',
            'Variation that always requires immediate corrective action',
            'Variation only found in the Improve phase'
          ],
          optionsNL: [
            'Variatie veroorzaakt door een specifieke, identificeerbare gebeurtenis',
            'Variatie die inherent en voorspelbaar is in een stabiel proces',
            'Variatie die altijd onmiddellijke corrigerende actie vereist',
            'Variatie die alleen in de Improve fase voorkomt'
          ],
          correctAnswer: 1,
          explanation: 'Common cause variation (also called random or noise variation) is the natural, inherent variation in a stable process. It requires systemic process change — not firefighting — to reduce.',
          explanationNL: 'Gemeenschappelijke oorzaakvariatie (ook wel willekeurige of ruisvariatie) is de natuurlijke, inherente variatie in een stabiel proces. Het vereist systeemwijzigingen — geen brandblussing — om te verminderen.',
        },
        {
          id: 'lss-exam-q7',
          question: 'In Statistical Process Control (SPC), a control chart signals a special cause when:',
          questionNL: 'In Statistische Procesbeheersing (SPC) signaleert een regelkaart een bijzondere oorzaak wanneer:',
          options: [
            'All points fall randomly within the control limits',
            'A point falls outside the upper or lower control limits',
            'The process mean shifts by exactly 1 sigma',
            'The sample size drops below 10'
          ],
          optionsNL: [
            'Alle punten willekeurig binnen de regelgrenzen vallen',
            'Een punt buiten de bovenste of onderste regelgrens valt',
            'Het procesgemiddelde precies 1 sigma verschuift',
            'De steekproefgrootte daalt onder 10'
          ],
          correctAnswer: 1,
          explanation: 'A point outside the control limits (UCL/LCL) is the primary signal of special cause variation requiring investigation and corrective action. Additional run rules (e.g., 8 consecutive points on one side) also detect special causes.',
          explanationNL: 'Een punt buiten de regelgrenzen (UCL/LCL) is het primaire signaal van bijzondere oorzaakvariatie dat onderzoek en corrigerende actie vereist. Aanvullende loopregels (bijv. 8 opeenvolgende punten aan één kant) detecteren ook bijzondere oorzaken.',
        },
        {
          id: 'lss-exam-q8',
          question: 'Takt time is defined as:',
          questionNL: 'Takttijd wordt gedefinieerd als:',
          options: [
            'The time it takes to complete one cycle of a process',
            'Available production time divided by customer demand rate',
            'The time a product spends waiting in queue',
            'The maximum time allowed for value-added work only'
          ],
          optionsNL: [
            'De tijd die nodig is om één cyclus van een proces te voltooien',
            'Beschikbare productietijd gedeeld door de klantenvraagsnelheid',
            'De tijd die een product in de wachtrij doorbrengt',
            'De maximale tijd toegestaan voor alleen waarde-toevoegende werkzaamheden'
          ],
          correctAnswer: 1,
          explanation: 'Takt time = Available production time ÷ Customer demand rate. It sets the rhythm the process must match to meet customer demand without over- or under-producing.',
          explanationNL: 'Takttijd = Beschikbare productietijd ÷ Klantenvraagsnelheid. Het stelt het ritme in waaraan het proces moet voldoen om aan de klantvraag te voldoen zonder over- of onderproductie.',
        },
        {
          id: 'lss-exam-q9',
          question: 'A Pareto chart is based on which principle?',
          questionNL: 'Een Pareto-diagram is gebaseerd op welk principe?',
          options: [
            'All defect causes contribute equally to the total',
            'Approximately 80% of effects come from 20% of causes',
            'The first cause identified is always the most important',
            'Defects follow a normal distribution around the mean'
          ],
          optionsNL: [
            'Alle defectoorzaken dragen gelijkelijk bij aan het totaal',
            'Ongeveer 80% van de effecten komt van 20% van de oorzaken',
            'De eerste geïdentificeerde oorzaak is altijd de belangrijkste',
            'Defecten volgen een normale verdeling rond het gemiddelde'
          ],
          correctAnswer: 1,
          explanation: 'The Pareto Principle (80/20 rule) states that roughly 80% of problems stem from 20% of causes. A Pareto chart visually prioritises the "vital few" causes to focus improvement efforts.',
          explanationNL: 'Het Pareto-principe (80/20-regel) stelt dat ongeveer 80% van de problemen voortkomt uit 20% van de oorzaken. Een Pareto-diagram visualiseert de "vitale weinigen" oorzaken om verbeterinspanningen te prioriteren.',
        },
        {
          id: 'lss-exam-q10',
          question: 'In FMEA, the Risk Priority Number (RPN) is calculated as:',
          questionNL: 'In FMEA wordt het Risico Prioriteitsnummer (RPN) berekend als:',
          options: [
            'Severity + Occurrence + Detection',
            'Severity × Occurrence × Detection',
            'Severity × Occurrence ÷ Detection',
            'Severity ÷ (Occurrence × Detection)'
          ],
          optionsNL: [
            'Ernst + Optreden + Detectie',
            'Ernst × Optreden × Detectie',
            'Ernst × Optreden ÷ Detectie',
            'Ernst ÷ (Optreden × Detectie)'
          ],
          correctAnswer: 1,
          explanation: 'RPN = Severity × Occurrence × Detection. Each factor is rated 1–10. A higher RPN indicates a higher risk that should be prioritised for corrective action in the Improve phase.',
          explanationNL: 'RPN = Ernst × Optreden × Detectie. Elk factor wordt beoordeeld op 1–10. Een hoger RPN duidt op een hoger risico dat geprioriteerd moet worden voor corrigerende actie in de Improve fase.',
        },
        {
          id: 'lss-exam-q11',
          question: 'Which tool is used in the Measure phase to assess whether a measurement system itself is reliable?',
          questionNL: 'Welk hulpmiddel wordt in de Measure fase gebruikt om te beoordelen of een meetsysteem zelf betrouwbaar is?',
          options: [
            '5 Whys analysis',
            'Gauge R&R (Measurement System Analysis)',
            'Control chart',
            'Value stream map'
          ],
          optionsNL: [
            '5 Waarom-analyse',
            'Gauge R&R (Meetsysteemanalyse)',
            'Regelkaart',
            'Waardestroom kaart'
          ],
          correctAnswer: 1,
          explanation: 'Gauge Repeatability & Reproducibility (Gauge R&R) is the Measurement System Analysis (MSA) tool that quantifies variation introduced by the measurement system itself (equipment + operators), ensuring data quality before baseline analysis.',
          explanationNL: 'Gauge Herhaalbaarheid & Reproduceerbaarheid (Gauge R&R) is het Meetsysteemanalyse (MSA)-hulpmiddel dat variatie kwantificeert die door het meetsysteem zelf wordt geïntroduceerd (apparatuur + operators), waardoor gegevenskwaliteit wordt gewaarborgd vóór baselineanalyse.',
        },
        {
          id: 'lss-exam-q12',
          question: 'The "5 Whys" technique is best described as:',
          questionNL: 'De "5 Waarom"-techniek wordt het best beschreven als:',
          options: [
            'A brainstorming method to generate as many solutions as possible',
            'An iterative questioning technique to drill down to the root cause of a problem',
            'A statistical test to validate measurement system accuracy',
            'A scheduling tool to plan improvement activities'
          ],
          optionsNL: [
            'Een brainstormmethode om zoveel mogelijk oplossingen te genereren',
            'Een iteratieve vraagtechniek om door te dringen tot de grondoorzaak van een probleem',
            'Een statistische test om de nauwkeurigheid van meetsystemen te valideren',
            'Een planningshulpmiddel voor verbeteractiviteiten'
          ],
          correctAnswer: 1,
          explanation: 'The 5 Whys technique involves repeatedly asking "why?" (typically 5 times) until the true root cause is uncovered. It is simple, fast, and effective for straightforward cause chains in the Analyze phase.',
          explanationNL: 'De 5 Waarom-techniek houdt in dat herhaaldelijk "waarom?" wordt gevraagd (doorgaans 5 keer) totdat de echte grondoorzaak is ontdekt. Het is eenvoudig, snel en effectief voor eenvoudige oorzaakketens in de Analyze fase.',
        },
        {
          id: 'lss-exam-q13',
          question: 'Which of the five Lean principles comes LAST in the sequence defined by Womack and Jones?',
          questionNL: 'Welk van de vijf Lean-principes komt als LAATSTE in de volgorde zoals gedefinieerd door Womack en Jones?',
          options: [
            'Flow',
            'Pull',
            'Value',
            'Perfection (Pursue Perfection)'
          ],
          optionsNL: [
            'Flow',
            'Pull',
            'Waarde',
            'Perfectie (Streven naar perfectie)'
          ],
          correctAnswer: 3,
          explanation: 'The five Lean principles in sequence are: (1) Specify Value, (2) Map the Value Stream, (3) Create Flow, (4) Establish Pull, (5) Pursue Perfection. Perfection is the continuous, never-ending improvement goal.',
          explanationNL: 'De vijf Lean-principes op volgorde zijn: (1) Waarde specificeren, (2) De waardestroom in kaart brengen, (3) Flow creëren, (4) Pull instellen, (5) Streven naar perfectie. Perfectie is het continue, nooit eindigende verbeterdoel.',
        },
        {
          id: 'lss-exam-q14',
          question: 'A process is running at 4 Sigma. What is the approximate DPMO?',
          questionNL: 'Een proces draait op 4 Sigma. Wat is het geschatte DPMO?',
          options: [
            '3.4 DPMO',
            '233 DPMO',
            '6,210 DPMO',
            '66,807 DPMO'
          ],
          optionsNL: [
            '3,4 DPMO',
            '233 DPMO',
            '6.210 DPMO',
            '66.807 DPMO'
          ],
          correctAnswer: 2,
          explanation: 'Standard sigma-to-DPMO values (with 1.5σ shift): 6σ = 3.4, 5σ = 233, 4σ = 6,210, 3σ = 66,807. A 4-sigma process produces about 6,210 defects per million opportunities.',
          explanationNL: 'Standaard sigma-naar-DPMO-waarden (met 1,5σ-verschuiving): 6σ = 3,4; 5σ = 233; 4σ = 6.210; 3σ = 66.807. Een 4-sigma proces produceert circa 6.210 defecten per miljoen kansen.',
        },
        {
          id: 'lss-exam-q15',
          question: 'What is the primary output of the Control phase in DMAIC?',
          questionNL: 'Wat is de primaire output van de Control fase in DMAIC?',
          options: [
            'A list of root causes to investigate',
            'A pilot test report of the proposed solution',
            'A control plan that sustains improvements after the project closes',
            'A SIPOC diagram for the improved process'
          ],
          optionsNL: [
            'Een lijst van grondoorzaken om te onderzoeken',
            'Een pilottestrapport van de voorgestelde oplossing',
            'Een controleplan dat verbeteringen borgt nadat het project is afgesloten',
            'Een SIPOC-diagram voor het verbeterde proces'
          ],
          correctAnswer: 2,
          explanation: 'The Control phase locks in gains by delivering a control plan that specifies KPIs, measurement frequency, owners, and response plans. Without a control plan, improvements tend to decay over time.',
          explanationNL: 'De Control fase borgt de winsten door een controleplan te leveren dat KPIs, meetfrequentie, eigenaren en reactieplannen specificeert. Zonder een controleplan nemen verbeteringen de neiging om in de loop van de tijd te verslechteren.',
        },
        {
          id: 'lss-exam-q16',
          question: 'Kaizen events are best characterised as:',
          questionNL: 'Kaizen-events worden het best gekarakteriseerd als:',
          options: [
            'Long-term strategic planning sessions for senior management',
            'Short, focused improvement workshops (typically 3–5 days) targeting a specific process area',
            'Annual audits of the quality management system',
            'Statistical sampling procedures for incoming materials'
          ],
          optionsNL: [
            'Langetermijn strategische planningssessies voor senior management',
            'Korte, gerichte verbeterworkshops (doorgaans 3–5 dagen) gericht op een specifiek procesgebied',
            'Jaarlijkse audits van het kwaliteitsbeheersysteem',
            'Statistische steekproefprocedures voor inkomende materialen'
          ],
          correctAnswer: 1,
          explanation: 'Kaizen (Japanese: "change for better") events are rapid improvement workshops, typically 3–5 days, where a cross-functional team focuses intensely on eliminating waste or solving a specific problem in a defined process area.',
          explanationNL: 'Kaizen (Japans: "verandering voor beter")-events zijn snelle verbeterworkshops, doorgaans 3–5 dagen, waarbij een cross-functioneel team zich intensief richt op het elimineren van verspilling of het oplossen van een specifiek probleem in een gedefinieerd procesgebied.',
        },
        {
          id: 'lss-exam-q17',
          question: 'Cost of Poor Quality (COPQ) includes which category?',
          questionNL: 'Kosten van slechte kwaliteit (COPQ) omvat welke categorie?',
          options: [
            'Prevention costs only',
            'Appraisal costs only',
            'Internal and external failure costs',
            'Training and certification costs'
          ],
          optionsNL: [
            'Alleen preventiekosten',
            'Alleen keuringskosten',
            'Interne en externe faalkosten',
            'Trainings- en certificeringskosten'
          ],
          correctAnswer: 2,
          explanation: 'COPQ covers internal failure costs (scrap, rework, re-inspection before delivery) and external failure costs (warranty claims, returns, lost customers). Prevention and appraisal costs are part of the broader Cost of Quality (COQ) model.',
          explanationNL: 'COPQ omvat interne faalkosten (uitval, herbewerking, herkeuring voor levering) en externe faalkosten (garantieclaims, retouren, verloren klanten). Preventie- en keuringskosten maken deel uit van het bredere Kosten van Kwaliteit (COQ)-model.',
        },
        {
          id: 'lss-exam-q18',
          question: 'A Value Stream Map (VSM) is primarily used to:',
          questionNL: 'Een Waardestroom Kaart (VSM) wordt voornamelijk gebruikt om:',
          options: [
            'Calculate process capability indices',
            'Visualise the flow of material and information to identify waste and improvement opportunities',
            'Assign roles and responsibilities to team members',
            'Document the sequence of statistical tests to be performed'
          ],
          optionsNL: [
            'Procescapabiliteitsindices berekenen',
            'De stroom van materiaal en informatie te visualiseren om verspilling en verbetermogelijkheden te identificeren',
            'Rollen en verantwoordelijkheden aan teamleden toe te wijzen',
            'De volgorde van uit te voeren statistische tests te documenteren'
          ],
          correctAnswer: 1,
          explanation: 'A Value Stream Map shows the end-to-end flow of a product or service — including all steps, wait times, and information flows — making waste (non-value-added activities) visible so it can be systematically eliminated.',
          explanationNL: 'Een Waardestroom Kaart toont de end-to-end stroom van een product of dienst — inclusief alle stappen, wachttijden en informatiestromen — waardoor verspilling (niet-waarde-toevoegende activiteiten) zichtbaar wordt zodat het systematisch kan worden geëlimineerd.',
        },
        {
          id: 'lss-exam-q19',
          question: 'Which belt level is typically responsible for leading enterprise-wide Lean Six Sigma deployments and mentoring Black Belts?',
          questionNL: 'Welk beltniveau is typisch verantwoordelijk voor het leiden van enterprise-brede Lean Six Sigma-implementaties en het mentoren van Black Belts?',
          options: [
            'Yellow Belt',
            'Green Belt',
            'Master Black Belt',
            'Champion'
          ],
          optionsNL: [
            'Yellow Belt',
            'Green Belt',
            'Master Black Belt',
            'Champion'
          ],
          correctAnswer: 2,
          explanation: 'Master Black Belts are the top technical experts who deploy LSS across the organisation, develop training curricula, and coach Black and Green Belts. Champions are executive sponsors who provide resources and remove barriers — a management role rather than a technical belt.',
          explanationNL: 'Master Black Belts zijn de topexperts die LSS in de organisatie implementeren, trainingsleerprogrammas ontwikkelen en Black en Green Belts coachen. Champions zijn executive sponsors die middelen bieden en obstakels wegnemen — een managementrol in plaats van een technische belt.',
        },
        {
          id: 'lss-exam-q20',
          question: 'In the Improve phase, a pilot is conducted primarily to:',
          questionNL: 'In de Improve fase wordt een pilot primair uitgevoerd om:',
          options: [
            'Collect baseline data on the current process',
            'Test and validate the proposed solution on a small scale before full rollout',
            'Calculate the process sigma level',
            'Create the control plan for the improved process'
          ],
          optionsNL: [
            'Basisgegevens over het huidige proces te verzamelen',
            'De voorgestelde oplossing op kleine schaal te testen en valideren vóór volledige uitrol',
            'Het sigma-niveau van het proces te berekenen',
            'Het controleplan voor het verbeterde proces te maken'
          ],
          correctAnswer: 1,
          explanation: 'A pilot test validates that the solution actually produces the expected improvement without unintended consequences, before investing in full-scale implementation. It reduces implementation risk.',
          explanationNL: 'Een pilottest valideert dat de oplossing daadwerkelijk de verwachte verbetering oplevert zonder onbedoelde gevolgen, vóór investering in volledige implementatie. Het verlaagt het implementatierisico.',
        },
        {
          id: 'lss-exam-q21',
          question: 'Which DMAIC phase includes hypothesis testing to confirm whether identified potential root causes are statistically significant?',
          questionNL: 'Welke DMAIC-fase omvat hypothesetoetsing om te bevestigen of geïdentificeerde mogelijke grondoorzaken statistisch significant zijn?',
          options: [
            'Define',
            'Measure',
            'Analyze',
            'Control'
          ],
          optionsNL: [
            'Define',
            'Measure',
            'Analyze',
            'Control'
          ],
          correctAnswer: 2,
          explanation: 'The Analyze phase uses statistical tools — including hypothesis tests (t-tests, ANOVA, chi-square), correlation analysis, and regression — to confirm which potential root causes identified in brainstorming are truly driving the problem.',
          explanationNL: 'De Analyze fase gebruikt statistische hulpmiddelen — inclusief hypothesetests (t-tests, ANOVA, chi-kwadraat), correlatieanalyse en regressie — om te bevestigen welke mogelijke grondoorzaken die bij brainstormen zijn geïdentificeerd daadwerkelijk het probleem veroorzaken.',
        },
        {
          id: 'lss-exam-q22',
          question: 'A process has a Cp of 1.5 and a Cpk of 0.8. What does this indicate?',
          questionNL: 'Een proces heeft een Cp van 1,5 en een Cpk van 0,8. Wat geeft dit aan?',
          options: [
            'The process is capable and well-centred within specifications',
            'The process has sufficient spread but is not centred — it is shifted toward one specification limit',
            'The process is incapable because Cp is too high',
            'Both indices must equal 1.0 for the process to be acceptable'
          ],
          optionsNL: [
            'Het proces is capabel en goed gecentreerd binnen specificaties',
            'Het proces heeft voldoende spreiding maar is niet gecentreerd — het is verschoven naar één specificatiegrens',
            'Het proces is niet capabel omdat Cp te hoog is',
            'Beide indices moeten 1,0 zijn voor het proces om acceptabel te zijn'
          ],
          correctAnswer: 1,
          explanation: 'Cp measures the potential capability (spread vs spec width) — 1.5 is good. Cpk adjusts for centering; 0.8 < 1.0 signals that the process mean is shifted too close to one spec limit, causing defects even though the variation spread is adequate.',
          explanationNL: 'Cp meet de potentiële capabiliteit (spreiding vs specificatiebreedte) — 1,5 is goed. Cpk past aan voor centrering; 0,8 < 1,0 signaleert dat het procesgemiddelde te dicht bij één specificatiegrens is verschoven, waardoor defecten optreden ook al is de variatiespreiding voldoende.',
        },
        {
          id: 'lss-exam-q23',
          question: 'Overproduction is considered the most serious of the 8 Lean wastes because:',
          questionNL: 'Overproductie wordt beschouwd als de ernstigste van de 8 Lean-verspillingen omdat:',
          options: [
            'It is the most difficult waste to measure',
            'It generates and hides all the other wastes',
            'It only occurs in manufacturing environments',
            'It is always caused by machine breakdowns'
          ],
          optionsNL: [
            'Het de moeilijkst te meten verspilling is',
            'Het alle andere verspillingen genereert en verbergt',
            'Het alleen voorkomt in productieomgevingen',
            'Het altijd wordt veroorzaakt door machinestoringen'
          ],
          correctAnswer: 1,
          explanation: 'Overproduction (producing more than the customer needs, sooner than needed) is often called the "mother of all wastes" because it generates and conceals the other wastes: excess inventory piles up, extra transportation is needed, defects are hidden in stock, etc.',
          explanationNL: 'Overproductie (meer produceren dan de klant nodig heeft, eerder dan nodig) wordt vaak de "moeder van alle verspillingen" genoemd omdat het de andere verspillingen genereert en verbergt: overtollige voorraad stapelt op, extra transport is nodig, defecten worden verborgen in voorraad, enz.',
        },
        {
          id: 'lss-exam-q24',
          question: 'In the Control phase, a standardised work instruction is updated to reflect the improved process. This is an example of which LSS principle?',
          questionNL: 'In de Control fase wordt een gestandaardiseerde werkinstructie bijgewerkt om het verbeterde proces te weerspiegelen. Dit is een voorbeeld van welk LSS-principe?',
          options: [
            'Voice of the Customer',
            'Process capability analysis',
            'Sustaining gains through standardisation',
            'Design for Six Sigma (DFSS)'
          ],
          optionsNL: [
            'Voice of the Customer',
            'Procescapabiliteitsanalyse',
            'Winsten borgen door standaardisatie',
            'Design for Six Sigma (DFSS)'
          ],
          correctAnswer: 2,
          explanation: 'Updating standardised work instructions is the classic way to sustain improvements — it documents the new "best way" so the process does not revert to old habits when the project team moves on.',
          explanationNL: 'Het bijwerken van gestandaardiseerde werkinstructies is de klassieke manier om verbeteringen te borgen — het documenteert de nieuwe "beste manier" zodat het proces niet terugkeert naar oude gewoonten wanneer het projectteam verder gaat.',
        },
        {
          id: 'lss-exam-q25',
          question: 'Which of the following correctly describes a "pull" system in Lean?',
          questionNL: 'Welke van de volgende beschrijft correct een "pull"-systeem in Lean?',
          options: [
            'Production is scheduled based on a monthly forecast pushed to each workstation',
            'Each process step produces only what the next downstream step requests',
            'Inventory buffers are maximised to prevent any line stoppages',
            'All work orders are released simultaneously at the start of the shift'
          ],
          optionsNL: [
            'Productie wordt gepland op basis van een maandelijkse prognose die naar elke werkplek wordt gestuurd',
            'Elke processtap produceert alleen wat de volgende stroomafwaartse stap aanvraagt',
            'Voorraadbuffers worden gemaximaliseerd om lijnstops te voorkomen',
            'Alle werkorders worden tegelijkertijd vrijgegeven aan het begin van de dienst'
          ],
          correctAnswer: 1,
          explanation: 'A pull system (e.g., Kanban) triggers production only when the downstream customer signals a need. This eliminates overproduction and excess inventory, ensuring work flows in response to actual demand rather than forecast.',
          explanationNL: 'Een pull-systeem (bijv. Kanban) triggert productie alleen wanneer de stroomafwaartse klant een behoefte signaleert. Dit elimineert overproductie en overtollige voorraad en zorgt ervoor dat werk stroomt als reactie op werkelijke vraag in plaats van op prognose.',
        },
      ],
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