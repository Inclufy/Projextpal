import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  FileText, Plus, Edit2, Trash2, CheckCircle, 
  AlertTriangle, Loader2, Link, Filter
} from 'lucide-react';

interface Requirement {
  id: string;
  code: string;
  title: string;
  description: string;
  type: 'functional' | 'non_functional' | 'business' | 'technical';
  priority: 'must' | 'should' | 'could' | 'wont';
  status: 'draft' | 'approved' | 'implemented' | 'verified';
  source: string;
  traceability?: string[];
}

const WaterfallRequirements = () => {
  const { id } = useParams<{ id: string }>();
  
  const [requirements, setRequirements] = useState<Requirement[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const [form, setForm] = useState({
    code: '',
    title: '',
    description: '',
    type: 'functional',
    priority: 'must',
    source: '',
  });

  useEffect(() => {
    loadRequirements();
  }, [id]);

  const loadRequirements = async () => {
    setLoading(true);
    setTimeout(() => {
      setRequirements([
        { id: '1', code: 'REQ-001', title: 'User Authentication', description: 'System shall provide secure user authentication using email/password and OAuth2.', type: 'functional', priority: 'must', status: 'verified', source: 'Stakeholder Interview', traceability: ['TC-001', 'TC-002'] },
        { id: '2', code: 'REQ-002', title: 'Role-based Access Control', description: 'System shall implement role-based access control with Admin, Manager, and User roles.', type: 'functional', priority: 'must', status: 'implemented', source: 'Business Requirements', traceability: ['TC-003'] },
        { id: '3', code: 'REQ-003', title: 'Dashboard Overview', description: 'System shall display a dashboard with key project metrics and status indicators.', type: 'functional', priority: 'must', status: 'implemented', source: 'User Stories' },
        { id: '4', code: 'REQ-004', title: 'Response Time', description: 'System shall respond to user actions within 2 seconds under normal load.', type: 'non_functional', priority: 'should', status: 'approved', source: 'Technical Requirements' },
        { id: '5', code: 'REQ-005', title: 'Data Encryption', description: 'All sensitive data shall be encrypted at rest and in transit using AES-256.', type: 'non_functional', priority: 'must', status: 'implemented', source: 'Security Policy' },
        { id: '6', code: 'REQ-006', title: 'Report Generation', description: 'System shall generate PDF and Excel reports for project status and metrics.', type: 'functional', priority: 'should', status: 'approved', source: 'Stakeholder Interview' },
        { id: '7', code: 'REQ-007', title: 'Audit Trail', description: 'System shall maintain an audit trail of all user actions for compliance.', type: 'business', priority: 'must', status: 'draft', source: 'Compliance Requirements' },
        { id: '8', code: 'REQ-008', title: 'API Integration', description: 'System shall provide REST API for third-party integrations.', type: 'technical', priority: 'could', status: 'draft', source: 'Technical Architecture' },
      ]);
      setLoading(false);
    }, 500);
  };

  const getTypeBadge = (type: Requirement['type']) => {
    const colors: Record<string, string> = {
      functional: 'bg-blue-500',
      non_functional: 'bg-purple-500',
      business: 'bg-green-500',
      technical: 'bg-orange-500',
    };
    const labels: Record<string, string> = {
      functional: 'Functional',
      non_functional: 'Non-Functional',
      business: 'Business',
      technical: 'Technical',
    };
    return <Badge className={colors[type]}>{labels[type]}</Badge>;
  };

  const getPriorityBadge = (priority: Requirement['priority']) => {
    const colors: Record<string, string> = {
      must: 'bg-red-500',
      should: 'bg-orange-500',
      could: 'bg-yellow-500',
      wont: 'bg-gray-400',
    };
    const labels: Record<string, string> = {
      must: 'Must Have',
      should: 'Should Have',
      could: 'Could Have',
      wont: "Won't Have",
    };
    return <Badge className={colors[priority]}>{labels[priority]}</Badge>;
  };

  const getStatusBadge = (status: Requirement['status']) => {
    const config: Record<string, { color: string; icon: any }> = {
      draft: { color: 'bg-gray-400', icon: FileText },
      approved: { color: 'bg-blue-500', icon: CheckCircle },
      implemented: { color: 'bg-orange-500', icon: CheckCircle },
      verified: { color: 'bg-green-500', icon: CheckCircle },
    };
    const c = config[status];
    return <Badge className={c.color}>{status}</Badge>;
  };

  const handleSave = () => {
    setShowDialog(false);
    setForm({ code: '', title: '', description: '', type: 'functional', priority: 'must', source: '' });
  };

  const handleDelete = (reqId: string) => {
    if (!confirm('Delete this requirement?')) return;
    setRequirements(requirements.filter(r => r.id !== reqId));
  };

  const filteredRequirements = requirements.filter(r => {
    if (filterType !== 'all' && r.type !== filterType) return false;
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    if (searchQuery && !r.title.toLowerCase().includes(searchQuery.toLowerCase()) && 
        !r.code.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const stats = {
    total: requirements.length,
    verified: requirements.filter(r => r.status === 'verified').length,
    implemented: requirements.filter(r => r.status === 'implemented').length,
    approved: requirements.filter(r => r.status === 'approved').length,
    draft: requirements.filter(r => r.status === 'draft').length,
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

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <FileText className="h-6 w-6 text-blue-600" />
              Requirements
            </h1>
            <p className="text-muted-foreground">Requirements specification document</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Requirement
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Verified</p>
              <p className="text-2xl font-bold text-green-600">{stats.verified}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Implemented</p>
              <p className="text-2xl font-bold text-orange-600">{stats.implemented}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Approved</p>
              <p className="text-2xl font-bold text-blue-600">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Draft</p>
              <p className="text-2xl font-bold text-gray-600">{stats.draft}</p>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <div className="flex gap-4">
          <Input 
            placeholder="Search requirements..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="max-w-xs"
          />
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="functional">Functional</SelectItem>
              <SelectItem value="non_functional">Non-Functional</SelectItem>
              <SelectItem value="business">Business</SelectItem>
              <SelectItem value="technical">Technical</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="draft">Draft</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="implemented">Implemented</SelectItem>
              <SelectItem value="verified">Verified</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Requirements List */}
        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {filteredRequirements.map((req) => (
                <div key={req.id} className="border rounded-lg p-4 hover:bg-muted/50">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <span className="font-mono text-sm bg-muted px-2 py-0.5 rounded">{req.code}</span>
                        <span className="font-semibold">{req.title}</span>
                        {getTypeBadge(req.type)}
                        {getPriorityBadge(req.priority)}
                        {getStatusBadge(req.status)}
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{req.description}</p>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>Source: {req.source}</span>
                        {req.traceability && req.traceability.length > 0 && (
                          <span className="flex items-center gap-1">
                            <Link className="h-3 w-3" />
                            {req.traceability.join(', ')}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDelete(req.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-blue-900 mb-2">Requirements Best Practices</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Requirements must be clear, measurable, and testable</li>
              <li>• Maintain traceability to test cases and design elements</li>
              <li>• Get formal sign-off before proceeding to design</li>
              <li>• Use change control process for requirement modifications</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Add Requirement Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Add Requirement</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Requirement ID</label>
              <Input 
                value={form.code}
                onChange={(e) => setForm({...form, code: e.target.value})}
                placeholder="REQ-XXX"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Source</label>
              <Input 
                value={form.source}
                onChange={(e) => setForm({...form, source: e.target.value})}
                placeholder="e.g., Stakeholder Interview"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Title</label>
              <Input 
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="Short requirement title"
              />
            </div>
            <div className="col-span-2">
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="The system shall..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={form.type} onValueChange={(v) => setForm({...form, type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="functional">Functional</SelectItem>
                  <SelectItem value="non_functional">Non-Functional</SelectItem>
                  <SelectItem value="business">Business</SelectItem>
                  <SelectItem value="technical">Technical</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <Select value={form.priority} onValueChange={(v) => setForm({...form, priority: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="must">Must Have</SelectItem>
                  <SelectItem value="should">Should Have</SelectItem>
                  <SelectItem value="could">Could Have</SelectItem>
                  <SelectItem value="wont">Won't Have</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSave} disabled={!form.code || !form.title}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="waterfall" />
    </div>
  );
};

export default WaterfallRequirements;
