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
import { Loader2, Save, Eye, Plus, Pencil, Trash2, Target } from "lucide-react";
import { toast } from "sonner";

const AgileProductVision = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [vision, setVision] = useState<any>(null);
  const [goals, setGoals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [goalDialog, setGoalDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [visionForm, setVisionForm] = useState({ vision_statement: "", target_audience: "", problem_statement: "", unique_value_proposition: "" });
  const [goalForm, setGoalForm] = useState({ title: "", description: "", target_date: "", priority: "medium", status: "planned" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [vRes, gRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/agile/vision/`, { headers }),
        fetch(`/api/v1/projects/${id}/agile/goals/`, { headers }),
      ]);
      if (vRes.ok) { const d = await vRes.json(); setVision(d); setVisionForm({ vision_statement: d.vision_statement || "", target_audience: d.target_audience || "", problem_statement: d.problem_statement || "", unique_value_proposition: d.unique_value_proposition || "" }); }
      if (gRes.ok) { const d = await gRes.json(); setGoals(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const saveVision = async () => { setSaving(true); try { const r = await fetch(`/api/v1/projects/${id}/agile/vision/`, { method: "PUT", headers: jsonHeaders, body: JSON.stringify(visionForm) }); if (r.ok) { setVision(await r.json()); toast.success("Vision opgeslagen"); } else toast.error("Opslaan mislukt"); } catch { toast.error("Opslaan mislukt"); } finally { setSaving(false); } };

  const openCreateGoal = () => { setEditingGoal(null); setGoalForm({ title: "", description: "", target_date: "", priority: "medium", status: "planned" }); setGoalDialog(true); };
  const openEditGoal = (g: any) => { setEditingGoal(g); setGoalForm({ title: g.title || "", description: g.description || "", target_date: g.target_date?.split("T")[0] || "", priority: g.priority || "medium", status: g.status || "planned" }); setGoalDialog(true); };
  const saveGoal = async () => { if (!goalForm.title) { toast.error("Titel verplicht"); return; } try { const url = editingGoal ? `/api/v1/projects/${id}/agile/goals/${editingGoal.id}/` : `/api/v1/projects/${id}/agile/goals/`; const method = editingGoal ? "PATCH" : "POST"; const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(goalForm) }); if (r.ok) { toast.success("Opgeslagen"); setGoalDialog(false); fetchData(); } else toast.error("Opslaan mislukt"); } catch { toast.error("Opslaan mislukt"); } };
  const deleteGoal = async (gId: number) => { if (!confirm("Verwijderen?")) return; try { const r = await fetch(`/api/v1/projects/${id}/agile/goals/${gId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success("Verwijderd"); fetchData(); } } catch { toast.error("Verwijderen mislukt"); } };

  const Field = ({ label, field }: { label: string; field: string }) => (<div className="space-y-2"><Label>{label}</Label><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background resize-y" value={(visionForm as any)[field] || ""} onChange={(e) => setVisionForm({ ...visionForm, [field]: e.target.value })} /></div>);

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Eye className="h-6 w-6 text-indigo-500" /><h1 className="text-2xl font-bold">{pt("Product Vision")}</h1></div>
          <Button onClick={saveVision} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {pt("Save")}</Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardHeader><CardTitle>Vision</CardTitle></CardHeader><CardContent className="space-y-4"><Field label="Vision Statement" field="vision_statement" /><Field label={pt("Unique Value Proposition")} field="unique_value_proposition" /></CardContent></Card>
          <Card><CardHeader><CardTitle>Target & Problem</CardTitle></CardHeader><CardContent className="space-y-4"><Field label={pt("Target Audience")} field="target_audience" /><Field label={pt("Problem Statement")} field="problem_statement" /></CardContent></Card>
        </div>

        <Card><CardHeader className="flex flex-row items-center justify-between"><CardTitle className="flex items-center gap-2"><Target className="h-5 w-5" /> {pt("Product Goals")} ({goals.length})</CardTitle><Button size="sm" onClick={openCreateGoal}><Plus className="h-4 w-4 mr-1" /> {pt("Add")}</Button></CardHeader>
          <CardContent>{goals.length === 0 ? <p className="text-muted-foreground text-center py-4">No goals yet</p> : (
            <div className="space-y-2">{goals.map(g => (
              <div key={g.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div><p className="font-medium">{g.title}</p>{g.description && <p className="text-sm text-muted-foreground">{g.description}</p>}<div className="flex gap-2 mt-1"><Badge variant={g.status === "achieved" ? "default" : "outline"}>{g.status}</Badge>{g.target_date && <span className="text-xs text-muted-foreground">{g.target_date}</span>}</div></div>
                <div className="flex gap-1"><Button variant="ghost" size="sm" onClick={() => openEditGoal(g)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => deleteGoal(g.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></div>
              </div>
            ))}</div>
          )}</CardContent>
        </Card>
      </div>
      <Dialog open={goalDialog} onOpenChange={setGoalDialog}><DialogContent><DialogHeader><DialogTitle>{editingGoal ? pt("Edit") : pt("Add")} Goal</DialogTitle><DialogDescription>{editingGoal ? pt("Edit goal details") : pt("Add a new goal")}</DialogDescription></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={goalForm.title} onChange={(e) => setGoalForm({ ...goalForm, title: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={goalForm.description} onChange={(e) => setGoalForm({ ...goalForm, description: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Target Date")}</Label><Input type="date" value={goalForm.target_date} onChange={(e) => setGoalForm({ ...goalForm, target_date: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setGoalDialog(false)}>{pt("Cancel")}</Button><Button onClick={saveGoal}>{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default AgileProductVision;
