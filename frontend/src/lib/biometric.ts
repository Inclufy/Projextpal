/**
 * Biometric Authentication Service
 * Handles WebAuthn/FIDO2 for Face ID and Fingerprint login
 */

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

const getAuthHeaders = () => {
  const token = localStorage.getItem('access_token');
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

/**
 * Check if WebAuthn (Face ID / Fingerprint) is supported on this device
 */
export const isBiometricSupported = (): boolean => {
  return !!(
    window.PublicKeyCredential &&
    typeof window.PublicKeyCredential === 'function'
  );
};

/**
 * Check if platform authenticator (Face ID / Touch ID / fingerprint) is available
 */
export const isPlatformAuthenticatorAvailable = async (): Promise<boolean> => {
  if (!isBiometricSupported()) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
};

/**
 * Convert base64url string to ArrayBuffer
 */
const base64urlToBuffer = (base64url: string): ArrayBuffer => {
  const padding = '='.repeat((4 - (base64url.length % 4)) % 4);
  const base64 = (base64url + padding).replace(/-/g, '+').replace(/_/g, '/');
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
};

/**
 * Convert ArrayBuffer to base64url string
 */
const bufferToBase64url = (buffer: ArrayBuffer): string => {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
};

/**
 * Register a new biometric credential (Face ID / fingerprint)
 */
export const registerBiometric = async (deviceName?: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // 1. Get registration options from server
    const optionsRes = await fetch(`${API_BASE_URL}/auth/biometric/register/options/`, {
      headers: getAuthHeaders(),
    });

    if (!optionsRes.ok) {
      throw new Error('Failed to get registration options');
    }

    const options = await optionsRes.json();

    // 2. Create credential using WebAuthn
    const publicKeyOptions: PublicKeyCredentialCreationOptions = {
      challenge: base64urlToBuffer(options.challenge),
      rp: options.rp,
      user: {
        id: base64urlToBuffer(options.user.id),
        name: options.user.name,
        displayName: options.user.displayName,
      },
      pubKeyCredParams: options.pubKeyCredParams,
      timeout: options.timeout,
      excludeCredentials: (options.excludeCredentials || []).map((cred: any) => ({
        ...cred,
        id: base64urlToBuffer(cred.id),
      })),
      authenticatorSelection: options.authenticatorSelection,
      attestation: options.attestation,
    };

    const credential = await navigator.credentials.create({
      publicKey: publicKeyOptions,
    }) as PublicKeyCredential;

    if (!credential) {
      throw new Error('Credential creation was cancelled');
    }

    const attestationResponse = credential.response as AuthenticatorAttestationResponse;

    // 3. Send credential to server
    const completeRes = await fetch(`${API_BASE_URL}/auth/biometric/register/complete/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({
        id: bufferToBase64url(credential.rawId),
        type: credential.type,
        device_name: deviceName || getDeviceName(),
        response: {
          clientDataJSON: bufferToBase64url(attestationResponse.clientDataJSON),
          attestationObject: bufferToBase64url(attestationResponse.attestationObject),
        },
      }),
    });

    if (!completeRes.ok) {
      throw new Error('Failed to register biometric credential');
    }

    return { success: true };
  } catch (error: any) {
    console.error('Biometric registration error:', error);
    return {
      success: false,
      error: error.name === 'NotAllowedError'
        ? 'Biometric registration was cancelled or denied'
        : error.message || 'Biometric registration failed',
    };
  }
};

/**
 * Authenticate using biometric (Face ID / fingerprint)
 */
export const authenticateBiometric = async (email: string): Promise<{
  success: boolean;
  data?: { access: string; refresh: string; user: any };
  error?: string;
}> => {
  try {
    // 1. Get authentication options
    const optionsRes = await fetch(`${API_BASE_URL}/auth/biometric/login/options/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });

    if (!optionsRes.ok) {
      const errorData = await optionsRes.json();
      throw new Error(errorData.error || 'No biometric credentials found');
    }

    const options = await optionsRes.json();

    // 2. Get credential from authenticator
    const publicKeyOptions: PublicKeyCredentialRequestOptions = {
      challenge: base64urlToBuffer(options.challenge),
      rpId: options.rpId,
      allowCredentials: (options.allowCredentials || []).map((cred: any) => ({
        ...cred,
        id: base64urlToBuffer(cred.id),
      })),
      timeout: options.timeout,
      userVerification: options.userVerification,
    };

    const assertion = await navigator.credentials.get({
      publicKey: publicKeyOptions,
    }) as PublicKeyCredential;

    if (!assertion) {
      throw new Error('Biometric authentication was cancelled');
    }

    const assertionResponse = assertion.response as AuthenticatorAssertionResponse;

    // 3. Verify with server
    const completeRes = await fetch(`${API_BASE_URL}/auth/biometric/login/complete/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id: bufferToBase64url(assertion.rawId),
        email,
        response: {
          clientDataJSON: bufferToBase64url(assertionResponse.clientDataJSON),
          authenticatorData: bufferToBase64url(assertionResponse.authenticatorData),
          signature: bufferToBase64url(assertionResponse.signature),
        },
      }),
    });

    if (!completeRes.ok) {
      throw new Error('Biometric verification failed');
    }

    const data = await completeRes.json();
    return { success: true, data };
  } catch (error: any) {
    console.error('Biometric authentication error:', error);
    return {
      success: false,
      error: error.name === 'NotAllowedError'
        ? 'Biometric authentication was cancelled or denied'
        : error.message || 'Biometric authentication failed',
    };
  }
};

/**
 * Check if user has biometric credentials registered
 */
export const checkBiometricStatus = async (): Promise<{
  has_biometric: boolean;
  credential_count: number;
}> => {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/biometric/status/`, {
      headers: getAuthHeaders(),
    });

    if (!res.ok) return { has_biometric: false, credential_count: 0 };

    return await res.json();
  } catch {
    return { has_biometric: false, credential_count: 0 };
  }
};

