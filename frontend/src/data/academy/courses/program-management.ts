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
      transcriptNL: `Welkom bij Programma Management Professional! Laten we beginnen met het begrijpen van de cruciale verschillen tussen projecten, programma\'s en portfolio's - deze onderscheidingen zijn fundamenteel voor succes.

**De Drie Niveaus van Werk**

Organisaties structureren hun werk in drie verschillende niveaus:

1. **Projecten** - Individuele initiatieven
2. **Programma's** - Groepen van gerelateerde projecten
3. **Portfolio's** - Collecties van programma\'s en projecten

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

Een programma is een groep van gerelateerde projecten, dochter programma\'s en programma activiteiten gemanaged op een gecoördineerde manier om benefits te verkrijgen die niet beschikbaar zijn door ze individueel te managen.

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

Een portfolio is een collectie van projecten, programma\'s, dochter portfolio's en operaties gemanaged als een groep om strategische doelstellingen te bereiken.

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
Identificeer en manage onderlinge afhankelijkheden en risico\'s over projecten.

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

Anders dan projecten vereisen programma\'s:
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
- Gebruik programma\'s wanneer benefits meerdere projecten omspannen

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

Anders dan projecten met hun duidelijke fasen, cyclen programma\'s door:

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
   - Hoe risico\'s gemanaged worden
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

Dit is waarom programma\'s doorgaan na project voltooiing.

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
      transcriptNL: `Waarom bestaat een programma überhaupt? Het antwoord is altijd hetzelfde: om benefits te realiseren die individuele projecten niet kunnen leveren. Toch is benefits management in de praktijk een van de meest verwaarloosde disciplines. Projecten worden afgerond, budgetten worden opgemaakt, maar de vraag "hebben we de beloofde waarde ook echt geleverd?" blijft vaak onbeantwoord.

**Outputs versus Outcomes**

Een fundamenteel onderscheid uit de PMI Standard for Program Management (5e editie): projecten leveren outputs, programma\'s realiseren outcomes. Een output is een tastbaar resultaat — een nieuw ERP-systeem, een gebouwde fabriek, een gelanceerde app. Een outcome is de meetbare verandering die dat resultaat teweegbrengt — 20% lagere operationele kosten, 35% hogere klanttevredenheid, of drie maanden snellere time-to-market.

De programmamanager is verantwoordelijk voor de outcomes. De projectmanager is verantwoordelijk voor de outputs. Dit onderscheid bepaalt de hele beheersingslogica van een programma.

**Het Benefits Realization Plan**

Het Benefits Realization Plan (BRP) is het centrale stuurinstrument. Het wordt opgesteld tijdens de definitiefase en bevat voor elke benefit:
- Een heldere omschrijving van de verwachte verandering
- De toegewezen benefit-eigenaar (de lijnmanager die de benefit daadwerkelijk moet realiseren)
- De KPI of meetindicator
- De nulmeting (baseline) vóór het programma
- De streefwaarde na realisatie
- De verwachte realisatiedatum

**Het Benefits Register**

Waar het BRP het plan is, is het Benefits Register het levende opvolgingsinstrument. Het wordt gedurende het hele programma bijgehouden en toont de actuele voortgang per benefit. Wijkt een benefit af van het verwachte pad, dan signaleert de programmamanager dit tijdig aan de stuurgroep.

**Voorbeeld: Digitale Transformatie**

Stel: een retailbedrijf start een programma "Digitale Klantervaring". De outputs zijn een nieuwe webshop, een loyaliteitsapp en een geïntegreerd CRM-systeem. De benefits zijn:
- Stijging online omzet met 25% binnen 18 maanden na lancering (benefit-eigenaar: Commercieel Directeur)
- Daling klantenservicekosten met 15% door zelfbediening (benefit-eigenaar: Operations Manager)

Deze benefits realiseren pas nadat alle drie de componentprojecten zijn opgeleverd én nadat klanten de nieuwe kanalen zijn gaan gebruiken. De programmamanager blijft na de projectoplevering actief om te meten of de streefwaarden worden bereikt.

**Veelgemaakte fout: benefits verwisselen met deliverables**

In de praktijk zien stuurgroepen deliverables (de uitgerolde app) soms als het bewijs van succes. Dat is een gevaarlijke vergissing. Een uitgerolde app die niemand gebruikt, levert geen benefit. Benefits vereisen adoptie, gedragsverandering en operationele inbedding — en die verantwoordelijkheid ligt bij de programmamanager en de benefit-eigenaren, niet bij de projectmanager.

**Key Takeaways**`,
      keyTakeaways: [
        'Programs deliver outcomes (benefits), not just outputs — this distinction defines the program manager\'s accountability',
        'The Benefits Realization Plan assigns each benefit an owner, a KPI, a baseline, and a target date — created during the definition phase',
        'The Benefits Register is a living tracker updated throughout the program to monitor realization progress',
        'Benefits typically emerge after project delivery — the program continues until outcomes are embedded in operations',
      ],
      keyTakeawaysEN: [
        'Programs deliver outcomes (benefits), not just outputs — this distinction defines the program manager\'s accountability',
        'The Benefits Realization Plan assigns each benefit an owner, a KPI, a baseline, and a target date — created during the definition phase',
        'The Benefits Register is a living tracker updated throughout the program to monitor realization progress',
        'Benefits typically emerge after project delivery — the program continues until outcomes are embedded in operations',
      ],
      keyTakeawaysNL: [
        'Programma\'s leveren outcomes (benefits), niet alleen outputs — dit onderscheid definieert de verantwoordelijkheid van de programmamanager',
        'Het Benefits Realization Plan wijst per benefit een eigenaar, een KPI, een nulmeting en een streefdatum toe — opgesteld tijdens de definitiefase',
        'Het Benefits Register is een levend opvolgingsinstrument dat gedurende het hele programma wordt bijgehouden',
        'Benefits verschijnen typisch na de projectoplevering — het programma loopt door totdat outcomes zijn ingebed in de bedrijfsvoering',
      ],
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
      transcriptNL: `Zonder heldere governance valt een programma uiteen in een verzameling onafhankelijke projecten die ieder hun eigen richting op gaan. Governance is de structuur die zorgt dat besluiten op het juiste niveau worden genomen, dat verantwoordelijkheden helder zijn, en dat het programma op koers blijft richting de beoogde benefits.

**De drie lagen van programma-governance**

De PMI Standard for Program Management onderscheidt drie bestuurslagen die elk een eigen rol vervullen.

De **Stuurgroep** (Steering Committee of Program Board) opereert op strategisch niveau. Zij bewaken de afstemming van het programma op de organisatiestrategie, nemen besluiten die de bevoegdheidsgrenzen van de programmamanager overschrijden, en keuren wijzigingen in programma-scope of -budget goed. Een effectieve stuurgroep vergadert niet wekelijks over details, maar beslist periodiek over richting en prioriteiten.

De **Programmamanager** vormt de uitvoerende laag. Hij of zij coördineert de componentprojecten, bewaakt de samenhang, lost interdependentieconflicten op, en rapporteert aan de stuurgroep over voortgang en risico\'s.

De **Projectmanagers** sturen hun eigen componentprojecten aan, rapporteren aan de programmamanager, en escaleren alleen die risico\'s en issues die de programma-benefits kunnen raken.

**Rollen in het Programma Board (MSP-perspectief)**

Managing Successful Programmes (MSP) beschrijft drie kernrollen in het Programme Board:
- **Senior Responsible Owner (SRO)**: eindverantwoordelijk voor het programma en het realiseren van de benefits; aanspreekpunt richting de organisatie
- **Senior User**: vertegenwoordigt de belangen van diegenen die de benefits zullen ontvangen (de "klant")
- **Senior Supplier**: vertegenwoordigt de leveranciers van capaciteit en expertise die de outputs produceren

Deze drie rollen samen borgen dat zowel de vraagzijde (wat hebben we nodig?) als de aanbodzijde (wat kunnen we leveren?) vertegenwoordigd zijn in besluiten.

**Besluitvormingsprotocol: escalatiedrempels**

Goede governance definieert vooraf welke besluiten op welk niveau worden genomen. Een gebruikelijk model:
- Projectmanager: besluiten binnen projectbudget ±10% en scope zonder programma-impact
- Programmamanager: besluiten tot programmabudget ±5% en herprioritering van resources binnen het programma
- Stuurgroep: alles buiten die grenzen, plus strategische koerscorrecties en programma-afbrekingsbesluiten

**Voorbeeld: Infrastructuurprogramma gemeente**

Een gemeente start een programma "Openbaar vervoer 2030" met zes deelprojecten (tramlijnen, busdepots, reizigersinformatie, etc.). De stuurgroep bestaat uit de wethouder Mobiliteit (SRO), een vertegenwoordiger van de reizigers (Senior User) en de directeur van het aannemingsconsortium (Senior Supplier). De programmamanager lost wekelijks interdependentieconflicten op tussen de trambaan- en nutsvoorzieningprojecten. Beslissingen over budgetoverschrijdingen boven 3% gaan naar de stuurgroep.

**Waarschuwing: governance-overhead**

Governance heeft een kostprijs. Te veel lagenstructuur vertraagt besluiten. Het principe: governancestructuur moet proportioneel zijn aan de omvang en het risicoprofiel van het programma. Een twee-jarig programma van €2M heeft een andere governancebehoefte dan een vijf-jarig transformatieprogramma van €50M.

