import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { scrumApi } from '@/lib/scrumApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Calendar, Plus, Loader2, Target, Users, 
  TrendingUp, Clock, CheckCircle
} from 'lucide-react';

interface SprintPlanningData {
  id: number;
  sprint_number: number;
  sprint_goal: string;
  start_date: string;
  end_date: string;
  team_capacity: number;
  selected_items: number;
  total_story_points: number;
  status: string;
}

const ScrumSprintPlanning = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [sprints, setSprints] = useState<SprintPlanningData[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  
  const [form, setForm] = useState({
    sprint_goal: '',
    start_date: '',
    end_date: '',
    team_capacity: 40,
  });

  useEffect(() => {
    if (id) {
      loadSprints();
    }
  }, [id]);

  const loadSprints = async () => {
    try {
      setLoading(true);
      const data = await scrumApi.sprints.getAll(id!);
      setSprints(data);
    } catch (err: any) {
      // Mock data
      const today = new Date();
      const twoWeeks = new Date(today.getTime() + 14 * 24 * 60 * 60 * 1000);
      setSprints([
        {
          id: 1,
          sprint_number: 3,
          sprint_goal: 'Complete user authentication and dashboard',
          start_date: today.toISOString().split('T')[0],
          end_date: twoWeeks.toISOString().split('T')[0],
          team_capacity: 40,
          selected_items: 8,
          total_story_points: 34,
          status: 'planning'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSprint = async () => {
    try {
      await scrumApi.sprints.create(id!, form);
      setShowDialog(false);
      setForm({ sprint_goal: '', start_date: '', end_date: '', team_capacity: 40 });
      loadSprints();
    } catch (err: any) {
      alert(err.message || 'Failed to create sprint');
    }
  };

  const handleStartSprint = async (sprintId: number) => {
    if (!confirm('Start this sprint?')) return;
    try {
      await scrumApi.sprints.start(id!, sprintId);
      loadSprints();
    } catch (err: any) {
      alert(err.message || 'Failed to start sprint');
    }
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

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-purple-600" />
              Sprint Planning
            </h1>
            <p className="text-muted-foreground">Plan and organize upcoming sprints</p>
          </div>
          <Button onClick={() => setShowDialog(true)} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            New Sprint
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex gap-4">
              <Target className="h-6 w-6 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-purple-900">Sprint Planning</h3>
                <p className="text-sm text-purple-800 mt-1">
                  Sprint Planning is where the team defines what can be delivered in the upcoming sprint and how that work will be achieved.
                  The team selects items from the Product Backlog and commits to completing them during the sprint.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Current Sprint in Planning */}
        {sprints.filter(s => s.status === 'planning').map((sprint) => (
          <Card key={sprint.id} className="border-purple-300">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-purple-600" />
                  Sprint {sprint.sprint_number} - Planning
                </CardTitle>
                <Button onClick={() => handleStartSprint(sprint.id)} className="bg-green-600 hover:bg-green-700">
                  Start Sprint
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start gap-2">
                <Target className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Sprint Goal</p>
                  <p className="text-muted-foreground">{sprint.sprint_goal}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Duration</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(sprint.start_date).toLocaleDateString()} - {new Date(sprint.end_date).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Team Capacity</p>
                    <p className="text-sm text-muted-foreground">{sprint.team_capacity} story points</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <p className="text-sm text-muted-foreground">Selected Items</p>
                  <p className="text-2xl font-bold">{sprint.selected_items}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Story Points</p>
                  <p className="text-2xl font-bold text-purple-600">{sprint.total_story_points}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Capacity Used</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {Math.round((sprint.total_story_points / sprint.team_capacity) * 100)}%
                  </p>
                </div>
              </div>

              {sprint.total_story_points > sprint.team_capacity && (
                <div className="flex items-center gap-2 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-yellow-600" />
                  <p className="text-sm text-yellow-800">
                    ⚠️ Sprint is overcommitted. Consider removing {sprint.total_story_points - sprint.team_capacity} story points.
                  </p>
                </div>
              )}

              {sprint.total_story_points <= sprint.team_capacity && (
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <p className="text-sm text-green-800">
                    ✓ Sprint commitment looks good. You have {sprint.team_capacity - sprint.total_story_points} points of buffer.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        ))}

        {/* Past Sprints */}
        {sprints.filter(s => s.status !== 'planning').length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Sprint History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {sprints.filter(s => s.status !== 'planning').map((sprint) => (
                  <div key={sprint.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <p className="font-medium">Sprint {sprint.sprint_number}</p>
                      <p className="text-sm text-muted-foreground">{sprint.sprint_goal}</p>
                    </div>
                    <Badge variant={sprint.status === 'completed' ? 'default' : 'secondary'}>
                      {sprint.status}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Sprint Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Sprint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Sprint Goal</label>
              <Textarea 
                value={form.sprint_goal}
                onChange={(e) => setForm({...form, sprint_goal: e.target.value})}
                placeholder="What is the goal of this sprint?"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input 
                  type="date"
                  value={form.start_date}
                  onChange={(e) => setForm({...form, start_date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input 
                  type="date"
                  value={form.end_date}
                  onChange={(e) => setForm({...form, end_date: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Team Capacity (Story Points)</label>
              <Input 
                type="number"
                value={form.team_capacity}
                onChange={(e) => setForm({...form, team_capacity: parseInt(e.target.value) || 0})}
                min={0}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleCreateSprint} 
              disabled={!form.sprint_goal || !form.start_date || !form.end_date}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Create Sprint
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MethodologyHelpPanel methodology="scrum" />
    </div>
  );
};

export default ScrumSprintPlanning;