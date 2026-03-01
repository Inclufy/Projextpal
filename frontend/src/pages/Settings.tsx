import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage, languages } from '@/contexts/LanguageContext';
import api from '@/lib/api';
import {
  User, Shield, Settings as SettingsIcon, Loader2, Key,
  Eye, EyeOff, Save, Check, Info,
} from 'lucide-react';
import { usePageTranslations } from '@/hooks/usePageTranslations';

// ============================================================
// Types
// ============================================================

interface ProviderKeyInfo {
  id: string;
  masked_key: string;
  is_active: boolean;
  use_custom: boolean;
  updated_at: string | null;
}

type ApiKeysState = {
  openai: ProviderKeyInfo | null;
  anthropic: ProviderKeyInfo | null;
};

// ============================================================
// API Keys Section Component
// ============================================================

function ApiKeysSection({ pt }: { pt: (key: string) => string }) {
  const { toast } = useToast();
  const [keys, setKeys] = useState<ApiKeysState>({ openai: null, anthropic: null });
  const [loadingKeys, setLoadingKeys] = useState(true);

  // Per-provider form state
  const [openaiUseCustom, setOpenaiUseCustom] = useState(false);
  const [anthropicUseCustom, setAnthropicUseCustom] = useState(false);
  const [openaiKey, setOpenaiKey] = useState('');
  const [anthropicKey, setAnthropicKey] = useState('');
  const [showOpenai, setShowOpenai] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [savingOpenai, setSavingOpenai] = useState(false);
  const [savingAnthropic, setSavingAnthropic] = useState(false);

  const fetchKeys = useCallback(async () => {
    setLoadingKeys(true);
    try {
      const data = await api.get<ApiKeysState>('/auth/company-api-keys/');
      setKeys(data);
      setOpenaiUseCustom(!!data.openai?.use_custom);
      setAnthropicUseCustom(!!data.anthropic?.use_custom);
    } catch (err) {
      console.error('Failed to fetch API keys:', err);
    } finally {
      setLoadingKeys(false);
    }
  }, []);

  useEffect(() => { fetchKeys(); }, [fetchKeys]);

  const saveKey = async (provider: 'openai' | 'anthropic') => {
    const useCustom = provider === 'openai' ? openaiUseCustom : anthropicUseCustom;
    const keyValue = provider === 'openai' ? openaiKey : anthropicKey;
    const setSaving = provider === 'openai' ? setSavingOpenai : setSavingAnthropic;

    setSaving(true);
    try {
      await api.post('/auth/company-api-keys/', {
        provider,
        use_custom: useCustom,
        api_key: useCustom ? keyValue : '',
      });

      toast({
        title: pt('Success'),
        description: useCustom
          ? pt(`${provider === 'openai' ? 'OpenAI' : 'Anthropic'} API key saved`)
          : pt(`Switched to default ${provider === 'openai' ? 'OpenAI' : 'Anthropic'} key`),
      });

      // Clear the input field after successful save
      if (provider === 'openai') setOpenaiKey('');
      else setAnthropicKey('');

      fetchKeys();
    } catch (err: any) {
      toast({
        title: pt('Error'),
        description: err.message || pt('Failed to save API key'),
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  if (loadingKeys) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const renderProviderCard = (
    provider: 'openai' | 'anthropic',
    label: string,
    description: string,
    useCustom: boolean,
    setUseCustom: (v: boolean) => void,
    keyValue: string,
    setKeyValue: (v: string) => void,
    showKey: boolean,
    setShowKey: (v: boolean) => void,
    saving: boolean,
    existingKey: ProviderKeyInfo | null,
  ) => (
    <Card key={provider}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">{label}</CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          {existingKey?.is_active && (
            <Badge variant="default" className="text-xs">
              <Check className="h-3 w-3 mr-1" />
              {pt("Active")}
            </Badge>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Default vs Custom toggle */}
        <div className="flex items-center justify-between rounded-lg border p-4 bg-muted/30">
          <div className="space-y-0.5">
            <Label className="font-medium">
              {useCustom ? pt("Custom Key") : pt("Default Key")}
            </Label>
            <p className="text-xs text-muted-foreground">
              {useCustom
                ? pt("Using your organisation's own API key")
                : pt("Using the platform's shared API key")}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">{pt("Default")}</span>
            <Switch
              checked={useCustom}
              onCheckedChange={setUseCustom}
            />
            <span className="text-xs text-muted-foreground">{pt("Custom")}</span>
          </div>
        </div>

        {/* Custom key configuration */}
        {useCustom && (
          <div className="space-y-3 pl-1">
            {/* Show existing masked key if one is set */}
            {existingKey?.masked_key && (
              <div className="flex items-center gap-2 text-sm">
                <span className="text-muted-foreground">{pt("Current key")}:</span>
                <code className="font-mono text-xs bg-muted px-2 py-1 rounded">
                  {showKey ? existingKey.masked_key : '••••••••••••••••'}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => setShowKey(!showKey)}
                >
                  {showKey ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                </Button>
                {existingKey.updated_at && (
                  <span className="text-xs text-muted-foreground ml-auto">
                    {pt("Updated")}: {new Date(existingKey.updated_at).toLocaleDateString()}
                  </span>
                )}
              </div>
            )}

            {/* New key input */}
            <div className="space-y-2">
              <Label htmlFor={`${provider}-key`}>
                {existingKey?.masked_key ? pt("Replace API Key") : pt("API Key")}
              </Label>
              <div className="flex gap-2">
                <Input
                  id={`${provider}-key`}
                  type="password"
                  placeholder={provider === 'openai' ? 'sk-...' : 'sk-ant-api03-...'}
                  value={keyValue}
                  onChange={(e) => setKeyValue(e.target.value)}
                  className="font-mono text-sm"
                />
                <Button
                  onClick={() => saveKey(provider)}
                  disabled={saving || (!keyValue && !existingKey?.masked_key)}
                  className="gap-2 shrink-0"
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  {pt("Save")}
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Switch back to default */}
        {!useCustom && existingKey?.use_custom && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => saveKey(provider)}
            disabled={saving}
            className="gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {pt("Switch to Default Key")}
          </Button>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Info banner */}
      <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/30 p-4">
        <Info className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" />
        <div className="text-sm text-blue-800 dark:text-blue-300">
          <p className="font-medium">{pt("API Key Configuration")}</p>
          <p className="mt-1">
            {pt("By default, your organisation uses the platform's shared API keys. You can optionally configure your own OpenAI or Anthropic API keys for dedicated usage and billing.")}
          </p>
        </div>
      </div>

      {renderProviderCard(
        'openai',
        'OpenAI',
        pt('GPT models for AI features, content generation, and analysis'),
        openaiUseCustom,
        setOpenaiUseCustom,
        openaiKey,
        setOpenaiKey,
        showOpenai,
        setShowOpenai,
        savingOpenai,
        keys.openai,
      )}

      {renderProviderCard(
        'anthropic',
        'Anthropic',
        pt('Claude models for AI assistant, reasoning, and document processing'),
        anthropicUseCustom,
        setAnthropicUseCustom,
        anthropicKey,
        setAnthropicKey,
        showAnthropic,
        setShowAnthropic,
        savingAnthropic,
        keys.anthropic,
      )}
    </div>
  );
}

// ============================================================
// Main Settings Component
// ============================================================

export default function Settings() {
  const { pt } = usePageTranslations();
  const { toast } = useToast();
  const { user, setUser } = useAuth();
  const { language, setLanguage } = useLanguage();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  // Check if user has admin role
  const isAdmin = user?.role === 'admin' || user?.role === 'superadmin' || (user as any)?.isSuperAdmin;

  // Profile state
  const [profile, setProfile] = useState({
    firstName: (user as any)?.first_name || (user as any)?.firstName || '',
    lastName: (user as any)?.last_name || (user as any)?.lastName || '',
    email: user?.email || '',
  });

  // Password state
  const [passwords, setPasswords] = useState({
    old_password: '',
    new_password: '',
    confirm_password: '',
  });

  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark' | 'auto'>('dark');

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: (user as any).first_name || (user as any).firstName || '',
        lastName: (user as any).last_name || (user as any).lastName || '',
        email: user.email || '',
      });
    }
  }, [user]);

  const updateProfile = async () => {
    setLoading(true);
    try {
      const response = await api.put('/auth/user/update/', {
        first_name: profile.firstName,
        last_name: profile.lastName,
      });

      // Update user context
      if (setUser) {
        setUser(response);
      }

      toast({
        title: 'Success',
        description: 'Profile updated successfully'
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to update profile',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const changePassword = async () => {
    if (passwords.new_password !== passwords.confirm_password) {
      toast({
        title: 'Error',
        description: 'New passwords do not match',
        variant: 'destructive'
      });
      return;
    }

    if (passwords.new_password.length < 8) {
      toast({
        title: 'Error',
        description: 'Password must be at least 8 characters',
        variant: 'destructive'
      });
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/user/change-password/', {
        old_password: passwords.old_password,
        new_password: passwords.new_password,
      });

      toast({
        title: 'Success',
        description: 'Password changed successfully'
      });

      setPasswords({
        old_password: '',
        new_password: '',
        confirm_password: ''
      });
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to change password',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleThemeChange = (newTheme: string) => {
    setTheme(newTheme as 'light' | 'dark' | 'auto');

    if (newTheme === 'light') {
      document.documentElement.classList.remove('dark');
    } else if (newTheme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      // Auto - use system preference
      const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (isDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  };

  return (
    <div className="container max-w-4xl py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{pt("Settings")}</h1>
        <p className="text-muted-foreground">{pt("Manage your account settings and preferences")}</p>
      </div>

      <Tabs defaultValue="profile" className="space-y-6">
        <TabsList className={`grid w-full ${isAdmin ? 'grid-cols-4' : 'grid-cols-3'}`}>
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            {pt("Profile")}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            {pt("Security")}
          </TabsTrigger>
          <TabsTrigger value="preferences">
            <SettingsIcon className="h-4 w-4 mr-2" />
            {pt("Preferences")}
          </TabsTrigger>
          {isAdmin && (
            <TabsTrigger value="api-keys">
              <Key className="h-4 w-4 mr-2" />
              {pt("API Keys")}
            </TabsTrigger>
          )}
        </TabsList>

        {/* PROFILE TAB */}
        <TabsContent value="profile">
          <Card>
            <CardHeader>
              <CardTitle>{pt("Profile Information")}</CardTitle>
              <CardDescription>{pt("Update your personal information")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">{pt("First Name")}</Label>
                  <Input
                    id="firstName"
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">{pt("Last Name")}</Label>
                  <Input
                    id="lastName"
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{pt("Email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  disabled
                />
                <p className="text-sm text-muted-foreground">
                  {pt("Email address cannot be changed")}
                </p>
              </div>

              <div className="space-y-2">
                <Label>{pt("Role")}</Label>
                <Input
                  value={user?.role || 'User'}
                  disabled
                />
              </div>

              <Button
                onClick={updateProfile}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    {pt("Saving...")}
                  </>
                ) : (
                  pt('Save Changes')
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SECURITY TAB */}
        <TabsContent value="security">
          <div className="space-y-6">
            {/* Change Password Card */}
            <Card>
              <CardHeader>
                <CardTitle>{pt("Change Password")}</CardTitle>
                <CardDescription>
                  {pt("Update your password regularly for security")}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="oldPassword">{pt("Current Password")}</Label>
                  <Input
                    id="oldPassword"
                    type="password"
                    value={passwords.old_password}
                    onChange={(e) =>
                      setPasswords({ ...passwords, old_password: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="newPassword">{pt("New Password")}</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={passwords.new_password}
                    onChange={(e) =>
                      setPasswords({ ...passwords, new_password: e.target.value })
                    }
                  />
                  <p className="text-sm text-muted-foreground">
                    {pt("Minimum 8 characters")}
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">{pt("Confirm New Password")}</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={passwords.confirm_password}
                    onChange={(e) =>
                      setPasswords({ ...passwords, confirm_password: e.target.value })
                    }
                  />
                </div>

                <Button
                  onClick={changePassword}
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {pt("Changing...")}
                    </>
                  ) : (
                    pt('Change Password')
                  )}
                </Button>
              </CardContent>
            </Card>

            {/* 2FA Card */}
            <Card>
              <CardHeader>
                <CardTitle>{pt("Two-Factor Authentication")}</CardTitle>
                <CardDescription>
                  {pt("Add an extra layer of security to your account")}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{pt("Secure your account with 2FA")}</p>
                    <p className="text-sm text-muted-foreground">
                      {pt("Use an authenticator app for additional security")}
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => navigate('/settings/2fa')}
                  >
                    {pt("Manage 2FA")}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* PREFERENCES TAB */}
        <TabsContent value="preferences">
          <Card>
            <CardHeader>
              <CardTitle>{pt("Preferences")}</CardTitle>
              <CardDescription>{pt("Customize your experience")}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Language Selection */}
              <div className="space-y-2">
                <Label htmlFor="language">{pt("Language")}</Label>
                <Select
                  value={language}
                  onValueChange={setLanguage}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {languages.map((lang) => (
                      <SelectItem key={lang.code} value={lang.code}>
                        <span className="mr-2">{lang.flag}</span>
                        {lang.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Theme Selection */}
              <div className="space-y-2">
                <Label>{pt("Theme")}</Label>
                <RadioGroup
                  value={theme}
                  onValueChange={handleThemeChange}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="light" id="light" />
                    <Label htmlFor="light" className="font-normal">
                      {pt("Light")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dark" id="dark" />
                    <Label htmlFor="dark" className="font-normal">
                      {pt("Dark")}
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="auto" id="auto" />
                    <Label htmlFor="auto" className="font-normal">
                      {pt("Auto (System)")}
                    </Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="pt-4 border-t">
                <p className="text-sm text-muted-foreground">
                  {pt("Changes are saved automatically")}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API KEYS TAB (admin roles only) */}
        {isAdmin && (
          <TabsContent value="api-keys">
            <ApiKeysSection pt={pt} />
          </TabsContent>
        )}
      </Tabs>
    </div>
  );
}
