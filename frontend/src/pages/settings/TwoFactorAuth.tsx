import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Shield, ShieldCheck, ShieldOff, Loader2 } from 'lucide-react';
import api from '@/lib/api';

interface StatusResponse {
  has_2fa: boolean;
}

interface SetupResponse {
  qr_code: string;
  secret: string;
  device_id: number;
}

const TwoFactorAuth = () => {
  const [has2FA, setHas2FA] = useState(false);
  const [loading, setLoading] = useState(true);
  const [setupMode, setSetupMode] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [disableCode, setDisableCode] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    check2FAStatus();
  }, []);

  const check2FAStatus = async () => {
    try {
      const data = await api.get<StatusResponse>('/auth/2fa/status/');
      setHas2FA(data.has_2fa);
    } catch (error) {
      console.error('Error checking 2FA status:', error);
    } finally {
      setLoading(false);
    }
  };

  const startSetup = async () => {
    setSubmitting(true);
    try {
      const data = await api.get<SetupResponse>('/auth/2fa/setup/');
      setQrCode(data.qr_code);
      setSecret(data.secret);
      setSetupMode(true);
    } catch (error) {
      toast({ title: 'Error', description: 'Could not start 2FA setup', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const verifySetup = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast({ title: 'Error', description: 'Please enter a 6-digit code', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/2fa/verify-setup/', { code: verificationCode });
      toast({ title: 'Success', description: '2FA has been enabled successfully!' });
      setHas2FA(true);
      setSetupMode(false);
      setQrCode('');
      setSecret('');
      setVerificationCode('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Invalid code', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  const disable2FA = async () => {
    if (!disableCode || disableCode.length !== 6) {
      toast({ title: 'Error', description: 'Please enter a 6-digit code', variant: 'destructive' });
      return;
    }
    setSubmitting(true);
    try {
      await api.post('/auth/2fa/disable/', { code: disableCode });
      toast({ title: 'Success', description: '2FA has been disabled' });
      setHas2FA(false);
      setDisableCode('');
    } catch (error: any) {
      toast({ title: 'Error', description: error.message || 'Invalid code', variant: 'destructive' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center p-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="container max-w-2xl py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Two-Factor Authentication
          </CardTitle>
          <CardDescription>Add an extra layer of security to your account</CardDescription>
        </CardHeader>
        <CardContent>
          {has2FA ? (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-green-600">
                <ShieldCheck className="h-5 w-5" />
                <span className="font-medium">2FA is enabled</span>
              </div>
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Disable 2FA</h4>
                <p className="text-sm text-muted-foreground mb-4">Enter your authenticator code to disable 2FA</p>
                <div className="flex gap-2">
                  <Input type="text" placeholder="000000" maxLength={6} value={disableCode} onChange={(e) => setDisableCode(e.target.value.replace(/\D/g, ''))} className="w-32" />
                  <Button variant="destructive" onClick={disable2FA} disabled={submitting}>
                    {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <><ShieldOff className="h-4 w-4 mr-2" />Disable</>}
                  </Button>
                </div>
              </div>
            </div>
          ) : setupMode ? (
            <div className="space-y-6">
              <div>
                <h4 className="font-medium mb-2">1. Scan QR Code</h4>
                <p className="text-sm text-muted-foreground mb-4">Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)</p>
                {qrCode && <div className="flex justify-center p-4 bg-white rounded-lg"><img src={qrCode} alt="2FA QR Code" className="w-48 h-48" /></div>}
              </div>
              <div>
                <h4 className="font-medium mb-2">2. Or enter manually</h4>
                <code className="block p-2 bg-muted rounded text-sm break-all">{secret}</code>
              </div>
              <div>
                <h4 className="font-medium mb-2">3. Verify</h4>
                <p className="text-sm text-muted-foreground mb-4">Enter the 6-digit code from your authenticator app</p>
                <div className="flex gap-2">
                  <Input type="text" placeholder="000000" maxLength={6} value={verificationCode} onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))} className="w-32" />
                  <Button onClick={verifySetup} disabled={submitting}>{submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & Enable'}</Button>
                  <Button variant="outline" onClick={() => setSetupMode(false)}>Cancel</Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <ShieldOff className="h-5 w-5" />
                <span>2FA is not enabled</span>
              </div>
              <Button onClick={startSetup} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Shield className="h-4 w-4 mr-2" />}
                Enable 2FA
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default TwoFactorAuth;
