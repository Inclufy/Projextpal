import { Zap } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useAIUsage } from "@/hooks/useAIUsage";
import { usePageTranslations } from "@/hooks/usePageTranslations";

/**
 * AIUsagePill — compacte topbar-badge die het resterende AI-tokenbudget toont.
 * Kleur:
 *   - groen (default): warn_level = "ok"
 *   - amber: warn_level = "warning"  (< 7 dagen resterend)
 *   - rood:  warn_level = "critical" (< 1 dag of quota op)
 *
 * Tooltip toont absolute getallen + geschat aantal dagen tot leeg.
 */

const fmt = (n: number) => {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(0)}k`;
  return `${n}`;
};

export default function AIUsagePill() {
  const { pt } = usePageTranslations();
  const { data } = useAIUsage();

  if (!data || !data.available) return null;

  const pct = Math.min(100, Math.round((data.used_30d / Math.max(1, data.quota_monthly)) * 100));
  const warn = data.warn_level;
  const label = warn === "critical"
    ? pt("Low AI credits")
    : warn === "warning"
      ? pt("AI credits running low")
      : pt("AI credits");

  const cls =
    warn === "critical"
      ? "bg-red-50 border-red-300 text-red-700 hover:bg-red-100"
      : warn === "warning"
        ? "bg-amber-50 border-amber-300 text-amber-800 hover:bg-amber-100"
        : "bg-emerald-50 border-emerald-200 text-emerald-700 hover:bg-emerald-100";

  const daysText = data.estimated_days_left == null
    ? pt("No usage yet in the last 7 days")
    : `~${data.estimated_days_left} ${pt("days left at current pace")}`;

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button
            type="button"
            aria-label={label}
            className={`hidden md:inline-flex items-center gap-1.5 h-7 px-2.5 rounded-full border text-xs font-medium transition-colors ${cls}`}
          >
            <Zap className="h-3.5 w-3.5" />
            <span>{pct}%</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="bottom" align="end" className="max-w-xs">
          <div className="space-y-1 text-xs">
            <p className="font-semibold">{label}</p>
            <p>{daysText}</p>
            <p className="text-muted-foreground">
              {fmt(data.used_30d)} / {fmt(data.quota_monthly)} {pt("tokens this month")}
            </p>
            {data.used_today > 0 && (
              <p className="text-muted-foreground">
                {fmt(data.used_today)} {pt("tokens today")} · {fmt(Math.round(data.daily_avg_7d))} {pt("7-day average")}
              </p>
            )}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
