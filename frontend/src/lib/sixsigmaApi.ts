import { api } from './api';

// =============================================================================
// TYPES
// =============================================================================

// Define Phase
export interface SIPOCDiagram {
  id: number;
  project: number;
  process_name: string;
  process_description: string;
  process_start: string;
  process_end: string;
  items: SIPOCItem[];
  created_at: string;
  updated_at: string;
}

export interface SIPOCItem {
  id: number;
  sipoc: number;
  category: 'supplier' | 'input' | 'process' | 'output' | 'customer';
  name: string;
  description: string;
  order: number;
}

export interface VoiceOfCustomer {
  id: number;
  project: number;
  customer_segment: string;
  voice_statement: string;
  customer_need: string;
  ctq_requirement: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  measurement: string;
  target_value: string;
  created_at: string;
}

export interface ProjectCharter {
  id: number;
  project: number;
  problem_statement: string;
  goal_statement: string;
  business_case: string;
  scope_in: string;
  scope_out: string;
  primary_metric: string;
  secondary_metrics: string;
  project_sponsor: number | null;
  process_owner: number | null;
  team_members: string;
  estimated_savings: number;
  start_date: string;
  target_completion: string;
  is_approved: boolean;
  approved_by: number | null;
  approved_at: string | null;
}

// Measure Phase
export interface DataCollectionPlan {
  id: number;
  project: number;
  name: string;
  objective: string;
  data_type: 'continuous' | 'discrete' | 'attribute';
  sampling_strategy: string;
  sample_size: number;
  collection_frequency: string;
  responsible_person: number | null;
  start_date: string;
  end_date: string;
  status: 'planned' | 'in_progress' | 'completed';
  metrics: DataCollectionMetric[];
}

export interface DataCollectionMetric {
  id: number;
  plan: number;
  metric_name: string;
  operational_definition: string;
  data_source: string;
  measurement_method: string;
  target_samples: number;
  collected_samples: number;
  collection_progress: number;
}

export interface MSAResult {
  id: number;
  project: number;
  measurement_name: string;
  study_type: string;
  number_of_operators: number;
  number_of_parts: number;
  number_of_trials: number;
  repeatability: number;
  reproducibility: number;
  total_gage_rr: number;
  part_to_part: number;
  total_variation: number;
  percent_study_var: number;
  percent_tolerance: number;
  number_of_distinct_categories: number;
  conclusion: string;
  recommendations: string;
  created_at: string;
}

export interface BaselineMetric {
  id: number;
  project: number;
  metric_name: string;
  metric_type: string;
  unit_of_measure: string;
  baseline_value: number;
  target_value: number;
  data_source: string;
  measurement_period: string;
  sample_size: number;
  mean: number;
  std_deviation: number;
  usl: number;
  lsl: number;
  defects: number;
  opportunities: number;
  notes: string;
  created_at: string;
}

// Analyze Phase
export interface FishboneDiagram {
  id: number;
  project: number;
  problem_statement: string;
  causes: FishboneCause[];
  created_at: string;
}

export interface FishboneCause {
  id: number;
  fishbone: number;
  category: 'man' | 'machine' | 'method' | 'material' | 'measurement' | 'environment';
  cause: string;
  sub_cause: string;
  votes: number;
  is_root_cause: boolean;
  is_verified: boolean;
  verification_method: string;
}

export interface ParetoAnalysis {
  id: number;
  project: number;
  analysis_name: string;
  description: string;
  categories: ParetoCategory[];
  created_at: string;
}

export interface ParetoCategory {
  id: number;
  pareto: number;
  category_name: string;
  count: number;
  percentage: number;
  cumulative_percentage: number;
  order: number;
}

export interface HypothesisTest {
  id: number;
  project: number;
  test_name: string;
  test_type: 't_test' | 'chi_square' | 'anova' | 'correlation' | 'regression';
  null_hypothesis: string;
  alternative_hypothesis: string;
  alpha_level: number;
  p_value: number | null;
  test_statistic: number | null;
  conclusion: 'reject_null' | 'fail_to_reject' | 'pending';
  is_significant: boolean;
  data_summary: string;
  notes: string;
}

