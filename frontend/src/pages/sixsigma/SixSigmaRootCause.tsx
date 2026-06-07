import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Loader2, Search, CheckCircle2, ThumbsUp } from "lucide-react";
import { toast } from "sonner";

const BASE = (id: string) => `/api/v1/projects/${id}/sixsigma`;

const SixSigmaRootCause = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [causes, setCauses] = useState<any[]>([]);
  const [diagrams, setDiagrams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const [cRes, dRes] = await Promise.all([fetch(`${BASE(id!)}/causes/`, { headers }), fetch(`${BASE(id!)}/fishbone/`, { headers })]); if (cRes.ok) { const d = await cRes.json(); setCauses(Array.isArray(d) ? d : d.results || []); } if (dRes.ok) { const d = await dRes.json(); setDiagrams(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const toggleRoot = async (cId: number) => { try { await fetch(`${BASE(id!)}/causes/${cId}/toggle_root_cause/`, { method: "POST", headers: jsonHeaders }); fetchData(); } catch {} };
  const verify = async (cId: number) => { try { await fetch(`${BASE(id!)}/causes/${cId}/verify/`, { method: "POST", headers: jsonHeaders }); toast.success("Geverifieerd"); fetchData(); } catch {} };

  const rootCauses = causes.filter(c => c.is_root_cause);
  const potentialCauses = causes.filter(c => !c.is_root_cause).sort((a, b) => (b.votes || 0) - (a.votes || 0));
  const diagMap = Object.fromEntries(diagrams.map(d => [d.id, d.title]));
  const catColors: Record<string, string> = { man: "bg-blue-100 text-blue-700", machine: "bg-purple-100 text-purple-700", method: "bg-green-100 text-green-700", material: "bg-orange-100 text-orange-700", measurement: "bg-cyan-100 text-cyan-700", environment: "bg-yellow-100 text-yellow-700" };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center gap-3"><Search className="h-6 w-6 text-red-500" /><h1 className="text-2xl font-bold">Root Cause Analysis</h1></div>

      <div><h2 className="font-semibold mb-2 flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-red-500" /> Confirmed Root Causes ({rootCauses.length})</h2>
        {rootCauses.length === 0 ? <Card className="p-6 text-center text-muted-foreground">No root causes identified yet. Mark causes from Fishbone analysis.</Card> : (
          <div className="space-y-2">{rootCauses.map(c => (
            <Card key={c.id} className="border-red-200 bg-red-50"><CardContent className="p-4 flex items-center justify-between"><div><div className="flex items-center gap-2 mb-1"><Badge className={`text-xs ${catColors[c.category] || ""}`}>{c.category}</Badge><span className="font-medium">{c.description}</span>{diagMap[c.diagram] && <Badge variant="outline" className="text-xs">{diagMap[c.diagram]}</Badge>}{c.is_verified && <Badge className="text-xs bg-green-100 text-green-700">Verified</Badge>}</div>{c.votes > 0 && <span className="text-xs text-muted-foreground">{c.votes} votes</span>}</div><div className="flex gap-1">{!c.is_verified && <Button variant="outline" size="sm" onClick={() => verify(c.id)} className="gap-1 text-xs"><CheckCircle2 className="h-3 w-3" /> Verify</Button>}<Button variant="ghost" size="sm" onClick={() => toggleRoot(c.id)} className="text-xs">Remove</Button></div></CardContent></Card>
          ))}</div>
        )}
      </div>

      <div><h2 className="font-semibold mb-2">Potential Causes ({potentialCauses.length})</h2>
        {potentialCauses.length === 0 ? <Card className="p-6 text-center text-muted-foreground">Add causes from Fishbone diagram</Card> : (
          <div className="space-y-1">{potentialCauses.slice(0, 20).map(c => (
            <Card key={c.id}><CardContent className="p-3 flex items-center justify-between"><div className="flex items-center gap-2"><Badge className={`text-xs ${catColors[c.category] || ""}`}>{c.category}</Badge><span className="text-sm">{c.description}</span>{c.votes > 0 && <Badge variant="outline" className="text-xs">{c.votes} votes</Badge>}</div><Button variant="outline" size="sm" onClick={() => toggleRoot(c.id)} className="text-xs gap-1"><CheckCircle2 className="h-3 w-3" /> Mark Root Cause</Button></CardContent></Card>
          ))}</div>
        )}
      </div>
    </div></div>
  );
};
export default SixSigmaRootCause;
