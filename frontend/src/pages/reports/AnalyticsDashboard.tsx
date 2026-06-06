import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
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
} from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

type Scope = "org" | "program" | "project";
interface LayoutItem { id: string; hidden?: boolean }
interface SavedDash { name: string; scope: Scope; refId: string; days: number; layout: LayoutItem[] }

const PIE = ["#22c55e", "#3b82f6", "#a855f7", "#f59e0b", "#ef4444", "#14b8a6", "#94a3b8"];
const LS_KEY = "ppxt-analytics-dashboards-v1";

const WIDGETS = [
  { id: "kpis", title: "KPI Tiles" },
  { id: "trend", title: "Completion Trend" },
  { id: "status", title: "Task Status Breakdown" },
  { id: "risks", title: "Risk Breakdown" },
  { id: "top", title: "Top Projects" },
] as const;

const DEFAULT_LAYOUT: LayoutItem[] = WIDGETS.map((w) => ({ id: w.id, hidden: false }));

const loadSaved = (): SavedDash[] => {
  try { return JSON.parse(localStorage.getItem(LS_KEY) || "[]"); } catch { return []; }
};
const persistSaved = (d: SavedDash[]) => localStorage.setItem(LS_KEY, JSON.stringify(d));

function SortableWidget({ id, customizing, hidden, onToggle, title, children }: {
  id: string; customizing: boolean; hidden?: boolean;
  onToggle: () => void; title: string; children: React.ReactNode;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id, disabled: !customizing });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.6 : 1 };
  if (hidden && !customizing) return null;
  return (
    <div ref={setNodeRef} style={style} className={hidden ? "opacity-50" : ""}>
      <Card className={`h-full ${customizing ? "ring-1 ring-purple-300" : ""}`}>
        {customizing && (
          <div className="flex items-center justify-between px-3 py-1.5 border-b bg-muted/40 rounded-t-lg">
            <span className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground cursor-grab" {...attributes} {...listeners}>
              <GripVertical className="h-3.5 w-3.5" /> {title}
            </span>
            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={onToggle}>
              {hidden ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
            </Button>
          </div>
        )}
        {children}
      </Card>
    </div>
  );
}

