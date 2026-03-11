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
import { Loader2, Plus, Play, CheckCircle2, LayoutDashboard, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ScrumSprintBoard = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [sprints, setSprints] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", goal: "", start_date: "", end_date: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [sRes, iRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/scrum/sprints/`, { headers }),
        fetch(`/api/v1/projects/${id}/scrum/items/`, { headers }),
      ]);
      if (sRes.ok) { const d = await sRes.json(); setSprints(Array.isArray(d) ? d : d.results || []); }
      if (iRes.ok) { const d = await iRes.json(); setItems(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const activeSprint = sprints.find(s => s.status === "active");
  const sprintItems = activeSprint ? items.filter(i => i.sprint === activeSprint.id) : [];
  const columns = { todo: sprintItems.filter(i => i.status === "todo"), in_progress: sprintItems.filter(i => i.status === "in_progress"), done: sprintItems.filter(i => i.status === "done") };

  const createSprint = async () => {
    if (!form.name) { toast.error(pt("Name is required")); return; }
    setSubmitting(true);
    try {
      const r = await fetch(`/api/v1/projects/${id}/scrum/sprints/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify(form) });
      if (r.ok) { toast.success(pt("Sprint created")); setDialogOpen(false); fetchData(); }
      else { const err = await r.json().catch(() => ({})); toast.error(err.detail || pt("Create failed")); }
    } catch { toast.error(pt("Create failed")); }
    finally { setSubmitting(false); }
  };

  const startSprint = async (sprintId: number) => {
    try { const r = await fetch(`/api/v1/projects/${id}/scrum/sprints/${sprintId}/start/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success(pt("Sprint started")); fetchData(); } else toast.error(pt("Action failed")); } catch { toast.error(pt("Action failed")); }
  };

  const completeSprint = async (sprintId: number) => {
    try { const r = await fetch(`/api/v1/projects/${id}/scrum/sprints/${sprintId}/complete/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success(pt("Sprint completed")); fetchData(); } else toast.error(pt("Action failed")); } catch { toast.error(pt("Action failed")); }
  };

  const updateItemStatus = async (itemId: number, status: string) => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/scrum/items/${itemId}/update_status/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify({ status }) });
      if (r.ok) fetchData();
    } catch { toast.error(pt("Action failed")); }
  };

  const typeColors: Record<string, string> = { story: "bg-blue-100 text-blue-700", bug: "bg-red-100 text-red-700", task: "bg-gray-100 text-gray-700" };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><LayoutDashboard className="h-6 w-6 text-blue-500" /><h1 className="text-2xl font-bold">{pt("Sprint Board")}</h1>{activeSprint && <Badge>{activeSprint.name}</Badge>}</div>
          <Button onClick={() => { setForm({ name: `Sprint ${sprints.length + 1}`, goal: "", start_date: new Date().toISOString().split("T")[0], end_date: "" }); setDialogOpen(true); }} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Sprint")}</Button>
        </div>

        {/* Sprint list */}
        <div className="flex gap-2 flex-wrap">
          {sprints.map(s => (
            <div key={s.id} className="flex items-center gap-1">
              <Badge variant={s.status === "active" ? "default" : s.status === "completed" ? "secondary" : "outline"}>{s.name} ({s.status})</Badge>
              {s.status === "planned" && <Button variant="ghost" size="sm" onClick={() => startSprint(s.id)} className="h-6 px-2"><Play className="h-3 w-3" /></Button>}
              {s.status === "active" && <Button variant="ghost" size="sm" onClick={() => completeSprint(s.id)} className="h-6 px-2"><CheckCircle2 className="h-3 w-3" /></Button>}
            </div>
          ))}
        </div>

        {/* Board */}
        {!activeSprint ? (
          <Card className="p-8 text-center"><LayoutDashboard className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold mb-2">{pt("No active sprint")}</h3><p className="text-muted-foreground">{pt("Create and start a sprint to see the board")}</p></Card>
        ) : (
          <div className="grid grid-cols-3 gap-4">
            {(["todo", "in_progress", "done"] as const).map((col) => (
              <Card key={col} className="min-h-[300px]">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2">{col === "todo" ? "📋 To Do" : col === "in_progress" ? "🔄 In Progress" : "✅ Done"}<Badge variant="outline" className="text-xs">{columns[col].length}</Badge></CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  {columns[col].map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg bg-background hover:shadow-sm transition-shadow">
                      <div className="flex items-center gap-2 mb-1"><Badge className={`text-xs ${typeColors[item.item_type] || ""}`}>{item.item_type}</Badge>{item.story_points && <Badge variant="outline" className="text-xs">{item.story_points}p</Badge>}</div>
                      <p className="text-sm font-medium">{item.title}</p>
                      <div className="flex gap-1 mt-2">
                        {col !== "todo" && <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => updateItemStatus(item.id, col === "in_progress" ? "todo" : "in_progress")}>← Back</Button>}
                        {col !== "done" && <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => updateItemStatus(item.id, col === "todo" ? "in_progress" : "done")}>Next →</Button>}
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{pt("New Sprint")}</DialogTitle><DialogDescription>{pt("Create a new sprint")}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Goal")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Start Date")}</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("End Date")}</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={createSprint} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Create")}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScrumSprintBoard;
