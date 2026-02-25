import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Loader2, RefreshCw, Layout, Plus, Columns, ListChecks, BarChart3, Ban, FileText, Users, DollarSign, TrendingUp, Zap } from "lucide-react";
import { toast } from "sonner";

const KanbanOverview = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchDashboard = async () => { try { const r = await fetch(`/api/v1/projects/${id}/kanban/dashboard/`, { headers }); if (r.ok) setDashboard(await r.json()); } catch (err) { console.error(err); } finally { setLoading(false); } };
  const initialize = async () => { try { const r = await fetch(`/api/v1/projects/${id}/kanban/board/initialize/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success(pt("Initialized")); fetchDashboard(); } else toast.error(pt("Initialize failed")); } catch { toast.error(pt("Initialize failed")); } };

  useEffect(() => { fetchDashboard(); }, [id]);
  const nav = (path: string) => navigate(`/projects/${id}/kanban/${path}`);

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);
  const d = dashboard || {};

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-violet-600 flex items-center justify-center"><Layout className="h-5 w-5 text-white" /></div><div><h1 className="text-2xl font-bold">Kanban Dashboard</h1><p className="text-sm text-muted-foreground">{d.project_name || ""}</p></div></div>
          <div className="flex gap-2"><Button variant="outline" onClick={initialize} className="gap-2"><Plus className="h-4 w-4" /> Initialize</Button><Button variant="outline" onClick={fetchDashboard} className="gap-2"><RefreshCw className="h-4 w-4" /> {pt("Refresh")}</Button></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Cards</p><p className="text-2xl font-bold">{d.total_cards || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">In Progress</p><p className="text-2xl font-bold text-blue-600">{d.in_progress || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Blocked</p><p className="text-2xl font-bold text-red-600">{d.blocked_count || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Avg Lead Time</p><p className="text-2xl font-bold">{d.avg_lead_time ? `${Math.round(d.avg_lead_time)}d` : "—"}</p></CardContent></Card>
        </div>

        {d.columns?.length > 0 && (
          <Card><CardHeader className="pb-3"><CardTitle>Column Distribution</CardTitle></CardHeader><CardContent className="space-y-3">
            {d.columns.map((c: any) => (
              <div key={c.id || c.name} className="flex items-center gap-4"><span className="w-32 text-sm font-medium truncate">{c.name}</span><div className="flex-1"><Progress value={d.total_cards > 0 ? (c.card_count / d.total_cards) * 100 : 0} className="h-3" /></div><span className="text-sm w-8 text-right">{c.card_count || 0}</span>{c.wip_limit && <Badge variant="outline" className="text-xs">WIP: {c.wip_limit}</Badge>}</div>
            ))}
          </CardContent></Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Board", path: "board", icon: Layout },
            { label: pt("Work Items"), path: "work-items", icon: ListChecks },
            { label: "Board Config", path: "board-configuration", icon: Columns },
            { label: "WIP Limits", path: "wip-limits", icon: Zap },
            { label: pt("Blocked Items"), path: "blocked-items", icon: Ban },
            { label: pt("Flow Metrics"), path: "flow-metrics", icon: BarChart3 },
            { label: "CFD", path: "cfd", icon: TrendingUp },
            { label: pt("Work Policies"), path: "work-policies", icon: FileText },
            { label: pt("Team"), path: "team", icon: Users },
            { label: pt("Budget"), path: "budget", icon: DollarSign },
            { label: "Continuous Improvement", path: "continuous-improvement", icon: TrendingUp },
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

export default KanbanOverview;
