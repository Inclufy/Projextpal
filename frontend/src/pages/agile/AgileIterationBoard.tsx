import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Loader2, Plus, Play, CheckCircle2, LayoutDashboard, Trash2, Gauge, Settings2, ListChecks, ChevronRight, ChevronLeft, UserCircle2 } from "lucide-react";
import { toast } from "sonner";

// Board columns map onto the underlying statuses (Agile is a flow system).
const STATUS_FLOW = ["backlog", "ready", "in_progress", "review", "done"];

const AgileIterationBoard = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [iterations, setIterations] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [team, setTeam] = useState<any[]>([]);
  const [metrics, setMetrics] = useState<any>(null);
  const [flowConfig, setFlowConfig] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", goal: "", start_date: "", end_date: "" });
  // WIP-limit settings
  const [wipOpen, setWipOpen] = useState(false);
  const [wipForm, setWipForm] = useState({ wip_limit: 0, target_cycle_time_days: 0 });
  // DoD checklist
  const [dodOpen, setDodOpen] = useState(false);
  const [dodItem, setDodItem] = useState<any>(null);
  const [dodChecklist, setDodChecklist] = useState<any[]>([]);
  // Releases + ship-to-release (AG-1)
  const [releases, setReleases] = useState<any[]>([]);
  const [shipOpen, setShipOpen] = useState(false);
  const [shippedIteration, setShippedIteration] = useState<any>(null);
  const [shipReleaseId, setShipReleaseId] = useState<string>("");
  // Pull-into-iteration (AG-5)
  const [pullOpen, setPullOpen] = useState(false);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [itRes, iRes, tRes, mRes, fRes, rRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/agile/iterations/`, { headers }),
        fetch(`/api/v1/projects/${id}/agile/backlog/`, { headers }),
        fetch(`/api/v1/projects/${id}/agile/team/`, { headers }),
        fetch(`/api/v1/projects/${id}/agile/flow-metrics/`, { headers }),
        fetch(`/api/v1/projects/${id}/agile/flow-config/`, { headers }),
        fetch(`/api/v1/projects/${id}/agile/releases/`, { headers }),
      ]);
      if (itRes.ok) { const d = await itRes.json(); setIterations(Array.isArray(d) ? d : d.results || []); }
      if (iRes.ok) { const d = await iRes.json(); setItems(Array.isArray(d) ? d : d.results || []); }
      if (tRes.ok) { const d = await tRes.json(); setTeam(Array.isArray(d) ? d : d.results || []); }
      if (mRes.ok) setMetrics(await mRes.json());
      if (fRes.ok) { const d = await fRes.json(); setFlowConfig(d); setWipForm({ wip_limit: d.wip_limit || 0, target_cycle_time_days: d.target_cycle_time_days || 0 }); }
      if (rRes.ok) { const d = await rRes.json(); setReleases(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const activeIteration = iterations.find(i => i.status === "active");
  const iterItems = activeIteration ? items.filter(i => i.iteration === activeIteration.id) : [];
  const columns = {
    todo: iterItems.filter(i => i.status === "backlog" || i.status === "ready"),
    in_progress: iterItems.filter(i => i.status === "in_progress" || i.status === "review"),
    done: iterItems.filter(i => i.status === "done"),
  };
  // Backlog items not yet committed to any iteration — candidates to pull in (AG-5).
  const pullableItems = items.filter(i => !i.iteration && (i.status === "backlog" || i.status === "ready"));

  const createIteration = async () => { if (!form.name) { toast.error("Naam verplicht"); return; } if (!form.start_date || !form.end_date) { toast.error("Start- en einddatum verplicht"); return; } setSubmitting(true); try { const r = await fetch(`/api/v1/projects/${id}/agile/iterations/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify(form) }); if (r.ok) { toast.success("Iteratie aangemaakt"); setDialogOpen(false); fetchData(); } else toast.error("Aanmaken mislukt"); } catch { toast.error("Aanmaken mislukt"); } finally { setSubmitting(false); } };
  const startIteration = async (itId: number) => { try { const r = await fetch(`/api/v1/projects/${id}/agile/iterations/${itId}/start/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success("Gestart"); fetchData(); } } catch { toast.error("Starten mislukt"); } };
  const completeIteration = async (itId: number) => { try { const r = await fetch(`/api/v1/projects/${id}/agile/iterations/${itId}/complete/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success("Voltooid"); const completed = iterations.find(i => i.id === itId) || { id: itId }; await fetchData(); setShippedIteration(completed); setShipReleaseId(""); setShipOpen(true); } } catch { toast.error("Voltooien mislukt"); } };
  // AG-1: attach the just-completed iteration to a release so done work ships.
  const attachToRelease = async () => { if (!shipReleaseId || !shippedIteration) { setShipOpen(false); return; } try { const r = await fetch(`/api/v1/projects/${id}/agile/releases/${shipReleaseId}/add_iteration/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify({ iteration_id: shippedIteration.id }) }); if (r.ok) { toast.success(pt("Attached to release")); setShipOpen(false); fetchData(); } else toast.error(pt("Failed")); } catch { toast.error(pt("Failed")); } };
  // AG-5: pull a backlog item into the active iteration without leaving the board.
  const pullIntoIteration = async (item: any) => { if (!activeIteration) return; try { const r = await fetch(`/api/v1/projects/${id}/agile/backlog/${item.id}/`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ iteration: activeIteration.id }) }); if (r.ok) { toast.success(pt("Pulled into iteration")); fetchData(); } else toast.error(pt("Pull failed")); } catch { toast.error(pt("Pull failed")); } };
  const deleteIteration = async (itId: number) => { if (!confirm("Verwijderen?")) return; try { const r = await fetch(`/api/v1/projects/${id}/agile/iterations/${itId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success("Verwijderd"); fetchData(); } } catch { toast.error("Verwijderen mislukt"); } };

  // --- Flow transition with DoD / WIP gate handling ---
  const transition = async (item: any, newStatus: string) => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/agile/backlog/${item.id}/transition/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify({ status: newStatus }) });
      const data = await r.json().catch(() => ({}));
      if (r.ok) { toast.success(pt("Moved")); fetchData(); return; }
      if (data.code === "dod_not_met") {
        toast.error(pt("Definition of Done not met") + (data.unmet_criteria?.length ? ` — ${data.unmet_criteria.length} ${pt("open")}` : ""));
        openDod(item); // surface the checklist so they can tick it off
      } else if (data.code === "wip_limit_exceeded") {
        toast.error(`${pt("WIP limit reached")} (${data.current_wip}/${data.wip_limit}) — ${pt("finish work in progress first")}`);
      } else {
        toast.error(data.detail || pt("Move failed"));
      }
    } catch { toast.error(pt("Move failed")); }
  };

  const assign = async (item: any, assignee: string) => {
    try {
      const body = assignee === "none" ? { assignee: null } : { assignee: parseInt(assignee) };
      const r = await fetch(`/api/v1/projects/${id}/agile/backlog/${item.id}/assign/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      const data = await r.json().catch(() => ({}));
      if (r.ok) { toast.success(pt("Assigned")); fetchData(); }
      else if (data.code === "not_a_team_member") toast.error(pt("Assignee must be a team member"));
      else toast.error(pt("Assign failed"));
    } catch { toast.error(pt("Assign failed")); }
  };

  const openDod = async (item: any) => {
    setDodItem(item); setDodChecklist([]); setDodOpen(true);
    try { const r = await fetch(`/api/v1/projects/${id}/agile/backlog/${item.id}/dod/`, { headers }); if (r.ok) { const d = await r.json(); setDodChecklist(d.checklist || []); } } catch { /* noop */ }
  };
  const toggleDod = async (criterion: number, is_met: boolean) => {
    if (!dodItem) return;
    try { const r = await fetch(`/api/v1/projects/${id}/agile/backlog/${dodItem.id}/dod/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify({ criterion, is_met }) }); if (r.ok) { const d = await r.json(); setDodChecklist(d.checklist || []); fetchData(); } } catch { toast.error(pt("Update failed")); }
  };

  const saveWip = async () => {
    try { const r = await fetch(`/api/v1/projects/${id}/agile/flow-config/`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ wip_limit: Number(wipForm.wip_limit), target_cycle_time_days: Number(wipForm.target_cycle_time_days) }) }); if (r.ok) { toast.success(pt("Saved")); setWipOpen(false); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); }
  };

  const typeColors: Record<string, string> = { story: "bg-blue-100 text-blue-700", bug: "bg-red-100 text-red-700", task: "bg-gray-100 text-gray-700" };

  const nextStatus = (s: string) => { const i = STATUS_FLOW.indexOf(s); return i >= 0 && i < STATUS_FLOW.length - 1 ? STATUS_FLOW[i + 1] : null; };
  const prevStatus = (s: string) => { const i = STATUS_FLOW.indexOf(s); return i > 0 ? STATUS_FLOW[i - 1] : null; };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  const wipBreach = metrics?.wip_breach;

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><LayoutDashboard className="h-6 w-6 text-emerald-500" /><h1 className="text-2xl font-bold">{pt("Iteration Board")}</h1>{activeIteration && <Badge>{activeIteration.name}</Badge>}</div>
          <div className="flex gap-2">
            {activeIteration && <Button variant="outline" onClick={() => setPullOpen(true)} className="gap-2"><ListChecks className="h-4 w-4" /> {pt("Pull from backlog")}</Button>}
            <Button variant="outline" onClick={() => setWipOpen(true)} className="gap-2"><Settings2 className="h-4 w-4" /> {pt("Flow settings")}</Button>
            <Button onClick={() => { setForm({ name: `Iteration ${iterations.length + 1}`, goal: "", start_date: new Date().toISOString().split("T")[0], end_date: "" }); setDialogOpen(true); }} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Iteration")}</Button>
          </div>
        </div>

        {/* Flow / outcome metrics strip — the value Scrum's velocity view lacks */}
        {metrics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Card><CardContent className="p-4"><div className="flex items-center gap-2 text-muted-foreground text-xs"><Gauge className="h-4 w-4" /> {pt("Avg cycle time")}</div><p className="text-2xl font-bold mt-1">{metrics.avg_cycle_time_days != null ? `${metrics.avg_cycle_time_days}d` : "—"}</p>{metrics.target_cycle_time_days > 0 && <p className="text-xs text-muted-foreground">{pt("target")} {metrics.target_cycle_time_days}d</p>}</CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-muted-foreground text-xs">{pt("Throughput / week")}</div><p className="text-2xl font-bold mt-1">{metrics.throughput_per_week ?? 0}</p><p className="text-xs text-muted-foreground">{metrics.throughput} {pt("in")} {metrics.window_days}d</p></CardContent></Card>
            <Card className={wipBreach ? "border-destructive" : ""}><CardContent className="p-4"><div className="text-muted-foreground text-xs">{pt("Current WIP")}</div><p className={`text-2xl font-bold mt-1 ${wipBreach ? "text-destructive" : ""}`}>{metrics.current_wip}{metrics.wip_limit > 0 && <span className="text-base font-normal text-muted-foreground">/{metrics.wip_limit}</span>}</p>{wipBreach && <p className="text-xs text-destructive">{pt("over limit")}</p>}</CardContent></Card>
            <Card><CardContent className="p-4"><div className="text-muted-foreground text-xs">{pt("P85 cycle time")}</div><p className="text-2xl font-bold mt-1">{metrics.p85_cycle_time_hours != null ? `${Math.round(metrics.p85_cycle_time_hours / 24 * 10) / 10}d` : "—"}</p><p className="text-xs text-muted-foreground">{metrics.completed_total} {pt("completed")}</p></CardContent></Card>
          </div>
        )}

        <div className="flex gap-2 flex-wrap">{iterations.map(it => (
          <div key={it.id} className="flex items-center gap-1">
            <Badge variant={it.status === "active" ? "default" : it.status === "completed" ? "secondary" : "outline"}>{it.name} ({it.status})</Badge>
            {it.status === "planning" && <Button variant="ghost" size="sm" onClick={() => startIteration(it.id)} className="h-6 px-2"><Play className="h-3 w-3" /></Button>}
            {it.status === "active" && <Button variant="ghost" size="sm" onClick={() => completeIteration(it.id)} className="h-6 px-2"><CheckCircle2 className="h-3 w-3" /></Button>}
            {it.status === "planning" && <Button variant="ghost" size="sm" onClick={() => deleteIteration(it.id)} className="h-6 px-2"><Trash2 className="h-3 w-3 text-destructive" /></Button>}
          </div>
        ))}</div>

        {!activeIteration ? (
          <Card className="p-8 text-center"><LayoutDashboard className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No active iteration")}</h3><p className="text-muted-foreground">{pt("Create and start an iteration")}</p></Card>
        ) : (
          <div className="grid grid-cols-3 gap-4">{(["todo", "in_progress", "done"] as const).map(col => (
            <Card key={col} className="min-h-[300px]">
              <CardHeader className="pb-2"><CardTitle className="text-sm">{col === "todo" ? "📋 To Do" : col === "in_progress" ? "🔄 In Progress" : "✅ Done"} <Badge variant="outline" className="text-xs ml-1">{columns[col].length}</Badge></CardTitle></CardHeader>
              <CardContent className="space-y-2">{columns[col].map(item => {
                const np = nextStatus(item.status); const pp = prevStatus(item.status);
                return (
                <div key={item.id} className="p-3 border rounded-lg bg-background space-y-2">
                  <div className="flex items-center gap-2"><Badge className={`text-xs ${typeColors[item.item_type] || ""}`}>{item.item_type}</Badge>{item.story_points && <Badge variant="outline" className="text-xs">{item.story_points}p</Badge>}{item.status !== "done" && !item.dod_met && <Badge variant="outline" className="text-xs text-amber-600">DoD</Badge>}{item.cycle_time_hours != null && <Badge variant="outline" className="text-xs">{Math.round(item.cycle_time_hours / 24 * 10) / 10}d</Badge>}</div>
                  <p className="text-sm font-medium">{item.title}</p>
                  {item.product_goal_title && <p className="text-xs text-muted-foreground">🎯 {item.product_goal_title}</p>}
                  <div className="flex items-center gap-1">
                    <UserCircle2 className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                    <Select value={item.assignee ? String(item.assignee) : "none"} onValueChange={(v) => assign(item, v)}>
                      <SelectTrigger className="h-7 text-xs"><SelectValue placeholder={pt("Unassigned")} /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">{pt("Unassigned")}</SelectItem>
                        {team.map(m => <SelectItem key={m.user} value={String(m.user)}>{m.user_name || m.user_email}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between gap-1">
                    <Button variant="ghost" size="sm" className="h-7 px-1" disabled={!pp} onClick={() => pp && transition(item, pp)}><ChevronLeft className="h-3.5 w-3.5" /></Button>
                    <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => openDod(item)}><ListChecks className="h-3.5 w-3.5 mr-1" /> DoD</Button>
                    <Button variant="ghost" size="sm" className="h-7 px-1" disabled={!np} onClick={() => np && transition(item, np)}><ChevronRight className="h-3.5 w-3.5" /></Button>
                  </div>
                </div>
              );})}</CardContent>
            </Card>
          ))}</div>
        )}
      </div>

      {/* New iteration */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{pt("New Iteration")}</DialogTitle><DialogDescription>{pt("Create a new iteration")}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Goal")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>{pt("Start Date")}</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div><div className="space-y-2"><Label>{pt("End Date")}</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={createIteration} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Create")}</Button></div>
        </div>
      </DialogContent></Dialog>

      {/* Flow settings (WIP limit) */}
      <Dialog open={wipOpen} onOpenChange={setWipOpen}><DialogContent><DialogHeader><DialogTitle>{pt("Flow settings")}</DialogTitle><DialogDescription>{pt("Cap work-in-progress to keep flow steady. 0 = unlimited.")}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("WIP limit (in progress)")}</Label><Input type="number" min={0} value={wipForm.wip_limit} onChange={(e) => setWipForm({ ...wipForm, wip_limit: Number(e.target.value) })} /></div>
          <div className="space-y-2"><Label>{pt("Target cycle time (days)")}</Label><Input type="number" min={0} step="0.5" value={wipForm.target_cycle_time_days} onChange={(e) => setWipForm({ ...wipForm, target_cycle_time_days: Number(e.target.value) })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setWipOpen(false)}>{pt("Cancel")}</Button><Button onClick={saveWip}>{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>

      {/* DoD checklist */}
      <Dialog open={dodOpen} onOpenChange={setDodOpen}><DialogContent><DialogHeader><DialogTitle>{pt("Definition of Done")}</DialogTitle><DialogDescription>{dodItem?.title}</DialogDescription></DialogHeader>
        <div className="space-y-2">
          {dodChecklist.length === 0 ? <p className="text-sm text-muted-foreground">{pt("No Definition of Done criteria defined for this project.")}</p> : dodChecklist.map(c => (
            <label key={c.criterion} className="flex items-start gap-3 p-2 border rounded-md cursor-pointer">
              <Checkbox checked={c.is_met} onCheckedChange={(v) => toggleDod(c.criterion, !!v)} />
              <div className="flex-1"><p className="text-sm">{c.criterion_description}{c.is_required && <span className="text-destructive"> *</span>}</p>{c.met_by_name && <p className="text-xs text-muted-foreground">{c.met_by_name}</p>}</div>
            </label>
          ))}
          <div className="flex justify-end pt-2"><Button variant="outline" onClick={() => setDodOpen(false)}>{pt("Close")}</Button></div>
        </div>
      </DialogContent></Dialog>

      {/* Ship completed iteration to a release (AG-1) */}
      <Dialog open={shipOpen} onOpenChange={setShipOpen}><DialogContent><DialogHeader><DialogTitle>{pt("Ship to release")}</DialogTitle><DialogDescription>{pt("Attach the completed iteration's done work to a release.")}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          {releases.length === 0 ? (
            <p className="text-sm text-muted-foreground">{pt("No releases yet. Create one in Release Planning to ship this iteration.")}</p>
          ) : (
            <div className="space-y-2"><Label>{pt("Release")}</Label>
              <Select value={shipReleaseId} onValueChange={setShipReleaseId}>
                <SelectTrigger><SelectValue placeholder={pt("Select a release")} /></SelectTrigger>
                <SelectContent>{releases.map(r => <SelectItem key={r.id} value={String(r.id)}>{r.name}{r.version ? ` (${r.version})` : ""}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          )}
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setShipOpen(false)}>{pt("Skip")}</Button><Button onClick={attachToRelease} disabled={!shipReleaseId}>{pt("Attach")}</Button></div>
        </div>
      </DialogContent></Dialog>

      {/* Pull backlog items into the active iteration (AG-5) */}
      <Dialog open={pullOpen} onOpenChange={setPullOpen}><DialogContent><DialogHeader><DialogTitle>{pt("Pull from backlog")}</DialogTitle><DialogDescription>{activeIteration?.name}</DialogDescription></DialogHeader>
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {pullableItems.length === 0 ? <p className="text-sm text-muted-foreground">{pt("No unassigned backlog items to pull.")}</p> : pullableItems.map(item => (
            <div key={item.id} className="flex items-center justify-between gap-2 p-2 border rounded-md">
              <div className="flex items-center gap-2 min-w-0"><Badge className={`text-xs ${typeColors[item.item_type] || ""}`}>{item.item_type}</Badge>{item.story_points && <Badge variant="outline" className="text-xs">{item.story_points}p</Badge>}<span className="text-sm truncate">{item.title}</span></div>
              <Button size="sm" variant="ghost" className="h-7 px-2 shrink-0" onClick={() => pullIntoIteration(item)}><Plus className="h-3.5 w-3.5 mr-1" /> {pt("Pull")}</Button>
            </div>
          ))}
          <div className="flex justify-end pt-2"><Button variant="outline" onClick={() => setPullOpen(false)}>{pt("Close")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default AgileIterationBoard;
