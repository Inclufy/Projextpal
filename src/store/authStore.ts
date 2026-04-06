import { create } from 'zustand';
import { apiService } from '../services/apiService';
import { API_CONFIG } from '../constants/config';

interface User {
  email: string;
  role: 'user' | 'admin' | 'superadmin';
  id?: number;
  first_name?: string;
  last_name?: string;
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
    await apiService.clearTokens();
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
}));