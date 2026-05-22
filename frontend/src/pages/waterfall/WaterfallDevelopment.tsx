import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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
import { Loader2, Plus, Code, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const WaterfallDevelopment = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [tasks, setTasks] = useState<any[]>([]);
  const [phases, setPhases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", phase: "", priority: "medium", assigned_to_name: "", estimated_hours: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const [tRes, pRes] = await Promise.all([fetch(`/api/v1/projects/${id}/waterfall/tasks/`, { headers }), fetch(`/api/v1/projects/${id}/waterfall/phases/`, { headers })]); if (tRes.ok) { const d = await tRes.json(); setTasks(Array.isArray(d) ? d : d.results || []); } if (pRes.ok) { const d = await pRes.json(); setPhases(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ title: "", description: "", phase: "", priority: "medium", assigned_to_name: "", estimated_hours: "" }); setDialogOpen(true); };
  const openEdit = (t: any) => { setEditing(t); setForm({ title: t.title || "", description: t.description || "", phase: String(t.phase || ""), priority: t.priority || "medium", assigned_to_name: t.assigned_to_name || "", estimated_hours: String(t.estimated_hours || "") }); setDialogOpen(true); };
  const handleSave = async () => { if (!form.title) { toast.error("Titel verplicht"); return; } if (!form.phase) { toast.error("Fase verplicht"); return; } setSubmitting(true); try { const body: any = { ...form }; body.phase = parseInt(form.phase); if (form.estimated_hours) body.estimated_hours = parseFloat(form.estimated_hours); else delete body.estimated_hours; const url = editing ? `/api/v1/projects/${id}/waterfall/tasks/${editing.id}/` : `/api/v1/projects/${id}/waterfall/tasks/`; const method = editing ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) }); if (r.ok) { toast.success("Opgeslagen"); setDialogOpen(false); fetchData(); } else toast.error("Opslaan mislukt"); } catch { toast.error("Opslaan mislukt"); } finally { setSubmitting(false); } };
  const handleDelete = async (tId: number) => { if (!confirm("Verwijderen?")) return; try { const r = await fetch(`/api/v1/projects/${id}/waterfall/tasks/${tId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success("Verwijderd"); fetchData(); } } catch { toast.error("Verwijderen mislukt"); } };
  const handleComplete = async (tId: number) => { try { const r = await fetch(`/api/v1/projects/${id}/waterfall/tasks/${tId}/complete/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success("Voltooid"); fetchData(); } } catch { toast.error("Voltooien mislukt"); } };

  const prioColors: Record<string, string> = { critical: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700", medium: "bg-yellow-100 text-yellow-700", low: "bg-green-100 text-green-700" };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Code className="h-6 w-6 text-green-500" /><h1 className="text-2xl font-bold">{pt("Development")} Tasks</h1><Badge variant="outline">{tasks.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button></div>
        {tasks.length === 0 ? <Card className="p-8 text-center"><Code className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">No tasks yet</h3></Card> : (
          <div className="space-y-2">{tasks.map(t => (
            <Card key={t.id}><CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="font-medium">{t.title}</span><Badge className={`text-xs ${prioColors[t.priority] || ""}`}>{t.priority}</Badge><Badge variant={t.status === "completed" ? "default" : "secondary"} className="text-xs">{t.status}</Badge>{t.assigned_to_name && <span className="text-xs text-muted-foreground">👤 {t.assigned_to_name}</span>}</div>{t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}{t.progress != null && <Progress value={t.progress} className="h-1.5 mt-1 w-48" />}</div>
              <div className="flex gap-1">{t.status !== "completed" && <Button variant="ghost" size="sm" onClick={() => handleComplete(t.id)}><CheckCircle2 className="h-4 w-4 text-green-500" /></Button>}<Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div>
            </CardContent></Card>
          ))}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} Task</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-3"><div className="space-y-2"><Label>Phase *</Label><Select value={form.phase} onValueChange={(v) => setForm({ ...form, phase: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{phases.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>{pt("Priority")}</Label><Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Hours</Label><Input type="number" value={form.estimated_hours} onChange={(e) => setForm({ ...form, estimated_hours: e.target.value })} /></div></div>
          <div className="space-y-2"><Label>Assigned To</Label><Input value={form.assigned_to_name} onChange={(e) => setForm({ ...form, assigned_to_name: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default WaterfallDevelopment;
