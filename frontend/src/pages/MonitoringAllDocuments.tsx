import { useState, useEffect, useRef } from "react";
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
import { Plus, Pencil, Trash2, Loader2, FileText, Download, UploadCloud } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const CATEGORIES: [string, string][] = [["planning", "Planning"], ["requirements", "Requirements"], ["design", "Design"], ["development", "Development"], ["testing", "Testing"], ["deployment", "Deployment"], ["training", "Training"], ["general", "General"]];
const STATUSES: [string, string][] = [["draft", "Draft"], ["in_review", "In Review"], ["approved", "Approved"], ["archived", "Archived"]];
const emptyForm = { name: "", description: "", category: "general", status: "draft" };

const MonitoringAllDocuments = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [file, setFile] = useState<File | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const DOCS = "/api/v1/projects/documents/";
  const UPLOADS = "/api/v1/projects/uploads/";

  const fetchData = async () => {
    try {
      const r = await fetch(`${DOCS}?project_id=${id}`, { headers });
      if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setFile(null); setDialogOpen(true); };
  const openEdit = (it: any) => {
    setEditing(it); setFile(null);
    setForm({ name: it.name || "", description: it.description || "", category: it.category || "general", status: it.status || "draft" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error(pt("Name is required")); return; }
    if (!editing && !file) { toast.error(pt("Select a file to upload")); return; }
    setSubmitting(true);
    try {
      if (editing) {
        const r = await fetch(`${DOCS}${editing.id}/`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ name: form.name, description: form.description, category: form.category, status: form.status }) });
        if (!r.ok) { const d = await r.json().catch(() => ({})); toast.error(d.detail || pt("Save failed")); setSubmitting(false); return; }
      } else {
        // 1) upload the file -> get upload id
        const fd = new FormData();
        fd.append("file", file as File);
        const up = await fetch(UPLOADS, { method: "POST", headers, body: fd });
        if (!up.ok) { toast.error(pt("Upload failed")); setSubmitting(false); return; }
        const upData = await up.json();
        // 2) create the document referencing the upload
        const r = await fetch(DOCS, { method: "POST", headers: jsonHeaders, body: JSON.stringify({ project: Number(id), file: upData.id, name: form.name, description: form.description, category: form.category, status: form.status }) });
        if (!r.ok) { const d = await r.json().catch(() => ({})); toast.error(d.detail || JSON.stringify(d).slice(0, 120) || pt("Save failed")); setSubmitting(false); return; }
      }
      toast.success(pt("Saved")); setDialogOpen(false); fetchData();
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (did: any) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    const r = await fetch(`${DOCS}${did}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
  };

  const label = (arr: [string, string][], v: string) => arr.find(([k]) => k === v)?.[1] || v;
  const statusColor = (s: string) => ({ draft: "bg-gray-100 text-gray-600", in_review: "bg-amber-100 text-amber-700", approved: "bg-green-100 text-green-700", archived: "bg-slate-100 text-slate-500" }[s] || "bg-gray-100");
  const exportSections = [{ heading: "Documents", rows: items.map((d) => [d.name, `${label(CATEGORIES, d.category)} · ${label(STATUSES, d.status)}`]) as [string, any][] }];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-blue-500" />
            <h1 className="text-2xl font-bold">{pt("All Documents")}</h1>
            <Badge variant="outline">{items.length}</Badge>
          </div>
          <div className="flex gap-2">
            {items.length > 0 && <ReportExportMenu title="Documents" sections={exportSections} />}
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />{pt("Upload Document")}</Button>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="p-8 text-center">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No documents yet")}</h3>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{pt("Upload Document")}</Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {items.map((d) => (
              <Card key={d.id}><CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium">{d.name}</span>
                      <Badge variant="outline" className="text-xs">{label(CATEGORIES, d.category)}</Badge>
                      <Badge className={`text-xs ${statusColor(d.status)}`}>{label(STATUSES, d.status)}</Badge>
                      {d.file_type && <span className="text-xs text-muted-foreground uppercase">{d.file_type}</span>}
                    </div>
                    {d.description && <p className="text-sm text-muted-foreground line-clamp-1">{d.description}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  {d.file_url && <a href={d.file_url} target="_blank" rel="noreferrer"><Button variant="ghost" size="sm"><Download className="h-4 w-4" /></Button></a>}
                  <Button variant="ghost" size="sm" onClick={() => openEdit(d)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(d.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? pt("Edit Document") : pt("Upload Document")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            {!editing && (
              <div className="space-y-2">
                <Label>{pt("File")}</Label>
                <input ref={fileInput} type="file" className="hidden" onChange={(e) => { const f = e.target.files?.[0] || null; setFile(f); if (f && !form.name) setForm((cur) => ({ ...cur, name: f.name })); }} />
                <Button type="button" variant="outline" className="w-full gap-2" onClick={() => fileInput.current?.click()}><UploadCloud className="h-4 w-4" />{file ? file.name : pt("Choose file")}</Button>
              </div>
            )}
            <div className="space-y-2"><Label>{pt("Name")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[50px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Category")}</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
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

export default MonitoringAllDocuments;
