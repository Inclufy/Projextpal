import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportExportMenu } from "@/components/ReportExportMenu";
import { Loader2, Rocket, Flag, FileText, ArrowRight, CheckCircle2, Clock } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";

const MS_STATUS: [string, string][] = [["pending", "Pending"], ["in_progress", "In Progress"], ["completed", "Completed"], ["on_hold", "On Hold"]];

const ExecutionDeployment = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [milestones, setMilestones] = useState<any[]>([]);
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    (async () => {
      try {
        const [m, d] = await Promise.all([
          fetch(`/api/v1/projects/milestones/?project=${id}`, { headers }),
          fetch(`/api/v1/projects/documents/?project_id=${id}&category=deployment`, { headers }),
        ]);
        if (m.ok) { const x = await m.json(); const arr = Array.isArray(x) ? x : x.results || []; arr.sort((a: any, b: any) => (a.order_index ?? 0) - (b.order_index ?? 0)); setMilestones(arr); }
        if (d.ok) { const x = await d.json(); setDocs(Array.isArray(x) ? x : x.results || []); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  const label = (v: string) => MS_STATUS.find(([k]) => k === v)?.[1] || v;
  const done = milestones.filter((m) => m.status === "completed").length;
  const pct = milestones.length ? Math.round((done / milestones.length) * 100) : 0;
  const msColor = (s: string) => ({ pending: "bg-gray-100 text-gray-600", in_progress: "bg-blue-100 text-blue-700", completed: "bg-green-100 text-green-700", on_hold: "bg-amber-100 text-amber-700" }[s] || "bg-gray-100");

  const exportSections = [
    { heading: "Rollout phases (milestones)", rows: milestones.map((m) => [m.name, `${label(m.status)}${m.end_date ? " · " + m.end_date : ""}`]) as [string, any][] },
    { heading: "Deployment documents", rows: docs.map((d) => [d.name, d.status]) as [string, any][] },
  ];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Rocket className="h-6 w-6 text-orange-500" />
            <div>
              <h1 className="text-2xl font-bold">{pt("Deployment Strategy")}</h1>
              <p className="text-sm text-muted-foreground">{pt("Rollout phases (milestones) and deployment artifacts.")}</p>
            </div>
          </div>
          {(milestones.length > 0 || docs.length > 0) && <ReportExportMenu title="Deployment Strategy" sections={exportSections} />}
        </div>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="text-3xl font-bold">{pct}%</div>
            <div className="flex-1">
              <p className="text-sm font-medium">{pt("Rollout progress")}</p>
              <p className="text-xs text-muted-foreground">{done}/{milestones.length} {pt("phases completed")}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Flag className="h-4 w-4" />{pt("Rollout Phases")}</CardTitle></CardHeader>
          <CardContent>
            {milestones.length === 0 ? (
              <p className="text-sm text-muted-foreground">{pt("No milestones yet.")} <button className="text-primary underline" onClick={() => navigate(`/projects/${id}/monitoring/documents/milestones`)}>{pt("Add milestones")}</button></p>
            ) : (
              <div className="space-y-2">
                {milestones.map((m, i) => (
                  <div key={m.id} className="flex items-center gap-3">
                    <div className="flex items-center justify-center h-7 w-7 rounded-full bg-muted text-xs font-semibold shrink-0">{i + 1}</div>
                    {m.status === "completed" ? <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" /> : <Clock className="h-4 w-4 text-muted-foreground shrink-0" />}
                    <span className="flex-1 font-medium">{m.name}</span>
                    <Badge className={`text-xs ${msColor(m.status)}`}>{label(m.status)}</Badge>
                    {m.end_date && <span className="text-xs text-muted-foreground">{m.end_date}</span>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" />{pt("Deployment Documents")}</CardTitle></CardHeader>
          <CardContent>
            {docs.length === 0 ? (
              <p className="text-sm text-muted-foreground">{pt("No deployment documents.")} <button className="text-primary underline" onClick={() => navigate(`/projects/${id}/monitoring/documents/all`)}>{pt("Upload in Documents")}</button></p>
            ) : (
              <div className="space-y-1">
                {docs.map((d) => (
                  <div key={d.id} className="flex items-center gap-2 text-sm">
                    <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="flex-1 truncate">{d.name}</span>
                    <Badge variant="secondary" className="text-xs">{d.status}</Badge>
                    {d.file_url && <a href={d.file_url} target="_blank" rel="noreferrer" className="text-primary"><ArrowRight className="h-3.5 w-3.5" /></a>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ExecutionDeployment;
