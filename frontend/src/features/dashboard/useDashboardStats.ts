import { useState, useEffect, useCallback } from 'react';
import toast from 'react-hot-toast';
import { applicationService, type Application, type ApplicationSummary } from '../applications/applicationService';

export interface WeeklyStat {
  week: string;
  applied: number;
  interviews: number;
}

export interface DashboardData {
  summary: ApplicationSummary;
  recentActivity: Application[];
  weeklyStats: WeeklyStat[];
}

export const useDashboardStats = () => {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [summary, recentPage, allPage] = await Promise.all([
        applicationService.getSummary(),
        applicationService.getAll({ page: 0, size: 6, sortBy: 'updatedAt', direction: 'desc' }),
        applicationService.getAll({ size: 1000 }),
      ]);

      // Calculate weekly statistics for the last 8 weeks based on all user applications
      const today = new Date();
      today.setHours(23, 59, 59, 999);

      const chartBuckets = Array.from({ length: 8 }, (_, i) => {
        const weeksAgo = 7 - i;
        const endDate = new Date(today.getTime() - weeksAgo * 7 * 24 * 60 * 60 * 1000);
        const startDate = new Date(today.getTime() - (weeksAgo + 1) * 7 * 24 * 60 * 60 * 1000);
        
        return {
          label: `Week ${i + 1}`,
          startDate,
          endDate,
          applied: 0,
          interviews: 0,
        };
      });

      const applications = allPage.content;
      applications.forEach(app => {
        // Count applications sent in each week
        if (app.applicationDate) {
          const appDate = new Date(app.applicationDate);
          const t = appDate.getTime();
          for (const bucket of chartBuckets) {
            if (t > bucket.startDate.getTime() && t <= bucket.endDate.getTime()) {
              bucket.applied++;
              break;
            }
          }
        }

        // Count interviews scheduled in each week
        if (app.rounds && app.rounds.length > 0) {
          app.rounds.forEach(round => {
            if (round.scheduledAt) {
              const roundDate = new Date(round.scheduledAt);
              const t = roundDate.getTime();
              for (const bucket of chartBuckets) {
                if (t > bucket.startDate.getTime() && t <= bucket.endDate.getTime()) {
                  bucket.interviews++;
                  break;
                }
              }
            }
          });
        }
      });

      const weeklyStats: WeeklyStat[] = chartBuckets.map(b => ({
        week: b.label,
        applied: b.applied,
        interviews: b.interviews,
      }));

      setData({
        summary,
        recentActivity: recentPage.content,
        weeklyStats,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard stats.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  return {
    data,
    loading,
    refresh: fetchDashboardData,
  };
};
