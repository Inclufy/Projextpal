import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
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
  DollarSign, Plus, Loader2, PieChart, Calendar, AlertTriangle
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

interface BudgetItem {
  id: number;
  category: string;
  planned: number;
  actual: number;
  iteration?: string;
}

const fetchBudgetData = async (projectId: string) => {
  const token = localStorage.getItem("access_token");
  
  // Try project budget endpoint
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/budget/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (response.ok) {
    return response.json();
  }
  
  // Fallback to project data
  const projectResponse = await fetch(`${API_BASE_URL}/projects/${projectId}/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!projectResponse.ok) return null;
  const project = await projectResponse.json();
  
  return {
    budget: {
      total: parseFloat(project.budget) || 0,
      spent: parseFloat(project.spent_budget) || 0,
      remaining: (parseFloat(project.budget) || 0) - (parseFloat(project.spent_budget) || 0),
      burnRate: 0,
    },
    items: project.budget_items || [],
    iterations: project.iteration_budgets || [],
  };
};

const AgileBudget = () => {
  const { id } = useParams<{ id: string }>();
  const [showDialog, setShowDialog] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['project-budget', id],
    queryFn: () => fetchBudgetData(id!),
    enabled: !!id,
  });

  const budget = data?.budget || {
    total: 0,
    spent: 0,
    remaining: 0,
    burnRate: 0,
  };
  
  const items: BudgetItem[] = data?.items || [];
  const iterationBudgets = data?.iterations || [];

  const getVariance = (planned: number, actual: number) => {
    return planned - actual;
  };

  const getVarianceColor = (variance: number) => {
    if (variance > 0) return 'text-green-600';
    if (variance < 0) return 'text-red-600';
    return 'text-gray-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  const spentPercentage = budget.total > 0 ? (budget.spent / budget.total) * 100 : 0;
  const isOverBudget = budget.spent > budget.total;

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-emerald-600" />
              Agile Budget
            </h1>
            <p className="text-muted-foreground">Track budget across iterations</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Expense
          </Button>
        </div>

        {/* Budget Overview */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Budget</p>
              <p className="text-2xl font-bold">€{budget.total.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Spent</p>
              <p className={`text-2xl font-bold ${isOverBudget ? 'text-red-600' : 'text-blue-600'}`}>
                €{budget.spent.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Remaining</p>
              <p className={`text-2xl font-bold ${budget.remaining < 0 ? 'text-red-600' : 'text-green-600'}`}>
                €{budget.remaining.toLocaleString()}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Burn Rate / Iteration</p>
              <p className="text-2xl font-bold text-orange-600">€{budget.burnRate.toLocaleString()}</p>
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

        {/* Budget by Category */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              Budget by Category
            </CardTitle>
          </CardHeader>
          <CardContent>
            {items.length === 0 ? (
              <div className="text-center py-8">
                <PieChart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No budget categories defined</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => {
                  const variance = getVariance(item.planned, item.actual);
                  const progress = item.planned > 0 ? (item.actual / item.planned) * 100 : 0;
                  return (
                    <div key={item.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="font-medium">{item.category}</span>
                        <div className="flex items-center gap-4">
                          <span className="text-sm text-muted-foreground">
                            €{item.actual.toLocaleString()} / €{item.planned.toLocaleString()}
                          </span>
                          <span className={`text-sm font-medium ${getVarianceColor(variance)}`}>
                            {variance >= 0 ? '+' : ''}€{variance.toLocaleString()}
                          </span>
                        </div>
                      </div>
                      <Progress value={Math.min(progress, 100)} className="h-2" />
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Budget per Iteration */}
        {iterationBudgets.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                Budget per Iteration
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-2">Iteration</th>
                      <th className="text-right py-2">Planned</th>
                      <th className="text-right py-2">Actual</th>
                      <th className="text-right py-2">Variance</th>
                      <th className="text-right py-2">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {iterationBudgets.map((iter: any, idx: number) => {
                      const variance = (iter.planned || 0) - (iter.actual || 0);
                      return (
                        <tr key={idx} className="border-b hover:bg-muted/50">
                          <td className="py-3 font-medium">{iter.iteration || `Iteration ${idx + 1}`}</td>
                          <td className="text-right">€{(iter.planned || 0).toLocaleString()}</td>
                          <td className="text-right">€{(iter.actual || 0).toLocaleString()}</td>
                          <td className={`text-right ${getVarianceColor(variance)}`}>
                            {variance >= 0 ? '+' : ''}€{variance.toLocaleString()}
                          </td>
                          <td className="text-right">
                            {variance >= 0 ? (
                              <Badge className="bg-green-500">Under Budget</Badge>
                            ) : (
                              <Badge variant="destructive">Over Budget</Badge>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Agile Budgeting Tip */}
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-emerald-900 mb-2">Agile Budgeting Tips</h3>
            <ul className="space-y-1 text-sm text-emerald-800">
              <li>• Budget per iteration for better tracking and flexibility</li>
              <li>• Review and adjust budget at each iteration retrospective</li>
              <li>• Use velocity to forecast remaining budget needs</li>
              <li>• Keep contingency for unexpected changes (10-15%)</li>
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
              <label className="text-sm font-medium">Category</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="development">Development</SelectItem>
                  <SelectItem value="design">Design</SelectItem>
                  <SelectItem value="qa">QA & Testing</SelectItem>
                  <SelectItem value="infrastructure">Infrastructure</SelectItem>
                  <SelectItem value="tools">Tools & Licenses</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Amount</label>
              <Input type="number" placeholder="0.00" />
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
          <MethodologyHelpPanel methodology="agile" />
    </div>
  );
};

export default AgileBudget;
