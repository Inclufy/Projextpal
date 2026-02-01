// ============================================================
// PROJEXTPAL ADMIN PORTAL - TYPES & INTERFACES
// Complete type definitions for the admin portal
// ============================================================

// =========================
// USER MANAGEMENT TYPES
// =========================

export type UserRole = 'USER' | 'ADMIN' | 'SUPER_ADMIN';
export type UserStatus = 'ACTIVE' | 'INACTIVE' | 'PENDING' | 'SUSPENDED' | 'DELETED';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  
  role: UserRole;
  status: UserStatus;
  isSuperAdmin: boolean;
  
  organizationId?: string;
  organizationName?: string;
  jobTitle?: string;
  department?: string;
  
  // Settings
  language: 'en' | 'nl';
  timezone: string;
  
  // Dates
  emailVerifiedAt?: string;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Stats
  projectCount?: number;
  programCount?: number;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  pendingUsers: number;
  suspendedUsers: number;
  
  newUsersThisMonth: number;
  activeUsersToday: number;
  
  roleDistribution: {
    user: number;
    admin: number;
    superAdmin: number;
  };
  
  topOrganizations: Array<{
    id: string;
    name: string;
    userCount: number;
  }>;
}

export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource: string;
  details?: string;
  ipAddress?: string;
  userAgent?: string;
  createdAt: string;
}

// =========================
// TENANT/ORGANIZATION TYPES
// =========================

export type TenantStatus = 'ACTIVE' | 'TRIAL' | 'SUSPENDED' | 'CANCELLED';
export type TenantPlan = 'starter' | 'professional' | 'enterprise' | 'custom';

export interface Tenant {
  id: string;
  name: string;
  slug: string;
  logo?: string;
  
  status: TenantStatus;
  plan: TenantPlan;
  
  // Contact
  email: string;
  phone?: string;
  website?: string;
  
  // Address
  address?: string;
  city?: string;
  country?: string;
  postalCode?: string;
  
  // Billing
  vatNumber?: string;
  billingEmail?: string;
  
  // Settings
  settings: TenantSettings;
  
  // Limits (from subscription)
  maxProjects: number;
  maxPrograms: number;
  maxUsers: number;
  maxStorage: number;
  
  // Current usage
  currentProjects: number;
  currentPrograms: number;
  currentUsers: number;
  currentStorage: number;
  
  // Dates
  trialEndsAt?: string;
  createdAt: string;
  updatedAt: string;
  
  // Relations
  ownerId: string;
  ownerName?: string;
  subscriptionId?: string;
}

export interface TenantSettings {
  // Branding
  primaryColor?: string;
  accentColor?: string;
  logoUrl?: string;
  faviconUrl?: string;
  
  // Features
  enabledFeatures: string[];
  disabledFeatures: string[];
  
  // Defaults
  defaultLanguage: 'en' | 'nl';
  defaultTimezone: string;
  defaultMethodology?: string;
  
  // Security
  enforceSSO: boolean;
  ssoProvider?: string;
  allowedDomains?: string[];
  requireMFA: boolean;
  sessionTimeout: number; // minutes
  
  // Notifications
  emailNotifications: boolean;
  slackIntegration: boolean;
  webhookUrl?: string;
}

export interface TenantStats {
  totalTenants: number;
  activeTenants: number;
  trialTenants: number;
  suspendedTenants: number;
  
  newTenantsThisMonth: number;
  churnedTenantsThisMonth: number;
  
  planDistribution: {
    starter: number;
    professional: number;
    enterprise: number;
    custom: number;
  };
  
  totalRevenue: number;
  averageRevenuePerTenant: number;
}

// =========================
// INTEGRATION TYPES
// =========================

export type IntegrationCategory = 
  | 'authentication'
  | 'storage'
  | 'communication'
  | 'project_management'
  | 'time_tracking'
  | 'calendar'
  | 'payment'
  | 'analytics'
  | 'ai'
  | 'other';

export type IntegrationStatus = 'available' | 'enabled' | 'disabled' | 'error' | 'coming_soon';

export interface Integration {
  id: string;
  name: string;
  slug: string;
  description: string;
  descriptionNL?: string;
  
  category: IntegrationCategory;
  status: IntegrationStatus;
  
  icon: string;
  logoUrl?: string;
  websiteUrl?: string;
  docsUrl?: string;
  
  // Configuration
  requiredScopes?: string[];
  configFields: IntegrationConfigField[];
  
  // Settings
  isGlobal: boolean; // Available to all tenants
  isPremium: boolean; // Requires paid plan
  isEnterprise: boolean; // Enterprise only
  isBeta: boolean;
  
  // Stats
  enabledCount?: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationConfigField {
  key: string;
  label: string;
  labelNL?: string;
  type: 'text' | 'password' | 'url' | 'email' | 'select' | 'toggle' | 'textarea';
  required: boolean;
  placeholder?: string;
  options?: Array<{ value: string; label: string }>;
  helpText?: string;
  helpTextNL?: string;
}

export interface TenantIntegration {
  id: string;
  tenantId: string;
  integrationId: string;
  integration?: Integration;
  
  enabled: boolean;
  config: Record<string, any>;
  
  // OAuth
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string;
  
  // Status
  lastSyncAt?: string;
  lastError?: string;
  errorCount: number;
  
  createdAt: string;
  updatedAt: string;
}

export interface IntegrationStats {
  totalIntegrations: number;
  enabledIntegrations: number;
  
  byCategory: Record<IntegrationCategory, number>;
  
