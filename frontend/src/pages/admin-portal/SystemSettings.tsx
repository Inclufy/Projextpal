// ============================================================
// ADMIN PORTAL - SYSTEM SETTINGS
// Global system configuration and settings
// ============================================================

import { useState, useEffect } from 'react';
import {
  Settings,
  Save,
  RefreshCw,
  Globe,
  Mail,
  Shield,
  Database,
  Server,
  Zap,
  Bell,
  Lock,
  Key,
  Clock,
  HardDrive,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info,
  Eye,
  EyeOff,
  Copy,
  RotateCcw,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from '@/components/ui/alert';

import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import type { SystemSettings } from './admin.types';

// =========================
// SETTING SECTION COMPONENT
// =========================

interface SettingSectionProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
}

const SettingSection: React.FC<SettingSectionProps> = ({
  title,
  description,
  icon: Icon,
  children,
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5 text-purple-600" />
          {title}
        </CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">{children}</CardContent>
    </Card>
  );
};

// =========================
// SETTING ROW COMPONENT
// =========================

interface SettingRowProps {
  label: string;
  description?: string;
  children: React.ReactNode;
}

const SettingRow: React.FC<SettingRowProps> = ({ label, description, children }) => {
  return (
    <div className="flex items-center justify-between">
      <div className="space-y-0.5">
        <Label>{label}</Label>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </div>
  );
};

// =========================
// PASSWORD INPUT COMPONENT
// =========================

interface PasswordInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

const PasswordInput: React.FC<PasswordInputProps> = ({
  value,
  onChange,
  placeholder,
}) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative">
      <Input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="pr-10"
      />
      <Button
        variant="ghost"
        size="icon"
        type="button"
        className="absolute right-0 top-0 h-full px-3"
        onClick={() => setShow(!show)}
      >
        {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
      </Button>
    </div>
  );
};

// =========================
// MAIN SYSTEM SETTINGS COMPONENT
// =========================

