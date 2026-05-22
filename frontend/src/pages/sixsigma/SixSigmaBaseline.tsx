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
import { Loader2, Plus, TrendingUp, Pencil, Trash2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const BASE = (id: string) => `/api/v1/sixsigma/projects/${id}/sixsigma`;

const SixSigmaBaseline = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ metric_name: "", baseline_value: "", current_value: "", target_value: "", unit: "", sigma_level: "" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const r = await fetch(`${BASE(id!)}/baseline/`, { headers }); if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);
  const openCreate = () => { setEditing(null); setForm({ metric_name: "", baseline_value: "", current_value: "", target_value: "", unit: "", sigma_level: "" }); setDialogOpen(true); };
  const openEdit = (i: any) => { setEditing(i); setForm({ metric_name: i.metric_name || "", baseline_value: String(i.baseline_value ?? ""), current_value: String(i.current_value ?? ""), target_value: String(i.target_value ?? ""), unit: i.unit || "", sigma_level: i.baseline_sigma != null ? String(i.baseline_sigma) : "" }); setDialogOpen(true); };
  const handleSave = async () => {
    if (!form.metric_name) { toast.error("Metric name verplicht"); return; }
    if (!form.unit) { toast.error(pt("Unit is required")); return; }
    for (const [label, val] of [["Baseline value", form.baseline_value], ["Current value", form.current_value], ["Target value", form.target_value]] as [string, string][]) {
      if (val === "" || isNaN(Number(val))) { toast.error(`${label} ${pt("is required")}`); return; }
    }
    setSubmitting(true);
    try {
      const body: any = { metric_name: form.metric_name, unit: form.unit, baseline_value: Number(form.baseline_value), current_value: Number(form.current_value), target_value: Number(form.target_value) };
      if (form.sigma_level !== "" && !isNaN(Number(form.sigma_level))) body.baseline_sigma = Number(form.sigma_level);
      const url = editing ? `${BASE(id!)}/baseline/${editing.id}/` : `${BASE(id!)}/baseline/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); }
  };
  const handleDelete = async (bId: number) => { if (!confirm("Verwijderen?")) return; try { await fetch(`${BASE(id!)}/baseline/${bId}/`, { method: "DELETE", headers }); toast.success("Verwijderd"); fetchData(); } catch { toast.error("Verwijderen mislukt"); } };
  const updateCurrent = async (bId: number, value: string) => { try { const r = await fetch(`${BASE(id!)}/baseline/${bId}/update_current/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify({ current_value: parseFloat(value) }) }); if (r.ok) { toast.success("Bijgewerkt"); fetchData(); } } catch { toast.error("Bijwerken mislukt"); } };
  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);
  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><TrendingUp className="h-6 w-6 text-green-500" /><h1 className="text-2xl font-bold">Baseline Metrics</h1><Badge variant="outline">{items.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button></div>
      {items.length === 0 ? <Card className="p-8 text-center"><TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">No baseline metrics yet</h3></Card> : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{items.map(i => { const pct = i.target_value && i.baseline_value ? Math.min(Math.abs(((i.current_value || i.baseline_value) - i.baseline_value) / (i.target_value - i.baseline_value)) * 100, 100) : 0; return (
          <Card key={i.id}><CardContent className="p-4"><div className="flex items-center justify-between mb-2"><span className="font-semibold">{i.metric_name}</span><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(i)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(i.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></div><div className="grid grid-cols-3 gap-2 text-sm mb-2"><div><p className="text-muted-foreground text-xs">Baseline</p><p className="font-bold">{i.baseline_value ?? "—"} {i.unit}</p></div><div><p className="text-muted-foreground text-xs">Current</p><p className="font-bold text-blue-600">{i.current_value ?? "—"} {i.unit}</p></div><div><p className="text-muted-foreground text-xs">Target</p><p className="font-bold text-green-600">{i.target_value ?? "—"} {i.unit}</p></div></div><Progress value={pct} className="h-2 mb-1" />{i.sigma_level && <p className="text-xs text-muted-foreground">σ Level: <strong>{i.sigma_level}</strong></p>}</CardContent></Card>); })}</div>
      )}
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} Baseline Metric</DialogTitle></DialogHeader><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Metric Name *</Label><Input value={form.metric_name} onChange={(e) => setForm({ ...form, metric_name: e.target.value })} /></div><div className="space-y-2"><Label>Unit</Label><Input value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} /></div></div><div className="grid grid-cols-3 gap-3"><div className="space-y-2"><Label>Baseline</Label><Input type="number" value={form.baseline_value} onChange={(e) => setForm({ ...form, baseline_value: e.target.value })} /></div><div className="space-y-2"><Label>Current</Label><Input type="number" value={form.current_value} onChange={(e) => setForm({ ...form, current_value: e.target.value })} /></div><div className="space-y-2"><Label>Target</Label><Input type="number" value={form.target_value} onChange={(e) => setForm({ ...form, target_value: e.target.value })} /></div></div><div className="space-y-2"><Label>Sigma Level</Label><Input type="number" step="0.1" value={form.sigma_level} onChange={(e) => setForm({ ...form, sigma_level: e.target.value })} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div></div></DialogContent></Dialog>
    </div>
  );
};
export default SixSigmaBaseline;
