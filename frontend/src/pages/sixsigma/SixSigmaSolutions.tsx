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
import { sixsigmaApi, Solution } from '@/lib/sixsigmaApi';
import { Lightbulb, Plus, Trash2, Loader2, AlertCircle, Star, DollarSign, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const SixSigmaSolutions = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [solutions, setSolutions] = useState<Solution[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newSolution, setNewSolution] = useState({
    title: '',
    description: '',
    root_cause_addressed: '',
    impact_score: 5,
    effort_score: 5,
    cost_estimate: 0,
    time_estimate: '',
    status: 'proposed',
  });

  useEffect(() => {
    if (id) loadSolutions();
  }, [id]);

  const loadSolutions = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await sixsigmaApi.solutions.getAll(id);
      setSolutions(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load solutions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const created = await sixsigmaApi.solutions.create(id, newSolution);
      setSolutions([...solutions, created]);
      setShowForm(false);
      setNewSolution({
        title: '',
        description: '',
        root_cause_addressed: '',
        impact_score: 5,
        effort_score: 5,
        cost_estimate: 0,
        time_estimate: '',
        status: 'proposed',
      });
      toast({ title: 'Solution Added', description: 'Solution created successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (solutionId: number) => {
    if (!id) return;
    try {
      await sixsigmaApi.solutions.delete(id, solutionId);
      setSolutions(solutions.filter(s => s.id !== solutionId));
      toast({ title: 'Deleted', description: 'Solution removed.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleUpdateStatus = async (solutionId: number, status: string) => {
    if (!id) return;
    try {
      await sixsigmaApi.solutions.update(id, solutionId, { status });
      setSolutions(solutions.map(s => s.id === solutionId ? { ...s, status } : s));
      toast({ title: 'Updated', description: 'Solution status updated.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const getQuadrant = (impact: number, effort: number) => {
    if (impact >= 5 && effort < 5) return { label: 'Quick Win', color: 'bg-green-500' };
    if (impact >= 5 && effort >= 5) return { label: 'Major Project', color: 'bg-blue-500' };
    if (impact < 5 && effort < 5) return { label: 'Fill-In', color: 'bg-yellow-500' };
    return { label: 'Thankless Task', color: 'bg-gray-500' };
  };

  const statusColors: Record<string, string> = {
    proposed: 'bg-gray-500',
    approved: 'bg-blue-500',
    in_progress: 'bg-yellow-500',
    implemented: 'bg-green-500',
    rejected: 'bg-red-500',
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

  // Sort solutions by priority (impact/effort ratio)
  const sortedSolutions = [...solutions].sort((a, b) => {
    const priorityA = (a.impact_score || 5) / (a.effort_score || 5);
    const priorityB = (b.impact_score || 5) / (b.effort_score || 5);
    return priorityB - priorityA;
  });

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-yellow-600" />
              Solution Design
            </h1>
            <p className="text-muted-foreground">Develop and prioritize improvement solutions</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Solution
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Priority Matrix Summary */}
        {solutions.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            <Card className="bg-green-50 border-green-200">
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-green-700">
                  {solutions.filter(s => (s.impact_score || 5) >= 5 && (s.effort_score || 5) < 5).length}
                </div>
                <div className="text-sm text-green-600">Quick Wins</div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-blue-700">
                  {solutions.filter(s => (s.impact_score || 5) >= 5 && (s.effort_score || 5) >= 5).length}
                </div>
                <div className="text-sm text-blue-600">Major Projects</div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-yellow-200">
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-yellow-700">
                  {solutions.filter(s => (s.impact_score || 5) < 5 && (s.effort_score || 5) < 5).length}
                </div>
                <div className="text-sm text-yellow-600">Fill-Ins</div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 border-gray-200">
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-gray-700">
                  {solutions.filter(s => (s.impact_score || 5) < 5 && (s.effort_score || 5) >= 5).length}
                </div>
                <div className="text-sm text-gray-600">Avoid</div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* New Solution Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add Solution</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Solution Title</label>
                <Input
                  value={newSolution.title}
                  onChange={(e) => setNewSolution({ ...newSolution, title: e.target.value })}
                  placeholder="e.g., Implement automated quality checks"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newSolution.description}
                  onChange={(e) => setNewSolution({ ...newSolution, description: e.target.value })}
                  placeholder="Describe the solution in detail..."
                  rows={3}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Root Cause Addressed</label>
                <Input
                  value={newSolution.root_cause_addressed}
                  onChange={(e) => setNewSolution({ ...newSolution, root_cause_addressed: e.target.value })}
                  placeholder="Which root cause does this address?"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Impact Score (1-10)</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={newSolution.impact_score}
                    onChange={(e) => setNewSolution({ ...newSolution, impact_score: parseInt(e.target.value) || 5 })}
                  />
                  <span className="text-xs text-muted-foreground">Higher = More impact on problem</span>
                </div>
                <div>
                  <label className="text-sm font-medium">Effort Score (1-10)</label>
                  <Input
                    type="number"
                    min={1}
                    max={10}
                    value={newSolution.effort_score}
                    onChange={(e) => setNewSolution({ ...newSolution, effort_score: parseInt(e.target.value) || 5 })}
                  />
                  <span className="text-xs text-muted-foreground">Higher = More effort required</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Cost Estimate ($)</label>
                  <Input
                    type="number"
                    value={newSolution.cost_estimate}
                    onChange={(e) => setNewSolution({ ...newSolution, cost_estimate: parseFloat(e.target.value) || 0 })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Time Estimate</label>
                  <Input
                    value={newSolution.time_estimate}
                    onChange={(e) => setNewSolution({ ...newSolution, time_estimate: e.target.value })}
                    placeholder="e.g., 2 weeks"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Solution
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Solutions List */}
        {sortedSolutions.length > 0 ? (
          <div className="space-y-4">
            {sortedSolutions.map((solution, index) => {
              const quadrant = getQuadrant(solution.impact_score || 5, solution.effort_score || 5);
              return (
                <Card key={solution.id}>
                  <CardContent className="pt-4">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-lg font-semibold">#{index + 1}</span>
                          <Badge className={quadrant.color}>{quadrant.label}</Badge>
                          <Badge className={statusColors[solution.status || 'proposed']}>
                            {solution.status?.replace('_', ' ')}
                          </Badge>
                        </div>
                        <h3 className="text-lg font-medium mb-1">{solution.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">{solution.description}</p>
                        
                        <div className="grid grid-cols-4 gap-4 text-sm">
                          <div className="flex items-center gap-1">
                            <Star className="h-4 w-4 text-yellow-500" />
                            <span>Impact: {solution.impact_score}/10</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-blue-500" />
                            <span>Effort: {solution.effort_score}/10</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-4 w-4 text-green-500" />
                            <span>${solution.cost_estimate?.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-purple-500" />
                            <span>{solution.time_estimate || 'TBD'}</span>
                          </div>
                        </div>
                        
                        {solution.root_cause_addressed && (
                          <div className="mt-2 text-sm">
                            <span className="text-muted-foreground">Addresses: </span>
                            <span className="text-blue-600">{solution.root_cause_addressed}</span>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-col gap-2">
                        <Select 
                          value={solution.status || 'proposed'} 
                          onValueChange={(v) => handleUpdateStatus(solution.id, v)}
                        >
                          <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="proposed">Proposed</SelectItem>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="implemented">Implemented</SelectItem>
                            <SelectItem value="rejected">Rejected</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(solution.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Lightbulb className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Solutions Yet</h3>
              <p className="text-muted-foreground mb-4">
                Brainstorm and add solutions to address your identified root causes.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Solution
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Impact/Effort Matrix</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• <strong>Quick Wins:</strong> High impact, low effort → Do first!</li>
              <li>• <strong>Major Projects:</strong> High impact, high effort → Plan carefully</li>
              <li>• <strong>Fill-Ins:</strong> Low impact, low effort → Do when time permits</li>
              <li>• <strong>Avoid:</strong> Low impact, high effort → Not worth the investment</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaSolutions;
