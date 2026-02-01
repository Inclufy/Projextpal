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
  id: 'pm-m1',
  title: 'Module 1: Introductie Project Management',
  titleNL: 'Module 1: Introductie Project Management',
  description: 'The fundamentals: what are projects, who is the PM, and which methodologies exist?',
  descriptionNL: 'De fundamenten: wat zijn projecten, wie is de PM, en welke methodologieën bestaan er?',
  lessons: [
    {
      id: 'pm-l1',
      title: 'Wat is een project?',
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
dan lopende operaties. Een fabriek die elke dag auto's produceert is geen project - dat is 
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
        'Een project is tijdelijk, uniek en levert een specifiek resultaat',
        'De Triple Constraint (scope, tijd, budget) bepaalt projectgrenzen',
        'Projecten verschillen fundamenteel van operationele werkzaamheden',
        '70% van projecten faalt zonder goed projectmanagement',
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
      title: 'De rol van de projectmanager',
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
        'De PM is verantwoordelijk voor scope, tijd, budget en kwaliteit',
        'Zowel hard skills als soft skills zijn essentieel',
        'Dienend leiderschap is effectiever dan command & control',
        'Er zijn meerdere carrièrepaden naar projectmanagement',
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
      title: 'Projectmanagement methodologieën',
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
        'Methodologieën bieden structuur en gemeenschappelijke taal',
        'Waterfall is sequentieel; Agile is iteratief en flexibel',
        'PRINCE2 focust op governance; Lean Six Sigma op procesverbetering',
        'Kies de methodologie die past bij je project en organisatie',
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
      title: 'De projectlevenscyclus',
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
2. **Planning**: Hoe? WBS, planning, budget, risico's
3. **Uitvoering**: Doen! Werk uitvoeren, team managen
4. **Monitoring**: Controleren en bijsturen
5. **Afsluiting**: Afronden, lessons learned, vieren`,
      keyTakeaways: [
        'Elk project kent vijf fasen: Initiatie, Planning, Uitvoering, Monitoring, Afsluiting',
        'De planningsfase bepaalt grotendeels het projectsucces',
        'Monitoring loopt parallel aan uitvoering',
        'Afsluiting is cruciaal maar wordt vaak verwaarloosd',
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
      title: 'Quiz: Basisconcepten',
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
          question: 'Wat is een kenmerk van "dienend leiderschap"?',
          options: [
            'De PM geeft strikte opdrachten aan het team',
            'De PM ruimt obstakels uit de weg zodat het team kan presteren',
            'De PM neemt alle beslissingen alleen',
            'De PM focust primair op de eigen carrière',
          ],
          correctAnswer: 1,
          explanation: 'Bij dienend leiderschap staat de PM ten dienste van het team. De focus ligt op het creëren van een omgeving waarin het team kan excelleren.',
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
          question: 'DMAIC is de kernmethodiek van welke aanpak?',
          options: [
            'Scrum',
            'PRINCE2',
            'Lean Six Sigma',
            'Kanban',
          ],
          correctAnswer: 2,
          explanation: 'DMAIC (Define, Measure, Analyze, Improve, Control) is de kernmethodiek van Lean Six Sigma.',
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
  id: 'pm-m2',
  title: 'Module 2: Project Initiatie',
  titleNL: 'Module 2: Project Initiatie',
  description: 'How to start a project well? From stakeholder analysis to business case.',
  descriptionNL: 'Hoe start je een project goed? Van stakeholder analyse tot business case.',
  lessons: [
    {
      id: 'pm-l6',
      title: 'Het projectcharter opstellen',
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
De belangrijkste risico's en aannames waar het project op is gebaseerd.

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
        'Het projectcharter autoriseert het project formeel',
        'Bevat: doelen, scope, budget, planning, stakeholders, risico\'s',
        'Out-of-scope definiëren is net zo belangrijk als in-scope',
        'Houd het kort: 2-5 pagina\'s is voldoende',
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
      title: 'Stakeholder analyse',
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
        'Stakeholders kunnen je project maken of breken',
        'Analyseer op macht, belang en houding',
        'De Power/Interest matrix helpt bij prioriteren',
        'Stakeholder analyse is dynamisch - update regelmatig',
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
      title: 'Business case ontwikkelen',
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
- Wat zijn de risico's?

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
6. **Erken risico's**: Laat zien dat je ze begrijpt
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
- Erkent risico's
- Geeft een duidelijke aanbeveling`,
      keyTakeaways: [
        'De business case rechtvaardigt de investering',
        'Vergelijk altijd meerdere opties inclusief "niets doen"',
        'Gebruik financiële metrics: ROI, payback, NPV',
        'Wees realistisch over kosten en baten',
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
      title: 'Scope definitie',
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
        'Scope = wat wel en niet tot het project behoort',
        'Onderscheid product scope van project scope',
        'Out-of-scope expliciet benoemen voorkomt scope creep',
        'De scope statement is de formele vastlegging',
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
      title: 'Praktijkopdracht: Project Charter',
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
8. Top 5 risico's
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
      keyTakeaways: [
        'De WBS is de basis voor alle planning en control',
        'Volg de 100% regel: alle werk moet erin zitten',
        'Gebruik deliverables (wat), geen activiteiten (hoe)',
        'Werkpakketten van 8-80 uur zijn ideaal',
      ],
      resources: [
        { name: 'WBS Template Excel', type: 'XLSX', size: '125 KB', description: 'Template voor het maken van een WBS' },
        { name: 'WBS Voorbeelden', type: 'PDF', size: '1.8 MB', description: 'Voorbeelden voor IT, bouw en organisatie projecten' },
      ],
    },
    {
      id: 'pm-l12',
      title: 'Gantt charts maken',
      titleNL: 'Gantt charts maken',
      duration: '20:00',
      type: 'video',
      keyTakeaways: [
        'Gantt charts visualiseren planning en afhankelijkheden',
        'Het kritieke pad bepaalt de minimale projectduur',
        'Er zijn vier soorten afhankelijkheden: FS, SS, FF, SF',
        'Update de Gantt regelmatig voor actueel beeld',
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
      keyTakeaways: [
        'Resource planning matcht benodigde met beschikbare capaciteit',
        'Resource leveling lost overbelasting op',
        'De RACI matrix verduidelijkt verantwoordelijkheden',
        'Plan op 80% - houd buffer voor onverwachts',
      ],
      resources: [
        { name: 'RACI Matrix Template', type: 'XLSX', size: '78 KB', description: 'Template voor verantwoordelijkheden' },
      ],
    },
    {
      id: 'pm-l14',
      title: 'Budget en kostenraming',
      titleNL: 'Budget en kostenraming',
      duration: '16:00',
      type: 'video',
      keyTakeaways: [
        'Bottom-up is het nauwkeurigst maar tijdrovend',
        'Bouw contingency en management reserve in',
        'Earned Value Management meet kosten én voortgang',
        'Documenteer altijd je aannames',
      ],
      resources: [
        { name: 'Kostenraming Template', type: 'XLSX', size: '189 KB', description: 'Template met formules voor bottom-up raming' },
      ],
    },
    {
      id: 'pm-l15',
      title: 'Risicomanagement',
      titleNL: 'Risicomanagement',
      duration: '22:00',
      type: 'video',
      keyTakeaways: [
        'Risico\'s hebben kans én impact - beide beoordelen',
        'Vier response strategieën: vermijden, overdragen, mitigeren, accepteren',
        'Het risicoregister is het centrale document',
        'Risicomanagement is continu, niet eenmalig',
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
  id: 'pm-m4',
  title: 'Module 4: Uitvoering & Monitoring',
  titleNL: 'Module 4: Uitvoering & Monitoring',
  description: 'Team leadership, communication, Earned Value and change control.',
  descriptionNL: 'Teamleiderschap, communicatie, Earned Value en change control.',
  lessons: [
    {
      id: 'pm-l16',
      title: 'Teams leiden en motiveren',
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

**Herzberg's Twee-Factoren Theorie:**

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
        'Teams doorlopen fasen: Forming, Storming, Norming, Performing',
        'Intrinsieke motivatie (autonomie, purpose, erkenning) werkt beter dan extrinsieke',
        'Conflictstijlen moeten passen bij de situatie',
        'Virtuele teams vragen extra aandacht voor communicatie',
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
      title: 'Stakeholder communicatie',
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
| Stuurgroep | Status, risico's, gates | Maandelijks | Presentatie | PM |
| Team | Taken, prioriteiten, updates | Dagelijks | Standup | PM/Team |
| Eindgebruikers | Voortgang, planning | Maandelijks | Nieuwsbrief | PMO |

**Soorten Projectcommunicatie**

**1. Statusrapportages**
Regelmatige updates over voortgang.

Inhoud:
- Overall status (rood/oranje/groen)
- Voortgang vs. planning
- Bereikte mijlpalen
- Issues en risico's
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
        'PM\'s besteden 90% van hun tijd aan communicatie',
        'Een communicatieplan definieert wie-wat-wanneer-hoe',
        'Pas je stijl aan per stakeholder type',
        'Breng slecht nieuws eerlijk, met een plan',
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
      title: 'Voortgangsbewaking met Earned Value',
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
        'EVM combineert scope, tijd en kosten in één objectieve meting',
        'EV = wat je hebt verdiend, niet wat je hebt uitgegeven',
        'CPI < 1 betekent dat je meer uitgeeft dan gepland per eenheid werk',
        'EAC voorspelt de totale kosten als de trend doorzet',
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
- Impact op risico's
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
        'Change control is bescherming, niet bureaucratie',
        'Elke wijziging doorloopt: request, analyse, beslissing, implementatie, verificatie',
        'Het Change Control Board beslist over significante wijzigingen',
        'Gold plating (ongevraagde extras) is net zo schadelijk als scope creep',
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
      title: 'Quiz: Uitvoering & Monitoring',
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
  id: 'pm-m5',
  title: 'Module 5: Afsluiting',
  titleNL: 'Module 5: Afsluiting',
  description: 'Formal acceptance, lessons learned and administrative closure.',
  descriptionNL: 'Formele acceptatie, lessons learned en administratieve afsluiting.',
  lessons: [
    {
      id: 'pm-l21',
      title: 'Het belang van projectafsluiting',
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
        'Afsluiting wordt vaak verwaarloosd maar is cruciaal',
        'Zombie projecten kosten resources en veroorzaken verwarring',
        'Lessons learned voorkomen herhaling van fouten',
        'Ook gestopte projecten moeten goed worden afgesloten',
      ],
    },
    {
      id: 'pm-l22',
      title: 'Formele acceptatie en overdracht',
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
        'Acceptatiecriteria moeten vooraf zijn gedefinieerd',
        'Acceptatie is formeel met handtekening van bevoegde persoon',
        'Overdracht omvat product, documentatie en kennis',
        'Plan acceptatie in - het kost tijd',
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
        'Verzamel lessons learned tijdens én aan het einde van het project',
        'Creëer een blame-free omgeving voor eerlijke feedback',
        'Goede lessons zijn specifiek met context, oorzaak en aanbeveling',
        'Lessons learned zijn waardeloos als ze niet worden gebruikt',
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
      title: 'Administratieve afsluiting en archivering',
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
        'Financiële afsluiting voorkomt openstaande facturen en claims',
        'Resources (mensen, tools, faciliteiten) moeten formeel worden vrijgegeven',
        'Documentatie archiveren volgens organisatiebeleid',
        'Vergeet niet te vieren - het is goed voor team en cultuur',
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
      title: 'Eindexamen: Project Management Fundamentals',
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
    },
    {
      id: 'pm-l26',
      title: 'Certificaat en Vervolgstappen',
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