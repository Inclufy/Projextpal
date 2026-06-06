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
import { Plus, Pencil, Trash2, Loader2, Users, Mail } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const INFLUENCE: [string, string][] = [["Low", "Low"], ["Medium", "Medium"], ["High", "High"]];
const GOVERNANCE: [string, string][] = [["Sponsor", "Sponsor"], ["Advisor", "Advisor"], ["Team Member", "Team Member"], ["Other", "Other"]];
const emptyForm = { name: "", role: "", contact: "", influence: "Medium", governance_type: "Team Member" };

const ExecutionStakeholders = () => {
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
  const BASE = "/api/v1/execution/stakeholders/";

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
    setForm({ name: it.name || "", role: it.role || "", contact: it.contact || "", influence: it.influence || "Medium", governance_type: it.governance_type || "Team Member" });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error(pt("Name is required")); return; }
    setSubmitting(true);
    try {
      const body: any = { project: Number(id), name: form.name, role: form.role, contact: form.contact, influence: form.influence, governance_type: form.governance_type };
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

  const inflColor = (v: string) => ({ Low: "bg-gray-100 text-gray-600", Medium: "bg-blue-100 text-blue-700", High: "bg-red-100 text-red-700" }[v] || "bg-gray-100");
  const govColor = (v: string) => ({ Sponsor: "bg-violet-100 text-violet-700", Advisor: "bg-amber-100 text-amber-700", "Team Member": "bg-green-100 text-green-700", Other: "bg-gray-100 text-gray-600" }[v] || "bg-gray-100");
  const exportSections = [{ heading: "Stakeholders", rows: items.map((s) => [s.name, `${s.role || "—"} · ${s.governance_type} · influence ${s.influence}${s.contact ? " · " + s.contact : ""}`]) as [string, any][] }];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Users className="h-6 w-6 text-indigo-500" />
            <div>
              <h1 className="text-2xl font-bold">{pt("Stakeholder Management")}</h1>
              <p className="text-sm text-muted-foreground">{pt("Identify and manage project stakeholders")}</p>
            </div>
            <Badge variant="outline">{items.length}</Badge>
          </div>
          <div className="flex gap-2">
            {items.length > 0 && <ReportExportMenu title="Stakeholders" sections={exportSections} />}
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />{pt("Add Stakeholder")}</Button>
          </div>
        </div>

        {items.length === 0 ? (
          <Card className="p-8 text-center">
            <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No stakeholders yet")}</h3>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{pt("Add Stakeholder")}</Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {items.map((s) => (
              <Card key={s.id}><CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium">{s.name}</span>
                    {s.role && <Badge variant="outline" className="text-xs">{s.role}</Badge>}
                    <Badge className={`text-xs ${govColor(s.governance_type)}`}>{s.governance_type}</Badge>
                    <Badge className={`text-xs ${inflColor(s.influence)}`}>{pt("Influence")}: {s.influence}</Badge>
                  </div>
                  {s.contact && <a href={`mailto:${s.contact}`} className="text-xs text-muted-foreground flex items-center gap-1 hover:underline"><Mail className="h-3 w-3" />{s.contact}</a>}
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
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? pt("Edit Stakeholder") : pt("Add Stakeholder")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Name")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Role")}</Label><Input value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Contact (email)")}</Label><Input type="email" value={form.contact} onChange={(e) => setForm({ ...form, contact: e.target.value })} /></div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Influence")}</Label>
                <Select value={form.influence} onValueChange={(v) => setForm({ ...form, influence: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{INFLUENCE.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{pt("Governance Type")}</Label>
                <Select value={form.governance_type} onValueChange={(v) => setForm({ ...form, governance_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{GOVERNANCE.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
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

export default ExecutionStakeholders;
