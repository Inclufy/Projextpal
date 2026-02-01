import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { kanbanApi, KanbanDashboard } from '@/lib/kanbanApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  LayoutDashboard, Columns, AlertTriangle, Clock, TrendingUp, 
  CheckCircle, Loader2, AlertCircle, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

const KanbanOverview = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [dashboard, setDashboard] = useState<KanbanDashboard | null>(null);
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
      const data = await kanbanApi.dashboard.get(id!);
      setDashboard(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const initializeBoard = async () => {
    try {
      await kanbanApi.board.initialize(id!);
      loadDashboard();
    } catch (err: any) {
      alert(err.message || 'Failed to initialize board');
    }
  };

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

  if (!dashboard?.has_board) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="p-6">
          <Card className="max-w-lg mx-auto mt-12">
            <CardContent className="pt-8 pb-8 text-center">
              <Columns className="h-16 w-16 mx-auto mb-4 text-blue-600" />
              <h2 className="text-xl font-semibold mb-2">Kanban Board Not Initialized</h2>
              <p className="text-muted-foreground mb-6">
                Create a Kanban board to start visualizing and managing your workflow.
              </p>
              <Button onClick={initializeBoard} size="lg">
                Initialize Kanban Board
              </Button>
            </CardContent>
          </Card>
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
              <LayoutDashboard className="h-6 w-6 text-blue-600" />
              Kanban Overview
            </h1>
            <p className="text-muted-foreground">Dashboard for your Kanban workflow</p>
          </div>
          <Link to={`/projects/${id}/kanban/board`}>
            <Button>
              <Columns className="h-4 w-4 mr-2" />
              Open Board
            </Button>
          </Link>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Cards</p>
                  <p className="text-2xl font-bold">{dashboard.total_cards}</p>
                </div>
                <Columns className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className={dashboard.blocked_count > 0 ? 'border-red-200' : ''}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Blocked</p>
                  <p className="text-2xl font-bold text-red-600">{dashboard.blocked_count}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card className={dashboard.overdue_count > 0 ? 'border-orange-200' : ''}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Overdue</p>
                  <p className="text-2xl font-bold text-orange-600">{dashboard.overdue_count}</p>
                </div>
                <Clock className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed Today</p>
                  <p className="text-2xl font-bold text-green-600">{dashboard.cards_completed_today}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* WIP Violations */}
        {dashboard.wip_violations && dashboard.wip_violations.length > 0 && (
          <Card className="border-red-200 bg-red-50">
            <CardHeader>
              <CardTitle className="text-red-700 flex items-center gap-2">
                <AlertTriangle className="h-5 w-5" />
                WIP Limit Violations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {dashboard.wip_violations.map((violation, i) => (
                  <div key={i} className="flex items-center justify-between p-2 bg-white rounded border border-red-200">
                    <span className="font-medium">{violation.column}</span>
                    <Badge variant="destructive">
                      {violation.count} / {violation.limit} (WIP exceeded)
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Column Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Work Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboard.columns?.map((column) => {
                const percentage = dashboard.total_cards > 0 
                  ? ((column.cards_count || 0) / dashboard.total_cards) * 100 
                  : 0;
                const isOverWip = column.wip_limit && (column.cards_count || 0) > column.wip_limit;
                
                return (
                  <div key={column.id} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">{column.name}</span>
                      <div className="flex items-center gap-2">
                        <span>{column.cards_count || 0} cards</span>
                        {column.wip_limit && (
                          <Badge variant={isOverWip ? 'destructive' : 'outline'} className="text-xs">
                            WIP: {column.wip_limit}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <Progress 
                      value={percentage} 
                      className={`h-2 ${isOverWip ? 'bg-red-100' : ''}`}
                    />
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Flow Metrics */}
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Lead Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {dashboard.avg_lead_time 
                  ? `${(dashboard.avg_lead_time / 24).toFixed(1)} days` 
                  : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Average time from creation to completion
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Cycle Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">
                {dashboard.avg_cycle_time 
                  ? `${(dashboard.avg_cycle_time / 24).toFixed(1)} days` 
                  : 'N/A'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Average time from start to completion
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Link to={`/projects/${id}/kanban/board`}>
                <Button variant="outline">
                  <Columns className="h-4 w-4 mr-2" />
                  View Board
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link to={`/projects/${id}/kanban/metrics`}>
                <Button variant="outline">
                  <TrendingUp className="h-4 w-4 mr-2" />
                  Flow Metrics
                  <ArrowRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
      <MethodologyHelpPanel methodology="kanban" />
    </div>
  );
};

export default KanbanOverview;
