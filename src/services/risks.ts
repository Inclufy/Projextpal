import { apiService } from './apiService';
import { API_CONFIG } from '../constants/config';

export interface Risk {
  id: string;
  title: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  probability: 'low' | 'medium' | 'high';
  impact: 'low' | 'medium' | 'high';
  status: 'open' | 'mitigating' | 'mitigated' | 'closed';
  project?: string;
  project_name?: string;
  owner?: string;
  mitigation_plan?: string;
  identified_date?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CreateRiskData {
  title: string;
  description?: string;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  probability?: 'low' | 'medium' | 'high';
  impact?: 'low' | 'medium' | 'high';
  status?: 'open' | 'mitigating' | 'mitigated' | 'closed';
  project?: string;
  owner?: string;
  mitigation_plan?: string;
}

export interface UpdateRiskData extends Partial<CreateRiskData> {}

class RisksService {
  // READ - Get all risks
  async getRisks(): Promise<Risk[]> {
    const response = await apiService.get<Risk[] | { results: Risk[] }>(API_CONFIG.ENDPOINTS.RISKS);
    return Array.isArray(response) ? response : response.results || [];
  }

  // READ - Get single risk
  async getRisk(id: string): Promise<Risk> {
    const response = await apiService.get<Risk>(`${API_CONFIG.ENDPOINTS.RISKS}${id}/`);
    return response;
  }

  // CREATE - Create new risk
  async createRisk(data: CreateRiskData): Promise<Risk> {
    const response = await apiService.post<Risk>(API_CONFIG.ENDPOINTS.RISKS, data);
    return response;
  }

  // UPDATE - Update risk
  async updateRisk(id: string, data: UpdateRiskData): Promise<Risk> {
    const response = await apiService.put<Risk>(`${API_CONFIG.ENDPOINTS.RISKS}${id}/`, data);
    return response;
  }

  // DELETE - Delete risk
  async deleteRisk(id: string): Promise<void> {
    await apiService.delete(`${API_CONFIG.ENDPOINTS.RISKS}${id}/`);
  }

  // Get risks by project
  async getRisksByProject(projectId: string): Promise<Risk[]> {
    const response = await apiService.get<Risk[] | { results: Risk[] }>(`${API_CONFIG.ENDPOINTS.RISKS}?project=${projectId}`);
    return Array.isArray(response) ? response : response.results || [];
  }
}

export const risksService = new RisksService();
