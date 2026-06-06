import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { ReportExportMenu } from "@/components/ReportExportMenu";
import { Plus, Pencil, Trash2, Loader2, Calendar } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const emptyForm = { title: "", description: "", start_date: "", end_date: "" };

const PlanningCalendar = () => {
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
  const BASE = "/api/v1/projects/events/";

  const fetchData = async () => {
    try {
      const r = await fetch(`${BASE}?project=${id}`, { headers });
      if (r.ok) { const d = await r.json(); const arr = Array.isArray(d) ? d : d.results || []; arr.sort((a: any, b: any) => (a.start_date || "").localeCompare(b.start_date || "")); setItems(arr); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setDialogOpen(true); };
  const openEdit = (it: any) => {
    setEditing(it);
    setForm({ title: it.title || "", description: it.description || "", start_date: it.start_date?.split("T")[0] || "", end_date: it.end_date?.split("T")[0] || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.start_date) { toast.error(pt("Title and start date are required")); return; }
    setSubmitting(true);
    try {
      const body: any = { project: Number(id), title: form.title, description: form.description, start_date: form.start_date, end_date: form.end_date || form.start_date };
      const url = editing ? `${BASE}${editing.id}/` : BASE;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else { const d = await r.json().catch(() => ({})); toast.error(d.detail || JSON.stringify(d).slice(0, 120) || pt("Save failed")); }
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (eid: any) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    const r = await fetch(`${BASE}${eid}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
  };

  const fmt = (d: string) => d ? new Date(d).toLocaleDateString(undefined, { weekday: "short", day: "numeric", month: "short", year: "numeric" }) : "";
  const exportSections = [{ heading: "Calendar events", rows: items.map((e) => [e.title, `${fmt(e.start_date)}${e.end_date && e.end_date !== e.start_date ? " → " + fmt(e.end_date) : ""}`]) as [string, any][] }];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Calendar className="h-6 w-6 text-sky-500" />
            <h1 className="text-2xl font-bold">{pt("Calendar")}</h1>
            <Badge variant="outline">{items.length}</Badge>
          </div>
          <div className="flex gap-2">
            {items.length > 0 && <ReportExportMenu title="Calendar" sections={exportSections} />}
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />{pt("Add Event")}</Button>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="p-8 text-center">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No events scheduled")}</h3>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{pt("Add Event")}</Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {items.map((e) => (
              <Card key={e.id}><CardContent className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="flex flex-col items-center justify-center bg-sky-50 text-sky-700 rounded-lg px-3 py-2 min-w-[64px]">
                    <span className="text-xs uppercase">{e.start_date ? new Date(e.start_date).toLocaleDateString(undefined, { month: "short" }) : ""}</span>
                    <span className="text-xl font-bold leading-none">{e.start_date ? new Date(e.start_date).getDate() : "?"}</span>
                  </div>
                  <div className="flex-1">
                    <div className="font-medium">{e.title}</div>
                    <div className="text-xs text-muted-foreground">{fmt(e.start_date)}{e.end_date && e.end_date !== e.start_date ? ` → ${fmt(e.end_date)}` : ""}</div>
                    {e.description && <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">{e.description}</p>}
                  </div>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(e)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(e.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? pt("Edit Event") : pt("Add Event")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Title")}</Label><Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[50px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Start Date")}</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("End Date")}</Label><Input type="date" value={form.end_date} onChange={(e) => setForm({ ...form, end_date: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting || !form.title || !form.start_date}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanningCalendar;
