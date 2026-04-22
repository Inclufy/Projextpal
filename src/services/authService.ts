import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_CONFIG } from '../constants/config';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterData {
  email: string;
  first_name: string;
  last_name?: string;
  company_name: string;
  password: string;
  subscription_tier?: string;
}

class AuthService {
  private baseURL = API_CONFIG.BASE_URL;

  private async getHeaders(includeAuth = false) {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (includeAuth) {
      const token = await AsyncStorage.getItem('access_token');
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
    }

    return headers;
  }

  async login(credentials: LoginCredentials) {
    try {
      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.LOGIN}`,
        {
          method: 'POST',
          headers: await this.getHeaders(),
          body: JSON.stringify(credentials),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || data.error || 'Login failed');
      }

      if (data.access) {
        await AsyncStorage.setItem('access_token', data.access);
      }
      if (data.refresh) {
        await AsyncStorage.setItem('refresh_token', data.refresh);
      }

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async register(data: RegisterData) {
    try {
      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.REGISTER}`,
        {
          method: 'POST',
          headers: await this.getHeaders(),
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Registration failed');
      }

      return responseData;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async forgotPassword(data: { email: string }) {
    try {
      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.FORGOT_PASSWORD}`,
        {
          method: 'POST',
          headers: await this.getHeaders(),
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to send reset email');
      }

      return responseData;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  }

  async resetPassword(token: string, data: { password: string }) {
    try {
      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.RESET_PASSWORD(token)}`,
        {
          method: 'POST',
          headers: await this.getHeaders(),
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Password reset failed');
      }

      return responseData;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  }

  async checkEmailVerification(token: string) {
    try {
      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.VERIFY_EMAIL(token)}`,
        {
          method: 'GET',
          headers: await this.getHeaders(),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Invalid verification token');
      }

      return responseData;
    } catch (error) {
      console.error('Check email verification error:', error);
      throw error;
    }
  }

  async verifyEmailAndSetPassword(token: string, data: { password: string }) {
    try {
      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.VERIFY_EMAIL(token)}`,
        {
          method: 'POST',
          headers: await this.getHeaders(),
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Email verification failed');
      }

      return responseData;
    } catch (error) {
      console.error('Verify email error:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.PROFILE}`,
        {
          method: 'GET',
          headers: await this.getHeaders(true),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch user profile');
      }

      return data;
    } catch (error) {
      console.error('Get user error:', error);
      throw error;
    }
  }

  async refreshToken() {
    try {
      const refreshToken = await AsyncStorage.getItem('refresh_token');
      
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.REFRESH}`,
        {
          method: 'POST',
          headers: await this.getHeaders(),
          body: JSON.stringify({ refresh: refreshToken }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Token refresh failed');
      }

      if (data.access) {
        await AsyncStorage.setItem('access_token', data.access);
      }

      return data;
    } catch (error) {
      console.error('Refresh token error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      await AsyncStorage.multiRemove(['access_token', 'refresh_token']);
    } catch (error) {
      console.error('Logout error:', error);
      throw error;
    }
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await AsyncStorage.getItem('access_token');
    return !!token;
  }
}

export default new AuthService();
