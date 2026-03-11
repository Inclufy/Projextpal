// src/components/MethodologyHelpPanel.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageTranslations } from '@/hooks/usePageTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  HelpCircle,
  X,
  ChevronRight,
  BookOpen,
  Lightbulb,
  Target,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Zap,
  Crown,
  GitMerge,
  BarChart3,
  Workflow,
  Kanban,
  Repeat,
  Layers,
  TrendingUp,
  Users,
  Clock,
  Gauge,
  Eye,
  Calendar,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

interface Tip {
  title: string;
  description: string;
  icon?: any;
}

interface Resource {
  title: string;
  type: 'course' | 'video' | 'article';
  duration?: string;
  link: string;
}

interface MethodologyHelpConfig {
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  description: string;
  keyPrinciples: string[];
  tips: Tip[];
  bestPractices: string[];
  resources: Resource[];
  academyTrack?: string;
}

type Lang = 'en' | 'nl';
const t = (en: string, nl: string, lang: Lang) => lang === 'nl' ? nl : en;

const getMethodologyHelp = (lang: Lang): Record<string, MethodologyHelpConfig> => ({
  agile: {
    name: 'Agile',
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: t(
      'A mindset and set of principles for flexible, iterative development focused on collaboration and customer value.',
      'Een mindset en verzameling principes voor flexibele, iteratieve ontwikkeling met focus op samenwerking en klantwaarde.',
      lang
    ),
    keyPrinciples: [
      t('Individuals and interactions over processes and tools', 'Individuen en interacties boven processen en tools', lang),
      t('Working software over comprehensive documentation', 'Werkende software boven uitgebreide documentatie', lang),
      t('Customer collaboration over contract negotiation', 'Samenwerking met de klant boven contractonderhandeling', lang),
      t('Responding to change over following a plan', 'Reageren op verandering boven het volgen van een plan', lang),
      t('Deliver working software frequently', 'Lever werkende software frequent', lang),
      t('Embrace changing requirements', 'Omarm veranderende requirements', lang),
    ],
    tips: [
      {
        title: 'User Stories',
        description: t(
          'Write user stories from the end user perspective: "As a [role] I want [feature] so that [value]"',
          'Schrijf user stories vanuit het perspectief van de eindgebruiker: "Als [rol] wil ik [functie] zodat [waarde]"',
          lang
        ),
        icon: Target,
      },
      {
        title: t('Iterative Work', 'Iteratief Werken', lang),
        description: t(
          'Deliver small increments of value instead of everything at once',
          'Lever kleine increments van waarde in plaats van alles in één keer',
          lang
        ),
        icon: RefreshCw,
      },
      {
        title: 'Feedback Loops',
        description: t(
          'Collect feedback early and often - adapt based on what you learn',
          'Verzamel vroeg en vaak feedback - pas je aan op basis van wat je leert',
          lang
        ),
        icon: TrendingUp,
      },
    ],
    bestPractices: [
      t('Keep daily standups short and focused', 'Houd dagelijkse standups kort en gefocust', lang),
      t('Visualize work on a board', 'Visualiseer werk op een board', lang),
      t('Prioritize based on value', 'Prioriteer op basis van waarde', lang),
      t('Reflect regularly and improve', 'Reflecteer regelmatig en verbeter', lang),
      t('Actively involve stakeholders', 'Betrek stakeholders actief', lang),
    ],
    resources: [
      { title: 'Agile Fundamentals', type: 'course', duration: t('2 hours', '2 uur', lang), link: '/academy/course/agile-fundamentals' },
      { title: 'Agile Manifesto Deep Dive', type: 'video', duration: '30 min', link: '/academy/course/agile-manifesto' },
      { title: t('Writing User Stories', 'User Stories Schrijven', lang), type: 'article', link: '/academy/articles/user-stories' },
    ],
    academyTrack: 'Agile Leader Track',
  },

  scrum: {
    name: 'Scrum',
    icon: Repeat,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: t(
      'An agile framework for developing and maintaining complex products through iterative sprints.',
      'Een agile framework voor het ontwikkelen en onderhouden van complexe producten door middel van iteratieve sprints.',
      lang
    ),
    keyPrinciples: [
      t('Work in short sprints (1-4 weeks)', 'Werk in korte sprints (1-4 weken)', lang),
      t('Daily standups for synchronization', 'Daily standups voor synchronisatie', lang),
      t('Product Backlog as single source of truth', 'Product Backlog als single source of truth', lang),
      t('Sprint Reviews for feedback', 'Sprint Reviews voor feedback', lang),
      t('Retrospectives for improvement', 'Retrospectives voor verbetering', lang),
      t('Self-organizing teams', 'Zelfsturende teams', lang),
    ],
    tips: [
      {
        title: 'Sprint Goal',
        description: t(
          'Define a clear sprint goal that gives the team direction',
          'Definieer een duidelijk sprint goal dat het team richting geeft',
          lang
        ),
        icon: Target,
      },
      {
        title: 'Story Points',
        description: t(
          'Use Fibonacci sequence (1, 2, 3, 5, 8, 13) for relative complexity estimation',
          'Gebruik Fibonacci reeks (1, 2, 3, 5, 8, 13) voor relatieve schatting van complexiteit',
          lang
        ),
        icon: BarChart3,
      },
      {
        title: 'Definition of Done',
        description: t(
          'Define clear criteria for when an item is "done" before you start',
          'Definieer duidelijke criteria wanneer een item "done" is voordat je begint',
          lang
        ),
        icon: CheckCircle2,
      },
    ],
    bestPractices: [
      t('Keep sprints consistent in length', 'Houd sprints consistent qua lengte', lang),
      t('Protect the team from scope creep during sprint', 'Bescherm het team tegen scope creep tijdens sprint', lang),
      t('Ensure the Product Owner is available for questions', 'Zorg dat de Product Owner beschikbaar is voor vragen', lang),
      t('Strictly timebox meetings', 'Timeboxen vergaderingen strikt', lang),
      t('Visualize work on a Scrum board', 'Visualiseer werk op een Scrum board', lang),
    ],
    resources: [
      { title: 'Scrum Fundamentals', type: 'course', duration: t('2 hours', '2 uur', lang), link: '/academy/course/scrum-fundamentals' },
      { title: 'Sprint Planning Masterclass', type: 'video', duration: '45 min', link: '/academy/course/sprint-planning' },
      { title: 'Scrum Events Guide', type: 'article', link: '/academy/articles/scrum-events' },
    ],
    academyTrack: 'Scrum Master Track',
  },

  kanban: {
    name: 'Kanban',
    icon: Kanban,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: t(
      'A visual workflow management method focused on continuous delivery by limiting Work in Progress.',
      'Een visuele methode voor werkbeheer die zich richt op continue levering door het beperken van Work in Progress.',
      lang
    ),
    keyPrinciples: [
      t('Visualize the workflow', 'Visualiseer de workflow', lang),
      t('Limit Work in Progress (WIP)', 'Beperk Work in Progress (WIP)', lang),
      t('Manage flow', 'Manage flow', lang),
      t('Make policies explicit', 'Maak policies expliciet', lang),
      t('Implement feedback loops', 'Implementeer feedback loops', lang),
      t('Improve collaboratively, evolve experimentally', 'Verbeter collaboratief, evolueer experimenteel', lang),
    ],
    tips: [
      {
        title: 'WIP Limits',
        description: t(
          'Start with WIP limit = number of team members, adjust based on data',
          'Start met WIP limit = aantal teamleden, pas aan op basis van data',
          lang
        ),
        icon: Gauge,
      },
      {
        title: 'Lead Time',
        description: t(
          'Measure lead time (start to finish) to improve predictability',
          'Meet lead time (start tot klaar) om voorspelbaarheid te verbeteren',
          lang
        ),
        icon: Clock,
      },
      {
        title: t('Blockers', 'Blokkades', lang),
        description: t(
          'Visualize blockers immediately and address them with priority',
          'Visualiseer blokkades direct en pak ze met prioriteit aan',
          lang
        ),
        icon: Eye,
      },
    ],
    bestPractices: [
      t('Stop starting, start finishing', 'Stop starting, start finishing', lang),
      t('Respect WIP limits as a team', 'Respecteer WIP limits als team', lang),
      t('Keep the board up-to-date', 'Houd het board up-to-date', lang),
      t('Focus on throughput time, not busyness', 'Focus op doorlooptijd, niet op drukte', lang),
      t('Analyze flow metrics regularly', 'Analyseer flow metrics regelmatig', lang),
    ],
    resources: [
      { title: 'Kanban Essentials', type: 'course', duration: t('2 hours', '2 uur', lang), link: '/academy/course/kanban-essentials' },
      { title: 'WIP Limits Masterclass', type: 'video', duration: '30 min', link: '/academy/course/wip-limits' },
      { title: 'Cumulative Flow Diagrams', type: 'article', link: '/academy/articles/cfd' },
    ],
    academyTrack: 'Agile Leader Track',
  },

  prince2: {
    name: 'PRINCE2',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    description: t(
      'A structured project management methodology focused on business justification and defined roles.',
      'Een gestructureerde projectmanagement methodologie met focus op business justification en gedefinieerde rollen.',
      lang
    ),
    keyPrinciples: [
      'Continued Business Justification',
      'Learn from Experience',
      'Defined Roles & Responsibilities',
      'Manage by Stages',
      'Manage by Exception',
      'Focus on Products',
      'Tailor to the Environment',
    ],
    tips: [
      {
        title: 'Business Case',
        description: t(
          'The Business Case is the foundation - update it at every stage gate',
          'De Business Case is het fundament - update deze bij elke stage gate',
          lang
        ),
        icon: Target,
      },
      {
        title: 'Product Descriptions',
        description: t(
          'Define clear Product Descriptions with quality criteria before you start',
          'Definieer duidelijke Product Descriptions met kwaliteitscriteria vóór je begint',
          lang
        ),
        icon: CheckCircle2,
      },
      {
        title: 'Exception Reports',
        description: t(
          'Escalate proactively when tolerance limits are exceeded',
          'Escaleer proactief wanneer tolerantiegrenzen worden overschreden',
          lang
        ),
        icon: Lightbulb,
      },
    ],
    bestPractices: [
      t('Keep the Business Case alive throughout the project', 'Houd de Business Case levend gedurende het project', lang),
      t('Define clear tolerances per stage', 'Definieer duidelijke toleranties per stage', lang),
      t('Conduct End Stage Assessments thoroughly', 'Voer End Stage Assessments grondig uit', lang),
      t('Document Lessons Learned continuously', 'Documenteer Lessons Learned continu', lang),
      t('Use Work Packages for delegation', 'Gebruik Work Packages voor delegatie', lang),
    ],
    resources: [
      { title: 'PRINCE2 Foundation', type: 'course', duration: t('8 hours', '8 uur', lang), link: '/academy/course/prince2-foundation' },
      { title: 'Business Case Development', type: 'video', duration: '30 min', link: '/academy/course/business-case' },
      { title: 'Stage Gate Reviews', type: 'article', link: '/academy/articles/stage-gates' },
    ],
    academyTrack: 'Project Manager Track',
  },

  waterfall: {
    name: 'Waterfall',
    icon: Workflow,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    description: t(
      'A sequential approach where each phase is fully completed before the next begins.',
      'Een sequentiële aanpak waarbij elke fase volledig wordt afgerond voordat de volgende begint.',
      lang
    ),
    keyPrinciples: [
      t('Sequential phases', 'Sequentiële fases', lang),
      t('Comprehensive documentation', 'Uitgebreide documentatie', lang),
      t('Clear milestones', 'Duidelijke milestones', lang),
      t('Formal sign-offs', 'Formele sign-offs', lang),
      t('Pre-defined scope', 'Vooraf gedefinieerde scope', lang),
    ],
    tips: [
      {
        title: 'Requirements',
        description: t(
          'Invest extra time in requirements gathering - changes later are costly',
          'Investeer extra tijd in requirements gathering - wijzigingen later zijn kostbaar',
          lang
        ),
        icon: Target,
      },
      {
        title: 'Sign-offs',
        description: t(
          'Obtain formal approval at the end of each phase',
          'Verkrijg formele goedkeuring aan het einde van elke fase',
          lang
        ),
        icon: CheckCircle2,
      },
      {
        title: 'Change Control',
        description: t(
          'Implement a strict change control process for scope changes',
          'Implementeer een strikt change control proces voor scope wijzigingen',
          lang
        ),
        icon: Lightbulb,
      },
    ],
    bestPractices: [
      t('Document requirements extensively', 'Documenteer requirements uitgebreid', lang),
      t('Plan buffer time for unforeseen issues', 'Plan buffer tijd voor onvoorziene issues', lang),
      t('Keep stakeholders engaged at milestones', 'Houd stakeholders betrokken bij milestones', lang),
      t('Test thoroughly in the testing phase', 'Test grondig in de testfase', lang),
      t('Prepare deployment documentation', 'Bereid deployment documentation voor', lang),
    ],
    resources: [
      { title: 'Waterfall Methodology', type: 'course', duration: t('4 hours', '4 uur', lang), link: '/academy/course/waterfall' },
      { title: 'Requirements Engineering', type: 'video', duration: t('1 hour', '1 uur', lang), link: '/academy/course/requirements' },
      { title: 'Testing Strategies', type: 'article', link: '/academy/articles/testing' },
    ],
    academyTrack: 'Project Manager Track',
  },

  lean_six_sigma: {
    name: 'Lean Six Sigma',
    icon: BarChart3,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    description: t(
      'A data-driven methodology for process improvement by eliminating waste and variation.',
      'Een data-gedreven methodologie voor procesverbetering door het elimineren van verspilling en variatie.',
      lang
    ),
    keyPrinciples: [
      t('Define - Measure - Analyze - Improve - Control (DMAIC)', 'Define - Meet - Analyze - Improve - Control (DMAIC)', lang),
      t('Focus on customer value', 'Focus op klantwaarde', lang),
      t('Data-driven decision making', 'Data-gedreven besluitvorming', lang),
      t('Eliminate waste (Muda)', 'Elimineer verspilling (Muda)', lang),
      t('Reduce variation', 'Reduceer variatie', lang),
      t('Continuous improvement (Kaizen)', 'Continue verbetering (Kaizen)', lang),
    ],
    tips: [
      {
        title: 'DMAIC',
        description: t(
          'Follow the DMAIC cycle strictly - do not skip steps',
          'Volg de DMAIC cyclus strikt - sla geen stappen over',
          lang
        ),
        icon: Target,
      },
      {
        title: 'Voice of Customer',
        description: t(
          'Always start by understanding what the customer values',
          'Begin altijd met het begrijpen van wat de klant waardeert',
          lang
        ),
        icon: Lightbulb,
      },
      {
        title: 'Root Cause',
        description: t(
          "Use 5 Why's and Fishbone diagrams to find root causes",
          "Gebruik 5 Why's en Fishbone diagrams om root causes te vinden",
          lang
        ),
        icon: CheckCircle2,
      },
    ],
    bestPractices: [
      t('Base decisions on data, not assumptions', 'Baseer beslissingen op data, niet aannames', lang),
      t('Involve process owners in improvements', 'Betrek process owners bij verbeteringen', lang),
      t('Measure before and after implementation', 'Meet voor én na implementatie', lang),
      t('Standardize improved processes', 'Standaardiseer verbeterde processen', lang),
      t('Train employees in new methods', 'Train medewerkers in nieuwe werkwijzen', lang),
    ],
    resources: [
      { title: 'Lean Six Sigma Yellow Belt', type: 'course', duration: t('6 hours', '6 uur', lang), link: '/academy/course/lss-yellow' },
      { title: 'DMAIC Deep Dive', type: 'video', duration: t('2 hours', '2 uur', lang), link: '/academy/course/dmaic' },
      { title: 'Statistical Tools', type: 'article', link: '/academy/articles/lss-tools' },
    ],
    academyTrack: 'Process Improvement Track',
  },

  hybrid: {
    name: 'Hybrid',
    icon: GitMerge,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    description: t(
      'A flexible combination of methodologies, adapted to the specific needs of your project.',
      'Een flexibele combinatie van methodologieën, aangepast aan de specifieke behoeften van je project.',
      lang
    ),
    keyPrinciples: [
      t('Combine the best of different methodologies', 'Combineer het beste van verschillende methodologieën', lang),
      t('Adapt based on project context', 'Pas aan op basis van projectcontext', lang),
      t('Balance structure and flexibility', 'Balanceer structuur en flexibiliteit', lang),
      t('Focus on value delivery', 'Focus op waarde levering', lang),
      t('Iterative where possible, sequential where needed', 'Iteratief waar mogelijk, sequentieel waar nodig', lang),
    ],
    tips: [
      {
        title: 'Mix & Match',
        description: t(
          'Use agile for development and waterfall for governance',
          'Gebruik agile voor ontwikkeling en waterfall voor governance',
          lang
        ),
        icon: GitMerge,
      },
      {
        title: t('Document your approach', 'Documenteer je aanpak', lang),
        description: t(
          'Record which elements you use from which methodology',
          'Leg vast welke elementen je van welke methodologie gebruikt',
          lang
        ),
        icon: Lightbulb,
      },
      {
        title: t('Be consistent', 'Wees consistent', lang),
        description: t(
          'Choose an approach and stick with it - do not switch constantly',
          'Kies een aanpak en blijf erbij - wissel niet continu',
          lang
        ),
        icon: CheckCircle2,
      },
    ],
    bestPractices: [
      t('Clearly define which parts are agile/waterfall', 'Definieer duidelijk welke delen agile/waterfall zijn', lang),
      t('Align expectations with stakeholders', 'Stem verwachtingen af met stakeholders', lang),
      t('Keep governance simple', 'Houd governance eenvoudig', lang),
      t('Review and adjust as needed', 'Review en pas aan indien nodig', lang),
      t('Train team in the chosen hybrid approach', 'Train team in de gekozen hybride aanpak', lang),
    ],
    resources: [
      { title: 'Hybrid Project Management', type: 'course', duration: t('3 hours', '3 uur', lang), link: '/academy/course/hybrid-pm' },
      { title: t('Agile in Waterfall Environments', 'Agile in Waterfall Omgevingen', lang), type: 'video', duration: '45 min', link: '/academy/course/agile-waterfall' },
      { title: 'Choosing Your Approach', type: 'article', link: '/academy/articles/hybrid-approach' },
    ],
    academyTrack: 'Project Manager Track',
  },

  safe: {
    name: 'SAFe',
    icon: Layers,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: t(
      'Scaled Agile Framework for scaling agile practices to enterprise level with multiple teams.',
      'Scaled Agile Framework voor het schalen van agile praktijken naar enterprise niveau met meerdere teams.',
      lang
    ),
    keyPrinciples: [
      'Take an economic view',
      'Apply systems thinking',
      'Assume variability; preserve options',
      'Build incrementally with fast learning cycles',
      'Base milestones on objective evaluation',
      'Visualize and limit WIP',
      'Apply cadence, synchronize with cross-domain planning',
    ],
    tips: [
      {
        title: 'PI Planning',
        description: t(
          'PI Planning is the heartbeat - prepare thoroughly with clear vision and backlog',
          'PI Planning is het heartbeat - bereid grondig voor met duidelijke visie en backlog',
          lang
        ),
        icon: Calendar,
      },
      {
        title: 'Dependencies',
        description: t(
          'Visualize and actively manage dependencies via the Program Board',
          'Visualiseer en manage dependencies actief via de Program Board',
          lang
        ),
        icon: Layers,
      },
      {
        title: 'System Demo',
        description: t(
          'Integrate all team work every iteration - no exceptions',
          'Integreer alle team werk elke iteratie - geen uitzonderingen',
          lang
        ),
        icon: Eye,
      },
    ],
    bestPractices: [
      t('Train all team members in SAFe basics', 'Train alle teamleden in SAFe basics', lang),
      t('Hold PI Planning face-to-face if possible', 'Houd PI Planning face-to-face indien mogelijk', lang),
      t('Use Scrum of Scrums for daily coordination', 'Use Scrum of Scrums voor dagelijkse coördinatie', lang),
      t('Protect Innovation & Planning time', 'Bescherm Innovation & Planning time', lang),
      t('Measure business value, not just velocity', 'Meet business value, niet alleen velocity', lang),
    ],
    resources: [
      { title: 'SAFe Fundamentals', type: 'course', duration: t('4 hours', '4 uur', lang), link: '/academy/course/safe-fundamentals' },
      { title: 'PI Planning Guide', type: 'video', duration: t('1 hour', '1 uur', lang), link: '/academy/course/pi-planning' },
      { title: 'ART Launch Checklist', type: 'article', link: '/academy/articles/art-launch' },
    ],
    academyTrack: 'SAFe Practitioner Track',
  },

  msp: {
    name: 'MSP',
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: t(
      'Managing Successful Programmes - UK government standard for benefits-driven programme management.',
      'Managing Successful Programmes - UK government standaard voor benefits-gedreven programma management.',
      lang
    ),
    keyPrinciples: [
      'Remaining aligned with corporate strategy',
      'Leading change',
      'Envisioning and communicating a better future',
      'Focusing on benefits and threats to them',
      'Adding value',
      'Designing and delivering a coherent capability',
      'Learning from experience',
    ],
    tips: [
      {
        title: 'Blueprint',
        description: t(
          'The Blueprint describes the future - keep it alive and current',
          'De Blueprint beschrijft de toekomst - houd deze levend en actueel',
          lang
        ),
        icon: Target,
      },
      {
        title: 'Benefits',
        description: t(
          'Track benefits actively - they are the goal, not the outputs',
          'Track benefits actief - ze zijn het doel, niet de outputs',
          lang
        ),
        icon: TrendingUp,
      },
      {
        title: 'Stakeholders',
        description: t(
          'Invest in stakeholder engagement - change management is crucial',
          'Investeer in stakeholder engagement - change management is cruciaal',
          lang
        ),
        icon: Users,
      },
    ],
    bestPractices: [
      t('Link everything back to the Blueprint', 'Link alles terug naar de Blueprint', lang),
      t('Measure benefits, not just deliverables', 'Measure benefits, niet alleen deliverables', lang),
      t('Manage stakeholder expectations actively', 'Manage stakeholder expectations actief', lang),
      t('Plan tranches with clear capabilities', 'Plan tranches met duidelijke capabilities', lang),
      t('Prepare the organization for change', 'Bereid organisatie voor op verandering', lang),
    ],
    resources: [
      { title: 'MSP Foundation', type: 'course', duration: t('8 hours', '8 uur', lang), link: '/academy/course/msp-foundation' },
      { title: 'Benefits Management', type: 'video', duration: '45 min', link: '/academy/course/benefits-management' },
      { title: 'Blueprint Design', type: 'article', link: '/academy/articles/blueprint' },
    ],
    academyTrack: 'Programme Manager Track',
  },

  pmi: {
    name: 'PMI Standard',
    icon: BarChart3,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: t(
      "PMI's framework for managing related projects to achieve strategic goals.",
      "PMI's framework voor het managen van gerelateerde projecten om strategische doelen te bereiken.",
      lang
    ),
    keyPrinciples: [
      'Program Strategy Alignment',
      'Program Benefits Management',
      'Program Stakeholder Engagement',
      'Program Governance',
      'Program Life Cycle Management',
    ],
    tips: [
      {
        title: 'Strategic Alignment',
        description: t(
          'Ensure the program remains continuously aligned with organizational strategy',
          'Zorg dat het programma continue aligned blijft met organisatie strategie',
          lang
        ),
        icon: Target,
      },
      {
        title: 'Benefits Register',
        description: t(
          'Maintain an active Benefits Register and track realization',
          'Houd een actieve Benefits Register bij en track realisatie',
          lang
        ),
        icon: TrendingUp,
      },
      {
        title: 'Governance',
        description: t(
          'Define clear governance with decision-making processes',
          'Definieer duidelijke governance met besluitvormingsprocessen',
          lang
        ),
        icon: Users,
      },
    ],
    bestPractices: [
      t('Focus on program level, not project details', 'Focus op programma niveau, niet project details', lang),
      t('Actively manage dependencies between projects', 'Manage dependencies tussen projecten actief', lang),
      t('Track benefits through to after program end', 'Track benefits door tot na programma einde', lang),
      t('Keep stakeholder engagement plan current', 'Houd stakeholder engagement plan actueel', lang),
      t('Review strategic fit regularly', 'Review strategic fit regelmatig', lang),
    ],
    resources: [
      { title: 'PgMP Preparation', type: 'course', duration: t('12 hours', '12 uur', lang), link: '/academy/course/pgmp-prep' },
      { title: 'Program Governance', type: 'video', duration: t('1 hour', '1 uur', lang), link: '/academy/course/program-governance' },
      { title: 'Benefits Realization', type: 'article', link: '/academy/articles/benefits-realization' },
    ],
    academyTrack: 'Programme Manager Track',
  },

  prince2_programme: {
    name: 'P2 Programme',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    description: t(
      'PRINCE2 principles applied at programme level with focus on governance and tranches.',
      'PRINCE2 principes toegepast op programma niveau met focus op governance en tranches.',
      lang
    ),
    keyPrinciples: [
      'Continued Business Justification',
      'Learn from Experience',
      'Defined Roles & Responsibilities',
      'Manage by Tranches',
      'Manage by Exception',
      'Focus on Capabilities',
      'Tailor to the Environment',
    ],
    tips: [
      {
        title: 'Programme Brief',
        description: t(
          'The Programme Brief is your starting point - ensure strategy link is clear',
          'De Programme Brief is je startpunt - zorg dat strategie link duidelijk is',
          lang
        ),
        icon: Target,
      },
      {
        title: 'Tranches',
        description: t(
          'Each tranche must deliver measurable benefits - plan them carefully',
          'Elke tranche moet meetbare benefits opleveren - plan ze zorgvuldig',
          lang
        ),
        icon: Layers,
      },
      {
        title: 'Business Change',
        description: t(
          'Business Change Manager is critical for benefits realization',
          'Business Change Manager is kritiek voor benefits realisatie',
          lang
        ),
        icon: Users,
      },
    ],
    bestPractices: [
      t('Review Business Case at every tranche boundary', 'Review Business Case bij elke tranche boundary', lang),
      t('Plan benefits reviews after program end', 'Plan benefits reviews na programma einde', lang),
      t('Document lessons learned continuously', 'Documenteer lessons learned continu', lang),
      t('Manage risks at both program and project level', 'Manage risks op programma én project niveau', lang),
      t('Keep governance proportional', 'Houd governance proportioneel', lang),
    ],
    resources: [
      { title: 'PRINCE2 for Programmes', type: 'course', duration: t('8 hours', '8 uur', lang), link: '/academy/course/prince2-programme' },
      { title: 'Tranche Management', type: 'video', duration: '45 min', link: '/academy/course/tranches' },
      { title: 'Programme Governance', type: 'article', link: '/academy/articles/programme-governance' },
    ],
    academyTrack: 'Programme Manager Track',
  },
});

