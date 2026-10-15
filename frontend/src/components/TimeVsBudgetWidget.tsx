/**
 * Sprint 7 — "Uren vs budget" reports widget.
 *
 * Props: either `projectId` or `programId` (not both). The widget calls the
 * matching backend endpoint:
 *   - GET /api/v1/projects/<id>/time-vs-budget/
 *   - GET /api/v1/programs/<id>/time-vs-budget/
 *
 * Row shape (see backend/projects/budget_views.py):
 *   { user_id, user_name, role, budgeted_hours, actual_hours, pct, status }
 *
 * The widget renders a table with user | begroot | actueel | pct-bar. The
 * bar colour maps to `status`:
 *   on_track   (< 90%)  — green
 *   approaching (>= 90%) — amber
 *   exceeded    (> 100%) — red
 *
 * Empty state (API returns []): a copy block prompting the admin to set a
 * budget when adding team members.
 *
 * i18n: a tiny built-in NL/EN translation layer (reads the standard
 * `preferred_language` cookie / localStorage key the rest of the app uses).
 */
import { useEffect, useState } from "react";
import { Clock, AlertTriangle, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const API_BASE_URL = "/api/v1";

type Row = {
  user_id: number;
  user_name: string;
  role: string;
  budgeted_hours: number;
  actual_hours: number;
  pct: number;
  status: "on_track" | "approaching" | "exceeded";
};

type Props = {
  projectId?: number | string;
  programId?: number | string;
  className?: string;
};

/** Minimal translator — mirrors the pattern used elsewhere in the SPA. */
function useT() {
  const [lang, setLang] = useState<"nl" | "en">(() => {
    try {
      const v = localStorage.getItem("preferred_language");
      return v === "en" ? "en" : "nl";
    } catch {
      return "nl";
    }
  });
  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if (e.key === "preferred_language") {
        setLang(e.newValue === "en" ? "en" : "nl");
      }
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);
  return (nl: string, en: string) => (lang === "en" ? en : nl);
}

/** status → bar colour. Tailwind classes so dark-mode keeps working. */
const BAR_COLOR: Record<Row["status"], string> = {
  on_track: "bg-emerald-500",
  approaching: "bg-amber-500",
  exceeded: "bg-rose-500",
};

const STATUS_BADGE: Record<Row["status"], string> = {
  on_track: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300",
  approaching: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
  exceeded: "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-300",
};

export default function TimeVsBudgetWidget({
  projectId,
  programId,
  className,
}: Props) {
  const t = useT();
  const [rows, setRows] = useState<Row[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const scope = projectId !== undefined ? "projects" : "programs";
  const scopeId = projectId !== undefined ? projectId : programId;

  useEffect(() => {
    if (scopeId === undefined || scopeId === null || scopeId === "") return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    (async () => {
      try {
        const token = localStorage.getItem("access_token");
        const res = await fetch(
          `${API_BASE_URL}/${scope}/${scopeId}/time-vs-budget/`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (!res.ok) {
          if (!cancelled) {
            setError(`HTTP ${res.status}`);
            setRows([]);
          }
          return;
        }
        const data = await res.json();
        if (!cancelled) setRows(Array.isArray(data) ? data : []);
      } catch (e: any) {
        if (!cancelled) {
          setError(e?.message || "network");
          setRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [scope, scopeId]);

  return (
    <Card className={cn("w-full", className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <Clock className="h-4 w-4 text-primary" />
          {t("Uren vs budget", "Hours vs budget")}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("Laden...", "Loading...")}
          </div>
        )}
        {!loading && error && (
          <div className="flex items-start gap-2 text-sm text-rose-600 py-4">
            <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
            <span>
              {t(
                "Kon de begroting niet laden.",
                "Could not load the budget data.",
              )}
            </span>
          </div>
        )}
        {!loading && !error && rows.length === 0 && (
          <div className="py-6 text-center">
            <p className="text-sm text-muted-foreground">
              {t(
                "Nog geen begrotingen ingesteld — zet een budget bij het toevoegen aan het team.",
                "No budgets set yet — enter one when adding the person to the team.",
              )}
            </p>
          </div>
        )}
        {!loading && !error && rows.length > 0 && (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("Teamlid", "Member")}</TableHead>
                  <TableHead className="text-right">
                    {t("Begroot", "Budget")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("Actueel", "Actual")}
                  </TableHead>
                  <TableHead className="min-w-[180px]">
                    {t("Voortgang", "Progress")}
                  </TableHead>
                  <TableHead className="text-right">
                    {t("Status", "Status")}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((r) => {
                  // Cap the bar at 100% so an "exceeded" row still renders.
                  const barPct = Math.min(100, Math.max(0, r.pct));
                  return (
                    <TableRow key={r.user_id}>
                      <TableCell className="font-medium">
                        <div className="flex flex-col">
                          <span>{r.user_name}</span>
                          {r.role && (
                            <span className="text-xs text-muted-foreground">
                              {r.role}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.budgeted_hours.toFixed(2)}h
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {r.actual_hours.toFixed(2)}h
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div className="relative h-2 flex-1 rounded-full bg-muted overflow-hidden">
                            <div
                              className={cn(
                                "absolute inset-y-0 left-0 rounded-full",
                                BAR_COLOR[r.status],
                              )}
                              style={{ width: `${barPct}%` }}
                            />
                          </div>
                          <span className="w-14 text-right text-xs tabular-nums text-muted-foreground">
                            {r.pct.toFixed(1)}%
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Badge
                          variant="secondary"
                          className={cn("text-xs", STATUS_BADGE[r.status])}
                        >
                          {r.status === "on_track"
                            ? t("Op koers", "On track")
                            : r.status === "approaching"
                              ? t("Nadert", "Approaching")
                              : t("Overschreden", "Exceeded")}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
