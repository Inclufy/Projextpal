import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Pencil, Trash2, Loader2, HelpCircle } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const IMPACTS: [string, string][] = [["High", "High"], ["Medium", "Medium"], ["Low", "Low"]];
const STATUSES: [string, string][] = [["Unvalidated", "Unvalidated"], ["Validated", "Validated"], ["Invalidated", "Invalidated"]];
const emptyForm = { name: "", description: "", impact: "Medium", validation_status: "Unvalidated", validation_target_date: "", owner: "" };

const AssumptionsRegister = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [rows, setRows] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
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
      const [a, u] = await Promise.all([
        fetch(`/api/v1/projects/assumptions/?project=${id}`, { headers }),
        fetch(`/api/v1/auth/company-users/members/`, { headers }),
      ]);
      if (a.ok) { const d = await a.json(); setRows(Array.isArray(d) ? d : d.results || []); }
      if (u.ok) { const d = await u.json(); setUsers(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setDialogOpen(true); };
  const openEdit = (r: any) => {
    setEditing(r);
    setForm({
      name: r.name || "", description: r.description || "", impact: r.impact || "Medium",
      validation_status: r.validation_status || "Unvalidated",
      validation_target_date: r.validation_target_date?.split("T")[0] || "",
      owner: r.owner ? String(r.owner) : "",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name.trim()) { toast.error(pt("Enter an assumption")); return; }
    setSubmitting(true);
    try {
      const body: any = {
        project: Number(id), name: form.name, description: form.description,
        impact: form.impact, validation_status: form.validation_status,
      };
      if (form.validation_target_date) body.validation_target_date = form.validation_target_date;
      if (form.owner) body.owner = Number(form.owner);
      const url = editing ? `/api/v1/projects/assumptions/${editing.id}/` : `/api/v1/projects/assumptions/`;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else { const d = await r.json().catch(() => ({})); toast.error(d.detail || JSON.stringify(d).slice(0, 120) || pt("Save failed")); }
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (rid: any) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    const r = await fetch(`/api/v1/projects/assumptions/${rid}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
  };

  const userName = (u: any) => u.first_name || u.email || `#${u.id}`;
  const label = (arr: [string, string][], v: string) => arr.find(([k]) => k === v)?.[1] || v;
  const impactColor = (i: string) => ({ High: "bg-red-100 text-red-700", Medium: "bg-amber-100 text-amber-700", Low: "bg-gray-100 text-gray-600" }[i] || "bg-gray-100");
  const statusColor = (s: string) => ({ Unvalidated: "bg-amber-100 text-amber-700", Validated: "bg-green-100 text-green-700", Invalidated: "bg-red-100 text-red-700" }[s] || "bg-gray-100");

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <HelpCircle className="h-6 w-6 text-indigo-500" />
            <h1 className="text-2xl font-bold">{pt("Assumptions")}</h1>
            <Badge variant="outline">{rows.length}</Badge>
          </div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />{pt("Add Assumption")}</Button>
        </div>
        <p className="text-sm text-muted-foreground -mt-3">{pt("The 'A' in RAID — things assumed true for planning. Track impact and validate them over time.")}</p>

        {rows.length === 0 ? (
          <Card className="p-8 text-center">
            <HelpCircle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No assumptions yet")}</h3>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{pt("Add Assumption")}</Button>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-muted-foreground border-b bg-muted/50">
                    <th className="font-medium px-4 py-2.5">{pt("Assumption")}</th>
                    <th className="font-medium px-3 py-2.5 w-24">{pt("Impact")}</th>
                    <th className="font-medium px-3 py-2.5 w-32">{pt("Validation")}</th>
                    <th className="font-medium px-3 py-2.5 w-32">{pt("Target")}</th>
                    <th className="font-medium px-3 py-2.5 w-40">{pt("Owner")}</th>
                    <th className="px-2 py-2.5 w-16"></th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r.id} className="border-b last:border-0 hover:bg-accent/40 align-top">
                      <td className="px-4 py-2.5">
                        <div className="font-medium">{r.name}</div>
                        {r.description && <div className="text-xs text-muted-foreground mt-0.5">{r.description}</div>}
                      </td>
                      <td className="px-3 py-2.5"><Badge className={`text-[10px] ${impactColor(r.impact)}`}>{label(IMPACTS, r.impact)}</Badge></td>
                      <td className="px-3 py-2.5"><Badge className={`text-[10px] ${statusColor(r.validation_status)}`}>{label(STATUSES, r.validation_status)}</Badge></td>
                      <td className="px-3 py-2.5 text-muted-foreground whitespace-nowrap">{r.validation_target_date || "—"}</td>
                      <td className="px-3 py-2.5 text-muted-foreground">{r.owner_name || <span className="italic">{pt("Unassigned")}</span>}</td>
                      <td className="px-2 py-2.5">
                        <div className="flex gap-0.5">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(r)}><Pencil className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(r.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
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
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>{editing ? pt("Edit Assumption") : pt("Add Assumption")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Assumption")}</Label><Input autoFocus value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Impact")}</Label>
                <Select value={form.impact} onValueChange={(v) => setForm({ ...form, impact: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{IMPACTS.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{pt("Validation")}</Label>
                <Select value={form.validation_status} onValueChange={(v) => setForm({ ...form, validation_status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map(([v, l]) => <SelectItem key={v} value={v}>{pt(l)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Target Date")}</Label><Input type="date" value={form.validation_target_date} onChange={(e) => setForm({ ...form, validation_target_date: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Owner")}</Label>
                <Select value={form.owner} onValueChange={(v) => setForm({ ...form, owner: v })}>
                  <SelectTrigger><SelectValue placeholder={pt("Unassigned")} /></SelectTrigger>
                  <SelectContent>{users.map((u) => <SelectItem key={u.id} value={String(u.id)}>{userName(u)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting || !form.name.trim()}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AssumptionsRegister;
