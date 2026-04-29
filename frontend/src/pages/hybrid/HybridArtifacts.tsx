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
import { Loader2, Plus, FileText, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const fetchJson = async (url: string) => {
  const token = localStorage.getItem("access_token");
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
};
const toArr = (d: any) => (Array.isArray(d) ? d : d?.results || []);

const SOURCES = ["scrum", "kanban", "waterfall", "agile", "prince2", "lean_six_sigma_green", "lean_six_sigma_black", "pmi", "safe", "msp"];
const STATUSES = ["active", "draft", "archived"];

const HybridArtifacts = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", source_methodology: "scrum", description: "", status: "active" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const artQ = useQuery({ queryKey: ["hybrid-artifacts", id], queryFn: () => fetchJson(`/api/v1/projects/${id}/hybrid/artifacts/`), enabled: !!id });
  const items = toArr(artQ.data);
  const refresh = () => qc.invalidateQueries({ queryKey: ["hybrid-artifacts", id] });

  const openCreate = () => { setEditing(null); setForm({ name: "", source_methodology: "scrum", description: "", status: "active" }); setDialogOpen(true); };
  const openEdit = (a: any) => { setEditing(a); setForm({ name: a.name || "", source_methodology: a.source_methodology || "scrum", description: a.description || "", status: a.status || "active" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.name) { toast.error(pt("Name is required")); return; }
    setSubmitting(true);
    try {
      const body = { ...form };
      const url = editing ? `/api/v1/projects/${id}/hybrid/artifacts/${editing.id}/` : `/api/v1/projects/${id}/hybrid/artifacts/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); refresh(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (aId: string) => {
    if (!confirm(pt("Delete this artifact?"))) return;
    try { const r = await fetch(`/api/v1/projects/${id}/hybrid/artifacts/${aId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); refresh(); } } catch { toast.error(pt("Delete failed")); }
  };

  if (artQ.isLoading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><FileText className="h-6 w-6 text-blue-500" /><h1 className="text-2xl font-bold">{pt("Hybrid Artifacts")}</h1><Badge variant="outline">{items.length}</Badge></div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Artifact")}</Button>
        </div>

        <Card><CardContent className="p-0">
          {items.length === 0 ? <p className="text-center text-muted-foreground py-12">{pt("No artifacts yet")}</p> : (
            <div className="divide-y">{items.map((a: any) => (
              <div key={a.id} className="p-4 hover:bg-muted/30 flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{a.name}</span>
                    <Badge variant="outline" className="text-xs">{a.source_methodology}</Badge>
                    <Badge className={`text-xs ${a.status === "active" ? "bg-green-100 text-green-700" : a.status === "archived" ? "bg-gray-100 text-gray-700" : "bg-yellow-100 text-yellow-700"}`}>{a.status}</Badge>
                  </div>
                  {a.description && <p className="text-sm text-muted-foreground">{a.description}</p>}
                </div>
                <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(a)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(a.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div>
              </div>
            ))}</div>
          )}
        </CardContent></Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent>
        <DialogHeader><DialogTitle>{editing ? pt("Edit Artifact") : pt("New Artifact")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>{pt("Source Methodology")}</Label><Select value={form.source_methodology} onValueChange={v => setForm({ ...form, source_methodology: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{SOURCES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>{pt("Status")}</Label><Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default HybridArtifacts;
