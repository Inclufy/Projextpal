// ============================================
// ADMIN PORTAL - TRAININGEN TAB INTEGRATION
// ============================================
// Add this to your Admin Portal routing/sidebar
//
// INSTALLATIE:
// 1. Kopieer AdminTrainingContent.tsx naar frontend/src/pages/admin/
// 2. Kopieer LessonViewer.tsx naar frontend/src/components/
// 3. Voeg de route toe aan je admin routes
// 4. Update de sidebar navigatie
// ============================================

// ============================================
// ROUTES (add to your admin router)
// ============================================
/*
import AdminTrainingContent from '@/pages/admin/AdminTrainingContent';

// In your routes array:
{
  path: '/admin/trainingen/content',
  element: <AdminTrainingContent />,
},
*/

// ============================================
// SIDEBAR NAVIGATION ITEMS
// ============================================
export const adminSidebarItems = [
  // ... existing items
  {
    section: 'BEHEER',
    items: [
      { 
        icon: 'Users', 
        label: 'Gebruikers', 
        path: '/admin/gebruikers' 
      },
      { 
        icon: 'Building2', 
        label: 'Organisaties', 
        path: '/admin/organisaties' 
      },
      { 
        icon: 'Puzzle', 
        label: 'Integraties', 
        path: '/admin/integraties' 
      },
      { 
        icon: 'CreditCard', 
        label: 'Abonnementen', 
        path: '/admin/abonnementen' 
      },
      // NEW: Training management with sub-items
      { 
        icon: 'GraduationCap', 
        label: 'Trainingen', 
        path: '/admin/trainingen',
        isActive: true, // Highlight as current
        subItems: [
          {
            label: 'Cursussen',
            path: '/admin/trainingen',
            badge: null,
          },
          {
            label: 'Inschrijvingen',
            path: '/admin/trainingen/inschrijvingen',
            badge: null,
          },
          {
            label: 'Offertes',
            path: '/admin/trainingen/offertes',
            badge: '1', // New quote request
          },
          {
            label: 'Content Beheer',
            path: '/admin/trainingen/content',
            badge: 'NEW',
          },
          {
            label: 'Analytics',
            path: '/admin/trainingen/analytics',
            badge: null,
          },
        ],
      },
      { 
        icon: 'Receipt', 
        label: 'Facturen', 
        path: '/admin/facturen' 
      },
    ],
  },
  {
    section: 'SYSTEEM',
    items: [
      { 
        icon: 'Settings', 
        label: 'Instellingen', 
        path: '/admin/instellingen' 
      },
    ],
  },
];

// ============================================
// TRAINING TAB COMPONENT (for existing Training Beheer page)
// ============================================
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  BookOpen, Users, FileText, BarChart3, Edit3 
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

interface TrainingTab {
  id: string;
  label: string;
  icon: typeof BookOpen;
  path: string;
  badge?: string;
}

const trainingTabs: TrainingTab[] = [
  { id: 'courses', label: 'Cursussen', icon: BookOpen, path: '/admin/trainingen' },
  { id: 'enrollments', label: 'Inschrijvingen', icon: Users, path: '/admin/trainingen/inschrijvingen' },
  { id: 'quotes', label: 'Offertes', icon: FileText, path: '/admin/trainingen/offertes', badge: '1' },
  { id: 'content', label: 'Content Beheer', icon: Edit3, path: '/admin/trainingen/content' },
  { id: 'analytics', label: 'Analytics', icon: BarChart3, path: '/admin/trainingen/analytics' },
];

export const TrainingTabNavigation = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const activeTab = trainingTabs.find(tab => location.pathname === tab.path)?.id || 'courses';

  return (
    <div className="flex items-center gap-1 border-b border-gray-200 dark:border-gray-700">
      {trainingTabs.map(tab => (
        <button
          key={tab.id}
          onClick={() => navigate(tab.path)}
          className={cn(
            'flex items-center gap-2 px-4 py-3 text-sm font-medium transition-all border-b-2 -mb-px',
            activeTab === tab.id
              ? 'text-purple-600 dark:text-purple-400 border-purple-500 bg-purple-50/50 dark:bg-purple-900/20'
              : 'text-gray-500 border-transparent hover:text-gray-700 dark:hover:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800/50'
          )}
        >
          <tab.icon className="h-4 w-4" />
          {tab.label}
          {tab.badge && (
            <Badge 
              variant={tab.badge === 'NEW' ? 'default' : 'secondary'}
              className={cn(
                'text-xs',
                tab.badge === 'NEW' && 'bg-green-500 text-white'
              )}
            >
              {tab.badge}
            </Badge>
          )}
        </button>
      ))}
    </div>
  );
};

// ============================================
// USAGE IN TRAINING BEHEER PAGE
// ============================================
/*
import { TrainingTabNavigation } from './adminNavigation';

const TrainingBeheer = () => {
  return (
    <div className="flex flex-col h-full">
      <header className="p-6 border-b">
        <h1 className="text-2xl font-bold">🎓 Training Beheer</h1>
        <p className="text-gray-500">Beheer cursussen, inschrijvingen en offerteaanvragen</p>
      </header>
      
      {/* Tab Navigation *}
      <TrainingTabNavigation />
      
      {/* Tab Content - use React Router Outlet or conditional rendering *}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
    </div>
  );
};
*/

export default adminSidebarItems;
