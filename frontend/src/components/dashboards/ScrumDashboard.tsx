import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Target, CheckCircle2, Clock, TrendingUp, Flame } from 'lucide-react';

interface ScrumDashboardProps {
  project: any;
}

const ScrumDashboard = ({ project }: ScrumDashboardProps) => {
  const currentSprint = {
    name: 'Sprint 3',
    goal: 'Complete user authentication and dashboard',
    daysRemaining: 4,
    totalPoints: 34,
    completedPoints: 21,
    stories: [
      { id: 1, title: 'User login functionality', points: 5, status: 'done' },
      { id: 2, title: 'Password reset flow', points: 3, status: 'done' },
      { id: 3, title: 'Dashboard layout', points: 8, status: 'in_progress' },
      { id: 4, title: 'API integration', points: 8, status: 'in_progress' },
      { id: 5, title: 'Unit tests', points: 5, status: 'todo' },
      { id: 6, title: 'Documentation', points: 5, status: 'todo' },
    ]
  };

  const todoStories = currentSprint.stories.filter(s => s.status === 'todo');
  const inProgressStories = currentSprint.stories.filter(s => s.status === 'in_progress');
  const doneStories = currentSprint.stories.filter(s => s.status === 'done');

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Flame className="h-6 w-6" />
              <h2 className="text-2xl font-bold">{currentSprint.name}</h2>
            </div>
            <p className="text-amber-100">{currentSprint.goal}</p>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{currentSprint.daysRemaining}</div>
            <div className="text-amber-100">days remaining</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-1">
            <span>Sprint Progress</span>
            <span>{currentSprint.completedPoints}/{currentSprint.totalPoints} points</span>
          </div>
          <div className="w-full bg-white/20 rounded-full h-3">
            <div className="bg-white rounded-full h-3" style={{ width: `${(currentSprint.completedPoints / currentSprint.totalPoints) * 100}%` }} />
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
                <p className="text-2xl font-bold">30</p>
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
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-700">To Do</h3>
                <Badge variant="secondary">{todoStories.length}</Badge>
              </div>
              <div className="space-y-3">
                {todoStories.map(story => (
                  <div key={story.id} className="bg-white p-3 rounded-lg shadow-sm border">
                    <p className="text-sm font-medium">{story.title}</p>
                    <Badge variant="outline" className="text-xs mt-2">{story.points} pts</Badge>
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
                {inProgressStories.map(story => (
                  <div key={story.id} className="bg-white p-3 rounded-lg shadow-sm border border-blue-200">
                    <p className="text-sm font-medium">{story.title}</p>
                    <Badge variant="outline" className="text-xs mt-2">{story.points} pts</Badge>
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
                {doneStories.map(story => (
                  <div key={story.id} className="bg-white p-3 rounded-lg shadow-sm border border-green-200">
                    <p className="text-sm font-medium line-through text-gray-500">{story.title}</p>
                    <div className="flex items-center justify-between mt-2">
                      <Badge variant="outline" className="text-xs">{story.points} pts</Badge>
                      <CheckCircle2 className="h-4 w-4 text-green-500" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ScrumDashboard;
