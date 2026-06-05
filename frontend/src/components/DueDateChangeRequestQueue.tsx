import { useEffect, useState, useCallback } from "react";
import { cn } from "@/lib/utils";

export interface DueDateChangeRequest {
  id: number;
  task: number;
  task_title: string;
  project_id: number;
  requested_by: number | null;
  requested_by_email: string | null;
  requested_date: string;            // YYYY-MM-DD
  previous_due_date: string | null;
  delta_days: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  decided_by_email: string | null;
  decided_at: string | null;
  decision_note: string;
  created_at: string;
  updated_at: string;
}

interface Props {
  projectId: number | string;
  /** Only Project Owner / Admin sees the action buttons. */
  canDecide?: boolean;
  fetcher?: (url: string, init?: RequestInit) => Promise<Response>;
  className?: string;
}

const DEFAULT_FETCHER: Props["fetcher"] = (url, init) => {
  const token = localStorage.getItem("access_token");
  return fetch(url, {
    credentials: "include",
    ...(init ?? {}),
    headers: {
      ...((init?.headers as Record<string, string>) ?? {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });
};

/**
 * Project Owner queue of pending due-date push-back requests.
 * Backend: GET/POST /api/v1/projects/task-due-change-requests/
 */
export function DueDateChangeRequestQueue({
  projectId,
  canDecide = false,
  fetcher = DEFAULT_FETCHER,
  className,
}: Props) {
  const [items, setItems] = useState<DueDateChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setLoading(true);
    fetcher(
      `/api/v1/projects/task-due-change-requests/?project=${projectId}&status=pending`
    )
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j: { results?: DueDateChangeRequest[] } | DueDateChangeRequest[]) => {
        setItems(Array.isArray(j) ? j : j.results ?? []);
      })
      .catch((e: unknown) =>
        setError(e instanceof Error ? e.message : String(e)),
      )
      .finally(() => setLoading(false));
  }, [projectId, fetcher]);

  useEffect(load, [load]);

  const decide = async (id: number, action: "approve" | "reject") => {
    const note = window.prompt(
      action === "approve"
        ? "Optional note for approval:"
        : "Reason for rejection:",
    );
    if (note === null) return;
    setBusy(id);
    try {
      const r = await fetcher(
        `/api/v1/projects/task-due-change-requests/${id}/${action}/`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ decision_note: note }),
        },
      );
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      load();
    } catch (e) {
      alert(`Failed: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      setBusy(null);
    }
  };

  if (loading)
    return (
      <div className={cn("h-24 rounded-md bg-slate-50 animate-pulse", className)} />
    );
  if (error)
    return (
      <div className={cn("text-sm text-red-700", className)}>{error}</div>
    );
  if (items.length === 0)
    return (
      <div className={cn("text-sm text-slate-500 italic", className)}>
        No pending due-date change requests.
      </div>
    );

  return (
    <div className={cn("space-y-2", className)}>
      <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
        Pending due-date changes
        <span className="ml-2 inline-flex items-center justify-center text-[10px] bg-amber-200 text-amber-900 rounded-full px-2 py-0.5">
          {items.length}
        </span>
      </h3>
      <ul className="divide-y rounded-md border border-slate-200 bg-white">
        {items.map((r) => (
          <li key={r.id} className="p-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium truncate" title={r.task_title}>
                {r.task_title}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">
                {r.requested_by_email ?? "—"} requests{" "}
                <span className="font-mono">{r.previous_due_date}</span> →{" "}
                <span className="font-mono">{r.requested_date}</span>{" "}
                <span className={cn(
                  "ml-1 inline-block rounded-sm px-1.5 py-0.5 text-[10px]",
                  r.delta_days > 14
                    ? "bg-red-100 text-red-800"
                    : "bg-amber-100 text-amber-800",
                )}>
                  +{r.delta_days}d
                </span>
              </div>
              {r.reason && (
                <div className="text-xs text-slate-600 italic mt-1">“{r.reason}”</div>
              )}
            </div>
            {canDecide && (
              <div className="flex gap-2 shrink-0">
                <button
                  type="button"
                  disabled={busy === r.id}
                  onClick={() => decide(r.id, "approve")}
                  className="px-3 py-1 text-xs rounded-md bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busy === r.id}
                  onClick={() => decide(r.id, "reject")}
                  className="px-3 py-1 text-xs rounded-md bg-slate-200 text-slate-900 hover:bg-slate-300 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default DueDateChangeRequestQueue;
