import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Loader2, Calendar, CheckCircle2, Circle, Clock } from "lucide-react";

const fetchJson = async (url: string) => {
  const token = localStorage.getItem("access_token");
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
};
const toArr = (d: any) => (Array.isArray(d) ? d : d?.results || []);

const statusIcon = (status: string) => {
  if (status === "completed") return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  if (status === "in_progress") return <Clock className="h-5 w-5 text-blue-500" />;
  return <Circle className="h-5 w-5 text-gray-300" />;
};

const LSSBlackTimeline = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const phasesQ = useQuery({ queryKey: ["lssb-phases", id], queryFn: () => fetchJson(`/api/v1/lss-black/projects/${id}/dmaic-phases/`), enabled: !!id });
  const tasksQ = useQuery({ queryKey: ["lssb-tasks", id], queryFn: () => fetchJson(`/api/v1/lss-black/projects/${id}/tasks/`), enabled: !!id });
  const phases = toArr(phasesQ.data).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  const tasks = toArr(tasksQ.data);

  if (phasesQ.isLoading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3"><Calendar className="h-6 w-6 text-gray-700" /><h1 className="text-2xl font-bold">{pt("Timeline")}</h1></div>

        {phases.length === 0 ? <Card className="p-8 text-center"><Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No phases yet")}</h3></Card> : (
          <div className="relative pl-8">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />
            <div className="space-y-6">{phases.map((p: any) => {
              const phaseTasks = tasks.filter((t: any) => t.phase === p.id);
              return (
                <div key={p.id} className="relative">
                  <div className="absolute -left-8 top-1">{statusIcon(p.status)}</div>
                  <Card><CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold capitalize">{p.phase_display || p.phase}</span>
                        <Badge variant="outline" className="text-xs">{p.status?.replace("_", " ")}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{p.target_start_date || "—"} → {p.target_end_date || "—"}</span>
                    </div>
                    {p.objective && <p className="text-sm text-muted-foreground mb-3">{p.objective}</p>}
                    {phaseTasks.length > 0 && (
                      <div className="space-y-1.5 mt-3">{phaseTasks.map((t: any) => (
                        <div key={t.id} className="flex items-center gap-2 text-sm pl-3 border-l-2 border-muted">
                          <span className="flex-1">{t.title}</span>
                          <span className="text-xs text-muted-foreground">{t.due_date || "—"}</span>
                          <Badge variant="outline" className="text-xs">{t.status}</Badge>
                        </div>
                      ))}</div>
                    )}
                  </CardContent></Card>
                </div>
              );
            })}</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default LSSBlackTimeline;
