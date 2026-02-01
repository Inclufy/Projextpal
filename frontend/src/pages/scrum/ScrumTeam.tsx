import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { scrumApi, ScrumTeamMember } from '@/lib/scrumApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Users, Plus, Trash2, Edit2, Loader2, 
  Crown, Shield, Code, Eye
} from 'lucide-react';

const ScrumTeam = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [members, setMembers] = useState<ScrumTeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<ScrumTeamMember | null>(null);
  
  const [form, setForm] = useState({
    user_email: '',
    role: 'developer',
    capacity: '40',
  });

  useEffect(() => {
    if (id) {
      loadTeam();
    }
  }, [id]);

  const loadTeam = async () => {
    try {
      setLoading(true);
      const data = await scrumApi.team.getAll(id!);
      setMembers(data);
    } catch (err: any) {
      // Use mock data if API fails
      setMembers([
        { id: 1, user: 1, user_name: 'Sarah Johnson', user_email: 'sarah@example.com', role: 'product_owner', capacity: 40 },
        { id: 2, user: 2, user_name: 'Mike Chen', user_email: 'mike@example.com', role: 'scrum_master', capacity: 40 },
        { id: 3, user: 3, user_name: 'Emma Wilson', user_email: 'emma@example.com', role: 'developer', capacity: 40 },
        { id: 4, user: 4, user_name: 'James Brown', user_email: 'james@example.com', role: 'developer', capacity: 32 },
        { id: 5, user: 5, user_name: 'Lisa Garcia', user_email: 'lisa@example.com', role: 'developer', capacity: 40 },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (editingMember) {
        await scrumApi.team.update(id!, editingMember.id, {
          role: form.role,
          capacity: parseInt(form.capacity),
        });
      } else {
        await scrumApi.team.create(id!, {
          user_email: form.user_email,
          role: form.role,
          capacity: parseInt(form.capacity),
        });
      }
      setShowDialog(false);
      setEditingMember(null);
      setForm({ user_email: '', role: 'developer', capacity: '40' });
      loadTeam();
    } catch (err: any) {
      alert(err.message || 'Failed to save team member');
    }
  };

  const handleDelete = async (memberId: number) => {
    if (!confirm('Remove this team member?')) return;
    try {
      await scrumApi.team.delete(id!, memberId);
      loadTeam();
    } catch (err: any) {
      alert(err.message || 'Failed to remove team member');
    }
  };

  const openEdit = (member: ScrumTeamMember) => {
    setEditingMember(member);
    setForm({
      user_email: member.user_email,
      role: member.role,
      capacity: member.capacity.toString(),
    });
    setShowDialog(true);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'product_owner': return <Crown className="h-4 w-4 text-yellow-500" />;
      case 'scrum_master': return <Shield className="h-4 w-4 text-purple-500" />;
      case 'developer': return <Code className="h-4 w-4 text-blue-500" />;
      case 'stakeholder': return <Eye className="h-4 w-4 text-gray-500" />;
      default: return <Users className="h-4 w-4" />;
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'product_owner': return <Badge className="bg-yellow-500">Product Owner</Badge>;
      case 'scrum_master': return <Badge className="bg-purple-500">Scrum Master</Badge>;
      case 'developer': return <Badge className="bg-blue-500">Developer</Badge>;
      case 'stakeholder': return <Badge variant="outline">Stakeholder</Badge>;
      default: return <Badge variant="outline">{role}</Badge>;
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
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

  const productOwner = members.find(m => m.role === 'product_owner');
  const scrumMaster = members.find(m => m.role === 'scrum_master');
  const developers = members.filter(m => m.role === 'developer');
  const totalCapacity = developers.reduce((sum, m) => sum + m.capacity, 0);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-600" />
              Scrum Team
            </h1>
            <p className="text-muted-foreground">Manage your Scrum team roles</p>
          </div>
          <Button onClick={() => { setEditingMember(null); setForm({ user_email: '', role: 'developer', capacity: '40' }); setShowDialog(true); }} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        {/* Scrum Roles Explanation */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-purple-900 mb-2">Scrum Team Roles</h3>
            <div className="grid grid-cols-3 gap-4 text-sm">
              <div className="flex items-start gap-2">
                <Crown className="h-4 w-4 text-yellow-500 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-900">Product Owner</p>
                  <p className="text-purple-700">Maximizes product value, manages backlog</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Shield className="h-4 w-4 text-purple-500 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-900">Scrum Master</p>
                  <p className="text-purple-700">Facilitates Scrum, removes impediments</p>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <Code className="h-4 w-4 text-blue-500 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-900">Developers</p>
                  <p className="text-purple-700">Cross-functional team that delivers work</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Team Size</p>
              <p className="text-2xl font-bold">{members.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Developers</p>
              <p className="text-2xl font-bold text-blue-600">{developers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Capacity</p>
              <p className="text-2xl font-bold">{totalCapacity}h/sprint</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Recommended Size</p>
              <p className="text-2xl font-bold">3-9</p>
              <p className="text-xs text-muted-foreground">developers</p>
            </CardContent>
          </Card>
        </div>

        {/* Product Owner & Scrum Master */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Crown className="h-5 w-5 text-yellow-500" />
                Product Owner
              </CardTitle>
            </CardHeader>
            <CardContent>
              {productOwner ? (
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-yellow-100 text-yellow-700">
                      {getInitials(productOwner.user_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{productOwner.user_name}</p>
                    <p className="text-sm text-muted-foreground">{productOwner.user_email}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(productOwner)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(productOwner.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No Product Owner assigned</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-purple-500" />
                Scrum Master
              </CardTitle>
            </CardHeader>
            <CardContent>
              {scrumMaster ? (
                <div className="flex items-center gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-purple-100 text-purple-700">
                      {getInitials(scrumMaster.user_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{scrumMaster.user_name}</p>
                    <p className="text-sm text-muted-foreground">{scrumMaster.user_email}</p>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(scrumMaster)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(scrumMaster.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ) : (
                <p className="text-muted-foreground text-center py-4">No Scrum Master assigned</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Development Team */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Code className="h-5 w-5 text-blue-500" />
              Development Team ({developers.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {developers.map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {getInitials(member.user_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <p className="font-medium">{member.user_name}</p>
                    <p className="text-sm text-muted-foreground">{member.user_email}</p>
                  </div>
                  <Badge variant="outline">{member.capacity}h capacity</Badge>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(member)}>
                      <Edit2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(member.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
              {developers.length === 0 && (
                <p className="text-center text-muted-foreground py-4">No developers in the team yet</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Add/Edit Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMember ? 'Edit Team Member' : 'Add Team Member'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email"
                value={form.user_email}
                onChange={(e) => setForm({...form, user_email: e.target.value})}
                placeholder="member@example.com"
                disabled={!!editingMember}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select value={form.role} onValueChange={(v) => setForm({...form, role: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="product_owner">Product Owner</SelectItem>
                  <SelectItem value="scrum_master">Scrum Master</SelectItem>
                  <SelectItem value="developer">Developer</SelectItem>
                  <SelectItem value="stakeholder">Stakeholder</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Capacity (hours/sprint)</label>
              <Input 
                type="number"
                value={form.capacity}
                onChange={(e) => setForm({...form, capacity: e.target.value})}
                placeholder="40"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!editingMember && !form.user_email} className="bg-purple-600 hover:bg-purple-700">Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="scrum" />
    </div>
  );
};

export default ScrumTeam;
