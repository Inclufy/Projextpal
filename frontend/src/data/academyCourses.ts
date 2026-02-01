// ============================================
// ACADEMY COURSES - VOLLEDIG GEÏNTEGREERD
// ============================================
// ProjeXtPal Academy - Alle cursussen met volledige content
// 
// INSTALLATIE:
// Kopieer naar: frontend/src/data/academyCourses.ts
// ============================================

// ============================================
// TYPE DEFINITIONS
// ============================================

export interface Resource {
  name: string;
  type: 'PDF' | 'XLSX' | 'DOCX' | 'VIDEO' | 'LINK' | 'PPTX';
  size: string;
  description?: string;
  url?: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}

export interface Assignment {
  title: string;
  description: string;
  deliverables: string[];
  rubric?: { criterion: string; points: number }[];
}

export interface Lesson {
  id: string;
  title: string;
  duration: string;
  videoUrl?: string;
  type?: 'video' | 'quiz' | 'assignment' | 'exam' | 'certificate';
  transcript?: string;
  keyTakeaways?: string[];
  resources?: Resource[];
  quiz?: QuizQuestion[];
  assignment?: Assignment;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  keyTakeaways?: string[];
}

export interface CourseInstructor {
  name: string;
  avatar: string;
  title: string;
  bio: string;
  expertise: string[];
  students: number;
  courses: number;
  rating: number;
}

export interface Course {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  methodology: string;
  icon: string;
  color: string;
  gradient: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  duration: string;
  totalLessons: number;
  price: number;
  originalPrice?: number;
  freeForCustomers: boolean;
  certificate: boolean;
  featured?: boolean;
  bestseller?: boolean;
  rating: number;
  reviewCount: number;
  students: number;
  lastUpdated: string;
  whatYouLearn: string[];
  requirements: string[];
  targetAudience: string[];
  instructor: CourseInstructor;
  modules: Module[];
}

// ============================================
// BRAND CONSTANTS
// ============================================

export const BRAND = {
  name: 'ProjeXtPal',
  tagline: 'Project Management Made Simple',
  academy: 'ProjeXtPal Academy',
  company: 'Inclufy',
  website: 'https://inclufy.com',
  support: 'support@inclufy.com',
  colors: {
    primary: '#8B5CF6',
    secondary: '#7C3AED',
    accent: '#059669',
  },
};

// ============================================
// CATEGORIES
// ============================================

export interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  courseCount?: number;
}

export const categories: Category[] = [
  {
    id: 'project-management',
    name: 'Project Management',
    description: 'Leer projecten plannen, uitvoeren en afsluiten',
    icon: 'Target',
    color: '#8B5CF6',
  },
  {
    id: 'agile',
    name: 'Agile & Scrum',
    description: 'Flexibele en iteratieve methodologieën',
    icon: 'Zap',
    color: '#059669',
  },
  {
    id: 'process-improvement',
    name: 'Procesverbetering',
    description: 'Lean Six Sigma en continue verbetering',
    icon: 'TrendingUp',
    color: '#0891B2',
  },
  {
    id: 'governance',
    name: 'Governance & Compliance',
    description: 'PRINCE2 en formele methodologieën',
    icon: 'Shield',
    color: '#7C3AED',
  },
  {
    id: 'leadership',
    name: 'Leiderschap',
    description: 'Team management en soft skills',
    icon: 'Users',
    color: '#F59E0B',
  },
];

export const getCategoryById = (id: string): Category | undefined => {
  return categories.find(cat => cat.id === id);
};

// ============================================
// DIFFICULTY LEVELS
// ============================================

export const difficultyLevels = ['Beginner', 'Intermediate', 'Advanced'] as const;
export type DifficultyLevel = typeof difficultyLevels[number];

// ============================================
// METHODOLOGIES
// ============================================

export const methodologies = [
  { id: 'generic', name: 'Algemeen', color: '#8B5CF6' },
  { id: 'prince2', name: 'PRINCE2', color: '#7C3AED' },
  { id: 'scrum', name: 'Scrum', color: '#059669' },
  { id: 'kanban', name: 'Kanban', color: '#EC4899' },
  { id: 'leansixsigma', name: 'Lean Six Sigma', color: '#0891B2' },
  { id: 'waterfall', name: 'Waterfall', color: '#0EA5E9' },
  { id: 'agile', name: 'Agile', color: '#F59E0B' },
] as const;

export const getMethodologyById = (id: string) => {
  return methodologies.find(m => m.id === id);
};

// ============================================
// INSTRUCTORS
// ============================================

export const instructors = {
  sarahVanDenBerg: {
    name: 'Dr. Sarah van den Berg',
    avatar: 'SB',
    title: 'PMP, PRINCE2 Practitioner, Senior PM Consultant',
    bio: 'Dr. Sarah van den Berg heeft meer dan 15 jaar ervaring in projectmanagement bij internationale bedrijven zoals Philips, Shell en ING. Ze promoveerde aan de TU Delft op het onderwerp "Agile Transformation in Traditional Organizations".',
    expertise: ['Projectmanagement', 'Agile', 'Change Management', 'Leadership'],
    students: 45000,
    courses: 12,
    rating: 4.9,
  },
  erikVanDerMeer: {
    name: 'Erik van der Meer',
    avatar: 'EM',
    title: 'PRINCE2 Trainer, Accredited Training Organization',
    bio: 'Erik is PRINCE2 trainer bij een geaccrediteerde trainingsorganisatie en heeft meer dan 2.000 professionals opgeleid. Hij werkte 12 jaar als projectmanager bij de Rijksoverheid.',
    expertise: ['PRINCE2', 'MSP', 'P3O', 'Agile PM'],
    students: 28000,
    courses: 8,
    rating: 4.8,
  },
  lisaDeGroot: {
    name: 'Lisa de Groot',
    avatar: 'LG',
    title: 'Professional Scrum Trainer, Agile Coach',
    bio: 'Lisa is Professional Scrum Trainer (PST) bij Scrum.org en heeft meer dan 10 jaar ervaring als Agile Coach bij organisaties als ING, Booking.com en Philips.',
    expertise: ['Scrum', 'Kanban', 'SAFe', 'Agile Leadership'],
    students: 35000,
    courses: 6,
    rating: 4.9,
  },
  markJansen: {
    name: 'Dr. Mark Jansen',
    avatar: 'MJ',
    title: 'Master Black Belt, Lean Six Sigma Consultant',
    bio: 'Dr. Mark Jansen is Master Black Belt met 18 jaar ervaring in procesverbetering bij bedrijven als Philips, ASML en DSM. Hij heeft meer dan €50 miljoen aan besparingen gerealiseerd.',
    expertise: ['Lean Six Sigma', 'Statistical Analysis', 'Change Management'],
    students: 18000,
    courses: 5,
    rating: 4.7,
  },
  peterDeVries: {
    name: 'Ing. Peter de Vries',
    avatar: 'PV',
    title: 'Senior Project Manager, PMP',
    bio: 'Peter heeft 20 jaar ervaring met grote infrastructuur- en IT-projecten bij Rijkswaterstaat, ProRail en grote financiële instellingen.',
    expertise: ['Waterfall', 'PRINCE2', 'Infrastructure Projects', 'Compliance'],
    students: 12000,
    courses: 4,
    rating: 4.6,
  },
  annaBakker: {
    name: 'Anna Bakker',
    avatar: 'AB',
    title: 'Kanban Trainer, Accredited Kanban Trainer (AKT)',
    bio: 'Anna is Accredited Kanban Trainer bij Kanban University en heeft meer dan 50 teams geholpen met Kanban implementaties bij Booking.com, Adyen en diverse scale-ups.',
    expertise: ['Kanban', 'Flow', 'Lean', 'Agile Coaching'],
    students: 15000,
    courses: 4,
    rating: 4.7,
  },
  martijnVanDijk: {
    name: 'Martijn van Dijk',
    avatar: 'MD',
    title: 'Enterprise Agile Coach, ICAgile Authorized Instructor',
    bio: 'Martijn is Enterprise Agile Coach met 15 jaar ervaring in Agile transformaties bij organisaties als ABN AMRO, KLM en Unilever.',
    expertise: ['Agile', 'SAFe', 'Organizational Change', 'Leadership'],
    students: 25000,
    courses: 7,
    rating: 4.8,
  },
};

// ============================================
// COURSE 1: PROJECT MANAGEMENT FUNDAMENTALS
// ============================================

