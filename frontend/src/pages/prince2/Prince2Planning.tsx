import { useState, useEffect, useMemo } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Loader2, CalendarRange, GanttChartSquare, Table2, Layers, Package } from "lucide-react";

const stageStatusColors: Record<string, string> = { planned: "bg-gray-100 text-gray-700", in_progress: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700", on_hold: "bg-amber-100 text-amber-700" };
const wpStatusColors: Record<string, string> = { draft: "bg-gray-100 text-gray-700", authorized: "bg-indigo-100 text-indigo-700", in_progress: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700", accepted: "bg-green-100 text-green-700" };
const barColors: Record<string, string> = { planned: "bg-gray-400", in_progress: "bg-blue-500", completed: "bg-green-500", on_hold: "bg-amber-500", draft: "bg-gray-400", authorized: "bg-indigo-500", accepted: "bg-green-500" };

const DAY = 86400000;
const toDate = (s?: string | null) => (s ? new Date(s.split("T")[0] + "T00:00:00") : null);
const fmt = (d: Date) => d.toLocaleDateString(undefined, { day: "2-digit", month: "short" });

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

  // Build a unified bar list to compute the global timeline window
  const bars = useMemo(() => {
    const all: { start: Date; end: Date }[] = [];
    [...stages, ...wps].forEach((it) => { const s = toDate(it.planned_start_date) || toDate(it.actual_start_date); const e = toDate(it.planned_end_date) || toDate(it.actual_end_date); if (s && e) all.push({ start: s, end: e }); });
    return all;
  }, [stages, wps]);
  const window = useMemo(() => {
    if (bars.length === 0) return null;
    let min = bars[0].start.getTime(); let max = bars[0].end.getTime();
    bars.forEach((b) => { min = Math.min(min, b.start.getTime()); max = Math.max(max, b.end.getTime()); });
    const span = Math.max(max - min, DAY);
    return { min, max, span };
  }, [bars]);

  const barStyle = (start?: string | null, end?: string | null) => {
    const s = toDate(start); const e = toDate(end);
    if (!s || !e || !window) return null;
    const left = ((s.getTime() - window.min) / window.span) * 100;
    const width = Math.max(((e.getTime() - s.getTime()) / window.span) * 100, 1.5);
    return { left: `${left}%`, width: `${width}%` };
  };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  const orderedStages = [...stages].sort((a, b) => (a.order || 0) - (b.order || 0));

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
        <Card><CardContent className="p-4 space-y-1">
          {window && (
            <div className="flex justify-between text-xs text-muted-foreground mb-3 pl-[34%]"><span>{fmt(new Date(window.min))}</span><span>{fmt(new Date(window.max))}</span></div>
          )}
          {orderedStages.map((s) => {
            const st = barStyle(s.planned_start_date, s.planned_end_date);
            const children = wpsByStage[s.id?.toString()] || [];
            return (
              <div key={s.id} className="space-y-1">
                <div className="flex items-center gap-2 group">
                  <div className="w-[33%] shrink-0 flex items-center gap-2 pr-2"><Layers className="h-3.5 w-3.5 text-muted-foreground shrink-0" /><span className="text-sm font-medium truncate" title={s.name}>{s.name || pt("Untitled stage")}</span><Badge className={`text-[10px] ${stageStatusColors[s.status] || ""}`}>{s.status}</Badge></div>
                  <div className="relative flex-1 h-6 bg-muted/40 rounded">
                    {st ? (<div className={`absolute top-0 h-6 rounded ${barColors[s.status] || "bg-gray-400"} flex items-center px-2`} style={st}><span className="text-[10px] text-white font-medium whitespace-nowrap">{s.progress_percentage || 0}%</span></div>) : <span className="absolute left-2 top-1 text-[10px] text-muted-foreground italic">{pt("no dates")}</span>}
                  </div>
                </div>
                {children.map((w) => {
                  const wt = barStyle(w.planned_start_date, w.planned_end_date);
                  return (
                    <div key={w.id} className="flex items-center gap-2">
                      <div className="w-[33%] shrink-0 flex items-center gap-2 pl-6 pr-2"><Package className="h-3 w-3 text-muted-foreground shrink-0" /><span className="text-xs truncate text-muted-foreground" title={w.title}>{w.title || w.reference}</span></div>
                      <div className="relative flex-1 h-4 bg-muted/20 rounded">
                        {wt ? (<div className={`absolute top-0 h-4 rounded ${barColors[w.status] || "bg-gray-400"} opacity-80`} style={wt} title={`${w.title}: ${w.progress_percentage || 0}%`} />) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })}
          {(wpsByStage["none"] || []).length > 0 && (
            <div className="pt-2 mt-2 border-t">
              <p className="text-xs text-muted-foreground mb-1">{pt("Unassigned work packages")}</p>
              {wpsByStage["none"].map((w) => {
                const wt = barStyle(w.planned_start_date, w.planned_end_date);
                return (
                  <div key={w.id} className="flex items-center gap-2">
                    <div className="w-[33%] shrink-0 flex items-center gap-2 pl-6 pr-2"><Package className="h-3 w-3 text-muted-foreground shrink-0" /><span className="text-xs truncate text-muted-foreground">{w.title || w.reference}</span></div>
                    <div className="relative flex-1 h-4 bg-muted/20 rounded">{wt ? <div className={`absolute top-0 h-4 rounded ${barColors[w.status] || "bg-gray-400"} opacity-80`} style={wt} /> : null}</div>
                  </div>
                );
              })}
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
              {(wpsByStage["none"] || []).map((w) => (
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
