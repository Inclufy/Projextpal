import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

/**
 * Sprint 7 — S7-07
 * ----------------
 * Shows budgeted vs actual COST (€) per team member for a project or a program.
 * Mirrors the row layout of S7-03's TimeVsBudgetWidget but in money.
 *
 * The parent is responsible for guarding visibility — this widget hits a
 * can_view_costs-gated endpoint and will render an access notice on 403.
 */

type Scope = "project" | "program";

interface Row {
  user_id: number;
  user_name: string;
  budgeted_hours: number;
  actual_hours: number;
  hourly_rate: number;
  budgeted_cost: number;
  actual_cost: number;
  pct: number;
  status: "on_track" | "approaching" | "exceeded";
}

interface Payload {
  rows: Row[];
  currency?: string;
  overall_pct: number;
  overall_status: Row["status"];
  totals: {
    budgeted_hours: number;
    actual_hours: number;
    budgeted_cost: number;
    actual_cost: number;
  };
}

interface Props {
  scope: Scope;
  id: number | string;
  className?: string;
}

const defaultFetcher = (url: string) => {
  const token = localStorage.getItem("access_token");
  return fetch(url, {
    credentials: "include",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
};

function fmtMoney(n: number, currency = "EUR"): string {
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

function statusBadgeClass(s: Row["status"]): string {
  if (s === "exceeded") return "bg-red-100 text-red-700 border-red-200";
  if (s === "approaching") return "bg-amber-100 text-amber-700 border-amber-200";
  return "bg-emerald-100 text-emerald-700 border-emerald-200";
}

function statusLabel(s: Row["status"]): string {
  if (s === "exceeded") return "Overschreden";
  if (s === "approaching") return "Nadert limiet";
  return "Op koers";
}

export function CostVsBudgetWidget({ scope, id, className }: Props) {
  const [data, setData] = useState<Payload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [forbidden, setForbidden] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    setForbidden(false);
    const base = scope === "program" ? "/api/v1/programs" : "/api/v1/projects";
    defaultFetcher(`${base}/${id}/time-vs-budget-cost/`)
      .then(async (r) => {
        if (r.status === 403) {
          if (!cancelled) setForbidden(true);
          return null;
        }
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return (await r.json()) as Payload;
      })
      .then((j) => {
        if (!cancelled && j) setData(j);
      })
      .catch((e: unknown) => {
        if (!cancelled) setError(e instanceof Error ? e.message : String(e));
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [scope, id]);

  if (loading) {
    return (
      <Card className={cn("p-4", className)}>
        <div className="animate-pulse space-y-2">
          <div className="h-4 w-40 bg-muted rounded" />
          <div className="h-24 bg-muted rounded" />
        </div>
      </Card>
    );
  }

  if (forbidden) {
    return (
      <Card className={cn("p-4", className)}>
        <h3 className="text-sm font-semibold mb-1">Begroting vs werkelijk (€)</h3>
        <p className="text-sm text-muted-foreground">
          Je hebt geen toegang tot financiële data voor dit onderdeel.
        </p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card className={cn("p-4", className)}>
        <h3 className="text-sm font-semibold mb-1">Begroting vs werkelijk (€)</h3>
        <p className="text-sm text-red-600">Kon niet laden: {error}</p>
      </Card>
    );
  }

  if (!data) return null;

  const currency = data.currency || "EUR";
  const hasRows = data.rows.length > 0;
  const budgeted = data.totals.budgeted_cost;

  return (
    <Card className={cn("p-4", className)} data-testid="cost-vs-budget-widget">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold">Begroting vs werkelijk (€)</h3>
        <Badge className={cn("text-xs", statusBadgeClass(data.overall_status))}>
          {statusLabel(data.overall_status)} · {data.overall_pct.toFixed(1)}%
        </Badge>
      </div>

      {!hasRows && (
        <div className="text-sm text-muted-foreground py-6 text-center">
          Nog geen begrotingen voor dit team. Voeg begrote uren toe bij elk team-lid om de kosten te zien.
        </div>
      )}

      {hasRows && (
        <>
          <div className="text-xs text-muted-foreground mb-2">
            Totaal begroot: {fmtMoney(budgeted, currency)} · werkelijk:{" "}
            {fmtMoney(data.totals.actual_cost, currency)}
          </div>
          <div className="space-y-2">
            {data.rows.map((r) => {
              const pct = Math.min(100, Math.max(0, r.pct));
              return (
                <div key={r.user_id} className="text-sm">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{r.user_name}</span>
                    <span className="text-muted-foreground">
                      {fmtMoney(r.actual_cost, currency)} / {fmtMoney(r.budgeted_cost, currency)}
                    </span>
                  </div>
                  <div className="h-2 bg-muted rounded mt-1 overflow-hidden">
                    <div
                      className={cn(
                        "h-2",
                        r.status === "exceeded" && "bg-red-500",
                        r.status === "approaching" && "bg-amber-500",
                        r.status === "on_track" && "bg-emerald-500",
                      )}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {r.actual_hours}u / {r.budgeted_hours}u · {fmtMoney(r.hourly_rate, currency)}/u
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </Card>
  );
}

export default CostVsBudgetWidget;
