import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
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

const BASE = (id: string) => `/api/v1/sixsigma/projects/${id}/sixsigma`;

const SixSigmaPareto = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [analyses, setAnalyses] = useState<any[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"analysis" | "category">("analysis");
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [aForm, setAForm] = useState({ name: "", description: "" });
  const [catForm, setCatForm] = useState({ analysis: "", name: "", count: "", order: "" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const [aRes, cRes] = await Promise.all([fetch(`${BASE(id!)}/pareto/`, { headers }), fetch(`${BASE(id!)}/pareto-categories/`, { headers })]); if (aRes.ok) { const d = await aRes.json(); setAnalyses(Array.isArray(d) ? d : d.results || []); } if (cRes.ok) { const d = await cRes.json(); setCategories(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const openCreateA = () => { setDialogType("analysis"); setEditing(null); setAForm({ name: "", description: "" }); setDialogOpen(true); };
  const openCreateCat = (aId?: number) => { setDialogType("category"); setEditing(null); setCatForm({ analysis: String(aId || analyses[0]?.id || ""), name: "", count: "", order: "" }); setDialogOpen(true); };
  const openEditCat = (c: any) => { setDialogType("category"); setEditing(c); setCatForm({ analysis: String(c.analysis || ""), name: c.name || "", count: String(c.count ?? ""), order: String(c.order || "") }); setDialogOpen(true); };

  const saveAnalysis = async () => { if (!aForm.name) { toast.error(pt("Name is required")); return; } setSubmitting(true); try { const url = editing ? `${BASE(id!)}/pareto/${editing.id}/` : `${BASE(id!)}/pareto/`; const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(aForm) }); if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); } };
  const saveCategory = async () => { if (!catForm.name) { toast.error("Naam verplicht"); return; } if (!catForm.analysis) { toast.error(pt("Please select an analysis")); return; } if (catForm.count === "" || isNaN(Number(catForm.count))) { toast.error(pt("Count is required")); return; } setSubmitting(true); try { const body: any = { name: catForm.name, analysis: parseInt(catForm.analysis), count: parseInt(catForm.count) }; if (catForm.order) body.order = parseInt(catForm.order); const url = editing ? `${BASE(id!)}/pareto-categories/${editing.id}/` : `${BASE(id!)}/pareto-categories/`; const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) }); if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); } };
  const deleteA = async (aId: number) => { if (!confirm("Verwijderen?")) return; try { await fetch(`${BASE(id!)}/pareto/${aId}/`, { method: "DELETE", headers }); fetchData(); } catch {} };
  const deleteCat = async (cId: number) => { if (!confirm("Verwijderen?")) return; try { await fetch(`${BASE(id!)}/pareto-categories/${cId}/`, { method: "DELETE", headers }); fetchData(); } catch {} };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><BarChart3 className="h-6 w-6 text-amber-500" /><h1 className="text-2xl font-bold">Pareto Analysis</h1></div><div className="flex gap-2"><Button variant="outline" onClick={() => openCreateCat()}><Plus className="h-4 w-4 mr-1" /> Category</Button><Button onClick={openCreateA}><Plus className="h-4 w-4 mr-1" /> Analysis</Button></div></div>
      {analyses.length === 0 ? <Card className="p-8 text-center"><BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">No Pareto analyses yet</h3></Card> : (
        analyses.map(a => {
          const aCats = categories.filter(c => c.analysis === a.id).sort((x, y) => (y.count || 0) - (x.count || 0));
          const total = aCats.reduce((s, c) => s + (c.count || 0), 0);
          let cum = 0;
          return (
            <Card key={a.id}><CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle>{a.name}</CardTitle><div className="flex gap-1"><Button variant="outline" size="sm" onClick={() => openCreateCat(a.id)}><Plus className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => deleteA(a.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></div></CardHeader>
              <CardContent>{aCats.length === 0 ? <p className="text-muted-foreground text-sm">No categories yet</p> : (
                <div className="space-y-2">{aCats.map(c => { cum += c.count || 0; const pct = total > 0 ? Math.round((c.count / total) * 100) : 0; const cumPct = total > 0 ? Math.round((cum / total) * 100) : 0; return (
                  <div key={c.id} className="flex items-center gap-3"><div className="w-1/3 font-medium text-sm truncate">{c.name}</div><div className="flex-1 h-6 bg-muted rounded relative"><div className="h-full bg-amber-400 rounded" style={{ width: `${pct}%` }} /><span className="absolute inset-0 flex items-center justify-center text-xs font-bold">{c.count || 0} ({pct}%)</span></div><span className="text-xs w-12 text-right text-muted-foreground">{cumPct}%</span><div className="flex gap-0.5"><button onClick={() => openEditCat(c)}><Pencil className="h-3 w-3" /></button><button onClick={() => deleteCat(c.id)}><Trash2 className="h-3 w-3 text-red-500" /></button></div></div>
                ); })}</div>
              )}</CardContent>
            </Card>
          );
        })
      )}
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} {dialogType === "analysis" ? "Pareto Analysis" : "Category"}</DialogTitle></DialogHeader>
      {dialogType === "analysis" ? (
        <div className="space-y-4"><div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={aForm.name} onChange={(e) => setAForm({ ...aForm, name: e.target.value })} /></div><div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[40px] px-3 py-2 border rounded-md bg-background" value={aForm.description} onChange={(e) => setAForm({ ...aForm, description: e.target.value })} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={saveAnalysis} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div></div>
      ) : (
        <div className="space-y-4"><div className="space-y-2"><Label>Analysis</Label><Select value={catForm.analysis} onValueChange={(v) => setCatForm({ ...catForm, analysis: v })}><SelectTrigger><SelectValue placeholder={pt("Select analysis")} /></SelectTrigger><SelectContent>{analyses.map(a => <SelectItem key={a.id} value={a.id.toString()}>{a.name}</SelectItem>)}</SelectContent></Select></div><div className="grid grid-cols-3 gap-3"><div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={catForm.name} onChange={(e) => setCatForm({ ...catForm, name: e.target.value })} /></div><div className="space-y-2"><Label>Count *</Label><Input type="number" value={catForm.count} onChange={(e) => setCatForm({ ...catForm, count: e.target.value })} /></div><div className="space-y-2"><Label>Order</Label><Input type="number" value={catForm.order} onChange={(e) => setCatForm({ ...catForm, order: e.target.value })} /></div></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={saveCategory} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div></div>
      )}
    </DialogContent></Dialog>
    </div>
  );
};
export default SixSigmaPareto;
