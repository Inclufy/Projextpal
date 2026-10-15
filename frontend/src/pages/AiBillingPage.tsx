// =============================================================================
// AiBillingPage — per-tenant AI usage + billing overview.
//
// Twee tiers op dezelfde factuur:
//   * BYOK-tenant → jouw provider rekent het ruwe token-verbruik; Inclufy
//     rekent een service-fee (default 15% van de lijstprijs) voor het
//     draaien van de infrastructuur (audit, dashboard, isolatie, support).
//   * Inclufy-pool tenant → volle lijstprijs, direct door Inclufy op je
//     Finance-factuur gezet.
// Beide tiers tonen een € kolom; het verschil zit in het bedrag.
//
// Mount in App.tsx als /settings/ai-billing (any authenticated user ziet
// zijn eigen company; superuser kan via ?company=<id> cross-tenant).
// =============================================================================

import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, Sparkles, Shield, Key, AlertCircle, TrendingUp } from "lucide-react";
import { usePageTranslations } from "@/hooks/usePageTranslations";
import { ProjectHeader } from "@/components/ProjectHeader";  // no-op without /:id

interface Summary {
  company_id: number;
  byok: boolean;
  byok_service_fee_fraction: number;
  month_start: string;
  month_summary: {
    tokens: number; tokens_prompt: number; tokens_completion: number;
    cost_cents: number; calls: number;
    pool_cost_cents: number; pool_tokens: number; pool_calls: number;
    byok_fee_cents: number; byok_tokens: number; byok_calls: number;
  };
  by_provider: Array<{ provider: string; tokens: number; cost_cents: number; calls: number }>;
  by_surface: Array<{ surface: string; tokens: number; cost_cents: number; calls: number }>;
  by_user: Array<{ user_id: number | null; user__email: string | null; tokens: number; cost_cents: number; calls: number }>;
  daily: Record<string, { tokens: number; cost_cents: number }>;
  note: string;
}

const euroCents = (c: number) => `€${(c / 100).toFixed(2)}`;
const nfmt = (n: number) => n.toLocaleString("nl-NL");

