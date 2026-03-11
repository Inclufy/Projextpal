// src/components/MethodologyOnboardingWizard.tsx
import { useState, useEffect } from 'react';
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
import { usePageTranslations } from '@/hooks/usePageTranslations';
import { useLanguage } from '@/contexts/LanguageContext';

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

type BilingualText = { en: string; nl: string };
type BilingualStep = {
  title: BilingualText;
  description: BilingualText;
  icon: any;
  details: BilingualText[];
  tip: BilingualText;
};

interface BilingualOnboardingConfig {
  name: string;
  icon: any;
  color: string;
  bgColor: string;
  tagline: BilingualText;
  overview: BilingualText;
  whenToUse: BilingualText[];
  keyRoles: { name: string; description: BilingualText }[];
  keyArtifacts: { name: string; description: BilingualText }[];
  steps: BilingualStep[];
  academyCourse?: { title: string; link: string };
}

const t = (en: string, nl: string): BilingualText => ({ en, nl });

const resolveConfig = (config: BilingualOnboardingConfig, lang: 'en' | 'nl'): MethodologyOnboardingConfig => ({
  name: config.name,
  icon: config.icon,
  color: config.color,
  bgColor: config.bgColor,
  tagline: config.tagline[lang],
  overview: config.overview[lang],
  whenToUse: config.whenToUse.map(item => item[lang]),
  keyRoles: config.keyRoles.map(r => ({ name: r.name, description: r.description[lang] })),
  keyArtifacts: config.keyArtifacts.map(a => ({ name: a.name, description: a.description[lang] })),
  steps: config.steps.map(s => ({
    title: s.title[lang],
    description: s.description[lang],
    icon: s.icon,
    details: s.details.map(d => d[lang]),
    tip: s.tip[lang],
  })),
  academyCourse: config.academyCourse,
});

