import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, BookOpen, FileText, ClipboardList, History } from "lucide-react";
import { toast } from "sonner";

const Prince2LessonsLog = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [lessons, setLessons] = useState<any[]>([]);
  const [priorLessons, setPriorLessons] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [lessonDialog, setLessonDialog] = useState(false);
  const [editingLesson, setEditingLesson] = useState<any>(null);
  const [lessonForm, setLessonForm] = useState({ title: "", description: "", category: "process", lesson_type: "positive", recommendation: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const lRes = await fetch(`/api/v1/projects/${id}/prince2/lessons/`, { headers });
      if (lRes.ok) { const d = await lRes.json(); setLessons(Array.isArray(d) ? d : d.results || []); }
      const pRes = await fetch(`/api/v1/projects/${id}/prince2/lessons/prior_lessons/`, { headers });
      if (pRes.ok) { const d = await pRes.json(); setPriorLessons(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const openCreateLesson = () => { setEditingLesson(null); setLessonForm({ title: "", description: "", category: "process", lesson_type: "positive", recommendation: "" }); setLessonDialog(true); };
  const openEditLesson = (l: any) => { setEditingLesson(l); setLessonForm({ title: l.title || "", description: l.description || "", category: l.category || "process", lesson_type: l.lesson_type || "positive", recommendation: l.recommendation || "" }); setLessonDialog(true); };

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

  const [compiling, setCompiling] = useState(false);
  const compileReport = async () => {
    setCompiling(true);
    try {
      const r = await fetch(`/api/v1/projects/${id}/prince2/lessons/compile_report/`, { method: "POST", headers: jsonHeaders });
      if (r.ok) { const d = await r.json(); toast.success(pt("Lessons Report compiled") + ` (${d.lessons_count ?? 0})`); }
      else { const d = await r.json().catch(() => null); toast.error(d?.detail || pt("Compile failed")); }
    } catch { toast.error(pt("Compile failed")); } finally { setCompiling(false); }
  };

  const deleteLesson = async (lId: number) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    try {
      const r = await fetch(`/api/v1/projects/${id}/prince2/lessons/${lId}/`, { method: "DELETE", headers });
      if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
    } catch { toast.error(pt("Delete failed")); }
  };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  const positiveCount = lessons.filter((l) => l.lesson_type === "positive").length;
  const negativeCount = lessons.filter((l) => l.lesson_type === "negative").length;

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold">{pt("Lessons Log")}</h1>
              <p className="text-sm text-muted-foreground">{lessons.length} {pt("lessons recorded")} — {positiveCount} {pt("Positive")} / {negativeCount} {pt("Negative")}</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate(`/projects/${id}/monitoring/lessons-surveys`)} className="gap-1" title={pt("Capture lessons through a lessons-learned survey; survey insights feed into the compiled Lessons Report")}><ClipboardList className="h-4 w-4" /> {pt("Lessons-learned survey")}</Button>
            <Button variant="outline" onClick={compileReport} disabled={compiling || lessons.length === 0} className="gap-1" title={pt("Compile a Lessons Report from the log + survey insights (required for closure)")}>{compiling ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />} {pt("Compile Report")}</Button>
            <Button onClick={openCreateLesson} className="gap-1"><Plus className="h-4 w-4" /> {pt("Add")}</Button>
          </div>
        </div>

        <Card>
          <CardHeader><CardTitle>{pt("Lessons Log")} ({lessons.length})</CardTitle></CardHeader>
          <CardContent>
            {lessons.length === 0 ? <p className="text-muted-foreground text-center py-8">{pt("No lessons recorded yet")}</p> : (
              <div className="space-y-2">{lessons.map((l) => (
                <div key={l.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant={l.lesson_type === "positive" ? "default" : "destructive"} className="text-xs">{l.lesson_type}</Badge>
                      <Badge variant="outline" className="text-xs">{l.category}</Badge>
                    </div>
                    <p className="font-medium">{l.title}</p>
                    {l.description && <p className="text-sm text-muted-foreground mt-1">{l.description}</p>}
                    {l.recommendation && <p className="text-sm mt-2"><span className="font-semibold">{pt("Recommendation")}:</span> {l.recommendation}</p>}
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

        {priorLessons.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base"><History className="h-4 w-4 text-muted-foreground" /> {pt("Prior lessons to apply")} ({priorLessons.length})</CardTitle>
              <p className="text-xs text-muted-foreground">{pt("Lessons from earlier projects and lessons-learned surveys — PRINCE2 'Learn from experience' (review before planning).")}</p>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">{priorLessons.map((p, i) => (
                <div key={i} className="flex items-start gap-2 p-2 border rounded-md">
                  <Badge variant={p.source === "survey" ? "secondary" : "outline"} className="text-[10px] mt-0.5 shrink-0">{p.source === "survey" ? pt("Survey") : pt("Project log")}</Badge>
                  <div className="min-w-0">
                    <p className="text-sm">{p.title}</p>
                    {(p.project_name || p.survey_name) && <p className="text-[11px] text-muted-foreground">{p.survey_name || p.project_name}</p>}
                  </div>
                </div>
              ))}</div>
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={lessonDialog} onOpenChange={setLessonDialog}>
        <DialogContent><DialogHeader><DialogTitle>{editingLesson ? pt("Edit") : pt("Add")} {pt("Lesson")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={lessonForm.title} onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={lessonForm.description} onChange={(e) => setLessonForm({ ...lessonForm, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Type")}</Label><Select value={lessonForm.lesson_type} onValueChange={(v) => setLessonForm({ ...lessonForm, lesson_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="positive">{pt("Positive")}</SelectItem><SelectItem value="negative">{pt("Negative")}</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>{pt("Category")}</Label><Select value={lessonForm.category} onValueChange={(v) => setLessonForm({ ...lessonForm, category: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="process">{pt("Process")}</SelectItem><SelectItem value="technology">{pt("Technology")}</SelectItem><SelectItem value="people">{pt("People")}</SelectItem></SelectContent></Select></div>
            </div>
            <div className="space-y-2"><Label>{pt("Recommendation")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={lessonForm.recommendation} onChange={(e) => setLessonForm({ ...lessonForm, recommendation: e.target.value })} /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setLessonDialog(false)}>{pt("Cancel")}</Button><Button onClick={saveLesson}>{pt("Save")}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prince2LessonsLog;
