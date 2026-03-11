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
import { Loader2, Plus, FileText, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const WaterfallRequirements = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", requirement_type: "functional", priority: "medium", source: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/waterfall/requirements/`, { headers }); if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ title: "", description: "", requirement_type: "functional", priority: "medium", source: "" }); setDialogOpen(true); };
  const openEdit = (i: any) => { setEditing(i); setForm({ title: i.title || "", description: i.description || "", requirement_type: i.requirement_type || "functional", priority: i.priority || "medium", source: i.source || "" }); setDialogOpen(true); };
  const handleSave = async () => { if (!form.title) { toast.error(pt("Title is required")); return; } setSubmitting(true); try { const url = editing ? `/api/v1/projects/${id}/waterfall/requirements/${editing.id}/` : `/api/v1/projects/${id}/waterfall/requirements/`; const method = editing ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(form) }); if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); } };
  const handleDelete = async (rId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/waterfall/requirements/${rId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };
  const handleApprove = async (rId: number) => { try { const r = await fetch(`/api/v1/projects/${id}/waterfall/requirements/${rId}/approve/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success(pt("Saved")); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } };

  const typeColors: Record<string, string> = { functional: "bg-blue-100 text-blue-700", non_functional: "bg-purple-100 text-purple-700", constraint: "bg-orange-100 text-orange-700", interface: "bg-cyan-100 text-cyan-700" };
  const prioColors: Record<string, string> = { critical: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700", medium: "bg-yellow-100 text-yellow-700", low: "bg-green-100 text-green-700" };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><FileText className="h-6 w-6 text-blue-500" /><h1 className="text-2xl font-bold">{pt("Requirements")}</h1><Badge variant="outline">{items.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button></div>
        {items.length === 0 ? <Card className="p-8 text-center"><FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No requirements yet")}</h3></Card> : (
          <div className="space-y-2">{items.map(i => (
            <Card key={i.id}><CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1"><div className="flex items-center gap-2 mb-1"><Badge className={`text-xs ${typeColors[i.requirement_type] || ""}`}>{i.requirement_type}</Badge><span className="font-medium">{i.title}</span><Badge className={`text-xs ${prioColors[i.priority] || ""}`}>{i.priority}</Badge><Badge variant={i.status === "approved" ? "default" : "outline"} className="text-xs">{i.status}</Badge></div>{i.description && <p className="text-sm text-muted-foreground">{i.description}</p>}</div>
              <div className="flex gap-1">{i.status !== "approved" && <Button variant="ghost" size="sm" onClick={() => handleApprove(i.id)} title="Approve"><CheckCircle2 className="h-4 w-4 text-green-500" /></Button>}<Button variant="ghost" size="sm" onClick={() => openEdit(i)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(i.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div>
            </CardContent></Card>
          ))}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} Requirement</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Type</Label><Select value={form.requirement_type} onValueChange={(v) => setForm({ ...form, requirement_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="functional">Functional</SelectItem><SelectItem value="non_functional">Non-Functional</SelectItem><SelectItem value="constraint">Constraint</SelectItem><SelectItem value="interface">Interface</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>{pt("Priority")}</Label><Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div></div>
          <div className="space-y-2"><Label>Source</Label><Input value={form.source} onChange={(e) => setForm({ ...form, source: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default WaterfallRequirements;
