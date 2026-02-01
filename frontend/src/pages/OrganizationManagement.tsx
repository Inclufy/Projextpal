import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  Users,
  CreditCard,
  RefreshCw,
  AlertCircle,
  ExternalLink,
  FileText,
} from 'lucide-react';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface Organization {
  id: number;
  name: string;
  description: string | null;
  is_subscribed: boolean;
  user_count: number;
  subscription_status: string;
  plan_name: string | null;
  billing_cycle?: string;
  payment_method?: string;
  owner: {
    id: number;
    email: string;
    full_name: string;
  } | null;
  created_at: string;
  updated_at: string;
}

interface Plan {
  id: number;
  name: string;
  price: string;
}

export default function OrganizationManagement() {
  const { language } = useLanguage();
  const isNL = language === 'nl';

  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [plans, setPlans] = useState<Plan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState<Organization | null>(null);
  
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    owner_email: '',
    subscription_plan_id: 'none',
    subscription_status: 'none',
    billing_cycle: 'monthly',
    payment_method: 'stripe',
  });

  const fetchOrganizations = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = searchQuery ? { search: searchQuery } : {};
      const data = await api.get<any>('/admin/tenants/', params);
      setOrganizations(data.results || data);
    } catch (err: any) {
      console.error('Error fetching organizations:', err);
      setError(isNL ? 'Kon organisaties niet laden' : 'Failed to load organizations');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const data = await api.get<any>('/admin/plans/');
      setPlans(data.results || data);
    } catch (err) {
      console.error('Error fetching plans:', err);
    }
  };

  useEffect(() => {
    fetchOrganizations();
    fetchPlans();
  }, []);

  useEffect(() => {
    const debounce = setTimeout(() => {
      fetchOrganizations();
    }, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleCreate = async () => {
    if (isCreating) return;
    setIsCreating(true);
    
    try {
      await api.post('/admin/tenants/', {
        name: formData.name,
        description: formData.description || null,
        owner_email: formData.owner_email || null,
        subscription_plan_id: formData.subscription_plan_id && formData.subscription_plan_id !== 'none' 
          ? formData.subscription_plan_id 
          : null,
        subscription_status: formData.subscription_status !== 'none' ? formData.subscription_status : null,
        billing_cycle: formData.billing_cycle,
        payment_method: formData.payment_method,
      });

      toast.success(isNL ? 'Organisatie aangemaakt' : 'Organization created');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchOrganizations();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsCreating(false);
    }
  };

  const handleUpdate = async () => {
    if (!selectedOrg || isUpdating) return;
    setIsUpdating(true);

    try {
      await api.patch(`/admin/tenants/${selectedOrg.id}/`, {
        name: formData.name,
        description: formData.description || null,
        subscription_plan_id: formData.subscription_plan_id && formData.subscription_plan_id !== 'none' 
          ? formData.subscription_plan_id 
          : null,
        subscription_status: formData.subscription_status !== 'none' ? formData.subscription_status : null,
        billing_cycle: formData.billing_cycle,
        payment_method: formData.payment_method,
      });

      toast.success(isNL ? 'Organisatie bijgewerkt' : 'Organization updated');
      setIsEditDialogOpen(false);
      resetForm();
      fetchOrganizations();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (!selectedOrg || isDeleting) return;
    setIsDeleting(true);

    try {
      await api.delete(`/admin/tenants/${selectedOrg.id}/`);
      toast.success(isNL ? 'Organisatie verwijderd' : 'Organization deleted');
      setIsDeleteDialogOpen(false);
      setSelectedOrg(null);
      fetchOrganizations();
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  const resetForm = () => {
    setFormData({ 
      name: '', 
      description: '', 
      owner_email: '',
      subscription_plan_id: 'none',
      subscription_status: 'none',
      billing_cycle: 'monthly',
      payment_method: 'stripe',
    });
    setSelectedOrg(null);
  };

  const openEditDialog = (org: Organization) => {
    setSelectedOrg(org);
    
    let currentPlanId = 'none';
    if (org.plan_name) {
      const currentPlan = plans.find(p => p.name === org.plan_name);
      if (currentPlan) {
        currentPlanId = currentPlan.id.toString();
      }
    }
    
    setFormData({
      name: org.name,
      description: org.description || '',
      owner_email: '',
      subscription_plan_id: currentPlanId,
      subscription_status: org.subscription_status || 'none',
      billing_cycle: org.billing_cycle || 'monthly',
      payment_method: org.payment_method || 'stripe',
    });
    setIsEditDialogOpen(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { color: string; label: string }> = {
      active: { color: 'bg-green-100 text-green-700', label: isNL ? 'Actief' : 'Active' },
      trialing: { color: 'bg-blue-100 text-blue-700', label: 'Trial' },
      past_due: { color: 'bg-yellow-100 text-yellow-700', label: isNL ? 'Achterstallig' : 'Past Due' },
      canceled: { color: 'bg-red-100 text-red-700', label: isNL ? 'Geannuleerd' : 'Canceled' },
      none: { color: 'bg-gray-100 text-gray-700', label: isNL ? 'Geen' : 'None' },
    };
    
    const config = statusMap[status] || statusMap.none;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getBillingCycleLabel = (cycle: string) => {
    const labels: Record<string, string> = {
      monthly: isNL ? 'Maandelijks' : 'Monthly',
      quarterly: isNL ? 'Kwartaal' : 'Quarterly',
      yearly: isNL ? 'Jaarlijks' : 'Yearly',
    };
    return labels[cycle] || cycle;
  };

  const getPaymentMethodIcon = (method: string) => {
    return method === 'invoice' ? <FileText className="h-4 w-4" /> : <CreditCard className="h-4 w-4" />;
  };

  const stats = {
    total: organizations.length,
    active: organizations.filter(o => o.subscription_status === 'active').length,
    trial: organizations.filter(o => o.subscription_status === 'trialing').length,
    totalUsers: organizations.reduce((sum, o) => sum + o.user_count, 0),
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNL ? 'Organisaties' : 'Organizations'}
          </h1>
          <p className="text-muted-foreground">
            {isNL ? 'Beheer alle organisaties op het platform' : 'Manage all organizations on the platform'}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {isNL ? 'Nieuwe Organisatie' : 'New Organization'}
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isNL ? 'Totaal Organisaties' : 'Total Organizations'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isNL ? 'Actieve Abonnementen' : 'Active Subscriptions'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.active}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isNL ? 'Trial Accounts' : 'Trial Accounts'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats.trial}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isNL ? 'Totaal Gebruikers' : 'Total Users'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={isNL ? 'Zoek organisaties...' : 'Search organizations...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Button variant="outline" onClick={fetchOrganizations}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="flex items-center justify-center p-8 text-red-500">
          <AlertCircle className="mr-2 h-5 w-5" />
          {error}
        </div>
      )}

      {isLoading && (
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && !error && (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isNL ? 'Organisatie' : 'Organization'}</TableHead>
                  <TableHead>{isNL ? 'Eigenaar' : 'Owner'}</TableHead>
                  <TableHead>{isNL ? 'Gebruikers' : 'Users'}</TableHead>
                  <TableHead>{isNL ? 'Abonnement' : 'Subscription'}</TableHead>
                  <TableHead>{isNL ? 'Cyclus' : 'Cycle'}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>{isNL ? 'Aangemaakt' : 'Created'}</TableHead>
                  <TableHead className="text-right">{isNL ? 'Acties' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {organizations.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                      {isNL ? 'Geen organisaties gevonden' : 'No organizations found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  organizations.map((org) => (
                    <TableRow key={org.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100 text-purple-700 font-bold">
                            {org.name[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium capitalize">{org.name}</p>
                            {org.description && (
                              <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                {org.description}
                              </p>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        {org.owner ? (
                          <div>
                            <p className="text-sm">{org.owner.full_name}</p>
                            <p className="text-xs text-muted-foreground">{org.owner.email}</p>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          {org.user_count}
                        </div>
                      </TableCell>
                      <TableCell>
                        {org.plan_name ? (
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(org.payment_method || 'stripe')}
                            <span className="text-sm">{org.plan_name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {org.billing_cycle ? (
                          <span className="text-sm text-muted-foreground">
                            {getBillingCycleLabel(org.billing_cycle)}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell>{getStatusBadge(org.subscription_status)}</TableCell>
                      <TableCell>{formatDate(org.created_at)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(org)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {isNL ? 'Bewerken' : 'Edit'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Users className="mr-2 h-4 w-4" />
                              {isNL ? 'Gebruikers Bekijken' : 'View Users'}
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <ExternalLink className="mr-2 h-4 w-4" />
                              {isNL ? 'Details' : 'Details'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedOrg(org);
                                setIsDeleteDialogOpen(true);
                              }}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              {isNL ? 'Verwijderen' : 'Delete'}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}

      {/* Create Organization Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNL ? 'Nieuwe Organisatie' : 'New Organization'}</DialogTitle>
            <DialogDescription>
              {isNL ? 'Maak een nieuwe organisatie aan' : 'Create a new organization'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{isNL ? 'Naam' : 'Name'} *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Acme Corp"
                disabled={isCreating}
              />
            </div>
            <div className="space-y-2">
              <Label>{isNL ? 'Beschrijving' : 'Description'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder={isNL ? 'Optionele beschrijving...' : 'Optional description...'}
                disabled={isCreating}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3">{isNL ? 'Abonnement Details' : 'Subscription Details'}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isNL ? 'Abonnement' : 'Plan'}</Label>
                  <Select 
                    value={formData.subscription_plan_id} 
                    onValueChange={(v) => setFormData({ ...formData, subscription_plan_id: v })}
                    disabled={isCreating}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={isNL ? 'Selecteer...' : 'Select...'} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{isNL ? 'Geen abonnement' : 'No subscription'}</SelectItem>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name} - €{plan.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isNL ? 'Status' : 'Status'}</Label>
                  <Select 
                    value={formData.subscription_status} 
                    onValueChange={(v) => setFormData({ ...formData, subscription_status: v })}
                    disabled={isCreating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{isNL ? 'Geen status' : 'No status'}</SelectItem>
                      <SelectItem value="active">{isNL ? 'Actief' : 'Active'}</SelectItem>
                      <SelectItem value="trialing">Trial</SelectItem>
                      <SelectItem value="past_due">{isNL ? 'Achterstallig' : 'Past Due'}</SelectItem>
                      <SelectItem value="canceled">{isNL ? 'Geannuleerd' : 'Canceled'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isNL ? 'Facturatiecyclus' : 'Billing Cycle'}</Label>
                  <Select 
                    value={formData.billing_cycle} 
                    onValueChange={(v) => setFormData({ ...formData, billing_cycle: v })}
                    disabled={isCreating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">{isNL ? 'Maandelijks' : 'Monthly'}</SelectItem>
                      <SelectItem value="quarterly">{isNL ? 'Kwartaal' : 'Quarterly'}</SelectItem>
                      <SelectItem value="yearly">{isNL ? 'Jaarlijks' : 'Yearly'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isNL ? 'Betaalmethode' : 'Payment Method'}</Label>
                  <Select 
                    value={formData.payment_method} 
                    onValueChange={(v) => setFormData({ ...formData, payment_method: v })}
                    disabled={isCreating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">
                        <span className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Stripe
                        </span>
                      </SelectItem>
                      <SelectItem value="invoice">
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {isNL ? 'Factuur' : 'Invoice'}
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label>{isNL ? 'Eigenaar Email' : 'Owner Email'}</Label>
              <Input
                type="email"
                value={formData.owner_email}
                onChange={(e) => setFormData({ ...formData, owner_email: e.target.value })}
                placeholder="owner@company.com"
                disabled={isCreating}
              />
              <p className="text-xs text-muted-foreground">
                {isNL ? 'Optioneel - Er wordt een admin account aangemaakt' : 'Optional - An admin account will be created'}
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)} disabled={isCreating}>
              {isNL ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button onClick={handleCreate} disabled={!formData.name || isCreating}>
              {isCreating ? (isNL ? 'Bezig...' : 'Creating...') : (isNL ? 'Aanmaken' : 'Create')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Organization Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{isNL ? 'Organisatie Bewerken' : 'Edit Organization'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>{isNL ? 'Naam' : 'Name'} *</Label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                disabled={isUpdating}
              />
            </div>
            <div className="space-y-2">
              <Label>{isNL ? 'Beschrijving' : 'Description'}</Label>
              <Textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                disabled={isUpdating}
              />
            </div>

            <div className="border-t pt-4">
              <h3 className="text-sm font-medium mb-3">{isNL ? 'Abonnement Details' : 'Subscription Details'}</h3>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>{isNL ? 'Abonnement' : 'Plan'}</Label>
                  <Select 
                    value={formData.subscription_plan_id} 
                    onValueChange={(v) => setFormData({ ...formData, subscription_plan_id: v })}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{isNL ? 'Geen abonnement' : 'No subscription'}</SelectItem>
                      {plans.map((plan) => (
                        <SelectItem key={plan.id} value={plan.id.toString()}>
                          {plan.name} - €{plan.price}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isNL ? 'Status' : 'Status'}</Label>
                  <Select 
                    value={formData.subscription_status} 
                    onValueChange={(v) => setFormData({ ...formData, subscription_status: v })}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">{isNL ? 'Geen status' : 'No status'}</SelectItem>
                      <SelectItem value="active">{isNL ? 'Actief' : 'Active'}</SelectItem>
                      <SelectItem value="trialing">Trial</SelectItem>
                      <SelectItem value="past_due">{isNL ? 'Achterstallig' : 'Past Due'}</SelectItem>
                      <SelectItem value="canceled">{isNL ? 'Geannuleerd' : 'Canceled'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isNL ? 'Facturatiecyclus' : 'Billing Cycle'}</Label>
                  <Select 
                    value={formData.billing_cycle} 
                    onValueChange={(v) => setFormData({ ...formData, billing_cycle: v })}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="monthly">{isNL ? 'Maandelijks' : 'Monthly'}</SelectItem>
                      <SelectItem value="quarterly">{isNL ? 'Kwartaal' : 'Quarterly'}</SelectItem>
                      <SelectItem value="yearly">{isNL ? 'Jaarlijks' : 'Yearly'}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>{isNL ? 'Betaalmethode' : 'Payment Method'}</Label>
                  <Select 
                    value={formData.payment_method} 
                    onValueChange={(v) => setFormData({ ...formData, payment_method: v })}
                    disabled={isUpdating}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">
                        <span className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4" />
                          Stripe
                        </span>
                      </SelectItem>
                      <SelectItem value="invoice">
                        <span className="flex items-center gap-2">
                          <FileText className="h-4 w-4" />
                          {isNL ? 'Factuur' : 'Invoice'}
                        </span>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)} disabled={isUpdating}>
              {isNL ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button onClick={handleUpdate} disabled={isUpdating}>
              {isUpdating ? (isNL ? 'Bezig...' : 'Saving...') : (isNL ? 'Opslaan' : 'Save')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNL ? 'Organisatie Verwijderen' : 'Delete Organization'}</DialogTitle>
            <DialogDescription>
              {isNL 
                ? `Weet je zeker dat je "${selectedOrg?.name}" wilt verwijderen? Alle gebruikers en data worden ook verwijderd.`
                : `Are you sure you want to delete "${selectedOrg?.name}"? All users and data will also be deleted.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isDeleting}>
              {isNL ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? (isNL ? 'Bezig...' : 'Deleting...') : (isNL ? 'Verwijderen' : 'Delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
