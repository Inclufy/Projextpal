import { apiService } from './apiService';
import { projectsService } from './projectsService';
import { tasksService } from './tasksService';

export interface AnalyticsData {
  total_projects: number;
  completed_projects: number;
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  budget_total: number;
  budget_spent: number;
  hours_logged: number;
}

class AnalyticsService {
  async getAnalytics(): Promise<AnalyticsData> {
    try {
      const response = await apiService.get<AnalyticsData>('/api/v1/analytics/');
      return response;
    } catch {
      // Fallback: aggregate from existing services
      try {
        const [projects, tasks] = await Promise.all([
          projectsService.getProjects().catch(() => []),
          tasksService.getTasks().catch(() => []),
        ]);

        return {
          total_projects: projects.length,
          completed_projects: projects.filter((p: any) => p.status === 'completed').length,
          total_tasks: tasks.length,
          completed_tasks: tasks.filter((t: any) => t.status === 'done').length,
          overdue_tasks: tasks.filter((t: any) => t.due_date && new Date(t.due_date) < new Date() && t.status !== 'done').length,
          budget_total: 0,
          budget_spent: 0,
          hours_logged: 0,
        };
      } catch {
        return { total_projects: 0, completed_projects: 0, total_tasks: 0, completed_tasks: 0, overdue_tasks: 0, budget_total: 0, budget_spent: 0, hours_logged: 0 };
      }
    }
  }
}

export const analyticsService = new AnalyticsService();
