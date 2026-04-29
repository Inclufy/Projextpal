// ============================================
// COURSE: STAKEHOLDER MANAGEMENT
// ============================================
// Doctrinal references:
//   - Mendelow\'s Power-Interest Grid (1991)
//   - Mitchell, Agle & Wood Salience Model (1997, Academy of Management Review)
//   - AA1000SES Stakeholder Engagement Standard (AccountAbility, 2015)
//   - PMBOK 7th Ed — Stakeholder Performance Domain (PMI, 2021)
// ============================================

import { Users } from 'lucide-react';
import { Course, Module } from '../types';
import { BRAND } from '../brand';
import { instructors } from '../instructors';

// ============================================
// MODULE 1: IDENTIFICATIE & ANALYSE
// ============================================
const module1: Module = {
  id: 'stk-m1',
  title: 'Module 1: Identification & Analysis',
  titleNL: 'Module 1: Identificatie & Analyse',
  description: 'Stakeholder mapping, power-interest grid, influence-impact, and RACI.',
  descriptionNL: 'Stakeholder mapping, macht-interesse grid, invloed-impact, en RACI.',
  lessons: [
    {
      id: 'stk-l1',
      title: 'Stakeholder Mapping',
      titleNL: 'Stakeholder Mapping',
      duration: '14:00',
      type: 'video',
      videoUrl: '',
      transcript: `Welkom bij de cursus Stakeholdermanagement. We beginnen met de meest fundamentele vaardigheid: stakeholders identificeren voordat het project is gestart.

**Waarom stakeholder mapping cruciaal is**

Meer dan 60% van de projectfaalgevallen heeft te maken met stakeholders — niet met techniek of budget. Mensen die te laat betrokken worden, belangen die niet zijn gezien, weerstand die onverwacht opkomt. Stakeholder mapping is het antwoord.

**Definitie van een stakeholder**

Volgens de AA1000SES-standaard (AccountAbility, 2015) zijn stakeholders "individuen, groepen of organisaties die worden beïnvloed door of zelf invloed uitoefenen op jouw project of organisatie." Dit is breder dan je denkt: het omvat ook diegenen die indirect geraakt worden — buurtbewoners bij een bouwproject, medewerkers wier werkwijze verandert, toezichthouders die regels handhaven.

**De stakeholder-inventarisatietechniek**

Stap 1 — Brainstorm: gebruik een checklist van categorieën: interne teams, management, klanten, leveranciers, regelgevers, media, financiers, gemeenschap.

Stap 2 — Interview de sponsor: vraag expliciet "Wie kan dit project laten mislukken als ze het willen?" en "Wie moet als kampioen optreden?"

Stap 3 — Documenteer in een stakeholderregister: naam, organisatie, rol, contactpersoon, belang in het project.

**Praktijkvoorbeeld**

Stel je voor: een gemeente voert een parkeerapp in. Wie zijn de stakeholders? De wethouder (sponsor), parkeerwachten (eindgebruikers die hun baan bedreigd zien), bewoners (profiteren van makkelijker parkeren), winkeliers (bezorgd over minder bezoekers), IT-afdeling (technische implementatie), privacytoezichthouder (AVG-naleving). Elk van deze partijen heeft andere belangen en andere invloed.

**Key Takeaways**

- Stakeholders zijn alle partijen die invloed uitoefenen op of beïnvloed worden door het project
- Begin met een brede brainstorm, daarna verfijnen
- Documenteer in een stakeholderregister voordat de planning start
- Vergeet indirecte stakeholders niet — zij veroorzaken de grootste verrassingen`,
      keyTakeaways: [
        'Stakeholders zijn alle partijen met invloed op of belang bij het project',
        'Gebruik categorieën (intern, klant, leverancier, regelgever) bij de brainstorm',
        'Leg alles vast in een stakeholderregister vóór de planning',
        'Indirecte stakeholders veroorzaken de grootste verrassingen',
      ],
    },
    {
      id: 'stk-l2',
      title: 'Power-Interest Grid (Mendelow)',
      titleNL: 'Macht-Interesse Grid (Mendelow)',
      duration: '13:00',
      type: 'video',
      videoUrl: '',
      transcript: `Het Macht-Interesse Grid van Mendelow (1991) is het meest gebruikte instrument voor stakeholderclassificatie in projectmanagement wereldwijd. Het deelt stakeholders in op twee assen: macht (de mogelijkheid om het project te beïnvloeden) en interesse (de mate waarin ze betrokken willen of moeten zijn).

**De vier kwadranten**

Kwadrant 1 — Hoge macht, hoge interesse (Manage closely): dit zijn jouw sleutelstakeholders. Houd hen nauw betrokken, consulteer hen bij beslissingen, geef hen directe communicatiekanalen.

Kwadrant 2 — Hoge macht, lage interesse (Keep satisfied): machtige spelers die nu weinig interesse tonen. Negeer hen niet — als hun belangen worden geraakt, kunnen ze snel actief worden. Informeer hen proactief over mijlpalen.

Kwadrant 3 — Lage macht, hoge interesse (Keep informed): betrokken partijen met weinig directe invloed. Ze kunnen echter wel de publieke opinie vormen of intern draagvlak beïnvloeden. Houd hen op de hoogte via nieuwsbrieven of updates.

Kwadrant 4 — Lage macht, lage interesse (Monitor): minimale betrokkenheid nodig. Houd een vinger aan de pols; hun positie kan veranderen.

**Dynamiek**

Het grid is niet statisch. Een leverancier die in kwadrant 4 begint, kan bij een kritieke leverfout plotseling kwadrant 1 bereiken. Review het grid bij elke fase-overgang.

**Praktijkvoorbeeld**

Projectnaam: migratie van HR-systeem voor 1200 medewerkers.
- CFO: hoge macht, lage interesse → Keep satisfied (maandelijkse kostenupdate)
- HR-directeur: hoge macht, hoge interesse → Manage closely (wekelijks overleg)
- Medewerkers: lage macht, hoge interesse → Keep informed (intranet-updates)
- Leverancier A: lage macht, lage interesse → Monitor

**Key Takeaways**

- Mendelow\'s grid: twee assen — macht en interesse
- Vier strategieën: Manage closely, Keep satisfied, Keep informed, Monitor
- Het grid is dynamisch — update het bij elke projectfase
- Consulteer het grid voordat je een communicatieplan opstelt`,
      keyTakeaways: [
        'Mendelow (1991): twee assen — macht en interesse, vier kwadranten',
        'Manage closely / Keep satisfied / Keep informed / Monitor',
        'Grid is dynamisch — update bij elke fase-overgang',
        'Gebruik het grid als input voor het communicatieplan',
      ],
    },
    {
      id: 'stk-l3',
      title: 'Salience Model — Influence & Impact',
      titleNL: 'Salience Model — Invloed & Impact',
      duration: '12:00',
      type: 'video',
      videoUrl: '',
      transcript: `Terwijl Mendelow\'s grid twee attributen meet, voegt het Salience Model van Mitchell, Agle en Wood (1997) een derde dimensie toe: legitimiteit. Dit maakt het krachtiger voor complexe stakeholdersituaties.

**De drie attributen**

1. Macht — het vermogen om het project te beïnvloeden (formeel of informeel)
2. Legitimiteit — de mate waarin de claim van de stakeholder als rechtvaardig wordt erkend door de organisatie
3. Urgentie — de tijdsgevoeligheid en kritikaliteit van de claim

**De stakeholdertypen**

Combinaties van deze drie attributen geven zeven stakeholdertypen:
- Sluimerende stakeholders (alleen macht): weet van hun bestaan, houd in de gaten
- Discretionaire stakeholders (alleen legitimiteit): betrek hen vrijwillig — ze kunnen waardevolle input leveren
- Eisende stakeholders (alleen urgentie): veel lawaai, weinig macht — niet laten leiden
- Dominante stakeholders (macht + legitimiteit): beheer actief
- Gevaarlijke stakeholders (macht + urgentie, geen legitimiteit): risicogroep — kunnen onverwacht handelend optreden
- Afhankelijke stakeholders (legitimiteit + urgentie, geen macht): behoeven bescherming via de organisatie
- Definitieve stakeholders (alle drie): hoogste prioriteit

**Wanneer gebruik je het Salience Model vs. Mendelow?**

Gebruik Mendelow voor een snelle eerste classificatie. Gebruik het Salience Model wanneer stakeholderbelangen conflicteren of wanneer je wilt uitleggen waarom je één partij prioriteert boven een andere.

**Key Takeaways**

- Mitchell, Agle & Wood (1997): macht, legitimiteit, urgentie
- Zeven stakeholdertypen op basis van attribuutwaardes
- Definitieve stakeholders (alle drie) krijgen altijd de hoogste prioriteit
- Gebruik Salience Model bij conflicterende belangen`,
      keyTakeaways: [
        'Salience model: macht + legitimiteit + urgentie (Mitchell et al., 1997)',
        'Zeven stakeholdertypen — definitieve stakeholders hebben alle drie attributen',
        'Urgentie zonder legitimiteit = eisende stakeholder, niet laten leiden',
        'Gebruik naast Mendelow bij complexe of conflicterende belangen',
      ],
    },
    {
      id: 'stk-l4',
      title: 'RACI Matrix',
      titleNL: 'RACI Matrix',
      duration: '11:00',
      type: 'video',
      videoUrl: '',
      transcript: `Een RACI-matrix koppelt stakeholders aan taken en beslissingen. Het is het meest gebruikte instrument om rolverdeling te expliciteren en conflict over verantwoordelijkheid te voorkomen.

**RACI staat voor**

- R — Responsible: de persoon die de taak daadwerkelijk uitvoert. Elke taak heeft minimaal één R.
- A — Accountable: de eindverantwoordelijke. Per taak precies één A — nooit meer, nooit minder. Bij meerdere A's is niemand echt verantwoordelijk.
- C — Consulted: partijen wiens input gevraagd wordt vóór de beslissing. Tweerichtingsverkeer.
- I — Informed: partijen die na de beslissing geïnformeerd worden. Eénrichtingsverkeer.

**Veelgemaakte fouten**

1. Teveel R's: als iedereen responsible is, is niemand het.
2. Geen enkele A per taak: dan is er geen eindverantwoordelijke.
3. Te veel C's: vergaderen met iedereen vertraagt alles.
4. I vergeten: sleutelstakeholders die niet geïnformeerd worden, voelen zich buitengesloten.

**Praktijkvoorbeeld**

Taak: "Go-live beslissing na systeemtest"
- Projectmanager: A
- Testcoördinator: R
- IT-architect: C
- CFO: I
- Eindgebruikers: I

**Key Takeaways**

- RACI: Responsible, Accountable, Consulted, Informed
- Per taak: minimaal één R, precies één A
- Te veel C's vertragen beslissingen
- Gebruik RACI als input voor het communicatieplan`,
      keyTakeaways: [
        'RACI: elke taak heeft minimaal 1 R en precies 1 A',
        'Teveel A\'s of R\'s verwatert verantwoordelijkheid',
        'C = tweerichtingsverkeer; I = eénrichtingsverkeer',
        'RACI is input voor het communicatieplan, niet het eindproduct',
      ],
    },
    {
      id: 'stk-m1-quiz',
      title: 'Module 1 Quiz — Identificatie & Analyse',
      titleNL: 'Module 1 Quiz — Identificatie & Analyse',
      duration: '10:00',
      type: 'quiz',
      videoUrl: '',
      transcript: '',
      quiz: [
        {
          id: 'stk-q1-1',
          question: 'Welke twee assen gebruikt het Macht-Interesse Grid van Mendelow (1991) voor stakeholderclassificatie?',
          options: [
            'Urgentie en legitimiteit',
            'Macht en interesse',
            'Invloed en impact',
            'Betrokkenheid en budget',
          ],
          correctAnswer: 1,
          explanation: 'Mendelow\'s Power-Interest Grid (1991) deelt stakeholders in op basis van twee assen: macht (de mogelijkheid om het project te beïnvloeden) en interesse (de mate van betrokkenheid die de stakeholder heeft of wil). Dit resulteert in vier kwadranten met bijbehorende managementstrategieën.',
        },
        {
          id: 'stk-q1-2',
          question: 'Welke managementstrategie geldt voor stakeholders met hoge macht en lage interesse (kwadrant 2 van Mendelow)?',
          options: [
            'Manage closely — wekelijks direct contact onderhouden',
            'Keep satisfied — proactief informeren over mijlpalen',
            'Keep informed — nieuwsbrieven en statusupdates sturen',
            'Monitor — minimale aandacht; positie kan veranderen',
          ],
          correctAnswer: 1,
          explanation: 'Stakeholders met hoge macht en lage interesse vallen in de "Keep satisfied"-categorie. Ze tonen nu weinig actieve interesse, maar kunnen snel ingrijpen als hun belangen worden geraakt. Proactieve communicatie over mijlpalen en risico\'s voorkomt negatieve verrassingen.',
        },
        {
          id: 'stk-q1-3',
          question: 'Welk derde attribuut voegt het Salience Model van Mitchell, Agle en Wood (1997) toe aan macht en legitimiteit?',
          options: [
            'Interesse',
            'Budget',
            'Urgentie',
            'Invloed',
          ],
          correctAnswer: 2,
          explanation: 'Het Salience Model (Mitchell et al., 1997) voegt urgentie toe aan macht en legitimiteit. Urgentie meet de tijdsgevoeligheid en kritikaliteit van de claim van de stakeholder. Samen geven deze drie attributen zeven stakeholdertypen, waarbij definitieve stakeholders alle drie attributen hebben.',
        },
        {
          id: 'stk-q1-4',
          question: 'Hoeveel personen mogen de rol "Accountable" (A) hebben in een RACI-matrix voor één specifieke taak?',
          options: [
            'Zo veel als nodig — meer A\'s verdeelt de verantwoordelijkheid',
            'Minimaal twee — voor vierogenprincipe',
            'Precies één — één eindverantwoordelijke per taak',
            'Geen — Accountable is optioneel voor kleine taken',
          ],
          correctAnswer: 2,
          explanation: 'Een kernregel van RACI: elke taak heeft precies één Accountable. Als meerdere personen de A-rol hebben, is er in de praktijk geen echte eindverantwoordelijke meer. Bij conflicten of fouten schuift iedereen de verantwoordelijkheid door naar de ander.',
        },
        {
          id: 'stk-q1-5',
          question: 'Welk type stakeholder beschrijft het Salience Model als iemand die macht én urgentie heeft, maar geen legitimiteit?',
          options: [
            'Definitieve stakeholder — hoogste prioriteit',
            'Gevaarlijke stakeholder — kan onverwacht handelend optreden',
            'Eisende stakeholder — veel lawaai, weinig macht',
            'Dominante stakeholder — macht plus legitimiteit',
          ],
          correctAnswer: 1,
          explanation: 'In het Salience Model zijn stakeholders met macht én urgentie maar zonder legitimiteit "gevaarlijke stakeholders". Ze kunnen buiten formele kanalen om handelen (acties, media, juridische stappen) juist omdat ze geen erkende legitieme claim hebben. Dit maakt hen onvoorspelbaar en vereist bewuste monitoring.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 2: BETROKKENHEID
// ============================================
const module2: Module = {
  id: 'stk-m2',
  title: 'Module 2: Engagement',
  titleNL: 'Module 2: Betrokkenheid',
  description: 'Engagement strategies, communication plan, tailored messaging, and negotiation.',
  descriptionNL: 'Betrokkenheidsstrategieën, communicatieplan, gerichte boodschappen, en onderhandelen.',
  lessons: [
    {
      id: 'stk-l5',
      title: 'Engagement Strategies',
      titleNL: 'Betrokkenheidsstrategieën',
      duration: '14:00',
      type: 'video',
      videoUrl: '',
      transcript: `Stakeholders identificeren is stap één. Stap twee is bepalen hóé je hen betrekt. De AA1000SES Stakeholder Engagement Standard (AccountAbility, 2015) onderscheidt vijf niveaus van betrokkenheid, van passief naar actief.

**De vijf betrokkenheidsniveaus (AA1000SES)**

1. Monitor — je observeert de stakeholder zonder directe interactie. Geschikt voor partijen met minimale relevantie.

2. Informeer — éénrichtingscommunicatie. Je deelt informatie maar vraagt geen input. Nieuwsbrieven, persberichten, portals.

3. Consulteer — je vraagt feedback en input, maar behoudt de beslissingsbevoegdheid. Enquêtes, interviews, focusgroepen.

4. Samenwerken — je werkt samen aan oplossingen. Werkgroepen, co-design, gezamenlijke analyse.

5. Empoweren — je delegeert beslissingsbevoegdheid aan de stakeholder. Zeldzaam in projectmanagement; meer relevant bij community-projecten.

**Het kiezen van het juiste niveau**

Gebruik het Macht-Interesse Grid als input. Stakeholders in "Manage closely" verdienen niveau 3 of 4. "Keep informed" stakeholders passen bij niveau 2. Ga niet standaard naar het hoogste niveau — dat kost tijd en creëert verwachtingen die je niet kunt waarmaken.

**Praktijkvoorbeeld**

Bij de invoering van een nieuw ERP-systeem:
- Stuurgroep (Manage closely): samenwerken — maandelijks steering committee
- Lijnmanagers (Keep satisfied): consulteer — kwartaalgesprekken
- Medewerkers (Keep informed): informeer — intranet en town halls
- Toezichthouder (Monitor): monitor — tenzij een AVG-vraagstuk zich voordoet

**Key Takeaways**

- AA1000SES: vijf niveaus van betrokkenheid — monitor, informeer, consulteer, samenwerk, empoweer
- Koppel het niveau aan het Macht-Interesse-kwadrant
- Vermijd standaard het hoogste niveau — het creëert onhaalbare verwachtingen
- Documenteer het gekozen niveau per stakeholder in het communicatieplan`,
      keyTakeaways: [
        'AA1000SES: 5 niveaus — monitor, informeer, consulteer, samenwerk, empoweer',
        'Koppel betrokkenheidsniveau aan het Mendelow-kwadrant',
        'Niet elke stakeholder verdient het hoogste niveau',
        'Leg het gekozen niveau vast per stakeholder',
      ],
    },
    {
      id: 'stk-l6',
      title: 'Communication Plan',
      titleNL: 'Communicatieplan',
      duration: '13:00',
      type: 'video',
      videoUrl: '',
      transcript: `Een communicatieplan is het operationele instrument dat bepaalt wie wat wanneer hoe ontvangt. Het is de vertaling van de stakeholderanalyse naar concrete acties.

**De zes elementen van een communicatieplan**

1. Doelgroep — wie ontvangt de communicatie? (gebruik het stakeholderregister)
2. Boodschap — wat is de kerninhoud? Wat moeten zij weten, beslissen, of doen?
3. Doel — informeren, beslissing vragen, draagvlak bouwen, of weerstand wegnemen?
4. Kanaal — e-mail, vergadering, intranet, dashboard, rapportage, 1-op-1?
5. Frequentie — wekelijks, maandelijks, bij mijlpaal, ad hoc?
6. Eigenaar — wie is verantwoordelijk voor het versturen?

**Praktijktemplate (tabel)**

| Stakeholder | Boodschap | Doel | Kanaal | Frequentie | Eigenaar |
|---|---|---|---|---|---|
| CFO | Budgetstatus en afwijkingen | Beslissing | 1-op-1 | Maandelijks | PM |
| IT-team | Technische voortgang | Informeren | Stand-up | Dagelijks | Tech Lead |
| Eindgebruikers | Change impact, trainingsdata | Draagvlak | E-mail + town hall | 2-wekelijks | Change Manager |

**Veelgemaakte fouten**

- Te weinig kanalen: één e-mail is geen communicatieplan
- Te weinig eigenaren: de PM kan niet alle communicatie verzorgen
- Geen feedback-loop: communicatie is tweerichtingsverkeer voor sleutelstakeholders

**Key Takeaways**

- Communicatieplan: 6 elementen — doelgroep, boodschap, doel, kanaal, frequentie, eigenaar
- Verankering in het stakeholderregister en Mendelow-grid
- Feedback-loop voor Manage-closely-stakeholders
- Eén eigenaar per communicatiestroom`,
      keyTakeaways: [
        'Communicatieplan = 6 elementen: doelgroep, boodschap, doel, kanaal, frequentie, eigenaar',
        'Verankering in stakeholderregister en Mendelow-grid',
        'Feedback-loop voor sleutelstakeholders (Manage closely)',
        'Eén eigenaar per communicatiestroom voorkomt gaten',
      ],
    },
    {
      id: 'stk-l7',
      title: 'Tailored Messaging',
      titleNL: 'Gerichte Boodschappen',
      duration: '11:00',
      type: 'video',
      videoUrl: '',
      transcript: `Dezelfde projectboodschap werkt anders voor een CFO dan voor een eindgebruiker. Gerichte boodschappen zijn de kunst om dezelfde kern op maat te snijden voor de ontvanger.

**Het WIIFM-principe**

"What's In It For Me?" — elke stakeholder stelt onbewust deze vraag bij elke communicatie. Als jij die vraag niet beantwoordt, verlies je hun aandacht.

**Segmentering van boodschappen**

Analyseer per stakeholdergroep:
- Wat is hun primaire belang in het project?
- Welke angsten of weerstand hebben zij?
- Welke succescriteria definiëren zij zelf?

**Praktijkvoorbeeld**

Project: implementatie van een nieuw tijdregistratiesysteem.

Voor de CFO: "Het nieuwe systeem geeft ons real-time inzicht in projectkosten en verkleint over-spending risico\'s met naar schatting 15%."

Voor de teamleider: "Medewerkers zijn in 3 minuten per dag klaar met tijdregistratie — een besparing van 20 minuten per week per persoon."

Voor de medewerker: "Je vult één keer per dag je uren in via je telefoon — geen Excel meer, geen vergeten uren aan het einde van de maand."

Dezelfde implementatie, drie gerichte boodschappen.

**Key Takeaways**

- WIIFM: beantwoord altijd "Wat levert het mij op?" voor de ontvanger
- Segmenteer boodschappen op basis van belangen, angsten en succescriteria
- Dezelfde kernboodschap, andere verpakking per doelgroep
- Test boodschappen bij een vertegenwoordiger vóór brede verspreiding`,
      keyTakeaways: [
        'WIIFM: "What\'s In It For Me?" — elke stakeholder stelt deze vraag onbewust',
        'Segmenteer: belangen, angsten, succescriteria per groep',
        'Één kern, drie verpakkingen — consistent maar op maat',
        'Test boodschappen bij een vertegenwoordiger vóór verspreiding',
      ],
    },
    {
      id: 'stk-l8',
      title: 'Negotiation in Stakeholder Contexts',
      titleNL: 'Onderhandelen met Stakeholders',
      duration: '13:00',
      type: 'video',
      videoUrl: '',
      transcript: `Projectmanagers onderhandelen voortdurend: over scope, over deadlines, over resources, over wie wiens belangen voorrang krijgt. In een stakeholdercontext zijn de spelregels anders dan bij een commerciële onderhandeling.

**Principieel onderhandelen (Fisher & Ury)**

Het Harvard Negotiation Project biedt vier principes die directe waarde hebben in stakeholdermanagement:

1. Splits mensen van het probleem — de relatie met de stakeholder is langetermijn; de onderhandeling is kortetermijn. Bescherm de relatie zelfs als je de positie bestrijdt.

2. Focus op belangen, niet posities — een stakeholder zegt "ik wil meer budget". Dat is een positie. De onderliggende belangen zijn misschien "ik wil niet voor verrassingen staan aan het einde van het kwartaal". Die zijn veel makkelijker te adresseren.

3. Creëer meerdere opties — stel nooit één voorstel voor als enig voorstel. Bied keuzes; dat geeft de stakeholder controle gevoel.

4. Gebruik objectieve criteria — baseer beslissingen op feiten, precedenten, of overeengekomen methodologie, niet op machtsspel.

**BATNA in stakeholdercontext**

BATNA (Best Alternative to Negotiated Agreement) helpt je te bepalen wanneer je een onderhandeling kunt breken zonder schade. Wat is jouw BATNA als een sleutelstakeholder weigert mee te werken? En wat is die van hen?

**Praktijkvoorbeeld**

Een IT-directeur weigert zijn team beschikbaar te stellen voor de migratietests. Positie: "We hebben geen capaciteit." Belang: "Mijn team is al overbelast en ik ben bang voor kwaliteitsproblemen in mijn eigen productiesystemen." Oplossing: biedt een gestructureerd testplan aan dat zijn team maximaal twee uur per week vraagt, met een extern testteam als buffer.

**Key Takeaways**

- Principieel onderhandelen: mensen van probleem scheiden, belangen boven posities
- Creëer altijd meerdere opties — nooit één voorstel als ultimatum
- Objectieve criteria voorkomen machtsspel
- Ken jouw BATNA én die van de stakeholder`,
      keyTakeaways: [
        'Fisher & Ury: mensen van probleem scheiden, belangen boven posities',
        'Bied altijd meerdere opties — nooit één voorstel als ultimatum',
        'Objectieve criteria voorkomen machtsspel',
        'Bepaal jouw BATNA en die van de stakeholder vóór het gesprek',
      ],
    },
    {
      id: 'stk-m2-quiz',
      title: 'Module 2 Quiz — Betrokkenheid',
      titleNL: 'Module 2 Quiz — Betrokkenheid',
      duration: '10:00',
      type: 'quiz',
      videoUrl: '',
      transcript: '',
      quiz: [
        {
          id: 'stk-q2-1',
          question: 'Welke norm definieert de vijf betrokkenheidsniveaus (monitor, informeer, consulteer, samenwerk, empoweer) voor stakeholderbetrokkenheid?',
          options: [
            'PMBOK 7th Edition — Stakeholder Performance Domain',
            'AA1000SES Stakeholder Engagement Standard (AccountAbility, 2015)',
            'ISO 21500 — Guidance on Project Management',
            'PRINCE2 7th Edition — Communication Theme',
          ],
          correctAnswer: 1,
          explanation: 'De AA1000SES (AccountAbility Stakeholder Engagement Standard, 2015) is de internationale norm die vijf betrokkenheidsniveaus definieert: monitor, informeer, consulteer, samenwerk en empoweer. Ze vormen een oplopende schaal van éénrichtingscommunicatie naar gedeelde besluitvorming.',
        },
        {
          id: 'stk-q2-2',
          question: 'Een projectmanager vraagt medewerkers om feedback op een nieuwe werkmethode via een enquête, maar behoudt zelf de beslissingsbevoegdheid. Welk AA1000SES-betrokkenheidsniveau is dit?',
          options: [
            'Informeer',
            'Consulteer',
            'Samenwerk',
            'Empoweer',
          ],
          correctAnswer: 1,
          explanation: 'Consulteer (niveau 3) houdt in dat je input en feedback vraagt maar de beslissingsbevoegdheid bij de organisatie houdt. Enquêtes, interviews en focusgroepen zijn typische consultatietechnieken. Bij samenwerken (niveau 4) wordt de beslissing gezamenlijk genomen; bij empoweren (niveau 5) wordt ze gedelegeerd.',
        },
        {
          id: 'stk-q2-3',
          question: 'Welk principe van het Harvard Negotiation Project stelt dat je je moet richten op de onderliggende interesses van een stakeholder, niet op hun uitgesproken standpunt?',
          options: [
            'Splits mensen van het probleem',
            'Gebruik objectieve criteria',
            'Focus op belangen, niet posities',
            'Creëer meerdere opties',
          ],
          correctAnswer: 2,
          explanation: 'Het derde principe van Fisher & Ury: focus op belangen, niet posities. Een positie is wat een stakeholder zegt te willen; een belang is waarom ze dat willen. Belangen zijn vaak gemakkelijker te adresseren dan posities, en er zijn vaak meerdere manieren om hetzelfde belang te bevredigen.',
        },
        {
          id: 'stk-q2-4',
          question: 'Welke van de volgende communicatieplancomponenten bepaalt de verantwoordelijkheid voor het versturen van een specifieke communicatiestroom?',
          options: [
            'Kanaal',
            'Frequentie',
            'Eigenaar',
            'Doel',
          ],
          correctAnswer: 2,
          explanation: 'De eigenaar-component van het communicatieplan definieert wie verantwoordelijk is voor het daadwerkelijk verzenden van de communicatie. Zonder expliciete eigenaar per stroom vallen communicatielijnen weg zodra de projectmanager overbelast raakt of het team wisselt.',
        },
        {
          id: 'stk-q2-5',
          question: 'Wat is het WIIFM-principe en hoe past het in gerichte stakeholdercommunicatie?',
          options: [
            'Een acroniem voor de vier elementen van een communicatieplan: Who, Information, Impact, Feedback, Measure',
            'Een herinnering om altijd vanuit het perspectief van de ontvanger te communiceren: What\'s In It For Me?',
            'Een techniek om een communicatieboodschap op drie niveaus te testen: waarschijnlijk, ideaal, feitelijk',
            'Een raamwerk voor het meten van communicatie-effectiviteit op kwartaalbasis',
          ],
          correctAnswer: 1,
          explanation: 'WIIFM staat voor "What\'s In It For Me?" — de onbewuste vraag die elke stakeholder stelt bij het ontvangen van een projectboodschap. Gerichte communicatie beantwoordt deze vraag expliciet per doelgroep: wat levert het hen op, welke angsten worden weggenomen, welke succescriteria worden bereikt?',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 3: DUURZAME RELATIES
// ============================================
const module3: Module = {
  id: 'stk-m3',
  title: 'Module 3: Sustained Relationships',
  titleNL: 'Module 3: Duurzame Relaties',
  description: 'Conflict resolution, trust-building, and stakeholder rhythm.',
  descriptionNL: 'Conflictresolutie, vertrouwen opbouwen, en stakeholderritme.',
  lessons: [
    {
      id: 'stk-l9',
      title: 'Conflict Resolution',
      titleNL: 'Conflictresolutie',
      duration: '13:00',
      type: 'video',
      videoUrl: '',
      transcript: `Conflicten met stakeholders zijn onvermijdelijk. De vraag is niet of ze ontstaan, maar hoe je ze oplost zonder de relatie te beschadigen.

**Conflictbronnen in projecten**

De meest voorkomende oorzaken zijn: schaarste van resources (twee afdelingen claimen dezelfde medewerker), onduidelijke besluitvorming (wie heeft het laatste woord?), uiteenlopende prioriteiten (de klant wil functionaliteit; finance wil kosten drukken), en communicatietekorten (verwachtingen die niet zijn gemanaged).

**De Thomas-Kilmann Conflict Mode Instrument**

Dit model onderscheidt vijf stijlen op basis van twee assen: assertiviteit (mate van focus op eigen belang) en samenwerking (mate van focus op het belang van de ander).

1. Competing (hoog assertief, laag samenwerkend) — gebruik bij crises die directe actie vereisen
2. Accommodating (laag assertief, hoog samenwerkend) — gebruik om relaties te bewaren bij kleine kwesties
3. Avoiding (laag-laag) — gebruik wanneer de kwestie triviaal is of timing slecht
4. Collaborating (hoog-hoog) — gebruik voor complexe conflicten waar beide belangen er toe doen
5. Compromising (midden-midden) — gebruik wanneer een snelle oplossing nodig is en beide partijen iets moeten inleveren

**Conflictstijl per situatie**

Er is geen altijd-beste stijl. Een ervaren projectmanager wisselt bewust tussen stijlen op basis van de situatie.

**Key Takeaways**

- Conflicten hebben vier hoofdbronnen: schaarste, besluitvorming, prioriteiten, communicatie
- Thomas-Kilmann: 5 stijlen op basis van assertiviteit vs. samenwerking
- Er is geen altijd-beste stijl — situationeel schakelen is de vaardigheid
- Preserveer de relatie, ook als je de positie bestrijdt`,
      keyTakeaways: [
        'Conflictbronnen: schaarste, besluitvorming, prioriteiten, communicatietekorten',
        'Thomas-Kilmann: 5 stijlen — competing, accommodating, avoiding, collaborating, compromising',
        'Geen altijd-beste stijl — situationeel schakelen',
        'Behoud de relatie ook bij een winnen/verliezen-uitkomst',
      ],
    },
    {
      id: 'stk-l10',
      title: 'Trust-Building',
      titleNL: 'Vertrouwen Opbouwen',
      duration: '12:00',
      type: 'video',
      videoUrl: '',
      transcript: `Stakeholderbetrokkenheid werkt alleen als er vertrouwen is. Vertrouwen wordt opgebouwd door consistent gedrag over tijd — en verloren in één incident.

**De vertrouwensvergelijking (Maister, Green & Galford)**

Vertrouwen = (Geloofwaardigheid + Betrouwbaarheid + Intimiteit) ÷ Zelfgerichtheid

- Geloofwaardigheid: weet jij waar je het over hebt? Kennis en ervaring tellen.
- Betrouwbaarheid: doe jij wat je zegt? Deadlines, beloftes, afspraken.
- Intimiteit: voelt de stakeholder zich veilig om open te zijn? Vertrouwelijkheid is essentieel.
- Zelfgerichtheid (noemer): hoe meer jij alleen aan je eigen belang denkt, hoe lager het vertrouwen. Leg de nadruk op het belang van de stakeholder, niet op je eigen succes.

**Praktische vertrouwensbuilders**

1. Benoem slecht nieuws vroeg — stakeholders vergeven slecht nieuws; ze vergeven niet dat je het verborgen hield.
2. Lever kleine beloftes op tijd — consistentie in kleine zaken bouwt vertrouwen voor grote.
3. Vraag om feedback en handel ernaar — en communiceer terug wat je met de feedback hebt gedaan.
4. Ken hun wereld — toon interesse in hun context, niet alleen in jouw projectdoelen.

**Key Takeaways**

- Maister-vergelijking: vertrouwen = (geloofwaardigheid + betrouwbaarheid + intimiteit) ÷ zelfgerichtheid
- Slecht nieuws vroeg delen bouwt vertrouwen; verbergen breekt het
- Kleine beloftes op tijd nakomen is de basis van vertrouwen
- Focus op het belang van de stakeholder, niet op je eigen projectsucces`,
      keyTakeaways: [
        'Maister-vergelijking: vertrouwen = (geloofwaardigheid + betrouwbaarheid + intimiteit) ÷ zelfgerichtheid',
        'Slecht nieuws vroeg benoemen bouwt vertrouwen',
        'Kleine beloftes nakomen — consistentie is de basis',
        'Minder zelfgerichtheid = hoger vertrouwen',
      ],
    },
    {
      id: 'stk-l11',
      title: 'Stakeholder Rhythm',
      titleNL: 'Stakeholderritme',
      duration: '11:00',
      type: 'video',
      videoUrl: '',
      transcript: `Stakeholdermanagement is geen eenmalige activiteit — het is een ritme. Projecten die goed communiceren bij de start maar stil vallen halverwege, verliezen draagvlak precies wanneer ze het het meest nodig hebben.

**Wat is stakeholderritme?**

Stakeholderritme is de vaste cadans van contactmomenten, overleggen, rapportages en informele check-ins die je gedurende het project onderhoudt. Het ritme geeft stakeholders voorspelbaarheid — en voorspelbaarheid bouwt vertrouwen.

**Het ritme ontwerpen**

Laag 1 — Dagelijks (voor Manage-closely-stakeholders): informele check-in, stand-up, of korte statusupdate
Laag 2 — Wekelijks: projectstatusrapport, stuurgroep-voorbereiding, escalaties
Laag 3 — Maandelijks: stuurgroep, financiële review, roadmap-update
Laag 4 — Per mijlpaal: go/no-go gesprek, demonstratie, lessons-learned sessie

**Informele contactmomenten**

Naast formele vergaderingen zijn informele contacten cruciaal. Een koffiegesprek met een sleutelstakeholder geeft je informatie die geen rapport oplevert: politieke spanningen, veranderende prioriteiten, onuitgesproken zorgen.

**Ritme bewaken bij teamwisselingen**

Wanneer een teamlid vertrek of een stakeholder van rol wisselt, moet het ritme worden overgedragen. Documenteer wie wanneer contact heeft met wie, en waarom.

**Key Takeaways**

- Stakeholderritme = vaste cadans van contactmomenten door het project heen
- Vier lagen: dagelijks, wekelijks, maandelijks, per mijlpaal
- Informele contactmomenten leveren informatie die rapporten niet geven
- Documenteer het ritme zodat het teamwisselingen overleeft`,
      keyTakeaways: [
        'Stakeholderritme = vaste cadans van contactmomenten door het project',
        'Vier lagen: dagelijks, wekelijks, maandelijks, per mijlpaal',
        'Informele contacten geven informatie die rapporten niet geven',
        'Documenteer het ritme — overdraagbaar bij teamwisselingen',
      ],
    },
    {
      id: 'stk-m3-quiz',
      title: 'Module 3 Quiz — Duurzame Relaties',
      titleNL: 'Module 3 Quiz — Duurzame Relaties',
      duration: '10:00',
      type: 'quiz',
      videoUrl: '',
      transcript: '',
      quiz: [
        {
          id: 'stk-q3-1',
          question: 'Welke conflictstijl uit het Thomas-Kilmann model is het meest geschikt wanneer een project een acuut veiligheidsincident heeft dat directe actie vereist?',
          options: [
            'Collaborating — beide belangen zijn even belangrijk',
            'Compromising — snelle oplossing via inleveren van beide kanten',
            'Competing — hoog assertief, directe actie heeft prioriteit',
            'Avoiding — de timing is nu niet goed',
          ],
          correctAnswer: 2,
          explanation: 'Competing (hoog assertief, laag samenwerkend) is geschikt voor crises die directe, ondubbelzinnige actie vereisen. In een acute veiligheidssituatie is er geen tijd voor collaboratief overleg — de projectmanager moet een duidelijke instructie geven en executie afdwingen. Collaborating is beter voor complexe conflicten zonder tijdsdruk.',
        },
        {
          id: 'stk-q3-2',
          question: 'Wat is de noemer van de vertrouwensvergelijking van Maister, Green en Galford, en waarom is die cruciaal?',
          options: [
            'Geloofwaardigheid — omdat kennis de basis is van vertrouwen',
            'Betrouwbaarheid — afspraken nakomen is het fundament',
            'Zelfgerichtheid — hoe hoger de focus op eigen belang, hoe lager het vertrouwen',
            'Intimiteit — vertrouwelijkheid bepaalt de veiligheid van de relatie',
          ],
          correctAnswer: 2,
          explanation: 'Zelfgerichtheid staat in de noemer van de vergelijking (Vertrouwen = (C+R+I) ÷ S). Een hogere zelfgerichtheid verlaagt het vertrouwen, zelfs als geloofwaardigheid, betrouwbaarheid en intimiteit hoog zijn. Projectmanagers die puur focussen op projectsucces voor zichzelf — zonder aandacht voor het belang van de stakeholder — bouwen geen vertrouwen op.',
        },
        {
          id: 'stk-q3-3',
          question: 'Welke van de volgende acties bouwt het meest effectief vertrouwen op bij een sleutelstakeholder die sceptisch is over het project?',
          options: [
            'Een uitgebreide presentatie geven over het projectplan en de methodologie',
            'Slecht nieuws vroeg en transparant communiceren, voordat de stakeholder het zelf ontdekt',
            'Elke week een gedetailleerd statusrapport sturen',
            'De stakeholder uitnodigen voor alle interne projectvergaderingen',
          ],
          correctAnswer: 1,
          explanation: 'Vertrouwen wordt opgebouwd door consistent gedrag — en slecht nieuws vroeg en transparant brengen is daar een van de krachtigste vormen van. Stakeholders vergeven slechte uitkomsten als je ze vroeg informeert; ze vergeven zelden dat je het verborgen hield. Rapporten en vergaderingen dragen bij maar zijn secundair aan dit gedrag.',
        },
        {
          id: 'stk-q3-4',
          question: 'Wat beschrijft "stakeholderritme" in de context van projectmanagement?',
          options: [
            'De mate van betrokkenheid die een stakeholder heeft bij het project, gemeten per sprint',
            'Een vaste cadans van contactmomenten op meerdere frequentieniveaus die gedurende het project worden onderhouden',
            'De cyclus van identificatie, analyse, betrokkenheid en evaluatie van stakeholders',
            'Het aantal vergaderingen per week dat noodzakelijk is voor effectief stakeholdermanagement',
          ],
          correctAnswer: 1,
          explanation: 'Stakeholderritme is de bewust ontworpen cadans van contactmomenten — dagelijks, wekelijks, maandelijks, per mijlpaal — die gedurende het hele project wordt onderhouden. Het geeft stakeholders voorspelbaarheid, wat vertrouwen opbouwt. Het is geen maatstaf voor betrokkenheidsintensiteit, maar een structuur voor continuïteit.',
        },
        {
          id: 'stk-q3-5',
          question: 'Waarom zijn informele contactmomenten (zoals een koffiegesprek) waardevoller dan alleen formele rapportages bij sleutelstakeholders?',
          options: [
            'Ze zijn goedkoper en sneller dan het schrijven van statusrapporten',
            'Ze voldoen aan de AA1000SES-verplichting voor face-to-face communicatie',
            'Ze bieden informatie over politieke spanningen, onuitgesproken zorgen en veranderende prioriteiten die rapporten niet bevatten',
            'Ze vervangen de noodzaak voor een formeel communicatieplan',
          ],
          correctAnswer: 2,
          explanation: 'Informele contactmomenten geven toegang tot de informele sfeer: politieke verschuivingen binnen de organisatie van de stakeholder, onuitgesproken zorgen, veranderende prioriteiten. Deze informatie bereikt de projectmanager zelden via formele kanalen. Informele contacten zijn een aanvulling op, niet een vervanging van, formele rapportages.',
        },
      ],
    },
    {
      id: 'stk-l-assignment',
      title: 'Praktijkopdracht: Stakeholder Engagement Plan voor Yanmar',
      titleNL: 'Praktijkopdracht: Stakeholder Engagement Plan voor Yanmar',
      duration: '90:00',
      type: 'assignment',
      requires_admin_approval: true,
      assignment: {
        title: 'Bouw een stakeholderbetrokkenheidsplan voor een Yanmar-programma',
        description: `Yanmar voert een digitaliseringsprogramma uit dat productieprocessen in twee fabrieken automatiseert. Het programma raakt 350 medewerkers, drie lijnmanagers, de OR, een externe technologieleverancier, en de Europese compliance-afdeling.

Als programmamanager ben jij verantwoordelijk voor het stakeholder engagement plan. Lever alle onderdelen volledig in.`,
        deliverables: [
          'Stakeholderregister: identificeer minimaal 8 stakeholders met naam/rol, categorie (intern/extern), en primair belang',
          'Classificatie: positioneer alle 8 stakeholders in Mendelow\'s Macht-Interesse Grid met onderbouwing per kwadrant',
          '3 betrokkenheidsstrategieën: selecteer drie stakeholders uit verschillende kwadranten en beschrijf per stakeholder het AA1000SES-niveau, de rationale, en 2 concrete activiteiten',
          'Communicatietemplate: stel één uitgewerkte communicatieboodschap op gericht aan de OR (Ondernemingsraad) over de impact van de automatisering op medewerkers (WIIFM-principe verplicht toegepast)',
        ],
        rubric: [
          { criterion: 'Stakeholderregister volledig (8+) en categorieën correct', points: 20 },
          { criterion: 'Mendelow-classificatie onderbouwd per stakeholder', points: 25 },
          { criterion: 'Betrokkenheidsstrategieën per kwadrant gedifferentieerd en concreet', points: 25 },
          { criterion: 'OR-communicatie past WIIFM toe en is professioneel van toon', points: 20 },
          { criterion: 'Consistente terminologie uit de cursus', points: 10 },
        ],
        submission_format: 'markdown',
      },
    },
    {
      id: 'stk-l-exam',
      title: 'Eindexamen — Stakeholder Management',
      titleNL: 'Eindexamen — Stakeholder Management',
      duration: '30:00',
      type: 'exam',
      videoUrl: '',
      transcript: '',
      content: 'Eindexamen over alle drie modules: identificatie en analyse (M1), betrokkenheid (M2), en duurzame relaties (M3). Slaaggrens: 80% (12 van 15 vragen correct).',
      quiz: [
        {
          id: 'stk-exam-1',
          question: 'Wat is de definitie van een stakeholder volgens de AA1000SES Stakeholder Engagement Standard (2015)?',
          options: [
            'Personen die een financieel belang hebben in het project',
            'Individuen, groepen of organisaties die worden beïnvloed door of zelf invloed uitoefenen op het project',
            'Alle medewerkers van de projectorganisatie die bij het project zijn betrokken',
            'Externe partijen die contractueel zijn gekoppeld aan het project',
          ],
          correctAnswer: 1,
          explanation: 'De AA1000SES-definitie is breed: stakeholders zijn alle individuen, groepen of organisaties die invloed uitoefenen op of beïnvloed worden door het project. Dit omvat zowel directe als indirecte partijen, zowel intern als extern, zowel met als zonder contractuele relatie.',
        },
        {
          id: 'stk-exam-2',
          question: 'In welk kwadrant van Mendelow\'s Macht-Interesse Grid plaatst je een toezichthouder die bevoegd is het project stil te leggen, maar nauwelijks actieve interesse toont?',
          options: [
            'Manage closely — hoge macht, hoge interesse',
            'Keep satisfied — hoge macht, lage interesse',
            'Keep informed — lage macht, hoge interesse',
            'Monitor — lage macht, lage interesse',
          ],
          correctAnswer: 1,
          explanation: 'Hoge macht (bevoegdheid om het project stil te leggen) gecombineerd met lage interesse (nauwelijks actieve betrokkenheid) plaatst de toezichthouder in "Keep satisfied". De strategie is proactief informeren om te voorkomen dat hun belangen onverwacht worden geraakt en ze actief ingrijpen.',
        },
        {
          id: 'stk-exam-3',
          question: 'Welke drie attributen meet het Salience Model van Mitchell, Agle en Wood (1997)?',
          options: [
            'Macht, interesse en urgentie',
            'Macht, legitimiteit en urgentie',
            'Invloed, impact en belang',
            'Betrokkenheid, prioriteit en budget',
          ],
          correctAnswer: 1,
          explanation: 'Het Salience Model (Mitchell et al., 1997, Academy of Management Review) meet drie attributen: macht (vermogen om te beïnvloeden), legitimiteit (erkende rechtvaardigheid van de claim), en urgentie (tijdsgevoeligheid en kritikaliteit). Combinaties leiden tot zeven stakeholdertypen.',
        },
        {
          id: 'stk-exam-4',
          question: 'Een stakeholder heeft alle drie de Salience-attributen (macht, legitimiteit, urgentie). Welk type is dit en welke prioriteit krijgt hij?',
          options: [
            'Gevaarlijke stakeholder — hoge prioriteit vanwege onvoorspelbaarheid',
            'Definitieve stakeholder — hoogste prioriteit',
            'Dominante stakeholder — hoge prioriteit vanwege macht en legitimiteit',
            'Eisende stakeholder — lage prioriteit ondanks urgentie',
          ],
          correctAnswer: 1,
          explanation: 'Een stakeholder met alle drie de attributen heet een "definitieve stakeholder" in het Salience Model. Ze krijgen de hoogste managementprioriteit omdat ze zowel de macht, de erkende rechtvaardigheid als de urgentie hebben om actief te handelen als hun belangen worden genegeerd.',
        },
        {
          id: 'stk-exam-5',
          question: 'Welke RACI-rol heeft per taak altijd precies één persoon?',
          options: [
            'Responsible (R)',
            'Accountable (A)',
            'Consulted (C)',
            'Informed (I)',
          ],
          correctAnswer: 1,
          explanation: 'Accountable (A) heeft per taak precies één persoon — de eindverantwoordelijke. Meerdere A\'s per taak zijn een anti-patroon: er is dan geen echte eindverantwoordelijke en bij problemen schuift iedereen de verantwoordelijkheid door. Responsible (R) kan meerdere personen hebben.',
        },
        {
          id: 'stk-exam-6',
          question: 'Welk AA1000SES-betrokkenheidsniveau is van toepassing wanneer een werkgroep van projectteam EN stakeholders gezamenlijk een oplossing ontwerpt?',
          options: [
            'Informeer',
            'Consulteer',
            'Samenwerk',
            'Empoweer',
          ],
          correctAnswer: 2,
          explanation: 'Samenwerken (niveau 4) houdt in dat projectteam en stakeholders gezamenlijk aan oplossingen werken — via werkgroepen, co-design of gezamenlijke analyse. Het onderscheid met consulteer (niveau 3): bij consulteer vraag je input maar beslist de organisatie; bij samenwerken wordt de beslissing mede door de stakeholder gevormd.',
        },
        {
          id: 'stk-exam-7',
          question: 'Welke zes elementen bevat een volledig communicatieplan?',
          options: [
            'Doelgroep, boodschap, doel, kanaal, frequentie, eigenaar',
            'Stakeholder, bericht, medium, timing, verantwoordelijke, budget',
            'Ontvanger, informatie, actie, feedback, archief, goedkeuring',
            'Wie, wat, waarom, wanneer, waar, hoe',
          ],
          correctAnswer: 0,
          explanation: 'Een volledig communicatieplan bevat: (1) Doelgroep, (2) Boodschap, (3) Doel (informeren/beslissen/draagvlak), (4) Kanaal, (5) Frequentie, en (6) Eigenaar. Elk element is noodzakelijk: zonder eigenaar vallen stromen weg; zonder frequentie ontbreekt ritme; zonder doel is communicatie zinloos.',
        },
        {
          id: 'stk-exam-8',
          question: 'Wat onderscheidt een "positie" van een "belang" bij een stakeholderonderhandeling (Fisher & Ury)?',
          options: [
            'Een positie is formeel vastgelegd in een contract; een belang is informeel',
            'Een positie is wat de stakeholder zegt te willen; een belang is waarom ze dat willen',
            'Een positie is tijdelijk; een belang is permanent',
            'Er is geen relevant onderscheid — beide termen zijn synoniemen',
          ],
          correctAnswer: 1,
          explanation: 'Fisher & Ury (Getting to Yes, Harvard Negotiation Project): een positie is het uitgesproken standpunt ("ik wil meer budget"). Een belang is de onderliggende behoefte of zorg ("ik wil niet voor verrassingen staan"). Door te focussen op belangen in plaats van posities zijn er doorgaans meer creatieve oplossingen mogelijk.',
        },
        {
          id: 'stk-exam-9',
          question: 'Wat is de vertrouwensvergelijking van Maister, Green en Galford?',
          options: [
            'Vertrouwen = Geloofwaardigheid × Betrouwbaarheid × Intimiteit',
            'Vertrouwen = (Geloofwaardigheid + Betrouwbaarheid + Intimiteit) ÷ Zelfgerichtheid',
            'Vertrouwen = Betrouwbaarheid + Intimiteit − Zelfgerichtheid',
            'Vertrouwen = Geloofwaardigheid ÷ (Zelfgerichtheid + Risico)',
          ],
          correctAnswer: 1,
          explanation: 'De vergelijking van Maister, Green en Galford is: Vertrouwen = (C + R + I) ÷ S, waarbij C = Credibility (geloofwaardigheid), R = Reliability (betrouwbaarheid), I = Intimacy (intimiteit/veiligheid), en S = Self-orientation (zelfgerichtheid). De S staat in de noemer — hogere zelfgerichtheid verlaagt het vertrouwen.',
        },
        {
          id: 'stk-exam-10',
          question: 'Welke Thomas-Kilmann conflictstijl combineert hoge assertiviteit met hoge samenwerking en is meest geschikt voor complexe conflicten?',
          options: [
            'Competing',
            'Compromising',
            'Collaborating',
            'Accommodating',
          ],
          correctAnswer: 2,
          explanation: 'Collaborating combineert hoge assertiviteit (de eigen belangen worden volledig ingebracht) met hoge samenwerking (het belang van de andere partij wordt volledig meegenomen). Het leidt tot win-win-oplossingen maar vereist tijd en vertrouwen. Het is het meest geschikt voor complexe, meervoudige conflicten.',
        },
        {
          id: 'stk-exam-11',
          question: 'Wat is de primaire reden dat het Mendelow Macht-Interesse Grid bij elke projectfase-overgang opnieuw moet worden beoordeeld?',
          options: [
            'Omdat de regelgeving vereist dat het grid maandelijks wordt bijgewerkt',
            'Omdat stakeholderposities dynamisch zijn en kunnen veranderen door projectgebeurtenissen',
            'Omdat het grid anders niet voldoet aan PRINCE2-vereisten',
            'Omdat nieuwe stakeholders altijd worden toegevoegd bij fase-overgangen',
          ],
          correctAnswer: 1,
          explanation: 'Het grid is niet statisch. Een leverancier met weinig macht en interesse kan bij een kritiek leveringsrisico plotseling naar het "Manage closely"-kwadrant schuiven. Projectgebeurtenissen, reorganisaties, en veranderende prioriteiten kunnen de machts- en interessepositie van elke stakeholder wijzigen.',
        },
        {
          id: 'stk-exam-12',
          question: 'Wat is de definitie van BATNA in de context van stakeholderonderhandelingen?',
          options: [
            'De meest agressieve onderhandelingspositie die je kunt innemen zonder de relatie te beschadigen',
            'Het budget dat de organisatie maximaal kan toewijzen aan stakeholderbetrokkenheid',
            'De beste alternatieve uitkomst als geen overeenstemming wordt bereikt met de stakeholder',
            'Een techniek om de belangen van drie of meer stakeholders te balanceren',
          ],
          correctAnswer: 2,
          explanation: 'BATNA (Best Alternative to a Negotiated Agreement) is de beste uitkomst die jij of de stakeholder kan bereiken als de onderhandeling mislukt. Het kennen van jouw BATNA en die van de stakeholder geeft inzicht in de onderhandelingsmacht van beide partijen en helpt bepalen wanneer een akkoord de voorkeur verdient boven breken.',
        },
        {
          id: 'stk-exam-13',
          question: 'Welk betrokkenheidsniveau van de AA1000SES is het meest passend voor een Manage-closely-stakeholder met hoge macht én hoge interesse?',
          options: [
            'Monitor',
            'Informeer',
            'Consulteer of samenwerk',
            'Empoweer',
          ],
          correctAnswer: 2,
          explanation: 'Manage-closely-stakeholders (hoge macht, hoge interesse) vereisen een hoog betrokkenheidsniveau: consulteer (niveau 3) of samenwerk (niveau 4). Ze moeten worden geconsulteerd bij beslissingen en betrokken bij oplossingen. Informeren (niveau 2) is onvoldoende — ze verwachten en verdienen een actieve stem.',
        },
        {
          id: 'stk-exam-14',
          question: 'Waarom is stakeholderritme belangrijk bij langlopende projecten?',
          options: [
            'Omdat regelgeving een minimale communicatiefrequentie voorschrijft voor projecten langer dan 6 maanden',
            'Omdat het voorspelbaarheid biedt aan stakeholders en draagvlak onderhoudt ook wanneer het project minder zichtbaar is',
            'Omdat een vast ritme ervoor zorgt dat het communicatieplan niet hoeft te worden aangepast',
            'Omdat informele contactmomenten in een ritme wettelijk verplicht zijn bij OR-betrokkenheid',
          ],
          correctAnswer: 1,
          explanation: 'Stakeholderritme geeft voorspelbaarheid — stakeholders weten wanneer ze informatie ontvangen en wanneer input van hen wordt gevraagd. Dit bouwt vertrouwen op. Projecten die halverwege stil vallen in communicatie verliezen draagvlak precies wanneer ze het meest nodig hebben: bij moeilijke beslissingen en veranderingen.',
        },
        {
          id: 'stk-exam-15',
          question: 'Hoe onderscheidt de "Consulted"-rol (C) zich van de "Informed"-rol (I) in de RACI-matrix?',
          options: [
            'C ontvangt meer informatie dan I',
            'C heeft tweerichtingscommunicatie en input vóór de beslissing; I ontvangt eénrichtingscommunicatie ná de beslissing',
            'C is interne betrokkenheid; I is externe communicatie',
            'C en I zijn functioneel identiek maar worden gebruikt voor respectievelijk senior en junior stakeholders',
          ],
          correctAnswer: 1,
          explanation: 'C (Consulted) betekent dat de input van deze persoon wordt gevraagd vóór de beslissing — het is tweerichtingsverkeer. I (Informed) betekent dat de persoon ná de beslissing op de hoogte wordt gesteld — het is eénrichtingsverkeer. Dit onderscheid is cruciaal: een Consulted die in werkelijkheid Informed is, zal zich buitengesloten voelen.',
        },
      ],
    },
    {
      id: 'stk-l-cert',
      title: 'Certificaat',
      titleNL: 'Certificaat',
      duration: '5:00',
      type: 'certificate',
      videoUrl: '',
      transcript: '',
      content: 'Gefeliciteerd! Je hebt de cursus Stakeholder Management voltooid. Behaal een score van 80% of hoger op het eindexamen om je certificaat te ontvangen.',
    },
  ],
};

// ============================================
// MODULES EXPORT
// ============================================
export const stakeholderManagementModules: Module[] = [
  module1,
  module2,
  module3,
];

// ============================================
// COURSE DEFINITION
// ============================================
export const stakeholderManagementCourse: Course = {
  id: 'stakeholder-management',
  title: 'Stakeholder Management',
  titleNL: 'Stakeholdermanagement',
  description: 'Master stakeholder identification, classification, engagement, and sustained relationship management — grounded in Mendelow, Mitchell-Agle-Wood, and the AA1000SES standard.',
  descriptionNL: 'Beheers stakeholderidentificatie, classificatie, betrokkenheid en duurzaam relatiebeheer — gebaseerd op Mendelow, Mitchell-Agle-Wood en de AA1000SES-standaard.',
  icon: Users,
  color: BRAND.cyan,
  gradient: `linear-gradient(135deg, ${BRAND.cyan}, ${BRAND.blue})`,
  category: 'management',
  methodology: 'general',
  levels: 3,
  modules: stakeholderManagementModules.reduce((total, m) => total + m.lessons.length, 0),
  duration: 8,
  rating: 4.8,
  students: 0,
  tags: ['Stakeholders', 'Communication', 'Power-Interest Grid', 'RACI', 'Negotiation', 'Engagement'],
  tagsNL: ['Stakeholders', 'Communicatie', 'Macht-Interesse Grid', 'RACI', 'Onderhandelen', 'Betrokkenheid'],
  instructor: instructors.anna,
  featured: false,
  bestseller: false,
  new: true,
  freeForCustomers: false,
  certificate: true,
  whatYouLearn: [
    'Identify and map all stakeholders — including indirect ones',
    'Apply Mendelow\'s Power-Interest Grid and the Salience Model',
    'Build a RACI matrix without common pitfalls',
    'Design a communication plan with the 6-element structure',
    'Craft tailored messages using the WIIFM principle',
    'Negotiate with stakeholders using Fisher & Ury\'s principled negotiation',
    'Build and sustain trust using the Maister trust equation',
    'Maintain stakeholder momentum with a consistent engagement rhythm',
  ],
  whatYouLearnNL: [
    'Alle stakeholders identificeren en in kaart brengen — inclusief indirecte',
    'Mendelow\'s Macht-Interesse Grid en het Salience Model toepassen',
    'Een RACI-matrix opstellen zonder veelgemaakte fouten',
    'Een communicatieplan bouwen met de 6-elementen structuur',
    'Gerichte boodschappen opstellen met het WIIFM-principe',
    'Onderhandelen met stakeholders via Fisher & Ury\'s principieel onderhandelen',
    'Vertrouwen opbouwen met de Maister-vergelijking',
    'Stakeholdermomentum behouden met een consistent betrokkenheidsritme',
  ],
  requirements: [
    'Basic project management experience (1+ year)',
    'Familiarity with project roles and team structures',
  ],
  requirementsNL: [
    'Basis projectmanagementervaring (1+ jaar)',
    'Bekendheid met projectrollen en teamstructuren',
  ],
  targetAudience: [
    'Project managers and program managers',
    'PMO leads and change managers',
    'Business analysts and product owners',
    'Team leads responsible for stakeholder communication',
  ],
  targetAudienceNL: [
    'Projectmanagers en programmamanagers',
    'PMO-leads en change managers',
    'Business analisten en product owners',
    'Teamleiders verantwoordelijk voor stakeholdercommunicatie',
  ],
  courseModules: stakeholderManagementModules,
};

export default stakeholderManagementCourse;
