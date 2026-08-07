import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { CheckCircle, XCircle, Loader2 } from 'lucide-react';
import { usePageTranslations } from '@/hooks/usePageTranslations';

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

export default function EmailVerified() {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { pt } = usePageTranslations();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus('error');
        setMessage(pt('Invalid verification link'));
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/auth/verify-email/${token}/`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json' }
        });

        const data = await response.json();

        if (response.ok) {
          setStatus('success');
          setMessage(data.message || pt('Your email has been verified successfully!'));
        } else {
          setStatus('error');
          setMessage(data.error || pt('Verification failed. Link may be expired or invalid.'));
        }
      } catch (error) {
        setStatus('error');
        setMessage(pt('Verification failed. Please try again.'));
      }
    };

    verifyEmail();
  }, [token]);

  const handleContinue = () => {
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl p-8">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="flex items-center gap-2">
            <span className="text-3xl font-black text-slate-900">
              Proje<span className="text-purple-600">X</span>tPal
            </span>
          </div>
        </div>

        {/* Status Icon */}
        <div className="flex justify-center mb-6">
          {status === 'loading' && (
            <Loader2 className="w-20 h-20 text-purple-600 animate-spin" />
          )}
          {status === 'success' && (
            <div className="relative">
              <div className="absolute inset-0 bg-green-400 rounded-full blur-xl opacity-50 animate-pulse"></div>
              <CheckCircle className="w-20 h-20 text-green-500 relative" strokeWidth={2} />
            </div>
          )}
          {status === 'error' && (
            <XCircle className="w-20 h-20 text-red-500" strokeWidth={2} />
          )}
        </div>

        {/* Message */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-2">
            {status === 'loading' && pt('Verifying Email...')}
            {status === 'success' && pt('Email Verified!')}
            {status === 'error' && pt('Verification Failed')}
          </h1>
          <p className="text-slate-600">{message}</p>
        </div>

        {/* Action Buttons */}
        {status !== 'loading' && (
          <div className="space-y-3">
            {status === 'success' && (
              <button
                onClick={handleContinue}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-4 rounded-lg font-semibold hover:from-purple-700 hover:to-pink-700 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {pt("Continue to Login")}
              </button>
            )}
            {status === 'error' && (
              <button
                onClick={() => navigate('/signup')}
                className="w-full bg-slate-700 text-white py-3 px-4 rounded-lg font-semibold hover:bg-slate-800 transition-all duration-200"
              >
                {pt("Back to Signup")}
              </button>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-slate-500">
          <p>{pt("Need help? Contact")} <a href="mailto:support@projextpal.com" className="text-purple-600 hover:underline">support@projextpal.com</a></p>
        </div>
      </div>
    </div>
  );
}
