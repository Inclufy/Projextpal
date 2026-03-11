import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, Save, FileText, Send, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const Prince2ProjectBrief = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [brief, setBrief] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    project_definition: "", project_approach: "", outline_business_case: "",
    project_scope: "", constraints: "", assumptions: "", dependencies: "",
    customer_quality_expectations: "", acceptance_criteria: "",
  });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchBrief = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/brief/`, { headers });
      if (response.ok) {
        const data = await response.json();
        const list = Array.isArray(data) ? data : data.results || [];
        if (list.length > 0) {
          setBrief(list[0]);
          setForm({
            project_definition: list[0].project_definition || "",
            project_approach: list[0].project_approach || "",
            outline_business_case: list[0].outline_business_case || "",
            project_scope: list[0].project_scope || "",
            constraints: list[0].constraints || "",
            assumptions: list[0].assumptions || "",
            dependencies: list[0].dependencies || "",
            customer_quality_expectations: list[0].customer_quality_expectations || "",
            acceptance_criteria: list[0].acceptance_criteria || "",
          });
        }
      }
    } catch (err) {
      console.error("Failed to fetch brief", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBrief(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = brief
        ? `/api/v1/projects/${id}/prince2/brief/${brief.id}/`
        : `/api/v1/projects/${id}/prince2/brief/`;
      const method = brief ? "PATCH" : "POST";
      const response = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(form) });
      if (response.ok) {
        const data = await response.json();
        setBrief(data);
        toast.success(brief ? pt("Updated") : pt("Created"));
      } else {
        toast.error(pt("Save failed"));
      }
    } catch { toast.error(pt("Save failed")); }
    finally { setSaving(false); }
  };

  const handleSubmitForReview = async () => {
    if (!brief) return;
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/brief/${brief.id}/submit_for_review/`, {
        method: "POST", headers: jsonHeaders,
      });
      if (response.ok) { toast.success(pt("Submitted for review")); fetchBrief(); }
      else toast.error(pt("Action failed"));
    } catch { toast.error(pt("Action failed")); }
  };

  const handleApprove = async () => {
    if (!brief) return;
    try {
      const response = await fetch(`/api/v1/projects/${id}/prince2/brief/${brief.id}/approve/`, {
        method: "POST", headers: jsonHeaders,
      });
      if (response.ok) { toast.success(pt("Approved")); fetchBrief(); }
      else toast.error(pt("Action failed"));
    } catch { toast.error(pt("Action failed")); }
  };

  const Field = ({ label, field, multiline = false }: { label: string; field: string; multiline?: boolean }) => (
    <div className="space-y-2">
      <Label>{label}</Label>
      {multiline ? (
        <textarea
          className="w-full min-h-[100px] px-3 py-2 border rounded-md bg-background resize-y"
          value={(form as any)[field] || ""}
          onChange={(e) => setForm({ ...form, [field]: e.target.value })}
        />
      ) : (
        <Input value={(form as any)[field] || ""} onChange={(e) => setForm({ ...form, [field]: e.target.value })} />
      )}
    </div>
  );

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
            <FileText className="h-6 w-6 text-blue-500" />
            <div>
              <h1 className="text-2xl font-bold">{pt("Project Brief")}</h1>
              {brief && <Badge className="mt-1">{brief.status}</Badge>}
            </div>
          </div>
          <div className="flex gap-2">
            {brief && brief.status === "draft" && (
              <Button variant="outline" onClick={handleSubmitForReview} className="gap-2">
                <Send className="h-4 w-4" /> {pt("Submit for Review")}
              </Button>
            )}
            {brief && brief.status === "in_review" && (
              <Button variant="outline" onClick={handleApprove} className="gap-2 text-green-600">
                <CheckCircle2 className="h-4 w-4" /> {pt("Approve")}
              </Button>
            )}
            <Button onClick={handleSave} disabled={saving} className="gap-2">
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
              {pt("Save")}
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle>{pt("Project Definition")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label={pt("Project Definition")} field="project_definition" multiline />
              <Field label={pt("Project Approach")} field="project_approach" multiline />
              <Field label={pt("Project Scope")} field="project_scope" multiline />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>Business Case</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label={pt("Outline Business Case")} field="outline_business_case" multiline />
              <Field label={pt("Constraints")} field="constraints" multiline />
              <Field label={pt("Assumptions")} field="assumptions" multiline />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{pt("Quality")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <Field label={pt("Customer Quality Expectations")} field="customer_quality_expectations" multiline />
              <Field label={pt("Acceptance Criteria")} field="acceptance_criteria" multiline />
            </CardContent>
          </Card>

          <Card>
            <CardHeader><CardTitle>{pt("Dependencies")}</CardTitle></CardHeader>
            <CardContent>
              <Field label={pt("Dependencies")} field="dependencies" multiline />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Prince2ProjectBrief;
