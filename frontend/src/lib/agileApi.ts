/**
 * Agile API Client
 * Frontend service for communicating with the Agile backend endpoints
 */

import axios from 'axios';

const API_BASE = '/api';

// ============================================
// TYPES
// ============================================

export interface AgileTeamMember {
  id: number;
  user: number;
  user_name: string;
  user_email: string;
  role: string;
  role_display: string;
  capacity_hours: number;
  skills: string[];
  joined_at: string;
}

export interface AgileProductVision {
  id: number;
  vision_statement: string;
  target_audience: string;
  problem_statement: string;
  unique_value_proposition: string;
  success_criteria: string[];
  goals: AgileProductGoal[];
  created_at: string;
  updated_at: string;
}

export interface AgileProductGoal {
  id: number;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'planned' | 'in_progress' | 'achieved' | 'deferred';
  target_date: string | null;
  order: number;
}

export interface AgileUserPersona {
  id: number;
  name: string;
  role: string;
  age_range: string;
  background: string;
  goals: string[];
  pain_points: string[];
  quote: string;
  avatar_color: string;
  created_at: string;
}

export interface AgileEpic {
  id: number;
  title: string;
  description: string;
  priority: 'must_have' | 'should_have' | 'could_have' | 'wont_have';
  color: string;
  order: number;
  total_points: number;
  completed_points: number;
  story_count: number;
  created_at: string;
}

export interface AgileBacklogItem {
  id: number;
  epic: number | null;
  epic_title: string | null;
  title: string;
  description: string;
  acceptance_criteria: string;
  item_type: 'story' | 'task' | 'bug' | 'spike';
  type_display: string;
  priority: 'must_have' | 'should_have' | 'could_have' | 'wont_have';
  priority_display: string;
  status: 'backlog' | 'ready' | 'in_progress' | 'review' | 'done';
  status_display: string;
  story_points: number | null;
  assignee: number | null;
  assignee_name: string | null;
  iteration: number | null;
  iteration_name: string | null;
  order: number;
  created_at: string;
  updated_at: string;
}

export interface AgileIteration {
  id: number;
  name: string;
  goal: string;
  start_date: string;
  end_date: string;
  status: 'planning' | 'active' | 'completed';
  velocity_committed: number;
  velocity_completed: number;
  total_points: number;
  completed_points: number;
  days_remaining: number;
  item_count: number;
  progress: number;
  created_at: string;
  items?: AgileBacklogItem[];
}

export interface AgileRelease {
  id: number;
  name: string;
  version: string;
  description: string;
  target_date: string;
  status: 'planning' | 'in_progress' | 'completed' | 'cancelled';
  features: string[];
  progress: number;
  iteration_count: number;
  created_at: string;
}

export interface AgileDailyUpdate {
  id: number;
  user: number;
  user_name: string;
  user_email: string;
  date: string;
  yesterday: string;
  today: string;
  blockers: string;
  created_at: string;
}

export interface AgileRetroItem {
  id: number;
  category: 'went_well' | 'to_improve' | 'action_item';
  category_display: string;
  content: string;
  votes: number;
  assignee: number | null;
  assignee_name: string | null;
  status: 'open' | 'in_progress' | 'done';
  created_by: number | null;
  created_by_name: string | null;
}

export interface AgileRetrospective {
  id: number;
  iteration: number;
  iteration_name: string;
  date: string;
  facilitator: number | null;
  facilitator_name: string | null;
  notes: string;
  items: AgileRetroItem[];
  created_at: string;
}

export interface AgileBudgetItem {
  id: number;
  iteration: number | null;
  iteration_name: string | null;
  category: string;
  category_display: string;
  description: string;
  planned_amount: number;
  actual_amount: number;
  variance: number;
  date: string | null;
}

export interface AgileBudget {
  id: number;
  total_budget: number;
  currency: string;
  total_spent: number;
  remaining: number;
  utilization_percentage: number;
  items: AgileBudgetItem[];
  created_at: string;
  updated_at: string;
}

export interface AgileDashboard {
  has_initialized: boolean;
  current_iteration: AgileIteration | null;
  total_backlog_items: number;
  total_story_points: number;
  completed_story_points: number;
  team_size: number;
  average_velocity: number | null;
  velocity_history: { iteration: string; committed: number; completed: number }[];
  upcoming_releases: AgileRelease[];
  recent_activity: { type: string; item: string; status: string; date: string }[];
}

// ============================================
// API CLIENT
// ============================================

