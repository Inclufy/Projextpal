import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Target, Pencil, Trash2, CheckCircle2, Stamp, ListChecks, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

const fetchJson = async (url: string) => {
  const token = localStorage.getItem("access_token");
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
};
const toArr = (d: any) => (Array.isArray(d) ? d : d?.results || []);

// Canonical Hybrid vocabulary — must mirror backend/hybrid/constants.py
const METHODOLOGIES = ["prince2", "agile", "scrum", "kanban", "waterfall", "lean_six_sigma_green", "lean_six_sigma_black"];

// Governance strategy per methodology — mirror backend/hybrid/constants.py
// STRATEGY_BY_METHODOLOGY. Drives which completion gate a phase uses.
const STRATEGY_BY_METHODOLOGY: Record<string, "predictive" | "adaptive" | "flow"> = {
  prince2: "predictive", waterfall: "predictive",
  lean_six_sigma_green: "predictive", lean_six_sigma_black: "predictive",
  agile: "adaptive", scrum: "adaptive", kanban: "flow",
};
const strategyOf = (p: any): "predictive" | "adaptive" | "flow" =>
  p?.strategy || STRATEGY_BY_METHODOLOGY[p?.methodology] || "predictive";

const STRATEGY_LABEL: Record<string, string> = {
  predictive: "Predictive — gate sign-off",
  adaptive: "Adaptive — DoD + tasks",
  flow: "Flow — drain all tasks",
};

// Map backend 409 `code` -> a human message for the toast.
const COMPLETE_ERRORS: Record<string, string> = {
  signoff_required: "This predictive phase needs a gate sign-off before it can complete.",
  dod_incomplete: "Definition-of-Done items and/or tasks are still open.",
  work_in_progress: "Drain every task to Done before completing this flow phase.",
  already_complete: "This phase is already complete.",
  signoff_not_applicable: "Only predictive phases have a gate sign-off.",
};

