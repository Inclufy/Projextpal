import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Target, Pencil, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const fetchJson = async (url: string) => {
  const token = localStorage.getItem("access_token");
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
};
const toArr = (d: any) => (Array.isArray(d) ? d : d?.results || []);

const statusColors: Record<string, string> = {
  not_started: "bg-gray-200 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  completed: "bg-green-100 text-green-700",
  on_hold: "bg-yellow-100 text-yellow-700",
};

const LSSGreenPhases = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ phase: "define", objective: "", status: "not_started", target_start_date: "", target_end_date: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const phasesQ = useQuery({ queryKey: ["lssg-phases", id], queryFn: () => fetchJson(`/api/v1/lss-green/projects/${id}/dmaic-phases/`), enabled: !!id });
  const tasksQ = useQuery({ queryKey: ["lssg-tasks", id], queryFn: () => fetchJson(`/api/v1/lss-green/projects/${id}/tasks/`), enabled: !!id });

  const phases = toArr(phasesQ.data);
  const tasks = toArr(tasksQ.data);

  const refresh = () => { qc.invalidateQueries({ queryKey: ["lssg-phases", id] }); };

  const openEdit = (p: any) => {
    setEditing(p);
    setForm({
      phase: p.phase || "define",
      objective: p.objective || "",
      status: p.status || "not_started",
      target_start_date: p.target_start_date?.split("T")[0] || "",
      target_end_date: p.target_end_date?.split("T")[0] || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const body: any = { ...form };
      if (!body.target_start_date) delete body.target_start_date;
      if (!body.target_end_date) delete body.target_end_date;
      const url = editing ? `/api/v1/lss-green/projects/${id}/dmaic-phases/${editing.id}/` : `/api/v1/lss-green/projects/${id}/dmaic-phases/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); refresh(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const markComplete = async (p: any) => {
    try {
      const r = await fetch(`/api/v1/lss-green/projects/${id}/dmaic-phases/${p.id}/`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ status: "completed", completed_at: new Date().toISOString() }) });
      if (r.ok) { toast.success(pt("Phase completed")); refresh(); }
    } catch { toast.error(pt("Update failed")); }
  };

  const phaseProgress = (p: any) => {
    const phaseTasks = tasks.filter((t: any) => t.phase === p.id);
    if (phaseTasks.length === 0) return 0;
    const done = phaseTasks.filter((t: any) => t.status === "completed" || t.status === "done").length;
    return Math.round((done / phaseTasks.length) * 100);
  };

  if (phasesQ.isLoading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Target className="h-6 w-6 text-green-500" /><h1 className="text-2xl font-bold">{pt("DMAIC Phases")}</h1><Badge variant="outline">{phases.length}</Badge></div>
        </div>

        {phases.length === 0 ? <Card className="p-8 text-center"><Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No phases yet")}</h3></Card> : (
          <div className="space-y-3">{phases.map((p: any) => (
            <Card key={p.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold capitalize">{p.phase_display || p.phase}</span>
                    <Badge className={`text-xs ${statusColors[p.status] || ""}`}>{p.status_display || p.status?.replace("_", " ")}</Badge>
                  </div>
                  <div className="flex gap-1">
                    {p.status !== "completed" && <Button variant="ghost" size="sm" onClick={() => markComplete(p)}><CheckCircle2 className="h-3.5 w-3.5 text-green-600" /></Button>}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
                {p.objective && <p className="text-sm text-muted-foreground mb-2">{p.objective}</p>}
                <div className="grid grid-cols-2 gap-4 text-xs text-muted-foreground mb-2">
                  <div>{pt("Target")}: {p.target_start_date || "—"} → {p.target_end_date || "—"}</div>
                  <div>{pt("Actual")}: {p.started_at?.split("T")[0] || "—"} → {p.completed_at?.split("T")[0] || "—"}</div>
                </div>
                <div className="flex items-center gap-3"><Progress value={phaseProgress(p)} className="h-2 flex-1" /><span className="text-xs font-medium w-10 text-right">{phaseProgress(p)}%</span></div>
              </CardContent>
            </Card>
          ))}</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent>
        <DialogHeader><DialogTitle>{editing ? pt("Edit Phase") : pt("Add Phase")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>{pt("Phase")}</Label><Select value={form.phase} onValueChange={v => setForm({ ...form, phase: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{["define", "measure", "analyze", "improve", "control"].map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>{pt("Status")}</Label><Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="not_started">Not Started</SelectItem><SelectItem value="in_progress">In Progress</SelectItem><SelectItem value="completed">Completed</SelectItem><SelectItem value="on_hold">On Hold</SelectItem></SelectContent></Select></div>
          </div>
          <div className="space-y-2"><Label>{pt("Objective")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>{pt("Target Start")}</Label><Input type="date" value={form.target_start_date} onChange={e => setForm({ ...form, target_start_date: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Target End")}</Label><Input type="date" value={form.target_end_date} onChange={e => setForm({ ...form, target_end_date: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default LSSGreenPhases;
