import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel'; 
import { 
  Zap, Users, Target, ListChecks, TrendingUp, Calendar,
  CheckCircle, Clock, AlertTriangle, ArrowRight, Rocket
} from 'lucide-react';

const AgileOverview = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({
    currentIteration: 'Iteration 5',
    iterationProgress: 65,
    daysRemaining: 5,
    totalStories: 45,
    completedStories: 28,
    inProgressStories: 8,
    backlogStories: 9,
    teamVelocity: 24,
    releaseProgress: 72,
    teamSize: 6,
  });

  const quickActions = [
    { title: 'View Backlog', icon: ListChecks, url: `/projects/${id}/agile/backlog`, color: 'bg-blue-500' },
    { title: 'Iteration Board', icon: Zap, url: `/projects/${id}/agile/iteration-board`, color: 'bg-emerald-500' },
    { title: 'Daily Progress', icon: Users, url: `/projects/${id}/agile/daily-progress`, color: 'bg-purple-500' },
    { title: 'Release Planning', icon: Calendar, url: `/projects/${id}/agile/release-planning`, color: 'bg-orange-500' },
  ];

  const recentActivity = [
    { action: 'Story completed', item: 'User authentication flow', time: '2 hours ago', type: 'success' },
    { action: 'Story started', item: 'Dashboard analytics', time: '4 hours ago', type: 'info' },
    { action: 'Blocker added', item: 'API integration delay', time: '1 day ago', type: 'warning' },
    { action: 'Iteration started', item: 'Iteration 5', time: '3 days ago', type: 'info' },
  ];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Zap className="h-6 w-6 text-emerald-600" />
              Agile Overview
            </h1>
            <p className="text-muted-foreground">Project dashboard and metrics</p>
          </div>
          <Badge className="bg-emerald-500 text-white text-sm px-3 py-1">
            {stats.currentIteration}
          </Badge>
        </div>

        {/* Current Iteration Progress */}
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-semibold text-lg">{stats.currentIteration}</h3>
                <p className="text-sm text-muted-foreground">{stats.daysRemaining} days remaining</p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-bold text-emerald-600">{stats.iterationProgress}%</span>
                <p className="text-sm text-muted-foreground">Complete</p>
              </div>
            </div>
            <Progress value={stats.iterationProgress} className="h-3" />
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Stories</p>
                  <p className="text-2xl font-bold">{stats.totalStories}</p>
                </div>
                <ListChecks className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Completed</p>
                  <p className="text-2xl font-bold text-green-600">{stats.completedStories}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">In Progress</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.inProgressStories}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Velocity</p>
                  <p className="text-2xl font-bold text-emerald-600">{stats.teamVelocity}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions & Activity */}
        <div className="grid grid-cols-2 gap-6">
          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <Button
                    key={action.title}
                    variant="outline"
                    className="h-20 flex flex-col items-center justify-center gap-2"
                    onClick={() => navigate(action.url)}
                  >
                    <action.icon className={`h-6 w-6 ${action.color.replace('bg-', 'text-')}`} />
                    <span className="text-sm">{action.title}</span>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-2 rounded hover:bg-muted/50">
                    {activity.type === 'success' && <CheckCircle className="h-4 w-4 text-green-500" />}
                    {activity.type === 'info' && <Zap className="h-4 w-4 text-blue-500" />}
                    {activity.type === 'warning' && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
                    <div className="flex-1">
                      <p className="text-sm font-medium">{activity.action}</p>
                      <p className="text-xs text-muted-foreground">{activity.item}</p>
                    </div>
                    <span className="text-xs text-muted-foreground">{activity.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Release Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Rocket className="h-5 w-5" />
              Release Progress
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between mb-2">
                  <span className="text-sm font-medium">Release 2.0</span>
                  <span className="text-sm text-muted-foreground">{stats.releaseProgress}% complete</span>
                </div>
                <Progress value={stats.releaseProgress} className="h-2" />
              </div>
              <Button variant="outline" onClick={() => navigate(`/projects/${id}/agile/release-planning`)}>
                View Details
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Agile Principles Reminder */}
        <Card className="bg-gradient-to-r from-emerald-50 to-teal-50 border-emerald-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-emerald-900 mb-2">Agile Manifesto Values</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-emerald-800">
              <div>• Individuals and interactions over processes</div>
              <div>• Working software over documentation</div>
              <div>• Customer collaboration over contracts</div>
              <div>• Responding to change over following a plan</div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <MethodologyHelpPanel methodology="agile" />
    </div>
  );
};

export default AgileOverview;
