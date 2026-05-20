import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";

interface BudgetRollup {
  currency: string;
  budget: number;
  etc: number;
  contingency: number;
  internal: number;
  external: number;
  paid: number;
  outstanding: number;
  actuals: number;
  variance: number;
  budget_used_pct: number;
  as_of: string;
}

interface Props {
  projectId: number | string;
  fetcher?: (url: string) => Promise<Response>;
  className?: string;
}

const DEFAULT_FETCHER = (url: string) =>
  fetch(url, { credentials: "include" });

function fmt(n: number, currency: string): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(n);
  } catch {
    return `${currency} ${Math.round(n).toLocaleString()}`;
  }
}

/**
 * Yanmar "one-view" budget panel.
 *
 *   ┌─────────── BUDGET (€450k) ───────────┐
 *   │  ███████ Internal   ████ External      │
 *   │                  ░ ETC   · Variance   │
 *   └────────────────────────────────────────┘
 *
 * Single horizontal stacked bar + a table breakdown.
 */
export function BudgetOneView({
  projectId,
  fetcher = DEFAULT_FETCHER,
  className,
}: Props) {
  const [data, setData] = useState<BudgetRollup | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    fetcher(`/api/v1/projects/${projectId}/budget-rollup/`)
      .then(async (r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((j: BudgetRollup) => { if (!cancelled) setData(j); })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [projectId, fetcher]);

  if (loading) {
    return (
      <div className={cn("h-32 rounded-md border border-slate-200 bg-slate-50 animate-pulse", className)} />
    );
  }
  if (error) {
    return <div className={cn("text-sm text-red-700", className)}>Failed to load budget: {error}</div>;
  }
  if (!data) return null;

  const denom = Math.max(data.budget, data.actuals + data.etc, 1);
  const pct = (n: number) => Math.max(0, (n / denom) * 100);

  return (
    <div className={cn("rounded-md border border-slate-200 bg-white p-4 space-y-4", className)}>
      <header className="flex items-baseline justify-between">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-slate-600">
          Budget overview
        </h3>
        <span className="text-xs text-slate-500">as of {data.as_of}</span>
      </header>

      {/* Stacked bar */}
      <div>
        <div className="h-6 w-full rounded-md bg-slate-100 overflow-hidden flex">
          <div
            className="bg-sky-500 hover:bg-sky-600"
            style={{ width: `${pct(data.internal)}%` }}
            title={`Internal: ${fmt(data.internal, data.currency)}`}
          />
          <div
            className="bg-violet-500 hover:bg-violet-600"
            style={{ width: `${pct(data.external)}%` }}
            title={`External: ${fmt(data.external, data.currency)}`}
          />
          <div
            className="bg-amber-300"
            style={{ width: `${pct(data.etc)}%` }}
            title={`ETC (forecast remaining): ${fmt(data.etc, data.currency)}`}
          />
          <div
            className={data.variance >= 0 ? "bg-emerald-200" : "bg-red-300"}
            style={{ width: `${pct(Math.abs(data.variance))}%` }}
            title={
              data.variance >= 0
                ? `Under budget: ${fmt(data.variance, data.currency)}`
                : `Over budget: ${fmt(-data.variance, data.currency)}`
            }
          />
        </div>
        <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-slate-600">
          <Legend color="bg-sky-500" label={`Internal ${fmt(data.internal, data.currency)}`} />
          <Legend color="bg-violet-500" label={`External ${fmt(data.external, data.currency)}`} />
          <Legend color="bg-amber-300" label={`ETC ${fmt(data.etc, data.currency)}`} />
          <Legend
            color={data.variance >= 0 ? "bg-emerald-200" : "bg-red-300"}
            label={
              data.variance >= 0
                ? `Under €${Math.round(data.variance).toLocaleString()}`
                : `Over €${Math.round(-data.variance).toLocaleString()}`
            }
          />
        </div>
      </div>

      {/* Breakdown table */}
      <table className="w-full text-sm">
        <tbody>
          <Row label="Budget" value={data.budget} currency={data.currency} bold />
          <Row label="Internal (time × rate)" value={data.internal} currency={data.currency} />
          <Row label="External (invoices)" value={data.external} currency={data.currency} />
          <Row label="  · Paid" value={data.paid} currency={data.currency} muted />
          <Row label="  · Outstanding" value={data.outstanding} currency={data.currency} muted />
          <Row label="Actuals" value={data.actuals} currency={data.currency} />
          <Row label="ETC (forecast remaining)" value={data.etc} currency={data.currency} />
          <Row label="Contingency" value={data.contingency} currency={data.currency} muted />
          <Row
            label="Variance = Budget − (Actuals + ETC)"
            value={data.variance}
            currency={data.currency}
            bold
            tone={data.variance >= 0 ? "ok" : "warn"}
          />
        </tbody>
      </table>

      <footer className="text-[11px] text-slate-500">
        Budget used: <span className="font-medium">{data.budget_used_pct}%</span>
      </footer>
    </div>
  );
}

function Row({
  label, value, currency, bold = false, muted = false, tone,
}: {
  label: string;
  value: number;
  currency: string;
  bold?: boolean;
  muted?: boolean;
  tone?: "ok" | "warn";
}) {
  return (
    <tr className={cn(muted && "text-slate-500", bold && "font-semibold")}>
      <td className="py-1 pr-2">{label}</td>
      <td
        className={cn(
          "py-1 text-right tabular-nums",
          tone === "ok" && "text-emerald-700",
          tone === "warn" && "text-red-700",
        )}
      >
        {fmt(value, currency)}
      </td>
    </tr>
  );
}

function Legend({ color, label }: { color: string; label: string }) {
  return (
    <span className="inline-flex items-center gap-1">
      <span className={cn("inline-block w-3 h-3 rounded-sm", color)} />
      {label}
    </span>
  );
}

export default BudgetOneView;
