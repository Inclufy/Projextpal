// ============================================
// COURSE: PRINCE2 FOUNDATION & PRACTITIONER
// ============================================
// Complete PRINCE2 training with all 7 principles, themes, and processes
// ============================================

import { Crown } from 'lucide-react';
import { Course, Module } from '../types';
import { BRAND } from '../brand';
import { instructors } from '../instructors';

// ============================================
// MODULE 1: PRINCE2 INTRODUCTIE & PRINCIPES
// ============================================
const module1: Module = {
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
- Vandaag: PRINCE2 6th Edition (2023)

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
- Toepassing van de methode
- Scenario-based examen
- 68 vragen, 55% om te slagen
- Vereist Foundation eerst

**In deze cursus...**

We behandelen:
- Alle 7 principes in detail
- Alle 7 thema's met praktijkvoorbeelden
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

**Principe 4: Manage by Stages**

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

**Principe 5: Manage by Exception**

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

1. Continued Business Justification - Blijvende zakelijke rechtvaardiging
2. Learn from Experience - Leren van ervaring
3. Defined Roles and Responsibilities - Gedefinieerde rollen
4. Manage by Stages - Beheren per fase
5. Manage by Exception - Sturen op uitzonderingen
6. Focus on Products - Focus op producten
7. Tailor to Suit the Project Environment - Aanpassen aan de context`,
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
      transcript: `De 7 thema's beschrijven aspecten van projectmanagement die continu 
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
- Wat zijn de kosten en risico's?
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
8. Analyseer risico's

**Thema 5: Risk**

Het Risk thema managet onzekerheid.

Risk = Effect of uncertainty on objectives

De Risk Management procedure:
1. Identify: Welke risico's zijn er?
2. Assess: Hoe waarschijnlijk? Wat is de impact?
3. Plan: Hoe gaan we ermee om?
4. Implement: Voer responses uit
5. Communicate: Informeer stakeholders

Risk responses:
- Threats: Avoid, Reduce, Transfer, Accept, Share
- Opportunities: Exploit, Enhance, Share, Accept, Reject

**Thema 6: Change**

Het Change thema beheerst wijzigingen en issues.

Drie soorten issues:
1. **Request for Change**: Wijzigingsverzoek op baseline
2. **Off-specification**: Afwijking van specificatie
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

De thema's zijn geïntegreerd:
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
        },
        {
          id: 'p2-q2',
          question: 'Welk principe stelt dat een project gedurende de hele looptijd zakelijk gerechtvaardigd moet zijn?',
          options: ['Learn from Experience', 'Continued Business Justification', 'Manage by Exception', 'Focus on Products'],
          correctAnswer: 1,
          explanation: 'Continued Business Justification zorgt dat het project altijd waarde blijft leveren.',
        },
        {
          id: 'p2-q3',
          question: 'Wat kun je NIET tailoren in PRINCE2?',
          options: ['Processen', 'Thema\'s', 'Rollen', 'De 7 principes'],
          correctAnswer: 3,
          explanation: 'De 7 principes zijn niet onderhandelbaar. Anders doe je geen PRINCE2.',
        },
        {
          id: 'p2-q4',
          question: 'Welk thema beantwoordt de vraag "Wie?"',
          options: ['Business Case', 'Organization', 'Quality', 'Plans'],
          correctAnswer: 1,
          explanation: 'Het Organization thema definieert rollen en verantwoordelijkheden.',
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
        },
      ],
    },
  ],
};

// ============================================
// MODULE 2: DE 7 THEMA'S IN DETAIL
// ============================================
const module2: Module = {
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
8. Analyseer risico's
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
    },
    {
      id: 'p2-l9',
      title: 'Risk, Change & Progress Themes',
      titleNL: 'Risk, Change & Progress Thema\'s',
      duration: '20:00',
      type: 'video',
      videoUrl: '',
      transcript: `In deze les behandelen we de laatste drie thema's: Risk, Change en Progress.

**RISK THEMA**

Het Risk thema managet onzekerheid in het project.

**Risk Definitie:**
Risk = Effect of uncertainty on objectives
Kan positief (opportunity) of negatief (threat) zijn.

**Risk Management Procedure:**
1. **Identify**: Welke risico's zijn er?
2. **Assess**: Probability × Impact = Risk Score
3. **Plan**: Kies een response strategie
4. **Implement**: Voer de response uit
5. **Communicate**: Informeer stakeholders

**Risk Responses voor Threats:**
- **Avoid**: Elimineer de oorzaak
- **Reduce**: Verklein kans of impact
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
Centrale log van alle risico's met:
- Risk ID en beschrijving
- Probability en Impact scores
- Response en eigenaar
- Status

**CHANGE THEMA**

Het Change thema beheerst wijzigingen en issues.

**Issue Types:**
1. **Request for Change**: Wijziging op baseline
2. **Off-Specification**: Product voldoet niet aan spec
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

De drie thema's werken samen:
- Risk identificeert onzekerheden
- Change beheerst wijzigingen
- Progress meet en rapporteert voortgang

Alle drie gebruiken registers en rapportages om de Board geïnformeerd te houden.`,
      keyTakeaways: [
        'Risk management: Identify → Assess → Plan → Implement → Communicate',
        'Three issue types: Request for Change, Off-Spec, Problem/Concern',
        'Progress works with tolerances and management by exception',
        'Checkpoint, Highlight, and Exception Reports inform different levels',
      ],
      keyTakeawaysNL: [
        'Risk management: Identify → Assess → Plan → Implement → Communicate',
        'Drie issue types: Request for Change, Off-Spec, Problem/Concern',
        'Progress werkt met toleranties en management by exception',
        'Checkpoint, Highlight en Exception Reports informeren verschillende niveaus',
      ],
    },
  ],
};

