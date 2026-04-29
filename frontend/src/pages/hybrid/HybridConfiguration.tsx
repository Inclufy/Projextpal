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
import { Loader2, Plus, Settings, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const fetchJson = async (url: string) => {
  const token = localStorage.getItem("access_token");
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
};
const toArr = (d: any) => (Array.isArray(d) ? d : d?.results || []);

const METHODOLOGIES = ["scrum", "kanban", "waterfall", "agile", "prince2", "lean_six_sigma_green", "lean_six_sigma_black", "pmi", "safe", "msp"];

const HybridConfiguration = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ primary_methodology: "scrum", secondary_methodologies: "", approach_description: "", rationale: "", is_active: true });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const cfgQ = useQuery({ queryKey: ["hybrid-configs", id], queryFn: () => fetchJson(`/api/v1/projects/${id}/hybrid/configurations/`), enabled: !!id });
  const phasesQ = useQuery({ queryKey: ["hybrid-phases", id], queryFn: () => fetchJson(`/api/v1/projects/${id}/hybrid/phase-methodologies/`), enabled: !!id });

  const configs = toArr(cfgQ.data);
  const phases = toArr(phasesQ.data).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  const refresh = () => qc.invalidateQueries({ queryKey: ["hybrid-configs", id] });

  const openCreate = () => { setEditing(null); setForm({ primary_methodology: "scrum", secondary_methodologies: "", approach_description: "", rationale: "", is_active: true }); setDialogOpen(true); };
  const openEdit = (c: any) => {
    setEditing(c);
    setForm({
      primary_methodology: c.primary_methodology || "scrum",
      secondary_methodologies: Array.isArray(c.secondary_methodologies) ? c.secondary_methodologies.join(", ") : "",
      approach_description: c.approach_description || "",
      rationale: c.rationale || "",
      is_active: !!c.is_active,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const body: any = {
        primary_methodology: form.primary_methodology,
        secondary_methodologies: form.secondary_methodologies ? form.secondary_methodologies.split(",").map(s => s.trim()).filter(Boolean) : [],
        approach_description: form.approach_description,
        rationale: form.rationale,
        is_active: form.is_active,
      };
      const url = editing ? `/api/v1/projects/${id}/hybrid/configurations/${editing.id}/` : `/api/v1/projects/${id}/hybrid/configurations/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); refresh(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (cId: string) => {
    if (!confirm(pt("Delete this configuration?"))) return;
    try { const r = await fetch(`/api/v1/projects/${id}/hybrid/configurations/${cId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); refresh(); } } catch { toast.error(pt("Delete failed")); }
  };

  if (cfgQ.isLoading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Settings className="h-6 w-6 text-purple-500" /><h1 className="text-2xl font-bold">{pt("Hybrid Configuration")}</h1></div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Configuration")}</Button>
        </div>

        <Card><CardHeader className="pb-3"><CardTitle>{pt("Configurations")}</CardTitle></CardHeader>
          <CardContent>{configs.length === 0 ? <p className="text-center text-muted-foreground py-8">{pt("No configurations yet")}</p> : (
            <div className="space-y-3">{configs.map((c: any) => (
              <div key={c.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">{pt("Primary")}:</span>
                    <Badge>{c.primary_methodology}</Badge>
                    {c.is_active && <Badge className="bg-green-100 text-green-700">{pt("Active")}</Badge>}
                  </div>
                  <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div>
                </div>
                {Array.isArray(c.secondary_methodologies) && c.secondary_methodologies.length > 0 && (
                  <div className="flex items-center gap-2 mb-2"><span className="text-sm text-muted-foreground">{pt("Secondary")}:</span>{c.secondary_methodologies.map((m: string) => <Badge key={m} variant="outline">{m}</Badge>)}</div>
                )}
                {c.approach_description && <p className="text-sm mb-2"><span className="font-medium">{pt("Approach")}:</span> {c.approach_description}</p>}
                {c.rationale && <p className="text-sm text-muted-foreground"><span className="font-medium">{pt("Rationale")}:</span> {c.rationale}</p>}
              </div>
            ))}</div>
          )}</CardContent>
        </Card>

        <Card><CardHeader className="pb-3"><CardTitle>{pt("Phase Methodology Mapping")}</CardTitle></CardHeader>
          <CardContent>
            {phases.length === 0 ? <p className="text-center text-muted-foreground py-4">{pt("No phases configured. Add phases in the Phases page.")}</p> : (
              <div className="overflow-x-auto"><table className="w-full text-sm">
                <thead className="bg-muted/50 text-xs"><tr><th className="text-left p-2">#</th><th className="text-left p-2">{pt("Phase")}</th><th className="text-left p-2">{pt("Methodology")}</th><th className="text-left p-2">{pt("Start")}</th><th className="text-left p-2">{pt("End")}</th><th className="text-left p-2">{pt("Progress")}</th></tr></thead>
                <tbody className="divide-y">{phases.map((p: any) => (
                  <tr key={p.id}>
                    <td className="p-2">{p.order ?? "—"}</td>
                    <td className="p-2 font-medium">{p.phase}</td>
                    <td className="p-2"><Badge variant="outline">{p.methodology}</Badge></td>
                    <td className="p-2 text-xs">{p.start_date || "—"}</td>
                    <td className="p-2 text-xs">{p.end_date || "—"}</td>
                    <td className="p-2 font-mono">{p.progress ?? 0}%</td>
                  </tr>
                ))}</tbody>
              </table></div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent>
        <DialogHeader><DialogTitle>{editing ? pt("Edit Configuration") : pt("New Configuration")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Primary Methodology")}</Label><Select value={form.primary_methodology} onValueChange={v => setForm({ ...form, primary_methodology: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{METHODOLOGIES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>{pt("Secondary Methodologies (comma-separated)")}</Label><Input value={form.secondary_methodologies} onChange={e => setForm({ ...form, secondary_methodologies: e.target.value })} placeholder="kanban, waterfall" /></div>
          <div className="space-y-2"><Label>{pt("Approach Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.approach_description} onChange={e => setForm({ ...form, approach_description: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Rationale")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.rationale} onChange={e => setForm({ ...form, rationale: e.target.value })} /></div>
          <div className="flex items-center gap-2"><input type="checkbox" id="is_active" checked={form.is_active} onChange={e => setForm({ ...form, is_active: e.target.checked })} /><Label htmlFor="is_active">{pt("Active configuration")}</Label></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default HybridConfiguration;
