import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { scrumApi, ScrumDashboard } from '@/lib/scrumApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  LayoutDashboard, Target, Users, Clock, TrendingUp, 
  CheckCircle, Loader2, ArrowRight, Zap, Calendar
} from 'lucide-react';

const ScrumOverview = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [dashboard, setDashboard] = useState<ScrumDashboard | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (id) {
      loadDashboard();
    }
  }, [id]);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      const data = await scrumApi.dashboard.get(id!);
      setDashboard(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const initializeBacklog = async () => {
    try {
      await scrumApi.backlog.initialize(id!);
      loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to initialize backlog');
    }
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

  if (!dashboard?.has_backlog) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="p-6">
          <Card className="max-w-lg mx-auto mt-12">
            <CardContent className="pt-8 pb-8 text-center">
              <Target className="h-16 w-16 mx-auto mb-4 text-purple-600" />
              <h2 className="text-xl font-semibold mb-2">Scrum Not Initialized</h2>
              <p className="text-muted-foreground mb-6">
                Create a Product Backlog to start managing your Scrum project.
              </p>
              <Button onClick={initializeBacklog} size="lg" className="bg-purple-600 hover:bg-purple-700">
                Initialize Scrum
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const sprintProgress = dashboard.active_sprint 
    ? ((dashboard.active_sprint.completed_points || 0) / (dashboard.active_sprint.total_points || 1)) * 100
    : 0;

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <LayoutDashboard className="h-6 w-6 text-purple-600" />
              Scrum Overview
            </h1>
            <p className="text-muted-foreground">Dashboard for your Scrum project</p>
          </div>
          <Link to={`/projects/${id}/scrum/sprint-board`}>
            <Button className="bg-purple-600 hover:bg-purple-700">
              <Zap className="h-4 w-4 mr-2" />
              Sprint Board
            </Button>
          </Link>
        </div>

        {/* Active Sprint */}
        {dashboard.active_sprint ? (
          <Card className="border-purple-200 bg-purple-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Zap className="h-5 w-5 text-purple-600" />
                  Active Sprint: {dashboard.active_sprint.name}
                </span>
                <Badge className="bg-purple-600">In Progress</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Goal</p>
                  <p className="font-medium">{dashboard.active_sprint.goal || 'No goal set'}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Duration</p>
                  <p className="font-medium">
                    {new Date(dashboard.active_sprint.start_date).toLocaleDateString()} - {new Date(dashboard.active_sprint.end_date).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Story Points</p>
                  <p className="font-medium">
                    {dashboard.active_sprint.completed_points || 0} / {dashboard.active_sprint.total_points || 0}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <p className="font-medium">{dashboard.active_sprint.days_remaining || 0}</p>
                </div>
              </div>
              <Progress value={sprintProgress} className="h-3" />
              <p className="text-sm text-muted-foreground mt-2">{sprintProgress.toFixed(0)}% complete</p>
            </CardContent>
          </Card>
        ) : (
          <Card className="border-dashed">
            <CardContent className="py-8 text-center">
              <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-4">No active sprint</p>
              <Link to={`/projects/${id}/scrum/sprint-board`}>
                <Button variant="outline">Start a Sprint</Button>
              </Link>
            </CardContent>
          </Card>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Backlog Items</p>
                  <p className="text-2xl font-bold">{dashboard.backlog_items_count || 0}</p>
                </div>
                <Target className="h-8 w-8 text-purple-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Points</p>
                  <p className="text-2xl font-bold">{dashboard.total_story_points || 0}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Velocity</p>
                  <p className="text-2xl font-bold">{dashboard.average_velocity?.toFixed(1) || 'N/A'}</p>
                </div>
                <Zap className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Size</p>
                  <p className="text-2xl font-bold">{dashboard.team_size || 0}</p>
                </div>
                <Users className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Velocity Trend */}
        {dashboard.velocity_history && dashboard.velocity_history.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Velocity Trend
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-end gap-2 h-32">
                {dashboard.velocity_history.map((v, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center">
                    <div 
                      className="w-full bg-purple-500 rounded-t"
                      style={{ height: `${(v.completed / Math.max(...dashboard.velocity_history!.map(x => x.completed))) * 100}%` }}
                    />
                    <span className="text-xs mt-1">{v.sprint}</span>
                    <span className="text-xs text-muted-foreground">{v.completed}pts</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Link to={`/projects/${id}/scrum/backlog`}>
                <Button variant="outline">
                  <Target className="h-4 w-4 mr-2" />
                  Product Backlog
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to={`/projects/${id}/scrum/sprint-board`}>
                <Button variant="outline">
                  <Zap className="h-4 w-4 mr-2" />
                  Sprint Board
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to={`/projects/${id}/scrum/retrospective`}>
                <Button variant="outline">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Retrospective
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="agile" />
    </div>
  );
};

export default ScrumOverview;
