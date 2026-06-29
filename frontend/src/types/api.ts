/**
 * API entity types — mirror the Django REST Framework serializers in
 * backend/projects/serializers.py and backend/programs/serializers.py.
 *
 * Foundation for the no-explicit-any cleanup: these are exported but not yet
 * wired into src/lib/api.ts. A follow-up PR types the api client return values
 * against them and fixes the call sites (verified with the running app).
 *
 * Nullability is conservative (optional/`| null` for fields the serializer
 * does not guarantee); tighten as call sites are migrated.
 */

/** A primary key as accepted by the API for lookups (path params). */
export type Id = string | number;

export interface Subtask {
  id: number;
  task: number;
  title: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: number;
  milestone: number | null;
  milestone_name: string | null;
  work_package: number | null;
  work_package_title: string | null;
  product: number | null;
  product_title: string | null;
  title: string;
  description: string | null;
  category: string | null;
  assigned_to: number | null;
  assigned_to_email: string | null;
  assigned_to_name: string | null;
  assigned_to_role: string | null;
  start_date: string | null;
  due_date: string | null;
  revised_due_date: string | null;
  completed_on: string | null;
  status: string;
  priority: string | null;
  progress: number;
  order_index: number;
  raci_responsible: number | null;
  raci_responsible_email: string | null;
  raci_accountable: number | null;
  raci_accountable_email: string | null;
  raci_consulted_ids: number[];
  raci_informed_ids: number[];
  depends_on: number[];
  depends_on_titles: string[];
  subtasks: Subtask[];
  custom_fields: Record<string, unknown>;
  created_at: string;
  updated_at: string;
  project_id: number | null;
}

export interface Milestone {
  id: number;
  project: number;
  name: string;
  description: string | null;
  start_date: string | null;
  end_date: string | null;
  status: string;
  order_index: number;
  tasks: Task[];
  created_at: string;
  updated_at: string;
}

export interface Expense {
  id: number;
  project: number;
  project_name: string | null;
  description: string | null;
  category: string | null;
  date: string | null;
  amount: number;
  status: string;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: number;
  company: number | null;
  company_logo: string | null;
  portfolio: number | null;
  program: number | null;
  name: string;
  project_type: string | null;
  methodology: string | null;
  budget: number | null;
  currency: string | null;
  start_date: string | null;
  target_implementation_date: string | null;
  end_date: string | null;
  description: string | null;
  project_goal: string | null;
  scope_in: string | null;
  scope_out: string | null;
  problem_impact: string | null;
  proposed_solution: string | null;
  roi_target_pct: number | null;
  roi_realized_pct: number | null;
  status: string;
  progress: number;
  pm_can_authorize: boolean;
  created_by: number | null;
  created_at: string;
  updated_at: string;
  milestones: Milestone[];
  expenses_total: number;
  expenses: Expense[];
  team_members_count: number;
}

export interface TimeEntry {
  id: number;
  project: number;
  project_name: string | null;
  user: number;
  user_name: string | null;
  user_email: string | null;
  task: number | null;
  task_title: string | null;
  milestone: number | null;
  milestone_name: string | null;
  date: string;
  hours: number;
  description: string | null;
  status: string;
  hourly_rate_snapshot: number | null;
  labor_cost: number | null;
  billable: boolean;
  approved_by: number | null;
  approved_by_name: string | null;
  approved_at: string | null;
}

export interface Program {
  id: number;
  name: string;
  description: string | null;
  status: string;
  methodology: string | null;
  company: number | null;
  program_manager: number | null;
  executive_sponsor: number | null;
  created_by: number | null;
  created_at: string;
  updated_at: string;
}

/** Common DRF paginated list envelope. */
export interface Paginated<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
