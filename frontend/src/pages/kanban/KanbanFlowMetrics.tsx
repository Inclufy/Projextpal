import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Loader2, BarChart3, RefreshCw } from "lucide-react";
import { toast } from "sonner";

const KanbanFlowMetrics = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [metrics, setMetrics] = useState<any[]>([]);
  const [throughput, setThroughput] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` }; const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => { try { const [mRes, tRes] = await Promise.all([fetch(`/api/v1/projects/${id}/kanban/metrics/`, { headers }), fetch(`/api/v1/projects/${id}/kanban/metrics/throughput/`, { headers })]); if (mRes.ok) { const d = await mRes.json(); setMetrics(Array.isArray(d) ? d : d.results || []); } if (tRes.ok) setThroughput(await tRes.json()); } catch (err) { console.error(err); } finally { setLoading(false); } };
  const recordDaily = async () => { try { const r = await fetch(`/api/v1/projects/${id}/kanban/metrics/record_daily/`, { method: "POST", headers: jsonHeaders }); if (r.ok) { toast.success(pt("Saved")); fetchData(); } else toast.error(pt("Save failed")); } catch { toast.error(pt("Save failed")); } };

  useEffect(() => { fetchData(); }, [id]);

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  const latest = metrics[0];

  return (
    <div className="min-h-full bg-background"><ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between"><div className="flex items-center gap-3"><BarChart3 className="h-6 w-6 text-blue-500" /><h1 className="text-2xl font-bold">{pt("Flow Metrics")}</h1></div><Button onClick={recordDaily} className="gap-2"><RefreshCw className="h-4 w-4" /> Record Daily</Button></div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Avg Lead Time</p><p className="text-2xl font-bold">{latest?.avg_lead_time ? `${Math.round(latest.avg_lead_time)}d` : "—"}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Avg Cycle Time</p><p className="text-2xl font-bold">{latest?.avg_cycle_time ? `${Math.round(latest.avg_cycle_time)}d` : "—"}</p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">Throughput</p><p className="text-2xl font-bold">{throughput?.throughput || latest?.throughput || 0} <span className="text-sm font-normal">cards/week</span></p></CardContent></Card>
          <Card><CardContent className="p-4"><p className="text-sm text-muted-foreground">WIP</p><p className="text-2xl font-bold">{latest?.wip_count || 0}</p></CardContent></Card>
        </div>

        {metrics.length === 0 ? <Card className="p-8 text-center"><BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" /><h3 className="text-lg font-semibold">No metrics recorded yet</h3><p className="text-muted-foreground">Click "Record Daily" to start tracking</p></Card> : (
          <Card><CardHeader><CardTitle>Metrics History</CardTitle></CardHeader>
            <CardContent><div className="space-y-2">{metrics.slice(0, 20).map((m, i) => (
              <div key={m.id || i} className="flex items-center justify-between p-2 border rounded hover:bg-muted/50">
                <span className="text-sm">{m.date || m.recorded_at?.split("T")[0]}</span>
                <div className="flex gap-4 text-sm"><span>Lead: <strong>{m.avg_lead_time ? `${Math.round(m.avg_lead_time)}d` : "—"}</strong></span><span>Cycle: <strong>{m.avg_cycle_time ? `${Math.round(m.avg_cycle_time)}d` : "—"}</strong></span><span>WIP: <strong>{m.wip_count || 0}</strong></span><span>Through: <strong>{m.throughput || 0}</strong></span></div>
              </div>
            ))}</div></CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default KanbanFlowMetrics;
