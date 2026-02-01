import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  DollarSign, TrendingUp, TrendingDown, Plus, 
  Loader2, PieChart, FileText, AlertTriangle
} from 'lucide-react';

interface BudgetPhase {
  id: string;
  name: string;
  planned: number;
  actual: number;
  status: 'completed' | 'in_progress' | 'pending';
}

const WaterfallBudget = () => {
  const { id } = useParams<{ id: string }>();
  
  const [budget, setBudget] = useState({
    total: 150000,
    spent: 87000,
    remaining: 63000,
    contingency: 15000,
    contingencyUsed: 3000,
  });
  
  const [phases, setPhases] = useState<BudgetPhase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadBudget();
  }, [id]);

  const loadBudget = async () => {
    setLoading(true);
    setTimeout(() => {
      setPhases([
        { id: 'requirements', name: 'Requirements', planned: 15000, actual: 14500, status: 'completed' },
        { id: 'design', name: 'Design', planned: 25000, actual: 26500, status: 'completed' },
        { id: 'development', name: 'Development', planned: 60000, actual: 38000, status: 'in_progress' },
        { id: 'testing', name: 'Testing', planned: 20000, actual: 5000, status: 'in_progress' },
        { id: 'deployment', name: 'Deployment', planned: 10000, actual: 0, status: 'pending' },
        { id: 'maintenance', name: 'Maintenance', planned: 5000, actual: 0, status: 'pending' },
      ]);
      setLoading(false);
    }, 500);
  };

  const getVariance = (planned: number, actual: number) => {
    return planned - actual;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  const getStatusBadge = (status: BudgetPhase['status']) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500">Completed</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500">In Progress</Badge>;
      default: return <Badge variant="outline">Pending</Badge>;
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

  const totalPlanned = phases.reduce((sum, p) => sum + p.planned, 0);
  const totalActual = phases.reduce((sum, p) => sum + p.actual, 0);
  const spentPercentage = (budget.spent / budget.total) * 100;
  const isOverBudget = budget.spent > budget.total;

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-blue-600" />
              Project Budget
            </h1>
            <p className="text-muted-foreground">Track budget by project phase</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold">${budget.total.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Spent</p>
              <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-blue-600'}`}>
                ${budget.spent.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-2xl font-bold ${budget.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                ${budget.remaining.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Contingency</p>
              <p className="text-2xl font-bold">${budget.contingency.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Contingency Used</p>
              <p className="text-2xl font-bold text-orange-600">${budget.contingencyUsed.toLocaleString()}</p>
            </CardContent>
          </Card>
        </div>

        {/* Budget Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex justify-between mb-2">
              <span className="font-medium">Budget Utilization</span>
              <span className={spentPercentage > 100 ? 'text-red-600 font-bold' : ''}>
                {spentPercentage.toFixed(1)}%
              </span>
            </div>
            <Progress value={Math.min(spentPercentage, 100)} className="h-3" />
            {spentPercentage > 80 && spentPercentage <= 100 && (
              <p className="text-sm text-yellow-600 mt-2 flex items-center gap-1">
                <AlertTriangle className="h-4 w-4" />
                Budget is over 80% utilized
              </p>
            )}
          </CardContent>
        </Card>

        {/* Budget by Phase */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Budget by Phase
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Phase</th>
                    <th className="text-left py-2">Status</th>
                    <th className="text-right py-2">Planned</th>
                    <th className="text-right py-2">Actual</th>
                    <th className="text-right py-2">Variance</th>
                    <th className="text-right py-2">Progress</th>
                  </tr>
                </thead>
                <tbody>
                  {phases.map((phase) => {
                    const variance = getVariance(phase.planned, phase.actual);
                    const progress = phase.status === 'pending' ? 0 : 
                      phase.status === 'completed' ? 100 : 
                      (phase.actual / phase.planned) * 100;
                    return (
                      <tr key={phase.id} className="border-b hover:bg-muted/50">
                        <td className="py-3 font-medium">{phase.name}</td>
                        <td className="py-3">{getStatusBadge(phase.status)}</td>
                        <td className="text-right">${phase.planned.toLocaleString()}</td>
                        <td className="text-right">${phase.actual.toLocaleString()}</td>
                        <td className={`text-right font-medium ${getVarianceColor(variance)}`}>
                          {variance >= 0 ? '+' : ''}${variance.toLocaleString()}
                        </td>
                        <td className="text-right">
                          <div className="flex items-center gap-2 justify-end">
                            <Progress value={Math.min(progress, 100)} className="h-2 w-20" />
                            <span className="text-sm w-12">{Math.round(progress)}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  <tr className="bg-muted/50 font-semibold">
                    <td className="py-3">Total</td>
                    <td></td>
                    <td className="text-right">${totalPlanned.toLocaleString()}</td>
                    <td className="text-right">${totalActual.toLocaleString()}</td>
                    <td className={`text-right ${getVarianceColor(totalPlanned - totalActual)}`}>
                      {totalPlanned - totalActual >= 0 ? '+' : ''}${(totalPlanned - totalActual).toLocaleString()}
                    </td>
                    <td></td>
                  </tr>
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Visual Budget Breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Phase Budget Allocation</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {phases.map((phase) => {
                const percentage = (phase.planned / totalPlanned) * 100;
                const actualPercentage = (phase.actual / phase.planned) * 100;
                return (
                  <div key={phase.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span>{phase.name}</span>
                      <span className="text-muted-foreground">
                        ${phase.actual.toLocaleString()} / ${phase.planned.toLocaleString()} ({percentage.toFixed(0)}% of total)
                      </span>
                    </div>
                    <div className="relative h-4 bg-gray-100 rounded overflow-hidden">
                      <div 
                        className="absolute h-full bg-gray-200 rounded"
                        style={{ width: '100%' }}
                      />
                      <div 
                        className={`absolute h-full rounded ${
                          actualPercentage > 100 ? 'bg-red-500' : 
                          phase.status === 'completed' ? 'bg-green-500' : 'bg-blue-500'
                        }`}
                        style={{ width: `${Math.min(actualPercentage, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Waterfall Budget Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-blue-900 mb-2">Waterfall Budget Management</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Define budget at project initiation with detailed estimates</li>
              <li>• Include contingency reserve (typically 10-15%)</li>
              <li>• Track Earned Value (EV) for budget performance</li>
              <li>• Formal change control for budget modifications</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Add Expense Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Expense</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Phase</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select phase" />
                </SelectTrigger>
                <SelectContent>
                  {phases.map(phase => (
                    <SelectItem key={phase.id} value={phase.id}>{phase.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input type="number" placeholder="0.00" />
            </div>
            <div>
              <label className="text-sm font-medium">Category</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="labor">Labor</SelectItem>
                  <SelectItem value="tools">Tools & Software</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="consulting">Consulting</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Input placeholder="Expense description" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button>Save Expense</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="waterfall" />
    </div>
  );
};

export default WaterfallBudget;
