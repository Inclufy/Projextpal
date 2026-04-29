import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, FileBarChart, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";

const fetchJson = async (url: string) => {
  const token = localStorage.getItem("access_token");
  const r = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
  if (!r.ok) return null;
  return r.json();
};
const toArr = (d: any) => (Array.isArray(d) ? d : d?.results || []);

const TEST_TYPES = [
  { value: "t_test", label: "T-Test" },
  { value: "z_test", label: "Z-Test" },
  { value: "chi_square", label: "Chi-Square" },
  { value: "anova", label: "ANOVA" },
  { value: "f_test", label: "F-Test" },
  { value: "mann_whitney", label: "Mann-Whitney U" },
  { value: "kruskal_wallis", label: "Kruskal-Wallis" },
];

const LSSBlackHypothesisTests = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const qc = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ test_type: "t_test", null_hypothesis: "", alternative_hypothesis: "", alpha: "0.05", p_value: "", test_statistic: "", sample_size: "", conclusion: "", notes: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const testsQ = useQuery({ queryKey: ["lssb-hypo", id], queryFn: () => fetchJson(`/api/v1/lss-black/projects/${id}/hypothesis-tests/`), enabled: !!id });
  const tests = toArr(testsQ.data);
  const refresh = () => qc.invalidateQueries({ queryKey: ["lssb-hypo", id] });

  const openCreate = () => { setEditing(null); setForm({ test_type: "t_test", null_hypothesis: "", alternative_hypothesis: "", alpha: "0.05", p_value: "", test_statistic: "", sample_size: "", conclusion: "", notes: "" }); setDialogOpen(true); };
  const openEdit = (t: any) => { setEditing(t); setForm({ test_type: t.test_type, null_hypothesis: t.null_hypothesis || "", alternative_hypothesis: t.alternative_hypothesis || "", alpha: String(t.alpha ?? "0.05"), p_value: String(t.p_value ?? ""), test_statistic: String(t.test_statistic ?? ""), sample_size: String(t.sample_size ?? ""), conclusion: t.conclusion || "", notes: t.notes || "" }); setDialogOpen(true); };

  const handleSave = async () => {
    if (!form.null_hypothesis || !form.alternative_hypothesis) { toast.error(pt("Hypotheses are required")); return; }
    setSubmitting(true);
    try {
      const body: any = { test_type: form.test_type, null_hypothesis: form.null_hypothesis, alternative_hypothesis: form.alternative_hypothesis, conclusion: form.conclusion, notes: form.notes };
      if (form.alpha) body.alpha = parseFloat(form.alpha);
      if (form.p_value !== "") body.p_value = parseFloat(form.p_value);
      if (form.test_statistic !== "") body.test_statistic = parseFloat(form.test_statistic);
      if (form.sample_size !== "") body.sample_size = parseInt(form.sample_size);
      const url = editing ? `/api/v1/lss-black/projects/${id}/hypothesis-tests/${editing.id}/` : `/api/v1/lss-black/projects/${id}/hypothesis-tests/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); setDialogOpen(false); refresh(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (tId: string) => {
    if (!confirm(pt("Delete this test?"))) return;
    try { const r = await fetch(`/api/v1/lss-black/projects/${id}/hypothesis-tests/${tId}/`, { method: "DELETE", headers }); if (r.ok || r.status === 204) { toast.success(pt("Deleted")); refresh(); } } catch { toast.error(pt("Delete failed")); }
  };

  if (testsQ.isLoading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><FileBarChart className="h-6 w-6 text-blue-500" /><h1 className="text-2xl font-bold">{pt("Hypothesis Tests")}</h1><Badge variant="outline">{tests.length}</Badge></div>
          <Button onClick={openCreate} className="gap-2"><Plus className="h-4 w-4" /> {pt("New Test")}</Button>
        </div>

        <Card><CardContent className="p-0">
          {tests.length === 0 ? <p className="text-center text-muted-foreground py-12">{pt("No hypothesis tests yet")}</p> : (
            <div className="overflow-x-auto"><table className="w-full text-sm">
              <thead className="bg-muted/50 text-xs"><tr><th className="text-left p-3">{pt("Type")}</th><th className="text-left p-3">{pt("H0")} / {pt("H1")}</th><th className="text-left p-3">α</th><th className="text-left p-3">p-value</th><th className="text-left p-3">{pt("Stat")}</th><th className="text-left p-3">n</th><th className="text-left p-3">{pt("Reject H0")}</th><th className="p-3"></th></tr></thead>
              <tbody className="divide-y">{tests.map((t: any) => (
                <tr key={t.id} className="hover:bg-muted/30 align-top">
                  <td className="p-3"><Badge variant="outline">{t.test_type_display || t.test_type}</Badge></td>
                  <td className="p-3 text-xs max-w-md"><div className="text-muted-foreground"><strong>H0:</strong> {t.null_hypothesis}</div><div className="text-muted-foreground mt-1"><strong>H1:</strong> {t.alternative_hypothesis}</div></td>
                  <td className="p-3 font-mono">{t.alpha ?? "—"}</td>
                  <td className="p-3 font-mono">{t.p_value ?? "—"}</td>
                  <td className="p-3 font-mono">{t.test_statistic ?? "—"}</td>
                  <td className="p-3 font-mono">{t.sample_size ?? "—"}</td>
                  <td className="p-3">{t.reject_null === true ? <Badge className="bg-red-100 text-red-700">Yes</Badge> : t.reject_null === false ? <Badge className="bg-green-100 text-green-700">No</Badge> : "—"}</td>
                  <td className="p-3 text-right whitespace-nowrap"><Button variant="ghost" size="sm" onClick={() => openEdit(t)}><Pencil className="h-3.5 w-3.5" /></Button><Button variant="ghost" size="sm" onClick={() => handleDelete(t.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button></td>
                </tr>
              ))}</tbody>
            </table></div>
          )}
        </CardContent></Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}><DialogContent className="max-w-lg">
        <DialogHeader><DialogTitle>{editing ? pt("Edit Test") : pt("New Hypothesis Test")}</DialogTitle></DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2"><Label>{pt("Test Type")}</Label><Select value={form.test_type} onValueChange={v => setForm({ ...form, test_type: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TEST_TYPES.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}</SelectContent></Select></div>
          <div className="space-y-2"><Label>{pt("Null Hypothesis (H0)")} *</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.null_hypothesis} onChange={e => setForm({ ...form, null_hypothesis: e.target.value })} /></div>
          <div className="space-y-2"><Label>{pt("Alternative Hypothesis (H1)")} *</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.alternative_hypothesis} onChange={e => setForm({ ...form, alternative_hypothesis: e.target.value })} /></div>
          <div className="grid grid-cols-4 gap-3">
            <div className="space-y-2"><Label>α</Label><Input type="number" step="0.01" value={form.alpha} onChange={e => setForm({ ...form, alpha: e.target.value })} /></div>
            <div className="space-y-2"><Label>p-value</Label><Input type="number" step="any" value={form.p_value} onChange={e => setForm({ ...form, p_value: e.target.value })} /></div>
            <div className="space-y-2"><Label>{pt("Statistic")}</Label><Input type="number" step="any" value={form.test_statistic} onChange={e => setForm({ ...form, test_statistic: e.target.value })} /></div>
            <div className="space-y-2"><Label>n</Label><Input type="number" value={form.sample_size} onChange={e => setForm({ ...form, sample_size: e.target.value })} /></div>
          </div>
          <div className="space-y-2"><Label>{pt("Conclusion")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.conclusion} onChange={e => setForm({ ...form, conclusion: e.target.value })} /></div>
          <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button><Button onClick={handleSave} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}{pt("Save")}</Button></div>
        </div>
      </DialogContent></Dialog>
    </div>
  );
};

export default LSSBlackHypothesisTests;
