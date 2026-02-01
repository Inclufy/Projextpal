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
  FileEdit, Plus, Clock, CheckCircle, XCircle, 
  AlertTriangle, Loader2, Calendar, User, DollarSign
} from 'lucide-react';

interface ChangeRequest {
  id: number;
  title: string;
  description: string;
  requestedBy: string;
  requestDate: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'implemented';
  impact: {
    schedule: string;
    budget: string;
    scope: string;
  };
  affectedPhase: string;
  approver?: string;
  approvalDate?: string;
  notes?: string;
}

const WaterfallChangeRequests = () => {
  const { id } = useParams<{ id: string }>();
  
  const [requests, setRequests] = useState<ChangeRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<ChangeRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    affectedPhase: 'development',
    scheduleImpact: '',
    budgetImpact: '',
    scopeImpact: '',
  });

  useEffect(() => {
    loadRequests();
  }, [id]);

  const loadRequests = async () => {
    setLoading(true);
    setTimeout(() => {
      setRequests([
        { 
          id: 1, 
          title: 'Add two-factor authentication', 
          description: 'Security requirement to add 2FA for all user accounts',
          requestedBy: 'Security Team',
          requestDate: '2024-11-15',
          priority: 'high',
          status: 'approved',
          impact: {
            schedule: '+2 weeks',
            budget: '+$15,000',
            scope: 'Add 2FA module to authentication system',
          },
          affectedPhase: 'Development',
          approver: 'Project Sponsor',
          approvalDate: '2024-11-20',
        },
        { 
          id: 2, 
          title: 'Mobile responsive design', 
          description: 'Ensure all pages work on mobile devices',
          requestedBy: 'Product Owner',
          requestDate: '2024-11-28',
          priority: 'medium',
          status: 'under_review',
          impact: {
            schedule: '+1 week',
            budget: '+$8,000',
            scope: 'CSS updates and responsive layouts',
          },
          affectedPhase: 'Development',
        },
        { 
          id: 3, 
          title: 'Remove legacy API support', 
          description: 'Eliminate support for v1 API endpoints',
          requestedBy: 'Tech Lead',
          requestDate: '2024-12-01',
          priority: 'low',
          status: 'rejected',
          impact: {
            schedule: '-3 days',
            budget: '-$5,000',
            scope: 'Remove deprecated endpoints',
          },
          affectedPhase: 'Development',
          approver: 'Project Sponsor',
          approvalDate: '2024-12-05',
          notes: 'Rejected: Some customers still using v1 API',
        },
        { 
          id: 4, 
          title: 'Add export to Excel feature', 
          description: 'Allow users to export reports to Excel format',
          requestedBy: 'Customer Success',
          requestDate: '2024-12-10',
          priority: 'medium',
          status: 'submitted',
          impact: {
            schedule: '+4 days',
            budget: '+$3,000',
            scope: 'New export module',
          },
          affectedPhase: 'Development',
        },
        { 
          id: 5, 
          title: 'Performance optimization', 
          description: 'Improve dashboard load time by 50%',
          requestedBy: 'Tech Lead',
          requestDate: '2024-10-20',
          priority: 'high',
          status: 'implemented',
          impact: {
            schedule: '+1 week',
            budget: '+$10,000',
            scope: 'Database indexing, caching layer',
          },
          affectedPhase: 'Development',
          approver: 'Project Sponsor',
          approvalDate: '2024-10-25',
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const getStatusBadge = (status: ChangeRequest['status']) => {
    switch (status) {
      case 'submitted': return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Submitted</Badge>;
      case 'under_review': return <Badge className="bg-blue-500"><AlertTriangle className="h-3 w-3 mr-1" />Under Review</Badge>;
      case 'approved': return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Approved</Badge>;
      case 'rejected': return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Rejected</Badge>;
      case 'implemented': return <Badge className="bg-purple-500"><CheckCircle className="h-3 w-3 mr-1" />Implemented</Badge>;
    }
  };

  const getPriorityBadge = (priority: ChangeRequest['priority']) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-600',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-gray-400',
    };
    return <Badge className={colors[priority]}>{priority}</Badge>;
  };

  const filteredRequests = requests.filter(r => {
    if (filterStatus !== 'all' && r.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: requests.length,
    submitted: requests.filter(r => r.status === 'submitted').length,
    underReview: requests.filter(r => r.status === 'under_review').length,
    approved: requests.filter(r => r.status === 'approved').length,
    rejected: requests.filter(r => r.status === 'rejected').length,
    implemented: requests.filter(r => r.status === 'implemented').length,
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
              <FileEdit className="h-6 w-6 text-blue-600" />
              Change Requests
            </h1>
            <p className="text-muted-foreground">Manage scope and requirement changes</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Submit Request
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-6 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Submitted</p>
              <p className="text-2xl font-bold">{stats.submitted}</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <p className="text-sm text-blue-700">Under Review</p>
              <p className="text-2xl font-bold text-blue-600">{stats.underReview}</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <p className="text-sm text-green-700">Approved</p>
              <p className="text-2xl font-bold text-green-600">{stats.approved}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Rejected</p>
              <p className="text-2xl font-bold text-red-600">{stats.rejected}</p>
            </CardContent>
          </Card>
          <Card className="border-purple-200 bg-purple-50">
            <CardContent className="pt-4">
              <p className="text-sm text-purple-700">Implemented</p>
              <p className="text-2xl font-bold text-purple-600">{stats.implemented}</p>
            </CardContent>
          </Card>
        </div>

        {/* Pending Review Alert */}
        {stats.underReview > 0 && (
          <Card className="border-blue-300 bg-blue-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="font-semibold text-blue-800">{stats.underReview} change request(s) awaiting review</p>
                  <p className="text-sm text-blue-700">Review and approve or reject to proceed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter */}
        <div className="flex gap-4">
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="submitted">Submitted</SelectItem>
              <SelectItem value="under_review">Under Review</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
              <SelectItem value="implemented">Implemented</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Change Requests List */}
        <Card>
          <CardHeader>
            <CardTitle>Change Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {filteredRequests.map((request) => (
                <div 
                  key={request.id} 
                  className={`p-4 border rounded-lg hover:bg-muted/50 ${
                    request.status === 'under_review' ? 'border-blue-200' :
                    request.status === 'rejected' ? 'border-red-200 bg-red-50/50' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-semibold">{request.title}</span>
                        {getPriorityBadge(request.priority)}
                        {getStatusBadge(request.status)}
                      </div>
                      <p className="text-sm text-muted-foreground">{request.description}</p>
                    </div>
                    <Badge variant="outline">{request.affectedPhase}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mb-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span>Schedule: {request.impact.schedule}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <DollarSign className="h-4 w-4 text-muted-foreground" />
                      <span>Budget: {request.impact.budget}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <FileEdit className="h-4 w-4 text-muted-foreground" />
                      <span>Scope: {request.impact.scope}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground border-t pt-3">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <User className="h-3 w-3" />
                        Requested by: {request.requestedBy}
                      </span>
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {request.requestDate}
                      </span>
                      {request.approver && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Approved by: {request.approver} ({request.approvalDate})
                        </span>
                      )}
                    </div>
                    <div className="flex gap-2">
                      {request.status === 'submitted' || request.status === 'under_review' ? (
                        <>
                          <Button variant="outline" size="sm" className="text-green-600">
                            <CheckCircle className="h-4 w-4 mr-1" />
                            Approve
                          </Button>
                          <Button variant="outline" size="sm" className="text-red-600">
                            <XCircle className="h-4 w-4 mr-1" />
                            Reject
                          </Button>
                        </>
                      ) : (
                        <Button variant="outline" size="sm">View Details</Button>
                      )}
                    </div>
                  </div>

                  {request.notes && (
                    <div className="mt-3 p-2 bg-muted rounded text-sm">
                      <strong>Notes:</strong> {request.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-blue-900 mb-2">Change Control Best Practices</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Document all impact assessments before approval</li>
              <li>• Get formal sign-off from Change Advisory Board</li>
              <li>• Track all changes for project audit trail</li>
              <li>• Communicate approved changes to all stakeholders</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Submit Request Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Submit Change Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input 
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="Brief description of the change"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="Detailed description of what needs to change and why..."
                rows={3}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Priority</label>
                <Select value={form.priority} onValueChange={(v) => setForm({...form, priority: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Affected Phase</label>
                <Select value={form.affectedPhase} onValueChange={(v) => setForm({...form, affectedPhase: v})}>
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
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Impact Assessment</label>
              <div className="grid grid-cols-3 gap-4">
                <Input 
                  value={form.scheduleImpact}
                  onChange={(e) => setForm({...form, scheduleImpact: e.target.value})}
                  placeholder="Schedule impact (e.g., +2 weeks)"
                />
                <Input 
                  value={form.budgetImpact}
                  onChange={(e) => setForm({...form, budgetImpact: e.target.value})}
                  placeholder="Budget impact (e.g., +$10,000)"
                />
                <Input 
                  value={form.scopeImpact}
                  onChange={(e) => setForm({...form, scopeImpact: e.target.value})}
                  placeholder="Scope impact"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button disabled={!form.title || !form.description}>Submit Request</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="waterfall" />
    </div>
  );
};

export default WaterfallChangeRequests;