const BILINGUAL_CONFIG: Record<string, BilingualOnboardingConfig> = {
  // ============================================
  // AGILE (Generic)
  // ============================================
  agile: {
    name: 'Agile',
    icon: Zap,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    tagline: t('Flexible and iterative working', 'Flexibel en iteratief werken'),
    overview: t('Agile is a mindset and collection of principles for flexible software development. It revolves around collaboration, customer feedback, and the ability to respond quickly to change.', 'Agile is een mindset en verzameling van principes voor flexibele softwareontwikkeling. Het draait om samenwerking, klantfeedback, en het vermogen om snel te reageren op verandering.'),
    whenToUse: [
      t('Requirements are uncertain or change frequently', 'Requirements zijn onzeker of veranderen vaak'),
      t('Fast customer feedback is important', 'Snelle feedback van klanten is belangrijk'),
      t('Teams need autonomy', 'Teams hebben autonomie nodig'),
      t('Projects where innovation is central', 'Projecten waar innovatie centraal staat'),
    ],
    keyRoles: [
      { name: 'Product Owner', description: t('Represents the customer and manages priorities', 'Vertegenwoordigt de klant en beheert prioriteiten') },
      { name: 'Team Lead', description: t('Facilitates the team and removes obstacles', 'Faciliteert het team en verwijdert obstakels') },
      { name: 'Development Team', description: t('Cross-functional team that delivers value', 'Cross-functioneel team dat waarde levert') },
    ],
    keyArtifacts: [
      { name: 'Product Backlog', description: t('Prioritized list of desired features', 'Geprioriteerde lijst van gewenste features') },
      { name: 'User Stories', description: t('Description of features from user perspective', 'Beschrijving van features vanuit gebruikersperspectief') },
      { name: 'Working Software', description: t('Working software as primary measure of progress', 'Werkende software als primaire maatstaf van voortgang') },
    ],
    steps: [
      {
        title: t('Vision & Planning', 'Visie & Planning'),
        description: t('Define the product vision and high-level roadmap', 'Definieer de productvisie en high-level roadmap'),
        icon: Target,
        details: [
          t('Define a clear product vision', 'Stel een duidelijke productvisie op'),
          t('Identify key stakeholders', 'Identificeer key stakeholders'),
          t('Create an initial product backlog', 'Maak een initiële product backlog'),
          t('Plan releases at a high level', 'Plan releases op hoog niveau'),
        ],
        tip: t('The vision gives direction, but stay flexible in the details', 'De visie geeft richting, maar blijf flexibel in de details'),
      },
      {
        title: t('Iteration Planning', 'Iteratie Planning'),
        description: t('Plan work for the upcoming iteration', 'Plan werk voor de komende iteratie'),
        icon: Calendar,
        details: [
          t('Select items from the backlog', 'Selecteer items van de backlog'),
          t('Break work into tasks', 'Breek werk op in taken'),
          t('Estimate the effort', 'Schat de effort in'),
          t('Commit as a team to the iteration', 'Commit als team aan de iteratie'),
        ],
        tip: t('Don\'t plan more than the team can realistically deliver', 'Plan niet meer dan het team realistisch kan leveren'),
      },
      {
        title: t('Execution', 'Uitvoering'),
        description: t('Work iteratively on the highest priorities', 'Werk iteratief aan de hoogste prioriteiten'),
        icon: Zap,
        details: [
          t('Daily standup meetings', 'Dagelijkse standup meetings'),
          t('Work on highest priority items', 'Werk aan hoogst geprioriteerde items'),
          t('Continuous integration and testing', 'Continue integratie en testing'),
          t('Visualize progress', 'Visualiseer voortgang'),
        ],
        tip: t('Focus on delivering working software', 'Focus op het opleveren van werkende software'),
      },
      {
        title: t('Review & Demo', 'Review & Demo'),
        description: t('Show results to stakeholders', 'Toon resultaten aan stakeholders'),
        icon: Play,
        details: [
          t('Demonstrate working features', 'Demonstreer werkende features'),
          t('Collect feedback', 'Verzamel feedback'),
          t('Adjust backlog priorities', 'Pas backlog prioriteiten aan'),
          t('Celebrate successes', 'Vier successen'),
        ],
        tip: t('Feedback is a gift - embrace it!', 'Feedback is een cadeau - omarm het!'),
      },
      {
        title: t('Retrospective', 'Retrospective'),
        description: t('Learn and improve continuously', 'Leer en verbeter continu'),
        icon: RefreshCw,
        details: [
          t('Reflect on the process', 'Reflecteer op het proces'),
          t('Identify areas for improvement', 'Identificeer verbeterpunten'),
          t('Define concrete actions', 'Definieer concrete acties'),
          t('Implement improvements', 'Implementeer verbeteringen'),
        ],
        tip: t('Small improvements stack up to big impact', 'Kleine verbeteringen stapelen op tot grote impact'),
      },
    ],
    academyCourse: { title: 'Agile Fundamentals', link: '/academy/course/agile-fundamentals' },
  },

  // ============================================
  // SCRUM
  // ============================================
  scrum: {
    name: 'Scrum',
    icon: Repeat,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    tagline: t('Agile framework for complex product development', 'Agile framework voor complexe productontwikkeling'),
    overview: t('Scrum is an agile framework in which teams work in short sprints (1-4 weeks) on valuable product increments. Through regular feedback and adaptation, you continuously deliver value to the customer.', 'Scrum is een agile framework waarin teams in korte sprints (1-4 weken) werken aan waardevol product increments. Door regelmatige feedback en aanpassing lever je continu waarde aan de klant.'),
    whenToUse: [
      t('Complex product development with uncertain requirements', 'Complexe productontwikkeling met onzekere requirements'),
      t('Teams that want to adapt quickly to change', 'Teams die snel willen kunnen aanpassen aan verandering'),
      t('Projects where customer feedback is crucial', 'Projecten waar klantfeedback cruciaal is'),
      t('Cross-functional teams of 5-9 people', 'Cross-functionele teams van 5-9 mensen'),
    ],
    keyRoles: [
      { name: 'Product Owner', description: t('Manages the Product Backlog and represents stakeholders', 'Beheert de Product Backlog en vertegenwoordigt stakeholders') },
      { name: 'Scrum Master', description: t('Facilitates the Scrum process and removes impediments', 'Faciliteert het Scrum proces en verwijdert impediments') },
      { name: 'Development Team', description: t('Self-organizing team that builds the product', 'Zelfsturend team dat het product bouwt') },
    ],
    keyArtifacts: [
      { name: 'Product Backlog', description: t('Prioritized list of all desired features', 'Geprioriteerde lijst van alle gewenste features') },
      { name: 'Sprint Backlog', description: t('Items selected for the current sprint', 'Items geselecteerd voor de huidige sprint') },
      { name: 'Increment', description: t('The working product at the end of each sprint', 'Het werkende product aan het einde van elke sprint') },
    ],
    steps: [
      {
        title: t('Sprint Planning', 'Sprint Planning'),
        description: t('Plan what work the team will do in the sprint', 'Plan welk werk het team in de sprint gaat doen'),
        icon: Calendar,
        details: [
          t('Review the Product Backlog with the team', 'Review de Product Backlog met het team'),
          t('Select items for the Sprint Backlog', 'Selecteer items voor de Sprint Backlog'),
          t('Define the Sprint Goal', 'Definieer het Sprint Goal'),
          t('Estimate work in story points', 'Schat werk in story points'),
        ],
        tip: t('Keep the planning meeting timeboxed - max 2 hours for a 2-week sprint', 'Houd de planning meeting getimet - max 2 uur voor een 2-weeks sprint'),
      },
      {
        title: t('Daily Scrum', 'Daily Scrum'),
        description: t('Daily 15-minute synchronization', 'Dagelijkse 15-minuten synchronisatie'),
        icon: Users,
        details: [
          t('What did I do yesterday?', 'Wat heb ik gisteren gedaan?'),
          t('What will I do today?', 'Wat ga ik vandaag doen?'),
          t('Are there any impediments?', 'Zijn er impediments?'),
        ],
        tip: t('Stand up during the daily - it keeps the meeting short!', 'Sta op tijdens de daily - het houdt de meeting kort!'),
      },
      {
        title: t('Sprint Execution', 'Sprint Execution'),
        description: t('Team works on the Sprint Backlog items', 'Team werkt aan de Sprint Backlog items'),
        icon: Zap,
        details: [
          t('Work on highest priority items first', 'Werk aan hoogst geprioriteerde items eerst'),
          t('Update the Sprint Board daily', 'Update de Sprint Board dagelijks'),
          t('Pair programming and code reviews', 'Pair programming en code reviews'),
          t('Keep the burndown chart updated', 'Houd de burndown chart bij'),
        ],
        tip: t('Protect the team against scope creep during the sprint', 'Bescherm het team tegen scope creep tijdens de sprint'),
      },
      {
        title: t('Sprint Review', 'Sprint Review'),
        description: t('Demo the working product to stakeholders', 'Demo het werkende product aan stakeholders'),
        icon: Play,
        details: [
          t('Demonstrate completed features', 'Demonstreer voltooide features'),
          t('Collect feedback from stakeholders', 'Verzamel feedback van stakeholders'),
          t('Discuss what was/was not delivered', 'Bespreek wat wel/niet is opgeleverd'),
          t('Update the Product Backlog', 'Update de Product Backlog'),
        ],
        tip: t('Show the real product, not presentations', 'Laat het échte product zien, geen presentaties'),
      },
      {
        title: t('Sprint Retrospective', 'Sprint Retrospective'),
        description: t('Team reflects on the process', 'Team reflecteert op het proces'),
        icon: Lightbulb,
        details: [
          t('What went well?', 'Wat ging goed?'),
          t('What can be improved?', 'Wat kan beter?'),
          t('What actions do we take forward?', 'Welke acties nemen we mee?'),
        ],
        tip: t('Make it safe to be honest - no blame!', 'Maak het veilig om eerlijk te zijn - no blame!'),
      },
    ],
    academyCourse: { title: 'Scrum Fundamentals Course', link: '/academy/course/scrum-master' },
  },

  // ============================================
  // KANBAN
  // ============================================
  kanban: {
    name: 'Kanban',
    icon: Kanban,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    tagline: t('Visualize work, limit WIP, optimize flow', 'Visualiseer werk, beperk WIP, optimaliseer flow'),
    overview: t('Kanban is a visual method for work management that focuses on continuous delivery without overloading the current process. The core principle is limiting Work in Progress (WIP) to optimize flow.', 'Kanban is een visuele methode voor werkbeheer die zich richt op continue levering zonder het huidige proces te overbelasten. Het kernprincipe is het beperken van Work in Progress (WIP) om flow te optimaliseren.'),
    whenToUse: [
      t('Continuous stream of work (support, maintenance)', 'Continue stroom van werk (support, maintenance)'),
      t('Teams that don\'t want fixed iterations', 'Teams die geen vaste iteraties willen'),
      t('When priorities change frequently', 'Wanneer prioriteiten vaak veranderen'),
      t('Process improvement without major changes', 'Procesverbetering zonder grote veranderingen'),
    ],
    keyRoles: [
      { name: 'Service Request Manager', description: t('Manages the inflow of work', 'Beheert de instroom van werk') },
      { name: 'Service Delivery Manager', description: t('Ensures smooth throughput', 'Zorgt voor soepele doorstroom') },
      { name: 'Team Members', description: t('Pull work when they have capacity', 'Trekken werk wanneer ze capaciteit hebben') },
    ],
    keyArtifacts: [
      { name: 'Kanban Board', description: t('Visual representation of work in different stages', 'Visuele weergave van werk in verschillende stadia') },
      { name: 'WIP Limits', description: t('Maximum number of items per column/phase', 'Maximum aantal items per kolom/fase') },
      { name: 'Cumulative Flow Diagram', description: t('Visualization of flow over time', 'Visualisatie van flow over tijd') },
    ],
    steps: [
      {
        title: t('Visualize Work', 'Visualiseer Werk'),
        description: t('Make all work visible on a board', 'Maak al het werk zichtbaar op een board'),
        icon: Eye,
        details: [
          t('Define workflow columns (To Do, Doing, Done)', 'Definieer workflow kolommen (To Do, Doing, Done)'),
          t('Create cards for all work items', 'Maak kaarten voor alle werkitems'),
          t('Visualize blockers and wait times', 'Visualiseer blokkades en wachttijden'),
          t('Use colors for work type', 'Gebruik kleuren voor werktype'),
        ],
        tip: t('If it\'s not on the board, it doesn\'t exist', 'Als het niet op het board staat, bestaat het niet'),
      },
      {
        title: t('Limit WIP', 'Beperk WIP'),
        description: t('Set limits for Work in Progress', 'Stel limieten in voor Work in Progress'),
        icon: Gauge,
        details: [
          t('Determine WIP limits per column', 'Bepaal WIP limits per kolom'),
          t('Start conservatively and adjust', 'Start conservatief en pas aan'),
          t('Stop starting, start finishing', 'Stop starting, start finishing'),
          t('Respect the limits as a team', 'Respecteer de limieten als team'),
        ],
        tip: t('Too much WIP = longer lead time for everything', 'Te veel WIP = langere doorlooptijd voor alles'),
      },
      {
        title: t('Manage Flow', 'Beheer Flow'),
        description: t('Optimize the throughput of work', 'Optimaliseer de doorstroom van werk'),
        icon: TrendingUp,
        details: [
          t('Monitor lead time and cycle time', 'Monitor lead time en cycle time'),
          t('Identify bottlenecks', 'Identificeer bottlenecks'),
          t('Remove blockers quickly', 'Verwijder blokkades snel'),
          t('Balance demand and capacity', 'Balanceer vraag en capaciteit'),
        ],
        tip: t('Focus on reducing lead time, not on being busy', 'Focus op het verkorten van doorlooptijd, niet op drukte'),
      },
      {
        title: t('Make Policies Explicit', 'Maak Policies Expliciet'),
        description: t('Define clear working agreements', 'Definieer duidelijke werkafspraken'),
        icon: FileText,
        details: [
          t('Definition of Done per column', 'Definition of Done per kolom'),
          t('Prioritization rules', 'Prioriteringsregels'),
          t('Escalation procedures', 'Escalatie procedures'),
          t('Service Level Expectations', 'Service Level Expectations'),
        ],
        tip: t('Explicit rules prevent discussions', 'Expliciete regels voorkomen discussies'),
      },
      {
        title: t('Improve Continuously', 'Verbeter Continu'),
        description: t('Use data to improve', 'Gebruik data om te verbeteren'),
        icon: RefreshCw,
        details: [
          t('Analyze flow metrics', 'Analyseer flow metrics'),
          t('Hold regular retrospectives', 'Houd regelmatig retrospectives'),
          t('Experiment with WIP limits', 'Experimenteer met WIP limits'),
          t('Adjust the board based on learnings', 'Pas het board aan op basis van learnings'),
        ],
        tip: t('Small adjustments, measure the effect', 'Kleine aanpassingen, meet het effect'),
      },
    ],
    academyCourse: { title: 'Kanban Essentials', link: '/academy/course/kanban-practitioner' },
  },

  // ============================================
  // PRINCE2
  // ============================================
  prince2: {
    name: 'PRINCE2',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    tagline: t('Structured project management with business focus', 'Gestructureerd projectmanagement met business focus'),
    overview: t('PRINCE2 (PRojects IN Controlled Environments) is a process-based methodology that divides projects into manageable stages with clear governance and continuous business justification.', 'PRINCE2 (PRojects IN Controlled Environments) is een procesgebaseerde methodologie die projecten opdeelt in beheersbare stages met duidelijke governance en continue business justification.'),
    whenToUse: [
      t('Projects that require formal governance', 'Projecten die formele governance vereisen'),
      t('Environments with strict compliance requirements', 'Omgevingen met strikte compliance eisen'),
      t('Projects with clearly defined scope', 'Projecten met duidelijk gedefinieerde scope'),
      t('Organizations that want a standardized approach', 'Organisaties die gestandaardiseerde aanpak willen'),
    ],
    keyRoles: [
      { name: 'Project Board', description: t('Executive, Senior User, Senior Supplier - decision making', 'Executive, Senior User, Senior Supplier - besluitvorming') },
      { name: 'Project Manager', description: t('Day-to-day management of the project', 'Dagelijkse leiding van het project') },
      { name: 'Team Manager', description: t('Leads the execution teams', 'Leidt de uitvoerende teams') },
    ],
    keyArtifacts: [
      { name: 'Business Case', description: t('Justification of the project - continuously updated', 'Rechtvaardiging van het project - wordt continu bijgewerkt') },
      { name: 'Project Plan', description: t('Overview of the entire project', 'Overzicht van het gehele project') },
      { name: 'Stage Plan', description: t('Detailed plan per stage', 'Gedetailleerd plan per stage') },
    ],
    steps: [
      {
        title: t('Starting Up', 'Starting Up'),
        description: t('Preparing for the project', 'Voorbereiden op het project'),
        icon: Target,
        details: [
          t('Appoint Project Board and Project Manager', 'Benoem Project Board en Project Manager'),
          t('Gather existing information', 'Verzamel bestaande informatie'),
          t('Create Project Brief', 'Maak Project Brief'),
          t('Plan the Initiation Stage', 'Plan de Initiation Stage'),
        ],
        tip: t('This is a short, pre-project phase - keep it lean', 'Dit is een korte, pre-project fase - houd het lean'),
      },
      {
        title: t('Initiating', 'Initiating'),
        description: t('Define the project fully', 'Definieer het project volledig'),
        icon: FileText,
        details: [
          t('Refine the Business Case', 'Verfijn de Business Case'),
          t('Create the Project Plan', 'Maak het Project Plan'),
          t('Establish management strategies', 'Stel management strategieën op'),
          t('Create the Project Initiation Documentation (PID)', 'Maak de Project Initiation Documentation (PID)'),
        ],
        tip: t('The PID is your contract with the Project Board', 'De PID is je contract met de Project Board'),
      },
      {
        title: t('Controlling a Stage', 'Controlling a Stage'),
        description: t('Day-to-day management activities', 'Dagelijkse management activiteiten'),
        icon: BarChart3,
        details: [
          t('Authorize Work Packages', 'Autoriseer Work Packages'),
          t('Monitor progress', 'Monitor voortgang'),
          t('Handle issues and risks', 'Behandel issues en risico\'s'),
          t('Report to Project Board', 'Rapporteer aan Project Board'),
        ],
        tip: t('Manage by Exception - only escalate when tolerances are exceeded', 'Manage by Exception - escaleer alleen bij overschrijding van toleranties'),
      },
      {
        title: t('Managing Stage Boundaries', 'Managing Stage Boundaries'),
        description: t('Completion of a stage', 'Afronding van een stage'),
        icon: CheckCircle2,
        details: [
          t('Report stage results', 'Rapporteer stage resultaten'),
          t('Update Business Case', 'Update Business Case'),
          t('Plan next stage', 'Plan volgende stage'),
          t('Request authorization for next stage', 'Vraag autorisatie voor volgende stage'),
        ],
        tip: t('This is your go/no-go moment - be honest about the status', 'Dit is je go/no-go moment - wees eerlijk over de status'),
      },
      {
        title: t('Closing', 'Closing'),
        description: t('Formally closing the project', 'Formeel afsluiten van het project'),
        icon: CheckCircle2,
        details: [
          t('Confirm acceptance of products', 'Bevestig acceptatie van producten'),
          t('Evaluate the project', 'Evalueer het project'),
          t('Document lessons learned', 'Documenteer lessons learned'),
          t('Hand over and close', 'Draag over en sluit af'),
        ],
        tip: t('Plan benefits reviews for after the project', 'Plan benefits reviews voor na het project'),
      },
    ],
    academyCourse: { title: 'PRINCE2 Foundation', link: '/academy/course/prince2-foundation' },
  },

  // ============================================
  // WATERFALL
  // ============================================
  waterfall: {
    name: 'Waterfall',
    icon: Workflow,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-50',
    tagline: t('Sequential approach with clear phases', 'Sequentiële aanpak met duidelijke fases'),
    overview: t('The Waterfall methodology follows a linear, sequential approach where each phase must be fully completed before the next one begins. Ideal for projects with fixed requirements.', 'De Waterfall methodologie volgt een lineaire, sequentiële aanpak waarbij elke fase volledig moet worden afgerond voordat de volgende begint. Ideaal voor projecten met vaste requirements.'),
    whenToUse: [
      t('Requirements are stable and well understood', 'Requirements zijn stabiel en goed begrepen'),
      t('Projects with regulatory compliance requirements', 'Projecten met regulatoire compliance vereisten'),
      t('Hardware or construction projects', 'Hardware of constructie projecten'),
      t('When extensive documentation is required', 'Wanneer uitgebreide documentatie vereist is'),
    ],
    keyRoles: [
      { name: 'Project Manager', description: t('Overall project leadership and coordination', 'Overall project leiding en coördinatie') },
      { name: 'Business Analyst', description: t('Requirements gathering and analysis', 'Requirements gathering en analyse') },
      { name: 'Technical Lead', description: t('Technical decisions and architecture', 'Technische beslissingen en architectuur') },
    ],
    keyArtifacts: [
      { name: 'Requirements Document', description: t('Complete specification of all requirements', 'Volledige specificatie van alle requirements') },
      { name: 'Design Document', description: t('Technical design of the solution', 'Technisch ontwerp van de oplossing') },
      { name: 'Test Plan', description: t('Strategy and cases for testing', 'Strategie en cases voor testing') },
    ],
    steps: [
      {
        title: t('Requirements', 'Requirements'),
        description: t('Gather and document all requirements', 'Verzamel en documenteer alle requirements'),
        icon: FileText,
        details: [
          t('Stakeholder interviews', 'Stakeholder interviews'),
          t('Requirements workshops', 'Requirements workshops'),
          t('Document functional and non-functional requirements', 'Documenteer functionele en non-functionele requirements'),
          t('Obtain formal sign-off', 'Verkrijg formele sign-off'),
        ],
        tip: t('Invest extra time here - changes later are expensive', 'Investeer hier extra tijd - wijzigingen later zijn kostbaar'),
      },
      {
        title: t('Design', 'Design'),
        description: t('Design the technical solution', 'Ontwerp de technische oplossing'),
        icon: Target,
        details: [
          t('High-level architecture', 'High-level architectuur'),
          t('Detailed design', 'Detailed design'),
          t('Database design', 'Database design'),
          t('Interface design', 'Interface design'),
        ],
        tip: t('Review designs with technical experts before moving forward', 'Review designs met technische experts voordat je verder gaat'),
      },
      {
        title: t('Implementation', 'Implementation'),
        description: t('Build the solution', 'Bouw de oplossing'),
        icon: Zap,
        details: [
          t('Code development', 'Code development'),
          t('Unit testing', 'Unit testing'),
          t('Code reviews', 'Code reviews'),
          t('Integration of components', 'Integratie van componenten'),
        ],
        tip: t('Stick strictly to the design specs', 'Houd je strikt aan de design specs'),
      },
      {
        title: t('Testing', 'Testing'),
        description: t('Verification and validation', 'Verificatie en validatie'),
        icon: CheckCircle2,
        details: [
          t('System testing', 'System testing'),
          t('Integration testing', 'Integration testing'),
          t('User Acceptance Testing (UAT)', 'User Acceptance Testing (UAT)'),
          t('Performance testing', 'Performance testing'),
        ],
        tip: t('Plan sufficient time for bug fixing after UAT', 'Plan voldoende tijd voor bug fixing na UAT'),
      },
      {
        title: t('Deployment & Maintenance', 'Deployment & Maintenance'),
        description: t('Go-live and support', 'Go-live en ondersteuning'),
        icon: Play,
        details: [
          t('Deployment to production', 'Deployment naar productie'),
          t('User training', 'User training'),
          t('Documentation handover', 'Documentatie overdracht'),
          t('Support and maintenance', 'Support en maintenance'),
        ],
        tip: t('Prepare a rollback plan just in case', 'Bereid een rollback plan voor voor het geval dat'),
      },
    ],
    academyCourse: { title: 'Waterfall Methodology', link: '/academy/course/waterfall-pm' },
  },

  // ============================================
  // LEAN SIX SIGMA
  // ============================================
  lean_six_sigma: {
    name: 'Lean Six Sigma',
    icon: BarChart3,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-50',
    tagline: t('Data-driven process improvement', 'Data-gedreven procesverbetering'),
    overview: t('Lean Six Sigma combines Lean\'s focus on eliminating waste with Six Sigma\'s statistical approach for reducing variation. Result: more efficient processes with higher quality.', 'Lean Six Sigma combineert Lean\'s focus op het elimineren van verspilling met Six Sigma\'s statistische aanpak voor het reduceren van variatie. Resultaat: efficiëntere processen met hogere kwaliteit.'),
    whenToUse: [
      t('Process improvement and optimization projects', 'Procesverbetering en optimalisatie projecten'),
      t('Quality problems with measurable impact', 'Kwaliteitsproblemen met meetbare impact'),
      t('Efficiency improvement initiatives', 'Efficiëntie verbetering initiatieven'),
      t('When data is available for analysis', 'Wanneer data beschikbaar is voor analyse'),
    ],
    keyRoles: [
      { name: 'Champion', description: t('Sponsor who provides resources and support', 'Sponsor die resources en support levert') },
      { name: 'Black Belt', description: t('Full-time project leader, expert in LSS tools', 'Fulltime projectleider, expert in LSS tools') },
      { name: 'Green Belt', description: t('Part-time team member with LSS training', 'Parttime teamlid met LSS training') },
    ],
    keyArtifacts: [
      { name: 'Project Charter', description: t('Problem statement, scope and goals', 'Probleemstelling, scope en doelen') },
      { name: 'Process Map', description: t('Visualization of the current process', 'Visualisatie van het huidige proces') },
      { name: 'Control Plan', description: t('Plan to sustain improvements', 'Plan om verbeteringen te borgen') },
    ],
    steps: [
      {
        title: t('Define', 'Define'),
        description: t('Define the problem and project scope', 'Definieer het probleem en project scope'),
        icon: Target,
        details: [
          t('Create Project Charter', 'Maak Project Charter'),
          t('Identify Voice of Customer (VOC)', 'Identificeer Voice of Customer (VOC)'),
          t('Define CTQ\'s (Critical to Quality)', 'Definieer CTQ\'s (Critical to Quality)'),
          t('Set SMART goals', 'Stel SMART doelen'),
        ],
        tip: t('A well-defined problem is half solved', 'Een goed gedefinieerd probleem is half opgelost'),
      },
      {
        title: t('Measure', 'Measure'),
        description: t('Measure the current performance', 'Meet de huidige performance'),
        icon: BarChart3,
        details: [
          t('Create a Process Map (SIPOC)', 'Maak een Process Map (SIPOC)'),
          t('Identify what to measure', 'Identificeer wat te meten'),
          t('Collect baseline data', 'Verzamel baseline data'),
          t('Calculate current sigma level', 'Bereken huidige sigma level'),
        ],
        tip: t('Validate your measurement system before drawing conclusions', 'Valideer je meetsysteem voordat je conclusies trekt'),
      },
      {
        title: t('Analyze', 'Analyze'),
        description: t('Analyze data to find root causes', 'Analyseer data om root causes te vinden'),
        icon: Lightbulb,
        details: [
          t('Analyze process flow', 'Analyseer process flow'),
          t('Identify waste and variation', 'Identificeer waste en variatie'),
          t('Use 5 Why\'s and Fishbone', 'Gebruik 5 Why\'s en Fishbone'),
          t('Validate root causes with data', 'Valideer root causes met data'),
        ],
        tip: t('Keep going until you find the real root cause, not symptoms', 'Ga door tot je de échte root cause vindt, niet symptomen'),
      },
      {
        title: t('Improve', 'Improve'),
        description: t('Implement improvements', 'Implementeer verbeteringen'),
        icon: Zap,
        details: [
          t('Generate solutions', 'Genereer oplossingen'),
          t('Evaluate and select best solution', 'Evalueer en selecteer beste oplossing'),
          t('Pilot the improvement', 'Pilot de verbetering'),
          t('Implement fully', 'Implementeer volledig'),
        ],
        tip: t('Test improvements small before rolling out broadly', 'Test verbeteringen klein voordat je breed uitrolt'),
      },
      {
        title: t('Control', 'Control'),
        description: t('Sustain the improvements', 'Borg de verbeteringen'),
        icon: CheckCircle2,
        details: [
          t('Create Control Plan', 'Maak Control Plan'),
          t('Implement monitoring', 'Implementeer monitoring'),
          t('Standardize new way of working', 'Standaardiseer nieuwe werkwijze'),
          t('Document and train', 'Documenteer en train'),
        ],
        tip: t('Without control, improvements will regress', 'Zonder control vallen verbeteringen terug'),
      },
    ],
    academyCourse: { title: 'Lean Six Sigma Yellow Belt', link: '/academy/course/lean-six-sigma' },
  },

  // ============================================
  // HYBRID
  // ============================================
  hybrid: {
    name: 'Hybrid',
    icon: GitMerge,
    color: 'text-pink-600',
    bgColor: 'bg-pink-50',
    tagline: t('Flexible combination of methodologies', 'Flexibele combinatie van methodologieën'),
    overview: t('The Hybrid approach combines elements from different methodologies to create the best fit for your project. Take the structure of Waterfall and the flexibility of Agile where needed.', 'De Hybrid aanpak combineert elementen van verschillende methodologieën om de beste fit voor jouw project te creëren. Neem de structuur van Waterfall en de flexibiliteit van Agile waar nodig.'),
    whenToUse: [
      t('Projects with both fixed and flexible components', 'Projecten met zowel vaste als flexibele componenten'),
      t('Organizations in transition to Agile', 'Organisaties in transitie naar Agile'),
      t('Complex projects with diverse deliverables', 'Complexe projecten met diverse deliverables'),
      t('When pure methodologies don\'t fit', 'Wanneer pure methodologieën niet passen'),
    ],
    keyRoles: [
      { name: 'Project Manager', description: t('Overall coordination and stakeholder management', 'Overall coördinatie en stakeholder management') },
      { name: 'Product Owner', description: t('Prioritization of features for agile components', 'Prioritering van features voor agile componenten') },
      { name: 'Team Leads', description: t('Lead specific workstreams', 'Leiden specifieke workstreams') },
    ],
    keyArtifacts: [
      { name: 'Project Plan', description: t('High-level planning with milestones', 'High-level planning met milestones') },
      { name: 'Backlog', description: t('List of features for iterative development', 'Lijst van features voor iteratieve ontwikkeling') },
      { name: 'Status Dashboard', description: t('Unified view of all workstreams', 'Unified view van alle workstreams') },
    ],
    steps: [
      {
        title: t('Setup', 'Setup'),
        description: t('Define your hybrid approach', 'Definieer je hybride aanpak'),
        icon: Target,
        details: [
          t('Determine which parts are agile/waterfall', 'Bepaal welke delen agile/waterfall zijn'),
          t('Define governance structure', 'Definieer governance structuur'),
          t('Align with stakeholders', 'Stem af met stakeholders'),
          t('Document the chosen approach', 'Documenteer de gekozen aanpak'),
        ],
        tip: t('Be explicit about the rules - prevent confusion', 'Wees expliciet over de regels - voorkom verwarring'),
      },
      {
        title: t('Planning', 'Planning'),
        description: t('Plan at different levels', 'Plan op verschillende niveaus'),
        icon: Calendar,
        details: [
          t('High-level roadmap with milestones', 'High-level roadmap met milestones'),
          t('Sprint/iteration planning for agile parts', 'Sprint/iteration planning voor agile delen'),
          t('Detailed planning for waterfall parts', 'Gedetailleerde planning voor waterfall delen'),
        ],
        tip: t('Synchronize milestones between workstreams', 'Synchroniseer milestones tussen workstreams'),
      },
      {
        title: t('Execution', 'Execution'),
        description: t('Execute parallel workstreams', 'Voer parallel workstreams uit'),
        icon: Zap,
        details: [
          t('Sprints for iterative development', 'Sprints voor iteratieve development'),
          t('Stage-gates for waterfall components', 'Stage-gates voor waterfall componenten'),
          t('Regular synchronization meetings', 'Regelmatige synchronisatie meetings'),
        ],
        tip: t('Keep a close eye on dependencies between streams', 'Houd dependencies tussen streams goed in de gaten'),
      },
      {
        title: t('Integration', 'Integration'),
        description: t('Integrate deliverables', 'Integreer deliverables'),
        icon: GitMerge,
        details: [
          t('Integrate outputs from different streams', 'Integreer outputs van verschillende streams'),
          t('End-to-end testing', 'End-to-end testing'),
          t('Stakeholder demos', 'Stakeholder demos'),
        ],
        tip: t('Plan integration moments in advance', 'Plan integratie momenten vooraf in'),
      },
      {
        title: t('Delivery', 'Delivery'),
        description: t('Deliver the final product', 'Lever het eindproduct'),
        icon: CheckCircle2,
        details: [
          t('Final integration and testing', 'Final integration en testing'),
          t('Deployment', 'Deployment'),
          t('Retrospective on the hybrid approach', 'Retrospective over de hybride aanpak'),
        ],
        tip: t('Evaluate what did/didn\'t work for future projects', 'Evalueer wat wel/niet werkte voor volgende projecten'),
      },
    ],
    academyCourse: { title: 'Hybrid Project Management', link: '/academy/course/hybrid-pm' },
  },

  // ============================================
  // SAFe (Scaled Agile Framework) - Programs
  // ============================================
  safe: {
    name: 'SAFe',
    icon: Layers,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    tagline: t('Scaled Agile for enterprise programs', 'Scaled Agile voor enterprise programma\'s'),
    overview: t('SAFe (Scaled Agile Framework) is a framework for scaling agile practices to enterprise level. It synchronizes multiple agile teams via Program Increments (PI) and Agile Release Trains (ART).', 'SAFe (Scaled Agile Framework) is een framework voor het schalen van agile praktijken naar enterprise niveau. Het synchroniseert meerdere agile teams via Program Increments (PI) en Agile Release Trains (ART).'),
    whenToUse: [
      t('Large organizations with multiple agile teams', 'Grote organisaties met meerdere agile teams'),
      t('Software development programs', 'Software development programma\'s'),
      t('Digital transformation initiatives', 'Digitale transformatie initiatieven'),
      t('When teams need to collaborate on complex products', 'Wanneer teams moeten samenwerken aan complexe producten'),
    ],
    keyRoles: [
      { name: 'Release Train Engineer', description: t('Facilitates the ART and PI events', 'Faciliteert de ART en PI events') },
      { name: 'Product Management', description: t('Defines and prioritizes the Program Backlog', 'Definieert en prioriteert de Program Backlog') },
      { name: 'System Architect', description: t('Guards architectural integrity', 'Bewaakt architecturele integriteit') },
    ],
    keyArtifacts: [
      { name: 'Program Backlog', description: t('Features prioritized for the ART', 'Features geprioriteerd voor de ART') },
      { name: 'PI Objectives', description: t('Goals for the Program Increment', 'Doelen voor het Program Increment') },
      { name: 'Program Board', description: t('Visualization of dependencies between teams', 'Visualisatie van dependencies tussen teams') },
    ],
    steps: [
      {
        title: t('PI Planning', 'PI Planning'),
        description: t('Two-day planning event with all teams', 'Twee-daagse planning event met alle teams'),
        icon: Calendar,
        details: [
          t('Present vision and context', 'Presenteer visie en context'),
          t('Teams plan their sprints', 'Teams plannen hun sprints'),
          t('Identify dependencies', 'Identificeer dependencies'),
          t('Management review and adjustments', 'Management review en aanpassingen'),
        ],
        tip: t('PI Planning is the heartbeat of SAFe - invest in good preparation', 'PI Planning is het heartbeat van SAFe - investeer in goede voorbereiding'),
      },
      {
        title: t('Iteration Execution', 'Iteration Execution'),
        description: t('Teams work in 2-week sprints', 'Teams werken in 2-weeks sprints'),
        icon: Zap,
        details: [
          t('Daily standups per team', 'Dagelijkse standups per team'),
          t('Scrum of Scrums for coordination', 'Scrum of Scrums voor coördinatie'),
          t('Continuous integration', 'Continue integratie'),
          t('Feature development', 'Feature development'),
        ],
        tip: t('Actively monitor dependencies via Scrum of Scrums', 'Houd dependencies actief in de gaten via Scrum of Scrums'),
      },
      {
        title: t('System Demo', 'System Demo'),
        description: t('Demonstrate integrated work each iteration', 'Demonstreer geïntegreerd werk elke iteratie'),
        icon: Play,
        details: [
          t('Teams integrate their work', 'Teams integreren hun werk'),
          t('Demo to stakeholders', 'Demo aan stakeholders'),
          t('Collect feedback', 'Verzamel feedback'),
          t('Adjust planning if needed', 'Pas planning aan indien nodig'),
        ],
        tip: t('The System Demo shows real progress - no slides!', 'De System Demo toont echte voortgang - geen slides!'),
      },
      {
        title: t('Innovation & Planning', 'Innovation & Planning'),
        description: t('Space for innovation and preparation', 'Ruimte voor innovatie en voorbereiding'),
        icon: Lightbulb,
        details: [
          t('Hackathons and innovation', 'Hackathons en innovatie'),
          t('Reduce technical debt', 'Technische debt afbouwen'),
          t('Training and knowledge sharing', 'Training en kennisdeling'),
          t('Preparation for next PI', 'Voorbereiding volgende PI'),
        ],
        tip: t('Protect this time - it\'s essential for sustainability', 'Bescherm deze tijd - het is essentieel voor duurzaamheid'),
      },
      {
        title: t('Inspect & Adapt', 'Inspect & Adapt'),
        description: t('Program-wide retrospective', 'Programma-brede retrospective'),
        icon: RefreshCw,
        details: [
          t('Quantitative and qualitative review', 'Kwantitatieve en kwalitatieve review'),
          t('Identify areas for improvement', 'Identificeer verbeterpunten'),
          t('Problem solving workshop', 'Problem solving workshop'),
          t('Define improvement backlog items', 'Definieer improvement backlog items'),
        ],
        tip: t('Bring data - make problems visible with facts', 'Breng data mee - maak problemen zichtbaar met feiten'),
      },
    ],
    academyCourse: { title: 'SAFe Fundamentals', link: '/academy/course/safe-scaling-agile' },
  },

  // ============================================
  // MSP (Managing Successful Programmes)
  // ============================================
  msp: {
    name: 'MSP',
    icon: Target,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    tagline: t('Benefits-driven programme management', 'Benefits-gedreven programma management'),
    overview: t('MSP (Managing Successful Programmes) is the UK government standard for programme management, with focus on benefits realization, stakeholder engagement and organizational change.', 'MSP (Managing Successful Programmes) is de UK government standaard voor programma management, met focus op benefits realization, stakeholder engagement en organisatieverandering.'),
    whenToUse: [
      t('Government and public sector programmes', 'Overheid en publieke sector programma\'s'),
      t('Organizational transformations', 'Organisatorische transformaties'),
      t('Programmes with significant change impact', 'Programma\'s met significante change impact'),
      t('Benefits-driven initiatives', 'Benefits-gedreven initiatieven'),
    ],
    keyRoles: [
      { name: 'Sponsoring Group', description: t('Investment and strategic direction', 'Investering en strategische richting') },
      { name: 'Programme Manager', description: t('Day-to-day management of the programme', 'Dagelijkse leiding van het programma') },
      { name: 'Business Change Manager', description: t('Realization of benefits', 'Realisatie van benefits') },
    ],
    keyArtifacts: [
      { name: 'Programme Brief', description: t('Initial justification and scope', 'Initiële rechtvaardiging en scope') },
      { name: 'Blueprint', description: t('Description of the future state', 'Beschrijving van de toekomstige staat') },
      { name: 'Benefits Map', description: t('Visualization of how outputs lead to benefits', 'Visualisatie van hoe outputs leiden tot benefits') },
    ],
    steps: [
      {
        title: t('Identifying', 'Identifying'),
        description: t('Identify and define the programme', 'Identificeer en definieer het programma'),
        icon: Target,
        details: [
          t('Confirm strategic fit', 'Bevestig strategische fit'),
          t('Create Programme Brief', 'Maak Programme Brief'),
          t('Identify stakeholders', 'Identificeer stakeholders'),
          t('Sketch initial Blueprint', 'Schets initiële Blueprint'),
        ],
        tip: t('Make sure the link with strategy is crystal clear', 'Zorg dat de link met strategie glashelder is'),
      },
      {
        title: t('Defining', 'Defining'),
        description: t('Define the programme fully', 'Definieer het programma volledig'),
        icon: FileText,
        details: [
          t('Refine Blueprint', 'Verfijn Blueprint'),
          t('Develop Benefits Realization Plan', 'Ontwikkel Benefits Realization Plan'),
          t('Design governance structure', 'Ontwerp governance structuur'),
          t('Plan tranches', 'Plan tranches'),
        ],
        tip: t('The Blueprint describes the "what", not the "how"', 'De Blueprint beschrijft het "wat", niet het "hoe"'),
      },
      {
        title: t('Managing Tranches', 'Managing Tranches'),
        description: t('Deliver projects and capabilities', 'Lever projecten en capabilities'),
        icon: Layers,
        details: [
          t('Coordinate projects within the tranche', 'Coördineer projecten binnen de tranche'),
          t('Monitor progress and benefits', 'Monitor voortgang en benefits'),
          t('Manage dependencies', 'Manage dependencies'),
          t('Prepare for transition', 'Prepare voor transitie'),
        ],
        tip: t('Focus on capabilities, not just project outputs', 'Focus op capabilities, niet alleen project outputs'),
      },
      {
        title: t('Delivering Capabilities', 'Delivering Capabilities'),
        description: t('Transition to operations', 'Transitie naar operatie'),
        icon: CheckCircle2,
        details: [
          t('Prepare organization for change', 'Bereid organisatie voor op verandering'),
          t('Transition capabilities to BAU', 'Transitie capabilities naar BAU'),
          t('Support adoption', 'Support adoption'),
          t('Monitor early benefits', 'Monitor early benefits'),
        ],
        tip: t('Change management is at least as important as delivery', 'Change management is minstens zo belangrijk als delivery'),
      },
      {
        title: t('Realizing Benefits', 'Realizing Benefits'),
        description: t('Realize and measure benefits', 'Realiseer en meet benefits'),
        icon: TrendingUp,
        details: [
          t('Track benefits realization', 'Track benefits realization'),
          t('Identify new benefits', 'Identificeer nieuwe benefits'),
          t('Report to stakeholders', 'Rapporteer aan stakeholders'),
          t('Adjust if needed', 'Pas aan indien nodig'),
        ],
        tip: t('Benefits realization continues after programme closure', 'Benefits realization gaat door na programma afsluiting'),
      },
    ],
    academyCourse: { title: 'MSP Foundation', link: '/academy/course/msp-foundation' },
  },

  // ============================================
  // PMI Program Management
  // ============================================
  pmi: {
    name: 'PMI Standard',
    icon: BarChart3,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    tagline: t('PMI\'s program management framework', 'PMI\'s programma management framework'),
    overview: t('The PMI Standard for Program Management provides a framework for managing related projects to achieve strategic goals that are not achievable by managing projects individually.', 'De PMI Standard for Program Management biedt een framework voor het managen van gerelateerde projecten om strategische doelen te bereiken die niet haalbaar zijn door projecten individueel te managen.'),
    whenToUse: [
      t('Organizations that follow PMI standards', 'Organisaties die PMI standaarden volgen'),
      t('Programmes that require formal governance', 'Programma\'s die formele governance vereisen'),
      t('Multi-project coordination', 'Multi-project coördinatie'),
      t('Strategic initiative management', 'Strategische initiative management'),
    ],
    keyRoles: [
      { name: 'Program Sponsor', description: t('Owner of the business case', 'Eigenaar van de business case') },
      { name: 'Program Manager', description: t('Leads the program and coordinates projects', 'Leidt het programma en coördineert projecten') },
      { name: 'Program Management Office', description: t('Supports governance and reporting', 'Ondersteunt governance en rapportage') },
    ],
    keyArtifacts: [
      { name: 'Program Charter', description: t('Authorization and scope of the program', 'Autorisatie en scope van het programma') },
      { name: 'Program Roadmap', description: t('High-level timeline and milestones', 'High-level tijdlijn en milestones') },
      { name: 'Benefits Register', description: t('Tracking of all program benefits', 'Tracking van alle programma benefits') },
    ],
    steps: [
      {
        title: t('Program Definition', 'Program Definition'),
        description: t('Define and authorize the program', 'Definieer en autoriseer het programma'),
        icon: Target,
        details: [
          t('Develop Program Charter', 'Ontwikkel Program Charter'),
          t('Identify stakeholders', 'Identificeer stakeholders'),
          t('Create initial roadmap', 'Maak initiële roadmap'),
          t('Establish governance', 'Stel governance op'),
        ],
        tip: t('Alignment with strategy is critical for success', 'Alignment met strategie is kritiek voor succes'),
      },
      {
        title: t('Program Planning', 'Program Planning'),
        description: t('Plan the program in detail', 'Plan het programma in detail'),
        icon: Calendar,
        details: [
          t('Define program scope', 'Definieer program scope'),
          t('Identify component projects', 'Identificeer component projecten'),
          t('Plan resources and budget', 'Plan resources en budget'),
          t('Develop risk management approach', 'Ontwikkel risk management approach'),
        ],
        tip: t('Plan at program level, let projects do their own detail planning', 'Plan op programma niveau, laat projecten hun eigen detail plannen'),
      },
      {
        title: t('Program Delivery', 'Program Delivery'),
        description: t('Coordinate and deliver', 'Coördineer en lever'),
        icon: Zap,
        details: [
          t('Start and monitor component projects', 'Start en monitor component projecten'),
          t('Manage dependencies', 'Manage dependencies'),
          t('Integrate deliverables', 'Integreer deliverables'),
          t('Governance meetings', 'Governance meetings'),
        ],
        tip: t('Focus on integration and dependencies, not on project details', 'Focus op integratie en dependencies, niet op project details'),
      },
      {
        title: t('Benefits Delivery', 'Benefits Delivery'),
        description: t('Realize program benefits', 'Realiseer programma benefits'),
        icon: TrendingUp,
        details: [
          t('Transition outputs to operations', 'Transitie outputs naar operatie'),
          t('Monitor benefits realization', 'Monitor benefits realization'),
          t('Report to stakeholders', 'Rapporteer aan stakeholders'),
          t('Adjust approach based on results', 'Adjust approach based on results'),
        ],
        tip: t('Benefits are the goal - outputs are merely means', 'Benefits zijn het doel - outputs zijn slechts middelen'),
      },
      {
        title: t('Program Closure', 'Program Closure'),
        description: t('Formally close the program', 'Sluit het programma formeel af'),
        icon: CheckCircle2,
        details: [
          t('Confirm benefits delivery', 'Bevestig benefits delivery'),
          t('Transition remaining work', 'Transitie remaining work'),
          t('Release resources', 'Release resources'),
          t('Document lessons learned', 'Document lessons learned'),
        ],
        tip: t('Plan benefits tracking that continues after program end', 'Plan benefits tracking die doorgaat na programma einde'),
      },
    ],
    academyCourse: { title: 'PgMP Preparation', link: '/academy/course/program-management-pro' },
  },

  // ============================================
  // PRINCE2 Programme
  // ============================================
  prince2_programme: {
    name: 'P2 Programme',
    icon: Crown,
    color: 'text-amber-600',
    bgColor: 'bg-amber-50',
    tagline: t('PRINCE2 principles for programmes', 'PRINCE2 principes voor programma\'s'),
    overview: t('PRINCE2 for Programmes applies the PRINCE2 principles at programme level, with focus on governance, business justification and structured tranches.', 'PRINCE2 for Programmes past de PRINCE2 principes toe op programma niveau, met focus op governance, business justification en gestructureerde tranches.'),
    whenToUse: [
      t('Organizations that use PRINCE2 for projects', 'Organisaties die PRINCE2 gebruiken voor projecten'),
      t('Programmes that require formal controls', 'Programma\'s die formele controls vereisen'),
      t('Government and regulated industries', 'Overheid en gereguleerde industrieën'),
      t('Programmes with strict governance requirements', 'Programma\'s met strikte governance eisen'),
    ],
    keyRoles: [
      { name: 'Programme Board', description: t('Strategic decision making and governance', 'Strategische besluitvorming en governance') },
      { name: 'Programme Manager', description: t('Day-to-day management of the programme', 'Dagelijkse leiding van het programma') },
      { name: 'Business Change Manager', description: t('Responsible for benefits realization', 'Verantwoordelijk voor benefits realization') },
    ],
    keyArtifacts: [
      { name: 'Programme Brief', description: t('Initial definition and justification', 'Initiële definitie en rechtvaardiging') },
      { name: 'Programme Plan', description: t('Master plan for the programme', 'Master plan voor het programma') },
      { name: 'Benefits Realization Plan', description: t('Plan for realizing benefits', 'Plan voor het realiseren van benefits') },
    ],
    steps: [
      {
        title: t('Programme Mandate', 'Programme Mandate'),
        description: t('Receive and validate the mandate', 'Ontvang en valideer de opdracht'),
        icon: FileText,
        details: [
          t('Review strategic drivers', 'Review strategische drivers'),
          t('Validate initial scope', 'Valideer initiële scope'),
          t('Identify key stakeholders', 'Identificeer key stakeholders'),
          t('Prepare Programme Brief', 'Bereid Programme Brief voor'),
        ],
        tip: t('Make sure the strategic link is clearly documented', 'Zorg dat de strategische link duidelijk is gedocumenteerd'),
      },
      {
        title: t('Programme Definition', 'Programme Definition'),
        description: t('Define the programme fully', 'Definieer het programma volledig'),
        icon: Target,
        details: [
          t('Develop Blueprint', 'Ontwikkel Blueprint'),
          t('Create Programme Plan', 'Maak Programme Plan'),
          t('Define governance', 'Definieer governance'),
          t('Plan first tranche', 'Plan eerste tranche'),
        ],
        tip: t('The Blueprint is the compass - keep it up-to-date', 'De Blueprint is het kompas - houd het up-to-date'),
      },
      {
        title: t('Tranche Delivery', 'Tranche Delivery'),
        description: t('Deliver capabilities per tranche', 'Lever capabilities per tranche'),
        icon: Layers,
        details: [
          t('Start projects within tranche', 'Start projecten binnen tranche'),
          t('Monitor progress', 'Monitor voortgang'),
          t('Manage issues and risks', 'Manage issues en risico\'s'),
          t('Prepare transitions', 'Bereid transities voor'),
        ],
        tip: t('Each tranche must deliver measurable benefits', 'Elke tranche moet meetbare benefits opleveren'),
      },
      {
        title: t('Tranche Review', 'Tranche Review'),
        description: t('Review and decide on continuation', 'Review en besluit over vervolg'),
        icon: CheckCircle2,
        details: [
          t('Evaluate tranche results', 'Evalueer tranche resultaten'),
          t('Review Business Case', 'Review Business Case'),
          t('Decide on next tranche', 'Besluit over volgende tranche'),
          t('Update plans', 'Update plannen'),
        ],
        tip: t('This is the go/no-go moment - be objective', 'Dit is het go/no-go moment - wees objectief'),
      },
      {
        title: t('Programme Closure', 'Programme Closure'),
        description: t('Close the programme', 'Sluit het programma af'),
        icon: Award,
        details: [
          t('Confirm benefits delivery', 'Bevestig benefits delivery'),
          t('Transition to BAU', 'Transitie naar BAU'),
          t('Document lessons learned', 'Document lessons learned'),
          t('Release resources', 'Release resources'),
        ],
        tip: t('Plan post-programme benefits reviews', 'Plan post-programme benefits reviews'),
      },
    ],
    academyCourse: { title: 'PRINCE2 for Programmes', link: '/academy/course/prince2-foundation' },
  },
};

