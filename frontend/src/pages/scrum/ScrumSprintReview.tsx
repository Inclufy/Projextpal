import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Eye, Pencil, Trash2, ClipboardCheck, ThumbsUp, ThumbsDown } from "lucide-react";
import { toast } from "sonner";

const ScrumSprintReview = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [reviews, setReviews] = useState<any[]>([]);
  const [sprints, setSprints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ sprint: "", demo_notes: "", stakeholder_feedback: "", backlog_updates: "" });

  // --- Record outcomes (accept / reject) flow ---
  const [recordFor, setRecordFor] = useState<any | null>(null);
  const [reviewItems, setReviewItems] = useState<any[]>([]);
  const [decision, setDecision] = useState<Record<number, "accept" | "reject" | "">>({});
  const [reasons, setReasons] = useState<Record<number, string>>({});
  const [goalAchieved, setGoalAchieved] = useState(false);
  const [recording, setRecording] = useState(false);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [rRes, sRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/scrum/reviews/`, { headers }),
        fetch(`/api/v1/projects/${id}/scrum/sprints/`, { headers }),
      ]);
      if (rRes.ok) { const d = await rRes.json(); setReviews(Array.isArray(d) ? d : d.results || []); }
      if (sRes.ok) { const d = await sRes.json(); setSprints(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); } finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ sprint: "", demo_notes: "", stakeholder_feedback: "", backlog_updates: "" }); setDialogOpen(true); };
  const openEdit = (r: any) => { setEditing(r); setForm({ sprint: r.sprint?.toString() || "", demo_notes: r.demo_notes || "", stakeholder_feedback: r.stakeholder_feedback || "", backlog_updates: r.backlog_updates || "" }); setDialogOpen(true); };
  const handleSave = async () => {
    if (!editing && !form.sprint) { toast.error(pt("Sprint is required")); return; }
    setSubmitting(true);
    try {
      const url = editing ? `/api/v1/projects/${id}/scrum/reviews/${editing.id}/` : `/api/v1/projects/${id}/scrum/reviews/`;
      const method = editing ? "PATCH" : "POST";
      const body: any = { demo_notes: form.demo_notes, stakeholder_feedback: form.stakeholder_feedback };
      if (form.sprint) body.sprint = parseInt(form.sprint);
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); }
  };
  const handleDelete = async (rId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/scrum/reviews/${rId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };

  const openRecord = async (r: any) => {
    setRecordFor(r); setDecision({}); setReasons({}); setGoalAchieved(!!r.sprint_goal_achieved); setReviewItems([]);
    if (!r.sprint) return;
    try {
      const res = await fetch(`/api/v1/projects/${id}/scrum/items/?sprint=${r.sprint}`, { headers });
      if (res.ok) { const d = await res.json(); setReviewItems(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
  };

  const handleRecord = async () => {
    if (!recordFor) return;
    const accepted_item_ids = Object.keys(decision).filter(k => decision[+k] === "accept").map(k => parseInt(k));
    const rejected = Object.keys(decision).filter(k => decision[+k] === "reject").map(k => ({ item_id: parseInt(k), reason: reasons[+k] || "" }));
    setRecording(true);
    try {
      const r = await fetch(`/api/v1/projects/${id}/scrum/reviews/${recordFor.id}/record/`, {
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({ accepted_item_ids, rejected, sprint_goal_achieved: goalAchieved }),
      });
      const data = await r.json().catch(() => ({}));
      if (r.ok) {
        const spawned = (data.spawned_follow_up_ids || []).length;
        toast.success(pt("Review recorded") + (spawned ? ` — ${spawned} ` + pt("follow-up item(s) created") : ""));
        setRecordFor(null); fetchData();
      } else if (data.code === "dod_not_met") {
        toast.error(pt("Definition of Done not met — complete the DoD checklist before accepting work."));
      } else {
        toast.error(data.detail || pt("Record failed"));
      }
    } catch { toast.error(pt("Record failed")); } finally { setRecording(false); }
  };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Eye className="h-6 w-6 text-indigo-500" /><h1 className="text-2xl font-bold">{pt("Sprint Review")}</h1><Badge variant="outline">{reviews.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Review")}</Button></div>
        {reviews.length === 0 ? <Card className="p-8 text-center"><Eye className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No sprint reviews yet")}</h3></Card> : (
          <div className="space-y-3">{reviews.map(r => (
            <Card key={r.id}><CardContent className="p-4 flex justify-between">
              <div className="flex-1">
                <p className="font-medium mb-1 flex items-center gap-2">{r.sprint_name || `Sprint Review #${r.id}`}{r.status === "completed" && <Badge variant="default">{pt("recorded")}</Badge>}{r.sprint_goal_achieved && <Badge className="bg-green-600">{pt("goal met")}</Badge>}</p>
                {r.demo_notes && <p className="text-sm text-muted-foreground">{r.demo_notes}</p>}
                {r.stakeholder_feedback && <p className="text-sm mt-1"><span className="font-medium">Feedback:</span> {r.stakeholder_feedback}</p>}
                {r.completed_story_points > 0 && <p className="text-sm text-muted-foreground mt-1">{r.completed_story_points} pts {pt("accepted")}</p>}
              </div>
              <div className="flex gap-1 items-start">
                <Button variant="outline" size="sm" className="gap-1" onClick={() => openRecord(r)}><ClipboardCheck className="h-4 w-4 text-indigo-500" /> {pt("Record")}</Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
              </div>
            </CardContent></Card>
          ))}</div>
        )}
      </div>

      {/* Create / edit review */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("New")} {pt("Sprint Review")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          {!editing && <div className="space-y-2"><Label>{pt("Sprint")} *</Label><Select value={form.sprint} onValueChange={(v) => setForm({ ...form, sprint: v })}><SelectTrigger><SelectValue placeholder={pt("Select a sprint")} /></SelectTrigger><SelectContent>{sprints.map(s => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent></Select></div>}
          <div className="space-y-2"><Label>Demo Notes</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.demo_notes} onChange={(e) => setForm({ ...form, demo_notes: e.target.value })} /></div>
          <div className="space-y-2"><Label>Stakeholder Feedback</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.stakeholder_feedback} onChange={(e) => setForm({ ...form, stakeholder_feedback: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>

      {/* Record outcomes: accept (→Done, DoD-gated) / reject (spawns follow-up) */}
      <Dialog open={!!recordFor} onOpenChange={(o) => !o && setRecordFor(null)}><DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle className="flex items-center gap-2"><ClipboardCheck className="h-5 w-5 text-indigo-500" /> {pt("Record Sprint Review")}</DialogTitle><DialogDescription>{pt("Accept completed items (gated on the Definition of Done) or reject them to spawn follow-up work.")}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm"><Checkbox checked={goalAchieved} onCheckedChange={(c) => setGoalAchieved(!!c)} /> {pt("Sprint Goal achieved")}</label>
          <div className="max-h-72 overflow-y-auto rounded-md border divide-y">
            {reviewItems.length === 0 ? <p className="text-sm text-muted-foreground p-3">{pt("No items in this sprint")}</p> :
              reviewItems.map(it => (
                <div key={it.id} className="p-2 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-sm">{it.title}</span>
                    {it.story_points != null && <Badge variant="secondary">{it.story_points}</Badge>}
                    <Button size="sm" variant={decision[it.id] === "accept" ? "default" : "outline"} className="h-7 px-2" onClick={() => setDecision(d => ({ ...d, [it.id]: d[it.id] === "accept" ? "" : "accept" }))}><ThumbsUp className="h-3.5 w-3.5" /></Button>
                    <Button size="sm" variant={decision[it.id] === "reject" ? "destructive" : "outline"} className="h-7 px-2" onClick={() => setDecision(d => ({ ...d, [it.id]: d[it.id] === "reject" ? "" : "reject" }))}><ThumbsDown className="h-3.5 w-3.5" /></Button>
                  </div>
                  {decision[it.id] === "reject" && <Input placeholder={pt("Reason / follow-up note")} value={reasons[it.id] || ""} onChange={(e) => setReasons(r => ({ ...r, [it.id]: e.target.value }))} className="h-8 text-sm" />}
                </div>
              ))}
          </div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setRecordFor(null)}>{pt("Cancel")}</Button><Button onClick={handleRecord} disabled={recording}>{recording && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Record Review")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default ScrumSprintReview;
