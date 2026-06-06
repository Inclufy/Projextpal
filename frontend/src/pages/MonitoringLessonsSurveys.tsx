import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportExportMenu } from "@/components/ReportExportMenu";
import { AIDraftButton } from "@/components/AIDraftButton";
import { Plus, Pencil, Trash2, Loader2, Lightbulb, ThumbsUp, ThumbsDown, Minus } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const CATEGORIES: [string, string][] = [["Process", "Process"], ["Technical", "Technical"], ["Stakeholder", "Stakeholder"], ["Resource", "Resource"], ["Communication", "Communication"], ["Risk", "Risk"], ["Quality", "Quality"], ["Schedule", "Schedule"], ["Cost", "Cost"], ["Other", "Other"]];
const SENTIMENTS: [string, string][] = [["positive", "Positive (what worked)"], ["negative", "Negative (what didn't)"], ["neutral", "Neutral (observation)"]];
const APPLICABILITY: [string, string][] = [["project", "This project only"], ["portfolio", "Portfolio-wide"], ["organisation", "Organisation-wide"]];
const emptyForm = { title: "", description: "", category: "Process", sentiment: "neutral", recommended_action: "", applicable_to: "project", captured_during_phase: "" };

const MonitoringLessonsSurveys = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const BASE = "/api/v1/projects/lessons/";

  const fetchData = async () => {
    try {
      const r = await fetch(`${BASE}?project=${id}`, { headers });
      if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setDialogOpen(true); };
  const openEdit = (it: any) => {
    setEditing(it);
    setForm({ title: it.title || "", description: it.description || "", category: it.category || "Process", sentiment: it.sentiment || "neutral", recommended_action: it.recommended_action || "", applicable_to: it.applicable_to || "project", captured_during_phase: it.captured_during_phase || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.description) { toast.error(pt("Title and description are required")); return; }
    setSubmitting(true);
    try {
      const body: any = { project: Number(id), ...form };
      const url = editing ? `${BASE}${editing.id}/` : BASE;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else { const d = await r.json().catch(() => ({})); toast.error(d.detail || JSON.stringify(d).slice(0, 120) || pt("Save failed")); }
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (lid: any) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    const r = await fetch(`${BASE}${lid}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
  };

  const label = (arr: [string, string][], v: string) => arr.find(([k]) => k === v)?.[1] || v;
  const sentIcon = (s: string) => s === "positive" ? <ThumbsUp className="h-3.5 w-3.5 text-green-600" /> : s === "negative" ? <ThumbsDown className="h-3.5 w-3.5 text-red-600" /> : <Minus className="h-3.5 w-3.5 text-gray-500" />;
  const exportSections = [{ heading: "Lessons Learned", rows: items.map((l) => [l.title, `${l.category} · ${label(SENTIMENTS, l.sentiment)}${l.recommended_action ? " · " + l.recommended_action : ""}`]) as [string, any][] }];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Lightbulb className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold">{pt("Lessons Learned")}</h1>
            <Badge variant="outline">{items.length}</Badge>
          </div>
          <div className="flex gap-2">
            <AIDraftButton
              draftUrl={`/api/v1/projects/${id}/ai/draft-lessons/`}
              createUrl={BASE}
              buildPayload={(d) => ({ project: Number(id), title: d.title, description: d.description, category: d.category, sentiment: d.sentiment, recommended_action: d.recommended_action })}
              renderItem={(d) => (<span><span className="font-medium">{d.title}</span> <span className="text-xs text-muted-foreground">· {d.category}</span></span>)}
              onDone={fetchData}
              label={pt("AI Suggest")}
              title={pt("Suggested lessons from closed issues & risks")}
            />
            {items.length > 0 && <ReportExportMenu title="Lessons Learned" sections={exportSections} />}
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />{pt("Add Lesson")}</Button>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="p-8 text-center">
            <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No lessons captured yet")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{pt("Capture what worked, what didn't, and recommended actions for future projects.")}</p>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{pt("Add Lesson")}</Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {items.map((l) => (
              <Card key={l.id}><CardContent className="p-4 flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    {sentIcon(l.sentiment)}
                    <span className="font-medium">{l.title}</span>
                    <Badge variant="outline" className="text-xs">{l.category}</Badge>
                    {l.applicable_to && l.applicable_to !== "project" && <Badge variant="secondary" className="text-xs">{label(APPLICABILITY, l.applicable_to)}</Badge>}
                    {l.captured_during_phase && <span className="text-xs text-muted-foreground">{l.captured_during_phase}</span>}
                  </div>
                  {l.description && <p className="text-sm text-muted-foreground">{l.description}</p>}
                  {l.recommended_action && <p className="text-sm mt-1"><span className="font-medium">{pt("Action")}:</span> {l.recommended_action}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(l)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? pt("Edit Lesson") : pt("Add Lesson")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Title")}</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Category")}</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{pt("Sentiment")}</Label>
                <Select value={form.sentiment} onValueChange={(v) => setForm({ ...form, sentiment: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SENTIMENTS.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>{pt("Recommended Action")}</Label><textarea className="w-full min-h-[50px] px-3 py-2 border rounded-md bg-background" value={form.recommended_action} onChange={(e) => setForm({ ...form, recommended_action: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Applicable To")}</Label>
                <Select value={form.applicable_to} onValueChange={(v) => setForm({ ...form, applicable_to: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{APPLICABILITY.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{pt("Phase")}</Label><Input value={form.captured_during_phase} onChange={(e) => setForm({ ...form, captured_during_phase: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting || !form.title || !form.description}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MonitoringLessonsSurveys;
