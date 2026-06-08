import { useEffect, useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, GanttChartSquare, AlertTriangle, Flag } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { usePageTranslations } from "@/hooks/usePageTranslations";

interface GTask {
  id: number; title: string; milestone_name: string | null; assigned_to_name: string | null;
  status: string; progress: number; start_date: string | null; due_date: string | null;
  duration_days: number; depends_on: number[]; slack: number | null; is_critical: boolean;
}
interface GData {
  project: { id: number; name: string };
  tasks: GTask[]; critical_path: number[]; has_cycle: boolean;
  window: { start: string | null; end: string | null };
  counts: { total: number; dated: number; critical: number; undated: number };
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });
const DAY = 86400000;
const d = (s: string | null) => (s ? new Date(s + "T00:00:00") : null);
const fmt = (s: string | null) => (s ? new Date(s + "T00:00:00").toLocaleDateString(undefined, { day: "2-digit", month: "short" }) : "—");

export default function ProjectGantt() {
  const { id } = useParams<{ id: string }>();
  const { pt } = usePageTranslations();
  const [data, setData] = useState<GData | null>(null);
  const [loading, setLoading] = useState(true);
  const [onlyCritical, setOnlyCritical] = useState(false);

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/v1/projects/${id}/gantt/`, { headers: authHeaders() });
        if (r.ok) setData(await r.json());
      } finally { setLoading(false); }
    })();
  }, [id]);

  const { rows, minT, totalDays } = useMemo(() => {
    if (!data) return { rows: [] as GTask[], minT: 0, totalDays: 1 };
    let rows = data.tasks.filter((t) => t.start_date || t.due_date);
    if (onlyCritical) rows = rows.filter((t) => t.is_critical);
    const starts = rows.map((t) => d(t.start_date || t.due_date)!.getTime());
    const ends = rows.map((t) => d(t.due_date || t.start_date)!.getTime());
    const minT = starts.length ? Math.min(...starts) : Date.now();
    const maxT = ends.length ? Math.max(...ends) : minT + DAY;
    const totalDays = Math.max(1, Math.round((maxT - minT) / DAY) + 1);
    rows = [...rows].sort((a, b) => (d(a.start_date || a.due_date)!.getTime()) - (d(b.start_date || b.due_date)!.getTime()));
    return { rows, minT, totalDays };
  }, [data, onlyCritical]);

  const monthTicks = useMemo(() => {
    if (!rows.length) return [] as { left: number; label: string }[];
    const ticks: { left: number; label: string }[] = [];
    const start = new Date(minT);
    let cur = new Date(start.getFullYear(), start.getMonth(), 1);
    while (cur.getTime() <= minT + totalDays * DAY) {
      const off = (cur.getTime() - minT) / DAY;
      ticks.push({ left: Math.max(0, (off / totalDays) * 100), label: cur.toLocaleDateString(undefined, { month: "short", year: "2-digit" }) });
      cur = new Date(cur.getFullYear(), cur.getMonth() + 1, 1);
    }
    return ticks;
  }, [rows, minT, totalDays]);

  if (loading) return (
    <div className="space-y-4">
      <ProjectHeader projectId={id!} />
      <div className="flex items-center gap-2 px-1">
        <GanttChartSquare className="h-5 w-5 text-purple-300" />
        <Skeleton className="h-6 w-56" />
      </div>
      <Card className="p-4 space-y-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3">
            <Skeleton className="h-4 w-48 shrink-0" />
            <Skeleton className="h-6 rounded" style={{ width: `${30 + (i * 11) % 55}%`, marginLeft: `${(i * 7) % 30}%` }} />
          </div>
        ))}
      </Card>
    </div>
  );

  return (
    <div className="space-y-4">
      <ProjectHeader projectId={id!} />
      <div className="flex items-center justify-between flex-wrap gap-2 px-1">
        <div className="flex items-center gap-2">
          <GanttChartSquare className="h-5 w-5 text-purple-600" />
          <h1 className="text-xl font-bold">{pt("Timeline & Critical Path")}</h1>
        </div>
        {data && (
          <div className="flex items-center gap-3 text-xs text-muted-foreground">
            <span>{data.counts.dated} {pt("scheduled")}</span>
            <span className="flex items-center gap-1"><span className="inline-block w-3 h-2 rounded-sm bg-red-500" /> {data.counts.critical} {pt("critical")}</span>
            {data.counts.undated > 0 && <span>{data.counts.undated} {pt("undated (hidden)")}</span>}
            <button onClick={() => setOnlyCritical((v) => !v)}
              className={`px-2 py-1 rounded border ${onlyCritical ? "bg-red-50 border-red-300 text-red-700" : "hover:bg-accent"}`}>
              {onlyCritical ? pt("Show all") : pt("Critical path only")}
            </button>
          </div>
        )}
      </div>

      {data?.has_cycle && (
        <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg p-2.5">
          <AlertTriangle className="h-4 w-4" /> {pt("A circular dependency was detected — critical-path analysis is disabled until it is resolved.")}
        </div>
      )}

      {!rows.length ? (
        <Card className="p-10 text-center text-muted-foreground">
          <GanttChartSquare className="h-10 w-10 mx-auto mb-3 opacity-40" />
          {pt("No scheduled tasks yet. Add start and due dates to see them on the timeline.")}
        </Card>
      ) : (
        <Card className="p-0 overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[760px]">
              {/* month header */}
              <div className="relative h-7 border-b bg-muted/40 ml-[260px]">
                {monthTicks.map((t, i) => (
                  <div key={i} className="absolute top-0 h-7 border-l border-border/60 pl-1 text-[11px] text-muted-foreground" style={{ left: `${t.left}%` }}>{t.label}</div>
                ))}
              </div>
              {rows.map((t) => {
                const s = d(t.start_date || t.due_date)!.getTime();
                const e = d(t.due_date || t.start_date)!.getTime();
                const left = ((s - minT) / DAY / totalDays) * 100;
                const width = Math.max(1.2, ((e - s) / DAY + 1) / totalDays * 100);
                return (
                  <div key={t.id} className="flex items-center border-b last:border-0 hover:bg-accent/30">
                    <div className="w-[260px] shrink-0 px-3 py-2 min-w-0">
                      <div className="flex items-center gap-1.5">
                        {t.is_critical && <Flag className="h-3 w-3 text-red-500 shrink-0" />}
                        <span className="text-sm truncate" title={t.title}>{t.title}</span>
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">
                        {t.assigned_to_name || pt("Unassigned")}{t.slack != null && t.slack > 0 ? ` · ${pt("slack")} ${t.slack}d` : ""}
                      </div>
                    </div>
                    <div className="relative flex-1 h-9">
                      <div
                        className={`absolute top-1.5 h-6 rounded ${t.is_critical ? "bg-red-500/85" : "bg-purple-500/80"} ${t.status === "done" ? "opacity-50" : ""}`}
                        style={{ left: `${left}%`, width: `${width}%` }}
                        title={`${t.title}: ${fmt(t.start_date)} → ${fmt(t.due_date)} (${t.duration_days}d)`}
                      >
                        {t.progress > 0 && <div className="h-full bg-white/35 rounded-l" style={{ width: `${Math.min(100, t.progress)}%` }} />}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {data && !data.has_cycle && data.critical_path.length > 0 && (
        <Card className="p-3">
          <div className="flex items-center gap-2 mb-2 text-sm font-medium"><Flag className="h-4 w-4 text-red-500" /> {pt("Critical path")}</div>
          <div className="flex items-center gap-1.5 flex-wrap text-xs">
            {data.critical_path.map((cid, i) => {
              const t = data.tasks.find((x) => x.id === cid);
              if (!t) return null;
              return (
                <span key={cid} className="flex items-center gap-1.5">
                  <Badge variant="outline" className="border-red-300 text-red-700">{t.title}</Badge>
                  {i < data.critical_path.length - 1 && <span className="text-muted-foreground">→</span>}
                </span>
              );
            })}
          </div>
        </Card>
      )}
    </div>
  );
}
