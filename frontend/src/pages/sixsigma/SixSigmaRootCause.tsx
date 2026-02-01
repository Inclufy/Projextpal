import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { sixsigmaApi, RootCauseAnalysis } from '@/lib/sixsigmaApi';
import { Search, Plus, Trash2, Loader2, AlertCircle, ArrowDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const SixSigmaRootCause = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analyses, setAnalyses] = useState<RootCauseAnalysis[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newAnalysis, setNewAnalysis] = useState({
    problem_statement: '',
    why_1: '',
    why_2: '',
    why_3: '',
    why_4: '',
    why_5: '',
    root_cause: '',
    verification: '',
    countermeasure: '',
    status: 'identified',
  });

  useEffect(() => {
    if (id) loadAnalyses();
  }, [id]);

  const loadAnalyses = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await sixsigmaApi.rootCause.getAll(id);
      setAnalyses(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load root cause analyses');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const created = await sixsigmaApi.rootCause.create(id, newAnalysis);
      setAnalyses([...analyses, created]);
      setShowForm(false);
      setNewAnalysis({
        problem_statement: '',
        why_1: '',
        why_2: '',
        why_3: '',
        why_4: '',
        why_5: '',
        root_cause: '',
        verification: '',
        countermeasure: '',
        status: 'identified',
      });
      toast({ title: 'Analysis Added', description: '5 Whys analysis created.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (analysisId: number) => {
    if (!id) return;
    try {
      await sixsigmaApi.rootCause.delete(id, analysisId);
      setAnalyses(analyses.filter(a => a.id !== analysisId));
      toast({ title: 'Deleted', description: 'Analysis removed.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const statusColors: Record<string, string> = {
    identified: 'bg-blue-500',
    verified: 'bg-green-500',
    addressed: 'bg-purple-500',
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
              <Search className="h-6 w-6 text-amber-600" />
              Root Cause Analysis (5 Whys)
            </h1>
            <p className="text-muted-foreground">Drill down to find the true root cause of problems</p>
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
              <CardTitle>5 Whys Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium">Problem Statement</label>
                <Textarea
                  value={newAnalysis.problem_statement}
                  onChange={(e) => setNewAnalysis({ ...newAnalysis, problem_statement: e.target.value })}
                  placeholder="Clearly describe the problem you're analyzing..."
                  rows={2}
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-16 h-8 bg-amber-500 text-white rounded flex items-center justify-center text-sm font-medium">Why 1</div>
                  <Input
                    value={newAnalysis.why_1}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, why_1: e.target.value })}
                    placeholder="Why does this problem occur?"
                    className="flex-1"
                  />
                </div>
                <div className="flex justify-center"><ArrowDown className="h-4 w-4 text-muted-foreground" /></div>
                
                <div className="flex items-start gap-3">
                  <div className="w-16 h-8 bg-amber-500 text-white rounded flex items-center justify-center text-sm font-medium">Why 2</div>
                  <Input
                    value={newAnalysis.why_2}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, why_2: e.target.value })}
                    placeholder="Why does that happen?"
                    className="flex-1"
                  />
                </div>
                <div className="flex justify-center"><ArrowDown className="h-4 w-4 text-muted-foreground" /></div>
                
                <div className="flex items-start gap-3">
                  <div className="w-16 h-8 bg-amber-500 text-white rounded flex items-center justify-center text-sm font-medium">Why 3</div>
                  <Input
                    value={newAnalysis.why_3}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, why_3: e.target.value })}
                    placeholder="Why does that happen?"
                    className="flex-1"
                  />
                </div>
                <div className="flex justify-center"><ArrowDown className="h-4 w-4 text-muted-foreground" /></div>
                
                <div className="flex items-start gap-3">
                  <div className="w-16 h-8 bg-amber-500 text-white rounded flex items-center justify-center text-sm font-medium">Why 4</div>
                  <Input
                    value={newAnalysis.why_4}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, why_4: e.target.value })}
                    placeholder="Why does that happen?"
                    className="flex-1"
                  />
                </div>
                <div className="flex justify-center"><ArrowDown className="h-4 w-4 text-muted-foreground" /></div>
                
                <div className="flex items-start gap-3">
                  <div className="w-16 h-8 bg-amber-500 text-white rounded flex items-center justify-center text-sm font-medium">Why 5</div>
                  <Input
                    value={newAnalysis.why_5}
                    onChange={(e) => setNewAnalysis({ ...newAnalysis, why_5: e.target.value })}
                    placeholder="Why does that happen?"
                    className="flex-1"
                  />
                </div>
              </div>

              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <label className="text-sm font-medium text-red-700">Root Cause</label>
                <Input
                  value={newAnalysis.root_cause}
                  onChange={(e) => setNewAnalysis({ ...newAnalysis, root_cause: e.target.value })}
                  placeholder="The fundamental root cause identified..."
                  className="mt-2 bg-white"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Verification Method</label>
                <Input
                  value={newAnalysis.verification}
                  onChange={(e) => setNewAnalysis({ ...newAnalysis, verification: e.target.value })}
                  placeholder="How will you verify this is the true root cause?"
                />
              </div>

              <div>
                <label className="text-sm font-medium">Proposed Countermeasure</label>
                <Textarea
                  value={newAnalysis.countermeasure}
                  onChange={(e) => setNewAnalysis({ ...newAnalysis, countermeasure: e.target.value })}
                  placeholder="What action will address this root cause?"
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
            {analyses.map(analysis => (
              <Card key={analysis.id}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CardTitle className="text-lg">Problem: {analysis.problem_statement}</CardTitle>
                      <Badge className={statusColors[analysis.status || 'identified']}>
                        {analysis.status}
                      </Badge>
                    </div>
                    <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(analysis.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2 mb-4">
                    {[
                      { label: 'Why 1', value: analysis.why_1 },
                      { label: 'Why 2', value: analysis.why_2 },
                      { label: 'Why 3', value: analysis.why_3 },
                      { label: 'Why 4', value: analysis.why_4 },
                      { label: 'Why 5', value: analysis.why_5 },
                    ].filter(w => w.value).map((why, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <Badge variant="outline" className="w-16 justify-center">{why.label}</Badge>
                        <span className="text-sm">{why.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="p-3 bg-red-50 rounded-lg mb-3">
                    <span className="text-sm font-medium text-red-700">Root Cause: </span>
                    <span className="text-red-600">{analysis.root_cause}</span>
                  </div>

                  {analysis.countermeasure && (
                    <div className="p-3 bg-green-50 rounded-lg">
                      <span className="text-sm font-medium text-green-700">Countermeasure: </span>
                      <span className="text-green-600">{analysis.countermeasure}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Search className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Root Cause Analyses</h3>
              <p className="text-muted-foreground mb-4">
                Use the 5 Whys technique to drill down to root causes.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Start First Analysis
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 5 Whys Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Keep asking "why" until you reach a root cause you can act on</li>
              <li>• You may not always need exactly 5 whys - could be fewer or more</li>
              <li>• Verify the root cause before implementing countermeasures</li>
              <li>• If the answer branches, create separate 5 Whys analyses</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaRootCause;
