import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  ScanFace,
  Fingerprint,
  Plus,
  Trash2,
  Loader2,
  Shield,
  Smartphone,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';
import {
  isBiometricSupported,
  isPlatformAuthenticatorAvailable,
  registerBiometric,
  getBiometricCredentials,
  removeBiometricCredential,
  checkBiometricStatus,
  saveBiometricEmail,
  removeSavedBiometricEmail,
} from '@/lib/biometric';

interface Credential {
  id: number;
  credential_id: string;
  device_name: string;
  created_at: string;
  last_used_at: string | null;
}

export default function BiometricAuth() {
  const { language } = useLanguage();
  const { toast } = useToast();
  const isNL = language === 'nl';

  const [isSupported, setIsSupported] = useState(false);
  const [isAvailable, setIsAvailable] = useState(false);
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [deviceName, setDeviceName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);

  const txt = {
    title: isNL ? 'Biometrische Login' : 'Biometric Login',
    description: isNL
      ? 'Gebruik Face ID of vingerafdruk om snel en veilig in te loggen'
      : 'Use Face ID or fingerprint to sign in quickly and securely',
    notSupported: isNL
      ? 'Biometrische authenticatie wordt niet ondersteund op dit apparaat'
      : 'Biometric authentication is not supported on this device',
    notAvailable: isNL
      ? 'Platform authenticator (Face ID / vingerafdruk) is niet beschikbaar'
      : 'Platform authenticator (Face ID / fingerprint) is not available',
    addDevice: isNL ? 'Apparaat Toevoegen' : 'Add Device',
    registering: isNL ? 'Registreren...' : 'Registering...',
    noCredentials: isNL
      ? 'Nog geen biometrische apparaten geregistreerd'
      : 'No biometric devices registered yet',
    deviceNameLabel: isNL ? 'Apparaatnaam (optioneel)' : 'Device name (optional)',
    deviceNamePlaceholder: isNL ? 'Bijv. iPhone Face ID' : 'e.g. iPhone Face ID',
    register: isNL ? 'Registreren' : 'Register',
    cancel: isNL ? 'Annuleren' : 'Cancel',
    remove: isNL ? 'Verwijderen' : 'Remove',
    lastUsed: isNL ? 'Laatst gebruikt' : 'Last used',
    addedOn: isNL ? 'Toegevoegd op' : 'Added on',
    never: isNL ? 'Nooit' : 'Never',
    success: isNL ? 'Biometrische login ingeschakeld' : 'Biometric login enabled',
    removed: isNL ? 'Apparaat verwijderd' : 'Device removed',
    error: isNL ? 'Er is een fout opgetreden' : 'An error occurred',
    securityNote: isNL
      ? 'Biometrische gegevens worden nooit naar onze servers verstuurd. De verificatie gebeurt lokaal op je apparaat.'
      : 'Biometric data is never sent to our servers. Verification happens locally on your device.',
  };

  useEffect(() => {
    const init = async () => {
      const supported = isBiometricSupported();
      setIsSupported(supported);

      if (supported) {
        const available = await isPlatformAuthenticatorAvailable();
        setIsAvailable(available);
      }

      await fetchCredentials();
      setIsLoading(false);
    };
    init();
  }, []);

  const fetchCredentials = async () => {
    try {
      const creds = await getBiometricCredentials();
      setCredentials(creds);
    } catch {
      setCredentials([]);
    }
  };

  const handleRegister = async () => {
    setIsRegistering(true);
    try {
      const result = await registerBiometric(deviceName || undefined);

      if (result.success) {
        // Save email for quick biometric login
        const userEmail = localStorage.getItem('user_email') ||
          JSON.parse(localStorage.getItem('user_data') || '{}')?.email;
        if (userEmail) {
          saveBiometricEmail(userEmail);
        }

        toast({
          title: txt.success,
          description: isNL
            ? 'Je kunt nu inloggen met Face ID of vingerafdruk'
            : 'You can now sign in with Face ID or fingerprint',
        });
        setShowNameInput(false);
        setDeviceName('');
        await fetchCredentials();
      } else {
        toast({
          title: txt.error,
          description: result.error,
          variant: 'destructive',
        });
      }
    } catch (error: any) {
      toast({
        title: txt.error,
        description: error.message,
        variant: 'destructive',
      });
    } finally {
      setIsRegistering(false);
    }
  };

  const handleRemove = async (credId: number) => {
    try {
      await removeBiometricCredential(credId);
      toast({ title: txt.removed });
      await fetchCredentials();

      // If no credentials left, remove saved email
      const updatedCreds = credentials.filter(c => c.id !== credId);
      if (updatedCreds.length === 0) {
        removeSavedBiometricEmail();
      }
    } catch (error: any) {
      toast({
        title: txt.error,
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(isNL ? 'nl-NL' : 'en-US', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-purple-500" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 text-white">
            <ScanFace className="h-5 w-5" />
          </div>
          <div>
            <CardTitle>{txt.title}</CardTitle>
            <CardDescription>{txt.description}</CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Support Status */}
        {!isSupported ? (
          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">{txt.notSupported}</p>
          </div>
        ) : !isAvailable ? (
          <div className="flex items-center gap-3 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl">
            <AlertCircle className="h-5 w-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-200">{txt.notAvailable}</p>
          </div>
        ) : (
          <>
            {/* Registered Devices */}
            {credentials.length > 0 ? (
              <div className="space-y-3">
                {credentials.map((cred) => (
                  <div
                    key={cred.id}
                    className="flex items-center justify-between p-4 border rounded-xl hover:border-purple-200 dark:hover:border-purple-800 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-600">
                        <Fingerprint className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-medium">{cred.device_name}</p>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span>{txt.addedOn} {formatDate(cred.created_at)}</span>
                          <span>
                            {txt.lastUsed}: {cred.last_used_at ? formatDate(cred.last_used_at) : txt.never}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemove(cred.id)}
                      className="text-red-500 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Smartphone className="h-12 w-12 mx-auto mb-3 opacity-30" />
                <p>{txt.noCredentials}</p>
              </div>
            )}

            {/* Add Device */}
            {showNameInput ? (
              <div className="space-y-3 p-4 border-2 border-dashed border-purple-200 dark:border-purple-800 rounded-xl">
                <div className="space-y-2">
                  <Label>{txt.deviceNameLabel}</Label>
                  <Input
                    value={deviceName}
                    onChange={(e) => setDeviceName(e.target.value)}
                    placeholder={txt.deviceNamePlaceholder}
                    disabled={isRegistering}
                  />
                </div>
                <div className="flex gap-2">
                  <Button
                    onClick={handleRegister}
                    disabled={isRegistering}
                    className="bg-purple-600 hover:bg-purple-700"
                  >
                    {isRegistering ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        {txt.registering}
                      </>
                    ) : (
                      <>
                        <ScanFace className="mr-2 h-4 w-4" />
                        {txt.register}
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => {
                      setShowNameInput(false);
                      setDeviceName('');
                    }}
                    disabled={isRegistering}
                  >
                    {txt.cancel}
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                variant="outline"
                onClick={() => setShowNameInput(true)}
                className="w-full gap-2 border-dashed border-2 border-purple-200 dark:border-purple-800 hover:bg-purple-50 dark:hover:bg-purple-900/20"
              >
                <Plus className="h-4 w-4" />
                {txt.addDevice}
              </Button>
            )}
          </>
        )}

        {/* Security Note */}
        <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/30 rounded-xl">
          <Shield className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-300">{txt.securityNote}</p>
        </div>
      </CardContent>
    </Card>
  );
}
