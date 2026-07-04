import React from 'react';
import { motion } from 'framer-motion';

interface MetricCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  /** Tailwind-compatible CSS color string for the accent ring & icon bg */
  accentColor: string;
  /** Optional: +5 this week style sub-label */
  trend?: string;
  delay?: number;
}

/**
 * MetricCard — animated KPI card on the dashboard.
 *
 * Design choices:
 * - Uses the `.metric-card` CSS class defined in index.css for glass effect.
 * - Framer Motion stagger entrance: each card slides up with an incrementing delay.
 * - The icon sits inside a tinted circle whose color is driven by the `accentColor` prop.
 * - The accent colour also paints the top-edge border for visual variety.
 */
const MetricCard: React.FC<MetricCardProps> = ({
  label,
  value,
  icon,
  accentColor,
  trend,
  delay = 0,
}) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay, ease: 'easeOut' }}
      className="metric-card"
      style={{ borderTop: `3px solid ${accentColor}` }}
    >
      {/* Top row: icon + value */}
      <div className="flex items-start justify-between">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center"
          style={{ backgroundColor: `${accentColor}20` }}
        >
          <span style={{ color: accentColor }}>{icon}</span>
        </div>
        <motion.span
          className="text-3xl font-bold text-zinc-900 dark:text-white"
          initial={{ scale: 0.8 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.15, type: 'spring', stiffness: 200 }}
        >
          {value}
        </motion.span>
      </div>

      {/* Label + trend */}
      <div className="mt-4">
        <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">{label}</p>
        {trend && (
          <p className="text-xs mt-0.5 text-emerald-600 dark:text-emerald-400 font-medium">
            {trend}
          </p>
        )}
      </div>
    </motion.div>
  );
};

export default MetricCard;
