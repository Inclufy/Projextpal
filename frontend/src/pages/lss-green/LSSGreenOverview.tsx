import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatBudgetDetailed, getCurrencyFromLanguage } from "@/lib/currencies";
import { Loader2, Target, Users, ListChecks, Activity, BarChart3, Euro, Calendar, FlaskConical, Gauge } from "lucide-react";

const fetchJson = async (url: string) => {
  const token = localStorage.getItem("access_token");
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
};
const toArr = (d: any) => (Array.isArray(d) ? d : d?.results || []);

const LSSGreenOverview = () => {
  const { pt } = usePageTranslations();
  const { language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const phasesQ = useQuery({ queryKey: ["lssg-phases", id], queryFn: () => fetchJson(`/api/v1/lss-green/projects/${id}/dmaic-phases/`), enabled: !!id });
  const tasksQ = useQuery({ queryKey: ["lssg-tasks", id], queryFn: () => fetchJson(`/api/v1/lss-green/projects/${id}/tasks/`), enabled: !!id });
  const metricsQ = useQuery({ queryKey: ["lssg-metrics", id], queryFn: () => fetchJson(`/api/v1/lss-green/projects/${id}/metrics/`), enabled: !!id });
  const costQ = useQuery({ queryKey: ["lssg-cost", id], queryFn: () => fetchJson(`/api/v1/finance/projects/${id}/cost-summary/`), enabled: !!id });

  const phases = toArr(phasesQ.data);
  const tasks = toArr(tasksQ.data);
  const metrics = toArr(metricsQ.data);
  const cost = costQ.data;

  const totalPhases = phases.length;
  const completedPhases = phases.filter((p: any) => p.status === "completed").length;
  const inProgressPhases = phases.filter((p: any) => p.status === "in_progress").length;
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === "completed" || t.status === "done").length;
  const teamSet = new Set(tasks.map((t: any) => t.assignee).filter(Boolean));
  const teamSize = teamSet.size;
  const phaseProgress = totalPhases > 0 ? Math.round((completedPhases / totalPhases) * 100) : 0;
  const targetEnd = phases.map((p: any) => p.target_end_date).filter(Boolean).sort().pop();
  const recent = [...tasks].sort((a: any, b: any) => (b.id || 0) - (a.id || 0)).slice(0, 5);
  const latestMetric = metrics[0];

  const formatCurrency = (val: number) => formatBudgetDetailed(val, getCurrencyFromLanguage(language));
  const loading = phasesQ.isLoading || tasksQ.isLoading;
  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  const nav = (path: string) => navigate(`/projects/${id}/lss-green/${path}`);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-green-600 flex items-center justify-center"><FlaskConical className="h-5 w-5 text-white" /></div>
            <div><h1 className="text-2xl font-bold">{pt("LSS Green Belt Dashboard")}</h1><p className="text-sm text-muted-foreground">{pt("Lean Six Sigma — Green Belt")}</p></div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Target className="h-4 w-4 text-muted-foreground" /><p className="text-sm text-muted-foreground">{pt("Phases")}</p></div><p className="text-2xl font-bold">{completedPhases}/{totalPhases}</p><p className="text-xs text-muted-foreground">{inProgressPhases} {pt("in progress")}</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><ListChecks className="h-4 w-4 text-muted-foreground" /><p className="text-sm text-muted-foreground">{pt("Tasks")}</p></div><p className="text-2xl font-bold">{completedTasks}/{totalTasks}</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Users className="h-4 w-4 text-muted-foreground" /><p className="text-sm text-muted-foreground">{pt("Team Members")}</p></div><p className="text-2xl font-bold">{teamSize}</p></CardContent></Card>
          <Card><CardContent className="p-4"><div className="flex items-center gap-2 mb-1"><Calendar className="h-4 w-4 text-muted-foreground" /><p className="text-sm text-muted-foreground">{pt("Target End")}</p></div><p className="text-base font-semibold">{targetEnd || "—"}</p></CardContent></Card>
        </div>

        <Card><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><Activity className="h-4 w-4" /> {pt("DMAIC Progress")}</CardTitle></CardHeader>
          <CardContent>
            <div className="flex items-center justify-between mb-2"><span className="text-sm text-muted-foreground">{pt("Overall completion")}</span><span className="text-sm font-semibold">{phaseProgress}%</span></div>
            <Progress value={phaseProgress} className="h-3 mb-4" />
            <div className="grid grid-cols-5 gap-2">
              {["define", "measure", "analyze", "improve", "control"].map(ph => {
                const found = phases.find((p: any) => (p.phase || "").toLowerCase() === ph);
                const status = found?.status || "not_started";
                const color = status === "completed" ? "bg-green-500" : status === "in_progress" ? "bg-blue-500" : "bg-gray-200";
                return (<div key={ph} className="text-center"><div className={`h-2 rounded ${color} mb-1`} /><span className="text-xs capitalize">{ph}</span></div>);
              })}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><ListChecks className="h-4 w-4" /> {pt("Recent Tasks")}</CardTitle></CardHeader>
            <CardContent>{recent.length === 0 ? <p className="text-sm text-muted-foreground text-center py-4">{pt("No tasks yet")}</p> : (
              <div className="space-y-2">{recent.map((t: any) => (
                <div key={t.id} className="flex items-center justify-between p-2 border rounded">
                  <div className="flex-1 min-w-0"><p className="text-sm font-medium truncate">{t.title}</p><p className="text-xs text-muted-foreground">{t.assignee_name || "—"}</p></div>
                  <Badge variant="outline" className="text-xs">{t.status}</Badge>
                </div>
              ))}</div>
            )}</CardContent>
          </Card>

          <Card><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><Euro className="h-4 w-4" /> {pt("Cost Summary")}</CardTitle></CardHeader>
            <CardContent>{!cost ? <p className="text-sm text-muted-foreground text-center py-4">{pt("Loading…")}</p> : (
              <div className="space-y-3">
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{pt("Budget")}</span><span className="font-semibold">{formatCurrency(cost.budget?.total || 0)}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{pt("Spent")}</span><span className="font-semibold">{formatCurrency(cost.budget?.total_spent || 0)}</span></div>
                <div className="flex items-center justify-between"><span className="text-sm text-muted-foreground">{pt("Remaining")}</span><span className={`font-semibold ${(cost.budget?.remaining || 0) < 0 ? "text-red-500" : "text-green-600"}`}>{formatCurrency(cost.budget?.remaining || 0)}</span></div>
                <Progress value={cost.budget?.total > 0 ? Math.round((cost.budget.total_spent / cost.budget.total) * 100) : 0} className="h-2" />
              </div>
            )}</CardContent>
          </Card>
        </div>

        {latestMetric && (
          <Card><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2"><Gauge className="h-4 w-4" /> {pt("Latest Quality Metrics")}</CardTitle></CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4">
                <div><p className="text-xs text-muted-foreground">Cp</p><p className="text-xl font-bold">{latestMetric.cp ?? "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Cpk</p><p className="text-xl font-bold">{latestMetric.cpk ?? "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">DPMO</p><p className="text-xl font-bold">{latestMetric.defects_per_million ?? "—"}</p></div>
                <div><p className="text-xs text-muted-foreground">Sigma</p><p className="text-xl font-bold">{latestMetric.sigma_level ?? "—"}</p></div>
              </div>
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: pt("Phases"), path: "phases", icon: Target },
            { label: pt("Tasks"), path: "tasks", icon: ListChecks },
            { label: pt("Timeline"), path: "timeline", icon: Calendar },
            { label: pt("Metrics"), path: "metrics", icon: Gauge },
            { label: pt("Measurements"), path: "measurements", icon: BarChart3 },
          ].map(({ label, path, icon: Icon }) => (
            <Card key={path} className="cursor-pointer hover:bg-muted/50 transition-colors" onClick={() => nav(path)}>
              <CardContent className="p-4 flex items-center gap-3"><Icon className="h-5 w-5 text-muted-foreground" /><span className="font-medium text-sm">{label}</span></CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default LSSGreenOverview;
