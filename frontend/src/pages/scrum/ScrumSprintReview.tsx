import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { ProjectHeader } from '@/components/ProjectHeader';
import { useProject } from '@/hooks/useApi';
import { scrumApi } from '@/lib/scrumApi';
import { MethodologyHelpPanel } from '@/components/MethodologyHelpPanel';
import { 
  Eye, Plus, Loader2, MessageSquare, ThumbsUp, 
  ThumbsDown, CheckCircle, XCircle, Users, Calendar
} from 'lucide-react';

interface SprintReview {
  id: number;
  sprint: number;
  date: string;
  demo_notes: string;
  stakeholder_feedback: string;
  accepted_items: string[];
  rejected_items: string[];
  attendees: string[];
}

const ScrumSprintReview = () => {
  const { id } = useParams<{ id: string }>();
  const { data: project } = useProject(id);
  
  const [reviews, setReviews] = useState<SprintReview[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDialog, setShowDialog] = useState(false);
  const [selectedReview, setSelectedReview] = useState<SprintReview | null>(null);
  
  const [form, setForm] = useState({
    demo_notes: '',
    stakeholder_feedback: '',
    accepted_items: '',
    rejected_items: '',
  });

  useEffect(() => {
    if (id) {
      loadReviews();
    }
  }, [id]);

  const loadReviews = async () => {
    try {
      setLoading(true);
      const data = await scrumApi.reviews.getAll(id!);
      setReviews(data);
    } catch (err: any) {
      // Mock data
      setReviews([
        {
          id: 1,
          sprint: 3,
          date: new Date().toISOString().split('T')[0],
          demo_notes: 'Successfully demonstrated user authentication flow and dashboard improvements. All stakeholders were impressed with the performance improvements.',
          stakeholder_feedback: 'Great progress! The new dashboard layout is much more intuitive. Product Owner suggested adding quick filters for the next sprint.',
          accepted_items: ['User Login', 'Dashboard Layout', 'Performance Optimization', 'Bug Fixes'],
          rejected_items: ['Advanced Reporting - needs refinement'],
          attendees: ['Product Owner', 'Scrum Master', 'Development Team', '3 Stakeholders']
        },
        {
          id: 2,
          sprint: 2,
          date: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          demo_notes: 'Demonstrated new user registration flow and email verification system.',
          stakeholder_feedback: 'Good work on the registration flow. Need to improve error messages.',
          accepted_items: ['User Registration', 'Email Verification', 'Profile Management'],
          rejected_items: ['Social Login - incomplete'],
          attendees: ['Product Owner', 'Scrum Master', 'Development Team']
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveReview = async () => {
    try {
      const reviewData = {
        ...form,
        accepted_items: form.accepted_items.split('\n').filter(i => i.trim()),
        rejected_items: form.rejected_items.split('\n').filter(i => i.trim()),
      };
      
      if (selectedReview) {
        await scrumApi.reviews.update(id!, selectedReview.id, reviewData);
      } else {
        await scrumApi.reviews.create(id!, reviewData);
      }
      
      setShowDialog(false);
      setSelectedReview(null);
      setForm({ demo_notes: '', stakeholder_feedback: '', accepted_items: '', rejected_items: '' });
      loadReviews();
    } catch (err: any) {
      alert(err.message || 'Failed to save review');
    }
  };

  const openAddReview = () => {
    setSelectedReview(null);
    setForm({ demo_notes: '', stakeholder_feedback: '', accepted_items: '', rejected_items: '' });
    setShowDialog(true);
  };

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
              <Eye className="h-6 w-6 text-purple-600" />
              Sprint Review
            </h1>
            <p className="text-muted-foreground">Demo completed work and gather feedback</p>
          </div>
          <Button onClick={openAddReview} className="bg-purple-600 hover:bg-purple-700">
            <Plus className="h-4 w-4 mr-2" />
            New Review
          </Button>
        </div>

        {/* Info Card */}
        <Card className="bg-purple-50 border-purple-200">
          <CardContent className="pt-4">
            <div className="flex gap-4">
              <Eye className="h-6 w-6 text-purple-600 flex-shrink-0" />
              <div>
                <h3 className="font-semibold text-purple-900">Sprint Review Meeting</h3>
                <p className="text-sm text-purple-800 mt-1">
                  The Sprint Review is held at the end of the Sprint to inspect the Increment and adapt the Product Backlog if needed.
                  The team demonstrates completed work to stakeholders and collects feedback to inform future development.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Total Reviews</p>
              <p className="text-2xl font-bold">{reviews.length}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Accepted Items</p>
              <p className="text-2xl font-bold text-green-600">
                {reviews.reduce((sum, r) => sum + r.accepted_items.length, 0)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <p className="text-sm text-muted-foreground">Rejected Items</p>
              <p className="text-2xl font-bold text-red-600">
                {reviews.reduce((sum, r) => sum + r.rejected_items.length, 0)}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Reviews List */}
        <div className="space-y-4">
          {reviews.map((review) => (
            <Card key={review.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2">
                    <Eye className="h-5 w-5 text-purple-600" />
                    Sprint {review.sprint} Review
                  </CardTitle>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      {new Date(review.date).toLocaleDateString()}
                    </div>
                    <Button variant="ghost" size="sm">Edit</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Demo Notes */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">Demo Notes</p>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{review.demo_notes}</p>
                </div>

                {/* Stakeholder Feedback */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Users className="h-4 w-4 text-muted-foreground" />
                    <p className="font-medium">Stakeholder Feedback</p>
                  </div>
                  <p className="text-sm text-muted-foreground pl-6">{review.stakeholder_feedback}</p>
                </div>

                {/* Accepted & Rejected Items */}
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <p className="font-medium">Accepted Items ({review.accepted_items.length})</p>
                    </div>
                    <div className="space-y-1 pl-6">
                      {review.accepted_items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <ThumbsUp className="h-3 w-3 text-green-600" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <XCircle className="h-4 w-4 text-red-600" />
                      <p className="font-medium">Rejected Items ({review.rejected_items.length})</p>
                    </div>
                    <div className="space-y-1 pl-6">
                      {review.rejected_items.map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <ThumbsDown className="h-3 w-3 text-red-600" />
                          <span className="text-sm">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Attendees */}
                {review.attendees && review.attendees.length > 0 && (
                  <div className="pt-4 border-t">
                    <p className="text-sm font-medium mb-2">Attendees:</p>
                    <div className="flex flex-wrap gap-2">
                      {review.attendees.map((attendee, idx) => (
                        <Badge key={idx} variant="outline">{attendee}</Badge>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {reviews.length === 0 && (
            <Card>
              <CardContent className="py-12 text-center text-muted-foreground">
                <Eye className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No sprint reviews recorded yet</p>
                <Button onClick={openAddReview} variant="outline" className="mt-4">
                  Create First Review
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Add/Edit Review Dialog */}
      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Sprint Review</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            <div>
              <label className="text-sm font-medium">Demo Notes</label>
              <Textarea 
                value={form.demo_notes}
                onChange={(e) => setForm({...form, demo_notes: e.target.value})}
                placeholder="What was demonstrated during the review?"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Stakeholder Feedback</label>
              <Textarea 
                value={form.stakeholder_feedback}
                onChange={(e) => setForm({...form, stakeholder_feedback: e.target.value})}
                placeholder="Key feedback from stakeholders..."
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Accepted Items (one per line)</label>
              <Textarea 
                value={form.accepted_items}
                onChange={(e) => setForm({...form, accepted_items: e.target.value})}
                placeholder="User Login&#10;Dashboard Layout&#10;Performance Optimization"
                rows={4}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Rejected Items (one per line)</label>
              <Textarea 
                value={form.rejected_items}
                onChange={(e) => setForm({...form, rejected_items: e.target.value})}
                placeholder="Advanced Reporting - needs refinement"
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>Cancel</Button>
            <Button 
              onClick={handleSaveReview} 
              disabled={!form.demo_notes}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Save Review
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <MethodologyHelpPanel methodology="scrum" />
    </div>
  );
};

export default ScrumSprintReview;