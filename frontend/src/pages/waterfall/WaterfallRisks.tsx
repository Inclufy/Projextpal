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
import { Loader2, Plus, AlertTriangle, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const WaterfallRisks = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", probability: "medium", impact: "medium", mitigation: "", status: "identified" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/waterfall/risks/`, { headers }); if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);
  const openCreate = () => { setEditing(null); setForm({ title: "", description: "", probability: "medium", impact: "medium", mitigation: "", status: "identified" }); setDialogOpen(true); };
  const openEdit = (i: any) => { setEditing(i); setForm({ title: i.title || "", description: i.description || "", probability: i.probability || "medium", impact: i.impact || "medium", mitigation: i.mitigation || "", status: i.status || "identified" }); setDialogOpen(true); };
  const handleSave = async () => { if (!form.title) { toast.error(pt("Title is required")); return; } setSubmitting(true); try { const url = editing ? `/api/v1/projects/${id}/waterfall/risks/${editing.id}/` : `/api/v1/projects/${id}/waterfall/risks/`; const method = editing ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(form) }); if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); } };
  const handleDelete = async (rId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/waterfall/risks/${rId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };
  const impactColors: Record<string, string> = { critical: "bg-red-100 text-red-700", high: "bg-orange-100 text-orange-700", medium: "bg-yellow-100 text-yellow-700", low: "bg-green-100 text-green-700" };
  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);
  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><AlertTriangle className="h-6 w-6 text-amber-500" /><h1 className="text-2xl font-bold">{pt("Risks")}</h1><Badge variant="outline">{items.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button></div>
      {items.length === 0 ? <Card className="p-8 text-center"><AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">No risks identified yet</h3></Card> : (
        <div className="space-y-2">{items.map(i => (<Card key={i.id}><CardContent className="p-4 flex items-center justify-between"><div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="font-medium">{i.title}</span><Badge className={`text-xs ${impactColors[i.impact] || ""}`}>Impact: {i.impact}</Badge><Badge variant="outline" className="text-xs">Prob: {i.probability}</Badge><Badge variant={i.status === "mitigated" ? "default" : "secondary"} className="text-xs">{i.status}</Badge></div>{i.description && <p className="text-sm text-muted-foreground">{i.description}</p>}{i.mitigation && <p className="text-xs mt-1"><span className="font-medium">Mitigation:</span> {i.mitigation}</p>}</div><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(i)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(i.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></CardContent></Card>))}</div>
      )}
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} Risk</DialogTitle></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div><div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>{pt("Probability")}</Label><Select value={form.probability} onValueChange={(v) => setForm({ ...form, probability: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>{pt("Impact")}</Label><Select value={form.impact} onValueChange={(v) => setForm({ ...form, impact: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem><SelectItem value="critical">Critical</SelectItem></SelectContent></Select></div></div><div className="space-y-2"><Label>{pt("Mitigation")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.mitigation} onChange={(e) => setForm({ ...form, mitigation: e.target.value })} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div></div></DialogContent></Dialog>
    </div>
  );
};
export default WaterfallRisks;
