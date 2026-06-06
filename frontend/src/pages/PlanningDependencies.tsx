import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReportExportMenu } from "@/components/ReportExportMenu";
import { Pencil, Loader2, GitBranch, ArrowRight, Check } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const PlanningDependencies = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [selected, setSelected] = useState<number[]>([]);
  const [submitting, setSubmitting] = useState(false);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const BASE = "/api/v1/projects/tasks/";

  const fetchData = async () => {
    try {
      const r = await fetch(`${BASE}?project=${id}`, { headers });
      if (r.ok) { const d = await r.json(); setTasks(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const openEdit = (t: any) => {
    setEditing(t);
    setSelected((t.depends_on || []).map((x: any) => typeof x === "object" ? x.id : x));
    setDialogOpen(true);
  };

  const toggle = (tid: number) => setSelected((cur) => cur.includes(tid) ? cur.filter((x) => x !== tid) : [...cur, tid]);

  const handleSave = async () => {
    if (!editing) return;
    setSubmitting(true);
    try {
      const r = await fetch(`${BASE}${editing.id}/`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ depends_on: selected }) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else { const d = await r.json().catch(() => ({})); toast.error(d.detail || JSON.stringify(d).slice(0, 120) || pt("Save failed")); }
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const taskName = (tid: any) => tasks.find((t) => t.id === (typeof tid === "object" ? tid.id : tid))?.title || `#${tid}`;
  const deps = (t: any) => (t.depends_on || []).map((x: any) => typeof x === "object" ? x.id : x);
  const withDeps = tasks.filter((t) => deps(t).length > 0);
  const exportSections = [{ heading: "Task dependencies", rows: withDeps.map((t) => [t.title, "depends on: " + deps(t).map(taskName).join(", ")]) as [string, any][] }];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <GitBranch className="h-6 w-6 text-violet-500" />
            <div>
              <h1 className="text-2xl font-bold">{pt("Dependencies")}</h1>
              <p className="text-sm text-muted-foreground">{pt("Define which tasks must finish before others can start.")}</p>
            </div>
          </div>
          {withDeps.length > 0 && <ReportExportMenu title="Dependencies" sections={exportSections} />}
        </div>

        {tasks.length === 0 ? (
          <Card className="p-8 text-center">
            <GitBranch className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No tasks yet")}</h3>
            <p className="text-sm text-muted-foreground">{pt("Create tasks first, then link their dependencies here.")}</p>
          </Card>
        ) : (
          <div className="space-y-2">
            {tasks.map((t) => {
              const d = deps(t);
              return (
                <Card key={t.id}><CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{t.title}</span>
                      {d.length > 0 ? (
                        <span className="text-xs text-muted-foreground flex items-center gap-1 flex-wrap">
                          <ArrowRight className="h-3 w-3" />{pt("after")}:
                          {d.map((x: number) => <Badge key={x} variant="secondary" className="text-xs">{taskName(x)}</Badge>)}
                        </span>
                      ) : <span className="text-xs text-muted-foreground">{pt("No dependencies")}</span>}
                    </div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                </CardContent></Card>
              );
            })}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{pt("Dependencies for")}: {editing?.title}</DialogTitle></DialogHeader>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">{pt("Select the tasks that must complete before this one can start.")}</p>
            <div className="space-y-1 max-h-[50vh] overflow-y-auto">
              {tasks.filter((t) => t.id !== editing?.id).map((t) => {
                const on = selected.includes(t.id);
                return (
                  <button key={t.id} onClick={() => toggle(t.id)} className={`w-full flex items-center gap-2 px-3 py-2 rounded-md border text-left text-sm ${on ? "bg-violet-50 border-violet-300" : "hover:bg-muted"}`}>
                    <span className={`h-4 w-4 rounded border flex items-center justify-center ${on ? "bg-violet-500 border-violet-500" : "border-muted-foreground"}`}>{on && <Check className="h-3 w-3 text-white" />}</span>
                    {t.title}
                  </button>
                );
              })}
              {tasks.filter((t) => t.id !== editing?.id).length === 0 && <p className="text-sm text-muted-foreground py-4 text-center">{pt("No other tasks to depend on.")}</p>}
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanningDependencies;