export default function AiBillingPage() {
  const { pt } = usePageTranslations();
  const [sp] = useSearchParams();
  const override = sp.get("company");

  const { data, isLoading, error } = useQuery<Summary>({
    queryKey: ["ai-billing-summary", override],
    queryFn: async () => {
      const token = localStorage.getItem("access_token");
      const q = override ? `?company=${encodeURIComponent(override)}` : "";
      const r = await fetch(`/api/v1/ai/billing/summary/${q}`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    },
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <div className="min-h-full bg-background flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  if (error || !data) {
    return (
      <div className="min-h-full bg-background p-6">
        <Card className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertCircle className="h-5 w-5" />
            <span>{pt("Kon AI-verbruik niet laden")}</span>
          </div>
        </Card>
      </div>
    );
  }

  const s = data.month_summary;
  const monthLabel = new Date(data.month_start).toLocaleDateString("nl-NL", {
    month: "long", year: "numeric",
  });

  return (
    <div className="min-h-full bg-background">
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-3">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-purple-500" />
              {pt("AI-verbruik")}
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              {pt("Maand")}: <span className="font-medium capitalize">{monthLabel}</span>
            </p>
          </div>
          <div className="flex items-center gap-2">
            {data.byok ? (
              <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-200 gap-1">
                <Key className="h-3 w-3" /> {pt("Eigen key actief")}
              </Badge>
            ) : (
              <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200 gap-1">
                <Shield className="h-3 w-3" /> {pt("Inclufy-pool")}
              </Badge>
            )}
          </div>
        </div>

        {/* Billing banner */}
        <Card className={`p-4 ${data.byok ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30" : "border-amber-300 bg-amber-50 dark:bg-amber-950/30"}`}>
          <p className={`text-sm ${data.byok ? "text-emerald-900 dark:text-emerald-100" : "text-amber-900 dark:text-amber-100"}`}>
            {data.note}
          </p>
        </Card>

        {/* Big tiles */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Tile label={pt("Tokens deze maand")} value={nfmt(s.tokens || 0)} />
          <Tile label={pt("Aantal calls")} value={nfmt(s.calls || 0)} />
          <Tile
            label={pt("Inclufy-pool")}
            value={euroCents(s.pool_cost_cents || 0)}
            sublabel={`${nfmt(s.pool_calls || 0)} ${pt("calls")} · ${nfmt(s.pool_tokens || 0)} ${pt("tokens")}`}
            emphasis={!data.byok && (s.pool_cost_cents || 0) > 0}
          />
          <Tile
            label={pt("BYOK service-fee")}
            value={euroCents(s.byok_fee_cents || 0)}
            sublabel={`${nfmt(s.byok_calls || 0)} ${pt("calls")} · ${Math.round(
              (data.byok_service_fee_fraction || 0.15) * 100
            )}% ${pt("van lijstprijs")}`}
            emphasis={data.byok && (s.byok_fee_cents || 0) > 0}
            tier="byok"
          />
        </div>

        {/* Provider breakdown */}
        <Card className="p-5">
          <h2 className="font-semibold mb-3 flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-purple-500" />
            {pt("Per AI-provider")}
          </h2>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b">
              <tr><th className="text-left py-1">{pt("Provider")}</th>
                <th className="text-right">{pt("Calls")}</th>
                <th className="text-right">{pt("Tokens")}</th>
                <th className="text-right">{pt("Kosten")}</th>
              </tr>
            </thead>
            <tbody>
              {data.by_provider.map((r) => (
                <tr key={r.provider} className="border-b border-border/40">
                  <td className="py-1.5">{r.provider}</td>
                  <td className="text-right text-muted-foreground">{nfmt(r.calls)}</td>
                  <td className="text-right">{nfmt(r.tokens)}</td>
                  <td className="text-right font-medium">{euroCents(r.cost_cents)}</td>
                </tr>
              ))}
              {data.by_provider.length === 0 && (
                <tr><td colSpan={4} className="py-4 text-center text-muted-foreground italic">
                  {pt("Nog geen AI-calls deze maand")}
                </td></tr>
              )}
            </tbody>
          </table>
        </Card>

        {/* Surface breakdown */}
        <Card className="p-5">
          <h2 className="font-semibold mb-3">{pt("Per feature")}</h2>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b">
              <tr><th className="text-left py-1">{pt("Feature / surface")}</th>
                <th className="text-right">{pt("Calls")}</th>
                <th className="text-right">{pt("Tokens")}</th>
                <th className="text-right">{pt("Kosten")}</th>
              </tr>
            </thead>
            <tbody>
              {data.by_surface.map((r, i) => (
                <tr key={i} className="border-b border-border/40">
                  <td className="py-1.5 font-mono text-xs">{r.surface || "(unknown)"}</td>
                  <td className="text-right text-muted-foreground">{nfmt(r.calls)}</td>
                  <td className="text-right">{nfmt(r.tokens)}</td>
                  <td className="text-right">{euroCents(r.cost_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>

        {/* User breakdown */}
        <Card className="p-5">
          <h2 className="font-semibold mb-3">{pt("Top 10 gebruikers")}</h2>
          <table className="w-full text-sm">
            <thead className="text-xs text-muted-foreground border-b">
              <tr><th className="text-left py-1">{pt("Gebruiker")}</th>
                <th className="text-right">{pt("Calls")}</th>
                <th className="text-right">{pt("Tokens")}</th>
                <th className="text-right">{pt("Kosten")}</th>
              </tr>
            </thead>
            <tbody>
              {data.by_user.map((r, i) => (
                <tr key={i} className="border-b border-border/40">
                  <td className="py-1.5">{r.user__email || `#${r.user_id ?? "?"}`}</td>
                  <td className="text-right text-muted-foreground">{nfmt(r.calls)}</td>
                  <td className="text-right">{nfmt(r.tokens)}</td>
                  <td className="text-right">{euroCents(r.cost_cents)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </div>
    </div>
  );
}

function Tile({
  label, value, sublabel, emphasis, tier,
}: {
  label: string;
  value: string;
  sublabel?: string;
  emphasis?: boolean;
  tier?: "byok" | "pool";
}) {
  const emColor = tier === "byok"
    ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-900 dark:text-emerald-100"
    : "border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-amber-900 dark:text-amber-100";
  return (
    <Card className={`p-4 ${emphasis ? emColor : ""}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-2xl font-bold mt-1 ${emphasis ? "" : ""}`}>{value}</div>
      {sublabel && (
        <div className="text-[11px] text-muted-foreground mt-1">{sublabel}</div>
      )}
    </Card>
  );
}
