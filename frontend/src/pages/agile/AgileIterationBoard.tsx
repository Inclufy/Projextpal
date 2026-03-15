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
import { Loader2, Plus, Play, CheckCircle2, LayoutDashboard, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AgileIterationBoard = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [iterations, setIterations] = useState<any[]>([]);
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
      const [itRes, iRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/agile/iterations/`, { headers }),
        fetch(`/api/v1/projects/${id}/agile/backlog/`, { headers }),
      ]);
      if (itRes.ok) { const d = await itRes.json(); setIterations(Array.isArray(d) ? d : d.results || []); }
      if (iRes.ok) { const d = await iRes.json(); setItems(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const activeIteration = iterations.find(i => i.status === "active");
  const iterItems = activeIteration ? items.filter(i => i.iteration === activeIteration.id) : [];
  const columns = { todo: iterItems.filter(i => i.status === "backlog" || i.status === "ready"), in_progress: iterItems.filter(i => i.status === "in_progress" || i.status === "review"), done: iterItems.filter(i => i.status === "done") };

  const createIteration = async () => { if (!form.name) { toast.error("Naam verplicht"); return; } setSubmitting(true); try { const r = await fetch(`/api/v1/projects/${id}/agile/iterations/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify(form) }); if (r.ok) { toast.success("Iteratie aangemaakt"); setDialogOpen(false); fetchData(); } else toast.error("Aanmaken mislukt"); } catch { toast.error("Aanmaken mislukt"); } finally { setSubmitting(false); } };
  const startIteration = async (itId: number) => { try { const r = await fetch(`/api/v1/projects/${id}/agile/iterations/${itId}/start/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success("Gestart"); fetchData(); } } catch { toast.error("Starten mislukt"); } };
  const completeIteration = async (itId: number) => { try { const r = await fetch(`/api/v1/projects/${id}/agile/iterations/${itId}/complete/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success("Voltooid"); fetchData(); } } catch { toast.error("Voltooien mislukt"); } };
  const deleteIteration = async (itId: number) => { if (!confirm("Verwijderen?")) return; try { const r = await fetch(`/api/v1/projects/${id}/agile/iterations/${itId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success("Verwijderd"); fetchData(); } } catch { toast.error("Verwijderen mislukt"); } };

  const typeColors: Record<string, string> = { story: "bg-blue-100 text-blue-700", bug: "bg-red-100 text-red-700", task: "bg-gray-100 text-gray-700" };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><LayoutDashboard className="h-6 w-6 text-emerald-500" /><h1 className="text-2xl font-bold">{pt("Iteration Board")}</h1>{activeIteration && <Badge>{activeIteration.name}</Badge>}</div>
          <Button onClick={() => { setForm({ name: `Iteration ${iterations.length + 1}`, goal: "", start_date: new Date().toISOString().split("T")[0], end_date: "" }); setDialogOpen(true); }} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Iteration")}</Button>
        </div>

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
              <CardContent className="space-y-2">{columns[col].map(item => (
                <div key={item.id} className="p-3 border rounded-lg bg-background">
                  <div className="flex items-center gap-2 mb-1"><Badge className={`text-xs ${typeColors[item.item_type] || ""}`}>{item.item_type}</Badge>{item.story_points && <Badge variant="outline" className="text-xs">{item.story_points}p</Badge>}</div>
                  <p className="text-sm font-medium">{item.title}</p>
                </div>
              ))}</CardContent>
            </Card>
          ))}</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{pt("New Iteration")}</DialogTitle><DialogDescription>{pt("Create a new iteration")}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Goal")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.goal} onChange={(e) => setForm({ ...form, goal: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>{pt("Start Date")}</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div><div className="space-y-2"><Label>{pt("End Date")}</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={createIteration} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Create")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default AgileIterationBoard;
