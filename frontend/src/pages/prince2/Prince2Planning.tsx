import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Loader2, CalendarRange, GanttChartSquare, Table2, Layers, Package } from "lucide-react";

const stageStatusColors: Record<string, string> = { planned: "bg-gray-100 text-gray-700", in_progress: "bg-blue-100 text-blue-700", active: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700", on_hold: "bg-amber-100 text-amber-700" };
const wpStatusColors: Record<string, string> = { draft: "bg-gray-100 text-gray-700", authorized: "bg-indigo-100 text-indigo-700", in_progress: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700", accepted: "bg-green-100 text-green-700" };
const barColors: Record<string, string> = { planned: "bg-gray-400", in_progress: "bg-blue-500", active: "bg-blue-500", completed: "bg-green-500", on_hold: "bg-amber-500", draft: "bg-gray-400", authorized: "bg-indigo-500", accepted: "bg-green-500" };
const barSoft: Record<string, string> = { planned: "bg-gray-300/50", in_progress: "bg-blue-500/25", active: "bg-blue-500/25", completed: "bg-green-500/25", on_hold: "bg-amber-500/25", draft: "bg-gray-300/50", authorized: "bg-indigo-500/25", accepted: "bg-green-500/25" };

const DAY = 86400000;
const LABEL_W = 224; // px — keeps every row's chart area aligned
const toDate = (s?: string | null) => (s ? new Date(s.split("T")[0] + "T00:00:00") : null);
const fmtShort = (d: Date) => d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });
const fmtMonth = (d: Date) => d.toLocaleDateString(undefined, { month: "short", year: "2-digit" });

type Win = { min: number; max: number; span: number };

