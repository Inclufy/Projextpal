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
import { Loader2, Plus, AlertTriangle, Pencil, Trash2, Zap } from "lucide-react";
import { toast } from "sonner";

const Prince2Tolerances = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [tolerances, setTolerances] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ tolerance_type: "time", planned_value: "", actual_value: "", deviation_percentage: "0", is_exceeded: false });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/tolerances/`, { headers });
      if (response.ok) {
        const data = await response.json();
        setTolerances(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const initializeTolerances = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/tolerances/initialize/`, {
        method: "POST", headers: jsonHeaders,
      });
      if (response.ok) { toast.success(pt("Saved")); fetchData(); }
      else toast.error(pt("Action failed"));
    } catch { toast.error(pt("Action failed")); }
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ tolerance_type: "time", planned_value: "", actual_value: "", deviation_percentage: "0", is_exceeded: false });
    setDialogOpen(true);
  };

  const openEdit = (t: any) => {
    setEditing(t);
    setForm({
      tolerance_type: t.tolerance_type || "time",
      planned_value: t.planned_value || "",
      actual_value: t.actual_value || "",
      deviation_percentage: String(t.deviation_percentage || 0),
      is_exceeded: t.is_exceeded || false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const body = { ...form, deviation_percentage: parseFloat(form.deviation_percentage) };
      const url = editing ? `/api/v1/projects/${id}/prince2/tolerances/${editing.id}/` : `/api/v1/projects/${id}/prince2/tolerances/`;
      const method = editing ? "PATCH" : "POST";
      const response = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (response.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (tId: number) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/tolerances/${tId}/`, { method: "DELETE", headers });
      if (response.ok || response.status === 204) { toast.success(pt("Deleted")); fetchData(); }
    } catch { toast.error(pt("Delete failed")); }
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
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold">{pt("Tolerances")}</h1>
            <Badge variant="outline">{tolerances.length}</Badge>
          </div>
          <div className="flex gap-2">
            {tolerances.length === 0 && (
              <Button variant="outline" onClick={initializeTolerances} className="gap-2">
                <Zap className="h-4 w-4" /> Initialize
              </Button>
            )}
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button>
          </div>
        </div>

        {tolerances.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No tolerances defined")}</h3>
            <Button onClick={initializeTolerances} className="gap-2"><Zap className="h-4 w-4" /> Initialize Defaults</Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tolerances.map((t) => (
              <Card key={t.id} className={`${t.is_exceeded ? "border-red-300 bg-red-50/50" : ""}`}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <Badge variant={t.is_exceeded ? "destructive" : "secondary"} className="text-xs capitalize">
                      {t.tolerance_type}
                    </Badge>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span className="text-muted-foreground">{pt("Planned")}:</span><span>{t.planned_value || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{pt("Actual")}:</span><span>{t.actual_value || "-"}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">{pt("Deviation")}:</span>
                      <span className={t.is_exceeded ? "text-red-600 font-bold" : ""}>{t.deviation_percentage || 0}%</span>
                    </div>
                  </div>
                  {t.is_exceeded && (
                    <div className="mt-3 flex items-center gap-1 text-red-600 text-xs">
                      <AlertTriangle className="h-3.5 w-3.5" /> Tolerance exceeded
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} Tolerance</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={form.tolerance_type} onValueChange={(v) => setForm({ ...form, tolerance_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="time">Time</SelectItem>
                  <SelectItem value="cost">Cost</SelectItem>
                  <SelectItem value="quality">Quality</SelectItem>
                  <SelectItem value="scope">Scope</SelectItem>
                  <SelectItem value="risk">Risk</SelectItem>
                  <SelectItem value="benefit">Benefit</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Planned")}</Label><Input value={form.planned_value} onChange={(e) => setForm({ ...form, planned_value: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Actual")}</Label><Input value={form.actual_value} onChange={(e) => setForm({ ...form, actual_value: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>{pt("Deviation")} %</Label><Input type="number" value={form.deviation_percentage} onChange={(e) => setForm({ ...form, deviation_percentage: e.target.value })} /></div>
            <div className="flex items-center gap-2">
              <input type="checkbox" checked={form.is_exceeded} onChange={(e) => setForm({ ...form, is_exceeded: e.target.checked })} />
              <Label>Tolerance exceeded</Label>
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

export default Prince2Tolerances;