const HybridPhases = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ phase: "", methodology: "scrum", description: "", order: "0", start_date: "", end_date: "", progress: "0" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const phasesQ = useQuery({ queryKey: ["hybrid-phases", id], queryFn: () => fetchJson(`/api/v1/projects/${id}/hybrid/phase-methodologies/`), enabled: !!id });
  const tasksQ = useQuery({ queryKey: ["hybrid-tasks", id], queryFn: () => fetchJson(`/api/v1/projects/${id}/hybrid/tasks/`), enabled: !!id });

  const phases = toArr(phasesQ.data).sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
  const tasks = toArr(tasksQ.data);
  const refresh = () => qc.invalidateQueries({ queryKey: ["hybrid-phases", id] });

  const openCreate = () => { setEditing(null); setForm({ phase: "", methodology: "scrum", description: "", order: String(phases.length), start_date: "", end_date: "", progress: "0" }); setDialogOpen(true); };
  const openEdit = (p: any) => { setEditing(p); setForm({ phase: p.phase || "", methodology: p.methodology || "scrum", description: p.description || "", order: String(p.order ?? 0), start_date: p.start_date || "", end_date: p.end_date || "", progress: String(p.progress ?? 0) }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.phase) { toast.error(pt("Phase name is required")); return; }
    setSubmitting(true);
    try {
      const body: any = { phase: form.phase, methodology: form.methodology, description: form.description, order: parseInt(form.order) || 0, progress: parseInt(form.progress) || 0 };
      if (form.start_date) body.start_date = form.start_date;
      if (form.end_date) body.end_date = form.end_date;
      const url = editing ? `/api/v1/projects/${id}/hybrid/phase-methodologies/${editing.id}/` : `/api/v1/projects/${id}/hybrid/phase-methodologies/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); refresh(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (pId: string) => {
    if (!confirm(pt("Delete this phase?"))) return;
    try { const r = await fetch(`/api/v1/projects/${id}/hybrid/phase-methodologies/${pId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); refresh(); } } catch { toast.error(pt("Delete failed")); }
  };

  // Record a predictive gate review sign-off (gate_status open -> signed_off).
  const signOff = async (p: any) => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/hybrid/phase-methodologies/${p.id}/signoff/`, { method: "POST", headers: jsonHeaders, body: "{}" });
      if (r.ok) { toast.success(pt("Gate signed off")); refresh(); return; }
      const err = await r.json().catch(() => ({}));
      toast.error(pt(COMPLETE_ERRORS[err?.code] || err?.detail || "Sign-off failed"));
    } catch { toast.error(pt("Sign-off failed")); }
  };

  // Complete a phase under its methodology's governance strategy. The backend
  // enforces the gate and returns 409 + `code` + (for adaptive/flow) blockers.
  const markComplete = async (p: any) => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/hybrid/phase-methodologies/${p.id}/complete/`, { method: "POST", headers: jsonHeaders, body: "{}" });
      if (r.ok) { toast.success(pt("Phase completed")); refresh(); return; }
      const err = await r.json().catch(() => ({}));
      const blockers = err?.blockers;
      const extra = blockers
        ? [...(blockers.open_dod_items || []), ...(blockers.open_tasks || [])].slice(0, 4).join(", ")
        : "";
      toast.error(pt(COMPLETE_ERRORS[err?.code] || err?.detail || "Completion blocked") + (extra ? `: ${extra}` : ""));
    } catch { toast.error(pt("Update failed")); }
  };

  // ---- Definition-of-Done editor (adaptive phases) ----------------------
  const [dodPhase, setDodPhase] = useState<any>(null);
  const [dodItems, setDodItems] = useState<Array<{ text: string; done: boolean }>>([]);
  const [dodNew, setDodNew] = useState("");
  const openDod = (p: any) => { setDodPhase(p); setDodItems(Array.isArray(p.dod_checklist) ? p.dod_checklist : []); setDodNew(""); };
  const saveDod = async (items: Array<{ text: string; done: boolean }>) => {
    if (!dodPhase) return;
    try {
      const r = await fetch(`/api/v1/projects/${id}/hybrid/phase-methodologies/${dodPhase.id}/`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ dod_checklist: items }) });
      if (r.ok) { setDodItems(items); refresh(); } else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
  };
  const addDodItem = () => { if (!dodNew.trim()) return; const next = [...dodItems, { text: dodNew.trim(), done: false }]; setDodNew(""); saveDod(next); };
  const toggleDodItem = (i: number) => { const next = dodItems.map((it, idx) => idx === i ? { ...it, done: !it.done } : it); saveDod(next); };
  const removeDodItem = (i: number) => { const next = dodItems.filter((_, idx) => idx !== i); saveDod(next); };

  const phaseProgress = (p: any) => {
    const phaseTasks = tasks.filter((t: any) => t.phase === p.id);
    if (phaseTasks.length === 0) return p.progress ?? 0;
    const done = phaseTasks.filter((t: any) => t.status === "completed" || t.status === "done").length;
    return Math.round((done / phaseTasks.length) * 100);
  };

  if (phasesQ.isLoading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Target className="h-6 w-6 text-pink-500" /><h1 className="text-2xl font-bold">{pt("Hybrid Phases")}</h1><Badge variant="outline">{phases.length}</Badge></div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Phase")}</Button>
        </div>

        {phases.length === 0 ? <Card className="p-8 text-center"><Target className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No phases yet")}</h3></Card> : (
          <div className="space-y-3">{phases.map((p: any) => {
            const strategy = strategyOf(p);
            const complete = p.gate_status === "complete" || (p.progress ?? 0) >= 100;
            const prog = complete ? 100 : phaseProgress(p);
            const signed = p.gate_status === "signed_off";
            const dod = Array.isArray(p.dod_checklist) ? p.dod_checklist : [];
            const dodDone = dod.filter((it: any) => it?.done).length;
            return (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3 flex-wrap">
                      <span className="font-semibold">{p.phase}</span>
                      <Badge variant="outline" className="text-xs">{p.methodology}</Badge>
                      <Badge variant="secondary" className="text-xs" title={STRATEGY_LABEL[strategy]}>{STRATEGY_LABEL[strategy]}</Badge>
                      <Badge className={`text-xs ${complete ? "bg-green-100 text-green-700" : signed ? "bg-amber-100 text-amber-700" : prog > 0 ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"}`}>{complete ? pt("completed") : signed ? pt("gate signed off") : prog > 0 ? pt("in progress") : pt("not started")}</Badge>
                    </div>
                    <div className="flex gap-1">
                      {!complete && strategy === "predictive" && !signed && <Button variant="ghost" size="sm" title={pt("Sign off gate")} onClick={() => signOff(p)}><Stamp className="h-3.5 w-3.5 text-amber-600" /></Button>}
                      {!complete && strategy === "adaptive" && <Button variant="ghost" size="sm" title={pt("Definition of Done")} onClick={() => openDod(p)}><ListChecks className="h-3.5 w-3.5 text-purple-600" /></Button>}
                      {!complete && <Button variant="ghost" size="sm" title={pt("Complete phase")} onClick={() => markComplete(p)}>{strategy === "predictive" ? <ShieldCheck className="h-3.5 w-3.5 text-green-600" /> : <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />}</Button>}
                      <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </div>
                  {p.description && <p className="text-sm text-muted-foreground mb-2">{p.description}</p>}
                  <div className="text-xs text-muted-foreground mb-2 flex items-center gap-3">
                    <span>{p.start_date || "—"} → {p.end_date || "—"}</span>
                    {strategy === "adaptive" && dod.length > 0 && <span className="inline-flex items-center gap-1"><ListChecks className="h-3 w-3" />{dodDone}/{dod.length} DoD</span>}
                  </div>
                  <div className="flex items-center gap-3"><Progress value={prog} className="h-2 flex-1" /><span className="text-xs font-medium w-10 text-right">{prog}%</span></div>
                </CardContent>
              </Card>
            );
          })}</div>
        )}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent>
        <DialogHeader><DialogTitle>{editing ? pt("Edit Phase") : pt("New Phase")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Phase Name")} *</Label><Input value={form.phase} onChange={e => setForm({ ...form, phase: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>{pt("Methodology")}</Label><Select value={form.methodology} onValueChange={v => setForm({ ...form, methodology: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{METHODOLOGIES.map(m => <SelectItem key={m} value={m}>{m}</SelectItem>)}</SelectContent></Select></div>
            <div className="space-y-2"><Label>{pt("Order")}</Label><Input type="number" value={form.order} onChange={e => setForm({ ...form, order: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2"><Label>{pt("Start Date")}</Label><Input type="date" value={form.start_date} onChange={e => setForm({ ...form, start_date: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("End Date")}</Label><Input type="date" value={form.end_date} onChange={e => setForm({ ...form, end_date: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>{pt("Progress")} (%)</Label><Input type="number" min="0" max="99" value={form.progress} onChange={e => setForm({ ...form, progress: e.target.value })} /><p className="text-xs text-muted-foreground">{pt("100% is set by completing the phase through its gate — not here.")}</p></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>

      <Dialog open={!!dodPhase} onOpenChange={(o) => !o && setDodPhase(null)}><DialogContent>
        <DialogHeader><DialogTitle>{pt("Definition of Done")} — {dodPhase?.phase}</DialogTitle></DialogHeader>
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">{pt("Every item must be checked (and all phase tasks Done) before this adaptive phase can complete.")}</p>
          <div className="space-y-2">
            {dodItems.length === 0 && <p className="text-sm text-muted-foreground">{pt("No criteria yet.")}</p>}
            {dodItems.map((it, i) => (
              <div key={i} className="flex items-center gap-2">
                <input type="checkbox" checked={!!it.done} onChange={() => toggleDodItem(i)} className="h-4 w-4" />
                <span className={`flex-1 text-sm ${it.done ? "line-through text-muted-foreground" : ""}`}>{it.text}</span>
                <Button variant="ghost" size="sm" onClick={() => removeDodItem(i)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            ))}
          </div>
          <div className="flex gap-2">
            <Input value={dodNew} placeholder={pt("Add a Done criterion")} onChange={e => setDodNew(e.target.value)} onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addDodItem(); } }} />
            <Button onClick={addDodItem}><Plus className="h-4 w-4" /></Button>
          </div>
          <div className="flex justify-end"><Button variant="outline" onClick={() => setDodPhase(null)}>{pt("Close")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default HybridPhases;