export interface RootCauseAnalysis {
  id: number;
  project: number;
  problem_statement: string;
  why_1: string;
  why_2: string;
  why_3: string;
  why_4: string;
  why_5: string;
  root_cause: string;
  verification_method: string;
  verified: boolean;
  corrective_action: string;
  status: 'identified' | 'verified' | 'addressed';
  created_at: string;
}

export interface RegressionAnalysis {
  id: number;
  project: number;
  analysis_name: string;
  regression_type: string;
  dependent_variable: string;
  independent_variables: string;
  r_squared: number;
  adjusted_r_squared: number;
  p_value: number;
  f_statistic: number;
  coefficients: string;
  equation: string;
  residual_analysis: string;
  interpretation: string;
  recommendations: string;
  created_at: string;
}

// Improve Phase
export interface Solution {
  id: number;
  project: number;
  title: string;
  description: string;
  root_cause_addressed: string;
  impact_score: number;
  effort_score: number;
  cost_estimate: number;
  time_estimate: string;
  status: 'proposed' | 'approved' | 'in_progress' | 'implemented' | 'rejected';
  created_at: string;
}

export interface PilotPlan {
  id: number;
  project: number;
  pilot_name: string;
  solution_being_tested: string;
  pilot_scope: string;
  success_criteria: string;
  duration: string;
  start_date: string;
  end_date: string;
  participants: string;
  resources_needed: string;
  risks: string;
  status: 'planned' | 'in_progress' | 'completed' | 'failed';
  created_at: string;
}

export interface FMEA {
  id: number;
  project: number;
  process_step: string;
  potential_failure_mode: string;
  potential_effect: string;
  severity: number;
  potential_cause: string;
  occurrence: number;
  current_controls: string;
  detection: number;
  recommended_actions: string;
  responsibility: string;
  target_date: string;
  created_at: string;
}

export interface ImplementationPlan {
  id: number;
  project: number;
  task_name: string;
  description: string;
  solution_reference: string;
  owner: string;
  start_date: string;
  due_date: string;
  status: 'not_started' | 'in_progress' | 'completed' | 'blocked' | 'on_hold';
  progress: number;
  dependencies: string;
  resources: string;
  notes: string;
  created_at: string;
}

// Control Phase
export interface ControlPlan {
  id: number;
  project: number;
  title: string;
  process_name: string;
  revision: string;
  status: 'draft' | 'approved';
  effective_date: string;
  created_at: string;
}

export interface ControlPlanItem {
  id: number;
  control_plan: number;
  process_step: string;
  input_output: 'input' | 'output';
  characteristic: string;
  specification: string;
  measurement_method: string;
  sample_size: string;
  frequency: string;
  control_method: string;
  reaction_plan: string;
  responsible: string;
}

export interface ControlChart {
  id: number;
  project: number;
  chart_name: string;
  chart_type: 'x_bar_r' | 'x_bar_s' | 'i_mr' | 'p' | 'np' | 'c' | 'u';
  metric_name: string;
  ucl: number;
  lcl: number;
  center_line: number;
  target: number | null;
  cp: number | null;
  cpk: number | null;
  pp: number | null;
  ppk: number | null;
  is_in_control: boolean;
  total_violations: number;
  data_points: ControlChartData[];
  created_at: string;
}

export interface ControlChartData {
  id: number;
  chart: number;
  timestamp: string;
  value: number;
  subgroup: number;
  is_violation: boolean;
  violation_rule: string;
  notes: string;
}

export interface TollgateReview {
  id: number;
  project: number;
  phase: string;
  review_date: string;
  reviewer: string;
  deliverables_completed: string;
  deliverables_pending: string;
  issues: string;
  recommendations: string;
  decision: 'pending' | 'approved' | 'conditional' | 'rejected';
  next_steps: string;
  created_at: string;
}