// Mapping for variants
const getHelpConfig = (methodology: string, lang: Lang): MethodologyHelpConfig => {
  const helpData = getMethodologyHelp(lang);

  // Direct match
  if (helpData[methodology]) {
    return helpData[methodology];
  }

  // Map variants
  const methodologyMap: Record<string, string> = {
    'lean_six_sigma_green': 'lean_six_sigma',
    'lean_six_sigma_black': 'lean_six_sigma',
  };

  const mapped = methodologyMap[methodology];
  if (mapped && helpData[mapped]) {
    return helpData[mapped];
  }

  // Fallback
  return helpData.hybrid;
};

interface MethodologyHelpPanelProps {
  methodology: string;
  currentPage?: string;
  className?: string;
}

export const MethodologyHelpPanel = ({
  methodology,
  currentPage,
  className
}: MethodologyHelpPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'tips' | 'practices' | 'resources'>('tips');
  const navigate = useNavigate();
  const { pt } = usePageTranslations();
  const { language } = useLanguage();

  const lang: Lang = language === 'nl' ? 'nl' : 'en';
  const config = getHelpConfig(methodology, lang);
  const Icon = config.icon;

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className={cn(
          "fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50",
          config.bgColor,
          "hover:scale-110 transition-transform"
        )}
        size="icon"
      >
        <HelpCircle className={cn("h-6 w-6", config.color)} />
      </Button>
    );
  }

  return (
    <Card className={cn(
      "fixed bottom-6 right-6 w-96 max-h-[80vh] shadow-xl z-50 flex flex-col",
      className
    )}>
      <CardHeader className={cn("pb-3", config.bgColor)}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className={cn("p-2 rounded-lg bg-white/80")}>
              <Icon className={cn("h-5 w-5", config.color)} />
            </div>
            <div>
              <CardTitle className="text-lg">{config.name} {pt("Help")}</CardTitle>
              <p className="text-xs text-muted-foreground">{pt("Contextual guidance")}</p>
            </div>
          </div>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>

      <div className="border-b px-4 py-2 flex gap-1">
        {(['tips', 'practices', 'resources'] as const).map((tab) => (
          <Button
            key={tab}
            variant={activeTab === tab ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab(tab)}
            className="flex-1 text-xs"
          >
            {tab === 'tips' && <Lightbulb className="h-3 w-3 mr-1" />}
            {tab === 'practices' && <CheckCircle2 className="h-3 w-3 mr-1" />}
            {tab === 'resources' && <BookOpen className="h-3 w-3 mr-1" />}
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
          </Button>
        ))}
      </div>

      <ScrollArea className="flex-1 p-4">
        {activeTab === 'tips' && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground mb-4">{config.description}</p>
            {config.tips.map((tip, i) => {
              const TipIcon = tip.icon || Lightbulb;
              return (
                <div key={i} className="flex gap-3 p-3 bg-muted/50 rounded-lg">
                  <TipIcon className={cn("h-5 w-5 mt-0.5 flex-shrink-0", config.color)} />
                  <div>
                    <p className="font-medium text-sm">{tip.title}</p>
                    <p className="text-xs text-muted-foreground">{tip.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {activeTab === 'practices' && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <Target className={cn("h-4 w-4", config.color)} />
                {pt("Key Principles")}
              </h4>
              <ul className="space-y-1">
                {config.keyPrinciples.map((principle, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    {principle}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-2 flex items-center gap-2">
                <CheckCircle2 className={cn("h-4 w-4", config.color)} />
                {pt("Best Practices")}
              </h4>
              <ul className="space-y-1">
                {config.bestPractices.map((practice, i) => (
                  <li key={i} className="text-xs text-muted-foreground flex items-start gap-2">
                    <ChevronRight className="h-3 w-3 mt-0.5 flex-shrink-0" />
                    {practice}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="space-y-3">
            {config.academyTrack && (
              <div
                className={cn("p-3 rounded-lg cursor-pointer hover:opacity-80", config.bgColor)}
                onClick={() => navigate('/academy/marketplace')}
              >
                <div className="flex items-center gap-2">
                  <GraduationCap className={cn("h-5 w-5", config.color)} />
                  <div>
                    <p className="font-medium text-sm">{pt("Recommended Track")}</p>
                    <p className="text-xs text-muted-foreground">{config.academyTrack}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 ml-auto" />
                </div>
              </div>
            )}
            {config.resources.map((resource, i) => (
              <div
                key={i}
                className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(resource.link)}
              >
                <BookOpen className={cn("h-4 w-4", config.color)} />
                <div className="flex-1">
                  <p className="text-sm font-medium">{resource.title}</p>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {resource.type}
                    </Badge>
                    {resource.duration && (
                      <span className="text-xs text-muted-foreground">{resource.duration}</span>
                    )}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
              </div>
            ))}
          </div>
        )}
      </ScrollArea>

      <div className="border-t p-3">
        <Button
          className="w-full gap-2"
          variant="outline"
          onClick={() => navigate('/academy/marketplace')}
        >
          <GraduationCap className="h-4 w-4" />
          {pt("Explore Full Academy")}
        </Button>
      </div>
    </Card>
  );
};

export default MethodologyHelpPanel;
