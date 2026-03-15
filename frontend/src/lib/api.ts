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

  put<T>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
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
  getAll: (params?: Record<string, string | number | boolean>) => api.get<any[]>('/projects/time-entries/', params),
  getMine: (params?: Record<string, string | number | boolean>) => api.get<any[]>('/projects/time-entries/my_entries/', params),
  getSummary: (projectId?: string | number) => {
    const params = projectId ? { project: projectId } : {};
    return api.get<any>('/projects/time-entries/summary/', params);
  },
  create: (data: any) => api.post<any>('/projects/time-entries/', data),
  update: (id: string | number, data: any) => api.patch<any>(`/projects/time-entries/${id}/`, data),
  delete: (id: string | number) => api.delete(`/projects/time-entries/${id}/`),
};

export const teamApi = {
  getAll: () => api.get<any[]>('/auth/company-users/'),
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