import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Target, Edit2, Plus, Trash2, CheckCircle, 
  Users, Lightbulb, Star, Loader2
} from 'lucide-react';

interface Goal {
  id: number;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'not_started' | 'in_progress' | 'achieved';
}

const AgileProductVision = () => {
  const { id } = useParams<{ id: string }>();
  
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [showGoalDialog, setShowGoalDialog] = useState(false);
  
  const [vision, setVision] = useState({
    statement: '',
    targetAudience: '',
    problemStatement: '',
    uniqueValue: '',
    successCriteria: '',
  });
  
  const [goals, setGoals] = useState<Goal[]>([]);
  const [goalForm, setGoalForm] = useState({ title: '', description: '', priority: 'medium' });

  useEffect(() => {
    loadVision();
  }, [id]);

  const loadVision = async () => {
    setLoading(true);
    setTimeout(() => {
      setVision({
        statement: 'To create an intuitive project management platform that empowers teams to deliver value faster through streamlined collaboration and real-time visibility.',
        targetAudience: 'Mid-size technology companies with distributed teams who need flexible, methodology-agnostic project management solutions.',
        problemStatement: 'Teams struggle with fragmented tools, lack of visibility across projects, and rigid methodologies that don\'t fit their unique workflows.',
        uniqueValue: 'A unified platform that adapts to your methodology - whether Agile, Waterfall, or hybrid - with AI-powered insights and seamless integrations.',
        successCriteria: '• 50% reduction in time to project visibility\n• 90% user adoption within 3 months\n• NPS score > 50\n• 30% improvement in on-time delivery',
      });
      setGoals([
        { id: 1, title: 'Launch MVP', description: 'Core features for Agile project management', priority: 'high', status: 'achieved' },
        { id: 2, title: 'Multi-methodology Support', description: 'Support for Scrum, Kanban, Waterfall, and PRINCE2', priority: 'high', status: 'in_progress' },
        { id: 3, title: 'AI Assistant Integration', description: 'AI-powered recommendations and insights', priority: 'medium', status: 'in_progress' },
        { id: 4, title: 'Enterprise Features', description: 'SSO, audit logs, advanced permissions', priority: 'medium', status: 'not_started' },
      ]);
      setLoading(false);
    }, 500);
  };

  const handleSaveVision = () => {
    setIsEditing(false);
    // Save to API
  };

  const handleAddGoal = () => {
    const newGoal: Goal = {
      id: Date.now(),
      title: goalForm.title,
      description: goalForm.description,
      priority: goalForm.priority as Goal['priority'],
      status: 'not_started',
    };
    setGoals([...goals, newGoal]);
    setShowGoalDialog(false);
    setGoalForm({ title: '', description: '', priority: 'medium' });
  };

  const handleDeleteGoal = (goalId: number) => {
    if (!confirm('Delete this goal?')) return;
    setGoals(goals.filter(g => g.id !== goalId));
  };

  const getStatusBadge = (status: Goal['status']) => {
    switch (status) {
      case 'achieved': return <Badge className="bg-green-500">Achieved</Badge>;
      case 'in_progress': return <Badge className="bg-blue-500">In Progress</Badge>;
      default: return <Badge variant="outline">Not Started</Badge>;
    }
  };

  const getPriorityBadge = (priority: Goal['priority']) => {
    switch (priority) {
      case 'high': return <Badge variant="destructive">High</Badge>;
      case 'medium': return <Badge className="bg-yellow-500">Medium</Badge>;
      default: return <Badge variant="outline">Low</Badge>;
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

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <Target className="h-6 w-6 text-emerald-600" />
              Product Vision
            </h1>
            <p className="text-muted-foreground">Define and communicate the product direction</p>
          </div>
          <Button onClick={() => setIsEditing(!isEditing)}>
            <Edit2 className="h-4 w-4 mr-2" />
            {isEditing ? 'Cancel' : 'Edit Vision'}
          </Button>
        </div>

        {/* Vision Statement */}
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-emerald-600" />
              Vision Statement
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isEditing ? (
              <Textarea 
                value={vision.statement}
                onChange={(e) => setVision({...vision, statement: e.target.value})}
                rows={3}
                className="bg-white"
              />
            ) : (
              <p className="text-lg font-medium text-emerald-900">{vision.statement}</p>
            )}
          </CardContent>
        </Card>

        {/* Vision Details */}
        <div className="grid grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Target Audience
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea 
                  value={vision.targetAudience}
                  onChange={(e) => setVision({...vision, targetAudience: e.target.value})}
                  rows={3}
                />
              ) : (
                <p className="text-muted-foreground">{vision.targetAudience}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5" />
                Problem Statement
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea 
                  value={vision.problemStatement}
                  onChange={(e) => setVision({...vision, problemStatement: e.target.value})}
                  rows={3}
                />
              ) : (
                <p className="text-muted-foreground">{vision.problemStatement}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Unique Value Proposition</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea 
                  value={vision.uniqueValue}
                  onChange={(e) => setVision({...vision, uniqueValue: e.target.value})}
                  rows={3}
                />
              ) : (
                <p className="text-muted-foreground">{vision.uniqueValue}</p>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5" />
                Success Criteria
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <Textarea 
                  value={vision.successCriteria}
                  onChange={(e) => setVision({...vision, successCriteria: e.target.value})}
                  rows={4}
                />
              ) : (
                <pre className="text-sm text-muted-foreground whitespace-pre-wrap font-sans">
                  {vision.successCriteria}
                </pre>
              )}
            </CardContent>
          </Card>
        </div>

        {isEditing && (
          <div className="flex justify-end">
            <Button onClick={handleSaveVision}>Save Vision</Button>
          </div>
        )}

        {/* Product Goals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Product Goals</CardTitle>
            <Button size="sm" onClick={() => setShowGoalDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {goals.map((goal) => (
                <div key={goal.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium">{goal.title}</span>
                      {getPriorityBadge(goal.priority)}
                      {getStatusBadge(goal.status)}
                    </div>
                    <p className="text-sm text-muted-foreground">{goal.description}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="text-red-600" onClick={() => handleDeleteGoal(goal.id)}>
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Vision Tips */}
        <Card className="bg-emerald-50 border-emerald-200">
          <CardContent className="pt-4">
            <h3 className="font-semibold text-emerald-900 mb-2">Effective Product Vision</h3>
            <ul className="space-y-1 text-sm text-emerald-800">
              <li>• <strong>Inspiring:</strong> Motivates the team and stakeholders</li>
              <li>• <strong>Clear:</strong> Easy to understand and communicate</li>
              <li>• <strong>Stable:</strong> Provides long-term direction</li>
              <li>• <strong>Measurable:</strong> Has clear success criteria</li>
            </ul>
          </CardContent>
        </Card>
      </div>

      {/* Add Goal Dialog */}
      <Dialog open={showGoalDialog} onOpenChange={setShowGoalDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Product Goal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Goal Title</label>
              <Input 
                value={goalForm.title}
                onChange={(e) => setGoalForm({...goalForm, title: e.target.value})}
                placeholder="e.g., Launch mobile app"
              />
            </div>
            <div>
              <label className="text-sm font-medium">Description</label>
              <Textarea 
                value={goalForm.description}
                onChange={(e) => setGoalForm({...goalForm, description: e.target.value})}
                placeholder="Describe the goal..."
                rows={3}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Priority</label>
              <select 
                value={goalForm.priority}
                onChange={(e) => setGoalForm({...goalForm, priority: e.target.value})}
                className="w-full border rounded-md p-2"
              >
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowGoalDialog(false)}>Cancel</Button>
            <Button onClick={handleAddGoal} disabled={!goalForm.title}>Add Goal</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

          {/* Methodology Help Panel */}
          <MethodologyHelpPanel methodology="agile" />
    </div>
  );
};

export default AgileProductVision;
