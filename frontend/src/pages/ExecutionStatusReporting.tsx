import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ReportExportMenu } from "@/components/ReportExportMenu";
import { Plus, Edit, Trash2, FileBarChart, Loader2 } from "lucide-react";
import { useParams, useNavigate } from "react-router-dom";
import { useProject } from "@/hooks/useApi";
import { doctrineReportPath } from "@/lib/methodologyRoutes";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const STATUSES = ["Not Started", "In Progress", "Completed"];
const emptyForm = { status: "In Progress", progress: "0", last_updated: "" };

const ExecutionStatusReporting = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: project } = useProject(id);
  const doctrinePath = id ? doctrineReportPath(id, project?.methodology) : null;

  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const BASE = "/api/v1/communication/status-reports/";

  const fetchData = async () => {
    try {
      const r = await fetch(`${BASE}?project=${id}`, { headers });
      if (r.ok) { const d = await r.json(); setReports(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, last_updated: new Date().toISOString().split("T")[0] }); setDialogOpen(true); };
  const openEdit = (r: any) => {
    setEditing(r);
    setForm({ status: r.status || "In Progress", progress: String(r.progress ?? 0), last_updated: r.last_updated?.split("T")[0] || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const body: any = { project: id, status: form.status, progress: parseInt(form.progress || "0", 10) || 0 };
      if (form.last_updated) body.last_updated = form.last_updated;
      const url = editing ? `${BASE}${editing.id}/` : BASE;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else { const d = await r.json().catch(() => ({})); toast.error(d.detail || JSON.stringify(d).slice(0, 100) || pt("Save failed")); }
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (rid: any) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    const r = await fetch(`${BASE}${rid}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
  };

  const statusColor = (s: string) => ({ "Not Started": "bg-gray-100 text-gray-600", "In Progress": "bg-blue-100 text-blue-700", "Completed": "bg-green-100 text-green-700" }[s] || "bg-gray-100");
  const exportSections = [{ heading: "Status Reports", rows: reports.map((r) => [`#${r.id} ${r.last_updated || ""}`, `${r.status} · ${r.progress}%`]) as [string, any][] }];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{pt("Status Reporting")} <span className="text-muted-foreground text-base">({reports.length})</span></h1>
          <div className="flex items-center gap-2">
            {reports.length > 0 && <ReportExportMenu title="Status Reports" sections={exportSections} />}
            {doctrinePath && (
              <Button variant="outline" onClick={() => navigate(doctrinePath)} className="gap-2" title={pt("Open the methodology-specific doctrine report for this project")}>
                <FileBarChart className="h-4 w-4" />{pt("Methodology report")}
              </Button>
            )}
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{pt("Add Report")}</Button>
          </div>
        </div>

        {reports.length === 0 ? (
          <Card className="p-8 text-center">
            <FileBarChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No status reports yet")}</h3>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{pt("Add Report")}</Button>
          </Card>
        ) : (
          <Card>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    {["REPORT ID", "STATUS", "PROGRESS (%)", "LAST UPDATED", "ACTIONS"].map((h) => (
                      <th key={h} className="text-left p-4 font-medium text-muted-foreground text-sm">{pt(h)}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {reports.map((report) => (
                    <tr key={report.id} className="border-t border-border">
                      <td className="p-4 font-medium">{report.id}</td>
                      <td className="p-4"><Badge className={`text-xs ${statusColor(report.status)}`}>{pt(report.status)}</Badge></td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <Progress value={report.progress} className="h-2 w-24" />
                          <span className="text-sm">{report.progress}%</span>
                        </div>
                      </td>
                      <td className="p-4">{report.last_updated}</td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button variant="ghost" size="icon" onClick={() => openEdit(report)}><Edit className="h-4 w-4 text-primary" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleDelete(report.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? pt("Edit Report") : pt("Add Report")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{pt("Status")}</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{pt(s)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-2"><Label>{pt("Progress")} (%)</Label><Input type="number" min={0} max={100} value={form.progress} onChange={(e) => setForm({ ...form, progress: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Last Updated")}</Label><Input type="date" value={form.last_updated} onChange={(e) => setForm({ ...form, last_updated: e.target.value })} /></div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ExecutionStatusReporting;
