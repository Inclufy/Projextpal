/**
 * Kanban API Client for ProjectPal
 * Uses the existing api client for authentication
 */

import { api } from './api';

// ==================== TYPES ====================

export interface KanbanBoard {
  id: number;
  project: number;
  name: string;
  description?: string;
  columns_count?: number;
  cards_count?: number;
  columns?: KanbanColumn[];
  swimlanes?: KanbanSwimlane[];
  created_at: string;
  updated_at: string;
}

export interface KanbanColumn {
  id: number;
  board: number;
  name: string;
  column_type: 'backlog' | 'todo' | 'in_progress' | 'review' | 'done' | 'custom';
  order: number;
  wip_limit?: number;
  color: string;
  is_done_column: boolean;
  cards_count?: number;
  is_wip_exceeded?: boolean;
  cards?: KanbanCard[];
  created_at: string;
  updated_at: string;
}

export interface KanbanSwimlane {
  id: number;
  board: number;
  name: string;
  order: number;
  color: string;
  is_default: boolean;
  created_at: string;
}

export interface KanbanCard {
  id: number;
  board: number;
  column: number;
  column_name?: string;
  swimlane?: number;
  swimlane_name?: string;
  title: string;
  description?: string;
  card_type: 'feature' | 'bug' | 'task' | 'improvement' | 'other';
  priority: 'critical' | 'high' | 'medium' | 'low';
  order: number;
  assignee?: number;
  assignee_name?: string;
  reporter?: number;
  reporter_name?: string;
  due_date?: string;
  start_date?: string;
  completed_date?: string;
  tags?: string;
  estimated_hours?: number;
  actual_hours?: number;
  is_blocked: boolean;
  blocked_reason?: string;
  comments_count?: number;
  checklists_count?: number;
  comments?: CardComment[];
  checklists?: CardChecklist[];
  history?: CardHistory[];
  created_at: string;
  updated_at: string;
}

export interface CardComment {
  id: number;
  card: number;
  user: number;
  user_name?: string;
  content: string;
  created_at: string;
  updated_at: string;
}

export interface CardChecklist {
  id: number;
  card: number;
  title: string;
  order: number;
  items?: ChecklistItem[];
  progress?: number;
}

export interface ChecklistItem {
  id: number;
  checklist: number;
  text: string;
  is_completed: boolean;
  order: number;
}

export interface CardHistory {
  id: number;
  card: number;
  from_column?: number;
  from_column_name?: string;
  to_column?: number;
  to_column_name?: string;
  moved_by?: number;
  moved_by_name?: string;
  moved_at: string;
  time_in_column?: string;
}

export interface CumulativeFlowData {
  id: number;
  board: number;
  date: string;
  column: number;
  column_name?: string;
  card_count: number;
}

export interface KanbanMetrics {
  id: number;
  board: number;
  date: string;
  cards_completed: number;
  avg_lead_time_hours?: number;
  avg_cycle_time_hours?: number;
  total_wip: number;
  created_at: string;
}

export interface KanbanDashboard {
  project_id: number;
  project_name?: string;
  has_board: boolean;
  board?: KanbanBoard;
  total_cards: number;
  blocked_count: number;
  overdue_count: number;
  wip_violations: { column: string; count: number; limit: number }[];
  columns: KanbanColumn[];
  avg_lead_time?: number;
  avg_cycle_time?: number;
  cards_completed_today: number;
}

// ==================== API CLIENT ====================

