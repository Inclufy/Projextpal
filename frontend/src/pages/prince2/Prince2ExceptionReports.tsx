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
import { Loader2, Plus, AlertOctagon, Pencil, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

const STATUS_LABELS: Record<string, string> = { open: "Open", under_review: "Under Review", board_decision: "Board Decision", closed: "Closed" };
const statusColors: Record<string, string> = { open: "bg-red-100 text-red-700", under_review: "bg-orange-100 text-orange-700", board_decision: "bg-blue-100 text-blue-700", closed: "bg-green-100 text-green-700" };

const Prince2ExceptionReports = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", cause: "", consequences: "", options: "", recommendation: "", board_decision: "", status: "open", date_raised: "", date_closed: "" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/prince2/exception-reports/`, { headers }); if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);
  const today = () => new Date().toISOString().split("T")[0];
  const openCreate = () => { setEditing(null); setForm({ title: "", cause: "", consequences: "", options: "", recommendation: "", board_decision: "", status: "open", date_raised: today(), date_closed: "" }); setDialogOpen(true); };
  const openEdit = (i: any) => { setEditing(i); setForm({ title: i.title || "", cause: i.cause || "", consequences: i.consequences || "", options: i.options || "", recommendation: i.recommendation || "", board_decision: i.board_decision || "", status: i.status || "open", date_raised: i.date_raised?.split("T")[0] || today(), date_closed: i.date_closed?.split("T")[0] || "" }); setDialogOpen(true); };
  const handleSave = async () => {
    if (!form.title) { toast.error(pt("Title is required")); return; }
    setSubmitting(true);
    try {
      const body: any = { ...form, date_raised: form.date_raised || null, date_closed: form.date_closed || null };
      const url = editing ? `/api/v1/projects/${id}/prince2/exception-reports/${editing.id}/` : `/api/v1/projects/${id}/prince2/exception-reports/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); }
  };
  const handleDelete = async (rId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/prince2/exception-reports/${rId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };
  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);
  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><AlertOctagon className="h-6 w-6 text-red-500" /><div><h1 className="text-2xl font-bold">{pt("Exception Reports")}</h1><p className="text-xs text-muted-foreground">{pt("Manage by Exception — raised when a tolerance is forecast to be breached")}</p></div><Badge variant="outline">{items.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button></div>
      {items.length === 0 ? <Card className="p-8 text-center"><AlertOctagon className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No exception reports")}</h3><p className="text-sm text-muted-foreground mt-1">{pt("One is raised automatically when a tolerance is exceeded.")}</p></Card> : (
        <div className="space-y-2">{items.map(i => (<Card key={i.id}><CardContent className="p-4 flex items-start justify-between"><div className="flex-1"><div className="flex items-center gap-2 mb-1 flex-wrap"><span className="font-medium">{i.title}</span><Badge className={`text-xs ${statusColors[i.status] || ""}`}>{STATUS_LABELS[i.status] || i.status}</Badge>{i.auto_generated && <Badge variant="secondary" className="text-xs gap-1"><Zap className="h-3 w-3" /> {pt("Auto")}</Badge>}{i.tolerance_type && <Badge variant="outline" className="text-xs">{i.tolerance_type}</Badge>}{i.stage_name && <Badge variant="outline" className="text-xs">{i.stage_name}</Badge>}</div>{i.cause && <p className="text-sm"><span className="font-medium">{pt("Cause")}:</span> {i.cause}</p>}{i.consequences && <p className="text-sm text-muted-foreground"><span className="font-medium">{pt("Consequences")}:</span> {i.consequences}</p>}{i.recommendation && <p className="text-sm mt-1"><span className="font-medium">{pt("Recommendation")}:</span> {i.recommendation}</p>}{i.board_decision && <p className="text-sm mt-1 text-blue-700"><span className="font-medium">{pt("Board Decision")}:</span> {i.board_decision}</p>}</div><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(i)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(i.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></CardContent></Card>))}</div>
      )}
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} {pt("Exception Report")}</DialogTitle></DialogHeader><div className="space-y-4">
      <div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
      <div className="space-y-2"><Label>{pt("Cause")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.cause} onChange={(e) => setForm({ ...form, cause: e.target.value })} /></div>
      <div className="space-y-2"><Label>{pt("Consequences")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.consequences} onChange={(e) => setForm({ ...form, consequences: e.target.value })} /></div>
      <div className="space-y-2"><Label>{pt("Options")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.options} onChange={(e) => setForm({ ...form, options: e.target.value })} /></div>
      <div className="space-y-2"><Label>{pt("Recommendation")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.recommendation} onChange={(e) => setForm({ ...form, recommendation: e.target.value })} /></div>
      <div className="space-y-2"><Label>{pt("Board Decision")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.board_decision} onChange={(e) => setForm({ ...form, board_decision: e.target.value })} /></div>
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2"><Label>{pt("Status")}</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="under_review">Under Review</SelectItem><SelectItem value="board_decision">Board Decision</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label>{pt("Date Raised")}</Label><Input type="date" value={form.date_raised} onChange={(e) => setForm({ ...form, date_raised: e.target.value })} /></div>
        <div className="space-y-2"><Label>{pt("Date Closed")}</Label><Input type="date" value={form.date_closed} onChange={(e) => setForm({ ...form, date_closed: e.target.value })} /></div>
      </div>
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
    </div></DialogContent></Dialog>
    </div>
  );
};
export default Prince2ExceptionReports;