export interface ProjectClosure {
  id: number;
  project: number;
  baseline_performance: string;
  final_performance: string;
  improvement_achieved: string;
  financial_benefit: number;
  benefit_type: string;
  lessons_learned: string;
  best_practices: string;
  recommendations: string;
  team_recognition: string;
  handover_notes: string;
  documentation_status: string;
  closure_date: string;
  approved_by: string;
  created_at: string;
}

export interface SPCChart {
  id: number;
  project: number;
  chart_name: string;
  chart_type: string;
  metric_name: string;
  ucl: number;
  lcl: number;
  center_line: number;
  subgroup_size: number;
  data_points: string;
  created_at: string;
}

export interface ProcessMonitor {
  id: number;
  project: number;
  metric_name: string;
  current_value: number;
  target_value: number;
  lower_limit: number;
  upper_limit: number;
  unit: string;
  frequency: string;
  responsible: string;
  last_updated: string;
  status: 'on_target' | 'warning' | 'out_of_control';
  notes: string;
}

export interface SixSigmaDashboard {
  current_phase: string;
  tollgate_status: Record<string, string>;
  baseline_metrics: BaselineMetric[];
  key_improvements: any[];
  open_actions: number;
  risks: any[];
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

export const sixsigmaApi = {
  // -------------------------------------------------------------------------
  // DEFINE PHASE
  // -------------------------------------------------------------------------
  
  // SIPOC
  sipoc: {
    getAll: (projectId: string | number) => 
      api.get<SIPOCDiagram[]>(`/projects/${projectId}/sixsigma/sipoc/`),
    getById: (projectId: string | number, id: number) => 
      api.get<SIPOCDiagram>(`/projects/${projectId}/sixsigma/sipoc/${id}/`),
    create: (projectId: string | number, data: Partial<SIPOCDiagram>) => 
      api.post<SIPOCDiagram>(`/projects/${projectId}/sixsigma/sipoc/`, data),
    update: (projectId: string | number, id: number, data: Partial<SIPOCDiagram>) => 
      api.patch<SIPOCDiagram>(`/projects/${projectId}/sixsigma/sipoc/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/sipoc/${id}/`),
    bulkUpdateItems: (projectId: string | number, id: number, items: Partial<SIPOCItem>[]) =>
      api.post(`/projects/${projectId}/sixsigma/sipoc/${id}/bulk_update_items/`, { items }),
    addItem: (projectId: string | number, id: number, item: Partial<SIPOCItem>) =>
      api.post(`/projects/${projectId}/sixsigma/sipoc/${id}/add_item/`, item),
  },

  sipocItems: {
    getAll: (projectId: string | number) => 
      api.get<SIPOCItem[]>(`/projects/${projectId}/sixsigma/sipoc-items/`),
    create: (projectId: string | number, data: Partial<SIPOCItem>) => 
      api.post<SIPOCItem>(`/projects/${projectId}/sixsigma/sipoc-items/`, data),
    update: (projectId: string | number, id: number, data: Partial<SIPOCItem>) => 
      api.patch<SIPOCItem>(`/projects/${projectId}/sixsigma/sipoc-items/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/sipoc-items/${id}/`),
  },

  // Voice of Customer
  voc: {
    getAll: (projectId: string | number) => 
      api.get<VoiceOfCustomer[]>(`/projects/${projectId}/sixsigma/voc/`),
    getById: (projectId: string | number, id: number) => 
      api.get<VoiceOfCustomer>(`/projects/${projectId}/sixsigma/voc/${id}/`),
    create: (projectId: string | number, data: Partial<VoiceOfCustomer>) => 
      api.post<VoiceOfCustomer>(`/projects/${projectId}/sixsigma/voc/`, data),
    update: (projectId: string | number, id: number, data: Partial<VoiceOfCustomer>) => 
      api.patch<VoiceOfCustomer>(`/projects/${projectId}/sixsigma/voc/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/voc/${id}/`),
    byPriority: (projectId: string | number) =>
      api.get<Record<string, VoiceOfCustomer[]>>(`/projects/${projectId}/sixsigma/voc/by_priority/`),
  },

  // Project Charter
  charter: {
    getAll: (projectId: string | number) => 
      api.get<ProjectCharter[]>(`/projects/${projectId}/sixsigma/charter/`),
    getById: (projectId: string | number, id: number) => 
      api.get<ProjectCharter>(`/projects/${projectId}/sixsigma/charter/${id}/`),
    create: (projectId: string | number, data: Partial<ProjectCharter>) => 
      api.post<ProjectCharter>(`/projects/${projectId}/sixsigma/charter/`, data),
    update: (projectId: string | number, id: number, data: Partial<ProjectCharter>) => 
      api.patch<ProjectCharter>(`/projects/${projectId}/sixsigma/charter/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/charter/${id}/`),
    approve: (projectId: string | number, id: number) =>
      api.post(`/projects/${projectId}/sixsigma/charter/${id}/approve/`, {}),
  },

  // -------------------------------------------------------------------------
  // MEASURE PHASE
  // -------------------------------------------------------------------------

  dataCollection: {
    getAll: (projectId: string | number) => 
      api.get<DataCollectionPlan[]>(`/projects/${projectId}/sixsigma/data-collection/`),
    getById: (projectId: string | number, id: number) => 
      api.get<DataCollectionPlan>(`/projects/${projectId}/sixsigma/data-collection/${id}/`),
    create: (projectId: string | number, data: Partial<DataCollectionPlan>) => 
      api.post<DataCollectionPlan>(`/projects/${projectId}/sixsigma/data-collection/`, data),
    update: (projectId: string | number, id: number, data: Partial<DataCollectionPlan>) => 
      api.patch<DataCollectionPlan>(`/projects/${projectId}/sixsigma/data-collection/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/data-collection/${id}/`),
  },

  metrics: {
    getAll: (projectId: string | number) => 
      api.get<DataCollectionMetric[]>(`/projects/${projectId}/sixsigma/metrics/`),
    create: (projectId: string | number, data: Partial<DataCollectionMetric>) => 
      api.post<DataCollectionMetric>(`/projects/${projectId}/sixsigma/metrics/`, data),
    update: (projectId: string | number, id: number, data: Partial<DataCollectionMetric>) => 
      api.patch<DataCollectionMetric>(`/projects/${projectId}/sixsigma/metrics/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/metrics/${id}/`),
    updateCollected: (projectId: string | number, id: number, collected: number) =>
      api.post(`/projects/${projectId}/sixsigma/metrics/${id}/update_collected/`, { collected_samples: collected }),
  },

  msa: {
    getAll: (projectId: string | number) => 
      api.get<MSAResult[]>(`/projects/${projectId}/sixsigma/msa/`),
    create: (projectId: string | number, data: Partial<MSAResult>) => 
      api.post<MSAResult>(`/projects/${projectId}/sixsigma/msa/`, data),
    update: (projectId: string | number, id: number, data: Partial<MSAResult>) => 
      api.patch<MSAResult>(`/projects/${projectId}/sixsigma/msa/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/msa/${id}/`),
  },

  baseline: {
    getAll: (projectId: string | number) => 
      api.get<BaselineMetric[]>(`/projects/${projectId}/sixsigma/baseline/`),
    create: (projectId: string | number, data: Partial<BaselineMetric>) => 
      api.post<BaselineMetric>(`/projects/${projectId}/sixsigma/baseline/`, data),
    update: (projectId: string | number, id: number, data: Partial<BaselineMetric>) => 
      api.patch<BaselineMetric>(`/projects/${projectId}/sixsigma/baseline/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/baseline/${id}/`),
    updateCurrent: (projectId: string | number, id: number, value: number) =>
      api.post(`/projects/${projectId}/sixsigma/baseline/${id}/update_current/`, { current_value: value }),
  },

  // -------------------------------------------------------------------------
  // ANALYZE PHASE
  // -------------------------------------------------------------------------

  fishbone: {
    getAll: (projectId: string | number) => 
      api.get<FishboneDiagram[]>(`/projects/${projectId}/sixsigma/fishbone/`),
    getById: (projectId: string | number, id: number) => 
      api.get<FishboneDiagram>(`/projects/${projectId}/sixsigma/fishbone/${id}/`),
    create: (projectId: string | number, data: Partial<FishboneDiagram>) => 
      api.post<FishboneDiagram>(`/projects/${projectId}/sixsigma/fishbone/`, data),
    update: (projectId: string | number, id: number, data: Partial<FishboneDiagram>) => 
      api.patch<FishboneDiagram>(`/projects/${projectId}/sixsigma/fishbone/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/fishbone/${id}/`),
  },

  causes: {
    getAll: (projectId: string | number) => 
      api.get<FishboneCause[]>(`/projects/${projectId}/sixsigma/causes/`),
    create: (projectId: string | number, data: Partial<FishboneCause>) => 
      api.post<FishboneCause>(`/projects/${projectId}/sixsigma/causes/`, data),
    update: (projectId: string | number, id: number, data: Partial<FishboneCause>) => 
      api.patch<FishboneCause>(`/projects/${projectId}/sixsigma/causes/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/causes/${id}/`),
    vote: (projectId: string | number, id: number) =>
      api.post(`/projects/${projectId}/sixsigma/causes/${id}/vote/`, {}),
    toggleRootCause: (projectId: string | number, id: number) =>
      api.post(`/projects/${projectId}/sixsigma/causes/${id}/toggle_root_cause/`, {}),
    verify: (projectId: string | number, id: number, method: string) =>
      api.post(`/projects/${projectId}/sixsigma/causes/${id}/verify/`, { verification_method: method }),
  },

  pareto: {
    getAll: (projectId: string | number) => 
      api.get<ParetoAnalysis[]>(`/projects/${projectId}/sixsigma/pareto/`),
    getById: (projectId: string | number, id: number) => 
      api.get<ParetoAnalysis>(`/projects/${projectId}/sixsigma/pareto/${id}/`),
    create: (projectId: string | number, data: Partial<ParetoAnalysis>) => 
      api.post<ParetoAnalysis>(`/projects/${projectId}/sixsigma/pareto/`, data),
    update: (projectId: string | number, id: number, data: Partial<ParetoAnalysis>) => 
      api.patch<ParetoAnalysis>(`/projects/${projectId}/sixsigma/pareto/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/pareto/${id}/`),
  },

  paretoCategories: {
    getAll: (projectId: string | number) => 
      api.get<ParetoCategory[]>(`/projects/${projectId}/sixsigma/pareto-categories/`),
    create: (projectId: string | number, data: Partial<ParetoCategory>) => 
      api.post<ParetoCategory>(`/projects/${projectId}/sixsigma/pareto-categories/`, data),
    update: (projectId: string | number, id: number, data: Partial<ParetoCategory>) => 
      api.patch<ParetoCategory>(`/projects/${projectId}/sixsigma/pareto-categories/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/pareto-categories/${id}/`),
  },

  hypothesis: {
    getAll: (projectId: string | number) => 
      api.get<HypothesisTest[]>(`/projects/${projectId}/sixsigma/hypothesis/`),
    create: (projectId: string | number, data: Partial<HypothesisTest>) => 
      api.post<HypothesisTest>(`/projects/${projectId}/sixsigma/hypothesis/`, data),
    update: (projectId: string | number, id: number, data: Partial<HypothesisTest>) => 
      api.patch<HypothesisTest>(`/projects/${projectId}/sixsigma/hypothesis/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/hypothesis/${id}/`),
    recordResults: (projectId: string | number, id: number, pValue: number, testStatistic: number) =>
      api.post(`/projects/${projectId}/sixsigma/hypothesis/${id}/record_results/`, { 
        p_value: pValue, 
        test_statistic: testStatistic 
      }),
  },

  rootCause: {
    getAll: (projectId: string | number) => 
      api.get<RootCauseAnalysis[]>(`/projects/${projectId}/sixsigma/root-cause/`),
    create: (projectId: string | number, data: Partial<RootCauseAnalysis>) => 
      api.post<RootCauseAnalysis>(`/projects/${projectId}/sixsigma/root-cause/`, data),
    update: (projectId: string | number, id: number, data: Partial<RootCauseAnalysis>) => 
      api.patch<RootCauseAnalysis>(`/projects/${projectId}/sixsigma/root-cause/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/root-cause/${id}/`),
  },

  regression: {
    getAll: (projectId: string | number) => 
      api.get<RegressionAnalysis[]>(`/projects/${projectId}/sixsigma/regression/`),
    create: (projectId: string | number, data: Partial<RegressionAnalysis>) => 
      api.post<RegressionAnalysis>(`/projects/${projectId}/sixsigma/regression/`, data),
    update: (projectId: string | number, id: number, data: Partial<RegressionAnalysis>) => 
      api.patch<RegressionAnalysis>(`/projects/${projectId}/sixsigma/regression/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/regression/${id}/`),
  },

  // -------------------------------------------------------------------------
  // IMPROVE PHASE
  // -------------------------------------------------------------------------

  solutions: {
    getAll: (projectId: string | number) => 
      api.get<Solution[]>(`/projects/${projectId}/sixsigma/solutions/`),
    create: (projectId: string | number, data: Partial<Solution>) => 
      api.post<Solution>(`/projects/${projectId}/sixsigma/solutions/`, data),
    update: (projectId: string | number, id: number, data: Partial<Solution>) => 
      api.patch<Solution>(`/projects/${projectId}/sixsigma/solutions/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/solutions/${id}/`),
    priorityMatrix: (projectId: string | number) =>
      api.get<Record<string, Solution[]>>(`/projects/${projectId}/sixsigma/solutions/priority_matrix/`),
    updateStatus: (projectId: string | number, id: number, status: string) =>
      api.post(`/projects/${projectId}/sixsigma/solutions/${id}/update_status/`, { status }),
  },

  pilots: {
    getAll: (projectId: string | number) => 
      api.get<PilotPlan[]>(`/projects/${projectId}/sixsigma/pilots/`),
    create: (projectId: string | number, data: Partial<PilotPlan>) => 
      api.post<PilotPlan>(`/projects/${projectId}/sixsigma/pilots/`, data),
    update: (projectId: string | number, id: number, data: Partial<PilotPlan>) => 
      api.patch<PilotPlan>(`/projects/${projectId}/sixsigma/pilots/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/pilots/${id}/`),
    recordResults: (projectId: string | number, id: number, pilotValue: number, lessonsLearned: string) =>
      api.post(`/projects/${projectId}/sixsigma/pilots/${id}/record_results/`, { 
        pilot_value: pilotValue, 
        lessons_learned: lessonsLearned 
      }),
  },

  fmea: {
    getAll: (projectId: string | number) => 
      api.get<FMEA[]>(`/projects/${projectId}/sixsigma/fmea/`),
    create: (projectId: string | number, data: Partial<FMEA>) => 
      api.post<FMEA>(`/projects/${projectId}/sixsigma/fmea/`, data),
    update: (projectId: string | number, id: number, data: Partial<FMEA>) => 
      api.patch<FMEA>(`/projects/${projectId}/sixsigma/fmea/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/fmea/${id}/`),
    highRpn: (projectId: string | number, threshold: number = 100) =>
      api.get<FMEA[]>(`/projects/${projectId}/sixsigma/fmea/high_rpn/`, { threshold }),
    recordAction: (projectId: string | number, id: number, data: { 
      action_taken: string; 
      new_severity?: number; 
      new_occurrence?: number; 
      new_detection?: number 
    }) => api.post(`/projects/${projectId}/sixsigma/fmea/${id}/record_action/`, data),
  },

  implementation: {
    getAll: (projectId: string | number) => 
      api.get<ImplementationPlan[]>(`/projects/${projectId}/sixsigma/implementation/`),
    create: (projectId: string | number, data: Partial<ImplementationPlan>) => 
      api.post<ImplementationPlan>(`/projects/${projectId}/sixsigma/implementation/`, data),
    update: (projectId: string | number, id: number, data: Partial<ImplementationPlan>) => 
      api.patch<ImplementationPlan>(`/projects/${projectId}/sixsigma/implementation/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/implementation/${id}/`),
    updateProgress: (projectId: string | number, id: number, progress: number) =>
      api.post(`/projects/${projectId}/sixsigma/implementation/${id}/update_progress/`, { progress }),
  },

  // -------------------------------------------------------------------------
  // CONTROL PHASE
  // -------------------------------------------------------------------------

  controlPlan: {
    getAll: (projectId: string | number) => 
      api.get<ControlPlan[]>(`/projects/${projectId}/sixsigma/control-plan/`),
    getById: (projectId: string | number, id: number) => 
      api.get<ControlPlan>(`/projects/${projectId}/sixsigma/control-plan/${id}/`),
    create: (projectId: string | number, data: Partial<ControlPlan>) => 
      api.post<ControlPlan>(`/projects/${projectId}/sixsigma/control-plan/`, data),
    update: (projectId: string | number, id: number, data: Partial<ControlPlan>) => 
      api.patch<ControlPlan>(`/projects/${projectId}/sixsigma/control-plan/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/control-plan/${id}/`),
    newRevision: (projectId: string | number, id: number) =>
      api.post(`/projects/${projectId}/sixsigma/control-plan/${id}/new_revision/`, {}),
  },

  controlPlanItems: {
    getAll: (projectId: string | number, planId: number) => 
      api.get<ControlPlanItem[]>(`/projects/${projectId}/sixsigma/control-plan/${planId}/items/`),
    create: (projectId: string | number, planId: number, data: Partial<ControlPlanItem>) => 
      api.post<ControlPlanItem>(`/projects/${projectId}/sixsigma/control-plan/${planId}/items/`, data),
    update: (projectId: string | number, planId: number, id: number, data: Partial<ControlPlanItem>) => 
      api.patch<ControlPlanItem>(`/projects/${projectId}/sixsigma/control-plan/${planId}/items/${id}/`, data),
    delete: (projectId: string | number, planId: number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/control-plan/${planId}/items/${id}/`),
  },

  controlCharts: {
    getAll: (projectId: string | number) => 
      api.get<ControlChart[]>(`/projects/${projectId}/sixsigma/control-charts/`),
    getById: (projectId: string | number, id: number) => 
      api.get<ControlChart>(`/projects/${projectId}/sixsigma/control-charts/${id}/`),
    create: (projectId: string | number, data: Partial<ControlChart>) => 
      api.post<ControlChart>(`/projects/${projectId}/sixsigma/control-charts/`, data),
    update: (projectId: string | number, id: number, data: Partial<ControlChart>) => 
      api.patch<ControlChart>(`/projects/${projectId}/sixsigma/control-charts/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/control-charts/${id}/`),
    addDataPoint: (projectId: string | number, id: number, value: number, subgroup?: number, notes?: string) =>
      api.post(`/projects/${projectId}/sixsigma/control-charts/${id}/add_data_point/`, { value, subgroup, notes }),
    violations: (projectId: string | number, id: number) =>
      api.get<ControlChartData[]>(`/projects/${projectId}/sixsigma/control-charts/${id}/violations/`),
    recalculateLimits: (projectId: string | number, id: number) =>
      api.post(`/projects/${projectId}/sixsigma/control-charts/${id}/recalculate_limits/`, {}),
  },

  chartData: {
    getAll: (projectId: string | number) => 
      api.get<ControlChartData[]>(`/projects/${projectId}/sixsigma/chart-data/`),
    create: (projectId: string | number, data: Partial<ControlChartData>) => 
      api.post<ControlChartData>(`/projects/${projectId}/sixsigma/chart-data/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/chart-data/${id}/`),
  },

  spc: {
    getAll: (projectId: string | number) => 
      api.get<SPCChart[]>(`/projects/${projectId}/sixsigma/spc/`),
    getById: (projectId: string | number, id: number) => 
      api.get<SPCChart>(`/projects/${projectId}/sixsigma/spc/${id}/`),
    create: (projectId: string | number, data: Partial<SPCChart>) => 
      api.post<SPCChart>(`/projects/${projectId}/sixsigma/spc/`, data),
    update: (projectId: string | number, id: number, data: Partial<SPCChart>) => 
      api.patch<SPCChart>(`/projects/${projectId}/sixsigma/spc/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/spc/${id}/`),
    addDataPoint: (projectId: string | number, id: number, value: number) =>
      api.post(`/projects/${projectId}/sixsigma/spc/${id}/add_data_point/`, { value }),
  },

  monitoring: {
    getAll: (projectId: string | number) => 
      api.get<ProcessMonitor[]>(`/projects/${projectId}/sixsigma/monitoring/`),
    getById: (projectId: string | number, id: number) => 
      api.get<ProcessMonitor>(`/projects/${projectId}/sixsigma/monitoring/${id}/`),
    create: (projectId: string | number, data: Partial<ProcessMonitor>) => 
      api.post<ProcessMonitor>(`/projects/${projectId}/sixsigma/monitoring/`, data),
    update: (projectId: string | number, id: number, data: Partial<ProcessMonitor>) => 
      api.patch<ProcessMonitor>(`/projects/${projectId}/sixsigma/monitoring/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/monitoring/${id}/`),
  },

  tollgates: {
    getAll: (projectId: string | number) => 
      api.get<TollgateReview[]>(`/projects/${projectId}/sixsigma/tollgates/`),
    getById: (projectId: string | number, id: number) => 
      api.get<TollgateReview>(`/projects/${projectId}/sixsigma/tollgates/${id}/`),
    create: (projectId: string | number, data: Partial<TollgateReview>) => 
      api.post<TollgateReview>(`/projects/${projectId}/sixsigma/tollgates/`, data),
    update: (projectId: string | number, id: number, data: Partial<TollgateReview>) => 
      api.patch<TollgateReview>(`/projects/${projectId}/sixsigma/tollgates/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/tollgates/${id}/`),
    approve: (projectId: string | number, id: number) =>
      api.post(`/projects/${projectId}/sixsigma/tollgates/${id}/approve/`, {}),
    reject: (projectId: string | number, id: number, reason: string) =>
      api.post(`/projects/${projectId}/sixsigma/tollgates/${id}/reject/`, { reason }),
    initialize: (projectId: string | number) =>
      api.post(`/projects/${projectId}/sixsigma/tollgates/initialize/`, {}),
  },

  closure: {
    getAll: (projectId: string | number) => 
      api.get<ProjectClosure[]>(`/projects/${projectId}/sixsigma/closure/`),
    create: (projectId: string | number, data: Partial<ProjectClosure>) => 
      api.post<ProjectClosure>(`/projects/${projectId}/sixsigma/closure/`, data),
    update: (projectId: string | number, id: number, data: Partial<ProjectClosure>) => 
      api.patch<ProjectClosure>(`/projects/${projectId}/sixsigma/closure/${id}/`, data),
    delete: (projectId: string | number, id: number) => 
      api.delete(`/projects/${projectId}/sixsigma/closure/${id}/`),
    approve: (projectId: string | number, id: number) =>
      api.post(`/projects/${projectId}/sixsigma/closure/${id}/approve/`, {}),
  },

  // -------------------------------------------------------------------------
  // DASHBOARD
  // -------------------------------------------------------------------------

  dashboard: {
    get: (projectId: string | number) => 
      api.get<SixSigmaDashboard>(`/projects/${projectId}/sixsigma/dashboard/`),
  },
};

export default sixsigmaApi;