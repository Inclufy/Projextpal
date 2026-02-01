import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Columns, Clock, TrendingUp, AlertTriangle, CheckCircle2,
  Timer, BarChart3, ArrowRight
} from 'lucide-react';

interface KanbanDashboardProps {
  project: any;
}

const KanbanDashboard = ({ project }: KanbanDashboardProps) => {
  const columns = [
    { 
      name: 'Backlog', 
      color: 'bg-gray-100',
      textColor: 'text-gray-700',
      wipLimit: null,
      items: [
        { id: 1, title: 'Research competitor features', priority: 'low', daysInColumn: 5 },
        { id: 2, title: 'Design system updates', priority: 'medium', daysInColumn: 3 },
        { id: 3, title: 'API documentation', priority: 'low', daysInColumn: 7 },
      ]
    },
    { 
      name: 'Ready', 
      color: 'bg-blue-50',
      textColor: 'text-blue-700',
      wipLimit: 5,
      items: [
        { id: 4, title: 'User profile page', priority: 'high', daysInColumn: 2 },
        { id: 5, title: 'Notification system', priority: 'medium', daysInColumn: 1 },
      ]
    },
    { 
      name: 'In Progress', 
      color: 'bg-yellow-50',
      textColor: 'text-yellow-700',
      wipLimit: 3,
      items: [
        { id: 6, title: 'Dashboard analytics', priority: 'high', daysInColumn: 3, assignee: 'JD' },
        { id: 7, title: 'Payment integration', priority: 'high', daysInColumn: 4, assignee: 'SM', blocked: true },
      ]
    },
    { 
      name: 'Review', 
      color: 'bg-purple-50',
      textColor: 'text-purple-700',
      wipLimit: 3,
      items: [
        { id: 8, title: 'Email templates', priority: 'medium', daysInColumn: 1, assignee: 'AK' },
      ]
    },
    { 
      name: 'Done', 
      color: 'bg-green-50',
      textColor: 'text-green-700',
      wipLimit: null,
      items: [
        { id: 9, title: 'Login flow', priority: 'high', daysInColumn: 0 },
        { id: 10, title: 'Database schema', priority: 'high', daysInColumn: 0 },
        { id: 11, title: 'CI/CD pipeline', priority: 'medium', daysInColumn: 0 },
      ]
    },
  ];

  const metrics = {
    avgLeadTime: 8.5,
    avgCycleTime: 4.2,
    throughput: 12,
    blockedItems: 1,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const isOverWip = (column: typeof columns[0]) => {
    return column.wipLimit && column.items.length > column.wipLimit;
  };

  return (
    <div className="space-y-6">
      {/* Kanban Header */}
      <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Columns className="h-6 w-6" />
              <h2 className="text-2xl font-bold">Kanban Board</h2>
            </div>
            <p className="text-blue-100">Continuous flow with WIP limits</p>
          </div>
          <div className="flex gap-6">
            <div className="text-center">
              <div className="text-3xl font-bold">{metrics.throughput}</div>
              <div className="text-blue-100 text-sm">Items/Week</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">{metrics.avgCycleTime}d</div>
              <div className="text-blue-100 text-sm">Avg Cycle Time</div>
            </div>
          </div>
        </div>
      </div>

      {/* Flow Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Timer className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.avgLeadTime}d</p>
                <p className="text-sm text-muted-foreground">Lead Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.avgCycleTime}d</p>
                <p className="text-sm text-muted-foreground">Cycle Time</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.throughput}</p>
                <p className="text-sm text-muted-foreground">Throughput/Week</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className={metrics.blockedItems > 0 ? 'border-red-200 bg-red-50' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${metrics.blockedItems > 0 ? 'bg-red-100' : 'bg-gray-100'}`}>
                <AlertTriangle className={`h-5 w-5 ${metrics.blockedItems > 0 ? 'text-red-600' : 'text-gray-600'}`} />
              </div>
              <div>
                <p className="text-2xl font-bold">{metrics.blockedItems}</p>
                <p className="text-sm text-muted-foreground">Blocked Items</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Kanban Board */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Columns className="h-5 w-5" />
            Work Items
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 overflow-x-auto pb-4">
            {columns.map((column, colIndex) => (
              <div 
                key={column.name} 
                className={`flex-shrink-0 w-64 rounded-lg p-3 ${column.color} ${isOverWip(column) ? 'ring-2 ring-red-500' : ''}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <h3 className={`font-semibold ${column.textColor}`}>{column.name}</h3>
                  <div className="flex items-center gap-2">
                    <Badge variant={isOverWip(column) ? 'destructive' : 'secondary'}>
                      {column.items.length}
                      {column.wipLimit && `/${column.wipLimit}`}
                    </Badge>
                  </div>
                </div>
                
                {isOverWip(column) && (
                  <div className="bg-red-100 text-red-700 text-xs p-2 rounded mb-3 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    WIP limit exceeded!
                  </div>
                )}

                <div className="space-y-2">
                  {column.items.map(item => (
                    <div 
                      key={item.id} 
                      className={`bg-white p-3 rounded-lg shadow-sm border ${item.blocked ? 'border-red-300 bg-red-50' : ''}`}
                    >
                      {item.blocked && (
                        <div className="flex items-center gap-1 text-red-600 text-xs mb-2">
                          <AlertTriangle className="h-3 w-3" />
                          Blocked
                        </div>
                      )}
                      <p className="text-sm font-medium">{item.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        <Badge className={`text-xs ${getPriorityColor(item.priority)}`}>
                          {item.priority}
                        </Badge>
                        <div className="flex items-center gap-2">
                          {item.daysInColumn > 0 && (
                            <span className="text-xs text-muted-foreground">
                              {item.daysInColumn}d
                            </span>
                          )}
                          {item.assignee && (
                            <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                              {item.assignee}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Cumulative Flow Diagram */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Cumulative Flow Diagram
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-48 flex items-end gap-1">
            {[...Array(14)].map((_, i) => (
              <div key={i} className="flex-1 flex flex-col">
                <div className="bg-green-400 h-8 rounded-t" />
                <div className="bg-purple-400" style={{ height: `${10 + Math.random() * 10}px` }} />
                <div className="bg-yellow-400" style={{ height: `${15 + Math.random() * 10}px` }} />
                <div className="bg-blue-400" style={{ height: `${10 + Math.random() * 10}px` }} />
                <div className="bg-gray-400" style={{ height: `${20 + Math.random() * 15}px` }} />
              </div>
            ))}
          </div>
          <div className="flex justify-center gap-4 mt-4 text-sm flex-wrap">
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-gray-400 rounded" /><span>Backlog</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-blue-400 rounded" /><span>Ready</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-yellow-400 rounded" /><span>In Progress</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-purple-400 rounded" /><span>Review</span></div>
            <div className="flex items-center gap-2"><div className="w-3 h-3 bg-green-400 rounded" /><span>Done</span></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default KanbanDashboard;
