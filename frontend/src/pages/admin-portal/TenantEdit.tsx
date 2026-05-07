import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Building2, Palette, Shield, ArrowLeft, Trash2,
  CreditCard, Users as UsersIcon, Layers, Mail, KeyRound, CheckCircle2, AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

const TIMEZONES = [
  "Europe/Amsterdam", "Europe/Brussels", "Europe/London", "Europe/Berlin",
  "Europe/Paris", "Europe/Madrid", "America/New_York", "America/Los_Angeles",
  "America/Chicago", "Asia/Singapore", "Asia/Dubai", "Australia/Sydney", "UTC",
];
const LOCALES = [{ v: "en", l: "English" }, { v: "nl", l: "Nederlands" }];
const CURRENCIES = ["EUR", "USD", "GBP", "CHF", "AUD", "CAD"];
const INDUSTRIES = [
  "IT / Software", "Consultancy", "Construction", "Finance & Banking",
  "Healthcare", "Education", "Government", "Manufacturing", "Retail",
  "Energy & Utilities", "Telecom", "Logistics", "Other",
];
const ORG_SIZES = [
  "1-10 employees", "11-50 employees", "51-200 employees",
  "201-1,000 employees", "1,000+ employees",
];
const PROGRAM_METHODS = [
  { id: "safe", name: "SAFe" }, { id: "msp", name: "MSP" }, { id: "pmi", name: "PMI / PgMP" },
  { id: "prince2_programme", name: "PRINCE2 Programme" }, { id: "hybrid_programme", name: "Hybrid" },
];
const PROJECT_METHODS = [
  { id: "prince2", name: "PRINCE2" }, { id: "agile", name: "Agile" }, { id: "scrum", name: "Scrum" },
  { id: "kanban", name: "Kanban" }, { id: "waterfall", name: "Waterfall" },
  { id: "lean_six_sigma", name: "Lean Six Sigma" }, { id: "hybrid", name: "Hybrid" },
];

const Section = ({ icon: Icon, title, children }: any) => (
  <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Icon className="h-5 w-5 text-purple-500" />{title}</CardTitle></CardHeader><CardContent className="space-y-4">{children}</CardContent></Card>
);

