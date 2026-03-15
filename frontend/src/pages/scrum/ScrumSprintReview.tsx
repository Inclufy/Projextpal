import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Loader2, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const ScrumSprintReview = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [reviews, setReviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ demo_notes: "", stakeholder_feedback: "", backlog_updates: "", completed_items_summary: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/scrum/reviews/`, { headers }); if (r.ok) { const d = await r.json(); setReviews(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ demo_notes: "", stakeholder_feedback: "", backlog_updates: "", completed_items_summary: "" }); setDialogOpen(true); };
  const openEdit = (r: any) => { setEditing(r); setForm({ demo_notes: r.demo_notes || "", stakeholder_feedback: r.stakeholder_feedback || "", backlog_updates: r.backlog_updates || "", completed_items_summary: r.completed_items_summary || "" }); setDialogOpen(true); };
  const handleSave = async () => { setSubmitting(true); try { const url = editing ? `/api/v1/projects/${id}/scrum/reviews/${editing.id}/` : `/api/v1/projects/${id}/scrum/reviews/`; const method = editing ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(form) }); if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); } };
  const handleDelete = async (rId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/scrum/reviews/${rId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Eye className="h-6 w-6 text-indigo-500" /><h1 className="text-2xl font-bold">{pt("Sprint Review")}</h1><Badge variant="outline">{reviews.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Review")}</Button></div>
        {reviews.length === 0 ? <Card className="p-8 text-center"><Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No sprint reviews yet")}</h3></Card> : (
          <div className="space-y-3">{reviews.map(r => (<Card key={r.id}><CardContent className="p-4 flex justify-between"><div className="flex-1"><p className="font-medium mb-1">Sprint Review #{r.id}</p>{r.demo_notes && <p className="text-sm text-muted-foreground">{r.demo_notes}</p>}{r.stakeholder_feedback && <p className="text-sm mt-1"><span className="font-medium">Feedback:</span> {r.stakeholder_feedback}</p>}</div><div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button></div></CardContent></Card>))}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("New")} {pt("Sprint Review")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>Demo Notes</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.demo_notes} onChange={(e) => setForm({ ...form, demo_notes: e.target.value })} /></div>
          <div className="space-y-2"><Label>Stakeholder Feedback</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.stakeholder_feedback} onChange={(e) => setForm({ ...form, stakeholder_feedback: e.target.value })} /></div>
          <div className="space-y-2"><Label>Backlog Updates</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.backlog_updates} onChange={(e) => setForm({ ...form, backlog_updates: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default ScrumSprintReview;
