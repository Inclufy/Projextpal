import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { scrumApi, Sprint, BacklogItem } from '@/lib/scrumApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  LayoutGrid, Plus, Play, CheckCircle, Loader2, AlertCircle, 
  Calendar, Target, TrendingUp, Clock, Users
} from 'lucide-react';

const ScrumSprintBoard = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [activeSprint, setActiveSprint] = useState<Sprint | null>(null);
  const [sprintItems, setSprintItems] = useState<BacklogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    goal: '',
    start_date: '',
    end_date: '',
    team_capacity: '',
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const sprintsRes = await scrumApi.sprints.getAll(id!);
      setSprints(sprintsRes);
      
      // Find active sprint
      const active = sprintsRes.find(s => s.status === 'active');
      if (active) {
        setActiveSprint(active);
        const items = await scrumApi.items.getAll(id!, { sprint: active.id });
        setSprintItems(items);
      } else if (sprintsRes.length > 0) {
        // Show latest sprint if no active
        const latest = sprintsRes[0];
        setActiveSprint(latest);
        const items = await scrumApi.items.getAll(id!, { sprint: latest.id });
        setSprintItems(items);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load sprints');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateSprint = async () => {
    try {
      const data: Partial<Sprint> = {
        goal: formData.goal || undefined,
        start_date: formData.start_date || undefined,
        end_date: formData.end_date || undefined,
        team_capacity: formData.team_capacity ? parseInt(formData.team_capacity) : undefined,
      };
      
      await scrumApi.sprints.create(id!, data);
      setShowCreateDialog(false);
      setFormData({ goal: '', start_date: '', end_date: '', team_capacity: '' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create sprint');
    }
  };

  const handleStartSprint = async (sprintId: number) => {
    try {
      await scrumApi.sprints.start(id!, sprintId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to start sprint');
    }
  };

  const handleCompleteSprint = async (sprintId: number) => {
    if (!confirm('Complete this sprint? Incomplete items will be moved back to the backlog.')) return;
    try {
      await scrumApi.sprints.complete(id!, sprintId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to complete sprint');
    }
  };

  const handleStatusChange = async (itemId: number, status: string) => {
    try {
      await scrumApi.items.updateStatus(id!, itemId, status);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'planning': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  // Group sprint items by status for board view
  const todoItems = sprintItems.filter(i => i.status === 'ready' || i.status === 'new');
  const inProgressItems = sprintItems.filter(i => i.status === 'in_progress');
  const doneItems = sprintItems.filter(i => i.status === 'done');

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="p-6">
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 flex items-center gap-2 text-red-600">
              <AlertCircle className="h-5 w-5" />
              <span>{error}</span>
              <Button variant="outline" size="sm" onClick={loadData}>Retry</Button>
            </CardContent>
          </Card>
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
              <LayoutGrid className="h-6 w-6 text-blue-600" />
              Sprint Board
            </h1>
            <p className="text-muted-foreground">Track sprint progress and manage work</p>
          </div>
          <div className="flex gap-2">
            {activeSprint?.status === 'planning' && (
              <Button variant="outline" className="text-green-600" onClick={() => handleStartSprint(activeSprint.id)}>
                <Play className="h-4 w-4 mr-2" />Start Sprint
              </Button>
            )}
            {activeSprint?.status === 'active' && (
              <Button variant="outline" className="text-blue-600" onClick={() => handleCompleteSprint(activeSprint.id)}>
                <CheckCircle className="h-4 w-4 mr-2" />Complete Sprint
              </Button>
            )}
            <Button onClick={() => setShowCreateDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />New Sprint
            </Button>
          </div>
        </div>

        {/* Sprint Selector */}
        {sprints.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {sprints.map(sprint => (
              <Button
                key={sprint.id}
                variant={activeSprint?.id === sprint.id ? 'default' : 'outline'}
                size="sm"
                onClick={() => {
                  setActiveSprint(sprint);
                  scrumApi.items.getAll(id!, { sprint: sprint.id }).then(setSprintItems);
                }}
              >
                {sprint.name}
                <Badge className={`ml-2 ${getStatusColor(sprint.status)}`} variant="secondary">
                  {sprint.status}
                </Badge>
              </Button>
            ))}
          </div>
        )}

        {activeSprint ? (
          <>
            {/* Sprint Info */}
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-xl font-semibold">{activeSprint.name}</h2>
                    {activeSprint.goal && (
                      <p className="text-muted-foreground mt-1 flex items-center gap-2">
                        <Target className="h-4 w-4" />
                        {activeSprint.goal}
                      </p>
                    )}
                  </div>
                  <Badge className={getStatusColor(activeSprint.status)}>
                    {activeSprint.status}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-4">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {activeSprint.start_date || 'Not started'} - {activeSprint.end_date || 'No end date'}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      {activeSprint.completed_story_points || 0} / {activeSprint.total_story_points || 0} pts
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">{sprintItems.length} items</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-muted-foreground" />
                    <span className="text-sm">
                      Capacity: {activeSprint.team_capacity || 'Not set'} pts
                    </span>
                  </div>
                </div>

                <Progress 
                  value={activeSprint.progress_percentage || 0} 
                  className="h-2"
                />
                <p className="text-sm text-muted-foreground mt-1">
                  {activeSprint.progress_percentage || 0}% complete
                </p>
              </CardContent>
            </Card>

            {/* Sprint Board */}
            <div className="grid grid-cols-3 gap-4">
              {/* To Do */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>To Do</span>
                    <Badge variant="secondary">{todoItems.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {todoItems.map(item => (
                    <Card key={item.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">{item.item_type}</Badge>
                        <Badge variant="outline">{item.story_points || 0} pts</Badge>
                      </div>
                      <p className="text-sm font-medium mb-2">{item.title}</p>
                      <div className="flex items-center justify-between">
                        {item.assignee_name && (
                          <span className="text-xs text-muted-foreground">{item.assignee_name}</span>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleStatusChange(item.id, 'in_progress')}>
                          Start →
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {todoItems.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">No items</p>
                  )}
                </CardContent>
              </Card>

              {/* In Progress */}
              <Card className="bg-blue-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>In Progress</span>
                    <Badge variant="secondary" className="bg-blue-100">{inProgressItems.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {inProgressItems.map(item => (
                    <Card key={item.id} className="p-3 cursor-pointer hover:shadow-md transition-shadow">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">{item.item_type}</Badge>
                        <Badge variant="outline">{item.story_points || 0} pts</Badge>
                      </div>
                      <p className="text-sm font-medium mb-2">{item.title}</p>
                      <div className="flex items-center justify-between">
                        {item.assignee_name && (
                          <span className="text-xs text-muted-foreground">{item.assignee_name}</span>
                        )}
                        <Button size="sm" variant="ghost" onClick={() => handleStatusChange(item.id, 'done')}>
                          Done ✓
                        </Button>
                      </div>
                    </Card>
                  ))}
                  {inProgressItems.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">No items</p>
                  )}
                </CardContent>
              </Card>

              {/* Done */}
              <Card className="bg-green-50/50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm flex items-center justify-between">
                    <span>Done</span>
                    <Badge variant="secondary" className="bg-green-100">{doneItems.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {doneItems.map(item => (
                    <Card key={item.id} className="p-3 opacity-75">
                      <div className="flex items-start justify-between mb-2">
                        <Badge variant="outline" className="text-xs">{item.item_type}</Badge>
                        <Badge className="bg-green-500">{item.story_points || 0} pts</Badge>
                      </div>
                      <p className="text-sm font-medium line-through">{item.title}</p>
                      {item.assignee_name && (
                        <span className="text-xs text-muted-foreground">{item.assignee_name}</span>
                      )}
                    </Card>
                  ))}
                  {doneItems.length === 0 && (
                    <p className="text-center text-muted-foreground text-sm py-4">No items completed yet</p>
                  )}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <Card>
            <CardContent className="pt-8 pb-8 text-center">
              <LayoutGrid className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No Sprints Yet</h3>
              <p className="text-muted-foreground mb-4">Create your first sprint to start tracking work</p>
              <Button onClick={() => setShowCreateDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />Create Sprint
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Sprint Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Create New Sprint</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Sprint Goal</label>
              <Textarea 
                value={formData.goal}
                onChange={(e) => setFormData({...formData, goal: e.target.value})}
                placeholder="What do you want to achieve in this sprint?"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input 
                  type="date"
                  value={formData.start_date}
                  onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input 
                  type="date"
                  value={formData.end_date}
                  onChange={(e) => setFormData({...formData, end_date: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Team Capacity (Story Points)</label>
              <Input 
                type="number"
                value={formData.team_capacity}
                onChange={(e) => setFormData({...formData, team_capacity: e.target.value})}
                placeholder="e.g., 40"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateSprint}>Create Sprint</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="scrum" />
    </div>
  );
};

export default ScrumSprintBoard;
