import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  TrendingUp, BarChart3, Target, Loader2, 
  ArrowUp, ArrowDown, Minus
} from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const fetchVelocityData = async (projectId: string) => {
  const token = localStorage.getItem("access_token");
  
  // Try agile velocity endpoint
  const response = await fetch(`${API_BASE_URL}/agile/projects/${projectId}/velocity/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (response.ok) {
    return response.json();
  }
  
  // Fallback: get sprints and calculate
  const sprintsResponse = await fetch(`${API_BASE_URL}/agile/projects/${projectId}/sprints/`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  
  if (!sprintsResponse.ok) return { iterations: [], stats: {} };
  
  const sprints = await sprintsResponse.json();
  const sprintList = Array.isArray(sprints) ? sprints : sprints.results || [];
  
  const iterations = sprintList.map((s: any, i: number) => ({
    iteration: s.name || `Iteration ${i + 1}`,
    committed: s.committed_points || s.planned_points || 0,
    completed: s.completed_points || s.actual_points || 0,
  }));
  
  const avgVelocity = iterations.length > 0 
    ? Math.round(iterations.reduce((sum: number, i: any) => sum + i.completed, 0) / iterations.length)
    : 0;
  
  return {
    iterations,
    stats: {
      averageVelocity: avgVelocity,
      trend: 'stable',
      predictability: 80,
    }
  };
};

const AgileVelocity = () => {
  const { id } = useParams<{ id: string }>();
  const [timeRange, setTimeRange] = useState('10');

  const { data, isLoading } = useQuery({
    queryKey: ['agile-velocity', id, timeRange],
    queryFn: () => fetchVelocityData(id!),
    enabled: !!id,
  });

  const velocityData = (data?.iterations || []).slice(-parseInt(timeRange));
  const stats = data?.stats || {
    averageVelocity: 0,
    trend: 'stable',
    predictability: 0,
  };

  // Current iteration stats
  const currentIteration = velocityData[velocityData.length - 1] || { iteration: '-', committed: 0, completed: 0 };

  const maxPoints = Math.max(...velocityData.flatMap((d: any) => [d.committed || 0, d.completed || 0]), 30);

  const getTrendIcon = () => {
    switch (stats.trend) {
      case 'up': return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down': return <ArrowDown className="h-4 w-4 text-red-500" />;
      default: return <Minus className="h-4 w-4 text-gray-500" />;
    }
  };

  if (isLoading) {
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
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-emerald-600" />
              Velocity & Burndown
            </h1>
            <p className="text-muted-foreground">Track team performance over time</p>
          </div>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="5">Last 5 iterations</SelectItem>
              <SelectItem value="10">Last 10 iterations</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Average Velocity</p>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold">{stats.averageVelocity}</p>
                {getTrendIcon()}
              </div>
              <p className="text-xs text-muted-foreground">points/iteration</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Predictability</p>
              <p className="text-2xl font-bold text-emerald-600">{stats.predictability}%</p>
              <p className="text-xs text-muted-foreground">commitment accuracy</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Current Commitment</p>
              <p className="text-2xl font-bold">{currentIteration.committed}</p>
              <p className="text-xs text-muted-foreground">{currentIteration.iteration}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Completed (Current)</p>
              <p className="text-2xl font-bold text-blue-600">{currentIteration.completed}</p>
              <p className="text-xs text-muted-foreground">
                {currentIteration.committed > 0 
                  ? Math.round((currentIteration.completed / currentIteration.committed) * 100) 
                  : 0}% of commitment
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Velocity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Velocity Chart
            </CardTitle>
          </CardHeader>
          <CardContent>
            {velocityData.length === 0 ? (
              <div className="text-center py-12">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-muted-foreground">No velocity data available yet</p>
              </div>
            ) : (
              <>
                <div className="h-64 flex items-end gap-2">
                  {velocityData.map((data: any, idx: number) => (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1">
                      <div className="w-full flex gap-1 items-end" style={{ height: '200px' }}>
                        {/* Committed */}
                        <div 
                          className="flex-1 bg-gray-200 rounded-t"
                          style={{ height: `${(data.committed / maxPoints) * 100}%` }}
                          title={`Committed: ${data.committed}`}
                        />
                        {/* Completed */}
                        <div 
                          className={`flex-1 rounded-t ${data.completed >= data.committed ? 'bg-green-500' : 'bg-blue-500'}`}
                          style={{ height: `${(data.completed / maxPoints) * 100}%` }}
                          title={`Completed: ${data.completed}`}
                        />
                      </div>
                      <span className="text-xs text-muted-foreground truncate max-w-full">{data.iteration}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-center gap-6 mt-4">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-gray-200 rounded" />
                    <span className="text-sm">Committed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-blue-500 rounded" />
                    <span className="text-sm">Completed</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-500 rounded" />
                    <span className="text-sm">Exceeded</span>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Velocity Table */}
        {velocityData.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Velocity History</CardTitle>
            </CardHeader>
            <CardContent>
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">Iteration</th>
                    <th className="text-right py-2">Committed</th>
                    <th className="text-right py-2">Completed</th>
                    <th className="text-right py-2">Variance</th>
                    <th className="text-right py-2">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {velocityData.map((data: any, idx: number) => {
                    const variance = data.completed - data.committed;
                    return (
                      <tr key={idx} className="border-b hover:bg-muted/50">
                        <td className="py-3">{data.iteration}</td>
                        <td className="text-right">{data.committed}</td>
                        <td className="text-right font-medium">{data.completed}</td>
                        <td className={`text-right ${variance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                          {variance >= 0 ? '+' : ''}{variance}
                        </td>
                        <td className="text-right">
                          {variance >= 0 ? (
                            <Badge className="bg-green-500">Met</Badge>
                          ) : (
                            <Badge variant="destructive">Missed</Badge>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-emerald-900 mb-2">Using Velocity Effectively</h3>
            <ul className="space-y-1 text-sm text-emerald-800">
              <li>• Use average of last 3-5 iterations for planning</li>
              <li>• Don't compare velocity across different teams</li>
              <li>• Focus on consistency, not maximizing velocity</li>
              <li>• Investigate significant velocity changes</li>
            </ul>
          </CardContent>
        </Card>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="agile" />
    </div>
  );
};

export default AgileVelocity;
