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
import { sixsigmaApi, PilotPlan } from '@/lib/sixsigmaApi';
import { Rocket, Plus, Trash2, Loader2, AlertCircle, Play, CheckCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const SixSigmaPilot = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pilots, setPilots] = useState<PilotPlan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newPilot, setNewPilot] = useState({
    pilot_name: '',
    solution_being_tested: '',
    pilot_scope: '',
    success_criteria: '',
    duration: '',
    start_date: '',
    end_date: '',
    participants: '',
    resources_needed: '',
    risks: '',
    status: 'planned',
  });

  useEffect(() => {
    if (id) loadPilots();
  }, [id]);

  const loadPilots = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await sixsigmaApi.pilots.getAll(id);
      setPilots(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load pilot plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const created = await sixsigmaApi.pilots.create(id, newPilot);
      setPilots([...pilots, created]);
      setShowForm(false);
      setNewPilot({
        pilot_name: '',
        solution_being_tested: '',
        pilot_scope: '',
        success_criteria: '',
        duration: '',
        start_date: '',
        end_date: '',
        participants: '',
        resources_needed: '',
        risks: '',
        status: 'planned',
      });
      toast({ title: 'Pilot Created', description: 'Pilot plan added successfully.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (pilotId: number) => {
    if (!id) return;
    try {
      await sixsigmaApi.pilots.delete(id, pilotId);
      setPilots(pilots.filter(p => p.id !== pilotId));
      toast({ title: 'Deleted', description: 'Pilot plan removed.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleUpdateStatus = async (pilotId: number, status: string) => {
    if (!id) return;
    try {
      await sixsigmaApi.pilots.update(id, pilotId, { status });
      setPilots(pilots.map(p => p.id === pilotId ? { ...p, status } : p));
      toast({ title: 'Updated', description: 'Pilot status updated.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const statusConfig: Record<string, { color: string; icon: any }> = {
    planned: { color: 'bg-gray-500', icon: Clock },
    in_progress: { color: 'bg-blue-500', icon: Play },
    completed: { color: 'bg-green-500', icon: CheckCircle },
    failed: { color: 'bg-red-500', icon: AlertCircle },
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
              <Rocket className="h-6 w-6 text-orange-600" />
              Pilot Plans
            </h1>
            <p className="text-muted-foreground">Test solutions on a small scale before full implementation</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Pilot
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Summary */}
        {pilots.length > 0 && (
          <div className="grid grid-cols-4 gap-4">
            {['planned', 'in_progress', 'completed', 'failed'].map(status => (
              <Card key={status} className={status === 'completed' ? 'bg-green-50 border-green-200' : ''}>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold">
                    {pilots.filter(p => p.status === status).length}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">{status.replace('_', ' ')}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* New Pilot Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create Pilot Plan</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Pilot Name</label>
                  <Input
                    value={newPilot.pilot_name}
                    onChange={(e) => setNewPilot({ ...newPilot, pilot_name: e.target.value })}
                    placeholder="e.g., Automated Validation Pilot"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Solution Being Tested</label>
                  <Input
                    value={newPilot.solution_being_tested}
                    onChange={(e) => setNewPilot({ ...newPilot, solution_being_tested: e.target.value })}
                    placeholder="Which solution is this pilot for?"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Pilot Scope</label>
                <Textarea
                  value={newPilot.pilot_scope}
                  onChange={(e) => setNewPilot({ ...newPilot, pilot_scope: e.target.value })}
                  placeholder="Define the boundaries of the pilot (location, process, team, etc.)"
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Success Criteria</label>
                <Textarea
                  value={newPilot.success_criteria}
                  onChange={(e) => setNewPilot({ ...newPilot, success_criteria: e.target.value })}
                  placeholder="How will you measure if the pilot is successful?"
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Duration</label>
                  <Input
                    value={newPilot.duration}
                    onChange={(e) => setNewPilot({ ...newPilot, duration: e.target.value })}
                    placeholder="e.g., 2 weeks"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={newPilot.start_date}
                    onChange={(e) => setNewPilot({ ...newPilot, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">End Date</label>
                  <Input
                    type="date"
                    value={newPilot.end_date}
                    onChange={(e) => setNewPilot({ ...newPilot, end_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Participants</label>
                  <Input
                    value={newPilot.participants}
                    onChange={(e) => setNewPilot({ ...newPilot, participants: e.target.value })}
                    placeholder="Who will participate in the pilot?"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Resources Needed</label>
                  <Input
                    value={newPilot.resources_needed}
                    onChange={(e) => setNewPilot({ ...newPilot, resources_needed: e.target.value })}
                    placeholder="Equipment, tools, budget..."
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Risks</label>
                <Input
                  value={newPilot.risks}
                  onChange={(e) => setNewPilot({ ...newPilot, risks: e.target.value })}
                  placeholder="What could go wrong during the pilot?"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Pilot
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pilots List */}
        {pilots.length > 0 ? (
          <div className="space-y-4">
            {pilots.map(pilot => {
              const config = statusConfig[pilot.status || 'planned'];
              const StatusIcon = config.icon;
              return (
                <Card key={pilot.id}>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-lg">{pilot.pilot_name}</CardTitle>
                        <Badge className={config.color}>
                          <StatusIcon className="h-3 w-3 mr-1" />
                          {pilot.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <Select 
                          value={pilot.status || 'planned'} 
                          onValueChange={(v) => handleUpdateStatus(pilot.id, v)}
                        >
                          <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
                          <SelectContent>
                            <SelectItem value="planned">Planned</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="failed">Failed</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(pilot.id)}>
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="text-sm text-muted-foreground">
                      Testing: <span className="text-foreground font-medium">{pilot.solution_being_tested}</span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="p-3 bg-gray-50 rounded-lg">
                        <div className="text-muted-foreground mb-1">Scope</div>
                        <div>{pilot.pilot_scope || 'Not defined'}</div>
                      </div>
                      <div className="p-3 bg-green-50 rounded-lg">
                        <div className="text-muted-foreground mb-1">Success Criteria</div>
                        <div>{pilot.success_criteria || 'Not defined'}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-4 gap-4 text-sm">
                      <div>
                        <span className="text-muted-foreground">Duration: </span>
                        {pilot.duration || 'TBD'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Start: </span>
                        {pilot.start_date || 'TBD'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">End: </span>
                        {pilot.end_date || 'TBD'}
                      </div>
                      <div>
                        <span className="text-muted-foreground">Participants: </span>
                        {pilot.participants || 'TBD'}
                      </div>
                    </div>

                    {pilot.risks && (
                      <div className="p-3 bg-yellow-50 rounded-lg text-sm">
                        <span className="text-yellow-700 font-medium">Risks: </span>
                        <span className="text-yellow-600">{pilot.risks}</span>
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
              <Rocket className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Pilot Plans</h3>
              <p className="text-muted-foreground mb-4">
                Create a pilot plan to test your solutions before full rollout.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Pilot
              </Button>
            </CardContent>
          </Card>
        )}

        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h4 className="font-medium text-blue-800 mb-2">💡 Pilot Best Practices</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Keep pilots small and focused</li>
              <li>• Define clear, measurable success criteria upfront</li>
              <li>• Document lessons learned for full implementation</li>
              <li>• Get feedback from pilot participants</li>
            </ul>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaPilot;
