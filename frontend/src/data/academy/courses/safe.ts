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
      quiz: [
        {
          id: 'safe-q1',
          question: 'Which of the following is NOT one of the four SAFe Core Values?',
          questionNL: 'Welke van de volgende opties is GEEN van de vier SAFe Kernwaarden?',
          options: [
            'Alignment',
            'Continuous Improvement',
            'Built-In Quality',
            'Transparency',
          ],
          optionsNL: [
            'Afstemming',
            'Continue Verbetering',
            'Ingebouwde Kwaliteit',
            'Transparantie',
          ],
          correctAnswer: 1,
          explanation: 'The four SAFe Core Values are Alignment, Built-In Quality, Transparency, and Program Execution. Continuous Improvement is a principle of the House of Lean but not one of the four named Core Values. (SAFe 6.0, scaledagileframework.com/core-values)',
          explanationNL: 'De vier SAFe Kernwaarden zijn Afstemming, Ingebouwde Kwaliteit, Transparantie en Programma-uitvoering. Continue Verbetering is een principe van het Lean-huis, maar niet een van de vier genoemde Kernwaarden. (SAFe 6.0)',
        },
        {
          id: 'safe-q2',
          question: 'SAFe Lean-Agile Principle #1 states that decisions should be guided by which concept?',
          questionNL: 'SAFe Lean-Agile Principe #1 stelt dat beslissingen geleid moeten worden door welk concept?',
          options: [
            'Team velocity',
            'An economic view using Cost of Delay',
            'Executive authority',
            'Sprint backlog priority',
          ],
          optionsNL: [
            'Teamsnelheid',
            'Een economisch perspectief met gebruik van Cost of Delay',
            'Leiderschapsautoriteit',
            'Sprint backlog prioriteit',
          ],
          correctAnswer: 1,
          explanation: 'SAFe Principle #1 — "Take an economic view" — directs organizations to optimize for total economic outcome. Cost of Delay and WSJF are the primary tools for this. (SAFe 6.0, Principle #1)',
          explanationNL: 'SAFe Principe #1 — "Neem een economisch perspectief" — stuurt organisaties om te optimaliseren voor het totale economische resultaat. Cost of Delay en WSJF zijn de primaire tools hiervoor. (SAFe 6.0, Principe #1)',
        },
        {
          id: 'safe-q3',
          question: 'What is the minimum viable SAFe configuration?',
          questionNL: 'Wat is de minimale haalbare SAFe-configuratie?',
          options: [
            'Full SAFe',
            'Portfolio SAFe',
            'Essential SAFe',
            'Large Solution SAFe',
          ],
          optionsNL: [
            'Full SAFe',
            'Portfolio SAFe',
            'Essential SAFe',
            'Large Solution SAFe',
          ],
          correctAnswer: 2,
          explanation: 'Essential SAFe — Team + ART levels — is the minimum configuration and the recommended starting point for any SAFe adoption. Organizations should master Essential before adding Portfolio or Large Solution layers. (SAFe 6.0, Essential SAFe)',
          explanationNL: 'Essential SAFe — Team + ART niveaus — is de minimumconfiguratie en het aanbevolen startpunt voor elke SAFe-adoptie. Organisaties moeten Essential beheersen voordat ze Portfolio- of Large Solution-lagen toevoegen. (SAFe 6.0, Essential SAFe)',
        },
        {
          id: 'safe-q4',
          question: 'How many Lean-Agile Principles does SAFe 6.0 define?',
          questionNL: 'Hoeveel Lean-Agile Principes definieert SAFe 6.0?',
          options: [
            'Four',
            'Seven',
            'Ten',
            'Twelve',
          ],
          optionsNL: [
            'Vier',
            'Zeven',
            'Tien',
            'Twaalf',
          ],
          correctAnswer: 2,
          explanation: 'SAFe 6.0 defines ten Lean-Agile Principles, numbered #1 through #10, grounded in Lean thinking, Agile principles, and systems thinking. (SAFe 6.0, Lean-Agile Principles)',
          explanationNL: 'SAFe 6.0 definieert tien Lean-Agile Principes, genummerd #1 t/m #10, gebaseerd op Lean-denken, Agile principes en systeemdenken. (SAFe 6.0, Lean-Agile Principes)',
        },
        {
          id: 'safe-q5',
          question: 'SAFe Principle #10 says organizations should structure themselves around what?',
          questionNL: 'SAFe Principe #10 zegt dat organisaties zichzelf moeten structureren rondom wat?',
          options: [
            'Functions and departments',
            'Geographic locations',
            'Value',
            'Technology platforms',
          ],
          optionsNL: [
            'Functies en afdelingen',
            'Geografische locaties',
            'Waarde',
            'Technologieplatforms',
          ],
          correctAnswer: 2,
          explanation: 'SAFe Principle #10 — "Organize around value" — directs enterprises to organize teams and ARTs around value streams rather than traditional functional or component silos. (SAFe 6.0, Principle #10)',
          explanationNL: 'SAFe Principe #10 — "Organiseer rondom waarde" — stuurt ondernemingen om teams en ARTs te organiseren rondom waardestromen in plaats van traditionele functionele of componentsilos. (SAFe 6.0, Principe #10)',
        },
        {
          id: 'safe-q6',
          question: 'In the SAFe House of Lean, what sits at the top as the ultimate goal?',
          questionNL: 'In het SAFe Lean-huis, wat staat bovenaan als het ultieme doel?',
          options: [
            'Leadership',
            'Flow',
            'Value',
            'Quality',
          ],
          optionsNL: [
            'Leiderschap',
            'Flow',
            'Waarde',
            'Kwaliteit',
          ],
          correctAnswer: 2,
          explanation: 'In the SAFe House of Lean, Value — delivering the maximum value to customers and society in the shortest sustainable lead time — sits at the roof as the goal. Leadership is the foundation. (SAFe 6.0, House of Lean)',
          explanationNL: 'In het SAFe Lean-huis staat Waarde — maximale waarde leveren aan klanten en de samenleving in de kortst mogelijke duurzame doorlooptijd — bovenaan als het doel. Leiderschap is het fundament. (SAFe 6.0, Lean-huis)',
        },
      ],
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
      quiz: [
        {
          id: 'safe-q7',
          question: 'What is the typical team size of an Agile Release Train (ART)?',
          questionNL: 'Wat is de typische omvang van een Agile Release Train (ART)?',
          options: [
            '10–25 people',
            '50–125 people',
            '150–300 people',
            '500+ people',
          ],
          optionsNL: [
            '10–25 mensen',
            '50–125 mensen',
            '150–300 mensen',
            '500+ mensen',
          ],
          correctAnswer: 1,
          explanation: 'An ART consists of 5 to 12 Agile teams, totalling 50 to 125 people. Below 50, the coordination overhead of ART-level events is not justified; above 125, coordination cost outweighs the benefit. (SAFe 6.0, Agile Release Train)',
          explanationNL: 'Een ART bestaat uit 5 tot 12 Agile teams, in totaal 50 tot 125 mensen. Onder de 50 is de coördinatieoverhead van ART-niveau-events niet gerechtvaardigd; boven de 125 wegen coördinatiekosten niet op tegen het voordeel. (SAFe 6.0, Agile Release Train)',
        },
        {
          id: 'safe-q8',
          question: 'Which ART role is described as the "chief Scrum Master" for the train?',
          questionNL: 'Welke ART-rol wordt omschreven als de "chief Scrum Master" voor de trein?',
          options: [
            'Product Management',
            'System Architect',
            'Release Train Engineer (RTE)',
            'Business Owner',
          ],
          optionsNL: [
            'Product Management',
            'Systeemarchitect',
            'Release Train Engineer (RTE)',
            'Business Owner',
          ],
          correctAnswer: 2,
          explanation: 'The Release Train Engineer (RTE) is the chief Scrum Master for the ART. The RTE facilitates ART events, removes systemic impediments, and helps the train operate predictably. (SAFe 6.0, Release Train Engineer)',
          explanationNL: 'De Release Train Engineer (RTE) is de chief Scrum Master voor de ART. De RTE faciliteert ART-events, verwijdert systemische impedimenten en helpt de trein voorspelbaar te functioneren. (SAFe 6.0, Release Train Engineer)',
        },
        {
          id: 'safe-q9',
          question: 'What does a typical Program Increment (PI) consist of in SAFe?',
          questionNL: 'Waaruit bestaat een typisch Program Increment (PI) in SAFe?',
          options: [
            '3 development iterations only',
            '4 development iterations plus 1 Innovation and Planning (IP) iteration',
            '6 development iterations',
            '5 development iterations and a separate release sprint',
          ],
          optionsNL: [
            '3 ontwikkeliteraties alleen',
            '4 ontwikkeliteraties plus 1 Innovatie en Planning (IP) iteratie',
            '6 ontwikkeliteraties',
            '5 ontwikkeliteraties en een aparte releasesprint',
          ],
          correctAnswer: 1,
          explanation: 'A standard PI has 4 development iterations of 2 weeks each plus 1 IP (Innovation and Planning) iteration, totalling approximately 10 weeks. The IP iteration hosts Inspect & Adapt and PI Planning for the next PI. (SAFe 6.0, Program Increment)',
          explanationNL: 'Een standaard PI heeft 4 ontwikkeliteraties van elk 2 weken plus 1 IP (Innovatie en Planning) iteratie, in totaal ongeveer 10 weken. De IP-iteratie omvat Inspect & Adapt en PI Planning voor het volgende PI. (SAFe 6.0, Program Increment)',
        },
        {
          id: 'safe-q10',
          question: 'During PI Planning, what does a confidence vote below 3 (out of 5) indicate?',
          questionNL: 'Wat geeft een vertrouwensstemming onder de 3 (van de 5) aan tijdens PI Planning?',
          options: [
            'The plan is acceptable and teams should proceed',
            'Teams are overly confident and should stretch more',
            'Serious problems exist and the plan should be reworked before proceeding',
            'Only the RTE needs to take corrective action',
          ],
          optionsNL: [
            'Het plan is acceptabel en teams moeten doorgaan',
            'Teams zijn te zelfverzekerd en zouden meer moeten doen',
            'Er zijn ernstige problemen en het plan moet herzien worden voordat er wordt doorgegaan',
            'Alleen de RTE hoeft corrigerende maatregelen te nemen',
          ],
          correctAnswer: 2,
          explanation: 'If a team\'s average confidence vote is below 3, SAFe prescribes replanning that team\'s commitments. If the ART-wide average is below 3, the entire PI plan must be reworked. Proceeding on a low confidence vote destroys predictability. (SAFe 6.0, PI Planning)',
          explanationNL: 'Als het gemiddelde vertrouwen van een team onder de 3 is, schrijft SAFe voor het commitments van dat team opnieuw te plannen. Als het ART-brede gemiddelde onder de 3 is, moet het volledige PI-plan herzien worden. Doorgaan met een laag vertrouwen vernietigt voorspelbaarheid. (SAFe 6.0, PI Planning)',
        },
        {
          id: 'safe-q11',
          question: 'What is the primary purpose of the SAFe System Demo?',
          questionNL: 'Wat is het primaire doel van de SAFe System Demo?',
          options: [
            'To showcase individual team velocity to management',
            'To present slide-deck status reports to executives',
            'To demonstrate the integrated, working solution from all teams to stakeholders every iteration',
            'To plan the backlog for the next iteration',
          ],
          optionsNL: [
            'Om de individuele teamsnelheid aan management te tonen',
            'Om statusrapporten via slides aan leidinggevenden te presenteren',
            'Om de geïntegreerde, werkende oplossing van alle teams elke iteratie aan stakeholders te demonstreren',
            'Om de backlog voor de volgende iteratie te plannen',
          ],
          correctAnswer: 2,
          explanation: 'The System Demo provides bi-weekly validation that teams\' integrated work actually functions together. It must show running software in a real environment — not slides, mocks, or isolated team work. Business Owners attend to give course-correcting feedback. (SAFe 6.0, System Demo)',
          explanationNL: 'De System Demo biedt tweewekelijkse validatie dat het geïntegreerde werk van teams daadwerkelijk samen werkt. Het moet werkende software tonen in een echte omgeving — geen slides, mockups of geïsoleerd teamwerk. Business Owners wonen bij om bij te sturen. (SAFe 6.0, System Demo)',
        },
        {
          id: 'safe-q12',
          question: 'In SAFe\'s Inspect & Adapt event, what happens to the improvement items generated in the Problem-Solving Workshop?',
          questionNL: 'Wat gebeurt er in SAFe\'s Inspect & Adapt-event met de verbeterpunten die worden gegenereerd in de Problem-Solving Workshop?',
          options: [
            'They are filed as documents for future reference',
            'They are added to the Program Backlog and prioritized for the next PI',
            'They are exclusively the responsibility of the RTE to implement',
            'They are addressed only if budget allows',
          ],
          optionsNL: [
            'Ze worden als documenten gearchiveerd voor toekomstige referentie',
            'Ze worden toegevoegd aan de Program Backlog en geprioriteerd voor het volgende PI',
            'Ze zijn uitsluitend de verantwoordelijkheid van de RTE om te implementeren',
            'Ze worden alleen aangepakt als het budget het toelaat',
          ],
          correctAnswer: 1,
          explanation: 'Improvement items from the I&A Problem-Solving Workshop are placed directly into the Program Backlog and prioritized for the next PI alongside feature work. This mechanism ensures improvement is treated as real work, not a wish list. (SAFe 6.0, Inspect & Adapt)',
          explanationNL: 'Verbeterpunten uit de I&A Problem-Solving Workshop worden direct in de Program Backlog geplaatst en geprioriteerd voor het volgende PI naast feature-werk. Dit mechanisme zorgt ervoor dat verbetering als echt werk wordt behandeld, niet als een wensenlijst. (SAFe 6.0, Inspect & Adapt)',
        },
      ],
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
      quiz: [
        {
          id: 'safe-q13',
          question: 'Lean Portfolio Management (LPM) replaces traditional project-by-project funding with what mechanism?',
          questionNL: 'Lean Portfolio Management (LPM) vervangt traditionele project-voor-project financiering door welk mechanisme?',
          options: [
            'Annual capital budgets allocated to departments',
            'Lean Budgets allocated to persistent value streams',
            'Sprint-by-sprint funding approvals',
            'Executive discretionary spending',
          ],
          optionsNL: [
            'Jaarlijkse kapitaalbudgetten toegewezen aan afdelingen',
            'Lean Budgets toegewezen aan persistente waardestromen',
            'Sprint-voor-sprint financieringsgoedkeuringen',
            'Discretionaire uitgaven van leidinggevenden',
          ],
          correctAnswer: 1,
          explanation: 'LPM funds value streams with persistent Lean Budgets rather than individual projects. This removes approval friction, supports long-term thinking, and lets the ART operate without constant reauthorization. Guardrails govern spending, not project gates. (SAFe 6.0, Lean Portfolio Management)',
          explanationNL: 'LPM financiert waardestromen met persistente Lean Budgets in plaats van individuele projecten. Dit verwijdert goedkeuringswrijving, ondersteunt langetermijndenken en laat de ART werken zonder constante herbevestiging. Guardrails regelen de uitgaven, niet projectpoorten. (SAFe 6.0, Lean Portfolio Management)',
        },
        {
          id: 'safe-q14',
          question: 'What is the difference between an Operational Value Stream and a Development Value Stream in SAFe?',
          questionNL: 'Wat is het verschil tussen een Operationele Waardestroom en een Ontwikkelingswaardestroom in SAFe?',
          options: [
            'Operational value streams build software; development value streams deliver it to customers',
            'Operational value streams deliver products or services to customers; development value streams build the systems that enable them',
            'Both terms describe the same concept under different names',
            'Operational value streams are for hardware; development value streams are for software',
          ],
          optionsNL: [
            'Operationele waardestromen bouwen software; ontwikkelingswaardestromen leveren het aan klanten',
            'Operationele waardestromen leveren producten of diensten aan klanten; ontwikkelingswaardestromen bouwen de systemen die dat mogelijk maken',
            'Beide termen beschrijven hetzelfde concept onder verschillende namen',
            'Operationele waardestromen zijn voor hardware; ontwikkelingswaardestromen zijn voor software',
          ],
          correctAnswer: 1,
          explanation: 'An Operational Value Stream is the sequence of business activities delivering value to end customers (e.g. order-to-cash). A Development Value Stream is the sequence of activities teams use to build the systems supporting the operational stream. ARTs align to development value streams. (SAFe 6.0, Value Streams)',
          explanationNL: 'Een Operationele Waardestroom is de reeks bedrijfsactiviteiten die waarde levert aan eindklanten (bijv. order-to-cash). Een Ontwikkelingswaardestroom is de reeks activiteiten die teams gebruiken om de systemen te bouwen die de operationele stroom ondersteunen. ARTs zijn afgestemd op ontwikkelingswaardestromen. (SAFe 6.0, Waardestromen)',
        },
        {
          id: 'safe-q15',
          question: 'WSJF (Weighted Shortest Job First) is used in SAFe to prioritize work based on what?',
          questionNL: 'WSJF (Weighted Shortest Job First) wordt in SAFe gebruikt om werk te prioriteren op basis van wat?',
          options: [
            'Team capacity alone',
            'Stakeholder seniority',
            'Cost of Delay divided by job duration (proxy for job size)',
            'Number of story points',
          ],
          optionsNL: [
            'Teamcapaciteit alleen',
            'Senioriteit van stakeholders',
            'Cost of Delay gedeeld door jobduur (proxy voor jobgrootte)',
            'Aantal story points',
          ],
          correctAnswer: 2,
          explanation: 'WSJF = Cost of Delay / Job Duration (or job size as proxy). It sequences work to maximize economic benefit: short, high-delay-cost items go first. It is SAFe\'s primary tool for epic and feature prioritization, derived from Don Reinertsen\'s Principles of Product Development Flow. (SAFe 6.0, WSJF)',
          explanationNL: 'WSJF = Cost of Delay / Jobduur (of jobgrootte als proxy). Het rangschikt werk om het economisch voordeel te maximaliseren: korte items met hoge vertragingskosten gaan eerst. Het is SAFe\'s primaire tool voor epic- en feature-prioritering, afgeleid van Don Reinertsen\'s Principles of Product Development Flow. (SAFe 6.0, WSJF)',
        },
        {
          id: 'safe-q16',
          question: 'Which SAFe configuration adds the Solution Train for coordinating multiple ARTs working on the same large solution?',
          questionNL: 'Welke SAFe-configuratie voegt de Solution Train toe voor het coördineren van meerdere ARTs die aan dezelfde grote oplossing werken?',
          options: [
            'Essential SAFe',
            'Portfolio SAFe',
            'Large Solution SAFe',
            'Full SAFe',
          ],
          optionsNL: [
            'Essential SAFe',
            'Portfolio SAFe',
            'Large Solution SAFe',
            'Full SAFe',
          ],
          correctAnswer: 2,
          explanation: 'Large Solution SAFe adds the Solution Train — a team-of-trains coordinating multiple ARTs on a single complex solution. It introduces Pre- and Post-PI Planning, the Solution Demo, and roles such as the Solution Train Engineer. (SAFe 6.0, Large Solution SAFe)',
          explanationNL: 'Large Solution SAFe voegt de Solution Train toe — een team-van-treinen dat meerdere ARTs coördineert voor één complexe oplossing. Het introduceert Pre- en Post-PI Planning, de Solution Demo en rollen zoals de Solution Train Engineer. (SAFe 6.0, Large Solution SAFe)',
        },
        {
          id: 'safe-q17',
          question: 'What is the SAFe PI Predictability target range for a healthy ART?',
          questionNL: 'Wat is het SAFe PI Voorspelbaarheidsdoelbereik voor een gezonde ART?',
          options: [
            '50–65%',
            '65–79%',
            '80–100%',
            'Above 110% always',
          ],
          optionsNL: [
            '50–65%',
            '65–79%',
            '80–100%',
            'Altijd boven 110%',
          ],
          correctAnswer: 2,
          explanation: 'A healthy ART targets 80–100% PI Predictability (actual business value delivered vs planned). Below 80% indicates over-commitment or systemic problems; consistently above 110% may indicate sandbagging. (SAFe 6.0, Inspect & Adapt, Metrics)',
          explanationNL: 'Een gezonde ART streeft naar 80–100% PI-voorspelbaarheid (werkelijk geleverde bedrijfswaarde vs gepland). Onder de 80% wijst op overcommitment of systemische problemen; consistent boven de 110% kan wijzen op sandbagging. (SAFe 6.0, Inspect & Adapt, Metrics)',
        },
        {
          id: 'safe-q18',
          question: 'SAFe Principle #9 — "Decentralize decision-making" — recommends that which decisions should be made centrally?',
          questionNL: 'SAFe Principe #9 — "Decentraliseer besluitvorming" — beveelt aan dat welke beslissingen centraal genomen moeten worden?',
          options: [
            'Frequent, time-critical, locally-informed decisions',
            'All decisions to maintain consistent governance',
            'Infrequent, durable, and broad-impact decisions',
            'Team-level technical decisions',
          ],
          optionsNL: [
            'Frequente, tijdkritische, lokaal geïnformeerde beslissingen',
            'Alle beslissingen om consistente governance te behouden',
            'Zeldzame, duurzame en breed-impactvolle beslissingen',
            'Teamtechnische beslissingen',
          ],
          correctAnswer: 2,
          explanation: 'SAFe Principle #9 recommends decentralizing frequent, time-critical, and locally-informed decisions to the people closest to the work. Centralization is reserved for infrequent decisions with durable, broad impact — such as strategic investments or architectural standards. (SAFe 6.0, Principle #9)',
          explanationNL: 'SAFe Principe #9 beveelt aan frequente, tijdkritische en lokaal geïnformeerde beslissingen te decentraliseren naar mensen die het dichtst bij het werk staan. Centralisatie is gereserveerd voor zeldzame beslissingen met duurzame, brede impact — zoals strategische investeringen of architectuurstandaarden. (SAFe 6.0, Principe #9)',
        },
      ],
    },
    {
      id: 'safe-l18',
      title: 'Practical Assignment: Design an ART',
      titleNL: 'Praktijkopdracht: Ontwerp een ART',
      type: 'assignment',
      duration: '60:00',
      videoUrl: '',
      transcript: `This assignment asks you to apply the SAFe concepts covered in this course by designing an Agile Release Train for a fictional product. There is no single right answer — the goal is to demonstrate that you can reason through the key SAFe structural decisions.

## Scenario

**HealthTrack** is a mid-size digital health company building a patient-monitoring platform. The platform has three main components: a mobile app (patients record symptoms and vitals), a clinical dashboard (nurses and doctors review patient data), and an analytics service (aggregates outcomes data for hospital management). The company has 80 engineers, 10 product people, 6 business stakeholders, and a small DevOps team. They currently work in 9 loosely coordinated Scrum teams with no shared cadence.

## Deliverables

Produce a written document (1,000–2,000 words) covering the following five sections:

**1. Value Stream Identification**
Identify the primary operational value stream that HealthTrack's platform supports. Then identify the development value stream your proposed ART will serve. Explain the distinction between these two types of value stream using SAFe definitions.

**2. ART Design**
Propose how to form the ART:
- How many teams, and at what size?
- Which parts of the platform does each team own (feature teams vs component teams — and which do you prefer, and why)?
- How many people total on the ART, and does this fit within SAFe norms?

**3. Key Roles**
Name (or describe the profile of) the following ART roles and explain their specific responsibilities in the HealthTrack context:
- Release Train Engineer (RTE)
- Product Management
- System Architect
- Business Owners (identify at least 2 from the scenario)

**4. PI Planning Agenda**
Draft a two-day PI Planning agenda for HealthTrack's first PI Planning. Include timings, session names, owners, and a brief note on what each session must produce. Account for the fact that teams have never done PI Planning before.

**5. Three PI Objectives with WSJF**
Define three PI Objectives for HealthTrack's first PI. For each objective:
- Write the objective statement (following the SAFe pattern: business outcome, not a feature list)
- Assign a Business Value score (1–10)
- Estimate a WSJF score using: User-Business Value, Time Criticality, Risk Reduction / Opportunity Enablement (each 1–10), and Job Size (1–13 Fibonacci). Show your calculation.
- Identify one key risk or dependency for that objective.

## Submission Rubric

| Criterion | Marks |
|---|---|
| Correct distinction between operational and development value streams | 10 |
| ART design fits SAFe norms (50–125 people, 5–12 teams) with reasoning | 15 |
| All four ART roles correctly described with scenario-specific detail | 20 |
| PI Planning agenda is realistic, two-day, covers all required elements | 25 |
| Three PI Objectives are business-outcome focused, not feature lists | 15 |
| WSJF calculations are shown and correctly applied | 15 |
| **Total** | **100** |

Pass mark: 70 out of 100.

## Key Takeaways

- Designing an ART forces you to make the abstract concrete: who are the people, what value do they deliver, how do they plan together?
- A good PI Objective answers "what business outcome will we achieve?" — not "which features will we ship?"
- WSJF is a structured conversation tool, not a precise calculation; the numbers matter less than the reasoning behind them.`,
      transcriptNL: `Deze opdracht vraagt je om de SAFe-concepten die in deze cursus zijn behandeld toe te passen door een Agile Release Train te ontwerpen voor een fictief product. Er is geen enkel juist antwoord — het doel is aan te tonen dat je door de belangrijkste SAFe-structurele beslissingen kunt redeneren.

## Scenario

**HealthTrack** is een middelgroot digitaal gezondheidsbedrijf dat een patiëntmonitoringsplatform bouwt. Het platform heeft drie hoofdcomponenten: een mobiele app (patiënten registreren symptomen en vitale functies), een klinisch dashboard (verpleegkundigen en artsen bekijken patiëntgegevens) en een analytische service (aggregeert uitkomstgegevens voor ziekenhuismanagement). Het bedrijf heeft 80 engineers, 10 productmensen, 6 zakelijke stakeholders en een klein DevOps-team. Ze werken momenteel in 9 losjes gecoördineerde Scrum-teams zonder gemeenschappelijke cadans.

## Deliverables

Produceer een schriftelijk document (1.000–2.000 woorden) dat de volgende vijf secties omvat:

**1. Waardestroom Identificatie**
Identificeer de primaire operationele waardestroom die HealthTrack's platform ondersteunt. Identificeer vervolgens de ontwikkelingswaardestroom die jouw voorgestelde ART zal bedienen. Leg het onderscheid uit tussen deze twee typen waardestromen met behulp van SAFe-definities.

**2. ART Ontwerp**
Stel voor hoe de ART te vormen:
- Hoeveel teams, en op welke grootte?
- Welke delen van het platform beheert elk team (feature teams vs component teams — en welke prefereer je, en waarom)?
- Hoeveel mensen totaal op de ART, en past dit binnen SAFe-normen?

**3. Sleutelrollen**
Benoem (of beschrijf het profiel van) de volgende ART-rollen en leg hun specifieke verantwoordelijkheden uit in de HealthTrack-context:
- Release Train Engineer (RTE)
- Product Management
- Systeemarchitect
- Business Owners (identificeer minimaal 2 uit het scenario)

**4. PI Planning Agenda**
Stel een tweedaagse PI Planning-agenda op voor HealthTrack's eerste PI Planning. Vermeld tijden, sessienamen, eigenaren en een korte noot over wat elke sessie moet opleveren. Houd rekening met het feit dat teams nog nooit PI Planning hebben gedaan.

**5. Drie PI Doelstellingen met WSJF**
Definieer drie PI Doelstellingen voor HealthTrack's eerste PI. Voor elke doelstelling:
- Schrijf de doelstellingverklaring (volgend het SAFe-patroon: zakelijk resultaat, geen featurelijst)
- Ken een Business Value-score toe (1–10)
- Schat een WSJF-score met: User-Business Value, Time Criticality, Risk Reduction / Opportunity Enablement (elk 1–10) en Job Size (1–13 Fibonacci). Toon je berekening.
- Identificeer één sleutelrisico of afhankelijkheid voor die doelstelling.

## Beoordelingsrubric

Passeergrens: 70 van de 100.`,
      keyTakeaways: [
        'ART design starts with identifying the value stream the train will serve — not with org chart reshuffling',
        'PI Objectives must express business outcomes, not feature delivery lists',
        'WSJF structures the economic conversation; relative sizing matters more than absolute precision',
        'Business Owners and Product Management are co-equal partners in PI Planning — both must attend',
        'A realistic PI Planning agenda for a first-time ART must include more context-setting and buffer than a mature ART needs',
      ],
      keyTakeawaysNL: [
        'ART-ontwerp begint met het identificeren van de waardestroom die de trein zal bedienen — niet met het reorganiseren van het organogram',
        'PI Doelstellingen moeten zakelijke resultaten uitdrukken, geen featureleveringslijsten',
        'WSJF structureert het economisch gesprek; relatieve schaling is belangrijker dan absolute precisie',
        'Business Owners en Product Management zijn gelijkwaardige partners in PI Planning — beiden moeten aanwezig zijn',
        'Een realistische PI Planning-agenda voor een eerste ART moet meer contextualisering en buffer bevatten dan een volwassen ART nodig heeft',
      ],
    },
    {
      id: 'safe-l19',
      title: 'Final Exam: SAFe Practitioner',
      titleNL: 'Eindexamen: SAFe Practitioner',
      type: 'exam',
      duration: '45:00',
      videoUrl: '',
      transcript: `Welcome to the SAFe Practitioner Final Exam.

This exam tests your understanding of SAFe 6.0 across all three modules: SAFe Overview, the Agile Release Train, and Portfolio & Large Solution.

**Format:** 20 multiple-choice questions. Each question has four options with one correct answer.

**Pass mark:** 70% (14 out of 20 correct).

**Time allowed:** 45 minutes.

**What this exam covers:**
- SAFe Core Values and Lean-Agile Principles
- The House of Lean
- SAFe Configurations (Essential, Large Solution, Portfolio, Full)
- The Agile Release Train — structure, roles, cadence
- PI Planning — agenda, outputs, confidence vote
- System Demo and Inspect & Adapt
- Value Streams (operational vs development)
- Lean Portfolio Management — Lean Budgets, Guardrails, Portfolio Kanban
- WSJF prioritization
- SAFe Metrics — PI Predictability, Flow Metrics
- Large Solution SAFe — Solution Train, Pre/Post-PI Planning

Good luck. Read each question carefully before selecting your answer.`,
      transcriptNL: `Welkom bij het SAFe Practitioner Eindexamen.

Dit examen toetst uw begrip van SAFe 6.0 in alle drie modules: SAFe Overzicht, de Agile Release Train en Portfolio & Large Solution.

**Formaat:** 20 meerkeuzevragen. Elke vraag heeft vier opties met één correct antwoord.

**Slaaggrens:** 70% (14 van de 20 correct).

**Toegestane tijd:** 45 minuten.

**Wat dit examen omvat:** SAFe Kernwaarden en Lean-Agile Principes, het Lean-huis, SAFe Configuraties, de Agile Release Train, PI Planning, System Demo, Inspect & Adapt, Waardestromen, Lean Portfolio Management, WSJF, SAFe Metrics en Large Solution SAFe.

Veel succes. Lees elke vraag zorgvuldig voordat u uw antwoord selecteert.`,
      keyTakeaways: [
        'Pass mark is 70% — 14 of 20 questions correct',
        'Questions span all three course modules equally',
        'Review the four Core Values, ten Lean-Agile Principles, and all four SAFe configurations before attempting',
        'Focus on WSJF calculation logic and the distinction between operational and development value streams',
      ],
      keyTakeawaysNL: [
        'Slaaggrens is 70% — 14 van de 20 vragen correct',
        'Vragen beslaan alle drie cursusmodules gelijkelijk',
        'Bekijk de vier Kernwaarden, tien Lean-Agile Principes en alle vier SAFe-configuraties voordat u begint',
        'Focus op de WSJF-berekeningslogica en het onderscheid tussen operationele en ontwikkelingswaardestromen',
      ],
      quiz: [
        {
          id: 'safe-exam-q1',
          question: 'Which of the four SAFe Core Values directly addresses the requirement that trust requires visibility?',
          questionNL: 'Welke van de vier SAFe Kernwaarden richt zich direct op de vereiste dat vertrouwen zichtbaarheid vereist?',
          options: [
            'Alignment',
            'Built-In Quality',
            'Transparency',
            'Program Execution',
          ],
          optionsNL: [
            'Afstemming',
            'Ingebouwde Kwaliteit',
            'Transparantie',
            'Programma-uitvoering',
          ],
          correctAnswer: 2,
          explanation: 'Transparency is the SAFe Core Value that holds "trust requires visibility". It is achieved through open backlogs, public WIP boards, honest impediment reporting, and real demos. (SAFe 6.0, Core Values)',
          explanationNL: 'Transparantie is de SAFe Kernwaarde die stelt dat "vertrouwen zichtbaarheid vereist". Dit wordt bereikt door open backlogs, openbare WIP-borden, eerlijke impedimentrapportage en echte demo\'s. (SAFe 6.0, Kernwaarden)',
        },
        {
          id: 'safe-exam-q2',
          question: 'Which SAFe Lean-Agile Principle specifically addresses Set-Based Design and preserving options until more information is available?',
          questionNL: 'Welk SAFe Lean-Agile Principe richt zich specifiek op Set-Based Design en het bewaren van opties totdat er meer informatie beschikbaar is?',
          options: [
            'Principle #1 — Take an economic view',
            'Principle #3 — Assume variability; preserve options',
            'Principle #6 — Make value flow without interruptions',
            'Principle #9 — Decentralize decision-making',
          ],
          optionsNL: [
            'Principe #1 — Neem een economisch perspectief',
            'Principe #3 — Neem variabiliteit aan; bewaar opties',
            'Principe #6 — Laat waarde stromen zonder onderbrekingen',
            'Principe #9 — Decentraliseer besluitvorming',
          ],
          correctAnswer: 1,
          explanation: 'Principle #3 — "Assume variability; preserve options" — recommends Set-Based Design: explore multiple solution paths simultaneously and converge late when more is known, rather than committing prematurely to one approach. (SAFe 6.0, Principle #3)',
          explanationNL: 'Principe #3 — "Neem variabiliteit aan; bewaar opties" — beveelt Set-Based Design aan: verken meerdere oplossingsroutes tegelijkertijd en convergeer laat wanneer meer bekend is, in plaats van vroegtijdig te committeren aan één aanpak. (SAFe 6.0, Principe #3)',
        },
        {
          id: 'safe-exam-q3',
          question: 'An organization has 6 ARTs all delivering components of one highly integrated avionics system. Which SAFe configuration is most appropriate?',
          questionNL: 'Een organisatie heeft 6 ARTs die allemaal componenten leveren van één sterk geïntegreerd avionicasysteem. Welke SAFe-configuratie is het meest geschikt?',
          options: [
            'Essential SAFe with a strong RTE',
            'Portfolio SAFe with Lean Budgets',
            'Large Solution SAFe with a Solution Train',
            'Full SAFe is always required for 6 ARTs',
          ],
          optionsNL: [
            'Essential SAFe met een sterke RTE',
            'Portfolio SAFe met Lean Budgets',
            'Large Solution SAFe met een Solution Train',
            'Full SAFe is altijd vereist voor 6 ARTs',
          ],
          correctAnswer: 2,
          explanation: 'When multiple ARTs collaborate on a single highly integrated solution, Large Solution SAFe is the correct configuration. It adds the Solution Train to coordinate ARTs, Pre- and Post-PI Planning, the Solution Demo, and solution-level roles. (SAFe 6.0, Large Solution SAFe)',
          explanationNL: 'Wanneer meerdere ARTs samenwerken aan één sterk geïntegreerde oplossing, is Large Solution SAFe de juiste configuratie. Het voegt de Solution Train toe om ARTs te coördineren, Pre- en Post-PI Planning, de Solution Demo en rollen op solutieniveau. (SAFe 6.0, Large Solution SAFe)',
        },
        {
          id: 'safe-exam-q4',
          question: 'What is the role of Business Owners during PI Planning?',
          questionNL: 'Wat is de rol van Business Owners tijdens PI Planning?',
          options: [
            'They observe from a distance and receive a summary report after the event',
            'They set business context on Day 1, accept PI Objectives, and assign business value scores to team commitments',
            'They are responsible for writing all features for the program backlog',
            'Their role is limited to approving the budget for the PI',
          ],
          optionsNL: [
            'Ze observeren op afstand en ontvangen een samenvattingsrapport na het evenement',
            'Ze stellen zakelijke context op dag 1, accepteren PI Doelstellingen en kennen bedrijfswaardescores toe aan teamcommitments',
            'Ze zijn verantwoordelijk voor het schrijven van alle features voor de program backlog',
            'Hun rol is beperkt tot het goedkeuren van het budget voor de PI',
          ],
          correctAnswer: 1,
          explanation: 'Business Owners are accountable executives who present business context on Day 1, negotiate and accept PI Objectives, and assign Business Value scores (1–10) to each team\'s objectives. Their presence and engagement is essential for PI Planning to produce real commitments. (SAFe 6.0, PI Planning)',
          explanationNL: 'Business Owners zijn verantwoordelijke leidinggevenden die zakelijke context presenteren op dag 1, PI Doelstellingen onderhandelen en accepteren, en Business Value-scores (1–10) toekennen aan de doelstellingen van elk team. Hun aanwezigheid en betrokkenheid is essentieel om echte commitments te produceren. (SAFe 6.0, PI Planning)',
        },
        {
          id: 'safe-exam-q5',
          question: 'In SAFe, which artifact produced during PI Planning captures features, inter-team dependencies, and key milestones across the PI?',
          questionNL: 'Welk artefact dat tijdens PI Planning wordt geproduceerd legt features, inter-team afhankelijkheden en sleutelmijlpalen vast gedurende het PI?',
          options: [
            'The Sprint Backlog',
            'The Program Board',
            'The Solution Intent',
            'The Portfolio Kanban',
          ],
          optionsNL: [
            'De Sprint Backlog',
            'Het Program Board',
            'De Solution Intent',
            'De Portfolio Kanban',
          ],
          correctAnswer: 1,
          explanation: 'The Program Board is a key PI Planning output. It is a physical or digital wall displaying features per team, dependencies between teams (shown as strings or arrows), milestones, and external dates. It persists throughout the PI and is updated as the situation evolves. (SAFe 6.0, PI Planning)',
          explanationNL: 'Het Program Board is een sleutelresultaat van PI Planning. Het is een fysieke of digitale muur met features per team, afhankelijkheden tussen teams (weergegeven als strings of pijlen), mijlpalen en externe datums. Het blijft gedurende het PI bestaan en wordt bijgewerkt naarmate de situatie evolueert. (SAFe 6.0, PI Planning)',
        },
        {
          id: 'safe-exam-q6',
          question: 'Which role in the ART owns the Program Backlog and is responsible for deciding what the ART builds and in what order?',
          questionNL: 'Welke rol in de ART bezit de Program Backlog en is verantwoordelijk voor het bepalen wat de ART bouwt en in welke volgorde?',
          options: [
            'Release Train Engineer (RTE)',
            'System Architect',
            'Product Management',
            'Product Owner',
          ],
          optionsNL: [
            'Release Train Engineer (RTE)',
            'Systeemarchitect',
            'Product Management',
            'Product Owner',
          ],
          correctAnswer: 2,
          explanation: 'Product Management owns the Program Backlog — the prioritized list of features for the ART — and is responsible for what gets built and in what sequence. Product Owners own the team-level backlogs (stories and tasks). The RTE owns facilitation and impediment removal. (SAFe 6.0, Product Management)',
          explanationNL: 'Product Management bezit de Program Backlog — de geprioriteerde lijst van features voor de ART — en is verantwoordelijk voor wat er gebouwd wordt en in welke volgorde. Product Owners bezitten de backlogs op teamniveau (stories en taken). De RTE bezit facilitering en het verwijderen van impedimenten. (SAFe 6.0, Product Management)',
        },
        {
          id: 'safe-exam-q7',
          question: 'What does the SAFe IP Iteration primarily serve?',
          questionNL: 'Wat dient de SAFe IP Iteratie primair?',
          options: [
            'A buffer sprint to complete unfinished user stories',
            'Innovation, architectural spikes, training, Inspect & Adapt, and PI Planning preparation',
            'A dedicated hardening sprint for regression testing only',
            'An executive review and governance checkpoint',
          ],
          optionsNL: [
            'Een buffersprint om onafgemaakte user stories te voltooien',
            'Innovatie, architectuurspikes, training, Inspect & Adapt en voorbereiding van PI Planning',
            'Een dedicated hardeningssprint voor alleen regressietesten',
            'Een leidinggevendereview en governancecheckpoint',
          ],
          correctAnswer: 1,
          explanation: 'The IP (Innovation and Planning) iteration is SAFe\'s designated time for innovation, technical debt reduction, exploration spikes, team training, the Inspect & Adapt event, and PI Planning preparation. It is explicitly not a buffer for unfinished work. (SAFe 6.0, Innovation and Planning Iteration)',
          explanationNL: 'De IP (Innovatie en Planning) iteratie is SAFe\'s aangewezen tijd voor innovatie, vermindering van technische schuld, exploratieve spikes, teamtraining, het Inspect & Adapt-event en voorbereiding van PI Planning. Het is expliciet geen buffer voor onafgewerkt werk. (SAFe 6.0, Innovatie en Planning Iteratie)',
        },
        {
          id: 'safe-exam-q8',
          question: 'The SAFe House of Lean identifies four pillars that support the goal of value delivery. Which of the following is one of those pillars?',
          questionNL: 'Het SAFe Lean-huis identificeert vier pilaren die het doel van waardebezorging ondersteunen. Welke van de volgende is zo\'n pilaar?',
          options: [
            'Sprint Reviews',
            'Respect for People and Culture',
            'Definition of Done',
            'Epic Approval Gates',
          ],
          optionsNL: [
            'Sprint Reviews',
            'Respect voor Mensen en Cultuur',
            'Definition of Done',
            'Epic Goedkeuringspoorten',
          ],
          correctAnswer: 1,
          explanation: 'The four pillars of the SAFe House of Lean are: Respect for People and Culture, Flow, Innovation, and Relentless Improvement. Leadership forms the foundation, and Value sits at the roof. (SAFe 6.0, House of Lean)',
          explanationNL: 'De vier pilaren van het SAFe Lean-huis zijn: Respect voor Mensen en Cultuur, Flow, Innovatie en Meedogenloze Verbetering. Leiderschap vormt het fundament en Waarde staat aan de top. (SAFe 6.0, Lean-huis)',
        },
        {
          id: 'safe-exam-q9',
          question: 'In SAFe, Lean Portfolio Management uses Guardrails to do what?',
          questionNL: 'In SAFe gebruikt Lean Portfolio Management Guardrails om wat te doen?',
          options: [
            'Replace the need for any financial oversight',
            'Govern how value streams spend their Lean Budgets without reverting to project-by-project approvals',
            'Prevent teams from making any local decisions',
            'Replace the Portfolio Kanban with a fixed spending plan',
          ],
          optionsNL: [
            'De noodzaak voor financieel toezicht vervangen',
            'Sturen hoe waardestromen hun Lean Budgets besteden zonder terug te keren naar project-voor-project goedkeuringen',
            'Teams verhinderen lokale beslissingen te nemen',
            'De Portfolio Kanban vervangen door een vast uitgavenplan',
          ],
          correctAnswer: 1,
          explanation: 'Guardrails are LPM spending policies that govern how value streams use their Lean Budgets. They define what spending is appropriate, when significant initiatives need business case review, and how to keep architectural runway healthy — without requiring project-by-project approval. (SAFe 6.0, Lean Portfolio Management)',
          explanationNL: 'Guardrails zijn LPM-uitgavenbeleid dat bepaalt hoe waardestromen hun Lean Budgets gebruiken. Ze definiëren welke uitgaven geschikt zijn, wanneer significante initiatieven een business case-review nodig hebben en hoe architectuurrunway gezond te houden — zonder project-voor-project goedkeuring te vereisen. (SAFe 6.0, Lean Portfolio Management)',
        },
        {
          id: 'safe-exam-q10',
          question: 'WSJF prioritization is calculated as:',
          questionNL: 'WSJF-prioritering wordt berekend als:',
          options: [
            'Story Points × Business Value',
            'Cost of Delay ÷ Job Duration (or job size)',
            'Team Velocity × Sprint Length',
            'Risk Score × Complexity',
          ],
          optionsNL: [
            'Story Points × Bedrijfswaarde',
            'Cost of Delay ÷ Jobduur (of jobgrootte)',
            'Teamsnelheid × Sprintlengte',
            'Risicoscore × Complexiteit',
          ],
          correctAnswer: 1,
          explanation: 'WSJF = Cost of Delay / Job Duration (or a proxy for job size). Cost of Delay has three components: User-Business Value, Time Criticality, and Risk Reduction/Opportunity Enablement. The item with the highest WSJF score is sequenced first. (SAFe 6.0, WSJF)',
          explanationNL: 'WSJF = Cost of Delay / Jobduur (of een proxy voor jobgrootte). Cost of Delay heeft drie componenten: User-Business Value, Time Criticality en Risk Reduction/Opportunity Enablement. Het item met de hoogste WSJF-score wordt het eerst gepland. (SAFe 6.0, WSJF)',
        },
        {
          id: 'safe-exam-q11',
          question: 'Which statement about the SAFe System Demo is correct?',
          questionNL: 'Welke stelling over de SAFe System Demo is correct?',
          options: [
            'It replaces individual team iteration reviews',
            'It demonstrates integrated, working software from all teams in a real environment every two weeks',
            'It is held only at the end of each PI, not during the PI',
            'Its primary audience is the development team, not stakeholders',
          ],
          optionsNL: [
            'Het vervangt individuele teamiteratiereviews',
            'Het demonstreert geïntegreerde, werkende software van alle teams in een echte omgeving elke twee weken',
            'Het wordt alleen aan het einde van elk PI gehouden, niet tijdens het PI',
            'Het primaire publiek zijn de ontwikkelteams, niet stakeholders',
          ],
          correctAnswer: 1,
          explanation: 'The System Demo is held at the end of every two-week iteration (not just end-of-PI) and must demonstrate integrated working software, not slides. It is for stakeholders and Business Owners. It runs in parallel with — not instead of — team-level iteration reviews. (SAFe 6.0, System Demo)',
          explanationNL: 'De System Demo wordt gehouden aan het einde van elke twee weken durende iteratie (niet alleen einde-PI) en moet geïntegreerde werkende software demonstreren, geen slides. Het is voor stakeholders en Business Owners. Het loopt parallel aan — en niet in plaats van — teamiteration reviews. (SAFe 6.0, System Demo)',
        },
        {
          id: 'safe-exam-q12',
          question: 'What is the difference between a Feature (in SAFe) and a Capability?',
          questionNL: 'Wat is het verschil tussen een Feature (in SAFe) en een Capability?',
          options: [
            'Features are for hardware; Capabilities are for software',
            'Features are ART-level deliverables that deliver value within one PI; Capabilities are Solution-level deliverables that may span multiple ARTs',
            'Features and Capabilities are synonyms in SAFe 6.0',
            'Capabilities belong to teams; Features belong to portfolio',
          ],
          optionsNL: [
            'Features zijn voor hardware; Capabilities zijn voor software',
            'Features zijn ART-niveau leveringen die waarde leveren binnen één PI; Capabilities zijn Solution-niveau leveringen die meerdere ARTs kunnen omspannen',
            'Features en Capabilities zijn synoniemen in SAFe 6.0',
            'Capabilities behoren tot teams; Features behoren tot portfolio',
          ],
          correctAnswer: 1,
          explanation: 'In SAFe, a Feature is an ART-level artifact representing a service or function deliverable within one PI. A Capability is the Solution-level equivalent — larger in scope, potentially spanning multiple ARTs and PIs. Capabilities are held in the Solution Backlog; Features in the Program Backlog. (SAFe 6.0, SAFe Backlog Levels)',
          explanationNL: 'In SAFe is een Feature een ART-niveau artefact dat een dienst of functie vertegenwoordigt die binnen één PI leverbaar is. Een Capability is het equivalent op solutieniveau — groter in omvang, mogelijk meerdere ARTs en PIs omspannend. Capabilities zijn in de Solution Backlog; Features in de Program Backlog. (SAFe 6.0, SAFe Backloglagen)',
        },
        {
          id: 'safe-exam-q13',
          question: 'SAFe Principle #4 — "Build incrementally with fast, integrated learning cycles" — is best demonstrated by which practice?',
          questionNL: 'SAFe Principe #4 — "Bouw incrementeel met snelle, geïntegreerde leercycli" — wordt het beste gedemonstreerd door welke praktijk?',
          options: [
            'Publishing detailed quarterly project status reports',
            'Delivering a System Demo every two weeks using working, integrated software',
            'Conducting annual user research before starting development',
            'Writing comprehensive specifications before coding begins',
          ],
          optionsNL: [
            'Gedetailleerde kwartaalprojectstatusrapporten publiceren',
            'Een System Demo leveren elke twee weken met werkende, geïntegreerde software',
            'Jaarlijks gebruikersonderzoek uitvoeren voordat de ontwikkeling begint',
            'Uitgebreide specificaties schrijven voordat het coderen begint',
          ],
          correctAnswer: 1,
          explanation: 'Principle #4 is embodied by the bi-weekly System Demo. Working integrated software is delivered every two weeks, generating real feedback and enabling rapid course correction. This directly applies the principle: short cycles, integration, learning, adjustment. (SAFe 6.0, Principle #4)',
          explanationNL: 'Principe #4 wordt belichaamd door de tweewekelijkse System Demo. Werkende geïntegreerde software wordt elke twee weken geleverd, wat echte feedback genereert en snelle bijsturing mogelijk maakt. Dit past het principe direct toe: korte cycli, integratie, leren, aanpassen. (SAFe 6.0, Principe #4)',
        },
        {
          id: 'safe-exam-q14',
          question: 'In the Inspect & Adapt event, the Problem-Solving Workshop uses which root-cause analysis tools?',
          questionNL: 'In het Inspect & Adapt-event gebruikt de Problem-Solving Workshop welke oorzaakanalysetools?',
          options: [
            'SWOT analysis and Balanced Scorecard',
            'Fishbone diagram (Ishikawa) and 5-Whys',
            'Risk matrix and probability-impact grid',
            'Affinity map and impact/effort matrix',
          ],
          optionsNL: [
            'SWOT-analyse en Balanced Scorecard',
            'Visgraatdiagram (Ishikawa) en 5-Waaroms',
            'Risicomatrix en waarschijnlijkheids-impactgrid',
            'Affiniteitskaart en impact/inspanningsmatrix',
          ],
          correctAnswer: 1,
          explanation: 'SAFe\'s I&A Problem-Solving Workshop uses the Fishbone diagram (cause-and-effect / Ishikawa) and the 5-Whys technique to identify root causes. A Pareto vote then selects the biggest root cause to address first. (SAFe 6.0, Inspect & Adapt)',
          explanationNL: 'SAFe\'s I&A Problem-Solving Workshop gebruikt het visgraatdiagram (oorzaak-gevolg / Ishikawa) en de 5-Waaroms-techniek om grondoorzaken te identificeren. Een Pareto-stemming selecteert vervolgens de grootste grondoorzaak om als eerste aan te pakken. (SAFe 6.0, Inspect & Adapt)',
        },
        {
          id: 'safe-exam-q15',
          question: 'Which of the following is a valid signal that an organization may need to add Large Solution SAFe?',
          questionNL: 'Welke van de volgende is een geldige indicatie dat een organisatie mogelijk Large Solution SAFe moet toevoegen?',
          options: [
            'The organization has more than one ART delivering independent products',
            'A single solution requires 4+ ARTs working together on one integrated deliverable',
            'The portfolio needs Lean Budgets instead of project funding',
            'One ART has grown to 130 people',
          ],
          optionsNL: [
            'De organisatie heeft meer dan één ART die onafhankelijke producten levert',
            'Een enkele oplossing vereist 4+ ARTs die samenwerken aan één geïntegreerde oplevering',
            'Het portfolio heeft Lean Budgets nodig in plaats van projectfinanciering',
            'Één ART is gegroeid tot 130 mensen',
          ],
          correctAnswer: 1,
          explanation: 'Large Solution SAFe is warranted when a single integrated solution requires multiple ARTs working together. Multiple ARTs delivering separate products belong in Portfolio SAFe, not a Solution Train. Need for Lean Budgets signals Portfolio SAFe. An ART at 130 should be split into two ARTs. (SAFe 6.0, Choosing a Configuration)',
          explanationNL: 'Large Solution SAFe is gerechtvaardigd wanneer een enkele geïntegreerde oplossing meerdere ARTs vereist die samenwerken. Meerdere ARTs die afzonderlijke producten leveren horen thuis in Portfolio SAFe, niet een Solution Train. Behoefte aan Lean Budgets geeft Portfolio SAFe aan. Een ART van 130 mensen moet worden gesplitst in twee ARTs. (SAFe 6.0, Een Configuratie Kiezen)',
        },
        {
          id: 'safe-exam-q16',
          question: 'SAFe\'s Release on Demand concept requires that which technical capability be in place?',
          questionNL: 'SAFe\'s Release on Demand-concept vereist dat welke technische mogelijkheid aanwezig is?',
          options: [
            'A dedicated release manager who approves every deployment',
            'Continuous Integration, Continuous Deployment, feature flags, and automated monitoring',
            'Monthly release windows approved by the Change Advisory Board',
            'Manual regression testing performed by a dedicated QA team before every release',
          ],
          optionsNL: [
            'Een dedicated release manager die elke deployment goedkeurt',
            'Continue Integratie, Continue Deployment, feature flags en geautomatiseerde monitoring',
            'Maandelijkse releasevensters goedgekeurd door de Change Advisory Board',
            'Handmatige regressietesten uitgevoerd door een dedicated QA-team voor elke release',
          ],
          correctAnswer: 1,
          explanation: 'Release on Demand requires Continuous Integration, Continuous Deployment, feature flags (to decouple deployment from release), automated monitoring, and rollback automation. Without these engineering foundations, "release on demand" is a fiction. (SAFe 6.0, Release on Demand)',
          explanationNL: 'Release on Demand vereist Continue Integratie, Continue Deployment, feature flags (om deployment te ontkoppelen van release), geautomatiseerde monitoring en rollback-automatisering. Zonder deze engineeringfundamenten is "release on demand" fictie. (SAFe 6.0, Release on Demand)',
        },
        {
          id: 'safe-exam-q17',
          question: 'SAFe Flow Metrics include Flow Efficiency, which measures what?',
          questionNL: 'SAFe Flow Metrics omvatten Flow Efficiency, die wat meet?',
          options: [
            'The number of story points completed per iteration',
            'The percentage of flow time that items spend in active work (not waiting)',
            'The ratio of planned features to delivered features',
            'Employee satisfaction with the ART cadence',
          ],
          optionsNL: [
            'Het aantal story points voltooid per iteratie',
            'Het percentage van de flow-tijd dat items in actief werk doorbrengen (niet wachten)',
            'De verhouding van geplande features tot geleverde features',
            'Medewerkerstevredenheid met de ART-cadans',
          ],
          correctAnswer: 1,
          explanation: 'Flow Efficiency = Active Time / (Active Time + Wait Time). It measures the proportion of total flow time that items spend being actively worked on. Most systems are 5–20% efficient, meaning 80–95% of time is spent waiting. Improving Flow Efficiency means reducing queues and handoffs. (SAFe 6.0, Flow Metrics)',
          explanationNL: 'Flow Efficiency = Actieve Tijd / (Actieve Tijd + Wachttijd). Het meet het aandeel van de totale flow-tijd dat items actief worden bewerkt. De meeste systemen zijn 5–20% efficiënt, wat betekent dat 80–95% van de tijd wordt besteed aan wachten. Flow Efficiency verbeteren betekent wachtrijen en overdrachten verminderen. (SAFe 6.0, Flow Metrics)',
        },
        {
          id: 'safe-exam-q18',
          question: 'What is the Solution Train Engineer\'s (STE) primary responsibility in Large Solution SAFe?',
          questionNL: 'Wat is de primaire verantwoordelijkheid van de Solution Train Engineer (STE) in Large Solution SAFe?',
          options: [
            'Writing the Solution Backlog items (Capabilities)',
            'Acting as the chief Scrum Master across all ARTs in the Solution Train',
            'Approving all technical decisions across ARTs',
            'Managing the portfolio budget allocation',
          ],
          optionsNL: [
            'De Solution Backlog-items (Capabilities) schrijven',
            'Fungeren als de chief Scrum Master over alle ARTs in de Solution Train',
            'Alle technische beslissingen over ARTs goedkeuren',
            'De portefeuillebudgettoewijzing beheren',
          ],
          correctAnswer: 1,
          explanation: 'The Solution Train Engineer (STE) is the chief Scrum Master for the Solution Train — the STE-equivalent of the RTE across multiple ARTs. The STE facilitates Solution Train events, removes systemic impediments across ARTs, and coaches the train. (SAFe 6.0, Solution Train Engineer)',
          explanationNL: 'De Solution Train Engineer (STE) is de chief Scrum Master voor de Solution Train — het STE-equivalent van de RTE over meerdere ARTs. De STE faciliteert Solution Train-events, verwijdert systemische impedimenten over ARTs en coacht de trein. (SAFe 6.0, Solution Train Engineer)',
        },
        {
          id: 'safe-exam-q19',
          question: 'A portfolio has three value streams with different strategic priorities. According to SAFe LPM, how should budget be allocated?',
          questionNL: 'Een portfolio heeft drie waardestromen met verschillende strategische prioriteiten. Hoe moet het budget volgens SAFe LPM worden toegewezen?',
          options: [
            'Equally split across all value streams regardless of strategic priority',
            'Entirely to the highest-priority value stream until it is complete',
            'As Lean Budgets to each value stream aligned to Strategic Themes, adjusted as evidence accumulates',
            'Only through project-by-project proposals to the finance committee',
          ],
          optionsNL: [
            'Gelijkelijk verdeeld over alle waardestromen ongeacht strategische prioriteit',
            'Volledig naar de hoogst-prioritaire waardestroom totdat deze voltooid is',
            'Als Lean Budgets aan elke waardestroom afgestemd op Strategische Thema\'s, aangepast naarmate bewijs zich opstapelt',
            'Alleen via project-voor-project voorstellen aan de financiecommissie',
          ],
          correctAnswer: 2,
          explanation: 'LPM allocates Lean Budgets to each value stream based on Strategic Themes and investment priorities. Budgets are persistent (not project-by-project) and are adjusted periodically — typically at quarterly Portfolio Syncs — as evidence of value delivery or strategic shift accumulates. (SAFe 6.0, Lean Budgets)',
          explanationNL: 'LPM wijst Lean Budgets toe aan elke waardestroom op basis van Strategische Thema\'s en investeringsprioriteiten. Budgetten zijn persistent (niet project-voor-project) en worden periodiek aangepast — doorgaans bij kwartaalse Portfolio Syncs — naarmate bewijs van waardebezorging of strategische verschuiving zich opstapelt. (SAFe 6.0, Lean Budgets)',
        },
        {
          id: 'safe-exam-q20',
          question: 'Which statement about SAFe teams at the team level is correct?',
          questionNL: 'Welke stelling over SAFe-teams op teamniveau is correct?',
          options: [
            'SAFe teams must use Scrum exclusively; Kanban is not permitted',
            'SAFe teams use Scrum, Kanban, or a hybrid; the team-level process is flexible within the ART cadence',
            'SAFe teams work on two-month iterations aligned to PI boundaries',
            'SAFe teams do not have Product Owners — that role is eliminated at team level',
          ],
          optionsNL: [
            'SAFe-teams moeten exclusief Scrum gebruiken; Kanban is niet toegestaan',
            'SAFe-teams gebruiken Scrum, Kanban of een hybride; het teamniveau-proces is flexibel binnen de ART-cadans',
            'SAFe-teams werken aan iteraties van twee maanden die zijn afgestemd op PI-grenzen',
            'SAFe-teams hebben geen Product Owners — die rol is geëlimineerd op teamniveau',
          ],
          correctAnswer: 1,
          explanation: 'SAFe supports Scrum, Kanban, and hybrid (Scrumban) at the team level. Teams choose the method that fits their work type. All teams, regardless of method, synchronize to the ART\'s two-week iteration cadence. Product Owners exist at team level in SAFe. (SAFe 6.0, Team and Technical Agility)',
          explanationNL: 'SAFe ondersteunt Scrum, Kanban en hybride (Scrumban) op teamniveau. Teams kiezen de methode die past bij hun werktype. Alle teams, ongeacht methode, synchroniseren met de tweewekelijkse iteratiecadans van de ART. Product Owners bestaan op teamniveau in SAFe. (SAFe 6.0, Team en Technische Wendbaarheid)',
        },
      ],
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