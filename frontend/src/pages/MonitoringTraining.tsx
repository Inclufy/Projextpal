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
import { Plus, Pencil, Trash2, Loader2, BookOpen } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const AUDIENCE: [string, string][] = [["End Users", "End Users"], ["Administrators", "Administrators"], ["Trainers", "Trainers"]];
const FORMAT: [string, string][] = [["PDF", "PDF"], ["MP4", "MP4"], ["DOCX", "DOCX"]];
const STATUSES: [string, string][] = [["Not Started", "Not Started"], ["Draft", "Draft"], ["In Review", "In Review"], ["Completed", "Completed"]];
const emptyForm = { name: "", audience: "End Users", format: "PDF", status: "Not Started" };

const MonitoringTraining = () => {
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
  const BASE = "/api/v1/communication/training-materials/";

  const fetchData = async () => {
    try {
      const r = await fetch(`${BASE}?project=${id}`, { headers });
      if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setDialogOpen(true); };
  const openEdit = (it: any) => {
    setEditing(it);
    setForm({ name: it.name || "", audience: it.audience || "End Users", format: it.format || "PDF", status: it.status || "Not Started" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error(pt("Name is required")); return; }
    setSubmitting(true);
    try {
      const body: any = { project: Number(id), ...form };
      const url = editing ? `${BASE}${editing.id}/` : BASE;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else { const d = await r.json().catch(() => ({})); toast.error(d.detail || JSON.stringify(d).slice(0, 120) || pt("Save failed")); }
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (tid: any) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    const r = await fetch(`${BASE}${tid}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
  };

  const label = (arr: [string, string][], v: string) => arr.find(([k]) => k === v)?.[1] || v;
  const statusColor = (s: string) => ({ "Not Started": "bg-gray-100 text-gray-600", Draft: "bg-blue-100 text-blue-700", "In Review": "bg-amber-100 text-amber-700", Completed: "bg-green-100 text-green-700" }[s] || "bg-gray-100");
  const exportSections = [{ heading: "Training materials", rows: items.map((t) => [t.name, `${t.format} · ${t.audience} · ${t.status}`]) as [string, any][] }];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BookOpen className="h-6 w-6 text-teal-500" />
            <h1 className="text-2xl font-bold">{pt("Training Materials")}</h1>
            <Badge variant="outline">{items.length}</Badge>
          </div>
          <div className="flex gap-2">
            {items.length > 0 && <ReportExportMenu title="Training Materials" sections={exportSections} />}
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />{pt("Add Material")}</Button>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="p-8 text-center">
            <BookOpen className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No training materials yet")}</h3>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{pt("Add Material")}</Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {items.map((t) => (
              <Card key={t.id}><CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2 flex-wrap flex-1">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">{t.name}</span>
                  <Badge variant="outline" className="text-xs">{t.format}</Badge>
                  <Badge variant="secondary" className="text-xs">{t.audience}</Badge>
                  <Badge className={`text-xs ${statusColor(t.status)}`}>{t.status}</Badge>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? pt("Edit Material") : pt("Add Material")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Name")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>{pt("Audience")}</Label>
                <Select value={form.audience} onValueChange={(v) => setForm({ ...form, audience: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{AUDIENCE.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{pt("Format")}</Label>
                <Select value={form.format} onValueChange={(v) => setForm({ ...form, format: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FORMAT.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{pt("Status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
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

export default MonitoringTraining;
