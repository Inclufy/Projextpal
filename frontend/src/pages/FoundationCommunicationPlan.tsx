import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ProjectHeader } from "@/components/ProjectHeader";
import { AIDraftButton } from "@/components/AIDraftButton";
import { Loader2, Plus, Pencil, Trash2, MessageSquare } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const EVENT_TYPES = [
  { v: "kickoff", l: "Kick-off" },
  { v: "onboarding", l: "Onboarding" },
  { v: "regular", l: "Regular update" },
  { v: "gate", l: "Stage / gate review" },
  { v: "closing", l: "Project closing" },
  { v: "other", l: "Other" },
];
const CADENCES = ["once", "weekly", "biweekly", "monthly", "quarterly"];
const STATUSES = ["planned", "done", "cancelled"];

const emptyForm = { event_type: "regular", cadence: "weekly", name: "", audience: "", scheduled_at: "", notes: "", status: "planned" };

const FoundationCommunicationPlan = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [events, setEvents] = useState<any[]>([]);
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
      const r = await fetch(`/api/v1/projects/plan-events/?project=${id}`, { headers });
      if (r.ok) { const d = await r.json(); setEvents(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = (event_type = "regular") => { setEditing(null); setForm({ ...emptyForm, event_type }); setDialogOpen(true); };
  const openEdit = (e: any) => {
    setEditing(e);
    setForm({
      event_type: e.event_type || "regular", cadence: e.cadence || "once", name: e.name || "",
      audience: Array.isArray(e.audience) ? e.audience.join(", ") : (e.audience || ""),
      scheduled_at: e.scheduled_at ? e.scheduled_at.slice(0, 16) : "", notes: e.notes || "", status: e.status || "planned",
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    setSubmitting(true);
    try {
      const body: any = {
        project: Number(id), event_type: form.event_type, cadence: form.cadence, name: form.name,
        audience: form.audience.split(",").map((s) => s.trim()).filter(Boolean),
        notes: form.notes, status: form.status,
      };
      if (form.scheduled_at) body.scheduled_at = form.scheduled_at;
      const url = editing ? `/api/v1/projects/plan-events/${editing.id}/` : `/api/v1/projects/plan-events/`;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (eid: number) => {
    if (!confirm(pt("Are you sure you want to delete this?"))) return;
    const r = await fetch(`/api/v1/projects/plan-events/${eid}/`, { method: "DELETE", headers });
    if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); }
  };

  const statusColor = (s: string) => ({ planned: "bg-blue-100 text-blue-700", done: "bg-green-100 text-green-700", cancelled: "bg-gray-100 text-gray-600" }[s] || "bg-gray-100");
  const typeLabel = (v: string) => EVENT_TYPES.find((t) => t.v === v)?.l || v;

  if (loading) return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </div>
  );

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <MessageSquare className="h-6 w-6 text-indigo-500" />
            <h1 className="text-2xl font-bold">{pt("Communication Plan")}</h1>
            <Badge variant="outline">{events.length}</Badge>
          </div>
          <div className="flex gap-2">
            <AIDraftButton
              draftUrl={`/api/v1/projects/${id}/ai/draft-comms/`}
              createUrl="/api/v1/projects/plan-events/"
              buildPayload={(d) => ({ project: Number(id), name: d.name, event_type: d.event_type, cadence: d.cadence, audience: d.audience || [], notes: d.notes || "", status: "planned" })}
              renderItem={(d) => (<span><span className="font-medium">{d.name}</span> <span className="text-xs text-muted-foreground">· {d.cadence} · {(d.audience || []).join(", ")}</span></span>)}
              onDone={fetchData}
              label={pt("AI Suggest")}
              title={pt("Suggested communication plan")}
            />
            <Button onClick={() => openCreate()} className="gap-2"><Plus className="h-4 w-4" />{pt("New Event")}</Button>
          </div>
        </div>

        {/* Grouped by lifecycle stage — Yanmar PP-08 */}
        {EVENT_TYPES.map((t) => {
          const list = events.filter((e) => e.event_type === t.v);
          if (t.v === "other" && list.length === 0) return null;
          return (
            <Card key={t.v}>
              <CardHeader className="flex flex-row items-center justify-between py-3">
                <CardTitle className="text-sm">{pt(t.l)} <span className="text-muted-foreground">({list.length})</span></CardTitle>
                <Button variant="ghost" size="sm" onClick={() => openCreate(t.v)}><Plus className="h-4 w-4" /></Button>
              </CardHeader>
              <CardContent className="space-y-2">
                {list.length === 0 ? <p className="text-xs text-muted-foreground italic">{pt("None yet")}</p> : list.map((e) => (
                  <div key={e.id} className="flex items-center justify-between border rounded-md p-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{e.name}</span>
                        <Badge variant="outline" className="text-xs">{e.cadence}</Badge>
                        <Badge className={`text-xs ${statusColor(e.status)}`}>{e.status}</Badge>
                      </div>
                      {Array.isArray(e.audience) && e.audience.length > 0 && <p className="text-xs text-muted-foreground mt-0.5">{pt("Audience")}: {e.audience.join(", ")}</p>}
                      {e.scheduled_at && <p className="text-xs text-muted-foreground">{new Date(e.scheduled_at).toLocaleString()}</p>}
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="sm" onClick={() => openEdit(e)}><Pencil className="h-3.5 w-3.5" /></Button>
                      <Button variant="ghost" size="sm" onClick={() => handleDelete(e.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md max-h-[85vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing ? pt("Edit Event") : pt("New Event")}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Name")}</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Type")}</Label>
                <Select value={form.event_type} onValueChange={(v) => setForm({ ...form, event_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{EVENT_TYPES.map((t) => <SelectItem key={t.v} value={t.v}>{pt(t.l)}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-2"><Label>{pt("Cadence")}</Label>
                <Select value={form.cadence} onValueChange={(v) => setForm({ ...form, cadence: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CADENCES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>{pt("Audience")} <span className="text-xs text-muted-foreground">({pt("comma-separated roles")})</span></Label><Input value={form.audience} onChange={(e) => setForm({ ...form, audience: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Scheduled at")}</Label><Input type="datetime-local" value={form.scheduled_at} onChange={(e) => setForm({ ...form, scheduled_at: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{STATUSES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2"><Label>{pt("Notes")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div>
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

export default FoundationCommunicationPlan;