**Key Takeaways**`,
      keyTakeaways: [
        'Program governance operates at three levels: Steering Committee (strategic), Program Manager (coordination), Project Managers (delivery)',
        'MSP defines three mandatory Programme Board roles: Senior Responsible Owner, Senior User, and Senior Supplier',
        'Effective governance pre-defines escalation thresholds so decisions are made at the right level without unnecessary delays',
        'Governance structure must be proportional to program scale and risk — over-engineering governance creates its own overhead',
      ],
      keyTakeawaysEN: [
        'Program governance operates at three levels: Steering Committee (strategic), Program Manager (coordination), Project Managers (delivery)',
        'MSP defines three mandatory Programme Board roles: Senior Responsible Owner, Senior User, and Senior Supplier',
        'Effective governance pre-defines escalation thresholds so decisions are made at the right level without unnecessary delays',
        'Governance structure must be proportional to program scale and risk — over-engineering governance creates its own overhead',
      ],
      keyTakeawaysNL: [
        'Programma-governance kent drie niveaus: Stuurgroep (strategisch), Programmamanager (coördinatie), Projectmanagers (uitvoering)',
        'MSP definieert drie verplichte rollen in het Programme Board: Senior Responsible Owner, Senior User en Senior Supplier',
        'Effectieve governance definieert vooraf escalatiedrempels zodat besluiten op het juiste niveau worden genomen',
        'Governancestructuur moet proportioneel zijn aan de omvang en het risicoprofiel van het programma',
      ],
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
        // TODO: lesson transcripts in this module are stubs — questions are PgM-canonical and ready for transcript expansion
        {
          id: 'pgm-q1',
          question: 'Wat is de meest accurate definitie van een programma volgens de PMI Standard for Program Management?',
          options: [
            'Een groot project met een uitgebreid budget en team',
            'Een groep gerelateerde projecten, deelprogramma\'s en programma-activiteiten die gecoördineerd worden om benefits te realiseren die niet beschikbaar zijn bij individueel management',
            'Een verzameling van projecten en programma\'s gericht op strategische doelstellingen van de organisatie',
            'Een tijdelijke onderneming om een uniek product, dienst of resultaat te leveren',
          ],
          correctAnswer: 1,
          explanation: 'Per de PMI Standard for Program Management (5e editie) is een programma een groep gerelateerde projecten, deelprogramma\'s en programma-activiteiten, gecoördineerd beheerd om benefits te behalen die niet beschikbaar zijn bij individueel management. Optie A beschrijft een misvatting (een programma is géén groot project). Optie C beschrijft een portfolio. Optie D beschrijft een project.',
        },
        {
          id: 'pgm-q2',
          question: 'Wat is het fundamentele verschil tussen een projectresultaat (output) en een programma-benefit (outcome)?',
          options: [
            'Outputs zijn duurder en nemen meer tijd in beslag dan outcomes',
            'Een output is een tastbare oplevering (bijv. een nieuw CRM-systeem); een outcome is de waardeverandering die daardoor ontstaat (bijv. 30% kortere verwerkingstijd)',
            'Outcomes worden beheerd door de projectmanager; outputs door de programmamanager',
            'Er is geen betekenisvol onderscheid — beide termen beschrijven wat een project oplevert',
          ],
          correctAnswer: 1,
          explanation: 'Een output is een tastbaar resultaat dat een project oplevert, zoals een geïmplementeerd systeem of een gebouw. Een outcome (benefit) is de meetbare verbetering die de organisatie ervaart doordat die output in gebruik wordt genomen — bijv. hogere klanttevredenheid of lagere operationele kosten. De programmamanager is verantwoordelijk voor het realiseren van outcomes; projectmanagers zijn verantwoordelijk voor het leveren van outputs.',
        },
        {
          id: 'pgm-q3',
          question: 'In welke fase van de programma-levenscyclus wordt de Benefits Realization Plan voor het eerst opgesteld?',
          options: [
            'Tijdens de uitvoeringsfase, nadat de eerste projecten zijn afgerond',
            'Tijdens de afsluitingsfase, om te bevestigen welke benefits zijn gerealiseerd',
            'Tijdens de definitiefase / programma-opzet, voordat de componentprojecten van start gaan',
            'Uitsluitend nadat de stuurgroep (steering committee) de programmacharter heeft goedgekeurd',
          ],
          correctAnswer: 2,
          explanation: 'Het Benefits Realization Plan wordt opgesteld tijdens de definitie- en opzetfase van het programma, voordat de componentprojecten worden geïnitieerd. Dit plan beschrijft hoe benefits worden geïdentificeerd, toegewezen aan eigenaren, gemeten en duurzaam geborgd. Het is een kerndocument dat de gehele programma-uitvoering stuurt.',
        },
        {
          id: 'pgm-q4',
          question: 'Welke uitspraak over de rol van de programmamanager is correct?',
          options: [
            'De programmamanager beheert de dagelijkse uitvoering van elk afzonderlijk project binnen het programma',
            'De programmamanager is verantwoordelijk voor de benefits-realisatie; projectmanagers zijn verantwoordelijk voor de opleveringen van hun projecten',
            'De programmamanager en de projectmanager zijn uitwisselbare rollen met dezelfde verantwoordelijkheden op een ander schaalniveau',
            'De programmamanager rapporteert aan de projectmanagers die de componentprojecten uitvoeren',
          ],
          correctAnswer: 1,
          explanation: 'Per de PMI Standard for Program Management is de programmamanager verantwoordelijk voor het orkestreren van de programmacomponenten zodat de beoogde benefits worden gerealiseerd. Projectmanagers zijn verantwoordelijk voor de dagelijkse uitvoering en de opleveringen van hun projecten. Een programmamanager is géén "super-projectmanager" — de focus verschuift van deliverables naar outcomes.',
        },
        {
          id: 'pgm-q5',
          question: 'Waarom gaat een programma typisch door nadat het laatste componentproject is afgerond?',
          options: [
            'Omdat de administratieve afsluiting van contracten altijd meerdere maanden duurt',
            'Omdat benefits doorgaans pas realiseren ná de oplevering van projecten en de programmamanager verantwoordelijk blijft voor de borging van die benefits in de bedrijfsvoering',
            'Omdat de stuurgroep wettelijk verplicht is het programma minimaal zes maanden open te houden',
            'Omdat projectmanagers hun eindrapportages nog moeten afleveren',
          ],
          correctAnswer: 1,
          explanation: 'Een fundamenteel kenmerk van programmamanagement is dat benefits time-lagged zijn: ze verschijnen pas nadat de geleverde outputs zijn ingebed in de organisatie en in gebruik zijn genomen. De programmamanager blijft verantwoordelijk voor het monitoren, borgen en overdragen van die benefits aan de reguliere bedrijfsvoering — dit is precies waarom een programma een langere horizon heeft dan een project.',
        },
        {
          id: 'pgm-q6',
          question: 'Een organisatie besluit drie afzonderlijke IT-projecten samen te brengen in één programma. Welk criterium rechtvaardigt deze keuze het best?',
          options: [
            'De drie projecten hebben dezelfde projectmanager',
            'De drie projecten hebben een gezamenlijk budget van meer dan €5 miljoen',
            'De drie projecten leveren elk afzonderlijk outputs, maar alleen in samenhang realiseren ze de strategische benefit van end-to-end procesautomatisering',
            'De drie projecten lopen langer dan twaalf maanden',
          ],
          correctAnswer: 2,
          explanation: 'Het doorslaggevende criterium voor het bundelen van projecten in een programma is dat de gecombineerde benefits niet beschikbaar zijn bij individueel projectmanagement. Gedeeld budget of dezelfde PM zijn bestuurlijke overwegingen, geen inhoudelijke rechtvaardiging. De strategische benefit die alleen door coördinatie wordt bereikt, is de essentie van programmamanagement.',
        },
        {
          id: 'pgm-q7',
          question: 'Welk document vormt de formele rechtvaardiging voor het bestaan van een programma en bevat de verwachte benefits, kosten en strategische afstemming?',
          options: [
            'Programma Management Plan',
            'Benefits Register',
            'Programma Business Case',
            'Programma Roadmap',
          ],
          correctAnswer: 2,
          explanation: 'De Programma Business Case is het kerndocument dat de strategische rechtvaardiging biedt voor het programma. Het bevat de verwachte benefits, de geschatte kosten, de onderbouwing van de strategische afstemming en een risico-assessment. Het Programma Management Plan beschrijft hoe het programma wordt uitgevoerd. De Benefits Register volgt de voortgang van benefits. De Roadmap toont de tijdlijn van componenten.',
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
      transcriptNL: `Een programma dat niet is verankerd in de organisatiestrategie is slechts een kostbare coördinatie-oefening. Strategische afstemming is geen éénmalige handeling bij de start — het is een doorlopende verantwoordelijkheid van de programmamanager gedurende de hele looptijd van het programma.

**Van strategie naar programma: de vertaalslag**

Organisaties formuleren hun strategie in termen van doelstellingen: marktleiderschap, kostenreductie, klanttevredenheid, of operationele excellentie. Een programma vertaalt deze abstracte strategische doelstellingen naar een concrete set van samenhangende projecten en benefits. De PMI Standard for Program Management (5e editie) beschrijft dit als de "programma-businessrechtvaardiging": het programma bestaat zolang het een traceerbare bijdrage levert aan strategische doelstellingen.

**Het Programma Business Case als strategisch anker**

De Programma Business Case is meer dan een financiële berekening. Het document bevat de expliciete koppeling tussen elke verwachte benefit en de strategische doelstelling waaraan die benefit bijdraagt. Wanneer de strategie gedurende de looptijd van het programma verandert — wat bij langlopende programma\'s onvermijdelijk is — beoordeelt de stuurgroep periodiek of de Business Case nog steeds geldig is. Als de strategische context fundamenteel wijzigt, kan het programma worden bijgesteld of vroegtijdig worden gesloten.

**Strategische alignment in de praktijk: een voorbeeld**

Een logistiek bedrijf formuleert de strategische doelstelling "next-day delivery voor 95% van de binnenlandse orders". Dit vertaalt naar een programma "Logistieke Versnelling" met drie componentprojecten: automatisering van het sorteercentrum, uitbreiding van het bezorgnetwerk en implementatie van een real-time trackingsysteem. De benefit die de strategische doelstelling rechtstreeks realiseert — 95% next-day delivery — is de programma-benefit. Elk project levert een output die bijdraagt aan die benefit, maar geen enkel project levert de benefit op zichzelf.

**Strategieverandering en programma-aanpassing**

Stel dat dezelfde logistieke onderneming halverwege het programma besluit te focussen op same-day delivery in stedelijke gebieden in plaats van landelijke dekking. De programmamanager heeft dan twee opties: het programma bijsturen (scope aanpassen, componentprojecten herprioriteren) of de Business Case opnieuw voorleggen aan de stuurgroep. Doorgaan zonder aanpassing is het ergste scenario — het programma levert dan benefits die de organisatie niet meer nodig heeft.

**Periodieke strategische review**

Goede programma-governance voorziet in een periodieke strategische review — bij MSP aangeduid als de "Tranche Review" — waarbij de stuurgroep beoordeelt of het programma nog steeds de juiste bijdrage levert aan de strategie. Dit is het moment om bij te sturen voordat resources worden verspild aan irrelevante deliverables.

**Key Takeaways**`,
      keyTakeaways: [
        'A program\'s Business Case must show an explicit traceable link between each expected benefit and a strategic organizational objective',
        'Strategic alignment is not a one-time activity at program start — it must be reviewed periodically throughout the program lifecycle',
        'When organizational strategy changes, the program must be reassessed: adapt scope, replan, or close rather than continue delivering irrelevant outputs',
        'The Program Manager\'s role includes actively monitoring strategic context and escalating misalignment to the Steering Committee',
      ],
      keyTakeawaysEN: [
        'A program\'s Business Case must show an explicit traceable link between each expected benefit and a strategic organizational objective',
        'Strategic alignment is not a one-time activity at program start — it must be reviewed periodically throughout the program lifecycle',
        'When organizational strategy changes, the program must be reassessed: adapt scope, replan, or close rather than continue delivering irrelevant outputs',
        'The Program Manager\'s role includes actively monitoring strategic context and escalating misalignment to the Steering Committee',
      ],
      keyTakeawaysNL: [
        'De Programma Business Case moet een expliciete traceerbare koppeling tonen tussen elke verwachte benefit en een strategische organisatiedoelstelling',
        'Strategische afstemming is geen eenmalige activiteit bij de start — het moet periodiek worden beoordeeld gedurende de hele programmalevencyclus',
        'Wanneer de organisatiestrategie verandert, moet het programma worden heroverwogen: scope aanpassen, herplannen of sluiten in plaats van irrelevante outputs te blijven leveren',
        'De programmamanager monitort actief de strategische context en escaleert misalignment naar de stuurgroep',
      ],
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
      transcriptNL: `Programma's mislukken zelden door technische redenen. Ze mislukken door mensen: stakeholders die niet zijn meegenomen, weerstand die niet vroegtijdig is gesignaleerd, of belangen die onverenigbaar blijken te zijn. Stakeholder engagement op programmaniveau verschilt fundamenteel van stakeholderbeheer op projectniveau — de schaal is groter, de belangen zijn complexer, en de politieke dimensie is aanzienlijk.

