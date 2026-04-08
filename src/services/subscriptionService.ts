import AsyncStorage from '@react-native-async-storage/async-storage';
import { apiService } from './apiService';
import { API_CONFIG } from '../constants/config';

interface UserFeatures {
  tier: string;
  features: Record<string, boolean>;
  limits: {
    max_users: number;
    max_programs: number;
    max_projects: number;
  };
  usage: {
    users: number;
    programs: number;
    projects: number;
  };
  can_create: {
    user: boolean;
    program: boolean;
    project: boolean;
  };
}

class SubscriptionService {
  private baseURL = API_CONFIG.BASE_URL;

  private async getHeaders() {
    const token = await AsyncStorage.getItem('access_token');
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  }

  async getSubscriptionTiers() {
    try {
      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.SUBSCRIPTION_TIERS}`,
        {
          method: 'GET',
          headers: await this.getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subscription tiers');
      }

      return data;
    } catch (error) {
      console.error('Get subscription tiers error:', error);
      throw error;
    }
  }

  async getUserFeatures() {
  try {
    const response = await apiService.get('/users/features/') as any;
    return response.data || response;
  } catch (error) {
    console.warn('User features not available, using defaults');
    // Return default values when endpoint doesn't exist
    return {
      tier: 'trial',
      features: {
        time_tracking: true,
        teams: false,
        post_project: false,
      },
      limits: {
        max_users: 5,
        max_programs: 3,
        max_projects: 10,
      },
      usage: {
        users: 1,
        programs: 0,
        projects: 0,
      },
    };
  }
}

  async getUserSubscription() {
    try {
      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.USER_SUBSCRIPTION}`,
        {
          method: 'GET',
          headers: await this.getHeaders(),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch subscription');
      }

      return data;
    } catch (error) {
      console.error('Get user subscription error:', error);
      throw error;
    }
  }

  async createCheckoutSession(data: {
    plan_id: string;
    billing_cycle: 'monthly' | 'yearly';
    success_url?: string;
    cancel_url?: string;
  }) {
    try {
      const response = await fetch(
        `${this.baseURL}${API_CONFIG.ENDPOINTS.CREATE_CHECKOUT}`,
        {
          method: 'POST',
          headers: await this.getHeaders(),
          body: JSON.stringify(data),
        }
      );

      const responseData = await response.json();

      if (!response.ok) {
        throw new Error(responseData.error || 'Failed to create checkout session');
      }

      return responseData;
    } catch (error) {
      console.error('Create checkout session error:', error);
      throw error;
    }
  }

  async canUseFeature(feature: string): Promise<boolean> {
    try {
      const userFeatures = await this.getUserFeatures();
      return userFeatures.features[feature] || false;
    } catch (error) {
      console.error('Check feature availability error:', error);
      return false;
    }
  }

  getSubscriptionStatusColor(status: string): string {
    const colorMap: Record<string, string> = {
      'active': '#10B981',
      'trialing': '#3B82F6',
      'past_due': '#F59E0B',
      'canceled': '#EF4444',
      'incomplete': '#6B7280',
    };
    return colorMap[status] || '#6B7280';
  }

  getTierDisplayName(tier: string): string {
    const tierNames: Record<string, string> = {
      'trial': 'Trial',
      'basic': 'Basic',
      'professional': 'Professional',
      'enterprise': 'Enterprise',
    };
    return tierNames[tier] || tier;
  }
}

export default new SubscriptionService();
