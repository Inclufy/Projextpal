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
import { Loader2, Plus, ClipboardList, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const STATUSES = ["draft", "submitted", "approved", "rejected"];
const statusColors: Record<string, string> = { draft: "bg-gray-100 text-gray-700", submitted: "bg-blue-100 text-blue-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };

const Prince2ExceptionPlan = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", rationale: "", plan_description: "", revised_budget: "", revised_end_date: "", revised_tolerances: "", impact_on_business_case: "", status: "draft", stage: "", exception_report: "" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/prince2/exception-plans/`, { headers }); if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  const fetchRefs = async () => {
    try { const r = await fetch(`/api/v1/projects/${id}/prince2/stages/`, { headers }); if (r.ok) { const d = await r.json(); setStages(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); }
    try { const r = await fetch(`/api/v1/projects/${id}/prince2/exception-reports/`, { headers }); if (r.ok) { const d = await r.json(); setReports(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); }
  };
  useEffect(() => { fetchData(); fetchRefs(); }, [id]);
  const openCreate = () => { setEditing(null); setForm({ title: "", rationale: "", plan_description: "", revised_budget: "", revised_end_date: "", revised_tolerances: "", impact_on_business_case: "", status: "draft", stage: "", exception_report: "" }); setDialogOpen(true); };
  const openEdit = (i: any) => { setEditing(i); setForm({ title: i.title || "", rationale: i.rationale || "", plan_description: i.plan_description || "", revised_budget: i.revised_budget != null ? i.revised_budget.toString() : "", revised_end_date: i.revised_end_date?.split("T")[0] || "", revised_tolerances: i.revised_tolerances || "", impact_on_business_case: i.impact_on_business_case || "", status: i.status || "draft", stage: i.stage ? i.stage.toString() : "", exception_report: i.exception_report ? i.exception_report.toString() : "" }); setDialogOpen(true); };
  const handleSave = async () => {
    if (!form.title) { toast.error(pt("Title is required")); return; }
    setSubmitting(true);
    try {
      const body: any = { ...form, stage: form.stage ? parseInt(form.stage) : null, exception_report: form.exception_report ? parseInt(form.exception_report) : null, revised_budget: form.revised_budget ? parseFloat(form.revised_budget) : null, revised_end_date: form.revised_end_date || null };
      const url = editing ? `/api/v1/projects/${id}/prince2/exception-plans/${editing.id}/` : `/api/v1/projects/${id}/prince2/exception-plans/`;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); }
  };
  const handleApprove = async (planId: number) => { try { const r = await fetch(`/api/v1/projects/${id}/prince2/exception-plans/${planId}/approve/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success(pt("Exception Plan approved — new baseline set")); fetchData(); } else toast.error(pt("Action failed")); } catch { toast.error(pt("Action failed")); } };
  const handleDelete = async (rId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/prince2/exception-plans/${rId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };
  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);
  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><ClipboardList className="h-6 w-6 text-rose-500" /><div><h1 className="text-2xl font-bold">{pt("Exception Plans")}</h1><p className="text-xs text-muted-foreground">{pt("Board-requested re-baseline in response to an Exception Report")}</p></div><Badge variant="outline">{items.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button></div>
      {items.length === 0 ? <Card className="p-8 text-center"><ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No exception plans")}</h3><p className="text-sm text-muted-foreground mt-1">{pt("Created when the Board requests one from an Exception Report.")}</p></Card> : (
        <div className="space-y-2">{items.map(i => (<Card key={i.id}><CardContent className="p-4 flex items-start justify-between"><div className="flex-1"><div className="flex items-center gap-2 mb-1 flex-wrap"><span className="font-medium">{i.title}</span><Badge className={`text-xs ${statusColors[i.status] || ""}`}>{i.status}</Badge>{i.stage_name && <Badge variant="outline" className="text-xs">{i.stage_name}</Badge>}{i.exception_report_title && <Badge variant="secondary" className="text-xs">↳ {i.exception_report_title}</Badge>}{i.revised_end_date && <span className="text-xs text-muted-foreground">{pt("New end")}: {i.revised_end_date}</span>}</div>{i.rationale && <p className="text-sm text-muted-foreground"><span className="font-medium">{pt("Rationale")}:</span> {i.rationale}</p>}{i.plan_description && <p className="text-sm mt-1">{i.plan_description}</p>}{i.revised_tolerances && <p className="text-xs mt-1"><span className="font-medium">{pt("Revised tolerances")}:</span> {i.revised_tolerances}</p>}</div><div className="flex gap-1">{i.status !== "approved" && <Button variant="ghost" size="sm" onClick={() => handleApprove(i.id)} title={pt("Approve")}><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /></Button>}<Button variant="ghost" size="sm" onClick={() => openEdit(i)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(i.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></CardContent></Card>))}</div>
      )}
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} {pt("Exception Plan")}</DialogTitle></DialogHeader><div className="space-y-4">
      <div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>{pt("Stage")}</Label><Select value={form.stage || "none"} onValueChange={(v) => setForm({ ...form, stage: v === "none" ? "" : v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">{pt("None")}</SelectItem>{stages.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>{pt("Exception Report")}</Label><Select value={form.exception_report || "none"} onValueChange={(v) => setForm({ ...form, exception_report: v === "none" ? "" : v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">{pt("None")}</SelectItem>{reports.map((s) => <SelectItem key={s.id} value={s.id.toString()}>{s.title}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="space-y-2"><Label>{pt("Rationale")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.rationale} onChange={(e) => setForm({ ...form, rationale: e.target.value })} /></div>
      <div className="space-y-2"><Label>{pt("Plan Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.plan_description} onChange={(e) => setForm({ ...form, plan_description: e.target.value })} /></div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2"><Label>{pt("Revised Budget")}</Label><Input type="number" value={form.revised_budget} onChange={(e) => setForm({ ...form, revised_budget: e.target.value })} /></div>
        <div className="space-y-2"><Label>{pt("Revised End Date")}</Label><Input type="date" value={form.revised_end_date} onChange={(e) => setForm({ ...form, revised_end_date: e.target.value })} /></div>
        <div className="space-y-2"><Label>{pt("Status")}</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="space-y-2"><Label>{pt("Revised Tolerances")}</Label><textarea className="w-full min-h-[50px] px-3 py-2 border rounded-md bg-background" value={form.revised_tolerances} onChange={(e) => setForm({ ...form, revised_tolerances: e.target.value })} /></div>
      <div className="space-y-2"><Label>{pt("Impact on Business Case")}</Label><textarea className="w-full min-h-[50px] px-3 py-2 border rounded-md bg-background" value={form.impact_on_business_case} onChange={(e) => setForm({ ...form, impact_on_business_case: e.target.value })} /></div>
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
    </div></DialogContent></Dialog>
    </div>
  );
};
export default Prince2ExceptionPlan;