**Stakeholderidentificatie op programmaniveau**

Bij een programma zijn stakeholders niet alleen de directe gebruikers van een projectresultaat. Ze omvatten:
- De stuurgroep en sponsoren (strategisch niveau)
- Projectmanagers en projectteams (uitvoerend niveau)
- Lijnmanagers wier organisatie door het programma wordt geraakt
- Klanten en eindgebruikers van de te realiseren benefits
- Externe partijen: leveranciers, regelgevers, partners
- Medewerkers die te maken krijgen met organisatieverandering

De programmamanager stelt een **Stakeholder Register** op dat voor elke stakeholder de belangen, de invloed, de verwachte houding (voor/neutraal/tegen) en de gewenste betrokkenheidsstrategie documenteert.

**Interesse-invloedmatrix**

Een klassiek hulpmiddel is de interesse-invloedmatrix (power-interest grid). Stakeholders met hoge invloed en hoge interesse vereisen intensieve betrokkenheid en regelmatige persoonlijke communicatie. Stakeholders met hoge invloed maar lage interesse dienen tevreden te worden gehouden via periodieke updates. Stakeholders met lage invloed maar hoge interesse worden geïnformeerd. De rest wordt gemonitord.

**Het Stakeholder Engagement Plan**

Het Stakeholder Engagement Plan beschrijft per groep: wat de communicatiebehoefte is, welk kanaal wordt gebruikt, hoe frequent er contact is, en wie verantwoordelijk is voor de relatie. Op programmaniveau zijn meerdere communicatiestromen actief tegelijk — van stuurgroeprapportages tot nieuwsbrieven voor brede medewerkersbetrokkenheid.

**Weerstand als informatie**

Weerstand van stakeholders is geen obstakel — het is informatie. Een lijnmanager die sceptisch reageert op een programma-maatregel vertelt de programmamanager iets over onopgeloste belangen of onrealistische verwachtingen. De vaardigheid zit in het tijdig opsporen van weerstand en het omzetten ervan in constructieve betrokkenheid.

**Voorbeeld: ERP-programma bij een productiebedrijf**

Een productiebedrijf implementeert een ERP-programma met vijf deelprojecten. De CFO is de SRO (hoge invloed, hoge interesse). De afdelingshoofden Productie en Inkoop zijn cruciale Senior Users — zij ontvangen wekelijkse statusupdates en zijn betrokken bij acceptatietests. De vakbond is een stakeholder met hoge invloed en aanvankelijk lage interesse — hun betrokkenheid wordt vroegtijdig gezocht om arbeidsrechtelijke bezwaren voor te zijn. Door de vakbond in een vroeg stadium te informeren en hun input te verwerken in het transitieplan, wordt potentiële weerstand omgezet in gedeeld eigenaarschap.

**Key Takeaways**`,
      keyTakeaways: [
        'Program-level stakeholder engagement spans strategic, operational, and organizational change dimensions — far broader than project-level stakeholder management',
        'The Stakeholder Register documents each stakeholder\'s interests, influence, expected attitude, and planned engagement strategy',
        'The power-interest grid guides engagement intensity: high-power/high-interest stakeholders require intensive, regular personal communication',
        'Resistance from stakeholders is information — early identification and proactive engagement converts opponents into co-owners',
      ],
      keyTakeawaysEN: [
        'Program-level stakeholder engagement spans strategic, operational, and organizational change dimensions — far broader than project-level stakeholder management',
        'The Stakeholder Register documents each stakeholder\'s interests, influence, expected attitude, and planned engagement strategy',
        'The power-interest grid guides engagement intensity: high-power/high-interest stakeholders require intensive, regular personal communication',
        'Resistance from stakeholders is information — early identification and proactive engagement converts opponents into co-owners',
      ],
      keyTakeawaysNL: [
        'Stakeholder engagement op programmaniveau omvat strategische, operationele en organisatieveranderingsdimensies — veel breder dan op projectniveau',
        'Het Stakeholder Register documenteert per stakeholder de belangen, invloed, verwachte houding en geplande betrokkenheidsstrategie',
        'De macht-interesse matrix stuurt de intensiteit van betrokkenheid: hoge macht/hoge interesse vereist intensieve persoonlijke communicatie',
        'Weerstand van stakeholders is informatie — vroeg opsporen en proactief betrekken zet tegenstanders om in mede-eigenaren',
      ],
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
      transcriptNL: `De programma roadmap is het navigatie-instrument van de programmamanager. Het toont op hoog niveau welke componentprojecten en activiteiten wanneer worden uitgevoerd, hoe ze van elkaar afhangen, en op welke momenten benefits worden verwacht. Een roadmap is geen gedetailleerd projectplan — het is een strategisch overzicht dat de stuurgroep in staat stelt de koers te bewaken en bij te sturen.

**Wat staat er op een programma roadmap?**

Een programma roadmap bevat:
- De componentprojecten met hun geplande start- en einddata
- Mijlpalen die significant zijn voor de programma-benefits (niet voor elk intern projectresultaat)
- Tranches of fasen: clusters van werk die logisch samenhangen en worden afgesloten met een formele review
- Verwachte benefit-realisatiemomenten: wanneer wordt welke benefit meetbaar?
- Kritieke afhankelijkheden tussen componenten

**Tranches: de bouwstenen van de roadmap (MSP)**

Managing Successful Programmes (MSP) introduceert het begrip "tranche" als de centrale planningseenheid van een programma. Een tranche is een groep projecten en activiteiten die samen een coherente stap van nieuwe capaciteit opleveren aan de organisatie. Aan het einde van elke tranche vindt een formele End of Tranche Review plaats: de stuurgroep beoordeelt of de geleverde capaciteit correct is, of de Business Case nog steeds geldig is, en of het programma de volgende tranche in mag gaan.

Dit is conceptueel vergelijkbaar met een stage-gate bij projecten, maar op programmaniveau: de gate is niet alleen een kwaliteitscheck op deliverables, maar ook een strategische herbeoordeling.

**Afhankelijkheden visualiseren**

Een roadmap toont afhankelijkheden die op projectniveau niet zichtbaar zijn. Voorbeeld: het uitrollen van een klantportaal (Project B) kan pas beginnen nadat het CRM-systeem is geïmplementeerd (Project A). Als Project A vertraging oploopt, verschuift de hele cascade. De programmamanager gebruikt de roadmap om deze doorwerking proactief te signaleren en aan de stuurgroep te communiceren.

**Voorbeeld: Programma Roadmap "Smart City"**

Een gemeente start het programma "Smart City 2028" met vier componentprojecten:
- Tranche 1 (jaar 1): Sensorinfrastructuur uitrollen + Dataplatform bouwen
- Tranche 2 (jaar 2): Verkeersoptimalisatie implementeren + Energie-dashboard lanceren
- Tranche 3 (jaar 3): Integratieplatform voor burgerservices + Benefits-monitoring operationeel

Na Tranche 1 leviert de gemeente een functioneel dataplatform met sensordata — geen benefit op zichzelf, maar de essentiële bouwsteen voor de benefits in Tranche 2 en 3. De End of Tranche Review na jaar 1 beoordeelt of het platform kwalitatief en technisch gereed is om als fundament te dienen.

**Roadmap als communicatiemiddel**

De roadmap is ook een communicatiemiddel naar stakeholders. Een overzichtelijke roadmap toont investeerders, medewerkers en politieke beslissers wanneer ze wat kunnen verwachten. Overpromisen op de roadmap — benefits vroeg intekenen terwijl de projecten er nog niet klaar voor zijn — schaadt het vertrouwen en de geloofwaardigheid van het programma.

**Key Takeaways**`,
      keyTakeaways: [
        'The program roadmap provides a strategic overview of components, milestones, dependencies, and benefit realization points — it is not a detailed project schedule',
        'MSP tranches are planning horizons that end with a formal End of Tranche Review — a strategic gate where the Steering Committee reassesses the Business Case',
        'Cross-component dependencies are only visible at program level — the roadmap makes cascade effects of delays explicit and manageable',
        'The roadmap is a communication tool for stakeholders: it signals when benefits will become measurable, building trust and accountability',
      ],
      keyTakeawaysEN: [
        'The program roadmap provides a strategic overview of components, milestones, dependencies, and benefit realization points — it is not a detailed project schedule',
        'MSP tranches are planning horizons that end with a formal End of Tranche Review — a strategic gate where the Steering Committee reassesses the Business Case',
        'Cross-component dependencies are only visible at program level — the roadmap makes cascade effects of delays explicit and manageable',
        'The roadmap is a communication tool for stakeholders: it signals when benefits will become measurable, building trust and accountability',
      ],
      keyTakeawaysNL: [
        'De programma roadmap biedt een strategisch overzicht van componenten, mijlpalen, afhankelijkheden en benefit-realisatiemomenten — het is geen gedetailleerd projectrooster',
        'MSP-tranches zijn planningshorizonnen die eindigen met een formele End of Tranche Review — een strategische gate waarbij de stuurgroep de Business Case herbeoordelt',
        'Component-overschrijdende afhankelijkheden zijn alleen zichtbaar op programmaniveau — de roadmap maakt cascade-effecten van vertragingen expliciet en beheersbaar',
        'De roadmap is een communicatiemiddel voor stakeholders: het signaleert wanneer benefits meetbaar worden en bouwt vertrouwen en verantwoording op',
      ],
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
      transcriptNL: `Financieel management op programmaniveau is complexer dan op projectniveau, omdat het gaat om het besturen van een meerjarenbegroting over meerdere componentprojecten heen, met gelijktijdige aandacht voor kosten, waarde en de financiële onderbouwing van de benefits.

**De programmabegroting: structuur en flexibiliteit**

Een programma kent doorgaans een overkoepelende programmabegroting die is onderverdeeld in:
- Componentbudgetten per project (gedelegeerd aan projectmanagers)
- Programma-managementkosten (PMO, stuurgroep, communicatie)
- Reserves: een management reserve voor onvoorziene programma-niveau risico\'s
- Benefits-investeringen: kosten van change management, training en adoptie die benefits mogelijk maken

De programmamanager is geen boekhouder — maar wel de verantwoordelijke voor de financiële integriteit van het programma als geheel. Dat betekent: tijdig signaleren van budgetafwijkingen, bewaken dat de Business Case financieel gezond blijft, en onderbouwen dat de verwachte benefits de programmakosten rechtvaardigen.

**Tranche-financiering**

Binnen een tranche-gebaseerde aanpak wordt financiering per tranche goedgekeurd. Dit geeft de stuurgroep controlemomenten: als Tranche 1 de verwachte capaciteit niet levert, wordt financiering voor Tranche 2 niet automatisch vrijgegeven. Dit is een bewuste governancemaatregel om financieel risico te beheersen bij programma\'s met een lange horizon.

