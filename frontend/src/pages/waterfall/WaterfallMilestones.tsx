import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Flag, CheckCircle, Clock, AlertTriangle, Plus, 
  Calendar, Loader2, Target, ArrowRight
} from 'lucide-react';

interface Milestone {
  id: number;
  name: string;
  description: string;
  phase: string;
  dueDate: string;
  completedDate?: string;
  status: 'pending' | 'in_progress' | 'completed' | 'at_risk' | 'overdue';
  deliverables: string[];
  owner: string;
}

const WaterfallMilestones = () => {
  const { id } = useParams<{ id: string }>();
  
  const [milestones, setMilestones] = useState<Milestone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);

  const [form, setForm] = useState({
    name: '',
    description: '',
    phase: 'requirements',
    dueDate: '',
    deliverables: '',
    owner: '',
  });

  useEffect(() => {
    loadMilestones();
  }, [id]);

  const loadMilestones = async () => {
    setLoading(true);
    setTimeout(() => {
      setMilestones([
        { 
          id: 1, 
          name: 'Requirements Sign-off', 
          description: 'All requirements documented and approved by stakeholders',
          phase: 'Requirements',
          dueDate: '2024-10-05', 
          completedDate: '2024-10-04',
          status: 'completed', 
          deliverables: ['Requirements Document', 'Use Case Diagrams', 'Sign-off Form'],
          owner: 'Sarah Chen'
        },
        { 
          id: 2, 
          name: 'Design Complete', 
          description: 'System architecture and UI/UX designs finalized',
          phase: 'Design',
          dueDate: '2024-11-05', 
          completedDate: '2024-11-05',
          status: 'completed', 
          deliverables: ['Architecture Document', 'UI Mockups', 'Database Schema'],
          owner: 'Mike Johnson'
        },
        { 
          id: 3, 
          name: 'Backend MVP', 
          description: 'Core backend functionality complete',
          phase: 'Development',
          dueDate: '2024-12-15', 
          status: 'in_progress', 
          deliverables: ['API Endpoints', 'Database Implementation', 'Authentication Module'],
          owner: 'James Brown'
        },
        { 
          id: 4, 
          name: 'Frontend MVP', 
          description: 'Core UI components and pages complete',
          phase: 'Development',
          dueDate: '2024-12-20', 
          status: 'at_risk', 
          deliverables: ['Dashboard UI', 'User Management', 'Navigation'],
          owner: 'Emma Wilson'
        },
        { 
          id: 5, 
          name: 'Integration Complete', 
          description: 'All system components integrated',
          phase: 'Development',
          dueDate: '2024-12-31', 
          status: 'pending', 
          deliverables: ['Integrated System', 'Integration Test Report'],
          owner: 'Dev Team'
        },
        { 
          id: 6, 
          name: 'UAT Sign-off', 
          description: 'User acceptance testing complete with approval',
          phase: 'Testing',
          dueDate: '2025-01-25', 
          status: 'pending', 
          deliverables: ['UAT Test Report', 'Sign-off Document', 'Issue Log'],
          owner: 'QA Team'
        },
        { 
          id: 7, 
          name: 'Go-Live', 
          description: 'System deployed to production',
          phase: 'Deployment',
          dueDate: '2025-01-28', 
          status: 'pending', 
          deliverables: ['Production System', 'Deployment Report', 'Handover Documents'],
          owner: 'DevOps'
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const getStatusBadge = (status: Milestone['status']) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Completed</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500"><Clock className="h-3 w-3 mr-1" />In Progress</Badge>;
      case 'at_risk': return <Badge className="bg-orange-500"><AlertTriangle className="h-3 w-3 mr-1" />At Risk</Badge>;
      case 'overdue': return <Badge variant="destructive"><AlertTriangle className="h-3 w-3 mr-1" />Overdue</Badge>;
      default: return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getPhaseColor = (phase: string) => {
    const colors: Record<string, string> = {
      'Requirements': 'bg-purple-500',
      'Design': 'bg-pink-500',
      'Development': 'bg-blue-500',
      'Testing': 'bg-orange-500',
      'Deployment': 'bg-green-500',
    };
    return colors[phase] || 'bg-gray-500';
  };

  const getDaysRemaining = (dueDate: string) => {
    const due = new Date(dueDate);
    const now = new Date();
    const diff = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const stats = {
    total: milestones.length,
    completed: milestones.filter(m => m.status === 'completed').length,
    inProgress: milestones.filter(m => m.status === 'in_progress').length,
    atRisk: milestones.filter(m => m.status === 'at_risk' || m.status === 'overdue').length,
  };

  const progress = (stats.completed / stats.total) * 100;

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

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Flag className="h-6 w-6 text-blue-600" />
              Milestones
            </h1>
            <p className="text-muted-foreground">Track key project deliverables and deadlines</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Milestone
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Milestones</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <p className="text-sm text-green-700">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <p className="text-sm text-blue-700">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </CardContent>
          </Card>
          <Card className={stats.atRisk > 0 ? 'border-orange-200 bg-orange-50' : ''}>
            <CardContent className="pt-4">
              <p className="text-sm text-orange-700">At Risk</p>
              <p className="text-2xl font-bold text-orange-600">{stats.atRisk}</p>
            </CardContent>
          </Card>
        </div>

        {/* Overall Progress */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Milestone Progress</span>
              <span className="font-bold">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* At Risk Alert */}
        {stats.atRisk > 0 && (
          <Card className="border-orange-300 bg-orange-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="font-semibold text-orange-800">{stats.atRisk} milestone(s) at risk</p>
                  <p className="text-sm text-orange-700">Review and take corrective action</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Timeline View */}
        <Card>
          <CardHeader>
            <CardTitle>Milestone Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-gray-200" />
              {milestones.map((milestone, idx) => {
                const daysRemaining = getDaysRemaining(milestone.dueDate);
                return (
                  <div key={milestone.id} className="relative pl-14 pb-8 last:pb-0">
                    <div className={`absolute left-4 w-5 h-5 rounded-full border-2 ${
                      milestone.status === 'completed' ? 'bg-green-500 border-green-500' :
                      milestone.status === 'in_progress' ? 'bg-blue-500 border-blue-500' :
                      milestone.status === 'at_risk' ? 'bg-orange-500 border-orange-500' :
                      'bg-white border-gray-300'
                    }`}>
                      {milestone.status === 'completed' && (
                        <CheckCircle className="h-4 w-4 text-white -mt-0.5 -ml-0.5" />
                      )}
                    </div>
                    
                    <Card className={`${
                      milestone.status === 'at_risk' ? 'border-orange-200' :
                      milestone.status === 'completed' ? 'border-green-200' : ''
                    }`}>
                      <CardContent className="pt-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold">{milestone.name}</h3>
                              <Badge className={getPhaseColor(milestone.phase)}>{milestone.phase}</Badge>
                              {getStatusBadge(milestone.status)}
                            </div>
                            <p className="text-sm text-muted-foreground mb-3">{milestone.description}</p>
                            
                            <div className="flex items-center gap-4 text-sm">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                Due: {milestone.dueDate}
                              </span>
                              {milestone.completedDate && (
                                <span className="flex items-center gap-1 text-green-600">
                                  <CheckCircle className="h-4 w-4" />
                                  Completed: {milestone.completedDate}
                                </span>
                              )}
                              {milestone.status !== 'completed' && (
                                <span className={`${daysRemaining < 0 ? 'text-red-600' : daysRemaining < 7 ? 'text-orange-600' : ''}`}>
                                  {daysRemaining < 0 ? `${Math.abs(daysRemaining)} days overdue` : `${daysRemaining} days remaining`}
                                </span>
                              )}
                            </div>
                            
                            <div className="mt-3">
                              <p className="text-xs font-medium text-muted-foreground mb-1">Deliverables:</p>
                              <div className="flex flex-wrap gap-2">
                                {milestone.deliverables.map((d, idx) => (
                                  <Badge key={idx} variant="outline" className="text-xs">{d}</Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs text-muted-foreground">Owner</p>
                            <p className="font-medium">{milestone.owner}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-blue-900 mb-2">Milestone Management Best Practices</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Define clear, measurable deliverables for each milestone</li>
              <li>• Get formal sign-off when milestones are completed</li>
              <li>• Track dependencies between milestones</li>
              <li>• Escalate at-risk milestones immediately</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Add Milestone Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Milestone</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Milestone Name</label>
              <Input 
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                placeholder="e.g., Requirements Sign-off"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="Describe what this milestone represents..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Phase</label>
                <Select value={form.phase} onValueChange={(v) => setForm({...form, phase: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="requirements">Requirements</SelectItem>
                    <SelectItem value="design">Design</SelectItem>
                    <SelectItem value="development">Development</SelectItem>
                    <SelectItem value="testing">Testing</SelectItem>
                    <SelectItem value="deployment">Deployment</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Due Date</label>
                <Input 
                  type="date"
                  value={form.dueDate}
                  onChange={(e) => setForm({...form, dueDate: e.target.value})}
                />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Deliverables (comma separated)</label>
              <Input 
                value={form.deliverables}
                onChange={(e) => setForm({...form, deliverables: e.target.value})}
                placeholder="Document A, Report B, Sign-off Form"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Owner</label>
              <Input 
                value={form.owner}
                onChange={(e) => setForm({...form, owner: e.target.value})}
                placeholder="Responsible person or team"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button disabled={!form.name || !form.dueDate}>Add Milestone</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="waterfall" />
    </div>
  );
};

export default WaterfallMilestones;
