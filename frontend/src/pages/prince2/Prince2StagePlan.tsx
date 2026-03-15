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

const Prince2StagePlan = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [plans, setPlans] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ stage: "", objectives: "", deliverables: "", activities: "", resource_plan: "", budget: "", schedule: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [plRes, stRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/prince2/stage-plans/`, { headers }),
        fetch(`/api/v1/projects/${id}/prince2/stages/`, { headers }),
      ]);
      if (plRes.ok) { const d = await plRes.json(); setPlans(Array.isArray(d) ? d : d.results || []); }
      if (stRes.ok) { const d = await stRes.json(); setStages(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ stage: stages[0]?.id?.toString() || "", objectives: "", deliverables: "", activities: "", resource_plan: "", budget: "", schedule: "" }); setDialogOpen(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ stage: p.stage?.toString() || "", objectives: p.objectives || "", deliverables: p.deliverables || "", activities: p.activities || "", resource_plan: p.resource_plan || "", budget: p.budget || "", schedule: p.schedule || "" }); setDialogOpen(true); };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const body: any = { ...form };
      if (form.stage) body.stage = parseInt(form.stage);
      const url = editing ? `/api/v1/projects/${id}/prince2/stage-plans/${editing.id}/` : `/api/v1/projects/${id}/prince2/stage-plans/`;
      const method = editing ? "PATCH" : "POST";
      const response = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (response.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleApprove = async (planId: number) => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/prince2/stage-plans/${planId}/approve/`, { method: "POST", headers: jsonHeaders });
      if (r.ok) { toast.success(pt("Approved")); fetchData(); }
      else toast.error(pt("Action failed"));
    } catch { toast.error(pt("Action failed")); }
  };

  const handleDelete = async (planId: number) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    try {
      const r = await fetch(`/api/v1/projects/${id}/prince2/stage-plans/${planId}/`, { method: "DELETE", headers });
      if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
    } catch { toast.error(pt("Delete failed")); }
  };

  const getStageName = (stageId: number) => stages.find(s => s.id === stageId)?.name || `Stage ${stageId}`;

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><FileText className="h-6 w-6 text-indigo-500" /><h1 className="text-2xl font-bold">{pt("Stage Plans")}</h1><Badge variant="outline">{plans.length}</Badge></div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Create Plan")}</Button>
        </div>

        {plans.length === 0 ? (
          <Card className="p-8 text-center"><FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">{pt("No stage plan created yet")}</h3><Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> {pt("Create Plan")}</Button></Card>
        ) : (
          <div className="space-y-4">{plans.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2"><Badge variant="secondary">{getStageName(p.stage)}</Badge><Badge variant={p.status === "approved" ? "default" : "outline"}>{p.status}</Badge></div>
                  <div className="flex gap-1">
                    {p.status !== "approved" && <Button variant="ghost" size="sm" onClick={() => handleApprove(p.id)} className="text-green-600"><CheckCircle2 className="h-4 w-4" /></Button>}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {p.objectives && <div><span className="font-medium text-muted-foreground">{pt("Objectives")}:</span><p className="mt-1">{p.objectives}</p></div>}
                  {p.deliverables && <div><span className="font-medium text-muted-foreground">{pt("Deliverables")}:</span><p className="mt-1">{p.deliverables}</p></div>}
                  {p.activities && <div><span className="font-medium text-muted-foreground">{pt("Activities")}:</span><p className="mt-1">{p.activities}</p></div>}
                  {p.budget && <div><span className="font-medium text-muted-foreground">{pt("Budget")}:</span><p className="mt-1">{p.budget}</p></div>}
                </div>
              </CardContent>
            </Card>
          ))}</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Create")} {pt("Stage Plan")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {stages.length > 0 && <div className="space-y-2"><Label>Stage</Label><Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}><SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger><SelectContent>{stages.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent></Select></div>}
            <div className="space-y-2"><Label>{pt("Objectives")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.objectives} onChange={(e) => setForm({ ...form, objectives: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Deliverables")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.deliverables} onChange={(e) => setForm({ ...form, deliverables: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Activities")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.activities} onChange={(e) => setForm({ ...form, activities: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Budget")}</Label><Input value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Schedule")}</Label><Input value={form.schedule} onChange={(e) => setForm({ ...form, schedule: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prince2StagePlan;
