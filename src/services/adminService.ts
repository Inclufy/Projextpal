import { apiService } from './apiService';

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

class AdminService {
  // ========== Dashboard ==========
  
  async getDashboardStats(): Promise<DashboardStats> {
    return apiService.get<DashboardStats>('/admin/dashboard/stats/');
  }

  async getAdminModules(): Promise<AdminModule[]> {
    return apiService.get<AdminModule[]>('/admin/modules/');
  }

  // ========== Users Management ==========
  
  async getUsers(): Promise<AdminUser[]> {
    return apiService.get<AdminUser[]>('/admin/users/');
  }

  async getUserStats(): Promise<UserStats> {
    return apiService.get<UserStats>('/admin/users/stats/');
  }

  async createUser(userData: Partial<AdminUser>): Promise<AdminUser> {
    return apiService.post<AdminUser>('/admin/users/', userData);
  }

  async updateUser(userId: number, userData: Partial<AdminUser>): Promise<AdminUser> {
    return apiService.put<AdminUser>(`/admin/users/${userId}/`, userData);
  }

  async deleteUser(userId: number): Promise<void> {
    return apiService.delete<void>(`/admin/users/${userId}/`);
  }

  // ========== Activity Logs ==========
  
  async getActivities(params?: { period?: 'today' | 'week' | 'month' }): Promise<Activity[]> {
    return apiService.get<Activity[]>('/admin/activity/', params);
  }

  async getActivityStats(): Promise<ActivityStats> {
    return apiService.get<ActivityStats>('/admin/activity/stats/');
  }

  // ========== System Health ==========
  
  async getSystemInfo(): Promise<SystemInfo> {
    return apiService.get<SystemInfo>('/admin/system/info/');
  }

  async getSystemHealth(): Promise<SystemHealth> {
    return apiService.get<SystemHealth>('/admin/system/health/');
  }
}

// ==================== Export Singleton ====================

export const adminService = new AdminService();