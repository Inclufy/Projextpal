import { apiService } from './apiService';
import { API_CONFIG } from '../constants/config';

export interface Project {
  id: string;
  name: string;
  description?: string;
  status: string;
  progress?: number;
  budget?: number;
  spent?: number;
  start_date?: string;
  end_date?: string;
  manager_id?: string;
  manager_name?: string;
  program_id?: string;
  program_name?: string;
  methodology?: string;
  total_hours?: number;
  team_size?: number;
  organization_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateProjectData {
  name: string;
  description?: string;
  status?: string;
  budget?: number;
  start_date?: string;
  end_date?: string;
  manager_id?: string;
  program_id?: string;
  methodology?: string;
}

export interface UpdateProjectData {
  name?: string;
  description?: string;
  status?: string;
  progress?: number;
  budget?: number;
  spent?: number;
  start_date?: string;
  end_date?: string;
  manager_id?: string;
  program_id?: string;
  methodology?: string;
}

class ProjectsService {
  // ==================== PROJECTS CRUD ====================

  /**
   * Get all projects
   */
  async getProjects(): Promise<Project[]> {
    try {
      console.log('📂 Fetching projects...');
      const response = await apiService.get<any>(API_CONFIG.ENDPOINTS.PROJECTS);
      console.log('📂 Projects response:', response);

      // apiService returns response directly (not wrapped in .data)
      const projects = response.results || response || [];
      
      console.log('✅ Projects loaded:', projects.length);
      return projects;
    } catch (error) {
      console.error('❌ Failed to fetch projects:', error);
      throw error;
    }
  }

  /**
   * Get projects by program
   */
  async getProjectsByProgram(programId: string): Promise<Project[]> {
    try {
      const response = await apiService.get<any>(`${API_CONFIG.ENDPOINTS.PROJECTS}?program=${programId}`);
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch program projects:', error);
      throw error;
    }
  }

  /**
   * Get projects by status
   */
  async getProjectsByStatus(status: string): Promise<Project[]> {
    try {
      const response = await apiService.get<any>(`${API_CONFIG.ENDPOINTS.PROJECTS}?status=${status}`);
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch projects by status:', error);
      throw error;
    }
  }

  /**
   * Get a single project by ID
   */
  async getProject(id: string): Promise<Project> {
    try {
      const response = await apiService.get<Project>(`${API_CONFIG.ENDPOINTS.PROJECTS}${id}/`);
      return response;
    } catch (error) {
      console.error('Failed to fetch project:', error);
      throw error;
    }
  }

  /**
   * Create a new project
   */
  async createProject(data: CreateProjectData): Promise<Project> {
    try {
      const response = await apiService.post(API_CONFIG.ENDPOINTS.PROJECTS, {
        ...data,
        status: data.status || 'active',
        progress: 0,
      });
      return response as Project;
    } catch (error) {
      console.error('Failed to create project:', error);
      throw error;
    }
  }

  /**
   * Update an existing project
   */
  async updateProject(id: string, data: UpdateProjectData): Promise<Project> {
    try {
      const response = await apiService.patch(`${API_CONFIG.ENDPOINTS.PROJECTS}${id}/`, data);
      return response as Project;
    } catch (error) {
      console.error('Failed to update project:', error);
      throw error;
    }
  }

  /**
   * Delete a project
   */
  async deleteProject(id: string): Promise<void> {
    try {
      await apiService.delete(`${API_CONFIG.ENDPOINTS.PROJECTS}${id}/`);
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  }

  // ==================== STATUS MANAGEMENT ====================

  /**
   * Update project status
   */
  async updateStatus(id: string, status: string): Promise<Project> {
    return this.updateProject(id, { status });
  }

  /**
   * Update project progress
   */
  async updateProgress(id: string, progress: number): Promise<Project> {
    return this.updateProject(id, { progress: Math.min(100, Math.max(0, progress)) });
  }

  /**
   * Complete a project
   */
  async completeProject(id: string): Promise<Project> {
    return this.updateProject(id, { status: 'completed', progress: 100 });
  }

  /**
   * Put project on hold
   */
  async holdProject(id: string): Promise<Project> {
    return this.updateProject(id, { status: 'on_hold' });
  }

  /**
   * Reactivate a project
   */
  async reactivateProject(id: string): Promise<Project> {
    return this.updateProject(id, { status: 'active' });
  }

  // ==================== TEAM MANAGEMENT ====================

  /**
   * Get project team members
   */
  async getProjectTeam(projectId: string): Promise<any[]> {
    try {
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.PROJECTS}${projectId}/team/`) as any;
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch project team:', error);
      return [];
    }
  }

  /**
   * Add team member to project
   */
  async addTeamMember(projectId: string, userId: string, role?: string): Promise<void> {
    try {
      await apiService.post(`${API_CONFIG.ENDPOINTS.PROJECTS}${projectId}/team/add/`, { user_id: userId, role });
    } catch (error) {
      console.error('Failed to add team member:', error);
      throw error;
    }
  }

  /**
   * Remove team member from project
   */
  async removeTeamMember(projectId: string, teamMemberId: string): Promise<void> {
    try {
      await apiService.delete(`${API_CONFIG.ENDPOINTS.PROJECTS}${projectId}/team/remove/${teamMemberId}/`);
    } catch (error) {
      console.error('Failed to remove team member:', error);
      throw error;
    }
  }

  // ==================== ANALYTICS ====================

  /**
   * Get project statistics
   */
  async getProjectStats(id: string): Promise<{
    total_hours: number;
    approved_hours: number;
    pending_hours: number;
    budget_used: number;
    budget_remaining: number;
    tasks_completed: number;
    tasks_total: number;
    risks_open: number;
  }> {
    try {
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.PROJECTS}${id}/stats/`);
      return response as any;
    } catch (error) {
      console.error('Failed to fetch project stats:', error);
      // Return empty stats if endpoint fails
      return {
        total_hours: 0,
        approved_hours: 0,
        pending_hours: 0,
        budget_used: 0,
        budget_remaining: 0,
        tasks_completed: 0,
        tasks_total: 0,
        risks_open: 0,
      };
    }
  }

  /**
   * Get project dashboard data
   */
  async getProjectDashboard(id: string): Promise<{
    project: Project;
    recentActivity: any[];
    upcomingTasks: any[];
    teamMembers: any[];
    risks: any[];
  }> {
    try {
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.PROJECTS}${id}/dashboard/`);
      return response as any;
    } catch (error) {
      // Build dashboard data from project only
      const project = await this.getProject(id);
      return {
        project,
        recentActivity: [],
        upcomingTasks: [],
        teamMembers: [],
        risks: [],
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
      case 'planning': return '#8B5CF6';
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
      case 'planning': return 'Planning';
      default: return status || 'Onbekend';
    }
  }

  /**
   * Get methodology label
   */
  getMethodologyLabel(methodology: string): string {
    switch (methodology?.toLowerCase()) {
      case 'prince2': return 'PRINCE2';
      case 'agile': return 'Agile';
      case 'scrum': return 'Scrum';
      case 'waterfall': return 'Waterfall';
      case 'hybrid': return 'Hybrid';
      case 'kanban': return 'Kanban';
      default: return methodology || 'Geen';
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

  /**
   * Calculate days until deadline
   */
  getDaysUntilDeadline(endDate: string): number {
    const end = new Date(endDate);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  }

  /**
   * Check if project is overdue
   */
  isOverdue(project: Project): boolean {
    if (!project.end_date || project.status === 'completed') return false;
    return this.getDaysUntilDeadline(project.end_date) < 0;
  }
}

export const projectsService = new ProjectsService();