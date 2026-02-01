import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Users, Calendar, AlertTriangle, CheckCircle, 
  Clock, Plus, Loader2, MessageSquare
} from 'lucide-react';

interface StandupEntry {
  id: number;
  member: { name: string; initials: string; role: string };
  yesterday: string;
  today: string;
  blockers: string;
  date: string;
  has_blockers: boolean;
}

const AgileDailyProgress = () => {
  const { id } = useParams<{ id: string }>();
  
  const [entries, setEntries] = useState<StandupEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  
  const [form, setForm] = useState({
    yesterday: '',
    today: '',
    blockers: '',
  });

  useEffect(() => {
    loadEntries();
  }, [id, selectedDate]);

  const loadEntries = async () => {
    setLoading(true);
    setTimeout(() => {
      setEntries([
        {
          id: 1,
          member: { name: 'Emma Wilson', initials: 'EW', role: 'Developer' },
          yesterday: 'Completed OAuth login flow, fixed token refresh bug',
          today: 'Starting on social login (Google), code review for dashboard PR',
          blockers: '',
          date: selectedDate,
          has_blockers: false,
        },
        {
          id: 2,
          member: { name: 'James Brown', initials: 'JB', role: 'Developer' },
          yesterday: 'Worked on database migrations, 80% complete',
          today: 'Finishing migrations, will start on API endpoints',
          blockers: 'Need access to staging database - waiting on DevOps',
          date: selectedDate,
          has_blockers: true,
        },
        {
          id: 3,
          member: { name: 'Lisa Garcia', initials: 'LG', role: 'Designer' },
          yesterday: 'Finished settings page mockups, design review with PM',
          today: 'Mobile responsive designs for dashboard',
          blockers: '',
          date: selectedDate,
          has_blockers: false,
        },
        {
          id: 4,
          member: { name: 'David Kim', initials: 'DK', role: 'QA' },
          yesterday: 'Wrote test cases for auth module, found 2 bugs',
          today: 'Automation scripts for login tests, regression testing',
          blockers: '',
          date: selectedDate,
          has_blockers: false,
        },
        {
          id: 5,
          member: { name: 'Mike Johnson', initials: 'MJ', role: 'Tech Lead' },
          yesterday: 'Architecture review, helped Emma with OAuth implementation',
          today: 'CI/CD pipeline setup, sprint planning prep',
          blockers: 'Need decision on deployment strategy from PM',
          date: selectedDate,
          has_blockers: true,
        },
      ]);
      setLoading(false);
    }, 500);
  };

  const handleSubmit = () => {
    // Submit standup entry
    setShowDialog(false);
    setForm({ yesterday: '', today: '', blockers: '' });
  };

  const blockersCount = entries.filter(e => e.has_blockers).length;

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

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Users className="h-6 w-6 text-emerald-600" />
              Daily Progress
            </h1>
            <p className="text-muted-foreground">Team standup updates</p>
          </div>
          <div className="flex items-center gap-4">
            <input 
              type="date" 
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="border rounded-md px-3 py-2"
            />
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Update
            </Button>
          </div>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Team Updates</p>
                  <p className="text-2xl font-bold">{entries.length}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card className={blockersCount > 0 ? 'border-red-200 bg-red-50' : ''}>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Blockers</p>
                  <p className={`text-2xl font-bold ${blockersCount > 0 ? 'text-red-600' : ''}`}>
                    {blockersCount}
                  </p>
                </div>
                <AlertTriangle className={`h-8 w-8 ${blockersCount > 0 ? 'text-red-500' : 'text-gray-300'}`} />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="text-lg font-bold">
                    {new Date(selectedDate).toLocaleDateString('en-US', { 
                      weekday: 'short', 
                      month: 'short', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blockers Alert */}
        {blockersCount > 0 && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
                <div>
                  <p className="font-semibold text-red-800">{blockersCount} team member(s) have blockers</p>
                  <ul className="mt-2 space-y-1">
                    {entries.filter(e => e.has_blockers).map((entry) => (
                      <li key={entry.id} className="text-sm text-red-700">
                        <strong>{entry.member.name}:</strong> {entry.blockers}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Team Updates */}
        <div className="space-y-4">
          {entries.map((entry) => (
            <Card key={entry.id} className={entry.has_blockers ? 'border-l-4 border-l-red-500' : ''}>
              <CardContent className="pt-4">
                <div className="flex items-start gap-4">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-emerald-100 text-emerald-700">
                      {entry.member.initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="font-semibold">{entry.member.name}</span>
                      <Badge variant="outline">{entry.member.role}</Badge>
                      {entry.has_blockers && (
                        <Badge variant="destructive" className="flex items-center gap-1">
                          <AlertTriangle className="h-3 w-3" />
                          Blocked
                        </Badge>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-muted/50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-muted-foreground mb-1 flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          Yesterday
                        </p>
                        <p className="text-sm">{entry.yesterday}</p>
                      </div>
                      <div className="bg-emerald-50 p-3 rounded-lg">
                        <p className="text-xs font-medium text-emerald-700 mb-1 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          Today
                        </p>
                        <p className="text-sm">{entry.today}</p>
                      </div>
                      {entry.blockers && (
                        <div className="bg-red-50 p-3 rounded-lg">
                          <p className="text-xs font-medium text-red-700 mb-1 flex items-center gap-1">
                            <AlertTriangle className="h-3 w-3" />
                            Blockers
                          </p>
                          <p className="text-sm text-red-800">{entry.blockers}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {entries.length === 0 && (
          <Card>
            <CardContent className="text-center py-12">
              <MessageSquare className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-muted-foreground">No updates for this date</p>
              <Button className="mt-4" onClick={() => setShowDialog(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Update
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Tips */}
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-emerald-900 mb-2">Effective Daily Standups</h3>
            <ul className="space-y-1 text-sm text-emerald-800">
              <li>• Keep updates brief (2-3 minutes per person)</li>
              <li>• Focus on work, not status reports</li>
              <li>• Surface blockers immediately for resolution</li>
              <li>• Take detailed discussions offline</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Add Update Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Daily Update</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">What did you do yesterday?</label>
              <Textarea 
                value={form.yesterday}
                onChange={(e) => setForm({...form, yesterday: e.target.value})}
                placeholder="Tasks completed, progress made..."
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">What will you do today?</label>
              <Textarea 
                value={form.today}
                onChange={(e) => setForm({...form, today: e.target.value})}
                placeholder="Planned tasks, goals..."
                rows={2}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Any blockers?</label>
              <Textarea 
                value={form.blockers}
                onChange={(e) => setForm({...form, blockers: e.target.value})}
                placeholder="Leave empty if none..."
                rows={2}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button onClick={handleSubmit} disabled={!form.yesterday || !form.today}>Submit</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="agile" />
    </div>
  );
};

export default AgileDailyProgress;