const TenantEdit = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const token = localStorage.getItem("access_token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const [activeTab, setActiveTab] = useState("basics");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [orgSize, setOrgSize] = useState("");
  const [tz, setTz] = useState("Europe/Amsterdam");
  const [locale, setLocale] = useState("en");
  const [currency, setCurrency] = useState("EUR");

  const [primaryColor, setPrimaryColor] = useState("#7C3AED");
  const [customDomain, setCustomDomain] = useState("");
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  const [require2fa, setRequire2fa] = useState(false);

  const [plans, setPlans] = useState<any[]>([]);
  const [planId, setPlanId] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [subStatus, setSubStatus] = useState("trialing");
  const [savingPlan, setSavingPlan] = useState(false);

  const [users, setUsers] = useState<any[]>([]);
  const [usersLoading, setUsersLoading] = useState(false);

  const [programMethods, setProgramMethods] = useState<string[]>([]);
  const [projectMethods, setProjectMethods] = useState<string[]>([]);
  const [savingMethods, setSavingMethods] = useState(false);

  const loadUsers = async () => {
    if (!id) return;
    setUsersLoading(true);
    try {
      const r = await fetch(`/api/v1/admin/tenants/${id}/users/`, { headers: { Authorization: `Bearer ${token}` } });
      if (r.ok) {
        const d = await r.json();
        setUsers(Array.isArray(d) ? d : d.results || []);
      }
    } finally {
      setUsersLoading(false);
    }
  };

  const resendInvite = async (uid: string | number, email: string) => {
    const r = await fetch(`/api/v1/admin/users/${uid}/resend_invite/`, { method: "POST", headers });
    if (r.ok) toast.success(`Verification email sent to ${email}`);
    else {
      const err = await r.json().catch(() => ({}));
      toast.error(err.detail || `Failed to send to ${email}`);
    }
  };

  const setUserPassword = async (uid: string | number, email: string) => {
    const pw = window.prompt(`Set a temporary password for ${email}\n\nMinimum 8 characters. The user will be activated and can log in immediately.`, "");
    if (pw === null) return;
    if (pw.length < 8) { toast.error("Password must be at least 8 characters"); return; }
    const r = await fetch(`/api/v1/admin/users/${uid}/set-password/`, {
      method: "POST", headers, body: JSON.stringify({ password: pw }),
    });
    if (r.ok) { toast.success(`Password set for ${email}`); loadUsers(); }
    else { const err = await r.json().catch(() => ({})); toast.error(err.detail || "Failed"); }
  };

  const savePlan = async () => {
    if (!planId) { toast.error("Pick a plan first"); return; }
    setSavingPlan(true);
    try {
      const r = await fetch(`/api/v1/admin/tenants/${id}/`, {
        method: "PATCH", headers,
        body: JSON.stringify({
          subscription_plan_id: planId,
          billing_cycle: billingCycle,
          subscription_status: subStatus,
        }),
      });
      if (r.ok) toast.success("Subscription updated");
      else { const err = await r.json().catch(() => ({})); toast.error(err.detail || "Save failed"); }
    } finally { setSavingPlan(false); }
  };

  const toggleMethod = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const saveMethods = async () => {
    setSavingMethods(true);
    try {
      const currentData = (tenantData?.onboarding_data || {}) as any;
      const r = await fetch(`/api/v1/admin/tenants/${id}/`, {
        method: "PATCH", headers,
        body: JSON.stringify({
          onboarding_data: {
            ...currentData,
            program_methodologies: programMethods,
            project_methodologies: projectMethods,
          },
        }),
      });
      if (r.ok) toast.success("Methodologies updated");
      else { const err = await r.json().catch(() => ({})); toast.error(err.detail || "Save failed"); }
    } finally { setSavingMethods(false); }
  };

  const [tenantData, setTenantData] = useState<any>(null);

  useEffect(() => {
    fetch(`/api/v1/admin/plans/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setPlans(Array.isArray(d) ? d : d.results || []))
      .catch(() => setPlans([]));
  }, []);

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/admin/tenants/${id}/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d) { toast.error("Failed to load tenant"); return; }
        setTenantData(d);
        setName(d.name || "");
        setDescription(d.description || "");
        setIndustry(d.industry || "");
        setOrgSize(d.organization_size || "");
        setTz(d.timezone || "Europe/Amsterdam");
        setLocale(d.locale || "en");
        setCurrency(d.currency || "EUR");
        setPrimaryColor(d.primary_color || "#7C3AED");
        setCustomDomain(d.custom_domain || "");
        setLogoUrl(d.logo || "");
        setRequire2fa(!!d.require_2fa);
        const sub = d.subscription;
        if (sub) {
          setPlanId(String(sub.id || sub.plan_id || ""));
          setBillingCycle(sub.billing_cycle || "monthly");
          setSubStatus(sub.status || "trialing");
        }
        const od = d.onboarding_data || {};
        setProgramMethods(od.program_methodologies || []);
        setProjectMethods(od.project_methodologies || []);
      })
      .catch(() => toast.error("Failed to load tenant"))
      .finally(() => setLoading(false));
    loadUsers();
  }, [id]);

  const onLogoSelected = (f: File | null) => {
    setLogoFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview((e.target?.result as string) || "");
      reader.readAsDataURL(f);
    } else setLogoPreview("");
  };

  const save = async () => {
    if (!name.trim()) { toast.error("Name is required"); setActiveTab("basics"); return; }
    setSaving(true);
    try {
      const body = {
        name: name.trim(),
        description: description.trim(),
        industry: industry || null,
        organization_size: orgSize || null,
        timezone: tz,
        locale,
        currency,
        primary_color: primaryColor || null,
        custom_domain: customDomain.trim() || null,
        require_2fa: require2fa,
      };
      const r = await fetch(`/api/v1/admin/tenants/${id}/`, {
        method: "PATCH", headers, body: JSON.stringify(body),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        toast.error(err.detail || "Save failed");
        return;
      }
      if (logoFile) {
        const fd = new FormData();
        fd.append("file", logoFile);
        const lr = await fetch(`/api/v1/admin/tenants/${id}/upload-logo/`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!lr.ok) toast.warning("Saved, but logo upload failed");
      }
      toast.success("Tenant updated");
      navigate("/admin/tenants");
    } catch {
      toast.error("Save failed");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={() => navigate("/admin/tenants")}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
          <h1 className="text-2xl font-bold">Edit tenant</h1>
        </div>
        <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Save changes</Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-6 w-full">
          <TabsTrigger value="basics"><Building2 className="h-4 w-4 mr-1" />Basics</TabsTrigger>
          <TabsTrigger value="branding"><Palette className="h-4 w-4 mr-1" />Branding</TabsTrigger>
          <TabsTrigger value="plan"><CreditCard className="h-4 w-4 mr-1" />Plan</TabsTrigger>
          <TabsTrigger value="users"><UsersIcon className="h-4 w-4 mr-1" />Users</TabsTrigger>
          <TabsTrigger value="methodology"><Layers className="h-4 w-4 mr-1" />Methodology</TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-4 w-4 mr-1" />Security</TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="mt-6">
          <Section icon={Building2} title="Tenant basics">
            <div className="space-y-2"><Label>Organization name *</Label><Input value={name} onChange={(e) => setName(e.target.value)} /></div>
            <div className="space-y-2"><Label>Description</Label><Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} /></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Industry</Label><Select value={industry} onValueChange={setIndustry}><SelectTrigger><SelectValue placeholder="Select industry" /></SelectTrigger><SelectContent>{INDUSTRIES.map((i) => <SelectItem key={i} value={i}>{i}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Organization size</Label><Select value={orgSize} onValueChange={setOrgSize}><SelectTrigger><SelectValue placeholder="Select size" /></SelectTrigger><SelectContent>{ORG_SIZES.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent></Select></div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2"><Label>Timezone</Label><Select value={tz} onValueChange={setTz}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{TIMEZONES.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Locale</Label><Select value={locale} onValueChange={setLocale}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{LOCALES.map((l) => <SelectItem key={l.v} value={l.v}>{l.l}</SelectItem>)}</SelectContent></Select></div>
              <div className="space-y-2"><Label>Currency</Label><Select value={currency} onValueChange={setCurrency}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent>{CURRENCIES.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}</SelectContent></Select></div>
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="branding" className="mt-6">
          <Section icon={Palette} title="Branding">
            <div className="space-y-2">
              <Label>Logo</Label>
              <div className="flex items-center gap-4">
                {(logoPreview || logoUrl) ? (
                  <img src={logoPreview || logoUrl} alt="logo" className="w-20 h-20 rounded-lg object-contain border bg-white p-1" />
                ) : (
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground"><Building2 className="h-6 w-6" /></div>
                )}
                <div className="flex flex-col gap-2">
                  <Input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={(e) => onLogoSelected(e.target.files?.[0] || null)} className="max-w-xs" />
                  {logoFile && <Button variant="outline" size="sm" onClick={() => onLogoSelected(null)}><Trash2 className="h-3 w-3 mr-1" />Cancel new upload</Button>}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">PNG, JPG, SVG, or WebP. Replaces existing logo on save.</p>
            </div>
            <div className="space-y-2"><Label>Primary color</Label><div className="flex items-center gap-3"><Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-20 h-10 cursor-pointer p-1" /><Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} placeholder="#7C3AED" className="max-w-xs" /></div></div>
            <div className="space-y-2"><Label>Custom domain</Label><Input value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="acme.projextpal.com" /></div>
          </Section>
        </TabsContent>

        <TabsContent value="plan" className="mt-6 space-y-4">
          <Section icon={CreditCard} title="Subscription plan">
            {tenantData?.subscription ? (
              <div className="rounded-lg border bg-muted/30 p-4 space-y-1 text-sm">
                <p><span className="text-muted-foreground">Current plan:</span> <strong>{tenantData.subscription.plan_name || "—"}</strong></p>
                <p><span className="text-muted-foreground">Status:</span> <Badge variant="outline">{tenantData.subscription.status}</Badge></p>
                <p><span className="text-muted-foreground">Billing cycle:</span> {tenantData.subscription.billing_cycle || "monthly"}</p>
              </div>
            ) : (
              <div className="rounded-lg border bg-amber-500/10 border-amber-500/30 p-4 text-sm flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-500 mt-0.5" />
                <span>No active subscription. Pick a plan below to assign one.</span>
              </div>
            )}
            <div className="space-y-2"><Label>Change plan</Label><Select value={planId} onValueChange={setPlanId}><SelectTrigger><SelectValue placeholder="Select a plan" /></SelectTrigger><SelectContent>{plans.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}{p.price_monthly ? ` — €${p.price_monthly}/mo` : ""}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Billing cycle</Label><Select value={billingCycle} onValueChange={setBillingCycle}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Status</Label><Select value={subStatus} onValueChange={setSubStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="trialing">Trialing</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="past_due">Past due</SelectItem><SelectItem value="canceled">Canceled</SelectItem></SelectContent></Select></div>
            </div>
            <div className="flex justify-end"><Button onClick={savePlan} disabled={savingPlan}>{savingPlan && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Update plan</Button></div>
          </Section>
        </TabsContent>

        <TabsContent value="users" className="mt-6 space-y-4">
          <Section icon={UsersIcon} title={`Users in this tenant (${users.length})`}>
            {usersLoading ? (
              <div className="flex justify-center py-8"><Loader2 className="h-6 w-6 animate-spin" /></div>
            ) : users.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No users yet.</p>
            ) : (
              <div className="space-y-2">
                {users.map((u) => (
                  <div key={u.id} className="flex items-center justify-between gap-4 p-3 rounded-lg border bg-muted/20">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="h-9 w-9 rounded-full bg-purple-500/20 text-purple-500 flex items-center justify-center font-semibold uppercase text-sm flex-shrink-0">{(u.email || "?")[0]}</div>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-sm truncate">{[u.first_name, u.last_name].filter(Boolean).join(" ") || u.email}</p>
                        <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                      </div>
                      <Badge variant="outline" className="text-xs">{u.role}</Badge>
                      {u.is_active ? <Badge className="text-xs"><CheckCircle2 className="h-3 w-3 mr-1" />Active</Badge> : <Badge variant="secondary" className="text-xs">Inactive</Badge>}
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button variant="outline" size="sm" onClick={() => resendInvite(u.id, u.email)} title="Resend verification email"><Mail className="h-3.5 w-3.5 mr-1" />Resend</Button>
                      <Button variant="outline" size="sm" onClick={() => setUserPassword(u.id, u.email)} title="Set a temporary password (activates the user)"><KeyRound className="h-3.5 w-3.5 mr-1" />Set password</Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <p className="text-xs text-muted-foreground">For full user CRUD (create, suspend, delete) use <a href="/admin/users" className="text-purple-500 hover:underline">User Management</a>.</p>
          </Section>
        </TabsContent>

        <TabsContent value="methodology" className="mt-6 space-y-4">
          <Section icon={Layers} title="Program methodologies">
            <div className="flex flex-wrap gap-2">{PROGRAM_METHODS.map((m) => (
              <button key={m.id} type="button" onClick={() => toggleMethod(programMethods, m.id, setProgramMethods)} className={`px-4 py-2 rounded-lg border text-sm transition ${programMethods.includes(m.id) ? "bg-purple-600 text-white border-purple-600" : "bg-background hover:bg-muted"}`}>{m.name}</button>
            ))}</div>
          </Section>
          <Section icon={Layers} title="Project methodologies">
            <div className="flex flex-wrap gap-2">{PROJECT_METHODS.map((m) => (
              <button key={m.id} type="button" onClick={() => toggleMethod(projectMethods, m.id, setProjectMethods)} className={`px-4 py-2 rounded-lg border text-sm transition ${projectMethods.includes(m.id) ? "bg-purple-600 text-white border-purple-600" : "bg-background hover:bg-muted"}`}>{m.name}</button>
            ))}</div>
            <div className="flex justify-end"><Button onClick={saveMethods} disabled={savingMethods}>{savingMethods && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Update methodologies</Button></div>
          </Section>
        </TabsContent>

        <TabsContent value="security" className="mt-6">
          <Section icon={Shield} title="Security policy">
            <div className="flex items-center justify-between"><div><Label>Enforce 2FA tenant-wide</Label><p className="text-xs text-muted-foreground">All users must enrol 2FA at next login.</p></div><Switch checked={require2fa} onCheckedChange={setRequire2fa} /></div>
          </Section>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={() => navigate("/admin/tenants")}>Cancel</Button>
        <Button onClick={save} disabled={saving}>{saving && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Save changes</Button>
      </div>
    </div>
  );
};

export default TenantEdit;
