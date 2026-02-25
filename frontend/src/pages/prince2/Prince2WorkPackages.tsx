import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Package, Play, CheckCircle2, Trash2, Pencil } from "lucide-react";
import { toast } from "sonner";

const Prince2WorkPackages = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [workPackages, setWorkPackages] = useState<any[]>([]);
  const [stages, setStages] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", description: "", stage: "", priority: "medium" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [wpRes, stRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/prince2/work-packages/`, { headers }),
        fetch(`/api/v1/projects/${id}/prince2/stages/`, { headers }),
      ]);
      if (wpRes.ok) {
        const data = await wpRes.json();
        setWorkPackages(Array.isArray(data) ? data : data.results || []);
      }
      if (stRes.ok) {
        const data = await stRes.json();
        setStages(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", description: "", stage: stages[0]?.id?.toString() || "", priority: "medium" });
    setDialogOpen(true);
  };

  const openEdit = (wp: any) => {
    setEditing(wp);
    setForm({ title: wp.title, description: wp.description || "", stage: wp.stage?.toString() || "", priority: wp.priority || "medium" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error(pt("Title is required")); return; }
    setSubmitting(true);
    try {
      const body: any = { title: form.title, description: form.description, priority: form.priority };
      if (form.stage) body.stage = parseInt(form.stage);
      const url = editing ? `/api/v1/projects/${id}/prince2/work-packages/${editing.id}/` : `/api/v1/projects/${id}/prince2/work-packages/`;
      const method = editing ? "PATCH" : "POST";
      const response = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (response.ok) {
        toast.success(editing ? pt("Updated") : pt("Created"));
        setDialogOpen(false);
        fetchData();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.error || pt("Save failed"));
      }
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleAction = async (wpId: number, action: string) => {
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/work-packages/${wpId}/${action}/`, {
        method: "POST", headers: jsonHeaders,
      });
      if (response.ok) { toast.success(pt("Action completed")); fetchData(); }
      else toast.error(pt("Action failed"));
    } catch { toast.error(pt("Action failed")); }
  };

  const handleDelete = async (wpId: number) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/work-packages/${wpId}/`, { method: "DELETE", headers });
      if (response.ok || response.status === 204) { toast.success(pt("Deleted")); fetchData(); }
      else toast.error(pt("Delete failed"));
    } catch { toast.error(pt("Delete failed")); }
  };

  const statusColors: Record<string, string> = {
    pending: "bg-gray-100 text-gray-700", authorized: "bg-blue-100 text-blue-700",
    in_progress: "bg-amber-100 text-amber-700", completed: "bg-green-100 text-green-700",
  };

  if (loading) return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </div>
  );

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold">{pt("Work Packages")}</h1>
            <Badge variant="outline">{workPackages.length}</Badge>
          </div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Create")}</Button>
        </div>

        {workPackages.length === 0 ? (
          <Card className="p-8 text-center">
            <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No work packages yet")}</h3>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> {pt("Create")}</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {workPackages.map((wp) => (
              <Card key={wp.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-mono text-muted-foreground">{wp.reference}</span>
                      <Badge className={`text-xs ${statusColors[wp.status] || ""}`}>{wp.status}</Badge>
                      {wp.priority && <Badge variant="outline" className="text-xs">{wp.priority}</Badge>}
                    </div>
                    <p className="font-medium">{wp.title}</p>
                    {wp.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-1">{wp.description}</p>}
                    <div className="flex items-center gap-2 mt-2">
                      <Progress value={wp.progress_percentage || 0} className="h-1.5 w-32" />
                      <span className="text-xs text-muted-foreground">{wp.progress_percentage || 0}%</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 ml-4">
                    {wp.status === "pending" && (
                      <Button variant="ghost" size="sm" onClick={() => handleAction(wp.id, "authorize")} title="Authorize">
                        <CheckCircle2 className="h-4 w-4 text-blue-500" />
                      </Button>
                    )}
                    {wp.status === "authorized" && (
                      <Button variant="ghost" size="sm" onClick={() => handleAction(wp.id, "start")} title="Start">
                        <Play className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    {wp.status === "in_progress" && (
                      <Button variant="ghost" size="sm" onClick={() => handleAction(wp.id, "complete")} title="Complete">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </Button>
                    )}
                    <Button variant="ghost" size="sm" onClick={() => openEdit(wp)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(wp.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Create")} {pt("Work Package")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            {stages.length > 0 && (
              <div className="space-y-2">
                <Label>Stage</Label>
                <Select value={form.stage} onValueChange={(v) => setForm({ ...form, stage: v })}>
                  <SelectTrigger><SelectValue placeholder="Select stage" /></SelectTrigger>
                  <SelectContent>{stages.map((s: any) => <SelectItem key={s.id} value={s.id.toString()}>{s.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-2">
              <Label>{pt("Priority")}</Label>
              <Select value={form.priority} onValueChange={(v) => setForm({ ...form, priority: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prince2WorkPackages;
