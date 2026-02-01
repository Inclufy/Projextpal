import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { sixsigmaApi, FishboneDiagram, FishboneCause } from '@/lib/sixsigmaApi';
import { 
  Fish, Plus, Trash2, Save, Loader2, AlertCircle, 
  ThumbsUp, CheckCircle, Target 
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
type CauseCategory = 'man' | 'machine' | 'method' | 'material' | 'measurement' | 'environment';

const categoryConfig: Record<CauseCategory, { label: string; color: string; icon: string }> = {
  man: { label: 'Man (People)', color: 'bg-blue-500', icon: '👤' },
  machine: { label: 'Machine (Equipment)', color: 'bg-purple-500', icon: '⚙️' },
  method: { label: 'Method (Process)', color: 'bg-green-500', icon: '📋' },
  material: { label: 'Material', color: 'bg-orange-500', icon: '📦' },
  measurement: { label: 'Measurement', color: 'bg-red-500', icon: '📏' },
  environment: { label: 'Environment', color: 'bg-teal-500', icon: '🌍' },
};

const SixSigmaFishbone = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [diagram, setDiagram] = useState<FishboneDiagram | null>(null);
  const [problemStatement, setProblemStatement] = useState('');
  const [causes, setCauses] = useState<Record<CauseCategory, FishboneCause[]>>({
    man: [],
    machine: [],
    method: [],
    material: [],
    measurement: [],
    environment: [],
  });
  const [newCause, setNewCause] = useState<Record<CauseCategory, string>>({
    man: '',
    machine: '',
    method: '',
    material: '',
    measurement: '',
    environment: '',
  });

  // Load data
  useEffect(() => {
    if (id) {
      loadFishbone();
    }
  }, [id]);

  const loadFishbone = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const diagrams = await sixsigmaApi.fishbone.getAll(id);
      
      if (diagrams.length > 0) {
        const diag = diagrams[0];
        setDiagram(diag);
        setProblemStatement(diag.problem_statement || '');
        
        // Group causes by category
        const groupedCauses: Record<CauseCategory, FishboneCause[]> = {
          man: [],
          machine: [],
          method: [],
          material: [],
          measurement: [],
          environment: [],
        };
        
        if (diag.causes) {
          diag.causes.forEach(cause => {
            if (groupedCauses[cause.category]) {
              groupedCauses[cause.category].push(cause);
            }
          });
        }
        
        setCauses(groupedCauses);
      }
    } catch (err: any) {
      console.error('Error loading Fishbone:', err);
      setError(err.message || 'Failed to load Fishbone diagram');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDiagram = async () => {
    if (!id) return;
    
    setSaving(true);
    
    try {
      if (diagram) {
        await sixsigmaApi.fishbone.update(id, diagram.id, {
          problem_statement: problemStatement,
        });
      } else {
        const newDiagram = await sixsigmaApi.fishbone.create(id, {
          problem_statement: problemStatement,
        });
        setDiagram(newDiagram);
      }

      toast({
        title: 'Saved',
        description: 'Fishbone diagram updated successfully.',
      });
    } catch (err: any) {
      console.error('Error saving Fishbone:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to save diagram',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAddCause = async (category: CauseCategory) => {
    if (!id || !diagram || !newCause[category].trim()) return;
    
    try {
      const cause = await sixsigmaApi.causes.create(id, {
        fishbone: diagram.id,
        category,
        cause: newCause[category].trim(),
        votes: 0,
        is_root_cause: false,
        is_verified: false,
      });
      
      setCauses(prev => ({
        ...prev,
        [category]: [...prev[category], cause],
      }));
      
      setNewCause(prev => ({ ...prev, [category]: '' }));
      
      toast({
        title: 'Cause Added',
        description: `Added cause to ${categoryConfig[category].label}`,
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to add cause',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteCause = async (category: CauseCategory, causeId: number) => {
    if (!id) return;
    
    try {
      await sixsigmaApi.causes.delete(id, causeId);
      
      setCauses(prev => ({
        ...prev,
        [category]: prev[category].filter(c => c.id !== causeId),
      }));
      
      toast({
        title: 'Deleted',
        description: 'Cause removed successfully.',
      });
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to delete cause',
        variant: 'destructive',
      });
    }
  };

  const handleVote = async (category: CauseCategory, causeId: number) => {
    if (!id) return;
    
    try {
      const updated = await sixsigmaApi.causes.vote(id, causeId);
      
      setCauses(prev => ({
        ...prev,
        [category]: prev[category].map(c => 
          c.id === causeId ? { ...c, votes: (c.votes || 0) + 1 } : c
        ),
      }));
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to vote',
        variant: 'destructive',
      });
    }
  };

  const handleToggleRootCause = async (category: CauseCategory, causeId: number) => {
    if (!id) return;
    
    try {
      await sixsigmaApi.causes.toggleRootCause(id, causeId);
      
      setCauses(prev => ({
        ...prev,
        [category]: prev[category].map(c => 
          c.id === causeId ? { ...c, is_root_cause: !c.is_root_cause } : c
        ),
      }));
    } catch (err: any) {
      toast({
        title: 'Error',
        description: err.message || 'Failed to toggle root cause',
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
          <span className="ml-2">Loading Fishbone diagram...</span>
        </div>
      </div>
    );
  }

  const totalCauses = Object.values(causes).flat().length;
  const rootCauses = Object.values(causes).flat().filter(c => c.is_root_cause).length;
  const verifiedCauses = Object.values(causes).flat().filter(c => c.is_verified).length;

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Fish className="h-6 w-6 text-blue-600" />
              Fishbone Diagram (Ishikawa)
            </h1>
            <p className="text-muted-foreground">Root Cause Analysis using 6M Categories</p>
          </div>
          <Button onClick={handleSaveDiagram} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{totalCauses}</div>
              <div className="text-sm text-muted-foreground">Total Causes</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-orange-600">{rootCauses}</div>
              <div className="text-sm text-muted-foreground">Root Causes Identified</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{verifiedCauses}</div>
              <div className="text-sm text-muted-foreground">Verified</div>
            </CardContent>
          </Card>
        </div>

        {/* Problem Statement */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-red-500" />
              Problem Statement (Effect)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Textarea
              value={problemStatement}
              onChange={(e) => setProblemStatement(e.target.value)}
              placeholder="What is the problem you're trying to solve? Be specific and measurable."
              rows={3}
              className="text-lg"
            />
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* 6M Categories */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
          {(Object.keys(categoryConfig) as CauseCategory[]).map(category => (
            <Card key={category}>
              <CardHeader className={`${categoryConfig[category].color} text-white rounded-t-lg py-3`}>
                <CardTitle className="text-lg flex items-center gap-2">
                  <span>{categoryConfig[category].icon}</span>
                  {categoryConfig[category].label}
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-4 space-y-3">
                {/* Existing causes */}
                {causes[category].map(cause => (
                  <div 
                    key={cause.id} 
                    className={`p-3 rounded-lg border ${
                      cause.is_root_cause ? 'border-orange-300 bg-orange-50' : 'border-gray-200'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-sm flex-1">{cause.cause}</span>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleVote(category, cause.id)}
                          className="h-7 px-2"
                        >
                          <ThumbsUp className="h-3 w-3 mr-1" />
                          {cause.votes || 0}
                        </Button>
                        <Button
                          variant={cause.is_root_cause ? "default" : "ghost"}
                          size="sm"
                          onClick={() => handleToggleRootCause(category, cause.id)}
                          className="h-7 px-2"
                          title="Mark as root cause"
                        >
                          <Target className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteCause(category, cause.id)}
                          className="h-7 px-2 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    {cause.is_root_cause && (
                      <Badge variant="outline" className="mt-2 text-orange-600 border-orange-300">
                        Root Cause
                      </Badge>
                    )}
                    {cause.is_verified && (
                      <Badge variant="outline" className="mt-2 ml-2 text-green-600 border-green-300">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        Verified
                      </Badge>
                    )}
                  </div>
                ))}
                
                {/* Add new cause */}
                <div className="flex gap-2">
                  <Input
                    value={newCause[category]}
                    onChange={(e) => setNewCause(prev => ({ ...prev, [category]: e.target.value }))}
                    placeholder="Add potential cause..."
                    className="text-sm"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        handleAddCause(category);
                      }
                    }}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => handleAddCause(category)}
                    disabled={!diagram || !newCause[category].trim()}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Instructions */}
        {!diagram && (
          <Card className="bg-yellow-50 border-yellow-200">
            <CardContent className="pt-4">
              <h4 className="font-medium text-yellow-800 mb-2">⚠️ Getting Started</h4>
              <p className="text-sm text-yellow-700">
                Enter a problem statement above and click "Save" to create your Fishbone diagram.
                Then you can add causes to each category.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Fishbone Analysis Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Ask "Why?" 5 times to drill down to root causes</li>
              <li>• Use voting to prioritize which causes to investigate first</li>
              <li>• Mark verified causes after data analysis confirms them</li>
              <li>• Focus on causes you can actually control or influence</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaFishbone;