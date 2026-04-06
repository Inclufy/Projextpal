import { apiService } from './apiService';
import { API_CONFIG } from '../constants/config';

export interface TimeEntry {
  id: string;
  project: string;
  project_name?: string;
  task?: string;
  description: string;
  hours: number;
  date: string;
  billable: boolean;
  approved: boolean;
  user?: string;
  created_at?: string;
  updated_at?: string;
}

export interface TimeTrackingSummary {
  total_hours: number;
  billable_hours: number;
  approved_hours: number;
  entries_count: number;
  by_project: Array<{
    project_id: string;
    project_name: string;
    hours: number;
  }>;
}

export interface CreateTimeEntryData {
  project: string;
  task?: string;
  description: string;
  hours: number;
  date: string;
  billable?: boolean;
}

export interface UpdateTimeEntryData extends Partial<CreateTimeEntryData> {}

class TimeTrackingService {
  private endpoint = '/api/v1/time-entries/';

  // READ - Get all time entries
  async getTimeEntries(params?: { project?: string; date_from?: string; date_to?: string }): Promise<TimeEntry[]> {
    const queryParams = params ? `?${new URLSearchParams(params as any).toString()}` : '';
    const response = await apiService.get<TimeEntry[] | { results: TimeEntry[] }>(`${this.endpoint}${queryParams}`);
    return Array.isArray(response) ? response : response.results || [];
  }

  // READ - Get single time entry
  async getTimeEntry(id: string): Promise<TimeEntry> {
    const response = await apiService.get<TimeEntry>(`${this.endpoint}${id}/`);
    return response;
  }

  // READ - Get summary
  async getSummary(period?: 'today' | 'week' | 'month'): Promise<TimeTrackingSummary> {
    const entries = await this.getTimeEntries();
    
    const now = new Date();
    let filteredEntries = entries;
    
    if (period === 'today') {
      const today = now.toISOString().split('T')[0];
      filteredEntries = entries.filter(e => e.date === today);
    } else if (period === 'week') {
      const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      filteredEntries = entries.filter(e => new Date(e.date) >= weekAgo);
    } else if (period === 'month') {
      const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      filteredEntries = entries.filter(e => new Date(e.date) >= monthAgo);
    }

    const totalHours = filteredEntries.reduce((sum, e) => sum + e.hours, 0);
    const billableHours = filteredEntries.filter(e => e.billable).reduce((sum, e) => sum + e.hours, 0);
    const approvedHours = filteredEntries.filter(e => e.approved).reduce((sum, e) => sum + e.hours, 0);

    // Group by project
    const byProject = filteredEntries.reduce((acc, entry) => {
      const key = entry.project;
      if (!acc[key]) {
        acc[key] = { project_id: key, project_name: entry.project_name || key, hours: 0 };
      }
      acc[key].hours += entry.hours;
      return acc;
    }, {} as Record<string, { project_id: string; project_name: string; hours: number }>);

    return {
      total_hours: totalHours,
      billable_hours: billableHours,
      approved_hours: approvedHours,
      entries_count: filteredEntries.length,
      by_project: Object.values(byProject),
    };
  }

  // CREATE - Log time
  async createTimeEntry(data: CreateTimeEntryData): Promise<TimeEntry> {
    const response = await apiService.post<TimeEntry>(this.endpoint, data);
    return response;
  }

  // UPDATE - Update time entry
  async updateTimeEntry(id: string, data: UpdateTimeEntryData): Promise<TimeEntry> {
    const response = await apiService.put<TimeEntry>(`${this.endpoint}${id}/`, data);
    return response;
  }

  // DELETE - Delete time entry
  async deleteTimeEntry(id: string): Promise<void> {
    await apiService.delete(`${this.endpoint}${id}/`);
  }

  // Get entries by project
  async getEntriesByProject(projectId: string): Promise<TimeEntry[]> {
    return this.getTimeEntries({ project: projectId });
  }

  // Get today's entries
  async getTodayEntries(): Promise<TimeEntry[]> {
    const today = new Date().toISOString().split('T')[0];
    return this.getTimeEntries({ date_from: today, date_to: today });
  }
}

export const timeTrackingService = new TimeTrackingService();
