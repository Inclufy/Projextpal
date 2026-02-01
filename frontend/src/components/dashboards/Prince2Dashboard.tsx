import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { 
  Crown, FileText, CheckCircle2, Clock, AlertCircle, 
  Users, Calendar, ArrowRight, Shield, FileCheck
} from 'lucide-react';

interface Prince2DashboardProps {
  project: any;
}

const Prince2Dashboard = ({ project }: Prince2DashboardProps) => {
  const stages = [
    { name: 'Starting Up', status: 'completed', progress: 100 },
    { name: 'Initiating', status: 'completed', progress: 100 },
    { name: 'Stage 1: Analysis', status: 'completed', progress: 100 },
    { name: 'Stage 2: Design', status: 'current', progress: 65 },
    { name: 'Stage 3: Build', status: 'upcoming', progress: 0 },
    { name: 'Closing', status: 'upcoming', progress: 0 },
  ];

  const documents = [
    { name: 'Project Brief', status: 'approved', date: '2025-10-15' },
    { name: 'Business Case', status: 'approved', date: '2025-10-20' },
    { name: 'Project Initiation Document', status: 'approved', date: '2025-11-01' },
    { name: 'Stage 2 Plan', status: 'pending', date: null },
    { name: 'Highlight Report (Week 8)', status: 'draft', date: null },
  ];

  const exceptions = [
    { id: 1, title: 'Budget variance exceeds tolerance', severity: 'high', raised: '2025-12-05' },
  ];

  const projectBoard = [
    { role: 'Executive', name: 'Sarah Johnson', status: 'active' },
    { role: 'Senior User', name: 'Mike Chen', status: 'active' },
    { role: 'Senior Supplier', name: 'David Williams', status: 'active' },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle2 className="h-5 w-5 text-green-500" />;
      case 'current': return <Clock className="h-5 w-5 text-blue-500" />;
      case 'upcoming': return <div className="h-5 w-5 rounded-full border-2 border-gray-300" />;
      default: return null;
    }
  };

  const getDocStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-100 text-green-700';
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'draft': return 'bg-gray-100 text-gray-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const currentStage = stages.find(s => s.status === 'current');

  return (
    <div className="space-y-6">
      {/* PRINCE2 Header */}
      <div className="bg-gradient-to-r from-purple-600 to-violet-600 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Crown className="h-6 w-6" />
              <h2 className="text-2xl font-bold">PRINCE2 Project</h2>
            </div>
            <p className="text-purple-200">Controlled Environments Management</p>
          </div>
          <div className="text-right">
            <div className="text-lg font-semibold">Current Stage</div>
            <div className="text-2xl font-bold">{currentStage?.name}</div>
          </div>
        </div>
      </div>

      {/* Stage Gate Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Stage Gate Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="relative">
            <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200" />
            <div className="relative flex justify-between">
              {stages.map((stage, index) => (
                <div key={stage.name} className="flex flex-col items-center" style={{ width: `${100/stages.length}%` }}>
                  <div className={`relative z-10 h-10 w-10 rounded-full flex items-center justify-center ${
                    stage.status === 'completed' ? 'bg-green-500' :
                    stage.status === 'current' ? 'bg-blue-500' :
                    'bg-gray-200'
                  }`}>
                    {stage.status === 'completed' ? (
                      <CheckCircle2 className="h-5 w-5 text-white" />
                    ) : stage.status === 'current' ? (
                      <Clock className="h-5 w-5 text-white" />
                    ) : (
                      <span className="text-gray-500 text-sm">{index + 1}</span>
                    )}
                  </div>
                  <div className="mt-2 text-center">
                    <p className={`text-xs font-medium ${stage.status === 'current' ? 'text-blue-600' : ''}`}>
                      {stage.name}
                    </p>
                    {stage.status === 'current' && (
                      <p className="text-xs text-muted-foreground">{stage.progress}%</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Project Board & Documents */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Project Board */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Project Board
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {projectBoard.map((member) => (
                <div key={member.role} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div>
                    <p className="font-medium">{member.name}</p>
                    <p className="text-sm text-muted-foreground">{member.role}</p>
                  </div>
                  <Badge variant="outline" className="bg-green-50 text-green-700">
                    Active
                  </Badge>
                </div>
              ))}
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
                  <div>
                    <p className="font-medium">Project Manager</p>
                    <p className="text-sm text-muted-foreground">Sami Loukile</p>
                  </div>
                  <Badge className="bg-primary">You</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Management Products */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Management Products
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {documents.map((doc) => (
                <div key={doc.name} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <FileCheck className="h-5 w-5 text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium">{doc.name}</p>
                      {doc.date && (
                        <p className="text-xs text-muted-foreground">{doc.date}</p>
                      )}
                    </div>
                  </div>
                  <Badge className={getDocStatusColor(doc.status)}>
                    {doc.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exception Report */}
      {exceptions.length > 0 && (
        <Card className="border-red-200 bg-red-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-red-700">
              <AlertCircle className="h-5 w-5" />
              Exception Report
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {exceptions.map((exception) => (
                <div key={exception.id} className="flex items-center justify-between p-4 bg-white rounded-lg border border-red-200">
                  <div>
                    <p className="font-medium text-red-700">{exception.title}</p>
                    <p className="text-sm text-muted-foreground">Raised: {exception.raised}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="destructive">High Priority</Badge>
                    <Button size="sm" variant="outline">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tolerances */}
      <Card>
        <CardHeader>
          <CardTitle>Stage Tolerances</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Time</p>
              <p className="text-lg font-bold">±2 weeks</p>
              <Progress value={60} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">Within tolerance</p>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <p className="text-sm text-muted-foreground">Cost</p>
              <p className="text-lg font-bold text-red-600">±$5,000</p>
              <Progress value={95} className="mt-2 h-2 bg-red-200" />
              <p className="text-xs text-red-600 mt-1">Near limit!</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Scope</p>
              <p className="text-lg font-bold">±5%</p>
              <Progress value={40} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">Within tolerance</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Risk</p>
              <p className="text-lg font-bold">Medium</p>
              <Progress value={50} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">Acceptable</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Prince2Dashboard;
