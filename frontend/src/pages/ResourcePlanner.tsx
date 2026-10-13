import { useEffect, useMemo, useState } from "react";
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
 * Sprint 7 — S7-08
 * ----------------
 * Read-only Gantt view of resource allocations per team-member on a project,
 * with a dialog-driven "+ Nieuwe allocatie" flow. Drag/resize = Sprint 8.
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
                  <div className="flex-1 relative h-10">
                    {row.allocations.length === 0 && (
                      <span className="absolute left-0 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
                        {pt("Geen allocaties")}
                      </span>
                    )}
                    {row.allocations.map((a) => (
                      <div
                        key={a.id}
                        className={`absolute top-1/2 -translate-y-1/2 h-6 rounded ${colorForMember(idx)} opacity-90 flex items-center px-2 group hover:opacity-100 cursor-pointer`}
                        style={barStyle(a)}
                        title={`${a.allocated_hours}${pt("u")} — ${row.user_name}${a.note ? ` — ${a.note}` : ""}`}
                      >
                        <span className="text-xs text-white truncate flex-1">
                          {a.allocated_hours}{pt("u")}{a.note ? ` · ${a.note}` : ""}
                        </span>
                        <button
                          type="button"
                          className="ml-1 text-white opacity-0 group-hover:opacity-100 shrink-0"
                          onClick={() => deleteAllocation(a.id)}
                          aria-label={pt("Verwijderen")}
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
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
