import { apiService } from './apiService';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'todo' | 'in_progress' | 'review' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignee?: string;
  assignee_name?: string;
  project?: string;
  project_name?: string;
  due_date?: string;
  created_at: string;
  updated_at: string;
}

class TasksService {
  async getTasks(): Promise<Task[]> {
    try {
      const response = await apiService.get<any>('/api/v1/projects/tasks/');
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
      return [];
    }
  }

  async getTaskById(id: string): Promise<Task | null> {
    try {
      return await apiService.get(`/api/v1/projects/tasks/${id}/`);
    } catch (error) {
      console.error('Failed to fetch task:', error);
      return null;
    }
  }

  async createTask(data: Partial<Task>): Promise<Task | null> {
    try {
      return await apiService.post('/api/v1/projects/tasks/', data);
    } catch (error) {
      console.error('Failed to create task:', error);
      return null;
    }
  }

  async updateTask(id: string, data: Partial<Task>): Promise<Task | null> {
    try {
      return await apiService.patch(`/api/v1/projects/tasks/${id}/`, data);
    } catch (error) {
      console.error('Failed to update task:', error);
      return null;
    }
  }
}

export const tasksService = new TasksService();
