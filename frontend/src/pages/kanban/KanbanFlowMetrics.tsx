import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { kanbanApi, KanbanMetrics, CumulativeFlowData, KanbanColumn } from '@/lib/kanbanApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  BarChart3, TrendingUp, Clock, Activity, RefreshCw,
  Loader2, AlertCircle, ArrowUp, ArrowDown, Minus
} from 'lucide-react';

const KanbanFlowMetrics = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [metrics, setMetrics] = useState<KanbanMetrics[]>([]);
  const [cfdData, setCfdData] = useState<CumulativeFlowData[]>([]);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [days, setDays] = useState(30);

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id, days]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [metricsRes, cfdRes, columnsRes] = await Promise.all([
        kanbanApi.metrics.getThroughput(id!, days),
        kanbanApi.metrics.getCFD(id!, days),
        kanbanApi.columns.getAll(id!),
      ]);
      
      setMetrics(metricsRes);
      setCfdData(cfdRes);
      setColumns(columnsRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleRecordMetrics = async () => {
    try {
      await kanbanApi.metrics.recordDaily(id!);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to record metrics');
    }
  };

  // Calculate summary stats
  const latestMetrics = metrics[metrics.length - 1];
  const previousMetrics = metrics[metrics.length - 2];
  
  const avgLeadTime = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + (m.avg_lead_time_hours || 0), 0) / metrics.filter(m => m.avg_lead_time_hours).length
    : 0;
  
  const avgCycleTime = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + (m.avg_cycle_time_hours || 0), 0) / metrics.filter(m => m.avg_cycle_time_hours).length
    : 0;

  const avgThroughput = metrics.length > 0
    ? metrics.reduce((sum, m) => sum + m.cards_completed, 0) / metrics.length
    : 0;

  const getTrend = (current: number, previous: number) => {
    if (!previous) return null;
    const diff = ((current - previous) / previous) * 100;
    if (diff > 5) return { icon: <ArrowUp className="h-4 w-4 text-green-500" />, text: `+${diff.toFixed(1)}%` };
    if (diff < -5) return { icon: <ArrowDown className="h-4 w-4 text-red-500" />, text: `${diff.toFixed(1)}%` };
    return { icon: <Minus className="h-4 w-4 text-gray-500" />, text: 'Stable' };
  };

  // Group CFD data by date for chart
  const cfdByDate = cfdData.reduce((acc, item) => {
    if (!acc[item.date]) {
      acc[item.date] = {};
    }
    acc[item.date][item.column_name || item.column.toString()] = item.card_count;
    return acc;
  }, {} as Record<string, Record<string, number>>);

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Flow Metrics
            </h1>
            <p className="text-muted-foreground">Measure and improve your workflow</p>
          </div>
          <div className="flex gap-2 items-center">
            <Select value={days.toString()} onValueChange={(val) => setDays(parseInt(val))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="14">Last 14 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={handleRecordMetrics}>
              <RefreshCw className="h-4 w-4 mr-2" />Record Today
            </Button>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Lead Time
                  </p>
                  <p className="text-2xl font-bold">
                    {avgLeadTime ? `${(avgLeadTime / 24).toFixed(1)} days` : 'N/A'}
                  </p>
                </div>
                {previousMetrics && latestMetrics && (
                  <div className="flex items-center gap-1 text-sm">
                    {getTrend(latestMetrics.avg_lead_time_hours || 0, previousMetrics.avg_lead_time_hours || 0)?.icon}
                  </div>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">From request to delivery</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Activity className="h-4 w-4" />
                    Cycle Time
                  </p>
                  <p className="text-2xl font-bold">
                    {avgCycleTime ? `${(avgCycleTime / 24).toFixed(1)} days` : 'N/A'}
                  </p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">From start to finish</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <TrendingUp className="h-4 w-4" />
                    Throughput
                  </p>
                  <p className="text-2xl font-bold">{avgThroughput.toFixed(1)}/day</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Items completed per day</p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-4">
              <div>
                <p className="text-sm text-muted-foreground">Current WIP</p>
                <p className="text-2xl font-bold">{latestMetrics?.total_wip || 0}</p>
              </div>
              <p className="text-xs text-muted-foreground mt-1">Work in progress</p>
            </CardContent>
          </Card>
        </div>

        {/* Throughput Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Throughput Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.length > 0 ? (
              <div className="h-64 flex items-end gap-1">
                {metrics.slice(-30).map((m, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-blue-500 rounded-t transition-all"
                      style={{ height: `${(m.cards_completed / Math.max(...metrics.map(x => x.cards_completed), 1)) * 200}px` }}
                    />
                    {i % 5 === 0 && (
                      <span className="text-xs text-muted-foreground mt-1 rotate-45 origin-left">
                        {new Date(m.date).toLocaleDateString('en', { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No throughput data yet. Click "Record Today" to start tracking.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Cumulative Flow Diagram */}
        <Card>
          <CardHeader>
            <CardTitle>Cumulative Flow Diagram</CardTitle>
          </CardHeader>
          <CardContent>
            {Object.keys(cfdByDate).length > 0 ? (
              <div className="space-y-4">
                {/* Legend */}
                <div className="flex gap-4 flex-wrap">
                  {columns.map((col, idx) => (
                    <div key={col.id} className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: col.color }}
                      />
                      <span className="text-sm">{col.name}</span>
                    </div>
                  ))}
                </div>

                {/* Simple CFD visualization */}
                <div className="h-64 flex items-end gap-1">
                  {Object.entries(cfdByDate).slice(-30).map(([date, columnCounts], i) => {
                    const total = Object.values(columnCounts).reduce((a, b) => a + b, 0);
                    return (
                      <div key={date} className="flex-1 flex flex-col">
                        {columns.map((col) => {
                          const count = columnCounts[col.name] || 0;
                          const height = total > 0 ? (count / total) * 200 : 0;
                          return (
                            <div 
                              key={col.id}
                              style={{ 
                                backgroundColor: col.color,
                                height: `${height}px`,
                              }}
                              className="w-full transition-all"
                            />
                          );
                        })}
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No CFD data yet. Click "Record Today" to start tracking.
              </p>
            )}
          </CardContent>
        </Card>

        {/* Metrics History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Metrics History</CardTitle>
          </CardHeader>
          <CardContent>
            {metrics.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Date</th>
                      <th className="text-right p-2">Completed</th>
                      <th className="text-right p-2">Lead Time (hrs)</th>
                      <th className="text-right p-2">Cycle Time (hrs)</th>
                      <th className="text-right p-2">WIP</th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.slice(-10).reverse().map((m) => (
                      <tr key={m.id} className="border-b hover:bg-muted/50">
                        <td className="p-2">{m.date}</td>
                        <td className="text-right p-2">{m.cards_completed}</td>
                        <td className="text-right p-2">
                          {m.avg_lead_time_hours ? m.avg_lead_time_hours.toFixed(1) : '-'}
                        </td>
                        <td className="text-right p-2">
                          {m.avg_cycle_time_hours ? m.avg_cycle_time_hours.toFixed(1) : '-'}
                        </td>
                        <td className="text-right p-2">{m.total_wip}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No metrics recorded yet</p>
            )}
          </CardContent>
        </Card>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="kanban" />
    </div>
  );
};

export default KanbanFlowMetrics;
