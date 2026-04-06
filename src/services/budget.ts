import { apiService } from './apiService';
import { API_CONFIG } from '../constants/config';

export interface ProjectFinancials {
  id: string;
  project: string;
  project_name?: string;
  budget: number;
  actual_cost: number;
  remaining_budget: number;
  currency?: string;
  created_at?: string;
  updated_at?: string;
}

export interface BudgetSummary {
  total_budget: number;
  spent: number;
  remaining: number;
  projects: Array<{
    id: string;
    name: string;
    budget: number;
    spent: number;
    remaining: number;
  }>;
}

export interface CreateBudgetData {
  project: string;
  budget: number;
  actual_cost?: number;
  currency?: string;
}

export interface UpdateBudgetData extends Partial<CreateBudgetData> {}

class BudgetService {
  // READ - Get all financials
  async getFinancials(): Promise<ProjectFinancials[]> {
    const response = await apiService.get<ProjectFinancials[] | { results: ProjectFinancials[] }>(API_CONFIG.ENDPOINTS.BUDGET);
    return Array.isArray(response) ? response : response.results || [];
  }

  // READ - Get budget summary (aggregated)
  async getBudgetSummary(): Promise<BudgetSummary> {
    const financials = await this.getFinancials();
    
    const totalBudget = financials.reduce((sum, f) => sum + (f.budget || 0), 0);
    const totalSpent = financials.reduce((sum, f) => sum + (f.actual_cost || 0), 0);
    
    return {
      total_budget: totalBudget,
      spent: totalSpent,
      remaining: totalBudget - totalSpent,
      projects: financials.map(f => ({
        id: f.id,
        name: f.project_name || f.project,
        budget: f.budget || 0,
        spent: f.actual_cost || 0,
        remaining: (f.budget || 0) - (f.actual_cost || 0),
      }))
    };
  }

  // READ - Get single financial record
  async getFinancial(id: string): Promise<ProjectFinancials> {
    const response = await apiService.get<ProjectFinancials>(`${API_CONFIG.ENDPOINTS.BUDGET}${id}/`);
    return response;
  }

  // CREATE - Create new budget record
  async createBudget(data: CreateBudgetData): Promise<ProjectFinancials> {
    const response = await apiService.post<ProjectFinancials>(API_CONFIG.ENDPOINTS.BUDGET, data);
    return response;
  }

  // UPDATE - Update budget
  async updateBudget(id: string, data: UpdateBudgetData): Promise<ProjectFinancials> {
    const response = await apiService.put<ProjectFinancials>(`${API_CONFIG.ENDPOINTS.BUDGET}${id}/`, data);
    return response;
  }

  // DELETE - Delete budget record
  async deleteBudget(id: string): Promise<void> {
    await apiService.delete(`${API_CONFIG.ENDPOINTS.BUDGET}${id}/`);
  }

  // Get budget by project
  async getBudgetByProject(projectId: string): Promise<ProjectFinancials | null> {
    const financials = await this.getFinancials();
    return financials.find(f => f.project === projectId) || null;
  }
}

export const budgetService = new BudgetService();
