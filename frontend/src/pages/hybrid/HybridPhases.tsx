import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Target, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const fetchJson = async (url: string) => {
  const token = localStorage.getItem("access_token");
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
};
const toArr = (d: any) => (Array.isArray(d) ? d : d?.results || []);

const METHODOLOGIES = ["scrum", "kanban", "waterfall", "agile", "prince2", "lean_six_sigma_green", "lean_six_sigma_black"];

const HybridPhases = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ phase: "", methodology: "scrum", description: "", order: "0", start_date: "", end_date: "", progress: "0" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const phasesQ = useQuery({ queryKey: ["hybrid-phases", id], queryFn: () => fetchJson(`/api/v1/projects/${id}/hybrid/phase-methodologies/`), enabled: !!id });
  const tasksQ = useQuery({ queryKey: ["hybrid-tasks", id], queryFn: () => fetchJson(`/api/v1/projects/${id}/hybrid/tasks/`), enabled: !!id });

  const phases = toArr(phasesQ.data).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  const tasks = toArr(tasksQ.data);
  const refresh = () => qc.invalidateQueries({ queryKey: ["hybrid-phases", id] });

  const openCreate = () => { setEditing(null); setForm({ phase: "", methodology: "scrum", description: "", order: String(phases.length), start_date: "", end_date: "", progress: "0" }); setDialogOpen(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ phase: p.phase || "", methodology: p.methodology || "scrum", description: p.description || "", order: String(p.order ?? 0), start_date: p.start_date || "", end_date: p.end_date || "", progress: String(p.progress ?? 0) }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.phase) { toast.error(pt("Phase name is required")); return; }
    setSubmitting(true);
    try {
      const body: any = { phase: form.phase, methodology: form.methodology, description: form.description, order: parseInt(form.order) || 0, progress: parseInt(form.progress) || 0 };
      if (form.start_date) body.start_date = form.start_date;
      if (form.end_date) body.end_date = form.end_date;
      const url = editing ? `/api/v1/projects/${id}/hybrid/phase-methodologies/${editing.id}/` : `/api/v1/projects/${id}/hybrid/phase-methodologies/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); refresh(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (pId: string) => {
    if (!confirm(pt("Delete this phase?"))) return;
    try { const r = await fetch(`/api/v1/projects/${id}/hybrid/phase-methodologies/${pId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); refresh(); } } catch { toast.error(pt("Delete failed")); }
  };

  const markComplete = async (p: any) => {
    try { const r = await fetch(`/api/v1/projects/${id}/hybrid/phase-methodologies/${p.id}/`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ progress: 100 }) }); if (r.ok) { toast.success(pt("Phase completed")); refresh(); } } catch { toast.error(pt("Update failed")); }
  };

  const phaseProgress = (p: any) => {
    const phaseTasks = tasks.filter((t: any) => t.phase === p.id);
    if (phaseTasks.length === 0) return p.progress ?? 0;
    const done = phaseTasks.filter((t: any) => t.status === "completed" || t.status === "done").length;
    return Math.round((done / phaseTasks.length) * 100);
  };

  if (phasesQ.isLoading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Target className="h-6 w-6 text-pink-500" /><h1 className="text-2xl font-bold">{pt("Hybrid Phases")}</h1><Badge variant="outline">{phases.length}</Badge></div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Phase")}</Button>
        </div>

        {phases.length === 0 ? <Card className="p-8 text-center"><Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No phases yet")}</h3></Card> : (
          <div className="space-y-3">{phases.map((p: any) => {
            const prog = phaseProgress(p);
            return (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="font-semibold">{p.phase}</span>
                      <Badge variant="outline" className="text-xs">{p.methodology}</Badge>
                      <Badge className={`text-xs ${prog >= 100 ? "bg-green-100 text-green-700" : prog > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>{prog >= 100 ? pt("completed") : prog > 0 ? pt("in progress") : pt("not started")}</Badge>
                    </div>
                    <div className="flex gap-1">
                      {prog < 100 && <Button variant="ghost" size="sm" onClick={() => markComplete(p)}><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /></Button>}
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </div>
                  {p.description && <p className="text-sm text-muted-foreground mb-2">{p.description}</p>}
                  <div className="text-xs text-muted-foreground mb-2">{p.start_date || "—"} → {p.end_date || "—"}</div>
                  <div className="flex items-center gap-3"><Progress value={prog} className="h-2 flex-1" /><span className="text-xs font-medium w-10 text-right">{prog}%</span></div>
                </CardContent>
              </Card>
            );
          })}</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent>
        <DialogHeader><DialogTitle>{editing ? pt("Edit Phase") : pt("New Phase")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Phase Name")} *</Label><Input value={form.phase} onChange={e => setForm({ ...form, phase: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>{pt("Methodology")}</Label><Select value={form.methodology} onValueChange={v => setForm({ ...form, methodology: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{METHODOLOGIES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>{pt("Order")}</Label><Input type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>{pt("Start Date")}</Label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("End Date")}</Label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>{pt("Progress")} (%)</Label><Input type="number" min="0" max="100" value={form.progress} onChange={e => setForm({ ...form, progress: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default HybridPhases;
