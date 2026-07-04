import React, { useState, useEffect, useRef } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { SunIcon, MoonIcon, BellIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';
import { applicationService } from '../features/applications/applicationService';
import toast from 'react-hot-toast';

/**
 * DashboardLayout — the persistent shell wrapping all protected feature pages.
 *
 * Structure:
 *   <aside>  Sidebar (animated, collapsible)
 *   <main>
 *     <header>  Top bar: page title, theme toggle, notifications, avatar
 *     <section> Page content via <Outlet />
 *
 * Why Outlet?
 * React Router renders child routes inside the Outlet placeholder. This means
 * every protected page (Dashboard, Applications, etc.) will be rendered here
 * without re-mounting the Sidebar or Header.
 */
const DashboardLayout: React.FC = () => {
  const [dark, setDark] = useState(() =>
    document.documentElement.classList.contains('dark')
  );
  const { user } = useAuth();
  const hasNotified = useRef(false);

  useEffect(() => {
    if (!hasNotified.current) {
      hasNotified.current = true;
      applicationService.getAll({ size: 100 })
        .then(pages => {
          const now = new Date();
          const threeDaysFromNow = new Date();
          threeDaysFromNow.setDate(now.getDate() + 3);

          let upcomingCount = 0;
          pages.content.forEach(app => {
            if (app.nextActionDate) {
              const deadline = new Date(app.nextActionDate);
              // if deadline is in the future but less than 3 days away
              if (deadline >= now && deadline <= threeDaysFromNow) {
                upcomingCount++;
                setTimeout(() => {
                  toast(`Upcoming Deadline: ${app.companyName} - ${app.role}`, {
                    icon: '📅',
                    duration: 5000,
                  });
                }, upcomingCount * 1000); // Stagger toasts so they don't overlap immediately
              }
            }
          });
        })
        .catch(console.error);
    }
  }, []);

  const toggleTheme = () => {
    if (dark) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
    setDark(!dark);
  };

  // Extract initials for avatar
  const initials = user?.email?.slice(0, 2).toUpperCase() ?? 'PC';

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-zinc-950 overflow-hidden">
      {/* ── Sidebar ── */}
      <Sidebar />

      {/* ── Main Column ── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Top Header Bar */}
        <header className="flex items-center justify-between px-6 py-4 bg-white dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 shrink-0">
          <div>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Welcome back 👋</p>
            <h1 className="text-base font-semibold text-zinc-900 dark:text-white">
              {user?.email ?? 'Student'}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            {/* Notification bell */}
            <button className="relative p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition">
              <BellIcon className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full" />
            </button>

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition"
              aria-label="Toggle theme"
            >
              {dark ? <SunIcon className="w-5 h-5" /> : <MoonIcon className="w-5 h-5" />}
            </button>

            {/* User avatar */}
            <div className="w-8 h-8 rounded-full bg-brand-600 flex items-center justify-center text-white text-xs font-bold">
              {initials}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