**Business Case financieel bewaken**

De financiële onderbouwing van de Business Case steunt op twee pijlers: de kosten (programma-investering) en de baten (de gekwantificeerde benefits). Gedurende het programma worden beide bijgehouden:
- Kosten: actuele uitgaven vs. begroting
- Baten: gerealiseerde benefits vs. verwachte benefits (met tijdsvertraging)

Een veelgemaakte fout is dat de Business Case alleen bij de start wordt opgesteld en daarna niet meer wordt bijgewerkt. Een gezonde programmagovernance schrijft voor dat de Business Case minimaal bij elke tranche-review financieel wordt herbeoordeeld.

**Voorbeeld: Business Case herberekening bij scope-uitbreiding**

Een productiebedrijf voert een programma "Digitale Productievloer" uit. Halverwege Tranche 2 wordt een nieuw componentproject toegevoegd: een AI-gestuurde kwaliteitscontrole. De programmamanager herberekent de Business Case: de extra investering van €800.000 levert naar verwachting €2,1 miljoen kostenreductie op defecten per jaar. De stuurgroep keurt de scope-uitbreiding goed op basis van de bijgewerkte Business Case — niet op basis van enthousiasme over de technologie.

**Financiële risicoreserves**

De programmamanager beheert een management reserve — budget dat niet is toebedeeld aan specifieke componenten maar beschikbaar is voor risico\'s op programmaniveau. Dit verschilt van de contingency reserves die projectmanagers beheren voor projectrisico's. De management reserve mag alleen worden aangewend met goedkeuring van de stuurgroep.

**Key Takeaways**`,
      keyTakeaways: [
        'Program budgets are structured in component budgets, program management costs, management reserves, and benefits-enabling investments',
        'Tranche-based funding gives the Steering Committee deliberate control gates — financing for the next tranche is only released when the current tranche delivers',
        'The Business Case financial model must be updated at every tranche review — a Business Case that is only built at start becomes misleading as costs and benefits evolve',
        'Program-level management reserves are distinct from project contingency reserves and require Steering Committee approval to access',
      ],
      keyTakeawaysEN: [
        'Program budgets are structured in component budgets, program management costs, management reserves, and benefits-enabling investments',
        'Tranche-based funding gives the Steering Committee deliberate control gates — financing for the next tranche is only released when the current tranche delivers',
        'The Business Case financial model must be updated at every tranche review — a Business Case that is only built at start becomes misleading as costs and benefits evolve',
        'Program-level management reserves are distinct from project contingency reserves and require Steering Committee approval to access',
      ],
      keyTakeawaysNL: [
        'Programmabudgetten zijn gestructureerd in componentbudgetten, programma-managementkosten, management reserves en benefits-mogelijk makende investeringen',
        'Tranche-financiering geeft de stuurgroep bewuste controlesmomenten — financiering voor de volgende tranche wordt alleen vrijgegeven als de huidige tranche levert',
        'Het financieel model van de Business Case moet bij elke tranche-review worden bijgewerkt — een Business Case die alleen bij de start wordt gebouwd wordt misleidend naarmate kosten en benefits evolueren',
        'Programma-niveau management reserves zijn anders dan project contingency reserves en vereisen goedkeuring van de stuurgroep',
      ],
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
      transcriptNL: `Risicomanagement op programmaniveau gaat verder dan het optellen van projectrisico\'s. Een programma introduceert een eigen categorie risico\'s die pas zichtbaar wordt wanneer projecten samenwerken: interdependentierisico\'s, benefit-realisatierisico\'s, en strategische risico\'s die de hele programmarechtvaardiging kunnen ondermijnen.

**Drie niveaus van risico in een programma**

**Projectrisico's** worden beheerd door de projectmanager en staan in het projectrisicoregister. Ze worden alleen geëscaleerd naar programmaniveau als ze de programma-benefits kunnen raken.

**Programmarisico\'s** zijn risico\'s die de programmamanager beheert: risico\'s die meerdere componentprojecten raken, risico\'s voor de benefits-realisatie, en risico\'s voor de strategische afstemming. Deze staan in het **Programma Risicoregister**.

**Strategische risico\'s** zijn risico\'s voor de organisatie als geheel — verandering van marktstrategie, fusies, externe regelgeving — die de Business Case van het programma in twijfel kunnen trekken. Deze worden gesignaleerd door de programmamanager maar besloten door de stuurgroep.

**Het Programma Risicoregister**

Het Programma Risicoregister heeft een ander focusniveau dan een projectrisicoregister. Per risico bevat het:
- Omschrijving van het risico en de oorzaak
- Effect op benefits-realisatie (niet alleen op deliverables)
- Kans en impact (met expliciete aandacht voor benefits-impact)
- Eigenaar van het risico (benefit-eigenaar of programmamanager)
- Responsstrategie: vermijden, beperken, overdragen of accepteren
- Restrisico na beheersmaatregelen

**Interdependentierisico's: het unieke programmarisico**

Het meest onderscheidende risicotype op programmaniveau is het interdependentierisico: het risico dat vertraging of mislukking in project A de start of het succes van project B in gevaar brengt. Dit risico is per definitie onzichtbaar op projectniveau.

Voorbeeld: een ziekenhuis voert een programma "Digitale Zorgketen" uit. Project A implementeert het elektronisch patiëntendossier (EPD). Project B integreert het EPD met apotheekssystemen. Als Project A zes weken vertraging oploopt, kan Project B niet beginnen — en de benefit "medicatiefout reductie met 40%" komt in gevaar. Dit is een interdependentierisico dat de programmamanager bewaakt, niet de individuele projectmanagers.

**Risicoreview in de tranche-cyclus**

Bij elke End of Tranche Review wordt het Programma Risicoregister bijgewerkt en beoordeeld door de stuurgroep. Nieuwe risico\'s die zijn geïdentificeerd tijdens de vorige tranche worden toegevoegd. Risico's die zijn gematerialiseerd, worden geanalyseerd op wat ze ons leren voor de volgende tranche. Dit maakt risicomanagement een lerend systeem, geen statisch register.

**Key Takeaways**`,
      keyTakeaways: [
        'Program risk management distinguishes three levels: project risks (project manager), program risks (program manager), and strategic risks (steering committee)',
        'The Program Risk Register focuses on benefits-realization risks and cross-component interdependency risks — not just technical project risks',
        'Interdependency risks are the unique program-level risk category: delays or failures in one component cascade to others in ways invisible to individual project managers',
        'Risk registers are reviewed and updated at every End of Tranche Review, making risk management a learning cycle rather than a static document',
      ],
      keyTakeawaysEN: [
        'Program risk management distinguishes three levels: project risks (project manager), program risks (program manager), and strategic risks (steering committee)',
        'The Program Risk Register focuses on benefits-realization risks and cross-component interdependency risks — not just technical project risks',
        'Interdependency risks are the unique program-level risk category: delays or failures in one component cascade to others in ways invisible to individual project managers',
        'Risk registers are reviewed and updated at every End of Tranche Review, making risk management a learning cycle rather than a static document',
      ],
      keyTakeawaysNL: [
        'Programmarisicomanagement onderscheidt drie niveaus: projectrisico\'s (projectmanager), programmarisico\'s (programmamanager) en strategische risico\'s (stuurgroep)',
        'Het Programma Risicoregister richt zich op benefits-realisatierisico\'s en component-overschrijdende interdependentierisico\'s — niet alleen op technische projectrisico\'s',
        'Interdependentierisico\'s zijn de unieke programma-risicocategorie: vertragingen of mislukkingen in één component cascaderen naar anderen op manieren die onzichtbaar zijn voor individuele projectmanagers',
        'Risicoregisters worden beoordeeld en bijgewerkt bij elke End of Tranche Review, waardoor risicomanagement een leerend systeem wordt in plaats van een statisch document',
      ],
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
      transcriptNL: `Een programma is pas zo sterk als de componentprojecten die het draagt. De kunst van de programmamanager is niet het zelf uitvoeren van die projecten — maar het orkestreren ervan: initiëren op het juiste moment, bewaken op het juiste niveau, en afsluiten zodra de bijdrage aan de programma-benefits is gerealiseerd.

**Wat zijn programmacomponenten?**

Componenten zijn de uitvoerende eenheden van een programma: projecten, deelprogramma\'s, en non-project activiteiten (zoals change management, training, of operationele pilots). Per component definieert de programmamanager:
- De bijdrage aan de programma-benefits
- De start- en eindcriteria
- De afhankelijkheden met andere componenten
- De rapportagevereisten richting de programmamanager

**Component initiatie**

Componenten worden niet allemaal tegelijk gestart. Een slecht getimed initiatief verspilt capaciteit en creëert onnodige afhankelijkheidsproblemen. De programmamanager hanteert de roadmap en de tranche-structuur als leidraad voor de volgorde en het tijdstip van component-initiatie. Een componentproject start pas als:
- De voorwaarden vanuit voorgaande componenten zijn ingevuld
- De benodigde resources beschikbaar zijn
- De governance (inclusief projectmanager en sponsor) is ingericht

**Component-overzicht en voortgangsbewaking**

De programmamanager bewaakt voortgang op componentniveau via:
- Periodieke statusrapportages van projectmanagers
- Escalaties van issues en risico\'s die de programma-benefits raken
- Gezamenlijke programmastatusreviews (Program Board-vergaderingen)

De programmamanager duikt niet diep in de technische details van elk project — dat is de verantwoordelijkheid van de projectmanager. Wél bewaakt de programmamanager de grensvlakken: hoe de outputs van Project A aansluiten op de inputvereisten van Project B.

**Voorbeeld: IT-moderniseringsprogramma bij een verzekeraar**

Een verzekeraar voert het programma "Kernsysteem Modernisering" uit met vier componenten:
1. Datamigratie (Project A) — looptijd 9 maanden
2. Nieuw polisbeheersysteem (Project B) — start afhankelijk van voltooiing Project A
3. Klantenportal (Project C) — kan parallel aan Project B
4. Medewerkerstraining (non-project activiteit) — start 3 maanden voor go-live van Project B

De programmamanager bewaakt of de datamigratie op schema ligt, want vertraging in Project A blokkeert de start van Project B en verschuift de go-live-datum van het nieuwe systeem — wat direct de benefit "operationeel klaar per Q3" bedreigt.

**Component-afsluiting**

Een componentproject wordt formeel afgesloten zodra zijn bijdrage aan de programma-benefits is geleverd en gedocumenteerd. De projectmanager levert de oplevering op en overdraagt aan de programmamanager, die de bijdrage registreert in het Benefits Register en beoordeelt of de verwachte benefit-indicator is behaald.

