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
      quiz: [],
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
      quiz: [],
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