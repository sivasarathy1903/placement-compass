import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AuthLayout: React.FC = () => {
  const { isAuthenticated } = useAuth();

  // If already authenticated, skip authentication views and redirect directly to dashboard
  if (isAuthenticated) {
    return <Navigate to="/dashboard" replace />;
  }

  return (
    <div className="relative flex min-h-screen flex-col justify-center overflow-hidden bg-zinc-50 dark:bg-zinc-950 px-6 py-12 transition-colors duration-300">
      {/* Background ambient light effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-brand-100/20 via-transparent to-transparent dark:from-brand-950/20 pointer-events-none" />
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      <div className="relative mx-auto w-full max-w-[420px]">
        {/* Branding header */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-zinc-900 dark:bg-white text-white dark:text-zinc-950 font-bold text-xl shadow-premium dark:shadow-dark-premium">
            🧭
          </div>
          <h1 className="mt-4 text-xl font-semibold tracking-tight text-zinc-900 dark:text-white">
            Placement Compass
          </h1>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400">
            Track Every Application. Never Miss an Opportunity.
          </p>
        </div>

        {/* Central visual card hosting the form */}
        <div className="glass-panel rounded-2xl shadow-premium dark:shadow-dark-premium px-8 py-10 transition-all duration-300">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default AuthLayout;
