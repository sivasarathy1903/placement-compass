import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import type { Application } from '../applications/applicationService';
import { STATUS_COLORS, STATUS_LABELS } from '../applications/types';
import type { ApplicationStatus } from '../applications/types';

interface RecentActivityProps {
  activities: Application[];
}

/**
 * Returns a relative time string like "2h ago", "3d ago", "just now".
 */
function relativeTime(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diffMs = now - then;

  const seconds = Math.floor(diffMs / 1000);
  if (seconds < 60) return 'just now';

  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;

  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;

  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}

const LOGO_COLORS = ['#8b5cf6', '#06b6d4', '#f59e0b', '#f43f5e', '#10b981', '#3b82f6'];

const RecentActivity: React.FC<RecentActivityProps> = ({ activities }) => {
  const navigate = useNavigate();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.5, ease: 'easeOut' }}
      className="metric-card col-span-3"
      style={{ borderTop: '3px solid #06b6d4' }}
    >
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
            Recent Activity
          </h3>
          <p className="text-xs text-zinc-400 dark:text-zinc-500">
            Latest application updates
          </p>
        </div>
        <button
          className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:underline"
          onClick={() => navigate('/applications')}
        >
          View all →
        </button>
      </div>

      {activities.length === 0 ? (
        <div className="py-8 text-center text-sm text-zinc-400 dark:text-zinc-500">
          No applications yet. Start tracking your journey!
        </div>
      ) : (
        <div className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {activities.map((item, i) => {
            const initials = item.companyName
              .split(' ')
              .map(w => w[0])
              .join('')
              .toUpperCase()
              .slice(0, 2);

            const statusKey = item.status as ApplicationStatus;
            const statusLabel = STATUS_LABELS[statusKey] ?? item.status;
            const statusColor = STATUS_COLORS[statusKey]?.badge ?? 'text-zinc-500 bg-zinc-100';
            const logoColor = LOGO_COLORS[i % LOGO_COLORS.length];
            const timeAgo = relativeTime(item.updatedAt);

            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + i * 0.05 }}
                className="flex items-center gap-4 py-3 group"
              >
                {/* Company Logo */}
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-sm font-bold shrink-0"
                  style={{ backgroundColor: logoColor }}
                >
                  {initials}
                </div>

                {/* Role & Company */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                    {item.role}
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 truncate">
                    {item.companyName}
                  </p>
                </div>

                {/* Status Badge */}
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor}`}>
                  {statusLabel}
                </span>

                {/* Time */}
                <span className="text-xs text-zinc-400 dark:text-zinc-500 shrink-0 w-14 text-right">
                  {timeAgo}
                </span>
              </motion.div>
            );
          })}
        </div>
      )}
    </motion.div>
  );
};

export default RecentActivity;
