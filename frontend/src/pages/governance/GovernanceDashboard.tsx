import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Shield, Gavel, Users, Briefcase, AlertTriangle, ArrowRight, RefreshCw } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { toast } from "sonner";

const API = (import.meta as any).env?.VITE_BACKEND_URL || "/api/v1";

const GovernanceDashboard = () => {
  const { pt } = usePageTranslations();
  const navigate = useNavigate();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };

  const fetchData = async (toastDone = false) => {
    setLoading(true);
    try {
      const r = await fetch(`/api/v1/governance/dashboard/`, { headers });
      if (r.ok) { setData(await r.json()); if (toastDone) toast.success(pt("Refreshed")); }
      else toast.error(pt("Failed to load"));
    } catch { toast.error(pt("Failed to load")); }
    finally { setLoading(false); }
  };
  useEffect(() => { fetchData(); }, []);

  if (loading) return (<div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>);

  const d = data || {};
  const dec = d.decisions || {};
  const kpi = (icon: any, label: string, value: any, onClick?: () => void) => {
    const Icon = icon;
    return (
      <Card className={onClick ? "cursor-pointer hover:border-primary/40" : ""} onClick={onClick}>
        <CardContent className="p-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center"><Icon className="h-5 w-5" /></div>
          <div><div className="text-2xl font-bold">{value ?? 0}</div><div className="text-xs text-muted-foreground">{label}</div></div>
        </CardContent>
      </Card>
    );
  };
  const impactColor = (k: string) => ({ high: "bg-red-100 text-red-700", medium: "bg-amber-100 text-amber-700", low: "bg-gray-100 text-gray-600" }[k] || "bg-gray-100");

  return (
    <div className="min-h-full bg-background p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Shield className="h-6 w-6 text-slate-600" />
          <div>
            <h1 className="text-2xl font-bold">{pt("Governance Dashboard")}</h1>
            <p className="text-sm text-muted-foreground">{pt("Org-wide boards, decisions and the escalation queue.")}</p>
          </div>
        </div>
        <Button variant="outline" onClick={() => fetchData(true)} className="gap-2"><RefreshCw className="h-4 w-4" />{pt("Refresh")}</Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {kpi(Gavel, pt("Decisions"), dec.total, () => navigate("/governance/decisions"))}
        {kpi(AlertTriangle, pt("Pending"), dec.pending, () => navigate("/governance/decisions"))}
        {kpi(Shield, pt("Boards"), d.boards?.total, () => navigate("/governance/boards"))}
        {kpi(Briefcase, pt("Portfolios"), d.portfolios, () => navigate("/governance/portfolios"))}
        {kpi(Users, pt("Stakeholders"), d.stakeholders, () => navigate("/governance/stakeholders"))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Gavel className="h-4 w-4" />{pt("Decision status")}</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">{pt("Pending")}</span><Badge variant="outline">{dec.pending ?? 0}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{pt("Approved")}</span><Badge className="bg-green-100 text-green-700">{dec.approved ?? 0}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{pt("Rejected")}</span><Badge className="bg-red-100 text-red-700">{dec.rejected ?? 0}</Badge></div>
            <div className="flex justify-between"><span className="text-muted-foreground">{pt("Applied (enacted)")}</span><Badge className="bg-violet-100 text-violet-700">{dec.applied ?? 0}</Badge></div>
            <div className="pt-2 border-t flex gap-2 flex-wrap">
              {Object.entries(dec.by_impact || {}).map(([k, v]: any) => <Badge key={k} className={`text-xs ${impactColor(k)}`}>{k}: {v}</Badge>)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle className="text-base flex items-center gap-2"><Shield className="h-4 w-4" />{pt("Boards by type")}</CardTitle></CardHeader>
          <CardContent className="space-y-1 text-sm">
            {Object.keys(d.boards?.by_type || {}).length === 0 ? <p className="text-muted-foreground">{pt("No boards yet.")}</p> :
              Object.entries(d.boards.by_type).map(([k, v]: any) => (
                <div key={k} className="flex justify-between"><span className="text-muted-foreground capitalize">{k.replace(/_/g, " ")}</span><Badge variant="outline">{v}</Badge></div>
              ))}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><AlertTriangle className="h-4 w-4 text-amber-500" />{pt("Escalation queue")} <Badge variant="outline">{(d.escalation_queue || []).length}</Badge></CardTitle></CardHeader>
        <CardContent>
          {(d.escalation_queue || []).length === 0 ? (
            <p className="text-sm text-muted-foreground">{pt("No open escalations. Compound signals escalated from projects/programmes appear here.")}</p>
          ) : (
            <div className="space-y-2">
              {d.escalation_queue.map((x: any) => (
                <div key={x.id} className="flex items-center justify-between gap-2 border-b last:border-0 pb-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge className={`text-xs ${impactColor(x.impact)}`}>{x.impact}</Badge>
                    <span className="text-sm font-medium">{x.title}</span>
                  </div>
                  <Button variant="ghost" size="sm" className="gap-1" onClick={() => navigate(`/governance/decisions?decision=${x.id}`)}>{pt("Review")}<ArrowRight className="h-3.5 w-3.5" /></Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GovernanceDashboard;
