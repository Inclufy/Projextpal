import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { sixsigmaApi, ControlChart, ControlChartData } from '@/lib/sixsigmaApi';
import { 
  LineChart, Plus, Trash2, Save, Loader2, AlertCircle, 
  AlertTriangle, CheckCircle, RefreshCw 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const chartTypeLabels: Record<string, string> = {
  'x_bar_r': 'X-bar R Chart',
  'x_bar_s': 'X-bar S Chart',
  'i_mr': 'I-MR Chart',
  'p': 'P Chart',
  'np': 'NP Chart',
  'c': 'C Chart',
  'u': 'U Chart',
};

const SixSigmaControlChart = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [charts, setCharts] = useState<ControlChart[]>([]);
  const [selectedChart, setSelectedChart] = useState<ControlChart | null>(null);
  const [newDataPoint, setNewDataPoint] = useState('');
  
  // New chart form
  const [showNewForm, setShowNewForm] = useState(false);
  const [newChart, setNewChart] = useState({
    chart_name: '',
    chart_type: 'i_mr',
    metric_name: '',
    ucl: 0,
    lcl: 0,
    center_line: 0,
  });

  // Load data
  useEffect(() => {
    if (id) {
      loadCharts();
    }
  }, [id]);

  const loadCharts = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await sixsigmaApi.controlCharts.getAll(id);
      setCharts(data);
      if (data.length > 0 && !selectedChart) {
        setSelectedChart(data[0]);
      }
    } catch (err: any) {
      console.error('Error loading control charts:', err);
      setError(err.message || 'Failed to load control charts');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateChart = async () => {
    if (!id) return;
    
    setSaving(true);
    
    try {
      const chart = await sixsigmaApi.controlCharts.create(id, newChart);
      setCharts([...charts, chart]);
      setSelectedChart(chart);
      setShowNewForm(false);
      setNewChart({
        chart_name: '',
        chart_type: 'i_mr',
        metric_name: '',
        ucl: 0,
        lcl: 0,
        center_line: 0,
      });
      
      toast({
        title: 'Chart Created',
        description: 'Control chart created successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to create chart',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddDataPoint = async () => {
    if (!id || !selectedChart || !newDataPoint) return;
    
    try {
      const value = parseFloat(newDataPoint);
      if (isNaN(value)) {
        toast({
          title: 'Error',
          description: 'Please enter a valid number',
          variant: 'destructive',
        });
        return;
      }
      
      await sixsigmaApi.controlCharts.addDataPoint(id, selectedChart.id, value);
      
      // Reload chart to get updated data
      const updatedChart = await sixsigmaApi.controlCharts.getById(id, selectedChart.id);
      setSelectedChart(updatedChart);
      setCharts(charts.map(c => c.id === updatedChart.id ? updatedChart : c));
      
      setNewDataPoint('');
      
      toast({
        title: 'Data Added',
        description: 'Data point added successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add data point',
        variant: 'destructive',
      });
    }
  };

  const handleRecalculateLimits = async () => {
    if (!id || !selectedChart) return;
    
    try {
      const updated = await sixsigmaApi.controlCharts.recalculateLimits(id, selectedChart.id);
      setSelectedChart(updated);
      setCharts(charts.map(c => c.id === updated.id ? updated : c));
      
      toast({
        title: 'Limits Recalculated',
        description: 'Control limits have been recalculated.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to recalculate limits',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteChart = async (chartId: number) => {
    if (!id) return;
    
    try {
      await sixsigmaApi.controlCharts.delete(id, chartId);
      setCharts(charts.filter(c => c.id !== chartId));
      if (selectedChart?.id === chartId) {
        setSelectedChart(charts.find(c => c.id !== chartId) || null);
      }
      
      toast({
        title: 'Deleted',
        description: 'Control chart deleted.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete chart',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading control charts...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LineChart className="h-6 w-6 text-blue-600" />
              Control Charts (SPC)
            </h1>
            <p className="text-muted-foreground">Statistical Process Control monitoring</p>
          </div>
          <Button onClick={() => setShowNewForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Chart
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* New Chart Form */}
        {showNewForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create New Control Chart</CardTitle>
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
                  <Select
                    value={newChart.chart_type}
                    onValueChange={(value) => setNewChart({ ...newChart, chart_type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(chartTypeLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>{label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Metric Name</label>
                  <Input
                    value={newChart.metric_name}
                    onChange={(e) => setNewChart({ ...newChart, metric_name: e.target.value })}
                    placeholder="e.g., Processing Time (min)"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Upper Control Limit (UCL)</label>
                  <Input
                    type="number"
                    value={newChart.ucl || ''}
                    onChange={(e) => setNewChart({ ...newChart, ucl: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Center Line</label>
                  <Input
                    type="number"
                    value={newChart.center_line || ''}
                    onChange={(e) => setNewChart({ ...newChart, center_line: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Lower Control Limit (LCL)</label>
                  <Input
                    type="number"
                    value={newChart.lcl || ''}
                    onChange={(e) => setNewChart({ ...newChart, lcl: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreateChart} disabled={saving}>
                  {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : null}
                  Create Chart
                </Button>
                <Button variant="outline" onClick={() => setShowNewForm(false)}>
                  Cancel
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Charts List */}
        {charts.length > 0 ? (
          <div className="grid grid-cols-4 gap-4">
            {/* Chart Selection */}
            <Card className="col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Charts</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {charts.map(chart => (
                  <div
                    key={chart.id}
                    className={`p-3 rounded-lg cursor-pointer flex items-center justify-between ${
                      selectedChart?.id === chart.id
                        ? 'bg-blue-50 border border-blue-200'
                        : 'bg-gray-50 hover:bg-gray-100'
                    }`}
                    onClick={() => setSelectedChart(chart)}
                  >
                    <div>
                      <div className="font-medium">{chart.chart_name}</div>
                      <div className="text-xs text-muted-foreground">
                        {chartTypeLabels[chart.chart_type]}
                      </div>
                    </div>
                    {chart.is_in_control ? (
                      <CheckCircle className="h-4 w-4 text-green-500" />
                    ) : (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Selected Chart Details */}
            {selectedChart && (
              <Card className="col-span-3">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>{selectedChart.chart_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {chartTypeLabels[selectedChart.chart_type]} - {selectedChart.metric_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedChart.is_in_control ? (
                      <Badge className="bg-green-100 text-green-800">In Control</Badge>
                    ) : (
                      <Badge variant="destructive">Out of Control</Badge>
                    )}
                    <Button variant="outline" size="sm" onClick={handleRecalculateLimits}>
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Recalculate
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-red-500"
                      onClick={() => handleDeleteChart(selectedChart.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Control Limits */}
                  <div className="grid grid-cols-5 gap-4 text-center">
                    <div className="p-3 bg-red-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">UCL</div>
                      <div className="text-xl font-bold text-red-600">{selectedChart.ucl.toFixed(2)}</div>
                    </div>
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Center</div>
                      <div className="text-xl font-bold">{selectedChart.center_line.toFixed(2)}</div>
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">LCL</div>
                      <div className="text-xl font-bold text-blue-600">{selectedChart.lcl.toFixed(2)}</div>
                    </div>
                    <div className="p-3 bg-purple-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Cpk</div>
                      <div className="text-xl font-bold text-purple-600">
                        {selectedChart.cpk?.toFixed(2) || 'N/A'}
                      </div>
                    </div>
                    <div className="p-3 bg-orange-50 rounded-lg">
                      <div className="text-sm text-muted-foreground">Violations</div>
                      <div className="text-xl font-bold text-orange-600">
                        {selectedChart.total_violations || 0}
                      </div>
                    </div>
                  </div>

                  {/* Chart Visualization */}
                  <div className="h-64 border rounded-lg p-4 relative">
                    {selectedChart.data_points && selectedChart.data_points.length > 0 ? (
                      <div className="h-full flex flex-col">
                        {/* Simple visualization */}
                        <div className="flex-1 relative">
                          {/* UCL Line */}
                          <div className="absolute w-full border-t-2 border-red-400 border-dashed" style={{ top: '10%' }}>
                            <span className="absolute right-0 text-xs text-red-500 -mt-3">UCL</span>
                          </div>
                          {/* Center Line */}
                          <div className="absolute w-full border-t-2 border-gray-400" style={{ top: '50%' }}>
                            <span className="absolute right-0 text-xs text-gray-500 -mt-3">CL</span>
                          </div>
                          {/* LCL Line */}
                          <div className="absolute w-full border-t-2 border-blue-400 border-dashed" style={{ top: '90%' }}>
                            <span className="absolute right-0 text-xs text-blue-500 -mt-3">LCL</span>
                          </div>
                          {/* Data points */}
                          <div className="h-full flex items-end justify-around px-4">
                            {selectedChart.data_points.slice(-20).map((point, i) => {
                              const range = selectedChart.ucl - selectedChart.lcl;
                              const normalized = range > 0 
                                ? ((point.value - selectedChart.lcl) / range) * 80 + 10
                                : 50;
                              return (
                                <div
                                  key={point.id || i}
                                  className={`w-2 h-2 rounded-full ${
                                    point.is_violation ? 'bg-red-500' : 'bg-green-500'
                                  }`}
                                  style={{ marginBottom: `${Math.max(5, Math.min(95, normalized))}%` }}
                                  title={`Value: ${point.value}`}
                                />
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="h-full flex items-center justify-center text-muted-foreground">
                        No data points yet. Add data below.
                      </div>
                    )}
                  </div>

                  {/* Add Data Point */}
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      value={newDataPoint}
                      onChange={(e) => setNewDataPoint(e.target.value)}
                      placeholder="Enter new data value..."
                      className="max-w-xs"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleAddDataPoint();
                      }}
                    />
                    <Button onClick={handleAddDataPoint}>
                      <Plus className="h-4 w-4 mr-1" />
                      Add Data Point
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <LineChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Control Charts Yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first control chart to monitor process stability.
              </p>
              <Button onClick={() => setShowNewForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Control Chart
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Control Chart Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• I-MR charts are best for individual measurements</li>
              <li>• X-bar R charts work well for subgroup samples</li>
              <li>• P charts are for proportion defective</li>
              <li>• Cpk &gt; 1.33 indicates good process capability</li>
              <li>• Investigate any points outside control limits</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaControlChart;