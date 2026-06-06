import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ReportExportMenu } from "@/components/ReportExportMenu";
import { Loader2, ScrollText, Euro, Calendar, Users, Target, FileText, ArrowRight } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";

const FoundationCharter = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [project, setProject] = useState<any>(null);
  const [sponsors, setSponsors] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    (async () => {
      try {
        const [p, s] = await Promise.all([
          fetch(`/api/v1/projects/${id}/`, { headers }),
          fetch(`/api/v1/execution/stakeholders/?project=${id}`, { headers }),
        ]);
        if (p.ok) setProject(await p.json());
        if (s.ok) { const d = await s.json(); setSponsors((Array.isArray(d) ? d : d.results || []).filter((x: any) => x.governance_type === "Sponsor")); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, [id]);

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  const fmtMoney = (v: any, c?: string) => v != null ? `${c || "EUR"} ${Number(v).toLocaleString()}` : "—";
  const row = (label: string, value: any) => (
    <div className="flex justify-between py-2 border-b last:border-0"><span className="text-sm text-muted-foreground">{label}</span><span className="text-sm font-medium text-right">{value || "—"}</span></div>
  );

  const exportSections = [
    { heading: "Project Charter", rows: [
      ["Project", project?.name], ["Status", project?.status], ["Methodology", project?.methodology],
      ["Budget", fmtMoney(project?.budget, project?.currency)],
      ["Start", project?.start_date], ["End", project?.end_date],
      ["Sponsors", sponsors.map((s) => s.name).join(", ") || "—"],
    ] as [string, any][] },
    { heading: "Description / Mandate", text: project?.description || "—" },
  ];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6 max-w-4xl">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <ScrollText className="h-6 w-6 text-amber-600" />
            <div>
              <h1 className="text-2xl font-bold">{pt("Project Charter")}</h1>
              <p className="text-sm text-muted-foreground">{pt("The project's mandate, scope and authority — composed from live project data.")}</p>
            </div>
          </div>
          <ReportExportMenu title={`Charter — ${project?.name || ""}`} sections={exportSections} />
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Target className="h-4 w-4" />{pt("Project Definition")}</CardTitle></CardHeader>
          <CardContent>
            {row(pt("Project name"), project?.name)}
            {row(pt("Status"), project?.status && <Badge variant="outline">{project.status}</Badge>)}
            {row(pt("Methodology"), project?.methodology && <Badge variant="secondary">{project.methodology}</Badge>)}
            {project?.description && (
              <div className="pt-3"><p className="text-sm text-muted-foreground mb-1">{pt("Mandate / Description")}</p><p className="text-sm whitespace-pre-wrap">{project.description}</p></div>
            )}
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Calendar className="h-4 w-4" />{pt("Timeline")}</CardTitle></CardHeader>
            <CardContent>
              {row(pt("Start date"), project?.start_date)}
              {row(pt("End date"), project?.end_date)}
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="text-base flex items-center gap-2"><Euro className="h-4 w-4" />{pt("Budget")}</CardTitle></CardHeader>
            <CardContent>{row(pt("Authorised budget"), fmtMoney(project?.budget, project?.currency))}</CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Users className="h-4 w-4" />{pt("Sponsors & Authority")}</CardTitle></CardHeader>
          <CardContent>
            {sponsors.length === 0 ? (
              <p className="text-sm text-muted-foreground">{pt("No sponsor recorded yet.")} <button className="text-primary underline" onClick={() => navigate(`/projects/${id}/execution/stakeholders`)}>{pt("Add in Stakeholders")}</button></p>
            ) : (
              <div className="space-y-1">
                {sponsors.map((s) => (
                  <div key={s.id} className="flex items-center gap-2 text-sm">
                    <Badge className="bg-violet-100 text-violet-700 text-xs">{s.governance_type}</Badge>
                    <span className="font-medium">{s.name}</span>
                    {s.role && <span className="text-muted-foreground">· {s.role}</span>}
                    {s.contact && <a href={`mailto:${s.contact}`} className="text-muted-foreground hover:underline">· {s.contact}</a>}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="bg-muted/30">
          <CardContent className="p-4 flex items-center justify-between flex-wrap gap-2">
            <span className="text-sm text-muted-foreground flex items-center gap-2"><FileText className="h-4 w-4" />{pt("Related foundation artifacts")}</span>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/projects/${id}/foundation/business-case`)}>{pt("Business Case")}<ArrowRight className="h-3 w-3" /></Button>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => navigate(`/projects/${id}/foundation/communication-plan`)}>{pt("Communication Plan")}<ArrowRight className="h-3 w-3" /></Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default FoundationCharter;