export const kanbanApi = {
  // Dashboard
  dashboard: {
    get: (projectId: string | number) => 
      api.get<KanbanDashboard>(`/projects/${projectId}/kanban/dashboard/`),
  },

  // Board
  board: {
    get: (projectId: string | number) => 
      api.get<KanbanBoard[]>(`/projects/${projectId}/kanban/board/`),
    getOne: (projectId: string | number, id: number) => 
      api.get<KanbanBoard>(`/projects/${projectId}/kanban/board/${id}/`),
    create: (projectId: string | number, data: Partial<KanbanBoard>) => 
      api.post<KanbanBoard>(`/projects/${projectId}/kanban/board/`, data),
    update: (projectId: string | number, id: number, data: Partial<KanbanBoard>) => 
      api.patch<KanbanBoard>(`/projects/${projectId}/kanban/board/${id}/`, data),
    initialize: (projectId: string | number) => 
      api.post<KanbanBoard>(`/projects/${projectId}/kanban/board/initialize/`),
  },

  // Columns
  columns: {
    getAll: (projectId: string | number) => 
      api.get<KanbanColumn[]>(`/projects/${projectId}/kanban/columns/`),
    getOne: (projectId: string | number, id: number) => 
      api.get<KanbanColumn>(`/projects/${projectId}/kanban/columns/${id}/`),
    create: (projectId: string | number, data: Partial<KanbanColumn>) => 
      api.post<KanbanColumn>(`/projects/${projectId}/kanban/columns/`, data),
    update: (projectId: string | number, id: number, data: Partial<KanbanColumn>) => 
      api.patch<KanbanColumn>(`/projects/${projectId}/kanban/columns/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/kanban/columns/${id}/`),
    reorder: (projectId: string | number, columns: { id: number; order: number }[]) => 
      api.post<void>(`/projects/${projectId}/kanban/columns/reorder/`, { columns }),
  },

  // Swimlanes
  swimlanes: {
    getAll: (projectId: string | number) => 
      api.get<KanbanSwimlane[]>(`/projects/${projectId}/kanban/swimlanes/`),
    create: (projectId: string | number, data: Partial<KanbanSwimlane>) => 
      api.post<KanbanSwimlane>(`/projects/${projectId}/kanban/swimlanes/`, data),
    update: (projectId: string | number, id: number, data: Partial<KanbanSwimlane>) => 
      api.patch<KanbanSwimlane>(`/projects/${projectId}/kanban/swimlanes/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/kanban/swimlanes/${id}/`),
  },

  // Cards
  cards: {
    getAll: (projectId: string | number, params?: { column?: number; swimlane?: number; assignee?: number; priority?: string; is_blocked?: boolean }) => 
      api.get<KanbanCard[]>(`/projects/${projectId}/kanban/cards/`, params as any),
    getOne: (projectId: string | number, id: number) => 
      api.get<KanbanCard>(`/projects/${projectId}/kanban/cards/${id}/`),
    create: (projectId: string | number, data: Partial<KanbanCard>) => 
      api.post<KanbanCard>(`/projects/${projectId}/kanban/cards/`, data),
    update: (projectId: string | number, id: number, data: Partial<KanbanCard>) => 
      api.patch<KanbanCard>(`/projects/${projectId}/kanban/cards/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/kanban/cards/${id}/`),
    move: (projectId: string | number, id: number, data: { column_id?: number; swimlane_id?: number; order?: number }) => 
      api.post<KanbanCard>(`/projects/${projectId}/kanban/cards/${id}/move/`, data),
    toggleBlocked: (projectId: string | number, id: number, reason?: string) => 
      api.post<KanbanCard>(`/projects/${projectId}/kanban/cards/${id}/toggle_blocked/`, { reason }),
    addComment: (projectId: string | number, id: number, content: string) => 
      api.post<CardComment>(`/projects/${projectId}/kanban/cards/${id}/add_comment/`, { content }),
    addChecklist: (projectId: string | number, id: number, title: string) => 
      api.post<CardChecklist>(`/projects/${projectId}/kanban/cards/${id}/add_checklist/`, { title }),
    reorder: (projectId: string | number, cards: { id: number; order: number }[]) => 
      api.post<void>(`/projects/${projectId}/kanban/cards/reorder/`, { cards }),
  },

  // Comments
  comments: {
    getAll: (projectId: string | number) => 
      api.get<CardComment[]>(`/projects/${projectId}/kanban/comments/`),
    update: (projectId: string | number, id: number, data: Partial<CardComment>) => 
      api.patch<CardComment>(`/projects/${projectId}/kanban/comments/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/kanban/comments/${id}/`),
  },

  // Checklists
  checklists: {
    getAll: (projectId: string | number) => 
      api.get<CardChecklist[]>(`/projects/${projectId}/kanban/checklists/`),
    update: (projectId: string | number, id: number, data: Partial<CardChecklist>) => 
      api.patch<CardChecklist>(`/projects/${projectId}/kanban/checklists/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/kanban/checklists/${id}/`),
    addItem: (projectId: string | number, id: number, text: string) => 
      api.post<ChecklistItem>(`/projects/${projectId}/kanban/checklists/${id}/add_item/`, { text }),
    toggleItem: (projectId: string | number, id: number, itemId: number) => 
      api.post<ChecklistItem>(`/projects/${projectId}/kanban/checklists/${id}/toggle_item/`, { item_id: itemId }),
  },

  // Metrics
  metrics: {
    getAll: (projectId: string | number) => 
      api.get<KanbanMetrics[]>(`/projects/${projectId}/kanban/metrics/`),
    recordDaily: (projectId: string | number) => 
      api.post<KanbanMetrics>(`/projects/${projectId}/kanban/metrics/record_daily/`),
    getCFD: (projectId: string | number, days?: number) => 
      api.get<CumulativeFlowData[]>(`/projects/${projectId}/kanban/metrics/cfd/`, days ? { days } : undefined),
    getThroughput: (projectId: string | number, days?: number) => 
      api.get<KanbanMetrics[]>(`/projects/${projectId}/kanban/metrics/throughput/`, days ? { days } : undefined),
  },
};

export default kanbanApi;
