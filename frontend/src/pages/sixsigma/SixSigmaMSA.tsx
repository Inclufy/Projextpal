import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { sixsigmaApi, MSAResult } from '@/lib/sixsigmaApi';
import { Gauge, Plus, Trash2, Loader2, AlertCircle, CheckCircle, XCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const SixSigmaMSA = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msaResults, setMsaResults] = useState<MSAResult[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newMsa, setNewMsa] = useState({
    measurement_name: '',
    study_type: 'gage_rr',
    number_of_operators: 3,
    number_of_parts: 10,
    number_of_trials: 3,
    repeatability: 0,
    reproducibility: 0,
    total_gage_rr: 0,
    part_to_part: 0,
    total_variation: 0,
    percent_study_var: 0,
    percent_tolerance: 0,
    number_of_distinct_categories: 0,
    conclusion: '',
    recommendations: '',
  });

  useEffect(() => {
    if (id) loadMSA();
  }, [id]);

  const loadMSA = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await sixsigmaApi.msa.getAll(id);
      setMsaResults(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load MSA results');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const created = await sixsigmaApi.msa.create(id, newMsa);
      setMsaResults([...msaResults, created]);
      setShowForm(false);
      setNewMsa({
        measurement_name: '',
        study_type: 'gage_rr',
        number_of_operators: 3,
        number_of_parts: 10,
        number_of_trials: 3,
        repeatability: 0,
        reproducibility: 0,
        total_gage_rr: 0,
        part_to_part: 0,
        total_variation: 0,
        percent_study_var: 0,
        percent_tolerance: 0,
        number_of_distinct_categories: 0,
        conclusion: '',
        recommendations: '',
      });
      toast({ title: 'MSA Added', description: 'Measurement system analysis created.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (msaId: number) => {
    if (!id) return;
    try {
      await sixsigmaApi.msa.delete(id, msaId);
      setMsaResults(msaResults.filter(m => m.id !== msaId));
      toast({ title: 'Deleted', description: 'MSA result removed.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const getAcceptability = (percentStudyVar: number) => {
    if (percentStudyVar < 10) return { label: 'Excellent', color: 'bg-green-500' };
    if (percentStudyVar < 30) return { label: 'Acceptable', color: 'bg-yellow-500' };
    return { label: 'Unacceptable', color: 'bg-red-500' };
  };

  const getNDCAcceptability = (ndc: number) => {
    if (ndc >= 5) return { label: 'Adequate', color: 'bg-green-500' };
    return { label: 'Inadequate', color: 'bg-red-500' };
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
              <Gauge className="h-6 w-6 text-cyan-600" />
              Measurement System Analysis (MSA)
            </h1>
            <p className="text-muted-foreground">Validate your measurement systems before collecting data</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add MSA Study
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* New MSA Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add MSA Study</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Measurement Name</label>
                  <Input
                    value={newMsa.measurement_name}
                    onChange={(e) => setNewMsa({ ...newMsa, measurement_name: e.target.value })}
                    placeholder="e.g., Cycle Time Measurement"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Study Type</label>
                  <select 
                    className="w-full h-10 rounded-md border border-input bg-background px-3"
                    value={newMsa.study_type}
                    onChange={(e) => setNewMsa({ ...newMsa, study_type: e.target.value })}
                  >
                    <option value="gage_rr">Gage R&R</option>
                    <option value="attribute_agreement">Attribute Agreement</option>
                    <option value="linearity">Linearity</option>
                    <option value="bias">Bias Study</option>
                    <option value="stability">Stability Study</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium"># Operators</label>
                  <Input
                    type="number"
                    value={newMsa.number_of_operators}
                    onChange={(e) => setNewMsa({ ...newMsa, number_of_operators: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium"># Parts</label>
                  <Input
                    type="number"
                    value={newMsa.number_of_parts}
                    onChange={(e) => setNewMsa({ ...newMsa, number_of_parts: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium"># Trials</label>
                  <Input
                    type="number"
                    value={newMsa.number_of_trials}
                    onChange={(e) => setNewMsa({ ...newMsa, number_of_trials: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium">Repeatability (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newMsa.repeatability}
                    onChange={(e) => setNewMsa({ ...newMsa, repeatability: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Reproducibility (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newMsa.reproducibility}
                    onChange={(e) => setNewMsa({ ...newMsa, reproducibility: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Total Gage R&R (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newMsa.total_gage_rr}
                    onChange={(e) => setNewMsa({ ...newMsa, total_gage_rr: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Part-to-Part (%)</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newMsa.part_to_part}
                    onChange={(e) => setNewMsa({ ...newMsa, part_to_part: parseFloat(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">% Study Variation</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newMsa.percent_study_var}
                    onChange={(e) => setNewMsa({ ...newMsa, percent_study_var: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">% Tolerance</label>
                  <Input
                    type="number"
                    step="0.01"
                    value={newMsa.percent_tolerance}
                    onChange={(e) => setNewMsa({ ...newMsa, percent_tolerance: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium"># Distinct Categories (ndc)</label>
                  <Input
                    type="number"
                    value={newMsa.number_of_distinct_categories}
                    onChange={(e) => setNewMsa({ ...newMsa, number_of_distinct_categories: parseInt(e.target.value) || 0 })}
                  />
                </div>
              </div>

              <div>
                <label className="text-sm font-medium">Conclusion</label>
                <Textarea
                  value={newMsa.conclusion}
                  onChange={(e) => setNewMsa({ ...newMsa, conclusion: e.target.value })}
                  placeholder="Summary of MSA results..."
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Recommendations</label>
                <Textarea
                  value={newMsa.recommendations}
                  onChange={(e) => setNewMsa({ ...newMsa, recommendations: e.target.value })}
                  placeholder="Actions to improve measurement system if needed..."
                  rows={2}
                />
              </div>

              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add MSA
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* MSA Results */}
        {msaResults.length > 0 ? (
          <div className="space-y-4">
            {msaResults.map(msa => {
              const acceptability = getAcceptability(msa.percent_study_var || 0);
              const ndcAcceptability = getNDCAcceptability(msa.number_of_distinct_categories || 0);

              return (
                <Card key={msa.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{msa.measurement_name}</CardTitle>
                        <Badge variant="outline">{msa.study_type?.replace('_', ' ')}</Badge>
                        <Badge className={acceptability.color}>{acceptability.label}</Badge>
                      </div>
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(msa.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-6 gap-4 text-center">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-muted-foreground">Repeatability</div>
                        <div className="font-bold">{msa.repeatability}%</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-muted-foreground">Reproducibility</div>
                        <div className="font-bold">{msa.reproducibility}%</div>
                      </div>
                      <div className={`p-3 rounded-lg ${(msa.total_gage_rr || 0) < 10 ? 'bg-green-50' : (msa.total_gage_rr || 0) < 30 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                        <div className="text-xs text-muted-foreground">Total Gage R&R</div>
                        <div className="font-bold">{msa.total_gage_rr}%</div>
                      </div>
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-xs text-muted-foreground">Part-to-Part</div>
                        <div className="font-bold">{msa.part_to_part}%</div>
                      </div>
                      <div className={`p-3 rounded-lg ${(msa.percent_study_var || 0) < 10 ? 'bg-green-50' : (msa.percent_study_var || 0) < 30 ? 'bg-yellow-50' : 'bg-red-50'}`}>
                        <div className="text-xs text-muted-foreground">% Study Var</div>
                        <div className="font-bold">{msa.percent_study_var}%</div>
                      </div>
                      <div className={`p-3 rounded-lg ${(msa.number_of_distinct_categories || 0) >= 5 ? 'bg-green-50' : 'bg-red-50'}`}>
                        <div className="text-xs text-muted-foreground">NDC</div>
                        <div className="font-bold">{msa.number_of_distinct_categories}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Operators: </span>
                        {msa.number_of_operators}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Parts: </span>
                        {msa.number_of_parts}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Trials: </span>
                        {msa.number_of_trials}
                      </div>
                    </div>

                    {msa.conclusion && (
                      <div className="p-3 bg-blue-50 rounded-lg text-sm">
                        <span className="font-medium text-blue-700">Conclusion: </span>
                        <span className="text-blue-600">{msa.conclusion}</span>
                      </div>
                    )}

                    {msa.recommendations && (
                      <div className="p-3 bg-yellow-50 rounded-lg text-sm">
                        <span className="font-medium text-yellow-700">Recommendations: </span>
                        <span className="text-yellow-600">{msa.recommendations}</span>
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
              <Gauge className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No MSA Studies</h3>
              <p className="text-muted-foreground mb-4">
                Validate your measurement system before collecting baseline data.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First MSA Study
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 MSA Acceptability Criteria</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>% Study Variation &lt; 10%:</strong> Excellent measurement system</li>
              <li>• <strong>% Study Variation 10-30%:</strong> Acceptable, may need improvement</li>
              <li>• <strong>% Study Variation &gt; 30%:</strong> Unacceptable, must improve before use</li>
              <li>• <strong>NDC ≥ 5:</strong> System can distinguish between parts adequately</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaMSA;
