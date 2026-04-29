import { apiService } from './apiService';
import { API_CONFIG } from './api';

// ==================== TypeScript Interfaces ====================

export interface DashboardStats {
  total_users: number;
  total_organizations: number;
  mrr: number;
  active_subscriptions: number;
  user_growth: number;
  org_growth: number;
  mrr_growth: number;
  subscription_growth: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  company: string;
  role: string;
  status: 'active' | 'inactive';
  last_login: string;
  is_online?: boolean;
}

export interface Activity {
  id: number;
  action: string;
  user: string;
  timestamp: string;
  icon: string;
  color: string;
}

export interface SystemService {
  name: string;
  uptime: string;
  status: 'operational' | 'degraded' | 'down';
  response_time?: number;
}

export interface SystemInfo {
  version: string;
  last_backup: string;
  environment: string;
  services: SystemService[];
}

export interface SystemHealth {
  status: string;
  last_check: string;
}

export interface AdminModule {
  key: string;
  name: string;
  count: number;
  icon: string;
}

export interface UserStats {
  total: number;
  active: number;
  inactive: number;
}

export interface ActivityStats {
  today: number;
  this_week: number;
  this_month: number;
}

// ==================== Admin Service ====================
//
// All paths now use the `/api/v1/admin/...` prefix via API_CONFIG. The
// previous bare `/admin/...` paths resolved to the Django admin HTML login
// page, which then crashed callers on `response.json()`. Stale backend paths
// (`/users/stats/`, `/activity/`, `/system/info/`, `/system/health/`,
// `/dashboard/stats/`, `/modules/`) have been replaced with their canonical
// equivalents from `services/api.ts` (ADMIN_STATS, ADMIN_LOGS) where they
// exist, or stubbed to a derived value where they do not.

class AdminService {
  // ========== Dashboard ==========

  async getDashboardStats(): Promise<DashboardStats> {
    // Backend exposes a single combined stats endpoint at /admin/stats/.
    return apiService.get<DashboardStats>(API_CONFIG.ENDPOINTS.ADMIN_STATS);
  }

  async getAdminModules(): Promise<AdminModule[]> {
    // No dedicated /admin/modules/ endpoint exists; fall back to an empty
    // list rather than crashing. AdminDashboard already renders static tiles.
    return [];
  }

  // ========== Users Management ==========

  async getUsers(): Promise<AdminUser[]> {
    return apiService.get<AdminUser[]>(API_CONFIG.ENDPOINTS.ADMIN_USERS);
  }

  async getUserStats(): Promise<UserStats> {
    // Derive a minimal stats object from the users list since the dedicated
    // /users/stats/ endpoint does not exist on the backend.
    try {
      const users = await this.getUsers();
      const total = users.length;
      const active = users.filter((u) => u.status === 'active').length;
      return { total, active, inactive: total - active };
    } catch {
      return { total: 0, active: 0, inactive: 0 };
    }
  }

  async createUser(userData: Partial<AdminUser>): Promise<AdminUser> {
    return apiService.post<AdminUser>(API_CONFIG.ENDPOINTS.ADMIN_USERS, userData);
  }

  async updateUser(userId: number, userData: Partial<AdminUser>): Promise<AdminUser> {
    return apiService.put<AdminUser>(API_CONFIG.ENDPOINTS.ADMIN_USER_DETAIL(userId), userData);
  }

  async deleteUser(userId: number): Promise<void> {
    return apiService.delete<void>(API_CONFIG.ENDPOINTS.ADMIN_USER_DETAIL(userId));
  }

  // ========== Activity Logs ==========

  async getActivities(params?: { period?: 'today' | 'week' | 'month' }): Promise<Activity[]> {
    // Activity is exposed via /admin/logs/ on the backend.
    const queryStr = params?.period ? `?period=${params.period}` : '';
    return apiService.get<Activity[]>(`${API_CONFIG.ENDPOINTS.ADMIN_LOGS}${queryStr}`);
  }

  async getActivityStats(): Promise<ActivityStats> {
    // No dedicated /activity/stats/ endpoint — derive from logs list.
    try {
      const activities = await this.getActivities();
      const now = new Date();
      const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      const today = activities.filter((a) => new Date(a.timestamp) >= startOfToday).length;
      const this_week = activities.filter((a) => new Date(a.timestamp) >= weekAgo).length;
      const this_month = activities.filter((a) => new Date(a.timestamp) >= monthAgo).length;
      return { today, this_week, this_month };
    } catch {
      return { today: 0, this_week: 0, this_month: 0 };
    }
  }

  // ========== System Health ==========

  async getSystemInfo(): Promise<SystemInfo> {
    // Combined system payload comes from /admin/settings/ which surfaces
    // version + environment + service health.
    return apiService.get<SystemInfo>(API_CONFIG.ENDPOINTS.ADMIN_SETTINGS);
  }

  async getSystemHealth(): Promise<SystemHealth> {
    // Dedicated /system/health/ no longer exists; reuse settings payload.
    try {
      const info = await this.getSystemInfo();
      const allOperational = (info.services || []).every((s) => s.status === 'operational');
      return {
        status: allOperational ? 'operational' : 'degraded',
        last_check: new Date().toISOString(),
      };
    } catch {
      return { status: 'unknown', last_check: new Date().toISOString() };
    }
  }
}

// ==================== Export Singleton ====================

export const adminService = new AdminService();