**Key Takeaways**`,
      keyTakeaways: [
        'Program components include projects, sub-programs, and non-project activities — each defined by its specific contribution to program benefits',
        'Components are initiated in sequence, not simultaneously — timing is governed by the roadmap, tranche plan, and dependency logic',
        'The program manager monitors component boundaries and handoffs, not internal project details — that is the project manager\'s responsibility',
        'Component closure is formally documented and linked to the Benefits Register to confirm the component\'s contribution to benefit realization',
      ],
      keyTakeawaysEN: [
        'Program components include projects, sub-programs, and non-project activities — each defined by its specific contribution to program benefits',
        'Components are initiated in sequence, not simultaneously — timing is governed by the roadmap, tranche plan, and dependency logic',
        'The program manager monitors component boundaries and handoffs, not internal project details — that is the project manager\'s responsibility',
        'Component closure is formally documented and linked to the Benefits Register to confirm the component\'s contribution to benefit realization',
      ],
      keyTakeawaysNL: [
        'Programmacomponenten omvatten projecten, deelprogramma\'s en non-project activiteiten — elk gedefinieerd door de bijdrage aan de programma-benefits',
        'Componenten worden volgordelijk geïnitieerd, niet gelijktijdig — timing wordt bepaald door de roadmap, tranche-plan en afhankelijkheidslogica',
        'De programmamanager bewaakt componentgrenzen en overdrachten, niet interne projectdetails — dat is de verantwoordelijkheid van de projectmanager',
        'Component-afsluiting wordt formeel gedocumenteerd en gekoppeld aan het Benefits Register om de bijdrage aan benefits-realisatie te bevestigen',
      ],
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
      transcriptNL: `Benefits realiseren is de bestaansreden van een programma. Toch is het precies hier dat de meeste programma\'s tekortschieten: projecten worden opgeleverd, budgetten worden verantwoord, maar de vraag "zijn de beloofde benefits ook daadwerkelijk gerealiseerd?" blijft onbeantwoord. Deze les gaat over hoe je benefits actief realiseert — niet passief afwacht.

**Benefits realiseren is actief werk**

Een benefit realiseert zich niet vanzelf doordat een project is afgerond. Een nieuw CRM-systeem dat is uitgerold maar niet wordt gebruikt, levert nul benefits. Benefits realiseren vereist:
- Adoptie van de geleverde output door de doelgroep
- Gedragsverandering bij medewerkers of klanten
- Operationele inbedding in werkprocessen
- Continue meting en bijsturing

Dit is de reden dat change management geen "zachte bijzaak" is in programmamanagement, maar een kernactiviteit.

**De benefit-eigenaar: een cruciale rol**

Elke benefit in het Benefits Register heeft een eigenaar — typisch een lijnmanager die verantwoordelijk is voor het operationele domein waar de benefit moet verschijnen. De benefit-eigenaar is niet de programmamanager: die faciliteert en bewaakt. De benefit-eigenaar is degene die de dagelijkse sturing geeft aan adoptie en verandering in zijn of haar organisatieonderdeel.

**Meten van benefits-realisatie**

Benefits meten vereist drie dingen die al in de definitiefase worden vastgelegd:
1. **Baseline**: de nulmeting vóór het programma, zodat verbetering aantoonbaar is
2. **KPI**: de specifieke indicator die de benefit meet (bijv. verwerkingstijd per order, klanttevredenheidsscore, defectpercentage)
3. **Meetmoment**: wanneer en hoe frequent wordt gemeten?

Een benefit die niet gemeten kan worden, is geen benefit — het is een wens. De programmamanager eist meetbaarheid als kwaliteitseis voor opname in het Benefits Realization Plan.

**Voorbeeld: Benefit-meting bij een logistiek programma**

Een logistiek bedrijf voert het programma "Order-to-Delivery Versnelling" uit. De beoogde benefit: gemiddelde leveringstijd terugbrengen van 4,2 naar 2,8 werkdagen (een reductie van 33%).

Baseline: gemiddelde leveringstijd Q1 vóór programmastart = 4,2 dagen (gemeten over 10.000 orders).
KPI: gemiddelde leveringstijd gemeten per kwartaal op een steekproef van 2.000 orders.
Verwacht meetmoment: zes maanden na go-live van het nieuwe sorteersysteem (Project C).

Na implementatie meet de benefit-eigenaar (Operations Director): 3,1 dagen in kwartaal 1 na go-live, 2,9 in kwartaal 2, 2,7 in kwartaal 3. De benefit overtreft de doelstelling. Dit wordt gedocumenteerd in het Benefits Register en gerapporteerd aan de stuurgroep.

**Sustained benefits: borging na programma-afsluiting**

Benefits die eenmalig zijn gemeten maar niet worden geborgd, verdwijnen. De programmamanager zorgt — vóór programma-afsluiting — dat de benefit-eigenaar beschikt over de processen, capaciteiten en meetmechanismen om de benefit te handhaven na het ontbinden van het programmateam.

**Key Takeaways**`,
      keyTakeaways: [
        'Benefits do not materialize automatically when a project delivers — active change management, adoption, and embedding in operations are required',
        'Each benefit has a dedicated owner (typically a line manager) who is accountable for realizing the benefit in their operational domain',
        'Benefits are only measurable if a baseline, a KPI, and a measurement schedule are defined in the Benefits Realization Plan before the program executes',
        'Benefit sustenance requires handing over measurement mechanisms and operational processes to benefit owners before the program team disbands',
      ],
      keyTakeawaysEN: [
        'Benefits do not materialize automatically when a project delivers — active change management, adoption, and embedding in operations are required',
        'Each benefit has a dedicated owner (typically a line manager) who is accountable for realizing the benefit in their operational domain',
        'Benefits are only measurable if a baseline, a KPI, and a measurement schedule are defined in the Benefits Realization Plan before the program executes',
        'Benefit sustenance requires handing over measurement mechanisms and operational processes to benefit owners before the program team disbands',
      ],
      keyTakeawaysNL: [
        'Benefits realiseren zich niet automatisch wanneer een project levert — actief change management, adoptie en inbedding in de bedrijfsvoering zijn vereist',
        'Elke benefit heeft een toegewezen eigenaar (typisch een lijnmanager) die verantwoordelijk is voor het realiseren van de benefit in zijn of haar operationele domein',
        'Benefits zijn alleen meetbaar als een baseline, een KPI en een meetschema zijn gedefinieerd in het Benefits Realization Plan vóór de programma-uitvoering',
        'Benefit-borging vereist het overdragen van meetmechanismen en operationele processen aan benefit-eigenaren vóór het ontbinden van het programmateam',
      ],
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
      transcriptNL: `Een van de meest onderschatte risico\'s in programmamanagement is de transitie: het moment waarop de geleverde capaciteiten worden overgedragen van het programmateam aan de reguliere bedrijfsvoering. Zonder zorgvuldige transitie verdwijnen benefits die met veel moeite zijn opgebouwd, simpelweg omdat niemand in de lijnorganisatie er verantwoordelijkheid voor neemt.

**Wat is transitie in programmamanagement?**

Transitie is de gestructureerde overdracht van:
- Geleverde capaciteiten (systemen, processen, diensten) aan operationele eigenaren
- Verantwoordelijkheid voor benefit-meting en -borging aan benefit-eigenaren
- Kennis, documentatie en ondersteuningsarrangementen aan de ontvangende organisatie

Transitie is geen event — het is een proces dat start ruim vóór de programma-afsluiting en doorloopt tot de lijnorganisatie zelfstandig kan opereren.

**De transitieplanning**

Het transitieplan wordt opgesteld tijdens de uitvoeringsfase, niet pas bij de afsluiting. Het bevat:
- Welke capaciteiten worden overgedragen, aan wie, en wanneer
- Welke training of kennisoverdracht vereist is
- Hoe de overdracht wordt geverifieerd (acceptatiecriteria)
- Wat het ondersteuningsniveau is na overdracht (tijdelijk of structureel)
- Hoe de benefit-meting na overdracht wordt gecontinueerd

**Tranche-gebaseerde transitie (MSP)**

In MSP vindt transitie niet alleen aan het einde van het programma plaats, maar ook aan het einde van elke tranche. Aan het einde van een tranche wordt de nieuw opgeleverde capaciteit overgedragen aan de bedrijfsvoering — ook al loopt het programma door. Dit maakt de organisatie incrementeel capabeler en verdeelt het transitierisico over meerdere momenten.

**Voorbeeld: Transitie bij een ziekenhuis**

Een ziekenhuis voert het programma "Digitale Zorgadministratie" uit. Einde Tranche 2: het nieuwe elektronisch patiëntendossier (EPD) is gereed voor uitrol. De transitie naar de verpleegafdelingen omvat:
- Vier weken superuser-training voor 60 verpleegkundigen (kennisoverdracht)
- Tweewekelijkse ondersteuningsspreekuren gedurende drie maanden na go-live
- Overdracht van EPD-beheer aan de IT-afdeling (operationeel eigenaarschap)
- Maandelijkse meting van de benefit "tijdsbesparing administratie per verpleegkundige per dag" door de afdelingshoofd (benefit-eigenaar)

Als de transitie niet goed is uitgevoerd, werken verpleegkundigen binnen zes weken terug in Excel — en verdwijnt de benefit.

**Borging: benefits duurzaam houden**

Borging (sustainment) is de fase na transitie: de lijnorganisatie heeft de capaciteit ontvangen en moet haar duurzaam inzetten. De programmamanager stelt vóór afsluiting vast dat:
- Benefit-eigenaren zijn geëquipeerd met meetinstrumenten en rapportageprocessen
- Escalatieroutes zijn gecreëerd voor wanneer benefits achterblijven
- Er geen afhankelijkheid meer is van het programmateam voor dagelijkse operatie

**Key Takeaways**`,
      keyTakeaways: [
        'Transition is a structured process of handing over delivered capabilities, benefit accountability, and knowledge to the receiving line organization — not a single handover event',
        'Transition planning starts during program execution, not at closure — the receiving organization must be prepared well before the program team disbands',
        'MSP enables tranche-based transition: each tranche end transfers new capabilities to operations, incrementally building organizational capacity',
        'Sustainment confirms that benefit owners have the measurement tools and processes to maintain benefits after the program closes',
      ],
      keyTakeawaysEN: [
        'Transition is a structured process of handing over delivered capabilities, benefit accountability, and knowledge to the receiving line organization — not a single handover event',
        'Transition planning starts during program execution, not at closure — the receiving organization must be prepared well before the program team disbands',
        'MSP enables tranche-based transition: each tranche end transfers new capabilities to operations, incrementally building organizational capacity',
        'Sustainment confirms that benefit owners have the measurement tools and processes to maintain benefits after the program closes',
      ],
      keyTakeawaysNL: [
        'Transitie is een gestructureerd proces van overdracht van geleverde capaciteiten, benefit-verantwoordelijkheid en kennis aan de ontvangende lijnorganisatie — geen eenmalige handeling',
        'Transitieplanning start tijdens de programma-uitvoering, niet bij de afsluiting — de ontvangende organisatie moet ruim voor het ontbinden van het programmateam zijn voorbereid',
        'MSP maakt tranche-gebaseerde transitie mogelijk: aan het einde van elke tranche worden nieuwe capaciteiten overgedragen aan de bedrijfsvoering, waardoor incrementeel organisatorische capaciteit wordt opgebouwd',
        'Borging bevestigt dat benefit-eigenaren beschikken over meetinstrumenten en processen om benefits na afsluiting van het programma te handhaven',
      ],
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
      transcriptNL: `Een programma afsluiten is meer dan het uitschrijven van de laatste factuur en het ontbinden van het team. Programma-afsluiting is een formeel proces dat de organisatie in staat stelt te leren van het programma, de verantwoording over behaalde benefits te borgen, en de vrijgekomen capaciteit op te nemen in toekomstige initiatieven.

