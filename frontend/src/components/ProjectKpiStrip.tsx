import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  CheckCircle2,
  Euro,
  Calendar,
  ListChecks,
} from "lucide-react";
import { useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { useLanguage } from "@/contexts/LanguageContext";
import { formatBudgetDetailed, getCurrencyFromLanguage, type CurrencyCode } from "@/lib/currencies";
import { cn } from "@/lib/utils";

const authHeaders = () => ({ Authorization: `Bearer ${localStorage.getItem("access_token")}` });

const getJson = async (url: string) => {
  const res = await fetch(url, { headers: authHeaders() });
  if (!res.ok) throw new Error(`Failed to fetch ${url}`);
  return res.json();
};

// RAG → text + background classes (mirrors the program health KPI card).
const RAG_TEXT: Record<string, string> = {
  green: "text-green-600",
  amber: "text-amber-600",
  red: "text-red-600",
};
const RAG_BG: Record<string, string> = {
  green: "bg-green-100",
  amber: "bg-amber-100",
  red: "bg-red-100",
};

/**
 * KPI header strip for a project — mirrors the programme detail KPI strip
 * (Projecten / Voortgang / Gezondheid / Totaal Budget / Besteed / Einddatum),
 * adapted to a project: Activiteiten / Voortgang / Gezondheid / Budget /
 * Besteed / Deadline. Self-contained: reads the project (progress, budget,
 * deadline) + the health/attention signals from the project's own endpoints.
 */
export const ProjectKpiStrip = () => {
  const { id } = useParams();
  const { pt } = usePageTranslations();
  const { language } = useLanguage();

  const { data: project } = useQuery({
    queryKey: ["project", id],
    queryFn: () => getJson(`/api/v1/projects/${id}/`),
    enabled: !!id,
  });

  const { data: health } = useQuery({
    queryKey: ["project-health", id],
    queryFn: () => getJson(`/api/v1/projects/${id}/health/`),
    enabled: !!id,
  });

  // Summary carries the spent figure (budget-gated server-side — absent for
  // non-finance roles, in which case we render a dash).
  const { data: summary } = useQuery({
    queryKey: ["project-summary", id],
    queryFn: () => getJson(`/api/v1/projects/${id}/summary/`),
    enabled: !!id,
  });

  const currency = ((project?.currency as CurrencyCode) || getCurrencyFromLanguage(language));
  const formatCurrency = (amount?: number | null) =>
    amount == null ? "—" : formatBudgetDetailed(amount || 0, currency, language);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "—";
    const locale = language === "nl" ? "nl-NL" : "en-US";
    return new Date(dateString).toLocaleDateString(locale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const rag = health?.rag || "";
  const progress = project?.progress ?? 0;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{pt("Activities")}</p>
                <p className="text-2xl font-bold">{health?.open_actions ?? 0}</p>
              </div>
              <ListChecks className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{pt("Progress")}</p>
                <p className="text-2xl font-bold">{progress}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{pt("Health")}</p>
                <div className={cn("flex items-center gap-2 mt-1 px-2 py-1 rounded-full w-fit", RAG_BG[rag] || "bg-gray-100")}>
                  <CheckCircle2 className={cn("h-4 w-4", RAG_TEXT[rag] || "text-gray-600")} />
                  <span className={cn("text-sm font-medium capitalize", RAG_TEXT[rag] || "text-gray-600")}>
                    {rag || pt("Unknown")}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{pt("Budget")}</p>
                <p className="text-2xl font-bold">{formatCurrency(project?.budget)}</p>
              </div>
              <Euro className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{pt("Spent")}</p>
                <p className="text-2xl font-bold">{formatCurrency(summary?.spent)}</p>
              </div>
              <Euro className="h-8 w-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">{pt("Deadline")}</p>
                <p className="text-lg font-semibold">{formatDate(project?.end_date)}</p>
              </div>
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Overall progress bar (mirrors the programme 'Totale Voortgang' bar) */}
      <Card className="mt-4">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium">{pt("Overall Progress")}</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-3" />
        </CardContent>
      </Card>
    </>
  );
};

export default ProjectKpiStrip;