export default function AnalyticsDashboard() {
  const { pt } = usePageTranslations();
  const token = localStorage.getItem("access_token");
  const headers = { Authorization: `Bearer ${token}` };

  const [scope, setScope] = useState<Scope>("org");
  const [refId, setRefId] = useState<string>("");
  const [days, setDays] = useState(30);
  const [programs, setPrograms] = useState<any[]>([]);
  const [projects, setProjects] = useState<any[]>([]);
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [customizing, setCustomizing] = useState(false);

  const [saved, setSaved] = useState<SavedDash[]>(loadSaved());
  const [activeDash, setActiveDash] = useState<string>("");
  const [layout, setLayout] = useState<LayoutItem[]>(DEFAULT_LAYOUT);
  const [newName, setNewName] = useState("");

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  // Load the scope pickers once.
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

  const kpis = data?.kpis || {};
  const orderedVisible = useMemo(
    () => layout.filter((l) => customizing || !l.hidden),
    [layout, customizing],
  );

  const onDragEnd = (e: any) => {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setLayout((prev) => {
      const oldI = prev.findIndex((l) => l.id === active.id);
      const newI = prev.findIndex((l) => l.id === over.id);
      return arrayMove(prev, oldI, newI);
    });
  };
  const toggleHidden = (id: string) =>
    setLayout((prev) => prev.map((l) => (l.id === id ? { ...l, hidden: !l.hidden } : l)));

  const saveDashboard = () => {
    const name = (newName || activeDash || "").trim();
    if (!name) { toast.error(pt("Give the dashboard a name")); return; }
    const entry: SavedDash = { name, scope, refId, days, layout };
    const next = [...saved.filter((d) => d.name !== name), entry];
    setSaved(next); persistSaved(next); setActiveDash(name); setNewName("");
    setCustomizing(false);
    toast.success(`${pt("Saved dashboard")}: ${name}`);
  };
  const loadDashboard = (name: string) => {
    const d = saved.find((s) => s.name === name);
    if (!d) return;
    setActiveDash(name); setScope(d.scope); setRefId(d.refId); setDays(d.days);
    setLayout(d.layout?.length ? d.layout : DEFAULT_LAYOUT);
  };
  const deleteDashboard = () => {
    if (!activeDash) return;
    const next = saved.filter((d) => d.name !== activeDash);
    setSaved(next); persistSaved(next); setActiveDash(""); setLayout(DEFAULT_LAYOUT);
    toast.success(pt("Dashboard deleted"));
  };

  const exportJson = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `analytics-${scope}-${days}d.json`; a.click();
    URL.revokeObjectURL(url);
  };

  const kpiTile = (icon: any, label: string, value: any, accent = "") => {
    const Icon = icon;
    return (
      <div className="rounded-xl border bg-background p-4">
        <Icon className={`h-5 w-5 mb-2 ${accent}`} />
        <div className="text-2xl font-bold leading-none">{value ?? 0}</div>
        <div className="text-xs text-muted-foreground mt-1">{label}</div>
      </div>
    );
  };

  const renderWidget = (id: string) => {
    switch (id) {
      case "kpis":
        return (
          <CardContent className="p-4">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {kpiTile(FolderKanban, pt("Projects"), kpis.projects, "text-sky-500")}
              {kpiTile(CheckCircle2, pt("Completion"), `${kpis.completion_pct ?? 0}%`, "text-green-500")}
              {kpiTile(TrendingUp, pt("Tasks done"), `${kpis.tasks_done ?? 0}/${kpis.tasks_total ?? 0}`, "text-violet-500")}
              {kpiTile(AlertTriangle, pt("Overdue"), kpis.tasks_overdue, "text-amber-500")}
              {kpiTile(ShieldAlert, pt("Open risks"), kpis.open_risks, "text-red-500")}
              {kpiTile(AlertTriangle, pt("Open issues"), kpis.open_issues, "text-orange-500")}
              {kpiTile(CheckCircle2, pt("Milestones"), `${kpis.milestones_done ?? 0}/${kpis.milestones_total ?? 0}`, "text-teal-500")}
              {kpiTile(Euro, pt("Budget"), `€${Number(kpis.budget || 0).toLocaleString()}`, "text-emerald-500")}
            </div>
          </CardContent>
        );
      case "trend":
        return (
          <>
            <CardHeader className="pb-2"><CardTitle className="text-base">{pt("Completion Trend")}</CardTitle></CardHeader>
            <CardContent className="h-64">
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
            <CardHeader className="pb-2"><CardTitle className="text-base">{pt("Task Status Breakdown")}</CardTitle></CardHeader>
            <CardContent className="h-64">
              {(data?.status_breakdown || []).length === 0 ? (
                <p className="text-sm text-muted-foreground pt-8 text-center">{pt("No tasks yet.")}</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.status_breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {data.status_breakdown.map((_: any, i: number) => <Cell key={i} fill={PIE[i % PIE.length]} />)}
                    </Pie>
                    <Legend /><RTooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </>
        );
      case "risks":
        return (
          <>
            <CardHeader className="pb-2"><CardTitle className="text-base">{pt("Risk Breakdown")}</CardTitle></CardHeader>
            <CardContent className="h-64">
              {(data?.risk_breakdown || []).length === 0 ? (
                <p className="text-sm text-muted-foreground pt-8 text-center">{pt("No open risks.")}</p>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={data.risk_breakdown} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                      {data.risk_breakdown.map((_: any, i: number) => <Cell key={i} fill={PIE[(i + 3) % PIE.length]} />)}
                    </Pie>
                    <Legend /><RTooltip />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </>
        );
      case "top":
        return (
          <>
            <CardHeader className="pb-2"><CardTitle className="text-base">{pt("Top Projects")}</CardTitle></CardHeader>
            <CardContent className="h-64">
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
              <SelectTrigger className="w-44"><SelectValue placeholder={pt("Saved dashboards")} /></SelectTrigger>
              <SelectContent>{saved.map((d) => <SelectItem key={d.name} value={d.name}>{d.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
          <Button variant={customizing ? "default" : "outline"} size="sm" className="gap-1" onClick={() => setCustomizing((c) => !c)}>
            <Settings2 className="h-4 w-4" /> {customizing ? pt("Done") : pt("Customize")}
          </Button>
          <Button variant="outline" size="sm" className="gap-1" onClick={exportJson}>
            <Download className="h-4 w-4" /> {pt("Export")}
          </Button>
        </div>
      </div>

      {/* Customize bar — name + save + delete (drag & drop the widgets below) */}
      {customizing && (
        <Card className="border-purple-200 bg-purple-50/40">
          <CardContent className="p-3 flex items-center gap-2 flex-wrap text-sm">
            <Plus className="h-4 w-4 text-purple-600" />
            <span className="text-muted-foreground">{pt("Drag widgets to reorder, toggle the eye to show/hide, then save this layout as a custom dashboard.")}</span>
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder={pt("Dashboard name")} className="h-8 w-44 ml-auto" />
            <Button size="sm" className="h-8 gap-1" onClick={saveDashboard}><Save className="h-4 w-4" />{pt("Save")}</Button>
            {activeDash && <Button size="sm" variant="outline" className="h-8 gap-1 text-destructive" onClick={deleteDashboard}><Trash2 className="h-4 w-4" />{pt("Delete")}</Button>}
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
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
                {orderedVisible.map((l) => (
                  <div key={l.id} className={l.id === "kpis" ? "lg:col-span-2" : ""}>
                    <SortableWidget id={l.id} customizing={customizing} hidden={l.hidden} onToggle={() => toggleHidden(l.id)} title={widgetTitle(l.id)}>
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
