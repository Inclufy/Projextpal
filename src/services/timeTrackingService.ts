import { apiService } from './apiService';
import { API_CONFIG } from '../constants/config';

export interface TimeEntry {
  id: string;
  project_id: string;
  program_id?: string;
  user_id: string;
  user_name?: string;
  user?: string;
  hours: number;
  description: string;
  date: string;
  status: 'draft' | 'submitted' | 'approved' | 'rejected' | 'pending';
  rejection_reason?: string;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTimeEntryData {
  project?: string;
  project_id?: string;  // Deprecated, use 'project'
  program_id?: string;
  hours: number;
  description: string;
  date: string;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'pending';
}

export interface UpdateTimeEntryData {
  hours?: number;
  description?: string;
  date?: string;
  status?: 'draft' | 'submitted' | 'approved' | 'rejected' | 'pending';
  rejection_reason?: string;
}

export interface TimeEntrySummary {
  total_hours: number;
  approved_hours: number;
  pending_hours: number;
  rejected_hours: number;
  entries_count: number;
}

class TimeTrackingService {
  // ==================== TIME ENTRIES CRUD ====================
  
  /**
   * Get all time entries for the current user
   */
  async getTimeEntries(): Promise<TimeEntry[]> {
    try {
      const response = await apiService.get(API_CONFIG.ENDPOINTS.TIME_ENTRIES) as any;
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch time entries:', error);
      throw error;
    }
  }

