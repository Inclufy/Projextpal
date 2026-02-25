import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Loader2, Save, Shield, FileText, Users } from "lucide-react";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const Prince2Governance = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [pid, setPid] = useState<any>(null);
  const [boardMembers, setBoardMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    project_definition: "", project_approach: "", business_case_reference: "",
    project_management_team_structure: "", role_descriptions: "",
    quality_management_approach: "", change_control_approach: "",
    risk_management_approach: "", communication_management_approach: "",
  });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [pidRes, bmRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/prince2/pid/`, { headers }),
        fetch(`/api/v1/projects/${id}/prince2/board-members/`, { headers }),
      ]);
      if (pidRes.ok) {
        const d = await pidRes.json();
        const list = Array.isArray(d) ? d : d.results || [];
        if (list.length > 0) {
          setPid(list[0]);
          const p = list[0];
          setForm({
            project_definition: p.project_definition || "", project_approach: p.project_approach || "",
            business_case_reference: p.business_case_reference || "",
            project_management_team_structure: p.project_management_team_structure || "",
            role_descriptions: p.role_descriptions || "",
            quality_management_approach: p.quality_management_approach || "",
            change_control_approach: p.change_control_approach || "",
            risk_management_approach: p.risk_management_approach || "",
            communication_management_approach: p.communication_management_approach || "",
          });
        }
      }
      if (bmRes.ok) { const d = await bmRes.json(); setBoardMembers(Array.isArray(d) ? d : d.results || []); }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const url = pid ? `/api/v1/projects/${id}/prince2/pid/${pid.id}/` : `/api/v1/projects/${id}/prince2/pid/`;
      const method = pid ? "PATCH" : "POST";
      const response = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(form) });
      if (response.ok) { setPid(await response.json()); toast.success(pt("Saved")); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSaving(false); }
  };

  const handleBaseline = async () => {
    if (!pid) return;
    try {
      const r = await fetch(`/api/v1/projects/${id}/prince2/pid/${pid.id}/baseline/`, { method: "POST", headers: jsonHeaders });
      if (r.ok) { toast.success(pt("Saved")); fetchData(); }
      else toast.error(pt("Action failed"));
    } catch { toast.error(pt("Action failed")); }
  };

  const Field = ({ label, field }: { label: string; field: string }) => (
    <div className="space-y-2"><Label>{label}</Label><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background resize-y" value={(form as any)[field] || ""} onChange={(e) => setForm({ ...form, [field]: e.target.value })} /></div>
  );

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3"><Shield className="h-6 w-6 text-purple-500" /><div><h1 className="text-2xl font-bold">PID - Project Initiation Document</h1>{pid && <Badge className="mt-1">{pid.status}</Badge>}</div></div>
          <div className="flex gap-2">
            {pid && pid.status !== "baselined" && <Button variant="outline" onClick={handleBaseline} className="gap-2"><FileText className="h-4 w-4" /> Baseline</Button>}
            <Button onClick={handleSave} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {pt("Save")}</Button>
          </div>
        </div>

        {boardMembers.length > 0 && (
          <Card><CardHeader><CardTitle className="flex items-center gap-2"><Users className="h-5 w-5" /> {pt("Project Board")} ({boardMembers.length})</CardTitle></CardHeader>
            <CardContent><div className="flex flex-wrap gap-2">{boardMembers.map((m: any) => (
              <Badge key={m.id} variant="secondary" className="py-1 px-3">{m.name} - {m.role}</Badge>
            ))}</div><Button variant="link" className="mt-2 p-0" onClick={() => navigate(`/projects/${id}/prince2/project-board`)}>{pt("Manage")} →</Button></CardContent>
          </Card>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card><CardHeader><CardTitle>{pt("Project Definition")}</CardTitle></CardHeader><CardContent className="space-y-4"><Field label={pt("Project Definition")} field="project_definition" /><Field label={pt("Project Approach")} field="project_approach" /><Field label="Business Case Reference" field="business_case_reference" /></CardContent></Card>
          <Card><CardHeader><CardTitle>Team & Roles</CardTitle></CardHeader><CardContent className="space-y-4"><Field label="Team Structure" field="project_management_team_structure" /><Field label="Role Descriptions" field="role_descriptions" /></CardContent></Card>
          <Card><CardHeader><CardTitle>Management Approaches</CardTitle></CardHeader><CardContent className="space-y-4"><Field label={pt("Quality")} field="quality_management_approach" /><Field label="Change Control" field="change_control_approach" /></CardContent></Card>
          <Card><CardHeader><CardTitle>Risk & Communication</CardTitle></CardHeader><CardContent className="space-y-4"><Field label="Risk Management" field="risk_management_approach" /><Field label="Communication" field="communication_management_approach" /></CardContent></Card>
        </div>
      </div>
    </div>
  );
};

export default Prince2Governance;
