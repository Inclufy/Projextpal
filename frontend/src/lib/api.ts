import type { Project, Program, TimeEntry } from '@/types/api';

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

  async request<T>(
    endpoint: string,
    options: RequestInit & { timeoutMs?: number } = {},
  ): Promise<T> {
    // If the caller passed timeoutMs, install an AbortController so a slow
    // / hung backend can't leave the UI spinning forever (see BUG-031).
    const { timeoutMs, ...fetchOptions } = options;
    let timeoutHandle: ReturnType<typeof setTimeout> | undefined;
    if (timeoutMs && timeoutMs > 0 && !fetchOptions.signal) {
      const controller = new AbortController();
      fetchOptions.signal = controller.signal;
      timeoutHandle = setTimeout(() => {
        controller.abort(
          new DOMException(
            `Request timed out after ${timeoutMs}ms`,
            'TimeoutError',
          ),
        );
      }, timeoutMs);
    }

    const url = `${this.baseUrl}${endpoint}`;
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeaders(),
      ...(fetchOptions.headers as Record<string, string> || {}),
    };

    try {
      const response = await fetch(url, { ...fetchOptions, headers });
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
    } catch (err) {
      // Surface the timeout with a recognisable message so callers can
      // distinguish "server is slow" from a real backend error.
      if (err instanceof DOMException && err.name === 'TimeoutError') {
        throw new Error(`Request timed out after ${timeoutMs}ms`);
      }
      throw err;
    } finally {
      if (timeoutHandle) clearTimeout(timeoutHandle);
    }
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

  post<T>(
    endpoint: string,
    data?: unknown,
    options?: { timeoutMs?: number; signal?: AbortSignal },
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
      ...(options ?? {}),
    });
  }

  put<T>(
    endpoint: string,
    data?: unknown,
    options?: { timeoutMs?: number; signal?: AbortSignal },
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
      ...(options ?? {}),
    });
  }

  patch<T>(
    endpoint: string,
    data?: unknown,
    options?: { timeoutMs?: number; signal?: AbortSignal },
  ): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
      ...(options ?? {}),
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
  getAll: (params?: Record<string, string | number | boolean>) => api.get<Project[]>('/projects/', params),
  getById: (id: string | number) => api.get<Project>(`/projects/${id}/`),
  create: (data: Partial<Project>) => api.post<Project>('/projects/', data),
  update: (id: string | number, data: Partial<Project>) => api.patch<Project>(`/projects/${id}/`, data),
  delete: (id: string | number) => api.delete(`/projects/${id}/`),
};

export const timeEntriesApi = {
  getAll: (params?: Record<string, string | number | boolean>) => api.get<TimeEntry[]>('/projects/time-entries/', params),
  getMine: (params?: Record<string, string | number | boolean>) => api.get<TimeEntry[]>('/projects/time-entries/my_entries/', params),
  getSummary: (projectId?: string | number) => {
    const params = projectId ? { project: projectId } : {};
    // Aggregate summary endpoint — distinct shape, typed in a later phase.
    return api.get<Record<string, unknown>>('/projects/time-entries/summary/', params);
  },
  create: (data: Partial<TimeEntry>) => api.post<TimeEntry>('/projects/time-entries/', data),
  update: (id: string | number, data: Partial<TimeEntry>) => api.patch<TimeEntry>(`/projects/time-entries/${id}/`, data),
  delete: (id: string | number) => api.delete(`/projects/time-entries/${id}/`),
};

export const teamApi = {
  getAll: () => api.get<any[]>('/auth/company-users/'),
};

// Programs API
export const programsApi = {
  getAll: (params?: Record<string, string | number | boolean>) => api.get<Program[]>('/programs/', params),
  getById: (id: string | number) => api.get<Program>(`/programs/${id}/`),
  create: (data: Partial<Program>) => api.post<Program>('/programs/', data),
  update: (id: string | number, data: Partial<Program>) => api.patch<Program>(`/programs/${id}/`, data),
  delete: (id: string | number) => api.delete(`/programs/${id}/`),

  // Program-specific endpoints
  getProjects: (programId: string | number) => api.get<Project[]>(`/programs/${programId}/projects/`),
  addProject: (programId: string | number, projectId: string | number) =>
    api.post(`/programs/${programId}/add_project/`, { project_id: projectId }),
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

export default api;