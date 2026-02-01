// ============================================================
// ADMIN PORTAL - INTEGRATIONS MANAGEMENT
// Manage global integrations and connectors
// ============================================================

import { useState, useEffect } from 'react';
import {
  Puzzle,
  Search,
  Plus,
  MoreVertical,
  Edit,
  Trash2,
  Eye,
  Settings,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  Zap,
  Shield,
  Lock,
  Unlock,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
  Key,
  Link,
  Unlink,
  Star,
  Sparkles,
  Cloud,
  MessageSquare,
  Calendar,
  CreditCard,
  BarChart3,
  Database,
  FileText,
  Users,
  Slack,
  Github,
  Send,
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import type { Integration, IntegrationCategory, IntegrationStatus } from './admin.types';
import { getIntegrationCategoryColor, getIntegrationStatusColor } from './admin.types';

// =========================
// INTEGRATION ICONS MAP
// =========================

const integrationIcons: Record<string, React.ComponentType<{ className?: string }>> = {
  slack: Slack,
  github: Github,
  jira: Puzzle,
  azure_ad: Shield,
  google: Globe,
  microsoft: Cloud,
  stripe: CreditCard,
  openai: Sparkles,
  s3: Database,
  calendar: Calendar,
  email: Send,
  analytics: BarChart3,
  default: Puzzle,
};

// =========================
// INTEGRATION CARD COMPONENT
// =========================

interface IntegrationCardProps {
  integration: Integration;
  onConfigure: () => void;
  onToggle: () => void;
  onView: () => void;
}

const IntegrationCard: React.FC<IntegrationCardProps> = ({
  integration,
  onConfigure,
  onToggle,
  onView,
}) => {
  const { language } = useLanguage();
  const Icon = integrationIcons[integration.icon] || integrationIcons.default;

  const getStatusIcon = () => {
    switch (integration.status) {
      case 'enabled':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'coming_soon':
        return <Clock className="h-4 w-4 text-blue-600" />;
      default:
        return null;
    }
  };

  return (
    <Card className={`transition-all ${
      integration.status === 'enabled' ? 'border-green-200 bg-green-50/30' :
      integration.status === 'error' ? 'border-red-200 bg-red-50/30' :
      integration.status === 'coming_soon' ? 'opacity-60' : ''
    }`}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-lg ${
              integration.status === 'enabled' ? 'bg-green-100' :
              integration.status === 'error' ? 'bg-red-100' :
              'bg-gray-100'
            }`}>
              <Icon className={`h-6 w-6 ${
                integration.status === 'enabled' ? 'text-green-600' :
                integration.status === 'error' ? 'text-red-600' :
                'text-gray-600'
              }`} />
            </div>
            <div>
              <CardTitle className="text-base flex items-center gap-2">
                {integration.name}
                {integration.isBeta && (
                  <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700">
                    Beta
                  </Badge>
                )}
              </CardTitle>
              <CardDescription className="text-xs mt-0.5">
                <Badge variant="outline" className={`text-[10px] ${getIntegrationCategoryColor(integration.category)}`}>
                  {integration.category.replace('_', ' ')}
                </Badge>
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            {integration.status !== 'coming_soon' && (
              <Switch
                checked={integration.status === 'enabled'}
                onCheckedChange={onToggle}
              />
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {language === 'nl' && integration.descriptionNL
            ? integration.descriptionNL
            : integration.description}
        </p>
        
        {/* Feature badges */}
        <div className="flex flex-wrap gap-1 mt-3">
          {integration.isGlobal && (
            <Badge variant="outline" className="text-[10px]">
              <Globe className="h-3 w-3 mr-1" />
              Global
            </Badge>
          )}
          {integration.isPremium && (
            <Badge variant="outline" className="text-[10px] bg-amber-50 text-amber-700">
              <Star className="h-3 w-3 mr-1" />
              Premium
            </Badge>
          )}
          {integration.isEnterprise && (
            <Badge variant="outline" className="text-[10px] bg-purple-50 text-purple-700">
              <Shield className="h-3 w-3 mr-1" />
              Enterprise
            </Badge>
          )}
        </div>
      </CardContent>
      <CardFooter className="pt-0">
        <div className="flex items-center justify-between w-full">
          <div className="text-xs text-muted-foreground">
            {integration.enabledCount !== undefined && (
              <span>{integration.enabledCount} organizations</span>
            )}
          </div>
          <div className="flex gap-2">
            {integration.status === 'coming_soon' ? (
              <Button variant="outline" size="sm" disabled>
                {language === 'nl' ? 'Binnenkort' : 'Coming Soon'}
              </Button>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={onView}>
                  <Eye className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="sm" onClick={onConfigure}>
                  <Settings className="h-4 w-4 mr-1" />
                  {language === 'nl' ? 'Configureren' : 'Configure'}
                </Button>
              </>
            )}
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};

// =========================
// INTEGRATION CONFIG DIALOG
// =========================

interface IntegrationConfigDialogProps {
  integration: Integration | null;
  open: boolean;
  onClose: () => void;
  onSave: (config: Record<string, any>) => void;
}

const IntegrationConfigDialog: React.FC<IntegrationConfigDialogProps> = ({
  integration,
  open,
  onClose,
  onSave,
}) => {
  const { language } = useLanguage();
  const [config, setConfig] = useState<Record<string, any>>({});

  useEffect(() => {
    if (integration) {
      // Initialize with default values
      const defaults: Record<string, any> = {};
      integration.configFields?.forEach(field => {
        defaults[field.key] = '';
      });
      setConfig(defaults);
    }
  }, [integration]);

  if (!integration) return null;

  const Icon = integrationIcons[integration.icon] || integrationIcons.default;

  const renderField = (field: Integration['configFields'][0]) => {
    const label = language === 'nl' && field.labelNL ? field.labelNL : field.label;
    const helpText = language === 'nl' && field.helpTextNL ? field.helpTextNL : field.helpText;

    switch (field.type) {
      case 'toggle':
        return (
          <div key={field.key} className="flex items-center justify-between">
            <div>
              <Label>{label}</Label>
              {helpText && (
                <p className="text-xs text-muted-foreground">{helpText}</p>
              )}
            </div>
            <Switch
              checked={config[field.key] || false}
              onCheckedChange={(checked) => setConfig({ ...config, [field.key]: checked })}
            />
          </div>
        );
      case 'select':
        return (
          <div key={field.key} className="space-y-2">
            <Label>{label} {field.required && <span className="text-red-500">*</span>}</Label>
            <Select
              value={config[field.key] || ''}
              onValueChange={(value) => setConfig({ ...config, [field.key]: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder={field.placeholder} />
              </SelectTrigger>
              <SelectContent>
                {field.options?.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
          </div>
        );
      case 'textarea':
        return (
          <div key={field.key} className="space-y-2">
            <Label>{label} {field.required && <span className="text-red-500">*</span>}</Label>
            <Textarea
              value={config[field.key] || ''}
              onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
              placeholder={field.placeholder}
              rows={4}
            />
            {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
          </div>
        );
      default:
        return (
          <div key={field.key} className="space-y-2">
            <Label>{label} {field.required && <span className="text-red-500">*</span>}</Label>
            <Input
              type={field.type}
              value={config[field.key] || ''}
              onChange={(e) => setConfig({ ...config, [field.key]: e.target.value })}
              placeholder={field.placeholder}
            />
            {helpText && <p className="text-xs text-muted-foreground">{helpText}</p>}
          </div>
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-gray-100">
              <Icon className="h-6 w-6 text-gray-600" />
            </div>
            <div>
              <DialogTitle>{integration.name} Configuration</DialogTitle>
              <DialogDescription>
                {language === 'nl'
                  ? 'Configureer de globale instellingen voor deze integratie'
                  : 'Configure the global settings for this integration'}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* OAuth Info */}
          {integration.requiredScopes && integration.requiredScopes.length > 0 && (
            <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm font-medium text-blue-800 flex items-center gap-2">
                <Shield className="h-4 w-4" />
                {language === 'nl' ? 'Vereiste OAuth Scopes' : 'Required OAuth Scopes'}
              </p>
              <div className="flex flex-wrap gap-1 mt-2">
                {integration.requiredScopes.map(scope => (
                  <Badge key={scope} variant="outline" className="text-xs bg-white">
                    {scope}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Config Fields */}
          {integration.configFields?.map(renderField)}

          {/* No config fields message */}
          {(!integration.configFields || integration.configFields.length === 0) && (
            <div className="text-center py-8 text-muted-foreground">
              <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>{language === 'nl'
                ? 'Geen configuratie vereist voor deze integratie'
                : 'No configuration required for this integration'}
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {language === 'nl' ? 'Annuleren' : 'Cancel'}
          </Button>
          <Button onClick={() => { onSave(config); onClose(); }}>
            {language === 'nl' ? 'Opslaan' : 'Save Configuration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// =========================
// NEW INTEGRATION DIALOG
// =========================

interface NewIntegrationDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (data: Partial<Integration>) => void;
}

const NewIntegrationDialog: React.FC<NewIntegrationDialogProps> = ({
  open,
  onClose,
  onSave,
}) => {
  const { language } = useLanguage();
  const [formData, setFormData] = useState<Partial<Integration>>({
    name: '',
    slug: '',
    description: '',
    category: 'other',
    icon: 'default',
    isGlobal: true,
    isPremium: false,
    isEnterprise: false,
    isBeta: false,
  });

  const handleSubmit = () => {
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {language === 'nl' ? 'Nieuwe Integratie' : 'New Integration'}
          </DialogTitle>
          <DialogDescription>
            {language === 'nl'
              ? 'Voeg een nieuwe integratie toe aan het systeem'
              : 'Add a new integration to the system'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'nl' ? 'Naam' : 'Name'}</Label>
              <Input
                value={formData.name || ''}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Slack"
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input
                value={formData.slug || ''}
                onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
                placeholder="slack"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{language === 'nl' ? 'Beschrijving' : 'Description'}</Label>
            <Textarea
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Connect your Slack workspace..."
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>{language === 'nl' ? 'Categorie' : 'Category'}</Label>
              <Select
                value={formData.category}
                onValueChange={(value: IntegrationCategory) =>
                  setFormData({ ...formData, category: value })
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="authentication">Authentication</SelectItem>
                  <SelectItem value="storage">Storage</SelectItem>
                  <SelectItem value="communication">Communication</SelectItem>
                  <SelectItem value="project_management">Project Management</SelectItem>
                  <SelectItem value="time_tracking">Time Tracking</SelectItem>
                  <SelectItem value="calendar">Calendar</SelectItem>
                  <SelectItem value="payment">Payment</SelectItem>
                  <SelectItem value="analytics">Analytics</SelectItem>
                  <SelectItem value="ai">AI</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Icon</Label>
              <Select
                value={formData.icon}
                onValueChange={(value) => setFormData({ ...formData, icon: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slack">Slack</SelectItem>
                  <SelectItem value="github">GitHub</SelectItem>
                  <SelectItem value="jira">Jira</SelectItem>
                  <SelectItem value="azure_ad">Azure AD</SelectItem>
                  <SelectItem value="google">Google</SelectItem>
                  <SelectItem value="microsoft">Microsoft</SelectItem>
                  <SelectItem value="stripe">Stripe</SelectItem>
                  <SelectItem value="openai">OpenAI</SelectItem>
                  <SelectItem value="default">Default</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <Separator />

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Global</Label>
                <p className="text-xs text-muted-foreground">
                  {language === 'nl' ? 'Beschikbaar voor alle organisaties' : 'Available to all organizations'}
                </p>
              </div>
              <Switch
                checked={formData.isGlobal}
                onCheckedChange={(checked) => setFormData({ ...formData, isGlobal: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Premium</Label>
                <p className="text-xs text-muted-foreground">
                  {language === 'nl' ? 'Alleen voor betaalde plannen' : 'Only for paid plans'}
                </p>
              </div>
              <Switch
                checked={formData.isPremium}
                onCheckedChange={(checked) => setFormData({ ...formData, isPremium: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Enterprise</Label>
                <p className="text-xs text-muted-foreground">
                  {language === 'nl' ? 'Alleen voor enterprise' : 'Enterprise only'}
                </p>
              </div>
              <Switch
                checked={formData.isEnterprise}
                onCheckedChange={(checked) => setFormData({ ...formData, isEnterprise: checked })}
              />
            </div>
            <div className="flex items-center justify-between">
              <div>
                <Label>Beta</Label>
                <p className="text-xs text-muted-foreground">
                  {language === 'nl' ? 'Markeer als beta functie' : 'Mark as beta feature'}
                </p>
              </div>
              <Switch
                checked={formData.isBeta}
                onCheckedChange={(checked) => setFormData({ ...formData, isBeta: checked })}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            {language === 'nl' ? 'Annuleren' : 'Cancel'}
          </Button>
          <Button onClick={handleSubmit}>
            {language === 'nl' ? 'Toevoegen' : 'Add Integration'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

// =========================
// MAIN INTEGRATIONS COMPONENT
// =========================

export default function IntegrationManagement() {
  const { toast } = useToast();
  const { language } = useLanguage();

  // State
  const [loading, setLoading] = useState(true);
  const [integrations, setIntegrations] = useState<Integration[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Dialogs
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [newDialogOpen, setNewDialogOpen] = useState(false);
  const [selectedIntegration, setSelectedIntegration] = useState<Integration | null>(null);

  // Mock data
  useEffect(() => {
    const mockIntegrations: Integration[] = [
      {
        id: '1',
        name: 'Slack',
        slug: 'slack',
        description: 'Send notifications and updates to Slack channels',
        descriptionNL: 'Stuur notificaties en updates naar Slack kanalen',
        category: 'communication',
        status: 'enabled',
        icon: 'slack',
        isGlobal: true,
        isPremium: false,
        isEnterprise: false,
        isBeta: false,
        enabledCount: 45,
        configFields: [
          { key: 'webhook_url', label: 'Webhook URL', type: 'url', required: true, placeholder: 'https://hooks.slack.com/...' },
          { key: 'default_channel', label: 'Default Channel', type: 'text', required: false, placeholder: '#general' },
          { key: 'notifications', label: 'Enable Notifications', type: 'toggle', required: false },
        ],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2025-12-10T10:00:00Z',
      },
      {
        id: '2',
        name: 'Microsoft Azure AD',
        slug: 'azure-ad',
        description: 'Single Sign-On with Azure Active Directory',
        descriptionNL: 'Single Sign-On met Azure Active Directory',
        category: 'authentication',
        status: 'enabled',
        icon: 'azure_ad',
        isGlobal: true,
        isPremium: true,
        isEnterprise: false,
        isBeta: false,
        enabledCount: 28,
        requiredScopes: ['openid', 'profile', 'email', 'User.Read'],
        configFields: [
          { key: 'tenant_id', label: 'Tenant ID', type: 'text', required: true },
          { key: 'client_id', label: 'Client ID', type: 'text', required: true },
          { key: 'client_secret', label: 'Client Secret', type: 'password', required: true },
        ],
        createdAt: '2024-02-01T10:00:00Z',
        updatedAt: '2025-11-20T10:00:00Z',
      },
      {
        id: '3',
        name: 'Jira',
        slug: 'jira',
        description: 'Sync projects and tasks with Atlassian Jira',
        descriptionNL: 'Synchroniseer projecten en taken met Atlassian Jira',
        category: 'project_management',
        status: 'available',
        icon: 'jira',
        isGlobal: true,
        isPremium: true,
        isEnterprise: false,
        isBeta: false,
        enabledCount: 12,
        configFields: [
          { key: 'jira_url', label: 'Jira URL', type: 'url', required: true, placeholder: 'https://yourcompany.atlassian.net' },
          { key: 'api_token', label: 'API Token', type: 'password', required: true },
          { key: 'sync_direction', label: 'Sync Direction', type: 'select', required: true, options: [
            { value: 'bidirectional', label: 'Bidirectional' },
            { value: 'import', label: 'Import Only' },
            { value: 'export', label: 'Export Only' },
          ]},
        ],
        createdAt: '2024-03-10T10:00:00Z',
        updatedAt: '2025-12-01T10:00:00Z',
      },
      {
        id: '4',
        name: 'OpenAI / Claude AI',
        slug: 'ai-assistant',
        description: 'AI-powered project assistance and insights',
        descriptionNL: 'AI-gestuurde project assistentie en inzichten',
        category: 'ai',
        status: 'enabled',
        icon: 'openai',
        isGlobal: true,
        isPremium: false,
        isEnterprise: false,
        isBeta: false,
        enabledCount: 67,
        configFields: [
          { key: 'provider', label: 'AI Provider', type: 'select', required: true, options: [
            { value: 'openai', label: 'OpenAI (GPT-4)' },
            { value: 'anthropic', label: 'Anthropic (Claude)' },
            { value: 'azure_openai', label: 'Azure OpenAI' },
          ]},
          { key: 'api_key', label: 'API Key', type: 'password', required: true },
          { key: 'max_tokens', label: 'Max Tokens', type: 'text', required: false, placeholder: '4096' },
        ],
        createdAt: '2024-04-01T10:00:00Z',
        updatedAt: '2025-12-15T10:00:00Z',
      },
      {
        id: '5',
        name: 'Stripe',
        slug: 'stripe',
        description: 'Payment processing and subscription management',
        descriptionNL: 'Betalingsverwerking en abonnementenbeheer',
        category: 'payment',
        status: 'enabled',
        icon: 'stripe',
        isGlobal: false,
        isPremium: false,
        isEnterprise: false,
        isBeta: false,
        enabledCount: 1,
        configFields: [
          { key: 'publishable_key', label: 'Publishable Key', type: 'text', required: true },
          { key: 'secret_key', label: 'Secret Key', type: 'password', required: true },
          { key: 'webhook_secret', label: 'Webhook Secret', type: 'password', required: true },
        ],
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2025-12-10T10:00:00Z',
      },
      {
        id: '6',
        name: 'Google Calendar',
        slug: 'google-calendar',
        description: 'Sync milestones and deadlines with Google Calendar',
        descriptionNL: 'Synchroniseer mijlpalen en deadlines met Google Calendar',
        category: 'calendar',
        status: 'available',
        icon: 'google',
        isGlobal: true,
        isPremium: false,
        isEnterprise: false,
        isBeta: true,
        enabledCount: 8,
        requiredScopes: ['calendar.readonly', 'calendar.events'],
        configFields: [],
        createdAt: '2024-06-01T10:00:00Z',
        updatedAt: '2025-11-01T10:00:00Z',
      },
      {
        id: '7',
        name: 'SAP Integration',
        slug: 'sap',
        description: 'Enterprise resource planning integration',
        descriptionNL: 'Enterprise resource planning integratie',
        category: 'other',
        status: 'coming_soon',
        icon: 'default',
        isGlobal: true,
        isPremium: false,
        isEnterprise: true,
        isBeta: false,
        configFields: [],
        createdAt: '2025-01-01T10:00:00Z',
        updatedAt: '2025-01-01T10:00:00Z',
      },
      {
        id: '8',
        name: 'Microsoft Teams',
        slug: 'teams',
        description: 'Connect with Microsoft Teams for notifications',
        descriptionNL: 'Verbind met Microsoft Teams voor notificaties',
        category: 'communication',
        status: 'error',
        icon: 'microsoft',
        isGlobal: true,
        isPremium: false,
        isEnterprise: false,
        isBeta: false,
        enabledCount: 15,
        configFields: [
          { key: 'webhook_url', label: 'Webhook URL', type: 'url', required: true },
        ],
        createdAt: '2024-05-01T10:00:00Z',
        updatedAt: '2025-12-14T10:00:00Z',
      },
    ];

    setTimeout(() => {
      setIntegrations(mockIntegrations);
      setLoading(false);
    }, 1000);
  }, []);

  // Handlers
  const handleConfigure = (integration: Integration) => {
    setSelectedIntegration(integration);
    setConfigDialogOpen(true);
  };

  const handleToggle = (integration: Integration) => {
    const newStatus = integration.status === 'enabled' ? 'disabled' : 'enabled';
    toast({
      title: language === 'nl' ? 'Succesvol' : 'Success',
      description: newStatus === 'enabled'
        ? language === 'nl' ? `${integration.name} ingeschakeld` : `${integration.name} enabled`
        : language === 'nl' ? `${integration.name} uitgeschakeld` : `${integration.name} disabled`,
    });
  };

  const handleSaveConfig = (config: Record<string, any>) => {
    toast({
      title: language === 'nl' ? 'Succesvol' : 'Success',
      description: language === 'nl'
        ? 'Configuratie opgeslagen'
        : 'Configuration saved',
    });
  };

  const handleAddIntegration = (data: Partial<Integration>) => {
    toast({
      title: language === 'nl' ? 'Succesvol' : 'Success',
      description: language === 'nl'
        ? 'Integratie toegevoegd'
        : 'Integration added',
    });
  };

  // Filter integrations
  const filteredIntegrations = integrations.filter((integration) => {
    const matchesSearch =
      integration.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      integration.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || integration.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || integration.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // Group by category
  const groupedIntegrations = filteredIntegrations.reduce((acc, integration) => {
    const category = integration.category;
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(integration);
    return acc;
  }, {} as Record<string, Integration[]>);

  const categoryLabels: Record<IntegrationCategory, { en: string; nl: string }> = {
    authentication: { en: 'Authentication', nl: 'Authenticatie' },
    storage: { en: 'Storage', nl: 'Opslag' },
    communication: { en: 'Communication', nl: 'Communicatie' },
    project_management: { en: 'Project Management', nl: 'Projectbeheer' },
    time_tracking: { en: 'Time Tracking', nl: 'Tijdregistratie' },
    calendar: { en: 'Calendar', nl: 'Kalender' },
    payment: { en: 'Payment', nl: 'Betaling' },
    analytics: { en: 'Analytics', nl: 'Analyse' },
    ai: { en: 'AI & Automation', nl: 'AI & Automatisering' },
    other: { en: 'Other', nl: 'Overig' },
  };

  // Stats
  const enabledCount = integrations.filter(i => i.status === 'enabled').length;
  const errorCount = integrations.filter(i => i.status === 'error').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Puzzle className="h-6 w-6 text-purple-600" />
            {language === 'nl' ? 'Integratiebeheer' : 'Integration Management'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'nl'
              ? 'Beheer globale integraties en connectoren'
              : 'Manage global integrations and connectors'}
          </p>
        </div>
        <Button onClick={() => setNewDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {language === 'nl' ? 'Nieuwe Integratie' : 'New Integration'}
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'nl' ? 'Totaal' : 'Total'}
                </p>
                <p className="text-2xl font-bold">{integrations.length}</p>
              </div>
              <Puzzle className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'nl' ? 'Actief' : 'Active'}
                </p>
                <p className="text-2xl font-bold text-green-600">{enabledCount}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'nl' ? 'Fouten' : 'Errors'}
                </p>
                <p className="text-2xl font-bold text-red-600">{errorCount}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'nl' ? 'Categorieën' : 'Categories'}
                </p>
                <p className="text-2xl font-bold">{Object.keys(groupedIntegrations).length}</p>
              </div>
              <Layers className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder={language === 'nl' ? 'Zoeken...' : 'Search integrations...'}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder={language === 'nl' ? 'Categorie' : 'Category'} />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'nl' ? 'Alle Categorieën' : 'All Categories'}</SelectItem>
            {Object.entries(categoryLabels).map(([key, label]) => (
              <SelectItem key={key} value={key}>
                {language === 'nl' ? label.nl : label.en}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{language === 'nl' ? 'Alle Status' : 'All Status'}</SelectItem>
            <SelectItem value="enabled">{language === 'nl' ? 'Ingeschakeld' : 'Enabled'}</SelectItem>
            <SelectItem value="available">{language === 'nl' ? 'Beschikbaar' : 'Available'}</SelectItem>
            <SelectItem value="disabled">{language === 'nl' ? 'Uitgeschakeld' : 'Disabled'}</SelectItem>
            <SelectItem value="error">{language === 'nl' ? 'Fout' : 'Error'}</SelectItem>
            <SelectItem value="coming_soon">{language === 'nl' ? 'Binnenkort' : 'Coming Soon'}</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Integrations Grid */}
      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-muted" />
                  <div className="space-y-2">
                    <div className="h-4 w-24 rounded bg-muted" />
                    <div className="h-3 w-16 rounded bg-muted" />
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-3">
                <div className="h-10 w-full rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : Object.keys(groupedIntegrations).length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            <Puzzle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>{language === 'nl' ? 'Geen integraties gevonden' : 'No integrations found'}</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {Object.entries(groupedIntegrations).map(([category, items]) => (
            <div key={category}>
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                {language === 'nl'
                  ? categoryLabels[category as IntegrationCategory]?.nl
                  : categoryLabels[category as IntegrationCategory]?.en}
                <Badge variant="secondary" className="text-xs">
                  {items.length}
                </Badge>
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {items.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onConfigure={() => handleConfigure(integration)}
                    onToggle={() => handleToggle(integration)}
                    onView={() => handleConfigure(integration)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Dialogs */}
      <IntegrationConfigDialog
        integration={selectedIntegration}
        open={configDialogOpen}
        onClose={() => setConfigDialogOpen(false)}
        onSave={handleSaveConfig}
      />

      <NewIntegrationDialog
        open={newDialogOpen}
        onClose={() => setNewDialogOpen(false)}
        onSave={handleAddIntegration}
      />
    </div>
  );
}

// Add missing Layers import
const Layers = ({ className }: { className?: string }) => (
  <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <polygon points="12 2 2 7 12 12 22 7 12 2" />
    <polyline points="2 17 12 22 22 17" />
    <polyline points="2 12 12 17 22 12" />
  </svg>
);
