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
  order: 0,
  id: 'scrum-m1',
  title: 'Module 1: Scrum Fundamentals',
  titleNL: 'Module 1: Scrum Fundamenten',
  description: 'The foundation: empiricism, values, pillars, and the framework.',
  descriptionNL: 'De basis van Scrum: geschiedenis, waarden, principes en het framework.',
  lessons: [
    {
      id: 'scrum-l1',
      title: 'The Origin and Essence of Scrum',
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
- Impediments en risico\'s

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
        'Scrum is based on empiricism: learning through experience',
        'Three pillars: transparency, inspection, adaptation',
        'Five values: commitment, focus, openness, respect, courage',
        'Scrum is a framework, not a complete methodology',
      ],
      keyTakeawaysNL: [
        'Scrum is gebaseerd op empirisme: leren door ervaring',
        'Drie pijlers: transparantie, inspectie, adaptatie',
        'Vijf waarden: commitment, focus, openness, respect, courage',
        'Scrum is een framework, geen complete methodologie',
      ],
      keyTakeawaysEN: [
        'Scrum is based on empiricism: learning through experience',
        'Three pillars: transparency, inspection, adaptation',
        'Five values: commitment, focus, openness, respect, courage',
        'Scrum is a framework, not a complete methodology',
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
      title: 'The Scrum Roles (Accountabilities)',
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
product en het werk van de Developers.

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
        'Three accountabilities: Product Owner, Scrum Master, Developers',
        'Product Owner maximizes value and manages the backlog',
        'Scrum Master is servant-leader, coach, and facilitator',
        'Developers are all people who work on the product',
      ],
      keyTakeawaysNL: [
        'Drie accountabilities: Product Owner, Scrum Master, Developers',
        'Product Owner maximaliseert waarde en beheert de backlog',
        'Scrum Master is servant-leader, coach en facilitator',
        'Developers zijn alle mensen die aan het product werken',
      ],
      keyTakeawaysEN: [
        'Three accountabilities: Product Owner, Scrum Master, Developers',
        'The Product Owner maximizes value and manages the backlog',
        'The Scrum Master is a servant-leader, coach, and facilitator',
        'Developers are all people who work on the product',
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
      title: 'The Scrum Events',
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
        'The Sprint is the container for all other events (max 4 weeks)',
        'Sprint Planning defines the Sprint Goal and selects work',
        'Daily Scrum is max 15 min for daily synchronization',
        'Sprint Review showcases the Increment; Retrospective improves the process',
      ],
      keyTakeawaysNL: [
        'De Sprint is de container voor alle andere events (max 4 weken)',
        'Sprint Planning definieert het Sprint Goal en selecteert werk',
        'Daily Scrum is max 15 min voor dagelijkse synchronisatie',
        'Sprint Review toont het Increment; Retrospective verbetert het proces',
      ],
      keyTakeawaysEN: [
        'The Sprint is the container for all other events (max 4 weeks)',
        'Sprint Planning defines the Sprint Goal and selects work',
        'Daily Scrum is max 15 min for daily synchronization',
        'Sprint Review showcases the Increment; Retrospective improves the process',
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
      title: 'The Scrum Artifacts',
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
        'Each artifact has a commitment that provides focus',
        'Product Backlog is ordered and owned by the Product Owner',
        'Sprint Backlog is owned by the Developers and evolves',
        'Definition of Done determines when work is truly "Done"',
      ],
      keyTakeawaysNL: [
        'Elk artefact heeft een commitment dat focus geeft',
        'Product Backlog is geordend en eigendom van de Product Owner',
        'Sprint Backlog is eigendom van de Developers en evolueert',
        'Definition of Done bepaalt wanneer werk echt "Done" is',
      ],
      keyTakeawaysEN: [
        'Each artifact has a commitment that provides focus',
        'The Product Backlog is ordered and owned by the Product Owner',
        'The Sprint Backlog is owned by the Developers and evolves',
        'The Definition of Done determines when work is truly "Done"',
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
      title: 'Quiz: Scrum Fundamentals',
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
          questionEN: 'What are the three pillars of Scrum?',
          optionsEN: [
            'Planning, Execution, Control',
            'Transparency, Inspection, Adaptation',
            'Commitment, Focus, Respect',
            'Sprint, Backlog, Increment'
          ],
          explanationEN: 'The three pillars of empiricism in Scrum are: Transparency, Inspection, and Adaptation.',
        },
        {
          id: 'scrum-q2',
          question: 'Wie is verantwoordelijk voor het maximaliseren van de waarde van het product?',
          options: ['Scrum Master', 'Product Owner', 'Developers', 'Stakeholders'],
          correctAnswer: 1,
          explanation: 'De Product Owner is verantwoordelijk voor het maximaliseren van de waarde van het product.',
          questionEN: 'Who is accountable for maximizing the value of the product?',
          optionsEN: ['Scrum Master', 'Product Owner', 'Developers', 'Stakeholders'],
          explanationEN: 'The Product Owner is accountable for maximizing the value of the product.',
        },
        {
          id: 'scrum-q3',
          question: 'Wat is de maximale lengte van een Sprint?',
          options: ['1 week', '2 weken', '4 weken', '6 weken'],
          correctAnswer: 2,
          explanation: 'Een Sprint is maximaal één maand (4 weken). Kortere Sprints zijn ook mogelijk.',
          questionEN: 'What is the maximum length of a Sprint?',
          optionsEN: ['1 week', '2 weeks', '4 weeks', '6 weeks'],
          explanationEN: 'A Sprint is at most one month (4 weeks). Shorter Sprints are also possible.',
        },
        {
          id: 'scrum-q4',
          question: 'Wat is het commitment van de Product Backlog?',
          options: ['Sprint Goal', 'Definition of Done', 'Product Goal', 'Release Goal'],
          correctAnswer: 2,
          explanation: 'Het Product Goal is het commitment van de Product Backlog.',
          questionEN: 'What is the commitment of the Product Backlog?',
          optionsEN: ['Sprint Goal', 'Definition of Done', 'Product Goal', 'Release Goal'],
          explanationEN: 'The Product Goal is the commitment of the Product Backlog.',
        },
        {
          id: 'scrum-q5',
          question: 'Hoe lang duurt de Daily Scrum maximaal?',
          options: ['30 minuten', '15 minuten', '1 uur', 'Zo lang als nodig'],
          correctAnswer: 1,
          explanation: 'De Daily Scrum is getimeboxed op maximaal 15 minuten.',
          questionEN: 'What is the maximum duration of the Daily Scrum?',
          optionsEN: ['30 minutes', '15 minutes', '1 hour', 'As long as needed'],
          explanationEN: 'The Daily Scrum is timeboxed to a maximum of 15 minutes.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 2: DE ROL VAN DE SCRUM MASTER
// ============================================
const module2: Module = {
  order: 1,
  id: 'scrum-m2',
  title: 'Module 2: The Role of the Scrum Master',
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
        'Servant leadership inverts the traditional pyramid',
        'The SM serves the team, not the other way around',
        'Listening, empathy, and persuasion are core skills',
        'The SM is coach, facilitator, and teacher',
      ],
      keyTakeawaysNL: [
        'Servant leadership draait de traditionele piramide om',
        'De SM dient het team, niet andersom',
        'Luisteren, empathie en overtuigen zijn kernvaardigheden',
        'De SM is coach, facilitator en teacher',
      ],
      keyTakeawaysEN: [
        'Servant leadership inverts the traditional pyramid',
        'The SM serves the team, not the other way around',
        'Listening, empathy, and persuasion are core skills',
        'The SM is a coach, facilitator, and teacher',
      ],
    },
    {
      id: 'scrum-l7',
      title: 'Resolving Impediments',
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
        'Impediments are obstacles that hinder the team',
        'Not everything is an impediment for the SM',
        'Identify, prioritize, investigate, act, prevent',
        'Escalating is not failure but working effectively',
      ],
      keyTakeawaysNL: [
        'Impediments zijn obstakels die het team hinderen',
        'Niet alles is een impediment voor de SM',
        'Identificeer, prioriteer, onderzoek, actie, voorkom',
        'Escaleren is geen falen maar effectief werken',
      ],
      keyTakeawaysEN: [
        'Impediments are obstacles that hinder the team',
        'Not everything is an impediment for the SM',
        'Identify, prioritize, investigate, act, prevent',
        'Escalating is not failure but working effectively',
      ],
    },
    {
      id: 'scrum-l8',
      title: 'Facilitating Events',
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
        'Facilitating is helping the team collaborate effectively',
        'The facilitator does not determine content but safeguards the process',
        'Each Scrum event has its own facilitation approach',
        'Timebox, engagement, and focus are key',
      ],
      keyTakeawaysNL: [
        'Faciliteren is het team helpen effectief samen te werken',
        'De facilitator bepaalt geen inhoud maar bewaakt het proces',
        'Elk Scrum event heeft zijn eigen facilitatie-aanpak',
        'Timebox, betrokkenheid en focus zijn key',
      ],
      keyTakeawaysEN: [
        'Facilitation is helping the team collaborate effectively',
        'The facilitator does not determine content but safeguards the process',
        'Each Scrum event has its own facilitation approach',
        'Timebox, engagement, and focus are key',
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
  order: 2,
  id: 'scrum-m3',
  title: 'Module 3: Scrum in Practice',
  titleNL: 'Module 3: Scrum in de Praktijk',
  description: 'Practical application of Scrum: metrics, scaling, and common challenges.',
  descriptionNL: 'Praktische toepassing van Scrum: metrics, scaling en veelvoorkomende uitdagingen.',
  lessons: [
    {
      id: 'scrum-l9',
      title: 'Scrum Metrics & Predictability',
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
        'Velocity is for forecasting, not for comparing teams',
        'Burndown/burnup charts visualize progress',
        'Sprint Goal Success Rate measures predictability',
        'Metrics are for the team, not for monitoring them',
      ],
      keyTakeawaysNL: [
        'Velocity is voor forecasting, niet voor vergelijking tussen teams',
        'Burndown/burnup charts visualiseren voortgang',
        'Sprint Goal Success Rate meet voorspelbaarheid',
        'Metrics zijn voor het team, niet om te controleren',
      ],
      keyTakeawaysEN: [
        'Velocity is for forecasting, not for comparing teams',
        'Burndown/burnup charts visualize progress',
        'Sprint Goal Success Rate measures predictability',
        'Metrics are for the team, not for controlling them',
      ],
    },
    {
      id: 'scrum-l10',
      title: 'Common Challenges',
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
        'Many challenges are symptoms of deeper problems',
        'Refinement solves many planning problems',
        'Self-management requires the SM to step back',
        'Experiment and learn, perfection does not exist',
      ],
      keyTakeawaysNL: [
        'Veel uitdagingen zijn symptomen van diepere problemen',
        'Refinement lost veel planning problemen op',
        'Self-management vereist dat de SM terugstapt',
        'Experimenteer en leer, perfectie bestaat niet',
      ],
      keyTakeawaysEN: [
        'Many challenges are symptoms of deeper problems',
        'Refinement solves many planning problems',
        'Self-management requires the SM to step back',
        'Experiment and learn, perfection does not exist',
      ],
    },
    {
      id: 'scrum-l11',
      title: 'Quiz: Scrum Master Role & Practice',
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
          questionEN: 'What is the primary responsibility of the Scrum Master?',
          optionsEN: [
            'Managing the team',
            'Managing the Product Backlog',
            'Helping the team work effectively',
            'Leading the Sprint Planning'
          ],
          explanationEN: 'The Scrum Master is a servant-leader who helps the team work effectively.',
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
          questionEN: 'What is velocity?',
          optionsEN: [
            'The speed at which the team works',
            'The amount of work the team completes on average per Sprint',
            'The number of hours the team works per Sprint',
            'The productivity of individual team members'
          ],
          explanationEN: 'Velocity is the amount of work (in story points) the team completes on average per Sprint.',
        },
        {
          id: 'scrum-q8',
          question: 'Wie faciliteert de Sprint Retrospective?',
          options: ['Product Owner', 'Management', 'Scrum Master', 'Senior Developer'],
          correctAnswer: 2,
          explanation: 'De Scrum Master faciliteert de Sprint Retrospective.',
          questionEN: 'Who facilitates the Sprint Retrospective?',
          optionsEN: ['Product Owner', 'Management', 'Scrum Master', 'Senior Developer'],
          explanationEN: 'The Scrum Master facilitates the Sprint Retrospective.',
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
          questionEN: 'What should you NOT do with velocity?',
          optionsEN: [
            'Forecasting for future Sprints',
            'Monitoring trends over time',
            'Comparing teams with each other',
            'Measuring stability'
          ],
          explanationEN: 'Velocity should not be used to compare teams with each other.',
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
          questionEN: 'What is an impediment?',
          optionsEN: [
            'A task that needs to be done',
            'An obstacle that hinders the team',
            'A bug in the software',
            'A meeting that runs too long'
          ],
          explanationEN: 'An impediment is an obstacle that hinders the team in delivering value.',
        },
      ],
    },
    {
      id: 'scrum-l11b',
      title: 'Practical Assignment: Facilitate a Sprint Planning',
      titleNL: 'Praktijkopdracht: Faciliteer een Sprint Planning',
      duration: '60:00',
      type: 'assignment',
      assignment: {
        title: 'Faciliteer een Sprint Planning voor een fictief product',
        description: `In deze opdracht pas je de Scrum Guide 2020 Sprint Planning structuur toe op
een concreet product-scenario. Sprint Planning beantwoordt drie vragen:
(1) Why is this Sprint valuable? (2) What can be Done this Sprint? (3) How will the work be done?

**Het Scenario:**
Je bent Scrum Master bij een team dat werkt aan ConnectFlow — een SaaS-tool voor
projectcommunicatie. Het team bestaat uit 5 Developers, 1 Product Owner (Fatima Youssef),
en jouzelf als Scrum Master. De Sprint-lengte is 2 weken. De teamcapaciteit voor deze Sprint
is 160 story points beschikbaar (op basis van velocity: gemiddeld 38 SP per sprint, 4 Developers
full-time + 1 Developer voor 50%).

**Beschikbaar Product Backlog (na refinement, geprioriteerd):**
| # | Item | Story Points | Prioriteit |
|---|------|-------------|-----------|
| 1 | Als gebruiker wil ik kunnen inloggen via SSO (SAML 2.0) | 13 | Must |
| 2 | Als admin wil ik gebruikersrollen instellen (viewer/editor/admin) | 8 | Must |
| 3 | Als gebruiker wil ik berichten kunnen archiveren | 5 | Should |
| 4 | Als gebruiker wil ik bestanden (max 25 MB) uploaden in een thread | 8 | Should |
| 5 | Als gebruiker wil ik e-mailnotificaties ontvangen bij @mentions | 5 | Should |
| 6 | Als admin wil ik audit-logs exporteren naar CSV | 8 | Could |
| 7 | Als gebruiker wil ik een donkere modus activeren | 3 | Could |
| 8 | Als gebruiker wil ik threads kunnen filteren op label | 5 | Could |
| 9 | Als gebruiker wil ik de app in het Nederlands kunnen gebruiken (i18n) | 13 | Won't |
| 10 | Als admin wil ik SSO-configuratie testen via sandbox | 5 | Won't |

**Jouw Opdracht:**
Lever drie deliverables in die samen de Sprint Planning afronden:

**Deliverable 1 — Sprint Goal (Scrum Guide 2020: "Why is this Sprint valuable?")**
Formuleer één Sprint Goal in één zin. Het Sprint Goal moet:
- Beschrijven welke waarde de Sprint levert voor de gebruiker of het bedrijf
- Concreet genoeg zijn zodat het team weet wanneer de Sprint geslaagd is
- Niet een takenlijst zijn, maar een doel dat cohesie geeft aan de Sprint Backlog

**Deliverable 2 — Sprint Backlog (Scrum Guide 2020: "What can be Done?")**
Selecteer 5–8 Product Backlog-items die het team in deze Sprint aanpakt.
- Motiveer waarom je deze items selecteert (prioriteit, capaciteit, Sprint Goal-coherentie)
- Bereken het totaal van de gekozen story points en vergelijk met de teamcapaciteit

**Deliverable 3 — Definition of Done + How**
- Stel een Definition of Done op met 3–5 criteria die gelden voor elk backlog-item
  (voorbeelden: code review gedaan, unit tests ≥80% coverage, getest in staging)
- Beschrijf kort hoe het team de eerste 2 items technisch wil aanpakken
  (Scrum Guide 2020: "How will the work be done?" — taken die voortvloeien uit de backlog-items)

**Referentie:** Scrum Guide 2020 (Schwaber & Sutherland) — Sprint Planning.`,
        deliverables: [
          'Sprint Goal — één zin, waarde-georiënteerd',
          'Sprint Backlog — 5–8 geselecteerde items met totaal story points en capaciteitsmotivatie',
          'Definition of Done — 3–5 criteria',
          'How-sectie — technische aanpak voor minimaal 2 items',
        ],
        rubric: [
          { criterion: 'Sprint Goal is waarde-georiënteerd, niet een takenlijst', points: 25 },
          { criterion: 'Sprint Backlog-selectie sluit aan bij Sprint Goal en teamcapaciteit', points: 25 },
          { criterion: 'Definition of Done is concreet en toepasbaar op alle items', points: 20 },
          { criterion: 'How-sectie beschrijft tastbare taken die voortvloeien uit backlog-items', points: 20 },
          { criterion: 'Correcte verwijzing naar Scrum Guide 2020 terminologie (Developers, accountabilities)', points: 10 },
        ],
      },
    },
    {
      id: 'scrum-l12',
      title: 'Final Exam',
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
      quiz: [
        {
          id: 'scrum-exam-q1',
          question: 'Which three pillars uphold empiricism in Scrum?',
          questionNL: 'Welke drie pijlers ondersteunen empirisme in Scrum?',
          options: [
            'Planning, Execution, Review',
            'Transparency, Inspection, Adaptation',
            'Commitment, Focus, Openness',
            'Vision, Value, Velocity'
          ],
          optionsNL: [
            'Planning, Uitvoering, Review',
            'Transparantie, Inspectie, Adaptatie',
            'Commitment, Focus, Openheid',
            'Visie, Waarde, Snelheid'
          ],
          correctAnswer: 1,
          explanation: 'The Scrum Guide 2020 explicitly names Transparency, Inspection, and Adaptation as the three pillars of empiricism on which Scrum is founded.',
          explanationNL: 'De Scrum Guide 2020 noemt expliciet Transparantie, Inspectie en Adaptatie als de drie pijlers van empirisme waarop Scrum is gebaseerd.',
        },
        {
          id: 'scrum-exam-q2',
          question: 'What are the five Scrum Values?',
          questionNL: 'Wat zijn de vijf Scrum Waarden?',
          options: [
            'Collaboration, Communication, Courage, Creativity, Commitment',
            'Commitment, Focus, Openness, Respect, Courage',
            'Transparency, Inspection, Adaptation, Trust, Respect',
            'Integrity, Focus, Openness, Respect, Courage'
          ],
          optionsNL: [
            'Samenwerking, Communicatie, Moed, Creativiteit, Commitment',
            'Commitment, Focus, Openheid, Respect, Moed',
            'Transparantie, Inspectie, Adaptatie, Vertrouwen, Respect',
            'Integriteit, Focus, Openheid, Respect, Moed'
          ],
          correctAnswer: 1,
          explanation: 'The Scrum Guide 2020 lists exactly five Scrum Values: Commitment, Focus, Openness, Respect, and Courage. These values give direction to the work and behaviour of the Scrum Team.',
          explanationNL: 'De Scrum Guide 2020 noemt precies vijf Scrum Waarden: Commitment, Focus, Openheid, Respect en Moed. Deze waarden geven richting aan het werk en gedrag van het Scrum Team.',
        },
        {
          id: 'scrum-exam-q3',
          question: 'According to the Scrum Guide 2020, what is the correct term for the people who do the work of the Sprint?',
          questionNL: 'Wat is de correcte term voor de mensen die het werk van de Sprint uitvoeren, volgens de Scrum Guide 2020?',
          options: [
            'Team Members',
            'Development Team',
            'Developers',
            'Sprint Team'
          ],
          optionsNL: [
            'Teamleden',
            'Development Team',
            'Developers',
            'Sprint Team'
          ],
          correctAnswer: 2,
          explanation: 'The Scrum Guide 2020 replaced the term "Development Team" with "Developers" to avoid implying only software work. "Developers" is anyone in the Scrum Team committed to creating any aspect of a usable Increment each Sprint.',
          explanationNL: 'De Scrum Guide 2020 verving de term "Development Team" door "Developers" om te vermijden dat het alleen softwarewerk impliceert. "Developers" zijn iedereen in het Scrum Team die zich committeert aan het creëren van een bruikbaar Increment elke Sprint.',
        },
        {
          id: 'scrum-exam-q4',
          question: 'What is the maximum timebox for the Daily Scrum?',
          questionNL: 'Wat is de maximale timebox voor de Daily Scrum?',
          options: [
            '30 minutes',
            '10 minutes',
            '15 minutes',
            '1 hour'
          ],
          optionsNL: [
            '30 minuten',
            '10 minuten',
            '15 minuten',
            '1 uur'
          ],
          correctAnswer: 2,
          explanation: 'The Scrum Guide 2020 sets the Daily Scrum timebox at 15 minutes. It is held every day of the Sprint and is for the Developers to inspect progress toward the Sprint Goal and adapt the Sprint Backlog.',
          explanationNL: 'De Scrum Guide 2020 stelt de timebox van de Daily Scrum op 15 minuten. Het wordt elke dag van de Sprint gehouden en is voor de Developers om voortgang naar het Sprint Goal te inspecteren en de Sprint Backlog aan te passen.',
        },
        {
          id: 'scrum-exam-q5',
          question: 'For a one-month Sprint, what is the maximum timebox for Sprint Planning?',
          questionNL: 'Voor een Sprint van één maand, wat is de maximale timebox voor Sprint Planning?',
          options: [
            '4 hours',
            '6 hours',
            '8 hours',
            '2 hours'
          ],
          optionsNL: [
            '4 uur',
            '6 uur',
            '8 uur',
            '2 uur'
          ],
          correctAnswer: 2,
          explanation: 'The Scrum Guide 2020 specifies that Sprint Planning is timeboxed to a maximum of 8 hours for a one-month Sprint. For shorter Sprints the event is usually shorter.',
          explanationNL: 'De Scrum Guide 2020 specificeert dat Sprint Planning is timeboxed tot maximaal 8 uur voor een Sprint van één maand. Voor kortere Sprints is het event meestal korter.',
        },
        {
          id: 'scrum-exam-q6',
          question: 'What is the commitment associated with the Product Backlog?',
          questionNL: 'Wat is de commitment die hoort bij de Product Backlog?',
          options: [
            'Sprint Goal',
            'Definition of Done',
            'Product Goal',
            'Release Plan'
          ],
          optionsNL: [
            'Sprint Goal',
            'Definition of Done',
            'Product Goal',
            'Releaseplan'
          ],
          correctAnswer: 2,
          explanation: 'The Scrum Guide 2020 introduced explicit commitments for each artifact. The Product Goal is the commitment for the Product Backlog; the Sprint Goal for the Sprint Backlog; and the Definition of Done for the Increment.',
          explanationNL: 'De Scrum Guide 2020 introduceerde expliciete commitments voor elk artifact. De Product Goal is de commitment voor de Product Backlog; de Sprint Goal voor de Sprint Backlog; en de Definition of Done voor het Increment.',
        },
        {
          id: 'scrum-exam-q7',
          question: 'What is the maximum recommended size of a Scrum Team according to the Scrum Guide 2020?',
          questionNL: 'Wat is de maximaal aanbevolen grootte van een Scrum Team volgens de Scrum Guide 2020?',
          options: [
            '7 people',
            '9 people',
            '10 people',
            '12 people'
          ],
          optionsNL: [
            '7 mensen',
            '9 mensen',
            '10 mensen',
            '12 mensen'
          ],
          correctAnswer: 2,
          explanation: 'The Scrum Guide 2020 states that the Scrum Team should be small enough to remain nimble and large enough to complete significant work within a Sprint, typically 10 or fewer people. The team includes the Product Owner, Scrum Master, and Developers.',
          explanationNL: 'De Scrum Guide 2020 stelt dat het Scrum Team klein genoeg moet zijn om wendbaar te blijven en groot genoeg om significant werk te voltooien binnen een Sprint, typisch 10 of minder mensen. Het team omvat de Product Owner, Scrum Master en Developers.',
        },
        {
          id: 'scrum-exam-q8',
          question: 'Which statement about the Sprint is correct according to the Scrum Guide 2020?',
          questionNL: 'Welke uitspraak over de Sprint is correct volgens de Scrum Guide 2020?',
          options: [
            'Sprints can be extended if the team needs more time to complete the Sprint Backlog',
            'The Sprint is a container for all other Scrum events',
            'A new Sprint starts after a mandatory rest period following the Sprint Review',
            'The Sprint duration can change during the project to accommodate scope changes'
          ],
          optionsNL: [
            'Sprints kunnen worden verlengd als het team meer tijd nodig heeft om de Sprint Backlog te voltooien',
            'De Sprint is een container voor alle andere Scrum events',
            'Een nieuwe Sprint begint na een verplichte rustperiode na de Sprint Review',
            'De Sprintduur kan veranderen tijdens het project om scope-wijzigingen op te vangen'
          ],
          correctAnswer: 1,
          explanation: 'The Scrum Guide 2020 describes the Sprint as a container for all other events. A new Sprint starts immediately after the conclusion of the previous Sprint. Sprints cannot be extended; if the Sprint Goal becomes obsolete, the Sprint may be cancelled.',
          explanationNL: 'De Scrum Guide 2020 beschrijft de Sprint als een container voor alle andere events. Een nieuwe Sprint begint onmiddellijk na de conclusie van de vorige Sprint. Sprints kunnen niet worden verlengd; als de Sprint Goal achterhaald wordt, kan de Sprint worden geannuleerd.',
        },
        {
          id: 'scrum-exam-q9',
          question: 'Who is accountable for cancelling a Sprint?',
          questionNL: 'Wie is verantwoordelijk voor het annuleren van een Sprint?',
          options: [
            'The Scrum Master',
            'The Developers',
            'The Product Owner',
            'Any Scrum Team member'
          ],
          optionsNL: [
            'De Scrum Master',
            'De Developers',
            'De Product Owner',
            'Elk Scrum Team lid'
          ],
          correctAnswer: 2,
          explanation: 'According to the Scrum Guide 2020, only the Product Owner has the authority to cancel a Sprint, and only if the Sprint Goal becomes obsolete. This is a rare occurrence.',
          explanationNL: 'Volgens de Scrum Guide 2020 heeft alleen de Product Owner de bevoegdheid om een Sprint te annuleren, en alleen als de Sprint Goal achterhaald wordt. Dit is een zeldzame gebeurtenis.',
        },
        {
          id: 'scrum-exam-q10',
          question: 'What does the Scrum Guide 2020 say about the structure of the Daily Scrum?',
          questionNL: 'Wat zegt de Scrum Guide 2020 over de structuur van de Daily Scrum?',
          options: [
            'Each Developer must answer three fixed questions: What did I do yesterday, what will I do today, any impediments?',
            'The Scrum Master must facilitate and take notes during the Daily Scrum',
            'The Developers can choose their own structure and techniques as long as the event focuses on progress toward the Sprint Goal',
            'The Daily Scrum must be held at the same time and place but the format is up to the Product Owner'
          ],
          optionsNL: [
            'Elke Developer moet drie vaste vragen beantwoorden: Wat deed ik gisteren, wat doe ik vandaag, zijn er obstakels?',
            'De Scrum Master moet faciliteren en notities maken tijdens de Daily Scrum',
            'De Developers kunnen hun eigen structuur en technieken kiezen zolang het event gericht is op voortgang naar de Sprint Goal',
            'De Daily Scrum moet op dezelfde tijd en plaats worden gehouden maar het format is aan de Product Owner'
          ],
          correctAnswer: 2,
          explanation: 'The Scrum Guide 2020 removed the mandatory three-question format. The Developers can use any structure they prefer. The event is for the Developers and is focused on progress toward the Sprint Goal and adapting the Sprint Backlog.',
          explanationNL: 'De Scrum Guide 2020 verwijderde het verplichte drie-vragenformaat. De Developers kunnen elke structuur gebruiken die ze prefereren. Het event is voor de Developers en is gericht op voortgang naar de Sprint Goal en het aanpassen van de Sprint Backlog.',
        },
        {
          id: 'scrum-exam-q11',
          question: 'What is the commitment associated with the Sprint Backlog?',
          questionNL: 'Wat is de commitment die hoort bij de Sprint Backlog?',
          options: [
            'Product Goal',
            'Definition of Done',
            'Sprint Goal',
            'Increment Target'
          ],
          optionsNL: [
            'Product Goal',
            'Definition of Done',
            'Sprint Goal',
            'Increment Doel'
          ],
          correctAnswer: 2,
          explanation: 'According to the Scrum Guide 2020, the Sprint Goal is the commitment for the Sprint Backlog. The Sprint Goal is created during Sprint Planning and provides focus and flexibility to the Developers.',
          explanationNL: 'Volgens de Scrum Guide 2020 is de Sprint Goal de commitment voor de Sprint Backlog. De Sprint Goal wordt gemaakt tijdens Sprint Planning en biedt focus en flexibiliteit aan de Developers.',
        },
        {
          id: 'scrum-exam-q12',
          question: 'Who is accountable for the Product Backlog?',
          questionNL: 'Wie is verantwoordelijk voor de Product Backlog?',
          options: [
            'The Scrum Master',
            'The Developers',
            'The entire Scrum Team collectively',
            'The Product Owner'
          ],
          optionsNL: [
            'De Scrum Master',
            'De Developers',
            'Het gehele Scrum Team gezamenlijk',
            'De Product Owner'
          ],
          correctAnswer: 3,
          explanation: 'The Scrum Guide 2020 assigns the Product Owner as accountable for the Product Backlog, including its content, availability, and ordering. While others may add items, the Product Owner has final accountability.',
          explanationNL: 'De Scrum Guide 2020 wijst de Product Owner aan als verantwoordelijke voor de Product Backlog, inclusief de inhoud, beschikbaarheid en volgorde. Hoewel anderen items kunnen toevoegen, heeft de Product Owner de uiteindelijke verantwoordelijkheid.',
        },
        {
          id: 'scrum-exam-q13',
          question: 'For a one-month Sprint, what is the maximum timebox for the Sprint Retrospective?',
          questionNL: 'Voor een Sprint van één maand, wat is de maximale timebox voor de Sprint Retrospective?',
          options: [
            '2 hours',
            '3 hours',
            '4 hours',
            '1 hour'
          ],
          optionsNL: [
            '2 uur',
            '3 uur',
            '4 uur',
            '1 uur'
          ],
          correctAnswer: 1,
          explanation: 'The Scrum Guide 2020 sets the Sprint Retrospective timebox at 3 hours maximum for a one-month Sprint. It is the last event of the Sprint and focuses on how the team can increase quality and effectiveness.',
          explanationNL: 'De Scrum Guide 2020 stelt de timebox van de Sprint Retrospective op maximaal 3 uur voor een Sprint van één maand. Het is het laatste event van de Sprint en richt zich op hoe het team kwaliteit en effectiviteit kan vergroten.',
        },
        {
          id: 'scrum-exam-q14',
          question: 'What is the correct definition of an Increment in Scrum?',
          questionNL: 'Wat is de correcte definitie van een Increment in Scrum?',
          options: [
            'Everything completed in the current Sprint only',
            'A concrete stepping stone toward the Product Goal that is additive to all prior Increments and must meet the Definition of Done',
            'Any work item that has been started but not yet delivered',
            'The set of Product Backlog items selected for the current Sprint'
          ],
          optionsNL: [
            'Alles wat is voltooid in de huidige Sprint alleen',
            'Een concrete stapteen naar de Product Goal die additief is aan alle eerdere Increments en moet voldoen aan de Definition of Done',
            'Elk werkitem dat is gestart maar nog niet is opgeleverd',
            'De set van Product Backlog items geselecteerd voor de huidige Sprint'
          ],
          correctAnswer: 1,
          explanation: 'The Scrum Guide 2020 defines the Increment as a concrete stepping stone toward the Product Goal. Each Increment is additive to all prior Increments and thoroughly verified so that all Increments work together. It must meet the Definition of Done to be delivered.',
          explanationNL: 'De Scrum Guide 2020 definieert het Increment als een concrete stapsteen naar de Product Goal. Elk Increment is additief aan alle eerdere Increments en grondig geverifieerd zodat alle Increments samenwerken. Het moet voldoen aan de Definition of Done om te worden opgeleverd.',
        },
        {
          id: 'scrum-exam-q15',
          question: 'What is the primary purpose of the Sprint Review?',
          questionNL: 'Wat is het primaire doel van de Sprint Review?',
          options: [
            'For the Scrum Master to present metrics to stakeholders',
            'To inspect the outcome of the Sprint and determine future adaptations — it is a working session, not a demo',
            'For the Developers to show their technical work to the Product Owner for approval',
            'To formally accept or reject the Increment before it can be released'
          ],
          optionsNL: [
            'Voor de Scrum Master om metrics te presenteren aan stakeholders',
            'Om de uitkomst van de Sprint te inspecteren en toekomstige aanpassingen te bepalen — het is een werksessie, geen demo',
            'Voor de Developers om hun technisch werk te tonen aan de Product Owner ter goedkeuring',
            'Om het Increment formeel te accepteren of af te wijzen voordat het kan worden uitgebracht'
          ],
          correctAnswer: 1,
          explanation: 'The Scrum Guide 2020 describes the Sprint Review as a working session where the Scrum Team and stakeholders inspect the outcome and determine future adaptations. It is explicitly noted that the Sprint Review should not be considered a gate or a formal acceptance ceremony.',
          explanationNL: 'De Scrum Guide 2020 beschrijft de Sprint Review als een werksessie waarbij het Scrum Team en stakeholders de uitkomst inspecteren en toekomstige aanpassingen bepalen. Er wordt expliciet opgemerkt dat de Sprint Review niet als een gate of formele acceptatieprocedure moet worden beschouwd.',
        },
        {
          id: 'scrum-exam-q16',
          question: 'Who is responsible for creating the Definition of Done?',
          questionNL: 'Wie is verantwoordelijk voor het creëren van de Definition of Done?',
          options: [
            'The Product Owner alone',
            'The Scrum Master alone',
            'The Developers alone',
            'The Scrum Team as a whole, or it is adopted from the wider organisation if one exists'
          ],
          optionsNL: [
            'De Product Owner alleen',
            'De Scrum Master alleen',
            'De Developers alleen',
            'Het Scrum Team als geheel, of het wordt overgenomen van de bredere organisatie als er een bestaat'
          ],
          correctAnswer: 3,
          explanation: 'The Scrum Guide 2020 states that if the Definition of Done is not an organisational standard, the Scrum Team must create one appropriate for the product. All Scrum Team members are accountable for upholding the Definition of Done.',
          explanationNL: 'De Scrum Guide 2020 stelt dat als de Definition of Done geen organisatiestandaard is, het Scrum Team er een moet creëren die geschikt is voor het product. Alle Scrum Team leden zijn verantwoordelijk voor het handhaven van de Definition of Done.',
        },
        {
          id: 'scrum-exam-q17',
          question: 'According to the Scrum Guide 2020, what describes the Scrum Team?',
          questionNL: 'Wat beschrijft het Scrum Team volgens de Scrum Guide 2020?',
          options: [
            'A hierarchical team with the Product Owner at the top and Developers at the bottom',
            'A self-managing, cross-functional team with no sub-teams or hierarchies',
            'A team managed by the Scrum Master who assigns work to Developers',
            'A group of independent contractors who report to the Product Owner'
          ],
          optionsNL: [
            'Een hiërarchisch team met de Product Owner aan de top en Developers onderaan',
            'Een zelf-managend, cross-functioneel team zonder subteams of hiërarchieën',
            'Een team beheerd door de Scrum Master die werk toewijst aan Developers',
            'Een groep onafhankelijke aannemers die rapporteren aan de Product Owner'
          ],
          correctAnswer: 1,
          explanation: 'The Scrum Guide 2020 describes the Scrum Team as a cohesive unit of professionals that is self-managing (decides internally who does what, when, and how) and cross-functional (has all the skills necessary to create value each Sprint). There are no sub-teams or hierarchies.',
          explanationNL: 'De Scrum Guide 2020 beschrijft het Scrum Team als een hechte eenheid van professionals die zelf-managend is (intern beslist wie wat doet, wanneer en hoe) en cross-functioneel (alle vaardigheden heeft die nodig zijn om elke Sprint waarde te creëren). Er zijn geen subteams of hiërarchieën.',
        },
        {
          id: 'scrum-exam-q18',
          question: 'Which statement about changes during a Sprint is correct according to the Scrum Guide 2020?',
          questionNL: 'Welke uitspraak over wijzigingen tijdens een Sprint is correct volgens de Scrum Guide 2020?',
          options: [
            'No changes whatsoever are allowed once Sprint Planning is complete',
            'The scope can be renegotiated between the Product Owner and Developers as more is learned, but no changes are made that endanger the Sprint Goal',
            'Only the Scrum Master can approve scope changes during a Sprint',
            'Changes require a formal change request approved by all stakeholders'
          ],
          optionsNL: [
            'Er zijn helemaal geen wijzigingen toegestaan zodra Sprint Planning is voltooid',
            'De scope kan worden heronderhandeld tussen de Product Owner en Developers naarmate meer wordt geleerd, maar er worden geen wijzigingen gemaakt die de Sprint Goal in gevaar brengen',
            'Alleen de Scrum Master kan scope-wijzigingen goedkeuren tijdens een Sprint',
            'Wijzigingen vereisen een formeel wijzigingsverzoek goedgekeurd door alle stakeholders'
          ],
          correctAnswer: 1,
          explanation: 'The Scrum Guide 2020 states that as the Developers learn more during the Sprint, they may renegotiate the scope with the Product Owner. However, no changes should be made that endanger the Sprint Goal — this is a key protection of the Sprint.',
          explanationNL: 'De Scrum Guide 2020 stelt dat naarmate de Developers meer leren tijdens de Sprint, ze de scope kunnen heronderhandelen met de Product Owner. Er mogen echter geen wijzigingen worden gemaakt die de Sprint Goal in gevaar brengen — dit is een sleutelbescherming van de Sprint.',
        },
        {
          id: 'scrum-exam-q19',
          question: 'What is the Scrum Master\'s primary accountability according to the Scrum Guide 2020?',
          questionNL: 'Wat is de primaire verantwoordelijkheid van de Scrum Master volgens de Scrum Guide 2020?',
          options: [
            'Managing the Scrum Team and assigning tasks to Developers',
            'Establishing Scrum as defined in the Scrum Guide by helping everyone understand Scrum theory and practice',
            'Reporting Sprint progress to senior management',
            'Approving the Sprint Backlog before the Sprint begins'
          ],
          optionsNL: [
            'Het Scrum Team beheren en taken toewijzen aan Developers',
            'Scrum vestigen zoals gedefinieerd in de Scrum Guide door iedereen te helpen Scrum theorie en praktijk te begrijpen',
            'Sprint voortgang rapporteren aan senior management',
            'De Sprint Backlog goedkeuren voordat de Sprint begint'
          ],
          correctAnswer: 1,
          explanation: 'The Scrum Guide 2020 defines the Scrum Master as accountable for establishing Scrum as defined in the Scrum Guide. The Scrum Master is a true leader who serves the Scrum Team and the wider organisation, not a manager who assigns work.',
          explanationNL: 'De Scrum Guide 2020 definieert de Scrum Master als verantwoordelijk voor het vestigen van Scrum zoals gedefinieerd in de Scrum Guide. De Scrum Master is een echte leider die het Scrum Team en de bredere organisatie dient, niet een manager die werk toewijst.',
        },
        {
          id: 'scrum-exam-q20',
          question: 'For a one-month Sprint, what is the maximum timebox for the Sprint Review?',
          questionNL: 'Voor een Sprint van één maand, wat is de maximale timebox voor de Sprint Review?',
          options: [
            '2 hours',
            '3 hours',
            '4 hours',
            '8 hours'
          ],
          optionsNL: [
            '2 uur',
            '3 uur',
            '4 uur',
            '8 uur'
          ],
          correctAnswer: 2,
          explanation: 'The Scrum Guide 2020 timeboxes the Sprint Review to a maximum of 4 hours for a one-month Sprint. For shorter Sprints the event is usually shorter.',
          explanationNL: 'De Scrum Guide 2020 stelt de timebox van de Sprint Review op maximaal 4 uur voor een Sprint van één maand. Voor kortere Sprints is het event meestal korter.',
        },
        {
          id: 'scrum-exam-q21',
          question: 'What does the Scrum Guide 2020 say about multiple Increments in a single Sprint?',
          questionNL: 'Wat zegt de Scrum Guide 2020 over meerdere Increments in één Sprint?',
          options: [
            'Only one Increment per Sprint is allowed to maintain predictability',
            'Multiple Increments may be created within a Sprint and may be delivered to stakeholders before the Sprint ends',
            'Multiple Increments require separate Sprint Goals',
            'Additional Increments must be approved by the Product Owner in writing'
          ],
          optionsNL: [
            'Slechts één Increment per Sprint is toegestaan om voorspelbaarheid te behouden',
            'Meerdere Increments kunnen worden gecreëerd binnen een Sprint en kunnen worden geleverd aan stakeholders voordat de Sprint eindigt',
            'Meerdere Increments vereisen afzonderlijke Sprint Goals',
            'Extra Increments moeten schriftelijk worden goedgekeurd door de Product Owner'
          ],
          correctAnswer: 1,
          explanation: 'The Scrum Guide 2020 explicitly states that multiple Increments may be created within a Sprint. The sum of the Increments is presented at the Sprint Review and may be delivered to stakeholders prior to the end of the Sprint.',
          explanationNL: 'De Scrum Guide 2020 stelt expliciet dat meerdere Increments kunnen worden gecreëerd binnen een Sprint. De som van de Increments wordt gepresenteerd bij de Sprint Review en kan worden geleverd aan stakeholders vóór het einde van de Sprint.',
        },
        {
          id: 'scrum-exam-q22',
          question: 'Which of the following best describes Lean thinking as applied in Scrum?',
          questionNL: 'Welke van de volgende beschrijvingen past het beste bij Lean thinking zoals toegepast in Scrum?',
          options: [
            'Maximising the work done by the team to increase output',
            'Reducing waste and focusing on essentials to improve the flow of value',
            'Following a strict process to eliminate variability',
            'Centralising decision-making to avoid unnecessary collaboration'
          ],
          optionsNL: [
            'Het maximaliseren van het werk dat door het team wordt gedaan om de output te verhogen',
            'Verspilling verminderen en focussen op essentiëles om de stroom van waarde te verbeteren',
            'Een strikt proces volgen om variabiliteit te elimineren',
            'Besluitvorming centraliseren om onnodige samenwerking te vermijden'
          ],
          correctAnswer: 1,
          explanation: 'The Scrum Guide 2020 states that Scrum is founded on empiricism and Lean thinking. Lean thinking reduces waste and focuses on essentials. Together with empiricism, this forms the foundation for the Scrum approach to complex problems.',
          explanationNL: 'De Scrum Guide 2020 stelt dat Scrum is gebaseerd op empirisme en Lean thinking. Lean thinking vermindert verspilling en richt zich op essentiëles. Samen met empirisme vormt dit de basis voor de Scrum-aanpak van complexe problemen.',
        },
      ],
    },
    {
      id: 'scrum-l13',
      title: 'Certificate',
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