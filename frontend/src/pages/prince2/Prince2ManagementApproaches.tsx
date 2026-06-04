import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, ShieldAlert, ClipboardCheck, MessageSquare, GitBranch } from "lucide-react";
import { toast } from "sonner";

const APPROACHES = [
  { type: "risk", label: "Risk Management Approach", icon: ShieldAlert, color: "text-amber-500" },
  { type: "quality", label: "Quality Management Approach", icon: ClipboardCheck, color: "text-teal-500" },
  { type: "communication", label: "Communication Management Approach", icon: MessageSquare, color: "text-blue-500" },
  { type: "change_control", label: "Change Control Approach", icon: GitBranch, color: "text-purple-500" },
];
const statusColors: Record<string, string> = { draft: "bg-gray-100 text-gray-700", approved: "bg-green-100 text-green-700", baselined: "bg-purple-100 text-purple-700" };

const Prince2ManagementApproaches = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ approach_type: "risk", introduction: "", procedure: "", roles_responsibilities: "", tools_techniques: "", reporting: "", scales_definitions: "", status: "draft" });
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/prince2/approaches/`, { headers }); if (r.ok) { const d = await r.json(); setItems(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);
  const byType = (t: string) => items.find((i) => i.approach_type === t);
  const initialize = async () => { try { const r = await fetch(`/api/v1/projects/${id}/prince2/approaches/initialize/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success(pt("Saved")); fetchData(); } else toast.error(pt("Action failed")); } catch { toast.error(pt("Action failed")); } };
  const openEdit = (type: string) => {
    const existing = byType(type);
    setEditing(existing || null);
    setForm({ approach_type: type, introduction: existing?.introduction || "", procedure: existing?.procedure || "", roles_responsibilities: existing?.roles_responsibilities || "", tools_techniques: existing?.tools_techniques || "", reporting: existing?.reporting || "", scales_definitions: existing?.scales_definitions || "", status: existing?.status || "draft" });
    setDialogOpen(true);
  };
  const handleSave = async () => {
    setSubmitting(true);
    try {
      const url = editing ? `/api/v1/projects/${id}/prince2/approaches/${editing.id}/` : `/api/v1/projects/${id}/prince2/approaches/`;
      const r = await fetch(url, { method: editing ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(form) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); }
  };
  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);
  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center justify-between"><div><h1 className="text-2xl font-bold">{pt("Management Approaches")}</h1><p className="text-xs text-muted-foreground">{pt("The four PRINCE2 strategy documents referenced by the PID")}</p></div>{items.length < 4 && <Button onClick={initialize} variant="outline" className="gap-2"><Plus className="h-4 w-4" /> {pt("Initialize all four")}</Button>}</div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {APPROACHES.map(({ type, label, icon: Icon, color }) => {
          const a = byType(type);
          return (
            <Card key={type} className="flex flex-col">
              <CardHeader className="pb-2"><div className="flex items-center justify-between"><CardTitle className="text-base flex items-center gap-2"><Icon className={`h-5 w-5 ${color}`} /> {pt(label)}</CardTitle><div className="flex items-center gap-2">{a && <Badge className={`text-xs ${statusColors[a.status] || ""}`}>{a.status}</Badge>}<Button variant="ghost" size="sm" onClick={() => openEdit(type)}><Pencil className="h-3.5 w-3.5" /></Button></div></div></CardHeader>
              <CardContent className="text-sm space-y-2 flex-1">
                {a ? (
                  <>
                    {a.introduction && <p><span className="font-medium">{pt("Introduction")}:</span> {a.introduction}</p>}
                    {a.procedure && <p className="text-muted-foreground"><span className="font-medium">{pt("Procedure")}:</span> {a.procedure}</p>}
                    {a.scales_definitions && <p className="text-xs"><span className="font-medium">{pt("Scales")}:</span> {a.scales_definitions}</p>}
                    {!a.introduction && !a.procedure && <p className="text-muted-foreground italic">{pt("Draft — click edit to fill in.")}</p>}
                  </>
                ) : <p className="text-muted-foreground italic">{pt("Not created yet.")}</p>}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-h-[90vh] overflow-y-auto"><DialogHeader><DialogTitle>{pt(APPROACHES.find(a => a.type === form.approach_type)?.label || "Approach")}</DialogTitle></DialogHeader><div className="space-y-4">
      <div className="space-y-2"><Label>{pt("Introduction / Purpose")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.introduction} onChange={(e) => setForm({ ...form, introduction: e.target.value })} /></div>
      <div className="space-y-2"><Label>{pt("Procedure")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.procedure} onChange={(e) => setForm({ ...form, procedure: e.target.value })} /></div>
      <div className="space-y-2"><Label>{pt("Roles & Responsibilities")}</Label><textarea className="w-full min-h-[50px] px-3 py-2 border rounded-md bg-background" value={form.roles_responsibilities} onChange={(e) => setForm({ ...form, roles_responsibilities: e.target.value })} /></div>
      <div className="space-y-2"><Label>{pt("Tools & Techniques")}</Label><textarea className="w-full min-h-[50px] px-3 py-2 border rounded-md bg-background" value={form.tools_techniques} onChange={(e) => setForm({ ...form, tools_techniques: e.target.value })} /></div>
      <div className="space-y-2"><Label>{pt("Reporting & Timing")}</Label><textarea className="w-full min-h-[50px] px-3 py-2 border rounded-md bg-background" value={form.reporting} onChange={(e) => setForm({ ...form, reporting: e.target.value })} /></div>
      <div className="space-y-2"><Label>{pt("Scales / Definitions")}</Label><textarea className="w-full min-h-[50px] px-3 py-2 border rounded-md bg-background" value={form.scales_definitions} onChange={(e) => setForm({ ...form, scales_definitions: e.target.value })} /></div>
      <div className="space-y-2"><Label>{pt("Status")}</Label><Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="draft">draft</SelectItem><SelectItem value="approved">approved</SelectItem><SelectItem value="baselined">baselined</SelectItem></SelectContent></Select></div>
      <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
    </div></DialogContent></Dialog>
    </div>
  );
};
export default Prince2ManagementApproaches;
