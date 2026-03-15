import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Plus, CreditCard, Pencil, Trash2, Star, Check, Zap, Crown, Building2, Rocket } from "lucide-react";
import { toast } from "sonner";

const DEFAULT_PLANS = [
  {
    id: "default-1",
    name: "Starter",
    price: 29,
    plan_type: "monthly",
    plan_level: "starter",
    max_projects: 5,
    max_users: 2,
    features: "Project Dashboard, Basic Reports, Email Support, 10GB Storage",
    is_active: true,
    is_default: true,
    icon: Rocket,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "default-2",
    name: "Professional",
    price: 49,
    plan_type: "monthly",
    plan_level: "business",
    max_projects: 25,
    max_users: 10,
    features: "Everything in Starter, Advanced Analytics, AI Assistant, Priority Support, 50GB Storage, Team Collaboration",
    is_active: true,
    is_popular: true,
    is_default: true,
    icon: Star,
    color: "from-purple-500 to-pink-500",
  },
  {
    id: "default-3",
    name: "Premium",
    price: 99,
    plan_type: "monthly",
    plan_level: "premium",
    max_projects: 100,
    max_users: 50,
    features: "Everything in Professional, Custom Integrations, Advanced Security, Dedicated Support, 200GB Storage, API Access",
    is_active: true,
    is_default: true,
    icon: Crown,
    color: "from-amber-500 to-orange-500",
  },
  {
    id: "default-4",
    name: "Enterprise",
    price: 199,
    plan_type: "monthly",
    plan_level: "enterprise",
    max_projects: 0,
    max_users: 0,
    features: "Everything in Premium, Unlimited Projects, Unlimited Users, SSO/SAML, Custom SLA, Dedicated Account Manager, Unlimited Storage",
    is_active: true,
    is_default: true,
    icon: Building2,
    color: "from-emerald-500 to-teal-500",
  },
  {
    id: "default-5",
    name: "Starter Yearly",
    price: 290,
    plan_type: "yearly",
    plan_level: "starter",
    max_projects: 5,
    max_users: 2,
    features: "Project Dashboard, Basic Reports, Email Support, 10GB Storage, 2 months free",
    is_active: true,
    is_default: true,
    icon: Rocket,
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "default-6",
    name: "Professional Yearly",
    price: 490,
    plan_type: "yearly",
    plan_level: "business",
    max_projects: 25,
    max_users: 10,
    features: "Everything in Starter, Advanced Analytics, AI Assistant, Priority Support, 50GB Storage, Team Collaboration, 2 months free",
    is_active: true,
    is_popular: true,
    is_default: true,
    icon: Star,
    color: "from-purple-500 to-pink-500",
  },
];

