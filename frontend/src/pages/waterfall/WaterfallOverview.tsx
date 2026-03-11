import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Loader2, RefreshCw, Waves, Plus, ListChecks, FileText, TestTube, Milestone, BarChart3, GitPullRequest, Rocket, Wrench, DollarSign, AlertTriangle, AlertCircle, Package, Baseline, Users } from "lucide-react";
import { toast } from "sonner";

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-cyan-600 flex items-center justify-center"><Waves className="h-5 w-5 text-white" /></div><div><h1 className="text-2xl font-bold">Waterfall Dashboard</h1><p className="text-sm text-muted-foreground">{d.project_name || ""}</p></div></div>
          <div className="flex gap-2"><Button variant="outline" onClick={initialize} className="gap-2"><Plus className="h-4 w-4" /> Initialize</Button><Button variant="outline" onClick={fetchDashboard} className="gap-2"><RefreshCw className="h-4 w-4" /> {pt("Refresh")}</Button></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Current Phase")}</p><p className="text-2xl font-bold">{d.current_phase?.name || "None"}</p>{d.current_phase && <Badge variant={d.current_phase.status === "in_progress" ? "default" : "secondary"}>{d.current_phase.status}</Badge>}</CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Overall Progress")}</p><p className="text-2xl font-bold">{d.overall_progress || 0}%</p><Progress value={d.overall_progress || 0} className="h-2 mt-2" /></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Phases")}</p><p className="text-2xl font-bold">{d.completed_phases || 0}/{d.total_phases || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Open Issues")}</p><p className="text-2xl font-bold text-red-500">{d.open_issues || 0}</p></CardContent></Card>
        </div>

        {d.phases?.length > 0 && (
          <Card><CardHeader className="pb-3"><CardTitle>{pt("Phase Progress")}</CardTitle></CardHeader><CardContent className="space-y-3">
            {d.phases.map((p: any) => (
              <div key={p.id} className="flex items-center gap-4"><span className="w-40 text-sm font-medium truncate">{p.name}</span><div className="flex-1"><Progress value={p.progress || 0} className="h-3" /></div><Badge variant={p.status === "completed" ? "default" : p.status === "in_progress" ? "secondary" : "outline"} className="w-24 justify-center text-xs">{p.status}</Badge><span className="text-sm w-10 text-right">{p.progress || 0}%</span></div>
            ))}
          </CardContent></Card>
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
            { label: pt("Budget"), path: "budget", icon: DollarSign },
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
