import { useState, useMemo } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, ListChecks, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const fetchJson = async (url: string) => {
  const token = localStorage.getItem("access_token");
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
};
const toArr = (d: any) => (Array.isArray(d) ? d : d?.results || []);

const STATUSES = ["todo", "in_progress", "review", "completed", "blocked"];
const PRIORITIES = ["low", "medium", "high", "critical"];

const statusColors: Record<string, string> = {
  todo: "bg-gray-100 text-gray-700",
  in_progress: "bg-blue-100 text-blue-700",
  review: "bg-purple-100 text-purple-700",
  completed: "bg-green-100 text-green-700",
  done: "bg-green-100 text-green-700",
  blocked: "bg-red-100 text-red-700",
};
const priorityColors: Record<string, string> = {
  low: "bg-gray-100 text-gray-600",
  medium: "bg-blue-100 text-blue-600",
  high: "bg-orange-100 text-orange-600",
  critical: "bg-red-100 text-red-700",
};

const LSSBlackTasks = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ phase: "", title: "", description: "", assignee: "", status: "todo", priority: "medium", start_date: "", due_date: "" });
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [phaseFilter, setPhaseFilter] = useState<string>("all");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("all");

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const tasksQ = useQuery({ queryKey: ["lssb-tasks", id], queryFn: () => fetchJson(`/api/v1/lss-black/projects/${id}/tasks/`), enabled: !!id });
  const phasesQ = useQuery({ queryKey: ["lssb-phases", id], queryFn: () => fetchJson(`/api/v1/lss-black/projects/${id}/dmaic-phases/`), enabled: !!id });
  const teamQ = useQuery({ queryKey: ["project-team", id], queryFn: () => fetchJson(`/api/v1/projects/${id}/team/`), enabled: !!id });

  const tasks = toArr(tasksQ.data);
  const phases = toArr(phasesQ.data);
  const team = toArr(teamQ.data);

  const refresh = () => qc.invalidateQueries({ queryKey: ["lssb-tasks", id] });

  const filtered = useMemo(() => tasks.filter((t: any) => {
    if (statusFilter !== "all" && t.status !== statusFilter) return false;
    if (phaseFilter !== "all" && String(t.phase) !== phaseFilter) return false;
    if (assigneeFilter !== "all" && String(t.assignee) !== assigneeFilter) return false;
    return true;
  }), [tasks, statusFilter, phaseFilter, assigneeFilter]);

  const openCreate = () => { setEditing(null); setForm({ phase: phases[0]?.id?.toString() || "", title: "", description: "", assignee: "", status: "todo", priority: "medium", start_date: "", due_date: "" }); setDialogOpen(true); };
  const openEdit = (t: any) => {
    setEditing(t);
    setForm({
      phase: t.phase?.toString() || "",
      title: t.title || "",
      description: t.description || "",
      assignee: t.assignee?.toString() || "",
      status: t.status || "todo",
      priority: t.priority || "medium",
      start_date: t.start_date?.split("T")[0] || "",
      due_date: t.due_date?.split("T")[0] || "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error(pt("Title is required")); return; }
    setSubmitting(true);
    try {
      const body: any = { ...form };
      if (form.phase) body.phase = parseInt(form.phase);
      else delete body.phase;
      if (form.assignee) body.assignee = parseInt(form.assignee);
      else delete body.assignee;
      if (!body.start_date) delete body.start_date;
      if (!body.due_date) delete body.due_date;
      const url = editing ? `/api/v1/lss-black/projects/${id}/tasks/${editing.id}/` : `/api/v1/lss-black/projects/${id}/tasks/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); refresh(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (tId: number) => {
    if (!confirm(pt("Delete this task?"))) return;
    try { const r = await fetch(`/api/v1/lss-black/projects/${id}/tasks/${tId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); refresh(); } } catch { toast.error(pt("Delete failed")); }
  };

  const updateStatus = async (t: any, status: string) => {
    try { const r = await fetch(`/api/v1/lss-black/projects/${id}/tasks/${t.id}/`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ status }) }); if (r.ok) refresh(); } catch { toast.error(pt("Update failed")); }
  };

  if (tasksQ.isLoading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><ListChecks className="h-6 w-6 text-gray-700" /><h1 className="text-2xl font-bold">{pt("Tasks")}</h1><Badge variant="outline">{tasks.length}</Badge></div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Task")}</Button>
        </div>

        <div className="flex flex-wrap gap-2 items-center">
          <Select value={statusFilter} onValueChange={setStatusFilter}><SelectTrigger className="w-40"><SelectValue placeholder={pt("Status")} /></SelectTrigger><SelectContent><SelectItem value="all">{pt("All statuses")}</SelectItem>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select>
          <Select value={phaseFilter} onValueChange={setPhaseFilter}><SelectTrigger className="w-40"><SelectValue placeholder={pt("Phase")} /></SelectTrigger><SelectContent><SelectItem value="all">{pt("All phases")}</SelectItem>{phases.map((p: any) => <SelectItem key={p.id} value={p.id.toString()}>{p.phase_display || p.phase}</SelectItem>)}</SelectContent></Select>
          <Select value={assigneeFilter} onValueChange={setAssigneeFilter}><SelectTrigger className="w-40"><SelectValue placeholder={pt("Assignee")} /></SelectTrigger><SelectContent><SelectItem value="all">{pt("All assignees")}</SelectItem>{team.map((m: any) => <SelectItem key={m.id} value={(m.user || m.id).toString()}>{m.name || m.full_name || m.email || `#${m.id}`}</SelectItem>)}</SelectContent></Select>
        </div>

        <Card><CardContent className="p-0">
          {filtered.length === 0 ? <p className="text-center text-muted-foreground py-12">{pt("No tasks")}</p> : (
            <div className="divide-y">{filtered.map((t: any) => {
              const phaseName = phases.find((p: any) => p.id === t.phase)?.phase_display || phases.find((p: any) => p.id === t.phase)?.phase || "—";
              return (
                <div key={t.id} className="p-3 flex items-center gap-3 hover:bg-muted/50">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium text-sm">{t.title}</p>
                      <Badge variant="outline" className="text-xs">{phaseName}</Badge>
                      <Badge className={`text-xs ${priorityColors[t.priority] || ""}`}>{t.priority}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5">{t.assignee_name || pt("Unassigned")} · {t.due_date || pt("No due date")}</p>
                  </div>
                  <Select value={t.status} onValueChange={v => updateStatus(t, v)}>
                    <SelectTrigger className="w-32 h-8"><SelectValue /></SelectTrigger>
                    <SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                  </Select>
                  <Badge className={`text-xs ${statusColors[t.status] || ""}`}>{t.status}</Badge>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              );
            })}</div>
          )}
        </CardContent></Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{editing ? pt("Edit Task") : pt("New Task")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>{pt("Phase")}</Label><Select value={form.phase} onValueChange={v => setForm({ ...form, phase: v })}><SelectTrigger><SelectValue placeholder={pt("Select phase")} /></SelectTrigger><SelectContent>{phases.map((p: any) => <SelectItem key={p.id} value={p.id.toString()}>{p.phase_display || p.phase}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>{pt("Assignee")}</Label><Select value={form.assignee} onValueChange={v => setForm({ ...form, assignee: v })}><SelectTrigger><SelectValue placeholder={pt("Unassigned")} /></SelectTrigger><SelectContent>{team.map((m: any) => <SelectItem key={m.id} value={(m.user || m.id).toString()}>{m.name || m.full_name || m.email || `#${m.id}`}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>{pt("Status")}</Label><Select value={form.status} onValueChange={v => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{STATUSES.map(s => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>{pt("Priority")}</Label><Select value={form.priority} onValueChange={v => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{PRIORITIES.map(p => <SelectItem key={p} value={p}>{p}</SelectItem>)}</SelectContent></Select></div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>{pt("Start Date")}</Label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Due Date")}</Label><Input type="date" value={form.due_date} onChange={e => setForm({ ...form, due_date: e.target.value })} /></div>
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default LSSBlackTasks;
