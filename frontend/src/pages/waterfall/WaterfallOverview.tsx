import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { AIHealthStrip } from "@/components/AIHealthStrip";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Loader2, RefreshCw, Waves, Plus, ListChecks, FileText, TestTube, Milestone, BarChart3, GitPullRequest, Rocket, Wrench, Euro, AlertTriangle, AlertCircle, Package, Baseline, Users, Workflow, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import { DemoControls } from "@/components/DemoControls";
import MethodologyFlow, { FlowStep, FlowStatus } from "@/components/MethodologyFlow";

// Static metadata per Waterfall phase: short code, purpose, and the tabs it drives.
const WF_PHASES: Record<string, { code: string; purpose: string; links: { label: string; slug: string }[] }> = {
  requirements: { code: "REQ", purpose: "Capture and baseline what the system must do before any design starts.", links: [{ label: "Requirements", slug: "requirements" }, { label: "Phase Gate", slug: "phase-gate" }] },
  design: { code: "DES", purpose: "Translate the baselined requirements into a technical design and architecture.", links: [{ label: "Design", slug: "design" }, { label: "Phase Gate", slug: "phase-gate" }] },
  development: { code: "DEV", purpose: "Build the product to the approved design, tracking progress against the plan.", links: [{ label: "Development", slug: "development" }, { label: "Deliverables", slug: "deliverables" }] },
  testing: { code: "TST", purpose: "Verify the build against the requirements; no failing tests pass the gate.", links: [{ label: "Testing", slug: "testing" }, { label: "Phase Gate", slug: "phase-gate" }] },
  deployment: { code: "DEP", purpose: "Release the accepted product into production in a controlled hand-over.", links: [{ label: "Deployment", slug: "deployment" }, { label: "Milestones", slug: "milestones" }] },
  maintenance: { code: "MNT", purpose: "Operate, support and improve the live product through its service life.", links: [{ label: "Maintenance", slug: "maintenance" }] },
};

const wfStatus = (s: string): FlowStatus =>
  s === "completed" ? "done" : s === "in_progress" ? "active" : "todo";

const buildWaterfallSteps = (phases: any[]): FlowStep[] =>
  [...phases].sort((a, b) => (a.order || 0) - (b.order || 0)).map((p) => {
    const meta = WF_PHASES[p.phase_type] || { code: (p.name || "?").slice(0, 3).toUpperCase(), purpose: "", links: [] };
    return {
      code: meta.code,
      label: p.name,
      purpose: meta.purpose,
      progress: p.progress || 0,
      status: wfStatus(p.status),
      meta: typeof p.task_count === "number" ? `${p.task_count} ${p.task_count === 1 ? "task" : "tasks"}` : undefined,
      links: meta.links,
      academyHref: "/academy/course/waterfall-pm",
    };
  });

const WaterfallOverview = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchDashboard = async () => { try { const r = await fetch(`/api/v1/projects/${id}/waterfall/dashboard/`, { headers }); if (r.ok) setDashboard(await r.json()); } catch (err) { console.error(err); } finally { setLoading(false); } };
  const initialize = async () => { try { const r = await fetch(`/api/v1/projects/${id}/waterfall/initialize/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success(pt("Initialized")); fetchDashboard(); } else toast.error(pt("Initialize failed")); } catch { toast.error(pt("Initialize failed")); } };

  useEffect(() => { fetchDashboard(); }, [id]);
  const nav = (path: string) => navigate(`/projects/${id}/waterfall/${path}`);

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);
  const d = dashboard || {};

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        {id && <AIHealthStrip scope="project" id={id} />}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-cyan-600 flex items-center justify-center"><Waves className="h-5 w-5 text-white" /></div><div><h1 className="text-2xl font-bold">Waterfall Dashboard</h1><p className="text-sm text-muted-foreground">{d.project_name || ""}</p></div></div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={initialize} className="gap-2"><Plus className="h-4 w-4" /> Initialize</Button>
            {id && <DemoControls entityId={id} methodology="waterfall" onChanged={fetchDashboard} />}
            <Button variant="outline" onClick={fetchDashboard} className="gap-2"><RefreshCw className="h-4 w-4" /> {pt("Refresh")}</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Current Phase")}</p><p className="text-2xl font-bold">{d.current_phase?.name || "None"}</p>{d.current_phase && <Badge variant={d.current_phase.status === "in_progress" ? "default" : "secondary"}>{d.current_phase.status}</Badge>}</CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Overall Progress")}</p><p className="text-2xl font-bold">{d.overall_progress || 0}%</p><Progress value={d.overall_progress || 0} className="h-2 mt-2" /></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Phases")}</p><p className="text-2xl font-bold">{d.completed_phases || 0}/{d.total_phases || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Open Issues")}</p><p className="text-2xl font-bold text-red-500">{d.open_issues || 0}</p></CardContent></Card>
        </div>

        {d.phases?.length > 0 && (
          <Card>
            <CardHeader className="pb-3 flex-row items-center justify-between space-y-0"><CardTitle className="flex items-center gap-2 text-base"><Workflow className="h-5 w-5 text-cyan-600" /> {pt("Waterfall Phase Flow")}</CardTitle>
              <button type="button" onClick={() => navigate("/academy/course/waterfall-pm")} className="inline-flex items-center gap-1.5 rounded-lg border border-cyan-200 bg-cyan-50 px-2.5 py-1 text-xs font-medium text-cyan-700 transition-colors hover:bg-cyan-100 dark:border-cyan-900/50 dark:bg-cyan-950/30 dark:text-cyan-300" title={pt("Open the Waterfall course in the Academy")}><GraduationCap className="h-3.5 w-3.5" /> {pt("Waterfall course")}</button>
            </CardHeader>
            <CardContent>
              <MethodologyFlow steps={buildWaterfallSteps(d.phases)} accent="cyan" onNavigate={nav} />
            </CardContent>
          </Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: pt("Phases"), path: "phase-gate", icon: ListChecks },
            { label: pt("Requirements"), path: "requirements", icon: FileText },
            { label: pt("Design"), path: "design", icon: FileText },
            { label: pt("Development"), path: "development", icon: BarChart3 },
            { label: pt("Testing"), path: "testing", icon: TestTube },
            { label: pt("Milestones"), path: "milestones", icon: Milestone },
            { label: pt("Gantt Chart"), path: "gantt", icon: BarChart3 },
            { label: pt("Change Requests"), path: "change-requests", icon: GitPullRequest },
            { label: pt("Deployment"), path: "deployment", icon: Rocket },
            { label: pt("Maintenance"), path: "maintenance", icon: Wrench },
            { label: pt("Budget"), path: "budget", icon: Euro },
            { label: pt("Risks"), path: "risks", icon: AlertTriangle },
            { label: pt("Issues"), path: "issues", icon: AlertCircle },
            { label: pt("Deliverables"), path: "deliverables", icon: Package },
            { label: pt("Baselines"), path: "baselines", icon: Baseline },
            { label: pt("Team"), path: "team", icon: Users },
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

export default WaterfallOverview;
