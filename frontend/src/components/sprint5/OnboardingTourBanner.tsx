/**
 * Sprint 5 S5-07 — Onboarding tour banner for new team members.
 *
 * Fetches GET /api/v1/projects/<pk>/team/<user_id>/onboarding-tour/ and
 * renders a dismissible banner with a "Toon volledig" slideover. The
 * caller decides when to mount — this component only self-dismisses via
 * localStorage so a user who dismissed it on project 103 does not see
 * it return on next visit.
 */
import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, X, ChevronRight, UserPlus } from "lucide-react";
import {
  Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle,
} from "@/components/ui/sheet";
import { useLanguage } from "@/contexts/LanguageContext";

interface TourResponse {
  suggested: {
    greeting: string;
    project_summary: string;
    your_role_focus: string;
    recommended_first_actions: string[];
    context_docs: string[];
  };
  source: "ai" | "fallback";
  warnings?: string[];
}

export interface OnboardingTourBannerProps {
  projectId: string | number;
  userId: number | string;
  /** Days since the user was added to the project. Banner only shows for
   *  members added less than 7 days ago. */
  daysSinceAdded: number;
}

const OnboardingTourBanner: React.FC<OnboardingTourBannerProps> = ({
  projectId, userId, daysSinceAdded,
}) => {
  const { language } = useLanguage();
  const dismissKey = `sprint5.onboardingTour.dismissed.p${projectId}.u${userId}`;
  const [dismissed, setDismissed] = useState<boolean>(() => {
    try {
      return !!localStorage.getItem(dismissKey);
    } catch {
      return false;
    }
  });
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<TourResponse | null>(null);
  const [open, setOpen] = useState(false);

  const show = daysSinceAdded < 7 && !dismissed;

  useEffect(() => {
    if (!show) return;
    let cancel = false;
    (async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem("access_token");
        const r = await fetch(
          `/api/v1/projects/${projectId}/team/${userId}/onboarding-tour/`,
          {
            method: "GET",
            headers: {
              "X-UI-Language": language || "nl",
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
          },
        );
        if (!r.ok) {
          if (!cancel) setData(null);
          return;
        }
        const payload: TourResponse = await r.json();
        if (!cancel) setData(payload);
      } finally {
        if (!cancel) setLoading(false);
      }
    })();
    return () => {
      cancel = true;
    };
  }, [show, projectId, userId, language]);

  if (!show) return null;

  const handleDismiss = () => {
    try {
      localStorage.setItem(dismissKey, "1");
    } catch {}
    setDismissed(true);
  };

  const isNl = language === "nl" || !language;
  const isFr = language === "fr";

  return (
    <>
      <Alert className="border-purple-300 bg-gradient-to-r from-purple-50 to-fuchsia-50/60 dark:from-purple-950/30 dark:to-fuchsia-950/20">
        <Sparkles className="h-4 w-4 text-purple-600" />
        <AlertTitle className="text-purple-900 dark:text-purple-200 flex items-center gap-2">
          <UserPlus className="h-4 w-4" />
          {data?.suggested?.greeting ||
            (isFr ? "Bienvenue sur le projet" : isNl ? "Welkom bij het project" : "Welcome to the project")}
          {data?.source === "fallback" && (
            <Badge variant="outline" className="border-amber-400 text-amber-800 text-[10px]">
              {isFr ? "Déterministe" : isNl ? "Deterministisch" : "Deterministic"}
            </Badge>
          )}
        </AlertTitle>
        <AlertDescription className="text-purple-800 dark:text-purple-300 flex flex-wrap items-center gap-2 pt-1">
          {loading ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <>
              <span className="text-xs flex-1 min-w-0">
                {data?.suggested?.your_role_focus || ""}
              </span>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs text-purple-700 hover:bg-purple-100 gap-1"
                onClick={() => setOpen(true)}
                disabled={!data}
              >
                {isFr ? "Afficher plus" : isNl ? "Toon volledig" : "Show full tour"}
                <ChevronRight className="h-3.5 w-3.5" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="h-7 text-xs"
                onClick={handleDismiss}
              >
                <X className="h-3.5 w-3.5" />
              </Button>
            </>
          )}
        </AlertDescription>
      </Alert>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="sm:max-w-md overflow-y-auto">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-500" />
              {data?.suggested?.greeting}
            </SheetTitle>
            <SheetDescription>
              {data?.suggested?.project_summary || ""}
            </SheetDescription>
          </SheetHeader>
          <div className="mt-6 space-y-4">
            {data?.suggested?.your_role_focus && (
              <div>
                <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                  {isFr ? "Votre focus" : isNl ? "Jouw focus" : "Your focus"}
                </p>
                <p className="text-sm">{data.suggested.your_role_focus}</p>
              </div>
            )}
            {Array.isArray(data?.suggested?.recommended_first_actions) &&
              data!.suggested.recommended_first_actions.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    {isFr ? "Premières actions" : isNl ? "Eerste acties" : "First actions"}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    {data!.suggested.recommended_first_actions.map((a, i) => (
                      <li key={i}>{a}</li>
                    ))}
                  </ul>
                </div>
              )}
            {Array.isArray(data?.suggested?.context_docs) &&
              data!.suggested.context_docs.length > 0 && (
                <div>
                  <p className="text-xs font-semibold uppercase text-muted-foreground mb-1">
                    {isFr ? "Documents contexte" : isNl ? "Context-documenten" : "Context documents"}
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {data!.suggested.context_docs.map((d, i) => (
                      <li key={i}>{d}</li>
                    ))}
                  </ul>
                </div>
              )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default OnboardingTourBanner;
