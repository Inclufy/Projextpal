import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { sixsigmaApi, ImplementationPlan } from '@/lib/sixsigmaApi';
import { Wrench, Plus, Trash2, Loader2, AlertCircle, CheckCircle, Clock, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const SixSigmaImplementation = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plans, setPlans] = useState<ImplementationPlan[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newPlan, setNewPlan] = useState({
    task_name: '',
    description: '',
    solution_reference: '',
    owner: '',
    start_date: '',
    due_date: '',
    status: 'not_started',
    progress: 0,
    dependencies: '',
    resources: '',
    notes: '',
  });

  useEffect(() => {
    if (id) loadPlans();
  }, [id]);

  const loadPlans = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await sixsigmaApi.implementation.getAll(id);
      setPlans(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load implementation plans');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const created = await sixsigmaApi.implementation.create(id, newPlan);
      setPlans([...plans, created]);
      setShowForm(false);
      setNewPlan({
        task_name: '',
        description: '',
        solution_reference: '',
        owner: '',
        start_date: '',
        due_date: '',
        status: 'not_started',
        progress: 0,
        dependencies: '',
        resources: '',
        notes: '',
      });
      toast({ title: 'Task Added', description: 'Implementation task created.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (planId: number) => {
    if (!id) return;
    try {
      await sixsigmaApi.implementation.delete(id, planId);
      setPlans(plans.filter(p => p.id !== planId));
      toast({ title: 'Deleted', description: 'Task removed.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleUpdate = async (planId: number, updates: Partial<ImplementationPlan>) => {
    if (!id) return;
    try {
      await sixsigmaApi.implementation.update(id, planId, updates);
      setPlans(plans.map(p => p.id === planId ? { ...p, ...updates } : p));
      toast({ title: 'Updated', description: 'Task updated.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const statusColors: Record<string, string> = {
    not_started: 'bg-gray-500',
    in_progress: 'bg-blue-500',
    completed: 'bg-green-500',
    blocked: 'bg-red-500',
    on_hold: 'bg-yellow-500',
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

  const completedCount = plans.filter(p => p.status === 'completed').length;
  const overallProgress = plans.length > 0 
    ? Math.round(plans.reduce((sum, p) => sum + (p.progress || 0), 0) / plans.length)
    : 0;

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Wrench className="h-6 w-6 text-indigo-600" />
              Implementation Plan
            </h1>
            <p className="text-muted-foreground">Track implementation tasks for approved solutions</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Task
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Progress Summary */}
        {plans.length > 0 && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">Overall Progress</span>
                <span className="text-sm text-muted-foreground">
                  {completedCount} of {plans.length} tasks completed
                </span>
              </div>
              <Progress value={overallProgress} className="h-3" />
              <div className="text-right text-sm text-muted-foreground mt-1">{overallProgress}%</div>
            </CardContent>
          </Card>
        )}

        {/* Status Summary */}
        {plans.length > 0 && (
          <div className="grid grid-cols-5 gap-4">
            {['not_started', 'in_progress', 'completed', 'blocked', 'on_hold'].map(status => (
              <Card key={status}>
                <CardContent className="pt-4 text-center">
                  <div className="text-2xl font-bold">
                    {plans.filter(p => p.status === status).length}
                  </div>
                  <div className="text-sm text-muted-foreground capitalize">{status.replace('_', ' ')}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* New Task Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Add Implementation Task</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Task Name</label>
                  <Input
                    value={newPlan.task_name}
                    onChange={(e) => setNewPlan({ ...newPlan, task_name: e.target.value })}
                    placeholder="e.g., Deploy validation module"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Solution Reference</label>
                  <Input
                    value={newPlan.solution_reference}
                    onChange={(e) => setNewPlan({ ...newPlan, solution_reference: e.target.value })}
                    placeholder="Which solution is this for?"
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  value={newPlan.description}
                  onChange={(e) => setNewPlan({ ...newPlan, description: e.target.value })}
                  placeholder="Describe what needs to be done..."
                  rows={2}
                />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Owner</label>
                  <Input
                    value={newPlan.owner}
                    onChange={(e) => setNewPlan({ ...newPlan, owner: e.target.value })}
                    placeholder="Who is responsible?"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Start Date</label>
                  <Input
                    type="date"
                    value={newPlan.start_date}
                    onChange={(e) => setNewPlan({ ...newPlan, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Due Date</label>
                  <Input
                    type="date"
                    value={newPlan.due_date}
                    onChange={(e) => setNewPlan({ ...newPlan, due_date: e.target.value })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Dependencies</label>
                  <Input
                    value={newPlan.dependencies}
                    onChange={(e) => setNewPlan({ ...newPlan, dependencies: e.target.value })}
                    placeholder="What must be completed first?"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Resources</label>
                  <Input
                    value={newPlan.resources}
                    onChange={(e) => setNewPlan({ ...newPlan, resources: e.target.value })}
                    placeholder="What resources are needed?"
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Add Task
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tasks List */}
        {plans.length > 0 ? (
          <div className="space-y-4">
            {plans.map(plan => (
              <Card key={plan.id}>
                <CardContent className="pt-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold">{plan.task_name}</h3>
                        <Badge className={statusColors[plan.status || 'not_started']}>
                          {plan.status?.replace('_', ' ')}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{plan.description}</p>
                      
                      <div className="mb-3">
                        <div className="flex justify-between text-sm mb-1">
                          <span>Progress</span>
                          <span>{plan.progress || 0}%</span>
                        </div>
                        <Progress value={plan.progress || 0} className="h-2" />
                      </div>

                      <div className="grid grid-cols-4 gap-4 text-sm">
                        <div className="flex items-center gap-1">
                          <User className="h-4 w-4 text-muted-foreground" />
                          {plan.owner || 'Unassigned'}
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          {plan.start_date || 'No start'}
                        </div>
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-4 w-4 text-muted-foreground" />
                          Due: {plan.due_date || 'No due date'}
                        </div>
                        {plan.solution_reference && (
                          <div className="text-blue-600">
                            {plan.solution_reference}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2 ml-4">
                      <Select 
                        value={plan.status || 'not_started'} 
                        onValueChange={(v) => handleUpdate(plan.id, { status: v })}
                      >
                        <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="not_started">Not Started</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="blocked">Blocked</SelectItem>
                          <SelectItem value="on_hold">On Hold</SelectItem>
                        </SelectContent>
                      </Select>
                      <Input
                        type="number"
                        min={0}
                        max={100}
                        value={plan.progress || 0}
                        onChange={(e) => handleUpdate(plan.id, { progress: parseInt(e.target.value) || 0 })}
                        className="w-32"
                        placeholder="Progress %"
                      />
                      <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(plan.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Wrench className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Implementation Tasks</h3>
              <p className="text-muted-foreground mb-4">
                Create tasks to track the implementation of your approved solutions.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Task
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaImplementation;
