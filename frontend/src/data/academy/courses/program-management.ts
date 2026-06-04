// ============================================
// COURSE: PROGRAM MANAGEMENT PROFESSIONAL
// ============================================
// Complete course: 16 lessons, all with full NL+EN content
// Top 6 lessons with extensive ASCII visuals
// All lessons have icons, key takeaways, and resources
// ============================================

import { Layers } from 'lucide-react';
import { Course, Module } from '../types';
import { BRAND } from '../brand';
import { instructors } from '../instructors';

// ============================================
// MODULE 1: PROGRAM MANAGEMENT BASICS
// ============================================
const module1: Module = {
  id: 'pgm-m1',
  title: 'Module 1: Program Management Basics',
  titleNL: 'Programma Management Basis',
  description: 'Understanding the fundamentals of program management and how it differs from projects.',
  descriptionNL: 'Begrijpen van de fundamenten van programma management en hoe het verschilt van projecten.',
  order: 0,
  icon: 'BookOpen',
  color: '#6366F1',
  gradient: 'linear-gradient(135deg, #6366F1 0%, #4F46E5 100%)',
  lessons: [
    {
      id: 'pgm-l1',
      title: 'Program vs Project vs Portfolio',
      titleNL: 'Programma vs Project vs Portfolio',
      type: 'video',
      duration: '12:00',
      free: true,
      videoUrl: '',
      icon: 'Layers',
      transcript: `Welcome to Program Management Professional! Let's start by understanding the crucial differences between projects, programs, and portfolios - these distinctions are fundamental to success.

**The Three Levels of Work**

Organizations structure their work in three distinct levels:

1. **Projects** - Individual initiatives
2. **Programs** - Groups of related projects
3. **Portfolios** - Collections of programs and projects

Understanding this hierarchy is essential.

**What is a Project?**

A project is a temporary endeavor undertaken to create a unique product, service, or result.

**Project Characteristics:**
- **Temporary**: Defined start and end date
- **Unique**: One-time deliverable
- **Specific goal**: Clear, measurable objective
- **Dedicated team**: Resources assigned for duration
- **Budget constraints**: Fixed or time-boxed funding

**Example Project:**
"Develop new mobile banking app"
- Duration: 6 months
- Team: 8 developers, 2 designers, 1 PM
- Budget: $500,000
- Deliverable: Functioning mobile app in App Store

**What is a Program?**

A program is a group of related projects, subsidiary programs, and program activities managed in a coordinated way to obtain benefits not available from managing them individually.

**Program Characteristics:**
- **Multiple related projects**: Coordinated delivery
- **Strategic focus**: Aligned to organizational strategy
- **Benefits realization**: Delivers outcomes, not just outputs
- **Longer duration**: Months to years
- **Adaptive scope**: Evolves based on realized benefits
- **Change management**: Drives organizational transformation

**Example Program:**
"Digital Banking Transformation"
- Duration: 2-3 years
- Includes projects:
  - Mobile banking app (Project 1)
  - Online banking redesign (Project 2)
  - ATM network upgrade (Project 3)
  - Customer data migration (Project 4)
  - Staff training program (Project 5)
- Benefit: 40% increase in digital adoption, $2M annual cost savings

**Visual: Program Hierarchy**

\`\`\`
┌────────────────────────────────────────┐
│          PORTFOLIO                     │
│  (Strategic Alignment)                 │
│                                        │
│  ┌──────────────────┐  ┌────────────┐ │
│  │   PROGRAM 1      │  │ PROJECT X  │ │
│  │  Digital Banking │  │ Standalone │ │
│  │                  │  └────────────┘ │
│  │  ┌────────────┐  │                 │
│  │  │ Project A  │  │  ┌────────────┐ │
│  │  │Mobile App  │  │  │ PROJECT Y  │ │
│  │  └────────────┘  │  │ Standalone │ │
│  │  ┌────────────┐  │  └────────────┘ │
│  │  │ Project B  │  │                 │
│  │  │Online Bank │  │                 │
│  │  └────────────┘  │                 │
│  │  ┌────────────┐  │                 │
│  │  │ Project C  │  │                 │
│  │  │ATM Upgrade │  │                 │
│  │  └────────────┘  │                 │
│  └──────────────────┘                 │
└────────────────────────────────────────┘

Portfolio → Strategic Goals
Programs → Benefits & Outcomes
Projects → Deliverables & Outputs
\`\`\`

**The Key Difference**

**Projects deliver OUTPUTS** (tangible deliverables)
→ A mobile app, a building, a report

**Programs deliver OUTCOMES** (strategic benefits)
→ Increased customer satisfaction, market share growth, operational efficiency

**What is a Portfolio?**

A portfolio is a collection of projects, programs, subsidiary portfolios, and operations managed as a group to achieve strategic objectives.

**Portfolio Characteristics:**
- **Strategic alignment**: Directly linked to organizational strategy
- **Resource optimization**: Allocate resources across initiatives
- **Risk management**: Balance risk across portfolio
- **Value maximization**: Prioritize highest-value work
- **Ongoing management**: Continuous evaluation and adjustment

**Example Portfolio:**
"IT Portfolio" containing:
- Digital Transformation Program
- Infrastructure Modernization Program
- Cybersecurity Enhancement Program
- Various standalone IT projects
- Operational IT activities

**Comparison Table**

\`\`\`
┌──────────────┬────────────────┬────────────────┬──────────────┐
│   Aspect     │    Project     │    Program     │  Portfolio   │
├──────────────┼────────────────┼────────────────┼──────────────┤
│ Focus        │ Deliverable    │ Benefits       │ Strategy     │
│ Scope        │ Narrow         │ Broad          │ Enterprise   │
│ Duration     │ Temporary      │ Extended       │ Ongoing      │
│ Change       │ Minimize       │ Embrace        │ Continuous   │
│ Success      │ On time/budget │ Benefits       │ ROI/Strategy │
│ Leadership   │ Project Manager│ Program Manager│ Portfolio Mgr│
│ Uncertainty  │ Manage         │ Navigate       │ Embrace      │
└──────────────┴────────────────┴────────────────┴──────────────┘
\`\`\`

**Why Programs?**

Programs exist to achieve benefits that individual projects cannot deliver:

**Benefit 1: Strategic Alignment**
Programs ensure multiple projects work toward common strategic goals.

**Benefit 2: Economies of Scale**
Shared resources, governance, and infrastructure across projects.

**Benefit 3: Coordinated Change**
Manage organizational change holistically, not project-by-project.

**Benefit 4: Risk Management**
Identify and manage interdependencies and risks across projects.

**Benefit 5: Benefits Realization**
Focus on outcomes and value delivery, not just project completion.

**Benefit 6: Stakeholder Management**
Unified communication and engagement across related initiatives.

**Program Manager vs Project Manager**

**Project Manager:**
- Manages single project
- Focuses on deliverables
- Controls scope tightly
- Tactical execution
- Ends when project delivers
- Success = on time, on budget, meeting requirements

**Program Manager:**
- Orchestrates multiple projects
- Focuses on benefits
- Flexible scope for value
- Strategic direction
- Continues through benefits realization
- Success = strategic objectives achieved

**Real-World Program Examples**

**Olympic Games:**
A program containing:
- Venue construction projects
- Transportation infrastructure
- Security planning
- Volunteer management
- Marketing and PR
- Technology systems
- Post-games legacy planning

**ERP Implementation:**
A program including:
- Software selection and purchase
- Data migration projects
- Process redesign initiatives
- Training program
- Change management
- System integration
- Post-implementation support

**Product Launch:**
A program containing:
- Product development
- Marketing campaign
- Sales enablement
- Distribution setup
- Customer support preparation
- Market research
- Partner onboarding

**When to Use a Program**

Use program management when you have:

✓ **Multiple related projects** that should be coordinated
✓ **Strategic change** requiring organizational transformation
✓ **Shared resources** across initiatives
✓ **Complex dependencies** between projects
✓ **Benefits that span projects** and require sustained focus
✓ **Extended timeframe** (typically 18+ months)
✓ **Significant organizational impact** requiring change management

**Don't use program management for:**
✗ Single, independent projects
✗ Routine operations
✗ Simple, short-duration initiatives
✗ When overhead exceeds value

**The Program Lifecycle**

\`\`\`
DEFINITION → BENEFITS → DELIVERY → CLOSURE
     ↓          ↓          ↓          ↓
  Business   Benefits   Component  Transition
   Case      Planning   Execution   & Close
     ↓          ↓          ↓          ↓
  Identify  Map Benefits Execute   Sustain
  Benefits   to Projects  Projects  Benefits
\`\`\`

Programs are iterative - they adapt as benefits are realized.

**Key Program Documents**

Unlike projects, programs require:
- **Program Business Case**: Why the program exists
- **Program Charter**: Authority and objectives
- **Program Management Plan**: How it will be managed
- **Benefits Realization Plan**: How benefits will be achieved and measured
- **Program Roadmap**: High-level timeline of components
- **Stakeholder Engagement Plan**: Communication and engagement strategy

**Program Governance**

Programs typically have layered governance:

\`\`\`
    ┌─────────────────────────┐
    │  STEERING COMMITTEE     │
    │  (Strategic Decisions)  │
    └───────────┬─────────────┘
                │
    ┌───────────▼─────────────┐
    │  PROGRAM BOARD          │
    │  (Oversight & Direction)│
    └───────────┬─────────────┘
                │
    ┌───────────▼─────────────┐
    │  PROGRAM MANAGER        │
    │  (Day-to-day Management)│
    └───────────┬─────────────┘
                │
       ┌────────┴────────┐
       │                 │
   ┌───▼────┐      ┌─────▼──┐
   │PROJECT │      │PROJECT │
   │   A    │      │   B    │
   └────────┘      └────────┘
\`\`\`

**Success Metrics**

**Project Success Measured By:**
- On time delivery
- Within budget
- Meeting requirements
- Quality standards met

**Program Success Measured By:**
- Benefits realized
- Strategic objectives achieved
- ROI delivered
- Stakeholder satisfaction
- Organizational capability improved

**The Program Management Challenge**

Programs are complex because:
- Longer duration = more uncertainty
- Multiple moving parts
- Organizational politics
- Resource conflicts
- Changing priorities
- Interdependencies
- Cultural resistance to change

**Your Role as Program Manager**

You are:
- Strategic thinker
- Benefits champion
- Relationship builder
- Change agent
- Risk navigator
- Value deliverer
- Organization influencer

You are NOT just a "super project manager"!

**Summary**

Key takeaways:
- Projects = Outputs, Programs = Outcomes, Portfolios = Strategy
- Programs coordinate related projects for strategic value
- Programs focus on benefits realization, not just delivery
- Program managers lead strategic change, not just project execution
- Use programs when benefits span multiple projects

In the next lesson, we'll explore the program lifecycle in detail!`,
      transcriptNL: `Welkom bij Programma Management Professional! Laten we beginnen met het begrijpen van de cruciale verschillen tussen projecten, programma's en portfolio's - deze onderscheidingen zijn fundamenteel voor succes.

**De Drie Niveaus van Werk**

Organisaties structureren hun werk in drie verschillende niveaus:

1. **Projecten** - Individuele initiatieven
2. **Programma's** - Groepen van gerelateerde projecten
3. **Portfolio's** - Collecties van programma's en projecten

Dit begrijpen van deze hiërarchie is essentieel.

**Wat is een Project?**

Een project is een tijdelijke onderneming ondernomen om een uniek product, dienst of resultaat te creëren.

**Project Kenmerken:**
- **Tijdelijk**: Gedefinieerde start en eind datum
- **Uniek**: Eenmalige oplevering
- **Specifiek doel**: Duidelijk, meetbaar objectief
- **Toegewijd team**: Resources toegewezen voor duur
- **Budget beperkingen**: Vaste of tijd-gebonden financiering

**Voorbeeld Project:**
"Ontwikkel nieuwe mobile banking app"
- Duur: 6 maanden
- Team: 8 ontwikkelaars, 2 designers, 1 PM
- Budget: €500,000
- Oplevering: Functionerende mobile app in App Store

**Wat is een Programma?**

Een programma is een groep van gerelateerde projecten, dochter programma's en programma activiteiten gemanaged op een gecoördineerde manier om benefits te verkrijgen die niet beschikbaar zijn door ze individueel te managen.

**Programma Kenmerken:**
- **Meerdere gerelateerde projecten**: Gecoördineerde oplevering
- **Strategische focus**: Afgestemd op organisatiestrategie
- **Benefits realisatie**: Levert outcomes, niet alleen outputs
- **Langere duur**: Maanden tot jaren
- **Adaptieve scope**: Evolueert gebaseerd op gerealiseerde benefits
- **Change management**: Drijft organisatietransformatie

**Voorbeeld Programma:**
"Digitale Banking Transformatie"
- Duur: 2-3 jaar
- Bevat projecten:
  - Mobile banking app (Project 1)
  - Online banking herontwerp (Project 2)
  - ATM netwerk upgrade (Project 3)
  - Klantdata migratie (Project 4)
  - Personeel trainingsprogramma (Project 5)
- Benefit: 40% toename in digitale adoptie, €2M jaarlijkse kostenbesparing

**Visual: Programma Hiërarchie**

\`\`\`
┌────────────────────────────────────────┐
│          PORTFOLIO                     │
│  (Strategische Afstemming)             │
│                                        │
│  ┌──────────────────┐  ┌────────────┐ │
│  │  PROGRAMMA 1     │  │ PROJECT X  │ │
│  │ Digitale Banking │  │ Standalone │ │
│  │                  │  └────────────┘ │
│  │  ┌────────────┐  │                 │
│  │  │ Project A  │  │  ┌────────────┐ │
│  │  │Mobile App  │  │  │ PROJECT Y  │ │
│  │  └────────────┘  │  │ Standalone │ │
│  │  ┌────────────┐  │  └────────────┘ │
│  │  │ Project B  │  │                 │
│  │  │Online Bank │  │                 │
│  │  └────────────┘  │                 │
│  │  ┌────────────┐  │                 │
│  │  │ Project C  │  │                 │
│  │  │ATM Upgrade │  │                 │
│  │  └────────────┘  │                 │
│  └──────────────────┘                 │
└────────────────────────────────────────┘

Portfolio → Strategische Doelen
Programma's → Benefits & Outcomes
Projecten → Opleveringen & Outputs
\`\`\`

**Het Belangrijkste Verschil**

**Projecten leveren OUTPUTS** (tastbare opleveringen)
→ Een mobile app, een gebouw, een rapport

**Programma's leveren OUTCOMES** (strategische benefits)
→ Verhoogde klanttevredenheid, marktaandeel groei, operationele efficiëntie

**Wat is een Portfolio?**

Een portfolio is een collectie van projecten, programma's, dochter portfolio's en operaties gemanaged als een groep om strategische doelstellingen te bereiken.

**Portfolio Kenmerken:**
- **Strategische afstemming**: Direct gekoppeld aan organisatiestrategie
- **Resource optimalisatie**: Alloceer resources over initiatieven
- **Risicomanagement**: Balanceer risico over portfolio
- **Waarde maximalisatie**: Prioriteer hoogste-waarde werk
- **Doorlopend management**: Continue evaluatie en aanpassing

**Voorbeeld Portfolio:**
"IT Portfolio" bevat:
- Digitale Transformatie Programma
- Infrastructuur Modernisatie Programma
- Cybersecurity Verbetering Programma
- Diverse standalone IT projecten
- Operationele IT activiteiten

**Vergelijkingstabel**

\`\`\`
┌──────────────┬────────────────┬────────────────┬──────────────┐
│   Aspect     │    Project     │   Programma    │  Portfolio   │
├──────────────┼────────────────┼────────────────┼──────────────┤
│ Focus        │ Oplevering     │ Benefits       │ Strategie    │
│ Scope        │ Smal           │ Breed          │ Enterprise   │
│ Duur         │ Tijdelijk      │ Uitgebreid     │ Doorlopend   │
│ Verandering  │ Minimaliseer   │ Omarm          │ Continu      │
│ Succes       │ Op tijd/budget │ Benefits       │ ROI/Strategie│
│ Leiderschap  │ Project Manager│Program Manager │Portfolio Mgr │
│ Onzekerheid  │ Manage         │ Navigeer       │ Omarm        │
└──────────────┴────────────────┴────────────────┴──────────────┘
\`\`\`

**Waarom Programma's?**

Programma's bestaan om benefits te bereiken die individuele projecten niet kunnen leveren:

**Benefit 1: Strategische Afstemming**
Programma's zorgen ervoor dat meerdere projecten werken naar gemeenschappelijke strategische doelen.

**Benefit 2: Schaalvoordelen**
Gedeelde resources, governance en infrastructuur over projecten.

**Benefit 3: Gecoördineerde Verandering**
Manage organisatie verandering holistisch, niet project-voor-project.

**Benefit 4: Risicomanagement**
Identificeer en manage onderlinge afhankelijkheden en risico's over projecten.

**Benefit 5: Benefits Realisatie**
Focus op outcomes en waarde levering, niet alleen project voltooiing.

**Benefit 6: Stakeholder Management**
Geünificeerde communicatie en betrokkenheid over gerelateerde initiatieven.

**Programma Manager vs Project Manager**

**Project Manager:**
- Managet enkel project
- Focust op opleveringen
- Controleert scope strikt
- Tactische uitvoering
- Eindigt wanneer project oplevert
- Succes = op tijd, op budget, voldoet aan eisen

**Programma Manager:**
- Orchestreert meerdere projecten
- Focust op benefits
- Flexibele scope voor waarde
- Strategische richting
- Gaat door tot benefits realisatie
- Succes = strategische doelstellingen bereikt

**Real-World Programma Voorbeelden**

**Olympische Spelen:**
Een programma bevat:
- Venue bouw projecten
- Transport infrastructuur
- Veiligheidsplanning
- Vrijwilligers management
- Marketing en PR
- Technologie systemen
- Post-spelen legacy planning

**ERP Implementatie:**
Een programma inclusief:
- Software selectie en aankoop
- Data migratie projecten
- Proces herontwerp initiatieven
- Trainingsprogramma
- Change management
- Systeem integratie
- Post-implementatie support

**Product Lancering:**
Een programma bevat:
- Product ontwikkeling
- Marketing campagne
- Sales enablement
- Distributie setup
- Klant support voorbereiding
- Markt onderzoek
- Partner onboarding

**Wanneer Een Programma Gebruiken**

Gebruik programma management wanneer je hebt:

✓ **Meerdere gerelateerde projecten** die gecoördineerd moeten worden
✓ **Strategische verandering** die organisatietransformatie vereist
✓ **Gedeelde resources** over initiatieven
✓ **Complexe afhankelijkheden** tussen projecten
✓ **Benefits die projecten omspannen** en aanhoudende focus vereisen
✓ **Uitgebreid tijdsbestek** (typisch 18+ maanden)
✓ **Significante organisatie impact** die change management vereist

**Gebruik geen programma management voor:**
✗ Enkele, onafhankelijke projecten
✗ Routine operaties
✗ Simpele, korte-duur initiatieven
✗ Wanneer overhead waarde overschrijdt

**De Programma Levenscyclus**

\`\`\`
DEFINITIE → BENEFITS → LEVERING → AFSLUITING
     ↓          ↓          ↓          ↓
  Business   Benefits   Component  Transitie
   Case      Planning   Uitvoering  & Sluit
     ↓          ↓          ↓          ↓
Identificeer Map Benefits Voer Uit  Sustain
 Benefits    naar Projects Projects  Benefits
\`\`\`

Programma's zijn iteratief - ze passen aan naarmate benefits worden gerealiseerd.

**Belangrijke Programma Documenten**

Anders dan projecten vereisen programma's:
- **Programma Business Case**: Waarom het programma bestaat
- **Programma Charter**: Autoriteit en doelstellingen
- **Programma Management Plan**: Hoe het gemanaged wordt
- **Benefits Realisatie Plan**: Hoe benefits bereikt en gemeten worden
- **Programma Roadmap**: Hoog-niveau tijdlijn van componenten
- **Stakeholder Betrokkenheid Plan**: Communicatie en betrokkenheid strategie

**Programma Governance**

Programma's hebben typisch gelaagde governance:

\`\`\`
    ┌─────────────────────────┐
    │  STUUR COMMISSIE        │
    │  (Strategische Besluiten)│
    └───────────┬─────────────┘
                │
    ┌───────────▼─────────────┐
    │  PROGRAMMA BOARD        │
    │  (Toezicht & Richting)  │
    └───────────┬─────────────┘
                │
    ┌───────────▼─────────────┐
    │  PROGRAMMA MANAGER      │
    │  (Dag-tot-dag Management)│
    └───────────┬─────────────┘
                │
       ┌────────┴────────┐
       │                 │
   ┌───▼────┐      ┌─────▼──┐
   │PROJECT │      │PROJECT │
   │   A    │      │   B    │
   └────────┘      └────────┘
\`\`\`

**Succes Metrics**

**Project Succes Gemeten Door:**
- Op tijd oplevering
- Binnen budget
- Voldoen aan eisen
- Kwaliteitsnormen gehaald

**Programma Succes Gemeten Door:**
- Benefits gerealiseerd
- Strategische doelstellingen bereikt
- ROI geleverd
- Stakeholder tevredenheid
- Organisatie capaciteit verbeterd

**De Programma Management Uitdaging**

Programma's zijn complex omdat:
- Langere duur = meer onzekerheid
- Meerdere bewegende delen
- Organisatie politiek
- Resource conflicten
- Veranderende prioriteiten
- Onderlinge afhankelijkheden
- Culturele weerstand tegen verandering

**Je Rol als Programma Manager**

Je bent:
- Strategische denker
- Benefits champion
- Relatie bouwer
- Change agent
- Risico navigator
- Waarde leveraar
- Organisatie beïnvloeder

Je bent NIET alleen een "super project manager"!

**Samenvatting**

Belangrijke punten:
- Projecten = Outputs, Programma's = Outcomes, Portfolio's = Strategie
- Programma's coördineren gerelateerde projecten voor strategische waarde
- Programma's focussen op benefits realisatie, niet alleen levering
- Programma managers leiden strategische verandering, niet alleen project uitvoering
- Gebruik programma's wanneer benefits meerdere projecten omspannen

In de volgende les verkennen we de programma levenscyclus in detail!`,
      keyTakeaways: [
        'Projects deliver outputs (deliverables), Programs deliver outcomes (benefits), Portfolios deliver strategy',
        'Programs coordinate multiple related projects for benefits not available from managing individually',
        'Program Managers focus on benefits realization and strategic change, not just project delivery',
        'Use programs when you have multiple related projects with shared benefits and extended timeframes',
      ],
      keyTakeawaysEN: [
        'Projects deliver outputs (deliverables), Programs deliver outcomes (benefits), Portfolios deliver strategy',
        'Programs coordinate multiple related projects for benefits not available from managing individually',
        'Program Managers focus on benefits realization and strategic change, not just project delivery',
        'Use programs when you have multiple related projects with shared benefits and extended timeframes',
      ],
      keyTakeawaysNL: [
        'Projecten leveren outputs (opleveringen), Programma\'s leveren outcomes (benefits), Portfolio\'s leveren strategie',
        'Programma\'s coördineren meerdere gerelateerde projecten voor benefits niet beschikbaar door individueel managen',
        'Programma Managers focussen op benefits realisatie en strategische verandering, niet alleen project levering',
        'Gebruik programma\'s wanneer je meerdere gerelateerde projecten hebt met gedeelde benefits en uitgebreide tijdsbestekken',
      ],
      resources: [
        {
          name: 'Program vs Project Comparison Matrix',
          nameNL: 'Programma vs Project Vergelijking Matrix',
          type: 'PDF',
          size: '1.2 MB',
          description: 'Detailed side-by-side comparison with real-world examples',
          descriptionNL: 'Gedetailleerde zij-aan-zij vergelijking met real-world voorbeelden',
        },
        {
          name: 'When to Use a Program Checklist',
          nameNL: 'Wanneer Een Programma Gebruiken Checklist',
          type: 'PDF',
          size: '450 KB',
          description: 'Decision tool for determining if program management is appropriate',
          descriptionNL: 'Beslissingstool om te bepalen of programma management geschikt is',
        },
        {
          name: 'Program Structure Templates',
          nameNL: 'Programma Structuur Templates',
          type: 'DOCX',
          size: '890 KB',
          description: 'Templates for organizing multi-project programs',
          descriptionNL: 'Templates voor het organiseren van multi-project programma\'s',
        },
      ],
    },
    {
      id: 'pgm-l2',
      title: 'The Program Lifecycle',
      titleNL: 'De Programmalevenscyclus',
      type: 'video',
      duration: '15:00',
      free: true,
      videoUrl: '',
      icon: 'Repeat',
      transcript: `The program lifecycle is fundamentally different from project lifecycle. Programs are iterative and adaptive, not linear. Let's explore each phase.

**Program Lifecycle Overview**

Unlike projects with their clear phases, programs cycle through:

\`\`\`
    ┌──────────────────────────────────┐
    │   Program Definition Phase       │
    │   • Develop business case        │
    │   • Define benefits              │
    │   • Establish governance         │
    └────────────┬─────────────────────┘
                 ↓
    ┌────────────▼─────────────────────┐
    │   Program Benefits Delivery      │
    │   • Setup program structure      │
    │   • Mobilize resources           │
    │   • Initiate projects            │
    └────────────┬─────────────────────┘
                 ↓
    ┌────────────▼─────────────────────┐
    │   Program Execution             │
    │   • Execute projects             │
    │   • Monitor benefits             │
    │   • Adapt & adjust               │
    └────────────┬─────────────────────┘
                 ↓
    ┌────────────▼─────────────────────┐
    │   Program Closure                │
    │   • Transition benefits          │
    │   • Close projects               │
    │   • Capture lessons              │
    └──────────────────────────────────┘
\`\`\`

**Phase 1: Program Definition**

This is where we establish WHY the program exists.

**Key Activities:**
1. **Develop Business Case**
   - Strategic justification
   - Expected benefits
   - High-level costs
   - Risk assessment
   - Alternatives considered

2. **Define Vision and Objectives**
   - Clear strategic intent
   - Measurable objectives
   - Success criteria
   - Stakeholder expectations

3. **Identify Benefits**
   - Financial benefits (cost savings, revenue increase)
   - Non-financial benefits (customer satisfaction, market share)
   - Strategic benefits (capability development)
   - Benefit metrics and KPIs

4. **Establish Governance**
   - Steering committee
   - Program board
   - Decision rights
   - Reporting structure

5. **High-Level Roadmap**
   - Major phases
   - Key milestones
   - Sequencing logic
   - Dependencies

**Outputs:**
- Program Business Case
- Program Charter
- Stakeholder Register
- High-level Roadmap
- Governance Framework

**Phase 2: Program Setup (Benefits Delivery)**

Now we build the program infrastructure.

**Key Activities:**

1. **Establish Program Management Office (PMO)**
   - Team structure
   - Roles and responsibilities
   - Processes and standards
   - Tools and systems

2. **Develop Program Management Plan**
   - How program will be executed
   - How benefits will be realized
   - How risks will be managed
   - How changes will be controlled

3. **Create Benefits Realization Plan**
   - Benefit owners assigned
   - Measurement approach
   - Realization timeline
   - Tracking mechanisms

4. **Identify and Structure Components**
   - What projects are needed?
   - Project sequencing
   - Dependencies mapped
   - Resource requirements

5. **Mobilize Resources**
   - Recruit project managers
   - Assign sponsors
   - Allocate budget
   - Setup communication channels

**Outputs:**
- Program Management Plan
- Benefits Realization Plan
- Program Roadmap (detailed)
- Resource Plan
- Risk Register

**Phase 3: Program Execution**

This is the longest phase - where work happens.

**Key Activities (Continuous):**

1. **Initiate and Oversee Projects**
   - Launch projects per roadmap
   - Provide oversight
   - Remove impediments
   - Coordinate dependencies

2. **Monitor Benefits Realization**
   - Track benefit KPIs
   - Assess progress toward targets
   - Identify gaps
   - Adjust approach

3. **Manage Program Governance**
   - Regular steering committee meetings
   - Status reporting
   - Decision escalation
   - Issue resolution

4. **Coordinate Across Projects**
   - Manage interdependencies
   - Resolve resource conflicts
   - Share lessons learned
   - Ensure alignment

5. **Manage Change**
   - Evaluate change requests
   - Assess impact on benefits
   - Approve/reject changes
   - Update plans

6. **Communicate with Stakeholders**
   - Progress updates
   - Success stories
   - Issue transparency
   - Expectation management

7. **Adapt Program**
   - Based on realized benefits
   - Market changes
   - Strategic shifts
   - Lessons learned

**This is NOT linear!** Programs cycle through planning, executing, and adapting continuously.

**Visual: Program Execution Cycle**

\`\`\`
    Plan Components
          ↓
    Execute Projects
          ↓
    Realize Benefits
          ↓
    Measure Results
          ↓
    Adapt Approach
          ↓
    (cycle repeats)
\`\`\`

**Phase 4: Program Closure**

Unlike project closure (quick and clean), program closure is gradual.

**Key Activities:**

1. **Transition Benefits**
   - Transfer ownership to operations
   - Embed new capabilities
   - Document processes
   - Train operational teams

2. **Close Component Projects**
   - Final deliverables accepted
   - Resources released
   - Documentation archived
   - Contracts closed

3. **Confirm Benefits Realization**
   - Final benefit measurement
   - Compare to targets
   - Document shortfalls or overages
   - Plan for sustained monitoring

4. **Capture Lessons Learned**
   - What worked well?
   - What would we change?
   - Key success factors
   - Pitfalls to avoid

5. **Celebrate Success**
   - Recognize contributions
   - Share success stories
   - Acknowledge team efforts

6. **Archive Program Assets**
   - Documentation
   - Decisions and rationale
   - Measurements and metrics
   - Knowledge artifacts

**Outputs:**
- Program Closure Report
- Lessons Learned Document
- Benefits Realization Report
- Operational Handover Package
- Final Financials

**Key Differences from Projects**

\`\`\`
┌─────────────────┬──────────────┬──────────────┐
│                 │   Project    │   Program    │
├─────────────────┼──────────────┼──────────────┤
│ Phases          │ Sequential   │ Iterative    │
│ Changes         │ Minimize     │ Expected     │
│ Completion      │ Clear end    │ Gradual      │
│ Success metrics │ Deliverables │ Benefits     │
│ Duration        │ Months       │ Years        │
│ Flexibility     │ Low          │ High         │
└─────────────────┴──────────────┴──────────────┘
\`\`\`

**Benefits Realization Timing**

Important: Benefits often don't appear until AFTER projects complete!

\`\`\`
Project Timeline:  [════════════]
                               ↓
Benefits Start:              [benefits begin]
                               ↓
Full Realization:           [═══════════]
                             6-12 months later!
\`\`\`

This is why programs continue beyond project completion.

**Program Health Checks**

Throughout execution, assess:
- Are projects on track?
- Are benefits being realized?
- Is governance effective?
- Are stakeholders engaged?
- Do we need to adapt?

**When to Close**

Close a program when:
✓ All benefits realized and sustained
✓ No more component projects needed
✓ Capabilities transferred to operations
✓ Stakeholders satisfied
✓ Resources needed elsewhere

Don't close too early - benefits need nurturing!

**Common Mistakes**

❌ **Treating it like a big project**: Programs need different management
❌ **Closing after last project**: Benefits not yet realized
❌ **Ignoring benefit metrics**: Can't prove value delivered
❌ **Poor transition planning**: Benefits lost in operations

**Summary**

- Program lifecycle has 4 phases: Definition, Setup, Execution, Closure
- Execution phase is iterative and adaptive, not linear
- Benefits often realize AFTER projects complete
- Programs close gradually as benefits transfer to operations
- Success measured by benefits achieved, not projects completed

Next: Mastering Benefits Management!`,
      transcriptNL: `De programma levenscyclus is fundamenteel anders dan de project levenscyclus. Programma's zijn iteratief en adaptief, niet lineair. Laten we elke fase verkennen.

**Programma Levenscyclus Overzicht**

Anders dan projecten met hun duidelijke fasen, cyclen programma's door:

\`\`\`
    ┌──────────────────────────────────┐
    │   Programma Definitie Fase       │
    │   • Ontwikkel business case      │
    │   • Definieer benefits           │
    │   • Vestig governance            │
    └────────────┬─────────────────────┘
                 ↓
    ┌────────────▼─────────────────────┐
    │   Programma Benefits Levering    │
    │   • Setup programma structuur    │
    │   • Mobiliseer resources         │
    │   • Initieer projecten           │
    └────────────┬─────────────────────┘
                 ↓
    ┌────────────▼─────────────────────┐
    │   Programma Uitvoering           │
    │   • Voer projecten uit           │
    │   • Monitor benefits             │
    │   • Pas aan & adjust             │
    └────────────┬─────────────────────┘
                 ↓
    ┌────────────▼─────────────────────┐
    │   Programma Afsluiting           │
    │   • Transitie benefits           │
    │   • Sluit projecten              │
    │   • Leg lessen vast              │
    └──────────────────────────────────┘
\`\`\`

**Fase 1: Programma Definitie**

Dit is waar we vaststellen WAAROM het programma bestaat.

**Belangrijke Activiteiten:**
1. **Ontwikkel Business Case**
   - Strategische rechtvaardiging
   - Verwachte benefits
   - Hoog-niveau kosten
   - Risico assessment
   - Alternatieven overwogen

2. **Definieer Visie en Doelstellingen**
   - Duidelijke strategische intentie
   - Meetbare doelstellingen
   - Succescriteria
   - Stakeholder verwachtingen

3. **Identificeer Benefits**
   - Financiële benefits (kostenbesparingen, omzet toename)
   - Niet-financiële benefits (klanttevredenheid, marktaandeel)
   - Strategische benefits (capaciteit ontwikkeling)
   - Benefit metrics en KPIs

4. **Vestig Governance**
   - Stuurcommissie
   - Programma board
   - Beslissingsrechten
   - Rapportage structuur

5. **Hoog-Niveau Roadmap**
   - Belangrijke fasen
   - Sleutelmijlpalen
   - Sequentie logica
   - Afhankelijkheden

**Outputs:**
- Programma Business Case
- Programma Charter
- Stakeholder Register
- Hoog-niveau Roadmap
- Governance Framework

**Fase 2: Programma Setup (Benefits Levering)**

Nu bouwen we de programma infrastructuur.

**Belangrijke Activiteiten:**

1. **Vestig Programma Management Office (PMO)**
   - Team structuur
   - Rollen en verantwoordelijkheden
   - Processen en standaarden
   - Tools en systemen

2. **Ontwikkel Programma Management Plan**
   - Hoe programma uitgevoerd wordt
   - Hoe benefits gerealiseerd worden
   - Hoe risico's gemanaged worden
   - Hoe veranderingen gecontroleerd worden

3. **Creëer Benefits Realisatie Plan**
   - Benefit eigenaren toegewezen
   - Metingsaanpak
   - Realisatie tijdlijn
   - Tracking mechanismen

4. **Identificeer en Structureer Componenten**
   - Welke projecten zijn nodig?
   - Project sequentie
   - Afhankelijkheden gemapt
   - Resource vereisten

5. **Mobiliseer Resources**
   - Recruiter projectmanagers
   - Wijs sponsors toe
   - Alloceer budget
   - Setup communicatie kanalen

**Outputs:**
- Programma Management Plan
- Benefits Realisatie Plan
- Programma Roadmap (gedetailleerd)
- Resource Plan
- Risico Register

**Fase 3: Programma Uitvoering**

Dit is de langste fase - waar werk gebeurt.

**Belangrijke Activiteiten (Continu):**

1. **Initieer en Overzie Projecten**
   - Lanceer projecten per roadmap
   - Bied toezicht
   - Verwijder obstakels
   - Coördineer afhankelijkheden

2. **Monitor Benefits Realisatie**
   - Volg benefit KPIs
   - Beoordeel voortgang naar targets
   - Identificeer gaten
   - Pas aanpak aan

3. **Manage Programma Governance**
   - Regelmatige stuurcommissie vergaderingen
   - Status rapportage
   - Beslissing escalatie
   - Issue oplossing

4. **Coördineer Over Projecten**
   - Manage onderlinge afhankelijkheden
   - Los resource conflicten op
   - Deel geleerde lessen
   - Verzeker afstemming

5. **Manage Verandering**
   - Evalueer veranderingsverzoeken
   - Beoordeel impact op benefits
   - Keur goed/af
   - Update plannen

6. **Communiceer met Stakeholders**
   - Voortgang updates
   - Succesverhalen
   - Issue transparantie
   - Verwachting management

7. **Pas Programma Aan**
   - Gebaseerd op gerealiseerde benefits
   - Markt veranderingen
   - Strategische verschuivingen
   - Geleerde lessen

**Dit is NIET lineair!** Programma's cyclen door planning, uitvoering en aanpassing continu.

**Visual: Programma Uitvoering Cyclus**

\`\`\`
    Plan Componenten
          ↓
    Voer Projecten Uit
          ↓
    Realiseer Benefits
          ↓
    Meet Resultaten
          ↓
    Pas Aanpak Aan
          ↓
    (cyclus herhaalt)
\`\`\`

**Fase 4: Programma Afsluiting**

Anders dan project afsluiting (snel en schoon), is programma afsluiting gradueel.

**Belangrijke Activiteiten:**

1. **Transitie Benefits**
   - Draag eigenaarschap over aan operaties
   - Embed nieuwe capaciteiten
   - Documenteer processen
   - Train operationele teams

2. **Sluit Component Projecten**
   - Finale opleveringen geaccepteerd
   - Resources vrijgegeven
   - Documentatie gearchiveerd
   - Contracten gesloten

3. **Bevestig Benefits Realisatie**
   - Finale benefit meting
   - Vergelijk met targets
   - Documenteer tekortkomingen of overschrijdingen
   - Plan voor sustained monitoring

4. **Leg Geleerde Lessen Vast**
   - Wat werkte goed?
   - Wat zouden we veranderen?
   - Sleutel succesfactoren
   - Valkuilen te vermijden

5. **Vier Succes**
   - Erken bijdragen
   - Deel succesverhalen
   - Waardeer team inspanningen

6. **Archiveer Programma Assets**
   - Documentatie
   - Beslissingen en rationale
   - Metingen en metrics
   - Kennis artefacten

**Outputs:**
- Programma Afsluiting Rapport
- Geleerde Lessen Document
- Benefits Realisatie Rapport
- Operationele Overdracht Pakket
- Finale Financiële overzichten

**Belangrijke Verschillen van Projecten**

\`\`\`
┌─────────────────┬──────────────┬──────────────┐
│                 │   Project    │  Programma   │
├─────────────────┼──────────────┼──────────────┤
│ Fasen           │ Sequentieel  │ Iteratief    │
│ Veranderingen   │ Minimaliseer │ Verwacht     │
│ Voltooiing      │ Duidelijk    │ Gradueel     │
│ Succes metrics  │ Opleveringen │ Benefits     │
│ Duur            │ Maanden      │ Jaren        │
│ Flexibiliteit   │ Laag         │ Hoog         │
└─────────────────┴──────────────┴──────────────┘
\`\`\`

**Benefits Realisatie Timing**

Belangrijk: Benefits verschijnen vaak niet tot NA project voltooiing!

\`\`\`
Project Tijdlijn:  [════════════]
                               ↓
Benefits Start:              [benefits beginnen]
                               ↓
Volledige Realisatie:       [═══════════]
                             6-12 maanden later!
\`\`\`

Dit is waarom programma's doorgaan na project voltooiing.

**Programma Gezondheidscontroles**

Gedurende uitvoering, beoordeel:
- Zijn projecten on track?
- Worden benefits gerealiseerd?
- Is governance effectief?
- Zijn stakeholders betrokken?
- Moeten we aanpassen?

**Wanneer Te Sluiten**

Sluit een programma wanneer:
✓ Alle benefits gerealiseerd en sustained
✓ Geen meer component projecten nodig
✓ Capaciteiten overgedragen aan operaties
✓ Stakeholders tevreden
✓ Resources elders nodig

Sluit niet te vroeg - benefits hebben verzorging nodig!

**Veelvoorkomende Fouten**

❌ **Behandelen als groot project**: Programma's hebben ander management nodig
❌ **Sluiten na laatste project**: Benefits nog niet gerealiseerd
❌ **Benefit metrics negeren**: Kan waarde niet bewijzen
❌ **Slechte transitie planning**: Benefits verloren in operaties

**Samenvatting**

- Programma levenscyclus heeft 4 fasen: Definitie, Setup, Uitvoering, Afsluiting
- Uitvoering fase is iteratief en adaptief, niet lineair
- Benefits realiseren vaak NA projecten voltooien
- Programma's sluiten gradueel naarmate benefits overgaan naar operaties
- Succes gemeten door bereikte benefits, niet voltooide projecten

Volgende: Benefits Management beheersen!`,
      keyTakeaways: [
        'Program lifecycle has 4 phases: Definition, Setup (Benefits Delivery), Execution, Closure',
        'Execution phase is iterative and adaptive - programs continuously plan, execute, measure, and adapt',
        'Benefits often realize 6-12 months AFTER projects complete - programs continue beyond project delivery',
        'Program closure is gradual as benefits transition to operations, not quick like project closure',
      ],
      keyTakeawaysEN: [
        'Program lifecycle has 4 phases: Definition, Setup (Benefits Delivery), Execution, Closure',
        'Execution phase is iterative and adaptive - programs continuously plan, execute, measure, and adapt',
        'Benefits often realize 6-12 months AFTER projects complete - programs continue beyond project delivery',
        'Program closure is gradual as benefits transition to operations, not quick like project closure',
      ],
      keyTakeawaysNL: [
        'Programma levenscyclus heeft 4 fasen: Definitie, Setup (Benefits Levering), Uitvoering, Afsluiting',
        'Uitvoering fase is iteratief en adaptief - programma\'s plannen, voeren uit, meten en passen continu aan',
        'Benefits realiseren vaak 6-12 maanden NA projecten voltooien - programma\'s gaan door na project levering',
        'Programma afsluiting is gradueel naarmate benefits overgaan naar operaties, niet snel zoals project afsluiting',
      ],
      resources: [
        {
          name: 'Program Lifecycle Phase Gates Checklist',
          nameNL: 'Programma Levenscyclus Fase Gates Checklist',
          type: 'PDF',
          size: '780 KB',
          description: 'Checklist for each phase gate with go/no-go criteria',
          descriptionNL: 'Checklist voor elke fase gate met go/no-go criteria',
        },
        {
          name: 'Program Management Plan Template',
          nameNL: 'Programma Management Plan Template',
          type: 'DOCX',
          size: '1.5 MB',
          description: 'Comprehensive template covering all program management aspects',
          descriptionNL: 'Uitgebreid template dat alle programma management aspecten dekt',
        },
      ],
    },
    // Continue with remaining lessons - showing structure for lessons 3-16
    {
      id: 'pgm-l3',
      title: 'Benefits Management',
      titleNL: 'Benefits Management',
      type: 'video',
      duration: '14:00',
      videoUrl: '',
      icon: 'TrendingUp',
      transcript: `Benefits Management is the heart of program management — the discipline that distinguishes a program from a stack of unrelated projects. The Standard for Program Management (4th Ed.) names it as one of five Performance Domains, and PMI's PgMP exam treats it as the single largest content area for a reason: programs exist to deliver benefits, not to deliver outputs.

### What Is a Benefit?

A benefit is a measurable improvement resulting from an outcome that is perceived as an advantage by one or more stakeholders. Two things to notice:

- It is **measurable** — if you cannot put a number on it, you cannot manage it
- It is **perceived as an advantage** — different stakeholders may value it differently

A new mobile app is an output. "30% increase in mobile transactions" is an outcome. "$8M increase in annual revenue from mobile-first customers" is the benefit.

### The Benefits Realization Lifecycle

PMI describes five phases of benefits management that run alongside your program:

1. **Identification** — what benefits could this program produce?
2. **Analysis and Planning** — quantify, prioritize, plan how to measure
3. **Delivery** — produce the capabilities that make benefits possible
4. **Transition** — hand capabilities to operations so benefits accrue
5. **Sustainment** — keep benefits flowing after program closure

### Step 1 — The Benefits Register

Your program's source of truth. Each benefit gets a row with:

- **ID and name** — e.g. \`BEN-04 Reduced call-center volume\`
- **Owner** — typically a business owner, not a project manager
- **Baseline measurement** — current state value
- **Target value** — what success looks like
- **Realization date** — when the benefit will be measurable
- **Linked components** — projects/sub-programs that enable it
- **Risks and assumptions**
- **KPI** — how it will be measured

Review the register monthly with the program board.

### Step 2 — Build a Benefits Map

A Benefits Map (also called a Benefits Dependency Network) traces the chain:

\`\`\`
Strategic Objective
   ↑
End Benefits          (e.g. Increase NPS by 15 points)
   ↑
Intermediate Benefits (e.g. Reduce service wait time)
   ↑
Business Changes      (e.g. New triage workflow adopted)
   ↑
Enabling Capabilities (e.g. New CRM module live)
   ↑
Project Outputs       (e.g. CRM module built and deployed)
\`\`\`

If you cannot draw this chain, you do not yet have a program — you have a portfolio of unconnected projects.

### Step 3 — Quantify and Set KPIs

For each benefit pick one or two KPIs that will move when the benefit is realized. Good KPIs are:

- **Specific** — clear definition agreed with the business owner
- **Measurable** — there is a data source today
- **Time-bound** — measured at known intervals
- **Attributable** — the program can plausibly cause the change

If a KPI's data source does not yet exist, add a project to the program to build the measurement capability — you cannot manage a benefit you cannot see.

### Step 4 — Plan for Sustainment

A benefit that disappears the moment the program closes was never a real benefit. The Standard for Program Management calls this Benefits Transition. Plan early:

- Who in operations owns the KPI after closure?
- What training or change management keeps users on the new behavior?
- What service-level support keeps the capability alive?

Document this in the **Transition Plan** as part of program closure deliverables.

### Step 5 — Realize and Track

During and after delivery, measure each KPI on its planned cadence and report it in the program status report. Show a benefits realization curve alongside the cost curve — sponsors care about whether the value is showing up.

### Common Pitfalls

- Treating outputs as benefits ("we delivered the app" is not a benefit)
- No baseline, so the team cannot prove improvement
- Benefits owned by program managers instead of business owners
- Stopping measurement at program closure, before benefits actually accrue

### Practice

Pick a current program. Open a blank doc, list five candidate benefits, and for each one write the baseline, target, KPI, owner, and realization date. If you cannot complete a row in five minutes, that benefit needs more analysis before it goes in your register.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'pgm-l4',
      title: 'Governance Structures',
      titleNL: 'Governance Structuren',
      type: 'video',
      duration: '16:00',
      videoUrl: '',
      icon: 'Shield',
      transcript: `Program governance is the framework of authority, decisions, and oversight that keeps a program aligned with strategy and accountable for benefits. The Standard for Program Management 4th Ed. positions Governance as one of the five Performance Domains, and on the PgMP exam it is consistently the topic candidates underestimate. Get this lesson right and the rest of program execution becomes dramatically easier.

### Why Governance Matters

Programs are too big to be managed by a single PM and too long-running to be controlled by project-style steering. Governance gives you:

- **Decision rights** — who approves what, at which threshold
- **Accountability** — who owns benefits, risks, scope
- **Escalation** — clear paths when things break
- **Stage gates** — formal points to fund, continue, pivot, or stop

Without governance, programs drift; they become activity instead of intent.

### The Three-Tier Governance Model

Most enterprise programs use a three-tier structure:

\`\`\`
Tier 1: Portfolio Governance Board
   ↑ strategic alignment, funding decisions
Tier 2: Program Steering Committee (the program board)
   ↑ benefits, risks, scope, stage-gate approvals
Tier 3: Program Management Office / Workstream Leads
   ↑ operational delivery, dependency resolution
\`\`\`

Each tier has its own cadence, its own membership, and its own decision authority.

### Step 1 — Define the Program Steering Committee

The Steering Committee is the most important governance body. Compose it carefully:

- **Sponsor / Chair** — typically an executive accountable for benefits
- **Senior business owner(s)** — represent the consumers of benefits
- **Senior technology / operations representative(s)**
- **Finance representative**
- **Program manager** — runs the meeting, does not vote
- **Optional: independent advisor**

Five to seven members works; more becomes ceremonial. Meet on a fixed cadence (typically monthly) plus on-demand for stage gates.

### Step 2 — Charter the Governance

Document the rules in a **Program Governance Plan**. It must answer:

- What decisions can the Steering Committee make? Which are reserved for the Portfolio Board?
- What thresholds trigger escalation (cost variance %, benefit slip, scope change size)?
- What artifacts are reviewed at each meeting (status, risks, benefits, financials)?
- What is the quorum for decisions? Voting rules?
- How are minutes captured and decisions logged?

This document is signed off by the Portfolio Board and becomes the operating contract.

### Step 3 — Stage Gates

PgMP-aligned programs use formal gates between phases:

- **G0 — Strategic Alignment** — does the program belong in the portfolio?
- **G1 — Definition** — is the business case sound, are benefits real?
- **G2 — Delivery Authorization** — funded to start delivery
- **G3 — Transition Readiness** — benefits owners ready, ops prepared
- **G4 — Closure and Benefits Sustainment** — program closes, benefits continue

At each gate, the Steering Committee reviews evidence and makes one of four calls: **Proceed, Proceed with Conditions, Hold, Stop**. The "Stop" option must be real; if every gate is rubber-stamped, governance is theatre.

### Step 4 — Decision Logs and RACI

Every governance decision should be logged with:

- **Decision ID, date, decision text**
- **Decision owner**
- **Rationale and alternatives considered**
- **Linked risk, scope, or benefit**

Pair this with a program-wide **RACI** for the major activity domains: scope changes, benefits owners, risk acceptance, financial reforecast, communications. Make RACI visible to all components.

### Step 5 — Avoid Governance Anti-Patterns

- **Status theatre** — meetings that review slides instead of making decisions
- **Phantom sponsors** — sponsors who delegate every meeting
- **Decision drift** — operational choices made by the Steering Committee, strategic ones made in stand-ups
- **No teeth** — risks raised but never accepted, mitigated, or transferred
- **Information asymmetry** — the program manager knowing more than the board, leading to surprise overruns

### Best Practices

- Publish a one-page governance map (boards, members, cadence, decision rights) and put it in the program charter
- Pre-circulate decision papers 48 hours before meetings; meetings are for deciding, not reading
- Keep the Steering Committee deck under 10 slides — RAG status, benefits, financials, risks, decisions needed
- Conduct an annual governance review; structures that worked at program start may not fit mid-program

### Practice

Draft a one-page Governance Plan for a current or fictional program: name the boards, list members, define cadence, and list the top three decision types and their thresholds. Anything you cannot fill in is a governance gap.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'pgm-l5',
      title: 'Quiz: Basics',
      titleNL: 'Quiz: Basis',
      type: 'quiz',
      duration: '10:00',
      icon: 'HelpCircle',
      quiz: [
        {
          id: 'pm-q1',
          question: 'According to MSP (Managing Successful Programmes), what is the primary distinction between a programme and a project?',
          questionNL: 'Wat is volgens MSP (Managing Successful Programmes) het belangrijkste onderscheid tussen een programma en een project?',
          options: [
            'A programme always has a larger budget than a project',
            'A programme delivers strategic benefits and organisational change; a project delivers a defined output',
            'A programme is managed by a Portfolio Director, a project by a Programme Manager',
            'A programme runs in parallel workstreams; a project runs sequentially',
          ],
          optionsNL: [
            'Een programma heeft altijd een groter budget dan een project',
            'Een programma levert strategische baten en organisatieverandering; een project levert een vastgesteld resultaat',
            'Een programma wordt geleid door een Portfolio Director, een project door een Programme Manager',
            'Een programma loopt in parallelle workstreams; een project loopt sequentieel',
          ],
          correctAnswer: 1,
          explanation: 'MSP defines a programme as a temporary, flexible organisation created to coordinate, direct and oversee the implementation of a set of related projects and activities in order to deliver outcomes and benefits related to strategic objectives. The key differentiator is outcomes and benefits (change), not just outputs (deliverables).',
          explanationNL: 'MSP definieert een programma als een tijdelijke, flexibele organisatie die is opgericht om een reeks gerelateerde projecten en activiteiten te coördineren, te sturen en te bewaken, met als doel het realiseren van resultaten en baten die verband houden met strategische doelstellingen. De kern is baten (verandering), niet alleen producten (deliverables).',
        },
        {
          id: 'pm-q2',
          question: 'In the MSP Transformational Flow, which activity directly follows "Identifying a Programme"?',
          questionNL: 'In de MSP Transformational Flow, welke activiteit volgt direct op "Identifying a Programme"?',
          options: [
            'Managing Tranches',
            'Delivering Capability',
            'Defining a Programme',
            'Closing a Programme',
          ],
          optionsNL: [
            'Managing Tranches',
            'Delivering Capability',
            'Defining a Programme',
            'Closing a Programme',
          ],
          correctAnswer: 2,
          explanation: 'The MSP Transformational Flow has six sequential activities: Identifying → Defining → Managing Tranches → Delivering Capability → Realising Benefits → Closing a Programme. "Defining a Programme" immediately follows identification, during which the Programme Brief is elaborated into the full Programme Definition Document.',
          explanationNL: 'De MSP Transformational Flow heeft zes sequentiële activiteiten: Identifying → Defining → Managing Tranches → Delivering Capability → Realising Benefits → Closing a Programme. "Defining a Programme" volgt direct op de identificatiefase, waarin het Programme Brief wordt uitgewerkt tot het volledige Programme Definition Document.',
        },
        {
          id: 'pm-q3',
          question: 'What is the purpose of the Blueprint in MSP?',
          questionNL: 'Wat is het doel van de Blueprint in MSP?',
          options: [
            'It lists all individual project schedules within the programme',
            'It describes the desired future state of the organisation that the programme will deliver',
            'It records all risks and issues raised during the programme lifecycle',
            'It defines the financial baseline and budget allocations per project',
          ],
          optionsNL: [
            'Het geeft een overzicht van alle individuele projectplanningen binnen het programma',
            'Het beschrijft de gewenste toekomstige staat van de organisatie die het programma zal opleveren',
            'Het legt alle risico\'s en issues vast die tijdens de programmalevenscyclus zijn opgeworpen',
            'Het definieert de financiële baseline en budgettoewijzingen per project',
          ],
          correctAnswer: 1,
          explanation: 'The Blueprint is an MSP governance document that describes the target operating model — the future state of the organisation after the programme closes. It covers processes, information systems, organisational structures, technology, and capabilities. It is the primary design document that all component projects must deliver towards.',
          explanationNL: 'De Blueprint is een MSP-beheersdocument dat het doelbedrijfsmodel beschrijft — de toekomstige staat van de organisatie nadat het programma is gesloten. Het omvat processen, informatiesystemen, organisatiestructuren, technologie en capaciteiten. Het is het primaire ontwerpdocument waaraan alle componentprojecten moeten bijdragen.',
        },
        {
          id: 'pm-q4',
          question: 'Which role in MSP is accountable for ensuring that the programme delivers its expected benefits?',
          questionNL: 'Welke rol in MSP is verantwoordelijk voor het waarborgen dat het programma de verwachte baten oplevert?',
          options: [
            'Programme Manager',
            'Business Change Manager',
            'Senior Responsible Owner (SRO)',
            'Programme Office Manager',
          ],
          optionsNL: [
            'Programme Manager',
            'Business Change Manager',
            'Senior Responsible Owner (SRO)',
            'Programme Office Manager',
          ],
          correctAnswer: 2,
          explanation: 'The Senior Responsible Owner (SRO) is the single individual accountable to the organisation for the programme achieving its objectives, delivering expected benefits, and carrying the authority to direct the programme. The Business Change Manager facilitates benefits realisation within their area, but ultimate accountability sits with the SRO.',
          explanationNL: 'De Senior Responsible Owner (SRO) is de enige persoon die aan de organisatie verantwoording aflegt voor het halen van de programmadoelstellingen, het realiseren van de verwachte baten en heeft de bevoegdheid om het programma aan te sturen. De Business Change Manager faciliteert de batenrealisatie binnen zijn/haar gebied, maar de uiteindelijke verantwoordelijkheid ligt bij de SRO.',
        },
        {
          id: 'pm-q5',
          question: 'What is a Tranche in MSP terminology?',
          questionNL: 'Wat is een Tranche in MSP-terminologie?',
          options: [
            'A financial instalment released to a component project upon milestone achievement',
            'A grouping of related projects and activities that together deliver a step change in capability',
            'A risk-ranked list of programme-level dependencies',
            'A time-boxed sprint within an agile component project',
          ],
          optionsNL: [
            'Een financiële termijn die wordt vrijgegeven aan een componentproject bij het bereiken van een mijlpaal',
            'Een groepering van gerelateerde projecten en activiteiten die samen een stapsgewijze verbetering in capaciteit leveren',
            'Een risicogerangschikte lijst van afhankelijkheden op programmaniveau',
            'Een time-boxed sprint binnen een agile componentproject',
          ],
          correctAnswer: 1,
          explanation: 'In MSP, a Tranche is a group of projects and activities structured around a distinct step-change in capability that moves the organisation closer to the Blueprint. Each tranche ends with a tranche review / stage gate where governance assesses whether to proceed, redirect, or close the programme. Tranches are the primary rhythm of programme governance.',
          explanationNL: 'In MSP is een Tranche een groep projecten en activiteiten gestructureerd rond een duidelijke stapsgewijze verbetering in capaciteit die de organisatie dichter bij de Blueprint brengt. Elke tranche eindigt met een tranche review / stage gate waar governance beoordeelt of het programma moet worden voortgezet, bijgestuurd of afgesloten. Tranches zijn het primaire ritme van programmabeheer.',
        },
        {
          id: 'pm-q6',
          question: 'Which of the following BEST describes effective programme governance according to MSP?',
          questionNL: 'Welke van de volgende omschrijvingen beschrijft effectief programmabeheer het BESTE volgens MSP?',
          options: [
            'A single Programme Board that makes all decisions and is chaired by the Programme Manager',
            'An ad-hoc decision-making process driven by whichever stakeholder has the most urgent concern',
            'A defined structure of sponsoring group, programme board, and project boards with clear decision rights and accountability',
            'Governance is only relevant during the Identifying phase; execution is self-organising',
          ],
          optionsNL: [
            'Een enkel Programme Board dat alle beslissingen neemt en wordt voorgezeten door de Programme Manager',
            'Een ad-hoc besluitvormingsproces aangestuurd door de meest urgente stakeholder',
            'Een gedefinieerde structuur van sponsoring group, programme board en project boards met duidelijke beslissingsbevoegdheden en verantwoordelijkheden',
            'Governance is alleen relevant tijdens de Identifying-fase; uitvoering is zelforganiserend',
          ],
          correctAnswer: 2,
          explanation: 'MSP requires a layered governance structure: the Sponsoring Group provides strategic direction and investment authority; the Programme Board manages the programme and holds the SRO; individual Project Boards govern component projects. Each level has defined decision rights. This separation of levels prevents strategic decisions being made in the wrong forum.',
          explanationNL: 'MSP vereist een gelaagde governancestructuur: de Sponsoring Group biedt strategische richting en investeringsautoriteit; het Programme Board beheert het programma en houdt de SRO ter verantwoording; individuele Project Boards besturen componentprojecten. Elk niveau heeft vastgestelde beslissingsbevoegdheden. Deze scheiding van niveaus voorkomt dat strategische beslissingen in het verkeerde forum worden genomen.',
        },
      ],
    },
  ],
};

const module2: Module = {
  id: 'pgm-m2',
  title: 'Module 2: Strategic Alignment',
  titleNL: 'Strategische Afstemming',
  description: 'Link programs to organizational strategy and manage stakeholders effectively.',
  descriptionNL: 'Koppel programma\'s aan organisatiestrategie en manage stakeholders effectief.',
  order: 1,
  icon: 'Target',
  color: '#818CF8',
  gradient: 'linear-gradient(135deg, #818CF8 0%, #6366F1 100%)',
  lessons: [
    {
      id: 'pgm-l6',
      title: 'Linking Programs to Strategy',
      titleNL: 'Programma\'s Koppelen aan Strategie',
      type: 'video',
      duration: '14:00',
      videoUrl: '',
      icon: 'Target',
      transcript: `Strategic alignment is the bridge between what the executive team wrote on a slide and what your program teams do every day. The Standard for Program Management 4th Ed. names it the first Performance Domain for a reason: a program that is not anchored to strategy is a program that will be defunded the moment the budget tightens.

### What Does "Aligned" Actually Mean?

A program is strategically aligned when each of these is explicit and traceable:

- **Strategic objective** — the corporate goal the program supports
- **Value proposition** — why this program is the best way to support that objective
- **Benefits** — the measurable outcomes that will demonstrate the contribution
- **KPIs** — the corporate metrics that will move

If you cannot draw a straight line from a corporate scorecard metric to a benefit in your benefits register, your program is not aligned — it is opportunistic.

### Step 1 — Read the Strategy

Before you write a single charter, gather:

- The corporate strategic plan (typically 3–5 year horizon)
- The annual operating plan
- The scorecard or OKR set
- Recent investor communications or board minutes (where accessible)

Identify three to five strategic themes the executive team is currently betting on. Your program must connect to one of them — preferably more than one.

### Step 2 — Build the Strategic Alignment Document

This is a short artifact (2–4 pages) that lives at the front of the program charter and is reviewed at every stage gate. It contains:

- **Strategic objective(s)** the program supports — verbatim from corporate documents
- **Program value proposition** — why this program over alternatives
- **End benefits** linked to corporate KPIs
- **Strategic risks** if the program is not executed
- **Alignment dependencies** — other programs or initiatives that affect alignment

Sponsors sign this document. It becomes the test for every scope change: does the change still support the strategy?

### Step 3 — The Alignment Map

Visualize the chain so it survives PowerPoint:

\`\`\`
Corporate Strategy
   ↓
Strategic Theme: "Become Digital-First"
   ↓
Program: Digital Customer Experience
   ↓
Sub-Programs / Projects
   ↓
Outputs and Capabilities
   ↓
Benefits → KPIs → Scorecard Movement
\`\`\`

Display this on a single slide at every Steering Committee meeting. When discussion drifts, the picture pulls it back.

### Step 4 — Maintain Alignment Through Change

Strategy moves. Your program's alignment must be reviewed at minimum:

- At each stage gate
- Annually as part of the strategy refresh cycle
- Whenever a major external event (M&A, regulatory change, executive transition) occurs

When strategy shifts and the program no longer fits, the right answer is sometimes to **stop or re-scope**. Programs that survive misalignment by inertia drain resources from the new strategy.

### Step 5 — Communicate Alignment Constantly

In every program communication — status reports, town halls, demos — open with the strategic objective. The team needs to hear it not once but weekly. The reason is psychological: people work harder on what they understand to matter, and they understand it matters when leaders keep saying so.

### Aligning With OKRs

Many organizations now use OKRs alongside or instead of traditional strategic plans. To align a program with OKRs:

- Identify the corporate Objective(s) you support
- Map your benefits to specific Key Results
- Report progress against KRs in the program status

OKR alignment makes program contribution visible in the language executives already use quarterly.

### Common Pitfalls

- Borrowing strategy slides from last year and not noticing the strategy has updated
- Citing strategy without naming a specific objective — vague alignment is no alignment
- Never reviewing alignment between gates, then being surprised when funding is cut
- Treating alignment as a one-time exercise instead of an ongoing discipline

### Practice

Take your current program and complete one sentence: "This program supports the strategic objective of \\_\\_\\_\\_ by delivering benefits \\_\\_\\_\\_ which will move corporate KPI \\_\\_\\_\\_ from \\_\\_\\_\\_ to \\_\\_\\_\\_ by \\_\\_\\_\\_." If you cannot complete that sentence in one minute with citation to a strategy document, your alignment work starts now.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'pgm-l7',
      title: 'Stakeholder Engagement',
      titleNL: 'Stakeholder Betrokkenheid',
      type: 'video',
      duration: '12:00',
      videoUrl: '',
      icon: 'Users',
      transcript: `Stakeholder engagement at program scale is fundamentally different from project stakeholder management. You are dealing with executives, regulators, partners, customers, business unit heads, and operational staff — often hundreds of stakeholders across multiple geographies. PMI dedicates an entire Performance Domain to it because programs that lose stakeholder support die regardless of how well the projects are run.

### Project vs Program Stakeholder Engagement

| Dimension | Project | Program |
|---|---|---|
| Number | tens | hundreds |
| Influence variance | low | very high |
| Interests | usually aligned | often conflicting |
| Time horizon | weeks-months | years |
| Communication channels | one or two | many, segmented |

This means standard project stakeholder approaches do not scale; you need a program-grade approach.

### Step 1 — Build the Stakeholder Register

Far more comprehensive than a project register. For each stakeholder or stakeholder group, capture:

- **Name / role / organization**
- **Type** — sponsor, beneficiary, supplier, regulator, end-user, opponent
- **Interest in the program** — what they want, what they fear
- **Influence and power** — high/medium/low on each
- **Current attitude** — supportive, neutral, resistant, opposed
- **Desired attitude** — where you need them to be
- **Engagement strategy and owner** — who manages the relationship

For very large programs, segment into stakeholder communities (e.g. Branch Operations Staff) where individual mapping is impractical.

### Step 2 — Map Stakeholders Visually

The classic Power/Interest grid is still useful at program scale:

\`\`\`
              Low Interest          High Interest
High Power    Keep Satisfied        Manage Closely
Low Power     Monitor               Keep Informed
\`\`\`

For programs, add a third axis: **time-criticality of engagement**. Some stakeholders matter most at specific gate points (e.g. regulators at compliance gates).

### Step 3 — Build the Engagement Plan

For each segment, define:

- **Channel** — town hall, executive briefing, newsletter, demo day, 1:1
- **Cadence** — weekly, monthly, quarterly, on-demand
- **Content** — what you communicate, in what depth
- **Owner** — single accountable person for that relationship
- **Feedback loop** — how you collect and respond

A common structure: weekly to delivery teams, monthly to sponsors and steering, quarterly to broader business stakeholders, ad-hoc to regulators and external partners.

### Step 4 — Manage Resistance Honestly

Some stakeholders will oppose your program — sometimes for good reasons. Treat resistance as data, not as enemy fire:

- **Listen first** — what is the real concern? Job loss, perceived risk, past failure?
- **Validate** — is the concern legitimate, partly legitimate, or based on bad information?
- **Address or document** — fix what you can, formally accept what you cannot
- **Re-engage** — opposed today does not mean opposed forever

Document resistance in the stakeholder register; surfacing it is healthier than burying it.

### Step 5 — Sustain Engagement Over Years

Programs run long. Stakeholder fatigue is real. Counter it with:

- **Visible quick wins** — early benefits demonstrate progress
- **Storytelling** — share user stories, not just project status
- **Rotation** — bring fresh stakeholders into governance roles to renew engagement
- **Recognition** — credit business stakeholders publicly when their input shaped outcomes

### Common Pitfalls

- Treating the sponsor as the only real stakeholder — at program scale you cannot
- Communicating the same content to every audience — sponsors don't want sprint updates
- Engaging external regulators only when you need approval, not before
- Letting opposition fester by avoiding rather than confronting
- Failing to refresh the stakeholder register; people change roles, leave, get promoted

### Best Practices

- Review the stakeholder register at every Steering Committee
- Run a stakeholder health check quarterly: pulse survey or 1:1 sampling
- Pair every senior stakeholder with a named relationship owner
- Log every significant stakeholder interaction; over years, this becomes invaluable history

### Practice

Build a stakeholder map for a real program with at least 20 stakeholders. For each, note their current and desired attitude, plus the single most important next conversation you need with them. That conversation list is your near-term engagement plan.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'pgm-l8',
      title: 'Program Roadmap',
      titleNL: 'Programma Roadmap',
      type: 'video',
      duration: '16:00',
      videoUrl: '',
      icon: 'Map',
      transcript: `The Program Roadmap is the single most important visual artifact in a program manager's toolkit. It is not a Gantt chart of every task — it is a multi-year, multi-component view that shows when capabilities arrive, when benefits land, and when key dependencies must resolve. Sponsors and Steering Committees live by it.

### What the Roadmap Is and Is Not

The roadmap **is**:
- A time-phased view of program components and milestones
- Anchored to strategic objectives and benefit realization dates
- Updated at every stage gate and major change
- Communicated to all stakeholders

The roadmap **is not**:
- A detailed schedule (that's at the project level)
- A static document (it evolves with the program)
- A commitment to specific dates beyond reasonable horizons

The Standard for Program Management 4th Ed. positions the roadmap inside the Program Definition phase but treats it as a living artifact for the program's life.

### Step 1 — Set the Time Horizons

A roadmap usually has three zones:

- **Now (next 0–6 months)** — committed, dated, reviewed in detail
- **Next (6–18 months)** — planned, dated, subject to refinement
- **Later (18+ months)** — directional, broad bands, subject to change

Resist the urge to show specific dates two years out. Show ranges, themes, or "by end of FY26" instead.

### Step 2 — Identify the Roadmap's Layers

A useful program roadmap has four to six horizontal swim lanes. Common layers:

- **Strategic milestones / external dates** — regulatory deadlines, market windows
- **Component projects / sub-programs** — bars showing duration and key gates
- **Capabilities** — when new business capabilities go live
- **Benefits realization** — when benefits start accruing and reach target
- **Dependencies** — diamonds marking inter-component dependencies
- **Decision gates** — vertical bars at G0/G1/G2/G3/G4

Pick the layers that match your audience.

### Step 3 — Draft the First Version

Open with strategic milestones — the dates that cannot move (a regulation effective date, a market launch window, a CEO commitment). Build the rest of the roadmap backward from these anchors.

Place component projects so their outputs deliver capabilities in time to enable benefits before the strategic dates. If the math doesn't work, you've identified the program's first major risk.

### Step 4 — Visualize Cleanly

A roadmap is read by busy executives in 30 seconds. Use:

- **Color** — consistent meaning (red = at risk, green = on track, blue = future)
- **Shape** — bars for ongoing work, diamonds for milestones, vertical lines for fixed dates
- **Whitespace** — never more than 7–8 swim lanes; never more than 30 elements per page
- **Annotation** — short labels, no jargon, clear status

Tools: PowerPoint with discipline; Office Timeline or Roadmunk for richer features; Miro/Mural for collaborative drafting; Smartsheet for live data binding.

### Step 5 — Govern the Roadmap

Treat the roadmap as a controlled document:

- **Owner**: program manager
- **Approver**: Steering Committee
- **Review cadence**: monthly tactical updates, quarterly strategic refresh
- **Change control**: significant date or scope changes go to Steering for approval, with rationale logged

Version the roadmap. When dates move, keep the prior version archived; trend over time tells the story of execution discipline.

### Step 6 — Use the Roadmap as a Communication Asset

Beyond Steering Committees, the roadmap is your most reusable artifact for:

- Onboarding new team members and sponsors
- Vendor and partner alignment conversations
- Town halls and broad communications
- Investor or board updates (with redactions as needed)

A good roadmap survives a year of program turbulence and is recognizable to everyone who matters.

### Common Pitfalls

- Putting too much detail — roadmaps with 200 elements are unreadable
- Using a Gantt-chart export from MS Project — too tactical, too noisy
- Failing to update — a stale roadmap is worse than no roadmap
- Hiding bad news — sponsors notice when at-risk items keep showing as green
- Skipping the dependencies layer — most program failures originate in cross-component dependencies

### Best Practices

- One page if possible, two pages maximum
- Always include a "last updated" date and version
- Annotate the next three Steering decisions on the roadmap itself
- Pair with a one-paragraph narrative for asynchronous viewers

### Practice

Sketch a roadmap for your current program in three layers: strategic milestones, component projects, benefits realization. Use only one page. If you cannot fit it on one page, your program is either undefined or undisciplined — both fixable, neither acceptable.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'pgm-l9',
      title: 'Financial Management',
      titleNL: 'Financieel Management',
      type: 'video',
      duration: '14:00',
      videoUrl: '',
      icon: 'Calculator',
      transcript: `Financial management at the program level is not just summing project budgets. It is about funding strategies, multi-year cash flow, business case maintenance, and the financial conversations with the CFO that quietly determine whether your program survives the next budget cycle.

### Program Finance vs Project Finance

A project budget is typically:
- One funding source
- One cost center
- A single fiscal year (mostly)
- Output-focused

A program's financial picture is:
- Multiple funding sources (capital, operating, partner)
- Multiple cost centers
- Multi-year, often spanning fiscal year boundaries
- Outcome-focused, with benefits flowing back into the financial case

The Standard for Program Management 4th Ed. makes financial management a core supporting discipline; PgMP exam questions often test the link between financial decisions and benefits.

### Step 1 — Establish the Program Financial Framework

Document four things at program kickoff:

- **Funding strategy** — capital vs operating expense, who pays, when
- **Cost structure** — direct, indirect, contingency, management reserve
- **Cost centers and chart-of-accounts mapping**
- **Reporting cadence and audit requirements**

This becomes the **Program Financial Management Plan**. It is signed off by the Sponsor and the Finance representative.

### Step 2 — Build the Multi-Year Financial Model

A program financial model has four time-phased sections:

\`\`\`
Inflows / Funding
   - Approved capital
   - Approved operating
   - Partner contributions

Outflows / Costs
   - Component project costs
   - Program management overhead
   - Contingency drawdown

Benefits / Returns
   - Cost savings (operational reduction)
   - Revenue increase
   - Avoided cost (risk-weighted)

Net position over time
   - NPV, IRR, payback period
\`\`\`

Build this in a controlled spreadsheet or finance system. Keep at least monthly granularity.

### Step 3 — Manage Contingency and Reserves

A mature program separates two pots:

- **Contingency reserve** — for known unknowns; controlled by program manager
- **Management reserve** — for unknown unknowns; controlled by Sponsor or Steering

Set a clear policy: how much, who can authorize draw-down, what triggers replenishment requests. Track contingency burn rate; if you've used 80% of contingency at 40% of program duration, that is a major risk indicator.

### Step 4 — Maintain the Business Case

The business case approved at program start is a hypothesis. Maintain it:

- Re-baseline quarterly with actuals
- Refresh benefit estimates as evidence accumulates
- Recalculate NPV, IRR, payback if cost or benefit assumptions shift
- Flag the Steering Committee if the case becomes negative

A program whose business case has gone negative is one that should be honestly reconsidered, not silently continued.

### Step 5 — Monitor and Forecast

Use earned-value style measures even at program scale:

- **CV (Cost Variance)** = EV − AC; negative = over budget
- **CPI (Cost Performance Index)** = EV / AC; under 1.0 = inefficient spend
- **EAC (Estimate at Completion)** = BAC / CPI for stable trends
- **Variance at Completion (VAC)** = BAC − EAC

Plot these monthly. Trend matters more than any single data point.

### Step 6 — Communicate Financials Clearly

To Steering and Sponsors, lead with:

1. **Approved budget vs forecast at completion** — single number variance
2. **Year-to-date actuals vs plan** — current fiscal year performance
3. **Contingency burn rate** — early-warning indicator
4. **Benefits realization vs projection** — value-side health

To the CFO, provide a one-page monthly financial summary in their format, not yours.

### Common Pitfalls

- Confusing committed vs accrued vs paid spend — pick one, label it clearly
- Ignoring fiscal year boundaries — programs that overrun a fiscal year often face refunding fights
- Treating contingency as ordinary budget — burn it without governance and you'll be empty when you need it
- Letting the business case go stale; sponsors lose trust when reality and case diverge silently

### Best Practices

- Pair the program manager with a dedicated finance partner — not occasional, embedded
- Reconcile actuals to the financial system monthly; never trust spreadsheet-only views for board reporting
- Keep audit trail for every funding decision, scope-driven cost change, contingency draw
- Triangulate: ask the CFO's finance team to audit your model annually

### Practice

Pull your current program's approved budget and most recent actuals. Calculate CV, CPI, and EAC. If you cannot do that calculation in 10 minutes from existing data, your financial reporting needs strengthening before the next gate.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'pgm-l10',
      title: 'Risk Management at Scale',
      titleNL: 'Risicomanagement op Schaal',
      type: 'video',
      duration: '12:00',
      videoUrl: '',
      icon: 'AlertTriangle',
      transcript: `Risk management at program scale is qualitatively different from project risk management. You face emergent risks (caused by component interactions), cascading risks (one risk triggers others across components), and strategic risks (the program as a whole stops being valuable). The Standard for Program Management 4th Ed. devotes substantial attention to this for a reason — most large program failures are risk failures, not delivery failures.

### Program Risk Categories

Beyond the project-level risks (technical, schedule, resource), programs add:

- **Strategic** — strategy shifts, sponsor change, market disruption
- **Benefit** — benefits will not materialize at projected scale
- **Inter-component** — projects depend on each other in fragile ways
- **Stakeholder** — key stakeholder withdraws or opposes
- **Regulatory** — compliance landscape changes mid-program
- **Organizational** — restructure, M&A, leadership change
- **External** — economic, geopolitical, supply-chain

Your risk register should be structured around these categories, not just listed flat.

### Step 1 — Build the Program Risk Register

For each risk capture:

- **ID** and short name
- **Category**
- **Description** — cause, event, effect
- **Probability** (1–5) and **Impact** (1–5) on benefits, schedule, cost, reputation
- **Risk score** = P × I, color-coded
- **Owner** — single accountable person
- **Response strategy** — Avoid, Transfer, Mitigate, Accept (negative); Exploit, Share, Enhance, Accept (positive)
- **Mitigation actions** with owners and dates
- **Trigger conditions** — what tells you the risk is becoming an issue
- **Status** — Open, Active, Closed, Realized

Review weekly with workstream leads and monthly at Steering.

### Step 2 — Aggregate Risks Across Components

A risk that is "low" in one project may stack with similar risks across other components. Run quarterly:

- **Risk roll-up** — group similar risks across the program
- **Correlation analysis** — which risks share a root cause?
- **Pattern detection** — recurring risks suggest systemic weakness

A program with the same vendor risk in five components has a vendor problem, not five vendor risks.

### Step 3 — Use Quantitative Methods on Top Risks

For the highest-impact risks, go beyond P × I:

- **Monte Carlo simulation** on schedule risk to forecast realistic finish date ranges
- **Decision tree analysis** for go/no-go decisions with uncertain outcomes
- **EMV (Expected Monetary Value)** for risk response trade-offs
- **Sensitivity analysis** to identify which risks most threaten benefits

These techniques are PMI-aligned and worth their effort for the top 10% of risks.

### Step 4 — Manage the Risk Pipeline

Risks evolve. Have explicit transitions:

\`\`\`
Identified → Assessed → Owned → Mitigated → Monitored → Closed
                                       ↓
                                    Realized → Issue (move to issue log)
\`\`\`

A realized risk is no longer a risk; it is an issue. Move it to your issue log and continue managing.

### Step 5 — Risk Governance

The Steering Committee should review:

- Top 5–10 risks each meeting (not all 200)
- New risks added since last meeting
- Risks whose status has changed
- Risks requiring decisions (acceptance, escalation, funding)

Document risk acceptance formally. "We accept this risk" is a real decision; have the accepting party sign off in the meeting minutes.

### Step 6 — Manage Positive Risks (Opportunities)

Half of risk management is opportunities, not threats. Track opportunities with the same rigor:

- A favorable currency move that could reduce supplier costs
- A regulatory change that could expand benefit reach
- A partnership opening that could accelerate delivery

Plan how to **Exploit, Share, or Enhance** opportunities; do not let them pass for lack of a process.

### Common Pitfalls

- Confusing risks with issues — risks are uncertain, issues are happening
- Risk theatre — long registers nobody reads, color-coding without action
- Ownership drift — risks owned by "the team" rather than a named person
- Failing to update — a stale risk register tells you about yesterday's risks
- No appetite statement — without one, you cannot decide which risks are acceptable

### Best Practices

- Publish a Risk Appetite Statement signed by the Sponsor — defines acceptable cost, schedule, and reputational risk
- Run a quarterly risk workshop with workstream leads and key stakeholders
- Reserve 5–15% management reserve for high-impact, low-probability risks
- Track risk-realization rate — proves whether your assessments are calibrated

### Practice

Open your program's risk register. Are the top three risks truly the highest-impact, or are they the loudest? Re-rank using P × I against benefits, schedule, and cost. If the order changes, your governance just got better.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
  ],
};

const module3: Module = {
  id: 'pgm-m3',
  title: 'Module 3: Execution & Benefits',
  titleNL: 'Uitvoering & Benefits',
  description: 'Execute programs effectively and ensure benefits are realized.',
  descriptionNL: 'Voer programma\'s effectief uit en verzeker dat benefits worden gerealiseerd.',
  order: 2,
  icon: 'TrendingUp',
  color: '#A78BFA',
  gradient: 'linear-gradient(135deg, #A78BFA 0%, #818CF8 100%)',
  lessons: [
    {
      id: 'pgm-l11',
      title: 'Managing Program Components',
      titleNL: 'Programmacomponenten Managen',
      type: 'video',
      duration: '15:00',
      videoUrl: '',
      icon: 'GitBranch',
      transcript: `A program is the sum of its components — projects, sub-programs, and operational activities — coordinated to deliver benefits. Managing those components is the bulk of day-to-day program work, and it is fundamentally about orchestration, not direct delivery. PMI's Standard treats Component Management as the heart of program execution.

### What Counts as a Component?

In PMI terms, a program component is one of:

- **Project** — a discrete delivery effort with PM and team
- **Sub-program** — a smaller program nested under the larger
- **Operational activity** — recurring work that supports benefits (e.g. running a service)
- **Other related work** — change management, communications, training streams

Each component has its own scope, schedule, and budget — but reports up into the program for coordination, dependency resolution, and benefit alignment.

### Step 1 — Component Onboarding

When a new component is added to your program:

- Confirm the component's contribution to program benefits
- Establish reporting cadence and format
- Document interfaces — what does this component need from others, what does it provide?
- Assign a relationship owner from the program team
- Add to the component register

The component register lists every component with status, owner, key dates, and benefit linkage.

### Step 2 — The Component Register

A simple but powerful artifact:

\`\`\`
ID | Component | Type | PM | Status | Start | Finish | %Complete | Linked Benefits | Top Risk
\`\`\`

Refreshed weekly. This is what you bring to Steering as the "components view".

### Step 3 — Dependencies and Interfaces

Most program failures originate at the seams between components. Manage them deliberately:

- Maintain a **program dependency log** with predecessor/successor component, what is exchanged, target date, owner on each side, status
- Run a **dependency review** every two weeks with all component PMs
- Visualize on the roadmap as diamond markers
- Escalate broken or at-risk dependencies to Steering

The single most underused tool in program management is the dependency log. Build it, review it, refuse to let it go stale.

### Step 4 — Component Status Reporting

Standardize the status report across components. A useful template:

- **RAG** for scope, schedule, cost, quality, risks
- **Top three accomplishments since last report**
- **Top three planned for next period**
- **Issues needing program-level help**
- **Changes since last report**

Reject component reports that don't follow the standard. Consistency is what makes aggregation possible.

### Step 5 — Aggregation and Roll-up

Your program-level view is the roll-up of components. The aggregation logic:

- **Schedule** — program is at risk if any critical-path component is at risk
- **Cost** — sum of component spend, plus program overhead
- **Benefits** — track each benefit at the source component
- **Quality** — propagate the worst component status as a flag, not a hide

Don't let component-level green-washing turn into program-level false comfort.

### Step 6 — Resource and Knowledge Sharing

Programs unlock value when components share:

- **People** — rotating engineers between components builds skill and resilience
- **Tools and platforms** — common CI/CD, common test environments
- **Lessons learned** — propagate fixes and patterns immediately
- **Vendors** — consolidate vendor management for leverage

Build a program-level knowledge base, accessible to all components.

### Step 7 — Closing Components

Components close before the program does. When a component finishes:

- Confirm deliverables are accepted
- Verify benefit-contribution capability is in place
- Capture lessons learned
- Reassign or release resources back to the resource pool
- Update the component register

A program with three closed components and proper handover discipline is healthier than one with three "still wrapping up" components consuming budget.

### Common Pitfalls

- Letting components diverge in process — every component reports differently, none aggregate cleanly
- Ignoring soft dependencies — knowledge transfer, change readiness — until they fail
- Component PMs operating in isolation — host monthly forums to share
- Closing components before benefits-enabling capabilities are operational

### Best Practices

- Run a weekly component PM forum — 30 minutes, status, dependencies, asks
- Maintain a single source of truth for component dates (one tool, not five)
- Treat component PMs as your peers, not your reports — they have local authority
- Document the component lifecycle in your governance plan

### Practice

List every component in your current program. For each, write the single most important dependency it has on another component. If you cannot, you have not yet mapped your seams — and that is where your program will break first.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'pgm-l12',
      title: 'Benefits Realization',
      titleNL: 'Benefits Realisatie',
      type: 'video',
      duration: '14:00',
      videoUrl: '',
      icon: 'CheckCircle',
      transcript: `Benefits Realization is the proof phase of program management. Identification gave you candidates, planning gave you a register, delivery gave you capabilities — realization is where you actually demonstrate that benefits are flowing. PMI's PgMP standard makes Realization a distinct phase because organizations have a strong tendency to declare victory at delivery and never measure what came after.

### What Realization Really Means

A benefit is realized when:

- The capability that enables it is operational
- The business change required to use the capability has occurred
- The KPI shows movement attributable to the program
- Stakeholders perceive and value the change

Note all four. A new system that nobody uses produces zero benefit. A change that happens but cannot be measured cannot be reported.

### Step 1 — Verify Realization Conditions

Before declaring a benefit realized, run a checklist:

- Is the capability live in production?
- Is adoption tracked? At what level?
- Is the change-management work completed (training, comms, support)?
- Is the KPI baseline confirmed and the measurement cadence established?
- Are leading indicators trending in the expected direction?

Anything failing this checklist is not yet a realized benefit, even if the project that produced the capability is closed.

### Step 2 — Measure Each Benefit on Its Cadence

Different benefits have different measurement rhythms:

- Operational efficiency benefits — monthly
- Customer-experience benefits — quarterly or based on survey cycle
- Revenue benefits — quarterly with finance close
- Strategic benefits (market share, NPS) — semi-annual

Plot each benefit on its own time series. Annotate when capabilities went live to make causation visible.

### Step 3 — Run Benefit Reviews

Schedule quarterly **Benefit Realization Reviews** with the business owners. Agenda:

- Current measurement vs target
- Trend since last review
- Adoption metrics
- Business owner narrative — what is and isn't working
- Course corrections needed

These reviews are owned by the business owners; the program manager facilitates and documents. Outputs feed the Steering Committee.

### Step 4 — Address Underperforming Benefits

When a benefit lags, diagnose carefully:

- **Capability issue** — the system or process doesn't work as designed; technical fix needed
- **Adoption issue** — capability works, users aren't using it; change management required
- **Measurement issue** — KPI data is wrong or noisy; instrumentation fix
- **Assumption issue** — the original benefit model was wrong; rebaseline honestly
- **External factor** — market shift, competitor move; reassess in context

Different diagnoses lead to different responses. Don't apply training to a measurement problem.

### Step 5 — Adjust Forecasts

As real data accumulates, update the benefits forecast:

- Trim benefits that won't materialize at the projected scale
- Recognize benefits exceeding expectations and protect them
- Update the program business case with the refreshed forecast
- Communicate transparently — sponsors prefer hard numbers to optimism

### Step 6 — Communicate Realization Stories

Numbers convince finance; stories convince everyone else. For each major realized benefit, capture:

- The before/after numbers
- A specific user or customer story
- The business owner's quote
- The team that made it happen

Use these in town halls, sponsor updates, and the program closure report. They make benefits real to people who weren't in the spreadsheets.

### Step 7 — Hand Over to Operations

A benefit must outlive the program. Transition each benefit to a long-term owner:

- Document the measurement methodology
- Hand off the data sources, dashboards, and review cadence
- Confirm operational ownership of the underlying capability
- Set a follow-up date — typically 6–12 months post-closure — to verify benefits are still flowing

### Common Pitfalls

- Closing the program before benefits start showing
- Relying on capability go-live as a proxy for benefit realization
- No baseline, so improvement is unverifiable
- Allowing the business case to drift without documented adjustments
- Skipping the post-closure check; benefits often regress when nobody is watching

### Best Practices

- Pair every benefit with a single business owner; the program manager is never the long-term owner
- Show benefit-realization curves alongside cost curves in every Steering update
- Celebrate small benefits early — momentum compounds
- Audit realization 12 months post-closure as part of organizational learning

### Practice

For each benefit in your current program, write one sentence confirming or denying that the four realization conditions are met. The benefits where you cannot confidently confirm are your immediate priorities.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'pgm-l13',
      title: 'Transition and Sustainment',
      titleNL: 'Transitie en Borging',
      type: 'video',
      duration: '12:00',
      videoUrl: '',
      icon: 'ArrowRightLeft',
      transcript: `Transition and Sustainment is where programs either secure their value or quietly waste it. PMI's Standard for Program Management 4th Ed. treats this as a distinct phase precisely because so many programs declare success at delivery, only to see benefits erode within months. Done right, transition is a discipline that keeps benefits flowing for years.

### Why Transition Is Hard

The team that built a capability is excited to move on. The operations team that inherits it usually had no time to prepare. Users default to old habits. Documentation lags reality. Without deliberate transition design, the program's investment leaks back out.

### Step 1 — Plan Transition Early

Transition planning starts during program definition, not at the end. The **Transition Plan** lives alongside the program plan and answers:

- What capabilities transition, to whom, when?
- What service-level agreements apply post-transition?
- What knowledge, documentation, and training is required?
- What support model takes over (Tier 1/2/3, on-call, vendor)?
- What is the contingency if transition fails?

Each capability has a named **receiving owner** before transition begins.

### Step 2 — Map the Transition Components

For each capability transitioning, document:

- **Technical handover** — code, infrastructure, data, monitoring, runbooks
- **Process handover** — workflow ownership, exception handling, escalation
- **People handover** — roles, responsibilities, decision rights
- **Knowledge handover** — explicit (docs) and tacit (shadowing, paired operations)
- **Performance handover** — KPIs, dashboards, review cadence

Underestimate the tacit knowledge transfer at your peril; runbooks rarely capture the "why" of decisions.

### Step 3 — Operational Readiness Review

Before transition completes, conduct a formal **Operational Readiness Review (ORR)**. Receiving teams confirm:

- They can run the service or process under normal load
- They can handle the most likely incidents
- Their tooling, alerting, and escalation paths are operational
- Their staffing matches the support model
- Their training is complete

The ORR has pass/fail criteria. Do not transition a capability that fails ORR — fix the gaps first.

### Step 4 — Phased vs Big-Bang Transition

For complex capabilities, prefer phased transition:

- Pilot transition with a subset of users or services
- Run parallel operations (both program team and ops team active)
- Gradually shift accountability over weeks
- Conduct a final cutover when confidence is established

Big-bang transitions sometimes cannot be avoided (regulatory deadlines, contractual cutovers) but increase risk substantially.

### Step 5 — Sustain Benefits

Sustainment is the discipline of keeping benefits flowing post-transition. Mechanisms:

- **Service ownership** — a named team accountable for the underlying capability
- **Benefit ownership** — a named business owner accountable for KPI movement
- **Continuous improvement loop** — capacity for the operational team to enhance the capability
- **Performance reviews** — regular operational reviews against SLAs and benefit KPIs
- **Funding model** — operating budget that sustains the capability without program scaffolding

### Step 6 — Post-Transition Health Checks

Don't disappear after transition. Schedule:

- **30-day check** — operational stability, KPI early signals
- **90-day check** — benefits trend, support volume, lessons learned
- **6-month check** — sustained benefits, sponsor confidence, opportunities

These checks are short and focused but they keep accountability intact during the most fragile period.

### Step 7 — Communicate the Transition

Transition is also a communication event. Stakeholders need to know:

- What changed in ownership
- Who to contact for what
- New SLAs and expectations
- What stays the same

A clear transition communication prevents weeks of confusion and shadow-PM-ing.

### Common Pitfalls

- Treating transition as an afterthought; planning starts in the last sprint
- Receiving teams under-staffed for new capability load
- Missing tacit knowledge transfer; new team operates blind
- No formal ORR — capabilities transition when calendar runs out, regardless of readiness
- Sponsor disengagement post-transition; benefits regress and nobody notices

### Best Practices

- Co-locate program team and ops team during the final 4–8 weeks of the program
- Run "game day" simulations of incidents so ops team builds confidence
- Document explicitly what is **not** transitioning and where it lives
- Capture transition lessons learned for future programs

### Practice

For your current program, list every capability that will transition. For each, write the name of the receiving owner and confirm they have signed off on the readiness criteria. If even one row is incomplete, your transition plan is incomplete.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'pgm-l14',
      title: 'Program Closure',
      titleNL: 'Programma Afsluiting',
      type: 'video',
      duration: '10:00',
      videoUrl: '',
      icon: 'FolderCheck',
      transcript: `Program Closure is the final formal phase, and the one most often shortcut. The Standard for Program Management 4th Ed. treats it as a distinct discipline because closing well determines whether the organization actually learns from the program and whether benefits continue to flow.

### When to Close

A program closes when one of three conditions is met:

- **Successful completion** — all components delivered, capabilities transitioned, benefits flowing
- **Strategic obsolescence** — strategy or market change makes the program no longer relevant
- **Failure to demonstrate viability** — business case has gone permanently negative

Closure is a deliberate decision by the Steering Committee, not a calendar event. Programs that drift to closure rarely capture full value.

### The Closure Phase Outputs

A complete program closure produces:

- **Final benefits report** — what was promised, what was delivered, what is still pending
- **Final financial reconciliation** — actual spend vs budget, capitalization accounting, residual liabilities
- **Lessons learned report** — captured systematically across the program
- **Asset transfer log** — equipment, licenses, contracts, IP routed to permanent owners
- **Final stakeholder communication** — broad distribution acknowledging contributions and outcomes
- **Closure approval** — Steering Committee sign-off

### Step 1 — Verify Closure Readiness

Confirm before initiating closure:

- All components are closed or formally transitioned
- All deliverables have been formally accepted
- All capabilities are operational and transitioned to ops
- Initial benefits realization is confirmed and trending
- All open contracts are closed or transferred
- All risks are closed or transferred to operations
- Financial actuals are reconciled

Anything outstanding either gets closed first or gets explicitly assigned to a permanent owner with sign-off.

### Step 2 — Conduct the Final Steering Committee Meeting

The closure Steering meeting is structured:

1. Final benefits status and forecast
2. Final financial position
3. Outstanding items and their owners
4. Lessons learned summary
5. Recognition of contributions
6. Formal closure decision and sign-off

This meeting produces signed minutes that become the program closure record.

### Step 3 — Conduct Lessons Learned

A program-grade lessons learned exercise goes beyond a project retrospective:

- Run sessions with each component PM
- Run sessions with sponsors and key stakeholders
- Run a session with the program team
- Categorize learnings: governance, financial, technical, change management, stakeholder, vendor
- Identify which learnings should change organizational standards (PMO process changes, template updates)

Publish a lessons learned report and present it to the PMO and to leaders of upcoming programs. The point is organizational learning, not program-team catharsis.

### Step 4 — Recognize and Release the Team

Programs build relationships and skills. At closure:

- Publicly recognize team contributions — emails, town halls, awards
- Document individual experience and growth, useful for performance reviews
- Coordinate with HR / resourcing for redeployment
- Capture testimonials and quotes for future hiring and program-team formation
- Conduct exit interviews with key team members for additional learnings

A team that closes a program well becomes the seed of the next program; one that disbands bitterly does not.

### Step 5 — Archive the Program

Archive everything that may be needed later:

- Charter, plans, governance documents
- Decision logs, risk registers, change registers
- Contracts and procurement records
- Financial records
- Final reports
- Lessons learned

Use the organizational system of record (PMO repository, document management system). Tag for retrieval. Set retention policies.

### Step 6 — Schedule the Post-Closure Benefits Review

Closure is not the last word on benefits. Schedule a **6 or 12-month post-closure review** to confirm:

- Benefits are still flowing at projected scale
- Capabilities are stable in operations
- Sustainment mechanisms are working

Findings feed forward into organizational practice and may inform the next strategy cycle.

### Common Pitfalls

- Closing too fast — leaves loose ends, training, and adoption work unfinished
- Closing too slow — burns budget on a program that should already have transitioned
- Skipping lessons learned — every program then repeats the same mistakes
- Failing to archive — institutional memory walks out the door with the team
- Disappearing immediately — sponsors lose access to the people who can answer questions

### Best Practices

- Begin closure planning at the final Steering Committee, not during the last sprint
- Pair the program manager with a closure-experienced PMO partner
- Communicate closure broadly — many stakeholders only learn the program existed when it ends
- Treat the closure report as a publication-quality artifact

### Practice

Sketch the table of contents for a closure report for your current program. If you cannot fill in the major sections from existing artifacts, you have closure work to do — and now is the right time to start.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'pgm-l15',
      title: 'Quiz: Final',
      titleNL: 'Quiz: Eindexamen',
      type: 'quiz',
      duration: '15:00',
      icon: 'HelpCircle',
      quiz: [
        {
          id: 'pm-q7',
          question: 'In MSP, the Vision Statement serves which primary purpose?',
          questionNL: 'Welk primair doel dient de Vision Statement in MSP?',
          options: [
            'It replaces the Business Case as the financial justification for the programme',
            'It provides an inspiring, concise description of the future state that motivates stakeholders and guides decision-making',
            'It lists the technical requirements for all component projects within the programme',
            'It documents the risk appetite thresholds agreed by the Sponsoring Group',
          ],
          optionsNL: [
            'Het vervangt de Business Case als financiële rechtvaardiging voor het programma',
            'Het biedt een inspirerende, beknopte beschrijving van de toekomstige staat die stakeholders motiveert en besluitvorming begeleidt',
            'Het somt de technische vereisten op voor alle componentprojecten binnen het programma',
            'Het documenteert de risicobereidheidsdrempels die zijn overeengekomen door de Sponsoring Group',
          ],
          correctAnswer: 1,
          explanation: 'The MSP Vision Statement is a clear and compelling picture of the future state the programme aims to achieve. It is deliberately short and motivational, anchoring all programme decisions and communications. It differs from the Blueprint (which is detailed and technical) and from the Business Case (which is financial).',
          explanationNL: 'De MSP Vision Statement is een duidelijk en overtuigend beeld van de toekomstige staat die het programma wil bereiken. Het is bewust kort en motiverend, en verankert alle programmabesluiten en -communicaties. Het verschilt van de Blueprint (gedetailleerd en technisch) en van de Business Case (financieel).',
        },
        {
          id: 'pm-q8',
          question: 'Benefits Management in MSP is BEST described as:',
          questionNL: 'Benefits Management in MSP wordt het BESTE omschreven als:',
          options: [
            'A one-time activity performed at programme closure to confirm whether benefits were achieved',
            'A continuous process from identification through realisation and review, spanning the full programme and beyond',
            'The responsibility of component project managers to report on delivered outputs',
            'An optional governance activity only required for public-sector programmes',
          ],
          optionsNL: [
            'Een eenmalige activiteit die bij programmasluiting wordt uitgevoerd om te bevestigen of baten zijn gerealiseerd',
            'Een continu proces van identificatie tot realisatie en evaluatie, dat het volledige programma en daarna omvat',
            'De verantwoordelijkheid van componentprojectmanagers om over geleverde producten te rapporteren',
            'Een optionele governance-activiteit die alleen vereist is voor programma\'s in de publieke sector',
          ],
          correctAnswer: 1,
          explanation: 'MSP treats Benefits Management as a lifecycle-spanning discipline. It begins during Identifying (defining the Benefits Map), continues through Defining (Benefits Realisation Plan), is tracked through each Tranche, and extends post-programme into the Benefits Realisation period. The Business Change Manager owns day-to-day benefits tracking within each operational area.',
          explanationNL: 'MSP behandelt Benefits Management als een discipline die de gehele levenscyclus omspant. Het begint tijdens Identifying (het definiëren van de Benefits Map), gaat door tijdens Defining (Benefits Realisation Plan), wordt bijgehouden gedurende elke Tranche en loopt door na het programma in de Benefits Realisatieperiode. De Business Change Manager is dagelijks verantwoordelijk voor het bijhouden van baten binnen elk operationeel gebied.',
        },
        {
          id: 'pm-q9',
          question: 'A Benefits Map (or Benefits Dependency Network) in MSP shows:',
          questionNL: 'Een Benefits Map (of Benefits Dependency Network) in MSP toont:',
          options: [
            'The organisational chart of the programme governance structure',
            'The financial NPV calculation for the Business Case',
            'The causal chain from enabling changes and business changes through to end benefits and strategic objectives',
            'A Gantt chart of benefit realisation milestones per tranche',
          ],
          optionsNL: [
            'Het organisatieschema van de programmabeheerstructuur',
            'De financiële NPV-berekening voor de Business Case',
            'De causale keten van activerende veranderingen en bedrijfsveranderingen tot eindresultaten en strategische doelstellingen',
            'Een Gantt-diagram van batenrealisatiemijlpalen per tranche',
          ],
          correctAnswer: 2,
          explanation: 'A Benefits Map (called Benefits Dependency Network in some MSP editions) is a visual tool that traces the dependency chain: strategic objectives → end benefits → intermediate benefits → business changes → enabling changes (outputs from projects). It makes the logic of benefit delivery explicit and helps identify which projects are truly essential.',
          explanationNL: 'Een Benefits Map (in sommige MSP-edities Benefits Dependency Network genoemd) is een visueel hulpmiddel dat de afhankelijkheidsketen in beeld brengt: strategische doelstellingen → eindbaten → tussentijdse baten → bedrijfsveranderingen → activerende veranderingen (producten van projecten). Het maakt de logica van batenlevering expliciet en helpt te identificeren welke projecten werkelijk essentieel zijn.',
        },
        {
          id: 'pm-q10',
          question: 'What is the primary purpose of the MSP Business Case at programme level?',
          questionNL: 'Wat is het primaire doel van de MSP Business Case op programmaniveau?',
          options: [
            'To provide a one-time investment approval document submitted to the finance committee before the programme starts',
            'To serve as a living document that continuously justifies the programme investment throughout its lifecycle',
            'To replace the Benefits Realisation Plan by documenting expected and achieved benefits in a single artefact',
            'To define the technical architecture that the programme will implement',
          ],
          optionsNL: [
            'Om een eenmalig investeringsgoedkeuringsdocument te zijn dat vóór de start van het programma wordt ingediend bij de financiële commissie',
            'Om als levend document te dienen dat de programmainvestering gedurende de hele levenscyclus continu rechtvaardigt',
            'Om het Benefits Realisation Plan te vervangen door verwachte en gerealiseerde baten in één artefact te documenteren',
            'Om de technische architectuur te definiëren die het programma zal implementeren',
          ],
          correctAnswer: 1,
          explanation: 'In MSP, the Business Case is a living document revisited at each Tranche boundary and major decision point. It must demonstrate continued viability (the investment is still worth making given current information). If the Business Case can no longer be justified, MSP requires that the programme be stopped or restructured.',
          explanationNL: 'In MSP is de Business Case een levend document dat bij elke Tranche-grens en elk belangrijk beslismoment wordt herzien. Het moet aantoonbaar blijven dat de investering nog steeds de moeite waard is gezien de actuele informatie. Als de Business Case niet langer gerechtvaardigd kan worden, vereist MSP dat het programma wordt gestopt of geherstructureerd.',
        },
        {
          id: 'pm-q11',
          question: 'In MSP, which role is specifically responsible for managing organisational change and embedding new ways of working so that benefits are actually realised?',
          questionNL: 'Welke rol in MSP is specifiek verantwoordelijk voor het managen van organisatieverandering en het verankeren van nieuwe werkwijzen zodat baten daadwerkelijk worden gerealiseerd?',
          options: [
            'Senior Responsible Owner (SRO)',
            'Programme Manager',
            'Business Change Manager (BCM)',
            'Programme Office Manager',
          ],
          optionsNL: [
            'Senior Responsible Owner (SRO)',
            'Programme Manager',
            'Business Change Manager (BCM)',
            'Programme Office Manager',
          ],
          correctAnswer: 2,
          explanation: 'The Business Change Manager (BCM) in MSP sits within the business area that is changing. Their unique role is to ensure that the capabilities delivered by projects are actually adopted, embedded, and leveraged so that benefits are realised. They represent the "business side" of the programme and are distinct from the Programme Manager who runs the programme itself.',
          explanationNL: 'De Business Change Manager (BCM) in MSP bevindt zich in het bedrijfsgebied dat verandert. Hun unieke rol is ervoor te zorgen dat de capaciteiten die door projecten worden geleverd daadwerkelijk worden geadopteerd, verankerd en benut zodat baten worden gerealiseerd. Ze vertegenwoordigen de "businesskant" van het programma en zijn onderscheiden van de Programme Manager die het programma zelf beheert.',
        },
        {
          id: 'pm-q12',
          question: 'During programme closure in MSP, which action is explicitly required before the programme can be formally closed?',
          questionNL: 'Welke actie is tijdens programmasluiting in MSP expliciet vereist voordat het programma formeel kan worden gesloten?',
          options: [
            'All component projects must achieve zero open risks and issues',
            'The programme budget must show a surplus against the original Business Case',
            'Outstanding benefits realisation responsibilities must be formally handed over to operational management',
            'The SRO must have personally reviewed every project closure report',
          ],
          optionsNL: [
            'Alle componentprojecten moeten nul openstaande risico\'s en issues hebben',
            'Het programmabueget moet een overschot laten zien ten opzichte van de originele Business Case',
            'Uitstaande verantwoordelijkheden voor batenrealisatie moeten formeel worden overgedragen aan het operationeel management',
            'De SRO moet persoonlijk elk projectsluitingsrapport hebben beoordeeld',
          ],
          correctAnswer: 2,
          explanation: 'MSP requires that before formal programme closure, all ongoing benefits realisation responsibilities are formally transferred to operational management (typically line management in the affected business areas). Benefits realisation often continues for months or years after the programme ends, and MSP requires a named owner with accountability for each benefit post-closure.',
          explanationNL: 'MSP vereist dat vóór formele programmasluiting alle lopende verantwoordelijkheden voor batenrealisatie formeel worden overgedragen aan het operationeel management (doorgaans lijnmanagement in de betrokken bedrijfsgebieden). Batenrealisatie gaat vaak maanden of jaren door nadat het programma is beëindigd, en MSP vereist een benoemde eigenaar met verantwoordelijkheid voor elke bate na sluiting.',
        },
      ],
    },
    {
      id: 'pgm-l17',
      title: 'Practical Assignment: Programme Blueprint, Benefits Map & Tranche Plan',
      titleNL: 'Praktijkopdracht: Programme Blueprint, Benefits Map & Tranche Plan',
      type: 'assignment',
      duration: '60:00',
      videoUrl: '',
      transcript: `## Practical Assignment — Programme Blueprint, Benefits Map & Tranche Plan

### Purpose

This assignment bridges theory and practice. You will apply MSP doctrine to a realistic fictional transformation programme, producing three core governance artefacts that any Programme Manager would be expected to produce during the Defining phase.

Completing this assignment demonstrates that you can translate strategic intent into structured programme design — the hallmark of a capable programme professional.

---

### The Fictional Programme: "HealthLink 2027"

**Organisation:** RegionCare NV — a mid-sized regional healthcare provider operating 4 hospitals and 22 community clinics across the Netherlands.

**Strategic trigger:** RegionCare's board has mandated a digital health transformation to reduce patient waiting times by 40%, improve cross-facility care coordination, and generate €12M in operational savings by Q4 2027.

**Programme scope:** Three component projects have been identified:
1. **Digital Patient Record Unification** — replace 3 legacy EPR systems with a single platform
2. **Integrated Scheduling System** — cross-facility appointment and resource scheduling
3. **Staff Capability Development** — training 2,400 clinical and administrative staff on new systems and processes

The programme is expected to run 30 months, split into two tranches.

---

### Deliverable 1 — Programme Blueprint (one page, A4)

Produce a one-page Blueprint describing RegionCare's target operating model at programme completion. Include:

- **Processes:** Which core processes will change (e.g. patient admissions, referrals, discharge planning)?
- **Information & data:** What information systems will be in place and what data will flow between them?
- **Organisation & culture:** Any structural or cultural changes required (e.g. new cross-facility coordination roles)?
- **Technology:** Key technology capabilities that will be operational
- **People & skills:** Core competencies that staff will need to demonstrate

**Format:** A table or structured prose, max one A4 page. The Blueprint must clearly contrast the current state ("as-is") with the future state ("to-be") for at least three dimensions.

---

### Deliverable 2 — Benefits Map (one page)

Draw or describe a Benefits Map (Benefits Dependency Network) for HealthLink 2027. The map must show:

- At least **3 end benefits** traceable to the strategic objectives (e.g. "40% reduction in waiting times", "€12M operational saving", "improved patient outcomes score")
- At least **4 intermediate benefits** that flow into the end benefits
- At least **4 business changes** (changes in how RegionCare operates) that enable the intermediate benefits
- At least **3 enabling changes** (outputs that component projects must deliver, e.g. "live EPR platform", "trained staff cohort")

**Format:** A diagram (hand-drawn scan, Visio, Miro, or any tool) OR a structured table with columns: Enabling Change → Business Change → Intermediate Benefit → End Benefit → Strategic Objective. Arrows/linkages must be explicit.

---

### Deliverable 3 — Tranche Plan (one page)

HealthLink 2027 runs in two tranches. Produce a Tranche Plan covering:

- **Tranche 1 (months 1–15):** Which projects are active? What capability step-change does this tranche deliver? What is the tranche-end review criterion (what must be true before Tranche 2 begins)?
- **Tranche 2 (months 16–30):** Same structure
- **Benefits realisation period (months 31–42):** Which benefits are measured post-programme, by whom, by when?

For each tranche, identify the top 2 risks and the corresponding mitigation approach.

**Format:** A structured table or timeline narrative, max one A4 page.

---

### Assessment Rubric

| Criterion | Excellent (4) | Acceptable (2) | Insufficient (0) |
|---|---|---|---|
| **Blueprint completeness** | All 5 dimensions covered, clear as-is vs to-be contrast | 3–4 dimensions, partial contrast | Fewer than 3 dimensions or no contrast |
| **Benefits Map logic** | Full causal chain, all linkages explained, 3+ end benefits | Partial chain, some linkages missing | No causal logic or fewer than 2 benefits |
| **Tranche Plan coherence** | Both tranches defined, clear step-change, gate criteria explicit | One tranche complete, gate criteria vague | Single undifferentiated delivery plan |
| **MSP terminology** | SRO, BCM, Blueprint, Vision, Tranche, Benefits Realisation used correctly | Some correct use of MSP terms | No MSP terminology or terms misused |
| **Practical realism** | Artefacts could plausibly be used in a real programme | Minor gaps but structurally sound | Too abstract or generic to be useful |

**Pass mark:** Score 10 or above out of 20. Assignments are reviewed by your programme tutor within 5 business days.

---

### Submission

Submit your three artefacts as a single PDF or ZIP file. Include your name, the course name, and today's date on the cover page. Your submission will be reviewed against the rubric above and returned with written feedback.`,
      transcriptNL: `## Praktijkopdracht — Programme Blueprint, Benefits Map & Tranche Plan

### Doel

Deze opdracht overbrugt theorie en praktijk. U past MSP-doctrine toe op een realistische fictieve transformatieprogramma en produceert drie kernbeheersartefacten die elke Programme Manager wordt geacht te produceren tijdens de Defining-fase.

Het voltooien van deze opdracht toont aan dat u strategische intentie kunt vertalen naar gestructureerd programmontwerp — het kenmerk van een bekwame programmaprofessional.

---

### Het Fictieve Programma: "HealthLink 2027"

**Organisatie:** RegionCare NV — een middelgrote regionale zorgaanbieder met 4 ziekenhuizen en 22 gemeenschapsklinieken in Nederland.

**Strategische aanleiding:** De raad van bestuur van RegionCare heeft een digitale gezondheidstransformatie verplicht gesteld om de wachttijden voor patiënten met 40% te verminderen, de zorgcoördinatie tussen faciliteiten te verbeteren en €12M aan operationele besparingen te genereren voor Q4 2027.

**Programmascope:** Drie componentprojecten zijn geïdentificeerd:
1. **Digitale Patiëntdossier Unificatie** — 3 verouderde EPR-systemen vervangen door één platform
2. **Geïntegreerd Planningssysteem** — cross-facility afspraken- en resourceplanning
3. **Personeelscapaciteitsontwikkeling** — training van 2.400 klinische en administratieve medewerkers

Het programma duurt naar verwachting 30 maanden, verdeeld over twee tranches.

---

### Deliverable 1 — Programme Blueprint (één pagina, A4)

Produceer een één pagina Blueprint die het doelbedrijfsmodel van RegionCare bij voltooiing van het programma beschrijft. Omvat:

- **Processen:** Welke kernprocessen veranderen (bijv. patiëntopname, verwijzingen, ontslagplanning)?
- **Informatie & data:** Welke informatiesystemen zijn aanwezig en welke data stroomt daartussen?
- **Organisatie & cultuur:** Eventuele structurele of culturele veranderingen (bijv. nieuwe cross-facility coördinatierollen)?
- **Technologie:** Sleuteltechnologiecapaciteiten die operationeel zullen zijn
- **Mensen & vaardigheden:** Kerncompetenties die medewerkers moeten aantonen

**Formaat:** Een tabel of gestructureerde proza, maximaal één A4-pagina. De Blueprint moet duidelijk het huidige (as-is) en toekomstige (to-be) contrast tonen voor ten minste drie dimensies.

---

### Deliverable 2 — Benefits Map (één pagina)

Teken of beschrijf een Benefits Map (Benefits Dependency Network) voor HealthLink 2027. De kaart moet tonen:

- Ten minste **3 eindbaten** herleidbaar tot de strategische doelstellingen
- Ten minste **4 tussentijdse baten** die doorstromen naar de eindbaten
- Ten minste **4 bedrijfsveranderingen** die de tussentijdse baten mogelijk maken
- Ten minste **3 activerende veranderingen** (producten die componentprojecten moeten leveren)

**Formaat:** Een diagram of gestructureerde tabel met kolommen: Activerende Verandering → Bedrijfsverandering → Tussentijdse Bate → Eindbate → Strategisch Doel.

---

### Deliverable 3 — Tranche Plan (één pagina)

HealthLink 2027 loopt in twee tranches. Produceer een Tranche Plan:

- **Tranche 1 (maanden 1–15):** Welke projecten zijn actief? Welke capaciteitsstap levert deze tranche? Wat is het reviewcriterium aan het einde van de tranche?
- **Tranche 2 (maanden 16–30):** Dezelfde structuur
- **Batenrealisatieperiode (maanden 31–42):** Welke baten worden na het programma gemeten, door wie, wanneer?

Per tranche: identificeer de top 2 risico's en de bijbehorende mitigatiebenadering.

---

### Beoordelingsrubric

| Criterium | Uitstekend (4) | Acceptabel (2) | Onvoldoende (0) |
|---|---|---|---|
| **Blueprint volledigheid** | Alle 5 dimensies, duidelijk as-is vs to-be contrast | 3–4 dimensies, gedeeltelijk contrast | Minder dan 3 dimensies of geen contrast |
| **Benefits Map logica** | Volledige causale keten, alle koppelingen uitgelegd | Gedeeltelijke keten, enkele koppelingen ontbreken | Geen causale logica |
| **Tranche Plan coherentie** | Beide tranches gedefinieerd, duidelijke stap, gate-criteria expliciet | Één tranche volledig, gate-criteria vaag | Ongedifferentieerd leveringsplan |
| **MSP-terminologie** | SRO, BCM, Blueprint, Vision, Tranche correct gebruikt | Sommige MSP-termen correct | Geen of verkeerd gebruik van MSP-termen |
| **Praktische realisme** | Artefacten kunnen plausibel in een echt programma worden gebruikt | Kleine hiaten maar structureel solide | Te abstract of generiek |

**Cijfergrens:** 10 of hoger van 20. Opdrachten worden beoordeeld door uw programmatutor binnen 5 werkdagen.

---

### Indiening

Dien uw drie artefacten in als één PDF of ZIP-bestand. Vermeld uw naam, de cursusnaam en de datum van vandaag op de voorpagina.`,
      keyTakeaways: [
        'A Programme Blueprint defines the target operating model — the future state the programme must deliver',
        'A Benefits Map traces the causal chain from project outputs through business changes to strategic objectives',
        'Tranches segment the programme into discrete capability step-changes, each with a formal review gate',
        'Applying MSP artefacts to a realistic scenario reveals gaps in your programme design before they become costly',
      ],
      keyTakeawaysNL: [
        'Een Programme Blueprint definieert het doelbedrijfsmodel — de toekomstige staat die het programma moet leveren',
        'Een Benefits Map traceert de causale keten van projectproducten via bedrijfsveranderingen naar strategische doelstellingen',
        'Tranches segmenteren het programma in afzonderlijke capaciteitsstappen, elk met een formele reviewgate',
        'MSP-artefacten toepassen op een realistisch scenario onthult hiaten in uw programmontwerp voordat ze kostbaar worden',
      ],
    },
    {
      id: 'pgm-l18',
      title: 'Final Exam: Program Management Professional',
      titleNL: 'Eindexamen: Programma Management Professional',
      type: 'exam',
      duration: '45:00',
      videoUrl: '',
      transcript: `## Final Exam — Program Management Professional

### Format

This exam consists of **25 multiple-choice questions**. Each question has four options; select the single best answer.

- **Time allowed:** 45 minutes
- **Pass mark:** 70% (18 out of 25 correct)
- **Retakes:** Unlimited; a cooling-off period of 24 hours applies between attempts
- **Certification:** Learners who pass receive the ProjeXtPal Programme Management Professional certificate of completion, recognised by Inclufy

### Scope

The exam covers the full course across all three modules:

- Module 1 — Programme Management Basics: programme vs project distinction, governance structures, the MSP Transformational Flow, Blueprint, roles (SRO, Programme Manager, BCM)
- Module 2 — Strategic Alignment: linking programmes to strategy, stakeholder engagement, benefits identification and mapping, the Business Case lifecycle
- Module 3 — Programme Lifecycle & Closure: Tranche management, benefits realisation, programme closure, lessons learned, post-programme transition

### Tips

- Re-read your Blueprint, Benefits Map, and Tranche Plan from the practical assignment before sitting the exam
- Focus on MSP terminology precision — distractors are designed to use near-correct language
- If unsure, eliminate answers that contradict core MSP principles (benefits-led, governance-driven, stakeholder-engaged)`,
      transcriptNL: `## Eindexamen — Programma Management Professional

### Formaat

Dit examen bestaat uit **25 meerkeuzevragen**. Elke vraag heeft vier opties; selecteer het beste antwoord.

- **Toegestane tijd:** 45 minuten
- **Cijfergrens:** 70% (18 van de 25 vragen correct)
- **Herkansingen:** Onbeperkt; een afkoelperiode van 24 uur geldt tussen pogingen
- **Certificering:** Cursisten die slagen ontvangen het ProjeXtPal Programma Management Professional voltooiingscertificaat, erkend door Inclufy

### Scope

Het examen beslaat de volledige cursus over alle drie modules:

- Module 1 — Programma Management Basis: programma vs project onderscheid, governancestructuren, de MSP Transformational Flow, Blueprint, rollen (SRO, Programme Manager, BCM)
- Module 2 — Strategische Afstemming: programma's koppelen aan strategie, stakeholdersbetrokkenheid, batenidentificatie en -mapping, de Business Case-levenscyclus
- Module 3 — Programma-levenscyclus & Sluiting: Tranche-management, batenrealisatie, programmasluiting, lessen geleerd, post-programmatransitie

### Tips

- Herlees uw Blueprint, Benefits Map en Tranche Plan uit de praktijkopdracht voordat u het examen aflegt
- Focus op MSP-terminologieprecisie — afleiders zijn ontworpen om bijna-correcte taal te gebruiken
- Als u twijfelt, elimineer antwoorden die de kern-MSP-principes tegenspreken (baten-gedreven, governance-gedreven, stakeholder-betrokken)`,
      keyTakeaways: [
        '25 questions, 45 minutes, 70% pass mark',
        'Covers all three modules: Basics, Strategic Alignment, and Programme Lifecycle',
        'MSP doctrine is the primary source — focus on roles, artefacts, and the Transformational Flow',
        'Passing awards the ProjeXtPal Programme Management Professional certificate',
      ],
      keyTakeawaysNL: [
        '25 vragen, 45 minuten, 70% cijfergrens',
        'Beslaat alle drie modules: Basis, Strategische Afstemming en Programma-levenscyclus',
        'MSP-doctrine is de primaire bron — focus op rollen, artefacten en de Transformational Flow',
        'Slagen levert het ProjeXtPal Programma Management Professional certificaat op',
      ],
      quiz: [
        {
          id: 'pm-exam-q1',
          question: 'MSP defines a programme as a temporary, flexible organisation created to coordinate, direct and oversee related projects and activities in order to deliver:',
          questionNL: 'MSP definieert een programma als een tijdelijke, flexibele organisatie die is opgericht om gerelateerde projecten en activiteiten te coördineren, te sturen en te bewaken om het volgende te leveren:',
          options: [
            'A set of technical outputs within an agreed budget and schedule',
            'Outcomes and benefits related to strategic objectives',
            'A portfolio of independent projects managed by a single PMO',
            'A series of operational improvements without a defined end date',
          ],
          optionsNL: [
            'Een reeks technische producten binnen een overeengekomen budget en planning',
            'Resultaten en baten gerelateerd aan strategische doelstellingen',
            'Een portfolio van onafhankelijke projecten beheerd door één PMO',
            'Een reeks operationele verbeteringen zonder een gedefinieerde einddatum',
          ],
          correctAnswer: 1,
          explanation: 'This is the core MSP definition of a programme. The key phrase is "outcomes and benefits related to strategic objectives" — it is this benefits-led, strategy-anchored nature that distinguishes a programme from a project or portfolio.',
          explanationNL: 'Dit is de kernomschrijving van een programma in MSP. De sleutelzin is "resultaten en baten gerelateerd aan strategische doelstellingen" — het is dit baten-gerichte, strategisch verankerde karakter dat een programma onderscheidt van een project of portfolio.',
        },
        {
          id: 'pm-exam-q2',
          question: 'The correct order of the MSP Transformational Flow is:',
          questionNL: 'De juiste volgorde van de MSP Transformational Flow is:',
          options: [
            'Defining → Identifying → Managing Tranches → Delivering Capability → Realising Benefits → Closing',
            'Identifying → Defining → Managing Tranches → Delivering Capability → Realising Benefits → Closing',
            'Identifying → Defining → Delivering Capability → Managing Tranches → Realising Benefits → Closing',
            'Identifying → Managing Tranches → Defining → Delivering Capability → Closing → Realising Benefits',
          ],
          optionsNL: [
            'Defining → Identifying → Managing Tranches → Delivering Capability → Realising Benefits → Closing',
            'Identifying → Defining → Managing Tranches → Delivering Capability → Realising Benefits → Closing',
            'Identifying → Defining → Delivering Capability → Managing Tranches → Realising Benefits → Closing',
            'Identifying → Managing Tranches → Defining → Delivering Capability → Closing → Realising Benefits',
          ],
          correctAnswer: 1,
          explanation: 'The MSP Transformational Flow proceeds: Identifying a Programme → Defining a Programme → Managing Tranches → Delivering Capability → Realising Benefits → Closing a Programme. This sequence reflects the logical progression from strategic vision through delivery to benefit capture and formal closure.',
          explanationNL: 'De MSP Transformational Flow verloopt: Identifying a Programme → Defining a Programme → Managing Tranches → Delivering Capability → Realising Benefits → Closing a Programme. Deze volgorde weerspiegelt de logische progressie van strategische visie via levering naar batenopname en formele sluiting.',
        },
        {
          id: 'pm-exam-q3',
          question: 'The Blueprint document in MSP is BEST described as:',
          questionNL: 'Het Blueprint-document in MSP wordt het BESTE omschreven als:',
          options: [
            'A financial model showing programme costs and expected ROI',
            'A detailed description of the target operating model the programme will deliver',
            'A risk register aggregated from all component projects',
            'A stakeholder engagement plan covering all programme communications',
          ],
          optionsNL: [
            'Een financieel model dat programmakostenen verwachte ROI toont',
            'Een gedetailleerde beschrijving van het doelbedrijfsmodel dat het programma zal leveren',
            'Een risicoregister geaggregeerd van alle componentprojecten',
            'Een stakeholdersbetrokkenheidsplan dat alle programmacommunicaties omvat',
          ],
          correctAnswer: 1,
          explanation: 'The MSP Blueprint describes the target operating model — the future state of the organisation in terms of processes, information, organisation, technology, and people. It is the primary design reference that all component projects must contribute towards, and is contrasted with the current state to make transformation progress measurable.',
          explanationNL: 'De MSP Blueprint beschrijft het doelbedrijfsmodel — de toekomstige staat van de organisatie in termen van processen, informatie, organisatie, technologie en mensen. Het is de primaire ontwerprefentie waaraan alle componentprojecten moeten bijdragen en wordt afgezet tegen de huidige staat om transformatievoortgang meetbaar te maken.',
        },
        {
          id: 'pm-exam-q4',
          question: 'Who holds ultimate accountability for a programme achieving its objectives and delivering expected benefits in MSP?',
          questionNL: 'Wie draagt de uiteindelijke verantwoordelijkheid voor het behalen van programmadoelstellingen en het leveren van verwachte baten in MSP?',
          options: [
            'Programme Manager',
            'Business Change Manager',
            'Senior Responsible Owner (SRO)',
            'Sponsoring Group Chair',
          ],
          optionsNL: [
            'Programme Manager',
            'Business Change Manager',
            'Senior Responsible Owner (SRO)',
            'Voorzitter van de Sponsoring Group',
          ],
          correctAnswer: 2,
          explanation: 'The SRO is the single point of accountability for the programme. They own the Business Case, chair or sponsor the Programme Board, and are personally accountable to the Sponsoring Group for outcomes and benefits. This undivided accountability is a fundamental MSP governance principle.',
          explanationNL: 'De SRO is het enige verantwoordingspunt voor het programma. Ze zijn eigenaar van de Business Case, leiden of sponsoren het Programme Board en zijn persoonlijk verantwoordelijk aan de Sponsoring Group voor resultaten en baten. Deze ongedeelde verantwoordelijkheid is een fundamenteel MSP-governanceprincipe.',
        },
        {
          id: 'pm-exam-q5',
          question: 'A Tranche in MSP represents:',
          questionNL: 'Een Tranche in MSP vertegenwoordigt:',
          options: [
            'A financial release to a component project upon passing a milestone gate',
            'A grouping of projects delivering a distinct step-change in organisational capability',
            'A time-boxed planning horizon equivalent to a project sprint',
            'A risk contingency reserve held at programme level',
          ],
          optionsNL: [
            'Een financiële vrijgave aan een componentproject bij het passeren van een mijlpaalgate',
            'Een groepering van projecten die een duidelijke stapsgewijze verbetering in organisatorische capaciteit leveren',
            'Een time-boxed planningshorizon equivalent aan een projectsprint',
            'Een risicoreserve aangehouden op programmaniveau',
          ],
          correctAnswer: 1,
          explanation: 'A Tranche is MSP\'s mechanism for segmenting programme delivery into discrete waves of change. Each tranche delivers a measurable step-change in capability that moves the organisation closer to the Blueprint. Tranches end with a formal review and decision point (continue, redirect, or close).',
          explanationNL: 'Een Tranche is het MSP-mechanisme voor het segmenteren van programmaleving in afzonderlijke veranderingsgolven. Elke tranche levert een meetbare stapsgewijze verbetering in capaciteit die de organisatie dichter bij de Blueprint brengt. Tranches eindigen met een formele review en beslismoment (doorgaan, bijsturen of sluiten).',
        },
        {
          id: 'pm-exam-q6',
          question: 'The Vision Statement in MSP is specifically designed to be:',
          questionNL: 'De Vision Statement in MSP is specifiek ontworpen om te zijn:',
          options: [
            'A comprehensive technical specification of the future state',
            'A short, inspiring description of what the programme will achieve, used to motivate and align',
            'A detailed financial justification replacing the Business Case at programme initiation',
            'A legal contract between the programme and its component projects',
          ],
          optionsNL: [
            'Een uitgebreide technische specificatie van de toekomstige staat',
            'Een korte, inspirerende beschrijving van wat het programma zal bereiken, gebruikt om te motiveren en af te stemmen',
            'Een gedetailleerde financiële rechtvaardiging ter vervanging van de Business Case bij programmanitiatie',
            'Een juridisch contract tussen het programma en zijn componentprojecten',
          ],
          correctAnswer: 1,
          explanation: 'The Vision Statement is a brief motivational document (often one page or less) that captures WHY the programme matters in human terms. It is used to communicate with stakeholders, maintain alignment under pressure, and guide decision-making when the detailed Blueprint is not accessible. It complements but never replaces the Blueprint or Business Case.',
          explanationNL: 'De Vision Statement is een kort motiverend document (vaak één pagina of minder) dat vastlegt WAAROM het programma van belang is in menselijke termen. Het wordt gebruikt om te communiceren met stakeholders, afstemming te behouden onder druk en besluitvorming te begeleiden wanneer de gedetailleerde Blueprint niet toegankelijk is. Het vult de Blueprint en Business Case aan maar vervangt ze nooit.',
        },
        {
          id: 'pm-exam-q7',
          question: 'Benefits Management in MSP is characterised as:',
          questionNL: 'Benefits Management in MSP wordt gekenmerkt als:',
          options: [
            'A one-time activity at programme closure to confirm benefit delivery',
            'A continuous process spanning the full programme lifecycle and beyond, into operational management',
            'The exclusive responsibility of component project managers',
            'An optional activity for public sector programmes only',
          ],
          optionsNL: [
            'Een eenmalige activiteit bij programmasluiting om batenlevering te bevestigen',
            'Een continu proces dat de volledige programmalevenscyclus en daarna omspant, in operationeel management',
            'De exclusieve verantwoordelijkheid van componentprojectmanagers',
            'Een optionele activiteit alleen voor publieke sector programma\'s',
          ],
          correctAnswer: 1,
          explanation: 'MSP treats Benefits Management as a continuous discipline from the first identification of potential benefits (during Identifying) through to post-programme realisation reviews. It does not end when the programme closes — the Benefits Realisation Plan assigns owners responsible for tracking benefits into operations.',
          explanationNL: 'MSP behandelt Benefits Management als een continue discipline van de eerste identificatie van potentiële baten (tijdens Identifying) tot aan post-programmarealisatiereviews. Het eindigt niet wanneer het programma sluit — het Benefits Realisation Plan wijst eigenaren toe die verantwoordelijk zijn voor het bijhouden van baten in de operaties.',
        },
        {
          id: 'pm-exam-q8',
          question: 'A Benefits Map (Benefits Dependency Network) shows:',
          questionNL: 'Een Benefits Map (Benefits Dependency Network) toont:',
          options: [
            'A Gantt chart of benefit realisation milestones across tranches',
            'The organisational hierarchy of roles responsible for each benefit',
            'The causal chain from project outputs through business changes to end benefits and strategic objectives',
            'A financial discounted cash flow model for all programme benefits',
          ],
          optionsNL: [
            'Een Gantt-diagram van batenrealisatiemijlpalen over tranches',
            'De organisatorische hiërarchie van rollen verantwoordelijk voor elke bate',
            'De causale keten van projectproducten via bedrijfsveranderingen naar eindbaten en strategische doelstellingen',
            'Een financieel verdisconteerd kasstroommodel voor alle programmabaten',
          ],
          correctAnswer: 2,
          explanation: 'A Benefits Map visualises the dependency logic: enabling changes (outputs) → business changes (new ways of working) → intermediate benefits → end benefits → strategic objectives. This causal chain makes it explicit which project outputs are truly essential and which benefits depend on which organisational changes.',
          explanationNL: 'Een Benefits Map visualiseert de afhankelijkheidslogica: activerende veranderingen (producten) → bedrijfsveranderingen (nieuwe werkwijzen) → tussentijdse baten → eindbaten → strategische doelstellingen. Deze causale keten maakt expliciet welke projectproducten werkelijk essentieel zijn en welke baten afhangen van welke organisatorische veranderingen.',
        },
        {
          id: 'pm-exam-q9',
          question: 'The role of Business Change Manager (BCM) in MSP is PRIMARILY to:',
          questionNL: 'De rol van Business Change Manager (BCM) in MSP is PRIMAIR om:',
          options: [
            'Manage the day-to-day delivery of component projects',
            'Prepare the programme financial reports for the Sponsoring Group',
            'Ensure delivered capabilities are adopted and embedded in the business so benefits are realised',
            'Represent the programme at portfolio governance forums',
          ],
          optionsNL: [
            'De dagelijkse levering van componentprojecten beheren',
            'De financiële programmarapporten voorbereiden voor de Sponsoring Group',
            'Zorgen dat geleverde capaciteiten worden geadopteerd en verankerd in het bedrijf zodat baten worden gerealiseerd',
            'Het programma vertegenwoordigen bij portfolio governance forums',
          ],
          correctAnswer: 2,
          explanation: 'The BCM bridges delivery and benefit realisation. They sit in the business area being changed, not in the programme team, and their job is to manage the transition — ensuring staff adopt new processes, systems, and behaviours so that the capabilities delivered by projects actually generate measurable benefits.',
          explanationNL: 'De BCM overbrugt levering en batenrealisatie. Ze bevinden zich in het bedrijfsgebied dat verandert, niet in het programmateam, en hun taak is de transitie te beheren — zorgen dat medewerkers nieuwe processen, systemen en gedragingen adopteren zodat de capaciteiten die door projecten worden geleverd daadwerkelijk meetbare baten genereren.',
        },
        {
          id: 'pm-exam-q10',
          question: 'The MSP Programme Business Case differs from a project business case primarily because it:',
          questionNL: 'De MSP Programme Business Case verschilt van een projectbusiness case voornamelijk omdat het:',
          options: [
            'Is prepared by an external consultant rather than the programme team',
            'Is reviewed and updated at each Tranche boundary to confirm continued viability',
            'Contains technical specifications for all component projects',
            'Is only submitted once, at programme initiation, and not revised thereafter',
          ],
          optionsNL: [
            'Wordt opgesteld door een externe consultant in plaats van het programmateam',
            'Bij elke Tranche-grens wordt herzien en bijgewerkt om voortdurende levensvatbaarheid te bevestigen',
            'Technische specificaties bevat voor alle componentprojecten',
            'Slechts eenmaal wordt ingediend, bij programmanitiatie, en daarna niet wordt herzien',
          ],
          correctAnswer: 1,
          explanation: 'The MSP Business Case is a living document. At each Tranche boundary, the Sponsoring Group and SRO review it against current evidence of benefit delivery and organisational context. If the Business Case can no longer be justified, MSP requires the programme be stopped — the ongoing review is what distinguishes programme-level governance from project-level governance.',
          explanationNL: 'De MSP Business Case is een levend document. Bij elke Tranche-grens bekijken de Sponsoring Group en SRO het op basis van huidig bewijs van batenlevering en organisatorische context. Als de Business Case niet langer gerechtvaardigd kan worden, vereist MSP dat het programma wordt gestopt — de doorlopende review is wat programmabeleid onderscheidt van projectbeleid.',
        },
        {
          id: 'pm-exam-q11',
          question: 'Strategic alignment in programme management means:',
          questionNL: 'Strategische afstemming in programmamanagement betekent:',
          options: [
            'All component project managers have read the corporate strategy document',
            'There is a traceable line from corporate scorecard metrics through programme benefits to the specific outputs being delivered',
            'The programme was approved by the CEO rather than a department head',
            'The programme budget is aligned with the annual operating plan',
          ],
          optionsNL: [
            'Alle componentprojectmanagers hebben het bedrijfsstrategiedocument gelezen',
            'Er is een traceerbare lijn van bedrijfsscorecardmetrieken via programmabaten naar de specifieke producten die worden geleverd',
            'Het programma werd goedgekeurd door de CEO in plaats van een afdelingshoofd',
            'Het programmabudget is afgestemd op het jaarlijks operationeel plan',
          ],
          correctAnswer: 1,
          explanation: 'Strategic alignment is demonstrated by traceability: you should be able to draw a line from a specific corporate KPI or strategic objective, through a programme-level benefit, to the specific project output that will enable that benefit. If any link in that chain is missing or assumed, the programme is not truly aligned.',
          explanationNL: 'Strategische afstemming wordt aangetoond door traceerbaarheid: u zou een lijn moeten kunnen trekken van een specifieke bedrijfs-KPI of strategisch doel, via een programmabate, naar het specifieke projectproduct dat die bate mogelijk maakt. Als een schakel in die keten ontbreekt of aangenomen is, is het programma niet echt afgestemd.',
        },
        {
          id: 'pm-exam-q12',
          question: 'Stakeholder engagement at programme level differs from project-level stakeholder management because:',
          questionNL: 'Stakeholdersbetrokkenheid op programmaniveau verschilt van stakeholdersbeheer op projectniveau omdat:',
          options: [
            'Programmes only need to engage with executive stakeholders; projects engage operational ones',
            'Programmes must manage a larger, more diverse stakeholder community including those affected by organisational change, often over a multi-year horizon',
            'Programme stakeholder engagement is delegated entirely to the BCM',
            'Project stakeholders are external; programme stakeholders are always internal',
          ],
          optionsNL: [
            'Programma\'s hoeven alleen betrokkenheid te hebben met uitvoerende stakeholders; projecten betrekken operationele stakeholders',
            'Programma\'s moeten een grotere, meer diverse gemeenschap van stakeholders beheren, inclusief degenen die worden beïnvloed door organisatieverandering, vaak over een meerjarige horizon',
            'Programmastakeholdersbetrokkenheid wordt volledig gedelegeerd aan de BCM',
            'Projectstakeholders zijn extern; programmastakeholders zijn altijd intern',
          ],
          correctAnswer: 1,
          explanation: 'Programme stakeholder communities span strategic sponsors, operational staff, customers, regulators, and union representatives — often thousands of people affected by the transformation. Engagement must be sustained over years and adapt as the programme moves through tranches and the change becomes real to people\'s working lives.',
          explanationNL: 'Programmastakeholdergemeenschappen omvatten strategische sponsors, operationele medewerkers, klanten, regelgevers en vakbondsvertegenwoordigers — vaak duizenden mensen die worden beïnvloed door de transformatie. Betrokkenheid moet jaren worden volgehouden en aanpassen naarmate het programma door tranches beweegt en de verandering realiteit wordt in het werkleven van mensen.',
        },
        {
          id: 'pm-exam-q13',
          question: 'Which governance body in MSP provides strategic investment authority for the programme?',
          questionNL: 'Welk governanceorgaan in MSP biedt strategische investeringsautoriteit voor het programma?',
          options: [
            'The Programme Board',
            'The Project Boards of component projects',
            'The Sponsoring Group',
            'The Programme Office',
          ],
          optionsNL: [
            'Het Programme Board',
            'De Project Boards van componentprojecten',
            'De Sponsoring Group',
            'Het Programme Office',
          ],
          correctAnswer: 2,
          explanation: 'The Sponsoring Group holds the corporate investment authority. They commission the programme, approve the Business Case, and hold the SRO accountable. The Programme Board manages the programme day-to-day and reports to the Sponsoring Group. This separation ensures strategic decisions remain at the right organisational level.',
          explanationNL: 'De Sponsoring Group houdt de bedrijfsinvesteringsautoriteit. Ze geven de opdracht voor het programma, keuren de Business Case goed en houden de SRO ter verantwoording. Het Programme Board beheert het programma dagelijks en rapporteert aan de Sponsoring Group. Deze scheiding zorgt ervoor dat strategische beslissingen op het juiste organisatorische niveau blijven.',
        },
        {
          id: 'pm-exam-q14',
          question: 'Programme closure in MSP can be triggered by which of the following?',
          questionNL: 'Programmasluiting in MSP kan worden getriggerd door welke van de volgende?',
          options: [
            'Only by successful delivery of all planned outputs',
            'Successful benefit realisation, strategic objective change, or the Business Case no longer being viable',
            'Only when the SRO personally confirms all projects are closed',
            'When the programme budget is fully spent, regardless of benefit delivery',
          ],
          optionsNL: [
            'Alleen door succesvolle levering van alle geplande producten',
            'Succesvolle batenrealisatie, verandering van strategisch doel of de Business Case niet langer levensvatbaar zijn',
            'Alleen wanneer de SRO persoonlijk bevestigt dat alle projecten zijn gesloten',
            'Wanneer het programmabudget volledig is besteed, ongeacht batenlevering',
          ],
          correctAnswer: 1,
          explanation: 'MSP recognises three legitimate closure triggers: (1) the programme has achieved its objectives and benefits are being realised; (2) the strategic context has changed so the programme is no longer needed or relevant; (3) the Business Case is no longer viable. All three are valid; MSP does not require "completion" to close a programme.',
          explanationNL: 'MSP erkent drie legitieme sluitingstriggers: (1) het programma heeft zijn doelstellingen bereikt en baten worden gerealiseerd; (2) de strategische context is veranderd zodat het programma niet langer nodig of relevant is; (3) de Business Case is niet langer levensvatbaar. Alle drie zijn geldig; MSP vereist geen "voltooiing" om een programma te sluiten.',
        },
        {
          id: 'pm-exam-q15',
          question: 'Benefits realisation in MSP typically extends:',
          questionNL: 'Batenrealisatie in MSP strekt zich typisch uit:',
          options: [
            'Only until the final project within the programme is closed',
            'For 30 days after programme closure — the post-closure review period',
            'Beyond programme closure, into the operational phase, with named benefit owners accountable for measurement',
            'Until the Sponsoring Group signs the programme closure report',
          ],
          optionsNL: [
            'Alleen totdat het laatste project binnen het programma is gesloten',
            'Gedurende 30 dagen na programmasluiting — de post-sluitingsreviewperiode',
            'Na programmasluiting, de operationele fase in, met benoemde baten-eigenaren verantwoordelijk voor meting',
            'Totdat de Sponsoring Group het programmasluitingsrapport ondertekent',
          ],
          correctAnswer: 2,
          explanation: 'Many programme benefits are realised months or years after the programme closes — cost savings accumulate, customer satisfaction improves gradually, or new capabilities are leveraged over time. MSP requires the Benefits Realisation Plan to name operational owners who track and report benefits post-closure, ensuring accountability does not disappear when the programme team disbands.',
          explanationNL: 'Veel programmabaten worden maanden of jaren na het sluiten van het programma gerealiseerd — kostenbesparingen stapelen zich op, klanttevredenheid verbetert geleidelijk of nieuwe capaciteiten worden na verloop van tijd benut. MSP vereist dat het Benefits Realisation Plan operationele eigenaren noemt die baten post-sluiting bijhouden en rapporteren, zodat verantwoordelijkheid niet verdwijnt wanneer het programmateam uiteenvalt.',
        },
        {
          id: 'pm-exam-q16',
          question: 'A programme vs project portfolio: which statement BEST describes the key difference?',
          questionNL: 'Programma vs projectportfolio: welke uitspraak beschrijft het BESTE het belangrijkste verschil?',
          options: [
            'A programme always contains more projects than a portfolio',
            'A portfolio maximises overall organisational value across a collection of initiatives; a programme coordinates related work to achieve a specific transformational outcome',
            'A portfolio is managed by a Programme Manager; a programme is managed by a Portfolio Director',
            'There is no meaningful difference — both terms refer to groups of projects',
          ],
          optionsNL: [
            'Een programma bevat altijd meer projecten dan een portfolio',
            'Een portfolio maximaliseert de algehele organisatorische waarde over een verzameling initiatieven; een programma coördineert gerelateerd werk om een specifiek transformatieresultaat te bereiken',
            'Een portfolio wordt beheerd door een Programme Manager; een programma wordt beheerd door een Portfolio Director',
            'Er is geen zinvol verschil — beide termen verwijzen naar groepen projecten',
          ],
          correctAnswer: 1,
          explanation: 'A portfolio is a strategic selection mechanism — it prioritises and balances a mix of projects and programmes to maximise value to the organisation. A programme is a coordinated delivery mechanism — it manages related work to achieve a specific beneficial change. Both govern multiple projects, but their purpose and scope are fundamentally different.',
          explanationNL: 'Een portfolio is een strategisch selectiemechanisme — het prioriteert en balanceert een mix van projecten en programma\'s om de waarde voor de organisatie te maximaliseren. Een programma is een gecoördineerd leveringsmechanisme — het beheert gerelateerd werk om een specifieke gunstige verandering te bereiken. Beide besturen meerdere projecten, maar hun doel en scope zijn fundamenteel verschillend.',
        },
        {
          id: 'pm-exam-q17',
          question: 'The Programme Manager in MSP is primarily responsible for:',
          questionNL: 'De Programme Manager in MSP is primair verantwoordelijk voor:',
          options: [
            'Holding the corporate investment authority for the programme Business Case',
            'Day-to-day leadership and management of the programme, coordinating component projects and ensuring delivery aligns with the Blueprint',
            'Embedding organisational change and ensuring benefit realisation in the affected business units',
            'Approving all changes to component project scope and budgets',
          ],
          optionsNL: [
            'Het houden van de bedrijfsinvesteringsautoriteit voor de programmabusiness case',
            'Dagelijkse leiding en beheer van het programma, coördinatie van componentprojecten en zorgen dat levering aansluit bij de Blueprint',
            'Organisatieverandering verankeren en zorgen voor batenrealisatie in de betrokken bedrijfseenheden',
            'Alle wijzigingen in scope en budgetten van componentprojecten goedkeuren',
          ],
          correctAnswer: 1,
          explanation: 'The Programme Manager focuses on delivery: coordinating component projects, managing programme-level risks and dependencies, ensuring the programme stays aligned to the Blueprint, and reporting to the SRO. The SRO holds investment accountability; the BCM handles change embedding and benefit realisation.',
          explanationNL: 'De Programme Manager richt zich op levering: coördineren van componentprojecten, beheren van risico\'s en afhankelijkheden op programmaniveau, zorgen dat het programma afgestemd blijft op de Blueprint en rapporteren aan de SRO. De SRO houdt investeringsverantwoordelijkheid; de BCM behandelt veranderingsverankering en batenrealisatie.',
        },
        {
          id: 'pm-exam-q18',
          question: 'When a Tranche Review in MSP concludes that the Business Case can no longer be justified, the correct action is:',
          questionNL: 'Wanneer een Tranche Review in MSP concludeert dat de Business Case niet langer gerechtvaardigd kan worden, is de juiste actie:',
          options: [
            'Continue into the next tranche and re-evaluate after 6 months',
            'Immediately replace the SRO and appoint a turnaround Programme Manager',
            'Close the programme or fundamentally restructure it so a viable Business Case can be re-established',
            'Transfer the remaining projects to portfolio management without closure formalities',
          ],
          optionsNL: [
            'Doorgaan naar de volgende tranche en na 6 maanden opnieuw beoordelen',
            'Onmiddellijk de SRO vervangen en een turnaround Programme Manager aanstellen',
            'Het programma sluiten of fundamenteel herstructureren zodat een levensvatbare Business Case opnieuw kan worden vastgesteld',
            'De resterende projecten overdragen aan portfoliobeheer zonder sluitingsformaliteiten',
          ],
          correctAnswer: 2,
          explanation: 'MSP is explicit: if the Business Case is no longer viable, the programme must be stopped or fundamentally restructured. Continuing an unjustifiable programme is a failure of governance. This rule is one of the key differences between MSP\'s governance rigour and informal programme management practice.',
          explanationNL: 'MSP is expliciet: als de Business Case niet langer levensvatbaar is, moet het programma worden gestopt of fundamenteel geherstructureerd. Doorgaan met een niet te rechtvaardigen programma is een falen van governance. Deze regel is een van de belangrijkste verschillen tussen de governance-striktheid van MSP en informele programmamanagementpraktijk.',
        },
        {
          id: 'pm-exam-q19',
          question: 'Lessons Learned at programme closure in MSP should PRIMARILY be:',
          questionNL: 'Lessen Geleerd bij programmasluiting in MSP moeten PRIMAIR:',
          options: [
            'Kept confidential within the programme team to protect individual reputations',
            'Published and actively shared with the PMO and future programme leaders to improve organisational capability',
            'Summarised in one slide in the final Steering Committee deck and then archived',
            'Only recorded if the programme missed its original targets',
          ],
          optionsNL: [
            'Vertrouwelijk blijven binnen het programmateam om individuele reputaties te beschermen',
            'Gepubliceerd en actief gedeeld met de PMO en toekomstige programmaleiders om de organisatorische capaciteit te verbeteren',
            'Samengevat in één dia in het eindrapport van het Steering Committee en daarna gearchiveerd',
            'Alleen geregistreerd als het programma zijn oorspronkelijke doelstellingen heeft gemist',
          ],
          correctAnswer: 1,
          explanation: 'MSP treats Lessons Learned as an organisational asset, not a personal reflection exercise. The intent is institutional learning: lessons should be presented to PMO, incorporated into updated standards and templates, and briefed to teams of upcoming programmes. This is how organisations improve their programme management capability over time.',
          explanationNL: 'MSP behandelt Lessen Geleerd als een organisatorisch actief, niet als een persoonlijke reflectieoefening. De bedoeling is institutioneel leren: lessen moeten worden gepresenteerd aan de PMO, worden opgenomen in bijgewerkte normen en sjablonen en worden gecommuniceerd aan teams van aankomende programma\'s. Dit is hoe organisaties hun programmamanagementcapaciteit in de loop van de tijd verbeteren.',
        },
        {
          id: 'pm-exam-q20',
          question: 'Risk management at programme level in MSP differs from project-level risk management because:',
          questionNL: 'Risicobeheer op programmaniveau in MSP verschilt van risicobeheer op projectniveau omdat:',
          options: [
            'Programmes do not maintain risk registers — only component projects do',
            'Programme-level risks focus on strategic threats to benefit delivery and transformational outcomes, not just project delivery risk',
            'Risk ownership at programme level is always the responsibility of the Programme Office',
            'Programme risks are always financial; project risks are always technical',
          ],
          optionsNL: [
            'Programma\'s houden geen risicoregisters bij — alleen componentprojecten doen dat',
            'Risico\'s op programmaniveau richten zich op strategische bedreigingen voor batenlevering en transformationele resultaten, niet alleen op projectleveringsrisico',
            'Risico-eigenaarschap op programmaniveau is altijd de verantwoordelijkheid van het Programme Office',
            'Programmrisico\'s zijn altijd financieel; projectrisico\'s zijn altijd technisch',
          ],
          correctAnswer: 1,
          explanation: 'Programme-level risk management looks beyond project delivery risk to encompass strategic risk (will the strategy change?), benefits risk (will the benefits be realised?), change risk (will the organisation absorb the change?), and dependency risk (if one component fails, which benefits collapse?). These systemic risks cannot be managed at project level alone.',
          explanationNL: 'Risicobeheer op programmaniveau kijkt verder dan projectleveringsrisico om strategisch risico (zal de strategie veranderen?), batenrisico (zullen de baten worden gerealiseerd?), veranderingsrisico (zal de organisatie de verandering absorberen?) en afhankelijkheidsrisico (als één component faalt, welke baten vallen dan weg?) te omvatten. Deze systemische risico\'s kunnen niet alleen op projectniveau worden beheerd.',
        },
      ],
    },
    {
      id: 'pgm-l16',
      title: 'Certificate',
      titleNL: 'Certificaat',
      type: 'certificate',
      duration: '0:00',
      videoUrl: '',
      icon: 'Award',
    },
  ],
};

export const programManagementModules: Module[] = [module1, module2, module3];

export const programManagementCourse: Course = {
  id: 'program-management-pro',
  title: 'Program Management Professional',
  titleNL: 'Programma Management Professional',
  description: 'Master program lifecycle, benefits management, governance and strategic alignment for enterprise-level initiatives.',
  descriptionNL: 'Beheers de programmalevenscyclus, benefits management, governance en strategische afstemming voor enterprise-initiatieven.',
  icon: Layers,
  color: BRAND.purple,
  gradient: `linear-gradient(135deg, ${BRAND.purple}, #818CF8)`,
  category: 'program',
  methodology: 'program-management',
  levels: 4,
  modules: programManagementModules.reduce((total, m) => total + m.lessons.length, 0),
  duration: 28,
  rating: 4.7,
  students: 4567,
  tags: ['Program Management', 'Benefits', 'Governance', 'Portfolio', 'Strategic Alignment'],
  tagsNL: ['Programmamanagement', 'Benefits', 'Governance', 'Portfolio', 'Strategische Afstemming'],
  instructor: instructors.erik,
  featured: false,
  bestseller: false,
  new: true,
  freeForCustomers: true,
  certificate: true,
  whatYouLearn: [
    'Lead complex multi-project programs',
    'Manage benefits across project lifecycles',
    'Align programs to organizational strategy',
    'Implement effective governance structures',
    'Navigate stakeholder politics at scale',
  ],
  whatYouLearnNL: [
    'Leid complexe multi-project programma\'s',
    'Manage benefits over project levenscycli',
    'Stem programma\'s af op organisatiestrategie',
    'Implementeer effectieve governance structuren',
    'Navigeer stakeholder politiek op schaal',
  ],
  requirements: ['3+ years project management experience', 'Understanding of organizational strategy', 'Experience with complex initiatives'],
  requirementsNL: ['3+ jaar projectmanagement ervaring', 'Begrip van organisatiestrategie', 'Ervaring met complexe initiatieven'],
  targetAudience: [
    'Senior Project Managers moving to program level',
    'Program Managers seeking formal training',
    'PMO leaders managing program portfolios',
    'Strategic initiative leaders',
  ],
  targetAudienceNL: [
    'Senior Projectmanagers die naar programma niveau gaan',
    'Programma Managers die formele training zoeken',
    'PMO leiders die programma portfolio\'s managen',
    'Strategische initiatief leiders',
  ],
  courseModules: programManagementModules,
};

export default programManagementCourse;