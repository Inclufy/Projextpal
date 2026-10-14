/**
 * Sprint 5 S5-08 — Dashboard narrative widget.
 *
 * Fetches GET /api/v1/projects/<pk>/dashboard/narrative/ and renders a
 * compact "what should I know this morning?" paragraph with 3-5 key
 * insights. Includes a refresh button; the amber "Deterministisch" badge
 * appears when the backend falls back to the no-LLM template.
 */
import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Sparkles, Lightbulb } from "lucide-react";
import { useLanguage } from "@/contexts/LanguageContext";

interface NarrativeResponse {
  suggested: {
    headline: string;
    body: string;
    key_insights: string[];
  };
  source: "ai" | "fallback";
  warnings?: string[];
}

export interface DashboardNarrativeWidgetProps {
  projectId: string | number;
}

const DashboardNarrativeWidget: React.FC<DashboardNarrativeWidgetProps> = ({ projectId }) => {
  const { language } = useLanguage();
  const [data, setData] = useState<NarrativeResponse | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchNarrative = useCallback(async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const r = await fetch(`/api/v1/projects/${projectId}/dashboard/narrative/`, {
        method: "GET",
        headers: {
          "X-UI-Language": language || "nl",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      if (!r.ok) {
        setData(null);
        return;
      }
      const payload: NarrativeResponse = await r.json();
      setData(payload);
    } catch {
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [projectId, language]);

  useEffect(() => {
    void fetchNarrative();
  }, [fetchNarrative]);

  const isNl = language === "nl" || !language;
  const isFr = language === "fr";

  return (
    <Card className="border-purple-200 bg-gradient-to-br from-purple-50/60 to-fuchsia-50/40 dark:from-purple-950/20 dark:to-fuchsia-950/10">
      <CardHeader className="pb-3 flex-row flex items-center justify-between">
        <CardTitle className="flex items-center gap-2 text-base">
          <Sparkles className="h-4 w-4 text-purple-500" />
          {isFr ? "Résumé IA du projet" : isNl ? "AI-samenvatting van het project" : "AI project snapshot"}
          {data?.source === "fallback" && (
            <Badge variant="outline" className="border-amber-400 text-amber-800 text-[10px]">
              {isFr
                ? "Déterministe, sans clé IA"
                : isNl
                  ? "Deterministisch, zonder AI-sleutel"
                  : "Deterministic, no AI key"}
            </Badge>
          )}
        </CardTitle>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => void fetchNarrative()}
          disabled={loading}
          className="h-7 gap-1.5 text-purple-700"
        >
          {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          {isFr ? "Actualiser" : isNl ? "Vernieuwen" : "Refresh"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <div className="flex items-center justify-center py-6">
            <Loader2 className="h-6 w-6 animate-spin text-purple-500" />
          </div>
        ) : !data ? (
          <p className="text-sm text-muted-foreground">
            {isFr
              ? "Impossible de charger la narration."
              : isNl
                ? "Narrative niet beschikbaar."
                : "Narrative unavailable."}
          </p>
        ) : (
          <>
            {data.suggested.headline && (
              <h4 className="text-sm font-semibold text-foreground">{data.suggested.headline}</h4>
            )}
            {data.suggested.body && (
              <p className="text-sm text-muted-foreground leading-relaxed">{data.suggested.body}</p>
            )}
            {Array.isArray(data.suggested.key_insights) && data.suggested.key_insights.length > 0 && (
              <ul className="space-y-1.5 pt-1">
                {data.suggested.key_insights.map((k, i) => (
                  <li key={i} className="flex items-start gap-2 text-xs text-foreground">
                    <Lightbulb className="h-3.5 w-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <span>{k}</span>
                  </li>
                ))}
              </ul>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
};

export default DashboardNarrativeWidget;
