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
import { Loader2, Plus, Rocket, Trash2, Zap, CheckSquare, Square } from "lucide-react";
import { toast } from "sonner";

const WaterfallDeployment = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", category: "" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/waterfall/deployment/`, { headers }); if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);
  const initDefaults = async () => { try { const r = await fetch(`/api/v1/projects/${id}/waterfall/deployment/initialize/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success(pt("Initialized")); fetchData(); } else toast.error(pt("Initialize failed")); } catch { toast.error(pt("Initialize failed")); } };
  const handleToggle = async (dId: number) => { try { const r = await fetch(`/api/v1/projects/${id}/waterfall/deployment/${dId}/toggle/`, { method: "POST", headers: jsonHeaders }); if (r.ok) fetchData(); } catch { toast.error(pt("Action failed")); } };
  const handleCreate = async () => { if (!form.title) { toast.error(pt("Title is required")); return; } setSubmitting(true); try { const r = await fetch(`/api/v1/projects/${id}/waterfall/deployment/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify(form) }); if (r.ok) { toast.success(pt("Created")); setDialogOpen(false); fetchData(); } else toast.error(pt("Create failed")); } catch { toast.error(pt("Create failed")); } finally { setSubmitting(false); } };
  const handleDelete = async (dId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/waterfall/deployment/${dId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };
  const completed = items.filter(i => i.is_completed).length;
  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);
  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Rocket className="h-6 w-6 text-blue-500" /><h1 className="text-2xl font-bold">{pt("Deployment")} Checklist</h1><Badge variant="outline">{completed}/{items.length}</Badge></div><div className="flex gap-2">{items.length === 0 && <Button variant="outline" onClick={initDefaults} className="gap-2"><Zap className="h-4 w-4" /> Initialize</Button>}<Button onClick={() => { setForm({ title: "", description: "", category: "" }); setDialogOpen(true); }} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button></div></div>
      {items.length === 0 ? <Card className="p-8 text-center"><Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">No checklist items yet</h3><Button onClick={initDefaults}><Zap className="h-4 w-4 mr-2" /> Initialize Defaults</Button></Card> : (
        <div className="space-y-1">{items.map(i => (<Card key={i.id} className={i.is_completed ? "bg-green-50 border-green-200" : ""}><CardContent className="p-3 flex items-center justify-between"><div className="flex items-center gap-3 cursor-pointer" onClick={() => handleToggle(i.id)}>{i.is_completed ? <CheckSquare className="h-5 w-5 text-green-600" /> : <Square className="h-5 w-5 text-muted-foreground" />}<span className={`text-sm ${i.is_completed ? "line-through text-muted-foreground" : "font-medium"}`}>{i.title}</span>{i.category && <Badge variant="outline" className="text-xs">{i.category}</Badge>}</div><Button variant="ghost" size="sm" onClick={() => handleDelete(i.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></CardContent></Card>))}</div>
      )}
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{pt("Add")} Checklist Item</DialogTitle></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div><div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[40px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div><div className="space-y-2"><Label>{pt("Category")}</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleCreate} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Create")}</Button></div></div></DialogContent></Dialog>
    </div>
  );
};
export default WaterfallDeployment;
