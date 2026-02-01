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
import { kanbanApi, KanbanBoard as IKanbanBoard, KanbanColumn, KanbanCard } from '@/lib/kanbanApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Columns, Plus, AlertTriangle, Clock, User, MoreHorizontal, 
  Loader2, AlertCircle, Settings, Ban
} from 'lucide-react';

const KanbanBoard = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [board, setBoard] = useState<IKanbanBoard | null>(null);
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [cards, setCards] = useState<KanbanCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog state
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    card_type: 'task',
    priority: 'medium',
    due_date: '',
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
      setError(null);
      
      // Initialize board if not exists
      const boardRes = await kanbanApi.board.initialize(id!);
      setBoard(boardRes);
      
      // Fetch columns and cards
      const [columnsRes, cardsRes] = await Promise.all([
        kanbanApi.columns.getAll(id!),
        kanbanApi.cards.getAll(id!),
      ]);
      
      setColumns(columnsRes);
      setCards(cardsRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load board');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCard = async () => {
    if (!selectedColumn) return;
    
    try {
      const data: Partial<KanbanCard> = {
        column: selectedColumn,
        title: formData.title,
        description: formData.description || undefined,
        card_type: formData.card_type as any,
        priority: formData.priority as any,
        due_date: formData.due_date || undefined,
        estimated_hours: formData.estimated_hours ? parseFloat(formData.estimated_hours) : undefined,
      };
      
      await kanbanApi.cards.create(id!, data);
      setShowAddCardDialog(false);
      setFormData({
        title: '',
        description: '',
        card_type: 'task',
        priority: 'medium',
        due_date: '',
        estimated_hours: '',
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create card');
    }
  };

  const handleMoveCard = async (cardId: number, newColumnId: number) => {
    try {
      await kanbanApi.cards.move(id!, cardId, { column_id: newColumnId });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to move card');
    }
  };

  const handleToggleBlocked = async (cardId: number) => {
    try {
      const reason = prompt('Block reason (leave empty to unblock):');
      await kanbanApi.cards.toggleBlocked(id!, cardId, reason || undefined);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to toggle blocked status');
    }
  };

  const getColumnCards = (columnId: number) => cards.filter(c => c.column === columnId);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical': return 'bg-red-100 text-red-700 border-red-200';
      case 'high': return 'bg-orange-100 text-orange-700 border-orange-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      default: return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'bug': return 'bg-red-500';
      case 'feature': return 'bg-green-500';
      case 'improvement': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  // Calculate metrics
  const totalCards = cards.length;
  const blockedCards = cards.filter(c => c.is_blocked).length;
  const inProgressCards = cards.filter(c => {
    const col = columns.find(col => col.id === c.column);
    return col?.column_type === 'in_progress';
  }).length;

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
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Columns className="h-6 w-6 text-blue-600" />
              Kanban Board
            </h1>
            <p className="text-muted-foreground">Visualize work and limit WIP</p>
          </div>
          <Button onClick={() => { setSelectedColumn(columns[0]?.id); setShowAddCardDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />Add Card
          </Button>
        </div>

        {/* Quick Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Cards</p>
              <p className="text-2xl font-bold">{totalCards}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{inProgressCards}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Blocked</p>
              <p className="text-2xl font-bold text-red-600">{blockedCards}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Columns</p>
              <p className="text-2xl font-bold">{columns.length}</p>
            </CardContent>
          </Card>
        </div>

        {/* Board */}
        <div className="flex gap-4 overflow-x-auto pb-4">
          {columns.map((column) => {
            const columnCards = getColumnCards(column.id);
            const isOverWip = column.wip_limit && columnCards.length > column.wip_limit;
            
            return (
              <div 
                key={column.id} 
                className={`flex-shrink-0 w-72 rounded-lg ${isOverWip ? 'ring-2 ring-red-500' : ''}`}
                style={{ backgroundColor: column.color + '20' }}
              >
                <div className="p-3 border-b" style={{ borderColor: column.color }}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{column.name}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{columnCards.length}</Badge>
                      {column.wip_limit && (
                        <Badge variant={isOverWip ? 'destructive' : 'outline'}>
                          WIP: {column.wip_limit}
                        </Badge>
                      )}
                    </div>
                  </div>
                  {isOverWip && (
                    <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" />
                      WIP limit exceeded!
                    </p>
                  )}
                </div>
                
                <div className="p-3 space-y-3 min-h-[400px]">
                  {columnCards.map((card) => (
                    <Card 
                      key={card.id} 
                      className={`cursor-pointer hover:shadow-md transition-shadow ${card.is_blocked ? 'border-red-300 bg-red-50' : ''}`}
                    >
                      <CardContent className="p-3">
                        {card.is_blocked && (
                          <div className="flex items-center gap-1 text-red-600 text-xs mb-2">
                            <AlertTriangle className="h-3 w-3" />
                            <span>Blocked: {card.blocked_reason || 'No reason'}</span>
                          </div>
                        )}
                        
                        <div className="flex items-start justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${getTypeColor(card.card_type)}`} />
                            <Badge className={`${getPriorityColor(card.priority)} text-xs`}>
                              {card.priority}
                            </Badge>
                          </div>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-6 w-6"
                            onClick={() => handleToggleBlocked(card.id)}
                          >
                            <Ban className="h-3 w-3" />
                          </Button>
                        </div>
                        
                        <h4 className="font-medium text-sm mb-2">{card.title}</h4>
                        
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          {card.due_date && (
                            <div className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {card.due_date}
                            </div>
                          )}
                          {card.assignee_name && (
                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                              {card.assignee_name.charAt(0)}
                            </div>
                          )}
                        </div>

                        {/* Move buttons */}
                        <div className="flex gap-1 mt-2">
                          {columns.map((col, idx) => {
                            if (col.id === card.column) return null;
                            const currentIdx = columns.findIndex(c => c.id === card.column);
                            const isNext = idx === currentIdx + 1;
                            const isPrev = idx === currentIdx - 1;
                            if (!isNext && !isPrev) return null;
                            
                            return (
                              <Button 
                                key={col.id}
                                size="sm" 
                                variant="ghost" 
                                className="text-xs h-6"
                                onClick={() => handleMoveCard(card.id, col.id)}
                              >
                                {isNext ? '→' : '←'} {col.name}
                              </Button>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  <Button 
                    variant="ghost" 
                    className="w-full justify-start text-muted-foreground"
                    onClick={() => { setSelectedColumn(column.id); setShowAddCardDialog(true); }}
                  >
                    <Plus className="h-4 w-4 mr-2" />Add
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Add Card Dialog */}
      <Dialog open={showAddCardDialog} onOpenChange={setShowAddCardDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Column</label>
              <Select 
                value={selectedColumn?.toString()} 
                onValueChange={(val) => setSelectedColumn(parseInt(val))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select column" />
                </SelectTrigger>
                <SelectContent>
                  {columns.map(col => (
                    <SelectItem key={col.id} value={col.id.toString()}>
                      {col.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input 
                value={formData.title}
                onChange={(e) => setFormData({...formData, title: e.target.value})}
                placeholder="Card title"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Describe the work..."
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={formData.card_type} onValueChange={(val) => setFormData({...formData, card_type: val})}>
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
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input 
                  type="date"
                  value={formData.due_date}
                  onChange={(e) => setFormData({...formData, due_date: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Estimated Hours</label>
                <Input 
                  type="number"
                  value={formData.estimated_hours}
                  onChange={(e) => setFormData({...formData, estimated_hours: e.target.value})}
                  placeholder="4"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddCardDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateCard} disabled={!formData.title || !selectedColumn}>Create Card</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="kanban" />
    </div>
  );
};

export default KanbanBoard;
