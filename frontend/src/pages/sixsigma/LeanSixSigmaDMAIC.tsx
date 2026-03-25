import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Loader2, Target, ArrowRight, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const BASE = (id: string) => `/api/v1/sixsigma/projects/${id}/sixsigma`;

const LeanSixSigmaDMAIC = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [tollgates, setTollgates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const r = await fetch(`${BASE(id!)}/tollgates/`, { headers }); if (r.ok) { const d = await r.json(); setTollgates(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  const initTollgates = async () => { try { const r = await fetch(`${BASE(id!)}/tollgates/initialize/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success("DMAIC tollgates geïnitialiseerd"); fetchData(); } else toast.error("Initialiseren mislukt"); } catch { toast.error("Initialiseren mislukt"); } };
  useEffect(() => { fetchData(); }, [id]);
  const nav = (phase: string, path: string) => navigate(`/projects/${id}/${phase}/${path}`);

  const dmaic = [
    { phase: "Define", desc: "Define the problem, scope, goals, and customer requirements", color: "bg-blue-500 text-blue-700 bg-blue-50 border-blue-200", tools: ["SIPOC Diagram", "Voice of Customer"], paths: ["sipoc", "voc"] },
    { phase: "Measure", desc: "Measure current performance and collect relevant data", color: "bg-green-500 text-green-700 bg-green-50 border-green-200", tools: ["Data Collection", "MSA", "Baseline Metrics"], paths: ["data-collection", "msa", "baseline"] },
    { phase: "Analyze", desc: "Analyze data to identify root causes of defects and variation", color: "bg-yellow-500 text-yellow-700 bg-yellow-50 border-yellow-200", tools: ["Fishbone", "Root Cause", "Pareto", "Hypothesis", "Regression"], paths: ["fishbone", "root-cause", "pareto", "hypothesis", "regression"] },
    { phase: "Improve", desc: "Develop and implement solutions to address root causes", color: "bg-orange-500 text-orange-700 bg-orange-50 border-orange-200", tools: ["Solutions", "Pilot", "FMEA", "Implementation"], paths: ["solutions", "pilot", "fmea", "implementation"] },
    { phase: "Control", desc: "Sustain improvements and monitor ongoing performance", color: "bg-red-500 text-red-700 bg-red-50 border-red-200", tools: ["Control Plan", "Control Chart", "SPC", "Monitoring", "Tollgate", "Closure"], paths: ["control-plan", "control-chart", "spc", "monitoring", "tollgate", "closure"] },
  ];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><Target className="h-6 w-6 text-emerald-500" /><h1 className="text-2xl font-bold">DMAIC Framework</h1></div>{tollgates.length === 0 && <Button onClick={initTollgates}>Initialize DMAIC</Button>}</div>
        <div className="space-y-4">{dmaic.map((d, i) => {
          const tg = tollgates.find(t => t.phase?.toLowerCase() === d.phase.toLowerCase());
          const colors = d.color.split(" ");
          return (
            <Card key={d.phase} className={`border-l-4 ${colors[2] || ""}`} style={{ borderLeftColor: `var(--${d.phase.toLowerCase()})` }}>
              <CardContent className="p-5">
                <div className="flex items-center justify-between mb-2"><div className="flex items-center gap-3"><div className={`h-8 w-8 rounded-full ${colors[0]} flex items-center justify-center text-white font-bold text-sm`}>{d.phase.charAt(0)}</div><h2 className="text-lg font-bold">{d.phase}</h2>{tg?.status === "approved" && <CheckCircle2 className="h-5 w-5 text-green-500" />}{tg && <Badge variant={tg.status === "approved" ? "default" : "outline"} className="text-xs">{tg.status}</Badge>}</div></div>
                <p className="text-sm text-muted-foreground mb-3">{d.desc}</p>
                <div className="flex flex-wrap gap-2">{d.tools.map((tool, ti) => (
                  <Button key={tool} variant="outline" size="sm" onClick={() => nav(d.phase.toLowerCase(), d.paths[ti])} className="gap-1"><ArrowRight className="h-3 w-3" />{tool}</Button>
                ))}</div>
              </CardContent>
            </Card>
          );
        })}</div>
      </div>
    </div>
  );
};

export default LeanSixSigmaDMAIC;
