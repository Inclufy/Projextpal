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
  Wrench, Bug, Zap, Shield, Plus, Clock,
  CheckCircle, AlertTriangle, Loader2, TrendingUp
} from 'lucide-react';

interface MaintenanceItem {
  id: number;
  title: string;
  description: string;
  type: 'bug_fix' | 'enhancement' | 'security' | 'performance';
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  reportedDate: string;
  resolvedDate?: string;
  assignee: string;
}

const WaterfallMaintenance = () => {
  const { id } = useParams<{ id: string }>();
  
  const [items, setItems] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [form, setForm] = useState({
    title: '',
    description: '',
    type: 'bug_fix',
    priority: 'medium',
    assignee: '',
  });

  useEffect(() => {
    loadMaintenanceItems();
  }, [id]);

  const loadMaintenanceItems = async () => {
    setLoading(true);
    setTimeout(() => {
      setItems([
        { id: 1, title: 'Login timeout issue', description: 'Users getting logged out after 5 minutes', type: 'bug_fix', priority: 'high', status: 'in_progress', reportedDate: '2024-12-10', assignee: 'James Brown' },
        { id: 2, title: 'Security patch CVE-2024-1234', description: 'Apply security patch for dependency', type: 'security', priority: 'critical', status: 'open', reportedDate: '2024-12-12', assignee: 'Security Team' },
        { id: 3, title: 'Dashboard loading optimization', description: 'Improve initial load time by 40%', type: 'performance', priority: 'medium', status: 'in_progress', reportedDate: '2024-12-08', assignee: 'Emma Wilson' },
        { id: 4, title: 'Export to CSV feature', description: 'Add ability to export reports to CSV', type: 'enhancement', priority: 'low', status: 'open', reportedDate: '2024-12-11', assignee: 'Mike Johnson' },
        { id: 5, title: 'Date picker bug on Safari', description: 'Calendar not displaying correctly', type: 'bug_fix', priority: 'medium', status: 'resolved', reportedDate: '2024-12-05', resolvedDate: '2024-12-09', assignee: 'James Brown' },
        { id: 6, title: 'Memory leak in notifications', description: 'WebSocket connections not closing', type: 'bug_fix', priority: 'high', status: 'resolved', reportedDate: '2024-12-01', resolvedDate: '2024-12-07', assignee: 'Emma Wilson' },
      ]);
      setLoading(false);
    }, 500);
  };

  const getTypeBadge = (type: MaintenanceItem['type']) => {
    const config: Record<string, { icon: any; color: string; label: string }> = {
      bug_fix: { icon: Bug, color: 'bg-red-500', label: 'Bug Fix' },
      enhancement: { icon: Zap, color: 'bg-blue-500', label: 'Enhancement' },
      security: { icon: Shield, color: 'bg-purple-500', label: 'Security' },
      performance: { icon: TrendingUp, color: 'bg-orange-500', label: 'Performance' },
    };
    const { icon: Icon, color, label } = config[type];
    return (
      <Badge className={color}>
        <Icon className="h-3 w-3 mr-1" />
        {label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: MaintenanceItem['priority']) => {
    const colors: Record<string, string> = {
      critical: 'bg-red-600',
      high: 'bg-orange-500',
      medium: 'bg-yellow-500',
      low: 'bg-gray-400',
    };
    return <Badge className={colors[priority]}>{priority}</Badge>;
  };

  const getStatusBadge = (status: MaintenanceItem['status']) => {
    switch (status) {
      case 'open': return <Badge variant="outline">Open</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500">In Progress</Badge>;
      case 'resolved': return <Badge className="bg-green-500">Resolved</Badge>;
      case 'closed': return <Badge variant="secondary">Closed</Badge>;
    }
  };

  const filteredItems = items.filter(item => {
    if (filterType !== 'all' && item.type !== filterType) return false;
    if (filterStatus !== 'all' && item.status !== filterStatus) return false;
    return true;
  });

  const stats = {
    total: items.length,
    open: items.filter(i => i.status === 'open').length,
    inProgress: items.filter(i => i.status === 'in_progress').length,
    resolved: items.filter(i => i.status === 'resolved' || i.status === 'closed').length,
    critical: items.filter(i => i.priority === 'critical' && i.status !== 'resolved' && i.status !== 'closed').length,
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
              <Wrench className="h-6 w-6 text-blue-600" />
              Maintenance Phase
            </h1>
            <p className="text-muted-foreground">Post-deployment support and improvements</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Log Issue
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Items</p>
              <p className="text-2xl font-bold">{stats.total}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Open</p>
              <p className="text-2xl font-bold text-orange-600">{stats.open}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">{stats.inProgress}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Resolved</p>
              <p className="text-2xl font-bold text-green-600">{stats.resolved}</p>
            </CardContent>
          </Card>
          <Card className={stats.critical > 0 ? 'border-red-300 bg-red-50' : ''}>
            <CardContent className="pt-4">
              <p className="text-sm text-red-700">Critical Open</p>
              <p className="text-2xl font-bold text-red-600">{stats.critical}</p>
            </CardContent>
          </Card>
        </div>

        {/* Critical Issues Alert */}
        {stats.critical > 0 && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">{stats.critical} critical issue(s) require immediate attention</p>
                  <p className="text-sm text-red-700">Address these issues as top priority</p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <div className="flex gap-4">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="bug_fix">Bug Fixes</SelectItem>
              <SelectItem value="enhancement">Enhancements</SelectItem>
              <SelectItem value="security">Security</SelectItem>
              <SelectItem value="performance">Performance</SelectItem>
            </SelectContent>
          </Select>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              <SelectItem value="open">Open</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="resolved">Resolved</SelectItem>
              <SelectItem value="closed">Closed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Maintenance Items */}
        <Card>
          <CardHeader>
            <CardTitle>Maintenance Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {filteredItems.map((item) => (
                <div 
                  key={item.id} 
                  className={`flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 ${
                    item.priority === 'critical' && item.status !== 'resolved' ? 'border-red-200 bg-red-50/50' : ''
                  }`}
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{item.title}</span>
                      {getTypeBadge(item.type)}
                      {getPriorityBadge(item.priority)}
                      {getStatusBadge(item.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{item.description}</p>
                    <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        Reported: {item.reportedDate}
                      </span>
                      {item.resolvedDate && (
                        <span className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          Resolved: {item.resolvedDate}
                        </span>
                      )}
                      <span>Assignee: {item.assignee}</span>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">View Details</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* SLA Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>SLA Metrics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Avg Resolution Time</p>
                <p className="text-xl font-bold">3.2 days</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Critical Response</p>
                <p className="text-xl font-bold text-green-600">&lt; 4 hours</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">SLA Compliance</p>
                <p className="text-xl font-bold text-green-600">98%</p>
              </div>
              <div className="p-4 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">Customer Satisfaction</p>
                <p className="text-xl font-bold text-blue-600">4.5/5</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-blue-900 mb-2">Maintenance Best Practices</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Prioritize security issues and critical bugs</li>
              <li>• Document all changes for future reference</li>
              <li>• Follow change management process for updates</li>
              <li>• Plan major enhancements for future releases</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Log Issue Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Log Maintenance Issue</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Title</label>
              <Input 
                value={form.title}
                onChange={(e) => setForm({...form, title: e.target.value})}
                placeholder="Brief description of the issue"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={form.description}
                onChange={(e) => setForm({...form, description: e.target.value})}
                placeholder="Detailed description..."
                rows={3}
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
                    <SelectItem value="bug_fix">Bug Fix</SelectItem>
                    <SelectItem value="enhancement">Enhancement</SelectItem>
                    <SelectItem value="security">Security</SelectItem>
                    <SelectItem value="performance">Performance</SelectItem>
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
            <div>
              <label className="text-sm font-medium">Assignee</label>
              <Input 
                value={form.assignee}
                onChange={(e) => setForm({...form, assignee: e.target.value})}
                placeholder="Team member name"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button disabled={!form.title}>Log Issue</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="waterfall" />
    </div>
  );
};

export default WaterfallMaintenance;
