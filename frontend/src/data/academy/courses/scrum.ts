// ============================================
// COURSE: SCRUM MASTER CERTIFIED
// ============================================
// Complete Scrum training with all events, roles, and artifacts
// ============================================

import { RefreshCw } from 'lucide-react';
import { Course, Module } from '../types';
import { BRAND } from '../brand';
import { instructors } from '../instructors';

// ============================================
// MODULE 1: SCRUM FUNDAMENTEN
// ============================================
const module1: Module = {
  id: 'scrum-m1',
  title: 'Module 1: Scrum Fundamenten',
  titleNL: 'Module 1: Scrum Fundamenten',
  description: 'The foundation: empiricism, values, pillars, and the framework.',
  descriptionNL: 'De basis van Scrum: geschiedenis, waarden, principes en het framework.',
  lessons: [
    {
      id: 'scrum-l1',
      title: 'De oorsprong en essentie van Scrum',
      titleNL: 'De oorsprong en essentie van Scrum',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      transcript: `Welkom bij de Scrum Master cursus! In deze eerste les duiken we in de 
oorsprong van Scrum en begrijpen we waarom het zo effectief is.

**De Geboorte van Scrum**

Scrum ontstond begin jaren '90 uit de frustratie met traditionele projectmethoden. 
Ken Schwaber en Jeff Sutherland ontwikkelden Scrum gebaseerd op:

- **Empirisme**: Kennis komt voort uit ervaring en beslissingen op basis van observatie
- **Lean thinking**: Elimineer verspilling, focus op waarde
- **Complex adaptive systems**: Hoe teams zich aanpassen aan verandering

De naam "Scrum" komt uit rugby - het moment waarop het team samenkomt en als eenheid 
naar voren beweegt.

**Waarom Scrum Werkt**

Traditionele methoden gaan uit van voorspelbaarheid:
- We kunnen alles vooraf specificeren
- We kunnen alles vooraf plannen
- Verandering is een afwijking

Maar complexe projecten zijn niet voorspelbaar:
- Requirements veranderen
- Technologie evolueert
- Marktomstandigheden wijzigen

Scrum omarmt deze onzekerheid door:
- Kort-cyclisch te werken (Sprints)
- Regelmatig te inspecteren en aan te passen
- Continue feedback te integreren

**De Drie Pijlers van Scrum**

Scrum is gebaseerd op drie pijlers van empirisme:

**1. Transparantie**
Alle belangrijke aspecten van het proces moeten zichtbaar zijn voor iedereen:
- Het werk dat gedaan moet worden (Product Backlog)
- Het werk in uitvoering (Sprint Backlog)
- De voortgang (Burndown, Velocity)
- Impediments en risico's

Zonder transparantie kun je niet effectief inspecteren.

**2. Inspectie**
Regelmatig de voortgang en artefacten onderzoeken:
- Tijdens Daily Scrum: zijn we on track?
- Tijdens Sprint Review: hebben we waarde geleverd?
- Tijdens Retrospective: hoe kunnen we verbeteren?

Inspectie moet frequent genoeg zijn om problemen vroeg te signaleren, maar niet zo 
frequent dat het het werk verstoort.

**3. Adaptatie**
Als inspectie aantoont dat iets afwijkt, moet je aanpassen:
- Het product (wat we bouwen)
- Het proces (hoe we werken)
- De planning (wanneer we opleveren)

De kracht van Scrum zit in deze cyclus van transparantie → inspectie → adaptatie.

**De Vijf Scrum Waarden**

In 2016 werden de Scrum waarden expliciet gemaakt:

**Commitment**: Het team committeert aan het Sprint Goal
**Focus**: Focus op het werk van de Sprint
**Openness**: Open zijn over werk en uitdagingen
**Respect**: Teamleden respecteren elkaar als professionals
**Courage**: Moed om moeilijke problemen aan te pakken

Deze waarden zijn niet soft - ze zijn essentieel voor Scrum succes.

**Het Scrum Framework**

Scrum bestaat uit:

**3 Rollen (Accountabilities)**
- Product Owner
- Scrum Master
- Developers

**5 Events (Ceremonies)**
- Sprint
- Sprint Planning
- Daily Scrum
- Sprint Review
- Sprint Retrospective

**3 Artefacten**
- Product Backlog
- Sprint Backlog
- Increment

Elk element heeft een specifiek doel en draagt bij aan transparantie, inspectie of adaptatie.

**Wat Scrum Niet Is**

Laten we ook benoemen wat Scrum NIET is:
- Geen silver bullet: Lost niet alle problemen op
- Geen methodologie: Het is een framework, je moet invullen
- Geen project management methode: Geen planning, budgettering, etc.
- Niet alleen voor software: Werkt in veel domeinen

Scrum geeft je een structuur, maar vulling is aan jou.

**Samenvatting**

Scrum:
- Is gebaseerd op empirisme en lean thinking
- Steunt op drie pijlers: transparantie, inspectie, adaptatie
- Wordt gedragen door vijf waarden
- Bestaat uit rollen, events en artefacten
- Is een framework, geen complete methode`,
      keyTakeaways: [
        'Scrum is gebaseerd op empirisme: leren door ervaring',
        'Drie pijlers: transparantie, inspectie, adaptatie',
        'Vijf waarden: commitment, focus, openness, respect, courage',
        'Scrum is een framework, geen complete methodologie',
      ],
      resources: [
        {
          name: 'De Scrum Guide 2020 (NL)',
          type: 'PDF',
          size: '890 KB',
          description: 'De officiële Scrum Guide in het Nederlands',
        },
      ],
    },
    {
      id: 'scrum-l2',
      title: 'De Scrum Rollen (Accountabilities)',
      titleNL: 'De Scrum Rollen (Accountabilities)',
      duration: '22:00',
      type: 'video',
      videoUrl: '',
      transcript: `In Scrum zijn er drie accountabilities: Product Owner, Scrum Master, 
en Developers. Let op: het zijn "accountabilities", geen job titles - ze beschrijven 
verantwoordelijkheden, niet functietitels.

**Het Scrum Team**

Het Scrum Team bestaat uit:
- Eén Product Owner
- Eén Scrum Master
- Developers (typisch 3-9 personen)

Het team is:
- **Cross-functional**: Alle skills om waarde te leveren
- **Self-managing**: Het team bepaalt wie wat wanneer doet
- **Accountability**: Gezamenlijk verantwoordelijk voor resultaat

Geen hiërarchie binnen het team - alle leden zijn gelijkwaardig.

**De Product Owner**

De Product Owner is verantwoordelijk voor het maximaliseren van de waarde van het 
product en het werk van het Development Team.

Kernverantwoordelijkheden:
- **Product Backlog beheren**: Items toevoegen, verfijnen, prioriteren
- **Product visie communiceren**: Het team begrijpt waar we naartoe werken
- **Stakeholders managen**: Input verzamelen, verwachtingen managen
- **Waarde optimaliseren**: Zorgen dat we de juiste dingen bouwen

De Product Owner:
- Is één persoon, geen committee
- Heeft mandaat om beslissingen te nemen
- Kan werk delegeren maar blijft accountable
- Moet beschikbaar zijn voor het team

Anti-patterns:
- PO als "requirements writer"
- Committee beslist i.p.v. één persoon
- PO nooit beschikbaar
- PO micro-managed het team

**De Scrum Master**

De Scrum Master is verantwoordelijk voor het bevorderen en ondersteunen van Scrum.

De Scrum Master helpt het Scrum Team door:
- Scrum practices te coachen
- Impediments te verwijderen
- Events te faciliteren
- Het team te beschermen

De Scrum Master helpt de Product Owner door:
- Effectieve backlog management technieken
- Product Goal en planning begrijpen
- Empirische product planning

De Scrum Master helpt de organisatie door:
- Scrum adoptie te begeleiden
- Agile practices te implementeren
- Veranderingen te faciliteren

De Scrum Master is:
- Servant-leader: Dient het team
- Coach: Helpt het team groeien
- Facilitator: Begeleidt events
- Change agent: Stimuleert verbetering

De Scrum Master is NIET:
- De teamleider of manager
- De project manager
- De secretaris die alleen meetings plant
- De beschermer die het team afschermt van stakeholders

**De Developers**

Developers zijn de professionals die het werk doen om elke Sprint een bruikbaar 
Increment te creëren.

Let op: "Developers" betekent iedereen die bouwt - niet alleen programmeurs. 
Testers, designers, analisten - iedereen die bijdraagt aan het product.

Verantwoordelijkheden:
- **Sprint Backlog creëren**: Plan voor de Sprint
- **Kwaliteit bewaken**: Volgen van Definition of Done
- **Dagelijks aanpassen**: Plan bijstellen richting Sprint Goal
- **Elkaar accountable houden**: Als professionals

Het team is self-managing:
- Het team bepaalt WIE wat doet
- Het team bepaalt HOE het werk wordt gedaan
- Het team bepaalt WANNEER (binnen de Sprint)

De Product Owner bepaalt WAT er wordt gebouwd (prioriteit).

**Team Samenstelling**

Een ideaal Scrum Team:
- 3-9 Developers (+ PO + SM = 5-11 totaal)
- Alle benodigde skills aanwezig
- Co-located waar mogelijk
- Dedicated (niet te veel multi-tasking)

Waarom max 9 Developers?
- Communicatie-overhead stijgt exponentieel
- Self-management wordt moeilijker
- Daily Scrum wordt te lang

Bij grote producten: meerdere Scrum Teams, elk met eigen PO/SM.

**Gecombineerde Rollen?**

Kan de Scrum Master ook Developer zijn?
- Mogelijk in kleine teams
- Risico: SM werk krijgt prioriteit niet
- Beter: dedicated SM voor 1-2 teams

Kan de Product Owner ook Developer zijn?
- Sterk afgeraden
- Conflicterende belangen
- PO moet beschikbaar zijn voor stakeholders

**Samenvatting**

De drie accountabilities:
- **Product Owner**: Maximaliseert waarde, beheert backlog
- **Scrum Master**: Servant-leader, coach, facilitator
- **Developers**: Bouwen het product, self-managing

Samen vormen ze een cross-functional, self-managing team.`,
      keyTakeaways: [
        'Drie accountabilities: Product Owner, Scrum Master, Developers',
        'Product Owner maximaliseert waarde en beheert de backlog',
        'Scrum Master is servant-leader, coach en facilitator',
        'Developers zijn alle mensen die aan het product werken',
      ],
      resources: [
        {
          name: 'Rollen Overzicht Poster',
          type: 'PDF',
          size: '1.2 MB',
          description: 'Visueel overzicht van alle rollen en verantwoordelijkheden',
        },
      ],
    },
    {
      id: 'scrum-l3',
      title: 'De Scrum Events',
      titleNL: 'De Scrum Events',
      duration: '25:00',
      type: 'video',
      videoUrl: '',
      transcript: `Scrum kent vijf events die samen zorgen voor transparantie, inspectie 
en adaptatie. Elk event heeft een specifiek doel - als je het doel mist, mis je de waarde.

**De Sprint**

De Sprint is de container voor alle andere events. Het is een tijdbox van maximaal 
één maand waarin een bruikbaar Increment wordt gecreëerd.

Kenmerken:
- Vaste lengte (1-4 weken, consistent houden)
- Heeft een Sprint Goal
- Geen wijzigingen die Sprint Goal bedreigen
- Scope mag worden verduidelijkt met PO
- Kwaliteit niet verlagen

De Sprint eindigt nooit eerder:
- Werk af? Begin aan nieuw werk
- Sprint Goal bereikt? Vier het, maar Sprint loopt door

De Sprint kan worden afgebroken:
- Alleen door de Product Owner
- Als Sprint Goal obsolete wordt
- Dit is zeldzaam en verstoort het team

Waarom timeboxes werken:
- Creëren ritme en voorspelbaarheid
- Forceren prioritering
- Beperken risico (max 1 maand verlies)
- Geven regelmatige feedbackmomenten

**Sprint Planning**

Sprint Planning start de Sprint. Het team plant het werk voor de komende Sprint.

Timebox: Max 8 uur voor een 1-maand Sprint (korter voor kortere Sprints)

De drie vragen:
1. **Waarom is deze Sprint waardevol?** → Sprint Goal
2. **Wat kan er worden gedaan?** → Selectie uit Product Backlog
3. **Hoe wordt het werk gedaan?** → Decompositie naar taken

**Sprint Goal**:
- Geeft richting en focus
- Geeft flexibiliteit in wat precies wordt gebouwd
- Motiveert het team
- Meetpunt voor succes

**Forecast**:
- Team selecteert items uit de Product Backlog
- Gebaseerd op capacity en historische velocity
- Commitment aan het Sprint Goal, niet aan alle items

**Sprint Backlog**:
- Geselecteerde items + Sprint Goal + plan (taken)
- Eigendom van de Developers
- Wordt dagelijks geüpdatet

**Daily Scrum**

De Daily Scrum is een 15-minuten event voor de Developers om de voortgang richting 
het Sprint Goal te inspecteren en indien nodig het Sprint Backlog aan te passen.

Timebox: Max 15 minuten, elke dag, zelfde tijd, zelfde plek

Doel:
- Transparantie over voortgang
- Identificeren van impediments
- Planning voor de komende 24 uur

Format is vrij - het team kiest wat werkt. Populaire formats:
- De drie vragen (wat gedaan, wat ga ik doen, impediments)
- Walk the board (focus op items, niet personen)
- Sprint Goal focus (wat hebben we nodig om het goal te halen?)

Wie is erbij?
- Developers: verplicht
- Scrum Master: helpt als nodig
- Product Owner: welkom maar niet verplicht
- Anderen: mogen luisteren, niet participeren

Anti-patterns:
- Status meeting voor de manager
- Langer dan 15 minuten
- Problemen oplossen in de Daily
- Praten tegen de Scrum Master i.p.v. elkaar

**Sprint Review**

De Sprint Review is er om het Increment te inspecteren en de Product Backlog indien 
nodig aan te passen.

Timebox: Max 4 uur voor een 1-maand Sprint

Doel:
- Demo van wat er gebouwd is (Increment)
- Feedback verzamelen van stakeholders
- Product Backlog aanpassen op basis van feedback
- Bespreken wat als volgende

Het is GEEN:
- Een presentatie (het is collaboratief)
- Sign-off meeting
- Demo door de Scrum Master

Aanwezigen:
- Heel het Scrum Team
- Key stakeholders (uitgenodigd door PO)

Format:
1. PO legt uit wat Done is en wat niet
2. Developers demonstreren het werk
3. Discussie en feedback
4. Review van timeline, budget, capabilities
5. Samen bespreken wat hierna komt

**Sprint Retrospective**

De Sprint Retrospective is er om het team te helpen reflecteren op de afgelopen 
Sprint en verbeteringen te identificeren.

Timebox: Max 3 uur voor een 1-maand Sprint

Doel:
- Inspecteren hoe het ging (mensen, relaties, proces, tools)
- Identificeren wat goed ging en wat beter kan
- Plan maken voor verbeteringen

Focus gebieden:
- Teamdynamiek en samenwerking
- Proces en werkwijze
- Definition of Done
- Tools en technieken

Output:
- Concrete verbeteracties
- Meest impactvolle verbetering in Sprint Backlog

Veiligheid is essentieel:
- Mensen moeten open durven zijn
- Geen blame, wel leren
- Vegas regel: wat hier besproken wordt...

Populaire formats:
- Start/Stop/Continue
- Sailboat (wind, anker, rotsen, eiland)
- 4Ls (Liked, Learned, Lacked, Longed for)
- Mad/Sad/Glad

**De Events Samen**

De events creëren een inspect-adapt ritme:
- Sprint Planning: Plan de Sprint
- Daily Scrum: Dagelijkse inspectie en adaptatie
- Sprint Review: Inspectie van het product
- Sprint Retrospective: Inspectie van het proces

Skip geen events - elk heeft een cruciale functie!`,
      keyTakeaways: [
        'De Sprint is de container voor alle andere events (max 4 weken)',
        'Sprint Planning definieert het Sprint Goal en selecteert werk',
        'Daily Scrum is max 15 min voor dagelijkse synchronisatie',
        'Sprint Review toont het Increment; Retrospective verbetert het proces',
      ],
      resources: [
        {
          name: 'Scrum Events Cheat Sheet',
          type: 'PDF',
          size: '680 KB',
          description: 'Overzicht van alle events met timeboxes en doelen',
        },
        {
          name: 'Retrospective Formats',
          type: 'PDF',
          size: '1.4 MB',
          description: '20 verschillende retrospective formats',
        },
      ],
    },
    {
      id: 'scrum-l4',
      title: 'De Scrum Artefacten',
      titleNL: 'De Scrum Artefacten',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      transcript: `Scrum kent drie artefacten die transparantie bieden over het werk. 
Elk artefact heeft een "commitment" dat duidelijkheid en focus geeft.

**De Artefacten en hun Commitments**

| Artefact | Commitment |
|----------|------------|
| Product Backlog | Product Goal |
| Sprint Backlog | Sprint Goal |
| Increment | Definition of Done |

**Product Backlog**

De Product Backlog is een geordende lijst van alles wat nodig is om het product 
te verbeteren.

Kenmerken:
- Eén backlog per product
- Eigendom van de Product Owner
- Dynamisch: constant evoluerend
- Geordend: belangrijkste bovenaan
- Nooit "af"

Product Backlog items:
- Features
- Bug fixes
- Technical debt
- Knowledge acquisition
- Anything needed to improve the product

Product Backlog Refinement:
- Continu proces, niet een event
- Max 10% van team capacity
- Items worden kleiner en duidelijker
- Ready = klein genoeg, duidelijk genoeg, geschat

**Product Goal**

Het Product Goal is het lange-termijn doel voor het Scrum Team.

Kenmerken:
- Beschrijft de toekomstige staat van het product
- Geeft richting aan Sprint Goals
- Eén Product Goal per keer
- Team moet het goal halen of abandonen

Het Product Goal staat in de Product Backlog.

**Sprint Backlog**

Het Sprint Backlog is de set werk voor de huidige Sprint.

Bevat:
- Sprint Goal (waarom)
- Geselecteerde Product Backlog items (wat)
- Actionable plan voor oplevering (hoe)

Kenmerken:
- Eigendom van de Developers
- Real-time beeld van het werk
- Wordt dagelijks geüpdatet
- Voldoende detail voor Daily Scrum

Het plan (taken) is een forecast, geen contract. Het evolueert naarmate 
het team meer leert.

**Sprint Goal**

Het Sprint Goal geeft focus en flexibiliteit.

Kenmerken:
- Eén coherent doel per Sprint
- Gecreëerd tijdens Sprint Planning
- Commitment van de Developers
- Geeft ruimte om scope te onderhandelen

Voorbeeld:
"Klanten kunnen online betalen" (niet: "PBI-123, PBI-124, PBI-125")

Met een goed Sprint Goal:
- Kan het team flexibel zijn in wat precies wordt gebouwd
- Heeft het team een meetpunt voor succes
- Kan het team samenwerken i.p.v. individuele items afvinken

**Increment**

Het Increment is de som van alle Product Backlog items die tijdens een Sprint 
en alle voorgaande Sprints zijn voltooid.

Kenmerken:
- Moet bruikbaar zijn
- Moet voldoen aan de Definition of Done
- Kan worden gereleased (beslissing PO)
- Meerdere Increments per Sprint mogelijk

Het Increment is additief: elke Sprint voegt toe aan vorige Increments.

**Definition of Done**

De Definition of Done is een formele beschrijving van wanneer een Increment 
voldoet aan de kwaliteitseisen.

Doel:
- Transparantie over wat "Done" betekent
- Kwaliteitsstandaard voor het team
- Basis voor inspectie tijdens Sprint Review

Voorbeeld Definition of Done:
- Code geschreven en gereviewed
- Unit tests geschreven (min 80% coverage)
- Integration tests passed
- Documentation updated
- Deployed to staging
- Product Owner accepted

De DoD:
- Geldt voor heel het Scrum Team
- Wordt gerespecteerd door iedereen
- Kan worden aangescherpt (nooit verlicht)
- Als organisatie een DoD heeft: team moet minimaal daaraan voldoen

Items die niet aan DoD voldoen:
- Worden niet gedemonstreerd
- Gaan terug naar Product Backlog
- Tellen niet mee voor velocity

**Samenvatting**

De drie artefacten:
- **Product Backlog**: Wat kan worden gebouwd (commitment: Product Goal)
- **Sprint Backlog**: Plan voor deze Sprint (commitment: Sprint Goal)
- **Increment**: Wat is gebouwd (commitment: Definition of Done)

Transparantie is key - als artefacten niet transparant zijn, falen inspectie en adaptatie.`,
      keyTakeaways: [
        'Elk artefact heeft een commitment dat focus geeft',
        'Product Backlog is geordend en eigendom van de Product Owner',
        'Sprint Backlog is eigendom van de Developers en evolueert',
        'Definition of Done bepaalt wanneer werk echt "Done" is',
      ],
      resources: [
        {
          name: 'Definition of Done Template',
          type: 'PDF',
          size: '320 KB',
          description: 'Template en voorbeelden voor Definition of Done',
        },
      ],
    },
    {
      id: 'scrum-l5',
      title: 'Quiz: Scrum Fundamenten',
      titleNL: 'Quiz: Scrum Fundamenten',
      duration: '15:00',
      type: 'quiz',
      quiz: [
        {
          id: 'scrum-q1',
          question: 'Wat zijn de drie pijlers van Scrum?',
          options: [
            'Planning, Uitvoering, Controle',
            'Transparantie, Inspectie, Adaptatie',
            'Commitment, Focus, Respect',
            'Sprint, Backlog, Increment'
          ],
          correctAnswer: 1,
          explanation: 'De drie pijlers van empirisme in Scrum zijn: Transparantie, Inspectie en Adaptatie.',
        },
        {
          id: 'scrum-q2',
          question: 'Wie is verantwoordelijk voor het maximaliseren van de waarde van het product?',
          options: ['Scrum Master', 'Product Owner', 'Developers', 'Stakeholders'],
          correctAnswer: 1,
          explanation: 'De Product Owner is verantwoordelijk voor het maximaliseren van de waarde van het product.',
        },
        {
          id: 'scrum-q3',
          question: 'Wat is de maximale lengte van een Sprint?',
          options: ['1 week', '2 weken', '4 weken', '6 weken'],
          correctAnswer: 2,
          explanation: 'Een Sprint is maximaal één maand (4 weken). Kortere Sprints zijn ook mogelijk.',
        },
        {
          id: 'scrum-q4',
          question: 'Wat is het commitment van de Product Backlog?',
          options: ['Sprint Goal', 'Definition of Done', 'Product Goal', 'Release Goal'],
          correctAnswer: 2,
          explanation: 'Het Product Goal is het commitment van de Product Backlog.',
        },
        {
          id: 'scrum-q5',
          question: 'Hoe lang duurt de Daily Scrum maximaal?',
          options: ['30 minuten', '15 minuten', '1 uur', 'Zo lang als nodig'],
          correctAnswer: 1,
          explanation: 'De Daily Scrum is getimeboxed op maximaal 15 minuten.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 2: DE ROL VAN DE SCRUM MASTER
// ============================================
const module2: Module = {
  id: 'scrum-m2',
  title: 'Module 2: De Rol van de Scrum Master',
  titleNL: 'Module 2: De Rol van de Scrum Master',
  description: 'Deep dive into the Scrum Master role: servant leadership, coaching, and facilitation.',
  descriptionNL: 'Diepgaande behandeling van de Scrum Master rol: servant leadership, coaching en facilitatie.',
  lessons: [
    {
      id: 'scrum-l6',
      title: 'Servant Leadership',
      titleNL: 'Servant Leadership',
      duration: '20:00',
      type: 'video',
      videoUrl: '',
      transcript: `De Scrum Master is een servant-leader. Maar wat betekent dat precies?

**Wat is Servant Leadership?**

Servant leadership draait de traditionele piramide om:
- Traditioneel: Leider bovenaan, team ondersteunt de leider
- Servant: Team bovenaan, leider ondersteunt het team

De Scrum Master is er om het team succesvol te maken, niet andersom.

**De Kenmerken van een Servant Leader**

**1. Luisteren**
- Actief luisteren naar het team
- Begrijpen wat ze nodig hebben
- Niet direct met oplossingen komen

**2. Empathie**
- Begrijpen van perspectieven
- Waardering voor individuele bijdragen
- Erkennen van uitdagingen

**3. Awareness**
- Zelfbewustzijn over eigen gedrag
- Bewustzijn van teamdynamiek
- Herkennen van patronen

**4. Overtuigen (niet forceren)**
- Consensus bouwen
- Door argumenten, niet autoriteit
- Geduld hebben

**5. Conceptualiseren**
- Grotere plaatje zien
- Verbinden van details aan doelen
- Visie delen

**6. Groeien van anderen**
- Investeren in teamleden
- Coaching en mentoring
- Ruimte geven voor fouten

**Servant Leadership in de Praktijk**

Scenario: Het team loopt vast op een technisch probleem.

Traditionele manager: "Doe het zo" (directief)
Servant leader: "Wat hebben jullie nodig om dit op te lossen?" (faciliterend)

De servant leader:
- Vraagt wat het team nodig heeft
- Verwijdert obstakels
- Faciliteert discussie
- Vertrouwt op de expertise van het team

**De SM als Coach**

Coaching = het team helpen zelf antwoorden te vinden

Coaching technieken:
- Krachtige vragen stellen
- Reflectie stimuleren
- Niet direct antwoorden geven
- Experimenteren aanmoedigen

**De SM als Facilitator**

Faciliteren = het team helpen effectief samen te werken

- Meetings leiden zonder te domineren
- Iedereen aan het woord laten
- Timeboxes bewaken
- Focus houden

**De SM als Teacher**

Teaching = Scrum en Agile principes uitleggen

- Scrum Guide uitleggen
- Waarom achter de regels
- Best practices delen
- Nieuwe teamleden onboarden

**Samenvatting**

De Scrum Master als servant-leader:
- Dient het team, niet andersom
- Luistert en vraagt i.p.v. vertelt
- Coacht, faciliteert en onderwijst
- Vertrouwt op het team`,
      keyTakeaways: [
        'Servant leadership draait de traditionele piramide om',
        'De SM dient het team, niet andersom',
        'Luisteren, empathie en overtuigen zijn kernvaardigheden',
        'De SM is coach, facilitator en teacher',
      ],
    },
    {
      id: 'scrum-l7',
      title: 'Impediments Oplossen',
      titleNL: 'Impediments Oplossen',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      transcript: `Een van de belangrijkste taken van de Scrum Master is het verwijderen 
van impediments - obstakels die het team hinderen.

**Wat is een Impediment?**

Een impediment is alles wat het team vertraagt of verhindert in het leveren van waarde.

Voorbeelden:
- Wachtende op een ander team
- Gebrek aan toegang tot systemen
- Onduidelijke requirements
- Teamconflicten
- Te veel meetings
- Technische problemen

**Impediments vs. Taken**

Niet alles is een impediment voor de SM:
- "Ik moet deze bug fixen" = taak voor developer
- "Ik kan niet deployen want de server is down" = impediment

Regel: Als het team het zelf kan oplossen, is het geen impediment voor de SM.

**Het Impediment Oplossingsproces**

**1. Identificeren**
- Daily Scrum: "Welke blokkades heb je?"
- Observatie van het team
- Retrospectives
- 1-op-1 gesprekken

**2. Prioriteren**
- Impact op Sprint Goal
- Urgentie
- Hoeveel teamleden geraakt

**3. Onderzoeken**
- Root cause analysis
- Wie kan helpen?
- Welke opties zijn er?

**4. Actie ondernemen**
- Zelf oplossen waar mogelijk
- Escaleren waar nodig
- Team informeren over voortgang

**5. Voorkomen**
- Patronen herkennen
- Structurele oplossingen zoeken
- Processen aanpassen

**Categorieën Impediments**

**Organisatorisch:**
- Te veel bureaucratie
- Onduidelijke beslissingsbevoegdheid
- Conflicterende prioriteiten

**Technisch:**
- Legacy systemen
- Missing tools
- Environment issues

**Team-gerelateerd:**
- Conflicten
- Skill gaps
- Communicatieproblemen

**Extern:**
- Afhankelijkheden van andere teams
- Vendor issues
- Klant niet beschikbaar

**Escaleren**

Soms kan de SM het niet zelf oplossen. Dan escaleren naar:
- Management
- Product Owner
- Andere Scrum Masters
- HR

Escaleren is geen falen - het is effectief impediments oplossen.

**Impediment Backlog**

Houd een lijst bij van impediments:
- Wat is het impediment?
- Wanneer geïdentificeerd?
- Wie werkt eraan?
- Status
- Impact op team

**Samenvatting**

Impediments oplossen:
- Is een kerntaak van de Scrum Master
- Vereist identificeren, prioriteren, onderzoeken, actie, voorkomen
- Soms is escaleren nodig
- Een impediment backlog helpt bij tracking`,
      keyTakeaways: [
        'Impediments zijn obstakels die het team hinderen',
        'Niet alles is een impediment voor de SM',
        'Identificeer, prioriteer, onderzoek, actie, voorkom',
        'Escaleren is geen falen maar effectief werken',
      ],
    },
    {
      id: 'scrum-l8',
      title: 'Events Faciliteren',
      titleNL: 'Events Faciliteren',
      duration: '22:00',
      type: 'video',
      videoUrl: '',
      transcript: `De Scrum Master faciliteert de Scrum events. Maar wat betekent faciliteren?

**Faciliteren vs. Leiden**

Leiden: Je bepaalt de richting en besluiten
Faciliteren: Je helpt het team effectief samen te werken

De facilitator:
- Bewaakt het proces
- Zorgt dat iedereen gehoord wordt
- Houdt de tijd in de gaten
- Neemt geen inhoudelijke beslissingen

**Sprint Planning Faciliteren**

Voorbereiding:
- Product Backlog is refined
- Capacity van het team bekend
- Ruimte geboekt

Tijdens:
- PO presenteert prioriteiten
- Team stelt vragen
- Gezamenlijk Sprint Goal formuleren
- Team selecteert items en plant taken

Tips:
- Zorg dat PO en team in dialoog zijn
- Help bij het formuleren van een goed Sprint Goal
- Voorkom dat het een "committeren aan alles" wordt
- Houd de timebox

**Daily Scrum Faciliteren**

Let op: De Daily Scrum is van de Developers, niet van de SM!

De SM:
- Zorgt dat het event plaatsvindt
- Helpt bij problemen met het format
- Houdt anderen buiten die willen "checken"
- Is aanwezig als service, niet als leider

Tips:
- Laat het team het format kiezen
- Houd het bij 15 minuten
- Stimuleer focus op Sprint Goal
- Parkeer discussies voor na de Daily

**Sprint Review Faciliteren**

Voorbereiding:
- Stakeholders uitnodigen (PO)
- Increment demonstreerbaar
- Feedback mechanisme klaar

Tijdens:
- PO opent en sluit
- Team demonstreert
- Stakeholders geven feedback
- PO bespreekt Product Backlog impact

Tips:
- Het is een werkssessie, geen presentatie
- Stimuleer interactie
- Noteer feedback
- Houd het constructief

**Sprint Retrospective Faciliteren**

Voorbereiding:
- Format kiezen
- Veilige omgeving creëren
- Data verzamelen (velocity, incidents, etc.)

Tijdens:
- Check-in om de sfeer te peilen
- Wat ging goed? Wat kan beter?
- Concrete acties definiëren
- Check-out

Tips:
- Varieer formats om het fris te houden
- Zorg voor psychologische veiligheid
- Focus op verbeteringen, niet blame
- Beperk acties tot haalbaar aantal

**Algemene Facilitatietips**

**Timebox bewaken:**
- Gebruik een timer
- Waarschuw 5 minuten voor einde
- Wees strikt maar vriendelijk

**Iedereen betrekken:**
- Stil personen direct aanspreken
- Round-robin waar nodig
- Dominante sprekers vriendelijk begrenzen

**Focus houden:**
- Parking lot voor off-topic items
- Terug naar het doel brengen
- Samenvatten en bevestigen

**Energie managen:**
- Pauzes inlassen bij lange events
- Energizers gebruiken
- Eindig op een positieve noot

**Samenvatting**

Events faciliteren:
- Is proces begeleiden, niet inhoud bepalen
- Vereist voorbereiding
- Vraagt om timemanagement en betrekken van iedereen
- Elk event heeft zijn eigen dynamiek`,
      keyTakeaways: [
        'Faciliteren is het team helpen effectief samen te werken',
        'De facilitator bepaalt geen inhoud maar bewaakt het proces',
        'Elk Scrum event heeft zijn eigen facilitatie-aanpak',
        'Timebox, betrokkenheid en focus zijn key',
      ],
      resources: [
        {
          name: 'Facilitatie Toolkit',
          type: 'PDF',
          size: '2.1 MB',
          description: 'Templates en technieken voor event facilitatie',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 3: SCRUM IN DE PRAKTIJK
// ============================================
const module3: Module = {
  id: 'scrum-m3',
  title: 'Module 3: Scrum in de Praktijk',
  titleNL: 'Module 3: Scrum in de Praktijk',
  description: 'Practical application of Scrum: metrics, scaling, and common challenges.',
  descriptionNL: 'Praktische toepassing van Scrum: metrics, scaling en veelvoorkomende uitdagingen.',
  lessons: [
    {
      id: 'scrum-l9',
      title: 'Scrum Metrics & Voorspelbaarheid',
      titleNL: 'Scrum Metrics & Voorspelbaarheid',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      transcript: `Hoe meet je de performance van een Scrum team? En hoe gebruik je metrics 
om voorspelbaarheid te verbeteren?

**Velocity**

Velocity = de hoeveelheid werk (in story points) die het team gemiddeld per Sprint afrondt.

Gebruik:
- Forecasting hoeveel werk in toekomstige Sprints past
- Trends over tijd monitoren
- NIET voor vergelijking tussen teams

Belangrijk:
- Velocity is geen productiviteitsmeting
- Gamificatie vermijden
- Focus op stabiliteit, niet maximalisatie

**Burndown Chart**

Visualiseert hoeveel werk nog resteert in de Sprint.

X-as: Dagen in de Sprint
Y-as: Remaining work (story points of taken)

Ideale lijn: Gelijkmatige afname naar nul

Patronen herkennen:
- Vlakke lijn: Werk wordt niet afgerond
- Stijgende lijn: Scope toegevoegd
- Steile daling aan het eind: Te laat testen

**Burnup Chart**

Toont hoeveel werk is afgerond vs. totale scope.

Voordeel t.o.v. burndown: Scope changes zijn zichtbaar.

**Sprint Goal Success Rate**

Percentage van Sprints waarin het Sprint Goal werd bereikt.

Target: 80%+ is gezond

Lage rate duidt op:
- Te veel scope in Sprint
- Te veel onderbrekingen
- Onduidelijke Sprint Goals

**Cycle Time / Lead Time**

Cycle Time: Tijd van start werk tot done
Lead Time: Tijd van backlog tot done

Kortere cycle time = snellere feedback = meer agility.

**Cumulative Flow Diagram**

Visualiseert work in progress over tijd.

Toont:
- Bottlenecks (waar hoopt werk zich op?)
- WIP trends
- Throughput

**Anti-patterns in Metrics**

- Velocity als KPI voor management → gaming
- Vergelijken van teams → valse competitie
- Alleen focussen op snelheid → kwaliteit lijdt
- Te veel metrics → analysis paralysis

**Samenvatting**

Goede metrics:
- Helpen het team verbeteren
- Worden niet gebruikt om af te straffen
- Focus op trends, niet absolute waarden
- Ondersteunen voorspelbaarheid`,
      keyTakeaways: [
        'Velocity is voor forecasting, niet voor vergelijking tussen teams',
        'Burndown/burnup charts visualiseren voortgang',
        'Sprint Goal Success Rate meet voorspelbaarheid',
        'Metrics zijn voor het team, niet om te controleren',
      ],
    },
    {
      id: 'scrum-l10',
      title: 'Veelvoorkomende Uitdagingen',
      titleNL: 'Veelvoorkomende Uitdagingen',
      duration: '20:00',
      type: 'video',
      videoUrl: '',
      transcript: `Elk Scrum team komt uitdagingen tegen. Hier zijn de meest voorkomende 
en hoe je ermee omgaat.

**Uitdaging 1: Onvolledige Product Backlog**

Symptomen:
- Sprint Planning duurt te lang
- Items zijn te groot of onduidelijk
- Team kan niet inschatten

Oplossingen:
- Reguliere refinement sessies
- Definition of Ready introduceren
- PO coachen op backlog management

**Uitdaging 2: Geen echte Sprint Goal**

Symptomen:
- Sprint Goal is "alle items afronden"
- Geen focus of richting
- Items zijn losgekoppeld

Oplossingen:
- Vraag: "Waarom deze Sprint waardevol?"
- Sprint Goal eerst, items daarna
- PO helpen met productvisie

**Uitdaging 3: Te veel WIP**

Symptomen:
- Veel items gestart, weinig afgerond
- Lange cycle times
- Veel context switching

Oplossingen:
- WIP limits introduceren
- "Stop starting, start finishing"
- Swarming op items stimuleren

**Uitdaging 4: Daily Scrum is status meeting**

Symptomen:
- Iedereen praat tegen de SM
- Geen interactie tussen developers
- Problemen worden niet besproken

Oplossingen:
- SM stapt terug
- Focus op Sprint Goal
- Ander format proberen

**Uitdaging 5: Retrospective zonder resultaat**

Symptomen:
- Dezelfde issues elke Sprint
- Geen verbeteracties
- Team is cynisch geworden

Oplossingen:
- Beperk tot 1-2 acties
- Follow-up in volgende retro
- Vier verbeteringen die wel werken

**Uitdaging 6: Stakeholder engagement**

Symptomen:
- Niemand komt naar Sprint Review
- Geen feedback van gebruikers
- PO als enige stakeholder

Oplossingen:
- Review interessant maken (demo, niet presentatie)
- Stakeholders actief uitnodigen
- Laat impact van feedback zien

**Uitdaging 7: Technical debt groeit**

Symptomen:
- Velocity daalt over tijd
- Bugs nemen toe
- Team is gefrustreerd

Oplossingen:
- Tech debt in Definition of Done
- % capaciteit voor tech debt
- Visualiseer tech debt voor PO

**Uitdaging 8: Team is niet self-managing**

Symptomen:
- SM moet alles regelen
- Wachten op instructies
- Geen eigenaarschap

Oplossingen:
- SM stapt bewust terug
- Team beslissingen laten nemen
- Fouten toestaan (leren)

**Samenvatting**

Bij uitdagingen:
- Identificeer de root cause
- Gebruik de retrospective
- Experimenteer met oplossingen
- Wees geduldig, verandering kost tijd`,
      keyTakeaways: [
        'Veel uitdagingen zijn symptomen van diepere problemen',
        'Refinement lost veel planning problemen op',
        'Self-management vereist dat de SM terugstapt',
        'Experimenteer en leer, perfectie bestaat niet',
      ],
    },
    {
      id: 'scrum-l11',
      title: 'Quiz: Scrum Master Rol & Praktijk',
      titleNL: 'Quiz: Scrum Master Rol & Praktijk',
      duration: '15:00',
      type: 'quiz',
      quiz: [
        {
          id: 'scrum-q6',
          question: 'Wat is de belangrijkste taak van de Scrum Master?',
          options: [
            'Het team managen',
            'De Product Backlog beheren',
            'Het team helpen effectief te werken',
            'De Sprint Planning leiden'
          ],
          correctAnswer: 2,
          explanation: 'De Scrum Master is een servant-leader die het team helpt effectief te werken.',
        },
        {
          id: 'scrum-q7',
          question: 'Wat is velocity?',
          options: [
            'De snelheid waarmee het team werkt',
            'De hoeveelheid werk die het team gemiddeld per Sprint afrondt',
            'Het aantal uren dat het team per Sprint werkt',
            'De productiviteit van individuele teamleden'
          ],
          correctAnswer: 1,
          explanation: 'Velocity is de hoeveelheid werk (in story points) die het team gemiddeld per Sprint afrondt.',
        },
        {
          id: 'scrum-q8',
          question: 'Wie faciliteert de Sprint Retrospective?',
          options: ['Product Owner', 'Management', 'Scrum Master', 'Senior Developer'],
          correctAnswer: 2,
          explanation: 'De Scrum Master faciliteert de Sprint Retrospective.',
        },
        {
          id: 'scrum-q9',
          question: 'Wat moet je NIET doen met velocity?',
          options: [
            'Forecasting voor toekomstige Sprints',
            'Trends over tijd monitoren',
            'Teams met elkaar vergelijken',
            'Stabiliteit meten'
          ],
          correctAnswer: 2,
          explanation: 'Velocity moet niet worden gebruikt om teams met elkaar te vergelijken.',
        },
        {
          id: 'scrum-q10',
          question: 'Wat is een impediment?',
          options: [
            'Een taak die moet worden gedaan',
            'Een obstakel dat het team hindert',
            'Een bug in de software',
            'Een meeting die te lang duurt'
          ],
          correctAnswer: 1,
          explanation: 'Een impediment is een obstakel dat het team hindert in het leveren van waarde.',
        },
      ],
    },
    {
      id: 'scrum-l12',
      title: 'Eindexamen',
      titleNL: 'Eindexamen',
      duration: '45:00',
      type: 'exam',
      videoUrl: '',
      transcript: `Dit is het eindexamen van de Scrum Master cursus.

**Examen Informatie:**
- 40 multiple choice vragen
- 60 minuten tijd
- 70% score nodig om te slagen

**Onderwerpen:**
- Scrum Fundamenten (pijlers, waarden, framework)
- Scrum Rollen (PO, SM, Developers)
- Scrum Events (Sprint, Planning, Daily, Review, Retro)
- Scrum Artefacten (Product Backlog, Sprint Backlog, Increment)
- De Scrum Master Rol (servant leadership, facilitatie, coaching)
- Scrum in de Praktijk (metrics, uitdagingen)

**Tip:** Denk altijd: "Wat zegt de Scrum Guide?"

Succes!`,
    },
    {
      id: 'scrum-l13',
      title: 'Certificaat',
      titleNL: 'Certificaat',
      duration: '5:00',
      type: 'certificate',
      videoUrl: '',
      transcript: `Gefeliciteerd met het afronden van de Scrum Master cursus!

**Je Certificaat**

Je ontvangt een certificaat dat bevestigt:
- Cursus: Scrum Master Certified
- Duur: 14 uur
- Onderwerpen: Scrum Framework, Events, Rollen, Artefacten, SM Rol
- Datum van afronding

**Vervolgstappen**

1. **PSM I Examen**: Overweeg het officiële Professional Scrum Master I examen van Scrum.org
2. **Praktijk**: Pas toe wat je hebt geleerd
3. **Community**: Word lid van Agile/Scrum communities
4. **Verdieping**: PSM II, Product Owner, Agile Coach

Veel succes als Scrum Master!`,
    },
  ],
};

// ============================================
// EXPORT MODULES
// ============================================
export const scrumModules: Module[] = [
  module1,
  module2,
  module3,
];

// ============================================
// COURSE DEFINITION
// ============================================
export const scrumCourse: Course = {
  id: 'scrum-master',
  title: 'Scrum Master Certified',
  titleNL: 'Scrum Master Certified',
  description: 'Become an effective Scrum Master. Master the Scrum Guide and lead teams to high performance through servant leadership and facilitation.',
  descriptionNL: 'Word een effectieve Scrum Master. Beheers de Scrum Guide en leid teams naar high performance door servant leadership en facilitatie.',
  icon: RefreshCw,
  color: BRAND.green,
  gradient: `linear-gradient(135deg, ${BRAND.green}, #047857)`,
  category: 'agile',
  methodology: 'scrum',
  levels: 3,
  modules: scrumModules.reduce((total, m) => total + m.lessons.length, 0),
  duration: 14,
  rating: 4.9,
  students: 15678,
  tags: ['Scrum', 'Agile', 'Sprint', 'Product Owner', 'Retrospective', 'Servant Leadership'],
  tagsNL: ['Scrum', 'Agile', 'Sprint', 'Product Owner', 'Retrospective', 'Servant Leadership'],
  instructor: instructors.lisa,
  featured: true,
  bestseller: true,
  new: true,
  freeForCustomers: true,
  certificate: true,
  whatYouLearn: [
    'The Scrum Guide: pillars, values, and framework',
    'All Scrum events and how to facilitate them effectively',
    'The three accountabilities: PO, SM, Developers',
    'Servant leadership and coaching techniques',
    'How to remove impediments and protect the team',
    'Scrum metrics and predictability',
    'Prepare for PSM I certification',
  ],
  whatYouLearnNL: [
    'De Scrum Guide: pijlers, waarden en framework',
    'Alle Scrum events en hoe ze effectief te faciliteren',
    'De drie accountabilities: PO, SM, Developers',
    'Servant leadership en coaching technieken',
    'Hoe impediments op te lossen en het team te beschermen',
    'Scrum metrics en voorspelbaarheid',
    'Voorbereiden op PSM I certificering',
  ],
  requirements: [
    'No prior Scrum knowledge required',
    'Interest in teamwork and collaboration',
    'Willingness to experiment and learn',
  ],
  requirementsNL: [
    'Geen voorkennis van Scrum vereist',
    'Interesse in teamwork en samenwerking',
    'Bereidheid om te experimenteren en te leren',
  ],
  targetAudience: [
    'Aspiring Scrum Masters',
    'Project managers wanting to learn Agile',
    'Team members wanting to understand Scrum better',
    'Managers implementing Scrum in their organization',
  ],
  targetAudienceNL: [
    'Aspirant Scrum Masters',
    'Projectmanagers die Agile willen leren',
    'Teamleden die Scrum beter willen begrijpen',
    'Managers die Scrum willen implementeren',
  ],
  courseModules: scrumModules,
};

export default scrumCourse;