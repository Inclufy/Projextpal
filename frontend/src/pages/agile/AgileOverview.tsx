import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Loader2, RefreshCw, Zap, Target, Users, BarChart3, ListChecks, Eye, RotateCcw, Rocket, Plus } from "lucide-react";
import { toast } from "sonner";

const AgileOverview = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchDashboard = async () => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/agile/dashboard/`, { headers });
      if (r.ok) setDashboard(await r.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const initialize = async () => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/agile/initialize/`, { method: "POST", headers: jsonHeaders });
      if (r.ok) { toast.success("Agile project geïnitialiseerd"); fetchDashboard(); }
      else toast.error("Initialiseren mislukt");
    } catch { toast.error("Initialiseren mislukt"); }
  };

  useEffect(() => { fetchDashboard(); }, [id]);
  const nav = (path: string) => navigate(`/projects/${id}/agile/${path}`);

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  const d = dashboard || {};

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-emerald-600 flex items-center justify-center"><Zap className="h-5 w-5 text-white" /></div>
            <div><h1 className="text-2xl font-bold">Agile Dashboard</h1><p className="text-sm text-muted-foreground">{d.project_name || ""}</p></div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={initialize} className="gap-2"><Plus className="h-4 w-4" /> Initialize</Button>
            <Button variant="outline" onClick={fetchDashboard} className="gap-2"><RefreshCw className="h-4 w-4" /> {pt("Refresh")}</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Active Iteration")}</p><p className="text-2xl font-bold">{d.current_iteration?.name || "None"}</p>{d.current_iteration && <Progress value={d.current_iteration.progress || 0} className="h-2 mt-2" />}</CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Backlog Items")}</p><p className="text-2xl font-bold">{d.total_backlog_items || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Team Members")}</p><p className="text-2xl font-bold">{d.team_size || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Story Points")}</p><p className="text-2xl font-bold">{d.total_story_points || 0}</p></CardContent></Card>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: pt("Backlog"), path: "backlog", icon: ListChecks },
            { label: pt("Iteration Board"), path: "iteration-board", icon: Target },
            { label: pt("Product Vision"), path: "product-vision", icon: Eye },
            { label: pt("User Personas"), path: "user-personas", icon: Users },
            { label: pt("Daily Progress"), path: "daily-progress", icon: BarChart3 },
            { label: pt("Release Planning"), path: "release-planning", icon: Rocket },
            { label: pt("Retrospective"), path: "retrospective", icon: RotateCcw },
            { label: pt("Definition of Done"), path: "definition-of-done", icon: ListChecks },
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

export default AgileOverview;
