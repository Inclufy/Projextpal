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
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Sparkles, Plus, Trash2, Edit2, Loader2, CheckCircle,
  Clock, Target, Lightbulb, TrendingUp, AlertTriangle
} from 'lucide-react';

interface Improvement {
  id: number;
  title: string;
  description: string;
  category: string;
  status: string;
  priority: string;
  expected_impact: string;
  created_at: string;
  completed_at?: string;
}

const KanbanContinuousImprovement = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [improvements, setImprovements] = useState<Improvement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<Improvement | null>(null);
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    category: 'process',
    priority: 'medium',
    expected_impact: '',
  });

  useEffect(() => {
    if (id) {
      loadImprovements();
    }
  }, [id]);

  const loadImprovements = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      setImprovements([
        { 
          id: 1, 
          title: 'Reduce code review time', 
          description: 'Implement automated code quality checks before review',
          category: 'process',
          status: 'in_progress',
          priority: 'high',
          expected_impact: 'Reduce cycle time by 20%',
          created_at: '2024-12-01'
        },
        { 
          id: 2, 
          title: 'Daily standup optimization', 
          description: 'Use async updates for simple status, sync only for blockers',
          category: 'communication',
          status: 'completed',
          priority: 'medium',
          expected_impact: 'Save 2.5 hours/week team-wide',
          created_at: '2024-11-15',
          completed_at: '2024-12-05'
        },
        { 
          id: 3, 
          title: 'WIP limit adjustment', 
          description: 'Reduce In Progress WIP from 6 to 4 based on metrics',
          category: 'flow',
          status: 'pending',
          priority: 'high',
          expected_impact: 'Improve lead time by 15%',
          created_at: '2024-12-08'
        },
        { 
          id: 4, 
          title: 'Add expedite lane', 
          description: 'Create dedicated swimlane for urgent production issues',
          category: 'board',
          status: 'pending',
          priority: 'low',
          expected_impact: 'Better handling of urgent work',
          created_at: '2024-12-10'
        },
      ]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setShowDialog(false);
    setEditingItem(null);
    setForm({ title: '', description: '', category: 'process', priority: 'medium', expected_impact: '' });
    loadImprovements();
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm('Delete this improvement?')) return;
    loadImprovements();
  };

  const handleStatusChange = async (item: Improvement, newStatus: string) => {
    // Implementation would update via API
    loadImprovements();
  };

  const openEdit = (item: Improvement) => {
    setEditingItem(item);
    setForm({
      title: item.title,
      description: item.description,
      category: item.category,
      priority: item.priority,
      expected_impact: item.expected_impact,
    });
    setShowDialog(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500">Completed</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'pending': return <Badge variant="secondary">Pending</Badge>;
      case 'cancelled': return <Badge variant="outline">Cancelled</Badge>;
      default: return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low': return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'process': return <Target className="h-4 w-4" />;
      case 'flow': return <TrendingUp className="h-4 w-4" />;
      case 'communication': return <Lightbulb className="h-4 w-4" />;
      case 'board': return <Sparkles className="h-4 w-4" />;
      default: return <Sparkles className="h-4 w-4" />;
    }
  };

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

  const completed = improvements.filter(i => i.status === 'completed').length;
  const inProgress = improvements.filter(i => i.status === 'in_progress').length;
  const pending = improvements.filter(i => i.status === 'pending').length;

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-blue-600" />
              Continuous Improvement
            </h1>
            <p className="text-muted-foreground">Track and implement process improvements</p>
          </div>
          <Button onClick={() => { setEditingItem(null); setForm({ title: '', description: '', category: 'process', priority: 'medium', expected_impact: '' }); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Improvement
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Ideas</p>
                  <p className="text-2xl font-bold">{improvements.length}</p>
                </div>
                <Lightbulb className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-blue-600">{inProgress}</p>
                </div>
                <Clock className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-yellow-600">{pending}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{completed}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Kaizen Principle */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-4">
            <div className="flex gap-4 items-center">
              <div className="p-3 bg-white rounded-full shadow">
                <Sparkles className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-blue-900">Kaizen - Continuous Improvement</h3>
                <p className="text-sm text-blue-800">
                  Small, incremental changes lead to significant improvements over time. 
                  Focus on identifying bottlenecks, reducing waste, and improving flow.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Improvements List */}
        <div className="grid gap-4">
          {improvements.map((item) => (
            <Card key={item.id} className={item.status === 'completed' ? 'opacity-75' : ''}>
              <CardContent className="pt-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="p-1.5 bg-gray-100 rounded">
                        {getCategoryIcon(item.category)}
                      </span>
                      <h3 className="font-semibold">{item.title}</h3>
                      {getStatusBadge(item.status)}
                      {getPriorityBadge(item.priority)}
                    </div>
                    <p className="text-sm text-muted-foreground mb-2">{item.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      <span className="flex items-center gap-1 text-green-600">
                        <Target className="h-3 w-3" />
                        {item.expected_impact}
                      </span>
                      <span className="text-muted-foreground">
                        Created: {new Date(item.created_at).toLocaleDateString()}
                      </span>
                      {item.completed_at && (
                        <span className="text-green-600">
                          Completed: {new Date(item.completed_at).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {item.status !== 'completed' && (
                      <Select 
                        value={item.status} 
                        onValueChange={(v) => handleStatusChange(item, v)}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="pending">Pending</SelectItem>
                          <SelectItem value="in_progress">In Progress</SelectItem>
                          <SelectItem value="completed">Completed</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    )}
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
          {improvements.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                No improvement ideas yet. Start by identifying bottlenecks in your flow!
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Improvement' : 'Add Improvement'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input 
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="Brief title for the improvement"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="Describe the improvement in detail"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={form.category} onValueChange={(v) => setForm({...form, category: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="process">Process</SelectItem>
                    <SelectItem value="flow">Flow</SelectItem>
                    <SelectItem value="communication">Communication</SelectItem>
                    <SelectItem value="board">Board</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
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
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Expected Impact</label>
              <Input 
                value={form.expected_impact}
                onChange={(e) => setForm({...form, expected_impact: e.target.value})}
                placeholder="e.g., Reduce cycle time by 20%"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.title}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="kanban" />
    </div>
  );
};

export default KanbanContinuousImprovement;
