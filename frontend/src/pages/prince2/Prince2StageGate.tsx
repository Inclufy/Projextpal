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
import { Loader2, Plus, CheckCircle2, XCircle, Pencil, Trash2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const Prince2StageGate = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [gates, setGates] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ stage: "", outcome: "pending", review_date: "", decision_notes: "", stage_performance_summary: "", products_completed: "", products_pending: "", lessons_learned: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [gRes, sRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/prince2/stage-gates/`, { headers }),
        fetch(`/api/v1/projects/${id}/prince2/stages/`, { headers }),
      ]);
      if (gRes.ok) { const d = await gRes.json(); setGates(Array.isArray(d) ? d : d.results || []); }
      if (sRes.ok) { const d = await sRes.json(); setStages(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ stage: stages[0]?.id?.toString() || "", outcome: "pending", review_date: "", decision_notes: "", stage_performance_summary: "", products_completed: "", products_pending: "", lessons_learned: "" }); setDialogOpen(true); };
  const openEdit = (g: any) => { setEditing(g); setForm({ stage: g.stage?.toString() || "", outcome: g.outcome || "pending", review_date: g.review_date || "", decision_notes: g.decision_notes || "", stage_performance_summary: g.stage_performance_summary || "", products_completed: g.products_completed || "", products_pending: g.products_pending || "", lessons_learned: g.lessons_learned || "" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.stage) { toast.error(pt("Please select a stage")); return; }
    setSubmitting(true);
    try {
      const body: any = {
        stage: parseInt(form.stage),
        outcome: form.outcome,
        decision_notes: form.decision_notes,
        stage_performance_summary: form.stage_performance_summary,
        products_completed: form.products_completed,
        products_pending: form.products_pending,
        lessons_learned: form.lessons_learned,
      };
      if (form.review_date) body.review_date = form.review_date;
      const url = editing ? `/api/v1/projects/${id}/prince2/stage-gates/${editing.id}/` : `/api/v1/projects/${id}/prince2/stage-gates/`;
      const method = editing ? "PATCH" : "POST";
      const response = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (response.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleAction = async (gateId: number, action: "approve" | "reject") => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/prince2/stage-gates/${gateId}/${action}/`, { method: "POST", headers: jsonHeaders });
      if (r.ok) { toast.success(action === "approve" ? pt("Approved") : pt("Action completed")); fetchData(); }
      else toast.error(pt("Action failed"));
    } catch { toast.error(pt("Action failed")); }
  };

  const handleDelete = async (gateId: number) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    try {
      const r = await fetch(`/api/v1/projects/${id}/prince2/stage-gates/${gateId}/`, { method: "DELETE", headers });
      if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
    } catch { toast.error(pt("Delete failed")); }
  };

  const statusColors: Record<string, string> = { pending: "bg-gray-100 text-gray-700", approved: "bg-green-100 text-green-700", rejected: "bg-red-100 text-red-700", conditional: "bg-amber-100 text-amber-700" };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><ShieldCheck className="h-6 w-6 text-green-500" /><h1 className="text-2xl font-bold">{pt("Stage Gates")}</h1><Badge variant="outline">{gates.length}</Badge></div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Create")}</Button>
        </div>

        {gates.length === 0 ? (
          <Card className="p-8 text-center"><ShieldCheck className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">No stage gates yet</h3><Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> {pt("Create")}</Button></Card>
        ) : (
          <div className="space-y-3">{gates.map((g) => (
            <Card key={g.id}><CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1"><Badge className={`text-xs ${statusColors[g.outcome] || ""}`}>{g.outcome}</Badge>{g.review_date && <Badge variant="outline" className="text-xs">{g.review_date}</Badge>}<span className="text-sm text-muted-foreground">{stages.find(s => s.id === g.stage)?.name || g.stage_name}</span></div>
                {g.decision_notes && <p className="text-sm mt-1">{g.decision_notes}</p>}
                {g.stage_performance_summary && <p className="text-sm text-muted-foreground mt-1">{g.stage_performance_summary}</p>}
              </div>
              <div className="flex gap-1 ml-4">
                {g.outcome === "pending" && <>
                  <Button variant="ghost" size="sm" onClick={() => handleAction(g.id, "approve")}><CheckCircle2 className="h-4 w-4 text-green-500" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleAction(g.id, "reject")}><XCircle className="h-4 w-4 text-red-500" /></Button>
                </>}
                <Button variant="ghost" size="sm" onClick={() => openEdit(g)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(g.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent></Card>
          ))}</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Create")} Stage Gate</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Stage</Label><Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}><SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger><SelectContent>{stages.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Outcome</Label><Select value={form.outcome} onValueChange={(v) => setForm({ ...form, outcome: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="pending">Pending</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="conditional">Conditional</SelectItem><SelectItem value="rejected">Rejected</SelectItem><SelectItem value="deferred">Deferred</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Review Date</Label><Input type="date" value={form.review_date} onChange={(e) => setForm({ ...form, review_date: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>Decision Notes</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.decision_notes} onChange={(e) => setForm({ ...form, decision_notes: e.target.value })} /></div>
            <div className="space-y-2"><Label>Stage Performance Summary</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.stage_performance_summary} onChange={(e) => setForm({ ...form, stage_performance_summary: e.target.value })} /></div>
            <div className="space-y-2"><Label>Products Completed</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.products_completed} onChange={(e) => setForm({ ...form, products_completed: e.target.value })} /></div>
            <div className="space-y-2"><Label>Products Pending</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.products_pending} onChange={(e) => setForm({ ...form, products_pending: e.target.value })} /></div>
            <div className="space-y-2"><Label>Lessons Learned</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.lessons_learned} onChange={(e) => setForm({ ...form, lessons_learned: e.target.value })} /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prince2StageGate;