export const projectManagementFundamentals: Course = {
  id: 'pm-fundamentals',
  title: 'Project Management Fundamentals',
  subtitle: 'Complete training voor aspirant projectmanagers',
  description: 'Welkom bij de meest complete introductiecursus voor projectmanagement. In deze praktijkgerichte training leer je alle essentiële vaardigheden om projecten succesvol te plannen, uit te voeren en af te ronden.',
  methodology: 'generic',
  icon: 'Target',
  color: '#8B5CF6',
  gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
  difficulty: 'Beginner',
  language: 'Nederlands',
  duration: '12',
  totalLessons: 26,
  price: 99,
  originalPrice: 199,
  freeForCustomers: true,
  certificate: true,
  featured: true,
  bestseller: true,
  rating: 4.9,
  reviewCount: 2847,
  students: 12453,
  lastUpdated: '2025-01',
  whatYouLearn: [
    'De volledige projectlevenscyclus begrijpen en toepassen',
    'Effectieve projectplannen maken met WBS en Gantt charts',
    'Risico\'s identificeren, analyseren en mitigeren',
    'Stakeholders managen en communicatieplannen opstellen',
    'Teams leiden en motiveren voor optimale prestaties',
    'Projecten succesvol afsluiten met lessons learned',
  ],
  requirements: [
    'Geen voorkennis vereist - we beginnen bij de basis',
    'Motivatie om te leren en praktijkoefeningen te maken',
  ],
  targetAudience: [
    'Aspirant projectmanagers die willen starten in het vak',
    'Team leads die projectverantwoordelijkheid krijgen',
    'Professionals die hun PM skills willen verbeteren',
  ],
  instructor: instructors.sarahVanDenBerg,
  modules: [
    // ==========================================
    // MODULE 1: INTRODUCTIE
    // ==========================================
    {
      id: 'pm-m1',
      title: 'Module 1: Introductie Project Management',
      description: 'De fundamenten: wat zijn projecten, wie is de PM, en welke methodologieën bestaan er?',
      lessons: [
        {
          id: 'pm-l1',
          title: 'Wat is een project?',
          duration: '12:00',
          type: 'video',
          transcript: `Welkom bij de eerste les van de Project Management Fundamentals cursus! Vandaag gaan we het hebben over een fundamentele vraag: wat is eigenlijk een project?

**De Definitie van een Project**

Een project is een tijdelijke onderneming die wordt uitgevoerd om een uniek product, dienst of resultaat te creëren. Laten we deze definitie ontleden:

1. **Tijdelijk**: Elk project heeft een duidelijk begin en einde. Dit is fundamenteel anders dan lopende operaties die doorlopend zijn.

2. **Uniek**: Het resultaat van een project is op een of andere manier nieuw of anders dan wat er al bestaat.

3. **Specifiek resultaat**: Een project levert iets op - dit kan een tastbaar product zijn, maar ook een dienst of een verandering.

**De Triple Constraint (IJzeren Driehoek)**

Elk project wordt beheerst door drie onderling verbonden factoren:

- **Scope** (Omvang): Wat moet er worden opgeleverd?
- **Tijd**: Wanneer moet het klaar zijn?
- **Budget**: Hoeveel mag het kosten?

In het midden staat **Kwaliteit**. Als je aan één zijde trekt, beïnvloedt dat de andere zijden.

**Project vs. Operatie**

| Aspect | Project | Operatie |
|--------|---------|----------|
| Duur | Tijdelijk | Doorlopend |
| Resultaat | Uniek | Repetitief |
| Team | Tijdelijk samengesteld | Vast team |
| Doel | Verandering realiseren | Status quo handhaven |

**Waarom Projectmanagement?**

De statistieken zijn ontnuchterend:
- 70% van de projecten faalt om hun oorspronkelijke doelen te halen
- Gemiddeld worden projecten 27% duurder dan gepland
- 33% van de projecten wordt voortijdig gestopt

De projecten die wel slagen, hebben meestal één ding gemeen: goed projectmanagement.`,
          keyTakeaways: [
            'Een project is tijdelijk, uniek en levert een specifiek resultaat',
            'De Triple Constraint (scope, tijd, budget) bepaalt projectgrenzen',
            'Projecten verschillen fundamenteel van operationele werkzaamheden',
            '70% van projecten faalt zonder goed projectmanagement',
          ],
          resources: [
            { name: 'Infographic: Project vs. Operatie', type: 'PDF', size: '1.2 MB', description: 'Visueel overzicht van de verschillen' },
            { name: 'Template: Project Identificatie Checklist', type: 'PDF', size: '245 KB', description: 'Bepaal of iets een project is' },
          ],
        },
        {
          id: 'pm-l2',
          title: 'De rol van de projectmanager',
          duration: '15:00',
          type: 'video',
          transcript: `Een projectmanager (PM) is de persoon die verantwoordelijk is voor het plannen, uitvoeren en afsluiten van een project. Maar wat houdt dat precies in?

**De Kernverantwoordelijkheden**

1. **Scope Management**: Definiëren wat wel en niet tot het project behoort
2. **Planning & Scheduling**: WBS opstellen, realistische planningen maken
3. **Budgetbeheer**: Kostenramingen maken en budget bewaken
4. **Risicomanagement**: Risico's identificeren en mitigeren
5. **Teammanagement**: Het juiste team samenstellen en leiden
6. **Stakeholder Management**: Verwachtingen managen
7. **Kwaliteitsmanagement**: Kwaliteitseisen definiëren en controleren

**Hard Skills vs. Soft Skills**

**Hard Skills (Technisch):**
- Planningtechnieken (Gantt, PERT, CPM)
- Budgettering en financieel management
- Risico-analyse methoden
- Project management software (MS Project, Jira, etc.)
- Rapportage en documentatie

**Soft Skills (Interpersoonlijk):**
- Communicatie - de belangrijkste!
- Leiderschap zonder formele autoriteit
- Onderhandelen en conflictoplossing
- Probleemoplossend vermogen
- Teambuilding en motivatie

Uit onderzoek blijkt dat soft skills vaak doorslaggevend zijn voor projectsucces.

**De PM als Dienend Leider**

Een moderne visie ziet de PM als een "servant leader":
- Je bent er voor het team, niet andersom
- Je ruimt obstakels uit de weg
- Je creëert een omgeving waarin mensen kunnen excelleren
- Je faciliteert in plaats van dicteert`,
          keyTakeaways: [
            'De PM is verantwoordelijk voor scope, tijd, budget en kwaliteit',
            'Zowel hard skills als soft skills zijn essentieel',
            'Dienend leiderschap is effectiever dan command & control',
            'Er zijn meerdere carrièrepaden naar projectmanagement',
          ],
        },
        {
          id: 'pm-l3',
          title: 'Projectmanagement methodologieën',
          duration: '18:00',
          type: 'video',
          transcript: `Een projectmanagement methodologie is een gestructureerde aanpak voor het managen van projecten. Er zijn veel verschillende methodologieën, elk met eigen sterke punten.

**De Belangrijkste Methodologieën**

**1. Waterfall (Traditioneel)**
- Sequentieel: fasen volgen elkaar lineair op
- Veel upfront planning en documentatie
- Ideaal voor: stabiele requirements, gereguleerde omgevingen, bouw

**2. Agile**
- Iteratief en incrementeel
- Flexibel, omarmt verandering
- Frequente oplevering van werkende producten
- Ideaal voor: software development, veranderende requirements

**3. Scrum**
- Specifiek Agile framework
- Vaste rollen (Product Owner, Scrum Master, Team)
- Sprints van 1-4 weken
- Ideaal voor: productontwikkeling, innovatie

**4. Kanban**
- Focus op flow en visualisatie
- WIP-limieten (Work In Progress)
- Continue flow in plaats van sprints
- Ideaal voor: operations, support, maintenance

**5. PRINCE2**
- Procesgebaseerde methodologie uit het VK
- Duidelijke rollen en verantwoordelijkheden
- Stage-gates voor beslismomenten
- Ideaal voor: overheid, governance-focus

**6. Lean Six Sigma**
- Focus op procesverbetering
- DMAIC cyclus (Define, Measure, Analyze, Improve, Control)
- Data-gedreven besluitvorming
- Ideaal voor: procesoptimalisatie, kwaliteit

**Welke Methodologie Kiezen?**

Factoren om te overwegen:
- Projecttype en industrie
- Requirements stabiliteit
- Organisatiecultuur
- Team ervaring
- Regelgeving en compliance`,
          keyTakeaways: [
            'Methodologieën bieden structuur en gemeenschappelijke taal',
            'Waterfall is sequentieel; Agile is iteratief en flexibel',
            'PRINCE2 focust op governance; Lean Six Sigma op procesverbetering',
            'Kies de methodologie die past bij je project en organisatie',
          ],
        },
        {
          id: 'pm-l4',
          title: 'De projectlevenscyclus',
          duration: '14:00',
          type: 'video',
          transcript: `Elk project doorloopt een levenscyclus - een reeks fasen van begin tot eind. Het begrijpen van deze fasen is essentieel voor effectief projectmanagement.

**De Vijf Fasen**

**Fase 1: Initiatie**
- Projectidee of -behoefte identificeren
- Haalbaarheid onderzoeken
- Projectcharter opstellen
- Stakeholders identificeren
- Go/no-go beslissing

**Fase 2: Planning**
- Scope detailleren (WBS)
- Planning opstellen
- Budget vaststellen
- Risico's analyseren
- Communicatieplan maken

**Fase 3: Uitvoering**
- Werk uitvoeren volgens plan
- Team aansturen en coachen
- Stakeholders managen
- Kwaliteit bewaken

**Fase 4: Monitoring & Control**
- Voortgang meten vs. baseline
- Afwijkingen identificeren
- Corrigerende acties nemen
- Veranderingen managen

**Fase 5: Afsluiting**
- Formele acceptatie verkrijgen
- Lessons learned documenteren
- Team vrijgeven
- Projectdocumentatie archiveren

**Gate Reviews**

Tussen fasen zitten vaak "gates" - beslismomenten waar wordt bepaald of het project mag doorgaan.`,
          keyTakeaways: [
            'Vijf fasen: Initiatie, Planning, Uitvoering, Monitoring, Afsluiting',
            'De planningsfase bepaalt grotendeels het projectsucces',
            'Monitoring loopt parallel aan uitvoering',
            'Afsluiting is cruciaal maar wordt vaak verwaarloosd',
          ],
        },
        {
          id: 'pm-l5',
          title: 'Quiz: Basisconcepten',
          duration: '15:00',
          type: 'quiz',
          quiz: [
            {
              id: 'q1',
              question: 'Wat maakt iets GEEN project?',
              options: ['Het is tijdelijk', 'Het levert een uniek resultaat', 'Het is een doorlopende, repetitieve activiteit', 'Het heeft een duidelijk begin en einde'],
              correctAnswer: 2,
              explanation: 'Een doorlopende, repetitieve activiteit is een operatie, geen project. Projecten zijn per definitie tijdelijk en uniek.',
            },
            {
              id: 'q2',
              question: 'Welke drie factoren vormen de "Triple Constraint"?',
              options: ['Mensen, Processen, Technologie', 'Scope, Tijd, Budget', 'Kwaliteit, Risico, Communicatie', 'Planning, Uitvoering, Controle'],
              correctAnswer: 1,
              explanation: 'De Triple Constraint (ook wel IJzeren Driehoek) bestaat uit Scope, Tijd en Budget. Kwaliteit wordt beïnvloed door de balans tussen deze drie.',
            },
            {
              id: 'q3',
              question: 'Welke methodologie is het meest geschikt voor projecten met onzekere of veranderende requirements?',
              options: ['Waterfall', 'PRINCE2', 'Agile', 'Lean Six Sigma'],
              correctAnswer: 2,
              explanation: 'Agile is specifiek ontworpen voor situaties met onzekerheid en verandering. Het omarmt verandering en werkt iteratief.',
            },
            {
              id: 'q4',
              question: 'In welke fase van de projectlevenscyclus wordt het projectcharter opgesteld?',
              options: ['Planning', 'Initiatie', 'Uitvoering', 'Afsluiting'],
              correctAnswer: 1,
              explanation: 'Het projectcharter wordt opgesteld in de Initiatiefase als een van de eerste formele documenten die het project autoriseert.',
            },
            {
              id: 'q5',
              question: 'Wat is een kenmerk van "dienend leiderschap"?',
              options: ['De PM geeft strikte opdrachten aan het team', 'De PM ruimt obstakels uit de weg zodat het team kan presteren', 'De PM neemt alle beslissingen alleen', 'De PM focust primair op de eigen carrière'],
              correctAnswer: 1,
              explanation: 'Dienend leiderschap betekent dat je als PM ten dienste staat van het team. Je faciliteert hun succes door obstakels weg te nemen.',
            },
            {
              id: 'q6',
              question: 'Wat is het belangrijkste verschil tussen een project en een operatie?',
              options: ['Projecten zijn altijd groter', 'Projecten zijn tijdelijk, operaties zijn doorlopend', 'Operaties hebben geen budget', 'Projecten hebben geen team nodig'],
              correctAnswer: 1,
              explanation: 'Het fundamentele verschil is dat projecten tijdelijk zijn met een duidelijk begin en einde, terwijl operaties doorlopend zijn.',
            },
            {
              id: 'q7',
              question: 'Welke soft skill is het meest cruciaal voor een projectmanager?',
              options: ['Excel beheersing', 'Communicatie', 'Programmeren', 'Boekhouden'],
              correctAnswer: 1,
              explanation: 'Communicatie is de belangrijkste soft skill. PM\'s besteden tot 90% van hun tijd aan communicatie met team, stakeholders en management.',
            },
            {
              id: 'q8',
              question: 'Wat gebeurt er in de Monitoring & Control fase?',
              options: ['Het project wordt gestart', 'De planning wordt gemaakt', 'Voortgang wordt gemeten en bijgestuurd', 'Het project wordt afgesloten'],
              correctAnswer: 2,
              explanation: 'In de Monitoring & Control fase wordt de voortgang gemeten tegen de baseline en worden corrigerende acties genomen bij afwijkingen.',
            },
            {
              id: 'q9',
              question: 'Wat is GEEN onderdeel van de Triple Constraint?',
              options: ['Scope', 'Team', 'Tijd', 'Budget'],
              correctAnswer: 1,
              explanation: 'De Triple Constraint bestaat uit Scope, Tijd en Budget. Team is een belangrijke factor, maar geen onderdeel van de Triple Constraint.',
            },
            {
              id: 'q10',
              question: 'Waarom is de afsluitingsfase zo belangrijk?',
              options: ['Om een feestje te organiseren', 'Om lessons learned vast te leggen en resources vrij te geven', 'Om het volgende project te starten', 'De afsluitingsfase is niet zo belangrijk'],
              correctAnswer: 1,
              explanation: 'De afsluitingsfase is cruciaal voor het vastleggen van lessons learned, formele acceptatie, en het vrijgeven van resources voor andere projecten.',
            },
          ],
        },
      ],
    },
    // ==========================================
    // MODULE 2: PROJECT INITIATIE
    // ==========================================
    {
      id: 'pm-m2',
      title: 'Module 2: Project Initiatie',
      description: 'Hoe start je een project goed? Van stakeholder analyse tot business case.',
      lessons: [
        {
          id: 'pm-l6',
          title: 'Het projectcharter opstellen',
          duration: '16:00',
          type: 'video',
          transcript: `Het projectcharter is het formele document dat een project autoriseert en de projectmanager de bevoegdheid geeft om resources in te zetten.

**Onderdelen van een Projectcharter:**

1. **Projectnaam en Identificatie**
2. **Projectachtergrond**: Waarom dit project? Welk probleem of kans?
3. **Projectdoelstellingen**: SMART geformuleerd
4. **Scope**: Wat is in-scope en wat is expliciet out-of-scope
5. **Belangrijkste Deliverables**: Wat wordt er opgeleverd?
6. **Hoog-niveau Planning**: Belangrijke mijlpalen
7. **Budget**: Indicatieve kosten
8. **Belangrijkste Stakeholders**
9. **Risico's en Aannames**
10. **Goedkeuring/Handtekeningen**

**SMART Doelstellingen:**
- **S**pecifiek: Duidelijk en concreet
- **M**eetbaar: Kwantificeerbaar
- **A**cceptabel: Haalbaar en gedragen
- **R**ealistisch: Met beschikbare middelen
- **T**ijdgebonden: Met deadline

**Voorbeeld SMART Doel:**
"Het nieuwe CRM-systeem implementeren voor de sales afdeling (50 gebruikers) tegen 1 maart 2025, binnen een budget van €150.000, met een gebruikerstevredenheid van minimaal 4/5."`,
          keyTakeaways: [
            'Het projectcharter autoriseert het project formeel',
            'Bevat: doelen, scope, budget, planning, stakeholders, risico\'s',
            'Out-of-scope definiëren is net zo belangrijk als in-scope',
            'Houd het kort: 2-5 pagina\'s is voldoende',
          ],
          resources: [
            { name: 'Projectcharter Template', type: 'DOCX', size: '145 KB', description: 'Volledig ingevuld voorbeeld' },
            { name: 'SMART Doelen Werkblad', type: 'PDF', size: '95 KB', description: 'Hulpmiddel voor SMART formulering' },
          ],
        },
        {
          id: 'pm-l7',
          title: 'Stakeholder analyse',
          duration: '14:00',
          type: 'video',
          transcript: `"Stakeholders kunnen je project maken of breken." Dit is een van de belangrijkste lessen in projectmanagement.

**Wat is een Stakeholder?**

Iedereen die het project beïnvloedt of erdoor beïnvloed wordt:
- Opdrachtgever/Sponsor
- Eindgebruikers
- Teamleden
- Management
- Leveranciers
- Klanten
- Regelgevers

**De Power/Interest Matrix**

|               | Laag Belang       | Hoog Belang          |
|---------------|-------------------|----------------------|
| Hoge Macht    | Tevreden houden   | Actief managen       |
| Lage Macht    | Monitoren         | Geïnformeerd houden  |

**Strategieën per Kwadrant:**

- **Actief managen**: Nauw betrekken, regelmatig overleg, input vragen
- **Tevreden houden**: Niet te veel belasten, wel informeren over voortgang
- **Geïnformeerd houden**: Regelmatige updates, nieuwsbrieven
- **Monitoren**: Minimale inspanning, wel in de gaten houden

**Stakeholder Register:**
Documenteer voor elke stakeholder:
- Naam en rol
- Belang bij het project
- Verwachtingen
- Potentiële invloed (positief/negatief)
- Communicatiebehoefte
- Strategie`,
          keyTakeaways: [
            'Stakeholders kunnen je project maken of breken',
            'Analyseer stakeholders op macht, belang en houding',
            'De Power/Interest matrix helpt bij het prioriteren',
            'Stakeholder analyse is een doorlopend proces',
          ],
          resources: [
            { name: 'Stakeholder Register Template', type: 'XLSX', size: '85 KB', description: 'Template met voorbeelden' },
            { name: 'Power/Interest Matrix Template', type: 'PDF', size: '220 KB', description: 'Visueel analyse hulpmiddel' },
          ],
        },
        {
          id: 'pm-l8',
          title: 'Business case ontwikkelen',
          duration: '15:00',
          type: 'video',
          transcript: `De business case rechtvaardigt de investering in het project. Het beantwoordt de vraag: "Waarom zouden we dit project doen?"

**Onderdelen van een Business Case:**

1. **Executive Summary**
2. **Strategische Context**: Hoe past dit in de organisatiestrategie?
3. **Probleem of Kans**: Wat is de aanleiding?
4. **Opties Analyse**: Welke alternatieven zijn er? (inclusief "niets doen")
5. **Kosten**: Investeringskosten en operationele kosten
6. **Baten**: Kwantitatief en kwalitatief
7. **Financiële Analyse**: ROI, NPV, Payback period
8. **Risico's**: Belangrijkste bedreigingen
9. **Aanbeveling**: Welke optie en waarom

**Financiële Metrics:**

**ROI (Return on Investment)**
ROI = (Baten - Kosten) / Kosten × 100%

Voorbeeld: Investering €100.000, opbrengst €150.000
ROI = (150.000 - 100.000) / 100.000 × 100% = 50%

**Payback Period**
Hoe lang duurt het voordat de investering is terugverdiend?
Payback = Investering / Jaarlijkse besparing

**NPV (Net Present Value)**
Houdt rekening met tijdswaarde van geld.
NPV > 0 = winstgevend project`,
          keyTakeaways: [
            'De business case rechtvaardigt de investering',
            'Vergelijk altijd meerdere opties inclusief "niets doen"',
            'Gebruik financiële metrics: ROI, payback, NPV',
            'Wees realistisch over kosten en baten',
          ],
          resources: [
            { name: 'Business Case Template', type: 'DOCX', size: '178 KB', description: 'Uitgebreid template met instructies' },
            { name: 'ROI Calculator', type: 'XLSX', size: '95 KB', description: 'Automatische berekeningen' },
          ],
        },
        {
          id: 'pm-l9',
          title: 'Scope definitie',
          duration: '12:00',
          type: 'video',
          transcript: `Scope is de totale omvang van het werk dat nodig is om de projectdoelen te bereiken.

**Product Scope vs. Project Scope**

- **Product Scope**: De features en functies van het eindproduct
- **Project Scope**: Al het werk dat nodig is om dat product op te leveren

**De Scope Statement**

Een formeel document dat beschrijft:
1. Product Beschrijving
2. Deliverables
3. Acceptatiecriteria
4. Exclusions (wat nadrukkelijk NIET in scope is)
5. Constraints (beperkingen)
6. Assumptions (aannames)

**Scope Creep Voorkomen**

Scope creep = ongecontroleerde uitbreiding van de scope

Voorkomen door:
- Duidelijke scope documentatie
- Formeel change control proces
- Regelmatige scope reviews
- "Out of scope" discussies vastleggen`,
          keyTakeaways: [
            'Scope = wat wel en niet tot het project behoort',
            'Onderscheid product scope van project scope',
            'Out-of-scope expliciet benoemen voorkomt scope creep',
            'De scope statement is de formele vastlegging',
          ],
        },
        {
          id: 'pm-l10',
          title: 'Praktijkopdracht: Project Charter',
          duration: '45:00',
          type: 'assignment',
          assignment: {
            title: 'Stel een Projectcharter op',
            description: `Stel een volledig projectcharter op voor het volgende scenario:

**Scenario:** Je bent aangesteld als projectmanager bij een middelgroot e-commerce bedrijf. Het management wil een nieuw warehouse management systeem (WMS) implementeren om de orderverwerking te verbeteren.

Huidige situatie:
- 500 orders per dag, groeiend naar verwachting 800 in 2 jaar
- Huidige pick-error rate: 5%
- Gemiddelde orderverwerkingstijd: 45 minuten
- Budget indicatie: €150.000 - €200.000
- Gewenste go-live: binnen 8 maanden`,
            deliverables: [
              'Volledig ingevuld projectcharter (3-5 pagina\'s)',
              'Stakeholder overzicht met eerste analyse',
            ],
            rubric: [
              { criterion: 'SMART doelstellingen correct geformuleerd', points: 20 },
              { criterion: 'Scope helder afgebakend (in/out)', points: 20 },
              { criterion: 'Realistische planning en budget', points: 15 },
              { criterion: 'Stakeholders geïdentificeerd met analyse', points: 15 },
              { criterion: 'Risico\'s relevant en concreet', points: 15 },
              { criterion: 'Professionele presentatie en taal', points: 15 },
            ],
          },
        },
      ],
    },
    // ==========================================
    // MODULE 3: PLANNING
    // ==========================================
    {
      id: 'pm-m3',
      title: 'Module 3: Planning',
      description: 'WBS, Gantt charts, resource planning, budgettering en risicomanagement.',
      lessons: [
        {
          id: 'pm-l11',
          title: 'Work Breakdown Structure (WBS)',
          duration: '18:00',
          type: 'video',
          transcript: `De Work Breakdown Structure (WBS) is een hiërarchische decompositie van het totale werk dat het projectteam moet uitvoeren.

**Structuur van een WBS:**

Niveau 1: Project
└── Niveau 2: Fases of Hoofddeliverables
    └── Niveau 3: Deliverables
        └── Niveau 4: Werkpakketten

**De 100% Regel**

De WBS moet 100% van het werk bevatten - niet meer, niet minder.
- Alles wat niet in de WBS staat, is out of scope
- Elk werkpakket draagt bij aan een deliverable

**Deliverable-Georiënteerd**

Focus op WAT (deliverables), niet HOE (activiteiten):
- Goed: "Testrapport" (deliverable)
- Minder: "Testen uitvoeren" (activiteit)

**De 8-80 Regel**

Werkpakketten moeten:
- Minimaal 8 uur werk zijn
- Maximaal 80 uur (10 dagen) werk zijn
- Door één persoon of team kunnen worden uitgevoerd

**WBS Dictionary**

Elk werkpakket wordt beschreven in de WBS Dictionary:
- ID en naam
- Beschrijving
- Verantwoordelijke
- Geschatte duur en kosten
- Acceptatiecriteria`,
          keyTakeaways: [
            'De WBS is de basis voor alle planning en control',
            'Volg de 100% regel: alle werk moet erin zitten',
            'Gebruik deliverables (wat), geen activiteiten (hoe)',
            'Werkpakketten van 8-80 uur zijn ideaal',
          ],
          resources: [
            { name: 'WBS Template Excel', type: 'XLSX', size: '125 KB', description: 'Template met voorbeeldstructuur' },
            { name: 'WBS Voorbeelden', type: 'PDF', size: '1.8 MB', description: 'Voorbeelden uit verschillende industrieën' },
          ],
        },
        {
          id: 'pm-l12',
          title: 'Gantt charts maken',
          duration: '20:00',
          type: 'video',
          transcript: `De Gantt chart is een visuele weergave van de projectplanning, vernoemd naar Henry Gantt (1910).

**Elementen van een Gantt Chart:**

- **Taken/Activiteiten**: Verticale lijst links
- **Tijdlijn**: Horizontaal bovenaan
- **Balken**: Duur van elke taak
- **Afhankelijkheden**: Pijlen tussen taken
- **Mijlpalen**: Diamanten voor belangrijke momenten
- **Resources**: Wie doet wat

**Types Afhankelijkheden:**

1. **Finish-to-Start (FS)**: Taak B start als A klaar is (meest voorkomend)
2. **Start-to-Start (SS)**: Taak B start als A start
3. **Finish-to-Finish (FF)**: Taak B eindigt als A eindigt
4. **Start-to-Finish (SF)**: Zeldzaam

**Lead en Lag:**
- **Lead**: Overlap - B start X dagen vóór A eindigt
- **Lag**: Wachttijd - B start X dagen ná A eindigt

**Het Kritieke Pad**

Het kritieke pad is de langste reeks afhankelijke activiteiten die de minimale projectduur bepaalt.

Kenmerken:
- Taken op het kritieke pad hebben geen slack/float
- Vertraging op kritiek pad = vertraging project
- Focus je monitoring op kritieke taken`,
          keyTakeaways: [
            'Gantt charts visualiseren planning en afhankelijkheden',
            'Het kritieke pad bepaalt de minimale projectduur',
            'Er zijn vier soorten afhankelijkheden: FS, SS, FF, SF',
            'Update de Gantt regelmatig voor actueel beeld',
          ],
        },
        {
          id: 'pm-l13',
          title: 'Resource planning',
          duration: '14:00',
          type: 'video',
          transcript: `Resource planning zorgt dat de juiste mensen en middelen op het juiste moment beschikbaar zijn.

**De RACI Matrix**

Voor elke deliverable/activiteit bepalen:
- **R**esponsible: Wie voert het werk uit?
- **A**ccountable: Wie is eindverantwoordelijk? (altijd maar 1!)
- **C**onsulted: Wie wordt om input gevraagd?
- **I**nformed: Wie wordt geïnformeerd over resultaat?

**Resource Leveling**

Als resources overbelast zijn:
1. Identificeer de overbelasting
2. Schuif niet-kritieke taken
3. Voeg resources toe
4. Pas scope aan

**Resource Histogram**

Visuele weergave van resource-inzet over tijd:
- X-as: tijd
- Y-as: uren/FTE
- Lijn: beschikbare capaciteit

**Tips:**
- Plan niet op 100% - houd rekening met meetings, admin, ziekte
- 80% is een realistische planningsnorm
- Betrek teamleden bij schattingen`,
          keyTakeaways: [
            'Resource planning matcht benodigde met beschikbare capaciteit',
            'Resource leveling lost overbelasting op door taken te schuiven',
            'De RACI matrix verduidelijkt verantwoordelijkheden',
            'Plan op 80% - houd buffer voor onverwachts',
          ],
          resources: [
            { name: 'RACI Matrix Template', type: 'XLSX', size: '78 KB', description: 'Template met instructies' },
          ],
        },
        {
          id: 'pm-l14',
          title: 'Budget en kostenraming',
          duration: '16:00',
          type: 'video',
          transcript: `**Methoden voor Kostenraming:**

**1. Analoge Raming**
Gebaseerd op vergelijkbare eerdere projecten.
Pro: Snel, weinig detail nodig
Con: Afhankelijk van beschikbare historische data

**2. Parametrische Raming**
Gebruik van statistische relaties: €/m², €/uur, €/gebruiker
Pro: Objectief, schaalbaar
Con: Vereist betrouwbare parameters

**3. Bottom-up Raming**
Elke activiteit apart schatten en optellen.
Pro: Meest nauwkeurig
Con: Tijdrovend, vereist gedetailleerde WBS

**4. Driepuntsschatting**
PERT: (Optimistisch + 4×Meest Waarschijnlijk + Pessimistisch) / 6

**Budget Opbouw:**

1. Directe arbeidskosten
2. Materiaal en inkoop
3. Externe kosten (consultants, licenties)
4. Reis- en verblijfkosten
5. Overhead
6. **Contingency** (5-15% voor bekende risico's)
7. **Management Reserve** (5-10% voor onbekende risico's)`,
          keyTakeaways: [
            'Bottom-up is het nauwkeurigst maar meest tijdrovend',
            'Bouw contingency en management reserve in',
            'Earned Value Management meet kosten én voortgang',
            'Documenteer altijd je aannames',
          ],
          resources: [
            { name: 'Kostenraming Template', type: 'XLSX', size: '189 KB', description: 'Template met formules' },
          ],
        },
        {
          id: 'pm-l15',
          title: 'Risicomanagement',
          duration: '22:00',
          type: 'video',
          transcript: `**Het Risicomanagement Proces:**

**1. Risico Identificatie**
Technieken:
- Brainstorming met team
- Interviews met experts
- Checklists van eerdere projecten
- SWOT analyse
- Aannames analyseren

**2. Risico Analyse**

**Kwalitatief:**
Kans × Impact = Risicoscore

Kans: 1-5 (zeer laag tot zeer hoog)
Impact: 1-5 (verwaarloosbaar tot catastrofaal)

Score interpretatie:
- 15-25: Hoog risico - actie vereist
- 8-14: Medium risico - actief monitoren
- 1-7: Laag risico - accepteren

**3. Risico Response Strategieën**

**Voor bedreigingen:**
- **Vermijden**: Elimineer de oorzaak
- **Overdragen**: Verzekering, uitbesteden
- **Mitigeren**: Reduceer kans of impact
- **Accepteren**: Bewust niets doen

**Voor kansen:**
- **Exploiteren**: Zorg dat het gebeurt
- **Delen**: Partner die kan helpen
- **Versterken**: Verhoog kans/impact
- **Accepteren**: Neem het mee als het komt

**4. Risico Monitoring**
- Regelmatige risico reviews
- Risico triggers monitoren
- Nieuwe risico's identificeren`,
          keyTakeaways: [
            'Risico\'s hebben kans én impact - beide beoordelen',
            'Vier response strategieën: vermijden, overdragen, mitigeren, accepteren',
            'Het risicoregister is het centrale document',
            'Risicomanagement is continu, niet eenmalig',
          ],
          resources: [
            { name: 'Risicoregister Template', type: 'XLSX', size: '145 KB', description: 'Volledig template met voorbeelden' },
            { name: 'Risico Response Strategieën', type: 'PDF', size: '180 KB', description: 'Overzicht van alle strategieën' },
          ],
        },
      ],
    },
    // ==========================================
    // MODULE 4: UITVOERING & MONITORING
    // ==========================================
    {
      id: 'pm-m4',
      title: 'Module 4: Uitvoering & Monitoring',
      description: 'Teamleiderschap, communicatie, Earned Value en change control.',
      lessons: [
        {
          id: 'pm-l16',
          title: 'Teams leiden en motiveren',
          duration: '18:00',
          type: 'video',
          transcript: `De beste planning ter wereld faalt als je team niet gemotiveerd is. In deze les leer je hoe je teams leidt naar high performance.

**Tuckman's Model voor Teamontwikkeling:**

**1. Forming (Vorming)**
- Team komt samen
- Mensen zijn beleefd en voorzichtig
- Veel onzekerheid over rollen
- PM rol: Geef duidelijkheid, stel kaders

**2. Storming (Conflict)**
- Conflicten ontstaan
- Verschillende werkstijlen botsen
- Frustratie over voortgang
- PM rol: Faciliteer constructieve conflictoplossing

**3. Norming (Normering)**
- Team vindt zijn ritme
- Normen en afspraken ontstaan
- Vertrouwen groeit
- PM rol: Versterk positieve patronen

**4. Performing (Presteren)**
- Team is high-performing
- Autonomie en eigenaarschap
- Problemen worden zelf opgelost
- PM rol: Faciliteer, haal obstakels weg

**Conflictmanagement (Thomas-Kilmann):**

- **Competing**: Win-lose, voor crisissituaties
- **Accommodating**: Lose-win, bij onbelangrijke issues
- **Avoiding**: Lose-lose, als emoties moeten afkoelen
- **Compromising**: Half-half, bij tijdsdruk
- **Collaborating**: Win-win, voor belangrijke issues met tijd`,
          keyTakeaways: [
            'Teams doorlopen fasen: Forming, Storming, Norming, Performing',
            'Intrinsieke motivatie werkt beter dan extrinsieke',
            'Conflictstijlen moeten passen bij de situatie',
            'Virtuele teams vragen extra aandacht voor communicatie',
          ],
        },
        {
          id: 'pm-l17',
          title: 'Stakeholder communicatie',
          duration: '16:00',
          type: 'video',
          transcript: `PM's besteden tot 90% van hun tijd aan communicatie. Effectieve communicatie is cruciaal.

**Het Communicatieplan:**

Voor elke stakeholder(groep) bepalen:
- **WIE** moet wat weten?
- **WAT** moeten ze weten?
- **WANNEER** moeten ze het weten?
- **HOE** communiceren we? (kanaal)
- **WIE** is verantwoordelijk?

**Soorten Projectcommunicatie:**

1. **Statusrapportages**: Regelmatige voortgangsrapportages
   - Overall status (RAG: Red/Amber/Green)
   - Voortgang vs. planning
   - Issues en risico's
   - Beslissingen nodig

2. **Stuurgroepvergaderingen**: Formele beslismomenten

3. **Team Meetings**: Dagelijkse/wekelijkse afstemming

4. **Escalaties**: Als issues je mandaat overstijgen

**Moeilijke Boodschappen Brengen:**

1. Wees eerlijk en direct
2. Neem verantwoordelijkheid
3. Kom met een plan
4. Face-to-face voor belangrijk nieuws
5. Geef ruimte voor reacties`,
          keyTakeaways: [
            'PM\'s besteden 90% van hun tijd aan communicatie',
            'Een communicatieplan definieert wie-wat-wanneer-hoe',
            'Pas je stijl aan per stakeholder type',
            'Breng slecht nieuws eerlijk, met een plan',
          ],
          resources: [
            { name: 'Communicatieplan Template', type: 'XLSX', size: '125 KB' },
            { name: 'Status Report Template', type: 'DOCX', size: '95 KB' },
          ],
        },
        {
          id: 'pm-l18',
          title: 'Earned Value Management',
          duration: '22:00',
          type: 'video',
          transcript: `"Hoever zijn we?" en "Hoeveel hebben we uitgegeven?" zijn twee verschillende vragen. Earned Value Management (EVM) combineert beide.

**De Drie Kernmetingen:**

1. **Planned Value (PV)**: Budget voor gepland werk
   PV = Budget × % gepland werk

2. **Earned Value (EV)**: Budget voor gedaan werk
   EV = Budget × % werkelijk voltooid werk

3. **Actual Cost (AC)**: Werkelijke kosten
   AC = Echte uitgaven

**Variantie Analyse:**

**Schedule Variance (SV)** = EV - PV
- Positief: Voor op schema
- Negatief: Achter op schema

**Cost Variance (CV)** = EV - AC
- Positief: Onder budget
- Negatief: Over budget

**Performance Indices:**

**SPI (Schedule Performance Index)** = EV / PV
- > 1: Voor op schema
- < 1: Achter op schema

**CPI (Cost Performance Index)** = EV / AC
- > 1: Onder budget
- < 1: Over budget

**Forecasting:**

**EAC (Estimate at Completion)** = BAC / CPI
Voorspelde totale kosten als huidige trend doorzet.`,
          keyTakeaways: [
            'EVM combineert scope, tijd en kosten in één meting',
            'EV = wat je hebt verdiend, niet wat je hebt uitgegeven',
            'CPI < 1 betekent over budget per eenheid werk',
            'EAC voorspelt totale kosten als trend doorzet',
          ],
          resources: [
            { name: 'EVM Calculator', type: 'XLSX', size: '145 KB' },
            { name: 'EVM Formule Cheat Sheet', type: 'PDF', size: '95 KB' },
          ],
        },
        {
          id: 'pm-l19',
          title: 'Change Control',
          duration: '14:00',
          type: 'video',
          transcript: `Verandering is onvermijdelijk. Change control zorgt dat wijzigingen beheerst worden doorgevoerd.

**Het Change Control Proces:**

**1. Change Request Indienen**
- Wat is de gewenste wijziging?
- Waarom is het nodig?
- Wie vraagt het aan?

**2. Impact Analyse**
- Impact op scope, planning, budget
- Impact op risico's en kwaliteit
- Afhankelijkheden

**3. Review en Beslissing**
- Change Control Board (CCB) beslist
- Opties: Goedkeuren, Afwijzen, Meer info nodig

**4. Implementatie**
- Baseline updaten
- Planning aanpassen
- Team informeren

**5. Verificatie**
- Is de wijziging correct doorgevoerd?
- Zijn documenten geüpdatet?

**Gold Plating Voorkomen**

Gold plating = extras toevoegen die niet gevraagd zijn.
"De klant zal dit vast ook willen..."

Dit is net zo schadelijk als scope creep:
- Kost tijd en budget
- Verhoogt risico
- Klant betaalt voor iets dat niet gevraagd is

Regel: Niets toevoegen zonder formeel verzoek.`,
          keyTakeaways: [
            'Change control is bescherming, niet bureaucratie',
            'Elke wijziging doorloopt: request, analyse, beslissing, implementatie',
            'Het Change Control Board beslist over significante wijzigingen',
            'Gold plating is net zo schadelijk als scope creep',
          ],
          resources: [
            { name: 'Change Request Template', type: 'DOCX', size: '125 KB' },
            { name: 'Change Log Template', type: 'XLSX', size: '85 KB' },
          ],
        },
        {
          id: 'pm-l20',
          title: 'Quiz: Uitvoering & Monitoring',
          duration: '15:00',
          type: 'quiz',
          quiz: [
            {
              id: 'q-m4-1',
              question: 'In welke fase van Tuckman\'s model ontstaan de meeste conflicten?',
              options: ['Forming', 'Storming', 'Norming', 'Performing'],
              correctAnswer: 1,
              explanation: 'In de Storming fase botsen werkstijlen en ontstaan conflicten over rollen en posities.',
            },
            {
              id: 'q-m4-2',
              question: 'Wat is de beste conflictstijl voor een belangrijk issue waarbij je tijd hebt?',
              options: ['Competing', 'Avoiding', 'Compromising', 'Collaborating'],
              correctAnswer: 3,
              explanation: 'Collaborating leidt tot win-win en is ideaal voor belangrijke issues met voldoende tijd.',
            },
            {
              id: 'q-m4-3',
              question: 'EV = €40.000, PV = €50.000, AC = €55.000. Wat is de Schedule Variance?',
              options: ['+€10.000', '-€10.000', '+€15.000', '-€15.000'],
              correctAnswer: 1,
              explanation: 'SV = EV - PV = €40.000 - €50.000 = -€10.000. Negatief = achter op schema.',
            },
            {
              id: 'q-m4-4',
              question: 'Een CPI van 0.8 betekent:',
              options: ['Je krijgt €0.80 waarde voor elke €1 uitgegeven', 'Je bent 80% klaar', 'Je bent 20% onder budget', 'Je bent 80% voor op schema'],
              correctAnswer: 0,
              explanation: 'CPI = EV/AC. Een CPI van 0.8 betekent €0.80 waarde per €1 uitgegeven - je bent over budget.',
            },
            {
              id: 'q-m4-5',
              question: 'Wat is "gold plating"?',
              options: ['Project succesvol afronden', 'Extra features toevoegen die niet gevraagd zijn', 'Premium klanten speciale behandeling geven', 'Kwaliteitsstandaarden overtreffen'],
              correctAnswer: 1,
              explanation: 'Gold plating is het toevoegen van extra functionaliteit die niet door de klant is gevraagd.',
            },
          ],
        },
      ],
    },
    // ==========================================
    // MODULE 5: AFSLUITING
    // ==========================================
    {
      id: 'pm-m5',
      title: 'Module 5: Afsluiting',
      description: 'Formele acceptatie, lessons learned en administratieve afsluiting.',
      lessons: [
        {
          id: 'pm-l21',
          title: 'Het belang van projectafsluiting',
          duration: '12:00',
          type: 'video',
          transcript: `Veel projectmanagers haasten door de afsluitingsfase. Dit is een grote fout.

**Waarom Afsluiting Wordt Verwaarloosd:**
- Het "echte werk" is gedaan
- Team is al bezig met volgende project
- Afsluiting voelt als administratie

**De Kosten van Slechte Afsluiting:**

**Zombie Projecten**: Projecten die nooit formeel eindigen
- Resources blijven gealloceerd
- Kosten blijven lopen

**Verloren Kennis**: Zonder lessons learned
- Dezelfde fouten worden herhaald
- Best practices gaan verloren

**Ontevreden Stakeholders**:
- Onduidelijkheid over wat is opgeleverd
- Verwachtingen niet gemanaged

**De Doelen van Projectafsluiting:**
1. Formele acceptatie van deliverables
2. Vrijgeven van resources
3. Afsluiten van contracten en financiën
4. Documenteren van lessons learned
5. Archiveren van projectdocumentatie
6. Vieren van succes`,
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
          duration: '14:00',
          type: 'video',
          transcript: `Formele acceptatie is het moment waarop de opdrachtgever bevestigt dat de deliverables voldoen aan de eisen.

**Het Acceptatieproces:**

**1. Deliverable Presenteren**
- Demonstreer dat het werkt
- Toon documentatie
- Toon testresultaten

**2. Acceptatiecriteria Doorlopen**
- Systematisch elk criterium checken
- Bevindingen documenteren

**3. Beslissing**
- Volledig geaccepteerd: Alles OK
- Conditioneel geaccepteerd: OK met voorwaarden
- Afgewezen: Terug naar development

**4. Sign-off Vastleggen**
- Formeel document
- Handtekening van bevoegde persoon

**Overdracht naar Operations:**

Wat overdragen?
- Het product zelf
- Documentatie (technisch en gebruiker)
- Configuratie informatie
- Wachtwoorden en toegang
- Bekend issues lijst
- Onderhoudscontract details

Kennisoverdracht:
- Training voor beheerders
- Walkthrough van architectuur
- Hypercare periode`,
          keyTakeaways: [
            'Acceptatiecriteria moeten vooraf zijn gedefinieerd',
            'Acceptatie is formeel met handtekening',
            'Overdracht omvat product, documentatie en kennis',
            'Plan acceptatie in - het kost tijd',
          ],
          resources: [
            { name: 'Acceptance Certificate Template', type: 'DOCX', size: '85 KB' },
            { name: 'Handover Checklist', type: 'PDF', size: '125 KB' },
          ],
        },
        {
          id: 'pm-l23',
          title: 'Lessons Learned',
          duration: '16:00',
          type: 'video',
          transcript: `Lessons learned is het proces van systematisch reflecteren op het project om inzichten vast te leggen voor de toekomst.

**Wanneer Verzamelen?**

**Tijdens het project:**
- Na belangrijke mijlpalen
- Na significante issues
- Bij retrospectives

**Bij afsluiting:**
- Formele lessons learned sessie
- Met alle key stakeholders
- Terwijl het nog vers is

**De Lessons Learned Sessie:**

**Voorbereiding:**
- Plan 2-4 uur
- Nodig alle key contributors
- Neutrale facilitator

**Structuur:**
1. Context herhalen
2. Wat ging goed?
3. Wat kon beter?
4. Wat zouden we anders doen?
5. Aanbevelingen

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

**Goede Lessons Learned bevatten:**
- Context: Wat was de situatie?
- Issue/Succes: Wat ging goed of fout?
- Oorzaak: Waarom?
- Aanbeveling: Wat te doen in de toekomst?`,
          keyTakeaways: [
            'Verzamel lessons learned tijdens én aan het einde',
            'Creëer een blame-free omgeving',
            'Goede lessons zijn specifiek met context en aanbeveling',
            'Lessons zijn waardeloos als ze niet worden gebruikt',
          ],
          resources: [
            { name: 'Lessons Learned Template', type: 'DOCX', size: '145 KB' },
            { name: 'Facilitatie Gids', type: 'PDF', size: '280 KB' },
          ],
        },
        {
          id: 'pm-l24',
          title: 'Administratieve afsluiting',
          duration: '10:00',
          type: 'video',
          transcript: `De administratieve afsluiting is het "schoonmaken" na het project.

**Financiële Afsluiting:**
- Alle facturen ontvangen en betaald
- Final cost report
- Niet-gebruikte contingency terug

**Resource Vrijgave:**
- Formele communicatie dat project eindigt
- Performance feedback voor teamleden
- Toegangen intrekken

**Documentatie Archivering:**
- Project charter en PID
- Planning documenten
- Requirements en design
- Testdocumentatie
- Lessons learned
- Final report

**Project Closure Report:**
1. Project Overview
2. Deliverables opgeleverd
3. Performance: budget, schedule, kwaliteit
4. Issues & Changes
5. Lessons Learned samenvatting
6. Recommendations

**Checklist:**
□ Alle deliverables geaccepteerd
□ Overdracht compleet
□ Financiën afgesloten
□ Contracten afgesloten
□ Resources vrijgegeven
□ Lessons learned gedocumenteerd
□ Documentatie gearchiveerd
□ Final report geschreven
□ Succes gevierd!`,
          keyTakeaways: [
            'Financiële afsluiting voorkomt openstaande claims',
            'Resources moeten formeel worden vrijgegeven',
            'Documentatie archiveren volgens organisatiebeleid',
            'Vergeet niet te vieren!',
          ],
          resources: [
            { name: 'Project Closure Checklist', type: 'PDF', size: '95 KB' },
            { name: 'Project Closure Report Template', type: 'DOCX', size: '165 KB' },
          ],
        },
        {
          id: 'pm-l25',
          title: 'Eindexamen',
          duration: '45:00',
          type: 'exam',
        },
        {
          id: 'pm-l26',
          title: 'Certificaat',
          duration: '5:00',
          type: 'certificate',
        },
      ],
    },
  ],
};