**Wanneer sluit je een programma?**

Een programma wordt gesloten wanneer:
- Alle geplande componentprojecten zijn afgerond en de outputs zijn opgeleverd
- De geleverde capaciteiten zijn overgedragen aan de bedrijfsvoering
- De benefits zijn gerealiseerd of er is een aantoonbaar pad naar realisatie geborgd bij de benefit-eigenaren
- De stuurgroep heeft formeel besloten dat verdere programma-activiteiten geen aanvullende waarde meer genereren

Een programma mag ook vroegtijdig worden gesloten wanneer de Business Case niet langer geldig is — bijvoorbeeld door een fundamentele strategiewijziging of omdat de verwachte benefits niet haalbaar blijken.

**Het Programma-afsluitingsrapport**

Het centrale document van de afsluitingsfase is het Programma-afsluitingsrapport. Dit rapport bevat:
- Een overzicht van alle geplande versus gerealiseerde benefits (inclusief afwijkingen en verklaringen)
- Een financiële eindafrekening: geplande versus werkelijke programmakosten
- Geleerde lessen: wat heeft dit programma de organisatie geleerd over programmamanagement?
- Openstaande risico\'s of issues die worden overgedragen aan de lijnorganisatie
- Formele bevestiging van benefit-eigenarissen dat zij de verantwoordelijkheid voor doorlopende meting overnemen

**Geleerde lessen: het programma als kenniskapitaal**

Een van de meest onderbenutte outputs van programma-afsluiting is de lessons learned. Wat werkte in de governance? Welke stakeholdergroep vroeg meer aandacht dan verwacht? Welke benefit-realisatiestrategie slaagde en welke niet? Deze kennis is goud voor volgende programma\'s — maar alleen als ze expliciet wordt gedocumenteerd en gedeeld.

**Voorbeeld: Afsluitingsrapport ERP-programma**

Een productiebedrijf sluit het programma "ERP-implementatie" na drie jaar. Het afsluitingsrapport toont:
- Geplande benefits: €3,2M jaarlijkse kostenbesparing. Gerealiseerd na 18 maanden operatie: €2,7M. Verklaring: lagere besparingen op inkoop door latere module-uitrol.
- Programmakosten: €8,4M budget, €8,9M besteed. Overschrijding veroorzaakt door onverwachte datamigratie-complexiteit.
- Lessons learned: change management voor het Inkoop-team vereiste meer capaciteit dan begroot; eerder instappen aanbevolen bij toekomstige ERP-trajecten.
- Openstaand: benefit-eigenaar (CFO) neemt verantwoordelijkheid voor kwartaalmeting besparingen gedurende 24 maanden na sluiting.

**Formele sluiting door de stuurgroep**

De stuurgroep sluit het programma formeel af via een besluitvormingsvergadering. Zij bevestigen dat de programma-doelstellingen zijn bereikt (of gedocumenteerd afgeweken), dat de overdrachten zijn voltooid, en dat de organisatie klaar is om zonder het programmateam verder te opereren.

**Key Takeaways**`,
      keyTakeaways: [
        'Program closure requires formal confirmation that benefits are realized (or sustainably on track), outputs transferred, and no further program activity adds value',
        'The Program Closure Report documents planned vs. realized benefits, final financials, lessons learned, and formal handover of ongoing benefit measurement to owners',
        'Early closure is a valid and responsible decision when the Business Case is no longer valid — continuing a program without a valid Business Case wastes resources',
        'Lessons learned from program closure are organizational knowledge capital — explicit documentation and sharing is the program manager\'s final deliverable',
      ],
      keyTakeawaysEN: [
        'Program closure requires formal confirmation that benefits are realized (or sustainably on track), outputs transferred, and no further program activity adds value',
        'The Program Closure Report documents planned vs. realized benefits, final financials, lessons learned, and formal handover of ongoing benefit measurement to owners',
        'Early closure is a valid and responsible decision when the Business Case is no longer valid — continuing a program without a valid Business Case wastes resources',
        'Lessons learned from program closure are organizational knowledge capital — explicit documentation and sharing is the program manager\'s final deliverable',
      ],
      keyTakeawaysNL: [
        'Programma-afsluiting vereist formele bevestiging dat benefits zijn gerealiseerd (of duurzaam op koers), outputs zijn overgedragen, en verdere programma-activiteiten geen waarde meer toevoegen',
        'Het Programma-afsluitingsrapport documenteert geplande vs. gerealiseerde benefits, eindfinancials, geleerde lessen en formele overdracht van doorlopende benefit-meting aan eigenaren',
        'Vroegtijdige afsluiting is een valide en verantwoorde beslissing wanneer de Business Case niet langer geldig is — doorgaan zonder geldige Business Case verspilt middelen',
        'Geleerde lessen bij programma-afsluiting zijn organisatorisch kenniskapitaal — expliciete documentatie en deling is de laatste oplevering van de programmamanager',
      ],
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
        // TODO: lesson transcripts in this module are stubs — questions are PgM-canonical and ready for transcript expansion
        {
          id: 'pgm-q8',
          question: 'Wat is de primaire verantwoordelijkheid van de programma-stuurgroep (Program Steering Committee)?',
          options: [
            'Het dagelijks bewaken van de voortgang van individuele projecten binnen het programma',
            'Het nemen van strategische beslissingen, het borgen van de afstemming op organisatiedoelen en het goedkeuren van significante wijzigingen in scope of budget',
            'Het opstellen en bijhouden van het Benefits Realization Plan namens de programmamanager',
            'Het aansturen van projectmanagers bij de uitvoering van hun componentprojecten',
          ],
          correctAnswer: 1,
          explanation: 'De stuurgroep (steering committee) opereert op strategisch niveau. Zij bewaken de afstemming van het programma op de organisatiestrategie, nemen besluiten die de bevoegdheid van de programmamanager overschrijden en keuren wijzigingen in programma-scope of -budget goed. De dagelijkse sturing van projecten is een verantwoordelijkheid van de programmamanager en de individuele projectmanagers.',
        },
        {
          id: 'pgm-q9',
          question: 'In het MSP-raamwerk (Managing Successful Programmes) verwijst het begrip "tranche" naar:',
          options: [
            'Een individueel project binnen het programma met een eigen budget',
            'Een fase van het programma die wordt afgesloten met een formele review, waarbij nieuwe capaciteit wordt opgeleverd aan de organisatie',
            'Het totale budget dat is gereserveerd voor een programma over de volledige looptijd',
            'Een categorie stakeholders die bijzondere aandacht vereist van de programmamanager',
          ],
          correctAnswer: 1,
          explanation: 'In MSP is een tranche een planningshorizon waarbinnen een coherente set projecten en activiteiten wordt uitgevoerd, afsluitend met een formele "end-stage review" (poortoordeel). Aan het einde van een tranche wordt nieuwe, meetbare capaciteit opgeleverd aan de bedrijfsvoering. Dit is conceptueel vergelijkbaar met een "programma-fase met een gatekeeper-beslissing".',
        },
        {
          id: 'pgm-q10',
          question: 'Wat onderscheidt een programma-risicoregister van een project-risicoregister?',
          options: [
            'Het programma-risicoregister bevat uitsluitend financiële risico\'s; het project-risicoregister dekt alle soorten risico\'s',
            'Het programma-risicoregister richt zich op risico\'s die de benefits-realisatie bedreigen en op programmabrede afhankelijkheden; project-risicoregisters bevatten projectspecifieke technische en operationele risico\'s',
            'Er is geen inhoudelijk verschil — beide registreren dezelfde soorten risico\'s op een ander organisatieniveau',
            'Het project-risicoregister wordt bijgehouden door de programmamanager; het programma-risicoregister door de stuurgroep',
          ],
          correctAnswer: 1,
          explanation: 'Het programma-risicoregister heeft een ander focusniveau dan een project-risicoregister. Op programmaniveau gaat het om risico\'s die de realisatie van programma-benefits bedreigen, om interdependentierisico\'s tussen componenten en om strategische risico\'s. Projectrisico\'s zijn doorgaans smaller van scope en technischer van aard. Een programmamanager escaleert projectrisico\'s alleen naar programmaniveau als ze de benefits-realisatie kunnen beïnvloeden.',
        },
        {
          id: 'pgm-q11',
          question: 'Welke activiteit vindt centraal plaats tijdens de transitiefase aan het einde van een programma?',
          options: [
            'Het opstellen van de definitieve projectplannen voor de laatste componentprojecten',
            'Het overdragen van de gerealiseerde capaciteiten en benefits aan de reguliere bedrijfsvoering, zodat ze duurzaam worden geborgd',
            'Het formeel beëindigen van alle contracten met externe leveranciers',
            'Het heralloceren van het resterende programmabudget aan nieuwe strategische initiatieven',
          ],
          correctAnswer: 1,
          explanation: 'Transitie en borging zijn kernelementen van de programma-afsluitingsfase. De programmamanager zorgt ervoor dat de geleverde capaciteiten worden ingebed in de bedrijfsvoering, dat operationele teams zijn getraind en dat de mechanismen zijn ingericht om de benefits ook na programma-afsluiting te blijven meten en handhaven. Zonder expliciete transitie-activiteiten lopen benefits het risico te verdwijnen nadat het programmateam ontbonden is.',
        },
        {
          id: 'pgm-q12',
          question: 'Een programmamanager merkt dat twee componentprojecten concurreren om dezelfde schaarse specialisten, waardoor beide vertraging oplopen. Welke actie is het meest passend?',
          options: [
            'De programmamanager laat de projectmanagers het onderling uitzoeken, omdat resourceconflicten buiten de programma-scope vallen',
            'De programmamanager escaleert het conflict direct naar de stuurgroep zonder zelf een oplossing voor te stellen',
            'De programmamanager prioriteert de componentprojecten op basis van bijdrage aan benefits-realisatie en herverdeelt de resources overeenkomstig, conform het programma-resourceplan',
            'De programmamanager recruteert aanvullende specialisten zonder overleg met de stuurgroep',
          ],
          correctAnswer: 2,
          explanation: 'Een kernverantwoordelijkheid van de programmamanager is het managen van interdependenties en resourceconflicten over de componentprojecten heen. De juiste aanpak is prioritering op basis van benefits-impact — het project dat het meest bijdraagt aan de programma-benefits krijgt voorrang — gevolgd door heralloctie conform het programma-resourceplan. Escalatie naar de stuurgroep is pas passend als de herprioritering buiten de bevoegdheden van de programmamanager valt.',
        },
        {
          id: 'pgm-q13',
          question: 'Welke stelling over het Benefits Register is juist?',
          options: [
            'Het Benefits Register is een eenmalig document dat wordt opgesteld bij de start van het programma en daarna niet meer wordt bijgewerkt',
            'Het Benefits Register legt voor elke benefit vast: de omschrijving, de eigenaar, de meetindicator (KPI), de baseline-waarde en de realisatietijdlijn; het wordt gedurende het gehele programma actueel gehouden',
            'Het Benefits Register vervangt het programma-risicoregister zodra de uitvoeringsfase begint',
            'Het Benefits Register wordt uitsluitend bijgehouden door de stuurgroep, niet door de programmamanager',
          ],
          correctAnswer: 1,
          explanation: 'Het Benefits Register is een levend document dat gedurende de volledige programma-looptijd wordt bijgehouden. Per benefit bevat het de omschrijving, de toegewezen eigenaar, de KPI of meetindicator, de nulmeting (baseline), de streefwaarde en de verwachte realisatiedatum. Door het register continu bij te werken kan de programmamanager de voortgang van benefits-realisatie bewaken en tijdig bijsturen.',
        },
      ],
    },
    {
      id: 'pgm-l-assignment',
      title: 'Praktijkopdracht: Benefits Realisation voor een 4-tranche Programma',
      titleNL: 'Praktijkopdracht: Benefits Realisation voor een 4-tranche Programma',
      duration: '90:00',
      type: 'assignment',
      requires_admin_approval: true,
      assignment: {
        title: 'Definieer Benefits Realisation voor een 4-tranche programma',
        description: `Een grote financiële instelling voert een digitaal transformatieprogramma uit verdeeld over 4 tranches (kwartalen). Doel: het verminderen van handmatige verwerkingstijd met 40% en het verhogen van klanttevredenheid (NPS) met 15 punten binnen 18 maanden.

