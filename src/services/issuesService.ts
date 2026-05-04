/**
 * issuesService — mobile bridge to the Django product_issues endpoints
 * (commit a1085d99). Posts shake-triggered issue reports to:
 *   POST /api/v1/product-issues/
 *
 * Token is taken from apiService (SecureStore) so it shares auth with the
 * rest of the app.
 */
import { Platform, Dimensions, AppState } from 'react-native';
import Constants from 'expo-constants';
import { apiService } from './apiService';

export type IssueCategory =
  | 'ui'
  | 'api'
  | 'mobile'
  | 'performance'
  | 'security'
  | 'auth'
  | 'data'
  | 'integration'
  | 'documentation'
  | 'other';

export interface IssueAttachmentInline {
  name: string;
  data_url: string;
  mime: string;
  size_bytes: number;
}

export interface CreateMobileIssueInput {
  company: number;
  title: string;
  description?: string;
  category?: IssueCategory;
  module_context?: string | null;
  reproduction_steps?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  error_trace?: string;
  environment?: Record<string, unknown>;
  capture_method?: string;
}

export interface CreatedIssue {
  id: number;
  company: number;
  title: string;
  status: string;
  created_at: string;
}

/**
 * Map a React-Navigation route name to a ProjeXtPal `module_context` slug.
 * Falls back to the lowercased route name.
 */
export function detectProjeXtPalMobileModule(routeName: string | null): string | null {
  if (!routeName) return 'dashboard';
  const map: Record<string, string> = {
    Home: 'dashboard',
    Dashboard: 'dashboard',
    Projects: 'projects',
    ProjectDetail: 'projects',
    Programs: 'programs',
    ProgramDetail: 'programs',
    Risks: 'risks',
    Issues: 'issues',
    Lessons: 'lessons',
    Assumptions: 'assumptions',
    Sprints: 'scrum',
    Backlog: 'scrum',
    Kanban: 'kanban',
    AgileBoard: 'agile',
    LSS: 'lss',
    PRINCE2: 'prince2',
    Governance: 'governance',
    Reports: 'reports',
    Team: 'team',
    TimeTracking: 'time-tracking',
    Settings: 'settings',
    Login: 'auth',
    Register: 'auth',
  };
  return map[routeName] ?? routeName.toLowerCase();
}

export function captureMobileEnvironment(
  routeName: string | null,
  companyId: number | null
): Record<string, unknown> {
  const w = Dimensions.get('window');
  const buildSha =
    Constants.expoConfig?.extra?.buildSha ??
    process.env.EXPO_PUBLIC_BUILD_SHA ??
    'unknown';
  const appVersion =
    Constants.expoConfig?.version ??
    'unknown';
  const buildNumber =
    Platform.OS === 'ios'
      ? (Constants.expoConfig?.ios?.buildNumber ?? 'unknown')
      : String(Constants.expoConfig?.android?.versionCode ?? 'unknown');

  return {
    route_name: routeName,
    page_url: `projextpal://${routeName ?? '/'}`,
    platform: Platform.OS,
    platform_version: String(Platform.Version ?? 'unknown'),
    viewport: { w: w.width, h: w.height, scale: w.scale },
    captured_at: new Date().toISOString(),
    company_id: companyId,
    app_version: appVersion,
    app_build_number: buildNumber,
    app_build_sha: buildSha,
    app_state: AppState.currentState,
    is_mobile: true,
    module_context: detectProjeXtPalMobileModule(routeName),
  };
}

export async function getCurrentCompanyId(): Promise<number | null> {
  try {
    const me = await apiService.get<{ company?: number | null }>('/users/me/');
    return me?.company ?? null;
  } catch {
    return null;
  }
}

export async function createIssueFromMobile(
  input: CreateMobileIssueInput,
  attachments: IssueAttachmentInline[] = []
): Promise<CreatedIssue> {
  // Django schema doesn't have a JSON `attachments` column; bundle them
  // inside `environment.attachments_inline` so the agent can fetch them.
  const env = input.environment ?? {};
  const payload: CreateMobileIssueInput = {
    ...input,
    environment:
      attachments.length > 0
        ? { ...env, attachments_inline: attachments }
        : env,
  };
  return apiService.post<CreatedIssue>('/product-issues/', payload);
}
