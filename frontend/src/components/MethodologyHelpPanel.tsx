// src/components/MethodologyHelpPanel.tsx
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

const METHODOLOGY_HELP: Record<string, MethodologyHelpConfig> = {
  // ============================================
  // AGILE (Generic)
  // ============================================
  agile: {
    name: 'Agile',
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Een mindset en verzameling principes voor flexibele, iteratieve ontwikkeling met focus op samenwerking en klantwaarde.',
    keyPrinciples: [
      'Individuen en interacties boven processen en tools',
      'Werkende software boven uitgebreide documentatie',
      'Samenwerking met de klant boven contractonderhandeling',
      'Reageren op verandering boven het volgen van een plan',
      'Lever werkende software frequent',
      'Omarm veranderende requirements',
    ],
    tips: [
      {
        title: 'User Stories',
        description: 'Schrijf user stories vanuit het perspectief van de eindgebruiker: "Als [rol] wil ik [functie] zodat [waarde]"',
        icon: Target,
      },
      {
        title: 'Iteratief Werken',
        description: 'Lever kleine increments van waarde in plaats van alles in één keer',
        icon: RefreshCw,
      },
      {
        title: 'Feedback Loops',
        description: 'Verzamel vroeg en vaak feedback - pas je aan op basis van wat je leert',
        icon: TrendingUp,
      },
    ],
    bestPractices: [
      'Houd dagelijkse standups kort en gefocust',
      'Visualiseer werk op een board',
      'Prioriteer op basis van waarde',
      'Reflecteer regelmatig en verbeter',
      'Betrek stakeholders actief',
    ],
    resources: [
      { title: 'Agile Fundamentals', type: 'course', duration: '2 uur', link: '/academy/courses/agile-fundamentals' },
      { title: 'Agile Manifesto Deep Dive', type: 'video', duration: '30 min', link: '/academy/courses/agile-manifesto' },
      { title: 'User Stories Schrijven', type: 'article', link: '/academy/articles/user-stories' },
    ],
    academyTrack: 'Agile Leader Track',
  },

  // ============================================
  // SCRUM
  // ============================================
  scrum: {
    name: 'Scrum',
    icon: Repeat,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'Een agile framework voor het ontwikkelen en onderhouden van complexe producten door middel van iteratieve sprints.',
    keyPrinciples: [
      'Werk in korte sprints (1-4 weken)',
      'Daily standups voor synchronisatie',
      'Product Backlog als single source of truth',
      'Sprint Reviews voor feedback',
      'Retrospectives voor verbetering',
      'Zelfsturende teams',
    ],
    tips: [
      {
        title: 'Sprint Goal',
        description: 'Definieer een duidelijk sprint goal dat het team richting geeft',
        icon: Target,
      },
      {
        title: 'Story Points',
        description: 'Gebruik Fibonacci reeks (1, 2, 3, 5, 8, 13) voor relatieve schatting van complexiteit',
        icon: BarChart3,
      },
      {
        title: 'Definition of Done',
        description: 'Definieer duidelijke criteria wanneer een item "done" is voordat je begint',
        icon: CheckCircle2,
      },
    ],
    bestPractices: [
      'Houd sprints consistent qua lengte',
      'Bescherm het team tegen scope creep tijdens sprint',
      'Zorg dat de Product Owner beschikbaar is voor vragen',
      'Timeboxen vergaderingen strikt',
      'Visualiseer werk op een Scrum board',
    ],
    resources: [
      { title: 'Scrum Fundamentals', type: 'course', duration: '2 uur', link: '/academy/courses/scrum-fundamentals' },
      { title: 'Sprint Planning Masterclass', type: 'video', duration: '45 min', link: '/academy/courses/sprint-planning' },
      { title: 'Scrum Events Guide', type: 'article', link: '/academy/articles/scrum-events' },
    ],
    academyTrack: 'Scrum Master Track',
  },

  // ============================================
  // KANBAN
  // ============================================
  kanban: {
    name: 'Kanban',
    icon: Kanban,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Een visuele methode voor werkbeheer die zich richt op continue levering door het beperken van Work in Progress.',
    keyPrinciples: [
      'Visualiseer de workflow',
      'Beperk Work in Progress (WIP)',
      'Manage flow',
      'Maak policies expliciet',
      'Implementeer feedback loops',
      'Verbeter collaboratief, evolueer experimenteel',
    ],
    tips: [
      {
        title: 'WIP Limits',
        description: 'Start met WIP limit = aantal teamleden, pas aan op basis van data',
        icon: Gauge,
      },
      {
        title: 'Lead Time',
        description: 'Meet lead time (start tot klaar) om voorspelbaarheid te verbeteren',
        icon: Clock,
      },
      {
        title: 'Blokkades',
        description: 'Visualiseer blokkades direct en pak ze met prioriteit aan',
        icon: Eye,
      },
    ],
    bestPractices: [
      'Stop starting, start finishing',
      'Respecteer WIP limits als team',
      'Houd het board up-to-date',
      'Focus op doorlooptijd, niet op drukte',
      'Analyseer flow metrics regelmatig',
    ],
    resources: [
      { title: 'Kanban Essentials', type: 'course', duration: '2 uur', link: '/academy/courses/kanban-essentials' },
      { title: 'WIP Limits Masterclass', type: 'video', duration: '30 min', link: '/academy/courses/wip-limits' },
      { title: 'Cumulative Flow Diagrams', type: 'article', link: '/academy/articles/cfd' },
    ],
    academyTrack: 'Agile Leader Track',
  },

  // ============================================
  // PRINCE2
  // ============================================
  prince2: {
    name: 'PRINCE2',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    description: 'Een gestructureerde projectmanagement methodologie met focus op business justification en gedefinieerde rollen.',
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
        description: 'De Business Case is het fundament - update deze bij elke stage gate',
        icon: Target,
      },
      {
        title: 'Product Descriptions',
        description: 'Definieer duidelijke Product Descriptions met kwaliteitscriteria vóór je begint',
        icon: CheckCircle2,
      },
      {
        title: 'Exception Reports',
        description: 'Escaleer proactief wanneer tolerantiegrenzen worden overschreden',
        icon: Lightbulb,
      },
    ],
    bestPractices: [
      'Houd de Business Case levend gedurende het project',
      'Definieer duidelijke toleranties per stage',
      'Voer End Stage Assessments grondig uit',
      'Documenteer Lessons Learned continu',
      'Gebruik Work Packages voor delegatie',
    ],
    resources: [
      { title: 'PRINCE2 Foundation', type: 'course', duration: '8 uur', link: '/academy/courses/prince2-foundation' },
      { title: 'Business Case Development', type: 'video', duration: '30 min', link: '/academy/courses/business-case' },
      { title: 'Stage Gate Reviews', type: 'article', link: '/academy/articles/stage-gates' },
    ],
    academyTrack: 'Project Manager Track',
  },

  // ============================================
  // WATERFALL
  // ============================================
  waterfall: {
    name: 'Waterfall',
    icon: Workflow,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    description: 'Een sequentiële aanpak waarbij elke fase volledig wordt afgerond voordat de volgende begint.',
    keyPrinciples: [
      'Sequentiële fases',
      'Uitgebreide documentatie',
      'Duidelijke milestones',
      'Formele sign-offs',
      'Vooraf gedefinieerde scope',
    ],
    tips: [
      {
        title: 'Requirements',
        description: 'Investeer extra tijd in requirements gathering - wijzigingen later zijn kostbaar',
        icon: Target,
      },
      {
        title: 'Sign-offs',
        description: 'Verkrijg formele goedkeuring aan het einde van elke fase',
        icon: CheckCircle2,
      },
      {
        title: 'Change Control',
        description: 'Implementeer een strikt change control proces voor scope wijzigingen',
        icon: Lightbulb,
      },
    ],
    bestPractices: [
      'Documenteer requirements uitgebreid',
      'Plan buffer tijd voor onvoorziene issues',
      'Houd stakeholders betrokken bij milestones',
      'Test grondig in de testfase',
      'Bereid deployment documentation voor',
    ],
    resources: [
      { title: 'Waterfall Methodology', type: 'course', duration: '4 uur', link: '/academy/courses/waterfall' },
      { title: 'Requirements Engineering', type: 'video', duration: '1 uur', link: '/academy/courses/requirements' },
      { title: 'Testing Strategies', type: 'article', link: '/academy/articles/testing' },
    ],
    academyTrack: 'Project Manager Track',
  },

  // ============================================
  // LEAN SIX SIGMA
  // ============================================
  lean_six_sigma: {
    name: 'Lean Six Sigma',
    icon: BarChart3,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    description: 'Een data-gedreven methodologie voor procesverbetering door het elimineren van verspilling en variatie.',
    keyPrinciples: [
      'Define - Meet - Analyze - Improve - Control (DMAIC)',
      'Focus op klantwaarde',
      'Data-gedreven besluitvorming',
      'Elimineer verspilling (Muda)',
      'Reduceer variatie',
      'Continue verbetering (Kaizen)',
    ],
    tips: [
      {
        title: 'DMAIC',
        description: 'Volg de DMAIC cyclus strikt - sla geen stappen over',
        icon: Target,
      },
      {
        title: 'Voice of Customer',
        description: 'Begin altijd met het begrijpen van wat de klant waardeert',
        icon: Lightbulb,
      },
      {
        title: 'Root Cause',
        description: 'Gebruik 5 Why\'s en Fishbone diagrams om root causes te vinden',
        icon: CheckCircle2,
      },
    ],
    bestPractices: [
      'Baseer beslissingen op data, niet aannames',
      'Betrek process owners bij verbeteringen',
      'Meet voor én na implementatie',
      'Standaardiseer verbeterde processen',
      'Train medewerkers in nieuwe werkwijzen',
    ],
    resources: [
      { title: 'Lean Six Sigma Yellow Belt', type: 'course', duration: '6 uur', link: '/academy/courses/lss-yellow' },
      { title: 'DMAIC Deep Dive', type: 'video', duration: '2 uur', link: '/academy/courses/dmaic' },
      { title: 'Statistical Tools', type: 'article', link: '/academy/articles/lss-tools' },
    ],
    academyTrack: 'Process Improvement Track',
  },

  // ============================================
  // HYBRID
  // ============================================
  hybrid: {
    name: 'Hybrid',
    icon: GitMerge,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    description: 'Een flexibele combinatie van methodologieën, aangepast aan de specifieke behoeften van je project.',
    keyPrinciples: [
      'Combineer het beste van verschillende methodologieën',
      'Pas aan op basis van projectcontext',
      'Balanceer structuur en flexibiliteit',
      'Focus op waarde levering',
      'Iteratief waar mogelijk, sequentieel waar nodig',
    ],
    tips: [
      {
        title: 'Mix & Match',
        description: 'Gebruik agile voor ontwikkeling en waterfall voor governance',
        icon: GitMerge,
      },
      {
        title: 'Documenteer je aanpak',
        description: 'Leg vast welke elementen je van welke methodologie gebruikt',
        icon: Lightbulb,
      },
      {
        title: 'Wees consistent',
        description: 'Kies een aanpak en blijf erbij - wissel niet continu',
        icon: CheckCircle2,
      },
    ],
    bestPractices: [
      'Definieer duidelijk welke delen agile/waterfall zijn',
      'Stem verwachtingen af met stakeholders',
      'Houd governance eenvoudig',
      'Review en pas aan indien nodig',
      'Train team in de gekozen hybride aanpak',
    ],
    resources: [
      { title: 'Hybrid Project Management', type: 'course', duration: '3 uur', link: '/academy/courses/hybrid-pm' },
      { title: 'Agile in Waterfall Omgevingen', type: 'video', duration: '45 min', link: '/academy/courses/agile-waterfall' },
      { title: 'Choosing Your Approach', type: 'article', link: '/academy/articles/hybrid-approach' },
    ],
    academyTrack: 'Project Manager Track',
  },

  // ============================================
  // SAFe (Scaled Agile Framework) - Programs
  // ============================================
  safe: {
    name: 'SAFe',
    icon: Layers,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    description: 'Scaled Agile Framework voor het schalen van agile praktijken naar enterprise niveau met meerdere teams.',
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
        description: 'PI Planning is het heartbeat - bereid grondig voor met duidelijke visie en backlog',
        icon: Calendar,
      },
      {
        title: 'Dependencies',
        description: 'Visualiseer en manage dependencies actief via de Program Board',
        icon: Layers,
      },
      {
        title: 'System Demo',
        description: 'Integreer alle team werk elke iteratie - geen uitzonderingen',
        icon: Eye,
      },
    ],
    bestPractices: [
      'Train alle teamleden in SAFe basics',
      'Houd PI Planning face-to-face indien mogelijk',
      'Use Scrum of Scrums voor dagelijkse coördinatie',
      'Bescherm Innovation & Planning time',
      'Meet business value, niet alleen velocity',
    ],
    resources: [
      { title: 'SAFe Fundamentals', type: 'course', duration: '4 uur', link: '/academy/courses/safe-fundamentals' },
      { title: 'PI Planning Guide', type: 'video', duration: '1 uur', link: '/academy/courses/pi-planning' },
      { title: 'ART Launch Checklist', type: 'article', link: '/academy/articles/art-launch' },
    ],
    academyTrack: 'SAFe Practitioner Track',
  },

  // ============================================
  // MSP (Managing Successful Programmes)
  // ============================================
  msp: {
    name: 'MSP',
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    description: 'Managing Successful Programmes - UK government standaard voor benefits-gedreven programma management.',
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
        description: 'De Blueprint beschrijft de toekomst - houd deze levend en actueel',
        icon: Target,
      },
      {
        title: 'Benefits',
        description: 'Track benefits actief - ze zijn het doel, niet de outputs',
        icon: TrendingUp,
      },
      {
        title: 'Stakeholders',
        description: 'Investeer in stakeholder engagement - change management is cruciaal',
        icon: Users,
      },
    ],
    bestPractices: [
      'Link alles terug naar de Blueprint',
      'Measure benefits, niet alleen deliverables',
      'Manage stakeholder expectations actief',
      'Plan tranches met duidelijke capabilities',
      'Bereid organisatie voor op verandering',
    ],
    resources: [
      { title: 'MSP Foundation', type: 'course', duration: '8 uur', link: '/academy/courses/msp-foundation' },
      { title: 'Benefits Management', type: 'video', duration: '45 min', link: '/academy/courses/benefits-management' },
      { title: 'Blueprint Design', type: 'article', link: '/academy/articles/blueprint' },
    ],
    academyTrack: 'Programme Manager Track',
  },

  // ============================================
  // PMI Program Management
  // ============================================
  pmi: {
    name: 'PMI Standard',
    icon: BarChart3,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    description: 'PMI\'s framework voor het managen van gerelateerde projecten om strategische doelen te bereiken.',
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
        description: 'Zorg dat het programma continue aligned blijft met organisatie strategie',
        icon: Target,
      },
      {
        title: 'Benefits Register',
        description: 'Houd een actieve Benefits Register bij en track realisatie',
        icon: TrendingUp,
      },
      {
        title: 'Governance',
        description: 'Definieer duidelijke governance met besluitvormingsprocessen',
        icon: Users,
      },
    ],
    bestPractices: [
      'Focus op programma niveau, niet project details',
      'Manage dependencies tussen projecten actief',
      'Track benefits door tot na programma einde',
      'Houd stakeholder engagement plan actueel',
      'Review strategic fit regelmatig',
    ],
    resources: [
      { title: 'PgMP Preparation', type: 'course', duration: '12 uur', link: '/academy/courses/pgmp-prep' },
      { title: 'Program Governance', type: 'video', duration: '1 uur', link: '/academy/courses/program-governance' },
      { title: 'Benefits Realization', type: 'article', link: '/academy/articles/benefits-realization' },
    ],
    academyTrack: 'Programme Manager Track',
  },

  // ============================================
  // PRINCE2 Programme
  // ============================================
  prince2_programme: {
    name: 'P2 Programme',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    description: 'PRINCE2 principes toegepast op programma niveau met focus op governance en tranches.',
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
        description: 'De Programme Brief is je startpunt - zorg dat strategie link duidelijk is',
        icon: Target,
      },
      {
        title: 'Tranches',
        description: 'Elke tranche moet meetbare benefits opleveren - plan ze zorgvuldig',
        icon: Layers,
      },
      {
        title: 'Business Change',
        description: 'Business Change Manager is kritiek voor benefits realisatie',
        icon: Users,
      },
    ],
    bestPractices: [
      'Review Business Case bij elke tranche boundary',
      'Plan benefits reviews na programma einde',
      'Documenteer lessons learned continu',
      'Manage risks op programma én project niveau',
      'Houd governance proportioneel',
    ],
    resources: [
      { title: 'PRINCE2 for Programmes', type: 'course', duration: '8 uur', link: '/academy/courses/prince2-programme' },
      { title: 'Tranche Management', type: 'video', duration: '45 min', link: '/academy/courses/tranches' },
      { title: 'Programme Governance', type: 'article', link: '/academy/articles/programme-governance' },
    ],
    academyTrack: 'Programme Manager Track',
  },
};

// Mapping voor varianten
const getHelpConfig = (methodology: string): MethodologyHelpConfig => {
  // Direct match
  if (METHODOLOGY_HELP[methodology]) {
    return METHODOLOGY_HELP[methodology];
  }
  
  // Map variants
  const methodologyMap: Record<string, string> = {
    'lean_six_sigma_green': 'lean_six_sigma',
    'lean_six_sigma_black': 'lean_six_sigma',
  };
  
  const mapped = methodologyMap[methodology];
  if (mapped && METHODOLOGY_HELP[mapped]) {
    return METHODOLOGY_HELP[mapped];
  }
  
  // Fallback
  return METHODOLOGY_HELP.hybrid;
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

  const config = getHelpConfig(methodology);
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
              <CardTitle className="text-lg">{config.name} Help</CardTitle>
              <p className="text-xs text-muted-foreground">Contextual guidance</p>
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
                Key Principles
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
                Best Practices
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
                    <p className="font-medium text-sm">Recommended Track</p>
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
          Explore Full Academy
        </Button>
      </div>
    </Card>
  );
};

export default MethodologyHelpPanel;