const Prince2Planning = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [stages, setStages] = useState<any[]>([]);
  const [wps, setWps] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<"timeline" | "table">("timeline");
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

  const fetchData = async () => {
    try {
      const [rs, rw] = await Promise.all([
        fetch(`/api/v1/projects/${id}/prince2/stages/`, { headers }),
        fetch(`/api/v1/projects/${id}/prince2/work-packages/`, { headers }),
      ]);
      if (rs.ok) { const d = await rs.json(); setStages(Array.isArray(d) ? d : d.results || []); }
      if (rw.ok) { const d = await rw.json(); setWps(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const wpsByStage = useMemo(() => { const m: Record<string, any[]> = {}; wps.forEach((w) => { const k = w.stage ? w.stage.toString() : "none"; (m[k] = m[k] || []).push(w); }); return m; }, [wps]);

  // Effective date range of an item: its own planned/actual dates, else roll up
  // from its children (a stage with no own dates inherits min/max of its WPs).
  const rangeOf = (it: any): { s: Date | null; e: Date | null } => ({
    s: toDate(it.planned_start_date) || toDate(it.actual_start_date),
    e: toDate(it.planned_end_date) || toDate(it.actual_end_date),
  });
  const stageRange = (s: any): { s: Date | null; e: Date | null } => {
    const own = rangeOf(s);
    if (own.s && own.e) return own;
    const kids = wpsByStage[s.id?.toString()] || [];
    let mn: number | null = null, mx: number | null = null;
    kids.forEach((w) => { const r = rangeOf(w); if (r.s) mn = mn === null ? r.s.getTime() : Math.min(mn, r.s.getTime()); if (r.e) mx = mx === null ? r.e.getTime() : Math.max(mx, r.e.getTime()); });
    return { s: own.s || (mn !== null ? new Date(mn) : null), e: own.e || (mx !== null ? new Date(mx) : null) };
  };

  const orderedStages = useMemo(() => [...stages].sort((a, b) => (a.order || 0) - (b.order || 0)), [stages]);

  // Global window across every dated item, padded so bars never touch the edges.
  const win: Win | null = useMemo(() => {
    const pts: number[] = [];
    [...orderedStages].forEach((s) => { const r = stageRange(s); if (r.s) pts.push(r.s.getTime()); if (r.e) pts.push(r.e.getTime()); });
    wps.forEach((w) => { const r = rangeOf(w); if (r.s) pts.push(r.s.getTime()); if (r.e) pts.push(r.e.getTime()); });
    if (pts.length === 0) return null;
    let min = Math.min(...pts), max = Math.max(...pts);
    const span = Math.max(max - min, DAY);
    const pad = Math.max(2 * DAY, span * 0.04);
    min -= pad; max += pad;
    return { min, max, span: max - min };
  }, [orderedStages, wps, wpsByStage]);

  const pct = (t: number) => win ? ((t - win.min) / win.span) * 100 : 0;
  const barFor = (r: { s: Date | null; e: Date | null }) => {
    if (!r.s || !r.e || !win) return null;
    const left = pct(r.s.getTime());
    const width = Math.max(pct(r.e.getTime()) - left, 1.2);
    return { left: `${left}%`, width: `${width}%` };
  };

  // Month tick marks across the window (weekly when the span is short).
  const ticks = useMemo(() => {
    if (!win) return [] as { t: number; label: string }[];
    const out: { t: number; label: string }[] = [];
    const spanDays = win.span / DAY;
    const start = new Date(win.min);
    if (spanDays <= 70) {
      // weekly ticks aligned to Monday
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

  const todayPct = useMemo(() => {
    if (!win) return null;
    const t = Date.now();
    if (t < win.min || t > win.max) return null;
    return pct(t);
  }, [win]);

  // Vertical gridlines + today marker, rendered inside each row's chart area
  // so they line up across every row (same window, same width).
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

  const Row = ({ label, icon, range, color, status, progress, indent = false, sub = false }: {
    label: string; icon: React.ReactNode; range: { s: Date | null; e: Date | null };
    color: string; status?: string; progress: number; indent?: boolean; sub?: boolean;
  }) => {
    const style = barFor(range);
    const prog = Math.max(0, Math.min(100, progress || 0));
    const dateLabel = range.s && range.e ? `${fmtShort(range.s)} – ${fmtShort(range.e)}` : pt("no dates");
    return (
      <div className="flex items-center">
        <div className="shrink-0 flex items-center gap-2 pr-3" style={{ width: LABEL_W }}>
          {icon}
          <span className={`truncate ${sub ? "text-xs text-muted-foreground" : "text-sm font-medium"}`} title={label}>{label}</span>
          {status && !sub && <Badge className={`text-[10px] ${stageStatusColors[status] || ""}`}>{status}</Badge>}
        </div>
        <div className={`relative flex-1 ${sub ? "h-5" : "h-7"}`}>
          <Grid />
          {style ? (
            <div
              className={`absolute top-1/2 -translate-y-1/2 ${sub ? "h-4" : "h-6"} rounded-md ${barSoft[color] || "bg-gray-300/50"} ring-1 ring-inset ring-black/5 overflow-hidden shadow-sm`}
              style={style} title={`${label} · ${dateLabel} · ${prog}%`}
            >
              <div className={`h-full ${barColors[color] || "bg-gray-400"} flex items-center`} style={{ width: `${prog}%` }} />
              <span className={`absolute inset-0 flex items-center px-2 ${sub ? "text-[9px]" : "text-[10px]"} font-medium ${prog > 55 ? "text-white" : "text-foreground/70"}`}>
                {!sub && `${prog}%`}
              </span>
            </div>
          ) : (
            <span className="absolute left-2 top-1/2 -translate-y-1/2 text-[10px] text-muted-foreground italic">{pt("no dates")}</span>
          )}
        </div>
      </div>
    );
  };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  const unassigned = wpsByStage["none"] || [];

  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3"><CalendarRange className="h-6 w-6 text-emerald-500" /><div><h1 className="text-2xl font-bold">{pt("Planning")}</h1><p className="text-xs text-muted-foreground">{pt("Stages and their Work Packages on a timeline (product-based planning)")}</p></div></div>
        <div className="flex items-center gap-1 border rounded-md p-1">
          <Button variant={view === "timeline" ? "default" : "ghost"} size="sm" className="gap-1.5" onClick={() => setView("timeline")}><GanttChartSquare className="h-4 w-4" /> {pt("Timeline")}</Button>
          <Button variant={view === "table" ? "default" : "ghost"} size="sm" className="gap-1.5" onClick={() => setView("table")}><Table2 className="h-4 w-4" /> {pt("Table")}</Button>
        </div>
      </div>

      {orderedStages.length === 0 && wps.length === 0 ? (
        <Card className="p-8 text-center"><Layers className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No stages or work packages yet")}</h3><p className="text-sm text-muted-foreground mt-1">{pt("Create stages and work packages to see the plan.")}</p></Card>
      ) : view === "timeline" ? (
        <Card><CardContent className="p-4">
          {!win ? (
            <div className="py-10 text-center">
              <CalendarRange className="h-10 w-10 mx-auto text-muted-foreground/40 mb-3" />
              <p className="text-sm text-muted-foreground">{pt("No planned dates yet — set start/end dates on stages or work packages to see the timeline.")}</p>
              <Button variant="link" size="sm" className="mt-1" onClick={() => setView("table")}>{pt("Switch to table view")}</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <div className="min-w-[640px] space-y-1.5">
                {/* Axis header */}
                <div className="flex items-end h-5 mb-1">
                  <div className="shrink-0" style={{ width: LABEL_W }} />
                  <div className="relative flex-1 h-5"><Grid withLabels /></div>
                </div>
                {orderedStages.map((s) => (
                  <div key={s.id} className="space-y-1">
                    <Row
                      label={s.name || pt("Untitled stage")}
                      icon={<Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" />}
                      range={stageRange(s)} color={s.status} status={s.status}
                      progress={s.progress_percentage}
                    />
                    {(wpsByStage[s.id?.toString()] || []).map((w) => (
                      <Row key={w.id} sub indent
                        label={w.title || w.reference || pt("Work Package")}
                        icon={<Package className="h-3 w-3 text-muted-foreground shrink-0 ml-4" />}
                        range={rangeOf(w)} color={w.status} progress={w.progress_percentage}
                      />
                    ))}
                  </div>
                ))}
                {unassigned.length > 0 && (
                  <div className="pt-2 mt-2 border-t space-y-1">
                    <p className="text-xs text-muted-foreground mb-1">{pt("Unassigned work packages")}</p>
                    {unassigned.map((w) => (
                      <Row key={w.id} sub
                        label={w.title || w.reference || pt("Work Package")}
                        icon={<Package className="h-3 w-3 text-muted-foreground shrink-0 ml-4" />}
                        range={rangeOf(w)} color={w.status} progress={w.progress_percentage}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
          {/* Legend */}
          {win && (
            <div className="flex items-center gap-4 mt-4 pt-3 border-t text-xs text-muted-foreground flex-wrap">
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded bg-blue-500" /> {pt("In progress")}</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded bg-green-500" /> {pt("Completed")}</span>
              <span className="flex items-center gap-1.5"><span className="h-2.5 w-4 rounded bg-gray-400" /> {pt("Planned")}</span>
              <span className="flex items-center gap-1.5"><span className="h-3 w-0.5 bg-rose-400" /> {pt("Today")}</span>
              <span className="ml-auto italic">{pt("Bars without own dates roll up from their work packages.")}</span>
            </div>
          )}
        </CardContent></Card>
      ) : (
        <Card><CardContent className="p-0"><div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="border-b text-left text-muted-foreground"><th className="py-2 px-4 font-medium">{pt("Name")}</th><th className="py-2 px-4 font-medium">{pt("Status")}</th><th className="py-2 px-4 font-medium">{pt("Start")}</th><th className="py-2 px-4 font-medium">{pt("End")}</th><th className="py-2 px-4 font-medium w-40">{pt("Progress")}</th></tr></thead>
            <tbody>
              {orderedStages.map((s) => (
                <>
                  <tr key={`s-${s.id}`} className="border-b bg-muted/30">
                    <td className="py-2 px-4 font-medium flex items-center gap-2"><Layers className="h-3.5 w-3.5 text-muted-foreground" />{s.name || pt("Untitled stage")}</td>
                    <td className="py-2 px-4"><Badge className={`text-xs ${stageStatusColors[s.status] || ""}`}>{s.status}</Badge></td>
                    <td className="py-2 px-4 text-muted-foreground">{s.planned_start_date || "—"}</td>
                    <td className="py-2 px-4 text-muted-foreground">{s.planned_end_date || "—"}</td>
                    <td className="py-2 px-4"><div className="flex items-center gap-2"><Progress value={s.progress_percentage || 0} className="h-2" /><span className="text-xs text-muted-foreground w-9 text-right">{s.progress_percentage || 0}%</span></div></td>
                  </tr>
                  {(wpsByStage[s.id?.toString()] || []).map((w) => (
                    <tr key={`w-${w.id}`} className="border-b last:border-0 hover:bg-muted/40">
                      <td className="py-2 px-4 pl-10 flex items-center gap-2 text-muted-foreground"><Package className="h-3 w-3" />{w.title || w.reference}</td>
                      <td className="py-2 px-4"><Badge className={`text-xs ${wpStatusColors[w.status] || ""}`}>{w.status}</Badge></td>
                      <td className="py-2 px-4 text-muted-foreground">{w.planned_start_date || "—"}</td>
                      <td className="py-2 px-4 text-muted-foreground">{w.planned_end_date || "—"}</td>
                      <td className="py-2 px-4"><div className="flex items-center gap-2"><Progress value={w.progress_percentage || 0} className="h-2" /><span className="text-xs text-muted-foreground w-9 text-right">{w.progress_percentage || 0}%</span></div></td>
                    </tr>
                  ))}
                </>
              ))}
              {unassigned.map((w) => (
                <tr key={`wn-${w.id}`} className="border-b last:border-0 hover:bg-muted/40">
                  <td className="py-2 px-4 pl-10 flex items-center gap-2 text-muted-foreground"><Package className="h-3 w-3" />{w.title || w.reference}</td>
                  <td className="py-2 px-4"><Badge className={`text-xs ${wpStatusColors[w.status] || ""}`}>{w.status}</Badge></td>
                  <td className="py-2 px-4 text-muted-foreground">{w.planned_start_date || "—"}</td>
                  <td className="py-2 px-4 text-muted-foreground">{w.planned_end_date || "—"}</td>
                  <td className="py-2 px-4"><div className="flex items-center gap-2"><Progress value={w.progress_percentage || 0} className="h-2" /><span className="text-xs text-muted-foreground w-9 text-right">{w.progress_percentage || 0}%</span></div></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div></CardContent></Card>
      )}
    </div></div>
  );
};
export default Prince2Planning;
