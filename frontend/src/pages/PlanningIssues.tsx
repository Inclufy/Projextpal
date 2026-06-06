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
import { Plus, Pencil, Trash2, Loader2, AlertOctagon } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const SEVERITIES: [string, string][] = [["Blocker", "Blocker"], ["Critical", "Critical"], ["Major", "Major"], ["Minor", "Minor"]];
const STATUSES: [string, string][] = [["Open", "Open"], ["In Progress", "In Progress"], ["Resolved", "Resolved"], ["Closed", "Closed"]];
const emptyForm = { name: "", description: "", severity: "Major", status: "Open", target_resolution_date: "", resolution: "" };

const PlanningIssues = () => {
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

  const fetchData = async () => {
    try {
      const r = await fetch(`/api/v1/projects/issues/?project=${id}`, { headers });
      if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setDialogOpen(true); };
  const openEdit = (it: any) => {
    setEditing(it);
    setForm({ name: it.name || "", description: it.description || "", severity: it.severity || "Major", status: it.status || "Open", target_resolution_date: it.target_resolution_date?.split("T")[0] || "", resolution: it.resolution || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error(pt("Title is required")); return; }
    setSubmitting(true);
    try {
      const body: any = {
        project: Number(id), name: form.name, description: form.description,
        severity: form.severity, status: form.status, resolution: form.resolution,
      };
      if (form.target_resolution_date) body.target_resolution_date = form.target_resolution_date;
      const url = editing ? `/api/v1/projects/issues/${editing.id}/` : `/api/v1/projects/issues/`;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else { const d = await r.json().catch(() => ({})); toast.error(d.detail || JSON.stringify(d).slice(0, 120) || pt("Save failed")); }
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (iid: any) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    const r = await fetch(`/api/v1/projects/issues/${iid}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
  };

  const sevColor = (s: string) => ({ Blocker: "bg-red-100 text-red-700", Critical: "bg-orange-100 text-orange-700", Major: "bg-amber-100 text-amber-700", Minor: "bg-gray-100 text-gray-600" }[s] || "bg-gray-100");
  const statusColor = (s: string) => ({ Open: "bg-blue-100 text-blue-700", "In Progress": "bg-indigo-100 text-indigo-700", Resolved: "bg-green-100 text-green-700", Closed: "bg-gray-100 text-gray-600" }[s] || "bg-gray-100");
  const label = (arr: [string, string][], v: string) => arr.find(([k]) => k === v)?.[1] || v;
  const exportSections = [{ heading: "Issues", rows: items.map((it) => [it.name, `${it.severity} · ${it.status}${it.target_resolution_date ? " · due " + it.target_resolution_date : ""}`]) as [string, any][] }];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertOctagon className="h-6 w-6 text-rose-500" />
            <h1 className="text-2xl font-bold">{pt("Issue Register")}</h1>
            <Badge variant="outline">{items.length}</Badge>
          </div>
          <div className="flex gap-2">
            {items.length > 0 && <ReportExportMenu title="Issue Register" sections={exportSections} />}
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />{pt("Add Issue")}</Button>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertOctagon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No issues logged")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{pt("Log problems that have materialised and need action (RAID).")}</p>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{pt("Add Issue")}</Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {items.map((it) => (
              <Card key={it.id}><CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium">{it.name}</span>
                    <Badge className={`text-xs ${sevColor(it.severity)}`}>{it.severity}</Badge>
                    <Badge className={`text-xs ${statusColor(it.status)}`}>{label(STATUSES, it.status)}</Badge>
                    {it.related_risk_name && <Badge variant="secondary" className="text-xs">⚠ {it.related_risk_name}</Badge>}
                    {it.target_resolution_date && <span className="text-xs text-muted-foreground">due {it.target_resolution_date}</span>}
                  </div>
                  {it.description && <p className="text-sm text-muted-foreground line-clamp-2">{it.description}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(it)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(it.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? pt("Edit Issue") : pt("Add Issue")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Title")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Severity")}</Label>
                <Select value={form.severity} onValueChange={(v) => setForm({ ...form, severity: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SEVERITIES.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{pt("Status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>{pt("Target Resolution Date")}</Label><Input type="date" value={form.target_resolution_date} onChange={(e) => setForm({ ...form, target_resolution_date: e.target.value })} /></div>
            {(form.status === "Resolved" || form.status === "Closed") && (
              <div className="space-y-2"><Label>{pt("Resolution")}</Label><textarea className="w-full min-h-[50px] px-3 py-2 border rounded-md bg-background" value={form.resolution} onChange={(e) => setForm({ ...form, resolution: e.target.value })} /></div>
            )}
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting || !form.name}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanningIssues;
