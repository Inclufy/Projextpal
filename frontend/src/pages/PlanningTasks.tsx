import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportExportMenu } from "@/components/ReportExportMenu";
import { Plus, Pencil, Trash2, Loader2, ListTodo } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const STATUSES: [string, string][] = [["todo", "To Do"], ["in_progress", "In Progress"], ["done", "Done"], ["blocked", "Blocked"]];
const PRIORITIES: [string, string][] = [["low", "Low"], ["medium", "Medium"], ["high", "High"], ["urgent", "Urgent"]];
const emptyForm = { milestone: "", title: "", description: "", category: "", status: "todo", priority: "medium", progress: "0", due_date: "" };

const PlanningTasks = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [tasks, setTasks] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [t, m] = await Promise.all([
        fetch(`/api/v1/projects/tasks/?project=${id}`, { headers }),
        fetch(`/api/v1/projects/milestones/?project=${id}`, { headers }),
      ]);
      if (t.ok) { const d = await t.json(); setTasks(Array.isArray(d) ? d : d.results || []); }
      if (m.ok) { const d = await m.json(); setMilestones(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, milestone: milestones[0] ? String(milestones[0].id) : "" }); setDialogOpen(true); };
  const openEdit = (t: any) => {
    setEditing(t);
    setForm({ milestone: t.milestone ? String(t.milestone) : "", title: t.title || "", description: t.description || "", category: t.category || "", status: t.status || "todo", priority: t.priority || "medium", progress: String(t.progress ?? 0), due_date: t.due_date?.split("T")[0] || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.milestone) { toast.error(pt("Pick a milestone first")); return; }
    setSubmitting(true);
    try {
      const body: any = {
        milestone: Number(form.milestone), title: form.title, description: form.description, category: form.category,
        status: form.status, priority: form.priority, progress: parseInt(form.progress || "0", 10) || 0,
      };
      if (form.due_date) body.due_date = form.due_date;
      const url = editing ? `/api/v1/projects/tasks/${editing.id}/` : `/api/v1/projects/tasks/`;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else { const d = await r.json().catch(() => ({})); toast.error(d.detail || JSON.stringify(d).slice(0, 120) || pt("Save failed")); }
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (tid: any) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    const r = await fetch(`/api/v1/projects/tasks/${tid}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
  };

  const statusColor = (s: string) => ({ todo: "bg-gray-100 text-gray-600", in_progress: "bg-blue-100 text-blue-700", done: "bg-green-100 text-green-700", blocked: "bg-red-100 text-red-700" }[s] || "bg-gray-100");
  const prioColor = (p: string) => ({ low: "bg-gray-100 text-gray-600", medium: "bg-blue-100 text-blue-700", high: "bg-amber-100 text-amber-700", urgent: "bg-red-100 text-red-700" }[p] || "bg-gray-100");
  const label = (arr: [string, string][], v: string) => arr.find(([k]) => k === v)?.[1] || v;
  const msName = (mid: any) => milestones.find((m) => m.id === mid)?.name || "";
  const exportSections = [{ heading: "Tasks", rows: tasks.map((t) => [t.title, `${label(STATUSES, t.status)} · ${label(PRIORITIES, t.priority)} · ${t.progress}%`]) as [string, any][] }];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ListTodo className="h-6 w-6 text-indigo-500" />
            <h1 className="text-2xl font-bold">{pt("Tasks")}</h1>
            <Badge variant="outline">{tasks.length}</Badge>
          </div>
          <div className="flex gap-2">
            {tasks.length > 0 && <ReportExportMenu title="Tasks" sections={exportSections} />}
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />{pt("Add Task")}</Button>
          </div>
        </div>

        {milestones.length === 0 && (
          <Card className="p-4 border-amber-200 bg-amber-50/50"><p className="text-sm text-amber-700">{pt("Create a milestone first — tasks belong to a milestone.")}</p></Card>
        )}

        {tasks.length === 0 ? (
          <Card className="p-8 text-center">
            <ListTodo className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No tasks yet")}</h3>
            <Button onClick={openCreate} disabled={milestones.length === 0}><Plus className="h-4 w-4 mr-2" />{pt("Add Task")}</Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => (
              <Card key={t.id}><CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium">{t.title}</span>
                    <Badge className={`text-xs ${statusColor(t.status)}`}>{label(STATUSES, t.status)}</Badge>
                    <Badge className={`text-xs ${prioColor(t.priority)}`}>{label(PRIORITIES, t.priority)}</Badge>
                    {t.category && <Badge variant="outline" className="text-xs">{t.category}</Badge>}
                    {t.milestone && <Badge variant="secondary" className="text-xs">🏁 {msName(t.milestone)}</Badge>}
                    {t.due_date && <span className="text-xs text-muted-foreground">{t.due_date}</span>}
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Progress value={t.progress} className="h-2 w-32" />
                    <span className="text-xs text-muted-foreground">{t.progress}%</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? pt("Edit Task") : pt("Add Task")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Title")}</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Milestone")}</Label>
              <Select value={form.milestone} onValueChange={(v) => setForm({ ...form, milestone: v })}>
                <SelectTrigger><SelectValue placeholder={pt("Pick a milestone")} /></SelectTrigger>
                <SelectContent>{milestones.map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[50px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{pt("Priority")}</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2 col-span-1"><Label>{pt("Category")}</Label><Input value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Progress")} %</Label><Input type="number" min={0} max={100} value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Due Date")}</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting || !form.title || !form.milestone}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanningTasks;
