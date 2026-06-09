import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ShieldCheck, FileText, Loader2, CheckCircle2, AlertTriangle, XCircle, ScrollText } from "lucide-react";
import { Link } from "react-router-dom";
import { usePageTranslations } from "@/hooks/usePageTranslations";

interface Control { id: string; control: string; status: "pass" | "partial" | "fail"; kind: string; evidence: string }
interface Posture {
  audit_date: string;
  gdpr: { controls: Control[]; score: number };
  iso27001: { controls: Control[]; score: number };
  documents: { title: string; path: string }[];
  note: string;
}

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });

const StatusBadge = ({ s }: { s: Control["status"] }) => {
  if (s === "pass") return <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="h-3 w-3" />Pass</Badge>;
  if (s === "partial") return <Badge className="bg-amber-100 text-amber-700 gap-1"><AlertTriangle className="h-3 w-3" />Partial</Badge>;
  return <Badge className="bg-red-100 text-red-700 gap-1"><XCircle className="h-3 w-3" />Fail</Badge>;
};

const ScoreRing = ({ label, score }: { label: string; score: number }) => (
  <div className="flex items-center gap-3">
    <div className="relative h-16 w-16">
      <svg viewBox="0 0 36 36" className="h-16 w-16 -rotate-90">
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#E5E7EB" strokeWidth="3" />
        <circle cx="18" cy="18" r="15.9" fill="none" stroke="#8B5CF6" strokeWidth="3"
          strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round" />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-bold">{score}%</span>
    </div>
    <div><div className="font-semibold">{label}</div><div className="text-xs text-muted-foreground">readiness</div></div>
  </div>
);

const Table = ({ rows }: { rows: Control[] }) => (
  <div className="overflow-x-auto">
    <table className="w-full text-sm">
      <thead><tr className="text-left text-xs text-muted-foreground border-b">
        <th className="py-2 pr-2 w-12">#</th><th className="py-2 pr-2">Control</th>
        <th className="py-2 pr-2 w-24">Status</th><th className="py-2 pr-2 w-24">Type</th><th className="py-2">Evidence</th>
      </tr></thead>
      <tbody>
        {rows.map((c) => (
          <tr key={c.id} className="border-b last:border-0 align-top">
            <td className="py-2 pr-2 text-muted-foreground tabular-nums">{c.id}</td>
            <td className="py-2 pr-2 font-medium">{c.control}</td>
            <td className="py-2 pr-2"><StatusBadge s={c.status} /></td>
            <td className="py-2 pr-2"><span className="text-xs text-muted-foreground capitalize">{c.kind}</span></td>
            <td className="py-2 text-xs text-muted-foreground">{c.evidence}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

export default function CompliancePage() {
  const { pt } = usePageTranslations();
  const [data, setData] = useState<Posture | null>(null);
  const [loading, setLoading] = useState(true);
  const [denied, setDenied] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/v1/compliance/posture/", { headers: authHeaders() });
        if (r.status === 403) { setDenied(true); return; }
        if (r.ok) setData(await r.json());
      } finally { setLoading(false); }
    })();
  }, []);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="h-6 w-6 animate-spin text-purple-600" /></div>;
  if (denied) return <div className="p-8 text-center text-muted-foreground">{pt("Admins only.")}</div>;
  if (!data) return <div className="p-8 text-center text-muted-foreground">{pt("Could not load compliance posture.")}</div>;

  return (
    <div className="max-w-5xl mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <ShieldCheck className="h-6 w-6 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold">{pt("Compliance")}</h1>
          <p className="text-sm text-muted-foreground">{pt("GDPR & ISO 27001 posture — evidence for buyers & auditors")} · {pt("audited")} {data.audit_date}</p>
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap gap-10 py-6">
          <ScoreRing label="GDPR / AVG" score={data.gdpr.score} />
          <ScoreRing label="ISO 27001" score={data.iso27001.score} />
          <div className="flex-1 min-w-[240px] flex flex-col justify-center gap-2">
            <p className="text-xs text-muted-foreground italic">{data.note}</p>
            <Link to="/audit-log" className="inline-flex items-center gap-1.5 text-sm text-purple-600 hover:underline">
              <ScrollText className="h-4 w-4" /> {pt("View the audit log")}
            </Link>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{pt("GDPR / AVG controls")}</CardTitle></CardHeader>
        <CardContent><Table rows={data.gdpr.controls} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base">{pt("ISO 27001 controls (readiness)")}</CardTitle></CardHeader>
        <CardContent><Table rows={data.iso27001.controls} /></CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle className="text-base flex items-center gap-2"><FileText className="h-4 w-4" /> {pt("Evidence documents")}</CardTitle></CardHeader>
        <CardContent>
          <ul className="space-y-1.5">
            {data.documents.map((d) => (
              <li key={d.path} className="flex items-center gap-2 text-sm">
                <FileText className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                <span className="font-medium">{d.title}</span>
                <code className="text-xs text-muted-foreground">{d.path}</code>
              </li>
            ))}
          </ul>
          <p className="text-xs text-muted-foreground mt-3">{pt("Documents live in the repository under docs/compliance/. Drafts require legal review before external use.")}</p>
        </CardContent>
      </Card>
    </div>
  );
}
