import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, CheckCircle, XCircle, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import { usePageTranslations } from '@/hooks/usePageTranslations';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

export default function VerifyEmail() {
  const { pt } = usePageTranslations();
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const [error, setError] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [alreadyVerified, setAlreadyVerified] = useState(false);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Check token validity on mount
  useEffect(() => {
    checkToken();
  }, [token]);

  const checkToken = async () => {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email/${token}/`, {
        method: 'GET',
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Invalid or expired token');
        setIsValid(false);
      } else {
        if (data.is_active) {
          setAlreadyVerified(true);
          setUserEmail(data.email || '');
        } else {
          setIsValid(true);
          setUserEmail(data.email || '');
          setFirstName(data.first_name || '');
        }
      }
    } catch (err) {
      setError('Failed to verify token. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!password || password.length < 8) {
      toast.error('Wachtwoord moet minimaal 8 tekens zijn');
      return;
    }

    if (password !== confirmPassword) {
      toast.error('Wachtwoorden komen niet overeen');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/verify-email/${token}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set password');
      }

      toast.success('Account geactiveerd! Je kunt nu inloggen.');
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      toast.error(err.message || 'Er is iets misgegaan');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6">
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Token controleren...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Already verified state
  if (alreadyVerified) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <CheckCircle className="h-12 w-12 text-green-500" />
            </div>
            <CardTitle className="text-center">Al Geverifieerd</CardTitle>
            <CardDescription className="text-center">
              Je email is al geverifieerd. Je kunt nu inloggen.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/login')} 
              className="w-full"
            >
              Naar Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <div className="flex justify-center mb-4">
              <XCircle className="h-12 w-12 text-red-500" />
            </div>
            <CardTitle className="text-center">Verificatie Mislukt</CardTitle>
            <CardDescription className="text-center">
              {error}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={() => navigate('/login')} 
              variant="outline"
              className="w-full"
            >
              Terug naar Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Valid token - show password form
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-purple-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-center">Welkom bij ProjeXtPal!</CardTitle>
          <CardDescription className="text-center">
            {firstName ? `Hi ${firstName}!` : 'Hi!'} Stel je wachtwoord in om je account te activeren.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label>{pt("Email")}</Label>
              <Input 
                type="email" 
                value={userEmail} 
                disabled 
                className="bg-muted"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Wachtwoord *</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Minimaal 8 tekens"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Bevestig Wachtwoord *</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Herhaal wachtwoord"
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {password && password.length > 0 && password.length < 8 && (
              <Alert variant="destructive">
                <AlertDescription>
                  Wachtwoord moet minimaal 8 tekens zijn
                </AlertDescription>
              </Alert>
            )}

            {password && confirmPassword && password !== confirmPassword && (
              <Alert variant="destructive">
                <AlertDescription>
                  Wachtwoorden komen niet overeen
                </AlertDescription>
              </Alert>
            )}

            <Button 
              type="submit" 
              className="w-full"
              disabled={isSubmitting || !password || password.length < 8 || password !== confirmPassword}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Activeren...
                </>
              ) : (
                'Account Activeren'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
