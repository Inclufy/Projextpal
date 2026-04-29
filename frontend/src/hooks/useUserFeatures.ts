import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";

const API_BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:8001/api/v1';

export interface UserFeatures {
  tier: 'trial' | 'starter' | 'professional' | 'team' | 'enterprise';
  features: {
    web_access?: boolean;
    mobile_access?: boolean;
    time_tracking?: boolean;
    teams?: boolean;
    post_project?: boolean;
    program_management?: boolean;
    ai_assistant?: boolean;
    methodology_templates?: boolean;
    gantt_charts?: boolean;
    resource_management?: boolean;
    admin_permissions?: boolean;
    team_dashboards?: boolean;
    sso_saml?: boolean;
    api_access?: boolean;
    custom_workflows?: boolean;
    dedicated_support?: boolean;
    white_label?: boolean;
  };
  limits: {
    max_users: number;
    max_programs: number;
    max_projects: number;
  };
  usage: {
    users: number;
    programs: number;
    projects: number;
  };
  can_create: {
    user: boolean;
    program: boolean;
    project: boolean;
  };
}

// SuperAdmin gets ALL features
const SUPERADMIN_FEATURES: UserFeatures = {
  tier: 'enterprise',
  features: {
    web_access: true,
    mobile_access: true,
    time_tracking: true,
    teams: true,
    post_project: true,
    program_management: true,
    ai_assistant: true,
    methodology_templates: true,
    gantt_charts: true,
    resource_management: true,
    admin_permissions: true,
    team_dashboards: true,
    sso_saml: true,
    api_access: true,
    custom_workflows: true,
    dedicated_support: true,
    white_label: true,
  },
  limits: {
    max_users: -1,
    max_programs: -1,
    max_projects: -1,
  },
  usage: {
    users: 0,
    programs: 0,
    projects: 0,
  },
  can_create: {
    user: true,
    program: true,
    project: true,
  },
};

const fetchUserFeatures = async (): Promise<UserFeatures> => {
  // Check if user is superadmin from localStorage
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      if (user.isSuperAdmin || user.is_superuser || user.role === 'superadmin') {
        console.log('✅ SuperAdmin detected - granting ALL features');
        return SUPERADMIN_FEATURES;
      }
    } catch (e) {
      console.error('Error parsing user:', e);
    }
  }
  
  const token = localStorage.getItem("access_token");
  
  // Try user-features endpoint first
  try {
    const response = await fetch(`${API_BASE_URL}/auth/user-features/`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (response.ok) {
      return response.json();
    }
  } catch (error) {
    console.log('user-features endpoint not available, using fallback');
  }
  
  // Fallback: Get features from user/subscription endpoint
  try {
    const response = await fetch(`${API_BASE_URL}/auth/user/`, {
      headers: { 
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
    });
    
    if (!response.ok) {
      throw new Error("Failed to fetch user data");
    }
    
    const userData = await response.json();
    const subscription = userData.subscription || {};
    const tier = subscription.tier || 'trial';
    
    // Map subscription to features
    return {
      tier: tier as any,
      features: subscription.features || {
        web_access: true,
        mobile_access: tier !== 'trial',
        time_tracking: tier !== 'trial',
        teams: ['team', 'enterprise'].includes(tier),
        post_project: tier !== 'trial',
        program_management: tier !== 'trial',
        ai_assistant: ['professional', 'team', 'enterprise'].includes(tier),
      },
      limits: subscription.limits || {
        max_users: tier === 'trial' ? 1 : tier === 'starter' ? 1 : tier === 'professional' ? 5 : -1,
        max_programs: tier === 'trial' ? 0 : tier === 'starter' ? 1 : -1,
        max_projects: tier === 'trial' ? 1 : tier === 'starter' ? 3 : -1,
      },
      usage: subscription.usage || {
        users: 0,
        programs: 0,
        projects: 0,
      },
      can_create: {
        user: tier !== 'trial',
        program: tier !== 'trial' && tier !== 'starter',
        project: true,
      },
    };
  } catch (error) {
    console.error('Failed to fetch features:', error);
    throw error;
  }
};

export const useUserFeatures = () => {
  return useQuery({
    queryKey: ['user-features'],
    queryFn: fetchUserFeatures,
    staleTime: 5 * 60 * 1000,
    retry: 1,
  });
};

// Helper function to check if user is superadmin
const isSuperAdmin = (): boolean => {
  const userStr = localStorage.getItem("user");
  if (userStr) {
    try {
      const user = JSON.parse(userStr);
      return user.isSuperAdmin || user.is_superuser || user.role === 'superadmin';
    } catch (e) {
      return false;
    }
  }
  return false;
};

// A user's role grants implicit access to its core feature regardless of plan.
// A program manager must always reach /programs even on a free plan; a project
// manager must always reach Team + Post Project; an admin must always reach
// admin features.
const FEATURE_ROLE_GRANTS: Record<string, string[]> = {
  program_management: ['program_manager', 'admin'],
  governance: ['program_manager', 'admin'],
  teams: ['pm', 'project_manager', 'program_manager', 'admin'],
  post_project: ['pm', 'project_manager', 'program_manager', 'admin'],
  time_tracking: ['pm', 'project_manager', 'program_manager', 'admin'],
  admin_permissions: ['admin'],
};

const roleGrantsFeature = (featureName: string): boolean => {
  const userStr = localStorage.getItem("user");
  if (!userStr) return false;
  try {
    const role = JSON.parse(userStr).role;
    return !!role && FEATURE_ROLE_GRANTS[featureName]?.includes(role);
  } catch {
    return false;
  }
};

// Helper functions
export const hasFeature = (features: UserFeatures | undefined, featureName: string): boolean => {
  if (isSuperAdmin()) return true;
  if (roleGrantsFeature(featureName)) return true;
  if (!features) return false;
  return features.features[featureName as keyof typeof features.features] || false;
};

export const canCreate = (features: UserFeatures | undefined, resourceType: 'user' | 'program' | 'project'): boolean => {
  if (isSuperAdmin()) return true;
  if (!features) return false;
  return features.can_create[resourceType] || false;
};

export const getLimit = (features: UserFeatures | undefined, resourceType: 'users' | 'programs' | 'projects'): number => {
  if (isSuperAdmin()) return -1;
  if (!features) return 0;
  return features.limits[`max_${resourceType}` as keyof typeof features.limits] || 0;
};

export const getUsage = (features: UserFeatures | undefined, resourceType: 'users' | 'programs' | 'projects'): number => {
  if (!features) return 0;
  return features.usage[resourceType] || 0;
};

export const isAtLimit = (features: UserFeatures | undefined, resourceType: 'users' | 'programs' | 'projects'): boolean => {
  if (isSuperAdmin()) return false;
  if (!features) return true;
  
  const limit = getLimit(features, resourceType);
  if (limit === -1) return false;
  
  const usage = getUsage(features, resourceType);
  return usage >= limit;
};

export const getTierName = (tier: string): string => {
  const names: Record<string, string> = {
    trial: 'Trial',
    starter: 'Starter',
    professional: 'Professional',
    team: 'Team',
    enterprise: 'Enterprise'
  };
  return names[tier] || tier;
};

export const getTierColor = (tier: string): string => {
  const colors: Record<string, string> = {
    trial: 'bg-yellow-100 text-yellow-800',
    starter: 'bg-blue-100 text-blue-800',
    professional: 'bg-purple-100 text-purple-800',
    team: 'bg-green-100 text-green-800',
    enterprise: 'bg-gray-100 text-gray-800'
  };
  return colors[tier] || 'bg-gray-100 text-gray-800';
};
