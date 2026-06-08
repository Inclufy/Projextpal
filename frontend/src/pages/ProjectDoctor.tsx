import { useState, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Loader2, Activity, RefreshCw, ShieldAlert, CheckCircle2, Plus, ArrowRight } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

interface ProposedAction { title: string; priority: string; due_in_days: number }
interface Problem {
  id: string; severity: string; type: string; title: string; detail: string;
  evidence: { kind?: string; id?: any; label: string }[]; areas: string[];
  proposed_actions: ProposedAction[];
}
interface Diagnosis {
  health: string; count: number; severity_counts: Record<string, number>;
  problems: Problem[]; generated_at: string;
}

const SEV: Record<string, { ring: string; chip: string; dot: string }> = {
  critical: { ring: "border-l-red-600", chip: "bg-red-100 text-red-700", dot: "bg-red-600" },
  high: { ring: "border-l-red-500", chip: "bg-red-100 text-red-700", dot: "bg-red-500" },
  medium: { ring: "border-l-amber-500", chip: "bg-amber-100 text-amber-700", dot: "bg-amber-500" },
  low: { ring: "border-l-sky-500", chip: "bg-sky-100 text-sky-700", dot: "bg-sky-500" },
};
const PRIO: Record<string, string> = {
  urgent: "bg-red-100 text-red-700", high: "bg-amber-100 text-amber-700",
  medium: "bg-blue-100 text-blue-700", low: "bg-gray-100 text-gray-600",
};

export default function ProjectDoctor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { pt } = usePageTranslations();
  const [data, setData] = useState<Diagnosis | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [applied, setApplied] = useState<Record<string, boolean>>({});
  const [applying, setApplying] = useState<string | null>(null);

  const headers = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });
  const jsonHeaders = () => ({ ...headers(), "Content-Type": "application/json" });

  const run = useCallback(async () => {
    setLoading(true); setError(false);
    try {
      const r = await fetch(`/api/v1/projects/${id}/doctor/diagnose/`, { headers: headers() });
      if (r.ok) { setData(await r.json()); }
      else { setData(null); setError(true); }
    } catch { setData(null); setError(true); }
    finally { setLoading(false); }
  }, [id]);

  useEffect(() => { run(); }, [run]);

  const apply = async (problemId: string, idx: number, a: ProposedAction) => {
    const key = `${problemId}-${idx}`;
    setApplying(key);
    try {
      const r = await fetch(`/api/v1/projects/${id}/doctor/apply/`, {
        method: "POST", headers: jsonHeaders(),
        body: JSON.stringify({ title: a.title, priority: a.priority, due_in_days: a.due_in_days }),
      });
      if (r.ok) {
        setApplied((p) => ({ ...p, [key]: true }));
        toast.success(pt("Action created in the Action Tracker"));
      } else { toast.error(pt("Could not create the action")); }
    } catch { toast.error(pt("Could not create the action")); }
    finally { setApplying(null); }
  };

  const healthBadge = (h: string) => (
    <Badge className={h === "red" ? "bg-red-100 text-red-700" : h === "amber" ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"}>
      {String(h || "green").toUpperCase()}
    </Badge>
  );

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-600" /></div></div>);

  const problems = data?.problems || [];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center text-white"><Activity className="h-5 w-5" /></div>
            <div>
              <h1 className="text-2xl font-bold flex items-center gap-2">{pt("AI Project Doctor")} {data && healthBadge(data.health)}</h1>
              <p className="text-sm text-muted-foreground">{pt("Detects problems across schedule, risk, cost and dependencies — and proposes fixes you can apply in one click.")}</p>
            </div>
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={run}><RefreshCw className="h-4 w-4" />{pt("Re-analyze")}</Button>
        </div>

        {error ? (
          <Card className="p-10 text-center border-red-200">
            <ShieldAlert className="h-12 w-12 mx-auto text-red-400 mb-3" />
            <h3 className="text-lg font-semibold mb-1">{pt("Could not analyze this project")}</h3>
            <p className="text-sm text-muted-foreground mb-4">{pt("The AI Doctor service did not respond (or you don't have access to this project). Try again.")}</p>
            <Button variant="outline" size="sm" className="gap-2 mx-auto" onClick={run}><RefreshCw className="h-4 w-4" />{pt("Re-analyze")}</Button>
          </Card>
        ) : problems.length === 0 ? (
          <Card className="p-10 text-center">
            <CheckCircle2 className="h-12 w-12 mx-auto text-green-500 mb-3" />
            <h3 className="text-lg font-semibold mb-1">{pt("No problems detected")}</h3>
            <p className="text-sm text-muted-foreground">{pt("Schedule, risk, cost and dependencies all look healthy right now.")}</p>
          </Card>
        ) : (
          <>
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="text-muted-foreground">{data?.count} {pt("problem(s) found")}:</span>
              {Object.entries(data?.severity_counts || {}).map(([s, n]) => (
                <Badge key={s} className={SEV[s]?.chip || "bg-gray-100"}>{n} {pt(s)}</Badge>
              ))}
            </div>

            {problems.map((p) => (
              <Card key={p.id} className={`border-l-4 ${SEV[p.severity]?.ring || "border-l-gray-300"} p-5`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <ShieldAlert className="h-4 w-4 text-muted-foreground shrink-0" />
                      <h3 className="font-semibold">{p.title}</h3>
                      <Badge className={SEV[p.severity]?.chip || "bg-gray-100"}>{pt(p.severity)}</Badge>
                      {p.areas?.map((a) => <Badge key={a} variant="outline" className="text-[10px]">{pt(a)}</Badge>)}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{p.detail}</p>
                    {p.evidence?.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {p.evidence.map((e, i) => <Badge key={i} variant="secondary" className="text-[10px]">{e.label}</Badge>)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{pt("Proposed actions")}</div>
                  {p.proposed_actions.map((a, i) => {
                    const key = `${p.id}-${i}`;
                    const done = applied[key];
                    return (
                      <div key={i} className="flex items-center gap-2 rounded-lg border bg-muted/30 px-3 py-2">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm">{a.title}</div>
                          <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                            <Badge className={`${PRIO[a.priority] || "bg-gray-100"} text-[10px]`}>{pt(a.priority)}</Badge>
                            {pt("due in")} {a.due_in_days} {pt("days")}
                          </div>
                        </div>
                        {done ? (
                          <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="h-3.5 w-3.5" />{pt("Applied")}</Badge>
                        ) : (
                          <Button size="sm" className="gap-1.5 h-8" disabled={applying === key} onClick={() => apply(p.id, i, a)}>
                            {applying === key ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
                            {pt("Apply")}
                          </Button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </Card>
            ))}

            <div className="flex justify-end">
              <Button variant="outline" className="gap-2" onClick={() => navigate(`/projects/${id}/action-tracker`)}>
                {pt("Open Action Tracker")} <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
