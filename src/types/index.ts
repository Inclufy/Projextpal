// ========================================
// PROJECT & PROGRAM MANAGEMENT TYPES
// ========================================

// Program Types
export type ProgramStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';

export interface Program {
  id: string;
  name: string;
  description: string;
  status: ProgramStatus;
  startDate: string;
  endDate: string;
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
  };
  progress: number;
  projectCount: number;
  projects?: Project[];
  manager?: {
    id: string;
    name: string;
    avatar?: string;
  };
  stakeholders?: string[];
  priority: 'Low' | 'Medium' | 'High' | 'Critical';
}

// Project Types
export type ProjectStatus = 'Not Started' | 'Planning' | 'In Progress' | 'On Hold' | 'Completed' | 'Cancelled';
export type ProjectPriority = 'Low' | 'Medium' | 'High' | 'Critical';

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: 'Todo' | 'In Progress' | 'Done';
  priority: ProjectPriority;
  assignee?: {
    id: string;
    name: string;
    avatar?: string;
  };
  startDate?: string;
  dueDate?: string;
  progress: number;
  dependencies?: string[];
}

export interface Milestone {
  id: string;
  title: string;
  date: string;
  status: 'Pending' | 'Completed' | 'Missed';
  description?: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: ProjectStatus;
  priority: ProjectPriority;
  methodology: 'Agile' | 'Scrum' | 'Kanban' | 'Waterfall' | 'PRINCE2' | 'Hybrid';
  startDate: string;
  endDate: string;
  progress: number;
  budget: {
    allocated: number;
    spent: number;
    remaining: number;
  };
  program?: {
    id: string;
    name: string;
  };
  manager?: {
    id: string;
    name: string;
    avatar?: string;
  };
  team?: Array<{
    id: string;
    name: string;
    role: string;
    avatar?: string;
  }>;
  tasks?: Task[];
  milestones?: Milestone[];
  risks?: Risk[];
}

// Budget Types
export interface BudgetItem {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  remaining: number;
  percentage: number;
}

export interface BudgetOverview {
  totalAllocated: number;
  totalSpent: number;
  totalRemaining: number;
  categories: BudgetItem[];
  monthlySpend: Array<{
    month: string;
    amount: number;
  }>;
  programs: Array<{
    id: string;
    name: string;
    budget: number;
    spent: number;
  }>;
}

// Risk Types
export type RiskProbability = 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
export type RiskImpact = 'Very Low' | 'Low' | 'Medium' | 'High' | 'Very High';
export type RiskStatus = 'Identified' | 'Assessed' | 'Mitigated' | 'Closed';

export interface Risk {
  id: string;
  title: string;
  description: string;
  category: string;
  probability: RiskProbability;
  impact: RiskImpact;
  score: number; // probability x impact (1-25)
  status: RiskStatus;
  mitigation?: string;
  owner?: {
    id: string;
    name: string;
    avatar?: string;
  };
  project?: {
    id: string;
    name: string;
  };
  identifiedDate: string;
  reviewDate?: string;
}

// User Types
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
  role?: string;
  avatar?: string;
}

// Auth Types
export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

// Course Types
export interface Lesson {
  id: string;
  title: string;
  duration: string;
  type: 'video' | 'quiz' | 'assignment' | 'exam';
  completed?: boolean;
}

export interface Module {
  id: string;
  title: string;
  description: string;
  lessons: Lesson[];
  progress?: number;
}

export interface Course {
  id: string;
  title: string;
  subtitle?: string;
  description: string;
  category: string;
  methodology: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  language: string;
  price: number;
  duration: string;
  instructor?: {
    name: string;
    avatar?: string;
  };
  featured?: boolean;
  bestseller?: boolean;
  certificate?: boolean;
  modules: Module[];
  totalLessons: number;
  completedLessons?: number;
  progress?: number;
  enrolledAt?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  message?: string;
  success: boolean;
}

export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  status?: number;
}