// src/components/MethodologyOnboardingWizard.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Zap,
  Crown,
  GitMerge,
  BarChart3,
  Workflow,
  Target,
  Users,
  FileText,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Lightbulb,
  Play,
  BookOpen,
  Kanban,
  Repeat,
  TrendingUp,
  Layers,
  Award,
  Settings,
  Eye,
  Clock,
  Gauge,
  RefreshCw,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MethodologyStep {
  title: string;
  description: string;
  icon: any;
  details: string[];
  tip: string;
}

interface MethodologyOnboardingConfig {
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  tagline: string;
  overview: string;
  whenToUse: string[];
  keyRoles: { name: string; description: string }[];
  keyArtifacts: { name: string; description: string }[];
  steps: MethodologyStep[];
  academyCourse?: { title: string; link: string };
}

const ONBOARDING_CONFIG: Record<string, MethodologyOnboardingConfig> = {
  // ============================================
  // AGILE (Generic)
  // ============================================
  agile: {
    name: 'Agile',
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    tagline: 'Flexibel en iteratief werken',
    overview: 'Agile is een mindset en verzameling van principes voor flexibele softwareontwikkeling. Het draait om samenwerking, klantfeedback, en het vermogen om snel te reageren op verandering.',
    whenToUse: [
      'Requirements zijn onzeker of veranderen vaak',
      'Snelle feedback van klanten is belangrijk',
      'Teams hebben autonomie nodig',
      'Projecten waar innovatie centraal staat',
    ],
    keyRoles: [
      { name: 'Product Owner', description: 'Vertegenwoordigt de klant en beheert prioriteiten' },
      { name: 'Team Lead', description: 'Faciliteert het team en verwijdert obstakels' },
      { name: 'Development Team', description: 'Cross-functioneel team dat waarde levert' },
    ],
    keyArtifacts: [
      { name: 'Product Backlog', description: 'Geprioriteerde lijst van gewenste features' },
      { name: 'User Stories', description: 'Beschrijving van features vanuit gebruikersperspectief' },
      { name: 'Working Software', description: 'Werkende software als primaire maatstaf van voortgang' },
    ],
    steps: [
      {
        title: 'Visie & Planning',
        description: 'Definieer de productvisie en high-level roadmap',
        icon: Target,
        details: [
          'Stel een duidelijke productvisie op',
          'Identificeer key stakeholders',
          'Maak een initiële product backlog',
          'Plan releases op hoog niveau',
        ],
        tip: 'De visie geeft richting, maar blijf flexibel in de details',
      },
      {
        title: 'Iteratie Planning',
        description: 'Plan werk voor de komende iteratie',
        icon: Calendar,
        details: [
          'Selecteer items van de backlog',
          'Breek werk op in taken',
          'Schat de effort in',
          'Commit als team aan de iteratie',
        ],
        tip: 'Plan niet meer dan het team realistisch kan leveren',
      },
      {
        title: 'Uitvoering',
        description: 'Werk iteratief aan de hoogste prioriteiten',
        icon: Zap,
        details: [
          'Dagelijkse standup meetings',
          'Werk aan hoogst geprioriteerde items',
          'Continue integratie en testing',
          'Visualiseer voortgang',
        ],
        tip: 'Focus op het opleveren van werkende software',
      },
      {
        title: 'Review & Demo',
        description: 'Toon resultaten aan stakeholders',
        icon: Play,
        details: [
          'Demonstreer werkende features',
          'Verzamel feedback',
          'Pas backlog prioriteiten aan',
          'Vier successen',
        ],
        tip: 'Feedback is een cadeau - omarm het!',
      },
      {
        title: 'Retrospective',
        description: 'Leer en verbeter continu',
        icon: RefreshCw,
        details: [
          'Reflecteer op het proces',
          'Identificeer verbeterpunten',
          'Definieer concrete acties',
          'Implementeer verbeteringen',
        ],
        tip: 'Kleine verbeteringen stapelen op tot grote impact',
      },
    ],
    academyCourse: { title: 'Agile Fundamentals', link: '/academy/courses/agile-fundamentals' },
  },

  // ============================================
  // SCRUM
  // ============================================
  scrum: {
    name: 'Scrum',
    icon: Repeat,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    tagline: 'Agile framework voor complexe productontwikkeling',
    overview: 'Scrum is een agile framework waarin teams in korte sprints (1-4 weken) werken aan waardevol product increments. Door regelmatige feedback en aanpassing lever je continu waarde aan de klant.',
    whenToUse: [
      'Complexe productontwikkeling met onzekere requirements',
      'Teams die snel willen kunnen aanpassen aan verandering',
      'Projecten waar klantfeedback cruciaal is',
      'Cross-functionele teams van 5-9 mensen',
    ],
    keyRoles: [
      { name: 'Product Owner', description: 'Beheert de Product Backlog en vertegenwoordigt stakeholders' },
      { name: 'Scrum Master', description: 'Faciliteert het Scrum proces en verwijdert impediments' },
      { name: 'Development Team', description: 'Zelfsturend team dat het product bouwt' },
    ],
    keyArtifacts: [
      { name: 'Product Backlog', description: 'Geprioriteerde lijst van alle gewenste features' },
      { name: 'Sprint Backlog', description: 'Items geselecteerd voor de huidige sprint' },
      { name: 'Increment', description: 'Het werkende product aan het einde van elke sprint' },
    ],
    steps: [
      {
        title: 'Sprint Planning',
        description: 'Plan welk werk het team in de sprint gaat doen',
        icon: Calendar,
        details: [
          'Review de Product Backlog met het team',
          'Selecteer items voor de Sprint Backlog',
          'Definieer het Sprint Goal',
          'Schat werk in story points',
        ],
        tip: 'Houd de planning meeting getimet - max 2 uur voor een 2-weeks sprint',
      },
      {
        title: 'Daily Scrum',
        description: 'Dagelijkse 15-minuten synchronisatie',
        icon: Users,
        details: [
          'Wat heb ik gisteren gedaan?',
          'Wat ga ik vandaag doen?',
          'Zijn er impediments?',
        ],
        tip: 'Sta op tijdens de daily - het houdt de meeting kort!',
      },
      {
        title: 'Sprint Execution',
        description: 'Team werkt aan de Sprint Backlog items',
        icon: Zap,
        details: [
          'Werk aan hoogst geprioriteerde items eerst',
          'Update de Sprint Board dagelijks',
          'Pair programming en code reviews',
          'Houd de burndown chart bij',
        ],
        tip: 'Bescherm het team tegen scope creep tijdens de sprint',
      },
      {
        title: 'Sprint Review',
        description: 'Demo het werkende product aan stakeholders',
        icon: Play,
        details: [
          'Demonstreer voltooide features',
          'Verzamel feedback van stakeholders',
          'Bespreek wat wel/niet is opgeleverd',
          'Update de Product Backlog',
        ],
        tip: 'Laat het échte product zien, geen presentaties',
      },
      {
        title: 'Sprint Retrospective',
        description: 'Team reflecteert op het proces',
        icon: Lightbulb,
        details: [
          'Wat ging goed?',
          'Wat kan beter?',
          'Welke acties nemen we mee?',
        ],
        tip: 'Maak het veilig om eerlijk te zijn - no blame!',
      },
    ],
    academyCourse: { title: 'Scrum Fundamentals Course', link: '/academy/courses/scrum-fundamentals' },
  },

  // ============================================
  // KANBAN
  // ============================================
  kanban: {
    name: 'Kanban',
    icon: Kanban,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    tagline: 'Visualiseer werk, beperk WIP, optimaliseer flow',
    overview: 'Kanban is een visuele methode voor werkbeheer die zich richt op continue levering zonder het huidige proces te overbelasten. Het kernprincipe is het beperken van Work in Progress (WIP) om flow te optimaliseren.',
    whenToUse: [
      'Continue stroom van werk (support, maintenance)',
      'Teams die geen vaste iteraties willen',
      'Wanneer prioriteiten vaak veranderen',
      'Procesverbetering zonder grote veranderingen',
    ],
    keyRoles: [
      { name: 'Service Request Manager', description: 'Beheert de instroom van werk' },
      { name: 'Service Delivery Manager', description: 'Zorgt voor soepele doorstroom' },
      { name: 'Team Members', description: 'Trekken werk wanneer ze capaciteit hebben' },
    ],
    keyArtifacts: [
      { name: 'Kanban Board', description: 'Visuele weergave van werk in verschillende stadia' },
      { name: 'WIP Limits', description: 'Maximum aantal items per kolom/fase' },
      { name: 'Cumulative Flow Diagram', description: 'Visualisatie van flow over tijd' },
    ],
    steps: [
      {
        title: 'Visualiseer Werk',
        description: 'Maak al het werk zichtbaar op een board',
        icon: Eye,
        details: [
          'Definieer workflow kolommen (To Do, Doing, Done)',
          'Maak kaarten voor alle werkitems',
          'Visualiseer blokkades en wachttijden',
          'Gebruik kleuren voor werktype',
        ],
        tip: 'Als het niet op het board staat, bestaat het niet',
      },
      {
        title: 'Beperk WIP',
        description: 'Stel limieten in voor Work in Progress',
        icon: Gauge,
        details: [
          'Bepaal WIP limits per kolom',
          'Start conservatief en pas aan',
          'Stop starting, start finishing',
          'Respecteer de limieten als team',
        ],
        tip: 'Te veel WIP = langere doorlooptijd voor alles',
      },
      {
        title: 'Beheer Flow',
        description: 'Optimaliseer de doorstroom van werk',
        icon: TrendingUp,
        details: [
          'Monitor lead time en cycle time',
          'Identificeer bottlenecks',
          'Verwijder blokkades snel',
          'Balanceer vraag en capaciteit',
        ],
        tip: 'Focus op het verkorten van doorlooptijd, niet op drukte',
      },
      {
        title: 'Maak Policies Expliciet',
        description: 'Definieer duidelijke werkafspraken',
        icon: FileText,
        details: [
          'Definition of Done per kolom',
          'Prioriteringsregels',
          'Escalatie procedures',
          'Service Level Expectations',
        ],
        tip: 'Expliciete regels voorkomen discussies',
      },
      {
        title: 'Verbeter Continu',
        description: 'Gebruik data om te verbeteren',
        icon: RefreshCw,
        details: [
          'Analyseer flow metrics',
          'Houd regelmatig retrospectives',
          'Experimenteer met WIP limits',
          'Pas het board aan op basis van learnings',
        ],
        tip: 'Kleine aanpassingen, meet het effect',
      },
    ],
    academyCourse: { title: 'Kanban Essentials', link: '/academy/courses/kanban-essentials' },
  },

  // ============================================
  // PRINCE2
  // ============================================
  prince2: {
    name: 'PRINCE2',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    tagline: 'Gestructureerd projectmanagement met business focus',
    overview: 'PRINCE2 (PRojects IN Controlled Environments) is een procesgebaseerde methodologie die projecten opdeelt in beheersbare stages met duidelijke governance en continue business justification.',
    whenToUse: [
      'Projecten die formele governance vereisen',
      'Omgevingen met strikte compliance eisen',
      'Projecten met duidelijk gedefinieerde scope',
      'Organisaties die gestandaardiseerde aanpak willen',
    ],
    keyRoles: [
      { name: 'Project Board', description: 'Executive, Senior User, Senior Supplier - besluitvorming' },
      { name: 'Project Manager', description: 'Dagelijkse leiding van het project' },
      { name: 'Team Manager', description: 'Leidt de uitvoerende teams' },
    ],
    keyArtifacts: [
      { name: 'Business Case', description: 'Rechtvaardiging van het project - wordt continu bijgewerkt' },
      { name: 'Project Plan', description: 'Overzicht van het gehele project' },
      { name: 'Stage Plan', description: 'Gedetailleerd plan per stage' },
    ],
    steps: [
      {
        title: 'Starting Up',
        description: 'Voorbereiden op het project',
        icon: Target,
        details: [
          'Benoem Project Board en Project Manager',
          'Verzamel bestaande informatie',
          'Maak Project Brief',
          'Plan de Initiation Stage',
        ],
        tip: 'Dit is een korte, pre-project fase - houd het lean',
      },
      {
        title: 'Initiating',
        description: 'Definieer het project volledig',
        icon: FileText,
        details: [
          'Verfijn de Business Case',
          'Maak het Project Plan',
          'Stel management strategieën op',
          'Maak de Project Initiation Documentation (PID)',
        ],
        tip: 'De PID is je contract met de Project Board',
      },
      {
        title: 'Controlling a Stage',
        description: 'Dagelijkse management activiteiten',
        icon: BarChart3,
        details: [
          'Autoriseer Work Packages',
          'Monitor voortgang',
          'Behandel issues en risico\'s',
          'Rapporteer aan Project Board',
        ],
        tip: 'Manage by Exception - escaleer alleen bij overschrijding van toleranties',
      },
      {
        title: 'Managing Stage Boundaries',
        description: 'Afronding van een stage',
        icon: CheckCircle2,
        details: [
          'Rapporteer stage resultaten',
          'Update Business Case',
          'Plan volgende stage',
          'Vraag autorisatie voor volgende stage',
        ],
        tip: 'Dit is je go/no-go moment - wees eerlijk over de status',
      },
      {
        title: 'Closing',
        description: 'Formeel afsluiten van het project',
        icon: CheckCircle2,
        details: [
          'Bevestig acceptatie van producten',
          'Evalueer het project',
          'Documenteer lessons learned',
          'Draag over en sluit af',
        ],
        tip: 'Plan benefits reviews voor na het project',
      },
    ],
    academyCourse: { title: 'PRINCE2 Foundation', link: '/academy/courses/prince2-foundation' },
  },

  // ============================================
  // WATERFALL
  // ============================================
  waterfall: {
    name: 'Waterfall',
    icon: Workflow,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    tagline: 'Sequentiële aanpak met duidelijke fases',
    overview: 'De Waterfall methodologie volgt een lineaire, sequentiële aanpak waarbij elke fase volledig moet worden afgerond voordat de volgende begint. Ideaal voor projecten met vaste requirements.',
    whenToUse: [
      'Requirements zijn stabiel en goed begrepen',
      'Projecten met regulatoire compliance vereisten',
      'Hardware of constructie projecten',
      'Wanneer uitgebreide documentatie vereist is',
    ],
    keyRoles: [
      { name: 'Project Manager', description: 'Overall project leiding en coördinatie' },
      { name: 'Business Analyst', description: 'Requirements gathering en analyse' },
      { name: 'Technical Lead', description: 'Technische beslissingen en architectuur' },
    ],
    keyArtifacts: [
      { name: 'Requirements Document', description: 'Volledige specificatie van alle requirements' },
      { name: 'Design Document', description: 'Technisch ontwerp van de oplossing' },
      { name: 'Test Plan', description: 'Strategie en cases voor testing' },
    ],
    steps: [
      {
        title: 'Requirements',
        description: 'Verzamel en documenteer alle requirements',
        icon: FileText,
        details: [
          'Stakeholder interviews',
          'Requirements workshops',
          'Documenteer functionele en non-functionele requirements',
          'Verkrijg formele sign-off',
        ],
        tip: 'Investeer hier extra tijd - wijzigingen later zijn kostbaar',
      },
      {
        title: 'Design',
        description: 'Ontwerp de technische oplossing',
        icon: Target,
        details: [
          'High-level architectuur',
          'Detailed design',
          'Database design',
          'Interface design',
        ],
        tip: 'Review designs met technische experts voordat je verder gaat',
      },
      {
        title: 'Implementation',
        description: 'Bouw de oplossing',
        icon: Zap,
        details: [
          'Code development',
          'Unit testing',
          'Code reviews',
          'Integratie van componenten',
        ],
        tip: 'Houd je strikt aan de design specs',
      },
      {
        title: 'Testing',
        description: 'Verificatie en validatie',
        icon: CheckCircle2,
        details: [
          'System testing',
          'Integration testing',
          'User Acceptance Testing (UAT)',
          'Performance testing',
        ],
        tip: 'Plan voldoende tijd voor bug fixing na UAT',
      },
      {
        title: 'Deployment & Maintenance',
        description: 'Go-live en ondersteuning',
        icon: Play,
        details: [
          'Deployment naar productie',
          'User training',
          'Documentatie overdracht',
          'Support en maintenance',
        ],
        tip: 'Bereid een rollback plan voor voor het geval dat',
      },
    ],
    academyCourse: { title: 'Waterfall Methodology', link: '/academy/courses/waterfall' },
  },

  // ============================================
  // LEAN SIX SIGMA
  // ============================================
  lean_six_sigma: {
    name: 'Lean Six Sigma',
    icon: BarChart3,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    tagline: 'Data-gedreven procesverbetering',
    overview: 'Lean Six Sigma combineert Lean\'s focus op het elimineren van verspilling met Six Sigma\'s statistische aanpak voor het reduceren van variatie. Resultaat: efficiëntere processen met hogere kwaliteit.',
    whenToUse: [
      'Procesverbetering en optimalisatie projecten',
      'Kwaliteitsproblemen met meetbare impact',
      'Efficiëntie verbetering initiatieven',
      'Wanneer data beschikbaar is voor analyse',
    ],
    keyRoles: [
      { name: 'Champion', description: 'Sponsor die resources en support levert' },
      { name: 'Black Belt', description: 'Fulltime projectleider, expert in LSS tools' },
      { name: 'Green Belt', description: 'Parttime teamlid met LSS training' },
    ],
    keyArtifacts: [
      { name: 'Project Charter', description: 'Probleemstelling, scope en doelen' },
      { name: 'Process Map', description: 'Visualisatie van het huidige proces' },
      { name: 'Control Plan', description: 'Plan om verbeteringen te borgen' },
    ],
    steps: [
      {
        title: 'Define',
        description: 'Definieer het probleem en project scope',
        icon: Target,
        details: [
          'Maak Project Charter',
          'Identificeer Voice of Customer (VOC)',
          'Definieer CTQ\'s (Critical to Quality)',
          'Stel SMART doelen',
        ],
        tip: 'Een goed gedefinieerd probleem is half opgelost',
      },
      {
        title: 'Measure',
        description: 'Meet de huidige performance',
        icon: BarChart3,
        details: [
          'Maak een Process Map (SIPOC)',
          'Identificeer wat te meten',
          'Verzamel baseline data',
          'Bereken huidige sigma level',
        ],
        tip: 'Valideer je meetsysteem voordat je conclusies trekt',
      },
      {
        title: 'Analyze',
        description: 'Analyseer data om root causes te vinden',
        icon: Lightbulb,
        details: [
          'Analyseer process flow',
          'Identificeer waste en variatie',
          'Gebruik 5 Why\'s en Fishbone',
          'Valideer root causes met data',
        ],
        tip: 'Ga door tot je de échte root cause vindt, niet symptomen',
      },
      {
        title: 'Improve',
        description: 'Implementeer verbeteringen',
        icon: Zap,
        details: [
          'Genereer oplossingen',
          'Evalueer en selecteer beste oplossing',
          'Pilot de verbetering',
          'Implementeer volledig',
        ],
        tip: 'Test verbeteringen klein voordat je breed uitrolt',
      },
      {
        title: 'Control',
        description: 'Borg de verbeteringen',
        icon: CheckCircle2,
        details: [
          'Maak Control Plan',
          'Implementeer monitoring',
          'Standaardiseer nieuwe werkwijze',
          'Documenteer en train',
        ],
        tip: 'Zonder control vallen verbeteringen terug',
      },
    ],
    academyCourse: { title: 'Lean Six Sigma Yellow Belt', link: '/academy/courses/lss-yellow' },
  },

  // ============================================
  // HYBRID
  // ============================================
  hybrid: {
    name: 'Hybrid',
    icon: GitMerge,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    tagline: 'Flexibele combinatie van methodologieën',
    overview: 'De Hybrid aanpak combineert elementen van verschillende methodologieën om de beste fit voor jouw project te creëren. Neem de structuur van Waterfall en de flexibiliteit van Agile waar nodig.',
    whenToUse: [
      'Projecten met zowel vaste als flexibele componenten',
      'Organisaties in transitie naar Agile',
      'Complexe projecten met diverse deliverables',
      'Wanneer pure methodologieën niet passen',
    ],
    keyRoles: [
      { name: 'Project Manager', description: 'Overall coördinatie en stakeholder management' },
      { name: 'Product Owner', description: 'Prioritering van features voor agile componenten' },
      { name: 'Team Leads', description: 'Leiden specifieke workstreams' },
    ],
    keyArtifacts: [
      { name: 'Project Plan', description: 'High-level planning met milestones' },
      { name: 'Backlog', description: 'Lijst van features voor iteratieve ontwikkeling' },
      { name: 'Status Dashboard', description: 'Unified view van alle workstreams' },
    ],
    steps: [
      {
        title: 'Setup',
        description: 'Definieer je hybride aanpak',
        icon: Target,
        details: [
          'Bepaal welke delen agile/waterfall zijn',
          'Definieer governance structuur',
          'Stem af met stakeholders',
          'Documenteer de gekozen aanpak',
        ],
        tip: 'Wees expliciet over de regels - voorkom verwarring',
      },
      {
        title: 'Planning',
        description: 'Plan op verschillende niveaus',
        icon: Calendar,
        details: [
          'High-level roadmap met milestones',
          'Sprint/iteration planning voor agile delen',
          'Gedetailleerde planning voor waterfall delen',
        ],
        tip: 'Synchroniseer milestones tussen workstreams',
      },
      {
        title: 'Execution',
        description: 'Voer parallel workstreams uit',
        icon: Zap,
        details: [
          'Sprints voor iteratieve development',
          'Stage-gates voor waterfall componenten',
          'Regelmatige synchronisatie meetings',
        ],
        tip: 'Houd dependencies tussen streams goed in de gaten',
      },
      {
        title: 'Integration',
        description: 'Integreer deliverables',
        icon: GitMerge,
        details: [
          'Integreer outputs van verschillende streams',
          'End-to-end testing',
          'Stakeholder demos',
        ],
        tip: 'Plan integratie momenten vooraf in',
      },
      {
        title: 'Delivery',
        description: 'Lever het eindproduct',
        icon: CheckCircle2,
        details: [
          'Final integration en testing',
          'Deployment',
          'Retrospective over de hybride aanpak',
        ],
        tip: 'Evalueer wat wel/niet werkte voor volgende projecten',
      },
    ],
    academyCourse: { title: 'Hybrid Project Management', link: '/academy/courses/hybrid-pm' },
  },

  // ============================================
  // SAFe (Scaled Agile Framework) - Programs
  // ============================================
  safe: {
    name: 'SAFe',
    icon: Layers,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    tagline: 'Scaled Agile voor enterprise programma\'s',
    overview: 'SAFe (Scaled Agile Framework) is een framework voor het schalen van agile praktijken naar enterprise niveau. Het synchroniseert meerdere agile teams via Program Increments (PI) en Agile Release Trains (ART).',
    whenToUse: [
      'Grote organisaties met meerdere agile teams',
      'Software development programma\'s',
      'Digitale transformatie initiatieven',
      'Wanneer teams moeten samenwerken aan complexe producten',
    ],
    keyRoles: [
      { name: 'Release Train Engineer', description: 'Faciliteert de ART en PI events' },
      { name: 'Product Management', description: 'Definieert en prioriteert de Program Backlog' },
      { name: 'System Architect', description: 'Bewaakt architecturele integriteit' },
    ],
    keyArtifacts: [
      { name: 'Program Backlog', description: 'Features geprioriteerd voor de ART' },
      { name: 'PI Objectives', description: 'Doelen voor het Program Increment' },
      { name: 'Program Board', description: 'Visualisatie van dependencies tussen teams' },
    ],
    steps: [
      {
        title: 'PI Planning',
        description: 'Twee-daagse planning event met alle teams',
        icon: Calendar,
        details: [
          'Presenteer visie en context',
          'Teams plannen hun sprints',
          'Identificeer dependencies',
          'Management review en aanpassingen',
        ],
        tip: 'PI Planning is het heartbeat van SAFe - investeer in goede voorbereiding',
      },
      {
        title: 'Iteration Execution',
        description: 'Teams werken in 2-weeks sprints',
        icon: Zap,
        details: [
          'Dagelijkse standups per team',
          'Scrum of Scrums voor coördinatie',
          'Continue integratie',
          'Feature development',
        ],
        tip: 'Houd dependencies actief in de gaten via Scrum of Scrums',
      },
      {
        title: 'System Demo',
        description: 'Demonstreer geïntegreerd werk elke iteratie',
        icon: Play,
        details: [
          'Teams integreren hun werk',
          'Demo aan stakeholders',
          'Verzamel feedback',
          'Pas planning aan indien nodig',
        ],
        tip: 'De System Demo toont echte voortgang - geen slides!',
      },
      {
        title: 'Innovation & Planning',
        description: 'Ruimte voor innovatie en voorbereiding',
        icon: Lightbulb,
        details: [
          'Hackathons en innovatie',
          'Technische debt afbouwen',
          'Training en kennisdeling',
          'Voorbereiding volgende PI',
        ],
        tip: 'Bescherm deze tijd - het is essentieel voor duurzaamheid',
      },
      {
        title: 'Inspect & Adapt',
        description: 'Programma-brede retrospective',
        icon: RefreshCw,
        details: [
          'Kwantitatieve en kwalitatieve review',
          'Identificeer verbeterpunten',
          'Problem solving workshop',
          'Definieer improvement backlog items',
        ],
        tip: 'Breng data mee - maak problemen zichtbaar met feiten',
      },
    ],
    academyCourse: { title: 'SAFe Fundamentals', link: '/academy/courses/safe-fundamentals' },
  },

  // ============================================
  // MSP (Managing Successful Programmes)
  // ============================================
  msp: {
    name: 'MSP',
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    tagline: 'Benefits-gedreven programma management',
    overview: 'MSP (Managing Successful Programmes) is de UK government standaard voor programma management, met focus op benefits realization, stakeholder engagement en organisatieverandering.',
    whenToUse: [
      'Overheid en publieke sector programma\'s',
      'Organisatorische transformaties',
      'Programma\'s met significante change impact',
      'Benefits-gedreven initiatieven',
    ],
    keyRoles: [
      { name: 'Sponsoring Group', description: 'Investering en strategische richting' },
      { name: 'Programme Manager', description: 'Dagelijkse leiding van het programma' },
      { name: 'Business Change Manager', description: 'Realisatie van benefits' },
    ],
    keyArtifacts: [
      { name: 'Programme Brief', description: 'Initiële rechtvaardiging en scope' },
      { name: 'Blueprint', description: 'Beschrijving van de toekomstige staat' },
      { name: 'Benefits Map', description: 'Visualisatie van hoe outputs leiden tot benefits' },
    ],
    steps: [
      {
        title: 'Identifying',
        description: 'Identificeer en definieer het programma',
        icon: Target,
        details: [
          'Bevestig strategische fit',
          'Maak Programme Brief',
          'Identificeer stakeholders',
          'Schets initiële Blueprint',
        ],
        tip: 'Zorg dat de link met strategie glashelder is',
      },
      {
        title: 'Defining',
        description: 'Definieer het programma volledig',
        icon: FileText,
        details: [
          'Verfijn Blueprint',
          'Ontwikkel Benefits Realization Plan',
          'Ontwerp governance structuur',
          'Plan tranches',
        ],
        tip: 'De Blueprint beschrijft het "wat", niet het "hoe"',
      },
      {
        title: 'Managing Tranches',
        description: 'Lever projecten en capabilities',
        icon: Layers,
        details: [
          'Coördineer projecten binnen de tranche',
          'Monitor voortgang en benefits',
          'Manage dependencies',
          'Prepare voor transitie',
        ],
        tip: 'Focus op capabilities, niet alleen project outputs',
      },
      {
        title: 'Delivering Capabilities',
        description: 'Transitie naar operatie',
        icon: CheckCircle2,
        details: [
          'Bereid organisatie voor op verandering',
          'Transitie capabilities naar BAU',
          'Support adoption',
          'Monitor early benefits',
        ],
        tip: 'Change management is minstens zo belangrijk als delivery',
      },
      {
        title: 'Realizing Benefits',
        description: 'Realiseer en meet benefits',
        icon: TrendingUp,
        details: [
          'Track benefits realization',
          'Identificeer nieuwe benefits',
          'Rapporteer aan stakeholders',
          'Pas aan indien nodig',
        ],
        tip: 'Benefits realization gaat door na programma afsluiting',
      },
    ],
    academyCourse: { title: 'MSP Foundation', link: '/academy/courses/msp-foundation' },
  },

  // ============================================
  // PMI Program Management
  // ============================================
  pmi: {
    name: 'PMI Standard',
    icon: BarChart3,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    tagline: 'PMI\'s programma management framework',
    overview: 'De PMI Standard for Program Management biedt een framework voor het managen van gerelateerde projecten om strategische doelen te bereiken die niet haalbaar zijn door projecten individueel te managen.',
    whenToUse: [
      'Organisaties die PMI standaarden volgen',
      'Programma\'s die formele governance vereisen',
      'Multi-project coördinatie',
      'Strategische initiative management',
    ],
    keyRoles: [
      { name: 'Program Sponsor', description: 'Eigenaar van de business case' },
      { name: 'Program Manager', description: 'Leidt het programma en coördineert projecten' },
      { name: 'Program Management Office', description: 'Ondersteunt governance en rapportage' },
    ],
    keyArtifacts: [
      { name: 'Program Charter', description: 'Autorisatie en scope van het programma' },
      { name: 'Program Roadmap', description: 'High-level tijdlijn en milestones' },
      { name: 'Benefits Register', description: 'Tracking van alle programma benefits' },
    ],
    steps: [
      {
        title: 'Program Definition',
        description: 'Definieer en autoriseer het programma',
        icon: Target,
        details: [
          'Ontwikkel Program Charter',
          'Identificeer stakeholders',
          'Maak initiële roadmap',
          'Stel governance op',
        ],
        tip: 'Alignment met strategie is kritiek voor succes',
      },
      {
        title: 'Program Planning',
        description: 'Plan het programma in detail',
        icon: Calendar,
        details: [
          'Definieer program scope',
          'Identificeer component projecten',
          'Plan resources en budget',
          'Ontwikkel risk management approach',
        ],
        tip: 'Plan op programma niveau, laat projecten hun eigen detail plannen',
      },
      {
        title: 'Program Delivery',
        description: 'Coördineer en lever',
        icon: Zap,
        details: [
          'Start en monitor component projecten',
          'Manage dependencies',
          'Integreer deliverables',
          'Governance meetings',
        ],
        tip: 'Focus op integratie en dependencies, niet op project details',
      },
      {
        title: 'Benefits Delivery',
        description: 'Realiseer programma benefits',
        icon: TrendingUp,
        details: [
          'Transitie outputs naar operatie',
          'Monitor benefits realization',
          'Rapporteer aan stakeholders',
          'Adjust approach based on results',
        ],
        tip: 'Benefits zijn het doel - outputs zijn slechts middelen',
      },
      {
        title: 'Program Closure',
        description: 'Sluit het programma formeel af',
        icon: CheckCircle2,
        details: [
          'Bevestig benefits delivery',
          'Transitie remaining work',
          'Release resources',
          'Document lessons learned',
        ],
        tip: 'Plan benefits tracking die doorgaat na programma einde',
      },
    ],
    academyCourse: { title: 'PgMP Preparation', link: '/academy/courses/pgmp-prep' },
  },

  // ============================================
  // PRINCE2 Programme
  // ============================================
  prince2_programme: {
    name: 'P2 Programme',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    tagline: 'PRINCE2 principes voor programma\'s',
    overview: 'PRINCE2 for Programmes past de PRINCE2 principes toe op programma niveau, met focus op governance, business justification en gestructureerde tranches.',
    whenToUse: [
      'Organisaties die PRINCE2 gebruiken voor projecten',
      'Programma\'s die formele controls vereisen',
      'Overheid en gereguleerde industrieën',
      'Programma\'s met strikte governance eisen',
    ],
    keyRoles: [
      { name: 'Programme Board', description: 'Strategische besluitvorming en governance' },
      { name: 'Programme Manager', description: 'Dagelijkse leiding van het programma' },
      { name: 'Business Change Manager', description: 'Verantwoordelijk voor benefits realization' },
    ],
    keyArtifacts: [
      { name: 'Programme Brief', description: 'Initiële definitie en rechtvaardiging' },
      { name: 'Programme Plan', description: 'Master plan voor het programma' },
      { name: 'Benefits Realization Plan', description: 'Plan voor het realiseren van benefits' },
    ],
    steps: [
      {
        title: 'Programme Mandate',
        description: 'Ontvang en valideer de opdracht',
        icon: FileText,
        details: [
          'Review strategische drivers',
          'Valideer initiële scope',
          'Identificeer key stakeholders',
          'Bereid Programme Brief voor',
        ],
        tip: 'Zorg dat de strategische link duidelijk is gedocumenteerd',
      },
      {
        title: 'Programme Definition',
        description: 'Definieer het programma volledig',
        icon: Target,
        details: [
          'Ontwikkel Blueprint',
          'Maak Programme Plan',
          'Definieer governance',
          'Plan eerste tranche',
        ],
        tip: 'De Blueprint is het kompas - houd het up-to-date',
      },
      {
        title: 'Tranche Delivery',
        description: 'Lever capabilities per tranche',
        icon: Layers,
        details: [
          'Start projecten binnen tranche',
          'Monitor voortgang',
          'Manage issues en risico\'s',
          'Bereid transities voor',
        ],
        tip: 'Elke tranche moet meetbare benefits opleveren',
      },
      {
        title: 'Tranche Review',
        description: 'Review en besluit over vervolg',
        icon: CheckCircle2,
        details: [
          'Evalueer tranche resultaten',
          'Review Business Case',
          'Besluit over volgende tranche',
          'Update plannen',
        ],
        tip: 'Dit is het go/no-go moment - wees objectief',
      },
      {
        title: 'Programme Closure',
        description: 'Sluit het programma af',
        icon: Award,
        details: [
          'Bevestig benefits delivery',
          'Transitie naar BAU',
          'Document lessons learned',
          'Release resources',
        ],
        tip: 'Plan post-programme benefits reviews',
      },
    ],
    academyCourse: { title: 'PRINCE2 for Programmes', link: '/academy/courses/prince2-programme' },
  },
};

