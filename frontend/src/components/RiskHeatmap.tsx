import { useMemo } from "react";
import { cn } from "@/lib/utils";

export interface RiskHeatmapItem {
  id: number | string;
  name?: string;
  /** 1-5 scale */
  probability: number;
  /** 1-5 scale */
  impact: number;
}

interface RiskHeatmapProps {
  risks: RiskHeatmapItem[];
  className?: string;
  /** When set, calls back with the (impact, probability) of a clicked cell. */
  onCellClick?: (impact: number, probability: number, risks: RiskHeatmapItem[]) => void;
  /** Show a compact mode without axis labels. */
  compact?: boolean;
}

const PROB_LABELS = ["Very Low", "Low", "Medium", "High", "Very High"];
const IMPACT_LABELS = ["Very Low", "Low", "Medium", "High", "Very High"];

function clampScale(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, Math.min(5, Math.round(value)));
}

function zoneColor(score: number): string {
  if (score >= 15) return "bg-red-200 hover:bg-red-300 border-red-300";
  if (score >= 8) return "bg-amber-100 hover:bg-amber-200 border-amber-300";
  return "bg-emerald-100 hover:bg-emerald-200 border-emerald-300";
}

function zoneTextColor(score: number): string {
  if (score >= 15) return "text-red-900";
  if (score >= 8) return "text-amber-900";
  return "text-emerald-900";
}

/**
 * 5x5 Risk Heatmap matching the Yanmar Highlight Report risk map.
 *
 * X-axis = Impact (1-5, left -> right)
 * Y-axis = Probability (1-5, bottom -> top)
 *
 * Each cell shows the count of risks landing in that (impact, probability)
 * bucket; clicking a cell exposes the underlying risks via `onCellClick`.
 */
export function RiskHeatmap({
  risks,
  className,
  onCellClick,
  compact = false,
}: RiskHeatmapProps) {
  const buckets = useMemo(() => {
    const map = new Map<string, RiskHeatmapItem[]>();
    for (const r of risks) {
      const p = clampScale(r.probability);
      const i = clampScale(r.impact);
      const key = `${i}-${p}`;
      const list = map.get(key) ?? [];
      list.push(r);
      map.set(key, list);
    }
    return map;
  }, [risks]);

  return (
    <div className={cn("inline-block", className)}>
      <div className="flex">
        {!compact && (
          <div className="flex flex-col-reverse justify-between mr-2 py-1">
            {PROB_LABELS.map((label, idx) => (
              <span
                key={label}
                className="text-[10px] text-muted-foreground leading-none h-12 flex items-center"
                title={`Probability ${idx + 1}`}
              >
                {label}
              </span>
            ))}
          </div>
        )}
        <div>
          <div className="grid grid-cols-5 gap-0.5">
            {Array.from({ length: 5 }).map((_, rowFromTop) => {
              const probability = 5 - rowFromTop;
              return Array.from({ length: 5 }).map((__, col) => {
                const impact = col + 1;
                const key = `${impact}-${probability}`;
                const cellRisks = buckets.get(key) ?? [];
                const score = impact * probability;
                const fillClass = zoneColor(score);
                const textClass = zoneTextColor(score);
                return (
                  <button
                    type="button"
                    key={key}
                    onClick={() => onCellClick?.(impact, probability, cellRisks)}
                    className={cn(
                      "w-12 h-12 border rounded-sm transition-colors flex flex-col items-center justify-center",
                      fillClass,
                      textClass,
                      cellRisks.length === 0 && "opacity-80",
                    )}
                    title={`Impact ${impact} × Probability ${probability} — ${cellRisks.length} risk(s)`}
                    aria-label={`Risk cell impact ${impact} probability ${probability}, ${cellRisks.length} risks`}
                  >
                    {cellRisks.length > 0 ? (
                      <span className="text-sm font-semibold leading-none">
                        {cellRisks.length}
                      </span>
                    ) : (
                      <span className="text-[10px] opacity-40 leading-none">·</span>
                    )}
                    <span className="text-[9px] opacity-60 leading-none mt-0.5">
                      {score}
                    </span>
                  </button>
                );
              });
            })}
          </div>
          {!compact && (
            <div className="grid grid-cols-5 gap-0.5 mt-1">
              {IMPACT_LABELS.map((label, idx) => (
                <span
                  key={label}
                  className="text-[10px] text-muted-foreground text-center leading-none"
                  title={`Impact ${idx + 1}`}
                >
                  {label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>
      {!compact && (
        <div className="flex items-center justify-between mt-2 text-[10px] text-muted-foreground">
          <span>← lower impact</span>
          <span className="font-medium">Impact</span>
          <span>higher impact →</span>
        </div>
      )}
    </div>
  );
}

export default RiskHeatmap;
