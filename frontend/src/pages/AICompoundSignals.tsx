import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReportExportMenu } from "@/components/ReportExportMenu";
import { Loader2, BrainCircuit, RefreshCw, AlertTriangle, AlertOctagon, Info, ShieldCheck, AlertCircle, Check, Shield } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const SEV: Record<string, { cls: string; icon: any; label: string }> = {
  critical: { cls: "border-red-300 bg-red-50", icon: AlertOctagon, label: "Critical" },
  high: { cls: "border-orange-300 bg-orange-50", icon: AlertTriangle, label: "High" },
  medium: { cls: "border-amber-300 bg-amber-50", icon: Info, label: "Medium" },
};
const AREA_CLS: Record<string, string> = {
  schedule: "bg-blue-100 text-blue-700", risk: "bg-rose-100 text-rose-700",
  cost: "bg-emerald-100 text-emerald-700", dependency: "bg-violet-100 text-violet-700",
};

const AICompoundSignals = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const BASE = `/api/v1/projects/${id}/ai/compound-signals/`;

  const [govDecisions, setGovDecisions] = useState<any[]>([]);
  const fetchGov = async () => {
    try {
      const r = await fetch(`/api/v1/projects/${id}/governance/decisions/`, { headers });
      if (r.ok) { const d = await r.json(); setGovDecisions(d.decisions || []); }
    } catch { /* ignore */ }
  };

  const fetchData = async (toastOnDone = false) => {
    setLoading(true);
    try {
      const r = await fetch(BASE, { headers });
      if (r.ok) { setData(await r.json()); if (toastOnDone) toast.success(pt("Refreshed")); }
      else toast.error(pt("Failed to load"));
    } catch { toast.error(pt("Failed to load")); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); fetchGov(); }, [id]);

  const [created, setCreated] = useState<Record<number, boolean>>({});
  const [escalated, setEscalated] = useState<Record<number, boolean>>({});
  const [working, setWorking] = useState<number | null>(null);
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const createIssue = async (s: any, i: number) => {
    setWorking(i);
    try {
      const r = await fetch(`/api/v1/projects/${id}/ai/signal-to-issue/`, {
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({ title: s.title, detail: s.detail, severity: s.severity }),
      });
      if (r.ok) { setCreated((c) => ({ ...c, [i]: true })); toast.success(pt("Issue created in RAID register")); }
      else toast.error(pt("Could not create issue"));
    } catch { toast.error(pt("Could not create issue")); }
    finally { setWorking(null); }
  };

  const escalate = async (s: any, i: number) => {
    setWorking(i);
    try {
      const r = await fetch(`/api/v1/projects/${id}/ai/signal-to-decision/`, {
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({ title: s.title, detail: s.detail, severity: s.severity }),
      });
      if (r.ok) { setEscalated((c) => ({ ...c, [i]: true })); toast.success(pt("Escalated to governance board")); fetchGov(); }
      else toast.error(pt("Could not escalate"));
    } catch { toast.error(pt("Could not escalate")); }
    finally { setWorking(null); }
  };

  const signals = data?.signals || [];
  const ctx = data?.context || {};
  const exportSections = [
    { heading: "Context", rows: [["Milestones", ctx.milestones], ["Tasks", ctx.tasks], ["Open risks", ctx.open_risks], ["Open issues", ctx.open_issues], ["Budget spent %", ctx.budget_pct ?? "—"]] as [string, any][] },
    ...signals.map((s: any) => ({ heading: `[${s.severity?.toUpperCase()}] ${s.title}`, text: s.detail })),
  ];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <BrainCircuit className="h-6 w-6 text-fuchsia-500" />
            <div>
              <h1 className="text-2xl font-bold">{pt("AI Compound Signals")}</h1>
              <p className="text-sm text-muted-foreground">{pt("Cross-module risks that no single view surfaces — schedule × risk × cost × dependency.")}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {signals.length > 0 && <ReportExportMenu title="AI Compound Signals" sections={exportSections} />}
            <Button variant="outline" onClick={() => fetchData(true)} className="gap-2"><RefreshCw className="h-4 w-4" />{pt("Refresh")}</Button>
          </div>
        </div>

        {/* context strip */}
        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">{ctx.milestones ?? 0} {pt("milestones")}</Badge>
          <Badge variant="outline">{ctx.tasks ?? 0} {pt("tasks")}</Badge>
          <Badge variant="outline">{ctx.open_risks ?? 0} {pt("open risks")}</Badge>
          <Badge variant="outline">{ctx.open_issues ?? 0} {pt("open issues")}</Badge>
          {ctx.budget_pct != null && <Badge variant="outline">{ctx.budget_pct}% {pt("budget spent")}</Badge>}
        </div>

        {signals.length === 0 ? (
          <Card className="p-8 text-center">
            <ShieldCheck className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No compound signals detected")}</h3>
            <p className="text-sm text-muted-foreground">{pt("No risky cross-module combinations right now. Re-check after updating tasks, risks or milestones.")}</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {signals.map((s: any, i: number) => {
              const meta = SEV[s.severity] || SEV.medium;
              const Icon = meta.icon;
              return (
                <Card key={i} className={`border ${meta.cls}`}><CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <Icon className="h-5 w-5 mt-0.5 shrink-0" />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <Badge variant="outline" className="text-xs uppercase">{meta.label}</Badge>
                        {(s.areas || []).map((a: string) => <Badge key={a} className={`text-xs ${AREA_CLS[a] || "bg-gray-100 text-gray-600"}`}>{pt(a)}</Badge>)}
                      </div>
                      <h3 className="font-semibold">{s.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{s.detail}</p>
                      {(s.evidence || []).length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {s.evidence.map((e: any, j: number) => (
                            <Badge key={j} variant="secondary" className="text-xs">{e.kind}: {e.label}</Badge>
                          ))}
                        </div>
                      )}
                      <div className="mt-3 flex items-center gap-2 flex-wrap">
                        {created[i] ? (
                          <Badge className="bg-green-100 text-green-700 text-xs gap-1"><Check className="h-3 w-3" />{pt("Issue created")}</Badge>
                        ) : (
                          <Button variant="outline" size="sm" className="gap-1 h-7" onClick={() => createIssue(s, i)} disabled={working === i}>
                            {working === i ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <AlertCircle className="h-3.5 w-3.5" />}{pt("Create RAID issue")}
                          </Button>
                        )}
                        {escalated[i] ? (
                          <Badge className="bg-violet-100 text-violet-700 text-xs gap-1"><Check className="h-3 w-3" />{pt("Escalated to board")}</Badge>
                        ) : (
                          <Button variant="outline" size="sm" className="gap-1 h-7" onClick={() => escalate(s, i)} disabled={working === i}>
                            {working === i ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />}{pt("Escalate to governance")}
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent></Card>
              );
            })}
          </div>
        )}

        {/* Feedback loop — governance decisions taken on this project */}
        {govDecisions.length > 0 && (
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Shield className="h-4 w-4 text-slate-600" />
                <h3 className="font-semibold text-sm">{pt("Governance decisions on this project")}</h3>
                <Badge variant="outline" className="text-xs">{govDecisions.length}</Badge>
              </div>
              <div className="space-y-2">
                {govDecisions.map((d: any) => (
                  <div key={d.id} className="flex items-center justify-between gap-2 border-b last:border-0 pb-2 text-sm">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge className={`text-xs ${d.applied ? "bg-violet-100 text-violet-700" : d.status === "approved" ? "bg-green-100 text-green-700" : d.status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"}`}>
                        {d.applied ? pt("applied") : d.status}
                      </Badge>
                      <span className="font-medium">{d.title}</span>
                      {d.board_name && <span className="text-xs text-muted-foreground">· {d.board_name}</span>}
                      {d.outcome && <Badge variant="secondary" className="text-xs">{d.outcome}</Badge>}
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{pt("Decisions escalated up to a programme board or steering committee show their verdict here.")}</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AICompoundSignals;
