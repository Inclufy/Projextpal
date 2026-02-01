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
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  ListChecks, Plus, Edit2, Trash2, GripVertical, 
  ChevronDown, ChevronRight, Loader2, Target
} from 'lucide-react';

interface Story {
  id: number;
  title: string;
  description: string;
  type: 'epic' | 'story' | 'task' | 'bug';
  priority: 'must' | 'should' | 'could' | 'wont';
  points: number;
  status: 'backlog' | 'ready' | 'in_progress' | 'done';
  epic_id?: number;
}

const AgileBacklog = () => {
  const { id } = useParams<{ id: string }>();
  
  const [items, setItems] = useState<Story[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Story | null>(null);
  const [expandedEpics, setExpandedEpics] = useState<Set<number>>(new Set([1, 2]));
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'story',
    priority: 'should',
    points: '3',
    epic_id: '',
  });

  useEffect(() => {
    loadBacklog();
  }, [id]);

  const loadBacklog = async () => {
    setLoading(true);
    setTimeout(() => {
      setItems([
        // Epics
        { id: 1, title: 'User Authentication', description: 'Complete auth system', type: 'epic', priority: 'must', points: 0, status: 'in_progress' },
        { id: 2, title: 'Dashboard Features', description: 'Main dashboard functionality', type: 'epic', priority: 'must', points: 0, status: 'ready' },
        { id: 3, title: 'Reporting Module', description: 'Analytics and reports', type: 'epic', priority: 'should', points: 0, status: 'backlog' },
        
        // Stories under Epic 1
        { id: 101, title: 'Login page UI', description: 'As a user, I want a clean login page', type: 'story', priority: 'must', points: 5, status: 'done', epic_id: 1 },
        { id: 102, title: 'OAuth integration', description: 'Google and GitHub login', type: 'story', priority: 'should', points: 8, status: 'in_progress', epic_id: 1 },
        { id: 103, title: 'Password reset flow', description: 'Email-based password reset', type: 'story', priority: 'must', points: 5, status: 'ready', epic_id: 1 },
        
        // Stories under Epic 2
        { id: 201, title: 'Project overview widget', description: 'Summary cards on dashboard', type: 'story', priority: 'must', points: 3, status: 'ready', epic_id: 2 },
        { id: 202, title: 'Activity timeline', description: 'Recent activity feed', type: 'story', priority: 'should', points: 5, status: 'ready', epic_id: 2 },
        { id: 203, title: 'Quick actions menu', description: 'Common actions accessible', type: 'story', priority: 'could', points: 3, status: 'backlog', epic_id: 2 },
        
        // Stories under Epic 3
        { id: 301, title: 'Export to PDF', description: 'Download reports as PDF', type: 'story', priority: 'should', points: 5, status: 'backlog', epic_id: 3 },
        { id: 302, title: 'Custom report builder', description: 'Drag-drop report creation', type: 'story', priority: 'could', points: 13, status: 'backlog', epic_id: 3 },
      ]);
      setLoading(false);
    }, 500);
  };

  const getTypeBadge = (type: Story['type']) => {
    const colors: Record<string, string> = {
      epic: 'bg-purple-500',
      story: 'bg-blue-500',
      task: 'bg-gray-500',
      bug: 'bg-red-500',
    };
    return <Badge className={colors[type]}>{type}</Badge>;
  };

  const getPriorityBadge = (priority: Story['priority']) => {
    const labels: Record<string, { label: string; color: string }> = {
      must: { label: 'Must Have', color: 'bg-red-500' },
      should: { label: 'Should Have', color: 'bg-orange-500' },
      could: { label: 'Could Have', color: 'bg-yellow-500' },
      wont: { label: "Won't Have", color: 'bg-gray-400' },
    };
    const p = labels[priority];
    return <Badge className={p.color}>{p.label}</Badge>;
  };

  const getStatusBadge = (status: Story['status']) => {
    const colors: Record<string, string> = {
      backlog: 'bg-gray-400',
      ready: 'bg-blue-500',
      in_progress: 'bg-yellow-500',
      done: 'bg-green-500',
    };
    return <Badge variant="outline">{status.replace('_', ' ')}</Badge>;
  };

  const toggleEpic = (epicId: number) => {
    const newExpanded = new Set(expandedEpics);
    if (newExpanded.has(epicId)) {
      newExpanded.delete(epicId);
    } else {
      newExpanded.add(epicId);
    }
    setExpandedEpics(newExpanded);
  };

  const handleSave = () => {
    // Save logic
    setShowDialog(false);
    setEditingItem(null);
    setForm({ title: '', description: '', type: 'story', priority: 'should', points: '3', epic_id: '' });
  };

  const handleDelete = (itemId: number) => {
    if (!confirm('Delete this item?')) return;
    setItems(items.filter(i => i.id !== itemId));
  };

  const openEdit = (item: Story) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description,
      type: item.type,
      priority: item.priority,
      points: item.points.toString(),
      epic_id: item.epic_id?.toString() || '',
    });
    setShowDialog(true);
  };

  const epics = items.filter(i => i.type === 'epic');
  const getEpicStories = (epicId: number) => items.filter(i => i.epic_id === epicId);
  
  const totalPoints = items.filter(i => i.type === 'story').reduce((sum, i) => sum + i.points, 0);
  const completedPoints = items.filter(i => i.status === 'done').reduce((sum, i) => sum + i.points, 0);

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
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
              <ListChecks className="h-6 w-6 text-emerald-600" />
              Product Backlog
            </h1>
            <p className="text-muted-foreground">Prioritized list of work items</p>
          </div>
          <Button onClick={() => { setEditingItem(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Item
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{items.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Points</p>
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
              <p className="text-sm text-muted-foreground">Ready for Dev</p>
              <p className="text-2xl font-bold text-blue-600">
                {items.filter(i => i.status === 'ready').length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Filter */}
        <div className="flex gap-4">
          <Select value={filterPriority} onValueChange={setFilterPriority}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by priority" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Priorities</SelectItem>
              <SelectItem value="must">Must Have</SelectItem>
              <SelectItem value="should">Should Have</SelectItem>
              <SelectItem value="could">Could Have</SelectItem>
              <SelectItem value="wont">Won't Have</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Backlog Items */}
        <Card>
          <CardHeader>
            <CardTitle>Epics & Stories</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {epics.map((epic) => {
                const stories = getEpicStories(epic.id);
                const epicPoints = stories.reduce((sum, s) => sum + s.points, 0);
                const isExpanded = expandedEpics.has(epic.id);

                return (
                  <div key={epic.id} className="border rounded-lg">
                    {/* Epic Header */}
                    <div 
                      className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50"
                      onClick={() => toggleEpic(epic.id)}
                    >
                      <GripVertical className="h-4 w-4 text-muted-foreground" />
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          {getTypeBadge(epic.type)}
                          <span className="font-semibold">{epic.title}</span>
                          {getPriorityBadge(epic.priority)}
                        </div>
                        <p className="text-sm text-muted-foreground">{epic.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline">{stories.length} stories</Badge>
                        <p className="text-sm text-muted-foreground mt-1">{epicPoints} points</p>
                      </div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={(e) => { e.stopPropagation(); openEdit(epic); }}>
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Stories */}
                    {isExpanded && stories.length > 0 && (
                      <div className="border-t bg-muted/20">
                        {stories
                          .filter(s => filterPriority === 'all' || s.priority === filterPriority)
                          .map((story) => (
                          <div 
                            key={story.id}
                            className="flex items-center gap-3 p-3 pl-12 border-b last:border-b-0 hover:bg-muted/50"
                          >
                            <GripVertical className="h-4 w-4 text-muted-foreground" />
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                {getTypeBadge(story.type)}
                                <span className="font-medium">{story.title}</span>
                                {getPriorityBadge(story.priority)}
                                {getStatusBadge(story.status)}
                              </div>
                              <p className="text-sm text-muted-foreground">{story.description}</p>
                            </div>
                            <Badge variant="outline" className="font-mono">
                              {story.points} pts
                            </Badge>
                            <div className="flex gap-1">
                              <Button variant="ghost" size="icon" onClick={() => openEdit(story)}>
                                <Edit2 className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(story.id)}>
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* MoSCoW Legend */}
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-emerald-900 mb-2">MoSCoW Prioritization</h3>
            <div className="grid grid-cols-4 gap-4 text-sm">
              <div>
                <Badge className="bg-red-500">Must Have</Badge>
                <p className="mt-1 text-emerald-800">Critical for delivery</p>
              </div>
              <div>
                <Badge className="bg-orange-500">Should Have</Badge>
                <p className="mt-1 text-emerald-800">Important but not critical</p>
              </div>
              <div>
                <Badge className="bg-yellow-500">Could Have</Badge>
                <p className="mt-1 text-emerald-800">Nice to have</p>
              </div>
              <div>
                <Badge className="bg-gray-400">Won't Have</Badge>
                <p className="mt-1 text-emerald-800">Not this time</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Item' : 'Add Backlog Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input 
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="User story title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="As a [user], I want [feature] so that [benefit]"
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={form.type} onValueChange={(v) => setForm({...form, type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="epic">Epic</SelectItem>
                    <SelectItem value="story">Story</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={form.priority} onValueChange={(v) => setForm({...form, priority: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="must">Must Have</SelectItem>
                    <SelectItem value="should">Should Have</SelectItem>
                    <SelectItem value="could">Could Have</SelectItem>
                    <SelectItem value="wont">Won't Have</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Story Points</label>
                <Select value={form.points} onValueChange={(v) => setForm({...form, points: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1</SelectItem>
                    <SelectItem value="2">2</SelectItem>
                    <SelectItem value="3">3</SelectItem>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="8">8</SelectItem>
                    <SelectItem value="13">13</SelectItem>
                    <SelectItem value="21">21</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Epic</label>
                <Select value={form.epic_id} onValueChange={(v) => setForm({...form, epic_id: v})}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select epic" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">No Epic</SelectItem>
                    {epics.map(e => (
                      <SelectItem key={e.id} value={e.id.toString()}>{e.title}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="agile" />
    </div>
  );
};

export default AgileBacklog;
