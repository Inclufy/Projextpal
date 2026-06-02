// =============================================================================
// copilotIssues — frontend helpers for the AI Copilot "Issues" tab.
//
// Talks to the Django product_issues app shipped on 2026-05-04 (commit
// a1085d99). Endpoints:
//   POST /api/v1/product-issues/                  user create
//   POST /api/v1/product-issues/{id}/triage/      agent posts result
//   POST /api/v1/product-issues/{id}/comment/     thread
//   POST /api/v1/product-issues/auto/ci/          CI auto-POST
// =============================================================================

import { api } from "@/lib/api";

/* ─── Types ──────────────────────────────────────────────────────────────── */

export type IssueCategory =
  | "ui"
  | "api"
  | "mobile"
  | "performance"
  | "security"
  | "auth"
  | "data"
  | "integration"
  | "documentation"
  | "other";

export type IssueClassification =
  | "bug"
  | "error"
  | "functionality"
  | "best-practice"
  | "missing-feature"
  | "duplicate"
  | "user-error"
  | "not-applicable";

export type IssueSeverity = "blocker" | "critical" | "major" | "minor" | "trivial";
export type IssuePriority = "P0" | "P1" | "P2" | "P3";
export type IssueStatus =
  | "new"
  | "triaging"
  | "needs-info"
  | "accepted"
  | "in-progress"
  | "resolved"
  | "wont-fix"
  | "duplicate"
  | "closed";

export interface IssueAttachment {
  name: string;
  data_url?: string;
  mime: string;
  size_bytes: number;
}

export interface ProductIssueRecord {
  id: number;
  company: number;
  reporter: number | null;
  source: string;
  capture_method: string;
  title: string;
  description: string;
  reproduction_steps: string;
  expected_behavior: string;
  actual_behavior: string;
  error_trace: string;
  environment: Record<string, unknown>;
  category: IssueCategory;
  classification: IssueClassification | "";
  severity: IssueSeverity | "";
  priority: IssuePriority | "";
  status: IssueStatus;
  triaged_at: string | null;
  triaged_by: string;
  reproduction_attempted_at: string | null;
  reproduction_result: string;
  reproduction_log?: unknown[];
  resolution_summary: string;
  agent_triage_result?: Record<string, unknown> | null;
  linked_pr_url?: string;
  created_at: string;
  updated_at: string;
}

export interface ProductIssueComment {
  id: number;
  issue: number;
  author: string;
  body: string;
  is_triage_step: boolean;
  /** Inline attachments — same shape as IssueAttachment. Set by
   * reporters who reply to needs-info questions with a screenshot. */
  attachments?: IssueAttachment[];
  /**
   * Audience for this comment row:
   * - "public"   = reporter + everyone with issue access sees it
   * - "internal" = admin + superadmin only (dev jargon — file paths,
   *                Sentry queries, fix hints). Filtered out by the
   *                backend serializer for non-staff viewers, so a
   *                reporter never receives an internal row in the API
   *                response. Admin viewers DO receive it and the UI
   *                renders an "Internal" badge.
   */
  visibility?: "public" | "internal";
  created_at: string;
}

export interface CreateIssueInput {
  company: number;
  title: string;
  description?: string;
  category?: IssueCategory;
  reproduction_steps?: string;
  expected_behavior?: string;
  actual_behavior?: string;
  error_trace?: string;
  environment?: Record<string, unknown>;
  capture_method?: string;
  project?: number | null;
}

interface ListResponse<T> {
  count?: number;
  results?: T[];
}

/* ─── Module detection (ProjeXtPal-specific) ───────────────────────────── */

/**
 * Map current pathname to a ProjeXtPal `module_context` slug. Stored in
 * environment.module_context — the Django backend doesn't have a dedicated
 * column (unlike the Supabase schema) but this still helps the agent route.
 */
export function detectProjeXtPalModuleFromPath(pathname: string): string | null {
  const first = pathname.split("/").filter(Boolean)[0];
  const seg = first ? `/${first}` : "/";
  const map: Record<string, string> = {
    "/": "dashboard",
    "/dashboard": "dashboard",
    "/projects": "projects",
    "/programs": "programs",
    "/post-project": "projects",
    "/risks": "risks",
    "/issues": "issues",
    "/assumptions": "assumptions",
    "/lessons": "lessons",
    "/scrum": "scrum",
    "/agile": "agile",
    "/kanban": "kanban",
    "/lss": "lss",
    "/prince2": "prince2",
    "/waterfall": "waterfall",
    "/governance": "governance",
    "/team": "team",
    "/time-tracking": "time-tracking",
    "/reports": "reports",
    "/integrations": "integrations",
    "/admin": "admin",
    "/ai-assistant": "ai-assistant",
    "/onboarding": "onboarding",
    "/setup-onboarding": "onboarding",
    "/settings": "settings",
    "/checkout": "billing",
    "/pricing": "billing",
    "/training": "academy",
    "/surveys": "surveys",
    "/demo": "demo",
  };
  if (map[seg]) return map[seg];
  const stripped = seg.replace("/", "");
  return stripped || null;
}

