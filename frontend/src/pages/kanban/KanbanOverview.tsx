import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Loader2, RefreshCw, Layout, Plus, Columns, ListChecks, BarChart3, Ban, FileText, Users, Euro, TrendingUp, Zap, Sparkles, Trash2, Workflow, GraduationCap } from "lucide-react";
import { toast } from "sonner";
import MethodologyFlow, { FlowStep } from "@/components/MethodologyFlow";

const DEMO_ADMIN_ROLES = ["superadmin", "admin", "pm", "program_manager"];

// Board pipeline built from real columns. Progress per column = WIP
// utilisation (card_count / wip_limit) where a limit is set, else the
// column's share of all cards on the board.
const buildKanbanSteps = (columns: any[], totalCards: number): FlowStep[] =>
  [...columns].sort((a, b) => (a.order || 0) - (b.order || 0)).map((c) => {
    const count = c.card_count || 0;
    const status: FlowStep["status"] =
      c.is_done_column || c.column_type === "done" ? "done"
      : c.column_type === "in_progress" || c.column_type === "review" ? "active" : "todo";
    const progress = c.wip_limit ? Math.min(100, Math.round((count / c.wip_limit) * 100))
      : totalCards > 0 ? Math.round((count / totalCards) * 100) : 0;
    return {
      code: (c.name || "?").trim().slice(0, 4).toUpperCase(),
      label: c.name || "—",
      purpose: c.wip_limit ? `Cards in this column, limited to a WIP of ${c.wip_limit}.` : "Cards currently in this column.",
      progress,
      status,
      meta: c.wip_limit ? `${count} / WIP ${c.wip_limit}` : `${count} ${count === 1 ? "card" : "cards"}`,
      links: [{ label: "Board", slug: "board" }, { label: "WIP Limits", slug: "wip-limits" }],
      academyHref: "/academy/course/kanban-practitioner",
    };
  });

const KanbanOverview = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const canManageDemo = !!user && DEMO_ADMIN_ROLES.includes(user.role);
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchDashboard = async () => { try { const r = await fetch(`/api/v1/projects/${id}/kanban/dashboard/`, { headers }); if (r.ok) setDashboard(await r.json()); } catch (err) { console.error(err); } finally { setLoading(false); } };
  const initialize = async () => { try { const r = await fetch(`/api/v1/projects/${id}/kanban/board/initialize/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success(pt("Initialized")); fetchDashboard(); } else toast.error(pt("Initialize failed")); } catch { toast.error(pt("Initialize failed")); } };

  const [seeding, setSeeding] = useState(false);
  const [clearing, setClearing] = useState(false);
  const seedDemo = async () => {
    if (!confirm(pt("Fill all empty Kanban tabs with realistic demo data? Existing data will be preserved."))) return;
    setSeeding(true);
    try {
      const r = await fetch(`/api/v1/projects/${id}/kanban/seed-demo/`, { method: "POST", headers: jsonHeaders });
      if (r.ok) { const data = await r.json(); const counts = Object.entries(data.created || {}).filter(([, v]: any) => v > 0).map(([k, v]) => `${k}: ${v}`).join(', '); toast.success(counts ? `${pt("Demo data seeded")} — ${counts}` : pt("All tabs already had data")); fetchDashboard(); }
      else { toast.error(pt("Failed to seed demo data")); }
    } catch { toast.error(pt("Failed to seed demo data")); }
    finally { setSeeding(false); }
  };
  const clearDemo = async () => {
    if (!confirm(pt("Permanently delete ALL Kanban data for this project (cards, columns, policies)? This cannot be undone."))) return;
    setClearing(true);
    try {
      const r = await fetch(`/api/v1/projects/${id}/kanban/clear-demo/`, { method: "POST", headers: jsonHeaders });
      if (r.ok) { toast.success(pt("All Kanban data cleared")); fetchDashboard(); }
      else { toast.error(pt("Failed to clear data")); }
    } catch { toast.error(pt("Failed to clear data")); }
    finally { setClearing(false); }
  };

  useEffect(() => { fetchDashboard(); }, [id]);
  const nav = (path: string) => navigate(`/projects/${id}/kanban/${path}`);

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);
  const d = dashboard || {};

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><div className="h-10 w-10 rounded-lg bg-violet-600 flex items-center justify-center"><Layout className="h-5 w-5 text-white" /></div><div><h1 className="text-2xl font-bold">Kanban Dashboard</h1><p className="text-sm text-muted-foreground">{d.project_name || ""}</p></div></div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={initialize} className="gap-2"><Plus className="h-4 w-4" /> Initialize</Button>
            {canManageDemo && (
              <>
                <Button variant="outline" onClick={seedDemo} disabled={seeding} className="gap-2">{seeding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}{pt("Fill with demo data")}</Button>
                <Button variant="outline" onClick={clearDemo} disabled={clearing} className="gap-2 text-destructive hover:bg-destructive/10">{clearing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}{pt("Clear data")}</Button>
              </>
            )}
            <Button variant="outline" onClick={fetchDashboard} className="gap-2"><RefreshCw className="h-4 w-4" /> {pt("Refresh")}</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total Cards</p><p className="text-2xl font-bold">{d.total_cards || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">In Progress</p><p className="text-2xl font-bold text-blue-600">{d.in_progress || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Blocked</p><p className="text-2xl font-bold text-red-600">{d.blocked_count || 0}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Avg Lead Time</p><p className="text-2xl font-bold">{d.avg_lead_time ? `${Math.round(d.avg_lead_time)}d` : "—"}</p></CardContent></Card>
        </div>

        {d.columns?.length > 0 && (
          <Card><CardHeader className="pb-3 flex-row items-center justify-between space-y-0"><CardTitle className="flex items-center gap-2 text-base"><Workflow className="h-5 w-5 text-violet-600" /> {pt("Board Flow")}</CardTitle>
            <button type="button" onClick={() => navigate("/academy/course/kanban-practitioner")} className="inline-flex items-center gap-1.5 rounded-lg border border-violet-200 bg-violet-50 px-2.5 py-1 text-xs font-medium text-violet-700 transition-colors hover:bg-violet-100 dark:border-violet-900/50 dark:bg-violet-950/30 dark:text-violet-300" title={pt("Open the Kanban course in the Academy")}><GraduationCap className="h-3.5 w-3.5" /> {pt("Kanban course")}</button>
          </CardHeader><CardContent>
            <MethodologyFlow steps={buildKanbanSteps(d.columns, d.total_cards || 0)} accent="violet" onNavigate={nav} />
          </CardContent></Card>
        )}

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { label: "Board", path: "board", icon: Layout },
            { label: pt("Work Items"), path: "work-items", icon: ListChecks },
            { label: "Board Config", path: "board-configuration", icon: Columns },
            { label: "WIP Limits", path: "wip-limits", icon: Zap },
            { label: pt("Blocked Items"), path: "blocked", icon: Ban },
            { label: pt("Flow Metrics"), path: "metrics", icon: BarChart3 },
            { label: "CFD", path: "cfd", icon: TrendingUp },
            { label: pt("Work Policies"), path: "work-policies", icon: FileText },
            { label: pt("Team"), path: "team", icon: Users },
            { label: pt("Budget"), path: "budget", icon: Euro },
            { label: "Continuous Improvement", path: "improvement", icon: TrendingUp },
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
