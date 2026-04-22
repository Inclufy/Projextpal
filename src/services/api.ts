import { Platform } from 'react-native';
import Constants from 'expo-constants';

// API Configuration
// Dev base URL can be overridden via:
//   - EXPO_PUBLIC_API_URL env var
//   - expo-constants expoConfig.extra.apiUrl
//   - expoConfig.hostUri (Metro bundler IP) → falls back to the machine running Metro
// Production always points at projextpal.com.
const devHostUri = (Constants.expoConfig as any)?.hostUri as string | undefined;
const devLanIp = devHostUri ? devHostUri.split(':')[0] : undefined;
const ENV_API_URL =
  (process.env.EXPO_PUBLIC_API_URL as string | undefined) ||
  ((Constants.expoConfig as any)?.extra?.apiUrl as string | undefined);

const iosDev = ENV_API_URL || 'http://localhost:8001';
const androidDev =
  ENV_API_URL ||
  (devLanIp ? `http://${devLanIp}:8001` : 'http://10.0.2.2:8001');

export const API_CONFIG = {
  BASE_URL: __DEV__
    ? Platform.OS === 'ios'
      ? iosDev
      : androidDev
    : 'https://projextpal.com',
  ENDPOINTS: {
    // Auth
    LOGIN: '/api/v1/auth/login/',
    REGISTER: '/api/v1/auth/register/',
    PROFILE: '/api/v1/auth/user/',
    REFRESH: '/api/v1/auth/token/refresh/',
    
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
    
    // Admin - Dashboard
    ADMIN_DASHBOARD_STATS: '/api/v1/admin/dashboard/stats/',
    ADMIN_MODULES: '/api/v1/admin/modules/',
    
    // Admin - Users
    ADMIN_USERS: '/api/v1/admin/users/',
    ADMIN_USERS_STATS: '/api/v1/admin/users/stats/',
    ADMIN_USER_DETAIL: (id: number) => `/api/v1/admin/users/${id}/`,
    
    // Admin - Activity
    ADMIN_ACTIVITY: '/api/v1/admin/activity/',
    ADMIN_ACTIVITY_STATS: '/api/v1/admin/activity/stats/',
    
    // Admin - System
    ADMIN_SYSTEM_INFO: '/api/v1/admin/system/info/',
    ADMIN_SYSTEM_HEALTH: '/api/v1/admin/system/health/',
  },
  
  TIMEOUT: 10000,
};

export const APP_CONFIG = {
  NAME: 'ProjeXtPal',
  VERSION: '1.0.0',
  BUNDLE_ID: 'com.inclufy.projextpal',
};