export function defaultCategoryForModule(module: string | null): IssueCategory {
  if (!module) return "other";
  const map: Record<string, IssueCategory> = {
    integrations: "integration",
    "time-tracking": "data",
    reports: "performance",
    risks: "data",
    issues: "data",
    assumptions: "data",
    lessons: "data",
    settings: "auth",
    admin: "auth",
    governance: "security",
    billing: "integration",
  };
  return map[module] ?? "ui";
}

/* ─── Environment capture ───────────────────────────────────────────────── */

export function captureEnvironment(
  pathname: string,
  companyId: number | null
): Record<string, unknown> {
  const buildSha =
    (import.meta as unknown as { env?: { VITE_BUILD_SHA?: string } })?.env
      ?.VITE_BUILD_SHA ?? "unknown";
  const appVersion =
    (import.meta as unknown as { env?: { VITE_APP_VERSION?: string } })?.env
      ?.VITE_APP_VERSION ?? "unknown";

  return {
    page_url: typeof window !== "undefined" ? window.location.href : pathname,
    pathname,
    module_context: detectProjeXtPalModuleFromPath(pathname),
    user_agent:
      typeof navigator !== "undefined" ? navigator.userAgent : "server",
    language:
      typeof navigator !== "undefined" ? navigator.language : "unknown",
    viewport:
      typeof window !== "undefined"
        ? { w: window.innerWidth, h: window.innerHeight }
        : null,
    timezone:
      typeof Intl !== "undefined"
        ? Intl.DateTimeFormat().resolvedOptions().timeZone
        : "unknown",
    captured_at: new Date().toISOString(),
    company_id: companyId,
    app_build_sha: buildSha,
    app_version: appVersion,
  };
}

/* ─── API ────────────────────────────────────────────────────────────────── */

/** 15-second timeout cap so the UI can't sit on "Versturen..." forever
 *  when the backend's synchronous email step (now backgrounded via
 *  threading) ever wedges again, OR when a >1MB base64 attachment
 *  body genuinely takes a while. See BUG-031. */
const CREATE_ISSUE_TIMEOUT_MS = 15_000;

export function createIssue(input: CreateIssueInput): Promise<ProductIssueRecord> {
  return api.post<ProductIssueRecord>("/product-issues/", input, {
    timeoutMs: CREATE_ISSUE_TIMEOUT_MS,
  });
}

export async function listRecentIssues(
  limit = 20
): Promise<ProductIssueRecord[]> {
  const data = await api.get<ListResponse<ProductIssueRecord> | ProductIssueRecord[]>(
    "/product-issues/",
    { page_size: limit }
  );
  if (Array.isArray(data)) return data;
  return data.results ?? [];
}

export function addComment(
  issueId: number,
  body: string,
  attachments: IssueAttachment[] = [],
): Promise<unknown> {
  // Backend accepts either body or attachments (or both). Empty bodies
  // are valid if the reporter is just attaching a screenshot in
  // response to a needs-info question.
  return api.post(`/product-issues/${issueId}/comment/`, {
    body,
    attachments,
  });
}

/** Fetch full issue (Django detail response includes nested comments). */
export async function fetchIssueDetail(
  issueId: number
): Promise<{ issue: ProductIssueRecord; comments: ProductIssueComment[] }> {
  const issue = await api.get<ProductIssueRecord & { comments?: ProductIssueComment[] }>(
    `/product-issues/${issueId}/`
  );
  const comments = issue.comments ?? [];
  return { issue, comments };
}

/* ─── File / clipboard helpers ─────────────────────────────────────────── */

export async function fileToAttachment(file: File): Promise<IssueAttachment> {
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
  return {
    name: file.name,
    data_url: dataUrl,
    mime: file.type || "application/octet-stream",
    size_bytes: file.size,
  };
}

/* ─── Visual helpers ─────────────────────────────────────────────────────── */

export function statusBadgeClass(status: IssueStatus | string): string {
  const map: Record<string, string> = {
    new: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-200",
    triaging: "bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-200",
    "needs-info": "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-200",
    accepted: "bg-cyan-100 text-cyan-800 dark:bg-cyan-950 dark:text-cyan-200",
    "in-progress": "bg-indigo-100 text-indigo-800 dark:bg-indigo-950 dark:text-indigo-200",
    resolved: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-200",
    "wont-fix": "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    duplicate: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
    closed: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  };
  return map[status] ?? "bg-gray-100 text-gray-700";
}

export function priorityBadgeClass(priority: string): string {
  const map: Record<string, string> = {
    P0: "bg-red-600 text-white",
    P1: "bg-orange-500 text-white",
    P2: "bg-yellow-500 text-white",
    P3: "bg-slate-400 text-white",
  };
  return map[priority] ?? "bg-gray-100 text-gray-600";
}
