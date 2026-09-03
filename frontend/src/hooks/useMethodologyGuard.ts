import { useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import { projectsApi } from "@/lib/api";
import { methodologyOverviewPath } from "@/lib/methodologyRoutes";

/**
 * Guard for methodology-namespaced project pages.
 *
 * Landing on e.g. /projects/:id/prince2/* for a project whose methodology is
 * not PRINCE2 makes every data call 403 ("This methodology endpoint doesn't
 * match the project's methodology") and the page renders empty with console
 * errors — seen live with Inclufy Best Practice ('inclufy') projects reached
 * via absolute links (copilot quick-links, bookmarks, typed URLs). Instead of
 * erroring, silently redirect to the project's own workspace.
 *
 * @param expected methodology field values this page section serves
 *                 (e.g. ["prince2"], or both LSS belts for shared screens)
 */
export function useMethodologyGuard(expected: string[]) {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: () => projectsApi.getById(id!),
    enabled: !!id,
    staleTime: 60_000,
  });

  useEffect(() => {
    if (!id || !project?.methodology) return;
    if (!expected.includes(project.methodology)) {
      navigate(methodologyOverviewPath(id, project.methodology), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, project?.methodology, navigate, expected.join(",")]);
}

export default useMethodologyGuard;