// ============================================
// COURSE 2: PRINCE2 FOUNDATION & PRACTITIONER
// ============================================

export const prince2Course: Course = {
  id: 'prince2-practitioner',
  title: 'PRINCE2 Foundation & Practitioner',
  subtitle: 'De complete PRINCE2 training voor certificering',
  description: 'PRINCE2 is de meest gebruikte projectmanagement methodologie ter wereld. Leer de 7 principes, 7 thema\'s en 7 processen toepassen.',
  methodology: 'prince2',
  icon: 'Crown',
  color: '#7C3AED',
  gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
  difficulty: 'Intermediate',
  language: 'Nederlands',
  duration: '20',
  totalLessons: 35,
  price: 149,
  originalPrice: 299,
  freeForCustomers: true,
  certificate: true,
  featured: true,
  bestseller: true,
  rating: 4.8,
  reviewCount: 1893,
  students: 8234,
  lastUpdated: '2025-01',
  whatYouLearn: [
    'De 7 principes van PRINCE2 begrijpen en toepassen',
    'De 7 thema\'s effectief inzetten in projecten',
    'De 7 processen correct doorlopen',
    'PRINCE2 aanpassen (tailoring) voor jouw project',
    'Voorbereid zijn op Foundation en Practitioner examen',
  ],
  requirements: ['Enige ervaring met projecten is nuttig maar niet vereist'],
  targetAudience: ['Projectmanagers die zich willen certificeren', 'Professionals die bij de overheid willen werken', 'Teams die een gemeenschappelijke taal zoeken'],
  instructor: instructors.erikVanDerMeer,
  modules: [
    {
      id: 'p2-m1',
      title: 'Module 1: PRINCE2 Introductie & Principes',
      description: 'Kennismaking met PRINCE2 en de 7 ononderhandelbare principes.',
      lessons: [
        {
          id: 'p2-l1',
          title: 'Wat is PRINCE2?',
          duration: '15:00',
          type: 'video',
          transcript: `PRINCE2 = PRojects IN Controlled Environments. Het is een procesgebaseerde methodologie voor projectmanagement, oorspronkelijk ontwikkeld door de Britse overheid.

**De Structuur van PRINCE2:**
- 7 Principes (fundamentele regels)
- 7 Thema's (aspecten die continu aandacht nodig hebben)
- 7 Processen (stappen door het project)

**Certificering:**
- Foundation: Multiple choice, 60 vragen, 55% pass rate
- Practitioner: Scenario-based, 68 vragen, 55% pass rate

PRINCE2 is bijzonder geschikt voor projecten waar governance, controle en duidelijke beslisstructuren belangrijk zijn.`,
          keyTakeaways: [
            'PRINCE2 = PRojects IN Controlled Environments',
            'Bestaat uit 7 principes, 7 thema\'s, 7 processen',
            'Wereldwijd de meest gebruikte PM-methode',
            'Twee certificeringsniveaus: Foundation en Practitioner',
          ],
        },
        {
          id: 'p2-l2',
          title: 'De 7 Principes',
          duration: '25:00',
          type: 'video',
          transcript: `De principes zijn niet onderhandelbaar - als je ze niet volgt, doe je geen PRINCE2.

**1. Continued Business Justification**
Het project moet gedurende de hele looptijd zakelijk gerechtvaardigd blijven. Als de business case niet meer klopt, stop het project.

**2. Learn from Experience**
Leer van eerdere projecten (eigen en anderen). Leg lessons learned vast en gebruik ze.

**3. Defined Roles and Responsibilities**
Iedereen weet wat van hem/haar verwacht wordt. Duidelijke structuur met Project Board, PM, en Team.

**4. Manage by Stages**
Plan en beheer het project in beheersbare management stages. Elke stage heeft een eigen plan en gate.

**5. Manage by Exception**
Definieer toleranties en escaleer alleen als die dreigen te worden overschreden. Geeft PM ruimte om te managen.

**6. Focus on Products**
Het project is gericht op het definiëren en opleveren van producten. Product Descriptions zijn centraal.

**7. Tailor to Suit the Project**
Pas PRINCE2 aan op de grootte, complexiteit en risico van het project. Geen one-size-fits-all.`,
          keyTakeaways: [
            'De 7 principes zijn verplicht - anders is het geen PRINCE2',
            'Business justification moet gedurende heel het project gelden',
            'Manage by Exception geeft PM ruimte binnen toleranties',
            'Tailoring is essentieel maar principes blijven intact',
          ],
        },
        {
          id: 'p2-l3',
          title: 'De 7 Thema\'s',
          duration: '20:00',
          type: 'video',
          transcript: `Thema's zijn aspecten van projectmanagement die continu aandacht nodig hebben gedurende het project.

**1. Business Case** - Waarom?
Rechtvaardiging van het project. Evolueert van Outline naar Detailed.

**2. Organization** - Wie?
De projectorganisatie: Project Board, PM, Team Manager, Project Assurance.

**3. Quality** - Wat (specificaties)?
Kwaliteitsmanagement: Product Descriptions, Quality Register, Quality Review.

**4. Plans** - Hoe? Hoeveel? Wanneer?
Drie niveaus: Project Plan, Stage Plan, Team Plan. Product-based planning.

**5. Risk** - Wat als?
Risicomanagement: identificeren, beoordelen, plannen, implementeren, communiceren.

**6. Change** - Wat is de impact?
Issue en change management. Configuration management.

**7. Progress** - Waar staan we?
Monitoren en controleren. Toleranties, rapportages, reviews.`,
          keyTakeaways: [
            'Thema\'s zijn aspecten die continu aandacht nodig hebben',
            'Business Case beantwoordt "waarom", Organization "wie"',
            'Alle 7 thema\'s zijn geïntegreerd en werken samen',
            'De diepgang hangt af van tailoring',
          ],
        },
      ],
    },
    {
      id: 'p2-m2',
      title: 'Module 2: De 7 Processen',
      description: 'De complete PRINCE2 processen van start tot finish.',
      lessons: [
        {
          id: 'p2-l4',
          title: 'Starting Up a Project (SU)',
          duration: '18:00',
          type: 'video',
          transcript: `SU is het pre-project proces. Het doel is om zeker te stellen dat het zinvol is om te starten met initiatie.

**Activiteiten:**
1. Appoint Executive and PM
2. Capture Previous Lessons
3. Design Project Management Team
4. Prepare Outline Business Case
5. Select Project Approach
6. Plan the Initiation Stage

**Output:** Project Brief - het document dat bepaalt of initiatie mag starten.

SU voorkomt dat we tijd en geld verspillen aan projecten die nooit hadden moeten starten.`,
          keyTakeaways: [
            'SU is een kort pre-project proces',
            'Het Project Brief is het hoofdproduct',
            'De Project Board wordt samengesteld in SU',
            'SU voorkomt onnodige initiatie van slechte projecten',
          ],
        },
        {
          id: 'p2-l5',
          title: 'Initiating a Project (IP)',
          duration: '20:00',
          type: 'video',
          transcript: `IP is het proces waarin de PID (Project Initiation Documentation) wordt opgesteld.

**De PID bevat:**
- Risk Management Strategy
- Configuration Management Strategy
- Quality Management Strategy
- Communication Management Strategy
- Project Controls
- Project Plan
- Refined Business Case

De PID is de baseline waartegen het project wordt gemeten. Na goedkeuring door de Board start de eerste delivery stage.`,
          keyTakeaways: [
            'IP creëert de PID - de projectbaseline',
            'Vier management strategies worden opgesteld',
            'De Business Case wordt verfijnd met meer detail',
            'De PID is basis voor alle verdere beslissingen',
          ],
        },
        {
          id: 'p2-l6',
          title: 'Directing a Project (DP)',
          duration: '15:00',
          type: 'video',
          transcript: `DP is het besturingsproces voor de Project Board. Het loopt door het hele project.

**Activiteiten:**
1. Authorise Initiation - Mag IP starten?
2. Authorise the Project - Mag delivery starten?
3. Authorise a Stage or Exception Plan - Goedkeuren plannen
4. Give Ad Hoc Direction - Advies geven wanneer gevraagd
5. Authorise Project Closure - Formele afsluiting

De Board bestuurt "by exception" - ze worden alleen betrokken bij gates en escalaties.`,
          keyTakeaways: [
            'DP is het proces voor de Project Board',
            'Focust op autorisaties en key decisions',
            'Management by Exception minimaliseert Board-tijd',
            'Board besluit over go/no-go bij elke stage',
          ],
        },
        {
          id: 'p2-l7',
          title: 'Controlling a Stage (CS)',
          duration: '20:00',
          type: 'video',
          transcript: `CS is het dagelijkse management door de PM. Het is waar het werk wordt gedaan.

**Activiteiten:**
1. Authorize Work Packages
2. Review Work Package Status
3. Receive Completed Work Packages
4. Review the Stage Status
5. Report Highlights
6. Capture and Examine Issues and Risks
7. Escalate Issues and Risks
8. Take Corrective Action

**Rapportages:**
- Checkpoint Reports: Team Manager → PM
- Highlight Reports: PM → Board (regelmatig)
- Exception Reports: PM → Board (bij tolerantie-overschrijding)`,
          keyTakeaways: [
            'CS is het dagelijkse management proces van de PM',
            'Work Packages delegeren werk aan Team Managers',
            'Highlight Reports gaan regelmatig naar de Board',
            'Exception Reports escaleren buiten toleranties',
          ],
        },
        {
          id: 'p2-l8',
          title: 'Managing Product Delivery (MP)',
          duration: '15:00',
          type: 'video',
          transcript: `MP is het proces voor Team Managers om werk te coördineren en producten op te leveren.

**Activiteiten:**
1. Accept a Work Package - Begrijp en accepteer de opdracht
2. Execute a Work Package - Coördineer het werk
3. Deliver a Work Package - Lever op met kwaliteitscontrole

De Team Manager rapporteert via Checkpoint Reports aan de PM. Kwaliteitscontrole gebeurt voordat producten worden opgeleverd.`,
          keyTakeaways: [
            'MP is het proces voor Team Managers',
            'Work Packages zijn de formele opdracht van PM naar Team',
            'Checkpoint Reports rapporteren voortgang',
            'Kwaliteitscontrole voordat producten worden opgeleverd',
          ],
        },
        {
          id: 'p2-l9',
          title: 'Managing a Stage Boundary (SB)',
          duration: '18:00',
          type: 'video',
          transcript: `SB vindt plaats aan het einde van elke management stage.

**Activiteiten:**
1. Plan the Next Stage - Detailplanning voor komende stage
2. Update the Project Plan - Actuals vs. baseline
3. Update the Business Case - Is het nog gerechtvaardigd?
4. Report Stage End - End Stage Report voor Board
5. Produce an Exception Plan (indien nodig)

Het End Stage Report geeft de Board de informatie om te beslissen over doorgaan, stoppen, of aanpassen.`,
          keyTakeaways: [
            'SB vindt plaats aan het einde van elke stage',
            'End Stage Report voor de Board\'s beslissing',
            'Business Case wordt gevalideerd bij elke boundary',
            'Exception Plans worden hier gemaakt als toleranties overschreden zijn',
          ],
        },
        {
          id: 'p2-l10',
          title: 'Closing a Project (CP)',
          duration: '15:00',
          type: 'video',
          transcript: `CP is het gecontroleerd afsluiten van het project.

**Activiteiten:**
1. Prepare Planned Closure - Normale afsluiting
2. Prepare Premature Closure - Als project voortijdig stopt
3. Hand Over Products - Overdracht naar operations
4. Evaluate the Project - Performance review
5. Recommend Project Closure - Vraag Board om formele sluiting

**Outputs:**
- End Project Report
- Lessons Report
- Benefits Review Plan (voor post-project meting)

CP is verplicht, ook bij voortijdig stoppen!`,
          keyTakeaways: [
            'CP is verplicht, ook bij voortijdig stoppen',
            'End Project Report evalueert het hele project',
            'Benefits Review Plan voor post-project benefits meting',
            'Lessons Report documenteert geleerde lessen',
          ],
        },
        {
          id: 'p2-l11',
          title: 'PRINCE2 Tailoring',
          duration: '15:00',
          type: 'video',
          transcript: `Tailoring is het aanpassen van PRINCE2 aan de specifieke context. Het is een principe, geen optie.

**Wat kun je tailoren?**
- Processen: Combineren of vereenvoudigen
- Thema's: Diepgang aanpassen
- Rollen: Combineren (niet elimineren!)
- Management Producten: Templates aanpassen

**Wat kun je NIET tailoren?**
De 7 principes zijn niet onderhandelbaar.

**Factoren voor tailoring:**
- Projectgrootte
- Complexiteit
- Risico
- Team ervaring
- Organisatiecultuur

Bij kleine projecten: combineer SU en IP, minder formele documenten, PM combineert rollen.`,
          keyTakeaways: [
            'Tailoring is een principe, niet optioneel',
            'Processen, thema\'s en rollen mogen worden aangepast',
            'De 7 principes zijn niet onderhandelbaar',
            'Documenteer en laat tailoring goedkeuren',
          ],
        },
      ],
    },
  ],
};

