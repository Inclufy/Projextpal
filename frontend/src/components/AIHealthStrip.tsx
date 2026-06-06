import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, BrainCircuit, Sparkles, AlertTriangle, ShieldCheck, ArrowRight } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";

interface Props { scope: "program" | "project"; id: string; }

const RAG: Record<string, string> = {
  green: "bg-green-100 text-green-700 border-green-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  red: "bg-red-100 text-red-700 border-red-200",
};

/**
 * Compact AI health strip for the project / programme dashboards. Pulls the live
 * rollup endpoints (progress + compound signals + governance) built this session,
 * so the dashboard reflects real connected state, not a naive average.
 */
export function AIHealthStrip({ scope, id }: Props) {
  const { pt } = usePageTranslations();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [prog, setProg] = useState<any>(null);
  const [signals, setSignals] = useState<number>(0);
  const [govCount, setGovCount] = useState<number | null>(null);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const base = scope === "program" ? `/api/v1/programs/${id}` : `/api/v1/projects/${id}`;

  useEffect(() => {
    (async () => {
      try {
        const reqs: Promise<any>[] = [
          fetch(`${base}/ai/compound-signals/`, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ];
        if (scope === "program") {
          reqs.push(fetch(`${base}/progress/`, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null));
        } else {
          reqs.push(fetch(`${base}/governance/decisions/`, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null));
        }
        const [sig, second] = await Promise.all(reqs);
        setSignals(sig?.count ?? 0);
        if (scope === "program") setProg(second);
        else {
          setGovCount(second?.count ?? 0);
          setProg(sig?.context || null);
        }
      } catch { /* ignore */ }
      finally { setLoading(false); }
    })();
  }, [id, scope]);

  if (loading) return (
    <Card><CardContent className="p-4 flex items-center gap-2 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />{pt("Loading AI health…")}</CardContent></Card>
  );

  const aiStatusUrl = scope === "program" ? `/programs/${id}/ai/status` : `/projects/${id}/execution/communication/ai-status-report`;
  const signalsUrl = `${scope === "program" ? "/programs" : "/projects"}/${id}/ai/compound-signals`;
  const chip = (label: string, value: any, cls = "") => (
    <div className={`px-3 py-1.5 rounded-md bg-muted/60 ${cls}`}><div className="text-sm font-semibold leading-none">{value ?? 0}</div><div className="text-[10px] text-muted-foreground mt-0.5">{label}</div></div>
  );

  return (
    <Card>
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-fuchsia-500" />
            <span className="font-semibold">{pt("AI Health")}</span>
            {scope === "program" && prog?.rag && <Badge className={RAG[prog.rag]}>{prog.rag.toUpperCase()}</Badge>}
            {signals > 0
              ? <Badge className="bg-amber-100 text-amber-700 gap-1"><AlertTriangle className="h-3 w-3" />{signals} {pt("compound signal(s)")}</Badge>
              : <Badge className="bg-green-100 text-green-700 gap-1"><ShieldCheck className="h-3 w-3" />{pt("no compound signals")}</Badge>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="gap-1 h-7" onClick={() => navigate(signalsUrl)}><BrainCircuit className="h-3.5 w-3.5" />{pt("Signals")}</Button>
            <Button variant="outline" size="sm" className="gap-1 h-7" onClick={() => navigate(aiStatusUrl)}><Sparkles className="h-3.5 w-3.5" />{pt("AI Status")}<ArrowRight className="h-3 w-3" /></Button>
          </div>
        </div>

        {scope === "program" && prog && (
          <>
            <div className="flex items-center gap-3">
              <Progress value={prog.completion_pct || 0} className="h-2 flex-1" />
              <span className="text-sm font-medium">{prog.completion_pct || 0}%</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {chip(pt("projects"), prog.projects)}
              {chip(pt("tasks done"), `${prog.tasks_done}/${prog.tasks_total}`)}
              {chip(pt("overdue"), prog.tasks_overdue)}
              {chip(pt("milestones"), `${prog.milestones_done}/${prog.milestones_total}`)}
              {chip(pt("open risks"), prog.open_risks)}
              {chip(pt("open issues"), prog.open_issues)}
            </div>
          </>
        )}
        {scope === "project" && (
          <div className="flex flex-wrap gap-2">
            {prog && chip(pt("tasks"), prog.tasks)}
            {prog && chip(pt("milestones"), prog.milestones)}
            {prog && chip(pt("open risks"), prog.open_risks)}
            {prog && chip(pt("open issues"), prog.open_issues)}
            {govCount != null && chip(pt("governance decisions"), govCount)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
