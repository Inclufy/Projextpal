import { apiService } from './apiService';
import { API_CONFIG } from '../constants/config';

export interface Program {
  id: string;
  name: string;
  description: string;
  status: string;
  progress: number;
  methodology?: string;
  projects_count?: number;
  total_budget?: number;
  budget?: number;
  manager_id?: string;
  manager_name?: string;
  health_status?: string;
  start_date?: string;
  end_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateProgramData {
  name: string;
  description?: string;
  status?: string;
  methodology?: string;
  start_date?: string;
  end_date?: string;
}

export interface UpdateProgramData extends Partial<CreateProgramData> {}

class ProgramsService {
  // READ - Get all programs
  async getPrograms(): Promise<Program[]> {
    const response = await apiService.get<Program[] | { results: Program[] }>(API_CONFIG.ENDPOINTS.PROGRAMS);
    return Array.isArray(response) ? response : response.results || [];
  }

  // READ - Get single program
  async getProgram(id: string): Promise<Program> {
    const response = await apiService.get<Program>(`${API_CONFIG.ENDPOINTS.PROGRAMS}${id}/`);
    return response;
  }

  // CREATE - Create new program
  async createProgram(data: CreateProgramData): Promise<Program> {
    const response = await apiService.post<Program>(API_CONFIG.ENDPOINTS.PROGRAMS, data);
    return response;
  }

  // UPDATE - Update program
  async updateProgram(id: string, data: UpdateProgramData): Promise<Program> {
    const response = await apiService.put<Program>(`${API_CONFIG.ENDPOINTS.PROGRAMS}${id}/`, data);
    return response;
  }

  // DELETE - Delete program
  async deleteProgram(id: string): Promise<void> {
    await apiService.delete(`${API_CONFIG.ENDPOINTS.PROGRAMS}${id}/`);
  }
}

export const programsService = new ProgramsService();
