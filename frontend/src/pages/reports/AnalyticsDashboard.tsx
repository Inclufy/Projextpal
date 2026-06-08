import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart,
  ResponsiveContainer, Tooltip as RTooltip, XAxis, YAxis,
} from "recharts";
import {
  DndContext, PointerSensor, closestCenter, useSensor, useSensors,
} from "@dnd-kit/core";
import {
  SortableContext, arrayMove, rectSortingStrategy, useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  Loader2, LayoutDashboard, Settings2, Download, Plus, GripVertical, Eye, EyeOff,
  TrendingUp, ShieldAlert, FolderKanban, CheckCircle2, AlertTriangle, Euro, Save, Trash2,
  FileSpreadsheet, FileText, Users,
} from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

type Scope = "org" | "program" | "project";
interface LayoutItem { id: string; hidden?: boolean; metrics?: string[] }
interface SavedDash {
  id?: number; name: string; description?: string; scope: Scope; refId: string; days: number;
  layout: LayoutItem[]; audience?: string; shared?: boolean; created_by_name?: string | null;
}

// Catalogue of composable KPI metrics. Each maps to a key in the analytics
// `kpis` payload; users pick which ones appear on the KPI Tiles widget.
interface MetricDef { id: string; label: string; icon: any; accent: string; soft: string; fmt: (k: any) => any }
const METRIC_CATALOG: MetricDef[] = [
  { id: "projects", label: "Projects", icon: FolderKanban, accent: "text-sky-600", soft: "bg-sky-50", fmt: (k) => k.projects ?? 0 },
  { id: "completion_pct", label: "Completion %", icon: CheckCircle2, accent: "text-green-600", soft: "bg-green-50", fmt: (k) => `${k.completion_pct ?? 0}%` },
  { id: "tasks_total", label: "Total tasks", icon: TrendingUp, accent: "text-violet-600", soft: "bg-violet-50", fmt: (k) => k.tasks_total ?? 0 },
  { id: "tasks_done", label: "Tasks done", icon: TrendingUp, accent: "text-violet-600", soft: "bg-violet-50", fmt: (k) => `${k.tasks_done ?? 0}/${k.tasks_total ?? 0}` },
  { id: "tasks_in_progress", label: "In progress", icon: TrendingUp, accent: "text-blue-600", soft: "bg-blue-50", fmt: (k) => k.tasks_in_progress ?? 0 },
  { id: "tasks_todo", label: "To do", icon: TrendingUp, accent: "text-slate-600", soft: "bg-slate-50", fmt: (k) => k.tasks_todo ?? 0 },
  { id: "tasks_blocked", label: "Blocked", icon: AlertTriangle, accent: "text-rose-600", soft: "bg-rose-50", fmt: (k) => k.tasks_blocked ?? 0 },
  { id: "tasks_overdue", label: "Overdue tasks", icon: AlertTriangle, accent: "text-amber-600", soft: "bg-amber-50", fmt: (k) => k.tasks_overdue ?? 0 },
  { id: "open_risks", label: "Open risks", icon: ShieldAlert, accent: "text-red-600", soft: "bg-red-50", fmt: (k) => k.open_risks ?? 0 },
  { id: "risk_high", label: "High/critical risks", icon: ShieldAlert, accent: "text-red-700", soft: "bg-red-50", fmt: (k) => k.risk_high ?? 0 },
  { id: "open_issues", label: "Open issues", icon: AlertTriangle, accent: "text-orange-600", soft: "bg-orange-50", fmt: (k) => k.open_issues ?? 0 },
  { id: "milestones_done", label: "Milestones", icon: CheckCircle2, accent: "text-teal-600", soft: "bg-teal-50", fmt: (k) => `${k.milestones_done ?? 0}/${k.milestones_total ?? 0}` },
  { id: "milestones_overdue", label: "Milestones overdue", icon: AlertTriangle, accent: "text-amber-700", soft: "bg-amber-50", fmt: (k) => k.milestones_overdue ?? 0 },
  { id: "at_risk_projects", label: "At-risk projects", icon: AlertTriangle, accent: "text-rose-600", soft: "bg-rose-50", fmt: (k) => k.at_risk_projects ?? 0 },
  { id: "budget", label: "Budget", icon: Euro, accent: "text-emerald-600", soft: "bg-emerald-50", fmt: (k) => `€${Number(k.budget || 0).toLocaleString()}` },
];
const METRIC_BY_ID: Record<string, MetricDef> = Object.fromEntries(METRIC_CATALOG.map((m) => [m.id, m]));
const DEFAULT_KPI_METRICS = ["projects", "completion_pct", "tasks_done", "tasks_overdue", "open_risks", "open_issues", "milestones_done", "budget"];

