import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Package, Play, CheckCircle2, Trash2, Pencil, FileText, Layers, X, UserCheck, ChevronDown, ChevronRight, ListChecks, User } from "lucide-react";
import { toast } from "sonner";
import { EmptyState } from "@/components/ui/empty-state";

const Prince2WorkPackages = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const stageFilter = searchParams.get("stage");
  const highlightWp = searchParams.get("wp");
  const [workPackages, setWorkPackages] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [stagePlans, setStagePlans] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", stage: "", priority: "medium", team_manager: "", planned_start_date: "", planned_end_date: "", depends_on: [] as number[] });

  // --- Tasks under each Work Package ---
  const [tasks, setTasks] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [expandedWp, setExpandedWp] = useState<Record<number, boolean>>({});
  const [taskDialogOpen, setTaskDialogOpen] = useState(false);
  const [taskWp, setTaskWp] = useState<any>(null);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [taskSubmitting, setTaskSubmitting] = useState(false);
  const [taskForm, setTaskForm] = useState({ title: "", description: "", assigned_to: "", milestone: "", product: "", status: "todo", due_date: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [wpRes, stRes, spRes, msRes, prRes, tkRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/prince2/work-packages/`, { headers }),
        fetch(`/api/v1/projects/${id}/prince2/stages/`, { headers }),
        fetch(`/api/v1/projects/${id}/prince2/stage-plans/`, { headers }),
        fetch(`/api/v1/projects/milestones/?project=${id}`, { headers }),
        fetch(`/api/v1/projects/${id}/prince2/products/`, { headers }),
        fetch(`/api/v1/projects/tasks/?project=${id}`, { headers }),
      ]);
      if (wpRes.ok) {
        const data = await wpRes.json();
        setWorkPackages(Array.isArray(data) ? data : data.results || []);
      }
      if (stRes.ok) {
        const data = await stRes.json();
        setStages(Array.isArray(data) ? data : data.results || []);
      }
      if (spRes.ok) {
        const data = await spRes.json();
        setStagePlans(Array.isArray(data) ? data : data.results || []);
      }
      if (msRes.ok) {
        const data = await msRes.json();
        setMilestones(Array.isArray(data) ? data : data.results || []);
      }
      if (prRes.ok) {
        const data = await prRes.json();
        setProducts(Array.isArray(data) ? data : data.results || []);
      }
      if (tkRes.ok) {
        const data = await tkRes.json();
        setTasks(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  const fetchUsers = async () => {
    try {
      const r = await fetch(`/api/v1/auth/company-users/members/`, { headers });
      if (r.ok) { const d = await r.json(); setUsers(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
  };

  useEffect(() => { fetchData(); fetchUsers(); }, [id]);

  const userLabel = (u: any) =>
    u.full_name || u.name || `${u.first_name || ""} ${u.last_name || ""}`.trim() || u.email;

  // Stage Plans grouped by stage for the reverse-linkage breadcrumb on each WP card
  const stagePlansByStage = useMemo(() => {
    const grouped: Record<number, any[]> = {};
    stagePlans.forEach((sp) => {
      if (sp.stage != null) {
        if (!grouped[sp.stage]) grouped[sp.stage] = [];
        grouped[sp.stage].push(sp);
      }
    });
    return grouped;
  }, [stagePlans]);

  const getStageName = (stageId: number | null | undefined) =>
    stageId == null ? null : stages.find((s) => s.id === stageId)?.name || `Stage ${stageId}`;

  // Tasks grouped by their parent Work Package (Task.work_package FK)
  const tasksByWp = useMemo(() => {
    const grouped: Record<number, any[]> = {};
    tasks.forEach((t) => {
      if (t.work_package != null) {
        if (!grouped[t.work_package]) grouped[t.work_package] = [];
        grouped[t.work_package].push(t);
      }
    });
    return grouped;
  }, [tasks]);

  const toggleExpand = (wpId: number) =>
    setExpandedWp((prev) => ({ ...prev, [wpId]: !prev[wpId] }));

  const openCreateTask = (wp: any) => {
    setTaskWp(wp);
    setEditingTask(null);
    setTaskForm({ title: "", description: "", assigned_to: "", milestone: "", product: "", status: "todo", due_date: "" });
    setTaskDialogOpen(true);
  };

  const openEditTask = (wp: any, task: any) => {
    setTaskWp(wp);
    setEditingTask(task);
    setTaskForm({
      title: task.title || "",
      description: task.description || "",
      assigned_to: task.assigned_to != null ? String(task.assigned_to) : "",
      milestone: task.milestone != null ? String(task.milestone) : "",
      product: task.product != null ? String(task.product) : "",
      status: task.status || "todo",
      due_date: task.due_date?.split("T")[0] || "",
    });
    setTaskDialogOpen(true);
  };

  const handleSaveTask = async () => {
    if (!taskForm.title) { toast.error(pt("Title is required")); return; }
    if (!taskForm.milestone) { toast.error(pt("Milestone is required")); return; }
    setTaskSubmitting(true);
    try {
      const body: any = {
        title: taskForm.title,
        description: taskForm.description,
        status: taskForm.status,
        milestone: parseInt(taskForm.milestone),
        work_package: taskWp?.id ?? null,
        assigned_to: taskForm.assigned_to ? parseInt(taskForm.assigned_to) : null,
        product: taskForm.product ? parseInt(taskForm.product) : null,
        due_date: taskForm.due_date || null,
      };
      const url = editingTask ? `/api/v1/projects/tasks/${editingTask.id}/` : `/api/v1/projects/tasks/`;
      const method = editingTask ? "PATCH" : "POST";
      const response = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (response.ok || response.status === 202) {
        toast.success(editingTask ? pt("Updated") : pt("Created"));
        setTaskDialogOpen(false);
        if (taskWp?.id) setExpandedWp((prev) => ({ ...prev, [taskWp.id]: true }));
        fetchData();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.detail || err.error || pt("Save failed"));
      }
    } catch { toast.error(pt("Save failed")); }
    finally { setTaskSubmitting(false); }
  };

  const handleDeleteTask = async (taskId: number) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    try {
      const response = await fetch(`/api/v1/projects/tasks/${taskId}/`, { method: "DELETE", headers });
      if (response.ok || response.status === 204) { toast.success(pt("Deleted")); fetchData(); }
      else toast.error(pt("Delete failed"));
    } catch { toast.error(pt("Delete failed")); }
  };

  const taskStatusColors: Record<string, string> = {
    todo: "bg-gray-100 text-gray-700", in_progress: "bg-amber-100 text-amber-700",
    done: "bg-green-100 text-green-700", blocked: "bg-red-100 text-red-700",
  };
  const milestoneName = (mid: number | null | undefined) =>
    mid == null ? null : milestones.find((m) => m.id === mid)?.name || null;
  const taskAssigneeLabel = (t: any) => {
    if (t.assigned_to_name) return t.assigned_to_name;
    const u = users.find((x) => x.id === t.assigned_to);
    return u ? userLabel(u) : null;
  };

  // If ?stage= filter is present, narrow the list. Audit fix #4: stage-scoped WP view.
  const visibleWorkPackages = useMemo(() => {
    if (!stageFilter) return workPackages;
    const sid = parseInt(stageFilter);
    if (Number.isNaN(sid)) return workPackages;
    return workPackages.filter((wp) => wp.stage === sid);
  }, [workPackages, stageFilter]);

  const clearStageFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("stage");
    setSearchParams(next, { replace: true });
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", stage: stages[0]?.id?.toString() || "", priority: "medium", team_manager: "", planned_start_date: "", planned_end_date: "", depends_on: [] });
    setDialogOpen(true);
  };

  const openEdit = (wp: any) => {
    setEditing(wp);
    setForm({
      title: wp.title,
      description: wp.description || "",
      stage: wp.stage?.toString() || "",
      priority: wp.priority || "medium",
      team_manager: wp.team_manager != null ? String(wp.team_manager) : "",
      planned_start_date: wp.planned_start_date?.split("T")[0] || "",
      planned_end_date: wp.planned_end_date?.split("T")[0] || "",
      depends_on: Array.isArray(wp.depends_on) ? wp.depends_on : (wp.depends_on_titles || []).map((d: any) => d.id),
    });
    setDialogOpen(true);
  };

  const toggleDependency = (wpId: number) =>
    setForm((prev) => ({ ...prev, depends_on: prev.depends_on.includes(wpId) ? prev.depends_on.filter((x) => x !== wpId) : [...prev.depends_on, wpId] }));

  const handleSave = async () => {
    if (!form.title) { toast.error(pt("Title is required")); return; }
    setSubmitting(true);
    try {
      const body: any = { title: form.title, description: form.description, priority: form.priority };
      if (form.stage) body.stage = parseInt(form.stage);
      body.team_manager = form.team_manager ? parseInt(form.team_manager) : null;
      body.planned_start_date = form.planned_start_date || null;
      body.planned_end_date = form.planned_end_date || null;
      body.depends_on = form.depends_on;
      const url = editing ? `/api/v1/projects/${id}/prince2/work-packages/${editing.id}/` : `/api/v1/projects/${id}/prince2/work-packages/`;
      const method = editing ? "PATCH" : "POST";
      const response = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (response.ok) {
        toast.success(editing ? pt("Updated") : pt("Created"));
        setDialogOpen(false);
        fetchData();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.error || pt("Save failed"));
      }
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleAction = async (wpId: number, action: string) => {
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/work-packages/${wpId}/${action}/`, {
        method: "POST", headers: jsonHeaders,
      });
      if (response.ok) { toast.success(pt("Action completed")); fetchData(); }
      else { const d = await response.json().catch(() => null); toast.error(d?.detail || pt("Action failed"), { duration: 5000 }); }
    } catch { toast.error(pt("Action failed")); }
  };

  const handleDelete = async (wpId: number) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/work-packages/${wpId}/`, { method: "DELETE", headers });
      if (response.ok || response.status === 204) { toast.success(pt("Deleted")); fetchData(); }
      else toast.error(pt("Delete failed"));
    } catch { toast.error(pt("Delete failed")); }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-700", authorized: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700", completed: "bg-green-100 text-green-700",
  };

  if (loading) return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </div>
  );

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold">{pt("Work Packages")}</h1>
            <Badge variant="outline">{visibleWorkPackages.length}{stageFilter ? ` / ${workPackages.length}` : ""}</Badge>
          </div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Create")}</Button>
        </div>

        {stageFilter && (
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border rounded-md text-sm">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{pt("Filtered by stage")}:</span>
            <span className="font-medium">{getStageName(parseInt(stageFilter)) || stageFilter}</span>
            <Button variant="ghost" size="sm" className="ml-auto h-6 gap-1" onClick={clearStageFilter}>
              <X className="h-3 w-3" /> {pt("Clear")}
            </Button>
          </div>
        )}

        {visibleWorkPackages.length === 0 ? (
          <EmptyState
            icon={Package}
            title={pt("No work packages yet")}
            action={
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> {pt("Create")}</Button>
            }
          />
        ) : (
          <div className="space-y-3">
            {visibleWorkPackages.map((wp) => {
              const stageName = getStageName(wp.stage);
              // Prefer the direct WorkPackage.stage_plan FK when present;
              // fall back to the stage-scoped lookup for historic rows that
              // pre-date the FK (`wp.stage_plan` is null).
              const directPlan = wp.stage_plan != null
                ? stagePlans.find((sp) => sp.id === wp.stage_plan) || null
                : null;
              const parentPlans = directPlan
                ? [directPlan]
                : (wp.stage != null ? (stagePlansByStage[wp.stage] || []) : []);
              const isHighlighted = highlightWp && parseInt(highlightWp) === wp.id;
              return (
              <Card key={wp.id} className={`hover:shadow-md transition-shadow ${isHighlighted ? "ring-2 ring-blue-400" : ""}`}>
                <CardContent className="p-4">
                 <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    {/* Reverse linkage: parent Stage + Stage Plan breadcrumb */}
                    {(stageName || parentPlans.length > 0) && (
                      <div className="flex items-center gap-1 mb-1 text-xs text-muted-foreground flex-wrap">
                        {stageName && (
                          <button
                            type="button"
                            onClick={() => navigate(`/projects/${id}/prince2/dashboard?stage=${wp.stage}`)}
                            className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
                            title={pt("View stage")}
                          >
                            <Layers className="h-3 w-3" /> {stageName}
                          </button>
                        )}
                        {parentPlans.length > 0 && (
                          <>
                            <span className="text-muted-foreground/60">/</span>
                            <button
                              type="button"
                              onClick={() => navigate(`/projects/${id}/prince2/stage-plan`)}
                              className="inline-flex items-center gap-1 hover:text-foreground hover:underline"
                              title={pt("View Stage Plan")}
                            >
                              <FileText className="h-3 w-3" />
                              {pt("Stage Plan")}
                              {parentPlans.length > 1 && ` (${parentPlans.length})`}
                            </button>
                          </>
                        )}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{wp.reference}</span>
                      <Badge className={`text-xs ${statusColors[wp.status] || ""}`}>{wp.status}</Badge>
                      {wp.priority && <Badge variant="outline" className="text-xs">{wp.priority}</Badge>}
                    </div>
                    <p className="font-medium">{wp.title}</p>
                    {wp.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{wp.description}</p>}
                    {(wp.team_manager_name || wp.planned_start_date || wp.planned_end_date) && (
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-muted-foreground flex-wrap">
                        {wp.team_manager_name && (
                          <span className="inline-flex items-center gap-1">
                            <Package className="h-3 w-3" /> {wp.team_manager_name}
                          </span>
                        )}
                        {(wp.planned_start_date || wp.planned_end_date) && (
                          <span className="inline-flex items-center gap-1">
                            {wp.planned_start_date || "—"} → {wp.planned_end_date || "—"}
                          </span>
                        )}
                      </div>
                    )}
                    {wp.depends_on_titles && wp.depends_on_titles.length > 0 && (
                      <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                        <span className="text-xs text-muted-foreground">{pt("Depends on")}:</span>
                        {wp.depends_on_titles.map((d: any) => (
                          <Badge key={d.id} variant="outline" className="text-xs">{d.title}</Badge>
                        ))}
                      </div>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={wp.progress_percentage || 0} className="h-1.5 w-32" />
                      <span className="text-xs text-muted-foreground">{wp.progress_percentage || 0}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    {(wp.status === "pending" || wp.status === "draft") && (
                      <Button variant="ghost" size="sm" onClick={() => handleAction(wp.id, "authorize")} title={pt("Authorize (stage must be active)")}>
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      </Button>
                    )}
                    {wp.status === "authorized" && !wp.accepted_by_tm && (
                      <Button variant="ghost" size="sm" onClick={() => handleAction(wp.id, "accept")} title={pt("Team Manager accepts the Work Package")}>
                        <UserCheck className="h-4 w-4 text-indigo-500" />
                      </Button>
                    )}
                    {wp.status === "authorized" && (
                      <Button variant="ghost" size="sm" onClick={() => handleAction(wp.id, "start")} title={pt("Start (dependencies must be complete + accepted)")}>
                        <Play className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    {wp.status === "in_progress" && (
                      <Button variant="ghost" size="sm" onClick={() => handleAction(wp.id, "complete")} title="Complete">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(wp)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(wp.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                 </div>

                 {/* Tasks under this Work Package */}
                 {(() => {
                   const wpTasks = tasksByWp[wp.id] || [];
                   const isExpanded = !!expandedWp[wp.id];
                   return (
                     <div className="mt-3 pt-3 border-t">
                       <div className="flex items-center justify-between">
                         <button
                           type="button"
                           onClick={() => toggleExpand(wp.id)}
                           className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"
                         >
                           {isExpanded ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                           <ListChecks className="h-4 w-4" />
                           {pt("Tasks")} ({wpTasks.length})
                         </button>
                         <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={() => openCreateTask(wp)}>
                           <Plus className="h-3 w-3" /> {pt("Add Task")}
                         </Button>
                       </div>
                       {isExpanded && (
                         <div className="mt-2 space-y-1.5">
                           {wpTasks.length === 0 ? (
                             <p className="text-xs text-muted-foreground italic pl-6">{pt("No tasks yet")}</p>
                           ) : (
                             wpTasks.map((t) => (
                               <div key={t.id} className="flex items-center gap-2 pl-6 py-1 rounded hover:bg-muted/40 group">
                                 <Badge className={`text-[10px] ${taskStatusColors[t.status] || ""}`}>{t.status}</Badge>
                                 <span className="text-sm flex-1 min-w-0 truncate">{t.title}</span>
                                 {(taskAssigneeLabel(t)) && (
                                   <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                     <User className="h-3 w-3" /> {taskAssigneeLabel(t)}
                                   </span>
                                 )}
                                 {(t.milestone_name || milestoneName(t.milestone)) && (
                                   <span className="inline-flex items-center gap-1 text-xs text-muted-foreground">
                                     <FileText className="h-3 w-3" /> {t.milestone_name || milestoneName(t.milestone)}
                                   </span>
                                 )}
                                 <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100" onClick={() => openEditTask(wp, t)}><Pencil className="h-3 w-3" /></Button>
                                 <Button variant="ghost" size="sm" className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100" onClick={() => handleDeleteTask(t.id)}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                               </div>
                             ))
                           )}
                         </div>
                       )}
                     </div>
                   );
                 })()}
                </CardContent>
              </Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Create")} {pt("Work Package")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            {stages.length > 0 && (
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                  <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                  <SelectContent>{stages.map((s: any) => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>{pt("Priority")}</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{pt("Team Manager")}</Label>
              <Select value={form.team_manager || "unassigned"} onValueChange={(v) => setForm({ ...form, team_manager: v === "unassigned" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder={pt("Unassigned")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">{pt("Unassigned")}</SelectItem>
                  {users.map((u) => <SelectItem key={u.id} value={u.id.toString()}>{userLabel(u)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{pt("Planned Start")}</Label>
                <Input type="date" value={form.planned_start_date} onChange={(e) => setForm({ ...form, planned_start_date: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{pt("Planned End")}</Label>
                <Input type="date" value={form.planned_end_date} onChange={(e) => setForm({ ...form, planned_end_date: e.target.value })} />
              </div>
            </div>
            {workPackages.filter((wp) => !editing || wp.id !== editing.id).length > 0 && (
              <div className="space-y-2">
                <Label>{pt("Depends on")}</Label>
                <div className="flex flex-wrap gap-1.5 max-h-32 overflow-y-auto p-2 border rounded-md">
                  {workPackages.filter((wp) => !editing || wp.id !== editing.id).map((wp) => (
                    <Badge
                      key={wp.id}
                      variant={form.depends_on.includes(wp.id) ? "default" : "outline"}
                      className="text-xs cursor-pointer"
                      onClick={() => toggleDependency(wp.id)}
                    >
                      {wp.reference ? `${wp.reference} · ` : ""}{wp.title}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Task create / edit dialog */}
      <Dialog open={taskDialogOpen} onOpenChange={setTaskDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingTask ? pt("Edit") : pt("Add Task")}
              {taskWp ? ` · ${taskWp.reference || taskWp.title}` : ""}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} /></div>
            <div className="space-y-2">
              <Label>{pt("Assignee")}</Label>
              <Select value={taskForm.assigned_to || "unassigned"} onValueChange={(v) => setTaskForm({ ...taskForm, assigned_to: v === "unassigned" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder={pt("Unassigned")} /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unassigned">{pt("Unassigned")}</SelectItem>
                  {users.map((u) => <SelectItem key={u.id} value={u.id.toString()}>{userLabel(u)}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{pt("Milestone")} *</Label>
              <Select value={taskForm.milestone} onValueChange={(v) => setTaskForm({ ...taskForm, milestone: v })}>
                <SelectTrigger><SelectValue placeholder={pt("Select milestone")} /></SelectTrigger>
                <SelectContent>
                  {milestones.map((m) => <SelectItem key={m.id} value={m.id.toString()}>{m.name}</SelectItem>)}
                </SelectContent>
              </Select>
              {milestones.length === 0 && <p className="text-xs text-muted-foreground">{pt("No milestones yet")}</p>}
            </div>
            {products.length > 0 && (
              <div className="space-y-2">
                <Label>{pt("Deliverable")}</Label>
                <Select value={taskForm.product || "none"} onValueChange={(v) => setTaskForm({ ...taskForm, product: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder={pt("None")} /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">{pt("None")}</SelectItem>
                    {products.map((p) => <SelectItem key={p.id} value={p.id.toString()}>{p.title}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{pt("Status")}</Label>
                <Select value={taskForm.status} onValueChange={(v) => setTaskForm({ ...taskForm, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">{pt("To Do")}</SelectItem>
                    <SelectItem value="in_progress">{pt("In Progress")}</SelectItem>
                    <SelectItem value="done">{pt("Done")}</SelectItem>
                    <SelectItem value="blocked">{pt("Blocked")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{pt("Due Date")}</Label>
                <Input type="date" value={taskForm.due_date} onChange={(e) => setTaskForm({ ...taskForm, due_date: e.target.value })} />
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setTaskDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSaveTask} disabled={taskSubmitting}>
                {taskSubmitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prince2WorkPackages;
