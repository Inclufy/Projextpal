import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollText, Loader2 } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";

interface Row {
  id: string; user_email: string; action: string; category: string; severity: string;
  description: string; resource_type: string; resource_id: string; ip_address: string | null; created_at: string;
}
const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });

const sevColor: Record<string, string> = {
  info: "bg-blue-100 text-blue-700", warning: "bg-amber-100 text-amber-700",
  error: "bg-orange-100 text-orange-700", critical: "bg-red-100 text-red-700",
};

export default function AuditLogPage() {
  const { pt } = usePageTranslations();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);
  const [q, setQ] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/v1/auth/audit-logs/", { headers: authHeaders() });
        if (r.status === 403) { setDenied(true); return; }
        if (r.ok) { const d = await r.json(); setRows(Array.isArray(d) ? d : d.results || []); }
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-purple-600" /></div>;
  if (denied) return <div className="p-8 text-center text-muted-foreground">{pt("Admins only.")}</div>;

  const term = q.trim().toLowerCase();
  const visible = term
    ? rows.filter((r) => `${r.action} ${r.description} ${r.user_email} ${r.resource_type}`.toLowerCase().includes(term))
    : rows;

  const fmt = (s: string) => new Date(s).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-4">
      <div className="flex items-center gap-2">
        <ScrollText className="h-6 w-6 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold">{pt("Audit log")}</h1>
          <p className="text-sm text-muted-foreground">{pt("Immutable record of security & compliance-relevant actions (ISO 27001 A.8)")}</p>
        </div>
      </div>

      <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder={pt("Filter by action, user, description…")} className="max-w-md" />

      <Card>
        <CardContent className="p-0 overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-muted-foreground border-b bg-muted/40">
              <th className="px-3 py-2 whitespace-nowrap">{pt("When")}</th>
              <th className="px-3 py-2">{pt("Actor")}</th>
              <th className="px-3 py-2">{pt("Action")}</th>
              <th className="px-3 py-2 w-20">{pt("Severity")}</th>
              <th className="px-3 py-2">{pt("Detail")}</th>
            </tr></thead>
            <tbody>
              {visible.length === 0 ? (
                <tr><td colSpan={5} className="px-3 py-10 text-center text-muted-foreground">{pt("No audit entries yet.")}</td></tr>
              ) : visible.map((r) => (
                <tr key={r.id} className="border-b last:border-0 align-top hover:bg-accent/30">
                  <td className="px-3 py-2 text-muted-foreground whitespace-nowrap tabular-nums">{fmt(r.created_at)}</td>
                  <td className="px-3 py-2 truncate max-w-[160px]">{r.user_email || "—"}</td>
                  <td className="px-3 py-2"><code className="text-xs">{r.action}</code></td>
                  <td className="px-3 py-2"><Badge className={`text-[10px] ${sevColor[r.severity] || ""}`}>{r.severity}</Badge></td>
                  <td className="px-3 py-2 text-muted-foreground">{r.description}{r.resource_type ? ` · ${r.resource_type}#${r.resource_id}` : ""}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
      <p className="text-xs text-muted-foreground">{pt("Showing the most recent 500 entries. Append-only — entries cannot be edited or deleted.")}</p>
    </div>
  );
}
