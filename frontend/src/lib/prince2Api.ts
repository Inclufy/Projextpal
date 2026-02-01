/**
 * PRINCE2 API Client for ProjectPal
 * Uses the existing api client for authentication
 */

import { api } from './api';

// ==================== TYPES ====================

export interface ProjectBrief {
  id: number;
  project: number;
  project_definition: string;
  project_approach: string;
  outline_business_case: string;
  project_objectives?: string;
  project_scope?: string;
  project_team_structure?: string;
  constraints?: string;
  assumptions?: string;
  status: 'draft' | 'submitted' | 'approved';
  version: string;
  created_at: string;
  updated_at: string;
}

export interface BusinessCase {
  id: number;
  project: number;
  executive_summary?: string;
  reasons?: string;
  expected_benefits?: string;
  development_costs: number;
  ongoing_costs: number;
  total_costs?: number;
  roi_percentage?: number;
  net_present_value?: number;
  payback_period_months?: number;
  status: 'draft' | 'approved' | 'updated';
  version: string;
  benefits?: BusinessCaseBenefit[];
  risks?: BusinessCaseRisk[];
  created_at: string;
  updated_at: string;
}

export interface BusinessCaseBenefit {
  id: number;
  business_case: number;
  description: string;
  benefit_type: 'financial' | 'non_financial' | 'intangible';
  value?: string;
  timing?: string;
  measurable: boolean;
}

export interface BusinessCaseRisk {
  id: number;
  business_case: number;
  description: string;
  probability: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  impact: 'very_low' | 'low' | 'medium' | 'high' | 'very_high';
  mitigation?: string;
}

