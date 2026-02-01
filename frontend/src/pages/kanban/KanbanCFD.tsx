import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ProjectHeader } from '@/components/ProjectHeader';
import { BarChart3, Download, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const fetchCFDData = async (projectId: string) => {
  const token = localStorage.getItem("access_token");
  const response = await fetch(`${API_BASE_URL}/kanban/projects/${projectId}/cfd/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) {
    // Generate CFD data from tasks
    const tasksResponse = await fetch(`${API_BASE_URL}/projects/${projectId}/tasks/`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!tasksResponse.ok) return { data: [], metrics: {} };
    const tasks = await tasksResponse.json();
    const taskList = Array.isArray(tasks) ? tasks : tasks.results || [];
    
    // Calculate current state
    const backlog = taskList.filter((t: any) => ['backlog', 'todo'].includes(t.status?.toLowerCase())).length;
    const ready = taskList.filter((t: any) => t.status?.toLowerCase() === 'ready').length;
    const inProgress = taskList.filter((t: any) => ['in_progress', 'active'].includes(t.status?.toLowerCase())).length;
    const review = taskList.filter((t: any) => ['review', 'testing'].includes(t.status?.toLowerCase())).length;
    const done = taskList.filter((t: any) => ['done', 'completed'].includes(t.status?.toLowerCase())).length;
    
    return {
      data: [{ date: 'Current', backlog, ready, inProgress, review, done }],
      metrics: {
        avgLeadTime: '-',
        throughput: taskList.length > 0 ? (done / Math.max(1, taskList.length) * 100).toFixed(0) + '%' : '-',
        wipTrend: inProgress <= 5 ? 'Healthy' : 'High',
        bottleneck: review > inProgress ? 'Review' : inProgress > 5 ? 'In Progress' : 'None',
      }
    };
  }
  return response.json();
};

const KanbanCFD = () => {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['kanban-cfd', id],
    queryFn: () => fetchCFDData(id!),
    enabled: !!id,
  });

  const cfdData = data?.data || [];
  const metrics = data?.metrics || {};

  const colors = {
    backlog: '#9ca3af',
    ready: '#3b82f6',
    inProgress: '#eab308',
    review: '#a855f7',
    done: '#22c55e',
  };

  const maxTotal = Math.max(
    ...cfdData.map((d: any) => (d.backlog || 0) + (d.ready || 0) + (d.inProgress || 0) + (d.review || 0) + (d.done || 0)),
    1
  );

  if (isLoading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
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
              <BarChart3 className="h-6 w-6 text-blue-600" />
              Cumulative Flow Diagram
            </h1>
            <p className="text-muted-foreground">Visualize work item flow over time</p>
          </div>
          <Button variant="outline"><Download className="h-4 w-4 mr-2" />Export</Button>
        </div>

        {/* Key Insights */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Avg Lead Time</p>
              <p className="text-2xl font-bold">{metrics.avgLeadTime || '-'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Throughput</p>
              <p className="text-2xl font-bold">{metrics.throughput || '-'}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">WIP Trend</p>
              <p className="text-2xl font-bold">{metrics.wipTrend || '-'}</p>
              <Badge className={metrics.wipTrend === 'Healthy' ? 'bg-green-500' : 'bg-yellow-500'} >
                {metrics.wipTrend === 'Healthy' ? 'Healthy' : 'Monitor'}
              </Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Bottleneck</p>
              <p className="text-2xl font-bold">{metrics.bottleneck || 'None'}</p>
              <Badge className={metrics.bottleneck === 'None' ? 'bg-green-500' : 'bg-yellow-500'}>
                {metrics.bottleneck === 'None' ? 'Clear' : 'Monitor'}
              </Badge>
            </CardContent>
          </Card>
        </div>

        {/* CFD Chart */}
        <Card>
          <CardHeader>
            <CardTitle>Cumulative Flow</CardTitle>
          </CardHeader>
          <CardContent>
            {cfdData.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No flow data available yet</p>
              </div>
            ) : (
              <>
                <div className="h-80 flex items-end gap-1">
                  {cfdData.map((week: any, i: number) => {
                    return (
                      <div key={i} className="flex-1 flex flex-col">
                        <div className="flex flex-col h-64">
                          <div style={{ height: `${((week.done || 0) / maxTotal) * 100}%`, backgroundColor: colors.done }} />
                          <div style={{ height: `${((week.review || 0) / maxTotal) * 100}%`, backgroundColor: colors.review }} />
                          <div style={{ height: `${((week.inProgress || 0) / maxTotal) * 100}%`, backgroundColor: colors.inProgress }} />
                          <div style={{ height: `${((week.ready || 0) / maxTotal) * 100}%`, backgroundColor: colors.ready }} />
                          <div style={{ height: `${((week.backlog || 0) / maxTotal) * 100}%`, backgroundColor: colors.backlog }} />
                        </div>
                        <p className="text-center text-xs mt-2 text-muted-foreground">{week.date}</p>
                      </div>
                    );
                  })}
                </div>
                {/* Legend */}
                <div className="flex justify-center gap-6 mt-6 pt-4 border-t">
                  <div className="flex items-center gap-2"><div className="h-3 w-3 rounded" style={{ backgroundColor: colors.backlog }} /><span className="text-sm">Backlog</span></div>
                  <div className="flex items-center gap-2"><div className="h-3 w-3 rounded" style={{ backgroundColor: colors.ready }} /><span className="text-sm">Ready</span></div>
                  <div className="flex items-center gap-2"><div className="h-3 w-3 rounded" style={{ backgroundColor: colors.inProgress }} /><span className="text-sm">In Progress</span></div>
                  <div className="flex items-center gap-2"><div className="h-3 w-3 rounded" style={{ backgroundColor: colors.review }} /><span className="text-sm">Review</span></div>
                  <div className="flex items-center gap-2"><div className="h-3 w-3 rounded" style={{ backgroundColor: colors.done }} /><span className="text-sm">Done</span></div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Analysis */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><TrendingUp className="h-5 w-5 text-green-600" />Positive Trends</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-green-700"><span className="h-2 w-2 rounded-full bg-green-500" />Work is flowing through the system</li>
                <li className="flex items-center gap-2 text-green-700"><span className="h-2 w-2 rounded-full bg-green-500" />Tasks are being completed</li>
              </ul>
            </CardContent>
          </Card>
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="h-5 w-5 text-yellow-600" />Areas to Watch</CardTitle></CardHeader>
            <CardContent>
              <ul className="space-y-2">
                {metrics.bottleneck && metrics.bottleneck !== 'None' && (
                  <li className="flex items-center gap-2 text-yellow-700">
                    <span className="h-2 w-2 rounded-full bg-yellow-500" />
                    {metrics.bottleneck} stage may need attention
                  </li>
                )}
                {(!metrics.bottleneck || metrics.bottleneck === 'None') && (
                  <li className="flex items-center gap-2 text-green-700">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    No bottlenecks detected
                  </li>
                )}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="kanban" />
    </div>
  );
};

export default KanbanCFD;
