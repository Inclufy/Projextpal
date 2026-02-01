import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ProjectHeader } from '@/components/ProjectHeader';
import { Calendar, Plus, MessageSquare, CheckCircle, Users } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const AgileReview = () => {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, [id]);

  const fetchReviews = async () => {
    try {
      const response = await fetch(`/api/v1/projects/${id}/agile/reviews/`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
      });
      const data = await response.json();
      setReviews(data);
    } catch (error) {
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      scheduled: 'bg-blue-500',
      in_progress: 'bg-yellow-500',
      completed: 'bg-green-500',
      cancelled: 'bg-red-500'
    };
    return colors[status] || 'bg-gray-500';
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('nl-NL', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <ProjectHeader projectId={id} />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Iteration Reviews</h1>
            <p className="text-gray-600 mt-1">Demo & feedback sessions</p>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Schedule Review
          </Button>
        </div>

        {reviews.length === 0 && !loading ? (
          <Card>
            <CardContent className="p-12 text-center">
              <Calendar className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No reviews scheduled</h3>
              <p className="text-gray-600 mb-4">Schedule your first iteration review</p>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Schedule Review
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {reviews.map((review: any) => (
              <Card key={review.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-xl">{review.iteration_name}</CardTitle>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-600">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          {formatDate(review.scheduled_date)}
                        </div>
                        <div className="flex items-center gap-1">
                          <Users className="h-4 w-4" />
                          {review.attendee_count} attendees
                        </div>
                      </div>
                    </div>
                    <Badge className={getStatusColor(review.status)}>
                      {review.status_display}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {review.iteration_goal_achieved && (
                      <div className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        <span className="font-medium">Iteration goal achieved!</span>
                      </div>
                    )}

                    {review.demo_items && review.demo_items.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Demonstrated Items:</h4>
                        <ul className="space-y-1">
                          {review.demo_items.map((item: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700 flex items-start gap-2">
                              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
                              {item}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {review.feedback && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Feedback:</h4>
                        <p className="text-sm text-gray-700">{review.feedback}</p>
                      </div>
                    )}

                    {review.feedback_items && review.feedback_items.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2 flex items-center gap-2">
                          <MessageSquare className="h-4 w-4" />
                          Feedback Items ({review.feedback_items.length})
                        </h4>
                        <div className="space-y-2">
                          {review.feedback_items.map((item: any) => (
                            <div key={item.id} className="bg-gray-50 p-3 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Badge variant="outline" className="mt-1">
                                  {item.feedback_type_display}
                                </Badge>
                                <p className="text-sm flex-1">{item.content}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {review.action_items && review.action_items.length > 0 && (
                      <div>
                        <h4 className="font-semibold text-sm mb-2">Action Items:</h4>
                        <ul className="space-y-1">
                          {review.action_items.map((item: string, idx: number) => (
                            <li key={idx} className="text-sm text-gray-700">• {item}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm">
                        <MessageSquare className="h-4 w-4 mr-2" />
                        Add Feedback
                      </Button>
                      {review.status === 'scheduled' && (
                        <Button size="sm">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Complete Review
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AgileReview;
