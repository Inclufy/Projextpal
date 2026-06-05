// ============================================================
// AI STATUS REPORT (IL-2 — NLP auto-status synthesis)
// Generates + lists executive status reports synthesised from
// live project metrics (task/risk/schedule) with computed RAG.
// ============================================================

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Loader2, Sparkles, Activity, AlertTriangle, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface Report {
  id: number;
  overall_rag: string;
  rag_scope: string;
  rag_schedule: string;
  rag_cost: string;
  rag_risk: string;
  executive_summary: string;
  highlights: string[];
  blockers: string[];
  next_steps: string[];
  metrics: Record<string, any>;
  model_used: string;
  created_at: string;
}

const RAG_STYLE: Record<string, string> = {
  green: "bg-green-100 text-green-700 border-green-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  red: "bg-red-100 text-red-700 border-red-200",
};

const ragBadge = (label: string, value: string) => (
  <Badge variant="outline" className={RAG_STYLE[value] || ""}>
    {label}: {value?.toUpperCase()}
  </Badge>
);

const AIStatusReport = () => {
  const { id } = useParams<{ id: string }>();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const BASE = "/api/v1/communication/generated-status-reports/";

  const fetchReports = async () => {
    try {
      const r = await fetch(`${BASE}?project=${id}`, { headers });
      if (r.ok) { const d = await r.json(); setReports(Array.isArray(d) ? d : d.results || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchReports(); }, [id]);

  const generate = async () => {
    setGenerating(true);
    try {
      const r = await fetch(`${BASE}generate/`, {
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({ project: id }),
      });
      if (r.ok) { toast.success("Status report gegenereerd"); fetchReports(); }
      else toast.error("Genereren mislukt");
    } catch { toast.error("Genereren mislukt"); }
    finally { setGenerating(false); }
  };

  if (loading) return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </div>
  );

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-fuchsia-500" />
            <div>
              <h1 className="text-2xl font-bold">AI Status Report</h1>
              <p className="text-sm text-muted-foreground">Executive narrative synthesised from live project metrics, with computed RAG health.</p>
            </div>
          </div>
          <Button onClick={generate} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Sparkles className="h-4 w-4 mr-2" />}
            Generate
          </Button>
        </div>

        {reports.length === 0 ? (
          <Card className="p-8 text-center">
            <Sparkles className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No status reports yet</h3>
            <p className="text-muted-foreground">Generate an executive status report from the project's current task, risk and schedule data.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {reports.map((rep) => (
              <Card key={rep.id}><CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={RAG_STYLE[rep.overall_rag]}>{rep.overall_rag?.toUpperCase()}</Badge>
                    {ragBadge("Scope", rep.rag_scope)}
                    {ragBadge("Schedule", rep.rag_schedule)}
                    {ragBadge("Cost", rep.rag_cost)}
                    {ragBadge("Risk", rep.rag_risk)}
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(rep.created_at).toLocaleString()} · {rep.model_used}
                  </span>
                </div>

                <p className="text-sm leading-relaxed">{rep.executive_summary}</p>

                <div className="grid md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-xs font-semibold flex items-center gap-1 mb-1"><Activity className="h-3.5 w-3.5 text-blue-500" />Highlights</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                      {rep.highlights?.map((h, i) => <li key={i}>{h}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold flex items-center gap-1 mb-1"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" />Blockers</p>
                    {rep.blockers?.length ? (
                      <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                        {rep.blockers.map((b, i) => <li key={i}>{b}</li>)}
                      </ul>
                    ) : <p className="text-xs text-muted-foreground">None</p>}
                  </div>
                  <div>
                    <p className="text-xs font-semibold flex items-center gap-1 mb-1"><ArrowRight className="h-3.5 w-3.5 text-violet-500" />Next steps</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                      {rep.next_steps?.map((s, i) => <li key={i}>{s}</li>)}
                    </ul>
                  </div>
                </div>

                {rep.metrics && (
                  <p className="text-xs text-muted-foreground pt-1 border-t">
                    {rep.metrics.completion_pct}% complete · {rep.metrics.tasks_done}/{rep.metrics.tasks_total} tasks ·
                    {" "}{rep.metrics.tasks_overdue} overdue · {rep.metrics.open_risks_total} open risks
                  </p>
                )}
              </CardContent></Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIStatusReport;
