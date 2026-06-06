import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportExportMenu } from "@/components/ReportExportMenu";
import { Loader2, Layers, FileText, ArrowRight } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";

// Lifecycle stages = the document categories the backend already supports.
const STAGES: [string, string][] = [
  ["planning", "Planning"], ["requirements", "Requirements"], ["design", "Design"],
  ["development", "Development"], ["testing", "Testing"], ["deployment", "Deployment"],
  ["training", "Training"], ["general", "General"],
];

const MonitoringStages = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch(`/api/v1/projects/documents/?project_id=${id}`, { headers });
        if (r.ok) { const d = await r.json(); setDocs(Array.isArray(d) ? d : d.results || []); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  const byStage = (cat: string) => docs.filter((d) => (d.category || "general") === cat);
  const exportSections = STAGES.map(([k, label]) => ({ heading: label, rows: byStage(k).map((d) => [d.name, d.status]) as [string, any][] })).filter((s) => s.rows.length > 0);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Layers className="h-6 w-6 text-cyan-600" />
            <div>
              <h1 className="text-2xl font-bold">{pt("Stages")}</h1>
              <p className="text-sm text-muted-foreground">{pt("Documents organised by lifecycle stage.")}</p>
            </div>
            <Badge variant="outline">{docs.length} {pt("docs")}</Badge>
          </div>
          <div className="flex gap-2">
            {docs.length > 0 && <ReportExportMenu title="Stages" sections={exportSections} />}
            <Button variant="outline" className="gap-2" onClick={() => navigate(`/projects/${id}/monitoring/documents/all`)}><FileText className="h-4 w-4" />{pt("All Documents")}</Button>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {STAGES.map(([key, label]) => {
            const items = byStage(key);
            return (
              <Card key={key}>
                <CardHeader className="pb-2"><CardTitle className="text-base flex items-center justify-between"><span>{label}</span><Badge variant={items.length ? "default" : "outline"}>{items.length}</Badge></CardTitle></CardHeader>
                <CardContent>
                  {items.length === 0 ? (
                    <p className="text-xs text-muted-foreground">{pt("No documents in this stage.")}</p>
                  ) : (
                    <div className="space-y-1">
                      {items.map((d) => (
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
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default MonitoringStages;
