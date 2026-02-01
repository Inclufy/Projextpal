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
  TestTube, CheckCircle, XCircle, Clock, AlertTriangle,
  Plus, Bug, FileCheck, Loader2, Play, BarChart3
} from 'lucide-react';

interface TestCase {
  id: number;
  name: string;
  description: string;
  type: 'unit' | 'integration' | 'system' | 'acceptance';
  status: 'pending' | 'passed' | 'failed' | 'blocked';
  priority: 'critical' | 'high' | 'medium' | 'low';
  assignee: string;
  requirement_id?: string;
}

const WaterfallTesting = () => {
  const { id } = useParams<{ id: string }>();
  
  const [testCases, setTestCases] = useState<TestCase[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [form, setForm] = useState({
    name: '',
    description: '',
    type: 'unit',
    priority: 'medium',
    assignee: '',
    requirement_id: '',
  });

  useEffect(() => {
    loadTestCases();
  }, [id]);

  const loadTestCases = async () => {
    setLoading(true);
    setTimeout(() => {
      setTestCases([
        { id: 1, name: 'User login validation', description: 'Verify login with valid credentials', type: 'unit', status: 'passed', priority: 'critical', assignee: 'David Kim', requirement_id: 'REQ-001' },
        { id: 2, name: 'Password strength check', description: 'Test password requirements', type: 'unit', status: 'passed', priority: 'high', assignee: 'David Kim', requirement_id: 'REQ-001' },
        { id: 3, name: 'OAuth flow integration', description: 'End-to-end OAuth login', type: 'integration', status: 'failed', priority: 'critical', assignee: 'David Kim', requirement_id: 'REQ-002' },
        { id: 4, name: 'Dashboard data loading', description: 'Verify dashboard loads correctly', type: 'integration', status: 'passed', priority: 'high', assignee: 'Sarah Lee', requirement_id: 'REQ-005' },
        { id: 5, name: 'Report generation', description: 'Test PDF report export', type: 'system', status: 'pending', priority: 'medium', assignee: 'Sarah Lee', requirement_id: 'REQ-010' },
        { id: 6, name: 'User workflow E2E', description: 'Complete user journey test', type: 'acceptance', status: 'pending', priority: 'critical', assignee: 'David Kim', requirement_id: 'REQ-001' },
        { id: 7, name: 'Performance under load', description: '100 concurrent users', type: 'system', status: 'blocked', priority: 'high', assignee: 'Sarah Lee', requirement_id: 'REQ-015' },
        { id: 8, name: 'Data migration validation', description: 'Verify data integrity after migration', type: 'system', status: 'passed', priority: 'critical', assignee: 'David Kim', requirement_id: 'REQ-020' },
      ]);
      setLoading(false);
    }, 500);
  };

  const getStatusBadge = (status: TestCase['status']) => {
    switch (status) {
      case 'passed': return <Badge className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Passed</Badge>;
      case 'failed': return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Failed</Badge>;
      case 'blocked': return <Badge className="bg-orange-500"><AlertTriangle className="h-3 w-3 mr-1" />Blocked</Badge>;
      default: return <Badge variant="outline"><Clock className="h-3 w-3 mr-1" />Pending</Badge>;
    }
  };

  const getTypeBadge = (type: TestCase['type']) => {
    const colors: Record<string, string> = {
      unit: 'bg-blue-500',
      integration: 'bg-purple-500',
      system: 'bg-teal-500',
      acceptance: 'bg-pink-500',
    };
    return <Badge className={colors[type]}>{type}</Badge>;
  };

  const getPriorityBadge = (priority: TestCase['priority']) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-500',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-gray-400',
    };
    return <Badge variant="outline" className={`border-2 ${colors[priority].replace('bg-', 'border-')}`}>{priority}</Badge>;
  };

  const filteredTests = testCases.filter(tc => {
    if (filterType !== 'all' && tc.type !== filterType) return false;
    if (filterStatus !== 'all' && tc.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: testCases.length,
    passed: testCases.filter(t => t.status === 'passed').length,
    failed: testCases.filter(t => t.status === 'failed').length,
    pending: testCases.filter(t => t.status === 'pending').length,
    blocked: testCases.filter(t => t.status === 'blocked').length,
  };

  const passRate = stats.total > 0 ? Math.round((stats.passed / (stats.passed + stats.failed)) * 100) || 0 : 0;

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
              <TestTube className="h-6 w-6 text-blue-600" />
              Testing Phase
            </h1>
            <p className="text-muted-foreground">Test case management and execution</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <Play className="h-4 w-4 mr-2" />
              Run All Tests
            </Button>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Test Case
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Tests</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card className="border-green-200 bg-green-50">
            <CardContent className="pt-4">
              <p className="text-sm text-green-700">Passed</p>
              <p className="text-2xl font-bold text-green-600">{stats.passed}</p>
            </CardContent>
          </Card>
          <Card className="border-red-200 bg-red-50">
            <CardContent className="pt-4">
              <p className="text-sm text-red-700">Failed</p>
              <p className="text-2xl font-bold text-red-600">{stats.failed}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Pending</p>
              <p className="text-2xl font-bold">{stats.pending}</p>
            </CardContent>
          </Card>
          <Card className="border-blue-200 bg-blue-50">
            <CardContent className="pt-4">
              <p className="text-sm text-blue-700">Pass Rate</p>
              <p className="text-2xl font-bold text-blue-600">{passRate}%</p>
            </CardContent>
          </Card>
        </div>

        {/* Test Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Test Execution Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <span className="w-24 text-sm">Completed</span>
                <Progress value={(stats.passed + stats.failed) / stats.total * 100} className="flex-1" />
                <span className="text-sm font-medium">{stats.passed + stats.failed}/{stats.total}</span>
              </div>
              <div className="flex gap-2">
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-sm">Passed ({stats.passed})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span className="text-sm">Failed ({stats.failed})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-orange-500" />
                  <span className="text-sm">Blocked ({stats.blocked})</span>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 rounded bg-gray-300" />
                  <span className="text-sm">Pending ({stats.pending})</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="unit">Unit</SelectItem>
              <SelectItem value="integration">Integration</SelectItem>
              <SelectItem value="system">System</SelectItem>
              <SelectItem value="acceptance">Acceptance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="passed">Passed</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="blocked">Blocked</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Test Cases */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileCheck className="h-5 w-5" />
              Test Cases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredTests.map((test) => (
                <div key={test.id} className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 ${
                  test.status === 'failed' ? 'border-red-200 bg-red-50/50' : ''
                }`}>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{test.name}</span>
                      {getTypeBadge(test.type)}
                      {getPriorityBadge(test.priority)}
                      {getStatusBadge(test.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{test.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span>Assignee: {test.assignee}</span>
                      {test.requirement_id && <span>Requirement: {test.requirement_id}</span>}
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm">
                      <Play className="h-4 w-4" />
                    </Button>
                    {test.status === 'failed' && (
                      <Button variant="outline" size="sm" className="text-red-600">
                        <Bug className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-blue-900 mb-2">Waterfall Testing Best Practices</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Complete all testing before proceeding to deployment</li>
              <li>• Document all test results for audit trail</li>
              <li>• Link test cases to requirements for traceability</li>
              <li>• Get formal sign-off on test results before phase completion</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Add Test Case Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Test Case</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Test Name</label>
              <Input 
                value={form.name}
                onChange={(e) => setForm({...form, name: e.target.value})}
                placeholder="e.g., User login validation"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="Test case description..."
                rows={2}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Type</label>
                <Select value={form.type} onValueChange={(v) => setForm({...form, type: v})}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unit">Unit</SelectItem>
                    <SelectItem value="integration">Integration</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="acceptance">Acceptance</SelectItem>
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
                    <SelectItem value="critical">Critical</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Assignee</label>
                <Input 
                  value={form.assignee}
                  onChange={(e) => setForm({...form, assignee: e.target.value})}
                  placeholder="Tester name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Requirement ID</label>
                <Input 
                  value={form.requirement_id}
                  onChange={(e) => setForm({...form, requirement_id: e.target.value})}
                  placeholder="e.g., REQ-001"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button disabled={!form.name}>Add Test Case</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="waterfall" />
    </div>
  );
};

export default WaterfallTesting;
