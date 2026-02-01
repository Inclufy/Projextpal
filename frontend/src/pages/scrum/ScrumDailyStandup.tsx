import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { scrumApi, DailyStandup, StandupUpdate } from '@/lib/scrumApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Users, Plus, Clock, Loader2, CheckCircle,
  AlertTriangle, Calendar, MessageSquare
} from 'lucide-react';

const ScrumDailyStandup = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [standups, setStandups] = useState<DailyStandup[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showUpdateDialog, setShowUpdateDialog] = useState(false);
  const [selectedStandup, setSelectedStandup] = useState<DailyStandup | null>(null);
  
  const [updateForm, setUpdateForm] = useState({
    yesterday: '',
    today: '',
    blockers: '',
  });

  useEffect(() => {
    if (id) {
      loadStandups();
    }
  }, [id]);

  const loadStandups = async () => {
    try {
      setLoading(true);
      const data = await scrumApi.standups.getAll(id!);
      setStandups(data);
    } catch (err: any) {
      // Mock data
      setStandups([
        { 
          id: 1, 
          sprint: 1,
          date: new Date().toISOString().split('T')[0],
          notes: 'Sprint 5 - Day 3',
          updates: [
            { id: 1, user_name: 'Emma Wilson', yesterday: 'Completed login page styling', today: 'Working on dashboard components', blockers: '' },
            { id: 2, user_name: 'James Brown', yesterday: 'Fixed API authentication bug', today: 'Implementing user settings', blockers: 'Waiting for design specs' },
            { id: 3, user_name: 'Lisa Garcia', yesterday: 'Database optimization', today: 'Writing integration tests', blockers: '' },
          ]
        },
        { 
          id: 2, 
          sprint: 1,
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          notes: 'Sprint 5 - Day 2',
          updates: [
            { id: 4, user_name: 'Emma Wilson', yesterday: 'Started login page', today: 'Continue login page styling', blockers: '' },
            { id: 5, user_name: 'James Brown', yesterday: 'Code review', today: 'Fix API authentication bug', blockers: '' },
            { id: 6, user_name: 'Lisa Garcia', yesterday: 'Schema migration', today: 'Database optimization', blockers: '' },
          ]
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateStandup = async () => {
    try {
      await scrumApi.standups.create(id!, {
        date: new Date().toISOString().split('T')[0],
        notes: `Daily Standup - ${new Date().toLocaleDateString()}`,
      });
      setShowDialog(false);
      loadStandups();
    } catch (err: any) {
      alert(err.message || 'Failed to create standup');
    }
  };

  const handleAddUpdate = async () => {
    if (!selectedStandup) return;
    try {
      await scrumApi.standups.addUpdate(id!, selectedStandup.id, updateForm);
      setShowUpdateDialog(false);
      setUpdateForm({ yesterday: '', today: '', blockers: '' });
      loadStandups();
    } catch (err: any) {
      alert(err.message || 'Failed to add update');
    }
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date(Date.now() - 86400000);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('nl-NL', { weekday: 'long', month: 'short', day: 'numeric' });
  };

  const todayStandup = standups.find(s => s.date === new Date().toISOString().split('T')[0]);

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

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-purple-600" />
              Daily Standup
            </h1>
            <p className="text-muted-foreground">Track daily progress and blockers</p>
          </div>
          {!todayStandup && (
            <Button onClick={() => setShowDialog(true)} className="bg-purple-600 hover:bg-purple-700">
              <Plus className="h-4 w-4 mr-2" />
              Start Today's Standup
            </Button>
          )}
        </div>

        {/* Info Card */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex gap-4">
              <Clock className="h-6 w-6 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-purple-900">Daily Standup Format</h3>
                <p className="text-sm text-purple-800 mt-1">
                  Each team member answers three questions: 
                  <strong> What did I do yesterday?</strong>, 
                  <strong> What will I do today?</strong>, and 
                  <strong> Are there any blockers?</strong>
                  Keep it brief - standups should be 15 minutes or less.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Standups</p>
              <p className="text-2xl font-bold">{standups.length}</p>
            </CardContent>
          </Card>
          <Card className={todayStandup ? 'border-green-200' : 'border-yellow-200'}>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Today's Status</p>
              <p className="text-2xl font-bold">
                {todayStandup ? (
                  <span className="text-green-600 flex items-center gap-2">
                    <CheckCircle className="h-5 w-5" /> Complete
                  </span>
                ) : (
                  <span className="text-yellow-600 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" /> Pending
                  </span>
                )}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Active Blockers</p>
              <p className="text-2xl font-bold text-red-600">
                {standups[0]?.updates?.filter(u => u.blockers).length || 0}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Standups List */}
        {standups.map((standup) => (
          <Card key={standup.id}>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                {formatDate(standup.date)}
                {standup.notes && <Badge variant="outline">{standup.notes}</Badge>}
              </CardTitle>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => { setSelectedStandup(standup); setShowUpdateDialog(true); }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Add Update
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {standup.updates?.map((update) => (
                  <div key={update.id} className="border rounded-lg p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className="bg-purple-100 text-purple-700 text-sm">
                          {getInitials(update.user_name)}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{update.user_name}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground mb-1">Yesterday</p>
                        <p>{update.yesterday || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Today</p>
                        <p>{update.today || '-'}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground mb-1">Blockers</p>
                        {update.blockers ? (
                          <p className="text-red-600 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            {update.blockers}
                          </p>
                        ) : (
                          <p className="text-green-600">No blockers</p>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
                {(!standup.updates || standup.updates.length === 0) && (
                  <p className="text-center text-muted-foreground py-4">No updates recorded yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {standups.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No standups recorded yet</p>
              <Button className="mt-4 bg-purple-600 hover:bg-purple-700" onClick={() => setShowDialog(true)}>
                Start First Standup
              </Button>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Create Standup Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Today's Standup</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground">
            This will create a new daily standup for {new Date().toLocaleDateString()}.
            Team members can then add their updates.
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleCreateStandup} className="bg-purple-600 hover:bg-purple-700">Create Standup</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Update Dialog */}
      <Dialog open={showUpdateDialog} onOpenChange={setShowUpdateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Your Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">What did you do yesterday?</label>
              <Textarea 
                value={updateForm.yesterday}
                onChange={(e) => setUpdateForm({...updateForm, yesterday: e.target.value})}
                placeholder="Describe what you accomplished..."
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">What will you do today?</label>
              <Textarea 
                value={updateForm.today}
                onChange={(e) => setUpdateForm({...updateForm, today: e.target.value})}
                placeholder="Describe your plans for today..."
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Any blockers?</label>
              <Textarea 
                value={updateForm.blockers}
                onChange={(e) => setUpdateForm({...updateForm, blockers: e.target.value})}
                placeholder="Leave empty if no blockers..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUpdateDialog(false)}>Cancel</Button>
            <Button onClick={handleAddUpdate} disabled={!updateForm.yesterday && !updateForm.today} className="bg-purple-600 hover:bg-purple-700">
              Add Update
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="scrum" />
    </div>
  );
};

export default ScrumDailyStandup;
