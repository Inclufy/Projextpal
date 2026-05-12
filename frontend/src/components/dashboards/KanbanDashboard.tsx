import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Columns, Clock, TrendingUp, AlertTriangle,
  Timer, BarChart3, Loader2
} from 'lucide-react';
import { kanbanApi } from '@/lib/kanbanApi';

interface KanbanDashboardProps {
  project: any;
}

const KanbanDashboard = ({ project }: KanbanDashboardProps) => {
  const projectId = project?.id;

  // Fetch real data from backend (no hardcoded mock data)
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['kanban', 'dashboard', projectId],
    queryFn: () => kanbanApi.dashboard.get(projectId),
    enabled: !!projectId,
  });

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
      </div>
    );
  }

  const columns = dashboard?.columns ?? [];
  const metrics = {
    avgLeadTime: dashboard?.avg_lead_time ?? null,
    avgCycleTime: dashboard?.avg_cycle_time ?? null,
    throughput: dashboard?.cards_completed_today ?? 0,
    blockedItems: dashboard?.blocked_count ?? 0,
    totalCards: dashboard?.total_cards ?? 0,
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
      case 'high': return 'bg-red-100 text-red-700 border-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'low': return 'bg-green-100 text-green-700 border-green-200';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const getColumnBg = (column: any) => {
    switch (column.column_type) {
      case 'backlog': return 'bg-gray-100';
      case 'todo': return 'bg-blue-50';
      case 'in_progress': return 'bg-yellow-50';
      case 'review': return 'bg-purple-50';
      case 'done': return 'bg-green-50';
      default: return 'bg-gray-50';
    }
  };

  const getColumnText = (column: any) => {
    switch (column.column_type) {
      case 'backlog': return 'text-gray-700';
      case 'todo': return 'text-blue-700';
      case 'in_progress': return 'text-yellow-700';
      case 'review': return 'text-purple-700';
      case 'done': return 'text-green-700';
      default: return 'text-gray-700';
    }
  };

  // No board yet — empty state
  if (!dashboard?.has_board) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Columns className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Kanban Board</h2>
          </div>
          <p className="text-blue-100">Continuous flow with WIP limits</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Columns className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium">No Kanban board yet</h3>
            <p className="text-muted-foreground mt-2">
              Initialize a Kanban board from the Kanban page to get started.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
              <div className="text-blue-100 text-sm">Completed Today</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold">
                {metrics.avgCycleTime != null ? `${metrics.avgCycleTime.toFixed(1)}h` : '—'}
              </div>
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
                <p className="text-2xl font-bold">
                  {metrics.avgLeadTime != null ? `${metrics.avgLeadTime.toFixed(1)}h` : '—'}
                </p>
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
                <p className="text-2xl font-bold">
                  {metrics.avgCycleTime != null ? `${metrics.avgCycleTime.toFixed(1)}h` : '—'}
                </p>
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
                <p className="text-2xl font-bold">{metrics.totalCards}</p>
                <p className="text-sm text-muted-foreground">Total Cards</p>
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
          {columns.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No columns configured yet — set up columns from the Kanban Board Configuration page.
            </p>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-4">
              {columns.map((column: any) => {
                const cards = column.cards ?? [];
                const isOverWip = column.is_wip_exceeded;
                return (
                  <div
                    key={column.id}
                    className={`flex-shrink-0 w-64 rounded-lg p-3 ${getColumnBg(column)} ${isOverWip ? 'ring-2 ring-red-500' : ''}`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <h3 className={`font-semibold ${getColumnText(column)}`}>{column.name}</h3>
                      <Badge variant={isOverWip ? 'destructive' : 'secondary'}>
                        {column.cards_count ?? cards.length}
                        {column.wip_limit && `/${column.wip_limit}`}
                      </Badge>
                    </div>

                    {isOverWip && (
                      <div className="bg-red-100 text-red-700 text-xs p-2 rounded mb-3 flex items-center gap-1">
                        <AlertTriangle className="h-3 w-3" />
                        WIP limit exceeded!
                      </div>
                    )}

                    <div className="space-y-2">
                      {cards.length === 0 ? (
                        <p className="text-xs text-muted-foreground italic text-center py-2">No cards</p>
                      ) : (
                        cards.map((card: any) => (
                          <div
                            key={card.id}
                            className={`bg-white p-3 rounded-lg shadow-sm border ${card.is_blocked ? 'border-red-300 bg-red-50' : ''}`}
                          >
                            {card.is_blocked && (
                              <div className="flex items-center gap-1 text-red-600 text-xs mb-2">
                                <AlertTriangle className="h-3 w-3" />
                                Blocked
                              </div>
                            )}
                            <p className="text-sm font-medium">{card.title}</p>
                            <div className="flex items-center justify-between mt-2">
                              <Badge className={`text-xs ${getPriorityColor(card.priority)}`}>
                                {card.priority}
                              </Badge>
                              {card.assignee_name && (
                                <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                                  {card.assignee_name.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase()}
                                </div>
                              )}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Cumulative Flow Diagram — TODO: wire to backend endpoint /kanban/cumulative-flow/ */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Cumulative Flow Diagram
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground text-center py-6">
            Cumulative flow diagram will appear here once enough historical data has been collected.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KanbanDashboard;