// ============================================
// COURSE 3: SCRUM MASTER CERTIFIED
// ============================================

export const scrumCourse: Course = {
  id: 'scrum-master',
  title: 'Scrum Master Certified',
  subtitle: 'Word een effectieve Scrum Master',
  description: 'Leer de Scrum Guide volledig beheersen en teams begeleiden naar high performance.',
  methodology: 'scrum',
  icon: 'RefreshCw',
  color: '#059669',
  gradient: 'linear-gradient(135deg, #059669, #047857)',
  difficulty: 'Beginner',
  language: 'Nederlands',
  duration: '14',
  totalLessons: 28,
  price: 119,
  originalPrice: 239,
  freeForCustomers: true,
  certificate: true,
  featured: true,
  bestseller: true,
  rating: 4.9,
  reviewCount: 3241,
  students: 15678,
  lastUpdated: '2025-01',
  whatYouLearn: [
    'De Scrum Guide volledig begrijpen en toepassen',
    'Alle Scrum events effectief faciliteren',
    'Het team beschermen en impediments oplossen',
    'Stakeholders managen en educeren',
    'Voorbereid zijn op PSM I certificering',
  ],
  requirements: ['Geen voorkennis vereist'],
  targetAudience: ['Aspirant Scrum Masters', 'Projectmanagers die Agile willen leren', 'Team leads in Agile organisaties'],
  instructor: instructors.lisaDeGroot,
  modules: [
    {
      id: 'scrum-m1',
      title: 'Module 1: Scrum Fundamenten',
      description: 'De basis: empirisme, waarden, pijlers en het framework.',
      lessons: [
        {
          id: 'scrum-l1',
          title: 'De essentie van Scrum',
          duration: '18:00',
          type: 'video',
          transcript: `Scrum is een lichtgewicht framework dat teams helpt waarde te genereren door adaptieve oplossingen voor complexe problemen.

**Empirisme - De Basis**

Scrum is gebaseerd op empirisme: kennis komt voort uit ervaring en beslissingen worden genomen op basis van wat is waargenomen.

**De Drie Pijlers:**

1. **Transparantie**: Het werk en de voortgang moeten zichtbaar zijn voor iedereen. Product Backlog, Sprint Backlog, en Increment zijn transparant.

2. **Inspectie**: Regelmatig de Scrum artefacten en voortgang onderzoeken om ongewenste varianties te detecteren. De events faciliteren inspectie.

3. **Adaptatie**: Als inspectie toont dat aspecten afwijken, moet er zo snel mogelijk worden aangepast.

**De Vijf Waarden:**

- **Commitment**: Toewijding aan het behalen van doelen
- **Focus**: Concentratie op Sprint werk
- **Openness**: Transparant over werk en uitdagingen
- **Respect**: Elkaar respecteren als capabele mensen
- **Courage**: Moed om het juiste te doen

Deze waarden geven richting aan werk, acties en gedrag van het Scrum Team.`,
          keyTakeaways: [
            'Scrum is gebaseerd op empirisme: leren door ervaring',
            'Drie pijlers: Transparantie, Inspectie, Adaptatie',
            'Vijf waarden: Commitment, Focus, Openness, Respect, Courage',
            'De waarden en pijlers zijn het fundament van alles in Scrum',
          ],
        },
        {
          id: 'scrum-l2',
          title: 'De Scrum Rollen (Accountabilities)',
          duration: '22:00',
          type: 'video',
          transcript: `Het Scrum Team bestaat uit drie accountabilities. Er zijn geen hiërarchieën of sub-teams.

**Product Owner**

De PO is verantwoordelijk voor het maximaliseren van de waarde van het product.

Verantwoordelijkheden:
- Product Goal ontwikkelen en communiceren
- Product Backlog items creëren en duidelijk communiceren
- Product Backlog items ordenen
- Zorgen dat de Product Backlog transparant en begrepen is

De PO is één persoon, niet een committee. De PO kan werk delegeren maar blijft accountable.

**Scrum Master**

De SM is accountable voor het vestigen van Scrum zoals gedefinieerd in de Scrum Guide.

Diensten aan de PO:
- Helpen effectieve Product Backlog management technieken te vinden
- Product Backlog items duidelijk en beknopt maken
- Empirische productplanning in een complexe omgeving

Diensten aan de Developers:
- Coachen in self-management en cross-functionality
- Focussen op hoog-waardige Increments
- Impediments verwijderen

Diensten aan de Organisatie:
- Leiden en coachen van Scrum adoptie
- Plannen en adviseren van Scrum implementaties
- Stakeholders en medewerkers helpen Scrum te begrijpen

**Developers**

De mensen die het werk doen om elk Sprint een bruikbaar Increment te creëren.

Verantwoordelijkheden:
- Sprint Backlog creëren als plan voor de Sprint
- Kwaliteit instellen door de Definition of Done
- Dagelijks het plan aanpassen richting Sprint Goal
- Elkaar accountable houden als professionals`,
          keyTakeaways: [
            'Drie accountabilities: Product Owner, Scrum Master, Developers',
            'PO maximaliseert waarde en beheert de Product Backlog',
            'SM is servant-leader en coach voor team en organisatie',
            'Developers zijn alle mensen die werken aan het Increment',
          ],
        },
        {
          id: 'scrum-l3',
          title: 'De Scrum Events',
          duration: '25:00',
          type: 'video',
          transcript: `Scrum gebruikt events om regelmaat te creëren en de behoefte aan andere meetings te minimaliseren.

**De Sprint**

Container voor alle andere events. Maximaal één maand.
- Consistente duur door het project
- Nieuwe Sprint start onmiddellijk na vorige
- Tijdens Sprint: geen wijzigingen die Sprint Goal in gevaar brengen, kwaliteit niet verlagen, Product Backlog mag worden verfijnd

**Sprint Planning**

Start de Sprint door werk te plannen. Timebox: max 8 uur voor 1-maand Sprint.

Drie topics:
1. Waarom is deze Sprint waardevol? → Sprint Goal
2. Wat kan er Done worden? → Selectie uit Product Backlog
3. Hoe wordt het werk gedaan? → Plan

**Daily Scrum**

Dagelijkse 15-minuten event voor Developers.
- Inspecteert voortgang richting Sprint Goal
- Past Sprint Backlog indien nodig aan
- Developers bepalen structuur en techniek

**Sprint Review**

Inspecteert het resultaat en bepaalt toekomstige aanpassingen.
Timebox: max 4 uur voor 1-maand Sprint.
- Presenteer wat er is bereikt
- Bespreek Product Backlog
- Discussieer met stakeholders
- Review is GEEN demo-only!

**Sprint Retrospective**

Plant manieren om kwaliteit en effectiviteit te verhogen.
Timebox: max 3 uur voor 1-maand Sprint.
- Wat ging goed?
- Welke problemen?
- Hoe werden problemen opgelost (of niet)?
- Identificeer verbeteringen voor volgende Sprint`,
          keyTakeaways: [
            'De Sprint is de container voor alle events (max 4 weken)',
            'Sprint Planning definieert WAT en HOE, resulterend in Sprint Goal',
            'Daily Scrum is max 15 min, voor Developers',
            'Review toont het Increment; Retrospective verbetert het proces',
          ],
        },
        {
          id: 'scrum-l4',
          title: 'De Scrum Artefacten',
          duration: '18:00',
          type: 'video',
          transcript: `Scrum artefacten representeren werk of waarde. Elk artefact heeft een commitment dat transparantie en focus versterkt.

**Product Backlog**

Een emergent, geordende lijst van wat nodig is om het product te verbeteren.
- De enige bron van werk voor het Scrum Team
- PO is verantwoordelijk
- Items die kunnen worden Done binnen één Sprint zijn klaar voor selectie

**Commitment: Product Goal**
Het lange-termijn doel van het Scrum Team. Het Product moet dit doel bereiken of opgeven voordat een nieuw doel wordt aangenomen.

**Sprint Backlog**

Bestaat uit: Sprint Goal (waarom), geselecteerde PB items (wat), en het plan (hoe).
- Eigendom van Developers
- Wordt real-time geüpdatet tijdens de Sprint
- Genoeg detail voor inspectie in Daily Scrum

**Commitment: Sprint Goal**
Het enige doel van de Sprint. Geeft flexibiliteit in de exacte werk dat wordt gedaan.

**Increment**

Een concreet opstapje richting het Product Goal.
- Elk Increment is additief op alle vorige
- Om waarde te leveren moet Increment bruikbaar zijn
- Meerdere Increments kunnen binnen een Sprint worden gecreëerd

**Commitment: Definition of Done**
De formele beschrijving van de kwaliteitseisen voor het Increment.
- Creëert transparantie over wat is gedaan
- Als een PB item niet voldoet aan DoD, mag het niet worden gereleased`,
          keyTakeaways: [
            'Drie artefacten met elk een commitment',
            'Product Backlog → Product Goal',
            'Sprint Backlog → Sprint Goal',
            'Increment → Definition of Done',
          ],
        },
      ],
    },
  ],
};

