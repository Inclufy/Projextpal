import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [groupBy, setGroupBy] = useState<"category" | "milestone" | "type" | "owner" | "status">("category");

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
  const typeColor = (ty: string) => ({ Meeting: "bg-purple-100 text-purple-700", Deliverable: "bg-teal-100 text-teal-700", "Work Package": "bg-sky-100 text-sky-700", General: "bg-gray-100 text-gray-600" }[ty] || "bg-gray-100 text-gray-600");
  const stageOf = (t: any): string => t.milestone_name || msName(t.milestone) || t.category || "";
  const label = (arr: [string, string][], v: string) => arr.find(([k]) => k === v)?.[1] || v;
  const msName = (mid: any) => milestones.find((m) => m.id === mid)?.name || "";
  const today = new Date().toISOString().split("T")[0];
  const taskType = (t: any): string =>
    (t.category || "").toLowerCase().includes("meeting") ? "Meeting"
      : t.product_title ? "Deliverable"
        : t.work_package_title ? "Work Package"
          : "General";
  const groupOf = (t: any): string => {
    if (groupBy === "category") return t.category || pt("Uncategorized");
    if (groupBy === "type") return taskType(t);
    if (groupBy === "milestone") return t.milestone_name || msName(t.milestone) || pt("No milestone");
    if (groupBy === "owner") return t.assigned_to_name || pt("Unassigned");
    return label(STATUSES, t.status);
  };
  const groups: [string, any[]][] = (() => {
    const map: Record<string, any[]> = {};
    tasks.forEach((t) => { const k = groupOf(t) || "—"; (map[k] = map[k] || []).push(t); });
    return Object.entries(map).sort((a, b) => a[0].localeCompare(b[0]));
  })();
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
          <div className="flex gap-2 flex-wrap items-center">
            <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/projects/${id}/planning/milestones`)}>🏁 {pt("Planning")}</Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/projects/${id}/prince2/work-packages`)}>📦 {pt("Work Packages")}</Button>
            <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/projects/${id}/action-tracker`)}>✅ {pt("Action Tracker")}</Button>
            {tasks.length > 0 && <ReportExportMenu title="Tasks" sections={exportSections} />}
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />{pt("Add Task")}</Button>
          </div>
        </div>

        {tasks.length > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-muted-foreground">{pt("Group by")}:</span>
            <div className="flex bg-muted rounded-lg p-1 flex-wrap">
              {(["category", "milestone", "type", "owner", "status"] as const).map((g) => (
                <Button key={g} size="sm" variant={groupBy === g ? "default" : "ghost"} className="h-7" onClick={() => setGroupBy(g)}>
                  {pt(g === "category" ? "Category" : g === "milestone" ? "Milestone" : g === "type" ? "Type" : g === "owner" ? "Owner" : "Status")}
                </Button>
              ))}
            </div>
          </div>
        )}

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
          <div className="space-y-5">
            {groups.map(([groupName, items]) => {
              const done = items.filter((t) => t.status === "done").length;
              return (
                <Card key={groupName} className="overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-2.5 bg-muted/50 border-b">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-sm">{groupName}</span>
                      <Badge variant="outline" className="text-xs">{done}/{items.length}</Badge>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground border-b">
                        <th className="font-medium px-4 py-2 w-12">{pt("Nr.")}</th>
                        <th className="font-medium px-3 py-2">{pt("Activity")}</th>
                        {groupBy !== "type" && <th className="font-medium px-3 py-2 w-32">{pt("Type")}</th>}
                        {groupBy !== "milestone" && <th className="font-medium px-3 py-2 w-44">{pt("Stage")}</th>}
                        <th className="font-medium px-3 py-2 w-24">{pt("Priority")}</th>
                        {groupBy !== "owner" && <th className="font-medium px-3 py-2 w-40">{pt("Owner")}</th>}
                        <th className="font-medium px-3 py-2 w-28">{pt("Due")}</th>
                        <th className="font-medium px-3 py-2 w-28">{pt("Status")}</th>
                        <th className="font-medium px-3 py-2 w-32">{pt("Progress")}</th>
                        <th className="px-2 py-2 w-16"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((t, idx) => {
                        const overdue = t.due_date && t.due_date < today && t.status !== "done";
                        const ty = taskType(t);
                        const stage = stageOf(t);
                        return (
                          <tr key={t.id} className="border-b last:border-0 hover:bg-accent/40 align-top">
                            <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{idx + 1}</td>
                            <td className="px-3 py-2.5">
                              <div className="font-medium">{t.title}</div>
                              {(t.product_title || t.work_package_title) && (
                                <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                                  {t.product_title && <Badge className="text-[10px] bg-teal-100 text-teal-700">📦 {t.product_title}</Badge>}
                                  {t.work_package_title && <Badge className="text-[10px] bg-sky-100 text-sky-700 cursor-pointer" onClick={() => navigate(`/projects/${id}/prince2/work-packages`)}>🗂 {t.work_package_title}</Badge>}
                                </div>
                              )}
                            </td>
                            {groupBy !== "type" && <td className="px-3 py-2.5"><Badge className={`text-[10px] font-normal ${typeColor(ty)}`}>{pt(ty)}</Badge></td>}
                            {groupBy !== "milestone" && <td className="px-3 py-2.5">{stage ? <Badge variant="outline" className="text-[10px] font-normal cursor-pointer" onClick={() => navigate(`/projects/${id}/planning/milestones`)}>{stage}</Badge> : <span className="text-muted-foreground">—</span>}</td>}
                            <td className="px-3 py-2.5"><Badge className={`text-[10px] ${prioColor(t.priority)}`}>{label(PRIORITIES, t.priority)}</Badge></td>
                            {groupBy !== "owner" && <td className="px-3 py-2.5 text-muted-foreground">{t.assigned_to_name || <span className="italic">{pt("Unassigned")}</span>}</td>}
                            <td className={`px-3 py-2.5 whitespace-nowrap ${overdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}>{t.due_date || "—"}</td>
                            <td className="px-3 py-2.5"><Badge className={`text-[10px] ${statusColor(t.status)}`}>{label(STATUSES, t.status)}</Badge></td>
                            <td className="px-3 py-2.5"><div className="flex items-center gap-1.5"><Progress value={t.progress} className="h-1.5 w-16" /><span className="text-xs text-muted-foreground">{t.progress}%</span></div></td>
                            <td className="px-2 py-2.5">
                              <div className="flex gap-0.5">
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(t.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  </div>
                </Card>
              );
            })}
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
