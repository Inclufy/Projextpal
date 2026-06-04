// ============================================
// COURSE: PRINCE2 FOUNDATION & PRACTITIONER
// ============================================
// Complete PRINCE2 training with all 7 principles, themes, and processes
// ============================================
// TODO: PRINCE2 7th Edition (2023) update — sustainability theme, retired Project Support role, integrated themes/principles/processes. Tracked in catalog audit 2026-04-28.
// ============================================

import { Crown } from 'lucide-react';
import { Course, Module } from '../types';
import { BRAND } from '../brand';
import { instructors } from '../instructors';

// ============================================
// MODULE 1: PRINCE2 INTRODUCTIE & PRINCIPES
// ============================================
const module1: Module = {
  order: 0,
  id: 'p2-m1',
  title: 'Module 1: PRINCE2 Introduction & Principles',
  titleNL: 'Module 1: PRINCE2 Introductie & Principes',
  description: 'Introduction to PRINCE2 and the 7 non-negotiable principles.',
  descriptionNL: 'Kennismaking met PRINCE2 en de 7 ononderhandelbare principes.',
  lessons: [
    {
      id: 'p2-l1',
      title: 'What is PRINCE2?',
      titleNL: 'Wat is PRINCE2?',
      duration: '15:00',
      type: 'video',
      videoUrl: '',
      transcript: `Welkom bij de PRINCE2 cursus! In deze eerste les maken we kennis met 
PRINCE2 - de meest gebruikte projectmanagement methodologie ter wereld.

**Wat betekent PRINCE2?**

PRINCE2 staat voor PRojects IN Controlled Environments, versie 2. Het is een procesgebaseerde 
methode voor effectief projectmanagement. De methode is oorspronkelijk ontwikkeld door de 
Britse overheid en wordt nu beheerd door AXELOS.

**De Geschiedenis**

- 1975: PROMPT ontwikkeld door Simpact Systems
- 1989: PRINCE gelanceerd door CCTA (UK overheid)
- 1996: PRINCE2 gepubliceerd
- 2009: Grote update - "Managing Successful Projects with PRINCE2"
- 2017: PRINCE2 2017 Update
- Vandaag: PRINCE2 6th Edition (2017)

**Waarom PRINCE2?**

PRINCE2 is populair omdat het:
- **Gestructureerd** is: Duidelijke processen en rollen
- **Schaalbaar** is: Toepasbaar op kleine en grote projecten
- **Flexibel** is: Aan te passen (tailoring) aan de context
- **Bewezen** is: Gebaseerd op best practices uit duizenden projecten
- **Universeel** is: Dezelfde taal wereldwijd

**Waar wordt PRINCE2 gebruikt?**

- Overheid (verplicht in UK, veel gebruikt in NL)
- Financiële sector
- IT en consultancy
- Bouw en infrastructuur
- Gezondheidszorg

Meer dan 1 miljoen professionals wereldwijd zijn PRINCE2 gecertificeerd.

**De Structuur van PRINCE2**

PRINCE2 bestaat uit drie elementen:

1. **7 Principes**: De fundamentele regels
2. **7 Thema's**: Aspecten die continu aandacht nodig hebben
3. **7 Processen**: De stappen door het project

Dit vormt een geïntegreerd framework:
- Principes geven richting
- Thema's beschrijven WAT je moet managen
- Processen beschrijven WANNEER je wat doet

**PRINCE2 vs. Andere Methodologieën**

| Aspect | PRINCE2 | PMI/PMBOK | Agile |
|--------|---------|-----------|-------|
| Type | Methode | Kennisgebied | Mindset |
| Focus | Processen | Competenties | Waarde |
| Structuur | Prescriptief | Descriptief | Adaptief |
| Governance | Sterk | Variabel | Light |

PRINCE2 is complementair aan PMI (kennis) en Agile (uitvoering).

**PRINCE2 Certificering**

Er zijn twee niveaus:

**Foundation**: 
- Begrip van de methode
- Multiple choice examen
- 60 vragen, 55% om te slagen

**Practitioner**:
- Toepassing van de methode in scenario's
- Scenario-based examen
- 68 vragen, 55% om te slagen (38 van 68 correct)
- Open boek (officieel PRINCE2-manual toegestaan), 150 minuten
- Vereist Foundation eerst

**In deze cursus...**

We behandelen:
- Alle 7 principes in detail
- Alle 7 thema\'s met praktijkvoorbeelden
- Alle 7 processen stap voor stap
- Tailoring voor jouw context
- Oefenexamens voor certificering

Laten we beginnen met de 7 principes - de fundamenten van PRINCE2!`,
      keyTakeaways: [
        'PRINCE2 = PRojects IN Controlled Environments',
        'Consists of 7 principles, 7 themes, 7 processes',
        'The most widely used PM methodology worldwide',
        'Two certification levels: Foundation and Practitioner',
      ],
      keyTakeawaysNL: [
        'PRINCE2 = PRojects IN Controlled Environments',
        'Bestaat uit 7 principes, 7 thema\'s, 7 processen',
        'Wereldwijd de meest gebruikte PM-methode',
        'Twee certificeringsniveaus: Foundation en Practitioner',
      ],
      keyTakeawaysEN: [
        'PRINCE2 = PRojects IN Controlled Environments',
        'Consists of 7 principles, 7 themes, 7 processes',
        'The most widely used PM methodology worldwide',
        'Two certification levels: Foundation and Practitioner',
      ],
      resources: [
        {
          name: 'PRINCE2 Overview Poster',
          type: 'PDF',
          size: '2.4 MB',
          description: 'Visueel overzicht van het complete framework',
        },
      ],
    },
    {
      id: 'p2-l2',
      title: 'The 7 Principles of PRINCE2',
      titleNL: 'De 7 Principes van PRINCE2',
      duration: '25:00',
      type: 'video',
      videoUrl: '',
      transcript: `De 7 principes vormen het fundament van PRINCE2. Ze zijn universeel 
toepasbaar en niet onderhandelbaar - als je ze niet volgt, doe je geen PRINCE2.

**Principe 1: Continued Business Justification**

Een PRINCE2 project moet een geldige zakelijke rechtvaardiging hebben én houden.

Dit betekent:
- Bij start: Is er een goede reden voor dit project?
- Tijdens: Klopt die reden nog steeds?
- Bij afwijkingen: Is het nog steeds de investering waard?

De Business Case is het document dat dit vastlegt. Het wordt gedurende het project 
geüpdatet en gevalideerd bij elke stage gate.

Praktijkvoorbeeld:
Een project om een nieuw CRM te bouwen start met een sterke business case (20% efficiency 
winst). Halverwege blijkt dat de leverancier van de legacy systemen al een CRM-module 
aanbiedt voor een fractie van de kosten. De business case moet worden herzien - misschien 
moet het project zelfs stoppen.

**Principe 2: Learn from Experience**

Projecten moeten leren van eerdere projecten en zelf ook leerpunten vastleggen.

Dit omvat:
- Bij start: Lessons Learned uit vergelijkbare projecten ophalen
- Tijdens: Continue reflectie en documentatie
- Bij afsluiting: Lessons Learned vastleggen voor toekomstige projecten

Veel organisaties doen dit niet goed. PRINCE2 maakt het expliciet.

**Principe 3: Defined Roles and Responsibilities**

Een PRINCE2 project heeft een duidelijke organisatiestructuur met gedefinieerde rollen.

De drie primaire stakeholder-belangen:
- **Business**: Levert de investering waarde op?
- **User**: Krijgen we wat we nodig hebben?
- **Supplier**: Kunnen we het bouwen/leveren?

Deze drie belangen moeten vertegenwoordigd zijn in de projectorganisatie.

De rollen:
- Project Board (stuurgroep)
- Project Manager
- Team Manager(s)
- Project Support
- Project Assurance

We gaan hier in een aparte les dieper op in.

**Principe 4: Manage by Stages (Stuur per fase)**

Een PRINCE2 project wordt gepland en beheerst per management stage.

Waarom stages?
- Behapbare planning horizons
- Beslismomenten voor go/no-go
- Risico's beperken
- Voortgang meetbaar maken

Minimum twee stages:
1. Initiation Stage
2. Ten minste één delivery stage

Bij een stage boundary:
- Review van huidige stage
- Planning van volgende stage
- Go/no-go beslissing door Project Board

**Principe 5: Manage by Exception (Stuur op uitzondering)**

De Project Board hoeft alleen in te grijpen als toleranties worden overschreden.

Toleranties kunnen worden gezet op:
- Tijd: +/- 2 weken
- Kosten: +/- €10.000
- Scope: Specifieke features
- Kwaliteit: Acceptatiecriteria
- Risk: Risk appetite
- Benefit: Verwachte baten

Binnen toleranties: Project Manager beslist
Buiten toleranties: Escalatie naar Project Board (Exception Report)

Dit bespaart management tijd en geeft de PM ruimte om te managen.

**Principe 6: Focus on Products**

Een PRINCE2 project is gericht op producten (deliverables), niet op activiteiten.

Product-based planning:
1. Wat moet worden opgeleverd? (Product Breakdown Structure)
2. Wat zijn de kwaliteitseisen? (Product Descriptions)
3. In welke volgorde? (Product Flow Diagram)
4. Dan pas: welke activiteiten?

Dit zorgt voor:
- Duidelijke scope
- Meetbare voortgang
- Kwaliteitsfocus

**Principe 7: Tailor to Suit the Project Environment**

PRINCE2 moet worden aangepast aan de specifieke projectcontext.

Factoren om te overwegen:
- Projectgrootte en complexiteit
- Risicoprofiel
- Organisatiecultuur
- Externe vs. interne klant
- Beschikbare expertise

Wat kun je tailoren?
- Processen: Combineren of vereenvoudigen
- Thema's: Diepgang aanpassen
- Rollen: Combineren (niet elimineren)
- Management producten: Templates aanpassen

Wat kun je NIET tailoren?
- De 7 principes zelf - die zijn altijd van toepassing

**Samenvatting: De 7 Principes**

1. Continued Business Justification - Voortdurende zakelijke rechtvaardiging
2. Learn from Experience - Leer van ervaringen
3. Defined Roles and Responsibilities - Gedefinieerde rollen en verantwoordelijkheden
4. Manage by Stages - Stuur per fase
5. Manage by Exception - Stuur op uitzondering
6. Focus on Products - Focus op producten
7. Tailor to Suit the Project Environment - Pas aan op het project`,
      keyTakeaways: [
        'The 7 principles are mandatory - otherwise it is not PRINCE2',
        'Business justification must remain valid throughout the entire project',
        'Manage by Exception gives the PM freedom within tolerances',
        'Tailoring is essential but the principles remain intact',
      ],
      keyTakeawaysNL: [
        'De 7 principes zijn verplicht - anders is het geen PRINCE2',
        'Business justification moet gedurende heel het project geldig blijven',
        'Manage by Exception geeft PM ruimte binnen toleranties',
        'Tailoring is essentieel maar de principes blijven intact',
      ],
      keyTakeawaysEN: [
        'The 7 principles are mandatory - otherwise it is not PRINCE2',
        'Business justification must remain valid throughout the entire project',
        'Manage by Exception gives the PM room to operate within tolerances',
        'Tailoring is essential but the principles remain intact',
      ],
      resources: [
        {
          name: '7 Principes Samenvatting',
          type: 'PDF',
          size: '890 KB',
          description: 'One-pager met alle principes',
        },
      ],
    },
    {
      id: 'p2-l3',
      title: 'The 7 Themes - Overview',
      titleNL: 'De 7 Thema\'s - Overzicht',
      duration: '20:00',
      type: 'video',
      videoUrl: '',
      transcript: `De 7 thema\'s beschrijven aspecten van projectmanagement die continu 
aandacht nodig hebben gedurende het project.

**Wat zijn Thema's?**

Thema's zijn onderwerpen die je gedurende het hele project moet managen. Ze geven 
antwoord op belangrijke vragen:

1. **Business Case**: Waarom?
2. **Organization**: Wie?
3. **Quality**: Wat (specificaties)?
4. **Plans**: Hoe? Hoeveel? Wanneer?
5. **Risk**: Wat als?
6. **Change**: Wat is de impact?
7. **Progress**: Waar staan we? Waar gaan we heen?

**Thema 1: Business Case**

Het Business Case thema zorgt dat het project waarde levert.

Key questions:
- Waarom doen we dit project?
- Wat zijn de verwachte benefits?
- Wat zijn de kosten en risico\'s?
- Is dit nog steeds de beste investering?

De Business Case wordt:
- Opgesteld in Initiatie
- Gevalideerd bij elke stage boundary
- Geüpdatet bij wijzigingen
- Geëvalueerd na afloop (benefits realization)

**Thema 2: Organization**

Het Organization thema definieert wie wat doet.

De PRINCE2 organisatiestructuur:
- **Corporate/Programme Management**: Delegeert naar project
- **Project Board**: Beslissingsniveau (Executive, Senior User, Senior Supplier)
- **Project Manager**: Dagelijks management
- **Team Manager**: Leidt werkpakketten
- **Project Assurance**: Onafhankelijke controle
- **Project Support**: Administratieve ondersteuning

Elk project heeft minimaal:
- Executive (eigenaar van Business Case)
- Senior User (vertegenwoordigt gebruikers)
- Senior Supplier (vertegenwoordigt leveranciers)
- Project Manager

**Thema 3: Quality**

Het Quality thema zorgt dat producten fit for purpose zijn.

Kernconcepten:
- **Quality Planning**: Wat zijn de eisen?
- **Quality Control**: Voldoen we aan de eisen?
- **Quality Assurance**: Werken onze processen?

Product Descriptions zijn cruciaal:
- Identifier en titel
- Doel
- Samenstelling
- Kwaliteitscriteria
- Kwaliteitstoleranties
- Kwaliteitsmethode

**Thema 4: Plans**

Het Plans thema beschrijft hoe producten worden opgeleverd.

PRINCE2 kent drie planningsniveaus:
1. **Project Plan**: Hele project, hoog niveau
2. **Stage Plan**: Huidige stage, gedetailleerd
3. **Team Plan**: Werkpakket, optioneel

Product-based planning stappen:
1. Schrijf de Project Product Description
2. Creëer de Product Breakdown Structure
3. Schrijf Product Descriptions
4. Creëer het Product Flow Diagram
5. Identificeer activiteiten en afhankelijkheden
6. Bereid schattingen voor
7. Bereid de planning voor
8. Analyseer risico\'s

**Thema 5: Risk**

Het Risk thema managet onzekerheid.

Risk = Effect of uncertainty on objectives

De Risk Management procedure:
1. Identify: Welke risico\'s zijn er?
2. Assess: Hoe waarschijnlijk? Wat is de impact?
3. Plan: Hoe gaan we ermee om?
4. Implement: Voer responses uit
5. Communicate: Informeer stakeholders

Risk responses:
- Threats: Avoid, Reduce, Fallback, Transfer, Accept, Share
- Opportunities: Exploit, Enhance, Share, Accept, Reject

**Thema 6: Change**

Het Change thema beheerst wijzigingen en issues.

Drie soorten issues (6e editie, let op exacte namen voor het examen):
1. **Request for Change**: Wijzigingsverzoek op baseline
2. **Off-specification**: Afwijking van specificatie (kleine letter 's')
3. **Problem/Concern**: Overig issue

Het Change Control proces:
1. Capture: Registreer het issue
2. Examine: Analyseer impact
3. Propose: Stel oplossing voor
4. Decide: Neem beslissing (binnen autoriteit)
5. Implement: Voer door

Change Authority kan worden gedelegeerd door de Project Board.

**Thema 7: Progress**

Het Progress thema monitort voortgang en besluit over toekomst.

Mechanismen:
- **Tolerances**: Grenzen voor delegatie
- **Reviews**: Stage gates, checkpoints
- **Reports**: Highlight Reports, End Stage Reports
- **Exception management**: Escalatie bij overschrijding

Controls:
- Time-driven: Highlight Reports (bijv. elke 2 weken)
- Event-driven: Exception Reports, End Stage Reports

**Hoe de Thema's Samenwerken**

De thema\'s zijn geïntegreerd:
- Business Case rechtvaardigt de investering
- Organization wijst verantwoordelijkheden toe
- Quality definieert wat "goed" is
- Plans beschrijft hoe we het bereiken
- Risk beheerst onzekerheid
- Change managet wijzigingen
- Progress meet waar we staan

In de volgende lessen gaan we dieper in op elk thema.`,
      keyTakeaways: [
        'Themes are aspects that require continuous attention',
        'Business Case answers "why", Organization answers "who", etc.',
        'All themes are integrated and influence each other',
        'The depth of each theme depends on tailoring',
      ],
      keyTakeawaysNL: [
        'Thema\'s zijn aspecten die continu aandacht nodig hebben',
        'Business Case beantwoordt "waarom", Organization "wie", etc.',
        'Alle thema\'s zijn geïntegreerd en beïnvloeden elkaar',
        'De diepgang van elk thema hangt af van tailoring',
      ],
      keyTakeawaysEN: [
        'Themes are aspects that require continuous attention',
        'Business Case answers "why", Organization answers "who", etc.',
        'All themes are integrated and influence each other',
        'The depth of each theme depends on tailoring',
      ],
      resources: [
        {
          name: '7 Thema\'s Poster',
          type: 'PDF',
          size: '1.8 MB',
          description: 'Visueel overzicht van alle thema\'s',
        },
      ],
    },
    {
      id: 'p2-l4',
      title: 'Quiz: Principles & Themes',
      titleNL: 'Quiz: Principes & Thema\'s',
      duration: '15:00',
      type: 'quiz',
      quiz: [
        {
          id: 'p2-q1',
          question: 'Hoeveel principes heeft PRINCE2?',
          options: ['5', '6', '7', '8'],
          correctAnswer: 2,
          explanation: 'PRINCE2 heeft 7 principes, 7 thema\'s en 7 processen.',
          questionEN: 'How many principles does PRINCE2 have?',
          optionsEN: ['5', '6', '7', '8'],
          explanationEN: 'PRINCE2 has 7 principles, 7 themes and 7 processes.',
        },
        {
          id: 'p2-q2',
          question: 'Welk principe stelt dat een project gedurende de hele looptijd zakelijk gerechtvaardigd moet zijn?',
          options: ['Learn from Experience', 'Continued Business Justification', 'Manage by Exception', 'Focus on Products'],
          correctAnswer: 1,
          explanation: 'Continued Business Justification zorgt dat het project altijd waarde blijft leveren.',
          questionEN: 'Which principle states that a project must remain justified from a business perspective throughout its entire lifetime?',
          optionsEN: ['Learn from Experience', 'Continued Business Justification', 'Manage by Exception', 'Focus on Products'],
          explanationEN: 'Continued Business Justification ensures that the project always continues to deliver value.',
        },
        {
          id: 'p2-q3',
          question: 'Wat kun je NIET tailoren in PRINCE2?',
          options: ['Processen', 'Thema\'s', 'Rollen', 'De 7 principes'],
          correctAnswer: 3,
          explanation: 'De 7 principes zijn niet onderhandelbaar. Anders doe je geen PRINCE2.',
          questionEN: 'What can you NOT tailor in PRINCE2?',
          optionsEN: ['Processes', 'Themes', 'Roles', 'The 7 principles'],
          explanationEN: 'The 7 principles are non-negotiable. If you do not follow them, you are not doing PRINCE2.',
        },
        {
          id: 'p2-q4',
          question: 'Welk thema beantwoordt de vraag "Wie?"',
          options: ['Business Case', 'Organization', 'Quality', 'Plans'],
          correctAnswer: 1,
          explanation: 'Het Organization thema definieert rollen en verantwoordelijkheden.',
          questionEN: 'Which theme answers the question "Who?"',
          optionsEN: ['Business Case', 'Organization', 'Quality', 'Plans'],
          explanationEN: 'The Organization theme defines roles and responsibilities.',
        },
        {
          id: 'p2-q5',
          question: 'Wat betekent "Manage by Exception"?',
          options: [
            'Alleen uitzonderlijke projecten managen',
            'De Board grijpt alleen in als toleranties worden overschreden',
            'Excepties worden niet toegestaan',
            'Elke beslissing gaat naar de Board'
          ],
          correctAnswer: 1,
          explanation: 'Manage by Exception geeft de PM ruimte binnen toleranties en bespaart Board-tijd.',
          questionEN: 'What does "Manage by Exception" mean?',
          optionsEN: [
            'Only managing exceptional projects',
            'The Project Board only intervenes when tolerances are exceeded',
            'Exceptions are not permitted',
            'Every decision goes to the Project Board'
          ],
          explanationEN: 'Manage by Exception gives the PM freedom to operate within tolerances and saves Project Board time.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 2: DE 7 THEMA'S IN DETAIL
// ============================================
const module2: Module = {
  order: 1,
  id: 'p2-m2',
  title: 'Module 2: The 7 Themes in Detail',
  titleNL: 'Module 2: De 7 Thema\'s in Detail',
  description: 'Deep dive into each PRINCE2 theme with practical examples.',
  descriptionNL: 'Diepgaande behandeling van elk PRINCE2 thema met praktijkvoorbeelden.',
  lessons: [
    {
      id: 'p2-l5',
      title: 'Business Case Theme',
      titleNL: 'Business Case Thema',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      transcript: `Het Business Case thema is het hart van PRINCE2. Het zorgt dat projecten 
waarde leveren en blijven leveren gedurende hun looptijd.

**Het Doel van het Business Case Thema**

Het thema zorgt voor:
- Mechanisme om te beoordelen of project levensvatbaar en wenselijk is
- Continue rechtvaardiging gedurende het project
- Basis voor besluitvorming

**De Business Case Ontwikkeling**

De Business Case evolueert door het project:

**1. Pre-project (SU)**
- Outline Business Case
- Geschreven door Executive
- High-level, indicatief

**2. Initiation Stage (IP)**
- Detailed Business Case
- Verfijnd met betere schattingen
- Onderdeel van PID

**3. Elke Stage Boundary**
- Update en validatie
- Klopt de justification nog?
- Zijn aannames nog geldig?

**4. Project Closure**
- Final review
- Werkelijke benefits vs. verwacht
- Post-project benefits review gepland

**De Structuur van een Business Case**

**1. Executive Summary**
Korte samenvatting voor beslissers.

**2. Reasons**
Waarom doen we dit project?
- Probleem of kans
- Strategische fit

**3. Business Options**
Welke opties zijn er?
- Do nothing
- Do minimum
- Do something (recommended)

**4. Expected Benefits**
Wat levert het op?
- Kwantitatief waar mogelijk
- Wanneer worden ze gerealiseerd?
- Hoe worden ze gemeten?

**5. Expected Dis-benefits**
Negatieve gevolgen:
- Tijdelijke verstoring
- Kosten voor migratie

**6. Timescale**
Wanneer worden benefits gerealiseerd?

**7. Costs**
- Project costs
- Ongoing operational costs

**8. Investment Appraisal**
- ROI, NPV, Payback period
- Vergelijking met alternatieven

**9. Major Risks**
De belangrijkste bedreigingen en kansen.

**Benefits Management**

Benefits zijn de meetbare verbeteringen door het project.

**Benefits Management Approach:**
- Hoe identificeren we benefits?
- Hoe meten we ze?
- Wie is verantwoordelijk?
- Wanneer reviewen we?

**Senior User** is verantwoordelijk voor:
- Benefits specificeren
- Benefits realisatie na project

**Veel Benefits worden pas NA het project gerealiseerd!**
Daarom is post-project benefits review essentieel.

**De Executive en de Business Case**

De Executive:
- Is eigenaar van de Business Case
- Zorgt voor funding
- Valideert bij elke stage
- Beslist over projectcontinuatie

De PM ondersteunt maar beslist niet over business justification.

**Samenvatting**

Het Business Case thema:
- Rechtvaardigt het project continue
- Evolueert van outline naar detailed
- Wordt gevalideerd bij elke stage gate
- Is eigendom van de Executive
- Koppelt aan benefits realization`,
      keyTakeaways: [
        'The Business Case must remain valid throughout the entire project',
        'The Executive is the owner of the Business Case',
        'Benefits are often only realized after the project',
        'The Business Case evolves from outline to detailed',
      ],
      keyTakeawaysNL: [
        'De Business Case moet gedurende het hele project geldig blijven',
        'Executive is eigenaar van de Business Case',
        'Benefits worden vaak pas na het project gerealiseerd',
        'De Business Case evolueert van outline naar detailed',
      ],
      keyTakeawaysEN: [
        'The Business Case must remain valid throughout the entire project',
        'The Executive is the owner of the Business Case',
        'Benefits are often only realized after the project ends',
        'The Business Case evolves from outline to detailed',
      ],
    },
    {
      id: 'p2-l6',
      title: 'Organization Theme',
      titleNL: 'Organization Thema',
      duration: '20:00',
      type: 'video',
      videoUrl: '',
      transcript: `Het Organization thema definieert de structuur van rollen en 
verantwoordelijkheden binnen een PRINCE2 project.

**De PRINCE2 Project Organisatie**

Corporate/Programme Management
           |
      Project Board
    /      |        \\
Executive Senior User Senior Supplier
           |
    Project Manager
    /            \\
Team Manager  Project Support
                Project Assurance

**De Vier Managementniveaus**

**1. Corporate/Programme Management**
- Boven het project
- Stelt project aan
- Ontvangt rapportages
- Niet direct betrokken bij dagelijks management

**2. Directing (Project Board)**
- Beslist over het project
- Autoriseert stages
- Escaleert issues
- Management by exception

**3. Managing (Project Manager)**
- Dagelijkse management
- Rapporteert aan Board
- Coördineert werkzaamheden

**4. Delivering (Team Manager)**
- Levert producten
- Rapporteert aan PM
- Managed werkpakketten

**De Project Board Rollen**

**Executive**
- Eigenaar van Business Case
- Voorzitter van Project Board
- Heeft doorslaggevende stem
- Zorgt voor funding en resources

**Senior User**
- Vertegenwoordigt gebruikers
- Specificeert behoeften
- Verantwoordelijk voor benefits realization
- Accepteert producten namens gebruikers

**Senior Supplier**
- Vertegenwoordigt leveranciers
- Voorziet in resources
- Verantwoordelijk voor technische integriteit
- Kan intern of extern zijn

**De Project Manager**

Verantwoordelijk voor:
- Dagelijks management
- Planning en control
- Rapporteren aan Board
- Team management
- Stakeholder engagement

De PM is NIET lid van de Project Board!

**Project Assurance**

Onafhankelijke controle dat het project correct verloopt.

Drie aspecten:
- Business assurance (Executive)
- User assurance (Senior User)
- Supplier assurance (Senior Supplier)

Kan worden gedelegeerd aan anderen, maar accountability blijft bij Board.

**Change Authority**

De Board kan wijzigingsbevoegdheid delegeren:
- Voor bepaalde typen wijzigingen
- Binnen bepaalde budgetgrenzen
- Aan de PM of een change authority

**Project Support**

Administratieve ondersteuning:
- Documentbeheer
- Configuratiemanagement
- Planning tools
- Rapportages

**Team Manager**

Optionele rol voor:
- Aansturen van werkpakketten
- Rapporteren aan PM
- Technische expertise

Bij kleine projecten kan de PM dit zelf doen.

**Rollen Combineren**

In kleine projecten kunnen rollen gecombineerd worden:
- Executive + Senior User
- PM + Team Manager
- PM + Project Support

Maar:
- Executive en Senior Supplier niet combineren (belangenconflict)
- Alle drie stakeholder belangen moeten vertegenwoordigd zijn

**Samenvatting**

Het Organization thema:
- Definieert vier managementniveaus
- Zorgt voor drie stakeholder belangen in de Board
- Scheidt directing van managing
- Staat aanpassing toe voor projectgrootte`,
      keyTakeaways: [
        'Three stakeholder interests: Business, User, Supplier',
        'The Project Board directs, the Project Manager manages',
        'The PM is not a member of the Project Board',
        'Roles can be combined but not eliminated',
      ],
      keyTakeawaysNL: [
        'Drie stakeholder belangen: Business, User, Supplier',
        'Project Board bestuurt, Project Manager managed',
        'De PM is geen lid van de Project Board',
        'Rollen kunnen gecombineerd worden maar niet geëlimineerd',
      ],
      keyTakeawaysEN: [
        'Three stakeholder interests: Business, User, Supplier',
        'The Project Board directs, the Project Manager manages',
        'The PM is not a member of the Project Board',
        'Roles can be combined but not eliminated',
      ],
    },
    {
      id: 'p2-l7',
      title: 'Quality Theme',
      titleNL: 'Quality Thema',
      duration: '16:00',
      type: 'video',
      videoUrl: '',
      transcript: `Het Quality thema zorgt dat projectproducten fit for purpose zijn - 
geschikt voor hun beoogde doel.

**Quality in PRINCE2**

Quality = de mate waarin features en karakteristieken van een product 
voldoen aan verwachtingen.

Niet: perfectie of maximum functionaliteit
Wel: voldoen aan gespecificeerde eisen

**Quality Management Approach**

Het document dat beschrijft:
- Quality standaarden die van toepassing zijn
- Kwaliteitsprocedures
- Verantwoordelijkheden
- Tools en technieken

**Product Descriptions**

De basis voor kwaliteit in PRINCE2.

Elke Product Description bevat:
1. **Identifier**: Unieke code
2. **Title**: Naam van het product
3. **Purpose**: Waarom is dit product nodig?
4. **Composition**: Waaruit bestaat het?
5. **Derivation**: Waar komt input vandaan?
6. **Format and Presentation**: Hoe ziet het eruit?
7. **Development Skills**: Wie kan dit maken?
8. **Quality Criteria**: Meetbare kwaliteitseisen
9. **Quality Tolerance**: Toegestane afwijking
10. **Quality Method**: Hoe controleren we kwaliteit?

**De Project Product Description**

Speciaal voor het eindproduct:
- Wat levert het project op?
- Wat zijn de acceptatiecriteria?
- Hoe wordt geaccepteerd?

Wordt geschreven in SU, verfijnd in IP.

**Quality Control**

Het daadwerkelijk controleren van producten:

**Quality Review Technique:**
1. Prepare: Reviewer bestudeert product
2. Review: Formele sessie, issues bespreken
3. Follow-up: Issues oplossen en afsluiten

Rollen in Quality Review:
- Chair: Leidt de review
- Presenter: Presenteert het product
- Reviewer: Checkt tegen criteria
- Administrator: Notuleert

**Quality Path**

De volgorde van kwaliteitsactiviteiten:
1. Kwaliteitscriteria definiëren (Product Description)
2. Kwaliteitsmethode bepalen
3. Product ontwikkelen
4. Quality check uitvoeren
5. Product goedkeuren
6. Quality Register updaten

**Quality Register**

Log van alle kwaliteitsactiviteiten:
- Geplande reviews
- Uitgevoerde reviews
- Resultaten
- Issues en follow-up

**Acceptatie Criteria**

Criteria waaraan producten moeten voldoen voor acceptatie:
- Meetbaar
- Testbaar
- Vooraf gedefinieerd

**Samenvatting**

Het Quality thema:
- Definieert kwaliteit als "fit for purpose"
- Gebruikt Product Descriptions als basis
- Past Quality Review Technique toe
- Houdt Quality Register bij
- Is gericht op vooraf gedefinieerde criteria`,
      keyTakeaways: [
        'Quality = fit for purpose, not perfection',
        'Product Descriptions define quality criteria upfront',
        'Quality Review Technique is the standard control method',
        'Quality Register logs all quality activities',
      ],
      keyTakeawaysNL: [
        'Quality = fit for purpose, niet perfectie',
        'Product Descriptions definiëren kwaliteitscriteria vooraf',
        'Quality Review Technique is de standaard controlemethode',
        'Quality Register logt alle kwaliteitsactiviteiten',
      ],
      keyTakeawaysEN: [
        'Quality = fit for purpose, not perfection',
        'Product Descriptions define quality criteria upfront',
        'Quality Review Technique is the standard control method',
        'Quality Register logs all quality activities',
      ],
    },
    {
      id: 'p2-l8',
      title: 'Plans Theme',
      titleNL: 'Plans Thema',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      transcript: `Het Plans thema beschrijft hoe plannen worden gemaakt en gebruikt 
binnen PRINCE2.

**Planning Niveaus**

PRINCE2 kent drie planningsniveaus:

**1. Project Plan**
- Hele project
- Hoog niveau
- Gemaakt in IP
- Gebruikt door Project Board
- Geupdate bij stage boundaries

**2. Stage Plan**
- Huidige management stage
- Gedetailleerd
- Gemaakt aan einde vorige stage
- Gebruikt door PM
- Basis voor dagelijks management

**3. Team Plan (optioneel)**
- Werkpakket niveau
- Meest gedetailleerd
- Gemaakt door Team Manager
- Niet formeel vereist door PRINCE2

**Product-Based Planning**

PRINCE2 plant op basis van producten, niet activiteiten.

Stappen:
1. Schrijf de Project Product Description
2. Maak Product Breakdown Structure (PBS)
3. Schrijf Product Descriptions
4. Maak Product Flow Diagram
5. Identificeer activiteiten per product
6. Maak schattingen
7. Maak de schedule
8. Analyseer risico\'s
9. Documenteer aannames

**Product Breakdown Structure**

Hiërarchische decompositie van producten:

    Final Product
    /    |     \\
Product Product Product
  A       B       C
  |       |
Sub-A1  Sub-B1
Sub-A2  Sub-B2

**Product Flow Diagram**

Toont de volgorde en afhankelijkheden:

[Product A] → [Product B] → [Final Product]
                  ↑
            [Product C]

**Exception Plan**

Wordt gemaakt wanneer toleranties dreigen te worden overschreden:
- Vervangt de rest van de huidige Stage Plan
- OF vervangt de rest van de Project Plan
- Moet worden goedgekeurd door hogere autoriteit

**Planning Horizon**

Hoever vooruit plan je in detail?

- Project Plan: Hele project, minder detail
- Stage Plan: Deze stage, veel detail
- Team Plan: Dit werkpakket, meeste detail

Dit heet "rolling wave planning" - detail groeit naarmate je dichterbij komt.

**Samenvatting**

Het Plans thema:
- Kent drie niveaus: Project, Stage, Team
- Gebruikt product-based planning
- Werkt met PBS en Product Flow Diagram
- Past rolling wave planning toe
- Heeft Exception Plans voor afwijkingen`,
      keyTakeaways: [
        'Three planning levels: Project, Stage, Team',
        'Product-based planning focuses on WHAT, not HOW',
        'PBS and Product Flow Diagram are core techniques',
        'Exception Plans for when tolerances are exceeded',
      ],
      keyTakeawaysNL: [
        'Drie planningsniveaus: Project, Stage, Team',
        'Product-based planning focust op WAT, niet HOE',
        'PBS en Product Flow Diagram zijn kerntechnieken',
        'Exception Plans voor wanneer toleranties worden overschreden',
      ],
      keyTakeawaysEN: [
        'Three planning levels: Project, Stage, Team',
        'Product-based planning focuses on WHAT, not HOW',
        'PBS and Product Flow Diagram are core techniques',
        'Exception Plans for when tolerances are exceeded',
      ],
    },
    {
      id: 'p2-l9',
      title: 'Risk, Change & Progress Themes',
      titleNL: 'Risk, Change & Progress Thema\'s',
      duration: '20:00',
      type: 'video',
      videoUrl: '',
      transcript: `In deze les behandelen we de laatste drie thema\'s: Risk, Change en Progress.

**RISK THEMA**

Het Risk thema managet onzekerheid in het project.

**Risk Definitie:**
Risk = Effect of uncertainty on objectives
Kan positief (opportunity) of negatief (threat) zijn.

**Risk Management Procedure:**
1. **Identify**: Welke risico\'s zijn er?
2. **Assess**: Probability × Impact = Risk Score
3. **Plan**: Kies een response strategie
4. **Implement**: Voer de response uit
5. **Communicate**: Informeer stakeholders

**Risk Responses voor Threats:**
- **Avoid**: Elimineer de oorzaak
- **Reduce**: Verklein kans of impact
- **Fallback**: Plan B als de response mislukt
- **Transfer**: Verzekering, contract
- **Accept**: Neem het risico
- **Share**: Deel met andere partij

**Risk Responses voor Opportunities:**
- **Exploit**: Zorg dat het gebeurt
- **Enhance**: Verhoog kans of impact
- **Share**: Deel de opportunity
- **Accept**: Hoop dat het gebeurt
- **Reject**: Negeer de opportunity

**Risk Register:**
Centrale log van alle risico\'s met:
- Risk ID en beschrijving
- Probability en Impact scores
- Response en eigenaar
- Status

**CHANGE THEMA**

Het Change thema beheerst wijzigingen en issues.

**Issue Types:**
1. **Request for Change**: Wijziging op baseline
2. **Off-specification**: Product voldoet niet aan spec
3. **Problem/Concern**: Overige issues

**Issue & Change Control Procedure:**
1. **Capture**: Registreer in Issue Register
2. **Examine**: Analyseer impact op baseline
3. **Propose**: Stel oplossing voor
4. **Decide**: Binnen autoriteit beslissen
5. **Implement**: Voer beslissing door

**Change Authority:**
- Board kan authority delegeren
- Binnen budget (change budget)
- Voor bepaalde typen changes

**Configuration Management:**
- Tracking van product versies
- Baseline control
- Configuration Item Records

**PROGRESS THEMA**

Het Progress thema monitort en beheerst voortgang.

**Controls:**

**Management by Exception:**
- Toleranties per niveau
- Escalatie alleen bij overschrijding

**Reports:**
- **Checkpoint Report**: Team → PM (regelmatig)
- **Highlight Report**: PM → Board (regelmatig)
- **End Stage Report**: PM → Board (per stage)
- **Exception Report**: PM → Board (bij tolerantie breach)

**Reviews:**
- Stage gates
- Quality reviews
- Lessons learned sessions

**Toleranties:**
Kunnen worden gezet op:
- Time
- Cost
- Scope
- Quality
- Risk
- Benefits

**Samenvatting**

De drie thema\'s werken samen:
- Risk identificeert onzekerheden
- Change beheerst wijzigingen
- Progress meet en rapporteert voortgang

Alle drie gebruiken registers en rapportages om de Board geïnformeerd te houden.`,
      keyTakeaways: [
        'Risk management: Identify → Assess → Plan → Implement → Communicate',
        'Three issue types: Request for Change, Off-specification, Problem/Concern',
        'Progress works with tolerances and management by exception',
        'Checkpoint, Highlight, and Exception Reports inform different levels',
      ],
      keyTakeawaysNL: [
        'Risk management: Identify → Assess → Plan → Implement → Communicate',
        'Drie issue types: Request for Change, Off-specification, Problem/Concern',
        'Progress werkt met toleranties en management by exception',
        'Checkpoint, Highlight en Exception Reports informeren verschillende niveaus',
      ],
      keyTakeawaysEN: [
        'Risk management: Identify → Assess → Plan → Implement → Communicate',
        'Three issue types: Request for Change, Off-specification, Problem/Concern',
        'Progress works with tolerances and management by exception',
        'Checkpoint, Highlight, and Exception Reports inform different levels',
      ],
    },
    {
      id: 'p2-l9b',
      title: 'Quiz: The 7 Themes',
      titleNL: 'Quiz: De 7 Thema\'s',
      duration: '15:00',
      type: 'quiz',
      quiz: [
        {
          id: 'p2-q-t1',
          question: 'Wie is verantwoordelijk voor de realisatie van benefits na het project?',
          options: [
            'Executive',
            'Project Manager',
            'Senior User',
            'Senior Supplier',
          ],
          correctAnswer: 2,
          explanation: 'De Senior User is verantwoordelijk voor het specificeren van benefits en het realiseren ervan na afloop van het project. De Executive is eigenaar van de Business Case maar delegeert de benefits-realisatie aan de Senior User.',
          questionEN: 'Who is accountable for the realisation of benefits after the project ends?',
          optionsEN: [
            'Executive',
            'Project Manager',
            'Senior User',
            'Senior Supplier',
          ],
          explanationEN: 'The Senior User is accountable for specifying benefits and for realising them after the project ends. The Executive owns the Business Case but delegates benefits realisation responsibility to the Senior User.',
        },
        {
          id: 'p2-q-t2',
          question: 'Welk veld in een Product Description legt de meetbare eisen vast waaraan een product moet voldoen?',
          options: [
            'Purpose (Doel)',
            'Composition (Samenstelling)',
            'Quality Criteria (Kwaliteitscriteria)',
            'Derivation (Herkomst)',
          ],
          correctAnswer: 2,
          explanation: 'Quality Criteria zijn de meetbare eigenschappen waaraan een product moet voldoen om te worden geaccepteerd. Ze worden vooraf gedefinieerd zodat kwaliteitscontroles objectief kunnen worden uitgevoerd.',
          questionEN: 'Which field in a Product Description records the measurable requirements that a product must meet?',
          optionsEN: [
            'Purpose',
            'Composition',
            'Quality Criteria',
            'Derivation',
          ],
          explanationEN: 'Quality Criteria are the measurable characteristics that a product must meet to be accepted. They are defined upfront so that quality checks can be carried out objectively.',
        },
        {
          id: 'p2-q-t3',
          question: 'Welke rollen zijn betrokken bij de Quality Review Technique in PRINCE2 6e editie?',
          options: [
            'Chair, Presenter, Reviewer, Administrator',
            'Executive, Project Manager, Team Manager, Project Support',
            'Producer, Reviewer, Approver, Quality Assurance',
            'Project Board, Change Authority, Risk Owner, Project Manager',
          ],
          correctAnswer: 0,
          explanation: 'De Quality Review Technique kent vier rollen: Chair (leidt de sessie), Presenter (presenteert het product), Reviewer (toetst het product aan criteria) en Administrator (notuleert en beheert acties). Dit zijn de officiële PRINCE2 6e editie rollen.',
          questionEN: 'Which roles are involved in the Quality Review Technique in PRINCE2 6th edition?',
          optionsEN: [
            'Chair, Presenter, Reviewer, Administrator',
            'Executive, Project Manager, Team Manager, Project Support',
            'Producer, Reviewer, Approver, Quality Assurance',
            'Project Board, Change Authority, Risk Owner, Project Manager',
          ],
          explanationEN: 'The Quality Review Technique has four roles: Chair (chairs the review meeting), Presenter (presents the product), Reviewer (reviews the product against criteria) and Administrator (records actions and issues). These are the official PRINCE2 6th edition roles.',
        },
        {
          id: 'p2-q-t4',
          question: 'Welke drie typen issues erkent het PRINCE2 Change thema?',
          options: [
            'Bug, Enhancement, Risk',
            'Request for Change, Off-specification, Problem/Concern',
            'Request for Change, Exception, Defect',
            'Problem/Concern, Exception Report, Change Request',
          ],
          correctAnswer: 1,
          explanation: 'Het PRINCE2 Change thema erkent drie issue-typen: (1) Request for Change — voorstel voor een voordelige wijziging op de baseline; (2) Off-specification — een product dat niet voldoet aan zijn Product Description; (3) Problem/Concern — overig issue dat aandacht vereist. Let op de schrijfwijze "Off-specification" (kleine \'s\').',
          questionEN: 'Which three types of issue does the PRINCE2 Change theme recognise?',
          optionsEN: [
            'Bug, Enhancement, Risk',
            'Request for Change, Off-specification, Problem/Concern',
            'Request for Change, Exception, Defect',
            'Problem/Concern, Exception Report, Change Request',
          ],
          explanationEN: 'The PRINCE2 Change theme recognises three issue types: (1) Request for Change — a proposal for a beneficial change to the baseline; (2) Off-specification — a product that does not meet its Product Description; (3) Problem/Concern — any other issue requiring attention. Note the correct capitalisation: "Off-specification" with a lower-case \'s\'.',
        },
        {
          id: 'p2-q-t5',
          question: 'Op welk niveau is het Project Plan van toepassing en wie gebruikt het primair?',
          options: [
            'Werkpakket-niveau, gebruikt door Team Manager',
            'Stage-niveau, gebruikt door Project Manager',
            'Projectniveau (hoog niveau, hele project), gebruikt door de Project Board',
            'Programmaniveau, gebruikt door Corporate Management',
          ],
          correctAnswer: 2,
          explanation: 'Het Project Plan beslaat het hele project op hoog niveau en is het primaire planningsdocument voor de Project Board. Het wordt gemaakt in IP en bijgewerkt bij elke stage boundary. Het Stage Plan is gedetailleerder en wordt gebruikt door de Project Manager voor dagelijks beheer.',
          questionEN: 'At which level does the Project Plan operate and who uses it primarily?',
          optionsEN: [
            'Work Package level, used by the Team Manager',
            'Stage level, used by the Project Manager',
            'Project level (high-level, whole project), used by the Project Board',
            'Programme level, used by Corporate Management',
          ],
          explanationEN: 'The Project Plan covers the whole project at a high level and is the primary planning document for the Project Board. It is created during IP and updated at each stage boundary. The Stage Plan is more detailed and is used by the Project Manager for day-to-day management.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 3: DE 7 PROCESSEN
// ============================================
const module3: Module = {
  order: 2,
  id: 'p2-m3',
  title: 'Module 3: The 7 Processes',
  titleNL: 'Module 3: De 7 Processen',
  description: 'The complete PRINCE2 processes from start to finish.',
  descriptionNL: 'De complete PRINCE2 processen van start tot finish.',
  lessons: [
    {
      id: 'p2-l10',
      title: 'Starting Up a Project (SU)',
      titleNL: 'Starting Up a Project (SU)',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      transcript: `Starting Up a Project (SU) is het eerste proces van PRINCE2. 
Het zorgt dat er een levensvatbaar project is voordat significante resources worden ingezet.

**Doel van SU**

Het doel is een kort, pre-project proces dat:
- Vereisten verzamelt voor de Project Board
- Verifieert dat het project de moeite waard is
- De basis legt voor initiatie
- Onnodige initiatie voorkomt

SU vindt plaats VOORDAT het project officieel start.

**Wanneer wordt SU uitgevoerd?**

SU wordt getriggerd door een project mandate - de vraag vanuit de organisatie om 
iets te doen. Dit kan zijn:
- Een goedgekeurde business case op hoog niveau
- Een verzoek van een klant
- Een strategisch besluit

**Activiteiten in SU**

**1. Appoint the Executive and the Project Manager**
- Executive wordt benoemd door Corporate/Programme Management
- Project Manager wordt benoemd door de Executive
- Dit zijn de eerste twee rollen die gevuld worden

**2. Capture Previous Lessons**
- Welke lessen zijn er van vergelijkbare projecten?
- Wat ging goed/fout?
- Welke risico\'s manifesteerden zich?

Dit is toepassing van Principe 2: Learn from Experience.

**3. Design and Appoint the Project Management Team**
- Wie zit in de Project Board?
- Wie vervult welke rollen?
- Hoe is de rapportagelijn?

De drie belangen moeten vertegenwoordigd zijn:
- Business: Executive
- User: Senior User(s)
- Supplier: Senior Supplier(s)

**4. Prepare the Outline Business Case**
- Eerste versie van de Business Case
- Nog niet volledig gedetailleerd
- Voldoende om te bepalen of initiatie zinvol is

Bevat:
- Redenen voor het project
- Verwachte benefits
- Indicatieve kosten en tijdlijn
- Grote risico\'s

**5. Select the Project Approach and Assemble the Project Brief**
- Hoe gaan we het project aanpakken?
- Buy vs. build?
- Waterfall vs. Agile?

Het Project Brief vat alles samen:
- Project Definition
- Outline Business Case
- Project Product Description
- Project Approach
- Project Management Team structure
- Role descriptions

**6. Plan the Initiation Stage**
- Hoeveel tijd en resources zijn nodig voor initiatie?
- Dit wordt het Stage Plan voor de Initiation Stage

**Output van SU**

Het belangrijkste output is het Project Brief, wat input is voor:
- De Project Board om te beslissen over initiatie
- De Project Manager om de Initiation Stage te starten

**Wie doet wat in SU?**

| Activiteit | Uitvoerder |
|------------|------------|
| Appoint Executive & PM | Corporate/Programme |
| Capture lessons | PM |
| Design team | Executive & PM |
| Outline Business Case | Executive (PM ondersteunt) |
| Project Approach & Brief | PM |
| Plan Initiation Stage | PM |

**Veelgemaakte fouten**

- Te lang maken: SU moet kort zijn
- Te gedetailleerd: Dat komt in Initiatie
- Overslaan: "We weten wel wat we moeten doen"
- Verkeerde mensen: Board zonder beslissingsbevoegdheid

**Samenvatting**

Starting Up a Project:
- Is een pre-project proces (kort!)
- Beantwoordt: "Is dit initiëren waard?"
- Levert het Project Brief op
- Eindigt met een beslissing: Initiëren of niet?`,
      keyTakeaways: [
        'SU is a short pre-project process',
        'The Project Brief is the main product',
        'The Project Board is assembled during SU',
        'SU prevents unnecessary initiation of non-viable projects',
      ],
      keyTakeawaysNL: [
        'SU is een kort pre-project proces',
        'Het Project Brief is het hoofdproduct',
        'De Project Board wordt samengesteld in SU',
        'SU voorkomt onnodige initiatie van niet-levensvatbare projecten',
      ],
      keyTakeawaysEN: [
        'SU is a short pre-project process',
        'The Project Brief is the main deliverable',
        'The Project Board is assembled during SU',
        'SU prevents unnecessary initiation of non-viable projects',
      ],
    },
    {
      id: 'p2-l11',
      title: 'Initiating a Project (IP)',
      titleNL: 'Initiating a Project (IP)',
      duration: '20:00',
      type: 'video',
      videoUrl: '',
      transcript: `Initiating a Project (IP) is waar de fundamenten voor het project 
worden gelegd. Het produceert de Project Initiation Documentation (PID).

**Doel van IP**

Het doel is:
- Een solide basis voor het project leggen
- Begrijpen wat er gedaan moet worden
- Plannen hoe het bereikt wordt
- Zorgen dat de investering gerechtvaardigd blijft

**De Initiation Stage**

IP vindt plaats in de eerste management stage: de Initiation Stage. Dit is de enige 
"verplichte" stage in PRINCE2 (naast delivery stages).

Kenmerken:
- Korte stage (weken, niet maanden)
- Focus op planning, niet uitvoering
- Eindigt met go/no-go voor het project

**Activiteiten in IP**

**1. Agree the tailoring requirements**
- Hoe wordt PRINCE2 aangepast voor dit project?
- Welke processen en thema's worden vereenvoudigd?
- Leg dit vast zodat de Board weet wat te verwachten.

**2. Prepare the Risk Management Approach**
- Hoe gaan we met risico's om? (dit heet in de 6e editie "Risk Management Approach", niet "Strategy")
- Wie is verantwoordelijk?
- Welke tools gebruiken we?

**3. Prepare the Change Control Approach**
- Hoe beheren we producten, versies én wijzigingen? (6e editie combineert configuratiebeheer en wijzigingsbeheer in de "Change Control Approach")
- Hoe handelen we Issues, Requests for Change en Off-specifications af?
- Welke systemen gebruiken we?

**4. Prepare the Quality Management Approach**
- Wat zijn de kwaliteitsstandaarden? (6e editie: "Quality Management Approach")
- Hoe controleren we kwaliteit?
- Wie is verantwoordelijk?

**5. Prepare the Communication Management Approach**
- Wie moet wat weten? (6e editie: "Communication Management Approach")
- Hoe communiceren we?
- Wanneer en hoe vaak?

**6. Prepare the Benefits Management Approach**
- Welke benefits worden verwacht?
- Wanneer en hoe worden benefits gemeten na het project?
- Wie is verantwoordelijk (doorgaans de Senior User)?
- Dit document vervangt het "Benefits Review Plan" uit de 5e editie.

**7. Set Up the Project Controls**
- Welke toleranties?
- Welke rapporten?
- Welke beslismomenten?

**6. Create the Project Plan**
- Product-based planning toepassen
- Resources en kosten schatten
- Risico's analyseren

**7. Refine the Business Case**
- Kosten nu beter bekend
- Benefits verfijnen
- ROI berekenen

**8. Assemble the Project Initiation Documentation**
- Alle elementen samenbrengen
- PID is het "contract" voor het project

**De Project Initiation Documentation (PID)**

De PID bevat:

Baseline elementen:
- Project Definition
- Project Approach
- Business Case
- Project Management Team structure
- Role descriptions
- Quality Management Approach
- Change Control Approach
- Risk Management Approach
- Communication Management Approach
- Benefits Management Approach
- Project Plan
- Project Controls

De PID wordt gebruikt om:
- Het project te autoriseren (door Board)
- Voortgang tegen te meten
- Beslissingen te ondersteunen

**Tailoring de PID**

Voor kleine projecten kan de PID worden vereenvoudigd:
- Management-aanpakken (Approaches) kunnen als sectie in één document worden opgenomen
- Minder formele templates
- Korter en bondiger

Het principe blijft: documenteer wat je nodig hebt om het project te managen.

**Veelgemaakte fouten**

- Te lang in initiatie: "Analysis paralysis"
- Te weinig detail: Onvoldoende basis voor uitvoering
- Geen buy-in: PID niet gereviewed door stakeholders
- Nooit updaten: PID wordt "shelfware"

**Samenvatting**

Initiating a Project:
- Legt de fundamenten voor het project
- Produceert de PID (Project Initiation Documentation)
- Verfijnt de Business Case
- Creëert het Project Plan
- Eindigt met een go/no-go beslissing`,
      keyTakeaways: [
        'IP creates the Project Initiation Documentation (PID)',
        'The PID is the baseline for the project',
        'Five management approaches are prepared: Risk, Quality, Change Control, Communication, Benefits',
        'The Benefits Management Approach replaces the 5th-edition Benefits Review Plan',
        'The Business Case is refined with better cost estimates',
      ],
      keyTakeawaysNL: [
        'IP creëert de Project Initiation Documentation (PID)',
        'De PID is de baseline voor het project',
        'Vijf management-aanpakdocumenten worden opgesteld: Risk, Quality, Change Control, Communication, Benefits',
        'De Benefits Management Approach vervangt het "Benefits Review Plan" uit de 5e editie',
        'De Business Case wordt verfijnd met betere kostenschattingen',
      ],
      keyTakeawaysEN: [
        'IP creates the Project Initiation Documentation (PID)',
        'The PID is the baseline for the project',
        'Five management approaches are established: Risk, Quality, Change Control, Communication, Benefits',
        'The Benefits Management Approach replaces the 5th-edition Benefits Review Plan',
        'The Business Case is refined with better cost estimates',
      ],
    },
    {
      id: 'p2-l12',
      title: 'Directing a Project (DP)',
      titleNL: 'Directing a Project (DP)',
      duration: '15:00',
      type: 'video',
      videoUrl: '',
      transcript: `Directing a Project (DP) is het proces waarmee de Project Board het 
project bestuurt. Het loopt van start tot einde van het project.

**Doel van DP**

Het doel is de Project Board in staat te stellen:
- Het project te autoriseren
- Beslissingen te nemen op key decision points
- Management by Exception toe te passen
- Het project succesvol af te sluiten

**Wanneer is DP actief?**

DP loopt gedurende het hele project:
- Na SU: Beslissing om te initiëren
- Na IP: Beslissing om door te gaan
- Bij elke Stage Boundary: Beslissing over volgende stage
- Bij Exceptions: Ad-hoc beslissingen
- Aan het einde: Beslissing om af te sluiten

**Activiteiten in DP**

**1. Authorise Initiation**
- Review het Project Brief
- Beslis of initiatie mag starten
- Communiceer de beslissing

**2. Authorise the Project**
- Review de Project Initiation Documentation (PID)
- Beslis of het project mag starten
- Stel toleranties vast

**3. Authorise a Stage or Exception Plan**
- Review End Stage Report
- Review Stage Plan voor volgende stage
- Beslis over go/no-go

**4. Give Ad Hoc Direction**
- Reageer op Exception Reports
- Geef richting aan de PM
- Neem beslissingen over issues

**5. Authorise Project Closure**
- Review End Project Report
- Bevestig acceptatie van producten
- Autoriseer closure
- Stel benefits review in

**Management by Exception in Praktijk**

De Project Board hoeft niet continu betrokken te zijn:
- Highlight Reports informeren over voortgang
- Alleen bij exception is actie nodig
- Dit bespaart tijd van senior management

De PM opereert binnen toleranties. Pas als die dreigen te worden overschreden, 
escaleert de PM via een Exception Report.

**Beslispunten**

| Moment | Beslissing | Input |
|--------|------------|-------|
| Na SU | Initiëren? | Project Brief |
| Na IP | Project starten? | PID |
| Stage boundary | Volgende stage? | End Stage Report, Stage Plan |
| Exception | Hoe verder? | Exception Report |
| Einde | Afsluiten? | End Project Report |

**De rol van de Project Board**

De Project Board is collectief verantwoordelijk maar:
- Executive beslist over business issues
- Senior User beslist over user issues
- Senior Supplier beslist over supplier issues

Bij onenigheid: Executive heeft doorslaggevende stem.

**Samenvatting**

Directing a Project:
- Is het besturingsproces voor de Project Board
- Loopt door het hele project
- Focust op key decision points
- Past Management by Exception toe
- Vereist minimale maar cruciale betrokkenheid`,
      keyTakeaways: [
        'DP is the process for the Project Board',
        'Runs from start to end of the project',
        'Focuses on authorizations and key decisions',
        'Management by Exception minimizes Board time',
      ],
      keyTakeawaysNL: [
        'DP is het proces voor de Project Board',
        'Loopt van begin tot eind van het project',
        'Focust op autorisaties en key decisions',
        'Management by Exception minimaliseert Board-tijd',
      ],
      keyTakeawaysEN: [
        'DP is the process for the Project Board',
        'Runs from the beginning to the end of the project',
        'Focuses on authorizations and key decisions',
        'Management by Exception minimizes Board time',
      ],
    },
    {
      id: 'p2-l13',
      title: 'Controlling a Stage (CS)',
      titleNL: 'Controlling a Stage (CS)',
      duration: '20:00',
      type: 'video',
      videoUrl: '',
      transcript: `Controlling a Stage (CS) is het proces waarmee de Project Manager 
het dagelijkse werk van een stage beheert.

**Doel van CS**

- Werk toewijzen
- Voortgang monitoren
- Issues afhandelen
- Rapporteren aan Board
- Corrigerende acties nemen

**Activiteiten in CS**

**1. Authorize a Work Package**
De PM autoriseert werk aan Team Managers:
- Wat moet worden opgeleverd?
- Tegen welke kwaliteitscriteria?
- Binnen welke toleranties?
- Hoe rapporteren?

**2. Review Work Package Status**
Regelmatige updates van Team Managers:
- Voortgang
- Issues
- Risico's
- Verwachte voltooiing

**3. Receive Completed Work Packages**
Wanneer werk klaar is:
- Controleer tegen criteria
- Update registers
- Geef feedback

**4. Review the Stage Status**
Periodieke check:
- Voortgang vs. plan
- Budget consumptie
- Risico's en issues
- Toleranties status

**5. Report Highlights**
Regelmatige rapportage aan Board:
- Highlight Report (typisch 2-wekelijks)
- Status samenvatting
- Escalaties indien nodig

**6. Capture and Examine Issues and Risks**
Nieuwe issues en risico\'s:
- Identificeren
- Analyseren
- Acties bepalen

**7. Escalate Issues and Risks**
Wanneer nodig:
- Exception Report
- Vraag om advies
- Escaleer buiten toleranties

**8. Take Corrective Action**
Binnen toleranties:
- Herplannen
- Resources herverdelen
- Prioriteiten aanpassen

**Het Checkpoint Report**

Team Manager rapporteert aan PM:
- Voortgang op Work Package
- Issues en risico\'s
- Schattingen rest werk

Frequentie: afgesproken per Work Package.

**Het Highlight Report**

PM rapporteert aan Board:
- Status (rood/amber/groen)
- Voortgang vs. plan
- Budget status
- Issues en risico\'s
- Vooruitblik

Frequentie: typisch 2-wekelijks (afgesproken in PID).

**Exception Report**

Wanneer toleranties dreigen te worden overschreden:
- Beschrijving van de situatie
- Oorzaak
- Opties met consequenties
- Aanbeveling

Hiermee vraagt de PM de Board om richting.

**Samenvatting**

Controlling a Stage:
- Is het dagelijks management proces
- Gebruikt Work Packages voor delegatie
- Past management by exception toe
- Produceert Highlight en Exception Reports`,
      keyTakeaways: [
        'CS is the daily management process of the PM',
        'Work Packages delegate work to Team Managers',
        'Highlight Reports go regularly to the Board',
        'Exception Reports escalate beyond tolerances',
      ],
      keyTakeawaysNL: [
        'CS is het dagelijkse management proces van de PM',
        'Work Packages delegeren werk aan Team Managers',
        'Highlight Reports gaan regelmatig naar de Board',
        'Exception Reports escaleren buiten toleranties',
      ],
      keyTakeawaysEN: [
        'CS is the day-to-day management process of the PM',
        'Work Packages delegate work to Team Managers',
        'Highlight Reports are sent regularly to the Board',
        'Exception Reports escalate issues beyond tolerances',
      ],
    },
    {
      id: 'p2-l14',
      title: 'Managing Product Delivery (MP)',
      titleNL: 'Managing Product Delivery (MP)',
      duration: '15:00',
      type: 'video',
      videoUrl: '',
      transcript: `Managing Product Delivery (MP) is het proces waarmee Team Managers 
hun werk coördineren en producten opleveren.

**Doel van MP**

- Zorgen dat producten worden opgeleverd
- Binnen afgesproken toleranties
- Tegen gedefinieerde kwaliteitscriteria

**Het Werk van de Team Manager**

De Team Manager:
- Ontvangt Work Packages van de PM
- Plant en coördineert het werk
- Rapporteert voortgang
- Levert producten op

**Activiteiten in MP**

**1. Accept a Work Package**
Wanneer de PM een Work Package aanbiedt:
- Begrijp wat er verwacht wordt
- Controleer of het haalbaar is
- Accepteer of onderhandel

**2. Execute a Work Package**
Het daadwerkelijke werk:
- Plan de aanpak
- Wijs werk toe aan teamleden
- Monitor voortgang
- Los problemen op

**3. Deliver a Work Package**
Wanneer het werk klaar is:
- Controleer kwaliteit
- Documenteer completering
- Lever formeel op aan PM

**Het Work Package**

Een Work Package is een set informatie over te produceren producten:

Bevat:
- Te leveren product(en)
- Product Description(s)
- Technieken/methoden
- Toleranties
- Rapportage-eisen
- Goedkeuringsmethode

**De Interface PM ↔ Team Manager**

| PM (CS) | Team Manager (MP) |
|---------|-------------------|
| Autoriseert Work Package | Accepteert Work Package |
| Ontvangt Checkpoint Reports | Stuurt Checkpoint Reports |
| Ontvangt voltooide producten | Levert producten op |

**Wanneer is er een Team Manager?**

Team Manager is optioneel:
- Bij grotere projecten met specialistische teams
- Bij externe leveranciers
- Bij geografisch verspreide teams

Bij kleine projecten: PM doet MP zelf.

**Kwaliteit in MP**

Team Manager is verantwoordelijk voor:
- Product voldoet aan criteria
- Kwaliteitscontroles zijn uitgevoerd
- Resultaten zijn gedocumenteerd

Pas als kwaliteit OK is, wordt product opgeleverd.

**Samenvatting**

Managing Product Delivery:
- Is het proces voor Team Managers
- Accepteert, executeert en levert Work Packages
- Rapporteert via Checkpoint Reports
- Zorgt voor kwaliteitscontrole op producten`,
      keyTakeaways: [
        'MP is the process for Team Managers',
        'Work Packages are the formal assignment from PM to Team Manager',
        'Checkpoint Reports report on progress',
        'Quality control takes place before products are delivered',
      ],
      keyTakeawaysNL: [
        'MP is het proces voor Team Managers',
        'Work Packages zijn de formele opdracht van PM naar Team Manager',
        'Checkpoint Reports rapporteren voortgang',
        'Kwaliteitscontrole gebeurt voordat producten worden opgeleverd',
      ],
      keyTakeawaysEN: [
        'MP is the process for Team Managers',
        'Work Packages are the formal assignment from PM to Team Manager',
        'Checkpoint Reports report on progress',
        'Quality control takes place before products are delivered',
      ],
    },
    {
      id: 'p2-l15',
      title: 'Managing a Stage Boundary (SB)',
      titleNL: 'Managing a Stage Boundary (SB)',
      duration: '18:00',
      type: 'video',
      videoUrl: '',
      transcript: `Managing a Stage Boundary (SB) vindt plaats aan het einde van elke 
management stage en bereidt voor op de volgende.

**Doel van SB**

- Huidige stage afsluiten
- Volgende stage voorbereiden
- Board voorzien van informatie voor go/no-go beslissing

**Wanneer SB?**

- Aan het einde van elke stage
- Wanneer een Exception Plan nodig is
- Vóór de laatste stage (closing activities plannen)

**Activiteiten in SB**

**1. Plan the Next Stage**
Gedetailleerde planning voor de komende stage:
- Work Breakdown
- Schedule
- Resource planning
- Risk assessment

**2. Update the Project Plan**
Actuals vs. baseline:
- Wat hebben we gedaan vs. gepland?
- Hoe beïnvloedt dit de rest?
- Update forecasts

**3. Update the Business Case**
Is het project nog steeds gerechtvaardigd?
- Zijn kosten nog steeds acceptabel?
- Zijn benefits nog steeds haalbaar?
- Zijn risico\'s acceptabel?

**4. Report Stage End**
End Stage Report aan de Board:
- Prestaties van de afgelopen stage
- Status van producten
- Issues en risico\'s
- Lessons learned

**5. Produce an Exception Plan (indien nodig)**
Als de stage niet binnen toleranties kan eindigen:
- Verklaar de situatie
- Presenteer opties
- Maak Exception Plan

**Het End Stage Report**

Inhoud:
- Stage achievements
- Product status
- Quality results
- Issues and risks status
- Lessons learned (deze stage)
- Actuals vs. plan

Dit is input voor de Project Board's go/no-go beslissing.

**De Stage Gate**

De Project Board beslist:
- **Approve**: Ga door naar volgende stage
- **Request changes**: Pas plannen aan
- **Premature close**: Stop het project
- **Extend current stage**: Meer tijd voor huidige stage

**Exception Plan in SB**

Wanneer toleranties worden overschreden:
1. PM maakt Exception Report (in CS)
2. Board vraagt om Exception Plan (in DP)
3. PM maakt Exception Plan (in SB)
4. Board beslist over Exception Plan (in DP)

**Samenvatting**

Managing a Stage Boundary:
- Sluit huidige stage af
- Bereidt volgende stage voor
- Update Project Plan en Business Case
- Produceert End Stage Report
- Is het beslismoment voor de Board`,
      keyTakeaways: [
        'SB takes place at the end of each stage',
        'End Stage Report provides the Board with information for decision-making',
        'The Business Case is validated at each boundary',
        'Exception Plans are created here when needed',
      ],
      keyTakeawaysNL: [
        'SB vindt plaats aan het einde van elke stage',
        'End Stage Report geeft de Board informatie voor beslissing',
        'Business Case wordt gevalideerd bij elke boundary',
        'Exception Plans worden hier gemaakt als nodig',
      ],
      keyTakeawaysEN: [
        'SB takes place at the end of each stage',
        'The End Stage Report provides the Board with information for decision-making',
        'The Business Case is validated at each boundary',
        'Exception Plans are created here when needed',
      ],
    },
    {
      id: 'p2-l16',
      title: 'Closing a Project (CP)',
      titleNL: 'Closing a Project (CP)',
      duration: '15:00',
      type: 'video',
      videoUrl: '',
      transcript: `Closing a Project (CP) is het gecontroleerd afsluiten van het project.

**Doel van CP**

- Bevestig dat doelen zijn bereikt
- Bevestig acceptatie van producten
- Evalueer het project
- Bereid overdracht voor
- Aanbevel sluiting aan Board

**Wanneer CP?**

- Na oplevering van alle producten
- Of wanneer project voortijdig wordt gestopt

CP mag NIET worden overgeslagen, ook niet bij voortijdig stoppen!

**Activiteiten in CP**

**1. Prepare Planned Closure**
- Controleer alle producten opgeleverd
- Controleer acceptatie
- Controleer openstaande issues/risico\'s

**2. Prepare Premature Closure**
Als project wordt gestopt:
- Documenteer waarom
- Leg vast wat wel is opgeleverd
- Partial lessons learned

**3. Hand Over Products**
Overdracht naar operations:
- Producten
- Documentatie
- Training
- Support afspraken

**4. Evaluate the Project**
- Performance vs. baseline
- Benefits gerealiseerd vs. verwacht
- Lessons learned

**5. Recommend Project Closure**
End Project Report aan Board met:
- Aanbeveling tot sluiting
- Samenvatting van prestaties
- Lessons learned

**Het End Project Report**

Inhoud:
- Project Manager's assessment
- Review of business objectives
- Review of quality objectives
- Review of team performance
- Benefits review
- Lessons learned summary
- Follow-on action recommendations

**Benefits Management Approach (bij projectafsluiting)**

Veel benefits worden pas NA het project gerealiseerd. In de PRINCE2 6e editie is er geen
product genaamd "Benefits Review Plan" meer — dit heet nu de **Benefits Management Approach**
en wordt aangemaakt tijdens IP (Initiating a Project).

Bij CP (Closing a Project) werkt de Project Manager de Benefits Management Approach bij om
de post-project benefits-reviews in te plannen:
- Welke benefits worden gemeten
- Wanneer meten (na oplevering)
- Wie verantwoordelijk (doorgaans de Senior User)
- Hoe rapporteren aan Corporate/Programme Management

Dit is input voor de post-project review die plaatsvindt nádat het project is afgesloten.

**Lessons Report**

Verzameling van alle lessons uit het project:
- Wat ging goed
- Wat ging fout
- Aanbevelingen voor toekomstige projecten

**Project Closure Notification**

Formele bevestiging dat het project gesloten is:
- Naar alle stakeholders
- Datum van sluiting
- Waar documentatie is gearchiveerd

**Voortijdige Sluiting**

Als project wordt gestopt:
- Documenteer redenen eerlijk
- Verzamel partial lessons
- Sluit contracten netjes af
- Communiceer duidelijk

Stoppen is geen falen - het is goede governance als de business case niet meer klopt.

**Samenvatting**

Closing a Project:
- Bevestigt oplevering en acceptatie
- Evalueert projectprestaties
- Documenteert lessons learned
- Werkt de Benefits Management Approach bij voor post-project reviews
- Vraagt Board om formele sluiting`,
      keyTakeaways: [
        'CP is mandatory, even when stopping prematurely',
        'End Project Report evaluates the entire project',
        'The Benefits Management Approach (created in IP) is updated at CP to schedule post-project benefit reviews — there is no separate "Benefits Review Plan" in 6th edition',
        'Lessons Report documents lessons learned',
      ],
      keyTakeawaysNL: [
        'CP is verplicht, ook bij voortijdig stoppen',
        'End Project Report evalueert het hele project',
        'De Benefits Management Approach (aangemaakt in IP) wordt bijgewerkt bij CP voor post-project benefits-reviews — er is geen apart "Benefits Review Plan" in de 6e editie',
        'Lessons Report documenteert geleerde lessen',
      ],
      keyTakeawaysEN: [
        'CP is mandatory, even when the project is stopped prematurely',
        'The End Project Report evaluates the entire project',
        'The Benefits Management Approach (created in IP) is updated at CP to schedule post-project benefit reviews — there is no separate "Benefits Review Plan" in the 6th edition',
        'The Lessons Report documents lessons learned',
      ],
    },
    {
      id: 'p2-l16b',
      title: 'Quiz: The 7 Processes',
      titleNL: 'Quiz: De 7 Processen',
      duration: '15:00',
      type: 'quiz',
      quiz: [
        {
          id: 'p2-q-p1',
          question: 'Wie triggert het Starting Up a Project (SU) proces en wie benoemt de Executive?',
          options: [
            'De Project Manager triggert SU; de Executive benoemt zichzelf',
            'Corporate/Programme Management triggert SU via een project mandate; zij benoemen ook de Executive',
            'De Project Board triggert SU; de Senior Supplier benoemt de Executive',
            'De Project Manager triggert SU; de Project Board benoemt de Executive',
          ],
          correctAnswer: 1,
          explanation: 'SU wordt getriggerd door Corporate/Programme Management via een project mandate. Zij benoemen ook de Executive als eerste stap. De Executive benoemt vervolgens de Project Manager. SU is een pre-project proces — de Project Board bestaat nog niet volledig aan het begin.',
          questionEN: 'Who triggers the Starting Up a Project (SU) process and who appoints the Executive?',
          optionsEN: [
            'The Project Manager triggers SU; the Executive appoints themselves',
            'Corporate/Programme Management triggers SU via a project mandate; they also appoint the Executive',
            'The Project Board triggers SU; the Senior Supplier appoints the Executive',
            'The Project Manager triggers SU; the Project Board appoints the Executive',
          ],
          explanationEN: 'SU is triggered by Corporate/Programme Management via a project mandate. They also appoint the Executive as the first step. The Executive then appoints the Project Manager. SU is a pre-project process — the Project Board does not yet exist in full at the outset.',
        },
        {
          id: 'p2-q-p2',
          question: 'Welke vijf autorisatiebeslissingen neemt de Project Board in het Directing a Project (DP) proces?',
          options: [
            'Initiëren, Project starten, Stage of Exception Plan autoriseren, Ad-hoc richting geven, Project afsluiten',
            'Project Brief beoordelen, PID goedkeuren, Work Packages autoriseren, Highlight Reports ontvangen, Lessons Log bijwerken',
            'SU starten, IP starten, CS starten, MP starten, CP starten',
            'Risk beoordelen, Change goedkeuren, Quality controleren, Planning updaten, Benefits meten',
          ],
          correctAnswer: 0,
          explanation: 'De vijf DP-activiteiten zijn: (1) Authorise Initiation, (2) Authorise the Project, (3) Authorise a Stage or Exception Plan, (4) Give Ad Hoc Direction, (5) Authorise Project Closure. DP loopt door het hele project en is het besturingsproces van de Project Board.',
          questionEN: 'Which five authorisation decisions does the Project Board take in the Directing a Project (DP) process?',
          optionsEN: [
            'Authorise Initiation, Authorise the Project, Authorise a Stage or Exception Plan, Give Ad Hoc Direction, Authorise Project Closure',
            'Review Project Brief, Approve PID, Authorise Work Packages, Receive Highlight Reports, Update Lessons Log',
            'Start SU, Start IP, Start CS, Start MP, Start CP',
            'Assess Risk, Approve Change, Control Quality, Update Plan, Measure Benefits',
          ],
          explanationEN: 'The five DP activities are: (1) Authorise Initiation, (2) Authorise the Project, (3) Authorise a Stage or Exception Plan, (4) Give Ad Hoc Direction, (5) Authorise Project Closure. DP runs throughout the entire project and is the Project Board\'s governance process.',
        },
        {
          id: 'p2-q-p3',
          question: 'Wat is de juiste volgorde van de exception-flow als stage-toleranties worden overschreden?',
          options: [
            'Exception Plan → Exception Report → Project Board goedkeuring',
            'Exception Report → Exception Plan → Project Board goedkeuring',
            'Highlight Report → Exception Report → Exception Plan',
            'End Stage Report → Exception Plan → Project Board goedkeuring',
          ],
          correctAnswer: 1,
          explanation: 'De juiste volgorde is: (1) PM maakt een Exception Report wanneer toleranties dreigen te worden overschreden (in CS); (2) Project Board vraagt om een Exception Plan (in DP); (3) PM maakt het Exception Plan (in SB); (4) Project Board beoordeelt en keurt het Exception Plan goed (in DP). Het Exception Report komt altijd vóór het Exception Plan.',
          questionEN: 'What is the correct sequence of the exception flow when stage tolerances are forecast to be exceeded?',
          optionsEN: [
            'Exception Plan → Exception Report → Project Board approval',
            'Exception Report → Exception Plan → Project Board approval',
            'Highlight Report → Exception Report → Exception Plan',
            'End Stage Report → Exception Plan → Project Board approval',
          ],
          explanationEN: 'The correct sequence is: (1) PM raises an Exception Report when tolerances are forecast to be exceeded (in CS); (2) Project Board requests an Exception Plan (in DP); (3) PM produces the Exception Plan (in SB); (4) Project Board reviews and approves the Exception Plan (in DP). The Exception Report always precedes the Exception Plan.',
        },
        {
          id: 'p2-q-p4',
          question: 'Welke twee belangrijkste producten levert het Managing a Stage Boundary (SB) proces op voor de Project Board?',
          options: [
            'Project Brief en Outline Business Case',
            'Work Package en Checkpoint Report',
            'End Stage Report en het Stage Plan voor de volgende stage',
            'Exception Report en Exception Plan',
          ],
          correctAnswer: 2,
          explanation: 'SB produceert primair het End Stage Report (samenvatting van prestaties in de huidige stage) en het Stage Plan voor de volgende stage. Samen geven deze de Project Board alle informatie voor hun go/no-go beslissing. De Business Case en het Project Plan worden ook bijgewerkt in SB.',
          questionEN: 'Which two primary products does the Managing a Stage Boundary (SB) process produce for the Project Board?',
          optionsEN: [
            'Project Brief and Outline Business Case',
            'Work Package and Checkpoint Report',
            'End Stage Report and the Stage Plan for the next stage',
            'Exception Report and Exception Plan',
          ],
          explanationEN: 'SB primarily produces the End Stage Report (summarising performance in the current stage) and the Stage Plan for the next stage. Together these give the Project Board all the information needed for their go/no-go decision. The Business Case and Project Plan are also updated during SB.',
        },
        {
          id: 'p2-q-p5',
          question: 'In het Managing Product Delivery (MP) proces: wat zijn de drie activiteiten van de Team Manager?',
          options: [
            'Plan, Execute, Report',
            'Authorise, Review, Receive',
            'Accept a Work Package, Execute a Work Package, Deliver a Work Package',
            'Identify, Assess, Implement',
          ],
          correctAnswer: 2,
          explanation: 'De drie MP-activiteiten van de Team Manager zijn: (1) Accept a Work Package — begrijp, controleer haalbaarheid en accepteer het werk van de PM; (2) Execute a Work Package — plan, wijs toe en monitor het werk; (3) Deliver a Work Package — controleer kwaliteit en lever formeel op aan de PM. Deze drie activiteiten vormen de interface tussen PM (CS) en Team Manager (MP).',
          questionEN: 'In the Managing Product Delivery (MP) process: what are the three activities of the Team Manager?',
          optionsEN: [
            'Plan, Execute, Report',
            'Authorise, Review, Receive',
            'Accept a Work Package, Execute a Work Package, Deliver a Work Package',
            'Identify, Assess, Implement',
          ],
          explanationEN: 'The three MP activities for the Team Manager are: (1) Accept a Work Package — understand, verify feasibility and accept the work from the PM; (2) Execute a Work Package — plan, assign and monitor the work; (3) Deliver a Work Package — verify quality and formally hand back to the PM. These three activities form the interface between the PM (in CS) and the Team Manager (in MP).',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 4: TAILORING & EXAMEN
// ============================================
const module4: Module = {
  order: 3,
  id: 'p2-m4',
  title: 'Module 4: Tailoring & Exam Preparation',
  titleNL: 'Module 4: Tailoring & Examen Voorbereiding',
  description: 'Tailoring PRINCE2 and exam preparation.',
  descriptionNL: 'PRINCE2 aanpassen en examenvoorbereiding.',
  lessons: [
    {
      id: 'p2-l17',
      title: 'PRINCE2 Tailoring',
      titleNL: 'PRINCE2 Tailoring',
      duration: '15:00',
      type: 'video',
      videoUrl: '',
      transcript: `Tailoring is het aanpassen van PRINCE2 aan de specifieke context van 
je project. Het is een fundamenteel onderdeel van de methode.

**Waarom Tailoring?**

PRINCE2 is ontworpen voor alle projecten:
- Van klein tot groot
- Van simpel tot complex
- In alle industrieën

Maar niet elk project heeft dezelfde behoeften.

**Wat Kun Je Tailoren?**

**Processen:**
- Combineren (bijv. SU en IP samen bij klein project)
- Vereenvoudigen (minder formele gates)

**Thema's:**
- Diepgang aanpassen
- Documenten vereenvoudigen

**Rollen:**
- Combineren (niet elimineren!)
- Executive kan ook Senior User zijn

**Management Producten:**
- Templates aanpassen
- Documenten combineren

**Wat Kun Je NIET Tailoren?**

De 7 principes zijn niet onderhandelbaar:
1. Continued Business Justification ✗
2. Learn from Experience ✗
3. Defined Roles and Responsibilities ✗
4. Manage by Stages ✗
5. Manage by Exception ✗
6. Focus on Products ✗
7. Tailor to Suit the Project ✗

Als je principes negeert, doe je geen PRINCE2.

**Factoren voor Tailoring**

Overweeg:
- **Projectgrootte**: Klein vs. groot
- **Complexiteit**: Simpel vs. complex
- **Risico**: Laag vs. hoog
- **Team ervaring**: Junior vs. senior
- **Organisatiecultuur**: Formeel vs. informeel
- **Externe factoren**: Regulering, contracten

**Voorbeelden van Tailoring**

**Klein, laag-risico project:**
- Combineer SU en IP in één fase
- Minder formele documenten
- PM combineert rollen
- Eén delivery stage

**Groot, complex project:**
- Alle processen volledig
- Uitgebreide documentatie
- Dedicated rollen
- Meerdere stages met formele gates

**Agile/Scrum combinatie:**
- PRINCE2 voor governance (DP, SB)
- Scrum voor delivery (in plaats van CS/MP)
- Sprints als mini-stages
- Product Backlog als Product Breakdown

**Tailoring Documenteren**

Leg tailoring beslissingen vast:
- Wat is aangepast?
- Waarom?
- Goedkeuring sponsor

Dit wordt typisch vastgelegd in de PID.

**Samenvatting**

Tailoring:
- Is aanpassen aan projectcontext
- Mag processen, thema\'s, rollen en producten vereenvoudigen
- Mag principes NOOIT negeren
- Wordt gedocumenteerd en goedgekeurd
- Maakt PRINCE2 toepasbaar voor elk project`,
      keyTakeaways: [
        'Tailoring is a principle, not an option',
        'Processes, themes, and roles may be adapted',
        'The 7 principles are non-negotiable',
        'Document and get tailoring approved',
      ],
      keyTakeawaysNL: [
        'Tailoring is een principe, geen optie',
        'Processen, thema\'s en rollen mogen worden aangepast',
        'De 7 principes zijn niet onderhandelbaar',
        'Documenteer en laat tailoring goedkeuren',
      ],
      keyTakeawaysEN: [
        'Tailoring is a principle, not an option',
        'Processes, themes, and roles may be adapted',
        'The 7 principles are non-negotiable',
        'Document and get tailoring decisions approved',
      ],
    },
    {
      id: 'p2-l18',
      title: 'Quiz: Processes',
      titleNL: 'Quiz: Processen',
      duration: '15:00',
      type: 'quiz',
      quiz: [
        {
          id: 'p2-q6',
          question: 'Welk proces vindt plaats VÓÓR het project officieel start?',
          options: ['IP - Initiating a Project', 'SU - Starting Up a Project', 'DP - Directing a Project', 'CS - Controlling a Stage'],
          correctAnswer: 1,
          explanation: 'SU is een pre-project proces dat plaatsvindt voordat het project officieel begint.',
          questionEN: 'Which process takes place BEFORE the project officially starts?',
          optionsEN: ['IP - Initiating a Project', 'SU - Starting Up a Project', 'DP - Directing a Project', 'CS - Controlling a Stage'],
          explanationEN: 'Starting Up a Project (SU) is a pre-project process that takes place before the project officially begins.',
        },
        {
          id: 'p2-q7',
          question: 'Wie produceert de Project Initiation Documentation (PID)?',
          options: ['Executive', 'Project Board', 'Project Manager', 'Team Manager'],
          correctAnswer: 2,
          explanation: 'De Project Manager produceert de PID in het IP proces.',
          questionEN: 'Who produces the Project Initiation Documentation (PID)?',
          optionsEN: ['Executive', 'Project Board', 'Project Manager', 'Team Manager'],
          explanationEN: 'The Project Manager produces the PID during the Initiating a Project (IP) process.',
        },
        {
          id: 'p2-q8',
          question: 'Welk rapport stuurt de PM regelmatig naar de Project Board?',
          options: ['Checkpoint Report', 'Highlight Report', 'End Stage Report', 'Exception Report'],
          correctAnswer: 1,
          explanation: 'Highlight Reports gaan regelmatig (typisch 2-wekelijks) naar de Board.',
          questionEN: 'Which report does the Project Manager send regularly to the Project Board?',
          optionsEN: ['Checkpoint Report', 'Highlight Report', 'End Stage Report', 'Exception Report'],
          explanationEN: 'Highlight Reports are sent regularly (typically every two weeks) to the Project Board.',
        },
        {
          id: 'p2-q9',
          question: 'Wanneer wordt een Exception Report gemaakt?',
          options: [
            'Aan het einde van elke stage',
            'Wanneer toleranties dreigen te worden overschreden',
            'Aan het einde van het project',
            'Bij elke Checkpoint'
          ],
          correctAnswer: 1,
          explanation: 'Exception Reports escaleren wanneer toleranties dreigen te worden overschreden.',
          questionEN: 'When is an Exception Report produced?',
          optionsEN: [
            'At the end of each stage',
            'When tolerances are forecast to be exceeded',
            'At the end of the project',
            'At every Checkpoint'
          ],
          explanationEN: 'Exception Reports are used to escalate when tolerances are forecast to be exceeded.',
        },
        {
          id: 'p2-q10',
          question: 'Welk proces mag NOOIT worden overgeslagen, zelfs niet bij voortijdig stoppen?',
          options: ['SU - Starting Up', 'IP - Initiating', 'CS - Controlling a Stage', 'CP - Closing a Project'],
          correctAnswer: 3,
          explanation: 'CP moet altijd worden uitgevoerd, ook bij voortijdig stoppen, voor lessons learned en administratieve afsluiting.',
          questionEN: 'Which process must NEVER be skipped, even when the project is stopped prematurely?',
          optionsEN: ['SU - Starting Up a Project', 'IP - Initiating a Project', 'CS - Controlling a Stage', 'CP - Closing a Project'],
          explanationEN: 'Closing a Project (CP) must always be performed, even when stopping prematurely, to capture lessons learned and complete the administrative closure.',
        },
      ],
    },
    {
      id: 'p2-l18b',
      title: 'Practical Assignment: Write a Project Brief',
      titleNL: 'Praktijkopdracht: Schrijf een Project Brief',
      duration: '60:00',
      type: 'assignment',
      assignment: {
        title: 'Stel een PRINCE2 Project Brief op',
        description: `In deze opdracht pas je de kennis uit Modules 1–3 toe door een volledige
PRINCE2 Project Brief op te stellen voor een fictief industrieel project.

**Het Scenario:**
Je bent aangesteld als Project Manager bij Meridian Industrial B.V., een middelgroot
machinebouwbedrijf (350 medewerkers, €80 miljoen omzet). Het management wil de gehele
productiehal overstappen op een nieuw Manufacturing Execution System (MES) om de
productiefout-ratio van 3,8% terug te dringen naar onder 1%. Het project heeft een
indicatief budget van €220.000 – €280.000 en een gewenste go-live binnen 12 maanden.

**Beschikbare Informatie:**
- Sponsor (Executive): COO (Caroline Visser)
- Senior User: Hoofd Productie (Mark Hendrikx)
- Senior Supplier: MES-leverancier Siemens Opcenter (extern)
- Betrokken afdelingen: Productie, IT, Kwaliteit, Finance
- Huidig probleem: 3,8% uitval door ontbrekende real-time procesdata; €420.000 jaarlijkse
  verliezen door herbewerking en klachten
- Risico's reeds gesignaleerd: legacy PLC-integratie onzeker, trainingstijd operators, data-
  migratie van papieren werkorders

**Jouw Opdracht:**
Stel een PRINCE2-conforme Project Brief op volgens de structuur van PRINCE2 6th Edition
§A.19 (Management Product: Project Brief). De brief moet de volgende secties bevatten:

1. **Project Definition (Background)** — doel, gewenste uitkomst, scope in/out, aannames
2. **Outline Business Case** — probleemstelling, verwachte baten (kwantitatief), kostenindicatie,
   en tijdlijn van baten-realisatie
3. **Project Approach** — gekozen aanpak (big bang vs. gefaseerde uitrol), tailoring-keuzes
4. **Project Management Team** — Project Board (Executive, Senior User, Senior Supplier),
   Project Manager, en minimaal één Team Manager-rol met rationale
5. **References** — verwijs naar relevante PRINCE2 6th Ed secties en eventuele
   organisatiedocumenten (Lessons Log, Business Policies)

De brief mag 2–4 pagina's tekst zijn (of equivalent in het LMS-formulier).

**Referentie:** PRINCE2 6th Edition (AXELOS, 2017), §A.19 — Project Brief.`,
        deliverables: [
          'Ingevulde Project Brief met alle 5 secties (§A.19)',
          'Project Management Team-diagram of tabel met rollen en namen',
        ],
        rubric: [
          { criterion: 'Project Definition dekt scope, doelstellingen en aannames volledig', points: 20 },
          { criterion: 'Outline Business Case bevat meetbare baten en kostenschatting', points: 20 },
          { criterion: 'Project Approach motiveert tailoring-keuzes (manage by stages, exceptions)', points: 20 },
          { criterion: 'Project Management Team correct opgezet (Executive, SU, SS, PM)', points: 20 },
          { criterion: 'Correcte verwijzing naar PRINCE2 §A.19 en relevante thema\'s', points: 10 },
          { criterion: 'Professionele opmaak en taalgebruik', points: 10 },
        ],
      },
    },
    {
      id: 'p2-l19',
      title: 'Final Exam',
      titleNL: 'Eindexamen',
      duration: '60:00',
      type: 'exam',
      videoUrl: '',
      transcript: `Dit is het eindexamen van de PRINCE2 Foundation cursus.

**Examen Informatie:**
- 60 multiple choice vragen
- 60 minuten tijd
- 55% score nodig om te slagen (33 van 60 correct)
- Gesloten boek examen

**Onderwerpen:**
- De 7 Principes
- De 7 Thema's
- De 7 Processen
- Rollen en verantwoordelijkheden
- Management producten

**Tips:**
- Lees de vraag zorgvuldig
- Let op woorden als "BESTE", "MEEST", "EERSTE"
- Elimineer duidelijk foute antwoorden
- Bij twijfel: kies het meest PRINCE2-conforme antwoord

Succes!`,
      quiz: [
        {
          id: 'p2-exam-q1',
          question: 'Which PRINCE2 principle states that a project must have a justifiable reason to start and that this justification must remain valid throughout the project?',
          questionNL: 'Welk PRINCE2-principe stelt dat een project een gerechtvaardigde reden moet hebben om te starten en dat deze rechtvaardiging gedurende het hele project geldig moet blijven?',
          options: [
            'Learn from experience',
            'Manage by exception',
            'Continued business justification',
            'Focus on products',
          ],
          optionsNL: [
            'Leer van ervaringen',
            'Stuur op uitzondering',
            'Voortdurende zakelijke rechtvaardiging',
            'Focus op producten',
          ],
          correctAnswer: 2,
          explanation: 'Continued business justification is the principle that requires a project to have a valid justification at all times, documented in the Business Case. If the justification no longer exists, the project should be stopped.',
          explanationNL: 'Voortdurende zakelijke rechtvaardiging is het principe dat vereist dat een project altijd een geldige rechtvaardiging heeft, gedocumenteerd in de Business Case. Als de rechtvaardiging niet langer bestaat, moet het project worden gestopt.',
        },
        {
          id: 'p2-exam-q2',
          question: 'Which management product is created during the Starting Up a Project process and authorises the Initiating a Project process to begin?',
          questionNL: 'Welk managementproduct wordt aangemaakt tijdens het proces Opstarten van een Project en autoriseert het starten van het Initiëren van een Project-proces?',
          options: [
            'Project Initiation Documentation (PID)',
            'Project Brief',
            'Outline Business Case',
            'Project Product Description',
          ],
          optionsNL: [
            'Projectinitiatie-documentatie (PID)',
            'Projectomschrijving',
            'Globale Business Case',
            'Projectproductbeschrijving',
          ],
          correctAnswer: 1,
          explanation: 'The Project Brief is the output of Starting Up a Project. It provides enough information for the Project Board to authorise the Initiating a Project process. The PID is produced during initiation, not before it.',
          explanationNL: 'De Projectomschrijving is de output van Opstarten van een Project. Het geeft voldoende informatie voor de Projectraad om het Initiëren van een Project-proces te autoriseren. De PID wordt gemaakt tijdens initiatie, niet daarvoor.',
        },
        {
          id: 'p2-exam-q3',
          question: 'In PRINCE2, who is accountable for ensuring the project delivers value for money and represents the business interests on the Project Board?',
          questionNL: 'Wie is in PRINCE2 verantwoordelijk voor het bewaken van de waarde voor geld en vertegenwoordigt de zakelijke belangen in de Projectraad?',
          options: [
            'Senior User',
            'Project Manager',
            'Senior Supplier',
            'Executive',
          ],
          optionsNL: [
            'Senior Gebruiker',
            'Projectmanager',
            'Senior Leverancier',
            'Opdrachtgever',
          ],
          correctAnswer: 3,
          explanation: 'The Executive is the single accountable owner of the project and is responsible for ensuring value for money. The Senior User represents those who use the products; the Senior Supplier represents those who supply resources.',
          explanationNL: 'De Opdrachtgever is de enige verantwoordelijke eigenaar van het project en is verantwoordelijk voor waarde voor geld. De Senior Gebruiker vertegenwoordigt degenen die de producten gebruiken; de Senior Leverancier vertegenwoordigt degenen die middelen leveren.',
        },
        {
          id: 'p2-exam-q4',
          question: 'Which PRINCE2 theme is concerned with establishing mechanisms to judge whether the project is desirable, viable and achievable?',
          questionNL: 'Welk PRINCE2-thema houdt zich bezig met het vaststellen van mechanismen om te beoordelen of het project wenselijk, haalbaar en realiseerbaar is?',
          options: [
            'Quality',
            'Risk',
            'Business Case',
            'Progress',
          ],
          optionsNL: [
            'Kwaliteit',
            'Risico',
            'Business Case',
            'Voortgang',
          ],
          correctAnswer: 2,
          explanation: 'The Business Case theme establishes mechanisms to judge whether the project is and remains desirable, viable and achievable. It is owned by the Executive and updated at each stage boundary.',
          explanationNL: 'Het Business Case-thema stelt mechanismen vast om te beoordelen of het project wenselijk, haalbaar en realiseerbaar is en blijft. Het is eigendom van de Opdrachtgever en wordt bijgewerkt bij elke faseovergang.',
        },
        {
          id: 'p2-exam-q5',
          question: 'What are the six aspects of project performance that PRINCE2 tolerances are set against?',
          questionNL: 'Tegen welke zes aspecten van projectprestaties worden PRINCE2-toleranties vastgesteld?',
          options: [
            'Time, Cost, Quality, Scope, Risk, Benefits',
            'Time, Cost, Quality, Scope, Risk, Change',
            'Time, Cost, Quality, Scope, Benefits, Issues',
            'Time, Cost, Scope, Risk, Change, Progress',
          ],
          optionsNL: [
            'Tijd, Kosten, Kwaliteit, Omvang, Risico, Baten',
            'Tijd, Kosten, Kwaliteit, Omvang, Risico, Wijziging',
            'Tijd, Kosten, Kwaliteit, Omvang, Baten, Issues',
            'Tijd, Kosten, Omvang, Risico, Wijziging, Voortgang',
          ],
          correctAnswer: 0,
          explanation: 'PRINCE2 defines six performance targets (and associated tolerances): time, cost, quality, scope, risk, and benefits. These apply at project level and stage level, supporting the Manage by Exception principle.',
          explanationNL: 'PRINCE2 definieert zes prestatiedoelen (en bijbehorende toleranties): tijd, kosten, kwaliteit, omvang, risico en baten. Deze gelden op projectniveau en fasseniveau en ondersteunen het principe Sturen op uitzondering.',
        },
        {
          id: 'p2-exam-q6',
          question: 'Which process is triggered when a Work Package is completed and the Team Manager needs to report back to the Project Manager?',
          questionNL: 'Welk proces wordt geactiveerd wanneer een Werkpakket is voltooid en de Teammanager moet rapporteren aan de Projectmanager?',
          options: [
            'Controlling a Stage',
            'Managing a Stage Boundary',
            'Managing Product Delivery',
            'Directing a Project',
          ],
          optionsNL: [
            'Beheersen van een Fase',
            'Beheren van een Faseovergang',
            'Beheren van Productlevering',
            'Sturen van een Project',
          ],
          correctAnswer: 2,
          explanation: 'Managing Product Delivery controls the link between the Project Manager and Team Manager. It covers accepting, executing and delivering Work Packages. The Team Manager uses this process to receive and hand back Work Packages.',
          explanationNL: 'Beheren van Productlevering regelt de koppeling tussen de Projectmanager en Teammanager. Het omvat het accepteren, uitvoeren en leveren van Werkpakketten. De Teammanager gebruikt dit proces om Werkpakketten te ontvangen en terug te leveren.',
        },
        {
          id: 'p2-exam-q7',
          question: 'The PRINCE2 principle "Manage by Stages" requires that a project is planned, monitored and controlled on a stage-by-stage basis. What is the MINIMUM number of management stages a PRINCE2 project must have?',
          questionNL: 'Het PRINCE2-principe "Stuur per fase" vereist dat een project fase voor fase wordt gepland, bewaakt en beheerst. Wat is het MINIMUM aantal managementfasen dat een PRINCE2-project moet hebben?',
          options: [
            'One',
            'Two',
            'Three',
            'Four',
          ],
          optionsNL: [
            'Één',
            'Twee',
            'Drie',
            'Vier',
          ],
          correctAnswer: 1,
          explanation: 'A PRINCE2 project must have a minimum of two management stages: an initiation stage and at least one further delivery stage. This enforces the Manage by Stages principle with a formal go/no-go decision after initiation.',
          explanationNL: 'Een PRINCE2-project moet minimaal twee managementfasen hebben: een initiatiefase en ten minste één verdere leveringsfase. Dit versterkt het principe Stuur per fase met een formele go/no-go-beslissing na initiatie.',
        },
        {
          id: 'p2-exam-q8',
          question: 'Which document formally authorises a Team Manager to begin work on one or more products?',
          questionNL: 'Welk document autoriseert een Teammanager formeel om te beginnen met het werken aan één of meer producten?',
          options: [
            'Stage Plan',
            'Product Description',
            'Work Package',
            'Checkpoint Report',
          ],
          optionsNL: [
            'Faseplan',
            'Productbeschrijving',
            'Werkpakket',
            'Voortgangsrapport',
          ],
          correctAnswer: 2,
          explanation: 'A Work Package is the set of information that the Project Manager gives to a Team Manager to authorise work. It defines the products to be produced, constraints, reporting requirements, and sign-off criteria.',
          explanationNL: 'Een Werkpakket is de set informatie die de Projectmanager aan een Teammanager geeft om werk te autoriseren. Het definieert de te produceren producten, beperkingen, rapportagevereisten en goedkeuringscriteria.',
        },
        {
          id: 'p2-exam-q9',
          question: 'An Exception Report is produced when a stage forecast shows tolerances will be exceeded. Who receives the Exception Report and decides the next action?',
          questionNL: 'Een Uitzonderingsrapport wordt opgesteld wanneer een faseprognose aangeeft dat toleranties zullen worden overschreden. Wie ontvangt het Uitzonderingsrapport en beslist over de volgende actie?',
          options: [
            'Project Manager',
            'Project Board',
            'Team Manager',
            'Change Authority',
          ],
          optionsNL: [
            'Projectmanager',
            'Projectraad',
            'Teammanager',
            'Wijzigingsautoriteit',
          ],
          correctAnswer: 1,
          explanation: 'The Project Manager sends the Exception Report to the Project Board. The Project Board then decides: request an Exception Plan, premature close, or accept the deviation. This is the escalation route that supports Manage by Exception.',
          explanationNL: 'De Projectmanager stuurt het Uitzonderingsrapport naar de Projectraad. De Projectraad beslist dan: verzoek om een Uitzonderingsplan, vroegtijdige afsluiting, of de afwijking accepteren. Dit is de escalatieroute die Sturen op uitzondering ondersteunt.',
        },
        {
          id: 'p2-exam-q10',
          question: 'Product-based planning is a technique used in PRINCE2. Which of the following is the CORRECT order of steps in product-based planning?',
          questionNL: 'Productgebaseerde planning is een techniek die in PRINCE2 wordt gebruikt. Wat is de JUISTE volgorde van stappen in productgebaseerde planning?',
          options: [
            'Write Product Descriptions → Create Product Breakdown Structure → Create Product Flow Diagram → Identify activities',
            'Create Product Breakdown Structure → Write Product Descriptions → Create Product Flow Diagram → Identify activities',
            'Identify activities → Create Product Breakdown Structure → Write Product Descriptions → Create Product Flow Diagram',
            'Create Product Flow Diagram → Create Product Breakdown Structure → Write Product Descriptions → Identify activities',
          ],
          optionsNL: [
            'Schrijf Productbeschrijvingen → Maak Productstructuur → Maak Productstroomdiagram → Identificeer activiteiten',
            'Maak Productstructuur → Schrijf Productbeschrijvingen → Maak Productstroomdiagram → Identificeer activiteiten',
            'Identificeer activiteiten → Maak Productstructuur → Schrijf Productbeschrijvingen → Maak Productstroomdiagram',
            'Maak Productstroomdiagram → Maak Productstructuur → Schrijf Productbeschrijvingen → Identificeer activiteiten',
          ],
          correctAnswer: 1,
          explanation: 'Per PRINCE2 6th edition the sequence is: (1) write the Project Product Description, (2) create the Product Breakdown Structure, (3) write Product Descriptions for each product, (4) create the Product Flow Diagram, (5) identify activities and dependencies. The PBS precedes individual Product Descriptions.',
          explanationNL: 'Volgens PRINCE2 6e editie is de volgorde: (1) schrijf de Projectproductbeschrijving, (2) maak de Productstructuur, (3) schrijf Productbeschrijvingen voor elk product, (4) maak het Productstroomdiagram, (5) identificeer activiteiten en afhankelijkheden. De PBS gaat vooraf aan individuele Productbeschrijvingen.',
        },
        {
          id: 'p2-exam-q11',
          question: 'Which PRINCE2 theme addresses the question: "What are the risks to this project?"',
          questionNL: 'Welk PRINCE2-thema behandelt de vraag: "Wat zijn de risico\'s voor dit project?"',
          options: [
            'Change',
            'Progress',
            'Risk',
            'Quality',
          ],
          optionsNL: [
            'Wijziging',
            'Voortgang',
            'Risico',
            'Kwaliteit',
          ],
          correctAnswer: 2,
          explanation: 'The Risk theme addresses the question "What are the risks to this project?" It identifies, assesses and controls uncertainty. Risks are captured in the Risk Register and responses include: avoid, reduce, fallback, transfer, accept, share.',
          explanationNL: 'Het Risicothema behandelt de vraag "Wat zijn de risico\'s voor dit project?" Het identificeert, beoordeelt en beheerst onzekerheid. Risico\'s worden vastgelegd in het Risicoregister en reacties zijn: vermijden, verminderen, terugvaloptie, overdragen, accepteren, delen.',
        },
        {
          id: 'p2-exam-q12',
          question: 'Which report does a Team Manager send to the Project Manager at agreed intervals to confirm progress against a Work Package?',
          questionNL: 'Welk rapport stuurt een Teammanager op afgesproken intervallen naar de Projectmanager om voortgang op een Werkpakket te bevestigen?',
          options: [
            'Highlight Report',
            'Checkpoint Report',
            'End Stage Report',
            'Exception Report',
          ],
          optionsNL: [
            'Voortgangsrapport (Highlight)',
            'Controlepuntrapport (Checkpoint)',
            'Fasesluitingsrapport',
            'Uitzonderingsrapport',
          ],
          correctAnswer: 1,
          explanation: 'Checkpoint Reports are produced by the Team Manager and sent to the Project Manager at agreed intervals. They confirm progress against the Work Package. Highlight Reports flow from Project Manager to Project Board.',
          explanationNL: 'Controlepuntrapporten worden opgesteld door de Teammanager en op afgesproken intervallen naar de Projectmanager gestuurd. Ze bevestigen de voortgang op het Werkpakket. Voortgangsrapporten vloeien van de Projectmanager naar de Projectraad.',
        },
        {
          id: 'p2-exam-q13',
          question: 'Which process is used by the Project Board to exercise overall control of the project throughout its life?',
          questionNL: 'Welk proces wordt door de Projectraad gebruikt om de algehele controle over het project gedurende de hele looptijd uit te oefenen?',
          options: [
            'Controlling a Stage',
            'Initiating a Project',
            'Directing a Project',
            'Managing a Stage Boundary',
          ],
          optionsNL: [
            'Beheersen van een Fase',
            'Initiëren van een Project',
            'Sturen van een Project',
            'Beheren van een Faseovergang',
          ],
          correctAnswer: 2,
          explanation: 'Directing a Project runs from initiation to project closure and is performed by the Project Board. It covers authorising initiation, each stage, Exception Plans, project closure, and giving ad-hoc direction throughout.',
          explanationNL: 'Sturen van een Project loopt van initiatie tot projectafsluiting en wordt uitgevoerd door de Projectraad. Het omvat het autoriseren van initiatie, elke fase, Uitzonderingsplannen, projectafsluiting en het geven van ad-hocrichtlijnen gedurende het hele traject.',
        },
        {
          id: 'p2-exam-q14',
          question: 'The "Focus on Products" principle underpins which planning technique in PRINCE2?',
          questionNL: 'Het principe "Focus op producten" ondersteunt welke planningstechniek in PRINCE2?',
          options: [
            'Critical Path Analysis',
            'Product-based planning',
            'Earned Value Management',
            'Rolling Wave planning',
          ],
          optionsNL: [
            'Kritische-padanalyse',
            'Productgebaseerde planning',
            'Earned Value Management',
            'Rolling Wave-planning',
          ],
          correctAnswer: 1,
          explanation: 'The Focus on Products principle underpins product-based planning. By defining products before activities, PRINCE2 ensures the project is driven by outputs, reducing gold-plating and scope creep.',
          explanationNL: 'Het principe Focus op producten ondersteunt productgebaseerde planning. Door producten te definiëren vóór activiteiten zorgt PRINCE2 ervoor dat het project wordt aangestuurd door outputs, waardoor gold-plating en scopewijzigingen worden verminderd.',
        },
        {
          id: 'p2-exam-q15',
          question: 'In PRINCE2, what is the PRIMARY purpose of the Quality Register?',
          questionNL: 'Wat is in PRINCE2 het PRIMAIRE doel van het Kwaliteitsregister?',
          options: [
            'To record all changes approved by the Change Authority',
            'To summarise all quality management activities planned and carried out',
            'To define the quality criteria for the project\'s products',
            'To log defects found during product testing',
          ],
          optionsNL: [
            'Om alle wijzigingen vast te leggen die zijn goedgekeurd door de Wijzigingsautoriteit',
            'Om alle geplande en uitgevoerde kwaliteitsmanagementactiviteiten samen te vatten',
            'Om de kwaliteitscriteria voor de producten van het project te definiëren',
            'Om defecten vast te leggen die tijdens het testen van producten zijn gevonden',
          ],
          correctAnswer: 1,
          explanation: 'The Quality Register is a diary of all quality events. It records every quality review planned and completed, with dates, resources and outcomes. Quality criteria for individual products are held in Product Descriptions, not the Register.',
          explanationNL: 'Het Kwaliteitsregister is een dagboek van alle kwaliteitsgebeurtenissen. Het registreert elke geplande en voltooide kwaliteitsbeoordeling, met datums, middelen en uitkomsten. Kwaliteitscriteria voor individuele producten zijn opgeslagen in Productbeschrijvingen, niet in het Register.',
        },
        {
          id: 'p2-exam-q16',
          question: 'A project is mid-stage when a significant new risk emerges that will cause the stage cost tolerance to be exceeded. What should the Project Manager do FIRST?',
          questionNL: 'Een project bevindt zich midden in een fase wanneer een significant nieuw risico ontstaat dat ervoor zorgt dat de kostentolerantie van de fase wordt overschreden. Wat moet de Projectmanager als EERSTE doen?',
          options: [
            'Immediately close the project',
            'Raise an issue and escalate via an Exception Report to the Project Board',
            'Amend the Stage Plan without approval',
            'Request a project-level tolerance increase from corporate or programme management',
          ],
          optionsNL: [
            'Het project onmiddellijk afsluiten',
            'Een issue indienen en escaleren via een Uitzonderingsrapport aan de Projectraad',
            'Het Faseplan wijzigen zonder goedkeuring',
            'Een verhoging van projectniveau-tolerantie aanvragen bij corporate of programmamanagement',
          ],
          correctAnswer: 1,
          explanation: 'When a stage forecast shows tolerances will be breached, the Project Manager raises an issue, then produces an Exception Report for the Project Board. The Project Board (not the Project Manager) decides on the corrective action, which may include requesting an Exception Plan.',
          explanationNL: 'Wanneer een faseprognose aangeeft dat toleranties worden overschreden, dient de Projectmanager een issue in en stelt vervolgens een Uitzonderingsrapport op voor de Projectraad. De Projectraad (niet de Projectmanager) beslist over de corrigerende actie, die het verzoeken om een Uitzonderingsplan kan omvatten.',
        },
        {
          id: 'p2-exam-q17',
          question: 'Which PRINCE2 management product describes the customer\'s quality expectations and acceptance criteria for the final project output?',
          questionNL: 'Welk PRINCE2-managementproduct beschrijft de kwaliteitsverwachtingen van de klant en acceptatiecriteria voor de uiteindelijke projectoutput?',
          options: [
            'Quality Management Approach',
            'Product Description',
            'Project Product Description',
            'Quality Register',
          ],
          optionsNL: [
            'Kwaliteitsmanagementaanpak',
            'Productbeschrijving',
            'Projectproductbeschrijving',
            'Kwaliteitsregister',
          ],
          correctAnswer: 2,
          explanation: 'The Project Product Description defines the overall project output and includes the customer\'s quality expectations, acceptance criteria, acceptance method and responsibilities. It is created during Starting Up a Project and refined in Initiating a Project.',
          explanationNL: 'De Projectproductbeschrijving definieert de algehele projectoutput en omvat de kwaliteitsverwachtingen van de klant, acceptatiecriteria, acceptatiemethode en verantwoordelijkheden. Het wordt aangemaakt tijdens Opstarten van een Project en verfijnd in Initiëren van een Project.',
        },
        {
          id: 'p2-exam-q18',
          question: 'What is the MAIN purpose of the Managing a Stage Boundary process?',
          questionNL: 'Wat is het HOOFDDOEL van het proces Beheren van een Faseovergang?',
          options: [
            'To authorise the Team Manager to begin a new Work Package',
            'To enable the Project Board to decide whether to continue, change, or stop the project',
            'To record lessons learned at the end of each Work Package',
            'To produce the End Project Report',
          ],
          optionsNL: [
            'Om de Teammanager te autoriseren een nieuw Werkpakket te starten',
            'Om de Projectraad in staat te stellen te beslissen of het project moet worden voortgezet, gewijzigd of gestopt',
            'Om geleerde lessen vast te leggen aan het einde van elk Werkpakket',
            'Om het Projectsluitingsrapport op te stellen',
          ],
          correctAnswer: 1,
          explanation: 'Managing a Stage Boundary provides the Project Board with sufficient information to authorise the next stage (or close the project). The process produces the End Stage Report, updated plans, updated Business Case and updated risk information for the Board\'s review.',
          explanationNL: 'Beheren van een Faseovergang voorziet de Projectraad van voldoende informatie om de volgende fase te autoriseren (of het project te sluiten). Het proces produceert het Fasesluitingsrapport, bijgewerkte plannen, bijgewerkte Business Case en bijgewerkte risico-informatie voor de beoordeling van de Projectraad.',
        },
        {
          id: 'p2-exam-q19',
          question: 'PRINCE2 recognises four levels of management in a project environment. Which option correctly lists these four levels from HIGHEST to LOWEST authority?',
          questionNL: 'PRINCE2 onderkent vier managementniveaus in een projectomgeving. Welke optie geeft deze vier niveaus correct weer van HOOGSTE naar LAAGSTE autoriteit?',
          options: [
            'Project Board → Project Manager → Team Manager → Corporate/Programme Management',
            'Corporate/Programme Management → Project Board → Project Manager → Team Manager',
            'Project Manager → Project Board → Corporate/Programme Management → Team Manager',
            'Corporate/Programme Management → Project Manager → Project Board → Team Manager',
          ],
          optionsNL: [
            'Projectraad → Projectmanager → Teammanager → Corporate/Programmamanagement',
            'Corporate/Programmamanagement → Projectraad → Projectmanager → Teammanager',
            'Projectmanager → Projectraad → Corporate/Programmamanagement → Teammanager',
            'Corporate/Programmamanagement → Projectmanager → Projectraad → Teammanager',
          ],
          correctAnswer: 1,
          explanation: 'The four PRINCE2 management levels from highest to lowest are: Corporate/Programme Management (sets project-level tolerances), Project Board (directs the project), Project Manager (manages day-to-day), Team Manager (manages specialist work). Each level delegates authority to the level below via tolerances.',
          explanationNL: 'De vier PRINCE2-managementniveaus van hoogste naar laagste zijn: Corporate/Programmamanagement (stelt projectniveau-toleranties vast), Projectraad (stuurt het project), Projectmanager (beheert de dagelijkse gang van zaken), Teammanager (beheert specialistisch werk). Elk niveau delegeert autoriteit aan het niveau eronder via toleranties.',
        },
        {
          id: 'p2-exam-q20',
          question: 'Which document holds the definitive baseline for what the project will deliver, how it will be managed, and its total cost and timescale?',
          questionNL: 'Welk document bevat de definitieve baseline voor wat het project oplevert, hoe het wordt beheerd en de totale kosten en tijdsplanning?',
          options: [
            'Project Brief',
            'Project Initiation Documentation (PID)',
            'Stage Plan',
            'Benefits Management Approach',
          ],
          optionsNL: [
            'Projectomschrijving',
            'Projectinitiatie-documentatie (PID)',
            'Faseplan',
            'Batenmanagementaanpak',
          ],
          correctAnswer: 1,
          explanation: 'The Project Initiation Documentation (PID) is the master document that defines what the project will deliver, the approach, the project management team, tolerances, controls and total cost/time. It is baselined at the end of initiation and used to measure actual performance against.',
          explanationNL: 'De Projectinitiatie-documentatie (PID) is het masterdocument dat definieert wat het project oplevert, de aanpak, het projectmanagementteam, toleranties, beheersmaatregelen en totale kosten/tijd. Het wordt aan het einde van initiatie als baseline vastgesteld en gebruikt om werkelijke prestaties tegen af te meten.',
        },
        {
          id: 'p2-exam-q21',
          question: 'The PRINCE2 Change theme provides a systematic approach to handling issues and changes. Which type of issue is raised when the projected costs exceed the approved baseline?',
          questionNL: 'Het PRINCE2-wijzigingsthema biedt een systematische aanpak voor het afhandelen van issues en wijzigingen. Welk type issue wordt ingediend wanneer de verwachte kosten de goedgekeurde baseline overschrijden?',
          options: [
            'Request for Change',
            'Off-specification',
            'Problem/Concern',
            'Exception',
          ],
          optionsNL: [
            'Wijzigingsverzoek',
            'Afwijking van specificatie',
            'Probleem/Zorg',
            'Uitzondering',
          ],
          correctAnswer: 2,
          explanation: 'A cost overrun that is forecast but does not relate to a product failing to meet its specification is classified as a Problem/Concern. A Request for Change proposes a beneficial modification; an Off-specification is a product failing to meet its description.',
          explanationNL: 'Een verwachte kostenoverschrijding die geen verband houdt met een product dat niet aan zijn specificatie voldoet, wordt geclassificeerd als een Probleem/Zorg. Een Wijzigingsverzoek stelt een nuttige wijziging voor; een Afwijking van specificatie is een product dat niet aan zijn beschrijving voldoet.',
        },
        {
          id: 'p2-exam-q22',
          question: 'Which PRINCE2 principle ensures that lessons are actively sought at the start of a project and recorded throughout, so future projects can benefit?',
          questionNL: 'Welk PRINCE2-principe zorgt ervoor dat lessen actief worden gezocht bij de start van een project en gedurende het hele traject worden vastgelegd, zodat toekomstige projecten ervan kunnen profiteren?',
          options: [
            'Continued business justification',
            'Defined roles and responsibilities',
            'Learn from experience',
            'Tailor to suit the project',
          ],
          optionsNL: [
            'Voortdurende zakelijke rechtvaardiging',
            'Gedefinieerde rollen en verantwoordelijkheden',
            'Leer van ervaringen',
            'Pas aan op het project',
          ],
          correctAnswer: 2,
          explanation: 'Learn from experience requires project teams to review lessons from previous projects at startup, log new lessons in the Lessons Log during the project, and produce a Lessons Report at closure. This continuous learning improves organisational capability.',
          explanationNL: 'Leer van ervaringen vereist dat projectteams bij de start lessen uit eerdere projecten bekijken, nieuwe lessen vastleggen in het Lessenlogboek gedurende het project en een Lessenrapport opstellen bij afsluiting. Dit voortdurend leren verbetert de organisatorische capaciteit.',
        },
        {
          id: 'p2-exam-q23',
          question: 'The Closing a Project process produces an End Project Report. Which THREE items does this report include? Select the BEST answer.',
          questionNL: 'Het proces Afsluiten van een Project produceert een Projectsluitingsrapport. Welke DRIE items bevat dit rapport? Selecteer het BESTE antwoord.',
          options: [
            'Project performance against PID baselines, final Business Case review, and lessons learned summary',
            'Next project\'s Stage Plan, final Risk Register, and outstanding Work Packages',
            'Exception Plan, updated Product Descriptions, and Change Authority log',
            'Post-project benefits review dates, team performance appraisals, and supplier invoices',
          ],
          optionsNL: [
            'Projectprestaties ten opzichte van PID-baselines, eindbeoordeling van de Business Case en samenvatting van geleerde lessen',
            'Faseplan van het volgende project, definitief Risicoregister en openstaande Werkpakketten',
            'Uitzonderingsplan, bijgewerkte Productbeschrijvingen en log van de Wijzigingsautoriteit',
            'Data voor post-projectbatenbeoordeling, teamprestatiebeoordelingen en leveranciersfacturen',
          ],
          correctAnswer: 0,
          explanation: 'The End Project Report compares actual outcomes against the PID baselines (time, cost, quality, scope, risk, benefits), provides a final Business Case review, and summarises the lessons learned. Post-project benefit reviews are scheduled but conducted after project closure.',
          explanationNL: 'Het Projectsluitingsrapport vergelijkt werkelijke resultaten met de PID-baselines (tijd, kosten, kwaliteit, omvang, risico, baten), biedt een eindbeoordeling van de Business Case en geeft een samenvatting van geleerde lessen. Post-projectbatenbeoordeling wordt gepland maar uitgevoerd na projectafsluiting.',
        },
        {
          id: 'p2-exam-q24',
          question: 'Which statement about tailoring PRINCE2 is CORRECT according to the 6th edition?',
          questionNL: 'Welke uitspraak over het aanpassen van PRINCE2 is JUIST volgens de 6e editie?',
          options: [
            'All seven processes must always be applied in full regardless of project size',
            'Tailoring means omitting any themes or principles that are inconvenient for the project',
            'PRINCE2 should be tailored to suit the project environment, but all seven principles must always be applied',
            'Tailoring is only permitted for projects classified as simple or small',
          ],
          optionsNL: [
            'Alle zeven processen moeten altijd volledig worden toegepast, ongeacht de projectomvang',
            'Aanpassen betekent het weglaten van thema\'s of principes die inconvenient zijn voor het project',
            'PRINCE2 moet worden aangepast aan de projectomgeving, maar alle zeven principes moeten altijd worden toegepast',
            'Aanpassen is alleen toegestaan voor projecten die als eenvoudig of klein zijn geclassificeerd',
          ],
          correctAnswer: 2,
          explanation: 'The Tailor to Suit the Project principle requires adaptation of PRINCE2 to the project context, but the seven principles are non-negotiable — they must ALL be applied on every project. Processes and themes can be scaled and combined, but the principles cannot be omitted.',
          explanationNL: 'Het principe Pas aan op het project vereist aanpassing van PRINCE2 aan de projectcontext, maar de zeven principes zijn niet onderhandelbaar — ze moeten ALLEMAAL worden toegepast op elk project. Processen en thema\'s kunnen worden geschaald en gecombineerd, maar de principes kunnen niet worden weggelaten.',
        },
        {
          id: 'p2-exam-q25',
          question: 'During Initiating a Project, which approach document defines how configuration management and version control will be applied to the project\'s products?',
          questionNL: 'Tijdens het Initiëren van een Project definieert welk aanpakdocument hoe configuratiebeheer en versiebeheer worden toegepast op de producten van het project?',
          options: [
            'Quality Management Approach',
            'Risk Management Approach',
            'Change Control Approach',
            'Communication Management Approach',
          ],
          optionsNL: [
            'Kwaliteitsmanagementaanpak',
            'Risicomanagementaanpak',
            'Wijzigingsbeheeraanpak',
            'Communicatiemanagementaanpak',
          ],
          correctAnswer: 2,
          explanation: 'The Change Control Approach (previously called Configuration Management Strategy in earlier editions) defines how configuration management and change control will be applied, including how products will be identified, tracked and protected. It is one of four management approach documents produced in Initiating a Project.',
          explanationNL: 'De Wijzigingsbeheeraanpak (voorheen Configuratiebeheersstrategie in eerdere edities) definieert hoe configuratiebeheer en wijzigingsbeheer worden toegepast, inclusief hoe producten worden geïdentificeerd, gevolgd en beschermd. Het is een van de vier managementaanpakdocumenten die worden geproduceerd in Initiëren van een Project.',
        },
      ],
    },
    {
      id: 'p2-l20',
      title: 'Certificate',
      titleNL: 'Certificaat',
      duration: '5:00',
      type: 'certificate',
      videoUrl: '',
      transcript: `Gefeliciteerd met het afronden van de PRINCE2 Foundation cursus!

**Je Certificaat**

Je ontvangt een certificaat dat bevestigt:
- Cursus: PRINCE2 Foundation & Practitioner Preparation
- Onderwerpen: 7 Principes, 7 Thema's, 7 Processen
- Datum van afronding

**Vervolgstappen**

Nu je de fundamenten beheerst:

1. **Officieel examen**: Boek je officiële PRINCE2 Foundation examen
2. **Practitioner**: Na Foundation kun je door naar Practitioner niveau
3. **Praktijk**: Pas PRINCE2 toe in je projecten
4. **Combineer**: Overweeg PRINCE2 Agile of MSP

Veel succes met je certificering!`,
    },
  ],
};

// ============================================
// EXPORT MODULES
// ============================================
export const prince2Modules: Module[] = [
  module1,
  module2,
  module3,
  module4,
];

// ============================================
// COURSE DEFINITION
// ============================================
export const prince2Course: Course = {
  id: 'prince2-foundation',
  title: 'PRINCE2 Foundation & Practitioner',
  titleNL: 'PRINCE2 Foundation & Practitioner',
  description: 'The complete PRINCE2 certification training. Learn the 7 principles, 7 themes, and 7 processes to manage projects in controlled environments. This course follows PRINCE2 6th Edition (2017). PRINCE2 7th Edition (2023) update planned.',
  descriptionNL: 'De complete PRINCE2 certificeringstraining. Leer de 7 principes, 7 thema\'s en 7 processen om projecten in gecontroleerde omgevingen te managen. Deze cursus volgt PRINCE2 6e editie (2017). Update naar PRINCE2 7e editie (2023) gepland.',
  icon: Crown,
  color: BRAND.amber,
  gradient: `linear-gradient(135deg, ${BRAND.amber}, #D97706)`,
  category: 'certification',
  methodology: 'prince2',
  levels: 4,
  modules: prince2Modules.reduce((total, m) => total + m.lessons.length, 0),
  duration: 20,
  rating: 4.8,
  students: 8234,
  tags: ['PRINCE2', 'Governance', 'Certification', 'Processes', 'Themes', 'Principles'],
  tagsNL: ['PRINCE2', 'Governance', 'Certificering', 'Processen', 'Thema\'s', 'Principes'],
  instructor: instructors.erik,
  featured: true,
  bestseller: true,
  new: false,
  freeForCustomers: true,
  certificate: true,
  whatYouLearn: [
    'The 7 PRINCE2 principles and when to apply them',
    'All 7 themes: Business Case, Organization, Quality, Plans, Risk, Change, Progress',
    'The 7 processes from Starting Up to Closing a Project',
    'How to tailor PRINCE2 for your specific project context',
    'Prepare for the official PRINCE2 Foundation exam',
  ],
  whatYouLearnNL: [
    'De 7 PRINCE2 principes en wanneer ze toepassen',
    'Alle 7 thema\'s: Business Case, Organization, Quality, Plans, Risk, Change, Progress',
    'De 7 processen van Starting Up tot Closing a Project',
    'Hoe PRINCE2 aan te passen voor je specifieke projectcontext',
    'Voorbereiden op het officiële PRINCE2 Foundation examen',
  ],
  requirements: [
    'No prior PRINCE2 knowledge required',
    'Basic understanding of projects is helpful',
    'Motivation to study for certification',
  ],
  requirementsNL: [
    'Geen voorkennis van PRINCE2 vereist',
    'Basiskennis van projecten is handig',
    'Motivatie om te studeren voor certificering',
  ],
  targetAudience: [
    'Project managers seeking PRINCE2 certification',
    'Professionals working in PRINCE2 environments',
    'Those wanting to work in government or large organizations',
    'Anyone wanting a structured project management approach',
  ],
  targetAudienceNL: [
    'Projectmanagers die PRINCE2 certificering willen',
    'Professionals die in PRINCE2 omgevingen werken',
    'Mensen die bij de overheid of grote organisaties willen werken',
    'Iedereen die een gestructureerde PM-aanpak wil leren',
  ],
  courseModules: prince2Modules,
};

export default prince2Course;