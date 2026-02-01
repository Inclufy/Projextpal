import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Calendar, Rocket, Target, CheckCircle, Clock, 
  Plus, Edit2, Loader2, AlertTriangle, TrendingUp
} from 'lucide-react';

interface Release {
  id: number;
  name: string;
  targetDate: string;
  status: 'planning' | 'in_progress' | 'completed';
  totalPoints: number;
  completedPoints: number;
  features: string[];
}

const AgileReleasePlanning = () => {
  const { id } = useParams<{ id: string }>();
  
  const [releases, setReleases] = useState<Release[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [velocity] = useState(24);

  useEffect(() => {
    loadReleases();
  }, [id]);

  const loadReleases = async () => {
    setLoading(true);
    setTimeout(() => {
      setReleases([
        {
          id: 1,
          name: 'Release 1.0 - MVP',
          targetDate: '2024-10-30',
          status: 'completed',
          totalPoints: 89,
          completedPoints: 89,
          features: ['User Authentication', 'Basic Dashboard', 'Project Creation'],
        },
        {
          id: 2,
          name: 'Release 2.0 - Core Features',
          targetDate: '2024-12-20',
          status: 'in_progress',
          totalPoints: 120,
          completedPoints: 72,
          features: ['Team Management', 'Task Board', 'Notifications', 'Reports'],
        },
        {
          id: 3,
          name: 'Release 3.0 - Advanced',
          targetDate: '2025-02-28',
          status: 'planning',
          totalPoints: 150,
          completedPoints: 0,
          features: ['AI Assistant', 'Integrations', 'Advanced Analytics', 'Mobile App'],
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const getStatusBadge = (status: Release['status']) => {
    switch (status) {
      case 'completed': return <Badge className="bg-green-500">Completed</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500">In Progress</Badge>;
      default: return <Badge variant="outline">Planning</Badge>;
    }
  };

  const getProgress = (release: Release) => {
    return (release.completedPoints / release.totalPoints) * 100;
  };

  const getRemainingIterations = (release: Release) => {
    const remaining = release.totalPoints - release.completedPoints;
    return Math.ceil(remaining / velocity);
  };

  const getDaysUntil = (date: string) => {
    const target = new Date(date);
    const now = new Date();
    const diff = Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff;
  };

  const isAtRisk = (release: Release) => {
    if (release.status === 'completed') return false;
    const daysRemaining = getDaysUntil(release.targetDate);
    const iterationsNeeded = getRemainingIterations(release);
    const daysNeeded = iterationsNeeded * 14; // 2-week iterations
    return daysNeeded > daysRemaining;
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      </div>
    );
  }

  const currentRelease = releases.find(r => r.status === 'in_progress');

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Calendar className="h-6 w-6 text-emerald-600" />
              Release Planning
            </h1>
            <p className="text-muted-foreground">Plan and track product releases</p>
          </div>
          <Button onClick={() => setShowDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Plan Release
          </Button>
        </div>

        {/* Velocity Info */}
        <Card className="bg-emerald-50/50 border-emerald-200">
          <CardContent className="pt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <TrendingUp className="h-8 w-8 text-emerald-600" />
                <div>
                  <p className="text-sm text-muted-foreground">Team Velocity</p>
                  <p className="text-2xl font-bold text-emerald-700">{velocity} points/iteration</p>
                </div>
              </div>
              <p className="text-sm text-muted-foreground">Based on last 5 iterations</p>
            </div>
          </CardContent>
        </Card>

        {/* Current Release Highlight */}
        {currentRelease && (
          <Card className={`border-2 ${isAtRisk(currentRelease) ? 'border-red-300 bg-red-50' : 'border-blue-300 bg-blue-50'}`}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  Current Release: {currentRelease.name}
                </CardTitle>
                {isAtRisk(currentRelease) && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" />
                    At Risk
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-4 gap-4 mb-4">
                <div>
                  <p className="text-sm text-muted-foreground">Target Date</p>
                  <p className="font-semibold">{new Date(currentRelease.targetDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Days Remaining</p>
                  <p className="font-semibold">{getDaysUntil(currentRelease.targetDate)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Points Completed</p>
                  <p className="font-semibold">{currentRelease.completedPoints} / {currentRelease.totalPoints}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Iterations Needed</p>
                  <p className="font-semibold">{getRemainingIterations(currentRelease)}</p>
                </div>
              </div>
              <Progress value={getProgress(currentRelease)} className="h-3" />
            </CardContent>
          </Card>
        )}

        {/* All Releases */}
        <div className="space-y-4">
          {releases.map((release) => (
            <Card key={release.id} className={release.status === 'in_progress' ? 'hidden' : ''}>
              <CardContent className="pt-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {release.status === 'completed' ? (
                      <CheckCircle className="h-8 w-8 text-green-500" />
                    ) : (
                      <Target className="h-8 w-8 text-gray-400" />
                    )}
                    <div>
                      <h3 className="font-semibold text-lg">{release.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                        {getStatusBadge(release.status)}
                        <span className="text-sm text-muted-foreground flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {new Date(release.targetDate).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-muted-foreground">Progress</p>
                    <p className="font-bold text-lg">{Math.round(getProgress(release))}%</p>
                  </div>
                </div>

                <Progress value={getProgress(release)} className="h-2 mb-4" />

                <div className="flex items-center justify-between">
                  <div className="flex flex-wrap gap-2">
                    {release.features.map((feature, idx) => (
                      <Badge key={idx} variant="outline">{feature}</Badge>
                    ))}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {release.completedPoints} / {release.totalPoints} points
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Release Timeline */}
        <Card>
          <CardHeader>
            <CardTitle>Release Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="relative">
              <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200" />
              {releases.map((release, idx) => (
                <div key={release.id} className="relative pl-10 pb-8 last:pb-0">
                  <div className={`absolute left-2 w-5 h-5 rounded-full border-2 ${
                    release.status === 'completed' ? 'bg-green-500 border-green-500' :
                    release.status === 'in_progress' ? 'bg-blue-500 border-blue-500' :
                    'bg-white border-gray-300'
                  }`} />
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{release.name}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(release.targetDate).toLocaleDateString('en-US', { 
                          month: 'long', 
                          day: 'numeric', 
                          year: 'numeric' 
                        })}
                      </p>
                    </div>
                    {getStatusBadge(release.status)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-emerald-900 mb-2">Release Planning Tips</h3>
            <ul className="space-y-1 text-sm text-emerald-800">
              <li>• Use velocity to forecast realistic release dates</li>
              <li>• Keep some buffer for unexpected issues (10-20%)</li>
              <li>• Review and adjust plans after each iteration</li>
              <li>• Communicate early if a release is at risk</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Add Release Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Plan New Release</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Release Name</label>
              <Input placeholder="e.g., Release 4.0 - Enterprise" />
            </div>
            <div>
              <label className="text-sm font-medium">Target Date</label>
              <Input type="date" />
            </div>
            <div>
              <label className="text-sm font-medium">Estimated Points</label>
              <Input type="number" placeholder="0" />
            </div>
            <div>
              <label className="text-sm font-medium">Key Features (comma separated)</label>
              <Input placeholder="Feature 1, Feature 2, Feature 3" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button>Create Release</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="agile" />
    </div>
  );
};

export default AgileReleasePlanning;
