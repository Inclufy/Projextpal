import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, RotateCcw, Trash2, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

const AgileRetrospective = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [retros, setRetros] = useState<any[]>([]);
  const [iterations, setIterations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRetro, setSelectedRetro] = useState<any>(null);
  const [itemForm, setItemForm] = useState({ category: "went_well", content: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [rRes, itRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/agile/retrospectives/`, { headers }),
        fetch(`/api/v1/projects/${id}/agile/iterations/`, { headers }),
      ]);
      if (rRes.ok) { const d = await rRes.json(); setRetros(Array.isArray(d) ? d : d.results || []); }
      if (itRes.ok) { const d = await itRes.json(); setIterations(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const createRetro = async (iterationId: number) => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/agile/retrospectives/`, {
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({ iteration: iterationId, date: new Date().toISOString().split("T")[0], notes: "" })
      });
      if (r.ok) { toast.success("Retrospective aangemaakt"); fetchData(); }
      else { const err = await r.json().catch(() => null); toast.error(err?.detail || err?.iteration?.[0] || "Aanmaken mislukt"); }
    } catch { toast.error("Aanmaken mislukt"); }
  };

  const addItem = async () => {
    if (!selectedRetro || !itemForm.content) { toast.error("Content verplicht"); return; }
    setSubmitting(true);
    try {
      const r = await fetch(`/api/v1/projects/${id}/agile/retrospectives/${selectedRetro.id}/add_item/`, {
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify(itemForm)
      });
      if (r.ok) { toast.success("Item toegevoegd"); setDialogOpen(false); setItemForm({ category: "went_well", content: "" }); fetchData(); }
      else toast.error("Toevoegen mislukt");
    } catch { toast.error("Toevoegen mislukt"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (rId: number) => { if (!confirm("Verwijderen?")) return; try { const r = await fetch(`/api/v1/projects/${id}/agile/retrospectives/${rId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success("Verwijderd"); fetchData(); } } catch { toast.error("Verwijderen mislukt"); } };

  const categoryColors: Record<string, string> = { went_well: "bg-green-50 border-green-200 text-green-700", to_improve: "bg-red-50 border-red-200 text-red-700", action_item: "bg-blue-50 border-blue-200 text-blue-700" };
  const categoryLabels: Record<string, string> = { went_well: "What Went Well", to_improve: "To Improve", action_item: "Action Item" };
  const categoryIcons: Record<string, string> = { went_well: "✅", to_improve: "❌", action_item: "📋" };

  // Find iterations that don't have a retro yet
  const availableIterations = iterations.filter(it => it.status === "completed" && !retros.find(r => r.iteration === it.id));

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><RotateCcw className="h-6 w-6 text-purple-500" /><h1 className="text-2xl font-bold">{pt("Retrospective")}</h1><Badge variant="outline">{retros.length}</Badge></div>
          {availableIterations.length > 0 && (
            <Select onValueChange={(v) => createRetro(parseInt(v))}>
              <SelectTrigger className="w-[200px]"><SelectValue placeholder={pt("New Retrospective")} /></SelectTrigger>
              <SelectContent>{availableIterations.map(it => <SelectItem key={it.id} value={it.id.toString()}>{it.name}</SelectItem>)}</SelectContent>
            </Select>
          )}
        </div>
        {retros.length === 0 ? <Card className="p-8 text-center"><RotateCcw className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No retrospectives yet")}</h3><p className="text-muted-foreground">{pt("Complete an iteration to create a retrospective")}</p></Card> : (
          <div className="space-y-4">{retros.map(r => (
            <Card key={r.id}><CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div><p className="font-medium">{r.iteration_name || `Retro #${r.id}`}</p><p className="text-xs text-muted-foreground">{r.date}</p></div>
                <div className="flex gap-1">
                  <Button variant="outline" size="sm" onClick={() => { setSelectedRetro(r); setDialogOpen(true); }}><Plus className="h-3.5 w-3.5 mr-1" />{pt("Add Item")}</Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {["went_well", "to_improve", "action_item"].map(cat => (
                  <div key={cat}>
                    <p className="text-xs font-semibold mb-2">{categoryIcons[cat]} {categoryLabels[cat]}</p>
                    <div className="space-y-1">
                      {(r.items || []).filter((i: any) => i.category === cat).map((item: any) => (
                        <div key={item.id} className={`p-2 rounded border ${categoryColors[cat]}`}>
                          <p className="text-sm">{item.content}</p>
                          <div className="flex items-center gap-1 mt-1"><ThumbsUp className="h-3 w-3" /><span className="text-xs">{item.votes || 0}</span></div>
                        </div>
                      ))}
                      {(r.items || []).filter((i: any) => i.category === cat).length === 0 && <p className="text-xs text-muted-foreground italic">No items</p>}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent></Card>
          ))}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{pt("Add Retro Item")}</DialogTitle><DialogDescription>{pt("Add feedback to the retrospective")}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Category")}</Label><Select value={itemForm.category} onValueChange={(v) => setItemForm({ ...itemForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="went_well">What Went Well</SelectItem><SelectItem value="to_improve">To Improve</SelectItem><SelectItem value="action_item">Action Item</SelectItem></SelectContent></Select></div>
          <div className="space-y-2"><Label>{pt("Content")} *</Label><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background" value={itemForm.content} onChange={(e) => setItemForm({ ...itemForm, content: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={addItem} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Add")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default AgileRetrospective;
