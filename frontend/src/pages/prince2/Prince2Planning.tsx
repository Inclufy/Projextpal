import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import {
  Loader2, CalendarRange, GanttChartSquare, Table2, Layers, Package,
  Flag, ListChecks, Link2, ShieldAlert, ChevronDown, ChevronRight as ChevR, Clock,
} from "lucide-react";

const stageStatusColors: Record<string, string> = { planned: "bg-gray-100 text-gray-700", in_progress: "bg-blue-100 text-blue-700", active: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700", on_hold: "bg-amber-100 text-amber-700" };
const barColors: Record<string, string> = { planned: "bg-gray-400", in_progress: "bg-blue-500", active: "bg-blue-500", completed: "bg-green-500", on_hold: "bg-amber-500", draft: "bg-gray-400", authorized: "bg-indigo-500", accepted: "bg-green-500", closed: "bg-green-500", not_started: "bg-gray-400", blocked: "bg-rose-500", review: "bg-violet-500" };
const barSoft: Record<string, string> = { planned: "bg-gray-300/50", in_progress: "bg-blue-500/25", active: "bg-blue-500/25", completed: "bg-green-500/25", on_hold: "bg-amber-500/25", draft: "bg-gray-300/50", authorized: "bg-indigo-500/25", accepted: "bg-green-500/25", closed: "bg-green-500/25", not_started: "bg-gray-300/50", blocked: "bg-rose-500/25", review: "bg-violet-500/25" };
const riskLevelColor: Record<string, string> = { High: "bg-rose-500", Medium: "bg-amber-500", Low: "bg-emerald-500", Critical: "bg-rose-600" };

const DAY = 86400000;
const LABEL_W = 280; // px — keeps every row's chart area aligned (wider for deeper indents)
const toDate = (s?: string | null) => (s ? new Date(s.split("T")[0] + "T00:00:00") : null);
const fmtShort = (d: Date) => d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
const fmtMonth = (d: Date) => d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });
const startOfToday = () => { const d = new Date(); d.setHours(0, 0, 0, 0); return d.getTime(); };

const initials = (name?: string | null) => {
  if (!name) return "?";
  const p = name.trim().split(/\s+/);
  return ((p[0]?.[0] || "") + (p.length > 1 ? p[p.length - 1][0] : "")).toUpperCase() || "?";
};

type Win = { min: number; max: number; span: number };
type Range = { s: Date | null; e: Date | null };
type LayerKey = "deliverables" | "milestones" | "activities" | "people" | "dependencies" | "risks";

const ALL_LAYERS: { key: LayerKey; label: string; icon: any }[] = [
  { key: "deliverables", label: "Deliverables", icon: Package },
  { key: "milestones", label: "Milestones", icon: Flag },
  { key: "activities", label: "Activities", icon: ListChecks },
  { key: "people", label: "People", icon: undefined },
  { key: "dependencies", label: "Dependencies", icon: Link2 },
  { key: "risks", label: "Risks & delays", icon: ShieldAlert },
];

