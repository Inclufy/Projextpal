import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Users, MessageSquare, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ScrumDailyStandup = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [standups, setStandups] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split("T")[0], notes: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/scrum/standups/`, { headers });
      if (r.ok) { const d = await r.json(); setStandups(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleCreate = async () => {
    setSubmitting(true);
    try {
      const r = await fetch(`/api/v1/projects/${id}/scrum/standups/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify(form) });
      if (r.ok) { toast.success(pt("Created")); setDialogOpen(false); fetchData(); }
      else toast.error(pt("Create failed"));
    } catch { toast.error(pt("Create failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (sId: number) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    try { const r = await fetch(`/api/v1/projects/${id}/scrum/standups/${sId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); }
  };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Users className="h-6 w-6 text-green-500" /><h1 className="text-2xl font-bold">{pt("Daily Standup")}</h1><Badge variant="outline">{standups.length}</Badge></div>
          <Button onClick={() => { setForm({ date: new Date().toISOString().split("T")[0], notes: "" }); setDialogOpen(true); }} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Standup")}</Button>
        </div>

        {standups.length === 0 ? (
          <Card className="p-8 text-center"><MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No standups recorded yet")}</h3></Card>
        ) : (
          <div className="space-y-3">{standups.map(s => (
            <Card key={s.id}>
              <CardContent className="p-4 flex items-center justify-between">
                <div><p className="font-medium">{s.date}</p>{s.notes && <p className="text-sm text-muted-foreground mt-1">{s.notes}</p>}{s.updates?.length > 0 && <div className="mt-2 space-y-1">{s.updates.map((u: any, i: number) => <div key={i} className="text-sm p-2 bg-muted rounded"><span className="font-medium">{u.member_name}:</span> {u.yesterday} | {u.today} | {u.blockers && <span className="text-red-500">⚠ {u.blockers}</span>}</div>)}</div>}</div>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </CardContent>
            </Card>
          ))}</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent><DialogHeader><DialogTitle>{pt("New Standup")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Date")}</Label><Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Notes")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleCreate} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Create")}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScrumDailyStandup;
