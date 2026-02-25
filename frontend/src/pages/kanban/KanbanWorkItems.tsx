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
import { Loader2, Plus, ListChecks, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const KanbanWorkItems = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [cards, setCards] = useState<any[]>([]);
  const [columns, setColumns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", card_type: "task", priority: "medium", column: "", assigned_to_name: "", due_date: "" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const [crRes, cRes] = await Promise.all([fetch(`/api/v1/projects/${id}/kanban/cards/`, { headers }), fetch(`/api/v1/projects/${id}/kanban/columns/`, { headers })]); if (crRes.ok) { const d = await crRes.json(); setCards(Array.isArray(d) ? d : d.results || []); } if (cRes.ok) { const d = await cRes.json(); setColumns(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ title: "", description: "", card_type: "task", priority: "medium", column: columns[0]?.id?.toString() || "", assigned_to_name: "", due_date: "" }); setDialogOpen(true); };
  const openEdit = (c: any) => { setEditing(c); setForm({ title: c.title || "", description: c.description || "", card_type: c.card_type || "task", priority: c.priority || "medium", column: String(c.column || ""), assigned_to_name: c.assigned_to_name || "", due_date: c.due_date?.split("T")[0] || "" }); setDialogOpen(true); };
  const handleSave = async () => { if (!form.title) { toast.error(pt("Title is required")); return; } setSubmitting(true); try { const body: any = { ...form }; if (form.column) body.column = parseInt(form.column); else delete body.column; if (!form.due_date) delete body.due_date; const url = editing ? `/api/v1/projects/${id}/kanban/cards/${editing.id}/` : `/api/v1/projects/${id}/kanban/cards/`; const method = editing ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) }); if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); } };
  const handleDelete = async (cId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/kanban/cards/${cId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };

  const prioColors: Record<string, string> = { critical: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700", medium: "bg-yellow-100 text-yellow-700", low: "bg-green-100 text-green-700" };
  const typeColors: Record<string, string> = { feature: "bg-blue-100 text-blue-700", bug: "bg-red-100 text-red-700", task: "bg-gray-100 text-gray-700", improvement: "bg-purple-100 text-purple-700" };
  const colMap = Object.fromEntries(columns.map(c => [c.id, c.name]));

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><ListChecks className="h-6 w-6 text-violet-500" /><h1 className="text-2xl font-bold">{pt("Work Items")}</h1><Badge variant="outline">{cards.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button></div>
        {cards.length === 0 ? <Card className="p-8 text-center"><ListChecks className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">No work items yet</h3></Card> : (
          <div className="space-y-2">{cards.map(c => (
            <Card key={c.id} className={c.is_blocked ? "border-red-300 bg-red-50" : ""}><CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1"><div className="flex items-center gap-2 mb-1 flex-wrap"><Badge className={`text-xs ${typeColors[c.card_type] || ""}`}>{c.card_type}</Badge><span className="font-medium">{c.title}</span><Badge className={`text-xs ${prioColors[c.priority] || ""}`}>{c.priority}</Badge>{colMap[c.column] && <Badge variant="outline" className="text-xs">{colMap[c.column]}</Badge>}{c.is_blocked && <Badge variant="destructive" className="text-xs">Blocked</Badge>}{c.assigned_to_name && <span className="text-xs text-muted-foreground">👤 {c.assigned_to_name}</span>}</div>{c.description && <p className="text-sm text-muted-foreground">{c.description}</p>}</div>
              <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(c)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div>
            </CardContent></Card>
          ))}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} Work Item</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-3"><div className="space-y-2"><Label>Type</Label><Select value={form.card_type} onValueChange={(v) => setForm({ ...form, card_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="feature">Feature</SelectItem><SelectItem value="bug">Bug</SelectItem><SelectItem value="task">Task</SelectItem><SelectItem value="improvement">Improvement</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>{pt("Priority")}</Label><Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Column</Label><Select value={form.column} onValueChange={(v) => setForm({ ...form, column: v })}><SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger><SelectContent>{columns.map(c => <SelectItem key={c.id} value={c.id.toString()}>{c.name}</SelectItem>)}</SelectContent></Select></div></div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Assigned To</Label><Input value={form.assigned_to_name} onChange={(e) => setForm({ ...form, assigned_to_name: e.target.value })} /></div><div className="space-y-2"><Label>{pt("Due Date")}</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default KanbanWorkItems;
