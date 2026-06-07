import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Loader2, TrendingUp } from "lucide-react";

const BASE = (id: string) => `/api/v1/projects/${id}/sixsigma`;

const SixSigmaRegression = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [hypotheses, setHypotheses] = useState<any[]>([]);
  const [baselines, setBaselines] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const token = localStorage.getItem("access_token"); const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

  const fetchData = async () => { try { const [hRes, bRes] = await Promise.all([fetch(`${BASE(id!)}/hypothesis/`, { headers }), fetch(`${BASE(id!)}/baseline/`, { headers })]); if (hRes.ok) { const d = await hRes.json(); setHypotheses((Array.isArray(d) ? d : d.results || []).filter((h: any) => h.test_type === "regression")); } if (bRes.ok) { const d = await bRes.json(); setBaselines(Array.isArray(d) ? d : d.results || []); } } catch (err) { console.error(err); } finally { setLoading(false); } };
  useEffect(() => { fetchData(); }, [id]);

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  return (
    <div className="min-h-full bg-background"><ProjectHeader /><div className="p-6 space-y-6">
      <div className="flex items-center gap-3"><TrendingUp className="h-6 w-6 text-indigo-500" /><h1 className="text-2xl font-bold">Regression Analysis</h1></div>

      <Card><CardContent className="p-4"><h3 className="font-semibold mb-2">Regression Tests</h3>
        {hypotheses.length === 0 ? <p className="text-muted-foreground text-sm">No regression tests. Add a hypothesis test with type "Regression" from the Hypothesis Testing page.</p> : (
          <div className="space-y-2">{hypotheses.map(h => (
            <div key={h.id} className="p-3 border rounded"><div className="flex items-center gap-2 mb-1"><Badge variant="outline" className="text-xs">Regression</Badge><Badge variant={h.status === "completed" ? "default" : "secondary"} className="text-xs">{h.status}</Badge></div><p className="text-sm"><strong>H₀:</strong> {h.null_hypothesis}</p>{h.p_value != null && <p className="text-xs text-muted-foreground">p = {h.p_value}, R² = {h.r_squared || "—"}</p>}</div>
          ))}</div>
        )}
      </CardContent></Card>

      <Card><CardContent className="p-4"><h3 className="font-semibold mb-2">Baseline vs Current</h3>
        {baselines.length === 0 ? <p className="text-muted-foreground text-sm">No baseline metrics to analyze</p> : (
          <div className="space-y-2">{baselines.map(b => { const change = b.baseline_value && b.current_value ? (((b.current_value - b.baseline_value) / b.baseline_value) * 100).toFixed(1) : null; return (
            <div key={b.id} className="flex items-center justify-between p-3 border rounded"><span className="font-medium text-sm">{b.metric_name}</span><div className="flex gap-4 text-sm"><span>Baseline: <strong>{b.baseline_value}</strong></span><span>Current: <strong className="text-blue-600">{b.current_value || "—"}</strong></span>{change && <Badge variant={parseFloat(change) > 0 ? "default" : "destructive"} className="text-xs">{change > "0" ? "+" : ""}{change}%</Badge>}</div></div>
          ); })}</div>
        )}
      </CardContent></Card>
    </div></div>
  );
};
export default SixSigmaRegression;