// Mapping voor varianten naar base configs
const getMethodologyConfig = (methodology: string): MethodologyOnboardingConfig => {
  // Direct match
  if (ONBOARDING_CONFIG[methodology]) {
    return ONBOARDING_CONFIG[methodology];
  }
  
  // Map variants to base methodologies
  const methodologyMap: Record<string, string> = {
    'lean_six_sigma_green': 'lean_six_sigma',
    'lean_six_sigma_black': 'lean_six_sigma',
  };
  
  const mappedMethodology = methodologyMap[methodology];
  if (mappedMethodology && ONBOARDING_CONFIG[mappedMethodology]) {
    return ONBOARDING_CONFIG[mappedMethodology];
  }
  
  // Fallback
  return ONBOARDING_CONFIG.hybrid;
};

interface MethodologyOnboardingWizardProps {
  methodology: string;
  projectName?: string;
  open: boolean;
  onClose: () => void;
  onComplete: () => void;
}

export const MethodologyOnboardingWizard = ({
  methodology,
  projectName,
  open,
  onClose,
  onComplete,
}: MethodologyOnboardingWizardProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [dontShowAgain, setDontShowAgain] = useState(false);
  const navigate = useNavigate();

  const config = getMethodologyConfig(methodology);
  const Icon = config.icon;

  const totalSteps = 4; // Overview, Roles, Steps, Get Started
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleComplete = () => {
    if (dontShowAgain) {
      localStorage.setItem(`onboarding_${methodology}_completed`, 'true');
    }
    onComplete();
  };

  const handleSkip = () => {
    localStorage.setItem(`onboarding_${methodology}_skipped`, 'true');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader className={cn("pb-4", config.bgColor, "-m-6 mb-0 p-6")}>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-white/80 rounded-lg">
              <Icon className={cn("h-6 w-6", config.color)} />
            </div>
            <div>
              <DialogTitle className="text-xl">
                {currentStep === 0 ? `Welcome to ${config.name}` : config.steps[currentStep - 1]?.title || 'Get Started'}
              </DialogTitle>
              <DialogDescription>
                {projectName ? `Setting up: ${projectName}` : config.tagline}
              </DialogDescription>
            </div>
          </div>
          <Progress value={progress} className="mt-4 h-1" />
        </DialogHeader>

        <div className="flex-1 overflow-y-auto py-4">
          {/* Step 0: Overview */}
          {currentStep === 0 && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">What is {config.name}?</h3>
                <p className="text-sm text-muted-foreground">{config.overview}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">When to use {config.name}</h3>
                <ul className="space-y-2">
                  {config.whenToUse.map((item, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <CheckCircle2 className={cn("h-4 w-4 mt-0.5 flex-shrink-0", config.color)} />
                      <span className="text-muted-foreground">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Key Roles
                  </h3>
                  <div className="space-y-2">
                    {config.keyRoles.map((role, i) => (
                      <div key={i} className="p-2 bg-muted/50 rounded-lg">
                        <p className="font-medium text-sm">{role.name}</p>
                        <p className="text-xs text-muted-foreground">{role.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Key Artifacts
                  </h3>
                  <div className="space-y-2">
                    {config.keyArtifacts.map((artifact, i) => (
                      <div key={i} className="p-2 bg-muted/50 rounded-lg">
                        <p className="font-medium text-sm">{artifact.name}</p>
                        <p className="text-xs text-muted-foreground">{artifact.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Steps 1-3: Methodology Steps */}
          {currentStep >= 1 && currentStep <= 3 && (
            <div className="space-y-4">
              {config.steps.slice((currentStep - 1) * 2, currentStep * 2).map((step, i) => {
                const StepIcon = step.icon;
                return (
                  <div key={i} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <div className={cn("p-2 rounded-lg", config.bgColor)}>
                        <StepIcon className={cn("h-5 w-5", config.color)} />
                      </div>
                      <div>
                        <h4 className="font-semibold">{step.title}</h4>
                        <p className="text-sm text-muted-foreground">{step.description}</p>
                      </div>
                    </div>
                    <ul className="space-y-1 ml-12 mb-3">
                      {step.details.map((detail, j) => (
                        <li key={j} className="text-sm text-muted-foreground flex items-start gap-2">
                          <span className="text-primary">•</span>
                          {detail}
                        </li>
                      ))}
                    </ul>
                    <div className={cn("flex items-start gap-2 p-2 rounded-lg", config.bgColor)}>
                      <Lightbulb className={cn("h-4 w-4 mt-0.5 flex-shrink-0", config.color)} />
                      <p className="text-xs">{step.tip}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2">
            <Checkbox 
              id="dont-show" 
              checked={dontShowAgain}
              onCheckedChange={(checked) => setDontShowAgain(checked as boolean)}
            />
            <label htmlFor="dont-show" className="text-sm text-muted-foreground cursor-pointer">
              Don't show this again for {config.name}
            </label>
          </div>
          <div className="flex items-center gap-2">
            {currentStep === 0 && (
              <Button variant="ghost" onClick={handleSkip}>
                Skip Tutorial
              </Button>
            )}
            {currentStep > 0 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
              </Button>
            )}
            {currentStep < totalSteps - 1 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                Next
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className={cn(config.bgColor, config.color, "hover:opacity-90")}>
                <Play className="h-4 w-4 mr-2" />
                Start Project
              </Button>
            )}
          </div>
        </div>

        {config.academyCourse && (
          <div className="border-t pt-3 mt-3">
            <Button 
              variant="link" 
              className="w-full gap-2 text-sm"
              onClick={() => navigate(config.academyCourse!.link)}
            >
              <GraduationCap className="h-4 w-4" />
              Want to learn more? Take the {config.academyCourse.title}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MethodologyOnboardingWizard;