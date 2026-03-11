export type StepStatus = 'passed' | 'failed' | 'skipped' | 'running';
export type IssueSeverity = 'critical' | 'major' | 'minor' | 'info';
export type IssueType = 'bug' | 'missing_feature' | 'ui_issue' | 'a11y' | 'performance' | 'console_error';

export interface StepResult {
  name: string;
  status: StepStatus;
  duration: number;
  error?: string;
  screenshot?: string;
}

export interface Issue {
  type: IssueType;
  severity: IssueSeverity;
  title: string;
  description: string;
  page: string;
  screenshot?: string;
  suggestion?: string;
}

export interface PageAudit {
  url: string;
  title: string;
  status: 'ok' | 'error' | 'warning';
  loadTime: number;
  screenshot?: string;
  consoleErrors: string[];
  missingElements: string[];
  issues: Issue[];
}

export interface ScenarioResult {
  id: string;
  name: string;
  app: string;
  status: 'passed' | 'failed' | 'skipped';
  steps: StepResult[];
  issues: Issue[];
  duration: number;
  startedAt: string;
  finishedAt: string;
}

export interface TestReport {
  agent: string;
  version: string;
  app: string;
  environment: string;
  startedAt: string;
  finishedAt: string;
  duration: number;
  summary: {
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    issuesFound: number;
    bugCount: number;
    missingFeatureCount: number;
  };
  scenarios: ScenarioResult[];
  pageAudits: PageAudit[];
  allIssues: Issue[];
}

export interface AppConfig {
  name: string;
  baseUrl: string;
  apiUrl: string;
  credentials: {
    email: string;
    password: string;
  };
}

export interface AgentConfig {
  headless: boolean;
  screenshotOnBugOnly: boolean;
  videoOnFailure: boolean;
  reportOutput: string;
  timeoutMs: number;
  retryCount: number;
  crawlScreens: boolean;
}

export interface Scenario {
  id: string;
  name: string;
  app: string;
  description: string;
  tags: string[];
  steps: ScenarioStep[];
}

export interface ScenarioStep {
  name: string;
  action: (ctx: ScenarioContext) => Promise<void>;
}

export interface ScenarioContext {
  page: any; // Playwright Page
  api: ApiClient;
  app: AppConfig;
  config: AgentConfig;
  data: Record<string, any>;
  issues: Issue[];
  log: (message: string) => void;
  reportIssue: (issue: Omit<Issue, 'page'>) => void;
  takeScreenshot: (name: string) => Promise<string | undefined>;
}

export interface ApiClient {
  get: (path: string, options?: RequestOptions) => Promise<ApiResponse>;
  post: (path: string, body?: any, options?: RequestOptions) => Promise<ApiResponse>;
  put: (path: string, body?: any, options?: RequestOptions) => Promise<ApiResponse>;
  patch: (path: string, body?: any, options?: RequestOptions) => Promise<ApiResponse>;
  delete: (path: string, options?: RequestOptions) => Promise<ApiResponse>;
  setToken: (token: string) => void;
}

interface RequestOptions {
  headers?: Record<string, string>;
}

export interface ApiResponse {
  status: number;
  ok: boolean;
  data: any;
  headers: Record<string, string>;
}
