import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Target, Trash2, Play, CheckCircle2, Flag, ArrowRightCircle, Rocket } from "lucide-react";
import { toast } from "sonner";

// Machine-readable commit errors → friendly messages.
const COMMIT_ERRORS: Record<string, string> = {
  sprint_goal_required: "Enter a Sprint Goal before committing the plan.",
  no_items_selected: "Select at least one backlog item to commit.",
  invalid_items: "One or more selected items don't belong to this backlog.",
};

const ScrumSprintPlanning = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [plannings, setPlannings] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ sprint: "", scheduled_date: "", team_capacity: "", notes: "" });

  // --- Commit (Sprint Goal + PBI select) flow ---
  const [commitFor, setCommitFor] = useState<any | null>(null);
  const [backlogItems, setBacklogItems] = useState<any[]>([]);
  const [retroActions, setRetroActions] = useState<any[]>([]);
  const [goal, setGoal] = useState("");
  const [selected, setSelected] = useState<Record<number, boolean>>({});
  const [committing, setCommitting] = useState(false);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [pRes, sRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/scrum/sprint-planning/`, { headers }),
        fetch(`/api/v1/projects/${id}/scrum/sprints/`, { headers }),
      ]);
      if (pRes.ok) { const d = await pRes.json(); setPlannings(Array.isArray(d) ? d : d.results || []); }
      if (sRes.ok) { const d = await sRes.json(); setSprints(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const handleCreate = async () => {
    if (!form.sprint) { toast.error(pt("Sprint is required")); return; }
    if (!form.scheduled_date) { toast.error(pt("Scheduled date is required")); return; }
    setSubmitting(true);
    try {
      const body: any = { sprint: parseInt(form.sprint), scheduled_date: form.scheduled_date, notes: form.notes };
      if (form.team_capacity) body.team_capacity = parseInt(form.team_capacity);
      const r = await fetch(`/api/v1/projects/${id}/scrum/sprint-planning/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Created")); setDialogOpen(false); fetchData(); } else toast.error(pt("Create failed"));
    } catch { toast.error(pt("Create failed")); } finally { setSubmitting(false); }
  };
  const handleAction = async (pId: number, action: string) => { try { const r = await fetch(`/api/v1/projects/${id}/scrum/sprint-planning/${pId}/${action}/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success(pt("Action completed")); fetchData(); } } catch { toast.error(pt("Action failed")); } };
  const handleDelete = async (pId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/scrum/sprint-planning/${pId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };

  const openCommit = async (p: any) => {
    setCommitFor(p); setGoal(p.sprint_goal_description || ""); setSelected({});
    setBacklogItems([]); setRetroActions([]);
    try {
      const [iRes, rRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/scrum/items/?product_goal=`, { headers }), // all items; we filter unassigned below
        fetch(`/api/v1/projects/${id}/scrum/sprint-planning/open_retro_actions/`, { headers }),
      ]);
      if (iRes.ok) { const d = await iRes.json(); const all = Array.isArray(d) ? d : d.results || []; setBacklogItems(all.filter((it: any) => !it.sprint)); }
      if (rRes.ok) { const d = await rRes.json(); setRetroActions(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
  };

  const selectedPoints = backlogItems.filter(it => selected[it.id]).reduce((s, it) => s + (it.story_points || 0), 0);

  const handleCommit = async () => {
    if (!commitFor) return;
    const item_ids = Object.keys(selected).filter(k => selected[+k]).map(k => parseInt(k));
    setCommitting(true);
    try {
      const r = await fetch(`/api/v1/projects/${id}/scrum/sprint-planning/${commitFor.id}/commit/`, {
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({ goal: goal.trim(), item_ids }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok) {
        const carried = (data.carried_forward_actions || []).length;
        toast.success(pt("Sprint committed") + ` — ${data.committed_story_points} pts` + (carried ? `, ${carried} ` + pt("retro action(s) carried forward") : ""));
        setCommitFor(null); fetchData();
      } else {
        toast.error(COMMIT_ERRORS[data.code] ? pt(COMMIT_ERRORS[data.code]) : (data.detail || pt("Commit failed")));
      }
    } catch { toast.error(pt("Commit failed")); } finally { setCommitting(false); }
  };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Target className="h-6 w-6 text-blue-500" /><h1 className="text-2xl font-bold">{pt("Sprint Planning")}</h1></div>
          <Button onClick={() => { setForm({ sprint: "", scheduled_date: "", team_capacity: "", notes: "" }); setDialogOpen(true); }} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Planning")}</Button>
        </div>

        {plannings.length === 0 ? <Card className="p-8 text-center"><Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No sprint planning sessions yet")}</h3></Card> : (
          <div className="space-y-3">{plannings.map(p => (
            <Card key={p.id}><CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2"><Badge variant={p.status === "completed" ? "default" : p.status === "in_progress" ? "secondary" : "outline"}>{p.status}</Badge>{p.sprint_name && <span className="font-medium">{p.sprint_name}</span>}</div>
                <div className="flex gap-1">
                  {p.status !== "completed" && <Button variant="outline" size="sm" className="gap-1" onClick={() => openCommit(p)}><Rocket className="h-4 w-4 text-blue-500" /> {pt("Commit Sprint")}</Button>}
                  {p.status === "scheduled" && <Button variant="ghost" size="sm" onClick={() => handleAction(p.id, "start_meeting")}><Play className="h-4 w-4 text-green-500" /></Button>}
                  {p.status === "in_progress" && <Button variant="ghost" size="sm" onClick={() => handleAction(p.id, "complete_meeting")}><CheckCircle2 className="h-4 w-4 text-green-500" /></Button>}
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
              {p.scheduled_date && <p className="text-sm text-muted-foreground">Scheduled: {new Date(p.scheduled_date).toLocaleString()}</p>}
              {p.team_capacity != null && <p className="text-sm text-muted-foreground">Capacity: {p.team_capacity} pts</p>}
              {p.committed_story_points > 0 && <p className="text-sm text-muted-foreground flex items-center gap-1"><Flag className="h-3 w-3" /> Committed: {p.committed_story_points} pts</p>}
              {p.notes && <p className="text-sm mt-1">{p.notes}</p>}
            </CardContent></Card>
          ))}</div>
        )}
      </div>

      {/* Create planning dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{pt("New Planning")}</DialogTitle><DialogDescription>{pt("Create a new sprint planning")}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Sprint")} *</Label><Select value={form.sprint} onValueChange={(v) => setForm({ ...form, sprint: v })}><SelectTrigger><SelectValue placeholder={pt("Select a sprint")} /></SelectTrigger><SelectContent>{sprints.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>{pt("Scheduled Date")} *</Label><Input type="datetime-local" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Team Capacity")} (pts)</Label><Input type="number" value={form.team_capacity} onChange={(e) => setForm({ ...form, team_capacity: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Notes")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleCreate} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Create")}</Button></div>
        </div>
      </DialogContent></Dialog>

      {/* Commit sprint dialog: Sprint Goal (why) + PBI selection (what) */}
      <Dialog open={!!commitFor} onOpenChange={(o) => !o && setCommitFor(null)}><DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><Rocket className="h-5 w-5 text-blue-500" /> {pt("Commit Sprint")}</DialogTitle><DialogDescription>{pt("Set a Sprint Goal and select the backlog items the team commits to.")}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label className="flex items-center gap-1"><Flag className="h-4 w-4" /> {pt("Sprint Goal")} *</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" placeholder={pt("Why are we running this sprint?")} value={goal} onChange={(e) => setGoal(e.target.value)} /></div>

          {retroActions.length > 0 && (
            <div className="rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 p-3 space-y-1">
              <p className="text-sm font-medium flex items-center gap-1 text-amber-700 dark:text-amber-400"><ArrowRightCircle className="h-4 w-4" /> {pt("Carried-forward improvement actions")}</p>
              {retroActions.map(a => <p key={a.id} className="text-xs text-muted-foreground">• {a.description}</p>)}
            </div>
          )}

          <div className="space-y-2">
            <Label>{pt("Backlog items")} ({selectedPoints} pts {pt("selected")})</Label>
            <div className="max-h-56 overflow-y-auto rounded-md border divide-y">
              {backlogItems.length === 0 ? <p className="text-sm text-muted-foreground p-3">{pt("No unassigned backlog items")}</p> :
                backlogItems.map(it => (
                  <label key={it.id} className="flex items-center gap-2 p-2 cursor-pointer hover:bg-muted/50">
                    <Checkbox checked={!!selected[it.id]} onCheckedChange={(c) => setSelected(s => ({ ...s, [it.id]: !!c }))} />
                    <span className="flex-1 text-sm">{it.title}</span>
                    {it.product_goal_title && <Badge variant="outline" className="text-[10px]">{it.product_goal_title}</Badge>}
                    {it.story_points != null && <Badge variant="secondary">{it.story_points}</Badge>}
                  </label>
                ))}
            </div>
          </div>

          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setCommitFor(null)}>{pt("Cancel")}</Button><Button onClick={handleCommit} disabled={committing}>{committing && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Commit & Start Sprint")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default ScrumSprintPlanning;