// ============================================
// COURSE 4: LEAN SIX SIGMA GREEN BELT
// ============================================

export const leanSixSigmaCourse: Course = {
  id: 'lean-six-sigma-green-belt',
  title: 'Lean Six Sigma Green Belt',
  subtitle: 'Data-gedreven procesverbetering',
  description: 'Leer de DMAIC-methodologie voor meetbare, duurzame procesverbeteringen.',
  methodology: 'leansixsigma',
  icon: 'TrendingUp',
  color: '#0891B2',
  gradient: 'linear-gradient(135deg, #0891B2, #0E7490)',
  difficulty: 'Intermediate',
  language: 'Nederlands',
  duration: '24',
  totalLessons: 40,
  price: 199,
  originalPrice: 399,
  freeForCustomers: true,
  certificate: true,
  featured: true,
  rating: 4.7,
  reviewCount: 1245,
  students: 5892,
  lastUpdated: '2025-01',
  whatYouLearn: [
    'De DMAIC-methodologie volledig beheersen',
    'Statistische tools zoals SPC en hypothesetesten toepassen',
    'Root cause analysis uitvoeren met 5 Whys en Fishbone',
    'Duurzame verbeteringen implementeren en borgen',
  ],
  requirements: ['Basiskennis Excel', 'Ervaring met processen is nuttig'],
  targetAudience: ['Procesverbeteraars', 'Quality managers', 'Operations managers', 'Continuous improvement professionals'],
  instructor: instructors.markJansen,
  modules: [
    {
      id: 'lss-m1',
      title: 'Module 1: DMAIC Introductie',
      description: 'De fundamenten van Lean Six Sigma en de DMAIC cyclus.',
      lessons: [
        {
          id: 'lss-l1',
          title: 'Wat is Lean Six Sigma?',
          duration: '20:00',
          type: 'video',
          transcript: `Lean Six Sigma combineert twee krachtige methodologieën:

**Lean**: Focus op het elimineren van verspilling
- Oorsprong: Toyota Production System
- Doel: Flow maximaliseren, waste minimaliseren
- 8 verspillingen (TIMWOODS): Transport, Inventory, Motion, Waiting, Overproduction, Overprocessing, Defects, Skills (unused)

**Six Sigma**: Focus op het reduceren van variatie
- Oorsprong: Motorola, 1986
- Doel: 3.4 defecten per miljoen mogelijkheden
- Data-gedreven besluitvorming

**DMAIC Cyclus:**

- **D**efine: Definieer het probleem en de doelen
- **M**easure: Meet de huidige situatie
- **A**nalyze: Analyseer de root causes
- **I**mprove: Implementeer verbeteringen
- **C**ontrol: Borg de verbetering

**Sigma Levels:**
- 1 Sigma: 690.000 DPMO (defects per million opportunities)
- 3 Sigma: 66.800 DPMO
- 6 Sigma: 3.4 DPMO`,
          keyTakeaways: [
            'Lean focust op verspilling elimineren, Six Sigma op variatie reduceren',
            'DMAIC = Define, Measure, Analyze, Improve, Control',
            '8 verspillingen: TIMWOODS',
            'Six Sigma streeft naar 3.4 defecten per miljoen mogelijkheden',
          ],
        },
        {
          id: 'lss-l2',
          title: 'De Define Fase',
          duration: '25:00',
          type: 'video',
          transcript: `De Define fase legt de basis voor het hele project.

**Project Charter**

Het belangrijkste document bevat:
- Business Case: Waarom is dit project belangrijk?
- Problem Statement: Specifiek, meetbaar, geen oorzaken of oplossingen
- Goal Statement: SMART geformuleerd
- Scope: In-scope en out-of-scope
- Team: Rollen en verantwoordelijkheden
- Timeline: Belangrijke mijlpalen

**VOC naar CTQ's**

Voice of Customer → Needs → CTQ's (Critical to Quality)

Voorbeeld:
- VOC: "De levering duurt te lang"
- Need: Snellere levering
- CTQ: Levertijd < 3 dagen voor 95% van orders

**SIPOC Diagram**

High-level procesoverzicht:
- **S**uppliers: Wie levert input?
- **I**nputs: Wat is de input?
- **P**rocess: Hoofdstappen (5-7)
- **O**utputs: Wat is de output?
- **C**ustomers: Wie ontvangt output?

SIPOC helpt scope te definiëren en grenzen te bepalen.`,
          keyTakeaways: [
            'Problem statement bevat geen oorzaken of oplossingen',
            'VOC → Needs → CTQ\'s vertaalt klantbehoeften',
            'SIPOC geeft high-level procesinzicht',
            'De Define fase bepaalt succes van het hele project',
          ],
        },
        {
          id: 'lss-l3',
          title: 'De Measure Fase',
          duration: '28:00',
          type: 'video',
          transcript: `"In God we trust, all others must bring data." De Measure fase verzamelt feiten.

**Data Types:**

**Continuous (Continue)**: Meetbaar op een schaal
- Tijd, gewicht, temperatuur, kosten
- Meer informatief, kleinere steekproef nodig

**Discrete (Discreet)**: Telbaar, categorieën
- Defect/geen defect, ja/nee
- Grotere steekproef nodig

**Measurement System Analysis (MSA)**

Voordat je data verzamelt, valideer het meetsysteem:
- Is het consistent? (Repeatability)
- Meten verschillende mensen hetzelfde? (Reproducibility)
- Is het accuraat?

Gage R&R studie kwantificeert meetvariatie.

**Process Mapping**

Gedetailleerde proceskaart:
- Swimlane diagram: wie doet wat
- Value-added analysis: onderscheid VA, NVA, BNVA
- Value Stream Map: focus op flow en waste

**Baseline Metrics**

Meet huidige performance:
- Gemiddelde en standaarddeviatie
- Process capability (Cp, Cpk)
- Sigma level
- Control charts voor stabiliteit

Deze baseline is het vertrekpunt voor verbetering.`,
          keyTakeaways: [
            'Valideer het meetsysteem voordat je data verzamelt (MSA)',
            'Onderscheid continue en discrete data',
            'Process mapping onthult verspilling',
            'Baseline metrics geven het vertrekpunt',
          ],
        },
        {
          id: 'lss-l4',
          title: 'De Analyze Fase',
          duration: '22:00',
          type: 'video',
          transcript: `De Analyze fase beantwoordt: WAAROM bestaat dit probleem?

**5 Whys**

Vraag herhaaldelijk "waarom?" tot de root cause:

Probleem: Machine stopt
1. Waarom? Zekering sprong
2. Waarom? Motor overbelast
3. Waarom? Lagers niet gesmeerd
4. Waarom? Onderhoudsprocedure niet gevolgd
5. Waarom? Geen checklist voor onderhoud

Root cause: Ontbrekende onderhoudsprocedure!

**Fishbone Diagram (Ishikawa)**

Categoriseer oorzaken in de 6M's:
- Man (mensen)
- Machine
- Method (proces)
- Material
- Measurement
- Mother Nature (omgeving)

**Pareto Analyse**

Het 80/20 principe: 80% van effecten komt van 20% van oorzaken.
Focus op de "vital few" in plaats van de "trivial many".

**Statistische Analyse**

- **Hypothesis Testing**: Is het verschil significant?
- **Regression**: Kwantificeer de relatie tussen X en Y
- **Correlation**: Is er een verband?`,
          keyTakeaways: [
            '5 Whys vraagt herhaaldelijk "waarom" tot de root cause',
            'Fishbone organiseert oorzaken in categorieën (6M\'s)',
            'Pareto identificeert de "vital few" oorzaken',
            'Hypothesetesten verifieert of oorzaken statistisch significant zijn',
          ],
        },
        {
          id: 'lss-l5',
          title: 'De Improve Fase',
          duration: '18:00',
          type: 'video',
          transcript: `De Improve fase transformeert inzichten in actie.

**Solution Generation**

Technieken:
- Brainstorming
- Benchmarking
- SCAMPER (Substitute, Combine, Adapt, Modify, Put to other use, Eliminate, Reverse)

**Solution Selection**

**Impact/Effort Matrix:**
- Quick Wins: Hoge impact, lage effort → Doe eerst!
- Major Projects: Hoge impact, hoge effort → Plan zorgvuldig
- Fill-ins: Lage impact, lage effort → Als je tijd hebt
- Vermijden: Lage impact, hoge effort → Skip

**FMEA (Failure Mode and Effects Analysis):**
Voor elke oplossing:
- Wat kan falen? (Failure Mode)
- Wat is het effect? (Effect)
- RPN = Severity × Occurrence × Detection

Hoog RPN = hoog risico → mitigeer of kies andere oplossing.

**Piloting**

Test op kleine schaal voordat je breed uitrolt:
- Beperkt risico
- Leermogelijkheid
- Bewijs verzamelen
- Buy-in creëren`,
          keyTakeaways: [
            'Brainstorm genereert oplossingen; matrices selecteren de beste',
            'FMEA identificeert risico\'s van oplossingen',
            'Pilots testen oplossingen op kleine schaal',
            'Change management is essentieel voor adoptie',
          ],
        },
        {
          id: 'lss-l6',
          title: 'De Control Fase',
          duration: '25:00',
          type: 'video',
          transcript: `De Control fase zorgt dat verbeteringen blijvend zijn.

**Statistical Process Control (SPC)**

Control Charts monitoren het proces:
- Central Line (CL): Gemiddelde
- Upper Control Limit (UCL): +3 sigma
- Lower Control Limit (LCL): -3 sigma

**Common Cause vs. Special Cause:**
- Common Cause: Normale, inherente variatie
- Special Cause: Abnormale variatie → onderzoek nodig!

**Out-of-Control Signalen:**
1. Punt buiten control limits
2. 7+ punten aan één kant van CL
3. 7+ punten stijgend of dalend

**Control Plan**

Document dat beschrijft:
- Wat wordt gemeten?
- Hoe vaak?
- Door wie?
- Wat zijn de control limits?
- Wat te doen bij afwijking?

**Overdracht**

Na project closure:
- Control plan overhandigen aan Process Owner
- Training afgerond
- Verantwoordelijkheden helder
- Benefits tracking opgezet`,
          keyTakeaways: [
            'Control charts detecteren out-of-control condities vroeg',
            'Special cause variation vereist onderzoek en correctie',
            'Het Control Plan beschrijft wie wat meet en wat te doen bij afwijking',
            'Overdracht aan Process Owner borgt langetermijn succes',
          ],
        },
      ],
    },
  ],
};

