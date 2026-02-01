import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { kanbanApi, KanbanColumn, KanbanSwimlane } from '@/lib/kanbanApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Settings, Plus, GripVertical, Trash2, Edit2, 
  Loader2, AlertCircle, Columns, Rows
} from 'lucide-react';

const KanbanBoardConfiguration = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [columns, setColumns] = useState<KanbanColumn[]>([]);
  const [swimlanes, setSwimlanes] = useState<KanbanSwimlane[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog states
  const [showColumnDialog, setShowColumnDialog] = useState(false);
  const [showSwimlaneDialog, setShowSwimlaneDialog] = useState(false);
  const [editingColumn, setEditingColumn] = useState<KanbanColumn | null>(null);
  const [editingSwimlane, setEditingSwimlane] = useState<KanbanSwimlane | null>(null);
  
  const [columnForm, setColumnForm] = useState({
    name: '',
    wip_limit: '',
    color: '#6366f1',
    is_done_column: false,
  });
  
  const [swimlaneForm, setSwimlaneForm] = useState({
    name: '',
    color: '#f3f4f6',
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [columnsRes, swimlanesRes] = await Promise.all([
        kanbanApi.columns.getAll(id!),
        kanbanApi.swimlanes.getAll(id!),
      ]);
      setColumns(columnsRes);
      setSwimlanes(swimlanesRes);
    } catch (err: any) {
      setError(err.message || 'Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveColumn = async () => {
    try {
      const data: Partial<KanbanColumn> = {
        name: columnForm.name,
        wip_limit: columnForm.wip_limit ? parseInt(columnForm.wip_limit) : undefined,
        color: columnForm.color,
        is_done_column: columnForm.is_done_column,
      };
      
      if (editingColumn) {
        await kanbanApi.columns.update(id!, editingColumn.id, data);
      } else {
        await kanbanApi.columns.create(id!, data);
      }
      
      setShowColumnDialog(false);
      setEditingColumn(null);
      setColumnForm({ name: '', wip_limit: '', color: '#6366f1', is_done_column: false });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save column');
    }
  };

  const handleDeleteColumn = async (columnId: number) => {
    if (!confirm('Delete this column? Cards will be moved to another column.')) return;
    try {
      await kanbanApi.columns.delete(id!, columnId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete column');
    }
  };

  const handleSaveSwimlane = async () => {
    try {
      const data: Partial<KanbanSwimlane> = {
        name: swimlaneForm.name,
        color: swimlaneForm.color,
      };
      
      if (editingSwimlane) {
        await kanbanApi.swimlanes.update(id!, editingSwimlane.id, data);
      } else {
        await kanbanApi.swimlanes.create(id!, data);
      }
      
      setShowSwimlaneDialog(false);
      setEditingSwimlane(null);
      setSwimlaneForm({ name: '', color: '#f3f4f6' });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to save swimlane');
    }
  };

  const handleDeleteSwimlane = async (swimlaneId: number) => {
    if (!confirm('Delete this swimlane?')) return;
    try {
      await kanbanApi.swimlanes.delete(id!, swimlaneId);
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete swimlane');
    }
  };

  const openEditColumn = (column: KanbanColumn) => {
    setEditingColumn(column);
    setColumnForm({
      name: column.name,
      wip_limit: column.wip_limit?.toString() || '',
      color: column.color,
      is_done_column: column.is_done_column,
    });
    setShowColumnDialog(true);
  };

  const openEditSwimlane = (swimlane: KanbanSwimlane) => {
    setEditingSwimlane(swimlane);
    setSwimlaneForm({
      name: swimlane.name,
      color: swimlane.color,
    });
    setShowSwimlaneDialog(true);
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

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Settings className="h-6 w-6 text-blue-600" />
              Board Configuration
            </h1>
            <p className="text-muted-foreground">Configure columns, swimlanes, and board settings</p>
          </div>
        </div>

        {/* Columns */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Columns className="h-5 w-5" />
              Columns
            </CardTitle>
            <Button size="sm" onClick={() => { setEditingColumn(null); setColumnForm({ name: '', wip_limit: '', color: '#6366f1', is_done_column: false }); setShowColumnDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />Add Column
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {columns.map((column, index) => (
                <div 
                  key={column.id}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: column.color }}
                  />
                  <span className="font-medium flex-1">{column.name}</span>
                  <Badge variant="outline">{column.column_type}</Badge>
                  {column.wip_limit && (
                    <Badge variant="secondary">WIP: {column.wip_limit}</Badge>
                  )}
                  {column.is_done_column && (
                    <Badge className="bg-green-500">Done Column</Badge>
                  )}
                  <Badge variant="outline">{column.cards_count || 0} cards</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditColumn(column)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDeleteColumn(column.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {columns.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No columns configured</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Swimlanes */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Rows className="h-5 w-5" />
              Swimlanes
            </CardTitle>
            <Button size="sm" onClick={() => { setEditingSwimlane(null); setSwimlaneForm({ name: '', color: '#f3f4f6' }); setShowSwimlaneDialog(true); }}>
              <Plus className="h-4 w-4 mr-2" />Add Swimlane
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {swimlanes.map((swimlane) => (
                <div 
                  key={swimlane.id}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <GripVertical className="h-4 w-4 text-muted-foreground cursor-move" />
                  <div 
                    className="w-4 h-4 rounded"
                    style={{ backgroundColor: swimlane.color }}
                  />
                  <span className="font-medium flex-1">{swimlane.name}</span>
                  {swimlane.is_default && (
                    <Badge variant="secondary">Default</Badge>
                  )}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEditSwimlane(swimlane)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    {!swimlane.is_default && (
                      <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDeleteSwimlane(swimlane.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
              {swimlanes.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No swimlanes configured</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Column Dialog */}
      <Dialog open={showColumnDialog} onOpenChange={setShowColumnDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingColumn ? 'Edit Column' : 'Add Column'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input 
                value={columnForm.name}
                onChange={(e) => setColumnForm({...columnForm, name: e.target.value})}
                placeholder="e.g., In Progress"
              />
            </div>
            <div>
              <label className="text-sm font-medium">WIP Limit (optional)</label>
              <Input 
                type="number"
                value={columnForm.wip_limit}
                onChange={(e) => setColumnForm({...columnForm, wip_limit: e.target.value})}
                placeholder="e.g., 5"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2 items-center">
                <Input 
                  type="color"
                  value={columnForm.color}
                  onChange={(e) => setColumnForm({...columnForm, color: e.target.value})}
                  className="w-16 h-10"
                />
                <Input 
                  value={columnForm.color}
                  onChange={(e) => setColumnForm({...columnForm, color: e.target.value})}
                  placeholder="#6366f1"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch 
                checked={columnForm.is_done_column}
                onCheckedChange={(checked) => setColumnForm({...columnForm, is_done_column: checked})}
              />
              <label className="text-sm">This is the "Done" column</label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowColumnDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveColumn} disabled={!columnForm.name}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Swimlane Dialog */}
      <Dialog open={showSwimlaneDialog} onOpenChange={setShowSwimlaneDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingSwimlane ? 'Edit Swimlane' : 'Add Swimlane'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input 
                value={swimlaneForm.name}
                onChange={(e) => setSwimlaneForm({...swimlaneForm, name: e.target.value})}
                placeholder="e.g., Frontend Team"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Color</label>
              <div className="flex gap-2 items-center">
                <Input 
                  type="color"
                  value={swimlaneForm.color}
                  onChange={(e) => setSwimlaneForm({...swimlaneForm, color: e.target.value})}
                  className="w-16 h-10"
                />
                <Input 
                  value={swimlaneForm.color}
                  onChange={(e) => setSwimlaneForm({...swimlaneForm, color: e.target.value})}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSwimlaneDialog(false)}>Cancel</Button>
            <Button onClick={handleSaveSwimlane} disabled={!swimlaneForm.name}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="kanban" />
    </div>
  );
};

export default KanbanBoardConfiguration;
