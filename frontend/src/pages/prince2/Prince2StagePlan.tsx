import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { Loader2, Plus, FileText, Pencil, Trash2, CheckCircle2, Package, ArrowRight } from "lucide-react";
import { toast } from "sonner";

const Prince2StagePlan = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [plans, setPlans] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [workPackagesByPlan, setWorkPackagesByPlan] = useState<Record<number, any[]>>({});
  const [workPackagesByStage, setWorkPackagesByStage] = useState<Record<number, any[]>>({});
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ stage: "", plan_description: "", resource_requirements: "", quality_approach: "", dependencies: "", assumptions: "", budget: "", status: "draft" });

  // Inline-create Work Package dialog state
  const [wpDialogOpen, setWpDialogOpen] = useState(false);
  const [wpSubmitting, setWpSubmitting] = useState(false);
  const [wpForm, setWpForm] = useState({ title: "", description: "", stage: "", stage_plan: "", priority: "medium" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [plRes, stRes, wpRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/prince2/stage-plans/`, { headers }),
        fetch(`/api/v1/projects/${id}/prince2/stages/`, { headers }),
        fetch(`/api/v1/projects/${id}/prince2/work-packages/`, { headers }),
      ]);
      if (plRes.ok) { const d = await plRes.json(); setPlans(Array.isArray(d) ? d : d.results || []); }
      if (stRes.ok) { const d = await stRes.json(); setStages(Array.isArray(d) ? d : d.results || []); }
      if (wpRes.ok) {
        const d = await wpRes.json();
        const list: any[] = Array.isArray(d) ? d : d.results || [];
        // Group by stage_plan (true plan-scoped relationship) for the primary
        // child-panel render. Also keep a stage-keyed grouping as fallback
        // for legacy WPs that pre-date the WorkPackage.stage_plan FK.
        const byPlan: Record<number, any[]> = {};
        const byStage: Record<number, any[]> = {};
        list.forEach((wp) => {
          if (wp.stage_plan != null) {
            if (!byPlan[wp.stage_plan]) byPlan[wp.stage_plan] = [];
            byPlan[wp.stage_plan].push(wp);
          }
          if (wp.stage != null) {
            if (!byStage[wp.stage]) byStage[wp.stage] = [];
            byStage[wp.stage].push(wp);
          }
        });
        setWorkPackagesByPlan(byPlan);
        setWorkPackagesByStage(byStage);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ stage: stages[0]?.id?.toString() || "", plan_description: "", resource_requirements: "", quality_approach: "", dependencies: "", assumptions: "", budget: "", status: "draft" }); setDialogOpen(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ stage: p.stage?.toString() || "", plan_description: p.plan_description || "", resource_requirements: p.resource_requirements || "", quality_approach: p.quality_approach || "", dependencies: p.dependencies || "", assumptions: p.assumptions || "", budget: p.budget != null ? String(p.budget) : "", status: p.status || "draft" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.stage) { toast.error(pt("Please select a stage")); return; }
    setSubmitting(true);
    try {
      const body: any = {
        stage: parseInt(form.stage),
        plan_description: form.plan_description,
        resource_requirements: form.resource_requirements,
        quality_approach: form.quality_approach,
        dependencies: form.dependencies,
        assumptions: form.assumptions,
        status: form.status,
      };
      if (form.budget !== "" && !isNaN(Number(form.budget))) body.budget = Number(form.budget);
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

  const openCreateWp = (stageId: number, planId: number) => {
    setWpForm({ title: "", description: "", stage: stageId.toString(), stage_plan: planId.toString(), priority: "medium" });
    setWpDialogOpen(true);
  };

  const handleSaveWp = async () => {
    if (!wpForm.title) { toast.error(pt("Title is required")); return; }
    setWpSubmitting(true);
    try {
      const body: any = { title: wpForm.title, description: wpForm.description, priority: wpForm.priority };
      if (wpForm.stage) body.stage = parseInt(wpForm.stage);
      if (wpForm.stage_plan) body.stage_plan = parseInt(wpForm.stage_plan);
      const response = await fetch(`/api/v1/projects/${id}/prince2/work-packages/`, {
        method: "POST", headers: jsonHeaders, body: JSON.stringify(body)
      });
      if (response.ok) {
        toast.success(pt("Work package created"));
        setWpDialogOpen(false);
        fetchData();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.error || pt("Save failed"));
      }
    } catch { toast.error(pt("Save failed")); }
    finally { setWpSubmitting(false); }
  };

  const getStageName = (stageId: number) => stages.find(s => s.id === stageId)?.name || `Stage ${stageId}`;

  const wpStatusColors: Record<string, string> = {
    draft: "bg-gray-100 text-gray-700",
    authorized: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700",
    completed: "bg-green-100 text-green-700",
    closed: "bg-slate-100 text-slate-700",
  };

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
          <div className="space-y-4">{plans.map((p) => {
            // Prefer plan-scoped WPs (via WorkPackage.stage_plan FK). Fall back to
            // stage-scoped grouping for legacy rows where stage_plan is null.
            const planWps = workPackagesByPlan[p.id];
            const stageWps = (planWps && planWps.length > 0)
              ? planWps
              : (workPackagesByStage[p.stage] || []);
            return (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => navigate(`/projects/${id}/prince2/dashboard?stage=${p.stage}`)}
                      className="inline-flex items-center"
                      title={pt("View stage in dashboard")}
                    >
                      <Badge variant="secondary" className="cursor-pointer hover:bg-secondary/80 hover:underline">
                        {getStageName(p.stage)}
                      </Badge>
                    </button>
                    <Badge variant={p.status === "approved" ? "default" : "outline"}>{p.status}</Badge>
                  </div>
                  <div className="flex gap-1">
                    {p.status !== "approved" && <Button variant="ghost" size="sm" onClick={() => handleApprove(p.id)} className="text-green-600"><CheckCircle2 className="h-4 w-4" /></Button>}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {p.plan_description && <div><span className="font-medium text-muted-foreground">{pt("Plan Description")}:</span><p className="mt-1">{p.plan_description}</p></div>}
                  {p.resource_requirements && <div><span className="font-medium text-muted-foreground">{pt("Resource Requirements")}:</span><p className="mt-1">{p.resource_requirements}</p></div>}
                  {p.quality_approach && <div><span className="font-medium text-muted-foreground">{pt("Quality Approach")}:</span><p className="mt-1">{p.quality_approach}</p></div>}
                  {p.dependencies && <div><span className="font-medium text-muted-foreground">{pt("Dependencies")}:</span><p className="mt-1">{p.dependencies}</p></div>}
                  {p.assumptions && <div><span className="font-medium text-muted-foreground">{pt("Assumptions")}:</span><p className="mt-1">{p.assumptions}</p></div>}
                  {p.budget && <div><span className="font-medium text-muted-foreground">{pt("Budget")}:</span><p className="mt-1">{p.budget}</p></div>}
                </div>

                {/* Child panel: Work Packages tied to this stage */}
                <div className="mt-4 pt-4 border-t">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="h-4 w-4 text-blue-500" />
                      <span className="font-medium text-sm">{pt("Work Packages")}</span>
                      <Badge variant="outline" className="text-xs">{stageWps.length}</Badge>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openCreateWp(p.stage, p.id)} className="gap-1 h-7 text-xs">
                        <Plus className="h-3 w-3" /> {pt("Add Work Package")}
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => navigate(`/projects/${id}/prince2/work-packages?stage=${p.stage}`)} className="gap-1 h-7 text-xs">
                        {pt("View all")} <ArrowRight className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  {stageWps.length === 0 ? (
                    <p className="text-xs text-muted-foreground italic">{pt("No work packages for this stage yet.")}</p>
                  ) : (
                    <div className="space-y-2">
                      {stageWps.slice(0, 5).map((wp) => (
                        <div
                          key={wp.id}
                          onClick={() => navigate(`/projects/${id}/prince2/work-packages?wp=${wp.id}`)}
                          className="flex items-center justify-between p-2 border rounded-md hover:bg-muted/50 cursor-pointer text-sm"
                          title={pt("Open Work Package")}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="text-xs font-mono text-muted-foreground shrink-0">{wp.reference}</span>
                            <span className="truncate font-medium">{wp.title}</span>
                            <Badge className={`text-xs shrink-0 ${wpStatusColors[wp.status] || ""}`}>{wp.status}</Badge>
                          </div>
                          <div className="flex items-center gap-2 shrink-0">
                            <Progress value={wp.progress_percentage || 0} className="h-1.5 w-16" />
                            <span className="text-xs text-muted-foreground w-8 text-right">{wp.progress_percentage || 0}%</span>
                          </div>
                        </div>
                      ))}
                      {stageWps.length > 5 && (
                        <p className="text-xs text-muted-foreground text-center">
                          {pt("+")} {stageWps.length - 5} {pt("more")}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            );
          })}</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Create")} {pt("Stage Plan")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>Stage</Label><Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}><SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger><SelectContent>{stages.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>{pt("Plan Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.plan_description} onChange={(e) => setForm({ ...form, plan_description: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Resource Requirements")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.resource_requirements} onChange={(e) => setForm({ ...form, resource_requirements: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Quality Approach")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.quality_approach} onChange={(e) => setForm({ ...form, quality_approach: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Dependencies")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.dependencies} onChange={(e) => setForm({ ...form, dependencies: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Assumptions")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.assumptions} onChange={(e) => setForm({ ...form, assumptions: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Budget")}</Label><Input type="number" value={form.budget} onChange={(e) => setForm({ ...form, budget: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Status")}</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">Draft</SelectItem><SelectItem value="approved">Approved</SelectItem><SelectItem value="baselined">Baselined</SelectItem></SelectContent></Select></div>
            </div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Inline-create Work Package dialog (stage pre-selected from the Stage Plan card) */}
      <Dialog open={wpDialogOpen} onOpenChange={setWpDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {pt("Create Work Package")}
              {wpForm.stage && <span className="text-sm font-normal text-muted-foreground"> — {getStageName(parseInt(wpForm.stage))}</span>}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{pt("Title")} *</Label>
              <Input value={wpForm.title} onChange={(e) => setWpForm({ ...wpForm, title: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{pt("Description")}</Label>
              <textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background" value={wpForm.description} onChange={(e) => setWpForm({ ...wpForm, description: e.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>{pt("Priority")}</Label>
              <Select value={wpForm.priority} onValueChange={(v) => setWpForm({ ...wpForm, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setWpDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSaveWp} disabled={wpSubmitting}>
                {wpSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prince2StagePlan;
