import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { sixsigmaApi, ParetoAnalysis, ParetoCategory } from '@/lib/sixsigmaApi';
import { BarChart3, Plus, Trash2, Save, Loader2, AlertCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const SixSigmaPareto = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  // State
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [analysis, setAnalysis] = useState<ParetoAnalysis | null>(null);
  const [analysisName, setAnalysisName] = useState('');
  const [description, setDescription] = useState('');
  const [categories, setCategories] = useState<{ name: string; count: number }[]>([]);

  // Load data
  useEffect(() => {
    if (id) {
      loadPareto();
    }
  }, [id]);

  const loadPareto = async () => {
    if (!id) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const analyses = await sixsigmaApi.pareto.getAll(id);
      
      if (analyses.length > 0) {
        const anal = analyses[0];
        setAnalysis(anal);
        setAnalysisName(anal.analysis_name || '');
        setDescription(anal.description || '');
        
        if (anal.categories && anal.categories.length > 0) {
          setCategories(
            anal.categories
              .sort((a, b) => b.count - a.count)
              .map(c => ({ name: c.category_name, count: c.count }))
          );
        } else {
          setCategories([{ name: '', count: 0 }]);
        }
      } else {
        setCategories([{ name: '', count: 0 }]);
      }
    } catch (err: any) {
      console.error('Error loading Pareto:', err);
      setError(err.message || 'Failed to load Pareto analysis');
      setCategories([{ name: '', count: 0 }]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!id) return;
    
    setSaving(true);
    
    try {
      // Filter out empty categories
      const validCategories = categories.filter(c => c.name.trim() && c.count > 0);
      
      if (analysis) {
        // Update existing analysis
        await sixsigmaApi.pareto.update(id, analysis.id, {
          analysis_name: analysisName,
          description: description,
        });
        
        // Delete existing categories and recreate
        if (analysis.categories) {
          for (const cat of analysis.categories) {
            await sixsigmaApi.paretoCategories.delete(id, cat.id);
          }
        }
      } else {
        // Create new analysis
        const newAnalysis = await sixsigmaApi.pareto.create(id, {
          analysis_name: analysisName || 'Pareto Analysis',
          description: description,
        });
        setAnalysis(newAnalysis);
      }
      
      // Create categories (after analysis exists)
      const analysisId = analysis?.id;
      if (analysisId && validCategories.length > 0) {
        const total = validCategories.reduce((sum, c) => sum + c.count, 0);
        let cumulative = 0;
        
        for (let i = 0; i < validCategories.length; i++) {
          const cat = validCategories[i];
          const percentage = (cat.count / total) * 100;
          cumulative += percentage;
          
          await sixsigmaApi.paretoCategories.create(id, {
            pareto: analysisId,
            category_name: cat.name,
            count: cat.count,
            order: i,
          });
        }
      }

      toast({
        title: 'Saved',
        description: 'Pareto analysis saved successfully.',
      });
      
      loadPareto();
    } catch (err: any) {
      console.error('Error saving Pareto:', err);
      toast({
        title: 'Error',
        description: err.message || 'Failed to save analysis',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const addCategory = () => {
    setCategories([...categories, { name: '', count: 0 }]);
  };

  const removeCategory = (index: number) => {
    setCategories(categories.filter((_, i) => i !== index));
  };

  const updateCategory = (index: number, field: 'name' | 'count', value: string | number) => {
    const updated = [...categories];
    updated[index] = { ...updated[index], [field]: value };
    setCategories(updated);
  };

  // Calculate statistics
  const sortedCategories = [...categories]
    .filter(c => c.name && c.count > 0)
    .sort((a, b) => b.count - a.count);
  
  const total = sortedCategories.reduce((sum, c) => sum + c.count, 0);
  
  let cumulative = 0;
  const chartData = sortedCategories.map(c => {
    const percentage = total > 0 ? (c.count / total) * 100 : 0;
    cumulative += percentage;
    return {
      name: c.name,
      count: c.count,
      percentage: percentage.toFixed(1),
      cumulative: cumulative.toFixed(1),
    };
  });

  // Find the 80% cutoff
  const vitalFewIndex = chartData.findIndex(d => parseFloat(d.cumulative) >= 80);

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Loading Pareto analysis...</span>
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
              <BarChart3 className="h-6 w-6 text-orange-600" />
              Pareto Analysis
            </h1>
            <p className="text-muted-foreground">Identify the vital few from the trivial many (80/20 rule)</p>
          </div>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Save className="h-4 w-4 mr-2" />
            )}
            Save Analysis
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Analysis Info */}
        <Card>
          <CardHeader>
            <CardTitle>Analysis Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Analysis Name</label>
                <Input
                  value={analysisName}
                  onChange={(e) => setAnalysisName(e.target.value)}
                  placeholder="e.g., Defect Type Analysis"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Input
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What are you analyzing?"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          {/* Data Entry */}
          <Card>
            <CardHeader>
              <CardTitle>Category Data</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {categories.map((cat, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Input
                    value={cat.name}
                    onChange={(e) => updateCategory(i, 'name', e.target.value)}
                    placeholder="Category name"
                    className="flex-1"
                  />
                  <Input
                    type="number"
                    value={cat.count || ''}
                    onChange={(e) => updateCategory(i, 'count', parseInt(e.target.value) || 0)}
                    placeholder="Count"
                    className="w-24"
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeCategory(i)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addCategory}>
                <Plus className="h-4 w-4 mr-1" />
                Add Category
              </Button>
            </CardContent>
          </Card>

          {/* Pareto Chart Visualization */}
          <Card>
            <CardHeader>
              <CardTitle>Pareto Chart</CardTitle>
            </CardHeader>
            <CardContent>
              {chartData.length > 0 ? (
                <div className="space-y-2">
                  {/* Simple bar representation */}
                  {chartData.map((item, i) => (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between text-sm">
                        <span className={i <= vitalFewIndex ? 'font-medium text-orange-600' : ''}>
                          {item.name}
                        </span>
                        <span className="text-muted-foreground">
                          {item.count} ({item.percentage}%)
                        </span>
                      </div>
                      <div className="relative h-6 bg-gray-100 rounded">
                        <div
                          className={`absolute left-0 top-0 h-full rounded ${
                            i <= vitalFewIndex ? 'bg-orange-500' : 'bg-gray-400'
                          }`}
                          style={{ width: `${item.percentage}%` }}
                        />
                        {/* Cumulative line marker */}
                        <div
                          className="absolute top-0 h-full w-0.5 bg-blue-600"
                          style={{ left: `${item.cumulative}%` }}
                        />
                      </div>
                      <div className="text-right text-xs text-blue-600">
                        Cumulative: {item.cumulative}%
                      </div>
                    </div>
                  ))}
                  
                  {/* 80% Line Legend */}
                  <div className="mt-4 pt-4 border-t flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-orange-500 rounded" />
                      <span>Vital Few (80%)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 bg-gray-400 rounded" />
                      <span>Trivial Many</span>
                    </div>
                  </div>
                </div>
              ) : (
                <p className="text-center text-muted-foreground py-8">
                  Add categories with counts to see the Pareto chart
                </p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        {chartData.length > 0 && vitalFewIndex >= 0 && (
          <Card className="bg-orange-50 border-orange-200">
            <CardContent className="pt-4">
              <h4 className="font-medium text-orange-800 mb-2">📊 Pareto Principle (80/20)</h4>
              <p className="text-sm text-orange-700">
                <strong>{vitalFewIndex + 1}</strong> out of <strong>{chartData.length}</strong> categories 
                account for approximately <strong>80%</strong> of the total. 
                Focus your improvement efforts on: <strong>{chartData.slice(0, vitalFewIndex + 1).map(c => c.name).join(', ')}</strong>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Pareto Analysis Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• The "vital few" (orange) are your highest-impact categories</li>
              <li>• Focus resources on addressing these first</li>
              <li>• Re-run analysis after improvements to track progress</li>
              <li>• Use with defects, complaints, delays, or any countable data</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaPareto;