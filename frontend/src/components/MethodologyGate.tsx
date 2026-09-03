import { ReactNode } from "react";
import { Navigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

import { projectsApi } from "@/lib/api";
import { methodologyOverviewPath } from "@/lib/methodologyRoutes";

/**
 * Route-level gate for methodology-namespaced project pages.
 *
 * Children mount only after the project's methodology is confirmed to match,
 * so pages never fire their data calls against the wrong methodology
 * namespace (which 403s server-side). On a mismatch we redirect to the
 * project's own workspace instead of rendering an empty, erroring page.
 */
const MethodologyGate = ({ expected, children }: { expected: string[]; children: ReactNode }) => {
  const { id } = useParams<{ id: string }>();

  const { data: project, isError } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.getById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });

  if (!id || isError) return <Navigate to="/projects" replace />;
  if (!project) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }
  if (project.methodology && !expected.includes(project.methodology)) {
    return <Navigate to={methodologyOverviewPath(id, project.methodology)} replace />;
  }
  return <>{children}</>;
};

export default MethodologyGate;