export const agileApi = {
  // Dashboard
  dashboard: {
    get: async (projectId: string): Promise<AgileDashboard> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/dashboard/`);
      return response.data;
    },
    initialize: async (projectId: string): Promise<void> => {
      await axios.post(`${API_BASE}/projects/${projectId}/agile/initialize/`);
    },
  },

  // Team
  team: {
    getAll: async (projectId: string): Promise<AgileTeamMember[]> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/team/`);
      return response.data;
    },
    get: async (projectId: string, memberId: number): Promise<AgileTeamMember> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/team/${memberId}/`);
      return response.data;
    },
    create: async (projectId: string, data: { user_email: string; role: string; capacity_hours?: number; skills?: string[] }): Promise<AgileTeamMember> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/agile/team/`, data);
      return response.data;
    },
    update: async (projectId: string, memberId: number, data: Partial<AgileTeamMember>): Promise<AgileTeamMember> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/agile/team/${memberId}/`, data);
      return response.data;
    },
    delete: async (projectId: string, memberId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/agile/team/${memberId}/`);
    },
  },

  // Vision
  vision: {
    get: async (projectId: string): Promise<AgileProductVision> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/vision/`);
      return response.data;
    },
    update: async (projectId: string, data: Partial<AgileProductVision>): Promise<AgileProductVision> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/agile/vision/`, data);
      return response.data;
    },
  },

  // Goals
  goals: {
    getAll: async (projectId: string): Promise<AgileProductGoal[]> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/goals/`);
      return response.data;
    },
    create: async (projectId: string, data: Partial<AgileProductGoal>): Promise<AgileProductGoal> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/agile/goals/`, data);
      return response.data;
    },
    update: async (projectId: string, goalId: number, data: Partial<AgileProductGoal>): Promise<AgileProductGoal> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/agile/goals/${goalId}/`, data);
      return response.data;
    },
    delete: async (projectId: string, goalId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/agile/goals/${goalId}/`);
    },
  },

  // Personas
  personas: {
    getAll: async (projectId: string): Promise<AgileUserPersona[]> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/personas/`);
      return response.data;
    },
    get: async (projectId: string, personaId: number): Promise<AgileUserPersona> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/personas/${personaId}/`);
      return response.data;
    },
    create: async (projectId: string, data: Partial<AgileUserPersona>): Promise<AgileUserPersona> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/agile/personas/`, data);
      return response.data;
    },
    update: async (projectId: string, personaId: number, data: Partial<AgileUserPersona>): Promise<AgileUserPersona> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/agile/personas/${personaId}/`, data);
      return response.data;
    },
    delete: async (projectId: string, personaId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/agile/personas/${personaId}/`);
    },
  },

  // Epics
  epics: {
    getAll: async (projectId: string): Promise<AgileEpic[]> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/epics/`);
      return response.data;
    },
    get: async (projectId: string, epicId: number): Promise<AgileEpic> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/epics/${epicId}/`);
      return response.data;
    },
    create: async (projectId: string, data: Partial<AgileEpic>): Promise<AgileEpic> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/agile/epics/`, data);
      return response.data;
    },
    update: async (projectId: string, epicId: number, data: Partial<AgileEpic>): Promise<AgileEpic> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/agile/epics/${epicId}/`, data);
      return response.data;
    },
    delete: async (projectId: string, epicId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/agile/epics/${epicId}/`);
    },
    reorder: async (projectId: string, order: number[]): Promise<void> => {
      await axios.post(`${API_BASE}/projects/${projectId}/agile/epics/reorder/`, { order });
    },
  },

  // Backlog
  backlog: {
    getAll: async (projectId: string, filters?: { epic?: number; iteration?: number; status?: string; priority?: string }): Promise<AgileBacklogItem[]> => {
      const params = new URLSearchParams();
      if (filters?.epic) params.append('epic', filters.epic.toString());
      if (filters?.iteration) params.append('iteration', filters.iteration.toString());
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/backlog/?${params}`);
      return response.data;
    },
    get: async (projectId: string, itemId: number): Promise<AgileBacklogItem> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/backlog/${itemId}/`);
      return response.data;
    },
    create: async (projectId: string, data: Partial<AgileBacklogItem>): Promise<AgileBacklogItem> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/agile/backlog/`, data);
      return response.data;
    },
    update: async (projectId: string, itemId: number, data: Partial<AgileBacklogItem>): Promise<AgileBacklogItem> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/agile/backlog/${itemId}/`, data);
      return response.data;
    },
    delete: async (projectId: string, itemId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/agile/backlog/${itemId}/`);
    },
    moveToIteration: async (projectId: string, itemId: number, iterationId: number | null): Promise<AgileBacklogItem> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/agile/backlog/${itemId}/move-to-iteration/`, { iteration_id: iterationId });
      return response.data;
    },
    reorder: async (projectId: string, order: number[]): Promise<void> => {
      await axios.post(`${API_BASE}/projects/${projectId}/agile/backlog/reorder/`, { order });
    },
  },

  // Iterations
  iterations: {
    getAll: async (projectId: string): Promise<AgileIteration[]> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/iterations/`);
      return response.data;
    },
    get: async (projectId: string, iterationId: number): Promise<AgileIteration> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/iterations/${iterationId}/`);
      return response.data;
    },
    getActive: async (projectId: string): Promise<AgileIteration | null> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/iterations/active/`);
      return response.data;
    },
    create: async (projectId: string, data: Partial<AgileIteration>): Promise<AgileIteration> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/agile/iterations/`, data);
      return response.data;
    },
    update: async (projectId: string, iterationId: number, data: Partial<AgileIteration>): Promise<AgileIteration> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/agile/iterations/${iterationId}/`, data);
      return response.data;
    },
    delete: async (projectId: string, iterationId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/agile/iterations/${iterationId}/`);
    },
    start: async (projectId: string, iterationId: number): Promise<AgileIteration> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/agile/iterations/${iterationId}/start/`);
      return response.data;
    },
    complete: async (projectId: string, iterationId: number): Promise<AgileIteration> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/agile/iterations/${iterationId}/complete/`);
      return response.data;
    },
  },

  // Releases
  releases: {
    getAll: async (projectId: string): Promise<AgileRelease[]> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/releases/`);
      return response.data;
    },
    get: async (projectId: string, releaseId: number): Promise<AgileRelease> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/releases/${releaseId}/`);
      return response.data;
    },
    create: async (projectId: string, data: Partial<AgileRelease>): Promise<AgileRelease> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/agile/releases/`, data);
      return response.data;
    },
    update: async (projectId: string, releaseId: number, data: Partial<AgileRelease>): Promise<AgileRelease> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/agile/releases/${releaseId}/`, data);
      return response.data;
    },
    delete: async (projectId: string, releaseId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/agile/releases/${releaseId}/`);
    },
    addIteration: async (projectId: string, releaseId: number, iterationId: number): Promise<AgileRelease> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/agile/releases/${releaseId}/add-iteration/`, { iteration_id: iterationId });
      return response.data;
    },
  },

  // Daily Updates
  dailyUpdates: {
    getAll: async (projectId: string, filters?: { date?: string; iteration?: number }): Promise<AgileDailyUpdate[]> => {
      const params = new URLSearchParams();
      if (filters?.date) params.append('date', filters.date);
      if (filters?.iteration) params.append('iteration', filters.iteration.toString());
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/daily-updates/?${params}`);
      return response.data;
    },
    create: async (projectId: string, data: { iteration_id?: number; date?: string; yesterday: string; today: string; blockers?: string }): Promise<AgileDailyUpdate> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/agile/daily-updates/`, data);
      return response.data;
    },
    update: async (projectId: string, updateId: number, data: Partial<AgileDailyUpdate>): Promise<AgileDailyUpdate> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/agile/daily-updates/${updateId}/`, data);
      return response.data;
    },
    delete: async (projectId: string, updateId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/agile/daily-updates/${updateId}/`);
    },
  },

  // Retrospectives
  retrospectives: {
    getAll: async (projectId: string): Promise<AgileRetrospective[]> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/retrospectives/`);
      return response.data;
    },
    get: async (projectId: string, retroId: number): Promise<AgileRetrospective> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/retrospectives/${retroId}/`);
      return response.data;
    },
    create: async (projectId: string, data: { iteration: number; date: string; facilitator?: number; notes?: string }): Promise<AgileRetrospective> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/agile/retrospectives/`, data);
      return response.data;
    },
    addItem: async (projectId: string, retroId: number, data: { category: string; content: string }): Promise<AgileRetroItem> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/agile/retrospectives/${retroId}/add-item/`, data);
      return response.data;
    },
  },

  // Retro Items
  retroItems: {
    update: async (itemId: number, data: Partial<AgileRetroItem>): Promise<AgileRetroItem> => {
      const response = await axios.patch(`${API_BASE}/agile/retro-items/${itemId}/`, data);
      return response.data;
    },
    delete: async (itemId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/agile/retro-items/${itemId}/`);
    },
    vote: async (itemId: number): Promise<AgileRetroItem> => {
      const response = await axios.post(`${API_BASE}/agile/retro-items/${itemId}/vote/`);
      return response.data;
    },
  },

  // Budget
  budget: {
    get: async (projectId: string): Promise<AgileBudget> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/budget/`);
      return response.data;
    },
    update: async (projectId: string, data: Partial<AgileBudget>): Promise<AgileBudget> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/agile/budget/`, data);
      return response.data;
    },
    getItems: async (projectId: string): Promise<AgileBudgetItem[]> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/agile/budget/items/`);
      return response.data;
    },
    createItem: async (projectId: string, data: Partial<AgileBudgetItem>): Promise<AgileBudgetItem> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/agile/budget/items/`, data);
      return response.data;
    },
    updateItem: async (projectId: string, itemId: number, data: Partial<AgileBudgetItem>): Promise<AgileBudgetItem> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/agile/budget/items/${itemId}/`, data);
      return response.data;
    },
    deleteItem: async (projectId: string, itemId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/agile/budget/items/${itemId}/`);
    },
  },
};

export default agileApi;
