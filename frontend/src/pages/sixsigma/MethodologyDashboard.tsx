import { FC } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Target, 
  Kanban, 
  GitBranch, 
  Layers, 
  Workflow,
  TrendingUp,
  CheckSquare,
  BarChart3
} from 'lucide-react';

// Import methodology-specific dashboard components
import LeanSixSigmaDMAIC from '@/pages/sixsigma/LeanSixSigmaDMAIC';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';

interface Project {
  id: number;
  name: string;
  methodology?: string;
  status?: string;
  [key: string]: any;
}

interface MethodologyDashboardProps {
  project: Project;
}

// Placeholder dashboard for methodologies not yet implemented
const PlaceholderDashboard: FC<{ methodology: string; icon: React.ReactNode }> = ({ methodology, icon }) => (
  <Card>
    <CardContent className="py-12 text-center">
      <div className="flex justify-center mb-4 text-muted-foreground">
        {icon}
      </div>
      <h3 className="text-lg font-medium mb-2">{methodology} Dashboard</h3>
      <p className="text-muted-foreground mb-4">
        The {methodology} methodology dashboard is coming soon.
      </p>
      <Badge variant="outline">Under Development</Badge>
    </CardContent>
  </Card>
);

// Scrum Dashboard Placeholder
const ScrumDashboard: FC<{ project: Project }> = ({ project }) => (
  <PlaceholderDashboard 
    methodology="Scrum" 
    icon={<Target className="h-12 w-12" />} 
  />
);

// Kanban Dashboard Placeholder
const KanbanDashboard: FC<{ project: Project }> = ({ project }) => (
  <PlaceholderDashboard 
    methodology="Kanban" 
    icon={<Kanban className="h-12 w-12" />} 
  />
);

// Agile Dashboard Placeholder
const AgileDashboard: FC<{ project: Project }> = ({ project }) => (
  <PlaceholderDashboard 
    methodology="Agile" 
    icon={<GitBranch className="h-12 w-12" />} 
  />
);

// PRINCE2 Dashboard Placeholder
const Prince2Dashboard: FC<{ project: Project }> = ({ project }) => (
  <PlaceholderDashboard 
    methodology="PRINCE2" 
    icon={<Layers className="h-12 w-12" />} 
  />
);

// Waterfall Dashboard Placeholder
const WaterfallDashboard: FC<{ project: Project }> = ({ project }) => (
  <PlaceholderDashboard 
    methodology="Waterfall" 
    icon={<Workflow className="h-12 w-12" />} 
  />
);

// Hybrid Dashboard Placeholder
const HybridDashboard: FC<{ project: Project }> = ({ project }) => (
  <PlaceholderDashboard 
    methodology="Hybrid" 
    icon={<CheckSquare className="h-12 w-12" />} 
  />
);

// Generic Dashboard for unknown methodologies
const GenericDashboard: FC<{ project: Project }> = ({ project }) => (
  <Card>
    <CardContent className="py-12 text-center">
      <BarChart3 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
      <h3 className="text-lg font-medium mb-2">Project Dashboard</h3>
      <p className="text-muted-foreground">
        Select a methodology for this project to see a customized dashboard.
      </p>
    </CardContent>
  </Card>
);

/**
 * MethodologyDashboard
 * 
 * A wrapper component that renders the appropriate dashboard based on
 * the project's methodology. This allows each methodology to have its
 * own specialized view with relevant tools and metrics.
 */
export const MethodologyDashboard: FC<MethodologyDashboardProps> = ({ project }) => {
  const methodology = project.methodology?.toLowerCase();

  switch (methodology) {
    // Lean Six Sigma (Green Belt & Black Belt)
    case 'lean_six_sigma_green':
    case 'lean_six_sigma_black':
    case 'six_sigma':
    case 'dmaic':
      return <LeanSixSigmaDMAIC />;

    // Agile methodologies
    case 'scrum':
      return <ScrumDashboard project={project} />;
    
    case 'kanban':
      return <KanbanDashboard project={project} />;
    
    case 'agile':
      return <AgileDashboard project={project} />;

    // Traditional methodologies
    case 'prince2':
      return <Prince2Dashboard project={project} />;
    
    case 'waterfall':
      return <WaterfallDashboard project={project} />;

    // Hybrid
    case 'hybrid':
      return <HybridDashboard project={project} />;

    // Default/Unknown
    default:
      return <GenericDashboard project={project} />;
  }
};

<MethodologyHelpPanel methodology="lean_six_sigma" />

export default MethodologyDashboard;
