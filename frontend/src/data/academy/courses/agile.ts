// ============================================
// COURSE: AGILE FUNDAMENTALS
// ============================================
// The mindset and principles behind Agile
// ============================================

import { Zap } from 'lucide-react';
import { Course, Module } from '../types';
import { BRAND } from '../brand';
import { instructors } from '../instructors';

// ============================================
// MODULE 1: DE AGILE MINDSET
// ============================================
const module1: Module = {
  id: 'ag-m1',
  title: 'Module 1: The Agile Mindset',
  titleNL: 'Module 1: De Agile Mindset',
  description: 'The foundation: values, principles, and the fundamental mindshift.',
  descriptionNL: 'Het fundament: waarden, principes en de mindset achter Agile.',
  lessons: [
    {
      id: 'ag-l1',
      title: 'The Agile Manifesto',
      titleNL: 'Het Agile Manifesto',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      transcript: `Welkom bij de Agile Fundamentals cursus! We beginnen bij het begin: 
het Agile Manifesto. Dit document uit 2001 veranderde hoe de wereld denkt over werk.

**De Oorsprong**

Februari 2001. Zeventien software ontwikkelaars kwamen samen in Snowbird, Utah. 
Ze waren gefrustreerd met de bureaucratie en inflexibiliteit van traditionele 
software development methoden.

Na drie dagen discussie produceerden ze het Agile Manifesto - een document van 
slechts 68 woorden dat een revolutie zou ontketenen.

**De Vier Waarden**

Het Manifesto stelt:

"We ontdekken betere manieren om software te ontwikkelen door het te doen en 
anderen daarbij te helpen. Hierbij zijn we gaan waarderen:

**Mensen en hun onderlinge interactie** boven processen en hulpmiddelen
**Werkende software** boven allesomvattende documentatie
**Samenwerking met de klant** boven contractonderhandelingen
**Inspelen op verandering** boven het volgen van een plan

Hoewel wij de zaken aan de rechterkant belangrijk vinden, hechten wij meer 
waarde aan de zaken aan de linkerkant."

Die laatste zin is cruciaal - het gaat om prioritering, niet eliminatie.

**Waarde 1: Mensen boven Processen**

Traditioneel: Het proces is heilig. Volg de stappen.
Agile: Mensen maken het verschil. Geef ze ruimte.

Dit betekent:
- Vertrouw op competente, gemotiveerde mensen
- Pas processen aan, niet mensen
- Faciliteer interactie en samenwerking
- Tools zijn hulpmiddelen, geen doel

In de praktijk:
- Face-to-face communicatie boven emails
- Teamautonomie boven micromanagement
- Flexibele werkwijzen boven rigide procedures

**Waarde 2: Werkende Software boven Documentatie**

Traditioneel: Eerst alles documenteren, dan pas bouwen.
Agile: Lever werkende software, documenteer wat nodig is.

Dit betekent:
- Het product is het bewijs van voortgang
- Documentatie is nuttig, maar niet het doel
- "Working software is the primary measure of progress"
- Just enough documentation

In de praktijk:
- Demo's boven statusrapporten
- Living documentation boven shelfware
- Code als documentatie waar mogelijk

**Waarde 3: Klantcollaboratie boven Contracten**

Traditioneel: Contract definieert de relatie. Scope is vast.
Agile: Continue samenwerking. Samen ontdekken wat nodig is.

Dit betekent:
- Klant is partner, niet tegenstander
- Regelmatige feedback is essentieel
- Samen navigeren door onzekerheid
- Flexibiliteit in wat wordt opgeleverd

In de praktijk:
- Klant in het team betrekken
- Frequente reviews en demo's
- Scope onderhandelen, niet budget/tijd

**Waarde 4: Inspelen op Verandering boven een Plan**

Traditioneel: Wijzigingen zijn afwijkingen. Plan is de wet.
Agile: Verandering is welkom. Omarm het.

Dit betekent:
- Verandering is niet het probleem - rigiditeit wel
- Late verandering kan voordeel geven
- Plannen zijn nuttig, maar aanpasbaar
- Flexibiliteit is een feature, geen bug

In de praktijk:
- Korte planningshorizons
- Rolling wave planning
- Embrace van veranderende requirements

**De Mindset Shift**

Agile vraagt een fundamentele mindshift:

| Van | Naar |
|-----|------|
| Voorspellen | Aanpassen |
| Command & control | Empowerment |
| Falen is slecht | Falen is leren |
| Plannen volgen | Waarde leveren |
| Lokale optimalisatie | Systeemdenken |
| Contract | Vertrouwen |

**Agile is Niet...**

Misverstanden over Agile:

❌ Geen planning
❌ Geen documentatie  
❌ Geen discipline
❌ Chaos en "we zien wel"
❌ Alleen voor software
❌ Een silver bullet

**Agile is Wel...**

✅ Continue planning in korte cycli
✅ Just enough documentatie
✅ Hoge discipline en professionaliteit
✅ Gestructureerde flexibiliteit
✅ Toepasbaar in vele domeinen
✅ Een aanpak die bij de context moet passen

**Samenvatting**

Het Agile Manifesto:
- Definieert vier waarden die prioriteiten stellen
- Gaat over prioritering, niet eliminatie
- Vraagt een mindshift van predictive naar adaptive
- Is universeel toepasbaar, niet alleen software
- Is een fundament, niet een complete methode`,
      keyTakeaways: [
        'Four values: People, Working software, Customer collaboration, Responding to change',
        'It is about prioritization, not elimination of the right-hand side',
        'Agile requires a mindshift from predicting to adapting',
        'The Manifesto is a foundation, not a complete method',
      ],
      keyTakeawaysNL: [
        'Vier waarden: Mensen, Werkende software, Klantcollaboratie, Inspelen op verandering',
        'Het gaat om prioritering, niet eliminatie van de rechterkant',
        'Agile vraagt een mindshift van voorspellen naar aanpassen',
        'Het Manifesto is een fundament, geen complete methode',
      ],
      resources: [
        {
          name: 'Agile Manifesto Poster (NL)',
          type: 'PDF',
          size: '1.4 MB',
          description: 'Het Agile Manifesto in poster formaat',
        },
      ],
    },
    {
      id: 'ag-l2',
      title: 'The 12 Principles',
      titleNL: 'De 12 Principes',
      duration: '25:00',
      type: 'video',
      videoUrl: '',
      transcript: `Achter de vier waarden van het Agile Manifesto liggen twaalf principes. 
Deze principes geven meer richting aan hoe je Agile kunt toepassen.

**De 12 Principes van Agile**

**Principe 1: Klanttevredenheid door waardevolle software**

"Onze hoogste prioriteit is het tevreden stellen van de klant door het vroegtijdig 
en doorlopend opleveren van waardevolle software."

Kernidee:
- Focus op waarde, niet op activiteit
- Lever vroeg en vaak
- Tevreden klanten zijn het doel

In praktijk:
- Prioriteer op klantwaarde
- Release vroeg, release vaak
- Korte feedback loops

**Principe 2: Verwelkom veranderende requirements**

"Verwelkom veranderende requirements, zelfs laat in het ontwikkelproces. 
Agile processen benutten verandering tot concurrentievoordeel van de klant."

Kernidee:
- Verandering is een kans, geen bedreiging
- Late aanpassing kan strategisch voordeel geven
- Flexibiliteit is een feature

In praktijk:
- Geen "change request" bureaucratie
- Regelmatige backlog refinement
- Scope flexibiliteit in contracten

**Principe 3: Lever frequent werkende software**

"Lever frequent werkende software op, met een interval van een paar weken 
tot een paar maanden, met een voorkeur voor kortere intervallen."

Kernidee:
- Kort-cyclisch werken
- Werkende software is de maatstaf
- Frequente feedback

In praktijk:
- Sprints van 1-4 weken
- Definition of Done
- Shippable increments

**Principe 4: Dagelijkse samenwerking**

"Businessmensen en ontwikkelaars moeten dagelijks samenwerken gedurende het project."

Kernidee:
- Break down silos
- Directe communicatie
- Gedeeld begrip

In praktijk:
- Product Owner in het team
- Co-locatie waar mogelijk
- Dagelijkse stand-ups

**Principe 5: Bouw projecten rond gemotiveerde individuen**

"Bouw projecten rond gemotiveerde individuen. Geef ze de omgeving en ondersteuning 
die ze nodig hebben en vertrouw erop dat ze de klus klaren."

Kernidee:
- Vertrouwen in mensen
- Autonomie geven
- Barrières wegnemen

In praktijk:
- Servant leadership
- Self-organizing teams
- Obstakel verwijdering

**Principe 6: Face-to-face communicatie**

"De meest efficiënte en effectieve manier om informatie over te brengen naar 
en binnen een ontwikkelteam is face-to-face gesprek."

Kernidee:
- Directe communicatie is het rijkst
- Minder misverstanden
- Snellere besluitvorming

In praktijk:
- Co-locatie prefereren
- Video boven telefoon boven email
- Whiteboards en fysieke visualisatie

**Principe 7: Werkende software als voortgangsmeting**

"Werkende software is de belangrijkste maatstaf voor voortgang."

Kernidee:
- Niet: "we zijn 80% klaar met coderen"
- Wel: "deze features werken"
- Output boven activiteit

In praktijk:
- Demo's als voortgang
- Definition of Done
- Burn-down naar waarde

**Principe 8: Duurzaam tempo**

"Agile processen bevorderen duurzame ontwikkeling. De opdrachtgevers, ontwikkelaars 
en gebruikers moeten voor onbepaalde tijd een constant tempo kunnen aanhouden."

Kernidee:
- Geen crunch mode
- Sustainable pace
- Lange termijn denken

In praktijk:
- Realistische planning
- No overtime culture
- Slack time voor verbetering

**Principe 9: Continue aandacht voor kwaliteit**

"Continue aandacht voor een hoog technisch niveau en goed ontwerp 
versterkt de wendbaarheid."

Kernidee:
- Technische schuld vertraagt
- Kwaliteit maakt snelheid mogelijk
- Investeer in het fundament

In praktijk:
- Automated testing
- Refactoring
- Technical excellence

**Principe 10: Eenvoud**

"Eenvoud -- de kunst van het maximaliseren van niet gedaan werk -- is essentieel."

Kernidee:
- YAGNI: You Ain't Gonna Need It
- Bouw alleen wat nodig is
- Simpliciteit is moeilijk maar waardevol

In praktijk:
- MVP denken
- Lean approach
- Vraag: "Is dit echt nodig?"

**Principe 11: Zelforganiserende teams**

"De beste architecturen, requirements en ontwerpen komen voort uit zelforganiserende teams."

Kernidee:
- Teams weten het beste hoe
- Autonomie levert creativiteit
- Eigenaarschap motiveert

In praktijk:
- Team beslist hoe
- Collective ownership
- Cross-functional teams

**Principe 12: Regelmatige reflectie**

"Op vaste momenten reflecteert het team op hoe het effectiever kan worden 
en past vervolgens zijn gedrag daarop aan."

Kernidee:
- Continue verbetering
- Leren is ingebouwd
- Aanpassen is normaal

In praktijk:
- Retrospectives
- Experimenten
- Inspect & adapt

**De Principes Toepassen**

De principes zijn geen checklist maar kompas:
- Niet: "Doen we alle 12?"
- Wel: "Hoe helpen deze ons?"

Ze geven richting in moeilijke beslissingen:
- "Past dit bij onze principes?"
- "Wat zou een Agile team doen?"

**Samenvatting**

De 12 principes:
- Concretiseren de 4 waarden
- Geven richting voor implementatie
- Zijn een kompas, geen checklist
- Focussen op waarde, mensen, kwaliteit en leren`,
      keyTakeaways: [
        'The 12 principles concretize the 4 values',
        'Focus on frequent delivery of working software',
        'Build around motivated people with trust',
        'Continuous reflection and improvement is essential',
      ],
      keyTakeawaysNL: [
        'De 12 principes concretiseren de 4 waarden',
        'Focus op frequente levering van werkende software',
        'Bouw rond gemotiveerde mensen met vertrouwen',
        'Continue reflectie en verbetering is essentieel',
      ],
      resources: [
        {
          name: '12 Principes Cheat Sheet',
          type: 'PDF',
          size: '680 KB',
          description: 'Alle principes op één pagina',
        },
      ],
    },
    {
      id: 'ag-l3',
      title: 'Agile vs. Traditional',
      titleNL: 'Agile vs. Traditioneel',
      duration: '20:00',
      type: 'video',
      videoUrl: '',
      transcript: `Om Agile te begrijpen helpt het om te vergelijken met traditionele 
aanpakken. In deze les verkennen we de fundamentele verschillen.

**Het Traditionele Model**

Traditioneel projectmanagement is gebaseerd op:
- Voorspelbaarheid: We kunnen alles vooraf weten
- Sequentieel: Fasen volgen elkaar op
- Plan-driven: Het plan is de waarheid
- Scope-fixed: Wijzigingen zijn afwijkingen

Dit werkt goed als:
- Requirements stabiel en bekend zijn
- De oplossing beproefd is
- De omgeving voorspelbaar is
- Compliance documentatie vereist

**Het Agile Model**

Agile is gebaseerd op:
- Onzekerheid: We ontdekken al doende
- Iteratief: Cycli van bouwen-leren-aanpassen
- Value-driven: Waarde is de waarheid
- Scope-flexible: Verandering is welkom

Dit werkt goed als:
- Requirements onzeker of veranderlijk zijn
- De oplossing nieuw of innovatief is
- De omgeving dynamisch is
- Snelle feedback essentieel is

**Het Stacey Diagram**

Ralph Stacey ontwikkelde een model voor complexiteit:

            Onzekerheid in HOE (technologie)
                    Laag → Hoog
                    
Onzekerheid   Laag   Simpel    | Gecompliceerd
in WAT                         |
(requirements)                 |
              Hoog   Complex   | Chaotisch

**Simpel**: Beide bekend → Waterfall werkt prima
**Gecompliceerd**: Technisch uitdagend → Experts inschakelen
**Complex**: Veel onbekenden → Agile, experimenteren
**Chaotisch**: Crisis → Stabiliseer eerst

**De Cone of Uncertainty**

Bij projectstart is onzekerheid hoog. Naarmate je vordert, krijg je meer zekerheid.

Traditioneel: Beslis alles aan het begin (meeste onzekerheid!)
Agile: Stel beslissingen uit tot je meer weet (less waste)

**Vergelijking in Detail**

| Aspect | Traditioneel | Agile |
|--------|-------------|-------|
| Planning | Upfront, gedetailleerd | Rolling wave, adaptief |
| Scope | Vast | Flexibel |
| Deliverables | Aan het einde | Frequent, incrementeel |
| Klant betrokkenheid | Begin en einde | Continu |
| Verandering | Via change control | Verwelkomd |
| Succes = | Op tijd, budget, scope | Waarde geleverd |
| Risico | Vroeg gepland, laat ontdekt | Vroeg ontdekt, vroeg aangepakt |
| Teams | Functioneel gescheiden | Cross-functional |
| Documentatie | Uitgebreid | Just enough |

**Het Triangle Dilemma**

Traditioneel triangle: Scope - Tijd - Budget (vast)
Kwaliteit is variabel (helaas vaak de sluitpost)

Agile triangle: Tijd - Budget - Kwaliteit (vast)
Scope is variabel (we bouwen de belangrijkste features)

**Risk Profile**

Traditioneel project:
- Laag risico aan het begin (nog niet veel geïnvesteerd)
- Hoog risico aan het einde (alles geïnvesteerd, nog niet gevalideerd)

Agile project:
- Hoger risico aan het begin (we weten minder)
- Risico daalt snel (frequente validatie)

**Wanneer Welke Aanpak?**

**Kies traditioneel als:**
- Requirements zijn stabiel en compleet
- De oplossing is bewezen technologie
- Regulering vereist uitgebreide documentatie
- Klant is niet beschikbaar voor feedback
- Fixed-price contract met vaste scope

**Kies Agile als:**
- Requirements zijn onzeker of veranderlijk
- De oplossing is nieuw of innovatief
- Snelle time-to-market is cruciaal
- Klant kan actief participeren
- Flexibiliteit in scope is mogelijk

**Hybride Aanpakken**

In de praktijk: vaak een mix.

Voorbeelden:
- Agile delivery binnen Waterfall governance
- Waterfall planning met Agile sprints
- Agile voor development, Waterfall voor implementatie

Dit heet soms "Water-Scrum-Fall" of "Wagile".

**Samenvatting**

Agile vs. Traditioneel:
- Traditioneel werkt bij voorspelbaarheid
- Agile werkt bij onzekerheid
- Het Stacey diagram helpt bij de keuze
- Hybride aanpakken zijn vaak de realiteit
- Kies de aanpak die past bij je context`,
      keyTakeaways: [
        'Traditional fits predictable, stable contexts',
        'Agile fits uncertain, changing contexts',
        'The Stacey diagram helps in choosing the approach',
        'Hybrid approaches combine elements of both',
      ],
      keyTakeawaysNL: [
        'Traditioneel past bij voorspelbare, stabiele contexten',
        'Agile past bij onzekere, veranderlijke contexten',
        'Het Stacey diagram helpt bij het kiezen van de aanpak',
        'Hybride aanpakken combineren elementen van beide',
      ],
      resources: [
        {
          name: 'Stacey Matrix Template',
          type: 'PDF',
          size: '520 KB',
          description: 'Template voor project classificatie',
        },
      ],
    },
    {
      id: 'ag-l4',
      title: 'Agile Frameworks Overview',
      titleNL: 'Agile Frameworks Overzicht',
      duration: '22:00',
      type: 'video',
      videoUrl: '',
      transcript: `Het Agile Manifesto biedt waarden en principes, maar geen concrete 
werkwijze. Daarom zijn er diverse frameworks ontwikkeld. In deze les krijg je een overzicht.

**Wat is een Framework?**

Een framework biedt:
- Concrete rollen
- Vaste events/ceremonies
- Gedefinieerde artefacten
- Regels en richtlijnen

Het Manifesto = WHY
Frameworks = HOW

**De Meest Gebruikte Frameworks**

**1. Scrum**
Het meest populaire Agile framework.

Kenmerken:
- Sprints van 1-4 weken
- Rollen: Product Owner, Scrum Master, Developers
- Events: Sprint Planning, Daily, Review, Retrospective
- Artefacten: Product Backlog, Sprint Backlog, Increment

Ideaal voor:
- Product development
- Teams van 3-9 mensen
- Als je structuur en ritme wilt

**2. Kanban**
Evolutionaire aanpak voor flow.

Kenmerken:
- Visualiseer werk
- Beperk WIP
- Manage flow
- Continue verbetering

Ideaal voor:
- Operations en support
- Teams met variabel werk
- Verbetering zonder grote verandering

**3. Extreme Programming (XP)**
Focus op engineering practices.

Kenmerken:
- Pair programming
- Test-driven development
- Continuous integration
- Simple design
- Collective ownership

Ideaal voor:
- Software development teams
- Hoge kwaliteitseisen
- Technische excellentie

**4. Lean Software Development**
Gebaseerd op Lean manufacturing.

Kenmerken:
- Elimineer waste
- Build quality in
- Create knowledge
- Defer commitment
- Deliver fast
- Respect people
- Optimize the whole

Ideaal voor:
- Procesoptimalisatie
- Eliminatie van verspilling
- Systeem-niveau denken

**Scaling Frameworks**

Voor grote organisaties met meerdere teams:

**SAFe (Scaled Agile Framework)**
- Meest gebruikte scaling framework
- Gedefinieerde configuraties (Essential, Large Solution, Portfolio)
- Comprehensive maar complex

**LeSS (Large-Scale Scrum)**
- Scrum opgeschaald
- Simpeler dan SAFe
- Minder prescriptief

**Spotify Model**
- Squads, Tribes, Chapters, Guilds
- Focus op autonomie en alignment
- Niet echt een framework, meer een case study

**Nexus**
- Scrum.org's scaling framework
- 3-9 Scrum teams
- Focus op integratie

**Disciplined Agile (DA)**
- Tool-kit benadering
- Keuzevrijheid
- "Guided continuous improvement"

**Hoe Kies Je?**

Factoren voor de keuze:

1. **Type werk**: Development? Support? Mix?
2. **Team grootte**: Klein? Meerdere teams?
3. **Organisatiecultuur**: Hiërarchisch? Plat?
4. **Huidige situatie**: Greenfield? Bestaande processen?
5. **Doelen**: Voorspelbaarheid? Snelheid? Kwaliteit?

**Framework Combinaties**

Frameworks zijn vaak complementair:

- **Scrum + XP**: Scrum voor management, XP voor engineering
- **Scrum + Kanban (Scrumban)**: Sprints met WIP limieten
- **SAFe + Kanban**: Portfolio management met Kanban

**Het Framework Kiezen vs. Aanpassen**

Start pure:
- Leer het framework zoals bedoeld
- Begrijp waarom regels bestaan
- Pas aan na ervaring

"ShuHaRi" concept:
- Shu: Volg de regels exact
- Ha: Breek de regels bewust
- Ri: Maak je eigen regels

**Geen Framework Nodig?**

Niet elk team heeft een formeel framework nodig.

Als je team:
- Agile principes begrijpt
- Effectief samenwerkt
- Continue verbetert
- Waarde levert

...dan is je "framework" gewoon "hoe wij werken".

**Samenvatting**

Agile frameworks:
- Concretiseren het Manifesto
- Variëren van lichtgewicht (Kanban) tot uitgebreid (SAFe)
- Kunnen gecombineerd worden
- Moeten passen bij je context
- Zijn startpunt, niet eindpunt`,
      keyTakeaways: [
        'Frameworks are the HOW, the Manifesto is the WHY',
        'Scrum, Kanban, XP are the most used team-level frameworks',
        'SAFe, LeSS, Nexus scale to multiple teams',
        'Start pure, adapt after experience (ShuHaRi)',
      ],
      keyTakeawaysNL: [
        'Frameworks zijn de HOW, het Manifesto is de WHY',
        'Scrum, Kanban, XP zijn de meest gebruikte team-frameworks',
        'SAFe, LeSS, Nexus schalen naar meerdere teams',
        'Begin pure, pas aan na ervaring (ShuHaRi)',
      ],
      resources: [
        {
          name: 'Agile Framework Comparison',
          type: 'PDF',
          size: '1.6 MB',
          description: 'Vergelijking van alle frameworks',
        },
      ],
    },
    {
      id: 'ag-l5',
      title: 'Quiz: Agile Mindset',
      titleNL: 'Quiz: Agile Mindset',
      duration: '15:00',
      type: 'quiz',
      quiz: [
        {
          id: 'ag-q1',
          question: 'Hoeveel waarden heeft het Agile Manifesto?',
          options: ['3', '4', '5', '12'],
          correctAnswer: 1,
          explanation: 'Het Agile Manifesto heeft 4 waarden en 12 principes.',
        },
        {
          id: 'ag-q2',
          question: 'Wat is de belangrijkste maatstaf voor voortgang volgens Agile?',
          options: [
            'Aantal afgeronde taken',
            'Uren besteed',
            'Werkende software',
            'Documentatie'
          ],
          correctAnswer: 2,
          explanation: 'Werkende software is de belangrijkste maatstaf voor voortgang (principe 7).',
        },
        {
          id: 'ag-q3',
          question: 'Wat is de betekenis van YAGNI?',
          options: [
            'You Always Get New Ideas',
            'You Ain\'t Gonna Need It',
            'Your Agile Growth Needs Investment',
            'Yet Another Generic Naming Issue'
          ],
          correctAnswer: 1,
          explanation: 'YAGNI = You Ain\'t Gonna Need It - bouw alleen wat nu nodig is.',
        },
        {
          id: 'ag-q4',
          question: 'Welk framework is het meest geschikt voor teams met sterk variabel werk?',
          options: ['Scrum', 'Waterfall', 'Kanban', 'XP'],
          correctAnswer: 2,
          explanation: 'Kanban is ideaal voor teams met variabel werk door continue flow en WIP limieten.',
        },
        {
          id: 'ag-q5',
          question: 'Wat is ShuHaRi?',
          options: [
            'Een Japans Agile framework',
            'Een certificering',
            'Een concept voor leren: volgen, breken, eigen regels maken',
            'Een scaling framework'
          ],
          correctAnswer: 2,
          explanation: 'ShuHaRi is een Japans concept: Shu (volg regels), Ha (breek regels bewust), Ri (maak eigen regels).',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 2: AGILE IN DE PRAKTIJK
// ============================================
const module2: Module = {
  id: 'ag-m2',
  title: 'Module 2: Agile in Practice',
  titleNL: 'Module 2: Agile in de Praktijk',
  description: 'Practical application: user stories, estimation, and Agile transformation.',
  descriptionNL: 'Praktische toepassing: user stories, schattingen en Agile transformatie.',
  lessons: [
    {
      id: 'ag-l6',
      title: 'User Stories and Backlog Management',
      titleNL: 'User Stories en Backlog Management',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      transcript: `User Stories zijn de meest gebruikte manier om requirements in Agile 
vast te leggen. In deze les leer je hoe je goede User Stories schrijft.

**Wat is een User Story?**

Een User Story beschrijft een gewenste functionaliteit vanuit het perspectief 
van de gebruiker:

"Als [type gebruiker]
Wil ik [functionaliteit]
Zodat [waarde/doel]"

Voorbeeld:
"Als online shopper
Wil ik producten aan een winkelwagen kunnen toevoegen
Zodat ik meerdere items in één keer kan bestellen"

**Waarom User Stories?**

- Focus op waarde voor de gebruiker
- Begrijpelijk voor iedereen
- Stimuleren conversatie
- Flexibel in detail

**INVEST Criteria**

Goede User Stories zijn INVEST:

**I** - Independent: Onafhankelijk van andere stories
**N** - Negotiable: Detail is onderhandelbaar
**V** - Valuable: Levert waarde voor de gebruiker
**E** - Estimable: Team kan inschatten
**S** - Small: Klein genoeg voor één Sprint
**T** - Testable: Acceptatiecriteria zijn duidelijk

**Acceptatiecriteria**

Elke User Story heeft acceptatiecriteria:

"Als online shopper
Wil ik producten aan een winkelwagen kunnen toevoegen
Zodat ik meerdere items in één keer kan bestellen

Acceptatiecriteria:
- Producten tonen "Toevoegen aan winkelwagen" knop
- Aantal items is aan te passen
- Winkelwagen toont totaalprijs
- Producten zijn te verwijderen"

**De Product Backlog**

De Product Backlog is de geordende lijst van al het werk:
- Eén backlog per product
- Geordend op prioriteit
- Eigendom van de Product Owner
- Continu evoluerend

**Backlog Refinement**

Regelmatige refinement sessies:
- Max 10% van team tijd
- Stories verduidelijken
- Grote stories splitsen
- Schattingen maken

**Samenvatting**

User Stories:
- Beschrijven functionaliteit vanuit gebruikersperspectief
- Volgen het INVEST principe
- Hebben duidelijke acceptatiecriteria
- Worden beheerd in een geordende Product Backlog`,
      keyTakeaways: [
        'User Stories follow the "As a... I want... so that..." format',
        'INVEST: Independent, Negotiable, Valuable, Estimable, Small, Testable',
        'Acceptance criteria make stories testable',
        'The Product Backlog is the single source of work',
      ],
      keyTakeawaysNL: [
        'User Stories volgen het "Als... wil ik... zodat..." format',
        'INVEST: Independent, Negotiable, Valuable, Estimable, Small, Testable',
        'Acceptatiecriteria maken stories testbaar',
        'De Product Backlog is de enige bron van werk',
      ],
    },
    {
      id: 'ag-l7',
      title: 'Agile Estimation',
      titleNL: 'Agile Schatten',
      duration: '16:00',
      type: 'video',
      videoUrl: '',
      transcript: `Schatten is moeilijk. Agile maakt het makkelijker door te focussen 
op relatieve grootte in plaats van absolute tijd.

**Waarom Relatief Schatten?**

Mensen zijn slecht in absolute schattingen:
- "Hoeveel uur kost dit?" → Zeer onnauwkeurig

Maar goed in relatieve vergelijkingen:
- "Is dit groter of kleiner dan dat?" → Veel nauwkeuriger

**Story Points**

Story Points zijn een relatieve maat voor:
- Complexiteit
- Onzekerheid
- Effort

Niet voor uren! Een 5-punts story duurt niet 5x zo lang als een 1-punter.

**De Fibonacci Reeks**

Veel teams gebruiken Fibonacci: 1, 2, 3, 5, 8, 13, 21...

Waarom?
- Grotere items zijn onzekerder
- De gaps dwingen keuzes
- Vermijdt schijnnauwkeurigheid

**Planning Poker**

Een collaboratieve schattechniek:

1. Product Owner presenteert de story
2. Team discussieert en vraagt
3. Iedereen kiest een kaart (tegelijk)
4. Bij grote verschillen: discussie
5. Herhaal tot consensus

**T-shirt Sizing**

Simpeler alternatief: S, M, L, XL

- S: Trivial, minder dan een dag
- M: Gemiddeld, 1-2 dagen
- L: Groot, meerdere dagen
- XL: Te groot, splitsen!

**Velocity**

Velocity = Story Points per Sprint

Na een paar Sprints:
- Team kent zijn gemiddelde
- Forecasting wordt mogelijk
- "Hoeveel Sprints voor de backlog?"

**#NoEstimates Beweging**

Sommige teams schatten niet:
- Focus op kleine stories
- Tel gewoon stories
- Throughput i.p.v. velocity

Dit werkt als stories consistent klein zijn.

**Samenvatting**

Agile schatten:
- Focust op relatieve grootte
- Gebruikt Story Points of T-shirts
- Is collaboratief (Planning Poker)
- Leidt tot voorspelbaarheid via Velocity`,
      keyTakeaways: [
        'Relative estimation is more accurate than absolute',
        'Story Points measure complexity, not time',
        'Planning Poker ensures team consensus',
        'Velocity enables forecasting',
      ],
      keyTakeawaysNL: [
        'Relatief schatten is nauwkeuriger dan absoluut',
        'Story Points meten complexiteit, niet tijd',
        'Planning Poker zorgt voor team consensus',
        'Velocity maakt forecasting mogelijk',
      ],
    },
    {
      id: 'ag-l8',
      title: 'Agile Transformation',
      titleNL: 'Agile Transformatie',
      duration: '20:00',
      type: 'video',
      videoUrl: '',
      transcript: `Agile invoeren is meer dan een framework kiezen. Het is een transformatie 
van cultuur, structuur en werkwijze.

**Waarom Transformaties Falen**

Veel Agile transformaties mislukken omdat:
- Focus alleen op practices, niet op mindset
- Management niet committed
- Te snel, te groot
- Geen support na training
- Oude structuren blijven bestaan

**De Transitie Fases**

**Fase 1: Awareness**
- Begrip van Agile waarden en principes
- Management buy-in verkrijgen
- Visie bepalen

**Fase 2: Experimenteren**
- Pilots met bereidwillige teams
- Leren wat werkt
- Succesverhalen creëren

**Fase 3: Opschalen**
- Meer teams betrekken
- Organisatie aanpassen
- Support structuren bouwen

**Fase 4: Optimaliseren**
- Continue verbetering
- Eigen "flavor" van Agile
- Culture change consolideren

**Succesfactoren**

1. **Executive sponsorship**: Management moet Agile leven
2. **Start klein**: Begin met pilots
3. **Training + coaching**: Niet alleen training
4. **Structuur aanpassen**: Teams, budgetten, governance
5. **Geduld**: Transformatie duurt jaren

**Common Anti-patterns**

- **Zombie Scrum**: Ceremonies zonder waarde
- **Agile in name only**: Oude werkwijze, nieuwe namen
- **ScrumButt**: "We do Scrum, but..."
- **Mini-waterfall**: Sprints als mini-waterfalls

**Samenvatting**

Agile transformatie:
- Is een cultuurverandering, niet alleen methodologie
- Vereist management commitment
- Gaat in fases van pilot naar opschaling
- Duurt jaren, niet maanden`,
      keyTakeaways: [
        'Agile transformation is a culture change',
        'Executive sponsorship is crucial',
        'Start small with pilots, scale up after success',
        'Watch out for "Agile in name only"',
      ],
      keyTakeawaysNL: [
        'Agile transformatie is cultuurverandering',
        'Executive sponsorship is cruciaal',
        'Start klein met pilots, schaal op na succes',
        'Pas op voor "Agile in name only"',
      ],
    },
    {
      id: 'ag-l9',
      title: 'Final Exam',
      titleNL: 'Eindexamen',
      duration: '30:00',
      type: 'exam',
      videoUrl: '',
      transcript: `Dit is het eindexamen van de Agile Fundamentals cursus.

**Examen Informatie:**
- 25 multiple choice vragen
- 45 minuten tijd
- 70% score nodig om te slagen

**Onderwerpen:**
- Het Agile Manifesto (4 waarden)
- De 12 Principes
- Agile vs. Traditioneel
- Agile Frameworks (Scrum, Kanban, XP, SAFe)
- User Stories en INVEST
- Agile schatten (Story Points, Planning Poker)
- Agile Transformatie

Succes!`,
    },
    {
      id: 'ag-l10',
      title: 'Certificate',
      titleNL: 'Certificaat',
      duration: '5:00',
      type: 'certificate',
      videoUrl: '',
      transcript: `Gefeliciteerd met het afronden van de Agile Fundamentals cursus!

**Je Certificaat**

Je ontvangt een certificaat dat bevestigt:
- Cursus: Agile Fundamentals
- Duur: 8 uur
- Onderwerpen: Agile Manifesto, 12 Principles, Frameworks, User Stories
- Datum van afronding

**Vervolgstappen**

1. **Verdieping**: Kies een framework (Scrum, Kanban)
2. **Certificering**: PSM, CSM, PKM
3. **Praktijk**: Pas toe in je werk
4. **Community**: Word lid van Agile communities

Veel succes op je Agile journey!`,
    },
  ],
};

// ============================================
// EXPORT MODULES
// ============================================
export const agileModules: Module[] = [
  module1,
  module2,
];

// ============================================
// COURSE DEFINITION
// ============================================
export const agileFundamentalsCourse: Course = {
  id: 'agile-fundamentals',
  title: 'Agile Fundamentals',
  titleNL: 'Agile Fundamentals',
  description: 'The mindset and principles behind Agile. Understand the Manifesto, 12 principles, and choose the right framework for your context.',
  descriptionNL: 'De mindset en principes achter Agile. Begrijp het Manifesto, de 12 principes en kies het juiste framework voor jouw context.',
  icon: Zap,
  color: BRAND.orange,
  gradient: `linear-gradient(135deg, ${BRAND.orange}, #EA580C)`,
  category: 'agile',
  methodology: 'agile',
  levels: 2,
  modules: agileModules.reduce((total, m) => total + m.lessons.length, 0),
  duration: 8,
  rating: 4.8,
  students: 6234,
  tags: ['Agile', 'Manifesto', 'Principles', 'Mindset', 'User Stories', 'Transformation'],
  tagsNL: ['Agile', 'Manifesto', 'Principes', 'Mindset', 'User Stories', 'Transformatie'],
  instructor: instructors.martijn,
  featured: true,
  bestseller: false,
  new: false,
  freeForCustomers: true,
  certificate: true,
  whatYouLearn: [
    'The 4 values and 12 principles of the Agile Manifesto',
    'When to choose Agile vs. traditional approaches',
    'Overview of Agile frameworks: Scrum, Kanban, XP, SAFe',
    'How to write effective User Stories (INVEST)',
    'Agile estimation with Story Points and Planning Poker',
    'How to successfully transform to Agile',
  ],
  whatYouLearnNL: [
    'De 4 waarden en 12 principes van het Agile Manifesto',
    'Wanneer Agile vs. traditionele aanpakken te kiezen',
    'Overzicht van Agile frameworks: Scrum, Kanban, XP, SAFe',
    'Hoe effectieve User Stories te schrijven (INVEST)',
    'Agile schatten met Story Points en Planning Poker',
    'Hoe succesvol te transformeren naar Agile',
  ],
  requirements: [
    'No prior knowledge required',
    'Open mindset for new ways of working',
  ],
  requirementsNL: [
    'Geen voorkennis vereist',
    'Open mindset voor nieuwe werkwijzen',
  ],
  targetAudience: [
    'Anyone who wants to understand Agile',
    'Managers introducing Agile',
    'Professionals who use Agile but lack the fundamentals',
    'Teams wanting to collaborate better',
  ],
  targetAudienceNL: [
    'Iedereen die Agile wil begrijpen',
    'Managers die Agile willen introduceren',
    'Professionals die Agile gebruiken maar de basis missen',
    'Teams die beter willen samenwerken',
  ],
  courseModules: agileModules,
};

export default agileFundamentalsCourse;