// ============================================
// COURSE 5: WATERFALL PROJECT MANAGEMENT
// ============================================

export const waterfallCourse: Course = {
  id: 'waterfall-pm',
  title: 'Waterfall Project Management',
  subtitle: 'Klassieke projectmanagement voor voorspelbare projecten',
  description: 'De Waterfall methodologie voor projecten met stabiele requirements en strikte compliance-eisen.',
  methodology: 'waterfall',
  icon: 'Layers',
  color: '#0EA5E9',
  gradient: 'linear-gradient(135deg, #0EA5E9, #0284C7)',
  difficulty: 'Beginner',
  language: 'Nederlands',
  duration: '10',
  totalLessons: 20,
  price: 79,
  originalPrice: 159,
  freeForCustomers: true,
  certificate: true,
  rating: 4.6,
  reviewCount: 892,
  students: 4521,
  lastUpdated: '2025-01',
  whatYouLearn: [
    'De Waterfall fasen begrijpen en toepassen',
    'Requirements effectief documenteren',
    'Gate reviews en quality gates managen',
    'Change control in sequentiële projecten',
  ],
  requirements: ['Geen voorkennis vereist'],
  targetAudience: ['Projectmanagers in traditionele organisaties', 'Professionals in gereguleerde industrieën', 'IT-professionals bij enterprise implementaties'],
  instructor: instructors.peterDeVries,
  modules: [
    {
      id: 'wf-m1',
      title: 'Module 1: Waterfall Fundamenten',
      description: 'De basis van Waterfall: fasen, wanneer te gebruiken, en de trade-offs.',
      lessons: [
        {
          id: 'wf-l1',
          title: 'Wat is Waterfall?',
          duration: '15:00',
          type: 'video',
          transcript: `Waterfall is een sequentiële, lineaire aanpak voor projectmanagement.

**Het Waterfall Model:**

Requirements → Design → Development → Testing → Deployment → Maintenance

Elke fase moet volledig worden afgerond voordat de volgende begint.

**Wanneer Waterfall Gebruiken?**

✅ Stabiele requirements: Klant weet precies wat hij wil
✅ Strikte compliance: Audit trails en documentatie vereist
✅ Vaste prijs contracten: Scope moet vooraf vast staan
✅ Grote, gedistribueerde teams: Gedetailleerde specs als communicatie

**Wanneer NIET Waterfall?**

❌ Onzekere requirements: Innovatieve producten
❌ Behoefte aan snelle feedback: Klant weet niet precies wat hij wil
❌ Complexe, onvoorspelbare projecten: Veel onbekenden

**Voordelen:**
- Duidelijke structuur en mijlpalen
- Gedegen documentatie
- Voorspelbaar budget en timeline
- Makkelijk te managen

**Nadelen:**
- Inflexibel voor wijzigingen
- Late feedback (werkend product pas aan het einde)
- Risico: fouten vroeg gemaakt, laat ontdekt`,
          keyTakeaways: [
            'Waterfall is sequentieel: elke fase moet af voor de volgende start',
            'Ideaal voor stabiele requirements en compliance-intensieve projecten',
            'Biedt voorspelbaarheid maar is inflexibel voor wijzigingen',
            'Nog steeds relevant in bouw, hardware, enterprise IT en gereguleerde sectoren',
          ],
        },
        {
          id: 'wf-l2',
          title: 'Requirements Fase',
          duration: '22:00',
          type: 'video',
          transcript: `De Requirements fase is de fundering. Fouten hier zijn het duurst om te fixen.

**Types Requirements:**

**Functionele Requirements**: Wat het systeem moet DOEN
- "Het systeem moet orders kunnen registreren"
- "Gebruikers moeten kunnen inloggen met 2FA"

**Non-Functionele Requirements**: Hoe het systeem moet PRESTEREN
- "Pagina's laden binnen 2 seconden"
- "99.9% uptime"

**Technieken voor Requirements Gathering:**

1. **Interviews**: Een-op-een met stakeholders
2. **Workshops**: Groepssessies
3. **Document Analyse**: Bestaande specs bestuderen
4. **Observation**: Gebruikers observeren
5. **Prototyping**: Mockups maken

**Requirements Specification:**

Gestructureerd document met:
- Functionele requirements per feature
- Non-functionele requirements
- Constraints
- Use cases

**Traceability Matrix:**

Business Need → Requirement → Design → Code → Test Case

Dit helpt bij impact analysis en verificatie.

**Sign-off:**

Na formele review en goedkeuring activeert sign-off het change control proces.`,
          keyTakeaways: [
            'Requirements fouten zijn de duurste om te fixen',
            'Gebruik meerdere technieken: interviews, workshops, observatie',
            'Goede requirements zijn SMART en toetsbaar',
            'Formele sign-off activeert change control',
          ],
        },
        {
          id: 'wf-l3',
          title: 'Design, Development, Testing & Deployment',
          duration: '25:00',
          type: 'video',
          transcript: `**Design Fase**

Vertaal requirements naar technisch ontwerp:

High-Level Design: Architectuur, hoofdcomponenten
Low-Level Design: Specifieke modules, database schema's, API specs

Design reviews zijn cruciaal om fouten vroeg te vangen.

**Development Fase**

Bouwen volgens de specs:
- Code schrijven
- Unit testing
- Code reviews
- Technische documentatie

**Testing Fase**

Verificatie op meerdere niveaus:

1. **Unit Testing**: Individuele componenten
2. **Integration Testing**: Componenten samen
3. **System Testing**: Complete systeem
4. **User Acceptance Testing (UAT)**: Eindgebruikers testen

Exit criteria voor testing:
- Alle test cases executed
- Kritieke defects fixed
- UAT sign-off

**Deployment Fase**

Uitrol naar productie:

**Approaches:**
- Big Bang: Alles in één keer
- Phased: Module voor module
- Parallel: Oud en nieuw naast elkaar
- Pilot: Eerst kleine groep

Altijd met rollback plan!`,
          keyTakeaways: [
            'Design vertaalt WAT (requirements) naar HOE (technisch)',
            'Testing gebeurt op meerdere niveaus tot en met UAT',
            'UAT sign-off is vereist voor go-live',
            'Deployment altijd met rollback plan',
          ],
        },
      ],
    },
  ],
};

