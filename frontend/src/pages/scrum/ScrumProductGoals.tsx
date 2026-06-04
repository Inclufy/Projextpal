import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Target, Trash2, Pencil, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const ScrumProductGoals = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", target_date: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/scrum/product-goals/`, { headers }); if (r.ok) { const d = await r.json(); setGoals(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ title: "", description: "", target_date: "" }); setDialogOpen(true); };
  const openEdit = (g: any) => { setEditing(g); setForm({ title: g.title || "", description: g.description || "", target_date: g.target_date || "" }); setDialogOpen(true); };
  const handleSave = async () => {
    if (!form.title.trim()) { toast.error(pt("Title is required")); return; }
    setSubmitting(true);
    try {
      const url = editing ? `/api/v1/projects/${id}/scrum/product-goals/${editing.id}/` : `/api/v1/projects/${id}/scrum/product-goals/`;
      const method = editing ? "PATCH" : "POST";
      const body: any = { title: form.title, description: form.description };
      if (form.target_date) body.target_date = form.target_date;
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); }
  };
  const handleAchieve = async (gId: number) => { try { const r = await fetch(`/api/v1/projects/${id}/scrum/product-goals/${gId}/achieve/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success(pt("Product Goal achieved")); fetchData(); } } catch { toast.error(pt("Action failed")); } };
  const handleDelete = async (gId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/scrum/product-goals/${gId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Target className="h-6 w-6 text-emerald-500" /><h1 className="text-2xl font-bold">{pt("Product Goals")}</h1><Badge variant="outline">{goals.length}</Badge></div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Goal")}</Button>
        </div>
        <p className="text-sm text-muted-foreground -mt-3">{pt("The long-term objectives the Product Backlog serves. Backlog items trace to a Product Goal so each Sprint advances the product.")}</p>

        {goals.length === 0 ? <Card className="p-8 text-center"><Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No product goals yet")}</h3></Card> : (
          <div className="space-y-3">{goals.map(g => {
            const total = g.item_count || 0; const done = g.done_item_count || 0;
            const pct = total > 0 ? Math.round((done / total) * 100) : 0;
            return (
              <Card key={g.id}><CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1">
                    <p className="font-semibold flex items-center gap-2">{g.title}<Badge variant={g.status === "achieved" ? "default" : g.status === "abandoned" ? "secondary" : "outline"}>{g.status}</Badge></p>
                    {g.description && <p className="text-sm text-muted-foreground mt-1">{g.description}</p>}
                    {g.target_date && <p className="text-xs text-muted-foreground mt-1">{pt("Target")}: {new Date(g.target_date).toLocaleDateString()}</p>}
                    <div className="mt-2 flex items-center gap-2"><Progress value={pct} className="h-2 flex-1 max-w-xs" /><span className="text-xs text-muted-foreground">{done}/{total} {pt("items done")}</span></div>
                  </div>
                  <div className="flex gap-1">
                    {g.status !== "achieved" && <Button variant="ghost" size="sm" onClick={() => handleAchieve(g.id)} title={pt("Mark achieved")}><CheckCircle2 className="h-4 w-4 text-green-500" /></Button>}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(g)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(g.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              </CardContent></Card>
            );
          })}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("New")} {pt("Product Goal")}</DialogTitle><DialogDescription>{pt("A single long-term objective for the product.")}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Target Date")}</Label><Input type="date" value={form.target_date} onChange={(e) => setForm({ ...form, target_date: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default ScrumProductGoals;
