import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, TableProperties } from "lucide-react";
import { toast } from "sonner";

const BASE = (id: string) => `/api/v1/projects/${id}/sixsigma`;
const CATEGORIES = ["suppliers", "inputs", "process", "outputs", "customers"];
const CAT_LABELS: Record<string, string> = { suppliers: "Suppliers", inputs: "Inputs", process: "Process Steps", outputs: "Outputs", customers: "Customers" };

const SixSigmaSIPOC = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [diagrams, setDiagrams] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"diagram" | "item">("diagram");
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dForm, setDForm] = useState({ process_name: "", process_description: "", process_start: "", process_end: "" });
  const [iForm, setIForm] = useState({ sipoc: "", category: "suppliers", description: "", order: "" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const [dRes, iRes] = await Promise.all([fetch(`${BASE(id!)}/sipoc/`, { headers }), fetch(`${BASE(id!)}/sipoc-items/`, { headers })]); if (dRes.ok) { const d = await dRes.json(); setDiagrams(Array.isArray(d) ? d : d.results || []); } if (iRes.ok) { const d = await iRes.json(); setItems(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const openCreateDiagram = () => { setDialogType("diagram"); setEditing(null); setDForm({ process_name: "", process_description: "", process_start: "", process_end: "" }); setDialogOpen(true); };
  const openEditDiagram = (d: any) => { setDialogType("diagram"); setEditing(d); setDForm({ process_name: d.process_name || "", process_description: d.process_description || "", process_start: d.process_start || "", process_end: d.process_end || "" }); setDialogOpen(true); };
  const openCreateItem = (sipocId?: number) => { setDialogType("item"); setEditing(null); setIForm({ sipoc: String(sipocId || diagrams[0]?.id || ""), category: "suppliers", description: "", order: "" }); setDialogOpen(true); };
  const openEditItem = (i: any) => { setDialogType("item"); setEditing(i); setIForm({ sipoc: String(i.sipoc || ""), category: i.category || "suppliers", description: i.description || "", order: String(i.order || "") }); setDialogOpen(true); };

  const handleSaveDiagram = async () => {
    if (!dForm.process_name) { toast.error(pt("Process name is required")); return; }
    if (!dForm.process_start) { toast.error(pt("Process start is required")); return; }
    if (!dForm.process_end) { toast.error(pt("Process end is required")); return; }
    setSubmitting(true);
    try {
      const url = editing ? `${BASE(id!)}/sipoc/${editing.id}/` : `${BASE(id!)}/sipoc/`;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(dForm) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); }
  };
  const handleSaveItem = async () => {
    if (!iForm.description) { toast.error(pt("Description is required")); return; }
    if (!iForm.sipoc) { toast.error(pt("Please select a diagram")); return; }
    setSubmitting(true);
    try {
      const body: any = { category: iForm.category, description: iForm.description };
      if (iForm.order) body.order = parseInt(iForm.order);
      // Create via the diagram's add_item action (auto-fills the sipoc FK); edit via the item detail route.
      const url = editing ? `${BASE(id!)}/sipoc-items/${editing.id}/` : `${BASE(id!)}/sipoc/${iForm.sipoc}/add_item/`;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); }
  };
  const deleteDiagram = async (dId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`${BASE(id!)}/sipoc/${dId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };
  const deleteItem = async (iId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`${BASE(id!)}/sipoc-items/${iId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };

  const catColors: Record<string, string> = { suppliers: "bg-blue-100 text-blue-700", inputs: "bg-green-100 text-green-700", process: "bg-yellow-100 text-yellow-700", outputs: "bg-orange-100 text-orange-700", customers: "bg-red-100 text-red-700" };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><TableProperties className="h-6 w-6 text-blue-500" /><h1 className="text-2xl font-bold">SIPOC Diagram</h1></div><div className="flex gap-2">{diagrams.length > 0 && <Button variant="outline" onClick={() => openCreateItem()}><Plus className="h-4 w-4 mr-1" /> Item</Button>}<Button onClick={openCreateDiagram}><Plus className="h-4 w-4 mr-1" /> Diagram</Button></div></div>

        {diagrams.length === 0 ? <Card className="p-8 text-center"><TableProperties className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">No SIPOC diagrams yet</h3></Card> : (
          diagrams.map(diag => {
            const diagItems = items.filter(i => i.sipoc === diag.id);
            return (
              <Card key={diag.id}>
                <CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle>{diag.process_name}</CardTitle><div className="flex gap-1"><Button variant="outline" size="sm" onClick={() => openCreateItem(diag.id)}><Plus className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => openEditDiagram(diag)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => deleteDiagram(diag.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></div>{(diag.process_start || diag.process_end) && <p className="text-sm text-muted-foreground">{diag.process_start} → {diag.process_end}</p>}</CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-2">
                    {CATEGORIES.map(cat => (
                      <div key={cat}><div className={`text-center text-xs font-bold py-1 rounded-t ${catColors[cat]}`}>{CAT_LABELS[cat]}</div>
                        <div className="border rounded-b p-2 min-h-[80px] space-y-1">{diagItems.filter(i => i.category === cat).map(i => (
                          <div key={i.id} className="text-xs p-1.5 bg-muted/50 rounded flex items-center justify-between group"><span>{i.description}</span><div className="opacity-0 group-hover:opacity-100 flex gap-0.5"><button onClick={() => openEditItem(i)} className="hover:text-blue-500"><Pencil className="h-3 w-3" /></button><button onClick={() => deleteItem(i.id)} className="hover:text-red-500"><Trash2 className="h-3 w-3" /></button></div></div>
                        ))}</div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} {dialogType === "diagram" ? "SIPOC Diagram" : "SIPOC Item"}</DialogTitle></DialogHeader>
        {dialogType === "diagram" ? (
          <div className="space-y-4"><div className="space-y-2"><Label>Process Name *</Label><Input value={dForm.process_name} onChange={(e) => setDForm({ ...dForm, process_name: e.target.value })} /></div><div className="space-y-2"><Label>Process Description</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={dForm.process_description} onChange={(e) => setDForm({ ...dForm, process_description: e.target.value })} /></div><div className="space-y-2"><Label>Process Start *</Label><textarea className="w-full min-h-[40px] px-3 py-2 border rounded-md bg-background" value={dForm.process_start} onChange={(e) => setDForm({ ...dForm, process_start: e.target.value })} /></div><div className="space-y-2"><Label>Process End *</Label><textarea className="w-full min-h-[40px] px-3 py-2 border rounded-md bg-background" value={dForm.process_end} onChange={(e) => setDForm({ ...dForm, process_end: e.target.value })} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSaveDiagram} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div></div>
        ) : (
          <div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Diagram</Label><Select value={iForm.sipoc} onValueChange={(v) => setIForm({ ...iForm, sipoc: v })}><SelectTrigger><SelectValue placeholder={pt("Select diagram")} /></SelectTrigger><SelectContent>{diagrams.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.process_name}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>{pt("Category")} *</Label><Select value={iForm.category} onValueChange={(v) => setIForm({ ...iForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{CAT_LABELS[c]}</SelectItem>)}</SelectContent></Select></div></div><div className="space-y-2"><Label>{pt("Description")} *</Label><textarea className="w-full min-h-[40px] px-3 py-2 border rounded-md bg-background" value={iForm.description} onChange={(e) => setIForm({ ...iForm, description: e.target.value })} /></div><div className="space-y-2"><Label>Order</Label><Input type="number" value={iForm.order} onChange={(e) => setIForm({ ...iForm, order: e.target.value })} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSaveItem} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div></div>
        )}
      </DialogContent></Dialog>
    </div>
  );
};

export default SixSigmaSIPOC;
