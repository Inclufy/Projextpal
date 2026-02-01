/**
 * Scrum API Client for ProjectPal
 * Uses the existing api client for authentication
 */

import { api } from './api';

// ==================== TYPES ====================

export interface ProductBacklog {
  id: number;
  project: number;
  description?: string;
  vision?: string;
  items?: BacklogItem[];
  total_items?: number;
  total_story_points?: number;
  created_at: string;
  updated_at: string;
}

export interface BacklogItem {
  id: number;
  backlog: number;
  item_type: 'user_story' | 'bug' | 'task' | 'spike' | 'epic';
  title: string;
  description?: string;
  acceptance_criteria?: string;
  story_points?: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'new' | 'ready' | 'in_progress' | 'done' | 'removed';
  order: number;
  parent?: number;
  assignee?: number;
  assignee_name?: string;
  reporter?: number;
  reporter_name?: string;
  sprint?: number;
  sprint_name?: string;
  children_count?: number;
  created_at: string;
  updated_at: string;
}

export interface Sprint {
  id: number;
  project: number;
  name: string;
  number: number;
  goal?: string;
  start_date?: string;
  end_date?: string;
  status: 'planning' | 'active' | 'review' | 'completed' | 'cancelled';
  team_capacity?: number;
  went_well?: string;
  to_improve?: string;
  action_items?: string;
  total_story_points?: number;
  completed_story_points?: number;
  items_count?: number;
  progress_percentage?: number;
  items?: BacklogItem[];
  burndown_data?: SprintBurndown[];
  created_at: string;
  updated_at: string;
}

export interface SprintBurndown {
  id: number;
  sprint: number;
  date: string;
  remaining_points: number;
  completed_points: number;
  ideal_remaining?: number;
}

export interface DailyStandup {
  id: number;
  sprint: number;
  date: string;
  notes?: string;
  blockers?: string;
  updates?: StandupUpdate[];
  created_at: string;
}

export interface StandupUpdate {
  id: number;
  standup: number;
  user: number;
  user_name?: string;
  yesterday?: string;
  today?: string;
  blockers?: string;
}

export interface SprintReview {
  id: number;
  sprint: number;
  sprint_name?: string;
  date?: string;
  demo_notes?: string;
  stakeholder_feedback?: string;
  accepted_items?: string;
  rejected_items?: string;
  created_at: string;
}

export interface SprintRetrospective {
  id: number;
  sprint: number;
  sprint_name?: string;
  date?: string;
  went_well?: string;
  to_improve?: string;
  action_items?: string;
  team_morale?: number;
  created_at: string;
}

export interface Velocity {
  id: number;
  project: number;
  sprint: number;
  sprint_name?: string;
  sprint_number?: number;
  committed_points: number;
  completed_points: number;
  completion_rate?: number;
}

export interface DefinitionOfDone {
  id: number;
  project: number;
  item: string;
  order: number;
  is_active: boolean;
  created_at: string;
}

export interface ScrumTeamMember {
  id: number;
  project: number;
  user: number;
  user_name?: string;
  user_email?: string;
  role: 'product_owner' | 'scrum_master' | 'developer' | 'stakeholder';
  capacity_per_sprint?: number;
  created_at: string;
}

export interface ScrumDashboard {
  project_id: number;
  project_name?: string;
  active_sprint?: Sprint;
  sprint_progress: number;
  sprint_total: number;
  backlog_items_count: number;
  backlog_ready_count: number;
  total_story_points: number;
  average_velocity: number;
  recent_velocities: Velocity[];
  team_size: number;
  team: ScrumTeamMember[];
}

// ==================== API CLIENT ====================

