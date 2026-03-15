import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Package, Trash2, Pencil, Rocket } from "lucide-react";
import { toast } from "sonner";

const ScrumIncrements = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [increments, setIncrements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", version: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/scrum/increments/`, { headers }); if (r.ok) { const d = await r.json(); setIncrements(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", version: "" }); setDialogOpen(true); };
  const openEdit = (inc: any) => { setEditing(inc); setForm({ name: inc.name || "", description: inc.description || "", version: inc.version || "" }); setDialogOpen(true); };
  const handleSave = async () => { if (!form.name) { toast.error(pt("Name is required")); return; } setSubmitting(true); try { const url = editing ? `/api/v1/projects/${id}/scrum/increments/${editing.id}/` : `/api/v1/projects/${id}/scrum/increments/`; const method = editing ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(form) }); if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); } };
  const handleRelease = async (incId: number) => { try { const r = await fetch(`/api/v1/projects/${id}/scrum/increments/${incId}/release/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success(pt("Released")); fetchData(); } } catch { toast.error(pt("Release failed")); } };
  const handleDelete = async (incId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/scrum/increments/${incId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Package className="h-6 w-6 text-green-500" /><h1 className="text-2xl font-bold">{pt("Increments")}</h1><Badge variant="outline">{increments.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Create")}</Button></div>
        {increments.length === 0 ? <Card className="p-8 text-center"><Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No increments yet")}</h3></Card> : (
          <div className="space-y-3">{increments.map(inc => (<Card key={inc.id}><CardContent className="p-4 flex items-center justify-between"><div><div className="flex items-center gap-2 mb-1"><p className="font-medium">{inc.name}</p>{inc.version && <Badge variant="outline">{inc.version}</Badge>}<Badge variant={inc.status === "released" ? "default" : "secondary"}>{inc.status}</Badge></div>{inc.description && <p className="text-sm text-muted-foreground">{inc.description}</p>}</div><div className="flex gap-1">{inc.status !== "released" && <Button variant="ghost" size="sm" onClick={() => handleRelease(inc.id)}><Rocket className="h-4 w-4 text-blue-500" /></Button>}<Button variant="ghost" size="sm" onClick={() => openEdit(inc)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(inc.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></CardContent></Card>))}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Create")} Increment</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><Label>Version</Label><Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default ScrumIncrements;
