import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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

const statusIcon = (progress: number) => {
  if (progress >= 100) return <CheckCircle2 className="h-5 w-5 text-green-500" />;
  if (progress > 0) return <Clock className="h-5 w-5 text-blue-500" />;
  return <Circle className="h-5 w-5 text-gray-300" />;
};

const HybridTimeline = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const phasesQ = useQuery({ queryKey: ["hybrid-phases", id], queryFn: () => fetchJson(`/api/v1/projects/${id}/hybrid/phase-methodologies/`), enabled: !!id });
  const tasksQ = useQuery({ queryKey: ["hybrid-tasks", id], queryFn: () => fetchJson(`/api/v1/projects/${id}/hybrid/tasks/`), enabled: !!id });
  const phases = toArr(phasesQ.data).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  const tasks = toArr(tasksQ.data);

  if (phasesQ.isLoading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3"><Calendar className="h-6 w-6 text-pink-500" /><h1 className="text-2xl font-bold">{pt("Timeline")}</h1></div>

        {phases.length === 0 ? <Card className="p-8 text-center"><Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No phases yet")}</h3></Card> : (
          <div className="relative pl-8">
            <div className="absolute left-3 top-2 bottom-2 w-0.5 bg-border" />
            <div className="space-y-6">{phases.map((p: any) => {
              const phaseTasks = tasks.filter((t: any) => String(t.phase) === String(p.id));
              return (
                <div key={p.id} className="relative">
                  <div className="absolute -left-8 top-1">{statusIcon(p.progress ?? 0)}</div>
                  <Card><CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold">{p.phase}</span>
                        <Badge variant="outline" className="text-xs">{p.methodology}</Badge>
                      </div>
                      <span className="text-xs text-muted-foreground">{p.start_date || "—"} → {p.end_date || "—"}</span>
                    </div>
                    {p.description && <p className="text-sm text-muted-foreground mb-3">{p.description}</p>}
                    <div className="flex items-center gap-3 mb-3"><Progress value={p.progress ?? 0} className="h-2 flex-1" /><span className="text-xs font-medium w-10 text-right">{p.progress ?? 0}%</span></div>
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

export default HybridTimeline;
