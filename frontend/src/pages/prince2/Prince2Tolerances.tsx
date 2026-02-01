import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { prince2Api, ProjectTolerance } from '@/lib/prince2Api';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Target, Clock, DollarSign, Layers, Award, AlertTriangle, 
  Plus, Edit, Save, RefreshCw, CheckCircle2, XCircle
} from 'lucide-react';

const TOLERANCE_ICONS: Record<string, any> = {
  time: Clock,
  cost: DollarSign,
  scope: Layers,
  quality: CheckCircle2,
  benefit: Award,
  risk: AlertTriangle
};

const Prince2Tolerances = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [tolerances, setTolerances] = useState<ProjectTolerance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editData, setEditData] = useState<Partial<ProjectTolerance>>({});

  useEffect(() => {
    if (id) loadTolerances();
  }, [id]);

  const loadTolerances = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await prince2Api.tolerances.getAll(id);
      setTolerances(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const initializeTolerances = async () => {
    if (!id) return;
    try {
      await prince2Api.tolerances.initialize(id);
      await loadTolerances();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startEditing = (tol: ProjectTolerance) => {
    setEditingId(tol.id);
    setEditData(tol);
  };

  const saveEditing = async () => {
    if (!id || !editingId) return;
    try {
      await prince2Api.tolerances.update(id, editingId, editData);
      setEditingId(null);
      setEditData({});
      await loadTolerances();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditData({});
  };

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader project={project} />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="h-6 w-6 text-purple-600" />
              Project Tolerances
            </h1>
            <p className="text-muted-foreground">Permitted deviation before escalation</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadTolerances}>
              <RefreshCw className="h-4 w-4 mr-2" />Refresh
            </Button>
            {tolerances.length === 0 && (
              <Button onClick={initializeTolerances}>
                <Plus className="h-4 w-4 mr-2" />Initialize Tolerances
              </Button>
            )}
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </CardContent>
          </Card>
        )}

        {/* Tolerances Grid */}
        {tolerances.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tolerances.map((tol) => {
              const Icon = TOLERANCE_ICONS[tol.tolerance_type] || Target;
              const isEditing = editingId === tol.id;
              
              return (
                <Card key={tol.id} className={tol.is_exceeded ? 'border-red-300 bg-red-50/50' : ''}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Icon className={`h-5 w-5 ${tol.is_exceeded ? 'text-red-500' : 'text-purple-500'}`} />
                        <CardTitle className="text-base">{tol.tolerance_type_display}</CardTitle>
                      </div>
                      {tol.is_exceeded && <Badge className="bg-red-500">Exceeded</Badge>}
                      {!isEditing && (
                        <Button variant="ghost" size="sm" onClick={() => startEditing(tol)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isEditing ? (
                      <div className="space-y-3">
                        <div>
                          <Label className="text-xs">Description</Label>
                          <Textarea 
                            value={editData.description || ''} 
                            onChange={(e) => setEditData({...editData, description: e.target.value})}
                            rows={2}
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                          <div>
                            <Label className="text-xs">Plus Tolerance</Label>
                            <Input 
                              value={editData.plus_tolerance || ''} 
                              onChange={(e) => setEditData({...editData, plus_tolerance: e.target.value})}
                            />
                          </div>
                          <div>
                            <Label className="text-xs">Minus Tolerance</Label>
                            <Input 
                              value={editData.minus_tolerance || ''} 
                              onChange={(e) => setEditData({...editData, minus_tolerance: e.target.value})}
                            />
                          </div>
                        </div>
                        <div>
                          <Label className="text-xs">Current Status</Label>
                          <Input 
                            value={editData.current_status || ''} 
                            onChange={(e) => setEditData({...editData, current_status: e.target.value})}
                          />
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" onClick={saveEditing} className="flex-1">
                            <Save className="h-4 w-4 mr-1" />Save
                          </Button>
                          <Button size="sm" variant="outline" onClick={cancelEditing}>Cancel</Button>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <p className="text-sm text-muted-foreground">{tol.description}</p>
                        <div className="grid grid-cols-2 gap-4 pt-2">
                          <div className="text-center p-2 rounded bg-green-50 border border-green-200">
                            <p className="text-xs text-muted-foreground">Plus</p>
                            <p className="font-medium text-green-700">{tol.plus_tolerance || 'N/A'}</p>
                          </div>
                          <div className="text-center p-2 rounded bg-red-50 border border-red-200">
                            <p className="text-xs text-muted-foreground">Minus</p>
                            <p className="font-medium text-red-700">{tol.minus_tolerance || 'N/A'}</p>
                          </div>
                        </div>
                        {tol.current_status && (
                          <div className="pt-2 border-t">
                            <p className="text-xs text-muted-foreground">Current Status</p>
                            <p className="text-sm font-medium">{tol.current_status}</p>
                          </div>
                        )}
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
              <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-muted-foreground mb-4">No tolerances defined yet</p>
              <Button onClick={initializeTolerances}>
                <Plus className="h-4 w-4 mr-2" />Initialize Default Tolerances
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Information */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About Tolerances</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-muted-foreground">
              <p>
                Tolerances define the permitted deviation from plan before escalation is required. 
                In PRINCE2, tolerances are set at each management level:
              </p>
              <ul className="mt-2 space-y-1">
                <li><strong>Corporate/Programme</strong> → Project tolerances (set for Project Board)</li>
                <li><strong>Project Board</strong> → Stage tolerances (set for Project Manager)</li>
                <li><strong>Project Manager</strong> → Work Package tolerances (set for Team Managers)</li>
              </ul>
              <p className="mt-3">
                If a forecast indicates tolerances will be exceeded, an Exception Report must be raised 
                to the next management level for guidance.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="prince2" />
    </div>
  );
};

export default Prince2Tolerances;
