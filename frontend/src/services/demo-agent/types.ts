// src/services/demo-agent/types.ts
// Types for ProjectPal Demo Environment

export interface DemoIndustry {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export interface SeedProgress {
  step: string;
  total: number;
  current: number;
  status: 'running' | 'done' | 'error';
  error?: string;
}

export interface DemoStatus {
  has_data: boolean;
  project_count: number;
  active_industry: string | null;
}

export interface DemoSeedResult {
  message: string;
  projects_created: number;
  active_industry: string;
}
