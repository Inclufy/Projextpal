import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ProjectHeader } from "@/components/ProjectHeader";
import { usePageTranslations } from '@/hooks/usePageTranslations';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatBudgetDetailed, getCurrencyFromLanguage } from '@/lib/currencies';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Plus, Pencil, Trash2, DollarSign } from "lucide-react";
import { toast } from "sonner";

interface Expense {
  id: number;
  title: string;
  description?: string;
  amount: number;
  category: string;
  date: string;
  status: string;
  is_recurring?: boolean;
}

const CATEGORIES = ["Labor Cost", "Material Cost", "Software", "Hardware", "Travel", "Training", "Other"];

const FoundationBudget = () => {
  const { pt } = usePageTranslations();
  const { t, language } = useLanguage();
  const { id: projectId } = useParams<{ id: string }>();
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [projectData, setProjectData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ title: "", amount: "", category: "Other", date: "", description: "", status: "Pending", is_recurring: false });

  const token = localStorage.getItem("access_token");
  const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
  const jsonHeaders = { ...headers, "Content-Type": "application/json" };

  const fetchData = async () => {
    try {
      const [expRes, projRes] = await Promise.all([
        fetch(`/api/v1/projects/expenses/?project=${projectId}`, { headers }),
        fetch(`/api/v1/projects/${projectId}/`, { headers }),
      ]);
      if (expRes.ok) {
        const data = await expRes.json();
        setExpenses(Array.isArray(data) ? data : data.results || []);
      }
      if (projRes.ok) {
        setProjectData(await projRes.json());
      }
    } catch (err) {
      console.error("Failed to fetch budget data", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, [projectId]);

  const totalBudget = parseFloat(projectData?.budget || 0);
  const totalSpent = expenses.reduce((sum, e) => sum + parseFloat(String(e.amount || 0)), 0);
  const remaining = totalBudget - totalSpent;
  const percentUsed = totalBudget > 0 ? Math.min(100, (totalSpent / totalBudget) * 100) : 0;

  const formatCurrency = (val: number) => formatBudgetDetailed(val, getCurrencyFromLanguage(language));

  const openCreate = () => {
    setEditingExpense(null);
    setForm({ title: "", amount: "", category: "Other", date: new Date().toISOString().split("T")[0], description: "", status: "Pending", is_recurring: false });
    setDialogOpen(true);
  };

  const openEdit = (expense: Expense) => {
    setEditingExpense(expense);
    setForm({
      title: expense.title,
      amount: String(expense.amount),
      category: expense.category || "Other",
      date: expense.date?.split("T")[0] || "",
      description: expense.description || "",
      status: expense.status || "Pending",
      is_recurring: expense.is_recurring || false,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title || !form.amount) { toast.error(t.common.titleAmountRequired); return; }
    setSubmitting(true);
    try {
      const body = { ...form, amount: parseFloat(form.amount), project: parseInt(projectId!) };
      const url = editingExpense ? `/api/v1/projects/expenses/${editingExpense.id}/` : "/api/v1/projects/expenses/";
      const method = editingExpense ? "PATCH" : "POST";
      const response = await fetch(url, { method, headers: jsonHeaders, body: JSON.stringify(body) });
      if (response.ok) {
        toast.success(editingExpense ? t.common.projectUpdated : t.common.success);
        setDialogOpen(false);
        fetchData();
      } else {
        const err = await response.json().catch(() => ({}));
        toast.error(err.error || err.detail || t.common.saveFailed);
      }
    } catch { toast.error(t.common.saveFailed); }
    finally { setSubmitting(false); }
  };

  const handleDelete = async (expenseId: number) => {
    if (!confirm(pt("Are you sure?"))) return;
    try {
      const response = await fetch(`/api/v1/projects/expenses/${expenseId}/`, { method: "DELETE", headers });
      if (response.ok || response.status === 204) {
        toast.success(t.common.expenseDeleted);
        fetchData();
      } else { toast.error(t.common.deleteFailed); }
    } catch { toast.error(t.common.deleteFailed); }
  };

  const groupedExpenses = expenses.reduce<Record<string, Expense[]>>((acc, exp) => {
    const cat = exp.category || "Other";
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(exp);
    return acc;
  }, {});

  if (loading) return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="flex items-center justify-center py-20"><Loader2 className="h-8 w-8 animate-spin" /></div>
    </div>
  );

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6">
        <Card className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">{pt("Budget")} Management</h2>
              <p className="text-sm text-muted-foreground">{projectData?.name || ""}</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={openCreate} className="gap-2">
                <Plus className="h-4 w-4" /> {pt("Add")} Expense
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <Card className="p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">{pt("Total Budget")}</p>
              <p className="text-2xl font-bold">{formatCurrency(totalBudget)}</p>
            </Card>
            <Card className="p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">{pt("Spent")}</p>
              <p className="text-2xl font-bold">{formatCurrency(totalSpent)}</p>
              <Progress value={percentUsed} className="mt-2" />
            </Card>
            <Card className="p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">{pt("Remaining")}</p>
              <p className={`text-2xl font-bold ${remaining >= 0 ? "text-green-600" : "text-red-600"}`}>
                {formatCurrency(remaining)}
              </p>
              <p className="text-xs text-muted-foreground">{percentUsed.toFixed(1)}% {pt("used")}</p>
            </Card>
          </div>

          {expenses.length === 0 ? (
            <div className="text-center py-12">
              <DollarSign className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{pt("No expenses yet")}</h3>
              <Button onClick={openCreate}><Plus className="h-4 w-4 mr-2" /> {pt("Add")} Expense</Button>
            </div>
          ) : (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Expense Transactions</h3>
              {Object.entries(groupedExpenses).map(([category, items]) => (
                <div key={category}>
                  <h4 className="text-sm font-medium text-muted-foreground mb-2">{category}</h4>
                  <div className="space-y-2">
                    {items.map((expense) => (
                      <div key={expense.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/30">
                        <div>
                          <p className="font-medium">{expense.title}</p>
                          <p className="text-sm text-muted-foreground">
                            Date: {expense.date?.split("T")[0]} · Amount: {formatCurrency(expense.amount)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          {expense.is_recurring && <Badge className="bg-purple-100 text-purple-700">Recurring</Badge>}
                          <Badge variant={expense.status === "Paid" ? "default" : "secondary"}>{expense.status}</Badge>
                          <Button variant="ghost" size="sm" onClick={() => openEdit(expense)}>{pt("Edit")}</Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDelete(expense.id)}>{pt("Delete")}</Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingExpense ? pt("Edit") : pt("Add")} Expense</DialogTitle>
            <DialogDescription>{editingExpense ? pt("Edit expense details") : pt("Add a new expense")}</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>{pt("Title")} *</Label>
              <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{pt("Amount")} *</Label>
                <Input type="number" value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>{pt("Date")}</Label>
                <Input type="date" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{pt("Category")}</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map(c => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>{pt("Status")}</Label>
                <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Pending">{pt("Pending")}</SelectItem>
                    <SelectItem value="Paid">{pt("Paid")}</SelectItem>
                    <SelectItem value="Cancelled">{pt("Cancelled")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label>{pt("Description")}</Label>
              <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>{pt("Cancel")}</Button>
              <Button onClick={handleSave} disabled={submitting}>
                {submitting && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
                {pt("Save")}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FoundationBudget;
