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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, MessagesSquare, Trash2, Star, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const AgileStakeholderFeedback = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [feedback, setFeedback] = useState<any[]>([]);
  const [iterations, setIterations] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    iteration: "", backlog_item: "", stakeholder_name: "", stakeholder_role: "",
    sentiment: "positive", rating: "", feedback: "", follow_up_action: "",
  });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [fRes, itRes, biRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/agile/stakeholder-feedback/`, { headers }),
        fetch(`/api/v1/projects/${id}/agile/iterations/`, { headers }),
        fetch(`/api/v1/projects/${id}/agile/backlog/`, { headers }),
      ]);
      if (fRes.ok) { const d = await fRes.json(); setFeedback(Array.isArray(d) ? d : d.results || []); }
      if (itRes.ok) { const d = await itRes.json(); setIterations(Array.isArray(d) ? d : d.results || []); }
      if (biRes.ok) { const d = await biRes.json(); setItems(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const submit = async () => {
    if (!form.iteration || !form.stakeholder_name || !form.feedback) {
      toast.error("Iteratie, naam en feedback verplicht"); return;
    }
    setSubmitting(true);
    try {
      const body: any = {
        iteration: parseInt(form.iteration),
        stakeholder_name: form.stakeholder_name,
        stakeholder_role: form.stakeholder_role,
        sentiment: form.sentiment,
        feedback: form.feedback,
        follow_up_action: form.follow_up_action,
      };
      if (form.backlog_item) body.backlog_item = parseInt(form.backlog_item);
      if (form.rating) body.rating = parseInt(form.rating);
      const r = await fetch(`/api/v1/projects/${id}/agile/stakeholder-feedback/`, {
        method: "POST", headers: jsonHeaders, body: JSON.stringify(body),
      });
      if (r.ok) {
        toast.success("Feedback vastgelegd"); setDialogOpen(false);
        setForm({ iteration: "", backlog_item: "", stakeholder_name: "", stakeholder_role: "", sentiment: "positive", rating: "", feedback: "", follow_up_action: "" });
        fetchData();
      } else {
        const err = await r.json().catch(() => null);
        toast.error(err?.detail || err?.iteration?.[0] || "Opslaan mislukt");
      }
    } catch { toast.error("Opslaan mislukt"); }
    finally { setSubmitting(false); }
  };

  const resolveFollowUp = async (fid: number) => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/agile/stakeholder-feedback/${fid}/`, {
        method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ follow_up_done: true }),
      });
      if (r.ok) { toast.success("Actie afgerond"); fetchData(); }
      else toast.error("Bijwerken mislukt");
    } catch { toast.error("Bijwerken mislukt"); }
  };

  const handleDelete = async (fid: number) => {
    if (!confirm("Verwijderen?")) return;
    try {
      const r = await fetch(`/api/v1/projects/${id}/agile/stakeholder-feedback/${fid}/`, { method: "DELETE", headers });
      if (r.ok || r.status === 204) { toast.success("Verwijderd"); fetchData(); }
    } catch { toast.error("Verwijderen mislukt"); }
  };

  const sentimentColors: Record<string, string> = {
    positive: "bg-green-50 border-green-200 text-green-700",
    neutral: "bg-slate-50 border-slate-200 text-slate-700",
    negative: "bg-red-50 border-red-200 text-red-700",
  };

  const openFollowUps = feedback.filter(f => f.follow_up_action && !f.follow_up_done);

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessagesSquare className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold">{pt("Stakeholder Feedback")}</h1>
            <Badge variant="outline">{feedback.length}</Badge>
          </div>
          <Button onClick={() => setDialogOpen(true)}><Plus className="h-4 w-4 mr-1" />{pt("Record Feedback")}</Button>
        </div>

        {openFollowUps.length > 0 && (
          <Card className="p-4 border-amber-200 bg-amber-50/40">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle2 className="h-4 w-4 text-amber-600" />
              <h3 className="font-semibold">{pt("Open Follow-up Actions")}</h3>
              <Badge variant="outline">{openFollowUps.length}</Badge>
            </div>
            <div className="space-y-2">
              {openFollowUps.map(f => (
                <div key={f.id} className="flex items-center justify-between gap-3 p-2 rounded border bg-background">
                  <div className="min-w-0">
                    <p className="text-sm truncate">{f.follow_up_action}</p>
                    <p className="text-xs text-muted-foreground">{f.stakeholder_name} · {f.iteration_name}</p>
                  </div>
                  <Button variant="outline" size="sm" onClick={() => resolveFollowUp(f.id)}>{pt("Mark done")}</Button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {feedback.length === 0 ? (
          <Card className="p-8 text-center">
            <MessagesSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">{pt("No feedback yet")}</h3>
            <p className="text-muted-foreground">{pt("Capture what stakeholders think of shipped work each iteration")}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {feedback.map(f => (
              <Card key={f.id}><CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <span className="font-medium">{f.stakeholder_name}</span>
                      {f.stakeholder_role && <span className="text-xs text-muted-foreground">· {f.stakeholder_role}</span>}
                      <Badge variant="outline" className={sentimentColors[f.sentiment]}>{f.sentiment_display}</Badge>
                      {f.rating ? <span className="flex items-center gap-0.5 text-xs text-amber-600"><Star className="h-3 w-3 fill-amber-400 text-amber-400" />{f.rating}/5</span> : null}
                    </div>
                    <p className="text-sm">{f.feedback}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {f.iteration_name}{f.backlog_item_title ? ` · ${f.backlog_item_title}` : ""}
                    </p>
                    {f.follow_up_action && (
                      <p className="text-xs mt-2">
                        <span className="font-medium">{pt("Follow-up")}: </span>
                        {f.follow_up_done ? <span className="text-green-600 line-through">{f.follow_up_action}</span> : <span className="text-amber-700">{f.follow_up_action}</span>}
                      </p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(f.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent>
        <DialogHeader>
          <DialogTitle>{pt("Record Stakeholder Feedback")}</DialogTitle>
          <DialogDescription>{pt("Capture feedback on shipped work for an iteration")}</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>{pt("Iteration")} *</Label>
            <Select value={form.iteration} onValueChange={(v) => setForm({ ...form, iteration: v })}>
              <SelectTrigger><SelectValue placeholder={pt("Select iteration")} /></SelectTrigger>
              <SelectContent>{iterations.map(it => <SelectItem key={it.id} value={it.id.toString()}>{it.name}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>{pt("Shipped item")} ({pt("optional")})</Label>
            <Select value={form.backlog_item} onValueChange={(v) => setForm({ ...form, backlog_item: v })}>
              <SelectTrigger><SelectValue placeholder={pt("Select item")} /></SelectTrigger>
              <SelectContent>{items.map(bi => <SelectItem key={bi.id} value={bi.id.toString()}>{bi.title}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2"><Label>{pt("Stakeholder")} *</Label><Input value={form.stakeholder_name} onChange={(e) => setForm({ ...form, stakeholder_name: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Role")}</Label><Input value={form.stakeholder_role} onChange={(e) => setForm({ ...form, stakeholder_role: e.target.value })} /></div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label>{pt("Sentiment")}</Label>
              <Select value={form.sentiment} onValueChange={(v) => setForm({ ...form, sentiment: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="positive">{pt("Positive")}</SelectItem>
                  <SelectItem value="neutral">{pt("Neutral")}</SelectItem>
                  <SelectItem value="negative">{pt("Negative")}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{pt("Rating")} (1-5)</Label>
              <Select value={form.rating} onValueChange={(v) => setForm({ ...form, rating: v })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent>{[1, 2, 3, 4, 5].map(n => <SelectItem key={n} value={n.toString()}>{n}</SelectItem>)}</SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2"><Label>{pt("Feedback")} *</Label><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background" value={form.feedback} onChange={(e) => setForm({ ...form, feedback: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Follow-up action")} ({pt("optional")})</Label><Input value={form.follow_up_action} onChange={(e) => setForm({ ...form, follow_up_action: e.target.value })} /></div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
            <Button onClick={submit} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button>
          </div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default AgileStakeholderFeedback;
