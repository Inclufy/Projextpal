import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from '../services/apiService';
import { API_CONFIG } from '../constants/config';

interface User {
  email: string;
  role: 'user' | 'admin' | 'superadmin' | 'manager';
  id?: number;
  first_name?: string;
  last_name?: string;
  firstName?: string;
  lastName?: string;
  profile_image?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  isSuperAdmin: () => boolean;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email: string, password: string) => {
    try {
      set({ isLoading: true });
      
      // Real API call to backend
      const response = await apiService.post<{
        access: string;
        refresh: string;
        user: User;
      }>(API_CONFIG.ENDPOINTS.LOGIN, {
        email,
        password,
      });
      
      // Save tokens via apiService (uses correct 'auth_token' and 'refresh_token' keys)
      await apiService.setTokens(response.access, response.refresh);
      
      set({ 
        user: response.user, 
        token: response.access, 
        isAuthenticated: true,
        isLoading: false 
      });
    } catch (error) {
      set({ isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    // Clear SecureStore tokens (canonical store).
    await apiService.clearTokens();

    // Defensive sweep: prior versions of authService.ts and
    // subscriptionService.ts kept tokens / user-side caches in plain
    // AsyncStorage. Even though both services now route through SecureStore,
    // existing installs may still have residual AsyncStorage entries from a
    // pre-migration session. Clear them on logout to prevent cross-account
    // data leakage. Language preference (`@projextpal_language`) is
    // intentionally preserved.
    try {
      await AsyncStorage.multiRemove([
        'access_token',
        'refresh_token',
        'user',
        'user_features',
        'user_subscription',
      ]);
    } catch (e) {
      // Non-fatal — SecureStore is the source of truth for auth.
      console.warn('AsyncStorage cleanup on logout failed:', e);
    }

    set({ user: null, token: null, isAuthenticated: false });
  },

  loadUser: async () => {
    try {
      const token = await apiService.getToken();
      
      if (token) {
        // Verify token by fetching user profile
        try {
          const user = await apiService.get<User>(API_CONFIG.ENDPOINTS.PROFILE);
          set({ user, token, isAuthenticated: true });
        } catch (error) {
          // Token invalid or expired, clear everything
          console.log('Token invalid, clearing auth state');
          await apiService.clearTokens();
          set({ user: null, token: null, isAuthenticated: false });
        }
      } else {
        // No token found
        set({ user: null, token: null, isAuthenticated: false });
      }
    } catch (error) {
      console.error('Failed to load user:', error);
      set({ user: null, token: null, isAuthenticated: false });
    }
  },

  isSuperAdmin: () => {
    const { user } = get();
    return user?.role === 'superadmin';
  },

  updateUser: (update: Partial<User>) => {
    set((state) => ({ user: state.user ? { ...state.user, ...update } : null }));
  },
}));