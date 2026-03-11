import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Loader2, BarChart3, TrendingUp } from "lucide-react";

const AgileVelocity = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [iterations, setIterations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

  const fetchData = async () => { try { const r = await fetch(`/api/v1/projects/${id}/agile/iterations/`, { headers }); if (r.ok) { const d = await r.json(); setIterations(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  const completed = iterations.filter(i => i.status === "completed");
  const avgVelocity = completed.length > 0 ? Math.round(completed.reduce((s, i) => s + (i.velocity_completed || i.completed_points || 0), 0) / completed.length) : 0;

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  const maxPts = Math.max(...completed.map(i => i.velocity_completed || i.completed_points || 0), 1);

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center gap-3"><BarChart3 className="h-6 w-6 text-blue-500" /><h1 className="text-2xl font-bold">{pt("Velocity")}</h1></div>
        <Card><CardContent className="p-4 flex items-center gap-4"><TrendingUp className="h-8 w-8 text-green-500" /><div><p className="text-sm text-muted-foreground">{pt("Average Velocity")}</p><p className="text-3xl font-bold">{avgVelocity} <span className="text-sm font-normal">pts/iteration</span></p></div></CardContent></Card>
        {completed.length === 0 ? <Card className="p-8 text-center"><BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">{pt("No velocity data yet")}</h3><p className="text-muted-foreground">{pt("Complete iterations to see velocity")}</p></Card> : (
          <Card><CardHeader><CardTitle>{pt("Iteration Velocity")}</CardTitle></CardHeader>
            <CardContent><div className="space-y-3">{completed.map((i) => {
              const pts = i.velocity_completed || i.completed_points || 0;
              return (<div key={i.id} className="flex items-center gap-4"><span className="text-sm w-28 text-muted-foreground">{i.name}</span><div className="flex-1 bg-muted rounded-full h-6 overflow-hidden"><div className="bg-emerald-500 h-full rounded-full flex items-center justify-end pr-2 transition-all" style={{ width: `${(pts / maxPts) * 100}%` }}><span className="text-xs text-white font-bold">{pts}</span></div></div><Badge variant="outline" className="text-xs w-14 justify-center">{pts} pts</Badge></div>);
            })}</div></CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default AgileVelocity;