const Prince2Planning = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [stages, setStages] = useState<any[]>([]);
  const [wps, setWps] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"timeline" | "table">("timeline");
  const [layers, setLayers] = useState<Set<LayerKey>>(new Set(ALL_LAYERS.map((l) => l.key)));
  const [collapsed, setCollapsed] = useState<Set<string>>(new Set());
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

  const on = (k: LayerKey) => layers.has(k);
  const toggleLayer = (k: LayerKey) => setLayers((prev) => { const n = new Set(prev); n.has(k) ? n.delete(k) : n.add(k); return n; });
  const toggleCollapse = (key: string) => setCollapsed((prev) => { const n = new Set(prev); n.has(key) ? n.delete(key) : n.add(key); return n; });

  const fetchData = async () => {
    try {
      const [rs, rw, rm, rr] = await Promise.all([
        fetch(`/api/v1/projects/${id}/prince2/stages/`, { headers }),
        fetch(`/api/v1/projects/${id}/prince2/work-packages/`, { headers }),
        fetch(`/api/v1/projects/milestones/?project=${id}`, { headers }),
        fetch(`/api/v1/projects/risks/?project=${id}`, { headers }),
      ]);
      if (rs.ok) { const d = await rs.json(); setStages(Array.isArray(d) ? d : d.results || []); }
      if (rw.ok) { const d = await rw.json(); setWps(Array.isArray(d) ? d : d.results || []); }
      if (rm.ok) { const d = await rm.json(); setMilestones(Array.isArray(d) ? d : d.results || []); }
      if (rr.ok) { const d = await rr.json(); setRisks(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const wpsByStage = useMemo(() => { const m: Record<string, any[]> = {}; wps.forEach((w) => { const k = w.stage ? w.stage.toString() : "none"; (m[k] = m[k] || []).push(w); }); return m; }, [wps]);

  // Effective date range of an item: its own planned/actual dates.
  const rangeOf = (it: any): Range => ({ s: toDate(it.planned_start_date) || toDate(it.actual_start_date), e: toDate(it.planned_end_date) || toDate(it.actual_end_date) });
  const msRange = (m: any): Range => ({ s: toDate(m.start_date), e: toDate(m.end_date) || toDate(m.start_date) });
  const taskRange = (t: any): Range => ({ s: toDate(t.start_date), e: toDate(t.revised_due_date) || toDate(t.due_date) });
  const stageRange = (s: any): Range => {
    const own = rangeOf(s);
    if (own.s && own.e) return own;
    const kids = wpsByStage[s.id?.toString()] || [];
    let mn: number | null = null, mx: number | null = null;
    kids.forEach((w) => { const r = rangeOf(w); if (r.s) mn = mn === null ? r.s.getTime() : Math.min(mn, r.s.getTime()); if (r.e) mx = mx === null ? r.e.getTime() : Math.max(mx, r.e.getTime()); });
    return { s: own.s || (mn !== null ? new Date(mn) : null), e: own.e || (mx !== null ? new Date(mx) : null) };
  };

  const orderedStages = useMemo(() => [...stages].sort((a, b) => (a.order || 0) - (b.order || 0)), [stages]);

  // Associate each milestone to a stage by date-window (anchor = end date),
  // because the data model has no Milestone→Stage FK. Unmatched go "project-level".
  const { msByStage, looseMilestones } = useMemo(() => {
    const m: Record<string, any[]> = {}; const loose: any[] = [];
    milestones.forEach((ms) => {
      const r = msRange(ms); const anchor = r.e || r.s; let placed = false;
      if (anchor) {
        for (const s of orderedStages) {
          const sr = stageRange(s);
          if (sr.s && sr.e && anchor.getTime() >= sr.s.getTime() && anchor.getTime() <= sr.e.getTime()) {
            (m[s.id] = m[s.id] || []).push(ms); placed = true; break;
          }
        }
      }
      if (!placed) loose.push(ms);
    });
    return { msByStage: m, looseMilestones: loose };
  }, [milestones, orderedStages, wpsByStage]);

  // Global window across every dated item.
  const win: Win | null = useMemo(() => {
    const pts: number[] = [];
    const push = (r: Range) => { if (r.s) pts.push(r.s.getTime()); if (r.e) pts.push(r.e.getTime()); };
    orderedStages.forEach((s) => push(stageRange(s)));
    wps.forEach((w) => push(rangeOf(w)));
    milestones.forEach((ms) => { push(msRange(ms)); (ms.tasks || []).forEach((t: any) => push(taskRange(t))); });
    if (pts.length === 0) return null;
    let min = Math.min(...pts), max = Math.max(...pts);
    const span = Math.max(max - min, DAY);
    const pad = Math.max(2 * DAY, span * 0.04);
    min -= pad; max += pad;
    return { min, max, span: max - min };
  }, [orderedStages, wps, milestones, wpsByStage]);

  const pct = (t: number) => win ? ((t - win.min) / win.span) * 100 : 0;
  const barFor = (r: Range) => {
    if (!r.s || !r.e || !win) return null;
    const left = pct(r.s.getTime());
    const width = Math.max(pct(r.e.getTime()) - left, 1.2);
    return { left: `${left}%`, width: `${width}%` };
  };
  // Delay in days: planned end is in the past and not yet complete.
  const delayDays = (r: Range, progress: number, status?: string) => {
    if (!r.e || progress >= 100 || status === "completed" || status === "accepted" || status === "closed" || status === "done") return 0;
    const d = Math.floor((startOfToday() - r.e.getTime()) / DAY);
    return d > 0 ? d : 0;
  };

  const ticks = useMemo(() => {
    if (!win) return [] as { t: number; label: string }[];
    const out: { t: number; label: string }[] = [];
    const spanDays = win.span / DAY;
    const start = new Date(win.min);
    if (spanDays <= 70) {
      const d = new Date(start); d.setHours(0, 0, 0, 0);
      d.setDate(d.getDate() + ((8 - d.getDay()) % 7));
      while (d.getTime() <= win.max) { out.push({ t: d.getTime(), label: fmtShort(d) }); d.setDate(d.getDate() + 7); }
    } else {
      let d = new Date(start.getFullYear(), start.getMonth(), 1);
      if (d.getTime() < win.min) d = new Date(start.getFullYear(), start.getMonth() + 1, 1);
      while (d.getTime() <= win.max) { out.push({ t: d.getTime(), label: fmtMonth(d) }); d = new Date(d.getFullYear(), d.getMonth() + 1, 1); }
    }
    return out;
  }, [win]);

  const todayPct = useMemo(() => { if (!win) return null; const t = startOfToday(); if (t < win.min || t > win.max) return null; return pct(t); }, [win]);

  const Grid = ({ withLabels = false }: { withLabels?: boolean }) => (
    <>
      {ticks.map((tk, i) => (
        <div key={i} className="absolute inset-y-0 border-l border-border/50" style={{ left: `${pct(tk.t)}%` }}>
          {withLabels && <span className="absolute -top-0.5 left-1 text-[10px] text-muted-foreground whitespace-nowrap">{tk.label}</span>}
        </div>
      ))}
      {todayPct !== null && (
        <div className="absolute inset-y-0 border-l-2 border-rose-400 z-10" style={{ left: `${todayPct}%` }}>
          {withLabels && <span className="absolute -top-0.5 left-1 text-[10px] font-medium text-rose-500 whitespace-nowrap">{pt("Today")}</span>}
        </div>
      )}
    </>
  );

  // ── visual atoms ──────────────────────────────────────────────────
  const Avatar = ({ name }: { name?: string | null }) =>
    !on("people") || !name ? null : (
      <span title={name} className="ml-1 inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-purple-100 text-[9px] font-bold text-purple-700 ring-1 ring-purple-200 dark:bg-purple-900/40 dark:text-purple-200">
        {initials(name)}
      </span>
    );
  const DelayBadge = ({ days }: { days: number }) =>
    !on("risks") || days <= 0 ? null : (
      <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-rose-100 px-1 py-0.5 text-[9px] font-semibold text-rose-700 dark:bg-rose-900/40 dark:text-rose-200" title={pt("Overdue")}>
        <Clock className="h-2.5 w-2.5" /> {days}{pt("d")}
      </span>
    );
  const DepsChip = ({ deps }: { deps: { id: number; title: string }[] }) =>
    !on("dependencies") || !deps?.length ? null : (
      <span className="ml-1 inline-flex items-center gap-0.5 rounded bg-slate-100 px-1 py-0.5 text-[9px] font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-300" title={`${pt("Depends on")}: ${deps.map((d) => d.title).join(", ")}`}>
        <Link2 className="h-2.5 w-2.5" /> {deps.length}
      </span>
    );

  // Generic bar row (stage / deliverable / activity)
  const BarRow = ({ label, icon, range, color, status, progress, level = 0, sub = false, person, deps, collapsible, isCollapsed, onToggle }: {
    label: string; icon: React.ReactNode; range: Range; color: string; status?: string; progress: number;
    level?: number; sub?: boolean; person?: string | null; deps?: { id: number; title: string }[];
    collapsible?: boolean; isCollapsed?: boolean; onToggle?: () => void;
  }) => {
    const style = barFor(range);
    const prog = Math.max(0, Math.min(100, progress || 0));
    const dl = delayDays(range, prog, status);
    const dateLabel = range.s && range.e ? `${fmtShort(range.s)} – ${fmtShort(range.e)}` : pt("no dates");
    return (
      <div className="flex items-center">
        <div className="flex shrink-0 items-center gap-1 pr-3" style={{ width: LABEL_W, paddingLeft: level * 16 }}>
          {collapsible ? (
            <button type="button" onClick={onToggle} className="shrink-0 rounded p-0.5 hover:bg-muted">
              {isCollapsed ? <ChevR className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
            </button>
          ) : <span className="w-[18px] shrink-0" />}
          {icon}
          <span className={`truncate ${sub ? "text-xs text-muted-foreground" : "text-sm font-medium"}`} title={label}>{label}</span>
          {status && !sub && <Badge className={`text-[10px] ${stageStatusColors[status] || "bg-muted text-foreground/70"}`}>{pt(status)}</Badge>}
          <Avatar name={person} />
          <DepsChip deps={deps || []} />
          <DelayBadge days={dl} />
        </div>
        <div className={`relative flex-1 ${sub ? "h-5" : "h-7"}`}>
          <Grid />
          {style ? (
            <div className={`absolute top-1/2 -translate-y-1/2 ${sub ? "h-4" : "h-6"} overflow-hidden rounded-md ${barSoft[color] || "bg-gray-300/50"} shadow-sm ring-1 ring-inset ${dl > 0 ? "ring-rose-400/60" : "ring-black/5"}`} style={style} title={`${label} · ${dateLabel} · ${prog}%`}>
              <div className={`h-full ${barColors[color] || "bg-gray-400"} flex items-center`} style={{ width: `${prog}%` }} />
              <span className={`absolute inset-0 flex items-center px-2 ${sub ? "text-[9px]" : "text-[10px]"} font-medium ${prog > 55 ? "text-white" : "text-foreground/70"}`}>{!sub && `${prog}%`}</span>
            </div>
          ) : (
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] italic text-muted-foreground">{pt("no dates")}</span>
          )}
        </div>
      </div>
    );
  };

  // Milestone marker row (diamond at the target date)
  const MilestoneRow = ({ ms, level = 1 }: { ms: any; level?: number }) => {
    const r = msRange(ms); const anchor = r.e || r.s;
    const done = ms.status === "completed" || ms.status === "done" || ms.status === "achieved";
    const dl = delayDays(r, done ? 100 : 0, ms.status);
    const left = anchor ? pct(anchor.getTime()) : null;
    return (
      <div className="flex items-center">
        <div className="flex shrink-0 items-center gap-1 pr-3" style={{ width: LABEL_W, paddingLeft: level * 16 + 18 }}>
          <Flag className={`h-3 w-3 shrink-0 ${done ? "text-green-600" : "text-amber-500"}`} />
          <span className="truncate text-xs font-medium" title={ms.name}>{ms.name || pt("Milestone")}</span>
          <DelayBadge days={dl} />
        </div>
        <div className="relative h-5 flex-1">
          <Grid />
          {left !== null ? (
            <div className="absolute top-1/2 -translate-y-1/2" style={{ left: `${left}%` }} title={`${ms.name} · ${anchor ? fmtShort(anchor) : ""}`}>
              <div className={`h-2.5 w-2.5 -translate-x-1/2 rotate-45 rounded-[2px] ${done ? "bg-green-500" : dl > 0 ? "bg-rose-500" : "bg-amber-500"} ring-2 ring-background`} />
            </div>
          ) : (
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] italic text-muted-foreground">{pt("no date")}</span>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  const unassigned = wpsByStage["none"] || [];
  const openRisks = risks.filter((r) => (r.status || "").toLowerCase() !== "closed" && (r.status || "").toLowerCase() !== "resolved");
  const riskByLevel = (lvl: string) => openRisks.filter((r) => (r.level || "").toLowerCase() === lvl.toLowerCase()).length;
  // count delayed items across all layers
  const delayedCount = (() => {
    let n = 0;
    orderedStages.forEach((s) => { if (delayDays(stageRange(s), s.progress_percentage || 0, s.status) > 0) n++; });
    wps.forEach((w) => { if (delayDays(rangeOf(w), w.progress_percentage || 0, w.status) > 0) n++; });
    milestones.forEach((m) => { if (delayDays(msRange(m), m.status === "completed" ? 100 : 0, m.status) > 0) n++; (m.tasks || []).forEach((t: any) => { if (delayDays(taskRange(t), t.progress || 0, t.status) > 0) n++; }); });
    return n;
  })();

  const renderStageChildren = (s: any) => {
    const stageWps = wpsByStage[s.id?.toString()] || [];
    const stageMs = msByStage[s.id] || [];
    return (
      <>
        {on("deliverables") && stageWps.map((w) => (
          <BarRow key={`w-${w.id}`} sub level={1}
            label={w.title || w.reference || pt("Deliverable")}
            icon={<Package className="h-3 w-3 shrink-0 text-indigo-500" />}
            range={rangeOf(w)} color={w.status} status={w.status} progress={w.progress_percentage}
            person={w.team_manager_name} deps={w.depends_on_titles} />
        ))}
        {on("milestones") && stageMs.map((ms) => (
          <div key={`ms-${ms.id}`}>
            <MilestoneRow ms={ms} level={1} />
            {on("activities") && (ms.tasks || []).map((t: any) => (
              <BarRow key={`t-${t.id}`} sub level={2}
                label={t.title || pt("Activity")}
                icon={<ListChecks className="h-3 w-3 shrink-0 text-teal-500" />}
                range={taskRange(t)} color={t.status} progress={t.progress}
                person={t.assigned_to_name} />
            ))}
          </div>
        ))}
      </>
    );
  };

  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><CalendarRange className="h-6 w-6 text-emerald-500" /><div><h1 className="text-2xl font-bold">{pt("Planning")}</h1><p className="text-xs text-muted-foreground">{pt("Layered plan: stages → deliverables → milestones → activities, with people, dependencies, risks & delays")}</p></div></div>
        <div className="flex items-center gap-1 rounded-md border p-1">
          <Button variant={view === "timeline" ? "default" : "ghost"} size="sm" className="gap-1.5" onClick={() => setView("timeline")}><GanttChartSquare className="h-4 w-4" /> {pt("Timeline")}</Button>
          <Button variant={view === "table" ? "default" : "ghost"} size="sm" className="gap-1.5" onClick={() => setView("table")}><Table2 className="h-4 w-4" /> {pt("Table")}</Button>
        </div>
      </div>

      {/* Layer toolbar — peel layers on/off */}
      <div className="flex flex-wrap items-center gap-1.5">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{pt("Layers")}:</span>
        {ALL_LAYERS.map((l) => {
          const active = on(l.key); const Icon = l.icon;
          return (
            <button key={l.key} type="button" onClick={() => toggleLayer(l.key)}
              className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-medium transition-colors ${active ? "border-purple-300 bg-purple-50 text-purple-700 dark:border-purple-800 dark:bg-purple-950/40 dark:text-purple-200" : "border-border bg-muted/30 text-muted-foreground hover:bg-muted"}`}>
              {Icon ? <Icon className="h-3 w-3" /> : <span className="h-3.5 w-3.5 rounded-full bg-purple-300 text-[7px] leading-[14px] text-white text-center">@</span>}
              {pt(l.label)}
            </button>
          );
        })}
      </div>

      {/* Risk & delay strip */}
      {on("risks") && (openRisks.length > 0 || delayedCount > 0) && (
        <Card className="border-l-4 border-l-rose-400">
          <CardContent className="flex flex-wrap items-center gap-x-5 gap-y-2 p-3">
            <span className="flex items-center gap-1.5 text-sm font-semibold"><ShieldAlert className="h-4 w-4 text-rose-500" /> {pt("Risks & delays")}</span>
            {(["Critical", "High", "Medium", "Low"] as const).map((lvl) => riskByLevel(lvl) > 0 && (
              <span key={lvl} className="flex items-center gap-1.5 text-xs text-muted-foreground"><span className={`h-2.5 w-2.5 rounded-full ${riskLevelColor[lvl]}`} />{riskByLevel(lvl)} {pt(lvl)}</span>
            ))}
            {openRisks.length === 0 && <span className="text-xs text-muted-foreground">{pt("No open risks")}</span>}
            <span className="flex items-center gap-1.5 text-xs"><Clock className="h-3.5 w-3.5 text-rose-500" /><span className={delayedCount > 0 ? "font-semibold text-rose-600" : "text-muted-foreground"}>{delayedCount} {pt("delayed items")}</span></span>
            {/* top open risks */}
            <div className="flex flex-wrap items-center gap-1.5">
              {openRisks.slice(0, 4).map((r) => (
                <span key={r.id} className="inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px]" title={`${r.name} · ${r.level} · ${pt("owner")}: ${r.owner_name || "—"}`}>
                  <span className={`h-2 w-2 rounded-full ${riskLevelColor[r.level] || "bg-gray-400"}`} />
                  <span className="max-w-[160px] truncate">{r.name}</span>
                </span>
              ))}
              {openRisks.length > 4 && <span className="text-[10px] text-muted-foreground">+{openRisks.length - 4}</span>}
            </div>
          </CardContent>
        </Card>
      )}

      {orderedStages.length === 0 && wps.length === 0 && milestones.length === 0 ? (
        <Card className="p-8 text-center"><Layers className="mx-auto mb-4 h-12 w-12 text-muted-foreground" /><h3 className="text-lg font-semibold">{pt("No stages, deliverables or milestones yet")}</h3><p className="mt-1 text-sm text-muted-foreground">{pt("Create stages, work packages and milestones to see the layered plan.")}</p></Card>
      ) : view === "timeline" ? (
        <Card><CardContent className="p-4">
          {!win ? (
            <div className="py-10 text-center">
              <CalendarRange className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="text-sm text-muted-foreground">{pt("No planned dates yet — set start/end dates on stages, work packages or milestones to see the timeline.")}</p>
              <Button variant="link" size="sm" className="mt-1" onClick={() => setView("table")}>{pt("Switch to table view")}</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[760px] space-y-1.5">
                {/* Axis header */}
                <div className="mb-1 flex h-5 items-end">
                  <div className="shrink-0" style={{ width: LABEL_W }} />
                  <div className="relative h-5 flex-1"><Grid withLabels /></div>
                </div>
                {orderedStages.map((s) => {
                  const ckey = `stage-${s.id}`; const isCol = collapsed.has(ckey);
                  return (
                    <div key={s.id} className="space-y-1 rounded-lg py-1">
                      <BarRow
                        label={s.name || pt("Untitled stage")}
                        icon={<Layers className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />}
                        range={stageRange(s)} color={s.status} status={s.status} progress={s.progress_percentage}
                        level={0} collapsible isCollapsed={isCol} onToggle={() => toggleCollapse(ckey)} />
                      {!isCol && renderStageChildren(s)}
                    </div>
                  );
                })}

                {/* project-level milestones not inside any stage window */}
                {on("milestones") && looseMilestones.length > 0 && (
                  <div className="mt-2 space-y-1 border-t pt-2">
                    <p className="mb-1 text-xs text-muted-foreground">{pt("Project-level milestones")}</p>
                    {looseMilestones.map((ms) => (
                      <div key={`lm-${ms.id}`}>
                        <MilestoneRow ms={ms} level={0} />
                        {on("activities") && (ms.tasks || []).map((t: any) => (
                          <BarRow key={`lt-${t.id}`} sub level={1}
                            label={t.title || pt("Activity")}
                            icon={<ListChecks className="h-3 w-3 shrink-0 text-teal-500" />}
                            range={taskRange(t)} color={t.status} progress={t.progress} person={t.assigned_to_name} />
                        ))}
                      </div>
                    ))}
                  </div>
                )}

                {/* unassigned deliverables */}
                {on("deliverables") && unassigned.length > 0 && (
                  <div className="mt-2 space-y-1 border-t pt-2">
                    <p className="mb-1 text-xs text-muted-foreground">{pt("Unassigned deliverables")}</p>
                    {unassigned.map((w) => (
                      <BarRow key={w.id} sub level={1}
                        label={w.title || w.reference || pt("Deliverable")}
                        icon={<Package className="h-3 w-3 shrink-0 text-indigo-500" />}
                        range={rangeOf(w)} color={w.status} status={w.status} progress={w.progress_percentage}
                        person={w.team_manager_name} deps={w.depends_on_titles} />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Legend */}
          {win && (
            <div className="mt-4 flex flex-wrap items-center gap-4 border-t pt-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5"><Layers className="h-3 w-3" /> {pt("Stage")}</span>
              <span className="flex items-center gap-1.5"><Package className="h-3 w-3 text-indigo-500" /> {pt("Deliverable")}</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-2.5 rotate-45 rounded-[2px] bg-amber-500" /> {pt("Milestone")}</span>
              <span className="flex items-center gap-1.5"><ListChecks className="h-3 w-3 text-teal-500" /> {pt("Activity")}</span>
              <span className="flex items-center gap-1.5"><span className="inline-flex h-4 w-4 items-center justify-center rounded-full bg-purple-100 text-[8px] font-bold text-purple-700">@</span> {pt("Owner")}</span>
              <span className="flex items-center gap-1.5"><Link2 className="h-3 w-3" /> {pt("Dependency")}</span>
              <span className="flex items-center gap-1.5"><Clock className="h-3 w-3 text-rose-500" /> {pt("Delay")}</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-0.5 bg-rose-400" /> {pt("Today")}</span>
            </div>
          )}
        </CardContent></Card>
      ) : (
        <Card><CardContent className="p-0"><div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground">
              <th className="px-4 py-2 font-medium">{pt("Name")}</th>
              <th className="px-4 py-2 font-medium">{pt("Type")}</th>
              <th className="px-4 py-2 font-medium">{pt("Owner")}</th>
              <th className="px-4 py-2 font-medium">{pt("Status")}</th>
              <th className="px-4 py-2 font-medium">{pt("Start")}</th>
              <th className="px-4 py-2 font-medium">{pt("End")}</th>
              <th className="px-4 py-2 font-medium">{pt("Delay")}</th>
              <th className="w-40 px-4 py-2 font-medium">{pt("Progress")}</th>
            </tr></thead>
            <tbody>
              {orderedStages.map((s) => {
                const r = stageRange(s); const dl = delayDays(r, s.progress_percentage || 0, s.status);
                return (
                  <>
                    <tr key={`s-${s.id}`} className="border-b bg-muted/30">
                      <td className="flex items-center gap-2 px-4 py-2 font-medium"><Layers className="h-3.5 w-3.5 text-muted-foreground" />{s.name || pt("Untitled stage")}</td>
                      <td className="px-4 py-2 text-muted-foreground">{pt("Stage")}</td>
                      <td className="px-4 py-2 text-muted-foreground">—</td>
                      <td className="px-4 py-2"><Badge className={`text-xs ${stageStatusColors[s.status] || ""}`}>{pt(s.status)}</Badge></td>
                      <td className="px-4 py-2 text-muted-foreground">{s.planned_start_date || "—"}</td>
                      <td className="px-4 py-2 text-muted-foreground">{s.planned_end_date || "—"}</td>
                      <td className="px-4 py-2">{dl > 0 ? <span className="font-semibold text-rose-600">{dl}{pt("d")}</span> : "—"}</td>
                      <td className="px-4 py-2"><div className="flex items-center gap-2"><Progress value={s.progress_percentage || 0} className="h-2" /><span className="w-9 text-right text-xs text-muted-foreground">{s.progress_percentage || 0}%</span></div></td>
                    </tr>
                    {(wpsByStage[s.id?.toString()] || []).map((w) => {
                      const wr = rangeOf(w); const wdl = delayDays(wr, w.progress_percentage || 0, w.status);
                      return (
                        <tr key={`w-${w.id}`} className="border-b last:border-0 hover:bg-muted/40">
                          <td className="flex items-center gap-2 px-4 py-2 pl-10 text-muted-foreground"><Package className="h-3 w-3 text-indigo-500" />{w.title || w.reference}</td>
                          <td className="px-4 py-2 text-muted-foreground">{pt("Deliverable")}</td>
                          <td className="px-4 py-2 text-muted-foreground">{w.team_manager_name || "—"}</td>
                          <td className="px-4 py-2"><Badge className="text-xs">{pt(w.status)}</Badge></td>
                          <td className="px-4 py-2 text-muted-foreground">{w.planned_start_date || "—"}</td>
                          <td className="px-4 py-2 text-muted-foreground">{w.planned_end_date || "—"}</td>
                          <td className="px-4 py-2">{wdl > 0 ? <span className="font-semibold text-rose-600">{wdl}{pt("d")}</span> : "—"}</td>
                          <td className="px-4 py-2"><div className="flex items-center gap-2"><Progress value={w.progress_percentage || 0} className="h-2" /><span className="w-9 text-right text-xs text-muted-foreground">{w.progress_percentage || 0}%</span></div></td>
                        </tr>
                      );
                    })}
                    {(msByStage[s.id] || []).map((ms) => (
                      <>
                        <tr key={`ms-${ms.id}`} className="border-b hover:bg-muted/40">
                          <td className="flex items-center gap-2 px-4 py-2 pl-10 text-muted-foreground"><Flag className="h-3 w-3 text-amber-500" />{ms.name}</td>
                          <td className="px-4 py-2 text-muted-foreground">{pt("Milestone")}</td>
                          <td className="px-4 py-2 text-muted-foreground">—</td>
                          <td className="px-4 py-2"><Badge className="text-xs">{pt(ms.status || "—")}</Badge></td>
                          <td className="px-4 py-2 text-muted-foreground">{ms.start_date || "—"}</td>
                          <td className="px-4 py-2 text-muted-foreground">{ms.end_date || "—"}</td>
                          <td className="px-4 py-2">—</td>
                          <td className="px-4 py-2">—</td>
                        </tr>
                        {(ms.tasks || []).map((t: any) => {
                          const tr = taskRange(t); const tdl = delayDays(tr, t.progress || 0, t.status);
                          return (
                            <tr key={`t-${t.id}`} className="border-b last:border-0 hover:bg-muted/40">
                              <td className="flex items-center gap-2 px-4 py-2 pl-16 text-muted-foreground"><ListChecks className="h-3 w-3 text-teal-500" />{t.title}</td>
                              <td className="px-4 py-2 text-muted-foreground">{pt("Activity")}</td>
                              <td className="px-4 py-2 text-muted-foreground">{t.assigned_to_name || "—"}</td>
                              <td className="px-4 py-2"><Badge className="text-xs">{pt(t.status || "—")}</Badge></td>
                              <td className="px-4 py-2 text-muted-foreground">{t.start_date || "—"}</td>
                              <td className="px-4 py-2 text-muted-foreground">{t.revised_due_date || t.due_date || "—"}</td>
                              <td className="px-4 py-2">{tdl > 0 ? <span className="font-semibold text-rose-600">{tdl}{pt("d")}</span> : "—"}</td>
                              <td className="px-4 py-2"><div className="flex items-center gap-2"><Progress value={t.progress || 0} className="h-2" /><span className="w-9 text-right text-xs text-muted-foreground">{t.progress || 0}%</span></div></td>
                            </tr>
                          );
                        })}
                      </>
                    ))}
                  </>
                );
              })}
            </tbody>
          </table>
        </div></CardContent></Card>
      )}
    </div></div>
  );
};
export default Prince2Planning;
