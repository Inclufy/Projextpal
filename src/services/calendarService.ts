import { apiService } from './apiService';

export interface CalendarEvent {
  id: string;
  title: string;
  date: string;
  type: 'milestone' | 'deadline' | 'meeting' | 'task';
  project?: string;
  project_name?: string;
  color?: string;
}

class CalendarService {
  async getEvents(month?: number, year?: number): Promise<CalendarEvent[]> {
    try {
      const params = month && year ? `?month=${month}&year=${year}` : '';
      const response = await apiService.get(`/api/v1/projects/milestones/${params}`);
      const milestones = response.results || response || [];
      return milestones.map((m: any) => ({
        id: m.id,
        title: m.name || m.title,
        date: m.due_date || m.date,
        type: 'milestone' as const,
        project: m.project,
        project_name: m.project_name,
        color: '#8B5CF6',
      }));
    } catch (error) {
      console.error('Failed to fetch calendar events:', error);
      return [];
    }
  }
}

export const calendarService = new CalendarService();
