import { useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { projectsApi } from "@/lib/api";
import { methodologyOverviewPath } from "@/lib/methodologyRoutes";

// Entry point for the bare /projects/:id URL: loads the project, reads its
// methodology, and redirects to that methodology's workspace (e.g.
// /projects/103/prince2/dashboard). Historically this page rendered program
// detail by mistake, so every deep link to a project showed
// "Failed to load program".
const ProjectDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project, error } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.getById(id!),
    enabled: !!id,
  });

  useEffect(() => {
    if (project && id) {
      navigate(methodologyOverviewPath(id, project.methodology), { replace: true });
    }
  }, [project, id, navigate]);

  if (error || !id) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-red-500">Failed to load project</p>
        <Button onClick={() => navigate("/projects")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center h-64">
      <Loader2 className="h-8 w-8 animate-spin text-primary" />
    </div>
  );
};

export default ProjectDetail;
