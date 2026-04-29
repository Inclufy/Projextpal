import { useState } from "react";
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
import { Loader2, Plus, Gauge, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";

const fetchJson = async (url: string) => {
  const token = localStorage.getItem("access_token");
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
};
const toArr = (d: any) => (Array.isArray(d) ? d : d?.results || []);

const LSSGreenMetrics = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ cp: "", cpk: "", defects_per_million: "", sigma_level: "", notes: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const metricsQ = useQuery({ queryKey: ["lssg-metrics", id], queryFn: () => fetchJson(`/api/v1/lss-green/projects/${id}/metrics/`), enabled: !!id });
  const metrics = toArr(metricsQ.data);
  const refresh = () => qc.invalidateQueries({ queryKey: ["lssg-metrics", id] });

  const openCreate = () => { setEditing(null); setForm({ cp: "", cpk: "", defects_per_million: "", sigma_level: "", notes: "" }); setDialogOpen(true); };
  const openEdit = (m: any) => { setEditing(m); setForm({ cp: String(m.cp ?? ""), cpk: String(m.cpk ?? ""), defects_per_million: String(m.defects_per_million ?? ""), sigma_level: String(m.sigma_level ?? ""), notes: m.notes || "" }); setDialogOpen(true); };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const body: any = { notes: form.notes };
      ["cp", "cpk", "defects_per_million", "sigma_level"].forEach(k => { const v = (form as any)[k]; if (v !== "") body[k] = parseFloat(v); });
      const url = editing ? `/api/v1/lss-green/projects/${id}/metrics/${editing.id}/` : `/api/v1/lss-green/projects/${id}/metrics/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); refresh(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (mId: number) => {
    if (!confirm(pt("Delete this metric?"))) return;
    try { const r = await fetch(`/api/v1/lss-green/projects/${id}/metrics/${mId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); refresh(); } } catch { toast.error(pt("Delete failed")); }
  };

  const chartData = [...metrics].reverse().map((m: any, i: number) => ({ name: `#${i + 1}`, Cp: m.cp || 0, Cpk: m.cpk || 0, Sigma: m.sigma_level || 0 }));

  if (metricsQ.isLoading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Gauge className="h-6 w-6 text-green-500" /><h1 className="text-2xl font-bold">{pt("Quality Metrics")}</h1><Badge variant="outline">{metrics.length}</Badge></div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add Metric")}</Button>
        </div>

        {chartData.length > 0 && (
          <Card><CardHeader className="pb-3"><CardTitle>{pt("Trend")}</CardTitle></CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip /><Legend />
                    <Line type="monotone" dataKey="Cp" stroke="#22c55e" />
                    <Line type="monotone" dataKey="Cpk" stroke="#3b82f6" />
                    <Line type="monotone" dataKey="Sigma" stroke="#a855f7" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        <Card><CardContent className="p-0">
          {metrics.length === 0 ? <p className="text-center text-muted-foreground py-12">{pt("No metrics yet")}</p> : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead className="bg-muted/50"><tr><th className="text-left p-3">Cp</th><th className="text-left p-3">Cpk</th><th className="text-left p-3">DPMO</th><th className="text-left p-3">Sigma</th><th className="text-left p-3">{pt("Notes")}</th><th className="p-3"></th></tr></thead>
              <tbody className="divide-y">{metrics.map((m: any) => (
                <tr key={m.id} className="hover:bg-muted/30">
                  <td className="p-3 font-mono">{m.cp ?? "—"}</td>
                  <td className="p-3 font-mono">{m.cpk ?? "—"}</td>
                  <td className="p-3 font-mono">{m.defects_per_million ?? "—"}</td>
                  <td className="p-3 font-mono">{m.sigma_level ?? "—"}</td>
                  <td className="p-3 text-muted-foreground truncate max-w-xs">{m.notes || "—"}</td>
                  <td className="p-3 text-right whitespace-nowrap">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(m)}><Pencil className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                  </td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </CardContent></Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent>
        <DialogHeader><DialogTitle>{editing ? pt("Edit Metric") : pt("Add Metric")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>Cp</Label><Input type="number" step="0.01" value={form.cp} onChange={e => setForm({ ...form, cp: e.target.value })} /></div>
            <div className="space-y-2"><Label>Cpk</Label><Input type="number" step="0.01" value={form.cpk} onChange={e => setForm({ ...form, cpk: e.target.value })} /></div>
            <div className="space-y-2"><Label>DPMO</Label><Input type="number" value={form.defects_per_million} onChange={e => setForm({ ...form, defects_per_million: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Sigma Level")}</Label><Input type="number" step="0.1" value={form.sigma_level} onChange={e => setForm({ ...form, sigma_level: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>{pt("Notes")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default LSSGreenMetrics;
