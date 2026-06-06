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
import { Plus, Pencil, Trash2, Loader2, Workflow, CheckCircle2, Clock, XCircle, Search } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const STATUSES: [string, string][] = [["pending", "Pending"], ["in-review", "In Review"], ["approve", "Approved"], ["reject", "Rejected"]];
const emptyForm = { name: "", value: "", description: "", status: "pending", approver_name: "", approver_role: "", approver_comments: "" };

const FoundationWorkflow = () => {
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
  const BASE = "/api/v1/projects/approval-stages/";

  const fetchData = async () => {
    try {
      const r = await fetch(`${BASE}?project=${id}`, { headers });
      if (r.ok) { const d = await r.json(); const arr = Array.isArray(d) ? d : d.results || []; arr.sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)); setItems(arr); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setDialogOpen(true); };
  const openEdit = (it: any) => {
    setEditing(it);
    setForm({ name: it.name || "", value: it.value || "", description: it.description || "", status: it.status || "pending", approver_name: it.approver_name || "", approver_role: it.approver_role || "", approver_comments: it.approver_comments || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error(pt("Name is required")); return; }
    setSubmitting(true);
    try {
      const body: any = { project: Number(id), ...form, value: form.value || form.name };
      if (!editing) body.order_index = items.length;
      const url = editing ? `${BASE}${editing.id}/` : BASE;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else { const d = await r.json().catch(() => ({})); toast.error(d.detail || JSON.stringify(d).slice(0, 120) || pt("Save failed")); }
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (sid: any) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    const r = await fetch(`${BASE}${sid}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
  };

  const label = (v: string) => STATUSES.find(([k]) => k === v)?.[1] || v;
  const statusIcon = (s: string) => s === "approve" ? <CheckCircle2 className="h-4 w-4 text-green-600" /> : s === "reject" ? <XCircle className="h-4 w-4 text-red-600" /> : s === "in-review" ? <Search className="h-4 w-4 text-amber-600" /> : <Clock className="h-4 w-4 text-gray-500" />;
  const exportSections = [{ heading: "Approval workflow", rows: items.map((s) => [s.name, `${label(s.status)}${s.approver_name ? " · " + s.approver_name : ""}`]) as [string, any][] }];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Workflow className="h-6 w-6 text-indigo-500" />
            <div>
              <h1 className="text-2xl font-bold">{pt("Approval Workflow")}</h1>
              <p className="text-sm text-muted-foreground">{pt("Review and approve the project through multiple stages")}</p>
            </div>
            <Badge variant="outline">{items.length}</Badge>
          </div>
          <div className="flex gap-2">
            {items.length > 0 && <ReportExportMenu title="Approval Workflow" sections={exportSections} />}
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />{pt("Add Stage")}</Button>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="p-8 text-center">
            <Workflow className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No approval stages yet")}</h3>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{pt("Add Stage")}</Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {items.map((s, i) => (
              <Card key={s.id}><CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="flex items-center justify-center h-7 w-7 rounded-full bg-muted text-xs font-semibold">{i + 1}</div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {statusIcon(s.status)}
                      <span className="font-medium">{s.name}</span>
                      <Badge variant="outline" className="text-xs">{label(s.status)}</Badge>
                      {s.approver_name && <span className="text-xs text-muted-foreground">{s.approver_name}{s.approver_role ? ` (${s.approver_role})` : ""}</span>}
                    </div>
                    {s.description && <p className="text-sm text-muted-foreground line-clamp-1">{s.description}</p>}
                    {s.approver_comments && <p className="text-xs text-muted-foreground italic mt-0.5">"{s.approver_comments}"</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(s)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(s.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? pt("Edit Stage") : pt("Add Stage")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Stage Name")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[50px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Status")}</Label>
              <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STATUSES.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Approver Name")}</Label><Input value={form.approver_name} onChange={(e) => setForm({ ...form, approver_name: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Approver Role")}</Label><Input value={form.approver_role} onChange={(e) => setForm({ ...form, approver_role: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>{pt("Comments")}</Label><textarea className="w-full min-h-[50px] px-3 py-2 border rounded-md bg-background" value={form.approver_comments} onChange={(e) => setForm({ ...form, approver_comments: e.target.value })} /></div>
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

export default FoundationWorkflow;
