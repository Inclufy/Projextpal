import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Plus, BarChart3, Trash2 } from "lucide-react";
import { toast } from "sonner";

const AgileDailyProgress = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [updates, setUpdates] = useState<any[]>([]);
  const [activeIteration, setActiveIteration] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], yesterday: "", today: "", blockers: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [uRes, itRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/agile/daily-updates/`, { headers }),
        fetch(`/api/v1/projects/${id}/agile/iterations/active/`, { headers }),
      ]);
      if (uRes.ok) { const d = await uRes.json(); setUpdates(Array.isArray(d) ? d : d.results || []); }
      if (itRes.ok) { const d = await itRes.json(); if (d && d.id) setActiveIteration(d); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const handleCreate = async () => {
    if (!activeIteration) { toast.error("Geen actieve iteratie gevonden"); return; }
    setSubmitting(true);
    try {
      const r = await fetch(`/api/v1/projects/${id}/agile/daily-updates/`, {
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({ ...form, iteration_id: activeIteration.id })
      });
      if (r.ok) { toast.success("Update toegevoegd"); setDialogOpen(false); fetchData(); }
      else { const err = await r.json().catch(() => null); toast.error(err?.detail || "Aanmaken mislukt"); }
    } catch { toast.error("Aanmaken mislukt"); }
    finally { setSubmitting(false); }
  };
  const handleDelete = async (uId: number) => { if (!confirm("Verwijderen?")) return; try { const r = await fetch(`/api/v1/projects/${id}/agile/daily-updates/${uId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success("Verwijderd"); fetchData(); } } catch { toast.error("Verwijderen mislukt"); } };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><BarChart3 className="h-6 w-6 text-green-500" /><h1 className="text-2xl font-bold">{pt("Daily Progress")}</h1><Badge variant="outline">{updates.length}</Badge>{activeIteration && <Badge variant="secondary">{activeIteration.name}</Badge>}</div>
          <Button onClick={() => { setForm({ date: new Date().toISOString().split("T")[0], yesterday: "", today: "", blockers: "" }); setDialogOpen(true); }} className="gap-2" disabled={!activeIteration}><Plus className="h-4 w-4" /> {pt("Add Update")}</Button>
        </div>
        {!activeIteration && <Card className="p-4 border-yellow-200 bg-yellow-50"><p className="text-sm text-yellow-800">{pt("No active iteration. Start an iteration first to add daily updates.")}</p></Card>}
        {updates.length === 0 ? <Card className="p-8 text-center"><BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No daily updates yet")}</h3></Card> : (
          <div className="space-y-3">{updates.map(u => (
            <Card key={u.id}><CardContent className="p-4 flex justify-between">
              <div className="flex-1"><div className="flex items-center gap-2 mb-2"><p className="font-medium">{u.date}</p>{u.user_name && <Badge variant="outline" className="text-xs">{u.user_name}</Badge>}</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {u.yesterday && <div className="p-2 bg-blue-50 rounded"><p className="text-xs font-semibold text-blue-700">Yesterday</p><p className="text-sm">{u.yesterday}</p></div>}
                  {u.today && <div className="p-2 bg-green-50 rounded"><p className="text-xs font-semibold text-green-700">Today</p><p className="text-sm">{u.today}</p></div>}
                  {u.blockers && <div className="p-2 bg-red-50 rounded"><p className="text-xs font-semibold text-red-700">Blockers</p><p className="text-sm">{u.blockers}</p></div>}
                </div>
              </div>
              <Button variant="ghost" size="sm" onClick={() => handleDelete(u.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
            </CardContent></Card>
          ))}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{pt("Add Update")}</DialogTitle><DialogDescription>{activeIteration ? `${activeIteration.name}` : ""}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Date")}</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
          <div className="space-y-2"><Label>Yesterday</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.yesterday} onChange={(e) => setForm({ ...form, yesterday: e.target.value })} /></div>
          <div className="space-y-2"><Label>Today</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.today} onChange={(e) => setForm({ ...form, today: e.target.value })} /></div>
          <div className="space-y-2"><Label>Blockers</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.blockers} onChange={(e) => setForm({ ...form, blockers: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleCreate} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Create")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default AgileDailyProgress;
