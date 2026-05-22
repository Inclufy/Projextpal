import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Milestone, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const WaterfallMilestones = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", due_date: "", deliverables: "" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/waterfall/milestones/`, { headers }); if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);
  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", due_date: "", deliverables: "" }); setDialogOpen(true); };
  const openEdit = (m: any) => { setEditing(m); setForm({ name: m.name || "", description: m.description || "", due_date: m.due_date?.split("T")[0] || "", deliverables: Array.isArray(m.deliverables) ? m.deliverables.join("\n") : (m.deliverables || "") }); setDialogOpen(true); };
  const handleSave = async () => { if (!form.name) { toast.error("Naam verplicht"); return; } if (!form.due_date) { toast.error("Einddatum verplicht"); return; } setSubmitting(true); try { const body: any = { name: form.name, description: form.description, due_date: form.due_date, deliverables: form.deliverables.split("\n").map((s) => s.trim()).filter(Boolean) }; const url = editing ? `/api/v1/projects/${id}/waterfall/milestones/${editing.id}/` : `/api/v1/projects/${id}/waterfall/milestones/`; const method = editing ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) }); if (r.ok) { toast.success("Opgeslagen"); setDialogOpen(false); fetchData(); } else toast.error("Opslaan mislukt"); } catch { toast.error("Opslaan mislukt"); } finally { setSubmitting(false); } };
  const handleDelete = async (mId: number) => { if (!confirm("Verwijderen?")) return; try { const r = await fetch(`/api/v1/projects/${id}/waterfall/milestones/${mId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success("Verwijderd"); fetchData(); } } catch { toast.error("Verwijderen mislukt"); } };
  const handleComplete = async (mId: number) => { try { const r = await fetch(`/api/v1/projects/${id}/waterfall/milestones/${mId}/complete/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success("Voltooid"); fetchData(); } } catch { toast.error("Voltooien mislukt"); } };
  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);
  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Milestone className="h-6 w-6 text-amber-500" /><h1 className="text-2xl font-bold">{pt("Milestones")}</h1><Badge variant="outline">{items.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button></div>
      {items.length === 0 ? <Card className="p-8 text-center"><Milestone className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">No milestones yet</h3></Card> : (
        <div className="space-y-3">{items.map(m => (<Card key={m.id}><CardContent className="p-4 flex items-center justify-between"><div><div className="flex items-center gap-2 mb-1"><span className="font-semibold">{m.name}</span><Badge variant={m.status === "completed" ? "default" : "outline"} className="text-xs">{m.status}</Badge>{m.due_date && <span className="text-xs text-muted-foreground">📅 {m.due_date}</span>}</div>{m.description && <p className="text-sm text-muted-foreground">{m.description}</p>}</div><div className="flex gap-1">{m.status !== "completed" && <Button variant="ghost" size="sm" onClick={() => handleComplete(m.id)}><CheckCircle2 className="h-4 w-4 text-green-500" /></Button>}<Button variant="ghost" size="sm" onClick={() => openEdit(m)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></CardContent></Card>))}</div>
      )}
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} Milestone</DialogTitle></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div><div className="space-y-2"><Label>{pt("Due Date")} *</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div><div className="space-y-2"><Label>{pt("Deliverables")} ({pt("one per line")})</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.deliverables} onChange={(e) => setForm({ ...form, deliverables: e.target.value })} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div></div></DialogContent></Dialog>
    </div>
  );
};
export default WaterfallMilestones;
