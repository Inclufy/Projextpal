import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Play, CheckCircle2, ShieldCheck, Pencil, Trash2, ListChecks } from "lucide-react";
import { toast } from "sonner";

const WaterfallPhaseGate = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [phases, setPhases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", order: "", planned_start_date: "", planned_end_date: "", gate_criteria: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/waterfall/phases/`, { headers }); if (r.ok) { const d = await r.json(); setPhases(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", order: String(phases.length + 1), planned_start_date: "", planned_end_date: "", gate_criteria: "" }); setDialogOpen(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ name: p.name || "", description: p.description || "", order: String(p.order || ""), planned_start_date: p.planned_start_date?.split("T")[0] || "", planned_end_date: p.planned_end_date?.split("T")[0] || "", gate_criteria: p.gate_criteria || "" }); setDialogOpen(true); };

  const handleSave = async () => { if (!form.name) { toast.error(pt("Name is required")); return; } setSubmitting(true); try { const body: any = { ...form }; if (form.order) body.order = parseInt(form.order); const url = editing ? `/api/v1/projects/${id}/waterfall/phases/${editing.id}/` : `/api/v1/projects/${id}/waterfall/phases/`; const method = editing ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) }); if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); } };
  const handleDelete = async (pId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/waterfall/phases/${pId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };
  const handleAction = async (pId: number, action: string) => { try { const r = await fetch(`/api/v1/projects/${id}/waterfall/phases/${pId}/${action}/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success(pt("Saved")); fetchData(); } else { const err = await r.json().catch(() => ({})); toast.error(err.detail || pt("Action failed")); } } catch { toast.error(pt("Action failed")); } };

  const statusColors: Record<string, string> = { not_started: "bg-gray-100 text-gray-700", in_progress: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700", signed_off: "bg-purple-100 text-purple-700" };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><ListChecks className="h-6 w-6 text-cyan-500" /><h1 className="text-2xl font-bold">{pt("Phases")} & Gates</h1><Badge variant="outline">{phases.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add Phase")}</Button></div>
        {phases.length === 0 ? <Card className="p-8 text-center"><ListChecks className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No phases defined yet")}</h3><p className="text-muted-foreground">Initialize from dashboard or add phases manually</p></Card> : (
          <div className="space-y-4">{phases.sort((a, b) => (a.order || 0) - (b.order || 0)).map((p, i) => (
            <Card key={p.id} className={p.status === "in_progress" ? "border-blue-300 shadow-md" : ""}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3"><span className="text-sm font-bold text-muted-foreground">#{p.order || i + 1}</span><h3 className="font-semibold text-lg">{p.name}</h3><Badge className={statusColors[p.status] || ""}>{p.status?.replace("_", " ")}</Badge></div>
                  <div className="flex gap-1">
                    {p.status === "not_started" && <Button variant="outline" size="sm" onClick={() => handleAction(p.id, "start")} className="gap-1"><Play className="h-3.5 w-3.5" /> Start</Button>}
                    {p.status === "in_progress" && <Button variant="outline" size="sm" onClick={() => handleAction(p.id, "complete")} className="gap-1"><CheckCircle2 className="h-3.5 w-3.5" /> Complete</Button>}
                    {p.status === "completed" && <Button variant="outline" size="sm" onClick={() => handleAction(p.id, "sign-off")} className="gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Sign Off</Button>}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </div>
                </div>
                {p.description && <p className="text-sm text-muted-foreground mb-2">{p.description}</p>}
                <div className="flex items-center gap-4"><Progress value={p.progress || 0} className="flex-1 h-2" /><span className="text-sm font-medium">{p.progress || 0}%</span></div>
                {(p.planned_start_date || p.planned_end_date) && <p className="text-xs text-muted-foreground mt-2">{p.planned_start_date} → {p.planned_end_date}</p>}
                {p.gate_criteria && <p className="text-xs mt-1"><span className="font-medium">Gate:</span> {p.gate_criteria}</p>}
              </CardContent>
            </Card>
          ))}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} Phase</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-3"><div className="col-span-2 space-y-2"><Label>{pt("Name")} *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="space-y-2"><Label>Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div></div>
          <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>{pt("Start Date")}</Label><Input type="date" value={form.planned_start_date} onChange={(e) => setForm({ ...form, planned_start_date: e.target.value })} /></div><div className="space-y-2"><Label>{pt("End Date")}</Label><Input type="date" value={form.planned_end_date} onChange={(e) => setForm({ ...form, planned_end_date: e.target.value })} /></div></div>
          <div className="space-y-2"><Label>Gate Criteria</Label><textarea className="w-full min-h-[40px] px-3 py-2 border rounded-md bg-background" value={form.gate_criteria} onChange={(e) => setForm({ ...form, gate_criteria: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default WaterfallPhaseGate;
