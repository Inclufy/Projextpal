// ============================================
// ADD THIS TO AppSidebar.tsx
// ============================================

// 1. Add import at the top of the file:
import { GraduationCap } from "lucide-react";

// 2. Find the admin menu items section and add this item:

// Look for something like this in your AppSidebar.tsx:
// const adminMenuItems = [ ... ]
// OR in the sidebar menu for admin users

// Add this menu item for Training Management:

{
  title: language === 'nl' ? 'Trainingen' : 'Trainings',
  url: '/admin/training',
  icon: GraduationCap,
}

// ============================================
// FULL EXAMPLE - Admin Menu Section
// ============================================

/*
If you have an admin section in the sidebar, it should look something like this:

// Admin Menu Items (only visible to admins)
const adminMenuItems = [
  {
    title: language === 'nl' ? 'Dashboard' : 'Dashboard',
    url: '/admin',
    icon: LayoutDashboard,
  },
  {
    title: language === 'nl' ? 'Gebruikers' : 'Users',
    url: '/admin/users',
    icon: Users,
  },
  {
    title: language === 'nl' ? 'Organisaties' : 'Organizations',
    url: '/admin/tenants',
    icon: Building2,
  },
  {
    title: language === 'nl' ? 'Trainingen' : 'Trainings',  // <-- ADD THIS
    url: '/admin/training',
    icon: GraduationCap,
  },
  {
    title: language === 'nl' ? 'Plannen' : 'Plans',
    url: '/admin/plans',
    icon: CreditCard,
  },
  {
    title: language === 'nl' ? 'Integraties' : 'Integrations',
    url: '/admin/integrations',
    icon: Plug,
  },
  {
    title: language === 'nl' ? 'Logs' : 'Logs',
    url: '/admin/logs',
    icon: FileText,
  },
];
*/


// ============================================
// ALSO ADD Academy to main sidebar menu
// ============================================

/*
In the main menu items array, add Academy:

const menuItems = [
  { title: t.sidebar.dashboard, url: "/dashboard", icon: LayoutDashboard },
  { title: t.sidebar.projects, url: "/projects", icon: FolderKanban },
  { title: t.sidebar.programs, url: "/programs", icon: Layers },
  { title: t.sidebar.aiAssistant, url: "/ai-assistant", icon: Bot },
  { title: t.sidebar.team, url: "/team", icon: Users },
  { title: t.sidebar.surveys, url: "/surveys", icon: ClipboardList },
  { title: t.sidebar.postProject, url: "/post-project", icon: FileSearch },
  { 
    title: language === 'nl' ? 'Academy' : 'Academy',  // <-- ADD THIS
    url: '/academy/marketplace', 
    icon: GraduationCap 
  },
];
*/


// ============================================
// ADD ROUTE FOR ADMIN TRAINING PAGE
// ============================================

/*
In App.tsx, add this route inside the Admin Portal Routes section:

// Inside the admin routes (after AdminPortalLayout):
<Route path="training" element={<AdminTrainingManagement />} />

So it becomes:
<Route path="/admin" element={<AdminPortalLayout />}>
  <Route index element={<AdminDashboard />} />
  <Route path="users" element={<UserManagement />} />
  <Route path="tenants" element={<TenantManagement />} />
  <Route path="training" element={<AdminTrainingManagement />} />  // <-- ADD THIS
  <Route path="integrations" element={<IntegrationManagement />} />
  <Route path="plans" element={<PlanManagement />} /> 
  <Route path="settings" element={<SystemSettings />} />
  <Route path="logs" element={<AuditLogs />} />
</Route>
*/


// ============================================
// ADD IMPORT FOR ADMIN TRAINING
// ============================================

/*
At the top of App.tsx, add:

import AdminTrainingManagement from './pages/admin/AdminTrainingManagement';

Or if you put it in admin-portal folder:
import AdminTrainingManagement from './pages/admin-portal/AdminTrainingManagement';
*/


// ============================================
// ADD ROUTE FOR COURSE LEARNING PLAYER
// ============================================

/*
In App.tsx, add these routes for the learning player:

import CourseLearningPlayer from "./pages/CourseLearningPlayer";

// Add routes:
<Route path="/academy/course/:id/learn" element={<CourseLearningPlayer />} />
<Route path="/academy/course/:id/learn/:lessonId" element={<CourseLearningPlayer />} />
*/
