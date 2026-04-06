// API Configuration
export const API_CONFIG = {
  BASE_URL: 'http://localhost:8000/api/',
  TIMEOUT: 30000,
  
  ENDPOINTS: {
    // Auth
    LOGIN: 'auth/login/',
    REGISTER: 'auth/register/',
    REFRESH: 'auth/refresh/',
    PROFILE: 'auth/profile/',
    LOGOUT: 'auth/logout/',
    
    // Projects
    PROJECTS: 'projects/',
    PROJECT_DETAIL: (id: string) => `projects/${id}/`,
    
    // Programs
    PROGRAMS: 'programs/',
    PROGRAM_DETAIL: (id: string) => `programs/${id}/`,
    
    // Risks
    RISKS: 'risks/',
    RISK_DETAIL: (id: string) => `risks/${id}/`,
    
    // Budget
    BUDGET: 'budget/',
    BUDGET_DETAIL: (id: string) => `budget/${id}/`,
    
    // Courses
    COURSES: 'courses/',
    COURSE_DETAIL: (id: string) => `courses/${id}/`,
    
    // Time Tracking
    TIME_TRACKING: 'time-tracking/',
    TIME_TRACKING_DETAIL: (id: string) => `time-tracking/${id}/`,
    
    // Admin - Dashboard
    ADMIN_DASHBOARD_STATS: 'admin/dashboard/stats/',
    ADMIN_MODULES: 'admin/modules/',
    
    // Admin - Users
    ADMIN_USERS: 'admin/users/',
    ADMIN_USERS_STATS: 'admin/users/stats/',
    ADMIN_USER_DETAIL: (id: number) => `admin/users/${id}/`,
    
    // Admin - Activity
    ADMIN_ACTIVITY: 'admin/activity/',
    ADMIN_ACTIVITY_STATS: 'admin/activity/stats/',
    
    // Admin - System
    ADMIN_SYSTEM_INFO: 'admin/system/info/',
    ADMIN_SYSTEM_HEALTH: 'admin/system/health/',
  }
};

// Example usage with the new endpoints:
// const stats = await apiService.get(API_CONFIG.ENDPOINTS.ADMIN_DASHBOARD_STATS);
// const users = await apiService.get(API_CONFIG.ENDPOINTS.ADMIN_USERS);