  mostPopular: Array<{
    id: string;
    name: string;
    enabledCount: number;
  }>;
  
  recentErrors: Array<{
    integrationName: string;
    tenantName: string;
    error: string;
    occurredAt: string;
  }>;
}

// =========================
// AUDIT LOG TYPES
// =========================

export type AuditAction = 
  | 'CREATE'
  | 'UPDATE'
  | 'DELETE'
  | 'LOGIN'
  | 'LOGOUT'
  | 'EXPORT'
  | 'IMPORT'
  | 'ENABLE'
  | 'DISABLE'
  | 'SUSPEND'
  | 'ACTIVATE';

export interface AuditLog {
  id: string;
  
  userId: string;
  userName?: string;
  userEmail?: string;
  
  tenantId?: string;
  tenantName?: string;
  
  action: AuditAction;
  resource: string;
  resourceId?: string;
  
  details?: Record<string, any>;
  previousValue?: Record<string, any>;
  newValue?: Record<string, any>;
  
  ipAddress?: string;
  userAgent?: string;
  
  createdAt: string;
}

// =========================
// SYSTEM SETTINGS TYPES
// =========================

export interface SystemSettings {
  // General
  appName: string;
  appUrl: string;
  supportEmail: string;
  
  // Features
  maintenanceMode: boolean;
  maintenanceMessage?: string;
  registrationEnabled: boolean;
  trialEnabled: boolean;
  trialDays: number;
  
  // Limits
  defaultMaxProjects: number;
  defaultMaxPrograms: number;
  defaultMaxUsers: number;
  defaultMaxStorage: number;
  
  // Email
  emailProvider: 'smtp' | 'sendgrid' | 'ses' | 'postmark';
  emailFromAddress: string;
  emailFromName: string;
  
  // Storage
  storageProvider: 'local' | 's3' | 'gcs' | 'azure';
  maxUploadSize: number; // MB
  allowedFileTypes: string[];
  
  // Security
  passwordMinLength: number;
  passwordRequireUppercase: boolean;
  passwordRequireNumbers: boolean;
  passwordRequireSymbols: boolean;
  maxLoginAttempts: number;
  lockoutDuration: number; // minutes
  sessionTimeout: number; // minutes
  
  // AI
  aiProvider: 'openai' | 'anthropic' | 'azure_openai';
  aiModel: string;
  aiMaxTokens: number;
  aiEnabled: boolean;
}

// =========================
// DASHBOARD TYPES
// =========================

export interface AdminDashboardStats {
  users: UserStats;
  tenants: TenantStats;
  integrations: IntegrationStats;
  
  revenue: {
    mrr: number;
    arr: number;
    growth: number;
  };
  
  system: {
    uptime: number;
    responseTime: number;
    errorRate: number;
    activeConnections: number;
  };
  
  recentActivity: AuditLog[];
}

// =========================
// HELPER FUNCTIONS
// =========================

export function getUserStatusColor(status: UserStatus): string {
  const colors: Record<UserStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    INACTIVE: 'bg-gray-100 text-gray-800',
    PENDING: 'bg-yellow-100 text-yellow-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    DELETED: 'bg-gray-100 text-gray-500',
  };
  return colors[status] || colors.INACTIVE;
}

export function getUserRoleColor(role: UserRole): string {
  const colors: Record<UserRole, string> = {
    USER: 'bg-blue-100 text-blue-800',
    ADMIN: 'bg-purple-100 text-purple-800',
    SUPER_ADMIN: 'bg-amber-100 text-amber-800',
  };
  return colors[role] || colors.USER;
}

export function getTenantStatusColor(status: TenantStatus): string {
  const colors: Record<TenantStatus, string> = {
    ACTIVE: 'bg-green-100 text-green-800',
    TRIAL: 'bg-blue-100 text-blue-800',
    SUSPENDED: 'bg-red-100 text-red-800',
    CANCELLED: 'bg-gray-100 text-gray-500',
  };
  return colors[status] || colors.ACTIVE;
}

export function getIntegrationCategoryColor(category: IntegrationCategory): string {
  const colors: Record<IntegrationCategory, string> = {
    authentication: 'bg-purple-100 text-purple-800',
    storage: 'bg-blue-100 text-blue-800',
    communication: 'bg-green-100 text-green-800',
    project_management: 'bg-orange-100 text-orange-800',
    time_tracking: 'bg-cyan-100 text-cyan-800',
    calendar: 'bg-pink-100 text-pink-800',
    payment: 'bg-emerald-100 text-emerald-800',
    analytics: 'bg-indigo-100 text-indigo-800',
    ai: 'bg-violet-100 text-violet-800',
    other: 'bg-gray-100 text-gray-800',
  };
  return colors[category] || colors.other;
}

export function getIntegrationStatusColor(status: IntegrationStatus): string {
  const colors: Record<IntegrationStatus, string> = {
    available: 'bg-gray-100 text-gray-800',
    enabled: 'bg-green-100 text-green-800',
    disabled: 'bg-gray-100 text-gray-500',
    error: 'bg-red-100 text-red-800',
    coming_soon: 'bg-blue-100 text-blue-800',
  };
  return colors[status] || colors.available;
}

export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export function formatDate(date: string | Date, locale: string = 'nl-NL'): string {
  return new Date(date).toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatDateTime(date: string | Date, locale: string = 'nl-NL'): string {
  return new Date(date).toLocaleString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}
export function formatPrice(amount: number, currency: string = 'EUR'): string {
  return new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: currency,
  }).format(amount);
}