Als Programme Manager ben jij verantwoordelijk voor het Benefits Realisation Framework. Lever de volgende documenten in.`,
        deliverables: [
          'Benefits Map: visuele of tabellarische weergave van de 3 hoofduitkomsten van het programma, gekoppeld aan de projectoutputs die ze mogelijk maken (oorzaak-gevolg keten)',
          'Benefits Realisation Plan: per benefit — beschrijving, meetindicator (KPI), baseline-waarde, target, meetfrequentie, en meetverantwoordelijke',
          'Benefit Owner Roster: een lijst van de Benefit Owners per benefit met naam (fictief), rol in de organisatie, en accountability-omschrijving',
          'KPI-tracking Dashboard: ontwerp (als tabel of schets) van een dashboard met 5 KPI\'s, hun RAG-status, trend en actie bij rood',
        ],
        rubric: [
          { criterion: 'Benefits Map toont duidelijke oorzaak-gevolg keten van output naar outcome', points: 25 },
          { criterion: 'Benefits Realisation Plan per benefit volledig (KPI + baseline + target + eigenaar)', points: 25 },
          { criterion: 'Benefit Owner Roster concreet met accountability omschreven', points: 20 },
          { criterion: 'KPI-dashboard bruikbaar met RAG-status en actiedrempel', points: 20 },
          { criterion: 'Correct gebruik van programmamanagement-terminologie', points: 10 },
        ],
        submission_format: 'markdown',
      },
    },
    {
      id: 'pgm-l-exam',
      title: 'Final Exam — Program Management Professional',
      titleNL: 'Eindexamen — Programma Management Professional',
      type: 'exam',
      duration: '45:00',
      videoUrl: '',
      transcript: `Dit is het eindexamen van de Programma Management Professional cursus.

**Examen Informatie:**
- 18 multiple choice vragen
- 45 minuten tijd
- 80% score nodig om te slagen (15 van 18 correct)
- Gesloten boek examen

**Onderwerpen:**
- Programma vs project vs portfolio, levenscyclus, benefits management, governance (Module 1 — 6 vragen)
- Strategische afstemming, stakeholder betrokkenheid, programma roadmap, financieel en risicobeheer (Module 2 — 6 vragen)
- Programmacomponenten, benefits realisatie, transitie, programma-afsluiting (Module 3 — 6 vragen)

**Tips:**
- Kies het antwoord dat het best aansluit op de PMI Standard for Program Management (5e editie)
- Let op het onderscheid tussen programma, project en portfolio
- Focus op benefits-realisatie als het onderscheidende principe van programmamanagement

