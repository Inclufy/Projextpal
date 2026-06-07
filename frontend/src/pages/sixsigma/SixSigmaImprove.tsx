import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { Loader2, Lightbulb, FlaskConical, Shield, Rocket, ArrowRight } from "lucide-react";

const BASE = (id: string) => `/api/v1/projects/${id}/sixsigma`;

const SixSigmaImprove = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [counts, setCounts] = useState({ solutions: 0, pilots: 0, fmea: 0, impl: 0 });
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

  useEffect(() => { (async () => { try { const [sR, pR, fR, iR] = await Promise.all([fetch(`${BASE(id!)}/solutions/`, { headers }), fetch(`${BASE(id!)}/pilots/`, { headers }), fetch(`${BASE(id!)}/fmea/`, { headers }), fetch(`${BASE(id!)}/implementation/`, { headers })]); const parse = async (r: Response) => { if (!r.ok) return 0; const d = await r.json(); return (Array.isArray(d) ? d : d.results || []).length; }; setCounts({ solutions: await parse(sR), pilots: await parse(pR), fmea: await parse(fR), impl: await parse(iR) }); } catch {} finally { setLoading(false); } })(); }, [id]);

  const nav = (path: string) => navigate(`/projects/${id}/six-sigma/${path}`);
  const pages = [
    { label: "Solutions", desc: "Generate, evaluate and prioritize improvement solutions", icon: Lightbulb, count: counts.solutions, path: "solutions", color: "text-yellow-500" },
    { label: "Pilot Plans", desc: "Design and execute pilot tests before full rollout", icon: FlaskConical, count: counts.pilots, path: "pilot", color: "text-blue-500" },
    { label: "FMEA", desc: "Failure Mode and Effects Analysis for risk assessment", icon: Shield, count: counts.fmea, path: "fmea", color: "text-red-500" },
    { label: "Implementation", desc: "Plan and track full-scale implementation", icon: Rocket, count: counts.impl, path: "implementation", color: "text-green-500" },
  ];

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center gap-3"><Rocket className="h-6 w-6 text-orange-500" /><h1 className="text-2xl font-bold">Improve Phase</h1></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">{pages.map(p => (
        <Card key={p.path} className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => nav(p.path)}><CardContent className="p-5 flex items-start gap-4"><p.icon className={`h-8 w-8 mt-1 ${p.color}`} /><div className="flex-1"><div className="flex items-center justify-between"><h3 className="font-semibold">{p.label}</h3><div className="flex items-center gap-2"><Badge variant="outline">{p.count}</Badge><ArrowRight className="h-4 w-4 text-muted-foreground" /></div></div><p className="text-sm text-muted-foreground mt-1">{p.desc}</p></div></CardContent></Card>
      ))}</div>
    </div></div>
  );
};
export default SixSigmaImprove;
