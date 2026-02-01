import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { sixsigmaApi, FMEA } from '@/lib/sixsigmaApi';
import { Shield, Plus, Trash2, Loader2, AlertCircle, AlertTriangle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const SixSigmaFMEA = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fmeaItems, setFmeaItems] = useState<FMEA[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newFmea, setNewFmea] = useState({
    process_step: '',
    potential_failure_mode: '',
    potential_effect: '',
    severity: 5,
    potential_cause: '',
    occurrence: 5,
    current_controls: '',
    detection: 5,
    recommended_actions: '',
    responsibility: '',
    target_date: '',
  });

  useEffect(() => {
    if (id) loadFMEA();
  }, [id]);

  const loadFMEA = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await sixsigmaApi.fmea.getAll(id);
      setFmeaItems(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load FMEA data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const created = await sixsigmaApi.fmea.create(id, newFmea);
      setFmeaItems([...fmeaItems, created]);
      setShowForm(false);
      setNewFmea({
        process_step: '',
        potential_failure_mode: '',
        potential_effect: '',
        severity: 5,
        potential_cause: '',
        occurrence: 5,
        current_controls: '',
        detection: 5,
        recommended_actions: '',
        responsibility: '',
        target_date: '',
      });
      toast({ title: 'FMEA Added', description: 'Failure mode analysis created.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (fmeaId: number) => {
    if (!id) return;
    try {
      await sixsigmaApi.fmea.delete(id, fmeaId);
      setFmeaItems(fmeaItems.filter(f => f.id !== fmeaId));
      toast({ title: 'Deleted', description: 'FMEA item removed.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const calculateRPN = (severity: number, occurrence: number, detection: number) => {
    return severity * occurrence * detection;
  };

  const getRPNColor = (rpn: number) => {
    if (rpn >= 200) return 'bg-red-500';
    if (rpn >= 100) return 'bg-orange-500';
    if (rpn >= 50) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getRPNLabel = (rpn: number) => {
    if (rpn >= 200) return 'Critical';
    if (rpn >= 100) return 'High';
    if (rpn >= 50) return 'Medium';
    return 'Low';
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

  // Sort by RPN (highest first)
  const sortedFmea = [...fmeaItems].sort((a, b) => {
    const rpnA = calculateRPN(a.severity || 5, a.occurrence || 5, a.detection || 5);
    const rpnB = calculateRPN(b.severity || 5, b.occurrence || 5, b.detection || 5);
    return rpnB - rpnA;
  });

  const highRiskCount = fmeaItems.filter(f => 
    calculateRPN(f.severity || 5, f.occurrence || 5, f.detection || 5) >= 100
  ).length;

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Shield className="h-6 w-6 text-red-600" />
              FMEA - Failure Mode & Effects Analysis
            </h1>
            <p className="text-muted-foreground">Identify and prioritize potential failure modes</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Failure Mode
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Summary Stats */}
        {fmeaItems.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold">{fmeaItems.length}</div>
                <div className="text-sm text-muted-foreground">Total Failure Modes</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-red-700">{highRiskCount}</div>
                <div className="text-sm text-red-600">High Risk (RPN ≥ 100)</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold">
                  {Math.round(fmeaItems.reduce((sum, f) => 
                    sum + calculateRPN(f.severity || 5, f.occurrence || 5, f.detection || 5), 0
                  ) / fmeaItems.length)}
                </div>
                <div className="text-sm text-muted-foreground">Avg RPN</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold">
                  {Math.max(...fmeaItems.map(f => 
                    calculateRPN(f.severity || 5, f.occurrence || 5, f.detection || 5)
                  ))}
                </div>
                <div className="text-sm text-muted-foreground">Max RPN</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New FMEA Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add Failure Mode Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Process Step</label>
                  <Input
                    value={newFmea.process_step}
                    onChange={(e) => setNewFmea({ ...newFmea, process_step: e.target.value })}
                    placeholder="e.g., Data Entry"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Potential Failure Mode</label>
                  <Input
                    value={newFmea.potential_failure_mode}
                    onChange={(e) => setNewFmea({ ...newFmea, potential_failure_mode: e.target.value })}
                    placeholder="e.g., Incorrect data entered"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Potential Effect</label>
                  <Input
                    value={newFmea.potential_effect}
                    onChange={(e) => setNewFmea({ ...newFmea, potential_effect: e.target.value })}
                    placeholder="e.g., Customer receives wrong product"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Potential Cause</label>
                  <Input
                    value={newFmea.potential_cause}
                    onChange={(e) => setNewFmea({ ...newFmea, potential_cause: e.target.value })}
                    placeholder="e.g., Lack of validation"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Severity (1-10)</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={newFmea.severity}
                    onChange={(e) => setNewFmea({ ...newFmea, severity: parseInt(e.target.value) || 5 })}
                  />
                  <span className="text-xs text-muted-foreground">Impact on customer</span>
                </div>
                <div>
                  <label className="text-sm font-medium">Occurrence (1-10)</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={newFmea.occurrence}
                    onChange={(e) => setNewFmea({ ...newFmea, occurrence: parseInt(e.target.value) || 5 })}
                  />
                  <span className="text-xs text-muted-foreground">How often it happens</span>
                </div>
                <div>
                  <label className="text-sm font-medium">Detection (1-10)</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={newFmea.detection}
                    onChange={(e) => setNewFmea({ ...newFmea, detection: parseInt(e.target.value) || 5 })}
                  />
                  <span className="text-xs text-muted-foreground">Ability to detect (10=hard)</span>
                </div>
              </div>
              <div className="p-3 bg-gray-100 rounded-lg text-center">
                <span className="text-sm text-muted-foreground">Calculated RPN: </span>
                <span className="text-lg font-bold">
                  {calculateRPN(newFmea.severity, newFmea.occurrence, newFmea.detection)}
                </span>
              </div>
              <div>
                <label className="text-sm font-medium">Current Controls</label>
                <Input
                  value={newFmea.current_controls}
                  onChange={(e) => setNewFmea({ ...newFmea, current_controls: e.target.value })}
                  placeholder="e.g., Manual review"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Recommended Actions</label>
                <Textarea
                  value={newFmea.recommended_actions}
                  onChange={(e) => setNewFmea({ ...newFmea, recommended_actions: e.target.value })}
                  placeholder="Actions to reduce RPN..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Responsibility</label>
                  <Input
                    value={newFmea.responsibility}
                    onChange={(e) => setNewFmea({ ...newFmea, responsibility: e.target.value })}
                    placeholder="Who is responsible?"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Target Date</label>
                  <Input
                    type="date"
                    value={newFmea.target_date}
                    onChange={(e) => setNewFmea({ ...newFmea, target_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add FMEA
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* FMEA Table */}
        {sortedFmea.length > 0 ? (
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-3">Process Step</th>
                      <th className="text-left p-3">Failure Mode</th>
                      <th className="text-left p-3">Effect</th>
                      <th className="text-center p-3">S</th>
                      <th className="text-left p-3">Cause</th>
                      <th className="text-center p-3">O</th>
                      <th className="text-left p-3">Controls</th>
                      <th className="text-center p-3">D</th>
                      <th className="text-center p-3">RPN</th>
                      <th className="text-left p-3">Actions</th>
                      <th className="p-3"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedFmea.map(fmea => {
                      const rpn = calculateRPN(fmea.severity || 5, fmea.occurrence || 5, fmea.detection || 5);
                      return (
                        <tr key={fmea.id} className="border-t hover:bg-gray-50">
                          <td className="p-3">{fmea.process_step}</td>
                          <td className="p-3">{fmea.potential_failure_mode}</td>
                          <td className="p-3">{fmea.potential_effect}</td>
                          <td className="p-3 text-center font-medium">{fmea.severity}</td>
                          <td className="p-3">{fmea.potential_cause}</td>
                          <td className="p-3 text-center font-medium">{fmea.occurrence}</td>
                          <td className="p-3">{fmea.current_controls}</td>
                          <td className="p-3 text-center font-medium">{fmea.detection}</td>
                          <td className="p-3 text-center">
                            <Badge className={getRPNColor(rpn)}>
                              {rpn}
                            </Badge>
                          </td>
                          <td className="p-3 max-w-[200px] truncate">{fmea.recommended_actions}</td>
                          <td className="p-3">
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(fmea.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No FMEA Data</h3>
              <p className="text-muted-foreground mb-4">
                Identify potential failure modes and their effects on your process.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Failure Mode
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 FMEA Guide</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>RPN = Severity × Occurrence × Detection</strong></li>
              <li>• <strong>Severity:</strong> 1 (no effect) to 10 (catastrophic)</li>
              <li>• <strong>Occurrence:</strong> 1 (rare) to 10 (very frequent)</li>
              <li>• <strong>Detection:</strong> 1 (always detected) to 10 (never detected)</li>
              <li>• Focus actions on items with RPN ≥ 100</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaFMEA;
