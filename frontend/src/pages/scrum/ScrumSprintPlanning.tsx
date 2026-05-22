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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Target, Trash2, Play, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const ScrumSprintPlanning = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [plannings, setPlannings] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ sprint: "", scheduled_date: "", team_capacity: "", notes: "" });

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
                  {p.status === "scheduled" && <Button variant="ghost" size="sm" onClick={() => handleAction(p.id, "start_meeting")}><Play className="h-4 w-4 text-green-500" /></Button>}
                  {p.status === "in_progress" && <Button variant="ghost" size="sm" onClick={() => handleAction(p.id, "complete_meeting")}><CheckCircle2 className="h-4 w-4 text-green-500" /></Button>}
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
              {p.scheduled_date && <p className="text-sm text-muted-foreground">Scheduled: {new Date(p.scheduled_date).toLocaleString()}</p>}
              {p.team_capacity != null && <p className="text-sm text-muted-foreground">Capacity: {p.team_capacity} pts</p>}
              {p.notes && <p className="text-sm mt-1">{p.notes}</p>}
            </CardContent></Card>
          ))}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{pt("New Planning")}</DialogTitle><DialogDescription>{pt("Create a new sprint planning")}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Sprint")} *</Label><Select value={form.sprint} onValueChange={(v) => setForm({ ...form, sprint: v })}><SelectTrigger><SelectValue placeholder={pt("Select a sprint")} /></SelectTrigger><SelectContent>{sprints.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>{pt("Scheduled Date")} *</Label><Input type="datetime-local" value={form.scheduled_date} onChange={(e) => setForm({ ...form, scheduled_date: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Team Capacity")} (pts)</Label><Input type="number" value={form.team_capacity} onChange={(e) => setForm({ ...form, team_capacity: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Notes")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleCreate} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Create")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default ScrumSprintPlanning;
