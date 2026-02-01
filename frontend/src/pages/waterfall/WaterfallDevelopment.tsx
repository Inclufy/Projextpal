import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Code, CheckCircle, Clock, AlertTriangle, 
  GitBranch, Loader2, Play, Pause
} from 'lucide-react';

interface DevTask {
  id: number;
  title: string;
  module: string;
  assignee: { name: string; initials: string };
  status: 'not_started' | 'in_progress' | 'code_review' | 'completed';
  priority: 'high' | 'medium' | 'low';
  estimatedHours: number;
  actualHours: number;
  requirements: string[];
}

const WaterfallDevelopment = () => {
  const { id } = useParams<{ id: string }>();
  
  const [tasks, setTasks] = useState<DevTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTasks();
  }, [id]);

  const loadTasks = async () => {
    setLoading(true);
    setTimeout(() => {
      setTasks([
        { id: 1, title: 'User Authentication Module', module: 'Auth', assignee: { name: 'Emma Wilson', initials: 'EW' }, status: 'completed', priority: 'high', estimatedHours: 40, actualHours: 38, requirements: ['REQ-001', 'REQ-002'] },
        { id: 2, title: 'Role-based Access Control', module: 'Auth', assignee: { name: 'Emma Wilson', initials: 'EW' }, status: 'completed', priority: 'high', estimatedHours: 24, actualHours: 26, requirements: ['REQ-002'] },
        { id: 3, title: 'Dashboard Backend API', module: 'Core', assignee: { name: 'James Brown', initials: 'JB' }, status: 'completed', priority: 'high', estimatedHours: 32, actualHours: 30, requirements: ['REQ-003'] },
        { id: 4, title: 'Dashboard Frontend UI', module: 'Core', assignee: { name: 'Lisa Garcia', initials: 'LG' }, status: 'code_review', priority: 'high', estimatedHours: 40, actualHours: 35, requirements: ['REQ-003'] },
        { id: 5, title: 'Report Generation Service', module: 'Reports', assignee: { name: 'James Brown', initials: 'JB' }, status: 'in_progress', priority: 'medium', estimatedHours: 48, actualHours: 20, requirements: ['REQ-006'] },
        { id: 6, title: 'Data Encryption Layer', module: 'Security', assignee: { name: 'Emma Wilson', initials: 'EW' }, status: 'in_progress', priority: 'high', estimatedHours: 24, actualHours: 12, requirements: ['REQ-005'] },
        { id: 7, title: 'Audit Trail System', module: 'Security', assignee: { name: 'James Brown', initials: 'JB' }, status: 'not_started', priority: 'medium', estimatedHours: 32, actualHours: 0, requirements: ['REQ-007'] },
        { id: 8, title: 'REST API Integration', module: 'Integration', assignee: { name: 'Emma Wilson', initials: 'EW' }, status: 'not_started', priority: 'low', estimatedHours: 40, actualHours: 0, requirements: ['REQ-008'] },
      ]);
      setLoading(false);
    }, 500);
  };

  const getStatusBadge = (status: DevTask['status']) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500">Completed</Badge>;
      case 'code_review': return <Badge className="bg-purple-500">Code Review</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500">In Progress</Badge>;
      default: return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getPriorityBadge = (priority: DevTask['priority']) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-500">Medium</Badge>;
      default: return <Badge variant="outline">Low</Badge>;
    }
  };

  const stats = {
    totalTasks: tasks.length,
    completed: tasks.filter(t => t.status === 'completed').length,
    inProgress: tasks.filter(t => t.status === 'in_progress' || t.status === 'code_review').length,
    notStarted: tasks.filter(t => t.status === 'not_started').length,
    totalEstimated: tasks.reduce((sum, t) => sum + t.estimatedHours, 0),
    totalActual: tasks.reduce((sum, t) => sum + t.actualHours, 0),
  };

  const completionPercentage = (stats.completed / stats.totalTasks) * 100;

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

  // Group by module
  const modules = [...new Set(tasks.map(t => t.module))];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Code className="h-6 w-6 text-orange-600" />
              Development Phase
            </h1>
            <p className="text-muted-foreground">Implementation tracking and progress</p>
          </div>
          <Badge className="bg-orange-500 text-white text-sm px-3 py-1">
            In Progress
          </Badge>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Tasks</p>
              <p className="text-2xl font-bold">{stats.totalTasks}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Completed</p>
              <p className="text-2xl font-bold text-green-600">{stats.completed}</p>
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
              <p className="text-sm text-muted-foreground">Estimated Hours</p>
              <p className="text-2xl font-bold">{stats.totalEstimated}h</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Actual Hours</p>
              <p className={`text-2xl font-bold ${stats.totalActual > stats.totalEstimated ? 'text-red-600' : 'text-green-600'}`}>
                {stats.totalActual}h
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Progress */}
        <Card className="border-orange-200 bg-orange-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-2">
              <span className="font-medium">Development Progress</span>
              <span className="font-bold text-orange-600">{Math.round(completionPercentage)}%</span>
            </div>
            <Progress value={completionPercentage} className="h-3" />
          </CardContent>
        </Card>

        {/* Tasks by Module */}
        {modules.map((module) => {
          const moduleTasks = tasks.filter(t => t.module === module);
          const moduleCompleted = moduleTasks.filter(t => t.status === 'completed').length;
          
          return (
            <Card key={module}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <GitBranch className="h-5 w-5" />
                    {module} Module
                  </CardTitle>
                  <Badge variant="outline">
                    {moduleCompleted}/{moduleTasks.length} complete
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {moduleTasks.map((task) => (
                    <div key={task.id} className="flex items-center gap-4 p-3 border rounded-lg hover:bg-muted/50">
                      <div className="flex-shrink-0">
                        {task.status === 'completed' ? (
                          <CheckCircle className="h-5 w-5 text-green-500" />
                        ) : task.status === 'in_progress' || task.status === 'code_review' ? (
                          <Play className="h-5 w-5 text-blue-500" />
                        ) : (
                          <Pause className="h-5 w-5 text-gray-400" />
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{task.title}</span>
                          {getStatusBadge(task.status)}
                          {getPriorityBadge(task.priority)}
                        </div>
                        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                          <span>Requirements: {task.requirements.join(', ')}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-8 w-8">
                          <AvatarFallback className="text-xs bg-orange-100 text-orange-700">
                            {task.assignee.initials}
                          </AvatarFallback>
                        </Avatar>
                        <div className="text-right text-sm">
                          <p className={task.actualHours > task.estimatedHours ? 'text-red-600' : ''}>
                            {task.actualHours}h / {task.estimatedHours}h
                          </p>
                          <Progress 
                            value={Math.min((task.actualHours / task.estimatedHours) * 100, 100)} 
                            className="h-1 w-16 mt-1"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          );
        })}

        {/* Variance Alert */}
        {stats.totalActual > stats.totalEstimated * 0.9 && (
          <Card className="border-yellow-300 bg-yellow-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-yellow-600" />
                <div>
                  <p className="font-medium text-yellow-800">Schedule Variance Warning</p>
                  <p className="text-sm text-yellow-700">
                    Actual hours ({stats.totalActual}h) approaching estimated hours ({stats.totalEstimated}h)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-orange-50 border-orange-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-orange-900 mb-2">Development Phase Best Practices</h3>
            <ul className="space-y-1 text-sm text-orange-800">
              <li>• Follow approved design specifications strictly</li>
              <li>• Conduct code reviews before marking tasks complete</li>
              <li>• Update time tracking regularly for accurate estimates</li>
              <li>• Document any deviations from the design</li>
            </ul>
          </CardContent>
        </Card>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="waterfall" />
    </div>
  );
};

export default WaterfallDevelopment;
