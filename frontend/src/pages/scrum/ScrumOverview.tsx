import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Loader2, RefreshCw, Zap, Target, Users, BarChart3, ListChecks, ChevronRight, Sparkles } from "lucide-react";
import { toast } from "sonner";

const ScrumOverview = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

  const fetchDashboard = async () => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/scrum/dashboard/`, { headers });
      if (r.ok) setDashboard(await r.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchDashboard(); }, [id]);

  const [seeding, setSeeding] = useState(false);
  const seedDemo = async () => {
    if (!confirm(pt("Fill all empty Scrum tabs with realistic demo data? Existing data will be preserved."))) return;
    setSeeding(true);
    try {
      const r = await fetch(`/api/v1/projects/${id}/scrum/seed-demo/`, { method: "POST", headers: { ...headers, "Content-Type": "application/json" } });
      if (r.ok) {
        const data = await r.json();
        const counts = Object.entries(data.created || {}).filter(([, v]: any) => v > 0).map(([k, v]) => `${k}: ${v}`).join(', ');
        toast.success(counts ? `${pt("Demo data seeded")} — ${counts}` : pt("All tabs already had data"));
        fetchDashboard();
      } else { toast.error(pt("Failed to seed demo data")); }
    } catch { toast.error(pt("Failed to seed demo data")); }
    finally { setSeeding(false); }
  };

  const nav = (path: string) => navigate(`/projects/${id}/scrum/${path}`);

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  const d = dashboard || {};

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-lg bg-blue-600 flex items-center justify-center"><Zap className="h-5 w-5 text-white" /></div>
            <div><h1 className="text-2xl font-bold">Scrum Dashboard</h1><p className="text-sm text-muted-foreground">{d.project_name || ""}</p></div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={seedDemo} disabled={seeding} className="gap-2">
              {seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {pt("Fill with demo data")}
            </Button>
            <Button variant="outline" onClick={fetchDashboard} className="gap-2"><RefreshCw className="h-4 w-4" /> {pt("Refresh")}</Button>
          </div>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Active Sprint")}</p><p className="text-2xl font-bold">{d.active_sprint?.name || "None"}</p>{d.active_sprint && <p className="text-xs text-muted-foreground">{d.active_sprint.start_date} → {d.active_sprint.end_date}</p>}</CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Sprint Progress")}</p><p className="text-2xl font-bold">{d.active_sprint?.progress || 0}%</p><Progress value={d.active_sprint?.progress || 0} className="h-2 mt-2" /></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Backlog Items")}</p><p className="text-2xl font-bold">{d.backlog_count || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Velocity")}</p><p className="text-2xl font-bold">{d.average_velocity || 0}</p><p className="text-xs text-muted-foreground">pts/sprint</p></CardContent></Card>
        </div>

        {/* Active Sprint Items */}
        {d.active_sprint?.items?.length > 0 && (
          <Card>
            <CardHeader className="pb-3"><CardTitle>{pt("Sprint Items")}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {d.active_sprint.items.slice(0, 8).map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={item.item_type === "story" ? "default" : item.item_type === "bug" ? "destructive" : "secondary"} className="text-xs">{item.item_type}</Badge>
                    <span className="font-medium text-sm">{item.title}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.story_points && <Badge variant="outline" className="text-xs">{item.story_points} pts</Badge>}
                    <Badge variant="outline" className="text-xs">{item.status}</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Quick Navigation */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: pt("Backlog"), path: "backlog", icon: ListChecks },
            { label: pt("Sprint Board"), path: "sprint-board", icon: Target },
            { label: pt("Daily Standup"), path: "daily-standup", icon: Users },
            { label: pt("Velocity"), path: "velocity", icon: BarChart3 },
            { label: pt("Sprint Planning"), path: "sprint-planning", icon: Target },
            { label: pt("Sprint Review"), path: "sprint-review", icon: ChevronRight },
            { label: pt("Retrospective"), path: "retrospective", icon: RefreshCw },
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

export default ScrumOverview;