Succes!`,
      quiz: [
        {
          id: 'pgm-exam-q1',
          question: 'Welke uitspraak beschrijft het meest nauwkeurig het onderscheid tussen een programma en een portfolio?',
          options: [
            'Een programma is kleiner dan een portfolio maar groter dan een project',
            'Een programma bundelt gerelateerde projecten en deelprogramma\'s om gezamenlijke benefits te realiseren; een portfolio groepeert projecten en programma\'s voor strategisch toezicht en prioritering, ongeacht of ze inhoudelijk gerelateerd zijn',
            'Een portfolio is altijd een tijdelijk initiatief; een programma is permanent',
            'Programma en portfolio zijn uitwisselbare termen in de PMI Standard',
          ],
          correctAnswer: 1,
          explanation: 'Per de PMI Standard for Program Management (5e ed.) bundelt een programma gerelateerde componenten om gezamenlijke benefits te realiseren die niet mogelijk zijn bij individueel management. Een portfolio (PMI Standard for Portfolio Management) groepeert projecten en programma\'s voor strategisch toezicht en prioritering — de componenten hoeven inhoudelijk niet gerelateerd te zijn.',
        },
        {
          id: 'pgm-exam-q2',
          question: 'Waarom loopt een programma typisch langer door dan het laatste componentproject?',
          options: [
            'Omdat de administratieve afsluiting van contracten altijd meerdere maanden duurt',
            'Omdat benefits doorgaans pas realiseren nadat projectopleveringen zijn ingebed in de bedrijfsvoering, en de programmamanager verantwoordelijk blijft voor het bewaken en borgen van die benefits',
            'Omdat de stuurgroep wettelijk verplicht is het programma minimaal zes maanden open te houden',
            'Omdat projectmanagers hun eindrapportages nog moeten afleveren',
          ],
          correctAnswer: 1,
          explanation: 'Een fundamenteel kenmerk van programmamanagement is dat benefits time-lagged zijn: ze verschijnen pas nadat de geleverde outputs zijn ingebed in de organisatie. De programmamanager blijft verantwoordelijk voor het monitoren, borgen en overdragen van die benefits aan de reguliere bedrijfsvoering, ook nadat alle componentprojecten zijn afgesloten.',
        },
        {
          id: 'pgm-exam-q3',
          question: 'Welke van de drie fasen van de programma-levenscyclus (PMI Standard, 5e ed.) is verantwoordelijk voor de oplevering van projectresultaten en de bijdrage aan benefits?',
          options: [
            'Programma-definitiefase',
            'Programma-uitvoeringsfase (Program Benefits Delivery Phase)',
            'Programma-afsluitingsfase',
            'Programma-initiatiefase',
          ],
          correctAnswer: 1,
          explanation: 'De PMI Standard for Program Management (5e ed.) beschrijft drie fasen: (1) Program Definition (strategie, business case, charter), (2) Program Benefits Delivery (uitvoering van componentprojecten, oplevering van outputs en bijdrage aan benefits) en (3) Program Closure (afsluiting, overdracht en lessons learned). De Benefits Delivery Phase is de langste en meest operationele fase.',
        },
        {
          id: 'pgm-exam-q4',
          question: 'Wat is het primaire doel van het Benefits Realization Plan in programmamanagement?',
          options: [
            'Het beschrijven van de dagelijkse werkzaamheden van de projectmanagers in het programma',
            'Het vastleggen hoe en wanneer verwachte benefits worden gerealiseerd, wie verantwoordelijk is, welke KPI\'s worden gemeten en hoe benefits worden geborgd in de bedrijfsvoering',
            'Het goedkeuren van budgetten door de stuurgroep per kwartaal',
            'Het samenvatten van de risicoblootstelling van het programma',
          ],
          correctAnswer: 1,
          explanation: 'Het Benefits Realization Plan beschrijft per benefit: de omschrijving, de eigenaar, de meetindicator (KPI), de baseline-waarde, de streefwaarde, de realisatietijdlijn en de borgingsstrategie. Het is een kerndocument dat de programma-uitvoering stuurt en gedurende de gehele programma-looptijd actueel wordt gehouden.',
        },
        {
          id: 'pgm-exam-q5',
          question: 'Welk document vormt de formele rechtvaardiging voor het bestaan van een programma en bevat de verwachte benefits, kosten en strategische afstemming?',
          options: [
            'Programma Management Plan',
            'Benefits Register',
            'Programma Business Case',
            'Programma Roadmap',
          ],
          correctAnswer: 2,
          explanation: 'De Programma Business Case is het kerndocument dat de strategische rechtvaardiging biedt. Het bevat de verwachte benefits, de geschatte kosten, de onderbouwing van de strategische afstemming en een risico-assessment. Het Programma Management Plan beschrijft de uitvoeringsaanpak. Het Benefits Register volgt de voortgang. De Roadmap toont de tijdlijn.',
        },
        {
          id: 'pgm-exam-q6',
          question: 'Wie vormt doorgaans de programma-stuurgroep (program steering committee) en wat is zijn primaire rol?',
          options: [
            'De programmamanager en alle projectmanagers van de componentprojecten',
            'Vertegenwoordigers van de sponsororganisatie, de programme sponsor en sleutelstakeholders; de stuurgroep biedt governance, keurt belangrijke beslissingen goed en bewaakt de afstemming op strategie en benefits',
            'Uitsluitend de CFO en CEO van de organisatie',
            'De programmamanager en de leveranciers van het programma',
          ],
          correctAnswer: 1,
          explanation: 'De stuurgroep (Steering Committee) bestaat uit vertegenwoordigers van de sponsororganisatie, de programme sponsor en sleutelstakeholders met governance-autoriteit. De stuurgroep keurt programmachartera, fase-gates, significante scope-wijzigingen en escalaties goed. De programmamanager rapporteert aan de stuurgroep maar maakt er doorgaans geen deel van uit.',
        },
        {
          id: 'pgm-exam-q7',
          question: 'Welke uitspraak over tranches (tranches) in MSP (Managing Successful Programmes) is correct?',
          options: [
            'Tranches zijn identiek aan sprints in Agile: tijdboxen van twee weken',
            'Een tranche is een groep programmacomponenten die beheerd worden als een samenhangend geheel omdat ze een gemeenschappelijke capaciteitsbehoefte of strategisch doel delen; aan het einde van een tranche vindt een formele evaluatie en go/no-go beslissing plaats',
            'Tranches zijn uitsluitend van toepassing op financiële programma\'s',
            'Een tranche is een individueel project binnen een programma',
          ],
          correctAnswer: 1,
          explanation: 'In MSP (OGC / AXELOS) is een tranche een programmaperiode die eindigt met een formele review (end-tranche review) en een go/no-go beslissing voor de volgende tranche. Tranches groeperen componenten die samen een identificeerbare voortgang in de realisatie van de Blueprint opleveren. Dit biedt governance-checkpoints zonder de continuïteit van het programma te verstoren.',
        },
        {
          id: 'pgm-exam-q8',
          question: 'Hoe verschilt programmarisico van projectrisico?',
          options: [
            'Programmarisico heeft altijd een hogere financiële impact dan projectrisico',
            'Programmarisico betreft bedreigingen voor de benefits-realisatie en strategische doelen van het gehele programma; projectrisico betreft bedreigingen voor de oplevering van de output van een specifiek project',
            'Programmarisico wordt uitsluitend beheerd door de stuurgroep; projectrisico door de projectmanager',
            'Er is geen betekenisvol onderscheid — beide termen beschrijven dezelfde onzekerheden',
          ],
          correctAnswer: 1,
          explanation: 'Programmarisico\'s bedreigen de realisatie van de gewenste benefits en strategische doelen van het programma als geheel — denk aan veranderingen in de organisatiestrategie, interdependenties tussen componenten of benefit-eigenaren die wegvallen. Projectrisico\'s bedreigen de oplevering van een specifieke projectoutput. De programmamanager beheert beide niveaus maar focus verschilt.',
        },
        {
          id: 'pgm-exam-q9',
          question: 'Wat is het doel van een programma-roadmap?',
          options: [
            'Een gedetailleerd dagelijks werkplan voor alle projectmanagers',
            'Een visuele tijdlijn die de volgorde en timing van programmacomponenten, mijlpalen en verwachte benefit-realisatiemomenten toont, afgestemd op de strategie',
            'Een financieel overzicht van de programmakosten per maand',
            'Een stakeholderlijst met per persoon de communicatiefrequentie',
          ],
          correctAnswer: 1,
          explanation: 'De programma-roadmap toont op hoog niveau de volgorde, timing en afhankelijkheden van componenten (projecten, deelprogramma\'s, activiteiten), gecombineerd met verwachte benefit-realisatiemomenten en strategische mijlpalen. Het is een communicatiemiddel voor stuurgroep en stakeholders en het primaire planningsinstrument voor de programmamanager.',
        },
        {
          id: 'pgm-exam-q10',
          question: 'Welke aanpak is het meest effectief voor het betrekken van stakeholders met hoge macht en lage interesse in een programma?',
          options: [
            'Wekelijkse gedetailleerde statusrapporten sturen',
            'Minimale betrokkenheid — hun lage interesse betekent dat ze niet relevant zijn',
            'Periodiek (maar niet frequent) informeren over de voortgang op hoofdlijnen via beknopte executive briefings, met directe betrokkenheid alleen bij beslissingen die hun belangen raken',
            'Dezelfde communicatieaanpak als stakeholders met hoge macht en hoge interesse',
          ],
          correctAnswer: 2,
          explanation: 'Stakeholders met hoge macht/lage interesse vallen in de "Keep Satisfied"-categorie van de Power/Interest-matrix. Ze willen niet overweldigd worden met detail, maar hun macht maakt hen gevaarlijk als ze zich verrast voelen. Beknopte executive briefings op sleutelmomenten en directe betrokkenheid bij beslissingen die hun belangen raken is de optimale aanpak.',
        },
        {
          id: 'pgm-exam-q11',
          question: 'Wat is de primaire rol van de Programme Sponsor (programma-opdrachtgever) in programmamanagement?',
          options: [
            'Het dagelijks managen van de componentprojecten',
            'Het bieden van executive sponsorship: afstemmen van het programma op de organisatiestrategie, goedkeuren van de business case, het wegnemen van politieke obstakels en het bewaken van het belang van het programma op C-niveau',
            'Het uitvoeren van gedetailleerde risicoanalyses voor elk componentproject',
            'Het beheren van de contracten met externe leveranciers',
          ],
          correctAnswer: 1,
          explanation: 'De Programme Sponsor (ook wel Senior Responsible Owner in MSP) is de executive die de ultieme verantwoordelijkheid draagt voor het bereiken van de benefits. De sponsor keurt de business case goed, zorgt voor politieke rugdekking, bewaakt de strategische relevantie en neemt escalaties aan die de programmamanager niet zelf kan oplossen.',
        },
        {
          id: 'pgm-exam-q12',
          question: 'Wat is een benefit owner (benefits-eigenaar) en welke verantwoordelijkheid heeft deze persoon?',
          options: [
            'De financieel directeur die het programmabudget beheert',
            'Een persoon (doorgaans in de lijnorganisatie) die verantwoordelijk is voor het realiseren en meten van een specifieke benefit nadat de projectoplevering heeft plaatsgevonden',
            'De projectmanager die de output oplevert die de benefit mogelijk maakt',
            'Een externe auditor die de benefits-realisatie verifieert',
          ],
          correctAnswer: 1,
          explanation: 'De benefit owner is de persoon die in de bedrijfsvoering verantwoordelijk is voor het daadwerkelijk realiseren van een specifieke benefit nadat de projectoutput is opgeleverd. Dit is typisch een lijnmanager of businessvertegenwoordiger — niet de projectmanager. De benefit owner tekent het Benefits Register mede en is aanspreekbaar op de KPI-realisatie.',
        },
        {
          id: 'pgm-exam-q13',
          question: 'Hoe verhoudt "Benefits Sustainment" zich tot "Benefits Realization" in programmamanagement?',
          options: [
            'Beide termen zijn synoniemen — ze beschrijven hetzelfde proces',
            'Benefits Realization is het bereiken van de beoogde verbeteringen; Benefits Sustainment is het langdurig borgen van die verbeteringen in de organisatie nadat het programma is afgesloten',
            'Benefits Sustainment is uitsluitend de verantwoordelijkheid van de stuurgroep na programma-afsluiting',
            'Benefits Realization vindt plaats vóór het programma; Benefits Sustainment tijdens de uitvoering',
          ],
          correctAnswer: 1,
          explanation: 'Benefits Realization is het proces van het meetbaar bereiken van de beoogde benefits. Benefits Sustainment gaat een stap verder: het borgen dat de gerealiseerde benefits structureel zijn ingebed in de bedrijfsvoering en niet verdwijnen na de sluiting van het programma. Dit vereist overdracht aan lijnorganisaties met duidelijke eigenaarschappen en meetafspraken.',
        },
        {
          id: 'pgm-exam-q14',
          question: 'Welke uitspraak over interdependentiemanagement in programmamanagement is correct?',
          options: [
            'Interdependenties tussen projecten worden exclusief beheerd door de individuele projectmanagers',
            'De programmamanager heeft een sleutelrol in het identificeren, monitoren en managen van interdependenties tussen componentprojecten, omdat vertraging in één component de benefits-realisatie van het gehele programma kan bedreigen',
            'Interdependenties zijn alleen relevant tijdens de definitiefase van het programma',
            'Interdependenties worden uitsluitend gedocumenteerd in het risicoregister',
          ],
          correctAnswer: 1,
          explanation: 'Interdependentiemanagement is een kernverantwoordelijkheid van de programmamanager. Vertraging of scopewijziging in één componentproject kan de planning, resources of outputs van andere componenten beïnvloeden en daarmee de programma-benefits bedreigen. De programmamanager bewaakt het interdependentieregister actief en escaleert wanneer nodig naar de stuurgroep.',
        },
        {
          id: 'pgm-exam-q15',
          question: 'Wat is het primaire doel van de "end-programme review" aan het einde van een programma?',
          options: [
            'Het goedkeuren van de facturen van externe leveranciers',
            'Het formeel vaststellen dat alle projecten zijn afgesloten, de behaalde benefits te evalueren ten opzichte van de business case, lessons learned te documenteren en de overdracht van benefits en verantwoordelijkheden aan de lijnorganisatie te formaliseren',
            'Het beoordelen van de individuele prestaties van de projectmanagers',
            'Het opstellen van de begroting voor het volgende programma',
          ],
          correctAnswer: 1,
          explanation: 'De end-programme review (programma-afsluitingsfase) valideert dat alle componentprojecten zijn afgesloten, beoordeelt de mate van benefits-realisatie versus de oorspronkelijke business case, documenteert lessons learned en formaliseert de overdracht van resterende benefits-monitoring aan de lijnorganisatie. Dit is de formele afsluiting van de programmagovernance.',
        },
        {
          id: 'pgm-exam-q16',
          question: 'Wat beschrijft de "Programme Blueprint" in MSP het meest accuraat?',
          options: [
            'Het technisch ontwerp van de IT-systemen die het programma oplevert',
            'Een beschrijving van de toekomstige gewenste staat van de organisatie na afronding van het programma: processen, mensen, structuur, technologie en informatiesystemen',
            'Het financieel plan van het programma inclusief kostenraming per tranche',
            'De communicatieaanpak van het programma richting alle stakeholders',
          ],
          correctAnswer: 1,
          explanation: 'In MSP beschrijft de Programme Blueprint de "to-be" staat van de organisatie na succesvolle uitvoering van het programma: hoe processen, rollen, structuren, technologie en informatiesystemen er dan uitzien. De Blueprint is het anker voor het meten van programmaresultaten en benefits — het antwoord op "hoe ziet succes eruit?".',
        },
        {
          id: 'pgm-exam-q17',
          question: 'Welke factor rechtvaardigt het BEST het bundelen van drie afzonderlijke projecten in één programma?',
          options: [
            'De drie projecten hebben dezelfde projectmanager en gebruiken overlappende budgetten',
            'De drie projecten leveren elk afzonderlijk outputs, maar realiseren de beoogde strategische benefit alleen als ze gezamenlijk worden gecoördineerd',
            'De drie projecten lopen elk langer dan 18 maanden',
            'De projecten vallen alle drie onder dezelfde afdeling in de organisatie',
          ],
          correctAnswer: 1,
          explanation: 'Het doorslaggevende criterium voor het bundelen in een programma is dat de gecombineerde benefits niet beschikbaar zijn bij individueel projectmanagement. Gedeelde budgetten, dezelfde PM of een zelfde afdeling zijn bestuurlijke overwegingen — geen inhoudelijke rechtvaardiging. Alleen de strategische benefit die door coördinatie wordt bereikt rechtvaardigt programmamanagement.',
        },
        {
          id: 'pgm-exam-q18',
          question: 'Wat is de meest accurate definitie van "programmagoverance" in de context van de PMI Standard for Program Management?',
          options: [
            'Het dagelijks coördineren van taken en resources over de componentprojecten heen',
            'Het kader van beleid, processen, rollen en verantwoordelijkheden dat ervoor zorgt dat het programma wordt bestuurd en bewaakt in lijn met de organisatiestrategie en de belangen van stakeholders',
            'Het opstellen van rapportages voor de raad van bestuur over de voortgang van het programma',
            'De set van tools en technieken die de programmamanager gebruikt voor planning',
          ],
          correctAnswer: 1,
          explanation: 'Programmagovernance (PMI Standard, 5e ed.) is het stelsel van kaders, beleid, processen en rollen dat borgt dat het programma in lijn met de strategie en stakeholderbelangen wordt bestuurd en bewaakt. Het omvat de stuurgroepstructuur, beslissingsbevoegdheden, escalatieroutes, fase-gate reviews en rapportagestructuren. Governance is niet hetzelfde als dagelijks management.',
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