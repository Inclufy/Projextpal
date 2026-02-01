// ============================================================
// ADMIN PORTAL - AUDIT LOGS
// System-wide activity logging and monitoring
// ============================================================

import { useState, useEffect } from 'react';
import {
  FileText,
  Search,
  Filter,
  Download,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  User,
  Building2,
  Calendar,
  Clock,
  Globe,
  Monitor,
  Activity,
  AlertTriangle,
  CheckCircle,
  Info,
  XCircle,
  Eye,
  Trash2,
  Edit,
  Plus,
  LogIn,
  LogOut,
  Shield,
  Key,
  Settings,
  Database,
  Zap,
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';

import { useLanguage } from '@/contexts/LanguageContext';
import type { AuditLog, AuditAction } from './admin.types';
import { formatDateTime, getInitials } from './admin.types';

// =========================
// ACTION CONFIG
// =========================

interface ActionConfig {
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  label: string;
  labelNL: string;
}

const actionConfig: Record<AuditAction, ActionConfig> = {
  CREATE: {
    icon: Plus,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Created',
    labelNL: 'Aangemaakt',
  },
  UPDATE: {
    icon: Edit,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    label: 'Updated',
    labelNL: 'Bijgewerkt',
  },
  DELETE: {
    icon: Trash2,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Deleted',
    labelNL: 'Verwijderd',
  },
  LOGIN: {
    icon: LogIn,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    label: 'Logged In',
    labelNL: 'Ingelogd',
  },
  LOGOUT: {
    icon: LogOut,
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
    label: 'Logged Out',
    labelNL: 'Uitgelogd',
  },
  EXPORT: {
    icon: Download,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    label: 'Exported',
    labelNL: 'Geëxporteerd',
  },
  IMPORT: {
    icon: Database,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    label: 'Imported',
    labelNL: 'Geïmporteerd',
  },
  ENABLE: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Enabled',
    labelNL: 'Ingeschakeld',
  },
  DISABLE: {
    icon: XCircle,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    label: 'Disabled',
    labelNL: 'Uitgeschakeld',
  },
  SUSPEND: {
    icon: AlertTriangle,
    color: 'text-red-600',
    bgColor: 'bg-red-100',
    label: 'Suspended',
    labelNL: 'Geschorst',
  },
  ACTIVATE: {
    icon: Zap,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    label: 'Activated',
    labelNL: 'Geactiveerd',
  },
};

// =========================
// LOG DETAIL DIALOG
// =========================

interface LogDetailDialogProps {
  log: AuditLog | null;
  open: boolean;
  onClose: () => void;
}

