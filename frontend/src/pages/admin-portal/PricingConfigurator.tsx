import { useMemo, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { Minus, Plus, Send, FileText, Loader2, Calculator } from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';
import {
  LICENCE_TIERS, HOSTING_TIERS, ADDONS, SETUP, TRAINING, CONSULTANCY, eur, CatalogItem,
} from '@/data/pricing/projextpalCatalog';

const ALACARTE = [
  { key: 'setup', title: 'Setup & implementatie', items: SETUP },
  { key: 'training', title: 'Training', items: TRAINING },
  { key: 'consultancy', title: 'Consultancy', items: CONSULTANCY },
];

const PricingConfigurator = () => {
  const [tierSku, setTierSku] = useState('PXP-PRO');
  const [users, setUsers] = useState(10);
  const [hostingSku, setHostingSku] = useState('PXP-HOST-T1');
  const [addonSkus, setAddonSkus] = useState<Set<string>>(new Set());
  const [qty, setQty] = useState<Record<string, number>>({});

  const [sendOpen, setSendOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [custName, setCustName] = useState('');
  const [custEmail, setCustEmail] = useState('');
  const [custCompany, setCustCompany] = useState('');
  const [notes, setNotes] = useState('');

  const tier = LICENCE_TIERS.find((t) => t.sku === tierSku)!;
  const hosting = HOSTING_TIERS.find((h) => h.sku === hostingSku)!;

  const toggleAddon = (sku: string) =>
    setAddonSkus((prev) => {
      const next = new Set(prev);
      next.has(sku) ? next.delete(sku) : next.add(sku);
      return next;
    });
  const setItemQty = (sku: string, n: number) =>
    setQty((prev) => ({ ...prev, [sku]: Math.max(0, n) }));

  const { lineItems, monthly, setup, yearOne, perUserYear } = useMemo(() => {
    const items: any[] = [];
    const licenceMonthly = tier.price * users;
    items.push({ sku: tier.sku, name: `${tier.name} licentie`, qty: users, unit: 'per_user_month', unit_price: tier.price, line_total: licenceMonthly, period: '/maand' });

    let m = licenceMonthly;
    let s = 0;

    if (hosting.price > 0 || (hosting.setup || 0) > 0) {
      items.push({ sku: hosting.sku, name: `Hosting — ${hosting.name}`, qty: 1, unit: 'monthly', unit_price: hosting.price, line_total: hosting.price, period: '/maand' });
      m += hosting.price;
      s += hosting.setup || 0;
      if (hosting.setup) items.push({ sku: `${hosting.sku}-SETUP`, name: `Hosting setup — ${hosting.name}`, qty: 1, unit: 'one_off', unit_price: hosting.setup, line_total: hosting.setup, period: 'eenmalig' });
    }

    ADDONS.filter((a) => addonSkus.has(a.sku)).forEach((a) => {
      items.push({ sku: a.sku, name: a.name, qty: 1, unit: 'monthly', unit_price: a.price, line_total: a.price, period: '/maand' });
      m += a.price;
    });

    [...SETUP, ...TRAINING, ...CONSULTANCY].forEach((it) => {
      const q = qty[it.sku] || 0;
      if (q > 0) {
        const lt = it.price * q;
        items.push({ sku: it.sku, name: it.name, qty: q, unit: 'one_off', unit_price: it.price, line_total: lt, period: 'eenmalig' });
        s += lt;
      }
    });

    const y1 = m * 12 + s;
    return { lineItems: items, monthly: m, setup: s, yearOne: y1, perUserYear: users > 0 ? (m * 12) / users : 0 };
  }, [tier, users, hosting, addonSkus, qty]);

  const sendToCustomer = async () => {
    if (!custEmail) { toast.error('Vul een e-mailadres in.'); return; }
    setSending(true);
    try {
      await api.post('/admin/quotes/send/', {
        customer_email: custEmail,
        customer_name: custName,
        company_name: custCompany,
        line_items: lineItems,
        totals: { monthly_recurring: monthly, one_time_setup: setup, year_one_total: yearOne, per_user_year: Math.round(perUserYear) },
        notes,
      });
      toast.success(`Offerte verzonden naar ${custEmail}`);
      setSendOpen(false);
    } catch (e: any) {
      toast.error(e?.message || 'Versturen mislukt');
    } finally {
      setSending(false);
    }
  };

  const Stepper = ({ item }: { item: CatalogItem }) => {
    const q = qty[item.sku] || 0;
    return (
      <div className="flex items-center justify-between gap-3 py-2 border-b last:border-0">
        <div className="min-w-0">
          <p className="text-sm font-medium truncate">{item.name}</p>
          <p className="text-xs text-muted-foreground">{eur(item.price)} eenmalig · {item.sku}</p>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setItemQty(item.sku, q - 1)}><Minus className="h-3.5 w-3.5" /></Button>
          <span className="w-6 text-center text-sm tabular-nums">{q}</span>
          <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setItemQty(item.sku, q + 1)}><Plus className="h-3.5 w-3.5" /></Button>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2"><Calculator className="h-6 w-6 text-purple-600" />Prijzen configurator</h1>
        <p className="text-muted-foreground text-sm">Stel een plan samen op basis van de canonieke ProjeXtPal-prijzen (ex btw) en stuur een offerte naar de klant.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* configurator */}
        <div className="lg:col-span-2 space-y-6">
          <Card><CardContent className="p-5 space-y-5">
            <p className="font-semibold text-sm">Licentie</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {LICENCE_TIERS.map((t) => (
                <button key={t.sku} onClick={() => setTierSku(t.sku)}
                  className={`rounded-xl border p-3 text-left transition ${t.sku === tierSku ? 'border-purple-600 ring-2 ring-purple-200 bg-purple-50/60' : 'hover:border-purple-300'}`}>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-lg font-bold text-purple-700">{eur(t.price)}</p>
                  <p className="text-[11px] text-muted-foreground">/gebr./maand</p>
                </button>
              ))}
            </div>
            <div className="flex items-center gap-3">
              <Label className="text-sm">Aantal gebruikers</Label>
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setUsers((u) => Math.max(1, u - 1))}><Minus className="h-4 w-4" /></Button>
              <Input type="number" value={users} onChange={(e) => setUsers(Math.max(1, parseInt(e.target.value || '1', 10)))} className="w-20 text-center" />
              <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => setUsers((u) => u + 1)}><Plus className="h-4 w-4" /></Button>
            </div>
          </CardContent></Card>

          <Card><CardContent className="p-5 space-y-3">
            <p className="font-semibold text-sm">Hosting & data-soevereiniteit</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {HOSTING_TIERS.map((h) => (
                <button key={h.sku} onClick={() => setHostingSku(h.sku)}
                  className={`rounded-lg border p-3 text-left transition ${h.sku === hostingSku ? 'border-purple-600 ring-2 ring-purple-200 bg-purple-50/60' : 'hover:border-purple-300'}`}>
                  <p className="text-sm font-medium">{h.name}</p>
                  <p className="text-xs text-muted-foreground">{h.price ? `${eur(h.price)}/maand` : 'Gratis'}{h.setup ? ` · +${eur(h.setup)} setup` : ''}</p>
                </button>
              ))}
            </div>
          </CardContent></Card>

          <Card><CardContent className="p-5 space-y-2">
            <p className="font-semibold text-sm">Add-ons (per maand)</p>
            {ADDONS.map((a) => (
              <label key={a.sku} className="flex items-center justify-between gap-3 py-2 border-b last:border-0 cursor-pointer">
                <div className="flex items-center gap-3 min-w-0">
                  <input type="checkbox" checked={addonSkus.has(a.sku)} onChange={() => toggleAddon(a.sku)} className="h-4 w-4 accent-purple-600" />
                  <div className="min-w-0"><p className="text-sm font-medium truncate">{a.name}</p><p className="text-xs text-muted-foreground">{a.sku}</p></div>
                </div>
                <span className="text-sm font-medium shrink-0">{eur(a.price)}/mnd</span>
              </label>
            ))}
          </CardContent></Card>

          {ALACARTE.map((sec) => (
            <Card key={sec.key}><CardContent className="p-5">
              <p className="font-semibold text-sm mb-1">{sec.title}</p>
              {sec.items.map((it) => <Stepper key={it.sku} item={it} />)}
            </CardContent></Card>
          ))}
        </div>

        {/* total panel */}
        <div className="lg:col-span-1">
          <Card className="sticky top-4"><CardContent className="p-5 space-y-4">
            <p className="font-semibold">Indicatief totaal</p>
            <div className="space-y-2 text-sm">
              <Row label="Maandfee (recurring)" value={eur(monthly)} />
              <Row label="Eenmalige setup" value={eur(setup)} />
              <div className="border-t pt-2"><Row label="Jaar 1 totaal" value={eur(yearOne)} strong /></div>
              <Row label="Per gebruiker / jaar" value={eur(perUserYear)} muted />
            </div>
            <Badge variant="outline" className="text-[11px]">{lineItems.length} regel(s) · {users} gebruiker(s)</Badge>
            <div className="space-y-2 pt-2">
              <Button className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white" onClick={() => setSendOpen(true)}>
                <Send className="h-4 w-4 mr-2" />Mail offerte naar klant
              </Button>
              <Button variant="outline" className="w-full" onClick={() => toast.info('Koppeling met Inclufy Finance / Offertes volgt (Deel B).')}>
                <FileText className="h-4 w-4 mr-2" />Naar Inclufy Finance
              </Button>
            </div>
          </CardContent></Card>
        </div>
      </div>

      <Dialog open={sendOpen} onOpenChange={setSendOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Offerte mailen naar klant</DialogTitle>
            <DialogDescription>De configuratie wordt als nette offerte-mail verstuurd ({eur(monthly)}/mnd · {eur(setup)} setup).</DialogDescription>
          </DialogHeader>
          <div className="space-y-3 py-2">
            <div className="space-y-1"><Label>Naam contactpersoon</Label><Input value={custName} onChange={(e) => setCustName(e.target.value)} placeholder="Jan Jansen" /></div>
            <div className="space-y-1"><Label>E-mail *</Label><Input type="email" value={custEmail} onChange={(e) => setCustEmail(e.target.value)} placeholder="jan@bedrijf.nl" /></div>
            <div className="space-y-1"><Label>Bedrijf</Label><Input value={custCompany} onChange={(e) => setCustCompany(e.target.value)} placeholder="Bedrijf BV" /></div>
            <div className="space-y-1"><Label>Notitie (optioneel)</Label><Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Persoonlijk bericht…" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendOpen(false)}>Annuleren</Button>
            <Button onClick={sendToCustomer} disabled={sending} className="bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white">
              {sending ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}Verstuur offerte
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const Row = ({ label, value, strong, muted }: { label: string; value: string; strong?: boolean; muted?: boolean }) => (
  <div className="flex justify-between">
    <span className={muted ? 'text-muted-foreground' : ''}>{label}</span>
    <span className={`tabular-nums ${strong ? 'font-bold text-purple-700 text-base' : muted ? 'text-muted-foreground' : 'font-medium'}`}>{value}</span>
  </div>
);

export default PricingConfigurator;