export interface ProjectInitiationDocument {
  id: number;
  project: number;
  project_definition: string;
  project_approach: string;
  project_objectives?: string;
  success_criteria?: string;
  quality_management_approach: string;
  risk_management_approach: string;
  change_control_approach: string;
  communication_management_approach: string;
  project_controls?: string;
  tailoring?: string;
  role_descriptions?: Record<string, string>;
  status: 'draft' | 'baselined' | 'updated';
  version: string;
  baseline_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Stage {
  id: number;
  project: number;
  name: string;
  order: number;
  description?: string;
  objectives?: string;
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  time_tolerance?: string;
  cost_tolerance?: string;
  scope_tolerance?: string;
  quality_tolerance?: string;
  risk_tolerance?: string;
  status: 'planned' | 'active' | 'completed' | 'exception';
  progress_percentage: number;
  work_packages_count?: number;
  created_at: string;
  updated_at: string;
}

export interface StageGate {
  id: number;
  stage: number;
  stage_name?: string;
  review_date?: string;
  outcome: 'pending' | 'approved' | 'conditional' | 'rejected' | 'deferred';
  decision_notes?: string;
  stage_performance_summary?: string;
  products_completed?: string;
  products_pending?: string;
  lessons_learned?: string;
  business_case_still_valid: boolean;
  next_stage_plan_approved: boolean;
  reviewer?: number;
  reviewer_name?: string;
  created_at: string;
  updated_at: string;
}

export interface StagePlan {
  id: number;
  stage: number;
  stage_name?: string;
  plan_description?: string;
  budget?: number;
  budget_breakdown?: Record<string, number>;
  resource_requirements?: string;
  quality_approach?: string;
  dependencies?: string;
  assumptions?: string;
  status: 'draft' | 'approved' | 'baselined';
  version: string;
  created_at: string;
  updated_at: string;
}

export interface WorkPackage {
  id: number;
  project: number;
  stage: number;
  stage_name?: string;
  reference: string;
  title: string;
  description?: string;
  product_descriptions?: string;
  techniques?: string;
  joint_agreements?: string;
  tolerances?: string;
  constraints?: string;
  reporting_requirements?: string;
  problem_handling?: string;
  team_manager?: number;
  team_manager_name?: string;
  planned_start_date?: string;
  planned_end_date?: string;
  actual_start_date?: string;
  actual_end_date?: string;
  status: 'draft' | 'authorized' | 'in_progress' | 'completed' | 'closed';
  priority: 'low' | 'medium' | 'high' | 'critical';
  progress_percentage: number;
  checkpoint_reports_count?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectBoard {
  id: number;
  project: number;
  meeting_frequency?: string;
  next_meeting_date?: string;
  governance_notes?: string;
  budget_authority?: number;
  members?: ProjectBoardMember[];
  created_at: string;
  updated_at: string;
}

export interface ProjectBoardMember {
  id: number;
  board: number;
  user: number;
  user_name?: string;
  user_email?: string;
  role: 'executive' | 'senior_user' | 'senior_supplier' | 'project_manager' | 'project_assurance' | 'change_authority' | 'project_support';
  responsibilities?: string;
  created_at: string;
}

export interface HighlightReport {
  id: number;
  project: number;
  stage: number;
  stage_name?: string;
  report_date: string;
  period_start?: string;
  period_end?: string;
  overall_status: 'green' | 'amber' | 'red';
  status_summary?: string;
  work_completed?: string;
  work_planned_next_period?: string;
  issues_summary?: string;
  risks_summary?: string;
  budget_spent?: number;
  budget_forecast?: number;
  created_at: string;
  updated_at: string;
}

export interface CheckpointReport {
  id: number;
  work_package: number;
  report_date: string;
  period_start?: string;
  period_end?: string;
  products_completed?: string;
  products_in_progress?: string;
  quality_issues?: string;
  schedule_status?: string;
  created_by?: number;
  created_at: string;
}

export interface EndStageReport {
  id: number;
  stage: number;
  stage_name?: string;
  report_date: string;
  stage_achievements?: string;
  performance_against_plan?: string;
  issues_summary?: string;
  risks_summary?: string;
  lessons_summary?: string;
  actual_cost?: number;
  cost_variance?: number;
  status: 'draft' | 'approved';
  created_at: string;
  updated_at: string;
}

export interface EndProjectReport {
  id: number;
  project: number;
  report_date?: string;
  achievements_summary: string;
  performance_against_plan: string;
  benefits_achieved?: string;
  quality_review?: string;
  final_cost?: number;
  budget_variance?: number;
  schedule_variance?: string;
  follow_on_actions?: string;
  status: 'draft' | 'approved';
  created_at: string;
  updated_at: string;
}

export interface IssueRegister {
  id: number;
  project: number;
  reference: string;
  issue_type: 'problem' | 'change_request' | 'off_specification';
  issue_type_display?: string;
  description: string;
  raised_by?: number;
  raised_by_name?: string;
  date_raised: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'in_review' | 'approved' | 'rejected' | 'implemented' | 'closed';
  impact_analysis?: string;
  recommendation?: string;
  cost_impact?: number;
  time_impact?: string;
  decision?: string;
  decision_date?: string;
  decided_by?: number;
  closure_date?: string;
  created_at: string;
  updated_at: string;
}

export interface RiskRegister {
  id: number;
  project: number;
  reference: string;
  description: string;
  category?: string;
  raised_by?: number;
  raised_by_name?: string;
  date_identified: string;
  probability: 1 | 2 | 3 | 4 | 5;
  impact: 1 | 2 | 3 | 4 | 5;
  risk_score?: number;
  proximity?: 'imminent' | 'within_stage' | 'within_project' | 'beyond_project';
  response_type?: 'avoid' | 'reduce' | 'transfer' | 'accept' | 'prepare' | 'share' | 'exploit' | 'enhance';
  response_actions?: string;
  owner?: number;
  owner_name?: string;
  status: 'identified' | 'assessing' | 'active' | 'closed' | 'occurred';
  closure_date?: string;
  created_at: string;
  updated_at: string;
}

export interface LessonsLog {
  id: number;
  project: number;
  title: string;
  lesson_type: 'positive' | 'negative';
  category?: 'process' | 'technology' | 'people' | 'supplier' | 'communication' | 'quality' | 'risk';
  description?: string;
  recommendation?: string;
  stage?: number;
  logged_by?: number;
  date_logged: string;
  created_at: string;
  updated_at: string;
}

export interface QualityRegister {
  id: number;
  project: number;
  reference: string;
  product_name: string;
  activity_type: 'quality_review' | 'audit' | 'inspection' | 'test' | 'walkthrough';
  planned_date?: string;
  actual_date?: string;
  result?: 'pass' | 'conditional' | 'fail' | 'pending';
  issues_found?: string;
  actions_required?: string;
  reviewer?: number;
  reviewer_name?: string;
  sign_off_date?: string;
  signed_off_by?: number;
  created_at: string;
  updated_at: string;
}

export interface ProjectTolerance {
  id: number;
  project: number;
  tolerance_type: 'time' | 'cost' | 'scope' | 'quality' | 'benefit' | 'risk';
  tolerance_type_display?: string;
  description?: string;
  plus_tolerance?: string;
  minus_tolerance?: string;
  current_status?: string;
  is_exceeded: boolean;
  created_at: string;
  updated_at: string;
}

export interface Prince2Dashboard {
  project_id: number;
  project_name?: string;
  overall_progress: number;
  total_stages: number;
  completed_stages: number;
  has_brief: boolean;
  brief_status?: string;
  has_business_case: boolean;
  business_case_status?: string;
  has_pid: boolean;
  pid_status?: string;
  open_issues: number;
  high_priority_issues: number;
  total_risks: number;
  high_risks: number;
  tolerances_exceeded: number;
  total_budget: number;
  spent_budget: number;
  budget_variance: number;
  stages?: Stage[];
  recent_highlight_reports?: HighlightReport[];
  recent_issues?: IssueRegister[];
}

// ==================== API CLIENT ====================

export const prince2Api = {
  // Dashboard
  dashboard: {
    get: (projectId: string | number) => 
      api.get<Prince2Dashboard>(`/projects/${projectId}/prince2/dashboard/`),
  },

  // Project Brief
  brief: {
    get: (projectId: string | number) => 
      api.get<ProjectBrief[]>(`/projects/${projectId}/prince2/brief/`),
    getOne: (projectId: string | number, id: number) => 
      api.get<ProjectBrief>(`/projects/${projectId}/prince2/brief/${id}/`),
    create: (projectId: string | number, data: Partial<ProjectBrief>) => 
      api.post<ProjectBrief>(`/projects/${projectId}/prince2/brief/`, data),
    update: (projectId: string | number, id: number, data: Partial<ProjectBrief>) => 
      api.patch<ProjectBrief>(`/projects/${projectId}/prince2/brief/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/brief/${id}/`),
    approve: (projectId: string | number, id: number) => 
      api.post<ProjectBrief>(`/projects/${projectId}/prince2/brief/${id}/approve/`),
    submitForReview: (projectId: string | number, id: number) => 
      api.post<ProjectBrief>(`/projects/${projectId}/prince2/brief/${id}/submit_for_review/`),
  },

  // Business Case
  businessCase: {
    get: (projectId: string | number) => 
      api.get<BusinessCase[]>(`/projects/${projectId}/prince2/business-case/`),
    getOne: (projectId: string | number, id: number) => 
      api.get<BusinessCase>(`/projects/${projectId}/prince2/business-case/${id}/`),
    create: (projectId: string | number, data: Partial<BusinessCase>) => 
      api.post<BusinessCase>(`/projects/${projectId}/prince2/business-case/`, data),
    update: (projectId: string | number, id: number, data: Partial<BusinessCase>) => 
      api.patch<BusinessCase>(`/projects/${projectId}/prince2/business-case/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/business-case/${id}/`),
    approve: (projectId: string | number, id: number) => 
      api.post<BusinessCase>(`/projects/${projectId}/prince2/business-case/${id}/approve/`),
    addBenefit: (projectId: string | number, id: number, data: Partial<BusinessCaseBenefit>) => 
      api.post<BusinessCaseBenefit>(`/projects/${projectId}/prince2/business-case/${id}/add_benefit/`, data),
    addRisk: (projectId: string | number, id: number, data: Partial<BusinessCaseRisk>) => 
      api.post<BusinessCaseRisk>(`/projects/${projectId}/prince2/business-case/${id}/add_risk/`, data),
  },

  // Benefits & BC Risks (direct access)
  benefits: {
    getAll: (projectId: string | number) => 
      api.get<BusinessCaseBenefit[]>(`/projects/${projectId}/prince2/benefits/`),
    create: (projectId: string | number, data: Partial<BusinessCaseBenefit>) => 
      api.post<BusinessCaseBenefit>(`/projects/${projectId}/prince2/benefits/`, data),
    update: (projectId: string | number, id: number, data: Partial<BusinessCaseBenefit>) => 
      api.patch<BusinessCaseBenefit>(`/projects/${projectId}/prince2/benefits/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/benefits/${id}/`),
  },

  bcRisks: {
    getAll: (projectId: string | number) => 
      api.get<BusinessCaseRisk[]>(`/projects/${projectId}/prince2/bc-risks/`),
    create: (projectId: string | number, data: Partial<BusinessCaseRisk>) => 
      api.post<BusinessCaseRisk>(`/projects/${projectId}/prince2/bc-risks/`, data),
    update: (projectId: string | number, id: number, data: Partial<BusinessCaseRisk>) => 
      api.patch<BusinessCaseRisk>(`/projects/${projectId}/prince2/bc-risks/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/bc-risks/${id}/`),
  },

  // PID
  pid: {
    get: (projectId: string | number) => 
      api.get<ProjectInitiationDocument[]>(`/projects/${projectId}/prince2/pid/`),
    getOne: (projectId: string | number, id: number) => 
      api.get<ProjectInitiationDocument>(`/projects/${projectId}/prince2/pid/${id}/`),
    create: (projectId: string | number, data: Partial<ProjectInitiationDocument>) => 
      api.post<ProjectInitiationDocument>(`/projects/${projectId}/prince2/pid/`, data),
    update: (projectId: string | number, id: number, data: Partial<ProjectInitiationDocument>) => 
      api.patch<ProjectInitiationDocument>(`/projects/${projectId}/prince2/pid/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/pid/${id}/`),
    baseline: (projectId: string | number, id: number) => 
      api.post<ProjectInitiationDocument>(`/projects/${projectId}/prince2/pid/${id}/baseline/`),
  },

  // Stages
  stages: {
    getAll: (projectId: string | number) => 
      api.get<Stage[]>(`/projects/${projectId}/prince2/stages/`),
    getOne: (projectId: string | number, id: number) => 
      api.get<Stage>(`/projects/${projectId}/prince2/stages/${id}/`),
    create: (projectId: string | number, data: Partial<Stage>) => 
      api.post<Stage>(`/projects/${projectId}/prince2/stages/`, data),
    update: (projectId: string | number, id: number, data: Partial<Stage>) => 
      api.patch<Stage>(`/projects/${projectId}/prince2/stages/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/stages/${id}/`),
    start: (projectId: string | number, id: number) => 
      api.post<Stage>(`/projects/${projectId}/prince2/stages/${id}/start/`),
    complete: (projectId: string | number, id: number) => 
      api.post<Stage>(`/projects/${projectId}/prince2/stages/${id}/complete/`),
    approve: (projectId: string | number, id: number) => 
      api.post<Stage>(`/projects/${projectId}/prince2/stages/${id}/approve/`),
    updateProgress: (projectId: string | number, id: number, progress: number) => 
      api.post<Stage>(`/projects/${projectId}/prince2/stages/${id}/update_progress/`, { progress_percentage: progress }),
    initialize: (projectId: string | number) => 
      api.post<Stage[]>(`/projects/${projectId}/prince2/stages/initialize_stages/`),
  },

  // Stage Gates
  stageGates: {
    getAll: (projectId: string | number) => 
      api.get<StageGate[]>(`/projects/${projectId}/prince2/stage-gates/`),
    getOne: (projectId: string | number, id: number) => 
      api.get<StageGate>(`/projects/${projectId}/prince2/stage-gates/${id}/`),
    create: (projectId: string | number, data: Partial<StageGate>) => 
      api.post<StageGate>(`/projects/${projectId}/prince2/stage-gates/`, data),
    update: (projectId: string | number, id: number, data: Partial<StageGate>) => 
      api.patch<StageGate>(`/projects/${projectId}/prince2/stage-gates/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/stage-gates/${id}/`),
    approve: (projectId: string | number, id: number) => 
      api.post<StageGate>(`/projects/${projectId}/prince2/stage-gates/${id}/approve/`),
    reject: (projectId: string | number, id: number, notes: string) => 
      api.post<StageGate>(`/projects/${projectId}/prince2/stage-gates/${id}/reject/`, { decision_notes: notes }),
  },

  // Stage Plans
  stagePlans: {
    getAll: (projectId: string | number) => 
      api.get<StagePlan[]>(`/projects/${projectId}/prince2/stage-plans/`),
    getOne: (projectId: string | number, id: number) => 
      api.get<StagePlan>(`/projects/${projectId}/prince2/stage-plans/${id}/`),
    create: (projectId: string | number, data: Partial<StagePlan>) => 
      api.post<StagePlan>(`/projects/${projectId}/prince2/stage-plans/`, data),
    update: (projectId: string | number, id: number, data: Partial<StagePlan>) => 
      api.patch<StagePlan>(`/projects/${projectId}/prince2/stage-plans/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/stage-plans/${id}/`),
    approve: (projectId: string | number, id: number) => 
      api.post<StagePlan>(`/projects/${projectId}/prince2/stage-plans/${id}/approve/`),
  },

  // Work Packages
  workPackages: {
    getAll: (projectId: string | number, params?: { stage?: number; status?: string }) => 
      api.get<WorkPackage[]>(`/projects/${projectId}/prince2/work-packages/`, params as any),
    getOne: (projectId: string | number, id: number) => 
      api.get<WorkPackage>(`/projects/${projectId}/prince2/work-packages/${id}/`),
    create: (projectId: string | number, data: Partial<WorkPackage>) => 
      api.post<WorkPackage>(`/projects/${projectId}/prince2/work-packages/`, data),
    update: (projectId: string | number, id: number, data: Partial<WorkPackage>) => 
      api.patch<WorkPackage>(`/projects/${projectId}/prince2/work-packages/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/work-packages/${id}/`),
    authorize: (projectId: string | number, id: number) => 
      api.post<WorkPackage>(`/projects/${projectId}/prince2/work-packages/${id}/authorize/`),
    start: (projectId: string | number, id: number) => 
      api.post<WorkPackage>(`/projects/${projectId}/prince2/work-packages/${id}/start/`),
    complete: (projectId: string | number, id: number) => 
      api.post<WorkPackage>(`/projects/${projectId}/prince2/work-packages/${id}/complete/`),
    updateProgress: (projectId: string | number, id: number, progress: number) => 
      api.post<WorkPackage>(`/projects/${projectId}/prince2/work-packages/${id}/update_progress/`, { progress_percentage: progress }),
  },

  // Project Board
  board: {
    get: (projectId: string | number) => 
      api.get<ProjectBoard[]>(`/projects/${projectId}/prince2/board/`),
    getOne: (projectId: string | number, id: number) => 
      api.get<ProjectBoard>(`/projects/${projectId}/prince2/board/${id}/`),
    create: (projectId: string | number, data: Partial<ProjectBoard>) => 
      api.post<ProjectBoard>(`/projects/${projectId}/prince2/board/`, data),
    update: (projectId: string | number, id: number, data: Partial<ProjectBoard>) => 
      api.patch<ProjectBoard>(`/projects/${projectId}/prince2/board/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/board/${id}/`),
    addMember: (projectId: string | number, id: number, data: Partial<ProjectBoardMember>) => 
      api.post<ProjectBoardMember>(`/projects/${projectId}/prince2/board/${id}/add_member/`, data),
  },

  // Board Members
  boardMembers: {
    getAll: (projectId: string | number) => 
      api.get<ProjectBoardMember[]>(`/projects/${projectId}/prince2/board-members/`),
    update: (projectId: string | number, id: number, data: Partial<ProjectBoardMember>) => 
      api.patch<ProjectBoardMember>(`/projects/${projectId}/prince2/board-members/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/board-members/${id}/`),
  },

  // Highlight Reports
  highlightReports: {
    getAll: (projectId: string | number) => 
      api.get<HighlightReport[]>(`/projects/${projectId}/prince2/highlight-reports/`),
    getOne: (projectId: string | number, id: number) => 
      api.get<HighlightReport>(`/projects/${projectId}/prince2/highlight-reports/${id}/`),
    create: (projectId: string | number, data: Partial<HighlightReport>) => 
      api.post<HighlightReport>(`/projects/${projectId}/prince2/highlight-reports/`, data),
    update: (projectId: string | number, id: number, data: Partial<HighlightReport>) => 
      api.patch<HighlightReport>(`/projects/${projectId}/prince2/highlight-reports/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/highlight-reports/${id}/`),
  },

  // Checkpoint Reports
  checkpointReports: {
    getAll: (projectId: string | number) => 
      api.get<CheckpointReport[]>(`/projects/${projectId}/prince2/checkpoint-reports/`),
    create: (projectId: string | number, data: Partial<CheckpointReport>) => 
      api.post<CheckpointReport>(`/projects/${projectId}/prince2/checkpoint-reports/`, data),
  },

  // End Stage Reports
  endStageReports: {
    getAll: (projectId: string | number) => 
      api.get<EndStageReport[]>(`/projects/${projectId}/prince2/end-stage-reports/`),
    getOne: (projectId: string | number, id: number) => 
      api.get<EndStageReport>(`/projects/${projectId}/prince2/end-stage-reports/${id}/`),
    create: (projectId: string | number, data: Partial<EndStageReport>) => 
      api.post<EndStageReport>(`/projects/${projectId}/prince2/end-stage-reports/`, data),
    update: (projectId: string | number, id: number, data: Partial<EndStageReport>) => 
      api.patch<EndStageReport>(`/projects/${projectId}/prince2/end-stage-reports/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/end-stage-reports/${id}/`),
    approve: (projectId: string | number, id: number) => 
      api.post<EndStageReport>(`/projects/${projectId}/prince2/end-stage-reports/${id}/approve/`),
  },

  // End Project Report
  endProjectReport: {
    getAll: (projectId: string | number) => 
      api.get<EndProjectReport[]>(`/projects/${projectId}/prince2/end-project-report/`),
    getOne: (projectId: string | number, id: number) => 
      api.get<EndProjectReport>(`/projects/${projectId}/prince2/end-project-report/${id}/`),
    create: (projectId: string | number, data: Partial<EndProjectReport>) => 
      api.post<EndProjectReport>(`/projects/${projectId}/prince2/end-project-report/`, data),
    update: (projectId: string | number, id: number, data: Partial<EndProjectReport>) => 
      api.patch<EndProjectReport>(`/projects/${projectId}/prince2/end-project-report/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/end-project-report/${id}/`),
    approve: (projectId: string | number, id: number) => 
      api.post<EndProjectReport>(`/projects/${projectId}/prince2/end-project-report/${id}/approve/`),
  },

  // Issues
  issues: {
    getAll: (projectId: string | number, params?: { type?: string; status?: string }) => 
      api.get<IssueRegister[]>(`/projects/${projectId}/prince2/issues/`, params as any),
    getOne: (projectId: string | number, id: number) => 
      api.get<IssueRegister>(`/projects/${projectId}/prince2/issues/${id}/`),
    create: (projectId: string | number, data: Partial<IssueRegister>) => 
      api.post<IssueRegister>(`/projects/${projectId}/prince2/issues/`, data),
    update: (projectId: string | number, id: number, data: Partial<IssueRegister>) => 
      api.patch<IssueRegister>(`/projects/${projectId}/prince2/issues/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/issues/${id}/`),
    approve: (projectId: string | number, id: number) => 
      api.post<IssueRegister>(`/projects/${projectId}/prince2/issues/${id}/approve/`),
    reject: (projectId: string | number, id: number) => 
      api.post<IssueRegister>(`/projects/${projectId}/prince2/issues/${id}/reject/`),
    close: (projectId: string | number, id: number) => 
      api.post<IssueRegister>(`/projects/${projectId}/prince2/issues/${id}/close/`),
    summary: (projectId: string | number) => 
      api.get<any>(`/projects/${projectId}/prince2/issues/summary/`),
  },

  // Risks
  risks: {
    getAll: (projectId: string | number, params?: { status?: string }) => 
      api.get<RiskRegister[]>(`/projects/${projectId}/prince2/risks/`, params as any),
    getOne: (projectId: string | number, id: number) => 
      api.get<RiskRegister>(`/projects/${projectId}/prince2/risks/${id}/`),
    create: (projectId: string | number, data: Partial<RiskRegister>) => 
      api.post<RiskRegister>(`/projects/${projectId}/prince2/risks/`, data),
    update: (projectId: string | number, id: number, data: Partial<RiskRegister>) => 
      api.patch<RiskRegister>(`/projects/${projectId}/prince2/risks/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/risks/${id}/`),
    close: (projectId: string | number, id: number) => 
      api.post<RiskRegister>(`/projects/${projectId}/prince2/risks/${id}/close/`),
    occurred: (projectId: string | number, id: number) => 
      api.post<RiskRegister>(`/projects/${projectId}/prince2/risks/${id}/occurred/`),
    getHighRisks: (projectId: string | number) => 
      api.get<RiskRegister[]>(`/projects/${projectId}/prince2/risks/high/`),
    summary: (projectId: string | number) => 
      api.get<any>(`/projects/${projectId}/prince2/risks/summary/`),
  },

  // Lessons
  lessons: {
    getAll: (projectId: string | number) => 
      api.get<LessonsLog[]>(`/projects/${projectId}/prince2/lessons/`),
    getOne: (projectId: string | number, id: number) => 
      api.get<LessonsLog>(`/projects/${projectId}/prince2/lessons/${id}/`),
    create: (projectId: string | number, data: Partial<LessonsLog>) => 
      api.post<LessonsLog>(`/projects/${projectId}/prince2/lessons/`, data),
    update: (projectId: string | number, id: number, data: Partial<LessonsLog>) => 
      api.patch<LessonsLog>(`/projects/${projectId}/prince2/lessons/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/lessons/${id}/`),
    byCategory: (projectId: string | number) => 
      api.get<any>(`/projects/${projectId}/prince2/lessons/by_category/`),
  },

  // Quality
  quality: {
    getAll: (projectId: string | number) => 
      api.get<QualityRegister[]>(`/projects/${projectId}/prince2/quality/`),
    getOne: (projectId: string | number, id: number) => 
      api.get<QualityRegister>(`/projects/${projectId}/prince2/quality/${id}/`),
    create: (projectId: string | number, data: Partial<QualityRegister>) => 
      api.post<QualityRegister>(`/projects/${projectId}/prince2/quality/`, data),
    update: (projectId: string | number, id: number, data: Partial<QualityRegister>) => 
      api.patch<QualityRegister>(`/projects/${projectId}/prince2/quality/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/quality/${id}/`),
    recordResult: (projectId: string | number, id: number, result: string) => 
      api.post<QualityRegister>(`/projects/${projectId}/prince2/quality/${id}/record_result/`, { result }),
    signOff: (projectId: string | number, id: number) => 
      api.post<QualityRegister>(`/projects/${projectId}/prince2/quality/${id}/sign_off/`),
  },

  // Tolerances
  tolerances: {
    getAll: (projectId: string | number) => 
      api.get<ProjectTolerance[]>(`/projects/${projectId}/prince2/tolerances/`),
    getOne: (projectId: string | number, id: number) => 
      api.get<ProjectTolerance>(`/projects/${projectId}/prince2/tolerances/${id}/`),
    create: (projectId: string | number, data: Partial<ProjectTolerance>) => 
      api.post<ProjectTolerance>(`/projects/${projectId}/prince2/tolerances/`, data),
    update: (projectId: string | number, id: number, data: Partial<ProjectTolerance>) => 
      api.patch<ProjectTolerance>(`/projects/${projectId}/prince2/tolerances/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete<void>(`/projects/${projectId}/prince2/tolerances/${id}/`),
    initialize: (projectId: string | number) => 
      api.post<ProjectTolerance[]>(`/projects/${projectId}/prince2/tolerances/initialize/`),
  },
};

export default prince2Api;