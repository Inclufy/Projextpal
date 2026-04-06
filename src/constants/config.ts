import { Platform } from 'react-native';

// API Configuration
export const API_CONFIG = {
  BASE_URL: __DEV__ 
    ? Platform.OS === 'ios' 
      ? 'http://localhost:8001'
      : 'http://192.168.76.240:8001'
    : 'https://projextpal.com',
  ENDPOINTS: {
    // Auth - Existing
    LOGIN: '/api/v1/auth/login/',
    REGISTER: '/api/v1/auth/register/',
    PROFILE: '/api/v1/auth/user/',
    REFRESH: '/api/v1/auth/token/refresh/',
    
    // Auth - NEW endpoints
    FORGOT_PASSWORD: '/api/v1/auth/forgot-password/',
    RESET_PASSWORD: (token: string) => `/api/v1/auth/reset-password/${token}/`,
    VERIFY_EMAIL: (token: string) => `/api/v1/auth/verify-email/${token}/`,
    RESEND_VERIFICATION: '/api/v1/auth/resend-verification/',
    CHANGE_PASSWORD: '/api/v1/auth/user/change-password/',
    UPDATE_PROFILE: '/api/v1/auth/user/update/',
    
    // Subscription - NEW
    USER_FEATURES: '/api/v1/auth/user-features/',
    SUBSCRIPTION_TIERS: '/api/v1/auth/subscriptions/tiers/',
    USER_SUBSCRIPTION: '/api/v1/auth/subscriptions/user/',
    CREATE_CHECKOUT: '/api/v1/payments/create-checkout-session/',
    
    // Project Management
    PROGRAMS: '/api/v1/programs/',
    PROJECTS: '/api/v1/projects/',
    
    // Projects sub-resources
    BUDGET: '/api/v1/projects/budget/',
    BUDGET_OVERVIEW: '/api/v1/projects/budget/overview/',
    BUDGET_CATEGORIES: '/api/v1/projects/budget-categories/',
    BUDGET_ITEMS: '/api/v1/projects/budget-items/',
    
    RISKS: '/api/v1/projects/risks/',
    TIME_ENTRIES: '/api/v1/projects/time-entries/',
    MILESTONES: '/api/v1/projects/milestones/',
    TASKS: '/api/v1/projects/tasks/',
    EXPENSES: '/api/v1/projects/expenses/',
    
    // Programs sub-resources
    PROGRAM_BUDGET: '/api/v1/programs/budget/',
    PROGRAM_RISKS: '/api/v1/programs/risks/',
    
    // Academy
    COURSES: '/api/v1/academy/courses/',
    ENROLLMENTS: '/api/v1/academy/enrollments/',
    COURSE_MODULES: (courseId: string) => `/api/v1/academy/courses/${courseId}/modules/`,
    LESSONS: (moduleId: number) => `/api/v1/academy/modules/${moduleId}/lessons/`,
    
    // AI
    AI_CHAT: '/api/v1/bot/chats/',
    
    // Admin
    ADMIN_DASHBOARD_STATS: '/api/v1/admin/dashboard/stats/',
    ADMIN_MODULES: '/api/v1/admin/modules/',
    ADMIN_USERS: '/api/v1/admin/users/',
    ADMIN_USERS_STATS: '/api/v1/admin/users/stats/',
    ADMIN_USER_DETAIL: (id: number) => `/api/v1/admin/users/${id}/`,
    ADMIN_ACTIVITY: '/api/v1/admin/activity/',
    ADMIN_ACTIVITY_STATS: '/api/v1/admin/activity/stats/',
    ADMIN_SYSTEM_INFO: '/api/v1/admin/system/info/',
    ADMIN_SYSTEM_HEALTH: '/api/v1/admin/system/health/',
  },
  
  TIMEOUT: 10000,
};

export const APP_CONFIG = {
  NAME: 'ProjeXtPal',
  VERSION: '1.0.1',
  BUNDLE_ID: 'com.inclufy.projextpal',
  
  // Deep linking
  SCHEME: 'projextpal',
  DEEP_LINK_PREFIX: 'projextpal://',
  UNIVERSAL_LINK_PREFIX: 'https://projextpal.com',
};

// Subscription Limits
export const SUBSCRIPTION_LIMITS = {
  trial: {
    max_users: 1,
    max_projects: 1,
    max_programs: 1,
    features: ['basic_pm', 'budget_tracking', 'risk_management'],
  },
  basic: {
    max_users: 5,
    max_projects: 10,
    max_programs: 3,
    features: ['basic_pm', 'budget_tracking', 'risk_management', 'time_tracking'],
  },
  professional: {
    max_users: 20,
    max_projects: 50,
    max_programs: 10,
    features: ['all_basic', 'advanced_analytics', 'team_collaboration', 'custom_reports'],
  },
  enterprise: {
    max_users: -1,
    max_projects: -1,
    max_programs: -1,
    features: ['all_professional', 'priority_support', 'custom_integrations'],
  },
};
