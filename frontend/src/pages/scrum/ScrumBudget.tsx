import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  DollarSign, Plus, Trash2, Edit2, Loader2, 
  TrendingUp, TrendingDown, PiggyBank, Receipt, Zap
} from 'lucide-react';

interface BudgetItem {
  id: number;
  sprint: string;
  category: string;
  description: string;
  planned_amount: number;
  actual_amount: number;
}

const ScrumBudget = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  
  const [form, setForm] = useState({
    sprint: '',
    category: '',
    description: '',
    planned_amount: '',
    actual_amount: '',
  });

  useEffect(() => {
    if (id) {
      loadBudget();
    }
  }, [id]);

  const loadBudget = async () => {
    try {
      setLoading(true);
      // Mock data
      setItems([
        { id: 1, sprint: 'Sprint 1', category: 'Development', description: 'Sprint 1 development costs', planned_amount: 15000, actual_amount: 14500 },
        { id: 2, sprint: 'Sprint 1', category: 'Testing', description: 'QA and testing', planned_amount: 3000, actual_amount: 3200 },
        { id: 3, sprint: 'Sprint 2', category: 'Development', description: 'Sprint 2 development costs', planned_amount: 15000, actual_amount: 15800 },
        { id: 4, sprint: 'Sprint 2', category: 'Infrastructure', description: 'Cloud costs', planned_amount: 2000, actual_amount: 1800 },
        { id: 5, sprint: 'Sprint 3', category: 'Development', description: 'Sprint 3 development costs', planned_amount: 15000, actual_amount: 0 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setShowDialog(false);
    setEditingItem(null);
    setForm({ sprint: '', category: '', description: '', planned_amount: '', actual_amount: '' });
    loadBudget();
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm('Delete this budget item?')) return;
    loadBudget();
  };

  const openEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setForm({
      sprint: item.sprint,
      category: item.category,
      description: item.description,
      planned_amount: item.planned_amount.toString(),
      actual_amount: item.actual_amount.toString(),
    });
    setShowDialog(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('nl-NL', { style: 'currency', currency: 'EUR' }).format(amount);
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

  const totalPlanned = items.reduce((sum, i) => sum + i.planned_amount, 0);
  const totalActual = items.reduce((sum, i) => sum + i.actual_amount, 0);
  const variance = totalPlanned - totalActual;
  const utilizationPercent = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

  // Group by sprint
  const sprints = [...new Set(items.map(i => i.sprint))];
  const sprintBudgets = sprints.map(sprint => {
    const sprintItems = items.filter(i => i.sprint === sprint);
    return {
      sprint,
      planned: sprintItems.reduce((sum, i) => sum + i.planned_amount, 0),
      actual: sprintItems.reduce((sum, i) => sum + i.actual_amount, 0),
    };
  });

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-purple-600" />
              Scrum Budget
            </h1>
            <p className="text-muted-foreground">Track budget per sprint</p>
          </div>
          <Button onClick={() => { setEditingItem(null); setForm({ sprint: '', category: '', description: '', planned_amount: '', actual_amount: '' }); setShowDialog(true); }} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Budget Item
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Planned</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalPlanned)}</p>
                </div>
                <PiggyBank className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Spent</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalActual)}</p>
                </div>
                <Receipt className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className={variance >= 0 ? 'border-green-200' : 'border-red-200'}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Variance</p>
                  <p className={`text-2xl font-bold ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {variance >= 0 ? '+' : ''}{formatCurrency(variance)}
                  </p>
                </div>
                {variance >= 0 ? (
                  <TrendingDown className="h-8 w-8 text-green-500 opacity-50" />
                ) : (
                  <TrendingUp className="h-8 w-8 text-red-500 opacity-50" />
                )}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sprints</p>
                  <p className="text-2xl font-bold">{sprints.length}</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sprint Budget Overview */}
        <Card>
          <CardHeader>
            <CardTitle>Budget per Sprint</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sprintBudgets.map((sb) => {
                const sprintVariance = sb.planned - sb.actual;
                const sprintPercent = sb.planned > 0 ? (sb.actual / sb.planned) * 100 : 0;
                
                return (
                  <div key={sb.sprint} className="space-y-2">
                    <div className="flex justify-between">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-purple-500" />
                        <span className="font-medium">{sb.sprint}</span>
                      </div>
                      <div className="flex items-center gap-4 text-sm">
                        <span>Planned: {formatCurrency(sb.planned)}</span>
                        <span>Actual: {formatCurrency(sb.actual)}</span>
                        <Badge variant={sprintVariance >= 0 ? 'default' : 'destructive'} className={sprintVariance >= 0 ? 'bg-green-500' : ''}>
                          {sprintVariance >= 0 ? 'Under' : 'Over'}
                        </Badge>
                      </div>
                    </div>
                    <Progress 
                      value={Math.min(sprintPercent, 100)} 
                      className={`h-2 ${sprintPercent > 100 ? 'bg-red-100' : 'bg-gray-100'}`}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Budget Items */}
        <Card>
          <CardHeader>
            <CardTitle>All Budget Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {items.map((item) => (
                <div 
                  key={item.id}
                  className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{item.sprint}</Badge>
                      <Badge variant="secondary">{item.category}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">{item.description}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Planned</p>
                      <p className="font-medium">{formatCurrency(item.planned_amount)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Actual</p>
                      <p className="font-medium">{formatCurrency(item.actual_amount)}</p>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => openEdit(item)}>
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingItem ? 'Edit Budget Item' : 'Add Budget Item'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Sprint</label>
              <Input 
                value={form.sprint}
                onChange={(e) => setForm({...form, sprint: e.target.value})}
                placeholder="e.g., Sprint 3"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Input 
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
                placeholder="e.g., Development, Testing"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input 
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="Brief description"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Planned Amount (€)</label>
                <Input 
                  type="number"
                  value={form.planned_amount}
                  onChange={(e) => setForm({...form, planned_amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Actual Amount (€)</label>
                <Input 
                  type="number"
                  value={form.actual_amount}
                  onChange={(e) => setForm({...form, actual_amount: e.target.value})}
                  placeholder="0.00"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.sprint || !form.category} className="bg-purple-600 hover:bg-purple-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="scrum" />
    </div>
  );
};

export default ScrumBudget;
