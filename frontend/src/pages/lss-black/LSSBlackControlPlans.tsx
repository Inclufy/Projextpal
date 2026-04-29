import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Shield, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const fetchJson = async (url: string) => {
  const token = localStorage.getItem("access_token");
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
};
const toArr = (d: any) => (Array.isArray(d) ? d : d?.results || []);

const LSSBlackControlPlans = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ process_step: "", control_method: "", measurement_frequency: "", specification_limits: "", reaction_plan: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const cpQ = useQuery({ queryKey: ["lssb-cp", id], queryFn: () => fetchJson(`/api/v1/lss-black/projects/${id}/control-plans/`), enabled: !!id });
  const plans = toArr(cpQ.data);
  const refresh = () => qc.invalidateQueries({ queryKey: ["lssb-cp", id] });

  const openCreate = () => { setEditing(null); setForm({ process_step: "", control_method: "", measurement_frequency: "", specification_limits: "", reaction_plan: "" }); setDialogOpen(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ process_step: p.process_step || "", control_method: p.control_method || "", measurement_frequency: p.measurement_frequency || "", specification_limits: p.specification_limits || "", reaction_plan: p.reaction_plan || "" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.process_step || !form.control_method) { toast.error(pt("Process step and control method are required")); return; }
    setSubmitting(true);
    try {
      const body = { ...form };
      const url = editing ? `/api/v1/lss-black/projects/${id}/control-plans/${editing.id}/` : `/api/v1/lss-black/projects/${id}/control-plans/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); refresh(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (pId: string) => {
    if (!confirm(pt("Delete this plan?"))) return;
    try { const r = await fetch(`/api/v1/lss-black/projects/${id}/control-plans/${pId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); refresh(); } } catch { toast.error(pt("Delete failed")); }
  };

  if (cpQ.isLoading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Shield className="h-6 w-6 text-orange-500" /><h1 className="text-2xl font-bold">{pt("Control Plans")}</h1><Badge variant="outline">{plans.length}</Badge></div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Plan")}</Button>
        </div>

        <Card><CardContent className="p-0">
          {plans.length === 0 ? <p className="text-center text-muted-foreground py-12">{pt("No control plans yet")}</p> : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs"><tr><th className="text-left p-3">{pt("Process Step")}</th><th className="text-left p-3">{pt("Control Method")}</th><th className="text-left p-3">{pt("Frequency")}</th><th className="text-left p-3">{pt("Specs")}</th><th className="text-left p-3">{pt("Reaction Plan")}</th><th className="p-3"></th></tr></thead>
              <tbody className="divide-y">{plans.map((p: any) => (
                <tr key={p.id} className="hover:bg-muted/30 align-top">
                  <td className="p-3 font-medium">{p.process_step}</td>
                  <td className="p-3">{p.control_method}</td>
                  <td className="p-3 text-xs">{p.measurement_frequency}</td>
                  <td className="p-3 font-mono text-xs">{p.specification_limits || "—"}</td>
                  <td className="p-3 text-xs text-muted-foreground max-w-md">{p.reaction_plan}</td>
                  <td className="p-3 text-right whitespace-nowrap"><Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </CardContent></Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{editing ? pt("Edit Control Plan") : pt("New Control Plan")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Process Step")} *</Label><Input value={form.process_step} onChange={e => setForm({ ...form, process_step: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Control Method")} *</Label><Input value={form.control_method} onChange={e => setForm({ ...form, control_method: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>{pt("Frequency")}</Label><Input value={form.measurement_frequency} onChange={e => setForm({ ...form, measurement_frequency: e.target.value })} placeholder="Hourly, Daily, Weekly..." /></div>
            <div className="space-y-2"><Label>{pt("Specification Limits")}</Label><Input value={form.specification_limits} onChange={e => setForm({ ...form, specification_limits: e.target.value })} placeholder="±0.05 mm" /></div>
          </div>
          <div className="space-y-2"><Label>{pt("Reaction Plan")}</Label><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background" value={form.reaction_plan} onChange={e => setForm({ ...form, reaction_plan: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default LSSBlackControlPlans;
