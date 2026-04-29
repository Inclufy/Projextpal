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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, FlaskConical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const fetchJson = async (url: string) => {
  const token = localStorage.getItem("access_token");
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
};
const toArr = (d: any) => (Array.isArray(d) ? d : d?.results || []);

const DESIGN_TYPES = [
  { value: "full_factorial", label: "Full Factorial" },
  { value: "fractional_factorial", label: "Fractional Factorial" },
  { value: "response_surface", label: "Response Surface" },
  { value: "taguchi", label: "Taguchi" },
  { value: "plackett_burman", label: "Plackett-Burman" },
];

const LSSBlackDOE = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ experiment_name: "", design_type: "full_factorial", levels: "2", response_variable: "", objective: "", conclusion: "", factors: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const doeQ = useQuery({ queryKey: ["lssb-doe", id], queryFn: () => fetchJson(`/api/v1/lss-black/projects/${id}/doe/`), enabled: !!id });
  const items = toArr(doeQ.data);
  const refresh = () => qc.invalidateQueries({ queryKey: ["lssb-doe", id] });

  const openCreate = () => { setEditing(null); setForm({ experiment_name: "", design_type: "full_factorial", levels: "2", response_variable: "", objective: "", conclusion: "", factors: "" }); setDialogOpen(true); };
  const openEdit = (e: any) => {
    setEditing(e);
    setForm({
      experiment_name: e.experiment_name || "",
      design_type: e.design_type || "full_factorial",
      levels: String(e.levels ?? "2"),
      response_variable: e.response_variable || "",
      objective: e.objective || "",
      conclusion: e.conclusion || "",
      factors: Array.isArray(e.factors) ? e.factors.join(", ") : "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.experiment_name) { toast.error(pt("Name is required")); return; }
    setSubmitting(true);
    try {
      const body: any = {
        experiment_name: form.experiment_name,
        design_type: form.design_type,
        levels: parseInt(form.levels) || 2,
        response_variable: form.response_variable,
        objective: form.objective,
        conclusion: form.conclusion,
        factors: form.factors ? form.factors.split(",").map(s => s.trim()).filter(Boolean) : [],
      };
      const url = editing ? `/api/v1/lss-black/projects/${id}/doe/${editing.id}/` : `/api/v1/lss-black/projects/${id}/doe/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); refresh(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (eId: string) => {
    if (!confirm(pt("Delete this experiment?"))) return;
    try { const r = await fetch(`/api/v1/lss-black/projects/${id}/doe/${eId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); refresh(); } } catch { toast.error(pt("Delete failed")); }
  };

  if (doeQ.isLoading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><FlaskConical className="h-6 w-6 text-purple-500" /><h1 className="text-2xl font-bold">{pt("Design of Experiments")}</h1><Badge variant="outline">{items.length}</Badge></div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Experiment")}</Button>
        </div>

        <Card><CardContent className="p-0">
          {items.length === 0 ? <p className="text-center text-muted-foreground py-12">{pt("No experiments yet")}</p> : (
            <div className="divide-y">{items.map((d: any) => (
              <div key={d.id} className="p-4 hover:bg-muted/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1"><span className="font-semibold">{d.experiment_name}</span><Badge variant="outline" className="text-xs">{d.design_type_display || d.design_type}</Badge><Badge variant="outline" className="text-xs">{d.levels} {pt("levels")}</Badge></div>
                    {d.response_variable && <p className="text-xs text-muted-foreground">{pt("Response")}: {d.response_variable}</p>}
                    {d.factors && d.factors.length > 0 && <p className="text-xs text-muted-foreground mt-1">{pt("Factors")}: {Array.isArray(d.factors) ? d.factors.join(", ") : ""}</p>}
                    {d.objective && <p className="text-sm mt-2">{d.objective}</p>}
                  </div>
                  <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(d)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(d.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div>
                </div>
              </div>
            ))}</div>
          )}
        </CardContent></Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{editing ? pt("Edit Experiment") : pt("New Experiment")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Experiment Name")} *</Label><Input value={form.experiment_name} onChange={e => setForm({ ...form, experiment_name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>{pt("Design Type")}</Label><Select value={form.design_type} onValueChange={v => setForm({ ...form, design_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{DESIGN_TYPES.map(d => <SelectItem key={d.value} value={d.value}>{d.label}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>{pt("Levels")}</Label><Input type="number" value={form.levels} onChange={e => setForm({ ...form, levels: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>{pt("Response Variable")}</Label><Input value={form.response_variable} onChange={e => setForm({ ...form, response_variable: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Factors (comma-separated)")}</Label><Input value={form.factors} onChange={e => setForm({ ...form, factors: e.target.value })} placeholder="Temperature, Pressure, Speed" /></div>
          <div className="space-y-2"><Label>{pt("Objective")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Conclusion")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.conclusion} onChange={e => setForm({ ...form, conclusion: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default LSSBlackDOE;
