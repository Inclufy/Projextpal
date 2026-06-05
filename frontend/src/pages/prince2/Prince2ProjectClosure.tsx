import { useState, useEffect, type Dispatch, type SetStateAction } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectSignOffDialog } from "@/components/ProjectSignOffDialog";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Label } from "@/components/ui/label";
import { Loader2, Save, FileCheck, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

type ClosureReportForm = {
  achievements_summary: string;
  performance_against_plan: string;
  benefits_achieved: string;
  quality_review: string;
  follow_on_actions: string;
};

// Module scope keeps Field's identity stable — defining it inside the component remounts it (and drops input focus) on every keystroke.
const Field = ({ label, field, form, setForm }: {
  label: string;
  field: keyof ClosureReportForm;
  form: ClosureReportForm;
  setForm: Dispatch<SetStateAction<ClosureReportForm>>;
}) => (
  <div className="space-y-2">
    <Label>{label}</Label>
    <textarea
      className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background resize-y"
      value={form[field] || ""}
      onChange={(e) => setForm((prev) => ({ ...prev, [field]: e.target.value }))}
    />
  </div>
);

const Prince2ProjectClosure = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [endReport, setEndReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [reportForm, setReportForm] = useState<ClosureReportForm>({ achievements_summary: "", performance_against_plan: "", benefits_achieved: "", quality_review: "", follow_on_actions: "" });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const erRes = await fetch(`/api/v1/projects/${id}/prince2/end-project-report/`, { headers });
      if (erRes.ok) {
        const d = await erRes.json();
        const list = Array.isArray(d) ? d : d.results || [];
        if (list.length > 0) {
          setEndReport(list[0]);
          const r = list[0];
          setReportForm({
            achievements_summary: r.achievements_summary || "", performance_against_plan: r.performance_against_plan || "",
            benefits_achieved: r.benefits_achieved || "", quality_review: r.quality_review || "", follow_on_actions: r.follow_on_actions || "",
          });
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const saveReport = async () => {
    setSaving(true);
    try {
      const url = endReport ? `/api/v1/projects/${id}/prince2/end-project-report/${endReport.id}/` : `/api/v1/projects/${id}/prince2/end-project-report/`;
      const method = endReport ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(reportForm) });
      if (r.ok) { setEndReport(await r.json()); toast.success(pt("Saved")); if (!endReport) fetchData(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSaving(false); }
  };

  const approveReport = async () => {
    if (!endReport) return;
    try {
      const r = await fetch(`/api/v1/projects/${id}/prince2/end-project-report/${endReport.id}/approve/`, { method: "POST", headers: jsonHeaders });
      if (r.ok) { toast.success(pt("Approved")); fetchData(); }
      else { const d = await r.json().catch(() => null); toast.error(d?.detail || pt("Cannot close yet — closure preconditions not met."), { duration: 6000 }); }
    } catch { toast.error(pt("Action failed")); }
  };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><FileCheck className="h-6 w-6 text-green-500" /><div><h1 className="text-2xl font-bold">{pt("End Project Report")}</h1>{endReport && <Badge className="mt-1">{endReport.status}</Badge>}</div></div>
          <div className="flex gap-2">
            {endReport && endReport.status !== "approved" && <Button variant="outline" onClick={approveReport} className="gap-2 text-green-600"><CheckCircle2 className="h-4 w-4" /> {pt("Approve")}</Button>}
            <Button onClick={saveReport} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {pt("Save")}</Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardHeader><CardTitle>{pt("Achievements Summary")}</CardTitle></CardHeader><CardContent><Field label={pt("Achievements Summary")} field="achievements_summary" form={reportForm} setForm={setReportForm} /><Field label={pt("Performance Against Plan")} field="performance_against_plan" form={reportForm} setForm={setReportForm} /></CardContent></Card>
          <Card><CardHeader><CardTitle>{pt("Closure Details")}</CardTitle></CardHeader><CardContent><Field label={pt("Benefits Achieved")} field="benefits_achieved" form={reportForm} setForm={setReportForm} /><Field label={pt("Quality Review")} field="quality_review" form={reportForm} setForm={setReportForm} /><Field label={pt("Follow-on Actions")} field="follow_on_actions" form={reportForm} setForm={setReportForm} /></CardContent></Card>
        </div>

        {/* Senior Manager sign-off (signature) — enforced closing gate, Yanmar PP-07 */}
        <Card>
          <CardHeader><CardTitle>{pt("Senior Manager Sign-off")}</CardTitle></CardHeader>
          <CardContent>{id && <ProjectSignOffDialog projectId={id} />}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Prince2ProjectClosure;