// ============================================
// COURSE 6: KANBAN VOOR KENNISWERK
// ============================================

export const kanbanCourse: Course = {
  id: 'kanban-practitioner',
  title: 'Kanban voor Kenniswerk',
  subtitle: 'Optimaliseer flow en lever continue waarde',
  description: 'Kanban principes en practices toepassen op kenniswerk voor betere flow en voorspelbaarheid.',
  methodology: 'kanban',
  icon: 'Trello',
  color: '#EC4899',
  gradient: 'linear-gradient(135deg, #EC4899, #DB2777)',
  difficulty: 'Beginner',
  language: 'Nederlands',
  duration: '8',
  totalLessons: 16,
  price: 89,
  originalPrice: 179,
  freeForCustomers: true,
  certificate: true,
  rating: 4.7,
  reviewCount: 756,
  students: 3892,
  lastUpdated: '2025-01',
  whatYouLearn: [
    'De Kanban principes en 6 core practices',
    'Effectieve Kanban borden ontwerpen',
    'WIP-limieten bepalen en handhaven',
    'Flow metrics meten en analyseren',
  ],
  requirements: ['Geen voorkennis vereist'],
  targetAudience: ['Teams die hun workflow willen verbeteren', 'Managers die Kanban willen introduceren', 'Agile coaches en Scrum Masters'],
  instructor: instructors.annaBakker,
  modules: [
    {
      id: 'kb-m1',
      title: 'Module 1: Kanban Fundamenten',
      description: 'De basis: principes, practices en het Kanban bord.',
      lessons: [
        {
          id: 'kb-l1',
          title: 'Wat is Kanban?',
          duration: '15:00',
          type: 'video',
          transcript: `Kanban (看板) is Japans voor "visueel signaal". Het is een evolutionaire aanpak voor werk management.

**De 6 Core Practices:**

1. **Visualize**: Maak werk zichtbaar op een bord
2. **Limit WIP**: Beperk werk in uitvoering
3. **Manage Flow**: Monitor en optimaliseer de flow
4. **Make Policies Explicit**: Maak afspraken duidelijk
5. **Implement Feedback Loops**: Creëer feedback mechanismen
6. **Improve Collaboratively**: Verbeter samen, experimenteer

**Kanban Principes:**

**Change Management:**
1. Start met wat je nu doet
2. Kom overeen evolutionair te verbeteren
3. Moedig leiderschap aan op alle niveaus

**Service Delivery:**
1. Focus op klantbehoeften
2. Manage het werk, niet de mensen
3. Evolueer beleid regelmatig

**Start Where You Are**

Kanban vraagt geen grote reorganisatie. Je begint met je huidige proces en verbetert geleidelijk.`,
          keyTakeaways: [
            'Kanban = visueel signaal, focus op flow en pull',
            'Start waar je bent - geen grote reorganisatie nodig',
            '6 core practices vormen het hart van Kanban',
            'Kanban is complementair aan Scrum, niet een vervanging',
          ],
        },
        {
          id: 'kb-l2',
          title: 'Het Kanban Bord Ontwerpen',
          duration: '20:00',
          type: 'video',
          transcript: `Het bord visualiseert je workflow.

**Basis Structuur:**

Kolommen representeren workflow stappen:
Backlog | Analysis | Development | Review | Done

**Split Kolommen (Doing/Done):**

Maak wachttijd zichtbaar:
Dev (Doing) | Dev (Done) | Review (Doing) | Review (Done)

Als "Done" kolommen vol raken, is er een bottleneck downstream.

**Swimlanes:**

Horizontale lanes segmenteren het bord:
- Per type werk (Features, Bugs, Tech Debt)
- Per team
- Per service level (Expedite, Standard)

**WIP Limieten op het Bord:**

Elke kolom krijgt een maximum:
Analysis [3] | Dev [5] | Review [2]

**Commitment Point en Delivery Point:**

- Commitment Point: Waar start de lead time?
- Delivery Point: Waar eindigt de lead time?

Lead Time = tijd tussen deze twee punten.`,
          keyTakeaways: [
            'Begin met je werkelijke workflow te mappen',
            'Split Doing/Done om wachttijd te onthullen',
            'Maak blokkades expliciet zichtbaar',
            'Evolueer het bord op basis van inzichten',
          ],
        },
        {
          id: 'kb-l3',
          title: 'WIP Limieten',
          duration: '18:00',
          type: 'video',
          transcript: `WIP limieten zijn het hart van Kanban.

**Little's Law:**

Lead Time = WIP / Throughput

Dit betekent: minder WIP = kortere lead time (bij gelijke throughput).

**Waarom WIP Beperken?**

1. **Context Switching Kost**: Elke switch kost 15-20 minuten
2. **Werk Stapelt Op**: Zonder limieten start je steeds nieuw werk
3. **Focus**: "Stop starting, start finishing!"

**WIP Limieten Bepalen:**

Methode 1: Huidige WIP / 2
Methode 2: Aantal mensen + 1
Methode 3: Experimenteer - start te laag, verhoog als het knelt

**De Pijn is het Punt**

WIP limieten voelen ongemakkelijk. Ze onthullen:
- Bottlenecks
- Afhankelijkheden
- Onbalans in capaciteit

Als het niet knelt, zijn je limieten te los.

**Wat als de limiet bereikt is?**

1. Help werk in de volste kolom afronden
2. Wacht tot er ruimte is
3. Onderzoek de blokkade

NIET: De limiet verhogen bij het eerste ongemak!`,
          keyTakeaways: [
            'Little\'s Law: Lead Time = WIP / Throughput',
            'Context switching kost 15-20 minuten per switch',
            '"Stop starting, start finishing!"',
            'De pijn van WIP limieten onthult problemen',
          ],
        },
        {
          id: 'kb-l4',
          title: 'Flow Metrics',
          duration: '22:00',
          type: 'video',
          transcript: `"You can't improve what you don't measure."

**De Belangrijkste Metrics:**

1. **Lead Time**: Commitment → Delivery (hoe lang wacht de klant?)
2. **Cycle Time**: Tijd in een specifieke fase
3. **Throughput**: Items geleverd per tijdseenheid
4. **WIP**: Werk in uitvoering

**Cumulative Flow Diagram (CFD)**

De krachtigste Kanban visualisatie:
- X-as: Tijd
- Y-as: Aantal items
- Gebieden: Status (backlog, in progress, done)

De CFD toont:
- WIP: Verticale afstand tussen lijnen
- Lead Time: Horizontale afstand
- Throughput: Helling van "Done" lijn
- Bottlenecks: Gebieden die groeien

**Lead Time Distribution**

Kijk niet alleen naar gemiddelde:
- 85e percentiel: "85% van items binnen X dagen"
- Gebruik dit voor voorspellingen

**Flow Efficiency**

Flow Efficiency = Werktijd / Lead Time × 100%

Typisch voor kenniswerk: 5-15%!
Dat is 85-95% wachttijd - hier zit verbeterpotentieel.`,
          keyTakeaways: [
            'Lead Time = WIP / Throughput (Little\'s Law)',
            'CFD visualiseert WIP, lead time, throughput en bottlenecks',
            'Gebruik 85e percentiel voor betrouwbare voorspellingen',
            'Flow efficiency in kenniswerk is typisch 5-15%',
          ],
        },
      ],
    },
  ],
};

