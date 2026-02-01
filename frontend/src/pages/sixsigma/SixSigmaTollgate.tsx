import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { sixsigmaApi, TollgateReview } from '@/lib/sixsigmaApi';
import { CheckSquare, Plus, Trash2, Loader2, AlertCircle, CheckCircle, XCircle, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
const phases = [
  { value: 'define', label: 'Define', color: 'bg-blue-500' },
  { value: 'measure', label: 'Measure', color: 'bg-purple-500' },
  { value: 'analyze', label: 'Analyze', color: 'bg-yellow-500' },
  { value: 'improve', label: 'Improve', color: 'bg-orange-500' },
  { value: 'control', label: 'Control', color: 'bg-green-500' },
];

const SixSigmaTollgate = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  const { toast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [reviews, setReviews] = useState<TollgateReview[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [newReview, setNewReview] = useState({
    phase: 'define',
    review_date: new Date().toISOString().split('T')[0],
    reviewer: '',
    deliverables_completed: '',
    deliverables_pending: '',
    issues: '',
    recommendations: '',
    decision: 'pending',
    next_steps: '',
  });

  useEffect(() => {
    if (id) loadReviews();
  }, [id]);

  const loadReviews = async () => {
    if (!id) return;
    setLoading(true);
    try {
      const data = await sixsigmaApi.tollgates.getAll(id);
      setReviews(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load tollgate reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    if (!id) return;
    setSaving(true);
    try {
      const created = await sixsigmaApi.tollgates.create(id, newReview);
      setReviews([...reviews, created]);
      setShowForm(false);
      setNewReview({
        phase: 'define',
        review_date: new Date().toISOString().split('T')[0],
        reviewer: '',
        deliverables_completed: '',
        deliverables_pending: '',
        issues: '',
        recommendations: '',
        decision: 'pending',
        next_steps: '',
      });
      toast({ title: 'Review Created', description: 'Tollgate review added.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (reviewId: number) => {
    if (!id) return;
    try {
      await sixsigmaApi.tollgates.delete(id, reviewId);
      setReviews(reviews.filter(r => r.id !== reviewId));
      toast({ title: 'Deleted', description: 'Review removed.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const handleUpdateDecision = async (reviewId: number, decision: string) => {
    if (!id) return;
    try {
      await sixsigmaApi.tollgates.update(id, reviewId, { decision });
      setReviews(reviews.map(r => r.id === reviewId ? { ...r, decision } : r));
      toast({ title: 'Updated', description: 'Decision recorded.' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const decisionConfig: Record<string, { color: string; icon: any; label: string }> = {
    pending: { color: 'bg-gray-500', icon: Clock, label: 'Pending' },
    approved: { color: 'bg-green-500', icon: CheckCircle, label: 'Approved' },
    conditional: { color: 'bg-yellow-500', icon: AlertCircle, label: 'Conditional' },
    rejected: { color: 'bg-red-500', icon: XCircle, label: 'Rejected' },
  };

  if (loading) {
    return (
      <div className="min-h-full bg-background">
        <ProjectHeader />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // Group by phase
  const reviewsByPhase = phases.map(phase => ({
    ...phase,
    reviews: reviews.filter(r => r.phase === phase.value),
  }));

  return (
    <div className="min-h-full bg-background">
      <ProjectHeader />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <CheckSquare className="h-6 w-6 text-green-600" />
              Tollgate Reviews
            </h1>
            <p className="text-muted-foreground">Phase gate reviews for DMAIC project progression</p>
          </div>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="h-4 w-4 mr-2" />
            New Review
          </Button>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center gap-2 text-red-700">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        )}

        {/* Phase Progress */}
        <div className="flex items-center gap-2">
          {phases.map((phase, index) => {
            const phaseReviews = reviews.filter(r => r.phase === phase.value);
            const approved = phaseReviews.some(r => r.decision === 'approved');
            return (
              <div key={phase.value} className="flex items-center">
                <div className={`w-24 h-12 rounded-lg flex flex-col items-center justify-center text-white text-xs
                  ${approved ? phase.color : 'bg-gray-300'}`}>
                  <span className="font-medium">{phase.label}</span>
                  {approved && <CheckCircle className="h-3 w-3 mt-1" />}
                </div>
                {index < phases.length - 1 && (
                  <div className={`w-8 h-1 ${approved ? 'bg-green-500' : 'bg-gray-300'}`} />
                )}
              </div>
            );
          })}
        </div>

        {/* New Review Form */}
        {showForm && (
          <Card>
            <CardHeader>
              <CardTitle>Create Tollgate Review</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="text-sm font-medium">Phase</label>
                  <Select value={newReview.phase} onValueChange={(v) => setNewReview({ ...newReview, phase: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {phases.map(p => (
                        <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Review Date</label>
                  <Input
                    type="date"
                    value={newReview.review_date}
                    onChange={(e) => setNewReview({ ...newReview, review_date: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Reviewer</label>
                  <Input
                    value={newReview.reviewer}
                    onChange={(e) => setNewReview({ ...newReview, reviewer: e.target.value })}
                    placeholder="Who conducted the review?"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Deliverables Completed</label>
                  <Textarea
                    value={newReview.deliverables_completed}
                    onChange={(e) => setNewReview({ ...newReview, deliverables_completed: e.target.value })}
                    placeholder="List completed deliverables..."
                    rows={3}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Deliverables Pending</label>
                  <Textarea
                    value={newReview.deliverables_pending}
                    onChange={(e) => setNewReview({ ...newReview, deliverables_pending: e.target.value })}
                    placeholder="List pending items..."
                    rows={3}
                  />
                </div>
              </div>
              <div>
                <label className="text-sm font-medium">Issues</label>
                <Textarea
                  value={newReview.issues}
                  onChange={(e) => setNewReview({ ...newReview, issues: e.target.value })}
                  placeholder="Any issues or concerns..."
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Recommendations</label>
                <Textarea
                  value={newReview.recommendations}
                  onChange={(e) => setNewReview({ ...newReview, recommendations: e.target.value })}
                  placeholder="Reviewer recommendations..."
                  rows={2}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Next Steps</label>
                <Input
                  value={newReview.next_steps}
                  onChange={(e) => setNewReview({ ...newReview, next_steps: e.target.value })}
                  placeholder="What happens next?"
                />
              </div>
              <div className="flex gap-2">
                <Button onClick={handleCreate} disabled={saving}>
                  {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                  Create Review
                </Button>
                <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reviews by Phase */}
        {reviewsByPhase.map(phase => (
          phase.reviews.length > 0 && (
            <div key={phase.value}>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Badge className={phase.color}>{phase.label}</Badge>
                <span className="text-muted-foreground">({phase.reviews.length} reviews)</span>
              </h3>
              <div className="space-y-4">
                {phase.reviews.map(review => {
                  const decision = decisionConfig[review.decision || 'pending'];
                  const DecisionIcon = decision.icon;
                  return (
                    <Card key={review.id}>
                      <CardContent className="pt-4">
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <span className="font-medium">Review: {review.review_date}</span>
                              <Badge className={decision.color}>
                                <DecisionIcon className="h-3 w-3 mr-1" />
                                {decision.label}
                              </Badge>
                              {review.reviewer && (
                                <span className="text-sm text-muted-foreground">by {review.reviewer}</span>
                              )}
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4 text-sm mb-3">
                              <div className="p-3 bg-green-50 rounded-lg">
                                <div className="font-medium text-green-700 mb-1">Completed</div>
                                <div className="text-green-600 whitespace-pre-line">{review.deliverables_completed || 'None listed'}</div>
                              </div>
                              <div className="p-3 bg-yellow-50 rounded-lg">
                                <div className="font-medium text-yellow-700 mb-1">Pending</div>
                                <div className="text-yellow-600 whitespace-pre-line">{review.deliverables_pending || 'None listed'}</div>
                              </div>
                            </div>

                            {review.issues && (
                              <div className="p-3 bg-red-50 rounded-lg mb-3 text-sm">
                                <span className="font-medium text-red-700">Issues: </span>
                                <span className="text-red-600">{review.issues}</span>
                              </div>
                            )}

                            {review.recommendations && (
                              <div className="text-sm mb-2">
                                <span className="font-medium">Recommendations: </span>
                                {review.recommendations}
                              </div>
                            )}

                            {review.next_steps && (
                              <div className="text-sm text-blue-600">
                                <span className="font-medium">Next: </span>
                                {review.next_steps}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col gap-2 ml-4">
                            <Select 
                              value={review.decision || 'pending'} 
                              onValueChange={(v) => handleUpdateDecision(review.id, v)}
                            >
                              <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                              <SelectContent>
                                <SelectItem value="pending">Pending</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="conditional">Conditional</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(review.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          )
        ))}

        {reviews.length === 0 && (
          <Card>
            <CardContent className="py-12 text-center">
              <CheckSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No Tollgate Reviews</h3>
              <p className="text-muted-foreground mb-4">
                Create tollgate reviews to track phase completion and approvals.
              </p>
              <Button onClick={() => setShowForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create First Review
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <MethodologyHelpPanel methodology="lean_six_sigma" />
    </div>
  );
};

export default SixSigmaTollgate;
