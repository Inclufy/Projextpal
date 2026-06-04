// ============================================
// COURSE: PROJECT MANAGEMENT FUNDAMENTALS
// ============================================
// Complete course with full transcripts, quizzes, and resources
// ============================================

import { Target } from 'lucide-react';
import { Course, Module, Lesson } from '../types';
import { BRAND } from '../brand';
import { instructors } from '../instructors';

// ============================================
// MODULE 1: INTRODUCTIE PROJECT MANAGEMENT
// ============================================
const module1: Module = {
  order: 0,
  id: 'pm-m1',
  title: 'Module 1: Introduction to Project Management',
  titleNL: 'Module 1: Introductie Project Management',
  description: 'The fundamentals: what are projects, who is the PM, and which methodologies exist?',
  descriptionNL: 'De fundamenten: wat zijn projecten, wie is de PM, en welke methodologieën bestaan er?',
  lessons: [
    {
      id: 'pm-l1',
      title: 'What is a project?',
      titleNL: 'Wat is een project?',
      duration: '12:00',
      type: 'video',
      videoUrl: '',
      transcript: `Welkom bij de eerste les van deze cursus! Vandaag gaan we het hebben over 
een fundamentele vraag: wat is eigenlijk een project?

Je hoort het woord "project" waarschijnlijk dagelijks. "We hebben een nieuw project", "Dit 
project loopt uit", "Het project is afgerond". Maar wat maakt iets nou precies een project?

**De Definitie van een Project**

Een project is een tijdelijke onderneming die wordt uitgevoerd om een uniek product, dienst 
of resultaat te creëren. Laten we deze definitie ontleden:

1. **Tijdelijk**: Elk project heeft een duidelijk begin en einde. Dit is fundamenteel anders 
dan lopende operaties. Een fabriek die elke dag auto\'s produceert is geen project - dat is 
een operationeel proces. Maar het bouwen van die fabriek? Dat is wél een project.

2. **Uniek**: Het resultaat van een project is op een of andere manier nieuw of anders. Zelfs 
als je al eerder een website hebt gebouwd, zal de volgende website toch anders zijn - andere 
eisen, andere stakeholders, andere context.

3. **Specifiek resultaat**: Een project levert iets op. Dat kan tastbaar zijn (een gebouw, 
een app) of ontastbaar (een reorganisatie, een verbeterd proces).

**Project vs. Operatie**

Om dit beter te begrijpen, vergelijken we projecten met operaties:

| Kenmerk | Project | Operatie |
|---------|---------|----------|
| Duur | Tijdelijk | Doorlopend |
| Resultaat | Uniek | Repetitief |
| Team | Tijdelijk samengesteld | Vast team |
| Doel | Verandering creëren | Status quo handhaven |

Een goed voorbeeld: het implementeren van een nieuw CRM-systeem is een project. Maar het 
dagelijks gebruiken en onderhouden van dat systeem is een operatie.

**De Triple Constraint (IJzeren Driehoek)**

Elk project wordt beheerst door drie onderling verbonden factoren, ook wel de "Triple 
Constraint" of "IJzeren Driehoek" genoemd:

1. **Scope** (Omvang): Wat moet er worden opgeleverd?
2. **Tijd**: Wanneer moet het klaar zijn?
3. **Budget**: Hoeveel mag het kosten?

In het midden van deze driehoek staat **Kwaliteit**. Als je aan één zijde trekt, beïnvloedt 
dat de andere zijden. Wil je meer features (scope)? Dan kost het meer tijd of geld. Moet 
het sneller? Dan moet je scope beperken of meer budget vrijmaken.

Dit is een van de belangrijkste lessen voor elke projectmanager: je kunt niet alles hebben. 
Er zijn altijd trade-offs.

**Voorbeelden van Projecten**

Laten we naar enkele concrete voorbeelden kijken:

- **IT**: Een nieuwe app ontwikkelen, een systeem migreren naar de cloud
- **Bouw**: Een kantoorpand bouwen, een weg aanleggen
- **Organisatie**: Een fusie doorvoeren, een nieuwe afdeling oprichten
- **Event**: Een conferentie organiseren, een productlancering
- **Persoonlijk**: Een huis verbouwen, een bruiloft organiseren

Allemaal projecten! Ze zijn tijdelijk, leveren een uniek resultaat, en moeten worden 
gemanaged op scope, tijd en budget.

**Waarom Projectmanagement?**

Je zou je kunnen afvragen: waarom hebben we formeel projectmanagement nodig? Kunnen we 
niet gewoon... beginnen?

De statistieken zijn ontnuchterend:
- 70% van de projecten faalt om hun oorspronkelijke doelen te halen
- Gemiddeld worden projecten 27% duurder dan gepland
- 1 op de 6 IT-projecten heeft een kostenoverrun van 200%

De projecten die wel slagen, hebben meestal één ding gemeen: goed projectmanagement. 
Met de juiste methodes, tools en vaardigheden kun je de kans op succes dramatisch verhogen.

**Samenvatting**

In deze les heb je geleerd:
- Een project is tijdelijk, uniek en gericht op een specifiek resultaat
- Projecten verschillen van operaties door hun tijdelijke en unieke karakter
- De Triple Constraint (scope, tijd, budget) bepaalt de grenzen van elk project
- Projectmanagement is essentieel om projecten succesvol te laten zijn

In de volgende les gaan we dieper in op de rol van de projectmanager. Wie is dat eigenlijk, 
en wat maakt iemand een goede PM?`,
      keyTakeaways: [
        'A project is temporary, unique and delivers a specific result',
        'The Triple Constraint (scope, time, budget) determines project boundaries',
        'Projects differ fundamentally from operational activities',
        '70% of projects fail without proper project management',
      ],
      keyTakeawaysNL: [
        'Een project is tijdelijk, uniek en levert een specifiek resultaat',
        'De Triple Constraint (scope, tijd, budget) bepaalt projectgrenzen',
        'Projecten verschillen fundamenteel van operationele werkzaamheden',
        '70% van projecten faalt zonder goed projectmanagement',
      ],
      keyTakeawaysEN: [
        'A project is temporary, unique, and delivers a specific result',
        'The Triple Constraint (scope, time, budget) defines project boundaries',
        'Projects differ fundamentally from operational activities',
        '70% of projects fail without proper project management',
      ],
      resources: [
        {
          name: 'Infographic: Project vs. Operatie',
          type: 'PDF',
          size: '1.2 MB',
          description: 'Visueel overzicht van de verschillen tussen projecten en operaties',
        },
        {
          name: 'Template: Project Identificatie Checklist',
          type: 'PDF',
          size: '245 KB',
          description: 'Checklist om te bepalen of iets een project is',
        },
      ],
    },
    {
      id: 'pm-l2',
      title: 'The role of the project manager',
      titleNL: 'De rol van de projectmanager',
      duration: '15:00',
      type: 'video',
      videoUrl: '',
      transcript: `In de vorige les hebben we geleerd wat een project is. Nu gaan we kijken 
naar de persoon die verantwoordelijk is voor het succes van dat project: de projectmanager.

**Wat doet een Projectmanager?**

Een projectmanager (PM) is de persoon die verantwoordelijk is voor het plannen, uitvoeren en 
afsluiten van een project. Maar die simpele definitie doet geen recht aan de complexiteit 
van de rol.

Een goede PM is tegelijkertijd:
- **Planner**: Structuur aanbrengen in chaos
- **Communicator**: De lijm tussen alle betrokkenen
- **Probleemoplosser**: Obstakels uit de weg ruimen
- **Motivator**: Het team geïnspireerd houden
- **Onderhandelaar**: Belangen balanceren
- **Beslisser**: Knopen doorhakken wanneer nodig

**De Kernverantwoordelijkheden**

1. **Scope Management**
   - Definiëren wat wel en niet tot het project behoort
   - Wijzigingsverzoeken beoordelen en beheren
   - Scope creep voorkomen (ongecontroleerde uitbreiding)

2. **Planning & Scheduling**
   - Work Breakdown Structure (WBS) opstellen
   - Realistische planningen maken
   - Afhankelijkheden identificeren
   - Mijlpalen definiëren

3. **Budgetbeheer**
   - Kostenramingen maken
   - Budget bewaken en bijsturen
   - Financiële rapportages opstellen

4. **Risicomanagement**
   - Risico's identificeren en analyseren
   - Mitigerende maatregelen implementeren
   - Continu monitoren en bijstellen

5. **Teammanagement**
   - Het juiste team samenstellen
   - Taken toewijzen en volgen
   - Conflicten oplossen
   - Ontwikkeling stimuleren

6. **Stakeholder Management**
   - Stakeholders identificeren en analyseren
   - Verwachtingen managen
   - Regelmatig communiceren
   - Draagvlak creëren en behouden

7. **Kwaliteitsmanagement**
   - Kwaliteitseisen definiëren
   - Kwaliteitscontroles uitvoeren
   - Continue verbetering stimuleren

**Hard Skills vs. Soft Skills**

Een effectieve projectmanager heeft zowel technische als menselijke vaardigheden nodig:

**Hard Skills:**
- Planningtechnieken (Gantt, PERT, CPM)
- Budgettering en financieel management
- Risico-analyse methodieken
- Project management software (MS Project, Jira, Asana)
- Methodologie-kennis (PRINCE2, PMI, Agile)

**Soft Skills:**
- Communicatie (mondeling en schriftelijk)
- Leiderschap zonder formele autoriteit
- Onderhandelen en conflictoplossing
- Probleemoplossend vermogen
- Aanpassingsvermogen en flexibiliteit
- Emotionele intelligentie

Uit onderzoek blijkt dat soft skills vaak doorslaggevend zijn. Je kunt de beste planning 
ter wereld maken, maar als je je team niet kunt motiveren of stakeholders niet kunt 
overtuigen, zal het project alsnog falen.

**De PM als Dienend Leider**

Een moderne visie op projectmanagement ziet de PM als een "dienend leider" (servant leader). 
Dit betekent:

- Je bent er voor het team, niet andersom
- Je ruimt obstakels uit de weg zodat anderen hun werk kunnen doen
- Je creëert een omgeving waarin mensen kunnen excelleren
- Je geeft credits aan het team, niet aan jezelf

Dit is anders dan de traditionele "command and control" stijl waar de PM de baas is die 
opdrachten uitdeelt. Onderzoek toont aan dat dienend leiderschap leidt tot:
- Hogere teamtevredenheid
- Betere projectresultaten
- Meer innovatie en creativiteit

**Carrièrepad**

Hoe word je projectmanager? Er zijn verschillende routes:

1. **Vanuit een vakgebied**: Je begint als specialist (developer, marketeer, ingenieur) 
   en groeit door naar projectrollen.

2. **Via certificering**: Je haalt certificaten zoals PRINCE2, PMP of Scrum Master en 
   solliciteert op PM-functies.

3. **Interne doorgroei**: Je neemt steeds meer coördinerende taken op je en wordt 
   uiteindelijk PM.

Typische carrièrestappen:
- Junior Project Coordinator
- Project Manager
- Senior Project Manager
- Program Manager
- Portfolio Manager / PMO Director

**Samenvatting**

De projectmanager is de spil van elk project. Je combineert:
- Technische vaardigheden (plannen, budgetteren, risicobeheer)
- Menselijke vaardigheden (communiceren, leiden, motiveren)
- Een dienende houding (het team laten excelleren)

In de volgende les verkennen we de verschillende projectmanagement methodologieën. 
Dit geeft je een framework waarbinnen je deze PM-vaardigheden kunt toepassen.`,
      keyTakeaways: [
        'The PM is responsible for scope, time, budget and quality',
        'Both hard skills and soft skills are essential',
        'Servant leadership is more effective than command & control',
        'There are multiple career paths into project management',
      ],
      keyTakeawaysNL: [
        'De PM is verantwoordelijk voor scope, tijd, budget en kwaliteit',
        'Zowel hard skills als soft skills zijn essentieel',
        'Dienend leiderschap is effectiever dan command & control',
        'Er zijn meerdere carrièrepaden naar projectmanagement',
      ],
      keyTakeawaysEN: [
        'The PM is responsible for scope, time, budget, and quality',
        'Both hard skills and soft skills are essential',
        'Servant leadership is more effective than command & control',
        'There are multiple career paths into project management',
      ],
      resources: [
        {
          name: 'PM Competentie Framework',
          type: 'PDF',
          size: '890 KB',
          description: 'Overzicht van alle PM competenties met zelfevaluatie',
        },
        {
          name: 'PM Carrièrepad Infographic',
          type: 'PDF',
          size: '1.1 MB',
          description: 'Visueel overzicht van carrièremogelijkheden',
        },
      ],
    },
    {
      id: 'pm-l3',
      title: 'Project management methodologies',
      titleNL: 'Projectmanagement methodologieën',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      transcript: `Nu je weet wat een project is en wat een projectmanager doet, is de 
volgende vraag: hóe manage je een project? Daar komen methodologieën om de hoek kijken.

**Wat is een Methodologie?**

Een projectmanagement methodologie is een gestructureerde aanpak voor het managen van 
projecten. Het biedt:
- Een gemeenschappelijke taal voor het team
- Bewezen processen en technieken
- Templates en tools
- Best practices uit duizenden projecten

**De Belangrijkste Methodologieën**

Laten we de meest gebruikte methodologieën doorlopen:

**1. Waterfall (Traditioneel)**

De klassieke, sequentiële aanpak:
- Fasen volgen elkaar lineair op
- Elke fase moet af zijn voor de volgende begint
- Veel upfront planning en documentatie
- Veranderingen zijn lastig en duur

Ideaal voor:
- Projecten met duidelijke, stabiele requirements
- Gereguleerde omgevingen (bouw, medisch, luchtvaart)
- Projecten waar de scope vooraf volledig bekend is

**2. Agile**

Een iteratieve, flexibele aanpak:
- Werk in korte cycli (sprints/iteraties)
- Frequente oplevering van werkende producten
- Continue feedback en aanpassing
- Nadruk op samenwerking boven documentatie

Ideaal voor:
- Projecten met veranderende of onzekere requirements
- Software ontwikkeling
- Innovatieve productontwikkeling

**3. Scrum**

Een specifiek Agile framework:
- Vaste rollen (Product Owner, Scrum Master, Team)
- Vaste events (Sprint Planning, Daily Standup, Review, Retrospective)
- Vaste artifacts (Product Backlog, Sprint Backlog, Increment)
- Sprints van 1-4 weken

**4. Kanban**

Focus op flow en visualisatie:
- Visueel bord met kolommen (To Do, Doing, Done)
- Work-in-Progress (WIP) limieten
- Continue flow in plaats van sprints
- Pull-systeem: werk wordt "getrokken" niet "geduwd"

Ideaal voor:
- Support en maintenance werk
- Teams met veel ad-hoc verzoeken
- Continue levering

**5. PRINCE2**

Procesgebaseerde methodologie uit het VK:
- Gestructureerde processen van start tot eind
- Duidelijke rollen en verantwoordelijkheden
- Focus op business justification
- Management by exception

Ideaal voor:
- Overheidsprojecten
- Grote, complexe projecten
- Organisaties die governance belangrijk vinden

**6. Lean Six Sigma**

Focus op procesverbetering en kwaliteit:
- DMAIC cyclus (Define, Measure, Analyze, Improve, Control)
- Data-gedreven besluitvorming
- Elimineren van verspilling
- Statistische analyse

Ideaal voor:
- Procesverbeteringsprojecten
- Kwaliteitsverbetering
- Manufacturing en operations

**Welke Methodologie Kiezen?**

Er is geen "beste" methodologie. De keuze hangt af van:

1. **Projecttype**: Software vs. constructie vs. organisatieverandering
2. **Requirements stabiliteit**: Vast vs. veranderlijk
3. **Organisatiecultuur**: Hiërarchisch vs. plat
4. **Team ervaring**: Wat kent het team?
5. **Stakeholder verwachtingen**: Wat verwachten zij?
6. **Regelgeving**: Zijn er compliance-eisen?

**Hybride Aanpak**

In de praktijk gebruiken veel organisaties een hybride aanpak:
- PRINCE2 voor governance + Agile voor uitvoering
- Waterfall voor de overall planning + Scrum voor development
- Kanban voor operations + Sprints voor nieuwe features

Dit heet ook wel "WAGILE" (Waterfall + Agile) of "bimodale projectaanpak".

**De Trend: Meer Agile**

De afgelopen jaren zien we een duidelijke trend:
- 71% van organisaties gebruikt Agile methoden
- Zelfs traditionele industrieën adopteren Agile principes
- "Agile mindset" wordt belangrijker dan de specifieke methodologie

**Samenvatting**

- Methodologieën bieden structuur en best practices
- Waterfall = sequentieel, plangedreven
- Agile/Scrum = iteratief, flexibel
- PRINCE2 = procesgebaseerd, governance-gericht
- Lean Six Sigma = data-gedreven, procesverbetering
- Kies op basis van project, organisatie en context
- Hybride aanpakken worden steeds populairder`,
      keyTakeaways: [
        'Methodologies provide structure and a common language',
        'Waterfall is sequential; Agile is iterative and flexible',
        'PRINCE2 focuses on governance; Lean Six Sigma on process improvement',
        'Choose the methodology that fits your project and organization',
      ],
      keyTakeawaysNL: [
        'Methodologieën bieden structuur en gemeenschappelijke taal',
        'Waterfall is sequentieel; Agile is iteratief en flexibel',
        'PRINCE2 focust op governance; Lean Six Sigma op procesverbetering',
        'Kies de methodologie die past bij je project en organisatie',
      ],
      keyTakeawaysEN: [
        'Methodologies provide structure and a common language',
        'Waterfall is sequential; Agile is iterative and flexible',
        'PRINCE2 focuses on governance; Lean Six Sigma on process improvement',
        'Choose the methodology that fits your project and organization',
      ],
      resources: [
        {
          name: 'Methodologie Vergelijkingstabel',
          type: 'PDF',
          size: '1.5 MB',
          description: 'Gedetailleerde vergelijking van alle methodologieën',
        },
        {
          name: 'Keuzehulp: Welke Methodologie?',
          type: 'PDF',
          size: '420 KB',
          description: 'Beslisboom voor methodologiekeuze',
        },
      ],
    },
    {
      id: 'pm-l4',
      title: 'The project lifecycle',
      titleNL: 'De projectlevenscyclus',
      duration: '14:00',
      type: 'video',
      videoUrl: '',
      transcript: `Elk project, ongeacht de methodologie, doorloopt een levenscyclus. 
In deze les leer je de vijf fasen die elk project kent en wat er in elke fase gebeurt.

**De Vijf Fasen van een Project**

**Fase 1: Initiatie (Start-up)**

Dit is waar het allemaal begint. In de initiatiefase:

- Wordt de projectbehoefte geïdentificeerd
- Wordt de haalbaarheid onderzocht
- Wordt het projectcharter opgesteld
- Worden key stakeholders geïdentificeerd
- Wordt de projectmanager aangesteld

Key deliverables:
- Business case
- Projectcharter
- Stakeholder register (eerste versie)

Kritische vragen:
- Waarom doen we dit project?
- Wat zijn de verwachte benefits?
- Is het haalbaar (technisch, financieel, organisatorisch)?
- Wie zijn de belangrijkste stakeholders?

**Fase 2: Planning**

Na goedkeuring van het projectcharter begint de planningsfase:

- Scope wordt gedetailleerd uitgewerkt (WBS)
- Planning wordt opgesteld (Gantt chart)
- Budget wordt vastgesteld
- Risico's worden geïdentificeerd en geanalyseerd
- Communicatieplan wordt gemaakt
- Kwaliteitsplan wordt opgesteld
- Team wordt samengesteld

Key deliverables:
- Project Management Plan
- Work Breakdown Structure
- Gedetailleerde planning
- Budget
- Risicoregister
- Communicatieplan

Dit is vaak de meest tijdrovende fase. Een goede planning voorkomt veel problemen later.

**Fase 3: Uitvoering (Execution)**

Nu wordt het werk daadwerkelijk uitgevoerd:

- Teamleden voeren hun taken uit
- Deliverables worden geproduceerd
- Kwaliteitscontroles worden uitgevoerd
- Team wordt gecoacht en begeleid
- Stakeholders worden gemanaged

De projectmanager houdt zich bezig met:
- Coördinatie van werkzaamheden
- Probleemoplossing
- Teamontwikkeling
- Stakeholder communicatie
- Quality assurance

**Fase 4: Monitoring & Control**

Deze fase loopt parallel aan de uitvoering:

- Voortgang wordt gemeten tegen de baseline
- Afwijkingen worden geïdentificeerd
- Corrigerende acties worden ondernomen
- Wijzigingen worden beheerd
- Risico's worden continu gemonitord

Tools en technieken:
- Earned Value Management (EVM)
- Voortgangsrapportages
- Variatie-analyse
- Change control process

Als je afwijkingen ontdekt, moet je beslissen:
- Bijsturen binnen het project?
- Scope aanpassen?
- Planning/budget herzien?
- Escaleren naar de opdrachtgever?

**Fase 5: Afsluiting (Closure)**

De vaak verwaarloosde maar cruciale laatste fase:

- Formele acceptatie van deliverables
- Administratieve afsluiting
- Lessons learned documenteren
- Team vrijgeven
- Projectdocumentatie archiveren
- Viering van succes!

Key deliverables:
- Sign-off documenten
- Lessons learned rapport
- Projectarchief
- Eindrapportage

Waarom is afsluiting zo belangrijk?
- Voorkomt "zombie projecten" die nooit formeel eindigen
- Lessons learned helpen toekomstige projecten
- Geeft closure aan het team
- Maakt resources vrij voor nieuwe projecten

**Lineair vs. Iteratief**

In Waterfall doorloop je deze fasen lineair, één keer.

In Agile doorloop je ze iteratief:
- Elke sprint heeft mini-versies van deze fasen
- De overall project lifecycle blijft bestaan
- Maar binnen die lifecycle herhaal je cycli van plannen-uitvoeren-reviewen

**Gate Reviews**

Tussen fasen zitten vaak "gates" of beslismomenten:
- Go/No-go beslissing
- Review van deliverables
- Goedkeuring voor volgende fase
- Opportunity om te stoppen als het project niet meer zinvol is

**Samenvatting**

De vijf fasen van een project:
1. **Initiatie**: Waarom? Business case, charter
2. **Planning**: Hoe? WBS, planning, budget, risico\'s
3. **Uitvoering**: Doen! Werk uitvoeren, team managen
4. **Monitoring**: Controleren en bijsturen
5. **Afsluiting**: Afronden, lessons learned, vieren`,
      keyTakeaways: [
        'Every project has five phases: Initiation, Planning, Execution, Monitoring, Closure',
        'The planning phase largely determines project success',
        'Monitoring runs parallel to execution',
        'Closure is crucial but is often neglected',
      ],
      keyTakeawaysNL: [
        'Elk project kent vijf fasen: Initiatie, Planning, Uitvoering, Monitoring, Afsluiting',
        'De planningsfase bepaalt grotendeels het projectsucces',
        'Monitoring loopt parallel aan uitvoering',
        'Afsluiting is cruciaal maar wordt vaak verwaarloosd',
      ],
      keyTakeawaysEN: [
        'Every project has five phases: Initiation, Planning, Execution, Monitoring, Closure',
        'The planning phase largely determines project success',
        'Monitoring runs parallel to execution',
        'Closure is crucial but is often neglected',
      ],
      resources: [
        {
          name: 'Projectlevenscyclus Poster',
          type: 'PDF',
          size: '2.1 MB',
          description: 'Visuele weergave van alle fasen en deliverables',
        },
        {
          name: 'Gate Review Checklist',
          type: 'XLSX',
          size: '180 KB',
          description: 'Checklist voor fase-overgangen',
        },
      ],
    },
    {
      id: 'pm-l5',
      title: 'Quiz: Basic concepts',
      titleNL: 'Quiz: Basisconcepten',
      duration: '15:00',
      type: 'quiz',
      quiz: [
        {
          id: 'q1',
          question: 'Wat maakt een project GEEN project?',
          options: [
            'Het is tijdelijk',
            'Het levert een uniek resultaat',
            'Het is een doorlopende, repetitieve activiteit',
            'Het heeft een duidelijk begin en einde',
          ],
          correctAnswer: 2,
          explanation: 'Een doorlopende, repetitieve activiteit is een operatie, geen project. Projecten zijn per definitie tijdelijk en leveren unieke resultaten.',
        },
        {
          id: 'q2',
          question: 'Welke drie factoren vormen de "Triple Constraint"?',
          options: [
            'Mensen, Processen, Technologie',
            'Scope, Tijd, Budget',
            'Kwaliteit, Risico, Communicatie',
            'Planning, Uitvoering, Controle',
          ],
          correctAnswer: 1,
          explanation: 'De Triple Constraint bestaat uit Scope, Tijd en Budget. Deze drie factoren zijn onderling verbonden en beïnvloeden elkaar.',
        },
        {
          id: 'q3',
          question: 'Welke methodologie is het meest geschikt voor een project met onzekere, veranderende requirements?',
          options: [
            'Waterfall',
            'PRINCE2',
            'Agile',
            'Lean Six Sigma',
          ],
          correctAnswer: 2,
          explanation: 'Agile is ontworpen voor situaties met onzekerheid en verandering. Het werkt in korte iteraties en omarmt verandering.',
        },
        {
          id: 'q4',
          question: 'In welke fase wordt het projectcharter opgesteld?',
          options: [
            'Planning',
            'Initiatie',
            'Uitvoering',
            'Afsluiting',
          ],
          correctAnswer: 1,
          explanation: 'Het projectcharter wordt opgesteld in de Initiatiefase. Het is een van de eerste formele documenten van een project.',
        },
        {
          id: 'q5',
          question: 'Wat staat in het MIDDEN van de Triple Constraint-driehoek (IJzeren Driehoek)?',
          options: [
            'Scope',
            'Risico',
            'Kwaliteit',
            'Communicatie',
          ],
          correctAnswer: 2,
          explanation: 'In het midden van de Triple Constraint-driehoek staat Kwaliteit. De drie zijden zijn Scope, Tijd en Budget. Als je aan één zijde trekt, beïnvloedt dat de andere zijden én de kwaliteit in het midden.',
        },
        {
          id: 'q6',
          question: 'Welke fase wordt vaak verwaarloosd maar is cruciaal voor organisatorisch leren?',
          options: [
            'Initiatie',
            'Planning',
            'Uitvoering',
            'Afsluiting',
          ],
          correctAnswer: 3,
          explanation: 'De Afsluitingsfase wordt vaak overgeslagen, maar is cruciaal voor het documenteren van lessons learned en het vrijgeven van resources.',
        },
        {
          id: 'q7',
          question: 'Welk kenmerk onderscheidt de Waterfall-methodologie het meest van Agile?',
          options: [
            'Waterfall werkt uitsluitend voor softwareprojecten',
            'Waterfall heeft geen planningsfase',
            'Waterfall werkt in korte iteraties met continue feedback',
            'Bij Waterfall moet elke fase volledig afgesloten zijn voordat de volgende begint',
          ],
          correctAnswer: 3,
          explanation: 'Waterfall is een sequentiële aanpak waarbij elke fase (zoals analyse, ontwerp, bouw, test) volledig afgerond moet zijn voordat de volgende fase start. Dit verschilt fundamenteel van Agile, dat iteratief werkt met korte cycli en continue feedback.',
        },
        {
          id: 'q8',
          question: 'Wat is "scope creep"?',
          options: [
            'Het planmatig uitbreiden van de projectscope',
            'Ongecontroleerde, niet-goedgekeurde uitbreiding van de scope',
            'Het inkrimpen van de scope om budget te besparen',
            'Een methode om scope te definiëren',
          ],
          correctAnswer: 1,
          explanation: 'Scope creep is de ongecontroleerde uitbreiding van de projectscope zonder aanpassing van tijd of budget. Het is een veelvoorkomend projectrisico.',
        },
        {
          id: 'q9',
          question: 'Welke vaardigheid blijkt uit onderzoek vaak doorslaggevend voor PM-succes?',
          options: [
            'Technische expertise',
            'Budgetteringsvaardigheid',
            'Soft skills (communicatie, leiderschap)',
            'Tool-kennis',
          ],
          correctAnswer: 2,
          explanation: 'Hoewel alle vaardigheden belangrijk zijn, blijken soft skills zoals communicatie en leiderschap vaak doorslaggevend voor projectsucces.',
        },
        {
          id: 'q10',
          question: 'Wat is een "gate review"?',
          options: [
            'Een review van de projectpoort',
            'Een beslismoment tussen projectfasen',
            'Een review van de projectbudget',
            'Een dagelijkse teammeeting',
          ],
          correctAnswer: 1,
          explanation: 'Een gate review is een formeel beslismoment tussen projectfasen waar wordt bepaald of het project door mag naar de volgende fase.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 2: PROJECT INITIATIE
// ============================================
const module2: Module = {
  order: 1,
  id: 'pm-m2',
  title: 'Module 2: Project Initiation',
  titleNL: 'Module 2: Project Initiatie',
  description: 'How to start a project well? From stakeholder analysis to business case.',
  descriptionNL: 'Hoe start je een project goed? Van stakeholder analyse tot business case.',
  lessons: [
    {
      id: 'pm-l6',
      title: 'Creating the project charter',
      titleNL: 'Het projectcharter opstellen',
      duration: '16:00',
      type: 'video',
      videoUrl: '',
      transcript: `Het projectcharter is een van de belangrijkste documenten in projectmanagement. 
Het is het formele document dat een project autoriseert en de projectmanager de bevoegdheid 
geeft om organisatieresources in te zetten.

**Wat is een Projectcharter?**

Een projectcharter (ook wel Project Initiation Document of PID genoemd) is:
- De "geboorteakte" van het project
- Een formele autorisatie om te starten
- Een samenvatting van de belangrijkste projectinformatie
- Een contract tussen de projectmanager en de sponsor

**Waarom is het Charter zo Belangrijk?**

1. **Formele autorisatie**: Zonder charter is er geen officieel project
2. **Duidelijkheid**: Iedereen begrijpt wat het project inhoudt
3. **Verwachtingsmanagement**: Scope, budget en planning zijn vastgelegd
4. **Mandaat**: De PM krijgt formele bevoegdheden
5. **Referentie**: Een baseline om naar terug te kijken

**De Onderdelen van een Projectcharter**

Een goed projectcharter bevat de volgende elementen:

**1. Projectnaam en Identificatie**
- Projectnaam
- Projectcode/nummer
- Versie en datum
- Sponsor en projectmanager

**2. Projectachtergrond en Aanleiding**
- Waarom dit project?
- Welk probleem lossen we op?
- Welke kans pakken we?

**3. Projectdoelstellingen**
SMART geformuleerd:
- Specifiek: Wat precies?
- Meetbaar: Hoe meten we succes?
- Acceptabel: Is er draagvlak?
- Realistisch: Is het haalbaar?
- Tijdgebonden: Wanneer klaar?

Voorbeeld:
"Het implementeren van een nieuw CRM-systeem dat binnen 6 maanden operationeel is, 
door 200 gebruikers wordt geadopteerd, en leidt tot 20% hogere klanttevredenheid."

**4. Scope (In-scope en Out-of-scope)**

In-scope: Wat hoort WEL bij het project?
Out-of-scope: Wat hoort NIET bij het project?

Out-of-scope expliciet benoemen is cruciaal om scope creep te voorkomen.

**5. Belangrijkste Deliverables**
Wat gaat het project opleveren? Wees concreet.

Voorbeeld:
- Werkend CRM-systeem in productie
- Gemigreerde klantdata
- Getrainde gebruikers
- Beheer- en onderhoudsdocumentatie

**6. Hoog-niveau Planning/Mijlpalen**
Geen gedetailleerde planning, maar de grote lijnen:
- Start: 1 maart 2024
- Einde ontwerp: 1 mei 2024
- Go-live: 1 september 2024
- Project closure: 1 oktober 2024

**7. Budget (Indicatief)**
Een hoog-niveau budget, vaak met marge (+/- 25%).

**8. Belangrijkste Stakeholders**
Wie zijn de key stakeholders?
- Sponsor
- Stuurgroep
- Eindgebruikers
- ...

**9. Risico's en Aannames**
De belangrijkste risico\'s en aannames waar het project op is gebaseerd.

**10. Goedkeuring/Handtekeningen**
Formele goedkeuring door sponsor en andere beslissers.

**Tips voor een Sterk Charter**

1. **Houd het kort**: 2-5 pagina's is genoeg
2. **Wees concreet**: Vermijd vage termen
3. **Definieer out-of-scope**: Net zo belangrijk als in-scope
4. **Gebruik SMART doelen**: Meetbaar en tijdgebonden
5. **Betrek de sponsor**: Het is hun document
6. **Geen details**: Dat komt in de planning

**Veelgemaakte Fouten**

- Te lang en te gedetailleerd
- Vage doelstellingen
- Geen out-of-scope definitie
- Geen formele goedkeuring
- Niet updaten bij grote wijzigingen

**Samenvatting**

Het projectcharter:
- Autoriseert het project formeel
- Bevat alle essentiële projectinformatie
- Is kort en krachtig (2-5 pagina's)
- Wordt goedgekeurd door de sponsor
- Vormt de basis voor alle verdere planning`,
      keyTakeaways: [
        'The project charter formally authorizes the project',
        'Contains: goals, scope, budget, schedule, stakeholders, risks',
        'Defining out-of-scope is just as important as in-scope',
        'Keep it short: 2-5 pages is sufficient',
      ],
      keyTakeawaysNL: [
        'Het projectcharter autoriseert het project formeel',
        'Bevat: doelen, scope, budget, planning, stakeholders, risico\'s',
        'Out-of-scope definiëren is net zo belangrijk als in-scope',
        'Houd het kort: 2-5 pagina\'s is voldoende',
      ],
      keyTakeawaysEN: [
        'The project charter formally authorizes the project',
        'Contains: objectives, scope, budget, schedule, stakeholders, risks',
        'Defining out-of-scope is just as important as in-scope',
        'Keep it concise: 2-5 pages is sufficient',
      ],
      resources: [
        {
          name: 'Projectcharter Template',
          type: 'DOCX',
          size: '145 KB',
          description: 'Kant-en-klaar template met alle secties',
        },
        {
          name: 'Projectcharter Voorbeeld - IT Project',
          type: 'PDF',
          size: '320 KB',
          description: 'Uitgewerkt voorbeeld van een CRM-implementatie',
        },
        {
          name: 'SMART Doelen Werkblad',
          type: 'PDF',
          size: '95 KB',
          description: 'Hulpmiddel voor het formuleren van SMART doelen',
        },
      ],
    },
    {
      id: 'pm-l7',
      title: 'Stakeholder analysis',
      titleNL: 'Stakeholder analyse',
      duration: '14:00',
      type: 'video',
      videoUrl: '',
      transcript: `"Stakeholders kunnen je project maken of breken." Deze uitspraak hoor je 
vaak in projectmanagement, en hij klopt. In deze les leer je hoe je stakeholders identificeert, 
analyseert en een strategie ontwikkelt om ze te managen.

**Wat is een Stakeholder?**

Een stakeholder is iedereen die:
- Invloed heeft op het project
- Beïnvloed wordt door het project
- Belang heeft bij het resultaat

Dit kunnen zijn:
- Intern: Sponsor, teamleden, management, andere afdelingen
- Extern: Klanten, leveranciers, partners, toezichthouders

**Waarom Stakeholder Analyse?**

Projecten falen zelden door technische redenen alleen. Vaak is het:
- Gebrek aan draagvlak
- Weerstand tegen verandering
- Verkeerde verwachtingen
- Politieke onderstroom

Met goede stakeholder analyse kun je:
- Draagvlak bouwen
- Weerstand voorzien en adresseren
- De juiste mensen betrekken
- Communicatie afstemmen

**Stap 1: Stakeholders Identificeren**

Begin breed. Vraag jezelf af:
- Wie heeft belang bij dit project?
- Wie wordt geraakt door de verandering?
- Wie heeft macht om te beïnvloeden?
- Wie heeft kennis die we nodig hebben?
- Wie kan weerstand bieden?

Technieken:
- Brainstorm met het kernteam
- Bekijk organisatieschema's
- Vraag aan de sponsor
- Analyseer eerdere soortgelijke projecten

**Stap 2: Stakeholders Analyseren**

Voor elke stakeholder bepaal je:

1. **Belang/Interest**: Hoe belangrijk is dit project voor hen?
   - Laag / Medium / Hoog

2. **Invloed/Macht**: Hoeveel invloed hebben ze op het project?
   - Laag / Medium / Hoog

3. **Houding**: Zijn ze positief, neutraal of negatief?
   - Supporter / Neutraal / Tegenstander

**De Power/Interest Matrix**

Een veelgebruikt hulpmiddel is de Power/Interest matrix:

               | Laag Belang    | Hoog Belang    |
---------------|----------------|----------------|
Hoge Macht     | Tevreden houden| Actief managen |
Lage Macht     | Monitoren      | Geïnformeerd   |
               |                | houden         |

**Strategieën per Kwadrant:**

- **Actief managen** (hoge macht, hoog belang): 
  Nauw betrekken, regelmatig overleg, verwachtingen actief managen

- **Tevreden houden** (hoge macht, laag belang):
  Niet te veel belasten, wel informeren over belangrijke zaken

- **Geïnformeerd houden** (lage macht, hoog belang):
  Regelmatige updates, mogelijkheid tot input

- **Monitoren** (lage macht, laag belang):
  Minimale inspanning, periodiek checken

**Stap 3: Stakeholder Register**

Documenteer je analyse in een stakeholder register:

| Naam | Rol | Belang | Invloed | Houding | Strategie |
|------|-----|--------|---------|---------|-----------|
| Jan D. | CFO | Hoog | Hoog | Neutraal | Actief managen - focus op ROI |
| ...  | ... | ...    | ...     | ...     | ...       |

**Stap 4: Engagement Strategy**

Voor key stakeholders ontwikkel je een specifieke strategie:

- Hoe vaak communiceren?
- Via welk kanaal?
- Welke boodschap?
- Wie is verantwoordelijk voor de relatie?
- Wat zijn hun concerns en hoe adresseren we die?

**Omgaan met Moeilijke Stakeholders**

Tips voor lastige situaties:

**De tegenstander:**
- Begrijp hun bezwaren echt
- Betrek ze vroeg bij het proces
- Zoek win-win oplossingen
- Gebruik hun feedback constructief

**De onzichtbare machtshebber:**
- Identificeer informele invloed
- Bouw een relatie op
- Houd ze geïnformeerd

**De over-betrokkene:**
- Stel duidelijke grenzen
- Geef ze een formele rol
- Kanaliseer hun energie positief

**Stakeholder Analyse is Dynamisch**

Let op: stakeholders veranderen gedurende het project!
- Nieuwe stakeholders komen erbij
- Belangen verschuiven
- Houdingen veranderen

Update je analyse regelmatig, minimaal per fase.

**Samenvatting**

Effectief stakeholder management:
1. Identificeer alle stakeholders (breed denken)
2. Analyseer macht, belang en houding
3. Categoriseer met de Power/Interest matrix
4. Ontwikkel specifieke strategieën
5. Documenteer in een stakeholder register
6. Update regelmatig`,
      keyTakeaways: [
        'Stakeholders can make or break your project',
        'Analyze based on power, interest and attitude',
        'The Power/Interest matrix helps with prioritization',
        'Stakeholder analysis is dynamic - update regularly',
      ],
      keyTakeawaysNL: [
        'Stakeholders kunnen je project maken of breken',
        'Analyseer op macht, belang en houding',
        'De Power/Interest matrix helpt bij prioriteren',
        'Stakeholder analyse is dynamisch - update regelmatig',
      ],
      keyTakeawaysEN: [
        'Stakeholders can make or break your project',
        'Analyze based on power, interest, and attitude',
        'The Power/Interest matrix helps with prioritization',
        'Stakeholder analysis is dynamic - update regularly',
      ],
      resources: [
        {
          name: 'Stakeholder Register Template',
          type: 'XLSX',
          size: '85 KB',
          description: 'Template voor het documenteren van stakeholders',
        },
        {
          name: 'Power/Interest Matrix Template',
          type: 'PDF',
          size: '220 KB',
          description: 'Invulbare matrix voor stakeholder mapping',
        },
      ],
    },
    {
      id: 'pm-l8',
      title: 'Developing a business case',
      titleNL: 'Business case ontwikkelen',
      duration: '15:00',
      type: 'video',
      videoUrl: '',
      transcript: `Waarom zou een organisatie tijd, geld en resources investeren in jouw project? 
Dat is de vraag die de business case beantwoordt. In deze les leer je hoe je een overtuigende 
business case opstelt.

**Wat is een Business Case?**

Een business case is een document dat de rechtvaardiging voor een project beschrijft:
- Wat zijn de kosten?
- Wat zijn de baten?
- Waarom is dit de beste optie?
- Wat zijn de risico\'s?

Het is het zakelijke argument voor het project.

**Wanneer Maak je een Business Case?**

- Bij projectinitiatie (om goedkeuring te krijgen)
- Bij gate reviews (om door te mogen)
- Bij grote wijzigingen (om hernieuwde goedkeuring te krijgen)

**De Componenten van een Business Case**

**1. Management Summary**
Een korte samenvatting voor beslissers die weinig tijd hebben.

**2. Strategische Context**
- Hoe past dit project in de organisatiestrategie?
- Welke strategische doelen ondersteunt het?
- Wat is de urgentie?

**3. Probleem of Kans**
- Welk probleem lossen we op?
- OF: welke kans pakken we?
- Wat gebeurt er als we niets doen?

**4. Opties Analyse**
Typisch analyseer je 3-4 opties:
- Optie 0: Niets doen
- Optie 1: Minimale oplossing
- Optie 2: Geprefereerde oplossing
- Optie 3: Uitgebreide oplossing

Per optie beschrijf je voor- en nadelen.

**5. Kosten**
Alle kosten, inclusief:
- Projectkosten (mensen, tools, training)
- Implementatiekosten
- Operationele kosten (na go-live)
- Verborgen kosten

**6. Baten (Benefits)**
Kwantitatief (meetbaar):
- Omzetstijging: €500.000/jaar
- Kostenbesparing: €200.000/jaar
- Productiviteitswinst: 15%

Kwalitatief (niet direct meetbaar):
- Betere klanttevredenheid
- Hogere medewerkertevredenheid
- Verminderd risico

**7. Financiële Analyse**

Veelgebruikte metrics:

**Return on Investment (ROI)**
ROI = (Baten - Kosten) / Kosten × 100%

Voorbeeld: Als een project €100.000 kost en €150.000 oplevert:
ROI = (150.000 - 100.000) / 100.000 × 100% = 50%

**Payback Period**
Hoe lang duurt het voordat de investering is terugverdiend?

Voorbeeld: Investering €120.000, jaarlijkse besparing €40.000
Payback = 3 jaar

**Net Present Value (NPV)**
De huidige waarde van toekomstige kasstromen, rekening houdend met tijdswaarde van geld.

NPV > 0 = project is financieel aantrekkelijk

**Internal Rate of Return (IRR)**
Het rendement dat het project genereert. Vergelijk met de kapitaalkosten.

**8. Risico's**
- Wat kan misgaan?
- Hoe groot is de impact?
- Hoe groot is de kans?
- Welke mitigerende maatregelen nemen we?

**9. Aanbeveling**
Een duidelijke aanbeveling: welke optie adviseer je en waarom?

**Tips voor een Sterke Business Case**

1. **Ken je publiek**: Financieel? Technisch? Strategisch?
2. **Wees realistisch**: Overdrijf baten niet, onderschat kosten niet
3. **Gebruik data**: Onderbouw met feiten en cijfers
4. **Toon "do nothing"**: Wat als we niet investeren?
5. **Kwantificeer waar mogelijk**: Cijfers overtuigen
6. **Erken risico\'s**: Laat zien dat je ze begrijpt
7. **Maak het visueel**: Grafieken en tabellen helpen

**Veelgemaakte Fouten**

- Alleen kosten, geen baten
- Te optimistische aannames
- Geen risico-analyse
- Geen alternatieven overwogen
- Te lang en te technisch

**Samenvatting**

Een goede business case:
- Rechtvaardigt de investering
- Vergelijkt opties (inclusief niets doen)
- Kwantificeert kosten en baten
- Bevat financiële analyse (ROI, NPV, payback)
- Erkent risico\'s
- Geeft een duidelijke aanbeveling`,
      keyTakeaways: [
        'The business case justifies the investment',
        'Always compare multiple options including "do nothing"',
        'Use financial metrics: ROI, payback, NPV',
        'Be realistic about costs and benefits',
      ],
      keyTakeawaysNL: [
        'De business case rechtvaardigt de investering',
        'Vergelijk altijd meerdere opties inclusief "niets doen"',
        'Gebruik financiële metrics: ROI, payback, NPV',
        'Wees realistisch over kosten en baten',
      ],
      keyTakeawaysEN: [
        'The business case justifies the investment',
        'Always compare multiple options including "do nothing"',
        'Use financial metrics: ROI, payback, NPV',
        'Be realistic about costs and benefits',
      ],
      resources: [
        {
          name: 'Business Case Template',
          type: 'DOCX',
          size: '178 KB',
          description: 'Volledig template met alle secties',
        },
        {
          name: 'ROI Calculator',
          type: 'XLSX',
          size: '95 KB',
          description: 'Spreadsheet voor financiële berekeningen',
        },
      ],
    },
    {
      id: 'pm-l9',
      title: 'Scope definition',
      titleNL: 'Scope definitie',
      duration: '12:00',
      type: 'video',
      videoUrl: '',
      transcript: `"Als je niet weet waar je naartoe gaat, kom je ergens anders uit." Dit 
geldt zeker voor projectscope. In deze les leer je hoe je een heldere scope definieert 
en vastlegt.

**Wat is Scope?**

Scope = de totale omvang van het werk dat nodig is om de projectdoelen te bereiken.

Er zijn twee soorten scope:
1. **Product Scope**: Wat zijn de features en functies van het eindproduct?
2. **Project Scope**: Welk werk moet worden gedaan om dat product op te leveren?

**Waarom is Scope Definitie Cruciaal?**

- Voorkomt misverstanden over wat wel/niet wordt opgeleverd
- Basis voor planning, budget en resource allocatie
- Referentiepunt voor wijzigingsbeheer
- Voorkomt scope creep

**Van Doelen naar Scope**

De scope volgt uit de projectdoelen:

Doel: "Implementeer een CRM-systeem om klanttevredenheid te verhogen"

Product Scope:
- Klantdatabase met contacthistorie
- Verkooppipeline management
- Rapportages en dashboards
- Integratie met e-mail

Project Scope:
- Selectie CRM-pakket
- Installatie en configuratie
- Data migratie
- Gebruikerstraining
- Go-live support

**De Scope Statement**

Een formeel document dat de scope vastlegt:

**1. Project Doelstellingen**
Wat moet het project bereiken?

**2. Product Beschrijving**
Wat wordt er opgeleverd?

**3. Deliverables**
Concrete, tastbare resultaten.

**4. Acceptatiecriteria**
Wanneer is iets "af" en "goed"?

**5. Constraints (Beperkingen)**
- Budget: max €100.000
- Tijd: klaar voor 1 september
- Resources: max 3 FTE

**6. Assumptions (Aannames)**
- Management support is beschikbaar
- Gebruikers krijgen tijd voor training
- Huidige data is van voldoende kwaliteit

**7. Exclusions (Uitgesloten)**
Wat hoort NIET bij het project?

**In-Scope vs Out-of-Scope**

Dit is een van de belangrijkste onderdelen. Wees expliciet:

In-Scope:
✓ Standaard CRM-functionaliteit
✓ Training voor 50 gebruikers
✓ Data migratie van bestaande Excel-bestanden

Out-of-Scope:
✗ Maatwerkintegraties met andere systemen
✗ Mobiele app
✗ Marketing automation

**Scope Creep Voorkomen**

Scope creep = ongecontroleerde uitbreiding van de scope zonder aanpassing van tijd/budget.

Oorzaken:
- Vage initiële scope definitie
- "Gold plating" (meer doen dan gevraagd)
- Stakeholders die extra wensen toevoegen
- Geen formeel wijzigingsproces

Preventie:
1. Duidelijke scope documentatie
2. Formeel change control proces
3. Regelmatige scope reviews
4. "Nee" durven zeggen (of "ja, maar dan...")

**De Work Breakdown Structure (WBS)**

We gaan hier in de volgende module dieper op in, maar de WBS is de tool om scope te 
structureren:

- Hiërarchische decompositie van het werk
- Van projectdoel → fases → deliverables → werkpakketten
- Basis voor planning en budgettering

**Samenvatting**

Goede scope definitie:
- Onderscheidt product scope van project scope
- Bevat duidelijke deliverables met acceptatiecriteria
- Benoemt expliciet wat out-of-scope is
- Vormt de basis voor planning en change control
- Wordt vastgelegd in een formele Scope Statement`,
      keyTakeaways: [
        'Scope = what is and is not part of the project',
        'Distinguish product scope from project scope',
        'Explicitly stating out-of-scope prevents scope creep',
        'The scope statement is the formal documentation',
      ],
      keyTakeawaysNL: [
        'Scope = wat wel en niet tot het project behoort',
        'Onderscheid product scope van project scope',
        'Out-of-scope expliciet benoemen voorkomt scope creep',
        'De scope statement is de formele vastlegging',
      ],
      keyTakeawaysEN: [
        'Scope = what is and is not part of the project',
        'Distinguish product scope from project scope',
        'Explicitly stating out-of-scope prevents scope creep',
        'The scope statement is the formal documentation',
      ],
      resources: [
        {
          name: 'Scope Statement Template',
          type: 'DOCX',
          size: '125 KB',
          description: 'Template voor scope documentatie',
        },
        {
          name: 'In/Out-of-Scope Checklist',
          type: 'PDF',
          size: '85 KB',
          description: 'Hulpmiddel voor scope afbakening',
        },
      ],
    },
    {
      id: 'pm-l10',
      title: 'Practical assignment: Project Charter',
      titleNL: 'Praktijkopdracht: Project Charter',
      duration: '45:00',
      type: 'assignment',
      assignment: {
        title: 'Stel een Projectcharter op',
        description: `In deze opdracht pas je de kennis uit Module 2 toe door een volledig 
projectcharter op te stellen voor een fictief project.

**Het Scenario:**
Je bent aangesteld als projectmanager bij een middelgroot e-commerce bedrijf (200 medewerkers, 
€50 miljoen omzet). Het management wil een nieuw warehouse management systeem (WMS) 
implementeren omdat het huidige systeem verouderd is en zorgt voor fouten in orderverwerking.

**Beschikbare Informatie:**
- Budget indicatie: €150.000 - €200.000
- Gewenste go-live: binnen 8 maanden
- Betrokken afdelingen: Warehouse, IT, Finance, Customer Service
- Sponsor: COO (Chief Operations Officer)
- Huidige problemen: 5% pick-fouten, trage orderverwerking, geen real-time voorraadinfo

**Je Opdracht:**
Stel een compleet projectcharter op dat bevat:
1. Projectidentificatie en achtergrond
2. SMART projectdoelstellingen
3. Scope (in-scope en out-of-scope)
4. Belangrijkste deliverables
5. Hoog-niveau planning met mijlpalen
6. Indicatief budget
7. Key stakeholders
8. Top 5 risico\'s
9. Kritische succesfactoren

Gebruik het meegeleverde template en lever een document van 3-5 pagina's in.`,
        deliverables: [
          'Ingevuld projectcharter (3-5 pagina\'s)',
          'Stakeholder overzicht met eerste analyse',
        ],
        rubric: [
          { criterion: 'SMART doelstellingen correct geformuleerd', points: 20 },
          { criterion: 'Scope helder afgebakend (in/out)', points: 20 },
          { criterion: 'Realistische planning en budget', points: 15 },
          { criterion: 'Stakeholders geïdentificeerd en geanalyseerd', points: 15 },
          { criterion: 'Risico\'s relevant en concreet', points: 15 },
          { criterion: 'Professionele presentatie', points: 15 },
        ],
      },
    },
  ],
};

// ============================================
// MODULE 3: PLANNING
// ============================================
const module3: Module = {
  order: 2,
  id: 'pm-m3',
  title: 'Module 3: Planning',
  titleNL: 'Module 3: Planning',
  description: 'WBS, Gantt charts, resource planning, budgeting and risk management.',
  descriptionNL: 'WBS, Gantt charts, resource planning, budgettering en risicomanagement.',
  lessons: [
    {
      id: 'pm-l11',
      title: 'Work Breakdown Structure (WBS)',
      titleNL: 'Work Breakdown Structure (WBS)',
      duration: '18:00',
      type: 'video',
      transcript: `De Work Breakdown Structure, ofwel WBS, is een van de krachtigste tools in projectmanagement.
Het is de basis voor vrijwel alles wat daarna komt: planning, budgettering, risicomanagement en
voortgangsbewaking. Als je WBS niet klopt, klopt de rest ook niet.

**Wat is een WBS?**

Een Work Breakdown Structure is een hiërarchische ontleding van het totale werk dat het projectteam
moet uitvoeren om de projectdoelstellingen te bereiken. Denk eraan als een boomstructuur die begint
bij het eindresultaat en steeds verder opbreekt in kleinere, beheersbare stukken.

De WBS is GEEN takenlijst. Het beschrijft WAT er opgeleverd moet worden (deliverables), niet HOE
het werk gedaan wordt (activiteiten). Dit is een cruciaal verschil dat veel beginners over het hoofd zien.

**De 100% Regel**

De belangrijkste regel bij het maken van een WBS is de 100% regel: de WBS moet 100% van het werk
bevatten dat nodig is om het project te voltooien. Elk niveau in de hiërarchie moet optellen tot 100%
van het bovenliggende niveau.

Als iets niet in de WBS staat, wordt het niet gedaan. Als iets wél in de WBS staat maar niet bij het
project hoort, is je scope te groot. De WBS IS je scope.

| Niveau | Beschrijving | Voorbeeld |
|--------|-------------|-----------|
| Niveau 0 | Het project zelf | Website Redesign |
| Niveau 1 | Hoofddeliverables | Design, Development, Content |
| Niveau 2 | Sub-deliverables | Homepage, Productpagina's |
| Niveau 3 | Werkpakketten | Wireframe Homepage, Visual Design Homepage |

**Werkpakketten**

Het laagste niveau van de WBS noemen we werkpakketten (work packages). Dit zijn de kleinste eenheden
die je kunt toewijzen, schatten en monitoren. Een goed werkpakket heeft deze kenmerken:

1. **8-80 uur regel**: Een werkpakket kost minimaal 8 uur en maximaal 80 uur. Kleiner is te gedetailleerd
voor projectniveau; groter is te vaag om te managen.
2. **Eén eigenaar**: Elk werkpakket heeft één verantwoordelijke persoon.
3. **Meetbaar**: Je kunt objectief vaststellen of het af is of niet.
4. **Onafhankelijk**: Idealiter kan het los van andere werkpakketten worden uitgevoerd.

**Hoe Maak je een WBS?**

Er zijn twee benaderingen:

**Top-down benadering** (aanbevolen):
- Begin bij het eindresultaat
- Breek het op in hoofdcomponenten
- Breek elke component verder op
- Ga door tot je bij werkpakketten bent

**Bottom-up benadering**:
- Brainstorm alle mogelijke taken
- Groepeer ze in logische categorieën
- Bouw de hiërarchie op

In de praktijk gebruik je vaak een combinatie. Start top-down voor de structuur en vul bottom-up aan
met details die je team aandraagt.

**WBS Dictionary**

Bij elke WBS hoort een WBS Dictionary: een document dat elk element beschrijft. Voor werkpakketten
bevat dit typisch:

- Beschrijving van het werk
- Verantwoordelijke persoon
- Geschatte duur en kosten
- Acceptatiecriteria
- Afhankelijkheden
- Benodigde resources

De WBS Dictionary voorkomt misverstanden over wat er precies verwacht wordt.

**Veelgemaakte Fouten**

1. **Activiteiten in plaats van deliverables**: "Programmeren" is een activiteit, "Werkende login-module"
is een deliverable. Gebruik deliverables.
2. **Te veel of te weinig detail**: Houd de 8-80 uur regel aan voor werkpakketten.
3. **Niet alle werk opnemen**: Vergeet niet projectmanagement zelf, documentatie, testen en training.
4. **Geen teamparticipatie**: De WBS maak je samen met het team, niet alleen achter je bureau.

**Praktische Tips**

- Gebruik sticky notes of digitale tools om te brainstormen
- Laat het team de WBS valideren — zij weten wat er nodig is
- Nummer elk element (1.0, 1.1, 1.1.1) voor eenduidige verwijzing
- Review de WBS met de sponsor voordat je verder plant
- De WBS is een levend document — update het bij scope changes`,
      keyTakeaways: [
        'The WBS is the foundation for all planning and control',
        'Follow the 100% rule: all work must be included',
        'Use deliverables (what), not activities (how)',
        'Work packages of 8-80 hours are ideal',
      ],
      keyTakeawaysNL: [
        'De WBS is de basis voor alle planning en control',
        'Volg de 100% regel: alle werk moet erin zitten',
        'Gebruik deliverables (wat), geen activiteiten (hoe)',
        'Werkpakketten van 8-80 uur zijn ideaal',
      ],
      keyTakeawaysEN: [
        'The WBS is the foundation for all planning and control',
        'Follow the 100% rule: all work must be included',
        'Use deliverables (what), not activities (how)',
        'Work packages of 8-80 hours are ideal',
      ],
      resources: [
        { name: 'WBS Template Excel', type: 'XLSX', size: '125 KB', description: 'Template voor het maken van een WBS' },
        { name: 'WBS Voorbeelden', type: 'PDF', size: '1.8 MB', description: 'Voorbeelden voor IT, bouw en organisatie projecten' },
      ],
    },
    {
      id: 'pm-l12',
      title: 'Creating Gantt charts',
      titleNL: 'Gantt charts maken',
      duration: '20:00',
      type: 'video',
      transcript: `In de vorige les hebben we de WBS gemaakt — we weten nu WAT er opgeleverd moet worden.
Nu gaan we het WANNEER bepalen. En daarvoor gebruiken we een van de meest iconische tools in
projectmanagement: het Gantt chart.

**Wat is een Gantt Chart?**

Een Gantt chart is een horizontaal staafdiagram dat de projectplanning visualiseert. Op de verticale
as staan de taken (afgeleid van je WBS werkpakketten), op de horizontale as staat de tijd. Elke taak
wordt weergegeven als een horizontale balk waarvan de lengte de duur aangeeft.

Het Gantt chart is uitgevonden door Henry Gantt rond 1910 en wordt sindsdien wereldwijd gebruikt.
Het is populair omdat het direct visueel inzicht geeft in:
- Wanneer taken beginnen en eindigen
- Welke taken parallel lopen
- Waar afhankelijkheden zitten
- Of het project op schema ligt

**Van WBS naar Gantt Chart**

De stappen om van je WBS naar een Gantt chart te komen:

1. **Taken identificeren**: Neem de werkpakketten uit je WBS
2. **Duur schatten**: Hoeveel tijd kost elk werkpakket?
3. **Afhankelijkheden bepalen**: Welke taken moeten eerst af?
4. **Resources toewijzen**: Wie doet wat?
5. **Planning uitwerken**: Bereken start- en einddatums

**Afhankelijkheden (Dependencies)**

Er zijn vier soorten afhankelijkheden tussen taken:

| Type | Naam | Beschrijving | Voorbeeld |
|------|------|-------------|-----------|
| FS | Finish-to-Start | B start als A klaar is | Fundament af → Muren bouwen |
| SS | Start-to-Start | B start als A start | Design starten → Review starten |
| FF | Finish-to-Finish | B eindigt als A eindigt | Testen eindigt met ontwikkeling |
| SF | Start-to-Finish | B eindigt als A start | Nieuwe shift start → Oude shift eindigt |

Finish-to-Start (FS) is veruit de meest voorkomende — ongeveer 90% van alle afhankelijkheden
in projecten is FS.

**Het Kritieke Pad (Critical Path)**

Het kritieke pad is de langste reeks van afhankelijke taken door het project. Dit pad bepaalt de
minimale projectduur. Kenmerken van het kritieke pad:

- **Nul float**: Taken op het kritieke pad hebben geen speelruimte. Elke vertraging op het
kritieke pad vertraagt het hele project.
- **Langste pad**: Het is niet per se het pad met de meeste taken, maar het pad met de langste
totale duur.
- **Kan verschuiven**: Als er veranderingen optreden, kan een ander pad kritiek worden.

**Float en Slack**

Float (of slack) is de hoeveelheid tijd dat een taak kan worden uitgesteld zonder het project
te vertragen:

- **Total Float**: Hoeveel een taak kan schuiven zonder de einddatum te beïnvloeden
- **Free Float**: Hoeveel een taak kan schuiven zonder de volgende taak te beïnvloeden

Taken op het kritieke pad hebben per definitie een float van nul.

**Milestones**

Milestones zijn belangrijke punten in je planning — ze hebben geen duur (0 dagen) maar markeren
een significante gebeurtenis of deliverable. Voorbeelden:
- "Design goedgekeurd"
- "Testfase afgerond"
- "Go-live datum"

Plaats milestones op strategische punten zodat stakeholders eenvoudig de voortgang kunnen volgen.

**Praktische Tips voor Gantt Charts**

1. **Houd het overzichtelijk**: Te veel detail maakt het chart onleesbaar. Gebruik samengevouwen
groepen voor detail.
2. **Update regelmatig**: Een Gantt chart is alleen nuttig als het actueel is. Plan wekelijkse updates.
3. **Gebruik kleuren**: Markeer het kritieke pad, verschillende teams of statussen met kleuren.
4. **Toon de baseline**: Bewaar de originele planning als baseline zodat je afwijkingen kunt zien.
5. **Gebruik software**: Excel werkt voor kleine projecten, maar voor grotere projecten gebruik
MS Project, Monday.com of vergelijkbare tools.

**Veelgemaakte Fouten**

- Te optimistisch schatten — voeg altijd buffer toe
- Afhankelijkheden vergeten — elke taak moet minstens één voorganger hebben (behalve de eerste)
- Resource-conflicten negeren — twee taken kunnen niet parallel als dezelfde persoon ze doet
- Het chart niet updaten — een verouderd Gantt chart is erger dan geen chart`,
      keyTakeaways: [
        'Gantt charts visualize schedules and dependencies',
        'The critical path determines the minimum project duration',
        'There are four types of dependencies: FS, SS, FF, SF',
        'Update the Gantt regularly for an up-to-date view',
      ],
      keyTakeawaysNL: [
        'Gantt charts visualiseren planning en afhankelijkheden',
        'Het kritieke pad bepaalt de minimale projectduur',
        'Er zijn vier soorten afhankelijkheden: FS, SS, FF, SF',
        'Update de Gantt regelmatig voor actueel beeld',
      ],
      keyTakeawaysEN: [
        'Gantt charts visualize schedules and dependencies',
        'The critical path determines the minimum project duration',
        'There are four types of dependencies: FS, SS, FF, SF',
        'Update the Gantt chart regularly for an up-to-date view',
      ],
      resources: [
        { name: 'Gantt Chart Template Excel', type: 'XLSX', size: '245 KB', description: 'Excel template met automatische datumberekening' },
      ],
    },
    {
      id: 'pm-l13',
      title: 'Resource planning',
      titleNL: 'Resource planning',
      duration: '14:00',
      type: 'video',
      transcript: `De beste planning ter wereld faalt als je niet de juiste mensen en middelen hebt om het
werk uit te voeren. Resource planning is het proces van bepalen welke resources je nodig hebt,
wanneer je ze nodig hebt, en hoe je ze optimaal inzet.

**Wat zijn Resources?**

In projectmanagement zijn resources alle middelen die je nodig hebt om het project uit te voeren:

- **Mensen**: Teamleden, specialisten, externe consultants
- **Materialen**: Grondstoffen, componenten, licenties
- **Apparatuur**: Machines, servers, testomgevingen
- **Faciliteiten**: Kantoorruimte, vergaderruimten, werkplaatsen
- **Budget**: Financiële middelen (wordt apart behandeld in de volgende les)

**Het Resource Planning Proces**

Het proces bestaat uit drie hoofdstappen:

1. **Resource identificatie**: Welke resources heb je nodig per werkpakket?
2. **Resource schatting**: Hoeveel van elke resource heb je nodig?
3. **Resource toewijzing**: Wie doet wat en wanneer?

**De RACI Matrix**

De RACI matrix is een essentieel hulpmiddel om verantwoordelijkheden te verduidelijken. RACI staat voor:

| Letter | Betekenis | Beschrijving |
|--------|-----------|-------------|
| R | Responsible | Voert het werk uit |
| A | Accountable | Eindverantwoordelijke (slechts één per taak) |
| C | Consulted | Wordt geraadpleegd (tweerichtingscommunicatie) |
| I | Informed | Wordt geïnformeerd (eenrichtingscommunicatie) |

Regels voor de RACI matrix:
- Elke taak heeft precies één A (Accountable)
- Elke taak heeft minstens één R (Responsible)
- Te veel C's en I's duidt op bureaucratie
- Als iemand nergens R of A is, vraag je af of die persoon in het team hoort

**Resource Leveling vs Resource Smoothing**

**Resource Leveling**: Je past de planning aan om overbelasting op te lossen. Dit kan de
projectduur verlengen, maar zorgt dat niemand meer dan 100% belast is.

**Resource Smoothing**: Je verschuift taken binnen hun float om pieken af te vlakken, zonder
de einddatum te wijzigen. Dit werkt alleen als er voldoende float beschikbaar is.

| Aspect | Resource Leveling | Resource Smoothing |
|--------|------------------|-------------------|
| Doel | Overbelasting oplossen | Pieken afvlakken |
| Effect op einddatum | Kan verlengen | Geen effect |
| Gebruikt float? | Ja, en meer | Alleen beschikbare float |
| Wanneer gebruiken? | Bij overbelasting | Bij ongelijke verdeling |

**De 80% Regel**

Plan resources op maximaal 80% capaciteit. De overige 20% is buffer voor:

- Onverwachte problemen en storingen
- Vergaderingen en administratie
- Ziekte en verlof
- Ad-hoc verzoeken en onderbrekingen

Een fulltime medewerker van 40 uur per week plan je dus voor maximaal 32 productieve uren.

**Resource Histogrammen**

Een resource histogram toont de belasting van een resource over tijd in een staafdiagram.
Het maakt direct zichtbaar:
- Wanneer iemand overbelast is (boven de capaciteitslijn)
- Wanneer er onderbezetting is (ver onder de lijn)
- Waar resource leveling nodig is

**Veelgemaakte Fouten**

1. **100% planning**: Geen buffer inplannen leidt tot direct vertraging bij het eerste probleem.
2. **Multitasking overschatten**: Contextwisseling kost 20-40% productiviteit. Plan mensen
liefst op één project tegelijk.
3. **Skills negeren**: Niet elke developer kan elke taak. Houd rekening met specialisaties.
4. **Beschikbaarheid vergeten**: Vakanties, trainingen, deeltijd — check de daadwerkelijke
beschikbaarheid, niet de theoretische.
5. **Geen resource planning updaten**: Beschikbaarheid verandert continu. Update minstens
elke twee weken.`,
      keyTakeaways: [
        'Resource planning matches required with available capacity',
        'Resource leveling resolves overallocation',
        'The RACI matrix clarifies responsibilities',
        'Plan at 80% - keep buffer for the unexpected',
      ],
      keyTakeawaysNL: [
        'Resource planning matcht benodigde met beschikbare capaciteit',
        'Resource leveling lost overbelasting op',
        'De RACI matrix verduidelijkt verantwoordelijkheden',
        'Plan op 80% - houd buffer voor onverwachts',
      ],
      keyTakeawaysEN: [
        'Resource planning matches required capacity with available capacity',
        'Resource leveling resolves overallocation',
        'The RACI matrix clarifies responsibilities',
        'Plan at 80% - keep a buffer for the unexpected',
      ],
      resources: [
        { name: 'RACI Matrix Template', type: 'XLSX', size: '78 KB', description: 'Template voor verantwoordelijkheden' },
      ],
    },
    {
      id: 'pm-l14',
      title: 'Budget and cost estimation',
      titleNL: 'Budget en kostenraming',
      duration: '16:00',
      type: 'video',
      transcript: `"Hoeveel gaat dit kosten?" Het is waarschijnlijk de eerste vraag die je sponsor stelt. En het
is een van de moeilijkste vragen om goed te beantwoorden. In deze les leer je verschillende
schattingstechnieken en hoe je een projectbudget opbouwt.

**Kosten Categorieën**

Projectkosten vallen in verschillende categorieën:

- **Directe kosten**: Direct toe te wijzen aan het project (salarissen, materialen, licenties)
- **Indirecte kosten**: Gedeeld met andere projecten (kantoorhuur, managementoverhead)
- **Vaste kosten**: Veranderen niet met de projectomvang (licentiekosten, huurcontracten)
- **Variabele kosten**: Veranderen met de omvang (uren, materiaalverbruik)

**Schattingstechnieken**

Er zijn vier veelgebruikte technieken, elk met eigen voor- en nadelen:

**1. Analogous Estimating (Analoog schatten)**
Je gebruikt kosten van vergelijkbare eerdere projecten als basis.
- Voordeel: Snel, weinig data nodig
- Nadeel: Onnauwkeurig als projecten niet echt vergelijkbaar zijn
- Nauwkeurigheid: ±25-50%

**2. Parametric Estimating (Parametrisch schatten)**
Je gebruikt statistische relaties. Bijvoorbeeld: "€500 per vierkante meter" of "€200 per story point."
- Voordeel: Nauwkeuriger dan analoog, schaalbaar
- Nadeel: Vereist betrouwbare parameters
- Nauwkeurigheid: ±15-25%

**3. Bottom-up Estimating (Bottom-up schatten)**
Je schat elk werkpakket individueel en telt alles op.
- Voordeel: Meest nauwkeurig
- Nadeel: Tijdrovend, vereist gedetailleerde WBS
- Nauwkeurigheid: ±5-15%

**4. Three-Point Estimating (Driepuntsschatting)**
Je maakt drie schattingen per taak:
- **O** = Optimistisch (best case)
- **M** = Meest waarschijnlijk
- **P** = Pessimistisch (worst case)

De PERT-formule: **Schatting = (O + 4M + P) / 6**

| Techniek | Snelheid | Nauwkeurigheid | Wanneer gebruiken |
|----------|----------|---------------|-------------------|
| Analoog | Zeer snel | Laag (±35%) | Vroege fase, weinig detail |
| Parametrisch | Snel | Medium (±20%) | Bij beschikbare parameters |
| Bottom-up | Langzaam | Hoog (±10%) | Gedetailleerde planning |
| Driepunt | Medium | Hoog (±10%) | Bij onzekerheid |

**Het Projectbudget Opbouwen**

Een projectbudget is meer dan alleen de som van alle kostenramingen:

1. **Kostenramingen per werkpakket** (uit je WBS)
2. **+ Contingency Reserve** (5-15% voor bekende risico\'s)
3. **= Cost Baseline** (de referentielijn voor monitoring)
4. **+ Management Reserve** (5-10% voor onbekende risico\'s)
5. **= Totaal Projectbudget**

Het verschil tussen contingency en management reserve is belangrijk:
- **Contingency reserve**: Voor geïdentificeerde risico\'s (known unknowns). De PM mag dit inzetten.
- **Management reserve**: Voor onvoorziene situaties (unknown unknowns). Alleen de sponsor
kan dit vrijgeven.

**Earned Value Management (EVM)**

EVM is een krachtige techniek om kosten EN voortgang tegelijk te meten. De drie basiswaarden:

- **PV** (Planned Value): Hoeveel werk had er klaar moeten zijn?
- **EV** (Earned Value): Hoeveel werk IS er daadwerkelijk klaar?
- **AC** (Actual Cost): Hoeveel heeft het tot nu toe gekost?

Belangrijke indicatoren:
- **CPI** (Cost Performance Index) = EV / AC
  - CPI > 1 = onder budget
  - CPI < 1 = over budget
- **SPI** (Schedule Performance Index) = EV / PV
  - SPI > 1 = voor op schema
  - SPI < 1 = achter op schema

Een CPI van 0.85 betekent dat je voor elke euro die je uitgeeft slechts €0.85 aan waarde terugkrijgt.
Dat is een serieus probleem.

**Praktische Tips**

1. **Documenteer je aannames**: Elke schatting is gebaseerd op aannames. Schrijf ze op zodat je
later kunt verklaren waarom de schatting afwijkt.
2. **Betrek het team**: De mensen die het werk doen, schatten het werk het best.
3. **Gebruik historische data**: Kijk naar eerdere projecten. Bouw een database op van werkelijke
kosten versus schattingen.
4. **Vermijd anchoring bias**: Laat teamleden onafhankelijk schatten voordat je erover discussieert.
5. **Review regelmatig**: Herzie het budget bij elke fase-overgang en bij significante wijzigingen.`,
      keyTakeaways: [
        'Bottom-up is the most accurate but time-consuming',
        'Build in contingency and management reserve',
        'Earned Value Management measures both costs and progress',
        'Always document your assumptions',
      ],
      keyTakeawaysNL: [
        'Bottom-up is het nauwkeurigst maar tijdrovend',
        'Bouw contingency en management reserve in',
        'Earned Value Management meet kosten én voortgang',
        'Documenteer altijd je aannames',
      ],
      keyTakeawaysEN: [
        'Bottom-up is the most accurate but time-consuming',
        'Build in contingency and management reserve',
        'Earned Value Management measures both costs and progress',
        'Always document your assumptions',
      ],
      resources: [
        { name: 'Kostenraming Template', type: 'XLSX', size: '189 KB', description: 'Template met formules voor bottom-up raming' },
      ],
    },
    {
      id: 'pm-l15',
      title: 'Risk management',
      titleNL: 'Risicomanagement',
      duration: '22:00',
      type: 'video',
      transcript: `"Wat kan er misgaan?" is misschien wel de belangrijkste vraag die een projectmanager kan stellen.
Risicomanagement gaat over het proactief identificeren, analyseren en beheersen van onzekerheden
die je project kunnen beïnvloeden — zowel negatief als positief.

**Wat is een Risico?**

Een risico is een onzekere gebeurtenis of omstandigheid die, als het optreedt, een positief of negatief
effect heeft op ten minste één projectdoelstelling (scope, tijd, kosten of kwaliteit).

Belangrijk: een risico is NIET hetzelfde als een probleem. Een risico KAN optreden; een probleem IS
al opgetreden.

- **Bedreiging (threat)**: Een risico met negatief effect
- **Kans (opportunity)**: Een risico met positief effect

**Het Risicomanagement Proces**

Risicomanagement is een continu proces met vijf stappen:

**1. Risico-identificatie**
Alle mogelijke risico\'s in kaart brengen. Technieken:
- Brainstormsessies met het team
- Checklist-analyse (uit eerdere projecten)
- SWOT-analyse
- Expert interviews
- Delphi-techniek (anonieme expertinput)

**2. Kwalitatieve Risico-analyse**
Risico's prioriteren op basis van kans (probability) en impact:

| Kans \\ Impact | Laag | Medium | Hoog |
|----------------|------|--------|------|
| **Hoog** | Medium | Hoog | Kritiek |
| **Medium** | Laag | Medium | Hoog |
| **Laag** | Verwaarloosbaar | Laag | Medium |

De risicoscore = Kans × Impact. Focus je op de risico\'s met de hoogste scores.

**3. Kwantitatieve Risico-analyse**
Voor de belangrijkste risico\'s: bereken het financiële effect. Technieken:
- **EMV** (Expected Monetary Value) = Kans × Financieel Impact
- **Monte Carlo simulatie**: Simuleer duizenden scenario\'s om de verdeling van mogelijke
uitkomsten te zien
- **Beslisboomanalyse**: Visualiseer keuzes en hun mogelijke uitkomsten

Een risico met 30% kans en €100.000 impact heeft een EMV van €30.000. Dit bedrag reserveer
je als contingency.

**4. Risico-response Planning**

Voor bedreigingen heb je vier strategieën:

| Strategie | Beschrijving | Voorbeeld |
|-----------|-------------|-----------|
| **Vermijden** | Elimineer het risico | Kies bewezen technologie i.p.v. experimentele |
| **Overdragen** | Verschuif naar derde partij | Verzekering afsluiten, outsourcen |
| **Mitigeren** | Verklein kans of impact | Extra testen, training, backup systemen |
| **Accepteren** | Bewust het risico accepteren | Bij lage kans/impact, budget als buffer |

Voor kansen (positieve risico\'s):
- **Exploiteren**: Zorg dat de kans zich voordoet
- **Delen**: Partner met een andere partij
- **Vergroten**: Vergroot de kans of impact
- **Accepteren**: Pak het mee als het zich voordoet

**5. Risico-monitoring en -beheersing**
Continu monitoren, nieuwe risico\'s identificeren, en responses evalueren.

**Het Risicoregister**

Het risicoregister is HET centrale document voor risicomanagement. Het bevat voor elk risico:

- **ID**: Uniek nummer
- **Beschrijving**: Wat kan er gebeuren?
- **Categorie**: Technisch, organisatorisch, extern, projectmanagement
- **Kans**: Hoog/Medium/Laag of percentage
- **Impact**: Hoog/Medium/Laag of bedrag
- **Risicoscore**: Kans × Impact
- **Response strategie**: Vermijden/Overdragen/Mitigeren/Accepteren
- **Eigenaar**: Wie bewaakt dit risico?
- **Trigger**: Wanneer weten we dat het risico optreedt?
- **Status**: Open, in behandeling, gesloten

**Risk Appetite en Risk Tolerance**

- **Risk Appetite**: Hoeveel risico is de organisatie bereid te nemen? (Strategisch niveau)
- **Risk Tolerance**: De meetbare grens van risicoacceptatie. (Operationeel niveau)

Een startup heeft doorgaans een hogere risk appetite dan een bank. Dit beïnvloedt welke
risico-responses je kiest.

**Veelgemaakte Fouten**

1. **Risicomanagement als eenmalige activiteit**: Het is continu. Plan maandelijkse risk reviews.
2. **Alleen negatieve risico\'s zien**: Vergeet de kansen niet — ze kunnen je project versnellen
of verbeteren.
3. **Geen eigenaar toewijzen**: Een risico zonder eigenaar wordt door niemand bewaakt.
4. **Te laat beginnen**: Start risicomanagement in de initiatiefase, niet pas bij de uitvoering.
5. **Risico's verbergen**: Creëer een cultuur waarin het veilig is om risico\'s te benoemen.

**Praktische Tips**

- Houd risicosessies kort en gefocust (max 1 uur)
- Gebruik categorieën om volledigheid te waarborgen
- Koppel risico\'s aan je WBS — elk werkpakket kan risico\'s hebben
- Review het risicoregister bij elke statusmeeting
- Vier het als een risico NIET optreedt — dat betekent dat je mitigatie werkte`,
      keyTakeaways: [
        'Risks have both probability and impact - assess both',
        'Four response strategies: avoid, transfer, mitigate, accept',
        'The risk register is the central document',
        'Risk management is continuous, not a one-time activity',
      ],
      keyTakeawaysNL: [
        'Risico\'s hebben kans én impact - beide beoordelen',
        'Vier response strategieën: vermijden, overdragen, mitigeren, accepteren',
        'Het risicoregister is het centrale document',
        'Risicomanagement is continu, niet eenmalig',
      ],
      keyTakeawaysEN: [
        'Risks have both probability and impact - assess both',
        'Four response strategies: avoid, transfer, mitigate, accept',
        'The risk register is the central document',
        'Risk management is continuous, not a one-time activity',
      ],
      resources: [
        { name: 'Risicoregister Template', type: 'XLSX', size: '145 KB', description: 'Compleet template met risk scoring' },
      ],
    },
  ],
};

// ============================================
// MODULE 4: UITVOERING & MONITORING
// ============================================
const module4: Module = {
  order: 3,
  id: 'pm-m4',
  title: 'Module 4: Execution & Monitoring',
  titleNL: 'Module 4: Uitvoering & Monitoring',
  description: 'Team leadership, communication, Earned Value and change control.',
  descriptionNL: 'Teamleiderschap, communicatie, Earned Value en change control.',
  lessons: [
    {
      id: 'pm-l16',
      title: 'Leading and motivating teams',
      titleNL: 'Teams leiden en motiveren',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      transcript: `De beste planning ter wereld faalt als je team niet gemotiveerd en effectief 
samenwerkt. In deze les leer je hoe je teams leidt naar high performance.

**De Rol van de PM als Leider**

Als projectmanager leid je vaak mensen die niet direct aan jou rapporteren. Dit heet 
"leiderschap zonder formele autoriteit". Je kunt niet bevelen - je moet overtuigen, 
inspireren en faciliteren.

**Teamontwikkeling: Tuckman's Model**

Bruce Tuckman beschreef in 1965 vier fasen van teamontwikkeling:

**1. Forming (Vorming)**
- Team komt samen
- Mensen zijn beleefd en voorzichtig
- Veel onzekerheid over rollen en verwachtingen
- Afhankelijk van de leider

PM rol: Geef duidelijkheid, stel kaders, faciliteer kennismaking.

**2. Storming (Conflict)**
- Conflicten ontstaan
- Verschillende werkstijlen botsen
- Machtsstrijd om posities
- Frustratie over voortgang

PM rol: Faciliteer constructieve conflictoplossing, houd focus op gemeenschappelijk doel.

**3. Norming (Normering)**
- Team vindt zijn ritme
- Normen en afspraken ontstaan
- Vertrouwen groeit
- Samenwerking verbetert

PM rol: Versterk positieve patronen, documenteer werkafspraken.

**4. Performing (Presteren)**
- Team is high-performing
- Autonomie en eigenaarschap
- Problemen worden zelf opgelost
- Focus op resultaat

PM rol: Faciliteer, haal obstakels weg, geef ruimte.

**5. Adjourning (Afscheid)** - Later toegevoegd
- Project eindigt
- Team valt uiteen
- Afsluiting en reflectie

PM rol: Vier successen, faciliteer kennisoverdracht.

**Motivatietheorieën voor PM's**

**Herzberg\'s Twee-Factoren Theorie:**

Hygiëne factoren (voorkomen ontevredenheid):
- Salaris
- Werkomstandigheden
- Werkzekerheid
- Bedrijfsbeleid

Motivatoren (creëren tevredenheid):
- Erkenning
- Verantwoordelijkheid
- Groei en ontwikkeling
- Het werk zelf

Als PM focus je op motivatoren - je hebt vaak geen invloed op salaris.

**McGregor's Theory X en Y:**

Theory X: Mensen zijn lui en moeten gecontroleerd worden
Theory Y: Mensen zijn intrinsiek gemotiveerd en willen presteren

Agile en modern PM gaan uit van Theory Y.

**Praktische Motivatietechnieken**

1. **Geef autonomie**: Laat mensen zelf bepalen HOE
2. **Creëer purpose**: Verbind werk aan het grotere geheel
3. **Erken prestaties**: Publiek en specifiek
4. **Bied groei**: Leermogelijkheden en uitdaging
5. **Verwijder obstakels**: Maak hun werk makkelijker
6. **Wees eerlijk**: Transparantie over status en issues

**Conflictmanagement**

Conflicten zijn normaal en kunnen constructief zijn. De Thomas-Kilmann model beschrijft 
vijf stijlen:

**Competing (Doordrukken)**
- Eigen belang voorop
- Win-lose
- Gebruik bij: crisis, onpopulaire beslissingen

**Accommodating (Toegeven)**
- Ander's belang voorop
- Lose-win
- Gebruik bij: onbelangrijke issues, relatie behouden

**Avoiding (Vermijden)**
- Geen van beide
- Lose-lose
- Gebruik bij: emoties moeten afkoelen, triviale issues

**Compromising (Compromis)**
- Beide deels
- Half-win/half-win
- Gebruik bij: tijdsdruk, gelijkwaardige partijen

**Collaborating (Samenwerken)**
- Beide volledig
- Win-win
- Gebruik bij: belangrijke issues, tijd beschikbaar

De beste PM's schakelen flexibel tussen stijlen afhankelijk van de situatie.

**Virtuele Teams Leiden**

Met remote werk zijn virtuele teams de norm. Extra uitdagingen:

- Minder informele communicatie
- Tijdzoneverschillen
- Culturele verschillen
- Isolatie en disconnectie

Tips:
- Overcommuniceer bewust
- Gebruik video waar mogelijk
- Creëer virtuele koffiemomenten
- Documenteer meer dan bij co-located teams
- Respecteer tijdzones en werk-privé balans

**Samenvatting**

Effectief teamleiderschap:
- Begrijpt teamontwikkelingsfasen (Tuckman)
- Focust op intrinsieke motivatie
- Hanteert flexibele conflictstijlen
- Past aan voor virtuele context`,
      keyTakeaways: [
        'Teams go through phases: Forming, Storming, Norming, Performing',
        'Intrinsic motivation (autonomy, purpose, recognition) works better than extrinsic',
        'Conflict styles must fit the situation',
        'Virtual teams require extra attention to communication',
      ],
      keyTakeawaysNL: [
        'Teams doorlopen fasen: Forming, Storming, Norming, Performing',
        'Intrinsieke motivatie (autonomie, purpose, erkenning) werkt beter dan extrinsieke',
        'Conflictstijlen moeten passen bij de situatie',
        'Virtuele teams vragen extra aandacht voor communicatie',
      ],
      keyTakeawaysEN: [
        'Teams go through phases: Forming, Storming, Norming, Performing',
        'Intrinsic motivation (autonomy, purpose, recognition) works better than extrinsic',
        'Conflict styles must match the situation',
        'Virtual teams require extra attention to communication',
      ],
      resources: [
        {
          name: 'Team Development Assessment',
          type: 'PDF',
          size: '320 KB',
          description: 'Bepaal in welke fase je team zit',
        },
        {
          name: 'Conflict Style Questionnaire',
          type: 'PDF',
          size: '180 KB',
          description: 'Ontdek je dominante conflictstijl',
        },
      ],
    },
    {
      id: 'pm-l17',
      title: 'Stakeholder communication',
      titleNL: 'Stakeholder communicatie',
      duration: '16:00',
      type: 'video',
      videoUrl: '',
      transcript: `Communicatie is de lijm van projectmanagement. Studies tonen dat PM's 
90% van hun tijd besteden aan communicatie. In deze les leer je hoe je effectief 
communiceert met stakeholders.

**Het Communicatieplan**

Een communicatieplan beantwoordt:
- WIE moet wat weten?
- WAT moeten ze weten?
- WANNEER moeten ze het weten?
- HOE communiceren we?
- WIE is verantwoordelijk?

**Communicatiematrix**

| Stakeholder | Informatiebehoefte | Frequentie | Kanaal | Verantwoordelijke |
|-------------|-------------------|------------|--------|-------------------|
| Sponsor | Voortgang, issues, beslissingen | Wekelijks | 1-op-1 meeting | PM |
| Stuurgroep | Status, risico\'s, gates | Maandelijks | Presentatie | PM |
| Team | Taken, prioriteiten, updates | Dagelijks | Standup | PM/Team |
| Eindgebruikers | Voortgang, planning | Maandelijks | Nieuwsbrief | PMO |

**Soorten Projectcommunicatie**

**1. Statusrapportages**
Regelmatige updates over voortgang.

Inhoud:
- Overall status (rood/oranje/groen)
- Voortgang vs. planning
- Bereikte mijlpalen
- Issues en risico\'s
- Beslissingen nodig
- Vooruitblik komende periode

Tip: One-page summary voor management, details in bijlage.

**2. Stuurgroepvergaderingen**
Formele beslismomenten.

Voorbereiding:
- Agenda vooraf delen
- Beslispunten duidelijk formuleren
- Opties met voor/nadelen presenteren
- Aanbeveling geven

Tijdens:
- Houd het kort en to-the-point
- Focus op beslissingen, niet details
- Notuleer besluiten en acties

**3. Team Meetings**
Dagelijkse/wekelijkse teamafstemming.

Effectieve standups:
- Max 15 minuten
- Staand (vandaar de naam)
- Focus: wat gedaan, wat ga ik doen, blokkades
- Geen probleemoplossing (apart inplannen)

**4. Escalaties**
Wanneer issues buiten je mandaat vallen.

Goede escalatie bevat:
- Probleem beschrijving
- Impact als niet opgelost
- Opties met consequenties
- Jouw aanbeveling
- Gevraagde actie/beslissing

Nooit escaleren zonder aanbeveling!

**5. Informele Communicatie**
De koffieautomaat gesprekken.

Onderschat dit niet:
- Bouwt relaties
- Vangt signalen vroeg op
- Lost kleine issues snel op

Bij remote: bewust informele momenten creëren.

**Communicatiestijlen Aanpassen**

Verschillende stakeholders hebben verschillende behoeften:

**Executives:**
- Bottom line first
- One-page summaries
- Focus op impact en beslissingen
- Geen technische details

**Technische Stakeholders:**
- Details waarderen
- Feiten en data
- Technische accuraatheid

**Eindgebruikers:**
- Impact op hun werk
- Wanneer en wat verandert
- Training en ondersteuning

**Moeilijke Boodschappen Brengen**

Soms moet je slecht nieuws brengen. Tips:

1. **Wees eerlijk en direct**: Geen draaien
2. **Neem verantwoordelijkheid**: Geen blame game
3. **Kom met een plan**: Niet alleen het probleem
4. **Timing**: Niet op vrijdagmiddag, niet vlak voor vakantie
5. **Face-to-face**: Voor belangrijk nieuws, niet per email

Template:
"We hebben een probleem met [X]. De impact is [Y]. 
Dit komt door [Z]. Ons plan om dit op te lossen is [A]. 
We hebben [B] nodig van jullie."

**Communicatie Anti-patterns**

Vermijd:
- **Overload**: Teveel informatie, niemand leest het
- **Surprise**: Stakeholders verrassen met slecht nieuws
- **One-way**: Alleen zenden, niet luisteren
- **Jargon**: Technische taal naar business stakeholders
- **Assuming**: Aannemen dat iedereen het weet

**Samenvatting**

Effectieve stakeholder communicatie:
- Is gepland in een communicatiematrix
- Past aan per stakeholder
- Is proactief, niet reactief
- Brengt moeilijke boodschappen eerlijk
- Luistert evenveel als zendt`,
      keyTakeaways: [
        'PMs spend 90% of their time on communication',
        'A communication plan defines who-what-when-how',
        'Adapt your style per stakeholder type',
        'Deliver bad news honestly, with a plan',
      ],
      keyTakeawaysNL: [
        'PM\'s besteden 90% van hun tijd aan communicatie',
        'Een communicatieplan definieert wie-wat-wanneer-hoe',
        'Pas je stijl aan per stakeholder type',
        'Breng slecht nieuws eerlijk, met een plan',
      ],
      keyTakeawaysEN: [
        'PMs spend 90% of their time on communication',
        'A communication plan defines who-what-when-how',
        'Adapt your style to each stakeholder type',
        'Deliver bad news honestly, with a plan',
      ],
      resources: [
        {
          name: 'Communicatieplan Template',
          type: 'XLSX',
          size: '125 KB',
          description: 'Template voor communicatieplanning',
        },
        {
          name: 'Status Report Template',
          type: 'DOCX',
          size: '95 KB',
          description: 'One-page statusrapport template',
        },
      ],
    },
    {
      id: 'pm-l18',
      title: 'Progress monitoring with Earned Value',
      titleNL: 'Voortgangsbewaking met Earned Value',
      duration: '22:00',
      type: 'video',
      videoUrl: '',
      transcript: `"Hoever zijn we?" en "Hoeveel hebben we uitgegeven?" zijn twee verschillende 
vragen. Earned Value Management (EVM) combineert beide voor een objectief beeld van 
projectprestatie.

**Het Probleem met Traditionele Tracking**

Stel: Je hebt €50.000 budget en bent halverwege de tijd.
- Uitgegeven: €25.000
- Conclusie: Perfect on track?

Niet zo snel! Wat als je maar 30% van het werk hebt gedaan?
Dan heb je €25.000 uitgegeven voor 30% van het werk - je bent over budget!

**De Drie Kernmetingen van EVM**

**1. Planned Value (PV)** - Budgeted Cost of Work Scheduled
Hoeveel werk hadden we gepland te doen op dit moment?
= Budget × % gepland werk

**2. Earned Value (EV)** - Budgeted Cost of Work Performed
Hoeveel werk hebben we daadwerkelijk gedaan, gewaardeerd tegen budget?
= Budget × % werkelijk voltooid werk

**3. Actual Cost (AC)** - Actual Cost of Work Performed
Hoeveel hebben we daadwerkelijk uitgegeven?
= Echte kosten

**Voorbeeld**

Project: €100.000 budget, 10 maanden
Na 5 maanden:
- PV: €50.000 (50% tijd = 50% werk gepland)
- EV: €40.000 (slechts 40% werk gedaan)
- AC: €55.000 (€55.000 uitgegeven)

Wat vertelt dit?
- We zijn achter op schema (EV < PV)
- We zijn over budget (AC > EV)

**Variantie Analyse**

**Schedule Variance (SV)** = EV - PV
- Positief: Voor op schema
- Negatief: Achter op schema
- Voorbeeld: €40.000 - €50.000 = -€10.000 (achter)

**Cost Variance (CV)** = EV - AC
- Positief: Onder budget
- Negatief: Over budget
- Voorbeeld: €40.000 - €55.000 = -€15.000 (over budget)

**Performance Indices**

**Schedule Performance Index (SPI)** = EV / PV
- > 1: Voor op schema
- < 1: Achter op schema
- = 1: Op schema
- Voorbeeld: €40.000 / €50.000 = 0.8 (we werken op 80% van gepland tempo)

**Cost Performance Index (CPI)** = EV / AC
- > 1: Onder budget
- < 1: Over budget
- = 1: Op budget
- Voorbeeld: €40.000 / €55.000 = 0.73 (we krijgen maar €0.73 waarde per €1 uitgegeven)

**Forecasting**

EVM kan ook voorspellen:

**Estimate at Completion (EAC)** - Verwachte totale kosten

Formule (als huidige trend doorzet):
EAC = BAC / CPI = €100.000 / 0.73 = €136.986

Het project gaat €36.986 over budget als we zo doorgaan!

**Estimate to Complete (ETC)** - Nog te besteden
ETC = EAC - AC = €136.986 - €55.000 = €81.986

**Variance at Completion (VAC)** - Verwachte afwijking
VAC = BAC - EAC = €100.000 - €136.986 = -€36.986

**Grafische Weergave**

De S-Curve visualiseert EVM:
- X-as: Tijd
- Y-as: Kosten/Waarde
- Geplande curve (PV)
- Earned Value curve (EV)
- Actual Cost curve (AC)

Je ziet direct waar lijnen uit elkaar lopen.

**EVM Implementeren**

1. **Maak een baseline**: Goedgekeurd budget en planning
2. **Bepaal % complete methode**: Hoe meet je voortgang?
   - 0/100: Pas complete als 100% af
   - 50/50: 50% bij start, 50% bij einde
   - Milestone: % per bereikte mijlpaal
   - % physical complete: Expert inschatting
3. **Meet regelmatig**: Wekelijks of maandelijks
4. **Analyseer varianties**: Begrijp waarom
5. **Neem actie**: Bijsturen waar nodig

**Beperkingen van EVM**

- Meet geen kwaliteit (je kunt "klaar" zijn met slechte kwaliteit)
- Vereist gedetailleerde baseline
- Kan complex worden bij grote projecten
- % complete is vaak subjectief

**Wanneer EVM Gebruiken?**

EVM is vooral waardevol bij:
- Grote, complexe projecten
- Contracten met earned value eisen (overheid)
- Projecten met budget/schedule kritisch
- Portfolio niveau monitoring

Voor kleine projecten: vaak te veel overhead.

**Samenvatting**

Earned Value Management:
- Combineert scope, tijd en kosten in één meting
- PV, EV, AC zijn de drie kernmetingen
- SV/SPI meet schedule performance
- CV/CPI meet cost performance
- Forecasting voorspelt eindresultaat`,
      keyTakeaways: [
        'EVM combines scope, time and costs in one objective measurement',
        'EV = what you have earned, not what you have spent',
        'CPI < 1 means you are spending more than planned per unit of work',
        'EAC predicts total costs if the trend continues',
      ],
      keyTakeawaysNL: [
        'EVM combineert scope, tijd en kosten in één objectieve meting',
        'EV = wat je hebt verdiend, niet wat je hebt uitgegeven',
        'CPI < 1 betekent dat je meer uitgeeft dan gepland per eenheid werk',
        'EAC voorspelt de totale kosten als de trend doorzet',
      ],
      keyTakeawaysEN: [
        'EVM combines scope, time, and cost into one objective measurement',
        'EV = what you have earned, not what you have spent',
        'CPI < 1 means you are spending more than planned per unit of work',
        'EAC forecasts total costs if the current trend continues',
      ],
      resources: [
        {
          name: 'EVM Calculator',
          type: 'XLSX',
          size: '145 KB',
          description: 'Spreadsheet met alle EVM berekeningen',
        },
        {
          name: 'EVM Formule Cheat Sheet',
          type: 'PDF',
          size: '95 KB',
          description: 'Alle formules op één pagina',
        },
      ],
    },
    {
      id: 'pm-l19',
      title: 'Change Control',
      titleNL: 'Change Control',
      duration: '14:00',
      type: 'video',
      videoUrl: '',
      transcript: `Verandering is onvermijdelijk in projecten. Change control zorgt dat 
wijzigingen beheerst worden doorgevoerd zonder dat je project ontspoort.

**Waarom Change Control?**

Zonder change control:
- Scope groeit ongecontroleerd (scope creep)
- Budget en planning lopen uit
- Kwaliteit lijdt onder haastwerk
- Niemand weet wat de "echte" requirements zijn

Met change control:
- Wijzigingen zijn overwogen beslissingen
- Impact is geanalyseerd
- Stakeholders zijn geïnformeerd
- Baseline blijft actueel

**Het Change Control Proces**

**1. Change Request Indienen**
Iedereen kan een wijziging aanvragen via een formeel verzoek:
- Wat is de gewenste wijziging?
- Waarom is het nodig?
- Wie vraagt het aan?

**2. Impact Analyse**
De PM (of change manager) analyseert:
- Impact op scope
- Impact op planning
- Impact op budget
- Impact op risico\'s
- Impact op kwaliteit
- Afhankelijkheden

**3. Review en Beslissing**
Afhankelijk van de impact:
- Kleine wijzigingen: PM beslist
- Medium: Change Control Board
- Grote: Sponsor of Stuurgroep

Opties:
- Goedkeuren
- Afwijzen
- Meer informatie nodig
- Uitstellen

**4. Implementatie**
Bij goedkeuring:
- Baseline updaten
- Planning aanpassen
- Team informeren
- Wijziging doorvoeren

**5. Verificatie**
- Is de wijziging correct doorgevoerd?
- Zijn alle documenten geüpdatet?
- Zijn stakeholders geïnformeerd?

**Het Change Control Board (CCB)**

Het CCB is een groep die beslist over wijzigingen:
- Typisch: PM, sponsor, key stakeholders, architect
- Komt regelmatig samen (wekelijks bij actieve projecten)
- Heeft duidelijke beslissingscriteria

**Soorten Wijzigingen**

**Scope Change**: Toevoegen of verwijderen van functionaliteit
**Schedule Change**: Wijziging in planning
**Budget Change**: Wijziging in kosten
**Resource Change**: Andere mensen of middelen

**De Change Request Form**

Een standaard formulier bevat:
- CR nummer en datum
- Aanvrager
- Beschrijving van de wijziging
- Reden/business justification
- Impact analyse (PM vult in)
- Beslissing en rationale
- Goedkeurders

**Gold Plating Voorkomen**

Gold plating = extras toevoegen die niet gevraagd zijn.

"De klant zal dit vast ook willen..."
"Het is makkelijk om even toe te voegen..."

Dit is net zo schadelijk als scope creep van buitenaf:
- Kost tijd en budget
- Verhoogt risico
- Klant betaalt voor iets dat niet gevraagd is

Regel: Niets toevoegen zonder formeel verzoek.

**Omgaan met Weerstand**

Stakeholders vinden change control soms bureaucratisch.

Tips:
- Leg het waarom uit: bescherming, niet obstructie
- Maak het proces licht waar mogelijk
- Snelle beslissingen voor kleine wijzigingen
- Toon de waarde: voorkomen van projectfalen

**Samenvatting**

Effectief change control:
- Dwingt overwogen beslissingen af
- Analyseert impact vooraf
- Houdt de baseline actueel
- Voorkomt scope creep en gold plating
- Is proportioneel aan projectgrootte`,
      keyTakeaways: [
        'Change control is protection, not bureaucracy',
        'Every change goes through: request, analysis, decision, implementation, verification',
        'The Change Control Board decides on significant changes',
        'Gold plating (unsolicited extras) is just as harmful as scope creep',
      ],
      keyTakeawaysNL: [
        'Change control is bescherming, niet bureaucratie',
        'Elke wijziging doorloopt: request, analyse, beslissing, implementatie, verificatie',
        'Het Change Control Board beslist over significante wijzigingen',
        'Gold plating (ongevraagde extras) is net zo schadelijk als scope creep',
      ],
      keyTakeawaysEN: [
        'Change control is protection, not bureaucracy',
        'Every change goes through: request, analysis, decision, implementation, verification',
        'The Change Control Board decides on significant changes',
        'Gold plating (unsolicited extras) is just as harmful as scope creep',
      ],
      resources: [
        {
          name: 'Change Request Template',
          type: 'DOCX',
          size: '125 KB',
          description: 'Standaard formulier voor wijzigingsverzoeken',
        },
        {
          name: 'Change Log Template',
          type: 'XLSX',
          size: '85 KB',
          description: 'Register voor alle wijzigingen',
        },
      ],
    },
    {
      id: 'pm-l20',
      title: 'Quiz: Execution & Monitoring',
      titleNL: 'Quiz: Uitvoering & Monitoring',
      duration: '15:00',
      type: 'quiz',
      quiz: [
        {
          id: 'q-m4-1',
          question: 'In welke fase van Tuckman\'s model ontstaan de meeste conflicten?',
          options: [
            'Forming',
            'Storming',
            'Norming',
            'Performing',
          ],
          correctAnswer: 1,
          explanation: 'In de Storming fase botsen werkstijlen en ontstaan conflicten over rollen en posities. Dit is een normale fase in teamontwikkeling.',
        },
        {
          id: 'q-m4-2',
          question: 'Wat is de beste conflictstijl voor een belangrijk issue waarbij je tijd hebt?',
          options: [
            'Competing',
            'Avoiding',
            'Compromising',
            'Collaborating',
          ],
          correctAnswer: 3,
          explanation: 'Collaborating (samenwerken) leidt tot win-win en is ideaal voor belangrijke issues wanneer je de tijd hebt om samen te werken naar een oplossing.',
        },
        {
          id: 'q-m4-3',
          question: 'EV = €40.000, PV = €50.000, AC = €55.000. Wat is de Schedule Variance?',
          options: [
            '+€10.000',
            '-€10.000',
            '+€15.000',
            '-€15.000',
          ],
          correctAnswer: 1,
          explanation: 'Schedule Variance (SV) = EV - PV = €40.000 - €50.000 = -€10.000. Negatief betekent achter op schema.',
        },
        {
          id: 'q-m4-4',
          question: 'Een CPI van 0.8 betekent:',
          options: [
            'Je krijgt €0.80 waarde voor elke €1 uitgegeven',
            'Je bent 80% klaar met het project',
            'Je bent 20% onder budget',
            'Je bent 80% voor op schema',
          ],
          correctAnswer: 0,
          explanation: 'CPI = EV/AC. Een CPI van 0.8 betekent dat je voor elke €1 die je uitgeeft, slechts €0.80 aan waarde krijgt. Je bent over budget.',
        },
        {
          id: 'q-m4-5',
          question: 'Wat is "gold plating" in projectmanagement?',
          options: [
            'Het project succesvol afronden',
            'Extra features toevoegen die niet gevraagd zijn',
            'Premium klanten speciale behandeling geven',
            'Kwaliteitsstandaarden overtreffen',
          ],
          correctAnswer: 1,
          explanation: 'Gold plating is het toevoegen van extra functionaliteit of features die niet door de klant zijn gevraagd. Dit is net zo schadelijk als scope creep.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 5: AFSLUITING
// ============================================
const module5: Module = {
  order: 4,
  id: 'pm-m5',
  title: 'Module 5: Closure',
  titleNL: 'Module 5: Afsluiting',
  description: 'Formal acceptance, lessons learned and administrative closure.',
  descriptionNL: 'Formele acceptatie, lessons learned en administratieve afsluiting.',
  lessons: [
    {
      id: 'pm-l21',
      title: 'The importance of project closure',
      titleNL: 'Het belang van projectafsluiting',
      duration: '12:00',
      type: 'video',
      videoUrl: '',
      transcript: `Veel projectmanagers haasten door de afsluitingsfase of slaan hem zelfs 
over. Dit is een grote fout. In deze les leer je waarom goede afsluiting cruciaal is.

**Waarom Afsluiting Wordt Verwaarloosd**

- Het "echte werk" is gedaan
- Team is al bezig met volgende project
- Afsluiting voelt als administratie
- Succes spreekt voor zich (denken we)

**De Kosten van Slechte Afsluiting**

**Zombie Projecten**
Projecten die nooit formeel eindigen:
- Resources blijven gealloceerd
- Kosten blijven lopen
- Onduidelijkheid over status

**Verloren Kennis**
Zonder lessons learned:
- Dezelfde fouten worden herhaald
- Best practices gaan verloren
- Nieuwe PM's beginnen van nul

**Ontevreden Stakeholders**
Zonder formele afsluiting:
- Onduidelijkheid over wat is opgeleverd
- Verwachtingen niet gemanaged
- Relaties beschadigd

**Financiële Risico's**
Zonder administratieve afsluiting:
- Open facturen
- Niet-afgesloten contracten
- Onverwachte claims later

**De Doelen van Projectafsluiting**

1. **Formele acceptatie** van deliverables
2. **Vrijgeven** van resources
3. **Afsluiten** van contracten en financiën
4. **Documenteren** van lessons learned
5. **Archiveren** van projectdocumentatie
6. **Vieren** van succes
7. **Voorbereiden** op benefits realization

**Wanneer Sluit je Af?**

**Normaal**: Na oplevering van alle deliverables
**Voortijdig**: Als project wordt gestopt (nog belangrijker om goed af te sluiten!)
**Gefaseerd**: Na elke fase of release

**Afsluiting bij Voortijdige Beëindiging**

Soms wordt een project gestopt:
- Business case niet meer valide
- Prioriteiten verschuiven
- Budget wordt ingetrokken

Dit is GEEN mislukking - het is goede governance.

Bij vroegtijdige stop:
- Documenteer redenen
- Verzamel partial lessons learned
- Sluit contracten netjes af
- Communiceer duidelijk naar stakeholders

**Samenvatting**

Projectafsluiting:
- Is net zo belangrijk als andere fasen
- Voorkomt zombie projecten en verloren kennis
- Beschermt financieel en juridisch
- Zorgt voor goede relaties
- Is ook nodig bij voortijdig stoppen`,
      keyTakeaways: [
        'Closure is often neglected but is crucial',
        'Zombie projects consume resources and cause confusion',
        'Lessons learned prevent repetition of mistakes',
        'Even cancelled projects must be properly closed',
      ],
      keyTakeawaysNL: [
        'Afsluiting wordt vaak verwaarloosd maar is cruciaal',
        'Zombie projecten kosten resources en veroorzaken verwarring',
        'Lessons learned voorkomen herhaling van fouten',
        'Ook gestopte projecten moeten goed worden afgesloten',
      ],
      keyTakeawaysEN: [
        'Closure is often neglected but is crucial',
        'Zombie projects consume resources and cause confusion',
        'Lessons learned prevent repeating mistakes',
        'Even terminated projects must be properly closed',
      ],
    },
    {
      id: 'pm-l22',
      title: 'Formal acceptance and handover',
      titleNL: 'Formele acceptatie en overdracht',
      duration: '14:00',
      type: 'video',
      videoUrl: '',
      transcript: `Formele acceptatie is het moment waarop de opdrachtgever bevestigt dat 
de deliverables voldoen aan de eisen. Zonder dit moment is je project nooit echt "klaar".

**Wat is Formele Acceptatie?**

Formele acceptatie is:
- Schriftelijke bevestiging
- Van geautoriseerde persoon
- Dat deliverables voldoen aan criteria
- Die vooraf waren afgesproken

**Acceptatiecriteria**

Acceptatiecriteria moeten vooraf zijn gedefinieerd:
- In requirements documenten
- In contracten
- In product descriptions

Voorbeelden:
- "Alle use cases werken zoals beschreven"
- "Performance test toont <2 seconden response time"
- "Geen kritieke of hoge defects open"
- "Documentatie is compleet en goedgekeurd"

**Het Acceptatieproces**

**1. Deliverable Presenteren**
- Demonstreer dat het werkt
- Toon documentatie
- Toon testresultaten

**2. Acceptatiecriteria Doorlopen**
- Systematisch elk criterium checken
- Bevindingen documenteren
- Eventuele afwijkingen bespreken

**3. Beslissing**
Drie uitkomsten mogelijk:
- **Volledig geaccepteerd**: Alles OK
- **Conditioneel geaccepteerd**: OK met voorwaarden (minor issues oplossen)
- **Afgewezen**: Niet OK, terug naar development

**4. Sign-off Vastleggen**
- Formeel document
- Handtekening van bevoegde persoon
- Datum
- Eventuele voorwaarden

**Overdracht naar Operations**

Na acceptatie wordt het systeem/product overgedragen:

**Aan Wie?**
- Operations/Beheer team
- Support team
- Business owner

**Wat Overdragen?**
- Het product zelf
- Documentatie (technisch en gebruiker)
- Configuratie informatie
- Wachtwoorden en toegang
- Contactgegevens voor escalatie
- Bekend issues lijst
- Onderhoudscontract details

**Kennisoverdracht**
- Training voor beheerders
- Walkthrough van architectuur
- Handover meeting
- Hypercare periode (tijdelijke ondersteuning)

**Contractuele Afsluiting**

Bij externe leveranciers:
- Alle contractuele verplichtingen voldaan?
- Alle facturen betaald/ontvangen?
- Garantieperiode afspraken duidelijk?
- Eigendomsrechten geregeld?

**Tips voor Soepele Acceptatie**

1. **Geen verrassingen**: Stakeholders weten wat ze krijgen
2. **Test vooraf**: Zelf acceptatiecriteria doorlopen
3. **Documenteer volledig**: Alle bewijzen klaar
4. **Plan tijd**: Acceptatie kost tijd, plan het in
5. **Manage verwachtingen**: Duidelijk over scope

**Samenvatting**

Formele acceptatie:
- Is schriftelijke bevestiging dat deliverables voldoen
- Gebruikt vooraf gedefinieerde acceptatiecriteria
- Kan volledig, conditioneel of afgewezen zijn
- Wordt gevolgd door overdracht naar operations`,
      keyTakeaways: [
        'Acceptance criteria must be defined in advance',
        'Acceptance is formal with signature from an authorized person',
        'Handover includes product, documentation and knowledge',
        'Plan for acceptance - it takes time',
      ],
      keyTakeawaysNL: [
        'Acceptatiecriteria moeten vooraf zijn gedefinieerd',
        'Acceptatie is formeel met handtekening van bevoegde persoon',
        'Overdracht omvat product, documentatie en kennis',
        'Plan acceptatie in - het kost tijd',
      ],
      keyTakeawaysEN: [
        'Acceptance criteria must be defined in advance',
        'Acceptance is formal with a signature from an authorized person',
        'Handover includes the product, documentation, and knowledge',
        'Schedule acceptance - it takes time',
      ],
      resources: [
        {
          name: 'Acceptance Certificate Template',
          type: 'DOCX',
          size: '85 KB',
          description: 'Template voor formele acceptatie',
        },
        {
          name: 'Handover Checklist',
          type: 'PDF',
          size: '125 KB',
          description: 'Checklist voor overdracht naar operations',
        },
      ],
    },
    {
      id: 'pm-l23',
      title: 'Lessons Learned',
      titleNL: 'Lessons Learned',
      duration: '16:00',
      type: 'video',
      videoUrl: '',
      transcript: `Lessons learned is het proces van systematisch reflecteren op het project 
om inzichten vast te leggen voor de toekomst. Het is een van de meest waardevolle maar 
minst uitgevoerde projectactiviteiten.

**Waarom Lessons Learned?**

Zonder lessons learned:
- Dezelfde fouten worden herhaald
- Best practices blijven onbekend
- Elke PM begint van nul
- Organisatie leert niet

Met effectieve lessons learned:
- Fouten worden voorkomen
- Successen worden herhaald
- Kennis wordt geborgd
- Projecten worden steeds beter

**Wanneer Verzamelen?**

**Tijdens het project:**
- Na belangrijke mijlpalen
- Na significante issues
- Bij retrospectives (Agile)

**Bij afsluiting:**
- Formele lessons learned sessie
- Met alle key stakeholders
- Terwijl het nog vers is

Wacht niet tot het einde - dan zijn mensen vertrokken en details vergeten.

**De Lessons Learned Sessie**

**Voorbereiding:**
- Plan 2-4 uur
- Nodig alle key contributors
- Stuur vooraf reflectievragen
- Neutrale facilitator (niet de PM zelf idealiter)

**Structuur:**
1. Context herhalen (doelen, scope, uitdagingen)
2. Wat ging goed? (successen, sterke punten)
3. Wat kon beter? (problemen, uitdagingen)
4. Wat zouden we anders doen?
5. Aanbevelingen voor toekomstige projecten

**Facilitatietechnieken:**

**Start/Stop/Continue:**
- Start: Wat moeten we gaan doen?
- Stop: Wat moeten we stoppen?
- Continue: Wat moeten we blijven doen?

**4L's:**
- Liked: Wat vond je prettig?
- Learned: Wat heb je geleerd?
- Lacked: Wat miste je?
- Longed for: Wat had je gewild?

**Timeline:**
Doorloop het project chronologisch en bespreek hoogte- en dieptepunten.

**Veilige Omgeving Creëren**

Lessons learned werkt alleen als mensen eerlijk zijn:
- Geen blame: Focus op systeem, niet personen
- Vertrouwelijkheid waar nodig
- Leider geeft het goede voorbeeld
- Alle perspectieven zijn waardevol

**Goede Lessons Learned Formuleren**

Slecht: "Communicatie was niet goed"
Goed: "Wekelijkse status meetings met de sponsor hadden eerder moeten starten. 
      Door gebrek aan early alignment ontstond in fase 3 een conflict over 
      prioriteiten dat 2 weken vertraging veroorzaakte."

Een goede lesson bevat:
- Context: Wat was de situatie?
- Issue/Succes: Wat ging goed of fout?
- Oorzaak: Waarom?
- Aanbeveling: Wat te doen in de toekomst?

**Lessons Learned Documenteren**

Het rapport bevat:
- Project samenvatting
- Successen en wat werkte
- Uitdagingen en wat niet werkte
- Aanbevelingen per categorie
- Bijlagen (data, metrics)

Categorieën:
- Planning & Scope
- Stakeholder Management
- Team & Resources
- Communicatie
- Risicomanagement
- Tools & Processen

**Lessons Learned Gebruiken**

Het grootste probleem: rapporten verdwijnen in een la.

Oplossingen:
- **Centrale repository**: Doorzoekbaar, toegankelijk
- **Onboarding**: Nieuwe PM's lezen relevante lessons
- **Projectstart checklist**: "Welke lessons zijn relevant?"
- **PMO eigenaarschap**: Iemand is verantwoordelijk
- **Periodieke reviews**: Kwartaallijkse thema-analyse

**Samenvatting**

Lessons learned:
- Voorkomt herhaling van fouten
- Wordt verzameld tijdens én aan einde van project
- Vereist een veilige, blame-free omgeving
- Moet specifiek en actionable zijn
- Is alleen waardevol als het wordt gebruikt`,
      keyTakeaways: [
        'Collect lessons learned during and at the end of the project',
        'Create a blame-free environment for honest feedback',
        'Good lessons are specific with context, cause and recommendation',
        'Lessons learned are worthless if they are not used',
      ],
      keyTakeawaysNL: [
        'Verzamel lessons learned tijdens én aan het einde van het project',
        'Creëer een blame-free omgeving voor eerlijke feedback',
        'Goede lessons zijn specifiek met context, oorzaak en aanbeveling',
        'Lessons learned zijn waardeloos als ze niet worden gebruikt',
      ],
      keyTakeawaysEN: [
        'Collect lessons learned during and at the end of the project',
        'Create a blame-free environment for honest feedback',
        'Good lessons are specific with context, cause, and recommendation',
        'Lessons learned are worthless if they are not used',
      ],
      resources: [
        {
          name: 'Lessons Learned Template',
          type: 'DOCX',
          size: '145 KB',
          description: 'Template voor lessons learned rapport',
        },
        {
          name: 'Facilitatie Gids',
          type: 'PDF',
          size: '280 KB',
          description: 'Gids voor het faciliteren van LL sessies',
        },
      ],
    },
    {
      id: 'pm-l24',
      title: 'Administrative closure and archiving',
      titleNL: 'Administratieve afsluiting en archivering',
      duration: '10:00',
      type: 'video',
      videoUrl: '',
      transcript: `De administratieve afsluiting is het "schoonmaken" na het project. 
Het lijkt saai, maar voorkomt problemen later.

**Financiële Afsluiting**

**Facturen:**
- Alle leveranciersfacturen ontvangen en betaald
- Alle klantfacturen verstuurd en geïnd
- Openstaande PO's gesloten

**Budgetrapportage:**
- Final cost report
- Budget vs. actual analyse
- Uitleg van varianties

**Reserves:**
- Niet-gebruikte contingency terug naar organisatie
- Documenteer waarom wel/niet gebruikt

**Resource Vrijgave**

**Mensen:**
- Formele communicatie dat project eindigt
- Performance feedback voor teamleden
- Dank en erkenning
- Terug naar resourcepool of lijnmanager

**Faciliteiten:**
- Projectruimtes vrijgeven
- Equipment teruggeven
- Toegangen intrekken

**Tools:**
- Software licenties beëindigen of overdragen
- Accounts sluiten of overdragen

**Documentatie Archivering**

Wat archiveren?
- Project charter en PID
- Planning documenten
- Requirements en design
- Testdocumentatie
- Communicatie (belangrijke emails, besluiten)
- Financiële administratie
- Lessons learned
- Final report

Waar archiveren?
- Centrale project repository
- Volgens organisatie retentiebeleid
- Doorzoekbaar voor toekomstige projecten

Hoe lang bewaren?
- Afhankelijk van organisatiebeleid en regulering
- Typisch: 5-10 jaar
- Contracten soms langer

**Project Closure Report**

Het eindrapport vat alles samen:

1. **Project Overview**: Doelen, scope, aanpak
2. **Deliverables**: Wat is opgeleverd
3. **Performance**: Budget, schedule, kwaliteit
4. **Issues & Changes**: Significante gebeurtenissen
5. **Lessons Learned**: Samenvatting
6. **Open Items**: Wat wordt overgedragen
7. **Recommendations**: Voor operations en toekomstige projecten

**Checklist voor Afsluiting**

□ Alle deliverables geaccepteerd
□ Overdracht naar operations compleet
□ Financiën afgesloten
□ Contracten afgesloten
□ Resources vrijgegeven
□ Lessons learned gedocumenteerd
□ Documentatie gearchiveerd
□ Final report geschreven
□ Succes gevierd!

**Vieren van Succes**

Vergeet niet te vieren!
- Team lunch of borrel
- Erkenning in organisatie
- Persoonlijke dank
- Publieke erkenning van bijdragen

Dit is goed voor:
- Team morale
- Organisatiecultuur
- Relaties voor toekomstige samenwerking

**Samenvatting**

Administratieve afsluiting:
- Sluit financiën, contracten en resources af
- Archiveert documentatie voor de toekomst
- Produceert een final project report
- Eindigt met viering van succes`,
      keyTakeaways: [
        'Financial closure prevents outstanding invoices and claims',
        'Resources (people, tools, facilities) must be formally released',
        'Archive documentation according to organizational policy',
        'Don\'t forget to celebrate - it is good for team and culture',
      ],
      keyTakeawaysNL: [
        'Financiële afsluiting voorkomt openstaande facturen en claims',
        'Resources (mensen, tools, faciliteiten) moeten formeel worden vrijgegeven',
        'Documentatie archiveren volgens organisatiebeleid',
        'Vergeet niet te vieren - het is goed voor team en cultuur',
      ],
      keyTakeawaysEN: [
        'Financial closure prevents outstanding invoices and claims',
        'Resources (people, tools, facilities) must be formally released',
        'Archive documentation according to organizational policy',
        'Do not forget to celebrate - it is good for team morale and culture',
      ],
      resources: [
        {
          name: 'Project Closure Checklist',
          type: 'PDF',
          size: '95 KB',
          description: 'Complete checklist voor projectafsluiting',
        },
        {
          name: 'Project Closure Report Template',
          type: 'DOCX',
          size: '165 KB',
          description: 'Template voor het eindrapport',
        },
      ],
    },
    {
      id: 'pm-l25',
      title: 'Final exam: Project Management Fundamentals',
      titleNL: 'Eindexamen: Project Management Fundamentals',
      duration: '45:00',
      type: 'exam',
      videoUrl: '',
      transcript: `Dit is het eindexamen van de Project Management Fundamentals cursus. 
Het examen test je kennis over alle modules.

**Examen Informatie:**
- 40 multiple choice vragen
- 60 minuten tijd
- 70% score nodig om te slagen
- Je mag het examen twee keer doen

**Onderwerpen:**
- Module 1: Introductie Project Management (8 vragen)
- Module 2: Project Initiatie (8 vragen)
- Module 3: Planning (10 vragen)
- Module 4: Uitvoering & Monitoring (8 vragen)
- Module 5: Afsluiting (6 vragen)

Succes!`,
      quiz: [
        {
          id: 'pmf-exam-q1',
          question: 'Which characteristic BEST distinguishes a project from ongoing operations?',
          questionNL: 'Welk kenmerk onderscheidt een project het BESTE van doorlopende activiteiten?',
          options: [
            'Projects always have a larger budget than operations',
            'Projects are temporary endeavours undertaken to create a unique result',
            'Projects are performed by permanent teams with no deadlines',
            'Projects are repeated regularly to maintain business continuity',
          ],
          optionsNL: [
            'Projecten hebben altijd een groter budget dan operaties',
            'Projecten zijn tijdelijke inspanningen om een uniek resultaat te creëren',
            'Projecten worden uitgevoerd door vaste teams zonder deadlines',
            'Projecten worden regelmatig herhaald om bedrijfscontinuïteit te handhaven',
          ],
          correctAnswer: 1,
          explanation: 'Per PMBOK 7, a project is a temporary endeavour undertaken to create a unique product, service, or result. Temporariness and uniqueness are the two defining characteristics that separate projects from operations.',
          explanationNL: 'Volgens PMBOK 7 is een project een tijdelijke inspanning om een uniek product, dienst of resultaat te creëren. Tijdelijkheid en uniciteit zijn de twee bepalende kenmerken die projecten onderscheiden van operaties.',
        },
        {
          id: 'pmf-exam-q2',
          question: 'The "triple constraint" (iron triangle) in project management refers to which three competing factors?',
          questionNL: 'De "driedubbele beperking" (ijzeren driehoek) in projectmanagement verwijst naar welke drie concurrerende factoren?',
          options: [
            'People, process, and technology',
            'Scope, schedule (time), and cost',
            'Quality, risk, and stakeholders',
            'Initiating, planning, and executing',
          ],
          optionsNL: [
            'Mensen, proces en technologie',
            'Scope, planning (tijd) en kosten',
            'Kwaliteit, risico en stakeholders',
            'Initiëren, plannen en uitvoeren',
          ],
          correctAnswer: 1,
          explanation: 'The iron triangle consists of scope, schedule (time), and cost. Changes to one side of the triangle typically affect the other two. Quality is often shown at the centre as the outcome of managing all three.',
          explanationNL: 'De ijzeren driehoek bestaat uit scope, planning (tijd) en kosten. Wijzigingen aan één zijde van de driehoek beïnvloeden doorgaans de andere twee. Kwaliteit wordt vaak in het midden weergegeven als het resultaat van het beheren van alle drie.',
        },
        {
          id: 'pmf-exam-q3',
          question: 'Which PMBOK process group authorises the project and defines the project charter?',
          questionNL: 'Welke PMBOK-procesgroep autoriseert het project en definieert het projecthandvest?',
          options: [
            'Planning',
            'Executing',
            'Initiating',
            'Monitoring & Controlling',
          ],
          optionsNL: [
            'Plannen',
            'Uitvoeren',
            'Initiëren',
            'Bewaken & Beheersen',
          ],
          correctAnswer: 2,
          explanation: 'The Initiating process group formally authorises a new project or phase, produces the project charter, and identifies the initial stakeholders. It is the entry gate into the project.',
          explanationNL: 'De procesgroep Initiëren autoriseert formeel een nieuw project of fase, produceert het projecthandvest en identificeert de initiële stakeholders. Het is de toegangspoort tot het project.',
        },
        {
          id: 'pmf-exam-q4',
          question: 'A project charter primarily serves to:',
          questionNL: 'Een projecthandvest dient primair om:',
          options: [
            'List every task the team must complete during execution',
            'Formally authorise the project and grant the project manager authority to apply resources',
            'Document all identified project risks and their mitigation plans',
            'Define the detailed schedule and budget baselines',
          ],
          optionsNL: [
            'Elke taak te vermelden die het team tijdens de uitvoering moet voltooien',
            'Het project formeel te autoriseren en de projectmanager autoriteit te verlenen om middelen in te zetten',
            'Alle geïdentificeerde projectrisico\'s en hun mitigatieplannen te documenteren',
            'De gedetailleerde planning- en budgetbasislijnen te definiëren',
          ],
          correctAnswer: 1,
          explanation: 'The project charter formally authorises the project and gives the project manager authority to use organisational resources. It is a high-level document — not a detailed schedule or risk register.',
          explanationNL: 'Het projecthandvest autoriseert het project formeel en geeft de projectmanager autoriteit om organisatiemiddelen te gebruiken. Het is een document op hoog niveau — geen gedetailleerde planning of risicoregister.',
        },
        {
          id: 'pmf-exam-q5',
          question: 'The Work Breakdown Structure (WBS) is used primarily to:',
          questionNL: 'De Work Breakdown Structure (WBS) wordt primair gebruikt om:',
          options: [
            'Schedule tasks on a Gantt chart',
            'Decompose the total project scope into manageable work packages',
            'Identify all project stakeholders and their interests',
            'Estimate the probability of project risks',
          ],
          optionsNL: [
            'Taken op een Gantt-diagram te plannen',
            'De totale projectscope op te splitsen in beheersbare werkpakketten',
            'Alle projectstakeholders en hun belangen te identificeren',
            'De kans op projectrisico\'s te schatten',
          ],
          correctAnswer: 1,
          explanation: 'The WBS decomposes the total scope of work into progressively smaller components (work packages) that can be estimated, assigned, and controlled. It is a scope management tool, not a scheduling tool.',
          explanationNL: 'De WBS splitst de totale scope op in steeds kleinere componenten (werkpakketten) die geschat, toegewezen en beheerd kunnen worden. Het is een scopebeheersinstrument, geen planningsinstrument.',
        },
        {
          id: 'pmf-exam-q6',
          question: 'Which technique is used to determine the LONGEST path through a project network diagram, thereby identifying the minimum project duration?',
          questionNL: 'Welke techniek wordt gebruikt om het LANGSTE pad door een projectnetwerkdiagram te bepalen, waarmee de minimale projectduur wordt vastgesteld?',
          options: [
            'Work Breakdown Structure (WBS)',
            'RACI matrix',
            'Critical Path Method (CPM)',
            'Earned Value Analysis (EVA)',
          ],
          optionsNL: [
            'Work Breakdown Structure (WBS)',
            'RACI-matrix',
            'Critical Path Method (CPM)',
            'Earned Value Analysis (EVA)',
          ],
          correctAnswer: 2,
          explanation: 'The Critical Path Method (CPM) identifies the longest sequence of dependent activities. Any delay on the critical path delays the entire project; it also reveals total float for non-critical activities.',
          explanationNL: 'De Critical Path Method (CPM) identificeert de langste reeks afhankelijke activiteiten. Een vertraging op het kritieke pad vertraagt het hele project; het laat ook de totale speling zien voor niet-kritieke activiteiten.',
        },
        {
          id: 'pmf-exam-q7',
          question: 'Float (slack) in a project schedule refers to:',
          questionNL: 'Speling (float) in een projectplanning verwijst naar:',
          options: [
            'The total budget reserve set aside for unforeseen costs',
            'The amount of time an activity can be delayed without delaying the project end date',
            'The difference between planned and actual costs at a given point',
            'The number of resources assigned to a single task',
          ],
          optionsNL: [
            'De totale budgetreserve die is gereserveerd voor onvoorziene kosten',
            'De hoeveelheid tijd dat een activiteit vertraagd kan worden zonder de projecteinddatum te vertragen',
            'Het verschil tussen geplande en werkelijke kosten op een bepaald moment',
            'Het aantal middelen dat aan een enkele taak is toegewezen',
          ],
          correctAnswer: 1,
          explanation: 'Float (or slack) is the amount of time a non-critical activity can slip without affecting the project end date. Activities on the critical path have zero float.',
          explanationNL: 'Speling (of slack) is de hoeveelheid tijd dat een niet-kritieke activiteit kan verschuiven zonder de projecteinddatum te beïnvloeden. Activiteiten op het kritieke pad hebben nul speling.',
        },
        {
          id: 'pmf-exam-q8',
          question: 'Earned Value Management (EVM) defines Schedule Variance (SV) as:',
          questionNL: 'Earned Value Management (EVM) definieert Planningsvariantie (SV) als:',
          options: [
            'Planned Value (PV) minus Actual Cost (AC)',
            'Earned Value (EV) minus Planned Value (PV)',
            'Budget At Completion (BAC) minus Actual Cost (AC)',
            'Earned Value (EV) minus Actual Cost (AC)',
          ],
          optionsNL: [
            'Geplande Waarde (PV) minus Werkelijke Kosten (AC)',
            'Verdiende Waarde (EV) minus Geplande Waarde (PV)',
            'Budget bij Voltooiing (BAC) minus Werkelijke Kosten (AC)',
            'Verdiende Waarde (EV) minus Werkelijke Kosten (AC)',
          ],
          correctAnswer: 1,
          explanation: 'SV = EV − PV. A positive SV means the project is ahead of schedule; a negative SV means it is behind. Cost Variance (CV) = EV − AC.',
          explanationNL: 'SV = EV − PV. Een positieve SV betekent dat het project voor ligt op schema; een negatieve SV betekent dat het achter ligt. Kostenvariantie (CV) = EV − AC.',
        },
        {
          id: 'pmf-exam-q9',
          question: 'Which document describes WHO should receive WHAT information, WHEN, and through WHICH channel?',
          questionNL: 'Welk document beschrijft WIE WELKE informatie ontvangt, WANNEER en via WELK kanaal?',
          options: [
            'Risk Register',
            'Project Charter',
            'Communications Management Plan',
            'Responsibility Assignment Matrix (RAM)',
          ],
          optionsNL: [
            'Risicoregister',
            'Projecthandvest',
            'Communicatiemanagementplan',
            'Verantwoordelijkheidsverdelingsmatrix (RAM)',
          ],
          correctAnswer: 2,
          explanation: 'The Communications Management Plan defines what information is communicated, to whom, how often, and via which medium. It ensures the right stakeholders receive timely, relevant information.',
          explanationNL: 'Het Communicatiemanagementplan definieert welke informatie wordt gecommuniceerd, aan wie, hoe vaak en via welk medium. Het zorgt ervoor dat de juiste stakeholders tijdig relevante informatie ontvangen.',
        },
        {
          id: 'pmf-exam-q10',
          question: 'The FIRST step in the risk management process is:',
          questionNL: 'De EERSTE stap in het risicomanagementproces is:',
          options: [
            'Quantitative risk analysis',
            'Risk response planning',
            'Risk identification',
            'Risk monitoring and control',
          ],
          optionsNL: [
            'Kwantitatieve risicoanalyse',
            'Risicoresponsplanning',
            'Risicoidentificatie',
            'Risicobewaking en -beheersing',
          ],
          correctAnswer: 2,
          explanation: 'Risk management follows the sequence: Identify → Analyse (qualitative then quantitative) → Plan responses → Implement responses → Monitor. You cannot analyse or respond to a risk you have not yet identified.',
          explanationNL: 'Risicomanagement volgt de volgorde: Identificeren → Analyseren (kwalitatief dan kwantitatief) → Responsen plannen → Responsen implementeren → Bewaken. Je kunt een risico dat je nog niet hebt geïdentificeerd niet analyseren of erop reageren.',
        },
        {
          id: 'pmf-exam-q11',
          question: 'Qualitative risk analysis differs from quantitative risk analysis in that qualitative analysis:',
          questionNL: 'Kwalitatieve risicoanalyse verschilt van kwantitatieve risicoanalyse doordat kwalitatieve analyse:',
          options: [
            'Uses Monte Carlo simulations and decision trees',
            'Prioritises risks using probability and impact ratings without assigning numerical values',
            'Calculates the exact monetary value of each risk',
            'Is only applicable to schedule risks, not cost risks',
          ],
          optionsNL: [
            'Monte Carlo-simulaties en beslisbomen gebruikt',
            'Risico\'s prioriteert op basis van kans- en impactbeoordelingen zonder numerieke waarden toe te kennen',
            'De exacte geldwaarde van elk risico berekent',
            'Alleen van toepassing is op planningsrisico\'s, niet op kostenrisico\'s',
          ],
          correctAnswer: 1,
          explanation: 'Qualitative analysis uses probability/impact matrices and scoring scales (High/Medium/Low) to prioritise risks quickly and cost-effectively. Quantitative analysis applies numerical techniques (Monte Carlo, expected monetary value) for high-priority risks.',
          explanationNL: 'Kwalitatieve analyse gebruikt kans/impact-matrices en beoordelingsschalen (Hoog/Gemiddeld/Laag) om risico\'s snel en kosteneffectief te prioriteren. Kwantitatieve analyse past numerieke technieken toe (Monte Carlo, verwachte geldwaarde) voor hoogprioritaire risico\'s.',
        },
        {
          id: 'pmf-exam-q12',
          question: 'Which risk response strategy involves shifting the negative impact of a risk to a third party, such as buying insurance?',
          questionNL: 'Welke risicoresponstrategie houdt in dat de negatieve impact van een risico wordt overgedragen aan een derde partij, zoals het afsluiten van een verzekering?',
          options: [
            'Avoid',
            'Mitigate',
            'Transfer',
            'Accept',
          ],
          optionsNL: [
            'Vermijden',
            'Mitigeren',
            'Overdragen',
            'Accepteren',
          ],
          correctAnswer: 2,
          explanation: 'Transfer shifts the financial impact of a threat to a third party (insurance, fixed-price contracts, performance bonds). Note that it does not eliminate the risk — it reassigns the liability.',
          explanationNL: 'Overdragen verschuift de financiële impact van een bedreiging naar een derde partij (verzekering, vaste-prijscontracten, prestatieborgstellingen). Merk op dat het risico niet wordt geëlimineerd — alleen de aansprakelijkheid wordt overgedragen.',
        },
        {
          id: 'pmf-exam-q13',
          question: 'What is the difference between quality and grade in project management?',
          questionNL: 'Wat is het verschil tussen kwaliteit en klasse in projectmanagement?',
          options: [
            'Quality is about meeting requirements; grade refers to the category of features — low grade is not necessarily a problem if it meets requirements',
            'Quality and grade are synonymous terms used interchangeably in PMBOK',
            'Grade refers to the experience level of team members; quality refers to deliverable accuracy',
            'Low quality is acceptable if approved by the sponsor; low grade never is',
          ],
          optionsNL: [
            'Kwaliteit gaat over het voldoen aan eisen; klasse verwijst naar de categorie kenmerken — lage klasse is niet per se een probleem als aan de eisen wordt voldaan',
            'Kwaliteit en klasse zijn synoniemen die uitwisselbaar worden gebruikt in PMBOK',
            'Klasse verwijst naar het ervaringsniveau van teamleden; kwaliteit verwijst naar de nauwkeurigheid van deliverables',
            'Lage kwaliteit is acceptabel indien goedgekeurd door de sponsor; lage klasse nooit',
          ],
          correctAnswer: 0,
          explanation: 'Per PMBOK, quality is the degree to which characteristics fulfil requirements. Grade is a category assigned based on functional characteristics (e.g., a budget hotel vs a five-star hotel). Low grade may be intentional; low quality is always a problem.',
          explanationNL: 'Volgens PMBOK is kwaliteit de mate waarin kenmerken aan eisen voldoen. Klasse is een categorie op basis van functionele kenmerken (bijv. een budgethotel vs een vijfsterrenhotel). Lage klasse kan opzettelijk zijn; lage kwaliteit is altijd een probleem.',
        },
        {
          id: 'pmf-exam-q14',
          question: 'A stakeholder register is BEST described as:',
          questionNL: 'Een stakeholderregister wordt het BESTE omschreven als:',
          options: [
            'A list of all project team members and their roles',
            'A document identifying individuals and groups with an interest in the project, including their influence and engagement levels',
            'A log of all stakeholder complaints and issues raised during the project',
            'The approved budget allocated to stakeholder communication activities',
          ],
          optionsNL: [
            'Een lijst van alle projectteamleden en hun rollen',
            'Een document dat individuen en groepen identificeert met een belang in het project, inclusief hun invloed en betrokkenheidsniveaus',
            'Een logboek van alle klachten en problemen van stakeholders die tijdens het project zijn gemeld',
            'Het goedgekeurde budget dat is toegewezen aan stakeholdercommunicatieactiviteiten',
          ],
          correctAnswer: 1,
          explanation: 'The stakeholder register captures who the stakeholders are, their requirements, interests, involvement, and potential impact on project success. It is created during the Initiating process group and updated throughout the project.',
          explanationNL: 'Het stakeholderregister legt vast wie de stakeholders zijn, hun eisen, belangen, betrokkenheid en potentiële impact op het projectsucces. Het wordt aangemaakt tijdens de procesgroep Initiëren en gedurende het project bijgewerkt.',
        },
        {
          id: 'pmf-exam-q15',
          question: 'The Initiating, Planning, Executing, Monitoring & Controlling, and Closing groups in PMBOK are known as:',
          questionNL: 'De groepen Initiëren, Plannen, Uitvoeren, Bewaken & Beheersen en Afsluiten in PMBOK worden aangeduid als:',
          options: [
            'Knowledge areas',
            'Process groups',
            'Project phases',
            'Delivery domains',
          ],
          optionsNL: [
            'Kennisgebieden',
            'Procesgroepen',
            'Projectfasen',
            'Leveringsgebieden',
          ],
          correctAnswer: 1,
          explanation: 'PMBOK organises its processes into five process groups (Initiating, Planning, Executing, Monitoring & Controlling, Closing) and ten knowledge areas. Process groups are NOT the same as project phases — multiple process groups can be active simultaneously within a single phase.',
          explanationNL: 'PMBOK organiseert zijn processen in vijf procesgroepen (Initiëren, Plannen, Uitvoeren, Bewaken & Beheersen, Afsluiten) en tien kennisgebieden. Procesgroepen zijn NIET hetzelfde als projectfasen — meerdere procesgroepen kunnen gelijktijdig actief zijn binnen één fase.',
        },
        {
          id: 'pmf-exam-q16',
          question: 'Which process group is active throughout the ENTIRE project lifecycle, running in parallel with all other groups?',
          questionNL: 'Welke procesgroep is actief gedurende de GEHELE projectlevenscyclus en loopt parallel aan alle andere groepen?',
          options: [
            'Planning',
            'Executing',
            'Monitoring & Controlling',
            'Closing',
          ],
          optionsNL: [
            'Plannen',
            'Uitvoeren',
            'Bewaken & Beheersen',
            'Afsluiten',
          ],
          correctAnswer: 2,
          explanation: 'Monitoring & Controlling runs continuously throughout the project. It tracks, reviews, and regulates progress and performance, and manages changes. It does not start after execution — it runs from initiating through closing.',
          explanationNL: 'Bewaken & Beheersen loopt continu gedurende het project. Het volgt, beoordeelt en reguleert voortgang en prestaties, en beheert wijzigingen. Het begint niet na de uitvoering — het loopt van initiëren tot afsluiting.',
        },
        {
          id: 'pmf-exam-q17',
          question: 'Scope creep is BEST defined as:',
          questionNL: 'Scope creep wordt het BESTE gedefinieerd als:',
          options: [
            'A deliberate increase in project scope approved through formal change control',
            'Uncontrolled expansion of project scope without corresponding adjustments to time, cost, or resources',
            'A reduction in deliverable quality caused by compressed schedules',
            'The progressive elaboration of the project management plan over time',
          ],
          optionsNL: [
            'Een opzettelijke uitbreiding van de projectscope goedgekeurd via formele wijzigingsbeheersing',
            'Ongecontroleerde uitbreiding van de projectscope zonder overeenkomstige aanpassingen aan tijd, kosten of middelen',
            'Een vermindering van de kwaliteit van deliverables veroorzaakt door gecomprimeerde planningen',
            'De progressieve uitwerking van het projectmanagementplan in de loop van de tijd',
          ],
          correctAnswer: 1,
          explanation: 'Scope creep is uncontrolled change or continuous growth in a project\'s scope, typically without adjustments to budget, schedule, or resources. It is a leading cause of project failure and is prevented by rigorous change control.',
          explanationNL: 'Scope creep is ongecontroleerde verandering of continue groei van de projectscope, doorgaans zonder aanpassingen aan het budget, de planning of de middelen. Het is een belangrijke oorzaak van projectmislukking en wordt voorkomen door rigoureuze wijzigingsbeheersing.',
        },
        {
          id: 'pmf-exam-q18',
          question: 'A Change Control Board (CCB) is responsible for:',
          questionNL: 'Een Change Control Board (CCB) is verantwoordelijk voor:',
          options: [
            'Identifying and documenting all project risks',
            'Reviewing, evaluating, approving, or rejecting requested changes to the project',
            'Assigning tasks to team members during execution',
            'Conducting quality audits on project deliverables',
          ],
          optionsNL: [
            'Het identificeren en documenteren van alle projectrisico\'s',
            'Het beoordelen, evalueren, goedkeuren of afwijzen van gevraagde wijzigingen aan het project',
            'Het toewijzen van taken aan teamleden tijdens de uitvoering',
            'Het uitvoeren van kwaliteitsaudits op projectdeliverables',
          ],
          correctAnswer: 1,
          explanation: 'A CCB is a formally chartered group responsible for reviewing change requests and approving or rejecting them based on impact analysis. It is the cornerstone of integrated change control.',
          explanationNL: 'Een CCB is een formeel gemandateerde groep verantwoordelijk voor het beoordelen van wijzigingsverzoeken en het goedkeuren of afwijzen ervan op basis van impactanalyse. Het is de hoeksteen van geïntegreerde wijzigingsbeheersing.',
        },
        {
          id: 'pmf-exam-q19',
          question: 'Which project lifecycle type is MOST appropriate when requirements are well-defined and unlikely to change?',
          questionNL: 'Welk type projectlevenscyclus is het MEEST geschikt wanneer eisen goed gedefinieerd zijn en waarschijnlijk niet zullen veranderen?',
          options: [
            'Agile (iterative/incremental)',
            'Predictive (waterfall)',
            'Hybrid',
            'Adaptive',
          ],
          optionsNL: [
            'Agile (iteratief/incrementeel)',
            'Voorspellend (waterval)',
            'Hybride',
            'Adaptief',
          ],
          correctAnswer: 1,
          explanation: 'A predictive (waterfall) lifecycle is suited to projects with stable, well-understood requirements where the full scope can be defined upfront. Agile and adaptive lifecycles are preferred when requirements are expected to evolve.',
          explanationNL: 'Een voorspellende (waterval) levenscyclus is geschikt voor projecten met stabiele, goed begrepen eisen waarbij de volledige scope vooraf gedefinieerd kan worden. Agile en adaptieve levenscycli hebben de voorkeur wanneer eisen naar verwachting zullen evolueren.',
        },
        {
          id: 'pmf-exam-q20',
          question: 'The project management plan is BEST described as:',
          questionNL: 'Het projectmanagementplan wordt het BESTE omschreven als:',
          options: [
            'A single-page summary of the project charter approved by the sponsor',
            'A comprehensive document describing how the project will be executed, monitored, and closed',
            'The detailed work schedule showing all task start and finish dates',
            'A financial forecast showing expected costs week by week',
          ],
          optionsNL: [
            'Een eenpaginasamenvatting van het projecthandvest goedgekeurd door de sponsor',
            'Een uitgebreid document dat beschrijft hoe het project zal worden uitgevoerd, bewaakt en afgesloten',
            'Het gedetailleerde werkschema dat alle begin- en einddatums van taken toont',
            'Een financiële prognose die verwachte kosten week per week toont',
          ],
          correctAnswer: 1,
          explanation: 'The project management plan integrates and consolidates all subsidiary plans (scope, schedule, cost, quality, communications, risk, procurement, stakeholder). It describes the baselines and how the project will be managed across all knowledge areas.',
          explanationNL: 'Het projectmanagementplan integreert en consolideert alle deelplannen (scope, planning, kosten, kwaliteit, communicatie, risico, inkoop, stakeholders). Het beschrijft de basislijnen en hoe het project zal worden beheerd over alle kennisgebieden.',
        },
        {
          id: 'pmf-exam-q21',
          question: 'According to project management best practice, what should happen when a project can no longer achieve its objectives?',
          questionNL: 'Wat zou er volgens best practices in projectmanagement moeten gebeuren wanneer een project zijn doelstellingen niet meer kan bereiken?',
          options: [
            'The project manager should negotiate a lower quality standard to meet the deadline',
            'The project should be formally closed even if it has not delivered all planned outputs',
            'The project should automatically transition to operations management',
            'The project sponsor should be replaced to restore confidence',
          ],
          optionsNL: [
            'De projectmanager moet een lagere kwaliteitsstandaard onderhandelen om de deadline te halen',
            'Het project moet formeel worden afgesloten, ook als niet alle geplande outputs zijn geleverd',
            'Het project moet automatisch overgaan naar operationeel management',
            'De projectsponsor moet worden vervangen om het vertrouwen te herstellen',
          ],
          correctAnswer: 1,
          explanation: 'A project should be formally closed whenever it can no longer meet its objectives — whether it completes successfully or is terminated early. Closing processes ensure lessons learned are captured and resources are released properly.',
          explanationNL: 'Een project moet formeel worden afgesloten wanneer het zijn doelstellingen niet meer kan realiseren — of het nu succesvol wordt afgerond of vroegtijdig wordt beëindigd. Afsluitingsprocessen zorgen ervoor dat geleerde lessen worden vastgelegd en middelen correct worden vrijgegeven.',
        },
        {
          id: 'pmf-exam-q22',
          question: 'A project milestone is BEST described as:',
          questionNL: 'Een projectmijlpaal wordt het BESTE omschreven als:',
          options: [
            'A task on the critical path with zero float',
            'A significant point or event in a project with zero duration',
            'The approved project budget at a specific reporting date',
            'A mandatory deliverable required by the project sponsor',
          ],
          optionsNL: [
            'Een taak op het kritieke pad met nul speling',
            'Een significant punt of gebeurtenis in een project met nul duur',
            'Het goedgekeurde projectbudget op een specifieke rapportagedatum',
            'Een verplichte deliverable vereist door de projectsponsor',
          ],
          correctAnswer: 1,
          explanation: 'A milestone is a significant event or point in the project schedule — it has zero duration. Milestones mark the completion of a phase, achievement of a goal, or a key decision point.',
          explanationNL: 'Een mijlpaal is een significante gebeurtenis of punt in de projectplanning — het heeft nul duur. Mijlpalen markeren de voltooiing van een fase, het bereiken van een doel of een belangrijk beslismoment.',
        },
        {
          id: 'pmf-exam-q23',
          question: 'Which procurement contract type places MOST of the cost risk on the BUYER?',
          questionNL: 'Welk type inkoopcontract plaatst het MEESTE kostenrisico bij de KOPER?',
          options: [
            'Firm Fixed Price (FFP)',
            'Fixed Price Incentive Fee (FPIF)',
            'Cost Plus Fixed Fee (CPFF)',
            'Fixed Price with Economic Price Adjustment (FPEPA)',
          ],
          optionsNL: [
            'Vaste Vaste Prijs (FFP)',
            'Vaste Prijs met Incentief Vergoeding (FPIF)',
            'Kosten Plus Vaste Vergoeding (CPFF)',
            'Vaste Prijs met Economische Prijsaanpassing (FPEPA)',
          ],
          correctAnswer: 2,
          explanation: 'Cost-reimbursable contracts (like CPFF) place the greatest cost risk on the buyer because the buyer reimburses all allowable costs regardless of how high they go. Fixed-price contracts shift risk to the seller.',
          explanationNL: 'Kostenvergoedingscontracten (zoals CPFF) plaatsen het grootste kostenrisico bij de koper omdat de koper alle toegestane kosten vergoedt, ongeacht hoe hoog ze worden. Vaste-prijscontracten verschuiven het risico naar de verkoper.',
        },
        {
          id: 'pmf-exam-q24',
          question: 'The RACI matrix in a project defines:',
          questionNL: 'De RACI-matrix in een project definieert:',
          options: [
            'Risk, Assumption, Constraint, and Issue for each deliverable',
            'Roles and responsibilities — who is Responsible, Accountable, Consulted, and Informed for each activity',
            'The sequence of project phases: Review, Assign, Control, and Initiate',
            'A scoring system for ranking stakeholder engagement levels',
          ],
          optionsNL: [
            'Risico, Aanname, Beperking en Probleem voor elke deliverable',
            'Rollen en verantwoordelijkheden — wie is Verantwoordelijk, Aansprakelijk, Geconsulteerd en Geïnformeerd voor elke activiteit',
            'De volgorde van projectfasen: Beoordelen, Toewijzen, Beheersen en Initiëren',
            'Een beoordelingssysteem voor het rangschikken van betrokkenheidsniveaus van stakeholders',
          ],
          correctAnswer: 1,
          explanation: 'RACI stands for Responsible (does the work), Accountable (owns the outcome — one per task), Consulted (provides input), and Informed (kept up to date). It is a Responsibility Assignment Matrix used to clarify roles across project activities.',
          explanationNL: 'RACI staat voor Responsible (doet het werk), Accountable (eigenaar van het resultaat — één per taak), Consulted (geeft input) en Informed (wordt op de hoogte gehouden). Het is een Verantwoordelijkheidsverdelingsmatrix die wordt gebruikt om rollen in projectactiviteiten te verduidelijken.',
        },
        {
          id: 'pmf-exam-q25',
          question: 'Which skill is considered a CORE competency of an effective project manager?',
          questionNL: 'Welke vaardigheid wordt beschouwd als een KERN competentie van een effectieve projectmanager?',
          options: [
            'Deep technical expertise in the project\'s subject matter',
            'The ability to write advanced SQL queries for project reporting',
            'Integration management — balancing competing demands across scope, time, cost, quality, risk, and stakeholders',
            'Personal authority to approve all project expenditures without sponsor sign-off',
          ],
          optionsNL: [
            'Diepe technische expertise in het vakgebied van het project',
            'Het vermogen om geavanceerde SQL-queries te schrijven voor projectrapportage',
            'Integratiebeheer — het balanceren van concurrerende eisen op het gebied van scope, tijd, kosten, kwaliteit, risico en stakeholders',
            'Persoonlijke autoriteit om alle projectuitgaven goed te keuren zonder goedkeuring van de sponsor',
          ],
          correctAnswer: 2,
          explanation: 'Integration management is the core competency that ties everything together. A project manager must balance all ten knowledge areas simultaneously, make trade-off decisions, and keep the project aligned to business objectives — regardless of technical domain expertise.',
          explanationNL: 'Integratiebeheer is de kerncompetentie die alles samenbrengt. Een projectmanager moet alle tien kennisgebieden gelijktijdig balanceren, afwegingsbeslissingen nemen en het project in lijn houden met bedrijfsdoelstellingen — ongeacht technische domeinexpertise.',
        },
      ],
    },
    {
      id: 'pm-l26',
      title: 'Certificate and Next Steps',
      titleNL: 'Certificaat en Vervolgstappen',
      duration: '5:00',
      type: 'certificate',
      videoUrl: '',
      transcript: `Gefeliciteerd met het afronden van de Project Management Fundamentals cursus!

**Je Certificaat**

Je ontvangt een certificaat dat bevestigt:
- Cursus: Project Management Fundamentals
- Duur: 12 uur
- Onderwerpen: Initiatie, Planning, Uitvoering, Monitoring, Afsluiting
- Datum van afronding

Dit certificaat kun je toevoegen aan je LinkedIn profiel en CV.

**Vervolgstappen**

Nu je de fundamenten beheerst, kun je doorgaan met:

**Methodologie-specifieke certificeringen:**
- PRINCE2 Foundation & Practitioner
- PMP (Project Management Professional)
- Scrum Master (PSM I)
- Lean Six Sigma Green Belt

**Verdiepende cursussen:**
- Agile Project Management
- Risk Management
- Stakeholder Management
- Program Management

**Praktijk:**
- Pas toe wat je hebt geleerd
- Begin met kleine projecten
- Zoek een mentor
- Word lid van PMI of IPMA

Veel succes in je projectmanagement carrière!`,
    },
  ],
};

// ============================================
// EXPORT MODULES
// ============================================
export const pmFundamentalsModules: Module[] = [
  module1,
  module2,
  module3,
  module4,
  module5,
];

// ============================================
// COURSE DEFINITION
// ============================================
export const pmFundamentalsCourse: Course = {
  id: 'pm-fundamentals',
  title: 'Project Management Fundamentals',
  titleNL: 'Project Management Fundamentals',
  description: 'Complete training for aspiring project managers. Learn essential skills to lead projects from initiation to closure.',
  descriptionNL: 'Complete training voor aspirant projectmanagers. Leer alle essentiële vaardigheden om projecten succesvol te leiden van initiatie tot afsluiting.',
  icon: Target,
  color: BRAND.purple,
  gradient: `linear-gradient(135deg, ${BRAND.purple}, #7C3AED)`,
  category: 'fundamentals',
  methodology: 'generic',
  levels: 4,
  modules: pmFundamentalsModules.reduce((total, m) => total + m.lessons.length, 0),
  duration: 12,
  rating: 4.9,
  students: 12453,
  tags: ['Project Management', 'Planning', 'WBS', 'Gantt', 'Risk Management', 'Stakeholders'],
  tagsNL: ['Projectmanagement', 'Planning', 'WBS', 'Gantt', 'Risicomanagement', 'Stakeholders'],
  instructor: instructors.sarah,
  featured: true,
  bestseller: true,
  new: false,
  freeForCustomers: true,
  certificate: true,
  whatYouLearn: [
    'The complete project lifecycle from initiation to closure',
    'Create effective project plans with WBS and Gantt charts',
    'Identify, analyze and mitigate project risks',
    'Manage stakeholders and create communication plans',
    'Lead and motivate teams for optimal performance',
    'Successfully close projects with lessons learned',
    'Use PM tools and software effectively',
    'Prepare for PMP/PRINCE2 certification',
  ],
  whatYouLearnNL: [
    'De volledige projectlevenscyclus van initiatie tot afsluiting',
    'Effectieve projectplannen maken met WBS en Gantt charts',
    'Risico\'s identificeren, analyseren en mitigeren',
    'Stakeholders managen en communicatieplannen opstellen',
    'Teams leiden en motiveren voor optimale prestaties',
    'Projecten succesvol afsluiten met lessons learned',
    'PM tools en software effectief gebruiken',
    'Voorbereiden op PMP/PRINCE2 certificering',
  ],
  requirements: [
    'No prior knowledge required - we start from basics',
    'Basic Excel knowledge is helpful but not required',
    'Motivation to learn and complete practical exercises',
  ],
  requirementsNL: [
    'Geen voorkennis vereist - we beginnen bij de basis',
    'Basiskennis van Excel is handig maar niet verplicht',
    'Motivatie om te leren en praktijkoefeningen te maken',
  ],
  targetAudience: [
    'Aspiring project managers wanting to start in the field',
    'Team leads taking on project responsibilities',
    'Professionals wanting to improve their PM skills',
    'Students considering a career in project management',
  ],
  targetAudienceNL: [
    'Aspirant projectmanagers die willen starten in het vak',
    'Team leads die projectverantwoordelijkheid krijgen',
    'Professionals die hun PM skills willen verbeteren',
    'Studenten die een carrière in projectmanagement overwegen',
  ],
  courseModules: pmFundamentalsModules,
};

export default pmFundamentalsCourse;