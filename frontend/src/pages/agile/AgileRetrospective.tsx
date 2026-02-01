import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Lightbulb, ThumbsUp, ThumbsDown, Zap, Plus, 
  CheckCircle, Loader2, MessageSquare, Vote, Users
} from 'lucide-react';

interface RetroItem {
  id: number;
  type: 'good' | 'improve' | 'action';
  content: string;
  votes: number;
  author: string;
  status?: 'open' | 'in_progress' | 'done';
  assignee?: string;
}

interface Retrospective {
  id: number;
  iteration: string;
  date: string;
  items: RetroItem[];
  participants: number;
}

const AgileRetrospective = () => {
  const { id } = useParams<{ id: string }>();
  
  const [retros, setRetros] = useState<Retrospective[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [showItemDialog, setShowItemDialog] = useState(false);
  const [selectedRetro, setSelectedRetro] = useState<Retrospective | null>(null);
  const [itemForm, setItemForm] = useState({ type: 'good', content: '' });

  useEffect(() => {
    loadRetros();
  }, [id]);

  const loadRetros = async () => {
    setLoading(true);
    setTimeout(() => {
      setRetros([
        {
          id: 1,
          iteration: 'Iteration 5',
          date: '2024-12-13',
          participants: 6,
          items: [
            { id: 1, type: 'good', content: 'Great team collaboration on OAuth feature', votes: 5, author: 'Emma' },
            { id: 2, type: 'good', content: 'Quick resolution of production bug', votes: 4, author: 'James' },
            { id: 3, type: 'good', content: 'New CI/CD pipeline is working well', votes: 3, author: 'Mike' },
            { id: 4, type: 'improve', content: 'Too many meetings interrupting focus time', votes: 6, author: 'David' },
            { id: 5, type: 'improve', content: 'Requirements not always clear at sprint start', votes: 4, author: 'Lisa' },
            { id: 6, type: 'improve', content: 'Need better test coverage for new features', votes: 3, author: 'David' },
            { id: 7, type: 'action', content: 'Block Tuesdays and Thursdays for focus time', votes: 5, author: 'Team', status: 'in_progress', assignee: 'Sarah' },
            { id: 8, type: 'action', content: 'Add acceptance criteria template to stories', votes: 4, author: 'Team', status: 'done', assignee: 'Sarah' },
          ],
        },
        {
          id: 2,
          iteration: 'Iteration 4',
          date: '2024-11-29',
          participants: 6,
          items: [
            { id: 9, type: 'good', content: 'Successfully launched MVP features', votes: 6, author: 'Team' },
            { id: 10, type: 'good', content: 'Good velocity - completed all committed stories', votes: 4, author: 'Mike' },
            { id: 11, type: 'improve', content: 'Code reviews taking too long', votes: 5, author: 'Emma' },
            { id: 12, type: 'action', content: 'Set 24-hour SLA for code reviews', votes: 5, author: 'Team', status: 'done', assignee: 'Mike' },
          ],
        },
      ]);
      setSelectedRetro({
        id: 1,
        iteration: 'Iteration 5',
        date: '2024-12-13',
        participants: 6,
        items: [
          { id: 1, type: 'good', content: 'Great team collaboration on OAuth feature', votes: 5, author: 'Emma' },
          { id: 2, type: 'good', content: 'Quick resolution of production bug', votes: 4, author: 'James' },
          { id: 3, type: 'good', content: 'New CI/CD pipeline is working well', votes: 3, author: 'Mike' },
          { id: 4, type: 'improve', content: 'Too many meetings interrupting focus time', votes: 6, author: 'David' },
          { id: 5, type: 'improve', content: 'Requirements not always clear at sprint start', votes: 4, author: 'Lisa' },
          { id: 6, type: 'improve', content: 'Need better test coverage for new features', votes: 3, author: 'David' },
          { id: 7, type: 'action', content: 'Block Tuesdays and Thursdays for focus time', votes: 5, author: 'Team', status: 'in_progress', assignee: 'Sarah' },
          { id: 8, type: 'action', content: 'Add acceptance criteria template to stories', votes: 4, author: 'Team', status: 'done', assignee: 'Sarah' },
        ],
      });
      setLoading(false);
    }, 500);
  };

  const handleVote = (itemId: number) => {
    if (!selectedRetro) return;
    setSelectedRetro({
      ...selectedRetro,
      items: selectedRetro.items.map(item =>
        item.id === itemId ? { ...item, votes: item.votes + 1 } : item
      ),
    });
  };

  const handleAddItem = () => {
    if (!selectedRetro || !itemForm.content) return;
    const newItem: RetroItem = {
      id: Date.now(),
      type: itemForm.type as RetroItem['type'],
      content: itemForm.content,
      votes: 0,
      author: 'You',
      status: itemForm.type === 'action' ? 'open' : undefined,
    };
    setSelectedRetro({
      ...selectedRetro,
      items: [...selectedRetro.items, newItem],
    });
    setShowItemDialog(false);
    setItemForm({ type: 'good', content: '' });
  };

  const getTypeIcon = (type: RetroItem['type']) => {
    switch (type) {
      case 'good': return <ThumbsUp className="h-4 w-4 text-green-500" />;
      case 'improve': return <ThumbsDown className="h-4 w-4 text-orange-500" />;
      case 'action': return <Zap className="h-4 w-4 text-blue-500" />;
    }
  };

  const getTypeColor = (type: RetroItem['type']) => {
    switch (type) {
      case 'good': return 'bg-green-50 border-green-200';
      case 'improve': return 'bg-orange-50 border-orange-200';
      case 'action': return 'bg-blue-50 border-blue-200';
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'done': return <Badge className="bg-green-500">Done</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500">In Progress</Badge>;
      default: return <Badge variant="outline">Open</Badge>;
    }
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

  const goodItems = selectedRetro?.items.filter(i => i.type === 'good').sort((a, b) => b.votes - a.votes) || [];
  const improveItems = selectedRetro?.items.filter(i => i.type === 'improve').sort((a, b) => b.votes - a.votes) || [];
  const actionItems = selectedRetro?.items.filter(i => i.type === 'action') || [];

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Lightbulb className="h-6 w-6 text-emerald-600" />
              Retrospective
            </h1>
            <p className="text-muted-foreground">Reflect, learn, and improve</p>
          </div>
          <div className="flex items-center gap-4">
            <Select 
              value={selectedRetro?.id.toString()} 
              onValueChange={(v) => setSelectedRetro(retros.find(r => r.id.toString() === v) || null)}
            >
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select retrospective" />
              </SelectTrigger>
              <SelectContent>
                {retros.map(r => (
                  <SelectItem key={r.id} value={r.id.toString()}>
                    {r.iteration}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={() => setShowDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Retro
            </Button>
          </div>
        </div>

        {selectedRetro && (
          <>
            {/* Retro Info */}
            <Card className="bg-emerald-50/50 border-emerald-200">
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-6">
                    <div>
                      <p className="text-sm text-muted-foreground">Iteration</p>
                      <p className="font-semibold">{selectedRetro.iteration}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Date</p>
                      <p className="font-semibold">{new Date(selectedRetro.date).toLocaleDateString()}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <span>{selectedRetro.participants} participants</span>
                    </div>
                  </div>
                  <Button onClick={() => setShowItemDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add Item
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Three Columns */}
            <div className="grid grid-cols-3 gap-6">
              {/* What went well */}
              <Card className="border-t-4 border-t-green-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-700">
                    <ThumbsUp className="h-5 w-5" />
                    What Went Well
                    <Badge className="bg-green-500">{goodItems.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {goodItems.map((item) => (
                    <div key={item.id} className={`p-3 rounded-lg border ${getTypeColor(item.type)}`}>
                      <p className="text-sm mb-2">{item.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">— {item.author}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6"
                          onClick={() => handleVote(item.id)}
                        >
                          <Vote className="h-3 w-3 mr-1" />
                          {item.votes}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* What to improve */}
              <Card className="border-t-4 border-t-orange-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-orange-700">
                    <ThumbsDown className="h-5 w-5" />
                    What to Improve
                    <Badge className="bg-orange-500">{improveItems.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {improveItems.map((item) => (
                    <div key={item.id} className={`p-3 rounded-lg border ${getTypeColor(item.type)}`}>
                      <p className="text-sm mb-2">{item.content}</p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">— {item.author}</span>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6"
                          onClick={() => handleVote(item.id)}
                        >
                          <Vote className="h-3 w-3 mr-1" />
                          {item.votes}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Action Items */}
              <Card className="border-t-4 border-t-blue-500">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-blue-700">
                    <Zap className="h-5 w-5" />
                    Action Items
                    <Badge className="bg-blue-500">{actionItems.length}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {actionItems.map((item) => (
                    <div key={item.id} className={`p-3 rounded-lg border ${getTypeColor(item.type)}`}>
                      <div className="flex items-start justify-between mb-2">
                        <p className="text-sm flex-1">{item.content}</p>
                        {getStatusBadge(item.status)}
                      </div>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        {item.assignee && <span>Assigned: {item.assignee}</span>}
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-6"
                          onClick={() => handleVote(item.id)}
                        >
                          <Vote className="h-3 w-3 mr-1" />
                          {item.votes}
                        </Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        )}

        {/* Tips */}
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-emerald-900 mb-2">Effective Retrospectives</h3>
            <ul className="space-y-1 text-sm text-emerald-800">
              <li>• Focus on continuous improvement, not blame</li>
              <li>• Limit action items to 2-3 per retrospective</li>
              <li>• Track action items and review in next retro</li>
              <li>• Vary retrospective formats to keep it fresh</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Add Item Dialog */}
      <Dialog open={showItemDialog} onOpenChange={setShowItemDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Retrospective Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Type</label>
              <Select value={itemForm.type} onValueChange={(v) => setItemForm({...itemForm, type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="good">
                    <div className="flex items-center gap-2">
                      <ThumbsUp className="h-4 w-4 text-green-500" />
                      What Went Well
                    </div>
                  </SelectItem>
                  <SelectItem value="improve">
                    <div className="flex items-center gap-2">
                      <ThumbsDown className="h-4 w-4 text-orange-500" />
                      What to Improve
                    </div>
                  </SelectItem>
                  <SelectItem value="action">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4 text-blue-500" />
                      Action Item
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Content</label>
              <Textarea 
                value={itemForm.content}
                onChange={(e) => setItemForm({...itemForm, content: e.target.value})}
                placeholder="Share your thoughts..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowItemDialog(false)}>Cancel</Button>
            <Button onClick={handleAddItem} disabled={!itemForm.content}>Add</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Retro Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start New Retrospective</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Iteration</label>
              <Input placeholder="e.g., Iteration 6" />
            </div>
            <div>
              <label className="text-sm font-medium">Date</label>
              <Input type="date" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button>Create</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="agile" />
    </div>
  );
};

export default AgileRetrospective;
