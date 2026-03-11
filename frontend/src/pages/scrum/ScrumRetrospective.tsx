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
import { Loader2, Plus, RotateCcw, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const ScrumRetrospective = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [retros, setRetros] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ what_went_well: "", what_went_wrong: "", action_items: "", sprint_number: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/scrum/retrospectives/`, { headers });
      if (r.ok) { const d = await r.json(); setRetros(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ what_went_well: "", what_went_wrong: "", action_items: "", sprint_number: "" }); setDialogOpen(true); };
  const openEdit = (r: any) => { setEditing(r); setForm({ what_went_well: r.what_went_well || "", what_went_wrong: r.what_went_wrong || "", action_items: r.action_items || "", sprint_number: String(r.sprint_number || "") }); setDialogOpen(true); };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const url = editing ? `/api/v1/projects/${id}/scrum/retrospectives/${editing.id}/` : `/api/v1/projects/${id}/scrum/retrospectives/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(form) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (rId: number) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    try { const r = await fetch(`/api/v1/projects/${id}/scrum/retrospectives/${rId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); }
  };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><RotateCcw className="h-6 w-6 text-purple-500" /><h1 className="text-2xl font-bold">{pt("Retrospective")}</h1><Badge variant="outline">{retros.length}</Badge></div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Retrospective")}</Button>
        </div>

        {retros.length === 0 ? (
          <Card className="p-8 text-center"><RotateCcw className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No retrospectives yet")}</h3></Card>
        ) : (
          <div className="space-y-4">{retros.map(r => (
            <Card key={r.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <Badge variant="outline">Sprint {r.sprint_number || r.id}</Badge>
                  <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-3 bg-green-50 rounded-lg border border-green-200"><p className="text-xs font-semibold text-green-700 mb-1">✅ {pt("What went well")}</p><p className="text-sm">{r.what_went_well || "-"}</p></div>
                  <div className="p-3 bg-red-50 rounded-lg border border-red-200"><p className="text-xs font-semibold text-red-700 mb-1">❌ {pt("What went wrong")}</p><p className="text-sm">{r.what_went_wrong || "-"}</p></div>
                  <div className="p-3 bg-blue-50 rounded-lg border border-blue-200"><p className="text-xs font-semibold text-blue-700 mb-1">📋 {pt("Action Items")}</p><p className="text-sm">{r.action_items || "-"}</p></div>
                </div>
              </CardContent>
            </Card>
          ))}</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg"><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("New")} {pt("Retrospective")}</DialogTitle><DialogDescription>{editing ? pt("Edit retrospective") : pt("Create a new retrospective")}</DialogDescription></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>✅ {pt("What went well")}</Label><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background" value={form.what_went_well} onChange={(e) => setForm({ ...form, what_went_well: e.target.value })} /></div>
            <div className="space-y-2"><Label>❌ {pt("What went wrong")}</Label><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background" value={form.what_went_wrong} onChange={(e) => setForm({ ...form, what_went_wrong: e.target.value })} /></div>
            <div className="space-y-2"><Label>📋 {pt("Action Items")}</Label><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background" value={form.action_items} onChange={(e) => setForm({ ...form, action_items: e.target.value })} /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ScrumRetrospective;
