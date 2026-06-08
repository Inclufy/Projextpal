import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Repeat, Trash2, Plus, Play, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface Rule {
  id: number; title: string; frequency: string; interval: number;
  next_run_date: string; start_date: string; end_date: string | null;
  priority: string; assigned_to: number | null; assigned_to_name: string | null;
  due_offset_days: number; active: boolean;
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });
const jsonHeaders = () => ({ ...authHeaders(), "Content-Type": "application/json" });
const FREQ = [["daily", "day(s)"], ["weekly", "week(s)"], ["monthly", "month(s)"]];
const PRIO = [["low", "Low"], ["medium", "Medium"], ["high", "High"], ["urgent", "Urgent"]];
const today = () => new Date().toISOString().slice(0, 10);

export default function RecurringTasksDialog({
  open, onOpenChange, projectId, users = [], onChanged,
}: {
  open: boolean; onOpenChange: (v: boolean) => void; projectId: string | number;
  users?: any[]; onChanged?: () => void;
}) {
  const [rules, setRules] = useState<Rule[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [draft, setDraft] = useState<any>({ title: "", frequency: "weekly", interval: 1, priority: "medium", assigned_to: "", start_date: today(), due_offset_days: 0 });

  const load = async () => {
    setLoading(true);
    try {
      const r = await fetch(`/api/v1/projects/recurring-tasks/?project=${projectId}`, { headers: authHeaders() });
      if (r.ok) { const d = await r.json(); setRules(Array.isArray(d) ? d : d.results || []); }
    } finally { setLoading(false); }
  };
  useEffect(() => { if (open) load(); }, [open, projectId]);

  const create = async () => {
    if (!draft.title.trim()) { toast.error("Give the recurring task a title"); return; }
    setBusy(true);
    try {
      const body = {
        project: Number(projectId), title: draft.title, frequency: draft.frequency,
        interval: Number(draft.interval) || 1, priority: draft.priority,
        assigned_to: draft.assigned_to ? Number(draft.assigned_to) : null,
        start_date: draft.start_date, next_run_date: draft.start_date,
        due_offset_days: Number(draft.due_offset_days) || 0,
      };
      const r = await fetch(`/api/v1/projects/recurring-tasks/`, { method: "POST", headers: jsonHeaders(), body: JSON.stringify(body) });
      if (r.ok) { toast.success("Recurring task added"); setDraft({ ...draft, title: "" }); load(); }
      else { const e = await r.json().catch(() => ({})); toast.error(e.detail || "Could not save"); }
    } finally { setBusy(false); }
  };

  const remove = async (rule: Rule) => {
    if (!window.confirm(`Stop recurring "${rule.title}"? Already-generated tasks stay.`)) return;
    const r = await fetch(`/api/v1/projects/recurring-tasks/${rule.id}/`, { method: "DELETE", headers: authHeaders() });
    if (r.ok || r.status === 204) load(); else toast.error("Delete failed");
  };

  const runNow = async (rule: Rule) => {
    const r = await fetch(`/api/v1/projects/recurring-tasks/${rule.id}/run-now/`, { method: "POST", headers: jsonHeaders() });
    if (r.ok) { toast.success(`Generated "${rule.title}"`); load(); onChanged?.(); }
    else toast.error("Could not generate");
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[85vh] overflow-y-auto">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Repeat className="h-5 w-5 text-purple-600" /> Recurring tasks</DialogTitle></DialogHeader>
        <p className="text-sm text-muted-foreground">
          A rule generates a task automatically each period. The next one is created on its run date; you can also generate it now.
        </p>

        <div className="space-y-2">
          {loading ? <p className="text-sm text-muted-foreground">Loading…</p>
            : rules.length === 0 ? <p className="text-sm text-muted-foreground">No recurring tasks yet.</p>
            : rules.map((r) => (
              <div key={r.id} className="flex items-center gap-2 border rounded-lg p-2.5">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{r.title}</div>
                  <div className="text-xs text-muted-foreground">
                    Every {r.interval} {FREQ.find((f) => f[0] === r.frequency)?.[1]} · next {r.next_run_date}
                    {r.assigned_to_name ? ` · ${r.assigned_to_name}` : ""}{!r.active ? " · ended" : ""}
                  </div>
                </div>
                <Button size="icon" variant="ghost" title="Generate now" onClick={() => runNow(r)}><Play className="h-4 w-4 text-green-600" /></Button>
                <Button size="icon" variant="ghost" title="Stop" onClick={() => remove(r)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            ))}
        </div>

        <div className="border-t pt-3 space-y-3">
          <div className="space-y-1">
            <Label>Title</Label>
            <Input value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} placeholder="e.g. Weekly status update" />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label>Every</Label>
              <Input type="number" min={1} value={draft.interval} onChange={(e) => setDraft({ ...draft, interval: e.target.value })} />
            </div>
            <div className="space-y-1 col-span-2">
              <Label>Period</Label>
              <Select value={draft.frequency} onValueChange={(v) => setDraft({ ...draft, frequency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{FREQ.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label>Starts</Label>
              <Input type="date" value={draft.start_date} onChange={(e) => setDraft({ ...draft, start_date: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Priority</Label>
              <Select value={draft.priority} onValueChange={(v) => setDraft({ ...draft, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{PRIO.map(([v, l]) => <SelectItem key={v} value={v}>{l}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          {users.length > 0 && (
            <div className="space-y-1">
              <Label>Owner (optional)</Label>
              <Select value={draft.assigned_to || "__none__"} onValueChange={(v) => setDraft({ ...draft, assigned_to: v === "__none__" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— none —</SelectItem>
                  {users.map((u) => <SelectItem key={u.id} value={String(u.id)}>{u.first_name || u.email || `#${u.id}`}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
          )}
          <Button onClick={create} disabled={busy || !draft.title.trim()}>
            {busy && <Loader2 className="h-4 w-4 animate-spin mr-2" />}<Plus className="h-4 w-4 mr-1" /> Add recurring task
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
