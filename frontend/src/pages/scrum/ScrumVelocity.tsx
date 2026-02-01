import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { scrumApi, Velocity } from '@/lib/scrumApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  TrendingUp, Zap, Target, CheckCircle, Loader2,
  ArrowUp, ArrowDown, Minus, BarChart3
} from 'lucide-react';

const ScrumVelocity = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [velocities, setVelocities] = useState<Velocity[]>([]);
  const [average, setAverage] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      loadVelocity();
    }
  }, [id]);

  const loadVelocity = async () => {
    try {
      setLoading(true);
      const [velocityData, avgData] = await Promise.all([
        scrumApi.velocity.getAll(id!),
        scrumApi.velocity.getAverage(id!),
      ]);
      setVelocities(velocityData);
      setAverage(avgData.average || 0);
    } catch (err: any) {
      // Mock data
      setVelocities([
        { id: 1, sprint: 1, sprint_name: 'Sprint 1', committed_points: 20, completed_points: 18, completion_rate: 90 },
        { id: 2, sprint: 2, sprint_name: 'Sprint 2', committed_points: 22, completed_points: 20, completion_rate: 91 },
        { id: 3, sprint: 3, sprint_name: 'Sprint 3', committed_points: 25, completed_points: 23, completion_rate: 92 },
        { id: 4, sprint: 4, sprint_name: 'Sprint 4', committed_points: 24, completed_points: 26, completion_rate: 108 },
        { id: 5, sprint: 5, sprint_name: 'Sprint 5', committed_points: 26, completed_points: 24, completion_rate: 92 },
      ]);
      setAverage(22.2);
    } finally {
      setLoading(false);
    }
  };

  const getTrend = () => {
    if (velocities.length < 2) return 'stable';
    const recent = velocities.slice(-3);
    const avgRecent = recent.reduce((sum, v) => sum + v.completed_points, 0) / recent.length;
    const older = velocities.slice(0, -3);
    if (older.length === 0) return 'stable';
    const avgOlder = older.reduce((sum, v) => sum + v.completed_points, 0) / older.length;
    if (avgRecent > avgOlder * 1.1) return 'up';
    if (avgRecent < avgOlder * 0.9) return 'down';
    return 'stable';
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </div>
    );
  }

  const trend = getTrend();
  const maxPoints = Math.max(...velocities.map(v => Math.max(v.committed_points, v.completed_points)));
  const avgCompletionRate = velocities.length > 0 
    ? velocities.reduce((sum, v) => sum + v.completion_rate, 0) / velocities.length 
    : 0;

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-purple-600" />
              Velocity Tracking
            </h1>
            <p className="text-muted-foreground">Track story points completed per sprint</p>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Average Velocity</p>
                  <p className="text-2xl font-bold">{average.toFixed(1)} pts</p>
                </div>
                <Zap className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Trend</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold capitalize">{trend}</p>
                    {trend === 'up' && <ArrowUp className="h-5 w-5 text-green-500" />}
                    {trend === 'down' && <ArrowDown className="h-5 w-5 text-red-500" />}
                    {trend === 'stable' && <Minus className="h-5 w-5 text-gray-500" />}
                  </div>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Completion</p>
                  <p className="text-2xl font-bold">{avgCompletionRate.toFixed(0)}%</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Sprints Tracked</p>
                  <p className="text-2xl font-bold">{velocities.length}</p>
                </div>
                <Target className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
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
            <div className="flex items-end gap-4 h-64">
              {velocities.map((v, i) => (
                <div key={i} className="flex-1 flex flex-col items-center">
                  <div className="w-full flex gap-1 justify-center items-end h-48">
                    {/* Committed bar */}
                    <div 
                      className="w-8 bg-purple-200 rounded-t relative group"
                      style={{ height: `${(v.committed_points / maxPoints) * 100}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100">
                        {v.committed_points}
                      </div>
                    </div>
                    {/* Completed bar */}
                    <div 
                      className="w-8 bg-purple-600 rounded-t relative group"
                      style={{ height: `${(v.completed_points / maxPoints) * 100}%` }}
                    >
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs font-medium opacity-0 group-hover:opacity-100">
                        {v.completed_points}
                      </div>
                    </div>
                  </div>
                  <p className="text-sm mt-2 font-medium">{v.sprint_name}</p>
                  <Badge 
                    variant={v.completion_rate >= 100 ? 'default' : v.completion_rate >= 80 ? 'secondary' : 'destructive'}
                    className={v.completion_rate >= 100 ? 'bg-green-500' : ''}
                  >
                    {v.completion_rate}%
                  </Badge>
                </div>
              ))}
            </div>
            {/* Legend */}
            <div className="flex justify-center gap-6 mt-6 pt-4 border-t">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-purple-200" />
                <span className="text-sm">Committed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded bg-purple-600" />
                <span className="text-sm">Completed</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-0.5 w-6 bg-purple-400" />
                <span className="text-sm">Average: {average.toFixed(1)} pts</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sprint History Table */}
        <Card>
          <CardHeader>
            <CardTitle>Sprint History</CardTitle>
          </CardHeader>
          <CardContent>
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 font-medium">Sprint</th>
                  <th className="text-right py-2 font-medium">Committed</th>
                  <th className="text-right py-2 font-medium">Completed</th>
                  <th className="text-right py-2 font-medium">Completion Rate</th>
                  <th className="text-right py-2 font-medium">vs Average</th>
                </tr>
              </thead>
              <tbody>
                {velocities.map((v) => {
                  const vsAvg = ((v.completed_points - average) / average) * 100;
                  return (
                    <tr key={v.id} className="border-b">
                      <td className="py-3">{v.sprint_name}</td>
                      <td className="text-right py-3">{v.committed_points} pts</td>
                      <td className="text-right py-3 font-medium">{v.completed_points} pts</td>
                      <td className="text-right py-3">
                        <Badge 
                          variant={v.completion_rate >= 100 ? 'default' : v.completion_rate >= 80 ? 'secondary' : 'destructive'}
                          className={v.completion_rate >= 100 ? 'bg-green-500' : ''}
                        >
                          {v.completion_rate}%
                        </Badge>
                      </td>
                      <td className="text-right py-3">
                        <span className={vsAvg >= 0 ? 'text-green-600' : 'text-red-600'}>
                          {vsAvg >= 0 ? '+' : ''}{vsAvg.toFixed(0)}%
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-purple-900 mb-2">Velocity Best Practices</h3>
            <ul className="space-y-1 text-sm text-purple-800">
              <li>• Use velocity for forecasting, not as a performance metric</li>
              <li>• It typically takes 3-5 sprints to establish a reliable velocity</li>
              <li>• Don't compare velocities between different teams</li>
              <li>• Focus on trend over individual sprint variations</li>
            </ul>
          </CardContent>
        </Card>
      </div>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="scrum" />
    </div>
  );
};

export default ScrumVelocity;
