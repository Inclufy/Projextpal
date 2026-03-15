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
import { Loader2, Plus, FileText, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const Prince2HighlightReport = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", summary: "", overall_status: "green", report_date: "", achievements: "", issues: "", risks: "", next_period_plan: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/highlight-reports/`, { headers });
      if (response.ok) {
        const data = await response.json();
        setReports(Array.isArray(data) ? data : data.results || []);
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => {
    setEditing(null);
    setForm({ title: "", summary: "", overall_status: "green", report_date: new Date().toISOString().split("T")[0], achievements: "", issues: "", risks: "", next_period_plan: "" });
    setDialogOpen(true);
  };

  const openEdit = (r: any) => {
    setEditing(r);
    setForm({ title: r.title || "", summary: r.summary || "", overall_status: r.overall_status || "green", report_date: r.report_date?.split("T")[0] || "", achievements: r.achievements || "", issues: r.issues || "", risks: r.risks || "", next_period_plan: r.next_period_plan || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title) { toast.error(pt("Title is required")); return; }
    setSubmitting(true);
    try {
      const url = editing ? `/api/v1/projects/${id}/prince2/highlight-reports/${editing.id}/` : `/api/v1/projects/${id}/prince2/highlight-reports/`;
      const method = editing ? "PATCH" : "POST";
      const response = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(form) });
      if (response.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (rId: number) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/highlight-reports/${rId}/`, { method: "DELETE", headers });
      if (response.ok || response.status === 204) { toast.success(pt("Deleted")); fetchData(); }
    } catch { toast.error(pt("Delete failed")); }
  };

  const statusColor = (s: string) => ({ green: "bg-green-100 text-green-700", amber: "bg-amber-100 text-amber-700", red: "bg-red-100 text-red-700" }[s] || "bg-gray-100");

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
            <FileText className="h-6 w-6 text-purple-500" />
            <h1 className="text-2xl font-bold">{pt("Highlight Reports")}</h1>
            <Badge variant="outline">{reports.length}</Badge>
          </div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Report")}</Button>
        </div>

        {reports.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No highlight reports yet")}</h3>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> {pt("New Report")}</Button>
          </Card>
        ) : (
          <div className="space-y-3">
            {reports.map((r) => (
              <Card key={r.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-4 flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge className={`text-xs ${statusColor(r.overall_status)}`}>{r.overall_status}</Badge>
                      <span className="text-sm text-muted-foreground">{r.report_date}</span>
                    </div>
                    <p className="font-medium">{r.title}</p>
                    {r.summary && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.summary}</p>}
                  </div>
                  <div className="flex gap-1 ml-4">
                    <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("New Report")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Title")} *</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Date")}</Label><Input type="date" value={form.report_date} onChange={(e) => setForm({ ...form, report_date: e.target.value })} /></div>
            </div>
            <div className="space-y-2">
              <Label>{pt("Status")}</Label>
              <Select value={form.overall_status} onValueChange={(v) => setForm({ ...form, overall_status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="green">🟢 Green</SelectItem>
                  <SelectItem value="amber">🟡 Amber</SelectItem>
                  <SelectItem value="red">🔴 Red</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>{pt("Summary")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.summary} onChange={(e) => setForm({ ...form, summary: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Achievements")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.achievements} onChange={(e) => setForm({ ...form, achievements: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Issues")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.issues} onChange={(e) => setForm({ ...form, issues: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Risks")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.risks} onChange={(e) => setForm({ ...form, risks: e.target.value })} /></div>
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

export default Prince2HighlightReport;
