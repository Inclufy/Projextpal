import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, TestTube, Pencil, Trash2, FileText } from "lucide-react";
import { toast } from "sonner";

const WaterfallTesting = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tests, setTests] = useState<any[]>([]);
  const [requirements, setRequirements] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", test_type: "unit", test_steps: "", expected_result: "", requirement: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [tRes, sRes, rRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/waterfall/test-cases/`, { headers }),
        fetch(`/api/v1/projects/${id}/waterfall/test-cases/stats/`, { headers }),
        fetch(`/api/v1/projects/${id}/waterfall/requirements/`, { headers }),
      ]);
      if (tRes.ok) { const d = await tRes.json(); setTests(Array.isArray(d) ? d : d.results || []); }
      if (sRes.ok) setStats(await sRes.json());
      if (rRes.ok) { const d = await rRes.json(); setRequirements(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const openCreate = () => { setEditing(null); setForm({ name: "", description: "", test_type: "unit", test_steps: "", expected_result: "", requirement: "" }); setDialogOpen(true); };
  const openEdit = (t: any) => { setEditing(t); setForm({ name: t.name || "", description: t.description || "", test_type: t.test_type || "unit", test_steps: t.test_steps || "", expected_result: t.expected_result || "", requirement: t.requirement != null ? String(t.requirement) : "" }); setDialogOpen(true); };
  const handleSave = async () => {
    if (!form.name) { toast.error(pt("Name is required")); return; }
    setSubmitting(true);
    try {
      const body: any = { name: form.name, description: form.description, test_type: form.test_type, test_steps: form.test_steps, expected_result: form.expected_result };
      if (form.requirement !== "") body.requirement = parseInt(form.requirement);
      else if (editing) body.requirement = null;
      const url = editing ? `/api/v1/projects/${id}/waterfall/test-cases/${editing.id}/` : `/api/v1/projects/${id}/waterfall/test-cases/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); fetchData(); } else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); } finally { setSubmitting(false); }
  };
  const handleDelete = async (tId: number) => { if (!confirm(pt("Are you sure you want to delete this?"))) return; try { const r = await fetch(`/api/v1/projects/${id}/waterfall/test-cases/${tId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchData(); } } catch { toast.error(pt("Delete failed")); } };
  const handleExecute = async (tId: number, status: string) => { try { const r = await fetch(`/api/v1/projects/${id}/waterfall/test-cases/${tId}/execute/`, { method: "POST", headers: jsonHeaders, body: JSON.stringify({ status }) }); if (r.ok) { toast.success(pt("Saved")); fetchData(); } } catch { toast.error(pt("Action failed")); } };

  const resultColors: Record<string, string> = { passed: "bg-green-100 text-green-700", failed: "bg-red-100 text-red-700", blocked: "bg-yellow-100 text-yellow-700", skipped: "bg-blue-100 text-blue-700", pending: "bg-gray-100 text-gray-700" };
  const reqById = (rId: number | null | undefined) => requirements.find(r => r.id === rId);
  const reqLabel = (r: any) => {
    if (!r) return "";
    const title = (r.title || "").length > 50 ? `${(r.title || "").slice(0, 47)}...` : (r.title || "");
    return r.requirement_id ? `${r.requirement_id}: ${title}` : title;
  };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><TestTube className="h-6 w-6 text-purple-500" /><h1 className="text-2xl font-bold">{pt("Testing")}</h1><Badge variant="outline">{tests.length}</Badge></div><Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("Add")}</Button></div>
        {stats && <div className="grid grid-cols-4 gap-4"><Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Total</p><p className="text-2xl font-bold">{stats.total || 0}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">✅ Passed</p><p className="text-2xl font-bold text-green-600">{stats.passed || 0}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">❌ Failed</p><p className="text-2xl font-bold text-red-600">{stats.failed || 0}</p></CardContent></Card><Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">⏳ Pending</p><p className="text-2xl font-bold text-gray-600">{stats.not_executed || 0}</p></CardContent></Card></div>}
        {tests.length === 0 ? <Card className="p-8 text-center"><TestTube className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">No test cases yet</h3></Card> : (
          <div className="space-y-2">{tests.map(t => {
            const linkedReq = reqById(t.requirement);
            const reqRefId = t.requirement_id_ref || linkedReq?.requirement_id;
            return (
            <Card key={t.id}><CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1 flex-wrap"><span className="font-medium">{t.name}</span><Badge variant="outline" className="text-xs">{t.test_type}</Badge><Badge className={`text-xs ${resultColors[t.status || "pending"]}`}>{t.status || "pending"}</Badge>
                  {(linkedReq || reqRefId) && (
                    <Badge
                      variant="outline"
                      className="text-xs cursor-pointer hover:bg-muted gap-1"
                      onClick={(e) => { e.stopPropagation(); navigate(`/projects/${id}/waterfall/requirements?highlight=${t.requirement}`); }}
                      title={pt("Open linked requirement")}
                    >
                      <FileText className="h-3 w-3" /> {linkedReq ? reqLabel(linkedReq) : reqRefId}
                    </Badge>
                  )}
                </div>
                {t.description && <p className="text-sm text-muted-foreground">{t.description}</p>}
              </div>
              <div className="flex gap-1">
                <Button variant="ghost" size="sm" onClick={() => handleExecute(t.id, "passed")} title="Pass"><span className="text-green-500">✅</span></Button>
                <Button variant="ghost" size="sm" onClick={() => handleExecute(t.id, "failed")} title="Fail"><span className="text-red-500">❌</span></Button>
                <Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
              </div>
            </CardContent></Card>
          );})}</div>
        )}
      </div>
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent><DialogHeader><DialogTitle>{editing ? pt("Edit") : pt("Add")} Test Case</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4"><div className="space-y-2"><Label>{pt("Name")} *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div><div className="space-y-2"><Label>Type</Label><Select value={form.test_type} onValueChange={(v) => setForm({ ...form, test_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="unit">Unit</SelectItem><SelectItem value="integration">Integration</SelectItem><SelectItem value="system">System</SelectItem><SelectItem value="acceptance">Acceptance</SelectItem><SelectItem value="regression">Regression</SelectItem><SelectItem value="performance">Performance</SelectItem></SelectContent></Select></div></div>
          <div className="space-y-2">
            <Label>{pt("Requirement")} ({pt("traceability link")})</Label>
            <Select value={form.requirement || "__none__"} onValueChange={(v) => setForm({ ...form, requirement: v === "__none__" ? "" : v })}>
              <SelectTrigger><SelectValue placeholder={pt("Pick the requirement this test verifies (optional)")} /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none__">{pt("None")}</SelectItem>
                {requirements.length === 0 && <div className="px-2 py-1.5 text-xs text-muted-foreground">{pt("No requirements yet — add some on the Requirements page first.")}</div>}
                {requirements.map(r => (
                  <SelectItem key={r.id} value={String(r.id)}>{reqLabel(r)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2"><Label>{pt("Description")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
          <div className="space-y-2"><Label>Steps</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.test_steps} onChange={(e) => setForm({ ...form, test_steps: e.target.value })} /></div>
          <div className="space-y-2"><Label>Expected Result</Label><textarea className="w-full min-h-[40px] px-3 py-2 border rounded-md bg-background" value={form.expected_result} onChange={(e) => setForm({ ...form, expected_result: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default WaterfallTesting;
