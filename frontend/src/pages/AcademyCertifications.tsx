import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Award, Download, ShieldCheck } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";

const AcademyCertifications = () => {
  const { pt } = usePageTranslations();
  const [certs, setCerts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        const r = await fetch("/api/v1/academy/certificates/", { headers: { Authorization: `Bearer ${token}` } });
        if (r.ok) { const d = await r.json(); setCerts(Array.isArray(d) ? d : d.results || []); }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    })();
  }, []);

  const download = (id: string) => {
    const token = localStorage.getItem("access_token");
    fetch(`/api/v1/academy/certificate/${id}/download/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.blob() : Promise.reject())
      .then((blob) => {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url; a.download = `certificate-${id}.pdf`;
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
      })
      .catch(() => {});
  };

  if (loading) return <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>;

  return (
    <div className="min-h-full bg-background w-full px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center text-white"><Award className="h-5 w-5" /></div>
        <div>
          <h1 className="text-2xl font-bold">{pt("Certifications")}</h1>
          <p className="text-sm text-muted-foreground">{pt("Official certificates you earned by completing courses + their exams.")}</p>
        </div>
        <Badge variant="outline" className="ml-1">{certs.length}</Badge>
      </div>

      {certs.length === 0 ? (
        <Card className="p-8 text-center">
          <Award className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-semibold mb-1">{pt("No certificates yet")}</h3>
          <p className="text-sm text-muted-foreground">{pt("Complete a course and pass its exam to earn a verifiable certificate.")}</p>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {certs.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              <div className="bg-gradient-to-br from-amber-500 to-orange-500 p-5 text-white">
                <Award className="h-7 w-7 mb-2 opacity-90" />
                <div className="font-bold leading-snug">{c.course_title || pt("Certificate")}</div>
                <div className="text-xs text-white/85 mt-1">{c.certificate_number}</div>
              </div>
              <div className="p-4 space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">{pt("Issued")}</span>
                  <span className="font-medium">{(c.issued_at || "").split("T")[0]}</span>
                </div>
                {c.total_score != null && (
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground">{pt("Score")}</span>
                    <span className="font-medium">{c.total_score}%</span>
                  </div>
                )}
                <div className="flex gap-2 pt-2">
                  <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => download(c.certificate_id || c.id)}>
                    <Download className="h-3.5 w-3.5" />{pt("Download")}
                  </Button>
                  {c.verification_code && (
                    <Button size="sm" variant="outline" className="flex-1 gap-1.5" onClick={() => window.open(`/api/v1/academy/certificate/verify/${c.verification_code}/`, "_blank")}>
                      <ShieldCheck className="h-3.5 w-3.5" />{pt("Verify")}
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default AcademyCertifications;
