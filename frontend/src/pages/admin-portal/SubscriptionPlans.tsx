import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Layers, Sparkles, Puzzle, Server, Check } from "lucide-react";
import {
  LICENCE_TIERS,
  ADDONS,
  HOSTING_TIERS,
  eur,
  type CatalogItem,
} from "@/data/pricing/projextpalCatalog";

const RECOMMENDED_TIER = "Professional";

const SkuChip = ({ sku }: { sku: string }) => (
  <span className="inline-flex items-center rounded-md bg-muted px-2 py-0.5 font-mono text-[11px] tracking-tight text-muted-foreground">
    {sku}
  </span>
);

const CompactRow = ({
  item,
  showSetup = false,
}: {
  item: CatalogItem;
  showSetup?: boolean;
}) => (
  <div className="flex items-center justify-between gap-4 rounded-lg border border-border/60 bg-card px-4 py-3 transition-colors hover:border-fuchsia-300 hover:bg-fuchsia-50/40">
    <div className="min-w-0">
      <p className="truncate font-medium">{item.name}</p>
      <div className="mt-1">
        <SkuChip sku={item.sku} />
      </div>
    </div>
    <div className="shrink-0 text-right">
      <p className="font-semibold text-purple-700">
        {item.price === 0 ? "Inbegrepen" : <>{eur(item.price)}<span className="text-xs font-normal text-muted-foreground">/maand</span></>}
      </p>
      {showSetup && item.setup ? (
        <p className="text-xs text-muted-foreground">+ {eur(item.setup)} setup</p>
      ) : null}
    </div>
  </div>
);

const SubscriptionPlans = () => {
  return (
    <div className="space-y-8">
      {/* Page header */}
      <div className="flex items-center gap-3">
        <div className="rounded-xl bg-gradient-to-br from-purple-600 to-fuchsia-500 p-2.5 text-white shadow-sm">
          <Layers className="h-6 w-6" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Abonnementsplannen</h1>
          <p className="text-sm text-muted-foreground">
            De canonieke ProjeXtPal-licentieplannen en add-ons (ex btw).
          </p>
        </div>
      </div>

      {/* Licence tiers */}
      <section className="space-y-4">
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {LICENCE_TIERS.map((tier) => {
            const recommended = tier.name === RECOMMENDED_TIER;
            return (
              <Card
                key={tier.sku}
                className={`relative flex flex-col overflow-hidden transition-shadow hover:shadow-lg ${
                  recommended ? "ring-2 ring-purple-600" : ""
                }`}
              >
                {recommended && (
                  <div className="absolute right-0 top-0 flex items-center gap-1 rounded-bl-lg bg-gradient-to-r from-purple-600 to-fuchsia-500 px-3 py-1 text-xs font-medium text-white">
                    <Sparkles className="h-3 w-3" />
                    Aanbevolen
                  </div>
                )}
                <CardContent className="flex flex-1 flex-col p-5">
                  <h3 className="text-lg font-bold">{tier.name}</h3>
                  <p className="mt-3">
                    <span className="text-3xl font-bold text-purple-700">{eur(tier.price)}</span>
                    <span className="text-sm font-normal text-muted-foreground">/gebruiker/maand</span>
                  </p>
                  {tier.description && (
                    <p className="mt-2 flex items-start gap-2 text-sm text-muted-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-fuchsia-500" />
                      <span>{tier.description}</span>
                    </p>
                  )}
                  <div className="mt-auto pt-4">
                    <SkuChip sku={tier.sku} />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      {/* Add-ons */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Puzzle className="h-5 w-5 text-fuchsia-500" />
          <h2 className="text-lg font-semibold">Add-ons (per maand)</h2>
          <Badge variant="outline">{ADDONS.length}</Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {ADDONS.map((item) => (
            <CompactRow key={item.sku} item={item} />
          ))}
        </div>
      </section>

      {/* Hosting & data sovereignty */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <Server className="h-5 w-5 text-purple-600" />
          <h2 className="text-lg font-semibold">Hosting &amp; data-soevereiniteit</h2>
          <Badge variant="outline">{HOSTING_TIERS.length}</Badge>
        </div>
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {HOSTING_TIERS.map((item) => (
            <CompactRow key={item.sku} item={item} showSetup />
          ))}
        </div>
      </section>
    </div>
  );
};

export default SubscriptionPlans;
