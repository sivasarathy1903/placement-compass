import React, { useEffect, useState, useMemo } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { applicationService } from '../applications/applicationService';
import type { Application } from '../applications/applicationService';

// Custom Tooltip Component for Recharts to match our Tailwind theme
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 p-3 rounded-lg shadow-lg text-sm">
        <p className="font-semibold text-zinc-900 dark:text-white mb-1">{label || payload[0].name}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-zinc-600 dark:text-zinc-300">
            {entry.name === 'value' ? '' : `${entry.name}: `}
            <span className="font-bold" style={{ color: entry.color || entry.payload.fill }}>
              {entry.value}
            </span>
          </p>
        ))}
      </div>
    );
  }
  return null;
};

const AnalyticsDashboard: React.FC = () => {
  const [applications, setApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchApps = async () => {
      try {
        // Fetch up to 1000 applications for client-side aggregation
        const pages = await applicationService.getAll({ size: 1000 });
        setApplications(pages.content);
      } catch (error) {
        console.error('Failed to load applications for analytics:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchApps();
  }, []);

  // ── Data Processing ──

  // 1. Funnel Data
  const funnelData = useMemo(() => {
    let applied = 0;
    let oa = 0;
    let interview = 0;
    let offer = 0;

    applications.forEach(app => {
      // If an app reached OFFER, it implies it went through the funnel (in a simplified model)
      // Alternatively, we just count current status. A true funnel counts cumulative progression.
      // We will do a cumulative progression:
      const s = app.status;
      applied++; // everyone is applied
      if (s === 'OA' || s === 'INTERVIEW' || s === 'OFFER' || s === 'REJECTED') {
        // Did they at least get an OA or beyond?
        // Note: REJECTED could happen at any stage, so true funnel is tricky without state history.
        // We'll approximate: if they have rounds or OA status, they progressed.
      }
      
      // Let's use a simpler current-status + cumulative approach:
      if (s === 'OFFER') offer++;
      if (s === 'INTERVIEW' || s === 'OFFER' || (app.rounds && app.rounds.length > 0)) interview++;
      if (s === 'OA' || s === 'INTERVIEW' || s === 'OFFER' || (app.rounds && app.rounds.length > 0)) oa++;
    });

    return [
      { name: 'Applied', value: applied, fill: '#6366f1' }, // indigo-500
      { name: 'Assessments', value: oa, fill: '#0ea5e9' }, // sky-500
      { name: 'Interviews', value: interview, fill: '#8b5cf6' }, // violet-500
      { name: 'Offers', value: offer, fill: '#10b981' }, // emerald-500
    ];
  }, [applications]);

  // 2. Timeline Data (Applications per month)
  const timelineData = useMemo(() => {
    const months: Record<string, number> = {};
    
    // Initialize last 6 months to ensure chart looks good even if empty
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
      months[key] = 0;
    }

    applications.forEach(app => {
      if (app.applicationDate) {
        const d = new Date(app.applicationDate);
        const key = d.toLocaleString('en-US', { month: 'short', year: 'numeric' });
        if (months[key] !== undefined) {
          months[key]++;
        } else {
          months[key] = 1;
        }
      }
    });

    // Sort chronologically (rough sort based on object insertion order or explicit parse)
    // For simplicity, we just map it out. If older dates exist, they appear at the end unless sorted.
    return Object.entries(months).map(([name, Apps]) => ({ name, Apps }));
  }, [applications]);

  // 3. Outcomes Data
  const outcomesData = useMemo(() => {
    let offer = 0;
    let rejected = 0;
    let withdrawn = 0;
    
    applications.forEach(app => {
      if (app.status === 'OFFER') offer++;
      if (app.status === 'REJECTED') rejected++;
      if (app.status === 'WITHDRAWN') withdrawn++;
    });

    return [
      { name: 'Offers', value: offer, color: '#10b981' }, // emerald-500
      { name: 'Rejected', value: rejected, color: '#ef4444' }, // red-500
      { name: 'Withdrawn', value: withdrawn, color: '#71717a' }, // zinc-500
    ].filter(d => d.value > 0);
  }, [applications]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-zinc-50 dark:bg-zinc-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-brand-600"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-zinc-50 dark:bg-zinc-950 overflow-y-auto">
      <header className="px-8 py-6 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shrink-0">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-white">Analytics</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
          Visualize your job search progress and conversion rates.
        </p>
      </header>

      <main className="flex-1 p-6 sm:p-8">
        <div className="max-w-7xl mx-auto space-y-6 sm:space-y-8">
          
          {/* Top Row: Funnel & Outcomes */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
            
            {/* Funnel Chart */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-6">Application Funnel</h2>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={funnelData} layout="vertical" margin={{ top: 0, right: 30, left: 20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#3f3f46" opacity={0.2} />
                    <XAxis type="number" hide />
                    <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} className="text-xs font-medium fill-zinc-600 dark:fill-zinc-400" />
                    <Tooltip cursor={{ fill: 'rgba(0,0,0,0.05)' }} content={<CustomTooltip />} />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={32}>
                      {funnelData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Outcomes Donut Chart */}
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
              <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-6">Resolution Outcomes</h2>
              <div className="h-72">
                {outcomesData.length === 0 ? (
                  <div className="h-full flex items-center justify-center text-sm text-zinc-500">
                    No resolved applications yet.
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={outcomesData}
                        innerRadius={60}
                        outerRadius={100}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {outcomesData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </div>
              {/* Custom Legend */}
              <div className="flex justify-center gap-6 mt-4">
                {outcomesData.map((entry, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                    <span className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
                      {entry.name} ({entry.value})
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Row: Timeline Chart */}
          <div className="bg-white dark:bg-zinc-900 p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 shadow-sm">
            <h2 className="text-base font-semibold text-zinc-900 dark:text-white mb-6">Application Volume Over Time</h2>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorApps" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#3f3f46" opacity={0.2} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} className="text-xs fill-zinc-500" dy={10} />
                  <YAxis axisLine={false} tickLine={false} className="text-xs fill-zinc-500" />
                  <Tooltip content={<CustomTooltip />} />
                  <Area type="monotone" dataKey="Apps" stroke="#4f46e5" strokeWidth={3} fillOpacity={1} fill="url(#colorApps)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default AnalyticsDashboard;
