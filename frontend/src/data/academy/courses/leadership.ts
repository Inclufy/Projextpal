// ============================================
// COURSE: LEADERSHIP FOR PROJECT MANAGERS
// ============================================
// Complete course with full transcripts, quizzes, and resources
// ============================================

import { Crown } from 'lucide-react';
import { Course, Module } from '../types';
import { BRAND } from '../brand';
import { instructors } from '../instructors';

// ============================================
// MODULE 1: LEADERSHIP FOUNDATIONS
// ============================================
const module1: Module = {
  id: 'lead-m1',
  title: 'Leadership Foundations',
  titleNL: 'Leiderschap Fundamenten',
  description: 'Understanding leadership vs management and developing your personal style.',
  descriptionNL: 'Leiderschap vs management begrijpen en je persoonlijke stijl ontwikkelen.',
  order: 0,
  icon: 'Compass',
  color: '#F59E0B',
  gradient: 'linear-gradient(135deg, #F59E0B 0%, #D97706 100%)',
  lessons: [
    {
      id: 'lead-l1',
      title: 'Manager vs Leader',
      titleNL: 'Manager vs Leider',
      type: 'video',
      duration: '10:00',
      free: true,
      videoUrl: '',
      icon: 'Scale',
      transcript: `Welcome to the Leadership for Project Managers course! In this first lesson, we'll explore one of the most fundamental questions: what's the difference between a manager and a leader?

**The Classic Distinction**

Warren Bennis once said: "Managers do things right, leaders do the right things." But what does that really mean?

**The Manager vs Leader Matrix**

Let me show you a visual comparison:

\`\`\`
┌─────────────────┬─────────────────────┬──────────────────────┐
│                 │      MANAGER        │       LEADER         │
├─────────────────┼─────────────────────┼──────────────────────┤
│ Focus           │ Systems & Structure │ People & Vision      │
│ Approach        │ Administers         │ Innovates            │
│ Timeframe       │ Short-range         │ Long-range           │
│ Questions       │ How and When?       │ What and Why?        │
│ Control         │ Relies on Control   │ Inspires Trust       │
│ Change          │ Accepts Status Quo  │ Challenges Status Quo│
│ View            │ Eye on Bottom Line  │ Eye on Horizon       │
└─────────────────┴─────────────────────┴──────────────────────┘
\`\`\`

**Manager**
- Administers
- Maintains
- Focuses on systems and structure
- Relies on control
- Short-range view
- Asks how and when
- Eye on the bottom line
- Accepts the status quo

**Leader**
- Innovates
- Develops
- Focuses on people
- Inspires trust
- Long-range perspective
- Asks what and why
- Eye on the horizon
- Challenges the status quo

**Both Are Essential**

Here's the key insight: you need to be BOTH. Great project managers are both effective managers AND inspiring leaders.

**The Leadership-Management Balance Model**

Visualize this as a 2x2 matrix:

\`\`\`
High Leadership │  Visionary but     │  THE SWEET SPOT  │
                │  Chaotic           │  Leadership +    │
                │                    │  Management      │
                ├────────────────────┼──────────────────┤
Low Leadership  │  Neither/Nor       │  Efficient but   │
                │  Ineffective       │  Uninspiring     │
                └────────────────────┴──────────────────┘
                   Low Management        High Management
\`\`\`

As a manager, you:
- Create schedules and track tasks
- Monitor budget and resources
- Ensure quality standards
- Manage risks and issues
- Report to stakeholders

As a leader, you:
- Create vision and direction
- Inspire and motivate the team
- Build trust and relationships
- Navigate change and uncertainty
- Develop team members

**The Project Context**

In project management, this dual role is crucial:

**Management without Leadership** = The project runs efficiently but lacks direction and engagement. Team does what's asked but no more.

**Leadership without Management** = Great vision and energy but chaos in execution. Missed deadlines and blown budgets.

**Leadership AND Management** = The sweet spot. Clear direction with solid execution. Engaged team delivering results.

**Your Leadership Journey**

As you progress in your PM career:
- Junior PM: Heavy on management (learning the mechanics)
- Mid-level PM: Balance (managing complexity, leading small teams)
- Senior PM: Heavy on leadership (setting direction, developing others)

But even as a junior PM, you can practice leadership:
- Take initiative
- Support team members
- Suggest improvements
- Build relationships

**Leadership is a Choice**

Here's the empowering truth: leadership is not about your title or position. It's about the choice you make every day.

You can be a leader from any role by:
- Taking responsibility
- Showing initiative
- Inspiring others
- Doing the right thing

**Summary**

Management and leadership are both essential. Great project managers master both:
- Manage processes, lead people
- Manage tasks, lead change
- Manage resources, lead innovation

In the following lessons, we'll dive deeper into developing your leadership capabilities.`,
      transcriptNL: `Welkom bij de cursus Leiderschap voor Projectmanagers! In deze eerste les verkennen we een van de meest fundamentele vragen: wat is het verschil tussen een manager en een leider?

**Het Klassieke Onderscheid**

Warren Bennis zei ooit: "Managers doen dingen goed, leiders doen de goede dingen." Maar wat betekent dat eigenlijk?

**Manager**
- Administreert
- Onderhoudt
- Focust op systemen en structuur
- Vertrouwt op controle
- Korte termijn visie
- Vraagt hoe en wanneer
- Oog op de cijfers
- Accepteert de status quo

**Leider**
- Innoveert
- Ontwikkelt
- Focust op mensen
- Inspireert vertrouwen
- Lange termijn perspectief
- Vraagt wat en waarom
- Oog op de horizon
- Daagt de status quo uit

**Beide Zijn Essentieel**

Hier is het belangrijkste inzicht: je moet BEIDE zijn. Geweldige projectmanagers zijn zowel effectieve managers ALS inspirerende leiders.

Als manager:
- Maak je planningen en volg taken op
- Monitor je budget en resources
- Zorg je voor kwaliteitsstandaarden
- Beheer je risico's en issues
- Rapporteer je aan stakeholders

Als leider:
- Creëer je visie en richting
- Inspireer en motiveer je het team
- Bouw je vertrouwen en relaties
- Navigeer je verandering en onzekerheid
- Ontwikkel je teamleden

**De Projectcontext**

In projectmanagement is deze dubbele rol cruciaal:

**Management zonder Leiderschap** = Het project loopt efficiënt maar mist richting en betrokkenheid. Team doet wat gevraagd wordt maar niet meer.

**Leiderschap zonder Management** = Geweldige visie en energie maar chaos in de uitvoering. Gemiste deadlines en overschreden budgetten.

**Leiderschap EN Management** = De sweet spot. Duidelijke richting met solide uitvoering. Betrokken team dat resultaten levert.

**Jouw Leiderschapsreis**

Naarmate je vordert in je PM carrière:
- Junior PM: Zwaar op management (leren van de mechanica)
- Mid-level PM: Balans (complexiteit managen, kleine teams leiden)
- Senior PM: Zwaar op leiderschap (richting bepalen, anderen ontwikkelen)

Maar zelfs als junior PM kun je leiderschap oefenen:
- Neem initiatief
- Ondersteun teamleden
- Stel verbeteringen voor
- Bouw relaties op

**Leiderschap is een Keuze**

Dit is de krachtige waarheid: leiderschap gaat niet over je titel of positie. Het gaat om de keuze die je elke dag maakt.

Je kunt een leider zijn vanuit elke rol door:
- Verantwoordelijkheid te nemen
- Initiatief te tonen
- Anderen te inspireren
- Het juiste te doen

**Samenvatting**

Management en leiderschap zijn beide essentieel. Geweldige projectmanagers beheersen beide:
- Manage processen, leid mensen
- Manage taken, leid verandering
- Manage resources, leid innovatie

In de volgende lessen duiken we dieper in het ontwikkelen van je leiderschapscapaciteiten.`,
      keyTakeaways: [
        'Managers do things right, leaders do the right things',
        'Great PMs need both management AND leadership skills',
        'Management focuses on processes, leadership on people',
        'Leadership is a choice, not a position',
      ],
      keyTakeawaysNL: [
        'Managers doen dingen goed, leiders doen de goede dingen',
        'Geweldige PMs hebben zowel management ALS leiderschapsvaardigheden nodig',
        'Management focust op processen, leiderschap op mensen',
        'Leiderschap is een keuze, geen positie',
      ],
      resources: [
        {
          name: 'Manager vs Leader Infographic',
          nameNL: 'Manager vs Leider Infographic',
          type: 'PDF',
          size: '1.2 MB',
          description: 'Visual comparison of management and leadership traits',
          descriptionNL: 'Visuele vergelijking van management en leiderschapskenmerken',
        },
      ],
    },
    {
      id: 'lead-l2',
      title: 'Leadership Styles',
      titleNL: 'Leiderschapsstijlen',
      type: 'video',
      duration: '14:00',
      free: true,
      videoUrl: '',
      icon: 'Palette',
      transcript: `There's no one "right" way to lead. Different situations call for different leadership styles. In this lesson, we'll explore the main leadership styles and when to use each.

**The Six Leadership Styles (Goleman)**

Daniel Goleman identified six leadership styles based on emotional intelligence:

**Visual: The Leadership Styles Hexagon**

\`\`\`
                    AUTHORITATIVE
                   "Come with me"
                   (Most Effective)
                         │
                         │
    COERCIVE ────────────┼──────────── DEMOCRATIC
   "Do what I say"       │           "What do you think?"
                         │
                         │
    PACESETTING ─────────┼──────────── AFFILIATIVE
   "Do as I do"          │           "People first"
                         │
                    COACHING
                   "Try this"
\`\`\`

**Style Effectiveness Chart:**

\`\`\`
Impact on Climate:
Coercive      ████░░░░░░  -20% (Negative)
Authoritative █████████░  +90% (Highly Positive)
Affiliative   ████████░░  +80% (Positive)
Democratic    ███████░░░  +70% (Positive)
Pacesetting   ███░░░░░░░  -30% (Negative if overused)
Coaching      ███████░░░  +70% (Positive but time-intensive)
\`\`\`

Let's explore each in detail:

**1. Coercive (Commanding)** ⚠️
"Do what I tell you"

**When It Works:**
\`\`\`
✓ Crisis situations
✓ Problem employees
✓ Quick turnaround needed
✓ Emergency response
\`\`\`

**When It Fails:**
\`\`\`
✗ Long-term use
✗ With skilled professionals
✗ Creative work
✗ Building morale
\`\`\`

Approach:
- Demands immediate compliance
- Gives clear directions
- Closely monitors
- Uses consequences

Impact: Often negative long-term. Use sparingly.

**2. Authoritative (Visionary)** ⭐
"Come with me"

**The Gold Standard Framework:**

\`\`\`
        CLEAR VISION
             │
    ┌────────┴────────┐
    │                 │
AUTONOMY         INSPIRATION
ON "HOW"         TO COMMIT
    │                 │
    └────────┬────────┘
             │
      HIGH ENGAGEMENT
\`\`\`

Approach:
- Provides clear vision
- Explains the "why"
- Gives autonomy on "how"
- Inspires commitment

When to use:
- When change is needed
- When vision is unclear
- With motivated teams

Impact: Highly positive. Most effective overall.

**3. Affiliative** 💚
"People come first"

**The Harmony Model:**

\`\`\`
TASK ←──────────────→ RELATIONSHIP
FOCUS                     FOCUS
  │                         │
  │     AFFILIATIVE         │
  │         STYLE           │
  │           ↓             │
  └──── TEAM HARMONY ───────┘
\`\`\`

Approach:
- Builds emotional bonds
- Promotes harmony
- Values people over tasks
- Creates positive atmosphere

When to use:
- Healing team conflicts
- Building trust
- During stressful times

Impact: Positive but can lead to poor performance if overused.

**4. Democratic (Participative)** 🗳️
"What do you think?"

**The Consensus Pyramid:**

\`\`\`
        FINAL DECISION
              △
             ╱ ╲
            ╱   ╲
           ╱     ╲
          ╱INPUT  ╲
         ╱  FROM   ╲
        ╱    ALL    ╲
       ╱   MEMBERS   ╲
      ╱_______________╲
     SHARED OWNERSHIP
\`\`\`

Approach:
- Builds consensus
- Gets input from all
- Collaborative decision-making
- Develops team ownership

When to use:
- When you need buy-in
- Team has expertise
- Building consensus important

Impact: Positive but slow. Not for urgent decisions.

**5. Pacesetting** 🏃
"Do as I do, now"

**The Burnout Curve:**

\`\`\`
Performance
    │     ╱╲
    │    ╱  ╲  ← Peak (unsustainable)
    │   ╱    ╲
    │  ╱      ╲_____ ← Burnout
    │ ╱              ╲
    │╱________________╲___
    └──────────────────────→ Time
    START  SHORT-TERM  LONG-TERM
\`\`\`

Approach:
- Sets high standards
- Leads by example
- Expects self-direction
- Quick to take over if standards slip

When to use:
- With highly competent, motivated teams
- When quick results needed
- Short-term situations

Impact: Often negative. Exhausting and demoralizing if sustained.

**6. Coaching** 🎓
"Try this"

**The Growth Framework:**

\`\`\`
    CURRENT STATE
         │
         ↓
    [CHALLENGE]
         │
         ↓
    [COACHING]
    ╱  │  ╲
   ╱   │   ╲
FEEDBACK │ SUPPORT
   ╲   │   ╱
    ╲  │  ╱
     ╲ │ ╱
      ↓↓↓
  CAPABILITY
   DEVELOPED
\`\`\`

Approach:
- Develops people
- Provides feedback
- Delegates challenging assignments
- Long-term focus

When to use:
- Developing team members
- When time allows
- Building capabilities

Impact: Highly positive but time-intensive.

**Situational Leadership Matrix**

\`\`\`
                HIGH URGENCY
                      │
    COERCIVE ─────────┼───────── AUTHORITATIVE
    (Crisis)          │         (Change needed)
                      │
  ──────────────────────────────────────
                      │
    PACESETTING ──────┼───────── DEMOCRATIC
    (Quick wins)      │         (Build buy-in)
                      │
                LOW URGENCY
\`\`\`

The key is to be flexible and adapt your style to:

**The Person:**
- New team member? More directive
- Experienced professional? More autonomy
- Struggling performer? More coaching

**The Situation:**
- Crisis? More coercive
- Strategic planning? More democratic
- Team conflict? More affiliative

**The Task:**
- Routine? Delegate
- Complex? Collaborate
- Urgent? Direct

**Your Leadership Repertoire**

Think of these styles as tools in your toolbox. The best leaders:
- Are comfortable with multiple styles
- Can switch based on needs
- Don't rely on just one style
- Develop weak areas

**Finding Your Natural Style**

Most leaders have a dominant style - what feels natural to you. This is okay, but:
- Be aware of your default
- Recognize when it's not working
- Deliberately practice other styles
- Get feedback on your effectiveness

**The Project Manager's Challenge**

As a PM, you often lead without authority. This means:
- Coercive style rarely available
- Must rely on influence, not command
- Authoritative and coaching particularly valuable
- Democratic helps build buy-in

**Summary**

Six leadership styles, each with its place:
- Coercive: Crisis only
- Authoritative: Vision and change ⭐
- Affiliative: Harmony and healing
- Democratic: Consensus and buy-in
- Pacesetting: Short bursts with top performers
- Coaching: Long-term development

The best leaders use all six, adapting to the situation.

**The Six Leadership Styles (Goleman)**

Daniel Goleman identified six leadership styles based on emotional intelligence:

**1. Coercive (Commanding)**
"Do what I tell you"

Approach:
- Demands immediate compliance
- Gives clear directions
- Closely monitors
- Uses consequences

When to use:
- Crisis situations
- With problem employees
- When quick turnaround needed

Impact: Often negative long-term. Use sparingly.

**2. Authoritative (Visionary)**
"Come with me"

Approach:
- Provides clear vision
- Explains the "why"
- Gives autonomy on "how"
- Inspires commitment

When to use:
- When change is needed
- When vision is unclear
- With motivated teams

Impact: Highly positive. Most effective overall.

**3. Affiliative**
"People come first"

Approach:
- Builds emotional bonds
- Promotes harmony
- Values people over tasks
- Creates positive atmosphere

When to use:
- Healing team conflicts
- Building trust
- During stressful times

Impact: Positive but can lead to poor performance if overused.

**4. Democratic (Participative)**
"What do you think?"

Approach:
- Builds consensus
- Gets input from all
- Collaborative decision-making
- Develops team ownership

When to use:
- When you need buy-in
- Team has expertise
- Building consensus important

Impact: Positive but slow. Not for urgent decisions.

**5. Pacesetting**
"Do as I do, now"

Approach:
- Sets high standards
- Leads by example
- Expects self-direction
- Quick to take over if standards slip

When to use:
- With highly competent, motivated teams
- When quick results needed
- Short-term situations

Impact: Often negative. Exhausting and demoralizing if sustained.

**6. Coaching**
"Try this"

Approach:
- Develops people
- Provides feedback
- Delegates challenging assignments
- Long-term focus

When to use:
- Developing team members
- When time allows
- Building capabilities

Impact: Highly positive but time-intensive.

**Situational Leadership**

The key is to be flexible and adapt your style to:

**The Person:**
- New team member? More directive
- Experienced professional? More autonomy
- Struggling performer? More coaching

**The Situation:**
- Crisis? More coercive
- Strategic planning? More democratic
- Team conflict? More affiliative

**The Task:**
- Routine? Delegate
- Complex? Collaborate
- Urgent? Direct

**Your Leadership Repertoire**

Think of these styles as tools in your toolbox. The best leaders:
- Are comfortable with multiple styles
- Can switch based on needs
- Don't rely on just one style
- Develop weak areas

**Finding Your Natural Style**

Most leaders have a dominant style - what feels natural to you. This is okay, but:
- Be aware of your default
- Recognize when it's not working
- Deliberately practice other styles
- Get feedback on your effectiveness

**The Project Manager's Challenge**

As a PM, you often lead without authority. This means:
- Coercive style rarely available
- Must rely on influence, not command
- Authoritative and coaching particularly valuable
- Democratic helps build buy-in

**Summary**

Six leadership styles, each with its place:
- Coercive: Crisis only
- Authoritative: Vision and change
- Affiliative: Harmony and healing
- Democratic: Consensus and buy-in
- Pacesetting: Short bursts with top performers
- Coaching: Long-term development

The best leaders use all six, adapting to the situation.`,
      transcriptNL: `Er is niet één "juiste" manier om te leiden. Verschillende situaties vragen om verschillende leiderschapsstijlen. In deze les verkennen we de belangrijkste leiderschapsstijlen en wanneer je elke stijl gebruikt.

**De Zes Leiderschapsstijlen (Goleman)**

Daniel Goleman identificeerde zes leiderschapsstijlen gebaseerd op emotionele intelligentie:

**1. Dwingend (Commanding)**
"Doe wat ik zeg"

Aanpak:
- Eist onmiddellijke naleving
- Geeft duidelijke instructies
- Monitort nauwlettend
- Gebruikt consequenties

Wanneer te gebruiken:
- Crisissituaties
- Bij probleemmedewerkers
- Wanneer snelle ommezwaai nodig is

Impact: Vaak negatief op lange termijn. Spaarzaam gebruiken.

**2. Autoritatief (Visionair)**
"Ga met me mee"

Aanpak:
- Biedt duidelijke visie
- Legt de "waarom" uit
- Geeft autonomie over "hoe"
- Inspireert commitment

Wanneer te gebruiken:
- Wanneer verandering nodig is
- Wanneer visie onduidelijk is
- Met gemotiveerde teams

Impact: Zeer positief. Meest effectief overall.

**3. Affiliatief**
"Mensen komen eerst"

Aanpak:
- Bouwt emotionele banden
- Bevordert harmonie
- Waardeert mensen boven taken
- Creëert positieve sfeer

Wanneer te gebruiken:
- Teamconflicten helen
- Vertrouwen opbouwen
- Tijdens stressvolle tijden

Impact: Positief maar kan leiden tot slechte prestaties bij overmatig gebruik.

**4. Democratisch (Participatief)**
"Wat denk jij?"

Aanpak:
- Bouwt consensus
- Vraagt input van iedereen
- Collaboratieve besluitvorming
- Ontwikkelt team ownership

Wanneer te gebruiken:
- Wanneer je buy-in nodig hebt
- Team heeft expertise
- Consensus opbouwen belangrijk

Impact: Positief maar traag. Niet voor urgente beslissingen.

**5. Pacesetting**
"Doe zoals ik, nu"

Aanpak:
- Stelt hoge standaarden
- Leidt door voorbeeld
- Verwacht zelfaansturing
- Snel om over te nemen als standaarden afnemen

Wanneer te gebruiken:
- Met zeer competente, gemotiveerde teams
- Wanneer snelle resultaten nodig zijn
- Korte termijn situaties

Impact: Vaak negatief. Uitputtend en demoraliserend als langdurig.

**6. Coaching**
"Probeer dit"

Aanpak:
- Ontwikkelt mensen
- Geeft feedback
- Delegeert uitdagende opdrachten
- Lange termijn focus

Wanneer te gebruiken:
- Teamleden ontwikkelen
- Wanneer tijd het toelaat
- Capaciteiten opbouwen

Impact: Zeer positief maar tijdintensief.

**Situationeel Leiderschap**

De sleutel is flexibel te zijn en je stijl aan te passen aan:

**De Persoon:**
- Nieuw teamlid? Meer directief
- Ervaren professional? Meer autonomie
- Worstelende performer? Meer coaching

**De Situatie:**
- Crisis? Meer dwingend
- Strategische planning? Meer democratisch
- Teamconflict? Meer affiliatief

**De Taak:**
- Routine? Delegeren
- Complex? Samenwerken
- Urgent? Directief

**Jouw Leiderschapsrepertoire**

Zie deze stijlen als tools in je gereedschapskist. De beste leiders:
- Zijn comfortabel met meerdere stijlen
- Kunnen switchen op basis van behoeften
- Vertrouwen niet op slechts één stijl
- Ontwikkelen zwakke gebieden

**Je Natuurlijke Stijl Vinden**

Meeste leiders hebben een dominante stijl - wat natuurlijk voor je voelt. Dit is oké, maar:
- Wees bewust van je standaard
- Herken wanneer het niet werkt
- Oefen bewust andere stijlen
- Vraag feedback over je effectiviteit

**De Uitdaging van de Projectmanager**

Als PM leid je vaak zonder autoriteit. Dit betekent:
- Dwingende stijl zelden beschikbaar
- Moet vertrouwen op invloed, niet commando
- Autoritatief en coaching bijzonder waardevol
- Democratisch helpt buy-in opbouwen

**Samenvatting**

Zes leiderschapsstijlen, elk met zijn plaats:
- Dwingend: Alleen crisis
- Autoritatief: Visie en verandering
- Affiliatief: Harmonie en heling
- Democratisch: Consensus en buy-in
- Pacesetting: Korte bursts met toppresteerders
- Coaching: Lange termijn ontwikkeling

De beste leiders gebruiken alle zes, aangepast aan de situatie.`,
      keyTakeaways: [
        'Six leadership styles: Coercive, Authoritative, Affiliative, Democratic, Pacesetting, Coaching',
        'Authoritative (visionary) is most effective overall',
        'Adapt your style to the person, situation, and task',
        'PMs often need to lead without authority - use influence',
      ],
      keyTakeawaysNL: [
        'Zes leiderschapsstijlen: Dwingend, Autoritatief, Affiliatief, Democratisch, Pacesetting, Coaching',
        'Autoritatief (visionair) is meest effectief overall',
        'Pas je stijl aan aan de persoon, situatie en taak',
        'PMs moeten vaak leiden zonder autoriteit - gebruik invloed',
      ],
      resources: [
        {
          name: 'Leadership Styles Matrix',
          nameNL: 'Leiderschapsstijlen Matrix',
          type: 'PDF',
          size: '890 KB',
          description: 'When to use each leadership style',
          descriptionNL: 'Wanneer elke leiderschapsstijl te gebruiken',
        },
        {
          name: 'Style Self-Assessment',
          nameNL: 'Stijl Zelfbeoordeling',
          type: 'PDF',
          size: '450 KB',
          description: 'Discover your dominant leadership style',
          descriptionNL: 'Ontdek je dominante leiderschapsstijl',
        },
      ],
    },
    {
      id: 'lead-l3',
      title: 'Emotional Intelligence',
      titleNL: 'Emotionele Intelligentie',
      type: 'video',
      duration: '16:00',
      videoUrl: '',
      transcript: `Emotional Intelligence (EQ) is often more important than IQ for leadership success. In this lesson, we'll explore what EQ is and how to develop it.

**What is Emotional Intelligence?**

Daniel Goleman defines EQ as: "The ability to recognize, understand, and manage our own emotions and the emotions of others."

Why does it matter? Because projects are about people:
- Teams with interpersonal conflicts
- Stakeholders with competing interests
- Stress and pressure
- Change and resistance

Technical skills get you in the game. EQ helps you win.

**The Five Components of EQ**

**1. Self-Awareness**

Understanding your own emotions, strengths, weaknesses, values, and impact on others.

Signs of high self-awareness:
- You know what triggers you
- You recognize your emotional patterns
- You understand your strengths and limits
- You seek feedback actively

How to develop:
- Keep a journal
- Practice mindfulness
- Ask for feedback
- Reflect on reactions

**2. Self-Regulation**

The ability to control or redirect disruptive impulses and adapt to change.

Signs of high self-regulation:
- You think before acting
- You stay calm under pressure
- You handle ambiguity well
- You adapt to change

How to develop:
- Practice the pause (count to 10)
- Identify triggers
- Develop coping strategies
- Focus on what you can control

**3. Motivation**

A passion to work for reasons beyond money or status, and to pursue goals with energy and persistence.

Signs of high motivation:
- You're optimistic even after setbacks
- You set stretch goals
- You focus on learning
- You take initiative

How to develop:
- Connect work to purpose
- Set meaningful goals
- Track progress and celebrate wins
- Surround yourself with motivated people

**4. Empathy**

The ability to understand the emotional makeup of other people and treat them according to their emotional reactions.

Signs of high empathy:
- You read the room well
- You consider others' perspectives
- You show genuine interest in people
- You build rapport easily

How to develop:
- Listen actively (really listen)
- Ask questions
- Observe body language
- Put yourself in others' shoes

**5. Social Skills**

Proficiency in managing relationships and building networks. The ability to find common ground.

Signs of strong social skills:
- You build rapport quickly
- You manage conflict effectively
- You're a team player
- You influence others easily

How to develop:
- Practice active listening
- Learn to give feedback
- Develop conflict resolution skills
- Build genuine relationships

**EQ in Project Management**

Let's look at how EQ shows up in PM scenarios:

**Scenario 1: The Angry Stakeholder**

Low EQ Response:
- Get defensive
- Make excuses
- Argue back
- Shut down

High EQ Response:
- Recognize their frustration (empathy)
- Stay calm (self-regulation)
- Listen fully (social skills)
- Address concerns constructively

**Scenario 2: The Demotivated Team**

Low EQ Response:
- Push harder
- Blame the team
- Ignore the mood
- Focus only on tasks

High EQ Response:
- Notice the shift (self-awareness)
- Understand root causes (empathy)
- Address underlying issues
- Reconnect to purpose (motivation)

**Scenario 3: Project Pressure**

Low EQ Response:
- Panic
- Micromanage
- Blame others
- Work longer hours alone

High EQ Response:
- Acknowledge the pressure (self-awareness)
- Stay composed (self-regulation)
- Rally the team (social skills)
- Focus on what matters (motivation)

**Developing Your EQ**

EQ can be learned and developed. Here's how:

**Daily Practices:**
- Morning check-in: How am I feeling?
- Pause before reacting
- End-of-day reflection
- Active listening in every conversation

**Specific Exercises:**
- Expand your emotional vocabulary
- Practice labeling emotions
- Seek feedback monthly
- Role-play difficult conversations

**Long-term Development:**
- Work with a coach
- Read about EQ
- Observe high-EQ leaders
- Practice, practice, practice

**The ROI of EQ**

Research shows that high-EQ leaders:
- Have more engaged teams
- Achieve better project outcomes
- Handle conflict more effectively
- Are promoted more often

It's worth the investment.

**Summary**

Emotional Intelligence has five components:
1. Self-Awareness: Know yourself
2. Self-Regulation: Control yourself
3. Motivation: Drive yourself
4. Empathy: Understand others
5. Social Skills: Manage relationships

All can be developed with practice and intention.`,
      transcriptNL: `Emotionele Intelligentie (EQ) is vaak belangrijker dan IQ voor leiderschapssucces. In deze les verkennen we wat EQ is en hoe je het ontwikkelt.

**Wat is Emotionele Intelligentie?**

Daniel Goleman definieert EQ als: "Het vermogen om onze eigen emoties en de emoties van anderen te herkennen, begrijpen en managen."

Waarom is het belangrijk? Omdat projecten over mensen gaan:
- Teams met interpersoonlijke conflicten
- Stakeholders met tegenstrijdige belangen
- Stress en druk
- Verandering en weerstand

Technische vaardigheden brengen je in het spel. EQ helpt je winnen.

**De Vijf Componenten van EQ**

**1. Zelfbewustzijn**

Je eigen emoties, sterke en zwakke punten, waarden en impact op anderen begrijpen.

Tekenen van hoog zelfbewustzijn:
- Je weet wat je triggert
- Je herkent je emotionele patronen
- Je begrijpt je sterke punten en beperkingen
- Je vraagt actief om feedback

Hoe te ontwikkelen:
- Houd een dagboek bij
- Oefen mindfulness
- Vraag om feedback
- Reflecteer op reacties

**2. Zelfregulatie**

Het vermogen om disruptieve impulsen te controleren of om te leiden en aan te passen aan verandering.

Tekenen van hoge zelfregulatie:
- Je denkt na voordat je handelt
- Je blijft kalm onder druk
- Je gaat goed om met ambiguïteit
- Je past je aan aan verandering

Hoe te ontwikkelen:
- Oefen de pauze (tel tot 10)
- Identificeer triggers
- Ontwikkel coping strategieën
- Focus op wat je kunt controleren

**3. Motivatie**

Een passie om te werken om redenen voorbij geld of status, en doelen na te streven met energie en persistentie.

Tekenen van hoge motivatie:
- Je bent optimistisch zelfs na tegenslagen
- Je stelt uitdagende doelen
- Je focust op leren
- Je neemt initiatief

Hoe te ontwikkelen:
- Verbind werk met doel
- Stel betekenisvolle doelen
- Volg voortgang en vier overwinningen
- Omring jezelf met gemotiveerde mensen

**4. Empathie**

Het vermogen om de emotionele make-up van andere mensen te begrijpen en ze te behandelen volgens hun emotionele reacties.

Tekenen van hoge empathie:
- Je leest de kamer goed
- Je overweegt andermans perspectieven
- Je toont oprechte interesse in mensen
- Je bouwt gemakkelijk rapport op

Hoe te ontwikkelen:
- Luister actief (echt luisteren)
- Stel vragen
- Observeer lichaamstaal
- Verplaats je in andermans schoenen

**5. Sociale Vaardigheden**

Bekwaamheid in het managen van relaties en het opbouwen van netwerken. Het vermogen om gemeenschappelijke grond te vinden.

Tekenen van sterke sociale vaardigheden:
- Je bouwt snel rapport op
- Je managet conflict effectief
- Je bent een teamspeler
- Je beïnvloedt anderen gemakkelijk

Hoe te ontwikkelen:
- Oefen actief luisteren
- Leer feedback te geven
- Ontwikkel conflictoplossingsvaardigheden
- Bouw oprechte relaties op

**EQ in Projectmanagement**

Laten we kijken hoe EQ zich manifesteert in PM scenario's:

**Scenario 1: De Boze Stakeholder**

Lage EQ Reactie:
- Word defensief
- Maak excuses
- Ga in de tegenaanval
- Sluit je af

Hoge EQ Reactie:
- Herken hun frustratie (empathie)
- Blijf kalm (zelfregulatie)
- Luister volledig (sociale vaardigheden)
- Pak zorgen constructief aan

**Scenario 2: Het Gedemotiveerde Team**

Lage EQ Reactie:
- Duw harder
- Geef het team de schuld
- Negeer de stemming
- Focus alleen op taken

Hoge EQ Reactie:
- Merk de verschuiving op (zelfbewustzijn)
- Begrijp de grondoorzaken (empathie)
- Pak onderliggende problemen aan
- Herverbind met doel (motivatie)

**Scenario 3: Projectdruk**

Lage EQ Reactie:
- Panikeer
- Micromanage
- Geef anderen de schuld
- Werk alleen langere uren

Hoge EQ Reactie:
- Erken de druk (zelfbewustzijn)
- Blijf kalm (zelfregulatie)
- Mobiliseer het team (sociale vaardigheden)
- Focus op wat ertoe doet (motivatie)

**Je EQ Ontwikkelen**

EQ kan worden geleerd en ontwikkeld. Hier is hoe:

**Dagelijkse Praktijken:**
- Ochtend check-in: Hoe voel ik me?
- Pauzeer voor je reageert
- Einde-van-de-dag reflectie
- Actief luisteren in elk gesprek

**Specifieke Oefeningen:**
- Breid je emotionele vocabulaire uit
- Oefen emoties labelen
- Vraag maandelijks feedback
- Rollenspel moeilijke gesprekken

**Lange Termijn Ontwikkeling:**
- Werk met een coach
- Lees over EQ
- Observeer hoge-EQ leiders
- Oefen, oefen, oefen

**De ROI van EQ**

Onderzoek toont dat hoge-EQ leiders:
- Meer betrokken teams hebben
- Betere projectresultaten behalen
- Effectiever met conflict omgaan
- Vaker gepromoveerd worden

Het is de investering waard.

**Samenvatting**

Emotionele Intelligentie heeft vijf componenten:
1. Zelfbewustzijn: Ken jezelf
2. Zelfregulatie: Beheers jezelf
3. Motivatie: Drijf jezelf
4. Empathie: Begrijp anderen
5. Sociale Vaardigheden: Manage relaties

Allemaal kunnen worden ontwikkeld met oefening en intentie.`,
      keyTakeaways: [
        'EQ = ability to recognize, understand, and manage emotions (yours and others)',
        'Five components: Self-Awareness, Self-Regulation, Motivation, Empathy, Social Skills',
        'EQ is often more important than IQ for leadership success',
        'All EQ components can be developed with practice',
      ],
      keyTakeawaysNL: [
        'EQ = vermogen om emoties te herkennen, begrijpen en managen (van jezelf en anderen)',
        'Vijf componenten: Zelfbewustzijn, Zelfregulatie, Motivatie, Empathie, Sociale Vaardigheden',
        'EQ is vaak belangrijker dan IQ voor leiderschapssucces',
        'Alle EQ componenten kunnen worden ontwikkeld met oefening',
      ],
      resources: [
        {
          name: 'EQ Self-Assessment',
          nameNL: 'EQ Zelfbeoordeling',
          type: 'PDF',
          size: '680 KB',
          description: 'Assess your emotional intelligence across five dimensions',
          descriptionNL: 'Beoordeel je emotionele intelligentie over vijf dimensies',
        },
        {
          name: 'EQ Development Plan Template',
          nameNL: 'EQ Ontwikkelplan Template',
          type: 'DOCX',
          size: '245 KB',
          description: 'Create your personal EQ development roadmap',
          descriptionNL: 'Creëer je persoonlijke EQ ontwikkel roadmap',
        },
      ],
    },
    {
      id: 'lead-l4',
      title: 'Self-awareness Assessment',
      titleNL: 'Zelfbewustzijn Assessment',
      type: 'video',
      duration: '12:00',
      videoUrl: '',
      transcript: `Self-awareness is the foundation of leadership development. In this lesson, we'll explore tools and techniques to increase your self-awareness.

**Why Self-Awareness Matters**

You can't change what you don't see. Self-aware leaders:
- Recognize their impact on others
- Play to their strengths
- Compensate for weaknesses
- Make better decisions
- Build stronger relationships

**Assessment Tools**

**1. Personality Assessments**

**Myers-Briggs Type Indicator (MBTI)**
- 16 personality types
- Based on four dichotomies
- Helps understand preferences
- Common in corporate settings

**DISC Assessment**
- Four behavioral styles: Dominance, Influence, Steadiness, Conscientiousness
- Simpler than MBTI
- Focuses on workplace behavior
- Good for team dynamics

**Big Five Personality Traits**
- Openness
- Conscientiousness
- Extraversion
- Agreeableness
- Neuroticism
- Research-backed
- Good predictor of job performance

**2. Strengths Assessments**

**CliftonStrengths (StrengthsFinder)**
- 34 talent themes
- Focuses on what you do best
- Positive psychology approach
- Practical for development

**VIA Character Strengths**
- 24 character strengths
- Based on positive psychology
- Free online assessment
- Complements other tools

**3. 360-Degree Feedback**

Get feedback from:
- Your manager
- Your peers
- Your team
- Stakeholders
- Self-assessment

Compares your self-perception with how others see you. The gaps are revealing!

**The Johari Window**

A model for understanding self-awareness:

\`\`\`
                Known to Self    Unknown to Self
Known to Others    | Arena     |    Blind Spot   |
Unknown to Others  | Façade    |    Unknown      |
\`\`\`

**Arena**: What everyone knows (expand this!)
**Blind Spot**: What others see but you don't (get feedback!)
**Façade**: What you hide (appropriate boundaries)
**Unknown**: Hidden potential (explore!)

**Increasing Self-Awareness**

**Daily Practices:**

**Morning Intention**
- How do I want to show up today?
- What challenges might I face?
- What's my emotional state?

**Evening Reflection**
- What went well?
- What could have gone better?
- What did I learn about myself?
- What will I do differently?

**In-the-Moment Awareness**
- Pause periodically
- Check in: How am I feeling?
- Notice physical sensations
- Observe thoughts without judgment

**Advanced Techniques:**

**Journaling**
Write about:
- Challenging situations
- Emotional reactions
- Patterns you notice
- Insights and learnings

**Mindfulness Meditation**
- Builds awareness of thoughts/feelings
- Increases emotional regulation
- Improves focus
- Just 10 minutes daily helps

**Seeking Feedback**
Ask specific questions:
- "What's one thing I should do more of?"
- "What's one thing I should do less of?"
- "How did I come across in that meeting?"
- "What's my biggest blind spot?"

**Working with a Coach**
- Regular reflection sessions
- Objective perspective
- Accountability
- Accelerated growth

**Your Leadership Values**

Understanding your core values:

Exercise: List 10 times you felt most fulfilled.
- What were you doing?
- Who were you with?
- What values were being honored?

Common leadership values:
- Integrity
- Excellence
- Innovation
- Collaboration
- Service
- Growth
- Courage
- Fairness

Your values guide your decisions and define your leadership.

**Your Leadership Brand**

How do you want to be known?

Three questions:
1. What do I stand for?
2. What makes me different?
3. What value do I create?

Your brand should be:
- Authentic (true to you)
- Distinctive (what makes you unique)
- Relevant (valuable to others)
- Consistent (reliable)

**Creating Your Development Plan**

Based on your self-assessment:

1. **Strengths**: How will you leverage them?
2. **Development Areas**: What will you improve?
3. **Blind Spots**: What will you address?
4. **Values**: How will you honor them?
5. **Goals**: What specific outcomes?

Make it SMART:
- Specific
- Measurable
- Achievable
- Relevant
- Time-bound

**Summary**

Self-awareness is developed through:
- Assessment tools (personality, strengths, 360)
- Daily practices (intention, reflection)
- Feedback (from others and self)
- Understanding values and brand
- Creating a development plan

This is ongoing work, not a one-time activity.`,
      transcriptNL: `Zelfbewustzijn is het fundament van leiderschapsontwikkeling. In deze les verkennen we tools en technieken om je zelfbewustzijn te verhogen.

**Waarom Zelfbewustzijn Belangrijk Is**

Je kunt niet veranderen wat je niet ziet. Zelfbewuste leiders:
- Herkennen hun impact op anderen
- Spelen in op hun sterke punten
- Compenseren voor zwakke punten
- Nemen betere beslissingen
- Bouwen sterkere relaties

**Assessment Tools**

**1. Persoonlijkheidsassessments**

**Myers-Briggs Type Indicator (MBTI)**
- 16 persoonlijkheidstypen
- Gebaseerd op vier dichotomieën
- Helpt voorkeuren begrijpen
- Gangbaar in bedrijven

**DISC Assessment**
- Vier gedragsstijlen: Dominantie, Invloed, Stabiliteit, Consciëntieusheid
- Simpeler dan MBTI
- Focust op werkgedrag
- Goed voor teamdynamiek

**Big Five Persoonlijkheidskenmerken**
- Openheid
- Consciëntieusheid
- Extraversie
- Vriendelijkheid
- Neuroticisme
- Onderzoeks-gebaseerd
- Goede voorspeller van werkprestaties

**2. Sterke Punten Assessments**

**CliftonStrengths (StrengthsFinder)**
- 34 talentthema's
- Focust op wat je het beste doet
- Positieve psychologie benadering
- Praktisch voor ontwikkeling

**VIA Character Strengths**
- 24 karaktersterkte punten
- Gebaseerd op positieve psychologie
- Gratis online assessment
- Vult andere tools aan

**3. 360-Graden Feedback**

Krijg feedback van:
- Je manager
- Je collega's
- Je team
- Stakeholders
- Zelfbeoordeling

Vergelijkt je zelfperceptie met hoe anderen je zien. De gaps zijn verhelderend!

**Het Johari Window**

Een model voor het begrijpen van zelfbewustzijn:

\`\`\`
                Bekend bij Zelf  Onbekend bij Zelf
Bekend bij Anderen  | Arena    |  Blinde Vlek    |
Onbekend bij Anderen| Façade   |  Onbekend       |
\`\`\`

**Arena**: Wat iedereen weet (vergroot dit!)
**Blinde Vlek**: Wat anderen zien maar jij niet (vraag feedback!)
**Façade**: Wat je verbergt (passende grenzen)
**Onbekend**: Verborgen potentieel (verken!)

**Zelfbewustzijn Vergroten**

**Dagelijkse Praktijken:**

**Ochtend Intentie**
- Hoe wil ik me vandaag tonen?
- Welke uitdagingen kan ik tegenkomen?
- Wat is mijn emotionele staat?

**Avond Reflectie**
- Wat ging goed?
- Wat had beter gekund?
- Wat heb ik over mezelf geleerd?
- Wat ga ik anders doen?

**In-het-Moment Bewustzijn**
- Pauzeer periodiek
- Check in: Hoe voel ik me?
- Merk fysieke sensaties op
- Observeer gedachten zonder oordeel

**Geavanceerde Technieken:**

**Dagboek Bijhouden**
Schrijf over:
- Uitdagende situaties
- Emotionele reacties
- Patronen die je opmerkt
- Inzichten en lessen

**Mindfulness Meditatie**
- Bouwt bewustzijn van gedachten/gevoelens
- Verhoogt emotionele regulatie
- Verbetert focus
- Slechts 10 minuten dagelijks helpt

**Feedback Zoeken**
Stel specifieke vragen:
- "Wat is één ding dat ik meer moet doen?"
- "Wat is één ding dat ik minder moet doen?"
- "Hoe kwam ik over in die vergadering?"
- "Wat is mijn grootste blinde vlek?"

**Werken met een Coach**
- Regelmatige reflectiesessies
- Objectief perspectief
- Accountability
- Versnelde groei

**Jouw Leiderschapswaarden**

Je kernwaarden begrijpen:

Oefening: Lijst 10 keer dat je je meest vervuld voelde.
- Wat was je aan het doen?
- Bij wie was je?
- Welke waarden werden geëerd?

Veel voorkomende leiderschapswaarden:
- Integriteit
- Excellentie
- Innovatie
- Samenwerking
- Service
- Groei
- Moed
- Eerlijkheid

Je waarden leiden je beslissingen en definiëren je leiderschap.

**Jouw Leiderschapsmerk**

Hoe wil je bekend staan?

Drie vragen:
1. Waar sta ik voor?
2. Wat maakt me anders?
3. Welke waarde creëer ik?

Je merk moet zijn:
- Authentiek (waar voor jou)
- Onderscheidend (wat maakt je uniek)
- Relevant (waardevol voor anderen)
- Consistent (betrouwbaar)

**Je Ontwikkelplan Creëren**

Gebaseerd op je zelfbeoordeling:

1. **Sterke Punten**: Hoe ga je ze benutten?
2. **Ontwikkelgebieden**: Wat ga je verbeteren?
3. **Blinde Vlekken**: Wat ga je aanpakken?
4. **Waarden**: Hoe ga je ze eren?
5. **Doelen**: Welke specifieke uitkomsten?

Maak het SMART:
- Specifiek
- Meetbaar
- Acceptabel
- Realistisch
- Tijdgebonden

**Samenvatting**

Zelfbewustzijn wordt ontwikkeld door:
- Assessment tools (persoonlijkheid, sterke punten, 360)
- Dagelijkse praktijken (intentie, reflectie)
- Feedback (van anderen en jezelf)
- Waarden en merk begrijpen
- Een ontwikkelplan creëren

Dit is doorlopend werk, geen eenmalige activiteit.`,
      keyTakeaways: [
        'Self-awareness is the foundation of leadership development',
        'Use multiple tools: personality assessments, strengths assessments, 360 feedback',
        'Daily practices: morning intention, evening reflection, in-the-moment awareness',
        'Know your values and build your leadership brand',
      ],
      keyTakeawaysNL: [
        'Zelfbewustzijn is het fundament van leiderschapsontwikkeling',
        'Gebruik meerdere tools: persoonlijkheidsassessments, sterke punten assessments, 360 feedback',
        'Dagelijkse praktijken: ochtend intentie, avond reflectie, in-het-moment bewustzijn',
        'Ken je waarden en bouw je leiderschapsmerk',
      ],
      resources: [
        {
          name: 'Leadership Values Exercise',
          nameNL: 'Leiderschapswaarden Oefening',
          type: 'PDF',
          size: '420 KB',
          description: 'Discover your core leadership values',
          descriptionNL: 'Ontdek je kernleiderschapswaarden',
        },
        {
          name: 'Personal Development Plan Template',
          nameNL: 'Persoonlijk Ontwikkelplan Template',
          type: 'DOCX',
          size: '380 KB',
          description: 'Create your leadership development roadmap',
          descriptionNL: 'Creëer je leiderschapsontwikkel roadmap',
        },
      ],
    },
    {
      id: 'lead-l5',
      title: 'Quiz: Leadership Basics',
      titleNL: 'Quiz: Leiderschap Basis',
      type: 'quiz',
      duration: '10:00',
      quiz: [
        {
          id: 'lead-q1',
          question: 'What is the key difference between a manager and a leader?',
          questionNL: 'Wat is het belangrijkste verschil tussen een manager en een leider?',
          options: [
            'Managers have more authority',
            'Managers do things right, leaders do the right things',
            'Leaders are always more senior',
            'Managers focus on people, leaders on tasks'
          ],
          optionsNL: [
            'Managers hebben meer autoriteit',
            'Managers doen dingen goed, leiders doen de goede dingen',
            'Leiders zijn altijd meer senior',
            'Managers focussen op mensen, leiders op taken'
          ],
          correctAnswer: 1,
          explanation: 'The key distinction is that managers focus on efficiency (doing things right) while leaders focus on effectiveness (doing the right things). Both roles are essential.',
          explanationNL: 'Het belangrijkste onderscheid is dat managers focussen op efficiëntie (dingen goed doen) terwijl leiders focussen op effectiviteit (de goede dingen doen). Beide rollen zijn essentieel.',
        },
        {
          id: 'lead-q2',
          question: 'Which leadership style is most effective overall according to Goleman?',
          questionNL: 'Welke leiderschapsstijl is volgens Goleman het meest effectief overall?',
          options: [
            'Coercive (Commanding)',
            'Authoritative (Visionary)',
            'Democratic (Participative)',
            'Pacesetting'
          ],
          optionsNL: [
            'Dwingend (Commanding)',
            'Autoritatief (Visionair)',
            'Democratisch (Participatief)',
            'Pacesetting'
          ],
          correctAnswer: 1,
          explanation: 'The Authoritative (Visionary) style is most effective overall because it provides clear direction while giving autonomy on execution, inspiring commitment to the vision.',
          explanationNL: 'De Autoritatieve (Visionaire) stijl is het meest effectief overall omdat het duidelijke richting biedt terwijl het autonomie geeft over uitvoering, en commitment aan de visie inspireert.',
        },
        {
          id: 'lead-q3',
          question: 'Which situation is BEST for using the Coercive leadership style?',
          questionNL: 'Welke situatie is het BESTE voor het gebruiken van de Dwingende leiderschapsstijl?',
          options: [
            'Building team morale',
            'Crisis situations requiring immediate action',
            'Strategic planning sessions',
            'Developing team members'
          ],
          optionsNL: [
            'Teammoraal opbouwen',
            'Crisissituaties die onmiddellijke actie vereisen',
            'Strategische planning sessies',
            'Teamleden ontwikkelen'
          ],
          correctAnswer: 1,
          explanation: 'The Coercive style should only be used in crisis situations where immediate compliance is needed. It\'s effective short-term but damaging long-term.',
          explanationNL: 'De Dwingende stijl moet alleen gebruikt worden in crisissituaties waar onmiddellijke naleving nodig is. Het is effectief op korte termijn maar schadelijk op lange termijn.',
        },
        {
          id: 'lead-q4',
          question: 'What are the five components of Emotional Intelligence?',
          questionNL: 'Wat zijn de vijf componenten van Emotionele Intelligentie?',
          options: [
            'IQ, EQ, AQ, CQ, SQ',
            'Self-Awareness, Self-Regulation, Motivation, Empathy, Social Skills',
            'Planning, Organizing, Leading, Controlling, Evaluating',
            'Vision, Mission, Values, Strategy, Execution'
          ],
          optionsNL: [
            'IQ, EQ, AQ, CQ, SQ',
            'Zelfbewustzijn, Zelfregulatie, Motivatie, Empathie, Sociale Vaardigheden',
            'Plannen, Organiseren, Leiden, Controleren, Evalueren',
            'Visie, Missie, Waarden, Strategie, Uitvoering'
          ],
          correctAnswer: 1,
          explanation: 'Goleman\'s five components of EQ are: Self-Awareness, Self-Regulation, Motivation, Empathy, and Social Skills. All can be developed with practice.',
          explanationNL: 'Golemans vijf componenten van EQ zijn: Zelfbewustzijn, Zelfregulatie, Motivatie, Empathie en Sociale Vaardigheden. Allemaal kunnen worden ontwikkeld met oefening.',
        },
        {
          id: 'lead-q5',
          question: 'Which EQ component is the foundation for all others?',
          questionNL: 'Welke EQ component is het fundament voor alle anderen?',
          options: [
            'Empathy',
            'Social Skills',
            'Self-Awareness',
            'Motivation'
          ],
          optionsNL: [
            'Empathie',
            'Sociale Vaardigheden',
            'Zelfbewustzijn',
            'Motivatie'
          ],
          correctAnswer: 2,
          explanation: 'Self-Awareness is the foundation. You can\'t regulate emotions you don\'t recognize, empathize with others if you don\'t understand yourself, or build genuine relationships without self-knowledge.',
          explanationNL: 'Zelfbewustzijn is het fundament. Je kunt emoties niet reguleren die je niet herkent, empathie tonen met anderen als je jezelf niet begrijpt, of oprechte relaties opbouwen zonder zelfkennis.',
        },
        {
          id: 'lead-q6',
          question: 'In the Johari Window, the "Blind Spot" quadrant represents:',
          questionNL: 'In het Johari Window vertegenwoordigt het "Blinde Vlek" kwadrant:',
          options: [
            'What you know about yourself but hide from others',
            'What others see in you but you don\'t recognize',
            'What everyone knows about you',
            'Hidden potential unknown to everyone'
          ],
          optionsNL: [
            'Wat je over jezelf weet maar voor anderen verbergt',
            'Wat anderen in je zien maar je zelf niet herkent',
            'Wat iedereen over je weet',
            'Verborgen potentieel onbekend voor iedereen'
          ],
          correctAnswer: 1,
          explanation: 'The Blind Spot is what others see in you but you don\'t recognize in yourself. Feedback is essential to reduce this blind spot and increase self-awareness.',
          explanationNL: 'De Blinde Vlek is wat anderen in je zien maar je zelf niet herkent. Feedback is essentieel om deze blinde vlek te verkleinen en zelfbewustzijn te vergroten.',
        },
        {
          id: 'lead-q7',
          question: 'Which daily practice MOST directly increases self-awareness?',
          questionNL: 'Welke dagelijkse praktijk verhoogt zelfbewustzijn het MEEST direct?',
          options: [
            'Checking email',
            'Evening reflection on the day',
            'Exercise',
            'Reading news'
          ],
          optionsNL: [
            'Email checken',
            'Avond reflectie op de dag',
            'Sporten',
            'Nieuws lezen'
          ],
          correctAnswer: 1,
          explanation: 'Evening reflection directly builds self-awareness by reviewing your actions, emotions, and patterns. Ask: What went well? What could be better? What did I learn about myself?',
          explanationNL: 'Avond reflectie bouwt direct zelfbewustzijn op door je acties, emoties en patronen te reviewen. Vraag: Wat ging goed? Wat had beter gekund? Wat heb ik over mezelf geleerd?',
        },
        {
          id: 'lead-q8',
          question: 'A project manager leading without formal authority should primarily rely on which leadership style?',
          questionNL: 'Een projectmanager die leidt zonder formele autoriteit moet voornamelijk vertrouwen op welke leiderschapsstijl?',
          options: [
            'Coercive - command and demand',
            'Authoritative - vision and influence',
            'Pacesetting - lead by example',
            'Affiliative - focus on harmony'
          ],
          optionsNL: [
            'Dwingend - commanderen en eisen',
            'Autoritatief - visie en invloed',
            'Pacesetting - leiden door voorbeeld',
            'Affiliatief - focus op harmonie'
          ],
          correctAnswer: 1,
          explanation: 'Without formal authority, PMs must rely on influence rather than command. The Authoritative style (providing vision and inspiring commitment) is most effective for leading without authority.',
          explanationNL: 'Zonder formele autoriteit moeten PMs vertrouwen op invloed in plaats van commando. De Autoritatieve stijl (visie bieden en commitment inspireren) is het meest effectief voor leiden zonder autoriteit.',
        },
        {
          id: 'lead-q9',
          question: 'What is the primary benefit of understanding your core leadership values?',
          questionNL: 'Wat is het primaire voordeel van het begrijpen van je kernleiderschapswaarden?',
          options: [
            'It helps you get promoted faster',
            'It guides your decisions and defines your leadership brand',
            'It makes you more popular with your team',
            'It guarantees project success'
          ],
          optionsNL: [
            'Het helpt je sneller gepromoveerd te worden',
            'Het leidt je beslissingen en definieert je leiderschapsmerk',
            'Het maakt je populairder bij je team',
            'Het garandeert projectsucces'
          ],
          correctAnswer: 1,
          explanation: 'Your core values serve as a compass for decision-making and define your unique leadership brand. They help you stay authentic and make choices aligned with what matters most to you.',
          explanationNL: 'Je kernwaarden dienen als kompas voor besluitvorming en definiëren je unieke leiderschapsmerk. Ze helpen je authentiek te blijven en keuzes te maken die aansluiten bij wat het meest belangrijk voor je is.',
        },
        {
          id: 'lead-q10',
          question: 'Which statement about Emotional Intelligence is TRUE?',
          questionNL: 'Welke stelling over Emotionele Intelligentie is WAAR?',
          options: [
            'EQ is fixed at birth and cannot be changed',
            'EQ can be developed and improved with practice',
            'EQ is only important for senior leaders',
            'High IQ guarantees high EQ'
          ],
          optionsNL: [
            'EQ is vast bij geboorte en kan niet veranderen',
            'EQ kan worden ontwikkeld en verbeterd met oefening',
            'EQ is alleen belangrijk voor senior leiders',
            'Hoge IQ garandeert hoge EQ'
          ],
          correctAnswer: 1,
          explanation: 'Unlike IQ which is relatively stable, EQ can be learned and developed throughout your life. With intentional practice and feedback, anyone can improve their emotional intelligence.',
          explanationNL: 'Anders dan IQ dat relatief stabiel is, kan EQ worden geleerd en ontwikkeld gedurende je leven. Met bewuste oefening en feedback kan iedereen hun emotionele intelligentie verbeteren.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 2: TEAM DYNAMICS
// ============================================
const module2: Module = {
  id: 'lead-m2',
  title: 'Team Dynamics',
  titleNL: 'Teamdynamiek',
  description: 'Building high-performance teams and managing conflict.',
  descriptionNL: 'High-performance teams bouwen en conflict managen.',
  order: 1,
  icon: 'Users',
  color: '#EA580C',
  gradient: 'linear-gradient(135deg, #EA580C 0%, #C2410C 100%)',
  lessons: [
    {
      id: 'lead-l6',
      title: 'Building High-Performance Teams',
      titleNL: 'High-Performance Teams Bouwen',
      type: 'video',
      duration: '15:00',
      videoUrl: '',
      transcript: `What makes a team truly high-performing? In this lesson, we'll explore the characteristics of great teams and how to build them.

**The Definition**

A high-performance team consistently delivers exceptional results while maintaining high morale and continuous improvement.

Key word: CONSISTENTLY. Anyone can have a good sprint. High-performance teams sustain excellence.

**The Five Dysfunctions (Patrick Lencioni)**

Lencioni identified five dysfunctions that prevent teams from being great. Address these to build high performance:

**1. Absence of Trust**

The Problem:
- Team members don't feel safe being vulnerable
- They hide mistakes and weaknesses
- They don't ask for help

The Solution:
- Build vulnerability-based trust
- Share failures and learnings
- Admit mistakes openly
- Ask for help regularly

**2. Fear of Conflict**

The Problem:
- Artificial harmony
- Important issues aren't discussed
- Resentment builds under the surface

The Solution:
- Make conflict safe
- Encourage productive disagreement
- Focus on ideas, not people
- Resolve issues quickly

**3. Lack of Commitment**

The Problem:
- Unclear decisions
- Team members don't buy in
- Second-guessing after meetings

The Solution:
- Ensure clarity on decisions
- Disagree and commit
- Document decisions
- Hold people accountable to commitments

**4. Avoidance of Accountability**

The Problem:
- Low standards tolerated
- No peer pressure for performance
- Leader is the only one holding people accountable

The Solution:
- Make expectations clear
- Peers hold each other accountable
- Regular progress reviews
- Celebrate success and address failures

**5. Inattention to Results**

The Problem:
- Individual goals prioritized over team goals
- Ego and status more important than outcomes
- Lack of focus on collective success

The Solution:
- Define clear team goals
- Make results public
- Reward team success
- Celebrate collective wins

**Building Trust**

Trust is the foundation. Here's how to build it:

**Personal Histories Exercise**
Simple but powerful. Each person shares:
- Where they grew up
- Number of siblings
- Childhood hobbies/interests
- First job
- Biggest challenge growing up

Takes 30 minutes. Humanizes team members.

**Team Effectiveness Exercise**
Each person shares:
- Single most important contribution to team
- One area where they need to improve

Creates productive vulnerability.

**Regular 1-on-1s**
- Weekly with each team member
- Listen more than talk
- Understand what motivates them
- Build personal connection

**The Characteristics of High-Performance Teams**

Research shows these common traits:

**1. Psychological Safety**
- People feel safe to take risks
- No fear of embarrassment or rejection
- Everyone's voice is heard

**2. Clear Goals**
- Everyone knows what success looks like
- Goals are challenging but achievable
- Regular progress check-ins

**3. Defined Roles**
- Clear responsibilities
- No confusion about who does what
- Roles play to people's strengths

**4. Effective Communication**
- Information flows freely
- Regular and structured
- Appropriate channels
- Active listening

**5. Constructive Conflict**
- Disagree productively
- Focus on issues, not personalities
- Resolve quickly
- Stronger after disagreement

**6. Mutual Accountability**
- Hold each other to high standards
- Peer pressure for performance
- Not just top-down
- Celebrate wins together

**7. Results Focus**
- Collective success matters most
- Individual egos set aside
- Clear metrics
- Regular reviews

**The Team Charter**

Create a team charter together:

**Purpose**
- Why does this team exist?
- What value do we create?

**Goals**
- What are we trying to achieve?
- How will we measure success?

**Values**
- What principles guide us?
- What behaviors do we expect?

**Ways of Working**
- How do we make decisions?
- How do we handle conflict?
- How do we communicate?
- What are our norms?

**Roles and Responsibilities**
- Who does what?
- How do we hold each other accountable?

Get everyone's input. Get everyone's commitment.

**Maintaining High Performance**

Building is one thing. Sustaining is another.

**Regular Check-ins:**
- Weekly team meetings
- Sprint retrospectives
- Quarterly team health checks
- Annual offsites

**Continuous Improvement:**
- What's working?
- What's not?
- What should we try?
- Small experiments

**Celebrate Success:**
- Acknowledge wins (small and large)
- Make progress visible
- Reward team (not just individuals)
- Have fun together

**Address Issues Quickly:**
- Don't let problems fester
- Have difficult conversations
- Make changes when needed
- Learn and move forward

**Summary**

High-performance teams:
- Have trust as their foundation
- Engage in healthy conflict
- Commit to decisions
- Hold each other accountable
- Focus on collective results

Build this deliberately. Maintain it continuously.`,
      transcriptNL: `Wat maakt een team echt high-performing? In deze les verkennen we de kenmerken van geweldige teams en hoe je ze bouwt.

**De Definitie**

Een high-performance team levert consistent uitzonderlijke resultaten terwijl hoge moraal en continue verbetering behouden blijven.

Sleutelwoord: CONSISTENT. Iedereen kan een goede sprint hebben. High-performance teams houden excellentie vol.

**De Vijf Disfuncties (Patrick Lencioni)**

Lencioni identificeerde vijf disfuncties die teams ervan weerhouden geweldig te zijn. Pak deze aan om high performance te bouwen:

**1. Afwezigheid van Vertrouwen**

Het Probleem:
- Teamleden voelen zich niet veilig om kwetsbaar te zijn
- Ze verbergen fouten en zwakheden
- Ze vragen niet om hulp

De Oplossing:
- Bouw kwetsbaarheid-gebaseerd vertrouwen
- Deel fouten en lessen
- Geef fouten openlijk toe
- Vraag regelmatig om hulp

**2. Angst voor Conflict**

Het Probleem:
- Kunstmatige harmonie
- Belangrijke issues worden niet besproken
- Wrok bouwt op onder de oppervlakte

De Oplossing:
- Maak conflict veilig
- Moedig productieve meningsverschillen aan
- Focus op ideeën, niet op mensen
- Los issues snel op

**3. Gebrek aan Commitment**

Het Probleem:
- Onduidelijke beslissingen
- Teamleden kopen niet in
- Twijfel na vergaderingen

De Oplossing:
- Zorg voor helderheid over beslissingen
- Disagree and commit
- Documenteer beslissingen
- Houd mensen verantwoordelijk voor commitments

**4. Vermijden van Accountability**

Het Probleem:
- Lage standaarden worden getolereerd
- Geen peer pressure voor prestatie
- Leider is de enige die mensen verantwoordelijk houdt

De Oplossing:
- Maak verwachtingen duidelijk
- Peers houden elkaar verantwoordelijk
- Regelmatige voortgangsreviews
- Vier successen en pak fouten aan

**5. Gebrek aan Aandacht voor Resultaten**

Het Probleem:
- Individuele doelen prioriteit boven teamdoelen
- Ego en status belangrijker dan uitkomsten
- Gebrek aan focus op collectief succes

De Oplossing:
- Definieer duidelijke teamdoelen
- Maak resultaten publiek
- Beloon teamsucces
- Vier collectieve overwinningen

**Vertrouwen Bouwen**

Vertrouwen is het fundament. Zo bouw je het:

**Personal Histories Exercise**
Simpel maar krachtig. Elke persoon deelt:
- Waar ze opgroeiden
- Aantal broers/zussen
- Jeugdhobbies/interesses
- Eerste baan
- Grootste uitdaging tijdens opgroeien

Duurt 30 minuten. Humaniseert teamleden.

**Team Effectiveness Exercise**
Elke persoon deelt:
- Belangrijkste bijdrage aan team
- Eén gebied waar ze moeten verbeteren

Creëert productieve kwetsbaarheid.

**Regelmatige 1-op-1s**
- Wekelijks met elk teamlid
- Luister meer dan praten
- Begrijp wat hen motiveert
- Bouw persoonlijke connectie

**De Kenmerken van High-Performance Teams**

Onderzoek toont deze gemeenschappelijke eigenschappen:

**1. Psychologische Veiligheid**
- Mensen voelen zich veilig om risico's te nemen
- Geen angst voor verlegenheid of afwijzing
- Ieders stem wordt gehoord

**2. Duidelijke Doelen**
- Iedereen weet hoe succes eruitziet
- Doelen zijn uitdagend maar haalbaar
- Regelmatige voortgangs check-ins

**3. Gedefinieerde Rollen**
- Duidelijke verantwoordelijkheden
- Geen verwarring over wie wat doet
- Rollen spelen in op sterke punten van mensen

**4. Effectieve Communicatie**
- Informatie stroomt vrij
- Regelmatig en gestructureerd
- Passende kanalen
- Actief luisteren

**5. Constructief Conflict**
- Productief oneens zijn
- Focus op issues, niet op persoonlijkheden
- Snel oplossen
- Sterker na meningsverschil

**6. Wederzijdse Accountability**
- Houden elkaar aan hoge standaarden
- Peer pressure voor prestatie
- Niet alleen top-down
- Vier overwinningen samen

**7. Resultaten Focus**
- Collectief succes is het belangrijkste
- Individuele ego's opzij
- Duidelijke metrics
- Regelmatige reviews

**Het Team Charter**

Creëer samen een team charter:

**Doel**
- Waarom bestaat dit team?
- Welke waarde creëren we?

**Doelen**
- Wat proberen we te bereiken?
- Hoe meten we succes?

**Waarden**
- Welke principes leiden ons?
- Welk gedrag verwachten we?

**Werkwijzen**
- Hoe nemen we beslissingen?
- Hoe gaan we om met conflict?
- Hoe communiceren we?
- Wat zijn onze normen?

**Rollen en Verantwoordelijkheden**
- Wie doet wat?
- Hoe houden we elkaar verantwoordelijk?

Vraag ieders input. Krijg ieders commitment.

**High Performance Behouden**

Bouwen is één ding. Volhouden is iets anders.

**Regelmatige Check-ins:**
- Wekelijkse teamvergaderingen
- Sprint retrospectives
- Kwartaal team health checks
- Jaarlijkse offsites

**Continue Verbetering:**
- Wat werkt?
- Wat niet?
- Wat moeten we proberen?
- Kleine experimenten

**Vier Succes:**
- Erken overwinningen (klein en groot)
- Maak voortgang zichtbaar
- Beloon team (niet alleen individuen)
- Heb samen plezier

**Pak Issues Snel Aan:**
- Laat problemen niet etteren
- Voer moeilijke gesprekken
- Maak veranderingen wanneer nodig
- Leer en ga verder

**Samenvatting**

High-performance teams:
- Hebben vertrouwen als hun fundament
- Gaan aan in gezond conflict
- Committeren aan beslissingen
- Houden elkaar verantwoordelijk
- Focussen op collectieve resultaten

Bouw dit bewust. Onderhoud het continu.`,
      keyTakeaways: [
        'Five dysfunctions: Absence of Trust, Fear of Conflict, Lack of Commitment, Avoidance of Accountability, Inattention to Results',
        'Trust is the foundation - build it through vulnerability and personal connection',
        'High-performance teams have psychological safety, clear goals, and mutual accountability',
        'Create a team charter together to align on purpose, values, and ways of working',
      ],
      keyTakeawaysNL: [
        'Vijf disfuncties: Afwezigheid van Vertrouwen, Angst voor Conflict, Gebrek aan Commitment, Vermijden van Accountability, Gebrek aan Aandacht voor Resultaten',
        'Vertrouwen is het fundament - bouw het door kwetsbaarheid en persoonlijke connectie',
        'High-performance teams hebben psychologische veiligheid, duidelijke doelen en wederzijdse accountability',
        'Creëer samen een team charter om af te stemmen op doel, waarden en werkwijzen',
      ],
      resources: [
        {
          name: 'Five Dysfunctions Pyramid',
          nameNL: 'Vijf Disfuncties Piramide',
          type: 'PDF',
          size: '780 KB',
          description: 'Lencioni\'s model for team dysfunction',
          descriptionNL: 'Lencioni\'s model voor teamdisfunctie',
        },
        {
          name: 'Team Charter Template',
          nameNL: 'Team Charter Template',
          type: 'DOCX',
          size: '320 KB',
          description: 'Create your team\'s working agreement',
          descriptionNL: 'Creëer je team\'s werkafspraak',
        },
      ],
    },
    {
      id: 'lead-l7',
      title: 'Tuckman\'s Team Stages',
      titleNL: 'Tuckmans Teamfasen',
      type: 'video',
      duration: '12:00',
      videoUrl: '',
      transcript: `Teams don't become high-performing overnight. They go through predictable stages of development. Understanding these stages helps you lead more effectively.

**Tuckman's Model**

Bruce Tuckman identified four (later five) stages that teams go through:

**1. Forming**
**2. Storming**
**3. Norming**
**4. Performing**
**5. Adjourning** (added later)

Let's explore each stage and what you need to do as a leader.

**Stage 1: Forming**

**What's Happening:**
- Team members meet for the first time
- Everyone is polite and positive
- People are unsure of their role
- Testing boundaries
- Dependence on leader for direction

**Behaviors You'll See:**
- Formal and cautious
- Asking many questions
- Seeking clarification
- Avoiding conflict
- Focusing on tasks, not relationships

**What the Team Needs:**
- Clear purpose and goals
- Defined roles and responsibilities
- Structure and process
- Safe environment
- Direction from leader

**Your Role as Leader:**
- Be directive
- Provide clear expectations
- Answer questions patiently
- Facilitate introductions
- Build initial trust

**Duration:** Days to weeks

**Stage 2: Storming**

**What's Happening:**
- Reality sets in
- Differences emerge
- Conflicts arise
- Frustration with progress
- Challenging authority
- Competing for influence

**Behaviors You'll See:**
- Disagreements
- Frustration
- Questioning decisions
- Forming cliques
- Resisting tasks
- Tensions rising

**What the Team Needs:**
- Safe space for conflict
- Active listening
- Conflict resolution support
- Reassurance that this is normal
- Continued structure

**Your Role as Leader:**
- Don't avoid conflict
- Facilitate difficult conversations
- Stay calm and objective
- Reinforce team goals
- Coach individuals
- Maintain structure while allowing debate

**Duration:** Weeks to months (some teams get stuck here!)

**Critical Point:** Many teams fail because they avoid this stage. The storm must be weathered, not avoided.

**Stage 3: Norming**

**What's Happening:**
- Conflicts are resolving
- Norms are establishing
- Roles are clarifying
- Trust is building
- Consensus emerging

**Behaviors You'll See:**
- Increased collaboration
- Sharing of ideas
- Respect for differences
- Constructive feedback
- Social bonding
- Team identity forming

**What the Team Needs:**
- Reinforcement of positive behaviors
- Continued structure
- Recognition of progress
- Space to self-organize
- Less directive leadership

**Your Role as Leader:**
- Step back slightly
- Facilitate rather than direct
- Reinforce team norms
- Celebrate wins
- Encourage collaboration
- Balance support with autonomy

**Duration:** Weeks to months

**Stage 4: Performing**

**What's Happening:**
- Team is fully functional
- High performance
- Self-managing
- Focused on goals
- Handling conflicts productively

**Behaviors You'll See:**
- High energy
- Strong collaboration
- Proactive problem-solving
- Efficient work
- Supporting each other
- Achieving goals

**What the Team Needs:**
- Autonomy
- Challenges
- Recognition
- Continued growth
- Resources

**Your Role as Leader:**
- Facilitate and enable
- Remove obstacles
- Provide resources
- Celebrate successes
- Challenge the team
- Mostly stay out of the way!

**Duration:** Can be sustained for years

**Stage 5: Adjourning**

**What's Happening:**
- Project is ending
- Team is disbanding
- Mixed emotions
- Reflection on achievements
- Anxiety about future

**Behaviors You'll See:**
- Nostalgia
- Disengagement from tasks
- Reflection
- Sadness or relief
- Looking ahead

**What the Team Needs:**
- Recognition of achievements
- Time to reflect and celebrate
- Proper closure
- Transition support

**Your Role as Leader:**
- Facilitate reflection
- Recognize contributions
- Celebrate achievements
- Help with transition
- Conduct lessons learned
- Provide closure

**Important Insights**

**Teams Can Regress**

Teams don't progress linearly. They can slip back:
- New member joins → back to Forming/Storming
- Major change → back to Storming
- Leader changes → back to Forming
- Conflict unresolved → stuck in Storming

**Not All Teams Perform**

Some teams never reach Performing:
- Stuck in Storming (unresolved conflict)
- Weak leadership through transitions
- Lack of trust building
- Unclear goals
- No investment in team development

**Speed Varies**

Factors affecting speed:
- Team size (smaller is faster)
- Previous relationships
- Complexity of work
- Leadership quality
- Organizational support

**Accelerating Development**

To move faster:

**In Forming:**
- Invest time upfront
- Clear charter and goals
- Ice breakers and team building
- Set norms early

**In Storming:**
- Address conflict quickly
- Make conflict safe
- Focus on issues, not people
- Keep reinforcing goals

**In Norming:**
- Recognize positive behaviors
- Build on successes
- Continue team building
- Give increasing autonomy

**Virtual Teams**

Same stages, different challenges:
- Forming takes longer
- Storming harder to detect
- Norming requires more effort
- Performing is possible but needs structure

Invest more in relationship building.

**Summary**

Teams progress through:
1. **Forming**: Polite and uncertain
2. **Storming**: Conflict and resistance
3. **Norming**: Cohesion and norms
4. **Performing**: High performance
5. **Adjourning**: Closure

Your leadership style should evolve:
- Forming: Direct
- Storming: Coach
- Norming: Support
- Performing: Delegate

Recognize the stage. Lead accordingly.`,
      transcriptNL: `Teams worden niet in één nacht high-performing. Ze doorlopen voorspelbare ontwikkelingsfasen. Het begrijpen van deze fasen helpt je effectiever te leiden.

**Tuckmans Model**

Bruce Tuckman identificeerde vier (later vijf) fasen die teams doorlopen:

**1. Forming (Vorming)**
**2. Storming (Storm)**
**3. Norming (Normering)**
**4. Performing (Presteren)**
**5. Adjourning (Afsluiting)** (later toegevoegd)

Laten we elke fase verkennen en wat je moet doen als leider.

**Fase 1: Forming**

**Wat Er Gebeurt:**
- Teamleden ontmoeten elkaar voor het eerst
- Iedereen is beleefd en positief
- Mensen zijn onzeker over hun rol
- Testen van grenzen
- Afhankelijkheid van leider voor richting

**Gedrag Dat Je Ziet:**
- Formeel en voorzichtig
- Veel vragen stellen
- Verduidelijking zoeken
- Conflict vermijden
- Focus op taken, niet op relaties

**Wat Het Team Nodig Heeft:**
- Duidelijk doel en doelen
- Gedefinieerde rollen en verantwoordelijkheden
- Structuur en proces
- Veilige omgeving
- Richting van leider

**Jouw Rol als Leider:**
- Wees directief
- Geef duidelijke verwachtingen
- Beantwoord vragen geduldig
- Faciliteer introducties
- Bouw initieel vertrouwen

**Duur:** Dagen tot weken

**Fase 2: Storming**

**Wat Er Gebeurt:**
- Realiteit zinkt in
- Verschillen komen naar voren
- Conflicten ontstaan
- Frustratie over voortgang
- Uitdagen van autoriteit
- Concurreren voor invloed

**Gedrag Dat Je Ziet:**
- Meningsverschillen
- Frustratie
- Vragen bij beslissingen
- Kliekjes vormen
- Weerstand tegen taken
- Stijgende spanningen

**Wat Het Team Nodig Heeft:**
- Veilige ruimte voor conflict
- Actief luisteren
- Conflictoplossing ondersteuning
- Geruststelling dat dit normaal is
- Voortgezette structuur

**Jouw Rol als Leider:**
- Vermijd conflict niet
- Faciliteer moeilijke gesprekken
- Blijf kalm en objectief
- Versterk teamdoelen
- Coach individuen
- Behoud structuur terwijl je debat toestaat

**Duur:** Weken tot maanden (sommige teams blijven hier steken!)

**Kritiek Punt:** Veel teams falen omdat ze deze fase vermijden. De storm moet worden doorstaan, niet vermeden.

**Fase 3: Norming**

**Wat Er Gebeurt:**
- Conflicten worden opgelost
- Normen worden gevestigd
- Rollen worden verduidelijkt
- Vertrouwen wordt opgebouwd
- Consensus komt naar voren

**Gedrag Dat Je Ziet:**
- Toegenomen samenwerking
- Delen van ideeën
- Respect voor verschillen
- Constructieve feedback
- Sociale binding
- Team identiteit vorming

**Wat Het Team Nodig Heeft:**
- Versterking van positief gedrag
- Voortgezette structuur
- Erkenning van voortgang
- Ruimte om zelf te organiseren
- Minder directief leiderschap

**Jouw Rol als Leider:**
- Stap iets terug
- Faciliteer in plaats van direct
- Versterk teamnormen
- Vier overwinningen
- Moedig samenwerking aan
- Balanceer steun met autonomie

**Duur:** Weken tot maanden

**Fase 4: Performing**

**Wat Er Gebeurt:**
- Team is volledig functioneel
- Hoge prestatie
- Zelfmanagend
- Gefocust op doelen
- Gaat productief om met conflicten

**Gedrag Dat Je Ziet:**
- Hoge energie
- Sterke samenwerking
- Proactief probleem oplossen
- Efficiënt werk
- Elkaar ondersteunen
- Doelen bereiken

**Wat Het Team Nodig Heeft:**
- Autonomie
- Uitdagingen
- Erkenning
- Voortgezette groei
- Resources

**Jouw Rol als Leider:**
- Faciliteer en enable
- Verwijder obstakels
- Geef resources
- Vier successen
- Daag het team uit
- Blijf voornamelijk uit de weg!

**Duur:** Kan jaren worden volgehouden

**Fase 5: Adjourning**

**Wat Er Gebeurt:**
- Project eindigt
- Team wordt ontbonden
- Gemengde emoties
- Reflectie op prestaties
- Angst over toekomst

**Gedrag Dat Je Ziet:**
- Nostalgie
- Loskoppelen van taken
- Reflectie
- Verdriet of opluchting
- Vooruitkijken

**Wat Het Team Nodig Heeft:**
- Erkenning van prestaties
- Tijd om te reflecteren en vieren
- Goede afsluiting
- Transitie ondersteuning

**Jouw Rol als Leider:**
- Faciliteer reflectie
- Erken bijdragen
- Vier prestaties
- Help met transitie
- Voer lessons learned uit
- Geef afsluiting

**Belangrijke Inzichten**

**Teams Kunnen Regresseren**

Teams gaan niet lineair vooruit. Ze kunnen terug vallen:
- Nieuw lid komt erbij → terug naar Forming/Storming
- Grote verandering → terug naar Storming
- Leider verandert → terug naar Forming
- Conflict onopgelost → vast in Storming

**Niet Alle Teams Presteren**

Sommige teams bereiken nooit Performing:
- Vast in Storming (onopgelost conflict)
- Zwak leiderschap tijdens transities
- Gebrek aan vertrouwen opbouwen
- Onduidelijke doelen
- Geen investering in teamontwikkeling

**Snelheid Varieert**

Factoren die snelheid beïnvloeden:
- Teamgrootte (kleiner is sneller)
- Vorige relaties
- Complexiteit van werk
- Leiderschapskwaliteit
- Organisatie ondersteuning

**Ontwikkeling Versnellen**

Om sneller te gaan:

**In Forming:**
- Investeer tijd vooraf
- Duidelijk charter en doelen
- Ice breakers en teambuilding
- Stel vroeg normen in

**In Storming:**
- Pak conflict snel aan
- Maak conflict veilig
- Focus op issues, niet op mensen
- Blijf doelen versterken

**In Norming:**
- Herken positief gedrag
- Bouw voort op successen
- Ga door met teambuilding
- Geef toenemende autonomie

**Virtuele Teams**

Zelfde fasen, andere uitdagingen:
- Forming duurt langer
- Storming moeilijker te detecteren
- Norming vereist meer inspanning
- Performing is mogelijk maar heeft structuur nodig

Investeer meer in relatie opbouwen.

**Samenvatting**

Teams gaan door:
1. **Forming**: Beleefd en onzeker
2. **Storming**: Conflict en weerstand
3. **Norming**: Cohesie en normen
4. **Performing**: Hoge prestatie
5. **Adjourning**: Afsluiting

Je leiderschapsstijl moet evolueren:
- Forming: Direct
- Storming: Coach
- Norming: Ondersteun
- Performing: Delegeer

Herken de fase. Leid dienovereenkomstig.`,
      keyTakeaways: [
        'Teams go through five stages: Forming, Storming, Norming, Performing, Adjourning',
        'Storming is necessary - avoiding it prevents teams from reaching high performance',
        'Your leadership style must adapt: directive → coaching → supporting → delegating',
        'Teams can regress to earlier stages with changes like new members or leadership',
      ],
      keyTakeawaysNL: [
        'Teams doorlopen vijf fasen: Forming, Storming, Norming, Performing, Adjourning',
        'Storming is noodzakelijk - het vermijden voorkomt dat teams high performance bereiken',
        'Je leiderschapsstijl moet aanpassen: directief → coaching → ondersteunend → delegerend',
        'Teams kunnen terug vallen naar eerdere fasen bij veranderingen zoals nieuwe leden of leiderschap',
      ],
      resources: [
        {
          name: 'Tuckman\'s Stages Infographic',
          nameNL: 'Tuckman\'s Fasen Infographic',
          type: 'PDF',
          size: '950 KB',
          description: 'Visual guide to team development stages',
          descriptionNL: 'Visuele gids voor teamontwikkelingsfasen',
        },
      ],
    },
    // Continue with remaining lessons...
    {
      id: 'lead-l8',
      title: 'Conflict Resolution',
      titleNL: 'Conflictoplossing',
      type: 'video',
      duration: '14:00',
      videoUrl: '',
      transcript: `Conflict is inevitable in projects. The question isn't whether you'll have conflict, but how you'll handle it. In this lesson, we'll explore effective conflict resolution strategies.

**Understanding Conflict**

Conflict isn't inherently bad. Healthy conflict:
- Surfaces different perspectives
- Leads to better solutions
- Builds trust when handled well
- Strengthens relationships

Unhealthy conflict:
- Becomes personal
- Damages relationships
- Reduces productivity
- Creates toxic environment

**The Thomas-Kilmann Conflict Model**

Five conflict handling styles based on two dimensions:
- Assertiveness (pursuing your concerns)
- Cooperativeness (satisfying others' concerns)

**1. Competing (High Assertive, Low Cooperative)**
"Win-Lose" - I win, you lose

When to use:
- Emergency situations
- Unpopular decisions needed
- When you're certain you're right
- When others take advantage

Risks:
- Damages relationships
- Breeds resentment
- Reduces collaboration

**2. Accommodating (Low Assertive, High Cooperative)**
"Lose-Win" - You win, I lose

When to use:
- Issue matters more to them than you
- Preserving relationship is priority
- You realize you're wrong
- Building goodwill for future

Risks:
- Your needs not met
- Can be seen as weak
- May breed resentment in you

**3. Avoiding (Low Assertive, Low Cooperative)**
"Lose-Lose" - Nobody wins

When to use:
- Issue is trivial
- No chance of winning
- Need time to cool down
- Others can resolve better

Risks:
- Issues don't get resolved
- Problems escalate
- Seen as withdrawing

**4. Compromising (Medium Assertive, Medium Cooperative)**
"Half-Half" - Both partially satisfied

When to use:
- Both goals moderately important
- Time pressure
- Temporary solution needed
- Deadlock on major issues

Risks:
- Nobody fully satisfied
- May not be optimal solution
- Can become pattern

**5. Collaborating (High Assertive, High Cooperative)**
"Win-Win" - Both needs met

When to use:
- Issue important to both
- Time available
- Relationship important
- Creative solution possible

Benefits:
- Best solution emerges
- Relationships strengthen
- Commitment high
- Learning occurs

This is the IDEAL for important conflicts.

**The Interest-Based Approach**

Move from positions to interests:

**Positions**: What people say they want
"I need this feature in the next Sprint"

**Interests**: Why they want it
"Our biggest customer is asking for it"

**The Process:**

**Step 1: Separate People from Problem**
- Attack the issue, not the person
- "We have different views on priorities" not "You're being unreasonable"
- Stay objective

**Step 2: Focus on Interests, Not Positions**
Ask: "Why is this important to you?"
Uncover the underlying need

**Step 3: Generate Options**
Brainstorm together
- No evaluation yet
- Build on ideas
- Think creatively

**Step 4: Use Objective Criteria**
What standards can we use?
- Industry best practices
- Past precedent
- Expert opinion
- Data

**Step 5: Develop Agreement**
Create solution that meets both interests

**The Conflict Resolution Conversation**

When you need to address conflict directly:

**Preparation:**
- What's my interest?
- What might be theirs?
- What's the real issue?
- What outcome do I want?

**Opening:**
"I'd like to discuss [issue]. I want to find a solution that works for both of us."

**Their Perspective:**
"Help me understand your view on this."
Listen actively - don't interrupt!

**Your Perspective:**
"Here's how I see it..." 
Use "I" statements, not "you" accusations

**Explore Interests:**
"What's most important to you about this?"
"What would success look like for you?"

**Problem Solve Together:**
"What if we..." 
"How about..."
"Could we..."

**Agreement:**
"So we've agreed to..."
Confirm understanding

**Common Conflict Scenarios**

**Scenario 1: Scope Disagreement**
PO wants more features, Team says no capacity

Bad Approach:
- Fight over who's right
- Pull rank
- Ignore the other party

Good Approach:
- Explore interests (customer value vs. sustainable pace)
- Generate options (MVP, phasing, trade-offs)
- Use data (velocity, capacity)
- Collaborate on solution

**Scenario 2: Team Member Conflict**
Two developers disagree on technical approach

Bad Approach:
- Let them fight it out
- Make the decision yourself
- Avoid the issue

Good Approach:
- Facilitate discussion
- Focus on interests (performance, maintainability, etc.)
- Evaluate against criteria
- Let team decide together

**Scenario 3: Stakeholder Conflict**
Two stakeholders want different things

Bad Approach:
- Pick a side
- Try to please both with compromise
- Escalate immediately

Good Approach:
- Bring them together
- Clarify priorities
- Find creative solutions
- Use product vision as guide

**Preventing Conflict**

Prevention is better than resolution:

**1. Clear Expectations**
- Roles and responsibilities
- Decision-making authority
- Communication norms

**2. Regular Communication**
- Don't let issues fester
- Create safe spaces for disagreement
- Address early

**3. Team Norms**
- How we disagree
- How we make decisions
- How we resolve conflicts

**4. Build Relationships**
- People fight less with friends
- Invest in team building
- Create trust

**When to Escalate**

Sometimes you can't resolve it alone:

Escalate when:
- Beyond your authority
- Safety or ethical issues
- Repeated patterns
- Significant impact
- Your attempts have failed

How to escalate:
- State the issue clearly
- What you've tried
- What you need
- Keep it factual

**Cultural Considerations**

Conflict styles vary by culture:
- Direct vs. indirect communication
- Individual vs. group harmony
- Time orientation
- Power distance

Be aware and adapt your approach.

**Summary**

Five conflict styles:
1. Competing: Win-lose
2. Accommodating: Lose-win
3. Avoiding: Lose-lose
4. Compromising: Half-half
5. Collaborating: Win-win

For important conflicts, collaborate:
- Separate people from problem
- Focus on interests
- Generate options together
- Use objective criteria

Address conflicts early and constructively.`,
      transcriptNL: `Conflict is onvermijdelijk in projecten. De vraag is niet of je conflict zult hebben, maar hoe je ermee omgaat. In deze les verkennen we effectieve conflictoplossingsstrategieën.

**Conflict Begrijpen**

Conflict is niet inherent slecht. Gezond conflict:
- Brengt verschillende perspectieven naar boven
- Leidt tot betere oplossingen
- Bouwt vertrouwen wanneer goed behandeld
- Versterkt relaties

Ongezond conflict:
- Wordt persoonlijk
- Beschadigt relaties
- Vermindert productiviteit
- Creëert toxische omgeving

**Het Thomas-Kilmann Conflict Model**

Vijf conflicthanteringstijlen gebaseerd op twee dimensies:
- Assertiviteit (nastreven van je zorgen)
- Cooperativiteit (tevreden stellen van andermans zorgen)

**1. Competing (Hoog Assertief, Laag Coöperatief)**
"Win-Verlies" - Ik win, jij verliest

Wanneer te gebruiken:
- Noodsituaties
- Impopulaire beslissingen nodig
- Wanneer je zeker bent dat je gelijk hebt
- Wanneer anderen misbruik maken

Risico's:
- Beschadigt relaties
- Kweekt wrok
- Vermindert samenwerking

**2. Accommodating (Laag Assertief, Hoog Coöperatief)**
"Verlies-Win" - Jij wint, ik verlies

Wanneer te gebruiken:
- Issue is belangrijker voor hen dan voor jou
- Relatie behouden is prioriteit
- Je realiseert dat je ongelijk hebt
- Goodwill opbouwen voor toekomst

Risico's:
- Je behoeften niet vervuld
- Kan als zwak worden gezien
- Kan wrok in jou kweken

**3. Avoiding (Laag Assertief, Laag Coöperatief)**
"Verlies-Verlies" - Niemand wint

Wanneer te gebruiken:
- Issue is triviaal
- Geen kans om te winnen
- Tijd nodig om af te koelen
- Anderen kunnen beter oplossen

Risico's:
- Issues worden niet opgelost
- Problemen escaleren
- Gezien als terugtrekken

**4. Compromising (Medium Assertief, Medium Coöperatief)**
"Half-Half" - Beide gedeeltelijk tevreden

Wanneer te gebruiken:
- Beide doelen gematigd belangrijk
- Tijdsdruk
- Tijdelijke oplossing nodig
- Impasse over grote issues

Risico's:
- Niemand volledig tevreden
- Mogelijk niet optimale oplossing
- Kan patroon worden

**5. Collaborating (Hoog Assertief, Hoog Coöperatief)**
"Win-Win" - Beide behoeften vervuld

Wanneer te gebruiken:
- Issue belangrijk voor beide
- Tijd beschikbaar
- Relatie belangrijk
- Creatieve oplossing mogelijk

Voordelen:
- Beste oplossing komt naar voren
- Relaties versterken
- Hoog commitment
- Leren vindt plaats

Dit is de IDEAAL voor belangrijke conflicten.

**De Interesse-Gebaseerde Aanpak**

Ga van posities naar interesses:

**Posities**: Wat mensen zeggen dat ze willen
"Ik heb deze feature nodig in de volgende Sprint"

**Interesses**: Waarom ze het willen
"Onze grootste klant vraagt erom"

**Het Proces:**

**Stap 1: Scheid Mensen van Probleem**
- Val het issue aan, niet de persoon
- "We hebben verschillende meningen over prioriteiten" niet "Je bent onredelijk"
- Blijf objectief

**Stap 2: Focus op Interesses, Niet Posities**
Vraag: "Waarom is dit belangrijk voor jou?"
Onthul de onderliggende behoefte

**Stap 3: Genereer Opties**
Brainstorm samen
- Nog geen evaluatie
- Bouw voort op ideeën
- Denk creatief

**Stap 4: Gebruik Objectieve Criteria**
Welke standaarden kunnen we gebruiken?
- Industrie best practices
- Eerdere precedenten
- Expert mening
- Data

**Stap 5: Ontwikkel Overeenkomst**
Creëer oplossing die beide interesses vervult

**Het Conflictoplossings Gesprek**

Wanneer je conflict direct moet aanpakken:

**Voorbereiding:**
- Wat is mijn interesse?
- Wat kan de hunne zijn?
- Wat is het echte issue?
- Welke uitkomst wil ik?

**Opening:**
"Ik wil graag [issue] bespreken. Ik wil een oplossing vinden die voor beide werkt."

**Hun Perspectief:**
"Help me je visie hierop te begrijpen."
Luister actief - onderbreek niet!

**Jouw Perspectief:**
"Zo zie ik het..." 
Gebruik "ik" statements, geen "jij" beschuldigingen

**Verken Interesses:**
"Wat is het belangrijkste voor jou hierover?"
"Hoe zou succes eruitzien voor jou?"

**Los Samen Probleem Op:**
"Wat als we..." 
"Hoe over..."
"Zouden we kunnen..."

**Overeenkomst:**
"Dus we zijn overeengekomen om..."
Bevestig begrip

**Veel Voorkomende Conflict Scenario's**

**Scenario 1: Scope Meningsverschil**
PO wil meer features, Team zegt geen capaciteit

Slechte Aanpak:
- Vechten over wie gelijk heeft
- Rang gebruiken
- De andere partij negeren

Goede Aanpak:
- Verken interesses (klantwaarde vs. duurzaam tempo)
- Genereer opties (MVP, fasering, trade-offs)
- Gebruik data (velocity, capaciteit)
- Werk samen aan oplossing

**Scenario 2: Teamlid Conflict**
Twee developers zijn het oneens over technische aanpak

Slechte Aanpak:
- Laat ze uitvechten
- Neem zelf de beslissing
- Vermijd het issue

Goede Aanpak:
- Faciliteer discussie
- Focus op interesses (performance, onderhoudbaarheid, etc.)
- Evalueer tegen criteria
- Laat team samen beslissen

**Scenario 3: Stakeholder Conflict**
Twee stakeholders willen verschillende dingen

Slechte Aanpak:
- Kies een kant
- Probeer beide tevreden te stellen met compromis
- Escaleer onmiddellijk

Goede Aanpak:
- Breng ze samen
- Verduidelijk prioriteiten
- Vind creatieve oplossingen
- Gebruik productvisie als gids

**Conflict Voorkomen**

Preventie is beter dan oplossing:

**1. Duidelijke Verwachtingen**
- Rollen en verantwoordelijkheden
- Beslissingsbevoegdheid
- Communicatie normen

**2. Regelmatige Communicatie**
- Laat issues niet etteren
- Creëer veilige ruimtes voor meningsverschil
- Pak vroeg aan

**3. Team Normen**
- Hoe we het oneens zijn
- Hoe we beslissingen nemen
- Hoe we conflicten oplossen

**4. Bouw Relaties**
- Mensen vechten minder met vrienden
- Investeer in teambuilding
- Creëer vertrouwen

**Wanneer Escaleren**

Soms kun je het niet alleen oplossen:

Escaleer wanneer:
- Buiten je autoriteit
- Veiligheids- of ethische issues
- Herhaalde patronen
- Significante impact
- Je pogingen hebben gefaald

Hoe te escaleren:
- Stel het issue duidelijk
- Wat je hebt geprobeerd
- Wat je nodig hebt
- Houd het feitelijk

**Culturele Overwegingen**

Conflictstijlen variëren per cultuur:
- Directe vs. indirecte communicatie
- Individuele vs. groepsharmonie
- Tijdsoriëntatie
- Machtafstand

Wees bewust en pas je aanpak aan.

**Samenvatting**

Vijf conflictstijlen:
1. Competing: Win-verlies
2. Accommodating: Verlies-win
3. Avoiding: Verlies-verlies
4. Compromising: Half-half
5. Collaborating: Win-win

Voor belangrijke conflicten, werk samen:
- Scheid mensen van probleem
- Focus op interesses
- Genereer samen opties
- Gebruik objectieve criteria

Pak conflicten vroeg en constructief aan.`,
      keyTakeaways: [
        'Five conflict styles: Competing, Accommodating, Avoiding, Compromising, Collaborating',
        'Collaborating (win-win) is ideal for important conflicts',
        'Focus on interests (why) not positions (what)',
        'Separate people from problem - attack the issue, not the person',
      ],
      keyTakeawaysNL: [
        'Vijf conflictstijlen: Competing, Accommodating, Avoiding, Compromising, Collaborating',
        'Collaborating (win-win) is ideaal voor belangrijke conflicten',
        'Focus op interesses (waarom) niet posities (wat)',
        'Scheid mensen van probleem - val het issue aan, niet de persoon',
      ],
      resources: [
        {
          name: 'Thomas-Kilmann Model Guide',
          nameNL: 'Thomas-Kilmann Model Gids',
          type: 'PDF',
          size: '1.1 MB',
          description: 'Complete guide to conflict handling styles',
          descriptionNL: 'Complete gids voor conflicthanteringstijlen',
        },
        {
          name: 'Conflict Resolution Worksheet',
          nameNL: 'Conflictoplossing Werkblad',
          type: 'DOCX',
          size: '380 KB',
          description: 'Prepare for difficult conversations',
          descriptionNL: 'Bereid moeilijke gesprekken voor',
        },
      ],
    },
    {
      id: 'lead-l9',
      title: 'Delegation and Empowerment',
      titleNL: 'Delegeren en Empowerment',
      type: 'video',
      duration: '12:00',
      videoUrl: '',
      transcript: `Delegation is one of the most important and most difficult leadership skills. Many leaders struggle with letting go. In this lesson, we'll learn how to delegate effectively and empower your team.

**Why Leaders Don't Delegate**

Common barriers:
- "It's faster if I do it myself"
- "They won't do it as well as me"
- "I don't have time to explain it"
- "It's too important to delegate"
- "I enjoy doing this work"

But not delegating:
- Limits team development
- Creates bottlenecks
- Burns you out
- Prevents scaling
- Demotivates the team

**The Benefits of Delegation**

**For You:**
- More time for strategic work
- Reduced workload
- Develops your management skills
- Allows you to scale

**For Them:**
- Develops new skills
- Increases engagement
- Builds confidence
- Prepares for promotion

**For the Organization:**
- Builds bench strength
- Increases capacity
- Creates resilience
- Improves succession planning

**What to Delegate**

**Do Delegate:**
- Routine tasks
- Tasks that develop others
- Tasks someone can do better
- Tasks aligned with their goals
- Work that doesn't require your unique expertise

**Don't Delegate:**
- Performance issues
- Confidential matters
- Core responsibilities you own
- Crisis situations (initially)
- Strategic decisions (but involve them)

**The Rule:** Delegate the tasks, not the responsibility. You remain accountable.

**Levels of Delegation**

Choose the right level for the person and situation:

**Level 1: Tell**
"Do exactly this, exactly how I say"
- For beginners
- Critical situations
- Clear right way

**Level 2: Sell**
"Here's what and why. Do it this way"
- Building understanding
- Developing buy-in
- Still directive

**Level 3: Consult**
"Here's what I'm thinking. What do you think?"
- Getting input
- Shared decision
- Development opportunity

**Level 4: Agree**
"Let's decide together"
- Joint decision-making
- Full involvement
- Shared ownership

**Level 5: Advise**
"Here's some input. You decide"
- You provide perspective
- They decide
- Building judgment

**Level 6: Inquire**
"Let me know what you decide"
- Full autonomy
- Just keep you informed
- High trust

**Level 7: Delegate Fully**
"You've got this. Handle it"
- Complete autonomy
- Only intervene if asked
- Highest level of trust

Start with appropriate level. Increase over time.

**The Delegation Conversation**

**Step 1: Set Context**
"I'd like to give you responsibility for [X]"
"This is important because..."

**Step 2: Define the Task**
- What needs to be done
- Why it matters
- What success looks like
- Constraints or parameters

**Step 3: Check Understanding**
"What questions do you have?"
"Explain back to me what you'll do"

**Step 4: Provide Resources**
"You'll have access to..."
"I'll introduce you to..."

**Step 5: Agree on Check-ins**
"Let's check in [frequency]"
"Come to me if [situations]"

**Step 6: Express Confidence**
"I'm confident you can do this"
"I'm here if you need me"

**The RACI Matrix**

Clarify roles for each task:
- **R**esponsible: Does the work
- **A**ccountable: Ultimately answerable (only one!)
- **C**onsulted: Provides input
- **I**nformed: Kept in the loop

Example: Feature Development
- R: Developer (does the coding)
- A: Product Owner (ultimately responsible)
- C: Architect (provides technical input)
- I: Stakeholders (kept informed)

**Empowerment**

Delegation is giving a task. Empowerment is giving authority and autonomy.

**Elements of Empowerment:**

**1. Authority**
- Power to make decisions
- Control over resources
- Ability to act

**2. Information**
- Context and background
- Access to data
- Strategic direction

**3. Resources**
- Time
- Budget
- Tools and support

**4. Accountability**
- Clear expectations
- Agreed outcomes
- Regular check-ins

**Creating Psychological Safety**

People won't take ownership if they fear failure.

Build safety by:
- Making it safe to ask questions
- Tolerating mistakes as learning
- No blame or punishment
- Celebrating attempts
- Modeling vulnerability

**The Growth Mindset**

Fixed Mindset: "I can't do that"
Growth Mindset: "I can't do that YET"

Foster growth mindset:
- Praise effort, not just results
- Frame failures as learning
- Use "yet" language
- Encourage stretch assignments

**Monitoring Without Micromanaging**

The balance:
- Too little monitoring = abdication
- Too much monitoring = micromanagement
- Right amount = appropriate support

**Guidelines:**
- Agree on check-in frequency upfront
- Let them come to you (mostly)
- Ask questions, don't give answers
- Focus on outcomes, not methods
- Intervene only when necessary

**When Delegation Goes Wrong**

**Issue: They're not doing it right**

Ask yourself:
- Were expectations clear?
- Did they have resources?
- Is it wrong, or just different?
- Is it a learning opportunity?

Action:
- Provide feedback
- Coach, don't rescue
- Let them try again

**Issue: They don't have time**

Ask yourself:
- Was capacity considered?
- Are priorities clear?
- What can be deprioritized?

Action:
- Review workload together
- Help prioritize
- Adjust deadlines or scope

**Issue: They keep coming back**

Ask yourself:
- Are they ready for this level?
- Is safety lacking?
- Am I rescuing too quickly?

Action:
- Coach problem-solving
- Ask "What do you think?"
- Gradually increase autonomy

**Reverse Delegation**

Watch out! They might delegate back to you:
"What should I do?"
"Can you handle this?"
"I'm stuck"

Response:
"What have you tried?"
"What are your options?"
"What do you recommend?"

Put the monkey back on their back!

**Building a Culture of Empowerment**

Make delegation the norm:
- Model delegation yourself
- Celebrate autonomous decisions
- Share decision-making frameworks
- Encourage peer-to-peer delegation
- Make authority levels clear

**Summary**

Delegation:
- Frees your time
- Develops your team
- Scales the organization

Key principles:
- Match delegation level to person and task
- Provide context and resources
- Check-in appropriately
- Don't rescue or micromanage
- Build psychological safety

Empower by giving authority, information, resources, and accountability.`,
      transcriptNL: `Delegeren is een van de belangrijkste en moeilijkste leiderschapsvaardigheden. Veel leiders worstelen met loslaten. In deze les leren we hoe effectief te delegeren en je team empoweren.

**Waarom Leiders Niet Delegeren**

Veelvoorkomende barrières:
- "Het is sneller als ik het zelf doe"
- "Ze zullen het niet zo goed doen als ik"
- "Ik heb geen tijd om het uit te leggen"
- "Het is te belangrijk om te delegeren"
- "Ik vind dit werk leuk"

Maar niet delegeren:
- Beperkt teamontwikkeling
- Creëert knelpunten
- Leidt tot burn-out
- Voorkomt schalen
- Demotiveert het team

**De Voordelen van Delegeren**

**Voor Jou:**
- Meer tijd voor strategisch werk
- Verminderde werkdruk
- Ontwikkelt je managementvaardigheden
- Stelt je in staat te schalen

**Voor Hen:**
- Ontwikkelt nieuwe vaardigheden
- Verhoogt betrokkenheid
- Bouwt vertrouwen
- Bereidt voor op promotie

**Voor de Organisatie:**
- Bouwt reservesterkte
- Verhoogt capaciteit
- Creëert veerkracht
- Verbetert opvolgingsplanning

**Wat Te Delegeren**

**Delegeer Wel:**
- Routinetaken
- Taken die anderen ontwikkelen
- Taken die iemand beter kan
- Taken die aansluiten bij hun doelen
- Werk dat je unieke expertise niet vereist

**Delegeer Niet:**
- Prestatie issues
- Vertrouwelijke zaken
- Kern verantwoordelijkheden die jij bezit
- Crisissituaties (initieel)
- Strategische beslissingen (maar betrek ze wel)

**De Regel:** Delegeer de taken, niet de verantwoordelijkheid. Je blijft accountable.

**Niveaus van Delegatie**

Kies het juiste niveau voor de persoon en situatie:

**Niveau 1: Vertel**
"Doe precies dit, precies zoals ik zeg"
- Voor beginners
- Kritieke situaties
- Duidelijke juiste weg

**Niveau 2: Verkoop**
"Dit is wat en waarom. Doe het zo"
- Begrip opbouwen
- Buy-in ontwikkelen
- Nog steeds directief

**Niveau 3: Consulteer**
"Dit is wat ik denk. Wat denk jij?"
- Input krijgen
- Gedeelde beslissing
- Ontwikkelingsmogelijkheid

**Niveau 4: Akkoord**
"Laten we samen beslissen"
- Gezamenlijke besluitvorming
- Volledige betrokkenheid
- Gedeeld eigenaarschap

**Niveau 5: Adviseer**
"Hier is wat input. Jij beslist"
- Jij geeft perspectief
- Zij beslissen
- Oordeelsvorming opbouwen

**Niveau 6: Informeer**
"Laat me weten wat je beslist"
- Volledige autonomie
- Houd me op de hoogte
- Hoog vertrouwen

**Niveau 7: Delegeer Volledig**
"Je hebt dit. Handel het af"
- Complete autonomie
- Alleen ingrijpen als gevraagd
- Hoogste niveau van vertrouwen

Start met passend niveau. Verhoog in de tijd.

**Het Delegatie Gesprek**

**Stap 1: Zet Context**
"Ik wil je graag verantwoordelijkheid geven voor [X]"
"Dit is belangrijk omdat..."

**Stap 2: Definieer de Taak**
- Wat moet worden gedaan
- Waarom het belangrijk is
- Hoe succes eruitziet
- Beperkingen of parameters

**Stap 3: Check Begrip**
"Welke vragen heb je?"
"Leg me uit wat je gaat doen"

**Stap 4: Geef Resources**
"Je zult toegang hebben tot..."
"Ik stel je voor aan..."

**Stap 5: Spreek Check-ins Af**
"Laten we [frequentie] checken"
"Kom naar me toe als [situaties]"

**Stap 6: Spreek Vertrouwen Uit**
"Ik ben ervan overtuigd dat je dit kunt"
"Ik ben er als je me nodig hebt"

**De RACI Matrix**

Verduidelijk rollen voor elke taak:
- **R**esponsible: Doet het werk
- **A**ccountable: Uiteindelijk verantwoordelijk (slechts één!)
- **C**onsulted: Geeft input
- **I**nformed: Wordt op de hoogte gehouden

Voorbeeld: Feature Ontwikkeling
- R: Developer (doet het coderen)
- A: Product Owner (uiteindelijk verantwoordelijk)
- C: Architect (geeft technische input)
- I: Stakeholders (gehouden geïnformeerd)

**Empowerment**

Delegeren is een taak geven. Empowerment is autoriteit en autonomie geven.

**Elementen van Empowerment:**

**1. Autoriteit**
- Macht om beslissingen te nemen
- Controle over resources
- Vermogen om te handelen

**2. Informatie**
- Context en achtergrond
- Toegang tot data
- Strategische richting

**3. Resources**
- Tijd
- Budget
- Tools en ondersteuning

**4. Accountability**
- Duidelijke verwachtingen
- Overeengekomen uitkomsten
- Regelmatige check-ins

**Psychologische Veiligheid Creëren**

Mensen nemen geen eigenaarschap als ze falen vrezen.

Bouw veiligheid door:
- Maak het veilig om vragen te stellen
- Tolereer fouten als leren
- Geen blame of straf
- Vier pogingen
- Model kwetsbaarheid

**De Growth Mindset**

Fixed Mindset: "Ik kan dat niet"
Growth Mindset: "Ik kan dat NOG niet"

Bevorder growth mindset:
- Prijs inspanning, niet alleen resultaten
- Frame fouten als leren
- Gebruik "nog" taal
- Moedig stretch assignments aan

**Monitoren Zonder Micromanagen**

De balans:
- Te weinig monitoren = abdicatie
- Te veel monitoren = micromanagement
- Juiste hoeveelheid = passende ondersteuning

**Richtlijnen:**
- Spreek check-in frequentie vooraf af
- Laat ze naar jou komen (meestal)
- Stel vragen, geef geen antwoorden
- Focus op uitkomsten, niet methoden
- Grijp alleen in wanneer nodig

**Wanneer Delegatie Fout Gaat**

**Issue: Ze doen het niet goed**

Vraag jezelf:
- Waren verwachtingen duidelijk?
- Hadden ze resources?
- Is het fout, of alleen anders?
- Is het een leermogelijkheid?

Actie:
- Geef feedback
- Coach, red niet
- Laat ze opnieuw proberen

**Issue: Ze hebben geen tijd**

Vraag jezelf:
- Was capaciteit overwogen?
- Zijn prioriteiten duidelijk?
- Wat kan worden gedeprioriseerd?

Actie:
- Review workload samen
- Help prioriteren
- Pas deadlines of scope aan

**Issue: Ze blijven terugkomen**

Vraag jezelf:
- Zijn ze klaar voor dit niveau?
- Ontbreekt veiligheid?
- Red ik te snel?

Actie:
- Coach probleemoplossing
- Vraag "Wat denk je?"
- Verhoog geleidelijk autonomie

**Omgekeerde Delegatie**

Kijk uit! Ze kunnen terug delegeren naar jou:
"Wat moet ik doen?"
"Kun jij dit afhandelen?"
"Ik zit vast"

Reactie:
"Wat heb je geprobeerd?"
"Wat zijn je opties?"
"Wat raad je aan?"

Zet de aap terug op hun rug!

**Een Cultuur van Empowerment Bouwen**

Maak delegatie de norm:
- Model delegatie zelf
- Vier autonome beslissingen
- Deel besluitvormingskaders
- Moedig peer-to-peer delegatie aan
- Maak autoriteit niveaus duidelijk

**Samenvatting**

Delegatie:
- Maakt je tijd vrij
- Ontwikkelt je team
- Schaalt de organisatie

Kernprincipes:
- Match delegatieniveau aan persoon en taak
- Geef context en resources
- Check-in passend
- Red niet of micromanage niet
- Bouw psychologische veiligheid

Empower door autoriteit, informatie, resources en accountability te geven.`,
      keyTakeaways: [
        'Delegation develops your team, frees your time, and scales the organization',
        'Seven levels of delegation: from Tell to Delegate Fully - match to person and task',
        'Use RACI matrix to clarify roles: Responsible, Accountable, Consulted, Informed',
        'Empowerment = authority + information + resources + accountability',
      ],
      keyTakeawaysNL: [
        'Delegatie ontwikkelt je team, maakt je tijd vrij en schaalt de organisatie',
        'Zeven niveaus van delegatie: van Vertel tot Delegeer Volledig - match aan persoon en taak',
        'Gebruik RACI matrix om rollen te verduidelijken: Responsible, Accountable, Consulted, Informed',
        'Empowerment = autoriteit + informatie + resources + accountability',
      ],
      resources: [
        {
          name: 'Delegation Levels Guide',
          nameNL: 'Delegatie Niveaus Gids',
          type: 'PDF',
          size: '820 KB',
          description: 'Seven levels of delegation explained',
          descriptionNL: 'Zeven niveaus van delegatie uitgelegd',
        },
        {
          name: 'RACI Matrix Template',
          nameNL: 'RACI Matrix Template',
          type: 'XLSX',
          size: '290 KB',
          description: 'Clarify roles and responsibilities',
          descriptionNL: 'Verduidelijk rollen en verantwoordelijkheden',
        },
      ],
    },
    {
      id: 'lead-l10',
      title: 'Motivation Theories',
      titleNL: 'Motivatietheorieën',
      type: 'video',
      duration: '16:00',
      videoUrl: '',
      transcript: `What motivates people? Understanding motivation helps you lead more effectively. In this lesson, we'll explore key motivation theories and how to apply them.

**Intrinsic vs. Extrinsic Motivation**

**Extrinsic Motivation**: Driven by external rewards
- Money
- Bonuses
- Recognition
- Promotions
- Avoiding punishment

**Intrinsic Motivation**: Driven by internal satisfaction
- Interest in the work
- Personal growth
- Mastery
- Purpose
- Autonomy

Research shows: Intrinsic motivation is more powerful and sustainable!

**Herzberg's Two-Factor Theory**

Frederick Herzberg identified two categories:

**Hygiene Factors** (Dissatisfiers)
Don't motivate, but absence causes dissatisfaction:
- Salary
- Working conditions
- Company policies
- Supervision
- Job security

Think of these as the baseline. Their presence doesn't motivate, but their absence demotivates.

**Motivators** (Satisfiers)
Actually drive motivation:
- Achievement
- Recognition
- The work itself
- Responsibility
- Advancement
- Growth

**Implication:** You can't motivate just with salary raises. You need meaningful work, recognition, and growth opportunities.

**Maslow's Hierarchy of Needs**

Abraham Maslow proposed five levels of needs:

**Level 1: Physiological**
- Food, water, shelter
- Salary sufficient for basics

**Level 2: Safety**
- Job security
- Safe working conditions
- Health insurance

**Level 3: Social/Belonging**
- Team relationships
- Feeling accepted
- Social connections

**Level 4: Esteem**
- Recognition
- Status
- Respect from others
- Self-respect

**Level 5: Self-Actualization**
- Reaching potential
- Personal growth
- Meaningful work
- Making a difference

People progress up the pyramid. You can't focus on self-actualization if basic needs aren't met.

**In Practice:**
- Junior employee: May prioritize security and belonging
- Senior professional: More likely seeking self-actualization

**Dan Pink's Drive**

Daniel Pink identified three elements of intrinsic motivation:

**1. Autonomy**
The desire to direct our own lives.

Give people:
- Choice over tasks
- Control over their time
- Freedom in approach
- Input on decisions

**2. Mastery**
The urge to get better at stuff.

Provide:
- Challenging work
- Feedback and coaching
- Learning opportunities
- Time to practice
- Visible progress

**3. Purpose**
The yearning to do something meaningful.

Connect to:
- Impact on users/customers
- Company mission
- Larger goals
- Social value
- Why the work matters

**Application in Projects:**

**Autonomy:**
- Let team decide how to achieve Sprint Goal
- Give ownership of components
- Include in technical decisions
- Flexible working hours

**Mastery:**
- Pair programming
- Code reviews
- Training budget
- Conference attendance
- Stretch assignments

**Purpose:**
- Share user stories and feedback
- Demonstrate impact
- Connect to company strategy
- Celebrate outcomes

**McClelland's Achievement Theory**

David McClelland identified three motivational needs:

**1. Need for Achievement (nAch)**
- Desire to accomplish challenging goals
- Seek feedback
- Like moderate risks
- Personal responsibility

**Motivate by:**
- Setting challenging goals
- Providing clear metrics
- Giving feedback
- Recognizing accomplishments

**2. Need for Affiliation (nAff)**
- Desire for relationships
- Want to be liked
- Prefer cooperation over competition
- Fear rejection

**Motivate by:**
- Team activities
- Collaborative work
- Positive environment
- Social recognition

**3. Need for Power (nPow)**
- Desire to influence others
- Want to make an impact
- Enjoy competition
- Seek positions of authority

**Motivate by:**
- Leadership opportunities
- Influence on decisions
- Mentoring roles
- Visible projects

Everyone has all three needs but in different proportions.

**Self-Determination Theory**

For intrinsic motivation, people need:

**Competence**: Feeling effective
**Autonomy**: Feeling in control
**Relatedness**: Feeling connected

Satisfy these three and people are naturally motivated!

**Practical Motivation Strategies**

**1. Know Your People**
What motivates them?
- Have 1-on-1s
- Ask what excites them
- Observe what energizes them
- Understand their goals

**2. Provide Choice**
- Let them pick tasks when possible
- Involve in decisions
- Give options, not directives
- Respect their input

**3. Give Meaningful Work**
- Connect to impact
- Explain the why
- Show how it matters
- Share user feedback

**4. Enable Mastery**
- Challenging but achievable work
- Regular feedback
- Learning opportunities
- Celebrate progress

**5. Recognize Contributions**
- Be specific: "I appreciate that you..."
- Public and private
- Timely (don't wait)
- Sincere and genuine

**6. Foster Relationships**
- Team building
- Collaborative work
- Social time
- Psychological safety

**7. Show Progress**
- Make work visible (Kanban, burndown)
- Celebrate milestones
- Reflect on how far you've come
- Share success stories

**What Demotivates?**

Be aware of demotivators:
- Micromanagement
- Lack of autonomy
- Unclear expectations
- No recognition
- Unfair treatment
- Meaningless work
- No growth opportunities
- Toxic culture
- Broken promises

Avoid these at all costs!

**Motivation Across Generations**

General patterns (but remember: individuals vary!):

**Baby Boomers**: Status, position, stability
**Gen X**: Work-life balance, autonomy, practical rewards
**Millennials**: Purpose, feedback, development
**Gen Z**: Impact, flexibility, authenticity

Adapt your approach!

**The Motivation Maintenance Cycle**

1. **Understand**: What motivates this person?
2. **Provide**: Give opportunities aligned with their motivations
3. **Observe**: Are they engaged and productive?
4. **Adjust**: Refine your approach
5. **Repeat**: Motivation needs evolve

**When Nothing Works**

Sometimes despite your efforts, someone stays unmotivated.

Possible reasons:
- Personal issues outside work
- Role mismatch
- Burnout
- Fit with company/team
- Health issues

**Action:**
- Have honest conversation
- Explore what's wrong
- Consider role change
- Get HR involved if needed
- Sometimes parting ways is best

**Summary**

Key theories:
- **Herzberg**: Hygiene factors vs. motivators
- **Maslow**: Hierarchy of needs
- **Pink**: Autonomy, Mastery, Purpose
- **McClelland**: Achievement, Affiliation, Power

Core principles:
- Intrinsic motivation beats extrinsic
- Understand individual motivations
- Provide autonomy, mastery, purpose
- Connect work to meaning
- Remove demotivators

Motivation is personal. Know your people.`,
      transcriptNL: `Wat motiveert mensen? Motivatie begrijpen helpt je effectiever te leiden. In deze les verkennen we belangrijke motivatietheorieën en hoe ze toe te passen.

**Intrinsieke vs. Extrinsieke Motivatie**

**Extrinsieke Motivatie**: Gedreven door externe beloningen
- Geld
- Bonussen
- Erkenning
- Promoties
- Straf vermijden

**Intrinsieke Motivatie**: Gedreven door interne tevredenheid
- Interesse in het werk
- Persoonlijke groei
- Meesterschap
- Doel
- Autonomie

Onderzoek toont: Intrinsieke motivatie is krachtiger en duurzamer!

**Herzberg's Twee-Factoren Theorie**

Frederick Herzberg identificeerde twee categorieën:

**Hygiëne Factoren** (Ontevredenheidsfactoren)
Motiveren niet, maar afwezigheid veroorzaakt ontevredenheid:
- Salaris
- Werkomstandigheden
- Bedrijfsbeleid
- Toezicht
- Werkzekerheid

Zie deze als de baseline. Hun aanwezigheid motiveert niet, maar hun afwezigheid demotiveert.

**Motivatoren** (Tevredenheidsfactoren)
Drijven daadwerkelijk motivatie:
- Prestatie
- Erkenning
- Het werk zelf
- Verantwoordelijkheid
- Vooruitgang
- Groei

**Implicatie:** Je kunt niet alleen motiveren met salarisverhoging. Je hebt betekenisvol werk, erkenning en groeikansen nodig.

**Maslow's Behoeftenhiërarchie**

Abraham Maslow stelde vijf niveaus van behoeften voor:

**Niveau 1: Fysiologisch**
- Voedsel, water, onderdak
- Salaris voldoende voor basisbehoeften

**Niveau 2: Veiligheid**
- Baanzekerheid
- Veilige werkomstandigheden
- Ziektekostenverzekering

**Niveau 3: Sociaal/Erbij Horen**
- Teamrelaties
- Geaccepteerd voelen
- Sociale connecties

**Niveau 4: Waardering**
- Erkenning
- Status
- Respect van anderen
- Zelfrespect

**Niveau 5: Zelfactualisatie**
- Potentieel bereiken
- Persoonlijke groei
- Betekenisvol werk
- Verschil maken

Mensen gaan de piramide op. Je kunt niet focussen op zelfactualisatie als basisbehoeften niet vervuld zijn.

**In Praktijk:**
- Junior medewerker: Kan zekerheid en erbij horen prioriteren
- Senior professional: Waarschijnlijk zelfactualisatie zoekend

**Dan Pink's Drive**

Daniel Pink identificeerde drie elementen van intrinsieke motivatie:

**1. Autonomie**
De wens om ons eigen leven te sturen.

Geef mensen:
- Keuze over taken
- Controle over hun tijd
- Vrijheid in aanpak
- Input bij beslissingen

**2. Meesterschap**
De drang om beter te worden in dingen.

Bied:
- Uitdagend werk
- Feedback en coaching
- Leermogelijkheden
- Tijd om te oefenen
- Zichtbare voortgang

**3. Doel**
Het verlangen om iets betekenisvols te doen.

Verbind met:
- Impact op gebruikers/klanten
- Bedrijfsmissie
- Grotere doelen
- Sociale waarde
- Waarom het werk belangrijk is

**Toepassing in Projecten:**

**Autonomie:**
- Laat team beslissen hoe Sprint Goal te bereiken
- Geef eigenaarschap van componenten
- Betrek bij technische beslissingen
- Flexibele werktijden

**Meesterschap:**
- Pair programming
- Code reviews
- Trainingsbudget
- Conferentie bezoek
- Stretch assignments

**Doel:**
- Deel user stories en feedback
- Demonstreer impact
- Verbind met bedrijfsstrategie
- Vier uitkomsten

**McClelland's Prestatie Theorie**

David McClelland identificeerde drie motivationele behoeften:

**1. Behoefte aan Prestatie (nAch)**
- Wens om uitdagende doelen te bereiken
- Zoek feedback
- Houden van matige risico's
- Persoonlijke verantwoordelijkheid

**Motiveer door:**
- Uitdagende doelen stellen
- Duidelijke metrics geven
- Feedback geven
- Prestaties erkennen

**2. Behoefte aan Affiliatie (nAff)**
- Wens naar relaties
- Willen aardig gevonden worden
- Geven voorkeur aan samenwerking boven competitie
- Vrezen afwijzing

**Motiveer door:**
- Team activiteiten
- Collaboratief werk
- Positieve omgeving
- Sociale erkenning

**3. Behoefte aan Macht (nPow)**
- Wens om anderen te beïnvloeden
- Willen impact maken
- Genieten van competitie
- Zoeken posities van autoriteit

**Motiveer door:**
- Leiderschapsmogelijkheden
- Invloed op beslissingen
- Mentorrollen
- Zichtbare projecten

Iedereen heeft alle drie behoeften maar in verschillende verhoudingen.

**Zelfbeschikkingstheorie**

Voor intrinsieke motivatie hebben mensen nodig:

**Competentie**: Effectief voelen
**Autonomie**: Controle voelen
**Verbondenheid**: Verbonden voelen

Voldoe aan deze drie en mensen zijn natuurlijk gemotiveerd!

**Praktische Motivatie Strategieën**

**1. Ken Je Mensen**
Wat motiveert hen?
- Heb 1-op-1's
- Vraag wat hen enthousiast maakt
- Observeer wat hen energie geeft
- Begrijp hun doelen

**2. Geef Keuze**
- Laat ze taken kiezen waar mogelijk
- Betrek bij beslissingen
- Geef opties, geen directieven
- Respecteer hun input

**3. Geef Betekenisvol Werk**
- Verbind met impact
- Leg de waarom uit
- Toon hoe het belangrijk is
- Deel gebruikersfeedback

**4. Enable Meesterschap**
- Uitdagend maar haalbaar werk
- Regelmatige feedback
- Leermogelijkheden
- Vier voortgang

**5. Erken Bijdragen**
- Wees specifiek: "Ik waardeer dat je..."
- Publiek en privé
- Tijdig (wacht niet)
- Oprecht en gemeend

**6. Bevorder Relaties**
- Teambuilding
- Collaboratief werk
- Sociale tijd
- Psychologische veiligheid

**7. Toon Voortgang**
- Maak werk zichtbaar (Kanban, burndown)
- Vier mijlpalen
- Reflecteer hoe ver je bent gekomen
- Deel succesverhalen

**Wat Demotiveert?**

Wees bewust van demotivatoren:
- Micromanagement
- Gebrek aan autonomie
- Onduidelijke verwachtingen
- Geen erkenning
- Oneerlijke behandeling
- Betekenisloos werk
- Geen groeimogelijkheden
- Toxische cultuur
- Gebroken beloftes

Vermijd deze te allen tijde!

**Motivatie Over Generaties**

Algemene patronen (maar onthoud: individuen variëren!):

**Baby Boomers**: Status, positie, stabiliteit
**Gen X**: Work-life balance, autonomie, praktische beloningen
**Millennials**: Doel, feedback, ontwikkeling
**Gen Z**: Impact, flexibiliteit, authenticiteit

Pas je aanpak aan!

**De Motivatie Onderhoudscyclus**

1. **Begrijp**: Wat motiveert deze persoon?
2. **Bied**: Geef mogelijkheden afgestemd op hun motivaties
3. **Observeer**: Zijn ze betrokken en productief?
4. **Pas Aan**: Verfijn je aanpak
5. **Herhaal**: Motivatiebehoeften evolueren

**Wanneer Niets Werkt**

Soms blijft iemand ondanks je inspanningen ongemotiveerd.

Mogelijke redenen:
- Persoonlijke issues buiten werk
- Rol mismatch
- Burn-out
- Fit met bedrijf/team
- Gezondheidsproblemen

**Actie:**
- Voer eerlijk gesprek
- Verken wat er mis is
- Overweeg rolverandering
- Betrek HR indien nodig
- Soms is uit elkaar gaan het beste

**Samenvatting**

Belangrijke theorieën:
- **Herzberg**: Hygiëne factoren vs. motivatoren
- **Maslow**: Behoeftenhiërarchie
- **Pink**: Autonomie, Meesterschap, Doel
- **McClelland**: Prestatie, Affiliatie, Macht

Kernprincipes:
- Intrinsieke motivatie verslaat extrinsieke
- Begrijp individuele motivaties
- Bied autonomie, meesterschap, doel
- Verbind werk met betekenis
- Verwijder demotivatoren

Motivatie is persoonlijk. Ken je mensen.`,
      keyTakeaways: [
        'Intrinsic motivation (autonomy, mastery, purpose) is more powerful than extrinsic (money, bonuses)',
        'Herzberg: Hygiene factors prevent dissatisfaction, motivators drive satisfaction',
        'Pink\'s Drive: People need Autonomy, Mastery, and Purpose',
        'McClelland: Three needs - Achievement, Affiliation, Power - in different proportions',
      ],
      keyTakeawaysNL: [
        'Intrinsieke motivatie (autonomie, meesterschap, doel) is krachtiger dan extrinsieke (geld, bonussen)',
        'Herzberg: Hygiëne factoren voorkomen ontevredenheid, motivatoren drijven tevredenheid',
        'Pink\'s Drive: Mensen hebben Autonomie, Meesterschap en Doel nodig',
        'McClelland: Drie behoeften - Prestatie, Affiliatie, Macht - in verschillende verhoudingen',
      ],
      resources: [
        {
          name: 'Motivation Theories Comparison',
          nameNL: 'Motivatietheorieën Vergelijking',
          type: 'PDF',
          size: '1.3 MB',
          description: 'Visual comparison of major motivation theories',
          descriptionNL: 'Visuele vergelijking van belangrijke motivatietheorieën',
        },
        {
          name: 'Team Motivation Assessment',
          nameNL: 'Team Motivatie Assessment',
          type: 'DOCX',
          size: '420 KB',
          description: 'Assess what motivates your team members',
          descriptionNL: 'Beoordeel wat je teamleden motiveert',
        },
      ],
    },
    {
      id: 'lead-l11',
      title: 'Quiz: Teams',
      titleNL: 'Quiz: Teams',
      type: 'quiz',
      duration: '12:00',
      quiz: [
        {
          id: 'lead-q-t1',
          question: 'According to Lencioni, what is the foundation of a high-performance team?',
          questionNL: 'Volgens Lencioni, wat is het fundament van een high-performance team?',
          options: [
            'Clear goals',
            'Trust',
            'Strong leadership',
            'Good processes'
          ],
          optionsNL: [
            'Duidelijke doelen',
            'Vertrouwen',
            'Sterk leiderschap',
            'Goede processen'
          ],
          correctAnswer: 1,
          explanation: 'Trust is the foundation. Without vulnerability-based trust, teams cannot engage in healthy conflict, commit to decisions, hold each other accountable, or focus on results.',
          explanationNL: 'Vertrouwen is het fundament. Zonder kwetsbaarheid-gebaseerd vertrouwen kunnen teams niet aangaan in gezond conflict, zich committeren aan beslissingen, elkaar verantwoordelijk houden of focussen op resultaten.',
        },
        {
          id: 'lead-q-t2',
          question: 'In Tuckman\'s model, which stage involves conflict and resistance?',
          questionNL: 'In Tuckmans model, welke fase omvat conflict en weerstand?',
          options: [
            'Forming',
            'Storming',
            'Norming',
            'Performing'
          ],
          optionsNL: [
            'Forming',
            'Storming',
            'Norming',
            'Performing'
          ],
          correctAnswer: 1,
          explanation: 'Storming is when reality sets in, differences emerge, and conflicts arise. This stage must be weathered, not avoided, for teams to reach high performance.',
          explanationNL: 'Storming is wanneer de realiteit indaalt, verschillen naar voren komen en conflicten ontstaan. Deze fase moet worden doorstaan, niet vermeden, om high performance te bereiken.',
        },
        {
          id: 'lead-q-t3',
          question: 'What conflict style should you use for important issues when time allows?',
          questionNL: 'Welke conflictstijl moet je gebruiken voor belangrijke issues wanneer tijd het toelaat?',
          options: [
            'Competing (Win-Lose)',
            'Avoiding (Lose-Lose)',
            'Compromising (Half-Half)',
            'Collaborating (Win-Win)'
          ],
          optionsNL: [
            'Competing (Win-Verlies)',
            'Avoiding (Verlies-Verlies)',
            'Compromising (Half-Half)',
            'Collaborating (Win-Win)'
          ],
          correctAnswer: 3,
          explanation: 'Collaborating (win-win) is ideal for important conflicts when time allows. Both parties\' needs are met, relationships strengthen, and commitment is high.',
          explanationNL: 'Collaborating (win-win) is ideaal voor belangrijke conflicten wanneer tijd het toelaat. Beide partijen\'s behoeften worden vervuld, relaties versterken en commitment is hoog.',
        },
        {
          id: 'lead-q-t4',
          question: 'What should you do FIRST when delegating a task?',
          questionNL: 'Wat moet je als EERSTE doen bij het delegeren van een taak?',
          options: [
            'Set up check-in meetings',
            'Provide context and explain why it matters',
            'Give detailed instructions on how to do it',
            'Set the deadline'
          ],
          optionsNL: [
            'Check-in meetings inplannen',
            'Context geven en uitleggen waarom het belangrijk is',
            'Gedetailleerde instructies geven over hoe het te doen',
            'De deadline bepalen'
          ],
          correctAnswer: 1,
          explanation: 'Start by setting context - why the task matters and how it fits the bigger picture. This builds buy-in and helps the person make good decisions.',
          explanationNL: 'Begin met context geven - waarom de taak belangrijk is en hoe het past in het grotere geheel. Dit bouwt buy-in op en helpt de persoon goede beslissingen te nemen.',
        },
        {
          id: 'lead-q-t5',
          question: 'In the RACI matrix, who is ultimately answerable for a task?',
          questionNL: 'In de RACI matrix, wie is uiteindelijk verantwoordelijk voor een taak?',
          options: [
            'Responsible (does the work)',
            'Accountable (ultimately answerable)',
            'Consulted (provides input)',
            'Informed (kept in loop)'
          ],
          optionsNL: [
            'Responsible (doet het werk)',
            'Accountable (uiteindelijk verantwoordelijk)',
            'Consulted (geeft input)',
            'Informed (gehouden in loop)'
          ],
          correctAnswer: 1,
          explanation: 'Accountable (A) is ultimately answerable for the task. There should only be ONE person accountable for each task. Responsible (R) does the actual work.',
          explanationNL: 'Accountable (A) is uiteindelijk verantwoordelijk voor de taak. Er mag slechts ÉÉN persoon accountable zijn voor elke taak. Responsible (R) doet het daadwerkelijke werk.',
        },
        {
          id: 'lead-q-t6',
          question: 'According to Dan Pink, what are the three elements of intrinsic motivation?',
          questionNL: 'Volgens Dan Pink, wat zijn de drie elementen van intrinsieke motivatie?',
          options: [
            'Money, Status, Security',
            'Autonomy, Mastery, Purpose',
            'Achievement, Power, Affiliation',
            'Physiological, Safety, Social'
          ],
          optionsNL: [
            'Geld, Status, Zekerheid',
            'Autonomie, Meesterschap, Doel',
            'Prestatie, Macht, Affiliatie',
            'Fysiologisch, Veiligheid, Sociaal'
          ],
          correctAnswer: 1,
          explanation: 'Pink\'s three elements are Autonomy (desire to direct our lives), Mastery (urge to get better), and Purpose (yearning for meaningful work).',
          explanationNL: 'Pink\'s drie elementen zijn Autonomie (wens om ons leven te sturen), Meesterschap (drang om beter te worden), en Doel (verlangen naar betekenisvol werk).',
        },
        {
          id: 'lead-q-t7',
          question: 'Which conflict approach focuses on interests rather than positions?',
          questionNL: 'Welke conflictaanpak focust op interesses in plaats van posities?',
          options: [
            'Competing',
            'Avoiding',
            'Interest-based approach',
            'Compromising'
          ],
          optionsNL: [
            'Competing',
            'Avoiding',
            'Interesse-gebaseerde aanpak',
            'Compromising'
          ],
          correctAnswer: 2,
          explanation: 'The interest-based approach asks "why" people want something (interests) rather than just "what" they say they want (positions). This leads to creative solutions.',
          explanationNL: 'De interesse-gebaseerde aanpak vraagt "waarom" mensen iets willen (interesses) in plaats van alleen "wat" ze zeggen dat ze willen (posities). Dit leidt tot creatieve oplossingen.',
        },
        {
          id: 'lead-q-t8',
          question: 'What is "reverse delegation"?',
          questionNL: 'Wat is "omgekeerde delegatie"?',
          options: [
            'Delegating upward to your manager',
            'When the person delegates the task back to you',
            'Delegating the same task twice',
            'Removing delegation'
          ],
          optionsNL: [
            'Naar boven delegeren naar je manager',
            'Wanneer de persoon de taak terug delegeert naar jou',
            'Dezelfde taak twee keer delegeren',
            'Delegatie verwijderen'
          ],
          correctAnswer: 1,
          explanation: 'Reverse delegation is when the person you delegated to tries to give the task back to you (\"What should I do?\"). Combat this by coaching problem-solving instead of giving answers.',
          explanationNL: 'Omgekeerde delegatie is wanneer de persoon aan wie je delegeerde probeert de taak terug te geven aan jou (\"Wat moet ik doen?\"). Bestrijd dit door probleemoplossing te coachen in plaats van antwoorden te geven.',
        },
        {
          id: 'lead-q-t9',
          question: 'According to Herzberg, which is a TRUE motivator (not just a hygiene factor)?',
          questionNL: 'Volgens Herzberg, wat is een ECHTE motivator (niet alleen een hygiëne factor)?',
          options: [
            'Salary increase',
            'Better working conditions',
            'Recognition for achievement',
            'Job security'
          ],
          optionsNL: [
            'Salaris verhoging',
            'Betere werkomstandigheden',
            'Erkenning voor prestatie',
            'Baan zekerheid'
          ],
          correctAnswer: 2,
          explanation: 'Recognition is a true motivator. Salary, working conditions, and job security are hygiene factors - their absence causes dissatisfaction but their presence doesn\'t motivate.',
          explanationNL: 'Erkenning is een echte motivator. Salaris, werkomstandigheden en baanzekerheid zijn hygiëne factoren - hun afwezigheid veroorzaakt ontevredenheid maar hun aanwezigheid motiveert niet.',
        },
        {
          id: 'lead-q-t10',
          question: 'In Tuckman\'s stages, how should your leadership style evolve?',
          questionNL: 'In Tuckmans fasen, hoe moet je leiderschapsstijl evolueren?',
          options: [
            'Stay directive throughout',
            'Start delegating and become more directive',
            'Start directive and gradually become more delegating',
            'Always be hands-off'
          ],
          optionsNL: [
            'Blijf directief gedurende',
            'Begin delegerend en word meer directief',
            'Begin directief en word geleidelijk meer delegerend',
            'Altijd hands-off zijn'
          ],
          correctAnswer: 2,
          explanation: 'Your style should evolve: Forming (directive), Storming (coaching), Norming (supporting), Performing (delegating). Teams need more direction early, more autonomy later.',
          explanationNL: 'Je stijl moet evolueren: Forming (directief), Storming (coaching), Norming (ondersteunend), Performing (delegerend). Teams hebben vroeg meer richting nodig, later meer autonomie.',
        },
      ],
    },
  ],
};

// ============================================
// MODULE 3: COMMUNICATION & INFLUENCE
// ============================================
const module3: Module = {
  id: 'lead-m3',
  title: 'Communication & Influence',
  titleNL: 'Communicatie & Invloed',
  description: 'Master communication techniques and build influence without authority.',
  descriptionNL: 'Beheers communicatietechnieken en bouw invloed zonder autoriteit.',
  order: 2,
  icon: 'MessageSquare',
  color: '#FB923C',
  gradient: 'linear-gradient(135deg, #FB923C 0%, #F97316 100%)',
  lessons: [
    {
      id: 'lead-l12',
      title: 'Effective Communication',
      titleNL: 'Effectieve Communicatie',
      type: 'video',
      duration: '12:00',
      videoUrl: '',
      transcript: `Communication is the most important skill for a project manager. You spend 90% of your time communicating. In this lesson, we'll master effective communication techniques.

**The Communication Model**

Basic communication has five elements:

**Sender** → **Message** → **Channel** → **Receiver** → **Feedback**

But many things can go wrong:
- **Noise**: Distractions, interruptions
- **Filters**: Our biases, assumptions
- **Medium issues**: Wrong channel chosen
- **Timing**: Bad moment
- **Encoding/Decoding**: Meaning lost in translation

**The 7 Cs of Communication**

**1. Clear**
Be specific and unambiguous.

Bad: "We need to improve quality"
Good: "We need to reduce defects from 15% to 5% by end of Q2"

**2. Concise**
Get to the point. No unnecessary words.

Bad: "I wanted to reach out and touch base with you regarding the fact that we might potentially need to consider the possibility of..."
Good: "We should discuss the deadline"

**3. Concrete**
Use specific facts and figures.

Bad: "Sales are up"
Good: "Sales increased 23% from $2M to $2.46M this quarter"

**4. Correct**
Accurate information and proper grammar.

Check your facts. Proofread. Professional appearance matters.

**5. Coherent**
Logical flow. Points connect.

Use: "First... Second... Third..." or "Therefore..." or "However..."

**6. Complete**
Include all necessary information.

Answer: Who, What, When, Where, Why, How

**7. Courteous**
Respectful and considerate.

Consider recipient's perspective. Use "please" and "thank you."

**Active Listening**

Most people are terrible listeners. They're just waiting to talk.

**Levels of Listening:**

**Level 1: Ignoring**
Not paying attention at all.

**Level 2: Pretending**
Looking like you're listening but you're not.
"Uh-huh" while checking phone.

**Level 3: Selective**
Only hearing what you want to hear.

**Level 4: Attentive**
Paying attention to words.
Most people stop here.

**Level 5: Empathic** ← TARGET
Understanding feelings and meaning.
This is where trust builds.

**How to Listen Actively:**

**1. Be Present**
- Put away devices
- Make eye contact
- Face the person
- Show you're listening

**2. Don't Interrupt**
- Let them finish completely
- Resist the urge to jump in
- Pause before responding

**3. Ask Questions**
- "Tell me more about..."
- "What do you mean by..."
- "Can you give an example?"

**4. Paraphrase**
- "So what I'm hearing is..."
- "It sounds like you're saying..."
- "Let me make sure I understand..."

**5. Reflect Feelings**
- "You seem frustrated about..."
- "It sounds like this is really important to you..."
- "I sense you're concerned about..."

**6. Summarize**
- "So to recap..."
- "The main points are..."
- "What I'm taking away is..."

**Non-Verbal Communication**

55% of communication is body language!

**Your Body Language:**
- **Posture**: Stand/sit tall. Lean in slightly.
- **Eye Contact**: Direct but not staring. 50-70% of the time.
- **Facial Expressions**: Match your message. Smile genuinely.
- **Gestures**: Open palms. Avoid crossing arms.
- **Distance**: Respect personal space (4-5 feet professional)
- **Voice**: Tone, pace, volume matter as much as words.

**Reading Others:**
- Crossed arms = defensive or cold
- Leaning back = disengaged
- Leaning forward = interested
- Avoiding eye contact = uncomfortable
- Nodding = understanding (usually)
- Fidgeting = nervous or bored

But context matters! Don't over-interpret one signal.

**Written Communication**

Email is your primary medium. Make it count.

**Email Best Practices:**

**Subject Lines:**
- Specific and actionable
- "Action Required: Budget Approval Needed by Friday"
- "FYI: Sprint 12 Demo Scheduled for Tuesday 10am"

**Structure:**
- **First line**: State purpose
- **Body**: Key information
- **Last line**: Action needed and deadline

**Formatting:**
- Short paragraphs
- Bullet points for lists
- Bold for key information
- White space is your friend

**Tone:**
- Professional but human
- Positive language
- Avoid ALL CAPS (shouting)
- Use exclamation points sparingly

**Before Sending:**
- Check recipients (Reply vs Reply All!)
- Proofread
- Does it pass the "newspaper test"? (Would you be OK if this was published?)

**Communication Channels**

Choose the right channel:

**Face-to-Face**
- Complex or sensitive topics
- Conflict resolution
- Building relationships
- Brainstorming

**Video Call**
- Remote equivalent of face-to-face
- Team meetings
- Client presentations
- When tone and body language matter

**Phone Call**
- Quick decisions
- Urgent matters
- When email thread gets too long
- When you need immediate response

**Email**
- Documentation needed
- Non-urgent matters
- Multiple recipients
- Complex information that needs review

**Instant Message**
- Quick questions
- Status updates
- Informal check-ins
- Not for: Complex topics, sensitive matters, formal decisions

**The Rule:** Choose the richest channel possible for the situation.

**Stakeholder Communication**

Different stakeholders need different communication:

**Executives**
- Bottom line first
- High-level summary
- Business impact
- Brief and visual

**Technical Team**
- Technical details
- How it works
- Challenges and solutions
- Detailed and thorough

**End Users**
- What's in it for them
- How to use it
- Simple language
- Practical and clear

**Difficult Conversations**

When you need to deliver bad news or give tough feedback:

**Preparation:**
- What's the message?
- What outcome do you want?
- What's their likely reaction?
- How will you stay calm?

**The Conversation:**
1. **State the issue** (direct and specific)
2. **Give examples** (concrete facts)
3. **Listen to their perspective** (genuinely)
4. **Discuss impact** (on project, team, etc.)
5. **Agree on solution** (collaborative)
6. **Follow up** (document and check in)

**The Sandwich Method (controversial)**

Positive → Negative → Positive

Some say this works. Others say it confuses the message.

Better: Be direct but kind. Don't bury bad news.

**Communication Barriers**

Watch out for:

**Physical Barriers:**
- Noise, distance
- Poor technology
- Different time zones

**Perceptual Barriers:**
- Assumptions
- Stereotypes
- Past experiences

**Emotional Barriers:**
- Stress, anger
- Fear, distrust
- Defensive reactions

**Cultural Barriers:**
- Language differences
- Different norms
- Communication styles

**Organizational Barriers:**
- Hierarchy
- Silos
- Information hoarding

**Overcoming Barriers:**
- Ask questions
- Check understanding
- Be aware of biases
- Choose right channel
- Create safe environment

**Summary**

Effective communication:
- Follow the 7 Cs (Clear, Concise, Concrete, Correct, Coherent, Complete, Courteous)
- Listen actively and empathically
- Mind your body language
- Choose the right channel
- Adapt to your audience
- Prepare for difficult conversations

You can be technically brilliant, but if you can't communicate, you can't lead.`,
      transcriptNL: `Communicatie is de belangrijkste vaardigheid voor een projectmanager. Je besteedt 90% van je tijd aan communiceren. In deze les beheersen we effectieve communicatietechnieken.

**Het Communicatie Model**

Basis communicatie heeft vijf elementen:

**Zender** → **Bericht** → **Kanaal** → **Ontvanger** → **Feedback**

Maar veel dingen kunnen misgaan:
- **Ruis**: Afleidingen, onderbrekingen
- **Filters**: Onze vooroordelen, aannames
- **Medium issues**: Verkeerd kanaal gekozen
- **Timing**: Slecht moment
- **Coderen/Decoderen**: Betekenis verloren in vertaling

**De 7 C's van Communicatie**

**1. Clear (Duidelijk)**
Wees specifiek en ondubbelzinnig.

Slecht: "We moeten kwaliteit verbeteren"
Goed: "We moeten defecten verminderen van 15% naar 5% tegen eind Q2"

**2. Concise (Beknopt)**
Kom ter zake. Geen onnodige woorden.

Slecht: "Ik wilde contact met je opnemen om te bespreken dat we mogelijk zouden kunnen overwegen de mogelijkheid van..."
Goed: "We moeten de deadline bespreken"

**3. Concrete (Concreet)**
Gebruik specifieke feiten en cijfers.

Slecht: "Verkoop is gestegen"
Goed: "Verkoop steeg 23% van €2M naar €2.46M dit kwartaal"

**4. Correct**
Accurate informatie en goede grammatica.

Check je feiten. Lees na. Professionele presentatie is belangrijk.

**5. Coherent (Samenhangend)**
Logische flow. Punten verbinden.

Gebruik: "Ten eerste... Ten tweede... Ten derde..." of "Daarom..." of "Echter..."

**6. Complete (Compleet)**
Bevat alle noodzakelijke informatie.

Beantwoord: Wie, Wat, Wanneer, Waar, Waarom, Hoe

**7. Courteous (Beleefd)**
Respectvol en attent.

Overweeg perspectief van ontvanger. Gebruik "alstublieft" en "dankjewel."

**Actief Luisteren**

Meeste mensen zijn verschrikkelijke luisteraars. Ze wachten gewoon om te praten.

**Niveaus van Luisteren:**

**Niveau 1: Negeren**
Helemaal niet opletten.

**Niveau 2: Doen Alsof**
Eruit zien alsof je luistert maar dat is niet zo.
"Uh-huh" terwijl je telefoon checkt.

**Niveau 3: Selectief**
Alleen horen wat je wilt horen.

**Niveau 4: Aandachtig**
Aandacht besteden aan woorden.
Meeste mensen stoppen hier.

**Niveau 5: Empathisch** ← DOEL
Gevoelens en betekenis begrijpen.
Dit is waar vertrouwen wordt opgebouwd.

**Hoe Actief Te Luisteren:**

**1. Wees Aanwezig**
- Leg apparaten weg
- Maak oogcontact
- Kijk naar de persoon
- Toon dat je luistert

**2. Onderbreek Niet**
- Laat ze compleet uitpraten
- Weerstaan de drang om in te springen
- Pauzeer voor je reageert

**3. Stel Vragen**
- "Vertel me meer over..."
- "Wat bedoel je met..."
- "Kun je een voorbeeld geven?"

**4. Parafraseer**
- "Dus wat ik hoor is..."
- "Het klinkt alsof je zegt..."
- "Laat me zeker weten dat ik begrijp..."

**5. Reflecteer Gevoelens**
- "Je lijkt gefrustreerd over..."
- "Het klinkt alsof dit echt belangrijk voor je is..."
- "Ik voel dat je bezorgd bent over..."

**6. Vat Samen**
- "Dus om samen te vatten..."
- "De hoofdpunten zijn..."
- "Wat ik meeneem is..."

**Non-Verbale Communicatie**

55% van communicatie is lichaamstaal!

**Jouw Lichaamstaal:**
- **Houding**: Sta/zit rechtop. Leun iets naar voren.
- **Oogcontact**: Direct maar niet starend. 50-70% van de tijd.
- **Gezichtsuitdrukkingen**: Match je bericht. Glimlach oprecht.
- **Gebaren**: Open handpalmen. Vermijd armen kruisen.
- **Afstand**: Respecteer persoonlijke ruimte (1.2-1.5 meter professioneel)
- **Stem**: Toon, tempo, volume zijn net zo belangrijk als woorden.

**Anderen Lezen:**
- Gekruiste armen = defensief of koud
- Achterover leunen = niet betrokken
- Voorover leunen = geïnteresseerd
- Oogcontact vermijden = oncomfortabel
- Knikken = begrip (meestal)
- Friemelen = nerveus of verveeld

Maar context is belangrijk! Interpreteer niet één signaal over.

**Schriftelijke Communicatie**

Email is je primaire medium. Maak het waardevol.

**Email Best Practices:**

**Onderwerpregels:**
- Specifiek en actionable
- "Actie Vereist: Budget Goedkeuring Nodig voor Vrijdag"
- "Ter Info: Sprint 12 Demo Gepland voor Dinsdag 10u"

**Structuur:**
- **Eerste regel**: Vermeld doel
- **Body**: Belangrijke informatie
- **Laatste regel**: Benodigde actie en deadline

**Opmaak:**
- Korte paragrafen
- Bullet points voor lijsten
- Vet voor belangrijke informatie
- Witruimte is je vriend

**Toon:**
- Professioneel maar menselijk
- Positieve taal
- Vermijd HOOFDLETTERS (schreeuwen)
- Gebruik uitroeptekens spaarzaam

**Voor Verzenden:**
- Check ontvangers (Beantwoorden vs Iedereen Beantwoorden!)
- Lees na
- Slaagt het de "krantentest"? (Zou je OK zijn als dit gepubliceerd werd?)

**Communicatie Kanalen**

Kies het juiste kanaal:

**Face-to-Face**
- Complexe of gevoelige onderwerpen
- Conflictoplossing
- Relaties opbouwen
- Brainstormen

**Video Call**
- Remote equivalent van face-to-face
- Team meetings
- Client presentaties
- Wanneer toon en lichaamstaal belangrijk zijn

**Telefoongesprek**
- Snelle beslissingen
- Urgente zaken
- Wanneer email thread te lang wordt
- Wanneer je onmiddellijke reactie nodig hebt

**Email**
- Documentatie nodig
- Niet-urgente zaken
- Meerdere ontvangers
- Complexe informatie die review nodig heeft

**Instant Message**
- Snelle vragen
- Status updates
- Informele check-ins
- Niet voor: Complexe onderwerpen, gevoelige zaken, formele beslissingen

**De Regel:** Kies het rijkste kanaal mogelijk voor de situatie.

**Stakeholder Communicatie**

Verschillende stakeholders hebben verschillende communicatie nodig:

**Executives**
- Bottom line eerst
- High-level samenvatting
- Business impact
- Kort en visueel

**Technisch Team**
- Technische details
- Hoe het werkt
- Uitdagingen en oplossingen
- Gedetailleerd en grondig

**Eindgebruikers**
- Wat is erin voor hen
- Hoe het te gebruiken
- Simple taal
- Praktisch en helder

**Moeilijke Gesprekken**

Wanneer je slecht nieuws moet brengen of tough feedback moet geven:

**Voorbereiding:**
- Wat is de boodschap?
- Welke uitkomst wil je?
- Wat is hun waarschijnlijke reactie?
- Hoe blijf je kalm?

**Het Gesprek:**
1. **Vermeld het issue** (direct en specifiek)
2. **Geef voorbeelden** (concrete feiten)
3. **Luister naar hun perspectief** (oprecht)
4. **Bespreek impact** (op project, team, etc.)
5. **Kom overeen over oplossing** (collaboratief)
6. **Follow up** (documenteer en check in)

**De Sandwich Methode (controversieel)**

Positief → Negatief → Positief

Sommigen zeggen dat dit werkt. Anderen zeggen dat het de boodschap verwarrt.

Beter: Wees direct maar vriendelijk. Begraaf slecht nieuws niet.

**Communicatie Barrières**

Let op:

**Fysieke Barrières:**
- Lawaai, afstand
- Slechte technologie
- Verschillende tijdzones

**Perceptuele Barrières:**
- Aannames
- Stereotypen
- Vorige ervaringen

**Emotionele Barrières:**
- Stress, woede
- Angst, wantrouwen
- Defensieve reacties

**Culturele Barrières:**
- Taalverschillen
- Verschillende normen
- Communicatiestijlen

**Organisatorische Barrières:**
- Hiërarchie
- Silo's
- Informatie hamsteren

**Barrières Overwinnen:**
- Stel vragen
- Check begrip
- Wees bewust van vooroordelen
- Kies juist kanaal
- Creëer veilige omgeving

**Samenvatting**

Effectieve communicatie:
- Volg de 7 C's (Clear, Concise, Concrete, Correct, Coherent, Complete, Courteous)
- Luister actief en empathisch
- Let op je lichaamstaal
- Kies het juiste kanaal
- Pas aan aan je publiek
- Bereid moeilijke gesprekken voor

Je kunt technisch briljant zijn, maar als je niet kunt communiceren, kun je niet leiden.`,
      keyTakeaways: [
        'Follow the 7 Cs: Clear, Concise, Concrete, Correct, Coherent, Complete, Courteous',
        'Listen at Level 5 (Empathic) - understand feelings and meaning, not just words',
        '55% of communication is body language - mind your non-verbal signals',
        'Choose the richest channel possible: face-to-face for sensitive topics, email for documentation',
      ],
      keyTakeawaysNL: [
        'Volg de 7 C\'s: Clear, Concise, Concrete, Correct, Coherent, Complete, Courteous',
        'Luister op Niveau 5 (Empathisch) - begrijp gevoelens en betekenis, niet alleen woorden',
        '55% van communicatie is lichaamstaal - let op je non-verbale signalen',
        'Kies het rijkste kanaal mogelijk: face-to-face voor gevoelige onderwerpen, email voor documentatie',
      ],
      resources: [
        {
          name: 'Communication Channels Guide',
          nameNL: 'Communicatie Kanalen Gids',
          type: 'PDF',
          size: '720 KB',
          description: 'When to use each communication channel',
          descriptionNL: 'Wanneer elk communicatiekanaal te gebruiken',
        },
        {
          name: 'Active Listening Checklist',
          nameNL: 'Actief Luisteren Checklist',
          type: 'PDF',
          size: '340 KB',
          description: 'Practice empathic listening',
          descriptionNL: 'Oefen empathisch luisteren',
        },
      ],
    },
    {
      id: 'lead-l13',
      title: 'Stakeholder Management',
      titleNL: 'Stakeholder Management',
      type: 'video',
      duration: '14:00',
      videoUrl: '',
      transcript: `Projects succeed or fail based on stakeholder support. In this lesson, we'll learn how to identify, analyze, and effectively manage stakeholders.

**What is a Stakeholder?**

Anyone who:
- Is affected by the project
- Can affect the project
- Thinks they're affected by the project!

That last one is important - perception matters.

**Types of Stakeholders**

**Internal:**
- Project team
- Functional managers
- Executives and sponsors
- Other departments

**External:**
- Customers and end users
- Vendors and suppliers
- Regulators
- Partners
- Community

**Stakeholder Identification**

How to find all stakeholders:

**1. Brainstorm**
Who is impacted? Who has influence?

**2. Review Documents**
- Org charts
- Project charter
- Previous projects
- Process maps

**3. Ask Questions**
- "Who else should I talk to?"
- "Who has a vested interest?"
- "Who can block this?"

**4. Categories to Consider**
- Decision makers
- Funders
- Subject matter experts
- End users
- Support functions (IT, HR, Legal, etc.)
- Influencers (formal and informal)

**The Power/Interest Grid**

Classify stakeholders on two dimensions:

\`\`\`
High Power  | MANAGE CLOSELY    | KEEP SATISFIED
            | (High Power,      | (High Power,
            |  High Interest)   |  Low Interest)
            |                   |
------------|-------------------|------------------
Low Power   | KEEP INFORMED     | MONITOR
            | (Low Power,       | (Low Power,
            |  High Interest)   |  Low Interest)
            
            Low Interest        High Interest
\`\`\`

**Manage Closely** (High Power, High Interest)
- Your key stakeholders
- Engage frequently
- Involve in decisions
- Build strong relationships

Examples: Project sponsor, key customer

**Keep Satisfied** (High Power, Low Interest)
- Can impact project but not actively involved
- Keep them informed
- Don't bore them with detail
- Respond quickly to their needs

Examples: Senior executives, regulators

**Keep Informed** (Low Power, High Interest)
- Very interested but limited influence
- Provide information
- Get their feedback
- Can be advocates

Examples: End users, support teams

**Monitor** (Low Power, Low Interest)
- Minimal effort
- General communications
- Watch for changes

Examples: Peripheral departments

**Important:** Stakeholders can move quadrants!

**Stakeholder Analysis**

For each key stakeholder, understand:

**1. What do they care about?**
- Their goals and priorities
- Their concerns and fears
- Their success metrics

**2. What's their current position?**
- Supportive
- Neutral
- Resistant
- Opposed

**3. What influence do they have?**
- Formal authority
- Control over resources
- Expert knowledge
- Relationships and network

**4. What do they need from the project?**
- Information
- Involvement
- Specific deliverables
- Status/recognition

**5. What does the project need from them?**
- Decisions
- Resources
- Expertise
- Support/advocacy

**The Stakeholder Map**

Create a visual showing:
- All stakeholders
- Relationships between them
- Level of support (color code)
- Priority (size)

This helps you see patterns and identify key relationships.

**Engagement Strategies**

**For Supportive Stakeholders:**
- Leverage their support
- Ask them to influence others
- Keep them energized
- Recognize their contributions

**For Neutral Stakeholders:**
- Understand their position
- Provide information
- Address concerns
- Build the case for support

**For Resistant Stakeholders:**
- Listen to objections
- Find common ground
- Address root causes
- Involve them in solutions

**For Opposed Stakeholders:**
- Understand why (really understand)
- Is compromise possible?
- Can you reduce their ability to block?
- May need to escalate

**Communication Planning**

Each stakeholder needs:

**What information?**
- Progress updates
- Decisions needed
- Issues and risks
- Achievements

**How often?**
- Weekly, monthly, quarterly
- Ad-hoc for issues

**What format?**
- Email, meeting, report
- Dashboard, presentation

**What level of detail?**
- Executive summary
- Detailed status
- Technical depth

Create a **Stakeholder Communication Matrix**:

| Stakeholder | Information Needs | Frequency | Format | Owner |
|------------|-------------------|-----------|--------|-------|
| Sponsor | Progress, major decisions | Weekly | Email + Monthly meeting | PM |
| End Users | Features, training | Monthly | Newsletter | BA |

**Building Stakeholder Relationships**

**1. Understand Them**
- What motivates them?
- What's their communication style?
- What are their pressures?

**2. Build Trust**
- Be reliable
- Be honest (especially with bad news)
- Keep commitments
- Admit mistakes

**3. Add Value**
- Help them succeed
- Share relevant information
- Make their life easier
- Recognize their contributions

**4. Manage Expectations**
- Be clear about what's possible
- Under-promise, over-deliver
- Say no when necessary
- Explain trade-offs

**5. Stay Visible**
- Regular touchpoints
- Don't disappear
- Proactive communication
- Face time matters

**Managing Difficult Stakeholders**

**The Micromanager**
- Provide frequent updates
- Give them control where possible
- Set boundaries politely
- Show competence

**The Ghost**
- Make it easy for them
- Be specific about what you need
- Create urgency (deadlines)
- Escalate if blocking

**The Flip-Flopper**
- Document decisions
- Explain consequences of changes
- Use change control process
- Involve them early

**The Underminer**
- Understand their concern
- Address directly
- Get sponsor support
- Keep others informed

**The Overwhelmed**
- Be concise
- Make it easy (one-click decisions)
- Timing matters
- Offer to help

**Stakeholder Escalation**

When to escalate to sponsor:

- Stakeholder blocking progress
- Conflicting demands from multiple stakeholders
- Resource conflicts
- Major scope disagreements
- Your attempts to resolve have failed

**How to escalate:**
1. **State the issue** (facts only)
2. **What you've tried**
3. **Impact of not resolving**
4. **What you need**

**Managing Stakeholder Changes**

Projects evolve. Your stakeholders will too:

**Watch for:**
- New stakeholders joining
- Stakeholders leaving
- Position changes (supporter becomes resistant)
- Power shifts

**When it happens:**
- Update your analysis
- Adjust engagement strategy
- Re-establish relationships
- Communicate changes to team

**Virtual Stakeholder Management**

Remote work changes the game:

**Challenges:**
- Less face time
- Harder to read reactions
- Timezone differences
- Technology barriers

**Solutions:**
- Schedule regular video calls
- Over-communicate
- Use collaboration tools
- Be more explicit
- Build in social time

**Stakeholder Success Metrics**

How do you know it's working?

- **Engagement**: Are they participating?
- **Satisfaction**: Survey feedback positive?
- **Support**: Are they advocating?
- **Decisions**: Are they timely?
- **Escalations**: Decreasing over time?

**Summary**

Stakeholder management is continuous:

1. **Identify** all stakeholders
2. **Analyze** power, interest, and position
3. **Plan** engagement strategy
4. **Communicate** appropriately
5. **Build** relationships
6. **Monitor** and adjust

Key principle: Understand what they need and what they fear. Then address both.

Your project's success depends more on people than on processes.`,
      transcriptNL: `Projecten slagen of falen op basis van stakeholder support. In deze les leren we hoe stakeholders te identificeren, analyseren en effectief te managen.

**Wat is een Stakeholder?**

Iedereen die:
- Beïnvloed wordt door het project
- Het project kan beïnvloeden
- Denkt dat ze beïnvloed worden door het project!

Die laatste is belangrijk - perceptie doet ertoe.

**Types Stakeholders**

**Intern:**
- Projectteam
- Functionele managers
- Executives en sponsors
- Andere afdelingen

**Extern:**
- Klanten en eindgebruikers
- Leveranciers
- Regulators
- Partners
- Gemeenschap

**Stakeholder Identificatie**

Hoe alle stakeholders te vinden:

**1. Brainstorm**
Wie wordt beïnvloed? Wie heeft invloed?

**2. Review Documenten**
- Org charts
- Project charter
- Vorige projecten
- Proces maps

**3. Stel Vragen**
- "Met wie anders moet ik praten?"
- "Wie heeft een belang?"
- "Wie kan dit blokkeren?"

**4. Categorieën om Te Overwegen**
- Besluitvormers
- Financiers
- Subject matter experts
- Eindgebruikers
- Support functies (IT, HR, Legal, etc.)
- Beïnvloeders (formeel en informeel)

**De Macht/Belang Grid**

Classificeer stakeholders op twee dimensies:

\`\`\`
Hoge Macht | MANAGE NAUW      | HOUD TEVREDEN
           | (Hoge Macht,     | (Hoge Macht,
           |  Hoog Belang)    |  Laag Belang)
           |                  |
-----------|------------------|------------------
Lage Macht | HOUD GEÏNFORMEERD| MONITOR
           | (Lage Macht,     | (Lage Macht,
           |  Hoog Belang)    |  Laag Belang)
           
           Laag Belang        Hoog Belang
\`\`\`

**Manage Nauw** (Hoge Macht, Hoog Belang)
- Je belangrijkste stakeholders
- Betrek frequent
- Betrek bij beslissingen
- Bouw sterke relaties

Voorbeelden: Project sponsor, belangrijke klant

**Houd Tevreden** (Hoge Macht, Laag Belang)
- Kunnen project beïnvloeden maar niet actief betrokken
- Houd ze geïnformeerd
- Verveel ze niet met detail
- Reageer snel op hun behoeften

Voorbeelden: Senior executives, regulators

**Houd Geïnformeerd** (Lage Macht, Hoog Belang)
- Zeer geïnteresseerd maar beperkte invloed
- Geef informatie
- Krijg hun feedback
- Kunnen voorvechters zijn

Voorbeelden: Eindgebruikers, support teams

**Monitor** (Lage Macht, Laag Belang)
- Minimale inspanning
- Algemene communicatie
- Let op veranderingen

Voorbeelden: Perifere afdelingen

**Belangrijk:** Stakeholders kunnen van kwadrant veranderen!

**Stakeholder Analyse**

Voor elke belangrijke stakeholder, begrijp:

**1. Waar geven ze om?**
- Hun doelen en prioriteiten
- Hun zorgen en angsten
- Hun succes metrics

**2. Wat is hun huidige positie?**
- Ondersteunend
- Neutraal
- Weerstand
- Tegen

**3. Welke invloed hebben ze?**
- Formele autoriteit
- Controle over resources
- Expert kennis
- Relaties en netwerk

**4. Wat hebben ze nodig van het project?**
- Informatie
- Betrokkenheid
- Specifieke deliverables
- Status/erkenning

**5. Wat heeft het project van hen nodig?**
- Beslissingen
- Resources
- Expertise
- Support/advocacy

**De Stakeholder Map**

Creëer een visual die toont:
- Alle stakeholders
- Relaties tussen hen
- Niveau van support (kleur code)
- Prioriteit (grootte)

Dit helpt je patronen zien en belangrijke relaties identificeren.

**Engagement Strategieën**

**Voor Ondersteunende Stakeholders:**
- Benut hun support
- Vraag ze anderen te beïnvloeden
- Houd ze energiek
- Erken hun bijdragen

**Voor Neutrale Stakeholders:**
- Begrijp hun positie
- Geef informatie
- Pak zorgen aan
- Bouw de case voor support

**Voor Weerstandige Stakeholders:**
- Luister naar bezwaren
- Vind gemeenschappelijke grond
- Pak grondoorzaken aan
- Betrek ze bij oplossingen

**Voor Oppositionele Stakeholders:**
- Begrijp waarom (echt begrijpen)
- Is compromis mogelijk?
- Kun je hun vermogen om te blokkeren verminderen?
- Moet misschien escaleren

**Communicatie Planning**

Elke stakeholder heeft nodig:

**Welke informatie?**
- Voortgang updates
- Benodigde beslissingen
- Issues en risico's
- Prestaties

**Hoe vaak?**
- Wekelijks, maandelijks, kwartaal
- Ad-hoc voor issues

**Welk formaat?**
- Email, meeting, rapport
- Dashboard, presentatie

**Welk niveau van detail?**
- Executive samenvatting
- Gedetailleerde status
- Technische diepte

Creëer een **Stakeholder Communicatie Matrix**:

| Stakeholder | Informatie Behoeften | Frequentie | Formaat | Eigenaar |
|------------|---------------------|------------|---------|----------|
| Sponsor | Voortgang, grote beslissingen | Wekelijks | Email + Maandelijkse meeting | PM |
| Eindgebruikers | Features, training | Maandelijks | Nieuwsbrief | BA |

**Stakeholder Relaties Bouwen**

**1. Begrijp Ze**
- Wat motiveert hen?
- Wat is hun communicatiestijl?
- Wat zijn hun druk?

**2. Bouw Vertrouwen**
- Wees betrouwbaar
- Wees eerlijk (vooral met slecht nieuws)
- Houd commitments
- Geef fouten toe

**3. Voeg Waarde Toe**
- Help ze slagen
- Deel relevante informatie
- Maak hun leven makkelijker
- Erken hun bijdragen

**4. Manage Verwachtingen**
- Wees duidelijk over wat mogelijk is
- Under-promise, over-deliver
- Zeg nee wanneer nodig
- Leg trade-offs uit

**5. Blijf Zichtbaar**
- Regelmatige touchpoints
- Verdwijn niet
- Proactieve communicatie
- Face time is belangrijk

**Moeilijke Stakeholders Managen**

**De Micromanager**
- Geef frequente updates
- Geef ze controle waar mogelijk
- Stel beleefd grenzen
- Toon competentie

**De Ghost**
- Maak het makkelijk voor hen
- Wees specifiek over wat je nodig hebt
- Creëer urgentie (deadlines)
- Escaleer als blokkering

**De Flip-Flopper**
- Documenteer beslissingen
- Leg consequenties van veranderingen uit
- Gebruik change control proces
- Betrek ze vroeg

**De Underminer**
- Begrijp hun zorg
- Pak direct aan
- Krijg sponsor support
- Houd anderen geïnformeerd

**De Overweldigde**
- Wees beknopt
- Maak het makkelijk (one-click beslissingen)
- Timing is belangrijk
- Bied aan te helpen

**Stakeholder Escalatie**

Wanneer te escaleren naar sponsor:

- Stakeholder blokkeert voortgang
- Conflicterende eisen van meerdere stakeholders
- Resource conflicten
- Grote scope meningsverschillen
- Je pogingen om op te lossen hebben gefaald

**Hoe te escaleren:**
1. **Vermeld het issue** (alleen feiten)
2. **Wat je hebt geprobeerd**
3. **Impact van niet oplossen**
4. **Wat je nodig hebt**

**Stakeholder Veranderingen Managen**

Projecten evolueren. Je stakeholders ook:

**Let Op:**
- Nieuwe stakeholders die zich aansluiten
- Stakeholders die vertrekken
- Positie veranderingen (supporter wordt weerstandig)
- Macht verschuivingen

**Wanneer het gebeurt:**
- Update je analyse
- Pas engagement strategie aan
- Herstel relaties
- Communiceer veranderingen aan team

**Virtueel Stakeholder Management**

Remote werk verandert het spel:

**Uitdagingen:**
- Minder face time
- Moeilijker om reacties te lezen
- Tijdzone verschillen
- Technologie barrières

**Oplossingen:**
- Plan regelmatige video calls
- Over-communiceer
- Gebruik collaboratie tools
- Wees meer expliciet
- Bouw sociale tijd in

**Stakeholder Succes Metrics**

Hoe weet je dat het werkt?

- **Betrokkenheid**: Participeren ze?
- **Tevredenheid**: Survey feedback positief?
- **Support**: Zijn ze aan het pleiten?
- **Beslissingen**: Zijn ze tijdig?
- **Escalaties**: Afnemend in de tijd?

**Samenvatting**

Stakeholder management is continu:

1. **Identificeer** alle stakeholders
2. **Analyseer** macht, belang en positie
3. **Plan** engagement strategie
4. **Communiceer** passend
5. **Bouw** relaties
6. **Monitor** en pas aan

Kernprincipe: Begrijp wat ze nodig hebben en wat ze vrezen. Pak dan beide aan.

Je project's succes hangt meer af van mensen dan van processen.`,
      keyTakeaways: [
        'Use Power/Interest Grid: Manage Closely (high power/interest), Keep Satisfied (high power/low interest), Keep Informed (low power/high interest), Monitor (low power/interest)',
        'Understand each stakeholder: what they care about, current position, influence, and what they need',
        'Build relationships through trust, value-add, expectation management, and visibility',
        'Create Stakeholder Communication Matrix: who needs what information, how often, in what format',
      ],
      keyTakeawaysNL: [
        'Gebruik Macht/Belang Grid: Manage Nauw (hoge macht/belang), Houd Tevreden (hoge macht/laag belang), Houd Geïnformeerd (lage macht/hoog belang), Monitor (lage macht/belang)',
        'Begrijp elke stakeholder: waar ze om geven, huidige positie, invloed, en wat ze nodig hebben',
        'Bouw relaties door vertrouwen, waarde toevoegen, verwachtingen managen en zichtbaarheid',
        'Creëer Stakeholder Communicatie Matrix: wie heeft welke informatie nodig, hoe vaak, in welk formaat',
      ],
      resources: [
        {
          name: 'Power/Interest Grid Template',
          nameNL: 'Macht/Belang Grid Template',
          type: 'PPTX',
          size: '520 KB',
          description: 'Map and prioritize your stakeholders',
          descriptionNL: 'Map en prioriteer je stakeholders',
        },
        {
          name: 'Stakeholder Analysis Worksheet',
          nameNL: 'Stakeholder Analyse Werkblad',
          type: 'XLSX',
          size: '380 KB',
          description: 'Comprehensive stakeholder analysis template',
          descriptionNL: 'Uitgebreid stakeholder analyse template',
        },
      ],
    },
    {
      id: 'lead-l14',
      title: 'Negotiation Skills',
      titleNL: 'Onderhandelingsvaardigheden',
      type: 'video',
      duration: '16:00',
      videoUrl: '',
      transcript: `As a project manager, you're constantly negotiating - resources, timelines, scope, priorities. Let's learn how to negotiate effectively.

**What is Negotiation?**

A process where two or more parties with different needs and goals discuss an issue to find a mutually acceptable solution.

You negotiate more than you realize:
- Budget with finance
- Resources with functional managers
- Deadlines with stakeholders
- Scope with product owners
- Priorities with the team

**Types of Negotiations**

**Distributive (Win-Lose)**
- Fixed pie to divide
- Your gain is their loss
- Example: Salary negotiation (traditional view)
- Competitive, positional

**Integrative (Win-Win)**
- Expanding the pie
- Creative problem-solving
- Example: Flexible work arrangements
- Collaborative, interest-based

**Always aim for integrative!**

**The Harvard Negotiation Principles**

From "Getting to Yes" by Fisher and Ury:

**1. Separate People from the Problem**

Focus on issues, not personalities.

Bad: "You're being unreasonable"
Good: "The timeline seems very tight. Let's explore what's driving it."

**2. Focus on Interests, Not Positions**

Understand WHY they want what they want.

Position: "I need 5 developers"
Interest: "I need to deliver this feature by Q2"

Solution might not be 5 developers! Maybe:
- 3 developers + earlier start
- Buy a component instead of building
- Reduce scope
- Extend deadline

**3. Generate Options for Mutual Gain**

Brainstorm solutions together before deciding.

Don't just compromise - get creative!

**4. Use Objective Criteria**

Base decisions on standards, not willpower.

Examples:
- Market rates
- Industry benchmarks
- Past precedent
- Expert opinion
- Company policies

**BATNA: Your Secret Weapon**

**Best Alternative To a Negotiated Agreement**

Before negotiating, know your BATNA:
- What will you do if this negotiation fails?
- What are your alternatives?

Strong BATNA = Negotiating power

Example: Negotiating resources
- BATNA: Descope the project
- Or: Extend the timeline
- Or: Outsource some work

If you have good alternatives, you're not desperate!

**Also know THEIR BATNA!**

If their BATNA is weak, they need this deal more.

**The ZOPA**

**Zone Of Possible Agreement**

The range where both parties can agree.

Your reservation point: Lowest you'll accept
Their reservation point: Highest they'll pay

If these overlap = ZOPA exists!

Example: Budget Negotiation
- You want: $500K minimum
- They budget: $700K maximum
- ZOPA: $500K - $700K

**Negotiation Preparation**

**1. Set Your Goals**
- What do you want? (target)
- What's acceptable? (reservation point)
- What's ideal? (aspiration)

**2. Understand Their Position**
- What do they want?
- Why do they want it?
- What are their constraints?
- What's their BATNA?

**3. Identify Trade-offs**
- What can you give?
- What do you need?
- What's negotiable vs. non-negotiable?

**4. Prepare Your Case**
- Facts and data
- Objective criteria
- Examples and precedents
- Benefits to them

**5. Plan Your Strategy**
- Where to start?
- What to ask for first?
- What concessions can you make?
- What to avoid?

**Negotiation Tactics**

**Opening Moves:**

**Anchor High**
Start with ambitious request (but reasonable)
Sets the tone and expectations

**Active Listening**
Understand before being understood
Ask questions, paraphrase, confirm

**Build Rapport**
Find common ground
Show respect and empathy

**Mid-Negotiation:**

**Make Conditional Concessions**
Never give something for nothing

Bad: "OK, I can move the deadline"
Good: "If we move the deadline, we'd need to reduce scope by 20%"

Use: "If you..., then I..."

**Trade Low-Value for High-Value**
Give up what's cheap for you but valuable to them

Example:
- Cheap for you: Flexible work location
- Valuable to them: Work from anywhere
- Get: Higher priority on features

**Bundle Issues**
Don't negotiate one item at a time

Negotiate the package:
- Budget + Timeline + Resources + Scope

**Ask "What If?"**
"What if we could get you X, would you be willing to Y?"

Tests ideas without committing

**Closing:**

**Summarize Agreement**
Confirm understanding on all points

**Document**
Put it in writing (email at minimum)

**End Positively**
You'll work together again!

**Common Mistakes**

**1. Not Preparing**
Going in blind is a recipe for poor results

**2. Negotiating Against Yourself**
Making concessions without getting anything

**3. Getting Emotional**
Anger, frustration cloud judgment

**4. Accepting First Offer**
Always counter! Even if it's good.

**5. Focusing on Positions**
"I want this!" vs. understanding interests

**6. Splitting the Difference**
Lazy compromise that might satisfy nobody

**7. Not Knowing Your BATNA**
Negotiate from weakness

**8. Revealing Your Position Too Early**
Show your cards too soon

**Dealing with Difficult Negotiators**

**The Bully**
Aggressive, threatening

Response:
- Stay calm
- Don't mirror their behavior
- Focus on facts and standards
- Take a break if needed

**The Staller**
Can't or won't decide

Response:
- Set deadlines
- Make it easy to decide
- Show consequences of delay
- Escalate if necessary

**The Liar**
Gives false information

Response:
- Verify everything
- Document agreements
- Call out inconsistencies gently
- Protect yourself legally

**The Lowballer**
Makes insultingly low offers

Response:
- Don't get offended
- Counter with facts
- Explain your value
- Be prepared to walk

**Cultural Considerations**

Negotiation styles vary by culture:

**Direct vs. Indirect**
- Some cultures say "no" directly
- Others hint or avoid

**Time Orientation**
- Some value speed
- Others value relationship-building first

**Individual vs. Collective**
- Some decide individually
- Others need group consensus

**Power Distance**
- Some expect equality
- Others respect hierarchy

**Be aware and adapt!**

**Virtual Negotiations**

Remote changes dynamics:

**Challenges:**
- Harder to read body language
- Technical issues
- Time zones
- Less rapport

**Best Practices:**
- Use video when possible
- Over-communicate
- Document clearly
- Build extra time for rapport
- Be explicit about agreements

**Negotiation Ethics**

**Always:**
- Be honest about facts
- Keep commitments
- Respect confidentiality
- Act in good faith

**Never:**
- Lie or misrepresent
- Use personal attacks
- Make threats
- Break agreements

Your reputation matters more than any single deal!

**Practice Scenarios**

**Scenario 1: Resource Negotiation**

You need 3 developers for 2 months.
Functional manager says only 1 available.

Approach:
- Understand why (their interest)
- What's driving the need? (your interest)
- Generate options:
  - 2 developers for 3 months?
  - 1 developer + contractor?
  - Reduce scope?
  - Phased delivery?

**Scenario 2: Deadline Negotiation**

Stakeholder wants delivery in 3 months.
Team says 5 months realistic.

Approach:
- Why 3 months? (business reason)
- What's most critical? (priorities)
- Options:
  - MVP in 3 months, full in 5?
  - Add resources?
  - Reduce quality standards?
  - Parallel work streams?

**Summary**

Key principles:
1. **Prepare thoroughly**
2. **Focus on interests, not positions**
3. **Create value before claiming it**
4. **Know your BATNA**
5. **Use objective criteria**
6. **Separate people from problem**

Remember: Best negotiations create value for both sides. Think win-win!`,
      transcriptNL: `Als projectmanager onderhandel je constant - resources, timelines, scope, prioriteiten. Laten we leren hoe effectief te onderhandelen.

**Wat is Onderhandelen?**

Een proces waarbij twee of meer partijen met verschillende behoeften en doelen een issue bespreken om een wederzijds acceptabele oplossing te vinden.

Je onderhandelt meer dan je beseft:
- Budget met finance
- Resources met functionele managers
- Deadlines met stakeholders
- Scope met product owners
- Prioriteiten met het team

**Types Onderhandelingen**

**Distributief (Win-Verlies)**
- Vaste taart om te verdelen
- Jouw winst is hun verlies
- Voorbeeld: Salaris onderhandeling (traditionele visie)
- Competitief, positioneel

**Integratief (Win-Win)**
- De taart vergroten
- Creatief probleemoplossen
- Voorbeeld: Flexibele werk arrangementen
- Collaboratief, interesse-gebaseerd

**Streef altijd naar integratief!**

**De Harvard Onderhandelings Principes**

Van "Getting to Yes" door Fisher en Ury:

**1. Scheid Mensen van het Probleem**

Focus op issues, niet op persoonlijkheden.

Slecht: "Je bent onredelijk"
Goed: "De timeline lijkt erg krap. Laten we verkennen wat het drijft."

**2. Focus op Interesses, Niet Posities**

Begrijp WAAROM ze willen wat ze willen.

Positie: "Ik heb 5 developers nodig"
Interesse: "Ik moet deze feature leveren tegen Q2"

Oplossing is misschien geen 5 developers! Misschien:
- 3 developers + eerdere start
- Koop een component in plaats van bouwen
- Verminder scope
- Verleng deadline

**3. Genereer Opties voor Wederzijdse Winst**

Brainstorm oplossingen samen voor beslissen.

Niet alleen compromitteren - wees creatief!

**4. Gebruik Objectieve Criteria**

Baseer beslissingen op standaarden, niet op wilskracht.

Voorbeelden:
- Markttarieven
- Industrie benchmarks
- Eerdere precedenten
- Expert mening
- Bedrijfsbeleid

**BATNA: Je Geheime Wapen**

**Best Alternative To a Negotiated Agreement**

Voor onderhandelen, ken je BATNA:
- Wat doe je als deze onderhandeling faalt?
- Wat zijn je alternatieven?

Sterke BATNA = Onderhandelingsmacht

Voorbeeld: Resources onderhandelen
- BATNA: Descope het project
- Of: Verleng de timeline
- Of: Outsource wat werk

Als je goede alternatieven hebt, ben je niet wanhopig!

**Ken ook HUN BATNA!**

Als hun BATNA zwak is, hebben ze deze deal meer nodig.

**De ZOPA**

**Zone Of Possible Agreement**

Het bereik waar beide partijen kunnen akkoord gaan.

Jouw reserveringspunt: Laagste dat je accepteert
Hun reserveringspunt: Hoogste dat ze betalen

Als deze overlappen = ZOPA bestaat!

Voorbeeld: Budget Onderhandeling
- Jij wilt: €500K minimum
- Zij budgetteren: €700K maximum
- ZOPA: €500K - €700K

**Onderhandelings Voorbereiding**

**1. Stel Je Doelen**
- Wat wil je? (target)
- Wat is acceptabel? (reserveringspunt)
- Wat is ideaal? (aspiratie)

**2. Begrijp Hun Positie**
- Wat willen ze?
- Waarom willen ze het?
- Wat zijn hun beperkingen?
- Wat is hun BATNA?

**3. Identificeer Trade-offs**
- Wat kun je geven?
- Wat heb je nodig?
- Wat is onderhandelbaar vs. niet-onderhandelbaar?

**4. Bereid Je Case Voor**
- Feiten en data
- Objectieve criteria
- Voorbeelden en precedenten
- Voordelen voor hen

**5. Plan Je Strategie**
- Waar te beginnen?
- Wat eerst te vragen?
- Welke concessies kun je maken?
- Wat te vermijden?

**Onderhandelings Tactieken**

**Opening Zetten:**

**Anchor Hoog**
Begin met ambitieus verzoek (maar redelijk)
Zet de toon en verwachtingen

**Actief Luisteren**
Begrijp voordat je begrepen wordt
Stel vragen, parafraseer, bevestig

**Bouw Rapport**
Vind gemeenschappelijke grond
Toon respect en empathie

**Mid-Onderhandeling:**

**Maak Conditionele Concessies**
Geef nooit iets voor niets

Slecht: "OK, ik kan de deadline verplaatsen"
Goed: "Als we de deadline verplaatsen, moeten we scope met 20% verminderen"

Gebruik: "Als jij..., dan ik..."

**Ruil Lage-Waarde voor Hoge-Waarde**
Geef op wat goedkoop voor jou is maar waardevol voor hen

Voorbeeld:
- Goedkoop voor jou: Flexibele werklocatie
- Waardevol voor hen: Overal werken
- Krijg: Hogere prioriteit op features

**Bundel Issues**
Onderhandel niet één item tegelijk

Onderhandel het pakket:
- Budget + Timeline + Resources + Scope

**Vraag "Wat Als?"**
"Wat als we je X kunnen geven, zou je bereid zijn tot Y?"

Test ideeën zonder te committeren

**Afsluiten:**

**Vat Overeenkomst Samen**
Bevestig begrip op alle punten

**Documenteer**
Zet het op schrift (email minimaal)

**Eindig Positief**
Je werkt weer samen!

**Veelvoorkomende Fouten**

**1. Niet Voorbereiden**
Blind erin gaan is recept voor slechte resultaten

**2. Tegen Jezelf Onderhandelen**
Concessies maken zonder iets te krijgen

**3. Emotioneel Worden**
Woede, frustratie vertroebelen oordeel

**4. Eerste Aanbod Accepteren**
Counter altijd! Zelfs als het goed is.

**5. Focussen op Posities**
"Ik wil dit!" vs. interesses begrijpen

**6. Het Verschil Splitten**
Luie compromis dat niemand tevreden stelt

**7. Je BATNA Niet Kennen**
Onderhandel vanuit zwakte

**8. Je Positie Te Vroeg Onthullen**
Toon je kaarten te snel

**Omgaan met Moeilijke Onderhandelaars**

**De Bully**
Agressief, dreigend

Reactie:
- Blijf kalm
- Spiegel hun gedrag niet
- Focus op feiten en standaarden
- Neem pauze indien nodig

**De Staller**
Kan of wil niet beslissen

Reactie:
- Stel deadlines
- Maak beslissen makkelijk
- Toon consequenties van vertraging
- Escaleer indien nodig

**De Leugenaar**
Geeft valse informatie

Reactie:
- Verifieer alles
- Documenteer overeenkomsten
- Wijs zachtjes op inconsistenties
- Bescherm jezelf juridisch

**De Lowballer**
Maakt beledigend lage aanbiedingen

Reactie:
- Word niet beledigd
- Counter met feiten
- Leg je waarde uit
- Wees bereid te lopen

**Culturele Overwegingen**

Onderhandelingsstijlen variëren per cultuur:

**Direct vs. Indirect**
- Sommige culturen zeggen direct "nee"
- Anderen hinten of vermijden

**Tijdsoriëntatie**
- Sommigen waarderen snelheid
- Anderen waarderen eerst relatie-opbouw

**Individueel vs. Collectief**
- Sommigen beslissen individueel
- Anderen hebben groepsconsensus nodig

**Machtafstand**
- Sommigen verwachten gelijkheid
- Anderen respecteren hiërarchie

**Wees bewust en pas aan!**

**Virtuele Onderhandelingen**

Remote verandert dynamiek:

**Uitdagingen:**
- Moeilijker om lichaamstaal te lezen
- Technische problemen
- Tijdzones
- Minder rapport

**Best Practices:**
- Gebruik video waar mogelijk
- Over-communiceer
- Documenteer duidelijk
- Bouw extra tijd voor rapport
- Wees expliciet over overeenkomsten

**Onderhandelings Ethiek**

**Altijd:**
- Wees eerlijk over feiten
- Houd commitments
- Respecteer vertrouwelijkheid
- Handel te goeder trouw

**Nooit:**
- Lieg of geef verkeerd weer
- Gebruik persoonlijke aanvallen
- Maak bedreigingen
- Breek overeenkomsten

Je reputatie is belangrijker dan elke enkele deal!

**Oefening Scenario's**

**Scenario 1: Resource Onderhandeling**

Je hebt 3 developers nodig voor 2 maanden.
Functionele manager zegt slechts 1 beschikbaar.

Aanpak:
- Begrijp waarom (hun interesse)
- Wat drijft de behoefte? (jouw interesse)
- Genereer opties:
  - 2 developers voor 3 maanden?
  - 1 developer + contractor?
  - Verminder scope?
  - Gefaseerde levering?

**Scenario 2: Deadline Onderhandeling**

Stakeholder wil levering in 3 maanden.
Team zegt 5 maanden realistisch.

Aanpak:
- Waarom 3 maanden? (business reden)
- Wat is meest kritiek? (prioriteiten)
- Opties:
  - MVP in 3 maanden, volledig in 5?
  - Voeg resources toe?
  - Verminder kwaliteitsstandaarden?
  - Parallelle werkstromen?

**Samenvatting**

Kernprincipes:
1. **Bereid grondig voor**
2. **Focus op interesses, niet posities**
3. **Creëer waarde voor claimen**
4. **Ken je BATNA**
5. **Gebruik objectieve criteria**
6. **Scheid mensen van probleem**

Onthoud: Beste onderhandelingen creëren waarde voor beide kanten. Denk win-win!`,
      keyTakeaways: [
        'Know your BATNA (Best Alternative To Negotiated Agreement) - your power comes from alternatives',
        'Focus on interests (why they want it) not positions (what they say they want)',
        'Use Harvard principles: Separate people from problem, focus on interests, generate options, use objective criteria',
        'Make conditional concessions: "If you..., then I..." - never give something for nothing',
      ],
      keyTakeawaysNL: [
        'Ken je BATNA (Best Alternative To Negotiated Agreement) - je macht komt van alternatieven',
        'Focus op interesses (waarom ze het willen) niet posities (wat ze zeggen dat ze willen)',
        'Gebruik Harvard principes: Scheid mensen van probleem, focus op interesses, genereer opties, gebruik objectieve criteria',
        'Maak conditionele concessies: "Als jij..., dan ik..." - geef nooit iets voor niets',
      ],
      resources: [
        {
          name: 'Negotiation Preparation Worksheet',
          nameNL: 'Onderhandelings Voorbereiding Werkblad',
          type: 'DOCX',
          size: '450 KB',
          description: 'Prepare thoroughly for any negotiation',
          descriptionNL: 'Bereid grondig voor op elke onderhandeling',
        },
        {
          name: 'BATNA Analysis Template',
          nameNL: 'BATNA Analyse Template',
          type: 'PDF',
          size: '520 KB',
          description: 'Identify and strengthen your BATNA',
          descriptionNL: 'Identificeer en versterk je BATNA',
        },
      ],
    },
    {
      id: 'lead-l15',
      title: 'Presenting with Impact',
      titleNL: 'Presenteren met Impact',
      type: 'video',
      duration: '12:00',
      videoUrl: '',
      transcript: `Public speaking terrifies most people - more than death! But as a project manager, presenting is unavoidable. Let's learn how to present with confidence and impact.

**Why Presentations Matter**

As a PM, you present constantly:
- Project kickoffs
- Status updates
- Steering committee meetings
- Demo sessions
- Retrospectives
- Executive briefings

Your presentation can make or break:
- Project approval
- Budget allocation
- Team motivation
- Stakeholder confidence

**The Presentation Structure**

Every great presentation has three parts:

**1. Opening (Tell them what you'll tell them)**
- Hook their attention
- State your purpose
- Preview key points

**2. Body (Tell them)**
- Main content
- 3-5 key points
- Evidence and examples

**3. Closing (Tell them what you told them)**
- Summarize key points
- Call to action
- Memorable ending

**The Opening: Hook Them**

You have 30 seconds to grab attention. Use:

**A Shocking Statistic**
"70% of IT projects fail to meet their original goals"

**A Provocative Question**
"What if I told you we could cut costs by 40%?"

**A Story**
"Last quarter, we faced a crisis..."

**A Bold Statement**
"This project will transform how we work"

**NOT: "Good morning, thanks for coming..."**
Boring! Get to the point!

**The Body: Structure Your Content**

**Rule of Three**
People remember threes:
- Past, Present, Future
- Problem, Solution, Benefit
- What, Why, How

**Use Signposts**
Help them follow along:
- "First..."
- "Second..."
- "Finally..."

**Use Transitions**
Connect your points:
- "Therefore..."
- "However..."
- "In addition..."
- "For example..."

**The Pyramid Principle**

Start with the answer, then support it.

Bad:
"We did A, then B, then C, so we should do D"

Good:
"We should do D. Here's why: A, B, C"

Executives especially appreciate this!

**Visual Design**

**Slide Design Principles:**

**1. One Message Per Slide**
Don't cram everything on one slide

**2. Text = Evil**
Use images, charts, diagrams
Maximum 6 words per bullet
Maximum 6 bullets per slide

**3. High Contrast**
Dark text on light background
Or light text on dark background
Never red on green!

**4. Consistent Design**
Same fonts, colors, style
Use a template

**5. Visual Hierarchy**
Most important = biggest/boldest
Support text = smaller

**Data Visualization**

**Choose the Right Chart:**

**Comparison**: Bar chart
**Trend over time**: Line chart
**Parts of whole**: Pie chart
**Relationship**: Scatter plot

**Keep it Simple:**
- Remove gridlines
- Remove background colors
- Label directly (not legend)
- One chart = one message

**Storytelling**

Data doesn't speak for itself. Tell the story!

**The Before-After-Bridge Structure:**

Before: "We were struggling with X"
After: "Now we have Y"
Bridge: "Here's how we got there"

**Use Concrete Examples:**

Bad: "We improved efficiency"
Good: "We reduced processing time from 3 days to 3 hours"

**Show, Don't Just Tell:**

Use:
- Photos
- Screenshots
- Demos
- Videos
- Customer quotes

**Delivery Techniques**

**Voice:**
- **Volume**: Loud enough to be heard
- **Pace**: Slower than conversation
- **Pitch**: Vary for emphasis
- **Pause**: Power of silence

**Body Language:**
- **Posture**: Stand tall, open
- **Movement**: Purposeful, not pacing
- **Gestures**: Natural, not forced
- **Eye Contact**: 3-5 seconds per person

**Don't:**
- Hide behind the podium
- Read your slides
- Fidget or pace
- Say "um" constantly
- Look at floor or ceiling

**Managing Nerves**

Everyone gets nervous. Even professionals!

**Before:**
- Practice out loud (10x minimum)
- Visualize success
- Exercise to burn energy
- Arrive early
- Check tech

**During:**
- Breathe deeply
- Start with something easy
- Focus on message, not yourself
- Remember: Audience wants you to succeed!

**Nervous Habits:**
- Nervous? Channel it into energy!
- Hands shaking? Hold something
- Mind blank? Pause and breathe
- Voice shaking? Slow down

**Handling Questions**

**Types of Questions:**

**Clarification**: "Can you explain X?"
→ Restate more clearly

**Challenge**: "I disagree with Y"
→ Acknowledge, then defend with data

**Off-topic**: "What about Z?"
→ "Good question, but outside our scope today"

**Hostile**: "This will never work!"
→ Stay calm, stick to facts

**Techniques:**

**Pause Before Answering**
Shows you're thinking

**Repeat the Question**
Ensures everyone heard it

**Bridge to Your Message**
"That's a great point. It relates to..."

**Admit If You Don't Know**
"I don't have that data, but I'll follow up"

**Virtual Presentations**

Remote presenting is different:

**Setup:**
- Good lighting (face the window)
- Clean background (or virtual)
- Eye-level camera
- Good microphone
- Test everything!

**Techniques:**
- Look at camera, not screen
- Exaggerate facial expressions
- More energy than in-person
- Pause longer (lag time)
- Check chat regularly
- Use polling/reactions

**Challenges:**
- Can't see body language
- Technical issues
- Distractions
- Zoom fatigue

**Executive Presentations**

Presenting to executives? Special rules:

**1. Bottom Line First**
Answer first, details later

**2. Be Brief**
10 minutes, not 30

**3. Know Your Numbers**
Be ready for deep dives

**4. Show Business Impact**
Not just project status

**5. Have Backup Slides**
Detailed data ready if asked

**6. Anticipate Questions**
Prepare for tough ones

**Common Mistakes**

**1. Too Much Content**
Less is more!

**2. Reading Slides**
Slides are prompts, not script

**3. No Rehearsal**
Practice makes perfect

**4. Bad Timing**
Know your time limit

**5. Ignoring Audience**
Watch for confusion or boredom

**6. Technical Issues**
Always have Plan B

**7. Weak Ending**
End strong, not with "That's all"

**The Powerful Close**

**Don't:**
- "So yeah, that's it"
- "Any questions?" (weak)
- Trail off
- Apologize

**Do:**
- Summarize key points
- Call to action
- Memorable statement
- Thank genuinely

**Examples:**

"To recap: We're on track, under budget, and delivering value. Your decision today determines if we scale this success."

"Three things to remember: 1) We've proven the concept, 2) ROI is 300%, 3) We need your approval to proceed. Who's with me?"

**Summary**

Great presentations:
1. **Structure**: Opening, Body, Close
2. **Content**: Clear message, Rule of 3
3. **Design**: Visual, simple, consistent
4. **Delivery**: Voice, body language, presence
5. **Practice**: Rehearse, rehearse, rehearse!

Remember: Your message matters. Share it with confidence!`,
      transcriptNL: `Publiek spreken maakt de meeste mensen doodsbang - meer dan de dood! Maar als projectmanager is presenteren onvermijdelijk. Laten we leren hoe te presenteren met vertrouwen en impact.

**Waarom Presentaties Belangrijk Zijn**

Als PM presenteer je constant:
- Project kickoffs
- Status updates
- Stuurgroep meetings
- Demo sessies
- Retrospectives
- Executive briefings

Je presentatie kan maken of breken:
- Project goedkeuring
- Budget allocatie
- Team motivatie
- Stakeholder vertrouwen

**De Presentatie Structuur**

Elke geweldige presentatie heeft drie delen:

**1. Opening (Vertel ze wat je ze gaat vertellen)**
- Trek hun aandacht
- Vermeld je doel
- Preview belangrijke punten

**2. Body (Vertel ze)**
- Hoofdinhoud
- 3-5 belangrijke punten
- Bewijs en voorbeelden

**3. Afsluiting (Vertel ze wat je ze vertelde)**
- Vat belangrijke punten samen
- Call to action
- Gedenkwaardige afsluiting

**De Opening: Grijp Ze**

Je hebt 30 seconden om aandacht te grijpen. Gebruik:

**Een Schokkende Statistiek**
"70% van IT projecten faalt om hun oorspronkelijke doelen te halen"

**Een Provocerende Vraag**
"Wat als ik je vertelde dat we kosten met 40% kunnen snijden?"

**Een Verhaal**
"Vorig kwartaal hadden we een crisis..."

**Een Gedurfde Verklaring**
"Dit project zal transformeren hoe we werken"

**NIET: "Goedemorgen, bedankt voor komen..."**
Saai! Kom ter zake!

**De Body: Structureer Je Inhoud**

**Regel van Drie**
Mensen onthouden drietallen:
- Verleden, Heden, Toekomst
- Probleem, Oplossing, Voordeel
- Wat, Waarom, Hoe

**Gebruik Wegwijzers**
Help ze volgen:
- "Ten eerste..."
- "Ten tweede..."
- "Tenslotte..."

**Gebruik Transities**
Verbind je punten:
- "Daarom..."
- "Echter..."
- "Bovendien..."
- "Bijvoorbeeld..."

**Het Piramide Principe**

Begin met het antwoord, ondersteun het dan.

Slecht:
"We deden A, dan B, dan C, dus moeten we D doen"

Goed:
"We moeten D doen. Hier is waarom: A, B, C"

Executives waarderen dit vooral!

**Visueel Ontwerp**

**Slide Ontwerp Principes:**

**1. Eén Boodschap Per Slide**
Prop niet alles op één slide

**2. Tekst = Kwaad**
Gebruik afbeeldingen, grafieken, diagrammen
Maximum 6 woorden per bullet
Maximum 6 bullets per slide

**3. Hoog Contrast**
Donkere tekst op lichte achtergrond
Of lichte tekst op donkere achtergrond
Nooit rood op groen!

**4. Consistent Ontwerp**
Zelfde lettertypen, kleuren, stijl
Gebruik een template

**5. Visuele Hiërarchie**
Meest belangrijk = grootst/vetst
Support tekst = kleiner

**Data Visualisatie**

**Kies de Juiste Grafiek:**

**Vergelijking**: Staafgrafiek
**Trend in tijd**: Lijngrafiek
**Delen van geheel**: Taartdiagram
**Relatie**: Spreidingsdiagram

**Houd Het Simpel:**
- Verwijder rasterlijnen
- Verwijder achtergrondkleuren
- Label direct (geen legenda)
- Eén grafiek = één boodschap

**Storytelling**

Data spreekt niet voor zich. Vertel het verhaal!

**De Voor-Na-Brug Structuur:**

Voor: "We worstelden met X"
Na: "Nu hebben we Y"
Brug: "Hier is hoe we daar kwamen"

**Gebruik Concrete Voorbeelden:**

Slecht: "We verbeterden efficiëntie"
Goed: "We verminderden verwerkingstijd van 3 dagen naar 3 uur"

**Toon, Vertel Niet Alleen:**

Gebruik:
- Foto's
- Screenshots
- Demo's
- Video's
- Klant quotes

**Leverings Technieken**

**Stem:**
- **Volume**: Luid genoeg om gehoord te worden
- **Tempo**: Langzamer dan gesprek
- **Toonhoogte**: Varieer voor nadruk
- **Pauze**: Kracht van stilte

**Lichaamstaal:**
- **Houding**: Sta rechtop, open
- **Beweging**: Doelgericht, niet ijsberen
- **Gebaren**: Natuurlijk, niet geforceerd
- **Oogcontact**: 3-5 seconden per persoon

**Niet:**
- Verbergen achter het podium
- Je slides lezen
- Friemelen of ijsberen
- Constant "eh" zeggen
- Naar vloer of plafond kijken

**Zenuwen Managen**

Iedereen wordt zenuwachtig. Zelfs professionals!

**Voor:**
- Oefen hardop (10x minimum)
- Visualiseer succes
- Sport om energie te verbranden
- Kom vroeg aan
- Check tech

**Tijdens:**
- Adem diep
- Begin met iets makkelijks
- Focus op boodschap, niet jezelf
- Onthoud: Publiek wil dat je slaagt!

**Zenuwachtige Gewoontes:**
- Zenuwachtig? Kanaliseer het in energie!
- Handen trillen? Houd iets vast
- Mind blank? Pauzeer en adem
- Stem trilt? Vertraag

**Vragen Afhandelen**

**Types Vragen:**

**Verduidelijking**: "Kun je X uitleggen?"
→ Herformuleer duidelijker

**Uitdaging**: "Ik ben het oneens met Y"
→ Erken, verdedig dan met data

**Off-topic**: "Wat over Z?"
→ "Goede vraag, maar buiten onze scope vandaag"

**Vijandig**: "Dit zal nooit werken!"
→ Blijf kalm, blijf bij feiten

**Technieken:**

**Pauzeer Voor Antwoorden**
Toont dat je nadenkt

**Herhaal de Vraag**
Zorgt dat iedereen het hoorde

**Brug Naar Je Boodschap**
"Dat is een goed punt. Het relateert aan..."

**Geef Toe Als Je Het Niet Weet**
"Ik heb die data niet, maar ik volg op"

**Virtuele Presentaties**

Remote presenteren is anders:

**Setup:**
- Goede verlichting (kijk naar raam)
- Schone achtergrond (of virtueel)
- Camera op ooghoogte
- Goede microfoon
- Test alles!

**Technieken:**
- Kijk naar camera, niet scherm
- Overdrijf gezichtsuitdrukkingen
- Meer energie dan in-persoon
- Pauzeer langer (lag tijd)
- Check chat regelmatig
- Gebruik polling/reacties

**Uitdagingen:**
- Kan lichaamstaal niet zien
- Technische problemen
- Afleidingen
- Zoom vermoeidheid

**Executive Presentaties**

Presenteren aan executives? Speciale regels:

**1. Bottom Line Eerst**
Antwoord eerst, details later

**2. Wees Kort**
10 minuten, niet 30

**3. Ken Je Cijfers**
Wees klaar voor deep dives

**4. Toon Business Impact**
Niet alleen project status

**5. Heb Backup Slides**
Gedetailleerde data klaar als gevraagd

**6. Anticipeer Vragen**
Bereid voor op lastige

**Veelvoorkomende Fouten**

**1. Te Veel Inhoud**
Minder is meer!

**2. Slides Lezen**
Slides zijn prompts, geen script

**3. Geen Repetitie**
Oefening baart kunst

**4. Slechte Timing**
Ken je tijdslimiet

**5. Publiek Negeren**
Let op verwarring of verveling

**6. Technische Problemen**
Heb altijd Plan B

**7. Zwakke Afsluiting**
Eindig sterk, niet met "Dat was het"

**De Krachtige Afsluiting**

**Niet:**
- "Dus ja, dat was het"
- "Nog vragen?" (zwak)
- Uitdoven
- Verontschuldigen

**Wel:**
- Vat belangrijke punten samen
- Call to action
- Gedenkwaardige verklaring
- Bedank oprecht

**Voorbeelden:**

"Om samen te vatten: We zijn on track, onder budget, en leveren waarde. Jullie beslissing vandaag bepaalt of we dit succes schalen."

"Drie dingen om te onthouden: 1) We hebben het concept bewezen, 2) ROI is 300%, 3) We hebben jullie goedkeuring nodig om door te gaan. Wie doet mee?"

**Samenvatting**

Geweldige presentaties:
1. **Structuur**: Opening, Body, Afsluiting
2. **Inhoud**: Duidelijke boodschap, Regel van 3
3. **Ontwerp**: Visueel, simpel, consistent
4. **Levering**: Stem, lichaamstaal, aanwezigheid
5. **Oefenen**: Repeteer, repeteer, repeteer!

Onthoud: Je boodschap is belangrijk. Deel het met vertrouwen!`,
      keyTakeaways: [
        'Structure: Opening (hook attention), Body (3-5 key points), Closing (call to action)',
        'Rule of Three: People remember threes - use this for structure and key messages',
        'Slides: One message per slide, minimal text (6x6 rule), high contrast, visual not textual',
        'Delivery: Voice variety (pace, pitch, pause), body language (posture, gestures, eye contact), practice 10x',
      ],
      keyTakeawaysNL: [
        'Structuur: Opening (trek aandacht), Body (3-5 belangrijke punten), Afsluiting (call to action)',
        'Regel van Drie: Mensen onthouden drietallen - gebruik dit voor structuur en belangrijke boodschappen',
        'Slides: Eén boodschap per slide, minimale tekst (6x6 regel), hoog contrast, visueel niet tekstueel',
        'Levering: Stem variatie (tempo, toonhoogte, pauze), lichaamstaal (houding, gebaren, oogcontact), oefen 10x',
      ],
      resources: [
        {
          name: 'Presentation Structure Template',
          nameNL: 'Presentatie Structuur Template',
          type: 'PPTX',
          size: '680 KB',
          description: 'Professional presentation template with structure',
          descriptionNL: 'Professioneel presentatie template met structuur',
        },
        {
          name: 'Executive Presentation Checklist',
          nameNL: 'Executive Presentatie Checklist',
          type: 'PDF',
          size: '420 KB',
          description: 'Prepare for high-stakes presentations',
          descriptionNL: 'Bereid voor op high-stakes presentaties',
        },
      ],
    },
    {
      id: 'lead-l16',
      title: 'Certificate',
      titleNL: 'Certificaat',
      type: 'certificate',
      duration: '0:00',
      videoUrl: '',
    },
  ],
};

// ============================================
// EXPORT MODULES
// ============================================
export const leadershipModules: Module[] = [
  module1,
  module2,
  module3,
];

// ============================================
// COURSE DEFINITION
// ============================================
export const leadershipCourse: Course = {
  id: 'leadership-pm',
  title: 'Leadership for Project Managers',
  titleNL: 'Leiderschap voor Projectmanagers',
  description: 'Master leadership styles, emotional intelligence, team dynamics and communication to become an inspiring project leader.',
  descriptionNL: 'Beheers leiderschapsstijlen, emotionele intelligentie, teamdynamiek en communicatie om een inspirerende projectleider te worden.',
  icon: Crown,
  color: BRAND.amber,
  gradient: `linear-gradient(135deg, ${BRAND.amber}, #D97706)`,
  category: 'leadership',
  methodology: 'leadership',
  levels: 3,
  modules: leadershipModules.reduce((total, m) => total + m.lessons.length, 0),
  duration: 30,
  rating: 4.8,
  students: 9234,
  tags: ['Leadership', 'EQ', 'Team Dynamics', 'Communication', 'Conflict Resolution'],
  tagsNL: ['Leiderschap', 'EQ', 'Teamdynamiek', 'Communicatie', 'Conflictoplossing'],
  instructor: instructors.sarah,
  featured: false,
  bestseller: false,
  new: true,
  freeForCustomers: true,
  certificate: true,
  whatYouLearn: [
    'Develop your personal leadership style',
    'Build and lead high-performance teams',
    'Master conflict resolution techniques',
    'Improve stakeholder communication',
    'Lead effectively without formal authority',
  ],
  whatYouLearnNL: [
    'Je persoonlijke leiderschapsstijl ontwikkelen',
    'High-performance teams bouwen en leiden',
    'Conflictoplossingstechnieken beheersen',
    'Stakeholder communicatie verbeteren',
    'Effectief leiden zonder formele autoriteit',
  ],
  requirements: ['Some project management experience', 'Open to self-reflection'],
  requirementsNL: ['Enige projectmanagement ervaring', 'Open voor zelfreflectie'],
  targetAudience: [
    'Project Managers wanting to develop leadership skills',
    'Team Leads transitioning to leadership roles',
    'Aspiring project leaders',
  ],
  targetAudienceNL: [
    'Projectmanagers die leiderschapsvaardigheden willen ontwikkelen',
    'Team Leads die overstappen naar leiderschapsrollen',
    'Aspirant projectleiders',
  ],
  courseModules: leadershipModules,
};

export default leadershipCourse;