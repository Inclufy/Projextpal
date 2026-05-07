import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  Loader2, Building2, Palette, CreditCard, Users, Layers, Shield, CheckCircle2,
  ArrowLeft, Trash2, Plus,
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
  { id: "safe", name: "SAFe" },
  { id: "msp", name: "MSP" },
  { id: "pmi", name: "PMI / PgMP" },
  { id: "prince2_programme", name: "PRINCE2 Programme" },
  { id: "hybrid_programme", name: "Hybrid" },
];
const PROJECT_METHODS = [
  { id: "prince2", name: "PRINCE2" },
  { id: "agile", name: "Agile" },
  { id: "scrum", name: "Scrum" },
  { id: "kanban", name: "Kanban" },
  { id: "waterfall", name: "Waterfall" },
  { id: "lean_six_sigma", name: "Lean Six Sigma" },
  { id: "hybrid", name: "Hybrid" },
];

type Invite = { email: string; role: string };

// Defined outside the component so React treats it as a stable type across
// re-renders. Defining it inside would unmount/remount on every keystroke
// and steal focus from any nested input.
const Section = ({ icon: Icon, title, children }: any) => (
  <Card><CardHeader><CardTitle className="flex items-center gap-2 text-base"><Icon className="h-5 w-5 text-purple-500" />{title}</CardTitle></CardHeader><CardContent className="space-y-4">{children}</CardContent></Card>
);

