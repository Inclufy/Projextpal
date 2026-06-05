// ============================================================
// AI RISK FORECAST (IL-1 — AI Risk Copilot, predictive risk)
// Generates + lists model-driven risk forecasts: exposure
// trend, risk velocity, projected exposure, outlook + drivers.
// ============================================================

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import {
  Loader2, Brain, TrendingUp, TrendingDown, Minus, AlertTriangle, ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

interface Forecast {
  id: number;
  as_of: string;
  current_exposure: number;
  forecast_exposure: number;
  exposure_trend: string;
  risk_velocity: number;
  predicted_high_risks: number;
  outlook: string;
  confidence: string;
  drivers: string[];
  recommendations: string[];
  narrative: string;
  signals: Record<string, any>;
  model_used: string;
  created_at: string;
}

const OUTLOOK_STYLE: Record<string, string> = {
  green: "bg-green-100 text-green-700 border-green-200",
  amber: "bg-amber-100 text-amber-700 border-amber-200",
  red: "bg-red-100 text-red-700 border-red-200",
};

const trendIcon = (t: string) => {
  if (t === "rising") return <TrendingUp className="h-4 w-4 text-red-500" />;
  if (t === "falling") return <TrendingDown className="h-4 w-4 text-green-500" />;
  return <Minus className="h-4 w-4 text-muted-foreground" />;
};

const AIRiskForecast = () => {
  const { id } = useParams<{ id: string }>();
  const [forecasts, setForecasts] = useState<Forecast[]>([]);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };
  const BASE = "/api/v1/projects/risk-forecasts/";

  const fetchForecasts = async () => {
    try {
      const r = await fetch(`${BASE}?project=${id}`, { headers });
      if (r.ok) { const d = await r.json(); setForecasts(Array.isArray(d) ? d : d.results || []); }
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchForecasts(); }, [id]);

  const generate = async () => {
    setGenerating(true);
    try {
      const r = await fetch(`${BASE}generate/`, {
        method: "POST", headers: jsonHeaders,
        body: JSON.stringify({ project: id }),
      });
      if (r.ok) { toast.success("Risico-forecast gegenereerd"); fetchForecasts(); }
      else toast.error("Genereren mislukt");
    } catch { toast.error("Genereren mislukt"); }
    finally { setGenerating(false); }
  };

  if (loading) return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </div>
  );

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Brain className="h-6 w-6 text-rose-500" />
            <div>
              <h1 className="text-2xl font-bold">AI Risk Forecast</h1>
              <p className="text-sm text-muted-foreground">Model-driven exposure trend, risk velocity and projected exposure from the live RAID register.</p>
            </div>
          </div>
          <Button onClick={generate} disabled={generating}>
            {generating ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Brain className="h-4 w-4 mr-2" />}
            Forecast
          </Button>
        </div>

        {forecasts.length === 0 ? (
          <Card className="p-8 text-center">
            <Brain className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold">No forecasts yet</h3>
            <p className="text-muted-foreground">Generate a predictive risk forecast from the project's current risk register and schedule signals.</p>
          </Card>
        ) : (
          <div className="space-y-4">
            {forecasts.map((f) => (
              <Card key={f.id}><CardContent className="p-5 space-y-3">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={OUTLOOK_STYLE[f.outlook]}>{f.outlook?.toUpperCase()}</Badge>
                    <Badge variant="outline" className="flex items-center gap-1">
                      {trendIcon(f.exposure_trend)} {f.exposure_trend}
                    </Badge>
                    <Badge variant="secondary">Confidence: {f.confidence}</Badge>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {new Date(f.created_at).toLocaleString()} · {f.model_used}
                  </span>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  <div className="rounded border p-3">
                    <p className="text-xs text-muted-foreground">Current exposure</p>
                    <p className="text-xl font-bold">{f.current_exposure}</p>
                  </div>
                  <div className="rounded border p-3">
                    <p className="text-xs text-muted-foreground">Forecast exposure</p>
                    <p className="text-xl font-bold flex items-center gap-1">
                      {f.forecast_exposure} {trendIcon(f.exposure_trend)}
                    </p>
                  </div>
                  <div className="rounded border p-3">
                    <p className="text-xs text-muted-foreground">Risk velocity / wk</p>
                    <p className="text-xl font-bold">{f.risk_velocity}</p>
                  </div>
                  <div className="rounded border p-3">
                    <p className="text-xs text-muted-foreground">Predicted high risks</p>
                    <p className="text-xl font-bold">{f.predicted_high_risks}</p>
                  </div>
                </div>

                <p className="text-sm leading-relaxed">{f.narrative}</p>

                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs font-semibold flex items-center gap-1 mb-1"><AlertTriangle className="h-3.5 w-3.5 text-amber-500" />Key drivers</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                      {f.drivers?.map((d, i) => <li key={i}>{d}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-xs font-semibold flex items-center gap-1 mb-1"><ArrowRight className="h-3.5 w-3.5 text-violet-500" />Recommendations</p>
                    <ul className="text-xs text-muted-foreground space-y-1 list-disc pl-4">
                      {f.recommendations?.map((r, i) => <li key={i}>{r}</li>)}
                    </ul>
                  </div>
                </div>
              </CardContent></Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AIRiskForecast;
