import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ProjectHeader } from "@/components/ProjectHeader";
import { ProjectSignOffDialog } from "@/components/ProjectSignOffDialog";
import { Loader2, FileCheck, CheckCircle2, Save } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

/**
 * Methodology-neutral project closing (Yanmar PP-09).
 * Bundles the generic closure building blocks for ANY methodology:
 *  - final summary + lessons learned (postproject app)
 *  - Senior Manager sign-off (ProjectSignOffDialog → /closing/sign-off/)
 *  - mark project completed
 *  - a lightweight closure checklist
 * PRINCE2 projects keep their richer /prince2/closure page; this serves the rest.
 */
const FoundationClosure = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [pp, setPp] = useState<any>(null); // existing PostProject row (by name)
  const [form, setForm] = useState({ lessons_learned: "", achieved_results: "", roi: "", savings: "" });
  const [checks, setChecks] = useState<Record<string, boolean>>({});

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const CHECKLIST = [
    "All deliverables accepted",
    "Open risks & issues resolved or transferred",
    "Final costs reconciled",
    "Documentation archived",
    "Team released",
  ];

  const fetchData = async () => {
    try {
      const pr = await fetch(`/api/v1/projects/${id}/`, { headers });
      const proj = pr.ok ? await pr.json() : null;
      setProject(proj);
      const lr = await fetch(`/api/v1/postproject/`, { headers });
      if (lr.ok) {
        const d = await lr.json();
        const list = Array.isArray(d) ? d : d.results || [];
        const existing = proj ? list.find((x: any) => x.projectname === proj.name) : null;
        if (existing) {
          setPp(existing);
          setForm({
            lessons_learned: existing.lessons_learned || "", achieved_results: existing.achieved_results || "",
            roi: existing.roi != null ? String(existing.roi) : "", savings: existing.savings != null ? String(existing.savings) : "",
          });
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const saveLessons = async () => {
    setSaving(true);
    try {
      const body = {
        projectname: project?.name || `Project ${id}`,
        lessons_learned: form.lessons_learned, achieved_results: form.achieved_results,
        roi: parseInt(form.roi || "0", 10) || 0, savings: parseInt(form.savings || "0", 10) || 0,
      };
      const url = pp ? `/api/v1/postproject/${pp.id}/` : `/api/v1/postproject/`;
      const r = await fetch(url, { method: pp ? "PATCH" : "POST", headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success(pt("Saved")); fetchData(); } else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSaving(false); }
  };

  const markCompleted = async () => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/`, { method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ status: "completed" }) });
      if (r.ok) { toast.success(pt("Project marked as completed")); fetchData(); } else toast.error(pt("Update failed"));
    } catch { toast.error(pt("Update failed")); }
  };

  if (loading) return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </div>
  );

  const allChecked = CHECKLIST.every((c) => checks[c]);
  const isCompleted = project?.status === "completed";

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileCheck className="h-6 w-6 text-green-500" />
            <h1 className="text-2xl font-bold">{pt("Project Closure")}</h1>
            <Badge variant={isCompleted ? "default" : "secondary"}>{project?.status || "—"}</Badge>
          </div>
          <Button onClick={markCompleted} disabled={isCompleted} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />{isCompleted ? pt("Completed") : pt("Mark as completed")}
          </Button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Final summary + lessons */}
          <Card>
            <CardHeader><CardTitle>{pt("Final Report & Lessons")}</CardTitle></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>{pt("Achieved Results")}</Label><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background" value={form.achieved_results} onChange={(e) => setForm({ ...form, achieved_results: e.target.value })} /></div>
              <div className="space-y-2"><Label>{pt("Lessons Learned")}</Label><textarea className="w-full min-h-[80px] px-3 py-2 border rounded-md bg-background" value={form.lessons_learned} onChange={(e) => setForm({ ...form, lessons_learned: e.target.value })} /></div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2"><Label>{pt("ROI")} (%)</Label><Input type="number" value={form.roi} onChange={(e) => setForm({ ...form, roi: e.target.value })} /></div>
                <div className="space-y-2"><Label>{pt("Savings")} (€)</Label><Input type="number" value={form.savings} onChange={(e) => setForm({ ...form, savings: e.target.value })} /></div>
              </div>
              <div className="flex justify-end">
                <Button onClick={saveLessons} disabled={saving} className="gap-2">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{pt("Save")}</Button>
              </div>
            </CardContent>
          </Card>

          {/* Closure checklist */}
          <Card>
            <CardHeader><CardTitle>{pt("Closure Checklist")}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              {CHECKLIST.map((c) => (
                <label key={c} className="flex items-center gap-2 text-sm cursor-pointer">
                  <input type="checkbox" checked={!!checks[c]} onChange={(e) => setChecks({ ...checks, [c]: e.target.checked })} />
                  {pt(c)}
                </label>
              ))}
              <p className={`text-xs mt-2 ${allChecked ? "text-green-600" : "text-muted-foreground"}`}>
                {allChecked ? pt("All closure items complete — ready to sign off.") : pt("Complete all items before sign-off.")}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Senior Manager sign-off (generic endpoint) */}
        <Card>
          <CardHeader><CardTitle>{pt("Senior Manager Sign-off")}</CardTitle></CardHeader>
          <CardContent>{id && <ProjectSignOffDialog projectId={id} />}</CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FoundationClosure;
