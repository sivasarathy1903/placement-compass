import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { motion } from 'framer-motion';
import type { ApplicationSummary } from '../applications/applicationService';
import { STATUS_COLORS } from '../applications/types';

interface StatusDonutProps {
  summary: ApplicationSummary;
}

const STATUS_SEGMENTS = [
  { key: 'applied'   as const, name: 'Applied',   color: STATUS_COLORS.APPLIED.dot   },
  { key: 'oa'        as const, name: 'OA',         color: STATUS_COLORS.OA.dot         },
  { key: 'interview' as const, name: 'Interview',  color: STATUS_COLORS.INTERVIEW.dot  },
  { key: 'offer'     as const, name: 'Offer',      color: STATUS_COLORS.OFFER.dot      },
  { key: 'rejected'  as const, name: 'Rejected',   color: STATUS_COLORS.REJECTED.dot   },
  { key: 'withdrawn' as const, name: 'Withdrawn',  color: STATUS_COLORS.WITHDRAWN.dot  },
] as const;

type SegmentKey = (typeof STATUS_SEGMENTS)[number]['key'];

const makeTooltip = (total: number) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const TooltipContent = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const { name, value, payload: data } = payload[0];
    const pct = total > 0 ? ((value / total) * 100).toFixed(1) : '0.0';
    return (
      <div className="glass-panel rounded-xl px-4 py-2.5 shadow-lg text-sm">
        <span
          className="inline-block w-2 h-2 rounded-full mr-2"
          style={{ backgroundColor: data.color }}
        />
        <span className="font-semibold text-zinc-800 dark:text-zinc-200">{name}</span>
        <span className="ml-2 text-zinc-500">{value} ({pct}%)</span>
      </div>
    );
  };
  TooltipContent.displayName = 'StatusTooltip';
  return TooltipContent;
};

const StatusDonut: React.FC<StatusDonutProps> = ({ summary }) => {
  const chartData = STATUS_SEGMENTS.map(seg => ({
    name:  seg.name,
    value: summary[seg.key as SegmentKey] as number,
    color: seg.color,
  })).filter(d => d.value > 0);

  const total = Number(summary.totalApplications);
  const TooltipContent = makeTooltip(total);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.4, ease: 'easeOut' }}
      className="metric-card"
      style={{ borderTop: '3px solid #10b981' }}
    >
      <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
        Status Breakdown
      </h3>
      <p className="text-xs text-zinc-400 dark:text-zinc-500 mb-4">
        {total} total application{total !== 1 ? 's' : ''}
      </p>

      <div className="relative">
        <ResponsiveContainer width="100%" height={180}>
          <PieChart>
            <Pie
              data={chartData.length > 0 ? chartData : [{ name: 'None', value: 1, color: '#e4e4e7' }]}
              cx="50%"
              cy="50%"
              innerRadius={52}
              outerRadius={78}
              paddingAngle={3}
              dataKey="value"
              strokeWidth={0}
            >
              {(chartData.length > 0 ? chartData : [{ name: 'None', value: 1, color: '#e4e4e7' }]).map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            {chartData.length > 0 && (
              <Tooltip content={<TooltipContent />} />
            )}
          </PieChart>
        </ResponsiveContainer>

        {/* Center label */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-2xl font-bold text-zinc-900 dark:text-white">{total}</span>
          <span className="text-xs text-zinc-400">Total</span>
        </div>
      </div>

      {/* Legend */}
      <ul className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {STATUS_SEGMENTS.map((seg) => (
          <li key={seg.key} className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
            <span
              className="w-2 h-2 rounded-full shrink-0"
              style={{ backgroundColor: seg.color }}
            />
            {seg.name}
            <span className="ml-auto font-medium text-zinc-700 dark:text-zinc-300">
              {Number(summary[seg.key as SegmentKey])}
            </span>
          </li>
        ))}
      </ul>
    </motion.div>
  );
};

export default StatusDonut;
