import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { Label } from "@/components/ui/label";
import { Loader2, Award, Save, Euro, TrendingUp } from "lucide-react";
import { toast } from "sonner";

const Prince2BenefitsReview = () => {
  const { pt } = usePageTranslations();
  const { id } = useParams<{ id: string }>();
  const [benefits, setBenefits] = useState<any[]>([]);
  const [endReport, setEndReport] = useState<any>(null);
  const [achievedNotes, setAchievedNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [bRes, erRes] = await Promise.all([
        fetch(`/api/v1/projects/${id}/prince2/benefits/`, { headers }),
        fetch(`/api/v1/projects/${id}/prince2/end-project-report/`, { headers }),
      ]);
      if (bRes.ok) {
        const d = await bRes.json();
        setBenefits(Array.isArray(d) ? d : d.results || []);
      }
      if (erRes.ok) {
        const d = await erRes.json();
        const list = Array.isArray(d) ? d : d.results || [];
        if (list.length > 0) {
          setEndReport(list[0]);
          setAchievedNotes(list[0].benefits_achieved || "");
        }
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  };

  useEffect(() => { fetchData(); }, [id]);

  const saveAchievedNotes = async () => {
    if (!endReport) {
      toast.error(pt("Create the End Project Report first"));
      return;
    }
    setSaving(true);
    try {
      const r = await fetch(`/api/v1/projects/${id}/prince2/end-project-report/${endReport.id}/`, {
        method: "PATCH", headers: jsonHeaders, body: JSON.stringify({ benefits_achieved: achievedNotes }),
      });
      if (r.ok) { setEndReport(await r.json()); toast.success(pt("Saved")); }
      else toast.error(pt("Save failed"));
    } catch { toast.error(pt("Save failed")); }
    finally { setSaving(false); }
  };

  if (loading) return (<div className="min-h-full bg-background"><ProjectHeader /><div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div></div>);

  const financialCount = benefits.filter((b) => b.benefit_type === "financial").length;
  const nonFinancialCount = benefits.filter((b) => b.benefit_type === "non_financial").length;
  const intangibleCount = benefits.filter((b) => b.benefit_type === "intangible").length;

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Award className="h-6 w-6 text-amber-500" />
            <div>
              <h1 className="text-2xl font-bold">{pt("Benefits Review")}</h1>
              <p className="text-sm text-muted-foreground">{pt("Planned benefits from the Business Case vs. realised benefits at closure")}</p>
            </div>
          </div>
          <Button onClick={saveAchievedNotes} disabled={saving || !endReport} className="gap-2">
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} {pt("Save")}
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Euro className="h-5 w-5 text-green-600" /><div><p className="text-2xl font-bold">{financialCount}</p><p className="text-xs text-muted-foreground">{pt("Financial")}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><TrendingUp className="h-5 w-5 text-blue-600" /><div><p className="text-2xl font-bold">{nonFinancialCount}</p><p className="text-xs text-muted-foreground">{pt("Non-Financial")}</p></div></div></CardContent></Card>
          <Card><CardContent className="pt-6"><div className="flex items-center gap-3"><Award className="h-5 w-5 text-purple-600" /><div><p className="text-2xl font-bold">{intangibleCount}</p><p className="text-xs text-muted-foreground">{pt("Intangible")}</p></div></div></CardContent></Card>
        </div>

        <Card>
          <CardHeader><CardTitle>{pt("Planned Benefits")} ({benefits.length})</CardTitle></CardHeader>
          <CardContent>
            {benefits.length === 0 ? (
              <p className="text-muted-foreground text-center py-6">{pt("No benefits added yet")}. {pt("Add them in the Business Case page.")}</p>
            ) : (
              <div className="space-y-2">{benefits.map((b: any) => (
                <div key={b.id} className="flex items-start justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <p className="font-medium">{b.description}</p>
                    <div className="flex gap-2 mt-1 flex-wrap">
                      <Badge variant="outline" className="text-xs">{b.benefit_type}</Badge>
                      {b.value && <span className="text-sm text-muted-foreground">{pt("Value")}: {b.value}</span>}
                      {b.timing && <span className="text-sm text-muted-foreground">{pt("Timing")}: {b.timing}</span>}
                    </div>
                  </div>
                </div>
              ))}</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>{pt("Realised Benefits")}</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label>{pt("Describe which planned benefits were actually realised and any new or unexpected benefits.")}</Label>
              <textarea
                className="w-full min-h-[160px] px-3 py-2 border rounded-md bg-background resize-y"
                value={achievedNotes}
                onChange={(e) => setAchievedNotes(e.target.value)}
                placeholder={pt("e.g. Benefit 1 fully achieved by Q3; benefit 2 partial — only 60% realised due to scope cut...")}
              />
              {!endReport && (
                <p className="text-xs text-muted-foreground">{pt("This is stored on the End Project Report. Create the report first to save.")}</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Prince2BenefitsReview;
