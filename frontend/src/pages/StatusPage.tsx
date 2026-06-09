import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Activity, ArrowLeft, CheckCircle2, AlertTriangle, XCircle, Loader2 } from "lucide-react";

interface Comp { name: string; status: string }
interface Status { status: string; components: Comp[]; checked_at: string }

const overall: Record<string, { label: string; color: string; Icon: any }> = {
  operational: { label: "All systems operational", color: "text-green-600", Icon: CheckCircle2 },
  degraded: { label: "Degraded performance", color: "text-amber-600", Icon: AlertTriangle },
  major_outage: { label: "Major outage", color: "text-red-600", Icon: XCircle },
};
const compColor: Record<string, string> = {
  operational: "text-green-600", degraded: "text-amber-600", down: "text-red-600",
};

export default function StatusPage() {
  const [data, setData] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/v1/status/");
        if (r.ok) setData(await r.json());
      } catch { /* network/down */ }
      finally { setLoading(false); }
    })();
  }, []);

  const o = overall[data?.status || "major_outage"] || overall.major_outage;
  const OIcon = o.Icon;

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50/40 to-white dark:from-purple-950/20 dark:to-background">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <Link to="/landing" className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:underline mb-6">
          <ArrowLeft className="h-4 w-4" /> ProjeXtPal
        </Link>

        <div className="flex items-center gap-2 mb-6">
          <Activity className="h-6 w-6 text-purple-600" />
          <h1 className="text-3xl font-bold">System status</h1>
        </div>

        {loading ? (
          <div className="flex items-center gap-2 text-muted-foreground"><Loader2 className="h-5 w-5 animate-spin" /> Checking…</div>
        ) : !data ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-red-700 flex items-center gap-2">
            <XCircle className="h-5 w-5" /> We couldn't reach the status service.
          </div>
        ) : (
          <>
            <div className={`rounded-xl border p-5 flex items-center gap-3 mb-6 ${o.color}`}>
              <OIcon className="h-7 w-7" />
              <div>
                <div className="text-lg font-semibold">{o.label}</div>
                <div className="text-xs text-muted-foreground">Last checked {new Date(data.checked_at).toLocaleString()}</div>
              </div>
            </div>

            <div className="rounded-xl border divide-y">
              {data.components.map((c) => (
                <div key={c.name} className="flex items-center justify-between px-4 py-3">
                  <span className="font-medium">{c.name}</span>
                  <span className={`text-sm font-medium capitalize ${compColor[c.status] || "text-muted-foreground"}`}>{c.status.replace("_", " ")}</span>
                </div>
              ))}
            </div>
          </>
        )}

        <p className="text-xs text-muted-foreground mt-8">For incidents or security reports: <a href="mailto:security@inclufy.com" className="text-purple-600 hover:underline">security@inclufy.com</a> · <Link to="/security" className="text-purple-600 hover:underline">security policy</Link></p>
      </div>
    </div>
  );
}
