import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Squares2X2Icon,
  BriefcaseIcon,
  CalendarDaysIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowRightStartOnRectangleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalendarIcon,
} from '@heroicons/react/24/outline';
import { useAuth } from '../context/AuthContext';

interface NavItem {
  label: string;
  to: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  { label: 'Dashboard',    to: '/dashboard',    icon: <Squares2X2Icon className="w-5 h-5" /> },
  { label: 'Applications', to: '/applications', icon: <BriefcaseIcon className="w-5 h-5" /> },
  { label: 'Interviews',   to: '/interviews',   icon: <CalendarDaysIcon className="w-5 h-5" /> },
  { label: 'Resumes',      to: '/resumes',      icon: <DocumentTextIcon className="w-5 h-5" /> },
  { label: 'Calendar',     to: '/calendar',     icon: <CalendarIcon className="w-5 h-5" /> },
  { label: 'Analytics',    to: '/analytics',    icon: <ChartBarIcon className="w-5 h-5" /> },
];

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <motion.aside
      animate={{ width: collapsed ? 72 : 240 }}
      transition={{ duration: 0.25, ease: 'easeInOut' }}
      className="relative flex flex-col h-screen bg-white dark:bg-zinc-900 border-r border-zinc-200 dark:border-zinc-800 shrink-0 overflow-hidden"
    >
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-5 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-brand-600 shrink-0">
          {/* Compass icon as SVG inline */}
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" />
          </svg>
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="text-sm font-bold text-zinc-900 dark:text-white tracking-tight leading-tight"
            >
              Placement<br/>Compass
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1 flex flex-col gap-1 p-3 overflow-y-auto">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === '/dashboard'}
            className={({ isActive }) =>
              `sidebar-link ${isActive ? 'active' : ''}`
            }
            title={collapsed ? item.label : undefined}
          >
            <span className="shrink-0">{item.icon}</span>
            <AnimatePresence>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.1 }}
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
          </NavLink>
        ))}
      </nav>

      {/* Logout */}
      <div className="p-3 border-t border-zinc-100 dark:border-zinc-800">
        <button
          onClick={handleLogout}
          title={collapsed ? 'Logout' : undefined}
          className="sidebar-link w-full hover:!bg-red-50 hover:!text-red-600 dark:hover:!bg-red-950 dark:hover:!text-red-400 transition-colors"
        >
          <span className="shrink-0">
            <ArrowRightStartOnRectangleIcon className="w-5 h-5" />
          </span>
          <AnimatePresence>
            {!collapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
              >
                Logout
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      </div>

      {/* Collapse Toggle Button */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="absolute top-[74px] -right-3 z-10 w-6 h-6 flex items-center justify-center rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 shadow-sm text-zinc-400 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
        aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
      >
        {collapsed
          ? <ChevronRightIcon className="w-3 h-3" />
          : <ChevronLeftIcon className="w-3 h-3" />
        }
      </button>
    </motion.aside>
  );
};

export default Sidebar;
