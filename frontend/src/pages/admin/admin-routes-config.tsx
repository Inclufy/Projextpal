// ============================================================
// ADMIN PORTAL ROUTES
// Add these routes to your App.tsx or router configuration
// ============================================================

import { lazy } from 'react';

// Lazy load admin pages
const AdminDashboard = lazy(() => import('@/pages/admin/AdminDashboard'));
const UserManagement = lazy(() => import('@/pages/admin/UserManagement'));
const TenantManagement = lazy(() => import('@/pages/admin/TenantManagement'));
const PlanManagement = lazy(() => import('@/pages/admin/PlanManagement'));
const IntegrationManagement = lazy(() => import('@/pages/admin/IntegrationManagement'));
const SystemSettings = lazy(() => import('@/pages/admin/SystemSettings'));
const AuditLogs = lazy(() => import('@/pages/admin/AuditLogs'));

// Admin routes configuration
export const adminRoutes = [
  {
    path: '/admin',
    element: <AdminDashboard />,
    title: 'Admin Dashboard',
  },
  {
    path: '/admin/users',
    element: <UserManagement />,
    title: 'User Management',
  },
  {
    path: '/admin/tenants',
    element: <TenantManagement />,
    title: 'Tenant Management',
  },
  {
    path: '/admin/plans',
    element: <PlanManagement />,
    title: 'Plan Management',  // ← NEW
  },
  {
    path: '/admin/integrations',
    element: <IntegrationManagement />,
    title: 'Integration Management',
  },
  {
    path: '/admin/settings',
    element: <SystemSettings />,
    title: 'System Settings',
  },
  {
    path: '/admin/logs',
    element: <AuditLogs />,
    title: 'Audit Logs',
  },
];

// ============================================================
// ADD TO APP.TSX - Example integration:
// ============================================================
/*

import PlanManagement from '@/pages/admin/PlanManagement';

// In your Routes:
<Route path="/admin/plans" element={
  <ProtectedRoute requireSuperAdmin>
    <PlanManagement />
  </ProtectedRoute>
} />

*/

// ============================================================
// ADMIN SIDEBAR NAVIGATION
// Update your AdminSidebar to include Plans link
// ============================================================

import { 
  LayoutDashboard, 
  Users, 
  Building, 
  CreditCard,  // ← For Plans
  Plug, 
  Settings, 
  FileText 
} from 'lucide-react';

export const adminNavItems = [
  {
    title: 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: 'Users',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: 'Organizations',
    url: '/admin/tenants',
    icon: Building,
  },
  {
    title: 'Plans & Pricing',  // ← NEW
    url: '/admin/plans',
    icon: CreditCard,
  },
  {
    title: 'Integrations',
    url: '/admin/integrations',
    icon: Plug,
  },
  {
    title: 'Settings',
    url: '/admin/settings',
    icon: Settings,
  },
  {
    title: 'Audit Logs',
    url: '/admin/logs',
    icon: FileText,
  },
];
