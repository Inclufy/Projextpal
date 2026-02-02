import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { scrumApi } from '@/lib/scrumApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Target, Plus, Loader2, TrendingUp, CheckCircle2, 
  AlertCircle, Edit2, Trophy, Flag
} from 'lucide-react';

interface SprintGoal {
  id: number;
  sprint_number: number;
  goal: string;
  why: string;
  success_criteria: string[];
  status: 'active' | 'completed' | 'cancelled';
  progress: number;
  start_date: string;
  end_date: string;
  achieved: boolean;
}

const ScrumSprintGoal = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [goals, setGoals] = useState<SprintGoal[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingGoal, setEditingGoal] = useState<SprintGoal | null>(null);
  
  const [form, setForm] = useState({
    goal: '',
    why: '',
    success_criteria: '',
  });

  useEffect(() => {
    if (id) {
      loadGoals();
    }
  }, [id]);

  const loadGoals = async () => {
    try {
      setLoading(true);
      const data = await scrumApi.sprints.getAll(id!);
      const goalsData = data.map((sprint: any) => ({
        id: sprint.id,
        sprint_number: sprint.number || sprint.sprint_number,
        goal: sprint.goal || sprint.sprint_goal,
        why: sprint.why || 'To deliver value to customers',
        success_criteria: sprint.success_criteria || ['All committed items completed', 'Zero critical bugs'],
        status: sprint.status,
        progress: sprint.progress || 0,
        start_date: sprint.start_date,
        end_date: sprint.end_date,
        achieved: sprint.achieved || false
      }));
      setGoals(goalsData);
    } catch (err: any) {
      // Mock data
      setGoals([
        {
          id: 1,
          sprint_number: 3,
          goal: 'Complete user authentication and improve dashboard performance',
          why: 'To allow users to securely access their accounts and have a faster user experience',
          success_criteria: [
            'User can login with email/password',
            'Session management implemented',
            'Dashboard load time under 2 seconds',
            'All security tests passing'
          ],
          status: 'active',
          progress: 65,
          start_date: new Date().toISOString().split('T')[0],
          end_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          achieved: false
        },
        {
          id: 2,
          sprint_number: 2,
          goal: 'Implement user registration and email verification',
          why: 'To enable new users to create accounts and verify their identity',
          success_criteria: [
            'Registration form functional',
            'Email verification working',
            'Profile page created',
            'All acceptance tests passing'
          ],
          status: 'completed',
          progress: 100,
          start_date: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          end_date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          achieved: true
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveGoal = async () => {
    try {
      const goalData = {
        ...form,
        success_criteria: form.success_criteria.split('\n').filter(c => c.trim()),
      };
      
      if (editingGoal) {
        await scrumApi.sprints.update(id!, editingGoal.id, goalData);
      } else {
        await scrumApi.sprints.create(id!, goalData);
      }
      
      setShowDialog(false);
      setEditingGoal(null);
      setForm({ goal: '', why: '', success_criteria: '' });
      loadGoals();
    } catch (err: any) {
      alert(err.message || 'Failed to save goal');
    }
  };

  const openEditGoal = (goal: SprintGoal) => {
    setEditingGoal(goal);
    setForm({
      goal: goal.goal,
      why: goal.why,
      success_criteria: goal.success_criteria.join('\n'),
    });
    setShowDialog(true);
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  const activeGoal = goals.find(g => g.status === 'active');
  const completedGoals = goals.filter(g => g.status === 'completed');

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="h-6 w-6 text-purple-600" />
              Sprint Goal
            </h1>
            <p className="text-muted-foreground">Define and track sprint objectives</p>
          </div>
          <Button onClick={() => { setEditingGoal(null); setForm({ goal: '', why: '', success_criteria: '' }); setShowDialog(true); }} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            New Goal
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex gap-4">
              <Target className="h-6 w-6 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-purple-900">What is a Sprint Goal?</h3>
                <p className="text-sm text-purple-800 mt-1">
                  The Sprint Goal is an objective set for the Sprint that provides guidance to the Development Team on why it is building the Increment.
                  It gives the team flexibility regarding the functionality implemented within the Sprint while maintaining a unified purpose.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Sprint Goal */}
        {activeGoal && (
          <Card className="border-purple-300 bg-gradient-to-br from-purple-50 to-white">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Flag className="h-5 w-5 text-purple-600" />
                  Sprint {activeGoal.sprint_number} - Active Goal
                </CardTitle>
                <Button variant="ghost" size="sm" onClick={() => openEditGoal(activeGoal)}>
                  <Edit2 className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Goal Statement */}
              <div>
                <div className="flex items-start gap-3">
                  <Target className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold text-lg mb-2">Sprint Goal</p>
                    <p className="text-xl">{activeGoal.goal}</p>
                  </div>
                </div>
              </div>

              {/* Why */}
              <div className="pl-9">
                <p className="font-medium text-muted-foreground mb-2">Why this goal?</p>
                <p className="text-muted-foreground">{activeGoal.why}</p>
              </div>

              {/* Progress */}
              <div className="pl-9">
                <div className="flex items-center justify-between mb-2">
                  <p className="font-medium">Progress</p>
                  <span className="text-lg font-bold text-purple-600">{activeGoal.progress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div 
                    className="bg-purple-600 h-3 rounded-full transition-all duration-300"
                    style={{ width: `${activeGoal.progress}%` }}
                  />
                </div>
              </div>

              {/* Success Criteria */}
              <div className="pl-9">
                <p className="font-medium mb-3">Success Criteria</p>
                <div className="space-y-2">
                  {activeGoal.success_criteria.map((criteria, idx) => (
                    <div key={idx} className="flex items-start gap-3 p-3 bg-white rounded-lg border">
                      <CheckCircle2 className="h-5 w-5 text-green-600 mt-0.5 flex-shrink-0" />
                      <span className="text-sm">{criteria}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Timeline */}
              <div className="pl-9 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">
                    {new Date(activeGoal.start_date).toLocaleDateString()} - {new Date(activeGoal.end_date).toLocaleDateString()}
                  </span>
                  <Badge variant={activeGoal.progress >= 80 ? 'default' : 'secondary'}>
                    {activeGoal.progress >= 80 ? 'On Track' : 'In Progress'}
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Sprints</p>
              <p className="text-2xl font-bold">{goals.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Goals Achieved</p>
              <p className="text-2xl font-bold text-green-600">
                {goals.filter(g => g.achieved).length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Success Rate</p>
              <p className="text-2xl font-bold text-purple-600">
                {goals.length > 0 ? Math.round((goals.filter(g => g.achieved).length / goals.length) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Past Sprint Goals */}
        {completedGoals.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Trophy className="h-5 w-5 text-yellow-600" />
                Past Sprint Goals
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {completedGoals.map((goal) => (
                  <div key={goal.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50">
                    {goal.achieved ? (
                      <CheckCircle2 className="h-6 w-6 text-green-600 flex-shrink-0 mt-1" />
                    ) : (
                      <AlertCircle className="h-6 w-6 text-orange-600 flex-shrink-0 mt-1" />
                    )}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-semibold">Sprint {goal.sprint_number}</p>
                        <Badge variant={goal.achieved ? 'default' : 'secondary'}>
                          {goal.achieved ? 'Achieved' : 'Not Achieved'}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{goal.goal}</p>
                      <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
                        <TrendingUp className="h-3 w-3" />
                        <span>{goal.progress}% completed</span>
                        <span>•</span>
                        <span>{goal.success_criteria.length} criteria</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {goals.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Target className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No sprint goals defined yet</p>
              <Button onClick={() => setShowDialog(true)} variant="outline" className="mt-4">
                Create First Goal
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Add/Edit Goal Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingGoal ? 'Edit Sprint Goal' : 'Define Sprint Goal'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Sprint Goal</label>
              <Textarea 
                value={form.goal}
                onChange={(e) => setForm({...form, goal: e.target.value})}
                placeholder="What is the objective of this sprint?"
                rows={3}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Keep it concise and focused on the outcome, not the tasks
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Why this goal?</label>
              <Textarea 
                value={form.why}
                onChange={(e) => setForm({...form, why: e.target.value})}
                placeholder="Explain the business value or user benefit..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Success Criteria (one per line)</label>
              <Textarea 
                value={form.success_criteria}
                onChange={(e) => setForm({...form, success_criteria: e.target.value})}
                placeholder="All committed items completed&#10;Zero critical bugs&#10;Performance benchmarks met&#10;Stakeholder approval"
                rows={5}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Define measurable criteria to determine if the goal was achieved
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveGoal} 
              disabled={!form.goal}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Save Goal
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MethodologyHelpPanel methodology="scrum" />
    </div>
  );
};

export default ScrumSprintGoal;