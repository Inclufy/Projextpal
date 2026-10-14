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

        {/* Sprint 9 S9-02 — Budget vs Actueel accordeon voor lessons-learned */}
        {id && <LessonsBudgetComparison projectId={id} />}

        {/* Senior Manager sign-off (generic endpoint) */}
        <Card>
          <CardHeader><CardTitle>{pt("Senior Manager Sign-off")}</CardTitle></CardHeader>
          <CardContent>{id && <ProjectSignOffDialog projectId={id} />}</CardContent>
        </Card>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------------
// Sprint 9 S9-02 — collapsible "Budget vs Actueel" accordion.
// Lazy-loads /lessons/budget-comparison/ when the user opens it the first
// time; silent on failure so the rest of the closure page keeps working.
// ---------------------------------------------------------------------------

interface BudgetMember {
  user_id: number;
  user_name: string;
  budgeted_hours: number;
  actual_hours: number;
  variance_pct: number;
}

interface BudgetComparisonPayload {
  project_id: number;
  budgeted_hours_total: number;
  actual_hours_total: number;
  variance_pct: number;
  per_member: BudgetMember[];
  insights: string[];
}

const LessonsBudgetComparison = ({ projectId }: { projectId: string }) => {
  const { pt } = usePageTranslations();
  const [open, setOpen] = useState(false);
  const [data, setData] = useState<BudgetComparisonPayload | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const toggle = async () => {
    const next = !open;
    setOpen(next);
    if (next && data === null && !loading) {
      setLoading(true);
      setErr(null);
      try {
        const token = localStorage.getItem("access_token");
        const r = await fetch(
          `/api/v1/projects/${projectId}/lessons/budget-comparison/`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : {},
          },
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        setData(await r.json());
      } catch (e) {
        setErr(e instanceof Error ? e.message : String(e));
      } finally {
        setLoading(false);
      }
    }
  };

  const varianceColor = (v: number) =>
    v > 15 ? "text-red-600" : v > 0 ? "text-amber-600" : "text-emerald-600";

  return (
    <Card>
      <CardHeader className="cursor-pointer" onClick={toggle}>
        <CardTitle className="flex items-center justify-between">
          <span>{pt("Budget vs Actual")}</span>
          <span className="text-xs text-muted-foreground">
            {open ? pt("Hide") : pt("Show")}
          </span>
        </CardTitle>
      </CardHeader>
      {open && (
        <CardContent>
          {loading && (
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" />
              {pt("Loading...")}
            </div>
          )}
          {err && (
            <p className="text-sm text-red-600">
              {pt("Could not load comparison")}: {err}
            </p>
          )}
          {data && !loading && !err && (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <div className="text-xs text-muted-foreground">
                    {pt("Budgeted (hours)")}
                  </div>
                  <div className="font-semibold">
                    {data.budgeted_hours_total}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    {pt("Actual (hours)")}
                  </div>
                  <div className="font-semibold">
                    {data.actual_hours_total}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-muted-foreground">
                    {pt("Variance")}
                  </div>
                  <div
                    className={`font-semibold ${varianceColor(
                      data.variance_pct,
                    )}`}
                  >
                    {data.variance_pct}%
                  </div>
                </div>
              </div>

              {data.per_member.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b text-left text-xs text-muted-foreground">
                        <th className="py-2">{pt("Team member")}</th>
                        <th className="py-2 text-right">{pt("Budgeted")}</th>
                        <th className="py-2 text-right">{pt("Actual")}</th>
                        <th className="py-2 text-right">{pt("Variance")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.per_member.map((m) => (
                        <tr
                          key={m.user_id}
                          className="border-b last:border-b-0"
                        >
                          <td className="py-2">{m.user_name}</td>
                          <td className="py-2 text-right">
                            {m.budgeted_hours}
                          </td>
                          <td className="py-2 text-right">{m.actual_hours}</td>
                          <td
                            className={`py-2 text-right ${varianceColor(
                              m.variance_pct,
                            )}`}
                          >
                            {m.variance_pct}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {data.insights.length > 0 && (
                <div>
                  <div className="text-xs text-muted-foreground mb-1">
                    {pt("Insights for next project")}
                  </div>
                  <ul className="list-disc pl-5 space-y-1 text-sm">
                    {data.insights.map((ins, i) => (
                      <li key={i}>{ins}</li>
                    ))}
                  </ul>
                </div>
              )}

              {data.per_member.length === 0 && data.insights.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  {pt(
                    "No budgeted hours or time entries available for this project.",
                  )}
                </p>
              )}
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};

export default FoundationClosure;
