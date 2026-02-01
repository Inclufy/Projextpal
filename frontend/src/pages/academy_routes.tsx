// ============================================
// ADD THESE IMPORTS TO App.tsx
// ============================================

// Academy Pages
import TrainingMarketplace from "./pages/TrainingMarketplace";
import CourseDetail from "./pages/CourseDetail";
import CourseCheckout from "./pages/CourseCheckout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import RequestQuote from "./pages/RequestQuote";

// Admin Pages (add to existing admin routes)
import AdminTrainingManagement from "./pages/admin/AdminTrainingManagement";


// ============================================
// ADD THESE ROUTES TO App.tsx <Routes>
// ============================================

{/* Academy Public Routes */}
<Route path="/academy/marketplace" element={<TrainingMarketplace />} />
<Route path="/academy/course/:id" element={<CourseDetail />} />
<Route path="/academy/checkout/:id" element={<CourseCheckout />} />
<Route path="/academy/checkout/success" element={<CheckoutSuccess />} />
<Route path="/academy/quote/:id" element={<RequestQuote />} />
<Route path="/academy/quote" element={<RequestQuote />} />

{/* Admin Training Routes - add inside ProtectedRoute for admin */}
<Route path="/admin/training" element={<AdminTrainingManagement />} />


// ============================================
// COMPLETE EXAMPLE App.tsx STRUCTURE
// ============================================

/*
import { Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/toaster";

// ... other imports ...

// Academy
import TrainingMarketplace from "./pages/TrainingMarketplace";
import CourseDetail from "./pages/CourseDetail";
import CourseCheckout from "./pages/CourseCheckout";
import CheckoutSuccess from "./pages/CheckoutSuccess";
import RequestQuote from "./pages/RequestQuote";
import AdminTrainingManagement from "./pages/admin/AdminTrainingManagement";

function App() {
  return (
    <>
      <Routes>
        {/* Public Routes *}
        <Route path="/" element={<Navigate to="/landing" />} />
        <Route path="/landing" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        
        {/* Academy Public Routes *}
        <Route path="/academy/marketplace" element={<TrainingMarketplace />} />
        <Route path="/academy/course/:id" element={<CourseDetail />} />
        <Route path="/academy/checkout/:id" element={<CourseCheckout />} />
        <Route path="/academy/checkout/success" element={<CheckoutSuccess />} />
        <Route path="/academy/quote/:id" element={<RequestQuote />} />
        <Route path="/academy/quote" element={<RequestQuote />} />
        
        {/* Protected Routes *}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          {/* ... other protected routes ... *}
          
          {/* Admin Routes *}
          <Route element={<AdminRoute />}>
            <Route path="/admin/training" element={<AdminTrainingManagement />} />
            {/* ... other admin routes ... *}
          </Route>
        </Route>
      </Routes>
      <Toaster />
    </>
  );
}

export default App;
*/


// ============================================
// ALSO UPDATE AppSidebar.tsx - Add Academy to Admin Menu
// ============================================

/*
In AppSidebar.tsx, add this to the admin menu items:

const adminMenuItems = [
  // ... existing items ...
  {
    title: language === 'nl' ? 'Trainingen' : 'Trainings',
    url: '/admin/training',
    icon: GraduationCap,
  },
];
*/
