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
import { Loader2, Plus, Rocket, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AgileReleasePlanning = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [releases, setReleases] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", version: "", target_date: "", description: "", status: "planning" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/agile/releases/`, { headers }); if (r.ok) { const d = await r.json(); setReleases(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ name: "", version: "", target_date: "", description: "", status: "planning" }); setDialogOpen(true); };
  const openEdit = (r: any) => { setEditing(r); setForm({ name: r.name || "", version: r.version || "", target_date: r.target_date?.split("T")[0] || "", description: r.description || "", status: r.status || "planned" }); setDialogOpen(true); };
  const handleSave = async () => { if (!form.name) { toast.error("Naam verplicht"); return; } setSubmitting(true); try { const url = editing ? `/api/v1/projects/${id}/agile/releases/${editing.id}/` : `/api/v1/projects/${id}/agile/releases/`; const method = editing ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(form) }); if (r.ok) { toast.success("Opgeslagen"); setDialogOpen(false); fetchData(); } else toast.error("Opslaan mislukt"); } catch { toast.error("Opslaan mislukt"); } finally { setSubmitting(false); } };
  const handleDelete = async (rId: number) => { if (!confirm("Verwijderen?")) return; try { const r = await fetch(`/api/v1/projects/${id}/agile/releases/${rId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success("Verwijderd"); fetchData(); } } catch { toast.error("Verwijderen mislukt"); } };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Rocket className="h-6 w-6 text-blue-500" /><h1 className="text-2xl font-bold">{pt("Release Planning")}</h1><Badge variant="outline">{releases.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Release")}</Button></div>
        {releases.length === 0 ? <Card className="p-8 text-center"><Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No releases planned yet")}</h3></Card> : (
          <div className="space-y-3">{releases.map(r => (
            <Card key={r.id}><CardContent className="p-4 flex items-center justify-between">
              <div><div className="flex items-center gap-2 mb-1"><p className="font-semibold">{r.name}</p>{r.version && <Badge variant="outline">{r.version}</Badge>}<Badge variant={r.status === "completed" ? "default" : "secondary"}>{r.status}</Badge></div>{r.description && <p className="text-sm text-muted-foreground">{r.description}</p>}{r.target_date && <p className="text-xs text-muted-foreground mt-1">Target: {r.target_date}</p>}</div>
              <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
            </CardContent></Card>
          ))}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("New")} Release</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="space-y-2"><Label>Version</Label><Input value={form.version} onChange={(e) => setForm({ ...form, version: e.target.value })} /></div></div>
          <div className="space-y-2"><Label>{pt("Target Date")}</Label><Input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default AgileReleasePlanning;
