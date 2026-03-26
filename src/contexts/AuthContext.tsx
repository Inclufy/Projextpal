import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import * as SecureStore from 'expo-secure-store';
import api, { setOnUnauthorized } from '../services/api';

const IDLE_TIMEOUT_MS = 15 * 60 * 1000; // 15 minutes

interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  role: string;
  organization?: string;
  subscription_tier?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ requires2FA?: boolean }>;
  verify2FA: (code: string) => Promise<void>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [tempToken, setTempToken] = useState<string | null>(null);
  const lastActiveRef = useRef<number>(Date.now());

  // Idle session timeout: sign out after 15 min of being backgrounded
  useEffect(() => {
    function handleAppStateChange(nextState: AppStateStatus) {
      if (nextState === 'active') {
        const elapsed = Date.now() - lastActiveRef.current;
        if (elapsed > IDLE_TIMEOUT_MS) {
          logout().catch(() => {});
        }
        lastActiveRef.current = Date.now();
      } else {
        lastActiveRef.current = Date.now();
      }
    }

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    loadStoredAuth();
    // Sync React auth state when API gets 401
    setOnUnauthorized(() => {
      setToken(null);
      setUser(null);
    });
    return () => setOnUnauthorized(null);
  }, []);

  async function loadStoredAuth() {
    try {
      const storedToken = await SecureStore.getItemAsync('auth_token');
      if (storedToken) {
        setToken(storedToken);
        const res = await api.get('/users/me/');
        setUser(res.data);
      }
    } catch {
      await SecureStore.deleteItemAsync('auth_token');
    } finally {
      setLoading(false);
    }
  }

  async function login(email: string, password: string) {
    const res = await api.post('/auth/login/', { email, password });
    if (res.data.requires_2fa) {
      setTempToken(res.data.temp_token);
      return { requires2FA: true };
    }
    const authToken = res.data.token;
    await SecureStore.setItemAsync('auth_token', authToken);
    setToken(authToken);
    setUser(res.data.user);
    return {};
  }

  async function verify2FA(code: string) {
    const res = await api.post('/auth/verify-2fa/', {
      temp_token: tempToken,
      code,
    });
    const authToken = res.data.token;
    await SecureStore.setItemAsync('auth_token', authToken);
    setToken(authToken);
    setUser(res.data.user);
    setTempToken(null);
  }

  async function logout() {
    try {
      await api.post('/auth/logout/');
    } catch {
      // ignore
    }
    await SecureStore.deleteItemAsync('auth_token');
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        verify2FA,
        logout,
        isAuthenticated: !!token && !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
