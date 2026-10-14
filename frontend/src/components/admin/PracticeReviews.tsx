/**
 * PracticeReviews — admin UI for reviewing PracticeSubmission rows (B4).
 *
 * Without this surface the whole certificate-eligibility gate for practice
 * assignments was unreachable: learners submitted work, nothing could
 * ever flip the submission status to 'approved', and no cert was ever
 * minted. Thin table over GET/PATCH /academy/admin/practice-submissions/.
 */
import { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Loader2, CheckCircle2, RefreshCw, FileText } from 'lucide-react';

interface Submission {
  id: number;
  assignment_id: number | null;
  assignment_title: string | null;
  user_id: number | null;
  user_email: string | null;
  user_name: string | null;
  submission_text: string;
  submission_file_url: string | null;
  status: 'pending' | 'approved' | 'needs_work';
  score: number | null;
  feedback: string;
  submitted_at: string;
  reviewed_at: string | null;
}

const STATUS_BADGE: Record<Submission['status'], string> = {
  pending: 'bg-amber-100 text-amber-800 border-amber-300',
  approved: 'bg-emerald-100 text-emerald-800 border-emerald-300',
  needs_work: 'bg-rose-100 text-rose-800 border-rose-300',
};

const PracticeReviews = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [feedback, setFeedback] = useState<Record<number, string>>({});
  const [acting, setActing] = useState<Record<number, boolean>>({});

  const load = async () => {
    setLoading(true);
    try {
      const res = await axios.get(
        `/api/v1/academy/admin/practice-submissions/?status=${statusFilter}`,
      );
      setSubmissions(Array.isArray(res.data) ? res.data : []);
    } catch (e) {
      console.error('load practice submissions', e);
      toast.error('Could not load practice submissions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter]);

  const act = async (
    id: number,
    status: 'approved' | 'needs_work',
  ) => {
    setActing((s) => ({ ...s, [id]: true }));
    try {
      await axios.patch(`/api/v1/academy/admin/practice-submissions/${id}/`, {
        status,
        feedback: feedback[id] ?? '',
      });
      toast.success(status === 'approved' ? 'Submission approved' : 'Marked needs work');
      load();
    } catch (e) {
      console.error('review practice submission', e);
      toast.error('Review failed');
    } finally {
      setActing((s) => ({ ...s, [id]: false }));
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-xl font-semibold">Practice Reviews</h2>
          <p className="text-sm text-muted-foreground">
            Approve or send back learner-submitted practice work. Approved
            submissions open the certificate gate for that learner.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="needs_work">Needs Work</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={load} disabled={loading}>
            {loading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      <div className="rounded-md border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Learner</TableHead>
              <TableHead>Assignment</TableHead>
              <TableHead>Submission</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Review</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {submissions.length === 0 && !loading && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-10 text-muted-foreground">
                  No submissions in this view.
                </TableCell>
              </TableRow>
            )}
            {submissions.map((s) => (
              <TableRow key={s.id}>
                <TableCell>
                  <div className="font-medium">{s.user_name || s.user_email || '—'}</div>
                  {s.user_email && (
                    <div className="text-xs text-muted-foreground">{s.user_email}</div>
                  )}
                </TableCell>
                <TableCell>{s.assignment_title || `#${s.assignment_id}`}</TableCell>
                <TableCell className="max-w-xs">
                  {s.submission_text && (
                    <div className="text-sm line-clamp-3 whitespace-pre-wrap">
                      {s.submission_text}
                    </div>
                  )}
                  {s.submission_file_url && (
                    <a
                      href={s.submission_file_url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1"
                    >
                      <FileText className="h-3 w-3" />
                      View file
                    </a>
                  )}
                </TableCell>
                <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                  {new Date(s.submitted_at).toLocaleString()}
                </TableCell>
                <TableCell>
                  <Badge variant="outline" className={STATUS_BADGE[s.status]}>
                    {s.status}
                  </Badge>
                </TableCell>
                <TableCell className="min-w-[260px]">
                  <Textarea
                    placeholder="Feedback (optional)"
                    rows={2}
                    value={feedback[s.id] ?? s.feedback ?? ''}
                    onChange={(e) =>
                      setFeedback((f) => ({ ...f, [s.id]: e.target.value }))
                    }
                    disabled={s.status !== 'pending' && s.status !== 'needs_work'}
                  />
                  <div className="flex items-center gap-2 mt-2">
                    <Button
                      size="sm"
                      onClick={() => act(s.id, 'approved')}
                      disabled={acting[s.id]}
                    >
                      {acting[s.id] ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <CheckCircle2 className="h-3 w-3 mr-1" />
                      )}
                      Approve
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => act(s.id, 'needs_work')}
                      disabled={acting[s.id]}
                    >
                      Needs work
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PracticeReviews;
