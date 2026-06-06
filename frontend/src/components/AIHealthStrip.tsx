import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Loader2, BrainCircuit, Sparkles, AlertTriangle, ShieldCheck, ArrowRight, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { Area, AreaChart, ResponsiveContainer, Tooltip as RTooltip } from "recharts";
import { usePageTranslations } from "@/hooks/usePageTranslations";

interface Props { scope: "program" | "project"; id: string; }

interface TrendPoint {
  date: string; completion_pct: number; open_risks: number;
  open_issues: number; overdue: number; signals: number; rag?: string;
}

/** A compact sparkline tile: mini area chart + current value + delta-vs-first. */
function Spark({
  label, points, dataKey, color, invert = false,
}: {
  label: string; points: TrendPoint[]; dataKey: keyof TrendPoint;
  color: string; invert?: boolean;
}) {
  const vals = points.map((p) => Number(p[dataKey]) || 0);
  const first = vals[0] ?? 0;
  const last = vals[vals.length - 1] ?? 0;
  const delta = last - first;
  // "good" direction: completion rising is good; risks/issues falling is good.
  const good = invert ? delta < 0 : delta > 0;
  const Trend = delta === 0 ? Minus : delta > 0 ? TrendingUp : TrendingDown;
  const trendCls = delta === 0 ? "text-muted-foreground" : good ? "text-green-600" : "text-red-600";
  const gid = `spark-${String(dataKey)}-${color.replace("#", "")}`;
  return (
    <div className="rounded-md border bg-background p-2">
      <div className="flex items-center justify-between mb-1">
        <span className="text-[10px] text-muted-foreground">{label}</span>
        <span className={`flex items-center gap-0.5 text-[10px] font-medium ${trendCls}`}>
          <Trend className="h-3 w-3" />{delta > 0 ? `+${delta}` : delta}
        </span>
      </div>
      <div className="flex items-end gap-2">
        <span className="text-base font-semibold leading-none">{last}</span>
        <div className="flex-1 h-8">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={points} margin={{ top: 2, right: 0, bottom: 0, left: 0 }}>
              <defs>
                <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={color} stopOpacity={0.4} />
                  <stop offset="100%" stopColor={color} stopOpacity={0} />
                </linearGradient>
              </defs>
              <RTooltip
                cursor={{ stroke: color, strokeOpacity: 0.3 }}
                contentStyle={{ fontSize: 11, padding: "2px 6px", borderRadius: 6 }}
                labelFormatter={(l) => String(l)}
                formatter={(v: any) => [v, label]}
              />
              <Area type="monotone" dataKey={dataKey as string} stroke={color}
                strokeWidth={1.5} fill={`url(#${gid})`} dot={false} isAnimationActive={false} />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

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
  const [trend, setTrend] = useState<TrendPoint[]>([]);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const base = scope === "program" ? `/api/v1/programs/${id}` : `/api/v1/projects/${id}`;

  useEffect(() => {
    (async () => {
      try {
        const reqs: Promise<any>[] = [
          fetch(`${base}/ai/compound-signals/`, { headers }).then((r) => (r.ok ? r.json() : null)).catch(() => null),
        ];
        fetch(`${base}/progress-trend/`, { headers })
          .then((r) => (r.ok ? r.json() : null))
          .then((t) => setTrend(Array.isArray(t?.points) ? t.points : []))
          .catch(() => setTrend([]));
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

        {/* Trends — real measured movement from stored status snapshots */}
        <div className="pt-2 border-t">
          <div className="flex items-center gap-1.5 mb-2">
            <TrendingUp className="h-3.5 w-3.5 text-muted-foreground" />
            <span className="text-xs font-medium text-muted-foreground">{pt("Trends")}</span>
          </div>
          {trend.length < 2 ? (
            <p className="text-xs text-muted-foreground">
              {pt("Trends appear after at least two status snapshots are captured.")}
            </p>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              <Spark label={pt("Completion %")} points={trend} dataKey="completion_pct" color="#6366f1" />
              <Spark label={pt("Open risks")} points={trend} dataKey="open_risks" color="#f59e0b" invert />
              <Spark label={pt("Open issues")} points={trend} dataKey="open_issues" color="#ef4444" invert />
              <Spark label={pt("Compound signals")} points={trend} dataKey="signals" color="#d946ef" invert />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