const SubscriptionManagement = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [seedingDefaults, setSeedingDefaults] = useState(false);
  const [billingFilter, setBillingFilter] = useState<"all" | "monthly" | "yearly">("all");
  const [form, setForm] = useState({
    name: "",
    price: "",
    plan_type: "monthly",
    plan_level: "basic",
    max_projects: "",
    max_users: "",
    features: "",
    is_active: true,
  });
  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/v1/admin/plans/", { headers });
      if (r.ok) {
        const d = await r.json();
        const apiPlans = Array.isArray(d) ? d : d.results || [];
        setPlans(apiPlans);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPlans(); }, []);

  const seedDefaultPlans = async () => {
    setSeedingDefaults(true);
    let created = 0;
    for (const plan of DEFAULT_PLANS) {
      try {
        const body: any = {
          name: plan.name,
          plan_type: plan.plan_type,
          plan_level: plan.plan_level,
          price: plan.price,
          max_projects: plan.max_projects || null,
          max_users: plan.max_users || null,
          features: plan.features,
          is_active: plan.is_active,
        };
        const r = await fetch("/api/v1/admin/plans/", {
          method: "POST",
          headers: jsonHeaders,
          body: JSON.stringify(body),
        });
        if (r.ok) created++;
      } catch (err) {
        console.error("Failed to seed plan:", plan.name, err);
      }
    }
    if (created > 0) {
      toast.success(`${created} standaard abonnementen aangemaakt`);
      await fetchPlans();
    } else {
      toast.error("Kon standaard plannen niet aanmaken via API");
    }
    setSeedingDefaults(false);
  };

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", price: "", plan_type: "monthly", plan_level: "basic", max_projects: "", max_users: "", features: "", is_active: true });
    setDialogOpen(true);
  };

  const openEdit = (p: any) => {
    if (p.is_default) {
      toast.info("Dit is een voorbeeld plan. Maak eerst standaard plannen aan via 'Standaard Plannen Aanmaken'.");
      return;
    }
    setEditing(p);
    setForm({
      name: p.name || "",
      price: String(p.price || p.monthly_price || ""),
      plan_type: p.plan_type || "monthly",
      plan_level: p.plan_level || "basic",
      max_projects: String(p.max_projects || ""),
      max_users: String(p.max_users || ""),
      features: p.features || "",
      is_active: p.is_active !== false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name) { toast.error("Naam verplicht"); return; }
    setSubmitting(true);
    try {
      const body: any = {
        name: form.name,
        plan_type: form.plan_type,
        plan_level: form.plan_level,
        is_active: form.is_active,
      };
      if (form.price) body.price = parseFloat(form.price);
      if (form.max_projects) body.max_projects = parseInt(form.max_projects);
      if (form.max_users) body.max_users = parseInt(form.max_users);
      if (form.features) body.features = form.features;
      const url = editing ? `/api/v1/admin/plans/${editing.id}/` : `/api/v1/admin/plans/`;
      const method = editing ? "PATCH" : "POST";
      const r = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (r.ok) { toast.success("Opgeslagen"); setDialogOpen(false); fetchPlans(); } else toast.error("Opslaan mislukt");
    } catch { toast.error("Opslaan mislukt"); } finally { setSubmitting(false); }
  };

  const handleDelete = async (pId: number | string) => {
    if (String(pId).startsWith("default-")) {
      toast.info("Dit is een voorbeeld plan en kan niet verwijderd worden.");
      return;
    }
    if (!confirm("Verwijderen?")) return;
    try {
      const r = await fetch(`/api/v1/admin/plans/${pId}/`, { method: "DELETE", headers });
      if (r.ok || r.status === 204) { toast.success("Verwijderd"); fetchPlans(); }
    } catch { toast.error("Verwijderen mislukt"); }
  };

  const planTypeLabel = (type: string) => {
    const labels: Record<string, string> = { monthly: "Maandelijks", yearly: "Jaarlijks" };
    return labels[type] || type;
  };

  const planLevelLabel = (level: string) => {
    const labels: Record<string, string> = { basic: "Basic", starter: "Starter", business: "Business", premium: "Premium", enterprise: "Enterprise" };
    return labels[level] || level;
  };

  const getPlanIcon = (p: any) => {
    if (p.icon) {
      const Icon = p.icon;
      return <Icon className="h-5 w-5" />;
    }
    const icons: Record<string, any> = { starter: Rocket, business: Star, premium: Crown, enterprise: Building2 };
    const Icon = icons[p.plan_level] || Zap;
    return <Icon className="h-5 w-5" />;
  };

  const getPlanGradient = (p: any) => {
    if (p.color) return p.color;
    const gradients: Record<string, string> = {
      starter: "from-blue-500 to-cyan-500",
      basic: "from-gray-500 to-slate-500",
      business: "from-purple-500 to-pink-500",
      premium: "from-amber-500 to-orange-500",
      enterprise: "from-emerald-500 to-teal-500",
    };
    return gradients[p.plan_level] || "from-purple-500 to-pink-500";
  };

  // Show default plans when no API plans exist
  const displayPlans = plans.length > 0 ? plans : DEFAULT_PLANS;
  const isShowingDefaults = plans.length === 0;

  const filteredPlans = billingFilter === "all"
    ? displayPlans
    : displayPlans.filter(p => p.plan_type === billingFilter);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin text-purple-500" /></div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CreditCard className="h-6 w-6 text-purple-500" />
          <h1 className="text-2xl font-bold">Subscription Plans</h1>
          <Badge variant="outline">{plans.length > 0 ? plans.length : DEFAULT_PLANS.length}</Badge>
        </div>
        <div className="flex items-center gap-2">
          {isShowingDefaults && (
            <Button
              onClick={seedDefaultPlans}
              disabled={seedingDefaults}
              variant="outline"
              className="gap-2 border-purple-300 text-purple-700 hover:bg-purple-50"
            >
              {seedingDefaults ? <Loader2 className="h-4 w-4 animate-spin" /> : <Zap className="h-4 w-4" />}
              Standaard Plannen Aanmaken
            </Button>
          )}
          <Button onClick={openCreate} className="gap-2 bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4" /> Nieuw Plan
          </Button>
        </div>
      </div>

      {isShowingDefaults && (
        <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-sm text-amber-800">
          <Zap className="h-4 w-4 shrink-0" />
          <span>
            Dit zijn voorbeeld plannen. Klik op <strong>"Standaard Plannen Aanmaken"</strong> om ze op te slaan in de database, of maak je eigen plannen aan.
          </span>
        </div>
      )}

      {/* Billing Filter */}
      <div className="flex gap-2">
        {(["all", "monthly", "yearly"] as const).map(filter => (
          <Button
            key={filter}
            variant={billingFilter === filter ? "default" : "outline"}
            size="sm"
            onClick={() => setBillingFilter(filter)}
            className={billingFilter === filter ? "bg-purple-600 hover:bg-purple-700" : ""}
          >
            {filter === "all" ? "Alle" : filter === "monthly" ? "Maandelijks" : "Jaarlijks"}
          </Button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredPlans.map(p => (
          <Card key={p.id} className={`relative overflow-hidden transition-shadow hover:shadow-lg ${!p.is_active ? "opacity-60" : ""} ${(p as any).is_popular ? "ring-2 ring-purple-500" : ""}`}>
            {(p as any).is_popular && (
              <div className="absolute top-0 right-0 bg-purple-600 text-white text-xs px-3 py-1 rounded-bl-lg font-medium">
                Populair
              </div>
            )}
            <div className={`h-2 bg-gradient-to-r ${getPlanGradient(p)}`} />
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={`p-2 rounded-lg bg-gradient-to-r ${getPlanGradient(p)} text-white`}>
                    {getPlanIcon(p)}
                  </div>
                  <h3 className="text-lg font-bold">{p.name}</h3>
                </div>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm" onClick={() => openEdit(p)}><Pencil className="h-3.5 w-3.5" /></Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDelete(p.id)}><Trash2 className="h-3.5 w-3.5 text-destructive" /></Button>
                </div>
              </div>
              <p className="text-3xl font-bold mb-1">
                €{p.price || p.monthly_price || 0}
                <span className="text-sm font-normal text-muted-foreground">/{p.plan_type === 'yearly' ? 'jaar' : 'mo'}</span>
              </p>
              {p.plan_type === 'yearly' && (
                <p className="text-xs text-green-600 font-medium mb-2">
                  €{(p.price / 12).toFixed(0)}/mo - Bespaar 2 maanden!
                </p>
              )}
              <div className="space-y-1 text-sm mb-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="text-xs">{planLevelLabel(p.plan_level)}</Badge>
                  <Badge variant="outline" className="text-xs">{planTypeLabel(p.plan_type)}</Badge>
                </div>
                {p.max_projects ? <p className="text-muted-foreground">Max projecten: <strong>{p.max_projects}</strong></p> : <p className="text-muted-foreground">Onbeperkt projecten</p>}
                {p.max_users ? <p className="text-muted-foreground">Max gebruikers: <strong>{p.max_users}</strong></p> : <p className="text-muted-foreground">Onbeperkt gebruikers</p>}
              </div>
              {p.features && (
                <div className="border-t pt-3 space-y-1.5">
                  {(typeof p.features === 'string' ? p.features.split(',') : Array.isArray(p.features) ? p.features : []).map((f: string, i: number) => (
                    <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Check className="h-3.5 w-3.5 text-green-500 shrink-0" />
                      <span>{typeof f === 'string' ? f.trim() : f}</span>
                    </div>
                  ))}
                </div>
              )}
              <div className="mt-3 pt-2 border-t flex items-center justify-between">
                <Badge variant={p.is_active ? "default" : "secondary"} className="text-xs">{p.is_active ? "Actief" : "Inactief"}</Badge>
                {(p as any).subscriber_count !== undefined && (
                  <span className="text-xs text-muted-foreground">{(p as any).subscriber_count} abonnees</span>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editing ? "Plan Bewerken" : "Nieuw Plan"}</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Naam *</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Prijs (€)</Label>
                <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Facturatie Type *</Label>
                <Select value={form.plan_type} onValueChange={(v) => setForm({ ...form, plan_type: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Maandelijks</SelectItem>
                    <SelectItem value="yearly">Jaarlijks</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Plan Niveau *</Label>
                <Select value={form.plan_level} onValueChange={(v) => setForm({ ...form, plan_level: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">Basic</SelectItem>
                    <SelectItem value="starter">Starter</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="premium">Premium</SelectItem>
                    <SelectItem value="enterprise">Enterprise</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Max Projecten</Label>
                <Input type="number" value={form.max_projects} onChange={(e) => setForm({ ...form, max_projects: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>Max Gebruikers</Label>
                <Input type="number" value={form.max_users} onChange={(e) => setForm({ ...form, max_users: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Features (komma-gescheiden)</Label>
              <textarea className="w-full min-h-[60px] px-3 py-2 border rounded-md bg-background" value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} placeholder="Feature 1, Feature 2, Feature 3" />
            </div>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={form.is_active} onChange={(e) => setForm({ ...form, is_active: e.target.checked })} /> Actief
            </label>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuleren</Button>
              <Button onClick={handleSave} disabled={submitting} className="bg-purple-600 hover:bg-purple-700">
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Opslaan
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionManagement;
