import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Eye, EyeOff, Lock, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { useLanguage } from '@/contexts/LanguageContext';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

export default function ResetPassword() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const { language } = useLanguage();
  const isNL = language === 'nl';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const txt = {
    title: isNL ? 'Nieuw Wachtwoord Instellen' : 'Set New Password',
    description: isNL
      ? 'Kies een sterk wachtwoord van minimaal 8 tekens'
      : 'Choose a strong password with at least 8 characters',
    newPassword: isNL ? 'Nieuw Wachtwoord' : 'New Password',
    confirmPassword: isNL ? 'Bevestig Wachtwoord' : 'Confirm Password',
    minChars: isNL ? 'Minimaal 8 tekens' : 'At least 8 characters',
    repeatPassword: isNL ? 'Herhaal wachtwoord' : 'Repeat password',
    tooShort: isNL ? 'Wachtwoord moet minimaal 8 tekens zijn' : 'Password must be at least 8 characters',
    noMatch: isNL ? 'Wachtwoorden komen niet overeen' : 'Passwords do not match',
    resetBtn: isNL ? 'Wachtwoord Resetten' : 'Reset Password',
    resetting: isNL ? 'Resetten...' : 'Resetting...',
    success: isNL ? 'Wachtwoord gereset! Je kunt nu inloggen.' : 'Password reset! You can now log in.',
    errorGeneric: isNL ? 'Er is iets misgegaan. Token mogelijk verlopen.' : 'Something went wrong. Token may be expired.',
    backToLogin: isNL ? 'Terug naar login' : 'Back to login',
    copyright: isNL ? 'Enterprise Projectmanagement Platform.' : 'Enterprise Project Management Platform.',
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!password || password.length < 8) {
      toast.error(txt.tooShort);
      return;
    }

    if (password !== confirmPassword) {
      toast.error(txt.noMatch);
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password/${token}/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.token?.[0] || data.error || 'Failed to reset password');
      }

      toast.success(txt.success);

      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      toast.error(err.message || txt.errorGeneric);
    } finally {
      setIsSubmitting(false);
    }
  };

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
                <Lock className="h-10 w-10 text-white" />
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
            {/* New Password */}
            <div className="space-y-2.5">
              <Label htmlFor="password" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {txt.newPassword} *
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={txt.minChars}
                  autoFocus
                  className="pl-12 pr-12 h-12 sm:h-13 bg-white dark:bg-gray-900 ring-1 ring-inset ring-purple-100 dark:ring-purple-900/50 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-xl border-0 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div className="space-y-2.5">
              <Label htmlFor="confirmPassword" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                {txt.confirmPassword} *
              </Label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder={txt.repeatPassword}
                  className="pl-12 pr-12 h-12 sm:h-13 bg-white dark:bg-gray-900 ring-1 ring-inset ring-purple-100 dark:ring-purple-900/50 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-xl border-0 text-base"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2"
                >
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Validation warnings */}
            {password && password.length > 0 && password.length < 8 && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertDescription>{txt.tooShort}</AlertDescription>
              </Alert>
            )}

            {password && confirmPassword && password !== confirmPassword && (
              <Alert variant="destructive" className="rounded-xl">
                <AlertDescription>{txt.noMatch}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              className="w-full h-12 sm:h-13 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base font-bold shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 rounded-xl border-0"
              disabled={isSubmitting || !password || password.length < 8 || password !== confirmPassword}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 mr-2.5 animate-spin" />
                  {txt.resetting}
                </>
              ) : (
                txt.resetBtn
              )}
            </Button>
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
