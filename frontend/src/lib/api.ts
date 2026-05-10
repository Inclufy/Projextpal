const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private getAuthHeaders(): Record<string, string> {
    const token = localStorage.getItem('access_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  }

  async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...(options.headers as Record<string, string> || {}),
    };
    const response = await fetch(url, { ...options, headers });
    if (response.status === 401) {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user_data');
      window.location.href = '/login';
      throw new Error('Session expired');
    }
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || errorData.message || `API Error: ${response.status}`);
    }
    if (response.status === 204) return {} as T;
    return response.json();
  }

  get<T>(endpoint: string, params?: Record<string, string | number | boolean>): Promise<T> {
    let url = endpoint;
    if (params) {
      const queryString = new URLSearchParams(
        Object.entries(params).map(([k, v]) => [k, String(v)])
      ).toString();
      url = `${endpoint}?${queryString}`;
    }
    return this.request<T>(url, { method: 'GET' });
  }

  post<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  patch<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }
}

export const api = new ApiClient(API_BASE_URL);

export const authApi = {
  login: async (email: string, password: string) => {
    const response = await fetch(`${API_BASE_URL}/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Login failed');
    }
    const data = await response.json();
    localStorage.setItem('access_token', data.access);
    localStorage.setItem('refresh_token', data.refresh);
    return data;
  },
  logout: () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user_data');
  },
  isAuthenticated: () => !!localStorage.getItem('access_token'),
};

export const projectsApi = {
  getAll: (params?: Record<string, string | number | boolean>) => api.get<any[]>('/projects/', params),
  getById: (id: string | number) => api.get<any>(`/projects/${id}/`),
  create: (data: any) => api.post<any>('/projects/', data),
  update: (id: string | number, data: any) => api.patch<any>(`/projects/${id}/`, data),
  delete: (id: string | number) => api.delete(`/projects/${id}/`),
};

export const timeEntriesApi = {
  getAll: (params?: Record<string, string | number | boolean>) => api.get<any[]>('/time-entries/', params),
  getMine: (params?: Record<string, string | number | boolean>) => api.get<any[]>('/time-entries/my_entries/', params),
  getSummary: (projectId?: string | number) => {
    const params = projectId ? { project: projectId } : {};
    return api.get<any>('/time-entries/summary/', params);
  },
  create: (data: any) => api.post<any>('/time-entries/', data),
  update: (id: string | number, data: any) => api.patch<any>(`/time-entries/${id}/`, data),
  delete: (id: string | number) => api.delete(`/time-entries/${id}/`),
};

export const teamApi = {
  getAll: () => api.get<any[]>('/team/'),
};

// Programs API
export const programsApi = {
  getAll: (params?: Record<string, string | number | boolean>) => api.get<any[]>('/programs/', params),
  getById: (id: string | number) => api.get<any>(`/programs/${id}/`),
  create: (data: any) => api.post<any>('/programs/', data),
  update: (id: string | number, data: any) => api.patch<any>(`/programs/${id}/`, data),
  delete: (id: string | number) => api.delete(`/programs/${id}/`),
  
  // Program-specific endpoints
  getProjects: (programId: string | number) => api.get<any[]>(`/programs/${programId}/projects/`),
  addProject: (programId: string | number, projectId: string | number) => 
    api.post(`/programs/${programId}/projects/`, { project_id: projectId }),
  removeProject: (programId: string | number, projectId: string | number) => 
    api.delete(`/programs/${programId}/projects/${projectId}/`),
  
  getMetrics: (programId: string | number) => api.get<any>(`/programs/${programId}/metrics/`),
  getDashboard: (programId: string | number) => api.get<any>(`/programs/${programId}/dashboard/`),
  
  getBenefits: (programId: string | number) => api.get<any[]>(`/programs/${programId}/benefits/`),
  getRisks: (programId: string | number) => api.get<any[]>(`/programs/${programId}/risks/`),
  getRoadmap: (programId: string | number) => api.get<any>(`/programs/${programId}/roadmap/`),
  getGovernance: (programId: string | number) => api.get<any>(`/programs/${programId}/governance/`),
  getResources: (programId: string | number) => api.get<any[]>(`/programs/${programId}/resources/`),
};

// Notifications API
export interface Notification {
  id: number;
  kind: 'task_assigned' | 'comment_mention' | 'project_member_added' | 'deadline_approaching';
  title: string;
  body: string;
  target_url: string;
  payload: Record<string, unknown>;
  is_read: boolean;
  read_at: string | null;
  created_at: string;
}

export interface NotificationPreferences {
  in_app_enabled: boolean;
  email_enabled: boolean;
  email_task_assigned: boolean;
  email_comment_mention: boolean;
  email_project_member_added: boolean;
  email_deadline_approaching: boolean;
  updated_at: string;
}

export const notificationsApi = {
  list: (unreadOnly = false) =>
    api.get<{ results?: Notification[] } | Notification[]>(
      '/notifications/',
      unreadOnly ? { unread: '1' } : undefined,
    ),
  unreadCount: () => api.get<{ unread: number }>('/notifications/unread-count/'),
  markRead: (id: number) => api.post<Notification>(`/notifications/${id}/read/`, {}),
  markAllRead: () => api.post<{ marked: number }>('/notifications/mark-all-read/', {}),
  getPreferences: () => api.get<NotificationPreferences>('/notifications/preferences/'),
  updatePreferences: (data: Partial<NotificationPreferences>) =>
    api.patch<NotificationPreferences>('/notifications/preferences/', data),
};

export default api;
