// ============================================================
// ADMIN PORTAL ROUTE CONFIGURATION
// React Router setup for the admin portal
// ============================================================

import { lazy, Suspense } from 'react';
import { RouteObject, Navigate } from 'react-router-dom';

// Layout
import AdminPortalLayout from './AdminPortalLayout';

// Lazy-loaded pages for code splitting
const AdminDashboard = lazy(() => import('./AdminDashboard'));
const UserManagement = lazy(() => import('./UserManagement'));
const TenantManagement = lazy(() => import('./OrganizationManagement'));
const InvoiceManagement = lazy(() => import('./InvoiceManagement'));
const IntegrationManagement = lazy(() => import('./IntegrationManagement'));
const AuditLogs = lazy(() => import('./AuditLogs'));
const SystemSettings = lazy(() => import('./SystemSettings'));

// Import from pricing system (separate module)
const PricingSettings = lazy(() => import('../pricing-system/pages/PricingSettings'));

// Loading component for Suspense
const PageLoader = () => (
  <div className="flex items-center justify-center h-96">
    <div className="h-8 w-8 animate-spin rounded-full border-4 border-purple-600 border-t-transparent" />
  </div>
);

// Wrap components with Suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<PageLoader />}>
    <Component />
  </Suspense>
);

// =============================================
// ADMIN PORTAL ROUTES
// =============================================

export const adminRoutes: RouteObject = {
  path: '/admin',
  element: <AdminPortalLayout />,
  children: [
    // Dashboard
    {
      index: true,
      element: withSuspense(AdminDashboard),
    },
    
    // Activity & Analytics
    {
      path: 'activity',
      element: withSuspense(AuditLogs), // Reuse audit logs as activity
    },
    {
      path: 'analytics',
      element: withSuspense(AdminDashboard), // TODO: Create dedicated analytics page
    },
    
    // Management
    {
      path: 'users',
      children: [
        {
          index: true,
          element: withSuspense(UserManagement),
        },
        {
          path: 'new',
          element: withSuspense(UserManagement), // Handle via dialog
        },
        {
          path: ':id',
          element: withSuspense(UserManagement), // Handle via dialog
        },
      ],
    },
    {
      path: 'tenants',
      children: [
        {
          index: true,
          element: withSuspense(TenantManagement),
        },
        {
          path: 'new',
          element: withSuspense(TenantManagement),
        },
        {
          path: ':id',
          element: withSuspense(TenantManagement),
        },
      ],
    },
    {
      path: 'subscriptions',
      element: withSuspense(PricingSettings),
    },
    {
      path: 'integrations',
      children: [
        {
          index: true,
          element: withSuspense(IntegrationManagement),
        },
        {
          path: ':id',
          element: withSuspense(IntegrationManagement),
        },
      ],
    },
    
    // System
    {
      path: 'settings',
      element: withSuspense(SystemSettings),
    },
    {
      path: 'security',
      element: withSuspense(SystemSettings), // Tab within system settings
    },
    {
      path: 'emails',
      element: <div className="p-6">Email Templates - Coming Soon</div>,
    },
    {
      path: 'logs',
      element: withSuspense(AuditLogs),
    },
    {
      path: 'database',
      element: <div className="p-6">Database Management - Coming Soon</div>,
    },
    
    // Catch-all redirect
    {
      path: '*',
      element: <Navigate to="/admin" replace />,
    },
  ],
};

// =============================================
// USAGE EXAMPLE
// =============================================

/*
// In your main App.tsx or router configuration:

import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { adminRoutes } from './admin-portal/routes';

// Your other routes
const mainRoutes = [
  {
    path: '/',
    element: <MainLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'projects', element: <Projects /> },
      // ... other routes
    ],
  },
];

// Combine routes
const router = createBrowserRouter([
  ...mainRoutes,
  adminRoutes, // Add admin routes
]);

function App() {
  return <RouterProvider router={router} />;
}
*/

// =============================================
// NAVIGATION HELPER
// =============================================

export const adminNavigation = {
  dashboard: '/admin',
  activity: '/admin/activity',
  analytics: '/admin/analytics',
  users: '/admin/users',
  tenants: '/admin/tenants',
  subscriptions: '/admin/subscriptions',
  integrations: '/admin/integrations',
  settings: '/admin/settings',
  security: '/admin/security',
  emails: '/admin/emails',
  logs: '/admin/logs',
  database: '/admin/database',
};

// =============================================
// BREADCRUMB HELPER
// =============================================

interface Breadcrumb {
  label: string;
  labelNL: string;
  href: string;
}

export const getAdminBreadcrumbs = (pathname: string): Breadcrumb[] => {
  const breadcrumbs: Breadcrumb[] = [
    { label: 'Admin', labelNL: 'Admin', href: '/admin' },
  ];

  const segments = pathname.split('/').filter(Boolean);
  
  if (segments.length > 1) {
    const section = segments[1];
    
    const sectionLabels: Record<string, { en: string; nl: string }> = {
      users: { en: 'Users', nl: 'Gebruikers' },
      tenants: { en: 'Organizations', nl: 'Organisaties' },
      subscriptions: { en: 'Subscriptions', nl: 'Abonnementen' },
      integrations: { en: 'Integrations', nl: 'Integraties' },
      settings: { en: 'Settings', nl: 'Instellingen' },
      security: { en: 'Security', nl: 'Beveiliging' },
      emails: { en: 'Email Templates', nl: 'E-mail Templates' },
      logs: { en: 'Audit Logs', nl: 'Audit Logs' },
      database: { en: 'Database', nl: 'Database' },
      activity: { en: 'Activity', nl: 'Activiteit' },
      analytics: { en: 'Analytics', nl: 'Analyse' },
    };

    if (sectionLabels[section]) {
      breadcrumbs.push({
        label: sectionLabels[section].en,
        labelNL: sectionLabels[section].nl,
        href: `/admin/${section}`,
      });
    }
  }

  return breadcrumbs;
};

export default adminRoutes;
