import { apiService } from './apiService';
import { API_CONFIG } from '../constants/config';
import {
  LoginCredentials,
  RegisterData,
  AuthResponse,
  User,
} from '../types';

class AuthService {
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    console.log('🔵 LOGIN ATTEMPT');
    
    // Backend expects 'email' field (not username!)
    const response = await apiService.post<any>(
      API_CONFIG.ENDPOINTS.LOGIN,
      {
        email: credentials.email,  // ← Changed from 'username' to 'email'
        password: credentials.password,
      }
    );

    console.log('✅ LOGIN RESPONSE:', response);

    // Parse backend response format
    const authResponse: AuthResponse = {
      user: {
        id: response.user.id.toString(),
        email: response.user.email,
        firstName: response.user.first_name || '',
        lastName: '',
        role: response.user.role,
      },
      tokens: {
        access: response.access,
        refresh: response.refresh,
      }
    };

    // Save tokens
    await apiService.setTokens(authResponse.tokens.access, authResponse.tokens.refresh);

    return authResponse;
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await apiService.post<any>(
      API_CONFIG.ENDPOINTS.REGISTER,
      {
        email: data.email,
        password: data.password,
        first_name: data.firstName || '',
        company_name: data.firstName + ' ' + (data.lastName || '') + ' Company',
      }
    );

    throw new Error('Account created! Please check your email to verify your account.');
  }

  async logout(): Promise<void> {
    await apiService.clearTokens();
  }

  async getProfile(): Promise<User> {
    const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.PROFILE);
    
    return {
      id: response.id.toString(),
      email: response.email,
      firstName: response.first_name || '',
      lastName: '',
      role: response.role,
    };
  }

  async isAuthenticated(): Promise<boolean> {
    const token = await apiService.getToken();
    return !!token;
  }

  async uploadProfileImage(imageUri: string): Promise<string> {
    const formData = new FormData();
    formData.append('profile_image', {
      uri: imageUri,
      type: 'image/jpeg',
      name: 'profile.jpg',
    } as any);

    // ✅ FIXED: Use full API path
    const response = await apiService.post(
      `${API_CONFIG.ENDPOINTS.PROFILE}/image/`,  // This becomes /api/v1/auth/user/image/
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    
    return response.profile_image_url;
  }
} // ← ADDED THIS CLOSING BRACE

export const authService = new AuthService();