const LogDetailDialog: React.FC<LogDetailDialogProps> = ({ log, open, onClose }) => {
  const { language } = useLanguage();

  if (!log) return null;

  const config = actionConfig[log.action];
  const ActionIcon = config?.icon || Activity;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className={`p-2 rounded-lg ${config?.bgColor || 'bg-gray-100'}`}>
              <ActionIcon className={`h-5 w-5 ${config?.color || 'text-gray-600'}`} />
            </div>
            {language === 'nl' ? 'Audit Log Details' : 'Audit Log Details'}
          </DialogTitle>
          <DialogDescription>
            {formatDateTime(log.createdAt)}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* User Info */}
          <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
            <Avatar className="h-12 w-12">
              <AvatarFallback>{getInitials(log.userName || 'System')}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-medium">{log.userName || 'System'}</p>
              <p className="text-sm text-muted-foreground">{log.userEmail}</p>
            </div>
          </div>

          {/* Action Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {language === 'nl' ? 'Actie' : 'Action'}
              </p>
              <Badge className={`${config?.bgColor} ${config?.color}`}>
                {language === 'nl' ? config?.labelNL : config?.label}
              </Badge>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                {language === 'nl' ? 'Resource' : 'Resource'}
              </p>
              <p className="font-medium">{log.resource}</p>
            </div>
            {log.resourceId && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">Resource ID</p>
                <code className="text-sm bg-muted px-2 py-1 rounded">{log.resourceId}</code>
              </div>
            )}
            {log.tenantName && (
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  {language === 'nl' ? 'Organisatie' : 'Organization'}
                </p>
                <p className="font-medium">{log.tenantName}</p>
              </div>
            )}
          </div>

          <Separator />

          {/* Technical Details */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Globe className="h-3 w-3" /> IP Address
              </p>
              <code className="text-sm">{log.ipAddress || '-'}</code>
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <Monitor className="h-3 w-3" /> User Agent
              </p>
              <p className="text-sm truncate" title={log.userAgent}>
                {log.userAgent || '-'}
              </p>
            </div>
          </div>

          {/* Changes */}
          {(log.previousValue || log.newValue) && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="font-medium">
                  {language === 'nl' ? 'Wijzigingen' : 'Changes'}
                </p>
                <div className="grid grid-cols-2 gap-4">
                  {log.previousValue && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {language === 'nl' ? 'Vorige Waarde' : 'Previous Value'}
                      </p>
                      <pre className="text-xs bg-red-50 border border-red-200 rounded p-3 overflow-auto max-h-40">
                        {JSON.stringify(log.previousValue, null, 2)}
                      </pre>
                    </div>
                  )}
                  {log.newValue && (
                    <div className="space-y-2">
                      <p className="text-sm text-muted-foreground">
                        {language === 'nl' ? 'Nieuwe Waarde' : 'New Value'}
                      </p>
                      <pre className="text-xs bg-green-50 border border-green-200 rounded p-3 overflow-auto max-h-40">
                        {JSON.stringify(log.newValue, null, 2)}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Additional Details */}
          {log.details && Object.keys(log.details).length > 0 && (
            <>
              <Separator />
              <div className="space-y-3">
                <p className="font-medium">
                  {language === 'nl' ? 'Extra Details' : 'Additional Details'}
                </p>
                <pre className="text-xs bg-muted rounded p-3 overflow-auto max-h-40">
                  {JSON.stringify(log.details, null, 2)}
                </pre>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

// =========================
// MAIN AUDIT LOGS COMPONENT
// =========================

export default function AuditLogs() {
  const { language } = useLanguage();

  // State
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [detailDialogOpen, setDetailDialogOpen] = useState(false);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceFilter, setResourceFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<string>('7days');
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);

  // Mock data
  useEffect(() => {
    const mockLogs: AuditLog[] = [
      {
        id: '1',
        userId: '1',
        userName: 'Sami Loukile',
        userEmail: 'sami@projextpal.com',
        action: 'UPDATE',
        resource: 'pricing_plan',
        resourceId: 'plan_professional',
        details: { field: 'price', change: '€29 → €35' },
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
        createdAt: '2025-12-16T11:30:00Z',
      },
      {
        id: '2',
        userId: '2',
        userName: 'Emma van Berg',
        userEmail: 'emma@techstart.nl',
        tenantId: '1',
        tenantName: 'TechStart BV',
        action: 'CREATE',
        resource: 'project',
        resourceId: 'proj_abc123',
        newValue: { name: 'Q1 Marketing Campaign', status: 'planning' },
        ipAddress: '10.0.0.45',
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        createdAt: '2025-12-16T11:15:00Z',
      },
      {
        id: '3',
        userId: '1',
        userName: 'Sami Loukile',
        userEmail: 'sami@projextpal.com',
        action: 'SUSPEND',
        resource: 'user',
        resourceId: 'user_xyz789',
        details: { reason: 'Violation of terms of service' },
        previousValue: { status: 'ACTIVE' },
        newValue: { status: 'SUSPENDED' },
        ipAddress: '192.168.1.1',
        createdAt: '2025-12-16T10:45:00Z',
      },
      {
        id: '4',
        userId: '3',
        userName: 'Lucas Jansen',
        userEmail: 'lucas@agency.nl',
        tenantId: '2',
        tenantName: 'Creative Agency',
        action: 'LOGIN',
        resource: 'session',
        ipAddress: '85.147.23.91',
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0)',
        createdAt: '2025-12-16T10:30:00Z',
      },
      {
        id: '5',
        userId: '1',
        userName: 'Sami Loukile',
        userEmail: 'sami@projextpal.com',
        action: 'ENABLE',
        resource: 'integration',
        resourceId: 'int_slack',
        details: { integrationName: 'Slack' },
        ipAddress: '192.168.1.1',
        createdAt: '2025-12-16T10:00:00Z',
      },
      {
        id: '6',
        userId: '4',
        userName: 'Sophie de Groot',
        userEmail: 'sophie@startup.io',
        tenantId: '3',
        tenantName: 'InnovateTech',
        action: 'DELETE',
        resource: 'project',
        resourceId: 'proj_old123',
        previousValue: { name: 'Old Project', status: 'completed' },
        ipAddress: '172.16.0.100',
        createdAt: '2025-12-16T09:30:00Z',
      },
      {
        id: '7',
        userId: '1',
        userName: 'Sami Loukile',
        userEmail: 'sami@projextpal.com',
        action: 'EXPORT',
        resource: 'users',
        details: { format: 'CSV', count: 1247 },
        ipAddress: '192.168.1.1',
        createdAt: '2025-12-16T09:00:00Z',
      },
      {
        id: '8',
        userId: '5',
        userName: 'Thomas Bakker',
        userEmail: 'thomas@enterprise.nl',
        tenantId: '3',
        tenantName: 'Enterprise Solutions',
        action: 'UPDATE',
        resource: 'organization',
        details: { field: 'settings.enforceSSO', change: 'false → true' },
        previousValue: { enforceSSO: false },
        newValue: { enforceSSO: true },
        ipAddress: '192.168.100.50',
        createdAt: '2025-12-16T08:45:00Z',
      },
      {
        id: '9',
        userId: '2',
        userName: 'Emma van Berg',
        userEmail: 'emma@techstart.nl',
        action: 'LOGOUT',
        resource: 'session',
        ipAddress: '10.0.0.45',
        createdAt: '2025-12-15T18:00:00Z',
      },
      {
        id: '10',
        userId: '1',
        userName: 'Sami Loukile',
        userEmail: 'sami@projextpal.com',
        action: 'CREATE',
        resource: 'tenant',
        resourceId: 'tenant_new456',
        newValue: { name: 'New Customer Corp', plan: 'professional' },
        ipAddress: '192.168.1.1',
        createdAt: '2025-12-15T16:30:00Z',
      },
    ];

    setTimeout(() => {
      setLogs(mockLogs);
      setLoading(false);
    }, 800);
  }, []);

  // Filter logs
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      log.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.userEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.resourceId?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesAction = actionFilter === 'all' || log.action === actionFilter;
    const matchesResource = resourceFilter === 'all' || log.resource === resourceFilter;
    return matchesSearch && matchesAction && matchesResource;
  });

  // Get unique resources for filter
  const uniqueResources = [...new Set(logs.map((log) => log.resource))];

  // Stats
  const todayLogs = logs.filter(
    (log) => new Date(log.createdAt).toDateString() === new Date().toDateString()
  ).length;

  const handleViewLog = (log: AuditLog) => {
    setSelectedLog(log);
    setDetailDialogOpen(true);
  };

  const handleExport = () => {
    // Export functionality
    console.log('Exporting logs...');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <FileText className="h-6 w-6 text-purple-600" />
            {language === 'nl' ? 'Audit Logs' : 'Audit Logs'}
          </h1>
          <p className="text-muted-foreground">
            {language === 'nl'
              ? 'Bekijk alle systeemactiviteiten en wijzigingen'
              : 'View all system activities and changes'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setLoading(true)}>
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            {language === 'nl' ? 'Vernieuwen' : 'Refresh'}
          </Button>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Download className="mr-2 h-4 w-4" />
            {language === 'nl' ? 'Exporteren' : 'Export'}
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'nl' ? 'Totaal Logs' : 'Total Logs'}
                </p>
                <p className="text-2xl font-bold">{logs.length.toLocaleString()}</p>
              </div>
              <FileText className="h-8 w-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'nl' ? 'Vandaag' : 'Today'}
                </p>
                <p className="text-2xl font-bold">{todayLogs}</p>
              </div>
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'nl' ? 'Logins' : 'Logins'}
                </p>
                <p className="text-2xl font-bold">
                  {logs.filter((l) => l.action === 'LOGIN').length}
                </p>
              </div>
              <LogIn className="h-8 w-8 text-purple-400" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  {language === 'nl' ? 'Wijzigingen' : 'Changes'}
                </p>
                <p className="text-2xl font-bold">
                  {logs.filter((l) => ['CREATE', 'UPDATE', 'DELETE'].includes(l.action)).length}
                </p>
              </div>
              <Edit className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={language === 'nl' ? 'Zoeken...' : 'Search logs...'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <Select value={actionFilter} onValueChange={setActionFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder={language === 'nl' ? 'Actie' : 'Action'} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'nl' ? 'Alle Acties' : 'All Actions'}
                  </SelectItem>
                  {Object.entries(actionConfig).map(([key, config]) => (
                    <SelectItem key={key} value={key}>
                      {language === 'nl' ? config.labelNL : config.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={resourceFilter} onValueChange={setResourceFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Resource" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {language === 'nl' ? 'Alle Resources' : 'All Resources'}
                  </SelectItem>
                  {uniqueResources.map((resource) => (
                    <SelectItem key={resource} value={resource}>
                      {resource}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">
                    {language === 'nl' ? 'Vandaag' : 'Today'}
                  </SelectItem>
                  <SelectItem value="7days">
                    {language === 'nl' ? 'Laatste 7 dagen' : 'Last 7 days'}
                  </SelectItem>
                  <SelectItem value="30days">
                    {language === 'nl' ? 'Laatste 30 dagen' : 'Last 30 days'}
                  </SelectItem>
                  <SelectItem value="90days">
                    {language === 'nl' ? 'Laatste 90 dagen' : 'Last 90 days'}
                  </SelectItem>
                  <SelectItem value="all">
                    {language === 'nl' ? 'Alles' : 'All time'}
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[180px]">
                  {language === 'nl' ? 'Tijd' : 'Time'}
                </TableHead>
                <TableHead>{language === 'nl' ? 'Gebruiker' : 'User'}</TableHead>
                <TableHead>{language === 'nl' ? 'Actie' : 'Action'}</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>{language === 'nl' ? 'Organisatie' : 'Organization'}</TableHead>
                <TableHead>IP</TableHead>
                <TableHead className="text-right">
                  {language === 'nl' ? 'Details' : 'Details'}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 10 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell>
                      <div className="h-4 w-32 animate-pulse rounded bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
                        <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="h-5 w-20 animate-pulse rounded bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-24 animate-pulse rounded bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="h-4 w-20 animate-pulse rounded bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="h-8 w-8 animate-pulse rounded bg-muted ml-auto" />
                    </TableCell>
                  </TableRow>
                ))
              ) : filteredLogs.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    {language === 'nl' ? 'Geen logs gevonden' : 'No logs found'}
                  </TableCell>
                </TableRow>
              ) : (
                filteredLogs.map((log) => {
                  const config = actionConfig[log.action];
                  const ActionIcon = config?.icon || Activity;

                  return (
                    <TableRow key={log.id} className="cursor-pointer hover:bg-muted/50">
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          {formatDateTime(log.createdAt)}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Avatar className="h-8 w-8">
                            <AvatarFallback className="text-xs">
                              {getInitials(log.userName || 'S')}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="text-sm font-medium">{log.userName}</p>
                            <p className="text-xs text-muted-foreground">{log.userEmail}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={`${config?.bgColor} ${config?.color} border-0`}
                        >
                          <ActionIcon className="h-3 w-3 mr-1" />
                          {language === 'nl' ? config?.labelNL : config?.label}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-muted px-2 py-1 rounded">
                          {log.resource}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {log.tenantName || '-'}
                      </TableCell>
                      <TableCell>
                        <code className="text-xs">{log.ipAddress || '-'}</code>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleViewLog(log)}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-muted-foreground">
              {language === 'nl'
                ? `${filteredLogs.length} van ${logs.length} logs`
                : `${filteredLogs.length} of ${logs.length} logs`}
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" disabled={page === 1}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm">
                {language === 'nl' ? 'Pagina' : 'Page'} {page}
              </span>
              <Button variant="outline" size="sm">
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <LogDetailDialog
        log={selectedLog}
        open={detailDialogOpen}
        onClose={() => setDetailDialogOpen(false)}
      />
    </div>
  );
}