/**
 * Get list of registered biometric credentials
 */
export const getBiometricCredentials = async () => {
  const res = await fetch(`${API_BASE_URL}/auth/biometric/credentials/`, {
    headers: getAuthHeaders(),
  });

  if (!res.ok) throw new Error('Failed to fetch credentials');

  return await res.json();
};

/**
 * Remove a biometric credential
 */
export const removeBiometricCredential = async (credentialId: number) => {
  const res = await fetch(`${API_BASE_URL}/auth/biometric/credentials/`, {
    method: 'DELETE',
    headers: getAuthHeaders(),
    body: JSON.stringify({ credential_id: credentialId }),
  });

  if (!res.ok) throw new Error('Failed to remove credential');

  return await res.json();
};

/**
 * Get a user-friendly device name
 */
const getDeviceName = (): string => {
  const ua = navigator.userAgent;

  if (/iPad/i.test(ua)) return 'iPad Face ID';
  if (/iPhone/i.test(ua)) return 'iPhone Face ID';
  if (/Macintosh/i.test(ua) && 'ontouchend' in document) return 'iPad Face ID';
  if (/Macintosh/i.test(ua)) return 'MacBook Touch ID';
  if (/Android/i.test(ua)) return 'Android Fingerprint';
  if (/Windows/i.test(ua)) return 'Windows Hello';

  return 'Biometric Device';
};

/**
 * Check if a saved biometric email exists in localStorage
 */
export const getSavedBiometricEmail = (): string | null => {
  return localStorage.getItem('biometric_email');
};

/**
 * Save email for biometric quick-login
 */
export const saveBiometricEmail = (email: string) => {
  localStorage.setItem('biometric_email', email);
};

/**
 * Remove saved biometric email
 */
export const removeSavedBiometricEmail = () => {
  localStorage.removeItem('biometric_email');
};
