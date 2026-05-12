import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle2, Clock, TrendingUp, Flame, Loader2 } from 'lucide-react';
import { scrumApi } from '@/lib/scrumApi';

interface ScrumDashboardProps {
  project: any;
}

const ScrumDashboard = ({ project }: ScrumDashboardProps) => {
  const projectId = project?.id;

  // Fetch real data from backend (no hardcoded mock data)
  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ['scrum', 'dashboard', projectId],
    queryFn: () => scrumApi.dashboard.get(projectId),
    enabled: !!projectId,
  });

  if (dashboardLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const activeSprint = dashboard?.active_sprint;
  const sprintItems = activeSprint?.items ?? [];

  const todoStories = sprintItems.filter((s: any) => s.status === 'new' || s.status === 'ready');
  const inProgressStories = sprintItems.filter((s: any) => s.status === 'in_progress');
  const doneStories = sprintItems.filter((s: any) => s.status === 'done');

  const totalPoints = activeSprint?.total_story_points ?? 0;
  const completedPoints = activeSprint?.completed_story_points ?? 0;
  const progressPct = totalPoints > 0 ? (completedPoints / totalPoints) * 100 : 0;

  const daysRemaining = (() => {
    if (!activeSprint?.end_date) return null;
    const end = new Date(activeSprint.end_date);
    const today = new Date();
    const diff = Math.ceil((end.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  // No active sprint = empty state
  if (!activeSprint) {
    return (
      <div className="space-y-6">
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-6 text-white">
          <div className="flex items-center gap-2 mb-2">
            <Flame className="h-6 w-6" />
            <h2 className="text-2xl font-bold">Scrum Project</h2>
          </div>
          <p className="text-amber-100">No active sprint yet — start planning your first sprint.</p>
        </div>
        <Card>
          <CardContent className="py-12 text-center">
            <Target className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
            <h3 className="text-lg font-medium">No active sprint</h3>
            <p className="text-muted-foreground mt-2">
              Create a sprint and add backlog items to see the Sprint Board.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-6 w-6" />
              <h2 className="text-2xl font-bold">{activeSprint.name}</h2>
            </div>
            <p className="text-amber-100">{activeSprint.goal ?? 'No sprint goal set'}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{daysRemaining ?? '—'}</div>
            <div className="text-amber-100">{daysRemaining === null ? 'no end date' : 'days remaining'}</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Sprint Progress</span>
            <span>{completedPoints}/{totalPoints} points</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div className="bg-white rounded-full h-3" style={{ width: `${progressPct}%` }} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{doneStories.length}</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{inProgressStories.length}</p>
                <p className="text-sm text-muted-foreground">In Progress</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-lg bg-gray-100 flex items-center justify-center">
                <Target className="h-5 w-5 text-gray-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{todoStories.length}</p>
                <p className="text-sm text-muted-foreground">To Do</p>
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
                <p className="text-2xl font-bold">
                  {dashboard?.average_velocity != null ? Math.round(dashboard.average_velocity) : '—'}
                </p>
                <p className="text-sm text-muted-foreground">Avg Velocity</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Sprint Board
          </CardTitle>
        </CardHeader>
        <CardContent>
          {sprintItems.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No backlog items in this sprint yet — add stories from the Backlog page.
            </p>
          ) : (
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-700">To Do</h3>
                  <Badge variant="secondary">{todoStories.length}</Badge>
                </div>
                <div className="space-y-3">
                  {todoStories.map((story: any) => (
                    <div key={story.id} className="bg-white p-3 rounded-lg shadow-sm border">
                      <p className="text-sm font-medium">{story.title}</p>
                      {story.story_points != null && (
                        <Badge variant="outline" className="text-xs mt-2">{story.story_points} pts</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-blue-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-blue-700">In Progress</h3>
                  <Badge className="bg-blue-500">{inProgressStories.length}</Badge>
                </div>
                <div className="space-y-3">
                  {inProgressStories.map((story: any) => (
                    <div key={story.id} className="bg-white p-3 rounded-lg shadow-sm border border-blue-200">
                      <p className="text-sm font-medium">{story.title}</p>
                      {story.story_points != null && (
                        <Badge variant="outline" className="text-xs mt-2">{story.story_points} pts</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-green-50 rounded-lg p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-green-700">Done</h3>
                  <Badge className="bg-green-500">{doneStories.length}</Badge>
                </div>
                <div className="space-y-3">
                  {doneStories.map((story: any) => (
                    <div key={story.id} className="bg-white p-3 rounded-lg shadow-sm border border-green-200">
                      <p className="text-sm font-medium line-through text-gray-500">{story.title}</p>
                      <div className="flex items-center justify-between mt-2">
                        {story.story_points != null && (
                          <Badge variant="outline" className="text-xs">{story.story_points} pts</Badge>
                        )}
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrumDashboard;
