// ============================================================
// MONITORING DASHBOARD
// Real-time system monitoring for the Inclufy infrastructure.
// Fetches data from the monitoring agent API (port 8555).
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  HardDrive,
  Heart,
  MemoryStick,
  RefreshCw,
  Server,
  Shield,
  XCircle,
  Wrench,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  Wifi,
  WifiOff,
} from 'lucide-react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

// ── API Base URL ──────────────────────────────────────────────
const MONITOR_API = import.meta.env.VITE_MONITOR_URL || 'http://localhost:8555';

async function fetchMonitor<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${MONITOR_API}${endpoint}`);
  if (!res.ok) throw new Error(`Monitor API ${res.status}`);
  return res.json();
}

// ── Types ─────────────────────────────────────────────────────

interface AppStatus {
  name: string;
  type: string;
  status: string;
  response_time_ms: number | null;
  last_check: string | null;
  uptime_24h: number;
  avg_response_1h: number;
}

interface SystemMetrics {
  timestamp: string;
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  disk_free_gb: number;
  load_avg: string;
}

interface StatusResponse {
  overall_status: string;
  timestamp: string;
  apps: AppStatus[];
  active_alerts_count: number;
  system: SystemMetrics | null;
}

interface Alert {
  id: number;
  timestamp: string;
  app_name: string;
  severity: string;
  message: string;
  details: string | null;
  resolved: number;
  resolved_at: string | null;
}

interface RecoveryAction {
  id: number;
  timestamp: string;
  app_name: string;
  action: string;
  success: number;
  details: string | null;
}

interface SystemHistory {
  timestamp: string;
  cpu_percent: number;
  memory_percent: number;
  disk_percent: number;
  disk_free_gb: number;
}

interface DailySummary {
  total_checks: number;
  failed_checks: number;
  total_alerts: number;
  recovery_attempts: number;
  recovery_successes: number;
  app_uptimes: Record<string, number>;
}

// ── Helpers ───────────────────────────────────────────────────

function statusColor(status: string): string {
  switch (status) {
    case 'healthy': return 'text-emerald-500';
    case 'slow':
    case 'degraded':
    case 'warning': return 'text-amber-500';
    case 'down':
    case 'dead':
    case 'timeout':
    case 'error':
    case 'critical':
    case 'unhealthy': return 'text-red-500';
    default: return 'text-muted-foreground';
  }
}

function statusBadge(status: string) {
  const variants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
    healthy: 'default',
    slow: 'secondary',
    degraded: 'secondary',
    warning: 'secondary',
    down: 'destructive',
    dead: 'destructive',
    timeout: 'destructive',
    error: 'destructive',
    critical: 'destructive',
    unhealthy: 'destructive',
  };
  return variants[status] || 'outline';
}

function severityBadge(sev: string) {
  switch (sev) {
    case 'CRITICAL':
    case 'EMERGENCY': return 'destructive' as const;
    case 'WARNING': return 'secondary' as const;
    case 'RESOLVED': return 'default' as const;
    default: return 'outline' as const;
  }
}

function formatTime(ts: string | null) {
  if (!ts) return '-';
  try {
    const d = new Date(ts.includes('T') ? ts : ts + 'Z');
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  } catch {
    return ts;
  }
}

function formatDateTime(ts: string | null) {
  if (!ts) return '-';
  try {
    const d = new Date(ts.includes('T') ? ts : ts + 'Z');
    return d.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
  } catch {
    return ts;
  }
}

function chartTimeLabel(ts: string) {
  try {
    const d = new Date(ts.includes('T') ? ts : ts + 'Z');
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  } catch {
    return ts;
  }
}

function uptimeColor(pct: number) {
  if (pct >= 99.5) return 'text-emerald-500';
  if (pct >= 95) return 'text-amber-500';
  return 'text-red-500';
}

function resourceColor(pct: number) {
  if (pct >= 95) return 'bg-red-500';
  if (pct >= 80) return 'bg-amber-500';
  return 'bg-emerald-500';
}

// ── Component ─────────────────────────────────────────────────

export default function MonitoringDashboard() {
  const [autoRefresh, setAutoRefresh] = useState(true);

  // ─ Queries ──────────────────
  const {
    data: status,
    isLoading: statusLoading,
    error: statusError,
    refetch: refetchStatus,
  } = useQuery<StatusResponse>({
    queryKey: ['monitor-status'],
    queryFn: () => fetchMonitor('/api/status'),
    refetchInterval: autoRefresh ? 15_000 : false,
    retry: 2,
  });

  const { data: alerts } = useQuery<Alert[]>({
    queryKey: ['monitor-alerts'],
    queryFn: () => fetchMonitor('/api/alerts'),
    refetchInterval: autoRefresh ? 30_000 : false,
    retry: 1,
  });

  const { data: recovery } = useQuery<RecoveryAction[]>({
    queryKey: ['monitor-recovery'],
    queryFn: () => fetchMonitor('/api/recovery'),
    refetchInterval: autoRefresh ? 30_000 : false,
    retry: 1,
  });

  const { data: systemHistory } = useQuery<SystemHistory[]>({
    queryKey: ['monitor-system-history'],
    queryFn: () => fetchMonitor('/api/system/history'),
    refetchInterval: autoRefresh ? 60_000 : false,
    retry: 1,
  });

  const { data: summary } = useQuery<DailySummary>({
    queryKey: ['monitor-summary'],
    queryFn: () => fetchMonitor('/api/summary'),
    refetchInterval: autoRefresh ? 60_000 : false,
    retry: 1,
  });

  // ─ Loading / Error ──────────
  if (statusLoading) {
    return (
      <div className="flex h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        <span className="ml-3 text-muted-foreground">Connecting to monitoring agent...</span>
      </div>
    );
  }

  if (statusError) {
    return (
      <div className="flex h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <WifiOff className="h-12 w-12 text-red-500" />
        <h2 className="text-xl font-semibold">Cannot reach monitoring agent</h2>
        <p className="max-w-md text-muted-foreground">
          The monitoring API at <code className="rounded bg-muted px-1.5 py-0.5 text-sm">{MONITOR_API}</code> is
          unreachable. Make sure the monitoring container is running.
        </p>
        <Button onClick={() => refetchStatus()} variant="outline" className="gap-2">
          <RefreshCw className="h-4 w-4" /> Retry
        </Button>
      </div>
    );
  }

  const overallStatus = status?.overall_status || 'unknown';
  const apps = status?.apps || [];
  const sys = status?.system;
  const activeAlerts = alerts?.filter(a => !a.resolved) || [];

  // ─ Render ───────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">System Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time infrastructure health for ProjeXtPal
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-1.5"
          >
            {autoRefresh ? <Wifi className="h-3.5 w-3.5" /> : <WifiOff className="h-3.5 w-3.5" />}
            {autoRefresh ? 'Live' : 'Paused'}
          </Button>
          <Button variant="outline" size="sm" onClick={() => refetchStatus()} className="gap-1.5">
            <RefreshCw className="h-3.5 w-3.5" /> Refresh
          </Button>
        </div>
      </div>

      {/* Overall Status Banner */}
      <Card className={
        overallStatus === 'healthy'
          ? 'border-emerald-200 bg-emerald-50 dark:border-emerald-900 dark:bg-emerald-950'
          : overallStatus === 'degraded'
            ? 'border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950'
            : 'border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950'
      }>
        <CardContent className="flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            {overallStatus === 'healthy' ? (
              <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            ) : overallStatus === 'degraded' ? (
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            ) : (
              <XCircle className="h-8 w-8 text-red-500" />
            )}
            <div>
              <p className="text-lg font-semibold">
                {overallStatus === 'healthy'
                  ? 'All Systems Operational'
                  : overallStatus === 'degraded'
                    ? 'Some Systems Degraded'
                    : 'Issues Detected'}
              </p>
              <p className="text-sm text-muted-foreground">
                Last checked: {formatTime(status?.timestamp || null)}
                {activeAlerts.length > 0 && ` \u2022 ${activeAlerts.length} active alert${activeAlerts.length > 1 ? 's' : ''}`}
              </p>
            </div>
          </div>
          {summary && (
            <div className="hidden gap-6 md:flex">
              <div className="text-center">
                <p className="text-2xl font-bold">{summary.total_checks.toLocaleString()}</p>
                <p className="text-xs text-muted-foreground">Checks (24h)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">{summary.total_alerts}</p>
                <p className="text-xs text-muted-foreground">Alerts (24h)</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold">
                  {summary.recovery_attempts > 0
                    ? `${summary.recovery_successes}/${summary.recovery_attempts}`
                    : '0'}
                </p>
                <p className="text-xs text-muted-foreground">Recoveries</p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview" className="gap-1.5">
            <Activity className="h-4 w-4" /> Overview
          </TabsTrigger>
          <TabsTrigger value="alerts" className="gap-1.5">
            <AlertTriangle className="h-4 w-4" />
            Alerts
            {activeAlerts.length > 0 && (
              <Badge variant="destructive" className="ml-1 h-5 px-1.5 text-[10px]">
                {activeAlerts.length}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="system" className="gap-1.5">
            <Server className="h-4 w-4" /> System
          </TabsTrigger>
          <TabsTrigger value="recovery" className="gap-1.5">
            <Wrench className="h-4 w-4" /> Recovery
          </TabsTrigger>
        </TabsList>

        {/* ── Overview Tab ── */}
        <TabsContent value="overview" className="space-y-4">
          {/* Application Cards */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {apps.map((app) => (
              <Card key={app.name}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">{app.name}</CardTitle>
                    <Badge variant={statusBadge(app.status)} className="uppercase text-[10px]">
                      {app.status}
                    </Badge>
                  </div>
                  <CardDescription className="text-xs capitalize">{app.type}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Response</span>
                    <span className={app.response_time_ms && app.response_time_ms > 1500 ? 'font-medium text-red-500' : 'font-medium'}>
                      {app.response_time_ms ? `${Math.round(app.response_time_ms)}ms` : '-'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Uptime (24h)</span>
                    <span className={`font-medium ${uptimeColor(app.uptime_24h)}`}>
                      {app.uptime_24h}%
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Avg Response (1h)</span>
                    <span className="font-medium">
                      {app.avg_response_1h ? `${Math.round(app.avg_response_1h)}ms` : '-'}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Last check: {formatTime(app.last_check)}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* System Resources Quick View */}
          {sys && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">System Resources</CardTitle>
                <CardDescription>Mac Studio — current usage</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid gap-6 md:grid-cols-3">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Cpu className="h-4 w-4 text-muted-foreground" />
                        <span>CPU</span>
                      </div>
                      <span className="font-medium">{sys.cpu_percent?.toFixed(1)}%</span>
                    </div>
                    <Progress value={sys.cpu_percent || 0} className={`h-2 ${resourceColor(sys.cpu_percent || 0)}`} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <MemoryStick className="h-4 w-4 text-muted-foreground" />
                        <span>Memory</span>
                      </div>
                      <span className="font-medium">{sys.memory_percent?.toFixed(1)}%</span>
                    </div>
                    <Progress value={sys.memory_percent || 0} className={`h-2 ${resourceColor(sys.memory_percent || 0)}`} />
                  </div>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <HardDrive className="h-4 w-4 text-muted-foreground" />
                        <span>Disk</span>
                      </div>
                      <span className="font-medium">{sys.disk_percent?.toFixed(1)}% ({sys.disk_free_gb?.toFixed(1)} GB free)</span>
                    </div>
                    <Progress value={sys.disk_percent || 0} className={`h-2 ${resourceColor(sys.disk_percent || 0)}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Uptime Overview */}
          {summary && Object.keys(summary.app_uptimes).length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">24-Hour Uptime</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-4">
                  {Object.entries(summary.app_uptimes).map(([name, pct]) => (
                    <div key={name} className="flex items-center justify-between rounded-lg border p-3">
                      <span className="text-sm font-medium">{name}</span>
                      <span className={`text-lg font-bold ${uptimeColor(pct)}`}>{pct}%</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* ── Alerts Tab ── */}
        <TabsContent value="alerts" className="space-y-4">
          {/* Active Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <AlertTriangle className="h-5 w-5 text-amber-500" />
                Active Alerts
                {activeAlerts.length > 0 && (
                  <Badge variant="destructive">{activeAlerts.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {activeAlerts.length === 0 ? (
                <div className="flex items-center gap-2 py-6 text-center text-muted-foreground">
                  <CheckCircle2 className="mx-auto h-8 w-8 text-emerald-500" />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Message</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeAlerts.map((a) => (
                      <TableRow key={a.id}>
                        <TableCell className="text-xs whitespace-nowrap">{formatDateTime(a.timestamp)}</TableCell>
                        <TableCell>
                          <Badge variant={severityBadge(a.severity)} className="text-[10px]">
                            {a.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{a.app_name}</TableCell>
                        <TableCell className="max-w-xs truncate text-sm">{a.message}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Alert History */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Alert History</CardTitle>
              <CardDescription>Recent alerts across all services</CardDescription>
            </CardHeader>
            <CardContent>
              {!alerts || alerts.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">No alerts recorded yet.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Message</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {alerts.slice(0, 50).map((a) => (
                      <TableRow key={a.id} className={a.resolved ? 'opacity-60' : ''}>
                        <TableCell className="text-xs whitespace-nowrap">{formatDateTime(a.timestamp)}</TableCell>
                        <TableCell>
                          <Badge variant={severityBadge(a.severity)} className="text-[10px]">
                            {a.severity}
                          </Badge>
                        </TableCell>
                        <TableCell className="font-medium">{a.app_name}</TableCell>
                        <TableCell className="max-w-xs truncate text-sm">{a.message}</TableCell>
                        <TableCell>
                          {a.resolved ? (
                            <Badge variant="default" className="text-[10px]">
                              Resolved {a.resolved_at ? formatTime(a.resolved_at) : ''}
                            </Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px]">Active</Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── System Tab ── */}
        <TabsContent value="system" className="space-y-4">
          {/* Current Metrics Cards */}
          {sys && (
            <div className="grid gap-4 md:grid-cols-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-blue-100 p-2 dark:bg-blue-900">
                      <Cpu className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{sys.cpu_percent?.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">CPU Usage</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-purple-100 p-2 dark:bg-purple-900">
                      <MemoryStick className="h-5 w-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{sys.memory_percent?.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Memory Usage</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-amber-100 p-2 dark:bg-amber-900">
                      <HardDrive className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{sys.disk_percent?.toFixed(1)}%</p>
                      <p className="text-xs text-muted-foreground">Disk Usage</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-emerald-100 p-2 dark:bg-emerald-900">
                      <HardDrive className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <div>
                      <p className="text-2xl font-bold">{sys.disk_free_gb?.toFixed(1)} GB</p>
                      <p className="text-xs text-muted-foreground">Disk Free</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* System Resource Charts */}
          {systemHistory && systemHistory.length > 0 && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">CPU & Memory — 24 Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={systemHistory}>
                      <defs>
                        <linearGradient id="cpuGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                        </linearGradient>
                        <linearGradient id="memGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                          <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={chartTimeLabel}
                        tick={{ fontSize: 11 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                      <RechartsTooltip
                        labelFormatter={chartTimeLabel}
                        formatter={(value: number) => [`${value.toFixed(1)}%`]}
                      />
                      <Legend />
                      <Area
                        type="monotone"
                        dataKey="cpu_percent"
                        name="CPU"
                        stroke="#3b82f6"
                        fill="url(#cpuGrad)"
                        strokeWidth={2}
                      />
                      <Area
                        type="monotone"
                        dataKey="memory_percent"
                        name="Memory"
                        stroke="#8b5cf6"
                        fill="url(#memGrad)"
                        strokeWidth={2}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-base">Disk Usage — 24 Hours</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={200}>
                    <LineChart data={systemHistory}>
                      <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                      <XAxis
                        dataKey="timestamp"
                        tickFormatter={chartTimeLabel}
                        tick={{ fontSize: 11 }}
                        interval="preserveStartEnd"
                      />
                      <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} unit="%" />
                      <RechartsTooltip
                        labelFormatter={chartTimeLabel}
                        formatter={(value: number) => [`${value.toFixed(1)}%`]}
                      />
                      <Line
                        type="monotone"
                        dataKey="disk_percent"
                        name="Disk"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        {/* ── Recovery Tab ── */}
        <TabsContent value="recovery" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Wrench className="h-5 w-5" />
                Recovery Actions
              </CardTitle>
              <CardDescription>
                Automatic recovery attempts performed by the monitoring agent
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!recovery || recovery.length === 0 ? (
                <p className="py-6 text-center text-sm text-muted-foreground">
                  No recovery actions recorded. The agent will automatically attempt to restart
                  unhealthy containers.
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Result</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Details</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {recovery.map((r) => (
                      <TableRow key={r.id}>
                        <TableCell className="text-xs whitespace-nowrap">{formatDateTime(r.timestamp)}</TableCell>
                        <TableCell>
                          {r.success ? (
                            <Badge variant="default" className="text-[10px]">Success</Badge>
                          ) : (
                            <Badge variant="destructive" className="text-[10px]">Failed</Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{r.app_name}</TableCell>
                        <TableCell className="text-sm">{r.action}</TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                          {r.details || '-'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
