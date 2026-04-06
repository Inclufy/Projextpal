import { apiService } from './apiService';
import { API_CONFIG } from '../constants/config';

export interface Project {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  budget?: number;
  start_date?: string;
  end_date?: string;
  program?: string;
  health_status?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
  program?: string;
}

export interface UpdateProjectData extends Partial<CreateProjectData> {}

class ProjectsService {
  // READ - Get all projects
  async getProjects(): Promise<Project[]> {
    const response = await apiService.get<Project[] | { results: Project[] }>(API_CONFIG.ENDPOINTS.PROJECTS);
    return Array.isArray(response) ? response : response.results || [];
  }

  // READ - Get single project
  async getProject(id: string): Promise<Project> {
    const response = await apiService.get<Project>(`${API_CONFIG.ENDPOINTS.PROJECTS}${id}/`);
    return response;
  }

  // CREATE - Create new project
  async createProject(data: CreateProjectData): Promise<Project> {
    const response = await apiService.post<Project>(API_CONFIG.ENDPOINTS.PROJECTS, data);
    return response;
  }

  // UPDATE - Update project
  async updateProject(id: string, data: UpdateProjectData): Promise<Project> {
    const response = await apiService.put<Project>(`${API_CONFIG.ENDPOINTS.PROJECTS}${id}/`, data);
    return response;
  }

  // DELETE - Delete project
  async deleteProject(id: string): Promise<void> {
    await apiService.delete(`${API_CONFIG.ENDPOINTS.PROJECTS}${id}/`);
  }

  // PATCH - Partial update
  async patchProject(id: string, data: Partial<UpdateProjectData>): Promise<Project> {
    const response = await apiService.put<Project>(`${API_CONFIG.ENDPOINTS.PROJECTS}${id}/`, data);
    return response;
  }
}

export const projectsService = new ProjectsService();
