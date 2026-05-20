import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface TaskKpi {
  today: number;
  tomorrow: number;
  this_week: number;
  next_week: number;
  overdue: number;
  total: number;
  completed: number;
  as_of: string;
}

interface Props {
  projectId: number | string;
  /** Fetcher injected by the host page so we don't hard-code an HTTP client. */
  fetcher?: (url: string) => Promise<Response>;
  className?: string;
}

const DEFAULT_FETCHER = (url: string) =>
  fetch(url, { credentials: "include" });

const TILE_CONFIG: Array<{
  key: keyof Omit<TaskKpi, "as_of">;
  label: string;
  tone: "neutral" | "info" | "warning" | "danger" | "success";
}> = [
  { key: "today",     label: "Today",     tone: "info" },
  { key: "tomorrow",  label: "Tomorrow",  tone: "neutral" },
  { key: "this_week", label: "This Week", tone: "neutral" },
  { key: "next_week", label: "Next Week", tone: "neutral" },
  { key: "overdue",   label: "Overdue",   tone: "danger" },
  { key: "completed", label: "Completed", tone: "success" },
];

const TONE_CLASS: Record<string, string> = {
  neutral: "bg-slate-50 text-slate-900 border-slate-200",
  info:    "bg-sky-50 text-sky-900 border-sky-200",
  warning: "bg-amber-50 text-amber-900 border-amber-200",
  danger:  "bg-red-50 text-red-900 border-red-200",
  success: "bg-emerald-50 text-emerald-900 border-emerald-200",
};

/**
 * Yanmar Action Tracker KPI tiles for a single project.
 *
 * Matches the COUNTIFS roll-ups in `Action Tracker Checklist.xlsx`:
 *   Today, Tomorrow, This Week, Next Week, Overdue, Completed.
 *
 * Pulls from `/api/v1/projects/<id>/task-kpi/`.
 */
export function TaskKpiTiles({
  projectId,
  fetcher = DEFAULT_FETCHER,
  className,
}: Props) {
  const [data, setData] = useState<TaskKpi | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetcher(`/api/v1/projects/${projectId}/task-kpi/`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j: TaskKpi) => {
        if (!cancelled) setData(j);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [projectId, fetcher]);

  if (loading) {
    return (
      <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2", className)}>
        {TILE_CONFIG.map((t) => (
          <div
            key={t.key}
            className="h-20 rounded-md border border-slate-200 bg-slate-50 animate-pulse"
            aria-label={`${t.label} loading`}
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className={cn("text-sm text-red-700", className)} role="alert">
        Failed to load KPIs: {error}
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className={cn("grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2", className)}>
      {TILE_CONFIG.map((t) => {
        const value = data[t.key];
        return (
          <div
            key={t.key}
            className={cn(
              "rounded-md border px-3 py-2 flex flex-col",
              TONE_CLASS[t.tone],
            )}
            title={`${t.label} tasks (effective due date)`}
          >
            <span className="text-[11px] uppercase tracking-wide opacity-70">
              {t.label}
            </span>
            <span className="text-2xl font-semibold leading-tight mt-1">
              {value}
            </span>
            <span className="text-[10px] opacity-50 mt-auto">
              of {data.total}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export default TaskKpiTiles;