// ============================================
// COURSE 7: AGILE FUNDAMENTALS
// ============================================

export const agileFundamentalsCourse: Course = {
  id: 'agile-fundamentals',
  title: 'Agile Fundamentals',
  subtitle: 'De mindset en principes achter Agile werken',
  description: 'De fundamenten van Agile denken en werken, onafhankelijk van specifieke frameworks.',
  methodology: 'agile',
  icon: 'Zap',
  color: '#F59E0B',
  gradient: 'linear-gradient(135deg, #F59E0B, #D97706)',
  difficulty: 'Beginner',
  language: 'Nederlands',
  duration: '8',
  totalLessons: 16,
  price: 69,
  originalPrice: 139,
  freeForCustomers: true,
  certificate: true,
  rating: 4.8,
  reviewCount: 1124,
  students: 6234,
  lastUpdated: '2025-01',
  whatYouLearn: [
    'De Agile waarden en 12 principes begrijpen',
    'Onderscheid maken tussen Agile en traditioneel',
    'Agile toepassen buiten software development',
    'De juiste Agile aanpak kiezen voor je context',
  ],
  requirements: ['Geen voorkennis vereist', 'Open mindset voor nieuwe werkwijzen'],
  targetAudience: ['Iedereen die Agile wil begrijpen', 'Managers die Agile willen introduceren', 'Teams die beter willen samenwerken'],
  instructor: instructors.martijnVanDijk,
  modules: [
    {
      id: 'ag-m1',
      title: 'Module 1: De Agile Mindset',
      description: 'Waarden, principes en de fundamentele mindshift.',
      lessons: [
        {
          id: 'ag-l1',
          title: 'Het Agile Manifesto',
          duration: '18:00',
          type: 'video',
          transcript: `In 2001 kwamen 17 software ontwikkelaars samen in Snowbird, Utah. Na drie dagen produceerden ze het Agile Manifesto.

**De Vier Waarden:**

"We ontdekken betere manieren om software te ontwikkelen door het te doen en anderen daarbij te helpen. Hierbij zijn we gaan waarderen:

1. **Mensen en hun onderlinge interactie** boven processen en hulpmiddelen
2. **Werkende software** boven allesomvattende documentatie
3. **Samenwerking met de klant** boven contractonderhandelingen
4. **Inspelen op verandering** boven het volgen van een plan

Hoewel wij de zaken aan de rechterkant belangrijk vinden, hechten wij meer waarde aan de zaken aan de linkerkant."

**De Mindset Shift:**

| Van | Naar |
|-----|------|
| Voorspellen | Aanpassen |
| Command & control | Empowerment |
| Falen is slecht | Falen is leren |
| Plannen volgen | Waarde leveren |

**Wat Agile NIET Is:**

❌ Geen planning
❌ Geen documentatie
❌ Chaos en "we zien wel"
❌ Alleen voor software`,
          keyTakeaways: [
            'Vier waarden: Mensen, Werkende software, Klantcollaboratie, Inspelen op verandering',
            'Het gaat om prioritering, niet eliminatie van de rechterkant',
            'Agile vraagt een mindshift van voorspellen naar aanpassen',
            'Het Manifesto is een fundament, geen complete methode',
          ],
        },
        {
          id: 'ag-l2',
          title: 'De 12 Principes',
          duration: '25:00',
          type: 'video',
          transcript: `Achter de vier waarden liggen twaalf principes:

1. **Klanttevredenheid** door vroegtijdig en doorlopend opleveren van waardevolle software

2. **Verwelkom veranderende requirements**, zelfs laat in het proces

3. **Lever frequent werkende software**, met een voorkeur voor kortere intervallen

4. **Dagelijkse samenwerking** tussen business en ontwikkelaars

5. **Bouw rond gemotiveerde individuen**, geef ze de omgeving en ondersteuning

6. **Face-to-face communicatie** is de meest effectieve methode

7. **Werkende software** is de belangrijkste maatstaf voor voortgang

8. **Duurzaam tempo** - onbepaalde tijd constant tempo aanhouden

9. **Continue aandacht voor kwaliteit** versterkt wendbaarheid

10. **Eenvoud** - de kunst van het maximaliseren van niet gedaan werk

11. **Zelforganiserende teams** leveren de beste resultaten

12. **Regelmatige reflectie** en aanpassing van gedrag

De principes zijn geen checklist maar een kompas voor beslissingen.`,
          keyTakeaways: [
            'De 12 principes concretiseren de 4 waarden',
            'Focus op frequente levering van werkende software',
            'Bouw rond gemotiveerde mensen met vertrouwen',
            'Continue reflectie en verbetering is essentieel',
          ],
        },
        {
          id: 'ag-l3',
          title: 'Agile vs. Traditioneel',
          duration: '20:00',
          type: 'video',
          transcript: `**Het Stacey Diagram:**

|                | Requirements Duidelijk | Requirements Onduidelijk |
|----------------|------------------------|--------------------------|
| Techniek Bekend | Simpel (Waterfall OK) | Gecompliceerd |
| Techniek Onbekend | Gecompliceerd | Complex (Agile nodig) |

**Vergelijking:**

| Aspect | Traditioneel | Agile |
|--------|-------------|-------|
| Planning | Upfront, gedetailleerd | Rolling wave, adaptief |
| Scope | Vast | Flexibel |
| Deliverables | Aan het einde | Frequent, incrementeel |
| Verandering | Via change control | Verwelkomd |
| Succes = | Op tijd, budget, scope | Waarde geleverd |

**Het Triangle Dilemma:**

Traditioneel: Scope vast, tijd/budget variabel
Agile: Tijd/budget vast, scope variabel

Bij Agile bouwen we de belangrijkste features eerst.`,
          keyTakeaways: [
            'Traditioneel past bij voorspelbare, stabiele contexten',
            'Agile past bij onzekere, veranderlijke contexten',
            'Het Stacey diagram helpt bij het kiezen van de aanpak',
            'Hybride aanpakken combineren elementen van beide',
          ],
        },
        {
          id: 'ag-l4',
          title: 'Agile Frameworks Overzicht',
          duration: '22:00',
          type: 'video',
          transcript: `Het Manifesto biedt waarden en principes, maar geen concrete werkwijze. Daarom zijn er frameworks.

**Team-Level Frameworks:**

**Scrum**: Sprints, vaste rollen, events
**Kanban**: Flow, WIP-limieten, continue verbetering
**XP**: Engineering practices (TDD, pair programming)

**Scaling Frameworks:**

**SAFe**: Meest gebruikte scaling framework
**LeSS**: Scrum opgeschaald, simpeler
**Nexus**: Scrum.org's scaling framework

**Framework Kiezen:**

Factoren:
- Type werk
- Team grootte
- Organisatiecultuur
- Doelen

**ShuHaRi Concept:**
- Shu: Volg de regels exact
- Ha: Breek de regels bewust
- Ri: Maak je eigen regels

Begin pure, pas aan na ervaring.`,
          keyTakeaways: [
            'Frameworks zijn de HOW, het Manifesto is de WHY',
            'Scrum, Kanban, XP zijn de meest gebruikte team-frameworks',
            'SAFe, LeSS, Nexus schalen naar meerdere teams',
            'Begin pure, pas aan na ervaring (ShuHaRi)',
          ],
        },
      ],
    },
  ],
};

// ============================================
// ALL COURSES ARRAY
// ============================================

export const academyCourses: Course[] = [
  projectManagementFundamentals,
  prince2Course,
  scrumCourse,
  leanSixSigmaCourse,
  waterfallCourse,
  kanbanCourse,
  agileFundamentalsCourse,
];

// Alias for backward compatibility
export const courses = academyCourses;

// ============================================
// HELPER FUNCTIONS
// ============================================

export const getCourseById = (id: string): Course | undefined => {
  return academyCourses.find(course => course.id === id);
};

export const getCoursesByMethodology = (methodology: string): Course[] => {
  return academyCourses.filter(course => course.methodology === methodology);
};

export const getFeaturedCourses = (): Course[] => {
  return academyCourses.filter(course => course.featured);
};

export const getBestsellerCourses = (): Course[] => {
  return academyCourses.filter(course => course.bestseller);
};

export const getCourseStats = () => {
  const totalLessons = academyCourses.reduce((sum, course) => {
    return sum + course.modules.reduce((moduleSum, module) => moduleSum + module.lessons.length, 0);
  }, 0);

  return {
    totalCourses: academyCourses.length,
    totalLessons,
    totalHours: academyCourses.reduce((sum, c) => sum + parseInt(c.duration), 0),
    totalStudents: academyCourses.reduce((sum, c) => sum + c.students, 0),
  };
};

// ============================================
// LEARNING PATHS
// ============================================

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  icon: string;
  color: string;
  gradient: string;
  courses: string[];
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  certificate: boolean;
}

export const learningPaths: LearningPath[] = [
  {
    id: 'pm-career',
    title: 'Project Manager Career Path',
    description: 'Van beginner tot gecertificeerd projectmanager. Leer alle essentiële vaardigheden voor een succesvolle PM carrière.',
    icon: 'Rocket',
    color: '#8B5CF6',
    gradient: 'linear-gradient(135deg, #8B5CF6, #7C3AED)',
    courses: ['pm-fundamentals', 'prince2-practitioner', 'agile-fundamentals'],
    duration: '40',
    difficulty: 'Beginner',
    certificate: true,
  },
  {
    id: 'agile-master',
    title: 'Agile Master Path',
    description: 'Word een expert in Agile methodologieën. Van Scrum tot Kanban, leer alle frameworks.',
    icon: 'Zap',
    color: '#059669',
    gradient: 'linear-gradient(135deg, #059669, #047857)',
    courses: ['agile-fundamentals', 'scrum-master', 'kanban-practitioner'],
    duration: '30',
    difficulty: 'Intermediate',
    certificate: true,
  },
  {
    id: 'process-improvement',
    title: 'Process Improvement Specialist',
    description: 'Leer processen te analyseren en verbeteren met Lean Six Sigma en Kanban technieken.',
    icon: 'TrendingUp',
    color: '#0891B2',
    gradient: 'linear-gradient(135deg, #0891B2, #0E7490)',
    courses: ['lean-six-sigma-green-belt', 'kanban-practitioner'],
    duration: '32',
    difficulty: 'Intermediate',
    certificate: true,
  },
  {
    id: 'traditional-pm',
    title: 'Traditional PM Expert',
    description: 'Beheers de klassieke projectmanagement methodologieën voor enterprise en overheidsprojecten.',
    icon: 'Building',
    color: '#7C3AED',
    gradient: 'linear-gradient(135deg, #7C3AED, #5B21B6)',
    courses: ['pm-fundamentals', 'prince2-practitioner', 'waterfall-pm'],
    duration: '42',
    difficulty: 'Intermediate',
    certificate: true,
  },
];

export const getLearningPathById = (id: string): LearningPath | undefined => {
  return learningPaths.find(path => path.id === id);
};

// ============================================
// DEFAULT EXPORT
// ============================================

export default academyCourses;
