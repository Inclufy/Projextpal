import ScrumDashboard from './ScrumDashboard';
import KanbanDashboard from './KanbanDashboard';
import Prince2Dashboard from './Prince2Dashboard';
import LeanSixSigmaDashboard from './LeanSixSigmaDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface MethodologyDashboardProps {
  project: any;
}

const MethodologyDashboard = ({ project }: MethodologyDashboardProps) => {
  const methodology = project?.methodology?.toLowerCase();

  switch (methodology) {
    case 'scrum':
      return <ScrumDashboard project={project} />;
    case 'kanban':
      return <KanbanDashboard project={project} />;
    case 'prince2':
      return <Prince2Dashboard project={project} />;
    case 'lean_six_sigma_green':
      return <LeanSixSigmaDashboard project={project} level="green" />;
    case 'lean_six_sigma_black':
      return <LeanSixSigmaDashboard project={project} level="black" />;
    case 'agile':
      return <ScrumDashboard project={project} />; // Agile uses similar view to Scrum
    case 'waterfall':
      return <Prince2Dashboard project={project} />; // Waterfall uses similar stage-gate view
    case 'hybrid':
      return <ScrumDashboard project={project} />; // Hybrid defaults to Scrum-like view
    default:
      return (
        <Card>
          <CardContent className="py-12 text-center">
            <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-medium">No Methodology Selected</h3>
            <p className="text-muted-foreground mt-2">
              This project doesn't have a methodology assigned yet.
            </p>
          </CardContent>
        </Card>
      );
  }
};

export default MethodologyDashboard;
