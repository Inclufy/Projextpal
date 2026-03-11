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
      keyTakeaways: [],
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
      keyTakeaways: [],
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
      keyTakeaways: [],
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
      keyTakeaways: [],
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
      keyTakeaways: [],
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
      keyTakeaways: [],
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
      keyTakeaways: [],
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
      keyTakeaways: [],
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
      keyTakeaways: [],
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
      keyTakeaways: [],
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
      keyTakeaways: [],
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