import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, BarChart3, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const fetchJson = async (url: string) => {
  const token = localStorage.getItem("access_token");
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
};
const toArr = (d: any) => (Array.isArray(d) ? d : d?.results || []);

const PHASES = ["define", "measure", "analyze", "improve", "control"];

const LSSGreenMeasurements = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ phase: "measure", metric: "", baseline_value: "", target_value: "", actual_value: "", unit: "", measurement_date: "", notes: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const measQ = useQuery({ queryKey: ["lssg-meas", id], queryFn: () => fetchJson(`/api/v1/lss-green/projects/${id}/measurements/`), enabled: !!id });
  const measurements = toArr(measQ.data);
  const refresh = () => qc.invalidateQueries({ queryKey: ["lssg-meas", id] });

  const grouped = useMemo(() => {
    const out: Record<string, any[]> = {};
    PHASES.forEach(p => { out[p] = []; });
    measurements.forEach((m: any) => { (out[m.phase] = out[m.phase] || []).push(m); });
    return out;
  }, [measurements]);

  const openCreate = () => { setEditing(null); setForm({ phase: "measure", metric: "", baseline_value: "", target_value: "", actual_value: "", unit: "", measurement_date: "", notes: "" }); setDialogOpen(true); };
  const openEdit = (m: any) => { setEditing(m); setForm({ phase: m.phase, metric: m.metric || "", baseline_value: String(m.baseline_value ?? ""), target_value: String(m.target_value ?? ""), actual_value: String(m.actual_value ?? ""), unit: m.unit || "", measurement_date: m.measurement_date || "", notes: m.notes || "" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.metric) { toast.error(pt("Metric name is required")); return; }
    setSubmitting(true);
    try {
      const body: any = { phase: form.phase, metric: form.metric, unit: form.unit, notes: form.notes };
      ["baseline_value", "target_value", "actual_value"].forEach(k => { const v = (form as any)[k]; if (v !== "") body[k] = parseFloat(v); });
      if (form.measurement_date) body.measurement_date = form.measurement_date;
      const url = editing ? `/api/v1/lss-green/projects/${id}/measurements/${editing.id}/` : `/api/v1/lss-green/projects/${id}/measurements/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); refresh(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (mId: string) => {
    if (!confirm(pt("Delete this measurement?"))) return;
    try { const r = await fetch(`/api/v1/lss-green/projects/${id}/measurements/${mId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); refresh(); } } catch { toast.error(pt("Delete failed")); }
  };

  if (measQ.isLoading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><BarChart3 className="h-6 w-6 text-green-500" /><h1 className="text-2xl font-bold">{pt("Measurements")}</h1><Badge variant="outline">{measurements.length}</Badge></div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add Measurement")}</Button>
        </div>

        {PHASES.map(ph => grouped[ph] && grouped[ph].length > 0 && (
          <Card key={ph}><CardHeader className="pb-3"><CardTitle className="capitalize">{ph} ({grouped[ph].length})</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs"><tr><th className="text-left p-2">{pt("Metric")}</th><th className="text-left p-2">{pt("Baseline")}</th><th className="text-left p-2">{pt("Target")}</th><th className="text-left p-2">{pt("Actual")}</th><th className="text-left p-2">{pt("Unit")}</th><th className="text-left p-2">{pt("Date")}</th><th className="p-2"></th></tr></thead>
                <tbody className="divide-y">{grouped[ph].map((m: any) => (
                  <tr key={m.id} className="hover:bg-muted/30">
                    <td className="p-2 font-medium">{m.metric}</td>
                    <td className="p-2 font-mono">{m.baseline_value ?? "—"}</td>
                    <td className="p-2 font-mono">{m.target_value ?? "—"}</td>
                    <td className="p-2 font-mono">{m.actual_value ?? "—"}</td>
                    <td className="p-2">{m.unit || "—"}</td>
                    <td className="p-2 text-xs text-muted-foreground">{m.measurement_date || "—"}</td>
                    <td className="p-2 text-right whitespace-nowrap"><Button variant="ghost" size="sm" onClick={() => openEdit(m)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></td>
                  </tr>
                ))}</tbody>
              </table></div>
            </CardContent>
          </Card>
        ))}
        {measurements.length === 0 && <Card className="p-8 text-center"><BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No measurements yet")}</h3></Card>}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{editing ? pt("Edit Measurement") : pt("Add Measurement")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>{pt("Phase")}</Label><Select value={form.phase} onValueChange={v => setForm({ ...form, phase: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PHASES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>{pt("Unit")}</Label><Input value={form.unit} onChange={e => setForm({ ...form, unit: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>{pt("Metric")} *</Label><Input value={form.metric} onChange={e => setForm({ ...form, metric: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2"><Label>{pt("Baseline")}</Label><Input type="number" step="any" value={form.baseline_value} onChange={e => setForm({ ...form, baseline_value: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Target")}</Label><Input type="number" step="any" value={form.target_value} onChange={e => setForm({ ...form, target_value: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Actual")}</Label><Input type="number" step="any" value={form.actual_value} onChange={e => setForm({ ...form, actual_value: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>{pt("Date")}</Label><Input type="date" value={form.measurement_date} onChange={e => setForm({ ...form, measurement_date: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Notes")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default LSSGreenMeasurements;
