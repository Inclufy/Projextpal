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
import { sixsigmaApi, HypothesisTest } from '@/lib/sixsigmaApi';
import { FlaskConical, Plus, Trash2, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const testTypes = [
  { value: 't_test', label: 'T-Test' },
  { value: 'chi_square', label: 'Chi-Square Test' },
  { value: 'anova', label: 'ANOVA' },
  { value: 'correlation', label: 'Correlation Analysis' },
  { value: 'regression', label: 'Regression Analysis' },
];

const SixSigmaHypothesis = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tests, setTests] = useState<HypothesisTest[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newTest, setNewTest] = useState({
    test_name: '',
    test_type: 't_test',
    null_hypothesis: '',
    alternative_hypothesis: '',
    alpha_level: 0.05,
    data_summary: '',
    notes: '',
  });

  useEffect(() => {
    if (id) loadTests();
  }, [id]);

  const loadTests = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await sixsigmaApi.hypothesis.getAll(id);
      setTests(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load hypothesis tests');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const created = await sixsigmaApi.hypothesis.create(id, {
        ...newTest,
        conclusion: 'pending',
      });
      setTests([...tests, created]);
      setShowForm(false);
      setNewTest({
        test_name: '',
        test_type: 't_test',
        null_hypothesis: '',
        alternative_hypothesis: '',
        alpha_level: 0.05,
        data_summary: '',
        notes: '',
      });
      toast({ title: 'Test Created', description: 'Hypothesis test added successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleRecordResults = async (testId: number, pValue: number, testStatistic: number) => {
    if (!id) return;
    try {
      const updated = await sixsigmaApi.hypothesis.recordResults(id, testId, pValue, testStatistic);
      setTests(tests.map(t => t.id === testId ? { ...t, p_value: pValue, test_statistic: testStatistic, conclusion: pValue < t.alpha_level ? 'reject_null' : 'fail_to_reject' } : t));
      toast({ title: 'Results Recorded', description: 'Test results saved.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async (testId: number) => {
    if (!id) return;
    try {
      await sixsigmaApi.hypothesis.delete(id, testId);
      setTests(tests.filter(t => t.id !== testId));
      toast({ title: 'Deleted', description: 'Hypothesis test removed.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
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
              <FlaskConical className="h-6 w-6 text-purple-600" />
              Hypothesis Testing
            </h1>
            <p className="text-muted-foreground">Statistical tests to validate root causes</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Test
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* New Test Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create Hypothesis Test</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Test Name</label>
                  <Input
                    value={newTest.test_name}
                    onChange={(e) => setNewTest({ ...newTest, test_name: e.target.value })}
                    placeholder="e.g., Shift vs Defect Rate"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Test Type</label>
                  <Select value={newTest.test_type} onValueChange={(v) => setNewTest({ ...newTest, test_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {testTypes.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Null Hypothesis (H₀)</label>
                <Input
                  value={newTest.null_hypothesis}
                  onChange={(e) => setNewTest({ ...newTest, null_hypothesis: e.target.value })}
                  placeholder="e.g., There is no difference between shifts"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Alternative Hypothesis (H₁)</label>
                <Input
                  value={newTest.alternative_hypothesis}
                  onChange={(e) => setNewTest({ ...newTest, alternative_hypothesis: e.target.value })}
                  placeholder="e.g., There is a significant difference between shifts"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Alpha Level (α)</label>
                  <Select value={String(newTest.alpha_level)} onValueChange={(v) => setNewTest({ ...newTest, alpha_level: parseFloat(v) })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0.01">0.01 (99% confidence)</SelectItem>
                      <SelectItem value="0.05">0.05 (95% confidence)</SelectItem>
                      <SelectItem value="0.10">0.10 (90% confidence)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Data Summary</label>
                <Textarea
                  value={newTest.data_summary}
                  onChange={(e) => setNewTest({ ...newTest, data_summary: e.target.value })}
                  placeholder="Describe the data being analyzed..."
                  rows={2}
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Test
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tests List */}
        {tests.length > 0 ? (
          <div className="space-y-4">
            {tests.map(test => (
              <Card key={test.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">{test.test_name}</CardTitle>
                      <Badge variant="outline">{testTypes.find(t => t.value === test.test_type)?.label}</Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      {test.conclusion === 'reject_null' && (
                        <Badge className="bg-green-500">Significant</Badge>
                      )}
                      {test.conclusion === 'fail_to_reject' && (
                        <Badge className="bg-gray-500">Not Significant</Badge>
                      )}
                      {test.conclusion === 'pending' && (
                        <Badge variant="outline">Pending Results</Badge>
                      )}
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(test.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div className="p-3 bg-gray-50 rounded-lg">
                      <span className="text-muted-foreground">H₀: </span>
                      {test.null_hypothesis}
                    </div>
                    <div className="p-3 bg-blue-50 rounded-lg">
                      <span className="text-muted-foreground">H₁: </span>
                      {test.alternative_hypothesis}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-4 gap-4 text-center">
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <div className="text-xs text-muted-foreground">Alpha (α)</div>
                      <div className="font-bold">{test.alpha_level}</div>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <div className="text-xs text-muted-foreground">P-Value</div>
                      <div className="font-bold">{test.p_value?.toFixed(4) || '—'}</div>
                    </div>
                    <div className="p-3 bg-gray-100 rounded-lg">
                      <div className="text-xs text-muted-foreground">Test Statistic</div>
                      <div className="font-bold">{test.test_statistic?.toFixed(4) || '—'}</div>
                    </div>
                    <div className={`p-3 rounded-lg ${test.p_value && test.p_value < test.alpha_level ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <div className="text-xs text-muted-foreground">Decision</div>
                      <div className="font-bold flex items-center justify-center gap-1">
                        {test.p_value ? (
                          test.p_value < test.alpha_level ? (
                            <><CheckCircle className="h-4 w-4 text-green-600" /> Reject H₀</>
                          ) : (
                            <><XCircle className="h-4 w-4 text-gray-600" /> Fail to Reject</>
                          )
                        ) : '—'}
                      </div>
                    </div>
                  </div>

                  {test.conclusion === 'pending' && (
                    <div className="flex items-center gap-2 p-3 bg-yellow-50 rounded-lg">
                      <span className="text-sm text-yellow-700">Enter results:</span>
                      <Input
                        type="number"
                        step="0.0001"
                        placeholder="P-Value"
                        className="w-32"
                        onBlur={(e) => {
                          const pValue = parseFloat(e.target.value);
                          if (!isNaN(pValue)) {
                            const statInput = e.target.nextElementSibling as HTMLInputElement;
                            const stat = parseFloat(statInput?.value || '0');
                            if (!isNaN(stat)) {
                              handleRecordResults(test.id, pValue, stat);
                            }
                          }
                        }}
                      />
                      <Input
                        type="number"
                        step="0.01"
                        placeholder="Test Statistic"
                        className="w-32"
                      />
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <FlaskConical className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Hypothesis Tests</h3>
              <p className="text-muted-foreground mb-4">
                Create statistical tests to validate your root cause hypotheses.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Test
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Hypothesis Testing Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• If p-value &lt; α → Reject null hypothesis (result is statistically significant)</li>
              <li>• T-Test: Compare means of two groups</li>
              <li>• Chi-Square: Test relationships between categorical variables</li>
              <li>• ANOVA: Compare means across 3+ groups</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaHypothesis;
