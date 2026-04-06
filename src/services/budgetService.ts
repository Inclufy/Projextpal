import { apiService } from './apiService';

export interface BudgetCategory {
  id: string;
  name: string;
  allocated: number;
  spent: number;
  remaining: number;
  color?: string;
  icon?: string;
}

export interface BudgetItem {
  id: string;
  category_id: string;
  description: string;
  amount: number;
  date: string;
  type: 'expense' | 'income' | 'transfer';
  status: 'pending' | 'approved' | 'rejected';
  created_by?: string;
  approved_by?: string;
  receipt_url?: string;
  notes?: string;
}

export interface ProjectBudget {
  id: string;
  project_id: string;
  project_name: string;
  allocated: number;
  spent: number;
  remaining: number;
  currency: string;
  categories?: BudgetCategory[];
  items?: BudgetItem[];
}

export interface Budget {
  id: string;
  total_budget: number;
  total_spent: number;
  total_remaining: number;
  currency: string;
  period_start?: string;
  period_end?: string;
  projects?: ProjectBudget[];
  categories?: BudgetCategory[];
  updated_at: string;
}

export interface CreateBudgetItemData {
  project_id?: string;
  category_id: string;
  description: string;
  amount: number;
  date?: string;
  type?: 'expense' | 'income' | 'transfer';
  notes?: string;
}

class BudgetService {
  // ==================== BUDGET OVERVIEW ====================

  /**
   * Get overall budget summary
   */
  async getBudgetOverview(): Promise<Budget> {
    try {
      const response = await apiService.get('/budget/overview/');
      return response;
    } catch (error) {
      console.error('Failed to fetch budget overview:', error);
      throw error;
    }
  }

  /**
   * Get budget for a specific project
   */
  async getProjectBudget(projectId: string): Promise<ProjectBudget> {
    try {
      const response = await apiService.get(`/projects/${projectId}/budget/`);
      return response;
    } catch (error) {
      console.error('Failed to fetch project budget:', error);
      throw error;
    }
  }

  /**
   * Get budget for a specific program
   */
  async getProgramBudget(programId: string): Promise<{
    total: number;
    spent: number;
    remaining: number;
    projects: ProjectBudget[];
  }> {
    try {
      const response = await apiService.get(`/programs/${programId}/budget/`);
      return response;
    } catch (error) {
      console.error('Failed to fetch program budget:', error);
      throw error;
    }
  }

  // ==================== BUDGET ITEMS (EXPENSES) ====================

  /**
   * Get all budget items/expenses
   */
  async getBudgetItems(filters?: {
    project_id?: string;
    category_id?: string;
    start_date?: string;
    end_date?: string;
    status?: string;
  }): Promise<BudgetItem[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.project_id) params.append('project_id', filters.project_id);
      if (filters?.category_id) params.append('category_id', filters.category_id);
      if (filters?.start_date) params.append('start_date', filters.start_date);
      if (filters?.end_date) params.append('end_date', filters.end_date);
      if (filters?.status) params.append('status', filters.status);

