import React, { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { ListChecks, Plus, CheckCircle2, RotateCcw, AlertTriangle, Loader2, User } from "lucide-react";

export interface MeetingRef { id: string; title: string }
export interface ActionUser { id: number; email: string; first_name?: string; last_name?: string }

interface MeetingAction {
  id: string;
  meeting: string;
  description: string;
  owner: number | null;
  owner_name: string | null;
  due_date: string | null;
  status: string;
  closed_at: string | null;
  is_overdue: boolean;
}

const STATUS_COLORS: Record<string, string> = {
  open: "bg-blue-100 text-blue-700",
  in_progress: "bg-purple-100 text-purple-700",
  done: "bg-green-100 text-green-700",
  cancelled: "bg-gray-100 text-gray-600",
};

const NONE = "__none__";

/**
 * Tracked-actions panel for governance meetings (P0-2). Minutes used to be
 * dead text; this surfaces follow-ups with an owner, a due date, an overdue
 * flag, and a close/reopen lifecycle — each backed by the meeting-actions API.
 */
const MeetingActionsPanel: React.FC<{ meetings: MeetingRef[]; users?: ActionUser[] }> = ({ meetings, users = [] }) => {
  const { toast } = useToast();
  const { pt } = usePageTranslations();
  const [actions, setActions] = useState<MeetingAction[]>([]);
  const [loading, setLoading] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ meeting: "", description: "", owner: "", due_date: "" });

  const token = localStorage.getItem("access_token");
  const headers = { "Content-Type": "application/json", Authorization: `Bearer ${token}` };

  const meetingIds = meetings.map((m) => m.id).join(",");
  const meetingTitle = (mid: string) => meetings.find((m) => m.id === mid)?.title || pt("Meeting");

  const fetchActions = useCallback(async () => {
    if (meetings.length === 0) { setActions([]); return; }
    setLoading(true);
    try {
      // One request per meeting (the API filters by a single meeting id), merged.
      const results = await Promise.all(
        meetings.map((m) =>
          fetch(`/api/v1/governance/meeting-actions/?meeting=${m.id}`, { headers })
            .then((r) => (r.ok ? r.json() : []))
            .then((d) => (Array.isArray(d) ? d : d.results || []))
            .catch(() => [])
        )
      );
      setActions(results.flat());
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [meetingIds]);

  useEffect(() => { fetchActions(); }, [fetchActions]);

  const openForm = () => {
    setForm({ meeting: meetings[0]?.id || "", description: "", owner: "", due_date: "" });
    setShowForm(true);
  };

  const handleAdd = async () => {
    if (!form.meeting) { toast({ title: pt("Error"), description: pt("Pick a meeting"), variant: "destructive" }); return; }
    if (!form.description.trim()) { toast({ title: pt("Error"), description: pt("Description is required"), variant: "destructive" }); return; }
    setSubmitting(true);
    try {
      const body: any = { meeting: form.meeting, description: form.description.trim() };
      if (form.owner) body.owner = parseInt(form.owner);
      if (form.due_date) body.due_date = form.due_date;
      const r = await fetch(`/api/v1/governance/meeting-actions/`, { method: "POST", headers, body: JSON.stringify(body) });
      if (r.ok) {
        toast({ title: pt("Added"), description: pt("Action tracked.") });
        setShowForm(false);
        fetchActions();
      } else {
        const err = await r.json().catch(() => ({}));
        const msg = err?.meeting?.[0] || err?.detail || JSON.stringify(err) || pt("Save failed");
        toast({ title: pt("Error"), description: msg, variant: "destructive" });
      }
    } catch {
      toast({ title: pt("Error"), description: pt("Save failed"), variant: "destructive" });
    } finally {
      setSubmitting(false);
    }
  };

  const setStatus = async (a: MeetingAction, status: string) => {
    setBusyId(a.id);
    try {
      const r = await fetch(`/api/v1/governance/meeting-actions/${a.id}/`, {
        method: "PATCH", headers, body: JSON.stringify({ status }),
      });
      if (r.ok) {
        fetchActions();
      } else {
        toast({ title: pt("Error"), description: pt("Update failed"), variant: "destructive" });
      }
    } catch {
      toast({ title: pt("Error"), description: pt("Update failed"), variant: "destructive" });
    } finally {
      setBusyId(null);
    }
  };

  const userLabel = (u: ActionUser) =>
    `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email;

  const overdueCount = actions.filter((a) => a.is_overdue).length;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5 text-amber-600" /> {pt("Tracked Actions")}
            {actions.length > 0 && <Badge variant="outline">{actions.length}</Badge>}
            {overdueCount > 0 && (
              <Badge className="bg-red-100 text-red-700 gap-1">
                <AlertTriangle className="w-3 h-3" /> {overdueCount} {pt("overdue")}
              </Badge>
            )}
          </CardTitle>
          <Button size="sm" onClick={openForm} disabled={meetings.length === 0}>
            <Plus className="w-4 h-4 mr-2" /> {pt("Add Action")}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {showForm && (
          <div className="mb-4 p-3 border rounded-lg space-y-3 bg-muted/30">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">{pt("Meeting")}</label>
                <Select value={form.meeting} onValueChange={(v) => setForm({ ...form, meeting: v })}>
                  <SelectTrigger><SelectValue placeholder={pt("Select meeting")} /></SelectTrigger>
                  <SelectContent>
                    {meetings.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-xs font-medium">{pt("Owner")}</label>
                <Select value={form.owner || NONE} onValueChange={(v) => setForm({ ...form, owner: v === NONE ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder={pt("Unassigned")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value={NONE}>{pt("Unassigned")}</SelectItem>
                    {users.map((u) => (
                      <SelectItem key={u.id} value={String(u.id)}>{userLabel(u)}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <Textarea
              rows={2}
              placeholder={pt("What needs to happen?")}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
            <div className="flex items-end gap-3">
              <div className="space-y-1">
                <label className="text-xs font-medium">{pt("Due date")}</label>
                <Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
              </div>
              <div className="flex gap-2 ml-auto">
                <Button variant="outline" size="sm" onClick={() => setShowForm(false)}>{pt("Cancel")}</Button>
                <Button size="sm" onClick={handleAdd} disabled={submitting}>
                  {submitting && <Loader2 className="w-4 h-4 animate-spin mr-2" />}{pt("Save")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-6"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>
        ) : actions.length === 0 ? (
          <p className="text-gray-500 text-center py-6 text-sm">
            {meetings.length === 0
              ? pt("No meetings yet — schedule one to track its actions.")
              : pt("No actions tracked yet. Add follow-ups from meeting minutes here.")}
          </p>
        ) : (
          <div className="space-y-2">
            {actions.map((a) => {
              const closed = a.status === "done" || a.status === "cancelled";
              return (
                <div key={a.id} className={`flex items-start justify-between gap-3 p-3 border rounded-lg ${a.is_overdue ? "border-red-200 bg-red-50" : ""}`}>
                  <div className="min-w-0">
                    <p className={`text-sm ${closed ? "line-through text-muted-foreground" : ""}`}>{a.description}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap text-xs">
                      <Badge variant="outline" className="text-[10px]">{meetingTitle(a.meeting)}</Badge>
                      <Badge className={`text-[10px] ${STATUS_COLORS[a.status] || ""}`}>{a.status.replace("_", " ")}</Badge>
                      {a.is_overdue && (
                        <Badge className="bg-red-100 text-red-700 text-[10px] gap-1">
                          <AlertTriangle className="w-3 h-3" /> {pt("overdue")}
                        </Badge>
                      )}
                      {a.owner_name && (
                        <span className="flex items-center gap-1 text-muted-foreground">
                          <User className="w-3 h-3" /> {a.owner_name}
                        </span>
                      )}
                      {a.due_date && (
                        <span className="text-muted-foreground">{pt("due")} {new Date(a.due_date).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>
                  <div className="shrink-0">
                    {closed ? (
                      <Button variant="ghost" size="sm" disabled={busyId === a.id} onClick={() => setStatus(a, "open")} title={pt("Re-open")}>
                        {busyId === a.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                      </Button>
                    ) : (
                      <Button variant="ghost" size="sm" disabled={busyId === a.id} onClick={() => setStatus(a, "done")} title={pt("Mark done")}>
                        {busyId === a.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <CheckCircle2 className="w-3.5 h-3.5 text-green-600" />}
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default MeetingActionsPanel;
