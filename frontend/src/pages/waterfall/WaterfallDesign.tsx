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
import { Loader2, Plus, FileText, Pencil, Trash2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const WaterfallDesign = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", document_type: "architecture", version: "1.0", content: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/waterfall/designs/`, { headers }); if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ title: "", description: "", document_type: "architecture", version: "1.0", content: "" }); setDialogOpen(true); };
  const openEdit = (i: any) => { setEditing(i); setForm({ title: i.title || "", description: i.description || "", document_type: i.document_type || "architecture", version: i.version || "1.0", content: i.content || "" }); setDialogOpen(true); };
  const handleSave = async () => { if (!form.title) { toast.error("Titel verplicht"); return; } setSubmitting(true); try { const url = editing ? `/api/v1/projects/${id}/waterfall/designs/${editing.id}/` : `/api/v1/projects/${id}/waterfall/designs/`; const method = editing ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(form) }); if (r.ok) { toast.success("Opgeslagen"); setDialogOpen(false); fetchData(); } else toast.error("Opslaan mislukt"); } catch { toast.error("Opslaan mislukt"); } finally { setSubmitting(false); } };
  const handleDelete = async (dId: number) => { if (!confirm("Verwijderen?")) return; try { const r = await fetch(`/api/v1/projects/${id}/waterfall/designs/${dId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success("Verwijderd"); fetchData(); } } catch { toast.error("Verwijderen mislukt"); } };
  const handleApprove = async (dId: number) => { try { const r = await fetch(`/api/v1/projects/${id}/waterfall/designs/${dId}/approve/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success("Goedgekeurd"); fetchData(); } } catch { toast.error("Goedkeuren mislukt"); } };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><FileText className="h-6 w-6 text-indigo-500" /><h1 className="text-2xl font-bold">{pt("Design")} Documents</h1><Badge variant="outline">{items.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button></div>
        {items.length === 0 ? <Card className="p-8 text-center"><FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">No design documents yet</h3></Card> : (
          <div className="space-y-3">{items.map(i => (
            <Card key={i.id}><CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="font-medium">{i.title}</span><Badge variant="outline" className="text-xs">{i.document_type?.replace("_", " ")}</Badge><Badge variant="outline" className="text-xs">v{i.version}</Badge><Badge variant={i.status === "approved" ? "default" : "secondary"} className="text-xs">{i.status}</Badge></div>{i.description && <p className="text-sm text-muted-foreground">{i.description}</p>}</div>
              <div className="flex gap-1">{i.status !== "approved" && <Button variant="ghost" size="sm" onClick={() => handleApprove(i.id)}><CheckCircle2 className="h-4 w-4 text-green-500" /></Button>}<Button variant="ghost" size="sm" onClick={() => openEdit(i)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(i.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div>
            </CardContent></Card>
          ))}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} Design Document</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div><div className="space-y-2"><Label>Type</Label><Select value={form.document_type} onValueChange={(v) => setForm({ ...form, document_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="architecture">System Architecture</SelectItem><SelectItem value="database">Database Design</SelectItem><SelectItem value="ui_ux">UI/UX Design</SelectItem><SelectItem value="api">API Design</SelectItem><SelectItem value="security">Security Design</SelectItem><SelectItem value="integration">Integration Design</SelectItem></SelectContent></Select></div></div>
          <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="space-y-2"><Label>Content</Label><textarea className="w-full min-h-[100px] px-3 py-2 border rounded-md bg-background" value={form.content} onChange={(e) => setForm({ ...form, content: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default WaterfallDesign;