  /**
   * Get time entries for a specific project
   */
  async getTimeEntriesByProject(projectId: string): Promise<TimeEntry[]> {
    try {
      // Backend expects 'project' as query param name
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.TIME_ENTRIES}?project=${projectId}`) as any;
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch project time entries:', error);
      throw error;
    }
  }

  /**
   * Get time entries for a specific program
   */
  async getTimeEntriesByProgram(programId: string): Promise<TimeEntry[]> {
    try {
      // Backend expects 'program' as query param name
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.TIME_ENTRIES}?program=${programId}`) as any;
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch program time entries:', error);
      throw error;
    }
  }

  /**
   * Get a single time entry by ID
   */
  async getTimeEntry(id: string): Promise<TimeEntry> {
    try {
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.TIME_ENTRIES}${id}/`);
      return response as TimeEntry;
    } catch (error) {
      console.error('Failed to fetch time entry:', error);
      throw error;
    }
  }

  /**
   * Create a new time entry
   */
  async createTimeEntry(data: CreateTimeEntryData): Promise<TimeEntry> {
    try {
      // Normalize data: backend expects 'project', not 'project_id'
      const payload = {
        ...data,
        project: data.project || data.project_id,
        status: data.status || 'draft',  // ✅ CHANGED from 'pending' to 'draft'
      };
      
      // Remove project_id if it exists (backend doesn't expect it)
      if ('project_id' in payload) {
        delete (payload as any).project_id;
      }
      
      console.log('Creating time entry with payload:', JSON.stringify(payload));
      
      const response = await apiService.post(API_CONFIG.ENDPOINTS.TIME_ENTRIES, payload);

      console.log('Time entry created successfully:', response);
      return response as TimeEntry;
    } catch (error: any) {
      console.error('Failed to create time entry:', error);
      console.error('Error message:', error?.message);
      console.error('Error status:', error?.status);
      console.error('Error details:', error?.errors);
      throw error;
    }
  }

  /**
   * Update an existing time entry
   */
  async updateTimeEntry(id: string, data: UpdateTimeEntryData): Promise<TimeEntry> {
    try {
      const response = await apiService.patch(`${API_CONFIG.ENDPOINTS.TIME_ENTRIES}${id}/`, data);
      return response as TimeEntry;
    } catch (error) {
      console.error('Failed to update time entry:', error);
      throw error;
    }
  }

  /**
   * Delete a time entry
   */
  async deleteTimeEntry(id: string): Promise<void> {
    try {
      await apiService.delete(`${API_CONFIG.ENDPOINTS.TIME_ENTRIES}${id}/`);
    } catch (error) {
      console.error('Failed to delete time entry:', error);
      throw error;
    }
  }

  // ==================== APPROVAL WORKFLOW ====================

  /**
   * Submit a time entry for approval
   */
  async submitTimeEntry(id: string): Promise<TimeEntry> {
    try {
      const response = await apiService.post(`${API_CONFIG.ENDPOINTS.TIME_ENTRIES}${id}/submit/`);
      return response as TimeEntry;
    } catch (error) {
      // Fallback to PATCH if dedicated endpoint doesn't exist
      console.warn('Submit endpoint not found, using PATCH fallback');
      return this.updateTimeEntry(id, { status: 'submitted' });
    }
  }

  /**
   * Approve a time entry (manager only)
   */
  async approveTimeEntry(id: string): Promise<TimeEntry> {
    try {
      const response = await apiService.post(`${API_CONFIG.ENDPOINTS.TIME_ENTRIES}${id}/approve/`);
      return response as TimeEntry;
    } catch (error) {
      // Fallback to PATCH if dedicated endpoint doesn't exist
      console.warn('Approve endpoint not found, using PATCH fallback');
      return this.updateTimeEntry(id, { status: 'approved' });
    }
  }

  /**
   * Reject a time entry with reason (manager only)
   */
  async rejectTimeEntry(id: string, reason: string): Promise<TimeEntry> {
    try {
      const response = await apiService.post(`${API_CONFIG.ENDPOINTS.TIME_ENTRIES}${id}/reject/`, { reason });
      return response as TimeEntry;
    } catch (error) {
      // Fallback to PATCH if dedicated endpoint doesn't exist
      console.warn('Reject endpoint not found, using PATCH fallback');
      return this.updateTimeEntry(id, { status: 'rejected', rejection_reason: reason });
    }
  }

  /**
   * Get pending time entries for approval (manager only)
   */
  async getPendingApprovals(projectId?: string): Promise<TimeEntry[]> {
    try {
      // ✅ CHANGED: Use 'submitted' status for entries awaiting approval
      let url = `${API_CONFIG.ENDPOINTS.TIME_ENTRIES}?status=submitted`;
      if (projectId) {
        url += `&project=${projectId}`;  // ✅ CHANGED from project_id to project
      }
      const response = await apiService.get(url) as any;
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch pending approvals:', error);
      throw error;
    }
  }

  /**
   * Bulk approve multiple time entries
   */
  async bulkApprove(ids: string[]): Promise<void> {
    try {
      await apiService.post(`${API_CONFIG.ENDPOINTS.TIME_ENTRIES}bulk-approve/`, { ids });
    } catch (error) {
      // Fallback to individual approvals if bulk endpoint doesn't exist
      console.warn('Bulk approve not available, approving individually');
      await Promise.all(ids.map(id => this.approveTimeEntry(id)));
    }
  }

  /**
   * Bulk reject multiple time entries
   */
  async bulkReject(ids: string[], reason: string): Promise<void> {
    try {
      await apiService.post(`${API_CONFIG.ENDPOINTS.TIME_ENTRIES}bulk-reject/`, { ids, reason });
    } catch (error) {
      // Fallback to individual rejections if bulk endpoint doesn't exist
      console.warn('Bulk reject not available, rejecting individually');
      await Promise.all(ids.map(id => this.rejectTimeEntry(id, reason)));
    }
  }

  // ==================== REPORTS & SUMMARIES ====================

  /**
   * Get time entry summary for a project
   */
  async getProjectSummary(projectId: string): Promise<TimeEntrySummary> {
    try {
      // Backend expects 'project' as query param name
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.TIME_ENTRIES}summary/?project=${projectId}`);
      return response as TimeEntrySummary;
    } catch (error) {
      // Calculate locally if endpoint doesn't exist
      console.warn('Summary endpoint not found, calculating locally');
      const entries = await this.getTimeEntriesByProject(projectId);
      return this.calculateSummary(entries);
    }
  }

  /**
   * Get time entries for a date range
   */
  async getTimeEntriesByDateRange(startDate: string, endDate: string): Promise<TimeEntry[]> {
    try {
      const response = await apiService.get(`${API_CONFIG.ENDPOINTS.TIME_ENTRIES}?start_date=${startDate}&end_date=${endDate}`) as any;
      return response.results || response || [];
    } catch (error: any) {
      console.error('Failed to fetch time entries by date range:', error);
      
      // If 404, it might just mean no entries exist - return empty array
      if (error?.response?.status === 404 || error?.status === 404) {
        console.log('No time entries found for date range, returning empty array');
        return [];
      }
      
      throw error;
    }
  }

  /**
   * Get user's time entries for current week
   */
  async getCurrentWeekEntries(): Promise<TimeEntry[]> {
    const now = new Date();
    const dayOfWeek = now.getDay();
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1)); // Monday
    startOfWeek.setHours(0, 0, 0, 0);
    
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6); // Sunday
    endOfWeek.setHours(23, 59, 59, 999);

    try {
      return await this.getTimeEntriesByDateRange(
        startOfWeek.toISOString().split('T')[0],
        endOfWeek.toISOString().split('T')[0]
      );
    } catch (error) {
      console.error('Failed to fetch current week entries:', error);
      // Return empty array if no entries found
      return [];
    }
  }

  // ==================== HELPER METHODS ====================

  /**
   * Calculate summary from entries locally
   */
  private calculateSummary(entries: TimeEntry[]): TimeEntrySummary {
    return {
      total_hours: entries.reduce((sum, e) => sum + (e.hours || 0), 0),
      approved_hours: entries.filter(e => e.status === 'approved').reduce((sum, e) => sum + (e.hours || 0), 0),
      // ✅ CHANGED: Count both 'draft' and 'submitted' as "pending" for UI purposes
      pending_hours: entries.filter(e => e.status === 'draft' || e.status === 'submitted').reduce((sum, e) => sum + (e.hours || 0), 0),
      rejected_hours: entries.filter(e => e.status === 'rejected').reduce((sum, e) => sum + (e.hours || 0), 0),
      entries_count: entries.length,
    };
  }

  /**
   * Get display-friendly status text
   */
  getDisplayStatus(status: string): string {
    switch(status) {
      case 'draft':
        return 'Draft';
      case 'submitted':
        return 'Pending Approval';
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      default:
        return status;
    }
  }

  /**
   * Get status color for UI
   */
  getStatusColor(status: string): string {
    switch(status) {
      case 'draft':
        return '#6B7280'; // Gray
      case 'submitted':
        return '#F59E0B'; // Amber/Yellow
      case 'approved':
        return '#10B981'; // Green
      case 'rejected':
        return '#EF4444'; // Red
      default:
        return '#6B7280';
    }
  }

  /**
   * Format hours for display (e.g., 8.5 -> "8u 30m")
   */
  formatHours(hours: number): string {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    if (m === 0) return `${h}u`;
    return `${h}u ${m}m`;
  }

  /**
   * Parse hours string to number (e.g., "8:30" -> 8.5)
   */
  parseHours(hoursString: string): number {
    if (hoursString.includes(':')) {
      const [h, m] = hoursString.split(':').map(Number);
      return h + (m / 60);
    }
    return parseFloat(hoursString) || 0;
  }
}

export const timeTrackingService = new TimeTrackingService();