import { AlertTriangle } from "lucide-react";
import { useAIUsage } from "@/hooks/useAIUsage";
import { usePageTranslations } from "@/hooks/usePageTranslations";

/**
 * AIUsageWarningBanner — toont alleen een inline banner als het AI-tokenbudget
 * onder één dag resterend zit (warn_level === "critical"). Bedoeld voor AI-
 * surfaces (Plan with AI, Ask Co-pilot) zodat de gebruiker vóór een call
 * weet dat credits bijna op zijn.
 *
 * Toont niets wanneer er geen summary beschikbaar is of warn_level === "ok".
 * Op "warning" niveau (<7 dagen) wordt NIET gewaarschuwd — dat niveau zit al
 * op de topbar-pill; alleen de harde grens krijgt een inline interrupt.
 */
export default function AIUsageWarningBanner({ className = "" }: { className?: string }) {
  const { pt } = usePageTranslations();
  const { data } = useAIUsage();

  if (!data || !data.available) return null;
  if (data.warn_level !== "critical") return null;

  const days = data.estimated_days_left;
  const msg = days != null && days > 0
    ? `${pt("AI credits are nearly out")} — ~${days} ${pt("days left at current pace")}. ${pt("Top up to avoid interruptions.")}`
    : `${pt("AI credits are exhausted.")} ${pt("Top up to continue using AI features.")}`;

  return (
    <div
      role="alert"
      className={`flex items-center gap-2 text-xs px-3 py-2 rounded-md bg-red-50 border border-red-300 text-red-800 ${className}`}
    >
      <AlertTriangle className="h-3.5 w-3.5 shrink-0" />
      <span className="flex-1">{msg}</span>
    </div>
  );
}
