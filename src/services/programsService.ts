import { apiService } from './apiService';

export interface Program {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress?: number;
  budget?: number;
  start_date?: string;
  end_date?: string;
  manager_id?: string;
  manager_name?: string;
  projects_count?: number;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProgramData {
  name: string;
  description?: string;
  status?: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
  manager_id?: string;
}

export interface UpdateProgramData {
  name?: string;
  description?: string;
  status?: string;
  progress?: number;
  budget?: number;
  start_date?: string;
  end_date?: string;
  manager_id?: string;
}

class ProgramsService {
  // ==================== PROGRAMS CRUD ====================

  /**
   * Get all programs
   */
  async getPrograms(): Promise<Program[]> {
    try {
      const response = await apiClient.get('/programs/');
      return response.data.results || response.data || [];
    } catch (error) {
      console.error('Failed to fetch programs:', error);
      throw error;
    }
  }

  /**
   * Get a single program by ID
   */
  async getProgram(id: string): Promise<Program> {
    try {
      const response = await apiClient.get(`/programs/${id}/`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch program:', error);
      throw error;
    }
  }

  /**
   * Create a new program
   */
  async createProgram(data: CreateProgramData): Promise<Program> {
    try {
      const response = await apiClient.post('/programs/', {
        ...data,
        status: data.status || 'active',
        progress: 0,
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create program:', error);
      throw error;
    }
  }

  /**
   * Update an existing program
   */
  async updateProgram(id: string, data: UpdateProgramData): Promise<Program> {
    try {
      const response = await apiClient.patch(`/programs/${id}/`, data);
      return response.data;
    } catch (error) {
      console.error('Failed to update program:', error);
      throw error;
    }
  }

  /**
   * Delete a program
   */
  async deleteProgram(id: string): Promise<void> {
    try {
      await apiClient.delete(`/programs/${id}/`);
    } catch (error) {
      console.error('Failed to delete program:', error);
      throw error;
    }
  }

  // ==================== PROGRAM PROJECTS ====================

  /**
   * Get projects belonging to a program
   */
  async getProgramProjects(programId: string): Promise<any[]> {
    try {
      const response = await apiClient.get(`/projects/?program_id=${programId}`);
      return response.data.results || response.data || [];
    } catch (error) {
      console.error('Failed to fetch program projects:', error);
      throw error;
    }
  }

  /**
   * Add a project to a program
   */
  async addProjectToProgram(programId: string, projectId: string): Promise<void> {
    try {
      await apiClient.post(`/programs/${programId}/projects/`, { project_id: projectId });
    } catch (error) {
      // Fallback: update the project directly
      console.warn('Add project endpoint not found, updating project directly');
      await apiClient.patch(`/projects/${projectId}/`, { program_id: programId });
    }
  }

  /**
   * Remove a project from a program
   */
  async removeProjectFromProgram(programId: string, projectId: string): Promise<void> {
    try {
      await apiClient.delete(`/programs/${programId}/projects/${projectId}/`);
    } catch (error) {
      // Fallback: update the project directly
      console.warn('Remove project endpoint not found, updating project directly');
      await apiClient.patch(`/projects/${projectId}/`, { program_id: null });
    }
  }

  // ==================== STATUS MANAGEMENT ====================

  /**
   * Update program status
   */
  async updateStatus(id: string, status: string): Promise<Program> {
    return this.updateProgram(id, { status });
  }

  /**
   * Update program progress
   */
  async updateProgress(id: string, progress: number): Promise<Program> {
    return this.updateProgram(id, { progress: Math.min(100, Math.max(0, progress)) });
  }

  /**
   * Calculate and update progress based on projects
   */
  async recalculateProgress(id: string): Promise<Program> {
    try {
      const projects = await this.getProgramProjects(id);
      if (projects.length === 0) {
        return this.updateProgress(id, 0);
      }
      
      const totalProgress = projects.reduce((sum, p) => sum + (p.progress || 0), 0);
      const avgProgress = Math.round(totalProgress / projects.length);
      
      return this.updateProgress(id, avgProgress);
    } catch (error) {
      console.error('Failed to recalculate progress:', error);
      throw error;
    }
  }

  // ==================== ANALYTICS ====================

  /**
   * Get program statistics
   */
  async getProgramStats(id: string): Promise<{
    projects_count: number;
    total_budget: number;
    spent_budget: number;
    total_hours: number;
    avg_project_progress: number;
    risks_count: number;
  }> {
    try {
      const response = await apiClient.get(`/programs/${id}/stats/`);
      return response.data;
    } catch (error) {
      // Calculate locally if endpoint doesn't exist
      console.warn('Stats endpoint not found, calculating locally');
      const projects = await this.getProgramProjects(id);
      
      return {
        projects_count: projects.length,
        total_budget: projects.reduce((sum, p) => sum + (p.budget || 0), 0),
        spent_budget: projects.reduce((sum, p) => sum + (p.spent || 0), 0),
        total_hours: projects.reduce((sum, p) => sum + (p.total_hours || 0), 0),
        avg_project_progress: projects.length > 0 
          ? Math.round(projects.reduce((sum, p) => sum + (p.progress || 0), 0) / projects.length)
          : 0,
        risks_count: 0, // Would need to fetch from risks endpoint
      };
    }
  }

  /**
   * Get program dashboard data
   */
  async getProgramDashboard(id: string): Promise<{
    program: Program;
    projects: any[];
    recentActivity: any[];
    upcomingMilestones: any[];
  }> {
    try {
      const response = await apiClient.get(`/programs/${id}/dashboard/`);
      return response.data;
    } catch (error) {
      // Build dashboard data from separate endpoints
      const [program, projects] = await Promise.all([
        this.getProgram(id),
        this.getProgramProjects(id),
      ]);
      
      return {
        program,
        projects,
        recentActivity: [],
        upcomingMilestones: [],
      };
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Get status color
   */
  getStatusColor(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return '#10B981';
      case 'completed': return '#3B82F6';
      case 'on_hold': return '#F59E0B';
      case 'cancelled': return '#EF4444';
      default: return '#6B7280';
    }
  }

  /**
   * Get status label in Dutch
   */
  getStatusLabel(status: string): string {
    switch (status?.toLowerCase()) {
      case 'active': return 'Actief';
      case 'completed': return 'Voltooid';
      case 'on_hold': return 'On Hold';
      case 'cancelled': return 'Geannuleerd';
      default: return status || 'Onbekend';
    }
  }

  /**
   * Format budget for display
   */
  formatBudget(budget: number): string {
    return new Intl.NumberFormat('nl-NL', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(budget);
  }
}

export const programsService = new ProgramsService();
