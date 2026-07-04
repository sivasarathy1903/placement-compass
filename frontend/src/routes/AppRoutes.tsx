import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';

// Layouts
import AuthLayout from '../layouts/AuthLayout';
import DashboardLayout from '../layouts/DashboardLayout';

// Auth pages
import Login from '../features/auth/Login';
import Register from '../features/auth/Register';
import ForgotPassword from '../features/auth/ForgotPassword';
import ResetPassword from '../features/auth/ResetPassword';

// Protected pages
import Dashboard from '../features/dashboard/Dashboard';
import Applications from '../features/applications/Applications';
import InterviewTimeline from '../features/interviews/InterviewTimeline';
import ResumeManager from '../features/resumes/ResumeManager';
import CalendarView from '../features/calendar/CalendarView';
import AnalyticsDashboard from '../features/analytics/AnalyticsDashboard';

// Route guard
import ProtectedRoute from '../components/ProtectedRoute';

/**
 * AppRoutes — the top-level route declaration.
 *
 * Structure:
 *   /                    → redirects to /dashboard
 *   /login               → Login page (inside AuthLayout)
 *   /register            → Register page (inside AuthLayout)
 *   /forgot-password     → ForgotPassword page (inside AuthLayout)
 *   /reset-password      → ResetPassword page (inside AuthLayout)
 *   /dashboard           → Dashboard page (inside DashboardLayout, behind ProtectedRoute)
 *
 * Future protected routes (Phase 5+) are added as children of the
 * DashboardLayout route — the sidebar and header persist across navigation.
 */
const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* ── Public Auth Routes ── */}
      <Route element={<AuthLayout />}>
        <Route path="/login"           element={<Login />} />
        <Route path="/register"        element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password"  element={<ResetPassword />} />
      </Route>

      {/* ── Protected Routes (behind JWT guard) ── */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/dashboard"    element={<Dashboard />} />
          <Route path="/applications" element={<Applications />} />
          <Route path="/interviews"   element={<InterviewTimeline />} />
          <Route path="/resumes"       element={<ResumeManager />} />
          <Route path="/calendar"      element={<CalendarView />} />
          <Route path="/analytics"     element={<AnalyticsDashboard />} />
        </Route>
      </Route>

      {/* ── Wildcard Fallbacks ── */}
      <Route path="/"  element={<Navigate to="/dashboard" replace />} />
      <Route path="*"  element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
};

export default AppRoutes;