const AUDIENCES = [
  { value: "private", label: "Private (only me)" },
  { value: "management", label: "Management" },
  { value: "tenant", label: "Whole organisation" },
];

const PIE = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444", "#14b8a6", "#94a3b8"];
// Semantic colours for risk levels so High reads red, Medium amber, Low green.
const RISK_COLOR: Record<string, string> = {
  High: "#ef4444", Medium: "#f59e0b", Low: "#22c55e", Unknown: "#94a3b8",
};

// Clean in-slice percentage label (no overlapping edge labels / leader lines).
const renderPct = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
  if (!percent || percent < 0.06) return null;
  const RAD = Math.PI / 180;
  const r = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + r * Math.cos(-midAngle * RAD);
  const y = cy + r * Math.sin(-midAngle * RAD);
  return (
    <text x={x} y={y} fill="#fff" textAnchor="middle" dominantBaseline="central" fontSize={12} fontWeight={700}>
      {`${Math.round(percent * 100)}%`}
    </text>
  );
};
// Legend that shows "name (value)" so exact counts are readable without hover.
const legendWithValue = (data: any[]) => (value: string) => {
  const item = data.find((d) => d.name === value);
  return `${value}${item ? ` (${item.value})` : ""}`;
};

const WIDGETS = [
  { id: "kpis", title: "KPI Tiles" },
  { id: "trend", title: "Completion Trend" },
  { id: "status", title: "Task Status Breakdown" },
  { id: "risks", title: "Risk Breakdown" },
  { id: "top", title: "Top Projects" },
] as const;

const DEFAULT_LAYOUT: LayoutItem[] = WIDGETS.map((w) => ({ id: w.id, hidden: false }));

// Responsive column spans on a 6-col grid so wide screens are filled densely:
// KPIs full row, trend wide + a pie beside it, then the other pie + top projects.
const SPAN: Record<string, string> = {
  kpis: "col-span-1 lg:col-span-6",
  trend: "col-span-1 lg:col-span-6 xl:col-span-4",
  status: "col-span-1 lg:col-span-3 xl:col-span-2",
  risks: "col-span-1 lg:col-span-3 xl:col-span-2",
  top: "col-span-1 lg:col-span-6 xl:col-span-4",
};

// --- export helpers -------------------------------------------------------
const toCsv = (rows: Record<string, any>[]): string => {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const esc = (v: any) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [headers.join(","), ...rows.map((r) => headers.map((h) => esc(r[h])).join(","))].join("\n");
};
const download = (name: string, content: BlobPart, type: string) => {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
};

