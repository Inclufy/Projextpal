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
  order: 0,
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
      keyTakeawaysEN: [
        'Four values: People, Working software, Customer collaboration, Responding to change',
        'It is about prioritization, not elimination of the right-hand side',
        'Agile requires a mindset shift from predicting to adapting',
        'The Manifesto is a foundation, not a complete methodology',
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
      keyTakeawaysEN: [
        'The 12 principles give concrete form to the 4 values',
        'Focus on frequent delivery of working software',
        'Build around motivated people with trust',
        'Continuous reflection and improvement is essential',
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
      keyTakeawaysEN: [
        'Traditional approaches suit predictable, stable contexts',
        'Agile suits uncertain, changing contexts',
        'The Stacey diagram helps in choosing the right approach',
        'Hybrid approaches combine elements of both',
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
      keyTakeawaysEN: [
        'Frameworks are the HOW, the Manifesto is the WHY',
        'Scrum, Kanban, XP are the most widely used team-level frameworks',
        'SAFe, LeSS, Nexus scale to multiple teams',
        'Start pure, adapt after gaining experience (ShuHaRi)',
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
  order: 1,
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
      keyTakeawaysEN: [
        'User Stories follow the "As a... I want... so that..." format',
        'INVEST: Independent, Negotiable, Valuable, Estimable, Small, Testable',
        'Acceptance criteria make stories testable',
        'The Product Backlog is the single source of work',
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
      keyTakeawaysEN: [
        'Relative estimation is more accurate than absolute estimation',
        'Story Points measure complexity, not time',
        'Planning Poker ensures team consensus',
        'Velocity enables forecasting',
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
      keyTakeawaysEN: [
        'Agile transformation is a cultural change',
        'Executive sponsorship is crucial',
        'Start small with pilots, scale up after success',
        'Beware of "Agile in name only"',
      ],
    },
    {
      id: 'ag-l-assignment',
      title: 'Praktijkopdracht: Sprint Planning & Daily Standup',
      titleNL: 'Praktijkopdracht: Sprint Planning & Daily Standup',
      duration: '60:00',
      type: 'assignment',
      requires_admin_approval: true,
      assignment: {
        title: 'Faciliteer Sprint Planning en ontwerp een Daily Standup voor een 5-koppig team',
        description: `Je bent Scrum Master van een nieuw Agile-team van 5 personen dat voor het eerst sprint planning gaat uitvoeren. Het product is een intern klantportaal; de Product Owner heeft een eerste Product Backlog opgesteld met 20 items.

Gebruik de kennis uit de cursus om de volgende sprint-artefacten op te stellen.`,
        deliverables: [
          'Sprint Goal: één heldere zin die het doel van de sprint beschrijft (SMART, max. 40 woorden)',
          'Sprint Backlog: 5-8 user stories met acceptatiecriteria (INVEST-format), geprioriteerd op businesswaarde',
          'Definition of Done: 3-5 criteria die gelden voor alle stories in deze sprint',
          'Daily Standup-script: template met de 3 vragen, timebox, en anti-patroon-waarschuwingen',
        ],
        rubric: [
          { criterion: 'Sprint Goal concreet, meetbaar en team-gedragen', points: 20 },
          { criterion: 'User stories voldoen aan INVEST-criteria', points: 25 },
          { criterion: 'DoD realistisch en controleerbaar (geen vage criteria)', points: 20 },
          { criterion: 'Daily Standup-script bruikbaar en tijdsbewust', points: 20 },
          { criterion: 'Consistente Agile-terminologie en taal', points: 15 },
        ],
        submission_format: 'markdown',
      },
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
      quiz: [
        {
          id: 'agile-exam-q1',
          question: 'How many values does the Agile Manifesto contain?',
          questionNL: 'Hoeveel waarden bevat het Agile Manifesto?',
          options: ['2', '4', '8', '12'],
          optionsNL: ['2', '4', '8', '12'],
          correctAnswer: 1,
          explanation: 'The Agile Manifesto (Beck et al., 2001) contains exactly 4 values, supported by 12 principles. The values are: Individuals and interactions, Working software, Customer collaboration, Responding to change.',
          explanationNL: 'Het Agile Manifesto (Beck et al., 2001) bevat precies 4 waarden, ondersteund door 12 principes. De waarden zijn: Individuen en interacties, Werkende software, Samenwerking met de klant, Reageren op verandering.',
        },
        {
          id: 'agile-exam-q2',
          question: 'Which of the following is the correct first Agile Manifesto value?',
          questionNL: 'Welke van de volgende is de correcte eerste waarde van het Agile Manifesto?',
          options: [
            'Working software over comprehensive documentation',
            'Individuals and interactions over processes and tools',
            'Customer collaboration over contract negotiation',
            'Responding to change over following a plan',
          ],
          optionsNL: [
            'Werkende software boven uitgebreide documentatie',
            'Individuen en interacties boven processen en tools',
            'Samenwerking met de klant boven contractonderhandeling',
            'Reageren op verandering boven het volgen van een plan',
          ],
          correctAnswer: 1,
          explanation: '"Individuals and interactions over processes and tools" is the first of the four Agile Manifesto values. All four values acknowledge that the items on the right have value, but the items on the left are valued more.',
          explanationNL: '"Individuen en interacties boven processen en tools" is de eerste van de vier waarden van het Agile Manifesto. Alle vier waarden erkennen dat de items aan de rechterkant waarde hebben, maar de items aan de linkerkant worden meer gewaardeerd.',
        },
        {
          id: 'agile-exam-q3',
          question: 'According to the Agile Manifesto, what is the primary measure of progress?',
          questionNL: 'Wat is volgens het Agile Manifesto de primaire maatstaf voor voortgang?',
          options: [
            'Percentage of planned tasks completed',
            'Number of story points delivered',
            'Working software',
            'Customer satisfaction scores',
          ],
          optionsNL: [
            'Percentage van geplande taken voltooid',
            'Aantal geleverde story points',
            'Werkende software',
            'Klanttevredenheidsscores',
          ],
          correctAnswer: 2,
          explanation: 'Agile Principle 7 states: "Working software is the primary measure of progress." This shifts focus from activity (tasks done, hours logged) to outcomes (software that actually works).',
          explanationNL: 'Agile Principe 7 stelt: "Werkende software is de primaire maatstaf voor voortgang." Dit verschuift de focus van activiteit (taken gedaan, uren gelogd) naar resultaten (software die daadwerkelijk werkt).',
        },
        {
          id: 'agile-exam-q4',
          question: 'Which Agile Manifesto value addresses the need to embrace change even late in development?',
          questionNL: 'Welke waarde van het Agile Manifesto benadrukt de noodzaak om verandering te omarmen, zelfs laat in de ontwikkeling?',
          options: [
            'Individuals and interactions over processes and tools',
            'Working software over comprehensive documentation',
            'Customer collaboration over contract negotiation',
            'Responding to change over following a plan',
          ],
          optionsNL: [
            'Individuen en interacties boven processen en tools',
            'Werkende software boven uitgebreide documentatie',
            'Samenwerking met de klant boven contractonderhandeling',
            'Reageren op verandering boven het volgen van een plan',
          ],
          correctAnswer: 3,
          explanation: '"Responding to change over following a plan" is the fourth Manifesto value. Agile Principle 2 reinforces this: "Welcome changing requirements, even late in development."',
          explanationNL: '"Reageren op verandering boven het volgen van een plan" is de vierde Manifesto-waarde. Agile Principe 2 versterkt dit: "Verwelkom veranderende vereisten, zelfs laat in de ontwikkeling."',
        },
        {
          id: 'agile-exam-q5',
          question: 'Which Agile principle states that business people and developers must work together daily throughout the project?',
          questionNL: 'Welk Agile principe stelt dat zakelijke mensen en ontwikkelaars dagelijks samen moeten werken gedurende het hele project?',
          options: [
            'Principle 1',
            'Principle 4',
            'Principle 6',
            'Principle 12',
          ],
          optionsNL: [
            'Principe 1',
            'Principe 4',
            'Principe 6',
            'Principe 12',
          ],
          correctAnswer: 1,
          explanation: 'Agile Principle 4 states: "Business people and developers must work together daily throughout the project." This ensures continuous alignment and fast feedback between those who define value and those who deliver it.',
          explanationNL: 'Agile Principe 4 stelt: "Zakelijke mensen en ontwikkelaars moeten dagelijks samenwerken gedurende het hele project." Dit zorgt voor continue afstemming en snelle feedback tussen degenen die waarde definiëren en degenen die het leveren.',
        },
        {
          id: 'agile-exam-q6',
          question: 'What does the INVEST acronym stand for when describing good user stories?',
          questionNL: 'Waar staat het acroniem INVEST voor bij het beschrijven van goede user stories?',
          options: [
            'Independent, Negotiable, Valuable, Estimable, Small, Testable',
            'Iterative, Navigable, Verified, Effective, Scalable, Tested',
            'Independent, Numbered, Validated, Explicit, Scored, Timed',
            'Integrated, Normalized, Valuable, Estimated, Sized, Tested',
          ],
          optionsNL: [
            'Onafhankelijk, Onderhandelbaar, Waardevol, Schattbaar, Klein, Testbaar',
            'Iteratief, Navigeerbaar, Geverifieerd, Effectief, Schaalbaar, Getest',
            'Onafhankelijk, Genummerd, Gevalideerd, Expliciet, Gescoord, Getimed',
            'Geïntegreerd, Genormaliseerd, Waardevol, Geschat, Van grootte voorzien, Getest',
          ],
          correctAnswer: 0,
          explanation: 'INVEST (Bill Wake, 2003) stands for: Independent (can be developed in any order), Negotiable (details are flexible), Valuable (delivers business value), Estimable (team can size it), Small (fits in a sprint), Testable (has acceptance criteria).',
          explanationNL: 'INVEST (Bill Wake, 2003) staat voor: Independent (onafhankelijk - kan in willekeurige volgorde worden ontwikkeld), Negotiable (onderhandelbaar - details zijn flexibel), Valuable (waardevol - levert bedrijfswaarde), Estimable (schattbaar - team kan het inschatten), Small (klein - past in een sprint), Testable (testbaar - heeft acceptatiecriteria).',
        },
        {
          id: 'agile-exam-q7',
          question: 'A user story follows the format: "As a [role], I want [feature] so that [benefit]." What does the "so that" clause primarily capture?',
          questionNL: 'Een user story volgt het formaat: "Als [rol] wil ik [functie] zodat [voordeel]." Wat legt de "zodat"-clausule primair vast?',
          options: [
            'The technical implementation approach',
            'The business value or reason behind the request',
            'The acceptance criteria for the story',
            'The priority of the story in the backlog',
          ],
          optionsNL: [
            'De technische implementatiebenadering',
            'De bedrijfswaarde of reden achter het verzoek',
            'De acceptatiecriteria voor de story',
            'De prioriteit van de story in de backlog',
          ],
          correctAnswer: 1,
          explanation: 'The "so that" clause captures the business value or the "why" behind the feature request. This is crucial because it allows the development team to find alternative solutions if the stated feature proves difficult, as long as the underlying need is met.',
          explanationNL: 'De "zodat"-clausule legt de bedrijfswaarde of het "waarom" achter het functieverzoek vast. Dit is cruciaal omdat het het ontwikkelteam in staat stelt alternatieve oplossingen te vinden als de genoemde functie moeilijk blijkt, zolang de onderliggende behoefte wordt vervuld.',
        },
        {
          id: 'agile-exam-q8',
          question: 'What is a Minimum Viable Product (MVP)?',
          questionNL: 'Wat is een Minimum Viable Product (MVP)?',
          options: [
            'The cheapest product you can build',
            'The version of a product with the minimum number of features possible',
            'The smallest product that delivers enough value to attract early adopters and validate learning',
            'A prototype used only for internal testing',
          ],
          optionsNL: [
            'Het goedkoopste product dat je kunt bouwen',
            'De versie van een product met het minimale aantal mogelijke functies',
            'Het kleinste product dat voldoende waarde levert om early adopters aan te trekken en leren te valideren',
            'Een prototype dat alleen voor intern testen wordt gebruikt',
          ],
          correctAnswer: 2,
          explanation: 'An MVP (Eric Ries, Lean Startup) is the smallest product release that delivers enough value to attract real customers and generate validated learning. It is not the minimum in terms of quality or features alone — it must be viable (usable and valuable) in order to generate real feedback.',
          explanationNL: 'Een MVP (Eric Ries, Lean Startup) is de kleinste productreleasedie voldoende waarde levert om echte klanten aan te trekken en gevalideerd leren te genereren. Het is niet het minimum qua kwaliteit of functies alleen — het moet levensvatbaar (bruikbaar en waardevol) zijn om echte feedback te genereren.',
        },
        {
          id: 'agile-exam-q9',
          question: 'Which of the following BEST describes timeboxing in Agile?',
          questionNL: 'Welke van de volgende beschrijft timeboxing in Agile het BESTE?',
          options: [
            'Scheduling meetings with strict agendas',
            'Fixing a maximum duration for an activity and stopping when time expires',
            'Estimating how long each task will take before starting',
            'Setting deadlines for each team member individually',
          ],
          optionsNL: [
            'Vergaderingen plannen met strikte agenda\'s',
            'Een maximale duur voor een activiteit vastleggen en stoppen wanneer de tijd verstrijkt',
            'Schatten hoelang elke taak duurt voordat je begint',
            'Deadlines instellen voor elk teamlid afzonderlijk',
          ],
          correctAnswer: 1,
          explanation: 'Timeboxing fixes the duration of an activity (the timebox) rather than the scope. When the timebox expires, work stops and whatever has been completed is the output. Sprints in Scrum are a classic example of a timebox.',
          explanationNL: 'Timeboxing legt de duur van een activiteit (de timebox) vast in plaats van de scope. Wanneer de timebox verstrijkt, stopt het werk en is wat is voltooid de uitvoer. Sprints in Scrum zijn een klassiek voorbeeld van een timebox.',
        },
        {
          id: 'agile-exam-q10',
          question: 'A self-organizing team in Agile means that:',
          questionNL: 'Een zelforganiserend team in Agile betekent dat:',
          options: [
            'The team works without any management oversight at all',
            'The team chooses the best way to accomplish its work without being directed by outsiders',
            'Every team member has identical skills and responsibilities',
            'The team never needs a Scrum Master or coach',
          ],
          optionsNL: [
            'Het team werkt zonder enig managementtoezicht',
            'Het team de beste manier kiest om zijn werk te volbrengen zonder te worden aangestuurd door buitenstaanders',
            'Elk teamlid heeft identieke vaardigheden en verantwoordelijkheden',
            'Het team nooit een Scrum Master of coach nodig heeft',
          ],
          correctAnswer: 1,
          explanation: 'Agile Principle 11 states: "The best architectures, requirements, and designs emerge from self-organizing teams." Self-organization means the team decides HOW to do the work — it does not mean an absence of leadership or accountability.',
          explanationNL: 'Agile Principe 11 stelt: "De beste architecturen, vereisten en ontwerpen komen voort uit zelforganiserende teams." Zelforganisatie betekent dat het team beslist HOE het werk te doen — het betekent niet een afwezigheid van leiderschap of verantwoording.',
        },
        {
          id: 'agile-exam-q11',
          question: 'What is the purpose of a product backlog in Agile?',
          questionNL: 'Wat is het doel van een product backlog in Agile?',
          options: [
            'A fixed list of all features to be built, agreed at project start',
            'A prioritized list of everything that might be done to improve the product, ordered by value',
            'A sprint plan for the next two weeks',
            'A log of bugs and defects found during testing',
          ],
          optionsNL: [
            'Een vaste lijst van alle te bouwen functies, overeengekomen bij projectstart',
            'Een geprioriteerde lijst van alles dat gedaan zou kunnen worden om het product te verbeteren, geordend op waarde',
            'Een sprintplan voor de komende twee weken',
            'Een logboek van bugs en defecten gevonden tijdens testen',
          ],
          correctAnswer: 1,
          explanation: 'The product backlog is an ordered list of everything that is known to be needed in the product. It is never complete — it evolves as the product and its environment change. The highest-priority items are refined and ready for upcoming sprints.',
          explanationNL: 'De product backlog is een geordende lijst van alles waarvan bekend is dat het nodig is in het product. Het is nooit compleet — het evolueert naarmate het product en de omgeving veranderen. De items met de hoogste prioriteit worden verfijnd en klaargemaakt voor aankomende sprints.',
        },
        {
          id: 'agile-exam-q12',
          question: 'Which backlog prioritization technique scores items by Reach, Impact, Confidence, and Effort?',
          questionNL: 'Welke backlog-prioriteringstechniek scoort items op Bereik, Impact, Vertrouwen en Inspanning?',
          options: [
            'MoSCoW',
            'Kano Model',
            'RICE scoring',
            'WSJF (Weighted Shortest Job First)',
          ],
          optionsNL: [
            'MoSCoW',
            'Kano Model',
            'RICE-scoring',
            'WSJF (Weighted Shortest Job First)',
          ],
          correctAnswer: 2,
          explanation: 'RICE (Intercom, 2016) scores each backlog item on Reach (how many users affected), Impact (how much it moves the metric), Confidence (certainty in estimates), and Effort (person-months required). RICE score = (Reach × Impact × Confidence) / Effort.',
          explanationNL: 'RICE (Intercom, 2016) scoort elk backlog-item op Reach (hoeveel gebruikers beïnvloed), Impact (hoeveel het de metriek beweegt), Confidence (zekerheid in schattingen) en Effort (persoon-maanden vereist). RICE-score = (Reach × Impact × Confidence) / Effort.',
        },
        {
          id: 'agile-exam-q13',
          question: 'In Agile, "velocity" refers to:',
          questionNL: 'In Agile verwijst "velocity" naar:',
          options: [
            'The speed of individual developers measured in lines of code per day',
            'The number of features delivered per release',
            'The average amount of work a team completes per iteration, used for empirical planning',
            'The rate at which the product backlog grows',
          ],
          optionsNL: [
            'De snelheid van individuele ontwikkelaars gemeten in regels code per dag',
            'Het aantal geleverde functies per release',
            'De gemiddelde hoeveelheid werk die een team per iteratie voltooit, gebruikt voor empirische planning',
            'De snelheid waarmee de product backlog groeit',
          ],
          correctAnswer: 2,
          explanation: 'Velocity is a measure of the amount of work a team completes in a single sprint (typically in story points). Over several sprints, average velocity becomes a reliable input for release forecasting — this is empirical planning: planning based on actual past performance rather than estimates alone.',
          explanationNL: 'Velocity is een maatstaf voor de hoeveelheid werk die een team in een enkele sprint voltooit (doorgaans in story points). Over meerdere sprints wordt de gemiddelde velocity een betrouwbare input voor releaseprognoses — dit is empirische planning: plannen op basis van werkelijke prestaties uit het verleden in plaats van alleen schattingen.',
        },
        {
          id: 'agile-exam-q14',
          question: 'What is the Agile concept of "iterative and incremental delivery"?',
          questionNL: 'Wat is het Agile concept van "iteratieve en incrementele levering"?',
          options: [
            'Delivering the entire product in one big release at the end of the project',
            'Repeating the same work cycle to improve quality, while also adding new functionality in each cycle',
            'Delegating work to subcontractors incrementally as budget allows',
            'Testing the product in multiple stages before a single final delivery',
          ],
          optionsNL: [
            'Het volledige product in één grote release aan het einde van het project leveren',
            'De dezelfde werkcyclus herhalen om kwaliteit te verbeteren, terwijl ook nieuwe functionaliteit in elke cyclus wordt toegevoegd',
            'Werk delegeren aan onderaannemers incrementeel naarmate het budget het toelaat',
            'Het product in meerdere fasen testen vóór een enkele eindlevering',
          ],
          correctAnswer: 1,
          explanation: 'Iterative means repeating cycles to refine and improve. Incremental means adding new pieces of functionality in each cycle. Together they mean: each sprint/iteration both improves existing work AND delivers new working features, resulting in a potentially shippable product increment at the end of each cycle.',
          explanationNL: 'Iteratief betekent cycli herhalen om te verfijnen en verbeteren. Incrementeel betekent nieuwe stukken functionaliteit toevoegen in elke cyclus. Samen betekenen ze: elke sprint/iteratie verbetert zowel bestaand werk ALS levert nieuwe werkende functies op, resulterend in een potentieel te verzenden productincrement aan het einde van elke cyclus.',
        },
        {
          id: 'agile-exam-q15',
          question: 'What is the primary purpose of a retrospective in Agile?',
          questionNL: 'Wat is het primaire doel van een retrospective in Agile?',
          options: [
            'To demonstrate the sprint increment to stakeholders',
            'To plan the work for the next sprint',
            'For the team to inspect itself and create a plan for improvements in the next sprint',
            'To review and update the product backlog',
          ],
          optionsNL: [
            'Om het sprint-increment aan stakeholders te demonstreren',
            'Om het werk voor de volgende sprint te plannen',
            'Om het team zichzelf te laten inspecteren en een plan voor verbeteringen in de volgende sprint te maken',
            'Om de product backlog te beoordelen en bij te werken',
          ],
          correctAnswer: 2,
          explanation: 'A retrospective is a structured opportunity for the team to inspect how it is working and identify improvements. It is grounded in Agile Principle 12: "At regular intervals, the team reflects on how to become more effective, then tunes and adjusts its behavior accordingly."',
          explanationNL: 'Een retrospective is een gestructureerde gelegenheid voor het team om te inspecteren hoe het werkt en verbeteringen te identificeren. Het is gebaseerd op Agile Principe 12: "Met regelmatige tussenpozen reflecteert het team op hoe het effectiever kan worden, en past vervolgens zijn gedrag dienovereenkomstig aan."',
        },
        {
          id: 'agile-exam-q16',
          question: 'Which statement BEST distinguishes the Agile mindset from a specific Agile framework such as Scrum?',
          questionNL: 'Welke uitspraak onderscheidt de Agile mindset het BESTE van een specifiek Agile framework zoals Scrum?',
          options: [
            'The Agile mindset is only relevant for software projects; Scrum can be applied to any project',
            'Scrum is a prescriptive framework with defined roles and events; the Agile mindset is the underlying set of values and principles that any framework should embody',
            'The Agile mindset and Scrum are interchangeable terms',
            'Scrum is a mindset; the Agile Manifesto is a framework',
          ],
          optionsNL: [
            'De Agile mindset is alleen relevant voor softwareprojecten; Scrum kan op elk project worden toegepast',
            'Scrum is een prescriptief framework met gedefinieerde rollen en events; de Agile mindset is de onderliggende set van waarden en principes die elk framework zou moeten belichamen',
            'De Agile mindset en Scrum zijn uitwisselbare termen',
            'Scrum is een mindset; het Agile Manifesto is een framework',
          ],
          correctAnswer: 1,
          explanation: 'The Agile Manifesto defines values and principles — the mindset. Frameworks such as Scrum, Kanban, and XP are concrete implementations that operationalize those values through specific roles, events, and artifacts. You can be Agile without using Scrum, but Scrum is designed to embody Agile values.',
          explanationNL: 'Het Agile Manifesto definieert waarden en principes — de mindset. Frameworks zoals Scrum, Kanban en XP zijn concrete implementaties die die waarden operationaliseren door middel van specifieke rollen, events en artefacten. Je kunt Agile zijn zonder Scrum te gebruiken, maar Scrum is ontworpen om Agile-waarden te belichamen.',
        },
        {
          id: 'agile-exam-q17',
          question: 'Kanban\'s primary constraint mechanism is:',
          questionNL: 'Het primaire beperkingsmechanisme van Kanban is:',
          options: [
            'Sprint length (timeboxing)',
            'WIP (Work In Progress) limits per workflow stage',
            'A fixed team size of 7 plus or minus 2 members',
            'Mandatory daily standups',
          ],
          optionsNL: [
            'Sprintlengte (timeboxing)',
            'WIP (Work In Progress) limieten per workflowfase',
            'Een vaste teamgrootte van 7 plus of min 2 leden',
            'Verplichte dagelijkse standups',
          ],
          correctAnswer: 1,
          explanation: 'Kanban\'s defining constraint is WIP limits: explicit caps on how many items can be in each workflow stage simultaneously. WIP limits expose bottlenecks, reduce context-switching, and create a pull system where new work is started only when capacity exists.',
          explanationNL: 'De bepalende beperking van Kanban zijn WIP-limieten: expliciete caps op hoeveel items tegelijkertijd in elke workflowfase kunnen zijn. WIP-limieten leggen knelpunten bloot, verminderen context-switching en creëren een pull-systeem waarbij nieuw werk alleen wordt gestart wanneer er capaciteit is.',
        },
        {
          id: 'agile-exam-q18',
          question: 'Which Agile principle directly addresses sustainable pace for the team?',
          questionNL: 'Welk Agile principe gaat direct in op een duurzaam tempo voor het team?',
          options: [
            'Principle 3: Deliver working software frequently',
            'Principle 8: Agile processes promote sustainable development',
            'Principle 5: Build projects around motivated individuals',
            'Principle 10: Simplicity is essential',
          ],
          optionsNL: [
            'Principe 3: Lever werkende software frequent',
            'Principe 8: Agile processen bevorderen duurzame ontwikkeling',
            'Principe 5: Bouw projecten rond gemotiveerde individuen',
            'Principe 10: Eenvoud is essentieel',
          ],
          correctAnswer: 1,
          explanation: 'Agile Principle 8: "Agile processes promote sustainable development. The sponsors, developers, and users should be able to maintain a constant pace indefinitely." Sustainable pace prevents burnout and maintains consistent quality and velocity over time.',
          explanationNL: 'Agile Principe 8: "Agile processen bevorderen duurzame ontwikkeling. De sponsors, ontwikkelaars en gebruikers moeten een constant tempo voor onbepaalde tijd kunnen aanhouden." Duurzaam tempo voorkomt burnout en behoudt consistente kwaliteit en velocity in de loop van de tijd.',
        },
        {
          id: 'agile-exam-q19',
          question: 'In empirical process control (the foundation of Scrum and many Agile approaches), the three pillars are:',
          questionNL: 'In empirische procescontrole (de basis van Scrum en vele Agile benaderingen) zijn de drie pijlers:',
          options: [
            'Planning, Execution, Review',
            'Transparency, Inspection, Adaptation',
            'Vision, Roadmap, Delivery',
            'Velocity, Capacity, Throughput',
          ],
          optionsNL: [
            'Planning, Uitvoering, Review',
            'Transparantie, Inspectie, Aanpassing',
            'Visie, Roadmap, Levering',
            'Velocity, Capaciteit, Doorvoer',
          ],
          correctAnswer: 1,
          explanation: 'Empirical process control rests on three pillars: Transparency (the process and work must be visible), Inspection (frequent examination of artifacts and progress), and Adaptation (adjusting when inspection reveals deviation). These three pillars underpin the Scrum Guide 2020\'s framework design.',
          explanationNL: 'Empirische procescontrole rust op drie pijlers: Transparantie (het proces en het werk moeten zichtbaar zijn), Inspectie (frequente beoordeling van artefacten en voortgang) en Aanpassing (aanpassen wanneer inspectie afwijking onthult). Deze drie pijlers ondersteunen het raamwerkontwerp van de Scrum Guide 2020.',
        },
        {
          id: 'agile-exam-q20',
          question: 'Which of the following is an example of the Agile value "Customer collaboration over contract negotiation"?',
          questionNL: 'Welke van de volgende is een voorbeeld van de Agile waarde "Samenwerking met de klant boven contractonderhandeling"?',
          options: [
            'Locking down all requirements in a signed specification document before development begins',
            'Inviting the product owner to daily standups so they can give immediate feedback',
            'Charging extra for any requirement changes after the project kick-off',
            'Using a fixed-price contract to protect the development team from scope creep',
          ],
          optionsNL: [
            'Alle vereisten vastleggen in een ondertekend specificatiedocument voordat de ontwikkeling begint',
            'De product owner uitnodigen voor dagelijkse standups zodat ze onmiddellijke feedback kunnen geven',
            'Extra kosten in rekening brengen voor eventuele vereistenwijzigingen na de projectkickoff',
            'Een vaste-prijs contract gebruiken om het ontwikkelteam te beschermen tegen scope creep',
          ],
          correctAnswer: 1,
          explanation: 'Inviting the product owner or customer representative into day-to-day collaboration (e.g. standups, sprint reviews, backlog refinement) is a direct expression of preferring collaboration over negotiation. Contracts still exist, but frequent conversation replaces the need to negotiate every change formally.',
          explanationNL: 'Het uitnodigen van de product owner of klantvertegenwoordiger in de dagelijkse samenwerking (bijv. standups, sprint reviews, backlog refinement) is een directe uitdrukking van het prefereren van samenwerking boven onderhandeling. Contracten bestaan nog steeds, maar frequente communicatie vervangt de noodzaak om elke wijziging formeel te onderhandelen.',
        },
        {
          id: 'agile-exam-q21',
          question: 'Story points are used to estimate:',
          questionNL: 'Story points worden gebruikt om te schatten:',
          options: [
            'The number of hours a user story will take to complete',
            'The relative size and complexity of a user story compared to others',
            'The business value of a user story in monetary terms',
            'The number of developers needed for a user story',
          ],
          optionsNL: [
            'Het aantal uren dat een user story nodig heeft om te voltooien',
            'De relatieve grootte en complexiteit van een user story vergeleken met andere',
            'De bedrijfswaarde van een user story in monetaire termen',
            'Het aantal ontwikkelaars dat nodig is voor een user story',
          ],
          correctAnswer: 1,
          explanation: 'Story points are an abstract unit representing relative effort, complexity, and uncertainty — not hours. A story rated 8 points is roughly twice as complex as one rated 4 points. This relative estimation (often done via Planning Poker) helps teams avoid false precision and account for team-specific factors.',
          explanationNL: 'Story points zijn een abstracte eenheid die relatieve inspanning, complexiteit en onzekerheid vertegenwoordigt — geen uren. Een story met 8 punten is ongeveer twee keer zo complex als een met 4 punten. Deze relatieve schatting (vaak gedaan via Planning Poker) helpt teams valse precisie te vermijden en teamspecifieke factoren in aanmerking te nemen.',
        },
        {
          id: 'agile-exam-q22',
          question: 'An Agile team has completed a sprint but the product owner says the increment does not meet the Definition of Done. What should happen?',
          questionNL: 'Een Agile team heeft een sprint voltooid, maar de product owner zegt dat het increment niet voldoet aan de Definition of Done. Wat moet er gebeuren?',
          options: [
            'The increment is released anyway and the issues are fixed in the next sprint',
            'The increment is not released; the unfinished work is returned to the product backlog for re-prioritization',
            'The sprint is extended until the Definition of Done is met',
            'The Scrum Master overrides the product owner\'s assessment',
          ],
          optionsNL: [
            'Het increment wordt toch uitgebracht en de problemen worden opgelost in de volgende sprint',
            'Het increment wordt niet uitgebracht; het onvoltooide werk wordt teruggestuurd naar de product backlog voor herprioritering',
            'De sprint wordt verlengd totdat de Definition of Done is gehaald',
            'De Scrum Master overschrijft de beoordeling van de product owner',
          ],
          correctAnswer: 1,
          explanation: 'Per the Scrum Guide 2020: "If a Product Backlog item does not meet the Definition of Done, it cannot be released or even presented at the Sprint Review. It is returned to the Product Backlog for future consideration." Sprints are timeboxed and never extended.',
          explanationNL: 'Volgens de Scrum Guide 2020: "Als een Product Backlog-item niet voldoet aan de Definition of Done, kan het niet worden uitgebracht of zelfs gepresenteerd bij de Sprint Review. Het wordt teruggezet in de Product Backlog voor toekomstige overweging." Sprints zijn timeboxed en worden nooit verlengd.',
        },
      ],
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