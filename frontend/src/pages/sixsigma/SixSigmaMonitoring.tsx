import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { sixsigmaApi, ProcessMonitor } from '@/lib/sixsigmaApi';
import { Activity, Plus, Trash2, Loader2, AlertCircle, CheckCircle, AlertTriangle, XCircle, RefreshCw } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const SixSigmaMonitoring = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [monitors, setMonitors] = useState<ProcessMonitor[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newMonitor, setNewMonitor] = useState({
    metric_name: '',
    current_value: 0,
    target_value: 0,
    lower_limit: 0,
    upper_limit: 0,
    unit: '',
    frequency: 'daily',
    responsible: '',
    last_updated: new Date().toISOString().split('T')[0],
    status: 'on_target',
    notes: '',
  });

  useEffect(() => {
    if (id) loadMonitors();
  }, [id]);

  const loadMonitors = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await sixsigmaApi.monitoring.getAll(id);
      setMonitors(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load process monitors');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const created = await sixsigmaApi.monitoring.create(id, newMonitor);
      setMonitors([...monitors, created]);
      setShowForm(false);
      setNewMonitor({
        metric_name: '',
        current_value: 0,
        target_value: 0,
        lower_limit: 0,
        upper_limit: 0,
        unit: '',
        frequency: 'daily',
        responsible: '',
        last_updated: new Date().toISOString().split('T')[0],
        status: 'on_target',
        notes: '',
      });
      toast({ title: 'Monitor Added', description: 'Process monitor created.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (monitorId: number) => {
    if (!id) return;
    try {
      await sixsigmaApi.monitoring.delete(id, monitorId);
      setMonitors(monitors.filter(m => m.id !== monitorId));
      toast({ title: 'Deleted', description: 'Monitor removed.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleUpdateValue = async (monitorId: number, newValue: number) => {
    if (!id) return;
    const monitor = monitors.find(m => m.id === monitorId);
    if (!monitor) return;

    // Calculate status based on limits
    let status = 'on_target';
    if (newValue > (monitor.upper_limit || Infinity) || newValue < (monitor.lower_limit || -Infinity)) {
      status = 'out_of_control';
    } else if (Math.abs(newValue - (monitor.target_value || 0)) > Math.abs((monitor.target_value || 0) * 0.1)) {
      status = 'warning';
    }

    try {
      await sixsigmaApi.monitoring.update(id, monitorId, { 
        current_value: newValue, 
        status,
        last_updated: new Date().toISOString().split('T')[0]
      });
      setMonitors(monitors.map(m => m.id === monitorId ? { 
        ...m, 
        current_value: newValue, 
        status,
        last_updated: new Date().toISOString().split('T')[0]
      } : m));
      toast({ title: 'Updated', description: 'Value recorded.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const statusConfig: Record<string, { color: string; icon: any; label: string }> = {
    on_target: { color: 'bg-green-500', icon: CheckCircle, label: 'On Target' },
    warning: { color: 'bg-yellow-500', icon: AlertTriangle, label: 'Warning' },
    out_of_control: { color: 'bg-red-500', icon: XCircle, label: 'Out of Control' },
  };

  const frequencies = [
    { value: 'hourly', label: 'Hourly' },
    { value: 'daily', label: 'Daily' },
    { value: 'weekly', label: 'Weekly' },
    { value: 'monthly', label: 'Monthly' },
  ];

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  const onTargetCount = monitors.filter(m => m.status === 'on_target').length;
  const warningCount = monitors.filter(m => m.status === 'warning').length;
  const outOfControlCount = monitors.filter(m => m.status === 'out_of_control').length;

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Activity className="h-6 w-6 text-green-600" />
              Process Monitoring
            </h1>
            <p className="text-muted-foreground">Track key metrics and process health in real-time</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadMonitors}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
            <Button onClick={() => setShowForm(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Monitor
            </Button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Status Summary */}
        {monitors.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold">{monitors.length}</div>
                <div className="text-sm text-muted-foreground">Total Monitors</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-green-700">{onTargetCount}</div>
                <div className="text-sm text-green-600">On Target</div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-yellow-700">{warningCount}</div>
                <div className="text-sm text-yellow-600">Warning</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-red-700">{outOfControlCount}</div>
                <div className="text-sm text-red-600">Out of Control</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New Monitor Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add Process Monitor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Metric Name</label>
                  <Input
                    value={newMonitor.metric_name}
                    onChange={(e) => setNewMonitor({ ...newMonitor, metric_name: e.target.value })}
                    placeholder="e.g., Defect Rate"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Unit</label>
                  <Input
                    value={newMonitor.unit}
                    onChange={(e) => setNewMonitor({ ...newMonitor, unit: e.target.value })}
                    placeholder="e.g., %, minutes"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Monitoring Frequency</label>
                  <Select value={newMonitor.frequency} onValueChange={(v) => setNewMonitor({ ...newMonitor, frequency: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {frequencies.map(f => (
                        <SelectItem key={f.value} value={f.value}>{f.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Target Value</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newMonitor.target_value}
                    onChange={(e) => setNewMonitor({ ...newMonitor, target_value: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Lower Limit</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newMonitor.lower_limit}
                    onChange={(e) => setNewMonitor({ ...newMonitor, lower_limit: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Upper Limit</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newMonitor.upper_limit}
                    onChange={(e) => setNewMonitor({ ...newMonitor, upper_limit: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Current Value</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newMonitor.current_value}
                    onChange={(e) => setNewMonitor({ ...newMonitor, current_value: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Responsible</label>
                <Input
                  value={newMonitor.responsible}
                  onChange={(e) => setNewMonitor({ ...newMonitor, responsible: e.target.value })}
                  placeholder="Who monitors this metric?"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Monitor
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Monitors Grid */}
        {monitors.length > 0 ? (
          <div className="grid grid-cols-2 gap-4">
            {monitors.map(monitor => {
              const config = statusConfig[monitor.status || 'on_target'];
              const StatusIcon = config.icon;
              const percentage = monitor.target_value 
                ? ((monitor.current_value || 0) / monitor.target_value * 100).toFixed(1)
                : 0;

              return (
                <Card key={monitor.id} className={monitor.status === 'out_of_control' ? 'border-red-300' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{monitor.metric_name}</CardTitle>
                        <Badge className={config.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {config.label}
                        </Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(monitor.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-center">
                      <div className="text-center">
                        <div className="text-4xl font-bold">
                          {monitor.current_value}
                          <span className="text-lg text-muted-foreground ml-1">{monitor.unit}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Target: {monitor.target_value} {monitor.unit}
                        </div>
                      </div>
                    </div>

                    <div className="relative pt-1">
                      <div className="flex h-2 overflow-hidden rounded bg-gray-200">
                        <div
                          style={{ width: `${Math.min(Number(percentage), 100)}%` }}
                          className={`${
                            monitor.status === 'on_target' ? 'bg-green-500' :
                            monitor.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2 text-xs text-center">
                      <div className="p-2 bg-blue-50 rounded">
                        <div className="text-muted-foreground">Lower</div>
                        <div className="font-medium">{monitor.lower_limit}</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded">
                        <div className="text-muted-foreground">Target</div>
                        <div className="font-medium">{monitor.target_value}</div>
                      </div>
                      <div className="p-2 bg-red-50 rounded">
                        <div className="text-muted-foreground">Upper</div>
                        <div className="font-medium">{monitor.upper_limit}</div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Input
                          type="number"
                          step="0.01"
                          className="w-24 h-8"
                          placeholder="New value"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              const input = e.target as HTMLInputElement;
                              handleUpdateValue(monitor.id, parseFloat(input.value) || 0);
                              input.value = '';
                            }
                          }}
                        />
                        <span className="text-muted-foreground">Press Enter</span>
                      </div>
                      <div className="text-muted-foreground">
                        Updated: {monitor.last_updated}
                      </div>
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Frequency: {frequencies.find(f => f.value === monitor.frequency)?.label}</span>
                      <span>Owner: {monitor.responsible}</span>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Activity className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Process Monitors</h3>
              <p className="text-muted-foreground mb-4">
                Set up monitors to track key process metrics.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Monitor
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Monitoring Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Set realistic control limits based on process capability</li>
              <li>• Update values at the specified frequency</li>
              <li>• Investigate warnings before they become out-of-control</li>
              <li>• Link monitors to your Control Plan items</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaMonitoring;
