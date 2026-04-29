// ============================================
// COURSE: SAFe & SCALING AGILE
// ============================================
// Complete course structure with key lessons fully developed
// ============================================

import { Rocket } from 'lucide-react';
import { Course, Module } from '../types';
import { BRAND } from '../brand';
import { instructors } from '../instructors';

// Module definitions
const module1: Module = {
  id: 'safe-m1',
  title: 'SAFe Overview',
  titleNL: 'SAFe Overzicht',
  order: 0,
  icon: 'Eye',
  color: '#EC4899',
  gradient: 'linear-gradient(135deg, #EC4899 0%, #DB2777 100%)',
  lessons: [
    {
      id: 'safe-l1',
      title: 'Why Scale Agile?',
      titleNL: 'Waarom Agile Schalen?',
      type: 'video',
      duration: '10:00',
      free: true,
      videoUrl: '',
      transcript: `Agile works great for small teams. But what happens when you have 50, 100, or 1000 people working together? That's where scaling frameworks like SAFe come in.

**The Challenge**

Agile was designed for small, co-located teams (5-9 people). But modern enterprises need to coordinate:
- Multiple teams
- Distributed locations
- Shared resources
- Dependencies
- Strategic alignment

**The Scaling Problem**

As organizations grow, they face:
- **Coordination**: How do teams stay aligned?
- **Dependencies**: How do we manage inter-team dependencies?
- **Prioritization**: Who decides what to build?
- **Architecture**: How do we keep systems coherent?
- **Governance**: How do we maintain control?

**Typical Symptoms**

Organizations struggle with:
- Teams working in silos
- Duplicated effort
- Integration nightmares
- Slow delivery
- Misalignment with business goals
- Resource conflicts

**What is SAFe?**

Scaled Agile Framework (SAFe) is a set of organizational and workflow patterns for implementing agile practices at enterprise scale.

Created by Dean Leffingwell, now used by thousands of organizations worldwide.

**Core Values**

SAFe is built on four core values:

**1. Alignment**
Everyone works toward shared objectives

**2. Built-In Quality**
Quality is not negotiable

**3. Transparency**
Trust requires visibility

**4. Program Execution**
Working software is the measure

**The SAFe House**

SAFe is visualized as a house with:
- **Roof**: Value (the goal)
- **Pillars**: Team and Technical Agility, Agile Product Delivery, Enterprise Solution Delivery, Lean Portfolio Management
- **Foundation**: Leadership and Lean-Agile Culture

**Benefits of SAFe**

Organizations report:
- 20-50% increase in productivity
- 25-75% faster time to market
- 30-75% increase in quality
- 10-50% improvement in employee engagement

**Why Teams Need SAFe**

- Maintain agility at scale
- Align with business strategy
- Improve predictability
- Coordinate dependencies
- Share learning across teams
- Reduce waste

**Real World Example**

Imagine: Your company has 20 Scrum teams building a complex product. Without SAFe:
- Each team has different practices
- No shared vision
- Integration happens late
- Dependencies discovered too late
- Business can't plan releases

With SAFe:
- Teams synchronized every 10 weeks (PI Planning)
- Shared roadmap and objectives
- Dependencies identified upfront
- Regular integration
- Predictable delivery

**Who Uses SAFe?**

From startups to Fortune 500:
- Software companies
- Financial services
- Healthcare
- Government
- Manufacturing
- Retail

**SAFe vs Other Frameworks**

**SAFe vs Scrum@Scale**
SAFe: Prescriptive, detailed guidance
Scrum@Scale: Lightweight, flexible

**SAFe vs LeSS**
SAFe: Full enterprise solution
LeSS: Simpler, fewer roles

**SAFe vs Spotify Model**
SAFe: Structured approach
Spotify: Organic evolution

**Is SAFe Right for You?**

Consider SAFe when:
- Multiple teams (50+ people)
- Complex products/systems
- Need for coordination
- Regulatory requirements
- Distributed teams
- Enterprise scale

Not needed for:
- Single teams
- Simple products
- Startups (usually)

**Common Misconceptions**

"SAFe is too prescriptive"
→ It provides guidance, adapt to your context

"SAFe isn't really Agile"
→ It scales Agile principles, not every practice

"SAFe is only for software"
→ Used across industries

**The Journey**

Implementing SAFe is a journey:
1. **Train leaders** in Lean-Agile thinking
2. **Launch** first Agile Release Train
3. **Scale** to additional ARTs
4. **Extend** to portfolio
5. **Sustain** and improve

**Summary**

Scaling Agile is necessary for large organizations to:
- Maintain agility
- Coordinate at scale
- Deliver value predictably

SAFe provides a proven framework for this challenge.`,
      transcriptNL: `Agile werkt geweldig voor kleine teams. Maar wat gebeurt er als je 50, 100 of 1000 mensen hebt die samenwerken? Daar komen scaling frameworks zoals SAFe om de hoek.

**De Uitdaging**

Agile was ontworpen voor kleine, co-located teams (5-9 mensen). Maar moderne enterprises moeten coördineren:
- Meerdere teams
- Verspreide locaties
- Gedeelde resources
- Afhankelijkheden
- Strategische afstemming

**Het Schaalprobleem**

Naarmate organisaties groeien, worden ze geconfronteerd met:
- **Coördinatie**: Hoe blijven teams afgestemd?
- **Afhankelijkheden**: Hoe managen we inter-team afhankelijkheden?
- **Prioritering**: Wie beslist wat te bouwen?
- **Architectuur**: Hoe houden we systemen coherent?
- **Governance**: Hoe behouden we controle?

**Typische Symptomen**

Organisaties worstelen met:
- Teams werken in silo's
- Gedupliceerde inspanning
- Integratie nachtmerries
- Langzame oplevering
- Misalignment met bedrijfsdoelen
- Resource conflicten

**Wat is SAFe?**

Scaled Agile Framework (SAFe) is een set van organisatie- en workflowpatronen voor het implementeren van agile praktijken op enterprise schaal.

Gemaakt door Dean Leffingwell, nu gebruikt door duizenden organisaties wereldwijd.

**Kernwaarden**

SAFe is gebouwd op vier kernwaarden:

**1. Alignment (Afstemming)**
Iedereen werkt naar gedeelde doelstellingen

**2. Built-In Quality (Ingebouwde Kwaliteit)**
Kwaliteit is niet onderhandelbaar

**3. Transparency (Transparantie)**
Vertrouwen vereist zichtbaarheid

**4. Program Execution (Programma Uitvoering)**
Werkende software is de maatstaf

**Het SAFe Huis**

SAFe wordt gevisualiseerd als een huis met:
- **Dak**: Value (het doel)
- **Pilaren**: Team en Technical Agility, Agile Product Delivery, Enterprise Solution Delivery, Lean Portfolio Management
- **Fundament**: Leadership en Lean-Agile Culture

**Benefits van SAFe**

Organisaties rapporteren:
- 20-50% toename in productiviteit
- 25-75% snellere time to market
- 30-75% toename in kwaliteit
- 10-50% verbetering in medewerkersbetrokkenheid

**Waarom Teams SAFe Nodig Hebben**

- Agility behouden op schaal
- Afstemmen met bedrijfsstrategie
- Voorspelbaarheid verbeteren
- Afhankelijkheden coördineren
- Leren delen over teams
- Waste verminderen

**Real World Voorbeeld**

Stel je voor: Je bedrijf heeft 20 Scrum teams die een complex product bouwen. Zonder SAFe:
- Elk team heeft verschillende praktijken
- Geen gedeelde visie
- Integratie gebeurt laat
- Afhankelijkheden ontdekt te laat
- Business kan releases niet plannen

Met SAFe:
- Teams gesynchroniseerd elke 10 weken (PI Planning)
- Gedeelde roadmap en doelstellingen
- Afhankelijkheden vooraf geïdentificeerd
- Regelmatige integratie
- Voorspelbare oplevering

**Wie Gebruikt SAFe?**

Van startups tot Fortune 500:
- Software bedrijven
- Financiële diensten
- Gezondheidszorg
- Overheid
- Productie
- Retail

**SAFe vs Andere Frameworks**

**SAFe vs Scrum@Scale**
SAFe: Voorschrijvend, gedetailleerde guidance
Scrum@Scale: Lightweight, flexibel

**SAFe vs LeSS**
SAFe: Volledige enterprise oplossing
LeSS: Simpeler, minder rollen

**SAFe vs Spotify Model**
SAFe: Gestructureerde aanpak
Spotify: Organische evolutie

**Is SAFe Goed Voor Jou?**

Overweeg SAFe wanneer:
- Meerdere teams (50+ mensen)
- Complexe producten/systemen
- Behoefte aan coördinatie
- Regelgevende vereisten
- Verspreide teams
- Enterprise schaal

Niet nodig voor:
- Enkele teams
- Simpele producten
- Startups (meestal)

**Veelvoorkomende Misvattingen**

"SAFe is te voorschrijvend"
→ Het biedt guidance, pas aan aan je context

"SAFe is niet echt Agile"
→ Het schaalt Agile principes, niet elke praktijk

"SAFe is alleen voor software"
→ Gebruikt over industrieën heen

**De Reis**

SAFe implementeren is een reis:
1. **Train leiders** in Lean-Agile denken
2. **Launch** eerste Agile Release Train
3. **Schaal** naar extra ARTs
4. **Breid uit** naar portfolio
5. **Sustain** en verbeter

**Samenvatting**

Agile schalen is noodzakelijk voor grote organisaties om:
- Agility te behouden
- Op schaal te coördineren
- Voorspelbaar waarde te leveren

SAFe biedt een bewezen framework voor deze uitdaging.`,
      keyTakeaways: [
        'SAFe scales Agile practices for 50+ people working on complex products',
        'Four core values: Alignment, Built-In Quality, Transparency, Program Execution',
        'Organizations report 20-50% productivity gains with SAFe',
        'Use SAFe when you need to coordinate multiple teams on shared objectives',
      ],
      keyTakeawaysEN: [
        'SAFe scales Agile practices for 50+ people working on complex products',
        'Four core values: Alignment, Built-In Quality, Transparency, Program Execution',
        'Organizations report 20-50% productivity gains with SAFe',
        'Use SAFe when you need to coordinate multiple teams on shared objectives',
      ],
      keyTakeawaysNL: [
        'SAFe schaalt Agile praktijken voor 50+ mensen die aan complexe producten werken',
        'Vier kernwaarden: Alignment, Built-In Quality, Transparency, Program Execution',
        'Organisaties rapporteren 20-50% productiviteitswinst met SAFe',
        'Gebruik SAFe wanneer je meerdere teams moet coördineren op gedeelde doelstellingen',
      ],
      resources: [
        {
          name: 'SAFe Overview Poster',
          nameNL: 'SAFe Overzicht Poster',
          type: 'PDF',
          size: '3.2 MB',
          description: 'Visual overview of the SAFe framework',
          descriptionNL: 'Visueel overzicht van het SAFe framework',
        },
      ],
    },
    // Remaining lessons
    {
      id: 'safe-l2',
      title: 'SAFe Framework Overview',
      titleNL: 'SAFe Framework Overzicht',
      type: 'video',
      duration: '16:00',
      free: true,
      videoUrl: '',
      transcript: `The Scaled Agile Framework (SAFe 6.0) gives large organizations a complete operating model for building software-enabled solutions at scale. In this lesson you will get a tour of the framework — what every layer is, how they relate, and where you fit in.

### The Big Picture

SAFe is organized into four levels of concern, each addressing different organizational scope:

- **Team** — the individual Agile team practicing Scrum, Kanban, or XP
- **ART (Agile Release Train)** — 50–125 people building a solution together
- **Solution Train** — multiple ARTs collaborating on a very large solution
- **Portfolio** — strategy, funding, and value-stream investment across the enterprise

The framework also threads three dimensions through every level: Lean-Agile principles, Continuous Delivery, and a culture of relentless improvement.

### The Seven Core Competencies

SAFe 6.0 organizes capabilities into seven competencies:

1. **Lean-Agile Leadership** — leaders model the values and behaviors
2. **Team and Technical Agility** — teams use sound practices and engineering quality
3. **Agile Product Delivery** — customer-centric continuous flow
4. **Enterprise Solution Delivery** — applying agile to large, complex systems
5. **Lean Portfolio Management** — strategy, investment funding, agile governance
6. **Organizational Agility** — rapidly adapting strategy and structure
7. **Continuous Learning Culture** — innovation, improvement, learning are core values

These are SAFe's quality scorecard for transformations. A configuration that lacks one of these competencies will struggle.

### The Four SAFe Configurations

Not every organization needs the full framework. SAFe offers four configurations of increasing scope:

- **Essential SAFe** — Team + ART; the minimum for a coordinated train
- **Large Solution SAFe** — adds Solution Train for very large solutions (multiple ARTs)
- **Portfolio SAFe** — adds Lean Portfolio Management for strategic alignment
- **Full SAFe** — all three together for the largest enterprises

Start with Essential. Expand only when complexity demands it.

### The Agile Release Train (ART)

The ART is the heartbeat of SAFe. It is:

- A long-lived team-of-teams (5–12 teams, 50–125 people)
- Self-organizing around a value stream or solution
- Synchronized on a common cadence — typically a 10-week Program Increment (PI)
- Includes business, architecture, operations, security, and dev

Every two weeks, all teams in the ART deliver an integrated System Demo. Every PI, the ART runs PI Planning and Inspect & Adapt.

### Cadence and Sync

SAFe runs on rhythm:

\`\`\`
Iteration (2 weeks)        — team-level Scrum/Kanban iteration
PI (5 iterations + IP week) — train-level cadence, ~10 weeks
Strategic theme cycle      — annual portfolio rhythm
\`\`\`

Cadence enables planning, integration, and demos to happen at predictable points across hundreds of people.

### Built-In Quality

Quality is non-negotiable in SAFe. Five practices:

1. **Continuous Integration** — code merged and built constantly
2. **Test-First** — tests written before or with code
3. **Refactoring** — design improves continuously
4. **Pair work / Mob work** — knowledge spreads
5. **Definition of Done** — shared, enforced

Built-in quality enables continuous delivery, which enables business agility.

### Roles to Know

At the ART level, the most important roles:

- **Release Train Engineer (RTE)** — chief Scrum Master for the ART
- **Product Management** — owns the Program Backlog
- **System Architect** — owns architectural runway
- **Business Owners** — accountable executives
- **Scrum Masters / Team Coaches** — at team level
- **Product Owners** — at team level
- **System Team** — supports the ART with infrastructure and integration

### What SAFe Solves

The framework directly addresses:

- Coordination across many teams
- Strategic alignment from portfolio to team
- Predictable delivery at scale
- Architectural coherence
- Visibility for executives
- A common language across business and tech

### What SAFe Does Not Solve

- It does not replace good engineering — bad code stays bad
- It does not fix toxic culture — frameworks aren't culture
- It does not work without leadership commitment — Lean-Agile Leadership is the foundation

### Practice

Map your current organization to SAFe roles. Where are gaps? Where are duplicates? Identify one ART you could form, and the value stream it would serve.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'safe-l3',
      title: 'SAFe Configurations',
      titleNL: 'SAFe Configuraties',
      type: 'video',
      duration: '14:00',
      videoUrl: '',
      transcript: `SAFe 6.0 is not one framework but four nested configurations. Choosing the right configuration is the single most important decision a transformation team makes. Pick too small and you can't coordinate; pick too large and you drown in ceremony. This lesson walks through each configuration, who it fits, and how to evolve between them.

### The Four Configurations at a Glance

\`\`\`
Essential SAFe   → Team + ART
Large Solution   → Team + ART + Solution Train
Portfolio        → Team + ART + Lean Portfolio Management
Full SAFe        → Team + ART + Solution Train + LPM
\`\`\`

You can mix Large Solution and Portfolio independently of each other. Full SAFe combines both.

### Essential SAFe

The starting point and minimum viable SAFe. Includes:

- Multiple Agile Teams synchronized in one ART
- ART events: PI Planning, System Demo, Inspect & Adapt
- Roles: RTE, Product Management, System Architect, Business Owners
- Artifacts: Program Backlog, PI Objectives, ART Kanban

**Fits when**:
- 50–125 people working on a single solution
- One value stream
- Funding decisions made above your level (you receive a budget)

**Don't add more configuration if**: Essential is solving your problems.

### Large Solution SAFe

For solutions too large for one ART — typically 4 or more ARTs collaborating on the same solution. Common in aerospace, defense, automotive, telecom, healthcare devices, complex enterprise platforms.

Adds:
- **Solution Train** — coordinates multiple ARTs
- **Solution Demo** — integrated demo across all ARTs each PI
- **Solution Backlog and Solution Intent** — shared specifications
- New roles: Solution Train Engineer (STE), Solution Management, Solution Architect
- Pre- and Post-PI Planning to align across ARTs

**Fits when**:
- The solution itself is too complex for one ART
- Hardware + software integration is involved
- Regulatory or safety constraints require formal solution-level oversight

**Don't add it just because** you have multiple ARTs. If those ARTs deliver independent products, they belong to a Portfolio instead, not a Solution Train.

### Portfolio SAFe

For organizations that need to align strategy, funding, and execution. Adds Lean Portfolio Management:

- **Strategic Themes** — strategy translated into investment guidance
- **Portfolio Vision and Roadmap** — multi-year direction
- **Portfolio Backlog of Epics** — large initiatives funded as needed
- **Lean Budgets** — funding to value streams instead of project-by-project
- **Portfolio Kanban** — flow of epics from idea through delivery
- New roles: Lean Portfolio Management (LPM) function, Epic Owners, Enterprise Architect

**Fits when**:
- Multiple ARTs need strategic coordination
- Project-by-project funding is creating delay and waste
- Executive leadership wants Lean-Agile finance

### Full SAFe

Combines Essential + Large Solution + Portfolio. Used by the largest enterprises building complex, multi-ART solutions under portfolio governance. A relatively small minority of SAFe adopters operate at Full.

### Choosing a Configuration

Use these questions:

1. Do you have one ART or many? → if many, you need either Large Solution or Portfolio
2. Are the ARTs delivering one solution or many? → one solution: Large Solution; many products: Portfolio
3. Do you need Lean budgeting? → if yes, Portfolio
4. Do you need both the solution-level and portfolio-level concerns? → Full SAFe

### Common Mistakes

- **Over-configuring** — adopting Full SAFe before mastering Essential
- **Under-configuring** — running multiple uncoordinated ARTs without portfolio alignment
- **Cargo-culting Solution Train** — adding it because it looks impressive, not because solution complexity demands it
- **Ignoring LPM** — leaving funding decisions in old project-mode while teams operate in agile mode

### Evolution Path

A typical SAFe adoption:

1. **Year 1** — launch first ART using Essential SAFe
2. **Year 2** — launch additional ARTs; add LPM (Portfolio SAFe) when funding friction emerges
3. **Year 3+** — evaluate Solution Train if a single complex solution requires multi-ART coordination

Don't rush. Each configuration is hard to operate well; mastering each layer before adding the next is far cheaper than implementing all of them at once.

### Practice

Pick a configuration that best fits your current organization. List three signals that tell you you've chosen correctly, and three signals that would tell you you should evolve to the next configuration.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'safe-l4',
      title: 'Core Values and Principles',
      titleNL: 'Kernwaarden en Principes',
      type: 'video',
      duration: '12:00',
      videoUrl: '',
      transcript: `SAFe is built on four core values and ten Lean-Agile principles. Together they describe how SAFe organizations behave when nobody is watching — and that is the real test of whether a transformation has taken root.

### The Four Core Values

**1. Alignment**

Everyone in the enterprise pulls in the same direction. Alignment is achieved by:
- Cascading strategy from portfolio to ART to team
- Synchronized cadence across all ARTs
- Shared PI objectives that link to portfolio outcomes
- Common backlog refinement and prioritization frameworks

Without alignment, agility produces chaos at scale.

**2. Built-In Quality**

Quality cannot be added later. Built-In Quality is achieved by:
- Continuous Integration and Continuous Delivery
- Test-First development (TDD/BDD)
- Refactoring as a normal activity
- Pairing and mobbing
- A team-level Definition of Done that nobody negotiates away

Skip quality in SAFe and the speed advantage disappears within two PIs.

**3. Transparency**

Trust is impossible without visibility. Transparency is achieved by:
- Open backlogs accessible to everyone
- Public WIP and flow boards
- Honest impediment reporting
- Real, unscrubbed demos
- Public risk and dependency boards

Hidden work is unmanageable work.

**4. Program Execution**

Working solutions are the measure. Program Execution is achieved by:
- Predictable PI delivery
- Real System Demos every two weeks
- ART Predictability Measure (PI Objectives Plan vs Actual)
- Inspect & Adapt that produces actual changes

A SAFe organization that ships working software regularly proves itself; one that doesn't, doesn't.

### The Ten Lean-Agile Principles

**#1 — Take an economic view**

Decisions should optimize for total economic outcome, not local optimization. Use **Cost of Delay** and **WSJF (Weighted Shortest Job First)** to sequence work.

**#2 — Apply systems thinking**

Optimize the whole, not the part. The slowest team determines the value stream's throughput.

**#3 — Assume variability; preserve options**

Avoid premature commitment. Use **Set-Based Design** — explore multiple solution paths and converge later when more is known.

**#4 — Build incrementally with fast, integrated learning cycles**

Ship every two weeks. Get feedback. Adjust. Don't disappear into long phases hoping to surface with the right answer.

**#5 — Base milestones on objective evaluation of working systems**

Replace status-meeting milestones with working-software milestones. The PI System Demo is the meaningful milestone, not a slide deck.

**#6 — Make value flow without interruptions**

Visualize work, limit WIP, manage queue length, address bottlenecks. Flow is the goal; activity is not flow.

**#7 — Apply cadence, synchronize with cross-domain planning**

Cadence makes the unpredictable predictable. PI Planning aligns the unpredictable across domains.

**#8 — Unlock the intrinsic motivation of knowledge workers**

Autonomy, mastery, purpose. Command-and-control management cannot get the best from knowledge work.

**#9 — Decentralize decision-making**

Decisions that are frequent, urgent, and require local information should be made locally. Reserve centralization for infrequent, durable, broad-impact decisions.

**#10 — Organize around value**

Structure around value streams, not around functions or departments. The org chart is a tool, not the goal.

### How to Use the Values and Principles

These are not posters. They are decision filters:

- When prioritizing — apply principles 1, 6, 9
- When designing teams — apply principles 8, 10
- When managing exceptions — return to the values: alignment, quality, transparency, execution
- When stuck — ask which principle is being violated

In a healthy SAFe organization, leaders cite the principles in actual conversations, not just at training sessions.

### Common Misuses

- Quoting values without practicing them — the worst form of theatre
- Selectively ignoring transparency when it embarrasses leadership
- Treating "decentralize decision-making" as carte blanche when the decision is durable and broad
- Using "preserve options" to avoid commitment indefinitely

### Practice

Pick the most recent significant decision in your organization. Identify which principle should have driven it. Decide whether the decision was actually consistent with that principle. The gap is your learning.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'safe-l5',
      title: 'Quiz: SAFe Basics',
      titleNL: 'Quiz: SAFe Basis',
      type: 'quiz',
      duration: '10:00',
      quiz: [],
    },
  ],
};

