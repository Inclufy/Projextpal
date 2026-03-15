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
import { Loader2, Plus, Columns, Pencil, Trash2, GripVertical } from "lucide-react";
import { toast } from "sonner";

const KanbanBoardConfiguration = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [columns, setColumns] = useState<any[]>([]);
  const [swimlanes, setSwimlanes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dialogType, setDialogType] = useState<"column" | "swimlane">("column");
  const [form, setForm] = useState({ name: "", order: "", wip_limit: "", column_type: "in_progress" });
  const [slForm, setSlForm] = useState({ name: "", order: "" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const [cRes, sRes] = await Promise.all([fetch(`/api/v1/projects/${id}/kanban/columns/`, { headers }), fetch(`/api/v1/projects/${id}/kanban/swimlanes/`, { headers })]); if (cRes.ok) { const d = await cRes.json(); setColumns((Array.isArray(d) ? d : d.results || []).sort((a: any, b: any) => (a.order || 0) - (b.order || 0))); } if (sRes.ok) { const d = await sRes.json(); setSwimlanes(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const openCreateCol = () => { setDialogType("column"); setEditing(null); setForm({ name: "", order: String(columns.length + 1), wip_limit: "", column_type: "in_progress" }); setDialogOpen(true); };
  const openEditCol = (c: any) => { setDialogType("column"); setEditing(c); setForm({ name: c.name || "", order: String(c.order || ""), wip_limit: String(c.wip_limit || ""), column_type: c.column_type || "in_progress" }); setDialogOpen(true); };
  const openCreateSl = () => { setDialogType("swimlane"); setEditing(null); setSlForm({ name: "", order: String(swimlanes.length + 1) }); setDialogOpen(true); };
  const openEditSl = (s: any) => { setDialogType("swimlane"); setEditing(s); setSlForm({ name: s.name || "", order: String(s.order || "") }); setDialogOpen(true); };

  const handleSaveCol = async () => { if (!form.name) { toast.error(pt("Name is required")); return; } setSubmitting(true); try { const body: any = { name: form.name, column_type: form.column_type }; if (form.order) body.order = parseInt(form.order); if (form.wip_limit) body.wip_limit = parseInt(form.wip_limit); const url = editing ? `/api/v1/projects/${id}/kanban/columns/${editing.id}/` : `/api/v1/projects/${id}/kanban/columns/`; const method = editing ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) }); if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); } };
  const handleSaveSl = async () => { if (!slForm.name) { toast.error(pt("Name is required")); return; } setSubmitting(true); try { const body: any = { name: slForm.name }; if (slForm.order) body.order = parseInt(slForm.order); const url = editing ? `/api/v1/projects/${id}/kanban/swimlanes/${editing.id}/` : `/api/v1/projects/${id}/kanban/swimlanes/`; const method = editing ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) }); if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); } };
  const deleteCol = async (cId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/kanban/columns/${cId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };
  const deleteSl = async (sId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/kanban/swimlanes/${sId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };

  const typeColors: Record<string, string> = { backlog: "bg-gray-100 text-gray-700", in_progress: "bg-blue-100 text-blue-700", done: "bg-green-100 text-green-700" };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3"><Columns className="h-6 w-6 text-violet-500" /><h1 className="text-2xl font-bold">Board Configuration</h1></div>

        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Columns ({columns.length})</h2><Button onClick={openCreateCol} className="gap-2"><Plus className="h-4 w-4" /> Add Column</Button></div>
        <div className="space-y-2">{columns.map((c, i) => (
          <Card key={c.id}><CardContent className="p-4 flex items-center justify-between">
            <div className="flex items-center gap-3"><GripVertical className="h-4 w-4 text-muted-foreground" /><span className="text-sm font-bold text-muted-foreground w-6">#{c.order || i + 1}</span><span className="font-medium">{c.name}</span><Badge className={`text-xs ${typeColors[c.column_type] || ""}`}>{c.column_type}</Badge>{c.wip_limit && <Badge variant="outline" className="text-xs">WIP: {c.wip_limit}</Badge>}</div>
            <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEditCol(c)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => deleteCol(c.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div>
          </CardContent></Card>
        ))}</div>

        <div className="flex items-center justify-between"><h2 className="text-lg font-semibold">Swimlanes ({swimlanes.length})</h2><Button onClick={openCreateSl} size="sm" className="gap-2"><Plus className="h-4 w-4" /> Add Swimlane</Button></div>
        {swimlanes.length === 0 ? <p className="text-muted-foreground text-sm">No swimlanes configured</p> : (
          <div className="space-y-2">{swimlanes.map(s => (
            <Card key={s.id}><CardContent className="p-3 flex items-center justify-between"><span className="font-medium text-sm">{s.name}</span><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEditSl(s)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => deleteSl(s.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></CardContent></Card>
          ))}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} {dialogType === "column" ? "Column" : "Swimlane"}</DialogTitle></DialogHeader>
        {dialogType === "column" ? (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="space-y-2"><Label>Order</Label><Input type="number" value={form.order} onChange={(e) => setForm({ ...form, order: e.target.value })} /></div></div>
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Type</Label><Select value={form.column_type} onValueChange={(v) => setForm({ ...form, column_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="backlog">Backlog</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="done">Done</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>WIP Limit</Label><Input type="number" value={form.wip_limit} onChange={(e) => setForm({ ...form, wip_limit: e.target.value })} placeholder="No limit" /></div></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSaveCol} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={slForm.name} onChange={(e) => setSlForm({ ...slForm, name: e.target.value })} /></div><div className="space-y-2"><Label>Order</Label><Input type="number" value={slForm.order} onChange={(e) => setSlForm({ ...slForm, order: e.target.value })} /></div></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSaveSl} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
          </div>
        )}
      </DialogContent></Dialog>
    </div>
  );
};

export default KanbanBoardConfiguration;