function SortableWidget({ id, customizing, hidden, onToggle, title, onCsv, onPdf, children }: {
  id: string; customizing: boolean; hidden?: boolean; onToggle: () => void; title: string;
  onCsv: () => void; onPdf: () => void; children: React.ReactNode;
}) {
  const { pt } = usePageTranslations();
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: !customizing });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
  if (hidden && !customizing) return null;
  return (
    <div ref={setNodeRef} style={style} className={hidden ? "opacity-50" : ""}>
      <Card id={`widget-${id}`} className={`h-full rounded-2xl border shadow-sm ${customizing ? "ring-2 ring-purple-300" : ""}`}>
        <div className="flex items-center justify-between px-5 pt-4 pb-1">
          <span className={`flex items-center gap-1.5 font-semibold text-foreground ${customizing ? "cursor-grab" : ""}`} {...(customizing ? { ...attributes, ...listeners } : {})}>
            {customizing && <GripVertical className="h-4 w-4 text-muted-foreground" />} {title}
          </span>
          <div className="flex items-center gap-0.5">
            {customizing ? (
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggle}>
                {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </Button>
            ) : (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="h-6 w-6"><Download className="h-3.5 w-3.5" /></Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={onCsv}><FileSpreadsheet className="h-4 w-4 mr-2" />{pt("Export CSV")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={onPdf}><FileText className="h-4 w-4 mr-2" />{pt("Export PDF")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
        {children}
      </Card>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { pt } = usePageTranslations();
  const token = localStorage.getItem("access_token");
  const headers = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  // Remember the chosen scope across reloads/navigation so a selected project
  // or programme stays put (e.g. for a demo) instead of resetting to org.
  const [scope, setScope] = useState<Scope>(() => (localStorage.getItem("analytics_scope") as Scope) || "org");
  const [refId, setRefId] = useState<string>(() => localStorage.getItem("analytics_refId") || "");
  const [days, setDays] = useState(() => Number(localStorage.getItem("analytics_days")) || 30);
  const [programs, setPrograms] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [customizing, setCustomizing] = useState(false);

  const [saved, setSaved] = useState<SavedDash[]>([]);
  const [activeDash, setActiveDash] = useState<string>("");
  const [layout, setLayout] = useState<LayoutItem[]>(DEFAULT_LAYOUT);
  const [newName, setNewName] = useState("");
  const [audience, setAudience] = useState<string>("private");
  const [description, setDescription] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  const mapDash = (d: any): SavedDash => ({
    id: d.id, name: d.name, scope: d.scope, refId: d.ref_id || "", days: d.days,
    layout: Array.isArray(d.layout) && d.layout.length ? d.layout : DEFAULT_LAYOUT,
    description: d.description, audience: d.audience || (d.shared ? "tenant" : "private"),
    shared: d.shared, created_by_name: d.created_by_name,
  });

  const fetchSaved = async () => {
    try {
      const r = await fetch("/api/v1/projects/analytics-dashboards/", { headers });
      if (r.ok) { const d = await r.json(); setSaved((Array.isArray(d) ? d : d.results || []).map(mapDash)); }
    } catch { /* ignore */ }
  };

  useEffect(() => {
    (async () => {
      try {
        const [pr, pj] = await Promise.all([
          fetch("/api/v1/programs/", { headers }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
          fetch("/api/v1/projects/", { headers }).then((r) => (r.ok ? r.json() : [])).catch(() => []),
        ]);
        setPrograms(Array.isArray(pr) ? pr : pr.results || []);
        setProjects(Array.isArray(pj) ? pj : pj.results || []);
      } catch { /* ignore */ }
    })();
    fetchSaved();
  }, []);

  const fetchOverview = async () => {
    setLoading(true);
    try {
      const qs = new URLSearchParams({ scope, days: String(days) });
      if (scope !== "org" && refId) qs.set("id", refId);
      const r = await fetch(`/api/v1/projects/analytics/overview/?${qs}`, { headers });
      setData(r.ok ? await r.json() : null);
    } catch { setData(null); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (scope === "org" || refId) fetchOverview(); else setLoading(false); }, [scope, refId, days]);
  useEffect(() => {
    localStorage.setItem("analytics_scope", scope);
    localStorage.setItem("analytics_refId", refId);
    localStorage.setItem("analytics_days", String(days));
  }, [scope, refId, days]);

  const kpis = data?.kpis || {};
  const orderedVisible = useMemo(
    () => layout.filter((l) => customizing || !l.hidden),
    [layout, customizing],
  );

  const onDragEnd = (e: any) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setLayout((prev) => arrayMove(prev, prev.findIndex((l) => l.id === active.id), prev.findIndex((l) => l.id === over.id)));
  };
  const toggleHidden = (id: string) =>
    setLayout((prev) => prev.map((l) => (l.id === id ? { ...l, hidden: !l.hidden } : l)));

  // Which KPI metrics the user has chosen for the KPI Tiles widget.
  const kpiMetricIds: string[] = useMemo(() => {
    const entry = layout.find((l) => l.id === "kpis");
    return entry?.metrics?.length ? entry.metrics : DEFAULT_KPI_METRICS;
  }, [layout]);
  const toggleMetric = (id: string) =>
    setLayout((prev) => prev.map((l) => {
      if (l.id !== "kpis") return l;
      const cur = l.metrics?.length ? l.metrics : DEFAULT_KPI_METRICS;
      const next = cur.includes(id) ? cur.filter((m) => m !== id) : [...cur, id];
      return { ...l, metrics: next.length ? next : DEFAULT_KPI_METRICS };
    }));

  const saveDashboard = async () => {
    const name = (newName || activeDash || "").trim();
    if (!name) { toast.error(pt("Give the dashboard a name")); return; }
    const existing = saved.find((d) => d.name === name);
    const body = { name, description, scope, ref_id: scope === "org" ? "" : refId, days, layout, audience };
    try {
      const r = await fetch(
        existing?.id ? `/api/v1/projects/analytics-dashboards/${existing.id}/` : "/api/v1/projects/analytics-dashboards/",
        { method: existing?.id ? "PUT" : "POST", headers: jsonHeaders, body: JSON.stringify(body) },
      );
      if (!r.ok) { const e = await r.json().catch(() => ({})); toast.error(e.detail || pt("Could not save")); return; }
      await fetchSaved();
      setActiveDash(name); setNewName(""); setCustomizing(false);
      toast.success(`${pt("Saved dashboard")}: ${name}`);
    } catch { toast.error(pt("Could not save")); }
  };
  const loadDashboard = (name: string) => {
    const d = saved.find((s) => s.name === name);
    if (!d) return;
    setActiveDash(name); setScope(d.scope); setRefId(d.refId); setDays(d.days);
    setAudience(d.audience || (d.shared ? "tenant" : "private"));
    setDescription(d.description || "");
    setLayout(d.layout?.length ? d.layout : DEFAULT_LAYOUT);
  };
  const deleteDashboard = async () => {
    const d = saved.find((s) => s.name === activeDash);
    if (!d?.id) { setActiveDash(""); setLayout(DEFAULT_LAYOUT); return; }
    try {
      const r = await fetch(`/api/v1/projects/analytics-dashboards/${d.id}/`, { method: "DELETE", headers });
      if (r.ok || r.status === 204) {
        await fetchSaved(); setActiveDash(""); setLayout(DEFAULT_LAYOUT);
        toast.success(pt("Dashboard deleted"));
      } else { toast.error(pt("Could not delete (only the author or an admin can).")); }
    } catch { toast.error(pt("Could not delete")); }
  };

  // --- per-widget export --------------------------------------------------
  const widgetRows = (id: string): Record<string, any>[] => {
    switch (id) {
      case "kpis": return kpiMetricIds.map((id) => ({ metric: METRIC_BY_ID[id]?.label || id, value: METRIC_BY_ID[id] ? METRIC_BY_ID[id].fmt(kpis) : kpis[id] }));
      case "trend": return data?.completion_trend || [];
      case "status": return data?.status_breakdown || [];
      case "risks": return data?.risk_breakdown || [];
      case "top": return data?.top_projects || [];
      default: return [];
    }
  };
  const exportCsv = (id: string) => {
    const rows = widgetRows(id);
    if (!rows.length) { toast.error(pt("Nothing to export yet")); return; }
    download(`${id}-${scope}-${days}d.csv`, toCsv(rows), "text/csv;charset=utf-8");
  };
  const exportPdf = async (id: string) => {
    const el = document.getElementById(`widget-${id}`);
    if (!el) return;
    try {
      const [{ default: html2canvas }, { default: jsPDF }] = await Promise.all([
        import("html2canvas"), import("jspdf"),
      ]);
      const canvas = await html2canvas(el, { scale: 2, backgroundColor: "#ffffff" });
      const img = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width >= canvas.height ? "landscape" : "portrait",
        unit: "px", format: [canvas.width, canvas.height],
      });
      pdf.addImage(img, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save(`${id}-${scope}-${days}d.pdf`);
    } catch { toast.error(pt("PDF export failed")); }
  };

  const kpiTile = (icon: any, label: string, value: any, accent = "text-purple-600", soft = "bg-purple-50") => {
    const Icon = icon;
    return (
      <div className="rounded-2xl border bg-card p-5 hover:shadow-sm transition-shadow">
        <div className={`h-11 w-11 rounded-xl ${soft} flex items-center justify-center mb-3`}>
          <Icon className={`h-5 w-5 ${accent}`} />
        </div>
        <div className="text-3xl font-bold leading-none">{value ?? 0}</div>
        <div className="text-sm text-muted-foreground mt-1.5">{label}</div>
      </div>
    );
  };

  const renderWidget = (id: string) => {
    switch (id) {
      case "kpis":
        return (
          <CardContent className="px-5 pb-5 pt-2 space-y-4">
            {customizing && (
              <div className="rounded-xl border border-dashed border-purple-300 p-3">
                <div className="text-xs font-medium text-muted-foreground mb-2">{pt("Pick which KPIs to show")}</div>
                <div className="flex flex-wrap gap-1.5">
                  {METRIC_CATALOG.map((m) => {
                    const on = kpiMetricIds.includes(m.id);
                    return (
                      <button key={m.id} type="button" onClick={() => toggleMetric(m.id)}
                        className={`text-xs rounded-full px-2.5 py-1 border transition ${on ? "bg-purple-600 text-white border-purple-600" : "bg-background hover:bg-muted text-muted-foreground border-input"}`}>
                        {on ? "✓ " : "+ "}{pt(m.label)}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {kpiMetricIds.map((id) => {
                const m = METRIC_BY_ID[id];
                if (!m) return null;
                return <div key={id}>{kpiTile(m.icon, pt(m.label), m.fmt(kpis), m.accent, m.soft)}</div>;
              })}
            </div>
          </CardContent>
        );
      case "trend":
        return (
          <>
            <CardContent className="h-80">
              {(data?.completion_trend || []).length < 2 ? (
                <p className="text-sm text-muted-foreground pt-8 text-center">{pt("Trends appear after at least two status snapshots.")}</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={data.completion_trend}>
                    <defs>
                      <linearGradient id="aTrend" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#6366f1" stopOpacity={0.4} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="date" fontSize={11} /><YAxis fontSize={11} />
                    <RTooltip />
                    <Area type="monotone" dataKey="completion_pct" stroke="#6366f1" fill="url(#aTrend)" name={pt("Completion %")} />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </>
        );
      case "status":
        return (
          <>
            <CardContent className="h-80">
              {(data?.status_breakdown || []).length === 0 ? (
                <p className="text-sm text-muted-foreground pt-8 text-center">{pt("No tasks yet.")}</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.status_breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%"
                      innerRadius={55} outerRadius={100} paddingAngle={2} labelLine={false} label={renderPct}>
                      {data.status_breakdown.map((_: any, i: number) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                    </Pie>
                    <Legend formatter={legendWithValue(data.status_breakdown)} /><RTooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </>
        );
      case "risks":
        return (
          <>
            <CardContent className="h-80">
              {(data?.risk_breakdown || []).length === 0 ? (
                <p className="text-sm text-muted-foreground pt-8 text-center">{pt("No open risks.")}</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.risk_breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%"
                      innerRadius={55} outerRadius={100} paddingAngle={2} labelLine={false} label={renderPct}>
                      {data.risk_breakdown.map((r: any, i: number) => (
                        <Cell key={i} fill={RISK_COLOR[r.name] || PIE[(i + 3) % PIE.length]} />
                      ))}
                    </Pie>
                    <Legend formatter={legendWithValue(data.risk_breakdown)} /><RTooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </>
        );
      case "top":
        return (
          <>
            <CardContent className="h-80">
              {(data?.top_projects || []).length === 0 ? (
                <p className="text-sm text-muted-foreground pt-8 text-center">{pt("Select an org or programme scope to compare projects.")}</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data.top_projects} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis type="number" fontSize={11} domain={[0, 100]} />
                    <YAxis type="category" dataKey="name" fontSize={10} width={120} />
                    <RTooltip />
                    <Bar dataKey="completion_pct" name={pt("Completion %")} fill="#8b5cf6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </>
        );
      default: return null;
    }
  };

  const widgetTitle = (id: string) => pt(WIDGETS.find((w) => w.id === id)?.title || id);

  return (
    <div className="space-y-5">
      {/* Controls */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <Select value={scope} onValueChange={(v) => { setScope(v as Scope); setRefId(""); }}>
            <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="org">{pt("Whole organisation")}</SelectItem>
              <SelectItem value="program">{pt("Programme")}</SelectItem>
              <SelectItem value="project">{pt("Project")}</SelectItem>
            </SelectContent>
          </Select>
          {scope === "program" && (
            <Select value={refId} onValueChange={setRefId}>
              <SelectTrigger className="w-56"><SelectValue placeholder={pt("Select programme")} /></SelectTrigger>
              <SelectContent>{programs.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
          {scope === "project" && (
            <Select value={refId} onValueChange={setRefId}>
              <SelectTrigger className="w-56"><SelectValue placeholder={pt("Select project")} /></SelectTrigger>
              <SelectContent>{projects.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
          <div className="flex bg-muted rounded-lg p-1">
            {[7, 30, 90].map((d) => (
              <Button key={d} size="sm" variant={days === d ? "default" : "ghost"} className="h-7" onClick={() => setDays(d)}>
                {d} {pt("days")}
              </Button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {saved.length > 0 && (
            <Select value={activeDash} onValueChange={loadDashboard}>
              <SelectTrigger className="w-48"><SelectValue placeholder={pt("Saved dashboards")} /></SelectTrigger>
              <SelectContent>
                {saved.map((d) => (
                  <SelectItem key={d.name} value={d.name}>
                    {d.name}{d.created_by_name ? ` · ${d.created_by_name}` : ""}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
          <Button variant={customizing ? "default" : "outline"} size="sm" className="gap-1" onClick={() => setCustomizing((c) => !c)}>
            <Settings2 className="h-4 w-4" /> {customizing ? pt("Done") : pt("Customize")}
          </Button>
        </div>
      </div>

      {/* Customize bar — name + shared + save + delete (drag & drop the widgets below) */}
      {customizing && (
        <Card className="border-purple-200 bg-purple-50/40">
          <CardContent className="p-3 flex items-center gap-2 flex-wrap text-sm">
            <Plus className="h-4 w-4 text-purple-600" />
            <span className="text-muted-foreground">{pt("Add/remove KPIs, drag widgets to reorder, toggle the eye to show/hide — then name it, choose who can see it, and save.")}</span>
            <div className="flex items-center gap-2 ml-auto flex-wrap">
              <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={pt("Dashboard name")} className="h-8 w-40" />
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder={pt("Description (optional)")} className="h-8 w-48" />
              <div className="flex items-center gap-1 text-xs text-muted-foreground">
                <Users className="h-3.5 w-3.5" />
                <Select value={audience} onValueChange={setAudience}>
                  <SelectTrigger className="h-8 w-44"><SelectValue /></SelectTrigger>
                  <SelectContent>{AUDIENCES.map((a) => <SelectItem key={a.value} value={a.value}>{pt(a.label)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <Button size="sm" className="h-8 gap-1" onClick={saveDashboard}><Save className="h-4 w-4" />{pt("Save")}</Button>
              {activeDash && <Button size="sm" variant="outline" className="h-8 gap-1 text-destructive" onClick={deleteDashboard}><Trash2 className="h-4 w-4" />{pt("Delete")}</Button>}
            </div>
          </CardContent>
        </Card>
      )}

      {loading ? (
        <div className="flex items-center justify-center py-24"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div>
      ) : (
        <>
          {data?.kpis?.rag && (
            <div className="flex items-center gap-2">
              <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">{pt("Overall health")}:</span>
              <Badge className={
                data.kpis.rag === "green" ? "bg-green-100 text-green-700"
                  : data.kpis.rag === "amber" ? "bg-amber-100 text-amber-700"
                  : "bg-red-100 text-red-700"
              }>{String(data.kpis.rag).toUpperCase()}</Badge>
            </div>
          )}
          <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
            <SortableContext items={orderedVisible.map((l) => l.id)} strategy={rectSortingStrategy}>
              <div className="grid grid-cols-1 lg:grid-cols-6 gap-5">
                {orderedVisible.map((l) => (
                  <div key={l.id} className={SPAN[l.id] || "col-span-1 lg:col-span-3"}>
                    <SortableWidget
                      id={l.id} customizing={customizing} hidden={l.hidden}
                      onToggle={() => toggleHidden(l.id)} title={widgetTitle(l.id)}
                      onCsv={() => exportCsv(l.id)} onPdf={() => exportPdf(l.id)}
                    >
                      {renderWidget(l.id)}
                    </SortableWidget>
                  </div>
                ))}
              </div>
            </SortableContext>
          </DndContext>
        </>
      )}
    </div>
  );
}
