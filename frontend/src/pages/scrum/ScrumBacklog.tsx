import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { scrumApi, BacklogItem, Sprint } from '@/lib/scrumApi';
import { ListChecks, Plus, GripVertical, ChevronDown, ChevronRight, User, Clock, Loader2, AlertCircle } from 'lucide-react';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const ScrumBacklog = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [items, setItems] = useState<BacklogItem[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedEpics, setExpandedEpics] = useState<number[]>([]);
  
  // Dialog state
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [dialogType, setDialogType] = useState<'user_story' | 'epic'>('user_story');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    acceptance_criteria: '',
    story_points: '',
    priority: 'medium',
    item_type: 'user_story',
    parent: null as number | null,
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
      
      // Initialize backlog if not exists
      await scrumApi.backlog.initialize(id!);
      
      // Fetch items and sprints
      const [itemsRes, sprintsRes] = await Promise.all([
        scrumApi.items.getAll(id!),
        scrumApi.sprints.getAll(id!),
      ]);
      
      setItems(itemsRes);
      setSprints(sprintsRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load backlog');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const data: Partial<BacklogItem> = {
        title: formData.title,
        description: formData.description || undefined,
        acceptance_criteria: formData.acceptance_criteria || undefined,
        story_points: formData.story_points ? parseInt(formData.story_points) : undefined,
        priority: formData.priority as any,
        item_type: formData.item_type as any,
        parent: formData.parent || undefined,
      };
      
      await scrumApi.items.create(id!, data);
      setShowAddDialog(false);
      setFormData({
        title: '',
        description: '',
        acceptance_criteria: '',
        story_points: '',
        priority: 'medium',
        item_type: 'user_story',
        parent: null,
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create item');
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

  const handleAssignToSprint = async (itemId: number, sprintId: number | null) => {
    try {
      await scrumApi.items.assignToSprint(id!, itemId, sprintId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to assign to sprint');
    }
  };

  const toggleEpic = (epicId: number) => {
    setExpandedEpics(prev => 
      prev.includes(epicId) ? prev.filter(id => id !== epicId) : [...prev, epicId]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'done': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'ready': return 'bg-yellow-500';
      default: return 'bg-gray-400';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700';
      case 'high': return 'bg-orange-100 text-orange-700';
      case 'medium': return 'bg-yellow-100 text-yellow-700';
      default: return 'bg-green-100 text-green-700';
    }
  };

  // Group items by epic
  const epics = items.filter(item => item.item_type === 'epic');
  const storiesWithoutEpic = items.filter(item => item.item_type !== 'epic' && !item.parent);
  
  const getEpicStories = (epicId: number) => items.filter(item => item.parent === epicId);

  const totalPoints = items.reduce((sum, item) => sum + (item.story_points || 0), 0);
  const completedPoints = items.filter(i => i.status === 'done').reduce((sum, item) => sum + (item.story_points || 0), 0);

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
              <ListChecks className="h-6 w-6 text-blue-600" />
              Product Backlog
            </h1>
            <p className="text-muted-foreground">Manage User Stories & Epics</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => { setDialogType('user_story'); setFormData({...formData, item_type: 'user_story'}); setShowAddDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />Add Story
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700" onClick={() => { setDialogType('epic'); setFormData({...formData, item_type: 'epic'}); setShowAddDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />Add Epic
            </Button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Story Points</p>
              <p className="text-2xl font-bold">{totalPoints}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{completedPoints} pts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className="text-2xl font-bold text-blue-600">{totalPoints - completedPoints} pts</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{items.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Backlog */}
        <Card>
          <CardHeader>
            <CardTitle>Backlog Items</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {items.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <ListChecks className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No backlog items yet</p>
                <p className="text-sm">Add your first user story or epic to get started</p>
              </div>
            ) : (
              <>
                {/* Epics with their stories */}
                {epics.map((epic) => {
                  const stories = getEpicStories(epic.id);
                  const epicPoints = stories.reduce((sum, s) => sum + (s.story_points || 0), 0);
                  const epicCompleted = stories.filter(s => s.status === 'done').reduce((sum, s) => sum + (s.story_points || 0), 0);
                  
                  return (
                    <div key={epic.id} className="border rounded-lg">
                      <div 
                        className="p-3 bg-muted/30 flex items-center gap-3 cursor-pointer hover:bg-muted/50"
                        onClick={() => toggleEpic(epic.id)}
                      >
                        <GripVertical className="h-4 w-4 text-muted-foreground" />
                        {expandedEpics.includes(epic.id) ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                        <Badge className="bg-purple-500">Epic</Badge>
                        <span className="font-medium flex-1">{epic.title}</span>
                        <Badge className={getPriorityColor(epic.priority)}>{epic.priority}</Badge>
                        <Badge className={getStatusColor(epic.status)}>{epic.status.replace('_', ' ')}</Badge>
                        <span className="text-sm text-muted-foreground">
                          {epicCompleted}/{epicPoints} pts
                        </span>
                      </div>

                      {expandedEpics.includes(epic.id) && (
                        <div className="divide-y">
                          {stories.map((story) => (
                            <div key={story.id} className="p-3 pl-12 flex items-center gap-3 hover:bg-muted/30">
                              <GripVertical className="h-4 w-4 text-muted-foreground" />
                              <Badge variant="outline" className="text-xs">{story.item_type}</Badge>
                              <span className="flex-1">{story.title}</span>
                              <Badge variant="outline" className="font-mono">{story.story_points || 0} pts</Badge>
                              {story.assignee_name && (
                                <div className="flex items-center gap-1 text-sm text-muted-foreground">
                                  <User className="h-3 w-3" />
                                  {story.assignee_name}
                                </div>
                              )}
                              {story.sprint_name && (
                                <Badge variant="outline" className="text-xs">{story.sprint_name}</Badge>
                              )}
                              <Select value={story.status} onValueChange={(val) => handleStatusChange(story.id, val)}>
                                <SelectTrigger className="w-28 h-7">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="new">New</SelectItem>
                                  <SelectItem value="ready">Ready</SelectItem>
                                  <SelectItem value="in_progress">In Progress</SelectItem>
                                  <SelectItem value="done">Done</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          ))}
                          <div className="p-2 pl-12">
                            <Button variant="ghost" size="sm" onClick={() => { setFormData({...formData, item_type: 'user_story', parent: epic.id}); setShowAddDialog(true); }}>
                              <Plus className="h-3 w-3 mr-1" />Add Story
                            </Button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Stories without epic */}
                {storiesWithoutEpic.length > 0 && (
                  <div className="border rounded-lg mt-4">
                    <div className="p-3 bg-muted/30">
                      <span className="font-medium">Unassigned Items</span>
                    </div>
                    <div className="divide-y">
                      {storiesWithoutEpic.map((story) => (
                        <div key={story.id} className="p-3 flex items-center gap-3 hover:bg-muted/30">
                          <GripVertical className="h-4 w-4 text-muted-foreground" />
                          <Badge variant="outline" className="text-xs">{story.item_type}</Badge>
                          <span className="flex-1">{story.title}</span>
                          <Badge variant="outline" className="font-mono">{story.story_points || 0} pts</Badge>
                          <Badge className={getPriorityColor(story.priority)}>{story.priority}</Badge>
                          <Select value={story.status} onValueChange={(val) => handleStatusChange(story.id, val)}>
                            <SelectTrigger className="w-28 h-7">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="new">New</SelectItem>
                              <SelectItem value="ready">Ready</SelectItem>
                              <SelectItem value="in_progress">In Progress</SelectItem>
                              <SelectItem value="done">Done</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add {formData.item_type === 'epic' ? 'Epic' : 'User Story'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder={formData.item_type === 'epic' ? 'Epic title' : 'As a user, I want to...'}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the requirement..."
              />
            </div>
            {formData.item_type !== 'epic' && (
              <>
                <div>
                  <label className="text-sm font-medium">Acceptance Criteria</label>
                  <Textarea 
                    value={formData.acceptance_criteria}
                    onChange={(e) => setFormData({...formData, acceptance_criteria: e.target.value})}
                    placeholder="Given... When... Then..."
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Story Points</label>
                    <Input 
                      type="number"
                      value={formData.story_points}
                      onChange={(e) => setFormData({...formData, story_points: e.target.value})}
                      placeholder="3"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Priority</label>
                    <Select value={formData.priority} onValueChange={(val) => setFormData({...formData, priority: val})}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="critical">Critical</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="low">Low</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formData.title}>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="scrum" />
    </div>
  );
};

export default ScrumBacklog;
