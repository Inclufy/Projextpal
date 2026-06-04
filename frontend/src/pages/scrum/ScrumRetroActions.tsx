import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Flag, Trash2, CheckCircle2, ArrowRightCircle } from "lucide-react";
import { toast } from "sonner";

const STATUS_VARIANT: Record<string, any> = { open: "outline", in_progress: "secondary", done: "default", carried_forward: "secondary" };

const ScrumRetroActions = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [actions, setActions] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ sprint: "", description: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [aRes, sRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/scrum/retro-actions/`, { headers }),
        fetch(`/api/v1/projects/${id}/scrum/sprints/`, { headers }),
      ]);
      if (aRes.ok) { const d = await aRes.json(); setActions(Array.isArray(d) ? d : d.results || []); }
      if (sRes.ok) { const d = await sRes.json(); setSprints(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setForm({ sprint: "", description: "" }); setDialogOpen(true); };
  const handleSave = async () => {
    if (!form.sprint) { toast.error(pt("Sprint is required")); return; }
    if (!form.description.trim()) { toast.error(pt("Description is required")); return; }
    setSubmitting(true);
    try {
      const r = await fetch(`/api/v1/projects/${id}/scrum/retro-actions/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify({ sprint: parseInt(form.sprint), description: form.description }) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); }
  };
  const handleResolve = async (aId: number) => { try { const r = await fetch(`/api/v1/projects/${id}/scrum/retro-actions/${aId}/resolve/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success(pt("Resolved")); fetchData(); } } catch { toast.error(pt("Action failed")); } };
  const handleDelete = async (aId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/scrum/retro-actions/${aId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Flag className="h-6 w-6 text-amber-500" /><h1 className="text-2xl font-bold">{pt("Retro Action Items")}</h1><Badge variant="outline">{actions.length}</Badge></div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Action")}</Button>
        </div>
        <p className="text-sm text-muted-foreground -mt-3">{pt("Improvement actions from retrospectives. Still-open actions are carried forward into the next Sprint Planning so they are never lost.")}</p>

        {actions.length === 0 ? <Card className="p-8 text-center"><Flag className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No retro action items yet")}</h3></Card> : (
          <div className="space-y-3">{actions.map(a => (
            <Card key={a.id}><CardContent className="p-4 flex items-start justify-between gap-2">
              <div className="flex-1">
                <p className="text-sm flex items-center gap-2">
                  <Badge variant={STATUS_VARIANT[a.status] || "outline"}>{a.status}</Badge>
                  {a.status === "carried_forward" && a.carried_to_sprint_name && <span className="text-xs text-amber-600 flex items-center gap-1"><ArrowRightCircle className="h-3 w-3" /> {a.carried_to_sprint_name}</span>}
                </p>
                <p className="mt-1">{a.description}</p>
                <p className="text-xs text-muted-foreground mt-1">{pt("From")}: {a.sprint_name}{a.owner_name ? ` · ${a.owner_name}` : ""}</p>
              </div>
              <div className="flex gap-1">
                {a.status !== "done" && <Button variant="ghost" size="sm" onClick={() => handleResolve(a.id)} title={pt("Mark done")}><CheckCircle2 className="h-4 w-4 text-green-500" /></Button>}
                <Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent></Card>
          ))}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{pt("New Action")}</DialogTitle><DialogDescription>{pt("A trackable improvement raised in a retrospective.")}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Sprint")} *</Label><Select value={form.sprint} onValueChange={(v) => setForm({ ...form, sprint: v })}><SelectTrigger><SelectValue placeholder={pt("Select a sprint")} /></SelectTrigger><SelectContent>{sprints.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>{pt("Description")} *</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default ScrumRetroActions;