const module2: Module = {
  id: 'safe-m2',
  title: 'Agile Release Train',
  titleNL: 'Agile Release Train',
  order: 1,
  icon: 'Train',
  color: '#F472B6',
  gradient: 'linear-gradient(135deg, #F472B6 0%, #EC4899 100%)',
  lessons: [
    {
      id: 'safe-l6',
      title: 'What is an ART?',
      titleNL: 'Wat is een ART?',
      type: 'video',
      duration: '14:00',
      videoUrl: '',
      transcript: `The Agile Release Train (ART) is the central organizing unit of SAFe. Get the ART right and most other SAFe practices follow naturally; get it wrong and even the best ceremonies become theatre. In this lesson you will learn what an ART is, who staffs it, how it operates, and how to know when yours is actually functioning as one.

### The ART Definition

An Agile Release Train is a long-lived, self-organizing team-of-teams of typically 50 to 125 people who plan, commit, develop, and deploy together. ARTs:

- Are aligned to a value stream or solution
- Operate on a fixed cadence — typically a 10-week Program Increment (PI)
- Include all roles needed to deliver: dev, test, ops, security, business, architecture
- Run synchronized iterations, demos, and improvement events

The metaphor is a real train: it leaves the station on time whether or not every passenger is ready, and everyone benefits from the predictability.

### Why "Train" Is the Right Metaphor

A train has:
- A fixed schedule (cadence)
- A fixed route (value stream)
- Multiple cars (teams) traveling together
- A conductor (RTE) and engineers (Scrum Masters) operating it
- Cargo (PI Objectives) loaded and unloaded at known stations
- Inspection between trips (Inspect & Adapt)

Programs and projects are different — they are temporary. ARTs are permanent. They are how the organization actually works, not a vehicle to deliver one initiative.

### Roles on the ART

**Release Train Engineer (RTE)** — chief Scrum Master for the train. Facilitates PI events, removes systemic impediments, helps the train operate predictably.

**Product Management** — owns the Program Backlog and Vision; decides what to build, in what order.

**System Architect / Engineer** — owns architectural runway; ensures technical decisions support both current and upcoming features.

**Business Owners** — accountable executives who set context, accept PI Objectives, attend Demos.

**Scrum Masters / Team Coaches** — at team level; partner with the RTE.

**Product Owners** — at team level; partner with Product Management.

**System Team** — supports the ART with shared infrastructure, integration environments, end-to-end test capabilities.

**Other shared specialists** — UX, DevOps, security, compliance, depending on the value stream.

### ART Cadence

A typical PI:

\`\`\`
Iteration 1 (2 weeks) — develop, demo
Iteration 2 (2 weeks) — develop, demo
Iteration 3 (2 weeks) — develop, demo
Iteration 4 (2 weeks) — develop, demo
IP Iteration  (2 weeks) — Innovation & Planning, I&A, next PI Planning
\`\`\`

Within each iteration, teams run their own Scrum or Kanban events, plus the **System Demo** every two weeks where teams integrate and demonstrate their combined work.

### Forming an ART

Standing up an ART is a deliberate act:

- Identify the value stream the ART serves
- Define the operational scope (which teams, which products, which platforms)
- Identify and train key roles (RTE, Product Management, Scrum Masters, Product Owners)
- Train all teams in SAFe basics
- Schedule the first PI Planning
- Run PI Planning and start the cadence

The first three PIs are usually rocky. Stick with the cadence. Adjust at Inspect & Adapt, not by ad hoc reorganization.

### How to Tell If Your ART Is Healthy

Healthy ARTs exhibit:

- High **PI Predictability Measure** (target 80–100%)
- Real System Demos every two weeks (not slide decks)
- Public dependency and risk boards
- Stable team membership
- Architecture runway sufficient to support upcoming features
- Business Owners attending Demo and PI Planning consistently

Unhealthy signs:

- "Project teams" pulled into and out of the ART for specific initiatives
- Demos that show plans, not working software
- Teams that don't integrate until the IP iteration
- Business Owners absent from PI Planning
- Predictability scores swinging wildly PI to PI

### Common ART Anti-Patterns

- **Too small** — fewer than three teams; you don't need an ART, you need one team
- **Too large** — more than 125 people; coordination cost outweighs the benefit, split into two ARTs
- **Wrong groupings** — teams aligned to component areas instead of features; cross-team dependencies dominate
- **Borrowed people** — team members shared across multiple ARTs; allegiance gets diluted

### Practice

Map your current organization. Could you form one ART today? If yes, what is its value stream, who are its teams, who are its key roles? If no, what is the closest functional grouping you'd need to refactor first?`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'safe-l7',
      title: 'PI Planning',
      titleNL: 'PI Planning',
      type: 'video',
      duration: '18:00',
      videoUrl: '',
      transcript: `PI Planning is SAFe's signature event. It is two days, every 8 to 12 weeks, where the entire ART — typically 50 to 125 people — gathers in one room or Zoom to plan the next Program Increment. Get PI Planning right and the next 10 weeks practically run themselves; get it wrong and you spend the rest of the PI in firefighting mode.

### Why PI Planning Matters

Without PI Planning, multi-team coordination devolves into endless cross-team meetings. With it, alignment happens once, in two days, in one place. SAFe calls PI Planning "the heartbeat of the ART" because everything else — daily standups, iteration planning, system demos, dependency management — flows from the commitments made in this event.

### The Two-Day Agenda

**Day 1 — Context, Vision, Team Breakouts**

- Business Context (Business Owners) — strategy, market, customer needs
- Product/Solution Vision (Product Management) — what we're building
- Architecture Vision and Development Practices (System Architect)
- Planning Context and Lunch (RTE)
- Team Breakouts #1 — teams draft PI Objectives, identify risks/dependencies
- Draft Plan Review — each team presents in 5 minutes; risks raised
- Management Review and Problem-Solving — leadership adjusts scope/priorities overnight

**Day 2 — Refinement, Confidence, Commitment**

- Planning Adjustments (RTE) — overnight changes
- Team Breakouts #2 — refine plans based on overnight changes
- Final Plan Review — each team presents the refined plan
- Program Risks — ROAM each: Resolved, Owned, Accepted, Mitigated
- Confidence Vote — fingers 1–5 on whether teams will meet their PI Objectives
- Plan Rework (if needed) — rare, only if confidence is below 3
- Planning Retrospective and Moving Forward

### The Outputs

By the end of two days, the ART has produced:

- **Team PI Objectives** — what each team commits to, with business value scores
- **ART PI Objectives** — aggregated, business-value scored
- **Program Board** — a wall (physical or digital) with features, dependencies between teams, milestones, and external dates
- **Program Risks** — ROAMed
- **A confidence vote** — averaged across the ART, target 4 or 5

These artifacts persist throughout the PI; the Program Board is updated as new dependencies emerge.

### Preparation — The 80% Rule

A successful PI Planning depends on preparation. Going in:

- Vision is clear and stable
- Top 10 features are well-formed and roughly sized
- Architectural runway is in place for the top features
- Logistics (room, breakouts, tools, food) are sorted
- Teams have done backlog refinement before the event

If preparation is poor, no facilitation can rescue PI Planning. The RTE owns preparation as much as facilitation.

### Distributed PI Planning

Modern ARTs are often distributed. Tools like Mural, Miro, Jira Align, or PI Planning by Atlassian replace physical walls. Practices that translate well:

- Pre-record context videos so live sessions are interactive only
- Use breakout rooms for team-of-teams sessions
- Time-box rigidly — distributed sessions drift more than co-located ones
- Maintain a single dependency board everyone updates

Co-located PI Planning still produces stronger alignment. If budget allows, gather in person at least once or twice a year.

### Confidence Vote Mechanics

Each team votes 1 to 5 on confidence in meeting PI Objectives:

- 5 = high confidence
- 4 = solid plan, manageable risks
- 3 = will probably succeed
- 2 = significant doubt
- 1 = low confidence; serious problems

If the team average is below 3, replan that team's commitments. If the ART average is below 3, replan the PI. Don't proceed on a low-confidence vote — predictability collapses.

### Common PI Planning Failures

- Vision changes during the event — destabilizes everything
- Top features not refined enough — teams can't size or commit
- Business Owners absent — no real authority on PI Objective acceptance
- Dependencies under-discussed — blow up in the first iteration
- Compressed timeline — trying to PI Plan in one day; quality suffers

### Best Practices

- Hold IP iteration the week before — Inspect & Adapt feeds straight into the next PI
- Capture decisions and parking lots in real time
- Keep technology simple — over-tooling distracts from conversation
- Run a small dry-run with key roles 1–2 weeks before the event

### Practice

Sketch the agenda for your next PI Planning. Identify one preparation gap (refinement, vision clarity, environment readiness) and fix it before the event. The single best lever for PI Planning success is preparation, not facilitation.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'safe-l8',
      title: 'System Demo',
      titleNL: 'System Demo',
      type: 'video',
      duration: '10:00',
      videoUrl: '',
      transcript: `The System Demo is SAFe's continuous validation event. Every two weeks, the entire ART comes together to see and use the integrated work from all teams in a real environment. It is the most important quality signal in the framework — and the one most often weakened into a slide deck.

### Why the System Demo Exists

Individual team demos at the iteration level are necessary but insufficient. A team demo shows what one team built. The System Demo shows whether the **integrated whole** actually works. Without it:

- Integration issues hide until late in the PI
- Architectural drift goes unnoticed
- Business Owners can't see real progress
- The team-of-teams loses shared identity

The System Demo is also the cadence-based moment for stakeholders, customers, and Business Owners to give the ART real, course-correcting feedback.

### What "System" Means

System Demo means demonstrating the integrated solution running in a staging-grade environment with realistic data. Not:

- Slide decks
- Isolated team work
- Mocked-up screens
- "Imagine if this worked..."

If you cannot show running software in an integrated environment, the System Demo has failed and you have a continuous-integration problem.

### Who Attends

- Entire ART — all teams, RTE, Product Management, System Architect
- Business Owners — the executives accountable for outcomes
- Stakeholders — actual or proxy customers, downstream consumers
- Optional: System Team, Solution Train representatives, executive observers

Attendance from Business Owners is critical. If they don't attend, the demo loses its feedback loop and becomes ceremonial.

### Format and Timing

A typical System Demo runs 45 to 60 minutes:

- 5 min — context, what was promised this iteration
- 30 min — feature demonstrations (real, integrated, in environment)
- 10 min — feedback, questions, comments
- 10 min — observations, course corrections, next iteration preview

Held on the last day of each iteration, immediately after team-level demos.

### Preparation

The System Team and feature owners prepare:

- Integrated build deployed to demo environment with realistic data
- Demo script — short, narrative, customer-perspective
- Feature owners assigned and rehearsed
- Backups for components likely to fail (recorded clips for unstable parts)

Preparation matters because the demo runs in 45 minutes; you don't have time to debug live.

### Driving Quality Up

The System Demo's pressure surfaces quality issues early:

- Integration tests must run continuously, not just during the demo
- Environments must be production-like
- Data must be representative, not skeletal
- Defects found in demos must enter team backlogs immediately

Treat the demo as a quality probe, not a marketing event.

### Solution Demo (For Large Solution SAFe)

When multiple ARTs collaborate on a single solution, add a **Solution Demo** that integrates work across all the ARTs. Cadence: each PI rather than each iteration, due to coordination overhead. Same principles, larger scope.

### Common Failure Modes

- **Slide decks instead of running software** — universally a sign of missed integration
- **Skipped when teams aren't ready** — the discipline is exactly to demo what's done
- **Business Owners absent** — no feedback, no course correction
- **Demo of components, not features** — customers see features, not components; demo accordingly
- **Cancelled when an iteration goes badly** — the bad iteration is exactly when you need the visibility

### Improving Your System Demo

- Move toward demoing in production or a production-like environment
- Capture demo outputs as feedback items in the program backlog
- Time-box rigidly; better to skip a feature than overrun
- Rotate the demo facilitator across PIs to share skill
- Record the demo for asynchronous viewers

### Practice

Attend or run your next System Demo with a single question in mind: did we see integrated, working software, or something less? If less, identify what kept the integration from being real and propose a fix at the next Inspect & Adapt.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'safe-l9',
      title: 'Inspect & Adapt',
      titleNL: 'Inspect & Adapt',
      type: 'video',
      duration: '12:00',
      videoUrl: '',
      transcript: `Inspect & Adapt (I&A) is the ART's PI-level retrospective and improvement event. It happens at the end of every Program Increment, just before PI Planning for the next one. Done well, it is where SAFe organizations actually get better; done poorly, it is where impediments collect dust.

### The Three Parts of Inspect & Adapt

I&A is a three-part workshop, typically half a day:

**Part 1 — PI System Demo**

A larger, more inclusive System Demo showing all the integrated work delivered in the PI. Stakeholders, executives, customers attend. This is the proof that the PI happened.

**Part 2 — Quantitative and Qualitative Measurement**

The ART reviews:
- **PI Predictability Measure** — planned vs actual business value of PI Objectives, target 80–100%
- **Other ART metrics** — flow, quality, employee engagement, customer satisfaction
- **Team-by-team performance summary**

This is data, not opinion. Predictability is the headline number; if it is low or declining, the rest of the meeting must explain why.

**Part 3 — Problem-Solving Workshop**

Following a structured format:

1. **Agree on the problem** — write a clear statement
2. **Apply root-cause analysis** — typically a Fishbone or 5-Whys
3. **Identify the biggest root cause** — Pareto vote
4. **Restate the problem against that root cause**
5. **Brainstorm solutions** — divergent then convergent
6. **Identify improvement backlog items** — concrete, owned, dated

The output is a set of improvement items that go into the **Program Backlog** for the next PI. They get prioritized like any other work.

### Why It Works

Most retrospectives produce ideas that vanish. I&A doesn't because:

- Problems are tackled one at a time, structurally
- Outcomes become backlog items with owners
- Improvements are committed in the very next PI Planning
- The whole ART (not just managers) participates in solving

When this discipline is real, ARTs measurably improve PI over PI.

### Common I&A Failure Modes

- **Skipping or rushing** — half-day becomes one hour, problem-solving becomes brainstorming
- **No measurement** — qualitative impressions instead of metrics
- **Same root cause every PI** — improvements weren't actually executed
- **Improvements not in next PI's backlog** — they vanish
- **Leadership talks more than teams** — the workshop's value comes from team voice
- **Punitive tone** — turning I&A into a blame session destroys honesty

### Preparing for I&A

The RTE and team coaches prepare:

- Predictability data computed and visible
- Metrics dashboards ready
- Demo environment confirmed
- Problem-solving facilitation pattern chosen and rehearsed
- Logistics — room, breakouts, voting tools, sticky notes

Good preparation makes the difference between a learning event and a venting session.

### Choosing Problems to Tackle

You can't fix everything in one I&A. Choose:

- **Highest-impact** — what would unblock the most progress?
- **Within ART control** — don't tackle company-wide problems in an ART I&A; escalate them
- **Concrete enough to act on** — "communication is bad" is not actionable; "dependency board not updated mid-iteration" is

Three to five problems per I&A is typical. Each generates a few improvement items.

### Linking to Continuous Improvement

I&A items feed an organization-wide pattern:

- Team-level retrospectives → team improvement
- I&A → ART improvement
- Solution-level I&A (in Large Solution SAFe) → solution improvement
- Portfolio-level reviews → portfolio improvement

Each level handles its own scope; escalation moves problems to the right level. Without I&A, the ART has no formal channel to drive its own improvement.

### Best Practices

- Time-box rigidly — half a day, no more, no less
- Make team voices loudest; leaders coach and listen
- Track improvement-item completion across PIs; if completion rates are low, that's itself an improvement opportunity
- Rotate facilitation so the skill spreads
- Celebrate fixed problems publicly to reinforce the habit

### Practice

At your next I&A, pick one improvement item that gets generated. Track it through PI Planning, into a team's backlog, into actual delivery. Confirm it landed. If it didn't, ask why — that question itself is the next I&A's most valuable input.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'safe-l10',
      title: 'Release on Demand',
      titleNL: 'Release on Demand',
      type: 'video',
      duration: '10:00',
      videoUrl: '',
      transcript: `Release on Demand decouples release decisions from delivery cadence. In SAFe 6.0 it is one of the four core competencies of Agile Product Delivery. The principle: build continuously, integrate continuously, deploy continuously — but release **when the business decides**, not on a fixed engineering rhythm.

### Why Decouple Release from Delivery?

Old-style releases bundled fixed feature sets to fixed dates. The result:
- Long delays between code-ready and customer-receiving
- Big-bang releases with high risk
- Inability to respond to market signals

Release on Demand fixes this by separating four concerns:

\`\`\`
Continuous Exploration → understand needs, define hypotheses
Continuous Integration → develop, integrate, test continuously
Continuous Deployment → deploy to production-like environments
Release on Demand     → release to customers when valuable
\`\`\`

The first three happen as fast as the engineering practice allows. The fourth happens when business value, customer readiness, market timing, and risk align.

### The Four Aspects of Release on Demand

**1. Release**

The act of making a feature available to customers. Can be:
- A subset of customers (canary release)
- A region or segment (rolling release)
- All customers (full release)

Release decisions are made by Product Management with Business Owner concurrence.

**2. Stabilize and Operate**

Production work is real work. Includes:
- Production monitoring
- Incident response
- Performance tuning
- Capacity management
- On-call rotations

ARTs that ignore operational stability watch their feature delivery rate degrade as defects accumulate.

**3. Measure**

Each release should generate evidence:
- Adoption metrics
- Performance metrics
- Business outcome metrics tied to PI Objectives
- Customer feedback

Without measurement, release becomes a hand-off rather than a learning event.

**4. Learn**

Convert measurements into decisions:
- Was the hypothesis validated?
- Should the feature expand, retract, evolve?
- What does this teach about other planned features?

Each release is a hypothesis test. The ART that learns from releases pivots faster than competitors.

### Enabling Practices

Release on Demand requires technical and process foundations:

- **Continuous Integration** — code merged frequently, automated tests gating each merge
- **Continuous Deployment** — automated promotion through environments
- **Feature flags / Toggles** — release infrastructure separate from deployment
- **Automated monitoring and alerting** — production visibility
- **Production-like staging** — high-fidelity pre-release environment
- **Blue/green or canary infrastructure** — safe release patterns
- **Rollback automation** — confidence to release because reversal is cheap

ARTs without these foundations cannot honestly claim Release on Demand.

### The Release Strategy

Different products release with different patterns:

- **Continuous release** — multiple times daily (mature SaaS, internal tools)
- **Daily/weekly release** — common pattern for digital products
- **PI-aligned release** — release at PI boundaries, common for enterprise software
- **Event-driven release** — releases tied to business cycles (regulatory dates, sales seasons)

Pick the pattern that matches business need, then build engineering practices to support it.

### Risk Management for Releases

Releasing on demand demands rigorous risk management:

- **Pre-release readiness** — security review, compliance check, performance validation
- **Release plan** — communications, support readiness, rollback criteria
- **Feature flag strategy** — controlled exposure, kill switch
- **Post-release monitoring** — first 24/72 hours under heightened watch
- **Incident playbooks** — practiced, not just documented

The discipline allows you to release fast **and** safe. Skip discipline and "release on demand" becomes "outage on demand".

### Common Failure Modes

- Release on Demand declared without the engineering foundations
- Feature flags introduced without governance — flag debt accumulates
- No measurement — releases happen but learning doesn't
- Operations team not staffed for higher release frequency
- Compliance or security treated as occasional gates rather than continuous practices

### Best Practices

- Track and improve **lead time from commit to production**
- Track and improve **change failure rate** and **mean time to recover**
- Run release postmortems on the worst incidents
- Treat operational and reliability work as first-class backlog items, not interruptions
- Build a feature-flag retirement discipline so flags don't become permanent

### Practice

For one feature in your current product, list every step from "code merged" to "customer using". Identify the biggest delay. That delay is your highest-leverage Release on Demand improvement.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'safe-l11',
      title: 'Quiz: ART',
      titleNL: 'Quiz: ART',
      type: 'quiz',
      duration: '12:00',
      quiz: [],
    },
  ],
};

const module3: Module = {
  id: 'safe-m3',
  title: 'Portfolio & Large Solution',
  titleNL: 'Portfolio & Large Solution',
  order: 2,
  icon: 'Building2',
  color: '#FBCFE8',
  gradient: 'linear-gradient(135deg, #FBCFE8 0%, #F472B6 100%)',
  lessons: [
    {
      id: 'safe-l12',
      title: 'Lean Portfolio Management',
      titleNL: 'Lean Portfolio Management',
      type: 'video',
      duration: '16:00',
      videoUrl: '',
      transcript: `Lean Portfolio Management (LPM) is how SAFe handles strategy, funding, and execution at the enterprise level. Without LPM, agile teams operate inside an unchanged project-funding model, and the friction kills the transformation. With LPM, the portfolio operates with the same Lean-Agile principles as the teams it funds.

### What LPM Replaces

Traditional portfolio management runs on:
- Annual project budgets fixed in advance
- Cost-center funding that moves only at year boundaries
- Project-by-project approval cycles
- Detailed business cases requiring forecasts no one believes

LPM replaces these with:
- Persistent value-stream funding
- Lean budgets adjusted as evidence accumulates
- Lightweight epic-level governance
- Hypothesis-driven business cases

The shift is from funding projects to funding teams who deliver value over time.

### The Three LPM Functions

LPM is organized around three primary functions:

**1. Strategy & Investment Funding**

- Connects strategy to funding
- Maintains the Portfolio Vision and Strategic Themes
- Allocates Lean Budgets to value streams
- Adjusts allocations based on evidence

**2. Agile Portfolio Operations**

- Coordinates value streams and ARTs
- Fosters operational excellence
- Drives Lean-Agile practices across the portfolio
- Often staffed by an Enterprise Agile coaching function

**3. Lean Governance**

- Manages portfolio-level forecasting and budgeting
- Coordinates audit, compliance, expenditure
- Measures portfolio performance
- Governs without micromanaging

These three together form the LPM function — sometimes a small team, sometimes a virtual function, depending on enterprise scale.

### The Portfolio Kanban

LPM uses a Kanban system to manage the flow of large initiatives — Epics — through stages:

\`\`\`
Funnel → Reviewing → Analyzing → Portfolio Backlog → Implementing → Done
\`\`\`

WIP limits at each stage prevent overwhelming the system. Movement between stages requires evidence and approval, with criteria growing more rigorous as Epics approach implementation.

### Lean Budgets and Guardrails

Instead of project budgets, LPM funds **value streams** with persistent operating budgets. Investments are governed by **Guardrails**:

- **Define spending policies** — what's appropriate for capacity, what triggers governance review
- **Optimize value and solution integrity** — keep architectural runway healthy
- **Approve significant initiatives** — Epics over a threshold need explicit Lean Business Cases
- **Apply continuous business owner engagement** — value-stream business owners stay engaged

Lean Budgets remove most project-by-project approval friction while preserving fiscal control through guardrails.

### Lean Business Cases

For Epics, LPM uses lightweight business cases:

- **Hypothesis statement** — we believe that X will result in Y measured by Z
- **Customer / business need**
- **Solution approach**
- **Lean MVP** — the smallest delivery that validates the hypothesis
- **Estimates of cost and benefit** — ranges, not false precision
- **Risks and assumptions**

Approval is to fund the MVP, not the entire Epic — additional funding follows evidence.

### Strategic Themes

Strategic Themes are the bridge from corporate strategy to value-stream investment:

- Derived from enterprise strategy
- Time-bound and measurable
- Inform value-stream prioritization
- Reviewed annually or as strategy shifts

Examples: "Become Mobile-First", "Reduce Cost-to-Serve by 30%", "Expand into European Markets".

### Connecting Portfolio to ART

The flow is:

\`\`\`
Strategic Themes
     ↓
Portfolio Vision and Roadmap
     ↓
Portfolio Backlog (Epics)
     ↓
ARTs select Features from Epics
     ↓
Teams deliver Stories
\`\`\`

LPM ensures the right Epics reach the right ARTs at the right time, with the right funding.

### Metrics LPM Owns

LPM tracks and reports:

- **Strategic Theme alignment** — % of capacity invested in each theme
- **Lean Budget consumption** — operating spend vs allocation
- **Epic flow** — Epics in flight, lead time, throughput
- **Value-stream performance** — predictability, velocity, quality
- **Outcome metrics** — actual vs hypothesized benefit realization

These metrics drive funding adjustments and strategic conversations.

### Common LPM Anti-Patterns

- LPM declared but funding still flows project-by-project
- Strategic Themes too vague to act on
- Lean Business Cases evolved into traditional 50-page approval documents
- Portfolio Kanban not enforced — Epics enter Implementing without analysis
- LPM team too large or too small — both extremes fail

### Best Practices

- Stand up LPM after at least 2–3 ARTs are functioning; LPM with no ARTs is theatre
- Pair LPM with Finance partners early — funding-model change requires their consent
- Publish strategic themes and Lean Budget allocations broadly
- Run a quarterly Portfolio Sync to align value streams and adjust allocations

### Practice

For your portfolio, list the active major initiatives. For each, identify whether they would qualify as Epics under LPM (large, value-stream-spanning, multi-PI). The exercise often reveals that "projects" should be treated as Epics requiring portfolio-level governance.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'safe-l13',
      title: 'Value Streams',
      titleNL: 'Value Streams',
      type: 'video',
      duration: '14:00',
      videoUrl: '',
      transcript: `Value Streams are how SAFe organizes work around customer value rather than around departments, components, or projects. They are the foundation of the framework — get value streams wrong and ARTs end up cutting across natural seams, fighting dependencies, and never quite delivering coherent outcomes.

### What Is a Value Stream?

A value stream is the sequence of steps an organization uses to deliver a continuous flow of value to a customer. SAFe distinguishes two types:

**Operational Value Streams**

The series of activities that deliver a product or service to a customer:
- Order to cash for an e-commerce company
- Patient admission to discharge in a hospital
- Trade execution to settlement in a bank

Operational value streams describe how the business runs.

**Development Value Streams**

The activities that develop the systems and capabilities that enable operational value streams:
- The teams and platforms that build the e-commerce checkout
- The IT systems that support patient admission
- The trading platform development teams

Development value streams describe how the systems are built.

In SAFe, ARTs typically align to development value streams.

### Why Value Streams Matter

Aligning to value streams produces:

- **Faster flow** — fewer hand-offs between departments
- **Clearer ownership** — one team-of-teams owns the customer outcome
- **Reduced waste** — coordination overhead drops
- **Better metrics** — flow can be measured end-to-end
- **Stronger customer focus** — teams see real users

Aligning to functions or components produces the opposite — silos, hand-offs, blame.

### Identifying Value Streams

Run a **Value Stream Identification Workshop** with senior business and tech leaders:

1. Identify the primary customers (external and internal)
2. Identify the operational value streams that serve them
3. Identify the systems and capabilities those operational streams need
4. Identify the development value streams that build those systems
5. Map them: people, locations, current organization, dependencies

The output is a value-stream map showing the natural lines along which ARTs should form.

### Value Stream Mapping

For each value stream, map:

\`\`\`
Trigger Event → Step 1 → Step 2 → ... → Customer Value Delivered
\`\`\`

For each step, capture:
- Process time (the time the step actively works on the request)
- Lead time (the time the request waits + works through the step)
- Quality / first-pass yield
- Hand-offs and queues

The total lead time vs total process time reveals where waste lives. Most value streams are 5%–15% process time and 85%–95% wait time.

### Improving Flow

Once mapped, improve flow through:

- **Reducing hand-offs** — each hand-off introduces wait and rework risk
- **Reducing batch sizes** — smaller batches move faster
- **Reducing WIP** — fewer items in flight = faster lead time per item
- **Eliminating waste** — wait, defects, over-production, motion, inventory
- **Eliminating queues** — feed work to teams as they're ready
- **Identifying and addressing bottlenecks** — Theory of Constraints applies

ARTs measure flow continuously and run improvement experiments at every Inspect & Adapt.

### Value Stream Funding

LPM funds value streams, not projects. The funding follows the value stream's persistent capacity:

- The ART's ongoing operating budget
- Tooling, infrastructure, and platforms
- Training and improvement investment
- Strategic initiative funding through Epics

This makes funding stable, encourages long-term thinking, and removes the project-by-project approval friction.

### Common Value-Stream Mistakes

- **Mapping organizationally** — the value stream just becomes the org chart relabeled
- **Too many value streams** — every product or feature treated as its own stream
- **Too few value streams** — one mega-stream with no real coherence
- **Confusing operational and development value streams** — leads to ART misalignment
- **Static maps** — value streams change as products and customers evolve; refresh annually

### Aligning ARTs to Value Streams

After identifying value streams, allocate ARTs:

- One ART per development value stream is the cleanest
- Larger value streams may need multiple ARTs (and a Solution Train)
- Smaller value streams may share an ART with another small one
- A single ART should never span unrelated value streams

The goal is a clear answer to the question: "What value does this ART deliver, to whom, end to end?"

### Best Practices

- Hold a value-stream identification workshop before launching ARTs
- Refresh value-stream maps at least annually
- Make flow metrics visible and improvement-oriented at the ART level
- Pair every value stream with a named business owner

### Practice

Sketch the operational value streams of your organization. Pick the most important one. Identify the development value stream that supports it. That development value stream is the right place to launch your most strategically important ART.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'safe-l14',
      title: 'Large Solution SAFe',
      titleNL: 'Large Solution SAFe',
      type: 'video',
      duration: '12:00',
      videoUrl: '',
      transcript: `Large Solution SAFe is the configuration designed for solutions too big for a single ART. Aerospace systems, automotive platforms, telecom networks, complex healthcare devices, defense systems — these typically need 3, 5, even 10+ ARTs collaborating on the same solution. Large Solution SAFe gives you the structure to coordinate them.

### When You Need Large Solution SAFe

The signal: a single solution requires more than ~125 people to build, and those people cannot reasonably split into independent products. Common patterns:

- Hardware + firmware + software + cloud + apps integrated end-to-end
- Regulated solutions with shared compliance scope
- Telecom platforms with shared infrastructure layers
- Defense systems with strict integration requirements

If your "solution" is actually multiple loosely-coupled products, you don't need Large Solution SAFe — you need Portfolio SAFe.

### The Solution Train

The Solution Train is the team-of-trains. It coordinates multiple ARTs working on the same solution. Like an ART, it is long-lived, runs on cadence, and has dedicated roles.

Key Solution Train roles:

- **Solution Train Engineer (STE)** — the chief Scrum Master across ARTs
- **Solution Management** — owns the Solution Backlog and Solution Vision
- **Solution Architect / Engineer** — owns architectural integrity across ARTs
- **Customer / Supplier liaisons** — manage external partners

Solution Train cadence aligns with ART PIs but adds events at solution scale.

### Solution Train Events

**Pre-PI Planning** — held before each ART's PI Planning. Solution Management presents Solution Vision and Solution Backlog top features so ARTs go into their PI Planning aligned.

**Post-PI Planning** — after all ARTs have completed PI Planning. Roll up across ARTs to align dates, dependencies, and risks at solution scale.

**Solution Demo** — each PI, an integrated demo across all ARTs in the Solution Train. The most important quality signal at solution scale.

**Inspect & Adapt at Solution Level** — the Solution Train improves itself, distinct from individual ART I&As.

### Solution Backlog and Solution Intent

**Solution Backlog** — the prioritized list of Capabilities (the solution-level equivalent of Features). Capabilities decompose into Features that ARTs deliver.

**Solution Intent** — the living specification of what the solution must do, fixed and variable parts. Captures:

- Current state (the as-is solution)
- Desired state (the to-be solution)
- Fixed requirements (regulatory, customer-mandated)
- Variable requirements (still under exploration)
- Architectural decisions

Solution Intent is owned by Solution Architecture but co-authored across ARTs.

### Architectural Runway at Scale

Architectural Runway is the foundation that makes upcoming features possible without rework. At solution scale, runway includes:

- Shared infrastructure (cloud, network, compute)
- Shared platforms (API gateways, identity, data)
- Cross-ART standards (logging, monitoring, security)
- Architectural decisions documented and accessible

A Solution Train without runway lives in technical debt and integration pain. Solution Architecture's job is to keep runway sufficient for the next 1–2 PIs.

### Compliance and Regulatory Concerns

Many Large Solution SAFe contexts have regulatory scope: medical, aviation, automotive functional safety, financial services, defense. SAFe addresses this with:

- **Continuous compliance** — compliance practices integrated into delivery, not bolted on at the end
- **Verification and Validation (V&V)** — built into the cadence, not a separate phase
- **Compliance roles in the Solution Train** — quality and regulatory representatives at the table
- **Documentation as code** — generated from working software, not maintained separately

Compliance is achievable with agility, but only if treated as continuous.

### Coordination Mechanisms

Large Solution SAFe needs coordination tooling:

- **Solution-level program board** — visualizes Capabilities, Features, milestones, dependencies across ARTs
- **Solution-level dependency log** — managed by STE
- **Cross-ART communities of practice** — architects, security, ops, etc.
- **Synchronized cadence** — all ARTs run the same iteration and PI dates

### Common Failure Modes

- **Adding Solution Train without need** — multiple unrelated products forced into one Solution Train
- **Solution Management overloaded** — trying to own backlogs at every level
- **Inconsistent ART practices** — each ART operates differently, integration suffers
- **Skipping Solution Demo** — fatal; the integrated whole goes unproven
- **Compliance treated as separate** — late-stage surprises

### Best Practices

- Run Pre- and Post-PI Planning rigorously; they are non-negotiable
- Maintain a single Solution Roadmap visible to all ARTs
- Invest in cross-ART tooling and platforms; they pay back many-fold
- Pair every Capability with a named Solution Management owner
- Run periodic solution-level architecture reviews

### Practice

If you operate at Large Solution scale, count the ARTs in your Solution Train. For each, name the STE, Solution Management lead, and key dependencies. The clarity (or lack of it) is your immediate diagnostic.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'safe-l15',
      title: 'Metrics and Measurement',
      titleNL: 'Metrics en Meting',
      type: 'video',
      duration: '10:00',
      videoUrl: '',
      transcript: `Metrics in SAFe are not for performance reviews — they are for learning and improvement. SAFe 6.0 organizes measurement into three categories: outcomes (the value delivered), flow (the system that delivers), and competency (the capability that drives the system). Used together, they tell a coherent story.

### The Three Measurement Categories

**Outcomes** — Did we achieve what mattered?
- Customer satisfaction
- Employee engagement
- Business outcomes (revenue, market share, NPS)
- Solution quality (defects, reliability)

**Flow** — How is the system performing?
- Flow Velocity — work items completed per unit time
- Flow Time — from started to delivered
- Flow Efficiency — % of flow time spent in active work
- Flow Load — current WIP
- Flow Distribution — mix of feature, defect, debt, risk work
- Flow Predictability — planned vs delivered

**Competency** — How capable is the organization?
- Lean-Agile leadership maturity
- Team and Technical Agility
- Continuous Delivery practices
- DevOps health
- Lean Portfolio Management maturity

The three categories are connected: better competency drives better flow, which drives better outcomes.

### Key SAFe Metrics

**PI Predictability Measure (ART level)**

The headline metric for ART performance:

\`\`\`
PI Predictability =
  (Sum of Actual Business Value Achieved)
  / (Sum of Planned Business Value)
  per team, then averaged across the ART
\`\`\`

Healthy ARTs land between 80% and 100%. Below 80% indicates over-commitment or systemic issues. Consistently above 110% may indicate sandbagging.

**Cumulative Flow Diagram (CFD)**

Visualizes work items in each state over time. Reveals:
- Backlog growth
- WIP accumulation in any state
- Cycle time stability

**Lead Time and Cycle Time**

- **Lead time** — from request submitted to value delivered
- **Cycle time** — from work started to value delivered

Both should trend down over time. Variance matters as much as average; high variance signals chaotic flow.

**Velocity and Throughput**

Velocity (story points per iteration) is useful for **a single team** to forecast its own commitments. It is **not** useful for cross-team comparison or as a productivity metric. Throughput (items per period) is more comparable.

**Defect Trends**

Track:
- Defects found per iteration
- Defects escaped to production
- Mean time to recovery

Quality metrics should trend down (defects) or up (recovery speed); plateauing is a regression.

### Portfolio-Level Metrics

For Lean Portfolio Management:

- **Strategic Theme alignment** — % capacity by theme vs target
- **Epic flow** — Epics in flight, lead time, throughput
- **Lean Budget consumption**
- **Outcome attainment** — actual vs hypothesized benefits per Epic

### Anti-Patterns to Avoid

- **Velocity comparisons across teams** — story points are not transferable
- **Vanity metrics** — counting commits, hours, lines of code
- **Punitive metrics** — anything that punishes honesty kills measurement value
- **Too many metrics** — tracking everything obscures what matters
- **Metrics without conversation** — numbers are inputs to discussion, not verdicts

### Building a Measurement Practice

Start with three to five metrics that match your maturity:

- For new ARTs: PI Predictability, defect trends, velocity-stability per team
- For maturing ARTs: flow time, flow efficiency, employee engagement
- For mature ARTs: outcome metrics (revenue per release, customer NPS), competency maturity

Add metrics only as the organization can act on them. Unused metrics become noise.

### The Measurement Cadence

Different metrics belong at different cadences:

- **Iteration** — team-level flow, velocity, defect counts
- **PI** — predictability, cumulative trends, retrospective learnings
- **Quarterly** — outcome metrics, employee engagement, competency assessment
- **Annual** — strategic theme realization, portfolio-wide maturity

### Visualization

Make metrics visible:

- ART information radiators (digital or physical)
- Portfolio dashboards
- Public retrospectives of trends
- Quarterly business reviews including flow data

Hidden metrics are unused metrics.

### Best Practices

- Use metrics to ask questions, not to assign blame
- Show trends, not point-in-time numbers
- Pair quantitative metrics with qualitative context (engagement surveys, retrospective themes)
- Review metrics at I&A and adjust the system, not the people
- Audit your metrics annually — retire what's no longer informing decisions

### Practice

For your ART, list every metric currently tracked. For each, answer: who looks at it, what decision does it drive, and what changed because of it in the last PI? Metrics that fail this test are candidates for retirement.`,
      keyTakeaways: [],
      keyTakeawaysEN: [],
      resources: [],
    },
    {
      id: 'safe-l16',
      title: 'Quiz: Final',
      titleNL: 'Quiz: Eindexamen',
      type: 'quiz',
      duration: '15:00',
      quiz: [],
    },
    {
      id: 'safe-l17',
      title: 'Certificate',
      titleNL: 'Certificaat',
      type: 'certificate',
      duration: '0:00',
      videoUrl: '',
    },
  ],
};

