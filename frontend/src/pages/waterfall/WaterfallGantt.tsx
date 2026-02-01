import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Calendar, Plus, ChevronLeft, ChevronRight, 
  Loader2, ZoomIn, ZoomOut, Download
} from 'lucide-react';

interface GanttTask {
  id: number;
  name: string;
  phase: string;
  startDate: string;
  endDate: string;
  progress: number;
  dependencies?: number[];
  assignee: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'delayed';
}

const WaterfallGantt = () => {
  const { id } = useParams<{ id: string }>();
  
  const [tasks, setTasks] = useState<GanttTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [viewMode, setViewMode] = useState<'week' | 'month'>('month');
  const [currentDate, setCurrentDate] = useState(new Date());

  useEffect(() => {
    loadTasks();
  }, [id]);

  const loadTasks = async () => {
    setLoading(true);
    setTimeout(() => {
      setTasks([
        // Requirements Phase
        { id: 1, name: 'Stakeholder interviews', phase: 'Requirements', startDate: '2024-09-01', endDate: '2024-09-15', progress: 100, assignee: 'Sarah Chen', status: 'completed' },
        { id: 2, name: 'Requirements documentation', phase: 'Requirements', startDate: '2024-09-10', endDate: '2024-09-30', progress: 100, dependencies: [1], assignee: 'Sarah Chen', status: 'completed' },
        { id: 3, name: 'Requirements sign-off', phase: 'Requirements', startDate: '2024-10-01', endDate: '2024-10-05', progress: 100, dependencies: [2], assignee: 'Project Sponsor', status: 'completed' },
        
        // Design Phase
        { id: 4, name: 'System architecture', phase: 'Design', startDate: '2024-10-06', endDate: '2024-10-20', progress: 100, dependencies: [3], assignee: 'Mike Johnson', status: 'completed' },
        { id: 5, name: 'UI/UX design', phase: 'Design', startDate: '2024-10-10', endDate: '2024-10-31', progress: 100, dependencies: [3], assignee: 'Lisa Garcia', status: 'completed' },
        { id: 6, name: 'Design review', phase: 'Design', startDate: '2024-11-01', endDate: '2024-11-05', progress: 100, dependencies: [4, 5], assignee: 'Tech Lead', status: 'completed' },
        
        // Development Phase
        { id: 7, name: 'Backend development', phase: 'Development', startDate: '2024-11-06', endDate: '2024-12-20', progress: 70, dependencies: [6], assignee: 'Dev Team', status: 'in_progress' },
        { id: 8, name: 'Frontend development', phase: 'Development', startDate: '2024-11-10', endDate: '2024-12-25', progress: 60, dependencies: [5, 6], assignee: 'Dev Team', status: 'in_progress' },
        { id: 9, name: 'API integration', phase: 'Development', startDate: '2024-12-01', endDate: '2024-12-31', progress: 40, dependencies: [7], assignee: 'Dev Team', status: 'in_progress' },
        
        // Testing Phase
        { id: 10, name: 'Unit testing', phase: 'Testing', startDate: '2024-12-15', endDate: '2025-01-10', progress: 20, dependencies: [7, 8], assignee: 'QA Team', status: 'in_progress' },
        { id: 11, name: 'Integration testing', phase: 'Testing', startDate: '2025-01-05', endDate: '2025-01-20', progress: 0, dependencies: [9, 10], assignee: 'QA Team', status: 'not_started' },
        { id: 12, name: 'UAT', phase: 'Testing', startDate: '2025-01-15', endDate: '2025-01-25', progress: 0, dependencies: [11], assignee: 'Stakeholders', status: 'not_started' },
        
        // Deployment Phase
        { id: 13, name: 'Production deployment', phase: 'Deployment', startDate: '2025-01-26', endDate: '2025-01-28', progress: 0, dependencies: [12], assignee: 'DevOps', status: 'not_started' },
        { id: 14, name: 'Go-live support', phase: 'Deployment', startDate: '2025-01-28', endDate: '2025-02-05', progress: 0, dependencies: [13], assignee: 'Support Team', status: 'not_started' },
      ]);
      setLoading(false);
    }, 500);
  };

  const getStatusColor = (status: GanttTask['status']) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'in_progress': return 'bg-blue-500';
      case 'delayed': return 'bg-red-500';
      default: return 'bg-gray-300';
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

  // Generate date range for the chart
  const generateDateRange = () => {
    const dates: Date[] = [];
    const start = new Date('2024-09-01');
    const end = new Date('2025-02-28');
    
    let current = new Date(start);
    while (current <= end) {
      dates.push(new Date(current));
      current.setDate(current.getDate() + 7); // Weekly intervals
    }
    return dates;
  };

  const dateRange = generateDateRange();

  const getTaskPosition = (task: GanttTask) => {
    const chartStart = new Date('2024-09-01').getTime();
    const chartEnd = new Date('2025-02-28').getTime();
    const totalDuration = chartEnd - chartStart;
    
    const taskStart = new Date(task.startDate).getTime();
    const taskEnd = new Date(task.endDate).getTime();
    
    const left = ((taskStart - chartStart) / totalDuration) * 100;
    const width = ((taskEnd - taskStart) / totalDuration) * 100;
    
    return { left: `${left}%`, width: `${width}%` };
  };

  const phases = [...new Set(tasks.map(t => t.phase))];

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
              <Calendar className="h-6 w-6 text-blue-600" />
              Gantt Chart
            </h1>
            <p className="text-muted-foreground">Visual project timeline and dependencies</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="icon">
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="icon">
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Task
            </Button>
          </div>
        </div>

        {/* Timeline Controls */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon">
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <span className="font-medium">September 2024 - February 2025</span>
                <Button variant="outline" size="icon">
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-green-500" />
                  <span className="text-sm">Completed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-blue-500" />
                  <span className="text-sm">In Progress</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-gray-300" />
                  <span className="text-sm">Not Started</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded bg-red-500" />
                  <span className="text-sm">Delayed</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gantt Chart */}
        <Card>
          <CardContent className="pt-4 overflow-x-auto">
            <div className="min-w-[1200px]">
              {/* Timeline Header */}
              <div className="flex border-b pb-2 mb-4">
                <div className="w-64 flex-shrink-0 font-medium">Task</div>
                <div className="flex-1 flex">
                  {dateRange.map((date, idx) => (
                    <div key={idx} className="flex-1 text-center text-xs text-muted-foreground">
                      {date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                    </div>
                  ))}
                </div>
              </div>

              {/* Tasks by Phase */}
              {phases.map((phase) => (
                <div key={phase} className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-3 h-3 rounded ${getPhaseColor(phase)}`} />
                    <span className="font-semibold">{phase}</span>
                  </div>
                  
                  {tasks.filter(t => t.phase === phase).map((task) => {
                    const position = getTaskPosition(task);
                    return (
                      <div key={task.id} className="flex items-center h-10 hover:bg-muted/50 rounded">
                        <div className="w-64 flex-shrink-0 text-sm truncate pr-4">
                          {task.name}
                        </div>
                        <div className="flex-1 relative h-6">
                          {/* Background grid */}
                          <div className="absolute inset-0 flex">
                            {dateRange.map((_, idx) => (
                              <div key={idx} className="flex-1 border-l border-gray-100" />
                            ))}
                          </div>
                          
                          {/* Task bar */}
                          <div 
                            className={`absolute h-full rounded ${getStatusColor(task.status)} opacity-80 cursor-pointer hover:opacity-100 transition-opacity`}
                            style={{ left: position.left, width: position.width }}
                            title={`${task.name}: ${task.progress}% complete`}
                          >
                            {/* Progress indicator */}
                            <div 
                              className="h-full bg-white/30 rounded-l"
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Task List */}
        <Card>
          <CardHeader>
            <CardTitle>Task Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Task</th>
                    <th className="text-left py-2">Phase</th>
                    <th className="text-left py-2">Start</th>
                    <th className="text-left py-2">End</th>
                    <th className="text-left py-2">Progress</th>
                    <th className="text-left py-2">Assignee</th>
                    <th className="text-left py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task.id} className="border-b hover:bg-muted/50">
                      <td className="py-2 font-medium">{task.name}</td>
                      <td className="py-2">
                        <Badge className={getPhaseColor(task.phase)}>{task.phase}</Badge>
                      </td>
                      <td className="py-2">{task.startDate}</td>
                      <td className="py-2">{task.endDate}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <div className="w-20 h-2 bg-gray-200 rounded">
                            <div 
                              className={`h-full rounded ${getStatusColor(task.status)}`}
                              style={{ width: `${task.progress}%` }}
                            />
                          </div>
                          <span>{task.progress}%</span>
                        </div>
                      </td>
                      <td className="py-2">{task.assignee}</td>
                      <td className="py-2">
                        <Badge variant={task.status === 'completed' ? 'default' : 'outline'}>
                          {task.status.replace('_', ' ')}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-blue-900 mb-2">Gantt Chart Best Practices</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Identify critical path tasks that affect project timeline</li>
              <li>• Keep dependencies updated to reflect changes</li>
              <li>• Review and adjust timelines weekly</li>
              <li>• Use milestones to mark phase completions</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Task Name</label>
              <Input placeholder="Task name" />
            </div>
            <div>
              <label className="text-sm font-medium">Phase</label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select phase" />
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
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input type="date" />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input type="date" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium">Assignee</label>
              <Input placeholder="Team member or group" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button>Add Task</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="waterfall" />
    </div>
  );
};

export default WaterfallGantt;
