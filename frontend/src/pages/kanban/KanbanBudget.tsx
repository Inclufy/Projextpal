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
  TrendingUp, TrendingDown, PiggyBank, Receipt
} from 'lucide-react';

interface BudgetItem {
  id: number;
  category: string;
  description: string;
  planned_amount: number;
  actual_amount: number;
}

const KanbanBudget = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<BudgetItem | null>(null);
  
  const [form, setForm] = useState({
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
      // Mock data - replace with actual API call
      setItems([
        { id: 1, category: 'Personnel', description: 'Team salaries and contractors', planned_amount: 50000, actual_amount: 48500 },
        { id: 2, category: 'Tools', description: 'Software licenses and tools', planned_amount: 5000, actual_amount: 4200 },
        { id: 3, category: 'Training', description: 'Kanban certifications and workshops', planned_amount: 3000, actual_amount: 3500 },
        { id: 4, category: 'Infrastructure', description: 'Cloud services and hosting', planned_amount: 8000, actual_amount: 7800 },
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
    setForm({ category: '', description: '', planned_amount: '', actual_amount: '' });
    loadBudget();
  };

  const handleDelete = async (itemId: number) => {
    if (!confirm('Delete this budget item?')) return;
    loadBudget();
  };

  const openEdit = (item: BudgetItem) => {
    setEditingItem(item);
    setForm({
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
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const totalPlanned = items.reduce((sum, i) => sum + i.planned_amount, 0);
  const totalActual = items.reduce((sum, i) => sum + i.actual_amount, 0);
  const variance = totalPlanned - totalActual;
  const utilizationPercent = totalPlanned > 0 ? (totalActual / totalPlanned) * 100 : 0;

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-blue-600" />
              Kanban Budget
            </h1>
            <p className="text-muted-foreground">Track project budget and expenses</p>
          </div>
          <Button onClick={() => { setEditingItem(null); setForm({ category: '', description: '', planned_amount: '', actual_amount: '' }); setShowDialog(true); }}>
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
                  <p className="text-sm text-muted-foreground">Planned Budget</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalPlanned)}</p>
                </div>
                <PiggyBank className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Actual Spent</p>
                  <p className="text-2xl font-bold">{formatCurrency(totalActual)}</p>
                </div>
                <Receipt className="h-8 w-8 text-purple-500 opacity-50" />
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
                  <p className="text-sm text-muted-foreground">Utilization</p>
                  <p className="text-2xl font-bold">{utilizationPercent.toFixed(1)}%</p>
                </div>
                <DollarSign className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Utilization</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Spent: {formatCurrency(totalActual)}</span>
                <span>Budget: {formatCurrency(totalPlanned)}</span>
              </div>
              <Progress 
                value={Math.min(utilizationPercent, 100)} 
                className={`h-3 ${utilizationPercent > 100 ? 'bg-red-100' : utilizationPercent > 80 ? 'bg-yellow-100' : 'bg-green-100'}`}
              />
              {utilizationPercent > 100 && (
                <p className="text-sm text-red-600">⚠️ Budget exceeded by {formatCurrency(totalActual - totalPlanned)}</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Budget Items */}
        <Card>
          <CardHeader>
            <CardTitle>Budget Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {items.map((item) => {
                const itemVariance = item.planned_amount - item.actual_amount;
                const itemPercent = item.planned_amount > 0 ? (item.actual_amount / item.planned_amount) * 100 : 0;
                
                return (
                  <div key={item.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{item.category}</span>
                          <Badge variant={itemVariance >= 0 ? 'default' : 'destructive'} className={itemVariance >= 0 ? 'bg-green-500' : ''}>
                            {itemVariance >= 0 ? 'Under' : 'Over'} Budget
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
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
                    <Progress 
                      value={Math.min(itemPercent, 100)} 
                      className={`h-2 ${itemPercent > 100 ? 'bg-red-100' : 'bg-gray-100'}`}
                    />
                  </div>
                );
              })}
              {items.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No budget items yet</p>
              )}
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
              <label className="text-sm font-medium">Category</label>
              <Input 
                value={form.category}
                onChange={(e) => setForm({...form, category: e.target.value})}
                placeholder="e.g., Personnel, Tools, Training"
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
            <Button onClick={handleSave} disabled={!form.category}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="kanban" />
    </div>
  );
};

export default KanbanBudget;
