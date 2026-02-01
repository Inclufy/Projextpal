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
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Users, Plus, Trash2, Edit2, Loader2, 
  User, Mail, Shield, CheckCircle
} from 'lucide-react';

interface TeamMember {
  id: number;
  user: number;
  user_name: string;
  user_email: string;
  role: string;
  capacity_hours: number;
  is_active: boolean;
}

const KanbanTeam = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  const [form, setForm] = useState({
    user_email: '',
    role: 'team_member',
    capacity_hours: '40',
  });

  useEffect(() => {
    if (id) {
      loadTeam();
    }
  }, [id]);

  const loadTeam = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API call
      setMembers([
        { id: 1, user: 1, user_name: 'Jan de Vries', user_email: 'jan@example.com', role: 'team_lead', capacity_hours: 40, is_active: true },
        { id: 2, user: 2, user_name: 'Maria Santos', user_email: 'maria@example.com', role: 'team_member', capacity_hours: 32, is_active: true },
        { id: 3, user: 3, user_name: 'Peter Johnson', user_email: 'peter@example.com', role: 'team_member', capacity_hours: 40, is_active: true },
      ]);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Implementation would save to API
    setShowDialog(false);
    setEditingMember(null);
    setForm({ user_email: '', role: 'team_member', capacity_hours: '40' });
    loadTeam();
  };

  const handleDelete = async (memberId: number) => {
    if (!confirm('Remove this team member?')) return;
    // Implementation would delete via API
    loadTeam();
  };

  const openEdit = (member: TeamMember) => {
    setEditingMember(member);
    setForm({
      user_email: member.user_email,
      role: member.role,
      capacity_hours: member.capacity_hours.toString(),
    });
    setShowDialog(true);
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'team_lead': return <Badge className="bg-purple-500">Team Lead</Badge>;
      case 'service_manager': return <Badge className="bg-blue-500">Service Manager</Badge>;
      case 'team_member': return <Badge variant="secondary">Team Member</Badge>;
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
          <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  const totalCapacity = members.reduce((sum, m) => sum + m.capacity_hours, 0);
  const activeMembers = members.filter(m => m.is_active).length;

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Kanban Team
            </h1>
            <p className="text-muted-foreground">Manage team members and capacity</p>
          </div>
          <Button onClick={() => { setEditingMember(null); setForm({ user_email: '', role: 'team_member', capacity_hours: '40' }); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Size</p>
                  <p className="text-2xl font-bold">{members.length}</p>
                </div>
                <Users className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Members</p>
                  <p className="text-2xl font-bold text-green-600">{activeMembers}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Capacity</p>
                  <p className="text-2xl font-bold">{totalCapacity}h/week</p>
                </div>
                <Shield className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Team Members */}
        <Card>
          <CardHeader>
            <CardTitle>Team Members</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {members.map((member) => (
                <div 
                  key={member.id}
                  className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50"
                >
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-blue-100 text-blue-700">
                      {getInitials(member.user_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{member.user_name}</span>
                      {getRoleBadge(member.role)}
                      {!member.is_active && <Badge variant="outline" className="text-gray-500">Inactive</Badge>}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {member.user_email}
                      </span>
                      <span>Capacity: {member.capacity_hours}h/week</span>
                    </div>
                  </div>
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
              {members.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No team members yet</p>
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
                  <SelectItem value="team_lead">Team Lead</SelectItem>
                  <SelectItem value="service_manager">Service Manager</SelectItem>
                  <SelectItem value="team_member">Team Member</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Capacity (hours/week)</label>
              <Input 
                type="number"
                value={form.capacity_hours}
                onChange={(e) => setForm({...form, capacity_hours: e.target.value})}
                placeholder="40"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.user_email}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="kanban" />
    </div>
  );
};

export default KanbanTeam;
