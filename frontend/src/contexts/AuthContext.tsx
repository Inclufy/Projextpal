// ============================================================
// AUTH CONTEXT - IMPROVED VERSION
// Better error handling + 401 recovery
// ============================================================

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isSuperAdmin: boolean;
  company?: number | null;
  companyName?: string | null;
}

interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API Base URL
const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

// Transform API data to User type
const createUserFromData = (data: any, email?: string): User => {
  const userEmail = data?.email || email || '';
  const isSuperAdmin = data?.is_superuser === true || data?.is_superadmin === true || data?.is_staff === true || data?.role === 'superadmin';
  
  return {
    id: data?.id?.toString() || '',
    email: userEmail,
    firstName: data?.first_name || data?.firstName || userEmail.split('@')[0] || '',
    lastName: data?.last_name || data?.lastName || '',
    role: data?.role || 'user',
    isSuperAdmin: isSuperAdmin,
    company: data?.company || null,
    companyName: data?.company_name || data?.companyName || null,
  };
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user data from API
  const fetchUserData = async (token: string): Promise<User | null> => {
    try {
      const response = await fetch(`${API_BASE_URL}/users/me/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      // Handle 401 - Invalid token
      if (response.status === 401) {
        console.log('Token invalid or expired, clearing auth data');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        localStorage.removeItem('user_email');
        return null;
      }

      if (response.ok) {
        const userData = await response.json();
        console.log('✅ User authenticated:', userData.email, 'SuperAdmin:', userData.is_superadmin);
        return createUserFromData(userData);
      }
      
      // 500+ server errors - don't clear tokens, server may be temporarily down
      if (response.status >= 500) {
        console.error('⚠ Server error fetching user data:', response.status);
        return null;
      }

      // Other client errors - clear tokens
      console.error('Failed to fetch user data:', response.status);
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_email');
      return null;
      
    } catch (error) {
      console.error('Error fetching user data:', error);
      // Network error - don't clear tokens, just fail silently
      return null;
    }
  };

  // Check for existing session on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = localStorage.getItem('access_token');
        
        if (!token) {
          console.log('No token found, user not authenticated');
          setIsLoading(false);
          return;
        }

        console.log('Checking authentication with stored token...');
        const userData = await fetchUserData(token);
        
        if (userData) {
          console.log('✅ Session restored for:', userData.email);
          setUser(userData);
        localStorage.setItem('user_role', userData.role || 'admin');
        localStorage.setItem('user_id', userData.id);
        if (userData.company) {
          localStorage.setItem('company_id', userData.company.toString());
        }
        localStorage.setItem("user", JSON.stringify(userData));
        } else {
          console.log('❌ Session invalid, cleared auth data');
        }
        
      } catch (error) {
        console.error('Auth check error:', error);
        setError('Authentication check failed');
      } finally {
        setIsLoading(false);
      }
    };

    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('Attempting login for:', email);
      
      // Step 1: Get tokens
      const response = await fetch(`${API_BASE_URL}/auth/login/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.detail || error.message || 'Login failed');
      }

      const data = await response.json();
      
      // Store tokens
      localStorage.setItem('access_token', data.access);
      localStorage.setItem('refresh_token', data.refresh);
      localStorage.setItem('user_email', email);

      // Step 2: Fetch user data
      const userData = await fetchUserData(data.access);
      
      if (userData) {
  console.log('✅ Login successful for:', userData.email);
  setUser(userData);
        localStorage.setItem('user_role', userData.role || 'admin');
        localStorage.setItem('user_id', userData.id);
        if (userData.company) {
          localStorage.setItem('company_id', userData.company.toString());
        }
  localStorage.setItem('user', JSON.stringify(userData)); // ← ADD THIS
} else {
        throw new Error('Failed to fetch user data after login');
      }

    } catch (error: any) {
      console.error('❌ Login error:', error);
      setError(error.message || 'Login failed');
      
      // Clear any stored data on error
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_email');
      
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    console.log('Logging out...');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_email');
    localStorage.removeItem('user_role');
    localStorage.removeItem('user_id');
    localStorage.removeItem('company_id');
    localStorage.removeItem('user');
    setUser(null);
    setError(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      setUser,
      isLoading,
      isAuthenticated: !!user,
      login,
      logout,
      error,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
