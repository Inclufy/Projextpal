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
import { Loader2, Plus, Users, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AgileUserPersonas = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [personas, setPersonas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", role: "", age_range: "", background: "", goals: "", pain_points: "", quote: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/agile/personas/`, { headers }); if (r.ok) { const d = await r.json(); setPersonas(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ name: "", role: "", age_range: "", background: "", goals: "", pain_points: "", quote: "" }); setDialogOpen(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ name: p.name || "", role: p.role || "", age_range: p.age_range || "", background: p.background || "", goals: Array.isArray(p.goals) ? p.goals.join("\n") : (p.goals || ""), pain_points: Array.isArray(p.pain_points) ? p.pain_points.join("\n") : (p.pain_points || ""), quote: p.quote || "" }); setDialogOpen(true); };
  const handleSave = async () => { if (!form.name) { toast.error("Naam verplicht"); return; } setSubmitting(true); try { const url = editing ? `/api/v1/projects/${id}/agile/personas/${editing.id}/` : `/api/v1/projects/${id}/agile/personas/`; const method = editing ? "PATCH" : "POST"; const body = { ...form, goals: form.goals ? form.goals.split("\n").map(s => s.trim()).filter(Boolean) : [], pain_points: form.pain_points ? form.pain_points.split("\n").map(s => s.trim()).filter(Boolean) : [] }; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) }); if (r.ok) { toast.success("Opgeslagen"); setDialogOpen(false); fetchData(); } else toast.error("Opslaan mislukt"); } catch { toast.error("Opslaan mislukt"); } finally { setSubmitting(false); } };
  const handleDelete = async (pId: number) => { if (!confirm("Verwijderen?")) return; try { const r = await fetch(`/api/v1/projects/${id}/agile/personas/${pId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success("Verwijderd"); fetchData(); } } catch { toast.error("Verwijderen mislukt"); } };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Users className="h-6 w-6 text-pink-500" /><h1 className="text-2xl font-bold">{pt("User Personas")}</h1><Badge variant="outline">{personas.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add Persona")}</Button></div>
        {personas.length === 0 ? <Card className="p-8 text-center"><Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No personas yet")}</h3></Card> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{personas.map(p => (
            <Card key={p.id} className="group relative"><CardContent className="p-4">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div>
              <div className="flex items-center gap-3 mb-3"><div className="h-12 w-12 rounded-full bg-pink-100 flex items-center justify-center"><span className="text-lg font-bold text-pink-600">{p.name?.charAt(0)}</span></div><div><p className="font-semibold">{p.name}</p>{p.role && <p className="text-xs text-muted-foreground">{p.role}</p>}{p.age_range && <p className="text-xs text-muted-foreground">{p.age_range}</p>}</div></div>
              {p.goals && (Array.isArray(p.goals) ? p.goals.length > 0 : p.goals) && <div className="mb-2"><p className="text-xs font-semibold text-muted-foreground">🎯 Goals</p><p className="text-sm">{Array.isArray(p.goals) ? p.goals.join(", ") : p.goals}</p></div>}
              {p.pain_points && (Array.isArray(p.pain_points) ? p.pain_points.length > 0 : p.pain_points) && <div className="mb-2"><p className="text-xs font-semibold text-muted-foreground">😤 Pain Points</p><p className="text-sm">{Array.isArray(p.pain_points) ? p.pain_points.join(", ") : p.pain_points}</p></div>}
              {p.quote && <div><p className="text-xs font-semibold text-muted-foreground">💬 Quote</p><p className="text-sm italic">"{p.quote}"</p></div>}
            </CardContent></Card>
          ))}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} Persona</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-3 gap-4"><div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="space-y-2"><Label>{pt("Role")}</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div><div className="space-y-2"><Label>{pt("Age Range")}</Label><Input placeholder="25-35" value={form.age_range} onChange={(e) => setForm({ ...form, age_range: e.target.value })} /></div></div>
          <div className="space-y-2"><Label>{pt("Background")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.background} onChange={(e) => setForm({ ...form, background: e.target.value })} /></div>
          <div className="space-y-2"><Label>Goals ({pt("one per line")})</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.goals} onChange={(e) => setForm({ ...form, goals: e.target.value })} /></div>
          <div className="space-y-2"><Label>Pain Points ({pt("one per line")})</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.pain_points} onChange={(e) => setForm({ ...form, pain_points: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Quote")}</Label><Input value={form.quote} onChange={(e) => setForm({ ...form, quote: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default AgileUserPersonas;
