import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { sixsigmaApi, RegressionAnalysis } from '@/lib/sixsigmaApi';
import { TrendingUp, Plus, Trash2, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const SixSigmaRegression = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<RegressionAnalysis[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newAnalysis, setNewAnalysis] = useState({
    analysis_name: '',
    dependent_variable: '',
    independent_variables: '',
    regression_type: 'linear',
    r_squared: 0,
    adjusted_r_squared: 0,
    p_value: 0,
    f_statistic: 0,
    equation: '',
    significant_predictors: '',
    interpretation: '',
    recommendations: '',
  });

  useEffect(() => {
    if (id) loadAnalyses();
  }, [id]);

  const loadAnalyses = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await sixsigmaApi.regression.getAll(id);
      setAnalyses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load regression analyses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const created = await sixsigmaApi.regression.create(id, newAnalysis);
      setAnalyses([...analyses, created]);
      setShowForm(false);
      setNewAnalysis({
        analysis_name: '',
        dependent_variable: '',
        independent_variables: '',
        regression_type: 'linear',
        r_squared: 0,
        adjusted_r_squared: 0,
        p_value: 0,
        f_statistic: 0,
        equation: '',
        significant_predictors: '',
        interpretation: '',
        recommendations: '',
      });
      toast({ title: 'Analysis Added', description: 'Regression analysis created.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (analysisId: number) => {
    if (!id) return;
    try {
      await sixsigmaApi.regression.delete(id, analysisId);
      setAnalyses(analyses.filter(a => a.id !== analysisId));
      toast({ title: 'Deleted', description: 'Analysis removed.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const getRSquaredQuality = (r2: number) => {
    if (r2 >= 0.9) return { label: 'Excellent', color: 'bg-green-500' };
    if (r2 >= 0.7) return { label: 'Good', color: 'bg-blue-500' };
    if (r2 >= 0.5) return { label: 'Moderate', color: 'bg-yellow-500' };
    return { label: 'Weak', color: 'bg-red-500' };
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
              <TrendingUp className="h-6 w-6 text-indigo-600" />
              Regression Analysis
            </h1>
            <p className="text-muted-foreground">Analyze relationships between variables</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Analysis
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* New Analysis Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add Regression Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Analysis Name</label>
                  <Input
                    value={newAnalysis.analysis_name}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, analysis_name: e.target.value })}
                    placeholder="e.g., Defect Rate Predictors"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Regression Type</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newAnalysis.regression_type}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, regression_type: e.target.value })}
                  >
                    <option value="linear">Simple Linear</option>
                    <option value="multiple">Multiple Linear</option>
                    <option value="logistic">Logistic</option>
                    <option value="polynomial">Polynomial</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Dependent Variable (Y)</label>
                  <Input
                    value={newAnalysis.dependent_variable}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, dependent_variable: e.target.value })}
                    placeholder="e.g., Defect Rate"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Independent Variables (X)</label>
                  <Input
                    value={newAnalysis.independent_variables}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, independent_variables: e.target.value })}
                    placeholder="e.g., Temperature, Pressure, Speed"
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">R² (R-Squared)</label>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    value={newAnalysis.r_squared}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, r_squared: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Adjusted R²</label>
                  <Input
                    type="number"
                    step="0.001"
                    min="0"
                    max="1"
                    value={newAnalysis.adjusted_r_squared}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, adjusted_r_squared: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">P-Value</label>
                  <Input
                    type="number"
                    step="0.0001"
                    value={newAnalysis.p_value}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, p_value: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">F-Statistic</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newAnalysis.f_statistic}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, f_statistic: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Regression Equation</label>
                <Input
                  value={newAnalysis.equation}
                  onChange={(e) => setNewAnalysis({ ...newAnalysis, equation: e.target.value })}
                  placeholder="e.g., Y = 2.5 + 0.8X₁ - 0.3X₂"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Significant Predictors</label>
                <Input
                  value={newAnalysis.significant_predictors}
                  onChange={(e) => setNewAnalysis({ ...newAnalysis, significant_predictors: e.target.value })}
                  placeholder="Variables with p < 0.05"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Interpretation</label>
                <Textarea
                  value={newAnalysis.interpretation}
                  onChange={(e) => setNewAnalysis({ ...newAnalysis, interpretation: e.target.value })}
                  placeholder="What does this analysis tell us?"
                  rows={2}
                />
              </div>

              <div>
                <label className="text-sm font-medium">Recommendations</label>
                <Textarea
                  value={newAnalysis.recommendations}
                  onChange={(e) => setNewAnalysis({ ...newAnalysis, recommendations: e.target.value })}
                  placeholder="Actions based on this analysis..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Save Analysis
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Analyses List */}
        {analyses.length > 0 ? (
          <div className="space-y-4">
            {analyses.map(analysis => {
              const r2Quality = getRSquaredQuality(analysis.r_squared || 0);
              const isSignificant = (analysis.p_value || 1) < 0.05;

              return (
                <Card key={analysis.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{analysis.analysis_name}</CardTitle>
                        <Badge variant="outline">{analysis.regression_type}</Badge>
                        <Badge className={r2Quality.color}>R² {r2Quality.label}</Badge>
                        {isSignificant ? (
                          <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Significant</Badge>
                        ) : (
                          <Badge className="bg-gray-500"><XCircle className="h-3 w-3 mr-1" />Not Significant</Badge>
                        )}
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(analysis.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Y (Dependent): </span>
                        <span className="font-medium">{analysis.dependent_variable}</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground">X (Independent): </span>
                        <span className="font-medium">{analysis.independent_variables}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-center">
                      <div className={`p-3 rounded-lg ${(analysis.r_squared || 0) >= 0.7 ? 'bg-green-50' : 'bg-yellow-50'}`}>
                        <div className="text-xs text-muted-foreground">R²</div>
                        <div className="font-bold text-lg">{(analysis.r_squared || 0).toFixed(3)}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-muted-foreground">Adj R²</div>
                        <div className="font-bold text-lg">{(analysis.adjusted_r_squared || 0).toFixed(3)}</div>
                      </div>
                      <div className={`p-3 rounded-lg ${isSignificant ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className="text-xs text-muted-foreground">P-Value</div>
                        <div className="font-bold text-lg">{(analysis.p_value || 0).toFixed(4)}</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-muted-foreground">F-Statistic</div>
                        <div className="font-bold text-lg">{(analysis.f_statistic || 0).toFixed(2)}</div>
                      </div>
                    </div>

                    {analysis.equation && (
                      <div className="p-3 bg-blue-50 rounded-lg font-mono text-center">
                        {analysis.equation}
                      </div>
                    )}

                    {analysis.significant_predictors && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Significant Predictors: </span>
                        <span className="text-green-600 font-medium">{analysis.significant_predictors}</span>
                      </div>
                    )}

                    {analysis.interpretation && (
                      <div className="p-3 bg-gray-50 rounded-lg text-sm">
                        <span className="font-medium">Interpretation: </span>
                        {analysis.interpretation}
                      </div>
                    )}

                    {analysis.recommendations && (
                      <div className="p-3 bg-green-50 rounded-lg text-sm">
                        <span className="font-medium text-green-700">Recommendations: </span>
                        <span className="text-green-600">{analysis.recommendations}</span>
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
              <TrendingUp className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Regression Analyses</h3>
              <p className="text-muted-foreground mb-4">
                Add regression analyses to understand relationships between process variables.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Analysis
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Regression Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>R² &gt; 0.7:</strong> Good model fit</li>
              <li>• <strong>P-value &lt; 0.05:</strong> Statistically significant relationship</li>
              <li>• Check residual plots for model assumptions</li>
              <li>• Use adjusted R² for multiple regression</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaRegression;
