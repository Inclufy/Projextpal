import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Shield, ArrowLeft, Eye, EyeOff, Mail, Lock, KeyRound } from 'lucide-react';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [totpCode, setTotpCode] = useState('');
  const [requires2FA, setRequires2FA] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login-2fa/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email, 
          password,
          totp_code: requires2FA ? totpCode : undefined 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      if (data.requires_2fa) {
        setRequires2FA(true);
        toast({
          title: '2FA Required',
          description: 'Please enter your authenticator code',
        });
        setIsLoading(false);
        return;
      }

      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user_data', JSON.stringify(data.user));

      toast({
        title: 'Welcome back',
        description: 'Authentication successful',
      });

      window.location.href = '/dashboard';
    } catch (error: any) {
      toast({
        title: 'Authentication failed',
        description: error.message || 'Invalid credentials',
        variant: 'destructive',
      });
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    setRequires2FA(false);
    setTotpCode('');
  };

  const handleForgotPassword = () => {
    toast({
      title: 'Password Reset',
      description: 'Password reset feature available soon',
    });
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Refined gradient background */}
      <div className="absolute inset-0 bg-gradient-to-br from-violet-50 via-purple-50 to-fuchsia-50 dark:from-gray-900 dark:via-purple-900/20 dark:to-violet-900/20" />
      
      {/* Refined animated blobs */}
      <div className="absolute top-0 -left-4 w-[28rem] h-[28rem] bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob" />
      <div className="absolute top-0 -right-4 w-[28rem] h-[28rem] bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000" />
      <div className="absolute -bottom-8 left-20 w-[28rem] h-[28rem] bg-violet-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000" />

      {/* Back to Home Button */}
      <Button
        variant="ghost"
        className="absolute top-8 left-8 gap-2 z-10 backdrop-blur-md bg-white/70 dark:bg-gray-800/70 hover:bg-white/90 dark:hover:bg-gray-800/90 ring-1 ring-purple-100 dark:ring-purple-900/50 rounded-xl font-semibold"
        onClick={() => navigate('/')}
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Home
      </Button>

      {/* Login Card */}
      <Card className="w-full max-w-md relative z-10 shadow-2xl bg-white/98 dark:bg-gray-900/98 backdrop-blur-xl ring-1 ring-purple-100 dark:ring-purple-900/50 border-0">
        <CardHeader className="text-center space-y-6 pb-8 pt-10">
          <div className="flex justify-center mb-4">
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600 to-pink-600 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
              <div className="relative h-20 w-20 rounded-3xl bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center shadow-2xl shadow-purple-500/50 transform group-hover:scale-110 transition-transform duration-300">
                <span className="text-3xl font-bold text-white">P</span>
              </div>
            </div>
          </div>
          <div className="space-y-3">
            <CardTitle className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent leading-tight">
              {requires2FA ? 'Two-Factor Authentication' : 'Welcome Back'}
            </CardTitle>
            <CardDescription className="text-base text-gray-600 dark:text-gray-400 font-medium">
              {requires2FA 
                ? 'Enter your authenticator code to continue' 
                : 'Sign in to your ProjectPal account'}
            </CardDescription>
          </div>
        </CardHeader>
        
        <CardContent className="px-10 pb-10">
          <form onSubmit={handleSubmit} className="space-y-6">
            {!requires2FA ? (
              <>
                {/* Email Field */}
                <div className="space-y-2.5">
                  <Label htmlFor="email" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                    Email Address
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-12 h-13 bg-white dark:bg-gray-900 ring-1 ring-inset ring-purple-100 dark:ring-purple-900/50 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-xl border-0 text-base"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-sm font-bold text-gray-700 dark:text-gray-300">
                      Password
                    </Label>
                    <button
                      type="button"
                      onClick={handleForgotPassword}
                      className="text-sm text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300 font-bold transition-colors"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-purple-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                      className="pl-12 pr-12 h-13 bg-white dark:bg-gray-900 ring-1 ring-inset ring-purple-100 dark:ring-purple-900/50 focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-xl border-0 text-base"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-400 hover:text-purple-600 dark:hover:text-purple-300 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center pt-1">
                  <input 
                    type="checkbox" 
                    id="remember"
                    className="w-4 h-4 rounded-md border-purple-300 dark:border-purple-700 text-purple-600 focus:ring-purple-500 focus:ring-offset-0"
                  />
                  <label htmlFor="remember" className="ml-2.5 text-sm font-medium text-gray-600 dark:text-gray-400">
                    Remember me for 30 days
                  </label>
                </div>
              </>
            ) : (
              /* 2FA Code Input */
              <div className="space-y-8">
                <div className="flex justify-center">
                  <div className="relative group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl blur-xl opacity-50 group-hover:opacity-75 transition-opacity" />
                    <div className="relative h-24 w-24 rounded-3xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-2xl shadow-purple-500/50">
                      <Shield className="h-12 w-12 text-white" />
                    </div>
                  </div>
                </div>
                <div className="space-y-3">
                  <Label htmlFor="totp" className="text-sm font-bold text-gray-700 dark:text-gray-300 text-center block">
                    6-Digit Authentication Code
                  </Label>
                  <Input
                    id="totp"
                    type="text"
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ''))}
                    maxLength={6}
                    required
                    disabled={isLoading}
                    className="text-center text-3xl tracking-[0.5em] font-mono font-bold h-16 ring-2 ring-inset ring-purple-200 dark:ring-purple-800 bg-white dark:bg-gray-900 focus:ring-purple-400 dark:focus:ring-purple-600 rounded-xl border-0"
                    autoFocus
                  />
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 font-medium pt-2">
                    Enter the code from your authenticator app
                  </p>
                </div>
                <Button 
                  type="button" 
                  variant="ghost" 
                  className="w-full hover:bg-purple-50 dark:hover:bg-purple-900/20 rounded-xl font-semibold" 
                  onClick={handleBack}
                  disabled={isLoading}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to login
                </Button>
              </div>
            )}

            {/* Submit Button */}
            <Button 
              type="submit" 
              className="w-full h-13 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-base font-bold shadow-xl shadow-purple-500/30 hover:shadow-2xl hover:shadow-purple-500/40 transition-all duration-300 rounded-xl border-0 group"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2.5 h-5 w-5 animate-spin" />
                  {requires2FA ? 'Verifying...' : 'Signing in...'}
                </>
              ) : (
                <>
                  <KeyRound className="mr-2.5 h-5 w-5 group-hover:scale-110 transition-transform" />
                  {requires2FA ? 'Verify & Continue' : 'Sign In'}
                </>
              )}
            </Button>

            {/* Sign Up Link */}
            {!requires2FA && (
              <div className="text-center pt-6 border-t border-purple-100 dark:border-purple-900/50">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => navigate('/signup')}
                    className="text-purple-600 dark:text-purple-400 font-bold hover:underline transition-colors"
                  >
                    Create account
                  </button>
                </p>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
          © 2026 ProjectPal. Enterprise Project Management Platform.
        </p>
      </div>
    </div>
  );
};

export default Login;