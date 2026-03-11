// ============================================================
// PLAN MANAGEMENT - PRODUCTION VERSION
// Uses real API data from /api/v1/admin/plans/
// ============================================================

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatBudgetDetailed, getCurrencyFromLanguage } from '@/lib/currencies';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { api } from '@/lib/api';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import {
  CreditCard,
  Plus,
  Edit,
  Trash2,
  Users,
  FolderKanban,
  HardDrive,
  Star,
  RefreshCw,
  AlertCircle,
  Check,
  X,
  TrendingUp,
} from 'lucide-react';
import { toast } from 'sonner';
import { usePageTranslations } from '@/hooks/usePageTranslations';

// ============================================================
// TYPES
// ============================================================

interface Plan {
  id: number;
  name: string;
  plan_type: 'monthly' | 'yearly';
  plan_level: string;
  price: number;
  stripe_price_id: string;
  stripe_product_id: string | null;
  max_users: number | null;
  max_projects: number | null;
  storage_limit_gb: number | null;
  features: string[];
  is_active: boolean;
  is_popular: boolean;
  priority_support: boolean;
  advanced_analytics: boolean;
  custom_integrations: boolean;
  subscriber_count: number;
  monthly_revenue: number;
  created_at: string;
  updated_at: string;
}

// ============================================================
// HELPER: Parse number with Dutch locale support (comma -> dot)
// ============================================================

const parseNumber = (value: string | number | undefined | null): number | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  // Convert to string and replace comma with dot for Dutch locale
  const normalized = value.toString().replace(',', '.');
  const parsed = parseFloat(normalized);
  return isNaN(parsed) ? null : parsed;
};

const parseInteger = (value: string | number | undefined | null): number | null => {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  const parsed = parseInt(value.toString(), 10);
  return isNaN(parsed) ? null : parsed;
};

// ============================================================
// COMPONENT
// ============================================================

