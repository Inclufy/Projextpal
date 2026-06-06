import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportExportMenu } from "@/components/ReportExportMenu";
import { Plus, Eye, Loader2 } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const FREQUENCIES = ["Weekly", "Bi-weekly", "Monthly", "Quarterly", "One-time"];
const TYPES = ["Steering", "Program Board", "Team", "Milestone", "Stage"];
const emptyForm = { name: "", frequency: "Weekly", type: "Steering", start_date: "" };

const ExecutionReporting = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ ...emptyForm });
  const [fFreq, setFFreq] = useState("all");
  const [fType, setFType] = useState("all");

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const r = await fetch(`/api/v1/communication/reporting-items/?project=${id}`, { headers });
      if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm, start_date: new Date().toISOString().split("T")[0] }); setDialogOpen(true); };
  const openEdit = (r: any) => {
    setEditing(r);
    setForm({ name: r.name || "", frequency: r.frequency || "Weekly", type: r.type || "Steering", start_date: r.start_date?.split("T")[0] || "" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const body: any = { project: id, name: form.name, frequency: form.frequency, type: form.type };
      if (form.start_date) body.start_date = form.start_date;
      const url = editing ? `/api/v1/communication/reporting-items/${editing.id}/` : `/api/v1/communication/reporting-items/`;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (rid: any) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    const r = await fetch(`/api/v1/communication/reporting-items/${rid}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
  };

  const filtered = items.filter((r) => (fFreq === "all" || r.frequency === fFreq) && (fType === "all" || r.type === fType));
  const exportSections = [{
    heading: "Reports",
    rows: filtered.map((r) => [r.name, `${r.type} · ${r.frequency} · ${r.start_date || ""}`]) as [string, any][],
  }];

  if (loading) return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </div>
  );

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <h1 className="text-2xl font-bold text-foreground mb-6">{pt("Reporting")}</h1>
        <Card className="p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold">{pt("Reports")} <span className="text-muted-foreground">({filtered.length})</span></h2>
            <div className="flex gap-2">
              {filtered.length > 0 && <ReportExportMenu title="Reporting" sections={exportSections} />}
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{pt("New Report")}</Button>
            </div>
          </div>

          <div className="flex gap-4 mb-6">
            <Select value={fFreq} onValueChange={setFFreq}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">{pt("All Frequencies")}</SelectItem>{FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
            </Select>
            <Select value={fType} onValueChange={setFType}>
              <SelectTrigger className="w-[180px]"><SelectValue /></SelectTrigger>
              <SelectContent><SelectItem value="all">{pt("All Types")}</SelectItem>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
            </Select>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <p className="mb-3">{pt("No reports yet")}</p>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{pt("New Report")}</Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    {["NAME", "FREQUENCY", "TYPE", "START DATE", "DOCUMENT", "ACTIONS"].map((h) => (
                      <th key={h} className="text-left p-4 font-medium text-muted-foreground text-sm">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((r) => (
                    <tr key={r.id} className="border-t border-border">
                      <td className="p-4 font-medium">{r.name}</td>
                      <td className="p-4">{r.frequency}</td>
                      <td className="p-4">{r.type}</td>
                      <td className="p-4">{r.start_date}</td>
                      <td className="p-4">
                        {r.document ? (
                          <a href={r.document} target="_blank" rel="noopener noreferrer" className="text-primary inline-flex items-center gap-1"><Eye className="h-4 w-4" />{pt("View")}</a>
                        ) : <span className="text-muted-foreground text-sm">—</span>}
                      </td>
                      <td className="p-4">
                        <div className="flex gap-2">
                          <Button variant="outline" size="sm" onClick={() => openEdit(r)}>{pt("Edit")}</Button>
                          <Button variant="outline" size="sm" className="text-destructive hover:text-destructive" onClick={() => handleDelete(r.id)}>{pt("Delete")}</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>{editing ? pt("Edit Report") : pt("New Report")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Name")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Frequency")}</Label>
                <Select value={form.frequency} onValueChange={(v) => setForm({ ...form, frequency: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{FREQUENCIES.map((f) => <SelectItem key={f} value={f}>{f}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{pt("Type")}</Label>
                <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{TYPES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>{pt("Start Date")}</Label><Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} /></div>
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

export default ExecutionReporting;
