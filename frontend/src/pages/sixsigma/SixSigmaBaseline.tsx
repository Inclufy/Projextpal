import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { sixsigmaApi, BaselineMetric } from '@/lib/sixsigmaApi';
import { BarChart3, Plus, Trash2, Loader2, AlertCircle, TrendingUp, Target } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const SixSigmaBaseline = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [metrics, setMetrics] = useState<BaselineMetric[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newMetric, setNewMetric] = useState({
    metric_name: '',
    metric_type: 'continuous',
    unit_of_measure: '',
    baseline_value: 0,
    target_value: 0,
    data_source: '',
    measurement_period: '',
    sample_size: 0,
    mean: 0,
    std_deviation: 0,
    usl: 0,
    lsl: 0,
    defects: 0,
    opportunities: 0,
    notes: '',
  });

  useEffect(() => {
    if (id) loadMetrics();
  }, [id]);

  const loadMetrics = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await sixsigmaApi.baseline.getAll(id);
      setMetrics(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load baseline metrics');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const created = await sixsigmaApi.baseline.create(id, newMetric);
      setMetrics([...metrics, created]);
      setShowForm(false);
      setNewMetric({
        metric_name: '',
        metric_type: 'continuous',
        unit_of_measure: '',
        baseline_value: 0,
        target_value: 0,
        data_source: '',
        measurement_period: '',
        sample_size: 0,
        mean: 0,
        std_deviation: 0,
        usl: 0,
        lsl: 0,
        defects: 0,
        opportunities: 0,
        notes: '',
      });
      toast({ title: 'Metric Added', description: 'Baseline metric created.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (metricId: number) => {
    if (!id) return;
    try {
      await sixsigmaApi.baseline.delete(id, metricId);
      setMetrics(metrics.filter(m => m.id !== metricId));
      toast({ title: 'Deleted', description: 'Metric removed.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  // Calculate sigma level
  const calculateSigma = (defects: number, opportunities: number) => {
    if (!opportunities || opportunities === 0) return null;
    const dpmo = (defects / opportunities) * 1000000;
    // Simplified sigma calculation
    if (dpmo >= 690000) return 1;
    if (dpmo >= 308000) return 2;
    if (dpmo >= 66800) return 3;
    if (dpmo >= 6210) return 4;
    if (dpmo >= 230) return 5;
    return 6;
  };

  // Calculate Cpk
  const calculateCpk = (mean: number, std: number, usl: number, lsl: number) => {
    if (!std || std === 0) return null;
    const cpuValue = (usl - mean) / (3 * std);
    const cplValue = (mean - lsl) / (3 * std);
    return Math.min(cpuValue, cplValue).toFixed(2);
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
              <BarChart3 className="h-6 w-6 text-purple-600" />
              Baseline Metrics
            </h1>
            <p className="text-muted-foreground">Establish current process performance baseline</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Metric
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* New Metric Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add Baseline Metric</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Metric Name</label>
                  <Input
                    value={newMetric.metric_name}
                    onChange={(e) => setNewMetric({ ...newMetric, metric_name: e.target.value })}
                    placeholder="e.g., Defect Rate"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Type</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newMetric.metric_type}
                    onChange={(e) => setNewMetric({ ...newMetric, metric_type: e.target.value })}
                  >
                    <option value="continuous">Continuous</option>
                    <option value="discrete">Discrete</option>
                    <option value="attribute">Attribute</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium">Unit of Measure</label>
                  <Input
                    value={newMetric.unit_of_measure}
                    onChange={(e) => setNewMetric({ ...newMetric, unit_of_measure: e.target.value })}
                    placeholder="e.g., %, minutes, count"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Baseline Value</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newMetric.baseline_value}
                    onChange={(e) => setNewMetric({ ...newMetric, baseline_value: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Target Value</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newMetric.target_value}
                    onChange={(e) => setNewMetric({ ...newMetric, target_value: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Data Source</label>
                  <Input
                    value={newMetric.data_source}
                    onChange={(e) => setNewMetric({ ...newMetric, data_source: e.target.value })}
                    placeholder="e.g., ERP System"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Measurement Period</label>
                  <Input
                    value={newMetric.measurement_period}
                    onChange={(e) => setNewMetric({ ...newMetric, measurement_period: e.target.value })}
                    placeholder="e.g., Jan-Mar 2025"
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Sample Size</label>
                  <Input
                    type="number"
                    value={newMetric.sample_size}
                    onChange={(e) => setNewMetric({ ...newMetric, sample_size: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Mean</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newMetric.mean}
                    onChange={(e) => setNewMetric({ ...newMetric, mean: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Std Deviation</label>
                  <Input
                    type="number"
                    step="0.001"
                    value={newMetric.std_deviation}
                    onChange={(e) => setNewMetric({ ...newMetric, std_deviation: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">USL (Upper Spec)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newMetric.usl}
                    onChange={(e) => setNewMetric({ ...newMetric, usl: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">LSL (Lower Spec)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newMetric.lsl}
                    onChange={(e) => setNewMetric({ ...newMetric, lsl: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Defects</label>
                  <Input
                    type="number"
                    value={newMetric.defects}
                    onChange={(e) => setNewMetric({ ...newMetric, defects: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Opportunities</label>
                  <Input
                    type="number"
                    value={newMetric.opportunities}
                    onChange={(e) => setNewMetric({ ...newMetric, opportunities: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Notes</label>
                <Textarea
                  value={newMetric.notes}
                  onChange={(e) => setNewMetric({ ...newMetric, notes: e.target.value })}
                  placeholder="Additional notes..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Metric
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Metrics Cards */}
        {metrics.length > 0 ? (
          <div className="grid gap-4">
            {metrics.map(metric => {
              const sigma = calculateSigma(metric.defects || 0, metric.opportunities || 0);
              const cpk = calculateCpk(
                metric.mean || 0,
                metric.std_deviation || 0,
                metric.usl || 0,
                metric.lsl || 0
              );
              const improvement = metric.baseline_value && metric.target_value
                ? (((metric.baseline_value - metric.target_value) / metric.baseline_value) * 100).toFixed(1)
                : null;

              return (
                <Card key={metric.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-3">
                          <h3 className="font-semibold text-lg">{metric.metric_name}</h3>
                          <Badge variant="outline">{metric.metric_type}</Badge>
                          <Badge variant="outline">{metric.unit_of_measure}</Badge>
                        </div>

                        <div className="grid grid-cols-5 gap-4 mb-4">
                          <div className="text-center p-3 bg-red-50 rounded-lg">
                            <div className="text-xs text-muted-foreground">Baseline</div>
                            <div className="text-xl font-bold text-red-600">{metric.baseline_value}</div>
                          </div>
                          <div className="text-center p-3 bg-green-50 rounded-lg">
                            <div className="text-xs text-muted-foreground">Target</div>
                            <div className="text-xl font-bold text-green-600">{metric.target_value}</div>
                          </div>
                          {improvement && (
                            <div className="text-center p-3 bg-blue-50 rounded-lg">
                              <div className="text-xs text-muted-foreground">Improvement Target</div>
                              <div className="text-xl font-bold text-blue-600">{improvement}%</div>
                            </div>
                          )}
                          {sigma && (
                            <div className="text-center p-3 bg-purple-50 rounded-lg">
                              <div className="text-xs text-muted-foreground">Sigma Level</div>
                              <div className="text-xl font-bold text-purple-600">{sigma}σ</div>
                            </div>
                          )}
                          {cpk && (
                            <div className="text-center p-3 bg-orange-50 rounded-lg">
                              <div className="text-xs text-muted-foreground">Cpk</div>
                              <div className="text-xl font-bold text-orange-600">{cpk}</div>
                            </div>
                          )}
                        </div>

                        <div className="grid grid-cols-4 gap-4 text-sm text-muted-foreground">
                          <div>Mean: {metric.mean}</div>
                          <div>Std Dev: {metric.std_deviation}</div>
                          <div>Sample: {metric.sample_size}</div>
                          <div>Source: {metric.data_source}</div>
                        </div>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(metric.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Baseline Metrics</h3>
              <p className="text-muted-foreground mb-4">
                Document your current process performance before improvements.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Metric
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Baseline Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Collect enough data to be statistically significant (usually 30+ data points)</li>
              <li>• Document your data source clearly for reproducibility</li>
              <li>• Calculate Cpk for continuous data with specifications</li>
              <li>• Calculate sigma level for defects/opportunities data</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaBaseline;
