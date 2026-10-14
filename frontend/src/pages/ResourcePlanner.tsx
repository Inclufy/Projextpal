import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Trash2, CalendarDays, Loader2 } from "lucide-react";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";

/**
 * Sprint 7 — S7-08 (base) + Sprint 9 — S9-04 (drag/resize)
 * --------------------------------------------------------
 * Gantt view of resource allocations per team-member on a project, with
 * a dialog-driven "+ Nieuwe allocatie" flow.
 *
 * S9-04: drag a bar horizontally to shift start+end together (keeps the
 * same duration), or drag either edge to resize start/end independently.
 * Snap to whole days. On pointer-up we PATCH the allocation; the UI uses
 * an optimistic update + reverts on 4xx/5xx.
 */

interface Allocation {
  id: number;
  project_team_id: number;
  start_date: string;
  end_date: string;
  allocated_hours: number;
  note: string;
}

interface MemberRow {
  project_team_id: number;
  user_id: number;
  user_name: string;
  allocations: Allocation[];
}

interface Payload {
  project_id: number;
  project_name: string;
  rows: MemberRow[];
  total_allocated_hours: number;
  member_count: number;
}

const defaultFetcher = (url: string, init?: RequestInit) => {
  const token = localStorage.getItem("access_token");
  return fetch(url, {
    credentials: "include",
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
  });
};

function dayDiff(a: string, b: string): number {
  const d1 = new Date(a);
  const d2 = new Date(b);
  return Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24));
}

function todayISO(): string {
  const d = new Date();
  d.setUTCHours(0, 0, 0, 0);
  return d.toISOString().slice(0, 10);
}

function addDaysISO(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

export default function ResourcePlanner() {
  const { pt } = usePageTranslations();
  const { id: projectId } = useParams<{ id: string }>();
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // dialog form state
  const [memberId, setMemberId] = useState<string>("");
  const [startDate, setStartDate] = useState(todayISO());
  const [endDate, setEndDate] = useState(addDaysISO(todayISO(), 4));
  const [hours, setHours] = useState("8");
  const [note, setNote] = useState("");
  const [saving, setSaving] = useState(false);

  const fetchPlan = async () => {
    if (!projectId) return;
    setLoading(true);
    try {
      const r = await defaultFetcher(`/api/v1/projects/${projectId}/resource-plan/`);
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const j = (await r.json()) as Payload;
      setData(j);
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlan();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projectId]);

  // Compute X-axis window: 7 days before the earliest allocation (or today)
  // until 7 days after the latest. Clamped to a 60-day sensible default.
  const window = useMemo(() => {
    const allAllocs = data?.rows.flatMap((r) => r.allocations) || [];
    if (allAllocs.length === 0) {
      return { start: todayISO(), end: addDaysISO(todayISO(), 29) };
    }
    const minStart = allAllocs.reduce((m, a) => (a.start_date < m ? a.start_date : m), allAllocs[0].start_date);
    const maxEnd = allAllocs.reduce((m, a) => (a.end_date > m ? a.end_date : m), allAllocs[0].end_date);
    return {
      start: addDaysISO(minStart, -3),
      end: addDaysISO(maxEnd, 3),
    };
  }, [data]);

  const spanDays = Math.max(1, dayDiff(window.start, window.end) + 1);

  const colorForMember = (idx: number) => {
    const palette = [
      "bg-sky-500",
      "bg-emerald-500",
      "bg-amber-500",
      "bg-fuchsia-500",
      "bg-indigo-500",
      "bg-teal-500",
      "bg-rose-500",
    ];
    return palette[idx % palette.length];
  };

  const openNewDialog = () => {
    setMemberId(data?.rows[0]?.project_team_id.toString() || "");
    setStartDate(todayISO());
    setEndDate(addDaysISO(todayISO(), 4));
    setHours("8");
    setNote("");
    setDialogOpen(true);
  };

  const saveAllocation = async () => {
    if (!projectId || !memberId) return;
    setSaving(true);
    try {
      const r = await defaultFetcher(`/api/v1/projects/${projectId}/resource-plan/`, {
        method: "POST",
        body: JSON.stringify({
          project_team_id: Number(memberId),
          start_date: startDate,
          end_date: endDate,
          allocated_hours: hours,
          note,
        }),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        toast.error(err.detail || pt("Opslaan mislukt"));
        return;
      }
      toast.success(pt("Allocatie toegevoegd"));
      setDialogOpen(false);
      fetchPlan();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : pt("Opslaan mislukt"));
    } finally {
      setSaving(false);
    }
  };

  const deleteAllocation = async (allocationId: number) => {
    try {
      const r = await defaultFetcher(`/api/v1/execution/resource-plan/${allocationId}/`, {
        method: "DELETE",
      });
      if (!r.ok && r.status !== 204) {
        toast.error(pt("Verwijderen mislukt"));
        return;
      }
      toast.success(pt("Allocatie verwijderd"));
      fetchPlan();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : pt("Verwijderen mislukt"));
    }
  };

  const barStyle = (a: Allocation): React.CSSProperties => {
    const leftDays = Math.max(0, dayDiff(window.start, a.start_date));
    const widthDays = Math.max(1, dayDiff(a.start_date, a.end_date) + 1);
    return {
      left: `${(leftDays / spanDays) * 100}%`,
      width: `${(widthDays / spanDays) * 100}%`,
    };
  };

  // -----------------------------------------------------------------
  // Sprint 9 — S9-04 drag/resize for Gantt allocation blocks
  // -----------------------------------------------------------------

  // Transient drag overrides keyed by allocation id. While a drag is in
  // flight we render against these instead of the backing state so the
  // bar follows the pointer, then clear on pointer-up (optimistic patch
  // merges into `data`, revert on error).
  const [dragOverrides, setDragOverrides] = useState<
    Record<number, { start_date: string; end_date: string }>
  >({});
  // Row refs keyed by project_team_id — gives us the pixel-width of the
  // gantt track so we can convert pointer-delta → day-delta.
  const rowTrackRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const effectiveAlloc = (a: Allocation): Allocation => {
    const ov = dragOverrides[a.id];
    return ov ? { ...a, start_date: ov.start_date, end_date: ov.end_date } : a;
  };

  const patchAllocation = async (
    allocation: Allocation,
    newStart: string,
    newEnd: string,
    originalStart: string,
    originalEnd: string,
  ) => {
    try {
      const r = await defaultFetcher(
        `/api/v1/execution/resource-plan/${allocation.id}/`,
        {
          method: "PATCH",
          body: JSON.stringify({ start_date: newStart, end_date: newEnd }),
        },
      );
      if (!r.ok) {
        // Revert the optimistic state in the backing data.
        setData((prev) => {
          if (!prev) return prev;
          return {
            ...prev,
            rows: prev.rows.map((row) => ({
              ...row,
              allocations: row.allocations.map((al) =>
                al.id === allocation.id
                  ? { ...al, start_date: originalStart, end_date: originalEnd }
                  : al,
              ),
            })),
          };
        });
        const err = await r.json().catch(() => ({}));
        toast.error(err.detail || pt("Opslaan mislukt"));
        return;
      }
      toast.success(pt("Allocatie bijgewerkt"));
    } catch (e) {
      // Network / exception path — revert.
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          rows: prev.rows.map((row) => ({
            ...row,
            allocations: row.allocations.map((al) =>
              al.id === allocation.id
                ? { ...al, start_date: originalStart, end_date: originalEnd }
                : al,
            ),
          })),
        };
      });
      toast.error(e instanceof Error ? e.message : pt("Opslaan mislukt"));
    }
  };

  type DragMode = "move" | "resize-start" | "resize-end";

  const beginDrag = (
    event: React.PointerEvent<HTMLDivElement>,
    row: MemberRow,
    allocation: Allocation,
    mode: DragMode,
  ) => {
    event.preventDefault();
    event.stopPropagation();
    const track = rowTrackRefs.current[row.project_team_id];
    if (!track) return;
    const rect = track.getBoundingClientRect();
    if (rect.width <= 0) return;

    const originalStart = allocation.start_date;
    const originalEnd = allocation.end_date;
    const originalDuration = Math.max(0, dayDiff(originalStart, originalEnd));
    const startX = event.clientX;
    const pxPerDay = rect.width / spanDays;

    // Target just this element so the handle keeps catching move events
    // once the pointer leaves the bar.
    const target = event.currentTarget;
    try {
      target.setPointerCapture(event.pointerId);
    } catch {
      // some browsers refuse capture on non-primary pointers — ignore.
    }

    let liveStart = originalStart;
    let liveEnd = originalEnd;

    const handleMove = (ev: PointerEvent) => {
      const dxPx = ev.clientX - startX;
      const dxDays = Math.round(dxPx / pxPerDay);
      if (mode === "move") {
        liveStart = addDaysISO(originalStart, dxDays);
        liveEnd = addDaysISO(originalEnd, dxDays);
      } else if (mode === "resize-start") {
        const newStart = addDaysISO(originalStart, dxDays);
        // Keep at least 1 day of width (start <= end).
        liveStart =
          dayDiff(newStart, originalEnd) >= 0
            ? newStart
            : addDaysISO(originalEnd, 0);
        liveEnd = originalEnd;
      } else {
        const newEnd = addDaysISO(originalEnd, dxDays);
        liveStart = originalStart;
        liveEnd =
          dayDiff(originalStart, newEnd) >= 0
            ? newEnd
            : addDaysISO(originalStart, 0);
      }
      setDragOverrides((prev) => ({
        ...prev,
        [allocation.id]: { start_date: liveStart, end_date: liveEnd },
      }));
    };

    const handleUp = async () => {
      target.removeEventListener("pointermove", handleMove);
      target.removeEventListener("pointerup", handleUp);
      target.removeEventListener("pointercancel", handleUp);
      try {
        target.releasePointerCapture(event.pointerId);
      } catch {
        // ignore — not every browser lets us release.
      }
      // Clear the transient override.
      setDragOverrides((prev) => {
        const { [allocation.id]: _dropped, ...rest } = prev;
        return rest;
      });

      // No change → no network call.
      if (liveStart === originalStart && liveEnd === originalEnd) return;

      // Guard: never submit end < start (shouldn't happen with the
      // clamps above, but belt-and-braces).
      if (dayDiff(liveStart, liveEnd) < 0) return;

      // Keep the resize mode honest about duration preservation for 'move'.
      if (
        mode === "move" &&
        Math.max(0, dayDiff(liveStart, liveEnd)) !== originalDuration
      ) {
        liveEnd = addDaysISO(liveStart, originalDuration);
      }

      // Optimistic commit into `data` so the bar stays put without re-fetch.
      setData((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          rows: prev.rows.map((rr) => ({
            ...rr,
            allocations: rr.allocations.map((al) =>
              al.id === allocation.id
                ? { ...al, start_date: liveStart, end_date: liveEnd }
                : al,
            ),
          })),
        };
      });

      await patchAllocation(
        allocation,
        liveStart,
        liveEnd,
        originalStart,
        originalEnd,
      );
    };

    target.addEventListener("pointermove", handleMove);
    target.addEventListener("pointerup", handleUp);
    target.addEventListener("pointercancel", handleUp);
  };

  if (loading) {
    return (
      <div className="p-6 text-sm text-muted-foreground">
        <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
        {pt("Laden...")}
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="p-4">
          <p className="text-sm text-red-600">{pt("Kon planner niet laden")}: {error}</p>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      {projectId && <ProjectHeader projectId={projectId} />}

      <Card className="p-4">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <CalendarDays className="w-5 h-5" />
              {pt("Resource planner")}
            </h2>
            <p className="text-xs text-muted-foreground">
              {pt("Totaal gepland")}: {data?.total_allocated_hours || 0}{pt("u")} {pt("voor")} {data?.member_count || 0} {pt("mensen")}
            </p>
          </div>
          <Button onClick={openNewDialog} data-testid="new-allocation">
            <Plus className="w-4 h-4 mr-1" />
            {pt("Nieuwe allocatie")}
          </Button>
        </div>

        {!data || data.rows.length === 0 ? (
          <div className="text-sm text-muted-foreground py-8 text-center">
            {pt("Nog geen allocaties — plan een persoon in de tijd via +")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <div className="min-w-[600px]">
              {/* Header: date range summary */}
              <div className="flex text-xs text-muted-foreground mb-2 border-b pb-1">
                <div className="w-40 shrink-0">{pt("Team-lid")}</div>
                <div className="flex-1 flex justify-between">
                  <span>{window.start}</span>
                  <span>{window.end}</span>
                </div>
              </div>
              {data.rows.map((row, idx) => (
                <div key={row.project_team_id} className="flex items-center min-h-[48px] border-b border-dashed last:border-b-0">
                  <div className="w-40 shrink-0 pr-2 text-sm font-medium truncate" title={row.user_name}>
                    {row.user_name}
                  </div>
                  <div
                    className="flex-1 relative h-10"
                    ref={(el) => {
                      rowTrackRefs.current[row.project_team_id] = el;
                    }}
                  >
                    {row.allocations.length === 0 && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {pt("Geen allocaties")}
                      </span>
                    )}
                    {row.allocations.map((rawA) => {
                      const a = effectiveAlloc(rawA);
                      return (
                        <div
                          key={a.id}
                          className={`absolute top-1/2 -translate-y-1/2 h-6 rounded ${colorForMember(idx)} opacity-90 flex items-center px-2 group hover:opacity-100 cursor-grab active:cursor-grabbing touch-none select-none`}
                          style={barStyle(a)}
                          title={`${a.allocated_hours}${pt("u")} — ${row.user_name}${a.note ? ` — ${a.note}` : ""} (${a.start_date} → ${a.end_date})`}
                          onPointerDown={(e) => {
                            if (e.button !== 0) return;
                            beginDrag(e, row, rawA, "move");
                          }}
                          data-testid={`alloc-bar-${a.id}`}
                        >
                          {/* Left resize handle */}
                          <div
                            className="absolute left-0 top-0 bottom-0 w-1.5 cursor-ew-resize bg-white/30 opacity-0 group-hover:opacity-100 rounded-l"
                            onPointerDown={(e) => {
                              if (e.button !== 0) return;
                              beginDrag(e, row, rawA, "resize-start");
                            }}
                            aria-label={pt("Startdatum verschuiven")}
                            data-testid={`alloc-resize-start-${a.id}`}
                          />
                          <span className="text-xs text-white truncate flex-1 pointer-events-none">
                            {a.allocated_hours}{pt("u")}{a.note ? ` · ${a.note}` : ""}
                          </span>
                          <button
                            type="button"
                            className="ml-1 text-white opacity-0 group-hover:opacity-100 shrink-0"
                            onPointerDown={(e) => e.stopPropagation()}
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteAllocation(a.id);
                            }}
                            aria-label={pt("Verwijderen")}
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                          {/* Right resize handle */}
                          <div
                            className="absolute right-0 top-0 bottom-0 w-1.5 cursor-ew-resize bg-white/30 opacity-0 group-hover:opacity-100 rounded-r"
                            onPointerDown={(e) => {
                              if (e.button !== 0) return;
                              beginDrag(e, row, rawA, "resize-end");
                            }}
                            aria-label={pt("Einddatum verschuiven")}
                            data-testid={`alloc-resize-end-${a.id}`}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{pt("Nieuwe allocatie")}</DialogTitle>
            <DialogDescription>
              {pt("Plan een team-lid in op dit project voor een periode.")}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label>{pt("Team-lid")}</Label>
              <Select value={memberId} onValueChange={setMemberId}>
                <SelectTrigger>
                  <SelectValue placeholder={pt("Selecteer team-lid")} />
                </SelectTrigger>
                <SelectContent>
                  {data?.rows.map((r) => (
                    <SelectItem key={r.project_team_id} value={r.project_team_id.toString()}>
                      {r.user_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {data?.rows.length === 0 && (
                <p className="text-xs text-muted-foreground mt-1">
                  {pt("Geen team-leden op dit project. Voeg eerst leden toe via het team-overzicht.")}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>{pt("Start")}</Label>
                <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
              </div>
              <div>
                <Label>{pt("Eind")}</Label>
                <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
              </div>
            </div>
            <div>
              <Label>{pt("Uren")}</Label>
              <Input type="number" step="0.5" min="0" value={hours} onChange={(e) => setHours(e.target.value)} />
            </div>
            <div>
              <Label>{pt("Notitie")}</Label>
              <Input placeholder={pt("Bijv. ontwerp fase")} value={note} onChange={(e) => setNote(e.target.value)} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              {pt("Annuleer")}
            </Button>
            <Button onClick={saveAllocation} disabled={saving || !memberId}>
              {saving ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              {pt("Opslaan")}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
