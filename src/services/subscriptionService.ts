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
    // Tokens are stored in SecureStore (iOS Keychain / Android Keystore) via
    // apiService — never AsyncStorage. See logout() in authStore for the
    // unified clear path.
    const token = await apiService.getToken();
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
    // Backend endpoint /api/v1/auth/subscriptions/user/ returns 404 in production
    // (dropped post-pilot). Subscription state is exposed via getUserFeatures()
    // which derives `tier` from the user record. Returning null lets callers
    // render the trial/free path without crashing.
    console.warn('getUserSubscription is deprecated — use getUserFeatures().tier');
    return null;
  }

  async createCheckoutSession(_data: {
    plan_id: string;
    billing_cycle: 'monthly' | 'yearly';
    success_url?: string;
    cancel_url?: string;
  }) {
    // Stripe checkout is web-only for the current pilot. PricingScreen.tsx
    // composes its own checkout URL inline; this stub exists so consumers
    // that import the service don't break at compile time.
    throw new Error(
      'Checkout via mobile is unavailable — please complete the upgrade at projextpal.com/profile'
    );
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
