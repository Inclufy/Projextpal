import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ReportExportMenu, type ReportSection } from "@/components/ReportExportMenu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Loader2, Sparkles, Activity, AlertTriangle, ArrowRight, RefreshCw, Share2, Copy, Mail } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const RAG: Record<string, string> = {
  green: "bg-green-100 text-green-700 border-green-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  red: "bg-red-100 text-red-700 border-red-200",
};

const ProgramAIStatus = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [rep, setRep] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const BASE = `/api/v1/programs/${id}/ai/status-report/`;

  const fetchData = async (toastDone = false) => {
    setLoading(true);
    try {
      const r = await fetch(BASE, { headers });
      if (r.ok) { setRep(await r.json()); if (toastDone) toast.success(pt("Refreshed")); }
      else toast.error(pt("Failed to load"));
    } catch { toast.error(pt("Failed to load")); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, [id]);

  const m = rep?.metrics || {};
  const buildSections = (): ReportSection[] => [
    { rows: [["Overall RAG", rep?.overall_rag?.toUpperCase()], ["Projects", m.projects], ["Completion", `${m.completion_pct}%`], ["Open risks", m.open_risks], ["Open issues", m.open_issues], ["Overdue tasks", m.tasks_overdue]] as [string, any][] },
    { heading: "Executive Summary", text: rep?.executive_summary },
    { heading: "Highlights", rows: (rep?.highlights || []).map((h: string, i: number) => [String(i + 1), h]) as [string, any][] },
    { heading: "Blockers", rows: (rep?.blockers || []).map((b: string, i: number) => [String(i + 1), b]) as [string, any][] },
    { heading: "Next Steps", rows: (rep?.next_steps || []).map((s: string, i: number) => [String(i + 1), s]) as [string, any][] },
  ];
  const buildText = () => {
    const L = [`PROGRAMME STATUS — ${rep?.overall_rag?.toUpperCase()}`, "", rep?.executive_summary || ""];
    const blk = (t: string, a?: string[]) => { if (a?.length) { L.push("", `${t}:`); a.forEach((x) => L.push(`  • ${x}`)); } };
    blk("Highlights", rep?.highlights); blk("Blockers", rep?.blockers); blk("Next steps", rep?.next_steps);
    return L.join("\n");
  };
  const copyText = async () => { try { await navigator.clipboard.writeText(buildText()); toast.success(pt("Copied")); } catch { toast.error(pt("Copy failed")); } };
  const emailText = () => { window.location.href = `mailto:?subject=${encodeURIComponent("Programme Status — " + (rep?.overall_rag?.toUpperCase() || ""))}&body=${encodeURIComponent(buildText())}`; };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Sparkles className="h-6 w-6 text-fuchsia-500" />
            <div>
              <h1 className="text-2xl font-bold">{pt("AI Status Report")}</h1>
              <p className="text-sm text-muted-foreground">{pt("Executive narrative rolled up across the whole programme.")}</p>
            </div>
          </div>
          <div className="flex gap-2">
            {rep && <ReportExportMenu title="Programme Status Report" sections={buildSections()} />}
            {rep && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild><Button variant="outline" size="sm" className="gap-1"><Share2 className="h-3.5 w-3.5" />{pt("Delen")}</Button></DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={copyText}><Copy className="h-4 w-4 mr-2" />{pt("Kopieer tekst")}</DropdownMenuItem>
                  <DropdownMenuItem onClick={emailText}><Mail className="h-4 w-4 mr-2" />{pt("E-mail")}</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
            <Button variant="outline" onClick={() => fetchData(true)} className="gap-2"><RefreshCw className="h-4 w-4" />{pt("Refresh")}</Button>
          </div>
        </div>

        {rep && (
          <Card><CardContent className="p-5 space-y-3">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className={RAG[rep.overall_rag]}>{rep.overall_rag?.toUpperCase()}</Badge>
              <span className="text-xs text-muted-foreground">{m.projects} {pt("projects")} · {m.completion_pct}% {pt("complete")} · {m.open_risks} {pt("risks")} · {m.open_issues} {pt("issues")}</span>
            </div>
            <p className="text-sm leading-relaxed">{rep.executive_summary}</p>
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <p className="text-xs font-semibold flex items-center gap-1 mb-1"><Activity className="h-3.5 w-3.5 text-blue-500" />{pt("Highlights")}</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">{rep.highlights?.map((h: string, i: number) => <li key={i}>{h}</li>)}</ul>
              </div>
              <div>
                <p className="text-xs font-semibold flex items-center gap-1 mb-1"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" />{pt("Blockers")}</p>
                {rep.blockers?.length ? <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">{rep.blockers.map((b: string, i: number) => <li key={i}>{b}</li>)}</ul> : <p className="text-xs text-muted-foreground">{pt("None")}</p>}
              </div>
              <div>
                <p className="text-xs font-semibold flex items-center gap-1 mb-1"><ArrowRight className="h-3.5 w-3.5 text-violet-500" />{pt("Next steps")}</p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">{rep.next_steps?.map((s: string, i: number) => <li key={i}>{s}</li>)}</ul>
              </div>
            </div>
          </CardContent></Card>
        )}
      </div>
    </div>
  );
};

export default ProgramAIStatus;
