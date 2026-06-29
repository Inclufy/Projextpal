import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Mail, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

export default function ForgotPassword() {
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isNL = language === 'nl';

  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const txt = {
    title: isNL ? 'Wachtwoord Vergeten?' : 'Forgot Password?',
    description: isNL
      ? 'Geen probleem! Voer je e-mailadres in en we sturen je een reset link.'
      : 'No problem! Enter your email address and we\'ll send you a reset link.',
    emailLabel: isNL ? 'E-mailadres' : 'Email Address',
    emailPlaceholder: isNL ? 'jouw@email.nl' : 'you@company.com',
    sendLink: isNL ? 'Verstuur Reset Link' : 'Send Reset Link',
    sending: isNL ? 'Versturen...' : 'Sending...',
    backToLogin: isNL ? 'Terug naar login' : 'Back to login',
    enterEmail: isNL ? 'Voer je e-mailadres in' : 'Please enter your email address',
    successSent: isNL ? 'Reset link verzonden! Check je inbox.' : 'Reset link sent! Check your inbox.',
    errorGeneric: isNL ? 'Er is iets misgegaan' : 'Something went wrong',
    checkInbox: isNL ? 'Check je inbox!' : 'Check your inbox!',
    sentTo: isNL ? 'We hebben een wachtwoord reset link gestuurd naar' : 'We\'ve sent a password reset link to',
    linkValid: isNL
      ? 'De link is 1 uur geldig. Check ook je spam folder als je de email niet ziet.'
      : 'The link is valid for 1 hour. Also check your spam folder if you don\'t see the email.',
    backToLoginBtn: isNL ? 'Terug naar Login' : 'Back to Login',
    resend: isNL ? 'Verstuur opnieuw' : 'Resend',
    copyright: isNL ? 'Enterprise Projectmanagement Platform.' : 'Enterprise Project Management Platform.',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error(txt.enterEmail);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.email?.[0] || data.error || 'Failed to send reset email');
      }

      setEmailSent(true);
      toast.success(txt.successSent);
    } catch (err) {
      toast.error(err.message || txt.errorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Success state - email sent
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
        {/* Gradient background matching Login */}
        <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-violet-900/20" />

        {/* Animated blobs */}
        <div className="absolute top-0 -left-4 w-[28rem] h-[28rem] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
        <div className="absolute top-0 -right-4 w-[28rem] h-[28rem] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-20 w-[28rem] h-[28rem] bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

        <Card className="w-full max-w-md mx-4 relative z-10 shadow-2xl bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl ring-1 ring-purple-100 dark:ring-purple-900/50 border-0">
          <CardHeader className="text-center space-y-6 pb-8 pt-10">
            <div className="flex justify-center mb-4">
              <div className="relative group">
                <div className="absolute inset-0 bg-gradient-to-br from-green-500 to-emerald-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center shadow-2xl shadow-green-500/50">
                  <Mail className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent leading-tight">
                {txt.checkInbox}
              </CardTitle>
              <CardDescription className="text-base text-gray-600 dark:text-gray-400 font-medium px-2">
                {txt.sentTo} <strong className="text-purple-600 dark:text-purple-400">{email}</strong>
              </CardDescription>
            </div>
          </CardHeader>
          <CardContent className="px-6 sm:px-10 pb-10 space-y-6">
            <Alert className="bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
              <AlertDescription className="text-sm text-gray-700 dark:text-gray-300">
                {txt.linkValid}
              </AlertDescription>
            </Alert>

            <div className="flex flex-col gap-3">
              <Button
                onClick={() => navigate('/login')}
                className="w-full h-12 sm:h-13 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-bold shadow-xl shadow-purple-500/30 rounded-xl border-0"
              >
                {txt.backToLoginBtn}
              </Button>
              <Button
                onClick={() => setEmailSent(false)}
                variant="outline"
                className="w-full h-12 sm:h-13 rounded-xl font-semibold ring-1 ring-purple-200 dark:ring-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                {txt.resend}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="absolute bottom-8 left-0 right-0 text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
            © 2026 ProjeXtPal. {txt.copyright}
          </p>
        </div>
      </div>
    );
  }

  // Form state
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Gradient background matching Login */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-violet-900/20" />

      {/* Animated blobs */}
      <div className="absolute top-0 -left-4 w-[28rem] h-[28rem] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-[28rem] h-[28rem] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-[28rem] h-[28rem] bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      {/* Back to Login Button */}
      <Button
        variant="ghost"
        className="absolute top-8 left-8 gap-2 z-10 backdrop-blur-md bg-white/70 dark:bg-gray-800/70 hover:bg-white/90 dark:hover:bg-gray-800/90 ring-1 ring-purple-100 dark:ring-purple-900/50 rounded-xl font-semibold min-h-[44px]"
        onClick={() => navigate('/login')}
      >
        <ArrowLeft className="h-4 w-4" />
        {txt.backToLogin}
      </Button>

      <Card className="w-full max-w-md mx-4 relative z-10 shadow-2xl bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl ring-1 ring-purple-100 dark:ring-purple-900/50 border-0">
        <CardHeader className="text-center space-y-6 pb-8 pt-10">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/50 transform group-hover:scale-110 transition-transform duration-300">
                <KeyRound className="h-10 w-10 text-white" />
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <CardTitle className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              {txt.title}
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400 font-medium px-2">
              {txt.description}
            </CardDescription>
          </div>
        </CardHeader>
        <CardContent className="px-6 sm:px-10 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2.5">
              <Label htmlFor="email" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {txt.emailLabel}
              </Label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                <Input
                  id="email"
                  type="email"
                  placeholder={txt.emailPlaceholder}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  autoFocus
                  className="pl-12 h-12 sm:h-13 bg-white dark:bg-gray-900 ring-1 ring-inset ring-purple-100 dark:ring-purple-900/50 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-xl border-0 text-base"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 sm:h-13 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base font-bold shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 rounded-xl border-0 group"
              disabled={isSubmitting || !email}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2.5 animate-spin" />
                  {txt.sending}
                </>
              ) : (
                <>
                  <Mail className="h-5 w-5 mr-2.5 group-hover:scale-110 transition-transform" />
                  {txt.sendLink}
                </>
              )}
            </Button>

            <div className="text-center pt-4 border-t border-purple-100 dark:border-purple-900/50">
              <Link
                to="/login"
                className="inline-flex items-center text-sm text-purple-600 dark:text-purple-400 font-bold hover:underline transition-colors min-h-[44px] px-2"
              >
                <ArrowLeft className="h-4 w-4 mr-1.5" />
                {txt.backToLogin}
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          © 2026 ProjeXtPal. {txt.copyright}
        </p>
      </div>
    </div>
  );
}
