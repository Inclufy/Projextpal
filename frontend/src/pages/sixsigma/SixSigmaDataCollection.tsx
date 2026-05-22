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
import { Loader2, Plus, Database, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const BASE = (id: string) => `/api/v1/sixsigma/projects/${id}/sixsigma`;

const SixSigmaDataCollection = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [plans, setPlans] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"plan" | "metric">("plan");
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [pForm, setPForm] = useState({ objective: "", data_collection_method: "", sampling_strategy: "", target_sample_size: "", status: "planning" });
  const [mForm, setMForm] = useState({ plan: "", name: "", data_type: "continuous", operational_definition: "", data_source: "", collection_frequency: "", target_samples: "", unit: "" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const [pRes, mRes] = await Promise.all([fetch(`${BASE(id!)}/data-collection/`, { headers }), fetch(`${BASE(id!)}/metrics/`, { headers })]); if (pRes.ok) { const d = await pRes.json(); setPlans(Array.isArray(d) ? d : d.results || []); } if (mRes.ok) { const d = await mRes.json(); setMetrics(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const openCreatePlan = () => { setDialogType("plan"); setEditing(null); setPForm({ objective: "", data_collection_method: "", sampling_strategy: "", target_sample_size: "", status: "planning" }); setDialogOpen(true); };
  const openEditPlan = (p: any) => { setDialogType("plan"); setEditing(p); setPForm({ objective: p.objective || "", data_collection_method: p.data_collection_method || "", sampling_strategy: p.sampling_strategy || "", target_sample_size: p.target_sample_size != null ? String(p.target_sample_size) : "", status: p.status || "planning" }); setDialogOpen(true); };
  const openCreateMetric = () => { setDialogType("metric"); setEditing(null); setMForm({ plan: plans[0]?.id?.toString() || "", name: "", data_type: "continuous", operational_definition: "", data_source: "", collection_frequency: "", target_samples: "", unit: "" }); setDialogOpen(true); };
  const openEditMetric = (m: any) => { setDialogType("metric"); setEditing(m); setMForm({ plan: String(m.plan || ""), name: m.name || "", data_type: m.data_type || "continuous", operational_definition: m.operational_definition || "", data_source: m.data_source || "", collection_frequency: m.collection_frequency || "", target_samples: m.target_samples != null ? String(m.target_samples) : "", unit: m.unit || "" }); setDialogOpen(true); };

  const handleSavePlan = async () => { if (!pForm.objective) { toast.error(pt("Objective is required")); return; } setSubmitting(true); try { const body: any = { objective: pForm.objective, data_collection_method: pForm.data_collection_method, sampling_strategy: pForm.sampling_strategy, status: pForm.status }; if (pForm.target_sample_size !== "" && !isNaN(Number(pForm.target_sample_size))) body.target_sample_size = parseInt(pForm.target_sample_size); const url = editing ? `${BASE(id!)}/data-collection/${editing.id}/` : `${BASE(id!)}/data-collection/`; const method = editing ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) }); if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); } };
  const handleSaveMetric = async () => { if (!mForm.name) { toast.error("Naam verplicht"); return; } if (!mForm.plan) { toast.error(pt("Please select a plan")); return; } if (!mForm.operational_definition) { toast.error(pt("Operational definition is required")); return; } if (!mForm.data_source) { toast.error(pt("Data source is required")); return; } if (!mForm.collection_frequency) { toast.error(pt("Collection frequency is required")); return; } setSubmitting(true); try { const body: any = { plan: parseInt(mForm.plan), name: mForm.name, data_type: mForm.data_type, operational_definition: mForm.operational_definition, data_source: mForm.data_source, collection_frequency: mForm.collection_frequency, unit: mForm.unit }; if (mForm.target_samples !== "" && !isNaN(Number(mForm.target_samples))) body.target_samples = parseInt(mForm.target_samples); const url = editing ? `${BASE(id!)}/metrics/${editing.id}/` : `${BASE(id!)}/metrics/`; const method = editing ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) }); if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); } };
  const deletePlan = async (pId: number) => { if (!confirm("Verwijderen?")) return; try { await fetch(`${BASE(id!)}/data-collection/${pId}/`, { method: "DELETE", headers }); toast.success("Verwijderd"); fetchData(); } catch { toast.error("Verwijderen mislukt"); } };
  const deleteMetric = async (mId: number) => { if (!confirm("Verwijderen?")) return; try { await fetch(`${BASE(id!)}/metrics/${mId}/`, { method: "DELETE", headers }); toast.success("Verwijderd"); fetchData(); } catch { toast.error("Verwijderen mislukt"); } };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3"><Database className="h-6 w-6 text-green-500" /><h1 className="text-2xl font-bold">Data Collection</h1></div>
        <div className="flex items-center justify-between"><h2 className="font-semibold">Collection Plans ({plans.length})</h2><Button onClick={openCreatePlan} size="sm" className="gap-2"><Plus className="h-4 w-4" /> Plan</Button></div>
        {plans.length === 0 ? <Card className="p-6 text-center text-muted-foreground">No collection plans yet</Card> : (
          <div className="space-y-2">{plans.map(p => (<Card key={p.id}><CardContent className="p-4 flex items-center justify-between"><div><div className="flex items-center gap-2"><span className="font-medium">{p.objective}</span><Badge variant="outline" className="text-xs">{p.status}</Badge></div>{p.sampling_strategy && <p className="text-sm text-muted-foreground">{p.sampling_strategy}</p>}</div><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEditPlan(p)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => deletePlan(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></CardContent></Card>))}</div>
        )}
        <div className="flex items-center justify-between"><h2 className="font-semibold">Metrics ({metrics.length})</h2><Button onClick={openCreateMetric} size="sm" className="gap-2"><Plus className="h-4 w-4" /> Metric</Button></div>
        {metrics.length === 0 ? <Card className="p-6 text-center text-muted-foreground">No metrics yet</Card> : (
          <div className="space-y-2">{metrics.map(m => { const pct = m.target_samples ? Math.min(((m.collected_samples || 0) / m.target_samples) * 100, 100) : 0; return (<Card key={m.id}><CardContent className="p-4 flex items-center justify-between"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="font-medium">{m.name}</span><Badge variant="outline" className="text-xs">{m.data_type}</Badge>{m.unit && <Badge variant="outline" className="text-xs">{m.unit}</Badge>}</div>{m.target_samples && <div className="flex items-center gap-2"><Progress value={pct} className="h-2 w-32" /><span className="text-xs">{m.collected_samples || 0}/{m.target_samples}</span></div>}</div><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEditMetric(m)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => deleteMetric(m.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></CardContent></Card>); })}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} {dialogType === "plan" ? "Collection Plan" : "Metric"}</DialogTitle></DialogHeader>
        {dialogType === "plan" ? (
          <div className="space-y-4"><div className="space-y-2"><Label>Objective *</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={pForm.objective} onChange={(e) => setPForm({ ...pForm, objective: e.target.value })} /></div><div className="space-y-2"><Label>Data Collection Method</Label><textarea className="w-full min-h-[40px] px-3 py-2 border rounded-md bg-background" value={pForm.data_collection_method} onChange={(e) => setPForm({ ...pForm, data_collection_method: e.target.value })} /></div><div className="space-y-2"><Label>Sampling Strategy</Label><textarea className="w-full min-h-[40px] px-3 py-2 border rounded-md bg-background" value={pForm.sampling_strategy} onChange={(e) => setPForm({ ...pForm, sampling_strategy: e.target.value })} /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Target Sample Size</Label><Input type="number" value={pForm.target_sample_size} onChange={(e) => setPForm({ ...pForm, target_sample_size: e.target.value })} /></div><div className="space-y-2"><Label>{pt("Status")}</Label><Select value={pForm.status} onValueChange={(v) => setPForm({ ...pForm, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="planning">Planning</SelectItem><SelectItem value="collecting">Collecting</SelectItem><SelectItem value="completed">Completed</SelectItem></SelectContent></Select></div></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSavePlan} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div></div>
        ) : (
          <div className="space-y-4"><div className="space-y-2"><Label>Plan *</Label><Select value={mForm.plan} onValueChange={(v) => setMForm({ ...mForm, plan: v })}><SelectTrigger><SelectValue placeholder={pt("Select plan")} /></SelectTrigger><SelectContent>{plans.map(p => <SelectItem key={p.id} value={p.id.toString()}>{p.objective}</SelectItem>)}</SelectContent></Select></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={mForm.name} onChange={(e) => setMForm({ ...mForm, name: e.target.value })} /></div><div className="space-y-2"><Label>Data Type</Label><Select value={mForm.data_type} onValueChange={(v) => setMForm({ ...mForm, data_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="continuous">Continuous</SelectItem><SelectItem value="discrete">Discrete</SelectItem><SelectItem value="attribute">Attribute</SelectItem></SelectContent></Select></div></div><div className="space-y-2"><Label>Operational Definition *</Label><textarea className="w-full min-h-[40px] px-3 py-2 border rounded-md bg-background" value={mForm.operational_definition} onChange={(e) => setMForm({ ...mForm, operational_definition: e.target.value })} /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Data Source *</Label><Input value={mForm.data_source} onChange={(e) => setMForm({ ...mForm, data_source: e.target.value })} /></div><div className="space-y-2"><Label>Collection Frequency *</Label><Input value={mForm.collection_frequency} onChange={(e) => setMForm({ ...mForm, collection_frequency: e.target.value })} /></div></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Target Samples</Label><Input type="number" value={mForm.target_samples} onChange={(e) => setMForm({ ...mForm, target_samples: e.target.value })} /></div><div className="space-y-2"><Label>Unit</Label><Input value={mForm.unit} onChange={(e) => setMForm({ ...mForm, unit: e.target.value })} /></div></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSaveMetric} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div></div>
        )}
      </DialogContent></Dialog>
    </div>
  );
};

export default SixSigmaDataCollection;
