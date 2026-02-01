import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { prince2Api, ProjectBoard, ProjectBoardMember } from '@/lib/prince2Api';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Users, Crown, UserCheck, Building, Shield, Plus, 
  Edit, Trash2, RefreshCw, AlertTriangle, Calendar, Mail
} from 'lucide-react';

const ROLE_ICONS: Record<string, any> = {
  executive: Crown,
  senior_user: UserCheck,
  senior_supplier: Building,
  project_manager: Users,
  project_assurance: Shield,
  change_authority: Edit,
  project_support: Users
};

const ROLE_COLORS: Record<string, string> = {
  executive: 'bg-purple-100 text-purple-700 border-purple-300',
  senior_user: 'bg-blue-100 text-blue-700 border-blue-300',
  senior_supplier: 'bg-green-100 text-green-700 border-green-300',
  project_manager: 'bg-orange-100 text-orange-700 border-orange-300',
  project_assurance: 'bg-cyan-100 text-cyan-700 border-cyan-300',
  change_authority: 'bg-pink-100 text-pink-700 border-pink-300',
  project_support: 'bg-slate-100 text-slate-700 border-slate-300'
};

const Prince2ProjectBoard = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [board, setBoard] = useState<ProjectBoard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);
  const [newMember, setNewMember] = useState<Partial<ProjectBoardMember>>({});

  useEffect(() => {
    if (id) loadBoard();
  }, [id]);

  const loadBoard = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const boards = await prince2Api.board.get(id);
      if (boards.length > 0) {
        setBoard(boards[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async () => {
    if (!id) return;
    try {
      const newBoard = await prince2Api.board.create(id, {
        meeting_frequency: 'Monthly',
        governance_notes: ''
      });
      setBoard(newBoard);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const addMember = async () => {
    if (!id || !board || !newMember.user || !newMember.role) return;
    try {
      await prince2Api.board.addMember(id, board.id, newMember);
      setShowAddMember(false);
      setNewMember({});
      await loadBoard();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const removeMember = async (memberId: number) => {
    if (!id || !confirm('Remove this board member?')) return;
    try {
      await prince2Api.boardMembers.delete(id, memberId);
      await loadBoard();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getMembersByRole = (role: string) => board?.members?.filter(m => m.role === role) || [];

  if (loading) {
    return <div className="flex items-center justify-center h-64"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>;
  }

  // No board yet
  if (!board) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader project={project} />
        <div className="p-6">
          <Card className="max-w-lg mx-auto">
            <CardContent className="pt-6 text-center">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <h2 className="text-xl font-bold mb-2">No Project Board</h2>
              <p className="text-muted-foreground mb-4">Create a project board to define governance structure.</p>
              <Button onClick={createBoard}>
                <Plus className="h-4 w-4 mr-2" />Create Project Board
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader project={project} />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-blue-600" />
              Project Board
            </h1>
            <p className="text-muted-foreground">PRINCE2 Governance Structure</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={loadBoard}>
              <RefreshCw className="h-4 w-4 mr-2" />Refresh
            </Button>
            <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
              <DialogTrigger asChild>
                <Button><Plus className="h-4 w-4 mr-2" />Add Member</Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader><DialogTitle>Add Board Member</DialogTitle></DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label>User ID</Label>
                    <Input 
                      type="number"
                      value={newMember.user || ''} 
                      onChange={(e) => setNewMember({...newMember, user: parseInt(e.target.value)})}
                      placeholder="Enter user ID"
                    />
                  </div>
                  <div>
                    <Label>Role</Label>
                    <Select value={newMember.role || ''} onValueChange={(v) => setNewMember({...newMember, role: v as any})}>
                      <SelectTrigger><SelectValue placeholder="Select role" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="executive">Executive</SelectItem>
                        <SelectItem value="senior_user">Senior User</SelectItem>
                        <SelectItem value="senior_supplier">Senior Supplier</SelectItem>
                        <SelectItem value="project_manager">Project Manager</SelectItem>
                        <SelectItem value="project_assurance">Project Assurance</SelectItem>
                        <SelectItem value="change_authority">Change Authority</SelectItem>
                        <SelectItem value="project_support">Project Support</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label>Responsibilities</Label>
                    <Textarea 
                      value={newMember.responsibilities || ''} 
                      onChange={(e) => setNewMember({...newMember, responsibilities: e.target.value})}
                      rows={3}
                    />
                  </div>
                  <Button onClick={addMember} className="w-full">Add Member</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4 flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="text-red-700">{error}</span>
            </CardContent>
          </Card>
        )}

        {/* Board Info */}
        <Card>
          <CardContent className="pt-6">
            <div className="grid grid-cols-3 gap-4">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Meeting Frequency</p>
                  <p className="font-medium">{board.meeting_frequency}</p>
                </div>
              </div>
              {board.next_meeting_date && (
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="text-sm text-muted-foreground">Next Meeting</p>
                    <p className="font-medium">{board.next_meeting_date}</p>
                  </div>
                </div>
              )}
              <div className="flex items-center gap-3">
                <Users className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="text-sm text-muted-foreground">Members</p>
                  <p className="font-medium">{board.members?.length || 0}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Chart */}
        <div className="space-y-4">
          {/* Executive Row */}
          <div className="flex justify-center">
            <RoleSection 
              title="Executive" 
              role="executive"
              members={getMembersByRole('executive')}
              onRemove={removeMember}
            />
          </div>

          {/* Project Board Row */}
          <div className="flex justify-center gap-8">
            <RoleSection 
              title="Senior User" 
              role="senior_user"
              members={getMembersByRole('senior_user')}
              onRemove={removeMember}
            />
            <RoleSection 
              title="Senior Supplier" 
              role="senior_supplier"
              members={getMembersByRole('senior_supplier')}
              onRemove={removeMember}
            />
          </div>

          {/* Project Manager Row */}
          <div className="flex justify-center">
            <RoleSection 
              title="Project Manager" 
              role="project_manager"
              members={getMembersByRole('project_manager')}
              onRemove={removeMember}
            />
          </div>

          {/* Support Roles */}
          <div className="flex justify-center gap-8">
            <RoleSection 
              title="Project Assurance" 
              role="project_assurance"
              members={getMembersByRole('project_assurance')}
              onRemove={removeMember}
            />
            <RoleSection 
              title="Change Authority" 
              role="change_authority"
              members={getMembersByRole('change_authority')}
              onRemove={removeMember}
            />
            <RoleSection 
              title="Project Support" 
              role="project_support"
              members={getMembersByRole('project_support')}
              onRemove={removeMember}
            />
          </div>
        </div>

        {/* Role Descriptions */}
        <Card>
          <CardHeader><CardTitle className="text-lg">Role Descriptions</CardTitle></CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-4 text-sm">
              <div className="space-y-1">
                <h4 className="font-medium text-purple-700">Executive</h4>
                <p className="text-muted-foreground">Ultimately accountable for the project. Owns the Business Case.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-blue-700">Senior User</h4>
                <p className="text-muted-foreground">Represents users who will use project products. Specifies needs and verifies products.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-green-700">Senior Supplier</h4>
                <p className="text-muted-foreground">Represents those designing, developing, and implementing products.</p>
              </div>
              <div className="space-y-1">
                <h4 className="font-medium text-orange-700">Project Manager</h4>
                <p className="text-muted-foreground">Day-to-day management of the project on behalf of the Project Board.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="prince2" />
    </div>
  );
};

// Role Section Component
const RoleSection = ({ 
  title, 
  role, 
  members, 
  onRemove 
}: { 
  title: string; 
  role: string; 
  members: ProjectBoardMember[];
  onRemove: (id: number) => void;
}) => {
  const Icon = ROLE_ICONS[role] || Users;
  const colorClass = ROLE_COLORS[role] || '';
  
  return (
    <Card className={`w-64 ${colorClass} border`}>
      <CardHeader className="pb-2">
        <div className="flex items-center gap-2">
          <Icon className="h-5 w-5" />
          <CardTitle className="text-sm">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        {members.length > 0 ? (
          <div className="space-y-2">
            {members.map((member) => (
              <div key={member.id} className="flex items-center gap-2 p-2 bg-white/50 rounded">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>{member.user_name?.charAt(0) || '?'}</AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{member.user_name || 'Unknown'}</p>
                  {member.user_email && (
                    <p className="text-xs text-muted-foreground truncate">{member.user_email}</p>
                  )}
                </div>
                <Button variant="ghost" size="sm" onClick={() => onRemove(member.id)}>
                  <Trash2 className="h-3 w-3 text-red-500" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-center text-muted-foreground py-2">No member assigned</p>
        )}
      </CardContent>
    </Card>
  );
};

export default Prince2ProjectBoard;
