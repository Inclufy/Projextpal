/**
 * Waterfall API Client
 * Frontend service for communicating with the Waterfall backend endpoints
 */

import axios from 'axios';

const API_BASE = '/api';

// ============================================
// TYPES
// ============================================

export interface WaterfallPhase {
  id: number;
  phase_type: 'requirements' | 'design' | 'development' | 'testing' | 'deployment' | 'maintenance';
  phase_type_display: string;
  name: string;
  description: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'on_hold';
  status_display: string;
  start_date: string | null;
  end_date: string | null;
  actual_start_date: string | null;
  actual_end_date: string | null;
  progress: number;
  order: number;
  sign_off_required: boolean;
  signed_off_by: number | null;
  signed_off_by_name: string | null;
  signed_off_at: string | null;
  task_count: number;
}

export interface WaterfallTeamMember {
  id: number;
  user: number;
  user_name: string;
  user_email: string;
  role: string;
  role_display: string;
  phase: number | null;
  phase_name: string | null;
  allocation_percentage: number;
  start_date: string | null;
  end_date: string | null;
}

export interface WaterfallRequirement {
  id: number;
  requirement_id: string;
  title: string;
  description: string;
  requirement_type: 'functional' | 'non_functional' | 'business' | 'technical' | 'interface';
  type_display: string;
  priority: 'must_have' | 'should_have' | 'could_have' | 'wont_have';
  priority_display: string;
  status: 'draft' | 'review' | 'approved' | 'implemented' | 'deferred';
  status_display: string;
  source: string;
  acceptance_criteria: string;
  dependencies: number[];
  created_by: number | null;
  created_by_name: string | null;
  approved_by: number | null;
  approved_by_name: string | null;
  test_case_count: number;
  created_at: string;
  updated_at: string;
}

export interface WaterfallDesignDocument {
  id: number;
  title: string;
  document_type: 'architecture' | 'database' | 'ui_ux' | 'api' | 'security' | 'integration';
  type_display: string;
  version: string;
  description: string;
  content: string;
  status: 'draft' | 'review' | 'approved' | 'superseded';
  status_display: string;
  author: number | null;
  author_name: string | null;
  reviewer: number | null;
  reviewer_name: string | null;
  requirements: number[];
  requirement_ids: string[];
  created_at: string;
  updated_at: string;
}

export interface WaterfallTask {
  id: number;
  phase: number;
  phase_name: string;
  title: string;
  description: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  priority_display: string;
  status: 'todo' | 'in_progress' | 'blocked' | 'completed';
  status_display: string;
  assignee: number | null;
  assignee_name: string | null;
  estimated_hours: number | null;
  actual_hours: number | null;
  start_date: string | null;
  due_date: string | null;
  completed_date: string | null;
  requirements: number[];
  requirement_ids: string[];
  created_at: string;
}

export interface WaterfallTestCase {
  id: number;
  test_id: string;
  name: string;
  description: string;
  test_type: 'unit' | 'integration' | 'system' | 'acceptance' | 'regression' | 'performance';
  type_display: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  priority_display: string;
  status: 'pending' | 'passed' | 'failed' | 'blocked' | 'skipped';
  status_display: string;
  preconditions: string;
  test_steps: string;
  expected_result: string;
  actual_result: string;
  requirement: number | null;
  requirement_id_ref: string | null;
  assignee: number | null;
  assignee_name: string | null;
  executed_at: string | null;
  executed_by: number | null;
  executed_by_name: string | null;
  created_at: string;
}

export interface WaterfallTestStats {
  total: number;
  passed: number;
  failed: number;
  pending: number;
  blocked: number;
  pass_rate: number;
}

export interface WaterfallMilestone {
  id: number;
  phase: number | null;
  phase_name: string | null;
  name: string;
  description: string;
  due_date: string;
  completed_date: string | null;
  status: 'pending' | 'in_progress' | 'completed' | 'at_risk' | 'overdue';
  status_display: string;
  deliverables: string[];
  owner: number | null;
  owner_name: string | null;
  days_remaining: number;
  created_at: string;
}

