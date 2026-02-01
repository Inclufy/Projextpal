import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Columns, Clock, User, Tag, AlertTriangle, 
  CheckCircle, Loader2, Plus, MoreVertical
} from 'lucide-react';

interface Task {
  id: number;
  title: string;
  description: string;
  type: 'story' | 'task' | 'bug';
  points: number;
  assignee?: { name: string; initials: string };
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'high' | 'medium' | 'low';
  is_blocked?: boolean;
}

const AgileIterationBoard = () => {
  const { id } = useParams<{ id: string }>();
  
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [iteration, setIteration] = useState({
    name: 'Iteration 5',
    startDate: '2024-12-02',
    endDate: '2024-12-16',
    daysRemaining: 5,
    commitment: 34,
    completed: 21,
  });

  const columns = [
    { id: 'todo', title: 'To Do', color: 'border-gray-300' },
    { id: 'in_progress', title: 'In Progress', color: 'border-yellow-400' },
    { id: 'review', title: 'Review', color: 'border-blue-400' },
    { id: 'done', title: 'Done', color: 'border-green-400' },
  ];

  useEffect(() => {
    loadTasks();
  }, [id]);

  const loadTasks = async () => {
    setLoading(true);
    setTimeout(() => {
      setTasks([
        // To Do
        { id: 1, title: 'Setup CI/CD pipeline', description: 'Configure GitHub Actions', type: 'task', points: 3, status: 'todo', priority: 'high', assignee: { name: 'Mike Johnson', initials: 'MJ' } },
        { id: 2, title: 'Design settings page', description: 'Create mockups for user settings', type: 'task', points: 2, status: 'todo', priority: 'medium', assignee: { name: 'Lisa Garcia', initials: 'LG' } },
        
        // In Progress
        { id: 3, title: 'OAuth integration', description: 'Google and GitHub login', type: 'story', points: 8, status: 'in_progress', priority: 'high', assignee: { name: 'Emma Wilson', initials: 'EW' } },
        { id: 4, title: 'Fix date picker bug', description: 'Calendar not showing correctly', type: 'bug', points: 2, status: 'in_progress', priority: 'high', assignee: { name: 'James Brown', initials: 'JB' }, is_blocked: true },
        { id: 5, title: 'Activity timeline', description: 'Recent activity feed', type: 'story', points: 5, status: 'in_progress', priority: 'medium', assignee: { name: 'Mike Johnson', initials: 'MJ' } },
        
        // Review
        { id: 6, title: 'Project overview widget', description: 'Summary cards on dashboard', type: 'story', points: 3, status: 'review', priority: 'high', assignee: { name: 'Emma Wilson', initials: 'EW' } },
        { id: 7, title: 'API documentation', description: 'Document all endpoints', type: 'task', points: 3, status: 'review', priority: 'low', assignee: { name: 'David Kim', initials: 'DK' } },
        
        // Done
        { id: 8, title: 'Login page UI', description: 'Clean login page design', type: 'story', points: 5, status: 'done', priority: 'high', assignee: { name: 'Lisa Garcia', initials: 'LG' } },
        { id: 9, title: 'Database schema', description: 'Initial database setup', type: 'task', points: 3, status: 'done', priority: 'high', assignee: { name: 'James Brown', initials: 'JB' } },
      ]);
      setLoading(false);
    }, 500);
  };

  const getTypeBadge = (type: Task['type']) => {
    const colors: Record<string, string> = {
      story: 'bg-blue-500',
      task: 'bg-gray-500',
      bug: 'bg-red-500',
    };
    return <Badge className={`${colors[type]} text-xs`}>{type}</Badge>;
  };

  const getPriorityIndicator = (priority: Task['priority']) => {
    const colors: Record<string, string> = {
      high: 'bg-red-500',
      medium: 'bg-yellow-500',
      low: 'bg-gray-400',
    };
    return <div className={`w-1 h-full absolute left-0 top-0 rounded-l ${colors[priority]}`} />;
  };

  const getColumnTasks = (columnId: string) => tasks.filter(t => t.status === columnId);
  const getColumnPoints = (columnId: string) => getColumnTasks(columnId).reduce((sum, t) => sum + t.points, 0);

  const progress = (iteration.completed / iteration.commitment) * 100;

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Columns className="h-6 w-6 text-emerald-600" />
              Iteration Board
            </h1>
            <p className="text-muted-foreground">Track work in the current iteration</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant="outline" className="text-lg px-4 py-1">
              {iteration.name}
            </Badge>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {iteration.daysRemaining} days left
            </Badge>
          </div>
        </div>

        {/* Iteration Progress */}
        <Card className="bg-emerald-50/50 border-emerald-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-4">
                <span className="font-medium">Iteration Progress</span>
                <span className="text-sm text-muted-foreground">
                  {iteration.completed} / {iteration.commitment} points
                </span>
              </div>
              <span className="font-bold text-emerald-600">{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-3" />
          </CardContent>
        </Card>

        {/* Board */}
        <div className="grid grid-cols-4 gap-4">
          {columns.map((column) => {
            const columnTasks = getColumnTasks(column.id);
            const columnPoints = getColumnPoints(column.id);
            
            return (
              <div key={column.id} className="space-y-3">
                {/* Column Header */}
                <div className={`p-3 rounded-lg bg-muted/50 border-t-4 ${column.color}`}>
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold">{column.title}</h3>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{columnTasks.length}</Badge>
                      <Badge variant="outline" className="font-mono">{columnPoints} pts</Badge>
                    </div>
                  </div>
                </div>

                {/* Tasks */}
                <div className="space-y-2 min-h-[400px]">
                  {columnTasks.map((task) => (
                    <Card 
                      key={task.id} 
                      className={`relative overflow-hidden cursor-pointer hover:shadow-md transition-shadow ${task.is_blocked ? 'border-red-300 bg-red-50' : ''}`}
                    >
                      {getPriorityIndicator(task.priority)}
                      <CardContent className="p-3 pl-4">
                        <div className="flex items-start justify-between mb-2">
                          {getTypeBadge(task.type)}
                          <Button variant="ghost" size="icon" className="h-6 w-6">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </div>
                        
                        <h4 className="font-medium text-sm mb-1">{task.title}</h4>
                        <p className="text-xs text-muted-foreground mb-3">{task.description}</p>
                        
                        {task.is_blocked && (
                          <div className="flex items-center gap-1 text-red-600 text-xs mb-2">
                            <AlertTriangle className="h-3 w-3" />
                            Blocked
                          </div>
                        )}
                        
                        <div className="flex items-center justify-between">
                          {task.assignee ? (
                            <Avatar className="h-6 w-6">
                              <AvatarFallback className="text-xs bg-emerald-100 text-emerald-700">
                                {task.assignee.initials}
                              </AvatarFallback>
                            </Avatar>
                          ) : (
                            <div className="h-6 w-6 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center">
                              <User className="h-3 w-3 text-gray-400" />
                            </div>
                          )}
                          <Badge variant="outline" className="font-mono text-xs">
                            {task.points} pts
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  
                  {/* Add Task Button */}
                  <Button variant="ghost" className="w-full border-2 border-dashed h-12 text-muted-foreground">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Task
                  </Button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Blocked Items Warning */}
        {tasks.some(t => t.is_blocked) && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <div>
                  <p className="font-medium text-red-800">
                    {tasks.filter(t => t.is_blocked).length} blocked item(s)
                  </p>
                  <p className="text-sm text-red-700">
                    Address blockers to maintain iteration flow
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-emerald-900 mb-2">Iteration Best Practices</h3>
            <ul className="space-y-1 text-sm text-emerald-800">
              <li>• Limit work in progress to improve flow</li>
              <li>• Address blockers immediately in daily standups</li>
              <li>• Don't add new work mid-iteration unless critical</li>
              <li>• Track actuals vs estimates for better planning</li>
            </ul>
          </CardContent>
        </Card>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="agile" />
    </div>
  );
};

export default AgileIterationBoard;
