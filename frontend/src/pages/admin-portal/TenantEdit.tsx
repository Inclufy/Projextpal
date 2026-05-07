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
import {
  Loader2, Building2, Palette, Shield, ArrowLeft, Trash2,
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

  useEffect(() => {
    if (!id) return;
    fetch(`/api/v1/admin/tenants/${id}/`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.ok ? r.json() : null)
      .then((d) => {
        if (!d) { toast.error("Failed to load tenant"); return; }
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
      })
      .catch(() => toast.error("Failed to load tenant"))
      .finally(() => setLoading(false));
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
        <TabsList className="grid grid-cols-3 w-full max-w-2xl">
          <TabsTrigger value="basics"><Building2 className="h-4 w-4 mr-1" />Basics</TabsTrigger>
          <TabsTrigger value="branding"><Palette className="h-4 w-4 mr-1" />Branding</TabsTrigger>
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
