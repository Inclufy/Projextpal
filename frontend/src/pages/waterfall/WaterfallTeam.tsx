import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Users, Plus, Edit2, Trash2, Crown, FileText, 
  Palette, Code, TestTube, Rocket, Loader2
} from 'lucide-react';

interface TeamMember {
  id: number;
  name: string;
  email: string;
  role: string;
  phase: string;
  allocation: number;
  responsibilities: string[];
}

const WaterfallTeam = () => {
  const { id } = useParams<{ id: string }>();
  
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    email: '',
    role: 'developer',
    phase: 'development',
    allocation: '100',
  });

  const roles = [
    { value: 'project_manager', label: 'Project Manager', icon: Crown, color: 'bg-amber-500' },
    { value: 'business_analyst', label: 'Business Analyst', icon: FileText, color: 'bg-blue-500' },
    { value: 'architect', label: 'Solution Architect', icon: Palette, color: 'bg-purple-500' },
    { value: 'developer', label: 'Developer', icon: Code, color: 'bg-orange-500' },
    { value: 'tester', label: 'QA Tester', icon: TestTube, color: 'bg-green-500' },
    { value: 'devops', label: 'DevOps Engineer', icon: Rocket, color: 'bg-red-500' },
  ];

  const phases = [
    { value: 'requirements', label: 'Requirements' },
    { value: 'design', label: 'Design' },
    { value: 'development', label: 'Development' },
    { value: 'testing', label: 'Testing' },
    { value: 'deployment', label: 'Deployment' },
    { value: 'maintenance', label: 'Maintenance' },
  ];

  useEffect(() => {
    loadTeam();
  }, [id]);

  const loadTeam = async () => {
    setLoading(true);
    setTimeout(() => {
      setMembers([
        { id: 1, name: 'Robert Smith', email: 'robert@company.com', role: 'project_manager', phase: 'all', allocation: 100, responsibilities: ['Project Planning', 'Stakeholder Communication', 'Risk Management'] },
        { id: 2, name: 'Anna Martinez', email: 'anna@company.com', role: 'business_analyst', phase: 'requirements', allocation: 100, responsibilities: ['Requirements Gathering', 'Documentation', 'User Stories'] },
        { id: 3, name: 'David Chen', email: 'david@company.com', role: 'architect', phase: 'design', allocation: 80, responsibilities: ['System Architecture', 'Technical Design', 'Code Reviews'] },
        { id: 4, name: 'Emma Wilson', email: 'emma@company.com', role: 'developer', phase: 'development', allocation: 100, responsibilities: ['Frontend Development', 'API Integration'] },
        { id: 5, name: 'James Brown', email: 'james@company.com', role: 'developer', phase: 'development', allocation: 100, responsibilities: ['Backend Development', 'Database Design'] },
        { id: 6, name: 'Sarah Johnson', email: 'sarah@company.com', role: 'tester', phase: 'testing', allocation: 100, responsibilities: ['Test Planning', 'Automation', 'UAT Coordination'] },
        { id: 7, name: 'Mike Davis', email: 'mike@company.com', role: 'devops', phase: 'deployment', allocation: 50, responsibilities: ['CI/CD Pipeline', 'Infrastructure', 'Monitoring'] },
      ]);
      setLoading(false);
    }, 500);
  };

  const handleSave = () => {
    setShowDialog(false);
    setForm({ name: '', email: '', role: 'developer', phase: 'development', allocation: '100' });
  };

  const handleDelete = (memberId: number) => {
    if (!confirm('Remove this team member?')) return;
    setMembers(members.filter(m => m.id !== memberId));
  };

  const getRoleInfo = (roleValue: string) => {
    return roles.find(r => r.value === roleValue) || roles[3];
  };

  const getPhaseLabel = (phaseValue: string) => {
    if (phaseValue === 'all') return 'All Phases';
    return phases.find(p => p.value === phaseValue)?.label || phaseValue;
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

  const membersByRole = roles.map(role => ({
    ...role,
    members: members.filter(m => m.role === role.value)
  })).filter(r => r.members.length > 0);

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Project Team
            </h1>
            <p className="text-muted-foreground">Team members by role and phase</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Team Size</p>
              <p className="text-2xl font-bold">{members.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total FTE</p>
              <p className="text-2xl font-bold">
                {(members.reduce((sum, m) => sum + m.allocation, 0) / 100).toFixed(1)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Developers</p>
              <p className="text-2xl font-bold">{members.filter(m => m.role === 'developer').length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Current Phase</p>
              <p className="text-lg font-bold text-blue-600">Development</p>
            </CardContent>
          </Card>
        </div>

        {/* Team by Role */}
        {membersByRole.map((roleGroup) => (
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
                  <div key={member.id} className="flex items-start gap-4 p-4 border rounded-lg hover:bg-muted/50">
                    <Avatar className="h-12 w-12">
                      <AvatarFallback className={roleGroup.color + ' text-white'}>
                        {member.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{member.name}</span>
                        <Badge variant="outline" className="text-xs">
                          {member.allocation}%
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className="bg-blue-100 text-blue-700 text-xs">
                          {getPhaseLabel(member.phase)}
                        </Badge>
                      </div>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {member.responsibilities.map((resp, idx) => (
                          <Badge key={idx} variant="outline" className="text-xs">{resp}</Badge>
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
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
        ))}

        {/* RACI Matrix Hint */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-blue-900 mb-2">Waterfall Team Structure</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Clear role definitions with specific phase assignments</li>
              <li>• Resources allocated based on project phase</li>
              <li>• Formal handoffs between phase teams</li>
              <li>• Document responsibilities in RACI matrix</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Team Member</DialogTitle>
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
                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Primary Phase</label>
              <Select value={form.phase} onValueChange={(v) => setForm({...form, phase: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Phases</SelectItem>
                  {phases.map(phase => (
                    <SelectItem key={phase.value} value={phase.value}>{phase.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Allocation (%)</label>
              <Input 
                type="number"
                value={form.allocation}
                onChange={(e) => setForm({...form, allocation: e.target.value})}
                min="0"
                max="100"
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
          <MethodologyHelpPanel methodology="waterfall" />
    </div>
  );
};

export default WaterfallTeam;
