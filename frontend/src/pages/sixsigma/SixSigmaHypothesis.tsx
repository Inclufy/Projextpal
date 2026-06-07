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
import { Loader2, Plus, FlaskConical, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const BASE = (id: string) => `/api/v1/projects/${id}/sixsigma`;

const SixSigmaHypothesis = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", null_hypothesis: "", alt_hypothesis: "", test_type: "1_sample_t", alpha: "0.05", sample_size: "" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const r = await fetch(`${BASE(id!)}/hypothesis/`, { headers }); if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);
  const openCreate = () => { setEditing(null); setForm({ name: "", null_hypothesis: "", alt_hypothesis: "", test_type: "1_sample_t", alpha: "0.05", sample_size: "" }); setDialogOpen(true); };
  const openEdit = (i: any) => { setEditing(i); setForm({ name: i.name || "", null_hypothesis: i.null_hypothesis || "", alt_hypothesis: i.alt_hypothesis || "", test_type: i.test_type || "1_sample_t", alpha: String(i.alpha ?? "0.05"), sample_size: i.sample_size != null ? String(i.sample_size) : "" }); setDialogOpen(true); };
  const handleSave = async () => { if (!form.name) { toast.error(pt("Name is required")); return; } if (!form.null_hypothesis) { toast.error("H₀ verplicht"); return; } if (!form.alt_hypothesis) { toast.error("H₁ verplicht"); return; } setSubmitting(true); try { const body: any = { name: form.name, test_type: form.test_type, null_hypothesis: form.null_hypothesis, alt_hypothesis: form.alt_hypothesis }; if (form.alpha) body.alpha = parseFloat(form.alpha); if (form.sample_size) body.sample_size = parseInt(form.sample_size); const url = editing ? `${BASE(id!)}/hypothesis/${editing.id}/` : `${BASE(id!)}/hypothesis/`; const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) }); if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); } };
  const handleDelete = async (hId: number) => { if (!confirm("Verwijderen?")) return; try { await fetch(`${BASE(id!)}/hypothesis/${hId}/`, { method: "DELETE", headers }); fetchData(); } catch {} };
  const recordResults = async (hId: number) => { const pValue = prompt("Enter p-value:"); if (!pValue) return; try { const r = await fetch(`${BASE(id!)}/hypothesis/${hId}/record_results/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify({ p_value: parseFloat(pValue) }) }); if (r.ok) { toast.success("Results recorded"); fetchData(); } } catch { toast.error("Recording failed"); } };
  const resultColors: Record<string, string> = { rejected: "bg-red-100 text-red-700", not_rejected: "bg-green-100 text-green-700", inconclusive: "bg-yellow-100 text-yellow-700" };
  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);
  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><FlaskConical className="h-6 w-6 text-purple-500" /><h1 className="text-2xl font-bold">Hypothesis Testing</h1><Badge variant="outline">{items.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button></div>
      {items.length === 0 ? <Card className="p-8 text-center"><FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">No hypothesis tests yet</h3></Card> : (
        <div className="space-y-3">{items.map(i => (
          <Card key={i.id}><CardContent className="p-4"><div className="flex items-center justify-between mb-2"><div className="flex items-center gap-2"><span className="font-medium text-sm">{i.name}</span><Badge variant="outline" className="text-xs">{i.test_type_display || i.test_type?.replace(/_/g, " ")}</Badge>{i.conclusion && <Badge className={`text-xs ${resultColors[i.conclusion] || ""}`}>{i.conclusion_display || i.conclusion?.replace(/_/g, " ")}</Badge>}</div><div className="flex gap-1">{!i.p_value && <Button variant="outline" size="sm" onClick={() => recordResults(i.id)} className="text-xs">Record Results</Button>}<Button variant="ghost" size="sm" onClick={() => openEdit(i)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(i.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></div>
            <p className="text-sm mb-1"><strong>H₀:</strong> {i.null_hypothesis}</p><p className="text-sm mb-1"><strong>H₁:</strong> {i.alt_hypothesis}</p>
            <div className="flex gap-4 text-xs text-muted-foreground"><span>α = {i.alpha}</span>{i.p_value != null && <span>p = {i.p_value}</span>}{i.sample_size && <span>n = {i.sample_size}</span>}</div>
          </CardContent></Card>
        ))}</div>
      )}
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} Hypothesis Test</DialogTitle></DialogHeader><div className="space-y-4"><div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="space-y-2"><Label>Null Hypothesis (H₀) *</Label><textarea className="w-full min-h-[40px] px-3 py-2 border rounded-md bg-background" value={form.null_hypothesis} onChange={(e) => setForm({ ...form, null_hypothesis: e.target.value })} /></div><div className="space-y-2"><Label>Alternative Hypothesis (H₁) *</Label><textarea className="w-full min-h-[40px] px-3 py-2 border rounded-md bg-background" value={form.alt_hypothesis} onChange={(e) => setForm({ ...form, alt_hypothesis: e.target.value })} /></div><div className="grid grid-cols-3 gap-3"><div className="space-y-2"><Label>Test Type</Label><Select value={form.test_type} onValueChange={(v) => setForm({ ...form, test_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="1_sample_t">1-Sample T-Test</SelectItem><SelectItem value="2_sample_t">2-Sample T-Test</SelectItem><SelectItem value="paired_t">Paired T-Test</SelectItem><SelectItem value="1_proportion">1-Proportion Test</SelectItem><SelectItem value="2_proportion">2-Proportion Test</SelectItem><SelectItem value="chi_square">Chi-Square Test</SelectItem><SelectItem value="anova">ANOVA</SelectItem><SelectItem value="regression">Regression</SelectItem><SelectItem value="correlation">Correlation</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>α Level</Label><Input type="number" step="0.01" value={form.alpha} onChange={(e) => setForm({ ...form, alpha: e.target.value })} /></div><div className="space-y-2"><Label>Sample Size</Label><Input type="number" value={form.sample_size} onChange={(e) => setForm({ ...form, sample_size: e.target.value })} /></div></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div></div></DialogContent></Dialog>
    </div>
  );
};
export default SixSigmaHypothesis;
