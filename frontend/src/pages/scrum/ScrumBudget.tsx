import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, DollarSign, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ScrumBudget = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [expenses, setExpenses] = useState<any[]>([]);
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", category: "labor_cost", status: "pending", date: new Date().toISOString().split("T")[0] });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [eRes, pRes] = await Promise.all([
        fetch(`/api/v1/expenses/?project=${id}`, { headers }),
        fetch(`/api/v1/projects/${id}/`, { headers }),
      ]);
      if (eRes.ok) { const d = await eRes.json(); setExpenses(Array.isArray(d) ? d : d.results || []); }
      if (pRes.ok) setProject(await pRes.json());
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ title: "", amount: "", category: "labor_cost", status: "pending", date: new Date().toISOString().split("T")[0] }); setDialogOpen(true); };
  const openEdit = (e: any) => { setEditing(e); setForm({ title: e.title, amount: String(e.amount), category: e.category || "labor_cost", status: e.status || "pending", date: e.date?.split("T")[0] || "" }); setDialogOpen(true); };
  const handleSave = async () => { if (!form.title || !form.amount) { toast.error(pt("Title and amount required")); return; } setSubmitting(true); try { const body = { ...form, amount: parseFloat(form.amount), project: parseInt(id!) }; const url = editing ? `/api/v1/expenses/${editing.id}/` : `/api/v1/expenses/`; const method = editing ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) }); if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); } };
  const handleDelete = async (eId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/expenses/${eId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };

  const totalBudget = project?.budget || 0;
  const totalSpent = expenses.filter(e => e.status === "paid").reduce((s, e) => s + parseFloat(e.amount || 0), 0);
  const pct = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><DollarSign className="h-6 w-6 text-green-500" /><h1 className="text-2xl font-bold">{pt("Budget")}</h1></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add Expense")}</Button></div>
        <div className="grid grid-cols-3 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Total Budget")}</p><p className="text-2xl font-bold">€{totalBudget.toLocaleString()}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Spent")}</p><p className="text-2xl font-bold">€{totalSpent.toLocaleString()}</p><Progress value={pct} className="h-2 mt-2" /></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">{pt("Remaining")}</p><p className={`text-2xl font-bold ${totalBudget - totalSpent < 0 ? "text-red-500" : "text-green-500"}`}>€{(totalBudget - totalSpent).toLocaleString()}</p></CardContent></Card>
        </div>
        {expenses.length === 0 ? <Card className="p-8 text-center"><DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No expenses yet")}</h3></Card> : (
          <Card><CardContent className="p-0"><div className="divide-y">{expenses.map(e => (
            <div key={e.id} className="flex items-center justify-between p-4 hover:bg-muted/50"><div><p className="font-medium">{e.title}</p><div className="flex gap-2 mt-1"><Badge variant="outline" className="text-xs">{e.category}</Badge><Badge variant={e.status === "paid" ? "default" : "secondary"} className="text-xs">{e.status}</Badge>{e.date && <span className="text-xs text-muted-foreground">{e.date}</span>}</div></div><div className="flex items-center gap-2"><span className="font-bold">€{parseFloat(e.amount).toLocaleString()}</span><Button variant="ghost" size="sm" onClick={() => openEdit(e)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(e.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></div>
          ))}</div></CardContent></Card>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} Expense</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>{pt("Amount")} *</Label><Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div><div className="space-y-2"><Label>{pt("Date")}</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div></div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>{pt("Category")}</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="labor_cost">Labor</SelectItem><SelectItem value="material_cost">Material</SelectItem><SelectItem value="software">Software</SelectItem><SelectItem value="hardware">Hardware</SelectItem><SelectItem value="travel">Travel</SelectItem><SelectItem value="other">Other</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>{pt("Status")}</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="paid">Paid</SelectItem><SelectItem value="cancelled">Cancelled</SelectItem></SelectContent></Select></div></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default ScrumBudget;