export const safeModules: Module[] = [module1, module2, module3];

export const safeCourse: Course = {
  id: 'safe-scaling-agile',
  title: 'SAFe & Scaling Agile',
  titleNL: 'SAFe & Agile Schalen',
  description: 'Learn the Scaled Agile Framework (SAFe) to implement Agile at enterprise scale with ARTs, PI Planning, and Value Streams.',
  descriptionNL: 'Leer het Scaled Agile Framework (SAFe) om Agile op enterprise-schaal te implementeren met ARTs, PI Planning en Value Streams.',
  icon: Rocket,
  color: BRAND.pink,
  gradient: `linear-gradient(135deg, ${BRAND.pink}, ${BRAND.pinkLight})`,
  category: 'agile',
  methodology: 'safe',
  levels: 4,
  modules: safeModules.reduce((total, m) => total + m.lessons.length, 0),
  duration: 28,
  rating: 4.6,
  students: 5678,
  tags: ['SAFe', 'Scaling', 'ART', 'PI Planning', 'Value Streams', 'DevOps'],
  tagsNL: ['SAFe', 'Schalen', 'ART', 'PI Planning', 'Waardestromen', 'DevOps'],
  instructor: instructors.martijn,
  featured: true,
  bestseller: false,
  new: true,
  freeForCustomers: true,
  certificate: true,
  whatYouLearn: [
    'Implement SAFe in your organization',
    'Run PI Planning events',
    'Manage Agile Release Trains',
    'Apply Lean Portfolio Management',
  ],
  whatYouLearnNL: [
    'SAFe implementeren in je organisatie',
    'PI Planning events uitvoeren',
    'Agile Release Trains managen',
    'Lean Portfolio Management toepassen',
  ],
  requirements: ['Agile/Scrum experience', 'Understanding of enterprise context'],
  requirementsNL: ['Agile/Scrum ervaring', 'Begrip van enterprise context'],
  targetAudience: [
    'Agile Coaches scaling beyond team level',
    'Release Train Engineers',
    'Enterprise leaders driving Agile transformation',
  ],
  targetAudienceNL: [
    'Agile Coaches die voorbij teamniveau schalen',
    'Release Train Engineers',
    'Enterprise leiders die Agile transformatie aansturen',
  ],
  courseModules: safeModules,
};

export default safeCourse;