export default function PlanManagement() {
  const { pt } = usePageTranslations();
  const { language } = useLanguage();
  const isNL = language === 'nl';

  // State
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');
  
  // Dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<Plan | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    plan_type: 'monthly' as 'monthly' | 'yearly',
    plan_level: 'starter',
    price: '',
    stripe_price_id: '',
    max_users: '',
    max_projects: '',
    storage_limit_gb: '',
    is_active: true,
    is_popular: false,
    priority_support: false,
    advanced_analytics: false,
    custom_integrations: false,
  });

  // ============================================================
  // FETCH DATA
  // ============================================================

  const fetchPlans = async () => {
  setIsLoading(true);
  setError(null);

  try {
    const data = await api.get<any>('/admin/plans/');
    setPlans(data.results || data);
  } catch (err: any) {
    console.error('Error fetching plans:', err);
    setError(isNL ? 'Kon abonnementen niet laden' : 'Failed to load plans');
  } finally {
    setIsLoading(false);
  }
};

  useEffect(() => {
    fetchPlans();
  }, []);

  // ============================================================
  // ACTIONS
  // ============================================================

  const handleCreate = async () => {
  // Validate required fields
  const price = parseNumber(formData.price);
  if (!formData.name || price === null) {
    toast.error(isNL ? 'Naam en prijs zijn verplicht' : 'Name and price are required');
    return;
  }

  // Validate Stripe Price ID
  if (!formData.stripe_price_id || formData.stripe_price_id === 'price_xxx') {
    toast.error(isNL 
      ? 'Vul een geldig Stripe Price ID in (niet price_xxx)' 
      : 'Please enter a valid Stripe Price ID (not price_xxx)'
    );
    return;
  }

  try {
    await api.post('/admin/plans/', {
      name: formData.name,
      plan_type: formData.plan_type,
      plan_level: formData.plan_level,
      price: price,
      stripe_price_id: formData.stripe_price_id,
      max_users: parseInteger(formData.max_users),
      max_projects: parseInteger(formData.max_projects),
      storage_limit_gb: parseNumber(formData.storage_limit_gb),
      is_active: formData.is_active,
      is_popular: formData.is_popular,
      priority_support: formData.priority_support,
      advanced_analytics: formData.advanced_analytics,
      custom_integrations: formData.custom_integrations,
      features: [],
    });

    toast.success(isNL ? 'Abonnement aangemaakt' : 'Plan created');
    setIsCreateDialogOpen(false);
    resetForm();
    fetchPlans();
  } catch (err: any) {
    console.error('Create plan error:', err);
    toast.error(err.message);
  }
};

  const handleUpdate = async () => {
  if (!selectedPlan) return;

  const price = parseNumber(formData.price);
  if (!formData.name || price === null) {
    toast.error(isNL ? 'Naam en prijs zijn verplicht' : 'Name and price are required');
    return;
  }

  try {
    await api.patch(`/admin/plans/${selectedPlan.id}/`, {
      name: formData.name,
      plan_type: formData.plan_type,
      plan_level: formData.plan_level,
      price: price,
      max_users: parseInteger(formData.max_users),
      max_projects: parseInteger(formData.max_projects),
      storage_limit_gb: parseNumber(formData.storage_limit_gb),
      is_active: formData.is_active,
      is_popular: formData.is_popular,
      priority_support: formData.priority_support,
      advanced_analytics: formData.advanced_analytics,
      custom_integrations: formData.custom_integrations,
    });

    toast.success(isNL ? 'Abonnement bijgewerkt' : 'Plan updated');
    setIsEditDialogOpen(false);
    resetForm();
    fetchPlans();
  } catch (err: any) {
    console.error('Update plan error:', err);
    toast.error(err.message);
  }
};

  const handleDelete = async () => {
  if (!selectedPlan) return;

  try {
    await api.delete(`/admin/plans/${selectedPlan.id}/`);
    toast.success(isNL ? 'Abonnement verwijderd' : 'Plan deleted');
    setIsDeleteDialogOpen(false);
    setSelectedPlan(null);
    fetchPlans();
  } catch (err: any) {
    toast.error(err.message);
  }
};

  const handleToggleActive = async (plan: Plan) => {
  try {
    await api.post(`/admin/plans/${plan.id}/toggle_active/`);
    toast.success(
      plan.is_active 
        ? (isNL ? 'Abonnement gedeactiveerd' : 'Plan deactivated')
        : (isNL ? 'Abonnement geactiveerd' : 'Plan activated')
    );
    fetchPlans();
  } catch (err: any) {
    toast.error(err.message);
  }
};

  const handleSetPopular = async (plan: Plan) => {
  try {
    await api.post(`/admin/plans/${plan.id}/set_popular/`);
    toast.success(isNL ? 'Gemarkeerd als populair' : 'Marked as popular');
    fetchPlans();
  } catch (err: any) {
    toast.error(err.message);
  }
};

  const resetForm = () => {
    setFormData({
      name: '',
      plan_type: 'monthly',
      plan_level: 'starter',
      price: '',
      stripe_price_id: '',
      max_users: '',
      max_projects: '',
      storage_limit_gb: '',
      is_active: true,
      is_popular: false,
      priority_support: false,
      advanced_analytics: false,
      custom_integrations: false,
    });
    setSelectedPlan(null);
  };

  const openEditDialog = (plan: Plan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      plan_type: plan.plan_type,
      plan_level: plan.plan_level,
      price: plan.price.toString(),
      stripe_price_id: plan.stripe_price_id,
      max_users: plan.max_users?.toString() || '',
      max_projects: plan.max_projects?.toString() || '',
      storage_limit_gb: plan.storage_limit_gb?.toString() || '',
      is_active: plan.is_active,
      is_popular: plan.is_popular,
      priority_support: plan.priority_support,
      advanced_analytics: plan.advanced_analytics,
      custom_integrations: plan.custom_integrations,
    });
    setIsEditDialogOpen(true);
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const formatCurrency = (amount: number) => formatBudgetDetailed(amount, getCurrencyFromLanguage(language));

  // ============================================================
  // STATS
  // ============================================================

  const stats = {
    totalPlans: plans.length,
    activePlans: plans.filter(p => p.is_active).length,
    totalSubscribers: plans.reduce((sum, p) => sum + p.subscriber_count, 0),
    mrr: plans.reduce((sum, p) => sum + p.monthly_revenue, 0),
  };

  // Filter plans by type
  const monthlyPlans = plans.filter(p => p.plan_type === 'monthly');
  const yearlyPlans = plans.filter(p => p.plan_type === 'yearly');

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNL ? 'Abonnementenbeheer' : 'Plan Management'}
          </h1>
          <p className="text-muted-foreground">
            {isNL ? 'Beheer alle abonnementen en prijzen' : 'Manage all subscription plans and pricing'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchPlans}>
            <RefreshCw className="mr-2 h-4 w-4" />
            {isNL ? 'Vernieuwen' : 'Refresh'}
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="mr-2 h-4 w-4" />
            {isNL ? 'Nieuw Abonnement' : 'New Plan'}
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isNL ? 'Totaal Abonnementen' : 'Total Plans'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPlans}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activePlans} {isNL ? 'actief' : 'active'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isNL ? 'Totaal Abonnees' : 'Total Subscribers'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalSubscribers}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">MRR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatCurrency(stats.mrr)}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ARR</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(stats.mrr * 12)}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <div className="flex items-center justify-center p-8 text-red-500">
          <AlertCircle className="mr-2 h-5 w-5" />
          {error}
        </div>
      )}

      {/* Loading State */}
      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plans Tabs */}
      {!isLoading && !error && (
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">
              {isNL ? 'Alle Abonnementen' : 'All Plans'} ({plans.length})
            </TabsTrigger>
            <TabsTrigger value="monthly">
              {isNL ? 'Maandelijks' : 'Monthly'} ({monthlyPlans.length})
            </TabsTrigger>
            <TabsTrigger value="yearly">
              {isNL ? 'Jaarlijks' : 'Yearly'} ({yearlyPlans.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4">
            <PlanTable 
              plans={plans} 
              isNL={isNL} 
              onEdit={openEditDialog}
              onDelete={(plan) => { setSelectedPlan(plan); setIsDeleteDialogOpen(true); }}
              onToggleActive={handleToggleActive}
              onSetPopular={handleSetPopular}
              formatCurrency={formatCurrency}
            />
          </TabsContent>
          
          <TabsContent value="monthly" className="mt-4">
            <PlanTable 
              plans={monthlyPlans} 
              isNL={isNL} 
              onEdit={openEditDialog}
              onDelete={(plan) => { setSelectedPlan(plan); setIsDeleteDialogOpen(true); }}
              onToggleActive={handleToggleActive}
              onSetPopular={handleSetPopular}
              formatCurrency={formatCurrency}
            />
          </TabsContent>
          
          <TabsContent value="yearly" className="mt-4">
            <PlanTable 
              plans={yearlyPlans} 
              isNL={isNL} 
              onEdit={openEditDialog}
              onDelete={(plan) => { setSelectedPlan(plan); setIsDeleteDialogOpen(true); }}
              onToggleActive={handleToggleActive}
              onSetPopular={handleSetPopular}
              formatCurrency={formatCurrency}
            />
          </TabsContent>
        </Tabs>
      )}

      {/* Create Plan Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isNL ? 'Nieuw Abonnement' : 'New Plan'}</DialogTitle>
            <DialogDescription>
              {isNL ? 'Maak een nieuw abonnement aan' : 'Create a new subscription plan'}
            </DialogDescription>
          </DialogHeader>
          <PlanForm formData={formData} setFormData={setFormData} isNL={isNL} />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {isNL ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name || !formData.price}>
              {isNL ? 'Aanmaken' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Plan Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{isNL ? 'Abonnement Bewerken' : 'Edit Plan'}</DialogTitle>
          </DialogHeader>
          <PlanForm formData={formData} setFormData={setFormData} isNL={isNL} isEdit />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {isNL ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button onClick={handleUpdate}>
              {isNL ? 'Opslaan' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNL ? 'Abonnement Verwijderen' : 'Delete Plan'}</DialogTitle>
            <DialogDescription>
              {isNL 
                ? `Weet je zeker dat je "${selectedPlan?.name}" wilt verwijderen?`
                : `Are you sure you want to delete "${selectedPlan?.name}"?`
              }
              {selectedPlan && selectedPlan.subscriber_count > 0 && (
                <span className="block mt-2 text-red-500">
                  {isNL 
                    ? `Let op: Er zijn nog ${selectedPlan.subscriber_count} actieve abonnees!`
                    : `Warning: There are still ${selectedPlan.subscriber_count} active subscribers!`
                  }
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {isNL ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              {isNL ? 'Verwijderen' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ============================================================
// PLAN TABLE COMPONENT
// ============================================================

interface PlanTableProps {
  plans: Plan[];
  isNL: boolean;
  onEdit: (plan: Plan) => void;
  onDelete: (plan: Plan) => void;
  onToggleActive: (plan: Plan) => void;
  onSetPopular: (plan: Plan) => void;
  formatCurrency: (amount: number) => string;
}

function PlanTable({ plans, isNL, onEdit, onDelete, onToggleActive, onSetPopular, formatCurrency }: PlanTableProps) {
  if (plans.length === 0) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          {isNL ? 'Geen abonnementen gevonden' : 'No plans found'}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="pt-6">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{isNL ? 'Abonnement' : 'Plan'}</TableHead>
              <TableHead>{isNL ? 'Prijs' : 'Price'}</TableHead>
              <TableHead>{isNL ? 'Limieten' : 'Limits'}</TableHead>
              <TableHead>{isNL ? 'Abonnees' : 'Subscribers'}</TableHead>
              <TableHead>MRR</TableHead>
              <TableHead>{pt("Status")}</TableHead>
              <TableHead className="text-right">{isNL ? 'Acties' : 'Actions'}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {plans.map((plan) => (
              <TableRow key={plan.id}>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div>
                      <p className="font-medium">{plan.name}</p>
                      <p className="text-xs text-muted-foreground capitalize">
                        {plan.plan_level} • {plan.plan_type}
                      </p>
                    </div>
                    {plan.is_popular && (
                      <Badge className="bg-yellow-100 text-yellow-700">
                        <Star className="h-3 w-3 mr-1" />
                        Popular
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{formatCurrency(plan.price)}</span>
                  <span className="text-muted-foreground">/{plan.plan_type === 'monthly' ? 'mo' : 'yr'}</span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 text-xs">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {plan.max_users || '∞'} users
                    </span>
                    <span className="flex items-center gap-1">
                      <FolderKanban className="h-3 w-3" />
                      {plan.max_projects || '∞'} projects
                    </span>
                    <span className="flex items-center gap-1">
                      <HardDrive className="h-3 w-3" />
                      {plan.storage_limit_gb || '∞'} GB
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">{plan.subscriber_count}</span>
                </TableCell>
                <TableCell>
                  <span className="font-medium text-green-600">
                    {formatCurrency(plan.monthly_revenue)}
                  </span>
                </TableCell>
                <TableCell>
                  <Badge variant={plan.is_active ? 'default' : 'secondary'}>
                    {plan.is_active ? (isNL ? 'Actief' : 'Active') : (isNL ? 'Inactief' : 'Inactive')}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-1">
                    <Button variant="ghost" size="icon" onClick={() => onEdit(plan)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onSetPopular(plan)}>
                      <Star className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onToggleActive(plan)}>
                      {plan.is_active ? <X className="h-4 w-4" /> : <Check className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => onDelete(plan)} className="text-red-500">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}

// ============================================================
// PLAN FORM COMPONENT
// ============================================================

interface PlanFormProps {
  formData: any;
  setFormData: (data: any) => void;
  isNL: boolean;
  isEdit?: boolean;
}

function PlanForm({ formData, setFormData, isNL, isEdit }: PlanFormProps) {
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isNL ? 'Naam' : 'Name'}</Label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="Professional"
          />
        </div>
        <div className="space-y-2">
          <Label>{isNL ? 'Prijs (EUR)' : 'Price (EUR)'}</Label>
          <Input
            type="text"
            inputMode="decimal"
            value={formData.price}
            onChange={(e) => setFormData({ ...formData, price: e.target.value })}
            placeholder="49.00"
          />
          <p className="text-xs text-muted-foreground">
            {isNL ? 'Gebruik punt of komma als decimaal' : 'Use dot or comma as decimal'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>{isNL ? 'Type' : 'Type'}</Label>
          <Select 
            value={formData.plan_type} 
            onValueChange={(v) => setFormData({ ...formData, plan_type: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">{isNL ? 'Maandelijks' : 'Monthly'}</SelectItem>
              <SelectItem value="yearly">{isNL ? 'Jaarlijks' : 'Yearly'}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>{isNL ? 'Niveau' : 'Level'}</Label>
          <Select 
            value={formData.plan_level} 
            onValueChange={(v) => setFormData({ ...formData, plan_level: v })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="basic">Basic</SelectItem>
              <SelectItem value="starter">Starter</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="premium">Premium</SelectItem>
              <SelectItem value="enterprise">Enterprise</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {!isEdit && (
        <div className="space-y-2">
          <Label>Stripe Price ID <span className="text-red-500">*</span></Label>
          <Input
            value={formData.stripe_price_id}
            onChange={(e) => setFormData({ ...formData, stripe_price_id: e.target.value })}
            placeholder="price_1ABC123..."
          />
          <p className="text-xs text-muted-foreground">
            {isNL 
              ? 'Haal dit ID op uit je Stripe Dashboard → Products → Prices' 
              : 'Get this ID from your Stripe Dashboard → Products → Prices'
            }
          </p>
        </div>
      )}

      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>{isNL ? 'Max Gebruikers' : 'Max Users'}</Label>
          <Input
            type="number"
            value={formData.max_users}
            onChange={(e) => setFormData({ ...formData, max_users: e.target.value })}
            placeholder={isNL ? 'Onbeperkt' : 'Unlimited'}
          />
        </div>
        <div className="space-y-2">
          <Label>{isNL ? 'Max Projecten' : 'Max Projects'}</Label>
          <Input
            type="number"
            value={formData.max_projects}
            onChange={(e) => setFormData({ ...formData, max_projects: e.target.value })}
            placeholder={isNL ? 'Onbeperkt' : 'Unlimited'}
          />
        </div>
        <div className="space-y-2">
          <Label>{isNL ? 'Opslag (GB)' : 'Storage (GB)'}</Label>
          <Input
            type="text"
            inputMode="decimal"
            value={formData.storage_limit_gb}
            onChange={(e) => setFormData({ ...formData, storage_limit_gb: e.target.value })}
            placeholder={isNL ? 'Onbeperkt' : 'Unlimited'}
          />
        </div>
      </div>

      <div className="space-y-4 pt-4">
        <Label className="text-base font-semibold">{isNL ? 'Features' : 'Features'}</Label>
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center justify-between">
            <Label>{isNL ? 'Actief' : 'Active'}</Label>
            <Switch
              checked={formData.is_active}
              onCheckedChange={(v) => setFormData({ ...formData, is_active: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>{isNL ? 'Populair' : 'Popular'}</Label>
            <Switch
              checked={formData.is_popular}
              onCheckedChange={(v) => setFormData({ ...formData, is_popular: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>{isNL ? 'Priority Support' : 'Priority Support'}</Label>
            <Switch
              checked={formData.priority_support}
              onCheckedChange={(v) => setFormData({ ...formData, priority_support: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>{isNL ? 'Geavanceerde Analytics' : 'Advanced Analytics'}</Label>
            <Switch
              checked={formData.advanced_analytics}
              onCheckedChange={(v) => setFormData({ ...formData, advanced_analytics: v })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label>{isNL ? 'Custom Integraties' : 'Custom Integrations'}</Label>
            <Switch
              checked={formData.custom_integrations}
              onCheckedChange={(v) => setFormData({ ...formData, custom_integrations: v })}
            />
          </div>
        </div>
      </div>
    </div>
  );
}