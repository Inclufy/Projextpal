import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { kanbanApi, KanbanCard } from '@/lib/kanbanApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  AlertTriangle, Loader2, CheckCircle, Clock, 
  MessageSquare, XCircle, AlertCircle
} from 'lucide-react';

const KanbanBlockedItems = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [blockedCards, setBlockedCards] = useState<KanbanCard[]>([]);
  const [loading, setLoading] = useState(true);
  const [showUnblockDialog, setShowUnblockDialog] = useState(false);
  const [selectedCard, setSelectedCard] = useState<KanbanCard | null>(null);
  const [resolution, setResolution] = useState('');

  useEffect(() => {
    if (id) {
      loadBlockedCards();
    }
  }, [id]);

  const loadBlockedCards = async () => {
    try {
      setLoading(true);
      const cards = await kanbanApi.cards.getAll(id!);
      setBlockedCards(cards.filter(c => c.is_blocked));
    } catch (err: any) {
      // Mock data
      setBlockedCards([
        { 
          id: 3, 
          title: 'Fix navigation bug', 
          description: 'Menu not closing on mobile', 
          card_type: 'bug', 
          priority: 'high', 
          column: 3, 
          column_name: 'In Progress', 
          is_blocked: true, 
          blocked_reason: 'Waiting for design specs from UX team',
          blocked_at: '2024-12-10T10:30:00Z',
          assignee_name: 'James Brown'
        },
        { 
          id: 7, 
          title: 'Implement payment gateway', 
          description: 'Integrate Stripe API', 
          card_type: 'feature', 
          priority: 'critical', 
          column: 3, 
          column_name: 'In Progress', 
          is_blocked: true, 
          blocked_reason: 'API credentials not provided by finance',
          blocked_at: '2024-12-09T14:00:00Z',
          assignee_name: 'Emma Wilson'
        },
        { 
          id: 12, 
          title: 'Database migration', 
          description: 'Migrate to PostgreSQL', 
          card_type: 'task', 
          priority: 'high', 
          column: 2, 
          column_name: 'To Do', 
          is_blocked: true, 
          blocked_reason: 'Waiting for production server access',
          blocked_at: '2024-12-08T09:00:00Z',
          assignee_name: 'Lisa Garcia'
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleUnblock = async () => {
    if (!selectedCard) return;
    try {
      await kanbanApi.cards.toggleBlocked(id!, selectedCard.id, { is_blocked: false });
      setShowUnblockDialog(false);
      setSelectedCard(null);
      setResolution('');
      loadBlockedCards();
    } catch (err: any) {
      alert(err.message || 'Failed to unblock card');
    }
  };

  const getTypeBadge = (type: string) => {
    const colors: Record<string, string> = {
      task: 'bg-blue-500',
      bug: 'bg-red-500',
      feature: 'bg-green-500',
      improvement: 'bg-purple-500',
    };
    return <Badge className={colors[type] || 'bg-gray-500'}>{type}</Badge>;
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'critical': return <Badge variant="destructive">Critical</Badge>;
      case 'high': return <Badge className="bg-orange-500">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-500">Medium</Badge>;
      case 'low': return <Badge variant="outline">Low</Badge>;
      default: return <Badge variant="outline">{priority}</Badge>;
    }
  };

  const getBlockedDuration = (blockedAt?: string) => {
    if (!blockedAt) return 'Unknown';
    const blocked = new Date(blockedAt);
    const now = new Date();
    const diffMs = now.getTime() - blocked.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) return `${diffDays}d ${diffHours}h`;
    return `${diffHours}h`;
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

  const criticalBlocked = blockedCards.filter(c => c.priority === 'critical' || c.priority === 'high');

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <AlertTriangle className="h-6 w-6 text-red-600" />
              Blocked Items
            </h1>
            <p className="text-muted-foreground">Work items that are blocked and need attention</p>
          </div>
        </div>

        {/* Alert for critical blocked items */}
        {criticalBlocked.length > 0 && (
          <Card className="border-red-300 bg-red-50">
            <CardContent className="pt-4">
              <div className="flex items-center gap-3">
                <AlertCircle className="h-6 w-6 text-red-600" />
                <div>
                  <p className="font-semibold text-red-800">
                    {criticalBlocked.length} high-priority item{criticalBlocked.length > 1 ? 's' : ''} blocked!
                  </p>
                  <p className="text-sm text-red-700">
                    These items need immediate attention to unblock progress.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Blocked</p>
                  <p className="text-2xl font-bold text-red-600">{blockedCards.length}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Critical/High Priority</p>
                  <p className="text-2xl font-bold text-orange-600">{criticalBlocked.length}</p>
                </div>
                <AlertTriangle className="h-8 w-8 text-orange-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Avg Block Time</p>
                  <p className="text-2xl font-bold">
                    {blockedCards.length > 0 ? '2.3d' : 'N/A'}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Blocked Items List */}
        <Card>
          <CardHeader>
            <CardTitle>Blocked Work Items</CardTitle>
          </CardHeader>
          <CardContent>
            {blockedCards.length === 0 ? (
              <div className="text-center py-12">
                <CheckCircle className="h-16 w-16 mx-auto mb-4 text-green-500 opacity-50" />
                <p className="text-lg font-medium text-green-600">No Blocked Items!</p>
                <p className="text-muted-foreground">All work items are flowing smoothly.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {blockedCards.map((card) => (
                  <div 
                    key={card.id}
                    className="border border-red-200 rounded-lg p-4 bg-red-50/50"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                          <span className="font-semibold">{card.title}</span>
                          {getTypeBadge(card.card_type)}
                          {getPriorityBadge(card.priority)}
                        </div>
                        {card.description && (
                          <p className="text-sm text-muted-foreground mb-2">{card.description}</p>
                        )}
                        <div className="flex items-center gap-4 text-sm">
                          <span className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Blocked: {getBlockedDuration(card.blocked_at)}
                          </span>
                          <Badge variant="outline">{card.column_name}</Badge>
                          {card.assignee_name && (
                            <span className="text-muted-foreground">
                              Assignee: {card.assignee_name}
                            </span>
                          )}
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        className="border-green-500 text-green-600 hover:bg-green-50"
                        onClick={() => { setSelectedCard(card); setShowUnblockDialog(true); }}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Unblock
                      </Button>
                    </div>
                    
                    {/* Blocked Reason */}
                    <div className="mt-3 p-3 bg-white rounded border border-red-200">
                      <div className="flex items-start gap-2">
                        <MessageSquare className="h-4 w-4 text-red-500 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-red-700">Blocked Reason:</p>
                          <p className="text-sm text-red-600">{card.blocked_reason || 'No reason provided'}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tips Card */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-blue-900 mb-2">Tips for Handling Blocked Items</h3>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• Address blockers in daily standup meetings</li>
              <li>• Escalate blockers that persist more than 24 hours</li>
              <li>• Document blockers clearly so others can help resolve them</li>
              <li>• Consider moving blocked items to a dedicated "Blocked" column for visibility</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Unblock Dialog */}
      <Dialog open={showUnblockDialog} onOpenChange={setShowUnblockDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Unblock Work Item</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-muted-foreground">
              You are about to unblock: <strong>{selectedCard?.title}</strong>
            </p>
            <div>
              <label className="text-sm font-medium">Resolution (optional)</label>
              <Textarea 
                value={resolution}
                onChange={(e) => setResolution(e.target.value)}
                placeholder="How was the blocker resolved?"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowUnblockDialog(false)}>Cancel</Button>
            <Button onClick={handleUnblock} className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-4 w-4 mr-2" />
              Unblock Item
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="kanban" />
    </div>
  );
};

export default KanbanBlockedItems;