// Mapping voor varianten naar base configs
const getMethodologyConfig = (methodology: string, language: 'en' | 'nl'): MethodologyOnboardingConfig => {
  if (BILINGUAL_CONFIG[methodology]) {
    return resolveConfig(BILINGUAL_CONFIG[methodology], language);
  }
  const methodologyMap: Record<string, string> = {
    'lean_six_sigma_green': 'lean_six_sigma',
    'lean_six_sigma_black': 'lean_six_sigma',
  };
  const mappedMethodology = methodologyMap[methodology];
  if (mappedMethodology && BILINGUAL_CONFIG[mappedMethodology]) {
    return resolveConfig(BILINGUAL_CONFIG[mappedMethodology], language);
  }
  return resolveConfig(BILINGUAL_CONFIG.hybrid, language);
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
  const { pt } = usePageTranslations();

  const { language } = useLanguage();
  const config = getMethodologyConfig(methodology, language);
  const Icon = config.icon;

  // Reset step when dialog opens or methodology changes
  useEffect(() => {
    if (open) {
      setCurrentStep(0);
    }
  }, [open, methodology]);

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
                {currentStep === 0 ? `${pt("Welcome to")} ${config.name}` : (config.steps && config.steps[currentStep - 1]?.title) || pt('Get Started')}
              </DialogTitle>
              <DialogDescription>
                {projectName ? `${pt("Setting up")}: ${projectName}` : config.tagline}
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
                <h3 className="font-semibold mb-2">{pt("What is")} {config.name}?</h3>
                <p className="text-sm text-muted-foreground">{config.overview}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">{pt("When to use")} {config.name}</h3>
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
                    {pt("Key Roles")}
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
                    {pt("Key Artifacts")}
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
          {currentStep >= 1 && currentStep <= 3 && config.steps && (
            <div className="space-y-4">
              {config.steps.slice((currentStep - 1) * 2, currentStep * 2).filter(Boolean).map((step, i) => {
                const StepIcon = step.icon || Lightbulb;
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
              {pt("Don't show this again for")} {config.name}
            </label>
          </div>
          <div className="flex items-center gap-2">
            {currentStep === 0 && (
              <Button variant="ghost" onClick={handleSkip}>
                {pt("Skip Tutorial")}
              </Button>
            )}
            {currentStep > 0 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                {pt("Back")}
              </Button>
            )}
            {currentStep < totalSteps - 1 ? (
              <Button onClick={() => setCurrentStep(currentStep + 1)}>
                {pt("Next")}
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            ) : (
              <Button onClick={handleComplete} className={cn(config.bgColor, config.color, "hover:opacity-90")}>
                <Play className="h-4 w-4 mr-2" />
                {pt("Start Project")}
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
              {pt("Want to learn more?")} {config.academyCourse.title}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default MethodologyOnboardingWizard;
