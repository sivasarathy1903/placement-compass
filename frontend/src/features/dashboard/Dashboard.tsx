import React from 'react';
import MetricCard from './MetricCard';
import ApplicationsChart from './ApplicationsChart';
import StatusDonut from './StatusDonut';
import RecentActivity from './RecentActivity';
import { useDashboardStats } from './useDashboardStats';
import {
  BriefcaseIcon,
  CheckCircleIcon,
  ClockIcon,
  TrophyIcon,
  XCircleIcon,
} from '@heroicons/react/24/outline';

/**
 * Dashboard — the landing page after login.
 *
 * Layout (CSS Grid):
 *   Row 1: 5 metric cards (auto-fit minmax)
 *   Row 2: ApplicationsChart (2/3 width) | StatusDonut (1/3 width)
 *   Row 3: RecentActivity (full width)
 *
 * Data strategy:
 *   All data is fetched live via useDashboardStats which calls:
 *     - GET /api/applications/summary  → metric card counts
 *     - GET /api/applications?size=6&sortBy=updatedAt&direction=desc → recent activity
 *     - GET /api/applications?size=1000 → weekly chart aggregation (client-side)
 */

const Dashboard: React.FC = () => {
  const { data, loading } = useDashboardStats();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-brand-600" />
      </div>
    );
  }

  // Safely extract summary values (default 0 if data is null)
  const summary = data?.summary ?? {
    totalApplications: 0,
    applied: 0,
    oa: 0,
    interview: 0,
    offer: 0,
    rejected: 0,
    withdrawn: 0,
  };

  const metrics = [
    {
      label: 'Applied',
      value: Number(summary.applied),
      accentColor: '#8b5cf6',
      icon: <BriefcaseIcon className="w-5 h-5" />,
      delay: 0,
    },
    {
      label: 'Online Assessments',
      value: Number(summary.oa),
      accentColor: '#06b6d4',
      icon: <ClockIcon className="w-5 h-5" />,
      delay: 0.05,
    },
    {
      label: 'Interviews',
      value: Number(summary.interview),
      accentColor: '#f59e0b',
      icon: <CheckCircleIcon className="w-5 h-5" />,
      delay: 0.1,
    },
    {
      label: 'Offers',
      value: Number(summary.offer),
      accentColor: '#10b981',
      icon: <TrophyIcon className="w-5 h-5" />,
      trend: summary.offer > 0 ? '🎉 Keep going!' : undefined,
      delay: 0.15,
    },
    {
      label: 'Rejected',
      value: Number(summary.rejected),
      accentColor: '#f43f5e',
      icon: <XCircleIcon className="w-5 h-5" />,
      delay: 0.2,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Page Heading */}
      <div>
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Overview</h2>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">
          Your placement journey at a glance.
        </p>
      </div>

      {/* ── Row 1: Metric Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {metrics.map((m) => (
          <MetricCard
            key={m.label}
            label={m.label}
            value={m.value}
            icon={m.icon}
            accentColor={m.accentColor}
            trend={m.trend}
            delay={m.delay}
          />
        ))}
      </div>

      {/* ── Row 2: Area Chart + Donut ── */}
      <div className="grid grid-cols-3 gap-4">
        {/* ApplicationsChart spans 2/3 of the row */}
        <ApplicationsChart data={data?.weeklyStats ?? []} />
        {/* StatusDonut occupies the last 1/3 */}
        <StatusDonut summary={summary} />
      </div>

      {/* ── Row 3: Recent Activity (full width) ── */}
      <div className="grid grid-cols-3 gap-4">
        <RecentActivity activities={data?.recentActivity ?? []} />
      </div>
    </div>
  );
};

export default Dashboard;
