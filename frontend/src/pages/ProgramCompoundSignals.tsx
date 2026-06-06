import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ReportExportMenu } from "@/components/ReportExportMenu";
import { Loader2, BrainCircuit, RefreshCw, AlertTriangle, AlertOctagon, Info, ShieldCheck, FolderKanban, Shield, Check } from "lucide-react";
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

const ProgramCompoundSignals = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const BASE = `/api/v1/programs/${id}/ai/compound-signals/`;

  const fetchData = async (toastDone = false) => {
    setLoading(true);
    try {
      const r = await fetch(BASE, { headers });
      if (r.ok) { setData(await r.json()); if (toastDone) toast.success(pt("Refreshed")); }
      else toast.error(pt("Failed to load"));
    } catch { toast.error(pt("Failed to load")); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const [escalated, setEscalated] = useState<Record<number, boolean>>({});
  const [working, setWorking] = useState<number | null>(null);
  const escalate = async (s: any, i: number) => {
    setWorking(i);
    try {
      const r = await fetch(`/api/v1/programs/${id}/ai/signal-to-decision/`, {
        method: "POST", headers: { ...headers, "Content-Type": "application/json" },
        body: JSON.stringify({ title: `${s.title} (${s.project_name})`, detail: s.detail, severity: s.severity }),
      });
      if (r.ok) { setEscalated((c) => ({ ...c, [i]: true })); toast.success(pt("Escalated to programme board")); }
      else toast.error(pt("Could not escalate"));
    } catch { toast.error(pt("Could not escalate")); }
    finally { setWorking(null); }
  };

  const signals = data?.signals || [];
  const exportSections = signals.map((s: any) => ({ heading: `[${s.severity?.toUpperCase()}] ${s.title} — ${s.project_name}`, text: s.detail }));

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
              <p className="text-sm text-muted-foreground">{pt("Cross-project risks rolled up across the whole programme.")}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {signals.length > 0 && <ReportExportMenu title="Programme Compound Signals" sections={exportSections} />}
            <Button variant="outline" onClick={() => fetchData(true)} className="gap-2"><RefreshCw className="h-4 w-4" />{pt("Refresh")}</Button>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 text-xs">
          <Badge variant="outline">{data?.projects ?? 0} {pt("projects")}</Badge>
          <Badge variant="outline">{signals.length} {pt("signals")}</Badge>
        </div>

        {signals.length === 0 ? (
          <Card className="p-8 text-center">
            <ShieldCheck className="h-12 w-12 mx-auto text-green-500 mb-4" />
            <h3 className="text-lg font-semibold mb-2">{pt("No compound signals across the programme")}</h3>
            <p className="text-sm text-muted-foreground">{pt("No risky cross-module combinations in any constituent project right now.")}</p>
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
                        <Badge className="text-xs bg-slate-100 text-slate-700 gap-1"><FolderKanban className="h-3 w-3" />{s.project_name}</Badge>
                        {(s.areas || []).map((a: string) => <Badge key={a} className={`text-xs ${AREA_CLS[a] || "bg-gray-100 text-gray-600"}`}>{pt(a)}</Badge>)}
                      </div>
                      <h3 className="font-semibold">{s.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{s.detail}</p>
                      <div className="mt-3">
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
      </div>
    </div>
  );
};

export default ProgramCompoundSignals;
