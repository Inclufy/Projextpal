// ============================================================
// USER MANAGEMENT - PRODUCTION VERSION
// Uses real API data from /api/v1/admin/users/
// ============================================================

import { useState, useEffect } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import {
  Users,
  Search,
  Plus,
  MoreHorizontal,
  Edit,
  Trash2,
  UserX,
  UserCheck,
  Mail,
  RefreshCw,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { toast } from 'sonner';

// ============================================================
// TYPES
// ============================================================

interface User {
  id: number;
  email: string;
  username: string;
  first_name: string;
  last_name: string;
  full_name: string;
  role: string;
  company: number | null;
  company_name: string | null;
  is_active: boolean;
  is_superadmin: boolean;
  date_joined: string;
  last_login: string | null;
}

interface Company {
  id: number;
  name: string;
}

// ============================================================
// API CONFIG
// ============================================================

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// ============================================================
// COMPONENT
// ============================================================

export default function UserManagement() {
  const { language } = useLanguage();
  const isNL = language === 'nl';

  // State
  const [users, setUsers] = useState<User[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;
  
  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  
  // Dialogs
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  
  // Form state
  const [formData, setFormData] = useState({
  email: '',
  first_name: '',
  last_name: '',
  role: 'pm',  // Changed from 'user' to 'pm'
  company: '',
  password: 'TempPass123!',  // ADD THIS - temporary password
});

  // ============================================================
  // FETCH DATA
  // ============================================================

  const fetchUsers = async () => {
    setIsLoading(true);
    setError(null);

    try {
      let url = `${API_BASE_URL}/admin/users/?page=${page}&page_size=${pageSize}`;
      
      if (searchQuery) {
        url += `&search=${encodeURIComponent(searchQuery)}`;
      }
      if (statusFilter !== 'all') {
        url += `&is_active=${statusFilter === 'active'}`;
      }
      if (roleFilter !== 'all') {
        url += `&role=${roleFilter}`;
      }

      const response = await fetch(url, {
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const data = await response.json();
      setUsers(data.results || data);
      setTotalCount(data.count || data.length);
    } catch (err) {
      console.error('Error fetching users:', err);
      setError(isNL ? 'Kon gebruikers niet laden' : 'Failed to load users');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchCompanies = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/tenants/`, {
        headers: getAuthHeaders(),
      });

      if (response.ok) {
        const data = await response.json();
        setCompanies(data.results || data);
      }
    } catch (err) {
      console.error('Error fetching companies:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
    fetchCompanies();
  }, [page, statusFilter, roleFilter]);

  useEffect(() => {
    const debounce = setTimeout(() => {
      if (page === 1) {
        fetchUsers();
      } else {
        setPage(1);
      }
    }, 300);

    return () => clearTimeout(debounce);
  }, [searchQuery]);

  /// ============================================================
  // ACTIONS
  // ============================================================

  const handleCreateUser = async () => {
    try {
      // Validate password
      if (!formData.password || formData.password.length < 8) {
        toast.error(isNL ? 'Wachtwoord moet minimaal 8 tekens bevatten' : 'Password must be at least 8 characters');
        return;
      }

      const response = await fetch(`${API_BASE_URL}/admin/users/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          role: formData.role === 'contributor' ? 'contibuter' : formData.role,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || 'Failed to create user');
      }

      toast.success(isNL ? 'Gebruiker aangemaakt' : 'User created');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleUpdateUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          first_name: formData.first_name,
          last_name: formData.last_name,
          role: formData.role,
          company: formData.company ? parseInt(formData.company) : null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      toast.success(isNL ? 'Gebruiker bijgewerkt' : 'User updated');
      setIsEditDialogOpen(false);
      resetForm();
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${selectedUser.id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to delete user');
      }

      toast.success(isNL ? 'Gebruiker verwijderd' : 'User deleted');
      setIsDeleteDialogOpen(false);
      setSelectedUser(null);
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleToggleStatus = async (user: User) => {
    try {
      const action = user.is_active ? 'suspend' : 'activate';
      const response = await fetch(`${API_BASE_URL}/admin/users/${user.id}/${action}/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${action} user`);
      }

      toast.success(
        user.is_active 
          ? (isNL ? 'Gebruiker geschorst' : 'User suspended')
          : (isNL ? 'Gebruiker geactiveerd' : 'User activated')
      );
      fetchUsers();
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const handleResendInvite = async (user: User) => {
    try {
      const response = await fetch(`${API_BASE_URL}/admin/users/${user.id}/resend_invite/`, {
        method: 'POST',
        headers: getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error('Failed to resend invite');
      }

      toast.success(isNL ? 'Uitnodiging verstuurd' : 'Invite sent');
    } catch (err: any) {
      toast.error(err.message);
    }
  };

  const resetForm = () => {
  setFormData({
    email: '',
    first_name: '',
    last_name: '',
    role: 'pm',
    company: '',
    password: '',  // ADD THIS
  });
  setSelectedUser(null);
};

  const openEditDialog = (user: User) => {
    setSelectedUser(user);
    setFormData({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      role: user.role,
      company: user.company?.toString() || '',
      password: '', 
    });
    setIsEditDialogOpen(true);
  };

  // ============================================================
  // HELPERS
  // ============================================================

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getRoleBadge = (role: string) => {
    const roleColors: Record<string, string> = {
      superadmin: 'bg-purple-100 text-purple-700',
      admin: 'bg-blue-100 text-blue-700',
      pm: 'bg-green-100 text-green-700',
      user: 'bg-gray-100 text-gray-700',
    };
    
    return (
      <Badge className={roleColors[role] || roleColors.user}>
        {role}
      </Badge>
    );
  };

  const totalPages = Math.ceil(totalCount / pageSize);

  // ============================================================
  // RENDER
  // ============================================================

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isNL ? 'Gebruikersbeheer' : 'User Management'}
          </h1>
          <p className="text-muted-foreground">
            {isNL ? 'Beheer alle gebruikers van het platform' : 'Manage all platform users'}
          </p>
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {isNL ? 'Nieuwe Gebruiker' : 'New User'}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isNL ? 'Totaal Gebruikers' : 'Total Users'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCount}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isNL ? 'Actieve Gebruikers' : 'Active Users'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {users.filter(u => u.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isNL ? 'Inactieve Gebruikers' : 'Inactive Users'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">
              {users.filter(u => !u.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">
              {isNL ? 'Admins' : 'Admins'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {users.filter(u => u.role === 'superadmin' || u.role === 'admin').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={isNL ? 'Zoek op naam of email...' : 'Search by name or email...'}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isNL ? 'Alle Status' : 'All Status'}</SelectItem>
                <SelectItem value="active">{isNL ? 'Actief' : 'Active'}</SelectItem>
                <SelectItem value="inactive">{isNL ? 'Inactief' : 'Inactive'}</SelectItem>
              </SelectContent>
            </Select>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{isNL ? 'Alle Rollen' : 'All Roles'}</SelectItem>
                <SelectItem value="superadmin">Super Admin</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="pm">Project Manager</SelectItem>
                <SelectItem value="user">User</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={fetchUsers}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

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
              {[1, 2, 3, 4, 5].map((i) => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Users Table */}
      {!isLoading && !error && (
        <Card>
          <CardContent className="pt-6">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{isNL ? 'Gebruiker' : 'User'}</TableHead>
                  <TableHead>{isNL ? 'Organisatie' : 'Organization'}</TableHead>
                  <TableHead>{isNL ? 'Rol' : 'Role'}</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>{isNL ? 'Laatst Actief' : 'Last Active'}</TableHead>
                  <TableHead className="text-right">{isNL ? 'Acties' : 'Actions'}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      {isNL ? 'Geen gebruikers gevonden' : 'No users found'}
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-purple-100 text-purple-700 font-medium">
                            {user.email[0].toUpperCase()}
                          </div>
                          <div>
                            <p className="font-medium">{user.full_name || user.email}</p>
                            <p className="text-sm text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{user.company_name || '-'}</TableCell>
                      <TableCell>{getRoleBadge(user.role)}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_active ? 'default' : 'secondary'}>
                          {user.is_active ? (isNL ? 'Actief' : 'Active') : (isNL ? 'Inactief' : 'Inactive')}
                        </Badge>
                      </TableCell>
                      <TableCell>{formatDate(user.last_login)}</TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              {isNL ? 'Bewerken' : 'Edit'}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleToggleStatus(user)}>
                              {user.is_active ? (
                                <>
                                  <UserX className="mr-2 h-4 w-4" />
                                  {isNL ? 'Schorsen' : 'Suspend'}
                                </>
                              ) : (
                                <>
                                  <UserCheck className="mr-2 h-4 w-4" />
                                  {isNL ? 'Activeren' : 'Activate'}
                                </>
                              )}
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleResendInvite(user)}>
                              <Mail className="mr-2 h-4 w-4" />
                              {isNL ? 'Uitnodiging Versturen' : 'Resend Invite'}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => {
                                setSelectedUser(user);
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

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between mt-4">
                <p className="text-sm text-muted-foreground">
                  {isNL ? `Pagina ${page} van ${totalPages}` : `Page ${page} of ${totalPages}`}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    disabled={page === 1}
                  >
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                    disabled={page === totalPages}
                  >
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Create User Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNL ? 'Nieuwe Gebruiker' : 'New User'}</DialogTitle>
            <DialogDescription>
              {isNL ? 'Voeg een nieuwe gebruiker toe aan het platform' : 'Add a new user to the platform'}
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="user@company.com"
              />
            </div>
            {/* ADD THIS */}
<div className="space-y-2">
  <Label>{isNL ? 'Wachtwoord' : 'Password'}</Label>
  <Input
    type="password"
    value={formData.password}
    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
    placeholder={isNL ? 'Min. 8 tekens' : 'Min. 8 characters'}
  />
  <p className="text-xs text-muted-foreground">
    {isNL ? 'Gebruiker kan dit later wijzigen' : 'User can change this later'}
  </p>
</div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isNL ? 'Voornaam' : 'First Name'}</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{isNL ? 'Achternaam' : 'Last Name'}</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isNL ? 'Rol' : 'Role'}</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
  <SelectItem value="pm">Project Manager</SelectItem>
  <SelectItem value="contributor">Contributor</SelectItem>
  <SelectItem value="reviewer">Reviewer</SelectItem>
  <SelectItem value="admin">Admin</SelectItem>
  <SelectItem value="guest">Guest</SelectItem>
</SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{isNL ? 'Organisatie' : 'Organization'}</Label>
              <Select value={formData.company} onValueChange={(v) => setFormData({ ...formData, company: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={isNL ? 'Selecteer organisatie' : 'Select organization'} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              {isNL ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button onClick={handleCreateUser}>
              {isNL ? 'Aanmaken' : 'Create'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit User Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNL ? 'Gebruiker Bewerken' : 'Edit User'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={formData.email} disabled className="bg-muted" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>{isNL ? 'Voornaam' : 'First Name'}</Label>
                <Input
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>{isNL ? 'Achternaam' : 'Last Name'}</Label>
                <Input
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>{isNL ? 'Rol' : 'Role'}</Label>
              <Select value={formData.role} onValueChange={(v) => setFormData({ ...formData, role: v })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
  <SelectItem value="pm">Project Manager</SelectItem>
  <SelectItem value="contributor">Contributor</SelectItem>
  <SelectItem value="reviewer">Reviewer</SelectItem>
  <SelectItem value="admin">Admin</SelectItem>
  <SelectItem value="guest">Guest</SelectItem>
</SelectContent>  
              </Select>
            </div>
            <div className="space-y-2">
              <Label>{isNL ? 'Organisatie' : 'Organization'}</Label>
              <Select value={formData.company} onValueChange={(v) => setFormData({ ...formData, company: v })}>
                <SelectTrigger>
                  <SelectValue placeholder={isNL ? 'Selecteer organisatie' : 'Select organization'} />
                </SelectTrigger>
                <SelectContent>
                  {companies.map((company) => (
                    <SelectItem key={company.id} value={company.id.toString()}>
                      {company.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              {isNL ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button onClick={handleUpdateUser}>
              {isNL ? 'Opslaan' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isNL ? 'Gebruiker Verwijderen' : 'Delete User'}</DialogTitle>
            <DialogDescription>
              {isNL 
                ? `Weet je zeker dat je ${selectedUser?.email} wilt verwijderen? Deze actie kan niet ongedaan worden gemaakt.`
                : `Are you sure you want to delete ${selectedUser?.email}? This action cannot be undone.`
              }
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              {isNL ? 'Annuleren' : 'Cancel'}
            </Button>
            <Button variant="destructive" onClick={handleDeleteUser}>
              {isNL ? 'Verwijderen' : 'Delete'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}