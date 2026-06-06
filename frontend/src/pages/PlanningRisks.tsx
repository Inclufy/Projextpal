import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ReportExportMenu } from "@/components/ReportExportMenu";
import { AlertTriangle, Plus, Pencil, Trash2, Loader2 } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const CATEGORIES = ["Technical", "Schedule", "Financial", "Operational", "Strategic", "Compliance"];
const LEVELS = ["High", "Medium", "Low"];
const STATUSES = ["Open", "Mitigated", "Closed"];
// Yanmar risk-management impact areas — what the risk threatens.
const IMPACT_AREAS: [string, string][] = [
  ["cost", "Cost / Budget"],
  ["schedule", "Schedule / Delay"],
  ["deliverable", "Deliverable / Quality"],
  ["milestone", "Milestone"],
  ["resource", "Resource availability"],
  ["scope", "Scope"],
  ["other", "Other"],
];
const emptyForm = {
  name: "", description: "", category: "Technical", impact: "Medium", level: "Medium",
  probability: "50", status: "Open", impact_areas: [] as string[], affected_milestone: "",
};

const PlanningRisks = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [risks, setRisks] = useState<any[]>([]);
  const [milestones, setMilestones] = useState<any[]>([]);
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
      const [r, m] = await Promise.all([
        fetch(`/api/v1/projects/risks/?project=${id}`, { headers }),
        fetch(`/api/v1/projects/milestones/?project=${id}`, { headers }),
      ]);
      if (r.ok) { const d = await r.json(); setRisks(Array.isArray(d) ? d : d.results || []); }
      if (m.ok) { const d = await m.json(); setMilestones(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ ...emptyForm }); setDialogOpen(true); };
  const openEdit = (r: any) => {
    setEditing(r);
    setForm({
      name: r.name || "", description: r.description || "", category: r.category || "Technical",
      impact: r.impact || "Medium", level: r.level || "Medium", probability: String(r.probability ?? 50),
      status: r.status || "Open", impact_areas: Array.isArray(r.impact_areas) ? r.impact_areas : [],
      affected_milestone: r.affected_milestone ? String(r.affected_milestone) : "",
    });
    setDialogOpen(true);
  };

  const toggleArea = (a: string) => setForm((f) => ({ ...f, impact_areas: f.impact_areas.includes(a) ? f.impact_areas.filter((x) => x !== a) : [...f.impact_areas, a] }));

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const body: any = {
        project: id, name: form.name, description: form.description, category: form.category,
        impact: form.impact, level: form.level, status: form.status,
        probability: parseInt(form.probability || "0", 10) || 0,
        impact_areas: form.impact_areas,
        affected_milestone: form.affected_milestone ? Number(form.affected_milestone) : null,
      };
      const url = editing ? `/api/v1/projects/risks/${editing.id}/` : `/api/v1/projects/risks/`;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); }
      else { const d = await r.json().catch(() => ({})); toast.error(d.detail || JSON.stringify(d).slice(0, 120) || pt("Save failed")); }
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (rid: any) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    const r = await fetch(`/api/v1/projects/risks/${rid}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
  };

  const levelColor = (l: string) => ({ High: "bg-red-100 text-red-700", Medium: "bg-amber-100 text-amber-700", Low: "bg-green-100 text-green-700" }[l] || "bg-gray-100");
  const statusColor = (s: string) => ({ Open: "bg-amber-100 text-amber-700", Mitigated: "bg-blue-100 text-blue-700", Closed: "bg-green-100 text-green-700" }[s] || "bg-gray-100");
  const areaLabel = (a: string) => IMPACT_AREAS.find(([k]) => k === a)?.[1] || a;
  const exportSections = [{ heading: "Risks", rows: risks.map((r) => [r.name, `${r.category} · ${r.level} · ${r.status} · areas: ${(r.impact_areas || []).map(areaLabel).join(", ") || "—"}`]) as [string, any][] }];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-6 w-6 text-amber-500" />
            <h1 className="text-2xl font-bold">{pt("Risks")}</h1>
            <Badge variant="outline">{risks.length}</Badge>
          </div>
          <div className="flex gap-2">
            {risks.length > 0 && <ReportExportMenu title="Risks" sections={exportSections} />}
            <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" />{pt("Add Risk")}</Button>
          </div>
        </div>

        {risks.length === 0 ? (
          <Card className="p-8 text-center">
            <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No risks yet")}</h3>
            <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" />{pt("Add Risk")}</Button>
          </Card>
        ) : (
          <div className="space-y-2">
            {risks.map((r) => (
              <Card key={r.id}><CardContent className="p-4 flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-medium">{r.name}</span>
                    <Badge variant="outline" className="text-xs">{r.category}</Badge>
                    <Badge className={`text-xs ${levelColor(r.level)}`}>{r.level}</Badge>
                    <Badge variant="outline" className="text-xs">P{r.probability}%</Badge>
                    <Badge className={`text-xs ${statusColor(r.status)}`}>{r.status}</Badge>
                  </div>
                  {(r.impact_areas || []).length > 0 && (
                    <div className="flex gap-1 flex-wrap mt-1">
                      {r.impact_areas.map((a: string) => <Badge key={a} variant="secondary" className="text-xs">{areaLabel(a)}</Badge>)}
                      {r.affected_milestone && <Badge variant="secondary" className="text-xs">🏁 {milestones.find((m) => m.id === r.affected_milestone)?.name || `#${r.affected_milestone}`}</Badge>}
                    </div>
                  )}
                  {r.description && <p className="text-sm text-muted-foreground mt-1 line-clamp-2">{r.description}</p>}
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(r)}><Pencil className="h-4 w-4" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg max-h-[88vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? pt("Edit Risk") : pt("Add Risk")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Name")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Category")}</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{pt("Status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            {/* Yanmar — impact areas */}
            <div className="space-y-2">
              <Label>{pt("Impact areas")} <span className="text-xs text-muted-foreground">({pt("what it threatens")})</span></Label>
              <div className="flex flex-wrap gap-2">
                {IMPACT_AREAS.map(([v, l]) => (
                  <button type="button" key={v} onClick={() => toggleArea(v)}
                    className={`px-2 py-1 rounded-md border text-xs ${form.impact_areas.includes(v) ? "bg-primary text-primary-foreground border-primary" : "hover:bg-accent"}`}>{pt(l)}</button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>{pt("Affected milestone")} <span className="text-xs text-muted-foreground">({pt("optional")})</span></Label>
              <Select value={form.affected_milestone || "none"} onValueChange={(v) => setForm({ ...form, affected_milestone: v === "none" ? "" : v })}>
                <SelectTrigger><SelectValue placeholder="—" /></SelectTrigger>
                <SelectContent><SelectItem value="none">—</SelectItem>{milestones.map((m) => <SelectItem key={m.id} value={String(m.id)}>{m.name}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>{pt("Impact")}</Label>
                <Select value={form.impact} onValueChange={(v) => setForm({ ...form, impact: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{pt("Level")}</Label>
                <Select value={form.level} onValueChange={(v) => setForm({ ...form, level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LEVELS.map((l) => <SelectItem key={l} value={l}>{l}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{pt("Probability")} %</Label><Input type="number" min={0} max={100} value={form.probability} onChange={(e) => setForm({ ...form, probability: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting || !form.name || !form.description}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanningRisks;
