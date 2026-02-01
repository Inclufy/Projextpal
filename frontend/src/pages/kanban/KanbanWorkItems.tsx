import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { kanbanApi, KanbanCard, KanbanColumn } from '@/lib/kanbanApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  ListTodo, Plus, Trash2, Edit2, Loader2, 
  AlertTriangle, Clock, User, Tag, Search, Filter
} from 'lucide-react';

const KanbanWorkItems = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingCard, setEditingCard] = useState<KanbanCard | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterPriority, setFilterPriority] = useState<string>('all');
  
  const [form, setForm] = useState({
    title: '',
    description: '',
    card_type: 'task',
    priority: 'medium',
    column: '',
    estimated_hours: '',
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [cardsRes, columnsRes] = await Promise.all([
        kanbanApi.cards.getAll(id!),
        kanbanApi.columns.getAll(id!),
      ]);
      setCards(cardsRes);
      setColumns(columnsRes);
    } catch (err: any) {
      // Mock data
      setColumns([
        { id: 1, name: 'Backlog', column_type: 'backlog', order: 0, color: '#6b7280' },
        { id: 2, name: 'To Do', column_type: 'todo', order: 1, color: '#3b82f6' },
        { id: 3, name: 'In Progress', column_type: 'doing', order: 2, color: '#eab308' },
        { id: 4, name: 'Done', column_type: 'done', order: 3, color: '#22c55e', is_done_column: true },
      ]);
      setCards([
        { id: 1, title: 'Setup database schema', description: 'Create initial tables', card_type: 'task', priority: 'high', column: 2, column_name: 'To Do', is_blocked: false },
        { id: 2, title: 'Design login page', description: 'Create mockups', card_type: 'task', priority: 'medium', column: 3, column_name: 'In Progress', is_blocked: false },
        { id: 3, title: 'Fix navigation bug', description: 'Menu not closing', card_type: 'bug', priority: 'high', column: 3, column_name: 'In Progress', is_blocked: true, blocked_reason: 'Waiting for design specs' },
        { id: 4, title: 'API documentation', description: 'Document all endpoints', card_type: 'task', priority: 'low', column: 1, column_name: 'Backlog', is_blocked: false },
        { id: 5, title: 'User authentication', description: 'Implement OAuth', card_type: 'feature', priority: 'high', column: 4, column_name: 'Done', is_blocked: false },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingCard) {
        await kanbanApi.cards.update(id!, editingCard.id, form);
      } else {
        await kanbanApi.cards.create(id!, {
          ...form,
          column: parseInt(form.column),
          estimated_hours: form.estimated_hours ? parseFloat(form.estimated_hours) : undefined,
        });
      }
      setShowDialog(false);
      setEditingCard(null);
      setForm({ title: '', description: '', card_type: 'task', priority: 'medium', column: '', estimated_hours: '' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save card');
    }
  };

  const handleDelete = async (cardId: number) => {
    if (!confirm('Delete this work item?')) return;
    try {
      await kanbanApi.cards.delete(id!, cardId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete card');
    }
  };

  const openEdit = (card: KanbanCard) => {
    setEditingCard(card);
    setForm({
      title: card.title,
      description: card.description || '',
      card_type: card.card_type,
      priority: card.priority,
      column: card.column.toString(),
      estimated_hours: card.estimated_hours?.toString() || '',
    });
    setShowDialog(true);
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      task: 'bg-blue-500',
      bug: 'bg-red-500',
      feature: 'bg-green-500',
      improvement: 'bg-purple-500',
    };
    return <Badge className={colors[type] || 'bg-gray-500'}>{type}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-600',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-gray-400',
    };
    return <Badge variant="outline" className={`border-2 ${priority === 'critical' || priority === 'high' ? 'border-red-500 text-red-600' : ''}`}>{priority}</Badge>;
  };

  // Filter cards
  const filteredCards = cards.filter(card => {
    const matchesSearch = card.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         card.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || card.card_type === filterType;
    const matchesPriority = filterPriority === 'all' || card.priority === filterPriority;
    return matchesSearch && matchesType && matchesPriority;
  });

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

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <ListTodo className="h-6 w-6 text-blue-600" />
              Work Items
            </h1>
            <p className="text-muted-foreground">Manage all Kanban cards</p>
          </div>
          <Button onClick={() => { setEditingCard(null); setForm({ title: '', description: '', card_type: 'task', priority: 'medium', column: columns[0]?.id.toString() || '', estimated_hours: '' }); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Work Item
          </Button>
        </div>

        {/* Filters */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Search work items..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="task">Task</SelectItem>
                  <SelectItem value="bug">Bug</SelectItem>
                  <SelectItem value="feature">Feature</SelectItem>
                  <SelectItem value="improvement">Improvement</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterPriority} onValueChange={setFilterPriority}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Priority" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Priorities</SelectItem>
                  <SelectItem value="critical">Critical</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{cards.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-yellow-600">
                {cards.filter(c => columns.find(col => col.id === c.column)?.column_type === 'doing').length}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Blocked</p>
              <p className="text-2xl font-bold text-red-600">{cards.filter(c => c.is_blocked).length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {cards.filter(c => columns.find(col => col.id === c.column)?.is_done_column).length}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Work Items Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Work Items ({filteredCards.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {filteredCards.map((card) => (
                <div 
                  key={card.id}
                  className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 ${card.is_blocked ? 'border-red-200 bg-red-50' : ''}`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{card.title}</span>
                      {getTypeBadge(card.card_type)}
                      {getPriorityBadge(card.priority)}
                      {card.is_blocked && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Blocked
                        </Badge>
                      )}
                    </div>
                    {card.description && (
                      <p className="text-sm text-muted-foreground">{card.description}</p>
                    )}
                    {card.is_blocked && card.blocked_reason && (
                      <p className="text-sm text-red-600 mt-1">Reason: {card.blocked_reason}</p>
                    )}
                  </div>
                  <Badge variant="outline">{card.column_name}</Badge>
                  {card.estimated_hours && (
                    <span className="text-sm text-muted-foreground flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {card.estimated_hours}h
                    </span>
                  )}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(card)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(card.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {filteredCards.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No work items found</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingCard ? 'Edit Work Item' : 'Add Work Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input 
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="Work item title"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="Description"
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={form.card_type} onValueChange={(v) => setForm({...form, card_type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="bug">Bug</SelectItem>
                    <SelectItem value="feature">Feature</SelectItem>
                    <SelectItem value="improvement">Improvement</SelectItem>
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
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Column</label>
                <Select value={form.column} onValueChange={(v) => setForm({...form, column: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {columns.map(col => (
                      <SelectItem key={col.id} value={col.id.toString()}>{col.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Estimated Hours</label>
                <Input 
                  type="number"
                  value={form.estimated_hours}
                  onChange={(e) => setForm({...form, estimated_hours: e.target.value})}
                  placeholder="0"
                />
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
          <MethodologyHelpPanel methodology="kanban" />
    </div>
  );
};

export default KanbanWorkItems;
