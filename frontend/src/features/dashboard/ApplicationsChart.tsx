import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import type { WeeklyStat } from './useDashboardStats';

const CustomTooltip = ({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: Array<{ value: number; name: string; color: string }>;
  label?: string;
}) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="glass-panel rounded-xl px-4 py-3 shadow-lg text-sm">
      <p className="font-semibold text-zinc-700 dark:text-zinc-300 mb-2">{label}</p>
      {payload.map((entry) => (
        <p key={entry.name} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full inline-block"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-zinc-500 dark:text-zinc-400 capitalize">{entry.name}:</span>
          <span className="font-semibold text-zinc-800 dark:text-zinc-200">{entry.value}</span>
        </p>
      ))}
    </div>
  );
};

interface ApplicationsChartProps {
  data: WeeklyStat[];
}

const ApplicationsChart: React.FC<ApplicationsChartProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3, ease: 'easeOut' }}
      className="metric-card col-span-2"
      style={{ borderTop: '3px solid #8b5cf6' }}
    >
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
        Application Activity
      </h3>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">
        Applications sent vs. interviews secured — last 8 weeks
      </p>

      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data} margin={{ top: 5, right: 10, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="gradApplied" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="gradInterviews" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.25} />
              <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(113,113,122,0.15)" />
          <XAxis
            dataKey="week"
            tick={{ fontSize: 11, fill: '#a1a1aa' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#a1a1aa' }}
            axisLine={false}
            tickLine={false}
            allowDecimals={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area
            type="monotone"
            dataKey="applied"
            stroke="#8b5cf6"
            strokeWidth={2.5}
            fill="url(#gradApplied)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
          <Area
            type="monotone"
            dataKey="interviews"
            stroke="#06b6d4"
            strokeWidth={2.5}
            fill="url(#gradInterviews)"
            dot={false}
            activeDot={{ r: 5, strokeWidth: 0 }}
          />
        </AreaChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="flex items-center gap-5 mt-3">
        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="w-3 h-0.5 bg-brand-500 rounded-full inline-block" /> Applications Sent
        </span>
        <span className="flex items-center gap-1.5 text-xs text-zinc-500">
          <span className="w-3 h-0.5 bg-cyan-500 rounded-full inline-block" /> Interviews
        </span>
      </div>
    </motion.div>
  );
};

export default ApplicationsChart;
