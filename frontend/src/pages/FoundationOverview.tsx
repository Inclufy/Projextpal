import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { useParams, Navigate, useNavigate } from "react-router-dom";
import { useProject } from "@/hooks/useApi";
import { MethodologyDashboard } from "@/components/dashboards";
import {
  Loader2, LayoutDashboard, List, FileCheck, GitBranch, TrendingUp,
  Lightbulb, ArrowRight, Sparkles,
} from "lucide-react";
import { useState } from "react";
import { usePageTranslations } from '@/hooks/usePageTranslations';

// The curated best-of-breed widgets that make "Inclufy Best Practice" an
// opinionated method rather than a blank fallback: a light business case
// (PRINCE2), a flow board with WIP (Kanban/Agile), milestone + EVM health
// (Waterfall), and a real closure + lessons gate (PRINCE2).
const BestPracticePanel = ({ projectId, pt }: { projectId: string; pt: (s: string) => string }) => {
  const navigate = useNavigate();
  const widgets = [
    {
      icon: FileCheck,
      title: pt("Light Business Case & Charter"),
      desc: pt("Justify the project up front — vision, objectives, and a one-page charter. Borrowed from PRINCE2, kept lightweight."),
      to: `/projects/${projectId}/foundation/charter`,
    },
    {
      icon: GitBranch,
      title: pt("Flow Board with WIP"),
      desc: pt("A pull-based workflow that limits work in progress, so the team finishes before it starts. Borrowed from Kanban & Agile."),
      to: `/projects/${projectId}/foundation/workflow`,
    },
    {
      icon: TrendingUp,
      title: pt("Milestone & Budget Health"),
      desc: pt("Track milestones and budget burn with simple EVM-style health, so slippage surfaces early. Borrowed from Waterfall."),
      to: `/projects/${projectId}/planning/milestones`,
    },
    {
      icon: Lightbulb,
      title: pt("Closure & Lessons Gate"),
      desc: pt("Close the project deliberately: confirm deliverables and capture lessons before sign-off. Borrowed from PRINCE2."),
      to: `/projects/${projectId}/monitoring/lessons-surveys`,
    },
  ];
  return (
    <Card className="p-6 mb-6 border-indigo-200 bg-indigo-50/40">
      <div className="flex items-start gap-3 mb-4">
        <div className="p-2 rounded-lg bg-indigo-100">
          <Sparkles className="h-5 w-5 text-indigo-600" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-foreground">{pt("Inclufy Best Practice")}</h3>
          <p className="text-sm text-muted-foreground">
            {pt("A curated, governed default — the best of every method, so you don't have to pick a framework to get started.")}
          </p>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {widgets.map((w) => (
          <button
            key={w.title}
            onClick={() => navigate(w.to)}
            className="text-left p-4 rounded-lg border border-border bg-background hover:border-indigo-300 hover:shadow-sm transition group"
          >
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <w.icon className="h-4 w-4 text-indigo-600" />
                <span className="font-medium text-foreground">{w.title}</span>
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-indigo-600 transition" />
            </div>
            <p className="text-sm text-muted-foreground">{w.desc}</p>
          </button>
        ))}
      </div>
    </Card>
  );
};

const FoundationOverview = () => {
  const { pt } = usePageTranslations();
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

  // Methodologies that have a dedicated, richer dashboard land there directly
  // instead of the generic Project Overview (keeps the project entry point in
  // sync with the methodology sidebar's "Overview" link).
  // These land on their own dedicated overview rather than the embedded
  // MethodologyDashboard, which for these three borrowed another methodology's
  // dashboard (hybrid/agile -> Scrum, waterfall -> PRINCE2) and so fired
  // cross-methodology API calls that 403 and mislabelled the project.
  const METHODOLOGY_LANDING: Record<string, string> = {
    prince2: "prince2/dashboard",
    hybrid: "hybrid/overview",
    agile: "agile/overview",
    waterfall: "waterfall/overview",
  };
  const landing = METHODOLOGY_LANDING[project?.methodology?.toLowerCase()];
  if (landing && id) {
    return <Navigate to={`/projects/${id}/${landing}`} replace />;
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
            <h2 className="text-xl font-semibold">{pt("Project Overview")}</h2>
            {project?.methodology && (
              <Badge variant="outline" className="text-sm">
                {getMethodologyLabel(project.methodology)}
              </Badge>
            )}
            {id && (
              <Button variant="outline" size="sm" className="gap-2" onClick={() => navigate(`/projects/${id}/foundation/closure`)}>
                <FileCheck className="h-4 w-4" /> {pt("Close project")}
              </Button>
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
              {pt("Methodology View")}
            </Button>
            <Button
              variant={viewMode === 'classic' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('classic')}
              className="gap-2"
            >
              <List className="h-4 w-4" />
              {pt("Classic View")}
            </Button>
          </div>
        </div>

        {/* Methodology Dashboard */}
        {viewMode === 'methodology' && project?.methodology ? (
          <>
            {project.methodology.toLowerCase() === 'inclufy' && id && (
              <BestPracticePanel projectId={id} pt={pt} />
            )}
            <MethodologyDashboard project={project} />
          </>
        ) : (
          /* Classic View */
          <Card className="p-6">
            <div className="mb-4">
              <h2 className="text-xl font-semibold text-foreground mb-1">{pt("Project Overview")}</h2>
              <p className="text-sm text-muted-foreground">
                View and manage all aspects of your project foundation.
              </p>
            </div>
            <div className="space-y-4">
              {/* Project Info */}
              {project && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-sm text-muted-foreground">{pt("Status")}</p>
                    <p className="font-medium capitalize">{project.status?.replace('_', ' ')}</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-sm text-muted-foreground">{pt("Budget")}</p>
                    <p className="font-medium">${parseFloat(project.budget || 0).toLocaleString()}</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-sm text-muted-foreground">{pt("Start Date")}</p>
                    <p className="font-medium">{project.start_date || 'Not set'}</p>
                  </div>
                  <div className="p-4 rounded-lg border bg-muted/30">
                    <p className="text-sm text-muted-foreground">{pt("End Date")}</p>
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
