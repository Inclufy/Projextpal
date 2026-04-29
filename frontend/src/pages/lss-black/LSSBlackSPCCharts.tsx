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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, BarChart3, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from "recharts";

const fetchJson = async (url: string) => {
  const token = localStorage.getItem("access_token");
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
};
const toArr = (d: any) => (Array.isArray(d) ? d : d?.results || []);

const CHART_TYPES = [
  { value: "x_bar_r", label: "X-bar R" },
  { value: "x_bar_s", label: "X-bar S" },
  { value: "individuals", label: "Individuals (I-MR)" },
  { value: "p_chart", label: "P Chart" },
  { value: "np_chart", label: "NP Chart" },
  { value: "c_chart", label: "C Chart" },
  { value: "u_chart", label: "U Chart" },
];

const LSSBlackSPCCharts = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ chart_type: "x_bar_r", ucl: "", center_line: "", lcl: "", usl: "", lsl: "", subgroup_size: "5", notes: "", data_points: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const spcQ = useQuery({ queryKey: ["lssb-spc", id], queryFn: () => fetchJson(`/api/v1/lss-black/projects/${id}/spc-charts/`), enabled: !!id });
  const charts = toArr(spcQ.data);
  const refresh = () => qc.invalidateQueries({ queryKey: ["lssb-spc", id] });

  const openCreate = () => { setEditing(null); setForm({ chart_type: "x_bar_r", ucl: "", center_line: "", lcl: "", usl: "", lsl: "", subgroup_size: "5", notes: "", data_points: "" }); setDialogOpen(true); };
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      chart_type: c.chart_type || "x_bar_r",
      ucl: String(c.ucl ?? ""),
      center_line: String(c.center_line ?? ""),
      lcl: String(c.lcl ?? ""),
      usl: String(c.usl ?? ""),
      lsl: String(c.lsl ?? ""),
      subgroup_size: String(c.subgroup_size ?? "5"),
      notes: c.notes || "",
      data_points: Array.isArray(c.data_points) ? c.data_points.join(", ") : "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (form.ucl === "" || form.center_line === "" || form.lcl === "") { toast.error(pt("UCL, Center, and LCL are required")); return; }
    setSubmitting(true);
    try {
      const body: any = {
        chart_type: form.chart_type,
        ucl: parseFloat(form.ucl),
        center_line: parseFloat(form.center_line),
        lcl: parseFloat(form.lcl),
        subgroup_size: parseInt(form.subgroup_size) || 5,
        notes: form.notes,
        data_points: form.data_points ? form.data_points.split(",").map(s => parseFloat(s.trim())).filter(v => !isNaN(v)) : [],
      };
      if (form.usl !== "") body.usl = parseFloat(form.usl);
      if (form.lsl !== "") body.lsl = parseFloat(form.lsl);
      const url = editing ? `/api/v1/lss-black/projects/${id}/spc-charts/${editing.id}/` : `/api/v1/lss-black/projects/${id}/spc-charts/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); refresh(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (cId: string) => {
    if (!confirm(pt("Delete this chart?"))) return;
    try { const r = await fetch(`/api/v1/lss-black/projects/${id}/spc-charts/${cId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); refresh(); } } catch { toast.error(pt("Delete failed")); }
  };

  if (spcQ.isLoading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><BarChart3 className="h-6 w-6 text-green-500" /><h1 className="text-2xl font-bold">{pt("SPC Charts")}</h1><Badge variant="outline">{charts.length}</Badge></div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Chart")}</Button>
        </div>

        {charts.length === 0 ? <Card className="p-8 text-center"><BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No SPC charts yet")}</h3></Card> : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{charts.map((c: any) => {
            const points = Array.isArray(c.data_points) ? c.data_points : [];
            const chartData = points.map((v: any, i: number) => ({ name: i + 1, value: typeof v === "number" ? v : parseFloat(v) }));
            return (
              <Card key={c.id}>
                <CardHeader className="pb-2"><CardTitle className="flex items-center justify-between text-base"><div className="flex items-center gap-2"><Badge variant="outline">{c.chart_type_display || c.chart_type}</Badge><span className="text-sm text-muted-foreground">n={c.subgroup_size}</span></div><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                    <div><span className="text-muted-foreground">UCL:</span> <span className="font-mono font-semibold">{c.ucl}</span></div>
                    <div><span className="text-muted-foreground">CL:</span> <span className="font-mono font-semibold">{c.center_line}</span></div>
                    <div><span className="text-muted-foreground">LCL:</span> <span className="font-mono font-semibold">{c.lcl}</span></div>
                  </div>
                  {chartData.length > 0 ? (
                    <div className="h-48"><ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" /><XAxis dataKey="name" /><YAxis /><Tooltip />
                        <ReferenceLine y={c.ucl} stroke="#ef4444" strokeDasharray="3 3" />
                        <ReferenceLine y={c.center_line} stroke="#22c55e" />
                        <ReferenceLine y={c.lcl} stroke="#ef4444" strokeDasharray="3 3" />
                        <Line type="monotone" dataKey="value" stroke="#3b82f6" dot />
                      </LineChart>
                    </ResponsiveContainer></div>
                  ) : <p className="text-sm text-center text-muted-foreground py-8">{pt("No data points")}</p>}
                  {c.notes && <p className="text-xs text-muted-foreground mt-2">{c.notes}</p>}
                </CardContent>
              </Card>
            );
          })}</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{editing ? pt("Edit Chart") : pt("New SPC Chart")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>{pt("Chart Type")}</Label><Select value={form.chart_type} onValueChange={v => setForm({ ...form, chart_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CHART_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>{pt("Subgroup Size")}</Label><Input type="number" value={form.subgroup_size} onChange={e => setForm({ ...form, subgroup_size: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2"><Label>UCL *</Label><Input type="number" step="any" value={form.ucl} onChange={e => setForm({ ...form, ucl: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Center")} *</Label><Input type="number" step="any" value={form.center_line} onChange={e => setForm({ ...form, center_line: e.target.value })} /></div>
            <div className="space-y-2"><Label>LCL *</Label><Input type="number" step="any" value={form.lcl} onChange={e => setForm({ ...form, lcl: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>USL</Label><Input type="number" step="any" value={form.usl} onChange={e => setForm({ ...form, usl: e.target.value })} /></div>
            <div className="space-y-2"><Label>LSL</Label><Input type="number" step="any" value={form.lsl} onChange={e => setForm({ ...form, lsl: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>{pt("Data Points (comma-separated)")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background font-mono text-xs" value={form.data_points} onChange={e => setForm({ ...form, data_points: e.target.value })} placeholder="10.1, 10.2, 9.9, 10.0, ..." /></div>
          <div className="space-y-2"><Label>{pt("Notes")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default LSSBlackSPCCharts;