export default function SystemSettingsPage() {
  const { toast } = useToast();
  const { language } = useLanguage();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [settings, setSettings] = useState<SystemSettings>({
    // General
    appName: 'ProjeXtPal',
    appUrl: 'https://app.projextpal.com',
    supportEmail: 'support@projextpal.com',

    // Features
    maintenanceMode: false,
    maintenanceMessage: '',
    registrationEnabled: true,
    trialEnabled: true,
    trialDays: 14,

    // Limits
    defaultMaxProjects: 3,
    defaultMaxPrograms: 1,
    defaultMaxUsers: 5,
    defaultMaxStorage: 1024,

    // Email
    emailProvider: 'sendgrid',
    emailFromAddress: 'noreply@projextpal.com',
    emailFromName: 'ProjeXtPal',

    // Storage
    storageProvider: 's3',
    maxUploadSize: 50,
    allowedFileTypes: ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'png', 'jpg', 'jpeg', 'gif'],

    // Security
    passwordMinLength: 8,
    passwordRequireUppercase: true,
    passwordRequireNumbers: true,
    passwordRequireSymbols: false,
    maxLoginAttempts: 5,
    lockoutDuration: 30,
    sessionTimeout: 60,

    // AI
    aiProvider: 'anthropic',
    aiModel: 'claude-3-sonnet',
    aiMaxTokens: 4096,
    aiEnabled: true,
  });

  useEffect(() => {
    // Simulate loading settings
    setTimeout(() => setLoading(false), 500);
  }, []);

  const updateSetting = <K extends keyof SystemSettings>(
    key: K,
    value: SystemSettings[K]
  ) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setSaving(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setSaving(false);
    setHasChanges(false);
    toast({
      title: language === 'nl' ? 'Opgeslagen' : 'Saved',
      description: language === 'nl'
        ? 'Instellingen zijn opgeslagen'
        : 'Settings have been saved',
    });
  };

  const handleReset = () => {
    // Reset to defaults
    setHasChanges(false);
    toast({
      title: language === 'nl' ? 'Gereset' : 'Reset',
      description: language === 'nl'
        ? 'Instellingen zijn gereset naar standaardwaarden'
        : 'Settings have been reset to defaults',
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <RefreshCw className="h-8 w-8 animate-spin text-purple-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Settings className="h-6 w-6 text-purple-600" />
            {language === 'nl' ? 'Systeeminstellingen' : 'System Settings'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'nl'
              ? 'Configureer globale systeeminstellingen'
              : 'Configure global system settings'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {hasChanges && (
            <Badge variant="outline" className="bg-amber-50 text-amber-700">
              {language === 'nl' ? 'Niet-opgeslagen wijzigingen' : 'Unsaved changes'}
            </Badge>
          )}
          <Button variant="outline" onClick={handleReset} disabled={!hasChanges}>
            <RotateCcw className="mr-2 h-4 w-4" />
            {language === 'nl' ? 'Resetten' : 'Reset'}
          </Button>
          <Button onClick={handleSave} disabled={!hasChanges || saving}>
            {saving ? (
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Save className="mr-2 h-4 w-4" />
            )}
            {language === 'nl' ? 'Opslaan' : 'Save Changes'}
          </Button>
        </div>
      </div>

      {/* Maintenance Mode Alert */}
      {settings.maintenanceMode && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>
            {language === 'nl' ? 'Onderhoudsmodus Actief' : 'Maintenance Mode Active'}
          </AlertTitle>
          <AlertDescription>
            {language === 'nl'
              ? 'De applicatie is momenteel niet toegankelijk voor gebruikers.'
              : 'The application is currently not accessible to users.'}
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList>
          <TabsTrigger value="general">
            <Globe className="h-4 w-4 mr-2" />
            {language === 'nl' ? 'Algemeen' : 'General'}
          </TabsTrigger>
          <TabsTrigger value="features">
            <Zap className="h-4 w-4 mr-2" />
            {language === 'nl' ? 'Functies' : 'Features'}
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="h-4 w-4 mr-2" />
            {language === 'nl' ? 'Beveiliging' : 'Security'}
          </TabsTrigger>
          <TabsTrigger value="email">
            <Mail className="h-4 w-4 mr-2" />
            Email
          </TabsTrigger>
          <TabsTrigger value="storage">
            <HardDrive className="h-4 w-4 mr-2" />
            {language === 'nl' ? 'Opslag' : 'Storage'}
          </TabsTrigger>
          <TabsTrigger value="ai">
            <Zap className="h-4 w-4 mr-2" />
            AI
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <SettingSection
            title={language === 'nl' ? 'Applicatie' : 'Application'}
            description={
              language === 'nl'
                ? 'Basisinstellingen voor de applicatie'
                : 'Basic application settings'
            }
            icon={Globe}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{language === 'nl' ? 'App Naam' : 'App Name'}</Label>
                <Input
                  value={settings.appName}
                  onChange={(e) => updateSetting('appName', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>App URL</Label>
                <Input
                  value={settings.appUrl}
                  onChange={(e) => updateSetting('appUrl', e.target.value)}
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label>{language === 'nl' ? 'Support Email' : 'Support Email'}</Label>
                <Input
                  type="email"
                  value={settings.supportEmail}
                  onChange={(e) => updateSetting('supportEmail', e.target.value)}
                />
              </div>
            </div>
          </SettingSection>

          <SettingSection
            title={language === 'nl' ? 'Standaard Limieten' : 'Default Limits'}
            description={
              language === 'nl'
                ? 'Standaardlimieten voor nieuwe organisaties (Starter plan)'
                : 'Default limits for new organizations (Starter plan)'
            }
            icon={Database}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{language === 'nl' ? 'Max Projecten' : 'Max Projects'}</Label>
                <Input
                  type="number"
                  value={settings.defaultMaxProjects}
                  onChange={(e) =>
                    updateSetting('defaultMaxProjects', parseInt(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'nl' ? "Max Programma's" : 'Max Programs'}</Label>
                <Input
                  type="number"
                  value={settings.defaultMaxPrograms}
                  onChange={(e) =>
                    updateSetting('defaultMaxPrograms', parseInt(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'nl' ? 'Max Gebruikers' : 'Max Users'}</Label>
                <Input
                  type="number"
                  value={settings.defaultMaxUsers}
                  onChange={(e) =>
                    updateSetting('defaultMaxUsers', parseInt(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'nl' ? 'Max Opslag (MB)' : 'Max Storage (MB)'}</Label>
                <Input
                  type="number"
                  value={settings.defaultMaxStorage}
                  onChange={(e) =>
                    updateSetting('defaultMaxStorage', parseInt(e.target.value))
                  }
                />
              </div>
            </div>
          </SettingSection>
        </TabsContent>

        {/* Features Settings */}
        <TabsContent value="features" className="space-y-6">
          <SettingSection
            title={language === 'nl' ? 'Onderhoudsmodus' : 'Maintenance Mode'}
            description={
              language === 'nl'
                ? 'Schakel de applicatie tijdelijk uit voor onderhoud'
                : 'Temporarily disable the application for maintenance'
            }
            icon={Server}
          >
            <SettingRow
              label={language === 'nl' ? 'Onderhoudsmodus' : 'Maintenance Mode'}
              description={
                language === 'nl'
                  ? 'Wanneer ingeschakeld, kunnen alleen admins inloggen'
                  : 'When enabled, only admins can log in'
              }
            >
              <Switch
                checked={settings.maintenanceMode}
                onCheckedChange={(checked) => updateSetting('maintenanceMode', checked)}
              />
            </SettingRow>
            {settings.maintenanceMode && (
              <div className="space-y-2">
                <Label>
                  {language === 'nl' ? 'Onderhoudsbericht' : 'Maintenance Message'}
                </Label>
                <Textarea
                  value={settings.maintenanceMessage}
                  onChange={(e) => updateSetting('maintenanceMessage', e.target.value)}
                  placeholder={
                    language === 'nl'
                      ? 'We zijn bezig met onderhoud...'
                      : 'We are currently performing maintenance...'
                  }
                  rows={3}
                />
              </div>
            )}
          </SettingSection>

          <SettingSection
            title={language === 'nl' ? 'Registratie & Trial' : 'Registration & Trial'}
            description={
              language === 'nl'
                ? 'Beheer gebruikersregistratie en trial periodes'
                : 'Manage user registration and trial periods'
            }
            icon={Key}
          >
            <SettingRow
              label={language === 'nl' ? 'Registratie Inschakelen' : 'Enable Registration'}
              description={
                language === 'nl'
                  ? 'Sta nieuwe gebruikers toe om zich te registreren'
                  : 'Allow new users to register'
              }
            >
              <Switch
                checked={settings.registrationEnabled}
                onCheckedChange={(checked) =>
                  updateSetting('registrationEnabled', checked)
                }
              />
            </SettingRow>
            <Separator />
            <SettingRow
              label={language === 'nl' ? 'Trial Inschakelen' : 'Enable Trial'}
              description={
                language === 'nl'
                  ? 'Bied nieuwe organisaties een gratis proefperiode'
                  : 'Offer new organizations a free trial period'
              }
            >
              <Switch
                checked={settings.trialEnabled}
                onCheckedChange={(checked) => updateSetting('trialEnabled', checked)}
              />
            </SettingRow>
            {settings.trialEnabled && (
              <div className="space-y-4 pl-4 border-l-2 border-purple-200">
                <div className="space-y-2">
                  <Label>{language === 'nl' ? 'Trial Dagen' : 'Trial Days'}</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.trialDays]}
                      onValueChange={([value]) => updateSetting('trialDays', value)}
                      min={7}
                      max={90}
                      step={7}
                      className="flex-1"
                    />
                    <span className="w-16 text-right font-medium">
                      {settings.trialDays} {language === 'nl' ? 'dagen' : 'days'}
                    </span>
                  </div>
                </div>
              </div>
            )}
          </SettingSection>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <SettingSection
            title={language === 'nl' ? 'Wachtwoordbeleid' : 'Password Policy'}
            description={
              language === 'nl'
                ? 'Configureer wachtwoordvereisten voor gebruikers'
                : 'Configure password requirements for users'
            }
            icon={Lock}
          >
            <div className="space-y-2">
              <Label>{language === 'nl' ? 'Minimale Lengte' : 'Minimum Length'}</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[settings.passwordMinLength]}
                  onValueChange={([value]) => updateSetting('passwordMinLength', value)}
                  min={6}
                  max={20}
                  step={1}
                  className="flex-1"
                />
                <span className="w-16 text-right font-medium">
                  {settings.passwordMinLength} chars
                </span>
              </div>
            </div>
            <Separator />
            <SettingRow
              label={language === 'nl' ? 'Hoofdletters Vereist' : 'Require Uppercase'}
              description={
                language === 'nl'
                  ? 'Wachtwoord moet minimaal één hoofdletter bevatten'
                  : 'Password must contain at least one uppercase letter'
              }
            >
              <Switch
                checked={settings.passwordRequireUppercase}
                onCheckedChange={(checked) =>
                  updateSetting('passwordRequireUppercase', checked)
                }
              />
            </SettingRow>
            <SettingRow
              label={language === 'nl' ? 'Cijfers Vereist' : 'Require Numbers'}
              description={
                language === 'nl'
                  ? 'Wachtwoord moet minimaal één cijfer bevatten'
                  : 'Password must contain at least one number'
              }
            >
              <Switch
                checked={settings.passwordRequireNumbers}
                onCheckedChange={(checked) =>
                  updateSetting('passwordRequireNumbers', checked)
                }
              />
            </SettingRow>
            <SettingRow
              label={language === 'nl' ? 'Symbolen Vereist' : 'Require Symbols'}
              description={
                language === 'nl'
                  ? 'Wachtwoord moet minimaal één speciaal teken bevatten'
                  : 'Password must contain at least one special character'
              }
            >
              <Switch
                checked={settings.passwordRequireSymbols}
                onCheckedChange={(checked) =>
                  updateSetting('passwordRequireSymbols', checked)
                }
              />
            </SettingRow>
          </SettingSection>

          <SettingSection
            title={language === 'nl' ? 'Login Beveiliging' : 'Login Security'}
            description={
              language === 'nl'
                ? 'Bescherm tegen brute-force aanvallen'
                : 'Protect against brute-force attacks'
            }
            icon={Shield}
          >
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{language === 'nl' ? 'Max Login Pogingen' : 'Max Login Attempts'}</Label>
                <Input
                  type="number"
                  value={settings.maxLoginAttempts}
                  onChange={(e) =>
                    updateSetting('maxLoginAttempts', parseInt(e.target.value))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>
                  {language === 'nl' ? 'Lockout Duur (min)' : 'Lockout Duration (min)'}
                </Label>
                <Input
                  type="number"
                  value={settings.lockoutDuration}
                  onChange={(e) =>
                    updateSetting('lockoutDuration', parseInt(e.target.value))
                  }
                />
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <Label>{language === 'nl' ? 'Sessie Timeout (min)' : 'Session Timeout (min)'}</Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[settings.sessionTimeout]}
                  onValueChange={([value]) => updateSetting('sessionTimeout', value)}
                  min={15}
                  max={480}
                  step={15}
                  className="flex-1"
                />
                <span className="w-24 text-right font-medium">
                  {settings.sessionTimeout} min
                </span>
              </div>
            </div>
          </SettingSection>
        </TabsContent>

        {/* Email Settings */}
        <TabsContent value="email" className="space-y-6">
          <SettingSection
            title={language === 'nl' ? 'E-mail Configuratie' : 'Email Configuration'}
            description={
              language === 'nl'
                ? 'Configureer e-mail verzending'
                : 'Configure email sending'
            }
            icon={Mail}
          >
            <div className="space-y-2">
              <Label>{language === 'nl' ? 'E-mail Provider' : 'Email Provider'}</Label>
              <Select
                value={settings.emailProvider}
                onValueChange={(value: SystemSettings['emailProvider']) =>
                  updateSetting('emailProvider', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="smtp">SMTP</SelectItem>
                  <SelectItem value="sendgrid">SendGrid</SelectItem>
                  <SelectItem value="ses">Amazon SES</SelectItem>
                  <SelectItem value="postmark">Postmark</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>{language === 'nl' ? 'Van Adres' : 'From Address'}</Label>
                <Input
                  type="email"
                  value={settings.emailFromAddress}
                  onChange={(e) => updateSetting('emailFromAddress', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>{language === 'nl' ? 'Van Naam' : 'From Name'}</Label>
                <Input
                  value={settings.emailFromName}
                  onChange={(e) => updateSetting('emailFromName', e.target.value)}
                />
              </div>
            </div>
          </SettingSection>
        </TabsContent>

        {/* Storage Settings */}
        <TabsContent value="storage" className="space-y-6">
          <SettingSection
            title={language === 'nl' ? 'Opslag Configuratie' : 'Storage Configuration'}
            description={
              language === 'nl'
                ? 'Configureer bestandsopslag'
                : 'Configure file storage'
            }
            icon={HardDrive}
          >
            <div className="space-y-2">
              <Label>{language === 'nl' ? 'Opslag Provider' : 'Storage Provider'}</Label>
              <Select
                value={settings.storageProvider}
                onValueChange={(value: SystemSettings['storageProvider']) =>
                  updateSetting('storageProvider', value)
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="local">Local Storage</SelectItem>
                  <SelectItem value="s3">Amazon S3</SelectItem>
                  <SelectItem value="gcs">Google Cloud Storage</SelectItem>
                  <SelectItem value="azure">Azure Blob Storage</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>
                {language === 'nl' ? 'Max Upload Grootte (MB)' : 'Max Upload Size (MB)'}
              </Label>
              <div className="flex items-center gap-4">
                <Slider
                  value={[settings.maxUploadSize]}
                  onValueChange={([value]) => updateSetting('maxUploadSize', value)}
                  min={5}
                  max={500}
                  step={5}
                  className="flex-1"
                />
                <span className="w-16 text-right font-medium">
                  {settings.maxUploadSize} MB
                </span>
              </div>
            </div>
            <div className="space-y-2">
              <Label>
                {language === 'nl' ? 'Toegestane Bestandstypen' : 'Allowed File Types'}
              </Label>
              <Input
                value={settings.allowedFileTypes.join(', ')}
                onChange={(e) =>
                  updateSetting(
                    'allowedFileTypes',
                    e.target.value.split(',').map((t) => t.trim())
                  )
                }
                placeholder="pdf, doc, docx, xls, xlsx, png, jpg"
              />
              <p className="text-xs text-muted-foreground">
                {language === 'nl'
                  ? 'Gescheiden door komma\'s'
                  : 'Separated by commas'}
              </p>
            </div>
          </SettingSection>
        </TabsContent>

        {/* AI Settings */}
        <TabsContent value="ai" className="space-y-6">
          <SettingSection
            title={language === 'nl' ? 'AI Configuratie' : 'AI Configuration'}
            description={
              language === 'nl'
                ? 'Configureer AI-assistentie functies'
                : 'Configure AI assistance features'
            }
            icon={Zap}
          >
            <SettingRow
              label={language === 'nl' ? 'AI Inschakelen' : 'Enable AI'}
              description={
                language === 'nl'
                  ? 'Schakel AI-functies in voor alle gebruikers'
                  : 'Enable AI features for all users'
              }
            >
              <Switch
                checked={settings.aiEnabled}
                onCheckedChange={(checked) => updateSetting('aiEnabled', checked)}
              />
            </SettingRow>
            <Separator />
            {settings.aiEnabled && (
              <>
                <div className="space-y-2">
                  <Label>AI Provider</Label>
                  <Select
                    value={settings.aiProvider}
                    onValueChange={(value: SystemSettings['aiProvider']) =>
                      updateSetting('aiProvider', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="openai">OpenAI</SelectItem>
                      <SelectItem value="anthropic">Anthropic (Claude)</SelectItem>
                      <SelectItem value="azure_openai">Azure OpenAI</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Model</Label>
                  <Select
                    value={settings.aiModel}
                    onValueChange={(value) => updateSetting('aiModel', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {settings.aiProvider === 'openai' && (
                        <>
                          <SelectItem value="gpt-4-turbo">GPT-4 Turbo</SelectItem>
                          <SelectItem value="gpt-4">GPT-4</SelectItem>
                          <SelectItem value="gpt-3.5-turbo">GPT-3.5 Turbo</SelectItem>
                        </>
                      )}
                      {settings.aiProvider === 'anthropic' && (
                        <>
                          <SelectItem value="claude-3-opus">Claude 3 Opus</SelectItem>
                          <SelectItem value="claude-3-sonnet">Claude 3 Sonnet</SelectItem>
                          <SelectItem value="claude-3-haiku">Claude 3 Haiku</SelectItem>
                        </>
                      )}
                      {settings.aiProvider === 'azure_openai' && (
                        <>
                          <SelectItem value="gpt-4-deployment">GPT-4 (Deployment)</SelectItem>
                          <SelectItem value="gpt-35-deployment">GPT-3.5 (Deployment)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Max Tokens</Label>
                  <div className="flex items-center gap-4">
                    <Slider
                      value={[settings.aiMaxTokens]}
                      onValueChange={([value]) => updateSetting('aiMaxTokens', value)}
                      min={1024}
                      max={32000}
                      step={1024}
                      className="flex-1"
                    />
                    <span className="w-20 text-right font-medium">
                      {settings.aiMaxTokens.toLocaleString()}
                    </span>
                  </div>
                </div>
              </>
            )}
          </SettingSection>
        </TabsContent>
      </Tabs>
    </div>
  );
}