      const response = await apiService.get(`/budget/items/?${params.toString()}`);
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch budget items:', error);
      throw error;
    }
  }

  /**
   * Get a single budget item
   */
  async getBudgetItem(id: string): Promise<BudgetItem> {
    try {
      const response = await apiService.get(`/budget/items/${id}/`);
      return response;
    } catch (error) {
      console.error('Failed to fetch budget item:', error);
      throw error;
    }
  }

  /**
   * Create a new budget item (expense)
   */
  async createBudgetItem(data: CreateBudgetItemData): Promise<BudgetItem> {
    try {
      const response = await apiService.post('/budget/items/', {
        ...data,
        date: data.date || new Date().toISOString().split('T')[0],
        type: data.type || 'expense',
      });
      return response;
    } catch (error) {
      console.error('Failed to create budget item:', error);
      throw error;
    }
  }

  /**
   * Update a budget item
   */
  async updateBudgetItem(id: string, data: Partial<CreateBudgetItemData>): Promise<BudgetItem> {
    try {
      const response = await apiService.patch(`/budget/items/${id}/`, data);
      return response;
    } catch (error) {
      console.error('Failed to update budget item:', error);
      throw error;
    }
  }

  /**
   * Delete a budget item
   */
  async deleteBudgetItem(id: string): Promise<void> {
    try {
      await apiService.delete(`/budget/items/${id}/`);
    } catch (error) {
      console.error('Failed to delete budget item:', error);
      throw error;
    }
  }

  // ==================== CATEGORIES ====================

  /**
   * Get all budget categories
   */
  async getCategories(): Promise<BudgetCategory[]> {
    try {
      const response = await apiService.get('/budget/categories/');
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch categories:', error);
      throw error;
    }
  }

  /**
   * Create a new category
   */
  async createCategory(data: { name: string; allocated?: number; color?: string }): Promise<BudgetCategory> {
    try {
      const response = await apiService.post('/budget/categories/', data);
      return response;
    } catch (error) {
      console.error('Failed to create category:', error);
      throw error;
    }
  }

  /**
   * Update category allocation
   */
  async updateCategoryAllocation(categoryId: string, allocated: number): Promise<BudgetCategory> {
    try {
      const response = await apiService.patch(`/budget/categories/${categoryId}/`, { allocated });
      return response;
    } catch (error) {
      console.error('Failed to update category:', error);
      throw error;
    }
  }

  // ==================== APPROVAL WORKFLOW ====================

  /**
   * Approve a budget item
   */
  async approveItem(itemId: string): Promise<BudgetItem> {
    try {
      const response = await apiService.post(`/budget/items/${itemId}/approve/`);
      return response;
    } catch (error) {
      console.error('Failed to approve item:', error);
      throw error;
    }
  }

  /**
   * Reject a budget item
   */
  async rejectItem(itemId: string, reason?: string): Promise<BudgetItem> {
    try {
      const response = await apiService.post(`/budget/items/${itemId}/reject/`, { reason });
      return response;
    } catch (error) {
      console.error('Failed to reject item:', error);
      throw error;
    }
  }

  /**
   * Get pending items for approval
   */
  async getPendingItems(): Promise<BudgetItem[]> {
    try {
      const response = await apiService.get('/budget/items/?status=pending');
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch pending items:', error);
      throw error;
    }
  }

  // ==================== ANALYTICS ====================

  /**
   * Get spending by category
   */
  async getSpendingByCategory(projectId?: string): Promise<{
    category: string;
    spent: number;
    allocated: number;
    percentage: number;
  }[]> {
    try {
      const url = projectId 
        ? `/budget/analytics/by-category/?project_id=${projectId}`
        : '/budget/analytics/by-category/';
      const response = await apiService.get(url);
      return response;
    } catch (error) {
      console.error('Failed to fetch spending by category:', error);
      throw error;
    }
  }

  /**
   * Get spending trend over time
   */
  async getSpendingTrend(period: 'week' | 'month' | 'quarter' | 'year' = 'month'): Promise<{
    date: string;
    amount: number;
  }[]> {
    try {
      const response = await apiService.get(`/budget/analytics/trend/?period=${period}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch spending trend:', error);
      throw error;
    }
  }

  /**
   * Get budget forecast
   */
  async getBudgetForecast(projectId?: string): Promise<{
    projected_spend: number;
    projected_remaining: number;
    burn_rate: number;
    days_until_depleted: number | null;
  }> {
    try {
      const url = projectId 
        ? `/budget/forecast/?project_id=${projectId}`
        : '/budget/forecast/';
      const response = await apiService.get(url);
      return response;
    } catch (error) {
      console.error('Failed to fetch forecast:', error);
      throw error;
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Format currency amount
   */
  formatCurrency(amount: number, currency: string = 'EUR'): string {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  }

  /**
   * Calculate percentage
   */
  getPercentage(spent: number, total: number): number {
    if (total === 0) return 0;
    return Math.round((spent / total) * 100);
  }

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    switch (status) {
      case 'approved': return '#10B981';
      case 'pending': return '#F59E0B';
      case 'rejected': return '#EF4444';
      default: return '#6B7280';
    }
  }

  /**
   * Get budget health status
   */
  getBudgetHealth(spent: number, total: number): {
    status: 'healthy' | 'warning' | 'critical';
    color: string;
    label: string;
  } {
    const percentage = this.getPercentage(spent, total);
    
    if (percentage < 70) {
      return { status: 'healthy', color: '#10B981', label: 'Op schema' };
    } else if (percentage < 90) {
      return { status: 'warning', color: '#F59E0B', label: 'Aandacht vereist' };
    } else {
      return { status: 'critical', color: '#EF4444', label: 'Kritiek' };
    }
  }

  /**
   * Get default category colors
   */
  getCategoryColor(index: number): string {
    const colors = [
      '#8B5CF6', // Purple
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Amber
      '#EF4444', // Red
      '#EC4899', // Pink
      '#06B6D4', // Cyan
      '#84CC16', // Lime
    ];
    return colors[index % colors.length];
  }
}

export const budgetService = new BudgetService();