const TenantProvisioning = () => {
  const navigate = useNavigate();
  const token = localStorage.getItem("access_token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  const [activeTab, setActiveTab] = useState("basics");
  const [submitting, setSubmitting] = useState(false);
  const [plans, setPlans] = useState<any[]>([]);
  const [plansLoading, setPlansLoading] = useState(true);

  // Basics
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [industry, setIndustry] = useState("");
  const [orgSize, setOrgSize] = useState("");
  const [tz, setTz] = useState("Europe/Amsterdam");
  const [locale, setLocale] = useState("en");
  const [currency, setCurrency] = useState("EUR");

  // Branding
  const [primaryColor, setPrimaryColor] = useState("#7C3AED");
  const [customDomain, setCustomDomain] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [logoPreview, setLogoPreview] = useState<string>("");

  // Plan & billing
  const [planId, setPlanId] = useState("");
  const [billingCycle, setBillingCycle] = useState("monthly");
  const [subStatus, setSubStatus] = useState("trialing");

  // Users
  const [ownerEmail, setOwnerEmail] = useState("");
  const [ownerFirstName, setOwnerFirstName] = useState("");
  const [ownerLastName, setOwnerLastName] = useState("");
  const [invites, setInvites] = useState<Invite[]>([]);

  // Methodology
  const [programMethods, setProgramMethods] = useState<string[]>([]);
  const [projectMethods, setProjectMethods] = useState<string[]>([]);

  // Security
  const [require2fa, setRequire2fa] = useState(false);

  // Seed
  const [seedDemoData, setSeedDemoData] = useState(false);

  // Notifications
  const [sendInvites, setSendInvites] = useState(true);

  useEffect(() => {
    fetch("/api/v1/admin/plans/", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : [])
      .then((d) => setPlans(Array.isArray(d) ? d : d.results || []))
      .catch(() => setPlans([]))
      .finally(() => setPlansLoading(false));
  }, []);

  const toggle = (arr: string[], v: string, set: (a: string[]) => void) =>
    set(arr.includes(v) ? arr.filter((x) => x !== v) : [...arr, v]);

  const onLogoSelected = (f: File | null) => {
    setLogoFile(f);
    if (f) {
      const reader = new FileReader();
      reader.onload = (e) => setLogoPreview((e.target?.result as string) || "");
      reader.readAsDataURL(f);
    } else setLogoPreview("");
  };

  const addInvite = () => setInvites([...invites, { email: "", role: "pm" }]);
  const updateInvite = (i: number, patch: Partial<Invite>) =>
    setInvites(invites.map((inv, idx) => idx === i ? { ...inv, ...patch } : inv));
  const removeInvite = (i: number) => setInvites(invites.filter((_, idx) => idx !== i));

  // Accepts CSV text or freshly pasted list of emails. One row per line,
  // optionally "email,role". The previous splitter cut on commas first which
  // turned "alice@a.com,admin" into two tokens and silently dropped the role
  // — every row ended up as default "pm". Now we split rows on newlines/
  // semicolons only, then split each row on the first comma.
  const importInvitesFromText = (text: string) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const parsed: Invite[] = [];
    for (const raw of text.split(/[\n;]+/)) {
      const line = raw.trim();
      if (!line) continue;
      const commaIdx = line.indexOf(",");
      const emailPart = commaIdx >= 0 ? line.slice(0, commaIdx) : line;
      const rolePart = commaIdx >= 0 ? line.slice(commaIdx + 1) : "";
      const email = emailPart.trim().toLowerCase();
      if (!re.test(email)) continue;
      const role = rolePart.trim().toLowerCase();
      const validRoles = ["admin", "pm", "program_manager", "contibuter", "contributor", "reviewer", "guest"];
      // Accept both spellings — backend ROLE_CHOICES still uses 'contibuter'
      // (typo in the model). Map the corrected spelling so admins typing
      // 'contributor' in bulk import don't lose data.
      const finalRole = role === "contributor" ? "contibuter" : role;
      parsed.push({ email, role: validRoles.includes(role) ? finalRole : "pm" });
    }
    if (parsed.length === 0) {
      toast.error("No valid emails found");
      return;
    }
    // Dedupe against existing invites + owner email.
    const existing = new Set([ownerEmail.toLowerCase(), ...invites.map((i) => i.email.toLowerCase())]);
    const fresh = parsed.filter((p) => !existing.has(p.email));
    setInvites([...invites, ...fresh]);
    toast.success(`${fresh.length} invite${fresh.length === 1 ? "" : "s"} added`);
  };

  const handleCsvUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => importInvitesFromText(String(reader.result || ""));
    reader.readAsText(file);
  };

  const [bulkText, setBulkText] = useState("");

  const validate = () => {
    if (!name.trim()) { toast.error("Organization name is required"); setActiveTab("basics"); return false; }
    if (!ownerEmail.trim()) { toast.error("Owner email is required"); setActiveTab("users"); return false; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) { toast.error("Owner email is invalid"); setActiveTab("users"); return false; }
    return true;
  };

  const provision = async () => {
    if (!validate()) return;
    setSubmitting(true);
    try {
      const validInvites = invites.filter((i) => i.email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(i.email));
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
        owner_email: ownerEmail.trim().toLowerCase(),
        owner_first_name: ownerFirstName.trim(),
        owner_last_name: ownerLastName.trim(),
        plan_id: planId || null,
        billing_cycle: billingCycle,
        subscription_status: subStatus,
        require_2fa: require2fa,
        seed_demo_data: seedDemoData,
        send_invites: sendInvites,
        additional_invites: validInvites,
        onboarding_data: {
          program_methodologies: programMethods,
          project_methodologies: projectMethods,
          provisioned_via: "admin_portal",
        },
      };
      const r = await fetch("/api/v1/admin/tenants/provision/", {
        method: "POST", headers, body: JSON.stringify(body),
      });
      if (!r.ok) {
        const err = await r.json().catch(() => ({}));
        toast.error(err.detail || "Provisioning failed");
        return;
      }
      const created = await r.json();
      if (logoFile && created?.id) {
        const fd = new FormData();
        fd.append("file", logoFile);
        const lr = await fetch(`/api/v1/admin/tenants/${created.id}/upload-logo/`, {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
          body: fd,
        });
        if (!lr.ok) toast.warning("Tenant created, but logo upload failed");
      }
      toast.success("Tenant provisioned");
      navigate("/admin/tenants");
    } catch {
      toast.error("Provisioning failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate("/admin/tenants")}><ArrowLeft className="h-4 w-4 mr-1" />Back</Button>
        <h1 className="text-2xl font-bold">Provision new tenant</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid grid-cols-7 w-full">
          <TabsTrigger value="basics"><Building2 className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Basics</span></TabsTrigger>
          <TabsTrigger value="branding"><Palette className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Branding</span></TabsTrigger>
          <TabsTrigger value="plan"><CreditCard className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Plan</span></TabsTrigger>
          <TabsTrigger value="users"><Users className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Users</span></TabsTrigger>
          <TabsTrigger value="methodology"><Layers className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Methodology</span></TabsTrigger>
          <TabsTrigger value="security"><Shield className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Security</span></TabsTrigger>
          <TabsTrigger value="review"><CheckCircle2 className="h-4 w-4 sm:mr-1" /><span className="hidden sm:inline">Review</span></TabsTrigger>
        </TabsList>

        <TabsContent value="basics" className="mt-6">
          <Section icon={Building2} title="Tenant basics">
            <div className="space-y-2"><Label htmlFor="org-name">Organization name *</Label><Input id="org-name" value={name} onChange={(e) => setName(e.target.value)} placeholder="Acme Corp" /></div>
            <div className="space-y-2"><Label htmlFor="org-description">Description</Label><Textarea id="org-description" value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Short description of the organization" rows={3} /></div>
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
                {logoPreview ? (
                  <img src={logoPreview} alt="logo preview" className="w-20 h-20 rounded-lg object-contain border bg-white p-1" />
                ) : (
                  <div className="w-20 h-20 rounded-lg border-2 border-dashed flex items-center justify-center text-muted-foreground"><Building2 className="h-6 w-6" /></div>
                )}
                <div className="flex flex-col gap-2">
                  <Input type="file" accept="image/png,image/jpeg,image/svg+xml,image/webp" onChange={(e) => onLogoSelected(e.target.files?.[0] || null)} className="max-w-xs" />
                  {logoFile && <Button variant="outline" size="sm" onClick={() => onLogoSelected(null)}><Trash2 className="h-3 w-3 mr-1" />Remove</Button>}
                </div>
              </div>
              <p className="text-xs text-muted-foreground">PNG, JPG, SVG, or WebP. Uploaded after tenant creation.</p>
            </div>
            <div className="space-y-2"><Label>Primary color</Label><div className="flex items-center gap-3"><Input type="color" value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} className="w-20 h-10 cursor-pointer p-1" /><Input value={primaryColor} onChange={(e) => setPrimaryColor(e.target.value)} placeholder="#7C3AED" className="max-w-xs" /></div></div>
            <div className="space-y-2"><Label>Custom domain</Label><Input value={customDomain} onChange={(e) => setCustomDomain(e.target.value)} placeholder="acme.projextpal.com" /><p className="text-xs text-muted-foreground">Optional. Tenant admin can configure DNS later.</p></div>
          </Section>
        </TabsContent>

        <TabsContent value="plan" className="mt-6">
          <Section icon={CreditCard} title="Subscription plan">
            <div className="space-y-2"><Label>Plan</Label><Select value={planId} onValueChange={setPlanId} disabled={plansLoading}><SelectTrigger><SelectValue placeholder={plansLoading ? "Loading plans…" : "No plan (configure later)"} /></SelectTrigger><SelectContent>{plans.length === 0 && !plansLoading ? <p className="text-sm text-muted-foreground p-2">No plans configured yet. Add one in <a href="/admin/plans" className="text-purple-500 hover:underline">Plans &amp; Pricing</a>.</p> : plans.map((p) => <SelectItem key={p.id} value={String(p.id)}>{p.name}{p.price_monthly ? ` — €${p.price_monthly}/mo` : ""}</SelectItem>)}</SelectContent></Select></div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label>Billing cycle</Label><Select value={billingCycle} onValueChange={setBillingCycle}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="monthly">Monthly</SelectItem><SelectItem value="yearly">Yearly</SelectItem></SelectContent></Select></div>
              <div className="space-y-2"><Label>Status</Label><Select value={subStatus} onValueChange={setSubStatus}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="trialing">Trialing</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="past_due">Past due</SelectItem></SelectContent></Select></div>
            </div>
            <p className="text-xs text-muted-foreground">For paid contracts without Stripe, leave plan empty and configure invoicing manually in the Subscriptions page.</p>
          </Section>
        </TabsContent>

        <TabsContent value="users" className="mt-6 space-y-4">
          <Section icon={Users} title="Owner / first admin">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2"><Label htmlFor="owner-email">Email *</Label><Input id="owner-email" type="email" value={ownerEmail} onChange={(e) => setOwnerEmail(e.target.value)} placeholder="admin@acme.com" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div className="space-y-2"><Label htmlFor="owner-first">First name</Label><Input id="owner-first" value={ownerFirstName} onChange={(e) => setOwnerFirstName(e.target.value)} /></div>
                <div className="space-y-2"><Label htmlFor="owner-last">Last name</Label><Input id="owner-last" value={ownerLastName} onChange={(e) => setOwnerLastName(e.target.value)} /></div>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">Owner is created inactive. They receive a verification email and set their own password.</p>
          </Section>
          <Section icon={Plus} title="Additional team members (optional)">
            <div className="rounded-lg border bg-muted/30 p-3 space-y-2">
              <Label className="text-xs">Bulk import — CSV or paste emails</Label>
              <Textarea value={bulkText} onChange={(e) => setBulkText(e.target.value)} placeholder={"alice@acme.com,pm\nbob@acme.com,admin\ncarol@acme.com"} rows={3} className="text-xs font-mono" />
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => { importInvitesFromText(bulkText); setBulkText(""); }} disabled={!bulkText.trim()}>Add from text</Button>
                <span className="text-xs text-muted-foreground">or</span>
                <Input type="file" accept=".csv,text/csv,text/plain" onChange={(e) => { const f = e.target.files?.[0]; if (f) handleCsvUpload(f); e.currentTarget.value = ""; }} className="max-w-xs h-8 text-xs" />
              </div>
              <p className="text-[11px] text-muted-foreground">Format: <code>email,role</code> per line. Roles: admin, pm, program_manager, contributor, reviewer, guest. Default role is pm.</p>
            </div>
            {invites.map((inv, i) => (
              <div key={i} className="grid grid-cols-[1fr_140px_40px] gap-2 items-end">
                <div className="space-y-1"><Label className="text-xs">Email</Label><Input type="email" value={inv.email} onChange={(e) => updateInvite(i, { email: e.target.value })} placeholder="user@acme.com" /></div>
                <div className="space-y-1"><Label className="text-xs">Role</Label><Select value={inv.role} onValueChange={(v) => updateInvite(i, { role: v })}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem value="admin">Admin</SelectItem><SelectItem value="pm">Project Manager</SelectItem><SelectItem value="program_manager">Program Manager</SelectItem><SelectItem value="contributor">Contributor</SelectItem><SelectItem value="reviewer">Reviewer</SelectItem><SelectItem value="guest">Guest</SelectItem></SelectContent></Select></div>
                <Button variant="ghost" size="icon" onClick={() => removeInvite(i)}><Trash2 className="h-4 w-4 text-red-500" /></Button>
              </div>
            ))}
            <Button variant="outline" size="sm" onClick={addInvite}><Plus className="h-4 w-4 mr-1" />Add team member</Button>
          </Section>
        </TabsContent>

        <TabsContent value="methodology" className="mt-6 space-y-4">
          <Section icon={Layers} title="Program methodologies">
            <div className="flex flex-wrap gap-2">{PROGRAM_METHODS.map((m) => (
              <button key={m.id} type="button" onClick={() => toggle(programMethods, m.id, setProgramMethods)} className={`px-4 py-2 rounded-lg border text-sm transition ${programMethods.includes(m.id) ? "bg-purple-600 text-white border-purple-600" : "bg-background hover:bg-muted"}`}>{m.name}</button>
            ))}</div>
          </Section>
          <Section icon={Layers} title="Project methodologies">
            <div className="flex flex-wrap gap-2">{PROJECT_METHODS.map((m) => (
              <button key={m.id} type="button" onClick={() => toggle(projectMethods, m.id, setProjectMethods)} className={`px-4 py-2 rounded-lg border text-sm transition ${projectMethods.includes(m.id) ? "bg-purple-600 text-white border-purple-600" : "bg-background hover:bg-muted"}`}>{m.name}</button>
            ))}</div>
            <p className="text-xs text-muted-foreground">Selected methodologies become available for new projects in this tenant.</p>
          </Section>
          <Section icon={CheckCircle2} title="Demo data">
            <div className="flex items-center justify-between">
              <div>
                <Label>Seed sample projects</Label>
                <p className="text-xs text-muted-foreground">Creates one starter project per selected project methodology so the tenant dashboard is not empty on day one.</p>
              </div>
              <Switch checked={seedDemoData} onCheckedChange={setSeedDemoData} />
            </div>
          </Section>
        </TabsContent>

        <TabsContent value="security" className="mt-6 space-y-4">
          <Section icon={Shield} title="Security policy">
            <div className="flex items-center justify-between"><div><Label>Enforce 2FA tenant-wide</Label><p className="text-xs text-muted-foreground">All users must enrol 2FA at next login.</p></div><Switch checked={require2fa} onCheckedChange={setRequire2fa} /></div>
          </Section>
          <Section icon={CheckCircle2} title="Notifications">
            <div className="flex items-center justify-between"><div><Label>Send verification emails on provision</Label><p className="text-xs text-muted-foreground">Owner and additional invitees receive an email with a link to verify their account and set a password. Disable for silent setup.</p></div><Switch checked={sendInvites} onCheckedChange={setSendInvites} /></div>
          </Section>
        </TabsContent>

        <TabsContent value="review" className="mt-6 space-y-4">
          <Section icon={CheckCircle2} title="Review & provision">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <dt className="text-muted-foreground">Name</dt><dd className="font-medium">{name || <span className="text-red-500">required</span>}</dd>
              <dt className="text-muted-foreground">Industry</dt><dd>{industry || "—"}</dd>
              <dt className="text-muted-foreground">Size</dt><dd>{orgSize || "—"}</dd>
              <dt className="text-muted-foreground">Timezone</dt><dd>{tz}</dd>
              <dt className="text-muted-foreground">Locale / currency</dt><dd>{locale} / {currency}</dd>
              <dt className="text-muted-foreground">Brand color</dt><dd className="flex items-center gap-2"><span className="inline-block w-4 h-4 rounded border" style={{ background: primaryColor }} />{primaryColor}</dd>
              <dt className="text-muted-foreground">Custom domain</dt><dd>{customDomain || "—"}</dd>
              <dt className="text-muted-foreground">Plan</dt><dd>{planId ? plans.find((p) => String(p.id) === planId)?.name || planId : "No plan"} {planId && <Badge variant="outline" className="ml-1">{billingCycle} · {subStatus}</Badge>}</dd>
              <dt className="text-muted-foreground">Owner</dt><dd>{ownerEmail || <span className="text-red-500">required</span>}</dd>
              <dt className="text-muted-foreground">Additional invites</dt><dd>{invites.filter((i) => i.email).length}</dd>
              <dt className="text-muted-foreground">Program methodologies</dt><dd>{programMethods.length ? programMethods.join(", ") : "—"}</dd>
              <dt className="text-muted-foreground">Project methodologies</dt><dd>{projectMethods.length ? projectMethods.join(", ") : "—"}</dd>
              <dt className="text-muted-foreground">2FA enforced</dt><dd>{require2fa ? "Yes" : "No"}</dd>
              <dt className="text-muted-foreground">Seed demo data</dt><dd>{seedDemoData ? "Yes" : "No"}</dd>
              <dt className="text-muted-foreground">Logo</dt><dd>{logoFile ? logoFile.name : "—"}</dd>
            </dl>
            <div className="flex justify-end gap-2 pt-4 border-t">
              <Button variant="outline" onClick={() => navigate("/admin/tenants")}>Cancel</Button>
              <Button onClick={provision} disabled={submitting}>{submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}Provision tenant</Button>
            </div>
          </Section>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default TenantProvisioning;
