import { ProjectTimeline as TimelineComponent } from "@/components/ProjectTimeline";
import { ProjectHeader } from "@/components/ProjectHeader";

const ProjectTimeline = () => {
  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-foreground mb-2">Project Timeline</h1>
          <p className="text-muted-foreground">Track project progress, milestones, and deliverables</p>
        </div>
        <TimelineComponent />
      </div>
    </div>
  );
};

export default ProjectTimeline;
