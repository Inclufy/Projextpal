import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { prince2Api, Stage, StagePlan } from '@/lib/prince2Api';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Calendar, Plus, Edit, Save, CheckCircle2, Play, 
  RefreshCw, AlertTriangle, Clock, DollarSign, Target
} from 'lucide-react';

const Prince2StagePlan = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [stages, setStages] = useState<Stage[]>([]);
  const [stagePlans, setStagePlans] = useState<StagePlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [showCreatePlan, setShowCreatePlan] = useState(false);
  const [newPlan, setNewPlan] = useState<Partial<StagePlan>>({});

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [stageData, planData] = await Promise.all([
        prince2Api.stages.getAll(id),
        prince2Api.stagePlans.getAll(id)
      ]);
      setStages(stageData);
      setStagePlans(planData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createStagePlan = async () => {
    if (!id || !selectedStage) return;
    try {
      await prince2Api.stagePlans.create(id, { ...newPlan, stage: selectedStage.id });
      setShowCreatePlan(false);
      setNewPlan({});
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const approvePlan = async (plan: StagePlan) => {
    if (!id) return;
    try {
      await prince2Api.stagePlans.approve(id, plan.id);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const startStage = async (stage: Stage) => {
    if (!id) return;
    try {
      await prince2Api.stages.start(id, stage.id);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const completeStage = async (stage: Stage) => {
    if (!id) return;
    try {
      await prince2Api.stages.complete(id, stage.id);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getPlanForStage = (stageId: number) => stagePlans.find(p => p.stage === stageId);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      draft: 'bg-slate-100 text-slate-700',
      approved: 'bg-green-100 text-green-700',
      active: 'bg-blue-100 text-blue-700',
      completed: 'bg-green-100 text-green-700',
      planned: 'bg-slate-100 text-slate-700'
    };
    return <Badge className={styles[status] || ''}>{status}</Badge>;
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
              <Calendar className="h-6 w-6 text-blue-600" />
              Stage Plans
            </h1>
            <p className="text-muted-foreground">Detailed plans for each management stage</p>
          </div>
          <Button variant="outline" onClick={loadData}>
            <RefreshCw className="h-4 w-4 mr-2" />Refresh
          </Button>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </CardContent>
          </Card>
        )}

        {/* Stages with Plans */}
        <div className="space-y-4">
          {stages.map((stage) => {
            const plan = getPlanForStage(stage.id);
            return (
              <Card key={stage.id} className={stage.status === 'active' ? 'border-blue-300 bg-blue-50/30' : ''}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        stage.status === 'completed' ? 'bg-green-100 text-green-600' :
                        stage.status === 'active' ? 'bg-blue-100 text-blue-600' :
                        'bg-slate-100 text-slate-400'
                      }`}>
                        {stage.status === 'completed' ? <CheckCircle2 className="h-5 w-5" /> : stage.order}
                      </div>
                      <div>
                        <CardTitle className="text-lg flex items-center gap-2">
                          {stage.name}
                          {getStatusBadge(stage.status)}
                        </CardTitle>
                        <CardDescription>
                          {stage.planned_start_date} - {stage.planned_end_date}
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {stage.status === 'planned' && !plan && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedStage(stage);
                            setShowCreatePlan(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />Create Plan
                        </Button>
                      )}
                      {stage.status === 'planned' && plan?.status === 'approved' && (
                        <Button size="sm" onClick={() => startStage(stage)}>
                          <Play className="h-4 w-4 mr-1" />Start Stage
                        </Button>
                      )}
                      {stage.status === 'active' && (
                        <Button size="sm" variant="outline" onClick={() => completeStage(stage)}>
                          <CheckCircle2 className="h-4 w-4 mr-1" />Complete
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {/* Stage Progress */}
                <CardContent className="pt-0">
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex-1">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Progress</span>
                        <span>{stage.progress_percentage}%</span>
                      </div>
                      <Progress value={stage.progress_percentage} />
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Work Packages</p>
                      <p className="font-medium">{stage.work_packages_count || 0}</p>
                    </div>
                  </div>

                  {/* Plan Details */}
                  {plan ? (
                    <div className="border rounded-lg p-4 bg-white">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Stage Plan</h4>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(plan.status)}
                          {plan.status === 'draft' && (
                            <Button size="sm" variant="outline" onClick={() => approvePlan(plan)}>
                              <CheckCircle2 className="h-4 w-4 mr-1" />Approve
                            </Button>
                          )}
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Budget</p>
                          <p className="font-medium">€{Number(plan.budget || 0).toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Resources</p>
                          <p className="font-medium">{plan.resource_requirements || 'Not specified'}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Version</p>
                          <p className="font-medium">{plan.version}</p>
                        </div>
                      </div>

                      {plan.plan_description && (
                        <div className="mt-3 pt-3 border-t">
                          <p className="text-sm text-muted-foreground">{plan.plan_description}</p>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="border rounded-lg p-4 bg-slate-50 text-center">
                      <p className="text-muted-foreground">No stage plan created yet</p>
                    </div>
                  )}

                  {/* Stage Tolerances */}
                  {(stage.time_tolerance || stage.cost_tolerance) && (
                    <div className="mt-4 grid grid-cols-4 gap-4">
                      {stage.time_tolerance && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <div className="flex items-center gap-2 text-blue-600 mb-1">
                            <Clock className="h-4 w-4" />
                            <span className="text-xs font-medium">Time</span>
                          </div>
                          <p className="text-sm font-medium">{stage.time_tolerance}</p>
                        </div>
                      )}
                      {stage.cost_tolerance && (
                        <div className="p-3 bg-green-50 rounded-lg">
                          <div className="flex items-center gap-2 text-green-600 mb-1">
                            <DollarSign className="h-4 w-4" />
                            <span className="text-xs font-medium">Cost</span>
                          </div>
                          <p className="text-sm font-medium">{stage.cost_tolerance}</p>
                        </div>
                      )}
                      {stage.scope_tolerance && (
                        <div className="p-3 bg-purple-50 rounded-lg">
                          <div className="flex items-center gap-2 text-purple-600 mb-1">
                            <Target className="h-4 w-4" />
                            <span className="text-xs font-medium">Scope</span>
                          </div>
                          <p className="text-sm font-medium">{stage.scope_tolerance}</p>
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}

          {stages.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No stages defined yet</p>
                <p className="text-sm text-muted-foreground mt-1">Initialize stages from the dashboard first</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Create Plan Dialog */}
        <Dialog open={showCreatePlan} onOpenChange={setShowCreatePlan}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Stage Plan</DialogTitle>
              {selectedStage && <p className="text-sm text-muted-foreground">Stage: {selectedStage.name}</p>}
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Plan Description</Label>
                <Textarea 
                  value={newPlan.plan_description || ''} 
                  onChange={(e) => setNewPlan({...newPlan, plan_description: e.target.value})}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Budget (€)</Label>
                  <Input 
                    type="number"
                    value={newPlan.budget || ''} 
                    onChange={(e) => setNewPlan({...newPlan, budget: parseFloat(e.target.value)})}
                  />
                </div>
                <div>
                  <Label>Resource Requirements</Label>
                  <Input 
                    value={newPlan.resource_requirements || ''} 
                    onChange={(e) => setNewPlan({...newPlan, resource_requirements: e.target.value})}
                  />
                </div>
              </div>
              <div>
                <Label>Quality Approach</Label>
                <Textarea 
                  value={newPlan.quality_approach || ''} 
                  onChange={(e) => setNewPlan({...newPlan, quality_approach: e.target.value})}
                  rows={2}
                />
              </div>
              <div>
                <Label>Dependencies</Label>
                <Textarea 
                  value={newPlan.dependencies || ''} 
                  onChange={(e) => setNewPlan({...newPlan, dependencies: e.target.value})}
                  rows={2}
                />
              </div>
              <Button onClick={createStagePlan} className="w-full">Create Plan</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="prince2" />
    </div>
  );
};

export default Prince2StagePlan;
