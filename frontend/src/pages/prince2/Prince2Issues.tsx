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
import { Loader2, Plus, ClipboardList, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const TYPE_LABELS: Record<string, string> = { request_for_change: "Request for Change", off_specification: "Off-Specification", problem_concern: "Problem / Concern" };

const Prince2Issues = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", issue_type: "problem_concern", priority: "medium", owner: "", status: "open", resolution: "", related_risk: "", date_raised: "", date_resolved: "" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/prince2/issues/`, { headers }); if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  const fetchUsers = async () => { try { const r = await fetch(`/api/v1/auth/company-users/members/`, { headers }); if (r.ok) { const d = await r.json(); setUsers(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } };
  const fetchRisks = async () => { try { const r = await fetch(`/api/v1/projects/${id}/prince2/risks/`, { headers }); if (r.ok) { const d = await r.json(); setRisks(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } };
  useEffect(() => { fetchData(); fetchUsers(); fetchRisks(); }, [id]);
  const userLabel = (u: any) => u.full_name || u.name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email;
  const today = () => new Date().toISOString().split("T")[0];
  const openCreate = () => { setEditing(null); setForm({ title: "", description: "", issue_type: "problem_concern", priority: "medium", owner: "", status: "open", resolution: "", related_risk: "", date_raised: today(), date_resolved: "" }); setDialogOpen(true); };
  const openEdit = (i: any) => { setEditing(i); setForm({ title: i.title || "", description: i.description || "", issue_type: i.issue_type || "problem_concern", priority: i.priority || "medium", owner: i.owner ? i.owner.toString() : "", status: i.status || "open", resolution: i.resolution || "", related_risk: i.related_risk ? i.related_risk.toString() : "", date_raised: i.date_raised?.split("T")[0] || today(), date_resolved: i.date_resolved?.split("T")[0] || "" }); setDialogOpen(true); };
  const handleSave = async () => {
    if (!form.title) { toast.error(pt("Title is required")); return; }
    setSubmitting(true);
    try {
      const body: any = { ...form, owner: form.owner ? parseInt(form.owner) : null, related_risk: form.related_risk ? parseInt(form.related_risk) : null, date_raised: form.date_raised || null, date_resolved: form.date_resolved || null };
      const url = editing ? `/api/v1/projects/${id}/prince2/issues/${editing.id}/` : `/api/v1/projects/${id}/prince2/issues/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); }
  };
  const handleDelete = async (rId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/prince2/issues/${rId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };
  const priorityColors: Record<string, string> = { critical: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700", medium: "bg-yellow-100 text-yellow-700", low: "bg-green-100 text-green-700" };
  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);
  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><ClipboardList className="h-6 w-6 text-blue-500" /><h1 className="text-2xl font-bold">{pt("Issue Register")}</h1><Badge variant="outline">{items.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button></div>
      {items.length === 0 ? <Card className="p-8 text-center"><ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No issues raised yet")}</h3></Card> : (
        <div className="space-y-2">{items.map(i => (<Card key={i.id}><CardContent className="p-4 flex items-center justify-between"><div className="flex-1"><div className="flex items-center gap-2 mb-1 flex-wrap"><span className="font-medium">{i.title}</span><Badge variant="outline" className="text-xs">{TYPE_LABELS[i.issue_type] || i.issue_type}</Badge><Badge className={`text-xs ${priorityColors[i.priority] || ""}`}>{i.priority}</Badge><Badge variant={i.status === "resolved" || i.status === "closed" ? "secondary" : "default"} className="text-xs">{i.status}</Badge>{i.owner_name && <Badge variant="secondary" className="text-xs">{i.owner_name}</Badge>}{i.related_risk_title && <Badge variant="outline" className="text-xs">↪ {i.related_risk_title}</Badge>}</div>{i.description && <p className="text-sm text-muted-foreground">{i.description}</p>}{i.resolution && <p className="text-xs mt-1"><span className="font-medium">{pt("Resolution")}:</span> {i.resolution}</p>}</div><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(i)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(i.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></CardContent></Card>))}</div>
      )}
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} {pt("Issue")}</DialogTitle></DialogHeader><div className="space-y-4">
      <div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
      <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>{pt("Type")}</Label><Select value={form.issue_type} onValueChange={(v) => setForm({ ...form, issue_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="request_for_change">Request for Change</SelectItem><SelectItem value="off_specification">Off-Specification</SelectItem><SelectItem value="problem_concern">Problem / Concern</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label>{pt("Priority")}</Label><Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>{pt("Status")}</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="open">Open</SelectItem><SelectItem value="assessing">Assessing</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="resolved">Resolved</SelectItem><SelectItem value="closed">Closed</SelectItem></SelectContent></Select></div>
        <div className="space-y-2"><Label>{pt("Owner")}</Label><Select value={form.owner || "unassigned"} onValueChange={(v) => setForm({ ...form, owner: v === "unassigned" ? "" : v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unassigned">{pt("Unassigned")}</SelectItem>{users.map((u) => <SelectItem key={u.id} value={u.id.toString()}>{userLabel(u)}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>{pt("Related Risk")}</Label><Select value={form.related_risk || "none"} onValueChange={(v) => setForm({ ...form, related_risk: v === "none" ? "" : v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="none">{pt("None")}</SelectItem>{risks.map((r) => <SelectItem key={r.id} value={r.id.toString()}>{r.title}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>{pt("Date Raised")}</Label><Input type="date" value={form.date_raised} onChange={(e) => setForm({ ...form, date_raised: e.target.value })} /></div>
      </div>
      <div className="space-y-2"><Label>{pt("Resolution")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })} /></div>
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
    </div></DialogContent></Dialog>
    </div>
  );
};
export default Prince2Issues;
