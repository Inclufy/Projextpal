import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatBudgetDetailed, getCurrencyFromLanguage } from "@/lib/currencies";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, DollarSign, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const WaterfallBudget = () => {
  const { pt } = usePageTranslations();
  const { language } = useLanguage();
  const { id } = useParams<{ id: string }>();
  const [budget, setBudget] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", amount: "", category: "development", status: "planned" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const fetchData = async () => { try { const [bRes, biRes] = await Promise.all([fetch(`/api/v1/projects/${id}/waterfall/budget/`, { headers }), fetch(`/api/v1/projects/${id}/waterfall/budget/items/`, { headers })]); if (bRes.ok) setBudget(await bRes.json()); if (biRes.ok) { const d = await biRes.json(); setItems(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);
  const openCreate = () => { setEditing(null); setForm({ name: "", amount: "", category: "development", status: "planned" }); setDialogOpen(true); };
  const openEdit = (bi: any) => { setEditing(bi); setForm({ name: bi.name || "", amount: String(bi.amount || ""), category: bi.category || "development", status: bi.status || "planned" }); setDialogOpen(true); };
  const handleSave = async () => { if (!form.name || !form.amount) { toast.error("Naam en bedrag verplicht"); return; } setSubmitting(true); try { const body = { ...form, amount: parseFloat(form.amount) }; const url = editing ? `/api/v1/projects/${id}/waterfall/budget/items/${editing.id}/` : `/api/v1/projects/${id}/waterfall/budget/items/`; const method = editing ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) }); if (r.ok) { toast.success("Opgeslagen"); setDialogOpen(false); fetchData(); } else toast.error("Opslaan mislukt"); } catch { toast.error("Opslaan mislukt"); } finally { setSubmitting(false); } };
  const handleDelete = async (biId: number) => { if (!confirm("Verwijderen?")) return; try { const r = await fetch(`/api/v1/projects/${id}/waterfall/budget/items/${biId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success("Verwijderd"); fetchData(); } } catch { toast.error("Verwijderen mislukt"); } };
  const totalBudget = budget?.total_budget || 0; const totalSpent = budget?.total_spent || items.filter(i => i.status === "spent").reduce((s, i) => s + parseFloat(i.amount || 0), 0); const pct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;
  const formatCurrency = (val: number) => formatBudgetDetailed(val, getCurrencyFromLanguage(language));
  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);
  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><DollarSign className="h-6 w-6 text-green-500" /><h1 className="text-2xl font-bold">{pt("Budget")}</h1></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add Item")}</Button></div>
      <div className="grid grid-cols-3 gap-4"><Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Total Budget")}</p><p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Spent")}</p><p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p><Progress value={pct} className="h-2 mt-2" /></CardContent></Card><Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Remaining")}</p><p className={`text-2xl font-bold ${totalBudget - totalSpent < 0 ? "text-red-500" : "text-green-500"}`}>{formatCurrency(totalBudget - totalSpent)}</p></CardContent></Card></div>
      {items.length === 0 ? <Card className="p-8 text-center"><DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No budget items yet")}</h3></Card> : (
        <Card><CardContent className="p-0"><div className="divide-y">{items.map(bi => (<div key={bi.id} className="flex items-center justify-between p-4 hover:bg-muted/50"><div><p className="font-medium">{bi.name}</p><div className="flex gap-2 mt-1"><Badge variant="outline" className="text-xs">{bi.category}</Badge><Badge variant={bi.status === "spent" ? "default" : "secondary"} className="text-xs">{bi.status}</Badge></div></div><div className="flex items-center gap-2"><span className="font-bold">{formatCurrency(parseFloat(bi.amount))}</span><Button variant="ghost" size="sm" onClick={() => openEdit(bi)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(bi.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></div>))}</div></CardContent></Card>
      )}
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} Budget Item</DialogTitle></DialogHeader><div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="space-y-2"><Label>{pt("Amount")} *</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>{pt("Category")}</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="development">Development</SelectItem><SelectItem value="infrastructure">Infrastructure</SelectItem><SelectItem value="personnel">Personnel</SelectItem><SelectItem value="tools">Tools</SelectItem><SelectItem value="training">Training</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>{pt("Status")}</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="planned">Planned</SelectItem><SelectItem value="committed">Committed</SelectItem><SelectItem value="spent">Spent</SelectItem></SelectContent></Select></div></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div></div></DialogContent></Dialog>
    </div>
  );
};
export default WaterfallBudget;
