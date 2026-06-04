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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, ClipboardCheck, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const METHODS = ["review", "test", "inspection", "audit", "approval"];
const RESULTS = ["pending", "pass", "fail", "conditional"];
const resultColors: Record<string, string> = { pending: "bg-gray-100 text-gray-700", pass: "bg-green-100 text-green-700", fail: "bg-red-100 text-red-700", conditional: "bg-orange-100 text-orange-700" };

const Prince2QualityRegister = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ product_name: "", quality_method: "review", quality_criteria: "", planned_date: "", actual_date: "", result: "pending", reviewer: "", comments: "" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/prince2/quality-register/`, { headers }); if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  const fetchUsers = async () => { try { const r = await fetch(`/api/v1/auth/company-users/members/`, { headers }); if (r.ok) { const d = await r.json(); setUsers(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } };
  useEffect(() => { fetchData(); fetchUsers(); }, [id]);
  const userLabel = (u: any) => u.full_name || u.name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email;
  const today = () => new Date().toISOString().split("T")[0];
  const openCreate = () => { setEditing(null); setForm({ product_name: "", quality_method: "review", quality_criteria: "", planned_date: today(), actual_date: "", result: "pending", reviewer: "", comments: "" }); setDialogOpen(true); };
  const openEdit = (i: any) => { setEditing(i); setForm({ product_name: i.product_name || "", quality_method: i.quality_method || "review", quality_criteria: i.quality_criteria || "", planned_date: i.planned_date?.split("T")[0] || "", actual_date: i.actual_date?.split("T")[0] || "", result: i.result || "pending", reviewer: i.reviewer ? i.reviewer.toString() : "", comments: i.comments || "" }); setDialogOpen(true); };
  const handleSave = async () => {
    if (!form.product_name) { toast.error(pt("Product name is required")); return; }
    setSubmitting(true);
    try {
      const body: any = { ...form, reviewer: form.reviewer ? parseInt(form.reviewer) : null, planned_date: form.planned_date || null, actual_date: form.actual_date || null };
      const url = editing ? `/api/v1/projects/${id}/prince2/quality-register/${editing.id}/` : `/api/v1/projects/${id}/prince2/quality-register/`;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); }
  };
  const handleDelete = async (rId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/prince2/quality-register/${rId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };
  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);
  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><ClipboardCheck className="h-6 w-6 text-teal-500" /><div><h1 className="text-2xl font-bold">{pt("Quality Register")}</h1><p className="text-xs text-muted-foreground">{pt("Planned and executed quality checks per product (Quality theme)")}</p></div><Badge variant="outline">{items.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button></div>
      {items.length === 0 ? <Card className="p-8 text-center"><ClipboardCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No quality checks recorded yet")}</h3></Card> : (
        <div className="space-y-2">{items.map(i => (<Card key={i.id}><CardContent className="p-4 flex items-center justify-between"><div className="flex-1"><div className="flex items-center gap-2 mb-1 flex-wrap"><span className="font-medium">{i.product_name || i.product_title}</span><Badge variant="outline" className="text-xs">{i.quality_method}</Badge><Badge className={`text-xs ${resultColors[i.result] || ""}`}>{i.result}</Badge>{i.reviewer_name && <Badge variant="secondary" className="text-xs">{i.reviewer_name}</Badge>}{i.planned_date && <span className="text-xs text-muted-foreground">{pt("Planned")}: {i.planned_date}</span>}{i.actual_date && <span className="text-xs text-muted-foreground">{pt("Actual")}: {i.actual_date}</span>}</div>{i.quality_criteria && <p className="text-sm text-muted-foreground"><span className="font-medium">{pt("Criteria")}:</span> {i.quality_criteria}</p>}{i.comments && <p className="text-xs mt-1">{i.comments}</p>}</div><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(i)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(i.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></CardContent></Card>))}</div>
      )}
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} {pt("Quality Check")}</DialogTitle></DialogHeader><div className="space-y-4">
      <div className="space-y-2"><Label>{pt("Product")} *</Label><Input value={form.product_name} onChange={(e) => setForm({ ...form, product_name: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>{pt("Method")}</Label><Select value={form.quality_method} onValueChange={(v) => setForm({ ...form, quality_method: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{METHODS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>{pt("Result")}</Label><Select value={form.result} onValueChange={(v) => setForm({ ...form, result: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{RESULTS.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="space-y-2"><Label>{pt("Quality Criteria")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.quality_criteria} onChange={(e) => setForm({ ...form, quality_criteria: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>{pt("Planned Date")}</Label><Input type="date" value={form.planned_date} onChange={(e) => setForm({ ...form, planned_date: e.target.value })} /></div>
        <div className="space-y-2"><Label>{pt("Actual Date")}</Label><Input type="date" value={form.actual_date} onChange={(e) => setForm({ ...form, actual_date: e.target.value })} /></div>
      </div>
      <div className="space-y-2"><Label>{pt("Reviewer")}</Label><Select value={form.reviewer || "unassigned"} onValueChange={(v) => setForm({ ...form, reviewer: v === "unassigned" ? "" : v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unassigned">{pt("Unassigned")}</SelectItem>{users.map((u) => <SelectItem key={u.id} value={u.id.toString()}>{userLabel(u)}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label>{pt("Comments")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.comments} onChange={(e) => setForm({ ...form, comments: e.target.value })} /></div>
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
    </div></DialogContent></Dialog>
    </div>
  );
};
export default Prince2QualityRegister;
