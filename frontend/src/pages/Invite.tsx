import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Lock, Users, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

interface InviteDetails {
  email: string;
  role: string;
  project: string | null;
  program: string | null;
  invited_by: string;
  message: string;
  has_account: boolean;
}

const Invite = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [details, setDetails] = useState<InviteDetails | null>(null);
  const [error, setError] = useState<string | null>(null);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/auth/invitations/accept/${token}/`);
        const data = await res.json();
        if (!res.ok) {
          setError(data.error || 'This invitation is invalid or has expired.');
        } else {
          setDetails(data);
        }
      } catch {
        setError('Could not load the invitation. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  const target = details?.project || details?.program || 'ProjeXtPal';
  const needsPassword = details && !details.has_account;

  const handleAccept = async () => {
    if (!details) return;
    if (needsPassword && password.length < 8) {
      toast.error('Choose a password of at least 8 characters.');
      return;
    }
    setSubmitting(true);
    try {
      const body: Record<string, string> = {};
      if (needsPassword) {
        body.password = password;
        body.first_name = firstName;
        body.last_name = lastName;
      }
      const res = await fetch(`${API_BASE_URL}/auth/invitations/accept/${token}/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) {
        toast.error(data.message || data.error || 'Could not accept the invitation.');
        return;
      }
      if (data.access && data.refresh) {
        localStorage.setItem('access_token', data.access);
        localStorage.setItem('refresh_token', data.refresh);
        toast.success('Welcome to the team!');
        // Full reload so the auth context picks up the new session.
        window.location.href = data.redirect_to || '/dashboard';
      } else {
        toast.success('Invitation accepted. Please log in.');
        navigate('/login');
      }
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-fuchsia-50 dark:from-gray-900 dark:to-gray-950 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-purple-600 to-fuchsia-600 text-white shadow-lg">
            <Users className="h-7 w-7" />
          </div>
          <CardTitle>You've been invited</CardTitle>
          <CardDescription>
            {loading ? 'Loading your invitation…' : error ? 'Invitation unavailable' :
              `${details?.invited_by} invited you to join “${target}” on ProjeXtPal.`}
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
            </div>
          ) : error ? (
            <>
              <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert>
              <Button variant="outline" className="w-full" onClick={() => navigate('/login')}>
                <ArrowLeft className="mr-2 h-4 w-4" /> Go to login
              </Button>
            </>
          ) : (
            <>
              {details?.message && (
                <Alert><AlertDescription className="italic">“{details.message}”</AlertDescription></Alert>
              )}
              <div className="rounded-lg border bg-muted/40 p-3 text-sm space-y-1">
                <div className="flex justify-between"><span className="text-muted-foreground">Email</span><span className="font-medium">{details?.email}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">Role</span><span className="font-medium capitalize">{details?.role}</span></div>
                <div className="flex justify-between"><span className="text-muted-foreground">{details?.program ? 'Programme' : 'Project'}</span><span className="font-medium">{target}</span></div>
              </div>

              {needsPassword && (
                <>
                  <p className="text-sm text-muted-foreground">Create your account to join:</p>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <Label htmlFor="fn">First name</Label>
                      <Input id="fn" value={firstName} onChange={(e) => setFirstName(e.target.value)} placeholder="Jane" />
                    </div>
                    <div className="space-y-1">
                      <Label htmlFor="ln">Last name</Label>
                      <Input id="ln" value={lastName} onChange={(e) => setLastName(e.target.value)} placeholder="Doe" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Label htmlFor="pw">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input id="pw" type={showPassword ? 'text' : 'password'} value={password}
                        onChange={(e) => setPassword(e.target.value)} placeholder="At least 8 characters" className="pl-9 pr-9" />
                      <button type="button" onClick={() => setShowPassword((s) => !s)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>
                </>
              )}

              {!needsPassword && (
                <p className="text-sm text-muted-foreground">
                  You already have a ProjeXtPal account for this email. Accept to join the team.
                </p>
              )}

              <Button className="w-full bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white"
                onClick={handleAccept} disabled={submitting}>
                {submitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                {needsPassword ? 'Create account & join' : 'Accept invitation'}
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Invite;
