import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { sixsigmaApi, SPCChart } from '@/lib/sixsigmaApi';
import { LineChart, Plus, Trash2, Loader2, AlertCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { LineChart as RechartsLine, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, ReferenceLine } from 'recharts';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const SixSigmaSPC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charts, setCharts] = useState<SPCChart[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newChart, setNewChart] = useState({
    chart_name: '',
    chart_type: 'xbar_r',
    metric_name: '',
    ucl: 0,
    lcl: 0,
    center_line: 0,
    subgroup_size: 5,
    data_points: '',
  });

  useEffect(() => {
    if (id) loadCharts();
  }, [id]);

  const loadCharts = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await sixsigmaApi.spc.getAll(id);
      setCharts(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load SPC charts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const created = await sixsigmaApi.spc.create(id, newChart);
      setCharts([...charts, created]);
      setShowForm(false);
      setNewChart({
        chart_name: '',
        chart_type: 'xbar_r',
        metric_name: '',
        ucl: 0,
        lcl: 0,
        center_line: 0,
        subgroup_size: 5,
        data_points: '',
      });
      toast({ title: 'Chart Created', description: 'SPC chart added.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (chartId: number) => {
    if (!id) return;
    try {
      await sixsigmaApi.spc.delete(id, chartId);
      setCharts(charts.filter(c => c.id !== chartId));
      toast({ title: 'Deleted', description: 'Chart removed.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const chartTypes = [
    { value: 'xbar_r', label: 'X-bar & R Chart' },
    { value: 'xbar_s', label: 'X-bar & S Chart' },
    { value: 'i_mr', label: 'I-MR Chart' },
    { value: 'p_chart', label: 'P Chart (Proportion)' },
    { value: 'np_chart', label: 'NP Chart (Count)' },
    { value: 'c_chart', label: 'C Chart (Defects)' },
    { value: 'u_chart', label: 'U Chart (Defects per Unit)' },
  ];

  const parseDataPoints = (dataStr: string) => {
    if (!dataStr) return [];
    try {
      const points = dataStr.split(',').map(p => parseFloat(p.trim())).filter(p => !isNaN(p));
      return points.map((value, index) => ({ index: index + 1, value }));
    } catch {
      return [];
    }
  };

  const checkOutOfControl = (value: number, ucl: number, lcl: number) => {
    return value > ucl || value < lcl;
  };

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

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LineChart className="h-6 w-6 text-blue-600" />
              Statistical Process Control (SPC)
            </h1>
            <p className="text-muted-foreground">Monitor process stability with control charts</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New SPC Chart
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* New Chart Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create SPC Chart</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Chart Name</label>
                  <Input
                    value={newChart.chart_name}
                    onChange={(e) => setNewChart({ ...newChart, chart_name: e.target.value })}
                    placeholder="e.g., Cycle Time Control"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Chart Type</label>
                  <Select value={newChart.chart_type} onValueChange={(v) => setNewChart({ ...newChart, chart_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {chartTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Metric Name</label>
                  <Input
                    value={newChart.metric_name}
                    onChange={(e) => setNewChart({ ...newChart, metric_name: e.target.value })}
                    placeholder="e.g., Processing Time"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">UCL (Upper Control Limit)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newChart.ucl}
                    onChange={(e) => setNewChart({ ...newChart, ucl: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Center Line</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newChart.center_line}
                    onChange={(e) => setNewChart({ ...newChart, center_line: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">LCL (Lower Control Limit)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newChart.lcl}
                    onChange={(e) => setNewChart({ ...newChart, lcl: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Subgroup Size</label>
                  <Input
                    type="number"
                    value={newChart.subgroup_size}
                    onChange={(e) => setNewChart({ ...newChart, subgroup_size: parseInt(e.target.value) || 5 })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Data Points (comma-separated)</label>
                <Input
                  value={newChart.data_points}
                  onChange={(e) => setNewChart({ ...newChart, data_points: e.target.value })}
                  placeholder="e.g., 10.2, 10.5, 9.8, 10.1, 10.3"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Chart
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* SPC Charts */}
        {charts.length > 0 ? (
          <div className="space-y-6">
            {charts.map(chart => {
              const dataPoints = parseDataPoints(chart.data_points || '');
              const outOfControlCount = dataPoints.filter(p => 
                checkOutOfControl(p.value, chart.ucl || 0, chart.lcl || 0)
              ).length;
              const isInControl = outOfControlCount === 0;

              return (
                <Card key={chart.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{chart.chart_name}</CardTitle>
                        <Badge variant="outline">
                          {chartTypes.find(t => t.value === chart.chart_type)?.label}
                        </Badge>
                        {isInControl ? (
                          <Badge className="bg-green-500">In Control</Badge>
                        ) : (
                          <Badge className="bg-red-500">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {outOfControlCount} Out of Control
                          </Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(chart.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-4 gap-4 text-center text-sm">
                      <div className="p-2 bg-red-50 rounded-lg">
                        <div className="text-muted-foreground">UCL</div>
                        <div className="font-bold text-red-600">{chart.ucl}</div>
                      </div>
                      <div className="p-2 bg-green-50 rounded-lg">
                        <div className="text-muted-foreground">Center Line</div>
                        <div className="font-bold text-green-600">{chart.center_line}</div>
                      </div>
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <div className="text-muted-foreground">LCL</div>
                        <div className="font-bold text-blue-600">{chart.lcl}</div>
                      </div>
                      <div className="p-2 bg-gray-50 rounded-lg">
                        <div className="text-muted-foreground">Data Points</div>
                        <div className="font-bold">{dataPoints.length}</div>
                      </div>
                    </div>

                    {dataPoints.length > 0 && (
                      <div className="h-64">
                        <ResponsiveContainer width="100%" height="100%">
                          <RechartsLine data={dataPoints}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="index" />
                            <YAxis domain={['auto', 'auto']} />
                            <Tooltip />
                            <Legend />
                            <ReferenceLine y={chart.ucl} stroke="red" strokeDasharray="5 5" label="UCL" />
                            <ReferenceLine y={chart.center_line} stroke="green" strokeDasharray="3 3" label="CL" />
                            <ReferenceLine y={chart.lcl} stroke="blue" strokeDasharray="5 5" label="LCL" />
                            <Line 
                              type="monotone" 
                              dataKey="value" 
                              stroke="#8884d8" 
                              dot={(props: any) => {
                                const { cx, cy, value } = props;
                                const isOutOfControl = checkOutOfControl(value, chart.ucl || 0, chart.lcl || 0);
                                return (
                                  <circle 
                                    cx={cx} 
                                    cy={cy} 
                                    r={isOutOfControl ? 6 : 4} 
                                    fill={isOutOfControl ? 'red' : '#8884d8'}
                                    stroke={isOutOfControl ? 'darkred' : '#8884d8'}
                                  />
                                );
                              }}
                            />
                          </RechartsLine>
                        </ResponsiveContainer>
                      </div>
                    )}

                    {dataPoints.length === 0 && (
                      <div className="h-32 flex items-center justify-center bg-gray-50 rounded-lg">
                        <span className="text-muted-foreground">No data points to display</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <LineChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No SPC Charts</h3>
              <p className="text-muted-foreground mb-4">
                Create control charts to monitor process stability.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Chart
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 SPC Chart Selection Guide</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>X-bar & R:</strong> Continuous data, subgroups 2-10</li>
              <li>• <strong>X-bar & S:</strong> Continuous data, subgroups &gt;10</li>
              <li>• <strong>I-MR:</strong> Individual measurements (subgroup size = 1)</li>
              <li>• <strong>P Chart:</strong> Proportion defective</li>
              <li>• <strong>C Chart:</strong> Count of defects (constant sample)</li>
              <li>• <strong>U Chart:</strong> Defects per unit (varying sample)</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaSPC;
