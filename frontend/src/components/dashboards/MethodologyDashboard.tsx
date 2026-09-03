import ScrumDashboard from './ScrumDashboard';
import KanbanDashboard from './KanbanDashboard';
import Prince2Dashboard from './Prince2Dashboard';
import LeanSixSigmaDashboard from './LeanSixSigmaDashboard';
import { Card, CardContent } from '@/components/ui/card';
import { AlertCircle } from 'lucide-react';

interface MethodologyDashboardProps {
  project: any;
}


const BEST_PRACTICE_LINKS = [
  { slug: 'foundation/workflow', title: 'Workflow', description: 'Curated best-practice flow through the project phases' },
  { slug: 'foundation/charter', title: 'Project Charter', description: 'Scope, objectives and governance in one place' },
  { slug: 'planning/milestones', title: 'Milestones', description: 'Key dates and delivery moments' },
  { slug: 'foundation/budget', title: 'Budget', description: 'Allocation, spend and remaining budget' },
];

const BestPracticeDashboard = ({ project }: { project: any }) => (
  <Card>
    <CardContent className="py-6">
      <div className="mb-4">
        <h3 className="text-lg font-medium">Inclufy Best Practice</h3>
        <p className="text-muted-foreground text-sm mt-1">
          The curated ProjeXtPal method — structured delivery with lightweight governance.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        {BEST_PRACTICE_LINKS.map((l) => (
          <a
            key={l.slug}
            href={`/projects/${project?.id}/${l.slug}`}
            className="rounded-lg border p-4 hover:bg-accent transition-colors block"
          >
            <div className="font-medium">{l.title}</div>
            <div className="text-sm text-muted-foreground mt-1">{l.description}</div>
          </a>
        ))}
      </div>
    </CardContent>
  </Card>
);

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
    case 'inclufy':
      // Inclufy Best Practice has no borrowed dashboard: the PRINCE2 embed it
      // used fired /prince2/* calls that the backend rightly 403s for
      // non-prince2 projects (methodology-match permission). Its home is the
      // Foundation workspace, so link there instead of borrowing.
      return <BestPracticeDashboard project={project} />;
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
