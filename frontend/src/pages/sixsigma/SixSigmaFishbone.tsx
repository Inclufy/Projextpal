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
import { Loader2, Plus, GitBranch, Pencil, Trash2, ThumbsUp, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const BASE = (id: string) => `/api/v1/sixsigma/projects/${id}/sixsigma`;
const CATEGORIES = ["manpower", "machine", "method", "material", "measurement", "mother_nature"];
const CATEGORY_LABELS: Record<string, string> = { manpower: "Manpower", machine: "Machine", method: "Method", material: "Material", measurement: "Measurement", mother_nature: "Mother Nature" };

const SixSigmaFishbone = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [diagrams, setDiagrams] = useState<any[]>([]);
  const [causes, setCauses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogType, setDialogType] = useState<"diagram" | "cause">("diagram");
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [dForm, setDForm] = useState({ problem_statement: "" });
  const [cForm, setCForm] = useState({ fishbone: "", category: "manpower", cause: "", sub_cause: "" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const [dRes, cRes] = await Promise.all([fetch(`${BASE(id!)}/fishbone/`, { headers }), fetch(`${BASE(id!)}/causes/`, { headers })]); if (dRes.ok) { const d = await dRes.json(); setDiagrams(Array.isArray(d) ? d : d.results || []); } if (cRes.ok) { const d = await cRes.json(); setCauses(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const openCreateDiagram = () => { setDialogType("diagram"); setEditing(null); setDForm({ problem_statement: "" }); setDialogOpen(true); };
  const openCreateCause = (diagId?: number) => { setDialogType("cause"); setEditing(null); setCForm({ fishbone: String(diagId || diagrams[0]?.id || ""), category: "manpower", cause: "", sub_cause: "" }); setDialogOpen(true); };
  const openEditCause = (c: any) => { setDialogType("cause"); setEditing(c); setCForm({ fishbone: String(c.fishbone || ""), category: c.category || "manpower", cause: c.cause || "", sub_cause: c.sub_cause || "" }); setDialogOpen(true); };
  const openEditDiagram = (d: any) => { setDialogType("diagram"); setEditing(d); setDForm({ problem_statement: d.problem_statement || "" }); setDialogOpen(true); };

  const saveDiagram = async () => { if (!dForm.problem_statement) { toast.error(pt("Problem statement is required")); return; } setSubmitting(true); try { const url = editing ? `${BASE(id!)}/fishbone/${editing.id}/` : `${BASE(id!)}/fishbone/`; const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(dForm) }); if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); } };
  const saveCause = async () => { if (!cForm.cause) { toast.error(pt("Cause is required")); return; } if (!cForm.fishbone) { toast.error(pt("Please select a diagram")); return; } setSubmitting(true); try { const body: any = { fishbone: parseInt(cForm.fishbone), category: cForm.category, cause: cForm.cause, sub_cause: cForm.sub_cause }; const url = editing ? `${BASE(id!)}/causes/${editing.id}/` : `${BASE(id!)}/causes/`; const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) }); if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); } };
  const deleteDiagram = async (dId: number) => { if (!confirm("Verwijderen?")) return; try { await fetch(`${BASE(id!)}/fishbone/${dId}/`, { method: "DELETE", headers }); fetchData(); } catch {} };
  const deleteCause = async (cId: number) => { if (!confirm("Verwijderen?")) return; try { await fetch(`${BASE(id!)}/causes/${cId}/`, { method: "DELETE", headers }); fetchData(); } catch {} };
  const voteCause = async (cId: number) => { try { await fetch(`${BASE(id!)}/causes/${cId}/vote/`, { method: "POST", headers: jsonHeaders }); fetchData(); } catch {} };
  const toggleRoot = async (cId: number) => { try { await fetch(`${BASE(id!)}/causes/${cId}/toggle_root_cause/`, { method: "POST", headers: jsonHeaders }); fetchData(); } catch {} };

  const catColors: Record<string, string> = { manpower: "bg-blue-100 text-blue-700", machine: "bg-purple-100 text-purple-700", method: "bg-green-100 text-green-700", material: "bg-orange-100 text-orange-700", measurement: "bg-cyan-100 text-cyan-700", mother_nature: "bg-yellow-100 text-yellow-700" };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><GitBranch className="h-6 w-6 text-yellow-500" /><h1 className="text-2xl font-bold">Fishbone Diagram</h1></div><div className="flex gap-2"><Button variant="outline" onClick={() => openCreateCause()}><Plus className="h-4 w-4 mr-1" /> Cause</Button><Button onClick={openCreateDiagram}><Plus className="h-4 w-4 mr-1" /> Diagram</Button></div></div>
      {diagrams.length === 0 ? <Card className="p-8 text-center"><GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">No fishbone diagrams yet</h3></Card> : (
        diagrams.map(diag => {
          const diagCauses = causes.filter(c => c.fishbone === diag.id);
          return (
            <Card key={diag.id}><CardHeader className="pb-2"><div className="flex items-center justify-between"><div><CardTitle>{diag.problem_statement ? `Problem: ${diag.problem_statement}` : pt("Fishbone Diagram")}</CardTitle></div><div className="flex gap-1"><Button variant="outline" size="sm" onClick={() => openCreateCause(diag.id)}><Plus className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => openEditDiagram(diag)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => deleteDiagram(diag.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div></div></CardHeader>
              <CardContent><div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {CATEGORIES.map(cat => { const catCauses = diagCauses.filter(c => c.category === cat); return (
                  <div key={cat}><div className={`text-xs font-bold px-2 py-1 rounded-t ${catColors[cat]}`}>{CATEGORY_LABELS[cat]} ({catCauses.length})</div>
                    <div className="border rounded-b p-2 min-h-[60px] space-y-1">{catCauses.map(c => (
                      <div key={c.id} className={`text-xs p-1.5 rounded flex items-center justify-between group ${c.is_root_cause ? "bg-red-50 border border-red-200" : "bg-muted/50"}`}>
                        <div className="flex-1"><span className={c.is_root_cause ? "font-bold text-red-700" : ""}>{c.cause}</span>{c.votes > 0 && <span className="ml-1 text-muted-foreground">({c.votes})</span>}</div>
                        <div className="opacity-0 group-hover:opacity-100 flex gap-0.5"><button onClick={() => voteCause(c.id)}><ThumbsUp className="h-3 w-3" /></button><button onClick={() => toggleRoot(c.id)}><CheckCircle2 className="h-3 w-3" /></button><button onClick={() => openEditCause(c)}><Pencil className="h-3 w-3" /></button><button onClick={() => deleteCause(c.id)}><Trash2 className="h-3 w-3 text-red-500" /></button></div>
                      </div>
                    ))}</div>
                  </div>
                ); })}
              </div></CardContent>
            </Card>
          );
        })
      )}
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} {dialogType === "diagram" ? "Fishbone Diagram" : "Cause"}</DialogTitle></DialogHeader>
      {dialogType === "diagram" ? (
        <div className="space-y-4"><div className="space-y-2"><Label>Problem Statement *</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={dForm.problem_statement} onChange={(e) => setDForm({ ...dForm, problem_statement: e.target.value })} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={saveDiagram} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div></div>
      ) : (
        <div className="space-y-4"><div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>Diagram</Label><Select value={cForm.fishbone} onValueChange={(v) => setCForm({ ...cForm, fishbone: v })}><SelectTrigger><SelectValue placeholder={pt("Select diagram")} /></SelectTrigger><SelectContent>{diagrams.map(d => <SelectItem key={d.id} value={d.id.toString()}>{d.problem_statement ? d.problem_statement.slice(0, 40) : `Diagram #${d.id}`}</SelectItem>)}</SelectContent></Select></div><div className="space-y-2"><Label>{pt("Category")}</Label><Select value={cForm.category} onValueChange={(v) => setCForm({ ...cForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CATEGORIES.map(c => <SelectItem key={c} value={c}>{CATEGORY_LABELS[c]}</SelectItem>)}</SelectContent></Select></div></div><div className="space-y-2"><Label>{pt("Cause")} *</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={cForm.cause} onChange={(e) => setCForm({ ...cForm, cause: e.target.value })} /></div><div className="space-y-2"><Label>Sub-cause</Label><textarea className="w-full min-h-[40px] px-3 py-2 border rounded-md bg-background" value={cForm.sub_cause} onChange={(e) => setCForm({ ...cForm, sub_cause: e.target.value })} /></div><div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={saveCause} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div></div>
      )}
    </DialogContent></Dialog>
    </div>
  );
};
export default SixSigmaFishbone;