export interface WaterfallGanttTask {
  id: number;
  phase: number;
  phase_name: string;
  name: string;
  start_date: string;
  end_date: string;
  progress: number;
  dependencies: number[];
  dependency_ids: number[];
  assignee: number | null;
  assignee_name: string | null;
  is_milestone: boolean;
  order: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

export interface WaterfallChangeRequest {
  id: number;
  change_id: string;
  title: string;
  description: string;
  reason: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  priority_display: string;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected' | 'implemented' | 'deferred';
  status_display: string;
  affected_phase: number | null;
  affected_phase_name: string | null;
  schedule_impact: string;
  budget_impact: string;
  scope_impact: string;
  requested_by: number | null;
  requested_by_name: string | null;
  reviewed_by: number | null;
  reviewed_by_name: string | null;
  approval_date: string | null;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface WaterfallDeploymentChecklistItem {
  id: number;
  category: 'testing' | 'documentation' | 'infrastructure' | 'approval' | 'backup' | 'security';
  category_display: string;
  item: string;
  is_required: boolean;
  is_completed: boolean;
  completed_by: number | null;
  completed_by_name: string | null;
  completed_at: string | null;
  assignee: number | null;
  assignee_name: string | null;
  order: number;
}

export interface WaterfallMaintenanceItem {
  id: number;
  title: string;
  description: string;
  item_type: 'bug_fix' | 'enhancement' | 'security' | 'performance';
  type_display: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  priority_display: string;
  status: 'open' | 'in_progress' | 'resolved' | 'closed';
  status_display: string;
  reported_by: number | null;
  reported_by_name: string | null;
  assignee: number | null;
  assignee_name: string | null;
  reported_date: string;
  resolved_date: string | null;
  resolution: string;
}

export interface WaterfallBudgetItem {
  id: number;
  phase: number | null;
  phase_name: string | null;
  category: string;
  description: string;
  planned_amount: number;
  actual_amount: number;
  variance: number;
  date: string | null;
}

export interface WaterfallBudget {
  id: number;
  total_budget: number;
  currency: string;
  contingency_percentage: number;
  total_spent: number;
  remaining: number;
  utilization_percentage: number;
  by_phase: { phase__name: string; planned: number; actual: number }[];
  items: WaterfallBudgetItem[];
  created_at: string;
  updated_at: string;
}

export interface WaterfallDashboard {
  has_initialized: boolean;
  current_phase: WaterfallPhase | null;
  phases: WaterfallPhase[];
  overall_progress: number;
  days_remaining: number;
  total_milestones: number;
  completed_milestones: number;
  at_risk_milestones: number;
  team_size: number;
  pending_change_requests: number;
  budget_utilization: number;
}

// ============================================
// API CLIENT
// ============================================

export const waterfallApi = {
  // Dashboard
  dashboard: {
    get: async (projectId: string): Promise<WaterfallDashboard> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/dashboard/`);
      return response.data;
    },
    initialize: async (projectId: string): Promise<void> => {
      await axios.post(`${API_BASE}/projects/${projectId}/waterfall/initialize/`);
    },
  },

  // Phases
  phases: {
    getAll: async (projectId: string): Promise<WaterfallPhase[]> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/phases/`);
      return response.data;
    },
    get: async (projectId: string, phaseId: number): Promise<WaterfallPhase> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/phases/${phaseId}/`);
      return response.data;
    },
    update: async (projectId: string, phaseId: number, data: Partial<WaterfallPhase>): Promise<WaterfallPhase> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/waterfall/phases/${phaseId}/`, data);
      return response.data;
    },
    start: async (projectId: string, phaseId: number): Promise<WaterfallPhase> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/phases/${phaseId}/start/`);
      return response.data;
    },
    complete: async (projectId: string, phaseId: number): Promise<WaterfallPhase> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/phases/${phaseId}/complete/`);
      return response.data;
    },
    signOff: async (projectId: string, phaseId: number): Promise<WaterfallPhase> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/phases/${phaseId}/sign-off/`);
      return response.data;
    },
  },

  // Team
  team: {
    getAll: async (projectId: string): Promise<WaterfallTeamMember[]> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/team/`);
      return response.data;
    },
    get: async (projectId: string, memberId: number): Promise<WaterfallTeamMember> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/team/${memberId}/`);
      return response.data;
    },
    create: async (projectId: string, data: { user_email: string; role: string; phase?: number; allocation_percentage?: number }): Promise<WaterfallTeamMember> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/team/`, data);
      return response.data;
    },
    update: async (projectId: string, memberId: number, data: Partial<WaterfallTeamMember>): Promise<WaterfallTeamMember> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/waterfall/team/${memberId}/`, data);
      return response.data;
    },
    delete: async (projectId: string, memberId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/waterfall/team/${memberId}/`);
    },
  },

  // Requirements
  requirements: {
    getAll: async (projectId: string, filters?: { type?: string; status?: string; priority?: string }): Promise<WaterfallRequirement[]> => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.priority) params.append('priority', filters.priority);
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/requirements/?${params}`);
      return response.data;
    },
    get: async (projectId: string, reqId: number): Promise<WaterfallRequirement> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/requirements/${reqId}/`);
      return response.data;
    },
    create: async (projectId: string, data: Partial<WaterfallRequirement>): Promise<WaterfallRequirement> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/requirements/`, data);
      return response.data;
    },
    update: async (projectId: string, reqId: number, data: Partial<WaterfallRequirement>): Promise<WaterfallRequirement> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/waterfall/requirements/${reqId}/`, data);
      return response.data;
    },
    delete: async (projectId: string, reqId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/waterfall/requirements/${reqId}/`);
    },
    approve: async (projectId: string, reqId: number): Promise<WaterfallRequirement> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/requirements/${reqId}/approve/`);
      return response.data;
    },
  },

  // Designs
  designs: {
    getAll: async (projectId: string): Promise<WaterfallDesignDocument[]> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/designs/`);
      return response.data;
    },
    get: async (projectId: string, docId: number): Promise<WaterfallDesignDocument> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/designs/${docId}/`);
      return response.data;
    },
    create: async (projectId: string, data: Partial<WaterfallDesignDocument>): Promise<WaterfallDesignDocument> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/designs/`, data);
      return response.data;
    },
    update: async (projectId: string, docId: number, data: Partial<WaterfallDesignDocument>): Promise<WaterfallDesignDocument> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/waterfall/designs/${docId}/`, data);
      return response.data;
    },
    delete: async (projectId: string, docId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/waterfall/designs/${docId}/`);
    },
    approve: async (projectId: string, docId: number): Promise<WaterfallDesignDocument> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/designs/${docId}/approve/`);
      return response.data;
    },
  },

  // Tasks
  tasks: {
    getAll: async (projectId: string, filters?: { phase?: number; status?: string }): Promise<WaterfallTask[]> => {
      const params = new URLSearchParams();
      if (filters?.phase) params.append('phase', filters.phase.toString());
      if (filters?.status) params.append('status', filters.status);
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/tasks/?${params}`);
      return response.data;
    },
    get: async (projectId: string, taskId: number): Promise<WaterfallTask> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/tasks/${taskId}/`);
      return response.data;
    },
    create: async (projectId: string, data: Partial<WaterfallTask>): Promise<WaterfallTask> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/tasks/`, data);
      return response.data;
    },
    update: async (projectId: string, taskId: number, data: Partial<WaterfallTask>): Promise<WaterfallTask> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/waterfall/tasks/${taskId}/`, data);
      return response.data;
    },
    delete: async (projectId: string, taskId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/waterfall/tasks/${taskId}/`);
    },
    complete: async (projectId: string, taskId: number): Promise<WaterfallTask> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/tasks/${taskId}/complete/`);
      return response.data;
    },
  },

  // Test Cases
  testCases: {
    getAll: async (projectId: string, filters?: { type?: string; status?: string }): Promise<WaterfallTestCase[]> => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/test-cases/?${params}`);
      return response.data;
    },
    get: async (projectId: string, testId: number): Promise<WaterfallTestCase> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/test-cases/${testId}/`);
      return response.data;
    },
    create: async (projectId: string, data: Partial<WaterfallTestCase>): Promise<WaterfallTestCase> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/test-cases/`, data);
      return response.data;
    },
    update: async (projectId: string, testId: number, data: Partial<WaterfallTestCase>): Promise<WaterfallTestCase> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/waterfall/test-cases/${testId}/`, data);
      return response.data;
    },
    delete: async (projectId: string, testId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/waterfall/test-cases/${testId}/`);
    },
    execute: async (projectId: string, testId: number, data: { status: string; actual_result?: string }): Promise<WaterfallTestCase> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/test-cases/${testId}/execute/`, data);
      return response.data;
    },
    getStats: async (projectId: string): Promise<WaterfallTestStats> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/test-cases/stats/`);
      return response.data;
    },
  },

  // Milestones
  milestones: {
    getAll: async (projectId: string): Promise<WaterfallMilestone[]> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/milestones/`);
      return response.data;
    },
    get: async (projectId: string, milestoneId: number): Promise<WaterfallMilestone> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/milestones/${milestoneId}/`);
      return response.data;
    },
    create: async (projectId: string, data: Partial<WaterfallMilestone>): Promise<WaterfallMilestone> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/milestones/`, data);
      return response.data;
    },
    update: async (projectId: string, milestoneId: number, data: Partial<WaterfallMilestone>): Promise<WaterfallMilestone> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/waterfall/milestones/${milestoneId}/`, data);
      return response.data;
    },
    delete: async (projectId: string, milestoneId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/waterfall/milestones/${milestoneId}/`);
    },
    complete: async (projectId: string, milestoneId: number): Promise<WaterfallMilestone> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/milestones/${milestoneId}/complete/`);
      return response.data;
    },
  },

  // Gantt
  gantt: {
    getAll: async (projectId: string): Promise<WaterfallGanttTask[]> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/gantt/`);
      return response.data;
    },
    get: async (projectId: string, taskId: number): Promise<WaterfallGanttTask> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/gantt/${taskId}/`);
      return response.data;
    },
    create: async (projectId: string, data: Partial<WaterfallGanttTask>): Promise<WaterfallGanttTask> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/gantt/`, data);
      return response.data;
    },
    update: async (projectId: string, taskId: number, data: Partial<WaterfallGanttTask>): Promise<WaterfallGanttTask> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/waterfall/gantt/${taskId}/`, data);
      return response.data;
    },
    delete: async (projectId: string, taskId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/waterfall/gantt/${taskId}/`);
    },
    updateProgress: async (projectId: string, taskId: number, progress: number): Promise<WaterfallGanttTask> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/gantt/${taskId}/update-progress/`, { progress });
      return response.data;
    },
    updateDates: async (projectId: string, taskId: number, data: { start_date?: string; end_date?: string }): Promise<WaterfallGanttTask> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/gantt/${taskId}/update-dates/`, data);
      return response.data;
    },
  },

  // Change Requests
  changeRequests: {
    getAll: async (projectId: string, filters?: { status?: string }): Promise<WaterfallChangeRequest[]> => {
      const params = new URLSearchParams();
      if (filters?.status) params.append('status', filters.status);
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/change-requests/?${params}`);
      return response.data;
    },
    get: async (projectId: string, crId: number): Promise<WaterfallChangeRequest> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/change-requests/${crId}/`);
      return response.data;
    },
    create: async (projectId: string, data: Partial<WaterfallChangeRequest>): Promise<WaterfallChangeRequest> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/change-requests/`, data);
      return response.data;
    },
    update: async (projectId: string, crId: number, data: Partial<WaterfallChangeRequest>): Promise<WaterfallChangeRequest> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/waterfall/change-requests/${crId}/`, data);
      return response.data;
    },
    delete: async (projectId: string, crId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/waterfall/change-requests/${crId}/`);
    },
    approve: async (projectId: string, crId: number, notes?: string): Promise<WaterfallChangeRequest> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/change-requests/${crId}/approve/`, { notes });
      return response.data;
    },
    reject: async (projectId: string, crId: number, notes?: string): Promise<WaterfallChangeRequest> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/change-requests/${crId}/reject/`, { notes });
      return response.data;
    },
  },

  // Deployment
  deployment: {
    getAll: async (projectId: string): Promise<WaterfallDeploymentChecklistItem[]> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/deployment/`);
      return response.data;
    },
    initialize: async (projectId: string): Promise<void> => {
      await axios.post(`${API_BASE}/projects/${projectId}/waterfall/deployment/initialize/`);
    },
    create: async (projectId: string, data: Partial<WaterfallDeploymentChecklistItem>): Promise<WaterfallDeploymentChecklistItem> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/deployment/`, data);
      return response.data;
    },
    update: async (projectId: string, itemId: number, data: Partial<WaterfallDeploymentChecklistItem>): Promise<WaterfallDeploymentChecklistItem> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/waterfall/deployment/${itemId}/`, data);
      return response.data;
    },
    delete: async (projectId: string, itemId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/waterfall/deployment/${itemId}/`);
    },
    toggle: async (projectId: string, itemId: number): Promise<WaterfallDeploymentChecklistItem> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/deployment/${itemId}/toggle/`);
      return response.data;
    },
  },

  // Maintenance
  maintenance: {
    getAll: async (projectId: string, filters?: { type?: string; status?: string }): Promise<WaterfallMaintenanceItem[]> => {
      const params = new URLSearchParams();
      if (filters?.type) params.append('type', filters.type);
      if (filters?.status) params.append('status', filters.status);
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/maintenance/?${params}`);
      return response.data;
    },
    get: async (projectId: string, itemId: number): Promise<WaterfallMaintenanceItem> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/maintenance/${itemId}/`);
      return response.data;
    },
    create: async (projectId: string, data: Partial<WaterfallMaintenanceItem>): Promise<WaterfallMaintenanceItem> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/maintenance/`, data);
      return response.data;
    },
    update: async (projectId: string, itemId: number, data: Partial<WaterfallMaintenanceItem>): Promise<WaterfallMaintenanceItem> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/waterfall/maintenance/${itemId}/`, data);
      return response.data;
    },
    delete: async (projectId: string, itemId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/waterfall/maintenance/${itemId}/`);
    },
    resolve: async (projectId: string, itemId: number, resolution: string): Promise<WaterfallMaintenanceItem> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/maintenance/${itemId}/resolve/`, { resolution });
      return response.data;
    },
  },

  // Budget
  budget: {
    get: async (projectId: string): Promise<WaterfallBudget> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/budget/`);
      return response.data;
    },
    update: async (projectId: string, data: Partial<WaterfallBudget>): Promise<WaterfallBudget> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/waterfall/budget/`, data);
      return response.data;
    },
    getItems: async (projectId: string): Promise<WaterfallBudgetItem[]> => {
      const response = await axios.get(`${API_BASE}/projects/${projectId}/waterfall/budget/items/`);
      return response.data;
    },
    createItem: async (projectId: string, data: Partial<WaterfallBudgetItem>): Promise<WaterfallBudgetItem> => {
      const response = await axios.post(`${API_BASE}/projects/${projectId}/waterfall/budget/items/`, data);
      return response.data;
    },
    updateItem: async (projectId: string, itemId: number, data: Partial<WaterfallBudgetItem>): Promise<WaterfallBudgetItem> => {
      const response = await axios.patch(`${API_BASE}/projects/${projectId}/waterfall/budget/items/${itemId}/`, data);
      return response.data;
    },
    deleteItem: async (projectId: string, itemId: number): Promise<void> => {
      await axios.delete(`${API_BASE}/projects/${projectId}/waterfall/budget/items/${itemId}/`);
    },
  },
};

export default waterfallApi;
