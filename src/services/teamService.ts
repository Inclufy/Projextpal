import { apiService } from './apiService';

export interface TeamMember {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  role: string;
  is_active: boolean;
  avatar?: string;
  joined_date?: string;
}

class TeamService {
  async getMembers(): Promise<TeamMember[]> {
    try {
      const response = await apiService.get<any>('/api/v1/teams/members/');
      return response.results || response || [];
    } catch (error) {
      console.error('Failed to fetch team members:', error);
      return [];
    }
  }

  async getMemberById(id: string): Promise<TeamMember | null> {
    try {
      return await apiService.get(`/api/v1/teams/members/${id}/`);
    } catch (error) {
      console.error('Failed to fetch member:', error);
      return null;
    }
  }
}

export const teamService = new TeamService();