export const scrumApi = {
  // Dashboard
  dashboard: {
    get: (projectId: string | number) => 
      api.get<ScrumDashboard>(`/projects/${projectId}/scrum/dashboard/`),
  },

  // Product Backlog
  backlog: {
    get: (projectId: string | number) => 
      api.get<ProductBacklog[]>(`/projects/${projectId}/scrum/backlog/`),
    initialize: (projectId: string | number) => 
      api.post<ProductBacklog>(`/projects/${projectId}/scrum/backlog/initialize/`),
  },

  // Backlog Items
  items: {
    getAll: (projectId: string | number, params?: { sprint?: number | string; status?: string; type?: string }) => 
      api.get<BacklogItem[]>(`/projects/${projectId}/scrum/items/`, params as any),
    getOne: (projectId: string | number, id: number) => 
      api.get<BacklogItem>(`/projects/${projectId}/scrum/items/${id}/`),
    create: (projectId: string | number, data: Partial<BacklogItem>) => 
      api.post<BacklogItem>(`/projects/${projectId}/scrum/items/`, data),
    update: (projectId: string | number, id: number, data: Partial<BacklogItem>) => 
      api.patch<BacklogItem>(`/projects/${projectId}/scrum/items/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/scrum/items/${id}/`),
    assignToSprint: (projectId: string | number, id: number, sprintId: number | null) => 
      api.post<BacklogItem>(`/projects/${projectId}/scrum/items/${id}/assign_to_sprint/`, { sprint_id: sprintId }),
    updateStatus: (projectId: string | number, id: number, status: string) => 
      api.post<BacklogItem>(`/projects/${projectId}/scrum/items/${id}/update_status/`, { status }),
    reorder: (projectId: string | number, items: { id: number; order: number }[]) => 
      api.post<void>(`/projects/${projectId}/scrum/items/reorder/`, { items }),
  },

  // Sprints
  sprints: {
    getAll: (projectId: string | number) => 
      api.get<Sprint[]>(`/projects/${projectId}/scrum/sprints/`),
    getOne: (projectId: string | number, id: number) => 
      api.get<Sprint>(`/projects/${projectId}/scrum/sprints/${id}/`),
    create: (projectId: string | number, data: Partial<Sprint>) => 
      api.post<Sprint>(`/projects/${projectId}/scrum/sprints/`, data),
    update: (projectId: string | number, id: number, data: Partial<Sprint>) => 
      api.patch<Sprint>(`/projects/${projectId}/scrum/sprints/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/scrum/sprints/${id}/`),
    start: (projectId: string | number, id: number) => 
      api.post<Sprint>(`/projects/${projectId}/scrum/sprints/${id}/start/`),
    complete: (projectId: string | number, id: number) => 
      api.post<Sprint>(`/projects/${projectId}/scrum/sprints/${id}/complete/`),
    recordBurndown: (projectId: string | number, id: number) => 
      api.post<SprintBurndown>(`/projects/${projectId}/scrum/sprints/${id}/record_burndown/`),
    getActive: (projectId: string | number) => 
      api.get<Sprint>(`/projects/${projectId}/scrum/sprints/active/`),
  },

  // Daily Standups
  standups: {
    getAll: (projectId: string | number) => 
      api.get<DailyStandup[]>(`/projects/${projectId}/scrum/standups/`),
    create: (projectId: string | number, data: Partial<DailyStandup>) => 
      api.post<DailyStandup>(`/projects/${projectId}/scrum/standups/`, data),
    addUpdate: (projectId: string | number, id: number, data: Partial<StandupUpdate>) => 
      api.post<StandupUpdate>(`/projects/${projectId}/scrum/standups/${id}/add_update/`, data),
  },

  // Sprint Reviews
  reviews: {
    getAll: (projectId: string | number) => 
      api.get<SprintReview[]>(`/projects/${projectId}/scrum/reviews/`),
    create: (projectId: string | number, data: Partial<SprintReview>) => 
      api.post<SprintReview>(`/projects/${projectId}/scrum/reviews/`, data),
    update: (projectId: string | number, id: number, data: Partial<SprintReview>) => 
      api.patch<SprintReview>(`/projects/${projectId}/scrum/reviews/${id}/`, data),
  },

  // Sprint Retrospectives
  retrospectives: {
    getAll: (projectId: string | number) => 
      api.get<SprintRetrospective[]>(`/projects/${projectId}/scrum/retrospectives/`),
    create: (projectId: string | number, data: Partial<SprintRetrospective>) => 
      api.post<SprintRetrospective>(`/projects/${projectId}/scrum/retrospectives/`, data),
    update: (projectId: string | number, id: number, data: Partial<SprintRetrospective>) => 
      api.patch<SprintRetrospective>(`/projects/${projectId}/scrum/retrospectives/${id}/`, data),
  },

  // Velocity
  velocity: {
    getAll: (projectId: string | number) => 
      api.get<Velocity[]>(`/projects/${projectId}/scrum/velocity/`),
    getAverage: (projectId: string | number) => 
      api.get<{ average_velocity: number; sprint_count: number }>(`/projects/${projectId}/scrum/velocity/average/`),
  },

  // Definition of Done
  dod: {
    getAll: (projectId: string | number) => 
      api.get<DefinitionOfDone[]>(`/projects/${projectId}/scrum/dod/`),
    create: (projectId: string | number, data: Partial<DefinitionOfDone>) => 
      api.post<DefinitionOfDone>(`/projects/${projectId}/scrum/dod/`, data),
    update: (projectId: string | number, id: number, data: Partial<DefinitionOfDone>) => 
      api.patch<DefinitionOfDone>(`/projects/${projectId}/scrum/dod/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/scrum/dod/${id}/`),
    initializeDefaults: (projectId: string | number) => 
      api.post<DefinitionOfDone[]>(`/projects/${projectId}/scrum/dod/initialize_defaults/`),
  },

  // Scrum Team
  team: {
    getAll: (projectId: string | number) => 
      api.get<ScrumTeamMember[]>(`/projects/${projectId}/scrum/team/`),
    create: (projectId: string | number, data: Partial<ScrumTeamMember>) => 
      api.post<ScrumTeamMember>(`/projects/${projectId}/scrum/team/`, data),
    update: (projectId: string | number, id: number, data: Partial<ScrumTeamMember>) => 
      api.patch<ScrumTeamMember>(`/projects/${projectId}/scrum/team/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/scrum/team/${id}/`),
  },
};

export default scrumApi;
