import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Rocket, CheckCircle, Clock, AlertTriangle, Server,
  Database, Shield, FileCheck, Loader2, Play, Users
} from 'lucide-react';

interface ChecklistItem {
  id: number;
  category: string;
  item: string;
  completed: boolean;
  required: boolean;
  assignee: string;
}

interface DeploymentStep {
  id: number;
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startTime?: string;
  endTime?: string;
  logs?: string[];
}

const WaterfallDeployment = () => {
  const { id } = useParams<{ id: string }>();
  
  const [checklist, setChecklist] = useState<ChecklistItem[]>([]);
  const [deploymentSteps, setDeploymentSteps] = useState<DeploymentStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [deploymentStatus, setDeploymentStatus] = useState<'ready' | 'in_progress' | 'completed' | 'failed'>('ready');

  useEffect(() => {
    loadDeploymentData();
  }, [id]);

  const loadDeploymentData = async () => {
    setLoading(true);
    setTimeout(() => {
      setChecklist([
        { id: 1, category: 'Testing', item: 'All test cases passed', completed: true, required: true, assignee: 'QA Team' },
        { id: 2, category: 'Testing', item: 'Performance tests completed', completed: true, required: true, assignee: 'QA Team' },
        { id: 3, category: 'Testing', item: 'Security scan completed', completed: true, required: true, assignee: 'Security Team' },
        { id: 4, category: 'Documentation', item: 'Release notes prepared', completed: true, required: true, assignee: 'Tech Writer' },
        { id: 5, category: 'Documentation', item: 'User manual updated', completed: false, required: true, assignee: 'Tech Writer' },
        { id: 6, category: 'Documentation', item: 'API documentation updated', completed: true, required: false, assignee: 'Dev Team' },
        { id: 7, category: 'Infrastructure', item: 'Production environment ready', completed: true, required: true, assignee: 'DevOps' },
        { id: 8, category: 'Infrastructure', item: 'Database backup completed', completed: true, required: true, assignee: 'DBA' },
        { id: 9, category: 'Infrastructure', item: 'Rollback plan documented', completed: true, required: true, assignee: 'DevOps' },
        { id: 10, category: 'Approval', item: 'Stakeholder sign-off', completed: false, required: true, assignee: 'Project Manager' },
        { id: 11, category: 'Approval', item: 'Change Advisory Board approval', completed: false, required: true, assignee: 'CAB' },
      ]);
      setDeploymentSteps([
        { id: 1, name: 'Pre-deployment checks', status: 'completed', startTime: '14:00', endTime: '14:15' },
        { id: 2, name: 'Database migrations', status: 'completed', startTime: '14:15', endTime: '14:25' },
        { id: 3, name: 'Deploy backend services', status: 'in_progress', startTime: '14:25' },
        { id: 4, name: 'Deploy frontend', status: 'pending' },
        { id: 5, name: 'Smoke tests', status: 'pending' },
        { id: 6, name: 'DNS switch', status: 'pending' },
        { id: 7, name: 'Post-deployment verification', status: 'pending' },
      ]);
      setDeploymentStatus('in_progress');
      setLoading(false);
    }, 500);
  };

  const toggleChecklistItem = (itemId: number) => {
    setChecklist(checklist.map(item =>
      item.id === itemId ? { ...item, completed: !item.completed } : item
    ));
  };

  const getStepStatusIcon = (status: DeploymentStep['status']) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'in_progress': return <Loader2 className="h-5 w-5 text-blue-500 animate-spin" />;
      case 'failed': return <AlertTriangle className="h-5 w-5 text-red-500" />;
      default: return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const categories = [...new Set(checklist.map(c => c.category))];
  const requiredItems = checklist.filter(c => c.required);
  const completedRequired = requiredItems.filter(c => c.completed).length;
  const isReadyToDeploy = completedRequired === requiredItems.length;

  const completedSteps = deploymentSteps.filter(s => s.status === 'completed').length;
  const deployProgress = (completedSteps / deploymentSteps.length) * 100;

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
              <Rocket className="h-6 w-6 text-blue-600" />
              Deployment Phase
            </h1>
            <p className="text-muted-foreground">Production deployment and release management</p>
          </div>
          <Button 
            disabled={!isReadyToDeploy || deploymentStatus === 'in_progress'}
            className="bg-green-600 hover:bg-green-700"
          >
            <Play className="h-4 w-4 mr-2" />
            {deploymentStatus === 'in_progress' ? 'Deployment in Progress...' : 'Start Deployment'}
          </Button>
        </div>

        {/* Deployment Status */}
        <Card className={`border-2 ${
          deploymentStatus === 'completed' ? 'border-green-300 bg-green-50' :
          deploymentStatus === 'in_progress' ? 'border-blue-300 bg-blue-50' :
          deploymentStatus === 'failed' ? 'border-red-300 bg-red-50' :
          'border-gray-200'
        }`}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {deploymentStatus === 'in_progress' ? (
                  <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                ) : deploymentStatus === 'completed' ? (
                  <CheckCircle className="h-8 w-8 text-green-600" />
                ) : (
                  <Rocket className="h-8 w-8 text-gray-400" />
                )}
                <div>
                  <h3 className="font-semibold text-lg">
                    {deploymentStatus === 'in_progress' ? 'Deployment in Progress' :
                     deploymentStatus === 'completed' ? 'Deployment Completed' :
                     'Ready for Deployment'}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Release v2.0.0 - Production Environment
                  </p>
                </div>
              </div>
              <Badge className={
                deploymentStatus === 'completed' ? 'bg-green-500' :
                deploymentStatus === 'in_progress' ? 'bg-blue-500' :
                'bg-gray-500'
              }>
                {deploymentStatus.replace('_', ' ').toUpperCase()}
              </Badge>
            </div>
            <Progress value={deployProgress} className="h-2" />
            <p className="text-sm text-muted-foreground mt-2">
              {completedSteps} of {deploymentSteps.length} steps completed
            </p>
          </CardContent>
        </Card>

        <div className="grid grid-cols-2 gap-6">
          {/* Pre-deployment Checklist */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <FileCheck className="h-5 w-5" />
                  Pre-Deployment Checklist
                </span>
                <Badge variant={isReadyToDeploy ? 'default' : 'destructive'}>
                  {completedRequired}/{requiredItems.length} Required
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {categories.map((category) => (
                <div key={category}>
                  <h4 className="font-medium text-sm text-muted-foreground mb-2">{category}</h4>
                  <div className="space-y-2">
                    {checklist.filter(c => c.category === category).map((item) => (
                      <div 
                        key={item.id} 
                        className={`flex items-center gap-3 p-2 rounded ${item.completed ? 'bg-green-50' : ''}`}
                      >
                        <Checkbox 
                          checked={item.completed}
                          onCheckedChange={() => toggleChecklistItem(item.id)}
                        />
                        <div className="flex-1">
                          <span className={item.completed ? 'line-through text-muted-foreground' : ''}>
                            {item.item}
                          </span>
                          {item.required && !item.completed && (
                            <Badge variant="destructive" className="ml-2 text-xs">Required</Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">{item.assignee}</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Deployment Steps */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Server className="h-5 w-5" />
                Deployment Steps
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {deploymentSteps.map((step, idx) => (
                  <div 
                    key={step.id} 
                    className={`flex items-center gap-3 p-3 rounded-lg border ${
                      step.status === 'completed' ? 'bg-green-50 border-green-200' :
                      step.status === 'in_progress' ? 'bg-blue-50 border-blue-200' :
                      step.status === 'failed' ? 'bg-red-50 border-red-200' :
                      ''
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-muted">
                      {getStepStatusIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium">{step.name}</p>
                      {step.startTime && (
                        <p className="text-xs text-muted-foreground">
                          Started: {step.startTime}
                          {step.endTime && ` - Completed: ${step.endTime}`}
                        </p>
                      )}
                    </div>
                    <Badge variant="outline">Step {idx + 1}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Environment Info */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Server className="h-8 w-8 text-blue-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Target Environment</p>
                  <p className="font-semibold">Production</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Database className="h-8 w-8 text-green-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Database</p>
                  <p className="font-semibold">PostgreSQL 15</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <Shield className="h-8 w-8 text-purple-500" />
                <div>
                  <p className="text-sm text-muted-foreground">Security</p>
                  <p className="font-semibold">TLS 1.3 Enabled</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-blue-900 mb-2">Waterfall Deployment Best Practices</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Complete all checklist items before deployment</li>
              <li>• Have rollback plan ready and tested</li>
              <li>• Schedule deployment during low-traffic periods</li>
              <li>• Document all deployment steps and outcomes</li>
            </ul>
          </CardContent>
        </Card>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="waterfall" />
    </div>
  );
};

export default WaterfallDeployment;
