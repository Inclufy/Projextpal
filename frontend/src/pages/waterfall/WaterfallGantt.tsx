import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import AiPlanButton from "@/components/AiPlanButton";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, BarChart3, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const WaterfallGantt = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", start_date: "", end_date: "", progress: "0", dependency: "" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/waterfall/gantt/`, { headers }); if (r.ok) { const d = await r.json(); setTasks(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);
  const openCreate = () => { setEditing(null); setForm({ name: "", start_date: "", end_date: "", progress: "0", dependency: "" }); setDialogOpen(true); };
  const openEdit = (t: any) => { setEditing(t); setForm({ name: t.name || "", start_date: t.start_date?.split("T")[0] || "", end_date: t.end_date?.split("T")[0] || "", progress: String(t.progress || 0), dependency: String(t.dependency || "") }); setDialogOpen(true); };
  const handleSave = async () => { if (!form.name) { toast.error("Naam verplicht"); return; } setSubmitting(true); try { const body: any = { ...form, progress: parseInt(form.progress) }; if (!form.dependency) delete body.dependency; const url = editing ? `/api/v1/projects/${id}/waterfall/gantt/${editing.id}/` : `/api/v1/projects/${id}/waterfall/gantt/`; const method = editing ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) }); if (r.ok) { toast.success("Opgeslagen"); setDialogOpen(false); fetchData(); } else toast.error("Opslaan mislukt"); } catch { toast.error("Opslaan mislukt"); } finally { setSubmitting(false); } };
  const handleDelete = async (tId: number) => { if (!confirm("Verwijderen?")) return; try { const r = await fetch(`/api/v1/projects/${id}/waterfall/gantt/${tId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success("Verwijderd"); fetchData(); } } catch { toast.error("Verwijderen mislukt"); } };
  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);
  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><BarChart3 className="h-6 w-6 text-blue-500" /><h1 className="text-2xl font-bold">{pt("Gantt Chart")}</h1><Badge variant="outline">{tasks.length}</Badge></div><div className="flex items-center gap-2"><AiPlanButton projectId={id!} onApplied={() => fetchData()} /><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button></div></div>
      {tasks.length === 0 ? <Card className="p-8 text-center"><BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">No Gantt tasks yet</h3></Card> : (
        <div className="space-y-2">{tasks.map(t => (<Card key={t.id}><CardContent className="p-4 flex items-center gap-4"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="font-medium">{t.name}</span><span className="text-xs text-muted-foreground">{t.start_date} → {t.end_date}</span></div><Progress value={t.progress || 0} className="h-2" /></div><span className="text-sm font-medium w-12 text-right">{t.progress || 0}%</span><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></CardContent></Card>))}</div>
      )}
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} Gantt Task</DialogTitle></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>{pt("Start Date")}</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div><div className="space-y-2"><Label>{pt("End Date")}</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div></div><div className="space-y-2"><Label>{pt("Progress")} (%)</Label><Input type="number" min="0" max="100" value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div></div></DialogContent></Dialog>
    </div>
  );
};
export default WaterfallGantt;
