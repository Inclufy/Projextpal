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
import { Loader2, Save, Briefcase, Plus, Trash2, CheckCircle2, DollarSign, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

const Prince2BusinessCase = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [bc, setBc] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [benefitDialog, setBenefitDialog] = useState(false);
  const [riskDialog, setRiskDialog] = useState(false);
  const [benefitForm, setBenefitForm] = useState({ description: "", category: "financial", expected_value: "" });
  const [riskForm, setRiskForm] = useState({ description: "", probability: "medium", impact: "medium", mitigation: "" });
  const [form, setForm] = useState({
    executive_summary: "", reasons: "", expected_benefits: "",
    development_costs: "", ongoing_costs: "", investment_appraisal: "",
    major_risks: "", timescale: "",
  });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchBC = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/business-case/`, { headers });
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : data.results || [];
        if (list.length > 0) {
          setBc(list[0]);
          const d = list[0];
          setForm({
            executive_summary: d.executive_summary || "", reasons: d.reasons || "",
            expected_benefits: d.expected_benefits || "", development_costs: d.development_costs || "",
            ongoing_costs: d.ongoing_costs || "", investment_appraisal: d.investment_appraisal || "",
            major_risks: d.major_risks || "", timescale: d.timescale || "",
          });
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchBC(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = bc ? `/api/v1/projects/${id}/prince2/business-case/${bc.id}/` : `/api/v1/projects/${id}/prince2/business-case/`;
      const method = bc ? "PATCH" : "POST";
      const response = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(form) });
      if (response.ok) { setBc(await response.json()); toast.success(pt("Saved")); if (!bc) fetchBC(); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSaving(false); }
  };

  const handleApprove = async () => {
    if (!bc) return;
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/business-case/${bc.id}/approve/`, { method: "POST", headers: jsonHeaders });
      if (response.ok) { toast.success(pt("Approved")); fetchBC(); }
      else toast.error(pt("Action failed"));
    } catch { toast.error(pt("Action failed")); }
  };

  const addBenefit = async () => {
    if (!bc || !benefitForm.description) return;
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/business-case/${bc.id}/add_benefit/`, {
        method: "POST", headers: jsonHeaders, body: JSON.stringify(benefitForm),
      });
      if (response.ok) { toast.success(pt("Created")); setBenefitDialog(false); setBenefitForm({ description: "", category: "financial", expected_value: "" }); fetchBC(); }
      else toast.error(pt("Create failed"));
    } catch { toast.error(pt("Create failed")); }
  };

  const addRisk = async () => {
    if (!bc || !riskForm.description) return;
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/business-case/${bc.id}/add_risk/`, {
        method: "POST", headers: jsonHeaders, body: JSON.stringify(riskForm),
      });
      if (response.ok) { toast.success(pt("Created")); setRiskDialog(false); setRiskForm({ description: "", probability: "medium", impact: "medium", mitigation: "" }); fetchBC(); }
      else toast.error(pt("Create failed"));
    } catch { toast.error(pt("Create failed")); }
  };

  const deleteBenefit = async (bId: number) => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/prince2/benefits/${bId}/`, { method: "DELETE", headers });
      if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchBC(); }
    } catch { toast.error(pt("Delete failed")); }
  };

  const deleteRisk = async (rId: number) => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/prince2/bc-risks/${rId}/`, { method: "DELETE", headers });
      if (r.ok || r.status === 204) { toast.success(pt("Deleted")); fetchBC(); }
    } catch { toast.error(pt("Delete failed")); }
  };

  const Field = ({ label, field, multiline = false }: { label: string; field: string; multiline?: boolean }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {multiline ? (
        <textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background resize-y" value={(form as any)[field] || ""} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
      ) : (
        <Input value={(form as any)[field] || ""} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
      )}
    </div>
  );

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Briefcase className="h-6 w-6 text-green-500" />
            <div><h1 className="text-2xl font-bold">Business Case</h1>{bc && <Badge className="mt-1">{bc.status}</Badge>}</div>
          </div>
          <div className="flex gap-2">
            {bc && bc.status !== "approved" && (
              <Button variant="outline" onClick={handleApprove} className="gap-2 text-green-600"><CheckCircle2 className="h-4 w-4" /> {pt("Approve")}</Button>
            )}
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {pt("Save")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardHeader><CardTitle>{pt("Summary")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label="Executive Summary" field="executive_summary" multiline />
              <Field label={pt("Reasons")} field="reasons" multiline />
              <Field label={pt("Timescale")} field="timescale" />
            </CardContent>
          </Card>
          <Card><CardHeader><CardTitle>{pt("Costs")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label={pt("Development Costs")} field="development_costs" />
              <Field label={pt("Ongoing Costs")} field="ongoing_costs" />
              <Field label={pt("Investment Appraisal")} field="investment_appraisal" multiline />
              <Field label={pt("Major Risks")} field="major_risks" multiline />
            </CardContent>
          </Card>
        </div>

        {/* Benefits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><DollarSign className="h-5 w-5 text-green-500" /> {pt("Benefits")} ({bc?.benefits?.length || 0})</CardTitle>
            <Button size="sm" onClick={() => setBenefitDialog(true)} disabled={!bc}><Plus className="h-4 w-4 mr-1" /> {pt("Add")}</Button>
          </CardHeader>
          <CardContent>
            {(!bc?.benefits || bc.benefits.length === 0) ? <p className="text-muted-foreground text-center py-4">{pt("No benefits added yet")}</p> : (
              <div className="space-y-2">{bc.benefits.map((b: any) => (
                <div key={b.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div><p className="font-medium">{b.description}</p><div className="flex gap-2 mt-1"><Badge variant="outline" className="text-xs">{b.category}</Badge>{b.expected_value && <span className="text-sm text-muted-foreground">€{b.expected_value}</span>}</div></div>
                  <Button variant="ghost" size="sm" onClick={() => deleteBenefit(b.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}</div>
            )}
          </CardContent>
        </Card>

        {/* Risks */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-amber-500" /> {pt("Risks")} ({bc?.risks?.length || 0})</CardTitle>
            <Button size="sm" onClick={() => setRiskDialog(true)} disabled={!bc}><Plus className="h-4 w-4 mr-1" /> {pt("Add")}</Button>
          </CardHeader>
          <CardContent>
            {(!bc?.risks || bc.risks.length === 0) ? <p className="text-muted-foreground text-center py-4">{pt("No risks added yet")}</p> : (
              <div className="space-y-2">{bc.risks.map((r: any) => (
                <div key={r.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div><p className="font-medium">{r.description}</p><div className="flex gap-2 mt-1"><Badge variant="outline" className="text-xs">P: {r.probability}</Badge><Badge variant="outline" className="text-xs">I: {r.impact}</Badge></div>{r.mitigation && <p className="text-sm text-muted-foreground mt-1">{r.mitigation}</p>}</div>
                  <Button variant="ghost" size="sm" onClick={() => deleteRisk(r.id)}><Trash2 className="h-4 w-4 text-destructive" /></Button>
                </div>
              ))}</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Benefit Dialog */}
      <Dialog open={benefitDialog} onOpenChange={setBenefitDialog}>
        <DialogContent><DialogHeader><DialogTitle>{pt("Add")} Benefit</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Description")} *</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={benefitForm.description} onChange={(e) => setBenefitForm({ ...benefitForm, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Category")}</Label><Input value={benefitForm.category} onChange={(e) => setBenefitForm({ ...benefitForm, category: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Expected Value")} (€)</Label><Input type="number" value={benefitForm.expected_value} onChange={(e) => setBenefitForm({ ...benefitForm, expected_value: e.target.value })} /></div>
            </div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setBenefitDialog(false)}>{pt("Cancel")}</Button><Button onClick={addBenefit}>{pt("Add")}</Button></div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Risk Dialog */}
      <Dialog open={riskDialog} onOpenChange={setRiskDialog}>
        <DialogContent><DialogHeader><DialogTitle>{pt("Add")} Risico</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2"><Label>{pt("Description")} *</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={riskForm.description} onChange={(e) => setRiskForm({ ...riskForm, description: e.target.value })} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>{pt("Probability")}</Label><Input value={riskForm.probability} onChange={(e) => setRiskForm({ ...riskForm, probability: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Impact")}</Label><Input value={riskForm.impact} onChange={(e) => setRiskForm({ ...riskForm, impact: e.target.value })} /></div>
            </div>
            <div className="space-y-2"><Label>{pt("Mitigation")}</Label><textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={riskForm.mitigation} onChange={(e) => setRiskForm({ ...riskForm, mitigation: e.target.value })} /></div>
            <div className="flex justify-end gap-2"><Button variant="outline" onClick={() => setRiskDialog(false)}>{pt("Cancel")}</Button><Button onClick={addRisk}>{pt("Add")}</Button></div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Prince2BusinessCase;