// ============================================
// MODULE 3: DE 7 PROCESSEN
// ============================================
const module3: Module = {
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
- Welke risico's manifesteerden zich?

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
- Grote risico's

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

**1. Prepare the Risk Management Strategy**
- Hoe gaan we met risico's om?
- Wie is verantwoordelijk?
- Welke tools gebruiken we?

**2. Prepare the Configuration Management Strategy**
- Hoe beheren we producten en versies?
- Hoe handelen we wijzigingen af?
- Welke systemen gebruiken we?

**3. Prepare the Quality Management Strategy**
- Wat zijn de kwaliteitsstandaarden?
- Hoe controleren we kwaliteit?
- Wie is verantwoordelijk?

**4. Prepare the Communication Management Strategy**
- Wie moet wat weten?
- Hoe communiceren we?
- Wanneer en hoe vaak?

**5. Set Up the Project Controls**
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
- Quality Management Strategy
- Configuration Management Strategy
- Risk Management Strategy
- Communication Management Strategy
- Project Plan
- Project Controls

De PID wordt gebruikt om:
- Het project te autoriseren (door Board)
- Voortgang tegen te meten
- Beslissingen te ondersteunen

**Tailoring de PID**

Voor kleine projecten kan de PID worden vereenvoudigd:
- Strategieën kunnen sectie in één document zijn
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
        'Four strategies are prepared: Risk, Quality, Config, Comms',
        'The Business Case is refined with better cost estimates',
      ],
      keyTakeawaysNL: [
        'IP creëert de Project Initiation Documentation (PID)',
        'De PID is de baseline voor het project',
        'Vier strategieën worden opgesteld: Risk, Quality, Config, Comms',
        'De Business Case wordt verfijnd met betere kostenschattingen',
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
Nieuwe issues en risico's:
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
- Issues en risico's
- Schattingen rest werk

Frequentie: afgesproken per Work Package.

**Het Highlight Report**

PM rapporteert aan Board:
- Status (rood/amber/groen)
- Voortgang vs. plan
- Budget status
- Issues en risico's
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
- Zijn risico's acceptabel?

**4. Report Stage End**
End Stage Report aan de Board:
- Prestaties van de afgelopen stage
- Status van producten
- Issues en risico's
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
- Controleer openstaande issues/risico's

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

**Benefits Review Plan**

Veel benefits worden pas NA het project gerealiseerd.

Het plan beschrijft:
- Welke benefits meten
- Wanneer meten
- Wie verantwoordelijk (meestal Senior User)
- Hoe rapporteren

Dit is input voor de post-project review.

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
- Stelt benefits review plan op
- Vraagt Board om formele sluiting`,
      keyTakeaways: [
        'CP is mandatory, even when stopping prematurely',
        'End Project Report evaluates the entire project',
        'Benefits Review Plan ensures post-project benefits measurement',
        'Lessons Report documents lessons learned',
      ],
      keyTakeawaysNL: [
        'CP is verplicht, ook bij voortijdig stoppen',
        'End Project Report evalueert het hele project',
        'Benefits Review Plan zorgt voor post-project benefits meting',
        'Lessons Report documenteert geleerde lessen',
      ],
    },
  ],
};

// ============================================
// MODULE 4: TAILORING & EXAMEN
// ============================================
const module4: Module = {
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
- Mag processen, thema's, rollen en producten vereenvoudigen
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
        },
        {
          id: 'p2-q7',
          question: 'Wie produceert de Project Initiation Documentation (PID)?',
          options: ['Executive', 'Project Board', 'Project Manager', 'Team Manager'],
          correctAnswer: 2,
          explanation: 'De Project Manager produceert de PID in het IP proces.',
        },
        {
          id: 'p2-q8',
          question: 'Welk rapport stuurt de PM regelmatig naar de Project Board?',
          options: ['Checkpoint Report', 'Highlight Report', 'End Stage Report', 'Exception Report'],
          correctAnswer: 1,
          explanation: 'Highlight Reports gaan regelmatig (typisch 2-wekelijks) naar de Board.',
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
        },
        {
          id: 'p2-q10',
          question: 'Welk proces mag NOOIT worden overgeslagen, zelfs niet bij voortijdig stoppen?',
          options: ['SU - Starting Up', 'IP - Initiating', 'CS - Controlling a Stage', 'CP - Closing a Project'],
          correctAnswer: 3,
          explanation: 'CP moet altijd worden uitgevoerd, ook bij voortijdig stoppen, voor lessons learned en administratieve afsluiting.',
        },
      ],
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
  description: 'The complete PRINCE2 certification training. Learn the 7 principles, 7 themes, and 7 processes to manage projects in controlled environments.',
  descriptionNL: 'De complete PRINCE2 certificeringstraining. Leer de 7 principes, 7 thema\'s en 7 processen om projecten in gecontroleerde omgevingen te managen.',
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