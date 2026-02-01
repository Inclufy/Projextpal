import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { scrumApi, Sprint, SprintRetrospective, Velocity } from '@/lib/scrumApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  MessageSquare, Plus, ThumbsUp, ThumbsDown, Lightbulb, 
  Loader2, AlertCircle, TrendingUp, Heart, Smile, Meh, Frown
} from 'lucide-react';

const ScrumRetrospectivePage = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [selectedSprint, setSelectedSprint] = useState<Sprint | null>(null);
  const [retrospectives, setRetrospectives] = useState<SprintRetrospective[]>([]);
  const [velocities, setVelocities] = useState<Velocity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Dialog state
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState({
    sprint: '',
    went_well: '',
    to_improve: '',
    action_items: '',
    team_morale: 3,
  });

  useEffect(() => {
    if (id) {
      loadData();
    }
  }, [id]);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [sprintsRes, retrosRes, velocityRes] = await Promise.all([
        scrumApi.sprints.getAll(id!),
        scrumApi.retrospectives.getAll(id!),
        scrumApi.velocity.getAll(id!),
      ]);
      
      setSprints(sprintsRes);
      setRetrospectives(retrosRes);
      setVelocities(velocityRes);
      
      // Select completed sprint if available
      const completedSprint = sprintsRes.find(s => s.status === 'completed');
      if (completedSprint) {
        setSelectedSprint(completedSprint);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      const data: Partial<SprintRetrospective> = {
        sprint: parseInt(formData.sprint),
        went_well: formData.went_well || undefined,
        to_improve: formData.to_improve || undefined,
        action_items: formData.action_items || undefined,
        team_morale: formData.team_morale,
        date: new Date().toISOString().split('T')[0],
      };
      
      await scrumApi.retrospectives.create(id!, data);
      setShowCreateDialog(false);
      setFormData({
        sprint: '',
        went_well: '',
        to_improve: '',
        action_items: '',
        team_morale: 3,
      });
      loadData();
    } catch (err: any) {
      alert(err.message || 'Failed to create retrospective');
    }
  };

  const getMoraleIcon = (morale: number) => {
    if (morale >= 4) return <Smile className="h-5 w-5 text-green-500" />;
    if (morale >= 3) return <Meh className="h-5 w-5 text-yellow-500" />;
    return <Frown className="h-5 w-5 text-red-500" />;
  };

  const getMoraleColor = (morale: number) => {
    if (morale >= 4) return 'bg-green-100 text-green-700';
    if (morale >= 3) return 'bg-yellow-100 text-yellow-700';
    return 'bg-red-100 text-red-700';
  };

  // Get retro for selected sprint
  const selectedRetro = selectedSprint 
    ? retrospectives.find(r => r.sprint === selectedSprint.id)
    : null;

  const selectedVelocity = selectedSprint
    ? velocities.find(v => v.sprint === selectedSprint.id)
    : null;

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

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              Sprint Retrospective
            </h1>
            <p className="text-muted-foreground">Reflect on the sprint and identify improvements</p>
          </div>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />New Retrospective
          </Button>
        </div>

        {/* Sprint Selector */}
        <div className="flex gap-4 items-center">
          <label className="text-sm font-medium">Select Sprint:</label>
          <Select 
            value={selectedSprint?.id.toString() || ''} 
            onValueChange={(val) => setSelectedSprint(sprints.find(s => s.id === parseInt(val)) || null)}
          >
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Choose a sprint" />
            </SelectTrigger>
            <SelectContent>
              {sprints.map(sprint => (
                <SelectItem key={sprint.id} value={sprint.id.toString()}>
                  {sprint.name} ({sprint.status})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Velocity Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Velocity Trend
            </CardTitle>
          </CardHeader>
          <CardContent>
            {velocities.length > 0 ? (
              <div className="flex items-end gap-4 h-40">
                {velocities.slice(-5).map((v, i) => (
                  <div key={v.id} className="flex flex-col items-center flex-1">
                    <div 
                      className="w-full bg-blue-500 rounded-t"
                      style={{ height: `${(v.completed_points / Math.max(...velocities.map(x => x.committed_points))) * 100}%` }}
                    />
                    <div 
                      className="w-full bg-blue-200 rounded-t"
                      style={{ height: `${((v.committed_points - v.completed_points) / Math.max(...velocities.map(x => x.committed_points))) * 100}%` }}
                    />
                    <span className="text-xs mt-2 text-muted-foreground">{v.sprint_name}</span>
                    <span className="text-xs font-medium">{v.completed_points}/{v.committed_points}</span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">No velocity data yet</p>
            )}
          </CardContent>
        </Card>

        {/* Retrospective Content */}
        {selectedSprint && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* What Went Well */}
            <Card className="bg-green-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-green-700">
                  <ThumbsUp className="h-4 w-4" />
                  What Went Well
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRetro?.went_well ? (
                  <p className="text-sm whitespace-pre-wrap">{selectedRetro.went_well}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No feedback recorded</p>
                )}
              </CardContent>
            </Card>

            {/* What Could Improve */}
            <Card className="bg-orange-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-orange-700">
                  <ThumbsDown className="h-4 w-4" />
                  What Could Improve
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRetro?.to_improve ? (
                  <p className="text-sm whitespace-pre-wrap">{selectedRetro.to_improve}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No feedback recorded</p>
                )}
              </CardContent>
            </Card>

            {/* Action Items */}
            <Card className="bg-blue-50/50">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm flex items-center gap-2 text-blue-700">
                  <Lightbulb className="h-4 w-4" />
                  Action Items
                </CardTitle>
              </CardHeader>
              <CardContent>
                {selectedRetro?.action_items ? (
                  <p className="text-sm whitespace-pre-wrap">{selectedRetro.action_items}</p>
                ) : (
                  <p className="text-sm text-muted-foreground italic">No action items</p>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Sprint Summary */}
        {selectedSprint && (
          <div className="grid grid-cols-4 gap-4">
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Committed</p>
                <p className="text-2xl font-bold">{selectedVelocity?.committed_points || 0} pts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Completed</p>
                <p className="text-2xl font-bold text-green-600">{selectedVelocity?.completed_points || 0} pts</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-muted-foreground">Completion Rate</p>
                <p className="text-2xl font-bold">{selectedVelocity?.completion_rate || 0}%</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4 flex items-center gap-2">
                <div>
                  <p className="text-sm text-muted-foreground">Team Morale</p>
                  <div className="flex items-center gap-2">
                    <p className="text-2xl font-bold">{selectedRetro?.team_morale || '-'}/5</p>
                    {selectedRetro && getMoraleIcon(selectedRetro.team_morale || 3)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Previous Retrospectives */}
        <Card>
          <CardHeader>
            <CardTitle>Retrospective History</CardTitle>
          </CardHeader>
          <CardContent>
            {retrospectives.length > 0 ? (
              <div className="space-y-3">
                {retrospectives.map(retro => (
                  <div key={retro.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50">
                    <div className="flex items-center gap-4">
                      <Badge variant="outline">{retro.sprint_name}</Badge>
                      <span className="text-sm text-muted-foreground">{retro.date}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      {retro.team_morale && (
                        <Badge className={getMoraleColor(retro.team_morale)}>
                          Morale: {retro.team_morale}/5
                        </Badge>
                      )}
                      {getMoraleIcon(retro.team_morale || 3)}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-4">No retrospectives recorded yet</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Create Dialog */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>New Sprint Retrospective</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Sprint</label>
              <Select value={formData.sprint} onValueChange={(val) => setFormData({...formData, sprint: val})}>
                <SelectTrigger>
                  <SelectValue placeholder="Select sprint" />
                </SelectTrigger>
                <SelectContent>
                  {sprints.filter(s => s.status === 'completed' || s.status === 'review').map(sprint => (
                    <SelectItem key={sprint.id} value={sprint.id.toString()}>
                      {sprint.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-green-700 flex items-center gap-2">
                  <ThumbsUp className="h-4 w-4" /> What Went Well
                </label>
                <Textarea 
                  value={formData.went_well}
                  onChange={(e) => setFormData({...formData, went_well: e.target.value})}
                  placeholder="Things that worked well..."
                  className="h-32"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-orange-700 flex items-center gap-2">
                  <ThumbsDown className="h-4 w-4" /> What Could Improve
                </label>
                <Textarea 
                  value={formData.to_improve}
                  onChange={(e) => setFormData({...formData, to_improve: e.target.value})}
                  placeholder="Areas for improvement..."
                  className="h-32"
                />
              </div>
            </div>
            
            <div>
              <label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                <Lightbulb className="h-4 w-4" /> Action Items
              </label>
              <Textarea 
                value={formData.action_items}
                onChange={(e) => setFormData({...formData, action_items: e.target.value})}
                placeholder="Specific actions to take in the next sprint..."
                className="h-24"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium flex items-center gap-2">
                <Heart className="h-4 w-4" /> Team Morale (1-5)
              </label>
              <div className="flex gap-2 mt-2">
                {[1, 2, 3, 4, 5].map(rating => (
                  <Button
                    key={rating}
                    variant={formData.team_morale === rating ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setFormData({...formData, team_morale: rating})}
                  >
                    {rating}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreateDialog(false)}>Cancel</Button>
            <Button onClick={handleCreate} disabled={!formData.sprint}>Save Retrospective</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="scrum" />
    </div>
  );
};

export default ScrumRetrospectivePage;
