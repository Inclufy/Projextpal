import { useState, useEffect } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, ListChecks, Pencil, Trash2, Layers, X } from "lucide-react";
import { toast } from "sonner";

const AgileBacklog = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const epicFilter = searchParams.get("epic");
  const autoAdd = searchParams.get("add");
  const [items, setItems] = useState<any[]>([]);
  const [iterations, setIterations] = useState<any[]>([]);
  const [epics, setEpics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", item_type: "story", priority: "should_have", story_points: "", acceptance_criteria: "", epic: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [iRes, itRes, eRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/agile/backlog/`, { headers }),
        fetch(`/api/v1/projects/${id}/agile/iterations/`, { headers }),
        fetch(`/api/v1/projects/${id}/agile/epics/`, { headers }),
      ]);
      if (iRes.ok) { const d = await iRes.json(); setItems(Array.isArray(d) ? d : d.results || []); }
      if (itRes.ok) { const d = await itRes.json(); setIterations(Array.isArray(d) ? d : d.results || []); }
      if (eRes.ok) { const d = await eRes.json(); setEpics(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const epicById = (eid: number | null | undefined) =>
    eid == null ? null : epics.find(e => e.id === eid) || null;

  // Auto-open the create dialog when navigating from Epics page with &add=1.
  // Pre-fill epic with the ?epic= value so the new item lands in that epic.
  useEffect(() => {
    if (autoAdd && !loading && !dialogOpen) {
      setEditing(null);
      setForm({ title: "", description: "", item_type: "story", priority: "should_have", story_points: "", acceptance_criteria: "", epic: epicFilter || "" });
      setDialogOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete("add");
      setSearchParams(next, { replace: true });
    }
  }, [autoAdd, loading]);

  const openCreate = () => { setEditing(null); setForm({ title: "", description: "", item_type: "story", priority: "should_have", story_points: "", acceptance_criteria: "", epic: epicFilter || "" }); setDialogOpen(true); };
  const openEdit = (item: any) => { setEditing(item); setForm({ title: item.title, description: item.description || "", item_type: item.item_type || "story", priority: item.priority || "should_have", story_points: String(item.story_points || ""), acceptance_criteria: item.acceptance_criteria || "", epic: item.epic != null ? String(item.epic) : "" }); setDialogOpen(true); };

  const clearEpicFilter = () => {
    const next = new URLSearchParams(searchParams);
    next.delete("epic");
    setSearchParams(next, { replace: true });
  };

  const handleSave = async () => {
    if (!form.title) { toast.error("Titel verplicht"); return; }
    setSubmitting(true);
    try {
      const body: any = { ...form };
      if (form.story_points) body.story_points = parseInt(form.story_points); else delete body.story_points;
      // Epic FK: empty string = unset (omit on create, explicit null on edit
      // so the server clears the FK). Same shape as the WaterfallTesting
      // requirement picker (a723d50b / 938aaf29).
      if (form.epic !== "") body.epic = parseInt(form.epic);
      else if (editing) body.epic = null;
      else delete body.epic;
      const url = editing ? `/api/v1/projects/${id}/agile/backlog/${editing.id}/` : `/api/v1/projects/${id}/agile/backlog/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success("Opgeslagen"); setDialogOpen(false); fetchData(); }
      else toast.error("Opslaan mislukt");
    } catch { toast.error("Opslaan mislukt"); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (itemId: number) => { if (!confirm("Verwijderen?")) return; try { const r = await fetch(`/api/v1/projects/${id}/agile/backlog/${itemId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success("Verwijderd"); fetchData(); } } catch { toast.error("Verwijderen mislukt"); } };

  const moveToIteration = async (itemId: number, iterationId: number) => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/agile/backlog/${itemId}/move-to-iteration/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify({ iteration_id: iterationId }) });
      if (r.ok) { toast.success("Verplaatst naar iteratie"); fetchData(); }
      else toast.error("Verplaatsen mislukt");
    } catch { toast.error("Verplaatsen mislukt"); }
  };

  const priorityColors: Record<string, string> = { must_have: "bg-red-100 text-red-700", should_have: "bg-orange-100 text-orange-700", could_have: "bg-yellow-100 text-yellow-700", wont_have: "bg-green-100 text-green-700" };
  const typeColors: Record<string, string> = { story: "bg-blue-100 text-blue-700", bug: "bg-red-100 text-red-700", task: "bg-gray-100 text-gray-700", spike: "bg-purple-100 text-purple-700" };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  // ?epic= filter narrows everything to items in that epic (audit fix #3).
  const epicFilterId = epicFilter ? parseInt(epicFilter) : null;
  const filteredItems = epicFilterId != null && !Number.isNaN(epicFilterId)
    ? items.filter(i => i.epic === epicFilterId)
    : items;
  const backlogItems = filteredItems.filter(i => !i.iteration);
  const iterationItems = filteredItems.filter(i => i.iteration);
  const filterEpic = epicFilterId != null ? epicById(epicFilterId) : null;

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><ListChecks className="h-6 w-6 text-emerald-500" /><h1 className="text-2xl font-bold">{pt("Backlog")}</h1><Badge variant="outline">{filteredItems.length}{epicFilterId != null ? ` / ${items.length}` : ""} items</Badge></div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add Item")}</Button>
        </div>

        {epicFilterId != null && (
          <div className="flex items-center gap-2 px-3 py-2 bg-muted/50 border rounded-md text-sm">
            <Layers className="h-4 w-4 text-muted-foreground" />
            <span className="text-muted-foreground">{pt("Filtered by epic")}:</span>
            <span className="font-medium">{filterEpic ? filterEpic.title : `#${epicFilterId}`}</span>
            <Button
              variant="ghost"
              size="sm"
              className="ml-auto h-6 gap-1"
              onClick={() => navigate(`/projects/${id}/agile/epics?highlight=${epicFilterId}`)}
            >
              <Layers className="h-3 w-3" /> {pt("Open Epic")}
            </Button>
            <Button variant="ghost" size="sm" className="h-6 gap-1" onClick={clearEpicFilter}>
              <X className="h-3 w-3" /> {pt("Clear")}
            </Button>
          </div>
        )}

        <Card><CardHeader className="pb-3"><CardTitle>{pt("Backlog")} ({backlogItems.length})</CardTitle></CardHeader>
          <CardContent>{backlogItems.length === 0 ? <p className="text-muted-foreground text-center py-6">{pt("No backlog items")}</p> : (
            <div className="space-y-2">{backlogItems.map((item) => {
              const linkedEpic = epicById(item.epic);
              return (
              <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                <div className="flex items-center gap-3 flex-1 flex-wrap">
                  <Badge className={`text-xs ${typeColors[item.item_type] || ""}`}>{item.item_type}</Badge>
                  <span className="font-medium text-sm">{item.title}</span>
                  <Badge className={`text-xs ${priorityColors[item.priority] || ""}`}>{item.priority_display || item.priority?.replace("_", " ")}</Badge>
                  {item.story_points && <Badge variant="outline" className="text-xs">{item.story_points} pts</Badge>}
                  {(linkedEpic || item.epic_title) && (
                    <Badge
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-muted gap-1"
                      onClick={(e) => { e.stopPropagation(); navigate(`/projects/${id}/agile/epics?highlight=${item.epic}`); }}
                      title={pt("Open linked epic")}
                    >
                      <Layers className="h-3 w-3" /> {linkedEpic?.title || item.epic_title}
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-1">
                  {iterations.filter(it => it.status !== "completed").length > 0 && (
                    <Select onValueChange={(v) => moveToIteration(item.id, parseInt(v))}>
                      <SelectTrigger className="w-32 h-8 text-xs"><SelectValue placeholder="→ Iteration" /></SelectTrigger>
                      <SelectContent>{iterations.filter(it => it.status !== "completed").map(it => <SelectItem key={it.id} value={it.id.toString()}>{it.name}</SelectItem>)}</SelectContent>
                    </Select>
                  )}
                  <Button variant="ghost" size="sm" onClick={() => openEdit(item)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(item.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
            );})}</div>
          )}</CardContent>
        </Card>

        {iterations.filter(it => it.status !== "completed").map(iter => {
          const iItems = iterationItems.filter(i => i.iteration === iter.id);
          return (<Card key={iter.id}><CardHeader className="pb-3"><CardTitle className="flex items-center gap-2">{iter.name} <Badge variant={iter.status === "active" ? "default" : "secondary"}>{iter.status}</Badge><span className="text-sm font-normal text-muted-foreground">({iItems.length})</span></CardTitle></CardHeader>
            <CardContent>{iItems.length === 0 ? <p className="text-muted-foreground text-center py-3">No items</p> : (
              <div className="space-y-2">{iItems.map(item => {
                const linkedEpic = epicById(item.epic);
                return (
                <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3 flex-wrap">
                    <Badge className={`text-xs ${typeColors[item.item_type] || ""}`}>{item.item_type}</Badge>
                    <span className="font-medium text-sm">{item.title}</span>
                    {item.story_points && <Badge variant="outline" className="text-xs">{item.story_points} pts</Badge>}
                    {(linkedEpic || item.epic_title) && (
                      <Badge
                        variant="outline"
                        className="text-xs cursor-pointer hover:bg-muted gap-1"
                        onClick={(e) => { e.stopPropagation(); navigate(`/projects/${id}/agile/epics?highlight=${item.epic}`); }}
                        title={pt("Open linked epic")}
                      >
                        <Layers className="h-3 w-3" /> {linkedEpic?.title || item.epic_title}
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline" className="text-xs">{item.status}</Badge>
                </div>
                );
              })}</div>
            )}</CardContent></Card>);
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} Item</DialogTitle><DialogDescription>{editing ? pt("Edit backlog item") : pt("Add a new backlog item")}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-2"><Label>Type</Label><Select value={form.item_type} onValueChange={(v) => setForm({ ...form, item_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="story">Story</SelectItem><SelectItem value="bug">Bug</SelectItem><SelectItem value="task">Task</SelectItem><SelectItem value="spike">Spike</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>{pt("Priority")}</Label><Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="must_have">Must Have</SelectItem><SelectItem value="should_have">Should Have</SelectItem><SelectItem value="could_have">Could Have</SelectItem><SelectItem value="wont_have">Won't Have</SelectItem></SelectContent></Select></div>
            <div className="space-y-2"><Label>Story Points</Label><Input type="number" value={form.story_points} onChange={(e) => setForm({ ...form, story_points: e.target.value })} /></div>
          </div>
          <div className="space-y-2">
            <Label>{pt("Epic")} ({pt("optional")})</Label>
            <Select value={form.epic || "__none__"} onValueChange={(v) => setForm({ ...form, epic: v === "__none__" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder={pt("Pick the epic this item belongs to (optional)")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">{pt("None")}</SelectItem>
                {epics.length === 0 && <div className="px-2 py-1.5 text-xs text-muted-foreground">{pt("No epics yet — add some on the Epics page first.")}</div>}
                {epics.map(e => (
                  <SelectItem key={e.id} value={String(e.id)}>{e.title}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>{pt("Acceptance Criteria")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.acceptance_criteria} onChange={(e) => setForm({ ...form, acceptance_criteria: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default AgileBacklog;
