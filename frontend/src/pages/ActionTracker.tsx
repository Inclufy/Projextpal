import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportExportMenu } from "@/components/ReportExportMenu";
import { Plus, Pencil, Trash2, Loader2, ClipboardList, ListTodo, Boxes, StickyNote, MessageSquare, Upload, Repeat } from "lucide-react";
import ImportDialog from "@/components/ImportDialog";
import RecurringTasksDialog from "@/components/RecurringTasksDialog";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { useAuth } from "@/contexts/AuthContext";
import CommentThread from "@/components/CommentThread";
import CustomFieldsEditor, { useCustomFieldDefs } from "@/components/CustomFieldsEditor";
import { toast } from "sonner";

const STATUSES: [string, string][] = [["todo", "Open"], ["in_progress", "In Progress"], ["done", "Done"], ["blocked", "Blocked"]];
const PRIORITIES: [string, string][] = [["low", "Low"], ["medium", "Medium"], ["high", "High"], ["urgent", "Urgent"]];
const ACTIONS_MILESTONE = "Actions";
const emptyForm = { title: "", assigned_to: "", priority: "medium", status: "todo", due_date: "" };

const ActionTracker = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [customValues, setCustomValues] = useState<Record<string, any>>({});
  const { defs: customDefs } = useCustomFieldDefs("task");
  const tableCustom = customDefs.filter((f) => f.show_in_table);
  const [noteText, setNoteText] = useState("");
  const { user } = useAuth();
  const [showClosed, setShowClosed] = useState(false);
  const [importOpen, setImportOpen] = useState(false);
  const [recurringOpen, setRecurringOpen] = useState(false);
  const canManage = ["admin", "superadmin", "pm", "program_manager", "project_manager"].includes((user as any)?.role);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [t, m, u] = await Promise.all([
        fetch(`/api/v1/projects/tasks/?project=${id}`, { headers }),
        fetch(`/api/v1/projects/milestones/?project=${id}`, { headers }),
        fetch(`/api/v1/auth/company-users/members/`, { headers }),
      ]);
      if (t.ok) { const d = await t.json(); setTasks(Array.isArray(d) ? d : d.results || []); }
      if (m.ok) { const d = await m.json(); setMilestones(Array.isArray(d) ? d : d.results || []); }
      if (u.ok) { const d = await u.json(); setUsers(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  const [commentMeta, setCommentMeta] = useState<{ counts: Record<string, number>; mentioned: Set<number> }>({ counts: {}, mentioned: new Set() });
  const fetchCommentMeta = async () => {
    try {
      const r = await fetch(`/api/v1/comments/counts/?project=${id}`, { headers });
      if (r.ok) { const d = await r.json(); setCommentMeta({ counts: d.counts || {}, mentioned: new Set(d.mentioned_task_ids || []) }); }
    } catch { /* ignore */ }
  };
  useEffect(() => { fetchData(); fetchCommentMeta(); }, [id]);

  // ------- bulk select + edit -------
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const toggleSel = (tid: number) => setSelected((p) => { const n = new Set(p); n.has(tid) ? n.delete(tid) : n.add(tid); return n; });
  const clearSel = () => setSelected(new Set());
  const bulkApply = async (body: any) => {
    try {
      const r = await fetch(`/api/v1/projects/tasks/bulk-update/`, {
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({ ids: Array.from(selected), ...body }),
      });
      if (r.ok) { toast.success(pt("Updated")); clearSel(); fetchData(); fetchCommentMeta(); }
      else toast.error(pt("Bulk action failed"));
    } catch { toast.error(pt("Bulk action failed")); }
  };

  // ------- what counts as an "action" -------
  const isAction = (t: any): boolean => {
    const cat = (t.category || "").toLowerCase();
    const ms = (t.milestone_name || "").toLowerCase();
    return cat.includes("action") || ms.includes("action") || ms.includes("meeting");
  };

  const userName = (u: any) => u.first_name || u.email || `#${u.id}`;
  const ownerName = (t: any) => t.assigned_to_name || t.raci_responsible_email || "";

  // ------- ensure an "Actions" milestone exists, return its id -------
  const ensureActionsMilestone = async (): Promise<string | null> => {
    const existing = milestones.find((m) => (m.name || "").toLowerCase().includes("action"));
    if (existing) return String(existing.id);
    try {
      const r = await fetch(`/api/v1/projects/milestones/`, {
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({ project: Number(id), name: ACTIONS_MILESTONE, description: "Action tracker items" }),
      });
      if (r.ok) { const d = await r.json(); setMilestones((prev) => [...prev, d]); return String(d.id); }
    } catch { /* noop */ }
    return milestones[0] ? String(milestones[0].id) : null;
  };

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setCustomValues({}); setNoteText(""); setDialogOpen(true); };
  const openEdit = (t: any) => {
    setEditing(t);
    setForm({
      title: t.title || "", assigned_to: t.assigned_to ? String(t.assigned_to) : "",
      priority: t.priority || "medium", status: t.status || "todo", due_date: t.due_date?.split("T")[0] || "",
    });
    setCustomValues(t.custom_fields || {});
    setNoteText("");
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim()) { toast.error(pt("Enter an action")); return; }
    setSubmitting(true);
    try {
      const body: any = { title: form.title, priority: form.priority, status: form.status, category: "Action" };
      if (form.assigned_to) body.assigned_to = Number(form.assigned_to);
      if (form.due_date) body.due_date = form.due_date;
      if (customDefs.length) body.custom_fields = customValues;
      let url: string; let method: string;
      if (editing) { url = `/api/v1/projects/tasks/${editing.id}/`; method = "PATCH"; }
      else {
        const msId = await ensureActionsMilestone();
        if (!msId) { toast.error(pt("Create a milestone first")); setSubmitting(false); return; }
        body.milestone = Number(msId); url = `/api/v1/projects/tasks/`; method = "POST";
      }
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) {
        // Optional note when assigning -> post a comment that @mentions the
        // owner, so they get a notification with the message.
        const saved = await r.json().catch(() => ({}));
        const taskId = editing ? editing.id : saved.id;
        if (taskId && form.assigned_to && noteText.trim()) {
          try {
            await fetch(`/api/v1/comments/`, {
              method: "POST", headers: jsonHeaders,
              body: JSON.stringify({ project: Number(id), task: Number(taskId), body: noteText.trim(), mention_user_ids: [Number(form.assigned_to)] }),
            });
          } catch { /* note is best-effort */ }
        }
        toast.success(pt("Saved")); setDialogOpen(false); fetchData(); fetchCommentMeta();
      }
      else { const d = await r.json().catch(() => ({})); toast.error(d.detail || JSON.stringify(d).slice(0, 120) || pt("Save failed")); }
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (tid: any) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    const r = await fetch(`/api/v1/projects/tasks/${tid}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
  };

  const quickStatus = async (t: any, status: string) => {
    const r = await fetch(`/api/v1/projects/tasks/${t.id}/`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ status, progress: status === "done" ? 100 : t.progress }) });
    if (r.ok) fetchData();
  };

  const statusColor = (s: string) => ({ todo: "bg-amber-100 text-amber-700", in_progress: "bg-blue-100 text-blue-700", done: "bg-green-100 text-green-700", blocked: "bg-red-100 text-red-700" }[s] || "bg-gray-100");
  const prioColor = (p: string) => ({ low: "bg-gray-100 text-gray-600", medium: "bg-blue-100 text-blue-700", high: "bg-amber-100 text-amber-700", urgent: "bg-red-100 text-red-700" }[p] || "bg-gray-100");
  const label = (arr: [string, string][], v: string) => arr.find(([k]) => k === v)?.[1] || v;
  const today = new Date().toISOString().split("T")[0];
  const fmt = (d: string) => (d ? d.split("T")[0] : "");

  const actions = tasks
    .filter(isAction)
    .filter((t) => showClosed || t.status !== "done")
    .sort((a, b) => {
      const ad = a.due_date || "9999"; const bd = b.due_date || "9999";
      return ad.localeCompare(bd);
    });
  const openCount = tasks.filter(isAction).filter((t) => t.status !== "done").length;
  const overdueCount = actions.filter((t) => t.due_date && t.due_date < today && t.status !== "done").length;

  const exportSections = [{
    heading: "Action Tracker",
    rows: actions.map((t, i) => [`${i + 1}. ${t.title}`, `${ownerName(t) || "Unassigned"} · ${pt("Due")} ${t.due_date || "—"} · ${label(PRIORITIES, t.priority)} · ${label(STATUSES, t.status)}`]) as [string, any][],
  }];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <ClipboardList className="h-6 w-6 text-indigo-500" />
            <h1 className="text-2xl font-bold">{pt("Action Tracker")}</h1>
            <Badge variant="outline">{openCount} {pt("open")}</Badge>
            {overdueCount > 0 && <Badge className="bg-red-100 text-red-700">{overdueCount} {pt("overdue")}</Badge>}
          </div>
          <div className="flex gap-2 flex-wrap items-center">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => navigate(`/projects/${id}/planning/tasks`)}><ListTodo className="h-4 w-4" />{pt("Activity List")}</Button>
            {actions.length > 0 && <ReportExportMenu title="Action Tracker" sections={exportSections} />}
            {canManage && <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setImportOpen(true)}><Upload className="h-4 w-4" />{pt("Import")}</Button>}
            {canManage && <Button variant="outline" size="sm" className="gap-1.5" onClick={() => setRecurringOpen(true)}><Repeat className="h-4 w-4" />{pt("Recurring")}</Button>}
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />{pt("Add Action")}</Button>
          </div>
        </div>

        <p className="text-sm text-muted-foreground -mt-3">
          {pt("Running list of open actions and follow-ups — from meetings, reviews and ad-hoc agreements. Items also flow in automatically when you push meeting actions to tasks.")}
        </p>

        <div className="flex items-center gap-2 text-sm">
          <Button size="sm" variant={!showClosed ? "default" : "ghost"} className="h-7" onClick={() => setShowClosed(false)}>{pt("Open only")}</Button>
          <Button size="sm" variant={showClosed ? "default" : "ghost"} className="h-7" onClick={() => setShowClosed(true)}>{pt("All")}</Button>
        </div>

        {actions.length === 0 ? (
          <Card className="p-8 text-center">
            <ClipboardList className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{showClosed ? pt("No actions yet") : pt("No open actions")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{pt("Add an action, or push action items from a meeting.")}</p>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{pt("Add Action")}</Button>
          </Card>
        ) : (
          <>
          {selected.size > 0 && (
            <Card className="p-2.5 mb-3 flex items-center gap-2 flex-wrap bg-purple-50/60 border-purple-200">
              <span className="text-sm font-medium ml-1">{selected.size} {pt("selected")}</span>
              <Select onValueChange={(v) => bulkApply({ status: v })}>
                <SelectTrigger className="h-8 w-36"><SelectValue placeholder={pt("Set status")} /></SelectTrigger>
                <SelectContent>{STATUSES.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
              </Select>
              <Select onValueChange={(v) => bulkApply({ priority: v })}>
                <SelectTrigger className="h-8 w-36"><SelectValue placeholder={pt("Set priority")} /></SelectTrigger>
                <SelectContent>{PRIORITIES.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
              </Select>
              <Button size="sm" variant="outline" className="h-8 gap-1 text-destructive" onClick={() => { if (confirm(pt("Delete the selected actions?"))) bulkApply({ action: "delete" }); }}><Trash2 className="h-3.5 w-3.5" />{pt("Delete")}</Button>
              <Button size="sm" variant="ghost" className="h-8 ml-auto" onClick={clearSel}>{pt("Clear")}</Button>
            </Card>
          )}
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b bg-muted/50">
                    <th className="px-3 py-2.5 w-8"><input type="checkbox" checked={actions.length > 0 && actions.every((a) => selected.has(a.id))} onChange={(e) => setSelected(e.target.checked ? new Set(actions.map((a) => a.id)) : new Set())} /></th>
                    <th className="font-medium px-4 py-2.5 w-12">{pt("Nr.")}</th>
                    <th className="font-medium px-3 py-2.5">{pt("Action")}</th>
                    <th className="font-medium px-3 py-2.5 w-40">{pt("Owner")}</th>
                    <th className="font-medium px-3 py-2.5 w-28">{pt("Raised")}</th>
                    <th className="font-medium px-3 py-2.5 w-28">{pt("Due")}</th>
                    <th className="font-medium px-3 py-2.5 w-24">{pt("Priority")}</th>
                    <th className="font-medium px-3 py-2.5 w-32">{pt("Status")}</th>
                    {tableCustom.map((f) => <th key={f.id} className="font-medium px-3 py-2.5 whitespace-nowrap">{f.label}</th>)}
                    <th className="font-medium px-3 py-2.5 w-24" title={pt("Discussion")}><span className="inline-flex items-center gap-1"><MessageSquare className="h-3.5 w-3.5" />{pt("Discussion")}</span></th>
                    <th className="px-2 py-2.5 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {actions.map((t, idx) => {
                    const overdue = t.due_date && t.due_date < today && t.status !== "done";
                    return (
                      <tr key={t.id} className={`border-b last:border-0 hover:bg-accent/40 align-top ${selected.has(t.id) ? "bg-purple-50/40" : ""}`}>
                        <td className="px-3 py-2.5"><input type="checkbox" checked={selected.has(t.id)} onChange={() => toggleSel(t.id)} /></td>
                        <td className="px-4 py-2.5 text-muted-foreground tabular-nums">{idx + 1}</td>
                        <td className="px-3 py-2.5">
                          <div className="font-medium">{t.title}</div>
                          {(t.milestone_name || t.work_package_title) && (
                            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
                              {t.milestone_name && !/^actions?$/i.test(t.milestone_name) && <Badge variant="secondary" className="text-[10px] inline-flex items-center gap-1"><StickyNote className="h-2.5 w-2.5" />{t.milestone_name}</Badge>}
                              {t.work_package_title && <Badge className="text-[10px] bg-sky-100 text-sky-700 inline-flex items-center gap-1"><Boxes className="h-2.5 w-2.5" />{t.work_package_title}</Badge>}
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">{ownerName(t) || <span className="italic">{pt("Unassigned")}</span>}</td>
                        <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{fmt(t.created_at) || "—"}</td>
                        <td className={`px-3 py-2.5 whitespace-nowrap ${overdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}>{t.due_date || "—"}</td>
                        <td className="px-3 py-2.5"><Badge className={`text-[10px] ${prioColor(t.priority)}`}>{label(PRIORITIES, t.priority)}</Badge></td>
                        <td className="px-3 py-2.5">
                          <Select value={t.status} onValueChange={(v) => quickStatus(t, v)}>
                            <SelectTrigger className="h-7 w-[120px] border-0 bg-transparent p-0 focus:ring-0">
                              <Badge className={`text-[10px] ${statusColor(t.status)}`}>{label(STATUSES, t.status)}</Badge>
                            </SelectTrigger>
                            <SelectContent>{STATUSES.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
                          </Select>
                        </td>
                        {tableCustom.map((f) => {
                          const v = (t.custom_fields || {})[f.key];
                          return (
                            <td key={f.id} className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">
                              {f.field_type === "checkbox" ? (v ? "✓" : "—")
                                : f.field_type === "url" && v ? <a href={String(v)} target="_blank" rel="noreferrer" className="text-purple-600 hover:underline">link</a>
                                : (v === undefined || v === null || v === "" ? "—" : String(v))}
                            </td>
                          );
                        })}
                        <td className="px-3 py-2.5">
                          <button onClick={() => openEdit(t)} className="inline-flex items-center gap-1.5 hover:underline">
                            <span className="inline-flex items-center gap-0.5 text-muted-foreground"><MessageSquare className="h-3.5 w-3.5" />{commentMeta.counts[t.id] || 0}</span>
                            {commentMeta.mentioned.has(t.id) && <span className="text-[10px] bg-purple-100 text-purple-700 rounded px-1 font-medium">@you</span>}
                          </button>
                        </td>
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
          </>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? pt("Edit Action") : pt("Add Action")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Action")}</Label><Input autoFocus value={form.title} placeholder={pt("What needs to be done?")} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Owner")}</Label>
                <Select value={form.assigned_to} onValueChange={(v) => setForm({ ...form, assigned_to: v })}>
                  <SelectTrigger><SelectValue placeholder={pt("Unassigned")} /></SelectTrigger>
                  <SelectContent>{users.map((u) => <SelectItem key={u.id} value={String(u.id)}>{userName(u)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{pt("Due Date")}</Label><Input type="date" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Priority")}</Label>
                <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PRIORITIES.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{pt("Status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            {customDefs.length > 0 && (
              <div className="border-t pt-3">
                <CustomFieldsEditor entity="task" values={customValues} onChange={setCustomValues} />
              </div>
            )}
            {form.assigned_to && (
              <div className="space-y-2">
                <Label>{pt("Message for the owner (optional)")}</Label>
                <textarea
                  className="w-full min-h-[50px] px-3 py-2 border rounded-md bg-background text-sm"
                  value={noteText} onChange={(e) => setNoteText(e.target.value)}
                  placeholder={pt("e.g. Can you pick this up before Friday?")}
                />
                <p className="text-[11px] text-muted-foreground">{pt("Sent to the owner as a notification + recorded on the action.")}</p>
              </div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting || !form.title.trim()}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button>
            </div>

            {editing && (
              <div className="border-t pt-4">
                <Label className="mb-2 block">{pt("Comments")}</Label>
                <CommentThread projectId={id!} taskId={editing.id} currentUserId={(user as any)?.id} />
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      <ImportDialog open={importOpen} onOpenChange={setImportOpen} projectId={id!}
        onImported={() => { fetchData(); fetchCommentMeta(); }} />
      <RecurringTasksDialog open={recurringOpen} onOpenChange={setRecurringOpen} projectId={id!}
        users={users} onChanged={() => { fetchData(); fetchCommentMeta(); }} />
    </div>
  );
};

export default ActionTracker;
