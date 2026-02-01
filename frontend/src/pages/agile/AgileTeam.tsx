import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { ProjectHeader } from '@/components/ProjectHeader';
import { toast } from 'sonner';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Users, Plus, Edit2, Trash2, Crown, Code, Palette, 
  TestTube, Shield, Loader2
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  skills: string[];
  capacity: number;
  current_load: number;
  avatar?: string;
}

const roles = [
  { value: 'product_owner', label: 'Product Owner', icon: Crown, color: 'bg-amber-500' },
  { value: 'tech_lead', label: 'Tech Lead', icon: Shield, color: 'bg-purple-500' },
  { value: 'developer', label: 'Developer', icon: Code, color: 'bg-blue-500' },
  { value: 'designer', label: 'Designer', icon: Palette, color: 'bg-pink-500' },
  { value: 'qa', label: 'QA Engineer', icon: TestTube, color: 'bg-green-500' },
];

const fetchTeamMembers = async (projectId: string) => {
  const token = localStorage.getItem("access_token");
  
  // Try project-specific team
  const response = await fetch(`${API_BASE_URL}/projects/${projectId}/team/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (response.ok) {
    const data = await response.json();
    return Array.isArray(data) ? data : data.results || data.members || [];
  }
  
  // Fallback to general team
  const teamResponse = await fetch(`${API_BASE_URL}/team/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!teamResponse.ok) return [];
  const teamData = await teamResponse.json();
  return Array.isArray(teamData) ? teamData : teamData.results || [];
};

const AgileTeam = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  
  const [showDialog, setShowDialog] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'developer',
    skills: '',
    capacity: '40',
  });

  const { data: members = [], isLoading } = useQuery({
    queryKey: ['project-team', id],
    queryFn: () => fetchTeamMembers(id!),
    enabled: !!id,
  });

  // Map backend data to expected format
  const mappedMembers: TeamMember[] = members.map((m: any) => ({
    id: m.id,
    name: m.name || m.full_name || `${m.first_name || ''} ${m.last_name || ''}`.trim(),
    email: m.email || '',
    role: m.role || 'developer',
    skills: m.skills || [],
    capacity: m.capacity || m.hours_per_week || 40,
    current_load: m.current_load || m.allocated_hours || 0,
  }));

  const handleSave = () => {
    // Save logic - would call API
    toast.success(editingMember ? 'Member updated' : 'Member added');
    setShowDialog(false);
    setEditingMember(null);
    setForm({ name: '', email: '', role: 'developer', skills: '', capacity: '40' });
    queryClient.invalidateQueries({ queryKey: ['project-team', id] });
  };

  const handleDelete = (memberId: number) => {
    if (!confirm('Remove this team member?')) return;
    // Would call delete API
    toast.success('Member removed');
    queryClient.invalidateQueries({ queryKey: ['project-team', id] });
  };

  const openEdit = (member: TeamMember) => {
    setEditingMember(member);
    setForm({
      name: member.name,
      email: member.email,
      role: member.role,
      skills: member.skills.join(', '),
      capacity: member.capacity.toString(),
    });
    setShowDialog(true);
  };

  const getRoleInfo = (roleValue: string) => {
    return roles.find(r => r.value === roleValue) || roles[2];
  };

  const getLoadColor = (load: number, capacity: number) => {
    const percentage = (load / capacity) * 100;
    if (percentage >= 90) return 'text-red-600';
    if (percentage >= 70) return 'text-yellow-600';
    return 'text-green-600';
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

  const teamByRole = roles.map(role => ({
    ...role,
    members: mappedMembers.filter(m => m.role === role.value)
  })).filter(r => r.members.length > 0);

  const totalCapacity = mappedMembers.reduce((sum, m) => sum + m.capacity, 0);
  const totalLoad = mappedMembers.reduce((sum, m) => sum + m.current_load, 0);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-emerald-600" />
              Agile Team
            </h1>
            <p className="text-muted-foreground">Cross-functional team members</p>
          </div>
          <Button onClick={() => { setEditingMember(null); setShowDialog(true); }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        {/* Team Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Team Size</p>
              <p className="text-2xl font-bold">{mappedMembers.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Capacity</p>
              <p className="text-2xl font-bold">{totalCapacity}h/week</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Current Load</p>
              <p className="text-2xl font-bold">{totalLoad}h/week</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Utilization</p>
              <p className="text-2xl font-bold text-emerald-600">
                {totalCapacity > 0 ? Math.round((totalLoad / totalCapacity) * 100) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Team by Role */}
        {teamByRole.length > 0 ? (
          teamByRole.map((roleGroup) => (
            <Card key={roleGroup.value}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <roleGroup.icon className={`h-5 w-5 ${roleGroup.color.replace('bg-', 'text-')}`} />
                  {roleGroup.label}
                  <Badge variant="outline">{roleGroup.members.length}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {roleGroup.members.map((member) => (
                    <div key={member.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                      <Avatar className="h-12 w-12">
                        <AvatarFallback className={roleGroup.color + ' text-white'}>
                          {member.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{member.name}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {(member.skills || []).slice(0, 3).map((skill, idx) => (
                            <Badge key={idx} variant="outline" className="text-xs">{skill}</Badge>
                          ))}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-medium ${getLoadColor(member.current_load, member.capacity)}`}>
                          {member.current_load}/{member.capacity}h
                        </p>
                        <Progress 
                          value={member.capacity > 0 ? (member.current_load / member.capacity) * 100 : 0} 
                          className="h-1.5 w-20 mt-1"
                        />
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
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <Users className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">No team members assigned yet</p>
              <Button onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Member
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Agile Team Principles */}
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-emerald-900 mb-2">Agile Team Characteristics</h3>
            <ul className="space-y-1 text-sm text-emerald-800">
              <li>• <strong>Cross-functional:</strong> Team has all skills needed to deliver</li>
              <li>• <strong>Self-organizing:</strong> Team decides how to accomplish work</li>
              <li>• <strong>Collaborative:</strong> Continuous communication and pair work</li>
              <li>• <strong>Co-located or connected:</strong> Easy access to team members</li>
            </ul>
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
              <label className="text-sm font-medium">Name</label>
              <Input 
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                placeholder="Full name"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <Input 
                type="email"
                value={form.email}
                onChange={(e) => setForm({...form, email: e.target.value})}
                placeholder="email@company.com"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Role</label>
              <Select value={form.role} onValueChange={(v) => setForm({...form, role: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role.value} value={role.value}>
                      <div className="flex items-center gap-2">
                        <role.icon className="h-4 w-4" />
                        {role.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Skills (comma separated)</label>
              <Input 
                value={form.skills}
                onChange={(e) => setForm({...form, skills: e.target.value})}
                placeholder="React, TypeScript, Node.js"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Capacity (hours/week)</label>
              <Input 
                type="number"
                value={form.capacity}
                onChange={(e) => setForm({...form, capacity: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.name || !form.email}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="agile" />
    </div>
  );
};

export default AgileTeam;
