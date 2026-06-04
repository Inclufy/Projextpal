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
import { Loader2, Plus, NotebookPen, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ENTRY_TYPES = ["action", "event", "observation", "informal_issue", "decision"];
const STATUSES = ["open", "in_progress", "done"];
const typeColors: Record<string, string> = { action: "bg-blue-100 text-blue-700", event: "bg-purple-100 text-purple-700", observation: "bg-gray-100 text-gray-700", informal_issue: "bg-orange-100 text-orange-700", decision: "bg-green-100 text-green-700" };
const statusColors: Record<string, string> = { open: "bg-amber-100 text-amber-700", in_progress: "bg-blue-100 text-blue-700", done: "bg-green-100 text-green-700" };

const Prince2DailyLog = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ entry_date: "", entry_type: "action", description: "", responsible: "", due_date: "", status: "open" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/prince2/daily-log/`, { headers }); if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  const fetchUsers = async () => { try { const r = await fetch(`/api/v1/auth/company-users/members/`, { headers }); if (r.ok) { const d = await r.json(); setUsers(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } };
  useEffect(() => { fetchData(); fetchUsers(); }, [id]);
  const userLabel = (u: any) => u.full_name || u.name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email;
  const today = () => new Date().toISOString().split("T")[0];
  const openCreate = () => { setEditing(null); setForm({ entry_date: today(), entry_type: "action", description: "", responsible: "", due_date: "", status: "open" }); setDialogOpen(true); };
  const openEdit = (i: any) => { setEditing(i); setForm({ entry_date: i.entry_date?.split("T")[0] || today(), entry_type: i.entry_type || "action", description: i.description || "", responsible: i.responsible ? i.responsible.toString() : "", due_date: i.due_date?.split("T")[0] || "", status: i.status || "open" }); setDialogOpen(true); };
  const handleSave = async () => {
    if (!form.description) { toast.error(pt("Description is required")); return; }
    setSubmitting(true);
    try {
      const body: any = { ...form, responsible: form.responsible ? parseInt(form.responsible) : null, entry_date: form.entry_date || null, due_date: form.due_date || null };
      const url = editing ? `/api/v1/projects/${id}/prince2/daily-log/${editing.id}/` : `/api/v1/projects/${id}/prince2/daily-log/`;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); }
  };
  const handleDelete = async (rId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/prince2/daily-log/${rId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };
  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);
  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><NotebookPen className="h-6 w-6 text-indigo-500" /><div><h1 className="text-2xl font-bold">{pt("Daily Log")}</h1><p className="text-xs text-muted-foreground">{pt("The Project Manager's diary of actions, events and informal issues")}</p></div><Badge variant="outline">{items.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button></div>
      {items.length === 0 ? <Card className="p-8 text-center"><NotebookPen className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No log entries yet")}</h3></Card> : (
        <div className="space-y-2">{items.map(i => (<Card key={i.id}><CardContent className="p-4 flex items-center justify-between"><div className="flex-1"><div className="flex items-center gap-2 mb-1 flex-wrap"><Badge className={`text-xs ${typeColors[i.entry_type] || ""}`}>{i.entry_type}</Badge><Badge className={`text-xs ${statusColors[i.status] || ""}`}>{i.status}</Badge>{i.entry_date && <span className="text-xs text-muted-foreground">{i.entry_date}</span>}{i.due_date && <span className="text-xs text-orange-600">{pt("Due")}: {i.due_date}</span>}{i.responsible_name && <Badge variant="secondary" className="text-xs">{i.responsible_name}</Badge>}</div><p className="text-sm">{i.description}</p></div><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(i)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(i.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></CardContent></Card>))}</div>
      )}
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} {pt("Log Entry")}</DialogTitle></DialogHeader><div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>{pt("Type")}</Label><Select value={form.entry_type} onValueChange={(v) => setForm({ ...form, entry_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{ENTRY_TYPES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
        <div className="space-y-2"><Label>{pt("Status")}</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
      </div>
      <div className="space-y-2"><Label>{pt("Description")} *</Label><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2"><Label>{pt("Entry Date")}</Label><Input type="date" value={form.entry_date} onChange={(e) => setForm({ ...form, entry_date: e.target.value })} /></div>
        <div className="space-y-2"><Label>{pt("Due Date")}</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
      </div>
      <div className="space-y-2"><Label>{pt("Responsible")}</Label><Select value={form.responsible || "unassigned"} onValueChange={(v) => setForm({ ...form, responsible: v === "unassigned" ? "" : v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unassigned">{pt("Unassigned")}</SelectItem>{users.map((u) => <SelectItem key={u.id} value={u.id.toString()}>{userLabel(u)}</SelectItem>)}</SelectContent></Select></div>
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
    </div></DialogContent></Dialog>
    </div>
  );
};
export default Prince2DailyLog;
