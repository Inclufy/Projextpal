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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save, Plus, Pencil, Trash2, FileCheck, BookOpen, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const Prince2ProjectClosure = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [endReport, setEndReport] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [lessonDialog, setLessonDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [lessonForm, setLessonForm] = useState({ title: "", description: "", category: "process", lesson_type: "positive", recommendations: "" });
  const [reportForm, setReportForm] = useState({ achievements_summary: "", performance_review: "", lessons_summary: "", follow_on_actions: "", handover_details: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [erRes, lRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/prince2/end-project-report/`, { headers }),
        fetch(`/api/v1/projects/${id}/prince2/lessons/`, { headers }),
      ]);
      if (erRes.ok) {
        const d = await erRes.json();
        const list = Array.isArray(d) ? d : d.results || [];
        if (list.length > 0) {
          setEndReport(list[0]);
          const r = list[0];
          setReportForm({
            achievements_summary: r.achievements_summary || "", performance_review: r.performance_review || "",
            lessons_summary: r.lessons_summary || "", follow_on_actions: r.follow_on_actions || "", handover_details: r.handover_details || "",
          });
        }
      }
      if (lRes.ok) { const d = await lRes.json(); setLessons(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const saveReport = async () => {
    setSaving(true);
    try {
      const url = endReport ? `/api/v1/projects/${id}/prince2/end-project-report/${endReport.id}/` : `/api/v1/projects/${id}/prince2/end-project-report/`;
      const method = endReport ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(reportForm) });
      if (r.ok) { setEndReport(await r.json()); toast.success(pt("Saved")); if (!endReport) fetchData(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSaving(false); }
  };

  const approveReport = async () => {
    if (!endReport) return;
    try {
      const r = await fetch(`/api/v1/projects/${id}/prince2/end-project-report/${endReport.id}/approve/`, { method: "POST", headers: jsonHeaders });
      if (r.ok) { toast.success(pt("Approved")); fetchData(); }
    } catch { toast.error(pt("Action failed")); }
  };

  const openCreateLesson = () => { setEditingLesson(null); setLessonForm({ title: "", description: "", category: "process", lesson_type: "positive", recommendations: "" }); setLessonDialog(true); };
  const openEditLesson = (l: any) => { setEditingLesson(l); setLessonForm({ title: l.title || "", description: l.description || "", category: l.category || "process", lesson_type: l.lesson_type || "positive", recommendations: l.recommendations || "" }); setLessonDialog(true); };

  const saveLesson = async () => {
    if (!lessonForm.title) { toast.error(pt("Title is required")); return; }
    try {
      const url = editingLesson ? `/api/v1/projects/${id}/prince2/lessons/${editingLesson.id}/` : `/api/v1/projects/${id}/prince2/lessons/`;
      const method = editingLesson ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(lessonForm) });
      if (r.ok) { toast.success(pt("Saved")); setLessonDialog(false); fetchData(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
  };

  const deleteLesson = async (lId: number) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    try {
      const r = await fetch(`/api/v1/projects/${id}/prince2/lessons/${lId}/`, { method: "DELETE", headers });
      if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
    } catch { toast.error(pt("Delete failed")); }
  };

  const Field = ({ label, field }: { label: string; field: string }) => (
    <div className="space-y-2"><Label>{label}</Label><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background resize-y" value={(reportForm as any)[field] || ""} onChange={(e) => setReportForm({ ...reportForm, [field]: e.target.value })} /></div>
  );

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        {/* End Project Report */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><FileCheck className="h-6 w-6 text-green-500" /><div><h1 className="text-2xl font-bold">{pt("End Project Report")}</h1>{endReport && <Badge className="mt-1">{endReport.status}</Badge>}</div></div>
          <div className="flex gap-2">
            {endReport && endReport.status !== "approved" && <Button variant="outline" onClick={approveReport} className="gap-2 text-green-600"><CheckCircle2 className="h-4 w-4" /> {pt("Approve")}</Button>}
            <Button onClick={saveReport} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {pt("Save")}</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardHeader><CardTitle>{pt("Achievements Summary")}</CardTitle></CardHeader><CardContent><Field label={pt("Achievements Summary")} field="achievements_summary" /><Field label={pt("Performance Against Plan")} field="performance_review" /></CardContent></Card>
          <Card><CardHeader><CardTitle>{pt("Closure Details")}</CardTitle></CardHeader><CardContent><Field label={pt("Lessons Summary")} field="lessons_summary" /><Field label={pt("Follow-on Actions")} field="follow_on_actions" /><Field label="Handover Details" field="handover_details" /></CardContent></Card>
        </div>

        {/* Lessons Log */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><BookOpen className="h-5 w-5 text-blue-500" /> {pt("Lessons Log")} ({lessons.length})</CardTitle>
            <Button size="sm" onClick={openCreateLesson} className="gap-1"><Plus className="h-4 w-4" /> {pt("Add")}</Button>
          </CardHeader>
          <CardContent>
            {lessons.length === 0 ? <p className="text-muted-foreground text-center py-4">No lessons recorded yet</p> : (
              <div className="space-y-2">{lessons.map((l) => (
                <div key={l.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={l.lesson_type === "positive" ? "default" : "destructive"} className="text-xs">{l.lesson_type === "positive" ? "✅" : "⚠️"} {l.lesson_type}</Badge>
                      <Badge variant="outline" className="text-xs">{l.category}</Badge>
                    </div>
                    <p className="font-medium">{l.title}</p>
                    {l.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{l.description}</p>}
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => openEditLesson(l)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => deleteLesson(l.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}</div>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={lessonDialog} onOpenChange={setLessonDialog}>
        <DialogContent><DialogHeader><DialogTitle>{editingLesson ? pt("Edit") : pt("Add")} {pt("Lesson")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Type</Label><Select value={lessonForm.lesson_type} onValueChange={(v) => setLessonForm({ ...lessonForm, lesson_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="positive">{pt("Positive")}</SelectItem><SelectItem value="negative">{pt("Negative")}</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>{pt("Category")}</Label><Select value={lessonForm.category} onValueChange={(v) => setLessonForm({ ...lessonForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="process">{pt("Process")}</SelectItem><SelectItem value="technology">{pt("Technology")}</SelectItem><SelectItem value="people">{pt("People")}</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>Recommendations</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={lessonForm.recommendations} onChange={(e) => setLessonForm({ ...lessonForm, recommendations: e.target.value })} /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setLessonDialog(false)}>{pt("Cancel")}</Button><Button onClick={saveLesson}>{pt("Save")}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prince2ProjectClosure;
