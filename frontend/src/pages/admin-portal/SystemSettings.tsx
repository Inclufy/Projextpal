import { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Loader2, Settings, Save, Key, Building2, Shield, Mail,
  Sparkles, CreditCard, Wrench, Trash2, Plus, Eye, EyeOff,
  Cloud, Server, Database, Globe, CheckCircle2, XCircle, AlertTriangle, RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

// ============================================================
// Types
// ============================================================

interface SystemSettingItem {
  id: string;
  key: string;
  value: any;
  category: string;
  description: string;
  is_sensitive: boolean;
  updated_at: string | null;
}

interface ClientApiKey {
  id: string;
  company: number;
  company_name: string;
  provider: "openai" | "anthropic";
  masked_key: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface CloudProviderConfig {
  id: string;
  provider: "aws" | "azure" | "gcp" | "digitalocean";
  provider_display: string;
  is_active: boolean;
  storage_enabled: boolean;
  storage_config: Record<string, any>;
  email_enabled: boolean;
  email_config: Record<string, any>;
  database_enabled: boolean;
  database_config: Record<string, any>;
  cdn_enabled: boolean;
  cdn_config: Record<string, any>;
  masked_credentials: Record<string, any>;
  active_services: string[];
  created_at: string;
  updated_at: string;
}

interface CompanyOption {
  id: number;
  name: string;
}

// ============================================================
// Helpers
// ============================================================

const CATEGORY_META: Record<string, { label: string; labelNL: string; icon: React.ReactNode }> = {
  general:     { label: "General",     labelNL: "Algemeen",      icon: <Settings className="h-4 w-4" /> },
  security:    { label: "Security",    labelNL: "Beveiliging",   icon: <Shield className="h-4 w-4" /> },
  email:       { label: "Email",       labelNL: "E-mail",        icon: <Mail className="h-4 w-4" /> },
  features:    { label: "Features",    labelNL: "Functies",      icon: <Sparkles className="h-4 w-4" /> },
  billing:     { label: "Billing",     labelNL: "Facturatie",    icon: <CreditCard className="h-4 w-4" /> },
  maintenance: { label: "Maintenance", labelNL: "Onderhoud",     icon: <Wrench className="h-4 w-4" /> },
  cloud:       { label: "Cloud / Server", labelNL: "Cloud / Server", icon: <Cloud className="h-4 w-4" /> },
  api_keys:    { label: "API Keys",    labelNL: "API Sleutels",  icon: <Key className="h-4 w-4" /> },
};

const CATEGORY_ORDER = ["general", "security", "email", "features", "billing", "maintenance", "cloud", "api_keys"];

const PROVIDER_INFO: Record<string, { label: string; color: string; description: string }> = {
  aws:          { label: "Amazon Web Services", color: "bg-orange-100 text-orange-800", description: "S3, SES, RDS, CloudFront" },
  azure:        { label: "Microsoft Azure",     color: "bg-blue-100 text-blue-800",     description: "Blob Storage, Azure SQL, Azure CDN" },
  gcp:          { label: "Google Cloud",         color: "bg-red-100 text-red-800",       description: "Cloud Storage, Cloud SQL, Cloud CDN" },
  digitalocean: { label: "DigitalOcean",         color: "bg-indigo-100 text-indigo-800", description: "Spaces, Managed Databases" },
};

const DEFAULT_CONFIGS: Record<string, { credentials: Record<string, string>; storage: Record<string, string>; email: Record<string, any>; database: Record<string, string>; cdn: Record<string, string> }> = {
  aws: {
    credentials: { access_key_id: "", secret_access_key: "" },
    storage: { bucket_name: "", region: "eu-west-1", custom_domain: "" },
    email: { ses_enabled: false, ses_region: "eu-west-1", from_email: "" },
    database: { host: "", port: "5432", database: "", username: "", password: "" },
    cdn: { distribution_id: "", domain: "" },
  },
  azure: {
    credentials: { account_name: "", account_key: "", connection_string: "" },
    storage: { container_name: "media", custom_domain: "" },
    email: { smtp_host: "", smtp_port: "587", smtp_username: "", smtp_password: "" },
    database: { server: "", database: "", username: "", password: "" },
    cdn: { endpoint: "", domain: "" },
  },
  gcp: {
    credentials: { project_id: "", service_account_json: "" },
    storage: { bucket_name: "", location: "EU" },
    email: { smtp_host: "", smtp_port: "587", smtp_username: "", smtp_password: "" },
    database: { instance_connection: "", database: "", username: "", password: "" },
    cdn: { domain: "" },
  },
  digitalocean: {
    credentials: { access_key_id: "", secret_access_key: "" },
    storage: { bucket_name: "", region: "ams3", endpoint_url: "" },
    email: { smtp_host: "", smtp_port: "587", smtp_username: "", smtp_password: "" },
    database: { host: "", port: "5432", database: "", username: "", password: "" },
    cdn: { domain: "" },
  },
};

function formatLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

// ============================================================
// Main Component
// ============================================================

const SystemSettings = () => {
  const [settings, setSettings] = useState<SystemSettingItem[]>([]);
  const [apiKeys, setApiKeys] = useState<ClientApiKey[]>([]);
  const [companies, setCompanies] = useState<CompanyOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("general");
  const [dirty, setDirty] = useState<Record<string, any>>({});

  // Cloud provider state
  const [cloudProviders, setCloudProviders] = useState<CloudProviderConfig[]>([]);
  const [editingProvider, setEditingProvider] = useState<string | null>(null);
  const [cloudForm, setCloudForm] = useState<Record<string, any>>({});
  const [cloudSaving, setCloudSaving] = useState(false);
  const [testingProvider, setTestingProvider] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, any> | null>(null);

  // API key form state
  const [akCompany, setAkCompany] = useState("");
  const [akProvider, setAkProvider] = useState<"openai" | "anthropic">("openai");
  const [akKey, setAkKey] = useState("");
  const [akSaving, setAkSaving] = useState(false);
  const [showKeyFor, setShowKeyFor] = useState<string | null>(null);

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  // ----- Fetch settings -----
  const fetchSettings = useCallback(async () => {
    setLoading(true);
    try {
      const r = await fetch("/api/v1/admin/settings/", { headers });
      if (r.ok) {
        const data = await r.json();
        setSettings(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // ----- Fetch API keys -----
  const fetchApiKeys = useCallback(async () => {
    try {
      const r = await fetch("/api/v1/admin/api-keys/", { headers });
      if (r.ok) setApiKeys(await r.json());
    } catch (err) {
      console.error("Failed to fetch API keys:", err);
    }
  }, []);

  // ----- Fetch companies -----
  const fetchCompanies = useCallback(async () => {
    try {
      const r = await fetch("/api/v1/admin/tenants/", { headers });
      if (r.ok) {
        const data = await r.json();
        const list = data.results || data;
        setCompanies(Array.isArray(list) ? list.map((c: any) => ({ id: c.id, name: c.name })) : []);
      }
    } catch (err) {
      console.error("Failed to fetch companies:", err);
    }
  }, []);

  // ----- Fetch cloud providers -----
  const fetchCloudProviders = useCallback(async () => {
    try {
      const r = await fetch("/api/v1/admin/cloud-providers/", { headers });
      if (r.ok) setCloudProviders(await r.json());
    } catch (err) {
      console.error("Failed to fetch cloud providers:", err);
    }
  }, []);

  useEffect(() => {
    fetchSettings();
    fetchApiKeys();
    fetchCompanies();
    fetchCloudProviders();
  }, []);

  // ----- Update a setting locally -----
  const updateSetting = (key: string, value: any) => {
    setSettings((prev) =>
      prev.map((s) => (s.key === key ? { ...s, value } : s))
    );
    setDirty((prev) => ({ ...prev, [key]: value }));
  };

  // ----- Save all changed settings -----
  const handleSave = async () => {
    const changedKeys = Object.keys(dirty);
    if (changedKeys.length === 0) {
      toast.info("No changes to save");
      return;
    }

    setSaving(true);
    try {
      const payload = changedKeys.map((key) => ({
        key,
        value: dirty[key],
      }));
      const r = await fetch("/api/v1/admin/settings/", {
        method: "PATCH",
        headers: jsonHeaders,
        body: JSON.stringify(payload),
      });
      if (r.ok) {
        toast.success("Settings saved");
        setDirty({});
        fetchSettings();
      } else {
        toast.error("Failed to save settings");
      }
    } catch {
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  // ----- Create / Update API key -----
  const handleSaveApiKey = async () => {
    if (!akCompany || !akKey) {
      toast.error("Select a company and enter an API key");
      return;
    }
    setAkSaving(true);
    try {
      const r = await fetch("/api/v1/admin/api-keys/", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify({
          company_id: akCompany,
          provider: akProvider,
          api_key: akKey,
        }),
      });
      if (r.ok) {
        toast.success(`${akProvider === "openai" ? "OpenAI" : "Anthropic"} API key saved`);
        setAkKey("");
        fetchApiKeys();
      } else {
        const err = await r.json().catch(() => ({}));
        toast.error(err.error || "Failed to save API key");
      }
    } catch {
      toast.error("Failed to save API key");
    } finally {
      setAkSaving(false);
    }
  };

  // ----- Start editing a cloud provider -----
  const startEditProvider = (provider: string) => {
    const existing = cloudProviders.find((c) => c.provider === provider);
    if (existing) {
      setCloudForm({
        provider,
        is_active: existing.is_active,
        storage_enabled: existing.storage_enabled,
        storage_config: { ...DEFAULT_CONFIGS[provider]?.storage, ...existing.storage_config },
        email_enabled: existing.email_enabled,
        email_config: { ...DEFAULT_CONFIGS[provider]?.email, ...existing.email_config },
        database_enabled: existing.database_enabled,
        database_config: { ...DEFAULT_CONFIGS[provider]?.database, ...existing.database_config },
        cdn_enabled: existing.cdn_enabled,
        cdn_config: { ...DEFAULT_CONFIGS[provider]?.cdn, ...existing.cdn_config },
        credentials: { ...DEFAULT_CONFIGS[provider]?.credentials },
      });
    } else {
      const defaults = DEFAULT_CONFIGS[provider];
      setCloudForm({
        provider,
        is_active: false,
        storage_enabled: false,
        storage_config: { ...defaults?.storage },
        email_enabled: false,
        email_config: { ...defaults?.email },
        database_enabled: false,
        database_config: { ...defaults?.database },
        cdn_enabled: false,
        cdn_config: { ...defaults?.cdn },
        credentials: { ...defaults?.credentials },
      });
    }
    setEditingProvider(provider);
    setTestResults(null);
  };

  // ----- Save cloud provider config -----
  const handleSaveCloudProvider = async () => {
    setCloudSaving(true);
    try {
      const payload = { ...cloudForm };
      // Only send credentials if they have non-empty values
      const creds = payload.credentials || {};
      const hasNewCreds = Object.values(creds).some((v: any) => typeof v === "string" && v.trim() !== "");
      if (!hasNewCreds) delete payload.credentials;

      const r = await fetch("/api/v1/admin/cloud-providers/", {
        method: "POST",
        headers: jsonHeaders,
        body: JSON.stringify(payload),
      });
      if (r.ok) {
        toast.success(`${PROVIDER_INFO[cloudForm.provider]?.label || cloudForm.provider} configuration saved`);
        setEditingProvider(null);
        setCloudForm({});
        fetchCloudProviders();
      } else {
        const err = await r.json().catch(() => ({}));
        toast.error(err.detail || "Failed to save cloud configuration");
      }
    } catch {
      toast.error("Failed to save cloud configuration");
    } finally {
      setCloudSaving(false);
    }
  };

  // ----- Test cloud provider connection -----
  const handleTestConnection = async (id: string, provider: string) => {
    setTestingProvider(provider);
    setTestResults(null);
    try {
      const r = await fetch(`/api/v1/admin/cloud-providers/${id}/test/`, {
        method: "POST",
        headers: jsonHeaders,
      });
      if (r.ok) {
        const data = await r.json();
        setTestResults(data);
        if (data.overall_status === "ok") {
          toast.success("Connection test successful");
        } else {
          toast.warning("Some services could not be verified");
        }
      } else {
        toast.error("Connection test failed");
      }
    } catch {
      toast.error("Connection test failed");
    } finally {
      setTestingProvider(null);
    }
  };

  // ----- Delete cloud provider -----
  const handleDeleteCloudProvider = async (id: string, providerLabel: string) => {
    try {
      const r = await fetch(`/api/v1/admin/cloud-providers/${id}/`, {
        method: "DELETE",
        headers,
      });
      if (r.ok || r.status === 204) {
        toast.success(`${providerLabel} configuration removed`);
        fetchCloudProviders();
      } else {
        toast.error("Failed to remove configuration");
      }
    } catch {
      toast.error("Failed to remove configuration");
    }
  };

  // ----- Delete API key -----
  const handleDeleteApiKey = async (id: string) => {
    try {
      const r = await fetch(`/api/v1/admin/api-keys/${id}/`, {
        method: "DELETE",
        headers,
      });
      if (r.ok || r.status === 204) {
        toast.success("API key removed");
        fetchApiKeys();
      } else {
        toast.error("Failed to remove API key");
      }
    } catch {
      toast.error("Failed to remove API key");
    }
  };

  // ----- Group settings by category -----
  const settingsByCategory: Record<string, SystemSettingItem[]> = {};
  settings.forEach((s) => {
    if (!settingsByCategory[s.category]) settingsByCategory[s.category] = [];
    settingsByCategory[s.category].push(s);
  });

  // ----- Loading state -----
  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  const hasDirtyChanges = Object.keys(dirty).length > 0;

  // ----- Render a single setting field -----
  const renderField = (s: SystemSettingItem) => {
    const val = s.value;

    if (typeof val === "boolean") {
      return (
        <div className="flex items-center justify-between rounded-lg border p-4" key={s.key}>
          <div>
            <p className="font-medium text-sm">{formatLabel(s.key)}</p>
            {s.description && <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>}
          </div>
          <Switch
            checked={val}
            onCheckedChange={(checked) => updateSetting(s.key, checked)}
          />
        </div>
      );
    }

    if (typeof val === "number") {
      return (
        <div className="space-y-2 rounded-lg border p-4" key={s.key}>
          <Label className="font-medium text-sm">{formatLabel(s.key)}</Label>
          {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
          <Input
            type="number"
            value={val}
            onChange={(e) => updateSetting(s.key, parseFloat(e.target.value) || 0)}
          />
        </div>
      );
    }

    // String
    return (
      <div className="space-y-2 rounded-lg border p-4" key={s.key}>
        <Label className="font-medium text-sm">{formatLabel(s.key)}</Label>
        {s.description && <p className="text-xs text-muted-foreground">{s.description}</p>}
        <Input
          value={typeof val === "string" ? val : JSON.stringify(val)}
          onChange={(e) => updateSetting(s.key, e.target.value)}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Settings className="h-6 w-6 text-gray-500" />
          <h1 className="text-2xl font-bold">System Settings</h1>
        </div>
        <Button onClick={handleSave} disabled={saving || !hasDirtyChanges} className="gap-2">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save All
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto gap-1">
          {CATEGORY_ORDER.map((cat) => {
            const meta = CATEGORY_META[cat];
            if (!meta) return null;
            // Skip empty categories (except api_keys and cloud which are always shown)
            if (cat !== "api_keys" && cat !== "cloud" && !settingsByCategory[cat]?.length) return null;
            return (
              <TabsTrigger key={cat} value={cat} className="gap-1.5">
                {meta.icon}
                {meta.label}
              </TabsTrigger>
            );
          })}
        </TabsList>

        {/* Setting category tabs */}
        {CATEGORY_ORDER.filter((c) => c !== "api_keys" && c !== "cloud").map((cat) => (
          <TabsContent key={cat} value={cat}>
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {CATEGORY_META[cat]?.icon}
                  {CATEGORY_META[cat]?.label} Settings
                </CardTitle>
                <CardDescription>
                  Configure {CATEGORY_META[cat]?.label.toLowerCase()} settings for the platform
                </CardDescription>
              </CardHeader>
              <CardContent>
                {settingsByCategory[cat]?.length ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {settingsByCategory[cat].map(renderField)}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-sm py-4">
                    No settings in this category yet.
                  </p>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}

        {/* Cloud / Server Tab */}
        <TabsContent value="cloud">
          <div className="space-y-6">
            {/* Provider Cards */}
            {!editingProvider && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Cloud className="h-5 w-5" />
                      Cloud Provider Configuration
                    </CardTitle>
                    <CardDescription>
                      Configure cloud storage, email, database, and CDN services for AWS, Azure, GCP, or DigitalOcean.
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {Object.entries(PROVIDER_INFO).map(([key, info]) => {
                        const existing = cloudProviders.find((c) => c.provider === key);
                        return (
                          <div
                            key={key}
                            className={`rounded-lg border p-4 space-y-3 ${existing?.is_active ? "border-green-300 bg-green-50/50" : ""}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <Server className="h-5 w-5 text-muted-foreground" />
                                <div>
                                  <p className="font-medium text-sm">{info.label}</p>
                                  <p className="text-xs text-muted-foreground">{info.description}</p>
                                </div>
                              </div>
                              {existing?.is_active && (
                                <Badge className="bg-green-100 text-green-800 text-xs">Active</Badge>
                              )}
                            </div>

                            {existing && (
                              <div className="flex flex-wrap gap-1.5">
                                {existing.active_services.map((svc) => (
                                  <Badge key={svc} variant="secondary" className="text-xs capitalize">
                                    {svc}
                                  </Badge>
                                ))}
                                {existing.active_services.length === 0 && (
                                  <span className="text-xs text-muted-foreground">No services enabled</span>
                                )}
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant={existing ? "outline" : "default"}
                                onClick={() => startEditProvider(key)}
                                className="gap-1.5"
                              >
                                <Settings className="h-3.5 w-3.5" />
                                {existing ? "Configure" : "Setup"}
                              </Button>
                              {existing && (
                                <>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => handleTestConnection(existing.id, key)}
                                    disabled={testingProvider === key}
                                    className="gap-1.5"
                                  >
                                    {testingProvider === key ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <RefreshCw className="h-3.5 w-3.5" />
                                    )}
                                    Test
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="text-red-500 hover:text-red-700 hover:bg-red-50 gap-1.5"
                                    onClick={() => handleDeleteCloudProvider(existing.id, info.label)}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>

                {/* Test Results */}
                {testResults && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-base">
                        {testResults.overall_status === "ok" ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-5 w-5 text-yellow-600" />
                        )}
                        Connection Test Results - {PROVIDER_INFO[testResults.provider]?.label}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {Object.entries(testResults.services || {}).map(([svc, result]: [string, any]) => (
                          <div key={svc} className="flex items-center gap-3 rounded-lg border p-3">
                            {result.status === "ok" ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                            ) : result.status === "warning" ? (
                              <AlertTriangle className="h-4 w-4 text-yellow-600 shrink-0" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600 shrink-0" />
                            )}
                            <div>
                              <p className="font-medium text-sm capitalize">{svc}</p>
                              <p className="text-xs text-muted-foreground">{result.message}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}

            {/* Edit Provider Form */}
            {editingProvider && (
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                      <Server className="h-5 w-5" />
                      {PROVIDER_INFO[editingProvider]?.label} Configuration
                    </CardTitle>
                    <Button variant="outline" size="sm" onClick={() => setEditingProvider(null)}>
                      Cancel
                    </Button>
                  </div>
                  <CardDescription>
                    Configure services and credentials for {PROVIDER_INFO[editingProvider]?.label}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Active Toggle */}
                  <div className="flex items-center justify-between rounded-lg border p-4">
                    <div>
                      <p className="font-medium text-sm">Enable Provider</p>
                      <p className="text-xs text-muted-foreground">Activate this cloud provider for the platform</p>
                    </div>
                    <Switch
                      checked={cloudForm.is_active || false}
                      onCheckedChange={(checked) => setCloudForm((p: Record<string, any>) => ({ ...p, is_active: checked }))}
                    />
                  </div>

                  {/* Credentials */}
                  <div className="space-y-3">
                    <h3 className="font-medium text-sm flex items-center gap-2">
                      <Key className="h-4 w-4" /> Credentials
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(cloudForm.credentials || {}).map(([key, val]) => (
                        <div key={key} className="space-y-1.5">
                          <Label className="text-xs">{formatLabel(key)}</Label>
                          <Input
                            type={key.includes("secret") || key.includes("password") || key.includes("key") ? "password" : "text"}
                            placeholder={`Enter ${formatLabel(key).toLowerCase()}...`}
                            value={typeof val === "string" ? val : ""}
                            onChange={(e) =>
                              setCloudForm((p: Record<string, any>) => ({
                                ...p,
                                credentials: { ...p.credentials, [key]: e.target.value },
                              }))
                            }
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Storage */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm flex items-center gap-2">
                        <Database className="h-4 w-4" /> Cloud Storage
                      </h3>
                      <Switch
                        checked={cloudForm.storage_enabled || false}
                        onCheckedChange={(checked) => setCloudForm((p: Record<string, any>) => ({ ...p, storage_enabled: checked }))}
                      />
                    </div>
                    {cloudForm.storage_enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-muted">
                        {Object.entries(cloudForm.storage_config || {}).map(([key, val]) => (
                          <div key={key} className="space-y-1.5">
                            <Label className="text-xs">{formatLabel(key)}</Label>
                            <Input
                              value={typeof val === "string" ? val : String(val ?? "")}
                              onChange={(e) =>
                                setCloudForm((p: Record<string, any>) => ({
                                  ...p,
                                  storage_config: { ...p.storage_config, [key]: e.target.value },
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Email */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm flex items-center gap-2">
                        <Mail className="h-4 w-4" /> Email Service
                      </h3>
                      <Switch
                        checked={cloudForm.email_enabled || false}
                        onCheckedChange={(checked) => setCloudForm((p: Record<string, any>) => ({ ...p, email_enabled: checked }))}
                      />
                    </div>
                    {cloudForm.email_enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-muted">
                        {Object.entries(cloudForm.email_config || {}).map(([key, val]) => {
                          if (typeof val === "boolean") {
                            return (
                              <div key={key} className="flex items-center justify-between col-span-2">
                                <Label className="text-xs">{formatLabel(key)}</Label>
                                <Switch
                                  checked={val}
                                  onCheckedChange={(checked) =>
                                    setCloudForm((p: Record<string, any>) => ({
                                      ...p,
                                      email_config: { ...p.email_config, [key]: checked },
                                    }))
                                  }
                                />
                              </div>
                            );
                          }
                          return (
                            <div key={key} className="space-y-1.5">
                              <Label className="text-xs">{formatLabel(key)}</Label>
                              <Input
                                type={key.includes("password") ? "password" : "text"}
                                value={typeof val === "string" ? val : String(val ?? "")}
                                onChange={(e) =>
                                  setCloudForm((p: Record<string, any>) => ({
                                    ...p,
                                    email_config: { ...p.email_config, [key]: e.target.value },
                                  }))
                                }
                              />
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Database */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm flex items-center gap-2">
                        <Database className="h-4 w-4" /> Database
                      </h3>
                      <Switch
                        checked={cloudForm.database_enabled || false}
                        onCheckedChange={(checked) => setCloudForm((p: Record<string, any>) => ({ ...p, database_enabled: checked }))}
                      />
                    </div>
                    {cloudForm.database_enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-muted">
                        {Object.entries(cloudForm.database_config || {}).map(([key, val]) => (
                          <div key={key} className="space-y-1.5">
                            <Label className="text-xs">{formatLabel(key)}</Label>
                            <Input
                              type={key.includes("password") ? "password" : "text"}
                              value={typeof val === "string" ? val : String(val ?? "")}
                              onChange={(e) =>
                                setCloudForm((p: Record<string, any>) => ({
                                  ...p,
                                  database_config: { ...p.database_config, [key]: e.target.value },
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* CDN */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h3 className="font-medium text-sm flex items-center gap-2">
                        <Globe className="h-4 w-4" /> CDN
                      </h3>
                      <Switch
                        checked={cloudForm.cdn_enabled || false}
                        onCheckedChange={(checked) => setCloudForm((p: Record<string, any>) => ({ ...p, cdn_enabled: checked }))}
                      />
                    </div>
                    {cloudForm.cdn_enabled && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pl-4 border-l-2 border-muted">
                        {Object.entries(cloudForm.cdn_config || {}).map(([key, val]) => (
                          <div key={key} className="space-y-1.5">
                            <Label className="text-xs">{formatLabel(key)}</Label>
                            <Input
                              value={typeof val === "string" ? val : String(val ?? "")}
                              onChange={(e) =>
                                setCloudForm((p: Record<string, any>) => ({
                                  ...p,
                                  cdn_config: { ...p.cdn_config, [key]: e.target.value },
                                }))
                              }
                            />
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Save Button */}
                  <div className="flex justify-end gap-3 pt-4 border-t">
                    <Button variant="outline" onClick={() => setEditingProvider(null)}>
                      Cancel
                    </Button>
                    <Button onClick={handleSaveCloudProvider} disabled={cloudSaving} className="gap-2">
                      {cloudSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                      Save Configuration
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        {/* API Keys Tab */}
        <TabsContent value="api_keys">
          <div className="space-y-6">
            {/* Add API Key Form */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Plus className="h-5 w-5" />
                  Add / Update API Key
                </CardTitle>
                <CardDescription>
                  Set OpenAI or Anthropic API keys per client organisation. Each company can have one key per provider.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                  <div className="space-y-2">
                    <Label>Organisation</Label>
                    <Select value={akCompany} onValueChange={setAkCompany}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select company..." />
                      </SelectTrigger>
                      <SelectContent>
                        {companies.map((c) => (
                          <SelectItem key={c.id} value={String(c.id)}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Provider</Label>
                    <Select value={akProvider} onValueChange={(v) => setAkProvider(v as "openai" | "anthropic")}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="openai">OpenAI</SelectItem>
                        <SelectItem value="anthropic">Anthropic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>API Key</Label>
                    <Input
                      type="password"
                      placeholder="sk-... or sk-ant-..."
                      value={akKey}
                      onChange={(e) => setAkKey(e.target.value)}
                    />
                  </div>

                  <Button onClick={handleSaveApiKey} disabled={akSaving} className="gap-2">
                    {akSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                    Save Key
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Existing API Keys */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Key className="h-5 w-5" />
                  Client API Keys
                </CardTitle>
                <CardDescription>
                  Manage OpenAI and Anthropic API keys per organisation
                </CardDescription>
              </CardHeader>
              <CardContent>
                {apiKeys.length === 0 ? (
                  <p className="text-muted-foreground text-sm py-4">
                    No API keys configured yet. Use the form above to add keys for client organisations.
                  </p>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b text-left">
                          <th className="pb-2 font-medium">Organisation</th>
                          <th className="pb-2 font-medium">Provider</th>
                          <th className="pb-2 font-medium">API Key</th>
                          <th className="pb-2 font-medium">Status</th>
                          <th className="pb-2 font-medium">Updated</th>
                          <th className="pb-2 font-medium text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {apiKeys.map((ak) => (
                          <tr key={ak.id} className="border-b last:border-0">
                            <td className="py-3">
                              <div className="flex items-center gap-2">
                                <Building2 className="h-4 w-4 text-muted-foreground" />
                                {ak.company_name}
                              </div>
                            </td>
                            <td className="py-3">
                              <Badge variant={ak.provider === "openai" ? "default" : "secondary"}>
                                {ak.provider === "openai" ? "OpenAI" : "Anthropic"}
                              </Badge>
                            </td>
                            <td className="py-3 font-mono text-xs">
                              <div className="flex items-center gap-1">
                                {showKeyFor === ak.id ? ak.masked_key : "••••••••••••"}
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-6 w-6"
                                  onClick={() => setShowKeyFor(showKeyFor === ak.id ? null : ak.id)}
                                >
                                  {showKeyFor === ak.id ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                                </Button>
                              </div>
                            </td>
                            <td className="py-3">
                              <Badge variant={ak.is_active ? "default" : "destructive"} className="text-xs">
                                {ak.is_active ? "Active" : "Inactive"}
                              </Badge>
                            </td>
                            <td className="py-3 text-muted-foreground text-xs">
                              {ak.updated_at ? new Date(ak.updated_at).toLocaleDateString() : "-"}
                            </td>
                            <td className="py-3 text-right">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                                onClick={() => handleDeleteApiKey(ak.id)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemSettings;
