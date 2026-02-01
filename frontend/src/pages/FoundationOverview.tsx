import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { useParams } from "react-router-dom";
import { useProject } from "@/hooks/useApi";
import { MethodologyDashboard } from "@/components/dashboards";
import { Loader2, LayoutDashboard, List } from "lucide-react";
import { useState } from "react";

const FoundationOverview = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project, isLoading, error } = useProject(id);
  const [viewMode, setViewMode] = useState<'methodology' | 'classic'>('methodology');

  if (isLoading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="p-6 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="p-6">
          <Card className="p-6 text-center">
            <p className="text-red-500">Failed to load project</p>
          </Card>
        </div>
      </div>
    );
  }

  const getMethodologyLabel = (methodology: string) => {
    const labels: Record<string, string> = {
      'scrum': 'Scrum',
      'kanban': 'Kanban',
      'agile': 'Agile',
      'prince2': 'PRINCE2',
      'waterfall': 'Waterfall',
      'lean_six_sigma_green': 'Lean Six Sigma (Green Belt)',
      'lean_six_sigma_black': 'Lean Six Sigma (Black Belt)',
      'hybrid': 'Hybrid',
    };
    return labels[methodology?.toLowerCase()] || methodology || 'Not set';
  };

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        {/* View Toggle & Methodology Badge */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-semibold">Project Overview</h2>
            {project?.methodology && (
              <Badge variant="outline" className="text-sm">
                {getMethodologyLabel(project.methodology)}
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-2 bg-muted rounded-lg p-1">
            <Button
              variant={viewMode === 'methodology' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('methodology')}
              className="gap-2"
            >
              <LayoutDashboard className="h-4 w-4" />
              Methodology View
            </Button>
            <Button
              variant={viewMode === 'classic' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('classic')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              Classic View
            </Button>
          </div>
        </div>

        {/* Methodology Dashboard */}
        {viewMode === 'methodology' && project?.methodology ? (
          <MethodologyDashboard project={project} />
        ) : (
          /* Classic View */
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground mb-1">Project Overview</h2>
              <p className="text-sm text-muted-foreground">
                View and manage all aspects of your project foundation.
              </p>
            </div>
            <div className="space-y-4">
              {/* Project Info */}
              {project && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-sm text-muted-foreground">Status</p>
                    <p className="font-medium capitalize">{project.status?.replace('_', ' ')}</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-sm text-muted-foreground">Budget</p>
                    <p className="font-medium">${parseFloat(project.budget || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-sm text-muted-foreground">Start Date</p>
                    <p className="font-medium">{project.start_date || 'Not set'}</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-sm text-muted-foreground">End Date</p>
                    <p className="font-medium">{project.end_date || 'Not set'}</p>
                  </div>
                </div>
              )}

              <div className="p-4 rounded-lg border border-border bg-muted/30">
                <h3 className="font-medium text-foreground mb-2">Recent Activity</h3>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <p>• Task "Design sign off" completed</p>
                  <p>• Milestone "Kick off" reached on 08.12.2024</p>
                  <p>• Budget updated to $3,100</p>
                </div>
              </div>
              <div className="p-4 rounded-lg border border-border bg-primary/5">
                <h3 className="font-medium text-foreground mb-2">Quick Actions</h3>
                <div className="flex gap-2 flex-wrap">
                  <Button variant="outline" size="sm">Add Task</Button>
                  <Button variant="outline" size="sm">Create Milestone</Button>
                  <Button variant="outline" size="sm">Update Budget</Button>
                  <Button variant="outline" size="sm">Add Team Member</Button>
                </div>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default FoundationOverview;
