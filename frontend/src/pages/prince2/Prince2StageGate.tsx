import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { prince2Api, Stage, StageGate } from '@/lib/prince2Api';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  GitBranch, CheckCircle2, XCircle, Clock, AlertTriangle, 
  FileText, Users, RefreshCw, Plus, ChevronRight
} from 'lucide-react';

const Prince2StageGate = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [stages, setStages] = useState<Stage[]>([]);
  const [stageGates, setStageGates] = useState<StageGate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedStage, setSelectedStage] = useState<Stage | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [newGate, setNewGate] = useState<Partial<StageGate>>({ business_case_still_valid: true });

  useEffect(() => {
    if (id) loadData();
  }, [id]);

  const loadData = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const [stageData, gateData] = await Promise.all([
        prince2Api.stages.getAll(id),
        prince2Api.stageGates.getAll(id)
      ]);
      setStages(stageData);
      setStageGates(gateData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createStageGate = async () => {
    if (!id || !selectedStage) return;
    try {
      await prince2Api.stageGates.create(id, { ...newGate, stage: selectedStage.id });
      setShowCreateDialog(false);
      setNewGate({ business_case_still_valid: true });
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const approveGate = async (gate: StageGate) => {
    if (!id) return;
    try {
      await prince2Api.stageGates.approve(id, gate.id);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const rejectGate = async (gate: StageGate) => {
    if (!id) return;
    const notes = prompt('Enter rejection reason:');
    if (!notes) return;
    try {
      await prince2Api.stageGates.reject(id, gate.id, notes);
      await loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getOutcomeBadge = (outcome: string) => {
    const styles: Record<string, string> = {
      pending: 'bg-slate-100 text-slate-700',
      approved: 'bg-green-100 text-green-700',
      conditional: 'bg-yellow-100 text-yellow-700',
      rejected: 'bg-red-100 text-red-700',
      deferred: 'bg-blue-100 text-blue-700'
    };
    return <Badge className={styles[outcome] || ''}>{outcome}</Badge>;
  };

  const getGateForStage = (stageId: number) => stageGates.find(g => g.stage === stageId);

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
              <GitBranch className="h-6 w-6 text-orange-600" />
              Stage Gates
            </h1>
            <p className="text-muted-foreground">End Stage Assessments by Project Board</p>
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

        {/* Stage Gates Overview */}
        <div className="grid gap-4">
          {stages.map((stage) => {
            const gate = getGateForStage(stage.id);
            return (
              <Card key={stage.id} className={stage.status === 'active' ? 'border-blue-300 bg-blue-50/30' : ''}>
                <CardContent className="py-4">
                  <div className="flex items-center gap-4">
                    <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                      stage.status === 'completed' ? 'bg-green-100' : 
                      stage.status === 'active' ? 'bg-blue-100' : 'bg-slate-100'
                    }`}>
                      {stage.status === 'completed' ? (
                        <CheckCircle2 className="h-6 w-6 text-green-600" />
                      ) : (
                        <span className="text-lg font-bold text-slate-600">{stage.order}</span>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-medium">{stage.name}</h3>
                        <Badge variant="outline">{stage.status}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {stage.planned_start_date} - {stage.planned_end_date}
                      </p>
                    </div>

                    {/* Gate Status */}
                    <div className="text-center px-4 border-l">
                      <p className="text-xs text-muted-foreground mb-1">Stage Gate</p>
                      {gate ? (
                        <div className="space-y-1">
                          {getOutcomeBadge(gate.outcome)}
                          {gate.review_date && (
                            <p className="text-xs text-muted-foreground">{gate.review_date}</p>
                          )}
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-slate-400">Not Created</Badge>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {!gate && (stage.status === 'completed' || stage.status === 'active') && (
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => {
                            setSelectedStage(stage);
                            setShowCreateDialog(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-1" />Create Gate Review
                        </Button>
                      )}
                      {gate && gate.outcome === 'pending' && (
                        <>
                          <Button size="sm" onClick={() => approveGate(gate)} className="bg-green-600 hover:bg-green-700">
                            <CheckCircle2 className="h-4 w-4 mr-1" />Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectGate(gate)}>
                            <XCircle className="h-4 w-4 mr-1" />Reject
                          </Button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Gate Details */}
                  {gate && (
                    <div className="mt-4 pt-4 border-t grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">Business Case Valid</p>
                        <p className="font-medium flex items-center gap-1">
                          {gate.business_case_still_valid ? (
                            <><CheckCircle2 className="h-4 w-4 text-green-500" />Yes</>
                          ) : (
                            <><XCircle className="h-4 w-4 text-red-500" />No</>
                          )}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Next Stage Plan</p>
                        <p className="font-medium flex items-center gap-1">
                          {gate.next_stage_plan_approved ? (
                            <><CheckCircle2 className="h-4 w-4 text-green-500" />Approved</>
                          ) : (
                            <><Clock className="h-4 w-4 text-yellow-500" />Pending</>
                          )}
                        </p>
                      </div>
                      {gate.reviewer_name && (
                        <div>
                          <p className="text-muted-foreground">Reviewer</p>
                          <p className="font-medium">{gate.reviewer_name}</p>
                        </div>
                      )}
                      {gate.decision_notes && (
                        <div className="col-span-2">
                          <p className="text-muted-foreground">Notes</p>
                          <p className="font-medium">{gate.decision_notes}</p>
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
                <GitBranch className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
                <p className="text-muted-foreground">No stages defined yet</p>
                <p className="text-sm text-muted-foreground mt-1">Create stages first to add gate reviews</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Create Gate Dialog */}
        <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create Stage Gate Review</DialogTitle>
              {selectedStage && (
                <p className="text-sm text-muted-foreground">Stage: {selectedStage.name}</p>
              )}
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label>Stage Performance Summary</Label>
                <Textarea 
                  value={newGate.stage_performance_summary || ''} 
                  onChange={(e) => setNewGate({...newGate, stage_performance_summary: e.target.value})}
                  placeholder="Summarize stage performance..."
                  rows={3}
                />
              </div>
              <div>
                <Label>Products Completed</Label>
                <Textarea 
                  value={newGate.products_completed || ''} 
                  onChange={(e) => setNewGate({...newGate, products_completed: e.target.value})}
                  rows={2}
                />
              </div>
              <div>
                <Label>Products Pending</Label>
                <Textarea 
                  value={newGate.products_pending || ''} 
                  onChange={(e) => setNewGate({...newGate, products_pending: e.target.value})}
                  rows={2}
                />
              </div>
              <div>
                <Label>Lessons Learned</Label>
                <Textarea 
                  value={newGate.lessons_learned || ''} 
                  onChange={(e) => setNewGate({...newGate, lessons_learned: e.target.value})}
                  rows={2}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  id="bc-valid" 
                  checked={newGate.business_case_still_valid}
                  onCheckedChange={(checked) => setNewGate({...newGate, business_case_still_valid: !!checked})}
                />
                <Label htmlFor="bc-valid">Business Case Still Valid</Label>
              </div>
              <Button onClick={createStageGate} className="w-full">Create Gate Review</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Information Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">About Stage Gates</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <h4 className="font-medium">Purpose</h4>
                <p className="text-muted-foreground">
                  Stage gates provide formal decision points for the Project Board to:
                </p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Review stage performance</li>
                  <li>Confirm business case validity</li>
                  <li>Approve the next stage plan</li>
                  <li>Authorize continued investment</li>
                </ul>
              </div>
              <div className="space-y-2">
                <h4 className="font-medium">Outcomes</h4>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2"><Badge className="bg-green-100 text-green-700">Approved</Badge> Continue to next stage</li>
                  <li className="flex items-center gap-2"><Badge className="bg-yellow-100 text-yellow-700">Conditional</Badge> Continue with conditions</li>
                  <li className="flex items-center gap-2"><Badge className="bg-red-100 text-red-700">Rejected</Badge> Requires exception plan</li>
                  <li className="flex items-center gap-2"><Badge className="bg-blue-100 text-blue-700">Deferred</Badge> Decision postponed</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="prince2" />
    </div>
  );
};

export default Prince2StageGate;
