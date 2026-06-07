import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Lightbulb, Pencil, Trash2, GitBranch } from "lucide-react";
import { toast } from "sonner";

const BASE = (id: string) => `/api/v1/projects/${id}/sixsigma`;

const CATEGORY_LABELS: Record<string, string> = {
  manpower: "Manpower",
  machine: "Machine",
  method: "Method",
  material: "Material",
  measurement: "Measurement",
  mother_nature: "Mother Nature",
};

const SixSigmaSolutions = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [items, setItems] = useState<any[]>([]);
  const [causes, setCauses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", category: "process", impact: "medium", effort: "medium", expected_savings: "", implementation_cost: "", status: "proposed", addresses_root_cause: "" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const [sRes, cRes] = await Promise.all([fetch(`${BASE(id!)}/solutions/`, { headers }), fetch(`${BASE(id!)}/causes/`, { headers })]); if (sRes.ok) { const d = await sRes.json(); setItems(Array.isArray(d) ? d : d.results || []); } if (cRes.ok) { const d = await cRes.json(); setCauses(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);
  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", category: "process", impact: "medium", effort: "medium", expected_savings: "", implementation_cost: "", status: "proposed", addresses_root_cause: "" }); setDialogOpen(true); };
  const openEdit = (i: any) => { setEditing(i); setForm({ name: i.name || "", description: i.description || "", category: i.category || "process", impact: i.impact || "medium", effort: i.effort || "medium", expected_savings: i.expected_savings != null ? String(i.expected_savings) : "", implementation_cost: i.implementation_cost != null ? String(i.implementation_cost) : "", status: i.status || "proposed", addresses_root_cause: i.addresses_root_cause != null ? String(i.addresses_root_cause) : "" }); setDialogOpen(true); };
  const handleSave = async () => {
    if (!form.name) { toast.error(pt("Name is required")); return; }
    if (!form.description) { toast.error(pt("Description is required")); return; }
    setSubmitting(true);
    try {
      const body: any = { name: form.name, description: form.description, category: form.category, impact: form.impact, effort: form.effort, status: form.status };
      if (form.expected_savings !== "" && !isNaN(Number(form.expected_savings))) body.expected_savings = Number(form.expected_savings);
      if (form.implementation_cost !== "" && !isNaN(Number(form.implementation_cost))) body.implementation_cost = Number(form.implementation_cost);
      if (form.addresses_root_cause !== "") body.addresses_root_cause = parseInt(form.addresses_root_cause);
      else if (editing) body.addresses_root_cause = null;
      const url = editing ? `${BASE(id!)}/solutions/${editing.id}/` : `${BASE(id!)}/solutions/`;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); }
  };
  const handleDelete = async (sId: number) => { if (!confirm("Verwijderen?")) return; try { await fetch(`${BASE(id!)}/solutions/${sId}/`, { method: "DELETE", headers }); fetchData(); } catch {} };
  const statusColors: Record<string, string> = { proposed: "bg-blue-100 text-blue-700", evaluating: "bg-amber-100 text-amber-700", approved: "bg-green-100 text-green-700", piloting: "bg-cyan-100 text-cyan-700", implementing: "bg-purple-100 text-purple-700", completed: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700" };
  const causeById = (cId: number | null | undefined) => causes.find(c => c.id === cId);
  const causeLabel = (c: any) => {
    if (!c) return "";
    const cat = CATEGORY_LABELS[c.category] || c.category;
    const text = (c.cause || "").length > 60 ? `${(c.cause || "").slice(0, 57)}...` : (c.cause || "");
    return `${cat}: ${text}`;
  };
  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);
  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Lightbulb className="h-6 w-6 text-yellow-500" /><h1 className="text-2xl font-bold">Solutions</h1><Badge variant="outline">{items.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button></div>
      {items.length === 0 ? <Card className="p-8 text-center"><Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">No solutions yet</h3></Card> : (
        <div className="space-y-2">{items.map(i => {
          const linkedCause = causeById(i.addresses_root_cause);
          return (
          <Card key={i.id}><CardContent className="p-4 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1 flex-wrap"><span className="font-medium">{i.name}</span><Badge className={`text-xs ${statusColors[i.status] || ""}`}>{i.status_display || i.status}</Badge>
                {linkedCause && (
                  <Badge
                    variant="outline"
                    className="text-xs cursor-pointer hover:bg-muted gap-1"
                    onClick={(e) => { e.stopPropagation(); navigate(`/projects/${id}/analyze/fishbone`); }}
                    title={pt("Open Fishbone diagram")}
                  >
                    <GitBranch className="h-3 w-3" /> {causeLabel(linkedCause)}
                  </Badge>
                )}
              </div>
              {i.description && <p className="text-sm text-muted-foreground">{i.description}</p>}
              <div className="flex gap-4 text-xs text-muted-foreground mt-1"><span>Impact: {i.impact_display || i.impact}</span><span>Effort: {i.effort_display || i.effort}</span>{i.expected_savings && <span>Savings: €{parseFloat(i.expected_savings).toLocaleString()}</span>}</div>
            </div>
            <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(i)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(i.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div>
          </CardContent></Card>
        );})}</div>
      )}
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} Solution</DialogTitle></DialogHeader>
      <div className="space-y-4">
        <div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
        <div className="space-y-2"><Label>{pt("Description")} *</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
        <div className="space-y-2">
          <Label>{pt("Root Cause")} ({pt("addressed by this solution")})</Label>
          <Select value={form.addresses_root_cause || "__none__"} onValueChange={(v) => setForm({ ...form, addresses_root_cause: v === "__none__" ? "" : v })}>
            <SelectTrigger><SelectValue placeholder={pt("Select a cause from the Fishbone diagram (optional)")} /></SelectTrigger>
            <SelectContent>
              <SelectItem value="__none__">{pt("None")}</SelectItem>
              {causes.length === 0 && <div className="px-2 py-1.5 text-xs text-muted-foreground">{pt("No causes yet — add some in the Fishbone diagram first.")}</div>}
              {causes.map(c => (
                <SelectItem key={c.id} value={String(c.id)}>
                  {c.is_root_cause ? "★ " : ""}{causeLabel(c)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid grid-cols-3 gap-3"><div className="space-y-2"><Label>Category</Label><Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="process">Process Change</SelectItem><SelectItem value="technology">Technology</SelectItem><SelectItem value="people">People/Training</SelectItem><SelectItem value="policy">Policy Change</SelectItem><SelectItem value="equipment">Equipment</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Impact</Label><Select value={form.impact} onValueChange={(v) => setForm({ ...form, impact: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div><div className="space-y-2"><Label>Effort</Label><Select value={form.effort} onValueChange={(v) => setForm({ ...form, effort: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="low">Low</SelectItem><SelectItem value="medium">Medium</SelectItem><SelectItem value="high">High</SelectItem></SelectContent></Select></div></div>
        <div className="grid grid-cols-2 gap-3"><div className="space-y-2"><Label>Expected Savings (€)</Label><Input type="number" value={form.expected_savings} onChange={(e) => setForm({ ...form, expected_savings: e.target.value })} /></div><div className="space-y-2"><Label>Implementation Cost (€)</Label><Input type="number" value={form.implementation_cost} onChange={(e) => setForm({ ...form, implementation_cost: e.target.value })} /></div></div>
        <div className="space-y-2"><Label>{pt("Status")}</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="proposed">Proposed</SelectItem><SelectItem value="evaluating">Evaluating</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="piloting">Piloting</SelectItem><SelectItem value="implementing">Implementing</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="rejected">Rejected</SelectItem></SelectContent></Select></div>
        <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
      </div>
    </DialogContent></Dialog>
    </div>
  );
};
export default SixSigmaSolutions;
